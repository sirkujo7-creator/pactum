// Decisiones propias de cada edificio (fase 16, punto 3): una vez por obra, desde su ficha. Sin avisos de efectos. Solo en acuarela.
import { C } from './contenido.js';
import { climaActivo } from './clima.js';
import { applyFx } from './dilemas.js';

export const decisionesObraActivas = S => climaActivo(S) && !!C.OBRADEC;
export const datosDecisionObra = b => (C.OBRADEC && C.OBRADEC.obras[b]) || null;
export function puedeDecidirObra(S, i) {
  const x = S.map[i]; return decisionesObraActivas(S) && !!x && !!x.b && !x.ob && !x.dd && !!datosDecisionObra(x.b);
}
export function decidirObra(S, i, k) {
  if (!puedeDecidirObra(S, i)) return null;
  const x = S.map[i], d = datosDecisionObra(x.b), o = d.opciones[k]; if (!o) return null;
  x.dd = k + 1;
  const fx = applyFx(S, o.fx);
  S.log.unshift({ y: S.year, t: `${d.titulo} ${o.texto}.` });
  return { ...o, fx };
}
