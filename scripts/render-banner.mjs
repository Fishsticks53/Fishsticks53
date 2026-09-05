import { pathToFileURL } from 'node:url';

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

const VIEW_WIDTH = 800;
const VIEW_HEIGHT = 200;

function renderBuilding(b) {
  const y = VIEW_HEIGHT - b.height;
  // A lit window on buildings tall enough to plausibly have one, fixed relative offset (deterministic, no randomness).
  const window = b.height > 80
    ? `<rect class="window" x="${b.x + 8}" y="${y + 12}" width="4" height="4" fill="#7b2fbf" fill-opacity="0.6"/>`
    : '';
  return `<rect class="building" x="${b.x}" y="${y}" width="${b.width}" height="${b.height}" fill="#1a1030"/>${window}`;
}

function renderSign(sign) {
  const b = BUILDINGS[sign.buildingIndex];
  const y = VIEW_HEIGHT - b.height;
  const x = snap(b.x + b.width / 2 - 8);
  return `<rect class="sign glow-bar" x="${x}" y="${y + 8}" width="16" height="10" fill="${sign.color}" filter="url(#glow)" style="animation-delay:${sign.delay.toFixed(2)}s"/>`;
}

function renderWalker() {
  // A small blocky sprite (head/body/legs), no limb animation - it just walks and bobs.
  return `<g class="walker">
    <rect x="0" y="0" width="4" height="4" fill="#ff2ec4"/>
    <rect x="0" y="4" width="4" height="6" fill="#ff2ec4"/>
    <rect x="0" y="10" width="2" height="4" fill="#ff2ec4"/>
    <rect x="2" y="10" width="2" height="4" fill="#ff2ec4"/>
  </g>`;
}

export function renderBanner() {
  const buildings = BUILDINGS.map(renderBuilding).join('\n');
  const signs = SIGNS.map(renderSign).join('\n');
  const walker = renderWalker();

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}">
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
      .glow-bar { opacity: 0; animation: pulse 2.4s ease-in-out infinite; }
      @keyframes pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.9; } }
      .walker { animation: walk 8s ease-in-out infinite alternate; }
      @keyframes walk {
        0% { translate: 40px 150px; }
        50% { translate: 380px 146px; }
        100% { translate: 720px 150px; }
      }
      .name-shadow { font: 700 26px ui-monospace, "Courier New", monospace; letter-spacing: 4px; fill: #00e5ff; }
      .name { font: 700 26px ui-monospace, "Courier New", monospace; letter-spacing: 4px; fill: #ff2ec4; }
      .tagline { font: 400 11px ui-monospace, "Courier New", monospace; fill: #b9c3e8; }
    </style>
  </defs>
  <rect x="0" y="0" width="${VIEW_WIDTH}" height="${VIEW_HEIGHT}" fill="url(#bg)"/>
  ${buildings}
  ${signs}
  ${walker}
  <text x="${VIEW_WIDTH / 2 + 2}" y="30" text-anchor="middle" class="name-shadow">MONISH</text>
  <text x="${VIEW_WIDTH / 2}" y="28" text-anchor="middle" class="name">MONISH</text>
  <text x="${VIEW_WIDTH / 2}" y="46" text-anchor="middle" class="tagline">Full-stack developer building AI-enabled systems with agentic architectures.</text>
</svg>`;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [, , outputPath] = process.argv;
  if (!outputPath) {
    console.error('Usage: node render-banner.mjs <output.svg>');
    process.exit(1);
  }
  const fs = await import('node:fs');
  fs.writeFileSync(outputPath, renderBanner());
}
