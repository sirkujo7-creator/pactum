// Mundo vivo (fase 16, punto 5): lo que pasa en las polis vecinas, con hechos reales de cada época, llega a tu plaza.
// Un tratado o una liga con la polis protagonista amortigua el golpe y aumenta el beneficio. Solo en acuarela.
import { C } from './contenido.js';
import { azar, clamp } from './azar.js';
import { epocaHistorica } from './reglas.js';
import { exteriorActivo, relacionExterior } from './exterior.js';
import { applyFx } from './dilemas.js';

const K = () => C.MUNDO;
export const mundoVivoActivo = S => exteriorActivo(S) && !!C.MUNDO;
export function mundoDelAnio(S) {
  if (!mundoVivoActivo(S) || S.year < K().desde || S.year - (S.mundoUlt ?? -99) < K().aniosEntre || !(azar() < K().prob)) return [];
  const ep = epocaHistorica(S), vistos = S.mundoVistos || [];
  const L = K().hechos.filter(h => h.epoca === ep && !vistos.includes(h.id) && relacionExterior(S, h.lugar));
  if (!L.length) return [];
  const h = L[Math.floor(azar() * L.length)], E = relacionExterior(S, h.lugar), lugar = C.EXT.lugares[h.lugar];
  const trato = !!E.trato, fx = applyFx(S, trato && h.conTrato ? h.conTrato : h.efectos);
  E.rel = clamp(E.rel + (h.relacion || 0), 0, 100);
  S.mundoVistos = [...vistos, h.id]; S.mundoUlt = S.year;
  const ev = { id: h.id, anio: S.year, titulo: h.titulo, texto: h.texto, fecha: h.fecha, lugar: lugar.nombre, trato, fx };
  S.mundoHechos = [ev, ...(S.mundoHechos || [])].slice(0, 12);
  S.log.unshift({ y: S.year, t: `${lugar.nombre}: ${h.titulo}. ${h.texto}` });
  return [`🌎 ${lugar.nombre}: ${h.titulo} (${h.fecha}).`];
}
