// Dial tones: a voicemail caught someone dialling a number. Each key on a phone sends two tones at
// once (DTMF): one from a low group (the key's row) and one from a high group (its column). Listen,
// compare with the keypad by ear or by the analyser bars, and type the number.
//
// params (all optional):
//   digits  4..11, length of a random number (default 7). 10 and 11 look like Malaysian mobiles (01x)
//   number  the real number from the story, e.g. '0112345678'; may use * and #; overrides digits
//   noise   0..1 line noise (default 0.15): louder hiss, and ghost bars rise next to the real ones
//   clue    story note shown above the recorder
import '../styles/games-d/dialtone.css';
import { h, svgEl } from '../core/ui.js';
import { sfx, audioContext, unlock } from '../core/audio.js';
import { state } from '../core/state.js';
import { mulberry32 } from '../core/rng.js';
import { put, svg, text, rect, C } from '../core/howto-kit.js';
import { KEYS, LETTERS, clampParams, makeNumber, spectrum, cleanSpectrum, freqs, toneSeed, timeline } from './dialtone-logic.js';

export { makeNumber, spectrum, readSpectrum } from './dialtone-logic.js';

export const meta = { id: 'dialtone', name: 'Dial Tones', category: 'Listening' };
export const demo = { params: { digits: 7, noise: 0.15, clue: 'Practice tape. In a case, a note from the story is pinned here.' } };

// ---------- bars (the line analyser) ----------
const BW = 44, BH = 34;
const barX = (g, i) => (g === 0 ? 2 + i * 6 : 28 + i * 6);

/** A 7-bar analyser: 4 low bars, a gap, 3 high bars. Unlabelled on purpose. */
function makeBars(cls = '', specks = 0, seed = 1) {
  const s = svgEl('svg', { class: `dt-bars ${cls}`, viewBox: `0 0 ${BW} ${BH}`, preserveAspectRatio: 'none', 'aria-hidden': 'true', focusable: 'false' });
  s.append(svgEl('line', { x1: 26, y1: 2, x2: 26, y2: BH - 1, class: 'dt-sep' }));
  const rects = [];
  for (let g = 0; g < 2; g++) for (let i = 0; i < (g ? 3 : 4); i++) {
    const r = svgEl('rect', { x: barX(g, i), width: 4.4, y: BH - 1, height: 0, rx: 0.8 });
    rects.push(r);
    s.append(r);
  }
  // line static: a few specks, more with more noise
  if (specks) {
    const rr = mulberry32(seed);
    for (let k = 0; k < specks; k++) s.append(svgEl('rect', { class: 'dt-speck', x: (rr() * (BW - 2)).toFixed(1), y: (rr() * (BH - 4)).toFixed(1), width: 1.2, height: 1.2 }));
  }
  const set = (spec) => {
    const vals = spec ? [...spec.low, ...spec.high] : Array(7).fill(0);
    vals.forEach((v, i) => {
      const hgt = Math.max(0, Math.min(1, v)) * (BH - 4);
      rects[i].setAttribute('y', (BH - 1 - hgt).toFixed(2));
      rects[i].setAttribute('height', hgt.toFixed(2));
      rects[i].style.opacity = (0.3 + 0.7 * v).toFixed(2);
    });
  };
  return { el: s, set };
}

// ---------- How to play ----------
function barsMarkup(x, y, w, hh, spec) {
  let o = rect(x, y, w, hh, { fill: '#0b0f12', stroke: '#3a444b', sw: 1, rx: 3 });
  const vals = [...spec.low, ...spec.high];
  const bw = w / 11;
  vals.forEach((v, i) => {
    const bx = x + bw * 0.6 + (i < 4 ? i : i + 1) * bw * 1.35;
    const bh = v * (hh - 8);
    o += `<rect x="${bx.toFixed(1)}" y="${(y + hh - 4 - bh).toFixed(1)}" width="${(bw * 0.9).toFixed(1)}" height="${bh.toFixed(1)}" fill="${C.amber}" opacity="${(0.3 + 0.7 * v).toFixed(2)}"/>`;
  });
  return o;
}
export const howTo = {
  goal: 'Work out the phone number someone dialled on the tape.',
  steps: [
    'Tap Play. Each beep is one key being pressed.',
    'Tap a tone in the strip to hear it again and see its bars.',
    'Press keypad keys. Find the one that sounds the same and lights the same two bars.',
    'Type the number into the slots, then press Check.',
    '✓ means right, ✕ means wrong. Fix the ✕ ones and check again.',
  ],
  example: {
    caption: 'Tone 1 lights the same two bars as key 5. So the number starts with 5.',
    render(el) {
      const tone = spectrum(7, '5', 0.25);
      let m = text(60, 18, 'Tone 1', { size: 13, weight: 700, fill: C.soft });
      m += barsMarkup(14, 26, 92, 62, tone);
      m += text(140, 64, '=', { size: 30, weight: 800, fill: C.red, font: 'display' });
      // a little keypad with 5 pressed
      KEYS.forEach((k, i) => {
        const x = 176 + (i % 3) * 30, y = 10 + Math.floor(i / 3) * 24;
        const on = k === '5';
        m += rect(x, y, 26, 20, { fill: on ? C.amber : C.paper, stroke: on ? C.red : C.line, sw: on ? 2 : 1, rx: 3 }) + text(x + 13, y + 15, k, { size: 13, weight: 700, font: 'display' });
      });
      m += barsMarkup(282, 26, 92, 62, cleanSpectrum('5'));
      m += text(328, 18, 'Key 5', { size: 13, weight: 700, fill: C.soft });
      put(el, svg(380, 112, m, 'The bars of tone 1 match the bars of key 5 on the keypad'));
    },
  },
  tips: [
    'No sound needed: the bars alone are enough. It works muted, and for deaf players.',
    'Slow plays every tone longer. Tap one tone at a time when it gets hard.',
  ],
  controls: {
    touch: 'Tap Play, tap a tone to replay it, tap keys to hear them and type. ⌫ deletes, Check tests.',
    keys: 'Type 0 to 9, * and #. Backspace deletes, Left and Right move between slots, Enter checks, P plays the tape.',
  },
};

// ---------- the game ----------
const sfxLevel = () => { const v = Number(state().settings.sfxVolume); return Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 0.8; };
const soundOn = () => state().settings.sound !== false;

export function mount(el, ctx) {
  const { params = {}, rng } = ctx;
  const P = clampParams(params);
  const num = [...makeNumber(rng, P)];
  const N = num.length;
  const noise = P.noise;
  const specBase = Math.floor(rng() * 1e9);
  const specs = num.map((k, i) => spectrum(toneSeed(specBase, i), k, noise));
  const levels = num.map((_, i) => 0.78 + 0.22 * mulberry32(toneSeed(specBase, i) ^ 0x5bd1)()); // tone loudness wobbles a little

  // ---- state ----
  let typed = Array(N).fill(null), locked = Array(N).fill(false), marks = Array(N).fill(null), heard = Array(N).fill(false);
  let slow = false, listenOnly = false;
  const sv = ctx.saved && typeof ctx.saved === 'object' ? ctx.saved : null;
  if (sv && sv.v === 1 && sv.num === num.join('')) {
    const arr = (a, ok) => (Array.isArray(a) && a.length === N ? a.map(ok) : null);
    typed = arr(sv.typed, (x) => (KEYS.includes(x) ? x : null)) || typed;
    locked = arr(sv.locked, (x, i) => x === true && typed[i] === num[i]) || locked;
    marks = arr(sv.marks, (x, i) => (locked[i] ? 'ok' : x === 'bad' && typed[i] != null ? 'bad' : null)) || marks;
    heard = arr(sv.heard, (x) => x === true) || heard;
    slow = sv.slow === true;
    listenOnly = sv.listenOnly === true;
  }
  let done = locked.every(Boolean);
  let cursor = Math.max(0, locked.findIndex((x) => !x));
  let destroyed = false, solveTimer = null;
  let playing = null; // { nodes, raf, kind }

  // ---- DOM ----
  const status = h('p', { class: 'feedback', 'aria-live': 'polite' });
  const note = h('p', { class: 'dt-note', role: 'note', hidden: true });
  const playBtn = h('button', { class: 'btn btn--small dt-play', type: 'button', onclick: () => (playing?.kind === 'tape' ? stop() : playTape()) });
  const slowBtn = h('button', { class: 'btn btn--small dt-slow', type: 'button', 'aria-pressed': String(slow), onclick: () => { slow = !slow; slowBtn.setAttribute('aria-pressed', String(slow)); persist(); } }, 'Slow');
  const reels = h('span', { class: 'dt-reels', 'aria-hidden': 'true' }, h('i'), h('i'));
  const segs = [], slots = [];
  const strip = h('ol', { class: 'dt-strip', 'aria-label': 'The tones on the tape and your answer' });
  num.forEach((_, i) => {
    const bars = makeBars('', Math.round(noise * 9), toneSeed(specBase, i) ^ 0x9e37);
    bars.set(specs[i]);
    const seg = h('button', { class: 'dt-seg', type: 'button', 'aria-label': `Play tone ${i + 1}`, onclick: () => { selectSlot(i); playOne(i); } },
      h('span', { class: 'dt-seg-n' }, String(i + 1)), bars.el);
    const slot = h('button', { class: 'dt-slot', type: 'button', tabindex: '-1', onclick: () => selectSlot(i) });
    segs.push(seg); slots.push(slot);
    strip.append(h('li', { class: 'dt-col' }, seg, slot));
  });
  const tape = h('div', { class: 'dt-tape' },
    h('div', { class: 'dt-tape-head' }, reels, h('span', { class: 'dt-label' }, 'VOICEMAIL · LINE 2 · 02:47'), h('span', { class: 'dt-rec', 'aria-hidden': 'true' })),
    h('div', { class: 'dt-bar' }, playBtn, slowBtn),
    strip,
    note);

  const lcdTone = makeBars('is-lcd'), lcdKey = makeBars('is-lcd');
  const lcdToneLab = h('span', { class: 'dt-lcd-lab' }, 'TONE –');
  const lcdKeyLab = h('span', { class: 'dt-lcd-lab' }, 'KEY –');
  const lcd = h('div', { class: 'dt-lcd', 'aria-hidden': 'true' },
    h('div', { class: 'dt-lcd-pane' }, lcdToneLab, lcdTone.el),
    h('div', { class: 'dt-lcd-pane' }, lcdKeyLab, lcdKey.el));
  const keyBtns = {};
  const keys = h('div', { class: 'dt-keys' }, KEYS.map((k) => (keyBtns[k] = h('button', {
    class: 'btn dt-key', type: 'button', 'aria-label': `Key ${k === '*' ? 'star' : k === '#' ? 'hash' : k}`, onclick: () => keyPress(k),
  }, h('b', {}, k), h('small', { 'aria-hidden': 'true' }, LETTERS[k] || ' ')))));
  const modeBtn = h('button', { class: 'btn btn--small dt-mode', type: 'button', 'aria-pressed': String(listenOnly), onclick: () => { listenOnly = !listenOnly; modeBtn.setAttribute('aria-pressed', String(listenOnly)); persist(); say(listenOnly ? 'Keys only play now. They do not type.' : 'Keys type into the slots again.'); } }, 'Test keys only');
  const delBtn = h('button', { class: 'btn dt-del', type: 'button', 'aria-label': 'Delete', onclick: back }, '⌫');
  const checkBtn = h('button', { class: 'btn btn--primary dt-check', type: 'button', onclick: check }, 'Check');
  const phone = h('div', { class: 'dt-phone' }, lcd, modeBtn, keys, h('div', { class: 'dt-actions' }, delBtn, checkBtn));

  el.append(
    h('p', { class: 'game-rules' }, `A voicemail caught someone dialling ${N} keys. Play the tones, compare them with the keypad by ear or by the bars, and type the number.`),
    params.clue ? h('p', { class: 'dt-clue' }, h('span', { class: 'dt-clue-pin', 'aria-hidden': 'true' }), params.clue) : null,
    h('div', { class: 'dt-layout' }, tape, phone),
    status,
  );

  function persist() { ctx.onSave({ v: 1, num: num.join(''), typed, locked, marks, heard, slow, listenOnly }); }
  function say(t, kind = '') { status.textContent = t; status.className = `feedback${kind ? ` is-${kind}` : ''}`; }

  function showNote() {
    const ok = soundOn() && !!(window.AudioContext || window.webkitAudioContext);
    note.hidden = ok;
    note.textContent = soundOn() ? 'This device cannot play the sound. The bars still show every tone.' : 'Sound is off in Settings. The bars still show every tone, so you can solve it without sound.';
  }

  function render() {
    num.forEach((_, i) => {
      const s = slots[i];
      const m = marks[i];
      s.className = `dt-slot${i === cursor && !done ? ' is-cur' : ''}${locked[i] ? ' is-ok' : m === 'bad' ? ' is-bad' : ''}`;
      s.textContent = '';
      s.append(h('b', {}, typed[i] ?? '·'));
      if (m) s.append(h('i', { 'aria-hidden': 'true' }, m === 'ok' ? '✓' : '✕'));
      s.setAttribute('aria-label', `Slot ${i + 1}: ${typed[i] == null ? 'empty' : typed[i]}${locked[i] ? ', right' : m === 'bad' ? ', wrong' : ''}`);
      segs[i].classList.toggle('is-heard', heard[i]);
    });
    keys.classList.toggle('is-done', done);
    checkBtn.disabled = done;
    delBtn.disabled = done;
    tape.classList.toggle('is-solved', done);
    const right = locked.filter(Boolean).length;
    const h2 = heard.filter(Boolean).length;
    ctx.onProgress(done ? 1 : Math.min(0.95, 0.85 * (right / N) + 0.1 * (h2 / N)));
  }

  // ---- typing ----
  const nextOpen = (from, dir = 1) => { for (let i = from + dir; i >= 0 && i < N; i += dir) if (!locked[i]) return i; return -1; };
  function selectSlot(i) {
    if (done || locked[i]) return;
    cursor = i;
    render();
  }
  function keyPress(k) {
    playKey(k);
    if (done || listenOnly) return;
    if (locked[cursor]) { const c = nextOpen(-1); if (c < 0) return; cursor = c; }
    typed[cursor] = k;
    marks[cursor] = null;
    const c = nextOpen(cursor);
    if (c >= 0) cursor = c;
    say('');
    persist(); render();
  }
  function back() {
    if (done) return;
    if (typed[cursor] == null || locked[cursor]) { const c = nextOpen(cursor, -1); if (c >= 0) cursor = c; }
    if (!locked[cursor]) { typed[cursor] = null; marks[cursor] = null; }
    sfx.click();
    persist(); render();
  }
  function move(dir) {
    const c = nextOpen(cursor, dir);
    if (c >= 0) { cursor = c; render(); }
  }
  function shake() { strip.classList.remove('is-shake'); void strip.offsetWidth; strip.classList.add('is-shake'); }

  function check() {
    if (done) return;
    const empty = num.findIndex((_, i) => !locked[i] && typed[i] == null);
    if (empty >= 0) { say(`Fill all ${N} slots first.`, 'bad'); cursor = empty; shake(); render(); return; }
    let fresh = 0, wrong = 0;
    num.forEach((k, i) => {
      if (locked[i]) return;
      if (typed[i] === k) { locked[i] = true; marks[i] = 'ok'; fresh++; } else { marks[i] = 'bad'; wrong++; }
    });
    if (locked.every(Boolean)) { persist(); win(); return; }
    const c = locked.findIndex((x) => !x);
    cursor = marks[c] === 'bad' ? c : Math.max(0, num.findIndex((_, i) => marks[i] === 'bad'));
    if (fresh) sfx.good(); else sfx.bad();
    say(`${locked.filter(Boolean).length} of ${N} right. ${wrong} ${wrong === 1 ? 'is' : 'are'} wrong: listen to ${wrong === 1 ? 'that tone' : 'those tones'} again.`, fresh ? '' : 'bad');
    persist(); render();
  }

  function win() {
    done = true;
    stop();
    render();
    sfx.good();
    say(`Number traced: ${num.join('')}.`, 'good');
    solveTimer = setTimeout(() => { if (!destroyed) ctx.onSolved(); }, 700);
  }

  // ---- sound and the moving lights ----
  let hissBuf = null;
  function audio() {
    if (!soundOn()) return null;
    unlock(); // we are inside a tap or key press
    const ac = audioContext();
    if (!ac) return null;
    if (ac.state === 'suspended') ac.resume().catch(() => {});
    return ac;
  }
  function makeHiss(ac) {
    if (hissBuf && hissBuf.sampleRate === ac.sampleRate) return hissBuf;
    const len = Math.floor(ac.sampleRate * 1.5);
    hissBuf = ac.createBuffer(1, len, ac.sampleRate);
    const d = hissBuf.getChannelData(0);
    const rr = mulberry32(specBase ^ 0x1234);
    for (let i = 0; i < len; i++) d[i] = rr() * 2 - 1;
    return hissBuf;
  }

  /**
   * Play tones. items: [{ key, at, dur, level }] in seconds from start. kind: 'tape' (whole tape),
   * 'one' (one taped tone; both carry line hiss) or 'key' (a clean keypad tone).
   * onFrame(index | -1) runs every animation frame with the tone sounding now.
   */
  function run(items, total, kind, onFrame) {
    stop();
    showNote();
    const ac = audio();
    const nodes = [];
    const lead = 0.06;
    if (ac) {
      const t0 = ac.currentTime + lead;
      const out = ac.createGain();
      out.gain.value = sfxLevel();
      out.connect(ac.destination);
      nodes.push(out);
      for (const it of items) {
        const [f1, f2] = freqs(it.key);
        const g = ac.createGain();
        const a = t0 + it.at, b = a + it.dur, peak = 0.13 * (it.level ?? 1);
        g.gain.setValueAtTime(0, a);
        g.gain.linearRampToValueAtTime(peak, a + 0.006);
        g.gain.setValueAtTime(peak, b - 0.008);
        g.gain.linearRampToValueAtTime(0, b);
        g.connect(out);
        for (const f of [f1, f2]) {
          const o = ac.createOscillator();
          o.type = 'sine';
          o.frequency.value = f;
          o.connect(g);
          o.start(a);
          o.stop(b + 0.02);
          nodes.push(o);
        }
        nodes.push(g);
      }
      if (kind !== 'key') {
        const src = ac.createBufferSource();
        src.buffer = makeHiss(ac);
        src.loop = true;
        const bp = ac.createBiquadFilter();
        bp.type = 'bandpass'; bp.frequency.value = 1500; bp.Q.value = 0.6;
        const hg = ac.createGain();
        const lvl = 0.04 + 0.16 * noise;
        hg.gain.setValueAtTime(0, t0 - lead);
        hg.gain.linearRampToValueAtTime(lvl, t0 + 0.08);
        hg.gain.setValueAtTime(lvl, t0 + total - 0.12);
        hg.gain.linearRampToValueAtTime(0, t0 + total);
        src.connect(bp).connect(hg).connect(out);
        src.start(t0 - lead);
        src.stop(t0 + total + 0.05);
        nodes.push(src, bp, hg);
      }
    }
    const start = performance.now() + lead * 1000;
    const p = { nodes, raf: 0, kind };
    const tick = () => {
      const t = (performance.now() - start) / 1000;
      const idx = items.findIndex((it) => t >= it.at && t < it.at + Math.max(it.dur, 0.12));
      onFrame(idx);
      if (t < total) p.raf = requestAnimationFrame(tick);
      else stop();
    };
    p.raf = requestAnimationFrame(tick);
    playing = p;
    if (kind === 'tape') { tape.classList.add('is-playing'); playBtn.textContent = '■ Stop'; }
  }
  function stop() {
    if (!playing) return;
    cancelAnimationFrame(playing.raf);
    for (const nd of playing.nodes) { try { nd.stop?.(); } catch { /* not started or done */ } try { nd.disconnect(); } catch { /* gone */ } }
    playing = null;
    segs.forEach((s) => s.classList.remove('is-on'));
    keys.querySelectorAll('.dt-key.is-on').forEach((k) => k.classList.remove('is-on'));
    tape.classList.remove('is-playing');
    playBtn.textContent = '▶ Play tape';
  }

  function showTone(i) {
    lcdToneLab.textContent = `TONE ${i + 1}`;
    lcdTone.set(specs[i]);
  }
  function playTape() {
    const tl = timeline(N, slow);
    const items = tl.tones.map((t, i) => ({ key: num[i], at: t.t, dur: t.d, level: levels[i] }));
    let last = -1;
    run(items, tl.total, 'tape', (idx) => {
      if (idx === last) return;
      if (last >= 0) segs[last].classList.remove('is-on');
      last = idx;
      if (idx >= 0) {
        segs[idx].classList.add('is-on');
        showTone(idx);
        if (!heard[idx]) { heard[idx] = true; persist(); render(); }
      }
    });
  }
  function playOne(i) {
    const d = slow ? 0.42 : 0.24;
    showTone(i);
    if (!heard[i]) { heard[i] = true; persist(); render(); }
    run([{ key: num[i], at: 0.02, dur: d, level: levels[i] }], d + 0.12, 'one', (idx) => segs[i].classList.toggle('is-on', idx === 0));
  }
  function playKey(k) {
    lcdKeyLab.textContent = `KEY ${k}`;
    lcdKey.set(cleanSpectrum(k));
    const btn = keyBtns[k];
    run([{ key: k, at: 0, dur: 0.2 }], 0.26, 'key', (idx) => btn.classList.toggle('is-on', idx === 0));
  }

  // ---- keyboard ----
  const onKey = (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
    if (!el.isConnected) return;
    if (KEYS.includes(e.key)) { e.preventDefault(); keyPress(e.key); }
    else if (e.key === 'Backspace') { e.preventDefault(); back(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); move(1); }
    else if (e.key === 'p' || e.key === 'P') { e.preventDefault(); if (playing?.kind === 'tape') stop(); else playTape(); }
    else if (e.key === 'Enter') {
      // a focused tool (a tone, Play, Slow) keeps its own Enter; anywhere else Enter checks
      if (t && t.closest && t.closest('.dt-seg, .dt-bar, .dt-mode, .dt-del') && el.contains(t)) return;
      if (t && t.closest && !el.contains(t) && t.tagName === 'BUTTON') return;
      e.preventDefault();
      check();
    }
  };
  document.addEventListener('keydown', onKey);

  playBtn.textContent = '▶ Play tape';
  showNote();
  persist();
  render();
  if (done) say(`Number traced: ${num.join('')}.`, 'good');

  return {
    destroy() {
      destroyed = true;
      clearTimeout(solveTimer);
      stop();
      document.removeEventListener('keydown', onKey);
    },
    hint() {
      if (done) return null;
      const open = num.map((_, i) => i).filter((i) => !locked[i]);
      if (!open.length) return null;
      const badOnes = open.filter((i) => marks[i] === 'bad');
      const pool = badOnes.length ? badOnes : open;
      const i = pool.includes(cursor) ? cursor : pool[Math.floor(rng() * pool.length)];
      typed[i] = num[i]; locked[i] = true; marks[i] = 'ok';
      if (locked.every(Boolean)) { persist(); win(); }
      else {
        if (cursor === i) { const c = nextOpen(i); cursor = c >= 0 ? c : Math.max(0, nextOpen(i, -1)); }
        persist(); render();
      }
      showTone(i);
      return `The lab cleaned up tone ${i + 1}: it is ${num[i]}.`;
    },
    devSolve() {
      if (done) return;
      num.forEach((k, i) => { typed[i] = k; });
      check();
    },
  };
}
