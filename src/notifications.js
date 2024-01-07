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
      .register('./src/service-worker.js')
      .then(registration => {
        console.info('Service Worker registered with scope:', registration.scope);
      })
      .catch(function (error) {
        console.error('Service Worker registration failed:', error);
      });
  }

  // Espera hasta que el Service Worker esté listo y activo
  await navigator.serviceWorker.ready;
}

let setupIsDone = new Promise((resolve) => {
  resolve(setupNotifications());
});

async function createNotification(nrc) {
  await setupIsDone;
  console.log({ nrc, contr: navigator.serviceWorker.controller, sw: navigator.serviceWorker.ready });
  navigator.serviceWorker.controller.postMessage({ action: 'register', nrc });
  console.log("Exito");
}

async function deleteNotification(nrc) {
  await setupIsDone;
  navigator.serviceWorker.controller.postMessage({ action: 'delete', nrc });
}

export { createNotification, deleteNotification };
