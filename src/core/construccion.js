// Obras por etapas (fase 2): las obras grandes tardan de 1 a 3 años, se pagan por etapa y, mientras
// se construyen, emplean gente. Sin oro para la siguiente etapa la obra se detiene; si sigue detenida,
// queda como elefante blanco. Marca por casilla: x.ob = { n: etapas, p: etapas pagadas, c: cuota, det: años detenida }.
// Solo en el terreno en acuarela (en el modo de comparación con la v9 todo se construye al instante).
import { C } from './contenido.js';
import { climaActivo } from './clima.js';
import { azar } from './azar.js';
import { cost } from './reglas.js';
import { loanRate } from './hacienda.js';
import { vistaPrevia } from './obras.js';

const K = () => C.OBRAS;

// ¿Esta obra se construye por etapas en esta partida?
export function porEtapas(S, k) { return climaActivo(S) && (C.B[k].anios || 0) > 0; }
export function enObra(x) { return !!(x && x.ob); }
// Cuántas obras de cada tipo hay en construcción (para no empezar otra igual).
export function obrasEnCurso(S) {
  const c = {};
  for (const x of S.map) if (x.b && x.ob) c[x.b] = (c[x.b] || 0) + 1;
  return c;
}
// Etapa que se construye ahora (texto) y si la obra está detenida o es un elefante blanco.
export function etapaDe(x) {
  const o = x.ob, nombres = K().etapas[o.n] || K().etapas['1'];
  return nombres[Math.min(o.p, o.n) - 1] || nombres[0];
}
export function detenida(x) { return enObra(x) && x.ob.det > 0; }
export function elefante(x) { return enObra(x) && x.ob.det >= K().aniosElefante; }
// Obras que avanzan este año (dan empleo); las detenidas no.
export function obrasActivas(S) { return S.map.filter(x => x.b && x.ob && !x.ob.det).length; }
export function empleosDeObra(S) { return climaActivo(S) ? obrasActivas(S) * K().empleosPorObra : 0; }
// Lo que se pagará al cerrar el año por las obras que siguen (si alcanza el oro).
export function cuotasPendientes(S) {
  let t = 0;
  for (const x of S.map) if (x.b && x.ob && x.ob.p < x.ob.n) t += x.ob.c;
  return t;
}

// Al empezar una obra grande: se paga solo la primera etapa.
export function cuotaInicial(S, k, costoTotal) { return porEtapas(S, k) ? Math.round(costoTotal / C.B[k].anios) : costoTotal; }
export function empezarObra(S, i, k, costoTotal) {
  if (!porEtapas(S, k)) return;
  const n = C.B[k].anios;
  S.map[i].ob = { n, p: 1, c: Math.round(costoTotal / n), det: 0 };
}

// Cierre del año: las obras con todas sus etapas pagadas se terminan; las demás pagan la siguiente etapa
// si el tesoro alcanza, o se detienen. Devuelve { news, terminadas }.
export function avanzarObras(S) {
  if (!climaActivo(S)) return { news: [], terminadas: [] };
  const T = K().textos, news = [], terminadas = [];
  S.map.forEach((x, i) => {
    if (!x.b || !x.ob) return;
    const o = x.ob, nombre = C.B[x.b].a;
    if (o.p >= o.n && !o.det && o.extra) { delete o.extra; o.n++; news.push(T.sobrecosto.replace('{obra}', nombre).replace('{c}', o.c)); }
    if (o.p >= o.n && !o.det) { if (o.u0) x.u = o.u0; delete x.ob; terminadas.push(i); news.push(T.termina.replace('{obra}', nombre)); return; }
    if (S.gold >= o.c) {
      S.gold -= o.c; o.p++;
      if (o.det) news.push(T.reanuda.replace('{obra}', nombre));
      o.det = 0;
    } else {
      o.det++;
      if (o.det === 1) news.push(T.detenida.replace('{obra}', nombre).replace('{c}', o.c));
      else if (o.det === K().aniosElefante) news.push(T.elefante.replace('{obra}', nombre).replace('{n}', o.det));
    }
  });
  return { news, terminadas };
}
// Oro que devuelve demoler una obra a medias (una parte de lo pagado).
export function devolucionObra(x) { return Math.round(x.ob.c * x.ob.p * K().devolucionAlDemoler); }

// ---------- Evaluación del proyecto y licitación (fase 2, paso 2) ----------

// Tres ofertas de contratistas para una obra grande (precio total, cuota por año y soborno si lo hay).
export function ofertas(S, k) {
  const base = cost(S, k), n = C.B[k].anios;
  return K().ofertas.map(o => {
    const total = Math.round(base * o.precio);
    return { ...o, total, cuota: Math.round(total / n), anios: n, sob: o.soborno ? Math.round(base * o.soborno) : 0 };
  });
}
export function oferta(S, k, id) { return ofertas(S, k).find(o => o.id === id) || ofertas(S, k)[0]; }

// Ficha del proyecto: inversión, resultado anual cuando funcione, VPN y recuperación, más el beneficio social.
export function evaluarProyecto(S, k, i) {
  const v = vistaPrevia(S, k, i);
  if (v.motivo) return v;
  const r = loanRate(S), H = K().horizonteVPN, n = C.B[k].anios || 1, inversion = cost(S, k), cuota = Math.round(inversion / n);
  let vpn = 0;
  for (let t = 0; t < n; t++) vpn -= cuota / (1 + r) ** t;
  for (let t = n; t < n + H; t++) vpn += v.dn / (1 + r) ** t;
  const recupera = v.dn > 0 ? n + Math.ceil(inversion / v.dn) : null;
  return { ...v, inversion, cuota, anios: n, tasa: r, vpn: Math.round(vpn), recupera, horizonte: H };
}

// Contratar: aplica el precio de la oferta, la calidad (desgaste inicial y sobrecosto) y el soborno.
export function aplicarOferta(S, i, k, o) {
  const x = S.map[i];
  if (!x.ob || !o) return [];
  const news = [];
  x.ob.c = o.cuota; x.ob.of = o.id;
  if (o.desgasteInicial) x.ob.u0 = o.desgasteInicial;
  if (o.sobrecosto && azar() < o.sobrecosto) x.ob.extra = 1;
  if (o.sob) {
    S.gold += o.sob; S.corr = Math.min(100, S.corr + (o.rumbo || 0));
    news.push(K().textos.soborno.replace('{s}', o.sob));
    const e = o.escandalo;
    if (e && azar() < e.probabilidad) S.later.push({ y: S.year + e.anios[0] + Math.floor(azar() * (e.anios[1] - e.anios[0] + 1)), id: 'soborno_escandalo', from: S.year });
  }
  return news;
}
