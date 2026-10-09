// Tamaño de pantalla y nitidez. El lienzo usa la resolución real del aparato (hasta 2×)
// y cada escena trabaja en píxeles de pantalla normales gracias al zoom de la cámara.
const CELULAR = navigator.maxTouchPoints > 0 && Math.min(screen.width, screen.height) < 900;
export const DPR = Math.min(window.devicePixelRatio || 1, CELULAR ? 2 : 2.5); // en celular, máximo 2× (menos memoria y menos trabajo de la tarjeta gráfica)
export function tam(scene) { return { w: scene.scale.width / DPR, h: scene.scale.height / DPR }; }
export const reducirMovimiento = () => !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Capa de interfaz en HTML (botones accesibles con teclado y lector de pantalla).
export function capaUI() { return document.getElementById('ui'); }
export function el(tag, attrs = {}, hijos = []) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'on') for (const [ev, fn] of Object.entries(v)) e.addEventListener(ev, fn);
    else if (k === 'text') e.textContent = v;
    else if (k === 'html') e.innerHTML = v;
    else e.setAttribute(k, v);
  }
  for (const h of [].concat(hijos)) if (h) e.append(h);
  return e;
}
