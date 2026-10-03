// Obras al fresco (fase 8): casas de bahareque con zócalo de color y teja de barro, y edificios públicos
// neoclásicos (como la arquitectura republicana de Colombia): podio, columnas, friso y frontón.
import { FR, shade, mix, pintar, contorno, cajaIso, rectCara, enCara, sombraSuelo, texturaYeso } from './fresco.js';

// Casa de bahareque. op: { muro, zocalo, puerta, pisos (1 o 2), w, d }.
export function casa(g, rng, op = {}) {
  const w = op.w || .62, d = op.d || .5, pisos = op.pisos || 1, h = pisos === 2 ? 26 : 15, rh = 9, ov = .07;
  const muro = op.muro || FR.cal, zocalo = op.zocalo || FR.rojo, teja = op.teja || FR.teja, B = cajaIso(w, d, h), Q = B.Q;
  sombraSuelo(g, 22, 6, 6, .2);
  pintar(g, B.izq, muro, rng, { n: 4, al: .1 }); pintar(g, B.der, shade(muro, -.13), rng, { n: 4, al: .1 });
  // Zócalo de color (como en las casas del Tolima y en los muros pintados de Pompeya).
  pintar(g, rectCara(B.izq, 0, 1, 0, .28 / pisos), zocalo, rng, { n: 2, bw: .45 });
  pintar(g, rectCara(B.der, 0, 1, 0, .28 / pisos), shade(zocalo, -.15), rng, { n: 2, bw: .45 });
  // Puerta y ventanas con marco.
  const pu = op.puerta || FR.verdeOsc;
  pintar(g, rectCara(B.izq, .42, .6, 0, .62 / pisos), pu, rng, { n: 1, bw: .5 });
  pintar(g, rectCara(B.der, .3, .5, .38 / pisos, .66 / pisos), shade(pu, .1), rng, { n: 1, bw: .45 });
  if (pisos === 2) {
    pintar(g, rectCara(B.izq, .2, .36, .62, .84), FR.azul, rng, { n: 1, bw: .45 }); pintar(g, rectCara(B.izq, .66, .82, .62, .84), FR.azul, rng, { n: 1, bw: .45 });
    // Balcón de madera.
    pintar(g, rectCara(B.izq, .12, .9, .52, .58), FR.siena, rng, { n: 1, bw: .4 });
  }
  // Tejado a dos aguas de teja de barro, con la cumbrera a lo largo de las columnas.
  const atras = [Q(B.r0 - ov, B.c0 - ov, h), Q(B.r0 - ov, B.c1 + ov, h), Q(0, B.c1 + ov, h + rh), Q(0, B.c0 - ov, h + rh)];
  const frente = [Q(B.r1 + ov, B.c0 - ov, h), Q(B.r1 + ov, B.c1 + ov, h), Q(0, B.c1 + ov, h + rh), Q(0, B.c0 - ov, h + rh)];
  pintar(g, [Q(B.r0, B.c1, h), Q(B.r1, B.c1, h), Q(0, B.c1, h + rh)], shade(muro, -.13), rng, { n: 1 });
  pintar(g, atras, shade(teja, -.12), rng, { n: 3 });
  pintar(g, frente, teja, rng, { n: 4 });
  // Hileras de teja.
  g.save(); g.globalAlpha = .4; g.strokeStyle = shade(teja, -.35); g.lineWidth = .5;
  for (let k = 1; k < 4; k++) { const t = k / 4, a = [frente[0][0] + (frente[3][0] - frente[0][0]) * t, frente[0][1] + (frente[3][1] - frente[0][1]) * t], b = [frente[1][0] + (frente[2][0] - frente[1][0]) * t, frente[1][1] + (frente[2][1] - frente[1][1]) * t]; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
  g.restore();
}

// Edificio público neoclásico (ágora, escuela, banco...): podio con gradas, cella, columnas al frente, friso y frontón.
// op: { col (color del friso), columnas (número), w, d, h }.
export function templo(g, rng, op = {}) {
  const w = op.w || .86, d = op.d || .78, hp = 4, h = op.h || 20, n = op.columnas || 4, friso = op.col || FR.rojo;
  // Podio con dos gradas.
  sombraSuelo(g, 30, 8, 7, .2);
  for (let k = 0; k < 2; k++) { const P = cajaIso(w + .1 - k * .05, d + .1 - k * .05, hp / 2 * (k + 1)); pintar(g, P.izq, shade(FR.cal, -.04 - k * .02), rng, { n: 2, bw: .45 }); pintar(g, P.der, shade(FR.cal, -.16), rng, { n: 2, bw: .45 }); pintar(g, P.techo, FR.cal, rng, { n: 2, bw: .4 }); }
  // Cella (muro del fondo) retirada del frente.
  const cel = cajaIso(w * .82, d * .7, h, 64, 32), Qc = cel.Q;
  g.save(); g.translate(...Qc(-d * .12, 0, hp)); g.translate(-Qc(0, 0, 0)[0], -Qc(0, 0, 0)[1]);
  pintar(g, cel.izq, FR.ocreClaro, rng, { n: 3 }); pintar(g, cel.der, shade(FR.ocreClaro, -.15), rng, { n: 3 });
  pintar(g, rectCara(cel.izq, .38, .62, 0, .66), FR.siena, rng, { n: 1, bw: .5 });
  g.restore();
  // Columnas al frente (fuste claro, sombra a un lado, capitel y basa).
  const B = cajaIso(w * .92, d * .92, h), base = rectCara(B.izq, 0, 1, 0, 0);
  for (let k = 0; k < n; k++) {
    const u = .08 + k * (.84 / (n - 1)), p0 = enCara(B.izq, u, 0), p1 = enCara(B.izq, u, 1);
    const x0 = p0[0], y0 = p0[1] - hp, y1 = p1[1] - hp, r = 1.9;
    pintar(g, [[x0 - r, y0], [x0 + r, y0], [x0 + r * .85, y1], [x0 - r * .85, y1]], FR.cal, rng, { n: 1, bw: .5 });
    g.save(); g.globalAlpha = .28; g.fillStyle = FR.siena; g.fillRect(x0 + r * .2, y1, r * .6, y0 - y1); g.restore();
    pintar(g, [[x0 - r * 1.4, y1 + 1.4], [x0 + r * 1.4, y1 + 1.4], [x0 + r * 1.4, y1 - .4], [x0 - r * 1.4, y1 - .4]], FR.cal, rng, { n: 0, bw: .45 });
    pintar(g, [[x0 - r * 1.3, y0], [x0 + r * 1.3, y0], [x0 + r * 1.3, y0 - 1.2], [x0 - r * 1.3, y0 - 1.2]], FR.cal, rng, { n: 0, bw: .45 });
  }
  // Friso (arquitrabe pintado) y frontón triangular con techo a dos aguas (cumbrera hacia el fondo).
  const T = cajaIso(w * .96, d * .96, h + hp), Q = T.Q, hf = h + hp, rh = 9;
  const frisoI = [Q(T.r1, T.c0, hf - 1), Q(T.r1, T.c1, hf - 1), Q(T.r1, T.c1, hf + 3), Q(T.r1, T.c0, hf + 3)];
  const frisoD = [Q(T.r0, T.c1, hf - 1), Q(T.r1, T.c1, hf - 1), Q(T.r1, T.c1, hf + 3), Q(T.r0, T.c1, hf + 3)];
  pintar(g, frisoD, shade(friso, -.15), rng, { n: 2, bw: .5 });
  pintar(g, frisoI, friso, rng, { n: 2, bw: .5 });
  const techoD = [Q(T.r0, T.c1, hf + 3), Q(T.r1, T.c1, hf + 3), Q(T.r1, 0, hf + 3 + rh), Q(T.r0, 0, hf + 3 + rh)];
  pintar(g, techoD, FR.teja, rng, { n: 3 });
  const fronton = [Q(T.r1, T.c0, hf + 3), Q(T.r1, T.c1, hf + 3), Q(T.r1, 0, hf + 3 + rh)];
  pintar(g, fronton, FR.cal, rng, { n: 2 });
  // Tímpano con un medallón (laurel) y una franja de dentículos.
  const m = [(fronton[0][0] + fronton[1][0] + fronton[2][0]) / 3, (fronton[0][1] + fronton[1][1] + fronton[2][1]) / 3];
  g.save(); g.strokeStyle = FR.verde; g.lineWidth = .9; g.beginPath(); g.arc(m[0], m[1] + .8, 2.2, Math.PI * .15, Math.PI * .85, true); g.stroke(); g.restore();
  g.save(); g.fillStyle = FR.cal; for (let k = 0; k < 10; k++) { const p = enCara(frisoI, .05 + k * .095, .15); g.globalAlpha = .9; g.fillRect(p[0] - .5, p[1] - 1.2, 1, 1); } g.restore();
}

// Fuente de la plaza (para el ágora y los parques).
export function fuente(g, rng) {
  sombraSuelo(g, 9, 3, 2);
  const B = cajaIso(.3, .3, 3);
  pintar(g, B.izq, FR.cal, rng, { n: 1, bw: .45 }); pintar(g, B.der, shade(FR.cal, -.15), rng, { n: 1, bw: .45 }); pintar(g, B.techo, FR.agua, rng, { n: 2, bw: .45 });
  pintar(g, [[-.8, -3], [.8, -3], [.6, -9], [-.6, -9]], FR.cal, rng, { n: 0, bw: .4 });
  g.save(); g.strokeStyle = mix(FR.agua, FR.cal, .4); g.lineWidth = .7; g.beginPath(); g.moveTo(0, -9); g.quadraticCurveTo(-3, -10, -4, -4); g.moveTo(0, -9); g.quadraticCurveTo(3, -10, 4, -4); g.stroke(); g.restore();
}
export { texturaYeso, contorno };
