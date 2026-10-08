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
