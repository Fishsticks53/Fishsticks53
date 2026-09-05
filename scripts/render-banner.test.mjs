import assert from 'node:assert';
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
