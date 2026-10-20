// Small drawing helpers for the "How to play" worked examples (see core/howto.js).
// Every helper returns an SVG/HTML string, so an example is one cheap innerHTML write.
// Colours match the paper game sheets: ink on cream, thread red for "do this", amber for highlights.

export const C = {
  ink: '#1d1a16',
  soft: '#4a443b',
  paper: '#fbf7ec',
  cream: '#efe6d0',
  line: '#c4bba5',
  red: '#b3202a',
  amber: '#e8a33d',
  yellow: '#f2c230',
  green: '#3f7d5a',
  blue: '#2a4a8a',
  mist: '#9fb3bf',
};

const UI = "font-family=\"Archivo, system-ui, sans-serif\"";
const DISPLAY = "font-family=\"'Big Shoulders Display', 'Arial Narrow', sans-serif\"";
const DOC = "font-family=\"'Special Elite', 'Courier New', monospace\"";
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** A complete <svg> with a viewBox. `label` is read out by screen readers. */
export function svg(w, h, body, label = '') {
  return `<svg class="ht-ex-svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" ${label ? `role="img" aria-label="${esc(label)}"` : 'aria-hidden="true"'} xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
}

/** Text. opts: size, weight, fill, anchor ('middle' default), font ('ui' | 'display' | 'doc'). */
export function text(x, y, s, { size = 14, weight = 400, fill = C.ink, anchor = 'middle', font = 'ui' } = {}) {
  const f = font === 'display' ? DISPLAY : font === 'doc' ? DOC : UI;
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" font-weight="${weight}" fill="${fill}" ${f}>${esc(s)}</text>`;
}

export function rect(x, y, w, h, { fill = C.paper, stroke = C.ink, sw = 1.5, rx = 0, dash = '', opacity = 1 } = {}) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${dash ? ` stroke-dasharray="${dash}"` : ''}${opacity < 1 ? ` opacity="${opacity}"` : ''}/>`;
}

/** A red highlight ring. */
export function ring(cx, cy, r, { color = C.red, sw = 3.5 } = {}) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${sw}"/>`;
}

/** A "tap here" mark: a filled dot with a ripple. */
export function tap(cx, cy, { color = C.red } = {}) {
  return `<circle cx="${cx}" cy="${cy}" r="13" fill="${color}" opacity=".18"/><circle cx="${cx}" cy="${cy}" r="7" fill="${color}" opacity=".35"/><circle cx="${cx}" cy="${cy}" r="3.5" fill="${color}"/>`;
}

/** An arrow from (x1,y1) to (x2,y2). `bend` curves it (positive bends to the left of travel). */
export function arrow(x1, y1, x2, y2, { color = C.red, sw = 3, bend = 0, head = 9 } = {}) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const cx = mx - (dy / len) * bend, cy = my + (dx / len) * bend;
  // direction at the tip, from the control point
  const tx = x2 - cx, ty = y2 - cy;
  const tl = Math.hypot(tx, ty) || 1;
  const ux = tx / tl, uy = ty / tl;
  const bx = x2 - ux * head, by = y2 - uy * head;
  const px = -uy * head * 0.55, py = ux * head * 0.55;
  const d = bend ? `M${x1} ${y1} Q${cx} ${cy} ${bx} ${by}` : `M${x1} ${y1} L${bx} ${by}`;
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/><path d="M${x2} ${y2} L${bx + px} ${by + py} L${bx - px} ${by - py}Z" fill="${color}"/>`;
}

/**
 * A grid of squares. get(r, c) -> { t, fill, color, bold, size } or null for a plain empty square.
 * Returns the SVG string. Squares are `s` units wide.
 */
export function grid(x, y, rows, cols, s, get = () => null, { stroke = C.ink, sw = 1.2, outer = 2.5 } = {}) {
  let out = '';
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const g = get(r, c) || {};
    const X = x + c * s, Y = y + r * s;
    out += `<rect x="${X}" y="${Y}" width="${s}" height="${s}" fill="${g.fill || C.paper}" stroke="${stroke}" stroke-width="${sw}"/>`;
    if (g.t != null && g.t !== '') out += text(X + s / 2, Y + s / 2 + (g.size || s * 0.5) * 0.36, g.t, { size: g.size || s * 0.5, weight: g.bold ? 800 : 600, fill: g.color || C.ink, font: g.font || 'display' });
  }
  if (outer) out += `<rect x="${x}" y="${y}" width="${cols * s}" height="${rows * s}" fill="none" stroke="${stroke}" stroke-width="${outer}"/>`;
  return out;
}

/** A rounded label chip, like a button in the game. */
export function chip(x, y, w, h, label, { fill = C.paper, stroke = C.soft, color = C.ink, size = 13, weight = 600, rx = 6 } = {}) {
  return rect(x, y, w, h, { fill, stroke, sw: 1.4, rx }) + text(x + w / 2, y + h / 2 + size * 0.36, label, { size, weight, fill: color });
}

/** A small tick or cross badge. */
export function badge(cx, cy, ok = true, r = 10) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${ok ? C.green : C.red}"/>` +
    (ok
      ? `<path d="M${cx - r * 0.45} ${cy} l${r * 0.32} ${r * 0.36} l${r * 0.6} -${r * 0.72}" fill="none" stroke="#fff" stroke-width="${r * 0.26}" stroke-linecap="round" stroke-linejoin="round"/>`
      : `<path d="M${cx - r * 0.4} ${cy - r * 0.4} l${r * 0.8} ${r * 0.8} M${cx + r * 0.4} ${cy - r * 0.4} l-${r * 0.8} ${r * 0.8}" stroke="#fff" stroke-width="${r * 0.26}" stroke-linecap="round"/>`);
}

/** Write markup into the example box. */
export function put(el, markup) {
  el.innerHTML = markup;
}
