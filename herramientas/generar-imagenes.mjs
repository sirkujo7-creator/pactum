// Genera las imágenes de las tarjetas (decisiones y cartas) con el arte real del mapa: juega unos años con un robot, coloca
// cada tema (iglesia, escuela, mercado…) y toma una foto de la cámara. Uso (con el servidor local en el puerto 8000):
//   node herramientas/generar-imagenes.mjs      → escribe src/imagenes/<tema>-<a|b>.jpg
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require(execSync('npm root -g').toString().trim() + '/playwright');
const SALIDA = new URL('../src/imagenes/', import.meta.url).pathname;
const W = 900, H = 640, ALTO = 330;
// tema → tipos de obra que lo muestran (el primero que exista) y zoom
const SOLO = process.env.SOLO ? process.env.SOLO.split(',') : null;
const TEMAS = {
  plaza: { obras: ['fundacion'], zoom: 2.3 }, iglesia: { obras: ['iglesia'], zoom: 2.6 }, escuela: { obras: ['escuela', 'universidad'], zoom: 2.6 },
  hospital: { obras: ['hospital'], zoom: 2.6 }, mercado: { obras: ['mercado'], zoom: 2.6 }, taller: { obras: ['taller'], zoom: 2.6 },
  finca: { obras: ['cultivo'], zoom: 2.3 }, cafetal: { obras: ['cafetal', 'cultivo'], zoom: 2.3 }, mina: { obras: ['mina', 'cantera'], zoom: 2.4 },
  rio: { obras: ['puerto', 'acueducto'], zoom: 2.2 }, casas: { obras: ['casa'], zoom: 2.4 }, cuartel: { obras: ['cuartel', 'policia'], zoom: 2.6 },
  cementerio: { obras: ['cementerio'], zoom: 2.4 }, banco: { obras: ['banco', 'recaudo'], zoom: 2.6 }, teatro: { obras: ['teatro', 'biblioteca'], zoom: 2.6 },
  bosque: { obras: [], zoom: 2.0, bosque: true }, calle: { obras: ['casa'], zoom: 1.7, desplaza: [3, 3] }
};
const VARIANTES = [{ id: 'a', anios: 22 }, { id: 'b', anios: 70 }];
const nav = await chromium.launch();
for (const V of VARIANTES) {
  const ctx = await nav.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1.5 }), p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://127.0.0.1:8000/?prueba=1&t=' + Date.now()); await p.waitForTimeout(900);
  await p.click('text=Nueva partida'); await p.click('.opt >> text=Normal'); await p.click('.opt >> text=República democrática');
  await p.waitForFunction(() => window.__pactum.scene.getScene('Mapa').listo, null, { timeout: 60000 });
  await p.click('text=Empezar a gobernar').catch(() => {}); await p.waitForTimeout(300);
  await p.click('[data-pr="dialogo"]', { timeout: 2000 }).catch(() => {}); await p.click('[data-pr="tierra"]', { timeout: 2000 }).catch(() => {}); await p.click('#firmarB', { timeout: 2000 }).catch(() => {}); await p.waitForTimeout(300);
  await p.evaluate(async ([anios, temas]) => {
    const s = window.__pactum.scene.getScene('Mapa'), S = s.S, rb = await import('/herramientas/robots.js'), core = await import('/src/core/index.js');
    for (let y = 0; y < anios; y++) { if (S.pend) core.choose(S, 0); const r = rb.botYear(S, 'fair', null); if (r.end) break; }
    S.pend = null; S.suceso = null; S.tarjetaRapida = null; S.cartaEv = null;
    // coloca lo que falte cerca de la plaza (llano libre)
    const N = S.n || 32, pla = S.map.findIndex(x => x.b === 'fundacion') >= 0 ? S.map.findIndex(x => x.b === 'fundacion') : S.map.findIndex(x => x.b);
    const libres = S.map.map((x, i) => i).filter(i => !S.map[i].b && S.map[i].t === 'llano' && !S.map[i].mk).sort((a, b) => Math.hypot(Math.floor(a / N) - Math.floor(pla / N), a % N - pla % N) - Math.hypot(Math.floor(b / N) - Math.floor(pla / N), b % N - pla % N));
    let k = 3; const necesarios = new Set(Object.values(temas).flatMap(t => t.obras.slice(0, 1)));
    for (const o of necesarios) if (!S.map.some(x => x.b === o && !x.ob)) { const i = libres[k]; k += 3; if (i !== undefined) { S.map[i].b = o; if (o === 'cultivo') { S.map[i].cv = 'cafe'; } } }
    // un campo de cultivos lejos del pueblo (para el tema «finca»): 2×3 casillas de llano libre con cultivos distintos
    const lejos = libres.filter(i => Math.hypot(Math.floor(i / N) - Math.floor(pla / N), i % N - pla % N) >= 7);
    const hueco = lejos.find(i => { const r = Math.floor(i / N), c = i % N; for (let a = 0; a < 2; a++) for (let b = 0; b < 3; b++) { const j = (r + a) * N + c + b; if (r + a >= N || c + b >= N || S.map[j].b || S.map[j].t !== 'llano') return false; } return true; });
    if (hueco !== undefined) { const r = Math.floor(hueco / N), c = hueco % N, cvs = ['pancoger', 'cafe', 'platano', 'ganaderia', 'arroz', 'cacao']; let q = 0; for (let a = 0; a < 2; a++) for (let b = 0; b < 3; b++) { const x = S.map[(r + a) * N + c + b]; x.b = 'cultivo'; x.cv = cvs[q++]; x.cvDesde = 0; x.campo = 1; } }
    S.year = Math.max(S.year, anios);
    s.scene.restart({});
  }, [V.anios, TEMAS]);
  await p.waitForTimeout(600); await p.waitForFunction(() => window.__pactum.scene.getScene('Mapa').listo, null, { timeout: 60000 }); await p.waitForTimeout(1500);
  await p.addStyleTag({ content: '#ui{display:none !important}' });
  for (const [tema, T] of Object.entries(TEMAS).filter(([k]) => !SOLO || SOLO.includes(k))) {
    const ok = await p.evaluate(async ([tema, T]) => {
      const s = window.__pactum.scene.getScene('Mapa'), S = s.S, N = s.T.N, iso = await import('/src/arte/iso.js');
      let i = -1;
      for (const o of T.obras) {
        const L = S.map.map((x, j) => j).filter(j => S.map[j].b === o && !S.map[j].ob); if (!L.length) continue;
        const pla = Math.max(0, S.map.findIndex(x => x.b === 'fundacion')), dist = j => Math.hypot(Math.floor(j / N) - Math.floor(pla / N), j % N - pla % N);
        const vecinos = j => S.map.filter((y, q) => y.b === o && Math.abs(q % N - j % N) <= 2 && Math.abs(Math.floor(q / N) - Math.floor(j / N)) <= 2).length;
        if (o === 'cultivo' && S.map.some(x => x.campo)) { i = S.map.findIndex(x => x.campo); break; }
        i = (o === 'cultivo' || o === 'cafetal') ? L.sort((a, b) => vecinos(b) - vecinos(a) || dist(b) - dist(a))[0] : (o === 'mina' || o === 'cementerio' || o === 'cantera') ? L.sort((a, b) => dist(b) - dist(a))[0] : L[0];
        break;
      }
      if (i < 0 && T.bosque) {
        const B = S.map.map((x, j) => j).filter(j => S.map[j].t === 'bosque' && Math.floor(j / N) >= 7 && Math.floor(j / N) <= N - 8 && j % N >= 7 && j % N <= N - 8 && !S.map[j].b);
        const veci = j => S.map.filter((y, q) => y.t === 'bosque' && Math.abs(q % N - j % N) <= 3 && Math.abs(Math.floor(q / N) - Math.floor(j / N)) <= 3).length;
        i = B.sort((a, b) => veci(b) - veci(a))[0] ?? S.map.findIndex(x => x.t === 'bosque');
      }
      if (i < 0 && T.montana) { const M = S.map.map((x, j) => j).filter(j => S.map[j].t === 'montana'); i = M.sort((a, b) => (S.map[b].h || 0) - (S.map[a].h || 0))[0] ?? -1; }
      if (i < 0) return false;
      const t = s.T.tiles[i], d = T.desplaza || [0, 0], pp = iso.P(t.r + .5 + d[0], t.c + .5 + d[1], t.h);
      s.fijarCamara(T.zoom, pp[0], pp[1] - 14); return true;
    }, [tema, T]);
    if (!ok) { console.log('sin', V.id, tema); continue; }
    await p.waitForTimeout(700);
    await p.screenshot({ path: `${SALIDA}${tema}-${V.id}.jpg`, type: 'jpeg', quality: 80, clip: { x: 0, y: (H - ALTO) / 2, width: W, height: ALTO } });
  }
  console.log(V.id, 'errores', errs); await ctx.close();
}
await nav.close();
