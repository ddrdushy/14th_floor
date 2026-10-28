// Foot Chase: an action mini game, a long night chase in the monsoon after a suspect on foot (or on
// a scooter). First person by default, like the mobile runners: no lanes, you steer freely across
// the street through obstacles scattered at random, jump low things, slide under high ones. The
// chase runs in LEGS through different places; each leg ends with him breaking away (over a wall,
// through a shop, off a ledge) and a line of story; the last leg ends with the tackle.
// A leg is a checkpoint: losing him restarts that leg only, and a reload resumes there.
//
// params (all optional):
//   setting     where the chase starts and the default route: 'city' (KL back lanes, default) |
//               'market' (Chow Kit) | 'docks' (Port Klang) | 'heritage' (George Town) |
//               'kampung' (Kampung Baru) | 'rooftop' (KL roofs) | 'estate' (oil palm and rubber, in mist)
//   route       array of settings, one per leg, e.g. ['city', 'market', 'rooftop', 'city']
//   legs        number of legs (default 6, or route.length); each is two to three minutes
//   beats       array of one-line story beats shown between legs (default: lines that fit the places)
//   vehicle     'foot' (default) | 'scooter'
//   difficulty  'easy' (default, about 10-12 minutes) | 'medium' (about 15-20) | 'hard' (about 18-22):
//               speed, density, set-pieces and reaction windows, tightening leg by leg
//   gap         start gap of every leg in metres (default from the difficulty)
//   suspect     name on the gap meter, e.g. 'Rizal' (default 'Suspect')
//   clue        story note pinned above the street
//   renderer    'auto' (default) | '2d': force the plain canvas view
//
// Save: { v: 2, leg, best } (the leg to resume at, and the closest you came on it).
import '../styles/games-d/pursuit.css';
import { h, isDev } from '../core/ui.js';
import { sfx, unlock, audioContext, thunder } from '../core/audio.js';
import { state } from '../core/state.js';
import { app } from '../core/app.js';
import { isHowToOpen } from '../core/howto.js';
import { put, svg, rect, text, arrow, C } from '../core/howto-kit.js';
import { mulberry32 } from '../core/rng.js';
import { createRun, legSpec, makeRoute, CURVE, X_MAX, SETTING_LIST } from './pursuit-logic.js';
import { createScene3D } from './pursuit-scene.js';
import { createScene2D } from './pursuit-2d.js';

export const meta = { id: 'pursuit', name: 'Foot Chase', category: 'Action' };
export const demo = {
  params: { setting: 'city', vehicle: 'foot', difficulty: 'easy', suspect: 'Rizal', legs: 4, clue: 'Practice run. In a case, a clue from the story is pinned here.' },
};

const PLACE = { city: 'Back lanes', market: 'The market', docks: 'The docks', heritage: 'Old town', kampung: 'The kampung', rooftop: 'The rooftops', estate: 'The estate' };
const SURFACE = { city: 'wet tar', market: 'cabbage leaves', docks: 'oily concrete', heritage: 'wet tiles', kampung: 'wet planks', rooftop: 'wet roof', estate: 'red mud' };
const ESCAPE = { city: 'vault', market: 'shop', docks: 'vault', heritage: 'shop', kampung: 'vault', rooftop: 'ledge', estate: 'vault' };
const ESCAPE_LINE = { vault: 'He goes over a wall like he has done it all his life.', shop: 'He ducks through a shop and out of the back.', ledge: 'He drops off the edge of the roof onto a lorry tarp.' };
const BEAT_TO = {
  city: 'Over a wall and down into the back lanes. He knows them. So, by now, do you.',
  market: 'Through a kitchen and out into the market lanes, between the shuttered stalls.',
  rooftop: 'Up the fire stairs two at a time, and out onto the roofs, wet as a riverbed.',
  docks: 'Down a loading ramp toward the cranes: containers, puddles, sodium light.',
  heritage: 'Into the old shophouse lanes, under the five-foot ways and the lanterns.',
  kampung: 'Across the road and into the wooden houses of the kampung, on the planks.',
  estate: 'Past the last streetlight and into the estate. Palms in rows, and the mist.',
};
const TIPS = [
  'Look for the gap ahead, not the thing in front of you. Steer early and gently.',
  'Low things you jump. Anything hanging at head height you slide under.',
  'A cup of teh tarik gives a few seconds of sprint. It is worth a detour.',
  'At a fork he takes the shorter, rougher way. Follow him and you gain on him.',
];
const reducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const store = { get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } } };
const named = (p) => (p.suspect ? String(p.suspect) : 'the suspect');

export const howTo = {
  goal: ({ params }) => `Chase ${named(params)} through the rain, place after place, and tackle him at the end.`,
  steps: [
    'Tap to start. Drag left and right (or hold ← →) to steer between whatever is in the way.',
    'Swipe up (↑ or Space) to jump low things and drains. Swipe down (↓) to slide under things at head height.',
    'Run clean to close the gap. Each time you reach him he breaks away to a new place; that is a checkpoint.',
    'Lose him and only that stretch starts again. Catch him in the last one to finish.',
  ],
  example: {
    caption: 'No lanes: read the gaps. Drag to steer round the bike and the pole, swipe up for the crate.',
    render(el) {
      let s = rect(0, 0, 300, 170, { fill: '#1c2e36', stroke: 'none', sw: 0, rx: 4 });
      s += '<path d="M118 22 L182 22 L290 168 L10 168 Z" fill="#242c30"/>';
      s += rect(96, 70, 8, 40, { fill: '#59636a', stroke: 'none', sw: 0 }) + rect(186, 52, 6, 50, { fill: '#59636a', stroke: 'none', sw: 0 });
      s += rect(148, 92, 46, 18, { fill: '#b87a3a', stroke: C.ink, sw: 1.5 });
      s += '<circle cx="150" cy="40" r="5" fill="#cc2a32"/>';
      s += '<path d="M150 160 C 150 130, 128 120, 130 100 S 160 70, 150 46" fill="none" stroke="#e8a33d" stroke-width="3" stroke-dasharray="6 5"/>';
      s += arrow(150, 150, 110, 150, { color: C.amber, sw: 3.5, head: 10 }) + arrow(150, 150, 190, 150, { color: C.amber, sw: 3.5, head: 10 });
      s += arrow(212, 120, 212, 92, { color: C.red, sw: 3.5, head: 10 });
      s += text(150, 166, 'drag', { size: 12, fill: C.amber, weight: 700 }) + text(232, 112, 'jump', { size: 12, fill: '#f0a0a0', weight: 700, anchor: 'start' });
      put(el, svg(300, 170, s, 'A street with a pole, a bike and a crate; a dotted line weaves between them toward the suspect'));
    },
  },
  tips: [
    'Look for the gap ahead, not at the thing in front of you.',
    'If he gets away, only that stretch starts again. Nothing else is lost.',
  ],
  controls: {
    touch: 'Drag sideways to steer, swipe up to jump, down to slide. Tilt steering can be switched on. The eye button swaps first and third person.',
    keys: 'Hold ← → or A D to steer, ↑ W or Space to jump, ↓ or S to slide, P pauses, C swaps the camera.',
  },
};

export function mount(el, ctx) {
  const p = { ...(ctx.params || {}) };
  const q = new URLSearchParams(location.search);
  if (isDev()) for (const k of ['setting', 'vehicle', 'difficulty', 'renderer', 'legs', 'skyline']) if (q.get(k)) p[k] = q.get(k);
  const turbo = isDev() ? Math.max(0, Number(q.get('turbo')) || 0) : 0;
  const setting = SETTING_LIST.includes(p.setting) ? p.setting : 'city';
  const vehicle = p.vehicle === 'scooter' ? 'scooter' : 'foot';
  const difficulty = CURVE[p.difficulty] ? p.difficulty : 'easy';
  const route = makeRoute(setting, p.legs ?? (Array.isArray(p.route) ? p.route.length : 6), p.route);
  const LEGS = route.length;
  const beats = route.map((st, i) => (Array.isArray(p.beats) && p.beats[i - 1]) || BEAT_TO[st]);
  const gapOverride = Number(p.gap) > 0 ? Math.min(400, Number(p.gap)) : undefined;
  // whose skyline is on the horizon: 'kl' (default), 'penang', 'colombo', or 'town' (no landmark)
  const skyline = ['kl', 'penang', 'colombo', 'town'].includes(p.skyline) ? p.skyline : 'kl';
  const who = p.suspect ? String(p.suspect) : 'Suspect';
  const He = who === 'Suspect' ? 'He' : who;
  const reduced = reducedMotion();
  const coarse = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
  const smallScreen = Math.min(screen?.width || innerWidth, screen?.height || innerHeight) < 820;
  const lowPower = !!(coarse && smallScreen);
  const lowEnd = (navigator.deviceMemory && navigator.deviceMemory <= 3) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4 && coarse);
  let dprCap = lowEnd ? 1 : 1.5;
  let pov = store.get('floor14.pursuit.view') !== 'third' && q.get('pov') !== '0';
  const canTilt = coarse && typeof DeviceOrientationEvent !== 'undefined';
  let tilt = canTilt && store.get('floor14.pursuit.tilt') === '1';

  const saved = ctx.saved && typeof ctx.saved === 'object' && ctx.saved.v === 2 ? ctx.saved : null;
  let leg = saved && Number.isInteger(saved.leg) ? Math.max(0, Math.min(LEGS - 1, saved.leg)) : 0;
  if (isDev() && q.get('leg')) leg = Math.max(0, Math.min(LEGS - 1, Number(q.get('leg')) - 1));
  let best = saved && Number.isFinite(saved.best) ? Math.max(0, saved.best) : null;
  let slipBonus = 0;

  // ---- DOM
  const status = h('p', { class: 'feedback pu-status', 'aria-live': 'polite' });
  const metres = h('b', { class: 'pu-m' }, '0');
  const fillBar = h('i', { class: 'pu-fill' });
  const legTag = h('span', { class: 'pu-leg' });
  const sprint = h('span', { class: 'pu-sprint', hidden: true }, 'Sprint');
  const meter = h('div', { class: 'pu-meter', role: 'status', 'aria-label': `Gap to ${who}` },
    h('div', { class: 'pu-meter-top' }, metres, h('small', {}, ' m'), h('span', { class: 'pu-name' }, who), legTag),
    h('span', { class: 'pu-line', 'aria-hidden': 'true' }, fillBar), sprint);
  const overlay = h('div', { class: 'pu-over' });
  const tool = (cls, label, title, onclick, ...kids) => h('button', { class: `pu-tool ${cls}`, type: 'button', 'aria-label': label, title, onclick: (e) => { e.stopPropagation(); onclick(); } }, ...kids);
  const pauseBtn = tool('pu-pause', 'Pause', 'Pause (P)', () => togglePause(), h('span', { class: 'pu-ico-pause', 'aria-hidden': 'true' }));
  const camBtn = tool('pu-cam', 'Switch camera', 'First / third person (C)', () => setPov(!pov), h('span', { class: 'pu-ico-eye', 'aria-hidden': 'true' }));
  const tiltBtn = canTilt ? tool('pu-tilt', 'Tilt steering', 'Steer by tilting', () => setTilt(!tilt), h('span', { class: 'pu-ico-tilt', 'aria-hidden': 'true' })) : null;
  const fullBtn = tool('pu-expand', 'Expand to full screen', 'Expand', () => toggleFull(), h('span', { class: 'pu-ico-full', 'aria-hidden': 'true' }));
  const vignette = h('div', { class: 'pu-vignette', 'aria-hidden': 'true' });
  const stage = h('div', { class: `pu-stage pu-set-${route[leg]}`, tabindex: '0', role: 'application', 'aria-roledescription': 'chase', 'aria-label': `Foot chase. Drag or hold the arrow keys to steer. Gap to ${who} shown at the top left.` },
    vignette,
    h('div', { class: 'pu-hud' }, meter, h('div', { class: 'pu-tools' }, pauseBtn, camBtn, tiltBtn, fullBtn)),
    overlay);
  el.append(
    h('p', { class: 'game-rules' }, `Chase ${named(p)} down: steer between whatever is in the way, jump and slide. Close the gap to tackle him.`),
    p.clue ? h('p', { class: 'pu-clue' }, h('span', { class: 'pu-clue-pin', 'aria-hidden': 'true' }), p.clue) : null,
    stage,
    h('p', { class: 'pu-keys' }, 'Hold ', h('kbd', {}, '←'), h('kbd', {}, '→'), ' steer · ', h('kbd', {}, '↑'), ' jump · ', h('kbd', {}, '↓'), ' slide · ', h('kbd', {}, 'C'), ' camera'),
    status,
  );

  // ---- run and view
  let run = null, view = null, canvas = null;
  let mode = 'idle'; // idle | count | run | paused | escape | beat | catch | won | lost
  let countT = 0, catchT = 0, lostT = 0, escT = 0, wonAt = 0, beatT = 0;
  let manualPause = false, lastP = 0, shownM = -1, shownSprint = false, stepAcc = 0;
  const viewState = { mode: 'idle', catchT: 0, lostT: 0, escT: 0, escKind: 'vault' };
  const hooks = { onAdd: (o) => view?.onAdd(o), onDrop: (o) => view?.onDrop(o) };

  function newRun() {
    if (run) run.dispose();
    const seed = Math.floor(ctx.rng() * 4294967296);
    const spec = legSpec(difficulty, leg, LEGS, route[leg]);
    const g = gapOverride ?? spec.gap;
    run = createRun({ spec, rng: mulberry32(seed), gap: Math.max(8, g - slipBonus), hooks });
    view?.attach(run);
    shownM = -1;
    legTag.textContent = LEGS > 1 ? `${leg + 1}/${LEGS}` : '';
    updateHud(true);
  }
  function loadLeg(i) {
    leg = i;
    stage.className = stage.className.replace(/pu-set-\w+/, `pu-set-${route[leg]}`);
    view?.load(route[leg]);
    newRun();
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
        v = createScene3D({ canvas: c, vehicle, reduced, lowPower, seed: Math.floor(ctx.rng() * 1e9), pov, skyline });
        c.addEventListener('webglcontextlost', onLost);
        c.addEventListener('webglcontextrestored', onRestored);
      } catch (err) { console.warn('Foot Chase: WebGL unavailable, using the plain view.', err?.message || err); v = null; }
    }
    if (!v) {
      c.remove();
      const c2 = h('canvas', { class: 'pu-canvas', 'aria-hidden': 'true' });
      stage.prepend(c2);
      v = createScene2D({ canvas: c2, setting: route[leg], vehicle, reduced });
      canvas = c2;
    } else canvas = c;
    v.onThunder = () => thunder(0.5 + Math.random());
    v.load(route[leg]);
    stage.classList.toggle('is-2d', v.kind === '2d');
    camBtn.hidden = v.kind === '2d';
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
  function setPov(on) {
    pov = !!on;
    store.set('floor14.pursuit.view', pov ? 'pov' : 'third');
    view?.setPov(pov);
    camBtn.classList.toggle('is-on', !pov);
    camBtn.setAttribute('aria-label', pov ? 'Switch to third person' : 'Switch to first person');
    if (mode !== 'run') view?.frame(0, viewState);
  }

  view = makeView(false);
  newRun();
  setPov(pov);

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
      const resume = leg > 0;
      overlay.append(
        h('button', { class: 'pu-start', type: 'button', onclick: (e) => { e.stopPropagation(); start(); } },
          h('span', { class: 'pu-start-kicker' }, LEGS > 1 ? `${resume ? 'Checkpoint · ' : ''}${PLACE[route[leg]]} · ${leg + 1} of ${LEGS}` : PLACE[route[leg]]),
          h('span', { class: 'pu-start-big' }, resume ? 'Tap to pick up the chase' : 'Tap to start the chase'),
          h('span', { class: 'pu-start-sub' }, `${He} is ${Math.round(run.gap)} m ahead and running.`)),
        h('p', { class: 'pu-over-help' }, coarse ? 'Drag sideways to steer. Swipe up to jump, down to slide.' : 'Hold ← → or A D to steer. ↑ or Space jumps, ↓ slides. Or drag with the mouse.'),
        ...(best != null && best > 0 ? [h('p', { class: 'pu-over-best' }, `Closest on this stretch: ${Math.ceil(best)} m.`)] : []));
    } else if (kind === 'count') {
      overlay.append(h('span', { class: 'pu-count', 'aria-live': 'assertive' }, '3'));
    } else if (kind === 'paused') {
      overlay.append(h('button', { class: 'pu-start', type: 'button', onclick: (e) => { e.stopPropagation(); manualPause = false; resume('manual'); } },
        h('span', { class: 'pu-start-big' }, 'Paused'), h('span', { class: 'pu-start-sub' }, 'Tap to carry on')));
    } else if (kind === 'beat') {
      const next = leg; // already advanced
      overlay.append(h('button', { class: 'pu-beat', type: 'button', onclick: (e) => { e.stopPropagation(); endBeat(); } },
        h('span', { class: 'pu-start-kicker' }, `${PLACE[route[next]]} · ${next + 1} of ${LEGS}`),
        h('span', { class: 'pu-beat-line' }, beats[next]),
        h('span', { class: 'pu-beat-save' }, 'Checkpoint. Tap to run on.')));
    } else if (kind === 'lost') {
      const retry = h('button', { class: 'btn btn--primary pu-retry', type: 'button', onclick: (e) => { e.stopPropagation(); retryRun(); } }, 'Retry this stretch');
      overlay.append(h('div', { class: 'pu-card' },
        h('p', { class: 'pu-big' }, 'He’s gone.'),
        h('p', { class: 'pu-sub' }, `${He === 'He' ? 'He' : He} lost you in the rain. ${LEGS > 1 ? 'Only this stretch starts again.' : 'Run clean to close in.'}`),
        retry));
      setTimeout(() => { if (retry.isConnected) retry.focus({ preventScroll: true }); }, 60);
    } else if (kind === 'won') {
      overlay.append(h('div', { class: 'pu-card is-won' },
        h('p', { class: 'pu-big' }, 'Got him.'),
        h('p', { class: 'pu-sub' }, `${He === 'He' ? 'The suspect' : He} is down on the ${SURFACE[route[leg]]}. Cuffs on.`)));
    }
  }
  function hideOverlay() { overlay.hidden = true; overlay.replaceChildren(); }
  function say(t, kind = '') { status.textContent = t; status.className = `feedback pu-status${kind ? ` is-${kind}` : ''}`; }

  // ---- HUD
  function updateHud(force = false) {
    const g = run ? run.gap : 0;
    const m = Math.max(0, Math.ceil(g));
    if (force || m !== shownM) {
      shownM = m;
      metres.textContent = String(m);
      const frac = Math.max(0, Math.min(1, g / run.maxGap));
      fillBar.style.transform = `scaleX(${(1 - frac).toFixed(3)})`;
      meter.classList.toggle('is-close', g < 8);
      meter.classList.toggle('is-far', frac > 0.8);
      meter.setAttribute('aria-label', `${who}: ${m} metres ahead${LEGS > 1 ? `, stretch ${leg + 1} of ${LEGS}` : ''}`);
    }
    const sp = !!run && run.sprintT > 0 && mode === 'run';
    if (sp !== shownSprint) { shownSprint = sp; sprint.hidden = !sp; meter.classList.toggle('is-sprint', sp); }
  }
  function report() {
    if (!run) return;
    const c = Math.min(0.99, (leg + run.closed()) / LEGS);
    if (c >= lastP + 0.02) { lastP = c; ctx.onProgress(c); } // the puzzle screen redraws its fog on each report
    const b = Math.round(run.best * 10) / 10;
    if (best == null || b < best) best = b;
  }
  const persist = () => ctx.onSave({ v: 2, leg, best });

  // ---- sound: footsteps on wet ground, on the shared AudioContext
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
    gn.gain.value = (splash ? 0.06 : 0.09) * vol;
    src.connect(f).connect(gn).connect(ac.destination);
    src.start();
  }

  // ---- flow
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
  function countIn() { mode = 'count'; countT = reduced ? 1.6 : 2.4; showOverlay('count'); duck(); }
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
    if (mode === 'run' || mode === 'count') { mode = 'paused'; showOverlay('paused'); unduck(); held.l = held.r = false; applyHeld(); }
  }
  function resume(reason) {
    reasons.delete(reason);
    if (mode === 'paused' && reasons.size === 0 && !manualPause) { hideOverlay(); countIn(); }
  }
  function togglePause() {
    if (mode === 'run' || mode === 'count') { manualPause = true; pause('manual'); } else if (mode === 'paused') { manualPause = false; resume('manual'); } else if (mode === 'idle') start();
  }
  function triggerCatch() {
    mode = 'catch'; catchT = 0;
    hideOverlay();
    say(`You close in on ${He === 'He' ? 'him' : He}...`);
    ctx.onProgress(0.99);
    best = 0;
    persist();
  }
  function won() {
    mode = 'won'; wonAt = performance.now();
    showOverlay('won');
    say(`Got him. ${He === 'He' ? 'The suspect' : He} is in cuffs.`, 'good');
    unduck();
    ctx.onSolved();
  }
  function escapeLeg() {
    mode = 'escape'; escT = 0;
    viewState.escKind = ESCAPE[route[leg]];
    say(`You almost have him. ${ESCAPE_LINE[viewState.escKind]}`);
    sfx.stamp();
  }
  function startBeat() {
    mode = 'beat'; beatT = 0;
    const next = Math.min(LEGS - 1, leg + 1);
    best = null; slipBonus = 0;
    leg = next;
    showOverlay('beat');
    ctx.onProgress(Math.min(0.99, leg / LEGS)); lastP = leg / LEGS;
    persist();
    // build the next place under the card
    requestAnimationFrame(() => { if (!destroyed) { loadLeg(next); sized = false; resize(); } });
  }
  function endBeat() { if (mode !== 'beat' || beatT < 0.4) return; hideOverlay(); say(''); countIn(); }

  let flashTimer = null;
  function onEvent(e) {
    view?.event(e);
    switch (e.type) {
      case 'hit':
        sfx.bad();
        vignette.classList.remove('is-on'); void vignette.offsetWidth; vignette.classList.add('is-on');
        say(`Stumble! ${He} gains on you.`, 'bad');
        if (navigator.vibrate && coarse && !reduced) { try { navigator.vibrate(60); } catch { /* not allowed */ } }
        break;
      case 'splash': footstep(true); break;
      case 'pickup': sfx.good(); say('Teh tarik. Sprint!', 'good'); break;
      case 'shortcut': sfx.good(); say('The short way. You gain on him.', 'good'); break;
      case 'tell': say(`${He} grabs something...`); break;
      case 'throw': if (e.o && run.suspect.ahead > e.o.d - run.dist + 2) { sfx.stamp(); say('He throws it into your path!'); } break;
      case 'settle': if (e.o?.anim?.type === 'fall') sfx.stamp(); break;
      case 'escape': escapeLeg(); break;
      case 'caught': triggerCatch(); break;
      case 'lost':
        mode = 'lost'; lostT = 0;
        sfx.bad();
        report(); persist();
        say('He’s gone. Retry when you are ready.', 'bad');
        unduck();
        clearTimeout(flashTimer);
        flashTimer = setTimeout(() => { if (mode === 'lost') showOverlay('lost'); }, reduced ? 50 : 700);
        break;
      default:
    }
  }

  // ---- input: held keys steer, a finger drags, the phone can tilt
  const held = { l: false, r: false };
  const applyHeld = () => { if (run && !dragging && !tilt) run.steer((held.r ? 1 : 0) - (held.l ? 1 : 0)); };
  let visible = true;
  const onKey = (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    if (!el.isConnected || isHowToOpen()) return;
    if (e.key === 'Escape' && (fsFallback || document.fullscreenElement === stage)) { e.preventDefault(); exitFull(); return; }
    const inStage = t && stage.contains(t);
    const playing = mode === 'run' || mode === 'count' || mode === 'paused';
    const k = e.key;
    if (k === 'p' || k === 'P') { if (playing || mode === 'idle') { e.preventDefault(); togglePause(); } return; }
    if (k === 'c' || k === 'C') { if (playing || inStage || mode === 'idle') { e.preventDefault(); setPov(!pov); } return; }
    const left = k === 'ArrowLeft' || k === 'a' || k === 'A', right = k === 'ArrowRight' || k === 'd' || k === 'D';
    const up = k === 'ArrowUp' || k === 'w' || k === 'W' || k === ' ', down = k === 'ArrowDown' || k === 's' || k === 'S';
    if (!(left || right || up || down)) {
      if (k === 'Enter' && (inStage || visible)) { if (mode === 'idle') { e.preventDefault(); start(); } else if (mode === 'beat') { e.preventDefault(); endBeat(); } }
      return;
    }
    if (t && t.tagName === 'BUTTON' && !inStage && k === ' ') return;
    if (playing || inStage || ((mode === 'idle' || mode === 'beat' || mode === 'lost') && visible)) e.preventDefault(); else return;
    if (left) { held.l = true; applyHeld(); return; }
    if (right) { held.r = true; applyHeld(); return; }
    if (e.repeat) return;
    if (mode === 'idle' && up) { start(); return; }
    if (mode === 'beat') { endBeat(); return; }
    if (mode === 'paused' && manualPause && up) { manualPause = false; resume('manual'); return; }
    if (mode === 'lost' && up) { retryRun(); return; }
    if (mode === 'run') run.input(up ? 'jump' : 'slide');
  };
  const onKeyUp = (e) => {
    const k = e.key;
    if (k === 'ArrowLeft' || k === 'a' || k === 'A') { held.l = false; applyHeld(); }
    if (k === 'ArrowRight' || k === 'd' || k === 'D') { held.r = false; applyHeld(); }
  };
  document.addEventListener('keydown', onKey);
  document.addEventListener('keyup', onKeyUp);

  // dragging steers: a drag across most of the street's width on screen moves you across all of it
  let ptr = null, dragging = false;
  const onDown = (e) => {
    if (e.button > 0 || (e.target.closest && e.target.closest('button'))) return;
    const ts = e.timeStamp || performance.now();
    ptr = { id: e.pointerId, x0: e.clientX, y0: e.clientY, t0: ts, runX: run ? run.x : 0, moved: false, flicked: false, hist: [[e.clientX, e.clientY, ts]] };
    try { stage.setPointerCapture(e.pointerId); } catch { /* fine */ }
  };
  const onMove = (e) => {
    if (!ptr || e.pointerId !== ptr.id) return;
    // the event's own time, so a busy frame doesn't stretch a quick flick into a slow drag
    const now = e.timeStamp || performance.now();
    ptr.hist.push([e.clientX, e.clientY, now]);
    while (ptr.hist.length > 2 && now - ptr.hist[0][2] > 140) ptr.hist.shift();
    const dx = e.clientX - ptr.x0, dy = e.clientY - ptr.y0;
    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) ptr.moved = true;
    // a quick vertical flick is a jump or a slide
    const [hx, hy] = ptr.hist[0];
    const fdx = e.clientX - hx, fdy = e.clientY - hy;
    const th = Math.max(26, Math.min(48, stage.clientWidth * 0.07));
    if (!ptr.flicked && Math.abs(fdy) > th && Math.abs(fdy) > Math.abs(fdx) * 1.6) {
      ptr.flicked = true;
      if (mode === 'idle') { start(); return; }
      if (mode === 'run') run.input(fdy < 0 ? 'jump' : 'slide');
      ptr.x0 = e.clientX; ptr.runX = run ? run.x : 0;
      return;
    }
    if (ptr.flicked && Math.abs(fdy) < th * 0.4) ptr.flicked = false;
    if (mode === 'run' && run && !tilt && Math.abs(dx) > 4) {
      dragging = true;
      const span = Math.max(160, stage.clientWidth * 0.75);
      run.steerTo(ptr.runX + (dx / span) * 2 * X_MAX);
    }
  };
  const onUp = (e) => {
    if (!ptr || e.pointerId !== ptr.id) return;
    const tap = !ptr.moved && (e.timeStamp || performance.now()) - ptr.t0 < 500;
    ptr = null;
    if (dragging) { dragging = false; if (run) run.steerTo(run.x + run.vx * 0.08); }
    if (!tap) return;
    if (mode === 'idle') start();
    else if (mode === 'beat') endBeat();
    else if (mode === 'paused' && manualPause) { manualPause = false; resume('manual'); }
    else if (mode === 'lost' && !overlay.hidden) retryRun();
  };
  const onCancel = () => { ptr = null; dragging = false; };
  stage.addEventListener('pointerdown', onDown);
  stage.addEventListener('pointermove', onMove);
  stage.addEventListener('pointerup', onUp);
  stage.addEventListener('pointercancel', onCancel);
  const noMenu = (e) => e.preventDefault();
  stage.addEventListener('contextmenu', noMenu);

  // tilt: the phone's roll steers (portrait or landscape)
  const onTilt = (e) => {
    if (!tilt || !run || mode !== 'run') return;
    const ang = (screen.orientation?.angle ?? window.orientation ?? 0) | 0;
    const v = ang === 90 ? e.beta : ang === -90 || ang === 270 ? -e.beta : e.gamma;
    if (!Number.isFinite(v)) return;
    run.steerTo(Math.max(-1, Math.min(1, v / 22)) * X_MAX);
  };
  async function setTilt(on) {
    if (on && typeof DeviceOrientationEvent?.requestPermission === 'function') {
      try { if ((await DeviceOrientationEvent.requestPermission()) !== 'granted') on = false; } catch { on = false; }
    }
    tilt = !!on;
    store.set('floor14.pursuit.tilt', tilt ? '1' : '0');
    tiltBtn?.classList.toggle('is-on', tilt);
    tiltBtn?.setAttribute('aria-pressed', String(tilt));
    say(tilt ? 'Tilt steering on: lean the phone to steer.' : 'Tilt steering off: drag to steer.');
    if (!tilt) applyHeld();
  }
  if (canTilt) { window.addEventListener('deviceorientation', onTilt); tiltBtn.classList.toggle('is-on', tilt); }

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
    if (stage.requestFullscreen && document.fullscreenEnabled !== false) stage.requestFullscreen({ navigationUI: 'hide' }).catch(fallback);
    else fallback();
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
    if (on) { visible = true; resume('offscreen'); }
    sized = false;
    requestAnimationFrame(resize);
  }
  document.addEventListener('fullscreenchange', onFull);

  // ---- the loop
  let raf = 0, last = performance.now(), slowFor = 0, idleSkip = 0, destroyed = false, frameMs = 0;
  function tick(now) {
    raf = requestAnimationFrame(tick);
    const dt = turbo ? Math.min(0.5, Math.max(0, (now - last) / 1000)) * turbo : Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    if (!view || !run) return;
    if (isHowToOpen()) pause('howto'); else if (reasons.has('howto')) resume('howto');
    if (reasons.size && (mode === 'run' || mode === 'count')) pause([...reasons][0]);
    const t0 = performance.now();
    if (mode === 'count') {
      countT -= dt;
      const n = Math.ceil(countT / (reduced ? 0.53 : 0.8));
      const c = overlay.querySelector('.pu-count');
      if (c && c.textContent !== String(Math.max(1, n))) { c.textContent = String(Math.max(1, n)); sfx.key(); }
      if (countT <= 0) { mode = 'run'; hideOverlay(); say(''); last = now; applyHeld(); }
    } else if (mode === 'run') {
      const n = Math.max(1, Math.ceil(dt / (1 / 40)));
      for (let i = 0; i < n && mode === 'run'; i++) {
        run.step(dt / n);
        for (let j = 0; j < run.events.length; j++) onEvent(run.events[j]);
        run.events.length = 0;
      }
      if (mode === 'run' && !run.air && run.slideT <= 0) {
        stepAcc += (dt * run.speed) / 2.3;
        if (stepAcc >= 1) { stepAcc -= 1; footstep(Math.random() < 0.3); }
      }
      report();
    } else if (mode === 'escape') {
      escT += dt;
      if (escT > (reduced ? 1.2 : 2.1)) startBeat();
    } else if (mode === 'beat') {
      beatT += dt;
      if (beatT > 5.5) endBeat();
    } else if (mode === 'catch') {
      catchT += dt;
      if (catchT > 0.5 && catchT - dt <= 0.5) sfx.stamp();
      if (catchT >= (reduced ? 0.7 : 1.7)) won();
    } else if (mode === 'lost') lostT += dt;
    updateHud();
    const drawNow = mode === 'run' || mode === 'count' || mode === 'catch' || mode === 'lost' || mode === 'escape'
      || ((mode === 'idle' || mode === 'beat') && visible && !document.hidden && (idleSkip = (idleSkip + 1) % 2) === 0)
      || (mode === 'won' && now - wonAt < 2500);
    if (drawNow && visible) {
      viewState.mode = mode === 'won' ? 'catch' : mode === 'beat' ? 'idle' : mode;
      viewState.catchT = mode === 'won' ? 2 : catchT; viewState.lostT = lostT; viewState.escT = escT;
      view.frame(mode === 'idle' || mode === 'beat' ? dt * 2 : dt, viewState);
      frameMs = frameMs * 0.92 + (performance.now() - t0) * 0.08;
      if (mode === 'run' && dprCap > 1 && dt > 0.028 && !turbo) { slowFor += dt; if (slowFor > 2.5) { dprCap = 1; sized = false; resize(); } } else slowFor = Math.max(0, slowFor - dt * 0.5);
    }
  }
  showOverlay('idle');
  updateHud(true);
  raf = requestAnimationFrame(tick);
  if (isDev()) el.__pursuit = { get run() { return run; }, get mode() { return mode; }, get leg() { return leg; }, route, info: () => ({ ...view?.info?.(), kind: view?.kind, frameMs, dprCap, W, H, leg, mode }), start, view: () => view, endBeat };

  return {
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cancelAnimationFrame(raf);
      clearTimeout(ctxLostTimer); clearTimeout(flashTimer);
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('keyup', onKeyUp);
      document.removeEventListener('visibilitychange', onVis);
      document.removeEventListener('fullscreenchange', onFull);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('resize', resize);
      window.removeEventListener('deviceorientation', onTilt);
      stage.removeEventListener('pointerdown', onDown);
      stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerup', onUp);
      stage.removeEventListener('pointercancel', onCancel);
      stage.removeEventListener('contextmenu', noMenu);
      ro?.disconnect();
      io?.disconnect();
      if (document.fullscreenElement === stage) document.exitFullscreen?.().catch(() => {});
      if (fsFallback) { fsFallback.remove(); fsFallback = null; }
      if (run) { report(); persist(); run.dispose(); }
      dropView();
      run = null;
      unduck();
      if (el.__pursuit) delete el.__pursuit;
    },
    hint() {
      if (mode === 'catch' || mode === 'won') return null;
      const tip = TIPS[(slipBonus / 10 + (run?.hits || 0)) % TIPS.length | 0];
      if (run && (mode === 'run' || mode === 'count' || mode === 'paused')) {
        const skipped = run.skipPiece();
        if (skipped) {
          const what = { fork: 'the fork ahead', narrow: 'the narrow ahead', gap: 'the gap ahead', shutter: 'the shutter ahead', mover: 'what was about to roll out', fall: 'what was about to fall', hurdle: 'the hurdle ahead', thrown: 'what he was about to throw', drain: 'the drain ahead' }[skipped] || 'the next obstacle';
          say(`You know this place: you go round ${what}.`, 'good');
          return `You know this place: you go round ${what}. Tip: ${tip}`;
        }
        run.slip(10);
      } else if (run && (mode === 'idle' || mode === 'lost')) {
        slipBonus += 10;
        run.gap = Math.max(8, run.gap - 10); run.best = Math.min(run.best, run.gap);
        if (mode === 'idle') showOverlay('idle');
      } else return null;
      updateHud(true);
      const line = `${He} slips on the ${SURFACE[route[leg]]}: 10 m closer.`;
      say(line, 'good');
      return `${line} Tip: ${tip}`;
    },
    devSolve() {
      if (mode === 'catch' || mode === 'won') return;
      if (leg !== LEGS - 1) { loadLeg(LEGS - 1); sized = false; resize(); }
      else if (mode === 'lost') newRun();
      hideOverlay(); mode = 'run';
      run.gap = 0; run.best = 0; run.status = 'caught';
      triggerCatch();
    },
  };
}
