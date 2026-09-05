/* Todo el JavaScript del sitio. Son tres cosas: estampar los datos de
   contacto, revelar al hacer scroll y abrir el menú en mobile.
   No hay framework. El contenido ya está en el HTML: si esto no carga, la
   página se lee igual y los links siguen funcionando. */
(function () {
  "use strict";

  var N = window.NEGOCIO || {};
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

  estampar();
  revelar();
  menu();
})();
