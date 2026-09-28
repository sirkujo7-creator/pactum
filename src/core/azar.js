// Azar y utilidades numéricas. La fuente de azar se puede cambiar (por ejemplo, para pruebas repetibles).
let fuente = () => Math.random();

export function azar() { return fuente(); }
export function fijarAzar(f) { fuente = f || (() => Math.random()); }
export function rnd(n) { return Math.floor(azar() * n); }
export function mulberry(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
export function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
