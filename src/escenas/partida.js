// Partida en curso, compartida por la portada, el mapa y la interfaz.
import { cargarContenido, freshState } from '../core/index.js';

export const partida = { S: null };
export const REGIMENES = ['monarquia', 'aristocracia', 'republica', 'tirania', 'oligarquia', 'demagogia'];

// Crea una partida nueva. opciones: { diff, guide, reg }.
// En la dirección se pueden poner opciones de prueba:
//   ?lado=64        tamaño del mapa (16 a 64)
//   ?prueba=1       mucho oro y etapa Polis, para ver todas las obras (&etapa=0..3)
//   ?reg=monarquia  régimen inicial
export async function nuevaPartida(semilla, opciones = {}) {
  await cargarContenido();
  const q = new URLSearchParams(location.search);
  const lado = Math.max(16, Math.min(64, +q.get('lado') || 32));
  const reg = opciones.reg || (REGIMENES.includes(q.get('reg')) ? q.get('reg') : 'republica');
  const S = freshState(opciones.diff || 'normal', opciones.guide !== undefined ? opciones.guide : !q.get('prueba'), semilla || null, reg, { n: lado, fundar: !q.get('prueba') && !q.get('clasico'), terr: q.get('terr') || undefined });
  if (q.get('prueba')) { S.gold = 5000; S.stage = q.get('etapa') !== null ? Math.max(0, Math.min(3, +q.get('etapa'))) : 3; }
  partida.S = S;
  return S;
}
