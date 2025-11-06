# Configuración PWA - GYM PRO

## ✅ Configuración Completada

La aplicación ha sido configurada como Progressive Web App (PWA) usando `next-pwa`.

### Características Implementadas

1. **Service Worker**: Configurado automáticamente por next-pwa
2. **Manifest.json**: Configurado con todos los metadatos necesarios
3. **Iconos PWA**: Generados en todos los tamaños requeridos
4. **Meta Tags**: Configurados en el layout para iOS y Android
5. **Instalación**: Banner de instalación automático
6. **Caché Offline**: Configurado para funcionar sin conexión

### Archivos Configurados

- `next.config.mjs`: Configuración de next-pwa
- `public/manifest.json`: Manifest de la PWA
- `app/layout.tsx`: Meta tags y configuración PWA
- `components/pwa/install-prompt.tsx`: Componente de instalación
- `public/icon-*.png`: Iconos en todos los tamaños

### Cómo Funciona

1. **En Desarrollo**: El PWA está deshabilitado (solo funciona en producción)
2. **En Producción**: 
   - El service worker se registra automáticamente
   - Los usuarios pueden instalar la app
   - Funciona offline con caché

### Instalación

Para probar la PWA:

1. Construye la aplicación:
   ```bash
   pnpm build
   pnpm start
   ```

2. Abre en el navegador (Chrome/Edge recomendado)

3. Verás el banner de instalación o el ícono de instalación en la barra de direcciones

4. La app se puede instalar en:
   - Desktop (Windows, Mac, Linux)
   - Mobile (Android, iOS)
   - Tablets

### Personalización

#### Iconos
Los iconos actuales son básicos. Para personalizarlos:

1. Crea iconos en los tamaños: 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512
2. Reemplaza los archivos en `/public/icon-*.png`
3. Ejecuta `pnpm build` nuevamente

#### Manifest
Edita `public/manifest.json` para personalizar:
- Nombre de la app
- Colores del tema
- Shortcuts (atajos)
- Categorías

### Notas Importantes

- El PWA solo funciona en producción (`pnpm build && pnpm start`)
- En desarrollo está deshabilitado para facilitar el debugging
- Los archivos generados por next-pwa están en `.gitignore`
- El service worker se actualiza automáticamente cuando hay cambios

### Troubleshooting

Si la PWA no funciona:

1. Verifica que estés en modo producción (`NODE_ENV=production`)
2. Asegúrate de que el manifest.json sea accesible en `/manifest.json`
3. Verifica la consola del navegador para errores del service worker
4. Limpia el caché del navegador y recarga

### Recursos Útiles

- [next-pwa Documentation](https://github.com/shadowwalker/next-pwa)
- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Manifest Generator](https://realfavicongenerator.net/)

