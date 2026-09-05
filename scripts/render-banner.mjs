export const PIXEL = 4;

export function snap(n) {
  return Math.round(n / PIXEL) * PIXEL;
}

// A full-width (800px) skyline, heights capped at 140 so the top ~60px of the
// 200px-tall banner stays clear sky for the name/tagline text.
export const BUILDINGS = [
  { x: 0, width: 60, height: 80 },
  { x: 60, width: 40, height: 120 },
  { x: 100, width: 56, height: 60 },
  { x: 156, width: 48, height: 140 },
  { x: 204, width: 64, height: 92 },
  { x: 268, width: 40, height: 140 },
  { x: 308, width: 52, height: 72 },
  { x: 360, width: 60, height: 132 },
  { x: 420, width: 44, height: 100 },
  { x: 464, width: 68, height: 140 },
  { x: 532, width: 48, height: 80 },
  { x: 580, width: 56, height: 120 },
  { x: 636, width: 40, height: 60 },
  { x: 676, width: 64, height: 140 },
  { x: 740, width: 60, height: 92 },
];

// Signs mounted on 4 of the 15 buildings, staggered so they don't flicker in unison.
export const SIGNS = [
  { buildingIndex: 1, color: '#ff2ec4', delay: 0 },
  { buildingIndex: 4, color: '#00e5ff', delay: 0.6 },
  { buildingIndex: 7, color: '#7b2fbf', delay: 1.2 },
  { buildingIndex: 11, color: '#e0218a', delay: 1.8 },
];
