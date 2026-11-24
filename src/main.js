// Punto de entrada: espera las fuentes, arranca Phaser y registra el modo sin internet.
import { Arranque } from './escenas/Arranque.js';
import { Mapa } from './escenas/Mapa.js';
import { DPR } from './escenas/pantalla.js';
import { ES_CELULAR } from './arte/fresco.js';

async function fuentesListas() {
  if (!document.fonts) return;
  const pesos = ['500 20px Alegreya', '700 20px Alegreya', '800 20px Alegreya', '400 20px "Alegreya Sans"', '700 20px "Alegreya Sans"'];
  // Si tardan más de 3 s, se sigue con las fuentes de respaldo.
  await Promise.race([
    Promise.all(pesos.map(p => document.fonts.load(p, 'Pactum áéíóúñ'))),
    new Promise(r => setTimeout(r, 3000))
  ]).catch(() => {});
}

await fuentesListas();

// El lienzo se crea con la resolución real de la pantalla y se muestra a tamaño normal (zoom 1/DPR).
const juego = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'juego',
  backgroundColor: '#ECEAE2',
  scale: { mode: Phaser.Scale.NONE, width: Math.round(window.innerWidth * DPR), height: Math.round(window.innerHeight * DPR), zoom: 1 / DPR },
  // Mipmaps (versiones reducidas suaves): las figuras se dibujan grandes y se ven 6 a 9 veces más pequeñas; sin ellas
  // pierden detalle y chispean (Juan: «se ve muy poco definida la animación»). Solo las hojas con lados potencia de dos
  // los usan; en celular son solo las de personas y acciones (las demás quedan igual, para cuidar la memoria).
  render: { antialias: true, roundPixels: false, mipmapFilter: 'LINEAR_MIPMAP_LINEAR', powerPreference: 'high-performance' },
  input: { activePointers: 3 },
  banner: false,
  scene: [Arranque, Mapa]
});
// Acceso para pruebas automáticas.
window.__pactum = juego;
let espera = null;
window.addEventListener('resize', () => {
  clearTimeout(espera);
  espera = setTimeout(() => juego.scale.resize(Math.round(window.innerWidth * DPR), Math.round(window.innerHeight * DPR)), 80);
});

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(err => console.warn('Sin modo offline:', err));
}
