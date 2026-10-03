// Viñetas de los dilemas y sus consecuencias: una escena pequeña con los mismos edificios, pobladores y colores del
// mapa. La composición de cada una viene de la versión 9; fase 8: pintadas al fresco (muro, pigmentos, gente nueva).
import { mulberry, mix, wash, blob, papel, lienzo } from './acuarela.js';
import { hornearEdificios, figurasDeObra } from './edificios.js';
import { hornearNaturaleza } from './naturaleza.js';
import { hornearGente } from './gente.js';
import { hornearFlora } from './flora.js';
import { FR, pintar, texturaYeso } from './fresco.js';
import { TW, TH } from './iso.js';

// g: terreno de las 6 casillas (L llano, R río, M montaña); b: obras por casilla; fx: efectos.
const ESCENAS = {
  crecida: { g: 'LRLLRL', b: { 0: 'casa', 3: 'casa' }, fx: ['flood', 'rain'] }, festival: { b: { 1: 'mercado', 5: 'casa' }, fx: ['flags', 'crowd'] },
  sal: { b: { 1: 'mercado' }, fx: ['coins'] }, sequia: { b: { 0: 'cultivo', 1: 'cultivo', 4: 'cultivo' }, fx: ['dry', 'sun'] },
  migra: { b: { 2: 'casa' }, fx: ['walk'] }, donante: { b: { 1: 'banco' }, fx: ['coins'] }, plaga: { b: { 0: 'cultivo', 1: 'cultivo', 4: 'cultivo' }, fx: ['bugs'] },
  evasion: { b: { 1: 'casa', 2: 'cultivo' }, fx: ['scroll'] }, tierras: { b: { 0: 'cultivo', 1: 'cultivo', 5: 'casa' }, fx: ['crowd'] },
  maestros: { b: { 1: 'escuela' }, fx: ['crowd'] }, huelga: { b: { 1: 'taller' }, fx: ['crowd', 'smoke'] }, humo: { g: 'LLLRRR', b: { 1: 'taller' }, fx: ['smoke', 'poison'] },
  corrup: { b: { 1: 'banco' }, fx: ['shadow'] }, epidemia: { b: { 1: 'hospital', 3: 'casa' }, fx: ['crowd'] }, elite: { b: { 1: 'banco' }, fx: ['walk', 'coins'] },
  precios: { b: { 1: 'mercado' }, fx: ['arrow'] }, oro: { g: 'MMLLLL', b: { 1: 'mina' }, fx: ['coins'] }, protesta: { b: { 1: 'agora' }, fx: ['crowd'] },
  mov_sindicato: { b: { 1: 'taller' }, fx: ['crowd', 'smoke'] }, mov_estudiantes: { b: { 1: 'escuela' }, fx: ['crowd'] }, mov_campesinos: { b: { 0: 'cultivo', 1: 'cultivo', 5: 'casa' }, fx: ['crowd'] }, mov_ambientalistas: { g: 'MMLLLL', b: { 1: 'mina' }, fx: ['crowd'] },
  prestamo: { b: { 1: 'banco' }, fx: ['scroll', 'coins'] }, alianza: { g: 'LRLLRL', b: { 0: 'mercado', 2: 'mercado' }, fx: ['bridge'] },
  progresivo: { b: { 1: 'agora' }, fx: ['scroll', 'coins'] }, pet: { b: { 1: 'agora' }, fx: ['crowd', 'scroll'] },
  especulacion: { b: { 1: 'mercado' }, fx: ['dry', 'coins', 'arrow'] }, culpar: { b: { 1: 'agora' }, fx: ['crowd', 'scroll'] },
  ayuda: { b: { 1: 'banco' }, fx: ['scroll', 'coins'] }, reubicar: { g: 'LRLLRL', b: { 0: 'casa', 3: 'casa' }, fx: ['flood', 'walk'] },
  semillas: { b: { 0: 'cultivo', 1: 'cultivo', 4: 'cultivo' }, fx: ['dry', 'sun'] }, aguaabajo: { g: 'LRLLRL', b: { 0: 'cultivo', 2: 'casa' }, fx: ['dry', 'sun'] },
  default: { b: { 1: 'casa' }, fx: [] }
};
const ALIAS = {
  crecida_mal: 'crecida', diques: 'alianza', evasion2: 'evasion', evasion_venganza: 'evasion', migra_bien: 'migra', migra_mal: 'migra', oro_mal: 'humo',
  corrup_mal: 'corrup', corrup_bien: 'corrup', corrup_filtra: 'corrup', maestros_bien: 'maestros', humo_mal: 'humo', sal_mal: 'precios', protesta_mal: 'protesta',
  cosecha: 'semillas', viajeros: 'sal', minga: 'tierras', sanpedro: 'festival', paisano: 'donante', inventora: 'huelga', voluntarios: 'maestros', cafepremio: 'semillas', retorno: 'migra', premio: 'progresivo', invento_exito: 'huelga',
  soborno_escandalo: 'corrup', epidemia_mal: 'epidemia', donante_mal: 'donante', especulacion_mal: 'especulacion', culpar_mal: 'culpar', ayuda_condiciones: 'ayuda', tierras_mal: 'tierras', huelga_mal: 'huelga', reforma_fuga: 'elite', alianza_rota: 'alianza'
};

function figura(g, H, k, x, y, s = 1, voltear = false) {
  const m = H.marcos[k]; if (!m) return;
  g.save(); g.translate(x, y); if (voltear) g.scale(-1, 1);
  g.drawImage(H.canvas, m.x, m.y, m.w, m.h, -m.ax / H.escala * s, -m.ay / H.escala * s, m.w / H.escala * s, m.h / H.escala * s);
  g.restore();
}
function rombo(cx, cy, s) { return [[cx, cy - TH / 2 * s], [cx + TW / 2 * s, cy], [cx, cy + TH / 2 * s], [cx - TW / 2 * s, cy]]; }

const CACHE = {};
export function vineta(id, reg = 'republica', etapa = 1) {
  const clave = id + reg + (etapa >= 2 ? 2 : 0);
  if (CACHE[clave]) return CACHE[clave];
  const sc = ESCENAS[id] || ESCENAS[ALIAS[id]] || ESCENAS.default, fx = sc.fx || [], W = 320, H = 136;
  const c = lienzo(W * 2, H * 2), g = c.getContext('2d'); g.scale(2, 2);
  const R = mulberry(id.length * 977 + id.charCodeAt(0)), E = hornearEdificios(), NAT = hornearNaturaleza(fx.includes('dry') ? 1 : 0), PER = hornearGente(), FL = hornearFlora(fx.includes('dry') ? 1 : 0);
  const seco = fx.includes('dry');
  // Fondo al fresco: cielo de muro claro, cordillera y lomas en pigmentos planos con contorno siena.
  g.fillStyle = seco ? mix(FR.ocreClaro, FR.yeso, .5) : mix('#B9CFD2', FR.yeso, .45); g.fillRect(0, 0, W, H);
  pintar(g, [[0, 62], [50, 36], [110, 50], [170, 26], [230, 48], [280, 34], [320, 46], [320, 84], [0, 84]], mix('#9FB0A6', FR.yeso, .25), R, { n: 4, bal: .45 });
  pintar(g, [[0, 70], [70, 54], [150, 64], [240, 52], [320, 62], [320, 90], [0, 90]], mix(FR.tierraVerde, seco ? FR.ocre : FR.ocreClaro, seco ? .5 : .2), R, { n: 4, bal: .45 });
  const tipos = (sc.g || 'LLLLLL').split(''), pos = [];
  for (let r = 0; r < 2; r++) for (let k = 0; k < 3; k++) pos.push([W / 2 + ((k - 1) - (r - .5)) * TW / 2 * 1.15, 86 + ((k - 1) + (r - .5)) * TH / 2 * 1.15]);
  pos.forEach(([x, y], n) => {
    const t = tipos[n];
    let col = t === 'R' ? '#7DB0C6' : t === 'M' ? '#9A938A' : mix('#B8C67E', '#D5B878', seco ? .9 : 0);
    if (t === 'R' && fx.includes('poison')) col = '#7C8A5A';
    pintar(g, rombo(x, y, 1.15), col === '#7DB0C6' ? FR.agua : t === 'M' ? col : mix(FR.tierraVerde, FR.ocre, seco ? .7 : .15), R, { n: 3, bal: .4, bw: .5 });
  });
  if (fx.includes('flood')) pos.forEach(([x, y], n) => { if (tipos[n] !== 'R') wash(g, rombo(x, y, .95), '#7DB0C6', R, .4, 0); });
  if (fx.includes('bridge')) [1, 4].forEach(n => { const [x, y] = pos[n]; wash(g, [[x - 16, y - 2], [x + 16, y + 6], [x + 12, y + 9], [x - 20, y + 1]], '#9B7650', R, .95, .3); });
  // Montañas, obras y plantas, de atrás hacia adelante.
  const orden = [0, 1, 3, 2, 4, 5];
  for (const n of orden) {
    const [x, y] = pos[n], t = tipos[n], k = sc.b[n];
    if (t === 'M') { const L = [x - TW * .575, y], Rr = [x + TW * .575, y], F = [x, y + TH * .575], P = [x, y - 42]; wash(g, [L, F, P], '#B3A995', R, .9, 1); wash(g, [F, Rr, P], '#8E8574', R, .9, 1); wash(g, [P, [P[0] - 10, P[1] + 13], [P[0], P[1] + 17], [P[0] + 10, P[1] + 13]], '#FBFBF7', R, .9, .5); }
    if (k === 'cultivo') { for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) blob(g, x + (a - b) * 7.5, y + (a + b - 3) * 3.8, 3, 2.3, mix('#4F8A43', '#C9A94A', seco ? .8 : 0), R, .9); figura(g, FL, 'platano', x + 12, y - 4, 1); }
    else if (k) for (const f of figurasDeObra(k, n * 7 + 1, etapa, reg)) figura(g, f.n ? NAT : E, f.k, x + ((f.du || 0) - (f.dv || 0)) * TW / 2, y + ((f.du || 0) + (f.dv || 0)) * TH / 2 - (f.z || 0), (f.s || 1) * 1.1);
    else if (t === 'L' && R() < .6) figura(g, FL, R() < .5 ? 'arbol' : 'saman', x + (R() - .5) * 20, y + 4, 1.1);
  }
  const main = pos[1], gente = (n, x0, y0, dx, dy, alterna) => {
    const tipos = ['campesino', 'campesina', 'artesano', 'elite', 'nino'];
    for (let k = 0; k < n; k++) figura(g, PER, `${tipos[k % 5]}_${k % 3}_1_${alterna ? k % 4 : 0}`, x0 + dx(k), y0 + dy(k), .8, k % 2 === 1);
  };
  for (const f of fx) {
    if (f === 'crowd') gente(12, main[0] + 16, main[1] + 22, k => (k % 6) * 9 - 22, k => Math.floor(k / 6) * 7);
    if (f === 'walk') gente(6, 40, 112, k => k * 18, k => -k * 3, true);
    if (f === 'flags') { const a = [main[0] - 50, main[1] - 20], b = [main[0] + 60, main[1] - 12]; g.strokeStyle = '#6B4F3A'; g.lineWidth = .6; g.beginPath(); g.moveTo(...a); g.quadraticCurveTo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 8, ...b); g.stroke(); const cols = ['#C0602A', '#E7C76B', '#2D6E5E', '#C4513B', '#F4ECDB']; for (let k = 1; k < 12; k++) { const t = k / 12, x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t + Math.sin(t * Math.PI) * 7; g.fillStyle = cols[k % 5]; g.beginPath(); g.moveTo(x - 2, y); g.lineTo(x + 2, y); g.lineTo(x, y + 4); g.fill(); } }
    if (f === 'coins') for (let k = 0; k < 4; k++) { g.fillStyle = k % 2 ? '#E2B24F' : '#C9962E'; g.beginPath(); g.ellipse(main[0] + 44, main[1] + 12 - k * 2.2, 5, 2, 0, 0, 7); g.fill(); }
    if (f === 'sun') { blob(g, 40, 24, 9, 9, '#F0C24A', R, .85); g.strokeStyle = '#E8A93A'; g.globalAlpha = .6; g.lineWidth = 1.2; for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; g.beginPath(); g.moveTo(40 + Math.cos(a) * 12, 24 + Math.sin(a) * 12); g.lineTo(40 + Math.cos(a) * 17, 24 + Math.sin(a) * 17); g.stroke(); } g.globalAlpha = 1; }
    if (f === 'rain') { g.strokeStyle = 'rgba(70,110,140,.45)'; g.lineWidth = .7; for (let k = 0; k < 80; k++) { const x = R() * W, y = R() * H; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 2, y + 6); g.stroke(); } }
    if (f === 'smoke') for (let k = 0; k < 6; k++) blob(g, main[0] + 14 + k * 3, main[1] - 40 - k * 7, 4 + k * 1.6, 4 + k * 1.6, '#8E8A86', R, .35);
    if (f === 'bugs') pos.forEach(([x, y], n) => { if (sc.b[n] === 'cultivo') { g.fillStyle = '#3A2A1A'; for (let k = 0; k < 14; k++) { g.beginPath(); g.ellipse(x + (R() - .5) * 40, y + (R() - .5) * 16, 1.3, .9, 0, 0, 7); g.fill(); } } });
    if (f === 'arrow') { const x = main[0] + 52, y = main[1] - 6; g.strokeStyle = g.fillStyle = '#B0402C'; g.lineWidth = 3; g.globalAlpha = .85; g.beginPath(); g.moveTo(x - 18, y + 14); g.lineTo(x - 6, y + 2); g.lineTo(x + 2, y + 8); g.lineTo(x + 16, y - 8); g.stroke(); g.beginPath(); g.moveTo(x + 20, y - 12); g.lineTo(x + 10, y - 9); g.lineTo(x + 17, y - 2); g.fill(); g.globalAlpha = 1; }
    if (f === 'scroll') { const x = main[0] - 48, y = main[1] + 14; wash(g, [[x - 9, y - 7], [x + 9, y - 7], [x + 9, y + 7], [x - 9, y + 7]], '#EFE3C2', R, .95, .4); g.strokeStyle = '#8B6F4A'; g.globalAlpha = .6; g.lineWidth = .6; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(x - 6, y - 4 + k * 2.6); g.lineTo(x + 6, y - 4 + k * 2.6); g.stroke(); } g.globalAlpha = 1; }
    if (f === 'shadow') { g.globalAlpha = .85; figura(g, PER, 'elite_0_0_0', main[0] + 36, main[1] + 8, .9); g.globalAlpha = 1; }
  }
  texturaYeso(g, 0, 0, W, H, .45);
  return (CACHE[clave] = c.toDataURL('image/jpeg', .86));
}
