# 🚀 Crear Proyecto de Demostración

Para probar el `ionic-version-manager` en un proyecto Ionic real, sigue estos pasos:

## 📱 Crear Demo Project

```bash
# 1. Crear proyecto Ionic con Angular + Capacitor
ionic start demo-project tabs --type=angular --capacitor --confirm

# 2. Entrar al directorio
cd demo-project

# 3. Instalar Trapeze
npm install @trapezedev/configure --save-dev

# 4. Agregar plataformas móviles
npm install @capacitor/android @capacitor/ios --save-dev
npx cap add android
npx cap add ios

# 5. Instalar ionic-version-manager desde el checkout local
npm install --save-dev ..
npx ionic-version init

# 6. Agregar scripts de Trapeze al package.json
```

Agregar estos scripts a tu `package.json`:

```json
{
  "scripts": {
    "trapeze:android": "npx trapeze run trapeze.config.yaml --android --android-project android -y",
    "trapeze:ios": "npx trapeze run trapeze.config.yaml --ios --ios-project ios/App -y", 
    "trapeze:both": "npm run trapeze:android && npm run trapeze:ios"
  }
}
```

## ✅ Probar funcionalidad

```bash
# Ver estado actual
npm run version:info

# Incrementar versión
npm run version:patch    # 1.0.0 → 1.0.1 (100000000 → 100000100)

# Validar coherencia y baselines
npm run version:check

# Aplicar a proyectos nativos
npm run trapeze:both
npx cap sync

# Hotfix (emergencias)
npm run version:hotfix   # Solo incrementa build: 100000100 → 100000101

# Verificar resultado
npm run version:info
```

## 🎯 Resultado Esperado

```text
📱 Información de Versiones
==========================================
Versión del proyecto: 1.0.1
Android: 1.0.1 (versionCode: 100000100)
iOS: 1.0.1 (buildNumber: 100000100)
```

¡Tu demo project estará listo para probar todas las funcionalidades! 🎉
