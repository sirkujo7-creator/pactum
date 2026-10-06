// Pinceles planos para animales y plantas (pedido de Juan, 6 de octubre; prueba aprobada pruebas/naturaleza.html):
// color liso, facetas con una sola sombra de borde nítido y la luz siempre desde arriba a la izquierda. La sombra en
// el suelo cae abajo a la derecha, suave y difusa, y es más larga cuanto más alto es el objeto (un solo sol para todo).

export const sh = (h, f) => { const v = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)).map(x => Math.round(f < 0 ? x * (1 + f) : x + (255 - x) * f)); return '#' + v.map(x => Math.max(0, Math.min(255, x)).toString(16).padStart(2, '0')).join(''); };
// Mezcla dos colores (#rrggbb).
export const mezcla = (a, b, t) => { const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)), A = p(a), B = p(b); return '#' + A.map((x, i) => Math.round(x + (B[i] - x) * t).toString(16).padStart(2, '0')).join(''); };

export function camino(g, pts, suave = true) {
  g.beginPath(); g.moveTo(...pts[0]);
  if (suave) for (let k = 1; k <= pts.length; k++) { const p = pts[k % pts.length], q = pts[(k + 1) % pts.length]; g.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); }
  else pts.slice(1).forEach(p => g.lineTo(...p));
  g.closePath();
}
export const pol = (g, pts, col) => { camino(g, pts, false); g.fillStyle = col; g.fill(); };
export const elip = (g, x, y, rx, ry, col, rot = 0) => { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, 7); g.fill(); };
export const ojoF = (g, x, y, r = .5) => elip(g, x, y, r, r * 1.1, '#1E1A18');

// Sombra proyectada suave. ancho: medio ancho de lo que la proyecta; alto: su altura (0 para lo que va pegado al
// suelo); copa: medio ancho de la copa o del cuerpo de arriba (si no se da, igual al ancho). Se dibuja con el
// desenfoque del lienzo (shadowBlur): la figura va lejos, fuera del cuadro, y solo su sombra borrosa cae aquí,
// en una sola pasada, sin manchas que se oscurezcan al encimarse.
export function sombraSuave(g, ancho, alto = 0, copa = ancho, a = .3) {
  const m = g.getTransform(), e = Math.hypot(m.a, m.b) || 1, lejos = 3000;
  const L = alto * .34, cx = L, cy = L * .2; // hacia abajo a la derecha, lejos de la luz
  g.save();
  g.shadowColor = `rgba(32,38,20,${a})`; g.shadowBlur = Math.max(1.2, Math.min(ancho, copa) * .5) * e;
  g.shadowOffsetX = lejos * m.a; g.shadowOffsetY = lejos * m.b;
  g.fillStyle = '#000'; g.beginPath();
  g.ellipse(-lejos + ancho * .15, .3, ancho * .85, ancho * .26 + .4, 0, 0, 7);
  if (L > 1.5) {
    const w = Math.max(.8, ancho * .35), n = Math.hypot(cx, cy), nx = -cy / n * w, ny = cx / n * w;
    g.moveTo(-lejos - nx, -ny); g.lineTo(-lejos + cx - nx, cy - ny); g.lineTo(-lejos + cx + nx, cy + ny); g.lineTo(-lejos + nx, ny); g.closePath(); // mismo giro que las elipses: sin huecos
    g.moveTo(-lejos + cx + copa * .95, cy); g.ellipse(-lejos + cx, cy, copa * .95, copa * .32 + .5, 0, 0, 7);
  }
  g.fill();
  g.restore();
}

// Follaje con detalle: muchas hojas pequeñas en tres pasadas (sombra, color, luz) que se concentran arriba a la izquierda.
export function follaje(g, R, cx, cy, rx, ry, cols, n, tam = 1.6, forma = 'hoja') {
  const [osc, med, luz] = cols;
  const hoja = (x, y, c, s) => { g.fillStyle = c; g.beginPath(); if (forma === 'flor') g.arc(x, y, s * .7, 0, 7); else g.ellipse(x, y, s, s * .55, R() * Math.PI, 0, 7); g.fill(); };
  for (let k = 0; k < n; k++) { const a = R() * 6.28, d = Math.sqrt(R()); hoja(cx + Math.cos(a) * rx * d, cy + Math.sin(a) * ry * d, osc, tam * (.8 + R() * .5)); }
  for (let k = 0; k < n * .8; k++) { const a = R() * 6.28, d = Math.sqrt(R()) * .86; hoja(cx - rx * .12 + Math.cos(a) * rx * d, cy - ry * .14 + Math.sin(a) * ry * d, med, tam * (.8 + R() * .5)); }
  for (let k = 0; k < n * .35; k++) { const a = R() * 6.28, d = Math.sqrt(R()) * .55; hoja(cx - rx * .34 + Math.cos(a) * rx * d, cy - ry * .36 + Math.sin(a) * ry * d, luz, tam * (.7 + R() * .4)); }
}
// Tronco plano que se adelgaza, con su lado derecho en sombra.
export function tronco(g, x0, y0, x1, y1, w0, w1, col) {
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  pol(g, [[x0 + nx * w0, y0 + ny * w0], [x1 + nx * w1, y1 + ny * w1], [x1 - nx * w1, y1 - ny * w1], [x0 - nx * w0, y0 - ny * w0]], col);
  pol(g, [[x0 - nx * w0 * .1, y0 - ny * w0 * .1], [x1 - nx * w1 * .1, y1 - ny * w1 * .1], [x1 - nx * w1, y1 - ny * w1], [x0 - nx * w0, y0 - ny * w0]], sh(col, -.2));
}
