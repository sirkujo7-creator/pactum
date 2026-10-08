// La Comisión de la Verdad como mecánica (fase 16): se instala tras el acuerdo de paz (la decisión de reincorporación),
// dura unos años y deja una deuda con las víctimas que se paga escuchando, reparando y recordando. Al terminar entrega un
// informe final que mide cuánto se avanzó. Solo en acuarela.
import { C } from './contenido.js';
import { climaActivo } from './clima.js';
import { applyFx } from './dilemas.js';

const K = () => C.COMISION;
export const comisionActiva = S => climaActivo(S) && !!C.COMISION;
export const costoComision = (S, a) => Math.round(K().acciones[a].costo * S.price);
export function memoriaLevantada(S) { return S.lugaresMem ? Object.keys(S.lugaresMem).length : 0; }
// Puntaje del informe (0 a 100): verdad esclarecida, familias reparadas y lugares de memoria.
export function puntajeComision(S) {
  const c = S.comision; if (!c) return 0;
  return Math.min(100, Math.round(c.verdad * .6 + Math.min(25, c.reparadas * 5) + Math.min(15, memoriaLevantada(S) * 5)));
}
export function puedeComision(S, a) {
  const c = S.comision, T = K().textos; if (!comisionActiva(S) || !c || c.cerrada) return T.ya;
  if (a === 'perdon' ? c.perdon : (c.hechas || []).includes(a)) return a === 'perdon' ? T.una : T.ya;
  const costo = costoComision(S, a); if (S.gold < costo) return T.oro.replace('{n}', costo - Math.floor(S.gold));
  return null;
}
export function accionComision(S, a) {
  if (puedeComision(S, a)) return null;
  const A = K().acciones[a], c = S.comision; S.gold -= costoComision(S, a);
  c.verdad = Math.min(100, c.verdad + A.verdad);
  if (a === 'perdon') c.perdon = true; else { c.hechas = [...(c.hechas || []), a]; if (a === 'reparar') c.reparadas++; }
  const fx = applyFx(S, A.efectos); S.log.unshift({ y: S.year, t: `Comisión de la Verdad: ${K().textos.acciones[a].toLowerCase()}.` });
  return fx;
}
export function comisionDelAnio(S) {
  if (!comisionActiva(S)) return [];
  const T = K().textos, news = [];
  if (!S.comision && S.decisiones && S.decisiones[K().abreCon] !== undefined) {
    S.comision = { abre: S.year, cierra: S.year + K().duracion, verdad: 0, reparadas: 0, hechas: [], nuevo: true };
    news.push(`⚖️ ${T.abre.replace('{n}', K().duracion)}`); S.log.unshift({ y: S.year, t: T.abre.replace('{n}', K().duracion) });
  } else if (S.comision) {
    S.comision.hechas = []; // las acciones se pueden repetir cada año (menos el perdón)
    if (S.decisiones && S.decisiones.h_verdad === 0 && !S.comision.bonoVerdad) { S.comision.bonoVerdad = true; S.comision.verdad = Math.min(100, S.comision.verdad + 10); }
    if (!S.comision.cerrada && S.year >= S.comision.cierra) {
      const c = S.comision, p = puntajeComision(S), nivel = ['alta', 'media', 'baja'].find(k => p >= K().final[k].desde);
      c.cerrada = true; c.informe = { nivel, puntaje: p, nuevo: true, fx: applyFx(S, K().final[nivel].efectos) };
      news.push(`⚖️ ${T.cierra} ${T.final[nivel]}`); S.log.unshift({ y: S.year, t: `${T.cierra} ${T.final[nivel]}` });
    }
  }
  return news;
}
