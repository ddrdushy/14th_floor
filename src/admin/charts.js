// Tiny SVG charts for the admin dashboard: a single-series line chart with a crosshair tooltip, a
// horizontal bar chart with per-bar tooltips (rows can be flagged), and a stacked or grouped column
// chart over days with a legend and a per-column tooltip. Colours come from CSS custom properties (admin.css), so
// light and dark themes need no redraw. Both redraw on resize and return { destroy }.
const NS = 'http://www.w3.org/2000/svg';

function el(tag, attrs = {}, text) {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) n.setAttribute(k, v);
  if (text != null) n.textContent = text;
  return n;
}

/** Round numbers for an axis from 0 to at least `max`. */
export function niceTicks(max, count = 4) {
  if (!(max > 0)) return [0, 1];
  const raw = max / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) || raw;
  const st = step < 1 ? 1 : step;
  const ticks = [];
  for (let v = 0; v <= max + st * 0.001; v += st) ticks.push(Math.round(v));
  if (ticks[ticks.length - 1] < max) ticks.push(ticks[ticks.length - 1] + st);
  return ticks;
}

function tooltip(wrap) {
  const tip = document.createElement('div');
  tip.className = 'chart-tip';
  tip.hidden = true;
  wrap.append(tip);
  return {
    show(x, y, value, label, lines) {
      tip.replaceChildren();
      const v = document.createElement('strong');
      v.textContent = value;
      const l = document.createElement('span');
      l.textContent = label;
      tip.append(v, l);
      for (const ln of lines || []) {
        const row = document.createElement('span');
        row.className = 'tip-line';
        const sw = document.createElement('i');
        sw.className = `tip-sw ${ln.cls || ''}`;
        row.append(sw, document.createTextNode(ln.text));
        tip.append(row);
      }
      tip.hidden = false;
      const w = wrap.clientWidth;
      const tw = tip.offsetWidth;
      tip.style.left = `${Math.min(Math.max(4, x - tw / 2), w - tw - 4)}px`;
      tip.style.top = `${Math.max(0, y - tip.offsetHeight - 10)}px`;
    },
    hide() { tip.hidden = true; },
  };
}

function observe(wrap, draw) {
  let w = 0;
  const ro = new ResizeObserver(() => {
    const nw = Math.round(wrap.clientWidth);
    if (nw && nw !== w) { w = nw; draw(nw); }
  });
  ro.observe(wrap);
  return { destroy: () => ro.disconnect() };
}

/**
 * Line chart. points: [{ label, value, short }] in x order. opts: { height, title, valueLabel(v) }.
 */
export function lineChart(wrap, points, opts = {}) {
  const height = opts.height || 220;
  const fmt = opts.valueLabel || ((v) => String(v));
  wrap.classList.add('chart');
  const tip = tooltip(wrap);
  return observe(wrap, (width) => {
    wrap.querySelector('svg')?.remove();
    const m = { t: 14, r: 14, b: 28, l: 34 };
    const iw = Math.max(10, width - m.l - m.r);
    const ih = height - m.t - m.b;
    const max = Math.max(1, ...points.map((p) => p.value));
    const ticks = niceTicks(max);
    const top = ticks[ticks.length - 1];
    const x = (i) => m.l + (points.length < 2 ? iw / 2 : (i / (points.length - 1)) * iw);
    const y = (v) => m.t + ih - (v / top) * ih;
    const svg = el('svg', { width, height, viewBox: `0 0 ${width} ${height}`, role: 'img', 'aria-label': opts.title || 'Line chart' });
    if (opts.title) svg.append(el('title', {}, opts.title));
    const grid = el('g', { class: 'c-grid' });
    for (const t of ticks) {
      grid.append(el('line', { x1: m.l, x2: m.l + iw, y1: y(t), y2: y(t), class: t === 0 ? 'c-base' : '' }));
      grid.append(el('text', { x: m.l - 6, y: y(t) + 4, 'text-anchor': 'end', class: 'c-tick' }, String(t)));
    }
    svg.append(grid);
    // x labels: about one every 70px
    const every = Math.max(1, Math.ceil(points.length / Math.max(2, Math.floor(iw / 70))));
    points.forEach((p, i) => {
      if (i % every && i !== points.length - 1) return;
      if (i !== points.length - 1 && x(points.length - 1) - x(i) < 64) return;
      svg.append(el('text', { x: x(i), y: height - 8, 'text-anchor': i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle', class: 'c-tick' }, p.short || p.label));
    });
    const d = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join('');
    svg.append(el('path', { d, class: 'c-line' }));
    const last = points[points.length - 1];
    if (last) svg.append(el('circle', { cx: x(points.length - 1), cy: y(last.value), r: 4, class: 'c-dot' }));
    // crosshair
    const hair = el('line', { y1: m.t, y2: m.t + ih, class: 'c-hair', visibility: 'hidden' });
    const dot = el('circle', { r: 5, class: 'c-dot c-dot--hover', visibility: 'hidden' });
    svg.append(hair, dot);
    const hit = el('rect', { x: m.l - 10, y: 0, width: iw + 20, height, fill: 'transparent', tabindex: 0, 'aria-label': `${opts.title || 'Chart'}: use arrow keys to read values` });
    svg.append(hit);
    let cur = points.length - 1;
    const showAt = (i) => {
      cur = Math.max(0, Math.min(points.length - 1, i));
      const p = points[cur];
      if (!p) return;
      hair.setAttribute('x1', x(cur)); hair.setAttribute('x2', x(cur));
      dot.setAttribute('cx', x(cur)); dot.setAttribute('cy', y(p.value));
      hair.setAttribute('visibility', 'visible'); dot.setAttribute('visibility', 'visible');
      tip.show(x(cur), y(p.value), fmt(p.value), p.label);
    };
    const hide = () => { hair.setAttribute('visibility', 'hidden'); dot.setAttribute('visibility', 'hidden'); tip.hide(); };
    hit.addEventListener('pointermove', (e) => {
      const r = svg.getBoundingClientRect();
      const px = e.clientX - r.left;
      showAt(points.length < 2 ? 0 : Math.round(((px - m.l) / iw) * (points.length - 1)));
    });
    hit.addEventListener('pointerleave', hide);
    hit.addEventListener('focus', () => showAt(cur));
    hit.addEventListener('blur', hide);
    hit.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); showAt(cur - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); showAt(cur + 1); }
    });
    wrap.prepend(svg);
  });
}

/**
 * Horizontal bars, one per row: [{ label, value, note }]. Value labels sit at the bar ends.
 * opts: { title, barHeight, labelWidth, valueLabel(v), onSelect(row) }
 */
export function barChart(wrap, rows, opts = {}) {
  const bh = opts.barHeight || 22;
  const gap = 8;
  const fmt = opts.valueLabel || ((v) => String(v));
  wrap.classList.add('chart');
  const tip = tooltip(wrap);
  return observe(wrap, (width) => {
    wrap.querySelector('svg')?.remove();
    const lw = Math.min(opts.labelWidth || 240, Math.round(width * 0.46));
    const m = { t: 4, r: 44, b: 4, l: lw + 10 };
    const iw = Math.max(10, width - m.l - m.r);
    const height = m.t + m.b + rows.length * (bh + gap) - gap;
    const max = Math.max(1, ...rows.map((r) => r.value));
    const svg = el('svg', { width, height, viewBox: `0 0 ${width} ${height}`, role: 'img', 'aria-label': opts.title || 'Bar chart' });
    if (opts.title) svg.append(el('title', {}, opts.title));
    svg.append(el('line', { x1: m.l, x2: m.l, y1: 0, y2: height, class: 'c-base' }));
    rows.forEach((r, i) => {
      const y0 = m.t + i * (bh + gap);
      const w = r.value > 0 ? Math.max(3, (r.value / max) * iw) : 0;
      const g = el('g', { class: `c-bar-row${r.hot ? ' is-flag' : ''}`, tabindex: 0, role: 'listitem', 'aria-label': `${r.label}: ${fmt(r.value)}${r.note ? ` (${r.note})` : ''}` });
      const label = el('text', { x: m.l - 8, y: y0 + bh / 2 + 4, 'text-anchor': 'end', class: 'c-label' }, r.label);
      g.append(label);
      // a bar with a rounded data end, square against the baseline
      const rr = Math.min(4, w / 2, bh / 2);
      if (w > 0) {
        g.append(el('path', { class: 'c-bar', d: `M${m.l},${y0}h${w - rr}a${rr},${rr} 0 0 1 ${rr},${rr}v${bh - 2 * rr}a${rr},${rr} 0 0 1 -${rr},${rr}h-${w - rr}z` }));
      }
      g.append(el('text', { x: m.l + w + 6, y: y0 + bh / 2 + 4, class: 'c-value' }, fmt(r.value)));
      g.append(el('rect', { x: 0, y: y0 - gap / 2, width, height: bh + gap, fill: 'transparent' }));
      const show = () => { g.classList.add('is-hot'); tip.show(m.l + w, y0, fmt(r.value), r.note || r.label); };
      const hide = () => { g.classList.remove('is-hot'); tip.hide(); };
      g.addEventListener('pointerenter', show);
      g.addEventListener('pointerleave', hide);
      g.addEventListener('focus', show);
      g.addEventListener('blur', hide);
      if (opts.onSelect) g.addEventListener('click', () => opts.onSelect(r));
      svg.append(g);
      // shorten labels that do not fit
      requestAnimationFrame(() => {
        try {
          let txt = r.label;
          while (txt.length > 4 && label.getComputedTextLength() > lw) {
            txt = txt.slice(0, -2);
            label.textContent = `${txt}…`;
          }
          if (txt !== r.label) label.append(el('title', {}, r.label));
        } catch { /* not rendered yet */ }
      });
    });
    svg.setAttribute('role', 'list');
    svg.setAttribute('aria-label', opts.title || 'Bar chart');
    wrap.prepend(svg);
  });
}

/**
 * Columns over an ordered x axis (days), one or more series. labels: [{ label, short }];
 * series: [{ name, values: [n per label], cls: 'c-s1' … }]. opts: { mode: 'stack' | 'group', height,
 * title, valueLabel(v), legend: true }. Each column gets a tooltip with the per-series breakdown;
 * arrow keys walk the columns. Colours come from the .c-s<n> classes (CSS custom properties).
 */
export function columnChart(wrap, labels, series, opts = {}) {
  const height = opts.height || 220;
  const fmt = opts.valueLabel || ((v) => String(v));
  const mode = opts.mode || 'stack';
  wrap.classList.add('chart');
  if (opts.legend !== false && series.length > 1) {
    const lg = document.createElement('ul');
    lg.className = 'c-legend';
    for (const s of series) {
      const li = document.createElement('li');
      const sw = document.createElement('i');
      sw.className = `tip-sw ${s.cls}`;
      const total = s.values.reduce((a, b) => a + b, 0);
      li.append(sw, document.createTextNode(`${s.name} `));
      const b = document.createElement('b');
      b.textContent = fmt(total);
      li.append(b);
      lg.append(li);
    }
    wrap.append(lg);
  }
  const box = document.createElement('div');
  box.className = 'c-box';
  wrap.append(box);
  const tip = tooltip(box);
  const totals = labels.map((_, i) => series.reduce((a, s) => a + (s.values[i] || 0), 0));
  return observe(box, (width) => {
    box.querySelector('svg')?.remove();
    const m = { t: 10, r: 8, b: 28, l: 34 };
    const iw = Math.max(10, width - m.l - m.r);
    const ih = height - m.t - m.b;
    const max = Math.max(1, ...(mode === 'stack' ? totals : series.flatMap((s) => s.values)));
    const ticks = niceTicks(max);
    const top = ticks[ticks.length - 1];
    const n = Math.max(1, labels.length);
    const slot = iw / n;
    const cw = Math.max(2, Math.min(28, slot * (mode === 'group' ? 0.8 : 0.66)));
    const y = (v) => m.t + ih - (v / top) * ih;
    const svg = el('svg', { width, height, viewBox: `0 0 ${width} ${height}`, role: 'img', 'aria-label': opts.title || 'Column chart' });
    if (opts.title) svg.append(el('title', {}, opts.title));
    const grid = el('g', { class: 'c-grid' });
    for (const t of ticks) {
      grid.append(el('line', { x1: m.l, x2: m.l + iw, y1: y(t), y2: y(t), class: t === 0 ? 'c-base' : '' }));
      grid.append(el('text', { x: m.l - 6, y: y(t) + 4, 'text-anchor': 'end', class: 'c-tick' }, String(t)));
    }
    svg.append(grid);
    const cx = (i) => m.l + slot * i + slot / 2;
    const every = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(iw / 64))));
    labels.forEach((p, i) => {
      if (i % every && i !== n - 1) return;
      if (i !== n - 1 && cx(n - 1) - cx(i) < 56) return;
      svg.append(el('text', { x: cx(i), y: height - 8, 'text-anchor': i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle', class: 'c-tick' }, p.short || p.label));
    });
    // a column segment with a rounded data end (top) when it is the topmost one
    const seg = (x, y0, w, hgt, round, cls) => {
      if (hgt <= 0) return;
      const r = round ? Math.min(3, w / 2, hgt) : 0;
      svg.append(el('path', { class: `c-col ${cls}`, d: `M${x},${y0}v${-(hgt - r)}${r ? `a${r},${r} 0 0 1 ${r},${-r}h${w - 2 * r}a${r},${r} 0 0 1 ${r},${r}` : `h${w}`}v${hgt - r}z` }));
    };
    const cols = el('g', {});
    svg.append(cols);
    labels.forEach((_, i) => {
      if (mode === 'stack') {
        let base = y(0);
        const parts = series.map((s) => s.values[i] || 0);
        const last = parts.reduce((a, v, k) => (v > 0 ? k : a), -1);
        parts.forEach((v, k) => {
          if (!v) return;
          const hh = (v / top) * ih;
          const gap = k === last ? 0 : Math.min(2, hh / 2); // 2px surface gap between stacked segments
          seg(cx(i) - cw / 2, base, cw, hh - gap, k === last, series[k].cls);
          base -= hh;
        });
      } else {
        const bw = Math.max(1, (cw - 2 * (series.length - 1)) / series.length);
        series.forEach((s, k) => {
          const v = s.values[i] || 0;
          seg(cx(i) - cw / 2 + k * (bw + 2), y(0), bw, (v / top) * ih, true, s.cls);
        });
      }
    });
    const hl = el('rect', { class: 'c-colhl', y: m.t, height: ih, width: slot, visibility: 'hidden' });
    svg.insertBefore(hl, cols);
    const hit = el('rect', { x: m.l, y: 0, width: iw, height, fill: 'transparent', tabindex: 0, 'aria-label': `${opts.title || 'Chart'}: use arrow keys to read values` });
    svg.append(hit);
    let cur = n - 1;
    const showAt = (i) => {
      cur = Math.max(0, Math.min(n - 1, i));
      hl.setAttribute('x', m.l + slot * cur);
      hl.setAttribute('visibility', 'visible');
      const lines = series.length > 1 ? series.map((s) => ({ cls: s.cls, text: `${s.name}: ${fmt(s.values[cur] || 0)}` })) : null;
      const value = mode === 'stack' ? fmt(totals[cur]) : series.length === 1 ? fmt(series[0].values[cur] || 0) : '';
      tip.show(cx(cur), y(mode === 'stack' ? totals[cur] : Math.max(...series.map((s) => s.values[cur] || 0))), value || labels[cur].label, value ? labels[cur].label : '', lines);
    };
    const hide = () => { hl.setAttribute('visibility', 'hidden'); tip.hide(); };
    hit.addEventListener('pointermove', (e) => {
      const r = svg.getBoundingClientRect();
      showAt(Math.floor((e.clientX - r.left - m.l) / slot));
    });
    hit.addEventListener('pointerleave', hide);
    hit.addEventListener('focus', () => showAt(cur));
    hit.addEventListener('blur', hide);
    hit.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); showAt(cur - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); showAt(cur + 1); }
    });
    box.prepend(svg);
  });
}
