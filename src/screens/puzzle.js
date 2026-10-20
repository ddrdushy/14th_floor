// One investigation step: a mini game on the right, a fogged crime-scene photo on the left
// that clears as you progress. Solving it reveals the hidden item and pins the evidence.
import { h, toast, modal, fmtTime, isDev } from '../core/ui.js';
import { go } from '../core/router.js';
import { state, save } from '../core/state.js';
import { CASES, getCaseState, findLevel, resolveCaseId } from '../data/cases.js';
import { GAMES, CATEGORY_OF } from '../games/registry.js';
import { rngFor, mulberry32, hashStr } from '../core/rng.js';
import { paintInto } from '../core/assets.js';
import { sfx } from '../core/audio.js';
import { app } from '../core/app.js';
import { specialtyOf } from '../core/avatar.js';
import { backButton, icon } from '../core/nav.js';

function fogLayer(canvas, seedKey, hotspot) {
  const g = canvas.getContext('2d');
  const r = mulberry32(hashStr(seedKey));
  const spots = Array.from({ length: 26 }, () => ({ x: r(), y: r(), s: 0.12 + r() * 0.16 }))
    .filter((s) => Math.hypot(s.x - hotspot.x, s.y - hotspot.y) > hotspot.r + 0.04);
  const noise = document.createElement('canvas');
  noise.width = noise.height = 128;
  const ng = noise.getContext('2d');
  const img = ng.createImageData(128, 128);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 40 + r() * 40;
    img.data[i] = v; img.data[i + 1] = v + 8; img.data[i + 2] = v + 16; img.data[i + 3] = 255;
  }
  ng.putImageData(img, 0, 0);
  let progress = 0, alpha = 1;
  function draw() {
    const w = (canvas.width = canvas.clientWidth * 1), hh = (canvas.height = canvas.clientHeight * 1);
    g.clearRect(0, 0, w, hh);
    g.globalAlpha = alpha;
    g.globalCompositeOperation = 'source-over';
    g.imageSmoothingEnabled = true;
    g.drawImage(noise, 0, 0, w, hh);
    g.fillStyle = 'rgba(20, 30, 40, .55)';
    g.fillRect(0, 0, w, hh);
    g.globalCompositeOperation = 'destination-out';
    const n = Math.floor(progress * spots.length);
    for (let i = 0; i < n; i++) {
      const s = spots[i];
      const rad = s.s * w;
      const grd = g.createRadialGradient(s.x * w, s.y * hh, rad * 0.2, s.x * w, s.y * hh, rad);
      grd.addColorStop(0, 'rgba(0,0,0,1)');
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grd;
      g.fillRect(s.x * w - rad, s.y * hh - rad, rad * 2, rad * 2);
    }
    if (progress >= 0.6) {
      // the outer scene is mostly readable; the key area stays clouded until solved
      g.fillStyle = `rgba(0,0,0,${(progress - 0.6) * 1.6})`;
      g.fillRect(0, 0, w, hh);
    }
    g.globalCompositeOperation = 'source-over';
    if (alpha > 0) {
      const hx = hotspot.x * w, hy = hotspot.y * hh, hr = hotspot.r * w * 1.25;
      const grd = g.createRadialGradient(hx, hy, hr * 0.3, hx, hy, hr);
      grd.addColorStop(0, `rgba(36, 48, 58, ${0.97 * alpha})`);
      grd.addColorStop(1, 'rgba(36, 48, 58, 0)');
      g.fillStyle = grd;
      g.fillRect(hx - hr, hy - hr, hr * 2, hr * 2);
    }
  }
  return {
    set(p) { progress = Math.max(progress, p); draw(); },
    // CSS-driven fade: one style change instead of a canvas redraw per frame, so the reveal
    // finishes on time even on a slow or busy device.
    clear(duration = 900) {
      canvas.style.transition = `opacity ${duration}ms ease-in-out`;
      canvas.style.opacity = '0';
      return new Promise((resolve) => setTimeout(() => { alpha = 0; resolve(); }, duration));
    },
    draw,
  };
}

export async function mount(host, { caseId, levelId }) {
  app.scene.setMode('dim');
  caseId = resolveCaseId(caseId);
  const c = CASES[caseId];
  const cs = getCaseState(caseId);
  const level = findLevel(c, cs, levelId);
  if (!level) { go('map', { caseId }); return {}; }
  const profileName = state().profile?.name || 'detective';
  const saved = cs.inprogress[levelId] || {};
  let elapsed = saved.time || 0;
  let solved = false;
  let destroyed = false;
  const ev = level.evidence;

  // evidence column
  const photoImg = h('div', { class: 'photo-img', style: { filter: 'blur(7px) saturate(0.6)' } });
  const fogCanvas = h('canvas', { class: 'fog' });
  const hotspot = h('div', { class: 'hotspot', style: { left: `${ev.hotspot.x * 100}%`, top: `${ev.hotspot.y * 100}%`, width: `${ev.hotspot.r * 200}%`, aspectRatio: '1' } });
  const photo = h('div', { class: 'photo' }, photoImg, fogCanvas, hotspot, h('div', { class: 'photo-caption' }, `Exhibit ${ev.tag}: pending`));
  const progressBar = h('i', {});
  let specTag = '';
  try { specTag = specialtyOf(state().profile)?.tag || ''; } catch { specTag = ''; }
  // on phones the photo starts as a small strip above the game; tapping it opens it up
  const evToggle = h('button', { class: 'ev-toggle', type: 'button', 'aria-expanded': 'false', 'aria-label': 'Show the evidence photo larger', onclick: () => setPhotoOpen(!evidenceCol.classList.contains('is-open')) },
    h('span', { class: 'ev-toggle-hint', 'aria-hidden': 'true' }, 'Tap to enlarge'));
  const evidenceCol = h('aside', { class: 'evidence-col' },
    evToggle,
    photo,
    h('div', { class: 'evidence-meta' },
      h('h3', {}, level.title),
      h('p', { class: 'doc' }, level.brief),
      specTag ? h('p', { class: 'spec-tag' }, specTag) : null,
      h('div', { class: 'progress-line', 'aria-hidden': 'true' }, progressBar)));
  paintInto(photoImg, ev.img, `Exhibit ${ev.tag}`, 'night');

  // game column
  const sheet = h('div', { class: 'game-sheet' });
  const mod = await GAMES[level.game]();
  sheet.append(h('h2', {}, mod.meta.name), h('p', { class: 'game-brief' }, `${CATEGORY_OF[level.game]} puzzle.`));
  const gameEl = h('div', {});
  sheet.append(gameEl);

  const timerEl = h('span', { class: 'timer', 'aria-label': 'Time on this puzzle' }, fmtTime(elapsed));
  const hintCount = h('span', { class: 'hint-count' }, String(cs.hints));
  const hintBtn = h('button', { class: 'btn btn--small hint-btn', onclick: useHint, 'aria-label': 'Use a magnifying glass hint' },
    h('span', { class: 'hint-ico', html: icon('puzzle') }), h('span', { class: 'hint-label' }, 'Magnifier '), hintCount);
  const top = h('header', { class: 'topbar' },
    backButton('Case map', () => go('map', { caseId }), 'Map'),
    h('div', { class: 'topbar-title' }, h('strong', {}, level.title), h('span', {}, `${level.phase}. ${mod.meta.name}.`)),
    timerEl, hintBtn,
    h('button', { class: 'btn btn--small nav-dup', onclick: () => go('board', { caseId, back: 'puzzle', levelId }) }, 'Board'),
    isDev() ? h('button', { class: 'btn btn--small dev-btn', onclick: () => game.devSolve?.() }, 'Solve (dev)') : null);

  const root = h('section', { class: 'screen puzzle-screen' }, top,
    h('div', { class: 'puzzle-body' }, evidenceCol, h('div', { class: 'game-col' }, sheet)));
  host.append(root);

  const fog = fogLayer(fogCanvas, `${caseId}${levelId}`, ev.hotspot);
  requestAnimationFrame(() => fog.draw());
  const onResize = () => fog.draw();
  function setPhotoOpen(open) {
    evidenceCol.classList.toggle('is-open', open);
    evToggle.setAttribute('aria-expanded', String(open));
    evToggle.setAttribute('aria-label', open ? 'Shrink the evidence photo' : 'Show the evidence photo larger');
    evToggle.firstChild.textContent = open ? 'Tap to shrink' : 'Tap to enlarge';
    requestAnimationFrame(() => fog.draw());
  }
  window.addEventListener('resize', onResize);

  let lastP = 0;
  const persist = (gameState) => {
    cs.inprogress[levelId] = { ...(cs.inprogress[levelId] || {}), game: gameState, time: elapsed };
    save();
  };
  const ctx = {
    params: level.params,
    variant: level.variant,
    rng: rngFor(caseId, levelId, profileName),
    saved: saved.game,
    onProgress(p) {
      lastP = Math.max(lastP, Math.min(1, p));
      fog.set(lastP);
      photoImg.style.filter = `blur(${(1 - lastP) * 7}px) saturate(${0.6 + lastP * 0.4})`;
      progressBar.style.width = `${lastP * 100}%`;
    },
    onSave: persist,
    onSolved: () => finish(),
  };
  const game = mod.mount(gameEl, ctx) || {};

  const tick = setInterval(() => {
    if (document.hidden || solved) return;
    elapsed++;
    timerEl.textContent = fmtTime(elapsed);
    if (elapsed % 10 === 0) {
      cs.inprogress[levelId] = { ...(cs.inprogress[levelId] || {}), time: elapsed };
      save();
    }
  }, 1000);

  function useHint() {
    if (solved) return;
    if (cs.hints <= 0) {
      toast('No magnifiers left for this case. Some detectives call that character building.');
      return;
    }
    const msg = game.hint?.();
    if (!msg) { toast('Nothing left to magnify here.'); return; }
    cs.hints--;
    cs.inprogress[levelId] = { ...(cs.inprogress[levelId] || {}), hinted: (cs.inprogress[levelId]?.hinted || 0) + 1 };
    save();
    hintCount.textContent = String(cs.hints);
    toast(msg, 5200);
  }

  async function finish() {
    if (solved) return;
    solved = true;
    clearInterval(tick);
    sfx.solve();
    ctx.onProgress(1);
    // record first, so the exhibit is never lost if the player leaves during the reveal
    if (!cs.solved[levelId]) {
      cs.solved[levelId] = { time: elapsed, hints: cs.inprogress[levelId]?.hinted || 0, at: Date.now() };
      if (!cs.evidence.includes(levelId)) cs.evidence.push(levelId);
      state().solvedTotal++;
    }
    delete cs.inprogress[levelId];
    save();

    await new Promise((r) => setTimeout(r, 250));
    if (destroyed) return;
    sfx.reveal();
    setPhotoOpen(true);
    photo.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    photoImg.style.filter = 'none';
    await fog.clear(900);
    if (destroyed) return;
    photo.querySelector('.photo-caption').textContent = `Exhibit ${ev.tag}: ${ev.title}`;
    // CSS-driven ring so it shows even if animation frames are slow
    hotspot.classList.add('is-revealed');
    await new Promise((r) => setTimeout(r, 1100));
    if (destroyed) return;
    const card = h('div', { class: 'evidence-card' },
      h('span', { class: 'tag' }, String(ev.tag)),
      h('h3', {}, ev.title),
      h('p', {}, ev.text),
      h('p', { class: 'muted', style: { marginTop: '10px', fontFamily: 'var(--font-ui)', fontSize: '.85rem', color: 'var(--ink-soft)' } }, `Solved in ${fmtTime(elapsed)}.`));
    const cont = await modal({
      title: '',
      body: card,
      buttons: [{ label: 'Pin it to the board', kind: 'primary', value: 'map' }],
      dismissable: false,
    });
    sfx.pin();
    if (cont) go('map', { caseId });
  }

  return {
    destroy() {
      destroyed = true;
      clearInterval(tick);
      window.removeEventListener('resize', onResize);
      game.destroy?.();
      if (!solved) {
        cs.inprogress[levelId] = { ...(cs.inprogress[levelId] || {}), time: elapsed };
        save();
      }
    },
  };
}
