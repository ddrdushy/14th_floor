// Timeline: put evidence frames in order. Feedback only says how many sit in the right place.
import { h } from '../core/ui.js';
import { shuffle } from '../core/rng.js';
import { sfx } from '../core/audio.js';

export const meta = { id: 'timeline', name: 'Timeline', category: 'Logic' };

export function mount(el, ctx) {
  const { params, rng, saved } = ctx;
  const byId = Object.fromEntries(params.frames.map((f) => [f.id, f]));
  let order = saved?.order || shuffle(rng, params.order);
  if (order.join() === params.order.join()) order = [...order].reverse();
  let tries = saved?.tries || 0;
  const locked = new Set(saved?.locked || []);
  const status = h('p', { class: 'feedback' });
  const list = h('ol', { class: 'tl-list' });
  const checkBtn = h('button', { class: 'btn btn--primary', onclick: check }, 'Check the order');
  el.append(
    h('p', { class: 'game-rules' }, 'Drag frames, or use the arrows, to put them in the order they happened. Read the clocks, then the details: where the lift is, what is still swinging, who is still wet.'),
    list,
    h('div', { class: 'game-toolbar' }, checkBtn, h('span', { class: 'doc tl-tries' })),
    status,
  );

  function persist() { ctx.onSave({ order, tries, locked: [...locked] }); }

  function move(i, d) {
    const j = i + d;
    if (j < 0 || j >= order.length) return;
    if (locked.has(order[i]) || locked.has(order[j])) return; // pinned frames stay put
    [order[i], order[j]] = [order[j], order[i]];
    sfx.click();
    persist();
    render();
  }

  let dragFrom = null;
  function render() {
    list.innerHTML = '';
    order.forEach((id, i) => {
      const f = byId[id];
      const li = h('li', { class: `tl-frame${locked.has(id) ? ' is-locked' : ''}`, draggable: locked.has(id) ? 'false' : 'true' },
        h('div', { class: 'tl-screen' }, h('span', { class: 'tl-clock' }, f.clock), h('span', { class: 'tl-cam' }, f.title)),
        h('p', { class: 'doc' }, f.text),
        h('div', { class: 'tl-move' },
          h('button', { class: 'btn btn--small', 'aria-label': 'Move earlier', onclick: () => move(i, -1), disabled: i === 0 || locked.has(id) || locked.has(order[i - 1]) }, '↑'),
          h('button', { class: 'btn btn--small', 'aria-label': 'Move later', onclick: () => move(i, 1), disabled: i === order.length - 1 || locked.has(id) || locked.has(order[i + 1]) }, '↓')));
      li.addEventListener('dragstart', (e) => { dragFrom = i; e.dataTransfer.effectAllowed = 'move'; li.classList.add('is-drag'); });
      li.addEventListener('dragend', () => li.classList.remove('is-drag'));
      li.addEventListener('dragover', (e) => e.preventDefault());
      li.addEventListener('drop', (e) => {
        e.preventDefault();
        if (dragFrom == null || dragFrom === i || locked.has(order[i]) || locked.has(order[dragFrom])) { dragFrom = null; return; }
        // swap, so frames pinned by the magnifier never shift position
        [order[dragFrom], order[i]] = [order[i], order[dragFrom]];
        dragFrom = null;
        persist();
        render();
      });
      list.append(li);
    });
    el.querySelector('.tl-tries').textContent = tries ? `${tries} ${tries === 1 ? 'check' : 'checks'} so far` : '';
  }

  function check() {
    tries++;
    const right = order.filter((id, i) => params.order[i] === id).length;
    ctx.onProgress(right / order.length);
    if (right === order.length) {
      sfx.solve();
      status.textContent = params.solvedText || 'The night plays back in order. And there is a seventeen-minute hole in it.';
      status.className = 'feedback is-good';
      checkBtn.disabled = true;
      ctx.onSolved();
    } else {
      sfx.bad();
      status.textContent = `${right} of ${order.length} frames are in the right place.`;
      status.className = 'feedback is-bad';
    }
    persist();
    render();
  }

  render();
  return {
    hint() {
      const i = order.findIndex((id, k) => params.order[k] !== id);
      if (i < 0) return null;
      const want = params.order[i];
      const j = order.indexOf(want);
      [order[i], order[j]] = [order[j], order[i]];
      if (locked.has(order[j])) locked.delete(order[j]);
      locked.add(want);
      persist(); render();
      return `Frame ${i + 1} is now correct and pinned in place.`;
    },
    devSolve() { order = params.order.slice(); render(); check(); },
  };
}
