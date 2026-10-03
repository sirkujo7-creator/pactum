// Barrios y problemáticas (fase 5): desde Ciudad, las casas forman barrios según su dirección desde el centro.
// Cada barrio tiene problemáticas (deserción escolar, trabajo infantil, violencia, brecha de género) que dependen de
// los servicios cercanos, la pobreza y la inseguridad. Los programas sociales las reducen por unos años. Cuando hay
// mucha gente sin empleo o sin casa aparecen asentamientos informales: desalojar, ignorar o legalizar.
// Las problemáticas no son medidores nuevos: pesan en la igualdad y la inseguridad. Solo en el terreno en acuarela.
import { C } from './contenido.js';
import { clamp } from './azar.js';
import { counts, hasLaw, cap } from './reglas.js';
import { climaActivo } from './clima.js';
import { lado, nearRiver } from './mundo.js';
import { centroPueblo, serviciosDeCasa } from './cobertura.js';
import { society } from './sociedad.js';
import { animoGrupo } from './grupos.js';
import { contradecir } from './acta.js';
import { reaccionar } from './figuras.js';
import { dejarMarca } from './marcas.js';

const K = () => C.BARRIOS;
export function barriosActivos(S) { return climaActivo(S) && !!C.BARRIOS && S.stage >= K().desde.etapa; }

// Barrio de una casilla: el centro o uno de seis sectores alrededor.
export function barrioDe(S, i) {
  const N = lado(S), c = centroPueblo(S);
  if (c < 0) return 'centro';
  const dr = Math.floor(i / N) - Math.floor(c / N), dc = i % N - c % N;
  if (Math.hypot(dr, dc) <= K().radioCentro) return 'centro';
  return 's' + (Math.floor((Math.atan2(dr, dc) + Math.PI) / (2 * Math.PI) * 6) % 6);
}
export function nombreBarrio(id) { return id === 'centro' ? K().nombres.centro : K().nombres.sectores[+id.slice(1)]; }

// Barrios con sus casas, gente, servicios y problemáticas (0 a 100).
let _cache = null;
export function barrios(S) {
  if (!barriosActivos(S)) return [];
  const clave = S.year + '|' + S.map.map(x => x.b === 'casa' ? 1 : 0).join('') + '|' + (S.asent || []).length + '|' + JSON.stringify(S.prog || {}) + '|' + S.map.filter(x => x.b === 'biblioteca' || x.b === 'teatro' || x.b === 'cancha').length;
  if (_cache && _cache.S === S && _cache.clave === clave) return _cache.lista;
  const N = lado(S), c = centroPueblo(S), B = {};
  S.map.forEach((x, i) => {
    if (x.b !== 'casa' || x.ob) return;
    const id = barrioDe(S, i), b = B[id] || (B[id] = { id, casas: [], esc: 0, hosp: 0, pol: 0, merc: 0, dist: 0, ribera: 0 });
    const sv = serviciosDeCasa(S, i); b.casas.push(i);
    b.esc += sv.escuela ? 1 : 0; b.hosp += sv.hospital ? 1 : 0; b.pol += sv.policia ? 1 : 0; b.merc += sv.mercado ? 1 : 0;
    b.dist += c < 0 ? 0 : Math.hypot(Math.floor(i / N) - Math.floor(c / N), i % N - c % N); b.ribera += nearRiver(S, i) ? 1 : 0;
  });
  const so = society(S), totalCasas = Object.values(B).reduce((s, b) => s + b.casas.length, 0) || 1;
  const pobreza = Math.max(0, 50 - Math.min(S.sat.c, S.sat.a)), rural = Math.max(0, 45 - animoGrupo(S, 'jornaleros').valor), ins = S.insegura ?? 20;
  // Fase 5: biblioteca, teatro y cancha mejoran el barrio donde están.
  const cultBarrio = {}, CB = C.CULTURA ? C.CULTURA.barrio : {};
  S.map.forEach((x, i) => { if (x.b && !x.ob && CB[x.b]) { const o = cultBarrio[barrioDe(S, i)] || (cultBarrio[barrioDe(S, i)] = {}); for (const [k, v] of Object.entries(CB[x.b])) o[k] = (o[k] || 0) + v; } });
  const A = K().asentamiento, lista = Object.values(B).map(b => {
    const n = b.casas.length, f = k => b[k] / n, periferia = b.dist / n > 6 ? 1 : 0;
    const asent = (S.asent || []).filter(a => barrioDe(S, a.i) === b.id).length;
    const prog = (S.prog && S.prog[b.id]) || {}, cul = cultBarrio[b.id] || {}, red = k => Object.entries(prog).filter(([, hasta]) => hasta >= S.year).reduce((s, [t]) => s + (K().programas[t].reduce[k] || 0), 0) + (cul[k] || 0);
    const p = {
      desercion: 20 + (1 - f('esc')) * 45 + pobreza * .6 - (hasLaw(S, 'educacion') ? 10 : 0) - red('desercion'),
      infantil: 8 + (1 - f('esc')) * 30 + rural * .8 + f('ribera') * 8 - (hasLaw(S, 'educacion') ? 8 : 0) - red('infantil'),
      violencia: ins * .8 + (1 - f('pol')) * 20 + periferia * 10 + asent * A.violencia - red('violencia'),
      genero: 45 - f('esc') * 15 - f('hosp') * 10 - counts(S).universidad * 5 + (S.reg === 'tirania' ? 5 : 0) + asent * A.genero - red('genero')
    };
    for (const k in p) p[k] = Math.round(clamp(p[k], 0, 100));
    return { id: b.id, nombre: nombreBarrio(b.id), casas: n, gente: Math.round(S.pop * n / totalCasas), servicios: { escuela: f('esc'), hospital: f('hosp'), policia: f('pol'), mercado: f('merc') },
      problemas: p, peor: Object.entries(p).sort((a, b2) => b2[1] - a[1])[0], asent, prog, centro: b.casas };
  }).sort((a, b) => b.casas - a.casas);
  _cache = { S, clave, lista };
  return lista;
}
// Promedio (ponderado por casas) de una problemática.
export function promedioProblema(S, k) {
  const L = barrios(S), n = L.reduce((s, b) => s + b.casas, 0);
  return n ? L.reduce((s, b) => s + b.problemas[k] * b.casas, 0) / n : 0;
}
// Peso en la igualdad (deserción, trabajo infantil y brecha de género) y en la inseguridad (violencia).
export function efectoBarrios(S, que) {
  if (!barriosActivos(S)) return 0;
  const E = K().efectos;
  if (que === 'igualdad') return -Math.max(0, (promedioProblema(S, 'desercion') + promedioProblema(S, 'infantil') + promedioProblema(S, 'genero')) / 3 - E.umbral) * E.igualdad;
  if (que === 'inseguridad') return Math.max(0, promedioProblema(S, 'violencia') - E.umbral) * E.inseguridad;
  return 0;
}

// Programas sociales por barrio.
export function costoPrograma(S, t) { return Math.round(K().programas[t].costo * S.price); }
export function puedePrograma(S, id, t) {
  const P = S.prog && S.prog[id];
  if (P && P[t] >= S.year) return `Ya está en marcha hasta el año ${P[t]}.`;
  if (S.gold < costoPrograma(S, t)) return `Necesitas ${costoPrograma(S, t)} de oro.`;
  return null;
}
export function iniciarPrograma(S, id, t) {
  if (puedePrograma(S, id, t)) return false;
  S.gold -= costoPrograma(S, t);
  (S.prog = S.prog || {})[id] = { ...(S.prog[id] || {}), [t]: S.year + K().programas[t].anios };
  S.log.unshift({ y: S.year, t: `${K().programas[t].nombre} en ${nombreBarrio(id)}.` });
  return true;
}

// Asentamientos informales.
export function costoLegalizar(S) { return Math.round(K().asentamiento.legalizar * S.price); }
export function decidirAsentamiento(S, i, accion) {
  const a = (S.asent || []).find(x => x.i === i);
  if (!a) return null;
  const A = K().asentamiento, x = S.map[i];
  if (accion === 'legalizar') {
    if (S.gold < costoLegalizar(S)) return `Necesitas ${costoLegalizar(S)} de oro.`;
    S.gold -= costoLegalizar(S); S.asent = S.asent.filter(z => z !== a); delete x.mk; x.b = 'casa';
    S.tr = clamp(S.tr + 3, 0, 100); reaccionar(S, 'escuchar');
    dejarMarca(S, 'mural', `Año ${S.year}: se legalizó el asentamiento de ${nombreBarrio(barrioDe(S, i))}.`);
  } else if (accion === 'desalojar') {
    S.asent = S.asent.filter(z => z !== a); delete x.mk;
    S.pop = Math.max(1, Math.min(S.pop, cap(S))); S.tr = clamp(S.tr - 6, 0, 100); S.sat.a = clamp(S.sat.a - 4, 0, 100);
    contradecir(S, 'fuerza'); reaccionar(S, 'fuerza');
    dejarMarca(S, 'reten', `Año ${S.year}: desalojo del asentamiento de ${nombreBarrio(barrioDe(S, i))}.`);
  } else a.decidido = S.year;
  a.nuevo = false;
  return true;
}
// Cierre del año: puede aparecer un asentamiento en la periferia. Devuelve las noticias.
export function barriosDelAnio(S) {
  if (!barriosActivos(S)) return [];
  const A = K().asentamiento, L = S.asent || (S.asent = []), so = society(S);
  if (L.length >= A.maximo || S.year - (S.asentUlt ?? -99) < A.aniosEntre) return [];
  if (so.un < A.informales && S.pop < cap(S) - 2) return [];
  const N = lado(S), c = centroPueblo(S); if (c < 0) return [];
  const cand = S.map.map((x, i) => i).filter(i => { const x = S.map[i]; if (x.b || x.mk || x.t !== 'llano') return false; const d = Math.hypot(Math.floor(i / N) - Math.floor(c / N), i % N - c % N); return d >= 4 && d <= 8; });
  if (!cand.length) return [];
  const i = cand[(S.year * 7) % cand.length];
  S.map[i].mk = { t: 'asentamiento', y: S.year, d: `Año ${S.year}: familias sin vivienda levantan ranchos en ${nombreBarrio(barrioDe(S, i))}.` };
  L.push({ i, anio: S.year, nuevo: true }); S.asentUlt = S.year;
  return [`🏚️ Aparece un asentamiento informal en ${nombreBarrio(barrioDe(S, i))}.`];
}
