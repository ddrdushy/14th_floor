// Fingerprint comparison. Prints are generated from ridge-flow fields with real minutiae
// (ridge endings and bifurcations come from phase dislocations), so matching takes genuine looking.
import { h } from '../core/ui.js';
import { shuffle, randInt } from '../core/rng.js';
import { sfx } from '../core/audio.js';
import { put, svg, text, rect, grid, arrow, ring, tap, chip, badge, C } from '../core/howto-kit.js';

export const meta = { id: 'fingerprint', name: 'Fingerprint Match', category: 'Forensics' };

const PW = 200, PH = 260, UNIT = 100; // px per field unit
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

function makePrint(rng, type) {
  return {
    type,
    cx: (rng() - 0.5) * 0.18,
    cy: -0.1 + (rng() - 0.5) * 0.2,
    rot: (rng() - 0.5) * 0.6,
    period: 0.05 + rng() * 0.012,
    dir: rng() < 0.5 ? 1 : -1,
    arch: 0.22 + rng() * 0.25,
    warp: rng() * 10,
    minutiae: Array.from({ length: randInt(rng, 7, 10) }, () => ({ x: (rng() - 0.5) * 1.2, y: (rng() - 0.5) * 1.7, k: rng() < 0.5 ? 1 : -1 })),
  };
}

function ridge(P, x, y) {
  let u = x - P.cx, v = y - P.cy;
  const c = Math.cos(P.rot), s = Math.sin(P.rot);
  [u, v] = [u * c - v * s, u * s + v * c];
  u += 0.03 * Math.sin(v * 6 + P.warp);
  v += 0.03 * Math.sin(u * 5 + P.warp * 1.7);
  const r = Math.hypot(u, v);
  const outer = v * 1.0 - 0.45 * Math.exp(-(u * u) / 0.6);
  let core;
  if (P.type === 'whorl') core = Math.hypot(u * 1.05, v * 1.25);
  else if (P.type === 'loop') {
    const uu = u * P.dir;
    core = uu < 0.05 ? Math.hypot(uu - 0.05, v) : Math.abs(v);
  } else core = v - P.arch * Math.exp(-(u * u) / 0.08);
  const t = P.type === 'arch' ? 0.25 : smooth(0.42, 0.85, r);
  let phi = core * (1 - t) + outer * t;
  for (const m of P.minutiae) phi += (m.k * Math.atan2(v - m.y, u - m.x) * P.period) / (Math.PI * 2);
  return Math.cos((2 * Math.PI * phi) / P.period);
}

function renderPrint(P, canvas) {
  canvas.width = PW;
  canvas.height = PH;
  const g = canvas.getContext('2d');
  const img = g.createImageData(PW, PH);
  for (let py = 0; py < PH; py++) {
    for (let px = 0; px < PW; px++) {
      const x = (px - PW / 2) / UNIT, y = (py - PH / 2) / UNIT;
      const mask = 1 - smooth(0.85, 1.0, Math.hypot(x / 0.88, (y - 0.08) / 1.18));
      const ink = smooth(-0.15, 0.45, ridge(P, x, y)) * mask;
      const i = (py * PW + px) * 4;
      const val = 245 - ink * 200;
      img.data[i] = val; img.data[i + 1] = val - 4; img.data[i + 2] = val - 12; img.data[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
}

// a partial, rotated, smudged lift of the same finger
function renderLatent(P, L, canvas, tint = [40, 36, 30]) {
  const S = 180;
  canvas.width = canvas.height = S;
  const g = canvas.getContext('2d');
  const img = g.createImageData(S, S);
  const c = Math.cos(L.theta), s = Math.sin(L.theta);
  for (let ly = 0; ly < S; ly++) {
    for (let lx = 0; lx < S; lx++) {
      const a = (lx - S / 2) / UNIT, b = (ly - S / 2) / UNIT;
      const x = a * c - b * s + L.ox, y = a * s + b * c + L.oy;
      const edge = Math.hypot(lx - S / 2, ly - S / 2) / (S / 2);
      const wobble = 0.12 * Math.sin(Math.atan2(ly - S / 2, lx - S / 2) * 5 + L.seed);
      const mask = 1 - smooth(0.7 + wobble, 0.92 + wobble, edge);
      const smudge = 0.55 + 0.45 * Math.sin(lx * 0.05 + L.seed) * Math.cos(ly * 0.04);
      const ink = smooth(-0.1, 0.5, ridge(P, x, y)) * mask * (0.55 + 0.45 * smudge);
      const i = (ly * S + lx) * 4;
      img.data[i] = tint[0]; img.data[i + 1] = tint[1]; img.data[i + 2] = tint[2];
      img.data[i + 3] = Math.round(ink * 255);
    }
  }
  g.putImageData(img, 0, 0);
}

const TYPE_INFO = {
  whorl: 'Whorl: ridges circle a central point.',
  loop: 'Loop: ridges enter from one side, turn back and leave the same side.',
  arch: 'Arch: ridges flow side to side with a gentle rise, no turning back.',
};

export function mount(el, ctx) {
  const { rng, params, saved } = ctx;
  const answerType = 'loop';
  const types = shuffle(rng, ['loop', 'loop', 'loop', 'whorl', 'whorl', 'arch', 'arch']);
  const people = params.candidates;
  const answerIdx = people.findIndex((p) => p.id === params.answer);
  const prints = people.map((_, i) => makePrint(rng, i === answerIdx ? answerType : types[i > answerIdx ? i - 1 : i]));
  const latent = { theta: (rng() - 0.5) * 1.2, ox: (rng() - 0.5) * 0.3, oy: (rng() - 0.5) * 0.4 - 0.1, seed: rng() * 10 };
  let stage = saved?.stage || 1;
  let wrong = saved?.wrong || 0;
  const excluded = new Set(saved?.excluded || []);
  let selected = null;

  const status = h('p', { class: 'feedback' });
  const latentCanvas = h('canvas', { class: 'fp-latent-img', 'aria-label': params.liftAria || 'Partial print lifted from the door handle' });
  renderLatent(prints[answerIdx], latent, latentCanvas);

  const stage1 = h('div', { class: 'fp-stage' },
    h('p', { class: 'doc' }, 'Step 1. What pattern is the lifted print?'),
    h('div', { class: 'fp-types' }, ['whorl', 'loop', 'arch'].map((t) =>
      h('button', { class: 'btn btn--paper', onclick: () => classify(t) }, h('strong', {}, t[0].toUpperCase() + t.slice(1)), h('small', {}, TYPE_INFO[t].split(': ')[1])))),
  );

  const grid = h('div', { class: 'fp-grid' });
  const cards = prints.map((P, i) => {
    const cv = h('canvas', { 'aria-hidden': 'true' });
    renderPrint(P, cv);
    const card = h('button', { class: 'fp-card', onclick: () => choose(i), 'aria-label': `Print on file: ${people[i].name}` }, cv, h('span', { class: 'doc' }, people[i].name));
    grid.append(card);
    return card;
  });

  // comparison bench: drag the red lift over the chosen print, rotate to align
  const benchPrint = h('canvas', { class: 'fp-bench-print' });
  const overlay = h('canvas', { class: 'fp-overlay' });
  renderLatent(prints[answerIdx], latent, overlay, [200, 30, 40]);
  const rot = h('input', { type: 'range', min: -90, max: 90, value: 0, 'aria-label': 'Rotate lifted print' });
  const opacity = h('input', { type: 'range', min: 20, max: 100, value: 75, 'aria-label': 'Lifted print opacity' });
  const pos = { x: 10, y: 40 };
  const bench = h('div', { class: 'fp-bench' }, benchPrint, overlay);
  const benchWrap = h('div', { class: 'fp-bench-wrap', hidden: true },
    h('p', { class: 'doc' }, 'Drag the red lift over the print and rotate it until the ridge endings line up.'),
    bench,
    h('label', { class: 'fp-slider' }, 'Rotate', rot),
    h('label', { class: 'fp-slider' }, 'Opacity', opacity),
    h('div', { class: 'game-toolbar' },
      h('button', { class: 'btn btn--primary', onclick: () => declare() }, 'Declare a match'),
      h('button', { class: 'btn', onclick: () => { benchWrap.hidden = true; selected = null; mark(); } }, 'Back to the files')),
  );
  const applyOverlay = () => {
    overlay.style.transform = `translate(${pos.x}px, ${pos.y}px) rotate(${rot.value}deg)`;
    overlay.style.opacity = opacity.value / 100;
  };
  rot.oninput = applyOverlay;
  opacity.oninput = applyOverlay;
  let drag = null;
  overlay.addEventListener('pointerdown', (e) => { drag = { sx: e.clientX, sy: e.clientY, x: pos.x, y: pos.y }; overlay.setPointerCapture(e.pointerId); });
  overlay.addEventListener('pointermove', (e) => { if (!drag) return; pos.x = drag.x + e.clientX - drag.sx; pos.y = drag.y + e.clientY - drag.sy; applyOverlay(); });
  overlay.addEventListener('pointerup', () => { drag = null; });
  applyOverlay();

  const stage2 = h('div', { class: 'fp-stage' }, h('p', { class: 'doc' }, 'Step 2. Compare the lift with the prints on file. Choose one to put on the bench.'), grid, benchWrap);

  el.append(
    h('p', { class: 'game-rules' }, 'Fingerprint examiners classify first, then compare ridge endings and forks point by point. A wrong declaration costs the lab a fresh lift.'),
    h('div', { class: 'fp-top' }, h('figure', { class: 'fp-latent' }, latentCanvas, h('figcaption', { class: 'doc' }, params.liftLabel || 'Lift: balcony door, inside handle'))),
    stage1, stage2, status,
  );

  function persist() { ctx.onSave({ stage, wrong, excluded: [...excluded] }); }

  function mark() {
    cards.forEach((c, i) => {
      c.classList.toggle('is-excluded', excluded.has(i));
      c.classList.toggle('is-selected', selected === i);
    });
  }

  function show() {
    stage1.hidden = stage !== 1;
    stage2.hidden = stage !== 2;
    ctx.onProgress(stage === 1 ? 0.1 : 0.35 + excluded.size * 0.06);
    mark();
  }

  function classify(t) {
    if (t === answerType) {
      sfx.good();
      stage = 2;
      status.textContent = 'A loop. Prints that are not loops can be set aside.';
      status.className = 'feedback is-good';
      prints.forEach((P, i) => { if (P.type !== answerType) excluded.add(i); });
    } else {
      sfx.bad();
      status.textContent = `Look again. ${TYPE_INFO[t]}`;
      status.className = 'feedback is-bad';
    }
    persist();
    show();
  }

  function choose(i) {
    if (excluded.has(i)) return;
    selected = i;
    renderPrint(prints[i], benchPrint);
    benchWrap.hidden = false;
    mark();
    benchWrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function declare() {
    if (selected == null) return;
    if (selected === answerIdx) {
      status.textContent = `Twelve points agree. The print belongs to ${people[selected].name}.`;
      status.className = 'feedback is-good';
      ctx.onProgress(1);
      ctx.onSolved();
    } else {
      wrong++;
      sfx.bad();
      excluded.add(selected);
      status.textContent = `No. The ridge endings near the core disagree. ${people[selected].name} is excluded. (${wrong} wrong ${wrong === 1 ? 'call' : 'calls'})`;
      status.className = 'feedback is-bad';
      selected = null;
      benchWrap.hidden = true;
      persist();
      show();
    }
  }

  show();
  return {
    hint() {
      if (stage === 1) return 'Follow one ridge from the edge of the lift. Does it turn back on itself?';
      const options = prints.map((_, i) => i).filter((i) => !excluded.has(i) && i !== answerIdx);
      if (!options.length) return null;
      excluded.add(options[0]);
      persist();
      show();
      return `The lab excluded ${people[options[0]].name}.`;
    },
    devSolve() { stage = 2; selected = answerIdx; declare(); },
  };
}

// ---------- How to play (see core/howto.js) ----------
export const howTo = {
  goal: 'Find out whose finger left the print.',
  steps: [
    'Look at the lifted print at the top.',
    'Step 1: choose its pattern: Whorl, Loop or Arch.',
    'Prints with a different pattern are set aside for you.',
    'Step 2: tap a print on file to put it on the bench.',
    'Drag the red copy over it. If the lines match, tap Declare a match.',
  ],
  example: {
    caption: 'These lines come in, turn back, and go out the same side. That is a Loop.',
    render(el) {
      const box = (x, label, body, pick) =>
        rect(x, 8, 108, 112, { fill: '#f4efe3', stroke: pick ? C.red : '#b9ae95', sw: pick ? 3.5 : 1.5, rx: 4 }) +
        `<g fill="none" stroke="${C.ink}" stroke-width="2.2" stroke-linecap="round">${body(x + 54, 66)}</g>` +
        text(x + 54, 140, label, { size: 15, weight: 700 });
      const whorl = (cx, cy) => [8, 16, 24, 32].map((r) => `<ellipse cx="${cx}" cy="${cy}" rx="${r * 1.2}" ry="${r * 1.35}"/>`).join('');
      const loop = (cx, cy) => [30, 22, 14, 6].map((w) => `<path d="M${cx - w} ${cy + 44} V${cy} A${w} ${w} 0 0 1 ${cx + w} ${cy} V${cy + 44}"/>`).join('');
      const arch = (cx, cy) => [-36, -24, -12, 0, 12, 24, 36].map((d) => `<path d="M${cx - 44} ${cy + d + 10} Q${cx} ${cy + d - 18} ${cx + 44} ${cy + d + 10}"/>`).join('');
      let s = box(10, 'Whorl', whorl) + box(136, 'Loop', loop, true) + box(262, 'Arch', arch);
      s += badge(232, 18, true, 11);
      put(el, svg(380, 150, s, 'Three print patterns: whorl, loop and arch. Loop is chosen.'));
    },
  },
  tips: ['A wrong match crosses that person out and counts as a wrong call.', 'The Magnifier rules out one innocent person for you.'],
  controls: { touch: 'Tap to choose. Drag the red print; use the Rotate slider to turn it.', keys: 'Mouse: drag the red print. Use the sliders to turn and fade it.' },
};
