// Mundo vivo (fase 16, punto 5): lo que pasa en las polis vecinas, con hechos reales de cada época, llega a tu plaza.
// Un tratado o una liga con la polis protagonista amortigua el golpe y aumenta el beneficio. Solo en acuarela.
import { C } from './contenido.js';
import { azar, clamp } from './azar.js';
import { epocaHistorica } from './reglas.js';
import { exteriorActivo, relacionExterior } from './exterior.js';
import { applyFx } from './dilemas.js';

const K = () => C.MUNDO;
export const mundoVivoActivo = S => exteriorActivo(S) && !!C.MUNDO;
// Los hechos reales pasan en su año del juego (fijos), con efectos suaves para que no cambien la partida.
const suave = (fx, e) => Object.fromEntries(Object.entries(fx || {}).map(([k, v]) => [k, Math.round(v * e) || Math.sign(v)]));
export function mundoDelAnio(S) {
  if (!mundoVivoActivo(S)) return [];
  const vistos = S.mundoVistos || [], h = K().hechos.filter(x => x.anio !== undefined && S.year >= x.anio && !vistos.includes(x.id)).sort((a, b) => a.anio - b.anio)[0];
  if (!h) return [];
  const E = relacionExterior(S, h.lugar), lugar = C.EXT.lugares[h.lugar], trato = !!(E && E.trato), fx = applyFx(S, suave(trato && h.conTrato ? h.conTrato : h.efectos, K().escalaFija || .6));
  if (E) E.rel = clamp(E.rel + (h.relacion || 0), 0, 100);
  S.mundoVistos = [...vistos, h.id]; S.mundoUlt = S.year;
  const ev = { id: h.id, anio: S.year, titulo: h.titulo, texto: h.texto, fecha: h.fecha, lugar: lugar.nombre, trato, fx };
  S.mundoHechos = [ev, ...(S.mundoHechos || [])].slice(0, 12);
  S.log.unshift({ y: S.year, t: `${lugar.nombre}: ${h.titulo} (${h.fecha}). ${h.texto}` });
  return [`🌎 ${lugar.nombre}: ${h.titulo} (${h.fecha}).`];
}
