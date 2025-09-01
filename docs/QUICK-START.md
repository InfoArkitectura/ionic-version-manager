# 🚀 Guía de Inicio Rápido - Ionic Version Manager

## Instalación en Proyecto Existente

### Paso 1: Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/ionic-version-manager.git
```

### Paso 2: Ir a tu proyecto Ionic
```bash
cd mi-proyecto-ionic
```

### Paso 3: Ejecutar instalador automático
```bash
node ../ionic-version-manager/scripts/install-in-project.js
```

## Configuración Inicial

### Editar trapeze.config.yaml:
```yaml
platforms:
  android:
    versionName: 1.0.0
    versionCode: 100000
    # ... resto de configuración
    
  ios:
    version: 1.0.0
    buildNumber: 100000
    # ... resto de configuración
```

### Añadir scripts de Trapeze al package.json:
```json
{
  "scripts": {
    "trapeze:android": "npx trapeze run trapeze.config.yaml --android --android-project android -y",
    "trapeze:ios": "npx trapeze run trapeze.config.yaml --ios --ios-project ios/App -y",
    "trapeze:both": "npm run trapeze:android && npm run trapeze:ios"
  }
}
```

## Uso Diario

### Ver versiones actuales:
```bash
npm run version:info
```
Salida:
```
📱 Información de Versiones
==========================================
📦 Package.json: 1.0.0
🤖 Android: 1.0.0 (versionCode: 100000)
🍎 iOS: 1.0.0 (buildNumber: 100000)
```

### Incrementar versión patch:
```bash
npm run version:patch
```
Resultado: `1.0.0 → 1.0.1` (código: `100000 → 100010`)

### Incrementar versión minor:
```bash
npm run version:minor
```
Resultado: `1.0.5 → 1.1.0` (código: `100050 → 101000`)

### Incrementar versión major:
```bash
npm run version:major
```
Resultado: `1.5.3 → 2.0.0` (código: `150030 → 200000`)

### Aplicar cambios a las plataformas:
```bash
npm run trapeze:both
npx cap sync
```

## Flujo Completo de Release

### Desarrollo normal (bugfix):
```bash
npm run version:patch      # 1.0.0 → 1.0.1
npm run trapeze:both       # Aplicar a Android/iOS
npx cap sync              # Sincronizar Capacitor
npm run build:prod        # Build de producción
```

### Nueva funcionalidad:
```bash
npm run version:minor      # 1.0.5 → 1.1.0
npm run trapeze:both       # Aplicar a Android/iOS
npx cap sync              # Sincronizar Capacitor
npm run build:prod        # Build de producción
```

### Breaking changes:
```bash
npm run version:major      # 1.5.3 → 2.0.0
npm run trapeze:both       # Aplicar a Android/iOS
npx cap sync              # Sincronizar Capacitor
npm run build:prod        # Build de producción
```

## Casos Especiales

### Hotfix de emergencia:
Si una versión ya subida a las tiendas tiene problemas:

```yaml
# En trapeze.config.yaml
platforms:
  android:
    versionName: 1.0.5    # Mantener igual
    versionCode: 100051   # Incrementar solo el código (+1)
  ios:
    version: 1.0.5        # Mantener igual  
    buildNumber: 100051   # Incrementar solo el código (+1)
```

### Verificar estado después de cambios:
```bash
npm run version:info
```

## Ejemplos de Códigos Generados

| Versión | Android versionCode | iOS buildNumber | Hotfixes Disponibles |
|---------|--------------------|-----------------|--------------------|
| 1.0.0 | 100000 | 100000 | 100001-100009 |
| 2.1.5 | 201050 | 201050 | 201051-201059 |
| 10.15.25 | 100150250 | 100150250 | 100150251-100150259 |

## Troubleshooting

### Error: "No se encontró package.json"
- Asegúrate de estar en la raíz de tu proyecto Ionic

### Error: "No se encontró trapeze.config.yaml"  
- Instala Trapeze: `npm install -D @trapezedev/configure`
- Copia el template desde `templates/trapeze.config.yaml`

### Las versiones no se sincronizan
- Ejecuta `npm run trapeze:both` después de cambiar versiones
- Verifica que `trapeze.config.yaml` tenga la estructura correcta

---

¡Listo! Tu sistema de versionado automático está configurado y funcionando. 🎉
