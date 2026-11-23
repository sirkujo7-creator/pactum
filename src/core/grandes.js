// Obras de varias casillas (pedido de Juan: «el estadio, por definición, debe ser más grande que los demás»).
// Una obra grande tiene su casilla principal (la de adelante: la de mayor fila + columna) con x.b y x.g = 1, y sus
// otras casillas, hacia atrás, marcadas con x.pt = índice de la principal. `casillas` en edificios.json da el tamaño
// [filas, columnas]. Solo en el terreno en acuarela: en el modo de comparación con la v9 todo sigue en una casilla.
// Las obras grandes de partidas viejas se amplían solas si tienen las casillas libres (ampliarGrandes); si no,
// quedan en una casilla con su dibujo de siempre.
import { C } from './contenido.js';
import { lado } from './mundo.js';
import { climaActivo } from './clima.js';

export function tamObra(S, k) { const t = C.B[k] && C.B[k].tam; return t && climaActivo(S) ? t : null; }
// Casillas que ocuparía la obra k con su casilla principal en i (o null si se sale del mapa).
export function huellaObra(S, k, i) {
  const t = tamObra(S, k); if (!t) return [i];
  const N = lado(S), r = Math.floor(i / N), c = i % N, L = [];
  for (let a = 0; a < t[0]; a++) for (let b = 0; b < t[1]; b++) { const rr = r - a, cc = c - b; if (rr < 0 || cc < 0) return null; L.push(rr * N + cc); }
  return L;
}
export function esGrande(x) { return !!(x && x.b && x.g); }
// Casillas de la obra cuya casilla principal es i.
export function partesObra(S, i) { const x = S.map[i]; return esGrande(x) ? (huellaObra(S, x.b, i) || [i]) : [i]; }
// La casilla principal de la obra que ocupa i (la misma i si no es parte de una obra grande).
export function duenoCasilla(S, i) { const x = S.map[i]; return x && x.pt !== undefined ? x.pt : i; }
export const casillaLibre = x => !x.b && x.pt === undefined;
// Ocupa las casillas de atrás al construir.
export function ocuparGrande(S, k, i) {
  const L = huellaObra(S, k, i); if (!L || L.length < 2) return;
  S.map[i].g = 1;
  for (const j of L) if (j !== i) { const y = S.map[j]; y.pt = i; delete y.mk; if (y.t === 'bosque') { y.t = 'llano'; S.env = Math.max(0, S.env - 3); } } // talar las casillas de atrás también baja el ambiente
}
// Libera las casillas de atrás (antes de borrar x.b al demoler o deshacer).
export function liberarGrande(S, i) {
  const x = S.map[i]; if (!x || !x.g) return;
  for (const j of huellaObra(S, x.b, i) || []) if (j !== i) delete S.map[j].pt;
  delete x.g;
}
// ¿Por qué no caben las casillas de atrás? ('' si caben).
export function motivoGrande(S, k, i, motivoCasilla) {
  const t = tamObra(S, k); if (!t) return '';
  const L = huellaObra(S, k, i), n = `${C.B[k].n} ocupa ${t[0]}×${t[1]} casillas`;
  if (!L) return `${n}: no cabe tan cerca del borde.`;
  for (const j of L) if (j !== i) { const m = motivoCasilla(j); if (m) return `${n}: las casillas de atrás deben estar libres (${m.charAt(0).toLowerCase() + m.slice(1)})`; }
  return '';
}
// Partidas guardadas: las obras grandes que caben se amplían una vez.
export function ampliarGrandes(S) {
  if (!climaActivo(S) || S.grandesV) return;
  S.grandesV = 1;
  S.map.forEach((x, i) => {
    if (!x.b || x.g || !tamObra(S, x.b)) return;
    const L = huellaObra(S, x.b, i);
    if (L && L.every(j => j === i || (casillaLibre(S.map[j]) && S.map[j].t !== 'rio' && (C.B[x.b].ok || []).includes(S.map[j].t) && !S.map[j].oc))) ocuparGrande(S, x.b, i);
  });
}

// Huellas grandes (aeropuerto, Jardín Botánico, Parque de Los Nevados): la huella va en la casilla principal con
// mk.g = 1 y las de atrás llevan x.pt, igual que las obras grandes.
export function tamMarca(S, t) { const T = C.MARCAS && C.MARCAS.tipos[t]; return T && T.casillas && climaActivo(S) ? T.casillas : null; }
function huellaTam(S, t, i) {
  if (!t) return [i];
  const N = lado(S), r = Math.floor(i / N), c = i % N, L = [];
  for (let a = 0; a < t[0]; a++) for (let b = 0; b < t[1]; b++) { const rr = r - a, cc = c - b; if (rr < 0 || cc < 0) return null; L.push(rr * N + cc); }
  return L;
}
// ¿Cabe la huella grande t con su casilla principal en i? (las de atrás, libres y en llano)
export function cabeMarca(S, t, i) { const L = huellaTam(S, tamMarca(S, t), i); return !!L && L.every(j => j === i || (casillaLibre(S.map[j]) && !S.map[j].mk && S.map[j].t === 'llano' && !S.map[j].oc)); }
export function ocuparMarca(S, t, i) {
  const L = huellaTam(S, tamMarca(S, t), i); if (!L || L.length < 2) return;
  const x = S.map[i]; if (x.mk) x.mk.g = 1;
  for (const j of L) if (j !== i) S.map[j].pt = i;
}
export function partesMarca(S, i) { const x = S.map[i]; return x && x.mk && x.mk.g ? (huellaTam(S, tamMarca(S, x.mk.t), i) || [i]) : [i]; }
