// Theory: write the case in your own words, the way a prosecutor needs it.
//
// The report is judged on the server (functions/api/ai/judge.js) by TypeSafe Jev: one typed yes/no
// question per point the case file needs. Points found stay found across tries. There is no option to
// pick, so a cheat sheet of answers does not help much: you have to be able to say what happened.
// Without the server (offline, the puzzle lab) the points are matched by their keyword groups.
//
// params:
//   prompt    what to write ('Who pushed him, who ordered it, why, and how the kancil got into his hand.')
//   context   one or two sentences of case background for the judge (server side)
//   points    [{ id, label, criterion, keywords: [[alternatives], [alternatives]], hint }]
//             label: shown on the checklist; criterion: what the judge checks; keywords: offline fallback
//             (every group needs one hit); hint: a nudge for the magnifier
//   need      points needed to solve (default: all)
//   clue      story note pinned above
import '../styles/games-d/theory.css';
import { h } from '../core/ui.js';
import { sfx } from '../core/audio.js';
import { playerId } from '../core/telemetry.js';

export const meta = { id: 'theory', name: 'Case Theory', category: 'Deduction' };

export const demo = {
  params: {
    prompt: 'Who took the cash box, how did they get out, and why?',
    points: [
      { id: 'who', label: 'Who took it', criterion: 'Says the night manager, Mr. Wong, took the cash box.', keywords: [['wong', 'manager']], hint: 'Whose key opens the safe?' },
      { id: 'how', label: 'How they got out', criterion: 'Says he left by the back door that he had wedged open.', keywords: [['back door', 'wedge']], hint: 'The wet cardboard in the door jamb.' },
      { id: 'why', label: 'Why', criterion: 'Says he did it to pay a gambling debt.', keywords: [['debt', 'owe', 'gambl']], hint: 'The two calls at 10:50 were to a bookie.' },
    ],
    need: 3,
    clue: 'Practice report. In a case, a real prosecutor reads it.',
  },
};

export const howTo = {
  goal: 'Write what happened, in your own words, so the case holds up.',
  steps: [
    'Read the checklist: it says what the prosecutor needs.',
    'Write a short report: who, how, why. Any language is fine.',
    'Press File the report. Points you got right are ticked.',
    'Missing some? Add them and file again. Ticks stay ticked.',
  ],
  example: {
    caption: 'One clear sentence per point is enough.',
    render(el) {
      el.append(h('div', { class: 'th-howto' },
        h('p', { class: 'th-sample' }, '"Wong wedged the back door, took the cash box at 10:55 and walked out. He owed a bookie."'),
        h('ul', { class: 'th-list' }, ['Who took it', 'How they got out', 'Why'].map((x) => h('li', { class: 'is-found' }, h('span', { 'aria-hidden': 'true' }, '✓'), x)))));
    },
  },
  tips: [
    'Name one person for each act. Listing everyone gets the report sent back.',
    'Times, places and objects from the evidence make it stronger.',
  ],
  controls: { touch: 'Type in the box, then tap File the report.', keys: 'Type, then Ctrl+Enter (or Cmd+Enter) to file.' },
};

function keywordMatch(point, text) {
  const t = ` ${text.toLowerCase().replace(/[^\p{L}\p{N}' ]+/gu, ' ')} `;
  return (point.keywords || []).length > 0 && point.keywords.every((group) => group.some((w) => t.includes(String(w).toLowerCase())));
}

export function mount(el, ctx) {
  const p = ctx.params || demo.params;
  const points = p.points || [];
  const need = Math.max(1, Math.min(points.length, p.need || points.length));
  const sv = ctx.saved && ctx.saved.v === 1 ? ctx.saved : null;
  const found = new Set((sv?.found || []).filter((id) => points.some((x) => x.id === id)));
  const hinted = new Set(sv?.hinted || []);
  let tries = sv?.tries || 0;
  let busy = false;
  let done = found.size >= need;

  const persist = () => ctx.onSave({ v: 1, text: area.value, found: [...found], hinted: [...hinted], tries });
  const area = h('textarea', { class: 'th-area', rows: 7, maxlength: 1200, 'aria-label': 'Your report', placeholder: 'Write it plainly: who did it, how, and why…',
    oninput: () => { count.textContent = `${area.value.trim().split(/\s+/).filter(Boolean).length} words`; clearTimeout(area.t); area.t = setTimeout(persist, 600); },
    onkeydown: (e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); file(); } } });
  area.value = sv?.text || '';
  const count = h('span', { class: 'th-count' }, `${area.value.trim().split(/\s+/).filter(Boolean).length} words`);
  const list = h('ul', { class: 'th-list', 'aria-label': 'What the prosecutor needs' });
  const btn = h('button', { class: 'btn btn--primary th-file', onclick: () => file() }, 'File the report');
  const status = h('p', { class: 'th-status', role: 'status', 'aria-live': 'polite' });

  el.append(h('div', { class: 'th' },
    p.clue ? h('p', { class: 'sc-clue' }, h('span', { class: 'sc-clue-pin', 'aria-hidden': 'true' }), p.clue) : null,
    h('p', { class: 'th-prompt' }, p.prompt || 'Write what happened.'),
    h('p', { class: 'th-label' }, `The prosecutor needs ${need === points.length ? 'all' : need} of these`), list,
    area, h('div', { class: 'th-row' }, count, btn), status));

  function render() {
    list.replaceChildren(...points.map((pt) => h('li', { class: found.has(pt.id) ? 'is-found' : '' },
      h('span', { 'aria-hidden': 'true' }, found.has(pt.id) ? '✓' : '·'), pt.label,
      !found.has(pt.id) && hinted.has(pt.id) && pt.hint ? h('small', {}, pt.hint) : null)));
    btn.disabled = busy || done;
    area.disabled = done;
    ctx.onProgress(done ? 1 : Math.min(0.9, (found.size / need) * 0.9));
  }

  async function judge(text) {
    if (ctx.caseId && ctx.levelId && /^https?:$/.test(location.protocol)) {
      try {
        const res = await fetch('./api/ai/judge', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ player_id: playerId(), case_id: ctx.caseId, level_id: ctx.levelId, text }) });
        const d = await res.json().catch(() => null);
        if (res.ok && d?.ok) return d;
        if (res.status === 429) return { wait: true };
      } catch { /* offline: keywords */ }
    }
    return { found: points.filter((pt) => keywordMatch(pt, text)).map((pt) => pt.id) };
  }

  async function file() {
    if (busy || done) return;
    const text = area.value.trim();
    if (text.split(/\s+/).filter(Boolean).length < 6) { status.textContent = 'Write a little more. A prosecutor needs sentences, not a shrug.'; return; }
    busy = true;
    status.textContent = 'The prosecutor is reading…';
    render();
    const d = await judge(text);
    busy = false;
    if (d.wait) { status.textContent = 'The prosecutor is still reading the last one. Give it a minute.'; render(); return; }
    tries++;
    const before = found.size;
    (d.found || []).forEach((id) => found.add(id));
    const fresh = found.size - before;
    if (d.gaming) { sfx.bad(); status.textContent = 'Sent back: "One story, detective. One name for each thing that happened."'; }
    else if (found.size >= need) {
      done = true;
      sfx.good();
      status.textContent = 'The prosecutor signs it. "This will hold."';
      persist();
      render();
      setTimeout(() => ctx.onSolved(), 1200);
      return;
    } else if (fresh > 0) { sfx.good(); status.textContent = `Ticked ${fresh} more. Still missing ${need - found.size}.`; }
    else { sfx.bad(); status.textContent = `Nothing new the prosecutor can use. Still missing ${need - found.size}.`; }
    persist();
    render();
  }

  render();
  return {
    hint() {
      if (done) return null;
      const pt = points.find((x) => !found.has(x.id) && !hinted.has(x.id)) || points.find((x) => !found.has(x.id));
      if (!pt) return null;
      hinted.add(pt.id);
      persist();
      render();
      return pt.hint ? `${pt.label}: ${pt.hint}` : `Say clearly: ${pt.label.toLowerCase()}.`;
    },
    devSolve() { points.forEach((pt) => found.add(pt.id)); done = true; persist(); render(); ctx.onSolved(); },
    destroy() {},
  };
}
