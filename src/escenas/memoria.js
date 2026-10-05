// Guardado en este aparato (almacenamiento del navegador). Nunca debe romper el juego:
// si el navegador no deja guardar (modo privado, sin espacio), se sigue jugando sin guardar.
import { empaquetar, desempaquetar, C } from '../core/index.js';

const CLAVE = 'pactum-partida', RANURA = n => 'pactum-ranura-' + n, LOGROS = 'pactum-logros', SONIDO = 'pactum-sonido';
const leer = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const escribir = (k, v) => { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } };

let espera = null;
// Guardado automático (espera un momento para no guardar a cada movimiento de un control).
export function guardarLuego(S) { clearTimeout(espera); espera = setTimeout(() => guardarYa(S), 400); }
export function guardarYa(S) { clearTimeout(espera); return S ? escribir(CLAVE, empaquetar(S)) : false; }
export function cargarGuardada() {
  const t = leer(CLAVE);
  if (t) { try { return desempaquetar(t); } catch (e) { console.warn('Partida guardada ilegible:', e); } }
  return null;
}
// Partida que dejó la versión 9 (Polis) en este aparato, si existe.
export function partidaV9() {
  const t = leer('polis-v2');
  if (!t) return null;
  try { const S = desempaquetar(t); return S.over ? null : S; } catch (e) { return null; }
}

// Ranuras 1 a 3 (como en la v9).
export function infoRanura(n) {
  const t = leer(RANURA(n));
  if (!t) return null;
  try { const S = desempaquetar(t); return `${C.STAGES[S.stage].n}, año ${S.year} (${C.DIFFS[S.diff || 'normal'].n})`; } catch (e) { return null; }
}
export function guardarRanura(n, S) { return escribir(RANURA(n), empaquetar(S)); }
export function cargarRanura(n) { const t = leer(RANURA(n)); return t ? desempaquetar(t) : null; }

// Logros ganados: { id: año }. Se suman los que se ganaron en la versión 9.
export function logrosGanados() {
  let a = {}, b = {};
  try { a = JSON.parse(leer(LOGROS) || '{}'); } catch (e) { a = {}; }
  try { b = JSON.parse(leer('polis-logros') || '{}'); } catch (e) { b = {}; }
  return { ...b, ...a };
}
export function guardarLogros(g) { escribir(LOGROS, JSON.stringify(g)); }

export function quiereSonido() { return leer(SONIDO) !== '0'; } // con sonido salvo que el jugador lo apague
export function guardarSonido(on) { escribir(SONIDO, on ? '1' : '0'); }
