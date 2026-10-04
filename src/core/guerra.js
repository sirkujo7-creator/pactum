// Guerra con otra polis (fase 9). Si la relación con un vecino se queda hostil, sube la tensión: primero un
// incidente en la frontera, luego tropas acampadas en el borde y, si llega al límite, la guerra (crisis mayor).
// El jugador puede negociar, pedir mediación, fortificar o lanzar un ultimátum, y también declarar la guerra.
// Cada año de guerra hay asedio (comercio cortado, menos comida, gasto, daño en las obras del borde); quien
// pierde el frente ve ocupadas casillas de su borde hasta recuperarlas. Al final se firma un tratado de paz.
// Solo en el terreno en acuarela, desde Ciudad.
import { C } from './contenido.js';
import { azar, clamp } from './azar.js';
import { counts } from './reglas.js';
import { climaActivo, marcarCrisis } from './clima.js';
import { crisisLibre } from './desastres.js';
import { vecinosActivos } from './vecinos.js';
import { ejercitoActivo, ejercito } from './ejercito.js';
import { dejarMarca } from './marcas.js';
import { lado } from './mundo.js';
import { centroPueblo } from './cobertura.js';

const K = () => C.GUERRA;
export function guerraActiva(S) { return vecinosActivos(S) && !!C.GUERRA; }
export function estadoGuerra(S) { if (!S.guerra) S.guerra = { activa: null, tratado: null, fort: -1 }; return S.guerra; }
export function enGuerra(S) { return !!(S.guerra && S.guerra.activa); }
const nombre = id => C.VECINOS.vecinos[id].nombre;
const txt = (k, id, extra = {}) => Object.entries({ vecino: nombre(id), ...extra }).reduce((t, [a, b]) => t.replace(`{${a}}`, b), K().textos[k]);

// ---------- El borde de cada vecino ----------
// Altamira por el lado de más montaña, Lagunilla por donde sale el río y San Lorenzo por el lado más llano.
export function bordes(S) {
  const G = estadoGuerra(S);
  if (G.bordes) return G.bordes;
  const N = lado(S), lados = { r0: [], rN: [], c0: [], cN: [] };
  for (let k = 0; k < N; k++) { lados.r0.push(k); lados.rN.push((N - 1) * N + k); lados.c0.push(k * N); lados.cN.push(k * N + N - 1); }
  const cuenta = (L, t) => L.filter(i => S.map[i].t === t).length, usados = new Set(), elegir = f => { const k = Object.keys(lados).filter(x => !usados.has(x)).sort((a, b) => f(lados[b]) - f(lados[a]))[0]; usados.add(k); return k; };
  const altamira = elegir(L => cuenta(L, 'montana')), lagunilla = elegir(L => cuenta(L, 'rio')), sanlorenzo = elegir(L => cuenta(L, 'llano'));
  return (G.bordes = { altamira, lagunilla, sanlorenzo });
}
// Casillas del borde de un vecino, de la más cercana al pueblo a la más lejana (dos filas de fondo).
export function casillasBorde(S, id) {
  const N = lado(S), b = bordes(S)[id], c = centroPueblo(S), cr = c >= 0 ? Math.floor(c / N) : N / 2, cc = c >= 0 ? c % N : N / 2, L = [];
  for (let k = 0; k < N; k++) for (let d = 0; d < 2; d++) {
    const r = b === 'r0' ? d : b === 'rN' ? N - 1 - d : k, cl = b === 'c0' ? d : b === 'cN' ? N - 1 - d : k;
    L.push(r * N + cl);
  }
  return L.filter(i => S.map[i].t !== 'rio').sort((a, z) => Math.hypot(Math.floor(a / N) - cr, a % N - cc) - Math.hypot(Math.floor(z / N) - cr, z % N - cc));
}
// Las casillas ocupadas llevan la marca x.oc con el vecino que las tiene.
export function ocupada(S, i) { return S.map[i].oc || null; }
export function ocupadasPor(S, id) { return S.map.map((x, i) => x.oc === id ? i : -1).filter(i => i >= 0); }
const devolver = (S, id) => { for (const i of ocupadasPor(S, id)) delete S.map[i].oc; };

// ---------- Fuerzas ----------
export function partesFuerza(S) {
  const P = K().propia, G = estadoGuerra(S), out = [['Base', P.base]];
  if (ejercitoActivo(S)) { const E = ejercito(S); out.push(['Ánimo del Ejército', Math.round(E.animo * P.animoEjercito)], ['Gasto militar', Math.round(E.gasto * P.gasto)], ['Cuarteles', counts(S).cuartel * P.cuartel]); }
  out.push(['Legitimidad (un pueblo que cree resiste)', Math.round(S.tr * P.legitimidad)]);
  const aliados = Object.values(S.vecinos || {}).filter(v => v.rel >= C.VECINOS.aliado).length;
  if (aliados) out.push(['Aliados', aliados * P.aliado]);
  if (G.fort >= S.year) out.push(['Frontera fortificada', P.fortificacion]);
  out.push(['Tamaño del territorio', S.stage * P.etapa]);
  return out;
}
export function fuerzaPropia(S) { return partesFuerza(S).reduce((s, x) => s + x[1], 0); }
export function fuerzaVecino(S, id) { const F = K().fuerzas; return Math.round(F[id] + S.year * F.porAnio); }

// ---------- Respuestas a la tensión ----------
export function costoRespuesta(S, a) { return Math.round((K().respuestas[a].costo || 0) * S.price); }
export function puedeResponder(S, id, a) {
  const v = S.vecinos && S.vecinos[id], R = K().respuestas[a];
  if (!guerraActiva(S) || !v || !R) return 'No disponible.';
  if (enGuerra(S)) return 'Hay una guerra en curso.';
  if (a === 'mediacion' && !Object.entries(S.vecinos).some(([k, x]) => k !== id && x.rel >= R.requiere)) return `Necesitas un aliado (relación de ${R.requiere} o más) que medie.`;
  if (a === 'preparar' && estadoGuerra(S).fort >= S.year) return 'La frontera ya está fortificada.';
  if (a !== 'preparar' && !(v.tension > 0)) return 'No hay tensión con este vecino.';
  if (S.gold < costoRespuesta(S, a)) return `Necesitas ${costoRespuesta(S, a)} de oro.`;
  return null;
}
export function responder(S, id, a) {
  if (puedeResponder(S, id, a)) return null;
  const v = S.vecinos[id], R = K().respuestas[a], G = estadoGuerra(S);
  S.gold -= costoRespuesta(S, a);
  let t = R.nombre + ' con ' + nombre(id) + '.';
  if (a === 'negociar' || a === 'mediacion') { v.rel = clamp(v.rel + R.relacion, 0, 100); v.tension = Math.max(0, (v.tension || 0) + R.tension); }
  if (a === 'preparar') G.fort = S.year + R.anios;
  if (a === 'ultimatum') {
    S.tr = clamp(S.tr + R.legitimidad, 0, 100);
    if (fuerzaPropia(S) > fuerzaVecino(S, id) && azar() < R.retroceso) { v.tension = Math.max(0, v.tension - 50); v.tropas = false; t = txt('retrocede', id); }
    else { v.tension = Math.min(K().tension.guerra, (v.tension || 0) + R.tension); t = 'Ultimátum a ' + nombre(id) + ': no retrocede.'; }
  }
  if (v.tension < K().tension.tropas) v.tropas = false;
  S.log.unshift({ y: S.year, t });
  return t;
}

// ---------- Declarar la guerra ----------
// Costo en legitimidad: nada si es para recuperar lo propio, menos si hay tropas en tu borde (preventiva).
export function costoDeclarar(S, id) {
  const D = K().declarar, v = S.vecinos[id];
  return ocupadasPor(S, id).length ? D.legitimidadJusta : v.tropas ? D.legitimidadPreventiva : D.legitimidad;
}
export function puedeDeclarar(S, id) {
  const v = S.vecinos && S.vecinos[id];
  if (!guerraActiva(S) || !v) return 'No disponible.';
  if (S.stage < K().desde.etapa) return 'Desde Ciudad.';
  if (enGuerra(S) || estadoGuerra(S).tratado) return 'Ya hay una guerra en curso.';
  if (!ejercitoActivo(S)) return 'Necesitas un cuartel (Ejército).';
  if (v.rel > C.VECINOS.hostil && !ocupadasPor(S, id).length) return 'Solo contra un vecino hostil o que ocupe tus tierras.';
  if (S.clima.ultimaCrisis === S.year) return 'Tu pueblo ya vivió una crisis este año.';
  return null;
}
export function declararGuerra(S, id) {
  if (puedeDeclarar(S, id)) return false;
  S.tr = clamp(S.tr - costoDeclarar(S, id), 0, 100);
  empezar(S, id, 'tu');
  S.log.unshift({ y: S.year, t: txt('declaras', id) });
  return true;
}
function empezar(S, id, quien) {
  const G = estadoGuerra(S), v = S.vecinos[id];
  G.activa = { id, desde: S.year, frente: 0, anios: 0, quien }; G.hubo = (G.hubo || 0) + 1; // fase 13: las cartas recuerdan la guerra
  v.rel = Math.min(v.rel, 10); v.tension = 0; v.tropas = true;
  marcarCrisis(S);
  (S.guerraEv = S.guerraEv || []).push({ tipo: quien === 'tu' ? 'declaras' : 'guerra', id, nuevo: true });
}

// ---------- Tratado de paz ----------
export function opcionesTratado(S) {
  const T = estadoGuerra(S).tratado;
  if (!T) return [];
  return T.resultado === 'ganas' ? ['justa', 'impuesta', 'armisticio'] : T.resultado === 'pierdes' ? ['rendicion', 'resistir'] : ['justa', 'armisticio'];
}
export function costoTratado(S, o) { const X = K().tratados[o]; return Math.round(((X.costo || 0) + (o === 'rendicion' ? X.tributo : 0)) * S.price); }
export function firmarTratado(S, o) {
  const G = estadoGuerra(S), T = G.tratado;
  if (!T || !opcionesTratado(S).includes(o)) return false;
  const X = K().tratados[o], id = T.id, v = S.vecinos[id];
  if (o === 'resistir') { G.tratado = null; G.activa = { id, desde: S.year, frente: -1, anios: K().aniosMax - 1, quien: 'ellos' }; S.log.unshift({ y: S.year, t: X.texto }); return true; }
  S.gold -= costoTratado(S, o);
  if (o === 'impuesta') S.gold += Math.round(X.tributo * S.price);
  if (X.legitimidad) S.tr = clamp(S.tr + (o === 'rendicion' ? -X.legitimidad : X.legitimidad), 0, 100);
  v.rel = X.relacion; v.tension = X.tension; v.tropas = false;
  if (o === 'justa') devolver(S, id); // se devuelven las tierras
  G.tratado = null; G.ultima = { id, anio: S.year, tratado: o };
  dejarMarca(S, 'placa', `Año ${S.year}: ${X.nombre.toLowerCase()} con ${nombre(id)}.`);
  S.log.unshift({ y: S.year, t: `${X.nombre} con ${nombre(id)}.` });
  return true;
}
// Recuperar las tierras ocupadas negociando (con buenas relaciones).
export function costoRecuperar(S) { return Math.round(K().recuperar.costo * S.price); }
export function puedeRecuperar(S, id) {
  if (!ocupadasPor(S, id).length) return 'No ocupa tierras tuyas.';
  if (enGuerra(S)) return 'Hay una guerra en curso.';
  if (S.vecinos[id].rel < K().recuperar.requiere) return `Necesitas una relación de ${K().recuperar.requiere} o más.`;
  if (S.gold < costoRecuperar(S)) return `Necesitas ${costoRecuperar(S)} de oro.`;
  return null;
}
export function recuperarTierras(S, id) {
  if (puedeRecuperar(S, id)) return false;
  S.gold -= costoRecuperar(S);
  devolver(S, id);
  S.log.unshift({ y: S.year, t: txt('recuperas', id) });
  return true;
}

// ---------- Cierre del año ----------
export function guerraDelAnio(S) {
  if (!guerraActiva(S) || !S.vecinos) return [];
  const P = K(), G = estadoGuerra(S), news = [];
  bordes(S);
  // Un tratado sin firmar se resuelve solo con un armisticio (o la rendición, si perdiste).
  if (G.tratado) firmarTratado(S, G.tratado.resultado === 'pierdes' ? 'rendicion' : 'armisticio');
  if (G.activa) return news.concat(anioDeGuerra(S));
  const T = P.tension;
  for (const [id, v] of Object.entries(S.vecinos)) {
    const antes = v.tension || 0;
    v.tension = v.rel <= C.VECINOS.hostil ? Math.min(T.guerra, antes + T.sube + (C.VECINOS.hostil - v.rel) * T.porHostilidad) : Math.max(0, antes - T.baja);
    if (antes < T.incidente && v.tension >= T.incidente) { news.push(txt('incidente', id)); (S.guerraEv = S.guerraEv || []).push({ tipo: 'incidente', id, nuevo: true }); }
    if (!v.tropas && v.tension >= T.tropas) { v.tropas = true; news.push(txt('tropas', id)); (S.guerraEv = S.guerraEv || []).push({ tipo: 'tropas', id, nuevo: true }); }
    if (v.tropas && v.tension < T.tropas) v.tropas = false;
    if (v.tension >= T.guerra && !G.activa && crisisLibre(S, S.year)) { empezar(S, id, 'ellos'); news.push(txt('guerra', id)); }
  }
  return news;
}
function anioDeGuerra(S) {
  const P = K(), G = estadoGuerra(S), W = G.activa, id = W.id, X = P.costos, news = [];
  W.anios++;
  marcarCrisis(S); // la guerra ocupa la crisis mayor del año
  const diff = fuerzaPropia(S) - fuerzaVecino(S, id) + (azar() - .5) * 2 * P.fuerzas.azar;
  W.frente = clamp(W.frente + (diff > 0 ? 1 : -1), -2, 2);
  news.push(txt('anio', id, { resultado: P.textos[diff > 0 ? 'avanzas' : 'retrocedes'] }));
  // Asedio: gasto, gente, ánimo, comida y daño en las obras del borde.
  S.gold -= Math.round(X.oro * S.price);
  S.pop = Math.max(1, S.pop - Math.round(S.pop * X.poblacion));
  for (const k of ['c', 'a', 'e']) S.sat[k] = clamp(S.sat[k] - X.animo, 0, 100);
  S.food = Math.max(0, S.food - Math.round(S.food * X.alimento));
  S.vecinos[id].rel = Math.min(S.vecinos[id].rel, 10);
  const borde = new Set(casillasBorde(S, id).slice(0, 12)), N = lado(S);
  const obras = S.map.map((x, i) => x.b && !x.ob ? i : -1).filter(i => i >= 0).sort((a, b) => (borde.has(b) ? 1 : 0) - (borde.has(a) ? 1 : 0) || distBorde(S, id, a, N) - distBorde(S, id, b, N));
  for (const i of obras.slice(0, X.obrasDanadas)) { const x = S.map[i]; x.u = Math.min(100, (x.u || 0) + X.dano); x.sin = S.year; }
  // El frente: quien lo pierde ve ocupadas casillas del borde; quien lo gana recupera las suyas.
  if (W.frente <= P.ocupar.frente) {
    const libres = casillasBorde(S, id).filter(i => !S.map[i].oc).slice(0, P.ocupar.casillas);
    if (libres.length && !ocupadasPor(S, id).length) { for (const i of libres) S.map[i].oc = id; news.push(txt('ocupa', id, { n: libres.length })); W.ocupo = libres.length; }
  }
  if (W.frente >= 2 && ocupadasPor(S, id).length) { devolver(S, id); news.push(txt('recuperas', id)); W.recupero = true; }
  (S.guerraEv = S.guerraEv || []).push({ tipo: 'anio', id, frente: W.frente, avanza: diff > 0, ocupa: W.ocupo || 0, recupera: !!W.recupero, nuevo: true });
  W.ocupo = 0; W.recupero = false;
  if (W.anios >= P.aniosMax || Math.abs(W.frente) >= 2) {
    G.tratado = { id, resultado: W.frente > 0 ? 'ganas' : W.frente < 0 ? 'pierdes' : 'empate' };
    G.activa = null;
    news.push(txt('fin', id));
    S.guerraEv.push({ tipo: 'fin', id, nuevo: true });
  }
  return news;
}
function distBorde(S, id, i, N) { const b = bordes(S)[id], r = Math.floor(i / N), c = i % N; return b === 'r0' ? r : b === 'rN' ? N - 1 - r : b === 'c0' ? c : N - 1 - c; }
