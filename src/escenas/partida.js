// Partida en curso, compartida por el mapa y la interfaz.
import { cargarContenido, freshState } from '../core/index.js';

export const partida = { S: null };

// Crea una partida nueva. En la dirección se pueden poner opciones de prueba:
//   ?lado=64      tamaño del mapa (16 a 64)
//   ?prueba=1     mucho oro y etapa Polis, para ver todas las obras
//   ?reg=monarquia  régimen inicial
export async function nuevaPartida(semilla) {
  await cargarContenido();
  const q = new URLSearchParams(location.search);
  const lado = Math.max(16, Math.min(64, +q.get('lado') || 32));
  const reg = ['monarquia', 'aristocracia', 'republica', 'tirania', 'oligarquia', 'demagogia'].includes(q.get('reg')) ? q.get('reg') : 'republica';
  const S = freshState('normal', false, semilla || null, reg, { n: lado });
  if (q.get('prueba')) { S.gold = 5000; S.stage = +q.get('etapa') >= 0 && q.get('etapa') !== null ? Math.min(3, +q.get('etapa')) : 3; }
  partida.S = S;
  return S;
}
