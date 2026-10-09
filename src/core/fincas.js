// La finca y sus cultivos (fase 10): el campo deja de ser dos edificios (cultivo y cafetal) y pasa a ser una
// decisión. Cada finca (el edificio "cultivo") lleva en x.cv lo que siembra: pancoger, arroz, café, plátano,
// cacao, aguacate, algodón o ganadería. Cada cultivo rinde según el piso térmico de su casilla y da comida,
// dinero, empleo y un efecto en el ambiente; los de tardío rendimiento esperan años su primera cosecha
// (x.cvDesde). Solo en el terreno en acuarela; en la versión 9 todo sigue igual.
import { C } from './contenido.js';
import { climaActivo } from './clima.js';
import { lado, nearRiver } from './mundo.js';
import { terrenoDe } from './mundo.js';
import { rindeObra } from './desgaste.js';
import { precioCafe } from './economia.js';
import { factorRoya } from './ciclos.js';
import { azar, clamp } from './azar.js';
import { efectoLeyes } from './civismo.js';
import { factorTrabajo } from './sociedad.js';
import { mejoraRenta } from './mejoras.js';

const K = () => C.CULTIVOS;
export function fincasActivas(S) { return climaActivo(S) && !!C.CULTIVOS; }
export const esFinca = x => x.b === 'cultivo' || x.b === 'cafetal';
export function cultivoDe(x) { return x.cv || (x.b === 'cafetal' ? 'cafe' : 'pancoger'); }
export function datosCultivo(cv) { return K().cultivos[cv]; }
export function listaCultivos() { return Object.keys(K().cultivos); }

// ---------- Piso térmico ----------
// La altura de cada casilla sale del terreno; se calcula una vez por partida (y otra vez si el río cambia).
const ALTURAS = new WeakMap();
export function alturasTerreno(S) { return alturas(S); }
function alturas(S) {
  const dv = (S.rio && S.rio.desvios) || [], clave = `${S.seed}|${lado(S)}|${dv.length}`;
  let a = ALTURAS.get(S);
  if (!a || a.clave !== clave) { const T = terrenoDe(S, dv); a = { clave, b: T.tiles.map(t => t.b), h: T.tiles.map(t => t.h), d: T.tiles.map(t => t.d), pend: T.tiles.map(t => t.slope) }; ALTURAS.set(S, a); }
  return a;
}
// Cuánto han subido los pisos térmicos (fase 10, paso 3: el cambio climático). Por ahora no se mueven.
export function subidaPisos(S) { return (S.pisos && S.pisos.subida) || 0; }
export function pisoTermico(S, i) {
  const L = K().pisos.limites, h = alturas(S).h[i] - subidaPisos(S);
  return h > L[2] ? 'paramo' : h > L[1] ? 'frio' : h > L[0] ? 'templado' : 'calido';
}
export function nombrePiso(p) { return K().pisos.nombres[p]; }
// Riego: junto al río o cerca de su cauce.
export function tieneRiego(S, i) { return nearRiver(S, i) || alturas(S).d[i] < 3.2; }
// Suelo (fase 17, paso 3): cada casilla tiene una clase de suelo según su terreno, y cada clase sirve distinto a cada cultivo.
export const suelosActivos = S => fincasActivas(S) && !!C.SUELOS;
export function claseSuelo(S, i) {
  if (!suelosActivos(S)) return null;
  const b = alturas(S).b[i], Q = C.SUELOS.clases, base = Object.keys(Q).find(k => Q[k].biomas.includes(b)) || 'llanura';
  return base === 'llanura' && secadaPorClima(S, i) ? 'seca' : base;
}
// Cambio climático (fase 17): cuando suben los pisos térmicos, los potreros lejos del agua se vuelven tierra seca.
export function secadaPorClima(S, i) {
  if (!subidaPisos(S)) return false;
  const N = lado(S), r0 = Math.floor(i / N), c0 = i % N;
  for (let r = Math.max(0, r0 - 2); r <= Math.min(N - 1, r0 + 2); r++) for (let c = Math.max(0, c0 - 2); c <= Math.min(N - 1, c0 + 2); c++) if (S.map[r * N + c].t === 'rio') return false;
  return true;
}
export function datosSuelo(c) { return C.SUELOS.clases[c]; }
// Cuánto sirve el suelo al cultivo (0 a 1; 0 = no se da en ese suelo).
export function factorSuelo(S, i, cv) {
  const c = claseSuelo(S, i);
  if (!c) return 1;
  const f = datosSuelo(c).factores[cv];
  return f === undefined ? 1 : f;
}
// Qué tan apto es el lugar para el cultivo (0 a 1): piso térmico, riego (el arroz) y suelo.
function aptitudBase(S, i, cv) {
  const D = datosCultivo(cv);
  let a = D.pisos[pisoTermico(S, i)] || 0;
  if (D.riego && !tieneRiego(S, i)) a *= .4;
  return a;
}
export function aptitud(S, i, cv) { return aptitudBase(S, i, cv) * factorSuelo(S, i, cv); }
// Una finca ya sembrada en un suelo que no corresponde se conserva, con una penalización suave (pierde un cuarto).
export function suelaEquivocada(S, i, cv) { return suelosActivos(S) && aptitudBase(S, i, cv) > 0 && factorSuelo(S, i, cv) === 0; }
export function aptitudPuesta(S, i, cv) { return suelaEquivocada(S, i, cv) ? aptitudBase(S, i, cv) * C.SUELOS.equivocado : aptitud(S, i, cv); }
// ¿Ya da cosecha? Los cultivos de tardío rendimiento esperan sus años desde la siembra.
export function anioCosecha(S, x) { const D = datosCultivo(cultivoDe(x)); return x.cvDesde === undefined ? -999 : x.cvDesde + D.madura; }
export function produce(S, x) { return S.year >= anioCosecha(S, x); }
// Golpe de la sequía (El Niño) a los cultivos que piden mucha agua.
function factorSequia(S, D) { return D.sequia && S.clima && S.clima.fenomeno === 'nino' ? D.sequia : 1; }
// Precio de cada cultivo (1 = normal). El café sigue su mercado (bonanzas, crisis y roya); los demás, su propio
// ciclo en S.precios (fase 10, paso 2).
export function precioCultivo(S, cv) { return cv === 'cafe' ? precioCafe(S) * factorRoya(S) : (S.precios && S.precios[cv] ? S.precios[cv].p : 1); }
export function fasePrecio(S, cv) { return S.precios && S.precios[cv] ? S.precios[cv].fase : 'normal'; }

// Producción de una finca en la casilla i: { comida, renta } al año (renta antes de multiplicar por S.price).
export function produccionFinca(S, i) {
  const x = S.map[i];
  if (!esFinca(x) || x.ob) return { comida: 0, renta: 0 };
  const cv = cultivoDe(x), D = datosCultivo(cv), r = rindeObra(S, x) * (1 + mejoraRenta(x)) * aptitudPuesta(S, i, cv) * factorSequia(S, D) * (produce(S, x) ? 1 : 0);
  const riego = D.comida && nearRiver(S, i) ? K().riego : 0;
  return { comida: (D.comida + riego) * r, renta: D.renta * r * precioCultivo(S, cv) * (1 + efectoLeyes(S, 'fincas')) }; // fase 12: rasgos (colonos, cafeteros...)
}
// Empleo y efecto en el ambiente de todas las fincas.
export function empleoCampo(S) { let n = 0; S.map.forEach(x => { if (esFinca(x) && !x.ob && rindeObra(S, x)) n += datosCultivo(cultivoDe(x)).empleo; }); return n; }
export function ambienteCampo(S) { let n = 0; S.map.forEach(x => { if (esFinca(x) && !x.ob) n += datosCultivo(cultivoDe(x)).ambiente; }); return n; }
export function protegeSuelo(x) { return esFinca(x) && !!C.CULTIVOS && !!datosCultivo(cultivoDe(x)).protege; }
// Cuántas fincas hay de cada cultivo (para la canasta agrícola y los conteos).
export function canasta(S) {
  const out = Object.fromEntries(listaCultivos().map(k => [k, 0]));
  S.map.forEach(x => { if (esFinca(x) && !x.ob) out[cultivoDe(x)]++; });
  return out;
}

// ---------- Sembrar ----------
export function costoSiembra(S, cv) { return Math.round(datosCultivo(cv).siembra * S.price); }
export function puedeSembrar(S, i, cv) {
  const x = S.map[i];
  if (!fincasActivas(S) || !esFinca(x)) return 'Aquí no hay una finca.';
  if (!datosCultivo(cv)) return 'Cultivo desconocido.';
  if (x.cv === cv) return 'Ya siembra eso.';
  if (x.ob) return 'La finca aún se está construyendo.';
  if (!aptitudBase(S, i, cv)) return `No se da en tierra ${nombrePiso(pisoTermico(S, i))}.`;
  if (!aptitud(S, i, cv)) return C.SUELOS.textos.no_se_da.replace('{suelo}', datosSuelo(claseSuelo(S, i)).nombre) + ' Prueba con otro cultivo.';
  if (!x.nueva && S.gold < costoSiembra(S, cv)) return `Necesitas ${costoSiembra(S, cv)} de oro.`;
  return null;
}
// La primera siembra de una finca recién construida ya va en su costo; cambiar después cuesta la siembra.
export function sembrar(S, i, cv) {
  if (puedeSembrar(S, i, cv)) return false;
  const x = S.map[i];
  if (!x.nueva) S.gold -= costoSiembra(S, cv);
  x.cv = cv; x.cvDesde = S.year; x.b = 'cultivo'; delete x.nueva;
  S.log.unshift({ y: S.year, t: K().textos.sembrado.replace('{cultivo}', datosCultivo(cv).nombre.toLowerCase()) });
  return true;
}
// El mejor cultivo de comida o de dinero para una casilla (lo usan los robots y la sugerencia de la ficha).
export function mejorCultivo(S, i, para = 'comida') {
  let mejor = 'pancoger', v0 = -1;
  for (const cv of listaCultivos()) {
    const D = datosCultivo(cv), a = aptitud(S, i, cv), v = para === 'comida' ? (D.comida + (D.comida && nearRiver(S, i) ? K().riego : 0)) * a : D.renta * a * precioCultivo(S, cv);
    if (v > v0) { v0 = v; mejor = cv; }
  }
  return mejor;
}

// Las partidas de antes: el cafetal pasa a ser una finca de café y los cultivos, fincas de pancoger (ya maduras).
export function migrarFincas(S) {
  if (!fincasActivas(S)) return;
  S.map.forEach(x => {
    if (x.b === 'cafetal') { x.b = 'cultivo'; x.cv = 'cafe'; }
    if (x.b === 'cultivo' && !x.cv) x.cv = 'pancoger';
  });
}
// ---------- Precios con ciclos (fase 10, paso 2) ----------
// Cada año el precio se mueve un poco al azar y vuelve hacia su nivel normal (que puede subir con los años);
// a veces llega una bonanza o una crisis de varios años. El algodón tiene su auge y su desplome (El Espinal).
const normal = () => { let s = 0; for (let k = 0; k < 6; k++) s += azar(); return (s - 3) / Math.sqrt(.5); };
function nivelBase(S, cv) {
  const M = datosCultivo(cv).mercado, A = M.auge;
  let b = 1 + (M.tendencia && S.year >= (M.desde || 0) ? M.tendencia * (S.year - (M.desde || 0)) : 0);
  if (A && S.year >= A.desde + A.anios) b = A.despues;
  return b;
}
export function preciosDelAnio(S) {
  const news = [], ev = [], T = K().textos;
  if (!S.precios) S.precios = {};
  const tiene = canasta(S);
  for (const cv of listaCultivos()) {
    const M = datosCultivo(cv).mercado;
    if (!M || cv === 'cafe') continue;
    const P = S.precios[cv] || (S.precios[cv] = { p: 1, fase: 'normal', hasta: 0 });
    const base = nivelBase(S, cv), A = M.auge;
    // Auge del algodón: un precio altísimo durante unos años y después el desplome.
    if (A && S.year === A.desde) { P.fase = 'auge'; P.hasta = S.year + A.anios - 1; P.p = A.factor; news.push(T.auge.replace('{precio}', A.factor.toLocaleString('es-CO'))); ev.push({ tipo: 'auge', cv }); continue; }
    if (A && S.year === A.desde + A.anios) { P.fase = 'normal'; P.p = A.despues; news.push(T.desplome); ev.push({ tipo: 'desplome', cv }); continue; }
    if (P.fase !== 'normal' && S.year <= P.hasta) continue; // la bonanza o la crisis siguen
    if (P.fase !== 'normal') P.fase = 'normal';
    P.p = clamp(P.p * Math.exp(normal() * M.volatilidad) + (base - P.p) * M.regreso, .3, 2.5);
    const r = azar(), pb = M.bonanza ? M.bonanza.prob : 0, pc = M.crisis ? M.crisis.prob : 0;
    const fase = r < pb ? 'bonanza' : r < pb + pc ? 'crisis' : null;
    if (fase) {
      const F = M[fase];
      P.fase = fase; P.hasta = S.year + F.anios - 1; P.p = clamp(base * F.factor, .3, 2.5);
      // Solo se avisa si el jugador siembra ese cultivo.
      if (tiene[cv]) { news.push(T[fase].replace('{cultivo}', datosCultivo(cv).nombre.toLowerCase()).replace('{precio}', P.p.toLocaleString('es-CO', { maximumFractionDigits: 2 }))); ev.push({ tipo: fase, cv }); }
    }
  }
  if (ev.length) S.preciosEv = ev;
  return news;
}
// Canasta agrícola: oro de cada cultivo este año y su peso en el total.
export function canastaOro(S) {
  const oro = Object.fromEntries(listaCultivos().map(k => [k, 0])), fincas = canasta(S);
  const fT = factorTrabajo(S); // fase 17: sin gente que las trabaje, rinden menos
  S.map.forEach((x, i) => { if (esFinca(x) && !x.ob) oro[cultivoDe(x)] += produccionFinca(S, i).renta * S.price * fT; });
  const total = Object.values(oro).reduce((a, b) => a + b, 0);
  const filas = listaCultivos().filter(k => fincas[k]).map(k => ({ cv: k, fincas: fincas[k], oro: Math.round(oro[k]), parte: total ? oro[k] / total : 0, precio: precioCultivo(S, k), fase: k === 'cafe' ? (S.ciclo && S.ciclo.cafe ? S.ciclo.cafe.tipo : 'normal') : fasePrecio(S, k) }));
  filas.sort((a, b) => b.oro - a.oro);
  return { filas, total: Math.round(total), mayor: filas[0] && total ? filas[0] : null };
}

// Cierre del año: avisa las primeras cosechas.
export function fincasDelAnio(S) {
  if (!fincasActivas(S)) return [];
  migrarFincas(S);
  const precios = preciosDelAnio(S);
  S.map.forEach(x => { delete x.nueva; }); // la siembra gratis es solo el año en que se construye
  const news = [];
  S.map.forEach(x => { if (esFinca(x) && x.cvDesde !== undefined && anioCosecha(S, x) === S.year && datosCultivo(x.cv).madura) news.push(K().textos.primera.replace('{cultivo}', datosCultivo(x.cv).nombre.toLowerCase())); });
  return [...precios, ...new Set(news)];
}
