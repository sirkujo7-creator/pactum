// Cultura y deporte (fase 5): cancha, biblioteca, teatro, estadio y fiestas. En el terreno en acuarela reemplazan la
// "exigencia creciente" de la versión 9: con los años el pueblo pide sentido e identidad, no solo bienestar, y la cultura
// lo calma. También mejoran los barrios donde están. Solo en el terreno en acuarela.
import { C } from './contenido.js';
import { efectoLeyes, fiestaDelPueblo } from './civismo.js';
import { counts } from './reglas.js';
import { climaActivo } from './clima.js';
import { efectoTec } from './tecnologia.js';
import { efectoMega } from './megaproyectos.js';

const K = () => C.CULTURA;
export function culturaActiva(S) { return climaActivo(S) && !!C.CULTURA; }
// Cuánto calman la exigencia los edificios culturales y las fiestas recientes.
export function culturaTotal(S) {
  if (!culturaActiva(S)) return 0;
  const c = counts(S);
  let t = 0;
  for (const [k, b] of Object.entries(C.B)) if (b.cul) t += (c[k] || 0) * b.cul;
  if (S.fiesta !== undefined && S.year - S.fiesta < K().fiesta.anios) t += fiestaDelPueblo(S).bono; // fase 12: la fiesta según los rasgos
  t += efectoTec(S, 'cultura') + efectoMega(S, 'cultura') + efectoLeyes(S, 'cultura'); // fase 6: imprenta, radio y aeropuerto; fase 12: rasgos
  return t;
}
export function costoFiesta(S) { return Math.round(K().fiesta.costo * S.price); }
export function puedeFiesta(S) {
  if (S.fiesta === S.year) return 'Ya hubo fiestas este año.';
  if (S.gold < costoFiesta(S)) return `Necesitas ${costoFiesta(S)} de oro.`;
  return null;
}
export function organizarFiesta(S) {
  if (puedeFiesta(S)) return false;
  S.gold -= costoFiesta(S); S.fiesta = S.year; S.vis = { k: 'festival', y: S.year + 1 };
  S.log.unshift({ y: S.year, t: `Organizaste: ${fiestaDelPueblo(S).nombre}.` });
  return true;
}
