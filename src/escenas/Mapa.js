// Escena del mapa: el territorio en acuarela, con cámara que se mueve y se acerca.
// Celular: arrastrar con un dedo, pellizcar con dos, tocar una casilla para ver su ficha.
// Computador: arrastrar con el ratón, rueda para acercar, flechas para mover, + y − para el zoom, 0 para ver todo.
import { cargarContenido, freshState, genTerreno, nearRiver, BIOMA, metros } from '../core/index.js';
import { pintarSector, pintarFondo, caminoRio, LADO_SECTOR } from '../arte/terreno.js';
import { hornearNaturaleza, colocarNaturaleza } from '../arte/naturaleza.js';
import { pintarNiebla, lienzo } from '../arte/acuarela.js';
import { P, TW, TH, casillaEn } from '../arte/iso.js';
import { DPR, tam, reducirMovimiento, capaUI, el } from './pantalla.js';

const ZOOM_MAX = 3.6;
const PROF_FONDO = -3000, PROF_TERRENO = -2000, PROF_BRILLO = -900, PROF_MARCA = -800, PROF_NIEBLA = 50000;

export class Mapa extends Phaser.Scene {
  constructor() { super('Mapa'); }

  init(datos) { this.semilla = datos && datos.semilla; }

  async create() {
    const cam = this.cameras.main;
    cam.setOrigin(0, 0).setBackgroundColor('#ECEAE2');
    this.listo = false;
    this.crearUI();
    this.events.once('shutdown', () => {
      this.ui.remove();
      for (const k of ['fondo', ...Object.keys(this.sectores || {})]) if (this.textures.exists(k)) this.textures.remove(k);
    });
    this.avisar('Pintando el territorio…');

    await cargarContenido();
    // ?lado=64 en la dirección permite probar mapas más grandes (entre 16 y 64).
    const lado = Math.max(16, Math.min(64, +new URLSearchParams(location.search).get('lado') || 32));
    this.S = freshState('normal', false, this.semilla || null, 'republica', { n: lado });
    this.T = genTerreno(this.S.seed, this.S.n);
    this.vistaInicial();

    // Fondo lejano y sombra del diorama.
    const f = pintarFondo(this.T, .8);
    this.textures.addCanvas('fondo', f.canvas);
    this.add.image(f.x, f.y, 'fondo').setOrigin(0).setScale(1 / f.escala).setDepth(PROF_FONDO);
    const N = this.T.N, pie = P(N, N, -2.2);
    this.add.ellipse(pie[0], pie[1] + 16, N * TW * .9, 56, 0x3A3020, .12).setDepth(PROF_FONDO + 1);

    // Terreno por sectores, de atrás hacia adelante, repartido en varios cuadros para no congelar la pantalla.
    const n = Math.ceil(N / LADO_SECTOR), cola = [];
    for (let sr = 0; sr < n; sr++) for (let sc = 0; sc < n; sc++) cola.push([sr, sc]);
    cola.sort((a, b) => (a[0] + a[1]) - (b[0] + b[1]));
    this.sectores = {};
    const escala = DPR > 1.5 ? 1.6 : 1.4, total = cola.length, t0 = performance.now();
    await new Promise(fin => {
      const paso = () => {
        const limite = performance.now() + 14;
        while (cola.length && performance.now() < limite) {
          const [sr, sc] = cola.shift(), s = pintarSector(this.T, sr, sc, { escala }), clave = `sector-${sr}-${sc}`;
          this.textures.addCanvas(clave, s.canvas);
          this.sectores[clave] = this.add.image(s.x, s.y, clave).setOrigin(0).setScale(1 / s.escala).setDepth(PROF_TERRENO + (sr + sc) * .01);
        }
        this.avisar(`Pintando el territorio… ${Math.round((1 - cola.length / total) * 100)}%`);
        if (cola.length) requestAnimationFrame(paso); else fin();
      };
      paso();
    });
    this.tiempoPintura = Math.round(performance.now() - t0);

    this.ponerNaturaleza();
    this.ponerVida();
    this.marca = this.add.graphics().setDepth(PROF_MARCA);
    this.activarControles();
    this.avisar('');
    this.listo = true;
    console.info(`Territorio ${N}×${N} pintado en ${this.tiempoPintura} ms`);
  }

  // Árboles, frailejones y animales, ordenados por su posición (fila + columna).
  ponerNaturaleza() {
    const h = hornearNaturaleza(0);
    if (this.textures.exists('naturaleza')) this.textures.remove('naturaleza');
    const tx = this.textures.addCanvas('naturaleza', h.canvas);
    for (const [k, m] of Object.entries(h.marcos)) tx.add(k, 0, m.x, m.y, m.w, m.h);
    this.plantas = colocarNaturaleza(this.T, this.S.map).map(o => {
      const m = h.marcos[o.k], p = P(o.r, o.c, this.T.hf(o.r, o.c));
      return this.add.image(p[0], p[1], 'naturaleza', o.k).setOrigin(m.ax / m.w, m.ay / m.h).setScale(o.s / h.escala).setDepth(o.r + o.c);
    });
  }

  // Brillo del río, niebla en el bosque alto y sombras de nubes.
  ponerVida() {
    const quieto = reducirMovimiento();
    this.rio = caminoRio(this.T).filter(x => x.r >= 0 && x.c >= 0 && x.r <= this.T.N && x.c <= this.T.N).map(x => x.p);
    this.largoRio = [0];
    for (let i = 1; i < this.rio.length; i++) this.largoRio.push(this.largoRio[i - 1] + Math.hypot(this.rio[i][0] - this.rio[i - 1][0], this.rio[i][1] - this.rio[i - 1][1]));
    this.brillo = this.add.graphics().setDepth(PROF_BRILLO);

    if (!this.textures.exists('bancoNiebla')) this.textures.addCanvas('bancoNiebla', pintarNiebla());
    const altos = this.T.tiles.filter(t => t.b === 'niebla').filter((t, i) => i % 5 === 0);
    this.nieblas = altos.map((t, i) => {
      const p = P(t.r + .5, t.c + .5, t.h + 1.6);
      const img = this.add.image(p[0], p[1], 'bancoNiebla').setDisplaySize(150, 34).setAlpha(.32).setDepth(PROF_NIEBLA);
      if (!quieto) this.tweens.add({ targets: img, x: p[0] + 16, alpha: .2, duration: 7000 + (i % 5) * 1300, yoyo: true, repeat: -1, ease: 'Sine.inOut', delay: i * 170 });
      return img;
    });

    if (!this.textures.exists('sombraNube')) {
      const c = lienzo(256, 96), g = c.getContext('2d'), gr = g.createRadialGradient(128, 48, 0, 128, 48, 48);
      gr.addColorStop(0, 'rgba(29,42,48,1)'); gr.addColorStop(1, 'rgba(29,42,48,0)');
      g.setTransform(2.6, 0, 0, 1, -128 * 1.6, 0); g.fillStyle = gr; g.fillRect(0, 0, 256, 96);
      this.textures.addCanvas('sombraNube', c);
    }
    const izq = P(this.T.N, 0)[0] - 300, ancho = P(0, this.T.N)[0] - izq + 600;
    this.nubes = quieto ? [] : [0, 1, 2].map(k => this.add.image(0, P(0, 0)[1] + 200 + k * this.T.N * 6, 'sombraNube')
      .setDisplaySize(360, 100).setAlpha(.07).setDepth(PROF_NIEBLA + 1).setData({ izq, ancho, fase: k * 560 }));
  }

  update(tiempo) {
    if (!this.listo) return;
    const s = tiempo / 1000, quieto = reducirMovimiento();
    // Brillo del río: trazos cortos que bajan con la corriente.
    const g = this.brillo; g.clear();
    const total = this.largoRio[this.largoRio.length - 1];
    if (total > 0) {
      for (const [des, dy, dx, al] of [[quieto ? 0 : s * 14, -1, 0, .55], [quieto ? 13 : s * 10 + 13, 3, -5, .3]]) {
        g.lineStyle(1.3, 0xF2FAFC, al);
        for (let d = des % 32; d < total; d += 32) this.trazo(g, d, d + 6, dx, dy);
      }
    }
    for (const n of this.nubes) {
      const { izq, ancho, fase } = n.data.values;
      n.x = izq + ((s * 7 + fase) % ancho);
    }
  }

  trazo(g, a, b, dx, dy) {
    const L = this.largoRio, R = this.rio, pos = d => {
      let i = 1; while (i < L.length - 1 && L[i] < d) i++;
      const f = (d - L[i - 1]) / Math.max(1e-6, L[i] - L[i - 1]);
      return [R[i - 1][0] + (R[i][0] - R[i - 1][0]) * f + dx, R[i - 1][1] + (R[i][1] - R[i - 1][1]) * f + dy];
    };
    const p = pos(a), q = pos(Math.min(b, L[L.length - 1]));
    g.lineBetween(p[0], p[1], q[0], q[1]);
  }

  // ---------- Cámara ----------
  limitesMundo() {
    const N = this.T.N, iz = P(N, 0)[0], de = P(0, N)[0], ar = P(0, 0, 12)[1] - 120, ab = P(N, N, -2.2)[1] + 40;
    return { iz, de, ar, ab, w: de - iz, h: ab - ar };
  }
  zoomMin() { const { w, h } = tam(this), L = this.limitesMundo(); return Math.min(w / L.w, h / L.h) * .8; }
  encuadrar() {
    const { w, h } = tam(this), L = this.limitesMundo(), s = Math.min(w / L.w, h / L.h) * .96;
    this.fijarCamara(s, (L.iz + L.de) / 2, (L.ar + L.ab) / 2);
  }
  // En computador se ve todo el diorama; en celular vertical, un poco más cerca y centrado en la aldea.
  vistaInicial() {
    const { w, h } = tam(this);
    if (w >= 700 || w > h) return this.encuadrar();
    const L = this.limitesMundo(), i = this.S.map.findIndex(x => x.b), t = this.T.tiles[i], p = P(t.r + .5, t.c + .5, t.h);
    this.fijarCamara(Math.min(ZOOM_MAX, w / L.w * 1.8), p[0], p[1] - 40);
  }
  enfocarAldea() {
    const i = this.S.map.findIndex(x => x.b), t = this.T.tiles[i], p = P(t.r + .5, t.c + .5, t.h), { w } = tam(this);
    this.fijarCamara(Math.min(ZOOM_MAX, Math.max(w / 520, 1.4)), p[0], p[1]);
  }
  // s: escala en píxeles de pantalla; (x, y): punto del mundo que queda en el centro.
  fijarCamara(s, x, y) {
    const cam = this.cameras.main, { w, h } = tam(this);
    this.escala = s; cam.setZoom(s * DPR);
    cam.scrollX = x - w / 2 / s; cam.scrollY = y - h / 2 / s;
    this.limitarCamara();
  }
  centro() { const cam = this.cameras.main, { w, h } = tam(this); return [cam.scrollX + w / 2 / this.escala, cam.scrollY + h / 2 / this.escala]; }
  limitarCamara() {
    const cam = this.cameras.main, L = this.limitesMundo(), { w, h } = tam(this), vw = w / this.escala, vh = h / this.escala;
    cam.scrollX = Phaser.Math.Clamp(cam.scrollX, L.iz - vw * .6, L.de - vw * .4);
    cam.scrollY = Phaser.Math.Clamp(cam.scrollY, L.ar - vh * .6, L.ab - vh * .4);
  }
  // Acercar o alejar dejando fijo el punto de pantalla (px, py).
  zoomEn(f, px, py) {
    const cam = this.cameras.main, s0 = this.escala, s1 = Phaser.Math.Clamp(s0 * f, this.zoomMin(), ZOOM_MAX);
    const wx = cam.scrollX + px / s0, wy = cam.scrollY + py / s0;
    this.escala = s1; cam.setZoom(s1 * DPR);
    cam.scrollX = wx - px / s1; cam.scrollY = wy - py / s1;
    this.limitarCamara();
  }
  mover(dx, dy) { const cam = this.cameras.main; cam.scrollX -= dx / this.escala; cam.scrollY -= dy / this.escala; this.limitarCamara(); }

  activarControles() {
    const dedos = new Map();
    let arrastre = null, pellizco = null;
    const pos = p => [p.x / DPR, p.y / DPR];
    this.input.on('pointerdown', p => {
      dedos.set(p.id, pos(p));
      if (dedos.size === 1) arrastre = { ultimo: pos(p), inicio: pos(p), t: p.downTime, lejos: 0 };
      if (dedos.size === 2) { const [a, b] = [...dedos.values()]; pellizco = { d: Math.hypot(a[0] - b[0], a[1] - b[1]) }; arrastre = null; }
    });
    this.input.on('pointermove', p => {
      if (!dedos.has(p.id) || !p.isDown) return;
      dedos.set(p.id, pos(p));
      if (dedos.size === 2 && pellizco) {
        const [a, b] = [...dedos.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]);
        this.zoomEn(d / pellizco.d, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2); pellizco.d = d;
        return;
      }
      if (arrastre) {
        const q = pos(p);
        arrastre.lejos = Math.max(arrastre.lejos, Math.hypot(q[0] - arrastre.inicio[0], q[1] - arrastre.inicio[1]));
        if (arrastre.lejos > 6) this.mover(q[0] - arrastre.ultimo[0], q[1] - arrastre.ultimo[1]);
        arrastre.ultimo = q;
      }
    });
    const soltar = p => {
      if (arrastre && dedos.size === 1 && arrastre.lejos <= 6 && p.upTime - arrastre.t < 600) this.tocar(...pos(p));
      dedos.delete(p.id);
      if (dedos.size < 2) pellizco = null;
      if (!dedos.size) arrastre = null;
    };
    this.input.on('pointerup', soltar);
    this.input.on('pointerupoutside', soltar);
    this.input.on('wheel', (p, objs, dx, dy) => this.zoomEn(dy < 0 ? 1.12 : 1 / 1.12, ...pos(p)));

    const teclas = e => {
      if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      const { w, h } = tam(this), paso = 60;
      const acciones = {
        ArrowLeft: () => this.mover(paso, 0), ArrowRight: () => this.mover(-paso, 0), ArrowUp: () => this.mover(0, paso), ArrowDown: () => this.mover(0, -paso),
        a: () => this.mover(paso, 0), d: () => this.mover(-paso, 0), w: () => this.mover(0, paso), s: () => this.mover(0, -paso),
        '+': () => this.zoomEn(1.25, w / 2, h / 2), '=': () => this.zoomEn(1.25, w / 2, h / 2), '-': () => this.zoomEn(1 / 1.25, w / 2, h / 2),
        '0': () => this.encuadrar(), Escape: () => this.cerrarFicha()
      };
      const f = acciones[e.key];
      if (f) { f(); e.preventDefault(); }
    };
    window.addEventListener('keydown', teclas);
    this.scale.on('resize', this.alRedimensionar, this);
    this.events.once('shutdown', () => { window.removeEventListener('keydown', teclas); this.scale.off('resize', this.alRedimensionar, this); });
  }

  alRedimensionar() { const [x, y] = this.centro(); this.fijarCamara(Phaser.Math.Clamp(this.escala, this.zoomMin(), ZOOM_MAX), x, y); }

  // ---------- Ficha de la casilla tocada ----------
  tocar(px, py) {
    const cam = this.cameras.main, wx = cam.scrollX + px / this.escala, wy = cam.scrollY + py / this.escala;
    const t = casillaEn(this.T, wx, wy);
    if (!t) { this.cerrarFicha(); return; }
    const i = t.r * this.T.N + t.c, x = this.S.map[i], B = BIOMA[t.b];
    const uso = x.t === 'rio' ? 'No se puede construir sobre el río. En sus orillas van acueductos, molinos y puertos.'
      : x.t === 'montana' ? 'Montaña: solo admite minas (desde Ciudad).'
      : x.t === 'bosque' ? 'Bosque: construir aquí tala el bosque y baja el ambiente.'
      : nearRiver(this.S, i) ? 'Tierra fértil junto al río: un cultivo aquí rinde más.'
      : x.h >= 1 ? 'Ladera: aquí crece el café.' : 'Terreno libre para construir.';
    this.ficha.replaceChildren(
      el('b', { text: B.n }),
      el('span', { text: `Piso térmico: ${B.p}. Unos ${metros(t.h).toLocaleString('es-CO')} m de altura.` }),
      el('span', { text: uso })
    );
    this.ficha.hidden = false;
    const q = [P(t.r, t.c, t.h00), P(t.r, t.c + 1, t.h01), P(t.r + 1, t.c + 1, t.h11), P(t.r + 1, t.c, t.h10)];
    this.marca.clear().lineStyle(2, 0xF2C94C, .95).fillStyle(0xF2C94C, .18);
    this.marca.fillPoints(q.map(p => ({ x: p[0], y: p[1] })), true).strokePoints(q.map(p => ({ x: p[0], y: p[1] })), true);
  }
  cerrarFicha() { this.ficha.hidden = true; if (this.marca) this.marca.clear(); }

  // ---------- Interfaz ----------
  crearUI() {
    const b = (texto, titulo, fn) => el('button', { class: 'redondo', 'aria-label': titulo, title: titulo, on: { click: fn } }, texto);
    this.aviso = el('div', { class: 'aviso', role: 'status' });
    this.ficha = el('div', { class: 'ficha', role: 'dialog', 'aria-live': 'polite', on: { click: () => this.cerrarFicha() } });
    this.ficha.hidden = true;
    this.ui = el('div', { class: 'mapa-ui' }, [
      el('div', { class: 'controles' }, [
        b('+', 'Acercar (+)', () => this.listo && this.zoomEn(1.25, tam(this).w / 2, tam(this).h / 2)),
        b('−', 'Alejar (−)', () => this.listo && this.zoomEn(1 / 1.25, tam(this).w / 2, tam(this).h / 2)),
        b('⤢', 'Ver todo el territorio (0)', () => this.listo && this.encuadrar()),
        b('⌂', 'Ir a la aldea', () => this.listo && this.enfocarAldea())
      ]),
      el('div', { class: 'abajo' }, [
        el('button', { class: 'pildora', on: { click: () => this.listo && this.scene.restart({ semilla: Math.floor(Math.random() * 899999) + 100000 }) } }, 'Otro territorio'),
        el('button', { class: 'pildora', on: { click: () => this.scene.start('Arranque') } }, 'Portada')
      ]),
      this.aviso, this.ficha
    ]);
    capaUI().append(this.ui);
  }
  avisar(t) { if (this.aviso) { this.aviso.textContent = t; this.aviso.hidden = !t; } }
}
