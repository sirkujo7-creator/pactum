// Proyección isométrica del mundo. (r, c) es fila y columna; h es la altura del terreno.
export const TW = 64, TH = 32, EL = 15;

export function P(r, c, h = 0) { return [(c - r) * TW / 2, (c + r) * TH / 2 - h * EL]; }

// Altura del terreno en cualquier punto (también entre casillas).
export function alturaEn(T, r, c) {
  return T.hf(Math.max(0, Math.min(T.N, r)), Math.max(0, Math.min(T.N, c)));
}

// Casilla bajo un punto del mundo (la más cercana al frente si varias coinciden).
// En laderas empinadas el rombo del centro no siempre cubre lo que se ve; entonces se toma la más cercana.
export function casillaEn(T, wx, wy) {
  let best = null, cerca = null, dc = 2.2;
  for (const t of T.tiles) {
    const p = P(t.r + .5, t.c + .5, t.h), d = Math.abs(wx - p[0]) / (TW / 2) + Math.abs(wy - p[1]) / (TH / 2);
    if (d < 1 && (t.r + t.c) > (best ? best.r + best.c : -1)) best = t;
    if (d < dc) { dc = d; cerca = t; }
  }
  return best || cerca;
}
