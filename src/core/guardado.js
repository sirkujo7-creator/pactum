// Guardado con número de versión y migraciones: una actualización nunca debe borrar una partida.
// Aquí solo se convierte el estado a texto y de vuelta; guardar en el aparato lo hace la interfaz.
import { C } from './contenido.js';
import { LADO_V9 } from './mundo.js';

export const VERSION_GUARDADO = 1;

// Cada migración lleva el estado de la versión k a la k+1.
const MIGRACIONES = {
  // 0 → 1: partidas de la versión 9 (Polis), que no tenían número de versión.
  0: S => {
    if (!S.diff) { S.diff = 'normal'; S.guide = false; S.gstep = C.GUIDE.length || 6; }
    if (!S.undo) S.undo = [];
    if (S.kept === undefined) { S.kept = 0; S.hungry = false; }
    if (!S.seed) S.seed = 0;
    if (!S.reg) { S.reg = 'republica'; S.corr = 20; }
    if (!S.mundo) S.mundo = 'v9';
    if (!S.n) S.n = Math.round(Math.sqrt(S.map.length)) || LADO_V9;
    return S;
  }
};

export function empaquetar(S) {
  return JSON.stringify({ juego: 'pactum', version: VERSION_GUARDADO, estado: S });
}

// Acepta un guardado de Pactum o de la versión 9. Devuelve el estado o lanza un error explicado.
export function desempaquetar(texto) {
  const x = typeof texto === 'string' ? JSON.parse(texto) : texto;
  let v, S;
  if (x && x.juego === 'pactum') { v = x.version; S = x.estado; }
  else { v = 0; S = x; }
  if (!S || !Array.isArray(S.map) || !S.tx) throw new Error('No parece una partida de Pactum.');
  if (v > VERSION_GUARDADO) throw new Error('Esta partida es de una versión más nueva del juego.');
  for (; v < VERSION_GUARDADO; v++) S = MIGRACIONES[v](S);
  return S;
}

// Código de texto para copiar la partida a otro aparato (como en la versión 9).
export function aCodigo(S) {
  const t = empaquetar(S), bytes = new TextEncoder().encode(t);
  let bin = '';
  bytes.forEach(b => bin += String.fromCharCode(b));
  return btoa(bin);
}
export function desdeCodigo(codigo) {
  const bin = atob(codigo.trim()), bytes = Uint8Array.from(bin, ch => ch.charCodeAt(0));
  return desempaquetar(new TextDecoder().decode(bytes));
}
