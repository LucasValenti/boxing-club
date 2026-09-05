# Alanis Boxing Club

Landing page del gimnasio de boxeo Alanis Boxing Club, en Rosario. HTML + CSS +
JavaScript, sin build: se abre y se edita en VS Code.

**Estado:** etapa 1 de 3. Están los wireframes, la arquitectura y el esqueleto
del sitio. Faltan diez de las trece secciones y todo el contenido real —
ver `docs/contenido-pendiente.md`.

## Cómo levantarlo

```
npm install     # la primera vez
npm run dev     # levanta el sitio igual que en producción
```

También sirve la extensión *Live Server* de VS Code: clic derecho sobre
`public/index.html` → "Open with Live Server". No hace falta compilar nada.

## Cómo publicar

```
npm run deploy
```

Sube el contenido de `public/` a Cloudflare. La primera vez pide autorizar la
cuenta con `npx wrangler login`.

## Archivos

Todo lo que se publica vive en `public/`. Lo de afuera es documentación,
configuración y herramientas.

### El sitio

- `public/index.html` — la página entera. El contenido está en el HTML, no lo
  arma un programa: es lo que hace que Google la lea y que abra rápido.
  Hoy tiene el header, la primera pantalla y la cinta ya hechos; las otras diez
  secciones son cáscaras rotuladas que citan su parte de `docs/diseno/SECCIONES.md`.
- `public/styles.css` — solo `@import`s. Un archivo nuevo se agrega acá.
- `public/tokens/` — `colors.css`, `typography.css`, `layout.css`, `motion.css`
  y `fonts.css`: la paleta, la escala tipográfica, los espaciados y las cinco
  animaciones. Los valores son los del diseño, sin redondear.
- `public/base/reset.css` — normalización mínima y el foco visible.
- `public/sitio/datos.js` — **el archivo que más vas a tocar.** La constante
  `NEGOCIO`: teléfono, WhatsApp, dirección, email y horarios. Es el único lugar
  del sitio donde viven esos datos.
- `public/sitio/sitio.css` — los estilos de las secciones, en orden vertical.
- `public/sitio/app.js` — las tres cosas que hace el JavaScript: estampar los
  datos de contacto, revelar al hacer scroll y abrir el menú en el celular.
- `public/img/` — fotos del gimnasio (todavía vacía).

### Documentación

- `docs/arquitectura.md` — por qué el sitio está hecho así: el stack, las tres
  decisiones que lo definen, accesibilidad, peso y búsqueda local.
- `docs/contenido-pendiente.md` — la lista de lo que hay que pedirle al cliente.
  **Empezá por acá si volvés después de un tiempo.**
- `docs/propuesta.html` — la presentación para el cliente.
- `docs/wireframes/` — los artboards del canvas de wireframes (`.dc.html`) y
  `wireframes-alanis-boxing.html`, el canvas armado.
- `docs/diseno/` — el handoff del diseño, tal como llegó. `SECCIONES.md` es la
  spec sección por sección y manda cuando algo no cierra;
  `preview-standalone.html` se abre con doble clic y muestra el resultado
  buscado. `support.js` y el `.dc.html` son de la herramienta de diseño: no se
  portan.

## Dónde agregar cosas

| Querés… | Archivo |
| --- | --- |
| Cambiar el teléfono, la dirección o los horarios | `public/sitio/datos.js` (`NEGOCIO`) |
| Construir una de las secciones que faltan | `public/index.html` + `public/sitio/sitio.css` |
| Cambiar colores o tipografías | `public/tokens/colors.css`, `typography.css` |
| Ajustar una animación | `public/tokens/motion.css` |
| Saber cómo va una sección | `docs/diseno/SECCIONES.md` |

## Herramientas

`herramientas/` no se publica: son scripts para revisar el sitio con un
navegador de verdad (Playwright + axe-core). Necesitan el servidor de pruebas
levantado en otra terminal:

```
node herramientas/servidor.mjs      # sirve public/ en el puerto 8788
node herramientas/auditoria.mjs     # accesibilidad en 320, 390, 768 y 1440
node herramientas/contacto.mjs      # prueba que el contacto salga todo de NEGOCIO
```

`auditoria.mjs` corre una vez más con «reducir movimiento» activado y deja una
captura de cada variante. Termina con código 1 si encuentra algo, así sirve
antes de publicar. `CHROMIUM=/ruta/al/chrome` usa un navegador ya instalado en
vez de bajar el de Playwright.

## Para más adelante

Si el sitio crece a varias páginas o entra un blog, conviene migrar a Astro: el
CSS y el markup pasan casi tal cual. Mientras sea una sola página, el build
cuesta más de lo que aporta — está explicado en `docs/arquitectura.md`.
