import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { about } from './scenes/about.mjs';
import { activity } from './scenes/activity.mjs';
import { stack } from './scenes/stack.mjs';
import { portfolio } from './scenes/portfolio.mjs';
import { themeScene } from './optimize.mjs';
import { commits30, streak, agoLabel } from './stats.mjs';

// Four stacked 800px-wide scenes ("Rooftop to underground"), each its own SVG so each can carry its own
// README link. Only the activity scene depends on data; the others are rendered once per theme.
// GitHub blocks web fonts inside images, so all text is drawn as shapes (see font.mjs).

// data: { days: [{date, contributionCount}], lastCommitAt: ISO string | null }
// A bare array of days (the shape of fixtures/sample-contributions.json) is accepted too.
export function renderScenes(data, now = Date.now()) {
  const { days, lastCommitAt = null } = Array.isArray(data) ? { days: data } : data;
  const stats = { ago: agoLabel(lastCommitAt, now).toLowerCase(), count: commits30(days), days: streak(days) };
  const scenes = { about: about(), activity: activity(days, stats), stack: stack(), portfolio: portfolio() };
  const out = {};
  for (const mode of ['dark', 'light']) for (const [name, scene] of Object.entries(scenes)) out[`${name}-${mode}.svg`] = themeScene(scene, mode);
  return out;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [, , dataPath, outDir] = process.argv;
  if (!dataPath || !outDir) {
    console.error('Usage: node render-scenes.mjs <data.json> <output-dir>');
    process.exit(1);
  }
  for (const [name, svgText] of Object.entries(renderScenes(JSON.parse(readFileSync(dataPath, 'utf8'))))) writeFileSync(join(outDir, name), svgText);
}
