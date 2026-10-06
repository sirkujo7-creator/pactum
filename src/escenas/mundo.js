// Fase 15, paso 1: la pantalla «El mundo». Un mapa pintado al fresco (sin imágenes externas) con tu polis en el
// centro, los vecinos de frontera, las polis hermanas y los países vecinos; debajo, la ficha del lugar elegido.
import { C, exteriorActivo, lugares, datosLugar, relacionExterior, requisitoLugar, costoExterior, puedeExterior, accionExterior, nombreRegimen, vecinosActivos } from '../core/index.js';
import { FR } from '../arte/fresco.js';

const TU = { x: .47, y: .52 };
// Palabras para los efectos de un tratado o una liga.
export function efectosEnPalabras(ef) {
  if (!ef) return '';
  const p = Object.entries(ef).map(([k, v]) => ({
    comercio: `+${Math.round(v * 100)}% al comercio de mercados y puertos`, fincas: `+${Math.round(v * 100)}% a la renta de las fincas`,
    fabricas: `+${Math.round(v * 100)}% a las fábricas`, legitimidad: `${v > 0 ? '+' : ''}${v} de legitimidad`, saber: `+${v} de saber al año`,
    civismo: `+${v} de civismo al año`, conflicto: `${v} de presión del conflicto armado`
  }[k])).filter(Boolean);
  return p.join(', ');
}
// Dibuja el mapa en un lienzo de w×h (en píxeles de pantalla) y devuelve dónde quedó cada lugar.
export function pintarMundo(cv, S, sel) {
  const dpr = Math.min(2, window.devicePixelRatio || 1), w = cv.clientWidth || 340, h = Math.round(w * .82);
  cv.width = w * dpr; cv.height = h * dpr; cv.style.height = h + 'px';
  const g = cv.getContext('2d'); g.scale(dpr, dpr);
  const X = x => x * w, Y = y => y * h, onda = (x, k) => Math.sin(x * 9 + k) * 4;
  g.fillStyle = '#EDE3CC'; g.fillRect(0, 0, w, h);
  // Mares: Caribe arriba y Pacífico a la izquierda.
  g.fillStyle = '#9CC1C9'; g.beginPath(); g.moveTo(0, 0); g.lineTo(w, 0); g.lineTo(w, Y(.06)); for (let x = 1; x >= 0; x -= .05) g.lineTo(X(x), Y(.07) + onda(x, 1)); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(0, 0); for (let y = 0; y <= 1; y += .05) g.lineTo(X(.07) + onda(y, 2), Y(y)); g.lineTo(0, h); g.closePath(); g.fill();
  // Llanos y Amazonía al oriente y al sur.
  g.fillStyle = 'rgba(201,184,120,.55)'; g.beginPath(); g.moveTo(X(.78), Y(.25)); g.lineTo(w, Y(.2)); g.lineTo(w, Y(.7)); g.lineTo(X(.8), Y(.68)); g.closePath(); g.fill();
  g.fillStyle = 'rgba(79,120,72,.45)'; g.beginPath(); g.moveTo(X(.62), Y(.82)); g.lineTo(w, Y(.7)); g.lineTo(w, h); g.lineTo(X(.55), h); g.closePath(); g.fill();
  // Tres cordilleras (pinceladas de tierra) y los ríos Cauca y Magdalena.
  for (const [x0, col] of [[.2, '#A78B67'], [.4, '#9A7D5A'], [.62, '#A78B67']]) {
    g.strokeStyle = col; g.lineWidth = 9; g.lineCap = 'round'; g.globalAlpha = .55; g.beginPath();
    for (let y = .1; y <= .98; y += .04) { const x = x0 + (y - .5) * .12 + Math.sin(y * 13 + x0 * 7) * .012; y === .1 ? g.moveTo(X(x), Y(y)) : g.lineTo(X(x), Y(y)); } g.stroke(); g.globalAlpha = 1;
  }
  for (const [x0, w0] of [[.31, 2], [.52, 3]]) {
    g.strokeStyle = '#4F86A0'; g.lineWidth = w0; g.beginPath();
    for (let y = .98; y >= .08; y -= .03) { const x = x0 + (y - .5) * .1 + Math.sin(y * 17 + x0 * 5) * .01; y > .97 ? g.moveTo(X(x), Y(y)) : g.lineTo(X(x), Y(y)); } g.stroke();
  }
  g.font = 'italic 10px Alegreya, Georgia, serif'; g.fillStyle = '#4F6F7E';
  g.fillText('Mar Caribe', X(.42), Y(.04)); g.save(); g.translate(X(.035), Y(.6)); g.rotate(-Math.PI / 2); g.fillText('Océano Pacífico', 0, 0); g.restore();
  g.fillStyle = '#7E6A40'; g.fillText('Llanos', X(.86), Y(.45)); g.fillStyle = '#3E6040'; g.fillText('Amazonía', X(.8), Y(.92));
  g.fillStyle = '#3F6F8A'; g.fillText('río Magdalena', X(.53), Y(.2));
  // Tu polis y sus vecinos de frontera.
  const pos = {};
  if (vecinosActivos(S)) Object.entries(C.VECINOS.vecinos).forEach(([id, V], k) => {
    const a = k / 3 * Math.PI * 2 + .5, x = TU.x + Math.cos(a) * .085, y = TU.y + Math.sin(a) * .1, r = S.vecinos[id] ? S.vecinos[id].rel : 50;
    g.fillStyle = r >= 65 ? '#6E9A58' : r <= 30 ? FR.rojo : '#C9A85E'; g.beginPath(); g.arc(X(x), Y(y), 4, 0, 7); g.fill();
  });
  g.fillStyle = '#A8573A'; g.strokeStyle = '#F7F1E3'; g.lineWidth = 2; g.beginPath();
  for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? 4.5 : 10; g.lineTo(X(TU.x) + Math.cos(a) * rr, Y(TU.y) + Math.sin(a) * rr); }
  g.closePath(); g.stroke(); g.fill();
  g.font = 'bold 11px Alegreya, Georgia, serif'; g.fillStyle = '#3A2A20'; g.fillText('Tu polis', X(TU.x) + 12, Y(TU.y) + 4);
  // Polis hermanas y países.
  for (const L of lugares()) {
    const E = relacionExterior(S, L.id), x = X(L.x), y = Y(L.y), R = L.circulo === 'paises' ? 13 : 11;
    pos[L.id] = { x: L.x, y: L.y, r: R / w };
    g.setLineDash(E ? [] : [3, 3]);
    g.fillStyle = E ? (E.trato === 'liga' ? '#E8C77A' : '#F7F1E3') : 'rgba(247,241,227,.6)';
    g.strokeStyle = !E ? '#9A8E7E' : E.rel >= 65 ? '#4F8A43' : E.rel <= 30 ? FR.rojo : '#B08E3A';
    g.lineWidth = sel === L.id ? 4 : E && E.trato ? 3 : 2;
    g.beginPath(); g.arc(x, y, R, 0, 7); g.fill(); g.stroke(); g.setLineDash([]);
    g.font = `${R}px system-ui, sans-serif`; g.textAlign = 'center'; g.globalAlpha = E ? 1 : .5; g.fillText(L.icono, x, y + R * .36); g.globalAlpha = 1;
    g.font = `${E ? 'bold ' : ''}10px Alegreya, Georgia, serif`; g.fillStyle = E ? '#3A2A20' : '#8A7E6E'; g.fillText(L.nombre, x, y + R + 11); g.textAlign = 'left';
    if (E && E.trato) { g.strokeStyle = E.trato === 'liga' ? '#B08E3A' : '#8A6A48'; g.lineWidth = 1.2; g.setLineDash([4, 3]); g.beginPath(); g.moveTo(X(TU.x), Y(TU.y)); g.lineTo(x, y); g.stroke(); g.setLineDash([]); }
  }
  return pos;
}
// La ficha de un lugar (HTML).
export function fichaLugar(S, id) {
  const L = datosLugar(id), E = relacionExterior(S, id), T = C.EXT.textos;
  if (!E) return `<h3>${L.icono} ${L.nombre}</h3><p class="small">${L.texto}</p><p class="small"><b>${T.desconocida}.</b> ${T.desde.replace('{req}', requisitoLugar(L))}</p>`;
  const col = E.rel >= 65 ? '#4F8A43' : E.rel <= 30 ? FR.rojo : '#B08E3A';
  const acciones = Object.entries(C.EXT.acciones).map(([a, A]) => { const no = puedeExterior(S, id, a); return `<button class="opt" data-ext="${a}" ${no ? 'disabled' : ''}><b>${A.icono} ${A.nombre}</b><small>${A.texto} Cuesta ${costoExterior(S, a)} de oro${a === 'liga' ? ` y ${Math.round(A.mantenimiento * S.price)} al año` : ''}.${no ? ` <i>${no}</i>` : ''}</small></button>`; }).join('');
  const aut = C.EXT.autoritarios.includes(E.reg);
  return `<h3>${L.icono} ${L.nombre} <small>(${L.capital})</small></h3>
    <p class="small">Gobierno: <b>${nombreRegimen(E.reg)}</b>${E.trato ? ` · <b>${T.trato[E.trato]}</b> desde el año ${E.desde}` : ''}</p>
    <div class="track" style="margin:4px 0"><div class="fill" style="width:${E.rel}%;background:${col}"></div></div><p class="small">${T.relacion.replace('{rel}', Math.round(E.rel))}</p>
    <p class="small">${L.texto}</p>
    <p class="small">📜 <b>${T.ofrece}:</b> ${efectosEnPalabras(L.ofrece)}. 🤝 <b>${T.conLiga}:</b> además ${efectosEnPalabras(L.liga)}.${aut ? ` <span class="neg">${T.autoritario.replace('{reg}', nombreRegimen(E.reg)).replace('{n}', 3)}</span>` : ''}</p>
    ${acciones}`;
}
// Elegir un lugar tocando el mapa (el más cercano, si está cerca).
export function lugarEn(pos, cv, ev) {
  const b = cv.getBoundingClientRect(), x = (ev.clientX - b.left) / b.width, y = (ev.clientY - b.top) / b.height;
  let mejor = null, d0 = 1e9;
  for (const [id, p] of Object.entries(pos)) { const d = Math.hypot(p.x - x, (p.y - y) * .82); if (d < d0) { d0 = d; mejor = id; } }
  return d0 < .08 ? mejor : null;
}
export { accionExterior, exteriorActivo };
