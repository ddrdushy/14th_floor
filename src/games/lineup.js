// Police lineup: study a face for a few seconds, then pick it out of a row of near-identical faces.
// Every lineup is built around a base face; each person in it differs from that base by one detail,
// and the base face itself stands in the row too, so the odd one out is never a giveaway.
// Variants: 'single', 'pair' (remember two faces), 'changed' (say what changed on the same person).
import { h } from '../core/ui.js';
import { shuffle, pick, mulberry32 } from '../core/rng.js';
import { sfx } from '../core/audio.js';

export const meta = { id: 'lineup', name: 'Police Lineup', category: 'Memory' };
export const demo = { variant: 'single', params: { rounds: 3, studySeconds: [12, 10, 8] } };

const SKIN = ['#f0c8a0', '#d8a878', '#b98258', '#8e5a3a', '#e6b48c'];
const HAIRC = ['#1b1a1a', '#3b2a20', '#6a4a30', '#a09e98', '#7a3020'];
const SHIRT = ['#3d6b9a', '#7a3a3a', '#3f6d4a', '#c9a43a', '#2a2d33'];
const RANGE = { face: 5, skin: 5, hair: 9, hairColor: 5, brows: 4, eyes: 4, eyeGap: 3, nose: 5, mouth: 5, facial: 5, glasses: 4, scar: 4, mole: 5, ears: 3, earring: 3 };
const SALIENT = ['hair', 'hairColor', 'facial', 'glasses', 'scar', 'earring'];
const SUBTLE = ['brows', 'eyes', 'eyeGap', 'nose', 'mouth', 'mole', 'ears', 'face'];
// the categories offered in the 'changed' variant, and the features each one covers
const GROUPS = [
  ['hair', 'Hair', ['hair', 'hairColor']], ['face', 'Face shape', ['face']], ['brows', 'Eyebrows', ['brows']],
  ['eyes', 'Eyes', ['eyes', 'eyeGap']], ['nose', 'Nose', ['nose']], ['mouth', 'Mouth', ['mouth']],
  ['ears', 'Ears', ['ears']], ['facial', 'Facial hair', ['facial']], ['glasses', 'Glasses', ['glasses']],
  ['scar', 'Scar', ['scar']], ['mole', 'Mole', ['mole']], ['earring', 'Earring', ['earring']],
];
const groupOf = (feat) => GROUPS.find((g) => g[2].includes(feat))[0];

function randomFace(r) {
  const f = {};
  for (const [k, n] of Object.entries(RANGE)) f[k] = Math.floor(r() * n);
  f.skin = Math.floor(r() * SKIN.length);
  f.shirt = Math.floor(r() * SHIRT.length);
  // give everyone two or three distinguishing marks so there is something to remember
  const marks = shuffle(r, ['facial', 'glasses', 'scar', 'mole', 'earring']);
  marks.forEach((m, i) => { f[m] = i < 2 + Math.floor(r() * 2) ? 1 + Math.floor(r() * (RANGE[m] - 1)) : 0; });
  if (f.hair === 0 && r() < 0.6) f.hair = 1 + Math.floor(r() * 8);
  return f;
}

// can this feature be changed on this face so that the change is actually visible?
function changeable(f, k) {
  if (k === 'hairColor') return f.hair !== 0 || f.facial !== 0;
  if (k === 'ears') return f.hair !== 4;
  return true;
}

function vary(r, f, k) {
  const g = { ...f };
  let v;
  do v = Math.floor(r() * RANGE[k]); while (v === f[k]);
  g[k] = v;
  return g;
}

const same = (a, b) => Object.keys(RANGE).every((k) => a[k] === b[k]);

// ---------------- drawing ----------------
export function faceSvg(f, { lineup = false, num = '', cctv = '' } = {}) {
  const skin = SKIN[f.skin], hc = HAIRC[f.hairColor], ink = '#1d1a16';
  const shapes = [[34, 24, 20, 116], [37, 30, 22, 112], [36, 33, 22, 114], [32, 23, 15, 120], [37, 17, 22, 116]];
  const [w, jw, top, chin] = shapes[f.face];
  const cx = 60;
  const head = f.face === 2
    ? `M${cx} ${top} C${cx + w * 0.95} ${top} ${cx + w} ${top + 18} ${cx + w} 62 C${cx + w} 94 ${cx + jw} ${chin - 2} ${cx} ${chin} C${cx - jw} ${chin - 2} ${cx - w} 94 ${cx - w} 62 C${cx - w} ${top + 18} ${cx - w * 0.95} ${top} ${cx} ${top}Z`
    : `M${cx} ${top} C${cx + w * 0.95} ${top} ${cx + w} ${top + 18} ${cx + w} 62 C${cx + w} 86 ${cx + jw} ${chin - 8} ${cx} ${chin} C${cx - jw} ${chin - 8} ${cx - w} 86 ${cx - w} 62 C${cx - w} ${top + 18} ${cx - w * 0.95} ${top} ${cx} ${top}Z`;
  let s = '';
  // background
  if (lineup) {
    s += `<rect width="120" height="150" fill="#b8bcb6"/>`;
    for (let i = 0; i < 6; i++) s += `<line x1="0" y1="${12 + i * 24}" x2="120" y2="${12 + i * 24}" stroke="#6a706a" stroke-width="${i % 2 ? 0.6 : 1.2}"/><text x="3" y="${10 + i * 24}" font-size="6" font-family="monospace" fill="#4a504a">${6 - i * 0.5 >= 4 ? `${Math.floor(6 - i * 0.5)}'${(6 - i * 0.5) % 1 ? '6' : ''}` : ''}</text>`;
  } else {
    s += `<rect width="120" height="150" fill="#56605e"/><rect width="120" height="150" fill="url(#lu-scan)" opacity=".35"/>`;
  }
  // long hair at the back
  if (f.hair === 4) s += `<path d="M${cx - w - 4} 60 Q${cx - w - 6} ${top - 2} ${cx} ${top - 4} Q${cx + w + 6} ${top - 2} ${cx + w + 4} 60 L${cx + w + 6} 118 Q${cx} 126 ${cx - w - 6} 118Z" fill="${hc}"/>`;
  // shirt and neck
  const shirt = lineup ? '#8a8f8a' : SHIRT[f.shirt];
  s += `<rect x="${cx - 11}" y="${chin - 16}" width="22" height="30" fill="${skin}" stroke="${ink}" stroke-width="1"/>`;
  s += `<path d="M6 150 Q10 ${chin + 6} ${cx} ${chin + 4} Q110 ${chin + 6} 114 150Z" fill="${shirt}" stroke="${ink}" stroke-width="1.2"/>`;
  s += lineup ? `<path d="M${cx - 12} ${chin + 4} Q${cx} ${chin + 14} ${cx + 12} ${chin + 4}" fill="none" stroke="${ink}" stroke-width="1"/>` : `<path d="M${cx - 13} ${chin + 3} L${cx} ${chin + 16} L${cx + 13} ${chin + 3}" fill="#f3ecda" stroke="${ink}" stroke-width="1"/>`;
  // ears
  const er = [[4.5, 8], [5.5, 10], [7.5, 12]][f.ears];
  [-1, 1].forEach((d) => { s += `<ellipse cx="${cx + d * (w - 1 + er[0] * 0.6)}" cy="70" rx="${er[0]}" ry="${er[1]}" fill="${skin}" stroke="${ink}" stroke-width="1.1"/><path d="M${cx + d * (w + er[0] * 0.4)} 65 q${d * 2} 5 0 10" fill="none" stroke="${ink}" stroke-width=".7" opacity=".6"/>`; });
  // head
  s += `<path d="${head}" fill="${skin}" stroke="${ink}" stroke-width="1.3"/>`;
  // stubble and beard sit under the features
  if (f.facial === 4) {
    // stubble: a fine stipple along the jaw
    let dots = '';
    for (let y = 80; y < chin - 2; y += 2.6) {
      const t = (y - 80) / (chin - 80);
      const half = (w - 3) * (1 - t) + jw * 0.7 * t;
      for (let x = cx - half; x <= cx + half; x += 2.6) {
        if (y < 92 && Math.abs(x - cx) < 14 - (y - 80) * 0.2) continue;
        dots += `<circle cx="${(x + ((y * 7) % 3) * 0.4).toFixed(1)}" cy="${y.toFixed(1)}" r=".55"/>`;
      }
    }
    s += `<g fill="${hc}" opacity=".7">${dots}</g>`;
  }
  if (f.facial === 2) s += `<path d="M${cx - w + 1} 72 Q${cx - w + 2} ${chin - 4} ${cx} ${chin + 3} Q${cx + w - 2} ${chin - 4} ${cx + w - 1} 72 Q${cx + w - 8} 98 ${cx} 99 Q${cx - w + 8} 98 ${cx - w + 1} 72Z" fill="${hc}" stroke="${ink}" stroke-width=".8"/>`;
  // hair on top
  const hairCap = (depth) => `M${cx - w - 1} ${62 - depth} Q${cx - w - 2} ${top - 4} ${cx} ${top - 5} Q${cx + w + 2} ${top - 4} ${cx + w + 1} ${62 - depth} Q${cx + w - 4} ${top + 14} ${cx} ${top + 12} Q${cx - w + 4} ${top + 14} ${cx - w - 1} ${62 - depth}Z`;
  switch (f.hair) {
    case 0: s += `<path d="M${cx - 12} ${top + 6} Q${cx} ${top + 1} ${cx + 10} ${top + 5}" stroke="#fff" stroke-width="2" opacity=".35" fill="none"/>`; break;
    case 1: s += `<path d="${hairCap(18)}" fill="${hc}" stroke="${ink}" stroke-width=".8"/>`; break;
    case 2: s += `<path d="${hairCap(14)}" fill="${hc}" stroke="${ink}" stroke-width=".8"/><path d="M${cx - 12} ${top - 4} Q${cx + 4} ${top + 2} ${cx + w} ${top + 22}" stroke="${ink}" stroke-width="1" fill="none" opacity=".7"/><path d="M${cx - 13} ${top - 3} Q${cx - 26} ${top + 4} ${cx - w + 2} ${top + 24}" fill="none" stroke="${hc}" stroke-width="5"/>`; break;
    case 3: for (let i = 0; i < 11; i++) { const a = Math.PI + (i / 10) * Math.PI; s += `<circle cx="${(cx + Math.cos(a) * (w - 2)).toFixed(1)}" cy="${(top + 22 + Math.sin(a) * 24).toFixed(1)}" r="8" fill="${hc}" stroke="${ink}" stroke-width=".7"/>`; } s += `<ellipse cx="${cx}" cy="${top + 4}" rx="${w - 6}" ry="9" fill="${hc}"/>`; break;
    case 4: s += `<path d="${hairCap(10)}" fill="${hc}" stroke="${ink}" stroke-width=".8"/>`; break;
    case 5: s += `<circle cx="${cx}" cy="${top - 9}" r="9" fill="${hc}" stroke="${ink}" stroke-width=".8"/><path d="${hairCap(16)}" fill="${hc}" stroke="${ink}" stroke-width=".8"/>`; break;
    case 6: s += `<path d="M${cx - w} ${top + 18} ${Array.from({ length: 9 }, (_, i) => `L${cx - w + 4 + i * ((2 * w - 8) / 8)} ${i % 2 ? top - 8 : top + 2}`).join(' ')} L${cx + w} ${top + 18} Q${cx} ${top + 10} ${cx - w} ${top + 18}Z" fill="${hc}" stroke="${ink}" stroke-width=".8"/>`; break;
    case 7: s += `<path d="M${cx - w - 1} 60 Q${cx - w} ${top + 10} ${cx - w + 10} ${top + 6} L${cx - w + 8} ${top + 20} Z M${cx + w + 1} 60 Q${cx + w} ${top + 10} ${cx + w - 10} ${top + 6} L${cx + w - 8} ${top + 20} Z" fill="${hc}" stroke="${ink}" stroke-width=".8"/><path d="M${cx - 8} ${top + 2} Q${cx} ${top} ${cx + 8} ${top + 2}" stroke="${hc}" stroke-width="2" fill="none"/>`; break;
    default: {
      // a fringe: cap plus a ragged edge of bangs across the forehead
      const n = 9, x0 = cx - w + 3, x1 = cx + w - 3;
      const edge = Array.from({ length: n + 1 }, (_, i) => `L${(x1 - ((x1 - x0) * i) / n).toFixed(1)} ${top + (i % 2 ? 24 : 29)}`).join(' ');
      s += `<path d="${hairCap(16)}" fill="${hc}" stroke="${ink}" stroke-width=".8"/><path d="M${x0 - 2} ${top + 18} Q${cx} ${top - 4} ${x1 + 2} ${top + 18} ${edge} Z" fill="${hc}" stroke="${ink}" stroke-width=".8"/>`;
    }
  }
  // brows
  const ey = 66, gap = [12.5, 14.5, 16.5][f.eyeGap];
  [-1, 1].forEach((d) => {
    const x0 = cx + d * (gap - 6), x1 = cx + d * (gap + 6);
    if (f.brows === 0) s += `<path d="M${x0} 57 L${x1} 57" stroke="${hc}" stroke-width="1.6" stroke-linecap="round"/>`;
    if (f.brows === 1) s += `<path d="M${x0} 58 Q${(x0 + x1) / 2} 52 ${x1} 57" stroke="${hc}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    if (f.brows === 2) s += `<path d="M${x0} 56.5 L${x1} 56.5" stroke="${hc}" stroke-width="4" stroke-linecap="round"/>`;
    if (f.brows === 3) s += `<path d="M${x0} 59 L${x1} 54.5" stroke="${hc}" stroke-width="2.4" stroke-linecap="round"/>`;
  });
  // eyes
  [-1, 1].forEach((d) => {
    const x = cx + d * gap;
    if (f.eyes === 0) s += `<ellipse cx="${x}" cy="${ey}" rx="5" ry="3.8" fill="#fbf7ec" stroke="${ink}" stroke-width=".9"/><circle cx="${x}" cy="${ey}" r="2.4" fill="#3a2a20"/>`;
    if (f.eyes === 1) s += `<path d="M${x - 6} ${ey} Q${x} ${ey - 5} ${x + 6} ${ey} Q${x} ${ey + 4} ${x - 6} ${ey}Z" fill="#fbf7ec" stroke="${ink}" stroke-width=".9"/><circle cx="${x}" cy="${ey - 0.3}" r="2.3" fill="#3a2a20"/>`;
    if (f.eyes === 2) s += `<path d="M${x - 6} ${ey} Q${x} ${ey - 2.6} ${x + 6} ${ey} Q${x} ${ey + 2.2} ${x - 6} ${ey}Z" fill="#fbf7ec" stroke="${ink}" stroke-width=".9"/><circle cx="${x}" cy="${ey}" r="1.6" fill="#3a2a20"/>`;
    if (f.eyes === 3) s += `<path d="M${x - 6} ${ey} Q${x} ${ey - 4.5} ${x + 6} ${ey} Q${x} ${ey + 4} ${x - 6} ${ey}Z" fill="#fbf7ec" stroke="${ink}" stroke-width=".9"/><circle cx="${x}" cy="${ey}" r="2.3" fill="#3a2a20"/><path d="M${x - 6.5} ${ey - 1.5} Q${x} ${ey - 4} ${x + 6.5} ${ey - 1}" fill="${skin}" stroke="${ink}" stroke-width="1"/>`;
  });
  // nose
  const noses = [
    `M${cx - 1} 68 L${cx - 2} 82 Q${cx} 85 ${cx + 4} 82`,
    `M${cx - 1} 68 L${cx - 2} 80 M${cx - 7} 82 Q${cx - 4} 86 ${cx} 85 Q${cx + 4} 86 ${cx + 7} 82`,
    `M${cx - 1} 66 Q${cx + 6} 74 ${cx + 3} 83 Q${cx} 85 ${cx - 3} 83`,
    `M${cx - 3} 80 Q${cx} 84 ${cx + 3} 80`,
    `M${cx - 1} 66 L${cx - 2} 87 Q${cx} 90 ${cx + 4} 87`,
  ];
  s += `<path d="${noses[f.nose]}" fill="none" stroke="${ink}" stroke-width="1.2" stroke-linecap="round"/>`;
  // mouth
  const my = f.facial === 2 ? 97 : 96;
  const mouths = [
    `<path d="M${cx - 7} ${my} L${cx + 7} ${my}" stroke="${ink}" stroke-width="1.4" stroke-linecap="round"/>`,
    `<path d="M${cx - 8} ${my} Q${cx} ${my - 4} ${cx + 8} ${my} Q${cx} ${my + 5} ${cx - 8} ${my}Z" fill="#a85a50" stroke="${ink}" stroke-width=".9"/>`,
    `<path d="M${cx - 8} ${my - 1} Q${cx} ${my + 5} ${cx + 8} ${my - 1}" fill="none" stroke="${ink}" stroke-width="1.4" stroke-linecap="round"/>`,
    `<path d="M${cx - 8} ${my + 2} Q${cx} ${my - 3} ${cx + 8} ${my + 2}" fill="none" stroke="${ink}" stroke-width="1.4" stroke-linecap="round"/>`,
    `<path d="M${cx - 12} ${my} Q${cx} ${my + 2} ${cx + 12} ${my}" fill="none" stroke="${ink}" stroke-width="1.4" stroke-linecap="round"/>`,
  ];
  s += mouths[f.mouth];
  if (f.facial === 1) s += `<path d="M${cx - 11} ${my - 2} Q${cx - 6} ${my - 8} ${cx} ${my - 5} Q${cx + 6} ${my - 8} ${cx + 11} ${my - 2} Q${cx} ${my - 4} ${cx - 11} ${my - 2}Z" fill="${hc}" stroke="${ink}" stroke-width=".7"/>`;
  if (f.facial === 3) s += `<path d="M${cx - 6} ${my + 4} Q${cx} ${my + 2} ${cx + 6} ${my + 4} L${cx + 3} ${chin + 2} L${cx - 3} ${chin + 2}Z" fill="${hc}" stroke="${ink}" stroke-width=".7"/>`;
  // marks
  if (f.scar === 1) s += `<path d="M${cx - gap - 6} 74 L${cx - gap + 2} 88" stroke="#9a4040" stroke-width="1.6"/><path d="M${cx - gap - 5} 79 l3 -1 M${cx - gap - 3} 83 l3 -1" stroke="#9a4040" stroke-width="1"/>`;
  if (f.scar === 2) s += `<path d="M${cx + gap - 2} 50 L${cx + gap + 3} 62" stroke="#9a4040" stroke-width="1.6"/>`;
  if (f.scar === 3) s += `<path d="M${cx - 5} ${chin - 6} L${cx + 6} ${chin - 3}" stroke="#9a4040" stroke-width="1.6"/>`;
  const moles = [null, [cx - gap - 2, 82], [cx + 8, 80], [cx + 6, my - 5], [cx - 8, top + 24]];
  if (f.mole) { const [mx, myy] = moles[f.mole]; s += `<circle cx="${mx}" cy="${f.mole === 4 && f.hair === 8 ? 52 : myy}" r="1.6" fill="#3a2418"/>`; }
  // glasses
  if (f.glasses === 1) s += `<g fill="#bfe6f0" fill-opacity=".25" stroke="${ink}" stroke-width="1.3"><circle cx="${cx - gap}" cy="${ey}" r="7.5"/><circle cx="${cx + gap}" cy="${ey}" r="7.5"/></g><path d="M${cx - gap + 7.5} ${ey - 1} Q${cx} ${ey - 4} ${cx + gap - 7.5} ${ey - 1} M${cx - gap - 7.5} ${ey} L${cx - w} ${ey - 2} M${cx + gap + 7.5} ${ey} L${cx + w} ${ey - 2}" stroke="${ink}" stroke-width="1.2" fill="none"/>`;
  if (f.glasses === 2) s += `<g fill="#bfe6f0" fill-opacity=".25" stroke="${ink}" stroke-width="1.3"><rect x="${cx - gap - 8}" y="${ey - 6}" width="16" height="11" rx="1.5"/><rect x="${cx + gap - 8}" y="${ey - 6}" width="16" height="11" rx="1.5"/></g><path d="M${cx - gap + 8} ${ey - 2} L${cx + gap - 8} ${ey - 2} M${cx - gap - 8} ${ey - 2} L${cx - w} ${ey - 3} M${cx + gap + 8} ${ey - 2} L${cx + w} ${ey - 3}" stroke="${ink}" stroke-width="1.2"/>`;
  if (f.glasses === 3) s += `<g fill="none" stroke="${ink}"><path d="M${cx - gap - 9} ${ey - 5} H${cx - gap + 8} M${cx + gap - 8} ${ey - 5} H${cx + gap + 9}" stroke-width="3.5"/><path d="M${cx - gap - 8} ${ey - 4} Q${cx - gap} ${ey + 9} ${cx - gap + 8} ${ey - 4} M${cx + gap - 8} ${ey - 4} Q${cx + gap} ${ey + 9} ${cx + gap + 8} ${ey - 4}" stroke-width="1"/><path d="M${cx - gap + 8} ${ey - 5} H${cx + gap - 8} M${cx - gap - 9} ${ey - 5} L${cx - w} ${ey - 5} M${cx + gap + 9} ${ey - 5} L${cx + w} ${ey - 5}" stroke-width="1.5"/></g>`;
  // earrings
  const exL = cx - (w - 1 + er[0] * 0.6), exR = cx + (w - 1 + er[0] * 0.6);
  if (f.earring === 1) s += `<circle cx="${exL}" cy="${70 + er[1] - 2}" r="1.9" fill="#d8b040" stroke="${ink}" stroke-width=".6"/>`;
  if (f.earring === 2) s += `<circle cx="${exR}" cy="${70 + er[1] + 2}" r="3.2" fill="none" stroke="#d8b040" stroke-width="1.4"/>`;
  if (num) s += `<rect x="38" y="128" width="44" height="18" fill="#1d1a16"/><text x="60" y="142" text-anchor="middle" font-family="monospace" font-weight="700" font-size="14" fill="#f3ecda">${num}</text>`;
  if (cctv) s += `<text x="4" y="10" font-family="monospace" font-size="7" fill="#e8f0e0">${cctv}</text><circle cx="112" cy="7" r="2.5" fill="#d8323d"/>`;
  return `<svg viewBox="0 0 120 150" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${num ? `Lineup number ${num}` : 'Suspect'}"><defs><pattern id="lu-scan" width="4" height="3" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#000"/></pattern></defs>${s}</svg>`;
}

// ---------------- game ----------------
export function mount(el, ctx) {
  const { rng, params, saved } = ctx;
  const variant = ['single', 'pair', 'changed'].includes(ctx.variant) ? ctx.variant : 'single';
  const rounds = params.rounds || 3;
  const studyFor = (r) => { const s = params.studySeconds || [12, 10, 8]; return Array.isArray(s) ? s[Math.min(r, s.length - 1)] : s; };
  const seed = Math.floor(rng() * 2 ** 31);

  let round = saved?.round || 0;
  let attempt = saved?.attempt || 0;
  let phase = saved?.phase === 'test' ? 'test' : 'intro';
  let wrong = saved?.wrong || 0;
  let excluded = new Set(saved?.excluded || []);
  let picks = new Set(saved?.picks || []);
  let lockedGroups = new Set(saved?.locked || []);
  let timer = null;
  let finished = false;
  let R = build();

  const status = h('p', { class: 'feedback' });
  const body = h('div', { class: 'lu-body' });
  const head = h('p', { class: 'doc lu-head' });
  const rules = {
    single: 'Study the suspect while the clock runs, then pick the same person from the lineup. Everyone in the row differs by one small detail.',
    pair: 'Two people this time, the driver and the passenger. Study both, then pick both out of one lineup.',
    changed: 'Study the suspect. Then you see the same person weeks later. Mark every detail that changed, and nothing that did not.',
  }[variant];
  el.append(h('p', { class: 'game-rules' }, `${rules} ${rounds} rounds.`), head, body, status);

  function build() {
    const r = mulberry32(seed + round * 1009 + attempt * 7919);
    const pool = round === 0 ? [...SALIENT, ...SUBTLE.slice(0, 4)] : round === 1 ? [...SALIENT, ...SUBTLE] : [...SUBTLE, 'hairColor', 'earring'];
    const lineupOf = (base, size) => {
      const feats = shuffle(r, pool.filter((k) => changeable(base, k)));
      const people = [base];
      for (const k of feats) {
        if (people.length >= size) break;
        const v = vary(r, base, k);
        if (!people.some((p) => same(p, v))) people.push(v);
      }
      return people; // people[1] is the one the witness saw
    };
    if (variant === 'pair') {
      const a = lineupOf(randomFace(r), 4), b = lineupOf(randomFace(r), 4);
      const order = shuffle(r, [...a.map((f, i) => ({ f, who: i === 1 ? 'A' : '' })), ...b.map((f, i) => ({ f, who: i === 1 ? 'B' : '' }))]);
      return { study: [a[1], b[1]], row: order };
    }
    if (variant === 'changed') {
      const base = randomFace(r);
      const n = 1 + Math.min(2, round) + (r() < 0.4 ? 1 : 0);
      const groups = shuffle(r, GROUPS.map((g) => g[0]).filter((gk) => GROUPS.find((g) => g[0] === gk)[2].some((k) => changeable(base, k))));
      let later = { ...base };
      const changed = new Set();
      for (const gk of groups) {
        if (changed.size >= n) break;
        const feats = GROUPS.find((g) => g[0] === gk)[2].filter((k) => changeable(later, k));
        if (!feats.length) continue;
        later = vary(r, later, pick(r, feats));
        changed.add(gk);
      }
      later.shirt = (base.shirt + 1 + Math.floor(r() * 4)) % SHIRT.length;
      return { study: [base], later, changed };
    }
    const size = 6 + Math.min(2, round);
    const people = lineupOf(randomFace(r), size);
    const order = shuffle(r, people.map((f, i) => ({ f, who: i === 1 ? 'A' : '' })));
    return { study: [people[1]], row: order };
  }

  function persist() {
    ctx.onSave({ round, attempt, phase, wrong, excluded: [...excluded], picks: [...picks], locked: [...lockedGroups] });
  }

  function setHead() {
    head.textContent = `Round ${Math.min(round + 1, rounds)} of ${rounds}${attempt ? ` · attempt ${attempt + 1}` : ''} · ${wrong} wrong ${wrong === 1 ? 'call' : 'calls'}`;
    ctx.onProgress(finished ? 1 : (round + (phase === 'test' ? 0.5 : 0)) / rounds);
  }

  function intro() {
    clearInterval(timer);
    phase = 'intro';
    setHead();
    body.innerHTML = '';
    const sec = studyFor(round);
    body.append(
      h('p', { class: 'doc' }, variant === 'pair'
        ? `CCTV caught two people at the loading bay. You get ${sec} seconds with the stills.`
        : `A CCTV still from the lift lobby. You get ${sec} seconds with it.`),
      h('button', { class: 'btn btn--primary', onclick: study }, attempt ? 'Show the new still' : 'Show the still'),
    );
  }

  function study() {
    phase = 'study';
    body.innerHTML = '';
    let left = studyFor(round);
    const bar = h('i', {});
    const clock = h('span', { class: 'doc lu-clock' }, `${left}s`);
    const labels = variant === 'pair' ? ['Driver', 'Passenger'] : [''];
    body.append(
      h('div', { class: 'lu-timer' }, h('div', { class: 'lu-bar' }, bar), clock),
      h('div', { class: `lu-study${R.study.length > 1 ? ' is-pair' : ''}` }, R.study.map((f, i) => {
        const fig = h('figure', { class: 'lu-still' });
        fig.innerHTML = faceSvg(f, { cctv: `CAM 0${3 + i}  23:4${1 + i}:0${round + 2}` });
        if (labels[i]) fig.append(h('figcaption', { class: 'doc' }, labels[i]));
        return fig;
      })),
      h('div', { class: 'game-toolbar' }, h('button', { class: 'btn', onclick: () => test() }, "I've got it")),
    );
    bar.style.width = '100%';
    requestAnimationFrame(() => { bar.style.transition = `width ${left}s linear`; bar.style.width = '0%'; });
    timer = setInterval(() => {
      left--;
      clock.textContent = `${Math.max(0, left)}s`;
      if (left <= 0) test();
    }, 1000);
  }

  function test() {
    clearInterval(timer);
    phase = 'test';
    persist();
    setHead();
    body.innerHTML = '';
    if (variant === 'changed') return testChanged();
    const need = variant === 'pair' ? 2 : 1;
    const grid = h('div', { class: 'lu-row' });
    const confirm = h('button', { class: 'btn btn--primary', onclick: () => decide() }, need === 2 ? 'Those two' : 'That one');
    const drawRow = () => {
      grid.innerHTML = '';
      R.row.forEach((p, i) => {
        const b = h('button', {
          class: `lu-card${picks.has(i) ? ' is-picked' : ''}${excluded.has(i) ? ' is-excluded' : ''}`,
          'aria-pressed': String(picks.has(i)), disabled: excluded.has(i),
          onclick: () => {
            if (picks.has(i)) picks.delete(i);
            else { if (picks.size >= need) picks.delete([...picks][0]); picks.add(i); }
            sfx.click();
            persist();
            drawRow();
          },
        });
        b.innerHTML = faceSvg(p.f, { lineup: true, num: String(i + 1) });
        grid.append(b);
      });
      confirm.disabled = picks.size !== need;
    };
    drawRow();
    body.append(h('p', { class: 'doc' }, need === 2 ? 'Pick the driver and the passenger.' : 'Which one did you see?'), grid, h('div', { class: 'game-toolbar' }, confirm));
    body._redraw = drawRow;
  }

  function decide() {
    const ok = [...picks].every((i) => R.row[i].who) && picks.size === (variant === 'pair' ? 2 : 1);
    if (ok) return pass();
    wrong++;
    sfx.bad();
    status.textContent = variant === 'pair'
      ? `No. ${[...picks].filter((i) => R.row[i].who).length} of your two picks ${[...picks].filter((i) => R.row[i].who).length === 1 ? 'was' : 'were'} right. The witness is shown a fresh pair.`
      : 'Wrong person. A decent lawyer would have a field day. The witness is shown a fresh lineup.';
    status.className = 'feedback is-bad';
    retry();
  }

  function testChanged() {
    const pickedG = new Set(picks);
    const fig = h('figure', { class: 'lu-still' });
    fig.innerHTML = faceSvg(R.later, { cctv: `CAM 07  ${String(9 + round).padStart(2, '0')}:12:44` });
    const chips = h('div', { class: 'lu-chips' });
    const submit = h('button', { class: 'btn btn--primary', onclick: () => judge() }, 'These changed');
    const draw = () => {
      chips.innerHTML = '';
      GROUPS.forEach(([k, label]) => {
        const locked = lockedGroups.has(k);
        chips.append(h('button', {
          class: `chip lu-chip${locked ? ' is-locked' : ''}`, 'aria-pressed': String(pickedG.has(k) || locked), disabled: locked,
          onclick: () => { if (pickedG.has(k)) pickedG.delete(k); else pickedG.add(k); picks = new Set(pickedG); sfx.click(); persist(); draw(); },
        }, label));
      });
    };
    const judge = () => {
      const chosen = new Set([...pickedG, ...lockedGroups]);
      const right = [...chosen].filter((k) => R.changed.has(k)).length;
      const extra = chosen.size - right;
      if (right === R.changed.size && extra === 0) return pass();
      wrong++;
      sfx.bad();
      status.textContent = `Not quite: ${right} of your marks ${right === 1 ? 'is' : 'are'} right${extra ? ` and ${extra} ${extra === 1 ? 'is' : 'are'} wrong` : ''}, and something was missed or added. Back to a fresh case.`;
      status.className = 'feedback is-bad';
      retry();
    };
    draw();
    body.append(
      h('div', { class: 'lu-changed' }, fig, h('div', {}, h('p', { class: 'doc' }, 'The same person, three weeks later. Ignore the shirt. What else changed?'), chips, h('div', { class: 'game-toolbar' }, submit))),
    );
  }

  function retry() {
    attempt++;
    picks = new Set();
    excluded = new Set();
    lockedGroups = new Set();
    R = build();
    phase = 'intro';
    persist();
    intro();
  }

  function pass() {
    sfx.good();
    round++;
    attempt = 0;
    picks = new Set();
    excluded = new Set();
    lockedGroups = new Set();
    if (round >= rounds) {
      finished = true;
      phase = 'intro';
      persist();
      setHead();
      body.innerHTML = '';
      status.textContent = 'The witness signs the identification form without hesitating. That one will stand up in court.';
      status.className = 'feedback is-good';
      ctx.onProgress(1);
      ctx.onSolved();
      return;
    }
    status.textContent = variant === 'changed' ? 'Exactly right. Next case.' : variant === 'pair' ? 'Both of them. Next round.' : 'That is the one. Next round.';
    status.className = 'feedback is-good';
    R = build();
    phase = 'intro';
    persist();
    intro();
  }

  if (phase === 'test') test(); else intro();

  return {
    destroy() { clearInterval(timer); },
    hint() {
      if (finished) return null;
      if (phase !== 'test') return 'People change hair, glasses and beards. Ears, noses, eyebrows and moles stay put. Study those.';
      if (variant === 'changed') {
        const g = [...R.changed].find((k) => !lockedGroups.has(k));
        if (!g || R.changed.size - lockedGroups.size <= 1) return 'Only one change left to find. You are on your own.';
        lockedGroups.add(g);
        persist();
        body.innerHTML = '';
        testChanged();
        return `One thing that changed: ${GROUPS.find((x) => x[0] === g)[1].toLowerCase()}.`;
      }
      const cands = R.row.map((p, i) => i).filter((i) => !R.row[i].who && !excluded.has(i));
      if (cands.length <= 1) return null;
      excluded.add(cands[0]);
      picks.delete(cands[0]);
      persist();
      body._redraw?.();
      return `Number ${cands[0] + 1} was at a wedding in Ipoh that night. Rule them out.`;
    },
    devSolve() {
      while (!finished) pass();
    },
    _answer: () => (variant === 'changed' ? [...R.changed] : R.row.map((p, i) => (p.who ? i : -1)).filter((i) => i >= 0)),
  };
}
