// La guerra con un vecino se ve mientras dura (animación de conflictos, tanda 1; tono intermedio, pedido de Juan).
// Complementa a Frontera.js (campamentos, banderas, tierras ocupadas y humo): mientras hay guerra, los soldados del
// vecino patrullan su borde con su bandera y nuestra tropa forma una línea más adentro (más cerca del borde si vamos
// ganando el frente, más cerca del pueblo si lo vamos perdiendo); hay fogonazos en el frente y, desde la época del café,
// algún cañonazo; las familias de las casas del borde huyen hacia la plaza con sus bultos y dos vecinos llevan heridos
// en camilla al hospital. En las tierras ocupadas montan guardia centinelas del vecino. Con tropas en la frontera (sin
// guerra), dos soldados del vecino rondan su campamento. Con «reducir movimiento» quedan las líneas quietas.
import { P, alturaEn } from '../arte/iso.js';
import { guerraActiva, casillasBorde, ocupadasPor, centroPueblo, plazaFundacion, epocaHistorica } from '../core/index.js';
import { lienzo } from '../arte/acuarela.js';
import { reducirMovimiento } from './pantalla.js';
import { Conflicto } from './Conflicto.js';

// Uniforme del vecino: el mismo dibujo del soldado con un tinte de su color, para distinguirlo del nuestro.
const TINTE = { lagunilla: 0xB4C2EA, sanlorenzo: 0xEED8A8, altamira: 0xBCD6A8 };

export class Guerra extends Conflicto {
  constructor(scene) { super(scene); this.texturas(); this.prox = { fogon: 1, canon: 6, huida: 4, camilla: 9 }; }
  texturas() {
    const tx = this.scene.textures; if (tx.exists('camilla')) return;
    // Camilla de lona entre dos varas, con alguien cubierto con una manta (sin sangre).
    const R = 4, c = lienzo(30 * R, 12 * R), g = c.getContext('2d'); g.scale(R, R);
    g.strokeStyle = '#6B4A2B'; g.lineWidth = 1; g.lineCap = 'round'; g.beginPath(); g.moveTo(1, 8); g.lineTo(29, 6); g.moveTo(1, 10); g.lineTo(29, 8); g.stroke();
    g.fillStyle = '#D8CFB8'; g.beginPath(); g.moveTo(5, 8.6); g.lineTo(25, 7); g.lineTo(25, 9); g.lineTo(5, 10.4); g.closePath(); g.fill();
    g.fillStyle = '#7A6A58'; g.beginPath(); g.moveTo(7, 8.4); g.quadraticCurveTo(15, 3.6, 23, 6.8); g.lineTo(23, 7.6); g.lineTo(7, 9.2); g.closePath(); g.fill(); // la manta
    g.fillStyle = '#C98E62'; g.beginPath(); g.arc(24.6, 6.4, 1.3, 0, 7); g.fill();
    tx.addCanvas('camilla', c);
  }
  // Mueve un punto de la línea hacia el pueblo (d casillas) o hacia el borde (d negativo).
  hacia(q, d) { const dr = this.pueblo.r - q.r, dc = this.pueblo.c - q.c, L = Math.hypot(dr, dc) || 1; return { r: q.r + dr / L * d, c: q.c + dc / L * d }; }
  actualizar() {
    const S = this.scene.S;
    if (!this.scene.pob || !guerraActiva(S) || !S.vecinos) { if (this.firma) { this.quitarFijos(); this.quitarGente(); } this.firma = ''; return; }
    const W = S.guerra && S.guerra.activa, ropa = this.scene.pob.ropa || '';
    const tropas = Object.entries(S.vecinos).filter(([, v]) => v.tropas).map(([id]) => id);
    const oc = Object.keys(S.vecinos).map(id => ocupadasPor(S, id).slice(0, 3).map(i => id + i).join('.')).join(',');
    const U = S.guerra && S.guerra.ultima, regresa = !W && U && S.year - U.anio <= 1; // tanda 3: la tropa vuelve a casa
    const firma = [W ? W.id + W.frente : '', tropas.join('.'), oc, ropa, regresa ? 'reg' + U.anio : ''].join('|');
    if (firma === this.firma) return; this.firma = firma;
    this.quitarFijos(); if (!W) this.quitarGente();
    const N = this.scene.T.N, cp = centroPueblo(S), pz = plazaFundacion(S);
    this.pueblo = cp >= 0 ? this.rc(cp) : { r: N / 2, c: N / 2 };
    this.plaza = pz >= 0 ? this.rc(pz) : this.pueblo;
    this.W = W; this.lineas = null; this.regreso = regresa ? { de: this.hacia(this.rc(casillasBorde(S, U.id)[0]), 1), a: this.plaza } : null;
    if (W) {
      const L = casillasBorde(S, W.id).slice(0, 10).map(i => this.rc(i)), ellos = L.filter((_, k) => k % 2 === 0).slice(0, 5);
      const fondo = W.frente > 0 ? 1.1 : W.frente < 0 ? 2.6 : 1.8, nuestros = ellos.map(q => this.hacia(q, fondo));
      this.lineas = { ellos, nuestros };
      ellos.forEach((q, k) => this.fijos.push(this.figura('soldado', k % 3, TINTE[W.id], false, { r: q.r, c: q.c, centro: q, radio: .45, mira: this.pueblo })));
      nuestros.forEach((q, k) => this.fijos.push(this.figura('soldado', (k + 1) % 3, 0, false, { r: q.r, c: q.c, centro: q, radio: .3, mira: ellos[k] })));
      // El abanderado del vecino.
      if (this.scene.textures.exists('bandera-' + W.id)) { const q = ellos[0], p = P(q.r, q.c, alturaEn(this.scene.T, q.r, q.c)); this.fijos.push({ img: this.scene.add.image(p[0] + 4, p[1], 'bandera-' + W.id).setOrigin(.2, 1).setScale(.34).setDepth(q.r + q.c + .6), fijo: true }); }
    }
    // Centinelas en las tierras ocupadas.
    for (const id of Object.keys(S.vecinos)) ocupadasPor(S, id).slice(0, 3).forEach((i, k) => { const q = this.rc(i); this.fijos.push(this.figura('soldado', k % 3, TINTE[id], false, { r: q.r + .25, c: q.c - .2, quieto: true, mira: this.pueblo })); });
    // Tropas en la frontera sin guerra: dos soldados rondan su campamento.
    if (!W) for (const id of tropas) { const q = this.rc(casillasBorde(S, id).find(i => !S.map[i].b && !S.map[i].oc && S.map[i].t !== 'montana') ?? casillasBorde(S, id)[0]); for (let k = 0; k < 2; k++) this.fijos.push(this.figura('soldado', k, TINTE[id], false, { r: q.r + .3, c: q.c + k * .3, centro: q, radio: .9 })); }
    this.fijos.forEach(a => a.r !== undefined && this.dibujar(a));
  }
  // Un fogonazo (o el humo de un cañonazo) en un punto del frente.
  fogonazo(q, canon) {
    const sc = this.scene, p = P(q.r, q.c, alturaEn(sc.T, q.r, q.c)), d = q.r + q.c + .6;
    const b = sc.add.circle(p[0], p[1] - 6, canon ? 5 : 2.6, 0xFFD27A, .95).setDepth(d).setBlendMode('ADD');
    sc.tweens.add({ targets: b, alpha: 0, scale: canon ? 2.6 : 2, duration: canon ? 380 : 200, onComplete: () => b.destroy() });
    if (canon) { const h = sc.add.particles(p[0], p[1] - 6, 'edificios', { frame: 'humo', lifespan: 2600, speedY: { min: -18, max: -4 }, speedX: { min: -12, max: 12 }, scale: { start: .12, end: .7 }, alpha: { start: .4, end: 0 }, tint: 0x9A948C, emitting: false }).setDepth(d + .1); h.explode(9); sc.time.delayedCall(2800, () => h.destroy()); }
  }
  update(dt) {
    if (!this.firma) return;
    super.update(dt); // patrullas, centinelas y caminantes
    if (this.regreso && !reducirMovimiento() && this.t > (this.prox.regreso || 0) && this.gente.length < 12) { this.prox.regreso = this.t + 40 + Math.random() * 15; this.caminantes([0, 1, 2, 0, 1].map(v => ['soldado', v, 0, false, null]), this.regreso.de, this.regreso.a); } // la tropa marcha de vuelta a la plaza
    if (!this.W || reducirMovimiento() || !this.lineas) return;
    const P0 = this.prox, S = this.scene.S, { ellos, nuestros } = this.lineas, al = L => L[Math.floor(Math.random() * L.length)];
    if (this.t > P0.fogon) { P0.fogon = this.t + .6 + Math.random() * 1.4; const q = al(Math.random() < .5 ? ellos : nuestros); this.fogonazo({ r: q.r + (Math.random() - .5) * .5, c: q.c + (Math.random() - .5) * .5 }, false); }
    if (this.t > P0.canon) { P0.canon = this.t + 6 + Math.random() * 6; if (epocaHistorica(S) !== 'fundacion') { const a = al(ellos), b = al(nuestros), f = Math.random(); this.fogonazo({ r: a.r + (b.r - a.r) * f, c: a.c + (b.c - a.c) * f }, true); } }
    // Familias que huyen del borde hacia la plaza.
    if (this.t > P0.huida && this.gente.length < 12) {
      P0.huida = this.t + 18 + Math.random() * 12;
      const de = this.hacia(al(nuestros), .9);
      this.caminantes([['campesina', Math.floor(this.t) % 3, 0, false, 'cargar'], ['nino', 1, 0, false, null], ['campesino', 2, 0, false, 'cargar']], de, this.plaza);
    }
    // Heridos en camilla, de la línea al hospital (o a la plaza si no hay).
    if (this.t > P0.camilla && this.gente.length < 12) {
      P0.camilla = this.t + 24 + Math.random() * 16;
      const h = S.map.findIndex(x => x.b === 'hospital' && !x.ob), dest = h >= 0 ? { r: this.rc(h).r + .7, c: this.rc(h).c + .2 } : this.plaza, de = this.hacia(al(nuestros), .5);
      const antes = this.gente.length;
      this.caminantes([['campesino', 0, 0, false, null], ['artesano', 1, 0, false, null]], de, dest);
      const [a, b] = this.gente.slice(antes);
      if (a && b && this.scene.textures.exists('camilla')) { b.ruta = a.ruta.map(q => ({ ...q })); b.r = a.r - .16; b.c = a.c - .16; a.extra = this.scene.add.image(0, 0, 'camilla').setScale(.6 / 4); a.camilla = b; }
    }
  }
  dibujar(a, andando = false) {
    if (!andando && a.mira && a.img && !a.fijo) { const dr = a.mira.r - a.r, dc = a.mira.c - a.c; a.frente = (dc + dr) >= 0 ? 1 : 0; a.voltear = (dc - dr) < 0; } // quieto, mira al frente
    super.dibujar(a, andando);
    if (a.camilla && a.extra) { const b = a.camilla, p = P((a.r + b.r) / 2, (a.c + b.c) / 2, alturaEn(this.scene.T, a.r, a.c)); a.extra.setPosition(p[0], p[1] - 10).setFlipX(a.voltear).setDepth((a.r + b.r) / 2 + (a.c + b.c) / 2 + .04); }
  }
}
