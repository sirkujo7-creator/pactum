// Daño propio de cada edificio (pedido de Juan: «¿hay diferencia entre los edificios sanos y los fracturados?»).
// En vez de pegar grietas sueltas encima, el daño se pinta sobre la silueta del mismo dibujo: manchas de humedad que
// chorrean, pañete caído que deja ver el bahareque o el ladrillo, grietas, vidrios rotos o ventanas tapiadas con
// tablas y musgo al pie (agrietada y abandonada). La ruina se hace con el mismo edificio partido: queda la parte de
// abajo con el borde roto, ennegrecida, con escombros, vigas caídas y polvo, así una escuela en ruinas sigue
// pareciendo escuela. Se hornea solo cuando hace falta (pocas obras dañadas a la vez) y se guarda por hoja.
import { lienzo, mulberry } from '../arte/acuarela.js';

let HOJA = null, CACHE = new Map(), N_HOJA = 0;
function preparar(H, scene) { if (H !== HOJA) { if (scene) for (const k of CACHE.keys()) if (scene.textures.exists(k)) scene.textures.remove(k); HOJA = H; CACHE = new Map(); N_HOJA++; } }
// Recorte del dibujo k en un lienzo propio, con la fila más alta que tiene pintura.
function recorte(H, k) {
  const m = H.marcos[k]; if (!m) return null;
  const cv = lienzo(m.w, m.h), g = cv.getContext('2d'); g.drawImage(H.canvas, m.x, m.y, m.w, m.h, 0, 0, m.w, m.h);
  const d = g.getImageData(0, 0, m.w, m.h).data; let arriba = 0;
  buscar: for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x += 2) if (d[(y * m.w + x) * 4 + 3] > 60) { arriba = y; break buscar; }
  return { m, cv, g, arriba };
}
const quad = (g, q, ax, ay, s) => { g.beginPath(); q.forEach(([x, y], j) => j ? g.lineTo(ax + x * s, ay + y * s) : g.moveTo(ax + x * s, ay + y * s)); g.closePath(); };
function grieta(g, x, y, largo, s, R, ancho = .45) {
  g.strokeStyle = 'rgba(36,24,14,.78)'; g.lineWidth = ancho * s; g.lineJoin = 'round'; g.beginPath(); g.moveTo(x, y);
  let px = x, py = y; const n = 5 + Math.floor(R() * 4);
  for (let k = 0; k < n; k++) { px += (R() - .5) * 2.4 * s; py += largo / n * s; g.lineTo(px, py); if (R() < .3) { g.moveTo(px, py); g.lineTo(px + (R() - .5) * 3 * s, py + 1.6 * s); g.moveTo(px, py); } }
  g.stroke(); g.strokeStyle = 'rgba(255,240,215,.25)'; g.lineWidth = .25 * s; g.stroke();
}

// Capa de daño (nivel 2 agrietada, 3 abandonada) para el dibujo k. Devuelve la clave de textura o null.
export function capaDano(scene, H, k, nivel) {
  preparar(H, scene); const clave = `dano${N_HOJA}-${k}-${nivel}`;
  if (scene.textures.exists(clave)) return clave;
  const C = recorte(H, k); if (!C) return null;
  const { m, cv: base } = C, s = H.escala, R = mulberry(k.length * 977 + nivel * 31 + k.charCodeAt(0));
  const cv = lienzo(m.w, m.h), g = cv.getContext('2d'), alto = m.ay - C.arriba;
  // Zona de los muros: desde un poco arriba de las ventanas hasta el pie (el techo no se mancha ni se agrieta).
  const vy = m.ventanas && m.ventanas.length ? Math.min(...m.ventanas.flat().map(p => m.ay + p[1] * s)) : m.ay - alto * .42;
  const z0 = Math.max(C.arriba + alto * .2, vy - 2.5 * s), z1 = m.ay + 8 * s, zh = z1 - z0;
  // Manchas de humedad que chorrean desde arriba y salpique oscuro abajo.
  for (let n = 0; n < (nivel === 3 ? 16 : 8); n++) {
    const x = m.w * (.1 + R() * .8), y = z0 + zh * R() * .3, L = zh * (.3 + R() * .4), w = (.8 + R() * 1.8) * s;
    const gr = g.createLinearGradient(0, y, 0, y + L); gr.addColorStop(0, `rgba(70,56,36,${nivel === 3 ? .42 : .3})`); gr.addColorStop(1, 'rgba(70,56,36,0)');
    g.fillStyle = gr; g.beginPath(); g.moveTo(x - w, y); g.quadraticCurveTo(x, y - w * .6, x + w, y); g.lineTo(x + w * .4, y + L); g.lineTo(x - w * .3, y + L * .9); g.closePath(); g.fill();
  }
  { const gr = g.createLinearGradient(0, m.ay - 7 * s, 0, m.ay); gr.addColorStop(0, 'rgba(60,70,40,0)'); gr.addColorStop(1, `rgba(60,70,40,${nivel === 3 ? .5 : .28})`); g.fillStyle = gr; g.fillRect(0, m.ay - 7 * s, m.w, 7 * s + 30); } // humedad y musgo al pie
  // Pañete caído: parches que dejan ver el bahareque o el ladrillo.
  for (let n = 0; n < (nivel === 3 ? 7 : 3); n++) {
    const x = m.w * (.15 + R() * .7), y = z0 + zh * (.25 + R() * .5), r = (.9 + R() * 1.4) * s, col = R() < .5 ? '168,112,80' : '146,122,90';
    g.fillStyle = `rgba(${col},.6)`; g.beginPath(); for (let a = 0; a < 7; a++) { const t = a / 7 * Math.PI * 2, rr = r * (.45 + R() * .7); a ? g.lineTo(x + Math.cos(t) * rr * 1.3, y + Math.sin(t) * rr * .8) : g.moveTo(x + Math.cos(t) * rr, y + Math.sin(t) * rr * .7); } g.closePath(); g.fill();
    g.strokeStyle = 'rgba(80,50,30,.5)'; g.lineWidth = .25 * s; for (let j = 0; j < 3; j++) { g.beginPath(); g.moveTo(x - r * .6, y - r * .3 + j * r * .3); g.lineTo(x + r * .6, y - r * .3 + j * r * .3); g.stroke(); }
  }
  // Grietas en los muros.
  for (let n = 0; n < (nivel === 3 ? 4 : 2); n++) grieta(g, m.w * (.18 + R() * .64), z0 + zh * R() * .3, zh / s * (.35 + R() * .3), s, R, nivel === 3 ? .5 : .4);
  // Solo donde hay pintura del edificio.
  g.globalCompositeOperation = 'destination-in'; g.drawImage(base, 0, 0); g.globalCompositeOperation = 'source-over';
  // Vidrios rotos o ventanas tapiadas con tablas.
  if (m.ventanas) for (const q of m.ventanas) {
    const u = R(); if (u > (nivel === 3 ? .85 : .35)) continue;
    const xs = q.map(p => m.ax + p[0] * s), ys = q.map(p => m.ay + p[1] * s), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    g.save(); quad(g, q, m.ax, m.ay, s); g.clip(); g.fillStyle = '#16110D'; g.fill();
    g.strokeStyle = 'rgba(220,230,235,.7)'; g.lineWidth = .3 * s; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + (x1 - x0) * .45, y0 + (y1 - y0) * .55); g.lineTo(x0 + (x1 - x0) * .2, y1); g.moveTo(x1, y0); g.lineTo(x0 + (x1 - x0) * .6, y0 + (y1 - y0) * .4); g.stroke();
    g.restore();
    if (nivel === 3 && u < .45) { g.strokeStyle = '#7A5A38'; g.lineWidth = Math.max(1, (y1 - y0) * .22); g.beginPath(); g.moveTo(x0 - .4 * s, y0 + (y1 - y0) * .3); g.lineTo(x1 + .4 * s, y0 + (y1 - y0) * .5); g.moveTo(x0 - .4 * s, y0 + (y1 - y0) * .75); g.lineTo(x1 + .4 * s, y0 + (y1 - y0) * .6); g.stroke(); } // tablas clavadas
  }
  scene.textures.addCanvas(clave, cv); CACHE.set(clave, 1);
  return clave;
}

// La ruina del mismo edificio: la parte de abajo con el borde roto, ennegrecida, con escombros y vigas.
export function ruinaPropia(scene, H, k) {
  preparar(H, scene); const clave = `ruinaP${N_HOJA}-${k}`;
  if (scene.textures.exists(clave)) return clave;
  const C = recorte(H, k); if (!C) return null;
  const { m, cv, g } = C, s = H.escala, R = mulberry(k.length * 613 + k.charCodeAt(1 % k.length)), alto = m.ay - C.arriba;
  // Se queda lo de abajo: un borde quebrado entre el 40% y el 65% de la altura.
  const corte = x => m.ay - alto * (.26 + .2 * Math.abs(Math.sin(x / m.w * 7.3 + 1.2)) * (.6 + R() * .4));
  g.globalCompositeOperation = 'destination-in'; g.beginPath(); g.moveTo(0, m.h);
  for (let x = 0; x <= m.w; x += Math.max(2, 1.6 * s)) g.lineTo(x, corte(x) + (R() - .5) * 2.2 * s);
  g.lineTo(m.w, m.h); g.closePath(); g.fillStyle = '#000'; g.fill();
  // Ennegrecido y hollín cerca del borde roto.
  g.globalCompositeOperation = 'source-atop';
  g.fillStyle = 'rgba(46,36,26,.45)'; g.fillRect(0, 0, m.w, m.h);
  const gr = g.createLinearGradient(0, m.ay - alto * .48, 0, m.ay - alto * .05); gr.addColorStop(0, 'rgba(24,18,14,.75)'); gr.addColorStop(1, 'rgba(24,18,14,0)'); g.fillStyle = gr; g.fillRect(0, 0, m.w, m.h);
  if (m.ventanas) for (const q of m.ventanas) { quad(g, q, m.ax, m.ay, s); g.fillStyle = '#120E0A'; g.fill(); } // vanos vacíos
  for (let n = 0; n < 4; n++) grieta(g, m.w * (.2 + R() * .6), m.ay - alto * .4, 5 + R() * 4, s, R, .55);
  g.globalCompositeOperation = 'source-over';
  // Vigas caídas y escombros al pie.
  for (let n = 0; n < 3; n++) { const x = m.w * (.25 + R() * .5), y = m.ay - alto * (.22 + R() * .08), L = (6 + R() * 6) * s, a = .5 + R() * .7 * (R() < .5 ? -1 : 1);
    g.strokeStyle = '#4A3420'; g.lineWidth = 1.2 * s; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * L, y + Math.abs(Math.sin(a)) * L * .7); g.stroke(); g.strokeStyle = 'rgba(160,120,80,.6)'; g.lineWidth = .35 * s; g.stroke(); }
  const piedras = ['#7E7466', '#958A7A', '#7A5A42', '#8E4A34', '#A89C88'];
  for (let n = 0; n < 40; n++) {
    const a = R() * Math.PI * 2, rr = Math.sqrt(R()), x = m.ax + Math.cos(a) * rr * 20 * s, y = m.ay + 5 * s + Math.sin(a) * rr * 5 * s, w = (.5 + R() * 1.1) * s;
    g.fillStyle = piedras[n % 5]; g.beginPath(); g.moveTo(x - w, y); g.lineTo(x - w * .3, y - w * .8); g.lineTo(x + w * .8, y - w * .5); g.lineTo(x + w, y + w * .2); g.lineTo(x, y + w * .4); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,245,225,.18)'; g.beginPath(); g.moveTo(x - w, y); g.lineTo(x - w * .3, y - w * .8); g.lineTo(x, y - w * .2); g.closePath(); g.fill();
  }
  const pg = g.createRadialGradient(m.ax, m.ay + 4 * s, 2, m.ax, m.ay + 4 * s, 18 * s); pg.addColorStop(0, 'rgba(200,190,170,.35)'); pg.addColorStop(1, 'rgba(200,190,170,0)'); g.fillStyle = pg; g.beginPath(); g.ellipse(m.ax, m.ay + 4 * s, 18 * s, 7 * s, 0, 0, 7); g.fill(); // polvo
  scene.textures.addCanvas(clave, cv); CACHE.set(clave, 1);
  return clave;
}
