/* Todos los datos de la invitación se personalizan aquí.
   Lugares y horarios confirmados para el 28 de noviembre de 2026. */
const invitationConfig = {
  couple: {
    name1: "Salvador",
    name2: "Gabriela",
    initials: "S & G",
    anniversaryYears: 25
  },
  event: {
    title: "Bodas de Plata",
    date: "2026-11-28",
    time: "13:00",
    // Oklahoma City usa la zona IANA America/Chicago (hora central).
    timeZone: "America/Chicago",
    // Opcional: un instante explícito tiene prioridad sobre date y time.
    // Ejemplo: "2026-11-28T13:00:00-06:00".
    dateTimeISO: "",
    // De la ceremonia a la 1:00 p. m. al cierre a la 1:00 a. m.
    durationHours: 12,
    location: "Holy Spirit Catholic Church, 1212 N Sara Rd, Mustang, OK 73064",
    scheduleNote: ""
  },
  ceremony: {
    name: "Holy Spirit Catholic Church",
    address: "1212 N Sara Rd, Mustang, OK 73064",
    time: "13:00",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Holy%20Spirit%20Catholic%20Church%2C%201212%20N%20Sara%20Rd%2C%20Mustang%2C%20OK%2073064"
  },
  reception: {
    name: "La Joya Event Center",
    address: "3830 N MacArthur Blvd, Warr Acres, OK 73122",
    time: "17:00",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=La%20Joya%20Event%20Center%2C%203830%20N%20MacArthur%20Blvd%2C%20Warr%20Acres%2C%20OK%2073122"
  },
  itinerary: [
    { time: "13:00", title: "Ceremonia religiosa", description: "Holy Spirit Catholic Church · Mustang, Oklahoma.", icon: "church" },
    { time: "17:00", title: "Recepción", description: "La Joya Event Center · Warr Acres, Oklahoma.", icon: "sparkles" },
    { time: "18:00", endTime: "20:00", title: "Comida", icon: "utensils" },
    { time: "21:00", endTime: "01:00", endDayOffset: 1, title: "Baile", icon: "music" }
  ],
  gallery: {
    title: "Nuestro álbum",
    message: "Algunos de nuestros momentos favoritos.",
    pendingMessage: "Pronto añadiremos nuestras fotos favoritas.",
    // Cuando tengas las fotos, cópialas a assets/images/ y agrega sus datos.
    // Ejemplo: { src: "assets/images/boda.jpg", alt: "Nuestra boda", caption: "El comienzo" }
    photos: []
  },
  dressCode: "Código de vestimenta",
  dressNote: "Elige ese atuendo con el que te sientas especial. Te pedimos amablemente evitar las lentejuelas.",
  gifts: {
    title: "Mesa de regalos",
    message: "Si deseas tener un detalle con nosotros, aquí encontrarás nuestras listas.",
    pendingMessage: "Nuestra lista en {store} estará disponible próximamente.",
    // Pega el enlace de compartir de cada lista cuando esté lista.
    // Vacío muestra un aviso de próxima disponibilidad, sin inventar una lista.
    amazon: { name: "Amazon", url: "https://www.amazon.com/wedding/guest-view/348FLMAW3FRI6" },
    target: { name: "Target", url: "https://www.target.com/gift-registry/gift/Salvador-Gaby-C" }
  },
  rsvp: {
    // Escribe el número internacional, solo dígitos. Para México: 52 + 10 dígitos.
    // No uses un número ficticio. Vacío permite preparar y copiar el mensaje.
    phone: "",
    deadline: "2026-11-14",
    message: "¡Hola, {couple}! Soy {name}. Confirmo la asistencia de {guests} a sus Bodas de Plata el {date}.",
    pendingNote: "WhatsApp estará disponible próximamente. Puedes preparar y copiar tu mensaje."
  },
  text: {
    heroQuote: "Después de 25 años, seguimos eligiéndonos.",
    storyEyebrow: "Junto a quienes queremos",
    storyTitle: "Una vida compartida.",
    storyMessage: "Con gratitud por el camino recorrido, queremos reunir a nuestra familia y amigos en una noche de brindis, música y compañía. Nos hará muy felices contar contigo.",
    countdownEyebrow: "Reserva la fecha",
    countdownTitle: "Nos vemos para celebrar",
    countdownComplete: "¡Hoy es el gran día!",
    placesTitle: "Dónde nos encontraremos",
    itineraryTitle: "El programa\ndel día",
    itineraryIntro: "De la ceremonia al último baile.",
    rsvpTitle: "¿Nos acompañas?",
    rsvpMessage: "Dinos tu nombre y cuántas personas asistirán para reservar sus lugares.",
    closingQuote: "Con cariño,",
    closingThanks: "Gracias por acompañarnos.",
    shareTitle: "Gaby & Salvador · Bodas de Plata",
    shareMessage: "Celebramos 25 años de amor. Nos encantará compartir este día contigo."
  }
};
