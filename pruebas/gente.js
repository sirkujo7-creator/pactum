// Prueba de las acciones de los habitantes: cada ciclo de cuadros, por tipo de persona.
import { hornearAcciones, ACCIONES } from '../src/arte/gente.js';
const q = new URLSearchParams(location.search), mod = q.get('m') === '1', vi = +(q.get('v') || 0), Z = +(q.get('z') || 2.2), solo = q.get('t');
const H = hornearAcciones(mod), R = document.getElementById('r');
for (const tipo of Object.keys(ACCIONES)) {
  if (solo && solo !== tipo) continue;
  const t = document.createElement('h1'); t.textContent = tipo; R.appendChild(t);
  const fila = document.createElement('div'); fila.className = 'f'; R.appendChild(fila);
  for (const [acc, N] of Object.entries(ACCIONES[tipo])) {
    const d = document.createElement('div'); d.className = 'a'; d.innerHTML = `<b>${acc}</b>`;
    for (let n = 0; n < N; n++) { const m = H.marcos[`${tipo}_${vi}_${acc}_${n}`], c = document.createElement('canvas'); c.width = m.w * Z / 1.4; c.height = m.h * Z / 1.4; c.style.width = (m.w / 3 * Z) + 'px'; c.style.height = (m.h / 3 * Z) + 'px'; c.getContext('2d').drawImage(H.canvas, m.x, m.y, m.w, m.h, 0, 0, c.width, c.height); d.appendChild(c); }
    fila.appendChild(d);
  }
}
