/* =========================================================
   M&M PETSHOP — main.js
   Sin dependencias externas. Funciona en todas las páginas.
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

  /* ---------- Menú móvil ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      links.classList.toggle("open");
      var expanded = links.classList.contains("open");
      toggle.setAttribute("aria-expanded", expanded);
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { links.classList.remove("open"); });
    });
  }

  /* ---------- Revelado suave al hacer scroll (una sola vez) ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Filtros de galería (galeria.html) ---------- */
  var filterBtns = document.querySelectorAll(".filter-btn");
  var galleryItems = document.querySelectorAll("[data-category]");
  if (filterBtns.length && galleryItems.length) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterBtns.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        var value = btn.getAttribute("data-filter");
        galleryItems.forEach(function (item) {
          var match = value === "todos" || item.getAttribute("data-category") === value;
          item.style.display = match ? "" : "none";
        });
      });
    });
  }

  /* ---------- Validación del formulario de contacto ---------- */
  var form = document.getElementById("contact-form");
  if (form) {
    var note = document.getElementById("form-note");
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = form.querySelector("#name").value.trim();
      var phone = form.querySelector("#phone").value.trim();
      var message = form.querySelector("#message").value.trim();
      var petChecked = form.querySelectorAll(".pet-toggle input:checked").length > 0;

      if (!name || !phone || !message) {
        showNote("Por favor completa nombre, teléfono y mensaje.", "err");
        return;
      }
      if (!petChecked) {
        showNote("Selecciona al menos una mascota (perro o gato).", "err");
        return;
      }

      // Aquí se conectaría un backend o servicio de correo real.
      showNote("¡Gracias, " + name.split(" ")[0] + "! Te responderemos muy pronto por WhatsApp o correo.", "ok");
      form.reset();
    });

    function showNote(text, type) {
      note.textContent = text;
      note.className = "form-note " + type;
    }
  }

  /* ---------- Año dinámico en el footer ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

});
