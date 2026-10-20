// Motion-comic player: panels with slow camera moves, layered weather effects and English subtitles.
// A panel can also be a short video clip with its own sound (see "Video clips" below and README).
import { gsap } from 'gsap';
import { h } from '../core/ui.js';
import { paintInto, imgUrl, hasImage } from '../core/assets.js';
import { sfx, thunder, startRain, setRain } from '../core/audio.js';
import { state, onChange } from '../core/state.js';
import { app } from '../core/app.js';
import '../styles/cases.css';

// ---------------------------------------------------------------------------------------------
// Video clips
//
// A panel plays public/assets/video/<key>.mp4 instead of its still when that file exists:
//   { img: 'intro_01_rain' }                   -> tries assets/video/intro_01_rain.mp4
//   { img: 'intro_09_kancil', video: 'x' }      -> tries assets/video/x.mp4
//   { img: 'intro_03_fire', video: false }      -> never looks for a clip
// If the clip is missing, cannot be decoded, or fails mid-way, the still and its Ken Burns move
// show exactly as before. The still is also the poster, and the clip fades in over it once it is
// playing, so there is never a black frame. Clips hold their last frame if they end before the
// captions do. They play with sound (settings: sound + sound effects volume) and duck the music.
//
// Two <video> elements are reused for every panel (crossfades need two). Mobile browsers only allow
// unmuted playback on an element that has been started inside a tap, so unlockCinemaVideo() is
// called from taps (the licence signature, any tap in a cinematic). If the browser still refuses
// sound, the clip plays muted and a "Tap for sound" chip appears.

const VIDEO_DIR = 'assets/video/';
export const videoUrl = (key) => `${VIDEO_DIR}${key}.mp4`;
// 0.1 s of silence: gives an idle <video> something to play inside a tap so iOS unlocks it
const SILENCE = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAAAA';

const probes = new Map(); // key -> { state: 'pending' | 'yes' | 'maybe' | 'no', promise }
const slots = [];
let soundChip = null; // set while a cinematic is showing its chip

const soundOn = () => state().settings.sound !== false;
const clipVolume = () => {
  const v = Number(state().settings.sfxVolume);
  return Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 0.8;
};

function videoAllowed() {
  if (navigator.connection?.saveData) return false;
  const probe = document.createElement('video');
  return typeof probe.canPlayType === 'function' && probe.canPlayType('video/mp4') !== '';
}

/** The clip key a panel would play, or null. */
export function clipKey(panel) {
  if (!panel || panel.title || panel.video === false) return null;
  if (typeof panel.video === 'string' && panel.video) return panel.video;
  return panel.img || null;
}

/**
 * Does assets/video/<key>.mp4 exist? One HEAD request per key per session. A dev server (or an SPA
 * host) answers a missing file with index.html, so the content type has to be a video.
 */
function probeClip(key) {
  if (!key) return null;
  let entry = probes.get(key);
  if (entry) return entry;
  entry = { state: 'pending' };
  entry.promise = fetch(videoUrl(key), { method: 'HEAD' })
    .then((res) => {
      const type = (res.headers.get('content-type') || '').toLowerCase();
      if (res.ok) return type.startsWith('video/') || type.includes('octet-stream') || !type ? 'yes' : 'no';
      return res.status === 405 || res.status === 501 ? 'maybe' : 'no'; // host refuses HEAD: let the element try
    })
    .catch(() => 'no')
    .then((s) => (entry.state = s));
  probes.set(key, entry);
  return entry;
}

function makeSlot() {
  const v = document.createElement('video');
  v.className = 'cine-video';
  v.playsInline = true;
  v.setAttribute('playsinline', '');
  v.setAttribute('webkit-playsinline', '');
  v.setAttribute('disablepictureinpicture', '');
  v.setAttribute('disableremoteplayback', '');
  v.setAttribute('aria-hidden', 'true');
  v.preload = 'auto';
  v.loop = false;
  v.controls = false;
  v._token = 0;
  return v;
}
const getSlots = () => {
  if (!slots.length) slots.push(makeSlot(), makeSlot());
  return slots;
};

function applyAudio(v) {
  v.volume = clipVolume();
  if (!soundOn()) v.muted = true;
}

/**
 * Call inside a user gesture (tap / click / key). Idle video elements play a moment of silence so
 * mobile Safari lets them play sound later; a clip that was forced to play muted gets its sound back.
 */
export function unlockCinemaVideo() {
  for (const v of getSlots()) {
    if (v.dataset.clip) {
      if (v.dataset.want === 'play') {
        if (soundOn() && v.muted) {
          v.muted = false;
          applyAudio(v);
          if (v.paused && !v.ended) v.play().catch(() => {});
          if (!v.muted) app.music?.duck?.(0.3);
        }
      } else if (!v.dataset.unlocked) {
        // preloaded but idle: start and stop it inside the tap
        v.dataset.unlocked = '1';
        v.muted = true;
        const p = v.play();
        if (p && p.then) p.then(() => { if (v.dataset.want !== 'play') { v.pause(); v.muted = false; try { v.currentTime = 0; } catch { /* not seekable */ } } }).catch(() => {});
      }
      continue;
    }
    if (v.dataset.unlocked) continue;
    v.muted = false;
    v.src = SILENCE;
    const p = v.play();
    v.dataset.unlocked = '1';
    if (p && p.then) p.then(() => { if (!v.dataset.clip) v.pause(); }).catch(() => {});
  }
  if (soundChip && soundOn()) { soundChip.remove(); soundChip = null; }
}

// the first tap after this module loads unlocks the idle elements (later cinematics need no tap)
const firstTap = () => {
  unlockCinemaVideo();
  window.removeEventListener('click', firstTap, true);
  window.removeEventListener('keydown', firstTap, true);
};
window.addEventListener('click', firstTap, true);
window.addEventListener('keydown', firstTap, true);

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
    const controls = h('div', { class: 'cine-controls' }, skip);
    const root = h('div', { class: 'screen cine', onclick: () => { unlockCinemaVideo(); next(); } },
      stage, caption, progress,
      controls,
      h('div', { class: 'cine-hint' }, 'Tap to continue'));
    host.append(root);
    startRain(0.25);

    let p = -1, l = -1, timer = null, cleanups = [], done = false, current = null;
    let liveVideo = null; // the <video> in the current panel, if any

    const clearFx = () => { cleanups.forEach((fn) => fn()); cleanups = []; };

    // ---------- clips ----------
    const useVideo = videoAllowed();
    if (useVideo) panels.forEach((panel) => probeClip(clipKey(panel)));
    const clipReady = (panel) => {
      const e = useVideo ? probes.get(clipKey(panel)) : null;
      return !!e && (e.state === 'yes' || e.state === 'maybe');
    };

    function showChip() {
      if (soundChip || done || !soundOn()) return;
      soundChip = h('button', { class: 'btn btn--small cine-sound', type: 'button', onclick: (e) => { e.stopPropagation(); unlockCinemaVideo(); } },
        h('span', { 'aria-hidden': 'true', html: '<svg viewBox="0 0 24 24"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>' }),
        'Tap for sound');
      controls.prepend(soundChip);
      gsap.from(soundChip, { opacity: 0, y: -6, duration: 0.3 });
    }

    function releaseVideo(v, { unload = false } = {}) {
      v._token++;
      v.onplaying = v.onerror = null;
      delete v.dataset.want;
      v.pause();
      v.classList.remove('is-on');
      if (unload) {
        delete v.dataset.clip;
        v.removeAttribute('src');
        v.removeAttribute('poster');
        v.load();
      }
      v.remove();
      if (v === liveVideo) { liveVideo = null; app.music?.unduck?.(); }
    }

    function playClip(v) {
      v.dataset.want = 'play';
      applyAudio(v);
      const token = v._token;
      const withSound = soundOn() && clipVolume() > 0;
      v.muted = !withSound;
      const pr = v.play();
      if (!pr || !pr.then) return;
      pr.then(() => {
        if (token === v._token && !v.muted && v === liveVideo) app.music?.duck?.(0.3);
      }).catch((err) => {
        if (token !== v._token || done) return;
        if (err?.name === 'NotAllowedError' && !v.muted) {
          // no sound allowed yet: play muted and offer sound
          v.muted = true;
          v.play().then(() => { if (token === v._token) showChip(); }).catch(() => { if (token === v._token) failVideo(v); });
        } else if (err?.name !== 'AbortError') failVideo(v);
      });
    }

    function failVideo(v) {
      const key = v.dataset.clip;
      if (key && probes.get(key)) probes.get(key).state = 'no';
      releaseVideo(v, { unload: true });
    }

    /** Put the panel's clip over its still. Returns true if a clip is starting. */
    function attachVideo(el, panel, avoid) {
      const key = clipKey(panel);
      if (!key || !clipReady(panel)) return false;
      const pool = getSlots();
      // a slot that already holds this clip (preloaded), else the one not fading out with the last panel
      const v = pool.find((x) => x.dataset.clip === key && x !== avoid) || pool.find((x) => x !== avoid) || pool[0];
      if (v.parentNode) releaseVideo(v);
      gsap.killTweensOf(v);
      v._token++;
      const token = v._token;
      if (v.dataset.clip !== key || !v.src || v.src.startsWith('data:')) {
        v.dataset.clip = key;
        v.src = videoUrl(key);
      } else {
        try { v.currentTime = 0; } catch { /* not seekable yet */ }
      }
      if (panel.img) hasImage(panel.img).then((ok) => { if (ok && token === v._token) v.poster = imgUrl(panel.img); });
      v.onplaying = () => { if (token === v._token) v.classList.add('is-on'); };
      v.onerror = () => { if (token === v._token) failVideo(v); };
      el.querySelector('.cine-vignette').before(v);
      el.classList.add('has-video');
      liveVideo = v;
      playClip(v);
      return true;
    }

    /** Load the next panel's clip into the idle slot so it starts without a wait. */
    function preloadNext(i) {
      const panel = panels[i];
      if (!panel || !clipReady(panel)) return;
      const key = clipKey(panel);
      const pool = getSlots();
      if (pool.some((x) => x.dataset.clip === key)) return;
      const v = pool.find((x) => x !== liveVideo && !x.parentNode);
      if (!v) return;
      v._token++;
      v.dataset.clip = key;
      v.src = videoUrl(key);
      v.load();
    }

    const offChange = onChange(() => {
      if (!liveVideo) return;
      applyAudio(liveVideo);
      if (!soundOn()) app.music?.unduck?.();
    });
    const onVisibility = () => {
      if (!liveVideo) return;
      if (document.hidden) liveVideo.pause();
      else if (liveVideo.dataset.want === 'play' && !liveVideo.ended) liveVideo.play().catch(() => {});
    };
    document.addEventListener('visibilitychange', onVisibility);

    function showPanel(i) {
      clearFx();
      const panel = panels[i];
      const el = h('div', { class: 'cine-panel' });
      const img = h('div', { class: 'cine-img' });
      el.append(img, h('div', { class: 'cine-vignette' }));
      // a clip carries its own sound and motion: no procedural sfx, weather overlays or shakes on top
      const prevVideo = liveVideo;
      const hasClip = !panel.title && attachVideo(el, panel, prevVideo);
      if (!hasClip) { liveVideo = null; if (prevVideo) app.music?.unduck?.(); }
      if (prevVideo && prevVideo !== liveVideo) gsap.to(prevVideo, { volume: 0, duration: 0.8 });
      const fx = hasClip ? [] : panel.fx || [];
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
        gsap.to(old, { opacity: 0, duration: 0.9, onComplete: () => {
          const v = old.querySelector('video');
          if (v && v !== liveVideo) releaseVideo(v);
          old.remove();
          if (!done) preloadNext(i + 1);
        } });
      } else if (!done) {
        setTimeout(() => { if (!done && p === i) preloadNext(i + 1); }, 900);
      }
      current = el;
      if (fx.includes('shake')) gsap.fromTo(img, { x: -6 }, { x: 6, duration: 0.07, repeat: 14, yoyo: true, ease: 'none' });
      if (fx.includes('buzz')) gsap.fromTo(img, { x: -2 }, { x: 2, duration: 0.04, repeat: 20, yoyo: true, ease: 'none', delay: 0.3 });
      if (hasClip) {
        setRain(0.04); // the clip has its own weather
      } else {
        if (panel.sfx === 'thunder') { thunder(0.4); setTimeout(() => flashEl(el), 300); }
        if (panel.sfx === 'buzz') { sfx.buzz(); setTimeout(() => sfx.buzz(), 1300); }
        if (panel.sfx === 'lift') sfx.lift();
        if (panel.sfx === 'fire') setRain(0.08);
        else setRain(fx.includes('rain') ? 0.28 : 0.1);
      }
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
      offChange();
      document.removeEventListener('visibilitychange', onVisibility);
      if (liveVideo) gsap.to(liveVideo, { volume: 0, duration: 0.5 });
      app.music?.unduck?.(1.2);
      gsap.to(root, { opacity: 0, duration: 0.6, onComplete: () => {
        clearFx();
        getSlots().forEach((v) => { gsap.killTweensOf(v); releaseVideo(v, { unload: true }); });
        soundChip = null;
        root.remove();
        resolve();
      } });
    }

    // give the first clip lookup a moment, so panel 1 does not start as a still and then switch
    const first = useVideo ? probes.get(clipKey(panels[0])) : null;
    if (first && first.state === 'pending') Promise.race([first.promise, new Promise((r) => setTimeout(r, 700))]).then(() => { if (!done) next(); });
    else next();
  });
}
