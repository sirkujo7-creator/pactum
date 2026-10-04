// Tecnología por épocas (fase 6): universidades, bibliotecas y escuelas producen saber; al juntar suficiente llega un
// invento (imprenta, telégrafo, electricidad, radio, internet, automatización). El gobierno decide: adoptarlo libre
// (todo el beneficio y todo el riesgo), regulado (menos de ambos, con un costo por año) o rechazarlo. Ningún invento
// es obligatorio para ganar. Solo en el terreno en acuarela.
import { C } from './contenido.js';
import { efectoLeyes } from './civismo.js';
import { clamp } from './azar.js';
import { counts, ritmo } from './reglas.js';
import { climaActivo } from './clima.js';
import { dejarMarca } from './marcas.js';

const K = () => C.TEC;
export function tecActiva(S) { return climaActivo(S) && !!C.TEC; }
function datos(S) { if (!S.tec) S.tec = { saber: 0, adoptados: {}, pendiente: null }; return S.tec; }
export function estadoTec(S) { return datos(S); }

export function saberAnual(S) {
  if (!tecActiva(S) || S.stage < 1) return 0;
  const Q = K().saber, c = counts(S);
  return Q.base + c.escuela * Q.escuela + c.biblioteca * Q.biblioteca + c.universidad * Q.universidad + efectoLeyes(S, 'saber'); // fase 12: rasgos
}
// Próximo invento por llegar (el primero que no se ha decidido).
export function proximoInvento(S) {
  const A = datos(S).adoptados;
  return Object.entries(K().inventos).find(([id]) => !A[id]) || null;
}
// Efecto de los inventos adoptados sobre una medida (suma; 'mov' multiplica).
export function efectoTec(S, k) {
  if (!tecActiva(S) || !S.tec) return k === 'mov' ? 1 : 0;
  let v = k === 'mov' ? 1 : 0;
  for (const [id, modo] of Object.entries(S.tec.adoptados)) {
    if (modo === 'rechazado') continue;
    const x = K().inventos[id][modo].efectos[k];
    if (x !== undefined) v = k === 'mov' ? v * x : v + x;
  }
  return v;
}
export function costoTecAnual(S) {
  if (!tecActiva(S) || !S.tec) return 0;
  return Object.entries(S.tec.adoptados).filter(([, m]) => m === 'regulada').reduce((s, [id]) => s + Math.round(K().inventos[id].regulada.costo * S.price), 0);
}
export function decidirInvento(S, id, modo) {
  const T = datos(S), I = K().inventos[id];
  if (!I || T.adoptados[id] && T.adoptados[id] !== 'rechazado' && T.pendiente !== id && modo === T.adoptados[id]) return false;
  T.adoptados[id] = modo; if (T.pendiente === id) T.pendiente = null;
  if (modo !== 'rechazado' && !S.map.some(x => x.mk && x.mk.t === I.marca)) dejarMarca(S, I.marca, `Año ${S.year}: ${I.nombre.toLowerCase()} (${I[modo].texto.toLowerCase()}).`);
  S.log.unshift({ y: S.year, t: `${I.nombre}: ${modo === 'rechazado' ? 'decidiste no adoptarla' : I[modo].texto.toLowerCase()}.` });
  return true;
}
// Cierre del año: saber, costos de la regulación, rumbo y llegada de inventos. Devuelve las noticias.
// Fase 7: cada invento llega en su época (año mínimo).
export function anioInvento(S, id) { const R = ritmo(S); return (R && R.inventos[id]) || 0; }
export function tecDelAnio(S) {
  if (!tecActiva(S)) return [];
  const T = datos(S), news = [];
  T.saber += saberAnual(S);
  const costo = costoTecAnual(S); if (costo) S.gold -= costo;
  const corr = efectoTec(S, 'corr'); if (corr) S.corr = clamp(S.corr + corr, 0, 100);
  if (!T.pendiente) {
    const p = proximoInvento(S);
    if (p && T.saber >= p[1].saber && S.stage >= p[1].etapa && S.year >= anioInvento(S, p[0])) { T.pendiente = p[0]; S.tecEv = { id: p[0], nuevo: true }; news.push(`${p[1].icono} ${p[1].texto}`); }
  }
  return news;
}
