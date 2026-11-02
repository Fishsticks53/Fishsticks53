import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { rng, px } from './pixel.mjs';
import { commits30, streak, agoLabel, bucketLevels } from './stats.mjs';

// Port of the "Rooftop to underground" design: four stacked 800px-wide scenes, each its own SVG so
// each can carry its own README link. GitHub blocks web fonts inside images, so all text is drawn
// with the shared 5x7 pixel font (uppercase only) instead of <text>.

const NAMES = ['TYPESCRIPT', 'REACT', 'PYTHON', 'FASTAPI', 'PYTORCH', 'LANGCHAIN'];

// Scene palettes, exposed to the SVGs as CSS variables (the design reads them via var()).
const PAL = {
  dark: `--s1a:#070a1a;--s1b:#121836;--bld:#0f1431;--bld2:#171e45;--win:#ffcf70;--roof:#161d40;--roof2:#202852;--ink:#e8eaff;--ink2:#9aa2c8;--acc:#ffb347;--cy:#4de1ff;--mg:#ff4fa3;--rain:#7da6ff;--cat:#4a5390;--hood:#5b3fa6;--skin:#e8b48f;--desk:#2a2f58;--scr:#06222f;--warm:#ffb347;--room:#2a1c2e;--room2:#1b1226;--jacket:#e4384e;--wood:#6b4630;--leaf:#2a9d78;--sofa:#a23a6a;--hair:#0b0d16;--haz:#ffb347;--chrome:#c5d2ec;
--s2a:#121836;--s2b:#0b0e22;--tile:#151b3f;--tilebd:#262d5c;--shade:#02030a;--lv0:#1c2347;--lv1:#1f5a73;--lv2:#1fa0b8;--lv3:#4de1ff;--lv4:#ff0267;
--s3a:#0b0e22;--s3b:#080a18;--ceil:#11163a;--pipe:#2b3366;--rack:#121733;--rackbd:#2d3566;--slot:#0a0d22;--plate:#0b0e22;--cable:#3a4488;--train:#1a2146;--track:#343c78;
--s4a:#080a18;--s4b:#04050d;--wall:#10142e;--door:#1b2250;--doorrim:#3a447f;--floor:#0e1230`,
  light: `--s1a:#cfd6ee;--s1b:#aeb8de;--bld:#98a3cf;--bld2:#8995c4;--win:#e08a1a;--roof:#8793c4;--roof2:#6f7cb2;--ink:#14172b;--ink2:#3d4468;--acc:#b85f00;--cy:#0a7f9a;--mg:#c4237a;--rain:#4f6fd1;--cat:#2a2f58;--hood:#6a4cc0;--skin:#e0a57f;--desk:#5a65a0;--scr:#06222f;--warm:#e08a1a;--room:#e3d2d9;--room2:#cdb9c4;--jacket:#d02f45;--wood:#9b6b48;--leaf:#2f8a5f;--sofa:#b94a7e;--hair:#0b0d16;--haz:#b85f00;--chrome:#7d89ab;
--s2a:#aeb8de;--s2b:#9aa5d2;--tile:#b7c0e3;--tilebd:#98a3cf;--shade:#0b1030;--lv0:#c9d0ea;--lv1:#9dd3e0;--lv2:#5bbfd4;--lv3:#1e9bb8;--lv4:#ff0267;
--s3a:#9aa5d2;--s3b:#7f8bbd;--ceil:#6d79ae;--pipe:#8a96c8;--rack:#aab4dc;--rackbd:#6d79ae;--slot:#4a5486;--plate:#dfe4f5;--cable:#4a5486;--train:#4c578a;--track:#5d6aa8;
--s4a:#7f8bbd;--s4b:#5d689b;--wall:#6d79ae;--door:#8a96c8;--doorrim:#4a5486;--floor:#5d689b`,
};

const ANIM = `
.rain{animation:fall linear infinite}@keyframes fall{from{transform:translateY(-30px)}to{transform:translateY(460px)}}
.tw{animation:tw 3s steps(1) infinite}@keyframes tw{0%{opacity:1}55%{opacity:.15}65%{opacity:1}}
.fl{animation:fl 6s steps(1) infinite}@keyframes fl{0%,100%{opacity:1}42%{opacity:1}43%{opacity:.25}45%{opacity:1}47%{opacity:.4}48%{opacity:1}}
.cat{transform-box:fill-box;transform-origin:center;animation:roam 22s linear infinite}
@keyframes roam{0%{transform:translateX(0) scaleX(1)}46%{transform:translateX(330px) scaleX(1)}50%{transform:translateX(330px) scaleX(-1)}96%{transform:translateX(0) scaleX(-1)}100%{transform:translateX(0) scaleX(1)}}
.legA{animation:legs .5s steps(1) infinite}.legB{animation:legs .5s steps(1) infinite reverse}@keyframes legs{0%{opacity:1}50%{opacity:0}}
.tail{transform-box:fill-box;transform-origin:bottom center;animation:wag 1.6s ease-in-out infinite alternate}@keyframes wag{from{transform:rotate(-14deg)}to{transform:rotate(14deg)}}
.type{animation:tap .28s steps(1) infinite}@keyframes tap{0%{transform:translateY(0)}50%{transform:translateY(2px)}}
.type2{animation:tap .28s steps(1) infinite;animation-delay:-.14s}
.code{animation:scroll 3s steps(6) infinite}@keyframes scroll{to{transform:translateY(-36px)}}
.pulse{animation:pulse 2s ease-in-out infinite alternate}@keyframes pulse{from{opacity:.35}to{opacity:1}}
.steam{animation:rise 3.2s ease-out infinite}@keyframes rise{from{transform:translateY(0);opacity:.6}to{transform:translateY(-40px);opacity:0}}
.flyR{animation:flyR linear infinite}@keyframes flyR{from{transform:translateX(-200px)}to{transform:translateX(850px)}}
.flyL{animation:flyL linear infinite}@keyframes flyL{from{transform:translateX(1000px)}to{transform:translateX(-250px)}}
.drift{animation:drift linear infinite}@keyframes drift{from{transform:translateX(-620px)}to{transform:translateX(900px)}}
.fan{transform-box:fill-box;transform-origin:center;animation:spin 2.4s linear infinite}
.spin{animation:spin 24s linear infinite;transform-origin:400px 206px}@keyframes spin{to{transform:rotate(360deg)}}
.bob{animation:bob 1.4s ease-in-out infinite alternate}@keyframes bob{to{transform:translateY(5px)}}
.drip{animation:drip 2.4s ease-in infinite}@keyframes drip{0%{transform:translateY(0);opacity:1}80%{opacity:1}100%{transform:translateY(60px);opacity:0}}
@media (prefers-reduced-motion:reduce){svg *{animation:none!important}}`;

// ---------- drawing helpers ----------
const R = (x, y, w, h, f, c = '', st = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:${f}${st}"${c ? ` class="${c}"` : ''}/>`;
const P = (pts, f, o = '', c = '') => `<polygon points="${pts}" style="fill:${f}${o ? `;fill-opacity:${o}` : ''}"${c ? ` class="${c}"` : ''}/>`;

// Pixel-font text. `s` is the old font-size; glyphs are 7 cells tall at s/10 px per cell.
// px().width() counts grid cells, so scale by the cell size to get pixels.
const textW = (s, txt) => px(s / 10).width(String(txt).toUpperCase()) * (s / 10);
const T = (x, y, s, txt, f = 'var(--ink)', a = 'start', ex = '') => {
  const u = s / 10, str = String(txt).toUpperCase(), w = textW(s, str);
  const x0 = a === 'middle' ? x - w / 2 : a === 'end' ? x - w : x;
  return `<path transform="translate(${+x0.toFixed(1)} ${+(y - 7 * u).toFixed(1)})" d="${px(u).letters(str, 0, 0, 1).join('')}" style="fill:${f}${ex}"/>`;
};
const plate = (title) => `<g>${R(20, 18, Math.round(textW(18, title)) + 28, 34, 'var(--plate)', '', '; stroke:var(--cy);stroke-width:2')}${T(34, 42, 18, title, 'var(--cy)')}</g>`;
// Size pass, visually lossless: resolve var() to literal colours, turn paint declarations into
// attributes (animation-* and filter stay in style), and merge runs of plain opaque rects with the
// same fill into one path. Opaque only: overlapping translucent rects would blend differently.
const PAINT = new Set(['fill', 'opacity', 'fill-opacity', 'stroke', 'stroke-width', 'stop-color', 'stop-opacity']);
function slim(inner, mode) {
  const vars = Object.fromEntries(PAL[mode].split(';').map((d) => d.trim().split(/:(.+)/)).filter((p) => p[1]));
  const lit = (s) => s.replace(/var\((--[\w-]+)\)/g, (_, n) => vars[n]);
  const tags = inner.replace(/ style="([^"]*)"/g, (_, css) => {
    const keep = [];
    let attrs = '';
    for (const decl of css.split(';')) {
      const i = decl.indexOf(':');
      if (i < 0) continue;
      const k = decl.slice(0, i).trim(), v = lit(decl.slice(i + 1).trim());
      if (PAINT.has(k)) attrs += ` ${k}="${v}"`; else keep.push(`${k}:${v}`);
    }
    return attrs + (keep.length ? ` style="${keep.join(';')}"` : '');
  }).match(/<[^>]*>/g);
  const plain = /^<rect x="([^"]+)" y="([^"]+)" width="([^"]+)" height="([^"]+)" fill="([^"]+)"(?: opacity="([^"]+)")?\/>$/;
  const hit = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
  let out = '', key = null, run = [];
  const flush = () => {
    if (run.length) {
      const [fill, op] = key.split('|');
      let px = 0, py = 0;
      const d = run.map((r, i) => { const s = `${i ? 'm' : 'M'}${+(r.x - px).toFixed(3)} ${+(r.y - py).toFixed(3)}h${r.w}v${r.h}h-${r.w}z`; px = r.x; py = r.y; return s; }).join('');
      out += `<path fill="${fill}"${op ? ` opacity="${op}"` : ''} d="${d}"/>`;
    }
    run = []; key = null;
  };
  for (const t of tags) {
    const m = plain.exec(t);
    if (!m) { flush(); out += t; continue; }
    const r = { x: +m[1], y: +m[2], w: +m[3], h: +m[4] }, k = `${m[5]}|${m[6] || ''}`;
    // Translucent rects blend where they overlap, a merged path would not, so only merge disjoint ones.
    if (k !== key || (m[6] && run.some((o) => hit(o, r)))) { flush(); key = k; }
    run.push(r);
  }
  flush();
  return out;
}
const svg = (mode, h, label, inner) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 ${h}" role="img" aria-label="${label}" shape-rendering="crispEdges"><style>${ANIM}</style>${slim(inner, mode)}</svg>\n`;
const bg = (id, a, b, h) => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(${a})"/><stop offset="1" style="stop-color:var(${b})"/></linearGradient></defs><rect width="800" height="${h}" fill="url(#${id})"/>`;
function rain(seed, n, xmax = 800) {
  const r = rng(seed);
  let o = '';
  for (let i = 0; i < n; i++) {
    const x = Math.floor(r() * xmax), d = (0.7 + r() * 0.6).toFixed(2), dl = (-r() * 2).toFixed(2);
    o += `<rect class="rain" x="${x}" y="0" width="2" height="9" style="fill:var(--rain);opacity:.35;animation-duration:${d}s;animation-delay:${dl}s"/>`;
  }
  return o;
}
// Oblique box: front face plus right side and top faces.
const B3 = (x, y, w, h, d, e, L, ex = '') => {
  const sd = `${x + w},${y} ${x + w + d},${y - e} ${x + w + d},${y + h - e} ${x + w},${y + h}`, tp = `${x},${y} ${x + w},${y} ${x + w + d},${y - e} ${x + d},${y - e}`;
  return R(x, y, w, h, L, '', ex) + R(x, y, 1, h, '#fff', '', '; opacity:.25') + R(x, y + h - 2, w, 2, 'var(--shade)', '', '; opacity:.35') + P(sd, L) + P(sd, 'var(--shade)', '.5') + P(tp, L) + P(tp, '#fff', '.22');
};

// ---------- Slice 1: apartment + balcony ----------
function s1(mode) {
  const H = 470;
  let o = bg('g1', '--s1a', '--s1b', H);
  o += `<defs><mask id="dry"><rect width="800" height="470" fill="#fff"/><polygon points="6,196 440,160 440,342 6,342" fill="#000"/></mask><radialGradient id="glow"><stop offset="0" style="stop-color:var(--warm);stop-opacity:.55"/><stop offset="1" style="stop-color:var(--warm);stop-opacity:0"/></radialGradient></defs>`;
  const layer = (seed, hMin, hVar, col, op, lit) => {
    const q = rng(seed);
    let x = -10, s = '';
    while (x < 460) {
      const w = 34 + Math.floor(q() * 5) * 8, h = hMin + Math.floor(q() * hVar) * 18, y = 470 - h;
      s += R(x, y, w, h, col, '', `;opacity:${op}`) + R(x + 4, y - 5, w - 8, 5, col, '', `;opacity:${op}`);
      if (h > 260 && q() < 0.5) s += R(x + w / 2 - 1, y - 26, 2, 22, col, '', `;opacity:${op}`) + R(x + w / 2 - 2, y - 30, 4, 4, '#ff3b3b', 'fl');
      for (let wx = x + 5; wx < x + w - 7; wx += 9) for (let wy = y + 9; wy < 462; wy += 13) {
        if (q() < lit) { const t = q() < 0.3; s += R(wx, wy, 4, 6, 'var(--win)', t ? 'tw' : '', t ? `;animation-delay:${(-q() * 3).toFixed(1)}s` : ''); }
      }
      x += w + 4 + Math.floor(q() * 10);
    }
    return s;
  };
  o += layer(3, 170, 9, 'var(--bld2)', 0.6, 0.12) + layer(5, 90, 8, 'var(--bld)', 1, 0.2);
  const lights = (x0, x1, y, sag, seed) => {
    const q = rng(seed);
    let s = '';
    const n = Math.floor((x1 - x0) / 19);
    for (let i = 0; i <= n; i++) {
      const f = i / n, x = x0 + f * (x1 - x0), yy = y + Math.sin(f * Math.PI) * sag;
      s += R(x - 1, yy - 3, 2, 3, 'var(--ink2)') + R(x - 2, yy, 5, 5, ['var(--warm)', 'var(--mg)', 'var(--cy)'][i % 3], 'tw', `;animation-delay:${(-q() * 3).toFixed(1)}s;animation-duration:${(2 + q() * 2).toFixed(1)}s`);
    }
    return s;
  };
  // balcony: tent canopy, railing, slab
  const yT = (x) => 168 + (436 - x) * 0.0744;
  for (let x = 6, k = 0; x < 436; x += 24, k++) {
    const x2 = Math.min(x + 24, 436), c = k % 2 ? '#0a061c' : '#ff0267';
    o += P(`${x},${yT(x)} ${x2},${yT(x2)} ${x2},${yT(x2) + 10} ${x},${yT(x) + 10}`, c) + P(`${x},${yT(x)} ${x2},${yT(x2)} ${x2},${yT(x2) + 2} ${x},${yT(x) + 2}`, '#fff', '.25')
      + R(x + 2, yT(x) + 10, Math.max(0, x2 - x - 4), 3, c) + R(x + 5, yT(x) + 13, Math.max(0, x2 - x - 10), 2, c);
  }
  o += R(432, 162, 10, 22, 'var(--roof2)') + R(2, 198, 5, 98, 'var(--roof2)') + R(0, 196, 10, 4, 'var(--roof2)');
  o += P('7,224 62,205 62,208 7,227', 'var(--roof2)');
  o += lights(14, 430, 232, 10, 2);
  o += R(0, 292, 444, 4, 'var(--roof2)');
  for (let x = 0; x <= 440; x += 44) o += R(x, 292, 4, 48, 'var(--roof2)');
  o += R(4, 296, 436, 44, 'var(--cy)', '', '; opacity:.05');
  o += R(0, 340, 444, 14, 'var(--roof)') + R(0, 340, 444, 3, 'var(--cy)', '', '; opacity:.5') + R(0, 354, 444, 8, 'var(--shade)', '', '; opacity:.55');
  for (let x = 10; x < 444; x += 52) o += R(x, 346, 30, 2, 'var(--roof2)');
  [[92, 'var(--leaf)'], [330, 'var(--leaf)']].forEach(([x, c]) => {
    o += R(x + 8, 296, 2, 14, 'var(--ink2)') + R(x, 308, 18, 12, 'var(--wood)') + R(x - 4, 298, 8, 12, c) + R(x + 14, 300, 10, 10, c) + R(x + 6, 318, 4, 16, c) + R(x + 14, 318, 4, 24, c) + R(x + 2, 330, 4, 10, c);
  });
  for (let i = 0; i < 10; i++) o += R(150 + i * 18, 336, 18, 4, i % 2 ? 'var(--hood)' : 'var(--acc)');
  o += R(236, 306, 44, 4, 'var(--wood)') + R(256, 310, 4, 30, 'var(--wood)') + R(244, 338, 28, 2, 'var(--wood)')
    + R(244, 296, 8, 10, 'var(--ink)') + R(245, 290, 2, 4, 'var(--ink2)', 'steam', '; opacity:.5')
    + R(262, 288, 10, 18, 'var(--warm)', 'pulse', '; opacity:.9') + R(260, 286, 14, 3, 'var(--ink2)') + R(264, 282, 6, 4, 'var(--ink2)');
  o += R(166, 292, 8, 34, 'var(--wood)') + R(166, 322, 50, 6, 'var(--wood)') + R(170, 308, 36, 14, 'var(--mg)', '', '; opacity:.9') + R(176, 312, 36, 8, 'var(--hood)') + R(168, 328, 4, 12, 'var(--wood)') + R(210, 328, 4, 12, 'var(--wood)');
  o += R(120, 318, 14, 22, 'var(--warm)', 'pulse', '; opacity:.8') + R(118, 316, 18, 3, 'var(--ink2)') + R(122, 312, 10, 4, 'var(--ink2)');
  const monstera = (x) => {
    let s = R(x + 4, 320, 28, 20, 'var(--wood)') + R(x + 2, 316, 32, 5, 'var(--wood)') + R(x + 16, 280, 4, 38, 'var(--leaf)');
    [[0, 284, 16], [20, 276, 16], [-4, 300, 14], [24, 296, 16], [8, 264, 12]].forEach(([dx, dy, w]) => { s += R(x + dx, dy, w, 10, 'var(--leaf)') + R(x + dx + 2, dy + 10, w - 4, 4, 'var(--leaf)', '', '; opacity:.7'); });
    return s;
  };
  o += monstera(18) + monstera(398);
  o += '<g transform="translate(64 340)"><g class="cat">'
    + R(-8, -26, 4, 16, 'var(--cat)', 'tail') + R(0, -16, 28, 11, 'var(--cat)') + R(24, -26, 14, 13, 'var(--cat)')
    + R(24, -30, 4, 5, 'var(--cat)') + R(34, -30, 4, 5, 'var(--cat)') + R(33, -22, 3, 3, 'var(--cy)')
    + R(2, -6, 5, 6, 'var(--cat)', 'legA') + R(11, -6, 5, 6, 'var(--cat)', 'legB') + R(18, -6, 5, 6, 'var(--cat)', 'legA') + R(26, -6, 5, 6, 'var(--cat)', 'legB')
    + '</g></g>';
  o += `<g mask="url(#dry)">${rain(11, 34, 440)}</g>`;
  o += R(3, 212, 2, 10, 'var(--rain)', 'drip') + R(9, 214, 2, 8, 'var(--rain)', 'drip', '; animation-delay:-.9s') + R(2, 206, 2, 8, 'var(--rain)', 'drip', '; animation-delay:-1.7s');
  // apartment
  const win = (x, y, k) => {
    let t = R(x - 3, y - 3, 54, 36, 'var(--roof2)') + R(x, y, 48, 30, k === 0 ? 'var(--s1b)' : 'var(--warm)', '', k === 0 ? '' : ';opacity:.82');
    if (k === 0) t += R(x + 6, y + 5, 12, 2, '#fff', '', '; opacity:.12') + R(x + 26, y + 14, 8, 2, '#fff', '', '; opacity:.08');
    if (k === 2) t += R(x + 34, y + 12, 2, 16, 'var(--ink2)') + P(`${x + 30},${y + 12} ${x + 40},${y + 12} ${x + 38},${y + 5} ${x + 32},${y + 5}`, '#fff', '.9') + R(x + 6, y + 20, 10, 10, 'var(--leaf)');
    if (k === 3) t += R(x, y, 48, 30, 'var(--cy)', 'fl', '; opacity:.4') + R(x + 8, y + 18, 32, 10, 'var(--room2)') + R(x + 10, y + 12, 28, 6, 'var(--room2)');
    if (k === 4) t += R(x, y, 13, 30, 'var(--mg)', '', '; opacity:.6') + R(x + 35, y, 13, 30, 'var(--mg)', '', '; opacity:.6');
    if (k === 5) t += R(x + 19, y + 11, 10, 19, 'var(--room2)') + R(x + 21, y + 4, 6, 7, 'var(--room2)');
    return t + R(x + 22, y, 4, 30, 'var(--roof2)');
  };
  o += R(0, 362, 444, 108, 'var(--bld)') + R(0, 362, 444, 5, 'var(--bld2)') + R(0, 367, 444, 3, 'var(--shade)', '', '; opacity:.4');
  for (let x = 0; x <= 444; x += 74) o += R(x, 370, 5, 100, 'var(--bld2)');
  o += R(0, 420, 444, 4, 'var(--bld2)') + R(0, 424, 444, 2, 'var(--shade)', '', '; opacity:.35');
  const lq = rng(91);
  for (let c = 0; c < 6; c++) for (let q = 0; q < 2; q++) { const k = Math.floor(lq() * 6); o += win(12 + c * 74 + 8, q ? 434 : 380, k); }
  o += R(0, 354, 444, 8, 'var(--bld2)') + R(0, 354, 444, 2, '#fff', '', '; opacity:.12');
  o += R(444, 40, 356, 430, 'var(--bld)') + R(444, 40, 356, 8, 'var(--roof2)') + R(444, 48, 356, 2, 'var(--shade)', '', '; opacity:.4');
  for (let c = 0; c <= 5; c++) o += R(444 + c * 68 - (c === 5 ? 4 : 0), 48, 4, 156, 'var(--bld2)');
  for (let q = 0; q < 3; q++) o += R(444, 90 + q * 48, 356, 4, 'var(--bld2)') + R(444, 94 + q * 48, 356, 2, 'var(--shade)', '', '; opacity:.35');
  const wq = rng(77);
  for (let q = 0; q < 3; q++) for (let c = 0; c < 5; c++) {
    const x = 454 + c * 68, y = 56 + q * 48, k = Math.floor(wq() * 6);
    o += win(x, y, k);
    if (wq() < 0.35) { o += R(x - 6, y + 30, 60, 3, 'var(--ink2)'); for (let j = 0; j < 10; j++) o += R(x - 6 + j * 6, y + 30, 2, 6, 'var(--ink2)', '', '; opacity:.7'); if (k !== 2) o += R(x + 4, y + 22, 9, 8, 'var(--leaf)'); }
  }
  o += R(470, 22, 3, 18, 'var(--roof2)') + R(504, 22, 3, 18, 'var(--roof2)') + R(466, 6, 46, 18, 'var(--bld2)') + R(466, 12, 46, 2, 'var(--shade)', '', '; opacity:.4') + R(466, 18, 46, 2, 'var(--shade)', '', '; opacity:.4') + P('464,6 514,6 489,-6 489,-6', 'var(--roof2)');
  o += R(560, 24, 14, 16, 'var(--bld2)') + R(558, 22, 18, 3, 'var(--roof2)') + R(564, 12, 3, 8, 'var(--ink2)', 'steam', '; opacity:.5');
  o += R(610, 32, 40, 8, 'var(--leaf)') + R(620, 26, 12, 8, 'var(--leaf)') + R(638, 28, 10, 6, 'var(--leaf)');
  o += lights(520, 700, 32, 4, 12);
  o += R(738, 8, 3, 32, 'var(--roof2)') + R(756, 14, 3, 26, 'var(--roof2)') + R(732, 16, 16, 3, 'var(--roof2)') + R(736, 4, 8, 6, '#ff3b3b', 'fl') + R(754, 10, 8, 6, '#ff3b3b', 'fl', '; animation-delay:-2s') + R(772, 20, 22, 16, 'var(--roof2)') + R(776, 24, 14, 8, 'var(--cy)', 'pulse', '; opacity:.6');
  o += R(436, 204, 364, 10, 'var(--roof2)');
  // study
  o += R(442, 214, 358, 126, 'var(--room)') + R(442, 318, 358, 22, 'var(--room2)', '', '; opacity:.55');
  o += '<ellipse cx="640" cy="290" rx="230" ry="110" fill="url(#glow)"/>';
  o += lights(452, 792, 224, 8, 4);
  o += R(452, 230, 46, 110, 'var(--wood)');
  for (let s = 0; s < 4; s++) {
    o += R(455, 236 + s * 26, 40, 22, 'var(--room2)');
    let bx = 456;
    const q = rng(40 + s);
    while (bx < 490) { const bw = 3 + Math.floor(q() * 4); o += R(bx, 240 + s * 26 + Math.floor(q() * 4), bw, 18 - Math.floor(q() * 4), ['var(--mg)', 'var(--cy)', 'var(--acc)', 'var(--hood)'][Math.floor(q() * 4)]); bx += bw + 1; }
  }
  o += R(516, 234, 64, 66, 'var(--roof2)') + R(520, 238, 56, 58, 'var(--s1b)') + R(546, 238, 4, 58, 'var(--roof2)') + R(520, 264, 56, 4, 'var(--roof2)');
  o += R(526, 278, 6, 4, 'var(--win)', 'tw') + R(560, 246, 4, 4, 'var(--win)', 'tw', '; animation-delay:-1s') + R(530, 252, 2, 10, 'var(--rain)', '', '; opacity:.4');
  o += R(612, 228, 34, 24, 'var(--roof2)') + R(615, 231, 28, 18, 'var(--mg)', '', '; opacity:.8') + R(622, 238, 14, 10, 'var(--cy)', '', '; opacity:.8') + R(656, 232, 22, 18, 'var(--roof2)') + R(659, 235, 16, 12, 'var(--acc)', '', '; opacity:.8');
  o += R(596, 300, 84, 6, 'var(--desk)') + R(600, 306, 5, 34, 'var(--desk)') + R(648, 306, 5, 34, 'var(--desk)');
  o += R(572, 246, 32, 52, 'var(--roof2)') + R(574, 248, 28, 48, 'var(--scr)') + R(576, 252, 16, 2, 'var(--cy)') + R(576, 257, 22, 2, 'var(--acc)') + R(576, 262, 12, 2, 'var(--mg)') + R(576, 268, 20, 2, 'var(--leaf)') + R(576, 274, 18, 2, 'var(--cy)') + R(576, 280, 24, 2, 'var(--acc)') + R(586, 298, 4, 4, 'var(--desk)');
  let code = '';
  const cr = rng(3);
  for (let i = 0; i < 14; i++) { const ind = (i % 3) * 6, w = 8 + Math.floor(cr() * 26); code += R(624 + ind, 262 + i * 6, w, 3, ['var(--cy)', 'var(--acc)', 'var(--mg)', 'var(--ink2)'][i % 4]); }
  o += `<clipPath id="scr"><rect x="620" y="258" width="46" height="36"/></clipPath><g transform="translate(322 150) scale(.5)">${R(616, 296, 54, 4, 'var(--roof2)') + R(618, 256, 50, 40, 'var(--roof2)') + R(620, 258, 46, 36, 'var(--scr)')}<g clip-path="url(#scr)"><g class="code">${code}</g></g>${R(620, 258, 46, 36, 'var(--cy)', 'pulse', '; opacity:.08')}</g>`;
  o += R(604, 292, 9, 8, 'var(--ink)') + R(606, 286, 2, 4, 'var(--ink2)', 'steam', '; opacity:.5');
  o += R(648, 299, 44, 4, 'var(--shade)') + R(650, 300, 40, 2, 'var(--cy)', 'pulse', '; opacity:.7');
  o += R(702, 292, 6, 28, 'var(--desk)') + R(676, 316, 32, 5, 'var(--desk)') + R(689, 321, 4, 19, 'var(--desk)') + R(680, 338, 22, 3, 'var(--desk)');
  o += R(686, 290, 14, 26, 'var(--jacket)') + R(696, 284, 8, 12, 'var(--jacket)');
  o += R(687, 276, 12, 14, 'var(--skin)') + R(686, 273, 14, 6, 'var(--hair)') + R(696, 275, 6, 10, 'var(--hair)') + R(684, 275, 4, 6, 'var(--hair)') + R(688, 281, 5, 2, 'var(--cy)');
  o += R(684, 284, 18, 3, 'var(--cy)') + R(682, 282, 3, 7, 'var(--hood)') + R(700, 282, 3, 7, 'var(--hood)');
  o += R(666, 314, 28, 6, 'var(--ink2)', '', '; opacity:.75') + R(664, 320, 6, 18, 'var(--ink2)', '', '; opacity:.75') + R(658, 336, 12, 4, 'var(--ink)');
  o += `<g class="type">${R(688, 292, 6, 10, 'var(--jacket)')}${R(656, 296, 34, 5, 'var(--jacket)')}${R(652, 296, 5, 5, 'var(--skin)')}</g>`;
  o += `<g class="type2">${R(660, 298, 30, 4, 'var(--jacket)', '', '; opacity:.8')}${R(656, 298, 4, 4, 'var(--skin)')}</g>`;
  o += R(768, 266, 4, 74, 'var(--ink2)') + P('758,266 782,266 776,244 764,244', 'var(--warm)', '.95') + R(758, 338, 24, 3, 'var(--ink2)');
  o += R(738, 322, 22, 18, 'var(--wood)') + R(746, 296, 4, 26, 'var(--leaf)') + R(736, 300, 12, 8, 'var(--leaf)') + R(750, 306, 12, 8, 'var(--leaf)') + R(740, 290, 10, 8, 'var(--leaf)');
  o += R(436, 214, 8, 126, 'var(--roof2)') + R(442, 214, 22, 126, 'var(--hood)', '', '; opacity:.45') + R(442, 214, 6, 126, 'var(--hood)', '', '; opacity:.55');
  // living room
  o += R(442, 354, 358, 116, 'var(--room2)') + R(436, 340, 364, 14, 'var(--roof)') + R(442, 340, 358, 3, 'var(--cy)', '', '; opacity:.4');
  o += '<ellipse cx="620" cy="420" rx="200" ry="80" fill="url(#glow)" style="opacity:.6"/>';
  o += R(442, 454, 358, 16, 'var(--wood)', '', '; opacity:.7');
  o += R(470, 404, 130, 28, 'var(--sofa)') + R(466, 424, 138, 24, 'var(--sofa)') + R(466, 414, 10, 36, 'var(--sofa)') + R(594, 414, 10, 36, 'var(--sofa)') + R(486, 410, 22, 16, 'var(--warm)', '', '; opacity:.7') + R(560, 410, 22, 16, 'var(--cy)', '', '; opacity:.5') + R(474, 448, 6, 8, 'var(--wood)') + R(590, 448, 6, 8, 'var(--wood)');
  o += R(622, 440, 62, 6, 'var(--wood)') + R(630, 446, 4, 10, 'var(--wood)') + R(672, 446, 4, 10, 'var(--wood)') + R(646, 430, 10, 10, 'var(--ink)') + R(649, 424, 2, 4, 'var(--ink2)', 'steam', '; opacity:.5');
  o += R(708, 392, 4, 64, 'var(--ink2)') + P('698,392 722,392 716,372 704,372', 'var(--warm)', '.95');
  o += R(738, 396, 50, 34, 'var(--roof2)') + R(741, 399, 44, 28, 'var(--scr)') + R(741, 399, 44, 28, 'var(--cy)', 'fl', '; opacity:.25') + R(758, 430, 10, 6, 'var(--roof2)');
  o += R(470, 368, 34, 22, 'var(--roof2)') + R(473, 371, 28, 16, 'var(--hood)', '', '; opacity:.8');
  o += plate('ABOUT ME');
  o += T(26, 82, 22, 'MONISH', 'var(--shade)', 'start', '; opacity:.75');
  o += T(24, 80, 22, 'MONISH', 'var(--ink)');
  o += T(24, 102, 12, 'SYSTEMS & AI ENGINEER', 'var(--acc)');
  o += T(24, 120, 11, 'AGENTIC ARCHITECTURES - HIGH CONCURRENCY', 'var(--ink2)');
  o += R(24, 130, 190, 20, 'var(--plate)', '', '; stroke:var(--tilebd);stroke-width:1')
    + R(32, 137, 6, 6, '#2fd6a0', 'pulse')
    + T(44, 144, 9, 'ACTIVE - BUILDING SYSTEMS', 'var(--ink)');
  return svg(mode, H, 'A cozy high-rise apartment. A developer types at a desk inside while a cat roams the balcony, which has string lights, plants, a table and a chair and looks out over the skyscrapers in the rain. About me: full-stack developer building AI-enabled systems with agentic architectures. Select to visit the portfolio.', o);
}

// ---------- Slice 2: 2.5D skyline of the last 30 days ----------
function s2(mode, days, stats) {
  const H = 470, base = 372, pitch = 26, w = 18, d = 7;
  let o = bg('g2', '--s2a', '--s2b', H);
  const last = days.slice(-30);
  while (last.length < 30) last.unshift({ date: null, contributionCount: 0 });
  const raw = last.map((x) => x.contributionCount), lvs = bucketLevels(raw);
  const counts = raw.map((c) => Math.min(c, 11)); // building height saturates; the tile still shows the real count
  const mon = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const monthOf = (i) => (last[i].date ? mon[Number(last[i].date.slice(5, 7)) - 1] : '');
  const dayOf = (i) => (last[i].date ? last[i].date.slice(8, 10) : '--');
  const total = stats.count, streakN = stats.days;
  o += '<defs><linearGradient id="hz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--mg);stop-opacity:0"/><stop offset="1" style="stop-color:var(--mg);stop-opacity:.22"/></linearGradient></defs>' + R(0, 220, 800, 152, 'url(#hz)');
  const q0 = rng(8);
  for (let x = 0; x < 800; x += 18 + Math.floor(q0() * 14)) {
    const bw = 14 + Math.floor(q0() * 3) * 6, bh = 50 + Math.floor(q0() * 8) * 16;
    o += R(x, base - bh, bw, bh, 'var(--bld)', '', '; opacity:.7');
    for (let wy = base - bh + 8; wy < base - 8; wy += 12) if (q0() < 0.3) o += R(x + 4, wy, 3, 5, 'var(--win)', 'tw', `;animation-delay:${(-q0() * 3).toFixed(1)}s;opacity:.7`);
  }
  const plane = (y, dur, delay, dir, sc) => {
    let b = R(-190, 2, 190, 1, '#fff', '', '; opacity:.14') + R(-70, 2, 70, 1, '#fff', '', '; opacity:.18')
      + R(0, 0, 30, 5, 'var(--ink)') + R(30, 1, 4, 3, 'var(--ink)') + P('2,0 9,0 5,-8 0,-8', 'var(--ink)') + P('11,5 22,5 16,13 9,13', 'var(--ink2)') + P('14,0 22,0 20,-3 16,-3', 'var(--ink2)') + R(14, 8, 6, 3, 'var(--ink2)');
    for (let k = 0; k < 5; k++) b += R(10 + k * 4, 1, 2, 1, 'var(--cy)');
    b += R(14, 13, 3, 2, '#ff3b3b', 'fl') + R(-1, -9, 2, 2, '#fff', 'tw') + R(29, 5, 2, 2, 'var(--acc)', 'tw', '; animation-delay:-1s');
    return `<g class="${dir > 0 ? 'flyR' : 'flyL'}" style="animation-duration:${dur}s;animation-delay:${delay}s"><g transform="translate(0 ${y}) scale(${dir * sc} ${sc})">${b}</g></g>`;
  };
  o += plane(146, 30, -11, 1, 1) + plane(194, 38, -22, -1, 0.8) + plane(228, 48, -30, 1, 0.6);
  o += '<defs><linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:#fff;stop-opacity:.24"/><stop offset=".55" style="stop-color:#fff;stop-opacity:0"/><stop offset="1" style="stop-color:#000;stop-opacity:.42"/></linearGradient><linearGradient id="fog" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--mg);stop-opacity:0"/><stop offset="1" style="stop-color:var(--mg);stop-opacity:.3"/></linearGradient></defs>';
  const wr = rng(5);
  let glow = '';
  const box = (x, yb, bw, bh, L, dd) => {
    const y = yb - bh, sd = `${x + bw},${yb} ${x + bw + dd},${yb - 4} ${x + bw + dd},${y - 4} ${x + bw},${y}`, tp = `${x},${y} ${x + bw},${y} ${x + bw + dd},${y - 4} ${x + dd},${y - 4}`;
    return R(x, y, bw, bh, L) + R(x, y, bw, bh, 'url(#tg)') + P(sd, L) + P(sd, 'var(--shade)', '.52') + P(tp, L) + P(tp, '#fff', '.25') + R(x, y, 1, bh, '#fff', '', '; opacity:.28') + R(x + bw - 1, y, 1, bh, 'var(--shade)', '', '; opacity:.3');
  };
  const neon = ['var(--mg)', 'var(--cy)', 'var(--acc)'], bws = [16, 18, 20, 18, 22];
  for (let i = 0; i < 30; i++) {
    const n = counts[i], tx = 14 + i * pitch;
    if (raw[i] === 0) {
      o += R(tx + 1, base - 6, 18, 6, 'var(--shade)', '', '; opacity:.55') + R(tx + 1, base - 6, 18, 2, 'var(--acc)', '', '; opacity:.45')
        + R(tx + 5, base - 30, 2, 30, 'var(--ink2)') + R(tx + 1, base - 30, 16, 2, 'var(--ink2)') + R(tx + 14, base - 28, 1, 9, 'var(--ink2)') + R(tx + 13, base - 19, 3, 2, 'var(--ink2)') + R(tx + 5, base - 33, 2, 3, '#ff3b3b', 'fl');
      continue;
    }
    const bw = bws[(i * 3 + n) % 5], x = tx + Math.round((20 - bw) / 2), h = 36 + n * 17, y = base - h, lv = lvs[i], L = `var(--lv${lv})`, nc = neon[i % 3];
    const st = (i * 7 + n) % 6;
    let topY = y;
    if (n >= 7) o += `<ellipse cx="${x + bw / 2 + 3}" cy="${y + h / 2}" rx="26" ry="${h / 2 + 14}" style="fill:var(--lv4);opacity:.12"/>`;
    o += box(x, base, bw, h, L, d);
    if (h >= 70) {
      if (st === 0) { o += R(x + 3, y - 10, 2, 10, 'var(--roof2)') + R(x + bw - 5, y - 10, 2, 10, 'var(--roof2)') + R(x + 2, y - 16, bw - 4, 7, 'var(--roof2)') + R(x + 2, y - 17, bw - 4, 1, '#fff', '', '; opacity:.2') + P(`${x + 2},${y - 16} ${x + bw - 2},${y - 16} ${x + bw / 2},${y - 21}`, 'var(--roof2)'); topY = y - 21; }
      else if (st === 1 || st === 3) { const h2 = Math.round(h * 0.16); o += box(x + 3, y, bw - 6, h2, L, 5); topY = y - h2; if (st === 3) { const h3 = Math.round(h * 0.1); o += box(x + 6, topY, bw - 12, h3, L, 3); topY -= h3; } }
      else if (st === 2) { o += P(`${x},${y} ${x + bw},${y - 12} ${x + bw},${y}`, L) + P(`${x},${y} ${x + bw},${y - 12} ${x + bw},${y}`, '#fff', '.15') + P(`${x + bw},${y - 12} ${x + bw + d},${y - 16} ${x + bw + d},${y - 4} ${x + bw},${y}`, 'var(--shade)', '.5'); topY = y - 12; }
      else if (st === 4) { o += R(x + 3, y - 14, 2, 12, L) + R(x + bw - 5, y - 9, 2, 7, L) + R(x + bw - 8, y - 12, 6, 2, 'var(--ink2)'); topY = y - 14; }
      else { o += R(x + 1, y - 3, bw - 2, 3, 'var(--roof2)') + R(x + 3, y - 2, bw - 6, 1, '#fff', '', '; opacity:.5') + R(x + 1, y - 5, 2, 2, '#ff3b3b', 'fl') + R(x + bw - 3, y - 5, 2, 2, '#ff3b3b', 'fl', '; animation-delay:-1.5s'); topY = y - 5; }
    }
    if (n >= 5) o += R(x + bw / 2, topY - 18, 2, 16, L) + R(x + bw / 2 - 1, topY - 22, 4, 4, '#ff3b3b', 'fl');
    const cols = Math.floor((bw - 3) / 5), sx = x + Math.round((bw - (cols * 5 - 2)) / 2);
    for (let wy = base - 20; wy > y + 5; wy -= 7) {
      const full = wr() < 0.06;
      for (let c = 0; c < cols; c++) {
        const wx = sx + c * 5;
        if (full || wr() < 0.26 + n * 0.05) { const t = wr() < 0.2, k = wr(), cl = k < 0.8 ? 'var(--win)' : k < 0.92 ? 'var(--cy)' : 'var(--mg)'; o += R(wx, wy, 3, 4, cl, t ? 'tw' : '', (full ? ';opacity:.95' : '') + (t ? `;animation-delay:${(-wr() * 3).toFixed(1)}s` : '')); }
        else o += R(wx, wy, 3, 4, 'var(--shade)', '', '; opacity:.28');
      }
      if (wr() < 0.3) o += R(x + bw + 2, wy - 1, 3, 4, 'var(--win)', '', '; opacity:.55');
    }
    if (i % 4 === 1 && h > 90) o += R(x + 2, y + 10, bw - 4, 11, 'var(--plate)', '', '; stroke:' + nc + ';stroke-width:1') + R(x + 4, y + 13, bw - 8, 2, nc, 'pulse') + R(x + 4, y + 17, Math.round((bw - 8) * 0.6), 2, nc, 'pulse', '; animation-delay:-1s');
    if (lv >= 3 && i % 2 === 0) o += R(x + bw + 2, y + 8, 2, Math.min(70, Math.round(h * 0.5)), nc, 'pulse', '; opacity:.9');
    o += R(x, base - 10, bw, 10, 'var(--shade)', '', '; opacity:.6') + R(x + 2, base - 9, bw - 4, 2, nc) + R(x + Math.floor(bw / 2) - 2, base - 6, 4, 6, 'var(--win)', '', '; opacity:.85');
    glow += R(x, base + 1, bw, 3, nc, '', '; opacity:.3');
    if (i === 29) o += `<rect x="${x - 1}" y="${y - 1}" width="${bw + 2}" height="${h + 2}" class="pulse" style="fill:none;stroke:var(--acc);stroke-width:2"/>`;
  }
  o += R(0, base - 46, 800, 46, 'url(#fog)');
  o += R(4, base, 792, 14, 'var(--tilebd)') + R(4, base, 792, 2, 'var(--cy)', '', '; opacity:.6') + R(4, base + 14, 792, 64, 'var(--tile)') + R(4, base + 14, 792, 2, 'var(--shade)', '', '; opacity:.4');
  o += R(4, base + 14, 792, 64, 'var(--shade)', '', '; opacity:.12');
  o += glow;
  for (let i = 0; i < 30; i++) {
    const x = 14 + i * pitch, lv = lvs[i];
    o += R(x - 1, base + 24, w + 4, 22, `var(--lv${lv})`) + R(x - 1, base + 24, w + 4, 2, '#fff', '', '; opacity:.3') + R(x - 1, base + 44, w + 4, 2, 'var(--shade)', '', '; opacity:.4');
    if (raw[i] > 0) o += T(x + w / 2 + 1, base + 40, 11, Math.min(raw[i], 99), lv >= 3 ? 'var(--plate)' : 'var(--ink)', 'middle');
    o += T(x + w / 2 + 1, base + 64, 10, dayOf(i), i === 29 ? 'var(--acc)' : 'var(--ink2)', 'middle');
    if (i === 29) o += `<rect x="${x - 2}" y="${base + 23}" width="${w + 6}" height="24" class="pulse" style="fill:none;stroke:var(--acc);stroke-width:2"/>`;
  }
  o += T(10, base + 11, 10, monthOf(0), 'var(--ink)') + T(14 + 29 * pitch - 6, base + 11, 10, monthOf(29), 'var(--ink)');
  o += T(792, base + 78, 10, 'TODAY', 'var(--acc)', 'end');
  o += rain(33, 24);
  o += plate('ACTIVITY');
  o += R(20, 62, 280, 70, 'var(--plate)', '', '; stroke:var(--tilebd);stroke-width:1.5')
    + R(18, 60, 8, 2, 'var(--cy)') + R(18, 60, 2, 8, 'var(--cy)')
    + R(294, 60, 8, 2, 'var(--cy)') + R(300, 60, 2, 8, 'var(--cy)')
    + R(18, 130, 8, 2, 'var(--cy)') + R(18, 124, 2, 8, 'var(--cy)')
    + R(294, 130, 8, 2, 'var(--cy)') + R(300, 124, 2, 8, 'var(--cy)')
    + R(32, 74, 6, 6, '#2fd6a0', 'pulse')
    + T(44, 80, 10, 'ACTIVITY TELEMETRY', 'var(--cy)')
    + T(32, 98, 12, `last commit ${stats.ago}`, 'var(--ink)')
    + T(32, 117, 11, `${total} contributions - ${streakN} day streak`, 'var(--acc)');
  o += T(10, base + 92, 11, 'last 30 days. taller and brighter means more contributions', 'var(--ink2)');
  return svg(mode, H, `Skyline of the last 30 days of contributions, one building per day from left to right, ${total} in total, ${streakN} day streak, last commit ${stats.ago.toLowerCase()}. Taller, brighter buildings are busier days. Select to view the contribution graph.`, o);
}

// ---------- Slice 3: 2.5D server hall ----------
function s3(mode) {
  const H = 430, r = rng(9);
  let o = bg('g3', '--s3a', '--s3b', H);
  for (let x = 0; x < 800; x += 100) o += R(x, 64, 2, 254, 'var(--shade)', '', '; opacity:.3');
  o += R(0, 0, 800, 64, 'var(--ceil)') + R(0, 64, 800, 4, 'var(--shade)', '', '; opacity:.4');
  o += R(0, 22, 800, 8, 'var(--pipe)') + R(0, 23, 800, 2, '#fff', '', '; opacity:.15') + R(0, 34, 800, 6, 'var(--pipe)', '', '; opacity:.7');
  for (let x = 30; x < 800; x += 90) o += R(x, 18, 6, 26, 'var(--rackbd)');
  o += R(0, 84, 800, 7, 'var(--rackbd)');
  for (let x = 10; x < 800; x += 40) o += R(x, 91, 3, 6, 'var(--rackbd)');
  const cols = ['#3a86ff', '#4de1ff', '#ffd34d', '#2fd6a0', '#ff6b4a', '#b47cff'];
  for (let k = -1; k < 6; k++) {
    const x = 128 + k * 116, y = 142;
    o += B3(x, y, 80, 176, 12, 7, 'var(--ceil)');
    for (let j = 0; j < 6; j++) { o += R(x + 6, y + 8 + j * 28, 68, 22, 'var(--slot)', '', '; opacity:.8'); for (let l = 0; l < 2; l++) o += R(x + 58 + l * 6, y + 14 + j * 28, 3, 3, cols[(k + j + 7) % 6], 'tw', `;animation-delay:${(-r() * 3).toFixed(1)}s`); }
  }
  o += R(0, 318, 800, 22, 'var(--floor)') + R(0, 318, 800, 2, 'var(--cy)', '', '; opacity:.25');
  for (let x = -60; x < 860; x += 60) o += P(`${x},340 ${x + 2},340 ${x + 68},318 ${x + 66},318`, 'var(--rackbd)', '.4');
  o += R(0, 327, 800, 1, 'var(--rackbd)', '', '; opacity:.35') + R(0, 334, 800, 1, 'var(--rackbd)', '', '; opacity:.35');
  o += R(0, 340, 800, 14, 'var(--rackbd)') + R(0, 340, 800, 2, 'var(--cy)', '', '; opacity:.5');
  for (let x = 0; x < 800; x += 40) o += P(`${x},343 ${x + 14},343 ${x + 8},352 ${x - 6},352`, 'var(--acc)', '.5');
  NAMES.forEach((nm, i) => {
    const x = 62 + i * 116, y = 150, rw = 96, rh = 190, col = cols[i];
    o += R(x + rw / 2 - 3, 91, 3, y - 8 - 91, 'var(--cable)') + R(x + rw / 2 + 10, 91, 3, y - 8 - 91, 'var(--cable)', '', '; opacity:.7');
    o += B3(x, y, rw, rh, 14, 8, 'var(--rack)');
    o += R(x + 2, y + 2, rw - 4, rh - 4, 'none', '', '; stroke:var(--rackbd);stroke-width:1') + R(x, y, rw, 5, col);
    o += R(x + 6, y + 12, rw - 12, 18, 'var(--plate)', '', '; stroke:' + col + ';stroke-width:1') + T(x + rw / 2, y + 25, 11, nm, 'var(--ink)', 'middle');
    for (let k = 0; k < 6; k++) {
      const uy = y + 38 + k * 25;
      o += R(x + 6, uy, rw - 12, 20, 'var(--slot)');
      for (let v = 0; v < 5; v++) o += R(x + 12 + v * 6, uy + 14, 4, 2, 'var(--rackbd)');
      for (let l = 0; l < 3; l++) { const on = r() < 0.8; o += R(x + rw - 30 + l * 8, uy + 5, 4, 4, l === 0 ? col : (l === 1 ? '#2fd6a0' : '#ffb347'), on ? 'tw' : '', `;animation-delay:${(-r() * 3).toFixed(1)}s;animation-duration:${(1.5 + r() * 2.5).toFixed(1)}s`); }
    }
    let sv = '';
    for (let j = 0; j < 11; j++) sv += R(2, 12 + j * 16, 10, 2, 'var(--shade)', '', '; opacity:.55');
    o += `<g transform="matrix(1,-.571,0,1,${x + rw},${y})">${sv}${R(5, 176, 4, 4, col, 'tw')}</g>`;
    o += `<g transform="matrix(1,0,14,-8,${x},${y})">${R(10, 0.2, 34, 0.6, 'var(--slot)')}${R(52, 0.2, 34, 0.6, 'var(--slot)')}${R(26, 0.2, 2, 0.6, col, '', '; opacity:.7')}${R(68, 0.2, 2, 0.6, col, '', '; opacity:.7')}</g>`;
    if (i % 2 === 0) o += R(x + rw / 2 + 4, y - 14, 4, 4, '#ff3b3b', 'fl');
  });
  o += R(0, 354, 800, 76, 'var(--s3b)', '', '; opacity:.95');
  for (let x = -10; x < 810; x += 26) o += P(`${x},392 ${x + 16},392 ${x + 14},410 ${x - 2},410`, 'var(--rackbd)', '.6');
  o += R(0, 391, 800, 3, 'var(--track)') + R(0, 409, 800, 4, 'var(--track)') + R(0, 409, 800, 1, '#fff', '', '; opacity:.2');
  let tr = '';
  const cw = 170, gp = 8;
  for (let c = 0; c < 3; c++) {
    const x = c * (cw + gp), isFront = c === 2, isMid = c === 1, isRear = c === 0;
    tr += B3(x, 368, cw, 34, 12, 6, 'var(--train)');
    tr += R(x, 368, cw, 10, 'var(--pipe)') + R(x, 378, cw, 3, 'var(--acc)') + R(x, 381, cw, 1, 'var(--cy)') + R(x, 396, cw, 6, 'var(--shade)');
    tr += R(x + 18, 363, 30, 5, 'var(--pipe)') + R(x + 20, 364, 26, 2, 'var(--shade)') + R(x + cw - 48, 363, 30, 5, 'var(--pipe)') + R(x + cw - 46, 364, 26, 2, 'var(--shade)');
    for (const dx of [x + 14, x + cw - 32]) {
      tr += R(dx, 371, 14, 27, 'var(--shade)') + R(dx + 2, 373, 4, 16, 'var(--win)', '', '; opacity:.85') + R(dx + 8, 373, 4, 16, 'var(--win)', '', '; opacity:.85') + R(dx + 6, 370, 2, 2, '#ff3b3b');
    }
    for (let k = 0; k < 4; k++) {
      const wx = x + 34 + k * 20;
      tr += R(wx, 373, 14, 13, 'var(--shade)') + R(wx + 1, 374, 12, 11, 'var(--win)', '', '; opacity:.9');
      if (k % 2 === 0) tr += R(wx + 3, 379, 6, 6, 'var(--shade)');
    }
    for (const bx of [x + 8, x + cw - 36]) {
      tr += R(bx, 401, 28, 4, 'var(--pipe)') + R(bx + 2, 403, 7, 5, 'var(--shade)') + R(bx + 19, 403, 7, 5, 'var(--shade)') + R(bx + 11, 400, 6, 3, 'var(--acc)');
    }
    tr += R(x + 38, 401, cw - 76, 5, 'var(--slot)') + R(x + 40, 402, cw - 80, 2, 'var(--pipe)');
    if (isMid) {
      tr += P(`${x + 72},368 ${x + 82},352 ${x + 85},352 ${x + 75},368`, 'var(--pipe)') + P(`${x + 98},368 ${x + 88},352 ${x + 85},352 ${x + 95},368`, 'var(--pipe)') + R(x + 76, 350, 18, 2, 'var(--acc)') + R(x + 84, 348, 3, 3, 'var(--cy)', 'fl');
    }
    if (isRear) {
      tr += R(x - 3, 381, 3, 5, '#ff2244', 'pulse') + R(x - 3, 391, 3, 5, '#ff2244', 'pulse') + `<ellipse cx="${x - 10}" cy="387" rx="14" ry="10" style="fill:#ff2244;opacity:.25"/>`;
    }
    if (isFront) {
      const nx = x + cw;
      tr += P(`${nx},368 ${nx + 20},382 ${nx + 20},402 ${nx},402`, 'var(--train)') + P(`${nx},368 ${nx + 20},382 ${nx + 30},376 ${nx + 10},362`, 'var(--pipe)')
        + P(`${nx + 2},371 ${nx + 15},381 ${nx + 15},388 ${nx + 2},388`, 'var(--scr)') + P(`${nx + 4},373 ${nx + 13},381 ${nx + 13},384 ${nx + 4},384`, 'var(--cy)', '.5')
        + R(nx + 5, 385, 3, 2, '#2fd6a0') + R(nx + 10, 385, 3, 2, 'var(--acc)')
        + R(nx + 17, 388, 3, 5, '#ffffff') + R(nx + 17, 396, 3, 4, 'var(--cy)')
        + `<polygon points="${nx + 20},388 ${nx + 150},352 ${nx + 170},424 ${nx + 20},404" style="fill:var(--cy);opacity:.22"/>`
        + `<polygon points="${nx + 20},390 ${nx + 90},372 ${nx + 100},416 ${nx + 20},400" style="fill:#ffffff;opacity:.32"/>`;
    } else {
      for (let g = 0; g < gp; g += 2) tr += R(x + cw + g, 372, 1.5, 26, 'var(--shade)');
    }
  }
  o += `<g class="drift" style="animation-duration:12s">${tr}</g>`;
  o += plate('TECH STACK');
  o += R(180, 18, 300, 34, 'var(--plate)', '', '; stroke:var(--rackbd);stroke-width:1')
    + R(192, 31, 8, 8, '#2fd6a0', 'pulse')
    + T(208, 38, 10, 'HIGH-CONCURRENCY INFRASTRUCTURE', 'var(--cy)')
    + T(208, 48, 8, 'AGENTIC PIPELINES - NEURAL INFERENCE', 'var(--ink2)');
  return svg(mode, H, `A server hall drawn in 2.5D with racks labelled ${NAMES.join(', ')}, and a train passing below. Select to see my repositories.`, o);
}

// ---------- Slice 4: 2.5D vault door ----------
function s4(mode) {
  const H = 390, cx = 400, cy = 206;
  let o = bg('g4', '--s4a', '--s4b', H);
  o += R(0, 0, 800, 300, 'var(--wall)');
  for (let x = 0; x < 800; x += 100) o += R(x, 12, 2, 288, 'var(--shade)', '', '; opacity:.3');
  for (let y = 70; y < 300; y += 64) o += R(0, y, 800, 2, 'var(--shade)', '', '; opacity:.22');
  o += R(0, 0, 800, 12, 'var(--shade)', '', '; opacity:.55');
  for (let i = 0; i < 40; i++) o += P(`${i * 20},0 ${i * 20 + 10},0 ${i * 20 + 10},12 ${i * 20},12`, 'var(--acc)');
  o += R(0, 36, 800, 10, 'var(--pipe)') + R(0, 37, 800, 2, '#fff', '', '; opacity:.18') + R(0, 54, 800, 6, 'var(--pipe)', '', '; opacity:.7');
  for (let x = 50; x < 800; x += 100) o += R(x, 32, 6, 34, 'var(--doorrim)');
  [215, 585].forEach((x) => { o += B3(x - 14, 12, 28, 8, 6, 4, 'var(--doorrim)') + R(x - 10, 20, 20, 4, 'var(--warm)', 'pulse') + P(`${x - 10},24 ${x + 10},24 ${x + 80},338 ${x - 70},338`, 'var(--warm)', '.07', 'pulse'); });
  o += R(0, 300, 800, 38, 'var(--floor)') + R(0, 300, 800, 2, 'var(--cy)', '', '; opacity:.4');
  for (let x = -60; x < 860; x += 60) o += P(`${x},338 ${x + 2},338 ${x + 68},300 ${x + 66},300`, 'var(--rackbd)', '.4');
  o += R(0, 310, 800, 1, 'var(--rackbd)', '', '; opacity:.35') + R(0, 322, 800, 1, 'var(--rackbd)', '', '; opacity:.35');
  o += R(0, 338, 800, 16, 'var(--doorrim)') + R(0, 338, 800, 2, 'var(--cy)', '', '; opacity:.5') + R(0, 354, 800, 36, 'var(--s4b)');
  for (let i = 0; i < 40; i++) o += P(`${i * 20},341 ${i * 20 + 10},341 ${i * 20 + 4},352 ${i * 20 - 6},352`, 'var(--acc)', '.55');
  [130, 246].forEach((hy) => {
    o += B3(266, hy, 36, 24, 10, 6, 'var(--pipe)')
      + R(278, hy + 5, 14, 14, 'var(--chrome)')
      + R(276, hy + 9, 18, 6, 'var(--doorrim)')
      + R(262, hy - 3, 6, 30, 'var(--doorrim)');
    for (let b = 0; b < 3; b++) o += R(263, hy + b * 9, 4, 3, '#fff', '', '; opacity:.4');
  });
  o += B3(296, 96, 208, 204, 14, 8, 'var(--doorrim)') + R(304, 104, 192, 196, 'var(--shade)', '', '; opacity:.85');
  o += P(`${cx + 88},112 ${cx + 100},105 ${cx + 100},293 ${cx + 88},300 ${cx + 60},338 ${cx + 210},338`, 'var(--acc)', '.10', 'pulse');
  o += B3(312, 112, 176, 188, 12, 7, 'var(--door)');
  for (let a = 0; a < 360; a += 22.5) {
    const rad = a * Math.PI / 180, bx = Math.round(cx + Math.cos(rad) * 78 - 4), by = Math.round(cy + Math.sin(rad) * 78 - 4);
    o += R(bx, by, 8, 8, 'var(--chrome)') + R(bx + 1, by + 1, 6, 2, '#fff', '', '; opacity:.6');
  }
  for (let a = 0; a < 360; a += 15) {
    const rad = a * Math.PI / 180, gx = Math.round(cx + Math.cos(rad) * 64 - 2), gy = Math.round(cy + Math.sin(rad) * 64 - 2);
    o += R(gx, gy, 4, 4, 'var(--doorrim)') + R(gx + 1, gy + 1, 2, 2, 'var(--acc)', '', '; opacity:.5');
  }
  o += R(cx - 36, cy - 40, 18, 18, 'var(--doorrim)') + R(cx - 34, cy - 38, 14, 14, 'var(--shade)') + R(cx - 32, cy - 36, 10, 5, 'var(--haz)') + R(cx - 28, cy - 35, 2, 8, '#ff3b3b');
  o += R(cx + 18, cy - 40, 18, 18, 'var(--doorrim)') + R(cx + 20, cy - 38, 14, 14, 'var(--shade)') + R(cx + 22, cy - 36, 10, 5, '#2fd6a0') + R(cx + 26, cy - 35, 2, 8, '#2fd6a0');
  o += R(cx - 48, cy - 58, 96, 12, 'var(--plate)', '', '; stroke:var(--doorrim);stroke-width:1') + T(cx, cy - 50, 8, 'SEAL: ARMED - 100%', 'var(--acc)', 'middle');
  o += R(cx - 56, cy - 56, 112, 112, 'var(--shade)', '', '; opacity:.3');
  let spokes = '';
  for (let s = 0; s < 3; s++) {
    const ang = s * 60;
    spokes += `<rect x="${cx - 3}" y="${cy - 48}" width="6" height="96" transform="rotate(${ang} ${cx} ${cy})" fill="var(--cy)"/>`;
    spokes += `<rect x="${cx - 5}" y="${cy - 50}" width="10" height="6" transform="rotate(${ang} ${cx} ${cy})" fill="var(--chrome)"/>`;
    spokes += `<rect x="${cx - 5}" y="${cy + 44}" width="10" height="6" transform="rotate(${ang} ${cx} ${cy})" fill="var(--chrome)"/>`;
  }
  o += `<g class="spin">${spokes}<circle cx="${cx}" cy="${cy}" r="34" fill="none" stroke="var(--cy)" stroke-width="4"/><circle cx="${cx}" cy="${cy}" r="14" fill="var(--doorrim)" stroke="var(--chrome)" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="4" fill="var(--acc)"/></g>`;
  o += R(cx - 12, cy - 12, 24, 24, 'var(--plate)', '', '; stroke:var(--cy);stroke-width:3');
  o += P(`${cx + 88},112 ${cx + 100},105 ${cx + 100},293 ${cx + 88},300`, 'var(--acc)', '.55', 'pulse');
  o += B3(266, 318, 268, 20, 12, 7, 'var(--door)') + R(274, 324, 252, 2, 'var(--shade)', '', '; opacity:.3');
  for (let i = 0; i < 17; i++) {
    const hx = 270 + i * 16;
    o += P(`${hx},320 ${hx + 8},320 ${hx},336 ${hx - 8},336`, 'var(--haz)', '.85');
  }
  o += R(cx - 110, 310, 220, 10, 'var(--mg)', '', '; opacity:.08');
  o += B3(540, 178, 38, 66, 6, 4, 'var(--plate)') + R(544, 184, 30, 10, 'var(--scr)') + R(546, 187, 18, 4, '#2fd6a0', 'pulse') + R(544, 198, 30, 20, 'var(--scr)');
  o += R(548, 201, 22, 14, '#2fd6a0', '', '; opacity:.3') + R(546, 206, 26, 2, '#2fd6a0', 'pulse');
  for (let k = 0; k < 6; k++) o += R(546 + (k % 3) * 9, 222 + Math.floor(k / 3) * 9, 6, 6, 'var(--doorrim)');
  o += R(568, 240, 6, 6, '#2fd6a0', 'tw');
  o += R(40, 60, 8, 66, 'var(--pipe)') + R(41, 60, 2, 66, '#fff', '', '; opacity:.18') + R(34, 116, 20, 8, 'var(--doorrim)') + R(36, 126, 16, 6, 'var(--mg)') + R(40, 122, 8, 12, 'var(--mg)');
  o += B3(84, 92, 34, 34, 5, 3, 'var(--plate)') + R(88, 96, 26, 26, 'var(--scr)') + R(100, 108, 2, 12, 'var(--acc)', 'pulse') + R(96, 106, 10, 2, 'var(--cy)', '', '; opacity:.5');
  o += R(98, 126, 6, 22, 'var(--pipe)') + R(60, 144, 82, 6, 'var(--pipe)') + R(60, 145, 82, 1, '#fff', '', '; opacity:.18');
  for (let k = 0; k < 3; k++) {
    const x = 24 + k * 44, y = 176;
    o += B3(x, y, 38, 124, 8, 5, 'var(--door)');
    if (k === 1) o += R(x + 3, y + 3, 32, 118, 'var(--shade)') + R(x + 6, y + 60, 26, 3, 'var(--cy)', 'pulse') + R(x + 6, y + 90, 26, 3, 'var(--acc)', 'pulse', '; animation-delay:-1s');
    else { for (let j = 0; j < 4; j++) o += R(x + 6, y + 10 + j * 6, 26, 2, 'var(--shade)', '', '; opacity:.6'); o += R(x + 30, y + 62, 3, 12, 'var(--cy)') + R(x + 11, y + 96, 16, 8, 'var(--plate)') + R(x + 14, y + 99, 4, 2, 'var(--acc)'); }
  }
  o += R(184, 120, 48, 48, 'var(--shade)', '', '; opacity:.5') + R(184, 120, 48, 3, 'var(--doorrim)') + R(184, 165, 48, 3, 'var(--doorrim)') + R(184, 120, 3, 48, 'var(--doorrim)') + R(229, 120, 3, 48, 'var(--doorrim)');
  o += `<g class="fan">${R(206, 124, 4, 40, 'var(--cy)', '', '; opacity:.7')}${R(188, 142, 40, 4, 'var(--cy)', '', '; opacity:.7')}</g>`;
  o += R(606, 86, 176, 14, 'var(--plate)', '', '; stroke:var(--doorrim);stroke-width:1') + T(694, 97, 10, 'ACCESS NODE', 'var(--cy)', 'middle');
  const mq = rng(88);
  for (let j = 0; j < 2; j++) for (let i = 0; i < 3; i++) {
    const x = 610 + i * 58, y = 106 + j * 46;
    o += B3(x, y, 50, 36, 8, 5, 'var(--plate)') + R(x + 3, y + 3, 44, 30, 'var(--scr)');
    for (let l = 0; l < 5; l++) o += R(x + 6, y + 7 + l * 5, 8 + Math.floor(mq() * 26), 2, ['var(--cy)', 'var(--acc)', 'var(--mg)'][Math.floor(mq() * 3)], mq() < 0.3 ? 'tw' : '', `;animation-delay:${(-mq() * 3).toFixed(1)}s`);
  }
  o += P('722,222 738,206 754,222 738,238', 'var(--acc)') + R(737, 212, 2, 12, 'var(--plate)') + R(737, 227, 2, 2, 'var(--plate)');
  o += R(604, 258, 6, 42, 'var(--doorrim)') + R(778, 258, 6, 42, 'var(--doorrim)');
  o += B3(600, 250, 190, 8, 14, 9, 'var(--door)') + R(640, 243, 42, 5, 'var(--roof2)') + R(690, 238, 9, 10, 'var(--ink)') + R(692, 232, 2, 4, 'var(--ink2)', 'steam', '; opacity:.5');
  o += B3(622, 268, 36, 32, 8, 5, 'var(--doorrim)') + R(628, 278, 26, 2, 'var(--shade)', '', '; opacity:.5') + R(628, 286, 26, 2, 'var(--shade)', '', '; opacity:.5');
  for (let k = 0; k < 3; k++) o += B3(676, 292 - k * 8, 40, 8, 6, 4, k % 2 ? 'var(--mg)' : 'var(--cy)');
  o += R(748, 248, 14, 52, '#e8384f') + R(749, 248, 3, 52, '#fff', '', '; opacity:.25') + R(759, 248, 3, 52, 'var(--shade)', '', '; opacity:.35') + R(750, 240, 10, 8, 'var(--ink2)') + R(760, 244, 10, 3, 'var(--ink2)') + R(751, 258, 8, 10, 'var(--plate)');
  const dq = rng(61);
  for (let i = 0; i < 14; i++) o += R(Math.floor(190 + dq() * 50) + (i % 2) * 370, Math.floor(100 + dq() * 200), 2, 2, 'var(--warm)', 'steam', `;animation-delay:${(-dq() * 3).toFixed(1)}s;opacity:.6`);
  o += R(300, 12, 4, 12, 'var(--ink2)') + R(496, 12, 4, 12, 'var(--ink2)');
  o += B3(270, 24, 260, 52, 10, 6, 'var(--plate)') + R(276, 30, 248, 40, 'none', '', '; stroke:var(--mg);stroke-width:2');
  o += `<g class="fl" style="filter:drop-shadow(0 0 6px var(--mg))">${T(cx, 64, 34, 'PORTFOLIO', 'var(--mg)', 'middle')}</g>`;
  o += `<g class="bob">${T(cx - 8, 87, 12, 'ENTER', 'var(--acc)', 'middle')}${P(`${cx + 20},80 ${cx + 30},80 ${cx + 25},87`, 'var(--acc)')}</g>`;
  o += plate('PORTFOLIO');
  return svg(mode, H, 'A vault door drawn in 2.5D under a neon portfolio sign, with a keypad, a landing step and light leaking from its seam. Select to visit the portfolio.', o);
}

// data: { days: [{date, contributionCount}], lastCommitAt: ISO string | null }
// A bare array of days (the shape of fixtures/sample-contributions.json) is accepted too.
export function renderScenes(data, now = Date.now()) {
  const { days, lastCommitAt = null } = Array.isArray(data) ? { days: data } : data;
  const stats = { ago: agoLabel(lastCommitAt, now), count: commits30(days), days: streak(days) };
  const out = {};
  for (const mode of ['dark', 'light']) {
    out[`about-${mode}.svg`] = s1(mode);
    out[`activity-${mode}.svg`] = s2(mode, days, stats);
    out[`stack-${mode}.svg`] = s3(mode);
    out[`portfolio-${mode}.svg`] = s4(mode);
  }
  return out;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [, , dataPath, outDir] = process.argv;
  if (!dataPath || !outDir) {
    console.error('Usage: node render-scenes.mjs <data.json> <output-dir>');
    process.exit(1);
  }
  for (const [name, svgText] of Object.entries(renderScenes(JSON.parse(readFileSync(dataPath, 'utf8'))))) writeFileSync(join(outDir, name), svgText);
}
