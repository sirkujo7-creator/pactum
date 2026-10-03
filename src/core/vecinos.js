// Relaciones con otras polis (fase 4): desde Ciudad hay tres vecinos con relación (0 a 100). Tratados y visitas la
// suben; conflicto, río sucio, aranceles o gobiernos autoritarios la bajan. Aliados ayudan en las emergencias;
// hostiles bloquean el comercio. Con un promedio bajo hay aislamiento y no se llega a Polis. Solo en acuarela.
import { C } from './contenido.js';
import { clamp } from './azar.js';
import { counts, hasLaw } from './reglas.js';
import { climaActivo } from './clima.js';
import { dejarMarca } from './marcas.js';
import { comercioSalida, salidaAlBorde } from './calles.js';

const K = () => C.VECINOS;
export function vecinosActivos(S) { return climaActivo(S) && !!C.VECINOS && !!S.vecinos; }
export function promedioRel(S) { const v = Object.values(S.vecinos || {}); return v.length ? v.reduce((s, x) => s + x.rel, 0) / v.length : 100; }
export function aislado(S) { return vecinosActivos(S) && promedioRel(S) < K().minimo; }
export function nivelVecino(rel) { return rel >= K().aliado ? 'aliado' : rel <= K().hostil ? 'hostil' : 'neutral'; }

// Factor de ingresos de artesanos y élite por el comercio con los vecinos.
export function factorVecinos(S) {
  if (!vecinosActivos(S)) return 0;
  let f = 0;
  for (const v of Object.values(S.vecinos)) { if (v.tratado && v.rel >= 40) f += K().comercio; if (v.rel <= K().hostil) f -= K().bloqueo; }
  return f + comercioSalida(S) + Math.min(2, counts(S).puerto) * .02 - (aislado(S) ? K().aislamiento.ingresos : 0); // fase 4: el puerto abre comercio
}
export function costoAccion(S, a) { return Math.round(K().acciones[a].costo * S.price); }
export function puedeAccion(S, id, a) {
  const v = S.vecinos && S.vecinos[id];
  if (!v) return 'Aún no hay relaciones.';
  if (a === 'tratado' && v.tratado) return 'Ya tienen un tratado.';
  if (a === 'visita' && v.visita === S.year) return 'Ya los visitaste este año.';
  if (S.gold < costoAccion(S, a)) return `Necesitas ${costoAccion(S, a)} de oro.`;
  return null;
}
export function accionVecino(S, id, a) {
  if (puedeAccion(S, id, a)) return false;
  const v = S.vecinos[id], A = K().acciones[a];
  S.gold -= costoAccion(S, a); v.rel = clamp(v.rel + A.relacion, 0, 100);
  if (a === 'tratado') { v.tratado = S.year; dejarMarca(S, 'tratado', `Año ${S.year}: tratado de comercio con ${K().vecinos[id].nombre}.`); } else v.visita = S.year;
  S.log.unshift({ y: S.year, t: `${A.nombre} con ${K().vecinos[id].nombre}.` });
  return true;
}

// Tensiones del año para un vecino: [texto, puntos].
export function tensiones(S, id) {
  const T = K().vecinos[id].tensiones, out = [];
  const autoritario = ['tirania', 'oligarquia', 'monarquia'].includes(S.reg);
  if (T.rioSucio && S.env < 45) out.push(['El río les llega sucio', T.rioSucio]);
  if (T.conflicto && S.conf && S.conf.grupo) out.push(['Grupo armado en tu territorio', T.conflicto]);
  if (T.autoritario && autoritario) out.push(['Desconfían de tu régimen', T.autoritario]);
  if (T.aranceles && hasLaw(S, 'arancel')) out.push(['Tus aranceles', T.aranceles]);
  if (T.competenciaCafe && counts(S).cafetal >= 3) out.push(['Compites con su café', T.competenciaCafe]);
  if (T.planVolcan && S.volcan && S.volcan.plan) out.push(['Preparaste el riesgo del volcán', T.planVolcan]);
  return out;
}

// Cierre del año. Devuelve las noticias; la apertura queda en S.vecEv para la tarjeta.
export function vecinosDelAnio(S) {
  if (!climaActivo(S) || !C.VECINOS) return [];
  const P = K(), T = P.textos, news = [];
  if (!S.vecinos) {
    if (S.stage < P.desde.etapa) return [];
    S.vecinos = Object.fromEntries(Object.keys(P.vecinos).map(id => [id, { rel: P.inicial, tratado: 0, visita: 0 }]));
    S.vecEv = { tipo: 'abre', nuevo: true }; news.push(T.abre); return news;
  }
  const ayudaHoy = S.desastre && S.desastre.anio === S.year && S.desastre.tipo !== 'alerta' || (S.clima.fenomeno && S.clima.evento && S.clima.evento.anio === S.year);
  for (const [id, v] of Object.entries(S.vecinos)) {
    const antes = nivelVecino(v.rel), N = P.vecinos[id];
    v.rel = clamp(v.rel + (P.inicial - v.rel) * P.regreso + tensiones(S, id).reduce((s, x) => s + x[1], 0) + (v.tratado ? 1 : 0) + (salidaAlBorde(S) ? C.CALLES.salida.relacion : 0) + (id === 'sanlorenzo' ? Math.min(2, counts(S).puerto) : 0), 0, 100);
    const ahora = nivelVecino(v.rel);
    if (ahora !== antes && ahora !== 'neutral') news.push(T[ahora].replace('{vecino}', N.nombre));
    if (ayudaHoy && ahora === 'aliado') { const o = Math.round(P.ayuda * S.price); S.gold += o; news.push(T.ayuda.replace('{vecino}', N.nombre).replace('{oro}', o)); }
  }
  if (aislado(S)) { S.tr = clamp(S.tr - P.aislamiento.legitimidad, 0, 100); news.push(T.aislamiento); }
  return news;
}
