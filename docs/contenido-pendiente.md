# Contenido pendiente

Lo que hay que conseguir del cliente antes de publicar. Ordenado por lo que
bloquea: arriba, lo que impide lanzar; abajo, lo que se puede completar después.

## Bloquea el lanzamiento

### 1. El dominio

No está definido, y bloquea más de lo que parece. Hoy el sitio dice
`example.com` en cuatro lugares, y es **un marcador de documentación puesto por
nosotros**, no una dirección que alguien haya comprado:

| Archivo | Qué dice |
|---|---|
| `public/index.html` | `<link rel="canonical">` y `og:url` |
| `public/robots.txt` | la línea `Sitemap:` |
| `public/sitemap.xml` | el `<loc>` |

**Por qué bloquea:** un `canonical` que apunta a un dominio equivocado es peor
que no tener ninguno — le dice a Google que la versión buena de esta página es
otra, y la de verdad se cae de los resultados. Con un dominio sin confirmar, o
se corrigen los cuatro lugares antes de publicar, o se sacan las cuatro líneas.

**Preguntar:** ¿el club ya tiene dominio? ¿A nombre de quién está y quién paga
la renovación? Si no tiene, hay que comprarlo antes del lanzamiento: sale poco y
es lo que va en la ficha de Google Business, en Instagram y en los volantes.

### 2. Datos de contacto
Los valores que trae la plantilla son de ejemplo. Van en
`public/sitio/datos.js` y desde ahí se estampan solos en los cuatro lugares
donde aparecen en la página.

| Dato | Valor de ejemplo | Estado |
|---|---|---|
| WhatsApp | `+54 9 11 5555-5555` | de ejemplo |
| Teléfono | el mismo | de ejemplo |
| Dirección | Av. Siempreviva 742 | de ejemplo — además bloquea el mapa |
| Email | hola@example.com | de ejemplo |
| Instagram | — | falta |

**Preguntar además:** ¿el WhatsApp que atiende es el mismo número del teléfono?
¿Quién lo lee y en qué horario? Un WhatsApp que nadie contesta a la noche
convierte peor que un formulario.

### 3. Horarios reales
Hoy el hero dice «Mañana y tarde», genérico a propósito. Hacen falta los días y
las franjas de verdad, por tipo de clase si difieren.

### 4. Precios
Los tres planes dicen «A confirmar». Cuando lleguen los montos, el precio vuelve
a su tamaño grande y el sufijo pasa a ser inline (`/mes`, `/sesión`). El layout
no cambia.

### 5. Fotos y video del gimnasio
Todas las imágenes actuales son de Unsplash y los dos videos son de Mixkit: no
son el gimnasio. **Qué pedir:** la sala de bolsas, una clase en actividad, el
ring, y un retrato del entrenador. Horizontales y verticales, lo más grandes que
las tenga. Se procesan a WebP con `npm run imagenes` y se tratan en blanco y
negro.

Del video alcanza con dos clips cortos —de 6 a 12 segundos, sin sonido, que es
como se reproducen— grabados con el celular en horizontal o en vertical, da
igual: la tira los recorta al mismo recuadro. Reemplazan a `public/video/*.mp4`
con el mismo nombre y hay que regenerar el póster, que es el primer cuadro.

### 6. ⚠ La licencia de los videos bloquea revender la plantilla
Los dos clips de `public/video/` son de Mixkit. Su licencia permite uso
comercial sin atribución, **pero prohíbe expresamente que el material sea parte
central de un producto que se vende como plantilla.** Vender esta landing a
varios gimnasios con esos archivos adentro cae justo en esa cláusula.

No bloquea publicar el sitio de un club, ni mostrar la demo. Bloquea entregar el
repo con los `.mp4` puestos como producto. **Las tres salidas:** que cada club
ponga su propio video (que es lo que queremos igual), sacar los clips antes de
entregar, o comprar material con licencia de redistribución.

Con las fotos de Unsplash pasa algo parecido pero más flojo: su licencia sí
permite uso comercial, aunque tampoco redistribuirlas «para un servicio
similar». Con material propio del club el problema desaparece entero.

### 7. Datos verificables sobre personas reales
Si el club quiere que «El rincón» nombre a alguien —un boxeador que formó, un
título, un récord— eso deja de ser texto de relleno y pasa a ser una afirmación
sobre una persona identificable. **Que las apruebe el club antes de
publicarlas**, con la fuente a mano.

Hoy la sección está encendida con texto genérico que no afirma nada
verificable, justamente para no depender de esto. El default seguro es no
publicar sobre alguien lo que nadie confirmó.

## Necesario para las secciones nuevas

### 8. Testimonios
Tres, con nombre, cuánto hace que entrenan y —si aceptan— foto. Sirven más los
concretos («llegué sin poder saltar a la soga») que los elogios.

La sección está construida pero **apagada, y además comentada en el HTML**
(`mostrarTestimonios: false` en `public/sitio/datos.js`, y el bloque comentado
en `public/index.html`). Comentada porque el interruptor lo resuelve el
navegador: con solo el flag, las tres «Testimonio pendiente» viajaban igual en
el HTML servido y se veían sin JavaScript. Se descomenta, se completan las
citas reales y se enciende el interruptor.

### 9. Preguntas frecuentes
Cinco están escritas y publicadas, con respuestas armadas a partir de datos que
sí están en la spec (60 min sin contacto, de 8 a 17 años, guantes incluidos,
grupos de hasta 12). **Que las lea el club y las corrija** — están redactadas
por nosotros, no dictadas por ellos.

Falta la sexta, y no se puede inventar porque es una regla del negocio:

> **¿Qué pasa si falto a una clase?** ¿Se recupera? ¿Hay que avisar? ¿Con
> cuánta anticipación?

Cuando llegue la respuesta se suma en `public/index.html` (sección `#faq`) y en
el bloque `FAQPage` del JSON-LD, con el mismo texto en los dos lados.

### 10. Formulario: a dónde llega
Hoy la propuesta es que abra WhatsApp con el mensaje ya escrito. Si el cliente
prefiere que además le caiga por mail o a una planilla, hay que saberlo antes de
construirlo: cambia la arquitectura (ver `arquitectura.md`).

## Se puede completar después

- **Imagen para compartir** (1200×630) con una foto real: es lo que se ve cuando
  pegan el link en WhatsApp.
- **Logo.** Si existe, reemplaza el cuadrado rojo de la marca.
- **Ficha de Google Business.** Fuera del sitio, pero es lo que más mueve la
  búsqueda local. Conviene abrirla o reclamarla en paralelo.
