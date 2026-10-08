// Placas (fase 16, punto 3): cada edificio cuenta qué significaba en la época de la historia en que está. Usa la más
// cercana hacia atrás si no hay una para la época actual. Solo en el terreno en acuarela.
import { C } from './contenido.js';
import { epocaHistorica } from './reglas.js';
import { climaActivo } from './clima.js';

const ORDEN = ['fundacion', 'cafe', 'violencia', 'modernizacion', 'paz', 'digital'];
export function placaDe(S, k) {
  if (!climaActivo(S) || !C.PLACAS) return '';
  const P = C.PLACAS.obras[k], ep = epocaHistorica(S); if (!P || !ep) return '';
  for (let i = ORDEN.indexOf(ep); i >= 0; i--) if (P[ORDEN[i]]) return P[ORDEN[i]];
  return '';
}

// Verso de dominio público que acompaña la placa de algunos edificios (null si no tiene).
export function versoDe(k) { const v = C.PLACAS && C.PLACAS.versos && C.PLACAS.versos[k]; return v || null; }

// Nombre real de Ibagué para la n-ésima obra de su clase (por orden en el mapa); null si no hay.
export function nombreReal(S, i) {
  const x = S.map[i], L = C.PLACAS && C.PLACAS.nombres && x && x.b && C.PLACAS.nombres[x.b]; if (!L) return null;
  let n = 0; for (let j = 0; j < i; j++) if (S.map[j].b === x.b && !S.map[j].ob) n++;
  return L[n] || null;
}
