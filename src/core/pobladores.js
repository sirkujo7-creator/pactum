// Pobladores visibles: quién vive en cada casa y dónde trabaja, según la sociedad real de la partida.
// Cada figura representa a varios habitantes (hasta 150 figuras). Es lógica pura: la escena solo los anima.
import { mulberry } from './azar.js';
import { C } from './contenido.js';
import { society } from './sociedad.js';

export const MAX_FIGURAS = 150;

// Casilla que hace de plaza: la sede de gobierno, si no el mercado, el parque o la primera casa.
export function plaza(S) {
  for (const k of ['agora', 'mercado', 'parque', 'casa']) { const i = S.map.findIndex(x => x.b === k); if (i >= 0) return i; }
  return -1;
}

// Ánimo de una clase en palabras: mal, regular o bien.
export function animo(v) { return v < 35 ? 'mal' : v < 62 ? 'regular' : 'bien'; }

export function planearPobladores(S) {
  const casas = S.map.map((x, i) => x.b === 'casa' ? i : -1).filter(i => i >= 0);
  if (!casas.length || S.pop <= 0) return [];
  const so = society(S);
  const total = Math.max(4, Math.min(MAX_FIGURAS, Math.round(S.pop / 2)));
  const ninos = Math.round(total * .15), adultos = total - ninos, P = Math.max(1, so.P);
  const n = { c: Math.round(adultos * so.camp / P), a: Math.round(adultos * so.art / P), e: Math.round(adultos * so.el / P) };
  n.u = Math.max(0, adultos - n.c - n.a - n.e);
  // Puestos de trabajo reales, por tipo de edificio.
  const lugares = (filtro) => S.map.map((x, i) => x.b && filtro(x.b) ? i : -1).filter(i => i >= 0);
  const campo = lugares(b => b === 'cultivo' || b === 'cafetal');
  const oficio = lugares(b => C.B[b].ja && b !== 'agora');
  const negocio = lugares(b => ['mercado', 'banco', 'puerto', 'agora'].includes(b));
  const escuela = lugares(b => b === 'escuela');
  const pz = plaza(S);
  const nom = C.POB.nombres, ape = C.POB.apellidos;
  const elegir = (L, k) => L.length ? L[k % L.length] : null;
  const lista = [];
  const agregar = (tipo, clase, trabajo, k) => {
    const sexo = tipo === 'campesina' ? 'm' : tipo === 'nino' ? 'n' : tipo === 'elite' && k % 3 === 1 ? 'm' : 'h';
    const r = mulberry(S.seed * 31 + lista.length * 97 + 5);
    lista.push({
      id: lista.length, tipo, clase, vi: Math.floor(r() * 3), trabajo,
      nombre: `${nom[sexo][Math.floor(r() * nom[sexo].length)]} ${ape[Math.floor(r() * ape.length)]}`,
      edad: tipo === 'nino' ? 6 + Math.floor(r() * 9) : 19 + Math.floor(r() * 50), sexo, semilla: r()
    });
  };
  for (let k = 0; k < n.c; k++) agregar(k % 2 ? 'campesina' : 'campesino', 'c', elegir(campo, k), k);
  for (let k = 0; k < n.a; k++) agregar('artesano', 'a', elegir(oficio, k), k);
  for (let k = 0; k < n.e; k++) agregar('elite', 'e', elegir(negocio, k), k);
  for (let k = 0; k < n.u; k++) agregar(k % 2 ? 'campesina' : 'artesano', 'u', null, k);
  for (let k = 0; k < ninos; k++) agregar('nino', 'n', elegir(escuela, k), k);
  // Casas: la élite vive en las casas más cercanas a la plaza; los demás se reparten en las restantes.
  const cerca = pz < 0 ? casas : casas.slice().sort((a, b) => dist(S, a, pz) - dist(S, b, pz));
  let h = 0;
  for (const p of lista.filter(p => p.clase === 'e')) p.casa = cerca[h++ % cerca.length];
  const resto = lista.filter(p => p.clase !== 'e');
  resto.forEach((p, k) => { p.casa = cerca[(h + k) % cerca.length]; });
  lista.forEach(p => { p.plaza = pz; p.oficio = p.sexo === 'm' ? femenino(oficioDe(p, S)) : oficioDe(p, S); });
  return lista;
}

// "Maestro" → "Maestra", "Funcionario público" → "Funcionaria pública" (hasta la primera palabra que no cambie).
function femenino(t) {
  const w = t.split(' ');
  for (let i = 0; i < w.length; i++) {
    if (/or$/.test(w[i])) w[i] += 'a'; else if (/o$/.test(w[i])) w[i] = w[i].slice(0, -1) + 'a'; else break;
  }
  return w.join(' ');
}

function dist(S, a, b) { const N = S.n; return Math.abs(Math.floor(a / N) - Math.floor(b / N)) + Math.abs(a % N - b % N); }

function oficioDe(p, S) {
  const O = C.POB.oficios;
  if (p.clase === 'n') return p.trabajo !== null ? O.nino : O.ninoSinEscuela;
  if (p.clase === 'u') return O.desempleado;
  if (p.clase === 'e') return p.trabajo !== null ? (S.map[p.trabajo].b === 'agora' ? O.agora : O[S.map[p.trabajo].b]) : O.casa;
  const t = p.trabajo !== null ? O[S.map[p.trabajo].b] : null;
  return t || (p.clase === 'c' ? O.cultivo : O.taller);
}

// Lo que piensa un poblador, según el ánimo de su clase.
export function pensamiento(S, p) {
  const tipo = p.clase === 'u' ? 'desempleado' : p.tipo;
  const v = p.clase === 'c' ? S.sat.c : p.clase === 'e' ? S.sat.e : p.clase === 'n' ? S.hap : S.sat.a;
  const L = C.POB.piensa[tipo][animo(v)];
  return L[Math.floor((p.semilla + S.year * .37) * L.length) % L.length];
}
