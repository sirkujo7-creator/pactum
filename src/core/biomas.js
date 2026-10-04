// Biomas que cambian (fase 10, paso 3): desde el año 50 el clima se calienta y los pisos térmicos suben (más rápido
// si el ambiente está mal: más emisiones). Con ellos se mueven los cultivos (pisoTermico en fincas.js usa la
// subida), el páramo se encoge y el glaciar del Nevado se derrite: primero hay más agua por el deshielo y después
// menos. Solo en el terreno en acuarela.
import { C } from './contenido.js';
import { clamp } from './azar.js';
import { fincasActivas, alturasTerreno, subidaPisos } from './fincas.js';

const K = () => C.BIOMAS;
export function biomasActivos(S) { return fincasActivas(S) && !!C.BIOMAS; }
function estado(S) { if (!S.pisos) S.pisos = { subida: 0 }; return S.pisos; }
// Casillas de nieve y de páramo con la subida de hoy (comparadas con las del comienzo).
function contar(S, sub) {
  const L = K().limites, a = alturasTerreno(S);
  let nieve = 0, paramo = 0;
  // El páramo solo pierde por abajo (subir hacia la roca le tomaría siglos); el glaciar solo se derrite.
  a.h.forEach((h0, i) => { const h = h0 - sub; if (h > L.nieve) nieve++; if (h0 > L.paramo && h0 <= L.roca && a.pend[i] <= 2.4 && h > L.paramo) paramo++; });
  return { nieve, paramo };
}
// Lo que queda de glaciar y de páramo (1 = como al comienzo). Se guarda en memoria mientras la subida no cambie.
const MEMO = new WeakMap();
function quedan(S) {
  const sub = subidaPisos(S), m = MEMO.get(S);
  if (m && m.sub === sub && m.mapa === S.map) return m;
  const c0 = contar(S, 0), c1 = sub ? contar(S, sub) : c0;
  // Si el glaciar no cae dentro del territorio (solo se ve el Nevado al fondo), se derrite con la subida misma.
  const r = { sub, mapa: S.map, g: c0.nieve ? c1.nieve / c0.nieve : Math.max(0, 1 - sub / K().sinNieve), p: c0.paramo ? Math.min(1, c1.paramo / c0.paramo) : 1 };
  MEMO.set(S, r); return r;
}
export function glaciar(S) { return biomasActivos(S) ? quedan(S).g : 1; }
export function paramoQueda(S) { return biomasActivos(S) ? quedan(S).p : 1; }
// Factor del agua por el clima: el deshielo suma mientras el glaciar se derrite; perder páramo y glaciar resta.
export function factorAguaClima(S) {
  if (!biomasActivos(S) || !subidaPisos(S)) return 1;
  const A = K().agua, g = glaciar(S), p = paramoQueda(S);
  const deshielo = g > .15 && g < .95 ? A.deshielo : 0;
  return clamp(1 + deshielo - A.perdidaParamo * (1 - p) - (g <= .15 ? A.sinGlaciar : 0), A.minimo, 1.2);
}
// Cierre del año: sube la temperatura y llegan los avisos (tarjetas en S.biomasEv).
export function biomasDelAnio(S) {
  if (!biomasActivos(S) || S.year < K().desde) return [];
  const B = K(), E = estado(S), T = B.textos, news = [], ev = [];
  const antes = { g: glaciar(S), p: paramoQueda(S) };
  if (!E.empezo) { E.empezo = S.year; news.push(T.empieza); ev.push('empieza'); }
  const sucio = clamp((B.subida.ambienteLimpio - S.env) / B.subida.ambienteLimpio, 0, 1);
  E.subida = Math.round((E.subida + B.subida.base + B.subida.porEmisiones * sucio) * 1000) / 1000;
  const g = glaciar(S), p = paramoQueda(S);
  if (antes.g >= .5 && g < .5) { news.push(T.glaciarMitad); ev.push('glaciarMitad'); }
  if (antes.g >= .1 && g < .1) { news.push(T.glaciarSeVa); ev.push('glaciarSeVa'); }
  if (antes.p >= .75 && p < .75) { news.push(T.paramo); ev.push('paramo'); }
  if (ev.length) S.biomasEv = ev;
  return news;
}
