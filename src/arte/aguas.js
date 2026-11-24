// Agua quieta y agua que corre (pulido visual, pedido de Juan): madreviejas y lagunas en lo bajo y plano cerca del
// río, lagunas del páramo, quebradas que bajan de la montaña al río siguiendo la pendiente, lodo en las orillas
// donde bebe el ganado y charcos en los potreros que dependen del clima. Es solo pintura del terreno: si se
// construye encima, la laguna se drena y el tramo de quebrada desaparece. Los árboles no nacen en el agua.
import { mulberry, clamp, mix, shade } from './acuarela.js';
import { P } from './iso.js';

const suave = x => x * x * (3 - 2 * x);

// Lagos y quebradas del territorio (se calculan una vez por terreno).
export function aguasDe(T) {
  if (T._aguas) return T._aguas;
  const N = T.N, R = mulberry(T.seed * 17 + 3), lagos = [], quebradas = [];
  // Madreviejas: casillas bajas, planas y húmedas a cierta distancia del río; se elige por ruido, separadas.
  const cand = T.tiles.filter(t => ['galeria', 'potrero', 'arrozal', 'seco', 'ladera'].includes(t.b) && t.h < (t.b === 'ladera' ? 4.2 : 2.6) && t.slope < (t.b === 'ladera' ? .4 : .7) && t.d > 2 && t.d < 8 && t.r > 1 && t.c > 1 && t.r < N - 2 && t.c < N - 2)
    .map(t => ({ t, v: T.vary(t.c / 1.7 + 61, t.r / 1.7 + 19) + (t.b === 'seco' ? -.25 : 0) })).sort((a, b) => b.v - a.v);
  const hum = 2 + (R() < .5 ? 1 : 0);
  for (const { t } of cand) {
    if (lagos.length >= hum) break;
    if (lagos.some(l => Math.hypot(l.r - t.r, l.c - t.c) < 6)) continue;
    lagos.push({ r: t.r + .5, c: t.c + .5, rx: .8 + R() * .55, ry: .55 + R() * .35, giro: R() * Math.PI, paramo: false, semilla: Math.floor(R() * 1e6) });
  }
  // Lagunas del páramo.
  const altas = T.tiles.filter(t => t.b === 'paramo' && t.slope < .7 && t.r > 0 && t.c > 0).map(t => ({ t, v: T.vary(t.c / 1.3 + 5, t.r / 1.3 + 88) })).sort((a, b) => b.v - a.v);
  for (const { t } of altas) {
    if (lagos.filter(l => l.paramo).length >= 2) break;
    if (lagos.some(l => Math.hypot(l.r - t.r, l.c - t.c) < 5)) continue;
    lagos.push({ r: t.r + .5, c: t.c + .5, rx: .55 + R() * .35, ry: .4 + R() * .25, giro: R() * Math.PI, paramo: true, semilla: Math.floor(R() * 1e6) });
  }
  // Quebradas: nacen arriba (montaña o bosque de niebla) y bajan por la mayor pendiente hasta el río.
  const nac = T.tiles.filter(t => t.h > 4.2 && t.h < 8 && t.r > 0 && t.c > 0 && t.r < N - 1 && t.c < N - 1).map(t => ({ t, v: T.vary(t.c / 2.1 + 400, t.r / 2.1 + 17) })).sort((a, b) => b.v - a.v);
  for (const { t } of nac) {
    if (quebradas.length >= 3) break;
    if (quebradas.some(q => Math.hypot(q[0].r - t.r, q[0].c - t.c) < 7)) continue;
    let r = t.r + .5, c = t.c + .5; const L = [{ r, c }];
    for (let k = 0; k < 400; k++) {
      const e = .15, gx = (T.hf(r, clamp(c + e, 0, N)) - T.hf(r, clamp(c - e, 0, N))) / (2 * e), gy = (T.hf(clamp(r + e, 0, N), c) - T.hf(clamp(r - e, 0, N), c)) / (2 * e);
      // Baja por la pendiente; donde es plana, sigue hacia el río; con un serpenteo suave.
      let dr = -gy, dc = -gx; const m = Math.hypot(dr, dc);
      const s = (c - r) / N, haciaRio = Math.sign(T.riverMid(s) - (r + c));
      if (m < .15) { dr = haciaRio; dc = haciaRio; } else { dr /= m; dc /= m; dr = dr * .8 + haciaRio * .2; dc = dc * .8 + haciaRio * .2; }
      const w = (T.vary(c / .7 + 9, r / .7 + 3) - .5) * 1.6 + (T.vary(c / .3 + 41, r / .3 + 7) - .5) * 1.4, n2 = Math.hypot(dr, dc) || 1; // serpentea a dos escalas
      r += (dr / n2 + dc / n2 * w * .5) * .2; c += (dc / n2 - dr / n2 * w * .5) * .2;
      if (r < 0 || c < 0 || r > N || c > N) break;
      L.push({ r, c });
      if (T.riverD(r, c) < 1.1) break;
    }
    if (L.length > 30 && T.riverD(L[L.length - 1].r, L[L.length - 1].c) < 1.3) quebradas.push(L);
  }
  return (T._aguas = { lagos, quebradas });
}

// ¿El punto (en filas y columnas) cae en un lago o en una quebrada? (para no poner árboles ahí)
export function enAgua(T, r, c, margen = .2) {
  const { lagos, quebradas } = aguasDe(T);
  for (const l of lagos) if (dentroLago(l, r, c, margen)) return true;
  for (const q of quebradas) for (let k = 0; k < q.length; k += 2) if (Math.hypot(q[k].r - r, q[k].c - c) < .18 + margen) return true;
  return false;
}
function dentroLago(l, r, c, m = 0) {
  const dr = r - l.r, dc = c - l.c, co = Math.cos(l.giro), si = Math.sin(l.giro), u = dr * co + dc * si, v = -dr * si + dc * co;
  return (u / (l.rx + m)) ** 2 + (v / (l.ry + m)) ** 2 < 1;
}
// Orilla irregular del lago: radio por ángulo con ruido.
function orilla(T, l, f, sal = 0) {
  // Cada anillo con su propio ruido (sal): así lodo, orilla y fondo no son anillos parejos como de piscina.
  const R = mulberry(l.semilla), R2 = mulberry(l.semilla + sal * 7919), pts = [], n = 34, ruido = []; for (let k = 0; k < n; k++) ruido.push(.8 + R() * .32 + (sal ? (R2() - .5) * .3 : 0));
  for (let k = 0; k < n; k++) {
    const a = k / n * Math.PI * 2, q = (ruido[k] + ruido[(k + 1) % n] + ruido[(k + n - 1) % n]) / 3 * f, u = Math.cos(a) * l.rx * q, v = Math.sin(a) * l.ry * q;
    const r = l.r + u * Math.cos(l.giro) - v * Math.sin(l.giro), c = l.c + u * Math.sin(l.giro) + v * Math.cos(l.giro);
    pts.push(P(r, c, T.hf(l.r, l.c) - .02));
  }
  return pts;
}
const trazo = (g, pts) => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); };
function hojaJunco(g, x, y, h, a) { g.moveTo(x - .35, y); g.lineTo(x + Math.sin(a) * h, y - Math.cos(a) * h); g.lineTo(x + .35, y); g.closePath(); }

// Pinta lagos, quebradas, lodo de orilla y charcos de las casillas del sector k (el llamador recorta a su zona).
export function pintarAguas(g, T, k, mapa, dry) {
  const N = T.N, { lagos, quebradas } = aguasDe(T), dentro = (r, c, m = 2) => r >= k.r0 - m && r <= k.r1 + m && c >= k.c0 - m && c <= k.c1 + m;
  const libre = (r, c) => { const R = Math.floor(r), C = Math.floor(c); if (R < 0 || C < 0 || R >= N || C >= N) return true; const x = mapa && mapa[R * N + C]; return !x || (!x.b && x.pt === undefined && !(x.mk && x.mk.g)); };
  // Quebradas: orilla húmeda, lodo, agua que se ensancha aguas abajo, brillos y piedras.
  for (const q of quebradas) {
    if (!q.some(p => dentro(p.r, p.c))) continue;
    const tramos = []; let actual = [];
    q.forEach((p, i) => { if (libre(p.r, p.c)) actual.push({ ...p, i }); else { if (actual.length > 1) tramos.push(actual); actual = []; } });
    if (actual.length > 1) tramos.push(actual);
    const R = mulberry(q.length * 31 + Math.round(q[0].r * 97));
    for (const L0 of tramos) {
      // Más puntos (4 por tramo) para que la orilla sea curva y mordida, no de segmentos rectos.
      const L = []; for (let j = 0; j < L0.length - 1; j++) for (let u = 0; u < 4; u++) { const a = L0[j], b = L0[j + 1], f = u / 4; L.push({ r: a.r + (b.r - a.r) * f, c: a.c + (b.c - a.c) * f, i: a.i + (b.i - a.i) * f }); }
      L.push(L0[L0.length - 1]);
      // Centro de la quebrada en pantalla y su perpendicular (para los juncos y las piedras de más abajo).
      const C0 = L.map(p => P(p.r, p.c, T.hf(clamp(p.r, 0, N), clamp(p.c, 0, N)))), n = C0.length;
      if (n < 2) continue;
      const nor = C0.map((p, j) => { const a = C0[Math.max(0, j - 1)], b = C0[Math.min(n - 1, j + 1)], dx = b[0] - a[0], dy = b[1] - a[1], m = Math.hypot(dx, dy) || 1; return [-dy / m, dx / m]; });
      const ruido = (j, sal) => .3 + .9 * T.vary((L[j].i + sal * 37) * .13, sal * 1.7) + .55 * T.vary((L[j].i + sal * 53) * .45, sal * 2.9);
      // Paso 3 de la fase visual: las orillas se abren en el terreno (filas y columnas), no en la pantalla, con un
      // ancho que cambia mucho: pozos, recodos anchos y tramos donde el agua corre angosta entre piedras.
      const nw = L.map((p, j) => { const a = L[Math.max(0, j - 1)], b = L[Math.min(n - 1, j + 1)], dr = b.r - a.r, dc = b.c - a.c, m = Math.hypot(dr, dc) || 1; return [-dc / m, dr / m]; });
      const ancho = (j, sal) => { const f = L[j].i / q.length, v1 = T.vary((L[j].i + sal * 41) * .28, sal * 1.3), v2 = T.vary((L[j].i + sal * 29) * .9, sal * 3.7); return (.04 + .07 * f) * (.2 + 2.4 * v1 * v1 + .7 * v2); };
      const banda = (k, sal) => { const izq = [], der = []; for (let j = 0; j < n; j++) { const p = L[j], [nr, nc] = nw[j], h = T.hf(clamp(p.r, 0, N), clamp(p.c, 0, N)), wa = ancho(j, sal) * k, wb = ancho(j, sal + 7) * k; izq.push(P(p.r + nr * wa, p.c + nc * wa, h)); der.push(P(p.r - nr * wb, p.c - nc * wb, h)); } return [...izq, ...der.reverse()]; };
      const capa = (pts, col, al) => { g.globalAlpha = al; g.fillStyle = col; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill(); };
      capa(banda(2.2, 1), mix('#4E6A34', '#7A7040', dry), .18);   // pasto húmedo
      capa(banda(1.5, 2), mix('#7A6A4C', '#8A7656', dry), .25);   // barro de la orilla, a ratos
      capa(banda(1.2, 3), mix('#CDBB92', '#D8C79C', dry), .4);  // arena y cascajo
      capa(banda(1, 4), mix('#84AEA8', '#97B2A2', dry), .95);     // agua baja
      capa(banda(.55, 6), mix('#5F92A0', '#7E9E98', dry), .8);    // pozos hondos
      // Brillos cortos y espuma donde hay piedras (no una línea continua).
      for (let j = 1; j < n - 1; j++) {
        if (R() < .07) { const [x, y] = C0[j]; g.globalAlpha = .7; g.fillStyle = '#E2EEEE'; g.fillRect(x - .9 - R(), y - .4, 1.6 + R() * 1.4, .35); }
        if (R() < .03) { // piedra en el agua con su espuma
          const [x, y] = C0[j], w = .9 + R() * 1.1;
          g.globalAlpha = .9; g.fillStyle = '#F2F6F4'; g.beginPath(); g.ellipse(x + .6, y + .3, w * 1.3, w * .45, 0, 0, 7); g.fill();
          g.globalAlpha = 1; g.fillStyle = '#8E867A'; g.beginPath(); g.moveTo(x - w, y); g.lineTo(x - w * .2, y - w * .7); g.lineTo(x + w, y - .1); g.closePath(); g.fill();
          g.fillStyle = '#B9B2A4'; g.beginPath(); g.moveTo(x - w, y); g.lineTo(x - w * .2, y - w * .7); g.lineTo(x - w * .1, y - .1); g.closePath(); g.fill();
        }
      }
      // Pasto y juncos que tapan el borde a lado y lado, y piedras secas en la orilla.
      for (const col of [mix('#3F6A2E', '#7E7C3E', dry), mix('#6E9A44', '#A99A58', dry)]) {
        g.globalAlpha = 1; g.fillStyle = col; g.beginPath();
        for (let j = 0; j < n; j++) if (R() < .15) { const lado = R() < .5 ? 1 : -1, f = L[j].i / q.length, w = (1.1 + 1.3 * f) * ruido(j, lado > 0 ? 3 : 8), [nx, ny] = nor[j], x = C0[j][0] + nx * w * lado, y = C0[j][1] + ny * w * lado; for (let m = 0; m < 3; m++) hojaJunco(g, x + (R() - .5) * 1.5, y + (R() - .3), 1.8 + R() * 2.4, (R() - .5) * 1); }
        g.fill();
      }
      for (let j = 2; j < n; j += 14) if (R() < .5) {
        const lado = R() < .5 ? 1 : -1, [nx, ny] = nor[j], w = .7 + R() * 1, o = 2.6 + L[j].i / q.length * 2.4, x = C0[j][0] + nx * o * lado, y = C0[j][1] + ny * o * lado;
        g.globalAlpha = .3; g.fillStyle = '#2E281E'; g.fillRect(x, y + .4, w * 1.6, w * .45);
        g.globalAlpha = 1; g.fillStyle = R() < .5 ? '#9C9384' : '#B2AA9A'; g.beginPath(); g.moveTo(x - w, y); g.lineTo(x - w * .3, y - w * .7); g.lineTo(x + w * .8, y - w * .4); g.lineTo(x + w, y + .3); g.closePath(); g.fill();
      }
    }
  }
  // Lagos y lagunas: lodo alrededor, agua más honda en el centro, reflejo del cielo, plantas flotantes y juncos.
  for (const l of lagos) {
    if (!dentro(l.r, l.c, 3)) continue;
    let ocupado = false; for (let r = Math.floor(l.r - l.rx - .5); r <= l.r + l.rx + .5; r++) for (let c = Math.floor(l.c - l.rx - .5); c <= l.c + l.rx + .5; c++) if (dentroLago(l, r + .5, c + .5, .1) && !libre(r + .5, c + .5)) ocupado = true;
    if (ocupado) continue; // se construyó encima: la laguna se drenó
    const R = mulberry(l.semilla + 7), seca = dry > .7 && !l.paramo, f = seca ? .6 : 1 - dry * .25;
    g.globalAlpha = .55; g.fillStyle = mix('#7A6446', '#A08A62', dry); trazo(g, orilla(T, l, f * 1.36 + .1, 3)); g.fill();   // lodo
    g.globalAlpha = .7; g.fillStyle = mix('#5E4E36', '#8C7656', dry); trazo(g, orilla(T, l, f * 1.1 + .04, 5)); g.fill();    // barro mojado
    for (let j = 0; j < 4; j++) { const b = orilla(T, l, f * 1.15, 20 + j), q = b[Math.floor(R() * b.length)], w = 3 + R() * 4; g.globalAlpha = .45; g.fillStyle = mix('#6E5A3C', '#9C8660', dry); g.beginPath(); for (let m = 0; m < 8; m++) { const a = m / 8 * 6.283, z = .7 + R() * .5; m ? g.lineTo(q[0] + Math.cos(a) * w * z, q[1] + Math.sin(a) * w * .45 * z) : g.moveTo(q[0] + Math.cos(a) * w * z, q[1] + Math.sin(a) * w * .45 * z); } g.closePath(); g.fill(); } // lenguas de barro
    const agua = l.paramo ? ['#6F98A8', '#557C8E', '#43677A'] : ['#6E9AA0', '#55828A', '#3F6872'];
    g.globalAlpha = 1; g.fillStyle = agua[0]; trazo(g, orilla(T, l, f)); g.fill();
    g.globalAlpha = .75; g.fillStyle = agua[1]; trazo(g, orilla(T, l, f * .74, 9)); g.fill();
    g.globalAlpha = .6; g.fillStyle = agua[2]; trazo(g, orilla(T, l, f * .45, 13)); g.fill(); g.globalAlpha = 1;
    // Reflejo del cielo: franjas claras del lado de atrás (arriba a la izquierda).
    const [cx, cy] = P(l.r, l.c, T.hf(l.r, l.c)), w = l.rx * 32 * f;
    g.fillStyle = '#D6E6E8'; g.globalAlpha = .5; for (let j = 0; j < 3; j++) { const y = cy - w * .28 + j * 2.2, x = cx - w * .4 + j * 3; g.beginPath(); g.moveTo(x - w * .25, y); g.lineTo(x + w * .3, y - .4); g.lineTo(x + w * .25, y + .5); g.lineTo(x - w * .2, y + .6); g.closePath(); g.fill(); }
    // Plantas flotantes (no en el páramo): hojas con su muesca, verdes, alguna flor blanca.
    if (!l.paramo && !seca) for (let j = 0; j < 9; j++) {
      const a = R() * 6.28, d = .3 + R() * .5, r = l.r + Math.sin(a) * l.ry * d * f, c = l.c + Math.cos(a) * l.rx * d * f, [x, y] = P(r, c, T.hf(l.r, l.c)), s = 1 + R() * .8;
      g.globalAlpha = 1; g.fillStyle = R() < .5 ? '#5E8A3E' : '#76A04A'; g.beginPath(); g.moveTo(x, y); g.arc(x, y, s, .4, 5.9); g.closePath(); g.fill();
      if (R() < .2) { g.fillStyle = '#F4F0E6'; g.fillRect(x - .5, y - .9, 1, 1); }
    }
    // Juncos y pasto alto en la orilla.
    const borde = orilla(T, l, f * 1.08);
    g.globalAlpha = 1;
    for (const col of l.paramo ? ['#6E7A4E', '#9AA46A'] : ['#3F6A2E', '#6E9A44', '#A9A45E']) {
      g.fillStyle = col; g.beginPath();
      for (let j = 0; j < borde.length; j++) if (R() < .45) { const [x, y] = borde[j]; for (let q = 0; q < 3; q++) hojaJunco(g, x + (R() - .5) * 2.4, y + (R() - .5), 3 + R() * 3.5, (R() - .5) * .8); }
      g.fill();
    }
    if (!l.paramo) { g.fillStyle = '#6E4A2E'; for (let j = 0; j < 6; j++) { const [x, y] = borde[Math.floor(R() * borde.length)]; g.fillRect(x - .4, y - 5, .8, 2.2); } } // espadañas
  }
  g.globalAlpha = 1;
}

// Lodo pisoteado en la orilla del río (donde baja el ganado a beber), con huellas.
export function lodoOrilla(g, T, t, rng, dry, pt) {
  if (rng() > .35) return;
  const [x, y] = pt(.2 + rng() * .6, .2 + rng() * .6), w = 6 + rng() * 6, pts = [];
  for (let k = 0; k < 12; k++) { const a = k / 12 * 6.283, q = .75 + rng() * .4; pts.push([x + Math.cos(a) * w * q, y + Math.sin(a) * w * .42 * q]); }
  g.globalAlpha = .5; g.fillStyle = mix('#6A5638', '#9A845E', dry); trazo(g, pts); g.fill();
  g.globalAlpha = .55; g.fillStyle = mix('#54452E', '#86704E', dry); trazo(g, pts.map(([px, py]) => [x + (px - x) * .6, y + (py - y) * .6])); g.fill();
  g.globalAlpha = .6; g.fillStyle = '#3E3222'; for (let k = 0; k < 7; k++) { const hx = x + (rng() - .5) * w * 1.2, hy = y + (rng() - .5) * w * .5; g.fillRect(hx, hy, .7, .5); g.fillRect(hx + .9, hy, .7, .5); } // huellas de pezuña
  if (dry < .45 && rng() < .6) { g.globalAlpha = .8; g.fillStyle = '#7FA2A8'; trazo(g, pts.map(([px, py]) => [x + (px - x) * .3 + 1, y + (py - y) * .3])); g.fill(); g.globalAlpha = .5; g.fillStyle = '#D6E6E8'; g.fillRect(x - 1, y - .5, 2.4, .4); }
  g.globalAlpha = 1;
}
