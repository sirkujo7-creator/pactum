// El mitin de la oposición (opositores por época): cuando el opositor tiene fuerza (40 o más), habla en la plaza desde
// una tarima con la pancarta de su color y un corrillo lo escucha de espaldas. El orador señala o abre las manos de
// vez en cuando y algún oyente asiente; con más fuerza, más oyentes. Con «reducir movimiento» quedan quietos.
import { P, alturaEn } from '../arte/iso.js';
import { mitinVisible, plazaFundacion } from '../core/index.js';
import { lienzo } from '../arte/acuarela.js';
import { reducirMovimiento } from './pantalla.js';
import { Conflicto } from './Conflicto.js';

// Color de la pancarta de cada opositor (por época).
const COLOR = { fundacion: '#3E5A3A', cafe: '#A8352B', violencia: '#2E4C8C', modernizacion: '#C26F22', paz: '#4C5866', digital: '#6B4C9A' };
const OYENTES = [['campesino', 0], ['campesina', 1], ['artesano', 2], ['campesino', 2], ['campesina', 0], ['artesano', 1], ['nino', 1], ['campesino', 1]];

export class Mitin extends Conflicto {
  constructor(scene) { super(scene); }
  tarima(id) {
    const k = 'tarima-' + id, tx = this.scene.textures; if (tx.exists(k)) return k;
    // Tarima de tablas con una pancarta de tela entre dos varas (4x).
    const R = 4, c = lienzo(34 * R, 30 * R), g = c.getContext('2d'); g.scale(R, R); g.lineCap = 'round';
    g.fillStyle = 'rgba(40,30,20,.22)'; g.beginPath(); g.ellipse(18, 27, 15, 3.2, 0, 0, 7); g.fill();
    g.fillStyle = '#8A6440'; g.beginPath(); g.moveTo(3, 21); g.lineTo(17, 16); g.lineTo(31, 21); g.lineTo(17, 26); g.closePath(); g.fill(); // tablas
    g.fillStyle = '#6B4A2B'; g.beginPath(); g.moveTo(3, 21); g.lineTo(17, 26); g.lineTo(17, 28.5); g.lineTo(3, 23.5); g.closePath(); g.fill();
    g.fillStyle = '#56391F'; g.beginPath(); g.moveTo(17, 26); g.lineTo(31, 21); g.lineTo(31, 23.5); g.lineTo(17, 28.5); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(60,40,22,.5)'; g.lineWidth = .4; for (let t = 1; t < 5; t++) { g.beginPath(); g.moveTo(3 + t * 2.8, 21 - t); g.lineTo(17 + t * 2.8, 26 - t); g.stroke(); }
    g.strokeStyle = '#5A4028'; g.lineWidth = .9; g.beginPath(); g.moveTo(5, 21.5); g.lineTo(5, 4); g.moveTo(15, 17.5); g.lineTo(15, 1); g.stroke(); // varas
    g.fillStyle = COLOR[id] || '#7A3A2A'; g.beginPath(); g.moveTo(5, 5); g.quadraticCurveTo(10, 3.4, 15, 2); g.lineTo(15, 8); g.quadraticCurveTo(10, 9.6, 5, 11); g.closePath(); g.fill(); // pancarta
    g.fillStyle = 'rgba(255,246,226,.85)'; g.beginPath(); g.moveTo(6.5, 7.6); g.quadraticCurveTo(10, 6.5, 13.5, 5.4); g.lineTo(13.5, 6.4); g.quadraticCurveTo(10, 7.5, 6.5, 8.6); g.closePath(); g.fill(); // la franja con la consigna
    tx.addCanvas(k, c); return k;
  }
  actualizar() {
    const S = this.scene.S, pz = plazaFundacion(S), ver = this.scene.pob && pz >= 0 && mitinVisible(S);
    const n = ver ? Math.min(OYENTES.length, 3 + Math.floor((S.opo.f - 40) / 10)) : 0;
    const firma = ver ? [S.opo.id, n, pz, this.scene.pob.ropa || ''].join('|') : '';
    if (firma === this.firma) return; this.firma = firma;
    this.quitarFijos(); if (!ver) return;
    const q = this.rc(pz), o = { r: q.r - .44, c: q.c + .06 }; // atrás y a un lado de la cruz: ni las casas ni la cruz lo tapan
    const k = this.tarima(S.opo.id), p = P(o.r, o.c, alturaEn(this.scene.T, o.r, o.c));
    this.fijos.push({ img: this.scene.add.image(p[0], p[1] + 2, k).setOrigin(.53, .88).setScale(.78 / 4).setDepth(o.r + o.c + .01), fijo: true });
    this.orador = this.figura('elite', 0, 0, false, { r: o.r, c: o.c, quieto: true, dy: -4, mira: { r: o.r + 1, c: o.c + 1 }, prox: 1 });
    this.fijos.push(this.orador);
    // Los oyentes, en arco delante de la tarima, mirándola (de espaldas a quien juega).
    for (let i = 0; i < n; i++) {
      const fila = Math.floor(i / 4), an = .4 + (i % 4 - 1.5) * .46 + (fila ? .23 : 0), d = .32 + fila * .21 + (i % 2) * .04;
      let r = o.r + Math.cos(an) * d, c = o.c + Math.sin(an) * d;
      r = Math.min(r, q.r + .44); c = Math.min(c, q.c + .46); // sin salirse de la plaza
      const dx = r - q.r, dy = c - q.c, L = Math.hypot(dx, dy); if (L < .2) { r = q.r + dx / (L || 1) * .2; c = q.c + dy / (L || 1) * .2; } // ni encima de la cruz
      const [t, v] = OYENTES[i];
      this.fijos.push(this.figura(t, v, 0, false, { r, c, quieto: true, mira: o, prox: 2 + Math.random() * 6 }));
    }
    this.fijos.forEach(a => a.r !== undefined && this.dibujar(a));
  }
  update(dt) {
    if (!this.firma) return;
    this.t += dt;
    const quieto = reducirMovimiento();
    for (const a of this.fijos) {
      if (!a.img || a.fijo) continue;
      if (!quieto) {
        if (a.acc) { a.fase += dt * 5; if (a.fase >= 6) { a.acc = null; a.fase = 0; } } // gesto de ida y vuelta: 0 1 2 2 1 0
        else if (this.t > a.prox && a.frente) { // de espaldas solo se escucha
          const orador = a === this.orador;
          a.acc = orador ? (Math.random() < .55 ? 'senalar' : 'manos') : 'asentir'; a.fase = 0;
          a.prox = this.t + (orador ? 1.6 + Math.random() * 2.2 : 6 + Math.random() * 9);
        }
      } else a.acc = null;
      this.dibujar(a);
    }
  }
  dibujar(a, andando = false) {
    if (!a.img || a.fijo) return;
    if (a.mira) { const dr = a.mira.r - a.r, dc = a.mira.c - a.c; a.frente = (dc + dr) >= 0 ? 1 : 0; a.voltear = (dc - dr) < 0; }
    const f = a.fase; a.fase = a.acc ? [0, 1, 2, 2, 1, 0][Math.min(5, Math.floor(f))] : 0; // la ida y vuelta del gesto
    if (!a.acc && a.img.texture.key === 'acciones') a.img.setTexture('personas');
    super.dibujar(a, andando); a.fase = f;
    if (a.dy) { a.img.y += a.dy; a.img.setDepth(a.r + a.c + .03); }
  }
}
