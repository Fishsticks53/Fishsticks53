
export const LEVEL_COLORS = [
  { top: '#141b2e' },
  { top: '#3a2a6d' },
  { top: '#7b2fbf' },
  { top: '#e0218a' },
  { top: '#ff2ec4' },
];

export function bucketLevels(counts) {
  const positives = counts.filter((c) => c > 0).sort((a, b) => a - b);
  if (positives.length === 0) return counts.map(() => 0);

  const q = (p) => positives[Math.min(positives.length - 1, Math.floor(p * (positives.length - 1)))];
  const thresholds = [q(0.25), q(0.5), q(0.75)];

  return counts.map((count) => {
    if (count <= 0) return 0;
    if (count <= thresholds[0]) return 1;
    if (count <= thresholds[1]) return 2;
    if (count <= thresholds[2]) return 3;
    return 4;
  });
}

export function shade(hex, factor) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 0xff) * factor);
  const g = Math.round(((n >> 8) & 0xff) * factor);
  const b = Math.round((n & 0xff) * factor);
  const clamp = (v) => Math.max(0, Math.min(255, v));
  const toHex = (v) => clamp(v).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

const TILE_W = 12;
const TILE_H = 6;

export function isoProject(col, row) {
  return {
    x: (col - row) * (TILE_W / 2),
    y: (col + row) * (TILE_H / 2),
  };
}
