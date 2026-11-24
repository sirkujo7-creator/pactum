// Habitantes con vida propia (pedido de Juan: «¿se puede tener nombre para cada poblador y una ficha por habitante?»).
// Solo en acuarela. Cada habitante del pueblo (S.pop) tiene nombre según la época en que nació, dos apellidos, familia,
// casa, clase y oficio, y vive su vida año tras año: crece, va a la escuela, trabaja, se casa, tiene hijos, envejece y
// muere (de viejo o por lo que pasa en el pueblo: la avenida, la epidemia, la guerra…), o se va, o llega de afuera.
// Lo que vivió el pueblo queda en S.hab.hx y cada biografía lo recoge según los años que vivió. Es solo historia: el
// número de habitantes lo sigue mandando la lógica de siempre (S.pop); aquí solo se ponen nombres y vidas.
// No usa el azar del juego (tiene su propia semilla), así el balance no cambia.
import { C } from './contenido.js';
import { climaActivo } from './clima.js';
import { mulberry } from './azar.js';
import { society } from './sociedad.js';

const K = () => C.HAB;
export const habitantesActivos = S => climaActivo(S) && !!K();
const MAX_MUERTOS = 400, MAX_EV = 10;
const azarDe = (S, k = 0) => mulberry(((S.seed || 1) * 7919 + S.year * 131 + k * 977) >>> 0);
const tomar = (R, L) => L[Math.floor(R() * L.length)];
const grupo = y => y < 35 ? 'antiguos' : y < 70 ? 'medios' : 'modernos';
export const edadDe = (S, h) => (h.m ? h.m.y : h.f ? h.f.y : S.year) - h.y;
export const vivos = S => (S.hab ? S.hab.L.filter(h => !h.m && !h.f) : []);
export const nombreCompleto = h => `${h.n} ${h.a}`;

function casas(S) { return S.map.map((x, i) => x.b === 'casa' && !x.ob ? i : -1).filter(i => i >= 0); }
// Proporciones de clase que pide la sociedad real (adultos).
function metas(S) {
  const so = society(S), t = Math.max(1, so.camp + so.art + so.el + (so.un || 0));
  return { c: so.camp / t, a: so.art / t, e: so.el / t, u: (so.un || 0) / t };
}
function oficioDe(h) {
  const O = { c: ['campesino', 'campesina'], a: ['artesano', 'artesana'], e: ['comerciante', 'comerciante'], u: ['sin empleo', 'sin empleo'] }[h.c];
  return O ? O[h.s === 'm' ? 1 : 0] : '';
}
function nuevo(S, R, op = {}) {
  const H = S.hab, s = op.s || (R() < .5 ? 'h' : 'm'), y = op.y ?? S.year, N = K().nombres[grupo(y)][s];
  const a = op.a || `${tomar(R, K().apellidos)} ${tomar(R, K().apellidos)}`;
  const h = { i: H.sig++, n: tomar(R, N), a, s, y, k: op.k ?? -1, ev: [] };
  if (op.pa) h.pa = op.pa;
  h.su = Math.floor(R() * 6);
  H.L.push(h); return h;
}
const ev = (h, y, t, x) => { h.ev.push(x === undefined ? [y, t] : [y, t, x]); if (h.ev.length > MAX_EV) h.ev.splice(1, 1); };
function adulto(S, h, R, M) {
  const vv = vivos(S).filter(x => S.year - x.y >= 18 && x !== h), n = Math.max(1, vv.length), cuenta = { c: 0, a: 0, e: 0, u: 0 };
  for (const x of vv) if (x.c) cuenta[x.c]++;
  let mejor = 'c', falta = -1e9; for (const k of ['c', 'a', 'e', 'u']) { const f = M[k] - cuenta[k] / n + R() * .05; if (f > falta) { falta = f; mejor = k; } }
  h.c = mejor; ev(h, S.year, 'adulto', oficioDe(h));
}

// Crea los habitantes la primera vez (partida nueva o guardada).
export function iniciarHabitantes(S) {
  if (!habitantesActivos(S) || S.hab) return S.hab || null;
  S.hab = { sig: 1, L: [], hx: [], q: [], et: S.stage };
  const R = azarDe(S, 1), M = metas(S), C0 = casas(S);
  let n = 0, fam = 0;
  while (n < S.pop) { // por familias: una pareja y unos hijos
    const ap = [tomar(R, K().apellidos), tomar(R, K().apellidos)], casa = C0.length ? C0[fam % C0.length] : -1, edadP = 22 + Math.floor(R() * 35);
    const p = nuevo(S, R, { s: 'h', y: S.year - edadP, a: `${ap[0]} ${tomar(R, K().apellidos)}`, k: casa });
    const m = n + 1 < S.pop ? nuevo(S, R, { s: 'm', y: S.year - edadP + Math.floor(R() * 6) - 2, a: `${ap[1]} ${tomar(R, K().apellidos)}`, k: casa }) : null;
    for (const h of [p, m]) if (h) { adulto(S, h, R, M); h.ev = [[S.year, 'fundador']]; }
    if (m) { p.p = m.i; m.p = p.i; }
    n += m ? 2 : 1;
    const hijos = Math.floor(R() * 4);
    for (let k = 0; k < hijos && n < S.pop; k++, n++) {
      const e = Math.floor(R() * Math.min(17, edadP - 18)), hj = nuevo(S, R, { y: S.year - e, a: `${p.a.split(' ')[0]} ${m ? m.a.split(' ')[0] : tomar(R, K().apellidos)}`, k: casa, pa: [p.i, m ? m.i : 0] });
      hj.ev = [[S.year, 'fundador']]; (p.h = p.h || []).push(hj.i); if (m) (m.h = m.h || []).push(hj.i);
    }
    fam++;
  }
  return S.hab;
}

// Lo que mata la lógica (avenida, epidemia, guerra…) se anota aquí y se reparte entre los habitantes al cerrar el año.
export function anotarMuertes(S, n, causa) {
  if (!habitantesActivos(S) || !S.hab || !(n > 0)) return;
  S.hab.q.push([n, causa]);
}
// Hechos del pueblo que quedan en las biografías de quienes los vivieron.
export function anotarHecho(S, clave) {
  if (!habitantesActivos(S) || !S.hab) return;
  const hx = S.hab.hx; if (!hx.some(([y, k]) => y === S.year && k === clave)) hx.push([S.year, clave]);
}

// Cierre del año: muertes anotadas y naturales, matrimonios, nacimientos, llegadas y partidas para que los vivos
// sean exactamente S.pop; los niños que cumplen 18 eligen su oficio. Devuelve noticias (muertes de conocidos).
export function habitantesDelAnio(S) {
  if (!habitantesActivos(S)) return [];
  iniciarHabitantes(S);
  const H = S.hab, R = azarDe(S, 2), news = [], T = K().textos, M = metas(S), C0 = casas(S);
  const morir = (h, causa) => {
    h.m = { y: S.year, c: causa };
    if (h.p) { const pj = H.L.find(x => x.i === h.p); if (pj && !pj.m) { ev(pj, S.year, 'viudo', h.i); delete pj.p; } }
    if (h.co) news.push(T.muerteConocido.replace('{nombre}', nombreCompleto(h)).replace('{oficio}', oficioHabitante(S, h)).replace('{causa}', K().causas[causa] || causa).replace('{edad}', edadDe(S, h)));
  };
  // Hechos del año: cambio de etapa.
  if (S.stage > (H.et ?? 0)) { anotarHecho(S, 'etapa' + S.stage); H.et = S.stage; }
  // 1. Muertes que anotó la lógica (los mayores y los más expuestos primero, pero no siempre).
  for (const [n, causa] of H.q) {
    if (K().hechos[causa]) anotarHecho(S, causa); // solo los hechos grandes del pueblo entran en las biografías
    const L = vivos(S).sort((a, b) => (causa === 'epidemia' || causa === 'hambre' ? Math.abs(edadDe(S, b) - 40) - Math.abs(edadDe(S, a) - 40) : 0) + (R() - .5) * 40);
    for (const h of L.slice(0, n)) morir(h, causa);
  }
  H.q = [];
  // 2. Vejez y enfermedad.
  for (const h of vivos(S)) { const e = edadDe(S, h); if (e > 62 && R() < (e - 58) / 220) morir(h, e > 75 ? 'vejez' : 'enfermedad'); }
  // 3. Los que cumplen 18 eligen oficio; casas que ya no existen.
  const valida = new Set(C0);
  for (const h of vivos(S)) {
    if (!h.c && S.year - h.y >= 18) adulto(S, h, R, M);
    if (!valida.has(h.k)) h.k = C0.length ? C0[Math.floor(R() * C0.length)] : -1;
  }
  // 4. Matrimonios (pocos por año).
  const solos = s => vivos(S).filter(h => h.s === s && !h.p && S.year - h.y >= 20 && S.year - h.y <= 45);
  for (let k = 0; k < 2; k++) {
    const hs = solos('h'), ms = solos('m'); if (!hs.length || !ms.length || R() > .6) break;
    const a = tomar(R, hs), b = ms.sort((x, y) => Math.abs(x.y - a.y) - Math.abs(y.y - a.y))[Math.floor(R() * Math.min(3, ms.length))];
    a.p = b.i; b.p = a.i; b.k = a.k; ev(a, S.year, 'casa', b.i); ev(b, S.year, 'casa', a.i);
  }
  // 5. Que los vivos sean S.pop: nacen, llegan o se van.
  let v = vivos(S).length;
  const parejas = vivos(S).filter(h => h.s === 'm' && h.p && S.year - h.y >= 18 && S.year - h.y <= 44);
  const conflicto = !!(S.conf && S.conf.grupo && S.conf.nivel > 30);
  while (v < S.pop) {
    if (parejas.length && R() < .62) {
      const madre = tomar(R, parejas), padre = H.L.find(x => x.i === madre.p);
      const hj = nuevo(S, R, { y: S.year, a: `${(padre ? padre.a : madre.a).split(' ')[0]} ${madre.a.split(' ')[0]}`, k: madre.k, pa: [padre ? padre.i : 0, madre.i] });
      const hermanos = new Set((madre.h || []).map(id => (habitante(S, id) || {}).n)); for (let t = 0; t < 6 && hermanos.has(hj.n); t++) hj.n = tomar(R, K().nombres[grupo(hj.y)][hj.s]); // sin hermanos con el mismo nombre
      for (const p of [madre, padre]) if (p) { (p.h = p.h || []).push(hj.i); ev(p, S.year, hj.s === 'm' ? 'hija' : 'hijo', hj.i); }
      hj.ev = [[S.year, 'nace']];
    } else {
      const como = S.year > 75 && R() < .3 ? 'migrante' : conflicto && R() < .5 ? 'desplazado' : S.year < 30 ? 'colono' : 'trabajo';
      const h = nuevo(S, R, { y: S.year - 18 - Math.floor(R() * 25), k: C0.length ? C0[Math.floor(R() * C0.length)] : -1 });
      adulto(S, h, R, M); h.ev = [[S.year, 'llega', como]];
    }
    v++;
  }
  if (v > S.pop) {
    const L = vivos(S).filter(h => S.year - h.y >= 16).sort(() => R() - .5);
    for (const h of L.slice(0, v - S.pop)) {
      const como = conflicto ? 'desplazado' : S.hap < 30 ? 'ciudad' : S.year - h.y < 25 && R() < .4 ? 'estudio' : S.year > 70 && R() < .3 ? 'exterior' : 'ciudad';
      h.f = { y: S.year, t: como }; if (h.p) { const pj = H.L.find(x => x.i === h.p); if (pj && !pj.m && !pj.f) { pj.f = { y: S.year, t: como }; } }
    }
    // Si aún sobran (niños), se van con su familia.
    const sobra = vivos(S).length - S.pop; if (sobra > 0) for (const h of vivos(S).slice(0, sobra)) h.f = { y: S.year, t: 'ciudad' };
  }
  // 6. Los que ya no están: se guardan los últimos para el padrón y el cementerio.
  const idos = H.L.filter(h => h.m || h.f);
  if (idos.length > MAX_MUERTOS) { const quitar = new Set(idos.sort((a, b) => (a.m || a.f).y - (b.m || b.f).y).slice(0, idos.length - MAX_MUERTOS).filter(h => !h.co).map(h => h.i)); H.L = H.L.filter(h => !quitar.has(h.i)); }
  return news;
}

// ---------- Lectura (para la ficha y el padrón) ----------
export const habitante = (S, id) => (S.hab ? S.hab.L.find(h => h.i === id) : null);
export function conocer(S, id) { const h = habitante(S, id); if (h) h.co = 1; }
// Biografía en frases, en orden: su llegada o nacimiento, su vida, lo que vivió el pueblo y su final.
export function biografia(S, h) {
  const T = K().textos, nom = id => { const x = habitante(S, id); return x ? nombreCompleto(x) : 'alguien que ya no está'; }, L = [];
  for (const [y, t, x] of h.ev) {
    if (t === 'fundador') L.push([y, `Año ${y}: estuvo en la fundación del pueblo${y - h.y > 0 ? `, con ${y - h.y} años` : ''}`]);
    else if (t === 'nace') L.push([y, T.nace.replace('{y}', y)]);
    else if (t === 'llega') L.push([y, T.llegoA.replace('{y}', y).replace('{como}', K().llega[x] || x)]);
    else if (t === 'casa') L.push([y, `Año ${y}: ` + T.casa.replace('{nombre}', nom(x)).replace(/^S/, 's')]);
    else if (t === 'hijo' || t === 'hija') L.push([y, `Año ${y}: ` + T[t].replace('{nombre}', nom(x)).replace(/^T/, 't')]);
    else if (t === 'adulto') L.push([y, `Año ${y}: ` + T.adulto.replace('{oficio}', x).replace(/^E/, 'e')]);
    else if (t === 'viudo') L.push([y, `Año ${y}: enviudó; murió ${nom(x)}`]);
  }
  const fin = h.m ? h.m.y : h.f ? h.f.y : S.year, inicio = h.ev[0] && h.ev[0][1] === 'llega' ? h.ev[0][0] : h.y;
  const vividos = S.hab.hx.filter(([y]) => y >= inicio && y <= fin);
  for (const [y, k] of vividos) L.push([y, `Año ${y}: vivió ${K().hechos[k] || k}`]);
  if (h.m) L.push([h.m.y, T.muere.replace('{y}', h.m.y).replace('{causa}', K().causas[h.m.c] || h.m.c).replace('{edad}', h.m.y - h.y)]);
  if (h.f) L.push([h.f.y, T.seFue.replace('{y}', h.f.y).replace('{como}', K().seVa[h.f.t] || h.f.t)]);
  return L.sort((a, b) => a[0] - b[0]).map(x => x[1]);
}
export function suenoDe(S, h) { const L = K().suenos[S.year - h.y < 18 ? 'n' : h.c || 'u'] || []; return L[h.su % L.length] || ''; }
export function familiaDe(S, h) {
  const nom = id => habitante(S, id);
  return { pareja: h.p ? nom(h.p) : null, padres: (h.pa || []).map(nom).filter(Boolean), hijos: (h.h || []).map(nom).filter(Boolean) };
}
export function oficioHabitante(S, h) { const e = edadDe(S, h); return e < 18 && !h.c ? (e >= 6 ? 'estudiante' : 'niño') : e >= 68 ? (h.s === 'm' ? 'retirada' : 'retirado') : oficioDe(h); }
// Padrón: vivos y fallecidos, filtrados por texto.
export function padron(S, q = '', fallecidos = false) {
  if (!S.hab) return [];
  const t = q.trim().toLowerCase();
  return S.hab.L.filter(h => (fallecidos ? !!h.m : !h.m && !h.f) && (!t || `${h.n} ${h.a} ${oficioHabitante(S, h)}`.toLowerCase().includes(t)))
    .sort((a, b) => fallecidos ? b.m.y - a.m.y : a.a.localeCompare(b.a) || a.n.localeCompare(b.n));
}
