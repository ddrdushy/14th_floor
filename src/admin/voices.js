// Admin: cast a Fish Audio voice for every speaker in the cinematics.
//   mountVoices(el, { api, token })   (called by admin.js)
//     api(path, opts)  fetches ./api<path> with the admin Bearer token; resolves with the JSON body,
//                      rejects with an error carrying { status, code, data }
//     token()          the admin password, used for the two audio requests (preview), which are not JSON
// Talks to /api/admin/voices/* (functions/api/admin/voices/[[path]].js). Plain DOM, styles in voices.css.
import './voices.css';

const BASE = '/admin/voices'; // under ./api
const LANGS = [
  ['', 'Any language'], ['en', 'English'], ['ms', 'Malay'], ['ta', 'Tamil'], ['zh', 'Chinese'], ['yue', 'Cantonese'], ['ja', 'Japanese'], ['ko', 'Korean'],
];
const LANG_LABEL = { en: 'English', ms: 'Malay', ta: 'Tamil', yue: 'Cantonese', 'zh-hokkien': 'Hokkien', zh: 'Chinese' };
// a sensible first search for each language a speaker uses
const SEARCH_LANG = { ms: 'ms', ta: 'ta', yue: 'zh', 'zh-hokkien': 'zh', zh: 'zh', en: 'en' };
const PRICE_PER_MB = 15; // USD per million UTF-8 bytes (s2.1-pro / s2-pro), docs.fish.audio pricing

function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'text') el.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  return el;
}

/** A cover that fails to load becomes an empty tile instead of a broken-image icon. */
function hideBroken(e) { const img = e.currentTarget; img.replaceWith(Object.assign(document.createElement('span'), { className: 'vx-cover vx-cover--none' })); }

const fmtBytes = (n) => (n > 1e6 ? `${(n / 1e6).toFixed(2)} MB` : `${(n / 1e3).toFixed(1)} KB`);
const fmtUsd = (bytes) => `$${((bytes / 1e6) * PRICE_PER_MB).toFixed(2)}`;
const langChips = (langs) => Object.entries(langs || {}).map(([l, n]) => h('span', { class: 'vx-chip' }, `${LANG_LABEL[l] || l} ${n}`));

export function mountVoices(el, { api, token } = {}) {
  if (typeof api !== 'function') throw new Error('mountVoices needs { api }');
  const secret = () => (typeof token === 'function' ? token() : token) || '';

  // ---------- requests ----------
  const explain = (err) => {
    const d = err?.data || {};
    if (err?.status === 0) return 'Could not reach the server';
    return d.message || (d.error && d.error !== 'server_error' ? d.error.replace(/_/g, ' ') : null) || err?.code || err?.message || 'Request failed';
  };
  async function req(path, { method = 'GET', body, raw = false } = {}) {
    const init = { method, headers: { accept: raw ? 'audio/mpeg' : 'application/json' } };
    if (body !== undefined) {
      init.body = JSON.stringify(body);
      init.headers['content-type'] = 'application/json';
    }
    if (raw) {
      // audio is not JSON, so this goes around api() with the same Bearer token
      const r = await fetch(`./api${BASE}${path}`, { ...init, cache: 'no-store', credentials: 'same-origin', headers: { ...init.headers, authorization: `Bearer ${secret()}` } });
      if (!r.ok) {
        let msg = `HTTP ${r.status}`;
        try { const j = await r.json(); msg = j.message || j.error || msg; } catch { /* not json */ }
        throw new Error(msg);
      }
      return r.blob();
    }
    let r;
    try {
      r = await api(`${BASE}${path}`, init);
    } catch (err) {
      throw new Error(explain(err));
    }
    if (r instanceof Response) { // an api() that hands back the raw response
      let data = null;
      try { data = await r.json(); } catch { /* empty */ }
      if (!r.ok || (data && data.ok === false)) throw new Error((data && (data.message || data.error)) || `HTTP ${r.status}`);
      return data;
    }
    if (r && r.ok === false) throw new Error(r.message || r.error || 'Request failed');
    return r;
  }

  // ---------- state ----------
  let info = null; // GET /api/admin/voices
  let map = {};
  let cache = {}; // voice -> { stored, current, total }
  const open = new Set(); // expanded speakers
  const searches = {}; // voice -> { q, lang, sort, mine, page, items, hasMore }, kept across re-renders
  const player = new Audio();
  let playingBtn = null;
  let destroyed = false;

  const root = h('div', { class: 'vx' });
  const toast = h('div', { class: 'vx-toast', role: 'status', 'aria-live': 'polite' });
  el.replaceChildren(root, toast);

  let toastTimer;
  function say(msg, bad = false) {
    toast.textContent = msg;
    toast.classList.toggle('is-bad', bad);
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-on'), bad ? 6000 : 2600);
  }

  function stopPlaying() {
    player.pause();
    if (playingBtn) { playingBtn.classList.remove('is-playing'); playingBtn.textContent = playingBtn.dataset.label || 'Play'; }
    playingBtn = null;
  }
  player.addEventListener('ended', stopPlaying);
  player.addEventListener('error', () => { if (playingBtn) say('Could not play that audio', true); stopPlaying(); });

  /** Play a URL or a promise of a Blob, toggling the button's label. */
  async function play(btn, src) {
    if (playingBtn === btn) { stopPlaying(); return; }
    stopPlaying();
    playingBtn = btn;
    btn.dataset.label = btn.dataset.label || btn.textContent;
    btn.textContent = 'Loading…';
    btn.classList.add('is-playing');
    try {
      let url = src;
      if (typeof src === 'function') {
        const blob = await src();
        url = URL.createObjectURL(blob);
        player.addEventListener('ended', () => URL.revokeObjectURL(url), { once: true });
      }
      if (playingBtn !== btn) return;
      player.src = url;
      await player.play();
      if (playingBtn === btn) btn.textContent = 'Stop';
    } catch (err) {
      if (playingBtn === btn) { say(err.message || 'Could not play', true); stopPlaying(); }
    }
  }

  async function saveMap(next, msg = 'Saved') {
    const res = await req('/map', { method: 'PUT', body: { map: next } });
    map = res.map || next;
    say(msg);
    return map;
  }

  async function refreshCache() {
    try {
      cache = (await req('/cache')).cache || {};
      if (!destroyed) render();
    } catch { /* counts are optional */ }
  }

  // ---------- views ----------
  function header() {
    const c = info.configured || {};
    const voicedCount = info.speakers.filter((s) => voiceOf(s.name)).length;
    const genAll = h('button', { class: 'vx-btn vx-btn--primary', type: 'button', disabled: !c.fish || !voicedCount, onclick: () => generate(null, genAll) }, 'Generate all missing lines');
    return h('header', { class: 'vx-head' },
      h('div', {},
        h('h2', { class: 'vx-title' }, 'Voices'),
        h('p', { class: 'vx-lede' },
          `${info.totals.lines} spoken lines, ${fmtBytes(info.totals.bytes)} of text. Each line is generated once (about ${fmtUsd(info.totals.bytes)} for the whole game at $${PRICE_PER_MB} per million bytes), stored in KV and served from there to every player.`)),
      h('div', { class: 'vx-status' },
        h('span', { class: `vx-pill ${c.kv ? 'is-good' : 'is-bad'}` }, c.kv ? 'KV VOICE bound' : 'KV VOICE missing'),
        h('span', { class: `vx-pill ${c.fish ? 'is-good' : 'is-bad'}` }, c.fish ? 'FISH_API_KEY set' : 'FISH_API_KEY missing'),
        c.stub ? h('span', { class: 'vx-pill is-warn' }, 'FISH_API_BASE override (test stub)') : null,
        h('span', { class: 'vx-pill' }, `${voicedCount} of ${info.speakers.length} speakers voiced`),
        genAll));
  }

  function settingsRow() {
    const s = map._settings || {};
    const model = h('select', { class: 'vx-input', 'aria-label': 'Default model', onchange: async () => {
      const next = { ...map, _settings: { ...(map._settings || {}), model: model.value || undefined } };
      if (!model.value) delete next._settings.model;
      try { await saveMap(next, 'Default model saved'); render(); } catch (err) { say(err.message, true); }
    } }, h('option', { value: '' }, 's2.1-pro (default)'), ...info.models.filter((m) => m !== 's2.1-pro').map((m) => h('option', { value: m, selected: s.model === m }, m)));
    const d = map._default;
    return h('section', { class: 'vx-settings' },
      h('label', { class: 'vx-field' }, h('span', {}, 'Model for every line'), model),
      h('div', { class: 'vx-field' },
        h('span', {}, 'Fallback voice for unassigned speakers'),
        h('div', { class: 'vx-fallback' },
          d && d.reference_id ? voiceBadge(d) : h('span', { class: 'vx-muted' }, 'None: unassigned speakers stay silent'),
          d && d.reference_id ? h('button', { class: 'vx-btn vx-btn--small', type: 'button', onclick: async () => {
            const next = { ...map };
            delete next._default;
            try { await saveMap(next, 'Fallback voice removed'); render(); } catch (err) { say(err.message, true); }
          } }, 'Remove') : null)),
      h('p', { class: 'vx-hint' }, 'Tip: in a speaker\'s search results, "Use as fallback" sets this voice.'));
  }

  function voiceBadge(v) {
    return h('span', { class: 'vx-voice' },
      v.cover ? h('img', { src: v.cover, alt: '', class: 'vx-cover', loading: 'lazy', referrerpolicy: 'no-referrer', onerror: hideBroken }) : h('span', { class: 'vx-cover vx-cover--none' }),
      h('span', { class: 'vx-voice-text' }, h('strong', {}, v.title || 'Fish voice'), h('code', {}, v.reference_id)));
  }

  const voiceOf = (name) => {
    const own = map[name];
    if (own?.off) return null;
    if (own?.reference_id) return own;
    return map._default?.reference_id ? { ...map._default, fallback: true } : null;
  };

  function speakerCard(s) {
    const own = map[s.name] || {};
    const v = voiceOf(s.name);
    const counts = cache[s.name];
    const isOpen = open.has(s.name);
    const body = h('div', { class: 'vx-body' });
    const card = h('article', { class: `vx-card${isOpen ? ' is-open' : ''}${v ? '' : ' is-silent'}` },
      h('div', { class: 'vx-row' },
        h('div', { class: 'vx-who' },
          h('h3', {}, s.name),
          s.shownAs?.length ? h('p', { class: 'vx-muted' }, `Also captioned as ${s.shownAs.map((x) => `"${x}"`).join(', ')}`) : null,
          h('div', { class: 'vx-chips' }, h('span', { class: 'vx-chip vx-chip--count' }, `${s.lines} line${s.lines === 1 ? '' : 's'}`), ...langChips(s.langs))),
        h('div', { class: 'vx-assigned' },
          own.off ? h('span', { class: 'vx-muted' }, 'Silent (switched off)')
            : v ? h('div', {}, voiceBadge(v), v.fallback ? h('span', { class: 'vx-muted' }, ' (fallback voice)') : null)
            : h('span', { class: 'vx-muted' }, 'No voice yet'),
          counts ? h('span', { class: 'vx-muted vx-counts' }, `${counts.current} of ${counts.total} lines stored`) : null),
        h('button', { class: 'vx-btn', type: 'button', 'aria-expanded': String(isOpen), onclick: () => { if (open.has(s.name)) open.delete(s.name); else open.add(s.name); render(); } }, isOpen ? 'Close' : 'Cast & lines')),
      body);
    if (isOpen) fillBody(body, s);
    return card;
  }

  function fillBody(body, s) {
    const own = map[s.name] || {};
    const v = voiceOf(s.name);
    const dominant = Object.entries(s.langs || {}).sort((a, b) => b[1] - a[1])[0]?.[0] || 'en';
    const nonEnglish = Object.keys(s.langs || {}).find((l) => l !== 'en');

    // controls for the assigned voice
    const speed = h('input', { type: 'range', min: 0.5, max: 2, step: 0.05, value: own.speed ?? 1, class: 'vx-range', 'aria-label': 'Speed' });
    const speedOut = h('output', {}, `${Number(own.speed ?? 1).toFixed(2)}x`);
    speed.addEventListener('input', () => { speedOut.textContent = `${Number(speed.value).toFixed(2)}x`; });
    speed.addEventListener('change', async () => {
      const next = { ...map, [s.name]: { ...(map[s.name] || {}), speed: Number(speed.value) } };
      if (Number(speed.value) === 1) delete next[s.name].speed;
      try { await saveMap(next, `${s.name}: speed saved`); refreshCache(); } catch (err) { say(err.message, true); }
    });
    const model = h('select', { class: 'vx-input', 'aria-label': 'Model for this speaker', onchange: async () => {
      const next = { ...map, [s.name]: { ...(map[s.name] || {}) } };
      if (model.value) next[s.name].model = model.value; else delete next[s.name].model;
      try { await saveMap(next, `${s.name}: model saved`); refreshCache(); } catch (err) { say(err.message, true); }
    } }, h('option', { value: '' }, 'Model: as default'), ...info.models.map((m) => h('option', { value: m, selected: own.model === m }, m)));
    const silent = h('input', { type: 'checkbox', checked: !!own.off, onchange: async () => {
      const next = { ...map, [s.name]: { ...(map[s.name] || {}) } };
      if (silent.checked) next[s.name].off = true; else delete next[s.name].off;
      try { await saveMap(next, silent.checked ? `${s.name} is silent` : `${s.name} speaks again`); render(); } catch (err) { say(err.message, true); }
    } });
    const genBtn = h('button', { class: 'vx-btn', type: 'button', disabled: !v, onclick: () => generate(s.name, genBtn) }, 'Generate missing lines');
    const regenBtn = h('button', { class: 'vx-btn vx-btn--danger', type: 'button', disabled: !v, onclick: async () => {
      if (!confirm(`Delete every stored line for ${s.name}? The next play (or "Generate") makes a new take and costs credits again.`)) return;
      try {
        const r = await req('/purge', { method: 'POST', body: { voice: s.name } });
        await reload();
        say(`${s.name}: ${r.deleted} stored line${r.deleted === 1 ? '' : 's'} deleted`);
      } catch (err) { say(err.message, true); }
    } }, 'Regenerate (purge)');
    body.append(h('div', { class: 'vx-tools' },
      h('label', { class: 'vx-field vx-field--inline' }, h('span', {}, 'Speed'), speed, speedOut),
      model,
      h('label', { class: 'vx-check' }, silent, h('span', {}, 'Silent (no voice)')),
      genBtn, regenBtn));

    // search
    const st = (searches[s.name] ||= { q: '', lang: SEARCH_LANG[nonEnglish || dominant] || '', sort: 'score', mine: false, page: 1, items: null, hasMore: false });
    const q = h('input', { class: 'vx-input', type: 'search', placeholder: 'Search Fish Audio voices (e.g. "Malaysian woman", "old man", "narrator")', value: st.q });
    const lang = h('select', { class: 'vx-input', 'aria-label': 'Language' }, ...LANGS.map(([val, label]) => h('option', { value: val, selected: val === st.lang }, label)));
    const sort = h('select', { class: 'vx-input', 'aria-label': 'Sort' }, ...[['score', 'Best match'], ['task_count', 'Most used'], ['created_at', 'Newest']].map(([val, label]) => h('option', { value: val, selected: val === st.sort }, label)));
    const mine = h('input', { type: 'checkbox', checked: st.mine });
    const results = h('div', { class: 'vx-results' });
    const more = h('button', { class: 'vx-btn vx-btn--small', type: 'button', hidden: !st.hasMore }, 'More');
    if (st.items) {
      if (!st.items.length) results.append(h('p', { class: 'vx-muted' }, 'No voices found. Try fewer words or another language.'));
      for (const m of st.items) results.append(resultCard(s, m));
    }
    const run = async (append = false) => {
      Object.assign(st, { q: q.value.trim(), lang: lang.value, sort: sort.value, mine: mine.checked, page: append ? st.page + 1 : 1 });
      if (!append) results.replaceChildren(h('p', { class: 'vx-muted' }, 'Searching…'));
      try {
        const qs = new URLSearchParams({ q: st.q, lang: st.lang, sort: st.sort, page: String(st.page), self: st.mine ? '1' : '' });
        const r = await req(`/search?${qs}`);
        st.items = append ? [...(st.items || []), ...r.items] : r.items;
        st.hasMore = !!r.hasMore;
        if (!append) results.replaceChildren();
        if (!r.items.length && !append) results.append(h('p', { class: 'vx-muted' }, 'No voices found. Try fewer words or another language.'));
        for (const m of r.items) results.append(resultCard(s, m));
        more.hidden = !st.hasMore;
      } catch (err) {
        results.replaceChildren(h('p', { class: 'vx-error' }, `Search failed: ${err.message}`));
      }
    };
    more.addEventListener('click', () => run(true));
    const form = h('form', { class: 'vx-search', onsubmit: (e) => { e.preventDefault(); run(); } },
      q, lang, sort, h('label', { class: 'vx-check' }, mine, h('span', {}, 'My voices')), h('button', { class: 'vx-btn vx-btn--primary', type: 'submit' }, 'Search'));
    body.append(h('h4', {}, 'Find a voice'), form, results, more);

    // lines
    const list = h('ol', { class: 'vx-lines' }, h('li', { class: 'vx-muted' }, 'Loading lines…'));
    body.append(h('h4', {}, 'Lines'), list);
    loadLines(s, list);
  }

  function resultCard(s, m) {
    const own = map[s.name] || {};
    const isCurrent = own.reference_id === m.id;
    const sample = m.samples?.[0];
    const sampleBtn = sample ? h('button', { class: 'vx-btn vx-btn--small', type: 'button', title: sample.text || '', onclick: () => play(sampleBtn, sample.audio) }, 'Sample') : null;
    const previewBtn = h('button', { class: 'vx-btn vx-btn--small', type: 'button', title: s.sample ? `"${s.sample.text}"` : '', onclick: () => play(previewBtn, () => req('/preview', { method: 'POST', raw: true, body: { voice: s.name, reference_id: m.id, id: s.sample?.id } })) }, 'Hear a line');
    const pick = { reference_id: m.id, title: m.title, cover: m.cover || undefined, languages: m.languages };
    const assign = h('button', { class: 'vx-btn vx-btn--small vx-btn--primary', type: 'button', disabled: isCurrent, onclick: async () => {
      const keep = {};
      for (const k of ['speed', 'model', 'take']) if (own[k] != null) keep[k] = own[k];
      try {
        await saveMap({ ...map, [s.name]: { ...keep, ...pick } }, `${m.title} now voices ${s.name}`);
        await reload();
      } catch (err) { say(err.message, true); }
    } }, isCurrent ? 'Assigned' : 'Assign');
    const fallback = h('button', { class: 'vx-btn vx-btn--small', type: 'button', onclick: async () => {
      try { await saveMap({ ...map, _default: pick }, `${m.title} is the fallback voice`); await reload(); } catch (err) { say(err.message, true); }
    } }, 'Use as fallback');
    return h('div', { class: `vx-result${isCurrent ? ' is-current' : ''}` },
      m.cover ? h('img', { src: m.cover, alt: '', class: 'vx-cover', loading: 'lazy', referrerpolicy: 'no-referrer', onerror: hideBroken }) : h('span', { class: 'vx-cover vx-cover--none' }),
      h('div', { class: 'vx-result-text' },
        h('strong', {}, m.title),
        h('span', { class: 'vx-muted' }, [m.languages?.join(', '), m.author ? `by ${m.author}` : null, m.uses ? `${m.uses.toLocaleString()} uses` : null].filter(Boolean).join(' · ')),
        m.description ? h('span', { class: 'vx-desc' }, m.description) : null),
      h('div', { class: 'vx-result-actions' }, sampleBtn, previewBtn, assign, fallback));
  }

  async function loadLines(s, list) {
    try {
      const r = await req(`/lines?voice=${encodeURIComponent(s.name)}`);
      list.replaceChildren(...r.lines.map((ln) => {
        const btn = h('button', { class: 'vx-btn vx-btn--small', type: 'button', disabled: !voiceOf(s.name), onclick: () => play(btn, () => req('/preview', { method: 'POST', raw: true, body: { voice: s.name, id: ln.id } })) }, 'Preview');
        // "Play in game" fetches the public URL: generates and stores the real line, exactly as a player would
        const real = h('button', { class: 'vx-btn vx-btn--small', type: 'button', disabled: !voiceOf(s.name), title: 'Generate (if needed), store and play the line players will hear', onclick: () => play(real, async () => {
          const res = await fetch(`./api/voice/${ln.id}?v=${map._version || 0}`);
          if (!res.ok) { let m = `HTTP ${res.status}`; try { m = (await res.json()).error || m; } catch { /* audio */ } throw new Error(m); }
          const blob = await res.blob();
          state.textContent = 'cached';
          state.className = 'vx-state is-cached';
          return blob;
        }) }, 'Store & play');
        const state = h('span', { class: `vx-state is-${ln.state}` }, ln.state);
        return h('li', { class: 'vx-line' },
          h('div', { class: 'vx-line-text' },
            h('span', { class: 'vx-line-spoken', lang: ln.lang === 'en' ? 'en' : null }, ln.text),
            ln.text !== ln.en ? h('span', { class: 'vx-line-en' }, ln.en) : null,
            ln.tts ? h('span', { class: 'vx-line-tts', title: 'Text sent to the voice (src/data/voice-overrides.js)' }, `Voice reads: ${ln.tts}`) : null,
            h('span', { class: 'vx-muted vx-line-meta' }, `${LANG_LABEL[ln.lang] || ln.lang} · ${ln.where.join(', ')}${ln.speaker !== s.name ? ` · captioned "${ln.speaker}"` : ''} · ${ln.id}`)),
          h('div', { class: 'vx-line-actions' }, state, btn, real));
      }));
    } catch (err) {
      list.replaceChildren(h('li', { class: 'vx-error' }, `Could not load lines: ${err.message}`));
    }
  }

  async function generate(name, btn) {
    const label = btn.textContent;
    btn.disabled = true;
    try {
      // one batch per call; keep going while lines remain and each round makes progress
      for (let round = 0; round < 40 && !destroyed; round++) {
        const r = await req('/generate', { method: 'POST', body: name ? { voice: name } : {} });
        if (r.busy) { btn.textContent = 'Busy, waiting…'; await sleep(4000); continue; }
        const job = r.job;
        if (!job.queued) { say(name ? `${name}: every line is stored` : 'Every voiced line is stored'); break; }
        btn.textContent = `Generating ${job.queued} of ${job.missing}…`;
        let status = job;
        for (let i = 0; i < 40 && status.running && !destroyed; i++) {
          await sleep(1500);
          status = (await req('/job')).job || status;
          if (status.running) btn.textContent = `Generating… ${status.done + status.failed} of ${job.missing}`;
        }
        if (status.failed) {
          say(`${status.failed} line${status.failed === 1 ? '' : 's'} failed: ${status.errors?.[0] || 'see the Functions log'}`, true);
          break;
        }
        if (!r.remaining) { say(`${status.done} line${status.done === 1 ? '' : 's'} generated`); break; }
      }
    } catch (err) {
      say(err.message, true);
    } finally {
      btn.disabled = false;
      btn.textContent = label;
      refreshCache();
    }
  }
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  function render() {
    if (destroyed || !info) return;
    const keepScroll = window.scrollY;
    root.replaceChildren(
      header(),
      settingsRow(),
      h('section', { class: 'vx-list' }, ...info.speakers.map(speakerCard)));
    window.scrollTo(0, keepScroll);
  }

  async function reload() {
    info = await req('');
    map = info.map || {};
    render();
    refreshCache();
  }

  root.append(h('p', { class: 'vx-muted' }, 'Loading voices…'));
  reload().catch((err) => {
    root.replaceChildren(h('div', { class: 'vx-empty' },
      h('h2', { class: 'vx-title' }, 'Voices'),
      h('p', { class: 'vx-error' }, `Voices are not available: ${err.message}`),
      h('p', { class: 'vx-muted' }, 'Bind a KV namespace as VOICE and set the FISH_API_KEY secret in the Pages project, then redeploy. See README, "Voices".')));
  });

  return {
    destroy() {
      destroyed = true;
      stopPlaying();
      el.replaceChildren();
    },
  };
}

export default mountVoices;
