// Prueba de obras: muestra cada obra pintada en las cuatro épocas (0 bahareque, 1 tapia, 2 ladrillo, 3 concreto).
import { hornearEdificios, hornearGrandes } from '../src/arte/edificios.js';
const q = new URLSearchParams(location.search), claves = (q.get('k') || 'cruzFundacion,estadio,acueducto,cantera,banco,hospital,biblioteca,cancha').split(',');
const Z = +q.get('z') || 1.2, R = document.getElementById('r');
// ?h=0,1,2,3,4,5 muestra las seis épocas de la historia (la época de dibujo de las casas sale de cada una).
const hs = q.get('h') ? q.get('h').split(',').map(Number) : null, eras = hs ? hs.map(h => [0, 0, 1, 2, 3, 3][h]) : (q.get('e') || '0,1,2,3').split(',').map(Number), hojas = eras.map((e, i) => hornearEdificios(e, hs ? hs[i] : undefined)), grandes = eras.map((e, i) => hornearGrandes(e, hs ? hs[i] : [0, 1, 2, 5][e]));
const NOM = ['fundación', 'café', 'La Violencia', 'modernización', 'conflicto y paz', 'era digital'];
const tabla = document.createElement('table');
tabla.innerHTML = '<tr><th></th>' + eras.map((e, i) => `<th>${hs ? NOM[hs[i]] : 'época ' + e}</th>`).join('') + '</tr>';
for (const k of claves) {
  const tr = document.createElement('tr'); tr.innerHTML = `<td class="n">${k}</td>`;
  for (const [ix, h0] of hojas.entries()) {
    const h = h0.marcos[k] ? h0 : grandes[ix], m = h.marcos[k], td = document.createElement('td');
    if (m) { const c = document.createElement('canvas'), w = m.w / h.escala * Z, hh = m.h / h.escala * Z; c.width = Math.round(w * 2); c.height = Math.round(hh * 2); c.style.width = w + 'px'; c.style.height = hh + 'px'; c.getContext('2d').drawImage(h.canvas, m.x, m.y, m.w, m.h, 0, 0, c.width, c.height); td.appendChild(c); }
    tr.appendChild(td);
  }
  tabla.appendChild(tr);
}
R.appendChild(tabla);
