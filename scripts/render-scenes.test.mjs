import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { renderScenes } from './render-scenes.mjs';
import { commits30, streak, agoLabel, bucketLevels } from './stats.mjs';

const sample = JSON.parse(readFileSync(new URL('../fixtures/sample-profile.json', import.meta.url), 'utf8')).days;
const files = renderScenes({ days: sample, lastCommitAt: '2026-11-01T06:00:00Z' }, Date.parse('2026-11-01T12:00:00Z'));

const expected = ['about', 'activity', 'stack', 'portfolio'].flatMap((s) => ['dark', 'light'].map((m) => `${s}-${m}.svg`));
assert.deepStrictEqual(Object.keys(files).sort(), expected.sort());

for (const [name, svg] of Object.entries(files)) {
  assert.ok(svg.startsWith('<svg ') && svg.trimEnd().endsWith('</svg>'), `${name}: svg document`);
  assert.ok(!/NaN|undefined/.test(svg), `${name}: no NaN/undefined`);
  assert.ok(!svg.includes('<text'), `${name}: text must be drawn as shapes, not fonts`);
  assert.ok(svg.includes('prefers-reduced-motion'), `${name}: honours reduced motion`);
  assert.ok(svg.includes('Select to'), `${name}: label says where it links`);
}
assert.ok(files['activity-dark.svg'].includes('last commit 6h ago'), 'activity label carries the last-commit time');
assert.notStrictEqual(files['activity-dark.svg'], renderScenes([])['activity-dark.svg'], 'activity must react to contributions');
assert.notStrictEqual(files['about-dark.svg'], files['about-light.svg'], 'themes differ');
assert.deepStrictEqual(Object.keys(renderScenes(sample)).sort(), expected.sort(), 'bare day array accepted');
console.log('render-scenes: PASS');

// stats come only from the calendar and a timestamp (moved here from the removed banner tests)
const days = (counts) => counts.map((contributionCount, i) => ({ date: `2026-10-${String(i + 1).padStart(2, '0')}`, contributionCount }));
assert.strictEqual(commits30(days([1, 2, 3])), 6);
assert.strictEqual(streak(days([0, 2, 3, 1])), 3);
assert.strictEqual(streak(days([2, 3, 1, 0])), 3, 'an empty today does not break the streak');
assert.strictEqual(streak(days([0, 0])), 0);
const now = Date.parse('2026-11-01T12:00:00Z');
assert.strictEqual(agoLabel('2026-11-01T11:59:30Z', now), 'JUST NOW');
assert.strictEqual(agoLabel('2026-11-01T10:00:00Z', now), '2H AGO');
assert.strictEqual(agoLabel('2026-10-28T12:00:00Z', now), '4D AGO');
assert.strictEqual(agoLabel(null, now), '--');
assert.strictEqual(agoLabel('not a date', now), '--');
const levels = bucketLevels([0, 0, 1, 2, 3, 4, 5, 6, 7, 8]);
assert.strictEqual(levels[0], 0);
assert.strictEqual(levels[9], 4, 'highest count maps to level 4');
console.log('stats: PASS');
