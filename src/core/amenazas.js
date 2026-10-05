// Más desastres y clima (fase 7): epidemias según la época (fiebre amarilla, la gran gripe, pandemia), avenidas
// torrenciales que bajan por las laderas taladas, sequías que se alargan y un cambio climático que hace más
// frecuentes El Niño y La Niña. Son crisis mayores: respetan los años de respiro y siempre se pueden preparar.
// Solo en el terreno en acuarela.
import { C } from './contenido.js';
import { registrarMuertes, dejarRuinas, noticiaRuinas, factorEpidemia } from './huellas.js';
import { azar, clamp } from './azar.js';
import { counts, epocaHistorica } from './reglas.js';
import { marcarCrisis } from './clima.js';
import { nearRiver } from './mundo.js';

const K = () => C.AMENAZAS;
export function amenazasActivas(S) { return !!epocaHistorica(S) && !!C.AMENAZAS; }
function datos(S) { if (!S.amen) S.amen = { ultEpi: -99, ultAven: -99, vigilancia: false }; return S.amen; }

// Cambio climático: multiplicador de la probabilidad de El Niño y La Niña.
export function factorClimatico(S) { if (!amenazasActivas(S)) return 1; const Q = K().clima; return 1 + Math.max(0, S.year - Q.desde) / 50 * Q.aumento; }

// Epidemias.
export function tipoEpidemia(S) { return K().epidemia.tipos.find(t => S.year < t.hasta); }
export function perdidaEpidemia(S) {
  const E = K().epidemia, c = counts(S);
  return Math.max(E.minimo, E.perdida - c.hospital * E.porHospital - (c.acueducto ? E.porAcueducto : 0) - (S.amen && S.amen.vigilancia ? E.porVigilancia : 0));
}
export function costoVigilancia(S) { return Math.round(K().epidemia.vigilancia.costo * S.price); }
export function puedeVigilancia(S) { if (S.amen && S.amen.vigilancia) return 'Ya tienes vigilancia epidemiológica.'; if (S.stage < K().epidemia.desdeEtapa) return 'Desde Pueblo.'; if (S.gold < costoVigilancia(S)) return `Necesitas ${costoVigilancia(S)} de oro.`; return null; }
export function comprarVigilancia(S) { if (puedeVigilancia(S)) return false; S.gold -= costoVigilancia(S); datos(S).vigilancia = true; return true; }

// Avenidas torrenciales: parte de las laderas taladas o erosionadas.
function laderasPeladas(S) { const L = S.map.filter(x => (x.h || 0) >= 1 && x.t !== 'rio'); return L.length ? L.filter(x => x.t !== 'bosque' && (x.tl || x.er > 0)).length / L.length : 0; }
export function probAvenida(S) { const A = K().avenida; return S.year < A.desde ? 0 : A.prob * (1 + A.porLaderaPelada * laderasPeladas(S)); }
export function riesgoLaderas(S) { return laderasPeladas(S); }

// Cierre del año. crisisLibre: si puede llegar una crisis mayor. Devuelve las noticias; la tarjeta queda en S.amenEv.
export function amenazasDelAnio(S, libre) {
  if (!amenazasActivas(S)) return [];
  const A = datos(S), R = K(), news = [];
  // La sequía de El Niño puede alargarse un año (es la misma crisis).
  const SL = R.sequiaLarga;
  if (S.clima.fenomeno === 'nino' && S.year >= SL.desde && !S.clima.largo && !S.clima.pronostico && azar() < SL.prob) {
    S.clima.pronostico = { tipo: 'nino', anio: S.year + 1 }; S.clima.largo = S.year + 1;
    S.amenEv = { tipo: 'sequia' }; news.push('☀️ ' + SL.texto);
    return news;
  }
  if (S.clima.largo && S.clima.largo < S.year) S.clima.largo = 0;
  if (!libre) return news;
  // Epidemia.
  const E = R.epidemia;
  if (S.stage >= E.desdeEtapa && S.year - A.ultEpi >= E.enfriar && azar() < E.prob * factorEpidemia(S)) { // huellas: sin cementerio, más riesgo
    const t = tipoEpidemia(S), perdidos = Math.max(1, Math.round(S.pop * perdidaEpidemia(S)));
    const costo = Math.round(S.pop * E.costoPorHabitante * S.price), fondo = Math.min(S.fondo || 0, costo);
    S.pop = Math.max(1, S.pop - perdidos); S.fondo = (S.fondo || 0) - fondo; S.gold -= costo - fondo;
    ['c', 'a', 'e'].forEach(k => S.sat[k] = clamp(S.sat[k] - E.animo, 0, 100));
    A.ultEpi = S.year; marcarCrisis(S); registrarMuertes(S, perdidos, 'epidemia');
    S.amenEv = { tipo: 'epidemia', id: t.id, perdidos, costo, fondo, vigilancia: !!A.vigilancia };
    news.push(`${t.icono} ${t.nombre}: se perdieron ${perdidos} vidas.`);
    return news;
  }
  // Avenida torrencial.
  const V = R.avenida;
  if (S.year - A.ultAven >= V.enfriar && azar() < probAvenida(S)) {
    let danadas = 0; const tocadas = [];
    S.map.forEach((x, i) => { if (x.b && ((x.h || 0) >= 1 || nearRiver(S, i)) && azar() < (x.tl || x.er > 0 ? .7 : .25)) { x.u = Math.min(100, (x.u || 0) + V.dano); x.sin = S.year; danadas++; tocadas.push(i); } });
    const perdidos = Math.round(S.pop * V.perdida * (1 + laderasPeladas(S)));
    S.pop = Math.max(1, S.pop - perdidos);
    A.ultAven = S.year; marcarCrisis(S); registrarMuertes(S, perdidos, 'avenida');
    const ruinas = dejarRuinas(S, 'avenida', tocadas);
    S.amenEv = { tipo: 'avenida', danadas, perdidos, ruinas, peladas: Math.round(laderasPeladas(S) * 100) };
    news.push(`${V.icono} ${V.nombre}: ${danadas} obras dañadas.`);
    if (ruinas) news.push(noticiaRuinas(ruinas));
  }
  return news;
}
