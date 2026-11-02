import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { renderScenes } from './render-scenes.mjs';
import { commits30, streak, agoLabel, bucketLevels } from './stats.mjs';

const sample = JSON.parse(readFileSync(new URL('../fixtures/sample-profile.json', import.meta.url), 'utf8')).days;
const now = Date.parse('2026-11-01T12:00:00Z');
const files = renderScenes({ days: sample, lastCommitAt: '2026-11-01T06:00:00Z' }, now);

const expected = ['about', 'activity', 'stack', 'portfolio'].flatMap((s) => ['dark', 'light'].map((m) => `${s}-${m}.svg`));
assert.deepStrictEqual(Object.keys(files).sort(), expected.sort());

// Size budget (bytes, uncompressed). The scenes shipped at roughly 70-100 KB each; fail loudly on a regression.
const BUDGET = { about: 90_000, activity: 90_000, stack: 120_000, portfolio: 45_000 };

for (const [name, svg] of Object.entries(files)) {
  assert.ok(svg.startsWith('<svg ') && svg.trimEnd().endsWith('</svg>'), `${name}: svg document`);
  assert.ok(!/NaN|undefined|var\(--/.test(svg), `${name}: no NaN/undefined/unresolved tokens`);
  assert.ok(!svg.includes('<text'), `${name}: text must be drawn as shapes, not fonts`);
  assert.ok(svg.includes('prefers-reduced-motion'), `${name}: honours reduced motion`);
  assert.ok(svg.includes('Select to'), `${name}: label says where it links`);
  assert.ok(svg.length < BUDGET[name.split('-')[0]], `${name}: ${svg.length} bytes exceeds its size budget`);

  // every glyph <use> resolves to a <path id> in <defs>, and ids are unique
  const ids = [...svg.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
  assert.strictEqual(new Set(ids).size, ids.length, `${name}: ids are unique`);
  for (const [, ref] of svg.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(ref), `${name}: ${ref} is defined`);
  for (const [, ref] of svg.matchAll(/url\(#([^)]+)\)/g)) assert.ok(ids.includes(ref), `${name}: ${ref} is defined`);

  // well-formed: balanced tags, no bare ampersands
  const stack = [];
  for (const [t, close, tag, self] of [...svg.matchAll(/<(\/?)([A-Za-z][\w:-]*)[^>]*?(\/?)>/g)].map((m) => [m[0], m[1], m[2], m[3]])) {
    if (self) continue;
    if (close) assert.strictEqual(stack.pop(), tag, `${name}: balanced </${tag}>`);
    else stack.push(tag);
  }
  assert.strictEqual(stack.length, 0, `${name}: all tags closed`);
  assert.ok(!/&(?!amp;|lt;|quot;|#)/.test(svg), `${name}: ampersands escaped`);
}
assert.ok(files['activity-dark.svg'].includes('last commit 6h ago'), 'activity label carries the last-commit time');
assert.ok(files['about-dark.svg'].includes('Systems &amp; AI Engineer'), 'about label carries the profile headline');
assert.notStrictEqual(files['activity-dark.svg'], renderScenes([], now)['activity-dark.svg'], 'activity must react to contributions');
assert.notStrictEqual(files['about-dark.svg'], files['about-light.svg'], 'themes differ');
assert.deepStrictEqual(Object.keys(renderScenes(sample, now)).sort(), expected.sort(), 'bare day array accepted');
assert.deepStrictEqual(renderScenes({ days: sample, lastCommitAt: '2026-11-01T06:00:00Z' }, now), files, 'rendering is deterministic');
console.log('render-scenes: PASS');

// stats come only from the calendar and a timestamp
const days = (counts) => counts.map((contributionCount, i) => ({ date: `2026-10-${String(i + 1).padStart(2, '0')}`, contributionCount }));
assert.strictEqual(commits30(days([1, 2, 3])), 6);
assert.strictEqual(streak(days([0, 2, 3, 1])), 3);
assert.strictEqual(streak(days([2, 3, 1, 0])), 3, 'an empty today does not break the streak');
assert.strictEqual(streak(days([0, 0])), 0);
assert.strictEqual(agoLabel('2026-11-01T11:59:30Z', now), 'JUST NOW');
assert.strictEqual(agoLabel('2026-11-01T10:00:00Z', now), '2H AGO');
assert.strictEqual(agoLabel('2026-10-28T12:00:00Z', now), '4D AGO');
assert.strictEqual(agoLabel(null, now), '--');
assert.strictEqual(agoLabel('not a date', now), '--');
const levels = bucketLevels([0, 0, 1, 2, 3, 4, 5, 6, 7, 8]);
assert.strictEqual(levels[0], 0);
assert.strictEqual(levels[9], 4, 'highest count maps to level 4');
assert.deepStrictEqual(bucketLevels([0, 1, 2, 3, 4, 5, 6, 7, 11]), [0, 1, 1, 2, 2, 3, 3, 4, 4], 'bands match the design (1-2, 3-4, 5-6, 7+)');
assert.deepStrictEqual(bucketLevels([0, 3, 30]), [0, 1, 4], 'bands stretch for very busy days');
assert.deepStrictEqual(bucketLevels([0, 0]), [0, 0]);
console.log('stats: PASS');
