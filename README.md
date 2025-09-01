# 📱 Ionic Version Manager

[![npm version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/tu-usuario/ionic-version-manager)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)

Sistema automatizado de control de versiones para proyectos **Ionic + Angular + Capacitor + Trapeze**.

Desarrollado originalmente para el proyecto PSDMobile, este sistema automatiza completamente la gestión de versiones entre `package.json`, configuraciones de Android (versionName/versionCode) e iOS (version/buildNumber).

## ✨ Características

- 🔍 **Consulta de versiones**: Ver estado actual de todas las versiones
- 🚀 **Incremento automático**: patch, minor, major con un comando
- 🔥 **Hotfixes**: Incrementar solo versionCode sin cambiar versión (emergencias)
- 🔄 **Sincronización completa**: package.json ↔ trapeze.config.yaml
- 📱 **Android**: Cálculo automático de versionCode con padding dinámico
- 🍎 **iOS**: Versiones unificadas (misma versión que Android) y buildNumber sincronizado
- ⚡ **Fácil instalación**: Script automatizado para proyectos existentes
- 🧪 **Probado**: Suite completa de tests + demostración en proyecto real

## 🎯 Lógica de Versionado

### Padding Dinámico para versionCode/buildNumber
- Versión `1.0.0` → versionCode/buildNumber: `100000`
- Versión `1.0.1` → versionCode/buildNumber: `100010`  
- Versión `1.1.0` → versionCode/buildNumber: `101000`
- Versión `10.15.25` → versionCode/buildNumber: `100150250`

**Regla**: Cada sección del código tiene un dígito más que la versión correspondiente.

### Versiones Unificadas
- ✅ Android e iOS siempre usan la **misma versión** (1.0.0)
- ✅ versionCode y buildNumber siempre son **idénticos**
- ✅ package.json, Android e iOS están **sincronizados**

## 📋 Requisitos

- Node.js >= 16.0.0
- Proyecto Ionic + Angular + Capacitor
- Trapeze configurado (`@trapezedev/configure`)

## 🚀 Instalación Rápida

### Opción 1: Clonar desde GitHub

```bash
# 1. Clonar este repositorio
git clone https://github.com/tu-usuario/ionic-version-manager.git

# 2. Ir al directorio de tu proyecto Ionic
cd tu-proyecto-ionic

# 3. Ejecutar instalación automática
node ../ionic-version-manager/scripts/install-in-project.js
```

### Opción 2: Descargar ZIP

1. Descarga el [ZIP del repositorio](https://github.com/tu-usuario/ionic-version-manager/archive/main.zip)
2. Extrae en tu directorio de proyectos
3. Desde tu proyecto Ionic ejecuta: `node ../ionic-version-manager/scripts/install-in-project.js`

### Instalación manual:

1. Copia `scripts/update-version.js` a tu proyecto
2. Añade los scripts al `package.json`
3. Configura `trapeze.config.yaml`

## 📖 Uso

### Ver versiones actuales:
```bash
npm run version:info
```

Salida:
```
📱 Información de Versiones
==========================================
📦 Package.json: 2.1.5
🤖 Android: 2.1.5 (versionCode: 201050)
🍎 iOS: 2.1.5 (buildNumber: 201050)

💡 Para actualizar versión:
   npm run version:patch   (2.1.5 → 2.1.6)
   npm run version:minor   (2.1.5 → 2.2.0)
   npm run version:major   (2.1.5 → 3.0.0)
```

### Actualizar versiones:

```bash
# Incrementar patch (1.0.0 → 1.0.1)
npm run version:patch

# Incrementar minor (1.0.0 → 1.1.0)  
npm run version:minor

# Incrementar major (1.0.0 → 2.0.0)
npm run version:major
```

### Aplicar cambios:
```bash
# Aplicar configuraciones a las plataformas
npm run trapeze:both

# Sincronizar con Capacitor
npx cap sync
```

## 🔧 Configuración

### Scripts requeridos en package.json:

```json
{
  "scripts": {
    "version:info": "node scripts/update-version.js info",
    "version:patch": "node scripts/update-version.js patch",
    "version:minor": "node scripts/update-version.js minor", 
    "version:major": "node scripts/update-version.js major",
    "trapeze:android": "npx trapeze run trapeze.config.yaml --android --android-project android -y",
    "trapeze:ios": "npx trapeze run trapeze.config.yaml --ios --ios-project ios/App -y",
    "trapeze:both": "npm run trapeze:android && npm run trapeze:ios"
  }
}
```

### Ejemplo de trapeze.config.yaml:

```yaml
# Configuración básica para ionic-version-manager
platforms:
  android:
    versionName: 1.0.0
    versionCode: 100000
    
  ios:
    version: 1.0.0
    buildNumber: 100000
```

**Nota**: Se recomienda usar una configuración simplificada como la mostrada arriba. Configuraciones complejas con manifests, plists y gradle pueden causar conflictos con Trapeze.

## 🧮 Cálculo de Versiones

### VersionCode y BuildNumber (Algoritmo +1 Dígito):
```
Regla: Cada sección del código tiene un dígito más que la versión
Método: Añadir un "0" al final de cada parte

Ejemplos:
1.0.0   → 100000   (1→10, 0→00, 0→00)
2.1.5   → 201050   (2→20, 1→10, 5→50)  
10.15.25 → 100150250 (10→100, 15→150, 25→250)
```

### Versiones Unificadas:
```
Android versionName = iOS version
Ambas plataformas usan exactamente la misma versión
No hay conversiones ni formatos especiales
versionCode = buildNumber (siempre idénticos)
```

## ✅ Flujo de Trabajo Recomendado

1. **Verificar estado actual**:
   ```bash
   npm run version:info
   ```

2. **Incrementar versión**:
   ```bash
   npm run version:patch   # 1.0.0 → 1.0.1
   npm run version:minor   # 1.0.0 → 1.1.0  
   npm run version:major   # 1.0.0 → 2.0.0
   ```

3. **Aplicar cambios a proyectos nativos**:
   ```bash
   npm run trapeze:both
   npx cap sync
   ```

4. **Verificar resultado**:
   ```bash
   npm run version:info
   ```

### Margen para Hotfixes:
```
Cada versión deja 10 códigos para emergencias:
2.1.5 (201050) → hotfixes: 201051, 201052... 201059
10.15.25 (100150250) → hotfixes: 100150251... 100150259
```

## 📁 Estructura del Proyecto

```
ionic-version-manager/
├── scripts/
│   ├── update-version.js      # Script principal de versionado
│   └── install-in-project.js  # Instalador automático
├── templates/
│   └── trapeze.config.yaml    # Template base para Trapeze
├── test/
│   └── test-version-manager.js # Tests automatizados
├── docs/
│   └── [documentación adicional]
├── package.json               # Configuración del paquete
└── README.md                  # Esta documentación
```

## 🚀 Demostración en Proyecto Real

En el directorio `demo-project/` encontrarás un **proyecto Ionic completo** que demuestra el sistema funcionando:

- ✅ **Proyecto Ionic real** creado con `ionic start`
- ✅ **Capacitor Android/iOS** configurado
- ✅ **Trapeze instalado** y funcionando
- ✅ **Version Manager integrado** con todos los scripts
- ✅ **Probado completamente** desde 1.0.0 hasta 1.1.1

### Comandos de demostración:
```bash
cd demo-project/
npm run version:info          # Ver estado actual
npm run version:patch         # Incrementar: 1.1.1 → 1.1.2
npm run trapeze:both          # Aplicar a Android/iOS
npm run version:info          # Verificar cambios
```

## 🧪 Testing

```bash
npm test
```

Ejecuta tests automatizados que verifican:
- ✅ Funciones de incremento de versión
- ✅ Cálculo de versionCode y buildNumber
- ✅ Generación de versiones iOS
- ✅ Estructura de archivos
- ✅ Validez de templates

## 🔄 Workflow Recomendado

1. **Desarrollar features**
2. **Verificar estado**: `npm run version:info`
3. **Incrementar versión**: `npm run version:patch/minor/major`
4. **Aplicar cambios**: `npm run trapeze:both && npx cap sync`
5. **Build para producción**: `npm run build:prod`
6. **Generar AAB/IPA**: Android Studio / Xcode

## 📚 Casos de Uso

### Desarrollo diario:
```bash
npm run version:patch      # 1.0.0 → 1.0.1
npm run trapeze:both
npx cap sync
```

### Nueva funcionalidad:
```bash
npm run version:minor      # 1.0.0 → 1.1.0
npm run trapeze:both
npx cap sync
```

### Breaking changes:
```bash
npm run version:major      # 1.0.0 → 2.0.0
npm run trapeze:both  
npx cap sync
```

## 🛠️ Solución de Problemas

### Error: "No se encontró package.json"
- Ejecuta el comando desde la raíz de tu proyecto Ionic

### Error: "No se encontró trapeze.config.yaml"
- Instala Trapeze: `npm install -D @trapezedev/configure`
- Usa el template incluido en `templates/trapeze.config.yaml`

### Las versiones no se sincronizan
- Verifica que `trapeze.config.yaml` tenga la estructura correcta
- Ejecuta `npm run trapeze:both` después de cambiar versiones

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m 'Añadir nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

## 📜 Licencia

MIT License - ver archivo [LICENSE](LICENSE) para detalles.

## 🙏 Agradecimientos

Desarrollado para el proyecto PSDMobile. Inspirado en la necesidad de automatizar completamente la gestión de versiones en proyectos Ionic complejos.

---

**¿Problemas?** Abre un [issue](https://github.com/tu-usuario/ionic-version-manager/issues)  
**¿Mejoras?** Envía un [pull request](https://github.com/tu-usuario/ionic-version-manager/pulls)
