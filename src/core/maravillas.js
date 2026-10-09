// Maravillas (fase 17): grandes obras únicas que se levantan una vez, con requisitos, oro y materiales; se ven en el mapa
// (huella permanente), dejan un efecto inmediato y un poco de oro cada año. Solo en acuarela.
import { C } from './contenido.js';
import { climaActivo } from './clima.js';
import { counts } from './reglas.js';
import { dejarMarca } from './marcas.js';
import { recordar } from './memoria.js';
import { applyFx } from './dilemas.js';
import { materialesActivos, faltanteMatCosto, pagarMatCosto } from './materiales.js';

const K = () => C.MARAV;
export const maravillasActivas = S => climaActivo(S) && !!C.MARAV && !!C.MARCAS;
export const costoMaravilla = (S, m) => Math.round(m.costo * S.price);
export const maravillasHechas = S => (S.maravillas ? Object.entries(S.maravillas).map(([id, v]) => ({ ...K().maravillas.find(m => m.id === id), ...v })) : []);
// Qué falta para poder levantarla (texto) o null si ya se puede.
export function motivoMaravilla(S, m) {
  if (S.stage < m.etapa) return `llegar a ${C.STAGES[m.etapa].n}`;
  const c = counts(S); for (const o of m.obras || []) if (!c[o]) return `tener ${C.B[o].a}`;
  if (m.ambienteMin && S.env < m.ambienteMin) return `un ambiente de ${m.ambienteMin} o más`;
  return null;
}
export function lugarMaravillas(S) { return maravillasActivas(S) ? K().maravillas.filter(m => !(S.maravillas && S.maravillas[m.id])) : []; }
export function puedeMaravilla(S, m) {
  const r = motivoMaravilla(S, m); if (r) return K().textos.requisito.replace('{r}', r);
  const oro = costoMaravilla(S, m); if (S.gold < oro) return K().textos.sinOro.replace('{n}', oro - Math.floor(S.gold));
  if (materialesActivos(S)) { const f = faltanteMatCosto(S, m.mat); if (f) return f; }
  return null;
}
export function levantarMaravilla(S, id) {
  const m = K().maravillas.find(x => x.id === id); if (!m || (S.maravillas && S.maravillas[id]) || puedeMaravilla(S, m)) return null;
  const i = dejarMarca(S, m.tipo, `Año ${S.year}: ${m.nombre}. ${m.texto} ${m.nota}`); if (i < 0) return { error: K().textos.sinSitio };
  S.gold -= costoMaravilla(S, m); if (materialesActivos(S)) pagarMatCosto(S, m.mat);
  const fx = applyFx(S, m.efectos); recordar(S, 'deber', 3);
  (S.maravillas = S.maravillas || {})[id] = { i, anio: S.year };
  S.log.unshift({ y: S.year, t: `Se inaugura: ${m.nombre}. ${m.nota}` });
  return { i, fx, m };
}
// Cierre del año: las maravillas dejan algo de oro (visitantes, comercio, orgullo).
export function maravillasDelAnio(S) {
  if (!maravillasActivas(S) || !S.maravillas) return [];
  let oro = 0; for (const id of Object.keys(S.maravillas)) { const m = K().maravillas.find(x => x.id === id); if (m) oro += Math.round(m.oroAnual * S.price); }
  S.gold += oro; return [];
}
