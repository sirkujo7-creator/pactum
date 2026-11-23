// Cicatrices en el suelo (pedido de Juan: «si hay guerra o algún accidente natural, ¿cómo se vería?»). Lo que anota
// la lógica en S.cicat (huellas.js) se pinta sobre el terreno y se va borrando con los años:
//  · lodo de la avenida con troncos y piedras arrastradas (4 años);
//  · grietas del terremoto con tierra levantada (10 años);
//  · ceniza gris de la erupción sobre todo el mapa, más espesa al principio (8 años; recuerda a Armero);
//  · cráteres de la guerra en el borde, con la tierra quemada alrededor (12 años).
// Cada dibujo se hornea una vez (cuatro variantes por tipo) y va debajo de las obras y las plantas de la casilla.
import { P } from '../arte/iso.js';
import { lienzo, mulberry } from '../arte/acuarela.js';

const E = 3, W = 72, H = 40, DURA = { lodo: 4, grieta: 10, ceniza: 8, crater: 12 };

function rombo(g, s = 1) { g.beginPath(); g.moveTo(0, -16 * s); g.lineTo(32 * s, 0); g.lineTo(0, 16 * s); g.lineTo(-32 * s, 0); g.closePath(); }
function mancha(g, R, x, y, rx, ry, col) { g.save(); g.filter = 'blur(1.2px)'; mancha0(g, R, x, y, rx, ry, col); g.restore(); }
function mancha0(g, R, x, y, rx, ry, col) { g.fillStyle = col; g.beginPath(); for (let k = 0; k <= 14; k++) { const a = k / 14 * Math.PI * 2, r = .7 + R() * .45; k ? g.lineTo(x + Math.cos(a) * rx * r, y + Math.sin(a) * ry * r) : g.moveTo(x + Math.cos(a) * rx * r, y + Math.sin(a) * ry * r); } g.closePath(); g.fill(); }
const PINTA = {
  lodo(g, R) {
    for (let k = 0; k < 4; k++) mancha(g, R, (R() - .5) * 30, (R() - .5) * 12, 16 + R() * 10, 7 + R() * 4, k ? 'rgba(122,92,58,.55)' : 'rgba(104,78,48,.7)');
    for (let k = 0; k < 10; k++) mancha(g, R, (R() - .5) * 40, (R() - .5) * 18, 2 + R() * 3, 1 + R() * 1.4, 'rgba(150,120,82,.6)'); // charcos que secan
    for (let k = 0; k < 2; k++) { const x = (R() - .5) * 30, y = (R() - .5) * 10, L = 10 + R() * 8, a = (R() - .5) * .8; g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = '#5A3E26'; g.fillRect(-L / 2, -1.2, L, 2.4); g.fillStyle = '#8A6440'; g.fillRect(-L / 2, -1.2, L, .9); g.fillStyle = '#C9A06A'; g.beginPath(); g.ellipse(L / 2, 0, .9, 1.2, 0, 0, 7); g.fill(); g.restore(); } // troncos arrastrados
    for (let k = 0; k < 8; k++) { const x = (R() - .5) * 40, y = (R() - .5) * 16, w = 1 + R() * 1.6; g.fillStyle = '#8A8274'; g.beginPath(); g.ellipse(x, y, w, w * .6, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(255,250,235,.35)'; g.beginPath(); g.ellipse(x - w * .3, y - w * .2, w * .4, w * .25, 0, 0, 7); g.fill(); }
  },
  grieta(g, R) {
    let x = -26 + R() * 6, y = (R() - .5) * 6; const pts = [[x, y]];
    while (x < 24) { x += 3 + R() * 4; y += (R() - .5) * 6; y = Math.max(-9, Math.min(9, y)); pts.push([x, y]); }
    g.strokeStyle = 'rgba(150,120,80,.55)'; g.lineWidth = 5; g.lineJoin = 'round'; g.beginPath(); pts.forEach(([a, b], k) => k ? g.lineTo(a, b - 1) : g.moveTo(a, b - 1)); g.stroke(); // tierra levantada
    g.strokeStyle = 'rgba(30,20,12,.85)'; g.lineWidth = 1.8; g.beginPath(); pts.forEach(([a, b], k) => k ? g.lineTo(a, b) : g.moveTo(a, b)); g.stroke();
    g.lineWidth = .7; for (const [a, b] of pts.filter((p, k) => k % 2)) { g.beginPath(); g.moveTo(a, b); g.lineTo(a + (R() - .5) * 8, b + (R() - .2) * 5); g.stroke(); } // ramales
    for (let k = 0; k < 6; k++) { const [a, b] = pts[Math.floor(R() * pts.length)]; g.fillStyle = '#9A8A70'; g.beginPath(); g.ellipse(a + (R() - .5) * 6, b + 2 + R() * 2, 1.2, .7, 0, 0, 7); g.fill(); } // terrones
  },
  ceniza(g, R) {
    for (let k = 0; k < 5; k++) mancha(g, R, (R() - .5) * 34, (R() - .5) * 14, 14 + R() * 12, 6 + R() * 5, `rgba(${150 + k * 6},${148 + k * 6},${142 + k * 6},.5)`);
    g.fillStyle = 'rgba(220,216,208,.45)'; for (let k = 0; k < 40; k++) { g.beginPath(); g.arc((R() - .5) * 52, (R() - .5) * 22, .5 + R() * .7, 0, 7); g.fill(); }
  },
  crater(g, R) {
    mancha(g, R, 0, 0, 24, 11, 'rgba(46,36,26,.5)'); // tierra quemada
    mancha(g, R, 0, 0, 13, 6.4, 'rgba(120,96,66,.9)'); // borde levantado
    const gr = g.createRadialGradient(-1, 1, 1, 0, 0, 10); gr.addColorStop(0, '#2E2418'); gr.addColorStop(1, '#5E4A34'); g.fillStyle = gr; g.beginPath(); g.ellipse(0, .6, 9, 4.2, 0, 0, 7); g.fill();
    g.fillStyle = 'rgba(200,180,140,.45)'; g.beginPath(); g.ellipse(-3, -2.6, 7, 1.6, -.1, 0, 7); g.fill(); // luz del borde de atrás
    for (let k = 0; k < 12; k++) { const a = R() * Math.PI * 2, r = 12 + R() * 8, x = Math.cos(a) * r, y = Math.sin(a) * r * .46; g.fillStyle = R() < .5 ? '#6E5A42' : '#3A2E22'; g.beginPath(); g.ellipse(x, y, 1 + R(), .6 + R() * .5, 0, 0, 7); g.fill(); } // terrones lanzados
    g.strokeStyle = 'rgba(30,24,16,.6)'; g.lineWidth = .6; for (let k = 0; k < 5; k++) { const a = R() * Math.PI * 2; g.beginPath(); g.moveTo(Math.cos(a) * 14, Math.sin(a) * 6); g.lineTo(Math.cos(a) * (16 + R() * 3), Math.sin(a) * (7 + R() * 2) - 2 - R() * 2); g.stroke(); } // pasto quemado
  }
};

function hornear(scene) {
  if (scene.textures.exists('cicatrices')) return;
  const tipos = Object.keys(PINTA), V = 4, cv = lienzo(W * E * V, H * E * tipos.length), g = cv.getContext('2d');
  tipos.forEach((t, fi) => { for (let v = 0; v < V; v++) {
    const R = mulberry(fi * 101 + v * 17 + 3); g.save(); g.translate((v + .5) * W * E, (fi + .5) * H * E); g.scale(E, E);
    PINTA[t](g, R); g.restore(); } }); // sin recorte: las manchas tienen borde irregular y se funden con el suelo
  const tx = scene.textures.addCanvas('cicatrices', cv);
  tipos.forEach((t, fi) => { for (let v = 0; v < V; v++) tx.add(`${t}${v}`, 0, v * W * E, fi * H * E, W * E, H * E); });
}

export class Cicatrices {
  constructor(scene) { this.scene = scene; this.obj = []; this.firma = null; hornear(scene); }
  quitar() { for (const o of this.obj) o.destroy(); this.obj = []; }
  firmaActual() { const S = this.scene.S; return (S.cicat || []).map(c => c.t + c.y).join(',') + '|' + S.year; }
  poner() {
    this.quitar(); this.firma = this.firmaActual();
    const { S, T } = this.scene, N = T.N; if (!S.cicat || !S.cicat.length) return;
    for (const c of S.cicat) {
      const edad = S.year - c.y, dura = DURA[c.t] || 6; if (edad > dura) continue;
      const alfa = Math.max(0, 1 - edad / (dura + 1)) * (c.t === 'ceniza' ? .9 : 1);
      const L = c.L[0] === -1 ? S.map.map((x, i) => i).filter(i => (i * 7 + c.y) % 3 === 0 && S.map[i].t !== 'rio') : c.L;
      for (const i of L) { const t = T.tiles[i]; if (!t || S.map[i].t === 'rio') continue;
        const p = P(t.r + .5, t.c + .5, t.h), v = (i * 13 + c.y) % 4;
        this.obj.push(this.scene.add.image(p[0], p[1], 'cicatrices', `${c.t}${v}`).setScale(1 / E).setAlpha(alfa).setDepth(t.r + t.c + .01)); }
    }
  }
  revisar() { if (this.firmaActual() !== this.firma) this.poner(); }
}
