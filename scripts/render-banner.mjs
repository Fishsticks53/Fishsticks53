import { U, W, H, rng, mix, THEMES, ACC, cell as c, city, streetRain, fog, skyRows, vignette, VIGNETTE_DEF, svgDoc } from './pixel.mjs';

// Rooftop at night: parallax city, fog, searchlight, drone, lightning (dark theme), and
// you and a cat on the ledge. `commits30` lights more skyline windows the busier you've been.
export function renderBanner(mode = 'dark', { commits30 = 41 } = {}) {
  const T = THEMES[mode], acc = ACC[mode], dark = mode === 'dark';
  const r = rng(37);
  const base = { T, accC: acc, win: true };
  const litWindows = Math.min(0.3, 0.06 + commits30 / 260);
  let o = skyRows(T, H, r, dark);
  o += `<ellipse cx="${100 * U}" cy="${50 * U}" rx="${120 * U}" ry="${22 * U}" fill="${acc}" opacity="${dark ? 0.16 : 0.12}" filter="url(#fg)"/>`;
  if (dark) o += `<g class="sweep"><polygon points="${20 * U},${49 * U} ${70 * U},0 ${100 * U},0" fill="url(#sl)"/></g>`;
  o += city(r, { ...base, top: 50, h0: 12, h1: 32, w0: 6, w1: 12, fill: T.far, win: false });
  const fogCol = dark ? mix(T.skyB, '#8fa6ff', 0.35) : '#ffffff';
  o += fog(r, fogCol, dark ? 0.3 : 0.5, 70, 40, 'fg');
  o += city(r, { ...base, top: 52, h0: 8, h1: 26, w0: 6, w1: 12, fill: T.mid, lit: litWindows, acc: 0.05, dimP: 0.22 });
  // One tall tower on the right, with an aircraft light on top.
  o += city(r, { ...base, top: 50, h0: 49, h1: 49, w0: 9, w1: 9, from: 150, to: 151, fill: T.near, lit: 0.14, acc: 0.05, dimP: 0.25 });
  o += `<rect class="bl b2" x="${153 * U}" y="0" width="${3 * U}" height="${U}" fill="${acc}"/>`;
  o += fog(r, fogCol, dark ? 0.22 : 0.4, 45, 47, 'fg');
  o += `<g transform="translate(0 ${16 * U})"><g class="drone"><path d="${c(0, 0, 2, 1) + c(3, 0, 2, 1) + c(1, 1, 3, 1)}" fill="${T.fig}"/><rect class="bl" x="${2 * U}" y="${2 * U}" width="${U}" height="${U}" fill="${acc}"/></g></g>`;

  // Roof, antenna, water tower, AC unit, vent.
  o += `<rect y="${50 * U}" width="${W * U}" height="${10 * U}" fill="${T.near}"/><rect y="${50 * U}" width="${W * U}" height="${2 * U}" fill="${mix(T.near, acc, 0.18)}"/><rect y="${50 * U}" width="${W * U}" height="${U / 2}" fill="${acc}" opacity=".55"/>`;
  o += `<path d="${c(18, 30, 1, 20)}" fill="${T.near}"/><rect class="bl" x="${17 * U}" y="${28 * U}" width="${3 * U}" height="${2 * U}" fill="${acc}"/>`;
  o += `<path d="${c(30, 38, 8, 6) + c(31, 44, 1, 6) + c(36, 44, 1, 6)}" fill="${T.near}"/>`;
  o += `<path d="${c(132, 45, 12, 5)}" fill="${T.near}"/><path d="${c(134, 46, 8, 1)}" fill="${T.dim}"/>`;
  o += `<path d="${c(62, 44, 2, 6)}" fill="${T.near}"/>`;
  for (let i = 0; i < 3; i++) o += `<rect class="steam" style="animation-delay:${-i * 1.1}s" x="${(62 + i * 0.5) * U}" y="${42 * U}" width="${U * 2}" height="${U * 2}" fill="${T.fig}"/>`;

  // Laptop and its glow spill.
  o += `<ellipse cx="${92 * U}" cy="${46 * U}" rx="${14 * U}" ry="${8 * U}" fill="${T.warm}" opacity="${dark ? 0.14 : 0.07}" filter="url(#fg)"/>`;
  o += `<path d="${c(84, 43, 8, 6)}" fill="${T.mid}"/><path d="${c(83, 49, 10, 1)}" fill="${T.dim}"/><rect x="${87 * U}" y="${45 * U}" width="${2 * U}" height="${2 * U}" fill="${T.warm}"${dark ? ' filter="url(#gl)"' : ''}/>`;

  // You: slim profile turned toward the laptop. Black hair, glasses, #e00847 jacket.
  const JK = '#e00847';
  const SK = dark ? '#d9a37f' : '#c58f6c';
  const HR = dark ? '#0a0a12' : '#15191f';
  const PN = dark ? '#1a1f3a' : '#3a4166';
  o += `<path d="${c(97, 35, 3, 1) + c(96, 36, 5, 1) + c(98, 37, 3, 1) + c(100, 38, 1, 1) + c(99, 39, 1, 1)}" fill="${HR}"/>`;
  o += `<path d="${c(96, 37, 2, 1) + c(96, 39, 3, 1) + c(97, 40, 2, 1)}" fill="${SK}"/>`;
  o += `<path d="${c(96, 38, 4, 1)}" fill="#0b0b12"/><rect x="${96 * U}" y="${38 * U}" width="${U}" height="${U}" fill="${T.warm}"/>`;
  o += `<path d="${c(95, 41, 7, 1) + c(96, 42, 6, 5) + c(93, 45, 4, 1)}" fill="${JK}"/><path d="${c(96, 41, 3, 1)}" fill="${mix(JK, '#ffffff', 0.25)}"/><path d="${c(96, 43, 2, 3)}" fill="${mix(JK, '#000000', 0.2)}"/><path d="${c(92, 45, 1, 1)}" fill="${SK}"/>`;
  o += `<path d="${c(96, 47, 6, 1) + c(92, 48, 10, 2)}" fill="${PN}"/><path d="${c(100, 36, 1, 1)}" fill="#2b3260"/>`;
  if (dark) o += `<path d="${c(102, 41, 1, 6)}" fill="${acc}" opacity=".55"/>`;

  // Mug and cat.
  o += `<path d="${c(107, 47, 3, 3) + c(110, 48, 1, 1)}" fill="${T.fig}"/>`;
  for (let i = 0; i < 2; i++) o += `<rect class="steam" style="animation-delay:${-i * 1.6}s" x="${(108 + i) * U}" y="${45 * U}" width="${U}" height="${U}" fill="${T.fig}"/>`;
  const cat = mix(T.fig, T.near, 0.5);
  o += `<path d="${c(116, 43, 1, 1) + c(120, 43, 1, 1) + c(116, 44, 5, 2) + c(115, 46, 7, 4)}" fill="${cat}"/>`;
  o += `<path class="eye" d="${c(117, 44) + c(119, 44)}" fill="${acc}"/>`;
  o += `<g class="tail"><path d="${c(122, 48, 3, 1) + c(124, 46, 1, 2)}" fill="${cat}"/></g>`;

  // Wet roof: puddle, ripples, splashes, then rain over everything.
  o += `<ellipse cx="${154 * U}" cy="${56 * U}" rx="${22 * U}" ry="${3 * U}" fill="${acc}" opacity=".16"/>`;
  [[148, 55], [155, 57], [160, 56]].forEach(([x, y], i) => {
    o += `<ellipse class="ripple" style="animation-delay:${-i * 0.9}s" cx="${x * U}" cy="${y * U}" rx="10" ry="2.5" stroke="${acc}"/>`;
  });
  for (let g = 0; g < 3; g++) {
    let d = '';
    for (let i = 0; i < 6; i++) d += c(Math.floor(r() * W), 51 + Math.floor(r() * 8), 2, 1);
    o += `<path class="splash" style="animation-delay:${-g * 0.3}s" d="${d}" fill="${T.rain}"/>`;
  }
  o += streetRain(r, T);
  if (dark) {
    const pts = [[60, 0], [59, 4], [61, 8], [58, 13], [60, 18], [57, 24]];
    let b = '';
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
      b += c(x0, y0, 1, y1 - y0) + c(Math.min(x0, x1), y1, Math.abs(x1 - x0) + 1, 1);
    }
    o += `<rect class="flash" width="${W * U}" height="${H * U}" fill="#cfe0ff"/><path class="bolt" d="${b}" fill="#f2f6ff"/>`;
    o += vignette(H);
  }
  const defs = '<filter id="gl" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation="5"/></filter>'
    + '<filter id="fg" x="-50%" y="-100%" width="200%" height="300%"><feGaussianBlur stdDeviation="9"/></filter>'
    + `<linearGradient id="sl" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${acc}" stop-opacity=".32"/><stop offset="1" stop-color="${acc}" stop-opacity="0"/></linearGradient>`
    + VIGNETTE_DEF;
  return svgDoc({
    rows: H,
    label: 'Pixel-art rainy rooftop at night: a figure in glasses and a red jacket at a laptop, with a mug and a cat on the ledge, a city skyline behind',
    defs,
    body: o,
  });
}

// Thin rooftop skyline used between README sections.
export function renderDivider(mode = 'dark') {
  const T = THEMES[mode], acc = ACC[mode];
  const r = rng(6);
  let o = city(r, { T, accC: acc, win: true, top: 12, h0: 2, h1: 9, w0: 4, w1: 10, fill: T.silh, lit: 0.1, acc: 0.06, dimP: 0 });
  o += `<path d="${c(120, 0, 1, 4)}" fill="${T.silh}"/><rect class="bl" x="${119 * U}" y="0" width="${3 * U}" height="${U}" fill="${acc}"/>`;
  o += `<rect y="${12 * U - U / 2}" width="${W * U}" height="${U / 2}" fill="${acc}" opacity=".45"/>`;
  return svgDoc({ rows: 12, label: 'Rooftop skyline divider', body: o });
}
