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
    const allowed = ["church", "sparkles", "utensils", "glasses", "music", "heart", "camera"];
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
    const title = String(config.event.title).trim();
    const split = title.indexOf(" ");
    const emphasis = document.createElement("em");
    emphasis.textContent = split >= 0 ? title.slice(split + 1) : title;
    $("#hero-title").replaceChildren(...(split >= 0 ? [document.createTextNode(title.slice(0, split)), document.createElement("br"), emphasis] : [emphasis]));
    $(".brand").setAttribute("aria-label", `${couple}, inicio`);
    $(".hero-art").setAttribute("aria-label", `${config.couple.anniversaryYears} años de amor`);
    document.title = `${config.couple.name1} & ${config.couple.name2} · Bodas de Plata`;
    $('meta[property="og:title"]').content = document.title;
    if (eventStart) {
      const year = Number(datePart(eventStart, { year: "numeric" }));
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
    renderDressPalette();
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
    const fragment = document.createDocumentFragment();
    for (const photo of photos) {
      const card = document.createElement("figure");
      card.className = "photo-card";
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
      card.append(img);
      if (photo.caption) {
        const caption = document.createElement("figcaption");
        caption.textContent = String(photo.caption);
        card.append(caption);
      }
      fragment.append(card);
    }
    grid.replaceChildren(fragment);
    grid.removeAttribute("aria-hidden");
    grid.classList.add("has-photos");
    grid.classList.toggle("has-single-photo", photos.length === 1);
    grid.style.setProperty("--photo-columns", String(Math.min(4, photos.length)));
    $("#gallery-message").textContent = config.gallery.message;
  }

  function renderDressPalette() {
    const list = $("#dress-palette");
    if (!list || !Array.isArray(config.dressPalette)) return;
    const fragment = document.createDocumentFragment();
    for (const color of config.dressPalette) {
      if (!color || !/^#[0-9a-f]{6}$/i.test(String(color.color))) continue;
      const item = document.createElement("li");
      const swatch = document.createElement("span");
      swatch.className = "dress-swatch";
      swatch.setAttribute("aria-hidden", "true");
      swatch.style.setProperty("--swatch-color", color.color);
      const label = document.createElement("span");
      label.textContent = String(color.name || "");
      item.append(swatch, label);
      fragment.append(item);
    }
    list.replaceChildren(fragment);
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
        try { range = `${scheduleTime(event)}.`; } catch { /* Conservar la descripción sin un rango inválido. */ }
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
      if (url) {
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.removeAttribute("aria-haspopup");
        link.removeAttribute("aria-describedby");
        link.setAttribute("aria-label", `Ver nuestra lista de regalos en ${list.name} (abre otra pestaña)`);
        status.textContent = "Elegido con mucho cariño";
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
    const phone = String(value || "").trim();
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
    $("#rsvp-mode-note").textContent = phone ? "Prepara tu mensaje y envíalo por WhatsApp para confirmar tu asistencia." : config.rsvp.pendingNote;
    $("#rsvp-submit-label").textContent = phone ? "Continuar en WhatsApp" : "Copiar mi mensaje";
    $("#rsvp-submit use").setAttribute("href", phone ? "#i-whatsapp" : "#i-copy");
    $("#rsvp-button").addEventListener("click", () => { syncMessage(); status.textContent = ""; openDialog(dialog); });
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
