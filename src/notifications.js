const intervalIdMap = new Map();

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
        console.error('Service Worker registration failed:', error);
      });
  }

  // Espera hasta que el Service Worker esté listo y activo
  await navigator.serviceWorker.ready;

  // Escucha los mensajes enviados desde el Service Worker
  navigator.serviceWorker.controller.addEventListener('message', (event) => {
      if (event.data?.action === 'intervalId') {
        const intervalId = event.data.intervalId;
        const nrc = event.data.nrc;
        intervalIdMap.set(nrc, intervalId);
      }
    });

  console.info("Notifications setup done");
}

let setupIsDone = new Promise((resolve) => { 
  resolve(setupNotifications());
});


async function createNotification(nrc) {
  await setupIsDone;
  navigator.serviceWorker.controller.postMessage({ action: 'register', nrc });
  console.log(intervalIdMap);
}

async function deleteNotification(nrc) {
  await setupIsDone;
  navigator.serviceWorker.controller.postMessage({ action: 'delete', intervalId: intervalIdMap.get(nrc) });
  intervalIdMap.delete(nrc);
  console.log(intervalIdMap);
}

export { createNotification, deleteNotification };
