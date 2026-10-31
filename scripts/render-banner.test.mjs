import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { mix, px, rng } from './pixel.mjs';
import { renderBanner, renderDivider } from './render-banner.mjs';
import { renderStack, renderNow, renderCity, renderFooter, commits30, streak, agoLabel, bucketLevels, STACK } from './render-panels.mjs';
import { renderAll } from './render-all.mjs';

const days = (counts) => counts.map((contributionCount, i) => ({ date: `2026-10-${String(i + 1).padStart(2, '0')}`, contributionCount }));
const sample = JSON.parse(readFileSync(new URL('../fixtures/sample-profile.json', import.meta.url), 'utf8')).days;
const wellFormed = (svg, name) => {
  assert.ok(svg.startsWith('<svg '), `${name}: must be an SVG document`);
  assert.ok(svg.trimEnd().endsWith('</svg>'), `${name}: closing tag present`);
  assert.ok(!/NaN|undefined/.test(svg), `${name}: no NaN/undefined coordinates`);
  assert.ok(svg.includes('prefers-reduced-motion'), `${name}: must honour reduced motion`);
};

// pixel toolkit
{
  assert.strictEqual(mix('#000000', '#ffffff', 0.5), '#808080');
  assert.strictEqual(px(4).width('AB'), 11, 'two 5-wide glyphs plus one gap column');
  assert.strictEqual(px(4).width('A B'), 15, 'a space advances 4 columns');
  const a = rng(1), b = rng(1);
  assert.strictEqual(a(), b(), 'rng must be deterministic');
  console.log('pixel toolkit: PASS');
}

// stats come only from the calendar and a timestamp
{
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
}

// renderers
{
  for (const mode of ['dark', 'light']) {
    const banner = renderBanner(mode);
    wellFormed(banner, `banner-${mode}`);
    assert.ok(banner.includes('#e00847'), 'jacket colour present');
    assert.ok(!banner.includes('MONISH'), 'the name sign was removed from the banner');
    assert.strictEqual(banner.includes('class="bolt"'), mode === 'dark', 'lightning is dark-theme only');
    assert.notStrictEqual(renderBanner(mode, { commits30: 0 }), renderBanner(mode, { commits30: 200 }), 'commit volume must change the windows');
    assert.strictEqual(renderBanner(mode), renderBanner(mode), 'deterministic');

    const stack = renderStack(mode);
    wellFormed(stack, `stack-${mode}`);
    for (const name of STACK.flat()) assert.ok(stack.includes(name), `stack names ${name}`);

    const now = renderNow(mode, { ago: '2H AGO', count: 41, days: 6 });
    wellFormed(now, `now-${mode}`);
    assert.ok(now.includes('2h ago') && now.includes('41 contributions') && now.includes('6 day streak'), 'now label carries the stats');
    assert.ok(renderNow(mode, { days: 1 }).includes('1 day streak'));

    wellFormed(renderDivider(mode), `divider-${mode}`);
    const footer = renderFooter(mode);
    wellFormed(footer, `footer-${mode}`);
    assert.ok(footer.includes('full-stack developer building AI-enabled systems with agentic architectures') && footer.includes('visit the portfolio'));
    const city = renderCity(sample, mode);
    wellFormed(city, `city-${mode}`);
    assert.ok(city.includes('contributions in the last year'));
    assert.notStrictEqual(city, renderCity([], mode), 'activity must change the skyline');
  }
  assert.notStrictEqual(renderBanner('dark'), renderBanner('light'));
  console.log('renderers: PASS');
}

// renderAll writes one continuous picture per theme and accepts either data shape.
// (No asset-drift check: the committed files carry live stats, so they change every run.)
{
  const files = renderAll({ days: sample, lastCommitAt: '2026-11-01T06:00:00Z' }, Date.parse('2026-11-01T12:00:00Z'));
  assert.deepStrictEqual(Object.keys(files).sort(), ['profile-dark.svg', 'profile-light.svg']);
  for (const [name, svg] of Object.entries(files)) {
    wellFormed(svg, name);
    assert.strictEqual((svg.match(/<svg /g) || []).length, 10, `${name}: outer svg + 5 scenes + 4 joins`);
    assert.ok(svg.includes('6h ago') && svg.includes('Select to visit the portfolio'), `${name}: label carries stats and the link`);
    assert.strictEqual((svg.match(/<style>/g) || []).length, 1, `${name}: animation CSS embedded once`);
    for (const id of ['cp', 'cpf', 'nr']) assert.strictEqual((svg.match(new RegExp(`id="${id}"`, 'g')) || []).length, 1, `${name}: clipPath #${id} defined once`);
  }
  assert.deepStrictEqual(Object.keys(renderAll(sample)).sort(), Object.keys(files).sort());
  console.log('renderAll: PASS');
}

console.log('render tests complete');
