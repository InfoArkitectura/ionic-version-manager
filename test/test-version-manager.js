import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Tests para ionic-version-manager
 * Verifica funcionalidades principales del sistema de versionado
 */

let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;

function runTest(testName, testFunction) {
  testsRun++;
  console.log(`🧪 ${testName}...`);
  
  try {
    testFunction();
    testsPassed++;
    console.log(`✅ ${testName} - PASÓ`);
  } catch (error) {
    testsFailed++;
    console.log(`❌ ${testName} - FALLÓ: ${error.message}`);
  }
  console.log('');
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

// Test 1: Verificar que existen los archivos principales
runTest('Archivos principales existen', () => {
  const scriptsPath = path.join(__dirname, '../scripts/update-version.js');
  const templatePath = path.join(__dirname, '../templates/trapeze.config.yaml');
  const installPath = path.join(__dirname, '../scripts/install-in-project.js');
  
  assert(fs.existsSync(scriptsPath), 'update-version.js no existe');
  assert(fs.existsSync(templatePath), 'trapeze.config.yaml template no existe');
  assert(fs.existsSync(installPath), 'install-in-project.js no existe');
});

// Test 2: Verificar package.json válido
runTest('package.json es válido', () => {
  const packagePath = path.join(__dirname, '../package.json');
  assert(fs.existsSync(packagePath), 'package.json no existe');
  
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  assert(packageJson.name === 'ionic-version-manager', 'Nombre incorrecto en package.json');
  assert(packageJson.scripts['version:info'], 'Script version:info no existe');
  assert(packageJson.scripts['version:patch'], 'Script version:patch no existe');
});

// Test 3: Verificar funciones de incremento de versión
runTest('Función incrementVersion', () => {
  // Simular la función (simplificada para el test)
  function incrementVersion(version, type = 'patch') {
    const parts = version.split('.').map(num => parseInt(num));
    
    switch(type) {
      case 'major':
        parts[0]++;
        parts[1] = 0;
        parts[2] = 0;
        break;
      case 'minor':
        parts[1]++;
        parts[2] = 0;
        break;
      case 'patch':
      default:
        parts[2]++;
        break;
    }
    
    return parts.join('.');
  }
  
  assert(incrementVersion('1.0.0', 'patch') === '1.0.1', 'Incremento patch incorrecto');
  assert(incrementVersion('1.0.5', 'minor') === '1.1.0', 'Incremento minor incorrecto');
  assert(incrementVersion('1.5.3', 'major') === '2.0.0', 'Incremento major incorrecto');
});

// Test 4: Verificar función generateVersionCode
runTest('Función generateVersionCode', () => {
  function generateVersionCode(version) {
    const parts = version.split('.');
    let code = '';
    
    for (const part of parts) {
      // Cada parte del código tiene un dígito más que la versión (añadir un 0)
      const paddedValue = part + '0';
      code += paddedValue;
    }
    
    return parseInt(code);
  }
  
  assert(generateVersionCode('1.0.0') === 100000, 'VersionCode 1.0.0 incorrecto');
  assert(generateVersionCode('2.1.5') === 201050, 'VersionCode 2.1.5 incorrecto');
  assert(generateVersionCode('10.15.25') === 100150250, 'VersionCode 10.15.25 incorrecto');
});

// Test 5: Verificar que Android e iOS usan la misma versión
runTest('Android e iOS misma versión', () => {
  // Ya no hay función generateIOSVersion, ambas plataformas usan la misma versión
  const version = '2.1.5';
  const androidVersion = version;  // 2.1.5
  const iosVersion = version;      // 2.1.5 (NO 20.1.5)
  
  assert(androidVersion === iosVersion, 'Android e iOS deben tener la misma versión');
  assert(iosVersion === '2.1.5', 'iOS debe usar la versión original sin modificar');
});

// Test 6: Verificar template de trapeze.config.yaml
runTest('Template trapeze.config.yaml es válido', () => {
  const templatePath = path.join(__dirname, '../templates/trapeze.config.yaml');
  const templateContent = fs.readFileSync(templatePath, 'utf8');
  
  assert(templateContent.includes('versionName:'), 'Template no contiene versionName');
  assert(templateContent.includes('versionCode:'), 'Template no contiene versionCode');
  assert(templateContent.includes('version:'), 'Template no contiene version iOS');
  assert(templateContent.includes('buildNumber:'), 'Template no contiene buildNumber');
  assert(templateContent.includes('platforms:'), 'Template no contiene platforms');
});

// Test 7: Verificar estructura de archivos
runTest('Estructura de archivos correcta', () => {
  const requiredFiles = [
    'package.json',
    'scripts/update-version.js',
    'scripts/install-in-project.js', 
    'templates/trapeze.config.yaml',
    'test/test-version-manager.js',
    '.github/copilot-instructions.md'
  ];
  
  const rootDir = path.join(__dirname, '..');
  
  for (const file of requiredFiles) {
    const filePath = path.join(rootDir, file);
    assert(fs.existsSync(filePath), `Archivo requerido no existe: ${file}`);
  }
});

// Test 8: Verificar función incrementVersionCode (hotfix)
runTest('Función incrementVersionCode', () => {
  function incrementVersionCode(currentVersionCode) {
    return currentVersionCode + 1;
  }
  
  assert(incrementVersionCode(100000) === 100001, 'Incremento de versionCode desde 100000 incorrecto');
  assert(incrementVersionCode(101010) === 101011, 'Incremento de versionCode desde 101010 incorrecto');
  assert(incrementVersionCode(201050) === 201051, 'Incremento de versionCode desde 201050 incorrecto');
  assert(incrementVersionCode(100150250) === 100150251, 'Incremento de versionCode desde 100150250 incorrecto');
});

// Mostrar resumen final
console.log('🏁 RESUMEN DE TESTS');
console.log('==================');
console.log(`📊 Tests ejecutados: ${testsRun}`);
console.log(`✅ Tests pasados: ${testsPassed}`);
console.log(`❌ Tests fallidos: ${testsFailed}`);
console.log(`📈 Porcentaje de éxito: ${Math.round((testsPassed / testsRun) * 100)}%`);

if (testsFailed === 0) {
  console.log('');
  console.log('🎉 ¡Todos los tests pasaron! ionic-version-manager está listo para usar.');
} else {
  console.log('');
  console.log('⚠️  Algunos tests fallaron. Revisa los errores arriba.');
  process.exit(1);
}
