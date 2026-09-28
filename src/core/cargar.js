// Lee los archivos de src/data. En el navegador usa fetch; en Node (pruebas de balance) lee el disco.
import { ARCHIVOS, usarContenido } from './contenido.js';

export async function cargarContenido() {
  const datos = {};
  if (typeof window === 'undefined') {
    const fs = await import('node:fs');
    for (const a of ARCHIVOS) datos[a] = JSON.parse(fs.readFileSync(new URL(`../data/${a}.json`, import.meta.url), 'utf8'));
  } else {
    await Promise.all(ARCHIVOS.map(async a => {
      const r = await fetch(new URL(`../data/${a}.json`, import.meta.url));
      if (!r.ok) throw new Error(`No se pudo leer ${a}.json`);
      datos[a] = await r.json();
    }));
  }
  return usarContenido(datos);
}
