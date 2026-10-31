import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { renderBanner, renderDivider } from './render-banner.mjs';
import { renderStack, renderNow, renderCity, commits30, streak, agoLabel } from './render-panels.mjs';

// data: { days: [{date, contributionCount}], lastCommitAt: ISO string | null }
// A bare array of days (the shape of fixtures/sample-contributions.json) is accepted too.
export function renderAll(data, now = Date.now()) {
  const { days, lastCommitAt = null } = Array.isArray(data) ? { days: data } : data;
  const stats = { ago: agoLabel(lastCommitAt, now), count: commits30(days), days: streak(days) };
  const files = {};
  for (const mode of ['dark', 'light']) {
    files[`banner-${mode}.svg`] = renderBanner(mode, { commits30: stats.count });
    files[`stack-${mode}.svg`] = renderStack(mode);
    files[`now-${mode}.svg`] = renderNow(mode, stats);
    files[`city-${mode}.svg`] = renderCity(days, mode);
    files[`divider-${mode}.svg`] = renderDivider(mode);
  }
  return files;
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
