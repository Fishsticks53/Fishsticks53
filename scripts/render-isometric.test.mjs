import assert from 'node:assert';
import { bucketLevels, shade, isoProject } from './render-isometric.mjs';

// bucketLevels: zeros stay level 0, positive counts split into quartiles 1-4
{
  const counts = [0, 0, 1, 2, 3, 4, 5, 6, 7, 8];
  const levels = bucketLevels(counts);
  assert.strictEqual(levels.length, counts.length);
  assert.strictEqual(levels[0], 0);
  assert.strictEqual(levels[1], 0);
  assert.ok(levels[2] >= 1 && levels[2] <= 4);
  assert.strictEqual(levels[9], 4, 'highest count must map to level 4');
  console.log('bucketLevels: PASS');
}

// shade: darkens a hex color by a brightness factor
{
  assert.strictEqual(shade('#ff0000', 0.5), '#800000');
  assert.strictEqual(shade('#ffffff', 0.45), '#737373');
  console.log('shade: PASS');
}

// isoProject: standard 2:1 isometric projection, tile 12x6
{
  const origin = isoProject(0, 0);
  assert.deepStrictEqual(origin, { x: 0, y: 0 });
  const oneRight = isoProject(1, 0);
  assert.deepStrictEqual(oneRight, { x: 6, y: 3 });
  const oneDown = isoProject(0, 1);
  assert.deepStrictEqual(oneDown, { x: -6, y: 3 });
  console.log('isoProject: PASS');
}

console.log('Task 1 tests complete');

import { renderSVG } from './render-isometric.mjs';

{
  // 53 weeks x 7 days = 371 synthetic days, deterministic pseudo-random counts
  const days = Array.from({ length: 371 }, (_, i) => ({
    date: new Date(2025, 0, 1 + i).toISOString().slice(0, 10),
    contributionCount: (i * 37) % 11,
  }));

  const svg = renderSVG(days);

  assert.ok(svg.startsWith('<svg'), 'output must be an SVG document');
  assert.ok(svg.includes('</svg>'), 'output must be well-formed (closing tag present)');
  assert.ok(!svg.includes('NaN'), 'no coordinate may be NaN');

  const barGroups = svg.match(/<g class="bar"/g) || [];
  assert.strictEqual(barGroups.length, 371, `expected 371 bar groups, got ${barGroups.length}`);

  console.log('renderSVG: PASS');
}

console.log('Task 2 tests complete');
