// Foot Chase: an action mini game. A third-person run down three lanes at night in the monsoon,
// after a suspect on foot (or on a scooter). Swipe or use the arrow keys to change lane, jump low
// things and slide under things hanging at head height. Running clean closes the gap; a stumble
// lets him pull away. Close the gap to nothing and you tackle him.
//
// params (all optional):
//   setting     'city' (default: KL back lanes) | 'market' (Chow Kit after closing) |
//               'docks' (Port Klang) | 'heritage' (George Town) | 'kampung' (Kampung Baru)
//   vehicle     'foot' (default) | 'scooter': what the suspect is running on
//   difficulty  'easy' (default, about 45-60 s) | 'medium' | 'hard' (about 90 s): speed, obstacle
//               density and the start gap
//   gap         start gap in metres (overrides the difficulty's: easy 40, medium 50, hard 80)
//   suspect     name on the gap meter, e.g. 'Rizal' (default 'Suspect')
//   clue        story note pinned above the street, e.g. 'He ran the moment Lim said his name.'
//   renderer    'auto' (default) | '2d': force the plain canvas view
//
// Save: { v: 1, best } (the closest the player has come, in metres). A reload starts a new run.
import '../styles/games-d/pursuit.css';
import { h, isDev } from '../core/ui.js';
import { sfx, unlock, audioContext, thunder } from '../core/audio.js';
import { state } from '../core/state.js';
import { app } from '../core/app.js';
import { isHowToOpen } from '../core/howto.js';
import { put, svg, rect, text, arrow, C } from '../core/howto-kit.js';
import { mulberry32 } from '../core/rng.js';
import { createRun, DIFF, diffOf, PHYS } from './pursuit-logic.js';
import { SETTINGS } from './pursuit-kits.js';
import { createScene3D } from './pursuit-scene.js';
import { createScene2D } from './pursuit-2d.js';

export const meta = { id: 'pursuit', name: 'Foot Chase', category: 'Action' };
export const demo = {
  params: { setting: 'city', vehicle: 'foot', difficulty: 'easy', suspect: 'Rizal', clue: 'Practice run. In a case, a clue from the story is pinned here.' },
};

const SURFACE = { city: 'wet tar', market: 'cabbage leaves', docks: 'oily concrete', heritage: 'wet tiles', kampung: 'wet planks' };
const TIPS = [
  'Stay in the middle lane when you can: both sides are one swipe away.',
  'Low things (crates, kerbs, logs) you jump. Anything hanging at head height you slide under.',
  'A cup of teh tarik gives a few seconds of sprint. It is worth a lane change.',
  'Swipe a little early: a jump pressed just before you land still counts.',
];
const reducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const name = (p) => (p.suspect ? String(p.suspect) : 'the suspect');

export const howTo = {
  goal: ({ params }) => `Chase ${name(params).replace(/^The /, "the ")} through the rain and tackle him before he gets away.`,
  steps: [
    ({ params }) => `Tap the street to start. ${params.suspect || 'He'} is about ${Math.round(Number(params.gap) > 0 ? Number(params.gap) : diffOf(params.difficulty).gap)} m ahead.`,
    'Swipe left or right (or ← →) to change lane around anything blocking yours.',
    'Swipe up (↑ or Space) to jump low things. Swipe down (↓) to slide under things at head height.',
    'Run clean to close the gap. A stumble lets him pull away; teh tarik gives a short sprint.',
  ],
  example: {
    caption: 'A crate in your lane: swipe left to go round it, or swipe up to jump it. The laundry on the right you slide under.',
    render(el) {
      let s = rect(0, 0, 300, 170, { fill: '#121a21', stroke: 'none', sw: 0, rx: 4 });
      s += '<path d="M120 22 L180 22 L286 168 L14 168 Z" fill="#232a2e"/>';
      s += '<path d="M140 22 L105 168 M160 22 L195 168" stroke="#d8d2c2" stroke-opacity=".3" stroke-width="2" stroke-dasharray="10 9"/>';
      // crate in the middle lane, laundry over the right lane
      s += rect(132, 88, 36, 20, { fill: '#b87a3a', stroke: C.ink, sw: 1.5 });
      s += '<path d="M132 98 H168 M150 88 V108" stroke="#5a3a1e" stroke-width="1.5"/>';
      s += '<path d="M188 70 V110 M226 70 V110" stroke="#9fb3bf" stroke-width="2"/><path d="M188 72 H226" stroke="#ccc" stroke-width="1.5"/>';
      s += rect(191, 72, 12, 16, { fill: '#7a1e2c', stroke: 'none', sw: 0 }) + rect(205, 72, 9, 14, { fill: '#1f5d63', stroke: 'none', sw: 0 }) + rect(216, 72, 9, 17, { fill: '#b8862f', stroke: 'none', sw: 0 });
      // the detective
      s += '<circle cx="150" cy="128" r="6" fill="#a8774f"/>';
      s += rect(143, 134, 14, 20, { fill: '#9a7a52', stroke: 'none', sw: 0, rx: 2 });
      s += '<path d="M146 154 L142 166 M154 154 L158 166" stroke="#24282c" stroke-width="4" stroke-linecap="round"/>';
      s += arrow(138, 140, 88, 140, { color: C.amber, sw: 3.5, head: 10 });
      s += arrow(150, 120, 150, 84, { color: C.red, sw: 3.5, head: 10, bend: 0 });
      s += text(70, 132, 'swipe', { size: 12, fill: C.amber, weight: 700 }) + text(176, 116, 'jump', { size: 12, fill: '#f0a0a0', weight: 700, anchor: 'start' });
      s += text(250, 66, 'slide', { size: 12, fill: '#9fe0e0', weight: 700 });
      s += '<path d="M248 72 Q244 92 214 112" fill="none" stroke="#3ef2e0" stroke-width="2" stroke-dasharray="4 4"/>';
      put(el, svg(300, 170, s, 'Three lanes; a crate in your lane, laundry over the right lane; arrows show a swipe left and a swipe up'));
    },
  },
  tips: [
    'Stay in the middle lane when you can: both sides are one swipe away.',
    'If he gets away, Retry starts the chase again at once. Nothing is lost.',
  ],
  controls: {
    touch: 'Swipe left, right, up or down anywhere on the street. Expand makes it full screen.',
    keys: '← → or A D change lane, ↑ W or Space jump, ↓ or S slide, P pauses.',
  },
};

export function mount(el, ctx) {
  const p = { ...(ctx.params || {}) };
  if (isDev()) {
    // dev only: try any setting from the lab, e.g. ?screen=lab&game=pursuit&dev&setting=docks
    const q = new URLSearchParams(location.search);
    for (const k of ['setting', 'vehicle', 'difficulty', 'renderer']) if (q.get(k)) p[k] = q.get(k);
  }
  // dev only: ?turbo=N runs game time N times faster than the (slow, headless) frame rate
  const turbo = isDev() ? Math.max(0, Number(new URLSearchParams(location.search).get('turbo')) || 0) : 0;
  const setting = SETTINGS[p.setting] ? p.setting : 'city';
  const vehicle = p.vehicle === 'scooter' ? 'scooter' : 'foot';
  const difficulty = DIFF[p.difficulty] ? p.difficulty : 'easy';
  const D = DIFF[difficulty];
  const baseGap = Number(p.gap) > 0 ? Math.min(400, Number(p.gap)) : D.gap;
  const who = p.suspect ? String(p.suspect) : 'Suspect';
  const reduced = reducedMotion();
  const coarse = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
  const smallScreen = Math.min(screen?.width || innerWidth, screen?.height || innerHeight) < 820;
  const lowPower = !!(coarse && smallScreen);
  const lowEnd = (navigator.deviceMemory && navigator.deviceMemory <= 3) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4 && coarse);
  let dprCap = lowEnd ? 1 : 1.5;

  const saved = ctx.saved && typeof ctx.saved === 'object' && ctx.saved.v === 1 ? ctx.saved : null;
  let best = saved && Number.isFinite(saved.best) ? Math.max(0, saved.best) : null;
  let slipBonus = 0; // metres taken off the start gap by hints
  let lastSavedBest = best;

  // ---- DOM
  const status = h('p', { class: 'feedback pu-status', 'aria-live': 'polite' });
  const metres = h('b', { class: 'pu-m' }, '0');
  const mark = h('span', { class: 'pu-mark-him', 'aria-hidden': 'true' });
  const track = h('span', { class: 'pu-track', 'aria-hidden': 'true' }, h('span', { class: 'pu-mark-you' }), h('span', { class: 'pu-lose' }), mark);
  const sprint = h('span', { class: 'pu-sprint', hidden: true }, 'Sprint');
  const meter = h('div', { class: 'pu-meter', role: 'status', 'aria-label': `Gap to ${who}` },
    h('span', { class: 'pu-name' }, who), track, h('span', { class: 'pu-dist' }, metres, h('small', {}, ' m')), sprint);
  const overlay = h('div', { class: 'pu-over' });
  const pauseBtn = h('button', { class: 'pu-tool', type: 'button', 'aria-label': 'Pause', title: 'Pause (P)', onclick: (e) => { e.stopPropagation(); togglePause(); } }, h('span', { class: 'pu-ico-pause', 'aria-hidden': 'true' }));
  const fullBtn = h('button', { class: 'pu-tool pu-expand', type: 'button', 'aria-label': 'Expand to full screen', title: 'Expand', onclick: (e) => { e.stopPropagation(); toggleFull(); } }, h('span', { class: 'pu-ico-full', 'aria-hidden': 'true' }), h('span', { class: 'pu-tool-label' }, 'Expand'));
  const stage = h('div', { class: `pu-stage pu-set-${setting}`, tabindex: '0', role: 'application', 'aria-roledescription': 'chase', 'aria-label': `Foot chase. Swipe or use the arrow keys. Gap to ${who} shown at the top.` },
    h('div', { class: 'pu-hud' }, meter, h('div', { class: 'pu-tools' }, pauseBtn, fullBtn)),
    overlay);
  el.append(
    h('p', { class: 'game-rules' }, `Chase ${who === 'Suspect' ? 'the suspect' : who} down: swipe or use the arrow keys to change lane, jump and slide. Close the gap to tackle him.`),
    p.clue ? h('p', { class: 'pu-clue' }, h('span', { class: 'pu-clue-pin', 'aria-hidden': 'true' }), p.clue) : null,
    stage,
    h('p', { class: 'pu-keys' }, h('span', {}, 'Swipe'), ' or ', h('kbd', {}, '←'), h('kbd', {}, '→'), ' lane · ', h('kbd', {}, '↑'), ' jump · ', h('kbd', {}, '↓'), ' slide'),
    status,
  );

  // ---- run and view
  let run = null;
  let view = null; // the renderer
  let canvas = null;
  let mode = 'idle'; // idle | count | run | paused | catch | won | lost
  let countT = 0, catchT = 0, lostT = 0, wonAt = 0;
  let manualPause = false;
  let lastP = 0;
  let shownM = -1, shownSprint = false;
  let stepAcc = 0;
  const viewState = { mode: 'idle', catchT: 0, lostT: 0 };
  const hooks = { onRowAdd: (r) => view?.rowAdd(r), onRowDrop: (r) => view?.rowDrop(r) };

  function newRun() {
    if (run) run.dispose();
    const seed = Math.floor(ctx.rng() * 4294967296);
    run = createRun({ difficulty, rng: mulberry32(seed), gap: Math.max(8, baseGap - slipBonus), hooks });
    view?.attach(run);
    shownM = -1;
    updateHud(true);
  }

  // ---- renderer (3D, or the plain canvas if WebGL is not there)
  let ctxLostTimer = null;
  const onLost = (e) => { e.preventDefault(); pause('gpu'); clearTimeout(ctxLostTimer); ctxLostTimer = setTimeout(() => switchTo2D(), 1200); };
  const onRestored = () => { clearTimeout(ctxLostTimer); rebuildView(false); resume('gpu'); };
  function makeView(force2d) {
    const c = h('canvas', { class: 'pu-canvas', 'aria-hidden': 'true' });
    stage.prepend(c);
    let v = null;
    if (!force2d && p.renderer !== '2d') {
      try {
        v = createScene3D({ canvas: c, setting, vehicle, reduced, lowPower, seed: Math.floor(ctx.rng() * 1e9) });
        c.addEventListener('webglcontextlost', onLost);
        c.addEventListener('webglcontextrestored', onRestored);
      } catch (err) {
        console.warn('Foot Chase: WebGL unavailable, using the plain view.', err?.message || err);
        v = null;
      }
    }
    if (!v) {
      c.remove();
      const c2 = h('canvas', { class: 'pu-canvas', 'aria-hidden': 'true' });
      stage.prepend(c2);
      v = createScene2D({ canvas: c2, setting, vehicle, reduced });
      canvas = c2;
    } else canvas = c;
    v.onThunder = () => thunder(0.5 + Math.random());
    stage.classList.toggle('is-2d', v.kind === '2d');
    return v;
  }
  function dropView() {
    if (!view) return;
    canvas?.removeEventListener('webglcontextlost', onLost);
    canvas?.removeEventListener('webglcontextrestored', onRestored);
    try { view.destroy(); } catch (err) { console.warn(err); }
    canvas?.remove();
    view = null; canvas = null;
  }
  function rebuildView(force2d) {
    dropView();
    view = makeView(force2d);
    sized = false;
    resize();
    if (run) view.attach(run);
    view.frame(0, viewState);
  }
  function switchTo2D() { if (view?.kind === '2d') return; rebuildView(true); resume('gpu'); }

  view = makeView(false);
  newRun();

  // ---- sizing
  let sized = false, W = 0, H = 0;
  function resize() {
    if (!view) return;
    const r = stage.getBoundingClientRect();
    const w = Math.round(r.width), hh = Math.round(r.height);
    if (!w || !hh) return;
    if (sized && w === W && hh === H) return;
    W = w; H = hh; sized = true;
    view.resize(w, hh, Math.min(window.devicePixelRatio || 1, dprCap));
    if (mode !== 'run') view.frame(0, viewState);
  }
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => resize()) : null;
  if (ro) ro.observe(stage); else window.addEventListener('resize', resize);
  requestAnimationFrame(resize);

  // ---- overlay
  function showOverlay(kind) {
    overlay.replaceChildren();
    overlay.className = `pu-over is-${kind}`;
    overlay.hidden = false;
    if (kind === 'idle') {
      overlay.append(
        h('button', { class: 'pu-start', type: 'button', onclick: (e) => { e.stopPropagation(); start(); } },
          h('span', { class: 'pu-start-big' }, 'Tap to start the chase'),
          h('span', { class: 'pu-start-sub' }, `${who === 'Suspect' ? 'He' : who} is ${Math.round(run.gap)} m ahead and running.`)),
        h('p', { class: 'pu-over-help' }, coarse ? 'Swipe ← → to change lane, ↑ to jump, ↓ to slide.' : 'Arrow keys or WASD. Space jumps. Or click and drag to swipe.'),
        ...(best != null ? [h('p', { class: 'pu-over-best' }, best <= 0 ? 'You caught him before.' : `Closest so far: ${Math.ceil(best)} m.`)] : []));
    } else if (kind === 'count') {
      overlay.append(h('span', { class: 'pu-count', 'aria-live': 'assertive' }, '3'));
    } else if (kind === 'paused') {
      overlay.append(h('button', { class: 'pu-start', type: 'button', onclick: (e) => { e.stopPropagation(); manualPause = false; resume('manual'); } },
        h('span', { class: 'pu-start-big' }, 'Paused'), h('span', { class: 'pu-start-sub' }, 'Tap to carry on')));
    } else if (kind === 'lost') {
      const retry = h('button', { class: 'btn btn--primary pu-retry', type: 'button', onclick: (e) => { e.stopPropagation(); retryRun(); } }, 'Retry');
      overlay.append(h('div', { class: 'pu-card' },
        h('p', { class: 'pu-big' }, 'He’s gone.'),
        h('p', { class: 'pu-sub' }, `${who === 'Suspect' ? 'The suspect' : who} lost you in the rain. Run clean to close in; teh tarik gives a sprint.`),
        retry));
      setTimeout(() => { if (retry.isConnected) retry.focus({ preventScroll: true }); }, 60);
    } else if (kind === 'won') {
      overlay.append(h('div', { class: 'pu-card is-won' },
        h('p', { class: 'pu-big' }, 'Got him.'),
        h('p', { class: 'pu-sub' }, `${who === 'Suspect' ? 'The suspect' : who} is down on the ${SURFACE[setting]}. Cuffs on.`)));
    }
  }
  function hideOverlay() { overlay.hidden = true; overlay.replaceChildren(); }
  function say(t, kind = '') { status.textContent = t; status.className = `feedback pu-status${kind ? ` is-${kind}` : ''}`; }

  // ---- HUD
  function updateHud(force = false) {
    const g = run ? run.gap : baseGap;
    const m = Math.max(0, Math.ceil(g));
    if (force || m !== shownM) {
      shownM = m;
      metres.textContent = String(m);
      const frac = Math.max(0, Math.min(1, g / run.maxGap));
      mark.style.left = `${(frac * 100).toFixed(1)}%`;
      meter.classList.toggle('is-close', g < 8);
      meter.classList.toggle('is-far', frac > 0.78);
      meter.setAttribute('aria-label', `${who}: ${m} metres ahead`);
    }
    const sp = !!run && run.sprintT > 0 && mode === 'run';
    if (sp !== shownSprint) { shownSprint = sp; sprint.hidden = !sp; meter.classList.toggle('is-sprint', sp); }
  }
  function report() {
    if (!run) return;
    const c = Math.min(0.99, run.closed());
    if (c >= lastP + 0.04) { lastP = c; ctx.onProgress(c); } // the puzzle screen redraws its fog on each report
    const b = Math.round(run.best * 10) / 10;
    if (best == null || b < best) best = b;
    if (lastSavedBest == null || best <= lastSavedBest - 10) persist();
  }
  function persist() { lastSavedBest = best; ctx.onSave({ v: 1, best }); }

  // ---- sound: footsteps on wet ground, made on the shared AudioContext
  let noiseBuf = null;
  function footstep(splash) {
    if (!state().settings?.sound) return;
    const ac = audioContext();
    if (!ac || ac.state !== 'running') return;
    if (!noiseBuf) {
      noiseBuf = ac.createBuffer(1, Math.floor(ac.sampleRate * 0.09), ac.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2.5);
    }
    const vol = Number.isFinite(Number(state().settings.sfxVolume)) ? Number(state().settings.sfxVolume) : 0.8;
    const src = ac.createBufferSource();
    src.buffer = noiseBuf;
    src.playbackRate.value = 0.8 + Math.random() * 0.4;
    const f = ac.createBiquadFilter();
    f.type = splash ? 'bandpass' : 'lowpass';
    f.frequency.value = splash ? 2200 + Math.random() * 900 : 700;
    const gn = ac.createGain();
    gn.gain.value = (splash ? 0.05 : 0.09) * vol;
    src.connect(f).connect(gn).connect(ac.destination);
    src.start();
  }

  // ---- game flow
  const duck = () => { try { app.music?.duck?.(0.55, 0.6); } catch { /* no music */ } };
  const unduck = () => { try { app.music?.unduck?.(1.2); } catch { /* no music */ } };
  function start() {
    unlock();
    try { app.music?.unlock?.(); } catch { /* fine */ }
    if (mode !== 'idle') return;
    hideOverlay();
    countIn();
    stage.focus({ preventScroll: true });
  }
  function countIn() {
    mode = 'count';
    countT = reduced ? 1.6 : 2.4;
    showOverlay('count');
    duck();
  }
  function retryRun() {
    if (mode !== 'lost') return;
    sfx.click();
    newRun();
    say('');
    countIn();
    stage.focus({ preventScroll: true });
  }
  const reasons = new Set();
  function pause(reason) {
    reasons.add(reason);
    if (mode === 'run' || mode === 'count') {
      mode = 'paused';
      showOverlay('paused');
      unduck();
    }
  }
  function resume(reason) {
    reasons.delete(reason);
    if (mode === 'paused' && reasons.size === 0 && !manualPause) { hideOverlay(); countIn(); }
  }
  function togglePause() {
    if (mode === 'run' || mode === 'count') { manualPause = true; pause('manual'); } else if (mode === 'paused') { manualPause = false; resume('manual'); } else if (mode === 'idle') start();
  }
  function triggerCatch() {
    mode = 'catch';
    catchT = 0;
    hideOverlay();
    say(`You close in on ${who === 'Suspect' ? 'him' : who}...`);
    ctx.onProgress(0.99);
    best = 0;
    persist();
  }
  function won() {
    mode = 'won';
    wonAt = performance.now();
    showOverlay('won');
    say(`Got him. ${who === 'Suspect' ? 'The suspect' : who} is in cuffs.`, 'good');
    unduck();
    ctx.onSolved();
  }

  function onEvent(e) {
    view?.event(e);
    switch (e.type) {
      case 'hit':
        sfx.bad();
        stage.classList.remove('is-hit'); void stage.offsetWidth; stage.classList.add('is-hit');
        say(`Stumble! ${who === 'Suspect' ? 'He' : who} gains ${Math.round(D.hitCost + D.drift * D.stumbleT)} m.`, 'bad');
        if (navigator.vibrate && coarse && !reduced) { try { navigator.vibrate(40); } catch { /* not allowed */ } }
        break;
      case 'pickup': sfx.good(); say('Teh tarik. Sprint!', 'good'); break;
      case 'throw': if (e.row && run.suspect.ahead > e.row.dist - run.dist + 2) { sfx.stamp(); say('He knocks something into your path!'); } break;
      case 'edge': sfx.click(); break;
      case 'caught': triggerCatch(); break;
      case 'lost':
        mode = 'lost'; lostT = 0;
        sfx.bad();
        report(); persist();
        say(`He's gone. Retry when you are ready.`, 'bad');
        unduck();
        setTimeout(() => { if (mode === 'lost') showOverlay('lost'); }, reduced ? 50 : 700);
        break;
      default:
    }
  }

  // ---- input
  function act(a) {
    if (mode === 'run') run.input(a);
    else if (mode === 'idle' && (a === 'jump')) start();
  }
  const KEYMAP = { ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right', ArrowUp: 'jump', w: 'jump', W: 'jump', ' ': 'jump', ArrowDown: 'slide', s: 'slide', S: 'slide' };
  let visible = true;
  const onKey = (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    if (!el.isConnected || isHowToOpen()) return;
    if (e.key === 'Escape' && (fsFallback || document.fullscreenElement === stage)) { e.preventDefault(); exitFull(); return; }
    const inStage = t && stage.contains(t);
    const playing = mode === 'run' || mode === 'count' || mode === 'paused';
    if (e.key === 'p' || e.key === 'P') { if (playing || mode === 'idle') { e.preventDefault(); togglePause(); } return; }
    const a = KEYMAP[e.key];
    if (!a) {
      if (e.key === 'Enter' && mode === 'idle' && (inStage || visible)) { e.preventDefault(); start(); }
      return;
    }
    if (t && t.tagName === 'BUTTON' && !inStage && (e.key === ' ')) return; // let Space press other buttons
    if (playing || inStage || (mode === 'idle' && visible)) e.preventDefault();
    else return;
    if (e.repeat) return;
    if (mode === 'paused' && manualPause && a === 'jump') { manualPause = false; resume('manual'); return; }
    if (mode === 'lost' && a === 'jump') { retryRun(); return; }
    act(a);
  };
  document.addEventListener('keydown', onKey);

  // swipes: fire as soon as the finger has moved far enough, so a fast flick is never late
  let ptr = null;
  const onDown = (e) => {
    if (e.button > 0 || (e.target.closest && e.target.closest('button'))) return;
    ptr = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), fired: 0, moved: false };
    try { stage.setPointerCapture(e.pointerId); } catch { /* fine */ }
  };
  const onMove = (e) => {
    if (!ptr || e.pointerId !== ptr.id) return;
    const dx = e.clientX - ptr.x, dy = e.clientY - ptr.y;
    const th = Math.max(18, Math.min(42, stage.clientWidth * 0.06));
    if (Math.abs(dx) < th && Math.abs(dy) < th) return;
    ptr.moved = true;
    if (ptr.fired >= 3) return;
    const a = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'jump' : 'slide');
    ptr.x = e.clientX; ptr.y = e.clientY; // a turn in the same touch chains (left, then up); a long drag is one swipe
    if (a === ptr.last) return;
    ptr.last = a;
    ptr.fired++;
    if (mode === 'idle') { start(); return; }
    act(a);
  };
  const onUp = (e) => {
    if (!ptr || e.pointerId !== ptr.id) return;
    const tap = !ptr.moved && !ptr.fired && performance.now() - ptr.t < 500;
    ptr = null;
    if (!tap) return;
    if (mode === 'idle') start();
    else if (mode === 'paused' && manualPause) { manualPause = false; resume('manual'); }
    else if (mode === 'lost' && !overlay.hidden) retryRun();
  };
  const onCancel = () => { ptr = null; };
  stage.addEventListener('pointerdown', onDown);
  stage.addEventListener('pointermove', onMove);
  stage.addEventListener('pointerup', onUp);
  stage.addEventListener('pointercancel', onCancel);
  const noMenu = (e) => e.preventDefault();
  stage.addEventListener('contextmenu', noMenu);

  // ---- pause triggers: hidden tab, window blur, the How-to card, scrolled out of view
  const onVis = () => (document.hidden ? pause('hidden') : resume('hidden'));
  const onBlur = () => pause('blur');
  const onFocus = () => resume('blur');
  document.addEventListener('visibilitychange', onVis);
  window.addEventListener('blur', onBlur);
  window.addEventListener('focus', onFocus);
  let io = null;
  if (typeof IntersectionObserver === 'function') {
    io = new IntersectionObserver((ents) => {
      for (const en of ents) {
        visible = en.intersectionRatio >= 0.35 || !!fsFallback || document.fullscreenElement === stage;
        if (visible) resume('offscreen'); else pause('offscreen');
      }
    }, { threshold: [0, 0.35, 0.6] });
    io.observe(stage);
  }

  // ---- full screen (Fullscreen API, else a fixed layer in #overlay so phone Back closes it)
  let fsFallback = null, fsMarker = null;
  function toggleFull() { if (document.fullscreenElement === stage || fsFallback) exitFull(); else enterFull(); }
  function enterFull() {
    const fallback = () => {
      const host = document.getElementById('overlay') || document.body;
      fsMarker = document.createComment('pursuit');
      stage.before(fsMarker);
      fsFallback = h('div', { class: 'modal-backdrop pu-fs-layer', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Foot chase, full screen' });
      host.append(fsFallback);
      fsFallback.append(stage);
      stage.classList.add('is-full');
      onFull();
      stage.focus({ preventScroll: true });
    };
    if (stage.requestFullscreen && document.fullscreenEnabled !== false) {
      stage.requestFullscreen({ navigationUI: 'hide' }).then(() => { try { screen.orientation?.lock?.('portrait').catch(() => {}); } catch { /* not allowed */ } }).catch(fallback);
    } else fallback();
  }
  function exitFull() {
    if (document.fullscreenElement === stage) { document.exitFullscreen?.().catch(() => {}); return; }
    if (fsFallback) {
      stage.classList.remove('is-full');
      if (fsMarker?.parentNode) fsMarker.replaceWith(stage); else el.append(stage);
      fsFallback.remove();
      fsFallback = fsMarker = null;
      onFull();
    }
  }
  function onFull() {
    const on = document.fullscreenElement === stage || !!fsFallback;
    stage.classList.toggle('is-fs', on);
    fullBtn.setAttribute('aria-label', on ? 'Leave full screen' : 'Expand to full screen');
    fullBtn.lastChild.textContent = on ? 'Exit' : 'Expand';
    if (on) { visible = true; resume('offscreen'); }
    sized = false;
    requestAnimationFrame(resize);
  }
  document.addEventListener('fullscreenchange', onFull);

  // ---- the loop
  let raf = 0, last = performance.now(), slowFor = 0, idleSkip = 0, destroyed = false;
  let frameMs = 0;
  function tick(now) {
    raf = requestAnimationFrame(tick);
    const dt = turbo ? Math.min(0.5, Math.max(0, (now - last) / 1000)) * turbo : Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    if (!view || !run) return;
    if (isHowToOpen()) pause('howto'); else if (reasons.has('howto')) resume('howto');
    const t0 = performance.now();
    if (mode === 'count') {
      countT -= dt;
      const n = Math.ceil(countT / (reduced ? 0.53 : 0.8));
      const c = overlay.querySelector('.pu-count');
      if (c && c.textContent !== String(Math.max(1, n))) { c.textContent = String(Math.max(1, n)); sfx.key(); }
      if (countT <= 0) { mode = 'run'; hideOverlay(); say(''); last = now; }
    } else if (mode === 'run') {
      const n = Math.max(1, Math.ceil(dt / (1 / 40)));
      for (let i = 0; i < n && mode === 'run'; i++) {
        run.step(dt / n);
        for (let j = 0; j < run.events.length; j++) onEvent(run.events[j]);
        run.events.length = 0;
      }
      if (mode === 'run' && !run.air && run.slideT <= 0) {
        stepAcc += (dt * run.speed) / 2.3;
        if (stepAcc >= 1) { stepAcc -= 1; footstep(Math.random() < 0.35); }
      }
      report();
    } else if (mode === 'catch') {
      catchT += dt;
      if (catchT > 0.5 && catchT - dt <= 0.5) sfx.stamp();
      if (catchT >= (reduced ? 0.7 : 1.7)) won();
    } else if (mode === 'lost') lostT += dt;
    updateHud();
    // draw: every frame while running; gently when idle; stop when nothing moves
    const drawNow = mode === 'run' || mode === 'count' || mode === 'catch' || mode === 'lost'
      || (mode === 'idle' && visible && !document.hidden && (idleSkip = (idleSkip + 1) % 2) === 0)
      || (mode === 'won' && now - wonAt < 2500);
    if (drawNow && visible) {
      viewState.mode = mode === 'won' ? 'catch' : mode; viewState.catchT = mode === 'won' ? 2 : catchT; viewState.lostT = lostT;
      view.frame(mode === 'idle' ? dt * 2 : dt, viewState);
      // a phone that cannot keep up gets fewer pixels
      frameMs = frameMs * 0.92 + (performance.now() - t0) * 0.08;
      if (mode === 'run' && dprCap > 1 && dt > 0.028) { slowFor += dt; if (slowFor > 2.5) { dprCap = 1; sized = false; resize(); } } else slowFor = Math.max(0, slowFor - dt * 0.5);
    }
  }
  showOverlay('idle');
  updateHud(true);
  raf = requestAnimationFrame(tick);
  if (isDev()) el.__pursuit = { get run() { return run; }, get mode() { return mode; }, info: () => ({ ...view?.info?.(), kind: view?.kind, frameMs, dprCap, W, H }), start, view: () => view };

  return {
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cancelAnimationFrame(raf);
      clearTimeout(ctxLostTimer);
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('visibilitychange', onVis);
      document.removeEventListener('fullscreenchange', onFull);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('resize', resize);
      stage.removeEventListener('pointerdown', onDown);
      stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerup', onUp);
      stage.removeEventListener('pointercancel', onCancel);
      stage.removeEventListener('contextmenu', noMenu);
      ro?.disconnect();
      io?.disconnect();
      if (document.fullscreenElement === stage) document.exitFullscreen?.().catch(() => {});
      if (fsFallback) { fsFallback.remove(); fsFallback = null; }
      if (run) { report(); run.dispose(); }
      dropView();
      run = null;
      unduck();
      if (el.__pursuit) delete el.__pursuit;
    },
    hint() {
      if (mode === 'catch' || mode === 'won') return null;
      const tip = TIPS[slipBonus / 10 % TIPS.length | 0];
      slipBonus += 10;
      const slipText = `${who === 'Suspect' ? 'He' : who} slips on the ${SURFACE[setting]}: 10 m closer.`;
      if (run && (mode === 'run' || mode === 'count' || mode === 'paused')) run.slip(10);
      else if (run && (mode === 'idle' || mode === 'lost')) { run.gap = Math.max(8, baseGap - slipBonus); run.best = Math.min(run.best, run.gap); if (mode === 'idle') showOverlay('idle'); }
      updateHud(true);
      say(slipText, 'good');
      return `${slipText} Tip: ${tip}`;
    },
    devSolve() {
      if (mode === 'catch' || mode === 'won') return;
      if (mode === 'lost') newRun();
      if (mode !== 'run') { hideOverlay(); mode = 'run'; }
      run.gap = 0; run.best = 0; run.status = 'caught';
      triggerCatch();
    },
  };
}
