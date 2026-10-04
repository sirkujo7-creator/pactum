// Consultas básicas del estado: dificultad, régimen, leyes y condiciones escritas en los datos.
import { C } from './contenido.js';
import { countT } from './mundo.js';
import { glaciar as glaciarDe } from './biomas.js';
import { fabricasDe, nivelMaximo } from './industria.js';

export function D(S) { return C.DIFFS[S.diff || 'normal']; }
export function RG(S) { return C.REG[S.reg || 'republica']; }
// Fase 3 (balance): cada régimen puede tener ajustes que solo valen en el terreno en acuarela (la v9 queda igual).
export function RM(S, k, d) {
  const R = RG(S), a = R.m3 && S && S.clima && S.mundo === 'acuarela' ? R.m3[k] : undefined, v = a !== undefined ? a : R.m[k];
  return v === undefined ? (d === undefined ? 0 : d) : v;
}
// Fase 7: el ritmo del siglo (solo en el terreno en acuarela; la v9 queda igual).
export function ritmo(S) { return S && S.clima && S.mundo === 'acuarela' && C.RITMO ? C.RITMO : null; }
export function aniosPolis(S) { const R = ritmo(S); return R ? R.aniosPolis[S.diff || 'normal'] : D(S).polis; }
export function reqEtapa(S, k) { const R = ritmo(S); return R && R.etapas[k] ? R.etapas[k].requisito : C.STAGES[k].req; }
function ritmoOk(S, k) { const R = ritmo(S), E = R && R.etapas[k]; return !E || (S.pop >= E.habitantes && S.year >= E.anio); }
// Fase 7: época de la historia según el año (solo en el terreno en acuarela).
export function epocaHistorica(S) {
  if (!(S && S.clima && S.mundo === 'acuarela' && C.HIST)) return null;
  let id = null; for (const e of C.HIST.epocas) if (S.year >= e.desde) id = e.id;
  return id;
}
export function seatName(S) { return RG(S).sede; }
export function hasLaw(S, k) { return !!(S.laws && S.laws[k]); }

export function counts(S) {
  const c = {};
  Object.keys(C.B).forEach(k => c[k] = 0);
  // Fase 1: una obra abandonada por el deterioro no cuenta hasta que se repare.
  const aband = C.DESGASTE ? C.DESGASTE.estados[3].desde : 101;
  S.map.forEach(x => { if (x.b && !(x.u >= aband) && !x.ob) c[x.b]++; }); // fase 2: una obra en construcción aún no presta servicio
  if (S.mundo === 'acuarela' && S.clima) S.map.forEach(x => { if (x.b === 'cultivo' && x.cv === 'cafe' && !(x.u >= aband) && !x.ob) c.cafetal++; }); // fase 10: las fincas de café cuentan como cafetales
  return c;
}
export function cap(S) { return counts(S).casa * 10 + (S.asent ? S.asent.length * 6 : 0); } // fase 5: los asentamientos informales también albergan gente
export function cost(S, k) { return Math.round(C.B[k].cost * S.price * (1 - RM(S, 'obrasDescuento')) * (hasLaw(S, 'sismo') ? 1.1 : 1)); } // fase 4: el código sismorresistente encarece las obras

// Condiciones de los archivos de datos (dilemas y guía). Todas deben cumplirse.
//   edificios: {cultivo: 2}      al menos 2 cultivos
//   anio: 4 / etapa: 1           año o etapa mínimos
//   impuestoElite: 28            impuesto a la élite de 28% o más
//   inflacionMayorQue: 0.08      inflación por encima de 8%
//   terreno: "montana"           existe ese terreno en el mapa
export function cumple(S, cond, c) {
  if (!cond) return true;
  c = c || counts(S);
  for (const [k, v] of Object.entries(cond)) {
    if (k === 'edificios') { if (Object.entries(v).some(([b, n]) => c[b] < n)) return false; }
    else if (k === 'anio') { if (S.year < v) return false; }
    else if (k === 'etapa') { if (S.stage < v) return false; }
    else if (k === 'impuestoElite') { if (!(S.tx.e >= v)) return false; }
    else if (k === 'inflacionMayorQue') { if (!(S.infl > v)) return false; }
    else if (k === 'terreno') { if (!(countT(S, v) > 0)) return false; }
    else if (k === 'nuevo') { if (!(S.clima && S.mundo === 'acuarela')) return false; } // solo en el terreno en acuarela
    else if (k === 'epoca') { if (epocaHistorica(S) !== v) return false; } // fase 7: dilemas de una época de la historia
    else if (k === 'glaciarMenorQue') { if (!(S.pisos && S.pisos.subida && glaciarDe(S) < v)) return false; } // fase 10: biomas que cambian
    else if (k === 'subidaPisos') { if (!(S.pisos && S.pisos.subida >= v)) return false; }
    else if (k === 'fincas') { if (Object.entries(v).some(([cv, n]) => S.map.filter(x => x.b === 'cultivo' && x.cv === cv).length < n)) return false; }
    else if (k === 'productos') { if (Object.entries(v).some(([pr, n]) => fabricasDe(S, pr) < n)) return false; } // fase 11: la industria
    else if (k === 'rasgo') { if (!(S.rasgos && Object.values(S.rasgos).includes(v))) return false; } // fase 12: identidad del pueblo
    else if (k === 'ley') { if (!hasLaw(S, v)) return false; }
    else if (k === 'nivelFabrica') { if (nivelMaximo(S) < v) return false; }
    else if (k === 'clima') { const f = S.clima && S.clima.fenomeno; if (v === 'crisis' ? !f : f !== v) return false; }
    else throw new Error(`Condición desconocida: ${k}`);
  }
  return true;
}

// Requisitos para subir de etapa (Pueblo, Ciudad, Polis).
export const ETAPA_OK = [
  null,
  (S, c) => S.pop >= 40 && ritmoOk(S, 1),
  (S, c) => S.pop >= 80 && c.escuela >= 1 && c.hospital >= 1 && ritmoOk(S, 2),
  // Fase 4: en Ciudad, además, relaciones mínimas con las polis vecinas (solo existen en el terreno en acuarela).
  (S, c) => S.pop >= 150 && ritmoOk(S, 3) && c.agora >= 1 && S.tr >= 55 && (!S.vecinos || !C.VECINOS || Object.values(S.vecinos).reduce((s, v) => s + v.rel, 0) / Object.keys(S.vecinos).length >= C.VECINOS.minimo)
];
