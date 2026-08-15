# Ionic Version Manager

CLI compartida para preparar versiones válidas de proyectos Ionic + Angular + Capacitor antes de generar una actualización para Google Play o App Store.

El gestor no compila, firma ni publica aplicaciones. Mantiene sincronizados:

- `package.json.version`
- Android `versionName` y `versionCode`
- iOS `version` y `buildNumber`
- Los últimos códigos publicados conocidos por el equipo

## Requisitos

- Node.js 18 o posterior
- Proyecto Ionic + Angular + Capacitor
- Trapeze (`@trapezedev/configure`)

## Instalación en otra app

Mientras el paquete se distribuye desde GitHub:

```bash
npm install --save-dev github:InfoArkitectura/ionic-version-manager#master
npx ionic-version init
```

Cuando exista una release etiquetada, sustituye `#master` por esa etiqueta para fijar una versión reproducible.

Durante el desarrollo local del gestor también se puede instalar por ruta:

```bash
npm install --save-dev ../ionic-version-manager
npx ionic-version init
```

`init` no copia la implementación al proyecto. Añade scripts npm si no existen y crea:

- `trapeze.config.yaml`, solo cuando falta.
- `ionic-version.config.yaml`, solo cuando falta.

## Comandos

```bash
# Consultar el estado local
npm run version:info

# Validar coherencia y códigos publicados
npm run version:check

# Preparar una release normal
npm run version:patch
npm run version:minor
npm run version:major

# Mantener la versión visible e incrementar el build
npm run version:hotfix
```

Los mismos comandos están disponibles mediante la CLI:

```bash
ionic-version info
ionic-version check
ionic-version bump patch
ionic-version bump minor
ionic-version bump major
ionic-version bump hotfix
```

## Correlación entre versión y código

Cada componente SemVer admite un dígito (`0-9`) y reserva tres posiciones visuales. Los dos últimos dígitos quedan disponibles para builds/hotfixes:

| Versión | Código base | Builds/hotfixes |
| --- | ---: | ---: |
| `1.0.0` | `100000000` | `100000001-100000099` |
| `2.1.5` | `200100500` | `200100501-200100599` |
| `9.9.9` | `900900900` | `900900901-900900999` |

La fórmula es:

```text
code = major * 100000000 + minor * 100000 + patch * 100 + build
```

Una release normal siempre usa `build = 0`. Un hotfix incrementa `build` entre `01` y `99`. Al agotarse ese rango es obligatorio incrementar `patch`, `minor` o `major`.

Ejemplo:

```text
2.1.5       -> 200100500
2.1.5 hf 1  -> 200100501
2.1.5 hf 99 -> 200100599
2.1.6       -> 200100600
```

La CLI bloquea componentes como `2.1.10`; después de `2.1.9` debe utilizarse `2.2.0`.

## Códigos publicados

Después de cada publicación aceptada, registra los valores de las tiendas en `ionic-version.config.yaml`:

```yaml
android:
  lastPublishedCode: 200100599
ios:
  lastPublishedBuild: 200100599
```

Antes de preparar otra actualización:

```bash
npm run version:check
```

También se pueden proporcionar temporalmente:

```bash
ionic-version check \
  --android-baseline 200100599 \
  --ios-baseline 200100599
```

Sin baseline, `check` valida la coherencia local y muestra un aviso. Con baseline, falla si los códigos no son superiores a los ya publicados.

## Aplicar a Android e iOS

Después de incrementar y validar la versión, la app consumidora debe ejecutar sus scripts de Trapeze y Capacitor:

```bash
npm run trapeze:both
npx cap sync
```

El gestor no inventa esos scripts porque las rutas nativas pueden variar entre proyectos.

## Flujo recomendado

```bash
npm run version:info
npm run version:patch
npm run version:check
npm run trapeze:both
npx cap sync
```

Después se realizan los builds nativos habituales en Android Studio y Xcode.

## Migración desde v1

La v2 cambia el formato de códigos. Antes de migrar una app ya publicada:

1. Consulta el último `versionCode` de Google Play y el último `buildNumber` de App Store Connect.
2. Regístralos en `ionic-version.config.yaml`.
3. Ejecuta `ionic-version check`.
4. Incrementa la versión visible si el código correlacionado no supera los valores publicados.

La CLI nunca sustituye un código correlacionado por otro arbitrario. Si existe un conflicto, detiene el proceso para que la relación versión-código siga siendo predecible.

## Desarrollo del gestor

```bash
npm install
npm test
node scripts/cli.js --help
```

La suite ejecuta la CLI sobre proyectos temporales reales y verifica inicialización, lectura, validación, incrementos, hotfixes y preservación de YAML.
