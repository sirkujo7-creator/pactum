// Pinceles de acuarela compartidos (tomados de la prueba de estilo aprobada).
// Todo se pinta una sola vez sobre un lienzo y se hornea como textura.

export const PAPEL = '#ECEAE2';
export const TINTA = '#2B2A25';

export function mulberry(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rgb = h => { h = h.replace('#', ''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); };
const hex = a => '#' + a.map(v => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
export const shade = (h, f) => hex(rgb(h).map(v => f < 0 ? v * (1 + f) : v + (255 - v) * f));
export const mix = (a, b, t) => { const x = rgb(a), y = rgb(b); return hex(x.map((v, i) => v + (y[i] - v) * t)); };

export function lienzo(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.ceil(w); c.height = Math.ceil(h);
  return c;
}

export function poly(g, pts) {
  g.beginPath();
  pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]));
  g.closePath();
}

// Lavado: tres pasadas con bordes que tiemblan un poco.
export function wash(g, pts, col, rng, al = .9, j = 1.4) {
  for (let k = 0; k < 3; k++) {
    g.globalAlpha = k ? al * .35 : al;
    g.fillStyle = k === 2 ? shade(col, -.07) : k === 1 ? shade(col, .06) : col;
    poly(g, pts.map(p => [p[0] + (rng() - .5) * j * (k ? 1 : 0), p[1] + (rng() - .5) * j * (k ? 1 : 0)]));
    g.fill();
  }
  g.globalAlpha = 1;
}

export function blob(g, x, y, rx, ry, col, rng, al = .9) {
  for (let k = 0; k < 3; k++) {
    g.globalAlpha = al * (k ? .45 : 1);
    g.fillStyle = k === 1 ? shade(col, .1) : k === 2 ? shade(col, -.08) : col;
    g.beginPath();
    g.ellipse(x + (rng() - .5) * rx * .25, y + (rng() - .5) * ry * .25, rx * (.9 + rng() * .18), ry * (.9 + rng() * .18), 0, 0, Math.PI * 2);
    g.fill();
  }
  g.globalAlpha = 1;
}

// Grano del papel, para multiplicar encima de lo pintado.
let GRANO = null;
export function grano() {
  if (GRANO) return GRANO;
  const c = lienzo(180, 180), x = c.getContext('2d'), im = x.createImageData(180, 180), r = mulberry(42);
  for (let k = 0; k < im.data.length; k += 4) {
    const v = 200 + r() * 55;
    im.data[k] = v; im.data[k + 1] = v * .985; im.data[k + 2] = v * .95; im.data[k + 3] = 255;
  }
  x.putImageData(im, 0, 0);
  return (GRANO = c);
}

export function papel(g, w, h, al = .2) {
  g.save();
  g.globalCompositeOperation = 'multiply';
  g.globalAlpha = al;
  g.fillStyle = g.createPattern(grano(), 'repeat');
  g.fillRect(0, 0, w, h);
  g.restore();
}

// Perfil de una cordillera: puntos a lo largo del ancho con varias crestas.
function cresta(w, base, alto, rng, ondas) {
  const pts = [], f = ondas.map(() => [rng() * 6, .6 + rng() * .8]);
  for (let x = -10; x <= w + 10; x += 6) {
    const s = x / w;
    let y = 0;
    ondas.forEach((o, i) => { y += Math.abs(Math.sin(s * Math.PI * o + f[i][0])) * f[i][1] / ondas.length; });
    pts.push([x, base - y * alto]);
  }
  return pts;
}

// Paisaje de portada: nevado, bosque de niebla, laderas cafeteras y el valle con el río.
export function pintarPortada(w, h, semilla = 7) {
  const c = lienzo(w, h), g = c.getContext('2d'), R = mulberry(semilla);
  g.fillStyle = PAPEL; g.fillRect(0, 0, w, h);

  // Cielo: lavado suave de arriba hacia el horizonte.
  const cielo = g.createLinearGradient(0, 0, 0, h * .6);
  cielo.addColorStop(0, '#C9D8DC'); cielo.addColorStop(1, PAPEL);
  g.globalAlpha = .8; g.fillStyle = cielo; g.fillRect(0, 0, w, h * .6); g.globalAlpha = 1;

  // Nevado del Tolima al fondo, con su cumbre blanca.
  const cx = w * .68, cy = h * .2, nev = [[cx - w * .34, h * .52], [cx - w * .06, cy + h * .05], [cx, cy], [cx + w * .07, cy + h * .06], [cx + w * .36, h * .52]];
  wash(g, nev, '#A9B3B8', R, .85, 3);
  wash(g, [[cx - w * .045, cy + h * .06], [cx, cy], [cx + w * .05, cy + h * .065], [cx + w * .02, cy + h * .08], [cx - w * .01, cy + h * .07]], '#F6F5EF', R, .95, 2);

  // Capas de montaña: páramo, bosque de niebla, ladera cafetera.
  const capas = [
    ['#9DAE9A', .5, .16, [2.1, 3.7, 7.3]],
    ['#6E9567', .6, .14, [1.6, 4.2, 9.1]],
    ['#8DB06A', .7, .12, [1.2, 3.1, 6.7]]
  ];
  capas.forEach(([col, b, a, o]) => {
    const p = cresta(w, h * b, h * a, R, o);
    wash(g, [...p, [w + 10, h + 10], [-10, h + 10]], col, R, .9, 2.5);
  });

  // Matas de café y guadua en la ladera cercana.
  for (let k = 0; k < 90; k++) {
    const x = R() * w, y = h * (.62 + R() * .1);
    blob(g, x, y, 5 + R() * 5, 3 + R() * 3, R() < .7 ? '#3E6B3F' : '#5E8A4D', R, .7);
  }

  // Valle cálido y el río que lo cruza.
  wash(g, [[-10, h * .8], [w * .3, h * .76], [w * .7, h * .79], [w + 10, h * .75], [w + 10, h + 10], [-10, h + 10]], '#C9C27E', R, .9, 2);
  g.save();
  g.globalAlpha = .85; g.strokeStyle = '#7DB0C6'; g.lineCap = 'round';
  g.lineWidth = Math.max(6, h * .018);
  g.beginPath(); g.moveTo(-10, h * .9);
  g.bezierCurveTo(w * .3, h * .8, w * .55, h * .98, w + 10, h * .84);
  g.stroke();
  g.globalAlpha = .5; g.strokeStyle = '#B9D6E0'; g.lineWidth = g.lineWidth * .35;
  g.stroke();
  g.restore();

  // Samanes del bosque seco en el valle.
  for (let k = 0; k < 14; k++) {
    const x = R() * w, y = h * (.8 + R() * .15);
    g.strokeStyle = '#6B5A45'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 8); g.stroke();
    blob(g, x, y - 11, 14 + R() * 6, 5 + R() * 2, '#6F8F4A', R, .85);
  }

  papel(g, w, h, .22);
  return c;
}

// Banco de niebla: mancha blanca de bordes muy suaves.
export function pintarNiebla(w = 512, h = 128) {
  const c = lienzo(w, h), g = c.getContext('2d'), R = mulberry(3);
  for (let k = 0; k < 9; k++) {
    const x = w * (.15 + R() * .7), y = h * (.4 + R() * .2), r = h * (.35 + R() * .2);
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr;
    g.save(); g.translate(x, y); g.scale(2.2, 1); g.translate(-x, -y);
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); g.restore();
  }
  return c;
}
