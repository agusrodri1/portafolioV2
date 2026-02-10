# Mi pag WEB — Portfolio (Agustín Rodríguez)

Sitio estático (HTML/CSS/JS) con estética futurista y fondo animado.

## Cómo verlo

1) Abrí la carpeta.
2) Doble click en `index.html`.

> Tip: si usás VS Code, podés instalar la extensión **Live Server** y abrirlo con recarga automática.

## Docker (Nginx)

Este proyecto se puede correr como un contenedor Nginx.

### Opción 1: Docker Compose (recomendado)

```powershell
docker compose up --build
```

Abrís: http://localhost:8080

### Opción 2: Docker directo

```powershell
docker build -t mi-pag-web .
docker run --rm -p 8080:80 mi-pag-web
```

Abrís: http://localhost:8080

## Qué personalizar primero

En `index.html`:
- Textos de **Sobre mí** (sección `#sobre-mi`).
- Links de **Contacto** (sección `#contacto`).
- Precios (sección `#precios`) si querés mostrarlos.

En `script.js`:
- Cambiar el email por defecto del `mailto:`.

## Nota sobre tu CV

Me pasaste `CV_Agustin_Rodriguez.pdf`, pero actualmente está fuera del workspace. Para que yo lo lea y complete el contenido automáticamente:

- Copialo dentro de esta carpeta: `Mi pag WEB/`.

Con eso puedo extraer:
- experiencia
- skills
- certificaciones/educación
- info de contacto

y reemplazar los placeholders.
