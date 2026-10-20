// DNA gel: compare the crime scene lane with the suspects' lanes, band by band.
// Profiles are built from six loci with two alleles each; relatives share most bands, so the
// differences are a single allele step. Variant 'mixed': the scene sample holds two people.
// Tools: a draggable ruler that reads base pairs off the ladder, and zoom.
import { h } from '../core/ui.js';
import { shuffle, pick } from '../core/rng.js';
import { sfx } from '../core/audio.js';

export const meta = { id: 'dna', name: 'DNA Gel', category: 'Forensics' };
export const demo = { variant: 'single', params: { suspects: 7 } };

const LOCI = [[105, 160], [185, 255], [290, 390], [430, 580], [640, 860], [940, 1260]];
const RATIO = 1.036;
const KMAX = LOCI.map(([lo, hi]) => Math.floor(Math.log(hi / lo) / Math.log(RATIO)));
const bp = (l, k) => LOCI[l][0] * RATIO ** k;
const LADDER = [100, 150, 200, 300, 400, 500, 700, 1000, 1500, 2000];
const TOP = 46, SPAN = 430, MAXBP = 2300, MINBP = 88;
const yOf = (b) => TOP + ((Math.log10(MAXBP) - Math.log10(b)) / (Math.log10(MAXBP) - Math.log10(MINBP))) * SPAN;
const bpOf = (y) => 10 ** (Math.log10(MAXBP) - ((y - TOP) / SPAN) * (Math.log10(MAXBP) - Math.log10(MINBP)));
const NAMES = ['Azman Yusof', 'Lim Wei Jie', 'R. Selvam', 'Nurul Huda', 'Tan Ah Kow', 'Priya Nair', 'Hafiz Rahman', 'Wong Mei Ling', 'K. Ganesan', 'Siti Aminah', 'Chong Kar Wai', 'Farid Ismail'];
const LW = 40; // lane pitch

const keyOf = (p) => p.map((a) => [...a].sort((x, y) => x - y).join('/')).join('|');
const bandSet = (p) => new Set(p.flatMap((a, l) => a.map((k) => `${l}:${k}`)));

function randomPerson(r) {
  return LOCI.map((_, l) => [Math.floor(r() * (KMAX[l] + 1)), Math.floor(r() * (KMAX[l] + 1))]);
}
function relative(r, p, changes) {
  const q = p.map((a) => [...a]);
  const loci = shuffle(r, LOCI.map((_, i) => i)).slice(0, changes);
  for (const l of loci) {
    const j = Math.floor(r() * 2);
    let k;
    do k = q[l][j] + pick(r, [-2, -1, 1, 2, 3]); while (k < 0 || k > KMAX[l] || k === q[l][j] || k === q[l][1 - j]);
    q[l][j] = k;
  }
  return q;
}
const sameSet = (a, b) => a.size === b.size && [...a].every((x) => b.has(x));

export function mount(el, ctx) {
  const { rng, params, saved } = ctx;
  const mixed = ctx.variant === 'mixed';
  const n = Math.max(6, Math.min(8, params.suspects || 7));

  // ---- generate profiles with a guaranteed unique answer ----
  let people, answer, scene;
  for (;;) {
    if (!mixed) {
      const a = randomPerson(rng);
      people = [a];
      const relatives = n - 2;
      for (let i = 0; i < relatives; i++) people.push(relative(rng, a, 1 + (rng() < 0.4 ? 1 : 0)));
      while (people.length < n) people.push(randomPerson(rng));
      const keys = people.map(keyOf);
      if (new Set(keys).size !== keys.length) continue;
      const order = shuffle(rng, people.map((_, i) => i));
      people = order.map((i) => people[i]);
      answer = [order.indexOf(0)];
      scene = people[answer[0]].map((a, l) => {
        const bands = new Map();
        a.forEach((k) => bands.set(k, (bands.get(k) || 0) + 1));
        return [...bands].map(([k, c]) => ({ l, k, w: c }));
      }).flat();
      break;
    } else {
      const a = randomPerson(rng), b = randomPerson(rng);
      people = [a, b, relative(rng, a, 1), relative(rng, b, 1), relative(rng, a, 2)];
      while (people.length < n) people.push(rng() < 0.5 ? relative(rng, b, 2) : randomPerson(rng));
      const keys = people.map(keyOf);
      if (new Set(keys).size !== keys.length) continue;
      const mix = new Set([...bandSet(a), ...bandSet(b)]);
      let pairs = 0;
      for (let i = 0; i < people.length; i++) for (let j = i + 1; j < people.length; j++) {
        if (sameSet(new Set([...bandSet(people[i]), ...bandSet(people[j])]), mix)) pairs++;
      }
      if (pairs !== 1) continue;
      const order = shuffle(rng, people.map((_, i) => i));
      people = order.map((i) => people[i]);
      answer = [order.indexOf(0), order.indexOf(1)];
      const w = new Map();
      a.forEach((al, l) => al.forEach((k) => w.set(`${l}:${k}`, (w.get(`${l}:${k}`) || 0) + 0.85)));
      b.forEach((al, l) => al.forEach((k) => w.set(`${l}:${k}`, (w.get(`${l}:${k}`) || 0) + 0.45)));
      scene = [...w].map(([key, v]) => { const [l, k] = key.split(':').map(Number); return { l, k, w: v }; });
      break;
    }
  }
  const names = shuffle(rng, NAMES).slice(0, n);
  const drift = [0, ...people.map(() => (rng() - 0.5) * 2.2)]; // tiny loading differences per lane
  const noise = Array.from({ length: 160 }, () => [rng(), rng(), rng()]);

  // ---- state ----
  let wrong = saved?.wrong || 0;
  const excluded = new Set(saved?.excluded || []);
  let picks = new Set();
  let rulerY = saved?.ruler ?? yOf(400);
  let zoom = saved?.zoom || 1;
  let done = false;

  const W = 70 + (n + 2) * LW + 10, H = TOP + SPAN + 30;
  const id = `dna${Math.floor(rng() * 1e9)}`;
  const laneX = (i) => 70 + i * LW + LW / 2; // i: 0 ladder, 1 scene, 2.. suspects
  const bandPath = (x, y, half, curve) => `M${x - half} ${y} Q${x} ${y + curve} ${x + half} ${y}`;

  function bandsFor(list, lane, glow) {
    return list.map(({ y, w }) => {
      const yy = y + drift[lane - 1 >= 0 ? lane - 1 : 0];
      const op = Math.min(1, 0.35 + w * 0.55);
      const sw = 2.4 + Math.min(2, w * 1.2);
      return `<path d="${bandPath(laneX(lane), yy, 14, 1.4)}" stroke="${glow}" stroke-width="${sw}" stroke-linecap="round" fill="none" opacity="${op}" filter="url(#${id}b)"/>`;
    }).join('');
  }

  function gelSvg() {
    let s = `<defs><filter id="${id}b" x="-20%" y="-200%" width="140%" height="500%"><feGaussianBlur stdDeviation=".7"/></filter>
      <linearGradient id="${id}g" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#1b2228"/><stop offset="1" stop-color="#11161a"/></linearGradient></defs>`;
    s += `<rect width="${W}" height="${H}" fill="url(#${id}g)"/>`;
    s += noise.map(([a, b, c]) => `<circle cx="${(a * W).toFixed(1)}" cy="${(b * H).toFixed(1)}" r="${(0.4 + c).toFixed(2)}" fill="#ff9a6a" opacity="${(0.04 + c * 0.06).toFixed(3)}"/>`).join('');
    // wells
    for (let i = 0; i < n + 2; i++) s += `<rect x="${laneX(i) - 14}" y="${TOP - 26}" width="28" height="6" fill="#06080a" stroke="#2c363e"/>`;
    // ladder with labels
    s += LADDER.map((b) => `<path d="${bandPath(laneX(0), yOf(b), 14, 1.4)}" stroke="#ffd2a8" stroke-width="2.6" stroke-linecap="round" fill="none" opacity=".85" filter="url(#${id}b)"/><text x="${laneX(0) - 22}" y="${yOf(b) + 3}" text-anchor="end" font-size="9" font-family="monospace" fill="#9fb3bf">${b}</text>`).join('');
    // scene
    s += bandsFor(scene.map((b) => ({ y: yOf(bp(b.l, b.k)), w: b.w })), 1, '#ffb27a');
    // suspects
    people.forEach((p, i) => {
      const counts = new Map();
      p.forEach((a, l) => a.forEach((k) => counts.set(`${l}:${k}`, (counts.get(`${l}:${k}`) || 0) + 1)));
      s += bandsFor([...counts].map(([key, c]) => { const [l, k] = key.split(':').map(Number); return { y: yOf(bp(l, k)), w: c * 0.85 }; }), i + 2, '#ffb27a');
    });
    // lane captions inside the photo
    s += `<text x="${laneX(0)}" y="${H - 10}" text-anchor="middle" font-size="10" font-family="monospace" fill="#9fb3bf">bp</text>`;
    s += `<text x="${laneX(1)}" y="${H - 10}" text-anchor="middle" font-size="10" font-family="monospace" fill="#ffd2a8">X</text>`;
    people.forEach((_, i) => { s += `<text x="${laneX(i + 2)}" y="${H - 10}" text-anchor="middle" font-size="10" font-family="monospace" fill="#9fb3bf">${i + 1}</text>`; });
    return s;
  }

  // ---- DOM ----
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('class', 'dn-svg');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', `Gel photograph: size ladder, crime scene lane X, and ${n} suspect lanes`);
  svg.innerHTML = gelSvg();
  const marks = document.createElementNS(svgNS, 'g');
  const ruler = document.createElementNS(svgNS, 'g');
  ruler.setAttribute('class', 'dn-ruler');
  ruler.setAttribute('tabindex', '0');
  ruler.setAttribute('role', 'slider');
  ruler.setAttribute('aria-label', 'Ruler. Up and down arrows move it.');
  svg.append(marks, ruler);
  const scroller = h('div', { class: 'dn-scroll' }, svg);
  const readout = h('span', { class: 'doc dn-read' });
  const zoomLbl = h('span', { class: 'doc dn-zoom' });
  const status = h('p', { class: 'feedback' });
  const counter = h('span', { class: 'doc dn-count' });
  const declareBtn = h('button', { class: 'btn btn--primary', onclick: () => declare() }, mixed ? 'Declare these two' : 'Declare a match');
  const legend = h('div', { class: 'dn-legend', role: 'group', 'aria-label': 'Suspects' });
  const laneBtns = people.map((_, i) => {
    const b = h('button', { class: 'dn-lane', onclick: () => toggle(i), 'aria-pressed': 'false' }, h('b', {}, String(i + 1)), h('span', {}, names[i]));
    legend.append(b);
    return b;
  });

  el.append(
    h('p', { class: 'game-rules' }, mixed
      ? 'The scene sample X is a mixture of two people: every band in X belongs to one of them, and every band of both must be in X. Find the pair. Drag the ruler to compare heights; zoom in for close bands.'
      : 'Find the suspect whose bands match the scene sample X exactly, every band at the same height. Relatives share most bands. Drag the ruler to compare heights; zoom in for close bands.'),
    scroller,
    h('div', { class: 'game-toolbar' },
      h('button', { class: 'btn btn--small', onclick: () => setZoom(zoom - 1), 'aria-label': 'Zoom out' }, '−'), zoomLbl,
      h('button', { class: 'btn btn--small', onclick: () => setZoom(zoom + 1), 'aria-label': 'Zoom in' }, '+'),
      readout),
    legend,
    h('div', { class: 'game-toolbar' }, declareBtn, counter),
    status,
  );

  function persist() { ctx.onSave({ wrong, excluded: [...excluded], ruler: +rulerY.toFixed(1), zoom }); }

  function drawRuler() {
    rulerY = Math.max(TOP - 10, Math.min(TOP + SPAN + 6, rulerY));
    ruler.innerHTML = `<rect x="0" y="${rulerY - 9}" width="${W}" height="18" fill="transparent"/><line x1="4" y1="${rulerY}" x2="${W - 4}" y2="${rulerY}" stroke="#e8a33d" stroke-width="1" stroke-dasharray="5 3"/><path d="M0 ${rulerY - 6} L10 ${rulerY} L0 ${rulerY + 6}Z" fill="#e8a33d"/><path d="M${W} ${rulerY - 6} L${W - 10} ${rulerY} L${W} ${rulerY + 6}Z" fill="#e8a33d"/>`;
    const b = bpOf(rulerY);
    readout.textContent = `Ruler at about ${b < 1000 ? Math.round(b) : (b / 1000).toFixed(2) + 'k'} bp`;
    ruler.setAttribute('aria-valuetext', `${Math.round(b)} base pairs`);
  }
  function drawMarks() {
    marks.innerHTML = people.map((_, i) => {
      const x = laneX(i + 2);
      if (excluded.has(i)) return `<rect x="${x - 17}" y="${TOP - 30}" width="34" height="${SPAN + 40}" fill="#0b0f12" opacity=".7"/><path d="M${x - 10} ${TOP - 18} l20 20 m0 -20 l-20 20" stroke="#b3202a" stroke-width="2"/>`;
      if (picks.has(i)) return `<rect x="${x - 18}" y="${TOP - 30}" width="36" height="${SPAN + 40}" fill="none" stroke="#e8a33d" stroke-width="2"/>`;
      return '';
    }).join('') + `<rect x="${laneX(1) - 18}" y="${TOP - 30}" width="36" height="${SPAN + 40}" fill="none" stroke="#ffd2a8" stroke-width="1" stroke-dasharray="3 3"/>`;
    laneBtns.forEach((b, i) => {
      b.classList.toggle('is-picked', picks.has(i));
      b.classList.toggle('is-excluded', excluded.has(i));
      b.disabled = excluded.has(i) || done;
      b.setAttribute('aria-pressed', String(picks.has(i)));
    });
    const need = mixed ? 2 : 1;
    declareBtn.disabled = picks.size !== need || done;
    counter.textContent = `${wrong} wrong ${wrong === 1 ? 'call' : 'calls'}`;
    ctx.onProgress(done ? 1 : Math.min(0.9, excluded.size / (n - (mixed ? 2 : 1)) * 0.8));
  }
  function setZoom(z) {
    zoom = Math.max(1, Math.min(4, z));
    svg.style.width = `calc(min(100%, 470px) * ${zoom})`;
    zoomLbl.textContent = `${zoom}×`;
    persist();
  }

  function toggle(i) {
    if (excluded.has(i) || done) return;
    const need = mixed ? 2 : 1;
    if (picks.has(i)) picks.delete(i);
    else { if (picks.size >= need) picks.delete([...picks][0]); picks.add(i); }
    sfx.click();
    drawMarks();
  }

  function declare() {
    const need = mixed ? 2 : 1;
    if (picks.size !== need || done) return;
    const ok = [...picks].every((i) => answer.includes(i));
    if (ok) {
      done = true;
      sfx.good();
      status.textContent = mixed
        ? `Every band in X is accounted for: ${names[answer[0]]} and ${names[answer[1]]} were both there.`
        : `Every band lines up. The sample from the scene came from ${names[answer[0]]}.`;
      status.className = 'feedback is-good';
      drawMarks();
      ctx.onProgress(1);
      ctx.onSolved();
      return;
    }
    wrong++;
    sfx.bad();
    const bad = [...picks].filter((i) => !answer.includes(i));
    bad.forEach((i) => excluded.add(i));
    status.textContent = mixed && bad.length === 1
      ? `One of those is wrong. ${names[bad[0]]} is excluded: at least one band is not in X.`
      : `No. ${bad.map((i) => names[i]).join(' and ')} ${bad.length > 1 ? 'are' : 'is'} excluded: the bands do not all line up.`;
    status.className = 'feedback is-bad';
    picks = new Set();
    persist();
    drawMarks();
  }

  // ruler and lane picking on the gel
  const toSvg = (e) => { const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; return pt.matrixTransform(svg.getScreenCTM().inverse()); };
  let dragging = false;
  svg.addEventListener('pointerdown', (e) => {
    const p = toSvg(e);
    if (Math.abs(p.y - rulerY) < 12) { dragging = true; svg.setPointerCapture(e.pointerId); e.preventDefault(); return; }
    const lane = Math.round((p.x - 70 - LW / 2) / LW);
    if (lane >= 2 && lane < n + 2 && Math.abs(p.x - laneX(lane)) < LW / 2) toggle(lane - 2);
  });
  svg.addEventListener('pointermove', (e) => { if (!dragging) return; rulerY = toSvg(e).y; drawRuler(); });
  const stop = () => { if (dragging) { dragging = false; persist(); } };
  svg.addEventListener('pointerup', stop);
  svg.addEventListener('pointercancel', stop);
  ruler.addEventListener('keydown', (e) => {
    const d = { ArrowUp: -1, ArrowDown: 1 }[e.key];
    if (!d) return;
    e.preventDefault();
    rulerY += d * (e.shiftKey ? 10 : 1);
    drawRuler();
    persist();
  });

  setZoom(zoom);
  drawRuler();
  drawMarks();

  return {
    hint() {
      if (done) return null;
      const cands = people.map((_, i) => i).filter((i) => !answer.includes(i) && !excluded.has(i));
      if (!cands.length) return null;
      const i = cands[0];
      // point at a band that gives this suspect away, then rule them out
      const sb = new Set(scene.map((b) => `${b.l}:${b.k}`));
      const odd = [...bandSet(people[i])].find((k) => !sb.has(k));
      excluded.add(i);
      picks.delete(i);
      persist();
      drawMarks();
      if (odd) {
        const [l, k] = odd.split(':').map(Number);
        rulerY = yOf(bp(l, k)) + drift[i + 1];
        drawRuler();
        return `Lane ${i + 1} (${names[i]}) has a band at the ruler that X does not. Excluded.`;
      }
      return `Lane ${i + 1} (${names[i]}) is missing a band that X has. Excluded.`;
    },
    devSolve() { picks = new Set(answer); declare(); },
    _answer: () => answer,
  };
}
