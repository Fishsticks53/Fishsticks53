
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

const BAR_HEIGHT_UNIT = 8; // px per level
const MAX_BAR_HEIGHT = 4 * BAR_HEIGHT_UNIT; // maximum lift for level-4 bars

function barPolygons(x, y, level) {
  const h = level * BAR_HEIGHT_UNIT;
  const topColor = LEVEL_COLORS[level].top;
  const leftColor = shade(topColor, 0.7);
  const rightColor = shade(topColor, 0.45);

  const w = TILE_W / 2;
  const d = TILE_H / 2;

  // Top face (diamond), lifted by bar height
  const top = [
    [x, y - h],
    [x + w, y + d - h],
    [x, y + 2 * d - h],
    [x - w, y + d - h],
  ];
  // Left face
  const left = [
    [x - w, y + d - h],
    [x, y + 2 * d - h],
    [x, y + 2 * d],
    [x - w, y + d],
  ];
  // Right face
  const right = [
    [x, y + 2 * d - h],
    [x + w, y + d - h],
    [x + w, y + d],
    [x, y + 2 * d],
  ];

  const pts = (arr) => arr.map(([px, py]) => `${px.toFixed(2)},${py.toFixed(2)}`).join(' ');

  return { top: pts(top), left: pts(left), right: pts(right), topColor, leftColor, rightColor };
}

function renderBar(day, level, col, row, totalGrowDuration) {
  const { x, y } = isoProject(col, row);
  // Shift y-coordinates up by MAX_BAR_HEIGHT to ensure no bar's top face goes negative
  const { top, left, right, topColor, leftColor, rightColor } = barPolygons(x, y + MAX_BAR_HEIGHT, level);
  const delay = (col * 0.02).toFixed(2);

  const glow = level === 4
    ? `<polygon points="${top}" fill="${topColor}" filter="url(#glow)" class="glow-bar" style="animation-delay:${totalGrowDuration.toFixed(2)}s"/>`
    : '';

  return `<g class="bar" style="animation-delay:${delay}s">
    <polygon points="${left}" fill="${leftColor}"/>
    <polygon points="${right}" fill="${rightColor}"/>
    <polygon points="${top}" fill="${topColor}"/>
    ${glow}
  </g>`;
}

export function renderSVG(days) {
  const counts = days.map((d) => d.contributionCount);
  const levels = bucketLevels(counts);

  const cols = 53;
  const rows = 7;

  // Total grow-in duration: last column's delay + animation duration
  const totalGrowDuration = (cols - 1) * 0.02 + 0.4;

  const bars = days.map((day, i) => {
    const col = Math.floor(i / rows);
    const row = i % rows;
    return renderBar(day, levels[i], col, row, totalGrowDuration);
  }).join('\n');

  const width = isoProject(cols, 0).x - isoProject(0, rows).x + TILE_W * 2;
  const height = isoProject(cols, rows).y + TILE_H * 4 + MAX_BAR_HEIGHT;
  const offsetX = isoProject(0, rows).x * -1 + TILE_W;
  const offsetY = TILE_H;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width.toFixed(0)} ${height.toFixed(0)}">
  <defs>
    <radialGradient id="bg" cx="50%" cy="20%" r="80%">
      <stop offset="0%" stop-color="#141b3a"/>
      <stop offset="100%" stop-color="#0a0e1a"/>
    </radialGradient>
    <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="3" result="blur">
        <animate attributeName="stdDeviation" values="2;5;2" dur="2.4s" repeatCount="indefinite"/>
      </feGaussianBlur>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <style>
      .bar { opacity: 0; animation: grow-in 0.4s ease-out forwards; transform-box: fill-box; transform-origin: bottom; }
      @keyframes grow-in { from { opacity: 0; transform: scaleY(0); } to { opacity: 1; transform: scaleY(1); } }
      .glow-bar { opacity: 0; animation: pulse 2.4s ease-in-out infinite; }
      @keyframes pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.9; } }
    </style>
  </defs>
  <rect x="0" y="0" width="${width.toFixed(0)}" height="${height.toFixed(0)}" fill="url(#bg)"/>
  <g transform="translate(${offsetX.toFixed(2)}, ${offsetY.toFixed(2)})">
    ${bars}
  </g>
</svg>`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , inputPath, outputPath] = process.argv;
  if (!inputPath || !outputPath) {
    console.error('Usage: node render-isometric.mjs <input.json> <output.svg>');
    process.exit(1);
  }
  const fs = await import('node:fs');
  const days = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  fs.writeFileSync(outputPath, renderSVG(days));
}
