// Lobbix service worker — offline-first for static assets, network-first for API.
const VERSION = 'v1.3.0-lobbix';
const STATIC_CACHE = `lobbix-static-${VERSION}`;
const RUNTIME_CACHE = `lobbix-runtime-${VERSION}`;

// Note: the marketing landing page at "/" is intentionally NOT pre-cached —
// it updates frequently and we always want the latest from the network.
const STATIC_ASSETS = [
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.webmanifest',
  '/icon-192.svg',
  '/icon-512.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== RUNTIME_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Never cache non-GET
  if (request.method !== 'GET') return;

  // Landing page ("/" and explicit landing.html): always network — never cached.
  if (url.pathname === '/' || url.pathname === '/landing.html') {
    event.respondWith(fetch(request, { cache: 'no-store' }).catch(() => caches.match(request)));
    return;
  }

  // API: auth endpoints are always direct from the network — never cached,
  // so stale 429 "too many OTP" or old JWT responses cannot haunt the user.
  if (url.pathname.startsWith('/api/auth/')) {
    event.respondWith(fetch(request, { cache: 'no-store' }));
    return;
  }

  // Other API: network-first with cache fallback for reads
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          if (response.ok) {
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || new Response(
          JSON.stringify({ error: 'offline', offline: true }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        )))
    );
    return;
  }

  // Static assets: cache-first with network fallback
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        const clone = response.clone();
        if (response.ok) {
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    }).catch(() => {
      if (request.mode === 'navigate') return caches.match('/index.html');
    })
  );
});

// Listen for SKIP_WAITING message from the page (for instant updates)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
