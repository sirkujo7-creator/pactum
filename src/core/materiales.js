// Materiales (fase 17): madera, piedra y metal. Cada obra pide, además del oro, uno a tres materiales (y a veces
// alimento). Los producen el aserradero, la cantera y la mina; lo que falta se compra a los vecinos, más caro.
// Todo vive en S.mat y solo existe en las partidas en acuarela.
import { C } from './contenido.js';
import { climaActivo } from './clima.js';

export const MATERIALES = ['madera', 'piedra', 'metal'];
export const materialesActivos = S => climaActivo(S) && !!C.MAT && !!S.mat;
export const datosMaterial = m => C.MAT.materiales[m];
export function materialesIniciales() { return { ...C.MAT.inicial }; }
// Lo que pide una obra (sin oro): { madera, piedra, metal, alimento }.
export function costoMat(S, k) { return (C.MAT && C.MAT.costos[k]) || {}; }
const tiene = (S, m) => m === 'alimento' ? Math.floor(S.food) : Math.floor(S.mat[m] || 0);
const nombreDe = m => m === 'alimento' ? 'alimento' : datosMaterial(m).nombre.toLowerCase();
// Lo que falta para construir k: { madera: n, ... } (vacío si alcanza).
export function faltanteMat(S, k) {
  if (!materialesActivos(S)) return {};
  const f = {};
  for (const [m, n] of Object.entries(costoMat(S, k))) if (tiene(S, m) < n) f[m] = n - tiene(S, m);
  return f;
}
export function motivoMat(S, k) {
  const f = faltanteMat(S, k), L = Object.entries(f);
  return L.length ? C.MAT.textos.faltan.replace('{lista}', L.map(([m, n]) => `${n} de ${nombreDe(m)}`).join(', ')) : '';
}
// Descuenta los materiales de una obra y devuelve lo pagado (para deshacer).
export function pagarMat(S, k) {
  if (!materialesActivos(S)) return null;
  const pago = { ...costoMat(S, k) };
  for (const [m, n] of Object.entries(pago)) { if (m === 'alimento') S.food -= n; else S.mat[m] -= n; }
  return pago;
}
export function devolverMat(S, pago) {
  if (!pago || !S.mat) return;
  for (const [m, n] of Object.entries(pago)) { if (m === 'alimento') S.food += n; else S.mat[m] += n; }
}
// Precio de comprar n unidades a los vecinos (con el nivel de precios del territorio y un recargo).
export function precioCompra(S, m, n = 1) { return Math.round(datosMaterial(m).precio * Math.sqrt(S.price) * C.MAT.compra.recargo * n); }
export function comprarMat(S, m, n = C.MAT.compra.lote) {
  if (!materialesActivos(S) || !MATERIALES.includes(m)) return false;
  const oro = precioCompra(S, m, n);
  if (S.gold < oro) return false;
  S.gold -= oro; S.mat[m] += n; S.matGasto = (S.matGasto || 0) + oro;
  return oro;
}
// Compra lo que falta para una obra (lo usan los robots y el botón «Comprar lo que falta»). Devuelve el oro gastado o false.
export function comprarFaltante(S, k) {
  const f = faltanteMat(S, k);
  if (f.alimento) return false; // el alimento no se compra aquí
  const total = Object.entries(f).reduce((t, [m, n]) => t + precioCompra(S, m, n), 0);
  if (!total) return 0;
  if (S.gold < total) return false;
  for (const [m, n] of Object.entries(f)) { S.gold -= precioCompra(S, m, n); S.mat[m] += n; }
  S.matGasto = (S.matGasto || 0) + total;
  return total;
}
// Producción de cada año: aserraderos, canteras y minas que ya funcionan, según sus trabajadores.
export function produccionMat(S, fT = 1) {
  const P = {}; if (!materialesActivos(S)) return P;
  for (const x of S.map) {
    if (!x.b || x.ob) continue;
    const q = C.MAT.produccion[x.b]; if (!q) continue;
    for (const [m, n] of Object.entries(q)) P[m] = (P[m] || 0) + n * fT;
  }
  return P;
}
export function producirMat(S, fT = 1) {
  const P = produccionMat(S, fT);
  for (const [m, n] of Object.entries(P)) S.mat[m] += Math.round(n);
  return P;
}
