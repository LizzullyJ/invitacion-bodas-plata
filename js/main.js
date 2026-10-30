/* Sin dependencias. También funciona al abrir index.html directamente. */
(() => {
  "use strict";

  const config = invitationConfig;
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const svgNS = "http://www.w3.org/2000/svg";
  const pad = (value) => String(value).padStart(2, "0");
  const couple = `${config.couple.name1} y ${config.couple.name2}`;
  const timeZone = config.event.timeZone || "America/Mexico_City";
  let eventStart;
  let toastTimeout;

  function getValue(path) {
    return path.split(".").reduce((value, key) => value?.[key], config);
  }

  function makeIcon(name) {
    const allowed = ["church", "sparkles", "utensils", "glasses", "music", "heart", "camera", "arrow"];
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("class", "icon");
    svg.setAttribute("aria-hidden", "true");
    const use = document.createElementNS(svgNS, "use");
    use.setAttribute("href", `#i-${allowed.includes(name) ? name : "heart"}`);
    svg.append(use);
    return svg;
  }

  function parseDate(date) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(date));
    if (!match) throw new Error("La fecha debe tener formato AAAA-MM-DD.");
    const [, year, month, day] = match.map(Number);
    const check = new Date(Date.UTC(year, month - 1, day));
    if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
      throw new Error("La fecha configurada no existe.");
    }
    return { year, month, day };
  }

  function parseTime(time) {
    const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(time));
    if (!match) throw new Error("La hora debe tener formato HH:MM de 24 horas.");
    return { hour: Number(match[1]), minute: Number(match[2]) };
  }

  function clockParts(time) {
    const { hour, minute } = parseTime(time);
    return { clock: `${hour % 12 || 12}:${pad(minute)}`, period: hour < 12 ? "a. m." : "p. m." };
  }

  function formatClock(time) {
    const { clock, period } = clockParts(time);
    return `${clock} ${period}`;
  }

  function renderClock(node, time) {
    const { clock, period } = clockParts(time);
    const suffix = document.createElement("span");
    suffix.textContent = period;
    node.replaceChildren(document.createTextNode(`${clock} `), suffix);
    node.dateTime = time;
  }

  function scheduleTime(item) {
    const start = formatClock(item.time);
    return item.endTime ? `${start} a ${formatClock(item.endTime)}${item.endDayOffset ? " del día siguiente" : ""}` : start;
  }

  // Convierte una hora local IANA en un instante; nunca usa la zona del visitante.
  function zonedDateTime(date, time, zone) {
    const { year, month, day } = parseDate(date);
    const { hour, minute } = parseTime(time);
    const wanted = Date.UTC(year, month - 1, day, hour, minute);
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23"
    });
    let candidate = wanted;
    for (let pass = 0; pass < 5; pass += 1) {
      const parts = Object.fromEntries(formatter.formatToParts(candidate).filter((p) => p.type !== "literal").map((p) => [p.type, Number(p.value)]));
      const represented = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
      const difference = wanted - represented;
      if (difference === 0) return new Date(candidate);
      candidate += difference;
    }
    throw new Error("Esta hora no existe en la zona elegida. Usa dateTimeISO con un desplazamiento UTC explícito.");
  }

  function resolveEventDate() {
    if (config.event.dateTimeISO) {
      const iso = String(config.event.dateTimeISO);
      if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::[0-5]\d)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.test(iso)) {
        throw new Error("dateTimeISO debe incluir Z o un desplazamiento como -06:00.");
      }
      parseDate(iso.slice(0, 10));
      parseTime(iso.slice(11, 16));
      const date = new Date(iso);
      if (!Number.isFinite(date.getTime())) throw new Error("dateTimeISO no es válido.");
      new Intl.DateTimeFormat("es-MX", { timeZone }).format(date);
      return date;
    }
    return zonedDateTime(config.event.date, config.event.time, timeZone);
  }

  function datePart(date, options) {
    return new Intl.DateTimeFormat("es-MX", { timeZone, ...options }).format(date);
  }

  function fullDate(date) {
    return datePart(date, { day: "numeric", month: "long", year: "numeric" });
  }

  function localDateString(date) {
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
    const values = Object.fromEntries(parts.map((p) => [p.type, p.value]));
    return `${values.year}-${values.month}-${values.day}`;
  }

  function hydrateContent() {
    $$('[data-bind]').forEach((node) => {
      const value = getValue(node.dataset.bind);
      if (value !== undefined && value !== null) node.textContent = String(value);
    });
    $$('[data-couple]').forEach((node) => {
      const ampersand = document.createElement("span");
      ampersand.textContent = "&";
      node.replaceChildren(document.createTextNode(`${config.couple.name1} `), ampersand, document.createTextNode(` ${config.couple.name2}`));
    });
    const emphasis = document.createElement("em");
    emphasis.textContent = String(config.event.title).trim();
    $("#hero-title").replaceChildren(emphasis);
    $(".brand").setAttribute("aria-label", `${couple}, inicio`);
    $(".hero-art").setAttribute("aria-label", `${config.couple.anniversaryYears} años juntos`);
    document.title = `${config.couple.name1} & ${config.couple.name2} · Bodas de Plata`;
    $('meta[property="og:title"]').content = document.title;
    if (eventStart) {
      const year = Number(datePart(eventStart, { year: "numeric" }));
      const dateCard = $("#event-date");
      if (dateCard) {
        dateCard.dateTime = localDateString(eventStart);
        dateCard.setAttribute("aria-label", datePart(eventStart, { weekday: "long", day: "numeric", month: "long", year: "numeric" }));
      }
      const anniversary = Number(config.couple.anniversaryYears);
      $$('[data-years]').forEach((node) => { node.textContent = `${year - anniversary} — ${year}`; });
      const display = `${datePart(eventStart, { day: "numeric" })} · ${datePart(eventStart, { month: "long" })} · ${year}`.toLocaleUpperCase("es-MX");
      $$('[data-date="hero"]').forEach((node) => { node.textContent = display; node.dateTime = localDateString(eventStart); });
      for (const [key, options] of Object.entries({ weekday: { weekday: "long" }, day: { day: "numeric" }, month: { month: "long" }, year: { year: "numeric" } })) {
        $$(`[data-date="${key}"]`).forEach((node) => { node.textContent = datePart(eventStart, options).toLocaleUpperCase("es-MX"); });
      }
      const description = `${couple} te invitan a celebrar ${config.couple.anniversaryYears} años de amor el ${fullDate(eventStart)}. ${config.event.title}.`;
      $('meta[name="description"]').content = description;
      $('meta[property="og:description"]').content = description;
    } else {
      $$('[data-date]').filter((node) => node.dataset.date !== "deadline").forEach((node) => { node.textContent = "Fecha por confirmar"; node.removeAttribute("datetime"); });
      $("#calendar-button").hidden = true;
      if ($("#event-date")) $("#event-date").hidden = true;
    }
    try {
      const deadline = zonedDateTime(config.rsvp.deadline, "12:00", timeZone);
      $$('[data-date="deadline"]').forEach((node) => { node.textContent = fullDate(deadline); node.dateTime = config.rsvp.deadline; });
    } catch {
      $(".rsvp-deadline").hidden = true;
    }
    for (const kind of ["ceremony", "reception"]) {
      const node = $(`[data-time="${kind}"]`);
      try {
        renderClock(node, config[kind].time);
      } catch { node.textContent = "Horario por confirmar"; }
    }
    renderTimeline();
    renderGallery();
  }

  function safeGallerySource(value) {
    if (typeof value !== "string" || !value.trim()) return null;
    const source = value.trim();
    try {
      if (source.startsWith("assets/images/") && !/[?#\\]/.test(source)) {
        const decoded = decodeURIComponent(source);
        if (!decoded.includes("\\") && !decoded.split("/").some((part) => part === ".." || part === ".")) return source;
        return null;
      }
      const url = new URL(source);
      return url.protocol === "https:" && !url.username && !url.password && !url.port ? url.href : null;
    } catch { return null; }
  }

  function renderGallery() {
    const grid = $("#gallery-grid");
    if (!grid || !config.gallery) return;
    const photos = (Array.isArray(config.gallery.photos) ? config.gallery.photos : [])
      .map((photo) => ({ ...photo, safeSource: safeGallerySource(photo?.src) }))
      .filter((photo) => photo.safeSource);
    if (!photos.length) return;

    const viewport = document.createElement("div");
    viewport.className = "album-viewport";
    viewport.id = "gallery-viewport";
    const track = document.createElement("div");
    track.className = "album-track";
    photos.forEach((photo, index) => {
      const card = document.createElement("figure");
      card.className = "photo-card album-slide";
      card.id = "gallery-photo-" + (index + 1);
      card.setAttribute("role", "group");
      card.setAttribute("aria-roledescription", "diapositiva");
      card.setAttribute("aria-label", (index + 1) + " de " + photos.length);
      card.setAttribute("aria-hidden", String(index !== 0));
      card.classList.toggle("is-active", index === 0);
      const frame = document.createElement("div");
      frame.className = "album-photo";
      const img = document.createElement("img");
      img.src = photo.safeSource;
      img.alt = String(photo.alt || photo.caption || ("Fotografía de " + couple));
      img.width = 800;
      img.height = 1000;
      img.loading = "lazy";
      img.decoding = "async";
      img.addEventListener("error", () => {
        const unavailable = document.createElement("div");
        unavailable.className = "photo-placeholder photo-unavailable";
        const message = document.createElement("span");
        message.textContent = "Fotografía no disponible";
        unavailable.append(makeIcon("camera"), message);
        img.replaceWith(unavailable);
      }, { once: true });
      frame.append(img);
      card.append(frame);
      if (photo.caption) {
        const caption = document.createElement("figcaption");
        caption.textContent = String(photo.caption);
        card.append(caption);
      }
      track.append(card);
    });
    viewport.append(track);
    grid.replaceChildren(viewport);
    grid.removeAttribute("aria-hidden");
    grid.setAttribute("role", "group");
    grid.setAttribute("aria-labelledby", "gallery-title");
    grid.classList.add("has-photos");
    grid.classList.toggle("has-single-photo", photos.length === 1);
    $("#gallery-message").textContent = config.gallery.message;
    if (photos.length > 1) initAlbumCarousel(grid, viewport, track, photos);
  }

  function initAlbumCarousel(grid, viewport, track, photos) {
    grid.setAttribute("aria-roledescription", "carrusel");
    viewport.tabIndex = 0;
    viewport.setAttribute("role", "group");
    viewport.setAttribute("aria-label", "Fotografías. Usa las flechas del teclado para cambiar de foto.");
    const controls = document.createElement("div");
    controls.className = "album-controls";
    const paging = document.createElement("div");
    paging.className = "album-paging";
    const button = (label, className, icon) => {
      const node = document.createElement("button");
      node.type = "button";
      node.className = className;
      node.setAttribute("aria-label", label);
      node.setAttribute("aria-controls", "gallery-viewport");
      if (icon) node.append(makeIcon(icon));
      return node;
    };
    const previous = button("Foto anterior", "album-arrow album-previous", "arrow");
    const next = button("Siguiente foto", "album-arrow album-next", "arrow");
    const counter = document.createElement("span");
    counter.className = "album-counter";
    counter.setAttribute("aria-hidden", "true");
    paging.append(previous, counter, next);
    const dots = document.createElement("div");
    dots.className = "album-dots";
    dots.setAttribute("role", "group");
    dots.setAttribute("aria-label", "Elegir fotografía");
    photos.forEach((photo, index) => {
      const dot = button("Ver foto " + (index + 1), "album-dot");
      dot.setAttribute("aria-controls", "gallery-photo-" + (index + 1));
      const thumbnail = document.createElement("img");
      thumbnail.src = photo.safeSource;
      thumbnail.alt = "";
      thumbnail.width = 120;
      thumbnail.height = 80;
      thumbnail.loading = "lazy";
      thumbnail.decoding = "async";
      const fallback = document.createElement("span");
      fallback.textContent = pad(index + 1);
      fallback.setAttribute("aria-hidden", "true");
      fallback.hidden = true;
      thumbnail.addEventListener("error", () => { thumbnail.hidden = true; fallback.hidden = false; }, { once: true });
      dot.append(thumbnail, fallback);
      dot.addEventListener("click", () => show(index, true));
      dots.append(dot);
    });
    const status = document.createElement("span");
    status.className = "album-status";
    status.setAttribute("role", "status");
    status.setAttribute("aria-atomic", "true");
    controls.append(paging, dots, status);
    grid.append(controls);

    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const interval = Number(config.gallery.intervalMs);
    const delay = Number.isFinite(interval) ? Math.min(60000, Math.max(3000, interval)) : 5000;
    let index = 0;
    let hovering = false;
    let keyboardFocus = false;
    let visible = !("IntersectionObserver" in window);
    let timer;
    let touch;

    function schedule() {
      clearTimeout(timer);
      if (!motion.matches && !hovering && !keyboardFocus && visible && !document.hidden) {
        timer = setTimeout(() => show(index + 1), delay);
      }
    }

    function show(position, manual = false) {
      index = (position + photos.length) % photos.length;
      [...track.children].forEach((slide, current) => {
        slide.classList.toggle("is-active", current === index);
        slide.setAttribute("aria-hidden", String(current !== index));
        if (current === index) {
          const img = slide.querySelector("img");
          if (img) img.loading = "eager";
        }
      });
      [...dots.children].forEach((dot, current) => {
        if (current === index) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      });
      counter.textContent = pad(index + 1) + " / " + pad(photos.length);
      if (manual) status.textContent = "Foto " + (index + 1) + " de " + photos.length + (photos[index].caption ? ": " + photos[index].caption : ".");
      schedule();
    }

    previous.addEventListener("click", () => show(index - 1, true));
    next.addEventListener("click", () => show(index + 1, true));
    grid.addEventListener("keydown", (event) => {
      keyboardFocus = true;
      schedule();
      const positions = { ArrowLeft: index - 1, ArrowRight: index + 1, Home: 0, End: photos.length - 1 };
      if (!(event.key in positions)) return;
      event.preventDefault();
      show(positions[event.key], true);
    });
    grid.addEventListener("focusin", (event) => {
      keyboardFocus = event.target.matches(":focus-visible");
      schedule();
    });
    grid.addEventListener("focusout", (event) => {
      if (grid.contains(event.relatedTarget)) return;
      keyboardFocus = false;
      schedule();
    });
    grid.addEventListener("pointerdown", () => { keyboardFocus = false; schedule(); });
    grid.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "touch") return;
      hovering = true;
      schedule();
    });
    grid.addEventListener("pointerleave", () => { hovering = false; schedule(); });
    viewport.addEventListener("pointerdown", (event) => {
      if (event.pointerType !== "touch" && event.pointerType !== "pen") return;
      touch = { id: event.pointerId, x: event.clientX, y: event.clientY };
      viewport.setPointerCapture(event.pointerId);
    });
    viewport.addEventListener("pointerup", (event) => {
      if (!touch || touch.id !== event.pointerId) return;
      const dx = event.clientX - touch.x;
      const dy = event.clientY - touch.y;
      touch = null;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) show(index + (dx < 0 ? 1 : -1), true);
    });
    viewport.addEventListener("pointercancel", () => { touch = null; });
    document.addEventListener("visibilitychange", schedule);
    motion.addEventListener("change", schedule);
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); }, { threshold: .2 });
      observer.observe(grid);
    }
    show(0);
  }

  function renderTimeline() {
    const fragment = document.createDocumentFragment();
    for (const event of config.itinerary || []) {
      const item = document.createElement("li");
      item.className = "timeline-item reveal";
      const time = document.createElement("time");
      time.className = "timeline-clock";
      try { renderClock(time, event.time); } catch { time.textContent = String(event.time); }
      const icon = document.createElement("span");
      icon.className = "timeline-icon";
      icon.append(makeIcon(event.icon));
      const details = document.createElement("div");
      const title = document.createElement("h3");
      title.textContent = String(event.title);
      const description = document.createElement("p");
      let range = "";
      if (event.endTime) {
        try {
          const endHour = parseTime(event.endTime).hour % 12 || 12;
          range = `Hasta ${endHour === 1 ? "la" : "las"} ${formatClock(event.endTime)}${event.endDayOffset ? " del día siguiente." : ""}`;
        } catch { /* Conservar la descripción sin un horario final válido. */ }
      }
      description.textContent = [event.description, range].filter(Boolean).join(" ");
      details.append(title, description);
      item.append(time, icon, details);
      fragment.append(item);
    }
    $("#timeline").replaceChildren(fragment);
  }

  function showToast(message) {
    const toast = $("#toast");
    clearTimeout(toastTimeout);
    toast.textContent = message;
    toast.classList.add("is-visible");
    toastTimeout = setTimeout(() => toast.classList.remove("is-visible"), 4500);
  }

  function openDialog(dialog) {
    if (!dialog.open) dialog.showModal();
    document.body.classList.add("modal-open");
  }

  function initDialogs() {
    $$("dialog").forEach((dialog) => {
      dialog.addEventListener("close", () => document.body.classList.remove("modal-open"));
      dialog.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", () => dialog.close()));
      dialog.addEventListener("click", (event) => {
        const box = dialog.getBoundingClientRect();
        if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
      });
    });
  }

  // HTTPS y dominios de Maps conocidos. Rechaza javascript:, userinfo y dominios parecidos.
  function safeMapsURL(value) {
    if (!value) return null;
    try {
      const url = new URL(String(value));
      const hosts = ["www.google.com", "google.com", "maps.google.com", "www.google.com.mx", "google.com.mx", "maps.google.com.mx", "maps.app.goo.gl", "goo.gl"];
      if (url.protocol !== "https:" || url.username || url.password || url.port || !hosts.includes(url.hostname)) return null;
      if (url.hostname === "goo.gl" && !url.pathname.startsWith("/maps/")) return null;
      if (/^(www\.)?google\.com(\.mx)?$/.test(url.hostname) && !/^\/maps(?:\/|$)/.test(url.pathname)) return null;
      return url.href;
    } catch { return null; }
  }

  function initMaps() {
    for (const kind of ["ceremony", "reception"]) {
      const link = $(`#${kind}-map`);
      const url = safeMapsURL(config[kind].mapsUrl);
      if (url) {
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.setAttribute("aria-label", `${kind === "ceremony" ? "Ver iglesia" : "Ver recepción"} en Google Maps (abre otra pestaña)`);
      } else {
        link.href = "#ubicacion";
        link.setAttribute("aria-haspopup", "dialog");
        link.addEventListener("click", (event) => {
          event.preventDefault();
          $("#info-title").textContent = kind === "ceremony" ? "Nuestra ceremonia" : "Nuestra recepción";
          $("#info-message").textContent = `Estamos preparando cada detalle. Muy pronto compartiremos aquí ${kind === "ceremony" ? "la iglesia y su dirección" : "el lugar de la recepción y cómo llegar"}. ¡Gracias por acompañarnos!`;
          openDialog($("#info-dialog"));
        });
      }
    }
  }

  function safeGiftURL(value, store) {
    if (!value) return null;
    try {
      const url = new URL(String(value));
      if (url.protocol !== "https:" || url.username || url.password || url.port) return null;
      const domains = store === "amazon" ? ["amazon.com", "amazon.com.mx", "amzn.to", "a.co"] : store === "target" ? ["target.com"] : [];
      if (!domains.some((domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`))) return null;
      return url.href;
    } catch { return null; }
  }

  function initGifts() {
    for (const store of ["amazon", "target"]) {
      const list = config.gifts[store];
      const link = $(`#${store}-gift`);
      const status = $(`#${store}-gift-status`);
      const url = safeGiftURL(list.url, store);
      link.hidden = !url;
      status.hidden = Boolean(url);
      if (url) {
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.removeAttribute("aria-haspopup");
        link.removeAttribute("aria-describedby");
        link.setAttribute("aria-label", `Ver nuestra lista de regalos en ${list.name} (abre otra pestaña)`);
        status.textContent = "Lista disponible";
      } else {
        link.addEventListener("click", (event) => {
          event.preventDefault();
          $("#gift-dialog-title").textContent = `Nuestra lista en ${list.name}`;
          $("#gift-dialog-message").textContent = String(config.gifts.pendingMessage).replace(/\{store\}/g, () => String(list.name));
          openDialog($("#gift-dialog"));
        });
      }
    }
  }

  function initCountdown() {
    if (!eventStart) {
      $(".countdown").hidden = true;
      $("#countdown-note").textContent = "La fecha y la hora se anunciarán próximamente.";
      return;
    }
    let interval;
    const update = () => {
      const total = Math.max(0, Math.floor((eventStart.getTime() - Date.now()) / 1000));
      const values = { days: Math.floor(total / 86400), hours: Math.floor(total / 3600) % 24, minutes: Math.floor(total / 60) % 60, seconds: total % 60 };
      for (const [key, value] of Object.entries(values)) $(`#count-${key}`).textContent = pad(value);
      if (total === 0) {
        $("#countdown-note").textContent = config.text.countdownComplete;
        if (interval) clearInterval(interval);
        return false;
      }
      return true;
    };
    if (update()) interval = setInterval(update, 1000);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) { clearInterval(interval); interval = undefined; }
      else if (update() && !interval) interval = setInterval(update, 1000);
    });
  }

  function escapeICS(value) {
    return String(value).replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");
  }

  // RFC 5545: líneas de hasta 75 octetos, sin cortar caracteres UTF-8.
  function foldICS(line) {
    const encoder = new TextEncoder();
    let result = "";
    let bytes = 0;
    for (const character of line) {
      const size = encoder.encode(character).length;
      if (bytes + size > 75) { result += "\r\n "; bytes = 1; }
      result += character;
      bytes += size;
    }
    return result;
  }

  function calendarText() {
    if (!eventStart) throw new Error("Fecha pendiente");
    const stamp = (date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
    const duration = Number(config.event.durationHours);
    const eventEnd = new Date(eventStart.getTime() + (Number.isFinite(duration) && duration > 0 ? duration : 7) * 3600000);
    const publicLink = /^https?:$/.test(location.protocol) ? `\n${location.href.split("#")[0]}` : "";
    const description = [
      config.event.scheduleNote,
      `Ceremonia · ${formatClock(config.ceremony.time)} · ${config.ceremony.name}: ${config.ceremony.address}`,
      `Recepción · ${formatClock(config.reception.time)} · ${config.reception.name}: ${config.reception.address}`,
      ...(config.itinerary || []).map((item) => `${item.title}: ${scheduleTime(item)}`)
    ].join("\n") + publicLink;
    return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Invitacion Bodas de Plata//ES", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "BEGIN:VEVENT", `UID:bodas-plata-${eventStart.getTime()}@invitacion.local`, `DTSTAMP:${stamp(new Date())}`, `DTSTART:${stamp(eventStart)}`, `DTEND:${stamp(eventEnd)}`, `SUMMARY:${escapeICS(`${config.event.title} · ${couple}`)}`, `DESCRIPTION:${escapeICS(description)}`, `LOCATION:${escapeICS(config.event.location)}`, "END:VEVENT", "END:VCALENDAR"].map(foldICS).join("\r\n") + "\r\n";
  }

  function initCalendar() {
    $("#calendar-button").addEventListener("click", () => {
      try {
        const blob = new Blob([calendarText()], { type: "text/calendar;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "bodas-de-plata.ics";
        document.body.append(anchor);
        anchor.click();
        anchor.remove();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        showToast("Abre el archivo .ics para añadir la celebración a tu calendario.");
      } catch { showToast("La fecha estará disponible próximamente."); }
    });
  }

  async function copyText(text, field) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch { /* El invitado puede copiar el campo seleccionado. */ }
    if (field) {
      field.focus();
      field.select();
      try { return document.execCommand("copy"); } catch { return false; }
    }
    return false;
  }

  function whatsappPhone(value) {
    const phone = String(value || "").trim().replace(/^\+/, "").replace(/[\s().-]/g, "");
    return /^[1-9]\d{7,14}$/.test(phone) ? phone : null;
  }

  function makeRSVPMessage() {
    const name = $("#guest-name").value.trim() || "[tu nombre]";
    const count = Number($("#guest-count").value);
    const guests = `${count} ${count === 1 ? "persona" : "personas"}`;
    const values = { couple, name, guests, date: eventStart ? fullDate(eventStart) : "la fecha de la celebración" };
    return String(config.rsvp.message).replace(/\{(couple|name|guests|date)\}/g, (_, key) => values[key]);
  }

  function initRSVP() {
    const phone = whatsappPhone(config.rsvp.phone);
    const dialog = $("#rsvp-dialog");
    const messageField = $("#rsvp-message");
    const status = $("#rsvp-status");
    let autoMessage = "";
    const syncMessage = () => {
      // Respeta cualquier edición que el invitado haya hecho en el mensaje.
      if (!messageField.value || messageField.value === autoMessage) {
        autoMessage = makeRSVPMessage();
        messageField.value = autoMessage;
      }
    };
    $("#rsvp-pending").hidden = Boolean(phone);
    $("#rsvp-button-label").textContent = phone ? "Confirmar por WhatsApp" : "Preparar confirmación";
    $("#rsvp-button use").setAttribute("href", phone ? "#i-whatsapp" : "#i-heart");
    $("#rsvp-mode-note").textContent = phone ? "Completa tus datos y abre WhatsApp para enviar tu confirmación." : config.rsvp.pendingNote;
    $("#rsvp-submit-label").textContent = phone ? "Continuar en WhatsApp" : "Copiar mi mensaje";
    $("#rsvp-submit use").setAttribute("href", phone ? "#i-whatsapp" : "#i-copy");
    const openConfirmation = (event) => {
      event.preventDefault();
      syncMessage();
      status.textContent = "";
      openDialog(dialog);
    };
    $("#rsvp-button").addEventListener("click", openConfirmation);
    $$("[data-open-rsvp]").forEach((link) => link.addEventListener("click", openConfirmation));
    $("#guest-name").addEventListener("input", syncMessage);
    $("#guest-count").addEventListener("change", syncMessage);
    $("#rsvp-form").addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!$("#guest-name").value.trim()) {
        $("#guest-name").setCustomValidity("Escribe tu nombre para preparar el mensaje.");
        $("#guest-name").reportValidity();
        return;
      }
      if (!messageField.value.trim()) { messageField.setCustomValidity("Escribe un mensaje."); messageField.reportValidity(); return; }
      if (phone) {
        const url = new URL(`https://wa.me/${phone}`);
        url.searchParams.set("text", messageField.value.trim());
        // Un enlace real evita depender de ventanas emergentes.
        const link = document.createElement("a");
        link.href = url.href;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.append(link);
        link.click();
        link.remove();
        status.textContent = "Envía el mensaje en WhatsApp para completar tu confirmación. La invitación no registra asistencias.";
      } else {
        const copied = await copyText(messageField.value, messageField);
        status.textContent = copied ? "Mensaje copiado. Podrás enviarlo cuando los anfitriones compartan su contacto. Tu asistencia aún no está confirmada." : "Seleccionamos tu mensaje para que puedas copiarlo. Podrás enviarlo cuando los anfitriones compartan su contacto. Tu asistencia aún no está confirmada.";
      }
    });
    $("#guest-name").addEventListener("input", () => $("#guest-name").setCustomValidity(""));
    messageField.addEventListener("input", () => messageField.setCustomValidity(""));
  }

  function initShare() {
    const dialog = $("#share-dialog");
    $("#share-button").addEventListener("click", async () => {
      if (!/^https?:$/.test(location.protocol)) {
        $("#info-title").textContent = "Una invitación para compartir";
        $("#info-message").textContent = "Cuando la invitación tenga un enlace web, podrás compartirla desde este botón. Por ahora estás viendo el archivo en tu dispositivo.";
        openDialog($("#info-dialog"));
        return;
      }
      const url = location.href.split("#")[0];
      const share = { title: config.text.shareTitle, text: config.text.shareMessage, url };
      if (navigator.share) {
        try { await navigator.share(share); return; }
        catch (error) { if (error.name === "AbortError") return; }
      }
      $("#share-url").value = url;
      $("#share-status").textContent = "";
      const whatsapp = new URL("https://wa.me/");
      whatsapp.searchParams.set("text", `${share.text}\n${url}`);
      $("#share-whatsapp").href = whatsapp.href;
      openDialog(dialog);
    });
    $("#copy-link").addEventListener("click", async () => {
      const copied = await copyText($("#share-url").value, $("#share-url"));
      $("#share-status").textContent = copied ? "Enlace copiado. ¡Gracias por compartir!" : "Seleccionamos el enlace. Cópialo desde este campo.";
    });
  }

  function initReveals() {
    if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) { entry.target.classList.remove("is-waiting"); observer.unobserve(entry.target); }
      }
    }, { threshold: .08, rootMargin: "0px 0px -25px 0px" });
    $$(".reveal").forEach((element) => {
      if (element.getBoundingClientRect().top > window.innerHeight) element.classList.add("is-waiting");
      element.classList.add("is-observed");
      observer.observe(element);
    });
  }

  try { eventStart = resolveEventDate(); }
  catch (error) { console.error("Revisa la fecha de la invitación:", error.message); }
  hydrateContent();
  initDialogs();
  initMaps();
  initGifts();
  initCountdown();
  initCalendar();
  initRSVP();
  initShare();
  initReveals();
})();
