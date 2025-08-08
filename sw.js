const CACHE_NAME = 'thailand-2026-cache-v1'; // UWAGA: zwiększ przy każdej aktualizacji!
const urlsToCache = [
  '/Thailand/',
  '/Thailand/index.html',
  '/Thailand/home.html',
  '/Thailand/manifest.json',
  '/Thailand/icon-512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // <- od razu aktywuje nową wersję
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim(); // <- od razu przejmuje kontrolę nad otwartymi zakładkami
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

// <- Komunikacja ze stroną: pozwala na kliknięcie "Odśwież"
self.addEventListener('message', event => {
  if (event.data === 'checkForUpdate') {
    self.skipWaiting();
  }
});
