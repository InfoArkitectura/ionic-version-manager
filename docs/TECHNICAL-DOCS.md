# 📖 Documentación Técnica - Ionic Version Manager

## 🔧 Arquitectura del Sistema

### Componentes Principales:

1. **`scripts/update-version.js`** - Motor principal del sistema
2. **`templates/trapeze.config.yaml`** - Template base para configuración
3. **`scripts/install-in-project.js`** - Instalador automático
4. **`test/test-version-manager.js`** - Suite de tests

## 📐 Algoritmo de Versionado

### Lógica del VersionCode:
```javascript
function generateVersionCode(version) {
  const parts = version.split('.');
  let code = '';
  
  for (const part of parts) {
    // Cada parte del código tiene un dígito más que la versión
    const paddedValue = part + '0';
    code += paddedValue;
  }
  
  return parseInt(code);
}
```

### Ejemplos de Transformación:
| Versión | Cálculo | Código | Hotfixes Disponibles |
|---------|---------|--------|---------------------|
| 1.0.0 | 1→10, 0→00, 0→00 | 100000 | 100001-100009 |
| 2.1.5 | 2→20, 1→10, 5→50 | 201050 | 201051-201059 |
| 10.15.25 | 10→100, 15→150, 25→250 | 100150250 | 100150251-100150259 |

## 🔄 Flujo de Actualización

1. **Lectura**: package.json + trapeze.config.yaml
2. **Incremento**: Versión según tipo (patch/minor/major)
3. **Cálculo**: Nuevo versionCode usando algoritmo +1
4. **Escritura**: Actualización sincronizada de archivos
5. **Confirmación**: Mensaje con nueva información

## 🎯 Casos de Uso Avanzados

### Hotfix de Emergencia:
```bash
# Situación: 2.1.5 (201050) falla en Google Play
# Solución: Editar manualmente trapeze.config.yaml
versionName: 2.1.5  # Mantener igual
versionCode: 201051 # Incrementar solo el código
```

### Migración de Proyecto Existente:
```bash
# 1. Backup actual
cp package.json package.json.backup
cp trapeze.config.yaml trapeze.config.yaml.backup

# 2. Instalar sistema
node ionic-version-manager/scripts/install-in-project.js

# 3. Verificar resultado
npm run version:info
```

## 🧪 Testing y Validación

### Tests Automáticos:
- Funciones de incremento de versión
- Algoritmo de generación de código
- Estructura de archivos
- Validación de templates

### Comandos de Validación:
```bash
npm test                    # Tests completos
npm run version:info        # Estado actual
node scripts/update-version.js show  # Información detallada
```

## 🔧 Configuración Avanzada

### Personalización de Templates:
```yaml
# templates/trapeze.config.yaml
platforms:
  android:
    versionName: 1.0.0
    versionCode: 100000
    # Añadir configuraciones específicas aquí
    
  ios:
    version: 1.0.0
    buildNumber: 100000
    # Añadir configuraciones específicas aquí
```

### Scripts Adicionales:
```json
{
  "scripts": {
    "version:check": "npm run version:info",
    "version:bump": "npm run version:patch && npm run trapeze:both",
    "release:prepare": "npm run version:minor && npm run trapeze:both && npx cap sync"
  }
}
```

## 🚨 Solución de Problemas

### Error: "Cannot find module"
- Verificar que Node.js >= 16.0.0
- Ejecutar desde directorio correcto

### Error: "No se encontró trapeze.config.yaml"
- Instalar Trapeze: `npm install -D @trapezedev/configure`
- Copiar template desde `templates/trapeze.config.yaml`

### VersionCode muy grande
- Límite teórico: ~9 dígitos para versiones normales
- Para versiones extremas (100.100.100 → 1001001000), verificar límites de plataforma

## 📊 Límites del Sistema

### Rangos Soportados:
- **Major**: 0-999 (ilimitado prácticamente)
- **Minor**: 0-999 (ilimitado prácticamente)  
- **Patch**: 0-999 (ilimitado prácticamente)
- **Hotfixes**: 10 por versión (0-9 al final)

### Límites de Plataforma:
- **Android**: versionCode máximo ~2.1 mil millones
- **iOS**: buildNumber máximo ~2.1 mil millones

---
*Documentación técnica completa para ionic-version-manager v1.0.0*
