self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Required minimal fetch handler for PWA installation
  event.respondWith(fetch(event.request).catch(() => new Response('Offline')));
});
