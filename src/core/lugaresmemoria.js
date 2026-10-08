// Lugares de memoria (fase 16, punto 6): al atravesar un hito de la historia puedes levantar un monumento o un museo que
// cuenta lo que ocurrió. Se ven en el mapa (huella permanente), dan legitimidad y quedan en la memoria del pueblo.
import { C } from './contenido.js';
import { climaActivo } from './clima.js';
import { dejarMarca } from './marcas.js';
import { recordar } from './memoria.js';
import { applyFx } from './dilemas.js';

const K = () => C.LUGMEM;
export const lugaresActivos = S => climaActivo(S) && !!C.LUGMEM && !!C.MARCAS;
export const costoLugar = (S, l) => Math.round(l.costo * S.price);
export const lugaresHechos = S => (S.lugaresMem ? Object.entries(S.lugaresMem).map(([id, v]) => ({ ...K().lugares.find(l => l.id === id), ...v })) : []);
// Los que ya puedes levantar: el hito ya pasó (decidiste en él) y todavía no existe.
export function lugaresDisponibles(S) {
  if (!lugaresActivos(S)) return [];
  const hechos = S.lugaresMem || {};
  return K().lugares.filter(l => S.decisiones && S.decisiones[l.hito] !== undefined && !hechos[l.id]);
}
export function puedeLevantar(S, l) {
  if (S.gold < costoLugar(S, l)) return K().textos.sinOro.replace('{n}', costoLugar(S, l) - Math.floor(S.gold));
  return null;
}
export function levantarLugar(S, id) {
  const l = K().lugares.find(x => x.id === id); if (!l || !lugaresDisponibles(S).includes(l) || puedeLevantar(S, l)) return null;
  const i = dejarMarca(S, l.tipo, `Año ${S.year}: ${l.nombre}. ${l.texto} ${l.nota}`); if (i < 0) return { error: K().textos.sinSitio };
  S.gold -= costoLugar(S, l); const fx = applyFx(S, l.efectos); recordar(S, l.recuerdo, 3);
  (S.lugaresMem = S.lugaresMem || {})[id] = { i, anio: S.year };
  S.log.unshift({ y: S.year, t: `Se levanta: ${l.nombre}. ${l.nota}` });
  return { i, fx, l };
}
