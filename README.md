# Salvador & Gabriela · Bodas de Plata

Invitación digital con ilustración botánica original en SVG, tonos marfil y olivo, animaciones suaves, cuenta regresiva, calendario, ubicaciones independientes, mensaje de asistencia y opción de compartir. HTML, CSS y JavaScript vanilla: sin frameworks ni dependencias.

## Abrir

Abre `index.html` en el navegador. No hace falta instalar nada. Las fuentes de Google necesitan conexión; sin conexión se utilizan fuentes de respaldo.

Para una vista mediante HTTP, si tienes Node.js:

```sh
node scripts/serve.mjs
```

Abre `http://127.0.0.1:4173`. El servidor solo escucha en tu equipo. Finaliza con Ctrl+C.

## Datos actuales

- **Nombres:** Salvador y Gabriela, tomados del nombre del proyecto.
- **Celebración:** 28 de noviembre de **2026**. El año se asumió por ser la próxima fecha; puede cambiarse.
- **Horario:** ceremonia a la 1:00 p. m. y recepción a las 5:00 p. m., en hora local de Oklahoma City (`America/Chicago`).
- **Límite de confirmación:** 14 de noviembre de 2026, fecha sugerida editable.
- **Ceremonia:** Holy Spirit Catholic Church, 1212 N Sara Rd, Mustang, OK 73064. **Recepción:** La Joya Event Center, 3830 N MacArthur Blvd, Warr Acres, OK 73122. Cada botón de Maps usa la dirección proporcionada.
- **WhatsApp:** configurado. El formulario abre un mensaje con los datos del invitado; la confirmación se completa al enviarlo en WhatsApp. La página no registra asistencias automáticamente.
- **Itinerario:** comida de 6:00 a 8:00 p. m.; baile de 9:00 p. m. a 1:00 a. m. El calendario abarca desde la ceremonia hasta el cierre del baile.
- **Mesa de regalos:** Amazon y Target, con enlaces pendientes. Cada botón muestra un aviso de próxima disponibilidad hasta añadir su lista real.

## Personalizar desde `js/config.js`

| Campo | Qué modificar |
| --- | --- |
| `couple.name1`, `couple.name2`, `couple.initials` | Nombres y monograma |
| `couple.anniversaryYears` | Número de años |
| `event.title` | Título de la invitación |
| `event.date` | Fecha `AAAA-MM-DD` |
| `event.time` | Inicio, `HH:MM` en formato de 24 horas |
| `event.timeZone` | Zona IANA; `America/Chicago` para Oklahoma City |
| `event.dateTimeISO` | Opcional: fecha con desplazamiento UTC explícito |
| `event.durationHours` | Duración para el calendario |
| `event.location`, `event.scheduleNote` | Lugar general y nota sobre los horarios |
| `ceremony`, `reception` | Nombre, dirección, horario y URL de cada ubicación |
| `itinerary` | Horas de inicio, `endTime` opcional, `endDayOffset: 1` para terminar al día siguiente, títulos, descripciones e iconos |
| `dressCode`, `dressNote` | Título y texto del código de vestimenta |
| `gifts.amazon.url`, `gifts.target.url` | Enlace de compartir de cada lista de regalos |
| `gifts.title`, `gifts.message`, `gifts.pendingMessage` | Título, mensaje y aviso de listas pendientes |
| `rsvp.phone` | WhatsApp internacional; admite espacios, guiones, paréntesis y + inicial |
| `rsvp.deadline` | Fecha límite para confirmar |
| `rsvp.message` | Plantilla editable del mensaje |
| `text` | Frases de la portada, historia, cierre y otras secciones |
| `gallery.photos`, `gallery.title`, `gallery.message`, `gallery.pendingMessage` | Fotografías, título y mensajes de la galería |

### Fotografías

La sección **Nuestro álbum** aparece después de Nuestra historia y antes de la fecha. Mientras `gallery.photos` esté vacío, muestra cuatro marcos decorativos y un aviso de próxima disponibilidad; no carga imágenes de ejemplo ni presenta fotos ficticias.

Cuando tengas las fotografías:

1. Copia los archivos a `assets/images/` (se recomiendan JPG o WebP optimizados).
2. Agrega sus rutas y descripciones a `gallery.photos` en `js/config.js`:

```js
photos: [
  { src: "assets/images/boda.jpg", alt: "Descripción de la fotografía de nuestra boda", caption: "El comienzo" },
  { src: "assets/images/aniversario.jpg", alt: "Descripción de la fotografía de nuestro aniversario", caption: "Hoy y siempre" }
]
```

Los nombres anteriores son ejemplos: los archivos deben existir antes de añadirlos. La galería reemplaza los marcos vacíos automáticamente al configurar imágenes válidas. Admite fotos locales dentro de `assets/images/` y URLs HTTPS sin credenciales. Si una foto no carga, muestra un aviso en su marco en lugar del icono de imagen rota. Las fotos se cargan al acercarse a la sección y las descripciones no se insertan como HTML.

Puedes cambiar el título, la frase y el aviso pendiente en `gallery.title`, `gallery.message` y `gallery.pendingMessage`. La sección muestra las imágenes sin abrir ventanas adicionales ni simular una carga de archivos. Después de añadirlas, vuelve a publicar la invitación.


### Mesa de regalos de Amazon y Target

En `js/config.js`, pega el enlace de compartir de cada lista en `gifts.amazon.url` o `gifts.target.url`. Los campos están vacíos porque las listas todavía no se han creado. Mientras una lista esté pendiente, se muestra «Próximamente» y su botón permanece oculto. Al añadir un enlace válido, aparece el botón de esa tienda.

Al guardar una URL válida, el botón abre la lista directamente en otra pestaña con `noopener noreferrer`. Amazon admite enlaces HTTPS de `amazon.com`, `amazon.com.mx`, `amzn.to` y `a.co`; Target admite `target.com`. También se permiten sus subdominios. Se rechazan otros dominios, protocolos, puertos y URLs con credenciales. Usa siempre el enlace de la lista que los invitados pueden ver, en lugar del enlace privado para administrarla.

`gifts.amazon.name` y `gifts.target.name` controlan los nombres visibles.

### Fecha y zona horaria

Con `dateTimeISO: ""`, la cuenta regresiva interpreta `date` y `time` en `timeZone`, independientemente del país del visitante. La invitación y el calendario usan el mismo instante.

Si necesitas indicar el desplazamiento manualmente:

```js
date: "2026-11-28",
time: "13:00",
timeZone: "America/Chicago",
dateTimeISO: "2026-11-28T13:00:00-06:00"
```

**Cuando `dateTimeISO` tiene un valor, tiene prioridad** sobre `date` y `time`, también para la fecha visible. Déjalo vacío si prefieres cambiar únicamente fecha y hora. El archivo de calendario usa UTC para que cada aplicación lo convierta a la zona del invitado. Las fechas inválidas se presentan como pendientes; una hora local inexistente por cambio de horario necesita un desplazamiento explícito. En zonas con horas duplicadas también conviene usar el desplazamiento explícito.

La cuenta regresiva se actualiza cada segundo, se detiene al ocultar la pestaña y se recalcula al volver. Al llegar a cero muestra la frase `text.countdownComplete`.

### Google Maps

Configura por separado:

```js
ceremony: {
  name: "Nombre de la iglesia",
  address: "Dirección completa de la iglesia",
  time: "17:00",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=LATITUD,LONGITUD"
},
reception: {
  name: "Nombre del salón",
  address: "Dirección completa del salón",
  time: "18:30",
  mapsUrl: "https://maps.app.goo.gl/ENLACE_DEL_SALON"
}
```

Sustituye los ejemplos por el enlace real de cada lugar. Para precisión usa coordenadas o el enlace de compartir del sitio exacto en Google Maps. Se aceptan enlaces HTTPS de `google.com/maps`, `google.com.mx/maps`, `maps.google.com`, `maps.google.com.mx`, `maps.app.goo.gl` y `goo.gl/maps`. Se rechazan otros protocolos, dominios y credenciales en URLs. Los enlaces externos abren otra pestaña con `noopener noreferrer`.

### WhatsApp y confirmación

En `rsvp.phone`, escribe el número internacional **sin `+`, espacios, paréntesis ni guiones**. Para México, `52` seguido de los diez dígitos. Déjalo vacío hasta tener el número correcto.

La plantilla `rsvp.message` acepta `{couple}`, `{date}`, `{name}` y `{guests}`. El invitado escribe su nombre, selecciona entre una y seis personas y puede editar el mensaje completo. Después debe **enviarlo en WhatsApp** para confirmar; abrir la aplicación no confirma nada. No hay base de datos, almacenamiento del navegador ni registro de invitados. La información solo pasa a WhatsApp cuando el invitado pulsa el botón correspondiente.

Mientras no haya teléfono válido, el botón copia el mensaje y explica que la asistencia todavía no está confirmada. Si el navegador no permite copiar automáticamente, se selecciona el mensaje para copiarlo manualmente.

### Iconos y estilo

Iconos disponibles para `itinerary`: `church`, `sparkles`, `utensils`, `glasses`, `music`, `heart`. Un nombre desconocido muestra un corazón.

Colores y tipografías están en las variables de `css/styles.css`. Las ilustraciones están en `assets/images/`: `olive-branch.svg` para las ramas, `olive-corner.svg` para las esquinas y `olive-divider.svg` para los separadores; el favicon está en `assets/icons/favicon.svg`. Los iconos usan un trazo reforzado en olivo y las tarjetas tienen marcos dorados dobles. No se cargan bibliotecas de iconos ni imágenes externas. Se respeta `prefers-reduced-motion` y se admite navegación por teclado, cierre de diálogos con Escape y retorno al elemento que los abrió.

El título, descripción y metadatos sociales se actualizan desde la configuración al cargar. Antes de compartir en WhatsApp, actualiza también las etiquetas estáticas de `<head>` en `index.html` si cambias nombres o fecha: los rastreadores de enlaces normalmente no ejecutan JavaScript. La opción de compartir necesita un enlace HTTP/HTTPS; desde un archivo local se explica que primero debe publicarse.

## Publicar como sitio estático

No hay compilación obligatoria. Publica `index.html`, `css/`, `js/` y `assets/`, manteniendo su estructura y nombres.

- **GitHub Pages:** sube el contenido de esta carpeta a la raíz de un repositorio. En Settings → Pages elige la rama y la carpeta raíz. Las rutas de recursos son relativas y admiten subdirectorios.
- **Netlify:** arrastra una carpeta con los cuatro elementos anteriores a la publicación manual. También puedes conectar un repositorio, sin comando de build y con directorio de publicación `.`.
- **Vercel:** importa el repositorio como proyecto estático (preset Other), sin framework y con directorio de salida `.`.
- **Sites:** `.openai/hosting.json` conserva la identidad del sitio. `node scripts/build.mjs` copia los recursos a `dist/`, que es el directorio estático configurado. No se necesita `npm install`.

Los controles de acceso de cualquier alojamiento deben permitir a los invitados abrir el enlace. Un sitio privado en Sites solo es visible para su propietario hasta que este cambie el acceso.

## Estructura

```text
index.html
css/styles.css
js/config.js
js/main.js
assets/images/olive-branch.svg
assets/images/olive-corner.svg
assets/images/olive-divider.svg
assets/icons/favicon.svg
scripts/serve.mjs
scripts/build.mjs
README.md
```
