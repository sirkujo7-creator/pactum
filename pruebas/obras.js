// Prueba de obras: muestra cada obra pintada en las cuatro épocas (0 bahareque, 1 tapia, 2 ladrillo, 3 concreto).
import { hornearEdificios } from '../src/arte/edificios.js';
const q = new URLSearchParams(location.search), claves = (q.get('k') || 'cruzFundacion,estadio,acueducto,cantera,banco,hospital,biblioteca,cancha').split(',');
const Z = +q.get('z') || 1.2, R = document.getElementById('r');
const eras = (q.get('e') || '0,1,2,3').split(',').map(Number), hojas = eras.map(e => hornearEdificios(e));
const tabla = document.createElement('table');
tabla.innerHTML = '<tr><th></th>' + eras.map(e => `<th>época ${e}</th>`).join('') + '</tr>';
for (const k of claves) {
  const tr = document.createElement('tr'); tr.innerHTML = `<td class="n">${k}</td>`;
  for (const h of hojas) {
    const m = h.marcos[k], td = document.createElement('td');
    if (m) { const c = document.createElement('canvas'), w = m.w / h.escala * Z, hh = m.h / h.escala * Z; c.width = Math.round(w * 2); c.height = Math.round(hh * 2); c.style.width = w + 'px'; c.style.height = hh + 'px'; c.getContext('2d').drawImage(h.canvas, m.x, m.y, m.w, m.h, 0, 0, c.width, c.height); td.appendChild(c); }
    tr.appendChild(td);
  }
  tabla.appendChild(tr);
}
R.appendChild(tabla);
