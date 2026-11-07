const CACHE_NAME = 'mafiya-v1';
const ASSETS = [
  '/',
  '/static/css/style.css',
  '/static/js/svgs.js',
  '/static/js/audio.js',
  '/static/js/app.js',
  '/static/manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.url.includes('/api/') || e.request.url.includes('/ws/')) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
