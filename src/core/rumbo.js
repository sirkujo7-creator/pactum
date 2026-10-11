// Rumbo del gobierno (0 bien común, 100 interés propio): lo que lo mueve cada año.
// Pedido de Juan (11 de octubre): con la regla anterior la aristocracia y la monarquía se corrompían en todas las
// partidas hacia el año 11 a 16, sin importar cuánto bien se hiciera. Ahora la tendencia del régimen (Polibio)
// se frena si el poder está vigilado (legitimidad alta, prensa libre, ágora) y el buen gobierno se premia por grados.
// En la v9 queda la regla de siempre.
import { C } from './contenido.js';
import { RM, hasLaw, counts } from './reglas.js';
import { efectoLeyes } from './civismo.js';

// Qué tan vigilado está el poder: multiplica la tendencia del régimen (1 = sin freno).
export function vigilancia(S) {
  const V = C.RUMBO; if (S.mundo === 'v9' || !S.clima || !V) return 1;
  let f = Math.max(V.minimo, Math.min(1, (V.legitSinFreno - S.tr) / V.rango)); // con más legitimidad, más freno
  if (hasLaw(S, 'prensa')) f *= V.porPrensa;
  if (counts(S).agora > 0) f *= V.porAgora;
  return f;
}
// Partes del cambio anual del rumbo: [texto, valor]. Las usan el cierre del año y el panel del indicador.
export function partesRumbo(S) {
  const minSat = Math.min(S.sat.c, S.sat.a, S.sat.e), L = k => hasLaw(S, k), d = RM(S, 'drift');
  if (S.mundo === 'v9' || !S.clima) return [['Tendencia del régimen', d], ['Censura', L('censura') ? 1.5 : 0], ['Libertad de prensa', L('prensa') ? -1.5 : 0], ['Alguna clase muy descontenta', minSat < 25 ? 3 : 0], ['Buen gobierno (todos contentos y legitimidad alta)', minSat > 50 && S.tr > 55 ? -2 : 0], ['Leyes nuevas y rasgos del pueblo', efectoLeyes(S, 'rumbo')]];
  const T = (C.RUMBO && C.RUMBO.tendencia[S.reg]) ?? d, v = vigilancia(S), dv = Math.round(T * v * 10) / 10, nom = C.REG[S.reg] ? C.REG[S.reg].n : 'el régimen';
  const B = C.RUMBO ? C.RUMBO.buenGobierno : { todas: 50, legit: 55, valor: -2, ninguna: 40, valorParcial: -1 };
  const bueno = minSat > B.todas && S.tr > B.legit ? B.valor : minSat >= B.ninguna ? B.valorParcial : 0;
  return [
    [T ? `Tendencia de ${nom.toLowerCase()} a corromperse${v < 1 ? ` (frenada: queda al ${Math.round(v * 100)}% por la legitimidad, la prensa libre o el ágora)` : ''}` : 'Tendencia del régimen', dv],
    ['Censura', L('censura') ? 1.5 : 0], ['Libertad de prensa', L('prensa') ? -1.5 : 0],
    ['Alguna clase muy descontenta (menos de 25)', minSat < 25 ? 3 : 0],
    [bueno === -2 ? 'Buen gobierno: las tres clases contentas y legitimidad alta' : 'Buen gobierno: ninguna clase por debajo de 40', bueno],
    ['Leyes nuevas y rasgos del pueblo', efectoLeyes(S, 'rumbo')]];
}
