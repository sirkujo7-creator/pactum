// Cobertura por distancia (fase 2): escuelas, hospitales y mercados atienden solo a las casas cercanas,
// y fuera del alcance de una oficina de recaudo (o del centro del pueblo) parte de la gente evade impuestos.
// Se abre en Pueblo, solo en el terreno en acuarela.
import { C } from './contenido.js';
import { lado } from './mundo.js';
import { climaActivo } from './clima.js';

const K = () => C.COB;
export const SERVICIOS = ['escuela', 'hospital', 'mercado', 'recaudo'];

export function coberturaActiva(S) { return climaActivo(S) && S.stage >= 1; }
// Una obra presta servicio si está terminada y no abandonada.
const sirve = x => x.b && !x.ob && !(x.u >= 80);
const casasEnUso = S => S.map.map((x, i) => x.b === 'casa' && sirve(x) ? i : -1).filter(i => i >= 0);
const dist = (S, a, b) => { const N = lado(S); return Math.hypot(Math.floor(a / N) - Math.floor(b / N), a % N - b % N); };

// Centro del pueblo: donde se fundó la aldea (o el ágora, si ya existe). También recauda.
export function centroPueblo(S) {
  const ag = S.map.findIndex(x => x.b === 'agora' && sirve(x));
  if (ag >= 0) return ag;
  if (S.centro !== undefined) return S.centro;
  return S.map.findIndex(x => x.b === 'casa');
}
// Puntos que prestan un servicio, con su radio.
export function puntosDe(S, servicio) {
  const R = K().radios, p = [];
  S.map.forEach((x, i) => { if (sirve(x) && x.b === servicio) p.push({ i, r: R[servicio] }); });
  if (servicio === 'recaudo') {
    const c = centroPueblo(S);
    if (c >= 0) p.push({ i: c, r: S.map[c].b === 'agora' ? R.agora : R.centro, centro: true });
  }
  return p;
}
export function cubre(S, servicio, i) { return puntosDe(S, servicio).some(p => dist(S, p.i, i) <= p.r); }

// Fracción de las casas que tienen cada servicio a su alcance (1 si la cobertura aún no se abre).
export function cobertura(S) {
  const out = { escuela: 1, hospital: 1, mercado: 1, recaudo: 1 };
  if (!coberturaActiva(S)) return out;
  // Una sola pasada por el mapa: casas y puntos de servicio (esta función se llama muy seguido).
  const R = K().radios, N = lado(S), casas = [], P = { escuela: [], hospital: [], mercado: [], recaudo: [] };
  let ag = -1;
  S.map.forEach((x, i) => {
    if (!sirve(x)) return;
    if (x.b === 'casa') casas.push(i);
    else if (P[x.b]) P[x.b].push({ i, r: R[x.b] });
    else if (x.b === 'agora' && ag < 0) ag = i;
  });
  if (!casas.length) return out;
  const c = ag >= 0 ? ag : S.centro !== undefined ? S.centro : casas[0];
  P.recaudo.push({ i: c, r: ag >= 0 ? R.agora : R.centro });
  const d2 = (a, b) => { const dr = Math.floor(a / N) - Math.floor(b / N), dc = a % N - b % N; return dr * dr + dc * dc; };
  for (const s of SERVICIOS) out[s] = casas.filter(i => P[s].some(p => d2(p.i, i) <= p.r * p.r)).length / casas.length;
  return out;
}
// Servicios que tiene cerca una casa (para la ficha y la capa del mapa).
export function serviciosDeCasa(S, i) { return Object.fromEntries(SERVICIOS.map(s => [s, cubre(S, s, i)])); }
// Cuántas casas sin ese servicio quedarían cubiertas con uno nuevo en la casilla i (para elegir dónde construir).
export function casasNuevasCubiertas(S, servicio, i) {
  const r = K().radios[servicio];
  if (!r) return 0;
  const P = puntosDe(S, servicio);
  return casasEnUso(S).filter(j => dist(S, i, j) <= r && !P.some(p => dist(S, p.i, j) <= p.r)).length;
}
// Ordena casillas candidatas para un servicio: primero las que cubren más casas sin servicio, luego las más cercanas
// al centro. Calcula casas y puntos una sola vez (lo usan los robots, que prueban muchas casillas).
export function ordenarSitios(S, servicio, candidatas, extra = () => 0) {
  const r = K().radios[servicio], c = centroPueblo(S);
  let sin = [];
  if (r) { const P = puntosDe(S, servicio); sin = casasEnUso(S).filter(j => !P.some(p => dist(S, p.i, j) <= p.r)); }
  const nota = i => (r ? -sin.filter(j => dist(S, i, j) <= r).length * 10 : 0) + (c < 0 ? 0 : dist(S, c, i)) + extra(i);
  return candidatas.map(i => [i, nota(i)]).sort((a, b) => a[1] - b[1]).map(x => x[0]);
}
// Parte de los impuestos que se pierde por evasión.
export function evasion(S) { return coberturaActiva(S) ? K().evasion * (1 - cobertura(S).recaudo) : 0; }
export function distanciaCentro(S, i) { const c = centroPueblo(S); return c < 0 ? 0 : dist(S, c, i); }
// Función de distancia al centro (busca el centro una sola vez).
export function medirDesdeCentro(S) { const c = centroPueblo(S); return i => c < 0 ? 0 : dist(S, c, i); }
