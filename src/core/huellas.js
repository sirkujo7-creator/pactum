// El mapa cuenta la historia (pedido de Juan, 5 de octubre). Paso 0: la plaza de fundación. Es la primera obra de
// las partidas que se fundan a elección: marca el centro del pueblo y el casco urbano, un radio a su alrededor que
// crece con cada etapa. Las obras urbanas van dentro del casco; fincas, minas y obras del río pueden ir más lejos.
// Las partidas guardadas antes (sin plaza) siguen sin casco.
import { C } from './contenido.js';
import { lado } from './mundo.js';

const K = () => C.HUELLAS && C.HUELLAS.fundacion;
const plazaPendiente = S => !!(S.fundando && S.fundando.plaza);
export function plazaFundacion(S) { return S.map.findIndex(x => x.b === 'fundacion'); }
// Radio del casco urbano en la etapa actual (null si la partida no tiene casco).
export function radioCasco(S) {
  if (!S.casco || !K()) return null;
  const r = K().radios[Math.min(S.stage, K().radios.length - 1)];
  return r >= 99 ? null : r;
}
export function enCasco(S, i) {
  const r = radioCasco(S), c = S.centro;
  if (r === null || c === undefined) return true;
  const N = lado(S);
  return Math.hypot(Math.floor(i / N) - Math.floor(c / N), i % N - c % N) <= r + .01;
}
// Motivo por el que la plaza o el casco impiden construir k en i ('' si nada). Lo usa whyNot.
export function motivoFundacion(S, k, i) {
  const F = K();
  if (!F) return k === 'fundacion' ? 'No disponible.' : '';
  if (k === 'fundacion') return plazaPendiente(S) ? '' : F.textos.solo;
  if (plazaPendiente(S)) return F.textos.primero;
  if (!F.libres.includes(k) && !enCasco(S, i)) return F.textos.fuera.replace('{r}', radioCasco(S));
  return '';
}
// ¿Se muestra la plaza en el panel de construir? Solo mientras falta.
export function ofrecerPlaza(S) { return plazaPendiente(S); }
