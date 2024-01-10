import APIManager from "./APIManager";

class NotificationManager {

  sectionIds = [];

  constructor(sectionsCallback, timerCallback) {

    // Singleton
    if (!NotificationManager.instance) {
      NotificationManager.instance = this;
    }

    const instance = NotificationManager.instance

    instance.sectionsCallback = sectionsCallback;
    instance.timerCallback = timerCallback;
    instance.setupNotifications();
  }

  setRepetition = (secondsToNextUpdate) => { 
    let secondsLeft = secondsToNextUpdate;
    const intervalId = setInterval(() => {
      secondsLeft--;
      this.timerCallback(secondsLeft);
      if (secondsLeft === 0) {
        clearInterval(intervalId);
        this.repeat();
      }
    }, 1000);
  }

  setupNotifications = async () => {
    
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
    this.sendNotification('¡Notificaciones activadas!', 'Te avisaremos cuando alguna de tus materias libere un cupo');

    // Primera notificación en 5 segundos
    this.setRepetition(5);
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

    const secondsToNextUpdate = 30;
    this.setRepetition(secondsToNextUpdate);

    // Actualizar datos
    const newSections = await Promise.all(
      this.sectionIds
        .map(APIManager.searchSection)
    )

    this.sectionsCallback(newSections);

    const toNotify = newSections.filter(this.mustNotifySection)
    if (toNotify.length === 0) return;
    const title = `¡Se liberaron cupos para ${toNotify.length} secciones!`;
    const body = toNotify.map(section => `${section.class}${section.course} - ${section.title}`).join('\n');

    this.sendNotification(title, body);
  }

  mustNotifySection = (section) => {
    const availableSeats = parseInt(section.maxenrol, 10);
    const enrolledStudents = parseInt(section.enrolled, 10);
    const seatsDifference = availableSeats - enrolledStudents;
    section.seatsDifference = seatsDifference;

    if (seatsDifference > 0) return true;
    return false;
  }      

}

export default NotificationManager;
