// Shared helpers for the admin dashboard: the DOM helper, number / time formatting, case and level
// names from the case files, and small building blocks (KPI tiles, bar cells, tables, CSV).
import { CASES, CASE_ORDER, caseLabel } from '../data/cases.js';

export const DAY = 86_400_000;

// ---------- tiny DOM helper (text is always set as text) ----------
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, v);
  }
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

// ---------- formatting ----------
const nf = new Intl.NumberFormat();
export const fmtN = (n) => nf.format(Math.round(Number(n) || 0));
export const fmt1 = (n) => (n == null || !Number.isFinite(Number(n)) ? '–' : (Math.round(Number(n) * 10) / 10).toFixed(1));
export const pct = (a, b) => (b ? `${Math.round((a / b) * 100)}%` : '–');
export function fmtDuration(sec) {
  if (sec == null || !Number.isFinite(Number(sec))) return '–';
  const s = Math.max(0, Math.round(Number(sec)));
  if (s < 3600) return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  return `${Math.floor(s / 3600)}h ${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}m`;
}
/** Long durations in words: "3 h 20 min", "2 d 4 h". */
export function fmtSpan(ms) {
  if (ms == null || !Number.isFinite(Number(ms))) return '–';
  const m = Math.round(Number(ms) / 60000);
  if (m < 60) return `${m} min`;
  if (m < 60 * 24) return `${Math.floor(m / 60)} h ${m % 60 ? `${m % 60} min` : ''}`.trim();
  const d = Math.floor(m / 1440);
  const hr = Math.round((m % 1440) / 60);
  return `${d} d${hr ? ` ${hr} h` : ''}`;
}
export const fmtMs = (ms) => (ms == null || !Number.isFinite(Number(ms)) ? '–' : Number(ms) >= 10000 ? `${(Number(ms) / 1000).toFixed(1)} s` : `${fmtN(ms)} ms`);
export const dateTime = (ts) => (ts ? new Date(ts).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '–');
export const shortTime = (ts) => (ts ? new Date(ts).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '–');
export function ago(ts) {
  if (!ts) return '–';
  const s = Math.max(0, (Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)} d ago`;
  return new Date(ts).toLocaleDateString();
}
export const tzMinutes = () => -new Date().getTimezoneOffset();

/** The last `n` local days ending today (in the server's tz), each { iso, label, short }. */
export function lastDays(generatedAt, tz, n = 30) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const iso = new Date(generatedAt + tz * 60_000 - i * DAY).toISOString().slice(0, 10);
    const dt = new Date(`${iso}T12:00:00Z`);
    out.push({
      iso,
      label: dt.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }),
      short: dt.toLocaleDateString(undefined, { day: 'numeric', month: 'short', timeZone: 'UTC' }),
    });
  }
  return out;
}

// ---------- case helpers ----------
export { CASES, CASE_ORDER };
export const cname = (id) => (CASES[id] ? caseLabel(CASES[id]) : id || '–');
export const caseTitle = (id) => (CASES[id] ? `${caseLabel(CASES[id])}: ${CASES[id].title}` : id || '–');
export const isBranch = (l) => typeof l.when === 'function';
export const baseLevels = (c) => c.levels.filter((l) => !isBranch(l));
export function levelName(caseId, levelId) {
  const c = CASES[caseId];
  const i = c ? c.levels.findIndex((l) => l.id === levelId) : -1;
  return i >= 0 ? `${i + 1}. ${c.levels[i].title}` : levelId || '';
}
export const levelOf = (caseId, levelId) => CASES[caseId]?.levels.find((l) => l.id === levelId) || null;
/** Every case id the dashboard knows, in play order, then any extra ids seen in the data. */
export function caseIds(seen = []) {
  const known = CASE_ORDER.filter((id) => CASES[id]);
  return [...known, ...[...new Set(seen)].filter((id) => id && !known.includes(id))];
}
export function stageLabel(s) {
  if (!s.case_id) return 'Not started a case';
  const c = CASES[s.case_id];
  const cl = cname(s.case_id);
  if (s.closed || s.case_closed) return `${cl}: case closed`;
  if (!c) return `${cl}: ${s.levels_solved} solved`;
  const lv = baseLevels(c);
  const n = s.levels_solved || 0;
  if (n >= lv.length) return `${cl}: deduction room`;
  return `${cl} · ${n + 1}. ${lv[n].title}`;
}
export const suspectName = (caseId, id) => CASES[caseId]?.suspects.find((s) => s.id === id)?.name || id;
export function verdictText(caseId, charged = [], answers = {}) {
  const c = CASES[caseId];
  const names = charged.map((id) => suspectName(caseId, id));
  const qs = c?.deduction?.questions || [];
  const extra = qs.map((q) => {
    const o = q.options.find((x) => x.id === answers[q.id]);
    return o ? `${q.short || q.q} ${o.label}` : null;
  }).filter(Boolean);
  const other = Object.entries(answers).filter(([k]) => !qs.some((q) => q.id === k)).map(([k, v]) => `${k}: ${v}`);
  return { who: names.length ? names.join(' + ') : 'Nobody', extra: [...extra, ...other].join(' · ') };
}

// ---------- building blocks ----------
export const okPill = (ok) => h('span', { class: `pill ${ok ? 'pill--good' : 'pill--bad'}` }, ok ? '✓ Correct' : '✗ Wrong');
export const pill = (text, kind = 'plain', title) => h('span', { class: `pill pill--${kind}`, title }, text);

export function kpi(label, value, note, opts = {}) {
  return h('div', { class: `kpi${opts.accent ? ' kpi--accent' : ''}${opts.live ? ' kpi--live' : ''}` },
    h('div', { class: 'kpi-label' }, opts.live ? h('i', { class: 'live-dot', 'aria-hidden': 'true' }) : null, label),
    h('div', { class: 'kpi-value' }, value),
    note ? h('div', { class: 'kpi-note' }, note) : null);
}

export function barCell(n, max, text, cls) {
  return h('div', { class: `bar-cell${cls ? ` ${cls}` : ''}` },
    h('span', {}, text ?? fmtN(n)),
    h('div', { class: 'bar', 'aria-hidden': 'true' }, h('i', { style: { width: `${max ? Math.max(0, Math.min(100, Math.round((n / max) * 100))) : 0}%` } })));
}

/**
 * A table inside a horizontally scrolling wrapper. cols: [{ label, cls, sr }] (sr: visually hidden header).
 * rows: <tr> elements. caption: text for screen readers (the card heading is the visible title).
 */
export function table(caption, cols, rows, opts = {}) {
  return h('div', { class: 'tbl-wrap', tabindex: opts.focusable === false ? null : 0, role: 'region', 'aria-label': caption },
    h('table', { class: `tbl${opts.cls ? ` ${opts.cls}` : ''}` },
      h('caption', { class: 'sr-only' }, caption),
      h('thead', {}, h('tr', {}, cols.map((c) => h('th', { scope: 'col', class: c.cls || null, title: c.title || null }, c.sr ? h('span', { class: 'sr-only' }, c.label) : c.label)))),
      h('tbody', {}, rows)));
}

export const empty = (text) => h('p', { class: 'chart-empty' }, text);
export const loading = (text = 'Loading…') => h('p', { class: 'loading', role: 'status' }, text);

/** A heading row for a section. */
export const sectionHead = (title, note, ...extra) => h('div', { class: 'adm-h' }, h('h2', {}, title), note ? h('p', {}, note) : null, ...extra);

/** A small labelled <select>. options: [[value, label]]. */
export function select(label, options, value, onChange, opts = {}) {
  const s = h('select', { class: 'a-input a-select', 'aria-label': label },
    options.map(([v, l]) => h('option', { value: v, selected: String(v) === String(value) }, l)));
  s.addEventListener('change', () => onChange(s.value));
  if (opts.visibleLabel) return h('label', { class: 'a-field' }, h('span', {}, label), s);
  return s;
}

// ---------- CSV ----------
const csvCell = (v) => {
  if (v == null) return '';
  let s = String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // never a formula when opened in a spreadsheet
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
export function downloadCsv(filename, header, rows) {
  const text = [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([`﻿${text}`], { type: 'text/csv;charset=utf-8' }));
  const a = h('a', { href: url, download: filename });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** The median of an array of numbers (null when empty). */
export function median(xs) {
  const a = xs.filter((x) => Number.isFinite(x)).sort((x, y) => x - y);
  if (!a.length) return null;
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
}
