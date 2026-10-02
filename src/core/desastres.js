// Desastres reales del Tolima (fase 4): el Nevado del Ruiz (alertas por niveles, plan de evacuación y lahar por el
// río; lección de Armero, 1985) y el terremoto (sin aviso; se prepara con el código sismorresistente, el
// mantenimiento y el fondo de emergencias; lección del Eje Cafetero, 1999). Son crisis mayores: respetan los años
// de respiro. Solo en el terreno en acuarela.
import { C } from './contenido.js';
import { azar, clamp } from './azar.js';
import { hasLaw } from './reglas.js';
import { climaActivo, marcarCrisis } from './clima.js';
import { nearRiver } from './mundo.js';
import { efectoFig, reaccionar } from './figuras.js';
import { dejarMarca } from './marcas.js';

const K = () => C.DESASTRES;
export function desastresActivos(S) { return climaActivo(S) && !!C.DESASTRES; }
export function volcan(S) { if (!S.volcan) S.volcan = { nivel: 0, plan: false, desde: 0 }; return S.volcan; }
export function nivelVolcan(S) { return desastresActivos(S) && S.volcan ? S.volcan.nivel : 0; }

// ¿Puede llegar una crisis mayor ese año? (respiro, otro fenómeno anunciado, recesión o golpe a la vista)
export function crisisLibre(S, anio) {
  const K2 = S.clima, respiro = C.CLIMA.fenomenos.respiro;
  return anio - K2.ultimaCrisis > respiro && !K2.fenomeno && !(K2.pronostico && Math.abs(K2.pronostico.anio - anio) <= 1)
    && !(S.eco && (S.eco.aviso || S.eco.fase === 'recesion')) && !(S.ejercito && S.ejercito.aviso);
}

export function costoPlan(S) { return Math.round(K().volcan.plan.costo * S.price * (1 - efectoFig(S, 'planDescuento'))); }
export function puedePlan(S) {
  const V = volcan(S);
  if (V.plan) return 'Ya tienes un plan de evacuación.';
  if (V.nivel < 1) return 'El volcán está tranquilo.';
  if (S.gold < costoPlan(S)) return `Necesitas ${costoPlan(S)} de oro.`;
  return null;
}
export function comprarPlan(S) {
  if (puedePlan(S)) return false;
  S.gold -= costoPlan(S); volcan(S).plan = true;
  reaccionar(S, 'planVolcan');
  dejarMarca(S, 'placa', `Año ${S.year}: plan de evacuación ante el Nevado del Ruiz.`);
  S.log.unshift({ y: S.year, t: 'Preparaste un plan de evacuación ante el volcán.' });
  return true;
}

function erupcion(S) {
  const V = volcan(S), E = K().volcan.erupcion, T = K().volcan.textos;
  let danadas = 0;
  S.map.forEach((x, i) => {
    if (!x.b) return;
    const d = nearRiver(S, i) ? E.danoRibera : azar() < .3 ? E.danoOtros : 0;
    if (d) { x.u = Math.min(100, (x.u || 0) + d); x.sin = S.year; danadas++; }
  });
  const perdidos = Math.round(S.pop * (V.plan ? E.perdidaConPlan : E.perdidaSinPlan));
  S.pop = Math.max(1, S.pop - perdidos);
  S.tr = clamp(S.tr + (V.plan ? E.legitimidadConPlan : E.legitimidadSinPlan), 0, 100);
  if (!V.plan) reaccionar(S, 'ignorarVolcan');
  S.ceniza = S.year + 1; S.lahar = S.year;
  S.desastre = { tipo: 'erupcion', anio: S.year, plan: V.plan, perdidos, danadas, nuevo: true };
  const conPlan = V.plan;
  V.nivel = 1; V.desde = S.year; V.plan = false; // tras la erupción, hay que volver a prepararse
  marcarCrisis(S);
  return [T.erupcion, conPlan ? T.conPlan : T.sinPlan];
}

// Cierre del año: volcán y terremoto (como mucho uno). Devuelve las noticias.
export function desastresDelAnio(S) {
  if (!desastresActivos(S)) return [];
  const D = K(), VD = D.volcan, V = volcan(S), T = VD.textos, news = [];
  if (S.stage >= VD.desde.etapa && S.year >= VD.desde.anio) {
    if (V.nivel === 3 && V.desde < S.year) {
      if (crisisLibre(S, S.year) && azar() < VD.probErupcion) return erupcion(S);
      V.nivel = 2; V.desde = S.year; news.push(T.baja.replace('{nivel}', VD.niveles[2].nombre.toLowerCase()));
    } else if (V.nivel < 3 && azar() < VD.probSubir[V.nivel] && (V.nivel < 2 || crisisLibre(S, S.year + 1))) {
      V.nivel++; V.desde = S.year; news.push(T.sube.replace('{nivel}', VD.niveles[V.nivel].nombre.toLowerCase()));
      S.desastre = { tipo: 'alerta', anio: S.year, nivel: V.nivel, nuevo: true };
    } else if (V.nivel > 0 && V.nivel < 3 && azar() < VD.probBajar[V.nivel]) {
      V.nivel--; V.desde = S.year; news.push(T.baja.replace('{nivel}', VD.niveles[V.nivel].nombre.toLowerCase()));
    }
  }
  const Q = D.terremoto;
  if (!S.desastre?.nuevo && S.stage >= Q.desde.etapa && S.year >= Q.desde.anio && crisisLibre(S, S.year) && azar() < Q.prob) {
    const ley = hasLaw(S, 'sismo');
    let danadas = 0;
    S.map.forEach(x => { if (x.b && azar() < (ley ? Q.danoProbConLey : Q.danoProb)) { x.u = Math.min(100, (x.u || 0) + Q.dano + ((x.u || 0) > 40 ? Q.danoExtraViejas : 0)); danadas++; } });
    const perdidos = Math.round(S.pop * (ley ? Q.perdidaConLey : Q.perdida));
    S.pop = Math.max(1, S.pop - perdidos);
    const costo = Math.round(S.pop * Q.costoPorHabitante * S.price), cubierto = Math.min(S.fondo || 0, costo);
    S.fondo = (S.fondo || 0) - cubierto; S.gold -= costo - cubierto;
    if (!ley) S.tr = clamp(S.tr + Q.legitimidad, 0, 100);
    S.desastre = { tipo: 'terremoto', anio: S.year, ley, perdidos, danadas, costo, cubierto, nuevo: true };
    marcarCrisis(S);
    news.push(Q.textos.ocurre, ley ? Q.textos.conLey : Q.textos.sinLey);
  }
  return news;
}
