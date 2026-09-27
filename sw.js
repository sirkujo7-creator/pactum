// Pactum: trabajador de servicio. Guarda el juego en el aparato para que funcione sin internet.
// Al publicar una versión nueva, cambia CACHE: así los aparatos descargan los archivos nuevos.
const CACHE = 'pactum-0.1.1';
const ARCHIVOS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'src/estilo.css',
  'src/main.js',
  'src/version.js',
  'src/arte/acuarela.js',
  'src/escenas/Arranque.js',
  'vendor/phaser.min.js',
  'vendor/fuentes/alegreya-latin-500-normal.woff2',
  'vendor/fuentes/alegreya-latin-700-normal.woff2',
  'vendor/fuentes/alegreya-latin-800-normal.woff2',
  'vendor/fuentes/alegreya-sans-latin-400-normal.woff2',
  'vendor/fuentes/alegreya-sans-latin-500-normal.woff2',
  'vendor/fuentes/alegreya-sans-latin-700-normal.woff2',
  'iconos/icono-180.png',
  'iconos/icono-192.png',
  'iconos/icono-512.png',
  'iconos/icono-maskable-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k.startsWith('pactum-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Primero la copia guardada; si no está, la red (y se guarda para la próxima).
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => {
      if (res.ok) { const copia = res.clone(); caches.open(CACHE).then(c => c.put(req, copia)); }
      return res;
    }).catch(() => req.mode === 'navigate' ? caches.match('index.html') : Response.error()))
  );
});
