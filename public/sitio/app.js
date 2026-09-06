/* Todo el JavaScript del sitio. No hay framework y no hay build.
   Nada de lo que hay acá inventa contenido: el texto, las fotos y los links
   ya están en el HTML. Si este archivo no carga, la página se lee igual, se
   navega igual y los botones de WhatsApp siguen funcionando — lo único que
   se pierde es el pulido. Esa es la regla y conviene no romperla. */
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

      /* window.open puede devolver null: un bloqueador de ventanas, o un
         navegador embebido como el de Instagram, que es por donde entra
         buena parte de este público. Sin esto el aviso decía que abrimos
         WhatsApp cuando no se abrió nada — la peor forma de perder una
         consulta que la persona ya se tomó el trabajo de escribir. */
      var url = window.linkWhatsApp(texto);
      if (window.open(url, "_blank", "noopener")) {
        aviso.textContent = "Te abrimos WhatsApp con el mensaje escrito.";
      } else {
        aviso.textContent = "";
        var link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener";
        link.className = "btn btn--negro";
        link.textContent = "Abrir WhatsApp";
        aviso.appendChild(link);
        /* El foco va al link: si no, quien navega con teclado o con lector
           de pantalla no se entera de que la acción cambió de lugar. */
        link.focus();
      }
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

  /* ── 7. El alto del header ──────────────────────────────────────────────
     La primera pantalla mide «lo que entra sin scrollear» = pantalla menos
     header. El header es sticky, o sea que ocupa lugar en el flujo, así que
     hay que descontarlo o el hero termina un poco más abajo del borde.

     Se mide en vez de escribirse a mano porque el alto cambia solo: con el
     ancho de pantalla (arriba de 640px aparece el nav entero) y con la
     tipografía, que carga después de este script y mueve todo unos píxeles.
     El ResizeObserver es justamente para ese segundo caso — sin él el valor
     queda viejo desde el primer segundo. layout.css deja 56px de arranque
     por si esto no corre. */
  function medirHeader() {
    var header = document.querySelector(".header");
    if (!header) return;
    function poner() {
      document.documentElement.style.setProperty(
        "--alto-header", header.offsetHeight + "px");
    }
    poner();
    if ("ResizeObserver" in window) new ResizeObserver(poner).observe(header);
    else window.addEventListener("resize", poner);
  }

  /* ── 8. Los controles de la tira ────────────────────────────────────────
     La tira se arrastra sola: es scroll nativo con scroll-snap, anda con el
     dedo, con la rueda y con las flechas del teclado sin que nadie escriba
     una línea. Lo que falta es que se vea que sigue, y con qué apuntarle en
     escritorio. Eso es todo lo que agrega esto.

     Los botones los crea el JS y no están en el HTML a propósito: sin JS no
     harían nada y serían dos cuadrados muertos en la página. */
  function tira() {
    var pista = document.querySelector("[data-tira]");
    if (!pista) return;

    var control = document.createElement("div");
    control.className = "tira-control";
    control.innerHTML =
      '<div class="tira-barra" aria-hidden="true"><span></span></div>' +
      '<div class="tira-flechas">' +
        '<button type="button" data-tira-boton="atras" aria-label="Ver lo anterior"></button>' +
        '<button type="button" data-tira-boton="adelante" aria-label="Ver lo siguiente"></button>' +
      '</div>';
    pista.after(control);

    var relleno  = control.querySelector(".tira-barra span");
    var atras    = control.querySelector('[data-tira-boton="atras"]');
    var adelante = control.querySelector('[data-tira-boton="adelante"]');

    /* Un paso es una pieza más el hueco. Se mide cada vez en vez de
       guardarse: el ancho es un clamp() con vw adentro y cambia al girar el
       teléfono. */
    function paso() {
      var pieza = pista.querySelector(".tira__item");
      if (!pieza) return 300;
      var hueco = parseFloat(getComputedStyle(pista).columnGap) || 0;
      return pieza.getBoundingClientRect().width + hueco;
    }

    function pintar() {
      var resto = pista.scrollWidth - pista.clientWidth;
      var visto = pista.clientWidth / pista.scrollWidth;
      var avance = resto > 0 ? pista.scrollLeft / resto : 0;
      relleno.style.setProperty("--avance", (visto * 100).toFixed(2) + "%");
      /* El corrimiento va en % del propio relleno: para llegar justo al
         final tiene que viajar (1-visto)/visto de su ancho. */
      relleno.style.transform =
        "translateX(" + (avance * (100 / visto - 100)).toFixed(2) + "%)";
      atras.disabled = avance <= 0.001;
      adelante.disabled = avance >= 0.999;
    }

    var suave = menosMovimiento ? "auto" : "smooth";
    atras.addEventListener("click", function () {
      pista.scrollBy({ left: -paso(), behavior: suave });
    });
    adelante.addEventListener("click", function () {
      pista.scrollBy({ left: paso(), behavior: suave });
    });
    pista.addEventListener("scroll", pintar, { passive: true });
    window.addEventListener("resize", pintar);
    pintar();
  }

  /* ── 9. Los videos de la tira ───────────────────────────────────────────
     Un video en la tira se comporta como una foto que se mueve: arranca
     solo cuando lo estás mirando y para en cuanto lo pasás. Eso es lo que
     evita que dos videos descarguen y decodifiquen a la vez en un celular
     —vienen con preload="none", así que hasta que no se llama a play() no
     se baja un solo byte.

     El botón de pausa no es un adorno: un bucle que arranca solo y dura más
     de cinco segundos necesita una manera de frenarlo (WCAG 2.2.2). Y con
     movimiento reducido no arranca ninguno: quedan en el póster, con el
     botón, que es exactamente lo que pidió quien puso esa opción. */
  function videos() {
    var clips = document.querySelectorAll("[data-video]");
    if (!clips.length) return;

    clips.forEach(function (v) {
      /* controls estaba en el HTML para quien no tenga JavaScript: ahí el
         video se reproduce a mano y con los controles del navegador. Con JS
         manda el botón propio, que sigue el diseño. */
      v.controls = false;

      var marca = document.createElement("span");
      marca.className = "tira__marca";
      marca.textContent = "Video";

      var boton = document.createElement("button");
      boton.type = "button";
      boton.className = "tira__play";

      function estado(anda) {
        boton.dataset.estado = anda ? "anda" : "quieto";
        boton.setAttribute("aria-label", anda ? "Pausar el video" : "Reproducir el video");
      }
      estado(false);

      boton.addEventListener("click", function () {
        /* Queda anotado que lo frenó una persona: si no, al volver a
           entrar en pantalla el observador lo arrancaría de nuevo y el
           botón de pausa no serviría para nada. */
        if (v.paused) { v.dataset.manual = "anda"; v.play().catch(function () {}); }
        else { v.dataset.manual = "quieto"; v.pause(); }
      });
      v.addEventListener("play", function () { estado(true); });
      v.addEventListener("pause", function () { estado(false); });

      v.parentNode.append(marca, boton);
    });

    if (menosMovimiento || !("IntersectionObserver" in window)) return;

    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        var v = e.target;
        if (!e.isIntersecting) { v.pause(); return; }
        /* Parar siempre, arrancar solo si nadie lo frenó a mano. */
        if (v.dataset.manual !== "quieto") v.play().catch(function () {});
      });
    }, { threshold: 0.6 });
    clips.forEach(function (v) { obs.observe(v); });
  }

  /* Los interruptores van primero: no tiene sentido observar ni estampar
     nada dentro de una sección que se va a borrar. */
  flags();
  estampar();
  revelar();
  menu();
  reserva();
  anio();
  medirHeader();
  tira();
  videos();
})();
