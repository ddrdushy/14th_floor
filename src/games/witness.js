// Witness recall: read a statement once against the clock, then answer from memory.
import { h, fmtTime } from '../core/ui.js';
import { shuffle } from '../core/rng.js';
import { sfx } from '../core/audio.js';

export const meta = { id: 'witness', name: 'Witness Recall', category: 'Memory' };

export function mount(el, ctx) {
  const { params, rng, saved } = ctx;
  let attempt = saved?.attempt || 0;
  let timer = null;
  let asking = null; // { qs, answers, list } while the questions are on screen
  const status = h('p', { class: 'feedback' });
  const body = h('div', { class: 'wit-body' });
  el.append(h('p', { class: 'game-rules' }, `You get ${params.readSeconds} seconds with the statement. Then it goes back in the file and you answer ${params.questions.length} questions. ${params.pass} correct answers convince Farah to take it seriously.`), body, status);

  function intro() {
    body.innerHTML = '';
    body.append(
      h('p', { class: 'doc' }, attempt ? (params.retryLine || 'Farah sighs and slides the statement back across the table.') : (params.introLine || 'Mrs. Lee folds her hands. "Only once, ah. I am tired."')),
      h('button', { class: 'btn btn--primary', onclick: read }, attempt ? 'Read it again' : 'Read the statement'),
    );
  }

  function read() {
    body.innerHTML = '';
    let left = params.readSeconds;
    const clock = h('p', { class: 'wit-clock doc' }, fmtTime(left));
    const paper = h('div', { class: 'wit-paper doc' },
      h('p', { class: 'wit-head' }, params.header || 'Statement of Lee Mei Fong, 71, Unit 15-3. Recorded 1:15 AM.'),
      params.statement.map((p) => h('p', {}, p)));
    const done = h('button', { class: 'btn', onclick: () => ask() }, "I'm ready");
    body.append(clock, paper, done);
    ctx.onProgress(0.15);
    timer = setInterval(() => {
      left--;
      clock.textContent = fmtTime(left);
      if (left <= 10) clock.classList.add('is-low');
      if (left <= 0) ask();
    }, 1000);
  }

  function ask() {
    clearInterval(timer);
    body.innerHTML = '';
    const qs = shuffle(rng, params.questions.map((q, i) => ({ ...q, i })));
    const answers = new Map();
    const submit = h('button', { class: 'btn btn--primary', disabled: true, onclick: () => grade(qs, answers) }, 'Hand in your answers');
    const list = h('ol', { class: 'wit-qs' }, qs.map((q) => h('li', {},
      h('p', { class: 'wit-q' }, q.q),
      h('div', { class: 'chips' }, q.options.map((opt, oi) => {
        const b = h('button', { class: 'chip', 'aria-pressed': 'false', onclick: () => {
          answers.set(q.i, oi);
          b.parentElement.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', 'false'));
          b.setAttribute('aria-pressed', 'true');
          submit.disabled = answers.size < qs.length;
          ctx.onProgress(0.2 + (answers.size / qs.length) * 0.4);
        } }, opt);
        return b;
      })))));
    body.append(list, submit);
    asking = { qs, list, answers, submit };
  }

  function grade(qs, answers) {
    asking = null;
    const right = qs.filter((q) => answers.get(q.i) === q.a).length;
    attempt++;
    ctx.onSave({ attempt });
    if (right >= params.pass) {
      sfx.good();
      status.textContent = `${right} of ${qs.length}. Farah writes it all down.`;
      status.className = 'feedback is-good';
      body.querySelectorAll('button').forEach((b) => { b.disabled = true; });
      ctx.onSolved();
    } else {
      sfx.bad();
      status.textContent = `${right} of ${qs.length}. Not enough. Farah will not put a shaky memory in her report.`;
      status.className = 'feedback is-bad';
      intro();
    }
  }

  intro();
  return {
    destroy: () => clearInterval(timer),
    hint() {
      if (!asking) return 'Times, words in Malay, and small details like names. Witness answers hide in those.';
      // strike out one wrong option on a question that still has more than two choices
      const items = [...asking.list.children];
      for (let k = 0; k < asking.qs.length; k++) {
        const q = asking.qs[k];
        const chips = [...items[k].querySelectorAll('.chip')];
        const wrong = chips.filter((c, oi) => oi !== q.a && !c.disabled);
        if (wrong.length > 1) {
          const c = wrong[0];
          if (c.getAttribute('aria-pressed') === 'true') { asking.answers.delete(q.i); asking.submit.disabled = true; }
          c.disabled = true;
          c.setAttribute('aria-pressed', 'false');
          c.style.textDecoration = 'line-through';
          c.style.opacity = '0.45';
          return `Farah taps question ${k + 1}: "Not that one."`;
        }
      }
      return null;
    },
    devSolve() { ctx.onSolved(); },
  };
}
