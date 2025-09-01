const fs = require('fs');
const path = require('path');

/**
 * Sistema de Control de Versiones para Ionic + Angular + Capacitor + Trapeze
 * Desarrollado originalmente para PSDMobile
 * 
 * Funcionalidades:
 * - Mostrar versiones actuales (package.json, Android, iOS)
 * - Incrementar versiones automáticamente (patch, minor, major)
 * - Sincronizar versiones entre package.json y trapeze.config.yaml
 * - Calcular versionCode y buildNumber automáticamente
 * - Mantener formato iOS específico (20.X.Y)
 */

// Función para mostrar versiones actuales
function showCurrentVersions() {
  try {
    // Buscar archivos en el directorio del proyecto actual
    const projectRoot = process.cwd();
    const packagePath = path.join(projectRoot, 'package.json');
    const trapezePath = path.join(projectRoot, 'trapeze.config.yaml');
    
    // Verificar que existan los archivos
    if (!fs.existsSync(packagePath)) {
      console.error('❌ No se encontró package.json en el directorio actual');
      console.log('💡 Asegúrate de ejecutar este comando desde la raíz de tu proyecto Ionic');
      process.exit(1);
    }
    
    if (!fs.existsSync(trapezePath)) {
      console.error('❌ No se encontró trapeze.config.yaml en el directorio actual');
      console.log('💡 Este script requiere Trapeze configurado en tu proyecto');
      process.exit(1);
    }
    
    // Leer package.json
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Leer trapeze.config.yaml
    const trapezeConfig = fs.readFileSync(trapezePath, 'utf8');
    
    // Extraer versiones
    const packageVersion = packageJson.version;
    const androidVersionMatch = trapezeConfig.match(/versionName: ([\d.]+)/);
    const androidCodeMatch = trapezeConfig.match(/versionCode: (\d+)/);
    const iosVersionMatch = trapezeConfig.match(/version: ([\d.]+)/);
    const iosBuildMatch = trapezeConfig.match(/buildNumber: (\d+)/);
    
    console.log('📱 Información de Versiones');
    console.log('==========================================');
    console.log(`📦 Package.json: ${packageVersion}`);
    
    if (androidVersionMatch && androidCodeMatch) {
      console.log(`🤖 Android: ${androidVersionMatch[1]} (versionCode: ${androidCodeMatch[1]})`);
    } else {
      console.log('🤖 Android: No configurado en trapeze.config.yaml');
    }
    
    if (iosVersionMatch && iosBuildMatch) {
      console.log(`🍎 iOS: ${iosVersionMatch[1]} (buildNumber: ${iosBuildMatch[1]})`);
    } else {
      console.log('🍎 iOS: No configurado en trapeze.config.yaml');
    }
    
    console.log('');
    console.log('💡 Para actualizar versión:');
    console.log('   npm run version:patch   (X.Y.Z → X.Y.Z+1)');
    console.log('   npm run version:minor   (X.Y.Z → X.Y+1.0)');
    console.log('   npm run version:major   (X.Y.Z → X+1.0.0)');
    console.log('   npm run version:hotfix  (versionCode +1, versión se mantiene)');
    console.log('');
    console.log('🔄 Después de actualizar, ejecuta:');
    console.log('   npm run trapeze:both && npx cap sync');
    
  } catch (error) {
    console.error('❌ Error leyendo versiones:', error.message);
    process.exit(1);
  }
}

// Función para incrementar versión
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

// Función para generar versionCode/buildNumber basado en versión
// Regla: Cada sección del código tiene un dígito más que la versión
// Ejemplos: 1.0.0 → 100000, 2.1.5 → 201050, 10.15.25 → 100150250
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

// Función para incrementar solo el versionCode (hotfix)
// Incrementa el último dígito del versionCode sin cambiar la versión
function incrementVersionCode(currentVersionCode) {
  return currentVersionCode + 1;
}

// Función principal para actualizar versiones
function updateVersions(versionType) {
  try {
    const projectRoot = process.cwd();
    const packagePath = path.join(projectRoot, 'package.json');
    const trapezePath = path.join(projectRoot, 'trapeze.config.yaml');
    
    // Verificar archivos
    if (!fs.existsSync(packagePath)) {
      console.error('❌ No se encontró package.json en el directorio actual');
      process.exit(1);
    }
    
    if (!fs.existsSync(trapezePath)) {
      console.error('❌ No se encontró trapeze.config.yaml en el directorio actual');
      process.exit(1);
    }
    
    // Leer package.json
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Incrementar versión
    const oldVersion = packageJson.version;
    const newVersion = incrementVersion(oldVersion, versionType);
    
    // Actualizar package.json
    packageJson.version = newVersion;
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    
    // Leer y actualizar trapeze.config.yaml
    let trapezeConfig = fs.readFileSync(trapezePath, 'utf8');
    
    // Calcular nuevas versiones
    const newVersionCode = generateVersionCode(newVersion);
    const newBuildNumber = generateVersionCode(newVersion);
    // Android e iOS usan la misma versión (no más formato 20.X.Y para iOS)
    const iosVersion = newVersion;
    
    // Reemplazar versiones en Android
    trapezeConfig = trapezeConfig.replace(/versionName: [\d.]+/, `versionName: ${newVersion}`);
    trapezeConfig = trapezeConfig.replace(/versionCode: \d+/, `versionCode: ${newVersionCode}`);
    
    // Reemplazar versiones en iOS (misma versión que Android)
    trapezeConfig = trapezeConfig.replace(/version: [\d.]+/, `version: ${iosVersion}`);
    trapezeConfig = trapezeConfig.replace(/buildNumber: \d+/, `buildNumber: ${newBuildNumber}`);
    
    // También actualizar en las entradas del plist si existen
    trapezeConfig = trapezeConfig.replace(/CFBundleShortVersionString : "[\d.]+"/g, `CFBundleShortVersionString : "${iosVersion}"`);
    trapezeConfig = trapezeConfig.replace(/CFBundleVersion : "\d+"/g, `CFBundleVersion : "${newBuildNumber}"`);
    
    // Actualizar buildConfiguration para iOS si existe
    trapezeConfig = trapezeConfig.replace(/MARKETING_VERSION: [\d.]+/, `MARKETING_VERSION: ${iosVersion}`);
    trapezeConfig = trapezeConfig.replace(/CURRENT_PROJECT_VERSION: \d+/, `CURRENT_PROJECT_VERSION: ${newBuildNumber}`);
    
    fs.writeFileSync(trapezePath, trapezeConfig);
    
    console.log(`✅ Versión actualizada de ${oldVersion} a ${newVersion}`);
    console.log(`📱 Android versionName: ${newVersion} (versionCode: ${newVersionCode})`);
    console.log(`🍎 iOS version: ${iosVersion} (buildNumber: ${newBuildNumber})`);
    console.log('');
    console.log('🔄 Para aplicar los cambios ejecuta:');
    console.log('   npm run trapeze:both && npx cap sync');
    
  } catch (error) {
    console.error('❌ Error actualizando versión:', error.message);
    process.exit(1);
  }
}

// Función para hotfix - incrementar solo versionCode/buildNumber
function updateVersionCodeOnly() {
  try {
    // Buscar archivos en el directorio del proyecto actual
    const projectRoot = process.cwd();
    const packagePath = path.join(projectRoot, 'package.json');
    const trapezePath = path.join(projectRoot, 'trapeze.config.yaml');
    
    // Verificar que existan los archivos
    if (!fs.existsSync(packagePath)) {
      console.error('❌ No se encontró package.json en el directorio actual');
      console.log('💡 Asegúrate de ejecutar este comando desde la raíz de tu proyecto Ionic');
      process.exit(1);
    }
    
    if (!fs.existsSync(trapezePath)) {
      console.error('❌ No se encontró trapeze.config.yaml en el directorio actual');
      console.log('💡 Este script requiere Trapeze configurado en tu proyecto');
      process.exit(1);
    }
    
    // Leer package.json (no se modifica en hotfix)
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const currentVersion = packageJson.version;
    
    // Leer trapeze.config.yaml
    let trapezeConfig = fs.readFileSync(trapezePath, 'utf8');
    
    // Obtener versionCode actual
    const androidCodeMatch = trapezeConfig.match(/versionCode: (\d+)/);
    const iosBuildMatch = trapezeConfig.match(/buildNumber: (\d+)/);
    
    if (!androidCodeMatch || !iosBuildMatch) {
      console.error('❌ No se pudo leer el versionCode/buildNumber actual');
      process.exit(1);
    }
    
    const currentVersionCode = parseInt(androidCodeMatch[1]);
    const currentBuildNumber = parseInt(iosBuildMatch[1]);
    
    // Verificar que ambos códigos sean iguales
    if (currentVersionCode !== currentBuildNumber) {
      console.warn('⚠️ versionCode y buildNumber no son iguales. Se sincronizarán.');
    }
    
    // Incrementar solo el código
    const newVersionCode = incrementVersionCode(currentVersionCode);
    
    // Reemplazar en trapeze.config.yaml
    trapezeConfig = trapezeConfig.replace(/versionCode: \d+/, `versionCode: ${newVersionCode}`);
    trapezeConfig = trapezeConfig.replace(/buildNumber: \d+/, `buildNumber: ${newVersionCode}`);
    
    // También actualizar en las entradas del plist si existen
    trapezeConfig = trapezeConfig.replace(/CFBundleVersion : "\d+"/g, `CFBundleVersion : "${newVersionCode}"`);
    trapezeConfig = trapezeConfig.replace(/CURRENT_PROJECT_VERSION: \d+/, `CURRENT_PROJECT_VERSION: ${newVersionCode}`);
    
    fs.writeFileSync(trapezePath, trapezeConfig);
    
    console.log(`🔥 Hotfix aplicado - versionCode/buildNumber: ${currentVersionCode} → ${newVersionCode}`);
    console.log(`📱 Versión se mantiene: ${currentVersion}`);
    console.log(`🔧 Android versionCode: ${newVersionCode}`);
    console.log(`🔧 iOS buildNumber: ${newVersionCode}`);
    console.log('');
    console.log('🔄 Para aplicar los cambios ejecuta:');
    console.log('   npm run trapeze:both && npx cap sync');
    
  } catch (error) {
    console.error('❌ Error aplicando hotfix:', error.message);
    process.exit(1);
  }
}

// Leer argumentos de línea de comandos
const versionType = process.argv[2] || 'patch';

// Si el primer argumento es 'show' o 'info', mostrar versiones actuales
if (versionType === 'show' || versionType === 'info') {
  showCurrentVersions();
  process.exit(0);
}

// Si el primer argumento es 'hotfix', incrementar solo versionCode
if (versionType === 'hotfix') {
  updateVersionCodeOnly();
  process.exit(0);
}

// Validar tipo de versión
if (!['patch', 'minor', 'major'].includes(versionType)) {
  console.error('❌ Tipo de versión inválido. Usa: patch, minor, major, hotfix, info o show');
  process.exit(1);
}

// Actualizar versiones
updateVersions(versionType);
