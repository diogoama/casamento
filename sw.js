// Bump VERSION when you deploy a new build so phones pick it up.
const VERSION = '1.0.1';
const CACHE = 'mesas-' + VERSION;
const SHELL = ['./', './index.html', './data.js', './firebase-config.js', './manifest.webmanifest',
  './icons/logo.png', './icons/icon-192.png', './icons/apple-touch-icon.png'];
const CDN = ['www.gstatic.com', 'cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {            // app files: network first, offline fallback
    e.respondWith(fetch(req).then(res => { const c = res.clone(); caches.open(CACHE).then(x => x.put(req, c)); return res; })
      .catch(() => caches.match(req).then(r => r || caches.match('./index.html'))));
  } else if (CDN.includes(url.hostname) && !url.pathname.includes('/__/')) {  // libraries & fonts: cache first
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => { const c = res.clone(); caches.open(CACHE).then(x => x.put(req, c)); return res; })));
  }
});
