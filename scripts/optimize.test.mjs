import assert from 'node:assert';
import { themeScene } from './optimize.mjs';
import { R, P } from './draw.mjs';
import { T, textWidth } from './font.mjs';

const render = (inner) => themeScene({ h: 100, label: 'test', inner }, 'dark');
const paths = (svg) => (svg.match(/<path /g) ?? []).length;
const A = 'var(--acc)', B = 'var(--cy)';

// same-paint rects merge into one path
assert.strictEqual(paths(render(R(0, 0, 4, 4, A) + R(10, 0, 4, 4, A))), 1, 'adjacent same-paint rects merge');

// a shape hops back over a non-overlapping shape of another paint to join its group
{
  const svg = render(R(0, 0, 4, 4, A) + R(10, 10, 4, 4, B) + R(20, 0, 4, 4, A));
  assert.strictEqual(paths(svg), 2, 'hoisted over a disjoint shape');
  assert.ok(svg.indexOf('fill="#ffb347"') < svg.indexOf('fill="#4de1ff"'), 'stacking order preserved for the rest');
}

// ...but never over an overlapping one, which would change the stacking order
assert.strictEqual(paths(render(R(0, 0, 4, 4, A) + R(2, 2, 4, 4, B) + R(0, 0, 4, 4, A))), 3, 'blocked by an overlapping shape');

// translucent shapes blend where they overlap, so overlapping ones stay separate; disjoint ones merge
assert.strictEqual(paths(render(R(0, 0, 4, 4, A, '', '; opacity:.5') + R(2, 2, 4, 4, A, '', '; opacity:.5'))), 2, 'overlapping translucent shapes stay separate');
assert.strictEqual(paths(render(R(0, 0, 4, 4, A, '', '; opacity:.5') + R(10, 2, 4, 4, A, '', '; opacity:.5'))), 1, 'disjoint translucent shapes merge');

// polygons merge, with winding normalised so overlapping opaque ones union rather than cancel
{
  const svg = render(P('0,0 10,0 10,10', A) + P('0,0 10,10 10,0', A));
  assert.strictEqual(paths(svg), 1);
  assert.ok(!/fill-rule="evenodd"/.test(svg));
}

// zero-area shapes draw nothing and are dropped
assert.strictEqual(paths(render(R(0, 0, 0, 4, A) + R(0, 0, 4, 4, B))), 1, 'zero-width rect dropped');

// animated shapes only merge with identical animation settings; SMIL children keep the element individual
assert.strictEqual(paths(render(R(0, 0, 4, 4, A, 'tw', ';animation-delay:-1s') + R(10, 0, 4, 4, A, 'tw', ';animation-delay:-1s'))), 1);
assert.strictEqual(paths(render(R(0, 0, 4, 4, A, 'tw', ';animation-delay:-1s') + R(10, 0, 4, 4, A, 'tw', ';animation-delay:-2s'))), 2);
assert.strictEqual(paths(render('<rect x="0" y="0" width="4" height="4" style="fill:var(--acc)"><animateMotion dur="1s" path="M0,0 L9,9"/></rect>' + R(10, 0, 4, 4, A))), 1, 'only the static rect becomes a path');
assert.ok(render('<rect x="0" y="0" width="4" height="4" style="fill:var(--acc)"><animateMotion dur="1s" path="M0,0 L9,9"/></rect>').includes('<animateMotion'), 'SMIL child survives');

// inside a scaled group only plain shapes merge; inside a group whose class moves it nothing merges
assert.strictEqual(paths(render(`<g transform="scale(.66)">${R(0, 0, 4, 4, A) + R(10, 0, 4, 4, A) + R(20, 0, 4, 4, A, 'pulse') + R(30, 0, 4, 4, A, 'pulse')}</g>`)), 1, 'plain shapes merge, animated ones stay rects');
assert.strictEqual(paths(render(`<g class="drift">${R(0, 0, 4, 4, A) + R(10, 0, 4, 4, A)}</g>`)), 0, 'moving groups are left alone');

// unknown colour tokens are an error, not a silent black
assert.throws(() => render(R(0, 0, 4, 4, 'var(--nope)')), /unknown colour token/);

// CSS: only the rules a scene uses are shipped
{
  const withTw = render(R(0, 0, 4, 4, A, 'tw'));
  assert.ok(withTw.includes('@keyframes tw') && !withTw.includes('@keyframes rain'), 'only used keyframes');
  assert.ok(!render(R(0, 0, 4, 4, A)).includes('<style>'), 'no style block when nothing animates');
}

// text is shapes: <use> glyphs, kerning applied, anchors honoured
{
  const t = T(100, 50, 10, 'AV', 'var(--ink)', 'start');
  assert.strictEqual((t.match(/<use /g) ?? []).length, 2);
  assert.ok(textWidth(10, 'AV') < textWidth(10, 'A') + textWidth(10, 'V'), 'AV is kerned');
  assert.ok(T(100, 50, 10, 'AB', 'var(--ink)', 'middle').includes(`translate(${+(100 - textWidth(10, 'AB') / 2).toFixed(2)} 50)`), 'centre anchor');
  assert.ok(render(T(10, 20, 12, 'Hi there')).includes('<defs><path id='), 'glyph outlines are defined once');
  assert.strictEqual(textWidth(10, 'a   b'), textWidth(10, 'a b'), 'whitespace collapses like SVG text');
}
console.log('optimize: PASS');
