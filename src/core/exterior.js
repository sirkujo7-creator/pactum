// La polis en el mundo (fase 15, paso 1): además de los tres vecinos de frontera, polis hermanas reales (Antioquia,
// Santafé, Huila, Quindío, Valle) y países vecinos (Venezuela, Ecuador, Panamá). Cada lugar tiene su régimen y su
// relación (0 a 100). Embajada, tratado de comercio y liga; lo que ofrece cada uno se suma con efectoLeyes().
// El Tolima siempre es una polis independiente. Solo en el terreno en acuarela.
import { C } from './contenido.js';
import { azar, clamp } from './azar.js';
import { climaActivo } from './clima.js';
import { dejarMarca } from './marcas.js';

const K = () => C.EXT;
export function exteriorActivo(S) { return climaActivo(S) && !!C.EXT; }
export function estadoExterior(S) { if (!S.ext) S.ext = { p: {} }; return S.ext; }
export function lugares() { return Object.entries(K().lugares).map(([id, L]) => ({ id, ...L })); }
export function datosLugar(id) { return K().lugares[id]; }
const nombreReg = r => (C.REG[r] && C.REG[r].n || r).toLowerCase();
export function requisitoLugar(L) {
  const q = L.desde || {}, p = [];
  if (q.etapa) p.push(C.STAGES[q.etapa].n);
  if (q.anio) p.push(`año ${q.anio}`);
  return p.join(' y ');
}
const abierto = (S, L) => S.stage >= (L.desde.etapa || 0) && S.year >= (L.desde.anio || 0);
export function relacionExterior(S, id) { const E = S.ext && S.ext.p[id]; return E || null; }

// ---------- Acciones ----------
export function costoExterior(S, a) { return Math.round(K().acciones[a].costo * S.price); }
export function puedeExterior(S, id, a) {
  const E = relacionExterior(S, id), A = K().acciones[a], T = K().textos;
  if (!exteriorActivo(S) || !E) return T.desconocida + '.';
  if (a === 'embajada' && E.emb === S.year) return T.anio;
  if (a === 'comercio' && E.trato) return T.ya;
  if (a === 'liga' && E.trato === 'liga') return T.ya;
  if (a === 'liga' && !E.trato) return 'Primero un tratado de comercio.';
  if (A.minimo && E.rel < A.minimo) return T.falta.replace('{n}', A.minimo);
  if (S.gold < costoExterior(S, a)) return T.oro.replace('{n}', costoExterior(S, a));
  return null;
}
export function accionExterior(S, id, a) {
  if (puedeExterior(S, id, a)) return false;
  const E = S.ext.p[id], A = K().acciones[a], L = datosLugar(id), T = K().textos;
  S.gold -= costoExterior(S, a); E.rel = clamp(E.rel + A.relacion, 0, 100);
  if (a === 'embajada') { E.emb = S.year; S.log.unshift({ y: S.year, t: T.embajada.replace('{nombre}', L.nombre) }); return true; }
  E.trato = a; E.desde = S.year;
  S.log.unshift({ y: S.year, t: T.firmado.replace('{trato}', T.trato[a].toLowerCase()).replace('{nombre}', L.nombre) });
  dejarMarca(S, 'tratado', `Año ${S.year}: ${T.trato[a].toLowerCase()} con ${L.nombre}.`);
  return true;
}

// ---------- Efectos ----------
// Lo que dan los tratados y las ligas, con las mismas claves de las leyes (lo suma efectoLeyes).
export function efectoExterior(S, k, sub) {
  if (!exteriorActivo(S) || !S.ext) return 0;
  let v = 0;
  const suma = ef => { const e = ef && ef[k]; if (e !== undefined) v += sub ? (e[sub] || 0) : e; };
  for (const [id, E] of Object.entries(S.ext.p)) {
    if (!E.trato) continue;
    const L = datosLugar(id); if (!L) continue;
    suma(L.ofrece);
    if (E.trato === 'liga') { suma(L.liga); if (k === 'costoFijo') v += K().acciones.liga.mantenimiento; if (k === 'legitimidad' && K().autoritarios.includes(E.reg)) v -= 3; }
  }
  return v;
}

// ---------- Cierre del año ----------
export function exteriorDelAnio(S) {
  if (!exteriorActivo(S)) return [];
  const P = K(), T = P.textos, X = estadoExterior(S), news = [];
  for (const L of lugares()) {
    let E = X.p[L.id];
    if (!E) {
      if (!abierto(S, L)) continue;
      E = X.p[L.id] = { rel: P.inicial, reg: L.regimenes[Math.floor(azar() * L.regimenes.length)], visto: S.year };
      news.push(T.contacto.replace('{nombre}', L.nombre));
      continue;
    }
    // La relación vuelve poco a poco a la neutralidad; un tratado la sostiene un poco más arriba.
    const meta = E.trato === 'liga' ? 70 : E.trato ? 60 : 50;
    E.rel = clamp(E.rel + Math.sign(meta - E.rel) * Math.min(P.deriva, Math.abs(meta - E.rel)), 0, 100);
    if (E.trato && E.rel < P.romper) { delete E.trato; news.push(T.rompe.replace('{nombre}', L.nombre)); }
    // Los gobiernos de los otros también cambian (el ciclo de Polibio no es solo tuyo).
    if (azar() < P.cambioRegimen) { const otros = L.regimenes.filter(r => r !== E.reg); if (otros.length) { E.reg = otros[Math.floor(azar() * otros.length)]; news.push(T.cambia.replace('{nombre}', L.nombre).replace('{reg}', nombreReg(E.reg))); } }
  }
  return news;
}
export function nombreRegimen(r) { return nombreReg(r); }
