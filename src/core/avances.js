// Camino de avances (fase 11, paso 0): lo que el territorio va desbloqueando (etapas, inventos, caminos y, después,
// productos de la industria y civismo) en una sola lista de src/data/avances.json. Cada año se revisa qué avances se
// cumplieron por primera vez y salen juntos en una edición de El Pregonero. Solo anota: no cambia el juego.
import { C } from './contenido.js';
import { cumple, reqEtapa } from './reglas.js';
import { climaActivo } from './clima.js';
import { eraCalle } from './calles.js';

const K = () => C.AVANCES;
export function avancesActivos(S) { return climaActivo(S) && !!C.AVANCES; }
// Fase 12: cada ley nueva del árbol de civismo también es un avance (sale en El Pregonero al desbloquearla).
let LISTA = null;
export function listaAvances() {
  if (!LISTA || LISTA.base !== K().avances) LISTA = { base: K().avances, l: [...K().avances, ...(C.LEYES_NUEVAS || []).map(l => ({ id: 'l_' + l.id, icono: l.icono, nombre: l.nombre, ley: true, cuando: { leyAbierta: l.id }, requisito: 'desbloquearla en el árbol de civismo (Leyes)', titular: l.titular, texto: `${l.pro} ${l.contra}`, leccion: l.leccion }))] };
  return LISTA.l;
}
export function datosAvance(id) { return listaAvances().find(a => a.id === id); }
function llego(S, id) { const T = S.tec; return !!(T && (T.adoptados[id] || T.pendiente === id)); }
// ¿Se cumple el avance? Además de las condiciones de siempre (etapa, año, edificios...): invento y era de los caminos.
export function cumpleAvance(S, a) {
  const { invento, eraCalle: era, leyAbierta, ...resto } = a.cuando || {};
  if (leyAbierta && !(S.civ && S.civ.abiertas[leyAbierta])) return false;
  if (invento && !llego(S, invento)) return false;
  if (era && (!C.CALLES || eraCalle(S) !== era)) return false;
  return cumple(S, resto);
}
// Lo que pide un avance, en palabras.
export function requisitoAvance(a, S) {
  if (a.requisito) return a.requisito;
  const T = K().textos, q = a.cuando || {}, partes = [];
  if (q.etapa) partes.push(T.reqEtapa.replace('{etapa}', C.STAGES[q.etapa].n).replace('{req}', S ? reqEtapa(S, q.etapa) : C.STAGES[q.etapa].req));
  if (q.invento && C.TEC) { const I = C.TEC.inventos[q.invento]; partes.push(T.reqInvento.replace('{invento}', I.nombre.toLowerCase()).replace('{saber}', I.saber)); }
  if (q.anio) partes.push(T.reqAnio.replace('{anio}', q.anio));
  return partes.join(' y ');
}
function estado(S) { if (!S.avances) S.avances = { vistos: {}, ediciones: [] }; return S.avances; }
export function estadoAvances(S) { return estado(S); }
// Obras que se abren con una etapa (sin el cafetal, que ahora es un cultivo de la finca).
export function obrasDeEtapa(etapa) { return Object.entries(C.B).filter(([k, b]) => b.st === etapa && !(k === 'cafetal' && C.CULTIVOS) && k !== 'fundacion').map(([k]) => k); }
// Primera vez (partida nueva o guardada antes de este paso): lo que ya se cumple se anota sin periódico.
function empezar(S) {
  const A = estado(S);
  A.empezo = S.year;
  for (const a of listaAvances()) if (cumpleAvance(S, a)) A.vistos[a.id] = a.id === 'aldea' || !S.year ? 0 : -1;
}
// El año en cifras (El Pregonero más largo, pedido de Juan): lo que pasó con la gente, el dinero y el ánimo, en renglones cortos.
function cifrasDelAnio(S) {
  const T = K().periodico.cifrasLineas, h = S.hist || [], u = h[h.length - 1], a = u && u.y === S.year ? h[h.length - 2] : u;
  const dif = (v, w) => w === undefined ? '' : v - w > 0 ? ` (+${Math.round(v - w)})` : v - w < 0 ? ` (${Math.round(v - w)})` : '';
  return [
    T.gente.replace('{n}', S.pop).replace('{d}', dif(S.pop, a && a.pop)),
    T.oro.replace('{n}', Math.round(S.gold)).replace('{d}', dif(S.gold, a && a.gold)),
    T.animo.replace('{b}', Math.round(S.hap)).replace('{i}', Math.round(S.eq)).replace('{l}', Math.round(S.tr)).replace('{a}', Math.round(S.env))
  ];
}
// Cierre del año: los avances nuevos salen en una edición (S.avancesEv). `breves` son otras noticias del año.
export function avancesDelAnio(S, breves = []) {
  if (!avancesActivos(S)) return [];
  if (!S.avances) { empezar(S); return []; }
  const A = estado(S), nuevos = listaAvances().filter(a => A.vistos[a.id] === undefined && cumpleAvance(S, a));
  if (!nuevos.length) return [];
  nuevos.forEach(a => { A.vistos[a.id] = S.year; });
  // Primero la noticia más grande: una etapa, luego un invento, luego lo demás.
  const peso = a => /^etapa/.test(a.id) ? 0 : a.cuando.invento === a.id ? 1 : 2;
  const ids = nuevos.sort((a, b) => peso(a) - peso(b)).map(a => a.id);
  // Breves: otras noticias del año (sin repetir la del invento), primero las que traen un personaje o un suceso.
  const repetidas = ids.map(id => C.TEC && C.TEC.inventos[id] && C.TEC.inventos[id].texto).filter(Boolean);
  const conIcono = t => /^\P{L}/u.test(t) ? 0 : 1;
  const br = breves.filter(t => t && t.length <= 160 && !repetidas.some(x => t.includes(x)) && !/ya es Ciudad|los caminos se vuelven/.test(t)).sort((a, b) => conIcono(a) - conIcono(b));
  const ed = { n: A.ediciones.length + 1, anio: S.year, ids, breves: br.slice(0, 5), cifras: cifrasDelAnio(S) };
  A.ediciones.push(ed);
  if (A.ediciones.length > 40) A.ediciones.shift();
  S.avancesEv = { ...ed, nuevo: true };
  return [`El Pregonero: ${datosAvance(ids[0]).titular}.`];
}
// Nombre del periódico según los inventos que han llegado.
export function cabecera(S) {
  return K().periodico.nombres.filter(x => !x.invento || llego(S, x.invento)).pop();
}
// Para el camino: logrados (con su año), próximos (los 3 siguientes de la lista) y cuántos faltan por descubrir.
export function caminoAvances(S) {
  const A = estado(S), L = listaAvances();
  const logrados = L.filter(a => A.vistos[a.id] !== undefined).map(a => ({ ...a, anio: A.vistos[a.id] }));
  const faltan = L.filter(a => A.vistos[a.id] === undefined && !a.ley); // las leyes se desbloquean a voluntad, no son «lo que viene»
  return { logrados, proximos: faltan.slice(0, 3), ocultos: Math.max(0, faltan.length - 3) };
}
