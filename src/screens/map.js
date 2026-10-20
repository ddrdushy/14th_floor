// Case map: a winding route through the investigation. Only what you have reached is visible;
// the road ahead disappears into fog, so you never know how far the case runs.
import { gsap } from 'gsap';
import { h, svgEl, modal } from '../core/ui.js';
import { go } from '../core/router.js';
import { backButton } from '../core/nav.js';
import { CASES, levelStatus, getCaseState, caseHeading, resolveCaseId } from '../data/cases.js';
import { CATEGORY_OF } from '../games/registry.js';
import { app } from '../core/app.js';
import { sfx } from '../core/audio.js';

const STEP = 128;

export function mount(host, { caseId, fresh = false } = {}) {
  caseId = resolveCaseId(caseId);
  app.scene.setMode('dim');
  const c = CASES[caseId];
  const cs = getCaseState(caseId);
  const { levels, solved, current, allSolved } = levelStatus(c, cs);
  app.music?.play?.(c.music || 'investigation');

  const nodes = [];
  solved.forEach((l) => nodes.push({ kind: 'done', level: l }));
  if (current) nodes.push({ kind: 'current', level: current });
  const remaining = levels.length - solved.length - (current ? 1 : 0);
  if (remaining > 0) nodes.push({ kind: 'fog' });
  if (allSolved) nodes.push({ kind: 'final' });

  const height = nodes.length * STEP + 260;
  const canvas = h('div', { class: 'map-canvas', style: { height: `${height}px` } });
  const W = 560;
  const pos = nodes.map((_, i) => ({
    x: 50 + Math.sin(i * 1.15) * 28,
    y: height - 140 - i * STEP,
  }));

  // streets in the background, then the road through the case
  const svg = svgEl('svg', { class: 'map-roads', viewBox: `0 0 100 ${height}`, preserveAspectRatio: 'none', 'aria-hidden': 'true' });
  for (let y = 40; y < height; y += 90) svg.append(svgEl('line', { x1: 0, x2: 100, y1: y, y2: y + 30, stroke: '#1d2a33', 'stroke-width': 0.6, 'vector-effect': 'non-scaling-stroke' }));
  for (let x = 8; x < 100; x += 19) svg.append(svgEl('line', { x1: x, x2: x - 6, y1: 0, y2: height, stroke: '#1a252d', 'stroke-width': 0.6, 'vector-effect': 'non-scaling-stroke' }));
  let d = `M ${pos[0].x} ${pos[0].y + 80}`;
  pos.forEach((p, i) => {
    const prev = i ? pos[i - 1] : { x: p.x, y: p.y + 80 };
    const my = (prev.y + p.y) / 2;
    d += ` C ${prev.x} ${my}, ${p.x} ${my}, ${p.x} ${p.y}`;
  });
  svg.append(svgEl('path', { d, fill: 'none', stroke: '#b3202a', 'stroke-width': 3, 'vector-effect': 'non-scaling-stroke', 'stroke-dasharray': '1 0', opacity: 0.9 }));
  canvas.append(svg);

  let lastPhase = null;
  nodes.forEach((n, i) => {
    const p = pos[i];
    const left = `${p.x}%`;
    if (n.level && n.level.phase !== lastPhase) {
      lastPhase = n.level.phase;
      canvas.append(h('div', { class: 'map-phase', style: { top: `${p.y - 16}px`, left: `${Math.min(80, Math.max(20, p.x + (p.x > 50 ? -26 : 26)))}%` } }, n.level.phase));
    }
    let btn;
    if (n.kind === 'done') {
      const ev = n.level.evidence;
      btn = h('button', { class: 'map-node is-done', style: { left, top: `${p.y}px` }, 'aria-label': `Solved: ${n.level.title}. Evidence ${ev.tag}`, onclick: () => replay(n.level) }, String(ev.tag));
      canvas.append(h('div', { class: 'map-node-label', style: { left, top: `${p.y + 38}px` } }, ev.title));
    } else if (n.kind === 'current') {
      btn = h('button', { class: 'map-node is-current', style: { left, top: `${p.y}px` }, 'aria-label': `Next: ${n.level.title}`, onclick: () => open(n.level) }, '?');
      canvas.append(h('div', { class: 'map-node-label', style: { left, top: `${p.y + 42}px`, color: 'var(--paper)' } }, n.level.title, h('br'), h('small', { class: 'muted' }, CATEGORY_OF[n.level.game])));
    } else if (n.kind === 'fog') {
      btn = h('div', { class: 'map-node is-fog', style: { left, top: `${p.y}px` }, 'aria-label': 'More of the case is hidden' }, '…');
      canvas.append(h('div', { class: 'map-node-label', style: { left, top: `${p.y + 38}px` } }, 'The trail goes on'));
    } else {
      btn = h('button', { class: 'map-node is-final', style: { left, top: `${p.y}px` }, onclick: () => go(cs.status === 'closed' ? 'closed' : 'deduce', { caseId }) }, cs.status === 'closed' ? 'Case file' : (c.finalLabel || 'Name the killer'));
    }
    canvas.append(btn);
  });

  const scroll = h('div', { class: 'map-scroll' }, canvas);
  const root = h('section', { class: 'screen map-screen' },
    h('header', { class: 'topbar' },
      backButton('Office', () => go('office')),
      h('div', { class: 'topbar-title' }, h('strong', {}, caseHeading(c)), h('span', {}, `${c.place}. ${solved.length} ${solved.length === 1 ? 'exhibit' : 'exhibits'} found.`)),
      h('button', { class: 'btn btn--small nav-dup', onclick: () => go('board', { caseId, back: 'map' }) }, 'Case board')),
    scroll);
  host.append(root);
  requestAnimationFrame(() => {
    const focusIdx = nodes.findIndex((n) => n.kind === 'current' || n.kind === 'final');
    const y = pos[focusIdx >= 0 ? focusIdx : nodes.length - 1].y;
    scroll.scrollTop = Math.max(0, y - scroll.clientHeight * 0.6);
    const cur = canvas.querySelector('.is-current, .is-final');
    if (cur) gsap.from(cur, { scale: 0.4, opacity: 0, duration: 0.6, delay: 0.3, ease: 'back.out(2)' });
  });

  if (fresh && !solved.length) {
    setTimeout(() => modal({
      title: caseHeading(c),
      body: h('div', {}, h('p', { class: 'doc' }, c.brief), h('p', {}, c.mapIntro || 'Every puzzle you solve uncovers one piece of evidence. Nobody will tell you how many pieces there are. When you have enough, you name the killer yourself.')),
      buttons: [{ label: 'Start the investigation', kind: 'primary', value: true }],
    }), 600);
  }

  function open(level) {
    sfx.click();
    go('puzzle', { caseId, levelId: level.id });
  }

  function replay(level) {
    modal({
      title: `Exhibit ${level.evidence.tag}: ${level.evidence.title}`,
      body: h('p', { class: 'doc' }, level.evidence.text),
      buttons: [{ label: 'Close', value: false }],
    });
  }

  return {};
}

