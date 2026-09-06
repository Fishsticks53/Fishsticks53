import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { PIXEL, snap, BUILDINGS, SIGNS } from './render-banner.mjs';

// snap: rounds to the nearest multiple of PIXEL (4)
{
  assert.strictEqual(PIXEL, 4);
  assert.strictEqual(snap(5), 4);
  assert.strictEqual(snap(6), 8);
  assert.strictEqual(snap(0), 0);
  console.log('snap: PASS');
}

// BUILDINGS: a full-width, pixel-grid-aligned skyline
{
  assert.strictEqual(BUILDINGS.length, 15);
  const totalWidth = BUILDINGS.reduce((sum, b) => sum + b.width, 0);
  assert.strictEqual(totalWidth, 800, 'buildings must span the full 800px banner width');
  for (const b of BUILDINGS) {
    assert.strictEqual(b.x % PIXEL, 0, `building x=${b.x} not grid-aligned`);
    assert.strictEqual(b.width % PIXEL, 0, `building width=${b.width} not grid-aligned`);
    assert.strictEqual(b.height % PIXEL, 0, `building height=${b.height} not grid-aligned`);
    assert.ok(b.height <= 140, `building height=${b.height} exceeds the 140px cap (must leave clear sky for the name/tagline text)`);
  }
  console.log('BUILDINGS: PASS');
}

// SIGNS: each references a valid building index and has a distinct stagger delay
{
  assert.strictEqual(SIGNS.length, 4);
  const delays = SIGNS.map((s) => s.delay);
  assert.strictEqual(new Set(delays).size, 4, 'signs must have distinct delays so they flicker out of sync');
  for (const s of SIGNS) {
    assert.ok(s.buildingIndex >= 0 && s.buildingIndex < BUILDINGS.length, `sign references invalid building index ${s.buildingIndex}`);
  }
  console.log('SIGNS: PASS');
}

console.log('Task 1 tests complete');

import { renderBanner } from './render-banner.mjs';

{
  const svg = renderBanner();

  assert.ok(svg.startsWith('<svg'), 'output must be an SVG document');
  assert.ok(svg.includes('</svg>'), 'output must be well-formed (closing tag present)');
  assert.ok(!svg.includes('NaN'), 'no coordinate may be NaN');

  const buildingRects = svg.match(/class="building"/g) || [];
  assert.strictEqual(buildingRects.length, BUILDINGS.length, `expected ${BUILDINGS.length} building rects, got ${buildingRects.length}`);

  const signRects = svg.match(/class="sign/g) || [];
  assert.strictEqual(signRects.length, SIGNS.length, `expected ${SIGNS.length} sign rects, got ${signRects.length}`);

  assert.ok(svg.includes('filter="url(#glow)"'), 'signs must use the glow-bloom filter');
  assert.ok(svg.includes('class="walker"'), 'walking figure must be present');
  assert.ok(svg.includes('MONISH'), 'name text must be present');
  assert.ok(svg.includes('Full-stack developer building AI-enabled systems with agentic architectures.'), 'tagline text must be present');

  console.log('renderBanner: PASS');
}

// assets/banner.svg must match what renderBanner() produces right now, or it has drifted
// from the committed generator source.
{
  // Normalize line endings: git's autocrlf can check this file out as CRLF on Windows,
  // while renderBanner() always produces LF - that's a checkout-environment difference,
  // not real content drift.
  const committed = readFileSync(new URL('../assets/banner.svg', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
  const fresh = renderBanner();
  assert.strictEqual(committed, fresh, 'assets/banner.svg is stale — re-run `node scripts/render-banner.mjs assets/banner.svg` and commit the result');
  console.log('asset drift: PASS');
}

console.log('Task 2 tests complete');
