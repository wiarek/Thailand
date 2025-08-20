// === ustawienia ===
const APP_BASE = '/Thailand/';                   // ważne: subfolder
const PRECACHE = 'thailand-precache-v4
  ';
const RUNTIME  = 'thailand-runtime-v4
  ';

const PRECACHE_URLS = [
  APP_BASE,                       // = /Thailand/
  APP_BASE + 'index.html',
  APP_BASE + 'home.html',
  APP_BASE + 'manifest.json',
  APP_BASE + 'icon-512.png',
  APP_BASE + 'audio/background.mp3',
  // dopisz tu inne pliki statyczne, jeśli istnieją, np.:
  // APP_BASE + 'style.css',
];

// === install: pre-cache ===
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(PRECACHE).then((cache) =>
      cache.addAll(PRECACHE_URLS.map(u => new Request(u, { cache: 'reload' })))
    )
  );
});

// === activate: porządki + przejęcie kontroli ===
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys
        .filter(k => k !== PRECACHE && k !== RUNTIME)
        .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// proste helpery strategii
async function cacheFirst(request) {
  const cache = await caches.open(RUNTIME);
  const cached = await cache.match(request);
  if (cached) return cached;
  const resp = await fetch(request);
  // tylko 200 i basic wrzucamy
  if (resp && resp.status === 200 && resp.type === 'basic') {
    cache.put(request, resp.clone());
  }
  return resp;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then((resp) => {
    if (resp && resp.status === 200 && resp.type === 'basic') {
      cache.put(request, resp.clone());
    }
    return resp;
  }).catch(() => cached); // jeśli offline – zostaw cache
  return cached || fetchPromise;
}

// === fetch: nawigacja + zasoby ===
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;

  // 1) Nawigacja (przejścia między stronami)
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        // sieć najpierw (żeby widzieć nowe wersje)
        const net = await fetch(request);
        return net;
      } catch (_) {
        // offline fallback: home.html -> index.html
        const cache = await caches.open(PRECACHE);
        return (await cache.match(APP_BASE + 'home.html'))
            || (await cache.match(APP_BASE + 'index.html'))
            || Response.error();
      }
    })());
    return;
  }

  // 2) Zasoby z tej samej domeny
  if (sameOrigin) {
    // obrazki i audio: cache-first (ważne dla galerii/offline)
    if (url.pathname.startsWith(APP_BASE + 'img/')
     || url.pathname.startsWith(APP_BASE + 'audio/')) {
      event.respondWith(cacheFirst(request));
      return;
    }
    // reszta: stale-while-revalidate
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // 3) Zasoby zewnętrzne – próbuj sieć, a jak offline to co jest w cache
  event.respondWith(
    caches.match(request).then(c => c || fetch(request).catch(() => c))
  );
});
