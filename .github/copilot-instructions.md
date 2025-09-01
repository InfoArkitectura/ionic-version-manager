<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# 📱 Ionic Version Manager

Este es un sistema automatizado de control de versiones para proyectos Ionic + Angular + Capacitor + Trapeze.

## ✅ Proyecto Completado

Todas las fases del desarrollo han sido completadas exitosamente:

- [x] Requisitos clarificados
- [x] Estructura del proyecto creada  
- [x] Personalización implementada
- [x] Scripts de versionado desarrollados
- [x] Tests automatizados (7/7 pasados)
- [x] Documentación completa

## 🎯 Funcionalidades Principales

- **Consulta de versiones**: `npm run version:info`
- **Incremento automático**: `npm run version:patch/minor/major`
- **Algoritmo +1 dígito**: Cada sección del código tiene un dígito más que la versión
- **Versiones unificadas**: Android e iOS usan la misma versión
- **Margen para hotfixes**: 10 códigos por versión para emergencias

## 📋 Uso

```bash
# Ver estado actual
npm run version:info

# Actualizar versión
npm run version:patch  # 1.0.0 → 1.0.1

# Aplicar cambios
npm run trapeze:both && npx cap sync
```

## 🔧 Estructura

```
ionic-version-manager/
├── scripts/           # Scripts principales
├── templates/         # Templates de configuración  
├── test/             # Tests automatizados
├── docs/             # Documentación técnica
└── README.md         # Documentación principal
```
