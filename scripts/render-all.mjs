import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { renderBanner, renderDivider } from './render-banner.mjs';
import { renderStack, renderNow, renderCity, renderFooter, STACK, commits30, streak, agoLabel } from './render-panels.mjs';
import { W, THEMES, STYLE } from './pixel.mjs';

// The scenes are stacked into ONE svg so the README shows a single continuous picture, with no
// text between sections. Rooftop-skyline strips blend each join. Ids repeated across scenes
// (filters, gradients) are defined identically, so sharing them is safe.
const inner = (svg) => svg.slice(svg.indexOf('<defs>'), svg.lastIndexOf('</svg>'));
const size = (svg) => svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/).slice(1).map(Number);

export function renderProfile(mode, { days, stats }) {
  const T = THEMES[mode];
  const W_PX = W * 4;
  const scenes = [
    [renderBanner(mode, { commits30: stats.count }), T.near],
    [renderStack(mode), T.near],
    [renderNow(mode, stats), T.near],
    [renderCity(days, mode), T.skyB],
    [renderFooter(mode), null],
  ];
  const JOIN = 48;
  let y = 0, body = '', grads = '';
  scenes.forEach(([svg, bottom], i) => {
    const [vw, vh] = size(svg);
    const h = (vh * W_PX) / vw;
    if (i === 3) body += `<rect y="${y}" width="${W_PX}" height="${h}" fill="url(#cg)"/>`;
    body += `<svg y="${y}" width="${W_PX}" height="${h}" viewBox="0 0 ${vw} ${vh}" preserveAspectRatio="none">${inner(svg)}</svg>`;
    y += h;
    if (bottom) {
      grads += `<linearGradient id="tg${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${bottom}"/><stop offset="1" stop-color="${T.skyA}"/></linearGradient>`;
      body += `<rect y="${y}" width="${W_PX}" height="${JOIN}" fill="url(#tg${i})"/><svg y="${y}" width="${W_PX}" height="${JOIN}" viewBox="0 0 ${W_PX} ${JOIN}">${inner(renderDivider(mode))}</svg>`;
      y += JOIN;
    }
  });
  grads += `<linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${T.skyA}"/><stop offset="1" stop-color="${T.skyB}"/></linearGradient>`;
  const label = `Pixel-art profile of a developer on a rainy rooftop. Full-stack developer building AI-enabled systems with agentic architectures. Tech stack: ${STACK.flat().join(', ')}. Focus on AI code evaluation, last commit ${stats.ago.toLowerCase()}, ${stats.count} contributions in 30 days, ${stats.days} day streak. Select to visit the portfolio.`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W_PX} ${y}" role="img" aria-label="${label}" shape-rendering="crispEdges"><style>${STYLE}</style><defs>${grads}</defs>${body}</svg>\n`;
}

// data: { days: [{date, contributionCount}], lastCommitAt: ISO string | null }
// A bare array of days (the shape of fixtures/sample-contributions.json) is accepted too.
export function renderAll(data, now = Date.now()) {
  const { days, lastCommitAt = null } = Array.isArray(data) ? { days: data } : data;
  const stats = { ago: agoLabel(lastCommitAt, now), count: commits30(days), days: streak(days) };
  return Object.fromEntries(['dark', 'light'].map((mode) => [`profile-${mode}.svg`, renderProfile(mode, { days, stats })]));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [, , dataPath, outDir] = process.argv;
  if (!dataPath || !outDir) {
    console.error('Usage: node render-all.mjs <data.json> <output-dir>');
    process.exit(1);
  }
  const files = renderAll(JSON.parse(readFileSync(dataPath, 'utf8')));
  for (const [name, svg] of Object.entries(files)) writeFileSync(join(outDir, name), svg);
}
