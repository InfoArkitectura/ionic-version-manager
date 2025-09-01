import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script de instalación para proyectos Ionic existentes
 * Instala ionic-version-manager en un proyecto Ionic + Angular + Capacitor
 */

function installInProject() {
  const projectRoot = process.cwd();
  
  console.log('🚀 Instalando ionic-version-manager en proyecto Ionic...');
  console.log(`📁 Directorio del proyecto: ${projectRoot}`);
  
  // Verificar que sea un proyecto Ionic
  const packagePath = path.join(projectRoot, 'package.json');
  const ionicConfigPath = path.join(projectRoot, 'ionic.config.json');
  
  if (!fs.existsSync(packagePath)) {
    console.error('❌ No se encontró package.json. ¿Estás en un proyecto Ionic?');
    process.exit(1);
  }
  
  if (!fs.existsSync(ionicConfigPath)) {
    console.error('❌ No se encontró ionic.config.json. ¿Estás en un proyecto Ionic?');
    process.exit(1);
  }
  
  try {
    // Leer package.json actual
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Verificar que sea Ionic + Angular
    const hasIonic = packageJson.dependencies && packageJson.dependencies['@ionic/angular'];
    const hasAngular = packageJson.dependencies && packageJson.dependencies['@angular/core'];
    
    if (!hasIonic || !hasAngular) {
      console.error('❌ Este no parece ser un proyecto Ionic + Angular');
      process.exit(1);
    }
    
    console.log('✅ Proyecto Ionic + Angular detectado');
    
    // Añadir scripts de versionado si no existen
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }
    
    const versionScripts = {
      'version:info': 'node scripts/update-version.js info',
      'version:patch': 'node scripts/update-version.js patch',
      'version:minor': 'node scripts/update-version.js minor',
      'version:major': 'node scripts/update-version.js major',
      'version:hotfix': 'node scripts/update-version.js hotfix',
      'version:show': 'node scripts/update-version.js show'
    };
    
    let scriptsAdded = 0;
    for (const [scriptName, scriptCommand] of Object.entries(versionScripts)) {
      if (!packageJson.scripts[scriptName]) {
        packageJson.scripts[scriptName] = scriptCommand;
        scriptsAdded++;
        console.log(`✅ Añadido script: ${scriptName}`);
      } else {
        console.log(`⚠️  Script ya existe: ${scriptName}`);
      }
    }
    
    // Crear directorio scripts si no existe
    const scriptsDir = path.join(projectRoot, 'scripts');
    if (!fs.existsSync(scriptsDir)) {
      fs.mkdirSync(scriptsDir);
      console.log('✅ Creado directorio scripts/');
    }
    
    // Copiar el script update-version.js
    const sourceScriptPath = path.join(__dirname, 'update-version.js');
    const targetScriptPath = path.join(scriptsDir, 'update-version.js');
    
    fs.copyFileSync(sourceScriptPath, targetScriptPath);
    console.log('✅ Copiado update-version.js');
    
    // Crear trapeze.config.yaml si no existe
    const trapezeConfigPath = path.join(projectRoot, 'trapeze.config.yaml');
    if (!fs.existsSync(trapezeConfigPath)) {
      const templatePath = path.join(__dirname, '../templates/trapeze.config.yaml');
      fs.copyFileSync(templatePath, trapezeConfigPath);
      console.log('✅ Creado trapeze.config.yaml desde template');
      console.log('⚠️  IMPORTANTE: Edita trapeze.config.yaml con los datos de tu app');
    } else {
      console.log('⚠️  trapeze.config.yaml ya existe - no se sobrescribe');
    }
    
    // Guardar package.json actualizado
    if (scriptsAdded > 0) {
      fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
      console.log('✅ package.json actualizado');
    }
    
    console.log('');
    console.log('🎉 ¡Instalación completada!');
    console.log('');
    console.log('📋 Próximos pasos:');
    console.log('1. Edita trapeze.config.yaml con los datos de tu app');
    console.log('2. Instala Trapeze: npm install -D @trapezedev/configure');
    console.log('3. Añade scripts de Trapeze a tu package.json:');
    console.log('   "trapeze:android": "npx trapeze run trapeze.config.yaml --android --android-project android -y"');
    console.log('   "trapeze:ios": "npx trapeze run trapeze.config.yaml --ios --ios-project ios/App -y"');
    console.log('   "trapeze:both": "npm run trapeze:android && npm run trapeze:ios"');
    console.log('');
    console.log('🔍 Comandos disponibles:');
    console.log('   npm run version:info  - Ver versiones actuales');
    console.log('   npm run version:patch - Incrementar patch (1.0.0 → 1.0.1)');
    console.log('   npm run version:minor - Incrementar minor (1.0.0 → 1.1.0)');
    console.log('   npm run version:major - Incrementar major (1.0.0 → 2.0.0)');
    console.log('   npm run version:hotfix - Solo incrementar versionCode (hotfix urgente)');
    
  } catch (error) {
    console.error('❌ Error durante la instalación:', error.message);
    process.exit(1);
  }
}

// Ejecutar instalación
installInProject();
