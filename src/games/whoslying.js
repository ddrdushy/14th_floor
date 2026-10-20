// Who's lying: each person is wholly truthful or wholly lying. Find the one consistent assignment.
import { h } from '../core/ui.js';
import { sfx } from '../core/audio.js';

export const meta = { id: 'whoslying', name: "Who's Lying", category: 'Profiling' };

export function mount(el, ctx) {
  const { params, saved } = ctx;
  const people = params.people;
  const verdict = saved?.verdict || {}; // id -> 'truth' | 'lie'
  let tries = saved?.tries || 0;
  let hints = saved?.hints || 0;
  const status = h('p', { class: 'feedback' });

  const cards = people.map((p) => {
    const btnT = h('button', { class: 'chip', 'aria-pressed': 'false', onclick: () => set(p.id, 'truth') }, 'Telling the truth');
    const btnL = h('button', { class: 'chip', 'aria-pressed': 'false', onclick: () => set(p.id, 'lie') }, 'Lying');
    const card = h('article', { class: 'wl-card' },
      h('h3', {}, p.name),
      h('ul', { class: 'doc' }, p.says.map((s) => h('li', {}, s.t, s.note ? h('small', { class: 'wl-note' }, ` ${s.note}`) : null))),
      h('div', { class: 'chips' }, btnT, btnL));
    return { p, card, btnT, btnL };
  });
  const submit = h('button', { class: 'btn btn--primary', onclick: check }, 'Give Farah your verdict');
  el.append(
    h('p', { class: 'game-rules' }, 'A truthful person says only true things. A liar says only false things. One assignment fits every statement.'),
    h('div', { class: 'wl-grid' }, cards.map((c) => c.card)),
    h('div', { class: 'game-toolbar' }, submit),
    status,
  );

  function set(id, v) {
    verdict[id] = v;
    sfx.click();
    ctx.onSave({ verdict, tries, hints });
    render();
  }

  function render() {
    cards.forEach(({ p, card, btnT, btnL }) => {
      btnT.setAttribute('aria-pressed', String(verdict[p.id] === 'truth'));
      btnL.setAttribute('aria-pressed', String(verdict[p.id] === 'lie'));
      card.classList.toggle('is-lie', verdict[p.id] === 'lie');
    });
    submit.disabled = people.some((p) => !verdict[p.id]);
  }

  const truthful = (id) => verdict[id] === 'truth';
  function statementTrue(s, self) {
    if (s.fact !== undefined) return s.fact;
    if (s.atLeast) return people.filter((q) => q.id !== self && !truthful(q.id)).length >= s.atLeast;
    return truthful(s.about) === s.is;
  }

  function check() {
    tries++;
    const broken = people.filter((p) => p.says.some((s) => statementTrue(s, p.id) !== truthful(p.id)));
    const liars = people.filter((p) => !truthful(p.id)).map((p) => p.id).sort();
    const correct = liars.join() === [...params.liars].sort().join();
    ctx.onProgress(correct ? 1 : (people.length - broken.length) / people.length * 0.8);
    if (correct) {
      sfx.solve();
      status.textContent = params.solvedLine || 'Farah nods slowly. "Three liars. Let us see who paid them."';
      status.className = 'feedback is-good';
      submit.disabled = true;
      ctx.onSolved();
    } else {
      sfx.bad();
      status.textContent = `That does not hold. ${broken.length} ${broken.length === 1 ? 'person\'s statements contradict' : 'people\'s statements contradict'} your verdict.`;
      status.className = 'feedback is-bad';
    }
    ctx.onSave({ verdict, tries, hints });
  }

  render();
  return {
    hint() {
      hints++;
      if (hints === 1) {
        ctx.onSave({ verdict, tries, hints });
        return 'Start with the one statement you can check against hard evidence. Then follow who vouches for whom.';
      }
      // later magnifiers settle one person for you, in the order the logic unfolds
      const order = [...people].sort((a, b) => (b.says.some((s) => s.fact !== undefined) ? 1 : 0) - (a.says.some((s) => s.fact !== undefined) ? 1 : 0));
      const p = order.find((q) => verdict[q.id] !== (params.liars.includes(q.id) ? 'lie' : 'truth'));
      if (!p) return null;
      verdict[p.id] = params.liars.includes(p.id) ? 'lie' : 'truth';
      ctx.onSave({ verdict, tries, hints });
      render();
      return `Farah's notes settle it: ${p.name} is ${verdict[p.id] === 'lie' ? 'lying' : 'telling the truth'}.`;
    },
    devSolve() { people.forEach((p) => { verdict[p.id] = params.liars.includes(p.id) ? 'lie' : 'truth'; }); render(); check(); },
  };
}
