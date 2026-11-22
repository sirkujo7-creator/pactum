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
  // Hoja en punta (almendra con las dos puntas afiladas), cada una con su giro; las flores son puntitos.
  const hoja = (x, y, c, s, a = R() * Math.PI) => {
    g.fillStyle = c; g.beginPath();
    if (forma === 'flor') { g.arc(x, y, s * .7, 0, 7); g.fill(); return; }
    const ca = Math.cos(a) * s, sa = Math.sin(a) * s, w = .55;
    g.moveTo(x - ca, y - sa); g.quadraticCurveTo(x - sa * w * 1.6, y + ca * w * 1.6, x + ca, y + sa); g.quadraticCurveTo(x + sa * w * 1.6, y - ca * w * 1.6, x - ca, y - sa); g.fill();
  };
  // Pulido (pedido de Juan): la copa se arma con grupos de follaje, cada uno con su propio volumen (sombra honda
  // abajo a la derecha, color, luz y brillo arriba a la izquierda), como una coliflor; los grupos de abajo a la
  // derecha de la copa quedan más oscuros y los de arriba a la izquierda más claros (un solo sol). Entre grupo y
  // grupo se ve el hueco oscuro de adentro.
  const k = Math.max(3, Math.round(n / 26)), grupos = [];
  for (let i = 0; i < k * 3 && grupos.length < k; i++) {
    const a = R() * 6.283, d = Math.sqrt(R()) * .72, x = cx + Math.cos(a) * rx * d, y = cy + Math.sin(a) * ry * d;
    if (grupos.some(q => Math.hypot((q.x - x) / rx, (q.y - y) / ry) < .32)) continue;
    grupos.push({ x, y });
  }
  if (!grupos.length) grupos.push({ x: cx, y: cy });
  const rg = Math.sqrt(rx * ry / grupos.length) * 1.05, ryg = rg * (ry / rx) ** .5 * .92, por = Math.max(8, Math.round(n / grupos.length));
  // Interior oscuro de la copa (se ve entre los grupos).
  for (let i = 0; i < n * .35; i++) { const a = R() * 6.28, d = Math.sqrt(R()) * .8; hoja(cx + Math.cos(a) * rx * d, cy + Math.sin(a) * ry * d, sh(osc, forma === 'flor' ? -.15 : -.4), tam * (.9 + R() * .5)); }
  grupos.sort((p, q) => p.y - q.y);
  for (const q of grupos) {
    const f = clamp01(.5 + ((q.x - cx) / rx) * .35 + ((q.y - cy) / ry) * .45), tono = c => sh(c, -.22 * f + .1 * (1 - f));
    const capa = (c, m, ox, oy, rr, s0) => { for (let i = 0; i < m; i++) { const a = R() * 6.28, d = Math.sqrt(R()) * rr; hoja(q.x + ox * rg + Math.cos(a) * rg * d, q.y + oy * ryg + Math.sin(a) * ryg * d, c, tam * (s0 + R() * .45)); } };
    capa(tono(sh(osc, -.25)), por * .5, .14, .2, .95, .8);
    capa(tono(osc), por, .04, .06, 1, .8);
    capa(tono(med), por * .8, -.14, -.16, .75, .78);
    capa(tono(luz), por * .45, -.3, -.34, .48, .7);
    if (forma !== 'flor') capa(sh(luz, .25), por * .12, -.42, -.46, .24, .6);
  }
}
const clamp01 = v => Math.max(0, Math.min(1, v));
// Hoja larga en punta (lanza) de (x0, y0) a (x1, y1), con ancho w en el medio y algo curvada (curva > 0, hacia la
// izquierda del trazo).
export function lanza(g, x0, y0, x1, y1, w, col, curva = 0) {
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, mx = (x0 + x1) / 2 + nx * curva, my = (y0 + y1) / 2 + ny * curva;
  g.fillStyle = col; g.beginPath(); g.moveTo(x0, y0);
  g.quadraticCurveTo(mx + nx * w * 1.4, my + ny * w * 1.4, x1, y1); g.quadraticCurveTo(mx - nx * w * 1.4, my - ny * w * 1.4, x0, y0); g.fill();
}
// Tronco plano que se adelgaza, con su lado derecho en sombra.
export function tronco(g, x0, y0, x1, y1, w0, w1, col) {
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  // Cilindro: color, sombra del lado derecho y una luz angosta del lado izquierdo (volumen, no silueta plana).
  const borde = (f0, f1, c) => pol(g, [[x0 + nx * w0 * f0, y0 + ny * w0 * f0], [x1 + nx * w1 * f0, y1 + ny * w1 * f0], [x1 + nx * w1 * f1, y1 + ny * w1 * f1], [x0 + nx * w0 * f1, y0 + ny * w0 * f1]], c);
  borde(1, -1, col); borde(.15, 1, sh(col, -.22)); borde(.6, 1, sh(col, -.34)); borde(-.85, -.45, sh(col, .18)); // el tronco sube: +n es la derecha
}
