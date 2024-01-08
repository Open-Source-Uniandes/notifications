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
