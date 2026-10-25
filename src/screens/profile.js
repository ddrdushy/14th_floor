// Create (or amend) your private detective: file photo, name and pronouns, where you are from, the
// languages you speak, the CID unit you left, your specialty, your ride, what you always carry, and
// your mamak order. The result is a laminated two-sided PI licence, signed and stamped.
//
// Phones get a four-step flow (photo, details, record, sign) under a sticky licence chip; wider
// screens get the two-column desk with the licence pinned on the right.
import { gsap } from 'gsap';
import { h, modal } from '../core/ui.js';
import { checkName, adopt, summaryOf } from '../core/cloud.js';
import { go } from '../core/router.js';
import { setProfile, state, withProfileDefaults, PROFILE_DEFAULTS } from '../core/state.js';
import {
  avatarSvg, PORTRAITS, portraitUrl,
  HOMETOWNS, LANGUAGES, UNITS, SPECIALTIES, RIDES, ITEMS,
  hometownOf, unitOf, specialtyOf, rideOf, itemOf, languagesOf,
} from '../core/avatar.js';
import { hasImage } from '../core/assets.js';
import { sfx } from '../core/audio.js';
import { app } from '../core/app.js';

const DRINKS = ['Teh tarik', 'Kopi O kosong', 'Milo ais', 'Neslo', 'Teh O limau'];
const PRONOUNS = { he: 'He / him', she: 'She / her', they: 'They / them' };
const OFFICE = 'No. 14-1, Jalan Tun Sambanthan, Brickfields, 50470 Kuala Lumpur';
const STEPS = ['Photo', 'Details', 'Record', 'Sign'];

const NAMES = ['Arjun Pillai', 'Nurul Aisyah Hamid', 'Wong Kah Wai', 'Kavitha Raman', 'Hafiz Rahman', 'Tan Mei Ling', 'Siti Zulaikha',
  'Ravi Shanmugam', 'Dayang Norfaizah', 'Jessica Chong', 'Gurpreet Kaur', 'Aiman Zakaria', 'Priya Selvam', 'Melvin Ong', 'Jaswinder Singh', 'Lim Wei Jie'];
const CALLSIGNS = ['Mata Kucing', 'Machan', 'Kapcai', 'Night Owl', 'Payung', 'Sambal', 'Tiger Balm', 'Lampu Merah', 'Kopi Kaw'];

// tiny line icons for the specialty cards (24x24, stroke = currentColor)
const SPEC_ICONS = {
  interrogation: '<path d="M2.5 12s3.6-6.5 9.5-6.5S21.5 12 21.5 12s-3.6 6.5-9.5 6.5S2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  forensics: '<path d="M7 19c-1.6-2-2.4-4.3-2.4-7a7.4 7.4 0 0 1 14.8 0"/><path d="M9.6 20.3c-1-1.7-1.6-3.6-1.6-5.8V12a4 4 0 0 1 8 0v1.5"/><path d="M12.6 21c-.7-1.6-.6-3.8-.6-6V12"/><path d="M16 17.5c.2 1 .4 2 .9 3"/>',
  ciphers: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9h2M11 9h2M15 9h2M7 13h4M13 13h4M7 17h10"/>',
  street: '<circle cx="5" cy="6" r="2.2"/><circle cx="19" cy="6" r="2.2"/><circle cx="12" cy="18" r="2.2"/><path d="M7 7.2l3.6 9M17 7.2l-3.6 9M7.2 6h9.6"/>',
  numbers: '<path d="M4 20V4M4 20h16"/><path d="M7 16l4-5 3 3 5-7"/><path d="M16 7h3v3"/>',
};

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const narrow = () => window.matchMedia('(max-width: 900px)').matches;
const coarse = () => window.matchMedia('(pointer: coarse)').matches;
const rand = (list) => list[Math.floor(Math.random() * list.length)];

/** Fill a frame with the photo, or with the SVG stand-in if the file is missing. */
function paintPortrait(el, portrait, { lineup = false } = {}) {
  el.innerHTML = '';
  el.classList.remove('is-photo', 'is-svg');
  hasImage(portrait.id).then((ok) => {
    if (ok) {
      el.append(h('img', { src: portraitUrl(portrait.id), alt: '', draggable: 'false', decoding: 'async' }));
      el.classList.add('is-photo');
    } else {
      el.innerHTML = avatarSvg(portrait.look, { lineup, bg: '#b9ae96' });
      el.classList.add('is-svg');
    }
  });
}

/** A barcode-ish strip of bars derived from the licence number (decoration only). */
function barcodeSvg(seed) {
  let x = 0, out = '';
  const digits = String(seed).replace(/\D/g, '') || '1426';
  for (let i = 0; i < 46; i++) {
    const d = Number(digits[i % digits.length]) + i;
    const w = 1 + (d % 3);
    if (i % 2 === 0) out += `<rect x="${x}" y="0" width="${w}" height="30"/>`;
    x += w + 1;
  }
  return `<svg viewBox="0 0 ${x} 30" preserveAspectRatio="none">${out}</svg>`;
}

const LOOP_PATH = 'M12 22 C 30 4, 150 0, 176 20 C 196 40, 190 208, 170 228 C 140 248, 30 246, 14 222 C -2 196, 2 40, 22 14';

export function mount(host) {
  app.scene.setMode('dim');
  const calm = reducedMotion();
  // amending an existing licence (deep link ?screen=profile, or go('profile') with a saved detective)
  const existing = state().profile ? withProfileDefaults(state().profile) : null;
  const editing = !!existing;

  const p = {
    name: existing?.name || '',
    pronoun: existing?.pronoun || 'they',
    drink: existing?.drink || DRINKS[0],
    portrait: PORTRAITS.some((x) => x.id === existing?.portrait) ? existing.portrait : PORTRAITS[0].id,
    hometown: existing?.hometown || PROFILE_DEFAULTS.hometown,
    languages: [...(existing?.languages || PROFILE_DEFAULTS.languages)],
    unit: existing?.unit || PROFILE_DEFAULTS.unit,
    specialty: existing?.specialty || PROFILE_DEFAULTS.specialty,
    ride: existing?.ride || PROFILE_DEFAULTS.ride,
    item: existing?.item || PROFILE_DEFAULTS.item,
    callsign: existing?.callsign || '',
  };
  const licNo = existing?.license || `PI/KL/${String(Math.floor(1000 + Math.random() * 8999))}/26`;
  const current = () => PORTRAITS.find((x) => x.id === p.portrait) || PORTRAITS[0];
  const syncers = []; // re-paint every control from p (after "Surprise me")

  // the cinematic that follows the signature wants its video unlocked inside this tap (iOS)
  let cinema = null;
  if (!editing) import('./cinema.js').then((m) => { cinema = m; }).catch(() => {});

  // ---------- contact sheet ----------
  const frames = PORTRAITS.map((portrait, i) => {
    const pic = h('span', { class: 'cs-pic' });
    paintPortrait(pic, portrait);
    const loop = h('span', { class: 'cs-loop', 'aria-hidden': 'true', html: `<svg viewBox="0 0 200 250" preserveAspectRatio="none"><path pathLength="1" d="${LOOP_PATH}"/></svg>` });
    return h('button', {
      class: 'cs-frame', role: 'radio', 'aria-checked': 'false', tabindex: '-1',
      'aria-label': `File photo ${i + 1} of ${PORTRAITS.length}`,
      onclick: () => choose(i, true),
    }, pic, loop, h('span', { class: 'cs-num', 'aria-hidden': 'true' }, `${14 + Math.floor(i / 2)}${i % 2 ? 'A' : ''}`));
  });
  const sheet = h('div', { class: 'cs-sheet', role: 'radiogroup', 'aria-label': 'File photo' }, frames);
  sheet.addEventListener('keydown', (e) => {
    const i = PORTRAITS.findIndex((x) => x.id === p.portrait);
    const stepBy = { ArrowRight: 1, ArrowDown: 4, ArrowLeft: -1, ArrowUp: -4 }[e.key];
    if (!stepBy) return;
    e.preventDefault();
    const n = (i + stepBy + PORTRAITS.length) % PORTRAITS.length;
    choose(n, true);
    frames[n].focus();
  });

  // ---------- licence: front ----------
  const photo = h('div', { class: 'lic-photo' });
  const ghost = h('div', { class: 'lic-ghost', 'aria-hidden': 'true' });
  const nameOut = h('dd', { class: 'lic-name' }, '');
  const pronounOut = h('dd', {});
  const hometownOut = h('dd', {});
  const formerlyOut = h('dd', {});
  const specOut = h('dd', { class: 'lic-spec' });
  const langOut = h('dd', { class: 'lic-langs' });
  const sigText = h('span', { class: 'lic-sig-text' }, '');
  const sig = h('div', { class: 'lic-sig' }, h('span', { class: 'lic-sig-x', 'aria-hidden': 'true' }, '×'), sigText);
  const mrz = h('div', { class: 'lic-mrz', 'aria-hidden': 'true' });
  const stamp = h('div', { class: 'lic-stamp', 'aria-hidden': 'true' },
    h('span', { class: 'lic-stamp-top' }, editing ? 'Dipinda' : 'Diluluskan'),
    h('strong', {}, editing ? 'Amended' : 'Licensed'),
    h('span', { class: 'lic-stamp-bot' }, `KL ${new Date().getFullYear()}`));
  const seal = h('div', { class: 'lic-seal', 'aria-hidden': 'true', html: `<svg viewBox="0 0 100 100">
      <defs><path id="sealpath" d="M50 50 m-36 0 a36 36 0 1 1 72 0 a36 36 0 1 1 -72 0"/></defs>
      <circle cx="50" cy="50" r="47" class="s1"/><circle cx="50" cy="50" r="29" class="s2"/>
      <text><textPath href="#sealpath">PENYIASAT PERSENDIRIAN • KUALA LUMPUR •</textPath></text>
      <text x="50" y="58" text-anchor="middle" class="s3">PI</text></svg>` });

  const front = h('div', { class: 'lic lic--front' },
    h('div', { class: 'lic-guilloche', 'aria-hidden': 'true' }),
    h('header', { class: 'lic-head' },
      h('div', { class: 'lic-flag', 'aria-hidden': 'true' }, h('i'), h('i'), h('i')),
      h('div', { class: 'lic-title' }, h('span', {}, 'Malaysia'), h('strong', {}, 'Private investigator licence'), h('em', {}, 'Lesen penyiasat persendirian')),
      h('div', { class: 'lic-no' }, h('span', {}, 'Licence no.'), h('b', {}, licNo))),
    h('div', { class: 'lic-body' },
      h('div', { class: 'lic-photo-wrap' }, photo, seal),
      h('dl', { class: 'lic-fields' },
        h('div', { class: 'lic-f lic-f--name' }, h('dt', {}, 'Name'), nameOut),
        h('div', { class: 'lic-f' }, h('dt', {}, 'Pronouns'), pronounOut),
        h('div', { class: 'lic-f' }, h('dt', {}, 'Hometown'), hometownOut),
        h('div', { class: 'lic-f lic-f--wide' }, h('dt', {}, 'Formerly'), formerlyOut),
        h('div', { class: 'lic-f' }, h('dt', {}, 'Specialty'), specOut),
        h('div', { class: 'lic-f' }, h('dt', {}, 'Speaks'), langOut)),
      ghost),
    h('footer', { class: 'lic-foot' }, sig, h('div', { class: 'lic-valid' }, h('span', {}, 'Valid until'), h('b', {}, `12/${new Date().getFullYear() + 3}`))),
    mrz,
    h('div', { class: 'lic-holo', 'aria-hidden': 'true' }),
    h('div', { class: 'lic-gloss', 'aria-hidden': 'true' }),
    stamp);

  // ---------- licence: back ----------
  const drinkOut = h('dd', {});
  const rideOut = h('dd', {});
  const itemOut = h('dd', {});
  const callOut = h('dd', { class: 'lic-call' });
  const back = h('div', { class: 'lic lic--back', 'aria-hidden': 'true' },
    h('div', { class: 'lic-guilloche' }),
    h('div', { class: 'lic-stripe' }),
    h('div', { class: 'lic-back-head' }, h('strong', {}, 'Endorsements'), h('em', {}, 'Catatan'), h('b', {}, licNo)),
    h('dl', { class: 'lic-fields lic-fields--back' },
      h('div', { class: 'lic-f' }, h('dt', {}, 'Usual order'), drinkOut),
      h('div', { class: 'lic-f' }, h('dt', {}, 'Callsign'), callOut),
      h('div', { class: 'lic-f' }, h('dt', {}, 'Rides'), rideOut),
      h('div', { class: 'lic-f' }, h('dt', {}, 'Always carries'), itemOut),
      h('div', { class: 'lic-f lic-f--wide' }, h('dt', {}, 'Office'), h('dd', {}, OFFICE))),
    h('footer', { class: 'lic-back-foot' },
      h('p', {}, 'Issued under the Private Agencies Act 1971. Not valid as identification. If found, return to any police station.'),
      h('div', { class: 'lic-bars', html: barcodeSvg(licNo) })),
    h('div', { class: 'lic-gloss' }));

  const flipper = h('div', { class: 'lic-flip' }, front, back);
  const stage = h('div', { class: 'lic-stage', role: 'img', 'aria-label': 'Private investigator licence preview' }, flipper);
  const turnBtn = h('button', { class: 'btn btn--ghost btn--small pf-turn', type: 'button', onclick: () => flip(!flipped, true) },
    h('span', { 'aria-hidden': 'true', html: '<svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M18.5 3v4h-4M5.5 21v-4h4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' }),
    h('span', { class: 'pf-turn-label' }, 'Turn over'));

  // ---------- form controls ----------
  const nameInput = h('input', { class: 'text-input pf-name', id: 'pi-name', maxlength: 24, autocomplete: 'off', autocapitalize: 'words', spellcheck: 'false', enterkeyhint: 'next', placeholder: 'e.g. Arjun Pillai', value: p.name,
    oninput: (e) => { p.name = e.target.value; flip(false); update(); },
    onkeydown: (e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); if (narrow()) goStep(3); } } });
  const callInput = h('input', { class: 'text-input pf-callsign', id: 'pi-callsign', maxlength: 18, autocomplete: 'off', spellcheck: 'false', enterkeyhint: 'done', placeholder: 'e.g. Mata Kucing', value: p.callsign,
    oninput: (e) => { p.callsign = e.target.value; flip(true); update(); },
    onkeydown: (e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } } });
  const nameHint = h('p', { class: 'pf-field-note', id: 'pi-name-note' }, 'This is the name the clients will remember. Or not.');

  /** One-of-many chips. side: which face of the licence shows this field. */
  function radioChips(id, label, options, key, { side = 'front', fmt = (o) => o.label, val = (o) => o.id } = {}) {
    const lbl = `lbl-${id}`;
    const btns = options.map((o) => h('button', { class: 'chip', type: 'button', role: 'radio', 'aria-checked': 'false', onclick: () => {
      p[key] = val(o);
      sync();
      sfx.click();
      flip(side === 'back');
      update(key);
    } }, fmt(o)));
    const sync = () => btns.forEach((b, i) => b.setAttribute('aria-checked', String(val(options[i]) === p[key])));
    syncers.push(sync);
    sync();
    const group = h('div', { class: 'chips', role: 'radiogroup', 'aria-labelledby': lbl }, btns);
    group.addEventListener('keydown', (e) => {
      const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      const i = btns.indexOf(document.activeElement);
      if (!d || i < 0) return;
      e.preventDefault();
      const n = (i + d + btns.length) % btns.length;
      btns[n].focus();
      btns[n].click();
    });
    return h('div', { class: 'field' }, h('span', { class: 'label', id: lbl }, label), group);
  }

  const langNote = h('p', { class: 'pf-field-note', 'aria-live': 'polite' }, 'Pick every language you can work a witness in.');
  function languageChips() {
    const btns = LANGUAGES.map((l) => h('button', { class: 'chip chip--check', type: 'button', role: 'checkbox', 'aria-checked': 'false', onclick: () => {
      const on = p.languages.includes(l.id);
      if (on && p.languages.length === 1) {
        langNote.textContent = 'You speak at least one language.';
        if (!calm) gsap.fromTo(btns[LANGUAGES.indexOf(l)], { x: -4 }, { x: 4, duration: 0.06, repeat: 3, yoyo: true, clearProps: 'x' });
        sfx.bad();
        return;
      }
      p.languages = on ? p.languages.filter((x) => x !== l.id) : LANGUAGES.filter((x) => x.id === l.id || p.languages.includes(x.id)).map((x) => x.id);
      langNote.textContent = 'Pick every language you can work a witness in.';
      sync();
      sfx.click();
      flip(false);
      update('languages');
    } }, l.label));
    const sync = () => btns.forEach((b, i) => b.setAttribute('aria-checked', String(p.languages.includes(LANGUAGES[i].id))));
    syncers.push(sync);
    sync();
    return h('div', { class: 'field' }, h('span', { class: 'label', id: 'lbl-langs' }, 'Languages you speak'),
      h('div', { class: 'chips', role: 'group', 'aria-labelledby': 'lbl-langs' }, btns), langNote);
  }

  function specialtyCards() {
    const cards = SPECIALTIES.map((s) => h('button', { class: 'pf-spec', type: 'button', role: 'radio', 'aria-checked': 'false', onclick: () => {
      p.specialty = s.id;
      sync();
      sfx.click();
      flip(false);
      update('specialty');
    } },
    h('span', { class: 'pf-spec-icon', 'aria-hidden': 'true', html: `<svg viewBox="0 0 24 24">${SPEC_ICONS[s.id]}</svg>` }),
    h('span', { class: 'pf-spec-text' }, h('strong', {}, s.label), h('span', { class: 'pf-spec-tag' }, s.tag), h('span', { class: 'pf-spec-perk' }, s.perk))));
    const sync = () => cards.forEach((c, i) => c.setAttribute('aria-checked', String(SPECIALTIES[i].id === p.specialty)));
    syncers.push(sync);
    sync();
    const group = h('div', { class: 'pf-specs', role: 'radiogroup', 'aria-labelledby': 'lbl-spec' }, cards);
    group.addEventListener('keydown', (e) => {
      const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      const i = cards.indexOf(document.activeElement);
      if (!d || i < 0) return;
      e.preventDefault();
      const n = (i + d + cards.length) % cards.length;
      cards[n].focus();
      cards[n].click();
    });
    return h('div', { class: 'field' }, h('span', { class: 'label', id: 'lbl-spec' }, 'Specialty'), group);
  }

  const stepTitle = (n, title, sub) => h('h2', {}, h('span', { 'aria-hidden': 'true' }, String(n).padStart(2, '0')), title, sub ? h('small', {}, sub) : null);

  // ---------- layout ----------
  const surpriseBtn = (cls) => h('button', { class: `btn btn--ghost btn--small pf-dice ${cls}`, type: 'button', onclick: surprise },
    h('span', { 'aria-hidden': 'true', html: '<svg viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="17" height="17" rx="3.5" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="8.5" cy="8.5" r="1.4"/><circle cx="15.5" cy="15.5" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="15.5" cy="8.5" r="1.4"/><circle cx="8.5" cy="15.5" r="1.4"/></svg>' }),
    h('span', {}, 'Surprise me'));

  const intro = h('header', { class: 'pf-intro' },
    h('p', { class: 'pf-kicker' }, editing ? 'Personnel file 14-1 · Amendment' : 'Personnel file 14-1'),
    h('h1', {}, editing ? 'Amend your licence' : 'Who answers the phone at 2:47 AM?'),
    h('p', { class: 'lede' }, editing
      ? 'The Home Ministry will want a reason. Tell them it was a clerical error.'
      : 'Five years ago you were a police investigator at Bukit Aman. Then came the fire at Port Klang. Now you are a private detective above a mamak stall in Brickfields.'),
    h('div', { class: 'pf-intro-tools' }, surpriseBtn('pf-dice--desk'),
      editing ? h('button', { class: 'btn btn--ghost btn--small', type: 'button', onclick: () => go('office') }, 'Keep the old licence') : null));

  const photoStep = h('section', { class: 'pf-step', 'data-n': '1' }, stepTitle(1, 'Choose your file photo'),
    h('div', { class: 'cs' }, h('div', { class: 'cs-edge', 'aria-hidden': 'true' }, h('span', {}, 'NOIR 400'), h('span', {}, '▸ 14'), h('span', {}, 'BRICKFIELDS')), sheet, h('div', { class: 'cs-edge cs-edge--bot', 'aria-hidden': 'true' }, h('span', {}, '▸ 15A'), h('span', {}, 'FILE COPY'), h('span', {}, '▸ 17A'))));

  const detailStep = h('section', { class: 'pf-step', 'data-n': '2' }, stepTitle(2, 'Your details'),
    h('div', { class: 'field' }, h('label', { for: 'pi-name' }, 'Your name'), nameInput, nameHint),
    radioChips('pronoun', 'Pronouns', Object.keys(PRONOUNS).map((k) => ({ id: k, label: PRONOUNS[k] })), 'pronoun'),
    radioChips('home', 'Hometown', HOMETOWNS, 'hometown'),
    languageChips());

  const recordStep = h('section', { class: 'pf-step', 'data-n': '3' }, stepTitle(3, 'Your record', 'Before you resigned in 2021'),
    radioChips('unit', 'Your old unit', UNITS, 'unit'),
    specialtyCards(),
    h('h3', { class: 'pf-sub' }, 'Habits'),
    radioChips('ride', 'How you get around', RIDES, 'ride', { side: 'back' }),
    radioChips('item', 'Always in your pocket', ITEMS, 'item', { side: 'back' }),
    radioChips('drink', 'Your usual order at the mamak', DRINKS.map((d) => ({ id: d, label: d })), 'drink', { side: 'back' }),
    h('div', { class: 'field' }, h('label', { for: 'pi-callsign' }, 'Callsign ', h('span', { class: 'pf-optional' }, '(optional, for your case notes)')), callInput));

  // step 4 (phones): a last look at the file before signing
  const review = h('dl', { class: 'pf-review' });
  const signStep = h('section', { class: 'pf-step pf-step--sign', 'data-n': '4' }, stepTitle(4, editing ? 'Sign the amendment' : 'Sign your licence'),
    h('p', { class: 'pf-field-note' }, 'Check both sides of the card. Tap a line to change it.'), review);

  const submit = h('button', { class: 'btn btn--primary pf-sign', type: 'button', disabled: true, onclick: confirm }, editing ? 'Re-sign the licence' : 'Sign the licence');
  const signHint = h('p', { class: 'pf-hint' }, 'Type a name to sign.');
  const signRow = h('div', { class: 'pf-sign-row' }, submit, signHint);

  // phones: compact licence chip + progress, sticky at the top
  const peekPhoto = h('span', { class: 'pf-peek-photo' });
  const peekName = h('strong', {}, '');
  const peekMeta = h('span', {}, '');
  const peek = h('button', { class: 'pf-peek', type: 'button', 'aria-expanded': 'false', onclick: () => setOpen(!side.classList.contains('is-open')) },
    peekPhoto, h('span', { class: 'pf-peek-text' }, peekName, peekMeta),
    h('span', { class: 'pf-peek-cta' }, h('span', { class: 'pf-peek-cta-label' }, 'Licence'), h('span', { class: 'pf-peek-chev', 'aria-hidden': 'true' }, '▾')));
  const dots = STEPS.map((label, i) => h('li', {}, h('button', { type: 'button', onclick: () => goStep(i + 1) }, h('span', { class: 'pf-dot', 'aria-hidden': 'true' }, String(i + 1)), h('span', { class: 'pf-dot-label' }, label))));
  const progress = h('nav', { class: 'pf-progress', 'aria-label': 'Steps' }, h('ol', {}, dots), surpriseBtn('pf-dice--phone'));
  const cardWrap = h('div', { class: 'pf-card' }, stage, h('div', { class: 'pf-card-tools' }, turnBtn));
  const side = h('aside', { class: 'pf-side' }, peek, progress, cardWrap, signRow);

  // phones: back / next bar
  const backBtn = h('button', { class: 'btn pf-back', type: 'button', onclick: () => goStep(stepN - 1) }, 'Back');
  const nextBtn = h('button', { class: 'btn btn--primary pf-next', type: 'button', onclick: () => (stepN < 4 ? goStep(stepN + 1) : confirm()) }, 'Next');
  const bar = h('div', { class: 'pf-bar' }, backBtn, nextBtn);

  const main = h('div', { class: 'pf-main' }, intro, photoStep, detailStep, recordStep, signStep);
  const pf = h('div', { class: 'pf', 'data-step': '1' }, side, main, bar);
  const screen = h('section', { class: 'screen profile-screen scroll' }, pf);
  host.append(screen);

  // ---------- behaviour ----------
  let stepN = 1;
  function goStep(n) {
    n = Math.max(1, Math.min(4, n));
    if (n > 2 && p.name.trim().length < 2) {
      n = 2;
      nameHint.textContent = 'Type a name first. At least two letters.';
      nameHint.classList.add('is-warn');
      setTimeout(() => nameInput.focus({ preventScroll: true }), 50);
    }
    const changed = n !== stepN;
    stepN = n;
    pf.dataset.step = String(n);
    dots.forEach((d, i) => {
      d.classList.toggle('is-done', i + 1 < n);
      const b = d.querySelector('button');
      if (i + 1 === n) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
    backBtn.disabled = n === 1;
    backBtn.style.visibility = n === 1 ? 'hidden' : '';
    setOpen(false);
    if (n === 4) { renderReview(); flip(false); }
    update();
    if (changed && narrow()) {
      screen.scrollTo({ top: 0, behavior: 'auto' });
      const shown = main.querySelector(`.pf-step[data-n="${n}"]`);
      if (shown && !calm) gsap.fromTo(shown, { opacity: 0, x: 16 }, { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out', clearProps: 'transform' });
    }
  }

  function setOpen(open) {
    side.classList.toggle('is-open', open);
    peek.setAttribute('aria-expanded', String(open));
    if (open && !calm) gsap.fromTo(cardWrap, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out', clearProps: 'all' });
  }

  function renderReview() {
    const hm = hometownOf(p), un = unitOf(p), sp = specialtyOf(p), rd = rideOf(p), it = itemOf(p);
    const row = (label, value, step, face) => h('div', { class: 'pf-review-row' },
      h('dt', {}, label),
      h('dd', {}, h('button', { type: 'button', onclick: () => { if (face) flip(face === 'back'); goStep(step); } }, value, h('span', { class: 'pf-review-edit', 'aria-hidden': 'true' }, 'Change'))));
    review.replaceChildren(
      row('Name', p.name.trim() || '—', 2),
      row('Pronouns', PRONOUNS[p.pronoun], 2),
      row('Hometown', hm.label, 2),
      row('Speaks', languagesOf(p).map((l) => l.label).join(', '), 2),
      row('Old unit', un.label, 3),
      row('Specialty', `${sp.label} · ${sp.tag}`, 3),
      row('Rides', rd.label, 3, 'back'),
      row('Carries', it.label, 3, 'back'),
      row('Usual order', p.drink, 3, 'back'),
      row('Callsign', p.callsign.trim() || 'None', 3, 'back'));
  }

  function choose(i, user) {
    p.portrait = PORTRAITS[i].id;
    frames.forEach((f, k) => {
      f.setAttribute('aria-checked', String(k === i));
      f.tabIndex = k === i ? 0 : -1;
    });
    paintPortrait(photo, PORTRAITS[i], { lineup: true });
    paintPortrait(ghost, PORTRAITS[i]);
    paintPortrait(peekPhoto, PORTRAITS[i]);
    if (user) {
      sfx.click();
      flip(false);
      if (!calm) {
        const path = frames[i].querySelector('.cs-loop path');
        gsap.fromTo(path, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.45, ease: 'power2.out' });
        gsap.fromTo(photo, { opacity: 0.2, filter: 'brightness(2)' }, { opacity: 1, filter: 'brightness(1)', duration: 0.5, ease: 'power2.out' });
      }
    }
  }

  function mrzLine() {
    const parts = (p.name.trim() || 'NAMA').toUpperCase().replace(/[^A-Z ]/g, '').split(/\s+/).filter(Boolean);
    const last = parts.length > 1 ? parts.pop() : parts[0] || '';
    const given = parts.length && parts[0] !== last ? parts.join('<') : '';
    const l1 = `PI<MYS${last}<<${given}`.padEnd(44, '<').slice(0, 44);
    const l2 = `${licNo.replace(/\D/g, '')}<0MYS${String(new Date().getFullYear() + 3).slice(2)}12<<<${unitOf(p).code}<2021<<<<<<<`.padEnd(44, '<').slice(0, 44);
    return `${l1}\n${l2}`;
  }

  const pulse = (el) => { if (!calm && el) gsap.fromTo(el, { backgroundColor: 'rgba(232, 163, 61, 0.45)' }, { backgroundColor: 'rgba(232, 163, 61, 0)', duration: 0.8, ease: 'power2.out', clearProps: 'backgroundColor' }); };

  function update(changed) {
    const name = p.name.trim();
    const un = unitOf(p), sp = specialtyOf(p);
    nameOut.textContent = name || '—';
    sigText.textContent = name;
    pronounOut.textContent = PRONOUNS[p.pronoun];
    hometownOut.textContent = hometownOf(p).licence;
    formerlyOut.replaceChildren(...(un.redacted
      ? ['PDRM, ', h('span', { class: 'lic-redact', title: 'Redacted' }, 'Special Branch'), '. Resigned 2021']
      : [`${un.licence}. Resigned 2021`]));
    specOut.replaceChildren(sp.label, h('span', { class: 'lic-tag' }, sp.tag));
    const langs = languagesOf(p);
    const shown = langs.slice(0, 6);
    const chips = shown.map((l) => h('span', { class: 'lic-lang', title: l.label }, l.code));
    if (langs.length > shown.length) chips.push(h('span', { class: 'lic-lang lic-lang--more' }, `+${langs.length - shown.length}`));
    langOut.replaceChildren(...chips);
    drinkOut.textContent = p.drink;
    rideOut.textContent = rideOf(p).licence;
    itemOut.textContent = itemOf(p).label;
    callOut.textContent = p.callsign.trim() ? `“${p.callsign.trim()}”` : '—';
    mrz.textContent = mrzLine();
    peekName.textContent = name || 'Unsigned detective';
    peekMeta.textContent = `${sp.tag} · ${licNo}`;

    const ready = name.length >= 2;
    submit.disabled = !ready;
    signHint.textContent = ready ? `Licence ${licNo}` : 'Type a name to sign.';
    if (ready && nameHint.classList.contains('is-warn')) {
      nameHint.classList.remove('is-warn');
      nameHint.textContent = 'This is the name the clients will remember. Or not.';
    }
    nextBtn.textContent = stepN < 4 ? 'Next' : (editing ? 'Re-sign the licence' : 'Sign the licence');
    nextBtn.classList.toggle('pf-next--sign', stepN === 4);
    nextBtn.disabled = stepN === 4 && !ready;

    const target = { pronoun: pronounOut, hometown: hometownOut, languages: langOut, unit: formerlyOut, specialty: specOut, ride: rideOut, item: itemOut, drink: drinkOut }[changed];
    if (target) pulse(target);
    if (changed && narrow() && !side.classList.contains('is-open') && !calm) gsap.fromTo(peek, { scale: 0.97 }, { scale: 1, duration: 0.3, ease: 'back.out(3)', clearProps: 'transform' });
  }

  // ---------- the card: tilt toward the pointer, turn over to see the back ----------
  let flipped = false, turning = false;
  const tilt = { x: 0, y: 0 };
  const rx = gsap.quickTo(flipper, 'rotationX', { duration: 0.6, ease: 'power3.out' });
  const ry = gsap.quickTo(flipper, 'rotationY', { duration: 0.6, ease: 'power3.out' });
  function flip(toBack, user = false) {
    if (toBack === flipped && !user) return;
    flipped = !!toBack;
    stage.classList.toggle('is-back', flipped);
    back.setAttribute('aria-hidden', String(!flipped));
    front.setAttribute('aria-hidden', String(flipped));
    turnBtn.querySelector('.pf-turn-label').textContent = flipped ? 'Show the front' : 'Turn over';
    if (calm) { gsap.set(flipper, { rotationY: flipped ? 180 : 0, rotationX: 0 }); return; }
    turning = true;
    gsap.to(flipper, { rotationY: (flipped ? 180 : 0) + tilt.y, rotationX: tilt.x, duration: 0.7, ease: 'power3.inOut', overwrite: true, onComplete: () => { turning = false; } });
    if (user) sfx.click();
  }
  if (!calm) {
    stage.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      const r = stage.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      tilt.x = -y * 10;
      tilt.y = x * 12 * (flipped ? -1 : 1);
      if (turning) return;
      rx(tilt.x);
      ry((flipped ? 180 : 0) + tilt.y);
      front.style.setProperty('--hx', `${(x + 0.5) * 100}%`);
      front.style.setProperty('--hy', `${(y + 0.5) * 100}%`);
    });
    stage.addEventListener('pointerleave', () => {
      tilt.x = 0; tilt.y = 0;
      if (turning) return;
      rx(0); ry(flipped ? 180 : 0);
    });
  }
  // tap the card itself to turn it over (phones have no hover tilt)
  stage.addEventListener('click', () => flip(!flipped, true));

  // ---------- surprise me ----------
  function surprise() {
    const pick = (list) => rand(list).id;
    choose(Math.floor(Math.random() * PORTRAITS.length), false);
    if (p.name.trim().length < 2) { p.name = rand(NAMES); nameInput.value = p.name; }
    p.pronoun = rand(Object.keys(PRONOUNS));
    p.hometown = pick(HOMETOWNS);
    // most detectives here work in BM and English; add one or two more
    const extra = LANGUAGES.slice(2).sort(() => Math.random() - 0.5).slice(0, 1 + Math.floor(Math.random() * 2)).map((l) => l.id);
    p.languages = LANGUAGES.filter((l) => ['ms', 'en', ...extra].includes(l.id)).map((l) => l.id);
    p.unit = pick(UNITS);
    p.specialty = pick(SPECIALTIES);
    p.ride = pick(RIDES);
    p.item = Math.random() < 0.35 ? 'lighter' : pick(ITEMS);
    p.drink = rand(DRINKS);
    p.callsign = Math.random() < 0.6 ? rand(CALLSIGNS) : '';
    callInput.value = p.callsign;
    syncers.forEach((fn) => fn());
    sfx.good();
    if (stepN === 4) renderReview();
    update();
    if (!calm) {
      gsap.fromTo(flipper, { rotationZ: -2.5 }, { rotationZ: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)', clearProps: 'rotationZ' });
      gsap.fromTo(photo, { opacity: 0.2, filter: 'brightness(2)' }, { opacity: 1, filter: 'brightness(1)', duration: 0.5, ease: 'power2.out' });
      if (narrow() && !side.classList.contains('is-open')) gsap.fromTo(peek, { scale: 0.95 }, { scale: 1, duration: 0.4, ease: 'back.out(3)', clearProps: 'transform' });
    }
  }

  choose(Math.max(0, PORTRAITS.findIndex((x) => x.id === p.portrait)), false);
  goStep(1);
  if (editing) sig.classList.add('is-signed');
  if (!coarse() && !narrow()) setTimeout(() => nameInput.focus({ preventScroll: true }), 500);

  // ---------- sign ----------
  let signing = false;
  async function confirm() {
    if (signing || p.name.trim().length < 2) {
      if (p.name.trim().length < 2) goStep(2);
      return;
    }
    cinema?.unlockCinemaVideo?.(); // inside the tap: lets the intro's clips play with sound on iOS
    signing = true;
    submit.disabled = true;
    nextBtn.disabled = true;
    // the detective name is the key to the online case file: it must be free, or already this player's
    const wanted = p.name.trim();
    if (!editing || wanted.toLowerCase() !== String(existing?.name || '').trim().toLowerCase()) {
      const r = await checkName(wanted);
      if (r && r.taken) {
        const v = await modal({
          title: 'That name is already on file',
          body: h('div', {}, h('p', {}, `A detective called "${r.taken.name || wanted}" already has a case file: ${summaryOf(r.taken.save)}.`),
            h('p', {}, 'If that is you from another device, load it. Otherwise pick a different name (add a surname or an initial).')),
          buttons: [{ label: 'Choose another name', value: 'rename' }, { label: 'That is me: load it', kind: 'primary', value: 'load' }],
        });
        if (v === 'load') { adopt(r.taken); return; }
        signing = false;
        submit.disabled = false;
        nextBtn.disabled = false;
        goStep(2);
        nameHint.textContent = `"${wanted}" is taken. Add a surname or an initial.`;
        nameHint.classList.add('is-warn');
        setTimeout(() => nameInput.focus({ preventScroll: true }), 50);
        return;
      }
    }
    const pr = current();
    // save first: the ceremony below is only for show
    setProfile({
      ...(existing || {}),
      name: p.name.trim(),
      pronoun: p.pronoun,
      drink: p.drink,
      portrait: pr.id,
      look: { ...pr.look, portrait: pr.id }, // SVG stand-in, kept for older code paths
      license: licNo,
      hometown: p.hometown,
      languages: [...p.languages],
      unit: p.unit,
      specialty: p.specialty,
      ride: p.ride,
      item: p.item,
      callsign: p.callsign.trim(),
      createdAt: existing?.createdAt || Date.now(),
      ...(editing ? { updatedAt: Date.now() } : {}),
    });
    const after = () => go(editing ? 'office' : 'intro');
    setOpen(true);
    if (flipped) flip(false);
    stage.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'center' });
    sig.classList.remove('is-signed');
    sig.classList.add('is-signed');
    if (calm) {
      sfx.stamp();
      gsap.set(stamp, { opacity: 0.92, rotation: -13 });
      setTimeout(after, 1500);
      return;
    }
    // sign, then stamp; the timeline has a hard end so a slow device cannot strand the player
    const tl = gsap.timeline({ delay: 0.5, onComplete: () => setTimeout(after, 900) });
    tl.to(flipper, { rotationX: 0, rotationY: 0, duration: 0.3, overwrite: true })
      .fromTo(sigText, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.9, ease: 'power1.inOut' }, '+=0.1')
      .call(() => { sfx.stamp(); front.classList.add('is-stamped'); })
      .fromTo(stamp, { opacity: 0, scale: 2.6, rotation: -24 }, { opacity: 0.92, scale: 1, rotation: -13, duration: 0.32, ease: 'back.out(2.2)' })
      .to(flipper, { y: 6, duration: 0.06, yoyo: true, repeat: 1 });
    setTimeout(() => { if (tl.progress() < 1) tl.progress(1); }, 6500);
  }

  return {};
}
