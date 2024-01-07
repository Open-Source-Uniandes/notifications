self.addEventListener('install', () => {
  console.info('Service Worker installed');
});

self.addEventListener('activate', () => {
  console.info('Service Worker activated');
});

self.addEventListener('message', (event) => {

  console.log('Message received from main thread', event.data);

  if (event.data?.action === 'register') {
    const nrc = event.data.nrc;
    const intervalId = setInterval(() => {
      checkAvailability(nrc);
    }, 5 * 60 * 1000);

    // Guardar el ID del intervalo para futura referencia
    localStorage.setItem(`notifications/v1/interval_${nrc}`, intervalId.toString());
  }
  
  else if (event.data?.action === 'delete') {
    const nrc = event.data.nrc;
    const intervalId = localStorage.getItem(`notifications/v1/interval_${nrc}`);

    // Detener el intervalo y eliminar el ID almacenado
    clearInterval(parseInt(intervalId, 10));
    localStorage.removeItem(`notifications/v1/interval_${nrc}`);
  }
});

function checkAvailability(nrc) {
  const apiUrl = `https://ofertadecursos.uniandes.edu.co/api/courses?nameInput=${nrc}`;

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      const availableSeats = parseInt(data[0].maxenrol, 10);
      const enrolledStudents = parseInt(data[0].enrolled, 10);
      const seatsDifference = availableSeats - enrolledStudents;

      if (seatsDifference <= 5) {
        const notificationOptions = {
          body: `¡Quedan ${seatsDifference} cupos disponibles para la sección ${data.section} de ${data.class}-${data.course}! (NRC: ${data.nrc}))`,
          icon: '/logo.jpeg',
        };

        self.registration.showNotification(`${data.class}-${data.course}: ${data.title}`, notificationOptions);
      }
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
}
