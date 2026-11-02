import { FONT } from './font-data.mjs';

const num = (v) => +v.toFixed(2);
const glyphId = (ch) => 'p' + ch.charCodeAt(0).toString(36);

// Glyph outlines (font units, y flipped so +y is down) as compact relative paths, built once per glyph.
const outline = (g) => {
  let x = 0, y = 0, sx = 0, sy = 0, d = '';
  for (const [, c, args] of g.matchAll(/([MLHVZ])([^MLHVZ]*)/g)) {
    const n = args.trim() ? args.trim().split(/[\s,]+/).map(Number) : [];
    if (c === 'M') { d += `m${n[0] - x} ${-n[1] - y}`; x = sx = n[0]; y = sy = -n[1]; }
    else if (c === 'L') { d += `l${n[0] - x} ${-n[1] - y}`; x = n[0]; y = -n[1]; }
    else if (c === 'H') { d += `h${n[0] - x}`; x = n[0]; }
    else if (c === 'V') { d += `v${-n[0] - y}`; y = -n[0]; }
    else { d += 'z'; x = sx; y = sy; } // closing returns to the subpath start
  }
  return d.replace(/ -/g, '-');
};

// <defs> holding the outline of every glyph id in `ids` (a Set of ids used by T()).
export function glyphDefs(ids) {
  let d = '';
  for (const ch of Object.keys(FONT.glyphs)) if (ids.has(glyphId(ch))) d += `<path id="${glyphId(ch)}" d="${outline(FONT.glyphs[ch])}"/>`;
  return d ? `<defs>${d}</defs>` : '';
}

// Lay out `txt` with Pixelify Sans metrics (advance + kerning) and return it as a <g> of <use> glyphs.
// Same contract as the SVG <text> it replaces: x/y is the baseline origin, `a` is the text-anchor.
// GitHub blocks web fonts inside images, so text has to be shapes; reusing one outline per glyph keeps it small.
// data-bb carries the bounding box for the optimiser and is stripped from the output.
export function T(x, y, s, txt, f = 'var(--ink)', a = 'start', ex = '') {
  const str = String(txt).replace(/\s+/g, ' ').trim();
  const k = s / FONT.upem;
  let pen = 0, uses = '';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (FONT.glyphs[ch]) uses += `<use href="#${glyphId(ch)}"${pen ? ` x="${pen}"` : ''}/>`;
    pen += (FONT.adv[ch] ?? FONT.adv[' ']) + (FONT.kern[ch + (str[i + 1] ?? '')] ?? 0);
  }
  const width = pen * k;
  const x0 = a === 'middle' ? x - width / 2 : a === 'end' ? x - width : x;
  return `<g data-bb="${num(x0)} ${num(y - 0.92 * s)} ${num(x0 + width)} ${num(y + 0.28 * s)}" shape-rendering="auto" transform="translate(${num(x0)} ${num(y)}) scale(${k})" style="fill:${f}${ex}">${uses}</g>`;
}

export const textWidth = (s, txt) => {
  const str = String(txt).replace(/\s+/g, ' ').trim();
  let pen = 0;
  for (let i = 0; i < str.length; i++) pen += (FONT.adv[str[i]] ?? FONT.adv[' ']) + (FONT.kern[str[i] + (str[i + 1] ?? '')] ?? 0);
  return (pen * s) / FONT.upem;
};
