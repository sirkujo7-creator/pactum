// Redes que se ven (pedido de Juan: «que la infraestructura se vaya adaptando a las necesidades de acueducto,
// energía y demás»). Solo dibujo: se lee lo que ya dice la lógica (molinos, acueductos, energía, caminos).
//  · Energía: desde la época del café, con molino (o represa) los postes con cables siguen los caminos desde la
//    planta; las casas que tocan la red se encienden de noche con luz eléctrica y las demás con vela. Si las
//    fábricas piden más energía de la que hay, el tramo más lejano queda a oscuras (apagón).
//  · Agua: con acueducto, en las primeras épocas va un canal de guadua sobre horquetas hasta la plaza; desde la
//    modernización la tubería va enterrada y se ven los hidrantes en las esquinas.
// Postes de madera hasta La Violencia y de concreto después (con transformador de vez en cuando).
import { P } from '../arte/iso.js';
import { lienzo } from '../arte/acuarela.js';
import { listaCalles, energy, counts, indiceEpoca, climaActivo } from '../core/index.js';

const E = 4, MAX_POSTES = 70;

function hornear(scene) {
  if (scene.textures.exists('redes')) return;
  const piezas = { poste0: [10, 30, 5, 28], poste1: [10, 30, 5, 28], trafo: [12, 30, 6, 28], grifo: [8, 10, 4, 9], horqueta: [8, 12, 4, 11] };
  let x = 0; const cv = lienzo(Object.values(piezas).reduce((a, p) => a + p[0] * E + 2, 0), 30 * E), g = cv.getContext('2d'), marcos = {};
  for (const [k, [w, h, ax, ay]] of Object.entries(piezas)) {
    g.save(); g.translate(x + ax * E, ay * E); g.scale(E, E);
    g.fillStyle = 'rgba(30,28,20,.25)'; g.beginPath(); g.ellipse(1.2, .2, 2, .6, 0, 0, 7); g.fill();
    if (k === 'poste0') { // poste de madera con su cruceta y aisladores
      g.fillStyle = '#6B4A2E'; g.fillRect(-.6, -24, 1.2, 24); g.fillStyle = '#8A6440'; g.fillRect(-.6, -24, .45, 24);
      g.fillStyle = '#5A3E26'; g.fillRect(-3.6, -22.6, 7.2, .9);
      g.fillStyle = '#E8E4DA'; for (const dx of [-3.2, 0, 3.2]) { g.beginPath(); g.arc(dx, -23.2, .45, 0, 7); g.fill(); }
    } else { // poste de concreto (con transformador)
      g.fillStyle = '#A8A49A'; g.beginPath(); g.moveTo(-.8, 0); g.lineTo(-.5, -25); g.lineTo(.5, -25); g.lineTo(.8, 0); g.fill();
      g.fillStyle = '#C8C4BA'; g.beginPath(); g.moveTo(-.8, 0); g.lineTo(-.5, -25); g.lineTo(-.1, -25); g.lineTo(-.2, 0); g.fill();
      g.fillStyle = '#6E6E70'; g.fillRect(-3.8, -23, 7.6, .8);
      g.fillStyle = '#7A8A6E'; for (const dx of [-3.4, 0, 3.4]) { g.fillRect(dx - .3, -24.2, .6, 1.2); }
      if (k === 'trafo') { g.fillStyle = '#7E8486'; g.fillRect(.6, -19, 2.6, 4); g.fillStyle = '#9CA2A4'; g.fillRect(.6, -19, 1, 4); g.fillStyle = '#5E6466'; g.fillRect(.4, -19.4, 3, .6); }
    }
    if (k === 'grifo') { // hidrante rojo
      g.fillStyle = '#B9332A'; g.fillRect(-1.1, -6, 2.2, 6); g.fillStyle = '#D84A3A'; g.fillRect(-1.1, -6, .8, 6);
      g.fillStyle = '#9A2A22'; g.beginPath(); g.ellipse(0, -6, 1.3, .6, 0, 0, 7); g.fill(); g.fillRect(-2, -4, 4, 1); g.fillStyle = '#E8C23A'; g.beginPath(); g.arc(0, -6.6, .5, 0, 7); g.fill();
    }
    if (k === 'horqueta') { // horqueta de madera que sostiene el canal de guadua
      g.strokeStyle = '#6B4A2E'; g.lineWidth = .8; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -6); g.lineTo(-1.4, -8.4); g.moveTo(0, -6); g.lineTo(1.4, -8.4); g.stroke();
    }
    g.restore();
    marcos[k] = { x, y: 0, w: w * E, h: h * E, ax: ax * E, ay: ay * E }; x += w * E + 2;
  }
  const t = scene.textures.addCanvas('redes', cv);
  for (const [k, m] of Object.entries(marcos)) t.add(k, 0, m.x, m.y, m.w, m.h);
  scene.__redesMarcos = marcos;
}

export class Redes {
  constructor(scene) { this.scene = scene; this.obj = []; this.firma = null; this.revision = 0; this.luz = null; hornear(scene); this.poner(); }
  quitar() { for (const o of this.obj) o.destroy(); this.obj = []; }
  firmaActual() {
    const S = this.scene.S; if (!climaActivo(S)) return '';
    const c = counts(S), mol = S.map.map((x, i) => x.b === 'molino' && !x.ob ? i : -1).filter(i => i >= 0).join(','), acu = S.map.map((x, i) => x.b === 'acueducto' && !x.ob ? i : -1).filter(i => i >= 0).join(',');
    return [listaCalles(S).length, mol, acu, indiceEpoca(S), energy(S, c), c.taller > energy(S, c) ? 'A' : '', S.map.filter(x => x.b && !x.ob).length].join('|');
  }
  poner() {
    this.quitar(); const firma = this.firmaActual(); this.firma = firma;
    const S = this.scene.S, T = this.scene.T, N = T.N, M = N + 1;
    this.luz = null; if (!firma) return;
    const ep = indiceEpoca(S), c = counts(S), en = energy(S, c);
    const red = new Map();
    for (const k of listaCalles(S)) { const [a, b] = k.split('|').map(Number); (red.get(a) || red.set(a, []).get(a)).push(b); (red.get(b) || red.set(b, []).get(b)).push(a); }
    const esquinas = i => { const r = Math.floor(i / N), cc = i % N; return [r * M + cc, r * M + cc + 1, (r + 1) * M + cc, (r + 1) * M + cc + 1]; };
    const enRed = i => esquinas(i).filter(e => red.has(e));
    const pos = (e, z = 0) => { const r = Math.floor(e / M), cc = e % M, p = P(r + .07, cc + .07, T.hf(Math.min(N - 1, r), Math.min(N - 1, cc))); return [p[0], p[1] - z]; }; // z en píxeles (sobre los postes, corridos .07)
    const deph = e => Math.floor(e / M) + e % M;
    // Recorrido por la red desde unas casillas (anchura primero): devuelve la profundidad de cada esquina y su padre.
    const recorrer = fuentes => { const prof = new Map(), padre = new Map(), cola = []; for (const i of fuentes) for (const e of enRed(i)) if (!prof.has(e)) { prof.set(e, 0); padre.set(e, -1); cola.push(e); }
      while (cola.length) { const u = cola.shift(); for (const w of red.get(u) || []) if (!prof.has(w)) { prof.set(w, prof.get(u) + 1); padre.set(w, u); cola.push(w); } } return { prof, padre }; };
    const img = (k, e, dz = 0, dr = .07, dc = .07) => { const r = Math.floor(e / M) + dr, cc = e % M + dc, p = P(r, cc, T.hf(Math.min(N - 1, Math.floor(r)), Math.min(N - 1, Math.floor(cc)))), m = this.scene.__redesMarcos[k]; p[1] -= dz;
      const o = this.scene.add.image(p[0], p[1], 'redes', k).setOrigin(m.ax / m.w, m.ay / m.h).setScale(1 / E).setDepth(r + cc + .02); this.obj.push(o); return o; };
    const linea = (a, b, z, col, w, comba, prof = 0) => { const g = this.scene.add.graphics().setDepth(Math.max(deph(a), deph(b)) + .05 + prof); const p = pos(a, z), q = pos(b, z), dx = 2.24, m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2 + comba];
      g.lineStyle(w, col, 1); g.beginPath(); g.moveTo(p[0], p[1]); for (let k = 1; k <= 8; k++) { const t = k / 8, x = (1 - t) * (1 - t) * p[0] + 2 * t * (1 - t) * m[0] + t * t * q[0], y = (1 - t) * (1 - t) * p[1] + 2 * t * (1 - t) * m[1] + t * t * q[1]; g.lineTo(x, y); } g.strokePath(); this.obj.push(g); return g; };
    // Una planta (o acueducto) lejos de los caminos se une a la red por una línea recta hasta la esquina más cercana.
    const unir = (i, cada, poner) => { if (enRed(i).length) return []; const r0 = Math.floor(i / N) + 1, c0 = i % N + 1; let mejor = -1, d0 = 1e9;
      for (const e of red.keys()) { const d = Math.hypot(Math.floor(e / M) - r0, e % M - c0); if (d < d0) { d0 = d; mejor = e; } }
      if (mejor < 0 || d0 > 12) return []; const n = Math.max(1, Math.round(d0 / cada)), pts = [];
      for (let k = 0; k <= n; k++) { const t = k / n; pts.push([r0 + (Math.floor(mejor / M) - r0) * t, c0 + (mejor % M - c0) * t]); }
      poner(pts); return [mejor]; };
    const posRC = (r, cc, z = 0) => { const p = P(r + .07, cc + .07, T.hf(Math.min(N - 1, Math.floor(r)), Math.min(N - 1, Math.floor(cc)))); return [p[0], p[1] - z]; };
    const lineaRC = (a, b, z, col, w, comba) => { const g = this.scene.add.graphics().setDepth(Math.max(a[0] + a[1], b[0] + b[1]) + .05); const p = posRC(a[0], a[1], z), q = posRC(b[0], b[1], z), m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2 + comba];
      g.lineStyle(w, col, 1); g.beginPath(); g.moveTo(p[0], p[1]); for (let k = 1; k <= 8; k++) { const t = k / 8; g.lineTo((1 - t) * (1 - t) * p[0] + 2 * t * (1 - t) * m[0] + t * t * q[0], (1 - t) * (1 - t) * p[1] + 2 * t * (1 - t) * m[1] + t * t * q[1]); } g.strokePath(); this.obj.push(g); };
    const imgRC = (k, r, cc) => { const p = P(r + .07, cc + .07, T.hf(Math.min(N - 1, Math.floor(r)), Math.min(N - 1, Math.floor(cc)))), m = this.scene.__redesMarcos[k];
      this.obj.push(this.scene.add.image(p[0], p[1], 'redes', k).setOrigin(m.ax / m.w, m.ay / m.h).setScale(1 / E).setDepth(r + cc + .02)); };
    // ---------- Energía ----------
    const lit = new Set(); let hayRed = false;
    if (ep >= 1 && en > 0 && red.size) {
      const fuentes = S.map.map((x, i) => x.b === 'molino' && !x.ob ? i : -1).filter(i => i >= 0);
      if (!fuentes.length) { const pz = S.map.findIndex(x => x.b === 'fundacion'); if (pz >= 0) fuentes.push(pz); } // represa o energía heredada: llega por la plaza
      const tipo0 = ep >= 3 ? 'poste1' : 'poste0', extra = fuentes.flatMap(i => unir(i, 1.2, pts => pts.forEach((q, k) => { imgRC(tipo0, q[0], q[1]); if (k) lineaRC(pts[k - 1], q, 23, 0x2A2622, .45, 2.2); })));
      const { prof, padre } = recorrer(fuentes);
      if (extra.length) { const cola = [...extra]; for (const e of extra) { prof.set(e, 1); padre.set(e, -1); } while (cola.length) { const u = cola.shift(); for (const w of red.get(u) || []) if (!prof.has(w)) { prof.set(w, prof.get(u) + 1); padre.set(w, u); cola.push(w); } } }
      if (prof.size) {
        hayRed = true;
        let L = [...prof.keys()].sort((a, b) => prof.get(a) - prof.get(b)).slice(0, MAX_POSTES);
        const corte = c.taller > en ? Math.max(1, Math.ceil(L.length * .66)) : L.length, conLuz = new Set(L.slice(0, corte)); // apagón: el tramo lejano sin luz
        const tipo = ep >= 3 ? 'poste1' : 'poste0', zc = 23 / E * 4 / 4;
        for (const [k, e] of L.entries()) {
          img(tipo === 'poste1' && k % 5 === 2 ? 'trafo' : tipo, e);
          const pa = padre.get(e); if (pa >= 0 && L.includes(pa)) linea(pa, e, 23, conLuz.has(e) ? 0x2A2622 : 0x4A4642, .45, 2.2);
        }
        S.map.forEach((x, i) => { if (x.b && !x.ob && enRed(i).some(e => conLuz.has(e))) lit.add(i); });
      }
    }
    // Luz de cada casilla de noche: eléctrica con red, de vela sin ella (y casi nada en el apagón).
    this.luz = i => (lit.has(i) ? 1 : hayRed ? .35 : ep >= 1 && en > 0 ? .55 : .45);
    this.vela = i => !lit.has(i);
    // ---------- Agua ----------
    const acu = S.map.map((x, i) => x.b === 'acueducto' && !x.ob ? i : -1).filter(i => i >= 0);
    if (acu.length && red.size) {
      const { prof, padre } = recorrer(acu);
      const extraA = acu.flatMap(i => unir(i, .8, pts => { if (ep <= 2) pts.forEach((q, k) => { imgRC('horqueta', q[0] - .15, q[1] + .03); if (k) { lineaRC([pts[k - 1][0] - .15, pts[k - 1][1] + .03], [q[0] - .15, q[1] + .03], 7.6, 0x7E8A3E, 1.6, .6); lineaRC([pts[k - 1][0] - .15, pts[k - 1][1] + .03], [q[0] - .15, q[1] + .03], 7.9, 0xB8C06A, .45, .6); } }); }));
      if (extraA.length) { const cola = [...extraA]; for (const e of extraA) { prof.set(e, 1); padre.set(e, -1); } while (cola.length) { const u = cola.shift(); for (const w of red.get(u) || []) if (!prof.has(w)) { prof.set(w, prof.get(u) + 1); padre.set(w, u); cola.push(w); } } }
      const L = [...prof.keys()].sort((a, b) => prof.get(a) - prof.get(b));
      if (ep <= 2) { // canal de guadua hasta la plaza
        const pz = S.map.findIndex(x => x.b === 'fundacion'), meta = pz >= 0 ? enRed(pz).find(e => prof.has(e)) : undefined;
        if (meta !== undefined) { let e = meta; const tramo = []; while (e !== undefined && e >= 0) { tramo.push(e); e = padre.get(e); }
          tramo.forEach((e, k) => { img('horqueta', e, 0, -.08, .1); if (k) { linea(tramo[k - 1], e, 7.6, 0x7E8A3E, 1.6, .6, -.01).setPosition(5.76, .32); linea(tramo[k - 1], e, 7.9, 0xB8C06A, .45, .6).setPosition(5.76, .12); } }); }
      } else L.filter((e, k) => k % 3 === 1).slice(0, 24).forEach(e => img('grifo', e, 0, .1, -.08));
    }
  }
  update(dt) { this.revision += dt; if (this.revision > 3) { this.revision = 0; if (this.firmaActual() !== this.firma) this.poner(); } }
}
