// Vista de plano (reformas de claridad, paso 3): el territorio visto desde arriba, sin relieve, con un color por uso.
// Es también el lugar donde se mostrarán después la vocación del suelo y el subsuelo (fase 17).
import { C, dibujoCalles, rcEsquina, radioCasco, lado } from '../core/index.js';

// Colores del terreno y de cada grupo de obras (acuarela apagada, a juego con el resto).
const TERRENO = { llano: '#D9D2A8', bosque: '#9DB083', montana: '#B8A88A', rio: '#8DB8C6' };
export const USOS = [
  { id: 'vivienda', nombre: 'Vivienda', col: '#C2603E', obras: ['casa'] },
  { id: 'campo', nombre: 'Campo', col: '#C9A93E', obras: ['cultivo', 'cafetal'] },
  { id: 'industria', nombre: 'Industria y minas', col: '#6E6A78', obras: ['taller', 'molino', 'mina', 'puerto'] },
  { id: 'comercio', nombre: 'Comercio y finanzas', col: '#D08A2E', obras: ['mercado', 'banco', 'recaudo'] },
  { id: 'servicios', nombre: 'Servicios y cultura', col: '#3E8A8C', obras: ['escuela', 'biblioteca', 'hospital', 'universidad', 'acueducto', 'parque', 'cancha', 'estadio', 'teatro'] },
  { id: 'culto', nombre: 'Culto y vida cívica', col: '#7C5A9E', obras: ['iglesia', 'agora', 'cementerio', 'fundacion'] },
  { id: 'seguridad', nombre: 'Seguridad', col: '#3F5F9E', obras: ['cuartel', 'policia'] }
];
const USO_DE = {}; USOS.forEach(u => u.obras.forEach(k => USO_DE[k] = u));
export const usoDe = k => USO_DE[k] || { id: 'otro', nombre: 'Otras obras', col: '#8A7E6E' };

// Pinta el plano en un lienzo cuadrado. Devuelve el tamaño de casilla en píxeles (para saber dónde se tocó).
export function pintarPlano(cv, S, sel) {
  const N = lado(S), dpr = Math.min(2, window.devicePixelRatio || 1), w = cv.clientWidth || 340, q = w / N;
  cv.width = Math.round(w * dpr); cv.height = Math.round(w * dpr); cv.style.height = w + 'px';
  const g = cv.getContext('2d'); g.scale(dpr, dpr);
  // Terreno, con un tono un poco más oscuro donde el suelo sube.
  for (let i = 0; i < N * N; i++) {
    const x = S.map[i], r = Math.floor(i / N), c = i % N;
    g.fillStyle = TERRENO[x.t] || TERRENO.llano; g.fillRect(c * q, r * q, q + .5, q + .5);
    if (x.h > 0 && x.t !== 'rio') { g.fillStyle = `rgba(90,70,40,${.07 * x.h})`; g.fillRect(c * q, r * q, q + .5, q + .5); }
  }
  // Casco urbano: círculo punteado alrededor de la plaza.
  const R = radioCasco(S);
  if (R !== null && S.centro !== undefined) {
    const cr = Math.floor(S.centro / N) + .5, cc = S.centro % N + .5;
    g.save(); g.setLineDash([5, 4]); g.strokeStyle = 'rgba(58,42,32,.55)'; g.lineWidth = 1.5; g.beginPath(); g.arc(cc * q, cr * q, (R + .5) * q, 0, 7); g.stroke(); g.restore();
  }
  // Calles.
  const D = dibujoCalles(S);
  if (D) {
    g.lineCap = 'round'; g.strokeStyle = '#F4EBD3'; g.lineWidth = Math.max(1.6, q * .22);
    for (const [a, b, agua] of D.tramos) {
      const [r1, c1] = rcEsquina(N, a), [r2, c2] = rcEsquina(N, b);
      g.globalAlpha = agua ? .6 : 1; g.beginPath(); g.moveTo(c1 * q, r1 * q); g.lineTo(c2 * q, r2 * q); g.stroke();
    }
    g.globalAlpha = 1;
  }
  // Obras: un cuadro de color por uso, con la inicial de la obra cuando cabe.
  for (let i = 0; i < N * N; i++) {
    const x = S.map[i]; if (!x.b) continue;
    const r = Math.floor(i / N), c = i % N, u = usoDe(x.b), m = q * .1;
    g.fillStyle = u.col; g.fillRect(c * q + m, r * q + m, q - 2 * m, q - 2 * m);
    if (x.ob) { g.strokeStyle = '#F7F1E3'; g.setLineDash([2, 2]); g.lineWidth = 1; g.strokeRect(c * q + m, r * q + m, q - 2 * m, q - 2 * m); g.setLineDash([]); }
    if (x.b === 'fundacion') {
      g.fillStyle = '#F7F1E3'; g.beginPath();
      for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = (k % 2 ? .18 : .4) * q; g.lineTo((c + .5) * q + Math.cos(a) * rr, (r + .5) * q + Math.sin(a) * rr); }
      g.closePath(); g.fill();
    }
  }
  if (sel !== null && sel !== undefined) {
    const r = Math.floor(sel / N), c = sel % N;
    g.strokeStyle = '#3A2A20'; g.lineWidth = 2; g.strokeRect(c * q + 1, r * q + 1, q - 2, q - 2);
  }
  return q;
}
// Casilla bajo un toque o clic sobre el lienzo (o null).
export function casillaPlano(cv, S, ev) {
  const N = lado(S), b = cv.getBoundingClientRect(), c = Math.floor((ev.clientX - b.left) / b.width * N), r = Math.floor((ev.clientY - b.top) / b.height * N);
  return r >= 0 && c >= 0 && r < N && c < N ? r * N + c : null;
}
