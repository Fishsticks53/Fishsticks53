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

  // Verify no bar polygon has negative y-coordinates (checks for clipping at top)
  const pointsMatches = svg.match(/points="([^"]+)"/g) || [];
  for (const pointsAttr of pointsMatches) {
    const points = pointsAttr.match(/[\d.-]+,[\d.-]+/g) || [];
    for (const point of points) {
      const [, yStr] = point.split(',');
      const y = parseFloat(yStr);
      assert.ok(y >= 0, `coordinate y=${y} is negative; bars are being clipped at the top`);
    }
  }

  console.log('renderSVG: PASS');
}

console.log('Task 2 tests complete');

// Integration: parseResponse output feeds directly into renderSVG (the fetch/render seam)
{
  const { parseResponse } = await import('./fetch-contributions.mjs');

  const fixture = {
    data: {
      user: {
        contributionsCollection: {
          contributionCalendar: {
            weeks: [
              { contributionDays: [{ date: '2025-01-01', contributionCount: 3 }, { date: '2025-01-02', contributionCount: 0 }, { date: '2025-01-03', contributionCount: 5 }, { date: '2025-01-04', contributionCount: 1 }, { date: '2025-01-05', contributionCount: 2 }, { date: '2025-01-06', contributionCount: 0 }, { date: '2025-01-07', contributionCount: 4 }] },
              { contributionDays: [{ date: '2025-01-08', contributionCount: 6 }, { date: '2025-01-09', contributionCount: 0 }, { date: '2025-01-10', contributionCount: 1 }, { date: '2025-01-11', contributionCount: 3 }, { date: '2025-01-12', contributionCount: 2 }, { date: '2025-01-13', contributionCount: 0 }, { date: '2025-01-14', contributionCount: 7 }] },
              { contributionDays: [{ date: '2025-01-15', contributionCount: 2 }, { date: '2025-01-16', contributionCount: 1 }, { date: '2025-01-17', contributionCount: 0 }] },
            ],
          },
        },
      },
    },
  };

  const days = parseResponse(fixture);
  const svg = renderSVG(days);
  const barGroups = svg.match(/<g class="bar"/g) || [];
  assert.strictEqual(barGroups.length, days.length, 'renderSVG bar count must match parseResponse day count');
  console.log('fetch -> render integration: PASS');
}

console.log('Task 4 tests complete');
