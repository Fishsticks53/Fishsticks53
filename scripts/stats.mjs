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

// Quartile buckets over the non-zero days; zero stays level 0.
export function bucketLevels(counts) {
  const positives = counts.filter((c) => c > 0).sort((a, b) => a - b);
  if (positives.length === 0) return counts.map(() => 0);
  const q = (p) => positives[Math.min(positives.length - 1, Math.floor(p * (positives.length - 1)))];
  const t = [q(0.25), q(0.5), q(0.75)];
  return counts.map((c) => (c <= 0 ? 0 : c <= t[0] ? 1 : c <= t[1] ? 2 : c <= t[2] ? 3 : 4));
}
