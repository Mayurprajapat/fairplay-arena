// FairPlay Arena service worker — offline shell + stale-while-revalidate
const VERSION = 'fairplay-v1';
const STATIC_CACHE = VERSION + '-static';
const PAGES_CACHE = VERSION + '-pages';

const PRECACHE = [
  '/',
  '/static/css/style.css',
  '/static/js/main.js',
  '/static/js/i18n.js',
  '/static/manifest.json',
  '/static/icon.svg',
];

// Network-first for HTML/API (always fresh), cache-first for static assets.
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(STATIC_CACHE)
      .then(c => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== STATIC_CACHE && k !== PAGES_CACHE)
            .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  // APIs + page navigations: network first, fall back to cache when offline
  if (url.pathname.startsWith('/api/') || req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(PAGES_CACHE).then(c => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then(r => r || caches.match('/')))
    );
    return;
  }

  // Static assets: cache first (fast), refresh in background
  if (url.pathname.startsWith('/static/')) {
    e.respondWith(
      caches.match(req).then(cached => {
        const network = fetch(req)
          .then(res => {
            if (res && res.ok) {
              const copy = res.clone();
              caches.open(STATIC_CACHE).then(c => c.put(req, copy)).catch(() => {});
            }
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
  }
});
