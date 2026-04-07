# Guía de Despliegue en Producción

## Requisitos de Entorno
El Gemelo Digital es una aplicación web estática de alta fidelidad. Puede desplegarse en cualquier servidor web estándar.

## Opción 1: Despliegue Estático (Recomendado)
Para plataformas como Vercel, Netlify o GitHub Pages:
1. Conectar el repositorio de Git.
2. Configurar el directorio raíz como público.
3. El despliegue será automático en cada commit a `main`.

## Opción 2: Despliegue en Servidor Local / VPS
1. Clonar el repositorio:
   ```bash
   git clone [URL-DEL-REPOSITORIO]
   ```
2. Instalar dependencias (para utilidades de backend):
   ```bash
   npm install
   ```
3. Configurar un servidor HTTP (Nginx/Apache) apuntando a `dashboard.html` como índice o servirlo mediante un servidor de archivos.

## Gestión de Versiones (Git Flow)
Utilizamos un sistema de versionamiento semántico:
- **Major**: Cambios arquitecturales.
- **Minor**: Nuevas funcionalidades (ej. V47.0 Hologram).
- **Patch**: Correcciones de seguridad y errores.

Para liberar una versión estable:
```bash
git add .
git commit -m "chore: release v1.0.0-PROD stable"
git tag -a v1.0.0 -m "Versión de Producción Certificada"
git push origin v1.0.0
```

## Seguridad en Producción
- Asegurar que el archivo `dom-service.js` esté siempre cargado antes que `app.js`.
- Mantener los permisos de escritura del sistema de archivos restringidos solo a los scripts de sincronización de Excel en `scripts_backend/`.
