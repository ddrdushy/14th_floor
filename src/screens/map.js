// Case map: the investigation pinned over a night street map of the district.
// Only what you have reached is visible: solved leads are pinned photos you can open again,
// the next lead is a red card, and the trail beyond disappears into a dashed "the trail goes on",
// so you never know how far the case runs.
//
// Layout (all presentation; case logic lives in data/cases.js):
//   wide screens   the case file is docked on the left; the red thread snakes across the map in
//                  rows (left to right, then back), photos hang below the thread, chapter names
//                  sit above it, and the turns happen in the margins, so nothing written ever
//                  crosses the thread
//   phones         the case file is a short summary at the top; the thread runs down a spine on
//                  the left with the cards to its right
import { h, svgEl, modal } from '../core/ui.js';
import { go } from '../core/router.js';
import { backButton, icon } from '../core/nav.js';
import { CASES, levelStatus, getCaseState, caseHeading, caseLabel, resolveCaseId, suspectBoard } from '../data/cases.js';
import { CATEGORY_OF } from '../games/registry.js';
import { app } from '../core/app.js';
import { sfx } from '../core/audio.js';
import { state, save } from '../core/state.js';
import { openEvidence, evidenceFileButton } from '../core/evidence-viewer.js';
import { paintInto, hasImage, imgUrl } from '../core/assets.js';
import { rngFor } from '../core/rng.js';

// the case file docks on the left on wide screens, and on landscape phones (too short for a summary on top)
const DOCK_MQ = '(min-width: 960px), (min-width: 700px) and (max-height: 500px)';
const SPINE_MAX = 620; // below this trail width the thread runs down a spine
const PREF_KEY = 'floor14.mapFile'; // per-browser convenience: docked case file open or closed

export function mount(host, { caseId, fresh = false } = {}) {
  caseId = resolveCaseId(caseId);
  // the street map covers the whole screen: stop drawing the 3D office underneath it
  app.scene.setMode('hidden');
  const c = CASES[caseId];
  const cs = getCaseState(caseId);
  const { levels, solved, current, allSolved } = levelStatus(c, cs);
  app.music?.play?.(c.music || 'investigation');
  const closed = cs.status === 'closed';
  const finalLabel = closed ? 'Case file' : (c.finalLabel || 'Name the killer');
  const goFinal = () => { sfx.click(); go(closed ? 'closed' : 'deduce', { caseId }); };

  const nodes = [];
  solved.forEach((l) => nodes.push({ kind: 'done', level: l }));
  if (current) nodes.push({ kind: 'current', level: current });
  const remaining = levels.length - solved.length - (current ? 1 : 0);
  if (remaining > 0) nodes.push({ kind: 'fog' });
  if (allSolved) nodes.push({ kind: 'final' });

  // ---------------------------------------------------------------------------------------------
  // the trail: one element per node, positioned by layout()

  const recent = Math.max(0, solved.length - 3); // older photos recede a little
  let lastPhase = null;
  nodes.forEach((n, i) => {
    const phase = n.level?.phase;
    if (phase && phase !== lastPhase) {
      n.phaseStart = phase;
      n.phaseEl = h('div', { class: 'map-phase map-label', role: 'heading', 'aria-level': '3' }, h('span', { class: 'mp-text' }, phase));
    }
    if (phase) lastPhase = phase;
    const tilt = n.kind === 'done' ? `${((rngFor(caseId, n.level.id)() - 0.5) * 5).toFixed(2)}deg` : '0deg';
    const style = { '--i': String(i), '--tilt': tilt };
    if (n.kind === 'done') {
      const ev = n.level.evidence;
      const photo = h('span', { class: 'mn-photo', 'aria-hidden': 'true' });
      paintInto(photo, ev.img, '', 'night');
      n.el = h('button', {
        class: `map-node is-done${i < recent ? ' is-old' : ''}`, type: 'button', style,
        'aria-label': `Exhibit ${ev.tag}, solved: ${ev.title}. View the evidence`,
        onclick: () => replay(n.level),
      },
      h('span', { class: 'map-pin', 'aria-hidden': 'true' }, String(ev.tag)),
      h('span', { class: 'mn-frame' }, photo, h('span', { class: 'mn-cap map-label' }, h('span', { class: 'mn-title' }, ev.title))));
    } else if (n.kind === 'current') {
      n.el = h('button', { class: 'map-node is-current', type: 'button', style, 'aria-label': `Next lead: ${n.level.title}. ${CATEGORY_OF[n.level.game] || ''} puzzle. Start`, onclick: () => open(n.level) },
        h('span', { class: 'map-pin', 'aria-hidden': 'true' }, '?'),
        h('span', { class: 'mn-card map-label' },
          h('span', { class: 'mn-kicker' }, 'Next lead'),
          h('span', { class: 'mn-lead' }, n.level.title),
          h('span', { class: 'mn-cat' }, CATEGORY_OF[n.level.game] || 'Puzzle'),
          h('span', { class: 'mn-start' }, 'Start')));
    } else if (n.kind === 'fog') {
      n.el = h('div', { class: 'map-node is-fog', style, role: 'img', 'aria-label': 'More of the case is hidden. The trail goes on.' },
        h('span', { class: 'map-pin', 'aria-hidden': 'true' }),
        h('span', { class: 'mn-card map-label', 'aria-hidden': 'true' }, h('span', { class: 'mn-dots' }, '…'), h('span', {}, 'The trail goes on')));
    } else {
      n.el = h('button', { class: `map-node is-final${closed ? ' is-closed' : ''}`, type: 'button', style, onclick: goFinal },
        h('span', { class: 'map-pin', 'aria-hidden': 'true' }),
        h('span', { class: 'mn-card map-label' },
          h('span', { class: 'mn-kicker' }, closed ? 'Case closed' : 'Every lead followed'),
          h('span', { class: 'mn-lead' }, finalLabel),
          h('span', { class: 'mn-cat' }, closed ? 'Read the closed file' : 'You decide who is charged')));
    }
  });

  const thread = svgEl('path', { class: 'map-thread', fill: 'none' });
  const threadShadow = svgEl('path', { class: 'map-thread-shadow', fill: 'none' });
  const tail = svgEl('path', { class: 'map-thread-tail', fill: 'none' });
  const ties = svgEl('g', { class: 'map-ties' });
  const threadSvg = svgEl('svg', { class: 'map-threads', 'aria-hidden': 'true' }, ties, threadShadow, thread, tail);
  // DOM order follows the trail (chapter name, then its leads) so keyboard and screen readers read it in order
  const canvas = h('div', { class: 'map-canvas is-intro' }, threadSvg, nodes.map((n) => [n.phaseEl, n.el]));
  const scroll = h('div', { class: 'map-scroll', tabindex: '-1' }, canvas);
  const trail = h('div', { class: 'map-trail' }, scroll);

  // ---------------------------------------------------------------------------------------------
  // the case file

  const docked = window.matchMedia(DOCK_MQ);
  let pref = null;
  try { pref = localStorage.getItem(PREF_KEY); } catch { /* no storage: defaults */ }
  let open_ = docked.matches ? pref !== 'closed' : false;

  const hintsLeft = cs.hints ?? 0;
  const sus = suspectBoard(c, cs);
  const pinnedIds = new Set(sus.pinned.map((x) => x.id));
  const stat = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const actions = [];
  if (current) {
    actions.push(h('button', { class: 'btn btn--primary mf-continue', type: 'button', onclick: () => open(current) },
      h('span', { class: 'mf-btn-main' }, 'Continue'), h('span', { class: 'mf-btn-sub' }, current.title)));
  }
  if (allSolved) actions.push(h('button', { class: `btn btn--primary mf-final${closed ? ' is-closed' : ''}`, type: 'button', onclick: goFinal }, finalLabel));
  actions.push(h('button', { class: 'btn btn--paper mf-board', type: 'button', onclick: () => go('board', { caseId, back: 'map' }) }, 'Case board'));
  const evBtn = evidenceFileButton(caseId);
  evBtn.classList.add('btn--paper');
  actions.push(evBtn);

  const fileToggle = h('button', { class: 'mf-toggle', type: 'button', 'aria-controls': 'map-file-more', onclick: () => setOpen(!open_) },
    h('span', { class: 'mf-toggle-label' }), h('span', { class: 'mf-toggle-ico', 'aria-hidden': 'true', html: chevron() }));
  const fileTab = h('button', { class: 'mf-tab', type: 'button', 'aria-label': 'Show the case file', title: 'Show the case file', onclick: () => setOpen(true) },
    h('span', { class: 'mf-tab-ico', 'aria-hidden': 'true', html: icon('board') }), h('span', {}, 'Case file'));

  const file = h('aside', { class: 'map-file', 'aria-label': `Case file, ${caseHeading(c)}` },
    h('p', { class: 'mf-kicker' }, caseLabel(c)),
    h('div', { class: 'mf-sheet' },
    h('div', { class: 'mf-head' },
      h('h2', { class: 'mf-title' }, c.title),
      closed ? h('span', { class: 'mf-stamp', 'aria-label': 'Case closed' }, 'Closed') : null,
      fileToggle),
    h('p', { class: 'mf-question' }, c.question || ''),
    h('div', { class: 'mf-stats' },
      h('span', { class: 'mf-stat' }, h('b', {}, String(solved.length)), ` ${solved.length === 1 ? 'exhibit' : 'exhibits'} found`),
      h('span', { class: 'mf-stat', title: 'Magnifiers left for this case' }, h('span', { class: 'mf-mag', 'aria-hidden': 'true', html: icon('puzzle') }),
        h('b', {}, String(hintsLeft)), cs.hintsMax ? ` of ${cs.hintsMax} magnifiers left` : ` ${hintsLeft === 1 ? 'magnifier' : 'magnifiers'} left`)),
    (c.suspects || []).length ? h('div', { class: 'mf-suspects' },
      h('h3', { class: 'mf-sub' }, 'Persons of interest'),
      // only the people your clues have named so far; the "?" slot never says how many are left
      h('ul', {}, sus.revealed.map((s) => {
        const waiting = !pinnedIds.has(s.id);
        const face = h('span', { class: 'mf-face', 'aria-hidden': 'true' }, h('span', { class: 'mf-initials' }, initials(s.name)));
        hasImage(s.img).then((ok) => { if (ok) { face.style.backgroundImage = `url(${imgUrl(s.img)})`; face.classList.add('has-img'); } });
        return h('li', { class: `mf-suspect${waiting ? ' is-waiting' : ''}`, title: waiting ? `${s.name}, ${s.role}. Not pinned yet: pin them on the case board.` : `${s.name}, ${s.role}` },
          face, h('span', { class: 'mf-sname' }, shortName(s.name)), h('span', { class: 'sr-only' }, `, ${s.role}${waiting ? '. Not pinned to the board yet' : ''}`));
      }), sus.hidden ? h('li', { class: 'mf-suspect is-unknown', title: sus.revealed.length ? 'More to find. Keep following the clues.' : 'Nobody yet. The clues will name them.' },
        h('span', { class: 'mf-face', 'aria-hidden': 'true' }, h('span', { class: 'mf-initials' }, '?')),
        h('span', { class: 'mf-sname' }, sus.revealed.length ? 'More to find' : 'None yet'),
        h('span', { class: 'sr-only' }, sus.revealed.length ? '. More persons of interest to find.' : '. No persons of interest yet. The clues will name them.')) : null)) : null,
    h('div', { class: 'mf-more', id: 'map-file-more' },
      h('dl', { class: 'mf-facts' },
        h('div', {}, h('dt', {}, 'Victim'), h('dd', {}, c.victim || '')),
        h('div', {}, h('dt', {}, 'Where'), h('dd', {}, c.place || ''))),
      h('div', { class: 'mf-actions' }, actions))));

  const city = cityMap(c);
  const body = h('div', { class: 'map-body' }, city, file, fileTab, trail);

  const root = h('section', { class: 'screen map-screen' },
    h('header', { class: 'topbar' },
      backButton('Office', () => go('office')),
      h('div', { class: 'topbar-title' }, h('strong', {}, caseHeading(c)), h('span', {}, `${c.place}. ${stat(solved.length, 'exhibit', 'exhibits')} found.`)),
      evidenceFileButton(caseId),
      h('button', { class: 'btn btn--small map-help-btn', type: 'button', 'aria-label': 'How the map works', title: 'How the map works', onclick: () => (tip.isConnected ? hideTip() : showTip()) }, h('span', { 'aria-hidden': 'true' }, '?')),
      h('button', { class: 'btn btn--small nav-dup', onclick: () => go('board', { caseId, back: 'map' }) }, 'Case board')),
    body);
  host.append(root);

  function setOpen(v, { remember = true } = {}) {
    open_ = v;
    root.classList.toggle('file-open', v);
    fileToggle.setAttribute('aria-expanded', String(v));
    const isDocked = docked.matches;
    fileToggle.querySelector('.mf-toggle-label').textContent = isDocked ? 'Hide' : (v ? 'Less' : 'Details');
    fileToggle.setAttribute('aria-label', isDocked ? 'Hide the case file' : (v ? 'Show less of the case file' : 'Show the whole case file'));
    if (remember && isDocked) { try { localStorage.setItem(PREF_KEY, v ? 'open' : 'closed'); } catch { /* ignore */ } }
    if (!v && isDocked && file.contains(document.activeElement)) fileTab.focus({ preventScroll: true });
  }
  const onDock = () => {
    root.classList.toggle('is-docked', docked.matches);
    let p = null;
    try { p = localStorage.getItem(PREF_KEY); } catch { /* ignore */ }
    setOpen(docked.matches ? p !== 'closed' : false, { remember: false });
  };
  root.classList.toggle('is-docked', docked.matches);
  setOpen(open_, { remember: false });
  docked.addEventListener?.('change', onDock);

  // ---------------------------------------------------------------------------------------------
  // a small note explaining the map, shown once (state().seenMapHelp) and again from the "?" button
  const tip = h('aside', { class: 'map-tip', role: 'note', 'aria-label': 'How the map works' },
    h('button', { class: 'map-tip-x', type: 'button', 'aria-label': 'Close the tip', onclick: () => hideTip() }, h('span', { 'aria-hidden': 'true' }, '×')),
    h('h3', {}, 'Reading the map'),
    h('ul', {},
      h('li', {}, h('span', { class: 'mt-ico mt-line', 'aria-hidden': 'true' }), h('span', {}, h('b', {}, 'The red thread '), 'is your trail of leads.')),
      h('li', {}, h('span', { class: 'mt-ico mt-done', 'aria-hidden': 'true' }, '1'), h('span', {}, h('b', {}, 'Pinned photos: '), 'solved. Tap one to read its evidence again.')),
      h('li', {}, h('span', { class: 'mt-ico mt-cur', 'aria-hidden': 'true' }, '?'), h('span', {}, h('b', {}, 'Red card: '), 'your next lead. Tap Start to play.')),
      h('li', {}, h('span', { class: 'mt-ico mt-fog', 'aria-hidden': 'true' }, '…'), h('span', {}, h('b', {}, 'Dashed card: '), 'more leads ahead. Nobody tells you how many.')),
      h('li', {}, h('span', { class: 'mt-ico mt-poi', 'aria-hidden': 'true' }, '?'), h('span', {}, h('b', {}, 'Persons of interest '), 'appear in the case file as your clues name them. You pin them to the board yourself.'))),
    h('button', { class: 'btn btn--paper btn--small map-tip-ok', type: 'button', onclick: () => hideTip() }, 'Got it'));
  // the tip sits just under the top bar: the next lead is scrolled into view lower down
  function showTip() {
    root.append(tip);
    tip.style.top = `${(root.querySelector('.topbar')?.offsetHeight || 64) + 12}px`;
  }
  function hideTip() {
    tip.remove();
    if (!state().seenMapHelp) { state().seenMapHelp = true; save(); }
  }

  // ---------------------------------------------------------------------------------------------
  // layout: place every node, chapter name and the thread for the current size

  let lastSize = '';
  let firstLayout = true;
  function layout() {
    if (root.classList.contains('is-docked') !== docked.matches) onDock();
    const W = scroll.clientWidth;
    const H = scroll.clientHeight;
    if (!W || !H) return;
    const size = `${W}x${H}`;
    if (size === lastSize) return;
    lastSize = size;
    const spine = W < SPINE_MAX;
    if (spine) setScale(1);
    canvas.classList.toggle('is-spine', spine);
    canvas.classList.toggle('is-rows', !spine);
    nodes.forEach((n) => { n.el.style.width = ''; if (n.phaseEl) n.phaseEl.style.maxWidth = ''; });
    const height = spine ? layoutSpine(W) : layoutRows(W, H);
    canvas.style.height = `${Math.max(height, H)}px`;
    for (const n of nodes) {
      n.el.style.left = `${n.left}px`;
      n.el.style.top = `${n.top}px`;
    }
    drawThread(spine);
    threadSvg.setAttribute('viewBox', `0 0 ${W} ${Math.max(height, H)}`);
    threadSvg.setAttribute('width', W);
    threadSvg.setAttribute('height', Math.max(height, H));
    // keep the next lead (or the final card) in view
    const focus = nodes.find((n) => n.kind === 'current' || n.kind === 'final') || nodes[nodes.length - 1];
    if (focus) {
      const top = focus.top;
      const bottom = focus.top + focus.el.offsetHeight;
      const view = scroll.clientHeight;
      if (bottom > scroll.scrollTop + view - 16 || top < scroll.scrollTop + 8) {
        scroll.scrollTop = Math.max(0, Math.min(top - 24 - (spine ? 0 : 40), (top + bottom) / 2 - view / 2 + (spine ? 80 : 40)));
      }
    }
    if (canvas.classList.contains('is-intro')) {
      canvas.style.setProperty('--len', String(Math.ceil(thread.getTotalLength?.() || 0) || 1));
      if (firstLayout) setTimeout(() => canvas.classList.remove('is-intro'), 2800);
    }
    firstLayout = false;
  }

  // wide: rows of photos hanging from the thread, alternating direction
  // pack the nodes into rows of about the same length (so the last row is never a lone card)
  function packRows(W) {
    const M = W < 900 ? 52 : 76; // side margin, where the thread turns
    const GAP = Math.round(30 * scale);
    const usable = W - 2 * M;
    const sizes = nodes.map((n) => ({ w: n.el.offsetWidth + GAP, h: n.el.offsetHeight - pinDrop(n) }));
    const sum = sizes.reduce((a, b) => a + b.w, 0);
    const want = Math.max(1, Math.ceil(sum / usable));
    const target = sum / want;
    const rows = [];
    let row = [];
    let rw = 0;
    nodes.forEach((n, i) => {
      const { w } = sizes[i];
      if (row.length && (rw + w > usable || (rw + w / 2 > target && rows.length < want - 1))) { rows.push({ items: row, w: rw }); row = []; rw = 0; }
      row.push(n);
      rw += w;
    });
    if (row.length) rows.push({ items: row, w: rw });
    const BAND = Math.round(58 * Math.min(scale, 1.15));
    let total = 20;
    rows.forEach((r) => { total += BAND + Math.max(...r.items.map((n) => sizes[nodes.indexOf(n)].h)) + 40; });
    return { rows, total, GAP, BAND };
  }

  // wide: rows of photos hanging from the thread, alternating direction; as big as the space allows
  let scale = 1;
  const setScale = (v) => { scale = v; canvas.style.setProperty('--ms', String(v)); };
  function layoutRows(W, H) {
    let pack = null;
    // bigger on big screens (never so big that a row holds only a couple of cards)
    for (const v of [1.75, 1.6, 1.45, 1.35, 1.25, 1.15, 1.05, 1, 0.92].filter((x) => x <= 1.45 || x <= W / 1100)) {
      setScale(v);
      const p = packRows(W);
      if (p.total <= H - 8) { pack = p; break; }
    }
    if (!pack) { setScale(1); pack = packRows(W); }
    const { rows, GAP, BAND } = pack;
    const widthOf = (n) => n.el.offsetWidth + GAP;
    const maxW = Math.max(...rows.map((r) => r.w));
    const x0 = Math.round((W - maxW) / 2);
    let y = 20;
    rows.forEach((r, ri) => {
      const rev = ri % 2 === 1;
      const pinY = y + BAND;
      let x = rev ? x0 + maxW : x0;
      r.pinY = pinY;
      r.rev = rev;
      let maxH = 0;
      r.items.forEach((n, k) => {
        const w = widthOf(n);
        const cx = rev ? x - w / 2 : x + w / 2;
        x = rev ? x - w : x + w;
        const py = pinY + ((k + ri) % 2 ? 5 : -5);
        n.pin = { x: cx, y: py };
        n.cell = { l: cx - w / 2, r: cx + w / 2 };
        n.row = ri;
        n.left = Math.round(cx - n.el.offsetWidth / 2);
        n.top = Math.round(py - pinDrop(n));
        maxH = Math.max(maxH, n.el.offsetHeight - pinDrop(n));
      });
      y = pinY + maxH + 40;
    });
    // chapter names: above the thread, over the run of photos in that chapter on this row
    nodes.forEach((n, i) => {
      if (!n.phaseEl) return;
      const r = rows[n.row];
      let j = i;
      while (j + 1 < nodes.length && nodes[j + 1].row === n.row && nodes[j + 1].level?.phase === n.phaseStart && !nodes[j + 1].phaseEl) j++;
      const run = nodes.slice(i, j + 1);
      const l = Math.min(...run.map((m) => m.cell.l));
      const rr = Math.max(...run.map((m) => m.cell.r));
      const el = n.phaseEl;
      el.style.maxWidth = `${Math.max(90, rr - l - 12)}px`;
      const ew = el.offsetWidth;
      const eh = el.offsetHeight;
      el.style.left = `${Math.round(r.rev ? n.cell.r - 6 - ew : n.cell.l + 6)}px`;
      el.style.top = `${Math.round(r.pinY - 5 - 22 - eh)}px`;
      el.classList.toggle('is-rev', r.rev);
    });
    // centre a short trail in the space
    const total = y;
    const shift = total < H ? Math.round((H - total) / 2.4) : 0;
    if (shift) {
      for (const n of nodes) { n.top += shift; n.pin.y += shift; }
      rows.forEach((r) => { r.pinY += shift; });
      nodes.forEach((n) => { if (n.phaseEl) n.phaseEl.style.top = `${parseFloat(n.phaseEl.style.top) + shift}px`; });
    }
    layoutRows.rows = rows;
    layoutRows.box = { x0, maxW };
    return total + shift;
  }

  // phones: the thread down a spine on the left, the cards to its right
  function layoutSpine(W) {
    const SPINE = 28;
    const CARD_L = 58;
    let y = 18;
    nodes.forEach((n) => {
      n.el.style.width = `${W - CARD_L - 12}px`;
      if (n.phaseEl) {
        const el = n.phaseEl;
        el.style.maxWidth = `${W - CARD_L - 12}px`;
        el.style.left = `${CARD_L}px`;
        el.style.top = `${y}px`;
        el.classList.remove('is-rev');
        y += el.offsetHeight + 10;
      }
      n.left = CARD_L;
      n.top = y;
      n.pin = { x: SPINE, y: y + 24 };
      y += n.el.offsetHeight + (n.kind === 'done' ? 14 : 20);
    });
    return y + 12;
  }

  // where the pin sits relative to the node's top edge (photos hang from it)
  function pinDrop() { return 0; }

  function drawThread(spine) {
    const pts = nodes.map((n) => n.pin);
    const cut = nodes.findIndex((n) => n.kind === 'fog'); // the dashed bit into the unknown
    let d = '';
    let dt = '';
    ties.replaceChildren();
    if (spine) {
      const p0 = pts[0];
      d = `M ${p0.x} ${Math.max(0, p0.y - 40)} L ${p0.x} ${p0.y}`;
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1];
        const b = pts[i];
        const wob = i % 2 ? 7 : -7;
        const seg = ` C ${a.x + wob} ${a.y + (b.y - a.y) * 0.35}, ${b.x - wob} ${a.y + (b.y - a.y) * 0.65}, ${b.x} ${b.y}`;
        if (i === cut) dt = `M ${a.x} ${a.y}${seg}`;
        else d += seg;
      }
      nodes.forEach((n) => {
        ties.append(svgEl('line', { x1: n.pin.x + 12, y1: n.pin.y, x2: n.left, y2: n.pin.y }));
      });
    } else {
      const rows = layoutRows.rows;
      const { x0, maxW } = layoutRows.box;
      const p0 = pts[0];
      d = `M ${p0.x - 70} ${p0.y - 4} Q ${p0.x - 35} ${p0.y + 6}, ${p0.x} ${p0.y}`;
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1];
        const b = pts[i];
        let seg;
        if (nodes[i].row === nodes[i - 1].row) {
          const sag = Math.min(26, Math.abs(b.x - a.x) * 0.12);
          seg = ` Q ${(a.x + b.x) / 2} ${Math.max(a.y, b.y) + sag}, ${b.x} ${b.y}`;
        } else {
          // turn in the margin: right after a left-to-right row, left after a right-to-left one
          const rightTurn = !rows[nodes[i - 1].row].rev;
          const xe = rightTurn ? x0 + maxW + 4 : x0 - 4;
          const k = rightTurn ? 1 : -1;
          const bulge = xe + k * 40;
          seg = ` Q ${(a.x + xe) / 2} ${a.y + 10}, ${xe} ${a.y}`
            + ` C ${bulge} ${a.y}, ${bulge} ${b.y}, ${xe} ${b.y}`
            + ` Q ${(xe + b.x) / 2} ${b.y + 10}, ${b.x} ${b.y}`;
        }
        if (i === cut) dt = `M ${a.x} ${a.y}${seg}`;
        else d += seg;
      }
    }
    thread.setAttribute('d', d);
    threadShadow.setAttribute('d', d);
    tail.setAttribute('d', dt);
  }

  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => requestAnimationFrame(layout)) : null;
  ro?.observe(scroll);
  const onResize = () => requestAnimationFrame(layout);
  if (!ro) window.addEventListener('resize', onResize);
  // fonts change the size of every card: lay out again once they are in
  document.fonts?.ready?.then(() => { lastSize = ''; layout(); });
  requestAnimationFrame(layout);

  const firstTip = !state().seenMapHelp;
  if (fresh && !solved.length) {
    setTimeout(() => modal({
      title: caseHeading(c),
      body: h('div', {}, h('p', { class: 'doc' }, c.brief), h('p', {}, c.mapIntro || 'Every puzzle you solve uncovers one piece of evidence. Nobody will tell you how many pieces there are. When you have enough, you name the killer yourself.')),
      buttons: [{ label: 'Start the investigation', kind: 'primary', value: true }],
    }).then(() => { if (firstTip && root.isConnected) showTip(); }), 600);
  } else if (firstTip) showTip();

  function open(level) {
    sfx.click();
    go('puzzle', { caseId, levelId: level.id });
  }

  // a solved node: look at its evidence again (photo, full text, when it was found)
  function replay(level) {
    sfx.click();
    openEvidence({ caseId, levelId: level.id });
  }

  return {
    destroy() {
      ro?.disconnect();
      window.removeEventListener('resize', onResize);
      docked.removeEventListener?.('change', onDock);
    },
  };
}

const chevron = () => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 5.5 8 12l6.5 6.5" /></svg>';
const HONORIFIC = /^(Dr|Mrs|Mr|Ms|Madam|Encik|Puan|Datuk|Dato'?|Tan Sri|Inspector)\.?\s+/i;
const shortName = (name) => name.replace(HONORIFIC, '').split(/\s+/)[0];
const initials = (name) => name.replace(HONORIFIC, '').split(/\s+/).slice(0, 2).map((w) => w[0]).join('');

// -----------------------------------------------------------------------------------------------
// The street map under the thread: drawn from the case's place, never from image files.
// Streets, the main roads (sodium-lit), water, and the names of the districts around the case.

const PLACES = [
  {
    match: /kiara|kuala lumpur/i, grid: [52, 70], angle: -16, water: 'river',
    districts: ['Mont Kiara', 'Sri Hartamas', 'Segambut', 'Damansara Heights', 'Bangsar', 'Brickfields', 'Kampung Baru', 'Chow Kit', 'Bukit Bintang', 'Sentul'],
    roads: ['Jalan Duta', 'Lebuhraya Sprint', 'Jalan Kuching', 'Jalan Tun Razak'], waterName: 'Sungai Klang',
  },
  {
    match: /petaling|ss2/i, grid: [40, 52], angle: 8, water: 'lake',
    districts: ['SS2', 'SS3', 'Damansara Utama', 'Taman Paramount', 'Seksyen 17', 'SEA Park', 'Kelana Jaya', 'Bandar Utama'],
    roads: ['Lebuhraya Persekutuan', 'Lebuhraya LDP', 'Jalan SS2/24', 'Jalan Universiti'], waterName: 'Tasik Kelana Jaya',
  },
  {
    match: /klang|pulau indah/i, grid: [64, 96], angle: 24, water: 'coast-left', yards: true,
    districts: ['Port Klang', 'Pulau Indah', 'Westport', 'Northport', 'Pandamaran', 'Teluk Gong', 'Klang', 'Pulau Ketam'],
    roads: ['Lebuhraya Shapadu', 'Jalan Pelabuhan Utara', 'Jalan Pulau Indah'], waterName: 'Selat Melaka',
  },
  {
    match: /george town|penang/i, grid: [30, 40], angle: -6, water: 'coast-right',
    districts: ['George Town', 'Lebuh Chulia', 'Lebuh Armenian', 'Pengkalan Weld', 'Jelutong', 'Air Itam', 'Lebuh Campbell', 'Pulau Tikus'],
    roads: ['Lebuh Chulia', 'Jalan Penang', 'Lebuh Pantai', 'Jalan Masjid Kapitan Keling'], waterName: 'Selat Utara',
  },
  {
    match: /colombo|sri lanka/i, grid: [36, 50], angle: -12, water: 'coast-left', yards: true,
    districts: ['Pettah', 'Fort', 'Kotahena', 'Slave Island', 'Kollupitiya', 'Bloemendhal', 'Port City', 'Mount Lavinia', 'Wellawatte', 'Borella'],
    roads: ['Galle Road', 'Sea Street', 'Main Street', 'Sir James Peiris Mawatha', 'Baseline Road'], waterName: 'Indian Ocean',
  },
];

function cityMap(c) {
  const place = c.place || '';
  const base = PLACES.find((p) => p.match.test(place));
  const parts = place.split(',').map((s) => s.trim()).filter(Boolean);
  const P = base || { grid: [46, 64], angle: 10, water: 'none', districts: parts, roads: [], waterName: '' };
  const r = rngFor('citymap', c.id || place);
  const VW = 1600;
  const VH = 1000;
  const svg = svgEl('svg', { class: 'map-city', viewBox: `0 0 ${VW} ${VH}`, preserveAspectRatio: 'xMidYMid slice', 'aria-hidden': 'true', focusable: 'false' });
  const defs = svgEl('defs', {},
    svgEl('pattern', { id: 'mc-hatch', width: 9, height: 9, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(35)' },
      svgEl('line', { x1: 0, y1: 0, x2: 0, y2: 9, class: 'mc-hatch' })));
  svg.append(defs);

  // minor streets: two crossing families, broken into blocks
  const streets = svgEl('g', { class: 'mc-streets' });
  const [s0, s1] = P.grid;
  for (const [ang, sp] of [[P.angle, s0], [P.angle + 90 + (r() - 0.5) * 8, s1]]) {
    const g = svgEl('g', { transform: `rotate(${ang.toFixed(1)} ${VW / 2} ${VH / 2})` });
    for (let y = -500; y < VH + 500; y += sp * (0.7 + r() * 0.6)) {
      let x = -500;
      let d = '';
      while (x < VW + 500) {
        const len = 90 + r() * 320;
        if (r() > 0.18) d += `M ${x.toFixed(0)} ${y.toFixed(0)} h ${len.toFixed(0)} `;
        x += len + r() * 34;
      }
      g.append(svgEl('path', { d }));
    }
    streets.append(g);
  }
  svg.append(streets);

  // container yards at the port
  if (P.yards) {
    const yard = svgEl('g', { class: 'mc-yard', transform: `rotate(${P.angle} ${VW / 2} ${VH / 2})` });
    for (let k = 0; k < 5; k++) {
      const bx = 380 + r() * 900;
      const by = 120 + r() * 700;
      for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) {
        yard.append(svgEl('rect', { x: (bx + i * 26).toFixed(0), y: (by + j * 13).toFixed(0), width: 22, height: 9 }));
      }
    }
    svg.append(yard);
  }

  // water
  const water = svgEl('g', { class: 'mc-water' });
  let waterLabel = null;
  if (P.water === 'river') {
    const y0 = 260 + r() * 300;
    const d = `M -40 ${y0} C 300 ${y0 - 160}, 520 ${y0 + 220}, 820 ${y0 + 90} S 1260 ${y0 + 260}, 1660 ${y0 + 120}`;
    water.append(svgEl('path', { d, class: 'mc-river-bank' }), svgEl('path', { d, class: 'mc-river', id: 'mc-river' }));
    waterLabel = svgEl('text', { class: 'mc-water-name', dy: -16 }, svgEl('textPath', { href: '#mc-river', startOffset: '62%' }, P.waterName));
  } else if (P.water === 'lake') {
    const cx = 1180 + r() * 200;
    const cy = 700 + r() * 120;
    const d = `M ${cx - 150} ${cy} C ${cx - 140} ${cy - 90}, ${cx + 40} ${cy - 110}, ${cx + 120} ${cy - 40} S ${cx + 110} ${cy + 100}, ${cx - 10} ${cy + 80} S ${cx - 160} ${cy + 70}, ${cx - 150} ${cy} Z`;
    water.append(svgEl('path', { d, class: 'mc-sea' }), svgEl('path', { d, class: 'mc-sea-hatch' }), svgEl('path', { d, class: 'mc-shore' }));
    waterLabel = svgEl('text', { class: 'mc-water-name', x: cx - 70, y: cy + 10 }, P.waterName);
  } else if (P.water === 'coast-left' || P.water === 'coast-right') {
    const left = P.water === 'coast-left';
    const pts = [];
    for (let y = -40; y <= VH + 40; y += 70) pts.push([(left ? 300 : 1310) + (r() - 0.5) * 110 + (left ? -1 : 1) * Math.sin(y / 190) * 60, y]);
    const edge = pts.map(([x, y], i) => `${i ? 'L' : 'M'} ${x.toFixed(0)} ${y}`).join(' ');
    const d = left ? `${edge} L -60 ${VH + 40} L -60 -40 Z` : `${edge} L ${VW + 60} ${VH + 40} L ${VW + 60} -40 Z`;
    water.append(svgEl('path', { d, class: 'mc-sea' }), svgEl('path', { d, class: 'mc-sea-hatch' }), svgEl('path', { d: edge, class: 'mc-shore' }));
    // an island offshore
    const ix = left ? 120 : 1480;
    const iy = 300 + r() * 400;
    const isl = `M ${ix - 60} ${iy} C ${ix - 50} ${iy - 50}, ${ix + 40} ${iy - 60}, ${ix + 60} ${iy - 10} S ${ix + 20} ${iy + 60}, ${ix - 20} ${iy + 50} S ${ix - 70} ${iy + 30}, ${ix - 60} ${iy} Z`;
    water.append(svgEl('path', { d: isl, class: 'mc-island' }));
    waterLabel = svgEl('text', { class: 'mc-water-name', x: left ? 70 : 1400, y: 140 + r() * 60, 'text-anchor': 'start' }, P.waterName);
  }
  svg.append(water);

  // main roads: dark casing, asphalt, a faint sodium glow down the middle
  const roads = svgEl('g', { class: 'mc-roads' });
  const names = svgEl('g', { class: 'mc-road-names' });
  P.roads.forEach((name, i) => {
    const horiz = i % 2 === 0;
    let d;
    if (horiz) {
      const y1 = 120 + r() * 760;
      const y2 = 120 + r() * 760;
      d = `M -40 ${y1.toFixed(0)} C 500 ${(y1 + (r() - 0.5) * 300).toFixed(0)}, 1100 ${(y2 + (r() - 0.5) * 300).toFixed(0)}, 1640 ${y2.toFixed(0)}`;
    } else {
      const x1 = 200 + r() * 1200;
      const x2 = 200 + r() * 1200;
      d = `M ${x1.toFixed(0)} -40 C ${(x1 + (r() - 0.5) * 400).toFixed(0)} 360, ${(x2 + (r() - 0.5) * 400).toFixed(0)} 640, ${x2.toFixed(0)} 1040`;
    }
    const id = `mc-road-${i}`;
    roads.append(svgEl('path', { d, class: 'mc-road-case' }), svgEl('path', { d, class: 'mc-road', id }), svgEl('path', { d, class: 'mc-road-glow' }));
    names.append(svgEl('text', { class: 'mc-road-name', dy: -9 }, svgEl('textPath', { href: `#${id}`, startOffset: `${(18 + r() * 50).toFixed(0)}%` }, name)));
  });
  svg.append(roads, names);
  if (waterLabel) svg.append(waterLabel);

  // district names, scattered without touching each other; the case's own district is the biggest
  const dist = svgEl('g', { class: 'mc-districts' });
  const boxes = [];
  P.districts.forEach((name, i) => {
    const fs = i === 0 ? 66 : 46;
    const w = name.length * fs * 0.78;
    for (let tries = 0; tries < 40; tries++) {
      const x = i === 0 ? 520 + r() * 420 : 30 + r() * (VW - 60 - w);
      const y = i === 0 ? 560 + r() * 200 : 80 + r() * (VH - 120);
      const b = { l: x - 30, r: x + w + 30, t: y - fs - 24, b: y + 24 };
      if (b.r > VW + 10 || boxes.some((o) => b.l < o.r && b.r > o.l && b.t < o.b && b.b > o.t)) continue;
      boxes.push(b);
      dist.append(svgEl('text', { x: x.toFixed(0), y: y.toFixed(0), class: i === 0 ? 'mc-district is-home' : 'mc-district' }, name));
      break;
    }
  });
  svg.append(dist);

  // north arrow
  svg.append(svgEl('g', { class: 'mc-north', transform: `translate(${VW - 70} ${VH - 90})` },
    svgEl('path', { d: 'M 0 -26 L 9 8 L 0 2 L -9 8 Z' }),
    svgEl('text', { x: 0, y: 28, 'text-anchor': 'middle' }, 'U')));

  return h('div', { class: 'map-city-wrap', 'aria-hidden': 'true' }, svg);
}
