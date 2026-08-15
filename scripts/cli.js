#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import YAML from 'yaml';

const ANDROID_MAX_VERSION_CODE = 2_100_000_000;
const VERSION_LIMITS = {
  major: 9,
  minor: 9,
  patch: 9
};

export function parseVersion(version) {
  const match = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.exec(version);
  if (!match) {
    throw new Error(`Versión inválida: ${version}. Usa el formato X.Y.Z sin sufijos.`);
  }

  const [, major, minor, patch] = match.map(Number);
  if (major > VERSION_LIMITS.major || minor > VERSION_LIMITS.minor || patch > VERSION_LIMITS.patch) {
    throw new Error(
      `Versión fuera de rango: major <= ${VERSION_LIMITS.major}, minor <= ${VERSION_LIMITS.minor}, patch <= ${VERSION_LIMITS.patch}.`
    );
  }

  return { major, minor, patch };
}

export function incrementVersion(version, type) {
  const parts = parseVersion(version);
  let nextVersion;

  if (type === 'major') {
    nextVersion = `${parts.major + 1}.0.0`;
  } else if (type === 'minor') {
    nextVersion = `${parts.major}.${parts.minor + 1}.0`;
  } else if (type === 'patch') {
    nextVersion = `${parts.major}.${parts.minor}.${parts.patch + 1}`;
  } else {
    throw new Error(`Incremento inválido: ${type}. Usa patch, minor, major o hotfix.`);
  }

  parseVersion(nextVersion);
  return nextVersion;
}

export function calculateBaseCode(version) {
  const { major, minor, patch } = parseVersion(version);
  return major * 100_000_000 + minor * 100_000 + patch * 100;
}

export function calculateNextReleaseCode(version, currentCodes = []) {
  const numericCodes = currentCodes.filter(Number.isSafeInteger);
  const currentMaximum = numericCodes.length > 0 ? Math.max(...numericCodes) : 0;
  const code = calculateBaseCode(version);

  assertStoreCode(code);
  if (code <= currentMaximum) {
    throw new Error(
      `El código correlacionado ${code} para ${version} no supera el código existente/publicado ${currentMaximum}.`
    );
  }
  return code;
}

export function calculateNextHotfixCode(version, currentCodes = []) {
  const numericCodes = currentCodes.filter(Number.isSafeInteger);
  if (numericCodes.length === 0) {
    throw new Error('No hay un versionCode/buildNumber anterior para calcular el hotfix.');
  }

  const currentMaximum = Math.max(...numericCodes);
  assertCodeInVersionBlock(version, currentMaximum);
  const code = currentMaximum + 1;
  if (code % 100 === 0) {
    throw new Error('No quedan códigos de hotfix en esta versión. Incrementa patch antes de continuar.');
  }

  assertStoreCode(code);
  return code;
}

function assertStoreCode(code) {
  if (!Number.isSafeInteger(code) || code <= 0 || code > ANDROID_MAX_VERSION_CODE) {
    throw new Error(`Código de compilación fuera del rango de Google Play: 1-${ANDROID_MAX_VERSION_CODE}.`);
  }
}

function assertCodeInVersionBlock(version, code) {
  const baseCode = calculateBaseCode(version);
  const maximumCode = baseCode + 99;
  if (code < baseCode || code > maximumCode) {
    throw new Error(`El código ${code} no pertenece al bloque de ${version} (${baseCode}-${maximumCode}).`);
  }
}

function parseYamlDocument(content, filePath) {
  const document = YAML.parseDocument(content);
  if (document.errors.length > 0) {
    throw new Error(`YAML inválido en ${filePath}: ${document.errors[0].message}`);
  }
  return document;
}

function readInteger(value, label) {
  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isSafeInteger(number)) {
    throw new Error(`${label} debe ser un número entero.`);
  }
  return number;
}

function readProject(projectRoot) {
  const packagePath = path.join(projectRoot, 'package.json');
  const trapezePath = path.join(projectRoot, 'trapeze.config.yaml');

  if (!fs.existsSync(packagePath)) {
    throw new Error(`No se encontró package.json en ${projectRoot}.`);
  }
  if (!fs.existsSync(trapezePath)) {
    throw new Error('No se encontró trapeze.config.yaml. Ejecuta ionic-version init primero.');
  }

  const packageContent = fs.readFileSync(packagePath, 'utf8');
  const trapezeContent = fs.readFileSync(trapezePath, 'utf8');
  const packageJson = JSON.parse(packageContent);
  const trapezeDocument = parseYamlDocument(trapezeContent, trapezePath);

  return {
    projectRoot,
    packagePath,
    trapezePath,
    packageContent,
    trapezeContent,
    packageJson,
    trapezeDocument
  };
}

function projectState(project) {
  return {
    packageVersion: project.packageJson.version,
    androidVersion: project.trapezeDocument.getIn(['platforms', 'android', 'versionName']),
    androidCode: readInteger(
      project.trapezeDocument.getIn(['platforms', 'android', 'versionCode']),
      'Android versionCode'
    ),
    iosVersion: project.trapezeDocument.getIn(['platforms', 'ios', 'version']),
    iosBuild: readInteger(
      project.trapezeDocument.getIn(['platforms', 'ios', 'buildNumber']),
      'iOS buildNumber'
    )
  };
}

function readBaselines(projectRoot, options) {
  const configPath = path.join(projectRoot, 'ionic-version.config.yaml');
  let config = {};

  if (fs.existsSync(configPath)) {
    const content = fs.readFileSync(configPath, 'utf8');
    const document = parseYamlDocument(content, configPath);
    config = document.toJS() ?? {};
  }

  const androidBaseline = options.androidBaseline ?? config.android?.lastPublishedCode;
  const iosBaseline = options.iosBaseline ?? config.ios?.lastPublishedBuild;

  return {
    android: androidBaseline === undefined || androidBaseline === null
      ? undefined
      : readInteger(androidBaseline, 'android.lastPublishedCode'),
    ios: iosBaseline === undefined || iosBaseline === null
      ? undefined
      : readInteger(iosBaseline, 'ios.lastPublishedBuild')
  };
}

function validateState(state, baselines) {
  const errors = [];
  const warnings = [];
  let packageVersionIsValid = true;

  try {
    parseVersion(state.packageVersion);
  } catch (error) {
    packageVersionIsValid = false;
    errors.push(error.message);
  }

  if (state.androidVersion !== state.packageVersion) {
    errors.push(`Android versionName (${state.androidVersion}) no coincide con package.json (${state.packageVersion}).`);
  }
  if (state.iosVersion !== state.packageVersion) {
    errors.push(`iOS version (${state.iosVersion}) no coincide con package.json (${state.packageVersion}).`);
  }
  if (state.androidCode !== state.iosBuild) {
    errors.push(`versionCode (${state.androidCode}) y buildNumber (${state.iosBuild}) no coinciden.`);
  }

  for (const [label, code] of [['Android versionCode', state.androidCode], ['iOS buildNumber', state.iosBuild]]) {
    try {
      assertStoreCode(code);
      if (packageVersionIsValid) {
        assertCodeInVersionBlock(state.packageVersion, code);
      }
    } catch (error) {
      errors.push(`${label}: ${error.message}`);
    }
  }

  if (baselines.android === undefined) {
    warnings.push('No se indicó el último versionCode publicado en Google Play.');
  } else if (state.androidCode <= baselines.android) {
    errors.push(`Android versionCode ${state.androidCode} debe ser mayor que el publicado ${baselines.android}.`);
  }

  if (baselines.ios === undefined) {
    warnings.push('No se indicó el último buildNumber publicado en App Store Connect.');
  } else if (state.iosBuild <= baselines.ios) {
    errors.push(`iOS buildNumber ${state.iosBuild} debe ser mayor que el publicado ${baselines.ios}.`);
  }

  return { errors, warnings };
}

function atomicWrite(filePath, content) {
  const temporaryPath = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(temporaryPath, content);
  fs.renameSync(temporaryPath, filePath);
}

function writeVersionChanges(project, version, code) {
  const nextPackageJson = { ...project.packageJson, version };
  const nextTrapezeDocument = project.trapezeDocument.clone();

  nextTrapezeDocument.setIn(['platforms', 'android', 'versionName'], version);
  nextTrapezeDocument.setIn(['platforms', 'android', 'versionCode'], code);
  nextTrapezeDocument.setIn(['platforms', 'ios', 'version'], version);
  nextTrapezeDocument.setIn(['platforms', 'ios', 'buildNumber'], code);

  const packageContent = `${JSON.stringify(nextPackageJson, null, 2)}\n`;
  const trapezeContent = nextTrapezeDocument.toString();

  try {
    atomicWrite(project.packagePath, packageContent);
    atomicWrite(project.trapezePath, trapezeContent);
  } catch (error) {
    atomicWrite(project.packagePath, project.packageContent);
    atomicWrite(project.trapezePath, project.trapezeContent);
    throw error;
  }
}

function printState(state) {
  console.log(`Versión del proyecto: ${state.packageVersion}`);
  console.log(`Android: ${state.androidVersion} (versionCode: ${state.androidCode})`);
  console.log(`iOS: ${state.iosVersion} (buildNumber: ${state.iosBuild})`);
}

function parseArguments(args) {
  const positional = [];
  const options = {};

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === '--cwd') {
      options.cwd = args[++index];
    } else if (argument === '--android-baseline') {
      options.androidBaseline = readInteger(args[++index], '--android-baseline');
    } else if (argument === '--ios-baseline') {
      options.iosBaseline = readInteger(args[++index], '--ios-baseline');
    } else {
      positional.push(argument);
    }
  }

  return { positional, options };
}

function initializeProject(projectRoot) {
  const packagePath = path.join(projectRoot, 'package.json');
  const trapezePath = path.join(projectRoot, 'trapeze.config.yaml');
  const configPath = path.join(projectRoot, 'ionic-version.config.yaml');
  if (!fs.existsSync(packagePath)) {
    throw new Error(`No se encontró package.json en ${projectRoot}.`);
  }

  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  parseVersion(packageJson.version);
  packageJson.scripts ??= {};

  const scripts = {
    'version:info': 'ionic-version info',
    'version:check': 'ionic-version check',
    'version:patch': 'ionic-version bump patch',
    'version:minor': 'ionic-version bump minor',
    'version:major': 'ionic-version bump major',
    'version:hotfix': 'ionic-version bump hotfix'
  };

  for (const [name, command] of Object.entries(scripts)) {
    packageJson.scripts[name] ??= command;
  }

  if (!fs.existsSync(trapezePath)) {
    const code = calculateBaseCode(packageJson.version);
    assertStoreCode(code);
    const document = new YAML.Document({
      platforms: {
        android: { versionName: packageJson.version, versionCode: code },
        ios: { version: packageJson.version, buildNumber: code }
      }
    });
    atomicWrite(trapezePath, document.toString());
  }

  if (!fs.existsSync(configPath)) {
    const document = new YAML.Document({
      android: { lastPublishedCode: null },
      ios: { lastPublishedBuild: null }
    });
    document.commentBefore = 'Últimos códigos aceptados por las tiendas. Completa estos valores antes de preparar una actualización.';
    atomicWrite(configPath, document.toString());
  }

  atomicWrite(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);
  console.log('Proyecto configurado. Revisa trapeze.config.yaml y ejecuta ionic-version check.');
}

function showHelp() {
  console.log(`Uso:
  ionic-version init
  ionic-version info
  ionic-version check [--android-baseline N] [--ios-baseline N]
  ionic-version bump <patch|minor|major|hotfix>

Opciones:
  --cwd RUTA                 Ejecutar sobre otro directorio
  --android-baseline N       Último versionCode publicado
  --ios-baseline N           Último buildNumber publicado`);
}

export async function runCli(args = process.argv.slice(2)) {
  const { positional, options } = parseArguments(args);
  const rawCommand = positional[0] ?? 'help';
  const aliases = ['patch', 'minor', 'major', 'hotfix'];
  const command = aliases.includes(rawCommand) ? 'bump' : rawCommand;
  const bumpType = aliases.includes(rawCommand) ? rawCommand : positional[1];
  const projectRoot = path.resolve(options.cwd ?? process.cwd());

  if (command === 'help' || command === '--help' || command === '-h') {
    showHelp();
    return;
  }
  if (command === 'init') {
    initializeProject(projectRoot);
    return;
  }

  const project = readProject(projectRoot);
  const state = projectState(project);
  const baselines = readBaselines(projectRoot, options);

  if (command === 'info' || command === 'show') {
    printState(state);
    return;
  }

  if (command === 'check') {
    const result = validateState(state, baselines);
    printState(state);
    result.warnings.forEach(warning => console.warn(`AVISO: ${warning}`));
    if (result.errors.length > 0) {
      throw new Error(result.errors.join('\n'));
    }
    console.log('READY: las versiones locales son coherentes y aptas para preparar una actualización.');
    return;
  }

  if (command === 'bump') {
    if (!['patch', 'minor', 'major', 'hotfix'].includes(bumpType)) {
      throw new Error('Indica un incremento: patch, minor, major o hotfix.');
    }

    const referenceCodes = [state.androidCode, state.iosBuild, baselines.android, baselines.ios];
    const nextVersion = bumpType === 'hotfix'
      ? state.packageVersion
      : incrementVersion(state.packageVersion, bumpType);
    const nextCode = bumpType === 'hotfix'
      ? calculateNextHotfixCode(state.packageVersion, referenceCodes)
      : calculateNextReleaseCode(nextVersion, referenceCodes);

    writeVersionChanges(project, nextVersion, nextCode);
    console.log(`Versión actualizada: ${state.packageVersion} -> ${nextVersion}`);
    console.log(`versionCode/buildNumber: ${Math.max(state.androidCode, state.iosBuild)} -> ${nextCode}`);
    console.log('Ejecuta ionic-version check y, después, Trapeze y Capacitor en la app consumidora.');
    return;
  }

  throw new Error(`Comando desconocido: ${rawCommand}. Usa ionic-version --help.`);
}

const entryPoint = process.argv[1] ? pathToFileURL(fs.realpathSync(process.argv[1])).href : undefined;
if (entryPoint === import.meta.url) {
  runCli().catch(error => {
    console.error(`ERROR: ${error.message}`);
    process.exitCode = 1;
  });
}