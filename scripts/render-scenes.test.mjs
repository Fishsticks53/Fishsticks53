import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { renderScenes } from './render-scenes.mjs';

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
