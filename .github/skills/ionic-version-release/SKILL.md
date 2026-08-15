---
name: ionic-version-release
description: 'Gestiona versiones y releases con Ionic Version Manager. Usar al consultar, incrementar o validar versiones patch, minor, major o hotfix; sincronizar Trapeze y Capacitor; preparar Android/iOS; o mantener este repositorio sin confundirlo con una app Ionic consumidora.'
argument-hint: '<ruta-app> <info|patch|minor|major|hotfix>'
---

# Ionic Version Release

Aplica un flujo de versionado verificable y mantiene separados el gestor y la app que lo consume.

## Identificar el contexto

1. Lee el `package.json` del directorio de trabajo.
2. Si `name` es `ionic-version-manager`, estás manteniendo el gestor. Sigue **Mantenimiento del gestor**.
3. En otro caso, confirma que es una app destino y que tiene instalada la dependencia `ionic-version-manager`. No copies scripts desde este repositorio.
4. Si no se proporcionó la ruta de la app destino, solicítala. No ejecutes comandos de Trapeze o Capacitor en este repositorio.

## Versionar una app destino

1. Revisa `git status` y conserva todos los cambios existentes. No reviertas ni sobrescribas archivos ajenos al versionado.
2. Ejecuta `npm run version:info` y comunica la versión, los códigos y los baselines de `ionic-version.config.yaml`.
3. Confirma con el usuario el incremento solicitado y el resultado esperado antes de modificar archivos:
   - `patch`: correcciones compatibles.
   - `minor`: nuevas funcionalidades compatibles.
   - `major`: cambios incompatibles.
   - `hotfix`: conserva la versión y aumenta únicamente los códigos de compilación.
4. Ejecuta exactamente uno de estos comandos: `npm run version:patch`, `npm run version:minor`, `npm run version:major` o `npm run version:hotfix`.
5. Ejecuta `npm run version:check` y revisa el diff. Verifica que Android e iOS compartan versión, que `versionCode` sea igual a `buildNumber` y que ambos superen los últimos valores publicados.
6. Si existen los scripts necesarios, ejecuta `npm run trapeze:both` y después `npx cap sync`. Detente e informa si cualquiera falla.
7. Ejecuta las pruebas y el build definidos por la app. No inventes nombres como `build:prod`; comprueba primero su `package.json`.
8. Resume versión anterior y nueva, códigos, archivos modificados y validaciones. No hagas commit, push, PR ni publiques AAB/IPA sin una petición explícita.

## Mantenimiento del gestor

1. Usa [README.md](../../../README.md) y [QUICK-START.md](../../../docs/QUICK-START.md) como referencias funcionales; no copies su contenido completo al contexto sin necesidad.
2. Ejecuta `npm test` antes de modificar el algoritmo para establecer la línea base.
3. Mantén sincronizados `scripts/update-version.js`, `test/test-version-manager.js`, `templates/trapeze.config.yaml` y la documentación cuando cambie el comportamiento público.
4. Ejecuta `npm test` después de cada cambio funcional y reporta el resultado.
5. No ejecutes `trapeze:both`, `cap sync` ni builds nativos en este repositorio: pertenecen a la app consumidora.

## Límites

- No mezcles una actualización de dependencias, un renombrado o una migración nativa con el incremento de versión; sepáralos en ramas y PRs distintos.
- No alteres identificadores de paquete, nombres de proyecto, keystores, certificados ni perfiles de firma sin una auditoría y confirmación específicas.
- Para logs extensos, extrae solo errores y contexto relevante en lugar de cargar la salida completa.
- Conserva la correlación `2.1.5 → 200100500`; cada componente admite `0-9` y los builds/hotfixes usan `01-99`.