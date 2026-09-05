# Isometric Contributions Graph — Design

## Purpose

Add a stylized, neon-themed 3D isometric rendering of the user's GitHub contribution
history to the profile README, refreshed automatically once a day. This is purely
additive: GitHub's native contribution graph on the profile page cannot be hidden,
removed, or replaced by any README content — it is fixed platform UI. The isometric
graph appears as a second, separate graphic within the README body.

## Non-goals

- Replacing or hiding GitHub's native contribution graph (not possible).
- Hover interactivity on individual bars (not possible — `<img>`-embedded SVGs disable
  interactivity, and GitHub's README sanitizer strips `<script>`/event handlers from
  inline SVG).
- Exact-count tooltips or per-bar axis labels — this stays a decorative graphic, not a data tool. (Amended: a single aggregate label — total contributions — is in scope; see "Total-count label" below.)

## Data source

**GitHub GraphQL API v4**, `viewer.contributionsCollection.contributionCalendar`,
returning 7×53 weeks of `{date, contributionCount}`. Requires a Personal Access Token
with `read:user` scope, stored as a repository secret named `PROFILE_TOKEN` (the user
creates this manually in GitHub Settings → Developer settings → Personal access
tokens, then adds it under repo Settings → Secrets and variables → Actions). The
default `GITHUB_TOKEN` cannot be used for this query — it authenticates as the
Actions bot, not the account owner.

Refresh cadence: **once daily**, comfortably inside the 5,000 req/hour authenticated
rate limit.

## Color palette (locked)

Inspired by a neon Tokyo alley at night — deep indigo shadows cut by hot magenta and
cyan signage.

| Level | Meaning | Top face | Side faces |
|---|---|---|---|
| Background | — | `#0a0e1a` | — |
| 0 | No contributions | `#141b2e` | darker shade of same hue |
| 1 | Low | `#3a2a6d` | darker shade of same hue |
| 2 | Medium | `#7b2fbf` | darker shade of same hue |
| 3 | High | `#e0218a` | darker shade of same hue |
| 4 | Highest | `#ff2ec4` with `#00e5ff` cyan rim-light on top face | darker shade of same hue |

Level bucketing follows GitHub's own approach: 0 stays 0; positive counts are split
into quartiles across levels 1–4.

## Visual craft refinements

Applied from the impeccable skill's craft-floor guidance (the parts that apply to a
static generated graphic rather than an interactive page):

- **Fixed light direction:** every bar is shaded as if lit from the upper-left, like
  the alley's overhead signage. Top face = 100% of the level's hue, left face = 70%
  brightness of the top face, right face = 45% brightness of the top face. This ratio
  is constant across all levels so the whole grid reads as one consistently lit scene
  rather than arbitrary per-bar shading.
- **Atmospheric background:** the background is a `radialGradient` (centered upper-
  middle, `#141b3a` fading to `#0a0e1a` at the edges) instead of one flat fill —
  echoes the depth of the reference photo without adding any new dependency, still a
  single SVG paint server.
- **Real glow, not a flat flicker:** the level-4 "neon" effect is an SVG `filter`
  (`feGaussianBlur` on a duplicated shape, animating `stdDeviation` and the glow
  layer's `opacity` together) — a soft bloom, not a flat `opacity` fade. Matches the
  rule that depth/glow effects need actual blur behind them.
- **One authored motion sequence, not two parallel ones:** the grow-in sweep (left to
  right, ground-up) plays once on load. The level-4 glow bloom's `animation-delay` is
  set to start only after the grow-in's total duration elapses, so it reads as one
  choreographed sequence (build → glow) rather than two independent animations
  running from frame one.
- **Idle bob (amended after initial ship):** the grow-in used the combined `transform:
  scaleY()` property, which cannot run alongside a second, independent, infinite
  animation on the same property without one overriding the other. Switched to the
  individual `scale` and `translate` CSS properties instead — `scale` handles the
  one-time grow-in, `translate` handles a continuous idle bob (~2px, ~2.5s ease-in-out
  loop) that starts the moment each bar's own grow-in finishes, so the graphic keeps a
  small amount of motion indefinitely instead of freezing once the entrance completes.

## Total-count label

A single `<text>` element, centered above the grid, reading `"<N> contributions in the
last year"` where `<N>` is the sum of all `contributionCount` values in the input.
Gives the viewer one concrete number to relate the bar heights to, without turning the
graphic into a real data tool (no per-bar values, no axis, no tooltips — see amended
Non-goals above). Adds `LABEL_MARGIN` (20px) of top padding to the SVG's height so the
label doesn't overlap the tallest bars.

## Components

### `scripts/fetch-contributions.mjs`
- Node built-ins only (`fetch`), no npm dependencies.
- Reads `PROFILE_TOKEN` and `GITHUB_USERNAME` from environment.
- POSTs the GraphQL query to `https://api.github.com/graphql`.
- On success, writes the flattened day list as JSON to stdout.
- On failure (network error, non-200, GraphQL `errors` field), prints the error to
  stderr and exits non-zero — no partial/empty file is produced.

### `scripts/render-isometric.mjs`
- Pure computation, no npm dependencies.
- Input: JSON day list (via stdin or file argument).
- Buckets each day into level 0–4.
- Projects each day onto a standard 2:1 isometric grid (53 columns × 7 rows), each
  day drawn as a 3-faced bar (top/left/right polygons) whose height encodes its
  level.
- Draws each bar with three shaded faces (top/left/right) per the fixed light
  direction in "Visual craft refinements" above, and paints the background with the
  `radialGradient` defined there.
- Emits a single self-contained SVG with:
  - An embedded `<style>` block defining `@keyframes` for a left-to-right staggered
    grow-in animation (`scaleY(0) → scaleY(1)`, `animation-delay` keyed to column
    index) that plays once on load.
  - An SVG `<filter>` (`feGaussianBlur`-based bloom) applied to a duplicated glow
    layer behind each level-4 bar, with an infinite `stdDeviation`/`opacity` pulse
    whose `animation-delay` starts only after the grow-in's total duration — one
    sequenced build-then-glow motion, not two parallel animations.
  - No `<script>`, no event handlers — animations are declarative CSS/SVG only,
    which remains valid inside an `<img>`-embedded SVG (unlike `:hover` or JS).
- Writes to `assets/contributions-isometric.svg`.

### `scripts/render-isometric.test.mjs`
- No test framework — plain `assert` from Node's `node:assert`.
- Feeds a fixed synthetic 371-day dataset through the renderer.
- Asserts: exactly 371 bar groups are emitted, no `NaN` appears in any coordinate,
  and the output is well-formed enough to parse as XML.
- Run manually via `node scripts/render-isometric.test.mjs`; also run as a required
  step in the Action before committing (see below), so a broken renderer never
  publishes a broken graphic — the previous good SVG stays live instead.

### `.github/workflows/contributions.yml`
- Triggers: `schedule` (`0 6 * * *`, once daily) and `workflow_dispatch` (manual
  re-run).
- Permissions: `contents: write` (needed to commit the regenerated SVG back to the
  repo).
- Steps: checkout → setup Node 20 → run `fetch-contributions.mjs` (piping output to
  a temp JSON file) → run `render-isometric.test.mjs` (fails the job on any
  assertion error, before touching the real output file) → run
  `render-isometric.mjs` → commit `assets/contributions-isometric.svg` only if it
  changed (`git diff --quiet` guard) → push.
- Secrets used: `PROFILE_TOKEN` (GraphQL auth). Git push uses the automatically
  provided `GITHUB_TOKEN`.

### README change
- New section (placed near the existing "📊 Stats" section) embedding
  `<img src="./assets/contributions-isometric.svg" alt="Isometric contribution graph" />`.

## Error handling

- Fetch failure → script exits non-zero → Action job fails → no commit → last known
  good SVG remains live on the profile. No silent fallback to stale/fake data.
- Render self-test failure → same outcome: job fails before the real render step
  runs, previous SVG is untouched.

## Testing

- `scripts/render-isometric.test.mjs` is the single runnable check for the
  non-trivial logic here (bucketing + isometric projection math). It runs both
  manually (`node scripts/render-isometric.test.mjs`) and as a gating step in the
  Action.
- No framework, no fixtures beyond the one inline synthetic dataset.

## Open items for the user

- Create the `PROFILE_TOKEN` secret (PAT with `read:user` scope) before the Action
  can run successfully — this is a manual step outside what code changes can do.
- Confirm the GitHub username to hardcode into the workflow's env (or set as a repo
  variable) for the GraphQL query.
