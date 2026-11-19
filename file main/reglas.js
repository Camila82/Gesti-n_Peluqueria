/* =========================================================
   reglas.js — Reglas de negocio compartidas por todas las páginas
   (M&M Petshop). Centraliza lo que antes estaba repetido o faltaba:
   - Migración de datos guardados en el navegador a la versión 2.
   - Ciclo de vida de la cita (estados y transiciones válidas).
   - Horario de atención, franjas de 30 min y anticipación mínima.
   - Choque de horario por peluquero (misma hora o franjas que se cruzan).
   - Plantilla de confirmación por WhatsApp con {hora}.
   ========================================================= */
(function () {
  "use strict";

  var SCHEMA_VERSION = 2;

  /* ---------- Parámetros del negocio (validados con el propietario) ---------- */
  var HORA_APERTURA = "09:00";
  var HORA_CIERRE = "18:00";
  var DIAS_ATENCION = [1, 2, 3, 4, 5, 6];      // lunes a sábado (0 = domingo)
  var MINUTOS_FRANJA = 30;                     // la agenda va en franjas de 30 minutos
  var ANTICIPACION_RESERVA_MIN = 60;           // reservar con al menos 1 hora
  var ANTICIPACION_CAMBIO_MIN = 120;           // reprogramar o cancelar con al menos 2 horas
  var DURACION_POR_DEFECTO = 60;

  /* ---------- Estados de la cita ---------- */
  var ESTADOS = ["Pendiente", "Confirmada", "Completada", "Cancelada"];
  var ESTADOS_ACTIVOS = ["Pendiente", "Confirmada"];
  var ESTADOS_FINALES = ["Completada", "Cancelada"];
  // Una cita cancelada no se puede completar y una completada no se puede cancelar.
  var TRANSICIONES = {
    Pendiente: ["Confirmada", "Cancelada"],
    Confirmada: ["Completada", "Cancelada"],
    Completada: [],
    Cancelada: []
  };

  /* ---------- Servicios que existían en las citas pero no en el catálogo ---------- */
  var SERVICIOS_FALTANTES = [
    { id: "s10", name: "Baño y corte", meta: "Baño básico más corte de raza o corte de mantenimiento.", price: 55000, duration: 120, species: ["Perro"] },
    { id: "s11", name: "Baño medicado", meta: "Baño con shampoo dermatológico para piel sensible, hongos o dermatitis.", price: 35000, duration: 60, species: ["Perro", "Gato"] },
    { id: "s12", name: "Baño gato", meta: "Baño de bajo estrés para gatos, secado suave y cepillado.", price: 30000, duration: 60, species: ["Gato"] }
  ];
  var DURACIONES = { s1: 60, s2: 90, s3: 90, s4: 60, s5: 30, s6: 30, s7: 30, s8: 30, s9: 0 };
  var ESPECIES = { s3: ["Perro"], s4: ["Gato"] };

  /* ---------- Utilidades ---------- */
  function aMinutos(hhmm) {
    if (!hhmm) return null;
    var p = String(hhmm).split(":");
    return parseInt(p[0], 10) * 60 + parseInt(p[1] || "0", 10);
  }
  function aHora(min) {
    var h = Math.floor(min / 60), m = min % 60;
    return (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m;
  }
  function fechaHora(date, time) {
    return new Date(date + "T" + (time || "00:00") + ":00");
  }

  function servicioPorId(DB, id) {
    return DB.services.find(function (s) { return s.id === id; }) || null;
  }
  function empleadoPorId(DB, id) {
    return DB.employees.find(function (e) { return e.id === id; }) || null;
  }
  function nombreServicio(DB, appt) {
    var s = appt.serviceId ? servicioPorId(DB, appt.serviceId) : null;
    return s ? s.name : (appt.service || "—");
  }
  function nombreEmpleado(DB, appt) {
    var e = appt.employeeId ? empleadoPorId(DB, appt.employeeId) : null;
    return e ? e.name : (appt.professional || "—");
  }
  function duracion(DB, appt) {
    var s = appt.serviceId ? servicioPorId(DB, appt.serviceId) : null;
    return (s && s.duration) ? s.duration : DURACION_POR_DEFECTO;
  }

  /* Servicios que se pueden reservar: activos y con precio (la tienda no es un servicio de agenda). */
  function serviciosReservables(DB) {
    return DB.services.filter(function (s) { return s.active !== false && s.bookable !== false; });
  }
  function empleadosActivos(DB) {
    return DB.employees.filter(function (e) { return e.active !== false; });
  }

  function esActiva(appt) { return ESTADOS_ACTIVOS.indexOf(appt.estado || "Pendiente") !== -1; }
  function esFinal(appt) { return ESTADOS_FINALES.indexOf(appt.estado) !== -1; }

  /* Estados que puede elegir el usuario a partir del estado actual (incluye quedarse igual). */
  function estadosPermitidos(actual) {
    actual = actual || "Pendiente";
    return [actual].concat(TRANSICIONES[actual] || []);
  }
  function puedeCambiar(desde, hacia) {
    desde = desde || "Pendiente";
    return desde === hacia || (TRANSICIONES[desde] || []).indexOf(hacia) !== -1;
  }

  /* ---------- Validación de fecha y hora ---------- */
  function validarFranja(date, time, durMin, opciones) {
    opciones = opciones || {};
    if (!date) return "Elige una fecha.";
    if (!time) return "Elige la hora de la cita.";
    var inicio = aMinutos(time);
    var fin = inicio + (durMin || DURACION_POR_DEFECTO);
    var dia = fechaHora(date, time).getDay();
    if (DIAS_ATENCION.indexOf(dia) === -1) return "La peluquería atiende de lunes a sábado.";
    if (inicio % MINUTOS_FRANJA !== 0) return "La hora debe ser en punto o a la media hora (franjas de 30 minutos).";
    if (inicio < aMinutos(HORA_APERTURA)) return "La atención empieza a las " + HORA_APERTURA + ".";
    if (fin > aMinutos(HORA_CIERRE)) return "El servicio terminaría a las " + aHora(fin) + " y la atención cierra a las " + HORA_CIERRE + ".";
    if (opciones.nueva) {
      var minutosFaltan = (fechaHora(date, time) - new Date()) / 60000;
      if (minutosFaltan < ANTICIPACION_RESERVA_MIN) return "Las citas se reservan con al menos 1 hora de anticipación.";
    }
    return null;
  }

  /* Una cita activa puede reprogramarse o cancelarse si faltan 2 horas o más (el dueño puede siempre). */
  function puedeModificarse(appt, esDueno) {
    if (!esActiva(appt)) return false;
    if (esDueno) return true;
    if (!appt.time) return true;
    return (fechaHora(appt.date, appt.time) - new Date()) / 60000 >= ANTICIPACION_CAMBIO_MIN;
  }

  /* ---------- Choque de horario por peluquero ----------
     Un peluquero no puede tener dos citas activas que se crucen en el tiempo,
     sea el mismo servicio o uno distinto. Devuelve la cita que choca o null. */
  function buscarChoque(DB, datos) {
    if (!datos.employeeId || !datos.date || !datos.time) return null;
    var ini = aMinutos(datos.time);
    var fin = ini + (datos.duration || DURACION_POR_DEFECTO);
    var choque = null;
    DB.pets.forEach(function (pet) {
      pet.appointments.forEach(function (a) {
        if (choque || a.id === datos.excludeId) return;
        if (!esActiva(a) || a.employeeId !== datos.employeeId || a.date !== datos.date || !a.time) return;
        var aIni = aMinutos(a.time);
        var aFin = aIni + duracion(DB, a);
        if (ini < aFin && aIni < fin) choque = { pet: pet, appt: a };
      });
    });
    return choque;
  }

  /* El servicio debe aplicar a la especie de la mascota. */
  function validarEspecie(servicio, pet) {
    if (!servicio || !pet || !servicio.species || !servicio.species.length) return null;
    if (servicio.species.indexOf(pet.species) === -1) {
      return "“" + servicio.name + "” es solo para " + servicio.species.join(" y ").toLowerCase() + "s.";
    }
    return null;
  }

  /* ---------- Confirmación por WhatsApp ---------- */
  function formatoFecha(isoDate) {
    if (!isoDate) return "—";
    return fechaHora(isoDate).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });
  }
  function mensajeConfirmacion(DB, pet, appt) {
    var tpl = (DB.meta && DB.meta.confirmationTemplate) ||
      "¡Hola {cliente}! Tu cita para {mascota} quedó confirmada el {fecha} a las {hora} con {empleado}.";
    var datos = {
      cliente: pet.owner || "",
      mascota: pet.name || "",
      fecha: formatoFecha(appt.date),
      hora: appt.time || "(hora por definir)",
      empleado: nombreEmpleado(DB, appt),
      servicio: nombreServicio(DB, appt)
    };
    return tpl.replace(/\{(\w+)\}/g, function (m, k) { return datos.hasOwnProperty(k) ? datos[k] : m; });
  }
  function enlaceWhatsApp(texto) {
    return "https://wa.me/?text=" + encodeURIComponent(texto);
  }

  /* ---------- Migración de datos guardados (versión 1 → 2) ----------
     Los navegadores que ya usaron el prototipo tienen los datos viejos en
     localStorage. Esta función los actualiza sin perder nada. Devuelve true
     si hizo cambios (para guardarlos). */
  function migrar(DB) {
    if (!DB || !DB.meta) return false;
    if (DB.meta.schemaVersion >= SCHEMA_VERSION) return false;

    SERVICIOS_FALTANTES.forEach(function (nuevo) {
      var existe = DB.services.some(function (s) { return s.name.toLowerCase() === nuevo.name.toLowerCase(); });
      if (!existe) DB.services.push(JSON.parse(JSON.stringify(nuevo)));
    });
    DB.services.forEach(function (s) {
      if (s.active === undefined) s.active = true;
      if (s.duration === undefined) s.duration = DURACIONES.hasOwnProperty(s.id) ? DURACIONES[s.id] : DURACION_POR_DEFECTO;
      if (s.species === undefined) s.species = ESPECIES[s.id] || ["Perro", "Gato"];
      if (s.bookable === undefined) s.bookable = s.price !== null && s.price !== undefined;
    });
    DB.employees.forEach(function (e) { if (e.active === undefined) e.active = true; });

    DB.pets.forEach(function (pet) {
      pet.appointments.forEach(function (a) {
        if (!a.serviceId) {
          var s = DB.services.find(function (x) { return x.name.toLowerCase() === String(a.service || "").toLowerCase(); });
          if (s) a.serviceId = s.id;
        }
        if (a.time === undefined) a.time = "";
        if (!a.estado) a.estado = "Pendiente";
        if (!a.meds) a.meds = [];
      });
    });
    DB.meta.schemaVersion = SCHEMA_VERSION;
    return true;
  }

  window.MMRules = {
    ESTADOS: ESTADOS,
    HORA_APERTURA: HORA_APERTURA,
    HORA_CIERRE: HORA_CIERRE,
    migrar: migrar,
    servicioPorId: servicioPorId,
    empleadoPorId: empleadoPorId,
    nombreServicio: nombreServicio,
    nombreEmpleado: nombreEmpleado,
    duracion: duracion,
    serviciosReservables: serviciosReservables,
    empleadosActivos: empleadosActivos,
    esActiva: esActiva,
    esFinal: esFinal,
    estadosPermitidos: estadosPermitidos,
    puedeCambiar: puedeCambiar,
    validarFranja: validarFranja,
    puedeModificarse: puedeModificarse,
    buscarChoque: buscarChoque,
    validarEspecie: validarEspecie,
    mensajeConfirmacion: mensajeConfirmacion,
    enlaceWhatsApp: enlaceWhatsApp,
    aMinutos: aMinutos
  };
})();
