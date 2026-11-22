// Asiento de las obras (fase visual, paso 2; pedido de Juan: «que todo cuadre»). En vez de una losa clara cuadrada
// bajo cada edificio, el suelo cuenta cómo se usa: patio de tierra pisada de borde irregular que se funde con el
// pasto, atrio de lajas frente a la iglesia, plaza de tierra, empedrada o enlosada según la etapa, y en las lomas
// una terraza con muro de piedra (pirca) en vez de un bloque flotante. Además, cada edificio proyecta sobre el suelo
// la sombra de su propia silueta con el mismo sol que los árboles (arriba a la izquierda).
import { mulberry, clamp, shade, mix, lienzo } from './acuarela.js';
import { P } from './iso.js';
import { SOMBRA } from './naturaleza.js';

const lerp = (a, b, t) => a + (b - a) * t;
const PATIO = { casa: .47, mercado: .53, escuela: .52, hospital: .52, taller: .5, agora: .52, banco: .5, universidad: .53, acueducto: .46, molino: .5, aserradero: .55, cantera: .55, estudio: .48, puerto: .52, iglesia: .55, fundacion: .6, cementerio: .5, parque: .5 };
const TIERRA = { base: '#B39B73', claro: '#C8B48C', oscuro: '#8F7A57' };

// Contorno de un patio: un cuadrado de puntas redondeadas (sigue la casilla) con el borde ondulado por ruido.
function contorno(t, rad, rng, irreg, alto) {
  const fases = [rng() * 6.3, rng() * 6.3, rng() * 6.3], n = 40, L = [];
  for (let k = 0; k < n; k++) {
    const a = k / n * 6.2832, ca = Math.cos(a), sa = Math.sin(a), r0 = 1 / Math.pow(Math.abs(ca) ** 4 + Math.abs(sa) ** 4, .25);
    const nz = .55 * Math.sin(a * 3 + fases[0]) + .3 * Math.sin(a * 5 + fases[1]) + .2 * Math.sin(a * 9 + fases[2]) + (rng() - .5) * .25;
    const r = rad * (r0 * .82 + .18) * (1 + irreg * nz), u = .5 + ca * r, v = .5 + sa * r;
    L.push(P(t.r + v, t.c + u, alto(t.r + v, t.c + u)));
  }
  return L;
}
const trazar = (g, L) => { g.beginPath(); for (let k = 0; k <= L.length; k++) { const p = L[k % L.length], q = L[(k + 1) % L.length], m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]; k ? g.quadraticCurveTo(p[0], p[1], m[0], m[1]) : g.moveTo(m[0], m[1]); } g.closePath(); };

// Hojitas de pasto en punta que invaden el borde del patio (así el borde no es una línea).
function bordePasto(g, L, rng, tonos, n) {
  const capas = [[], [], []];
  for (let j = 0; j < n; j++) {
    const k = Math.floor(rng() * L.length), p = L[k], q = L[(k + 1) % L.length], f = rng(), x = lerp(p[0], q[0], f) + (rng() - .5) * 2, y = lerp(p[1], q[1], f) + (rng() - .5) * 1.2;
    const m = 2 + Math.floor(rng() * 3), h = 1.3 + rng() * 1.6;
    for (let s = 0; s < m; s++) { const a = (s / Math.max(1, m - 1) - .5) * 1.2 + (rng() - .5) * .4, c = Math.cos(a), sn = Math.sin(a), w = .45; capas[s === 0 ? 0 : rng() < .4 ? 2 : 1].push(x - w * c, y - w * sn * .3, x + sn * h, y - c * h, x + w * c, y + w * sn * .3); }
  }
  capas.forEach((A, k) => { g.globalAlpha = 1; g.fillStyle = tonos[k]; g.beginPath(); for (let i = 0; i < A.length; i += 6) { g.moveTo(A[i], A[i + 1]); g.lineTo(A[i + 2], A[i + 3]); g.lineTo(A[i + 4], A[i + 5]); g.closePath(); } g.fill(); });
}
// Piedrita facetada (nada de óvalos): cara de luz arriba a la izquierda.
function piedrita(g, x, y, w, rng, col = '#A39886') {
  const k = 5 + Math.floor(rng() * 2), L = [];
  for (let i = 0; i < k; i++) { const a = i / k * 6.283 + (rng() - .5) * .5, f = .75 + rng() * .35; L.push([x + Math.cos(a) * w * f, y + Math.sin(a) * w * .55 * f]); }
  g.globalAlpha = .35; g.fillStyle = '#3A2E20'; g.beginPath(); L.forEach(([a, b], i) => i ? g.lineTo(a + w * .35, b + w * .25) : g.moveTo(a + w * .35, b + w * .25)); g.closePath(); g.fill();
  g.globalAlpha = 1; g.fillStyle = col; g.beginPath(); L.forEach(([a, b], i) => i ? g.lineTo(a, b) : g.moveTo(a, b)); g.closePath(); g.fill();
  g.fillStyle = shade(col, .28); g.beginPath(); g.moveTo(L[k - 1][0], L[k - 1][1]); g.lineTo(L[0][0], L[0][1]); g.lineTo(x, y); g.closePath(); g.fill();
}

// Suelo de tierra pisada dentro del contorno L: tono de fondo, manchas claras donde más se camina, huellas de lodo
// oscuras, piedritas y alguna hierba que crece en el patio.
function tierraPisada(g, L, cx, cy, rad, rng, col = TIERRA, dry = 0) {
  const base = mix(col.base, '#C6AE80', dry * .4);
  g.save(); trazar(g, L);
  g.globalAlpha = .55; g.fillStyle = shade(base, -.08); g.fill(); // orilla difusa: el borde se mezcla con el pasto
  g.restore();
  // El cuerpo un poco más adentro, para que la orilla quede como transición.
  const adentro = L.map(([x, y]) => [cx + (x - cx) * .9, cy + (y - cy) * .9]);
  g.save(); trazar(g, adentro); g.globalAlpha = .95; g.fillStyle = base; g.fill(); g.clip();
  for (let j = 0; j < 6; j++) { const x = cx + (rng() - .5) * rad * 1.3, y = cy + (rng() - .5) * rad * .6, w = rad * (.2 + rng() * .25); g.globalAlpha = .45; g.fillStyle = col.claro; g.beginPath(); for (let k = 0; k < 7; k++) { const a = k / 7 * 6.283, f = .6 + rng() * .5; k ? g.lineTo(x + Math.cos(a) * w * f, y + Math.sin(a) * w * .5 * f) : g.moveTo(x + Math.cos(a) * w * f, y + Math.sin(a) * w * .5 * f); } g.closePath(); g.fill(); }
  for (let j = 0; j < 4; j++) { const x = cx + (rng() - .5) * rad * 1.4, y = cy + (rng() - .5) * rad * .7, w = rad * (.08 + rng() * .1); g.globalAlpha = .28; g.fillStyle = col.oscuro; g.beginPath(); for (let k = 0; k < 6; k++) { const a = k / 6 * 6.283, f = .6 + rng() * .5; k ? g.lineTo(x + Math.cos(a) * w * f, y + Math.sin(a) * w * .5 * f) : g.moveTo(x + Math.cos(a) * w * f, y + Math.sin(a) * w * .5 * f); } g.closePath(); g.fill(); }
  // Rayitas de escoba y huellas.
  g.globalAlpha = .2; g.strokeStyle = col.oscuro; g.lineWidth = .45;
  for (let j = 0; j < 7; j++) { const x = cx + (rng() - .5) * rad * 1.4, y = cy + (rng() - .5) * rad * .6, l = 1.5 + rng() * 2.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + l, y + l * .5 * (rng() < .5 ? 1 : -1)); g.stroke(); }
  g.restore();
  for (let j = 0; j < 5; j++) { const a = rng() * 6.283, q = Math.sqrt(rng()) * .85, x = cx + Math.cos(a) * rad * q, y = cy + Math.sin(a) * rad * .5 * q; piedrita(g, x, y, .6 + rng() * .8, rng, mix('#A39886', '#8E8270', rng())); }
  g.globalAlpha = 1;
}

// Empedrado: cantos rodados (piedras de río) en hileras que siguen la casilla, con juntas oscuras y pasto que asoma.
function empedrado(g, t, h, L, rng, paso, tonos, junta) {
  g.save(); trazar(g, L); g.fillStyle = junta; g.globalAlpha = 1; g.fill(); g.clip();
  const n = Math.ceil(1.3 / paso);
  for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) {
    const off = (a % 2) * paso * .5, u0 = -.15 + b * paso + off, v0 = -.15 + a * paso;
    const j = () => (rng() - .5) * paso * .22, s = paso * .1;
    const q = [[u0 + s + j(), v0 + s + j()], [u0 + paso - s + j(), v0 + s + j()], [u0 + paso - s + j(), v0 + paso - s + j()], [u0 + s + j(), v0 + paso - s + j()]].map(([u, v]) => P(t.r + v, t.c + u, h));
    const col = tonos[Math.floor(rng() * tonos.length)];
    g.fillStyle = col; g.beginPath(); q.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill();
    g.fillStyle = shade(col, .2); g.beginPath(); g.moveTo(...q[3]); g.lineTo(...q[0]); g.lineTo(...q[1]); g.lineTo((q[0][0] + q[2][0]) / 2, (q[0][1] + q[2][1]) / 2); g.closePath(); g.fill(); // luz arriba a la izquierda
  }
  g.restore();
}
// Damero de losas (plaza de la polis): baldosas claras y oscuras con su sardinel.
function damero(g, t, h, rad, n, c1, c2) {
  const a = .5 - rad, b = .5 + rad, d = (b - a) / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const q = [[a + j * d, a + i * d], [a + (j + 1) * d, a + i * d], [a + (j + 1) * d, a + (i + 1) * d], [a + j * d, a + (i + 1) * d]].map(([u, v]) => P(t.r + v, t.c + u, h));
    g.fillStyle = (i + j) % 2 ? c2 : c1; g.beginPath(); q.forEach((p, k) => k ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill();
  }
  g.strokeStyle = '#8E8470'; g.lineWidth = 1.2; g.beginPath(); [[a, a], [b, a], [b, b], [a, b]].map(([u, v]) => P(t.r + v, t.c + u, h)).forEach((p, k) => k ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.stroke();
}

// Muro de piedra (pirca) bajo el borde de una terraza, entre la altura de la terraza y el suelo.
function pirca(g, T, p, q, h, rng) {
  const n = 10, arriba = [], abajo = [];
  for (let s = 0; s <= n; s++) { const f = s / n, r = lerp(p[0], q[0], f), c = lerp(p[1], q[1], f); arriba.push(P(r, c, h)); abajo.push(P(r, c, Math.min(h, T.hf(r, c)) - .05)); }
  const caida = Math.max(...arriba.map((a, i) => abajo[i][1] - a[1]));
  if (caida < 2.2) return; // sin desnivel no hay muro
  g.save(); g.beginPath(); arriba.forEach((a, i) => i ? g.lineTo(a[0], a[1]) : g.moveTo(a[0], a[1])); for (let i = n; i >= 0; i--) g.lineTo(abajo[i][0], abajo[i][1]); g.closePath();
  g.globalAlpha = 1; g.fillStyle = '#857A68'; g.fill(); g.clip();
  // Hileras de piedras de tamaños distintos, con su cara de luz.
  const x0 = Math.min(...arriba.map(a => a[0]), ...abajo.map(a => a[0])), x1 = Math.max(...arriba.map(a => a[0]), ...abajo.map(a => a[0]));
  const y0 = Math.min(...arriba.map(a => a[1])), y1 = Math.max(...abajo.map(a => a[1])), pend = (arriba[n][1] - arriba[0][1]) / ((arriba[n][0] - arriba[0][0]) || 1);
  for (let y = y0 - 4; y < y1 + 4; y += 2.6) for (let x = x0 - 3 + rng() * 2; x < x1 + 3; x += 2.6 + rng() * 2.2) {
    const yy = y + (x - x0) * pend, w = 1.2 + rng() * 1.1, col = mix('#B2A792', '#948A78', rng());
    g.fillStyle = col; g.beginPath(); g.moveTo(x - w, yy - .9); g.lineTo(x + w * .8, yy - 1.1); g.lineTo(x + w, yy + .8); g.lineTo(x - w * .7, yy + 1); g.closePath(); g.fill();
    g.fillStyle = shade(col, .25); g.fillRect(x - w * .8, yy - 1, w * 1.2, .5);
  }
  // Sombra bajo la corona y musgo al pie.
  g.globalAlpha = .3; g.fillStyle = '#2A241A'; g.beginPath(); arriba.forEach((a, i) => i ? g.lineTo(a[0], a[1] + 1.4) : g.moveTo(a[0], a[1])); for (let i = n; i >= 0; i--) g.lineTo(arriba[i][0], arriba[i][1]); g.closePath(); g.fill();
  g.restore();
  g.globalAlpha = .85; g.fillStyle = '#6E8A42';
  for (let i = 0; i <= n; i++) if (rng() < .5) { const [x, y] = abajo[i]; g.beginPath(); g.moveTo(x - 1.2, y); g.lineTo(x, y - 1.6 - rng() * 1.4); g.lineTo(x + 1.2, y); g.closePath(); g.fill(); }
  // Corona de la terraza: piedras planas.
  g.globalAlpha = 1; g.strokeStyle = '#B3A994'; g.lineWidth = 1.1; g.beginPath(); arriba.forEach((a, i) => i ? g.lineTo(a[0], a[1]) : g.moveTo(a[0], a[1])); g.stroke();
}

// El asiento de cada obra de pie (tiles: casillas con obra, ya ordenadas de atrás hacia adelante).
export function asentarObras(g, T, mapa, tiles, dry, etapa, tonosPasto) {
  const N = T.N;
  for (const t of tiles) {
    const x = mapa[t.r * N + t.c], b = x.b, rad0 = PATIO[b];
    if (rad0 === undefined) continue;
    const rng = mulberry(t.r * 911 + t.c * 37 + T.seed), h = t.h, m = .04;
    const esq = [[t.r + m, t.c + m], [t.r + m, t.c + 1 - m], [t.r + 1 - m, t.c + 1 - m], [t.r + 1 - m, t.c + m]];
    // ¿Hay desnivel? Si el suelo baja más de un poco hacia adelante, la obra va en una terraza con pirca.
    const [A, B, Cq, D] = esq, caida = Math.max(...[B, Cq, D].map(([r, c]) => h - T.hf(r, c)));
    const terraza = caida > .32 && b !== 'parque' && b !== 'cementerio';
    const c0 = P(t.r + .5, t.c + .5, h), radPx = 32 * rad0 * 2 * .5, tonos = tonosPasto('potrero', dry);
    const alto = (r, c) => terraza ? h : lerp(h, T.hf(r, c), .5);
    if (terraza) {
      pirca(g, T, D, Cq, h, rng); pirca(g, T, Cq, B, h, rng);
      const top = esq.map(([r, c]) => P(r, c, h));
      g.globalAlpha = 1; g.fillStyle = mix(TIERRA.base, '#9FA46A', .35); g.beginPath(); top.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill(); // la terraza tiene algo de pasto
    }
    const L = contorno(t, rad0, rng, terraza ? .04 : b === 'fundacion' && etapa >= 3 ? 0 : .09, alto);
    if (b === 'parque') { g.save(); trazar(g, L); g.globalAlpha = .55; g.fillStyle = mix('#7FA85A', '#C2B47A', dry * .6); g.fill(); g.restore(); const s = contorno(t, .16, rng, .05, alto); tierraPisada(g, s, c0[0], c0[1], 9, rng, TIERRA, dry); continue; }
    if (b === 'cementerio') {
      g.save(); trazar(g, L); g.globalAlpha = .5; g.fillStyle = mix('#88A05E', '#B9B07A', dry * .6); g.fill(); g.clip();
      g.globalAlpha = .85; g.strokeStyle = '#C9BFA6'; g.lineWidth = 3; g.beginPath(); g.moveTo(...P(t.r + .5, t.c + .05, h)); g.lineTo(...P(t.r + .5, t.c + .95, h)); g.moveTo(...P(t.r + .05, t.c + .5, h)); g.lineTo(...P(t.r + .95, t.c + .5, h)); g.stroke(); // senderos de gravilla
      g.restore(); continue;
    }
    if (b === 'fundacion') {
      if (etapa <= 0) tierraPisada(g, L, c0[0], c0[1], radPx * 1.2, rng, { base: '#BCA47A', claro: '#D0BC92', oscuro: '#8F7A57' }, dry);
      else if (etapa >= 3) damero(g, t, h, .5, 8, '#E2DAC6', '#C2B8A0');
      else empedrado(g, t, h, L, rng, etapa === 1 ? .085 : .07, etapa === 1 ? ['#B8A88A', '#C6B797', '#A9987A', '#CFC0A2', '#B5A086'] : ['#C6B99E', '#D2C6AC', '#B8AA8E', '#DCD1B9'], '#7E6F58');
      if (etapa < 3) bordePasto(g, L, rng, tonos, 34);
      continue;
    }
    if (b === 'iglesia') { // atrio de lajas
      empedrado(g, t, h, L, rng, .16, ['#BDB4A0', '#B0A690', '#C8C0AE', '#A69C86'], '#7C7260');
      bordePasto(g, L, rng, tonos, 26); continue;
    }
    const col = b === 'cantera' ? { base: '#A9A08E', claro: '#C2BBAA', oscuro: '#7E7666' } : b === 'aserradero' ? { base: '#B79A6A', claro: '#D6BC88', oscuro: '#8A6E48' } : TIERRA;
    tierraPisada(g, L, c0[0], c0[1], radPx, rng, col, dry);
    if (b === 'aserradero') for (let j = 0; j < 30; j++) { const a = rng() * 6.283, q = Math.sqrt(rng()), px = c0[0] + Math.cos(a) * radPx * q, py = c0[1] + Math.sin(a) * radPx * .5 * q; g.globalAlpha = .7; g.fillStyle = rng() < .5 ? '#E2C892' : '#C9A56C'; g.fillRect(px, py, 1, .5); } // aserrín
    if (!terraza) bordePasto(g, L, rng, tonos, 30);
  }
  g.globalAlpha = 1;
}

// Sombras de los edificios: la silueta de cada dibujo, inclinada y aplastada hacia abajo a la derecha (como las de
// los árboles). Se pintan todas en una capa aparte y luego se ponen de una vez, para que dos sombras que se cruzan
// no se oscurezcan más.
const SILUETAS = new WeakMap();
function silueta(fuente, f) {
  let cache = SILUETAS.get(fuente); if (!cache) SILUETAS.set(fuente, cache = new Map());
  const clave = f.fx + ',' + f.fy + ',' + f.fw + ',' + f.fh;
  if (cache.has(clave)) return cache.get(clave);
  const c = lienzo(f.fw, f.fh), g = c.getContext('2d');
  g.drawImage(fuente, f.fx, f.fy, f.fw, f.fh, 0, 0, f.fw, f.fh);
  g.globalCompositeOperation = 'source-in'; g.fillStyle = '#000'; g.fillRect(0, 0, f.fw, f.fh);
  cache.set(clave, c); return c;
}
let CAPA = null;
export function sombrasObras(g, lista, fuente, k, esc) {
  if (!lista || !lista.length || !fuente) return;
  const w = Math.ceil(k.w * esc), hh = Math.ceil(k.h * esc);
  if (!CAPA || CAPA.width < w || CAPA.height < hh) CAPA = lienzo(Math.max(w, CAPA ? CAPA.width : 0), Math.max(hh, CAPA ? CAPA.height : 0));
  const c = CAPA.getContext('2d');
  c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, w + 2, hh + 2);
  for (const f of lista) {
    const sil = silueta(fuente, f);
    c.setTransform(esc, 0, 0, esc, -k.x * esc, -k.y * esc);
    c.translate(f.x, f.y); c.transform(1, 0, -SOMBRA.x * f.largo, -SOMBRA.y * f.largo, 0, 0); c.scale(f.flip ? -f.s : f.s, f.s);
    // Borde suave: varias copias apenas corridas (sin filtros, que no todos los celulares tienen).
    for (const [dx, dy, al] of [[0, 0, .6], [-1.2, 0, .25], [1.2, 0, .25], [0, -1.5, .25]]) { c.globalAlpha = al; c.drawImage(sil, -(f.flip ? f.fw - f.ax : f.ax) + dx / f.s, -f.ay + dy / f.s); }
  }
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1;
  c.globalCompositeOperation = 'source-in'; c.fillStyle = SOMBRA.color; c.fillRect(0, 0, w, hh); c.globalCompositeOperation = 'source-over';
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = SOMBRA.a * .78; g.drawImage(CAPA, 0, 0, w, hh, 0, 0, w, hh); g.restore();
}
