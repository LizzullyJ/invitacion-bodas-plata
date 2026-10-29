/* Todos los datos de la invitación se personalizan aquí.
   Los horarios son una propuesta; las ubicaciones y WhatsApp están pendientes. */
const invitationConfig = {
  couple: {
    name1: "Gaby",
    name2: "Salvador",
    initials: "G & S",
    anniversaryYears: 25
  },
  event: {
    title: "Nuestras Bodas de Plata",
    date: "2026-11-28",
    time: "17:00",
    timeZone: "America/Mexico_City",
    // Opcional. Déjalo vacío para calcular la fecha con date, time y timeZone.
    // Ejemplo de instante explícito: "2026-11-28T17:00:00-06:00".
    dateTimeISO: "",
    durationHours: 7,
    location: "Ubicaciones por confirmar",
    scheduleNote: "Horarios propuestos · ubicaciones por confirmar"
  },
  ceremony: {
    name: "Un sí, una vez más",
    address: "Muy pronto compartiremos contigo la iglesia y su dirección.",
    time: "17:00",
    mapsUrl: ""
  },
  reception: {
    name: "Una noche para recordar",
    address: "Muy pronto compartiremos contigo el lugar de nuestra celebración.",
    time: "18:30",
    mapsUrl: ""
  },
  itinerary: [
    { time: "17:00", title: "Ceremonia religiosa", description: "Renovamos nuestra promesa de amor.", icon: "church" },
    { time: "18:30", title: "Recepción y bienvenida", description: "El comienzo de una noche muy especial.", icon: "sparkles" },
    { time: "19:00", title: "La cena", description: "Compartimos la mesa y los buenos momentos.", icon: "utensils" },
    { time: "20:00", title: "Brindis por el amor", description: "Por lo vivido y por todo lo que viene.", icon: "glasses" },
    { time: "21:00", title: "¡A bailar!", description: "Que la música nos regale más recuerdos.", icon: "music" }
  ],
  dressCode: "Formal elegante",
  dressNote: "Elige ese atuendo con el que te sientas especial. Será un placer celebrar contigo.",
  rsvp: {
    // Escribe el número internacional, solo dígitos. Para México: 52 + 10 dígitos.
    // No uses un número ficticio. Vacío permite preparar y copiar el mensaje.
    phone: "",
    deadline: "2026-11-14",
    message: "¡Hola, {couple}! Soy {name}. Me encantará acompañarlos el {date} en sus Bodas de Plata. Confirmo la asistencia de {guests}. ¡Gracias por hacernos parte de su historia!",
    pendingNote: "Pronto estará disponible nuestro WhatsApp para confirmar. Por ahora, puedes preparar y copiar tu mensaje."
  },
  text: {
    eyebrow: "Celebrando 25 años de amor",
    heroQuote: "Hay historias de amor que merecen celebrarse para siempre.",
    storyEyebrow: "Nuestra historia continúa",
    storyTitle: "Un sí. Miles de recuerdos.\nToda una vida juntos.",
    storyMessage: "Veinticinco años de momentos compartidos, sueños cumplidos y un amor que ha crecido con el tiempo. Hoy queremos celebrar esta hermosa historia rodeados de las personas que forman parte de nuestras vidas.",
    countdownEyebrow: "Una fecha para volver a decir sí",
    countdownTitle: "Nos vemos para celebrar",
    countdownComplete: "¡Llegó el día de celebrar nuestro amor!",
    placesTitle: "Dos momentos. Una celebración.",
    itineraryTitle: "Una noche,\nmuchos recuerdos.",
    itineraryIntro: "Cada momento será más especial si lo compartimos contigo.",
    rsvpTitle: "Nos hará muy felices\ncontar contigo.",
    rsvpMessage: "Gracias por ser parte de nuestra historia. Acompáñanos a escribir un nuevo recuerdo.",
    closingQuote: "El mejor regalo es compartir\neste momento contigo.",
    closingThanks: "Con todo nuestro cariño, hoy y siempre.",
    shareTitle: "Gaby & Salvador · Bodas de Plata",
    shareMessage: "Celebramos 25 años de amor. Nos encantará compartir este día contigo."
  }
};
