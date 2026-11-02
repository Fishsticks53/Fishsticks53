// Drawing helpers shared by the four scenes. Scenes emit plain SVG markup written against var(--token)
// colours; optimize.mjs later resolves the tokens and compacts the result.
export { T } from './font.mjs';
import { T } from './font.mjs';

// Seeded PRNG so every render is deterministic.
export const rng = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export const R = (x, y, w, h, f, c = '', st = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:${f}${st}"${c ? ` class="${c}"` : ''}/>`;
export const P = (pts, f, o = '', c = '') => `<polygon points="${pts}" style="fill:${f}${o ? `;fill-opacity:${o}` : ''}"${c ? ` class="${c}"` : ''}/>`;

// Title plate in the top-left corner of each scene.
export const plate = (title) => `<g>${R(20, 18, Math.max(170, title.length * 17 + 34), 34, 'var(--plate)', '', '; stroke:var(--cy);stroke-width:2')}${T(34, 42, 18, title, 'var(--cy)')}</g>`;

// A scene is returned as data; render-scenes.mjs wraps, themes and optimises it.
export const scene = (h, label, inner) => ({ h, label, inner });

export const bg = (id, a, b, h) => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(${a})"/><stop offset="1" style="stop-color:var(${b})"/></linearGradient></defs><rect width="800" height="${h}" fill="url(#${id})"/>`;

export function rain(h, seed, n, xmax = 800) {
  const r = rng(seed);
  let o = '';
  for (let i = 0; i < n; i++) {
    const x = Math.floor(r() * xmax), d = (0.7 + r() * 0.6).toFixed(2), dl = (-r() * 2).toFixed(2);
    o += `<rect class="rain" x="${x}" y="0" width="2" height="9" style="fill:var(--rain);opacity:.35;animation-duration:${d}s;animation-delay:${dl}s"/>`;
  }
  return o;
}

// Oblique box: front face plus right side and top faces.
export const B3 = (x, y, w, h, d, e, L, ex = '') => {
  const sd = `${x + w},${y} ${x + w + d},${y - e} ${x + w + d},${y + h - e} ${x + w},${y + h}`;
  const tp = `${x},${y} ${x + w},${y} ${x + w + d},${y - e} ${x + d},${y - e}`;
  return R(x, y, w, h, L, '', ex) + R(x, y, 1, h, '#fff', '', '; opacity:.25') + R(x, y + h - 2, w, 2, 'var(--shade)', '', '; opacity:.35')
    + P(sd, L) + P(sd, 'var(--shade)', '.5') + P(tp, L) + P(tp, '#fff', '.22');
};
