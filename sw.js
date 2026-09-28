// Pactum: trabajador de servicio. Guarda el juego en el aparato para que funcione sin internet.
// Al publicar una versión nueva, cambia CACHE: así los aparatos descargan los archivos nuevos.
const CACHE = 'pactum-0.5.0';
const ARCHIVOS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'src/arte/acuarela.js',
  'src/arte/edificios.js',
  'src/arte/iso.js',
  'src/arte/naturaleza.js',
  'src/arte/personas.js',
  'src/arte/terreno.js',
  'src/core/anio.js',
  'src/core/azar.js',
  'src/core/cargar.js',
  'src/core/contenido.js',
  'src/core/dilemas.js',
  'src/core/estado.js',
  'src/core/guardado.js',
  'src/core/hacienda.js',
  'src/core/index.js',
  'src/core/leyes.js',
  'src/core/logros.js',
  'src/core/mundo.js',
  'src/core/obras.js',
  'src/core/pobladores.js',
  'src/core/reglas.js',
  'src/core/sociedad.js',
  'src/core/terreno.js',
  'src/data/consecuencias.json',
  'src/data/dificultades.json',
  'src/data/dilemas.json',
  'src/data/edificios.json',
  'src/data/etapas.json',
  'src/data/filosofias.json',
  'src/data/guia.json',
  'src/data/leyes.json',
  'src/data/logros.json',
  'src/data/personajes.json',
  'src/data/pobladores.json',
  'src/data/regimenes.json',
  'src/data/textos.json',
  'src/escenas/Arranque.js',
  'src/escenas/Interfaz.js',
  'src/escenas/Mapa.js',
  'src/escenas/Pobladores.js',
  'src/escenas/pantalla.js',
  'src/escenas/partida.js',
  'src/estilo.css',
  'src/main.js',
  'src/version.js',
  'vendor/fuentes/alegreya-latin-500-normal.woff2',
  'vendor/fuentes/alegreya-latin-700-normal.woff2',
  'vendor/fuentes/alegreya-latin-800-normal.woff2',
  'vendor/fuentes/alegreya-sans-latin-400-normal.woff2',
  'vendor/fuentes/alegreya-sans-latin-500-normal.woff2',
  'vendor/fuentes/alegreya-sans-latin-700-normal.woff2',
  'vendor/phaser.min.js',
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
