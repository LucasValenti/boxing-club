/* Todo el JavaScript del sitio. Son tres cosas: estampar los datos de
   contacto, revelar al hacer scroll y abrir el menú en mobile.
   No hay framework. El contenido ya está en el HTML: si esto no carga, la
   página se lee igual y los links siguen funcionando. */
(function () {
  "use strict";

  var N = window.NEGOCIO || {};
  var MOSTRAR = window.MOSTRAR || {};
  var menosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── 1. Datos de contacto ───────────────────────────────────────────────
     El HTML marca los lugares con data-negocio y acá se llenan. Los valores
     que van en el markup son los mismos de datos.js, así que si el JS no
     corre no se rompe nada: solo deja de actualizarse solo. */
  function estampar() {
    document.querySelectorAll("[data-negocio]").forEach(function (el) {
      var campo = el.getAttribute("data-negocio");

      if (campo === "whatsapp") {
        el.href = window.linkWhatsApp(el.getAttribute("data-saludo"));
      } else if (campo === "telefono") {
        el.href = "tel:" + N.telefono;
        var etiqueta = el.querySelector("[data-negocio-texto]") || el;
        if (etiqueta === el) etiqueta.textContent = N.telefonoVisible;
      } else if (campo === "email") {
        el.href = "mailto:" + N.email;
        el.textContent = N.email;
      } else if (campo === "mapa") {
        el.href = "https://www.google.com/maps/search/?api=1&query=" +
          encodeURIComponent([N.direccion, N.ciudad, N.provincia].filter(Boolean).join(", "));
      } else if (N[campo] != null) {
        el.textContent = N[campo];
      }
    });
  }

  /* ── 2. Reveal al hacer scroll ──────────────────────────────────────────
     Una sola vez por elemento, en cascada de a cuatro. Con movimiento
     reducido no se observa nada y todo queda visible desde el arranque
     (el CSS ya lo deja opaco; acá solo evitamos el trabajo). */
  function revelar() {
    var elementos = document.querySelectorAll("[data-reveal]");
    if (menosMovimiento || !("IntersectionObserver" in window)) {
      elementos.forEach(function (el) { el.classList.add("visible"); });
      return;
    }
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e, i) {
        if (!e.isIntersecting) return;
        e.target.style.transitionDelay = (i % 4) * 0.07 + "s";
        e.target.classList.add("visible");
        obs.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    elementos.forEach(function (el) { obs.observe(el); });
  }

  /* ── 3. Menú en mobile ──────────────────────────────────────────────────
     El prototipo no resolvía esto: los cuatro ítems del nav se apretaban
     hasta entrar. Debajo de 640px el nav se pliega en un panel. */
  function menu() {
    var boton = document.querySelector("[data-menu-boton]");
    var panel = document.querySelector("[data-menu-panel]");
    if (!boton || !panel) return;

    function abrir(si) {
      boton.setAttribute("aria-expanded", String(si));
      panel.hidden = !si;
      document.body.style.overflow = si ? "hidden" : "";
    }
    boton.addEventListener("click", function () {
      abrir(boton.getAttribute("aria-expanded") !== "true");
    });
    /* Elegir un destino cierra el panel; si no, tapa la sección a la que
       acabás de saltar. */
    panel.addEventListener("click", function (e) {
      if (e.target.closest("a")) abrir(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && boton.getAttribute("aria-expanded") === "true") {
        abrir(false); boton.focus();
      }
    });
  }

  /* ── 4. Interruptores de contenido ──────────────────────────────────────
     Una sección apagada se saca del documento entero, no se esconde con
     CSS: si «Los planes» no sale, tampoco tiene que salir en la búsqueda
     del navegador ni en lo que lee Google. */
  function flags() {
    document.querySelectorAll("[data-flag]").forEach(function (el) {
      if (MOSTRAR[el.getAttribute("data-flag")] !== true) el.remove();
    });
  }

  /* ── 5. El formulario ───────────────────────────────────────────────────
     No hay servidor: los campos arman el mensaje y se abre WhatsApp con el
     texto ya escrito. Menos piezas que mantener, y la consulta llega al
     canal que el club ya mira. */
  function reserva() {
    var form = document.querySelector("[data-reserva]");
    if (!form) return;
    var aviso = form.querySelector("[data-reserva-aviso]");

    function marcar(campo, mal) {
      campo.setAttribute("aria-invalid", mal ? "true" : "false");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var nombre = form.nombre, telefono = form.telefono;
      var faltan = [];

      [nombre, telefono].forEach(function (c) {
        var vacio = !c.value.trim();
        marcar(c, vacio);
        if (vacio) faltan.push(c);
      });

      if (faltan.length) {
        /* El aviso nombra el campo como lo ve la persona, no como se llama
           en el HTML: la etiqueta de la pantalla, no el atributo name. */
        aviso.textContent = "Nos falta tu " + faltan.map(function (c) {
          return form.querySelector('label[for="' + c.id + '"]').textContent.toLowerCase();
        }).join(" y tu ") + ".";
        /* Y el foco va al primero que falta: sin esto, quien navega con
           teclado o lector de pantalla no se entera de qué pasó. */
        faltan[0].focus();
        return;
      }

      var texto = "¡Hola! Quiero reservar mi primera clase gratis." +
        "\n\nNombre: " + nombre.value.trim() +
        "\nTeléfono: " + telefono.value.trim() +
        "\nClase: " + form.clase.value +
        (form.dias.value.trim() ? "\nDías: " + form.dias.value.trim() : "");

      aviso.textContent = "Te abrimos WhatsApp con el mensaje escrito.";
      window.open(window.linkWhatsApp(texto), "_blank", "noopener");
    });

    /* Escribir algo borra el aviso de error de ese campo. */
    form.addEventListener("input", function (e) {
      if (e.target.value.trim()) { marcar(e.target, false); aviso.textContent = ""; }
    });
  }

  /* ── 6. El año del pie ──────────────────────────────────────────────── */
  function anio() {
    var el = document.querySelector("[data-anio]");
    if (el) el.textContent = new Date().getFullYear();
  }

  /* Los interruptores van primero: no tiene sentido observar ni estampar
     nada dentro de una sección que se va a borrar. */
  flags();
  estampar();
  revelar();
  menu();
  reserva();
  anio();
})();
