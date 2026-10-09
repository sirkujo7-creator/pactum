// Construir, deshacer y demoler.
import { clamp } from './azar.js';
import { C } from './contenido.js';
import { contradecir, deshacerFaltas } from './acta.js';
import { reaccionar, copiaRelaciones, restaurarRelaciones } from './figuras.js';
import { climaActivo } from './clima.js';
import { cap, cost } from './reglas.js';
import { nearRiver, lado } from './mundo.js';
import { marcarTala } from './suelo.js';
import { cuotaInicial, empezarObra, devolucionObra, porEtapas, oferta, aplicarOferta } from './construccion.js';
import { fincasActivas, mejorCultivo } from './fincas.js';
import { materialesActivos, motivoMat, pagarMat, devolverMat } from './materiales.js';

// Devuelve el motivo por el que no se puede construir k en la casilla i, o '' si se puede.
export function whyNot(S, k, i) {
  const x = S.map[i], b = C.B[k];
  if (x.t === 'rio') return 'No se puede construir sobre el río.';
  if (x.b) return 'Esa casilla ya está ocupada.';
  if (x.oc && C.GUERRA) return C.GUERRA.textos.ocupada.replace('{vecino}', C.VECINOS.vecinos[x.oc].nombre); // fase 9
  if (x.mk && x.mk.t === 'resguardo' && C.HUELLAS) return C.HUELLAS.textos.resguardo;
  if (esColono(x) && C.HUELLAS) return C.HUELLAS.colonos.textos.bloquea; // huellas: la parcela de unos colonos
  const fu = motivoFundacion(S, k, i); if (fu) return fu; // la plaza de fundación y el casco urbano
  if (x.mk && x.mk.t === 'asentamiento') return 'Hay un asentamiento: primero decide si lo legalizas o lo desalojas.';
  const finca = fincasActivas(S); // fase 10: el café se siembra en una finca; la finca va en llano o en bosque (talándolo)
  if (finca && k === 'cafetal') return C.CULTIVOS.textos.sinCafetal;
  if (!(finca && k === 'cultivo' ? ['llano', 'bosque'] : b.ok).includes(x.t)) return `${b.n}: ese terreno no sirve.`;
  if (b.hmin && (x.h || 0) < b.hmin) return `${b.n}: necesita ladera (terreno alto).`;
  if (b.river && !nearRiver(S, i)) return `${b.n}: debe estar junto al río.`;
  if ((k === 'aserradero' || k === 'cantera' || k === 'estudio') && !materialesActivos(S)) return 'No disponible.';
  if ((k === 'aserradero' || k === 'cantera') && !cercaDeMateria(S, k, i)) return k === 'aserradero' ? 'El aserradero va junto al bosque (a dos casillas como máximo).' : 'La cantera va junto a la montaña (a dos casillas como máximo).';
  if (k === 'estudio' && S.map.some(y => y.b === 'estudio')) return C.MIN.textos.yaHay;
  const tp = motivoTope(S, k); if (tp) return tp; // fase 17: el tope de la plaza
  const pago = cuotaInicial(S, k, cost(S, k));
  if (S.gold < pago) return `Te faltan ${pago - Math.floor(S.gold)} de oro.`;
  return motivoMat(S, k); // fase 17: madera, piedra, metal
}

// Aserradero y cantera tienen sentido junto a su materia prima: el bosque o la montaña, a dos casillas como máximo.
function cercaDeMateria(S, k, i) {
  const N = lado(S), r0 = Math.floor(i / N), c0 = i % N, t = k === 'aserradero' ? 'bosque' : 'montana';
  for (let r = Math.max(0, r0 - 2); r <= Math.min(N - 1, r0 + 2); r++) for (let c = Math.max(0, c0 - 2); c <= Math.min(N - 1, c0 + 2); c++) if (S.map[r * N + c].t === t) return true;
  return false;
}
// Devuelve true, un mensaje (si taló bosque) o el motivo por el que no se pudo.
// ofertaElegida (fase 2): contratista de la licitación; sin ella, la oferta de buena reputación.
export function build(S, k, i, ofertaElegida) {
  const r = whyNot(S, k, i);
  if (r) return r;
  const x = S.map[i], o = porEtapas(S, k) ? oferta(S, k, ofertaElegida, i) : null, total = o ? o.total : cost(S, k), pago = o ? o.cuota : cuotaInicial(S, k, total);
  if (S.gold < pago) return `Te faltan ${pago - Math.floor(S.gold)} de oro.`;
  S.gold -= pago; // fase 2: las obras grandes pagan solo su primera etapa
  const pagoMat = pagarMat(S, k);
  let msg = '';
  const tl = x.tl;
  if (x.t === 'bosque') { x.t = 'llano'; S.env = clamp(S.env - 3, 0, 100); msg = 'Talaste bosque: el ambiente baja.'; marcarTala(S, i); }
  S.undo.push({ i, k, paid: pago, ...(pagoMat ? { mat: pagoMat } : {}), forest: x.t === 'llano' && !!msg, ...(msg && x.tl && !tl ? { tl: 1 } : {}) });
  x.b = k;
  if (x.mk) { S.undo[S.undo.length - 1].mk = x.mk; delete x.mk; } // fase 4: construir encima borra la huella
  if (climaActivo(S)) x.ya = S.year; // fase 5: año de construcción (las obras viejas son patrimonio)
  if (k === 'cultivo' && fincasActivas(S)) { x.cv = mejorCultivo(S, i, 'comida'); x.cvDesde = S.year; x.nueva = true; } // fase 10: se elige el cultivo en su ficha
  if (k === 'taller' && industriaActiva(S)) x.nuevaF = true; // fase 11: el primer producto va incluido
  empezarObra(S, i, k, total, o ? o.anios : undefined);
  const nLater = S.later.length, aviso = aplicarOferta(S, i, k, o);
  // Deshacer también devuelve el soborno (y borra el escándalo pendiente).
  if (o && o.sob) Object.assign(S.undo[S.undo.length - 1], { sob: o.sob, rumbo: o.rumbo || 0, escandalo: S.later.length > nLater });
  if (aviso.length) msg = [msg, ...aviso].filter(Boolean).join(' ');
  // Fase 3: abrir una mina o aceptar un soborno puede contradecir el acta fundacional.
  const faltas = [...(k === 'mina' ? contradecir(S, 'mina') : []), ...(o && o.sob ? contradecir(S, 'soborno') : [])];
  if (faltas.length) S.undo[S.undo.length - 1].acta = faltas.length;
  // Fase 4: los personajes reaccionan (deshacer la obra deshace también su reacción).
  if (k === 'policia' || k === 'mina' || k === 'iglesia' || (o && o.sob)) {
    S.undo[S.undo.length - 1].rel = copiaRelaciones(S);
    if (k === 'policia' || k === 'mina' || k === 'iglesia') reaccionar(S, k);
    if (o && o.sob) reaccionar(S, 'soborno');
  }
  const fm = avanzarFundacion(S, i); if (fm) msg = (msg ? msg + ' ' : '') + fm; // la misión de fundación
  return msg || true;
}

export function undoBuild(S) {
  const u = S.undo.pop();
  if (!u) return null;
  const x = S.map[u.i];
  x.b = null; delete x.ob; delete x.mt; delete x.u; delete x.ya; delete x.cv; delete x.cvDesde; delete x.nueva; delete x.pr; delete x.nuevaF; delete x.nv; delete x.mn; delete x.mj; delete x.dd; S.gold += u.paid; devolverMat(S, u.mat);
  if (u.sob) { S.gold -= u.sob; S.corr = Math.max(0, S.corr - u.rumbo); if (u.escandalo) S.later.pop(); }
  if (u.acta) deshacerFaltas(S, u.acta);
  if (u.rel) restaurarRelaciones(S, u.rel);
  if (u.mk) x.mk = u.mk;
  if (u.k === 'fundacion' && S.fundando) { S.fundando.plaza = 1; delete S.centro; } // deshacer la plaza: se vuelve a elegir el centro
  if (u.forest) { x.t = 'bosque'; S.env = clamp(S.env + 3, 0, 100); if (u.tl) delete x.tl; }
  if (S.pop > cap(S)) S.pop = cap(S);
  return u;
}

// Demoler devuelve el 30% del costo actual.
export function demolish(S, i) {
  const x = S.map[i];
  if (!x.b || x.b === 'fundacion') return 0; // la plaza de fundación no se demuele
  const g = x.ob ? devolucionObra(x) : Math.round(cost(S, x.b) * .3);
  // Fase 5: demoler patrimonio cuesta legitimidad y queda en la memoria.
  if (esPatrimonio(S, x)) { S.tr = clamp(S.tr - C.MEMORIA.demolerPatrimonio, 0, 100); recordar(S, 'olvido', 2); }
  S.gold += g; x.b = null; delete x.ob; delete x.mt; delete x.u; delete x.ya; delete x.cv; delete x.cvDesde; delete x.nueva; delete x.pr; delete x.nuevaF; delete x.nv; delete x.mn; delete x.mj; delete x.dd;
  if (S.pop > cap(S)) S.pop = cap(S);
  return g;
}

export function freeTiles(S, k) { return S.map.map((x, i) => i).filter(i => !whyNot(S, k, i)); }

// Vista previa de una obra (como en la v9): qué cambia si se construye en el primer lugar posible.
// Devuelve { motivo } si no se puede, o { i, costo, dn, net, dj, df, cupos, de }.
import { finance } from './hacienda.js';
import { envTarget, satTargets } from './sociedad.js';
import { counts } from './reglas.js';
import { esPatrimonio, recordar } from './memoria.js';
import { industriaActiva } from './industria.js';
import { avanzarFundacion } from './estado.js';
import { motivoFundacion, esColono } from './huellas.js';
import { motivoTope } from './plaza.js';
export function vistaPrevia(S, k, iElegida) {
  let t = iElegida !== undefined ? [iElegida].filter(i => !whyNot(S, k, i)) : freeTiles(S, k);
  if (!t.length) return { motivo: S.gold < cuotaInicial(S, k, cost(S, k)) ? `Te faltan ${cuotaInicial(S, k, cost(S, k)) - Math.floor(S.gold)} de oro.` : 'No hay terreno disponible.' };
  if (k === 'cultivo' && iElegida === undefined) { const rv = t.filter(i => nearRiver(S, i)); if (rv.length) t = rv; }
  const i = t[0], x = S.map[i], F0 = finance(S), e0 = envTarget(S, counts(S)), a0 = satTargets(S, counts(S), false);
  const tt = x.t; x.b = k; if (tt === 'bosque') x.t = 'llano';
  const F1 = finance(S), e1 = envTarget(S, counts(S)), a1 = satTargets(S, counts(S), false);
  x.b = null; x.t = tt;
  return {
    i, costo: cost(S, k), cuota: cuotaInicial(S, k, cost(S, k)), anios: porEtapas(S, k) ? C.B[k].anios : 0, dn: F1.net - F0.net, net: F1.net,
    dj: (F1.so.jc + F1.so.ja) - (F0.so.jc + F0.so.ja), df: F1.fprod - F0.fprod,
    cupos: k === 'casa' ? 10 : 0, de: e1 - e0 - (tt === 'bosque' ? 3 : 0), ...detalle(S, k, F0, F1, a0, a1)
  };
}
// Claridad: detalle de lo que cambia (empleos por clase, ánimo de cada clase, agua, energía, alcance, mantenimiento).
function detalle(S, k, F0, F1, a0, a1) {
  const B = C.B[k];
  return {
    djc: F1.so.jc - F0.so.jc, dja: F1.so.ja - F0.so.ja,
    dsat: { c: a1.c - a0.c, a: a1.a - a0.a, e: a1.e - a0.e },
    agua: B.water || 0, energia: B.energy || 0, mant: Math.round(B.up * S.price),
    radio: C.COB && climaActivo(S) && S.stage >= 1 ? (C.COB.radios[k] || 0) : 0
  };
}
// Lo que aporta hoy una obra ya construida: lo que se perdería si no estuviera.
export function aporteObra(S, i) {
  const x = S.map[i], k = x.b;
  if (!k) return null;
  const F1 = finance(S), e1 = envTarget(S, counts(S)), a1 = satTargets(S, counts(S), false), ob = x.ob, u = x.u;
  x.b = null; delete x.ob; delete x.u;
  const F0 = finance(S), e0 = envTarget(S, counts(S)), a0 = satTargets(S, counts(S), false);
  x.b = k; if (ob) x.ob = ob; if (u !== undefined) x.u = u;
  return { dn: F1.net - F0.net, df: F1.fprod - F0.fprod, de: e1 - e0, cupos: k === 'casa' ? 10 : 0, ...detalle(S, k, F0, F1, a0, a1) };
}
