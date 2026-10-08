// Imágenes solemnes de las cartas (fase 16, punto 4): grabado del siglo XIX, tinta sepia sobre papel viejo, tonos apagados y
// un solo elemento principal (camino vacío, cruz, vela, maleta…). Se hornean una vez por clave.
import { lienzo } from './acuarela.js';

const TINTA = '#3b2c1d', PAPEL = '#e6d8b8', W = 320, H = 136;
// Cada carta (por su `escena`) usa un emblema; lo que no está aquí usa el camino vacío.
const EMBLEMA = { tierras: 'azadon', migra: 'maleta', maestros: 'libro', huelga: 'chimenea', protesta: 'pancarta', precios: 'balanza', semillas: 'saco', sal: 'saco',
  elite: 'casona', festival: 'tiple', pet: 'carta', corrup: 'balanza', default: 'camino', cafe: 'saco', calle: 'silueta', salud: 'vela', guerra: 'cruz', luto: 'cruz', velorio: 'vela', soldado: 'silueta' };
export const EMBLEMAS = ['camino', 'cruz', 'vela', 'silueta', 'azadon', 'maleta', 'libro', 'chimenea', 'pancarta', 'balanza', 'saco', 'casona', 'tiple', 'carta'];

// Sombreado de rayas finas dentro de una figura (como el buril): se recorta con la figura y se rellenan líneas diagonales.
function rayas(g, trazo, sep = 3, ang = -.8, a = .55) {
  g.save(); g.beginPath(); trazo(g); g.clip(); g.strokeStyle = TINTA; g.globalAlpha = a; g.lineWidth = .7;
  g.beginPath(); for (let k = -H; k < W + H; k += sep) { g.moveTo(k, 0); g.lineTo(k + Math.tan(ang) * -H, H); } g.stroke(); g.restore();
}
function figura(g, trazo, relleno = 0.55, sep = 3) {
  g.beginPath(); trazo(g); g.fillStyle = PAPEL; g.fill(); rayas(g, trazo, sep, -.8, relleno);
  g.beginPath(); trazo(g); g.strokeStyle = TINTA; g.lineWidth = 1.3; g.lineJoin = 'round'; g.stroke();
}
function suelo(g, y) { // horizonte con rayas horizontales que se abren
  g.strokeStyle = TINTA; g.lineWidth = .8;
  for (let k = 0; k < 14; k++) { const yy = y + k * k * .22 + k * 1.2; if (yy > H - 8) break; g.globalAlpha = .65 - k * .035; g.beginPath(); g.moveTo(40 + k * 1.5, yy); g.lineTo(W - 40 - k * 1.5, yy); g.stroke(); }
  g.globalAlpha = 1; g.lineWidth = 1.2; g.beginPath(); g.moveTo(24, y); g.lineTo(W - 24, y); g.stroke();
}
function lomas(g) { // cordillera lejana
  g.beginPath(); g.moveTo(24, 78); [[70, 58], [110, 70], [165, 46], [215, 66], [265, 54], [296, 78]].forEach(p => g.lineTo(p[0], p[1])); g.lineTo(296, 78); g.strokeStyle = TINTA; g.lineWidth = 1; g.globalAlpha = .55; g.stroke(); g.globalAlpha = 1;
}
const DIB = {
  camino(g) { lomas(g); suelo(g, 80);
    figura(g, g => { g.moveTo(150, 80); g.lineTo(170, 80); g.lineTo(250, H - 8); g.lineTo(70, H - 8); g.closePath(); }, .22, 4);
    for (let k = 0; k < 5; k++) { const t = k / 5, x = 150 - 80 * (1 - t) * (1 + t) - 8, y = 80 + (H - 88) * t * t; figura(g, g => { g.rect(x - 2, y - 10 * (1 + t), 3 + 2 * t, 10 * (1 + t)); }, .6, 2); } },
  cruz(g) { lomas(g); suelo(g, 92);
    figura(g, g => { g.moveTo(80, 92); g.quadraticCurveTo(160, 62, 240, 92); g.closePath(); }, .35, 3);
    figura(g, g => { g.rect(157, 40, 6, 52); g.rect(142, 54, 36, 6); }, .6, 2); },
  vela(g) { suelo(g, 104);
    figura(g, g => { g.rect(150, 66, 20, 38); }, .3, 3); figura(g, g => { g.ellipse(160, 104, 26, 5, 0, 0, 7); }, .7, 2);
    g.beginPath(); g.moveTo(160, 66); g.lineTo(160, 58); g.strokeStyle = TINTA; g.lineWidth = 1.4; g.stroke();
    figura(g, g => { g.moveTo(160, 28); g.quadraticCurveTo(170, 46, 160, 57); g.quadraticCurveTo(150, 46, 160, 28); }, .8, 2); },
  silueta(g) { lomas(g); suelo(g, 84);
    figura(g, g => { g.moveTo(150, 84); g.lineTo(170, 84); g.lineTo(220, H - 8); g.lineTo(100, H - 8); g.closePath(); }, .18, 4);
    figura(g, g => { g.ellipse(160, 52, 7, 8, 0, 0, 7); g.moveTo(140, 46); g.lineTo(180, 46); g.moveTo(150, 60); g.lineTo(146, 100); g.lineTo(174, 100); g.lineTo(170, 60); g.closePath(); }, .9, 2); },
  azadon(g) { suelo(g, 100);
    figura(g, g => { g.moveTo(60, 100); g.quadraticCurveTo(110, 80, 160, 100); g.closePath(); }, .5, 3);
    g.save(); g.translate(190, 100); g.rotate(-.35); figura(g, g => { g.rect(-3, -64, 6, 64); }, .5, 2); figura(g, g => { g.moveTo(-3, -64); g.lineTo(22, -66); g.lineTo(22, -52); g.lineTo(-3, -56); g.closePath(); }, .85, 2); g.restore(); },
  maleta(g) { lomas(g); suelo(g, 96);
    figura(g, g => { g.rect(126, 62, 68, 40); }, .4, 3); figura(g, g => { g.rect(148, 50, 24, 12); }, .1, 3);
    g.strokeStyle = TINTA; g.lineWidth = 1.3; g.beginPath(); g.moveTo(126, 80); g.lineTo(194, 80); g.moveTo(160, 62); g.lineTo(160, 102); g.stroke(); },
  libro(g) { suelo(g, 104);
    figura(g, g => { g.moveTo(160, 62); g.quadraticCurveTo(130, 54, 96, 62); g.lineTo(96, 100); g.quadraticCurveTo(130, 92, 160, 100); g.closePath(); }, .15, 3);
    figura(g, g => { g.moveTo(160, 62); g.quadraticCurveTo(190, 54, 224, 62); g.lineTo(224, 100); g.quadraticCurveTo(190, 92, 160, 100); g.closePath(); }, .3, 3);
    g.strokeStyle = TINTA; g.lineWidth = .7; for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(106, 68 + k * 5.5); g.lineTo(150, 69 + k * 5.5); g.stroke(); } },
  chimenea(g) { lomas(g); suelo(g, 100);
    figura(g, g => { g.rect(112, 66, 96, 34); }, .35, 3); figura(g, g => { g.rect(148, 28, 14, 38); }, .6, 2);
    g.strokeStyle = TINTA; g.lineWidth = 1; g.globalAlpha = .6; for (let k = 0; k < 4; k++) { g.beginPath(); g.ellipse(160 + k * 10, 20 - k * 6, 8 + k * 4, 5 + k * 2, 0, 0, 7); g.stroke(); } g.globalAlpha = 1; },
  pancarta(g) { suelo(g, 106);
    figura(g, g => { g.rect(157, 40, 5, 66); }, .6, 2); figura(g, g => { g.rect(118, 30, 84, 36); }, .12, 3);
    g.strokeStyle = TINTA; g.lineWidth = 1.2; [40, 48, 56].forEach((y, k) => { g.beginPath(); g.moveTo(128, y); g.lineTo(192 - k * 12, y); g.stroke(); }); },
  balanza(g) { suelo(g, 106);
    figura(g, g => { g.rect(157, 36, 6, 70); }, .6, 2); figura(g, g => { g.rect(138, 102, 44, 6); }, .7, 2);
    g.strokeStyle = TINTA; g.lineWidth = 1.5; g.beginPath(); g.moveTo(106, 44); g.lineTo(214, 52); g.stroke(); g.lineWidth = .8;
    [[110, 45], [210, 51]].forEach(([x, y]) => { g.beginPath(); g.moveTo(x, y); g.lineTo(x - 14, y + 30); g.moveTo(x, y); g.lineTo(x + 14, y + 30); g.stroke(); });
    figura(g, g => { g.ellipse(110, 78, 16, 4, 0, 0, 7); }, .6, 2); figura(g, g => { g.ellipse(210, 84, 16, 4, 0, 0, 7); }, .6, 2); },
  saco(g) { suelo(g, 104);
    figura(g, g => { g.moveTo(130, 104); g.quadraticCurveTo(116, 74, 138, 54); g.lineTo(182, 54); g.quadraticCurveTo(204, 74, 190, 104); g.closePath(); }, .4, 3);
    figura(g, g => { g.moveTo(138, 54); g.lineTo(144, 44); g.lineTo(176, 44); g.lineTo(182, 54); g.closePath(); }, .15, 3);
    g.strokeStyle = TINTA; g.lineWidth = 1.2; g.beginPath(); g.moveTo(140, 56); g.lineTo(180, 56); g.stroke(); },
  casona(g) { lomas(g); suelo(g, 100);
    figura(g, g => { g.rect(100, 62, 120, 38); }, .22, 3); figura(g, g => { g.moveTo(92, 62); g.lineTo(160, 38); g.lineTo(228, 62); g.closePath(); }, .6, 2);
    figura(g, g => { g.rect(150, 76, 20, 24); }, .85, 2); [[114, 72], [196, 72]].forEach(([x, y]) => figura(g, g => { g.rect(x, y, 14, 14); }, .8, 2)); },
  tiple(g) { suelo(g, 108);
    g.save(); g.translate(160, 66); g.rotate(-.5); figura(g, g => { g.ellipse(0, 6, 18, 24, 0, 0, 7); }, .45, 3); figura(g, g => { g.rect(-3, -50, 6, 30); }, .7, 2); figura(g, g => { g.ellipse(0, 6, 5, 5, 0, 0, 7); }, .95, 2); g.restore(); },
  carta(g) { suelo(g, 108);
    figura(g, g => { g.rect(112, 52, 96, 54); }, .12, 3); g.strokeStyle = TINTA; g.lineWidth = 1.2; g.beginPath(); g.moveTo(112, 52); g.lineTo(160, 86); g.lineTo(208, 52); g.stroke();
    figura(g, g => { g.ellipse(160, 90, 7, 7, 0, 0, 7); }, .9, 2); }
};

const CACHE = {};
export function grabado(escena) {
  const clave = DIB[escena] ? escena : (EMBLEMA[escena] || 'camino');
  if (CACHE[clave]) return CACHE[clave];
  const c = lienzo(W * 2, H * 2), g = c.getContext('2d'); g.scale(2, 2);
  const f = g.createRadialGradient(W / 2, H / 2, 20, W / 2, H / 2, 190); f.addColorStop(0, '#efe3c6'); f.addColorStop(1, '#d6c39a');
  g.fillStyle = f; g.fillRect(0, 0, W, H);
  g.strokeStyle = TINTA; g.lineWidth = 1.6; g.strokeRect(10, 8, W - 20, H - 16); g.lineWidth = .6; g.strokeRect(14, 12, W - 28, H - 24); // doble filete
  g.save(); g.beginPath(); g.rect(15, 13, W - 30, H - 26); g.clip(); DIB[clave](g); g.restore();
  return (CACHE[clave] = c.toDataURL('image/png'));
}
