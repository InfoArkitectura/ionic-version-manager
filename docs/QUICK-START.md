# Guía rápida

## 1. Instalar en la app Ionic

Desde la raíz de la app consumidora:

```bash
npm install --save-dev github:InfoArkitectura/ionic-version-manager#master
npx ionic-version init
```

`init` conserva scripts y configuraciones existentes. Revisa los archivos creados antes de continuar.

## 2. Registrar el último build publicado

Edita `ionic-version.config.yaml`:

```yaml
android:
  lastPublishedCode: 200100599
ios:
  lastPublishedBuild: 200100599
```

Usa los valores realmente aceptados por Google Play y App Store Connect. Déjalos como `null` si la app nunca se ha publicado.

## 3. Comprobar el estado

```bash
npm run version:info
npm run version:check
```

`check` valida que la versión visible coincida entre `package.json`, Android e iOS, que ambos códigos sean enteros válidos y que superen los baselines publicados.

## 4. Preparar una actualización

```bash
# Corrección compatible
npm run version:patch

# Nueva funcionalidad compatible
npm run version:minor

# Cambio incompatible
npm run version:major
```

Ejemplo de correlación:

```text
2.1.5 -> 200100500
2.1.6 -> 200100600
2.2.0 -> 200200000
3.0.0 -> 300000000
```

Cada componente de versión admite valores entre `0` y `9`.

## 5. Preparar otro build de la misma versión

```bash
npm run version:hotfix
```

Para `2.1.5`, los builds disponibles van de `200100501` a `200100599`. Al agotarse, incrementa la versión visible.

## 6. Aplicar y sincronizar

```bash
npm run version:check
npm run trapeze:both
npx cap sync
```

Después genera el AAB o archivado iOS con el flujo nativo del proyecto. Ionic Version Manager no compila, firma ni publica aplicaciones.
