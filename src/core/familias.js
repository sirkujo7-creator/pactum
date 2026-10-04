// Historias humanas (fase 13): cinco familias del pueblo (Tique, Rojas, Quintero, Arango y Lozano) atraviesan el
// siglo. Cada pocos años llega una carta de alguno de sus miembros (src/data/familias.json); cada carta tiene
// variantes según lo que decidió el jugador (leyes, rasgos, salarios, guerra, conflicto...) y puede dejar un recuerdo
// para el álbum y hechos para el árbol de la familia (nace, muere, se va, vuelve). Solo narra: no cambia el juego.
import { C } from './contenido.js';
import { cumple } from './reglas.js';
import { civismoActivo } from './civismo.js';

const K = () => C.FAMILIAS;
export function familiasActivas(S) { return civismoActivo(S) && !!C.FAMILIAS; }
function estado(S) { if (!S.fam) S.fam = { cartas: [], ultima: -99, hechos: [], objetos: {} }; return S.fam; }
export function estadoFamilias(S) { return estado(S); }
export function datosCarta(id) { return K().cartas.find(c => c.id === id); }
export function datosFamilia(f) { return K().familias[f]; }
export function datosObjeto(o) { return K().objetos[o]; }
// Condiciones propias de las cartas (además de las de siempre: ley, rasgo, fincas, productos, nivelFabrica, etapa...).
function cumpleCarta(S, cond) {
  const { salario, conflicto, guerra, ...resto } = cond || {};
  if (salario && (S.salario || 'justo') !== salario) return false;
  if (conflicto && !(S.conf && S.conf.desde !== undefined)) return false;
  if (guerra && !(S.guerra && (S.guerra.activa || S.guerra.hubo))) return false;
  return cumple(S, resto);
}
// La carta que toca este año (o null): la más antigua pendiente cuya ventana está abierta y con alguna variante válida.
export function cartaPosible(S) {
  const E = estado(S), enviadas = new Set(E.cartas.map(c => c.id));
  const L = K().cartas.filter(c => !enviadas.has(c.id) && S.year >= c.desde && S.year <= c.hasta).sort((a, b) => a.desde - b.desde);
  for (const c of L) { const v = c.variantes.findIndex(x => cumpleCarta(S, x.cuando)); if (v >= 0) return { c, v }; }
  return null;
}
// Una carta ya recibida, con su variante.
export function cartaRecibida(r) { const c = datosCarta(r.id); return { ...c, ...c.variantes[r.v], anio: r.anio, n: r.n }; }
export function cartasRecibidas(S) { return estado(S).cartas.map(cartaRecibida); }
// Cierre del año: llega como mucho una carta, y no antes de unos años desde la anterior.
export function familiasDelAnio(S) {
  if (!familiasActivas(S)) return [];
  const E = estado(S);
  if (S.year - E.ultima < K().intervalo) return [];
  const p = cartaPosible(S);
  if (!p) return [];
  const V = p.c.variantes[p.v], r = { id: p.c.id, v: p.v, anio: S.year, n: E.cartas.length + 1 };
  E.cartas.push(r); E.ultima = S.year;
  for (const h of V.hechos || []) E.hechos.push({ ...h, f: p.c.familia, anio: S.year });
  if (V.objeto) E.objetos[V.objeto] = S.year;
  S.cartaEv = { ...r, nuevo: true };
  return [`📨 Llegó una carta de ${p.c.de}.`];
}

// ---------- Paso 2: el álbum ----------
// Miembros de una familia: los del comienzo más los que aparecen en las cartas, con su estado (vive, murió, se fue).
export function miembrosFamilia(S, f) {
  const E = estado(S), L = datosFamilia(f).miembros.map(n => ({ nombre: n, estado: 'vive' }));
  const buscar = q => L.find(m => m.nombre.split(' (')[0] === q);
  for (const h of E.hechos.filter(x => x.f === f)) {
    let m = buscar(h.quien);
    if (!m && (h.t === 'nace' || h.t === 'muere')) { m = { nombre: h.quien, estado: 'vive' }; L.push(m); }
    if (!m) continue;
    m.estado = h.t === 'muere' ? 'murio' : h.t === 'migra' ? 'sefue' : h.t === 'vuelve' ? 'vive' : m.estado;
    m.anio = h.anio;
  }
  return L;
}
export function listaFamilias() { return Object.keys(K().familias); }
export function listaObjetos() { return Object.keys(K().objetos); }

// ---------- Paso 3: en el mapa y al final ----------
// Quién representa hoy a cada familia en el pueblo: quien escribió su última carta, si sigue vivo y en el pueblo.
const CLASE = { tique: 'c', rojas: 'c', quintero: 'a', arango: 'e', lozano: 'u' };
export function representantes(S) {
  if (!familiasActivas(S) || !S.fam) return [];
  const R = cartasRecibidas(S), out = [];
  for (const f of listaFamilias()) {
    const mias = R.filter(c => c.familia === f);
    if (!mias.length) continue;
    const vivos = miembrosFamilia(S, f).filter(m => m.estado === 'vive').map(m => m.nombre.split(' (')[0]);
    const quien = [...mias].reverse().map(c => c.de).find(n => vivos.includes(n) || !miembrosFamilia(S, f).some(m => m.nombre.split(' (')[0] === n));
    if (quien) out.push({ familia: f, nombre: quien, clase: CLASE[f], ultima: mias[mias.length - 1] });
  }
  return out;
}
// El epílogo: por familia, lo que pasó en cada una de sus cartas.
export function epilogo(S) {
  if (!familiasActivas(S) || !S.fam) return [];
  const R = cartasRecibidas(S);
  return listaFamilias().map(f => ({ familia: f, ...datosFamilia(f), hechos: R.filter(c => c.familia === f).map(c => c.resumen).filter(Boolean) })).filter(x => x.hechos.length);
}
