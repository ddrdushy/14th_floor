// The case board: drag cards around, run your own red thread between them, stamp suspects.
import { h, svgEl, toast } from '../core/ui.js';
import { go } from '../core/router.js';
import { backButton } from '../core/nav.js';
import { save, state } from '../core/state.js';
import { openEvidence, evidenceFileButton } from '../core/evidence-viewer.js';
import { showInfoCard } from '../core/howto.js';
import { CASES, getCaseState, activeLevels, resolveCaseId } from '../data/cases.js';
import { avatarSvg } from '../core/avatar.js';
import { hasImage, imgUrl } from '../core/assets.js';
import { sfx } from '../core/audio.js';
import { app } from '../core/app.js';

// the help card's picture: two clue cards on the found trail, a suspect tied on with your own thread
const BOARD_ART = `<svg viewBox="0 0 340 120" role="img" aria-label="A dark dashed thread joins two clues; a bright red thread ties a clue to a suspect">
  <rect width="340" height="120" rx="4" fill="#9b7448"/>
  <path d="M62 30 Q110 58 158 30" fill="none" stroke="rgba(179,32,42,.7)" stroke-width="2.2" stroke-dasharray="6 5"/>
  <path d="M158 30 Q220 70 278 30" fill="none" stroke="#d8323d" stroke-width="3.2"/>
  <g font-family="Big Shoulders Display, Arial Narrow, sans-serif" font-weight="800" font-size="13" fill="#1d1a16">
    <rect x="30" y="28" width="64" height="58" fill="#ede6d6"/><rect x="36" y="36" width="16" height="13" fill="#f2c230"/><text x="40" y="47">1</text><rect x="36" y="56" width="50" height="4" fill="#4a443b" opacity=".5"/><rect x="36" y="64" width="40" height="4" fill="#4a443b" opacity=".5"/>
    <rect x="126" y="28" width="64" height="58" fill="#ede6d6"/><rect x="132" y="36" width="16" height="13" fill="#f2c230"/><text x="136" y="47">2</text><rect x="132" y="56" width="50" height="4" fill="#4a443b" opacity=".5"/><rect x="132" y="64" width="40" height="4" fill="#4a443b" opacity=".5"/>
    <rect x="246" y="28" width="64" height="70" fill="#f6f1e4"/><rect x="252" y="34" width="52" height="38" fill="#c9bfa8"/><circle cx="278" cy="48" r="8" fill="#8d8068"/><path d="M262 72 Q278 56 294 72Z" fill="#8d8068"/><rect x="252" y="78" width="44" height="5" fill="#4a443b" opacity=".6"/>
  </g>
  <g fill="#b3202a"><circle cx="62" cy="30" r="4.5"/><circle cx="158" cy="30" r="4.5"/><circle cx="278" cy="30" r="4.5"/></g>
  <g font-family="Archivo, system-ui, sans-serif" font-size="11" font-weight="700" fill="#fff">
    <text x="64" y="112">found in order</text><text x="200" y="112">your link</text>
  </g>
</svg>`;

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
  // phones: unsaved cards are flowed into two columns after they are measured (see flowNarrow)
  const narrow = window.innerWidth < 700;
  const coarse = window.matchMedia?.('(pointer: coarse)').matches;
  const posOf = (id) => board.positions[id] || defaults[id];

  c.suspects.forEach((s) => {
    const id = `s:${s.id}`;
    const portrait = h('div', { class: 'portrait' });
    hasImage(s.img).then((ok) => { if (ok) portrait.style.backgroundImage = `url(${imgUrl(s.img)})`; else portrait.innerHTML = avatarSvg(s.look); });
    const stamp = h('div', { class: 'stamp' });
    const card = h('div', { class: 'pin-card is-suspect', 'data-id': id },
      h('span', { class: 'pin-grip', 'aria-hidden': 'true' }),
      portrait, stamp,
      h('h4', {}, s.name), h('p', {}, s.role),
      h('button', { class: 'btn btn--paper btn--small', style: { marginTop: '6px', width: '100%' }, onclick: (e) => { e.stopPropagation(); cycleMark(s.id, stamp); } }, 'Stamp'));
    renderMark(s.id, stamp);
    addCard(id, card);
  });
  evidence.forEach((l) => {
    const id = `e:${l.id}`;
    const card = h('div', { class: 'pin-card', 'data-id': id },
      h('span', { class: 'pin-grip', 'aria-hidden': 'true' }),
      h('span', { class: 'tag' }, String(l.evidence.tag)),
      h('h4', {}, l.evidence.title),
      h('p', {}, l.evidence.short),
      h('button', { class: 'pin-view', type: 'button', onclick: (e) => { e.stopPropagation(); if (!linkMode) view(l.id); else pick(id); } }, 'Read exhibit'));
    // tap the card (not a drag) to read the exhibit again
    addCard(id, card, () => view(l.id));
  });
  if (!evidence.length) cork.append(h('p', { class: 'doc board-empty', style: { position: 'absolute', left: '40px', top: '340px', color: 'var(--paper)', background: 'rgba(0,0,0,.4)', padding: '8px 12px' } }, 'No evidence yet. Every puzzle you solve pins a new exhibit here.'));

  function view(levelId) {
    sfx.click?.();
    openEvidence({ caseId, levelId, list: evidence });
  }

  function addCard(id, card, onTap) {
    const p = posOf(id);
    card.style.left = `${p.x}px`;
    card.style.top = `${p.y}px`;
    card.style.transform = `rotate(${((id.length * 7) % 5) - 2}deg)`;
    cards.set(id, card);
    cork.append(card);
    let drag = null;
    let draggedAt = 0; // a click that ends a drag is not a tap
    card.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      if (linkMode) { pick(id); return; }
      if (onTap && performance.now() - draggedAt > 350) onTap();
    });
    card.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button')) return;
      if (linkMode) return;
      // on touch screens only the grip drags, so the rest of the card scrolls the board
      if (e.pointerType === 'touch' && coarse && !e.target.closest('.pin-grip')) return;
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
      if (drag.moved) {
        draggedAt = performance.now();
        board.positions[id] = { x: parseFloat(card.style.left), y: parseFloat(card.style.top) };
      }
      card.style.cursor = '';
      card.style.zIndex = '';
      drag = null;
      save();
      fitCork();
    });
    card.addEventListener('pointercancel', () => {
      if (!drag) return;
      card.style.cursor = '';
      card.style.zIndex = '';
      drag = null;
    });
  }

  // grow the cork so every card stays reachable by scrolling
  function fitCork() {
    let w = 0, hh = 0;
    cards.forEach((el) => { w = Math.max(w, el.offsetLeft + el.offsetWidth); hh = Math.max(hh, el.offsetTop + el.offsetHeight); });
    cork.style.minWidth = `${Math.ceil(w + (narrow ? 8 : 24))}px`;
    cork.style.minHeight = `${Math.ceil(hh + 40)}px`;
  }

  // phones: lay unsaved cards out in two columns, suspects first, in the order they were pinned
  function flowNarrow() {
    if (!narrow) return;
    const area = cork.parentElement;
    const width = area?.clientWidth || window.innerWidth;
    const colW = (width - 16) / 2;
    const tops = [28, 28];
    cards.forEach((el, id) => {
      if (board.positions[id]) return;
      const col = tops[0] <= tops[1] ? 0 : 1;
      el.style.left = `${Math.round(8 + col * colW + (colW - el.offsetWidth) / 2)}px`;
      el.style.top = `${tops[col]}px`;
      tops[col] += el.offsetHeight + 30;
    });
    const empty = cork.querySelector('.board-empty');
    if (empty) { empty.style.left = '12px'; empty.style.right = '12px'; empty.style.top = `${Math.max(...tops)}px`; }
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
    threads.append(path);
    if (mine) {
      // a wide invisible twin takes the tap, so a 3px thread is easy to hit with a finger
      const hit = svgEl('path', { d, fill: 'none', stroke: 'transparent', 'stroke-width': 22, class: 'thread-hit' });
      hit.addEventListener('click', () => { board.links.splice(index, 1); save(); drawThreads(); toast('Thread removed.'); });
      hit.append(svgEl('title', {}, 'Tap to remove this thread'));
      threads.append(hit);
    }
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
  // back to a puzzle you already solved goes to the map instead of replaying it
  if (back === 'puzzle' && levelId && cs.solved[levelId]) back = 'map';
  const backTo = () => (back === 'puzzle' ? go('puzzle', { caseId, levelId }) : back === 'office' ? go('office') : go('map', { caseId }));
  const root = h('section', { class: 'screen board-screen' },
    h('header', { class: 'topbar' },
      backButton(back === 'puzzle' ? 'Back to the puzzle' : back === 'office' ? 'Office' : 'Case map', backTo, back === 'puzzle' ? 'Puzzle' : back === 'office' ? 'Office' : 'Map'),
      h('div', { class: 'topbar-title' }, h('strong', {}, 'Case board'), h('span', {}, `${evidence.length} ${evidence.length === 1 ? 'exhibit' : 'exhibits'}. ${coarse ? 'Drag a card by its grip to move it.' : 'Drag cards to arrange your theory.'}`)),
      h('div', { class: 'board-tools' },
        linkBtn,
        evidenceFileButton(caseId),
        h('button', { class: 'btn btn--small board-help-btn', type: 'button', 'aria-label': 'How the board works', title: 'How the board works', onclick: () => showHelp() }, h('span', { 'aria-hidden': 'true' }, '?')))),
    h('div', { class: 'board-legend', 'aria-label': 'Thread colours' },
      h('span', { class: 'bl-item' }, h('i', { class: 'bl-swatch bl-auto', 'aria-hidden': 'true' }), 'Dark dashed: the trail you found'),
      h('span', { class: 'bl-item' }, h('i', { class: 'bl-swatch bl-mine', 'aria-hidden': 'true' }), 'Bright red: your links')),
    h('div', { class: 'board-area' }, cork));
  host.append(root);

  // the board explained, once (state().seenBoardHelp), and again from the "?" button
  function showHelp() {
    const step = (n, title, text) => h('li', {}, h('span', { class: 'ht-num', 'aria-hidden': 'true' }, String(n)), h('span', { class: 'ht-step' }, h('b', {}, title), ' ', text));
    return showInfoCard({
      kicker: 'Case board',
      title: 'How the board works',
      anchor: { topbar: root.querySelector('.topbar') },
      build: () => [
        h('div', { class: 'bh-art', html: BOARD_ART }),
        h('ol', { class: 'ht-steps' },
          step(1, 'The dark dashed thread is automatic.', 'It joins your clues in the order you found them.'),
          step(2, 'The bright red thread is yours.', 'It is your theory. Tap "Red thread", then tap two cards, for example a clue and a suspect, to tie them together.'),
          step(3, 'Changed your mind?', 'Tap a bright thread to remove it.'),
          step(4, 'Arrange the board.', coarse ? 'Drag a card by its dotted grip. Stamp a suspect as Suspect, Cleared or Unsure.' : 'Drag cards around. Stamp a suspect as Suspect, Cleared or Unsure.'),
          step(5, 'Read a clue again.', 'Tap a clue card to see its photo and full text.')),
        h('p', { class: 'ht-note' }, 'What your links are for: in the deduction room, each suspect shows the clues you tied to them. They are your notes, not the answer.'),
      ],
    }).then((r) => {
      if (r === 'done' && !state().seenBoardHelp) { state().seenBoardHelp = true; save(); }
      return r;
    });
  }
  if (!state().seenBoardHelp) requestAnimationFrame(() => { if (root.isConnected) showHelp(); });
  requestAnimationFrame(() => { flowNarrow(); fitCork(); drawThreads(); });
  return {};
}
