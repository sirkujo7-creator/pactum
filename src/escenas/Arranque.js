// Escena de arranque: portada en acuarela y estado de la base técnica.
import { pintarPortada, pintarNiebla, TINTA } from '../arte/acuarela.js';
import { VERSION, PASO } from '../version.js';

const SERIF = 'Alegreya, Georgia, serif';
const SANS = '"Alegreya Sans", system-ui, sans-serif';
const RES = Math.min(window.devicePixelRatio || 1, 3);
const reducirMovimiento = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export class Arranque extends Phaser.Scene {
  constructor() { super('Arranque'); }

  create() {
    // La portada se hornea una sola vez a buena resolución y luego solo se escala.
    if (!this.textures.exists('portada')) this.textures.addCanvas('portada', pintarPortada(1600, 1000));

    this.fondo = this.add.image(0, 0, 'portada').setOrigin(.5, 1);
    if (!this.textures.exists('niebla')) this.textures.addCanvas('niebla', pintarNiebla());
    this.nieblas = [0, 1, 2].map(i => this.add.image(0, 0, 'niebla').setAlpha(.55 - i * .1));

    this.titulo = this.add.text(0, 0, 'PACTUM', { fontFamily: SERIF, fontStyle: '800', color: TINTA, resolution: RES }).setOrigin(.5, 0);
    this.subtitulo = this.add.text(0, 0, 'la nueva polis', { fontFamily: SERIF, fontStyle: '500', color: '#5A5648', resolution: RES }).setOrigin(.5, 0);
    this.estado = this.add.text(0, 0, '', { fontFamily: SANS, color: TINTA, align: 'center', lineSpacing: 4, resolution: RES }).setOrigin(.5, 0);
    this.pie = this.add.text(0, 0, `Versión ${VERSION}`, { fontFamily: SANS, color: '#6A675C', resolution: RES }).setOrigin(.5, 1);

    this.offline = 'preparando…';
    this.actualizarEstado();
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => { this.offline = 'listo'; this.actualizarEstado(); });
    } else {
      this.offline = 'no disponible en este navegador';
    }

    this.maquetar();
    this.scale.on('resize', this.maquetar, this);
    this.events.once('shutdown', () => this.scale.off('resize', this.maquetar, this));
  }

  actualizarEstado() {
    const instalada = window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone;
    const { width: w, height: h } = this.scale;
    const aparato = w < 700 ? 'celular' : 'computador';
    this.estado.setText([
      PASO,
      `Motor Phaser ${Phaser.VERSION} ✓`,
      `Sin internet: ${this.offline}`,
      instalada ? 'Abierta como app ✓' : 'Se puede instalar como app',
      `Pantalla ${Math.round(w)}×${Math.round(h)} (${aparato})`
    ]);
  }

  maquetar() {
    const { width: w, height: h } = this.scale;
    const celular = w < 700;

    // La portada cubre la pantalla, apoyada en el borde de abajo.
    // Se centra lo más posible en el nevado sin dejar bordes vacíos.
    const s = Math.max(w / 1600, h / 1000) * 1.02, borde = w / (2 * 1600 * s);
    this.fondo.setOrigin(clampN(.66, borde, 1 - borde), 1).setPosition(w / 2, h).setScale(s);

    const base = Math.min(w, h * .9);
    this.titulo.setFontSize(Math.round(clampN(base * .16, 44, 120))).setPosition(w / 2, h * (celular ? .08 : .07));
    this.titulo.setLetterSpacing(Math.round(this.titulo.style.fontSize.replace('px', '') * .06));
    this.subtitulo.setFontSize(Math.round(clampN(base * .06, 20, 44))).setPosition(w / 2, this.titulo.y + this.titulo.height * .95);

    // Panel de estado sobre un papel semitransparente para que se lea sobre el paisaje.
    this.estado.setFontSize(Math.round(clampN(base * .04, 15, 20))).setWordWrapWidth(w - 32).setPosition(w / 2, this.subtitulo.y + this.subtitulo.height + h * .04);
    this.actualizarEstado();
    this.estado.setBackgroundColor('rgba(236,234,226,.82)').setPadding(14, 10, 14, 10);

    this.pie.setFontSize(14).setPosition(w / 2, h - 12);

    // Bancos de niebla que pasan despacio por las montañas.
    this.tweens.killTweensOf(this.nieblas);
    this.nieblas.forEach((n, i) => {
      n.setDisplaySize(w * (.6 + i * .2), h * .09).setPosition(w * (.2 + i * .3), h * (.42 + i * .06));
      if (!reducirMovimiento()) {
        this.tweens.add({ targets: n, x: n.x + w * .12, duration: 14000 + i * 4000, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      }
    });
  }
}

function clampN(v, a, b) { return Math.max(a, Math.min(b, v)); }
