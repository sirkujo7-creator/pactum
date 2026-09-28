// Clima del territorio (fase 1): la calidad de las lluvias de cada año afecta las cosechas.
// Solo actúa en el terreno en acuarela; en el modo de comparación con la v9 queda apagado.
import { azar } from './azar.js';
import { C } from './contenido.js';

export function climaActivo(S) { return !!(S && S.clima && S.mundo === 'acuarela'); }
export function climaInicial() { return { lluvias: 'normales' }; }

// Datos del tipo de lluvias de este año.
export function lluvias(S) { return climaActivo(S) ? C.CLIMA.lluvias[S.clima.lluvias] : null; }

// Multiplica la producción de alimento.
export function factorCosecha(S) { const L = lluvias(S); return L ? L.cosecha : 1; }

// Sortea las lluvias del año que empieza. Devuelve la noticia para la crónica.
export function sortearLluvias(S) {
  if (!climaActivo(S)) return null;
  const tipos = Object.entries(C.CLIMA.lluvias);
  let x = azar(), elegido = tipos[tipos.length - 1][0];
  for (const [k, t] of tipos) { if (x < t.probabilidad) { elegido = k; break; } x -= t.probabilidad; }
  S.clima.lluvias = elegido;
  const L = C.CLIMA.lluvias[elegido];
  return `Pronóstico del año ${S.year + 1}: ${L.nombre.toLowerCase()}.`;
}
