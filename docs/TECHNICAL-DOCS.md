# Documentación técnica

## Arquitectura

- `scripts/cli.js`: motor ESM y punto de entrada `ionic-version`.
- `scripts/update-version.js`: wrapper compatible con instalaciones v1.
- `scripts/install-in-project.js`: alias obsoleto de `ionic-version init`.
- `templates/`: configuraciones iniciales de Trapeze y baselines.
- `test/test-version-manager.js`: pruebas unitarias e integración con proyectos temporales.

El paquete se consume como dependencia de desarrollo. La lógica permanece en `node_modules`; no se copia a cada app.

## Invariantes

Una app está lista para preparar una actualización cuando:

1. `package.json.version`, Android `versionName` e iOS `version` coinciden.
2. `versionCode` y `buildNumber` coinciden y son enteros positivos.
3. Cada componente SemVer está entre `0` y `9`.
4. Los códigos son superiores a los últimos valores publicados, cuando se conocen.
5. Una release normal usa el código base exacto derivado de la versión.

## Algoritmo

```text
baseCode = major * 100000000
         + minor *    100000
         + patch *       100

storeCode = baseCode + build
```

Rangos:

- `major`: `0-9`
- `minor`: `0-9`
- `patch`: `0-9`
- `build`: `0-99`

Ejemplos:

| Versión/build | Código |
| --- | ---: |
| `1.0.0+0` | `100000000` |
| `2.1.5+0` | `200100500` |
| `2.1.5+1` | `200100501` |
| `2.1.5+99` | `200100599` |
| `2.1.6+0` | `200100600` |

El máximo generado (`9.9.9+99 = 900900999`) queda por debajo del límite de Google Play (`2100000000`).

## Baselines publicados

`ionic-version.config.yaml` guarda el último estado conocido de las tiendas:

```yaml
android:
  lastPublishedCode: 200100599
ios:
  lastPublishedBuild: 200100599
```

La CLI no consulta cuentas ni APIs externas. El equipo actualiza estos valores después de una publicación aceptada.

`check` exige `local > baseline`. `bump` incluye ambos baselines al decidir si el código correlacionado es válido. Si no lo supera, falla en lugar de generar un código sin relación con SemVer.

## Escritura de archivos

- `package.json` se procesa como JSON.
- `trapeze.config.yaml` se procesa con `yaml`, conservando comentarios siempre que sea posible.
- Las escrituras utilizan un archivo temporal y un rename atómico.
- Si falla la escritura conjunta de versión, se restauran los contenidos originales.
- `init` no reemplaza archivos existentes ni scripts npm ya definidos.

## Contrato CLI

```text
ionic-version init
ionic-version info
ionic-version check [--android-baseline N] [--ios-baseline N]
ionic-version bump <patch|minor|major|hotfix>
```

Todos los comandos aceptan `--cwd RUTA` para pruebas o automatización desde otro directorio.

Los aliases `patch`, `minor`, `major`, `hotfix`, `show` e `info` se mantienen para facilitar la migración desde v1.

## Responsabilidades fuera de alcance

El gestor no ejecuta automáticamente:

- Trapeze o `cap sync`.
- Builds Android/iOS.
- Firma de AAB, APK o IPA.
- Publicación en Google Play o App Store Connect.

Estas operaciones pertenecen a cada app consumidora porque sus rutas, configuraciones y credenciales son específicas.
