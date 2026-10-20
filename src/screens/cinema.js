// Motion-comic player: panels with slow camera moves, layered weather effects and English subtitles.
import { gsap } from 'gsap';
import { h } from '../core/ui.js';
import { paintInto } from '../core/assets.js';
import { sfx, thunder, startRain, setRain } from '../core/audio.js';
import { app } from '../core/app.js';
import '../styles/cases.css';

// A case title card: { title: { kicker: 'Case 2', name: 'Container 47' } }
function caseTitleCard(t) {
  const thread = h('div', { class: 'thread', style: { width: '0' } });
  const name = h('div', { class: 'name' }, t.name);
  const el = h('div', { class: 'cine-title cine-casetitle' }, h('div', {}, t.kicker ? h('p', { class: 'kicker' }, t.kicker) : null, name, thread));
  gsap.from(name, { opacity: 0, letterSpacing: '0.25em', duration: 1.8, ease: 'power2.out' });
  gsap.to(thread, { width: 'min(64vw, 560px)', duration: 1.4, delay: 0.7, ease: 'power3.inOut' });
  return el;
}

function rainFx(canvas) {
  const g = canvas.getContext('2d');
  const drops = Array.from({ length: 220 }, () => ({ x: Math.random(), y: Math.random(), l: 0.02 + Math.random() * 0.05, s: 0.8 + Math.random() * 1.2 }));
  let raf;
  const draw = () => {
    const w = (canvas.width = canvas.clientWidth), hh = (canvas.height = canvas.clientHeight);
    g.clearRect(0, 0, w, hh);
    g.strokeStyle = 'rgba(190, 210, 230, 0.35)';
    g.lineWidth = 1;
    g.beginPath();
    for (const d of drops) {
      d.y += 0.012 * d.s;
      d.x -= 0.002 * d.s;
      if (d.y > 1) { d.y = -0.05; d.x = Math.random() * 1.1; }
      g.moveTo(d.x * w, d.y * hh);
      g.lineTo(d.x * w - d.l * hh * 0.18, d.y * hh + d.l * hh);
    }
    g.stroke();
    raf = requestAnimationFrame(draw);
  };
  draw();
  return () => cancelAnimationFrame(raf);
}

function emberFx(canvas) {
  const g = canvas.getContext('2d');
  const sparks = Array.from({ length: 90 }, () => ({ x: Math.random(), y: 1 + Math.random(), v: 0.002 + Math.random() * 0.006, r: 1 + Math.random() * 2.5 }));
  let raf, t = 0;
  const draw = () => {
    const w = (canvas.width = canvas.clientWidth), hh = (canvas.height = canvas.clientHeight);
    t += 0.05;
    g.clearRect(0, 0, w, hh);
    const flicker = 0.25 + Math.sin(t * 3) * 0.06 + Math.random() * 0.06;
    const grd = g.createLinearGradient(0, hh, 0, 0);
    grd.addColorStop(0, `rgba(255, 110, 20, ${flicker})`);
    grd.addColorStop(0.6, 'rgba(120, 30, 0, 0.05)');
    grd.addColorStop(1, 'rgba(0, 0, 0, 0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, w, hh);
    for (const s of sparks) {
      s.y -= s.v;
      s.x += Math.sin(t + s.y * 10) * 0.001;
      if (s.y < -0.05) { s.y = 1.05; s.x = Math.random(); }
      g.fillStyle = `rgba(255, ${150 + Math.random() * 80}, 60, ${0.5 + Math.random() * 0.5})`;
      g.beginPath();
      g.arc(s.x * w, s.y * hh, s.r, 0, Math.PI * 2);
      g.fill();
    }
    raf = requestAnimationFrame(draw);
  };
  draw();
  return () => cancelAnimationFrame(raf);
}

function dustFx(canvas) {
  const g = canvas.getContext('2d');
  const motes = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random(), r: 0.6 + Math.random() * 1.6, p: Math.random() * 6 }));
  let raf, t = 0;
  const draw = () => {
    const w = (canvas.width = canvas.clientWidth), hh = (canvas.height = canvas.clientHeight);
    t += 0.01;
    g.clearRect(0, 0, w, hh);
    for (const m of motes) {
      const x = (m.x + Math.sin(t + m.p) * 0.02) * w, y = ((m.y + t * 0.01) % 1) * hh;
      g.fillStyle = `rgba(255, 230, 190, ${0.25 + Math.sin(t * 2 + m.p) * 0.15})`;
      g.beginPath();
      g.arc(x, y, m.r, 0, Math.PI * 2);
      g.fill();
    }
    raf = requestAnimationFrame(draw);
  };
  draw();
  return () => cancelAnimationFrame(raf);
}

function sirenFx(el) {
  const tl = gsap.timeline({ repeat: -1 });
  tl.to(el, { background: 'radial-gradient(circle at 15% 30%, rgba(216,50,61,.35), transparent 55%)', duration: 0.45 })
    .to(el, { background: 'radial-gradient(circle at 85% 30%, rgba(60,110,255,.35), transparent 55%)', duration: 0.45 });
  return () => tl.kill();
}

function subtitle(line) {
  const box = h('div', {});
  if (line.orig && line.orig !== line.en) box.append(h('span', { class: 'sub-original' }, line.orig));
  if (line.who) box.append(h('span', { class: 'sub' }, h('span', { class: 'sub-speaker' }, `${line.who}: `), line.en));
  else box.append(h('span', { class: 'sub sub-narration' }, line.en));
  return box;
}

/**
 * Play a list of panels inside host. Resolves when finished or skipped.
 * panel: { img, mood, place, lines:[{who,en,orig}], fx:[], kb:{from:[scale,x,y],to:[...]}, sfx, title }
 */
export function playCinematic(host, panels, { titleNode } = {}) {
  return new Promise((resolve) => {
    const stage = h('div', { class: 'cine-stage' });
    const caption = h('div', { class: 'cine-caption', 'aria-live': 'polite' });
    const progress = h('div', { class: 'cine-progress' });
    const skip = h('button', { class: 'btn btn--small', onclick: (e) => { e.stopPropagation(); finish(); } }, 'Skip');
    const root = h('div', { class: 'screen cine', onclick: () => next() },
      stage, caption, progress,
      h('div', { class: 'cine-controls' }, skip),
      h('div', { class: 'cine-hint' }, 'Tap to continue'));
    host.append(root);
    startRain(0.25);

    let p = -1, l = -1, timer = null, cleanups = [], done = false, current = null;

    const clearFx = () => { cleanups.forEach((fn) => fn()); cleanups = []; };

    function showPanel(i) {
      clearFx();
      const panel = panels[i];
      const el = h('div', { class: 'cine-panel' });
      const img = h('div', { class: 'cine-img' });
      el.append(img, h('div', { class: 'cine-vignette' }));
      const fx = panel.fx || [];
      if (panel.title) {
        img.style.background = '#05080b';
        if (typeof panel.title === 'object') el.append(caseTitleCard(panel.title));
        else el.append(titleNode ? titleNode() : h('div', { class: 'cine-title' }, h('div', {}, h('div', { class: 'display', style: { fontSize: 'clamp(4rem,14vw,9rem)', color: 'var(--sodium)' } }, 'Floor 14'))));
      } else {
        paintInto(img, panel.img, panel.img, panel.mood);
      }
      const fxCanvas = h('canvas', { class: 'cine-fx' });
      el.append(fxCanvas);
      if (fx.includes('rain')) cleanups.push(rainFx(fxCanvas));
      else if (fx.includes('fire')) cleanups.push(emberFx(fxCanvas));
      else if (fx.includes('dust')) cleanups.push(dustFx(fxCanvas));
      if (fx.includes('siren')) {
        const light = h('div', { class: 'cine-fx' });
        el.append(light);
        cleanups.push(sirenFx(light));
      }
      if (panel.place) el.append(h('div', { class: 'cine-place' }, panel.place));
      if (panel.music) app.music?.play?.(panel.music);
      stage.append(el);
      const kb = panel.kb || { from: [1.05, 0, 0], to: [1, 0, 0] };
      gsap.fromTo(img, { scale: kb.from[0], xPercent: kb.from[1], yPercent: kb.from[2] },
        { scale: kb.to[0], xPercent: kb.to[1], yPercent: kb.to[2], duration: 9, ease: 'none' });
      gsap.to(el, { opacity: 1, duration: 0.9, ease: 'power2.out' });
      if (current) {
        const old = current;
        gsap.to(old, { opacity: 0, duration: 0.9, onComplete: () => old.remove() });
      }
      current = el;
      if (fx.includes('shake')) gsap.fromTo(img, { x: -6 }, { x: 6, duration: 0.07, repeat: 14, yoyo: true, ease: 'none' });
      if (fx.includes('buzz')) gsap.fromTo(img, { x: -2 }, { x: 2, duration: 0.04, repeat: 20, yoyo: true, ease: 'none', delay: 0.3 });
      if (panel.sfx === 'thunder') { thunder(0.4); setTimeout(() => flashEl(el), 300); }
      if (panel.sfx === 'buzz') { sfx.buzz(); setTimeout(() => sfx.buzz(), 1300); }
      if (panel.sfx === 'lift') sfx.lift();
      if (panel.sfx === 'fire') setRain(0.08);
      else setRain(fx.includes('rain') ? 0.28 : 0.1);
      progress.style.width = `${((i + 1) / panels.length) * 100}%`;
    }

    function flashEl(el) {
      gsap.fromTo(el, { filter: 'brightness(2.6)' }, { filter: 'brightness(1)', duration: 0.6 });
    }

    function showLine(line) {
      caption.innerHTML = '';
      if (!line) return;
      const s = subtitle(line);
      caption.append(s);
      gsap.from(s, { opacity: 0, y: 8, duration: 0.35 });
      const words = line.en.split(/\s+/).length;
      clearTimeout(timer);
      timer = setTimeout(() => next(), Math.max(3200, words * 380 + 1200));
    }

    function next() {
      if (done) return;
      clearTimeout(timer);
      const panel = panels[p];
      if (panel && panel.lines && l < panel.lines.length - 1) {
        l++;
        showLine(panel.lines[l]);
        return;
      }
      p++;
      l = -1;
      if (p >= panels.length) return finish();
      showPanel(p);
      const np = panels[p];
      if (np.lines?.length) {
        l = 0;
        showLine(np.lines[0]);
      } else {
        caption.innerHTML = '';
        timer = setTimeout(() => next(), np.title ? 4200 : 3000);
      }
    }

    function finish() {
      if (done) return;
      done = true;
      clearTimeout(timer);
      gsap.to(root, { opacity: 0, duration: 0.6, onComplete: () => { clearFx(); root.remove(); resolve(); } });
    }

    next();
  });
}
