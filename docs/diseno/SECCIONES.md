# Secciones — spec detallada

El orden vertical es el de este documento. Todo el contenido está en español rioplatense (voseo: «ponete», «escribinos», «vení»). Mantener ese registro.

---

## 1. Header (sticky)

`position:sticky; top:0; z-index:50`, fondo `rgba(11,11,11,.86)` con `backdrop-filter:blur(10px)`, borde inferior `1px solid rgba(244,241,236,.14)`. Padding `14px clamp(16px,4vw,48px)`. Flex, `justify-content:space-between`.

**Izquierda (marca):** cuadrado rojo `26×26px` + «Alanis Boxing Club» (Big Shoulders 900, 22px, uppercase) + «Rosario» (Chivo Mono 10px, `letter-spacing:.18em`, color `#8a8781`). Los tres en fila con `gap:12px`, alineados al centro. Enlaza a `#top`.

**Derecha (nav):** `gap:clamp(14px,2.2vw,30px)`, Chivo Mono 11px `letter-spacing:.16em` uppercase.
- `Clases` → `#clases`
- `Planes` → `#planes`
- `Contacto` → `#contacto`
- `Escribinos` → botón rojo `#E2231A`, texto blanco, padding `11px 18px`, peso 700. Hover: fondo `#f4f1ec`, texto `#0b0b0b`.

Link genérico: color `#f4f1ec`, sin subrayado; hover `#E2231A`.

> **Responsive:** hoy el nav no colapsa en mobile — los ítems se aprietan pero entran. Si querés un menú hamburguesa por debajo de ~600px, es una decisión de implementación válida y no rompe el diseño.

---

## 2. Hero (`#top`)

`min-height:min(90vh,800px)`, flex alineado a `flex-end` (el contenido se apoya abajo). Padding `clamp(72px,10vw,120px) clamp(16px,4vw,48px) clamp(26px,3.5vw,48px)`, `overflow:hidden`.

**Capas, de atrás hacia adelante:**
1. `<img>` a sangre, `inset:0`, `object-fit:cover`, `object-position:58% 34%`, filtro `grayscale(1) contrast(1.14) brightness(.82)`. Animación `ri-zoom` 28s ease-in-out infinite alternate (`scale(1.06)` → `scale(1.14)`).
   URL: `https://images.unsplash.com/photo-1517438322307-e67111335449?w=2400&q=72&auto=format&fit=crop`
2. Overlay diagonal: `linear-gradient(96deg, rgba(11,11,11,.97) 0%, rgba(11,11,11,.9) 34%, rgba(11,11,11,.5) 68%, rgba(11,11,11,.72) 100%)`
3. Overlay inferior: `linear-gradient(to top, #0b0b0b 0%, rgba(11,11,11,0) 38%)` — funde el hero con la sección siguiente.
4. Contenido, `max-width:1000px`.

**Contenido, en orden:**
- Rótulo de ubicación: punto rojo de 8px (`border-radius:50%`, animación `ri-pulse` 2s infinite, opacidad .5→1) + «Rosario, Santa Fe» en Chivo Mono 11px `letter-spacing:.2em` color `#a8a49d`.
- **H1 en dos líneas:** «Ponete» (hueso) / «los guantes» (rojo `#E2231A`). Cada línea es un `<span style="display:block">` con animación `ri-wipe` — `clip-path:inset(0 100% 0 0)` → `inset(0 0 0 0)`, `.8s cubic-bezier(.6,0,.2,1)`, delays `.1s` y `.25s`. Es la animación firma de la página: el texto se descubre de izquierda a derecha, como un golpe.
- Párrafo: «Entrenamiento completo de boxeo, recreativo y competitivo, femenino y masculino. Para principiantes, mujeres, chicos y adultos que nunca pisaron un gimnasio. **La primera clase no se paga.**» (última frase en `<strong>` color `#f4f1ec` peso 700).
- **Dos CTAs** (`gap:12px`, wrap):
  - «Reservá tu clase gratis» → `#contacto`. Fondo rojo, texto blanco. Hover: fondo `#f4f1ec`, texto `#0b0b0b`.
  - «Ver planes» → `#planes`. Borde `1px solid rgba(244,241,236,.3)`, transparente. Hover: borde `#f4f1ec`, fondo `rgba(244,241,236,.06)`.
  - Ambos: padding `19px 30px`, Big Shoulders 800, 20px, `letter-spacing:.06em`, uppercase.
- **Tres datos en `<dl>`:** grilla `repeat(auto-fit,minmax(150px,1fr))`, `gap:1px` sobre borde y fondo `rgba(244,241,236,.2)`. Cada celda: fondo `rgba(11,11,11,.55)` + `backdrop-filter:blur(6px)`, padding `16px 18px`. `dt` Chivo Mono 10px gris, `dd` Big Shoulders 800 `clamp(24px,2.4vw,34px)` uppercase.
  - Horarios → **Mañana y tarde** ← *pendiente: horarios reales*
  - Grupos → Hasta 12 personas
  - Equipo → Guantes incluidos

Las animaciones de entrada del hero son `ri-up` (`opacity:0` + `translateY(0.5em)` → normal), `.7s cubic-bezier(.2,.7,.2,1)`, con delays escalonados `.05s / .45s / .55s / .65s`.

---

## 3. Marquesina

Franja horizontal con bordes arriba y abajo `1px solid rgba(244,241,236,.14)`, padding `14px 0`, `overflow:hidden`, `margin-top:clamp(20px,3vw,40px)`.

Dentro: un flex de `width:max-content` con la **misma cadena de texto duplicada exactamente dos veces**, animado con `ri-march` (`translateX(0)` → `translateX(-50%)`), 26s linear infinite. La duplicación es lo que hace el loop continuo — no la quites.

Texto (Big Shoulders 800, `clamp(30px,4vw,54px)`, uppercase, `white-space:nowrap`), con cada `✳` en rojo:

`Principiantes ✳ Box fitness ✳ Kids & juvenil ✳ Mujeres ✳ Personal 1 a 1 ✳ Amateur ✳`

---

## 4. Linaje / El rincón

*Condicional: se muestra según el flag `mostrarLinaje` (default `true`).*

Grilla `repeat(auto-fit,minmax(min(100%,320px),1fr))`, `gap:clamp(28px,4vw,64px)`, `align-items:start`. Padding `clamp(56px,8vw,116px) clamp(16px,4vw,48px)`, borde inferior tenue.

**Columna izquierda:**
- Rótulo «El rincón» (Chivo Mono 11px `letter-spacing:.2em` gris).
- H2: «Acá se formó un» / «**campeón sudamericano**» (segunda línea en rojo, separada por `<br>`).
- Párrafo: «Charly Alanis dirige el club y es el entrenador que formó a **Carlos «Junior» Alanís**: medalla de plata en los Juegos Odesur 2018 y campeón sudamericano ligero. El mismo trabajo de rincón que llevó a un profesional al título es el que vas a tener desde tu primera clase.»

**Columna derecha — tres stats** en `<dl>`, grilla `repeat(auto-fit,minmax(130px,1fr))`, `gap:1px` sobre `rgba(244,241,236,.14)`, celdas `background:#0b0b0b` padding `22px 18px`. El número va **arriba** (`dd`) y el rótulo abajo (`dt`) — invertido respecto al orden semántico natural, resuelto con el orden del markup.
- `13–1` (el guión en rojo) — Récord profesional
- `2018` — Plata Odesur
- `01` (en rojo) — Título sudamericano

> **Verificar antes de publicar:** los datos de Carlos «Junior» Alanís vienen de fuentes públicas y no fueron confirmados por el cliente. Récord y títulos son afirmaciones verificables — que las apruebe el gimnasio.

---

## 5. Las clases (`#clases`)

Encabezado de sección: flex con wrap, `justify-content:space-between`, `align-items:baseline`. H2 «Las clases» + rótulo derecho «Cuatro formas de entrenar» (Chivo Mono 11px gris). Este patrón de encabezado se repite en Planes y Gimnasio — hacelo un componente.

Grilla `repeat(auto-fit,minmax(min(100%,260px),1fr))`, `gap:1px` sobre `rgba(244,241,236,.14)`. Cada `<article>`: fondo `#0b0b0b`, padding `clamp(22px,2.6vw,34px)`, **hover → fondo `#E2231A`** (la tarjeta entera se pinta de rojo; el texto no cambia de color, gana contraste solo).

Estructura interna de cada tarjeta: número de orden arriba (Chivo Mono 11px `letter-spacing:.2em` gris), después un **margen superior grande en el H3** (`margin-top:clamp(60px,9vw,110px)`) que empuja el título hacia abajo y crea el aire característico. Luego párrafo y meta.

| # | Título (2 líneas) | Párrafo | Meta |
|---|---|---|---|
| 01 | Boxeo / principiantes | Guardia, desplazamiento y golpes básicos. No hace falta experiencia ni estado físico. | 60 min · sin contacto |
| 02 | Box / fitness | Bolsa, soga y circuitos. Toda la técnica del boxeo, cero golpes recibidos. | 50 min · todos los niveles |
| 03 | Kids y / juvenil | De 8 a 17 años. Coordinación, disciplina y juego, con acompañamiento cercano. | 55 min · por edades |
| 04 | Personal / 1 a 1 | Entrenador dedicado, plan a medida y seguimiento. Con turno reservado. | 45 min · con turno |

Los saltos de línea de los títulos son `<br>` intencionales.

---

## 6. Los planes (`#planes`)

*Condicional: flag `mostrarPrecios` (default `true`).*

Encabezado: H2 «Los planes» + rótulo «Sin matrícula · guantes incluidos».

Grilla `repeat(auto-fit,minmax(min(100%,240px),1fr))`, `gap:clamp(14px,2vw,22px)` — acá **sí hay gap real**, no líneas de 1px, porque las tarjetas tienen borde propio.

| Plan | Tratamiento | Precio | Sufijo |
|---|---|---|---|
| 2 por semana | Borde `1px solid rgba(244,241,236,.16)`, fondo transparente | A confirmar | valor mensual |
| **Libre** | **Fondo y borde `#E2231A`**, todo el texto blanco | A confirmar | valor mensual |
| Personal 1 a 1 | Borde tenue | A confirmar | valor por sesión |

El precio es Big Shoulders 900 `clamp(30px,3.4vw,44px)` uppercase; el sufijo va **debajo** (`display:block`, `margin-top:10px`) en Chivo Mono 12px peso 400.

> Cuando lleguen los montos: el tamaño del precio vuelve a `clamp(44px,5vw,66px)` y el sufijo pasa a ser inline (`/mes`, `/sesión`) en vez de bloque. El layout no cambia.

---

## 7. El gimnasio (`#gimnasio`)

Encabezado: H2 «El gimnasio» + rótulo «Fotos de referencia» (con `flex:none` y `white-space:nowrap` para que no se parta — **cambiar ese texto cuando entren las fotos reales**).

**Tira horizontal con scroll-snap**, no mosaico: `display:flex`, `gap:clamp(8px,1.2vw,14px)`, `overflow-x:auto`, `scroll-snap-type:x mandatory`, `padding-bottom:14px`, `scrollbar-width:thin`.

Cada `<figure>`: `flex:0 0 clamp(230px,30vw,400px)`, `aspect-ratio:4/5`, `overflow:hidden`, fondo `#141414`, `scroll-snap-align:start`, `margin:0`.

Cada `<img>`: `inset:0`, `object-fit:cover`, filtro `grayscale(1) contrast(1.08)`, transición `filter .5s, transform .7s cubic-bezier(.2,.7,.2,1)`. **Hover → `grayscale(0) contrast(1)` + `scale(1.05)`**: la foto recupera el color al pasar el mouse. Es el segundo gesto firma de la página.

Las dos primeras tienen `<figcaption>` en la esquina inferior izquierda (Chivo Mono 10px `letter-spacing:.16em` uppercase, padding `7px 10px`): la primera con fondo rojo y texto blanco, la segunda con fondo `#0b0b0b`. La tercera también lleva caption negro. Las dos últimas van sin caption.

| # | Caption | URL Unsplash (todas con `?w=1200&q=70&auto=format&fit=crop`) |
|---|---|---|
| 1 | Sala de bolsas (rojo) | `photo-1754630591156-ef00f2e0d888` |
| 2 | Clase de bolsa (negro) | `photo-1636581563867-1ecab574858f` |
| 3 | El ring (negro) | `photo-1716307046875-4c4ba2f43cab` |
| 4 | — | `photo-1636302925863-6ad504baaf3c` |
| 5 | — | `photo-1633394782368-6e7260566004` |

---

## 8. Contacto (`#contacto`) — inversión de color

**Única sección clara de la página:** fondo `#f4f1ec`, texto `#0b0b0b`. El corte de negro a hueso es deliberado — marca el final y el momento de la acción.

Grilla `repeat(auto-fit,minmax(min(100%,300px),1fr))`, `gap:clamp(24px,4vw,56px)`, `align-items:center`. Padding `clamp(48px,7vw,104px) clamp(16px,4vw,48px)`.

**Izquierda:** H2 en tres líneas — «Tu primera» / «clase es» / «**gratis**» (última en rojo). Big Shoulders 900 `clamp(46px,8vw,120px)`, `line-height:.85`.

**Derecha:**
- Párrafo (`color:#3a3833`, `max-width:40ch`): «Escribinos y te reservamos un lugar en el horario que te quede cómodo. Vení con ropa deportiva, el resto lo ponemos nosotros.»
- Dos botones, `gap:12px`:
  - **WhatsApp** → `https://wa.me/5493415632194`. Fondo `#0b0b0b`, texto `#f4f1ec`. Hover: fondo `#E2231A`, texto blanco.
  - **341 563-2194** → `tel:+5493415632194`. Borde `1px solid rgba(11,11,11,.25)`. Hover: borde `#0b0b0b`.
- Línea de datos (Chivo Mono 11px `letter-spacing:.14em` uppercase, `color:#6b6862`): «Rueda 2553 · Rosario · alanisbox@hotmail.com»

### ⚠ Datos de contacto — cablear en un solo lugar
El teléfono aparece **4 veces** y no está confirmado por el cliente:
1. Header, botón «Escribinos» → `wa.me/5493415632194`
2. Contacto, botón WhatsApp → `wa.me/5493415632194`
3. Contacto, botón teléfono → `tel:+5493415632194` y su label visible `341 563-2194`
4. Contacto, línea de datos → dirección + email

Al portar, poné estos cuatro valores (whatsapp, tel, dirección, email) en **una sola constante o entrada de CMS**. Van a cambiar.

Recomendado al implementar el link de WhatsApp: agregar mensaje prellenado, ej. `?text=Hola!%20Quiero%20reservar%20mi%20primera%20clase%20gratis`.

---

## Animación de aparición al hacer scroll

Todo elemento con `data-reveal` entra al hacer scroll. Implementación de referencia (en el prototipo vive en `componentDidMount`):

- `IntersectionObserver` con `threshold:0.12`, `rootMargin:'0px 0px -6% 0px'`.
- Estado inicial: `opacity:0`, `transform:translateY(26px)`.
- Al entrar: `opacity:1`, `transform:none`, y se deja de observar (una sola vez, no se repite).
- Transición: `.75s cubic-bezier(.2,.7,.2,1)`, con delay escalonado `(i % 4) * 0.07s` — los elementos de una misma fila entran en cascada.

Al portar, esto es un hook/directiva reutilizable. **Respetá `prefers-reduced-motion`**: si está activo, mostrá todo sin animar (el prototipo todavía no lo hace — es una mejora esperada, igual que en `ri-zoom`, `ri-march` y `ri-pulse`, que son bucles infinitos).

### Keyframes
```css
@keyframes ri-up   { from{opacity:0;transform:translateY(0.5em)} to{opacity:1;transform:none} }
@keyframes ri-wipe { from{clip-path:inset(0 100% 0 0)} to{clip-path:inset(0 0 0 0)} }
@keyframes ri-march{ from{transform:translateX(0)} to{transform:translateX(-50%)} }
@keyframes ri-pulse{ 0%,100%{opacity:.5} 50%{opacity:1} }
@keyframes ri-zoom { from{transform:scale(1.06)} to{transform:scale(1.14)} }
```

También: `html{scroll-behavior:smooth}` (los CTAs y el nav navegan por ancla) y `::selection{background:#E2231A;color:#fff}`.

---

## Estado y comportamiento

La página es **estática**. No hay fetching, ni formularios, ni estados de carga o error. El único estado son dos flags de contenido que en el prototipo son props y al portar conviene que sean flags de CMS o constantes:

| Flag | Default | Qué controla |
|---|---|---|
| `mostrarPrecios` | `true` | Muestra/oculta la sección Planes completa |
| `mostrarLinaje` | `true` | Muestra/oculta la sección del campeón sudamericano |

Existen porque los precios no están confirmados y los datos del campeón están sin verificar: permiten publicar sin esas secciones si hace falta.

---

## Secciones pedidas que NO están construidas

El pedido original tenía 9 secciones. Estas cuatro quedaron fuera del prototipo y hay que diseñarlas/implementarlas:

1. **Testimonios** — iría entre Clases y Planes. Sin contenido real todavía.
2. **FAQ** — después de Planes. Candidatas obvias: qué llevar, si hace falta estado físico, desde qué edad, si hay que sparrear.
3. **Mapa** — dentro o al lado de Contacto. Bloqueado hasta confirmar la dirección.
4. **Formulario de inscripción** — hoy la conversión es 100% WhatsApp. Si se agrega, mantener WhatsApp como opción principal: para este público convierte mejor.

Al construirlas, seguí el vocabulario ya establecido: bordes de 1px en vez de sombras, grillas separadas por líneas, rojo solo como acento, Big Shoulders para títulos y Chivo Mono para rótulos.
