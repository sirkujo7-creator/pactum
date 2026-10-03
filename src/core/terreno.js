// Terreno continuo de la prueba de estilo: relieve con luz, río y pisos térmicos del Tolima.
// Es lógica pura (sin dibujo). Se regenera siempre igual a partir de la semilla y el tamaño,
// así que no hace falta guardarlo en la partida: solo se guarda el mapa lógico.
import { mulberry, clamp } from './azar.js';

const lerp = (a, b, t) => a + (b - a) * t;
const smooth = t => t * t * (3 - 2 * t);

function makeNoise(seed) {
  const R = mulberry(seed), G = 64, g = Array.from({ length: G * G }, () => R());
  const at = (x, y) => g[((y % G + G) % G) * G + ((x % G + G) % G)];
  return (x, y) => {
    const x0 = Math.floor(x), y0 = Math.floor(y), fx = smooth(x - x0), fy = smooth(y - y0);
    return lerp(lerp(at(x0, y0), at(x0 + 1, y0), fx), lerp(at(x0, y0 + 1), at(x0 + 1, y0 + 1), fx), fy);
  };
}

// Entornos (pisos térmicos). "logico" es el tipo de terreno que usa la economía de la v9.
export const BIOMA = {
  agua: { n: 'Río', p: 'Agua' },
  galeria: { n: 'Bosque de galería', p: 'Cálido' },
  arrozal: { n: 'Llanura arrocera', p: 'Cálido' },
  seco: { n: 'Bosque seco tropical', p: 'Cálido' },
  potrero: { n: 'Potrero', p: 'Cálido' },
  ladera: { n: 'Ladera cafetera', p: 'Templado' },
  niebla: { n: 'Bosque de niebla', p: 'Frío' },
  paramo: { n: 'Páramo', p: 'Páramo' },
  roca: { n: 'Roca de alta montaña', p: 'Glacial' },
  nieve: { n: 'Nevado', p: 'Glacial' }
};
export function metros(h) { return Math.round((300 + h * 450) / 50) * 50; }

// desvios (fase 6): cambios de curso del río por la erosión y las crecidas; cada uno empuja el cauce en un tramo.
export function genTerreno(seed, N, desvios) {
  const n1 = makeNoise(seed), n2 = makeNoise(seed + 17), n3 = makeNoise(seed + 99), dv = desvios || [];
  // El río cruza en diagonal; su curva depende de la semilla.
  const riverMid = s => N * 1.08 + 2.6 * Math.sin(s * Math.PI * 1.6 + seed % 7) + 1.2 * Math.sin(s * Math.PI * 4.1 + seed % 3)
    + dv.reduce((t, d) => t + d.a * Math.exp(-(((s - d.s) / d.w) ** 2)), 0);
  const riverD = (r, c) => { const s = (c - r) / N; return Math.abs((r + c) - riverMid(s)) / Math.SQRT2; };
  const side = (r, c) => { const s = (c - r) / N; return Math.sign((r + c) - riverMid(s)); };
  // Altura: cordillera al fondo, colinas, cauce del río y un cerro aislado al frente.
  const hf = (r, c) => {
    const u = c / N, v = r / N;
    const fbm = n1(u * 3.2, v * 3.2) * .55 + n2(u * 7, v * 7) * .3 + n3(u * 14, v * 14) * .15;
    const back = clamp(1 - (u + v) / 1.25, 0, 1);
    const peaks = n2(u * 4.3 + 11, v * 4.3 + 3);
    const ridge = Math.pow(back, 1.5) * 10.5 * (0.55 + 0.75 * peaks);
    let h = fbm * 2.6 + ridge + (1 - back) * 0.4;
    const d = riverD(r, c);
    h -= 2.3 * Math.exp(-((d / 1.7) ** 2));
    h += 0.9 * Math.exp(-(((u - .78) ** 2 + (v - .9) ** 2) / .02));
    return Math.max(0, h);
  };
  const moistAt = (r, c) => clamp(1.2 - riverD(r, c) / 5, 0, 1) * .7 + n3(c / 5, r / 5) * .5;
  const H = [];
  for (let r = 0; r <= N; r++) for (let c = 0; c <= N; c++) H.push(hf(r, c));
  const hv = (r, c) => H[r * (N + 1) + c];
  const tiles = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    const h00 = hv(r, c), h01 = hv(r, c + 1), h11 = hv(r + 1, c + 1), h10 = hv(r + 1, c);
    const h = (h00 + h01 + h11 + h10) / 4, sx = (h01 + h11 - h00 - h10) / 2, sy = (h10 + h11 - h00 - h01) / 2, slope = Math.hypot(sx, sy);
    const d = riverD(r + .5, c + .5), moist = clamp(1.2 - d / 5, 0, 1) * .7 + n3(c / 5, r / 5) * .5;
    let b;
    if (d < 1.3 && h < 2.2) b = 'agua';
    else if (h > 9) b = 'nieve';
    else if (h > 7.6 || slope > 2.4) b = 'roca';
    else if (h > 6.1) b = 'paramo';
    else if (h > 4.4) b = 'niebla';
    else if (h > 2) b = 'ladera';
    else if (d < 1.9) b = 'galeria';
    else if (d < 6 && moist > .45 && slope < .45) b = 'arrozal';
    else if (moist < .5) b = 'seco';
    else b = 'potrero';
    tiles.push({ r, c, h, h00, h01, h11, h10, sx, sy, slope, b, d, lado: side(r + .5, c + .5) });
  }
  return { seed, N, H, hv, hf, tiles, riverMid, riverD, moistAt, vary: makeNoise(seed + 55) };
}
