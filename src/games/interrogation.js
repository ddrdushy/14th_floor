// Interrogation: question a suspect, catch the lie, break it with the right evidence.
//
// The suspect answers in character through a language model (functions/api/ai/interrogate.js), built from
// the case file on the server. Each answer shows the canonical statements it contained as chips. Each
// player gets ONE of the level's lies (picked by the seeded rng), so a cheat sheet from another player
// does not help. Pin the lying statement, present the card that disproves it, and the story breaks.
// Without a model (no AI configured, offline, the puzzle lab) the suspect answers from the case file,
// and the level plays the same way.
//
// params:
//   setting      'Interview room 3, Bukit Aman. 2:10 AM.'
//   suspect      { id, name, role, persona }      (portrait: assets/img/sus_<id>.jpg when it exists)
//   facts        [{ id, topic, claim }]           true statements
//   lies         [{ id, topic, claim, truth, exposedBy }]   one is picked per player
//   evidence     [{ id, title, text }]            cards the player can present
//   secret       what they never admit (server side only)
//   suggested    ['Where were you at eleven?', …] question ideas (shown as placeholder text)
//   maxQuestions typed questions allowed (default 14; "Ask about" chips are always free)
//   clue         story note pinned above the interview
import '../styles/games-d/interrogation.css';
import { h, toast } from '../core/ui.js';
import { sfx } from '../core/audio.js';
import { hasImage, imgUrl } from '../core/assets.js';
import { playerId } from '../core/telemetry.js';

export const meta = { id: 'interrogation', name: 'Interrogation', category: 'Interrogation' };

export const demo = {
  params: {
    setting: 'Back office, Restoran Bala. 11:40 PM.',
    suspect: { id: 'demo', name: 'Mr. Wong', role: 'night manager, 52', persona: 'Polite, tired, answers short. Says "lah" when nervous.' },
    facts: [
      { id: 'f1', topic: 'when he closed up', claim: 'I closed the shutters at eleven, same as always.' },
      { id: 'f2', topic: 'who was here', claim: 'Only me and the dishwasher, Raju, tonight.' },
      { id: 'f3', topic: 'the cash box', claim: 'The cash box goes in the safe at ten forty-five.' },
    ],
    lies: [
      { id: 'l1', topic: 'the back door', claim: 'The back door was locked all night, I checked it myself.', truth: 'He propped it open for a delivery.', exposedBy: 'e1' },
      { id: 'l2', topic: 'his phone', claim: 'My phone was dead the whole evening.', truth: 'He made two calls at 10:50.', exposedBy: 'e2' },
    ],
    evidence: [
      { id: 'e1', title: 'Door wedge', text: 'A folded cardboard wedge, still in the back door jamb, wet with rain.' },
      { id: 'e2', title: 'Phone bill', text: 'Two outgoing calls from his number at 10:50 PM.' },
      { id: 'e3', title: 'Receipt roll', text: 'The last sale rang up at 10:38 PM.' },
    ],
    suggested: ['What time did you close?', 'Was the back door locked?', 'Did you call anyone?'],
    maxQuestions: 10,
    clue: 'Practice room. In a case, the suspect answers in their own words.',
  },
};

export const howTo = {
  goal: 'Catch the suspect in a lie and break it with the right evidence.',
  steps: [
    'Ask questions. Type your own, or tap a topic under "Ask about".',
    'Under each answer, the statements they made show as chips.',
    'Find the one that is a lie. Tap it to pin it.',
    'Tap the evidence card that proves it false, then press Break the story.',
  ],
  example: {
    caption: 'He says the back door was locked all night. The wet door wedge proves it was not.',
    render(el) {
      el.append(h('div', { class: 'iq-howto' },
        h('p', { class: 'iq-a' }, h('span', { class: 'iq-who' }, 'Mr. Wong'), '"Locked. I checked it myself, lah."',
          h('span', { class: 'iq-claims' }, h('span', { class: 'iq-claim is-pinned' }, 'The back door was locked all night.'))),
        h('span', { class: 'iq-card is-picked' }, h('b', {}, 'Door wedge'), h('small', {}, 'Still in the jamb, wet with rain.'))));
    },
  },
  tips: [
    'Every player gets a different lie. Listen, do not guess.',
    'Topic chips never run out. Typed questions are limited.',
    'A wrong card costs nothing but pride. The suspect will enjoy it.',
  ],
  controls: {
    touch: 'Type and tap Ask, or tap a topic. Tap a statement chip, tap a card, then Break the story.',
    keys: 'Type a question and press Enter. Tab to chips and cards, Space or Enter to pick them.',
  },
};

let aiStatus = null; // Promise<boolean>
function aiOn() {
  if (!aiStatus) {
    aiStatus = (async () => {
      try {
        if (!/^https?:$/.test(location.protocol)) return false;
        const r = await fetch('./api/ai/status', { cache: 'no-store', credentials: 'same-origin' });
        const d = r.ok ? await r.json().catch(() => null) : null;
        return !!(d && d.ok && d.ai);
      } catch { return false; }
    })();
  }
  return aiStatus;
}

export function mount(el, ctx) {
  const p = ctx.params || demo.params;
  const sus = p.suspect || {};
  const facts = p.facts || [];
  const lies = p.lies || [];
  const evidence = p.evidence || [];
  const maxQ = Math.max(3, Math.min(30, p.maxQuestions || 14));
  const rng = ctx.rng;

  // ---------- state ----------
  const sv = ctx.saved && ctx.saved.v === 1 && lies.some((l) => l.id === ctx.saved.lie) ? ctx.saved : null;
  const lie = sv ? lies.find((l) => l.id === sv.lie) : lies[Math.floor(rng() * lies.length)];
  const turns = sv ? sv.turns.slice(0, 60) : []; // { q, a, claims, kind: 'q' | 'topic' | 'confront' }
  let asked = sv ? sv.asked || 0 : 0;
  let strikes = sv ? sv.strikes || 0 : 0;
  let hinted = sv ? sv.hinted || 0 : 0;
  let pinned = null;
  let picked = null;
  let waiting = false;
  let done = false;
  const statements = Object.fromEntries([...facts, lie].map((x) => [x.id, x]));
  // the topics, shuffled per player so the lie is not always in the same place
  const topics = [...facts, ...lies].map((x) => ({ id: x.id, topic: x.topic })).sort(() => rng() - 0.5);

  const persist = () => ctx.onSave({ v: 1, lie: lie.id, turns, asked, strikes, hinted });
  const surfaced = () => turns.some((t) => (t.claims || []).includes(lie.id));
  const progress = () => {
    if (done) return 1;
    let v = Math.min(0.25, turns.length * 0.03);
    if (surfaced()) v = Math.max(v, 0.4);
    if (pinned === lie.id) v = Math.max(v, 0.6);
    if (pinned === lie.id && picked === lie.exposedBy) v = 0.8;
    return v;
  };

  // ---------- server ----------
  async function askServer(payload) {
    const caseId = ctx.caseId, levelId = ctx.levelId;
    if (caseId && levelId && (await aiOn())) {
      try {
        const res = await fetch('./api/ai/interrogate', {
          method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ player_id: playerId(), case_id: caseId, level_id: levelId, lie_id: lie.id,
            history: turns.filter((t) => t.kind !== 'confront').slice(-12).map((t) => ({ q: t.q, a: t.a })), ...payload }),
        });
        const d = await res.json().catch(() => null);
        if (res.ok && d && d.ok && d.reply) return d;
        if (res.status === 429) return { reply: `${sus.name} looks at the clock. "Slow down, detective. One question at a time."`, claims: [], wait: true };
      } catch { /* offline: fall back to the case file */ }
    }
    return local(payload);
  }
  function local({ topic, confront }) {
    if (confront) {
      const right = confront.claim === lie.id && confront.evidence === lie.exposedBy;
      return { reply: right ? `${sus.name} stares at the card. "...Okay. It was not like that. Not exactly."` : `${sus.name} pushes the card back. "So? That proves nothing about me."`, claims: [] };
    }
    const c = statements[topic];
    if (c) return { reply: `"${c.claim}"`, claims: [c.id] };
    if (lies.some((l) => l.id === topic)) return { reply: `"I don't remember. Ask me something else."`, claims: [] };
    return { reply: `${sus.name} shrugs. "Ask me something I can actually answer."`, claims: [] };
  }

  // ---------- view ----------
  const portrait = sus.id && hasImage(`sus_${sus.id}`) ? h('img', { class: 'iq-photo', src: imgUrl(`sus_${sus.id}`), alt: '' }) : h('span', { class: 'iq-photo iq-photo--blank', 'aria-hidden': 'true' }, (sus.name || '?').slice(0, 1));
  const head = h('div', { class: 'iq-head' }, portrait,
    h('div', {}, h('b', { class: 'iq-name' }, sus.name || 'Suspect'), h('span', { class: 'iq-role' }, sus.role || ''), h('span', { class: 'iq-setting' }, p.setting || '')));
  const log = h('div', { class: 'iq-log', role: 'log', 'aria-live': 'polite', 'aria-label': `Interview with ${sus.name}` });
  const input = h('input', { class: 'iq-input', type: 'text', maxlength: 240, autocomplete: 'off', placeholder: (p.suggested && p.suggested[0]) || 'Ask a question…', 'aria-label': 'Your question',
    onkeydown: (e) => { if (e.key === 'Enter') { e.preventDefault(); ask(); } } });
  const askBtn = h('button', { class: 'btn btn--small iq-askbtn', onclick: () => ask() }, 'Ask');
  const left = h('span', { class: 'iq-left' });
  const topicRow = h('div', { class: 'iq-topics', role: 'group', 'aria-label': 'Ask about' });
  const cards = h('div', { class: 'iq-cards', role: 'group', 'aria-label': 'Evidence' });
  const pickLine = h('p', { class: 'iq-pick' });
  const breakBtn = h('button', { class: 'btn btn--primary iq-break', disabled: true, onclick: () => confront() }, 'Break the story');
  const status = h('p', { class: 'iq-status', role: 'status' });

  el.append(h('div', { class: 'iq' },
    p.clue ? h('p', { class: 'sc-clue' }, h('span', { class: 'sc-clue-pin', 'aria-hidden': 'true' }), p.clue) : null,
    head, log,
    h('div', { class: 'iq-askrow' }, input, askBtn), left,
    h('p', { class: 'iq-label' }, 'Ask about'), topicRow,
    h('p', { class: 'iq-label' }, 'Present evidence'), cards,
    pickLine, breakBtn, status));

  const sp = (when) => { if (when) setTimeout(() => { log.scrollTop = log.scrollHeight; }, 30); };

  function chip(id) {
    const c = statements[id];
    return h('button', { class: `iq-claim${pinned === id ? ' is-pinned' : ''}`, 'aria-pressed': String(pinned === id), disabled: done,
      onclick: () => { pinned = pinned === id ? null : id; sfx.pin(); render(); } }, c.claim);
  }
  function renderLog() {
    log.replaceChildren(...(turns.length ? [] : [h('p', { class: 'iq-empty' }, `${sus.name} sits down and folds their arms. Ask your first question.`)]),
      ...turns.flatMap((t) => {
        const cl = (t.claims || []).filter((c) => statements[c]);
        // an answer straight from the case file is just the statement: show it once, as the chip
        const plain = cl.length === 1 && t.a === `"${statements[cl[0]].claim}"`;
        return [
          t.kind === 'confront' ? h('p', { class: 'iq-q iq-q--card' }, `You show: ${t.q}`) : h('p', { class: `iq-q${t.kind === 'topic' ? ' iq-q--topic' : ''}` }, t.q),
          h('div', { class: 'iq-a' }, h('span', { class: 'iq-who' }, sus.name), plain ? null : h('span', { class: 'iq-text' }, t.a),
            cl.length ? h('span', { class: 'iq-claims' }, cl.map(chip)) : null),
        ];
      }),
      ...(waiting ? [h('p', { class: 'iq-a iq-thinking' }, h('span', { class: 'iq-who' }, sus.name), h('span', { class: 'iq-dots', 'aria-label': 'thinking' }, '…'))] : []));
    sp(true);
  }
  function render() {
    renderLog();
    const qLeft = Math.max(0, maxQ - asked);
    left.textContent = done ? '' : `${qLeft} typed question${qLeft === 1 ? '' : 's'} left. Topics are free.`;
    input.disabled = askBtn.disabled = done || waiting || qLeft <= 0;
    topicRow.replaceChildren(...topics.map((t) => h('button', { class: 'chip iq-topic', disabled: done || waiting, onclick: () => askTopic(t) }, t.topic)));
    cards.replaceChildren(...evidence.map((e) => h('button', { class: `iq-card${picked === e.id ? ' is-picked' : ''}`, 'aria-pressed': String(picked === e.id), disabled: done,
      onclick: () => { picked = picked === e.id ? null : e.id; sfx.click(); render(); } }, h('b', {}, e.title), h('small', {}, e.text))));
    const pc = pinned && statements[pinned];
    const pe = picked && evidence.find((e) => e.id === picked);
    pickLine.replaceChildren(
      h('span', {}, 'Statement: ', pc ? h('q', {}, pc.claim) : h('i', {}, 'tap one under an answer')),
      h('br'),
      h('span', {}, 'Evidence: ', pe ? h('b', {}, pe.title) : h('i', {}, 'tap a card')));
    breakBtn.disabled = done || waiting || !pc || !pe;
    ctx.onProgress(progress());
  }

  async function turn(q, payload, kind) {
    if (done || waiting) return null;
    waiting = true;
    render();
    const d = await askServer(payload);
    waiting = false;
    if (d.wait) { status.textContent = d.reply; render(); return null; }
    turns.push({ q, a: d.reply, claims: (d.claims || []).filter((c) => statements[c]), kind });
    persist();
    render();
    return d;
  }
  async function ask() {
    const q = input.value.replace(/\s+/g, ' ').trim();
    if (!q || waiting || done || asked >= maxQ) return;
    sfx.key();
    asked++;
    input.value = '';
    await turn(q, { question: q }, 'q');
  }
  async function askTopic(t) {
    sfx.click();
    await turn(`Asks about ${t.topic}.`, { question: `Tell me about ${t.topic}.`, topic: t.id }, 'topic');
  }
  async function confront() {
    if (!pinned || !picked || done) return;
    const right = pinned === lie.id && picked === lie.exposedBy;
    const ev = evidence.find((e) => e.id === picked);
    const d = await turn(ev.title, { question: '', confront: { claim: pinned, evidence: picked } }, 'confront');
    if (!d) return;
    if (right) {
      done = true;
      sfx.good();
      status.textContent = 'Statement broken.';
      el.querySelector('.iq')?.classList.add('is-broken');
      persist();
      render();
      setTimeout(() => ctx.onSolved(), 1600);
    } else {
      strikes++;
      sfx.bad();
      status.textContent = pinned !== lie.id ? 'That statement holds up. Keep listening.' : 'True, that is the lie. But this card does not break it.';
      picked = null;
      persist();
      render();
    }
  }

  render();
  aiOn().then((on) => { if (!on && ctx.caseId) status.textContent = 'Answers come from the case file today (the AI room is offline).'; });

  return {
    hint() {
      if (done) return null;
      hinted++;
      persist();
      if (!surfaced()) return `Ask ${sus.name} about "${lie.topic}".`;
      if (pinned !== lie.id) return `One statement is a lie: "${lie.claim}" Pin it.`;
      const e = evidence.find((x) => x.id === lie.exposedBy);
      return `Show the card "${e?.title}".`;
    },
    devSolve() {
      if (done) return;
      if (!surfaced()) turns.push({ q: `Asks about ${lie.topic}.`, a: `"${lie.claim}"`, claims: [lie.id], kind: 'topic' });
      pinned = lie.id;
      picked = lie.exposedBy;
      render();
      confront();
    },
    destroy() { done = true; },
  };
}
