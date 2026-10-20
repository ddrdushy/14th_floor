// The case board: drag cards around, run your own red thread between them, stamp suspects.
import { h, svgEl, toast } from '../core/ui.js';
import { go } from '../core/router.js';
import { save } from '../core/state.js';
import { CASES, getCaseState, activeLevels, resolveCaseId } from '../data/cases.js';
import { avatarSvg } from '../core/avatar.js';
import { hasImage, imgUrl } from '../core/assets.js';
import { sfx } from '../core/audio.js';
import { app } from '../core/app.js';

const MARKS = [null, 'suspect', 'cleared', 'unsure'];
const MARK_LABEL = { suspect: 'Suspect', cleared: 'Cleared', unsure: 'Unsure' };

export function mount(host, { caseId, back = 'map', levelId } = {}) {
  app.scene.setMode('dim');
  caseId = resolveCaseId(caseId);
  const c = CASES[caseId];
  const cs = getCaseState(caseId);
  const board = cs.board;
  const evidence = activeLevels(c, cs).filter((l) => cs.solved[l.id]);

  const cork = h('div', { class: 'cork' });
  const threads = svgEl('svg', { class: 'threads' });
  cork.append(threads);
  const cards = new Map();
  let linkMode = false;
  let picked = null;

  const defaults = {};
  c.suspects.forEach((s, i) => { defaults[`s:${s.id}`] = { x: 120 + i * 260, y: 40 }; });
  evidence.forEach((l, i) => { defaults[`e:${l.id}`] = { x: 40 + (i % 5) * 210, y: 330 + Math.floor(i / 5) * 225 + ((i * 37) % 3) * 10 }; });
  const posOf = (id) => board.positions[id] || defaults[id];

  c.suspects.forEach((s) => {
    const id = `s:${s.id}`;
    const portrait = h('div', { class: 'portrait' });
    hasImage(s.img).then((ok) => { if (ok) portrait.style.backgroundImage = `url(${imgUrl(s.img)})`; else portrait.innerHTML = avatarSvg(s.look); });
    const stamp = h('div', { class: 'stamp' });
    const card = h('div', { class: 'pin-card is-suspect', 'data-id': id },
      portrait, stamp,
      h('h4', {}, s.name), h('p', {}, s.role),
      h('button', { class: 'btn btn--paper btn--small', style: { marginTop: '6px', width: '100%' }, onclick: (e) => { e.stopPropagation(); cycleMark(s.id, stamp); } }, 'Stamp'));
    renderMark(s.id, stamp);
    addCard(id, card);
  });
  evidence.forEach((l) => {
    const id = `e:${l.id}`;
    const card = h('div', { class: 'pin-card', 'data-id': id },
      h('span', { class: 'tag' }, String(l.evidence.tag)),
      h('h4', {}, l.evidence.title),
      h('p', {}, l.evidence.short));
    addCard(id, card);
  });
  if (!evidence.length) cork.append(h('p', { class: 'doc', style: { position: 'absolute', left: '40px', top: '340px', color: 'var(--paper)', background: 'rgba(0,0,0,.4)', padding: '8px 12px' } }, 'No evidence yet. Every puzzle you solve pins a new exhibit here.'));

  function addCard(id, card) {
    const p = posOf(id);
    card.style.left = `${p.x}px`;
    card.style.top = `${p.y}px`;
    card.style.transform = `rotate(${((id.length * 7) % 5) - 2}deg)`;
    cards.set(id, card);
    cork.append(card);
    let drag = null;
    card.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button')) return;
      if (linkMode) { pick(id); return; }
      drag = { sx: e.clientX, sy: e.clientY, x: parseFloat(card.style.left), y: parseFloat(card.style.top), moved: false };
      card.setPointerCapture(e.pointerId);
      card.style.cursor = 'grabbing';
      card.style.zIndex = 5;
    });
    card.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
      if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
      card.style.left = `${Math.max(0, drag.x + dx)}px`;
      card.style.top = `${Math.max(0, drag.y + dy)}px`;
      drawThreads();
    });
    card.addEventListener('pointerup', () => {
      if (!drag) return;
      board.positions[id] = { x: parseFloat(card.style.left), y: parseFloat(card.style.top) };
      card.style.cursor = '';
      card.style.zIndex = '';
      drag = null;
      save();
    });
  }

  function pinPoint(id) {
    const el = cards.get(id);
    if (!el) return null;
    return { x: el.offsetLeft + el.offsetWidth / 2, y: el.offsetTop + 2 };
  }

  function drawThreads() {
    threads.innerHTML = '';
    // the investigation's own thread: evidence in order of discovery
    const order = cs.evidence.map((lid) => `e:${lid}`).filter((id) => cards.has(id));
    for (let i = 1; i < order.length; i++) addThread(order[i - 1], order[i], false);
    board.links.forEach((lk, i) => addThread(lk[0], lk[1], true, i));
  }

  function addThread(a, b, mine, index) {
    const p1 = pinPoint(a), p2 = pinPoint(b);
    if (!p1 || !p2) return;
    const sag = Math.min(80, Math.hypot(p2.x - p1.x, p2.y - p1.y) * 0.15);
    const d = `M${p1.x} ${p1.y} Q${(p1.x + p2.x) / 2} ${(p1.y + p2.y) / 2 + sag} ${p2.x} ${p2.y}`;
    const path = svgEl('path', { d, fill: 'none', stroke: mine ? '#d8323d' : 'rgba(179,32,42,.55)', 'stroke-width': mine ? 3 : 2, 'stroke-dasharray': mine ? null : '6 5' });
    if (mine) {
      path.addEventListener('click', () => { board.links.splice(index, 1); save(); drawThreads(); toast('Thread removed.'); });
      path.append(svgEl('title', {}, 'Tap to remove this thread'));
    }
    threads.append(path);
  }

  function pick(id) {
    if (!picked) {
      picked = id;
      cards.get(id).classList.add('is-picked');
      return;
    }
    if (picked !== id && !board.links.some(([a, b]) => (a === picked && b === id) || (a === id && b === picked))) {
      board.links.push([picked, id]);
      sfx.pin();
      save();
    }
    cards.get(picked)?.classList.remove('is-picked');
    picked = null;
    drawThreads();
  }

  function renderMark(sid, stamp) {
    const m = board.marks[sid];
    stamp.className = `stamp${m ? ` stamp--${m}` : ''}`;
    stamp.textContent = m ? MARK_LABEL[m] : '';
    stamp.style.display = m ? '' : 'none';
  }

  function cycleMark(sid, stamp) {
    const cur = MARKS.indexOf(board.marks[sid] || null);
    const nxt = MARKS[(cur + 1) % MARKS.length];
    if (nxt) board.marks[sid] = nxt; else delete board.marks[sid];
    sfx.stamp();
    save();
    renderMark(sid, stamp);
  }

  const linkBtn = h('button', { class: 'btn btn--small', 'aria-pressed': 'false', onclick: () => {
    linkMode = !linkMode;
    linkBtn.setAttribute('aria-pressed', String(linkMode));
    linkBtn.classList.toggle('btn--primary', linkMode);
    if (picked) { cards.get(picked)?.classList.remove('is-picked'); picked = null; }
    if (linkMode) toast('Tap two cards to run red thread between them. Tap a thread to remove it.');
  } }, 'Red thread');
  const backTo = () => (back === 'puzzle' ? go('puzzle', { caseId, levelId }) : back === 'office' ? go('office') : go('map', { caseId }));
  const root = h('section', { class: 'screen board-screen' },
    h('header', { class: 'topbar' },
      h('button', { class: 'btn btn--ghost btn--small', onclick: backTo }, back === 'puzzle' ? 'Back to the puzzle' : back === 'office' ? 'Office' : 'Case map'),
      h('div', { class: 'topbar-title' }, h('strong', {}, 'Case board'), h('span', {}, `${evidence.length} ${evidence.length === 1 ? 'exhibit' : 'exhibits'}. Drag cards to arrange your theory.`)),
      linkBtn),
    h('div', { class: 'board-area' }, cork));
  host.append(root);
  requestAnimationFrame(drawThreads);
  return {};
}
