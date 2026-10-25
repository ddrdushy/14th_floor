// Save game: profile, case progress, hidden story flags. Stored in localStorage.

const KEY = 'floor14.save.v1';

export const RANKS = [
  { name: 'Rookie PI', at: 0 },
  { name: 'Licensed PI', at: 5 },
  { name: 'Senior Investigator', at: 15 },
  { name: 'Chief Investigator', at: 40 },
  { name: 'Legend', at: 100 },
];

function fresh() {
  return {
    version: 1,
    profile: null,
    seenIntro: false,
    solvedTotal: 0,
    cases: {},
    flags: {},
    settings: { sound: true, music: true, musicVolume: 0.6, sfxVolume: 0.8 },
    // tutorials: game ids whose "How to play" card was dismissed, and the once-only case explainer
    seenHowTo: {},
    seenLoop: false,
  };
}

// Profile fields added after the first release. Older saves get these defaults when they load, so a
// profile always has every field. Labels for the ids are in core/avatar.js.
export const PROFILE_DEFAULTS = {
  hometown: 'kl',
  languages: ['ms', 'en'],
  unit: 'd9', // the CID unit you resigned from (canon: D9)
  specialty: 'interrogation', // flavour only, never changes puzzles or hints
  ride: 'saga',
  item: 'lighter', // Daniel's silver lighter
  callsign: '',
};

/** A profile with any missing newer fields filled in (null stays null). */
export function withProfileDefaults(profile) {
  if (!profile) return profile;
  const out = { ...PROFILE_DEFAULTS, ...profile };
  if (!Array.isArray(out.languages) || !out.languages.length) out.languages = [...PROFILE_DEFAULTS.languages];
  if (typeof out.callsign !== 'string') out.callsign = '';
  return out;
}

let data = load();
const listeners = new Set();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fresh();
    const parsed = JSON.parse(raw);
    const out = { ...fresh(), ...parsed, settings: { ...fresh().settings, ...(parsed.settings || {}) } };
    out.profile = withProfileDefaults(out.profile);
    if (!out.seenHowTo || typeof out.seenHowTo !== 'object' || Array.isArray(out.seenHowTo)) out.seenHowTo = {};
    out.seenLoop = out.seenLoop === true;
    return out;
  } catch {
    return fresh();
  }
}

export function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* storage unavailable: progress lives for this session only */
  }
  listeners.forEach((fn) => fn(data));
}

export const state = () => data;
export const onChange = (fn) => (listeners.add(fn), () => listeners.delete(fn));

/** Replace the whole save (a cloud save loaded on this device). Keeps this device's own settings. */
export function replaceSave(next) {
  const keep = data.settings;
  const out = { ...fresh(), ...next, settings: { ...fresh().settings, ...(next.settings || {}), ...keep } };
  out.profile = withProfileDefaults(out.profile);
  if (!out.seenHowTo || typeof out.seenHowTo !== 'object' || Array.isArray(out.seenHowTo)) out.seenHowTo = {};
  data = out;
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* session only */ }
}

export function resetAll() {
  data = fresh();
  save();
}

export function setProfile(profile) {
  data.profile = withProfileDefaults(profile);
  save();
}

export function caseState(caseId) {
  if (!data.cases[caseId]) {
    data.cases[caseId] = {
      status: 'active',
      solved: {},
      inprogress: {},
      evidence: [],
      hints: 5,
      accusation: null,
      reopened: 0,
      board: { positions: {}, links: [], marks: {} },
      // persons of interest the player has pinned to the board (see suspectBoard in data/cases.js)
      pinnedSuspects: [],
      openedAt: Date.now(),
    };
  }
  return data.cases[caseId];
}

export function rank() {
  const n = data.solvedTotal;
  let current = RANKS[0];
  let next = null;
  for (let i = 0; i < RANKS.length; i++) {
    if (n >= RANKS[i].at) {
      current = RANKS[i];
      next = RANKS[i + 1] || null;
    }
  }
  const pct = next ? (n - current.at) / (next.at - current.at) : 1;
  return { ...current, next, pct };
}

export function setFlag(name, value = true) {
  if (value) data.flags[name] = true;
  else delete data.flags[name];
}

export const hasFlag = (name) => !!data.flags[name];
