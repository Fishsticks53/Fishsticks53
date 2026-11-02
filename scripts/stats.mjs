// Stats derived from the contribution calendar (no repo names anywhere).

export function commits30(days) {
  return days.slice(-30).reduce((a, d) => a + d.contributionCount, 0);
}

// Consecutive active days ending today, or yesterday if today has nothing yet.
export function streak(days) {
  let i = days.length - 1;
  if (i >= 0 && days[i].contributionCount === 0) i--;
  let n = 0;
  for (; i >= 0 && days[i].contributionCount > 0; i--) n++;
  return n;
}

export function agoLabel(iso, now = Date.now()) {
  if (!iso) return '--';
  const m = Math.floor((now - Date.parse(iso)) / 60000);
  if (!(m >= 0)) return '--';
  if (m < 2) return 'JUST NOW';
  if (m < 60) return `${m}M AGO`;
  const h = Math.floor(m / 60);
  return h < 48 ? `${h}H AGO` : `${Math.floor(h / 24)}D AGO`;
}

// Colour levels for the skyline: 1-2 / 3-4 / 5-6 / 7+ contributions map to levels 1..4 (zero stays level 0). The
// bands stretch only when a day exceeds the 11 the building height saturates at, so a very busy month keeps contrast.
export function bucketLevels(counts) {
  const k = Math.max(11, ...counts) / 11;
  return counts.map((c) => (c <= 0 ? 0 : c <= 2 * k ? 1 : c <= 4 * k ? 2 : c <= 6 * k ? 3 : 4));
}
