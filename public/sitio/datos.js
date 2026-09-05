/* Datos del negocio. Este es el único lugar del sitio donde viven el
   teléfono, la dirección y el mail.
   ────────────────────────────────────────────────────────────────────────
   Por qué: en el prototipo el teléfono estaba escrito a mano en 4 lugares
   (botón del header, botón de WhatsApp, botón de llamar y línea de datos) y
   ninguno de esos valores está confirmado por el cliente. Cuando confirme,
   se cambia acá y app.js lo estampa en los cuatro.
   ──────────────────────────────────────────────────────────────────────── */

window.NEGOCIO = {
  nombre: "Alanis Boxing Club",
  ciudad: "Rosario",
  provincia: "Santa Fe",

  /* ⚠ SIN CONFIRMAR — los tres salieron de fuentes públicas, no del cliente.
     Ver docs/contenido-pendiente.md antes de publicar. */
  telefono: "+5493415632194",     // formato internacional, para el link tel:
  telefonoVisible: "341 563-2194",
  whatsapp: "5493415632194",      // solo dígitos, como lo quiere wa.me
  direccion: "Rueda 2553",
  email: "alanisbox@hotmail.com",

  /* ⚠ SIN CONFIRMAR — hoy el hero dice algo genérico a propósito. */
  horarios: "Mañana y tarde",

  /* El mensaje que ya viene escrito al abrir WhatsApp. Sin esto la persona
     tiene que redactar, y ahí es donde se cae la conversión. */
  saludo: "¡Hola! Quiero reservar mi primera clase gratis.",

  instagram: null,   // ⚠ pedir al cliente: ahí están las fotos reales
};

/* Interruptores de contenido.
   ────────────────────────────────────────────────────────────────────────
   Existen porque hay secciones que dependen de datos que el club todavía no
   confirmó. Apagadas, la sección desaparece del documento y la página se
   publica igual: el lanzamiento no queda rehén de un dato que falta.
   ──────────────────────────────────────────────────────────────────────── */
window.MOSTRAR = {
  mostrarLinaje: true,       // «El rincón» — los datos de Junior Alanís están
                             //   sin verificar. Apagalo si no los confirman.
  mostrarPrecios: true,      // «Los planes» — hoy dicen «A confirmar».
  mostrarTestimonios: false, // Apagada: las tres tarjetas son ranuras vacías.
                             //   Se enciende cuando lleguen los reales.
};

/* wa.me con el mensaje ya cargado. */
window.linkWhatsApp = function (texto) {
  var n = window.NEGOCIO;
  return "https://wa.me/" + n.whatsapp + "?text=" + encodeURIComponent(texto || n.saludo);
};
