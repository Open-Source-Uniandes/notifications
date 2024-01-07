async function setupNotifications() {

  // NOTIFICATIONS API

  // Revisa si el navegador soporta notificaciones
  if (!('Notification' in window)) {
    throw new Error('Este navegador no soporta notificaciones');
  }

  // Revisa si el usuario ha denegado permiso para recibir notificaciones
  else if (Notification.permission === 'denied') {
    throw new Error('Debes habilitar las notificaciones para esta página web');
  }

  // Revisa si el usuario no ha dado permiso para recibir notificaciones
  else if (Notification.permission === 'default') {
    Notification.requestPermission(function(permission) {
      if (permission === 'granted') {
        console.info('Notifications permission granted');
      } else {
        throw new Error('Debes autorizarnos para recibir notificaciones');
      }
    });
  }

  // SERVICE WORKERS API

  // Revisa si el navegador soporta Service Workers
  if (!('serviceWorker' in navigator)) {
    throw new Error('Este navegador no soporta Service Workers');
  } else if (!navigator.serviceWorker.controller) {
    // Registra el Service Worker si no hay uno registrado
    navigator.serviceWorker
      .register('/service-worker.js', { scope: '/' })
      .then(registration => {
        console.info('Service Worker registered with scope:', registration.scope);
      })
      .catch(function (error) {
        throw new Error('Service Worker registration failed:', error.message);
      });
  }

  // Espera hasta que el Service Worker esté listo y activo
  await navigator.serviceWorker.ready;

  // PERIODIC SYNC API

  // Revisa si el navegador soporta tareas periódicas
  if (!('periodicSync' in await navigator.serviceWorker.ready)) {
    throw new Error('El navegador no soporta tareas periódicas');
  }

  // Revisa si el navegador soporta Background Sync
  const status = await navigator.permissions.query({
    name: 'periodic-background-sync',
  });
  if (status.state === 'denied') {
    throw new Error('Debes instalar la aplicación y habilitar las tareas periódicas');
  }
    
  // Elimina todas las tareas periódicas registradas previamente
  await navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(async registration => {
      await registration.periodicSync.getTags().then(tags => {
        tags.forEach(tag => {
          registration.periodicSync.unregister(tag);
        });
      });
    });
  });
      

  console.info("Notifications setup done");
}


async function createNotification(nrc) {
  // Registra una nueva tarea periódica
  const registration = await navigator.serviceWorker.ready;
  registration.periodicSync.register(`notifications/${nrc}`, {
    // El intervalo mínimo es de 5 minutos
    minInterval: 5 * 60 * 1000,
  });
}

async function deleteNotification(nrc) {
  // Elimina la tarea periódica
  const registration = await navigator.serviceWorker.ready;
  registration.periodicSync.unregister(`notifications/${nrc}`);
}

export { setupNotifications, createNotification, deleteNotification };
