// Punto de entrada: espera las fuentes, arranca Phaser y registra el modo sin internet.
import { Arranque } from './escenas/Arranque.js';

async function fuentesListas() {
  if (!document.fonts) return;
  const pesos = ['500 20px Alegreya', '800 20px Alegreya', '400 20px "Alegreya Sans"', '700 20px "Alegreya Sans"'];
  // Si tardan más de 3 s, se sigue con las fuentes de respaldo.
  await Promise.race([
    Promise.all(pesos.map(p => document.fonts.load(p, 'Pactum áéíóúñ'))),
    new Promise(r => setTimeout(r, 3000))
  ]).catch(() => {});
}

await fuentesListas();

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'juego',
  backgroundColor: '#ECEAE2',
  scale: { mode: Phaser.Scale.RESIZE, width: window.innerWidth, height: window.innerHeight },
  render: { antialias: true, roundPixels: false },
  banner: false,
  scene: [Arranque]
});

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(err => console.warn('Sin modo offline:', err));
}
