// Retratos de las voces del pueblo (Doña Rosa, Julián, Don Aurelio), como en la versión 9.
import { mulberry, wash, blob, lienzo } from './acuarela.js';

const CACHE = {};
export function retrato(kind) {
  if (CACHE[kind]) return CACHE[kind];
  const c = lienzo(128, 128), g = c.getContext('2d'); g.scale(2, 2);
  const rng = mulberry(kind.length * 31 + 7), W = (pts, col) => wash(g, pts, col, rng, .95, 0);
  blob(g, 32, 32, 30, 30, { rosa: '#DCE7C9', julian: '#E9D9C0', aurelio: '#D9DDE6' }[kind], rng, .9);
  const skin = { rosa: '#C98E62', julian: '#E0B08A', aurelio: '#EBC7A6' }[kind];
  W([[14, 64], [16, 46], [24, 40], [40, 40], [48, 46], [50, 64]], { rosa: '#B4553A', julian: '#5A6F7E', aurelio: '#3B3A40' }[kind]);
  if (kind === 'rosa') W([[16, 48], [32, 58], [48, 48], [46, 44], [32, 52], [18, 44]], '#E7C76B');
  if (kind === 'julian') W([[24, 44], [40, 44], [42, 64], [22, 64]], '#C9B28A');
  if (kind === 'aurelio') { W([[28, 40], [36, 40], [34, 56], [30, 56]], '#F1ECE0'); g.fillStyle = '#8C1C1C'; g.fillRect(30.5, 41, 3, 7); }
  blob(g, 32, 30, 10, 10, skin, rng, .95);
  g.fillStyle = '#2A2018'; g.beginPath(); g.arc(28.5, 30, 1.1, 0, 7); g.arc(35.5, 30, 1.1, 0, 7); g.fill();
  g.strokeStyle = '#7A4A34'; g.lineWidth = 1; g.beginPath(); g.arc(32, 33.5, 3, .2, Math.PI - .2); g.stroke();
  if (kind === 'rosa') {
    g.fillStyle = '#2A2018'; g.beginPath(); g.ellipse(32, 22, 11, 5, 0, Math.PI, 0); g.fill();
    W([[18, 20], [46, 20], [42, 16], [22, 16]], '#F4F1E6'); W([[23, 16], [41, 16], [39, 10], [25, 10]], '#F4F1E6');
    g.fillStyle = '#1E1E1E'; g.fillRect(24, 14.5, 16, 2); g.strokeStyle = '#2A2018'; g.lineWidth = 2; g.beginPath(); g.moveTo(22, 28); g.quadraticCurveTo(20, 40, 24, 44); g.stroke();
  }
  if (kind === 'julian') { g.fillStyle = '#4A3A2C'; g.beginPath(); g.ellipse(32, 22, 10, 5, 0, Math.PI, 0); g.fill(); g.strokeStyle = '#4A3A2C'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(26, 36); g.quadraticCurveTo(32, 40, 38, 36); g.stroke(); }
  if (kind === 'aurelio') { W([[20, 20], [44, 20], [44, 18], [20, 18]], '#1E1E22'); W([[24, 18], [40, 18], [39, 4], [25, 4]], '#26262C'); g.strokeStyle = '#DDD'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(27, 35); g.lineTo(31, 34); g.moveTo(33, 34); g.lineTo(37, 35); g.stroke(); }
  return (CACHE[kind] = c.toDataURL());
}

// Emblemas de los regímenes (de la versión 9).
export const EMB = {
  monarquia: '<svg viewBox="0 0 24 24" class="emb" aria-hidden="true"><path d="M3 17l2-9 4 4 3-7 3 7 4-4 2 9z" fill="#D9A93E" stroke="#8C6A1E"/><rect x="3" y="17" width="18" height="3" fill="#5B3A7A"/></svg>',
  aristocracia: '<svg viewBox="0 0 24 24" class="emb" aria-hidden="true"><path d="M12 21c-6-3-8-8-7-14M12 21c6-3 8-8 7-14" fill="none" stroke="#2F5B45" stroke-width="2"/><g fill="#5E8A4D"><ellipse cx="6" cy="10" rx="1.6" ry="3" transform="rotate(-25 6 10)"/><ellipse cx="7.5" cy="15" rx="1.6" ry="3" transform="rotate(-45 7.5 15)"/><ellipse cx="18" cy="10" rx="1.6" ry="3" transform="rotate(25 18 10)"/><ellipse cx="16.5" cy="15" rx="1.6" ry="3" transform="rotate(45 16.5 15)"/></g></svg>',
  republica: '<svg viewBox="0 0 24 24" class="emb" aria-hidden="true"><rect x="4" y="10" width="16" height="10" rx="1" fill="#E9E3D6" stroke="#2D5D72"/><rect x="9" y="4" width="6" height="8" fill="#F4EFE2" stroke="#2D5D72" transform="rotate(-8 12 8)"/><rect x="8" y="10" width="8" height="1.6" fill="#2D5D72"/></svg>',
  tirania: '<svg viewBox="0 0 24 24" class="emb" aria-hidden="true"><path d="M12 3l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6L3.3 9.2l6.1-.6z" fill="#9E2B25"/></svg>',
  oligarquia: '<svg viewBox="0 0 24 24" class="emb" aria-hidden="true"><ellipse cx="12" cy="17" rx="8" ry="3" fill="#C9962E"/><ellipse cx="12" cy="13" rx="8" ry="3" fill="#D9A93E"/><ellipse cx="12" cy="9" rx="8" ry="3" fill="#E6BC55" stroke="#8C6A1E"/></svg>',
  demagogia: '<svg viewBox="0 0 24 24" class="emb" aria-hidden="true"><path d="M4 10h4l9-5v14l-9-5H4z" fill="#C0602A"/><path d="M8 14l1.5 5h2.5l-1.5-5" fill="#8A4420"/></svg>'
};
