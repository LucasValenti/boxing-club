# Alanis Boxing Club

Landing page del gimnasio de boxeo Alanis Boxing Club, en Rosario. HTML + CSS +
JavaScript, sin build: se abre y se edita en VS Code.

**Estado:** etapa 2 de 3. Las trece secciones están construidas y la página
funciona de punta a punta. Lo que falta es contenido del club: fotos, precios,
horarios y datos de contacto confirmados — ver `docs/contenido-pendiente.md`.

## Cómo levantarlo

```
npm install     # la primera vez
npm run dev     # levanta el sitio igual que en producción
```

También sirve la extensión *Live Server* de VS Code: clic derecho sobre
`public/index.html` → "Open with Live Server". No hace falta compilar nada.

## Cómo publicar

```
npm test        # las cuatro pruebas, en un solo comando
npm run deploy  # sube public/ a Cloudflare
```

`npm run deploy` corre `npm test` solo antes de subir —es el `predeploy` del
`package.json`— así que no se puede publicar con una prueba en rojo. La primera
vez pide autorizar la cuenta con `npx wrangler login`.

## Archivos

Todo lo que se publica vive en `public/`. Lo de afuera es documentación,
configuración y herramientas.

### El sitio

- `public/index.html` — la página entera, las trece secciones. El contenido
  está en el HTML, no lo arma un programa: es lo que hace que Google la lea y
  que abra rápido. Adentro también van los dos bloques de datos estructurados
  (el del gimnasio y el de las preguntas frecuentes).
- Los siete archivos de estilo se enlazan uno por uno desde el `<head>` de
  `index.html`, en orden de cascada. Uno nuevo se agrega ahí. No hay un
  `styles.css` que los importe: un `@import` no se descubre hasta que el
  navegador bajó y parseó el archivo que lo contiene, y eso dejaba a las
  tipografías a tres saltos del HTML.
- `public/tokens/` — `colors.css`, `typography.css`, `layout.css`, `motion.css`
  y `fonts.css`: la paleta, la escala tipográfica, los espaciados y las cinco
  animaciones. Los valores son los del diseño, sin redondear.
- `public/fonts/` — las tres tipografías, servidas desde acá y no desde Google.
  Son variables: un archivo por familia cubre todos los pesos. 80 KB en total.
- `public/base/reset.css` — normalización mínima y el foco visible.
- `public/sitio/datos.js` — **el archivo que más vas a tocar.** La constante
  `NEGOCIO` (teléfono, WhatsApp, dirección, email y horarios: el único lugar del
  sitio donde viven esos datos) y `MOSTRAR`, los interruptores que encienden y
  apagan secciones enteras.
- `public/sitio/sitio.css` — los estilos de las secciones, en orden vertical.
- `public/sitio/app.js` — todo el JavaScript del sitio: los interruptores de
  sección, los datos de contacto, el revelado al hacer scroll, el menú del
  celular y el formulario que arma el mensaje de WhatsApp.
- `public/img/` — fotos del gimnasio (todavía vacía).

### Documentación

- `docs/arquitectura.md` — por qué el sitio está hecho así: el stack, las tres
  decisiones que lo definen, accesibilidad, peso y búsqueda local.
- `docs/auditoria-tecnica.md` — la auditoría técnica sobre lo construido: los
  doce hallazgos abiertos, la corrección de cada uno y en qué orden conviene
  hacerlos. Empezá por el plan de trabajo del final.
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
| Encender o apagar una sección entera | `public/sitio/datos.js` (`MOSTRAR`) |
| Cambiar textos, precios o preguntas | `public/index.html` |
| Cambiar colores o tipografías | `public/tokens/colors.css`, `typography.css` |
| Ajustar una animación | `public/tokens/motion.css` |
| Saber cómo va una sección | `docs/diseno/SECCIONES.md` |

## Herramientas

`herramientas/` no se publica. Se corre todo junto con:

```
npm test
```

que levanta el servidor de pruebas, pasa las cuatro y lo baja. Termina con
código 1 si algo falla, así sirve en un hook y en `predeploy`.

| Prueba | Qué mira | Necesita |
| --- | --- | --- |
| `validar.mjs` | anclas, `data-negocio`, JSON-LD, dominio, terceros y peso | nada: node pelado |
| `contacto.mjs` | que el contacto salga todo de `NEGOCIO` | navegador |
| `interaccion.mjs` | teclado, menú del celular y formulario | navegador |
| `contraste.mjs` | el texto que va sobre una foto, midiendo los píxeles | navegador |
| `auditoria.mjs` | accesibilidad en 320, 390, 768, 1440 y sin movimiento | navegador |

`validar.mjs` no depende de nada: corre en un clon recién bajado, antes de
`npm install`. Las otras tres necesitan Chromium — `npx playwright install
chromium` la primera vez, o `CHROMIUM=/ruta/al/chrome` para usar uno que ya
tengas. `auditoria.mjs` deja una captura de cada variante.

Y una herramienta que no es una prueba:

```
npm run imagenes    # herramientas/fotos-crudas/*.jpg → public/img/*.webp
```

Procesa las fotos del club a WebP en tres anchos (400, 800 y 1600). Los
originales van en `herramientas/fotos-crudas/`, que no se versiona.

## Para más adelante

Si el sitio crece a varias páginas o entra un blog, conviene migrar a Astro: el
CSS y el markup pasan casi tal cual. Mientras sea una sola página, el build
cuesta más de lo que aporta — está explicado en `docs/arquitectura.md`.
