// Title: key art (or the 3D office when the art is missing), rain, lightning, the lift that passes
// a floor that does not exist, and the menu. A "press to start" gate comes first: browsers only
// allow sound after a gesture, and it is where the main theme begins.
import { gsap } from 'gsap';
import { h, modal } from '../core/ui.js';
import { go } from '../core/router.js';
import { state, resetAll, rank } from '../core/state.js';
import { unlock, startRain, sfx, thunder } from '../core/audio.js';
import { app } from '../core/app.js';
import { hasImage, imgUrl } from '../core/assets.js';
import { openSettings } from '../core/settings.js';
import { playerPortraitSvg } from '../core/avatar.js';
import { openCloudLoad } from '../core/cloud.js';

const KEY_ART = 'title_keyart';
let gatePassed = false; // once per page load

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = () => window.matchMedia('(pointer: coarse)').matches;

/** Two-layer rain drawn on a 2D canvas over the key art. Returns { stop }. */
function rainLayer(canvas) {
  const g = canvas.getContext('2d');
  let w = 0, hh = 0, drops = [], raf = 0, last = 0, running = true;
  const size = () => {
    w = canvas.width = canvas.clientWidth;
    hh = canvas.height = canvas.clientHeight;
    const n = Math.min(260, Math.round((w * hh) / 5200));
    drops = Array.from({ length: n }, (_, i) => {
      const near = i % 4 === 0;
      return { x: Math.random() * w * 1.2, y: Math.random() * hh, l: near ? 26 + Math.random() * 30 : 10 + Math.random() * 16, v: near ? 1500 + Math.random() * 500 : 800 + Math.random() * 400, near };
    });
  };
  size();
  const onResize = () => size();
  window.addEventListener('resize', onResize);
  const slant = 0.16;
  const draw = (t) => {
    if (!running) return;
    raf = requestAnimationFrame(draw);
    if (document.hidden) return;
    const dt = Math.min(0.05, (t - last) / 1000 || 0.016);
    if (t - last < 30) return; // ~30 fps is plenty for rain
    last = t;
    g.clearRect(0, 0, w, hh);
    for (const pass of [false, true]) {
      g.beginPath();
      g.strokeStyle = pass ? 'rgba(214, 226, 238, 0.32)' : 'rgba(170, 196, 220, 0.18)';
      g.lineWidth = pass ? 1.4 : 1;
      for (const d of drops) {
        if (d.near !== pass) continue;
        d.y += d.v * dt;
        d.x -= d.v * dt * slant;
        if (d.y - d.l > hh) { d.y = -d.l - Math.random() * 80; d.x = Math.random() * w * 1.2; }
        g.moveTo(d.x, d.y);
        g.lineTo(d.x + d.l * slant, d.y - d.l);
      }
      g.stroke();
    }
  };
  raf = requestAnimationFrame(draw);
  return { stop: () => { running = false; cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); } };
}

export function mount(host) {
  const s = state();
  const calm = reducedMotion();
  const cleanups = [];

  // ---------- layers ----------
  const artImg = h('div', { class: 'ts-art-img' });
  const art = h('div', { class: 'ts-art', 'aria-hidden': 'true' }, artImg);
  const rainCanvas = h('canvas', { class: 'ts-rain', 'aria-hidden': 'true' });
  const flash = h('div', { class: 'ts-flash', 'aria-hidden': 'true' });

  // ---------- brand ----------
  const floors = ['11', '12', '13', '14', '15'];
  const cells = floors.map((f) => h('li', { class: f === '14' ? 'is-missing' : '' }, f));
  const lift = h('div', { class: 'ts-lift', 'aria-hidden': 'true' },
    h('span', { class: 'ts-lift-arrow' }),
    h('ol', {}, cells));
  const logo = h('h1', { class: 'ts-logo', 'aria-label': 'Floor 14' },
    h('span', { class: 'ts-logo-floor', 'aria-hidden': 'true' }, 'Floor'),
    h('span', { class: 'ts-logo-num', 'aria-hidden': 'true' }, '14'));
  const thread = h('span', { class: 'ts-thread', 'aria-hidden': 'true' });
  const kicker = h('p', { class: 'ts-kicker' }, 'Case 1: The Fall');
  const tagline = h('p', { class: 'ts-tagline' }, 'Every crime leaves a thread. Pull the wrong one, and he walks free.');
  const brand = h('div', { class: 'ts-brand' }, lift, logo, h('div', { class: 'ts-rule' }, thread, kicker), tagline);

  // ---------- menu ----------
  const item = (label, sub, onclick, extra) => h('button', { class: 'ts-item', onclick: (e) => { sfx.click(); onclick(e); } },
    extra || null,
    h('span', { class: 'ts-item-text' }, h('span', { class: 'ts-item-label' }, label), sub ? h('span', { class: 'ts-item-sub' }, sub) : null));
  const items = [];
  if (s.profile) {
    const r = rank();
    items.push(item('Continue', `${s.profile.name}, ${r.name}`, () => go('office'),
      h('span', { class: 'ts-item-photo', html: playerPortraitSvg(s.profile, { lineup: false }) })));
    items.push(item('New game', null, async () => {
      const ok = await modal({ title: 'Start a new game?', body: 'Your detective, every case and every accusation will be erased.', buttons: [{ label: 'Keep my game', value: false }, { label: 'Erase and start again', kind: 'primary', value: true }] });
      if (ok) { resetAll(); go('profile'); }
    }));
  } else {
    items.push(item('New game', 'Open your agency in Brickfields', () => go('profile')));
  }
  items.push(item('Continue on this device', 'Played elsewhere? Load your game by detective name', () => openCloudLoad()));
  items.push(item('Leaderboard', null, () => go('leaderboard', { back: 'title' })));
  items.push(item('Settings', null, () => openSettings()));
  items.push(item('Credits', null, showCredits));
  const menu = h('nav', { class: 'ts-menu', 'aria-label': 'Main menu' }, items);
  menu.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const i = items.indexOf(document.activeElement);
    const n = e.key === 'ArrowDown' ? (i + 1) % items.length : (i - 1 + items.length) % items.length;
    items[n].focus();
  });

  const gate = h('button', { class: 'ts-gate' }, h('span', {}, coarse() ? 'Tap to start' : 'Press any key to start'));
  const foot = h('p', { class: 'ts-foot' }, 'A detective thriller in Kuala Lumpur, played through mind puzzles. Headphones recommended.');

  const root = h('section', { class: 'screen ts', 'data-art': 'pending' },
    art, rainCanvas, flash,
    h('div', { class: 'ts-shade', 'aria-hidden': 'true' }),
    h('div', { class: 'ts-grain', 'aria-hidden': 'true' }),
    h('div', { class: 'ts-content' }, brand, h('div', { class: 'ts-lower' }, menu, gate)),
    foot);
  host.append(root);
  app.scene.setMode('title');

  // ---------- key art, or the 3D office if it is missing ----------
  let artOn = false;
  let rain = null;
  hasImage(KEY_ART).then((ok) => {
    if (!root.isConnected) return;
    root.dataset.art = ok ? 'on' : 'off';
    if (!ok) return;
    artOn = true;
    artImg.style.backgroundImage = `url(${imgUrl(KEY_ART)})`;
    // the key art replaces the 3D office here, so the GPU can rest
    app.scene.setMode('hidden');
    gsap.fromTo(art, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'power2.out' });
    if (!calm) {
      // slow push-in, and a little parallax under the pointer
      const push = gsap.fromTo(artImg, { scale: 1.03 }, { scale: 1.14, duration: 48, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      cleanups.push(() => push.kill());
      const qx = gsap.quickTo(art, 'x', { duration: 1.6, ease: 'power3.out' });
      const qy = gsap.quickTo(art, 'y', { duration: 1.6, ease: 'power3.out' });
      const move = (e) => { qx((e.clientX / window.innerWidth - 0.5) * -18); qy((e.clientY / window.innerHeight - 0.5) * -10); };
      window.addEventListener('pointermove', move);
      cleanups.push(() => window.removeEventListener('pointermove', move));
      rain = rainLayer(rainCanvas);
    }
  });

  // ---------- lightning, with thunder a moment later ----------
  let strikeTimer = null;
  const strike = (power = 1) => {
    if (!root.isConnected) return;
    if (!calm) {
      const a = 0.5 * power;
      gsap.timeline()
        .set(flash, { opacity: a })
        .to(flash, { opacity: 0.05, duration: 0.09 })
        .to(flash, { opacity: a * 0.75, duration: 0.05 })
        .to(flash, { opacity: 0, duration: 0.9, ease: 'power2.out' });
      gsap.fromTo(artImg, { filter: `brightness(${1 + power * 0.9}) saturate(0.6)` }, { filter: 'brightness(1) saturate(1)', duration: 1.1, ease: 'power2.out' });
    }
    if (gatePassed) thunder(0.35 + Math.random() * 1.2);
  };
  const scheduleStrike = () => {
    strikeTimer = setTimeout(() => {
      // with the key art up, the 3D scene is paused, so the title brings its own weather
      if (artOn && !document.hidden) strike(0.6 + Math.random() * 0.5);
      scheduleStrike();
    }, 8000 + Math.random() * 14000);
  };
  scheduleStrike();
  cleanups.push(() => clearTimeout(strikeTimer));

  // ---------- the lift ----------
  let liftTl = null;
  const setFloor = (i) => cells.forEach((c, k) => c.classList.toggle('is-on', k === i));
  if (calm) {
    setFloor(3);
  } else {
    liftTl = gsap.timeline({ delay: 0.8, repeat: -1, repeatDelay: 6 });
    floors.forEach((f, i) => {
      liftTl.call(() => setFloor(i), null, i * 0.85);
      if (f === '14') liftTl.fromTo(cells[3], { opacity: 0.2 }, { opacity: 1, duration: 0.05, repeat: 7, yoyo: true, ease: 'none' }, i * 0.85);
    });
    liftTl.call(() => { setFloor(3); if (gatePassed && root.isConnected) sfx.lift(); }, null, 5.6);
    cleanups.push(() => liftTl.kill());
  }

  // ---------- intro animation ----------
  if (!calm) {
    gsap.from(lift, { opacity: 0, y: -10, duration: 1, delay: 0.2, ease: 'power2.out' });
    gsap.from(logo.children, { opacity: 0, y: 28, duration: 1.4, stagger: 0.25, delay: 0.35, ease: 'power3.out' });
    gsap.fromTo(thread, { scaleX: 0 }, { scaleX: 1, duration: 1.4, delay: 1.1, ease: 'power3.inOut' });
    gsap.from([kicker, tagline], { opacity: 0, duration: 1.2, delay: 1.6, stagger: 0.2 });
  }

  // ---------- gate ----------
  const showMenu = (animate) => {
    root.classList.add('is-open');
    gate.hidden = true;
    menu.hidden = false;
    if (animate && !calm) gsap.from(items, { opacity: 0, x: -16, duration: 0.6, stagger: 0.08, ease: 'power2.out' });
    items[0].focus({ preventScroll: true });
  };
  const pass = (e) => {
    if (gatePassed) return;
    if (e && e.type === 'keydown' && (e.key === 'Tab' || e.key === 'Shift' || e.metaKey || e.ctrlKey || e.altKey)) return;
    e?.preventDefault?.();
    gatePassed = true;
    unlock();
    app.music.unlock();
    app.music.play('title');
    startRain(0.22);
    window.removeEventListener('keydown', pass);
    showMenu(true);
    setTimeout(() => strike(1), 900);
  };

  if (gatePassed) {
    startRain(0.22);
    showMenu(false);
  } else {
    menu.hidden = true;
    gate.addEventListener('click', pass);
    root.addEventListener('click', (e) => { if (!root.classList.contains('is-open') && !e.target.closest('button:not(.ts-gate)')) pass(e); });
    window.addEventListener('keydown', pass);
    cleanups.push(() => window.removeEventListener('keydown', pass));
    setTimeout(() => gate.focus({ preventScroll: true }), 50);
  }

  async function showCredits() {
    await modal({
      title: 'Credits',
      body: h('div', { class: 'ts-credits' },
        h('p', { class: 'doc' }, 'Floor 14. A Kuala Lumpur noir, played through mind puzzles.'),
        h('dl', {},
          h('dt', {}, 'Story, puzzles and direction'), h('dd', {}, 'The Floor 14 team'),
          h('dt', {}, 'Art'), h('dd', {}, 'Generated with Google Flow, directed by the team'),
          h('dt', {}, 'Music'), h('dd', {}, 'Composed with Google Flow Music'),
          h('dt', {}, 'Type'), h('dd', {}, 'Big Shoulders Display, Special Elite and Archivo (SIL Open Font License)'),
          h('dt', {}, 'Built with'), h('dd', {}, 'three.js, GSAP and Vite')),
        h('p', { class: 'doc' }, 'For Brickfields, and every mamak that stays open past midnight.')),
      buttons: [{ label: 'Close', kind: 'primary', value: true }],
    });
  }

  return {
    destroy: () => {
      cleanups.forEach((fn) => fn());
      rain?.stop();
    },
  };
}
