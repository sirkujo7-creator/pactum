// Escena de arranque: portada en acuarela y estado de la base técnica.
import { pintarPortada, pintarNiebla, TINTA } from '../arte/acuarela.js';
import { VERSION } from '../version.js';
import { DPR, tam, capaUI, el } from './pantalla.js';
import { cargarContenido, C } from '../core/index.js';
import { partida } from './partida.js';
import { cargarGuardada, partidaV9 } from './memoria.js';
import { EMB } from '../arte/retratos.js';

const SERIF = 'Alegreya, Georgia, serif';
const SANS = '"Alegreya Sans", system-ui, sans-serif';
const RES = DPR;
const reducirMovimiento = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export class Arranque extends Phaser.Scene {
  constructor() { super('Arranque'); }

  init(datos) { this.pedirNueva = !!(datos && datos.nueva); }

  create() {
    this.cameras.main.setOrigin(0, 0).setZoom(DPR);
    // Botones: continuar la partida guardada o empezar una nueva (dificultad → régimen, como en la v9).
    // Si en este aparato quedó una partida de la versión 9 (Polis), también se puede continuar.
    this.botones = el('div', { class: 'portada-ui' });
    this.ponerBotones();
    this.velo = el('div', { class: 'velo' }, [this.card = el('div', { class: 'card', role: 'dialog', 'aria-modal': 'true' })]);
    this.velo.hidden = true;
    this.velo.addEventListener('click', e => { if (e.target === this.velo) this.velo.hidden = true; });
    this.ui = el('div', { class: 'mapa-ui' }, [this.botones, this.velo]);
    capaUI().append(this.ui);
    this.events.once('shutdown', () => this.ui.remove());
    this.teclas = e => { if (e.key === 'Escape') this.velo.hidden = true; };
    window.addEventListener('keydown', this.teclas);
    this.events.once('shutdown', () => window.removeEventListener('keydown', this.teclas));
    if (this.pedirNueva) this.elegirDificultad();
    // La portada se hornea una sola vez a buena resolución y luego solo se escala.
    if (!this.textures.exists('portada')) this.textures.addCanvas('portada', pintarPortada(1600, 1000));

    this.fondo = this.add.image(0, 0, 'portada').setOrigin(.5, 1);
    if (!this.textures.exists('niebla')) this.textures.addCanvas('niebla', pintarNiebla());
    this.nieblas = [0, 1, 2].map(i => this.add.image(0, 0, 'niebla').setAlpha(.55 - i * .1));

    this.titulo = this.add.text(0, 0, 'PACTUM', { fontFamily: SERIF, fontStyle: '800', color: TINTA, resolution: RES }).setOrigin(.5, 0);
    this.subtitulo = this.add.text(0, 0, 'la nueva polis', { fontFamily: SERIF, fontStyle: '500', color: '#5A5648', resolution: RES }).setOrigin(.5, 0);
    this.estado = this.add.text(0, 0, 'Gobierna un territorio del Tolima junto al río.\nDel pueblo, por el pueblo, para el pueblo.', { fontFamily: SERIF, fontStyle: '500', color: TINTA, align: 'center', lineSpacing: 6, resolution: RES }).setOrigin(.5, 0);
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

  // Pie de página: versión y si ya funciona sin internet.
  actualizarEstado() {
    this.pie.setText(`Versión ${VERSION} · ${this.offline === 'listo' ? 'funciona sin internet' : 'preparando el modo sin internet…'}`);
  }

  async ponerBotones() {
    await cargarContenido();
    if (!partida.S) partida.S = cargarGuardada();
    const S = partida.S, v9 = !S ? partidaV9() : null, b = [];
    if (S && !S.over) b.push(el('button', { class: 'pildora grande', on: { click: () => this.scene.start('Mapa') } }, `Continuar: ${C.STAGES[S.stage].n}, año ${S.year}`));
    if (v9) b.push(el('button', { class: 'pildora grande', on: { click: () => { partida.S = v9; this.scene.start('Mapa'); } } }, `Continuar partida de Polis (v9): año ${v9.year}`));
    b.push(el('button', { class: 'pildora' + (b.length ? '' : ' grande'), on: { click: () => this.elegirDificultad() } }, 'Nueva partida'));
    b.push(el('button', { class: 'pildora', on: { click: () => this.comoJugar() } }, 'Cómo jugar'));
    this.botones.replaceChildren(...b);
  }

  comoJugar() {
    this.tarjeta(`<div class="big">🏛️</div><h3>Cómo jugar</h3>
      <p>Gobiernas un territorio del Tolima junto al río. Llévalo de Aldea a Pueblo, Ciudad y Polis, y sostén la Polis los años que pida tu dificultad.</p>
      <p>Construye casas, cultivos y talleres; fija los impuestos de cada clase; promulga leyes y responde los dilemas de cada año. Cada decisión refleja una corriente filosófica y algunas regresan años después.</p>
      <p>Tu forma de gobernar puede corromper el régimen o desatar una revolución, como en el ciclo de Polibio.</p>
      <p><b>Celular:</b> arrastra, pellizca y toca. <b>Computador:</b> rueda para acercar, flechas para moverte, 1 a 5 para los paneles y barra espaciadora para terminar el año.</p>
      <p>La partida se guarda sola en este aparato.</p>
      <button class="main" id="okB">Entendido</button>`);
    this.card.querySelector('#okB').onclick = () => { this.velo.hidden = true; };
  }

  tarjeta(html) { this.card.innerHTML = html; this.velo.hidden = false; const b = this.card.querySelector('button'); if (b) b.focus(); }
  async elegirDificultad() {
    await cargarContenido();
    this.tarjeta(`<div class="big">🏛️</div><h3>Elige la dificultad</h3>
      ${Object.entries(C.DIFFS).map(([k, v]) => `<button class="opt" data-d="${k}">${v.n}<small>${v.d}</small></button>`).join('')}
      <label class="chk"><input type="checkbox" id="gChk" checked> Mostrar la guía de los primeros años</label>
      <label class="chk">Código de territorio (opcional) <input type="text" inputmode="numeric" id="seedIn" placeholder="al azar" maxlength="7" class="inp"></label>`);
    this.card.querySelectorAll('[data-d]').forEach(b => b.onclick = () => {
      const semilla = this.card.querySelector('#seedIn').value.replace(/\D/g, ''), guia = this.card.querySelector('#gChk').checked;
      this.elegirRegimen(b.dataset.d, guia, semilla ? +semilla : null);
    });
  }
  elegirRegimen(diff, guide, semilla) {
    const fila = k => `<button class="opt reg" data-r="${k}" style="--rc:${C.REG[k].col}">${EMB[k]}<span><b>${C.REG[k].n}</b><small>${C.REG[k].d}</small>${C.REG[k].v ? `<small class="ventaja">✦ ${C.REG[k].v}</small>` : ''}</span></button>`;
    this.tarjeta(`<h3>Elige cómo se gobierna</h3><p class="small">Aristóteles distinguía tres formas rectas, que gobiernan para el bien común, y sus desviaciones, que gobiernan para sí. Tu forma de gobernar puede transformar el régimen.</p>
      <h2>Formas rectas</h2>${['monarquia', 'aristocracia', 'republica'].map(fila).join('')}
      <h2>Formas corruptas (más difíciles)</h2>${['tirania', 'oligarquia', 'demagogia'].map(fila).join('')}`);
    this.card.querySelectorAll('[data-r]').forEach(b => b.onclick = () => {
      this.velo.hidden = true;
      this.scene.start('Mapa', { nueva: true, semilla, opciones: { diff, guide, reg: b.dataset.r, bienvenida: true } });
    });
  }

  maquetar() {
    const { w, h } = tam(this);
    const celular = w < 700;

    // La portada cubre la pantalla, apoyada en el borde de abajo.
    // Se centra lo más posible en el nevado sin dejar bordes vacíos.
    const s = Math.max(w / 1600, h / 1000) * 1.02, borde = w / (2 * 1600 * s);
    // Si sobra alto (pantallas anchas y bajas), se recorta más el valle que el cielo, para no cortar el nevado.
    this.fondo.setOrigin(clampN(.66, borde, 1 - borde), .3).setPosition(w / 2, h * .3).setScale(s);

    const base = Math.min(w, h * .9);
    this.titulo.setFontSize(Math.round(clampN(base * .16, 44, 120))).setPosition(w / 2, h * (celular ? .08 : .07));
    this.titulo.setLetterSpacing(Math.round(this.titulo.style.fontSize.replace('px', '') * .06));
    this.subtitulo.setFontSize(Math.round(clampN(base * .06, 20, 44))).setPosition(w / 2, this.titulo.y + this.titulo.height * .95);

    // Panel de estado sobre un papel semitransparente para que se lea sobre el paisaje.
    this.estado.setFontSize(Math.round(clampN(base * .045, 16, 22))).setWordWrapWidth(w - 32).setPosition(w / 2, this.subtitulo.y + this.subtitulo.height + h * .03);
    this.estado.setBackgroundColor('rgba(236,234,226,.78)').setPadding(16, 10, 16, 10);
    this.actualizarEstado();

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
