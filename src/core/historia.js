// Épocas de la historia del Tolima (fase 7): el siglo se divide en seis épocas (fundación, café, La Violencia,
// modernización, conflicto y paz, era digital), cada una con sus dilemas propios (condición "epoca" en dilemas.json).
// Al empezar una época llega una tarjeta con su contexto y su lección. Solo en el terreno en acuarela.
import { C } from './contenido.js';
import { epocaHistorica } from './reglas.js';

export function historiaActiva(S) { return !!epocaHistorica(S); }
export function datosEpoca(id) { return C.HIST.epocas.find(e => e.id === id); }
// Época que sigue: { ...datos, desde } o null.
export function proximaEpoca(S) { const a = epocaHistorica(S), L = C.HIST.epocas, i = L.findIndex(e => e.id === a); return i >= 0 && i < L.length - 1 ? L[i + 1] : null; }

// Cierre del año: si empezó una época nueva, queda la tarjeta en S.eraEv. Devuelve las noticias.
export function historiaDelAnio(S) {
  const id = epocaHistorica(S);
  if (!id || S.era === id) return [];
  S.era = id; S.eraEv = { id, nuevo: true };
  const E = datosEpoca(id);
  return [`${E.icono} Comienza una nueva época: ${E.nombre.toLowerCase()}.`];
}
