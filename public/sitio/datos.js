/* Configuración del gimnasio. Este es el ÚNICO archivo que hay que tocar
   para adaptar la plantilla a otro club.
   ────────────────────────────────────────────────────────────────────────
   Todos los valores de acá abajo son de ejemplo y hay que reemplazarlos.
   El HTML marca cada destino con data-negocio y app.js los completa al
   cargar, así que cambiar el teléfono es cambiar una línea y no buscarlo
   en cuatro lugares del markup.

   Los valores también están escritos en el HTML, así que si el JavaScript
   no corre los links funcionan igual: el JS actualiza, no habilita.
   ──────────────────────────────────────────────────────────────────────── */

window.NEGOCIO = {
  nombre: "Club de Boxeo",
  ciudad: "Tu Ciudad",
  provincia: "Tu Provincia",

  /* Teléfono de ejemplo, con el 5555 de la ficción para que se note que no
     es real. El link de wa.me no va a funcionar hasta que se reemplace. */
  telefono: "+5491155555555",     // formato internacional, para el link tel:
  telefonoVisible: "11 5555-5555",
  whatsapp: "5491155555555",      // solo dígitos, como lo quiere wa.me

  /* Dirección y mail de ejemplo. example.com está reservado justamente
     para documentación, así que nunca le va a llegar un mail a nadie. */
  direccion: "Av. Siempreviva 742",
  email: "hola@example.com",

  horarios: "Mañana y tarde",

  /* El mensaje que ya viene escrito al abrir WhatsApp. Sin esto la persona
     tiene que redactar, y ahí es donde se cae la conversión. */
  saludo: "¡Hola! Quiero reservar mi primera clase gratis.",

  instagram: null,   // el perfil del club, cuando lo haya
};

/* Interruptores de contenido.
   ────────────────────────────────────────────────────────────────────────
   Cada sección que depende de material que el club todavía no entregó se
   puede apagar desde acá. Apagada, la sección se saca del documento entero
   y la página se publica igual: el lanzamiento no queda rehén de un dato
   que falta.
   ──────────────────────────────────────────────────────────────────────── */
window.MOSTRAR = {
  mostrarLinaje: true,       // «El rincón» — la experiencia del equipo.
  mostrarPrecios: true,      // «Los planes» — los montos son de ejemplo.
  mostrarTestimonios: false, // Apagada y comentada en el HTML: no se inventan
                             //   testimonios. Se enciende cuando lleguen los
                             //   reales, con nombre y permiso de cada persona.
};

/* wa.me con el mensaje ya cargado. */
window.linkWhatsApp = function (texto) {
  var n = window.NEGOCIO;
  return "https://wa.me/" + n.whatsapp + "?text=" + encodeURIComponent(texto || n.saludo);
};
