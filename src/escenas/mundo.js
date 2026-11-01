// Fase 15, paso 1: la pantalla «El mundo»: la carta de tu polis, las polis hermanas y los países vecinos; debajo, la
// ficha del lugar elegido.
import { C, exteriorActivo, lugares, datosLugar, relacionExterior, requisitoLugar, costoExterior, puedeExterior, accionExterior, nombreRegimen } from '../core/index.js';
import { FR } from '../arte/fresco.js';

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

// La carta (pedido de Juan: «que parezca un mapa de verdad»): contornos reales de Colombia, sus departamentos, los
// países vecinos y los ríos (Natural Earth, de dominio público, simplificados en src/data/carta.json), pintados como una
// carta corográfica del siglo XIX: papel viejo, costas con líneas de agua, cordilleras a plumilla, nevados, rosa de los
// vientos, escala en leguas y cartela. Cada polis hermana lleva el color de tu relación; se toca el territorio entero.
// En computador se acerca con la rueda y se arrastra; en el celular, con los botones o pellizcando.
let DATOS = null, CARGA = null;
function cargar() {
  // La letra de imprenta antigua debe estar cargada antes de pintar (si no, el lienzo usa otra).
  const letras = document.fonts ? Promise.all(['12px "IM Fell English"', 'italic 12px "IM Fell English"', '12px "IM Fell English SC"'].map(f => document.fonts.load(f).catch(() => null))) : Promise.resolve();
  if (!CARGA) CARGA = Promise.all([fetch(new URL('../data/carta.json', import.meta.url)).then(r => r.json()), letras]).then(([d]) => { DATOS = preparar(d); return DATOS; });
  return CARGA;
}
// Polis hermanas y países: qué departamentos o qué país son, y su capital real.
const GRUPOS = {
  antioquia: { deptos: ['Antioquia'], capital: ['Medellín', 6.25, -75.57] },
  santafe: { deptos: ['Cundinamarca', 'Bogota'], capital: ['Bogotá', 4.71, -74.07] },
  huila: { deptos: ['Huila'], capital: ['Neiva', 2.93, -75.28] },
  quindio: { deptos: ['Quindío'], capital: ['Armenia', 4.53, -75.68] },
  valle: { deptos: ['Valle del Cauca'], capital: ['Cali', 3.45, -76.53] },
  venezuela: { pais: 'VEN', capital: ['Caracas', 10.49, -66.88] },
  ecuador: { pais: 'ECU', capital: ['Quito', -0.18, -78.47] },
  panama: { pais: 'PAN', capital: ['Panamá', 8.98, -79.52] }
};
const IBAGUE = ['Ibagué', 4.44, -75.23];
// Tus tres vecinos de frontera, como pueblos alrededor de tu territorio dentro del Tolima.
const PUEBLOS = { lagunilla: [4.15, -74.95], sanlorenzo: [5.2, -74.74], altamira: [4.98, -74.98] };
const NOMBRES_PAIS = { VEN: ['VENEZUELA', 8.3, -68.6], ECU: ['ECUADOR', -1.2, -77.6], PAN: ['PANAMÁ', 8.55, -80.6], PER: ['PERÚ', -3.6, -75.0], BRA: ['BRASIL', 0.6, -67.6], CRI: ['COSTA RICA', 9.95, -83.1] };
// Espinazo de las cordilleras y otras sierras (latitud, longitud).
const SIERRAS = [
  [[1.2, -77.6], [2.4, -76.95], [3.5, -76.62], [4.8, -76.2], [6.0, -76.12], [7.0, -76.05], [7.8, -75.95]],
  [[1.5, -76.75], [2.5, -76.2], [3.3, -75.92], [4.1, -75.5], [4.9, -75.35], [5.8, -75.32], [6.8, -75.4], [7.6, -75.25]],
  [[1.6, -76.15], [2.4, -75.75], [3.3, -74.85], [4.2, -74.15], [5.3, -73.6], [6.3, -73.0], [7.2, -72.6], [8.1, -72.9], [9.4, -73.1], [10.6, -72.95]],
  [[7.7, -72.25], [8.5, -71.25], [9.3, -70.45], [9.8, -69.8]],
  [[10.15, -68.6], [10.35, -67.6], [10.45, -66.4]],
  [[10.72, -74.05], [10.9, -73.55], [10.85, -73.25]],
  [[-4.3, -79.35], [-2.6, -78.95], [-1.2, -78.65], [0.2, -78.2], [1.1, -77.75]],
  [[7.6, -77.35], [8.4, -77.85]],
  [[9.25, -83.2], [8.75, -82.5], [8.55, -81.6]]
];
// Nevados y volcanes (solo el símbolo: con los nombres la carta se llenaba).
const NEVADOS = [['Nevado del Ruiz', 4.89, -75.32], ['Nevado del Tolima', 4.66, -75.33], ['Nevado del Huila', 2.93, -76.03], ['Sierra Nevada', 10.83, -73.68], ['Cotopaxi', -0.68, -78.44], ['Pico Bolívar', 8.54, -71.05]];
const RIOS_NOMBRE = { Magdalena: 'río Magdalena', Cauca: 'río Cauca', Atrato: 'río Atrato', Meta: 'río Meta', Orinoco: 'río Orinoco', Caquetá: 'río Caquetá', Putumayo: 'río Putumayo', Apure: 'río Apure', Napo: 'río Napo', Amazonas: 'río Amazonas', Guainía: 'río Guainía' };
const TINTA = '#4A3626', SEPIA = '#6B5440', AGUA = '#4D7F96';
const DEFECTO = { lon: -74.6, lat: 4.4, z: 1 };
let vista = { ...DEFECTO };

function preparar(d) {
  const anillo = a => { const p = []; for (let i = 0; i < a.length; i += 2) p.push([a[i], a[i + 1]]); return p; };
  const caja = rs => { let w = 1e9, e = -1e9, s = 1e9, n = -1e9; for (const r of rs) for (const [x, y] of r) { w = Math.min(w, x); e = Math.max(e, x); s = Math.min(s, y); n = Math.max(n, y); } return [w, e, s, n]; };
  const paises = Object.fromEntries(Object.entries(d.paises).map(([k, v]) => { const rs = v.map(anillo); return [k, { rs, caja: caja(rs) }]; }));
  const deptos = Object.fromEntries(Object.entries(d.deptos).map(([k, v]) => { const rs = v.map(anillo); return [k, { rs, caja: caja(rs) }]; }));
  const rios = Object.fromEntries(Object.entries(d.rios).map(([k, v]) => [k, v.map(anillo)]));
  return { caja: d.caja, paises, deptos, rios };
}
// Punto dentro de un anillo (lon, lat).
function dentro(r, x, y) {
  let c = false;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const [xi, yi] = r[i], [xj, yj] = r[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; }
  return c;
}
function anillosDe(D, id) { const G = GRUPOS[id]; return G.pais ? (D.paises[G.pais] || { rs: [] }).rs : G.deptos.flatMap(n => (D.deptos[n] || { rs: [] }).rs); }
// Centro aproximado (el promedio de la caja del anillo mayor) para poner el nombre.
function centroDe(rs) {
  let m = null, a0 = -1;
  for (const r of rs) { let a = 0; for (let i = 0, j = r.length - 1; i < r.length; j = i++) a += r[j][0] * r[i][1] - r[i][0] * r[j][1]; a = Math.abs(a); if (a > a0) { a0 = a; m = r; } }
  if (!m) return null;
  let cx = 0, cy = 0, A = 0;
  for (let i = 0, j = m.length - 1; i < m.length; j = i++) { const f = m[j][0] * m[i][1] - m[i][0] * m[j][1]; A += f; cx += (m[j][0] + m[i][0]) * f; cy += (m[j][1] + m[i][1]) * f; }
  return A ? [cx / (3 * A), cy / (3 * A)] : m[0];
}
// Azar repetible para el papel y la plumilla (no cambia al redibujar).
function semilla(n) { let s = n >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const PAPEL = new Map();
function papel(w, h, dpr) {
  const k = `${w}x${h}x${dpr}`; if (PAPEL.has(k)) return PAPEL.get(k);
  const c = document.createElement('canvas'); c.width = w * dpr; c.height = h * dpr; const g = c.getContext('2d'); g.scale(dpr, dpr);
  g.fillStyle = '#EBDDBB'; g.fillRect(0, 0, w, h);
  const R = semilla(7);
  for (let i = 0; i < 60; i++) { const x = R() * w, y = R() * h, r = 20 + R() * 90, gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${R() < .5 ? '160,120,70' : '255,248,228'},${.05 + R() * .07})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
  for (let i = 0; i < 700; i++) { g.fillStyle = `rgba(110,80,50,${.04 + R() * .08})`; g.fillRect(R() * w, R() * h, .6 + R() * 1.2, .6); } // fibras
  const v = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .35, w / 2, h / 2, Math.max(w, h) * .75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(110,70,30,.32)');
  g.fillStyle = v; g.fillRect(0, 0, w, h);
  PAPEL.set(k, c); return c;
}

// Pinta la carta. Devuelve la proyección para tocar.
function pintar(cv, S, sel, D, rel) {
  const dpr = Math.min(2.5, window.devicePixelRatio || 1), w = cv.clientWidth || 340, h = Math.round(w * (w < 520 ? 1.05 : .82));
  if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); cv.style.height = h + 'px'; }
  const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
  const [W0, E0, S0, N0] = D.caja, base = Math.max(w / (E0 - W0), h / (N0 - S0)) * 1.0, esc = base * vista.z;
  // La vista no se sale de la carta.
  const mx = w / 2 / esc, my = h / 2 / esc;
  vista.lon = Math.min(E0 - mx, Math.max(W0 + mx, vista.lon)); vista.lat = Math.min(N0 - my, Math.max(S0 + my, vista.lat));
  if (E0 - W0 < 2 * mx) vista.lon = (E0 + W0) / 2; if (N0 - S0 < 2 * my) vista.lat = (N0 + S0) / 2;
  const X = lon => (lon - vista.lon) * esc + w / 2, Y = lat => (vista.lat - lat) * esc + h / 2;
  const u = Math.min(1.8, Math.max(.75, Math.sqrt(vista.z))); // tamaño de trazos y letras según el acercamiento
  const camino = rs => { g.beginPath(); for (const r of rs) { r.forEach(([x, y], i) => i ? g.lineTo(X(x), Y(y)) : g.moveTo(X(x), Y(y))); g.closePath(); } };
  const linea = l => { g.beginPath(); l.forEach(([x, y], i) => i ? g.lineTo(X(x), Y(y)) : g.moveTo(X(x), Y(y))); };
  const halo = (fn) => { g.save(); g.shadowColor = 'rgba(245,236,212,.95)'; g.shadowBlur = 3; fn(); fn(); g.restore(); };
  // 1. Papel y mar.
  g.drawImage(papel(w, h, dpr), 0, 0, w, h);
  // 2. Mar por fuera de la tierra, con el sombreado de las costas (como en las cartas grabadas).
  const tierra = Object.values(D.paises).flatMap(p => p.rs);
  g.lineJoin = 'round'; g.lineCap = 'round';
  g.save(); g.beginPath(); g.rect(0, 0, w, h); for (const r of tierra) { r.forEach(([x, y], i) => i ? g.lineTo(X(x), Y(y)) : g.moveTo(X(x), Y(y))); g.closePath(); } g.clip('evenodd');
  g.fillStyle = 'rgba(118,160,168,.32)'; g.fillRect(0, 0, w, h);
  for (const [lw, a] of [[26, .05], [18, .06], [12, .08], [7, .1], [3, .16]]) { g.strokeStyle = `rgba(52,96,110,${a})`; g.lineWidth = lw * u; camino(tierra); g.stroke(); }
  g.restore();
  // 3. Tierra: los países de fuera, más pálidos; Colombia, crema.
  for (const [k, p] of Object.entries(D.paises)) { g.fillStyle = k === 'COL' ? 'rgba(250,242,220,.55)' : 'rgba(214,190,140,.28)'; camino(p.rs); g.fill(); }
  // 4. Polis hermanas y países con el color de la relación; el Tolima, resaltado.
  for (const id of Object.keys(GRUPOS)) {
    const E = rel(id), rs = anillosDe(D, id);
    g.fillStyle = !E ? 'rgba(150,140,125,.22)' : E.rel >= 65 ? 'rgba(110,154,88,.38)' : E.rel <= 30 ? 'rgba(176,72,52,.34)' : 'rgba(214,170,80,.36)';
    camino(rs); g.fill();
    if (!E) { // por conocer: rayado fino
      g.save(); camino(rs); g.clip(); g.strokeStyle = 'rgba(110,100,90,.22)'; g.lineWidth = .7; g.beginPath();
      for (let x = -h; x < w; x += 7) { g.moveTo(x, h); g.lineTo(x + h, 0); } g.stroke(); g.restore();
    }
  }
  const tol = (D.deptos.Tolima || { rs: [] }).rs;
  g.fillStyle = 'rgba(196,120,70,.42)'; camino(tol); g.fill();
  // 5. Cordilleras a plumilla: muchas lomas pequeñas en tres hileras, con sombra a la derecha (el sol, arriba a la izquierda).
  const R = semilla(31), tam = Math.min(10, Math.max(3.4, esc * .11)), paso = tam * .95 / esc;
  for (const sierra of SIERRAS) for (let k = 0; k < sierra.length - 1; k++) {
    const [a1, o1] = sierra[k], [a2, o2] = sierra[k + 1], L = Math.hypot(a2 - a1, o2 - o1), n = Math.max(1, Math.round(L / paso));
    for (const fila of [-1, 0, 1]) for (let i = 0; i < n; i++) {
      const t = (i + (fila === 0 ? .5 : R() * .4)) / n, d = fila * .19 + (R() - .5) * .06;
      const la = a1 + (a2 - a1) * t + d * (o2 - o1) / L, lo = o1 + (o2 - o1) * t - d * (a2 - a1) / L;
      const x = X(lo) + (R() - .5) * tam * .4, y = Y(la) + (R() - .5) * tam * .3, s = tam * (fila === 0 ? 1.05 : .8) * (.8 + R() * .4);
      if (x < -20 || y < -20 || x > w + 20 || y > h + 20) continue;
      g.fillStyle = 'rgba(246,236,212,.5)'; g.strokeStyle = 'rgba(86,62,42,.8)'; g.lineWidth = .55 * u;
      g.beginPath(); g.moveTo(x - s * .6, y); g.bezierCurveTo(x - s * .35, y - s * .5, x - s * .15, y - s * .95, x + .02 * s, y - s * .9); g.bezierCurveTo(x + s * .2, y - s * .85, x + s * .4, y - s * .4, x + s * .6, y); g.fill(); g.stroke();
      g.strokeStyle = 'rgba(86,62,42,.5)'; g.lineWidth = .45 * u; g.beginPath();
      for (let q = 0; q < 3; q++) { const f = .1 + q * .16; g.moveTo(x + s * f, y - s * (.72 - q * .2)); g.lineTo(x + s * (f + .08), y - .3); } g.stroke();
    }
  }
  // Nevados: cumbre blanca.
  g.font = `italic ${Math.round(8.5 * u)}px "IM Fell English", Georgia, serif`;
  for (const [n, la, lo] of NEVADOS) {
    const x = X(lo), y = Y(la), s = tam * 1.5; if (x < -20 || y < -20 || x > w + 20 || y > h + 20) continue;
    g.fillStyle = '#FBF8F0'; g.strokeStyle = 'rgba(70,52,38,.95)'; g.lineWidth = .8 * u;
    g.beginPath(); g.moveTo(x - s * .65, y); g.lineTo(x - s * .12, y - s * 1.1); g.lineTo(x + s * .1, y - s * .95); g.lineTo(x + s * .65, y); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = 'rgba(92,66,44,.4)'; g.beginPath(); g.moveTo(x - s * .12, y - s * 1.1); g.lineTo(x + s * .1, y - s * .95); g.lineTo(x + s * .65, y); g.lineTo(x + s * .05, y); g.closePath(); g.fill();

  }
  // 6. Ríos.
  g.strokeStyle = AGUA; g.lineCap = 'round';
  for (const [n, ls] of Object.entries(D.rios)) { g.lineWidth = (n === 'Magdalena' || n === 'Cauca' || n === 'Amazonas' || n === 'Orinoco' ? 1.5 : 1) * u; for (const l of ls) { linea(l); g.stroke(); } }
  // 7. Fronteras: departamentos punteados, países con raya y punto, Colombia más fuerte.
  g.strokeStyle = 'rgba(107,84,64,.55)'; g.lineWidth = .6 * u; g.setLineDash([1.5, 2.5]);
  for (const d of Object.values(D.deptos)) { camino(d.rs); g.stroke(); }
  g.setLineDash([6, 2.5, 1.5, 2.5]); g.strokeStyle = SEPIA; g.lineWidth = 1.1 * u;
  for (const [k, p] of Object.entries(D.paises)) if (k !== 'COL') { camino(p.rs); g.stroke(); }
  g.setLineDash([]); g.strokeStyle = 'rgba(176,86,58,.45)'; g.lineWidth = 3.2 * u; if (D.paises.COL) { camino(D.paises.COL.rs); g.stroke(); }
  g.strokeStyle = TINTA; g.lineWidth = 1.1 * u; if (D.paises.COL) { camino(D.paises.COL.rs); g.stroke(); }
  // Borde de cada polis hermana con el color de la relación; la elegida, más gruesa.
  for (const id of Object.keys(GRUPOS)) {
    const E = rel(id); if (!E && sel !== id) continue;
    g.strokeStyle = !E ? '#8A7E6E' : E.rel >= 65 ? '#4F7A3E' : E.rel <= 30 ? '#9C2F25' : '#A07A2A';
    g.lineWidth = (sel === id ? 3 : 1.4) * u; camino(anillosDe(D, id)); g.stroke();
  }
  g.strokeStyle = '#8E3B22'; g.lineWidth = 2.2 * u; camino(tol); g.stroke();
  // 8. Rejilla de grados (cada 2°) con sus números en el margen.
  g.strokeStyle = 'rgba(90,70,50,.16)'; g.lineWidth = .6; g.font = `${Math.round(8 * u)}px "IM Fell English", Georgia, serif`; g.fillStyle = 'rgba(74,54,38,.75)';
  for (let lo = Math.ceil(W0 / 2) * 2; lo <= E0; lo += 2) { const x = X(lo); if (x < 0 || x > w) continue; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); g.textAlign = 'center'; g.fillText(`${-lo}° O`, x, 9); }
  for (let la = Math.ceil(S0 / 2) * 2; la <= N0; la += 2) { const y = Y(la); if (y < 12 || y > h) continue; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); g.textAlign = 'left'; g.fillText(la === 0 ? 'Ecuador 0°' : `${Math.abs(la)}° ${la > 0 ? 'N' : 'S'}`, 3, y - 2); }
  // 9. Nombres de ríos, mares y países.
  const rotulo = (t, x, y, tam, color, estilo = '', esp = 0, ang = 0) => {
    g.save(); g.translate(x, y); g.rotate(ang); g.font = `${estilo}${Math.round(tam)}px "IM Fell English", Georgia, serif`; g.fillStyle = color; g.textAlign = 'center';
    if (esp) { const ch = [...t], an = ch.map(c => g.measureText(c).width), tot = an.reduce((a, b) => a + b, 0) + esp * (ch.length - 1); let px = -tot / 2; ch.forEach((c, i) => { g.textAlign = 'left'; g.fillText(c, px, 0); px += an[i] + esp; }); }
    else g.fillText(t, 0, 0);
    g.restore();
  };
  for (const [n, ls] of Object.entries(D.rios)) {
    if (!RIOS_NOMBRE[n]) continue; const l = ls.reduce((a, b) => b.length > a.length ? b : a, []); if (l.length < 4) continue;
    const i = Math.floor(l.length * (n === 'Magdalena' ? .62 : .5)), [x1, y1] = l[i], [x2, y2] = l[Math.min(l.length - 1, i + 2)];
    let ang = Math.atan2(Y(y2) - Y(y1), X(x2) - X(x1)); if (ang > Math.PI / 2) ang -= Math.PI; if (ang < -Math.PI / 2) ang += Math.PI;
    const x = X(x1), y = Y(y1); if (x < 10 || y < 10 || x > w - 10 || y > h - 10) continue;
    if (vista.z < 1.6 && !['Magdalena', 'Cauca', 'Orinoco', 'Amazonas'].includes(n)) continue;
    halo(() => rotulo(RIOS_NOMBRE[n], x + Math.sin(ang) * -6, y - Math.cos(ang) * 6, 9 * u, '#2F6178', 'italic ', 0, ang));
  }
  rotulo('MAR CARIBE', X(-77.5), Y(12.2), 13 * u, 'rgba(47,97,120,.85)', 'italic ', 4 * u);
  rotulo('OCÉANO', X(-81.4), Y(4.6), 12 * u, 'rgba(47,97,120,.85)', 'italic ', 3 * u, -Math.PI / 2.4);
  rotulo('PACÍFICO', X(-80.4), Y(3.4), 12 * u, 'rgba(47,97,120,.85)', 'italic ', 3 * u, -Math.PI / 2.4);
  for (const [t, la, lo] of Object.values(NOMBRES_PAIS)) rotulo(t, X(lo), Y(la), 11 * u, 'rgba(74,54,38,.7)', '', 3 * u);
  // 10. Tratados: líneas punteadas de Ibagué a cada capital.
  const ib = [X(IBAGUE[2]), Y(IBAGUE[1])];
  for (const id of Object.keys(GRUPOS)) {
    const E = rel(id); if (!E || !E.trato) continue; const c = GRUPOS[id].capital;
    g.strokeStyle = E.trato === 'liga' ? '#9C7A20' : '#7A5A3A'; g.lineWidth = (E.trato === 'liga' ? 2 : 1.3) * u; g.setLineDash([5, 4]);
    g.beginPath(); g.moveTo(...ib); g.quadraticCurveTo((ib[0] + X(c[2])) / 2, (ib[1] + Y(c[1])) / 2 - 18, X(c[2]), Y(c[1])); g.stroke(); g.setLineDash([]);
  }
  // 11. Nombres de las polis y sus capitales.
  for (const id of Object.keys(GRUPOS)) {
    const G = GRUPOS[id], E = rel(id), c = G.capital, x = X(c[2]), y = Y(c[1]);
    g.fillStyle = '#FBF5E6'; g.strokeStyle = TINTA; g.lineWidth = 1.1 * u; g.beginPath(); g.arc(x, y, 3.4 * u, 0, 7); g.fill(); g.stroke();
    g.fillStyle = TINTA; g.beginPath(); g.arc(x, y, 1.3 * u, 0, 7); g.fill();
    if (!G.pais && vista.z >= 1.8) { const ce = centroDe(anillosDe(D, id)); if (ce) { const nom = { antioquia: 'ANTIOQUIA', santafe: 'SANTAFÉ', huila: 'HUILA', quindio: 'QUINDÍO', valle: 'VALLE' }[id]; const dx = id === 'quindio' ? -30 : id === 'santafe' ? 22 : 0, dy = id === 'huila' ? 12 : id === 'quindio' ? -26 : id === 'santafe' ? 22 : -8; halo(() => rotulo(nom, X(ce[0]) + dx * u, Y(ce[1]) + dy * u, 10.5 * u, E ? '#3A2A20' : '#7E7262', '', 2 * u)); } }
  }
  // Los nombres de las capitales con halo (después de los círculos para que se lean).
  for (const id of Object.keys(GRUPOS)) { const c = GRUPOS[id].capital, x = X(c[2]), y = Y(c[1]), izq = id === 'quindio' || id === 'valle' || id === 'panama' || id === 'venezuela'; halo(() => { g.font = `italic ${Math.round(9.5 * u)}px "IM Fell English", Georgia, serif`; g.fillStyle = TINTA; g.textAlign = izq ? 'right' : 'left'; g.fillText(c[0], x + (izq ? -6 : 6) * u, y + 3.5 * u); }); }
  // Tus vecinos de frontera (al acercarse) y tu polis.
  if (vista.z >= 1.8 && S.vecinos) for (const [id, [la, lo]] of Object.entries(PUEBLOS)) {
    const v = S.vecinos[id], V = C.VECINOS && C.VECINOS.vecinos[id] && C.VECINOS.vecinos[id].nombre; if (!v) continue;
    const x = X(lo), y = Y(la); g.fillStyle = v.rel >= 65 ? '#4F7A3E' : v.rel <= 30 ? '#9C2F25' : '#A07A2A'; g.strokeStyle = '#FBF5E6'; g.lineWidth = 1;
    g.beginPath(); g.rect(x - 2.6 * u, y - 2.6 * u, 5.2 * u, 5.2 * u); g.fill(); g.stroke();
    halo(() => { g.font = `${Math.round(8.5 * u)}px "IM Fell English", Georgia, serif`; g.fillStyle = TINTA; g.textAlign = 'left'; g.fillText(V || id, x + 5 * u, y + 3 * u); });
  }
  g.fillStyle = '#B0402A'; g.strokeStyle = '#FBF5E6'; g.lineWidth = 1.6; g.beginPath();
  for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = (k % 2 ? 3.4 : 8) * u; g.lineTo(ib[0] + Math.cos(a) * rr, ib[1] + Math.sin(a) * rr); }
  g.closePath(); g.stroke(); g.fill();
  halo(() => { g.font = `${Math.round(11 * u)}px "IM Fell English SC", Georgia, serif`; g.fillStyle = '#6E2A18'; g.textAlign = 'left'; if (vista.z >= 1.8) g.fillText('Ibagué', ib[0] + 9 * u, ib[1] - 2 * u); else { g.textAlign = 'center'; g.fillText('Ibagué', ib[0], ib[1] + 17 * u); } });
  const ct = centroDe(tol); if (ct && vista.z >= 1.8) halo(() => rotulo('POLIS DEL TOLIMA', X(ct[0]) + 4 * u, Y(ct[1]) + 16 * u, 10.5 * u, '#6E2A18', '', 1.5 * u));
  // 12. Rosa de los vientos, escala y cartela (fijas en la pantalla).
  rosa(g, w - 34 * Math.min(1.2, w / 420) - 6, 40 * Math.min(1.2, w / 420), 26 * Math.min(1.2, w / 420));
  escala(g, esc, 12, h - 14);
  cartela(g, w, h, S);
  // Marco doble.
  g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(1, 1, w - 2, h - 2); g.lineWidth = .7; g.strokeRect(5, 5, w - 10, h - 10);
  return { X, Y, esc, w, h, inv: (px, py) => [(px - w / 2) / esc + vista.lon, vista.lat - (py - h / 2) / esc] };
}
function rosa(g, x, y, r) {
  g.save(); g.translate(x, y);
  g.strokeStyle = 'rgba(74,54,38,.8)'; g.lineWidth = .7; g.beginPath(); g.arc(0, 0, r * .72, 0, 7); g.stroke(); g.beginPath(); g.arc(0, 0, r * .66, 0, 7); g.stroke();
  for (let k = 0; k < 8; k++) {
    const a = k * Math.PI / 4, L = k % 2 ? r * .62 : r, b = r * .13;
    g.save(); g.rotate(a);
    g.fillStyle = k % 2 ? '#C9B48A' : '#4A3626'; g.beginPath(); g.moveTo(0, -L); g.lineTo(b, 0); g.lineTo(0, 0); g.closePath(); g.fill();
    g.fillStyle = k % 2 ? '#EFE3C4' : '#B0402A'; g.beginPath(); g.moveTo(0, -L); g.lineTo(-b, 0); g.lineTo(0, 0); g.closePath(); g.fill();
    g.restore();
  }
  g.font = `${Math.round(r * .42)}px "IM Fell English SC", Georgia, serif`; g.fillStyle = '#4A3626'; g.textAlign = 'center'; g.fillText('N', 0, -r - 3);
  g.restore();
}
function escala(g, esc, x, y) {
  const legua = 5 / 111, n = esc * legua * 25 > 140 ? 10 : esc * legua * 50 > 140 ? 25 : 50, L = esc * legua * n;
  g.save(); g.fillStyle = 'rgba(245,236,212,.85)'; g.fillRect(x - 4, y - 16, L + 46, 22);
  for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? '#F4EAD0' : '#4A3626'; g.fillRect(x + L / 4 * i, y - 4, L / 4, 4); }
  g.strokeStyle = '#4A3626'; g.lineWidth = .8; g.strokeRect(x, y - 4, L, 4);
  g.font = '9px "IM Fell English", Georgia, serif'; g.fillStyle = '#4A3626'; g.textAlign = 'left'; g.fillText('0', x - 2, y - 7); g.fillText(`${n} leguas`, x + L - 6, y - 7);
  g.restore();
}
function cartela(g, w, h, S) {
  const bw = Math.min(190, w * .44), bh = 50, x = 12, y = h - bh - 30;
  g.save(); g.fillStyle = 'rgba(246,238,216,.94)'; g.strokeStyle = '#4A3626'; g.lineWidth = 1.4; g.fillRect(x, y, bw, bh); g.strokeRect(x, y, bw, bh);
  g.lineWidth = .6; g.strokeRect(x + 3, y + 3, bw - 6, bh - 6);
  // Guarda de rombos escalonados (cerámica pijao) arriba y abajo.
  g.fillStyle = '#8E3B22'; for (let i = x + 8; i < x + bw - 8; i += 8) for (const yy of [y + 6, y + bh - 6]) { g.beginPath(); g.moveTo(i, yy - 2); g.lineTo(i + 2, yy); g.lineTo(i, yy + 2); g.lineTo(i - 2, yy); g.closePath(); g.fill(); }
  g.textAlign = 'center'; g.fillStyle = '#3A2A20';
  g.font = `${Math.round(Math.min(12, bw / 15))}px "IM Fell English SC", Georgia, serif`; g.fillText('Carta de la Polis del Tolima', x + bw / 2, y + 22);
  g.font = `italic ${Math.round(Math.min(10, bw / 19))}px "IM Fell English", Georgia, serif`; g.fillText(`y de sus polis hermanas · año ${S.year}`, x + bw / 2, y + 36);
  g.restore();
}

// Monta la carta en el lienzo: la pinta y atiende toques, arrastre, rueda y pellizco. alElegir(id) al tocar un territorio.
export function montarCarta(cv, S, sel, alElegir) {
  let P = null;
  const dibujar = () => { if (DATOS) P = pintar(cv, S, sel, DATOS, id => relacionExterior(S, id)); };
  cargar().then(dibujar).catch(() => { const g = cv.getContext('2d'); g.fillStyle = '#4A3626'; g.fillText('No se pudo abrir la carta.', 12, 20); });
  const toques = new Map(); let inicio = null, movio = false, dist0 = 0, z0 = 1;
  cv.onpointerdown = e => { cv.setPointerCapture(e.pointerId); toques.set(e.pointerId, [e.clientX, e.clientY]); movio = false; inicio = { x: e.clientX, y: e.clientY, lon: vista.lon, lat: vista.lat };
    if (toques.size === 2) { const [a, b] = [...toques.values()]; dist0 = Math.hypot(a[0] - b[0], a[1] - b[1]); z0 = vista.z; } };
  cv.onpointermove = e => {
    if (!toques.has(e.pointerId) || !P) return; toques.set(e.pointerId, [e.clientX, e.clientY]);
    if (toques.size === 2) { const [a, b] = [...toques.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (dist0 > 0) { vista.z = Math.min(6, Math.max(1, z0 * d / dist0)); movio = true; dibujar(); } return; }
    const dx = e.clientX - inicio.x, dy = e.clientY - inicio.y; if (Math.hypot(dx, dy) > 5) movio = true;
    if (movio && vista.z > 1) { vista.lon = inicio.lon - dx / P.esc; vista.lat = inicio.lat + dy / P.esc; dibujar(); }
  };
  cv.onpointerup = e => {
    toques.delete(e.pointerId); if (toques.size || movio || !P || !DATOS) return;
    const b = cv.getBoundingClientRect(), [lon, lat] = P.inv(e.clientX - b.left, e.clientY - b.top);
    const id = Object.keys(GRUPOS).find(k => anillosDe(DATOS, k).some(r => dentro(r, lon, lat)));
    if (id) alElegir(id);
  };
  cv.onpointercancel = e => toques.delete(e.pointerId);
  cv.onwheel = e => { if (!P) return; e.preventDefault(); const b = cv.getBoundingClientRect(), [lon, lat] = P.inv(e.clientX - b.left, e.clientY - b.top), z = Math.min(6, Math.max(1, vista.z * (e.deltaY < 0 ? 1.2 : 1 / 1.2))), f = vista.z / z;
    vista.lon = lon + (vista.lon - lon) * f; vista.lat = lat + (vista.lat - lat) * f; vista.z = z; dibujar(); };
  return {
    acercar: f => { vista.z = Math.min(6, Math.max(1, vista.z * f)); dibujar(); },
    tolima: () => { vista = { lon: -75.1, lat: 4.3, z: 3.2 }; dibujar(); },
    todo: () => { vista = { ...DEFECTO }; dibujar(); }
  };
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
    ${C.ENTRE && C.ENTRE.diplomaticos[id] ? `<p class="small">${C.ENTRE.diplomaticos[id].icono} <b>${C.ENTRE.textos.diplomatico}:</b> ${C.ENTRE.diplomaticos[id].nombre}, ${C.ENTRE.diplomaticos[id].rol}.</p>` : ''}
    <p class="small">📜 <b>${T.ofrece}:</b> ${efectosEnPalabras(L.ofrece)}. 🤝 <b>${T.conLiga}:</b> además ${efectosEnPalabras(L.liga)}.${aut ? ` <span class="neg">${T.autoritario.replace('{reg}', nombreRegimen(E.reg)).replace('{n}', 3)}</span>` : ''}</p>
    ${acciones}`;
}
export { accionExterior, exteriorActivo };
