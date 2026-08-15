import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import YAML from 'yaml';
import {
  calculateBaseCode,
  calculateNextHotfixCode,
  calculateNextReleaseCode,
  incrementVersion
} from '../scripts/cli.js';

const repositoryRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const cliPath = path.join(repositoryRoot, 'scripts', 'cli.js');

function createProject(version = '2.1.5', code = 200100500) {
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ionic-version-manager-'));
  fs.writeFileSync(
    path.join(projectRoot, 'package.json'),
    `${JSON.stringify({ name: 'test-ionic-app', version, scripts: {} }, null, 2)}\n`
  );
  fs.writeFileSync(
    path.join(projectRoot, 'trapeze.config.yaml'),
    `# configuración conservada\nplatforms:\n  android:\n    versionName: ${version}\n    versionCode: ${code}\n  ios:\n    version: ${version}\n    buildNumber: ${code}\n`
  );
  return projectRoot;
}

function runCli(projectRoot, ...args) {
  return spawnSync(process.execPath, [cliPath, ...args, '--cwd', projectRoot], {
    encoding: 'utf8'
  });
}

test('genera códigos correlacionados con tres posiciones por componente', () => {
  assert.equal(calculateBaseCode('2.0.0'), 200000000);
  assert.equal(calculateBaseCode('2.1.5'), 200100500);
  assert.equal(calculateBaseCode('9.9.9'), 900900900);
});

test('limita cada componente SemVer a un dígito', () => {
  assert.equal(incrementVersion('2.1.5', 'patch'), '2.1.6');
  assert.throws(() => incrementVersion('2.1.9', 'patch'), /fuera de rango/);
  assert.throws(() => incrementVersion('2.9.0', 'minor'), /fuera de rango/);
  assert.throws(() => incrementVersion('9.0.0', 'major'), /fuera de rango/);
});

test('reserva 99 códigos de build y hotfix', () => {
  assert.equal(calculateNextHotfixCode('2.1.5', [200100500]), 200100501);
  assert.equal(calculateNextHotfixCode('2.1.5', [200100598]), 200100599);
  assert.throws(() => calculateNextHotfixCode('2.1.5', [200100599]), /No quedan códigos/);
  assert.throws(
    () => calculateNextHotfixCode('2.1.5', [200100500, 200100600]),
    /no pertenece al bloque de 2\.1\.5/
  );
});

test('mantiene correlación estricta frente a códigos previos', () => {
  assert.equal(calculateNextReleaseCode('2.1.6', [200100599]), 200100600);
  assert.throws(
    () => calculateNextReleaseCode('2.1.6', [200100700]),
    /no supera el código existente\/publicado/
  );
});

test('init configura scripts y Trapeze sin sobrescribir scripts existentes', t => {
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ionic-version-manager-init-'));
  t.after(() => fs.rmSync(projectRoot, { recursive: true, force: true }));
  fs.writeFileSync(
    path.join(projectRoot, 'package.json'),
    `${JSON.stringify({ name: 'test-app', version: '1.2.3', scripts: { 'version:info': 'custom-command' } }, null, 2)}\n`
  );

  const result = runCli(projectRoot, 'init');
  assert.equal(result.status, 0, result.stderr);

  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
  const trapeze = YAML.parse(fs.readFileSync(path.join(projectRoot, 'trapeze.config.yaml'), 'utf8'));
  const config = YAML.parse(fs.readFileSync(path.join(projectRoot, 'ionic-version.config.yaml'), 'utf8'));
  assert.equal(packageJson.scripts['version:info'], 'custom-command');
  assert.equal(packageJson.scripts['version:patch'], 'ionic-version bump patch');
  assert.equal(trapeze.platforms.android.versionCode, 100200300);
  assert.equal(trapeze.platforms.ios.buildNumber, 100200300);
  assert.equal(config.android.lastPublishedCode, null);
  assert.equal(config.ios.lastPublishedBuild, null);
});

test('check valida coherencia y baselines publicados', t => {
  const projectRoot = createProject();
  t.after(() => fs.rmSync(projectRoot, { recursive: true, force: true }));
  fs.writeFileSync(
    path.join(projectRoot, 'ionic-version.config.yaml'),
    'android:\n  lastPublishedCode: 200100499\nios:\n  lastPublishedBuild: 200100499\n'
  );

  const valid = runCli(projectRoot, 'check');
  assert.equal(valid.status, 0, valid.stderr);
  assert.match(valid.stdout, /READY/);

  const invalid = runCli(projectRoot, 'check', '--android-baseline', '200100500');
  assert.equal(invalid.status, 1);
  assert.match(invalid.stderr, /debe ser mayor que el publicado/);

  const trapezePath = path.join(projectRoot, 'trapeze.config.yaml');
  const trapeze = YAML.parse(fs.readFileSync(trapezePath, 'utf8'));
  trapeze.platforms.android.versionCode = 200100600;
  trapeze.platforms.ios.buildNumber = 200100600;
  fs.writeFileSync(trapezePath, YAML.stringify(trapeze));

  const wrongVersionBlock = runCli(projectRoot, 'check');
  assert.equal(wrongVersionBlock.status, 1);
  assert.match(wrongVersionBlock.stderr, /no pertenece al bloque de 2\.1\.5/);
});

test('bump patch actualiza package y YAML preservando comentarios', t => {
  const projectRoot = createProject('2.1.5', 200100599);
  t.after(() => fs.rmSync(projectRoot, { recursive: true, force: true }));

  const result = runCli(projectRoot, 'bump', 'patch');
  assert.equal(result.status, 0, result.stderr);

  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
  const trapezeContent = fs.readFileSync(path.join(projectRoot, 'trapeze.config.yaml'), 'utf8');
  const trapeze = YAML.parse(trapezeContent);
  assert.equal(packageJson.version, '2.1.6');
  assert.equal(trapeze.platforms.android.versionName, '2.1.6');
  assert.equal(trapeze.platforms.android.versionCode, 200100600);
  assert.equal(trapeze.platforms.ios.version, '2.1.6');
  assert.equal(trapeze.platforms.ios.buildNumber, 200100600);
  assert.match(trapezeContent, /# configuración conservada/);
});

test('bump hotfix rechaza baselines de otro bloque sin modificar archivos', t => {
  const projectRoot = createProject();
  t.after(() => fs.rmSync(projectRoot, { recursive: true, force: true }));
  fs.writeFileSync(
    path.join(projectRoot, 'ionic-version.config.yaml'),
    'android:\n  lastPublishedCode: 200100600\nios:\n  lastPublishedBuild: 200100600\n'
  );

  const packagePath = path.join(projectRoot, 'package.json');
  const trapezePath = path.join(projectRoot, 'trapeze.config.yaml');
  const packageBefore = fs.readFileSync(packagePath, 'utf8');
  const trapezeBefore = fs.readFileSync(trapezePath, 'utf8');

  const result = runCli(projectRoot, 'bump', 'hotfix');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /no pertenece al bloque de 2\.1\.5/);
  assert.equal(fs.readFileSync(packagePath, 'utf8'), packageBefore);
  assert.equal(fs.readFileSync(trapezePath, 'utf8'), trapezeBefore);
});

test('info ejecuta el flujo real de lectura', t => {
  const projectRoot = createProject();
  t.after(() => fs.rmSync(projectRoot, { recursive: true, force: true }));

  const result = runCli(projectRoot, 'info');
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Android: 2.1.5 \(versionCode: 200100500\)/);
  assert.match(result.stdout, /iOS: 2.1.5 \(buildNumber: 200100500\)/);
});

test('arranca mediante un symlink equivalente a node_modules/.bin', {
  skip: process.platform === 'win32'
}, t => {
  const projectRoot = createProject();
  const binRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ionic-version-bin-'));
  const binPath = path.join(binRoot, 'ionic-version');
  t.after(() => fs.rmSync(projectRoot, { recursive: true, force: true }));
  t.after(() => fs.rmSync(binRoot, { recursive: true, force: true }));
  fs.symlinkSync(cliPath, binPath);

  const result = spawnSync(binPath, ['info', '--cwd', projectRoot], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Versión del proyecto: 2.1.5/);
});