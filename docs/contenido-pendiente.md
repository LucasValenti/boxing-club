# Contenido pendiente

Lo que hay que conseguir del cliente antes de publicar. Ordenado por lo que
bloquea: arriba, lo que impide lanzar; abajo, lo que se puede completar después.

## Bloquea el lanzamiento

### 1. Datos de contacto
Los tres valores que hay hoy salieron de fuentes públicas y **el cliente no los
confirmó**. Van en `public/sitio/datos.js` y desde ahí se estampan solos en los
cuatro lugares donde aparecen.

| Dato | Valor provisorio | Estado |
|---|---|---|
| WhatsApp | `+54 9 341 563-2194` | sin confirmar |
| Teléfono | el mismo | sin confirmar |
| Dirección | Rueda 2553, Rosario | sin confirmar — además bloquea el mapa |
| Email | alanisbox@hotmail.com | sin confirmar |
| Instagram | — | falta |

**Preguntar además:** ¿el WhatsApp que atiende es el mismo número del teléfono?
¿Quién lo lee y en qué horario? Un WhatsApp que nadie contesta a la noche
convierte peor que un formulario.

### 2. Horarios reales
Hoy el hero dice «Mañana y tarde», genérico a propósito. Hacen falta los días y
las franjas de verdad, por tipo de clase si difieren.

### 3. Precios
Los tres planes dicen «A confirmar». Cuando lleguen los montos, el precio vuelve
a su tamaño grande y el sufijo pasa a ser inline (`/mes`, `/sesión`). El layout
no cambia.

### 4. Fotos del gimnasio
Todas las imágenes actuales son de Unsplash: no son el gimnasio. El cliente las
tiene en Instagram. **Qué pedir:** la sala de bolsas, una clase en actividad, el
ring, y un retrato de Charly. Horizontales y verticales, lo más grandes que las
tenga. Se procesan a WebP y se tratan en blanco y negro.

### 5. Verificar los datos del campeón
La sección «El rincón» afirma que Carlos «Junior» Alanís tiene récord 13–1,
medalla de plata en Odesur 2018 y título sudamericano ligero. Salió de fuentes
públicas. **Son afirmaciones verificables sobre una persona real: que las
apruebe el gimnasio antes de publicarlas.** Si no las confirman, la sección se
apaga y la página funciona igual.

## Necesario para las secciones nuevas

### 6. Testimonios
Tres, con nombre, cuánto hace que entrenan y —si aceptan— foto. Sirven más los
concretos («llegué sin poder saltar a la soga») que los elogios.

La sección está construida pero **apagada** (`mostrarTestimonios: false` en
`public/sitio/datos.js`): las tres tarjetas son ranuras vacías. Se completan con
las citas reales y se enciende el interruptor.

### 7. Preguntas frecuentes
Cinco están escritas y publicadas, con respuestas armadas a partir de datos que
sí están en la spec (60 min sin contacto, de 8 a 17 años, guantes incluidos,
grupos de hasta 12). **Que las lea el club y las corrija** — están redactadas
por nosotros, no dictadas por ellos.

Falta la sexta, y no se puede inventar porque es una regla del negocio:

> **¿Qué pasa si falto a una clase?** ¿Se recupera? ¿Hay que avisar? ¿Con
> cuánta anticipación?

Cuando llegue la respuesta se suma en `public/index.html` (sección `#faq`) y en
el bloque `FAQPage` del JSON-LD, con el mismo texto en los dos lados.

### 8. Formulario: a dónde llega
Hoy la propuesta es que abra WhatsApp con el mensaje ya escrito. Si el cliente
prefiere que además le caiga por mail o a una planilla, hay que saberlo antes de
construirlo: cambia la arquitectura (ver `arquitectura.md`).

## Se puede completar después

- **Imagen para compartir** (1200×630) con una foto real: es lo que se ve cuando
  pegan el link en WhatsApp.
- **Logo.** Si existe, reemplaza el cuadrado rojo de la marca.
- **Ficha de Google Business.** Fuera del sitio, pero es lo que más mueve la
  búsqueda local. Conviene abrirla o reclamarla en paralelo.
