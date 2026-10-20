// Number series: a set of sequences, each answer typed in. Used for the lift controller log.
import { h } from '../core/ui.js';
import { sfx } from '../core/audio.js';

export const meta = { id: 'series', name: 'Number Series', category: 'Pattern' };

export function mount(el, ctx) {
  const { params, saved } = ctx;
  const items = params.items;
  const solved = new Set(saved?.solved || []);
  const tries = saved?.tries || {};
  const hinted = new Set(saved?.hinted || []);
  const status = h('p', { class: 'feedback' });
  const rows = items.map((it, i) => {
    const input = h('input', { class: 'text-input series-input', inputmode: 'numeric', 'aria-label': `Answer for sequence ${i + 1}`, autocomplete: 'off' });
    const note = h('p', { class: 'series-note' });
    const btn = h('button', { class: 'btn btn--small', onclick: () => check(i) }, 'Check');
    input.addEventListener('keydown', (e) => e.key === 'Enter' && check(i));
    const row = h('li', { class: 'series-row' },
      h('p', { class: 'series-prompt doc' }, it.prompt),
      h('div', { class: 'series-answer' }, input, btn),
      note);
    return { row, input, btn, note };
  });
  el.append(
    h('p', { class: 'game-rules' }, 'Each line is a sequence or a rule. Type the number that belongs where the question mark is.'),
    h('ol', { class: 'series-list' }, rows.map((r) => r.row)),
    status,
  );

  function persist() { ctx.onSave({ solved: [...solved], tries, hinted: [...hinted] }); }

  function render() {
    rows.forEach((r, i) => {
      const done = solved.has(i);
      r.row.classList.toggle('is-done', done);
      r.input.disabled = done;
      r.btn.disabled = done;
      if (done) r.input.value = items[i].answer;
      if (hinted.has(i) && !done) r.note.textContent = `Lab note: ${items[i].hint}`;
      else if (!done && tries[i]) r.note.textContent = `${tries[i]} wrong ${tries[i] === 1 ? 'try' : 'tries'}.`;
      else r.note.textContent = '';
    });
    ctx.onProgress(solved.size / items.length);
    if (solved.size === items.length) {
      status.textContent = 'The controller unlocks its stop log.';
      status.className = 'feedback is-good';
      ctx.onSolved();
    }
  }

  function check(i) {
    const v = Number(rows[i].input.value.trim());
    if (v === items[i].answer) {
      solved.add(i);
      sfx.good();
    } else {
      tries[i] = (tries[i] || 0) + 1;
      sfx.bad();
    }
    persist();
    render();
  }

  render();
  return {
    hint() {
      const i = items.findIndex((_, k) => !solved.has(k) && !hinted.has(k));
      if (i < 0) return null;
      hinted.add(i);
      persist();
      render();
      return `A note was added under sequence ${i + 1}.`;
    },
    devSolve() { items.forEach((_, i) => solved.add(i)); render(); },
  };
}
