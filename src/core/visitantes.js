// Visitantes extranjeros (fase 16, punto 5): de vez en cuando llega alguien de otra polis o de otro país, con su acento y su
// manera de hablar. Se ve caminando por el pueblo y deja una frase para pensar. Solo en acuarela.
import { C } from './contenido.js';
import { azar, clamp } from './azar.js';
import { epocaHistorica } from './reglas.js';
import { exteriorActivo, relacionExterior } from './exterior.js';
import { applyFx } from './dilemas.js';

const K = () => C.VISIT;
export const visitantesActivos = S => exteriorActivo(S) && !!C.VISIT;
export function datosVisitante(id) { return K().visitantes.find(v => v.id === id); }
export function visitanteDelAnio(S) {
  if (!visitantesActivos(S) || S.year < K().desde || S.year - (S.visitanteUlt ?? -99) < K().aniosEntre || !(azar() < K().prob)) return [];
  const ep = epocaHistorica(S), vistos = S.visitantesVistos || [];
  const L = K().visitantes.filter(v => v.epoca === ep && !vistos.includes(v.id) && (!v.lugar || relacionExterior(S, v.lugar)));
  if (!L.length) return [];
  const v = L[Math.floor(azar() * L.length)], fx = applyFx(S, v.efectos);
  if (v.lugar) { const E = relacionExterior(S, v.lugar); E.rel = clamp(E.rel + 2, 0, 100); }
  S.visitantesVistos = [...vistos, v.id]; S.visitanteUlt = S.year; S.visitante = { id: v.id, anio: S.year, nuevo: true, fx };
  S.log.unshift({ y: S.year, t: `${v.nombre} (${v.origen}) visita el pueblo: «${v.dialogo}»` });
  return [`${v.icono} ${v.nombre}, de ${v.origen}, llegó de visita.`];
}
