self.addEventListener('message', (event) => {

  if (event.data?.action === 'register') {

    const nrc = event.data.nrc;

    // Ejecutar la función de verificación de disponibilidad inmediatamente
    checkAvailability(nrc);

    // Ejecutar la función de verificación de disponibilidad cada 5 minutos
    const intervalId = setInterval(() => {
      checkAvailability(nrc);
    }, 5 * 60 * 1000);

    // Envia el interval ID al cliente
    event.source.postMessage({ action: 'intervalId', nrc, intervalId });
  }
  
  else if (event.data?.action === 'delete') {
    const intervalId = event.data.intervalId;
    console.log('Deleting interval ID:', intervalId);
    // Detener el intervalo y eliminar el ID almacenado
    clearInterval(intervalId, 10);
  }
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
        console.log('Sending notification:', notificationOptions);
        self.registration.showNotification(`${data.class}-${data.course}: ${data.title}`, notificationOptions);
      }
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
}
