// Consultas básicas del estado: dificultad, régimen, leyes y condiciones escritas en los datos.
import { C } from './contenido.js';
import { countT } from './mundo.js';

export function D(S) { return C.DIFFS[S.diff || 'normal']; }
export function RG(S) { return C.REG[S.reg || 'republica']; }
export function RM(S, k, d) { const v = RG(S).m[k]; return v === undefined ? (d === undefined ? 0 : d) : v; }
export function seatName(S) { return RG(S).sede; }
export function hasLaw(S, k) { return !!(S.laws && S.laws[k]); }

export function counts(S) {
  const c = {};
  Object.keys(C.B).forEach(k => c[k] = 0);
  S.map.forEach(x => { if (x.b) c[x.b]++; });
  return c;
}
export function cap(S) { return counts(S).casa * 10; }
export function cost(S, k) { return Math.round(C.B[k].cost * S.price); }

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
    else if (k === 'clima') { const f = S.clima && S.clima.fenomeno; if (v === 'crisis' ? !f : f !== v) return false; }
    else throw new Error(`Condición desconocida: ${k}`);
  }
  return true;
}

// Requisitos para subir de etapa (Pueblo, Ciudad, Polis).
export const ETAPA_OK = [
  null,
  (S, c) => S.pop >= 40,
  (S, c) => S.pop >= 80 && c.escuela >= 1 && c.hospital >= 1,
  (S, c) => S.pop >= 150 && c.agora >= 1 && S.tr >= 55
];
