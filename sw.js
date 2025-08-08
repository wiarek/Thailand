const CACHE_NAME = 'thailand-2026-cache-v3'; // Zwiększaj za każdym razem
const urlsToCache = [
  '/Thailand/',
  '/Thailand/index.html',
  '/Thailand/manifest.json',
  '/Thailand/icon-512.png',
  // Dodaj inne pliki statyczne, np. galerie
];

// Instalacja i dodanie plików do cache
self.addEventListener('install', event => {
  self.skipWaiting(); // od razu aktywuje nowy SW
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Aktywacja i czyszczenie starych cache’ów
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim(); // przejmuje kontrolę nad otwartymi stronami
});

// Pobieranie z cache lub z sieci
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});

// Powiadamianie klientów o nowej wersji (do komunikatu)
self.addEventListener('message', event => {
  if (event.data === 'checkForUpdate') {
    self.skipWaiting();
  }
});
