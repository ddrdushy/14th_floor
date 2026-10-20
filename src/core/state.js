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
  };
}

let data = load();
const listeners = new Set();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fresh();
    const parsed = JSON.parse(raw);
    return { ...fresh(), ...parsed, settings: { ...fresh().settings, ...(parsed.settings || {}) } };
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

export function resetAll() {
  data = fresh();
  save();
}

export function setProfile(profile) {
  data.profile = profile;
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
