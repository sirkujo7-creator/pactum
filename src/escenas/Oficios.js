// Trabajadores con su oficio (pedido de Juan): junto a cada obra que produce se ve a alguien trabajando con una animación
// sencilla: azadón en la finca, pico en la mina y la cantera, sierra en el aserradero, martillo en el taller o fábrica,
// y un pastor que camina en la ganadería. Con «reducir movimiento» quedan quietos. Máximo 36 trabajadores.
import { P, alturaEn } from '../arte/iso.js';
import { lienzo } from '../arte/acuarela.js';
import { reducirMovimiento } from './pantalla.js';
import { ACCIONES } from '../arte/gente.js';

const E = 3;
// Cada oficio usa un ciclo de cuadros de la hoja de acciones (con la herramienta en la mano).
const ACCION = { azadon: 'sembrar', pico: 'picar', sierra: 'aserrar', martillo: 'martillar', bulto: 'cargar' };
const OFICIO = { cultivo: 'azadon', cafetal: 'azadon', mina: 'pico', cantera: 'pico', aserradero: 'sierra', taller: 'martillo', molino: 'martillo', puerto: 'bulto' };
function hornear(tx) {
  const dibujar = (k, fn) => { if (tx.exists(k)) return; const c = lienzo(20 * E, 20 * E), g = c.getContext('2d'); g.scale(E, E); g.lineCap = 'round'; fn(g); tx.addCanvas(k, c); };
  // Cada herramienta se dibuja con el mango hacia abajo-izquierda (origen en la mano) y la cabeza arriba.
  dibujar('herr-azadon', g => { g.strokeStyle = '#6B4A2B'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(3, 18); g.lineTo(14, 4); g.stroke(); g.fillStyle = '#7A7F86'; g.beginPath(); g.moveTo(11, 3); g.lineTo(18, 7); g.lineTo(15, 9); g.lineTo(12, 6); g.closePath(); g.fill(); });
  dibujar('herr-pico', g => { g.strokeStyle = '#6B4A2B'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(3, 18); g.lineTo(13, 5); g.stroke(); g.strokeStyle = '#6E737A'; g.lineWidth = 2; g.beginPath(); g.moveTo(6, 3); g.quadraticCurveTo(13, 1, 19, 6); g.stroke(); });
  dibujar('herr-sierra', g => { g.fillStyle = '#B9BEC4'; g.strokeStyle = '#4A4A4A'; g.lineWidth = .6; g.beginPath(); g.moveTo(1, 9); g.lineTo(19, 5); g.lineTo(19, 10); g.lineTo(1, 14); g.closePath(); g.fill(); g.stroke(); g.strokeStyle = '#6B4A2B'; g.lineWidth = 1.8; g.beginPath(); g.moveTo(1, 7); g.lineTo(1, 16); g.stroke(); });
  dibujar('herr-martillo', g => { g.strokeStyle = '#6B4A2B'; g.lineWidth = 1.7; g.beginPath(); g.moveTo(3, 18); g.lineTo(13, 6); g.stroke(); g.fillStyle = '#55595E'; g.fillRect(9, 2, 8, 5); });
  dibujar('herr-bulto', g => { g.fillStyle = '#C9A44A'; g.strokeStyle = '#5A4632'; g.lineWidth = .7; g.beginPath(); g.ellipse(10, 11, 7, 5, 0, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.moveTo(10, 6); g.lineTo(10, 16); g.stroke(); });
}

export class Oficios {
  constructor(scene) { this.scene = scene; hornear(scene.textures); this.firma = ''; this.gente = []; this.t = 0; this.actualizar(); }
  quitar() { for (const w of this.gente) { w.img.destroy(); w.herr && w.herr.destroy(); } this.gente = []; }
  actualizar() {
    const { S, pob } = this.scene, N = this.scene.T.N, H = pob.H, ropa = pob.ropa || '';
    const lista = [];
    S.map.forEach((x, i) => {
      if (!x.b || x.ob) return;
      let o = OFICIO[x.b]; const ganado = x.b === 'cultivo' && x.cv === 'ganaderia';
      if (!o && !ganado) return;
      lista.push({ i, o: ganado ? 'pastor' : o });
    });
    const firma = lista.map(l => l.i + l.o).join(',') + '|' + ropa; if (firma === this.firma) return; this.firma = firma;
    this.quitar();
    for (const { i, o } of lista.slice(0, 36)) {
      const tipo = o === 'pastor' ? 'campesino' : (o === 'martillo' || o === 'sierra' || o === 'bulto' ? 'artesano' : 'campesino'), vi = i % 3, f = `${tipo}${ropa}_${vi}_1_0`, m = H.marcos[f]; if (!m) continue;
      const img = this.scene.add.image(0, 0, 'personas', f).setOrigin(m.ax / m.w, m.ay / m.h).setScale(.62 / H.escala);
      const herr = o === 'pastor' ? null : this.scene.add.image(0, 0, 'herr-' + o).setScale(.55 / E * 1.6).setOrigin(.15, .9);
      const r0 = Math.floor(i / N) + .5, c0 = i % N + .5;
      this.gente.push({ img, herr, o, tipo, vi, r0, c0, r: r0 + .38, c: c0 + .3, fase: (i * 1.7) % 6, meta: null, espera: 0, ropa });
    }
    this.gente.forEach(w => this.poner(w, 0));
  }
  poner(w, a) {
    const T = this.scene.T, p = P(w.r, w.c, alturaEn(T, w.r, w.c)), bob = w.o === 'pastor' ? 0 : Math.abs(Math.sin(a)) * -.8;
    let paso = 0; if (w.o === 'pastor' && w.andando) paso = Math.floor(w.fasePaso) % 4;
    const acc = ACCION[w.o], A = this.scene.pob.A, N = acc && ACCIONES[w.tipo] && ACCIONES[w.tipo][acc], kA = N ? `${w.tipo}_${w.vi}_${acc}_${Math.floor(((a / (Math.PI * 2)) % 1 + 1) % 1 * N)}` : null;
    if (kA && A && A.marcos[kA] && this.scene.textures.exists('acciones')) { if (w.tex !== 'a') { w.img.setTexture('acciones'); w.tex = 'a'; } w.img.setFrame(kA); if (w.herr) w.herr.setVisible(false); w.img.setPosition(p[0], p[1]).setFlipX(!!w.voltear).setDepth(w.r + w.c + .02); return; }
    const f = `${w.tipo}${w.ropa}_${w.vi}_${w.frente ?? 1}_${paso}`; if (this.scene.pob.H.marcos[f]) { if (w.tex === 'a') { w.img.setTexture('personas'); w.tex = 'p'; } w.img.setFrame(f); }
    w.img.setPosition(p[0], p[1] + bob).setFlipX(!!w.voltear).setDepth(w.r + w.c + .02);
    if (w.herr) {
      const dx = w.o === 'sierra' ? 5 : 4, rot = w.o === 'azadon' ? -.9 + Math.sin(a) * .9 : w.o === 'pico' ? -1 + Math.sin(a) * 1.0 : w.o === 'martillo' ? -.7 + Math.sin(a) * .8 : w.o === 'bulto' ? 0 : Math.sin(a) * .15;
      const sx = w.o === 'sierra' ? Math.sin(a) * 3 : 0, up = w.o === 'bulto' ? -16 : -8;
      w.herr.setPosition(p[0] + dx + sx, p[1] + up + bob).setRotation(rot).setDepth(w.r + w.c + .03);
    }
  }
  update(dt) {
    this.t += dt;
    const quieto = reducirMovimiento();
    for (const w of this.gente) {
      if (quieto) { this.poner(w, 0); continue; }
      if (w.o === 'pastor') {
        if (w.espera > 0) { w.espera -= dt; w.andando = false; this.poner(w, 0); continue; }
        if (!w.meta) w.meta = { r: w.r0 + (Math.random() - .5) * 2.2, c: w.c0 + (Math.random() - .5) * 2.2 };
        const dr = w.meta.r - w.r, dc = w.meta.c - w.c, d = Math.hypot(dr, dc);
        if (d < .05) { w.meta = null; w.espera = 1.5 + Math.random() * 3; continue; }
        const paso = Math.min(d, .3 * dt); w.r += dr / d * paso; w.c += dc / d * paso; w.fasePaso = (w.fasePaso || 0) + paso * 13; w.andando = true; w.frente = (dc + dr) >= 0 ? 1 : 0; w.voltear = (dc - dr) < 0;
        this.poner(w, 0);
      } else this.poner(w, this.t * (w.o === 'sierra' ? 5 : 4) + w.fase);
    }
  }
}
