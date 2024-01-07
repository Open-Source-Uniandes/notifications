// PWA
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('mi-cache').then((cache) => {
      return cache.addAll([
        '/notifications/index.html',
        '/notifications/assets/manifest.json',
        '/notifications/logo.jpeg',
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener("periodicsync", (event) => {
  // `notifications/${nrc}` es el ID de la tarea periódica
  const nrc = event.tag.split('/')[1];
  event.waitUntil(checkAvailability(nrc));
});

function checkAvailability(nrc) {
  const apiUrl = `https://ofertadecursos.uniandes.edu.co/api/courses?nameInput=${nrc}`;

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      data = data[0];
      const availableSeats = parseInt(data.maxenrol, 10);
      const enrolledStudents = parseInt(data.enrolled, 10);
      const seatsDifference = availableSeats - enrolledStudents;

      if (seatsDifference <= 5) {
        const notificationOptions = {
          body: `¡Quedan ${seatsDifference} cupos disponibles para la sección ${data.section} de ${data.class}-${data.course}! (NRC: ${data.nrc})`,
          icon: '/logo.jpeg',
        };
        self.registration.showNotification(`${data.class}-${data.course}: ${data.title}`, notificationOptions);
      }
    })
    .catch(error => {
      throw new Error('Error fetching data:', error);
    });
}
