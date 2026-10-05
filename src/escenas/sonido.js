// Sonido de la versión 9: río, pájaros y tiple, generados en el momento (sin archivos de audio).
// Cada régimen tiene su escala y su ritmo.
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export const Sonido = (() => {
  let ac = null, master = null, on = false, timer = null, next = 0, bar = 0, birdT = 0, deg = 2;
  const NOTE = n => 440 * Math.pow(2, (n - 69) / 12);
  const MODES = {
    republica: { s: [64, 67, 69, 71, 74, 76, 79], b: [[40, 47], [45, 52], [47, 54], [40, 47]], beat: .62 },
    monarquia: { s: [67, 69, 71, 74, 76, 79, 81], b: [[43, 50], [48, 55], [50, 57], [43, 50]], beat: .72 },
    aristocracia: { s: [62, 64, 65, 67, 69, 72, 74], b: [[38, 45], [43, 50], [45, 52], [38, 45]], beat: .66 },
    tirania: { s: [57, 60, 62, 64, 65, 67, 69], b: [[33, 40], [33, 40], [38, 45], [40, 47]], beat: .82 },
    oligarquia: { s: [65, 67, 69, 71, 72, 74, 77], b: [[41, 48], [43, 50], [41, 48], [36, 43]], beat: .64 },
    demagogia: { s: [60, 62, 64, 67, 69, 72, 74], b: [[36, 43], [41, 48], [43, 50], [36, 43]], beat: .5 }
  };
  let SCALE = MODES.republica.s, BASS = MODES.republica.b, BEAT = .62;
  function init() {
    ac = new (window.AudioContext || window.webkitAudioContext)();
    master = ac.createGain(); master.gain.value = 0; master.connect(ac.destination);
    // Río: ruido filtrado que respira.
    const len = ac.sampleRate * 2, buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
    let l = 0;
    for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; l = (l + .02 * w) / 1.02; d[i] = l * 3.2; }
    const src = ac.createBufferSource(); src.buffer = buf; src.loop = true;
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 650;
    const rg = ac.createGain(); rg.gain.value = .05;
    const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = .08; lg.gain.value = .02; lfo.connect(lg); lg.connect(rg.gain); lfo.start();
    src.connect(lp); lp.connect(rg); rg.connect(master); src.start();
  }
  function pluck(f, t, dur, vol) {
    const o = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain(), g2 = ac.createGain(), lp = ac.createBiquadFilter();
    o.type = 'triangle'; o.frequency.value = f; o2.type = 'sine'; o2.frequency.value = f * 2.003; g2.gain.value = .25;
    lp.type = 'lowpass'; lp.frequency.setValueAtTime(3200, t); lp.frequency.exponentialRampToValueAtTime(700, t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .006); g.gain.exponentialRampToValueAtTime(.0008, t + dur);
    o.connect(lp); o2.connect(g2); g2.connect(lp); lp.connect(g); g.connect(master); o.start(t); o2.start(t); o.stop(t + dur + .05); o2.stop(t + dur + .05);
  }
  function bird(t) {
    const base = 2600 + Math.random() * 1400, n = 2 + Math.floor(Math.random() * 3);
    for (let k = 0; k < n; k++) {
      const o = ac.createOscillator(), g = ac.createGain(), s = t + k * .13; o.type = 'sine';
      o.frequency.setValueAtTime(base, s); o.frequency.exponentialRampToValueAtTime(base * 1.35, s + .06); o.frequency.exponentialRampToValueAtTime(base * .9, s + .1);
      g.gain.setValueAtTime(0, s); g.gain.linearRampToValueAtTime(.018, s + .01); g.gain.exponentialRampToValueAtTime(.0005, s + .11);
      o.connect(g); g.connect(master); o.start(s); o.stop(s + .13);
    }
  }
  function schedule() {
    while (next < ac.currentTime + .8) {
      const ch = BASS[bar % 4];
      pluck(NOTE(ch[0]), next, 1.6, .09); pluck(NOTE(ch[1]), next + BEAT, 1, .05); pluck(NOTE(ch[1]), next + BEAT * 2, 1, .05);
      if (Math.random() < .8) {
        [0, .5, 1, 1.5, 2, 2.5].filter(() => Math.random() < .55).forEach(s => { deg = clamp(deg + Math.floor(Math.random() * 3) - 1, 0, SCALE.length - 1); pluck(NOTE(SCALE[deg]), next + s * BEAT, 1.1, .06); });
      }
      next += BEAT * 3; bar++;
    }
    if (ac.currentTime > birdT) { bird(ac.currentTime + .1); birdT = ac.currentTime + 4 + Math.random() * 9; }
  }
  // iPhone: el audio de la página suena aunque el interruptor de silencio esté puesto (Safari 16.4+) y se
  // «desbloquea» con un sonido mudo dentro del mismo toque.
  function desbloquear() {
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* sin audioSession */ }
    try { const b = ac.createBuffer(1, 1, 22050), s = ac.createBufferSource(); s.buffer = b; s.connect(ac.destination); s.start(0); } catch (e) { /* nada */ }
    if (ac.state !== 'running') ac.resume().catch(() => {});
  }
  function start() {
    try { if (!ac) init(); } catch (e) { console.warn('Sin sonido:', e); return; }
    desbloquear(); on = true; next = Math.max(next, ac.currentTime + .1);
    master.gain.cancelScheduledValues(ac.currentTime); master.gain.linearRampToValueAtTime(.55, ac.currentTime + 1.2);
    if (!timer) timer = setInterval(schedule, 200);
  }
  function stop() { on = false; if (!ac) return; master.gain.cancelScheduledValues(ac.currentTime); master.gain.linearRampToValueAtTime(0, ac.currentTime + .5); clearInterval(timer); timer = null; }
  function chime() { if (!on) return; const t = ac.currentTime; [76, 83, 88].forEach((n, k) => pluck(NOTE(n), t + k * .12, 1.8, .07)); }
  // El Pregonero (fase 11): la prensa que golpea, la campanilla del voceador y una fanfarria de metales.
  // Bien distinto de la campanita del año (cuerdas pulsadas): ruido de máquina, campana y bronces.
  let ruido = null;
  function golpe(t, vol) {
    if (!ruido) { const n = ac.sampleRate * .08; ruido = ac.createBuffer(1, n, ac.sampleRate); const d = ruido.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n); }
    const s = ac.createBufferSource(), bp = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = ruido;
    bp.type = 'bandpass'; bp.frequency.value = 1500; bp.Q.value = 1.4;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + .07);
    s.connect(bp); bp.connect(g); g.connect(master); s.start(t);
    const o = ac.createOscillator(), og = ac.createGain(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(60, t + .08);
    og.gain.setValueAtTime(vol * .8, t); og.gain.exponentialRampToValueAtTime(.001, t + .1); o.connect(og); og.connect(master); o.start(t); o.stop(t + .12);
  }
  function campana(t) {
    [[1, .06], [2.76, .025], [5.4, .012]].forEach(([m, v]) => {
      const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.value = 1320 * m;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .004); g.gain.exponentialRampToValueAtTime(.0005, t + 1.3);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + 1.4);
    });
  }
  function bronce(f, t, dur, vol) {
    const o = ac.createOscillator(), o2 = ac.createOscillator(), lp = ac.createBiquadFilter(), g = ac.createGain();
    o.type = 'sawtooth'; o2.type = 'sawtooth'; o.frequency.value = f; o2.frequency.value = f * 1.006;
    lp.type = 'lowpass'; lp.frequency.setValueAtTime(500, t); lp.frequency.linearRampToValueAtTime(2400, t + .05); lp.frequency.exponentialRampToValueAtTime(900, t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .03); g.gain.setValueAtTime(vol, t + dur * .7); g.gain.exponentialRampToValueAtTime(.0008, t + dur);
    o.connect(lp); o2.connect(lp); lp.connect(g); g.connect(master); o.start(t); o2.start(t); o.stop(t + dur + .05); o2.stop(t + dur + .05);
  }
  function prensa() {
    if (!on) return;
    const t = ac.currentTime + .05;
    [0, .16, .3, .42, .52, .6].forEach((d, k) => golpe(t + d, .22 + k * .02));
    campana(t + .78); campana(t + .98);
    [[67, 0, .16], [72, .17, .16], [76, .34, .16], [79, .51, .75]].forEach(([n, d, dur]) => bronce(NOTE(n), t + 1.2 + d, dur, .045));
  }
  // Fase 13: una carta: el papel que se desdobla y tres notas suaves y graves del tiple (distinto del periódico).
  function carta() {
    if (!on) return;
    const t = ac.currentTime + .05;
    if (!ruido) { const n = ac.sampleRate * .08; ruido = ac.createBuffer(1, n, ac.sampleRate); const d = ruido.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n); }
    [0, .09, .2].forEach(d => { const s = ac.createBufferSource(), hp = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = ruido; hp.type = 'highpass'; hp.frequency.value = 2500; g.gain.setValueAtTime(.06, t + d); g.gain.exponentialRampToValueAtTime(.001, t + d + .08); s.connect(hp); hp.connect(g); g.connect(master); s.start(t + d); });
    [[57, .45], [60, .8], [64, 1.15]].forEach(([n, d]) => pluck(NOTE(n), t + d, 2.4, .07));
  }
  function tap() { if (!on) return; pluck(NOTE(59), ac.currentTime, .25, .08); }
  function mode(r) { const m = MODES[r] || MODES.republica; SCALE = m.s; BASS = m.b; BEAT = m.beat; }
  function despertar() { if (ac && on && ac.state !== 'running') desbloquear(); }
  return { start, stop, chime, tap, prensa, carta, mode, despertar, get on() { return on; } };
})();
