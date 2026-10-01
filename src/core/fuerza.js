// Legitimidad y uso de la fuerza (fase 3, Weber): algunas opciones de los dilemas usan la fuerza (romper una huelga,
// dispersar una protesta). El resultado depende de la legitimidad que tenía el gobierno al dar la orden: alta, la
// fuerza se acepta; baja, cuesta más legitimidad y trae sabotaje. Si hay Ejército, los soldados pierden ánimo.
// Solo en el terreno en acuarela.
import { C } from './contenido.js';
import { azar, clamp } from './azar.js';
import { climaActivo } from './clima.js';
import { ejercitoActivo, ejercito } from './ejercito.js';

const K = () => C.FUERZA;
export function fuerzaActiva(S) { return climaActivo(S) && !!C.FUERZA; }
export function nivelLegitimidad(v) { const U = K().umbrales; return v >= U.alta ? 'alta' : v < U.baja ? 'baja' : 'media'; }

// Después de aplicar una opción con fuerza. leg: legitimidad antes de la orden; fx: efectos reales (se ajustan aquí).
export function usarFuerza(S, leg, o, fx) {
  const nivel = nivelLegitimidad(leg), N = K().niveles[nivel], r = { nivel, leg: Math.round(leg), textos: [N.texto] };
  if (fx.c && N.multiplicador !== 1) {
    const extra = Math.round(fx.c * (N.multiplicador - 1));
    S.tr = clamp(S.tr + extra, 0, 100); fx.c += extra;
  }
  if (N.cancelaConsecuencia && o.later) {
    const j = S.later.findLastIndex(l => l.id === o.later[1] && l.from === S.year);
    if (j >= 0) { S.later.splice(j, 1); r.cancelada = true; }
  }
  if (N.sabotaje) S.later.push({ y: S.year + N.sabotaje[0] + Math.floor(azar() * (N.sabotaje[1] - N.sabotaje[0] + 1)), id: 'sabotaje', from: S.year });
  if (ejercitoActivo(S)) { const E = ejercito(S); E.animo = clamp(E.animo - K().ejercito.costoAnimo, 0, 100); r.textos.push(K().ejercito.texto); }
  S.fuerzaUsada = (S.fuerzaUsada || 0) + 1;
  return r;
}

// Consecuencia "sabotaje": daña una obra terminada (se ve en el mapa como desgaste). Devuelve el nombre de la obra.
export function sabotear(S) {
  const obras = S.map.map((x, i) => i).filter(i => S.map[i].b && !S.map[i].ob && S.map[i].b !== 'casa');
  if (!obras.length) return null;
  const x = S.map[obras[Math.floor(azar() * obras.length)]];
  x.u = Math.min(100, (x.u || 0) + K().sabotaje.desgaste);
  return C.B[x.b].a;
}
