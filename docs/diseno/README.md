# Handoff de diseño: landing para gimnasio de boxeo

> Este documento y `SECCIONES.md` son el handoff original del que salió el
> sitio. Se conservan porque `sitio/sitio.css` los cita como la autoridad
> sobre medidas: cuando algo no cierra, manda `SECCIONES.md`.
>
> Estaban escritos para un club concreto y se pasaron a genéricos: el nombre,
> la ciudad y los datos de contacto que traían eran de un negocio real.
> Las decisiones de diseño no dependían de eso y quedaron intactas.

## Overview
Landing page de una sola vista para un **gimnasio de boxeo** de barrio.
Objetivo: captar principiantes adultos, mujeres y chicos, y empujar todo el tráfico a **WhatsApp** con el gancho de la primera clase gratis. Idioma: español rioplatense (voseo).

## About the design files
Los archivos de este bundle son **referencias de diseño hechas en HTML** — prototipos que muestran el look y el comportamiento buscados, **no código de producción para copiar tal cual**. La tarea es **recrear estos diseños en el entorno del codebase destino** (React/Next, Astro, Vue, WordPress, lo que sea) usando sus patrones y librerías establecidas. Si todavía no hay codebase, elegí el framework más adecuado: para esta pieza (una sola página, mucho contenido estático, prioridad SEO local y velocidad en mobile) **Astro o Next.js estático son la mejor opción**; un site builder también sirve si el cliente va a editar textos solo.

`diseno-original.dc.html` usa un runtime propio del entorno donde se diseñó (`support.js`, tags `<x-dc>`, `<sc-if>`, atributos `style-hover`). **Ignorá ese runtime** — es andamiaje de la herramienta de diseño. Lo que importa es el markup, los estilos inline y las animaciones. `preview-standalone.html` es la misma página empaquetada en un archivo único: abrila en el navegador para ver el resultado real sin instalar nada.

## Fidelity
**Alta fidelidad (hifi).** Colores, tipografías, escalas y espaciados son finales y están pensados para recrearse tal cual. Dos salvedades de contenido, no de diseño:
- Las **fotos son de Unsplash, de referencia**. Van reemplazadas por fotos reales del gimnasio (el cliente las tiene en Instagram).
- Los **precios dicen «A confirmar»** a propósito. Cuando lleguen los montos reales, se cambia el texto sin tocar el layout.

## Design tokens

### Colores
| Token | Hex | Uso |
|---|---|---|
| Negro base | `#0b0b0b` | Fondo de toda la página, texto sobre claro |
| Hueso | `#f4f1ec` | Texto principal sobre oscuro, fondo sección contacto |
| Rojo | `#E2231A` | Acento único: CTAs, hover de tarjetas, palabras destacadas, plan destacado |
| Blanco | `#ffffff` | Texto sobre rojo |
| Gris texto | `#c9c5be` | Párrafos sobre fondo oscuro |
| Gris apagado | `#8a8781` | Rótulos monoespaciados, metadatos |
| Gris claro | `#a8a49d` | Rótulos sobre foto (hero) |
| Gris sobre claro | `#3a3833` | Párrafo en sección contacto |
| Gris meta claro | `#6b6862` | Línea de dirección en sección contacto |
| Panel foto | `#141414` | Fondo de figure mientras carga la imagen |
| Borde tenue | `rgba(244,241,236,.14)` | Separadores de grilla, bordes de sección |
| Borde medio | `rgba(244,241,236,.16)` / `.2` / `.3` | Bordes de tarjetas y botón secundario |

Regla: **un solo acento**. El rojo nunca se usa como fondo grande salvo en el plan destacado y los CTAs. Nada de degradés decorativos — los únicos gradientes son los overlays negros del hero.

### Tipografía
Google Fonts: `Big Shoulders Display` (600/800/900), `Oswald` (500/700, fallback), `Chivo` (400/700), `Chivo Mono` (400).

| Rol | Familia | Peso | Tamaño | Detalles |
|---|---|---|---|---|
| H1 hero | Big Shoulders Display | 900 | `clamp(64px,13.5vw,208px)` | `line-height:.82`, `letter-spacing:-.015em`, uppercase |
| H2 sección | Big Shoulders Display | 900 | `clamp(40px,6vw,88px)` | `line-height:.9`, `letter-spacing:-.01em`, uppercase |
| H2 contacto | Big Shoulders Display | 900 | `clamp(46px,8vw,120px)` | `line-height:.85` |
| H3 tarjeta clase | Big Shoulders Display | 800 | `clamp(28px,3vw,42px)` | `line-height:.95`, uppercase |
| H3 plan | Big Shoulders Display | 800 | `26px` | `letter-spacing:.04em`, uppercase |
| Número stat | Big Shoulders Display | 900 | `clamp(44px,5vw,72px)` | `line-height:.86` |
| Botón | Big Shoulders Display | 800 | `20px` | `letter-spacing:.06em`, uppercase |
| Párrafo hero | Chivo | 400 | `clamp(16px,1.5vw,20px)` | `line-height:1.55`, `max-width:46ch` |
| Párrafo cuerpo | Chivo | 400 | `15px`–`19px` | `line-height:1.6` |
| Rótulo / meta | Chivo Mono | 400 | `10px`–`11px` | `letter-spacing:.14em`–`.2em`, uppercase |

`text-wrap:balance` en títulos, `text-wrap:pretty` en párrafos.

### Espaciado
- Padding horizontal de página: `clamp(16px,4vw,48px)` — el mismo en todas las secciones.
- Padding vertical de sección: `clamp(56px,8vw,120px)`.
- Grillas separadas por **líneas de 1px**, no por gap: `gap:1px` sobre un contenedor con `background:rgba(244,241,236,.14)` y celdas con `background:#0b0b0b`. Es un recurso recurrente — respetalo.
- Radio de borde: **0 en todo**. No hay esquinas redondeadas en ningún elemento.
- Sombras: **ninguna**. La profundidad se logra con contraste y líneas.

## Assets
Todas las imágenes son de **Unsplash** (referencia, licencia libre pero no son el gimnasio real). URLs exactas en `SECCIONES.md`. Reemplazar por fotos reales, tratadas con el mismo filtro `grayscale(1) contrast(1.08)` para mantener la unidad visual.

No hay logo: la marca se resuelve con un **cuadrado rojo de 26×26px** más el nombre en Big Shoulders 900. Si el cliente tiene logo, ese cuadrado es el lugar donde va.

Íconos: no se usa ninguna librería. El único glifo es `✳` en la marquesina.

## Files
| Archivo | Qué es |
|---|---|
| `preview-standalone.html` | **Empezá por acá.** La página completa en un archivo único, se abre offline con doble clic. |
| `diseno-original.dc.html` | El fuente del diseño. Markup + estilos inline reales. Ignorá `<x-dc>`, `<sc-if>` y `support.js`. |
| `SECCIONES.md` | Spec detallada sección por sección: layout, contenido exacto, estados, animaciones. |
| `support.js` | Runtime de la herramienta de diseño. Solo está para que el `.dc.html` abra. **No portar.** |

## Pendientes de contenido (bloquean el lanzamiento)
1. **Dirección, teléfono y email reales.** Los que trae la plantilla son de ejemplo (`Av. Siempreviva 742`, `11 5555-5555`, `hola@example.com`). Ya no están cableados en 4 lugares: van una sola vez en `public/sitio/datos.js` y la página los reparte. Ver `docs/contenido-pendiente.md`.
2. **Horarios reales.** Hoy el hero dice «Mañana y tarde», genérico a propósito.
3. **Precios.** Los tres planes dicen «A confirmar».
4. **Fotos del gimnasio.**
5. **Secciones no construidas** que estaban en el pedido original: testimonios, FAQ, mapa y formulario de inscripción. Hoy el único canal de conversión es WhatsApp. Ver la nota al final de `SECCIONES.md`.
