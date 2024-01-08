import APIManager from "./APIManager";

class NotificationManager {

  firstNotification = true;
  sectionIds = [];

  setupNotifications = () => {
    
    if (!('Notification' in window)) throw new Error('Tu navegador no permite notificaciones. Intenta con Google Chrome :)');

    if (Notification.permission === 'denied') throw new Error('Debes habilitar las notificaciones. Puedes buscar en la configuración de tu navegador :)');

    if (Notification.permission === 'default') {
      Notification.requestPermission(permission => {
        if (permission !== 'granted') {
          throw new Error('Debes autorizarnos para recibir notificaciones. Puedes buscar en la configuración de tu navegador :)');
        }
      });
    }

    // Crear el intervalo de revisión
    setInterval(() => {
      this.repeat();
    }, 0.5 * 60 * 1000);

    // Enviar una notificación de prueba
    this.sendNotification('¡Notificaciones activadas!', 'Te avisaremos cuando alguna de tus materias tenga menos de 5 cupos disponibles');

  }

  sendNotification = async (title, body) => {
    new Notification(title, { body, icon: 'logo.jpeg'});
  }

  setCallback = (callback) => { 
    this.callback = callback;
  }

  update = (ids) => {
    if (this.firstNotification) {
      this.firstNotification = false;
      this.setupNotifications();
    }

    this.sectionIds = ids;
  }

  repeat = async () => {
    const newSections = await Promise.all(
      this.sectionIds
        .map(APIManager.searchSection)
    )

    if (this.callback) this.callback(newSections);

    const toNotify = newSections.filter(this.mustNotifySection)
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
