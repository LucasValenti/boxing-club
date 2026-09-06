# Auditoría técnica y plan de endurecimiento

Revisión del sitio construido, contra las prácticas actuales de frontend, SEO,
accesibilidad y seguridad. No reemplaza a `arquitectura.md` —que explica *por
qué* el sitio está hecho así y sigue vigente— sino que lo audita: qué decisiones
se sostienen, qué falta, y en qué orden conviene arreglarlo.

**Veredicto corto:** la arquitectura es la correcta para esta pieza y no hay que
tocarla. Los doce hallazgos que siguen son de terminación, no de diseño. Tres se
arreglan en una tarde, y dos de esos tres son los que más mueven la aguja.

> **Estado al 6 de septiembre de 2026 — once de los doce cerrados.** Se
> aplicaron las tandas 1 y 3, y `npm test` pasa en verde —validación,
> contacto, interacción y axe en cinco variantes— tanto en local como en CI,
> en cada push. El único hallazgo abierto es el **8**: falta `og:image`, que
> necesita una foto del club. La tanda 2 entera depende de contenido que el
> club todavía no entregó, y de monitoreo sigue faltando la analítica, que
> pide un token del panel de Cloudflare.
>
> Se midió el LCP real contra el sitio ya publicado (§6): 3,6–3,8s bajo un
> perfil de 4G simulado, por encima del presupuesto de 2,5s. La causa está
> identificada y no es del código — es la foto de banco de Unsplash, que
> pesa 545 KB contra los ~145 KB que va a pesar la foto real procesada.
>
> Y apareció un bloqueante nuevo que no es de código: **el dominio no está
> definido**, y el `canonical` que se agregó apunta a un marcador. Un
> canonical mal apuntado es peor que ninguno, así que hoy el sitio no se
> puede publicar sin resolverlo. Ver `contenido-pendiente.md` §1.

---

## 1. Resumen de la solución

### Qué es y contra qué se decide

Una landing de una sola página cuyo único trabajo es que alguien escriba por
WhatsApp, con el gancho de la primera clase gratis. Sin catálogo, sin cuentas,
sin pagos, sin contenido que cambie solo.

Dos restricciones mandan sobre todas las demás:

1. **Búsqueda local.** «gimnasio de boxeo <ciudad>» se busca y se decide en dos
   minutos. El contenido tiene que estar en el HTML servido, no armado por JS.
2. **Mobile con datos móviles.** El público entra desde Instagram, en la calle.
   Si tarda, se fue antes de leer el precio.

Todo lo que sigue se justifica contra esas dos, y cuando una práctica «de
manual» las contradice, gana la restricción.

### Requisitos funcionales

| | |
|---|---|
| Contar la propuesta | trece secciones, contenido en el HTML |
| Convertir | WhatsApp con el mensaje ya escrito, en cuatro lugares |
| Formulario de reserva | cuatro campos, sin servidor: arma el texto y abre WhatsApp |
| Publicar incompleto | secciones que se apagan mientras falte el dato del club |
| Editar sin programar | teléfono, dirección y horarios en un solo archivo |

### Requisitos no funcionales

| | Objetivo | Estado |
|---|---|---|
| Peso de la primera vista | < 500 KB | ✓ 146,8 KB propios, medidos por `validar.mjs` en cada `npm test` |
| LCP en 4G | < 2,5 s | medido: 3,6–3,8s. La cascada (hallazgo 1) ya no es la causa — es la foto de banco, ver §6 |
| Accesibilidad | WCAG 2.1 AA | ✓ axe en 5 variantes, más el recorrido con teclado |
| Sin JavaScript | la página se lee entera | ✓ resuelta la excepción del hallazgo 7 |
| Cabeceras de seguridad | — | ✓ en `public/_headers`, confirmadas en el sitio publicado con `curl` |

### Los doce hallazgos, por impacto

| # | Hallazgo | Área | Impacto | Estado |
|---|---|---|---|---|
| 1 | `styles.css` es solo `@import`: cascada de 3 saltos hasta las fuentes | Rendimiento | **Alto** | ✓ cerrado |
| 2 | Sin `_headers`: no hay CSP ni ninguna cabecera de seguridad | Seguridad | **Alto** | ✓ cerrado |
| 3 | Sin `<link rel="canonical">`: `workers.dev` y el dominio compiten | SEO | **Alto** | ✓ cerrado |
| 4 | Sin `robots.txt` ni `sitemap.xml` | SEO | Medio | ✓ cerrado |
| 5 | Sin `preconnect` a Unsplash, que hoy sirve el LCP | Rendimiento | Medio | ✓ cerrado |
| 6 | Sin build no hay cache-busting: el CSS no se puede cachear fuerte | Rendimiento | Medio | ✓ cerrado |
| 7 | La sección apagada viaja en el HTML y se ve sin JS | Contenido | Medio | ✓ cerrado |
| 8 | Falta `og:image` y `og:url` — WhatsApp es la primera impresión | SEO social | Medio | parcial — falta la foto |
| 9 | `sharp` está instalado pero no hay herramienta de imágenes | Mantenimiento | Medio | ✓ herramienta escrita |
| 10 | `datos.js` sin `defer` bloquea el parser | Rendimiento | Bajo | ✓ cerrado |
| 11 | `window.open` puede bloquearse y el aviso miente | UX | Bajo | ✓ cerrado |
| 12 | Pruebas sin CI, sin validar HTML ni JSON-LD, servidor manual | Calidad | Medio | ✓ cerrado |

### Riesgos, dependencias y cuellos de botella

**El cuello de botella no es técnico: es el contenido.** `contenido-pendiente.md`
lista cinco datos que bloquean el lanzamiento y ninguno depende de código. El
sitio está listo antes que el material. Eso está bien resuelto —los interruptores
de `MOSTRAR` permiten publicar incompleto— pero conviene decirlo: **acelerar el
código no adelanta la fecha de salida.**

Riesgos reales, en orden:

- **Datos de una persona real sin verificar.** «El rincón» afirmaba un récord
  profesional, una medalla continental y un título, atribuidos a dos personas
  con nombre y apellido y sacados de fuentes públicas sin que el club los
  confirmara. Era el único riesgo del proyecto con consecuencias fuera de la
  pantalla: una afirmación verificable sobre alguien identificable no se
  publica porque «figura en internet».
  **Resuelto de raíz al pasar el sitio a plantilla:** la sección se reescribió
  con texto que no afirma nada verificable y sirve para cualquier club, así que
  volvió a encenderse. El interruptor `mostrarLinaje` sigue existiendo, pero ya
  no está tapando un problema. Si un club quiere nombrar a alguien, vuelve a
  aplicar la regla — ver `docs/contenido-pendiente.md`.
- **Fotos de banco en producción.** Cinco imágenes de Unsplash presentadas como
  «el gimnasio». Los `alt` **ya se hicieron genéricos** —describen lo que se ve
  sin afirmar que sea este club— pero las fotos siguen sin ser del gimnasio, y
  eso no lo arregla el texto alternativo.
- **Dependencia de un tercero en el camino crítico.** El LCP hoy lo sirve
  `images.unsplash.com`. Se va cuando entren las fotos reales, pero hasta
  entonces el tiempo de carga depende de un CDN ajeno sin `preconnect`.
- **Un solo canal de conversión.** Todo apunta a un WhatsApp que —según el
  propio `contenido-pendiente.md`— no se sabe quién lee ni en qué horario. Es
  una decisión de negocio, pero el sitio no tiene plan B si nadie contesta.
- **Deriva del `.woff2`.** Las tres fuentes están en el repo con licencia OFL.
  Es lo correcto, y también significa que nadie las va a actualizar nunca. No
  es un problema: es una consecuencia a registrar.

### Supuestos declarados

Donde falta información, asumo lo siguiente y lo dejo escrito para que se
corrija en vez de descubrirse tarde:

1. **El dominio final todavía no está definido.** Uso
   `https://example.com` como marcador en todos los ejemplos. Hay
   que reemplazarlo en `canonical`, `og:url`, `robots.txt` y `sitemap.xml` — son
   cuatro lugares y conviene hacerlos de una sola vez.
2. **El sitio se sirve con Cloudflare Workers Assets**, según `wrangler.jsonc`.
   El archivo `_headers` es el mecanismo de cabeceras de esa plataforma;
   conviene verificar en el primer deploy que efectivamente se aplican
   (`curl -I`), porque una cabecera que no llega no avisa.
3. **El formulario no guarda ningún dato.** No hay base, ni backend, ni
   analítica con cookies. Eso no es solo simplicidad técnica: elimina la
   superficie de la ley 25.326 de datos personales. Si algún día el formulario
   pasa a guardar consultas, esa obligación aparece y hay que tratarla.
4. **No hay CI configurado.** Las recomendaciones de la sección 9 asumen que el
   repo puede ir a GitHub; si se queda local, valen igual como hook de pre-push.

---

## 2. Arquitectura recomendada

**La misma que ya está.** No es conformismo: es el resultado de evaluarla contra
las dos restricciones del proyecto.

```
Navegador
   │
   │  GET /
   ▼
Cloudflare (borde, ~200 ciudades)
   │
   ├─ index.html ......... 508 líneas, el contenido y los siete <link>
   ├─ los siete CSS ...... tokens/, base/reset.css y sitio/sitio.css
   ├─ sitio/datos.js ..... NEGOCIO y MOSTRAR
   ├─ sitio/app.js ....... 163 líneas: flags, datos, reveal, menú, form
   ├─ fonts/*.woff2 ...... 3 archivos, 80 KB
   └─ img/*.webp ......... las fotos del club
   │
   ▼
No hay origen. No hay build. No hay base de datos.
Lo que está en public/ es exactamente lo que se sirve.
```

La conversión sale del sitio por un link `wa.me`. No hay servidor que mantener,
ni que parchear, ni que pagar, ni que se caiga un domingo.

### Por qué se sostiene

Una arquitectura se juzga por lo que hace fácil y por lo que hace imposible.
Esta hace fácil las tres cosas que el proyecto necesita —que Google lea el
contenido, que abra rápido en un celular, que un cambio de teléfono sea una
línea— y hace imposible una sola que el proyecto no necesita: contenido
dinámico.

Tres decisiones concretas que vale la pena ratificar:

**El contenido está en el HTML servido.** No es una preferencia estilística: es
el requisito 1. Un sitio que arma su contenido en el cliente le entrega a Google
un `<title>` y un `<div>` vacío en el primer pase.

**Los datos de contacto viven en una constante y el HTML los repite.** El patrón
de `datos.js` + `data-negocio` es el correcto y está bien ejecutado, porque el
valor **también está escrito en el markup**: el JS actualiza, no habilita. Si
`app.js` no corre, los links funcionan igual. Eso es mejora progresiva de
verdad, no la versión declamada.

**El formulario no tiene backend.** Arma el texto y abre WhatsApp. Cero
servidor, cero base, cero mantenimiento, y la consulta llega al canal que este
público ya usa.

### Qué la haría cambiar

Vale registrar los disparadores, para no discutirlo de nuevo dentro de un año:

| Si pasa esto… | …la arquitectura cambia a |
|---|---|
| Entra un blog, o pasa de 3 páginas | Astro. El CSS y el markup pasan casi tal cual |
| El club quiere el aviso por mail además de WhatsApp | un Worker que reciba el POST y reenvíe |
| Aparecen turnos, cupos o pagos | ahí sí hace falta backend y base |
| Nada de eso | se queda como está, y está bien |

---

## 3. Tecnologías sugeridas y justificación

La regla del encargo —recomendar tecnología solo cuando aporte una ventaja
clara— aplicada acá da un resultado inusual: **no recomiendo agregar ninguna.**
Lo que sigue justifica lo que hay y, sobre todo, lo que se descartó.

| Pieza | Elección | Por qué |
|---|---|---|
| Markup | HTML escrito a mano | El contenido tiene que estar servido. 508 líneas se leen enteras |
| Estilos | CSS moderno con tokens | `clamp()`, grid con `auto-fit`, custom properties. Sin preprocesador: no hay nada que preprocesar |
| Comportamiento | 182 líneas de JS, sin framework | Cinco funciones independientes. Un framework acá es andamiaje sin obra |
| Tipografías | 3 variables, propias, OFL | Un archivo por familia cubre todos los pesos |
| Hosting | Cloudflare Workers Assets | Estático en el borde, sin origen, sin costo a este volumen |
| Pruebas | Playwright + axe-core | Navegador de verdad. Es lo único que detecta lo que importa acá |
| Imágenes | `sharp`, fuera de línea | Se procesan una vez y entran al repo ya optimizadas |

### Las tres cosas que se descartaron, y por qué

**React.** Es lo que usa el proyecto hermano (GEA Insumos), así que la tentación
de reusar el flujo es real. Para una tienda con carrito y estado se banca. Acá
cuesta exactamente las dos cosas que el sitio necesita: el contenido deja de
estar en el HTML, y son ~300 KB más casi un segundo de compilación en el
navegador de la persona antes del primer pixel. En la pieza donde la velocidad
en mobile *es* el requisito, es un mal negocio.

**Astro.** Sería la opción de manual, y un revisor externo la va a recomendar.
Se descarta por mantenimiento, no por técnica: mete un build, `node_modules` y
una versión que se pudre entre encargo y encargo. Para trece bloques de HTML que
cambian tres veces por año, tenerlo vivo cuesta más de lo que aporta. **Es una
decisión con fecha de revisión, no permanente** — ver la tabla de disparadores.

**Un preprocesador de CSS.** Los tokens en custom properties ya dan variables, y
el anidado nativo ya está en todos los navegadores objetivo. No queda función
que justifique la dependencia.

### Ninguna, y así quedó

Cero en producción, y cero nuevas en desarrollo. La primera versión de este
informe recomendaba `html-validate`; al escribir las pruebas quedó claro que no
hacía falta. Lo que rompe este sitio no es HTML inválido en abstracto: es un
ancla sin destino, un `data-negocio` que `NEGOCIO` no define, un JSON-LD con
una coma de más, un comentario sin cerrar. Nada de eso lo encuentra un
validador genérico, y todo lo encuentra `herramientas/validar.mjs`, que son
150 líneas de node pelado y corre en un clon recién bajado, antes de instalar
nada.


---

## 4. Estructura de carpetas y componentes

La estructura actual es correcta y la documenta el `README`. Lo que sigue es
solo **lo que le agrego**, marcado con `+`:

```
public/                     lo que se publica, tal cual
├─ index.html               la página entera, contenido incluido
├─ tokens/
│  ├─ fonts.css             las tres familias, desde este dominio
│  ├─ colors.css            la paleta, con los ratios de contraste medidos
│  ├─ typography.css        la escala fluida
│  ├─ layout.css            paddings y la grilla de líneas
│  └─ motion.css            los cinco keyframes y prefers-reduced-motion
├─ base/reset.css           normalización mínima, foco visible, salto
├─ sitio/
│  ├─ datos.js              NEGOCIO y MOSTRAR — el único lugar con los datos
│  ├─ sitio.css             los estilos de las secciones, en orden vertical
│  └─ app.js                flags · datos · reveal · menú · formulario · año
├─ fonts/                   3 .woff2 variables + LICENCIA.txt
├─ img/                     las fotos del club (hoy vacía)
├─ assets/favicon.svg
├─ _headers                 CSP, cabeceras de seguridad y caché
├─ robots.txt               y el puntero al sitemap
└─ sitemap.xml              una sola URL, pero explícita

herramientas/               no se publica
├─ servidor.mjs             sirve public/ en :8788 para las pruebas
├─ auditoria.mjs            axe en 320 · 390 · 768 · 1440 · sin movimiento
├─ contacto.mjs             que el contacto salga todo de NEGOCIO
├─ imagenes.mjs             las fotos del club → WebP, con sharp
├─ validar.mjs              HTML, datos, búsqueda y peso · sin dependencias
├─ interaccion.mjs          teclado, menú y formulario
└─ pruebas.mjs              levanta el servidor y corre todo (npm test)

docs/                       arquitectura, contenido pendiente, diseño
```

### Los «componentes», sin framework

No hay componentes en el sentido de React, y no hacen falta. Lo que sí hay —y
conviene nombrar, porque es lo que mantiene el orden— son **cuatro convenciones
que sostienen todo el sitio**:

| Convención | Qué hace | Dónde vive |
|---|---|---|
| `data-negocio="campo"` | el nodo recibe un dato de `NEGOCIO` | `app.js` → `estampar()` |
| `data-flag="nombre"` | la sección desaparece si `MOSTRAR.nombre` no es `true` | `app.js` → `flags()` |
| `data-reveal` | aparece al entrar en pantalla, en cascada de a cuatro | `app.js` → `revelar()` |
| `.grilla-lineas` | separación con líneas de 1px, no con `gap` | `tokens/layout.css` |

Esas cuatro son la API interna del sitio. Un bloque nuevo se escribe en HTML
plano y se engancha con esos atributos: no hay que tocar JS. **Es exactamente la
propiedad que da un sistema de componentes, conseguida sin el costo de uno.**
Vale la pena que estén en el `README` como tabla, porque hoy hay que deducirlas
leyendo `app.js`.

---

## 5. Ejemplos de código

Las correcciones concretas de los hallazgos, en orden de impacto. Todas respetan
la restricción de origen: **sin build, sin dependencias nuevas en producción.**

### 5.1 · Hallazgo 1 — romper la cadena de `@import`

Es el hallazgo más importante del informe y el más barato de arreglar.

Hoy `public/styles.css` es solo esto:

```css
@import url("./tokens/fonts.css");
@import url("./tokens/colors.css");
/* …cinco más */
```

El navegador no puede descubrir esos siete archivos hasta que **descargó y
parseó** `styles.css`. Y como los `@font-face` viven adentro de
`tokens/fonts.css`, la cadena real hasta una tipografía es de tres saltos:

```
index.html  →  styles.css  →  tokens/fonts.css  →  chivo-latin.woff2
   salto 1        salto 2           salto 3
```

Todo eso es render-blocking y es serial: HTTP/2 no ayuda, porque el problema no
es la cantidad de conexiones sino que el navegador **todavía no sabe** que esos
archivos existen. El `preload` de Big Shoulders salva al titular; Chivo y Chivo
Mono —el cuerpo entero de la página— pagan los tres saltos.

Es, además, una contradicción con el objetivo declarado del proyecto: el sitio
sacó las fuentes de Google para no depender de un tercero en el camino crítico,
y después se puso una cascada propia en el mismo lugar.

**La corrección** son siete `<link>` en el `<head>`, en el mismo orden. El
navegador los ve en el primer parse y los pide todos en paralelo:

```html
<!-- Los siete archivos, en el orden de la cascada. Van como <link> y no como
     @import dentro de styles.css: un @import no se descubre hasta que el
     archivo que lo contiene se descargó y parseó, y los @font-face quedaban
     a tres saltos del HTML. Como <link> se piden todos en el primer parse. -->
<link rel="stylesheet" href="tokens/fonts.css">
<link rel="stylesheet" href="tokens/colors.css">
<link rel="stylesheet" href="tokens/typography.css">
<link rel="stylesheet" href="tokens/layout.css">
<link rel="stylesheet" href="tokens/motion.css">
<link rel="stylesheet" href="base/reset.css">
<link rel="stylesheet" href="sitio/sitio.css">
```

`public/styles.css` se elimina. La modularidad no se pierde: son los mismos
siete archivos con los mismos nombres, y agregar uno sigue siendo una línea —
ahora en `index.html` en vez de en `styles.css`. El `README` cambia en un
renglón.

> Si más adelante entra un build, la respuesta correcta pasa a ser concatenarlos
> en un solo archivo con hash en el nombre. Mientras no lo haya, siete `<link>`
> es lo mejor disponible.

### 5.2 · Hallazgo 10 — `defer` en los dos scripts

```html
<!-- ANTES: datos.js bloquea el parser -->
<script src="sitio/datos.js"></script>
<script src="sitio/app.js" defer></script>

<!-- DESPUÉS: los dos con defer. El orden se respeta igual —los scripts con
     defer se ejecutan en el orden del documento— así que datos.js sigue
     definiendo NEGOCIO antes de que app.js lo lea. -->
<script src="sitio/datos.js" defer></script>
<script src="sitio/app.js" defer></script>
```

Están al final del `<body>`, así que el costo hoy es chico. Es correcto igual, y
es de un minuto.

### 5.3 · Hallazgo 5 — `preconnect` mientras las fotos sean de banco

El LCP de la página lo sirve `images.unsplash.com`. Abrir esa conexión (DNS +
TCP + TLS) cuesta tres vueltas de red que hoy arrancan recién cuando el parser
llega al `<img>`:

```html
<!-- ⚠ TEMPORAL. Se borra junto con la última foto de Unsplash: una vez que
     las imágenes son propias no queda ninguna conexión a terceros. -->
<link rel="preconnect" href="https://images.unsplash.com" crossorigin>
```

### 5.4 · Hallazgos 3, 4 y 8 — canonical, social y rastreo

```html
<!-- Sin esto, el sitio existe en dos direcciones a la vez: el dominio y
     <worker>.workers.dev. Para búsqueda local, competir consigo
     mismo es el peor resultado posible. -->
<link rel="canonical" href="https://example.com/">

<meta property="og:url" content="https://example.com/">
<!-- 1200×630. Para este público el link pegado en WhatsApp es la primera
     impresión más frecuente, antes que Google. Sin imagen, WhatsApp muestra
     un rectángulo gris. -->
<meta property="og:image" content="https://example.com/img/og.jpg">
<meta property="og:image:alt" content="Entrenamiento en Club de Boxeo, Tu Ciudad">
```

`public/robots.txt`:

```
User-agent: *
Allow: /

Sitemap: https://example.com/sitemap.xml
```

`public/sitemap.xml` — una sola URL, y aun así vale: le da a Google una fecha de
última modificación explícita en vez de que la infiera.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2026-09-06</lastmod>
  </url>
</urlset>
```

### 5.5 · Hallazgos 2 y 6 — cabeceras

`public/_headers`. Es el mecanismo de Cloudflare para servir cabeceras desde un
sitio estático, sin código:

```
/*
  Content-Security-Policy: default-src 'self'; img-src 'self' data: https://images.unsplash.com; font-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'none'; form-action 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; upgrade-insecure-requests
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), camera=(), microphone=(), payment=(), usb=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains

# Las fuentes nunca cambian: el nombre del archivo identifica el contenido.
/fonts/*
  Cache-Control: public, max-age=31536000, immutable

# El CSS y el JS SÍ cambian, y sin build no llevan hash en el nombre: no se
# pueden cachear un año. Una hora es el equilibrio — ver hallazgo 6.
/sitio/*
  Cache-Control: public, max-age=3600
/tokens/*
  Cache-Control: public, max-age=3600

# El HTML siempre se revalida: es lo que descubre todo lo demás.
/index.html
  Cache-Control: public, max-age=0, must-revalidate
```

Tres notas sobre esa CSP, porque cada una es una trampa conocida:

- **`style-src` lleva `'unsafe-inline'`** por el `<style>` que está dentro del
  `<noscript>` al final del `<body>`. La alternativa limpia es un hash
  (`'sha256-…'`), pero hay que recalcularlo cada vez que esa regla cambie, y se
  olvida. Para un sitio sin entrada de usuario ni contenido de terceros, el
  riesgo que cubre `'unsafe-inline'` en estilos es prácticamente nulo. Es una
  concesión consciente, no un descuido.
- **Los dos bloques JSON-LD no necesitan permiso.** `script-src` solo alcanza a
  los scripts que se *ejecutan*, y `application/ld+json` no se ejecuta. Es la
  duda que aparece siempre al poner la primera CSP; conviene igual mirar la
  consola después del primer deploy.
- **`frame-src` no está** porque hoy no hay iframes. Cuando entre el mapa hay
  que agregar `frame-src https://www.google.com`, o la CSP lo bloquea en
  silencio.

Y conviene verificar que llegaron, porque una CSP que no se aplica no avisa:

```
curl -sI https://example.com/ | grep -i 'content-security\|x-content\|referrer'
```

### 5.6 · Hallazgo 6 — versionar sin build

Sin build no hay hash en los nombres, así que `sitio.css` no puede cachearse un
año: si se cachea, un cambio no llega hasta que expire. El `max-age=3600` de
arriba es el equilibrio por defecto. Cuando se publique un cambio que tiene que
verse ya, se sube el número a mano:

```html
<link rel="stylesheet" href="sitio/sitio.css?v=4">
```

Es manual y por lo tanto se olvida — por eso el `max-age` corto es la red de
seguridad y la query string es la excepción. **Es el costo real de no tener
build, y conviene tenerlo escrito** en vez de descubrirlo con un cliente mirando
la versión vieja.

### 5.7 · Hallazgo 7 — la sección apagada viaja igual

`flags()` borra la sección en el cliente. El HTML servido la contiene igual, con
sus tres «Testimonio pendiente». Eso significa que:

- quien navega sin JS ve tres tarjetas vacías;
- lo que Google descarga en el primer pase contiene ese texto.

Contradice lo que dice `arquitectura.md` («una sección apagada se saca del
documento entero»): se saca del DOM, no del documento. Para las secciones que
están **encendidas** el mecanismo es correcto y útil. Para una que está apagada
y llena de texto de relleno, la respuesta honesta sin build es comentarla:

```html
<!-- ── 6. Testimonios ──────────────────────────────────────────────────
     APAGADA hasta que lleguen los testimonios reales. Comentada y no solo
     con data-flag: el flag se resuelve en el navegador, así que el texto de
     relleno viajaba igual en el HTML y se veía sin JavaScript.
     Para encenderla: descomentar y poner mostrarTestimonios en true.
<section class="seccion" id="testimonios" data-flag="mostrarTestimonios">
  …
</section>
── -->
```

`data-flag` se queda para `mostrarPrecios` y `mostrarLinaje`, que hoy están en
`true` y donde el mecanismo hace justo lo que promete: apagar rápido si el
cliente no confirma.

### 5.8 · Hallazgo 11 — el aviso que promete algo que no pasó

```js
/* window.open puede devolver null: un bloqueador de ventanas emergentes, o
   un navegador embebido (el de Instagram, por donde entra buena parte de
   este público). Sin esto el aviso dice «te abrimos WhatsApp» y no se abrió
   nada, que es la peor forma de perder una consulta ya escrita. */
var ventana = window.open(window.linkWhatsApp(texto), "_blank", "noopener");

if (ventana) {
  aviso.textContent = "Te abrimos WhatsApp con el mensaje escrito.";
} else {
  aviso.textContent = "";
  var link = document.createElement("a");
  link.href = window.linkWhatsApp(texto);
  link.target = "_blank";
  link.rel = "noopener";
  link.className = "btn btn--negro";
  link.textContent = "Abrir WhatsApp";
  aviso.appendChild(link);
  link.focus();
}
```

El mensaje no se pierde: queda a un toque, y el foco va al link para que quien
navega con teclado o lector de pantalla se entere de que la acción cambió de
lugar.

### 5.9 · Hallazgo 9 — la herramienta de imágenes que falta

`sharp` está en `devDependencies` y `arquitectura.md` dice que las fotos se
procesan con él, pero el script no existe. Cuando lleguen las fotos del club no
va a haber con qué procesarlas, y ese es exactamente el momento de más apuro.

`herramientas/imagenes.mjs`:

```js
/* Las fotos del club → WebP, en los tres anchos que pide el sitio.
   Entra:  herramientas/fotos-crudas/*.jpg   (no se versiona)
   Sale:   public/img/<nombre>-<ancho>.webp
   Uso:    node herramientas/imagenes.mjs                                */
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const ENTRADA = 'herramientas/fotos-crudas';
const SALIDA  = 'public/img';
/* 400 para la tira en celular, 800 para tablet, 1600 para el hero en
   escritorio. Más anchos no se notan y pesan. */
const ANCHOS = [400, 800, 1600];

await fs.mkdir(SALIDA, { recursive: true });
const fotos = (await fs.readdir(ENTRADA)).filter(f => /\.(jpe?g|png)$/i.test(f));

if (!fotos.length) {
  console.log(`No hay fotos en ${ENTRADA}/ — poné ahí los originales.`);
  process.exit(0);
}

for (const foto of fotos) {
  const nombre = path.basename(foto, path.extname(foto))
    .toLowerCase().replace(/[^a-z0-9]+/g, '-');

  for (const ancho of ANCHOS) {
    const destino = path.join(SALIDA, `${nombre}-${ancho}.webp`);
    /* withoutEnlargement: si el original es más chico que el ancho pedido,
       no lo estira — sale borroso y encima pesa más. */
    const { size } = await sharp(path.join(ENTRADA, foto))
      .resize({ width: ancho, withoutEnlargement: true })
      .webp({ quality: 72 })
      .toFile(destino);
    console.log(`  ${path.basename(destino).padEnd(34)} ${(size / 1024).toFixed(0)} KB`);
  }
}
console.log(`\n${fotos.length} foto(s) → ${SALIDA}/`);
```

Con los tres anchos disponibles, la tira del gimnasio pasa a servir el que
corresponde en vez de 1200px siempre:

```html
<img src="img/sala-de-bolsas-800.webp"
     srcset="img/sala-de-bolsas-400.webp 400w,
             img/sala-de-bolsas-800.webp 800w,
             img/sala-de-bolsas-1600.webp 1600w"
     sizes="(max-width: 640px) 72vw, min(30vw, 400px)"
     alt="La sala de bolsas del club"
     loading="lazy" decoding="async" width="800" height="1000">
```

El `sizes` tiene que coincidir con el `flex: 0 0 clamp(230px, 30vw, 400px)` del
CSS. Si no coincide, el `srcset` no sirve de nada: el navegador elige con el
`sizes`, no con el layout real.

---

## 6. Estrategias de rendimiento

### Presupuesto

Menos de **500 KB** en la primera vista y **LCP bajo 2,5 s** en 4G. Lo propio ya
está muy por debajo:

| | Peso | Nota |
|---|---|---|
| `index.html` | 24,5 KB | la página entera, contenido incluido |
| `tokens/` + `base/` | 8,3 KB | la paleta, la escala, el reset |
| `sitio/` | 34,2 KB | `sitio.css` + `app.js` + `datos.js` |
| `fonts/` | 79,8 KB | 3 variables, subconjunto latino |
| **Total propio** | **146,8 KB** | medido, sin comprimir |
| Foto del hero | el LCP | hoy Unsplash; con las reales, WebP a 1600px ≈ 120 KB |

Los 146,8 KB son bytes en disco: los mide `validar.mjs` y falla si pasan de 500
KB. Lo que viaja es menos, porque Cloudflare comprime el HTML, el CSS y el JS —
pero **no las fuentes**, que ya vienen comprimidas en `.woff2` y no bajan más.
O sea que más de la mitad del peso propio es irreducible, y está bien que así
sea: son las tres familias que sostienen el diseño.

El peso no es el problema. **La cascada sí** — por eso el hallazgo 1 es el
primero del informe: el sitio es liviano y aun así puede pintar tarde, que es
exactamente el caso que las métricas de campo castigan.

### Lo que ya está bien resuelto

- **Fuentes propias, variables y con subconjunto.** Un archivo por familia cubre
  todos los pesos: el 800 y el 900 de Big Shoulders salen del mismo `.woff2`.
- **`preload` + `crossorigin` en la fuente del titular.** El `crossorigin` es
  obligatorio aunque el archivo sea del mismo dominio —las fuentes siempre se
  piden en modo CORS— y sin él se descarga dos veces. Está bien puesto.
- **`font-display: swap`** en las tres: el texto se lee desde el primer pintado.
- **El hero nunca en lazy**, con `fetchpriority="high"` y medidas explícitas.
- **`width` y `height` en todas las imágenes**, que es lo que evita el salto de
  layout (CLS) sin necesidad de JavaScript.
- **`loading="lazy"` en las cinco fotos de la tira**, que están bajo el pliegue.

### Medido en el sitio real

`herramientas/rendimiento.mjs` mide el LCP contra la URL publicada, con la
red y la CPU estranguladas al perfil móvil por defecto de Lighthouse (150ms
de latencia, 1,6 Mbps de bajada, CPU 4x más lenta) — los mismos valores que
usa la herramienta que Google toma como referencia para Core Web Vitals. El
LCP se lee con el `PerformanceObserver` real del navegador, no con un
cronómetro externo.

```
node herramientas/rendimiento.mjs https://tu-sitio.workers.dev/
```

Cinco corridas contra el sitio publicado: 6,3s · 3,8s · 3,6s · 3,6s · 3,7s.
La primera incluye el arranque en frío del navegador y la resolución DNS a
Unsplash; las cuatro siguientes convergen en **3,6–3,8s** — por encima del
presupuesto de 2,5s.

El elemento del LCP es la foto del hero, y ahí está la causa: 545 KB
servidos desde `images.unsplash.com`, un origen externo. A 1,6 Mbps esa sola
transferencia consume ~2,7s de los 3,7s totales — la foto de banco, que ya
estaba señalada como temporal en `contenido-pendiente.md`, es hoy el
principal responsable del incumplimiento del presupuesto.

Para no dejarlo en una intuición: se bajó la misma foto que usa el hero y se
procesó con el pipeline real del sitio (`imagenes.mjs`, WebP calidad 72,
1600px de ancho). El archivo resultante pesa 145 KB contra los 545 KB que
sirve hoy Unsplash — a la misma velocidad de red, la transferencia baja de
2,7s a 0,7s. Proyectado sobre el LCP medido, eso deja el total en el orden de
1,7–1,8s: **por debajo del presupuesto**, aunque la cifra exacta depende de
la foto real que llegue del club, no de esta simulación.

Dicho de otro modo: la cascada de `@import` (hallazgo 1) era el problema
estructural, y está resuelta. El que queda hoy no es del código — es la
consecuencia esperada de trabajar todavía con fotos de banco sin procesar.
Vuelve a correr `rendimiento.mjs` en cuanto entren las fotos del club, para
confirmar la proyección con el dato real en vez de con la simulación.

---
---

## 7. Accesibilidad y SEO

### Accesibilidad — el trabajo ya hecho

Esta es la parte más fuerte del proyecto y conviene decirlo, porque es rara de
encontrar: **los ratios de contraste están medidos y anotados en el propio
`colors.css`**, no asumidos.

El hallazgo del handoff está bien resuelto. El diseño decía que la tarjeta al
pintarse de rojo «gana contraste sola»; medido, es al revés: `--gris-texto`
sobre `#E2231A` da 2.72:1 y `--gris-mudo` 1.31:1, prácticamente invisible. La
corrección —blanco pleno sobre rojo— está aplicada en `sitio.css`, no solo
documentada. Y el razonamiento de por qué **no** existe un «blanco velado» (el
blanco puro da 4.68:1, apenas sobre el mínimo de 4.5; un blanco al 82% ya no
pasa) es exactamente el tipo de decisión que se pierde si no se escribe.

El resto del inventario, verificado en el código:

| | |
|---|---|
| `lang="es-AR"` | ✓ |
| Salto al contenido | ✓ `.saltar`, visible al tabular |
| Foco visible | ✓ `:focus-visible` global, en la lengua del diseño |
| Jerarquía de encabezados | ✓ un `h1`, `h2` por sección, `h3` dentro |
| Etiquetas del formulario | ✓ `label for` real en los cuatro campos |
| Error del formulario | ✓ nombra el campo como se ve en pantalla y mueve el foco |
| `role="status"` en el aviso | ✓ el lector lo anuncia sin robar el foco |
| Menú mobile | ✓ `aria-expanded`, `aria-controls`, cierre con Escape y foco de vuelta |
| Áreas táctiles | ✓ los botones ocupan el ancho en mobile para pasar los 44px |
| `prefers-reduced-motion` | ✓ apaga las tres animaciones en bucle **y** deja el contenido visible |
| Gestos solo-mouse | ✓ `@media (hover:hover)` los aísla; hay alternativa táctil |
| Auditoría automática | ✓ axe en 5 variantes, sin violaciones |

El detalle de `prefers-reduced-motion` merece un párrafo, porque es donde casi
todos los sitios fallan: no alcanza con apagar la animación, hay que asegurarse
de que el contenido **no quede escondido esperando un reveal que ya no va a
ocurrir**. `motion.css` lo hace explícito con
`[data-reveal]{opacity:1 !important}`, y `app.js` además ni observa. Está bien
pensado en los dos lados.

**Lo único que agregaría:** una prueba con teclado de punta a punta (Tab desde el
salto hasta el pie, verificando que el orden sea el visual y que el panel del
menú no atrape el foco). axe no la cubre — axe encuentra lo estático, no el
recorrido.

### SEO

| | Estado |
|---|---|
| `<title>` con «boxeo» + la ciudad + gancho | ✓ |
| `description` local y concreta | ✓ |
| `SportsActivityLocation` en JSON-LD | ✓ escrito — ⚠ con datos sin confirmar |
| `FAQPage` con texto idéntico al visible | ✓ y la condición se cumple |
| Contenido en el HTML servido | ✓ es toda la arquitectura |
| Un solo `h1` | ✓ |
| `canonical` | ✓ — apunta al marcador del dominio, ver contenido-pendiente.md §1 |
| `robots.txt` / `sitemap.xml` | ✓ |
| `og:url` | ✓ |
| `og:image` | ✗ **hallazgo 8**, necesita una foto del club |

El `canonical` ya está, y la razón por la que hacía falta se confirmó en
producción: el sitio publicado responde igual en
`<worker>.workers.dev` que en el dominio final —
dos direcciones con el mismo contenido, compitiendo por la misma consulta
local si no hubiera un canonical que las desempate. Apunta al marcador del
dominio: hay que corregirlo en cuanto el club confirme el dominio real, o
el desempate apunta al lugar equivocado.

Sobre el JSON-LD hay una regla que conviene dejar escrita: **el bloque del
gimnasio no se publica hasta que los datos estén confirmados.** Datos
estructurados equivocados no son un error cosmético — es lo que Google usa para
armar la ficha, y corregirlo después tarda semanas en propagarse.

Y lo que más mueve la aguja está fuera del sitio: **la ficha de Google
Business.** Para «gimnasio de boxeo <ciudad>», el paquete local aparece arriba de
los resultados orgánicos. Conviene abrirla o reclamarla en paralelo al
lanzamiento, no después.

---

## 8. Medidas de seguridad

La superficie de ataque de este sitio es minúscula, y eso es un logro de
arquitectura, no una casualidad:

| Vector | Por qué no aplica |
|---|---|
| Inyección SQL | no hay base de datos |
| Autenticación | no hay cuentas, ni sesiones, ni cookies |
| CSRF | no hay estado en el servidor que falsificar |
| Subida de archivos | no existe |
| Dependencias en producción | cero: no se sirve una sola línea de terceros |
| Fuga de datos personales | el formulario no guarda nada — ver supuesto 3 |

Lo que **sí** queda, y hoy no está cubierto:

### Cabeceras (hallazgo 2) — el hueco más grande

No hay `_headers`, así que el sitio se sirve sin CSP, sin `nosniff`, sin
`Referrer-Policy` y sin `Permissions-Policy`. El archivo completo está en 5.5.

Lo que compra concretamente en este sitio:

- **CSP** — es la red de contención. Si algún día alguien pega un script de
  terceros «un segundo para probar» y se olvida, la CSP lo frena. En un sitio que
  hoy no tiene dependencias externas, la CSP es lo que mantiene esa propiedad en
  el tiempo.
- **`nosniff`** — impide que el navegador adivine el tipo de un archivo. Con
  `img/` recibiendo archivos que manda el cliente por WhatsApp, no adivinar es lo
  correcto.
- **`frame-ancestors 'none'`** — nadie mete el sitio en un iframe ajeno. Para un
  negocio local, que otro lo enmarque y le tape el teléfono con el suyo es un
  riesgo más real que cualquier exploit.
- **`Referrer-Policy`** — no se filtra la URL completa al salir hacia `wa.me`.

### XSS en el mensaje del formulario

Vale revisarlo explícitamente porque es el único lugar donde entra texto de quien
visita. El camino es: `nombre.value` → concatenación → `linkWhatsApp()` →
`encodeURIComponent()` → `window.open`.

**Está bien.** El texto se codifica antes de entrar a la URL, y nunca se escribe
al DOM con `innerHTML` —`app.js` usa `textContent` en todos lados—. La versión
del hallazgo 11 mantiene la propiedad: crea el link con `createElement` y asigna
`href` y `textContent`, no arma HTML con strings. Conviene que siga así.

El único matiz: `window.open` recibe `"noopener"` en las features, que es
correcto, y los `<a target="_blank">` del HTML deberían llevar `rel="noopener"`
por consistencia. En navegadores actuales es implícito, así que es higiene, no
una falla.

### Cadena de suministro

Cero dependencias en producción es la mejor defensa posible y ya está. En
desarrollo hay cuatro (`playwright`, `@axe-core/playwright`, `sharp`,
`wrangler`) y conviene un `npm audit` cada tanto — no bloquea nada, pero
`wrangler` es la que tiene la credencial de despliegue.

### Lo que no hay que hacer

Registrarlo, porque va a tentar: **no agregar un banner de cookies.** El sitio no
pone ninguna. Si entra analítica, que sea Cloudflare Web Analytics, que tampoco
pone cookies ni recolecta datos personales — y así el banner sigue sin hacer
falta. Un banner de cookies en un sitio sin cookies es un cartel que dice «no
leímos lo que firmamos».

---

## 9. Plan de pruebas

### Lo que ya existe, y es más de lo habitual

**`auditoria.mjs`** — axe-core (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`) en
320, 390, 768 y 1440, más una pasada con movimiento reducido. Deja una captura de
cada variante y sale con código 1 si encuentra algo, así entra en un hook.

**`contacto.mjs`** — la prueba más inteligente del repo. Inyecta valores falsos
en `NEGOCIO` antes de que `app.js` los lea y verifica que ningún dato de contacto
quedó escrito a mano en el HTML. **Es una prueba que custodia una decisión de
arquitectura, no una función.** Esa es la clase de prueba que sobrevive a un
refactor, y hay muy pocos proyectos de este tamaño que la tengan.

### Lo que faltaba, y ya está

Todo lo de esta tabla está construido y corriendo en `npm test`.

| Prueba | Qué atrapa | Por qué importa acá |
|---|---|---|
| **HTML válido** | un `<div>` sin cerrar, un atributo roto | rompe el `<head>` en silencio y nadie lo ve |
| **JSON-LD válido** | una coma de más | Google descarta el bloque entero sin avisar |
| **Anclas internas** | `href="#planes"` sin destino | el nav es todo anclas: un id mal escrito es un botón muerto |
| **Presupuesto de peso** | una foto de 4 MB que se coló | el requisito es el peso, y hoy nadie lo mide |
| **Formulario** | validación vacía, foco, texto del mensaje | es el único flujo interactivo del sitio |
| **Teclado** | orden de tabulación, trampa de foco en el menú | axe no recorre, solo inspecciona |
| **Interruptores** | apagar una sección y que desaparezca de verdad | es el mecanismo del que depende publicar incompleto |
| **Texto sobre foto** | el hero, midiendo los píxeles de la imagen | axe no puede: sabe color contra color, no color contra foto |

Dos de esas comprobaciones no son de calidad sino de **coherencia**, y son las
que más van a servir con el tiempo. Están en la misma línea que `contacto.mjs`:
custodian una decisión, no una función.

- **El dominio vive en cuatro lugares** —`canonical`, `og:url`, `robots.txt` y
  `sitemap.xml`— y cambiar tres de los cuatro es el error fácil. `validar.mjs`
  falla si no coinciden entre sí, y avisa mientras siga siendo el marcador.
- **Un host de terceros vive en tres** —el `<img>`, el `preconnect` y la CSP—.
  Falla si el HTML pide algo que la CSP no permite, porque eso se bloquea en
  silencio, y avisa si quedó un `preconnect` o una excepción de la CSP que ya
  no usa nadie. Es el recordatorio automático de limpiar Unsplash el día que
  entren las fotos del club.

La diferencia entre fallar y avisar es deliberada. Si el marcador del dominio
hiciera fallar `npm test`, la suite viviría en rojo y dejaría de significar
nada; y una suite que siempre está en rojo es exactamente igual de útil que no
tener ninguna.

### Un solo comando

Hoy hay que levantar el servidor a mano en otra terminal y correr dos scripts.
Esa fricción es la razón por la que las pruebas se dejan de correr. Un
`pruebas.mjs` que levanta el servidor, corre todo y lo baja:

```js
/* Levanta el servidor, corre todas las pruebas y lo baja. Un solo comando,
   porque una prueba que necesita dos terminales se deja de correr. */
import { spawn } from 'child_process';

const servidor = spawn('node', ['herramientas/servidor.mjs'], { stdio: 'ignore' });
const cerrar = () => servidor.kill();
process.on('exit', cerrar);
process.on('SIGINT', () => { cerrar(); process.exit(130); });

/* Esperar a que escuche, sin dormir a ciegas. */
for (let i = 0; i < 50; i++) {
  try { await fetch('http://127.0.0.1:8788/'); break; }
  catch { await new Promise(r => setTimeout(r, 100)); }
}

let fallas = 0;
for (const prueba of ['validar.mjs', 'contacto.mjs', 'auditoria.mjs']) {
  const codigo = await new Promise(r =>
    spawn('node', ['herramientas/' + prueba], { stdio: 'inherit' }).on('close', r));
  if (codigo !== 0) fallas++;
}

cerrar();
process.exit(fallas ? 1 : 0);
```

Y en `package.json`, con la red de seguridad que hoy falta:

```json
"scripts": {
  "dev": "wrangler dev",
  "test": "node herramientas/pruebas.mjs",
  "imagenes": "node herramientas/imagenes.mjs",
  "predeploy": "npm test",
  "deploy": "wrangler deploy"
}
```

`predeploy` es la línea más valiosa de todo el informe: npm lo ejecuta solo antes
de `deploy`, así que **no se puede publicar sin pasar la auditoría de
accesibilidad.** Un olvido deja de ser posible en vez de ser improbable.

### Antes de cada publicación, a mano

Lo que ninguna herramienta cubre:

- Abrirlo en un celular de verdad, con datos móviles, no con el simulador.
- Tocar los cuatro botones de WhatsApp y verificar que el mensaje llega escrito.
- Leerlo entero en voz alta. Los errores de redacción no los encuentra axe.

---

## 10. Despliegue y mantenimiento

### Hoy

```
npm install     # la primera vez
npm run dev     # levanta el sitio igual que en producción
npm run deploy  # sube public/ a Cloudflare
```

Sin build: lo que hay en `public/` es lo que se sirve. `not_found_handling` en
`404-page` y no en modo aplicación, que es correcto —una sola página con anclas,
y una dirección que no existe tiene que devolver un 404 de verdad—.

### Lo que le falta

**1. La red de seguridad del `predeploy`** (sección 9). Hoy se puede publicar con
una violación de accesibilidad y nadie se entera.

**2. Un camino de vuelta escrito.** Cloudflare guarda las versiones anteriores,
pero eso no sirve si hay que buscarlo con el sitio roto:

```
npx wrangler deployments list          # ver qué se publicó y cuándo
npx wrangler rollback <id-anterior>    # volver, en segundos
```

**3. CI.** ✓ Hecho: `.github/workflows/pruebas.yml` corre `npm test` en cada
push y en cada pull request, y cuando algo falla sube las capturas de axe como
artefacto —una violación sin la captura obliga a reproducirla a mano—. Mueve la
auditoría de «cuando me acuerdo» a «siempre». Instala solo Chromium: las
pruebas no usan Firefox ni WebKit, y bajar los tres triplica el job sin cubrir
nada más.

**4. Monitoreo.** Hoy no hay nada: si el sitio se cae o el LCP se degrada, se
descubre porque alguien avisa. Dos piezas, ambas gratis:

- **Cloudflare Web Analytics** — un script, sin cookies, sin datos personales,
  sin banner. Da visitas, y sobre todo Core Web Vitals de campo: LCP y CLS reales
  en los celulares del público, que es la única medición que cuenta.
- **El panel de Workers** — peticiones y errores, sin configurar nada.

Si entra Web Analytics, hay que sumar su origen a la CSP (`script-src` y
`connect-src`). Es la clase de detalle que hace que «la analítica no anda» tarde
media hora en vez de dos minutos.

### Mantenimiento previsible

| Cuándo | Qué |
|---|---|
| Antes de publicar | los cinco datos de `contenido-pendiente.md` |
| Cuando lleguen las fotos | `npm run imagenes`, y borrar el `preconnect` a Unsplash |
| Al confirmar el teléfono | una línea en `datos.js` — `contacto.mjs` lo custodia |
| Cada tanto | `npm audit` sobre las cuatro dependencias de desarrollo |
| Una vez por año | que el `©` del pie sigue saliendo de `new Date()` — sí, ya sale |

### El escenario que hay que prever

**Que el sitio quede sin tocar dos años y alguien lo tenga que retomar.** Es el
escenario más probable de todos, y es donde esta arquitectura gana de manera
decisiva: no hay `node_modules` que se pudrió, ni una versión de framework con un
cambio incompatible, ni un build que dejó de correr. Se clona, se abre
`index.html`, se edita. `wrangler` es lo único que puede haber envejecido, y es
una dependencia de desarrollo: se actualiza y listo.

Ese es el argumento más fuerte a favor de no haber usado Astro, y conviene
tenerlo escrito para cuando alguien proponga migrarlo sin motivo.

---

## 11. Mejoras futuras

Ordenadas por relación entre lo que aportan y lo que cuestan. Las tres primeras
valen la pena; las últimas están acá para que quede registrado que se evaluaron y
se descartaron.

**1. Ficha de Google Business.** No es código y es lo que más mueve la búsqueda
local. Para «gimnasio de boxeo <ciudad>» el paquete local va arriba de todo lo
orgánico. Conviene abrirla o reclamarla en paralelo al lanzamiento.

**2. El mapa, como imagen estática.** Cuando confirmen la dirección: una captura
del mapa que abre Google Maps al tocarla. Pesa ~30 KB contra los ~700 KB del
iframe, no carga scripts de terceros, y hace exactamente lo mismo que la gente
necesita —saber dónde queda y cómo llegar—. Si aun así se quiere el iframe, va
con `loading="lazy"` y hay que agregar `frame-src` a la CSP.

**3. El aviso por mail del formulario.** Si el club quiere además de WhatsApp: un
Worker que reciba el POST y reenvíe. Media hora, y no cambia nada de lo demás.
Vale la pena esperar a que lo pidan: un canal que nadie mira es peor que no
tenerlo.

**4. Astro, si el sitio crece.** Con un blog o más de tres páginas, el build
empieza a pagar. El CSS y el markup pasan casi tal cual. Los disparadores están
en la tabla de la sección 2.

**5. Las clases con horarios reales.** Cuando lleguen los horarios, la sección de
clases puede mostrar días y franjas. Es contenido, no arquitectura.

### Evaluadas y descartadas

| | Por qué no |
|---|---|
| **PWA / service worker** | una landing que se visita una vez antes de escribir por WhatsApp no se instala. Suma una capa de caché que se puede quedar pegada |
| **Embed de Instagram** | pesa cientos de KB, carga scripts de terceros y rompe la CSP. Un link al perfil hace lo mismo |
| **Modo claro** | el diseño es negro con un acento rojo. Un tema claro es un segundo diseño para mantener |
| **Framework de CSS** | los tokens ya dan lo que aportaría, sin la dependencia |
| **Chat en vivo** | el chat en vivo *es* WhatsApp, y ya está |

---

## Plan de trabajo sugerido

Tres tandas. La primera es medio día y se lleva casi todo el beneficio.

**Tanda 1 — antes de publicar** · ✓ hecha

1. ✓ Romper la cadena de `@import` (5.1) — el de mayor impacto
2. ✓ `defer` en `datos.js` (5.2)
3. ✓ `canonical`, `robots.txt`, `sitemap.xml` (5.4)
4. ✓ `_headers` con CSP y caché (5.5)
5. ✓ `preconnect` a Unsplash (5.3)
6. ✓ Comentar la sección de testimonios (5.7)
7. ✓ Poner `mostrarLinaje` en `false` hasta que el club confirme los datos de
   la persona que nombraba la sección (después se reescribió en genérico y
   volvió a encenderse)
8. ✓ `alt` genérico en las fotos de banco mientras no sean del club

**Tanda 2 — al confirmar el contenido**

9. ~ `herramientas/imagenes.mjs` escrito; falta el `srcset`, que necesita fotos
10. ✗ `og:image` con una foto propia (5.4)
11. ✗ JSON-LD con los datos confirmados; recién ahí se publica ese bloque
12. ✗ Borrar el `preconnect` a Unsplash y su entrada en la CSP

**Tanda 3 — la red de seguridad** · ✓ hecha salvo CI y analítica

13. ✓ `pruebas.mjs` y `predeploy` en `package.json`
14. ✓ `validar.mjs`: HTML, JSON-LD, anclas y presupuesto de peso
15. ✗ Cloudflare Web Analytics, con su origen en la CSP
16. ✓ La prueba de teclado de punta a punta
17. ✓ El fallback de `window.open` (5.8)
18. ✓ CI en GitHub Actions, con las capturas como artefacto

---

*Auditoría hecha sobre el commit `adb8cb2`, 6 de septiembre de 2026. Los pesos
propios están estimados sobre el tamaño de los archivos en el repo; los tiempos
de carga no se midieron en red real — la sección 9 propone cómo medirlos de
forma reproducible.*
