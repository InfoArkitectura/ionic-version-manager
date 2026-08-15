<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# 📱 Ionic Version Manager

Este repositorio desarrolla una CLI reutilizable para preparar versiones válidas de proyectos Ionic + Angular + Capacitor + Trapeze. No compila, firma ni publica aplicaciones.

## ✅ Proyecto Completado

Todas las fases del desarrollo han sido completadas exitosamente:

- [x] Requisitos clarificados
- [x] Estructura del proyecto creada  
- [x] Personalización implementada
- [x] Scripts de versionado desarrollados
- [x] Tests unitarios e integración sobre proyectos temporales
- [x] Documentación completa

## 🎯 Funcionalidades Principales

- **CLI compartida**: `ionic-version init/info/check/bump`
- **Incremento automático**: patch, minor, major y hotfix
- **Código correlacionado**: `2.1.5` produce `200100500`
- **Versiones unificadas**: Android e iOS usan la misma versión
- **Margen para builds**: 99 códigos por versión (`01-99`)
- **Baselines**: valida contra los últimos códigos publicados conocidos

## 📋 Uso

```bash
# En este repositorio
npm test
node scripts/cli.js --help

# En una app consumidora
npx ionic-version init
npm run version:check
```

## Reglas de trabajo

- Antes de renombrar el proyecto, paquetes, identificadores o rutas, audita todas sus referencias y presenta el alcance; no apliques el cambio sin confirmación.
- No reviertas, descartes ni sobrescribas cambios existentes sin explicar primero qué se eliminaría y obtener confirmación.
- Separa cada cambio importante en su propia rama y pull request. Mantén los commits enfocados y no mezcles actualizaciones, correcciones y renombrados independientes.
- Antes de hacer commit o integrar una rama, ejecuta las pruebas y validaciones aplicables y comunica cualquier error pendiente.
- Usa `master` como rama de integración de este repositorio, salvo que el usuario indique expresamente otra rama.
- Para tareas de revisión o exploración, presenta primero los hallazgos y espera confirmación antes de modificar archivos.
- Mantén ESM en todos los scripts y usa la librería `yaml`; no edites YAML mediante expresiones regulares.
- Una release debe usar exactamente `major * 100000000 + minor * 100000 + patch * 100`; no generes códigos arbitrarios para superar un baseline.
- Cada componente SemVer está limitado a `0-9`; los dos últimos dígitos se reservan para builds/hotfixes `01-99`.

## 🔧 Estructura

```
ionic-version-manager/
├── scripts/           # Scripts principales
├── templates/         # Templates de configuración  
├── test/             # Tests automatizados
├── docs/             # Documentación técnica
└── README.md         # Documentación principal
```
