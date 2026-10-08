// Tarjetas rápidas (estilo Reigns, pedido de Juan): un asunto pequeño del pueblo, una frase y dos respuestas, sin avisos
// de lo que va a pasar. Salen al cerrar el año, según la época de la historia. Solo en el terreno en acuarela.
import { C } from './contenido.js';
import { azar } from './azar.js';
import { climaActivo } from './clima.js';
import { epocaHistorica } from './reglas.js';
import { applyFx } from './dilemas.js';

export const tarjetasActivas = S => climaActivo(S) && !!C.TARJETAS;
export function datosTarjeta(id) { return C.TARJETAS.tarjetas.find(t => t.id === id); }
export function tarjetasDelAnio(S) {
  if (!tarjetasActivas(S) || S.year < C.TARJETAS.desde || S.tarjetaRapida) return [];
  if (!(azar() < C.TARJETAS.prob)) return [];
  const ep = epocaHistorica(S), vistas = S.tarjetasVistas || [];
  const L = C.TARJETAS.tarjetas.filter(t => t.epoca === ep && !vistas.includes(t.id));
  if (!L.length) return [];
  const t = L[Math.floor(azar() * L.length)];
  S.tarjetaRapida = { id: t.id, nuevo: true }; S.tarjetasVistas = [...vistas, t.id];
  return [];
}
// Responde a la tarjeta pendiente con la opción i; devuelve lo que pasó (efectos reales).
export function elegirTarjeta(S, i) {
  const e = S.tarjetaRapida; if (!e) return null;
  const t = datosTarjeta(e.id), o = t.opciones[i]; if (!o) return null;
  const fx = applyFx(S, o.fx);
  S.log.unshift({ y: S.year, t: `${t.quien}: ${t.texto} Respondiste: ${o.texto.toLowerCase()}.` });
  S.tarjetaRapida = null;
  return { ...o, fx };
}
