// Create your private detective: pick a file photo, a name, pronouns and your mamak order.
// The result is a laminated PI licence, signed and stamped.
import { gsap } from 'gsap';
import { h } from '../core/ui.js';
import { go } from '../core/router.js';
import { setProfile } from '../core/state.js';
import { avatarSvg, PORTRAITS, portraitUrl } from '../core/avatar.js';
import { hasImage } from '../core/assets.js';
import { sfx } from '../core/audio.js';
import { app } from '../core/app.js';

const DRINKS = ['Teh tarik', 'Kopi O kosong', 'Milo ais', 'Neslo', 'Teh O limau'];
const PRONOUNS = { he: 'He / him', she: 'She / her', they: 'They / them' };

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

const LOOP_PATH = 'M12 22 C 30 4, 150 0, 176 20 C 196 40, 190 208, 170 228 C 140 248, 30 246, 14 222 C -2 196, 2 40, 22 14';

export function mount(host) {
  app.scene.setMode('dim');
  const calm = reducedMotion();
  const p = { name: '', pronoun: 'they', drink: DRINKS[0], portrait: PORTRAITS[0].id };
  const licNo = `PI/KL/${String(Math.floor(1000 + Math.random() * 8999))}/26`;
  const current = () => PORTRAITS.find((x) => x.id === p.portrait) || PORTRAITS[0];

  // ---------- contact sheet ----------
  const frames = PORTRAITS.map((portrait, i) => {
    const pic = h('span', { class: 'cs-pic' });
    paintPortrait(pic, portrait);
    const loop = h('span', { class: 'cs-loop', 'aria-hidden': 'true', html: `<svg viewBox="0 0 200 250" preserveAspectRatio="none"><path pathLength="1" d="${LOOP_PATH}"/></svg>` });
    const b = h('button', {
      class: 'cs-frame', role: 'radio', 'aria-checked': String(i === 0), tabindex: i === 0 ? '0' : '-1',
      'aria-label': `File photo ${i + 1} of ${PORTRAITS.length}`,
      onclick: () => choose(i, true),
    }, pic, loop, h('span', { class: 'cs-num', 'aria-hidden': 'true' }, `${14 + Math.floor(i / 2)}${i % 2 ? 'A' : ''}`));
    return b;
  });
  const sheet = h('div', { class: 'cs-sheet', role: 'radiogroup', 'aria-label': 'File photo' }, frames);
  sheet.addEventListener('keydown', (e) => {
    const i = PORTRAITS.findIndex((x) => x.id === p.portrait);
    const step = { ArrowRight: 1, ArrowDown: 4, ArrowLeft: -1, ArrowUp: -4 }[e.key];
    if (!step) return;
    e.preventDefault();
    const n = (i + step + PORTRAITS.length) % PORTRAITS.length;
    choose(n, true);
    frames[n].focus();
  });

  // ---------- licence ----------
  const photo = h('div', { class: 'lic-photo' });
  const ghost = h('div', { class: 'lic-ghost', 'aria-hidden': 'true' });
  const nameOut = h('dd', { class: 'lic-name' }, '');
  const pronounOut = h('dd', {});
  const drinkOut = h('dd', {});
  const sigText = h('span', { class: 'lic-sig-text' }, '');
  const sig = h('div', { class: 'lic-sig' }, h('span', { class: 'lic-sig-x', 'aria-hidden': 'true' }, '×'), sigText);
  const mrz = h('div', { class: 'lic-mrz', 'aria-hidden': 'true' });
  const stamp = h('div', { class: 'lic-stamp', 'aria-hidden': 'true' },
    h('span', { class: 'lic-stamp-top' }, 'Diluluskan'),
    h('strong', {}, 'Licensed'),
    h('span', { class: 'lic-stamp-bot' }, `KL ${new Date().getFullYear()}`));
  const seal = h('div', { class: 'lic-seal', 'aria-hidden': 'true', html: `<svg viewBox="0 0 100 100">
      <defs><path id="sealpath" d="M50 50 m-36 0 a36 36 0 1 1 72 0 a36 36 0 1 1 -72 0"/></defs>
      <circle cx="50" cy="50" r="47" class="s1"/><circle cx="50" cy="50" r="29" class="s2"/>
      <text><textPath href="#sealpath">PENYIASAT PERSENDIRIAN • KUALA LUMPUR •</textPath></text>
      <text x="50" y="58" text-anchor="middle" class="s3">PI</text></svg>` });
  const holo = h('div', { class: 'lic-holo', 'aria-hidden': 'true' });
  const gloss = h('div', { class: 'lic-gloss', 'aria-hidden': 'true' });

  const card = h('div', { class: 'lic', role: 'img', 'aria-label': 'Private investigator licence preview' },
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
        h('div', { class: 'lic-f' }, h('dt', {}, 'Usual order'), drinkOut),
        h('div', { class: 'lic-f lic-f--wide' }, h('dt', {}, 'Office'), h('dd', {}, 'No. 14-1, Jalan Tun Sambanthan, Brickfields, 50470 Kuala Lumpur')),
        h('div', { class: 'lic-f lic-f--wide' }, h('dt', {}, 'Formerly'), h('dd', {}, 'PDRM, CID (D9). Resigned 2021')))
      , ghost),
    h('footer', { class: 'lic-foot' }, sig, h('div', { class: 'lic-valid' }, h('span', {}, 'Valid until'), h('b', {}, `12/${new Date().getFullYear() + 3}`))),
    mrz, holo, gloss, stamp);

  // ---------- form ----------
  const nameInput = h('input', { class: 'text-input pf-name', id: 'pi-name', maxlength: 24, autocomplete: 'off', spellcheck: 'false', placeholder: 'e.g. Arjun Pillai', oninput: (e) => { p.name = e.target.value; update(); } });
  const submit = h('button', { class: 'btn btn--primary pf-sign', disabled: true, onclick: confirm }, 'Sign the licence');
  const signHint = h('p', { class: 'pf-hint' }, 'Type a name to sign.');

  const chipGroup = (label, options, get, set, fmt = (x) => x) => h('div', { class: 'field' },
    h('span', { class: 'label', id: `lbl-${label.replace(/\W+/g, '')}` }, label),
    h('div', { class: 'chips', role: 'radiogroup', 'aria-labelledby': `lbl-${label.replace(/\W+/g, '')}` }, options.map((o) => {
      const b = h('button', { class: 'chip', role: 'radio', 'aria-checked': String(get() === o), onclick: () => {
        set(o);
        b.parentElement.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-checked', 'false'));
        b.setAttribute('aria-checked', 'true');
        sfx.click();
        update();
      } }, fmt(o));
      return b;
    })));

  const step = (n, title, ...body) => h('section', { class: 'pf-step' }, h('h2', {}, h('span', { 'aria-hidden': 'true' }, String(n).padStart(2, '0')), title), ...body);

  const intro = h('header', { class: 'pf-intro' },
    h('p', { class: 'pf-kicker' }, 'Personnel file 14-1'),
    h('h1', {}, 'Who answers the phone at 2:47 AM?'),
    h('p', { class: 'lede' }, 'Five years ago you were a CID investigator at Bukit Aman. Then came the fire at Port Klang. Now you are a private detective above a mamak stall in Brickfields.'));

  const photoStep = step(1, 'Choose your file photo', h('div', { class: 'cs' }, h('div', { class: 'cs-edge', 'aria-hidden': 'true' }, h('span', {}, 'NOIR 400'), h('span', {}, '▸ 14'), h('span', {}, 'BRICKFIELDS')), sheet, h('div', { class: 'cs-edge cs-edge--bot', 'aria-hidden': 'true' }, h('span', {}, '▸ 15A'), h('span', {}, 'FILE COPY'), h('span', {}, '▸ 17A'))));
  const detailStep = step(2, 'Your details',
    h('div', { class: 'field' }, h('label', { for: 'pi-name' }, 'Your name'), nameInput),
    chipGroup('Pronouns', Object.keys(PRONOUNS), () => p.pronoun, (v) => { p.pronoun = v; }, (v) => PRONOUNS[v]),
    chipGroup('Your usual order at the mamak', DRINKS, () => p.drink, (v) => { p.drink = v; }));
  const licenceBlock = h('div', { class: 'pf-licence' }, h('div', { class: 'lic-stage' }, card));
  const signRow = h('div', { class: 'pf-sign-row' }, submit, signHint);

  host.append(h('section', { class: 'screen profile-screen scroll' },
    h('div', { class: 'pf' }, intro, photoStep, detailStep, licenceBlock, signRow)));

  // ---------- behaviour ----------
  function choose(i, user) {
    p.portrait = PORTRAITS[i].id;
    frames.forEach((f, k) => {
      f.setAttribute('aria-checked', String(k === i));
      f.tabIndex = k === i ? 0 : -1;
    });
    paintPortrait(photo, PORTRAITS[i], { lineup: true });
    paintPortrait(ghost, PORTRAITS[i]);
    if (user) {
      sfx.click();
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
    const l2 = `${licNo.replace(/\D/g, '')}<0MYS${String(new Date().getFullYear() + 3).slice(2)}12<<<D9<2021<<<<<<<`.padEnd(44, '<').slice(0, 44);
    return `${l1}\n${l2}`;
  }

  function update() {
    nameOut.textContent = p.name.trim() || '—';
    sigText.textContent = p.name.trim();
    pronounOut.textContent = PRONOUNS[p.pronoun];
    drinkOut.textContent = p.drink;
    mrz.textContent = mrzLine();
    const ready = p.name.trim().length >= 2;
    submit.disabled = !ready;
    signHint.textContent = ready ? `Licence ${licNo}` : 'Type a name to sign.';
  }

  // the card tilts toward the pointer; the hologram follows
  if (!calm) {
    const stage = licenceBlock.querySelector('.lic-stage');
    const rx = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3.out' });
    const ry = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3.out' });
    stage.addEventListener('pointermove', (e) => {
      const r = stage.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      rx(-y * 10);
      ry(x * 12);
      card.style.setProperty('--hx', `${(x + 0.5) * 100}%`);
      card.style.setProperty('--hy', `${(y + 0.5) * 100}%`);
    });
    stage.addEventListener('pointerleave', () => { rx(0); ry(0); });
  }

  choose(0, false);
  update();
  if (!window.matchMedia('(pointer: coarse)').matches) setTimeout(() => nameInput.focus({ preventScroll: true }), 500);

  let signing = false;
  async function confirm() {
    if (signing || p.name.trim().length < 2) return;
    signing = true;
    submit.disabled = true;
    const pr = current();
    // save first: the ceremony below is only for show
    setProfile({
      name: p.name.trim(),
      pronoun: p.pronoun,
      drink: p.drink,
      portrait: pr.id,
      look: { ...pr.look, portrait: pr.id }, // SVG stand-in, kept for older code paths
      license: licNo,
      createdAt: Date.now(),
    });
    card.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'center' });
    sig.classList.add('is-signed');
    if (calm) {
      sfx.stamp();
      gsap.set(stamp, { opacity: 0.92, rotation: -13 });
      setTimeout(() => go('intro'), 1500);
      return;
    }
    // sign, then stamp; the timeline has a hard end so a slow device cannot strand the player
    const tl = gsap.timeline({ onComplete: () => setTimeout(() => go('intro'), 900) });
    if (Math.abs(gsap.getProperty(card, 'rotationX')) + Math.abs(gsap.getProperty(card, 'rotationY')) > 0.5) tl.to(card, { rotationX: 0, rotationY: 0, duration: 0.3 });
    tl.fromTo(sigText, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.9, ease: 'power1.inOut' }, '+=0.1')
      .call(() => { sfx.stamp(); card.classList.add('is-stamped'); })
      .fromTo(stamp, { opacity: 0, scale: 2.6, rotation: -24 }, { opacity: 0.92, scale: 1, rotation: -13, duration: 0.32, ease: 'back.out(2.2)' })
      .to(card, { y: 6, duration: 0.06, yoyo: true, repeat: 1 });
    setTimeout(() => { if (tl.progress() < 1) tl.progress(1); }, 6000);
  }

  return {};
}
