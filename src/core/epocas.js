// Evolución visual por épocas (fase 5): bahareque, tapia y balcón, ladrillo y concreto, según la etapa y los años.
// Cambian las casas y, desde el ladrillo, la ropa de los pobladores. Cada cambio trae una tarjeta. Solo en acuarela.
import { C } from './contenido.js';
import { climaActivo } from './clima.js';

const K = () => C.EPOCAS;
// Época de hoy (0 a 3). En la v9 sigue la regla de antes: tapia desde Ciudad.
export function epocaVisual(S) {
  if (!climaActivo(S) || !C.EPOCAS) return S.stage >= 2 ? 1 : 0;
  let e = 0;
  K().eras.forEach((x, k) => { if (S.stage >= x.desde.etapa && S.year >= x.desde.anio) e = k; });
  return e;
}
export function ropaModerna(S) { return climaActivo(S) && !!C.EPOCAS && epocaVisual(S) >= K().ropaModerna; }
// Cierre del año: si cambió la época, queda la tarjeta. Devuelve las noticias.
export function epocasDelAnio(S) {
  if (!climaActivo(S) || !C.EPOCAS) return [];
  const e = epocaVisual(S);
  if (S.epoca === undefined) { S.epoca = e; return []; }
  if (e <= S.epoca) return [];
  S.epoca = e; S.epocaEv = { era: e, nuevo: true };
  return [`${K().eras[e].icono} Comienza la época del ${K().eras[e].nombre.toLowerCase()}.`];
}
