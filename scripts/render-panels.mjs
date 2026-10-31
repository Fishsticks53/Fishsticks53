import { U, W, rng, mix, THEMES, ACC, px, P4, cell, neon, city, fog, skyRows, streetRain, vignette, VIGNETTE_DEF, svgDoc } from './pixel.mjs';

// ---- stats derived from the contribution calendar (no repo names anywhere) ----

export function commits30(days) {
  return days.slice(-30).reduce((a, d) => a + d.contributionCount, 0);
}

// Consecutive active days ending today, or yesterday if today has nothing yet.
export function streak(days) {
  let i = days.length - 1;
  if (i >= 0 && days[i].contributionCount === 0) i--;
  let n = 0;
  for (; i >= 0 && days[i].contributionCount > 0; i--) n++;
  return n;
}

export function agoLabel(iso, now = Date.now()) {
  if (!iso) return '--';
  const m = Math.floor((now - Date.parse(iso)) / 60000);
  if (!(m >= 0)) return '--';
  if (m < 2) return 'JUST NOW';
  if (m < 60) return `${m}M AGO`;
  const h = Math.floor(m / 60);
  return h < 48 ? `${h}H AGO` : `${Math.floor(h / 24)}D AGO`;
}

// Quartile buckets over the non-zero days; zero stays level 0.
export function bucketLevels(counts) {
  const positives = counts.filter((c) => c > 0).sort((a, b) => a - b);
  if (positives.length === 0) return counts.map(() => 0);
  const q = (p) => positives[Math.min(positives.length - 1, Math.floor(p * (positives.length - 1)))];
  const t = [q(0.25), q(0.5), q(0.75)];
  return counts.map((c) => (c <= 0 ? 0 : c <= t[0] ? 1 : c <= t[1] ? 2 : c <= t[2] ? 3 : 4));
}

// ---- Stack: neon signs bolted to a rainy brick wall, lit walls, wet street reflections ----

export const STACK = [['TYPESCRIPT', 'REACT', 'PYTHON'], ['FASTAPI', 'PYTORCH', 'LANGCHAIN']];

export function renderStack(mode = 'dark') {
  const q = P4, T = THEMES[mode], dark = mode === 'dark', acc = ACC[mode];
  const r = rng(61), RH = 56, G = 40;
  const cols = dark ? [acc, '#1fe9ff', '#ff3fc8'] : [ACC.light, '#00748f', '#b0108a'];
  const X0 = 6, X1 = 194, WW = X1 - X0, wall = T.mid;
  let o = skyRows(T, RH, r, dark);
  o += city(r, { T, accC: acc, win: false, top: G, h0: 18, h1: 36, w0: 6, w1: 12, fill: T.far });
  o += `<path d="${cell(X0, 3, WW, G - 3)}" fill="${wall}"/>`;
  let br = '';
  for (let y = 7; y < G; y += 4) br += cell(X0, y, WW, 1);
  o += `<path d="${br}" fill="${dark ? mix(wall, '#000000', 0.22) : mix(wall, '#ffffff', 0.14)}"/>`;
  o += `<path d="${cell(X0, 3, 2, G - 3) + cell(X1 - 2, 3, 2, G - 3)}" fill="${T.near}"/><path d="${cell(X1 - 6, 4, 1, G - 4) + cell(X1 - 7, 12, 3, 1) + cell(X1 - 7, 26, 3, 1)}" fill="${T.rail}"/>`;
  o += `<path d="${cell(X0, 3, WW, 1)}" fill="${acc}" opacity=".5"/>`;
  const refl = [];
  let n = 0, glows = '', signs = '';
  STACK.forEach((row, ri) => {
    const y = ri ? 23 : 7;
    const ws = row.map((s) => q.width(s) + 6);
    const gap = 8;
    const total = ws.reduce((a, b) => a + b) + gap * (row.length - 1);
    let x = 10 + Math.floor((174 - total) / 2);
    signs += `<path d="${cell(X0 + 3, y - 3, X1 - X0 - 10, 1)}" fill="${T.rail}"/>`;
    row.forEach((s, i) => {
      const w = ws[i], c = cols[(i + ri) % 3], core = dark ? mix(c, '#ffffff', 0.5) : c;
      const L = q.letters(s, x + 3, y + 3, 1);
      glows += `<ellipse cx="${(x + w / 2) * U}" cy="${(y + 6) * U}" rx="${(w / 2 + 9) * U}" ry="${11 * U}" fill="${c}" opacity="${dark ? 0.17 : 0.07}"/>`;
      signs += `<path d="${cell(x + 3, y - 3, 1, 3) + cell(x + w - 4, y - 3, 1, 3)}" fill="${T.rail}"/><path d="${cell(x, y, w, 13)}" fill="${T.plate}"/>`;
      signs += `<path d="${cell(x, y, w, 1) + cell(x, y + 12, w, 1) + cell(x, y, 1, 13) + cell(x + w - 1, y, 1, 13)}" fill="${c}"${dark ? ' filter="url(#gs)"' : ''} opacity=".9"/>`;
      signs += neon(L, c, core, mode, 'gs', n % 2 ? 1 : -1, -n * 1.7);
      refl.push(`<path d="${L.join('')}" fill="${c}"/>`);
      n++;
      x += w + gap;
    });
  });
  o += `<g filter="url(#fs)">${glows}</g>` + signs;
  o += `<rect y="${G * U}" width="${W * U}" height="${(RH - G) * U}" fill="${T.near}"/><rect y="${G * U}" width="${W * U}" height="${U / 2}" fill="${acc}" opacity=".5"/>`;
  o += `<clipPath id="cp"><rect y="${(G + 1) * U}" width="${W * U}" height="${(RH - G - 1) * U}"/></clipPath><g clip-path="url(#cp)"><g class="shim" transform="translate(0 ${2 * G * U}) scale(1 -1)">${refl.join('')}</g></g>`;
  [[40, 46], [110, 50], [160, 47]].forEach(([x, y], i) => {
    o += `<ellipse class="ripple" style="animation-delay:${-i * 0.9}s" cx="${x * U}" cy="${y * U}" rx="10" ry="2.5" stroke="${acc}"/>`;
  });
  o += streetRain(r, T);
  if (dark) o += vignette(RH);
  const defs = '<filter id="gs" x="-10%" y="-40%" width="120%" height="180%"><feGaussianBlur stdDeviation="3"/></filter>'
    + '<filter id="fs" x="-20%" y="-30%" width="140%" height="160%"><feGaussianBlur stdDeviation="9"/></filter>' + VIGNETTE_DEF;
  return svgDoc({ rows: RH, label: `Tech stack as neon signs on a rainy brick wall: ${STACK.flat().join(', ')}`, defs, body: o });
}

// ---- Now: a dot-matrix LED billboard on a rooftop ----
// The LED board stays dark in both themes, like the real thing.

export function renderNow(mode = 'dark', { ago = '--', count = 0, days = 0 } = {}) {
  const T = THEMES[mode], dark = mode === 'dark', acc = ACC[mode];
  const r = rng(73), RH = 66;
  const q = px(4, 1), LED = ACC.dark, LEDc = mix(LED, '#ffffff', 0.5);
  const BX = 6, BW = 188, BY = 5, BH = 53;
  const fogCol = dark ? mix(T.skyB, '#8fa6ff', 0.35) : '#ffffff';
  let o = skyRows(T, RH, r, dark);
  o += city(r, { T, accC: acc, win: false, top: 61, h0: 24, h1: 50, w0: 6, w1: 12, fill: T.far });
  o += fog(r, fogCol, dark ? 0.25 : 0.45, 60, 52, 'fn');
  o += city(r, { T, accC: acc, win: true, top: 63, h0: 10, h1: 34, w0: 6, w1: 12, fill: T.mid, lit: 0.1, acc: 0.05, dimP: 0.22 });
  if (dark) o += `<ellipse cx="${100 * U}" cy="${32 * U}" rx="${110 * U}" ry="${30 * U}" fill="${LED}" opacity=".12" filter="url(#fn)"/>`;
  o += `<path d="${cell(1, 30, 1, 31) + cell(198, 34, 1, 27)}" fill="${T.near}"/><rect class="bl" x="0" y="${28 * U}" width="${3 * U}" height="${2 * U}" fill="${acc}"/><rect class="bl b1" x="${197 * U}" y="${32 * U}" width="${3 * U}" height="${2 * U}" fill="${acc}"/>`;
  const dx = BX + 3, dy = BY + 3, dw = BW - 6, dh = BH - 6;
  o += `<path d="${cell(BX, BY, BW, BH)}" fill="${T.near}"/><path d="${cell(BX, BY, BW, 1) + cell(BX, BY + BH - 1, BW, 1) + cell(BX, BY, 1, BH) + cell(BX + BW - 1, BY, 1, BH)}" fill="${acc}" opacity=".6"/>`;
  o += `<path d="${cell(dx, dy, dw, dh)}" fill="#05060f"/><rect x="${dx * U}" y="${dy * U}" width="${dw * U}" height="${dh * U}" fill="url(#lp)"/>`;
  const lines = [['FOCUS:', 'AI CODE EVALUATION'], ['LAST COMMIT:', ago], ['CONTRIBS 30D:', String(count)], ['STREAK:', `${days} ${days === 1 ? 'DAY' : 'DAYS'}`]];
  lines.forEach(([a, b], i) => {
    const y = 12 + i * 11, xv = 10 + q.width(a + ' ') + 1;
    o += neon(q.letters(a, 10, y, 1), LED, LEDc, 'dark', 'gn', i === 2 ? 3 : -1, 0);
    o += neon(q.letters(b, xv, y, 1), LEDc, '#ffffff', 'dark', 'gn');
  });
  o += `<path class="bl" d="${cell(155, 25, 2, 2)}" fill="#ff5a4d"/><path d="${q.letters('LIVE', 160, 23, 1).join('')}" fill="#8f97c9"/>`;
  o += `<path d="${cell(26, 58, 3, 3) + cell(160, 58, 3, 3)}" fill="${T.near}"/>`;
  o += `<rect y="${61 * U}" width="${W * U}" height="${(RH - 61) * U}" fill="${T.near}"/><rect y="${61 * U}" width="${W * U}" height="${U / 2}" fill="${acc}" opacity=".5"/>`;
  let wd = '';
  for (let i = 0; i < 10; i++) wd += cell(8 + i * 19 + Math.floor(r() * 5), 63);
  o += `<path d="${wd}" fill="${T.warm}" opacity=".8"/>`;
  o += streetRain(r, T);
  if (dark) o += vignette(RH);
  const defs = '<pattern id="lp" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="3" height="3" fill="#161a36"/></pattern>'
    + '<filter id="gn" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation="3"/></filter>'
    + '<filter id="fn" x="-50%" y="-100%" width="200%" height="300%"><feGaussianBlur stdDeviation="9"/></filter>' + VIGNETTE_DEF;
  const label = `Rooftop LED billboard: focus on AI code evaluation, last commit ${ago.toLowerCase()}, ${count} contributions in 30 days, ${days} day streak`;
  return svgDoc({ rows: RH, label, defs, body: o });
}

// ---- Contributions drawn as a city: one building per week, lit windows for active days ----

export function renderCity(days, mode = 'dark') {
  const q = px(3), dark = mode === 'dark';
  const lv = dark ? ['#1c2145', '#7a5a2a', '#d8912a', '#ffcf7a', '#fff1b8'] : ['#aab3d2', '#e0b36a', '#d08a1c', '#a35800', '#7a3f00'];
  const base = dark ? '#12152e' : '#c4cbe0';
  const CW = 266, CH = 38, gy = CH - 1;
  const levels = bucketLevels(days.map((d) => d.contributionCount));
  const weeks = [];
  for (let i = 0; i < levels.length; i += 7) weeks.push(levels.slice(i, i + 7));
  const shown = weeks.slice(-53);
  while (shown.length < 53) shown.unshift([]);
  let o = '';
  shown.forEach((week, w) => {
    const act = week.filter(Boolean).sort((a, b) => b - a);
    const sum = act.reduce((a, b) => a + b, 0);
    const h = Math.min(34, 4 + sum * 2), x = w * 5, top = gy - h;
    o += `<path d="${q.cell(x, top, 4, h)}" fill="${base}"/>`;
    const rows = Math.max(1, Math.floor((h - 3) / 3));
    let k = 0;
    for (let rr = 0; rr < rows; rr++) {
      for (let cc = 0; cc < 2; cc++) {
        const lvl = k < act.length ? act[k] : 0;
        k++;
        o += `<path d="${q.cell(x + cc * 2, gy - 3 - rr * 3, 1, 1)}" fill="${lv[lvl]}"/>`;
      }
    }
  });
  o += `<path d="${q.cell(0, gy, CW, 1)}" fill="${ACC[mode]}" opacity=".5"/>`;
  const total = days.reduce((a, d) => a + d.contributionCount, 0);
  return svgDoc({ width: CW * 3, height: CH * 3, label: `Contribution graph drawn as a city: one building per week, lit windows for active days, ${total} contributions in the last year`, body: o });
}
