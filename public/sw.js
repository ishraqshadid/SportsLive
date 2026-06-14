self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Passive fetch handler to satisfy the PWA install requirement 
// without interfering with video streams or API calls.
self.addEventListener('fetch', (event) => {
  return;
});
