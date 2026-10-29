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
    title: "Nuestras Bodas de Plata",
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
    eyebrow: "Instantes que se quedan",
    title: "25 años de recuerdos",
    message: "Pequeños instantes de una gran historia.",
    pendingMessage: "Muy pronto compartiremos aquí algunas de nuestras fotografías.",
    // Cuando tengas las fotos, cópialas a assets/images/ y agrega sus datos.
    // Ejemplo: { src: "assets/images/boda.jpg", alt: "Nuestra boda", caption: "El comienzo" }
    photos: []
  },
  dressCode: "Formal elegante",
  dressColors: "Colores de preferencia",
  dressPalette: [
    { name: "Café", color: "#795B44" },
    { name: "Beige", color: "#D8C5AA" },
    { name: "Verde olivo", color: "#6B7654" }
  ],
  dressNote: "Elige un atuendo que te haga sentir especial y con el que disfrutes cada momento de esta celebración. Solo te pedimos amablemente evitar las lentejuelas.",
  gifts: {
    title: "Mesa de regalos",
    message: "Tu compañía es el regalo más valioso para nosotros. Sin embargo, si deseas tener un detalle especial, hemos preparado nuestras listas de regalos, que podrás consultar a continuación.",
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
    eyebrow: "Celebrando 25 años de amor",
    heroQuote: "Después de 25 años, seguimos eligiéndonos.",
    storyEyebrow: "Nuestra historia continúa",
    storyTitle: "Un sí. Miles de recuerdos.\nToda una vida juntos.",
    storyMessage: "Veinticinco años de momentos compartidos, sueños cumplidos y un amor que ha crecido con el tiempo. Hoy queremos celebrar esta hermosa historia rodeados de las personas que forman parte de nuestras vidas.",
    countdownEyebrow: "Una fecha para volver a decir sí",
    countdownTitle: "Nos vemos para celebrar",
    countdownComplete: "¡Llegó el día de celebrar nuestro amor!",
    placesTitle: "Dos momentos. Una celebración.",
    itineraryTitle: "Una noche,\nmuchos recuerdos.",
    itineraryIntro: "Cada momento será más especial si lo compartimos contigo.",
    rsvpTitle: "¿Nos acompañas?",
    rsvpMessage: "Indícanos tu nombre y cuántas personas asistirán para ayudarnos a preparar la recepción.",
    closingQuote: "Que sigan los años,\nque nunca falte el amor.",
    closingThanks: "Con amor, siempre.",
    shareTitle: "Gaby & Salvador · Bodas de Plata",
    shareMessage: "Celebramos 25 años de amor. Nos encantará compartir este día contigo."
  }
};
