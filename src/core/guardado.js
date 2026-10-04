// Guardado con número de versión y migraciones: una actualización nunca debe borrar una partida.
// Aquí solo se convierte el estado a texto y de vuelta; guardar en el aparato lo hace la interfaz.
import { C } from './contenido.js';
import { LADO_V9, LADO_INICIAL, genMundo } from './mundo.js';
import { whyNot } from './obras.js';
import { climaInicial } from './clima.js';
import { ecoInicial } from './economia.js';
import { migrarFincas } from './fincas.js';

export const VERSION_GUARDADO = 8;

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
  },
  // 1 → 2: el mapa de la v9 (20×20) pasa al terreno en acuarela; las obras se reubican cerca de su lugar.
  1: S => (S.mundo === 'v9' ? convertirMapaV9(S) : S),
  // 2 → 3 (fase 1): se agrega el clima.
  2: S => { if (S.mundo === 'acuarela' && !S.clima) S.clima = climaInicial(); return S; },
  // 3 → 4 (fase 1, paso 2): El Niño, La Niña y el fondo de emergencias.
  3: S => { if (S.clima) { S.clima = { ...climaInicial(), ...S.clima }; S.fondo = S.fondo || 0; S.aporteFondo = S.aporteFondo || 0; } return S; },
  // 4 → 5 (fase 1, paso 4): mantenimiento de las obras, al 100% como antes.
  4: S => { if (S.clima && S.mant === undefined) S.mant = 100; return S; },
  // 5 → 6 (fase 2): economía viva.
  5: S => { if (S.clima && !S.eco) S.eco = ecoInicial(); return S; },
  // 6 → 7 (fase 3): parte de los campesinos con tierra propia.
  6: S => { if (S.clima && S.tierra === undefined) S.tierra = .35; return S; },
  // 7 → 8 (fase 10): el cafetal pasa a ser una finca de café y cada cultivo, una finca con lo que sembraba.
  7: S => { migrarFincas(S); return S; }
};

// Reubica las obras de un mapa de la v9 en un terreno en acuarela del mismo código.
// Conserva cuántas obras hay de cada tipo (la economía sigue igual) y las pone lo más cerca posible
// de su lugar original, respetando dónde puede ir cada una (río, ladera, montaña).
export function convertirMapaV9(S, n = LADO_INICIAL) {
  const viejo = S.map, N0 = Math.round(Math.sqrt(viejo.length)), f = n / N0;
  const obras = viejo.map((x, i) => x.b ? { b: x.b, r: (Math.floor(i / N0) + .5) * f, c: (i % N0 + .5) * f } : null).filter(Boolean);
  const nuevo = { ...S, map: genMundo(S.seed, n), n, mundo: 'acuarela', undo: [] };
  const oro = nuevo.gold; nuevo.gold = 1e9; // para ubicar sin cobrar
  // Primero las que tienen más exigencias de lugar.
  const orden = ['puerto', 'molino', 'acueducto', 'mina', 'cafetal', 'cultivo'];
  obras.sort((a, b) => (orden.indexOf(b.b) + 1 || 0) - (orden.indexOf(a.b) + 1 || 0));
  for (const o of obras) {
    let mejor = -1, d0 = Infinity;
    for (let i = 0; i < n * n; i++) {
      if (whyNot(nuevo, o.b, i)) continue;
      const d = Math.hypot(Math.floor(i / n) + .5 - o.r, i % n + .5 - o.c);
      if (d < d0) { d0 = d; mejor = i; }
    }
    if (mejor >= 0) { nuevo.map[mejor].b = o.b; if (nuevo.map[mejor].t === 'bosque') nuevo.map[mejor].t = 'llano'; }
  }
  nuevo.gold = oro;
  return nuevo;
}

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
  S = JSON.parse(JSON.stringify(S));
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
