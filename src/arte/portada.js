// Portada (fase 8; renovación colonial, 6 de octubre): el Nevado del Ruiz con su fumarola, tres capas de cordillera,
// la ladera cafetera, el valle con el río Magdalena y un pueblo colonial con su iglesia de espadaña, el cabildo de
// portales y casas de cal y teja. Se pinta una vez y luego solo se escala.
import { FR, mulberry, shade, mix, lienzo, pintar, ovalo, toques, texturaYeso } from './fresco.js';
import { casaColonial } from './casas.js';
import { iglesiaEpoca, cabildo } from './publicos.js';
import { recetasFlora } from './flora.js';

// Cresta de montaña: puntos de izquierda a derecha.
function cresta(w, base, alto, R, f) {
  const p = [];
  for (let x = -20; x <= w + 20; x += 24) p.push([x, base - alto * (.5 + .3 * Math.sin(x / w * f[0] + f[2]) + .2 * Math.sin(x / w * f[1] + 1.3)) + (R() - .5) * 6]);
  return p;
}

export function pintarPortadaFresco(w = 1600, h = 1000, semilla = 7) {
  const c = lienzo(w, h), g = c.getContext('2d'), R = mulberry(semilla);
  // Cielo de muro: azul pálido arriba que se funde con la cal en el horizonte.
  const cielo = g.createLinearGradient(0, 0, 0, h * .62);
  cielo.addColorStop(0, mix('#AFC7CC', FR.yeso, .25)); cielo.addColorStop(1, FR.yeso);
  g.fillStyle = cielo; g.fillRect(0, 0, w, h);
  for (let k = 0; k < 5; k++) { g.save(); g.globalAlpha = .5; ovalo(g, w * (.1 + k * .2) + R() * 60, h * (.08 + R() * .1), 70 + R() * 50, 14 + R() * 8, FR.cal, R, { borde: false, n: 2 }); g.restore(); }
  // Nevado del Ruiz: macizo ancho, casquete de nieve y una fumarola (está activo).
  const cx = w * .68, cy = h * .19;
  pintar(g, [[cx - w * .36, h * .56], [cx - w * .12, cy + h * .08], [cx - w * .04, cy + h * .015], [cx + w * .04, cy], [cx + w * .1, cy + h * .04], [cx + w * .38, h * .56]], mix('#A6A3B4', FR.yeso, .2), R, { n: 10, bw: 1.6, bal: .55 });
  pintar(g, [[cx - w * .085, cy + h * .085], [cx - w * .04, cy + h * .015], [cx + w * .04, cy], [cx + w * .1, cy + h * .04], [cx + w * .13, cy + h * .1], [cx + w * .08, cy + h * .085], [cx + w * .04, cy + h * .11], [cx, cy + h * .08], [cx - w * .04, cy + h * .11]], FR.cal, R, { n: 4, bw: 1.4, bal: .5 });
  g.save(); g.globalAlpha = .35; g.strokeStyle = '#9A98AA'; g.lineWidth = 2; for (let k = 0; k < 6; k++) { const x = cx - w * .06 + k * w * .03; g.beginPath(); g.moveTo(x, cy + h * .03); g.lineTo(x + (R() - .5) * 20, cy + h * .1); g.stroke(); } g.restore();
  for (let k = 0; k < 4; k++) { g.save(); g.globalAlpha = .45 - k * .08; ovalo(g, cx + k * 26, cy - 16 - k * 30, 20 + k * 12, 12 + k * 6, FR.cal, R, { borde: false, n: 1 }); g.restore(); }
  // Cordillera en tres capas: páramo lejano, bosque de niebla y ladera cafetera.
  [['#A9B6A4', .53, .16, [2.1, 3.7, 7.3]], [shade(FR.tierraVerde, -.05), .62, .14, [1.6, 4.2, 9.1]], [FR.verde, .71, .12, [1.2, 3.1, 6.7]]].forEach(([col, b, a, o]) => {
    const p = cresta(w, h * b, h * a, R, o);
    pintar(g, [...p, [w + 20, h + 20], [-20, h + 20]], col, R, { n: 18, bw: 1.6, bal: .5 });
  });
  // Matas de café con sus granos rojos en la ladera cercana.
  for (let k = 0; k < 70; k++) {
    const x = R() * w, y = h * (.66 + R() * .07), rx = 6 + R() * 5;
    ovalo(g, x, y, rx, rx * .65, R() < .7 ? FR.verdeOsc : shade(FR.verde, -.1), R, { n: 1, bw: .8, bal: .4 });
    if (R() < .6) toques(g, x, y, rx * .6, rx * .4, FR.bermellon, R, 3, .9);
  }
  // Valle cálido con parcelas y surcos.
  pintar(g, [[-20, h * .8], [w * .3, h * .76], [w * .7, h * .79], [w + 20, h * .75], [w + 20, h + 20], [-20, h + 20]], mix(FR.ocre, FR.ocreClaro, .5), R, { n: 20, bw: 1.6, bal: .45 });
  for (let k = 0; k < 7; k++) {
    const x0 = R() * w, y0 = h * (.82 + R() * .1), pw = 120 + R() * 140, ph = 26 + R() * 18, col = [FR.ocre, mix(FR.verde, FR.ocre, .4), mix(FR.tierraVerde, FR.ocreClaro, .3)][k % 3];
    const q = [[x0, y0], [x0 + pw, y0 - ph * .4], [x0 + pw * 1.2, y0 + ph * .5], [x0 + pw * .2, y0 + ph]];
    pintar(g, q, col, R, { n: 4, bw: 1, bal: .35 });
    g.save(); g.globalAlpha = .3; g.strokeStyle = shade(col, -.3); g.lineWidth = 1.2;
    for (let s = 1; s < 6; s++) { const f = s / 6, a = [q[0][0] + (q[3][0] - q[0][0]) * f, q[0][1] + (q[3][1] - q[0][1]) * f], b = [q[1][0] + (q[2][0] - q[1][0]) * f, q[1][1] + (q[2][1] - q[1][1]) * f]; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); }
    g.restore();
  }
  // El río: azul egipcio con orillas de arena y ondas claras.
  const rio = (ancho, col, al = 1) => { g.save(); g.globalAlpha = al; g.strokeStyle = col; g.lineCap = 'round'; g.lineWidth = ancho; g.beginPath(); g.moveTo(-20, h * .9); g.bezierCurveTo(w * .3, h * .8, w * .55, h * .98, w + 20, h * .84); g.stroke(); g.restore(); };
  rio(h * .05, mix(FR.ocreClaro, FR.cal, .4)); rio(h * .032, FR.azul); rio(h * .02, FR.agua, .9);
  g.save(); g.strokeStyle = FR.cal; g.globalAlpha = .7; g.lineWidth = 2;
  for (let k = 0; k < 14; k++) { const t = k / 14, x = -20 + (w + 40) * t, y = h * (.9 - .06 * Math.sin(t * Math.PI * 1.3)) + 2; g.beginPath(); g.moveTo(x - 10, y); g.quadraticCurveTo(x, y - 4, x + 10, y); g.stroke(); }
  g.restore();
  // Pueblo colonial junto al río: iglesia con espadaña, cabildo de portales, casas de cal y teja y palmas de cera.
  const flora = Object.fromEntries(recetasFlora(0).map(x => [x[0], x[5]]));
  const pon = (x, y, s, f) => { g.save(); g.translate(x, y); g.scale(s, s); f(mulberry(Math.round(x * 3 + y))); g.restore(); };
  pon(w * .2, h * .7, 2.2, r => flora.palma(g, r)); pon(w * .82, h * .69, 2.4, r => flora.palma(g, r)); pon(w * .9, h * .72, 2, r => flora.palma(g, r));
  pon(w * .63, h * .755, 2.5, () => iglesiaEpoca(g, 1));
  pon(w * .3, h * .785, 2.4, () => casaColonial(g, 0, 0, false));
  pon(w * .47, h * .775, 2.3, () => cabildo(g, 1));
  pon(w * .37, h * .815, 2.4, () => casaColonial(g, 1, 2, false));
  pon(w * .76, h * .81, 2.3, () => casaColonial(g, 0, 3, false));
  pon(w * .14, h * .8, 2.2, r => flora.guadua(g, r)); pon(w * .86, h * .82, 2.2, r => flora.arbol(g, r));
  texturaYeso(g, 0, 0, w, h, .45);
  return c;
}
