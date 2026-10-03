// Memoria y legado (fase 5): cada huella que dejan las decisiones queda en la memoria del pueblo (justicia, ayuda,
// deber, ambiente, paz, negocios, mano dura, abandono). Cada 25 años una nueva generación juzga el gobierno por lo
// que recuerda (más o menos legitimidad) y luego olvida una parte. Las obras viejas son patrimonio. Al final, el
// juicio de la historia resume el legado y la herencia al sucesor (Hans Jonas). Solo en el terreno en acuarela.
import { C } from './contenido.js';
import { clamp } from './azar.js';
import { climaActivo } from './clima.js';
import { totDebt } from './hacienda.js';

const K = () => C.MEMORIA;
export function memoriaActiva(S) { return climaActivo(S) && !!C.MEMORIA; }
export function recordar(S, marca, n = 1) {
  if (!memoriaActiva(S)) return;
  const cat = K().porMarca[marca] || (K().categorias[marca] ? marca : null);
  if (!cat) return;
  (S.memo = S.memo || {})[cat] = (S.memo[cat] || 0) + n;
}
// Lo que más se recuerda, de mayor a menor: [{id, ...categoría, n}].
export function recuerdos(S) {
  return Object.entries(S.memo || {}).filter(([, n]) => n >= .5).map(([id, n]) => ({ id, ...K().categorias[id], n })).sort((a, b) => b.n - a.n);
}
// Juicio de la memoria: de −1 (todo malo) a +1 (todo bueno).
export function balanceMemoria(S) {
  const R = recuerdos(S), tot = R.reduce((s, r) => s + r.n, 0);
  return tot ? R.reduce((s, r) => s + r.n * r.peso, 0) / tot : 0;
}
export function generacion(S) { return Math.floor(S.year / K().generacion); }
export function proximaGeneracion(S) { return (generacion(S) + 1) * K().generacion; }
// Las obras sin año (las de la aldea fundadora) cuentan desde el año 0.
export function esPatrimonio(S, x) { return memoriaActiva(S) && !!x.b && !x.ob && S.year - (x.ya ?? 0) >= K().patrimonio; }

// Cierre del año: si llega una generación, juzga y olvida. Devuelve las noticias.
export function memoriaDelAnio(S) {
  if (!memoriaActiva(S) || S.year % K().generacion !== 0 || S.year === 0) return [];
  const T = K().textos, b = balanceMemoria(S), n = Math.round(b * K().maximoJuicio), antes = recuerdos(S).slice(0, 3);
  S.tr = clamp(S.tr + n, 0, 100);
  for (const k in S.memo || {}) S.memo[k] *= K().olvido;
  S.genEv = { anio: S.year, n, recuerdos: antes.map(r => ({ id: r.id, n: Math.round(r.n) })), nuevo: true };
  return [T.generacion, n > 0 ? T.juicioBueno.replace('{n}', n) : n < 0 ? T.juicioMalo.replace('{n}', -n) : T.juicioNeutro];
}

// Juicio de la historia (al terminar): cómo te recordarán y qué heredas.
export function juicioHistoria(S) {
  const R = recuerdos(S), b = balanceMemoria(S), deuda = Math.round(totDebt(S));
  const patrimonio = S.map.filter(x => esPatrimonio(S, x)).length;
  return { titulo: R.length ? R[0].titulo : 'un gobierno del que pocos se acuerdan', recuerdos: R.slice(0, 4), balance: b, deuda, patrimonio,
    crisis: S.crisisN || 0, generaciones: generacion(S), erosion: S.map.filter(x => x.er > 0).length };
}
