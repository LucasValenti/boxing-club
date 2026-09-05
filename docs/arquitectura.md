# Arquitectura

Documento técnico del sitio de Alanis Boxing Club. Para la versión que ve el
cliente, ver `propuesta.html`.

## Qué es esta pieza

Una landing de una sola página cuyo único objetivo es que alguien escriba por
WhatsApp con el gancho de la primera clase gratis. No hay catálogo, ni cuentas,
ni pagos, ni contenido que cambie solo. Todo lo que sigue se decide contra eso.

Las dos restricciones que mandan:

1. **Búsqueda local.** «gimnasio de boxeo rosario» se busca en Google y se
   decide en dos minutos. El contenido tiene que estar en el HTML.
2. **Mobile con datos móviles.** El público entra desde Instagram, en la calle.
   Si tarda, se va antes de leer el precio.

## Stack

**HTML, CSS y JavaScript escritos a mano. Sin build.** Se abre en VS Code, se
publica con `npm run deploy` a Cloudflare, y lo que hay en `public/` es
exactamente lo que se sirve.

Es el mismo flujo de trabajo de GEA Insumos —wrangler, tokens en CSS, datos en
un `.js` plano— con una diferencia deliberada: **acá no hay React ni Babel.**

GEA compila JSX en el navegador de quien visita. Para una tienda con carrito y
estado eso se banca; para esta página cuesta las dos cosas que necesita:

- El contenido no estaría en el HTML. Google ve una página vacía y el `<title>`.
- Son ~300 KB de librerías y casi un segundo de compilación antes del primer
  pixel, en la pieza donde la velocidad en mobile es el requisito.

Lo que queda de JavaScript son unas 90 líneas en `public/sitio/app.js`, y la
página se lee entera aunque no carguen.

### Por qué no Astro

Astro sería la opción de manual y el handoff la recomienda. Se descartó por una
razón de mantenimiento, no técnica: mete un build, `node_modules` y una versión
que se pudre entre encargo y encargo. Para trece bloques de HTML que van a
cambiar tres veces por año, el costo de tenerlo vivo es mayor que el beneficio.
Si el sitio crece a varias páginas o entra un blog, ahí sí conviene migrar — el
CSS y el markup pasan casi tal cual.

## Estructura

```
public/
├─ index.html          la página entera, contenido incluido
├─ styles.css          solo @imports
├─ tokens/
│  ├─ fonts.css        las cuatro familias, desde Google Fonts
│  ├─ colors.css       la paleta y las líneas
│  ├─ typography.css   la escala fluida
│  ├─ layout.css       paddings, la grilla de líneas
│  └─ motion.css       los cinco keyframes y prefers-reduced-motion
├─ base/reset.css
├─ sitio/
│  ├─ datos.js         NEGOCIO: el único lugar con datos de contacto
│  ├─ sitio.css        los estilos de las secciones
│  └─ app.js           estampar datos · reveal · menú mobile
├─ img/
└─ assets/favicon.svg
```

`styles.css` importa y nada más, igual que en GEA. Un archivo nuevo se agrega
ahí y en ningún otro lado.

### La grilla de líneas

El recurso visual que sostiene toda la página: las grillas no se separan con
`gap`, se separan con líneas de 1px. El contenedor pinta la línea, cada celda
tapa con el fondo. Está en `tokens/layout.css` como `.grilla-lineas` y se repite
en el hero, en las stats y en las clases. Radio de borde 0 y sombras ninguna, en
todo el sitio, sin excepción.

## Las tres decisiones que definen el sitio

### 1. Los datos de contacto viven en una constante

El prototipo tenía el teléfono escrito a mano en cuatro lugares, y ninguno de
esos valores está confirmado por el cliente. Ahora están en `NEGOCIO`
(`sitio/datos.js`) y el HTML marca los destinos con `data-negocio`:

```html
<a href="https://wa.me/5493415632194" data-negocio="whatsapp">Escribinos</a>
```

`app.js` los completa al cargar. El valor también está escrito en el markup, así
que si el JS no corre el link igual funciona: el JS actualiza, no habilita.

Cambiar el teléfono es cambiar una línea. Va a pasar.

### 2. El formulario no tiene backend

Los campos arman un mensaje y abren WhatsApp con el texto ya escrito. Cero
servidor, cero base de datos, cero mantenimiento, y la consulta llega al canal
que este público ya usa — el handoff es explícito en que WhatsApp convierte
mejor acá.

Si el cliente además quiere el aviso por mail, se agrega un Cloudflare Worker
que reciba el POST y lo reenvíe. Es media hora de trabajo y no cambia nada de lo
demás: por eso se deja para cuando lo pidan, no antes.

### 3. El mapa está apagado hasta que confirmen la dirección

Hoy: la dirección en texto y un link a Google Maps. Cuando el cliente confirme,
se enciende el `<iframe>` con `loading="lazy"` —pesa unos 700 KB y no puede
estar en la carga inicial— o, mejor, una imagen estática del mapa que abre Maps
al tocarla. El mapa no bloquea el lanzamiento.

## Accesibilidad

### El hover rojo de las tarjetas no pasa la norma

`SECCIONES.md` §5 dice que al pintarse de rojo la tarjeta *«el texto no cambia de
color, gana contraste solo»*. Medido, pierde:

| Texto sobre `#E2231A` | Ratio | Norma AA |
|---|---|---|
| Párrafo `#c9c5be` | **2.72:1** | falla incluso como texto grande |
| Número y meta `#8a8781` | **1.31:1** | prácticamente invisible |
| Título `#f4f1ec` | 4.15:1 | pasa solo por ser grande |
| Blanco `#ffffff` | 4.68:1 | pasa |

**Corrección:** sobre rojo el texto pasa a `--sobre-rojo` (blanco) y
`--sobre-rojo-mudo`. Los tokens ya existen en `tokens/colors.css`. No cambia el
layout ni la idea del gesto: solo los colores de ese estado.

### El rojo como texto es solo para tamaño grande

`#E2231A` sobre `#0b0b0b` da **4.21:1**: alcanza para el H1 y los títulos, no
para texto chico. La clase `.acento` existe para eso. El resto de la paleta pasa
AA con holgura (hueso 17.5:1, párrafos 11.5:1, rótulos mono 5.5:1).

### Movimiento

Tres de las cinco animaciones son bucles infinitos: el zoom del hero, la
marquesina y el punto que late. Con `prefers-reduced-motion` se apagan todas y el
contenido queda visible —nunca escondido esperando un reveal que ya no llega.
Está en `tokens/motion.css` y lo cubre `herramientas/auditoria.mjs`.

### Lo que el diseño resuelve solo con el mouse

Dos gestos del prototipo no existen en una pantalla táctil, que es por donde va
a entrar la mayoría:

- **La foto que recupera el color en hover.** En mobile las fotos van en color
  directamente, o la primera de la tira arranca en color.
- **La tarjeta que se pinta de rojo.** En mobile la tarjeta activa es la que
  está centrada en pantalla, o simplemente no hay estado.

Además: foco visible en todo lo tabulable, salto al contenido, y en mobile los
botones ocupan el ancho para pasar los 44px de área táctil.

## Rendimiento

Presupuesto: **menos de 500 KB en la primera vista** y el LCP por debajo de 2,5s
en una conexión móvil promedio.

| | |
|---|---|
| HTML + CSS + JS | ~25 KB — es todo texto propio |
| Fuentes | 4 familias con `display=swap` y `preconnect`. **Conviene autohospedarlas — ver abajo** |
| Foto del hero | el LCP. `fetchpriority="high"`, medidas explícitas, nunca lazy |
| Resto de las fotos | `loading="lazy"`, WebP, con `width`/`height` para que no salte el layout |

Las fotos reales del cliente se procesan con `sharp` antes de entrar al repo. En
GEA el mismo paso llevó la carga de 7 MB a 762 KB; acá la ganancia es del mismo
orden.

### Las fuentes deberían estar en el repo, no en Google

Probando el esqueleto en una red que bloquea Google Fonts se vio el problema
completo: sin el CSS de Google no hay `@font-face`, el H1 cae a una sans ancha y
«Ponete los guantes» —dos líneas en el diseño— se desarma en tres. El titular es
la página entera, y depende de un tercero que puede tardar o no estar.

Autohospedarlas arregla las dos cosas: saca una conexión a otro dominio del
camino crítico (que es justo lo que castiga el LCP) y hace que el diseño no
dependa de nadie. Las cuatro familias son de licencia libre (SIL OFL), así que
se pueden guardar en el repo sin problema.

Cómo: bajar los `.woff2` del subconjunto latino a `public/fonts/`, escribir los
`@font-face` en `tokens/fonts.css` con `font-display:swap`, y precargar solo el
de Big Shoulders 900 —el del H1—. Son unos 8 archivos y menos de 100 KB en
total. **Es la primera tarea de la fase 2.**

## Búsqueda local

- `SportsActivityLocation` en JSON-LD con dirección, teléfono y horarios. Es lo
  que le dice a Google que esto es un gimnasio de Rosario. **No publicar hasta
  confirmar los datos.**
- `FAQPage` cuando entre la sección de preguntas: puede ganar resultado ampliado.
- `<title>` y `description` con «boxeo» + «Rosario»; `lang="es-AR"`.
- Imagen de Open Graph: para este público, el link pegado en WhatsApp es la
  primera impresión más frecuente, antes que Google.
- Fuera del sitio, y es lo que más mueve: la ficha de Google Business.

## Publicación

```
npm install     # la primera vez
npm run dev     # levanta el sitio igual que en producción
npm run deploy  # sube public/ a Cloudflare
```

Sin build: lo que hay en `public/` es lo que se sirve. `not_found_handling` está
en `404-page` y no en modo aplicación —es una sola página con anclas, y una
dirección que no existe tiene que devolver 404 de verdad, que es lo que Google
espera.

## Auditoría

```
node herramientas/servidor.mjs      # en una terminal
node herramientas/auditoria.mjs     # en otra
```

Pasa axe-core en 320, 390, 768 y 1440, y una vez más con movimiento reducido.
Deja una captura de cada variante y termina con código 1 si encuentra algo, así
sirve en un hook antes de publicar.

## Estado

Portados: header, hero y marquesina. Las otras diez secciones son cáscaras
rotuladas en `index.html` que citan su parte de `SECCIONES.md`. La fase 2 es
reemplazarlas de arriba hacia abajo.
