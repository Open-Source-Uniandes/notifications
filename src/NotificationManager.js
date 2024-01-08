import APIManager from "./APIManager";

class NotificationManager {

  sectionIds = [];

  constructor() {
    this.setupNotifications();
  }

  setCallback(callback) {
    this.callback = callback;
  }

  setupNotifications = async () => {

    console.info('Setting up notifications');
    
    let detail = '';

    if (!('Notification' in window)) detail = 'Tu navegador no permite notificaciones. Intenta con Google Chrome :)';

    if (Notification.permission === 'denied') detail = 'Debes habilitar las notificaciones. Puedes buscar en la configuración de tu navegador :)';

    if (!('serviceWorker' in navigator)) detail = 'Tu navegador no soporta Service Workers. Intenta con Google Chrome :)';

    if (detail) {
      const event = new CustomEvent("customErrorMessage", { detail });
      window.dispatchEvent(event);
      return;
    }

    // Registrar el service worker
    await navigator.serviceWorker.register('service-worker.js')

    // Enviar una notificación de prueba
    this.sendNotification('¡Notificaciones activadas!', 'Te avisaremos cuando alguna de tus materias tenga menos de 5 cupos disponibles');

    // Prueba de notificación en 5 segundos
    setTimeout(() => {
      this.repeat();
    }, 5 * 1000);

    // Crear el intervalo de revisión
    setInterval(() => {
      console.info('Ejecutando intervalo de notificaciones');
      this.repeat();
    }, 5 * 60 * 1000);

  }

  sendNotification = async (title, body) => {
    let permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      let detail = 'Debes autorizarnos para recibir notificaciones. Puedes buscar en la configuración de tu navegador :)';
      const event = new CustomEvent("customErrorMessage", { detail });
      window.dispatchEvent(event);
      return;
    }
    navigator.serviceWorker.ready.then(registration => {
      registration.showNotification(title, { body, icon: 'logo.jpeg' });
    });
  }

  update = (ids) => {
    this.sectionIds = ids;
  }

  repeat = async () => {

    const newSections = await Promise.all(
      this.sectionIds
        .map(APIManager.searchSection)
    )

    if (this.callback) this.callback(newSections, 5 * 60);

    const toNotify = newSections.filter(this.mustNotifySection)
    if (toNotify.length === 0) return;
    const title = `Hay ${toNotify.length} secciones con pocos cupos`;
    const body = toNotify.map(section => `${section.class}${section.course} Sec. ${section.section} - ${section.seatsDifference} cupos`).join('\n');

    this.sendNotification(title, body);
  }

  mustNotifySection = (section) => {
    const availableSeats = parseInt(section.maxenrol, 10);
    const enrolledStudents = parseInt(section.enrolled, 10);
    const seatsDifference = availableSeats - enrolledStudents;
    section.seatsDifference = seatsDifference;

    if (seatsDifference <= 5) return true;
    return false;
  }      

}

export default new NotificationManager();
