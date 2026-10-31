// Shared pixel-art toolkit for the profile SVGs. Everything is drawn on a 4px grid
// (U) so the output stays crisp; scenes are 200 cells wide.
export const U = 4;
export const W = 200;
export const H = 60;

// Small seeded PRNG so every render is deterministic (asset-drift tests rely on it).
export const rng = (s) => () => {
  s |= 0;
  s = (s + 0x6d2b79f5) | 0;
  let t = Math.imul(s ^ (s >>> 15), 1 | s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const hx = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
export const mix = (a, b, t) =>
  '#' + hx(a).map((v, i) => Math.round(v + (hx(b)[i] - v) * t).toString(16).padStart(2, '0')).join('');

export const THEMES = {
  dark: { skyA: '#06081a', skyB: '#1d1140', far: '#171c40', mid: '#10132f', near: '#0a0b1d', dim: '#272b57', warm: '#ffcf7a', rain: '#8fa6ff', fig: '#dfe4ff', plate: '#0a0b1d', rail: '#2a2f55', silh: '#1a1f3d' },
  light: { skyA: '#cdd6ea', skyB: '#f1e7ee', far: '#b3bdda', mid: '#929ec4', near: '#68739a', dim: '#7d88ae', warm: '#fff1b8', rain: '#4c61a0', fig: '#262b49', plate: '#e9ecf6', rail: '#9aa3c4', silh: '#c4cbe0' },
};
export const ACC = { dark: '#ffb347', light: '#a35800' };

// 5x7 bitmap font, rows space-separated. Only the characters the panels need.
const FR = {
  A: '01110 10001 10001 11111 10001 10001 10001', B: '11110 10001 10001 11110 10001 10001 11110', C: '01110 10001 10000 10000 10000 10001 01110',
  D: '11110 10001 10001 10001 10001 10001 11110', E: '11111 10000 10000 11110 10000 10000 11111', F: '11111 10000 10000 11110 10000 10000 10000',
  G: '01110 10001 10000 10111 10001 10001 01111', H: '10001 10001 10001 11111 10001 10001 10001', I: '01110 00100 00100 00100 00100 00100 01110',
  J: '00111 00010 00010 00010 00010 10010 01100', K: '10001 10010 10100 11000 10100 10010 10001', L: '10000 10000 10000 10000 10000 10000 11111',
  M: '10001 11011 10101 10101 10001 10001 10001', N: '10001 11001 10101 10101 10011 10001 10001', O: '01110 10001 10001 10001 10001 10001 01110',
  P: '11110 10001 10001 11110 10000 10000 10000', Q: '01110 10001 10001 10001 10101 10010 01101', R: '11110 10001 10001 11110 10100 10010 10001',
  S: '01111 10000 10000 01110 00001 00001 11110', T: '11111 00100 00100 00100 00100 00100 00100', U: '10001 10001 10001 10001 10001 10001 01110',
  V: '10001 10001 10001 10001 10001 01010 00100', W: '10001 10001 10001 10101 10101 10101 01010', X: '10001 10001 01010 00100 01010 10001 10001',
  Y: '10001 10001 01010 00100 00100 00100 00100', Z: '11111 00001 00010 00100 01000 10000 11111',
  0: '01110 10001 10011 10101 11001 10001 01110', 1: '00100 01100 00100 00100 00100 00100 01110', 2: '01110 10001 00001 00010 00100 01000 11111',
  3: '11110 00001 00001 01110 00001 00001 11110', 4: '00010 00110 01010 10010 11111 00010 00010', 5: '11111 10000 11110 00001 00001 10001 01110',
  6: '00110 01000 10000 11110 10001 10001 01110', 7: '11111 00001 00010 00100 01000 01000 01000', 8: '01110 10001 10001 01110 10001 10001 01110',
  9: '01110 10001 10001 01111 00001 00010 01100',
  '.': '00000 00000 00000 00000 00000 01100 01100', ':': '00000 01100 01100 00000 01100 01100 00000', '-': '00000 00000 00000 11111 00000 00000 00000',
};

// px(u, gap): cell/letter helpers for a grid of u-pixel cells. gap > 0 draws LED-style dots.
export function px(u, gap = 0) {
  const cell = (x, y, w = 1, h = 1) => `M${x * u} ${y * u}h${w * u}v${h * u}h-${w * u}z`;
  const dot = (x, y, s) => (gap ? `M${x * u} ${y * u}h${s * u - gap}v${s * u - gap}h-${s * u - gap}z` : cell(x, y, s, s));
  const adv = (ch, s) => (ch === ' ' ? 4 : 6) * s;
  const glyph = (ch, x, y, s) => {
    const g = FR[ch];
    if (!g) return '';
    let d = '';
    g.split(' ').forEach((row, ry) => {
      for (let c = 0; c < 5; c++) if (row[c] === '1') d += dot(x + c * s, y + ry * s, s);
    });
    return d;
  };
  const letters = (str, x, y, s = 1) => {
    let cx = x;
    return [...str].map((ch) => {
      const d = glyph(ch, cx, y, s);
      cx += adv(ch, s);
      return d;
    });
  };
  const width = (str, s = 1) => [...str].reduce((a, ch) => a + adv(ch, s), 0) - s;
  return { cell, letters, width };
}
export const P4 = px(4);
export const cell = P4.cell;

// Neon text: dark mode gets a blurred glow copy plus a bright core; light mode is an unlit tube.
// `flick` is the index of one letter that flickers, `delay` offsets its animation.
export function neon(letters, acc, core, mode, filt, flick = -1, delay = 0) {
  const g = letters.map((d, i) => `<path${i === flick ? ` class="fl" style="animation-delay:${delay}s"` : ''} d="${d}"/>`).join('');
  return mode === 'dark'
    ? `<g fill="${acc}" filter="url(#${filt})" opacity=".95">${g}</g><g fill="${core}">${g}</g>`
    : `<g fill="${acc}">${g}</g>`;
}

// A row of buildings with lit/blinking windows. o: {top,h0,h1,w0,w1,fill,T,accC,win,lit,acc,dimP,from,to}
export function city(r, o) {
  const c = o.c || cell;
  let x = o.from ?? -2;
  let rects = '', warm = '', dim = '';
  const a = ['', '', ''];
  while (x < (o.to ?? W)) {
    const w = o.w0 + Math.floor(r() * (o.w1 - o.w0 + 1));
    const h = o.h0 + Math.floor(r() * (o.h1 - o.h0 + 1));
    rects += c(x, o.top - h, w, h);
    if (o.win) {
      for (let wy = o.top - h + 3; wy < o.top - 2; wy += 3) {
        for (let wx = x + 2; wx < x + w - 2; wx += 3) {
          const p = r(), m = c(wx, wy);
          if (p < o.lit) warm += m;
          else if (p < o.lit + o.acc) a[Math.floor(r() * 3)] += m;
          else if (p < o.lit + o.acc + o.dimP) dim += m;
        }
      }
    }
    x += w + (r() < 0.3 ? 1 : 0);
  }
  return `<path d="${rects}" fill="${o.fill}"/>`
    + (dim ? `<path d="${dim}" fill="${o.T.dim}"/>` : '')
    + (warm ? `<path d="${warm}" fill="${o.T.warm}"/>` : '')
    + a.map((d, i) => (d ? `<path class="bl b${i}" d="${d}" fill="${o.accC}"/>` : '')).join('');
}

// The tile repeats every 16 cells (= the 64px the layer travels) so the loop has no seam.
export function rainLayer(r, col, op, dur, n, len) {
  const tile = [];
  for (let i = 0; i < n; i++) tile.push([Math.floor(r() * W), Math.floor(r() * 16)]);
  let d = '';
  for (let k = -1; k <= Math.ceil(H / 16); k++) tile.forEach(([x, y]) => { d += cell(x, y + k * 16, 1, len); });
  return `<g class="rain" style="animation-duration:${dur}s" fill="${col}" opacity="${op}"><path d="${d}"/></g>`;
}
export const streetRain = (r, T) =>
  rainLayer(r, T.rain, 0.18, 1.3, 14, 2) + rainLayer(r, T.rain, 0.35, 0.7, 14, 2) + rainLayer(r, T.rain, 0.55, 0.45, 8, 3);

// Ellipses are laid out twice, one world-width apart, so an 800px drift loops seamlessly.
export function fog(r, col, op, dur, y, fid) {
  const es = [];
  for (let i = 0; i < 7; i++) es.push([Math.floor(r() * W), 14 + Math.floor(r() * 18), 2 + Math.floor(r() * 3)]);
  const e = [0, W].map((off) => es.map(([cx, rx, ry]) => `<ellipse cx="${(cx + off) * U}" cy="${y * U}" rx="${rx * U}" ry="${ry * U}"/>`).join('')).join('');
  return `<g class="drift" style="animation-duration:${dur}s"><g fill="${col}" opacity="${op}" filter="url(#${fid})">${e}</g></g>`;
}

export function skyRows(T, rows, r, dark) {
  const bh = (rows * U) / 12;
  let o = '';
  for (let i = 0; i < 12; i++) o += `<rect y="${i * bh}" width="${W * U}" height="${bh + 1}" fill="${mix(T.skyA, T.skyB, i / 11)}"/>`;
  if (dark) {
    let s = '';
    for (let i = 0; i < 20; i++) s += cell(Math.floor(r() * W), Math.floor(r() * 12));
    o += `<path d="${s}" fill="#fff" opacity=".5"/>`;
  }
  return o;
}

export const VIGNETTE_DEF = '<radialGradient id="vg" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></radialGradient>';
export const vignette = (rows) => `<rect width="${W * U}" height="${rows * U}" fill="url(#vg)"/>`;

// Animation shared by every asset. Each SVG embeds it, since GitHub serves them as <img> files.
export const STYLE = `
.bl{animation:bl 3s steps(1) infinite}.b1{animation-delay:-1s}.b2{animation-delay:-2s}
@keyframes bl{0%{opacity:1}60%{opacity:.15}70%{opacity:1}}
.fl{animation:fl 6s steps(1) infinite}
@keyframes fl{0%,100%{opacity:1}42%{opacity:1}43%{opacity:.25}45%{opacity:1}47%{opacity:.4}48%{opacity:1}}
.rain{animation:fall linear infinite}
@keyframes fall{to{transform:translateY(64px)}}
.shim{animation:shim 4s ease-in-out infinite alternate}
@keyframes shim{from{opacity:.1}to{opacity:.4}}
.steam{animation:rise 3.2s ease-out infinite}
@keyframes rise{from{transform:translateY(0);opacity:.6}to{transform:translateY(-40px);opacity:0}}
.drift{animation:drift linear infinite}
@keyframes drift{to{transform:translateX(-800px)}}
.sweep{transform-origin:80px 196px;animation:sweep 10s ease-in-out infinite alternate}
@keyframes sweep{from{transform:rotate(-9deg)}to{transform:rotate(11deg)}}
.drone{animation:fly 38s linear infinite}
@keyframes fly{from{transform:translateX(-40px)}to{transform:translateX(840px)}}
.tail{transform-origin:488px 196px;animation:tail 3s ease-in-out infinite alternate}
@keyframes tail{from{transform:rotate(-14deg)}to{transform:rotate(16deg)}}
.eye{animation:blink 5s steps(1) infinite}
@keyframes blink{0%,95%{opacity:1}96%,98%{opacity:0}99%,100%{opacity:1}}
.ripple{fill:none;stroke-width:1.5;transform-box:fill-box;transform-origin:center;animation:rip 2.6s ease-out infinite}
@keyframes rip{from{transform:scale(.2);opacity:.8}to{transform:scale(1);opacity:0}}
.splash{animation:sp .9s steps(1) infinite}
@keyframes sp{0%{opacity:.9}33%{opacity:0}}
.flash,.bolt{opacity:0}
.flash{animation:flash 13s linear infinite}.bolt{animation:bolt 13s linear infinite}
@keyframes flash{0%,60%{opacity:0}61%{opacity:.5}62%{opacity:0}63%{opacity:.35}66%,100%{opacity:0}}
@keyframes bolt{0%,60.5%{opacity:0}61%{opacity:1}62%{opacity:0}63%{opacity:.8}64.5%,100%{opacity:0}}
@media (prefers-reduced-motion:reduce){
.bl,.fl,.rain,.shim,.steam,.drift,.sweep,.drone,.tail,.eye,.ripple,.splash,.flash,.bolt{animation:none}
.steam{opacity:0}.drone{transform:translateX(560px)}}
`;

// Wraps scene content in a standalone SVG document.
export function svgDoc({ rows, width = W * U, height = rows * U, label, defs = '', body }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${label}" shape-rendering="crispEdges"><style>${STYLE}</style><defs>${defs}</defs>${body}</svg>\n`;
}
