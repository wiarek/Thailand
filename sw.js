
const CACHE_NAME = 'thailand-cache-v3';
const urlsToCache = [
  '/',
  '/Thailand/index.html',
  '/Thailand/home.html',
  '/Thailand/audio/background.mp3',
  '/Thailand/style.css',
  '/Thailand/manifest.json',
  '/Thailand/icon-512.png',
  // Możesz dodać inne ścieżki statyczne w razie potrzeby
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        return response || fetch(event.request);
      })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(name) {
          return name !== CACHE_NAME;
        }).map(function(name) {
          return caches.delete(name);
        })
      );
    })
  );
});
