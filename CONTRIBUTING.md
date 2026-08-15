# 🤝 Contribuir a Ionic Version Manager

¡Gracias por tu interés en contribuir! Este proyecto está abierto a contribuciones de la comunidad.

## 🚀 Cómo contribuir

### 1. Fork del repositorio

```bash
git clone https://github.com/InfoArkitectura/ionic-version-manager.git
```

### 2. Crear rama para tu feature

```bash
git checkout -b feature/nueva-funcionalidad
```

### 3. Hacer cambios y tests

```bash
# Hacer tus cambios...
npm test  # Verificar que los tests pasen
```

### 4. Commit y push

```bash
git commit -m "feat: agregar nueva funcionalidad"
git push origin feature/nueva-funcionalidad
```

### 5. Crear Pull Request

Abre un PR en GitHub describiendo los cambios.

## 📋 Guías

### Estilo de código

- Usar módulos ESM (`import`/`export`)
- Comentarios en español
- Mantener la CLI compatible con Node.js 18 o posterior
- Procesar YAML con la librería `yaml`

### Tests

- Agregar tests para nuevas funcionalidades
- Ejecutar `npm test` antes de hacer commit
- Probar los comandos reales sobre proyectos temporales

### Commits

Usar formato conventional commits:

- `feat:` para nuevas funcionalidades
- `fix:` para correcciones
- `docs:` para documentación
- `test:` para tests

## 🔮 Ideas para contribuir

- [ ] Plugin oficial de Capacitor
- [ ] Integración con Git tags automáticos
- [ ] Soporte para otros frameworks (Flutter, React Native)
- [x] CLI independiente
- [ ] Integración con CI/CD

## 📞 Contacto

Si tienes preguntas, abre un issue en GitHub.

¡Gracias por contribuir! 🎉
