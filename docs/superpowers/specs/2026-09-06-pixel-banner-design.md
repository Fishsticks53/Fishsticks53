# Pixel Alley Skyline Banner — Design

## Purpose

Replace the plain `<h1>` + tagline + badge-row block at the top of the README
(`README.md:1-13`) with a self-built, animated 16-bit pixel-art SVG banner, so the
first thing a visitor sees reads as one deliberately designed world with the
isometric contributions graph further down, instead of a generic templated header.

## Direction (impeccable direction contract)

The `impeccable` CLI's automated direction-roll tooling is unavailable on this
machine (confirmed broken — see prior session notes), so this contract was produced
manually, applying the skill's own format and principles rather than its scripts.

- **THESIS:** the header is a place, not a label — a pixel-art alley at night that
  happens to contain your name, refusing the generic "name + badges" template every
  other profile README uses.
- **OWN-WORLD:** the same locked neon palette as the contributions graph (`#0a0e1a`
  background, `#141b3a` gradient highlight, `#7b2fbf` / `#e0218a` / `#ff2ec4` /
  `#00e5ff` accents), rendered as flat, hard-edged, grid-snapped pixel blocks — no
  gradients or anti-aliasing on foreground shapes, no blur except the same glow-bloom
  filter already established for "neon" elements.
- **STORY:** a visitor sees a small neon-lit alley skyline, signs flickering, a tiny
  figure walking past, and your name rendered as a retro game-title logo sitting over
  the scene — then scrolls down into the same world's contribution graph.
- **FIRST VIEWPORT:** one wide banner image, full width. Skyline silhouette fills the
  lower two-thirds; name logo sits upper-left or centered over the buildings; tagline
  sits directly beneath the name in a smaller weight.
- **FORM:** Pixel Alley Skyline (chosen over "Arcade Title Card" and "Neon Sign
  Board" alternatives — see prior conversation for the other two).
- **FINISH:** unreviewed and undocumented is unfinished; this build ends with tests
  passing, the generated asset visually sane, and this spec updated to match what
  actually shipped if anything drifts during implementation.

## Non-goals

- No live/dynamic data — this is a fully static scene, generated once and committed
  (unlike the contributions graph, there is nothing here for a daily Action to
  refresh).
- No custom bitmap pixel-font glyph system for arbitrary text — full glyph authoring
  for a whole alphabet is disproportionate scope for a decorative banner. Text uses a
  monospace font stack (closest cross-platform approximation to a "8-bit" typeface,
  and genre-appropriate for retro game UI, not a technical-costume substitution) with
  a hard-edged retro drop-shadow effect (a duplicate, offset text layer) for the name.
- No changes to the "⚡ What I'm into", "🧰 Toolbox", "📊 Stats", "🏙️ Contributions",
  or "🔗 Connect" sections — scope is strictly `README.md:1-13`.

## Visual composition

- **Pixel grid:** all shapes snap to a `PIXEL = 4` unit grid — every rect's x/y/width/
  height is a multiple of 4, for an authentic blocky look.
- **Background:** reuses the exact `radialGradient` already defined for the
  contributions graph (`#141b3a` → `#0a0e1a`), so the two SVGs read as the same
  material.
- **Skyline:** a data-driven array of building silhouettes (varying width/height,
  dark indigo-purple fill `#1a1030`), some with a scatter of small lit-window pixels.
- **Neon signs:** 3–4 of the buildings carry a small rect "sign" in an accent color.
  Each sign uses the same `feGaussianBlur` glow-bloom filter and infinite pulse
  animation already established for level-4 contribution bars, with a per-sign
  staggered delay so they don't flicker in unison.
- **Walking figure:** a small multi-rect sprite (head/body/legs, no limb animation)
  that translates back and forth across the lower third of the scene in an infinite
  ease-in-out loop, with a slight vertical bob — reusing the same bob vocabulary as
  the contributions graph's idle animation.
- **Name logo:** "MONISH" in bold monospace, uppercase, wide letter-spacing, rendered
  as two stacked `<text>` elements — a `#00e5ff` copy offset 2px down-right behind a
  `#ff2ec4` copy on top — producing a hard-edged retro game-logo drop-shadow with no
  blur, matching 16-bit title-screen conventions.
- **Tagline:** the existing tagline text ("Full-stack developer building AI-enabled
  systems with agentic architectures.") in smaller monospace, single color
  (`#b9c3e8`, matching the total-count label color already used on the contributions
  graph), directly beneath the name.

## Accessibility

The `<img>` tag embedding this SVG in the README carries `alt` text containing the
actual name and tagline, so the content survives for screen readers and search
indexing even though it's no longer real text in the page — this replaces, not
removes, that information.

## Components

### `scripts/render-banner.mjs`
- Node built-ins only, no npm dependencies — same constraint as the rest of the repo.
- Exports `renderBanner(): string` (no input data — the scene is fully static).
- Exports the internal pure helpers used to build it (`snap(n)` rounds to the nearest
  `PIXEL` multiple; kept exported for testability).
- CLI entry point identical in shape to `scripts/render-isometric.mjs`: `node
  render-banner.mjs <output.svg>` (no input file, since there's no data to feed it).

### `scripts/render-banner.test.mjs`
- Plain `node:assert`, no framework — same pattern as the rest of the repo.
- Asserts: output is well-formed (`<svg` ... `</svg>`, no `NaN`), the building count
  in the output matches the hardcoded scene data's length, the name text ("MONISH")
  and tagline text both appear, and at least one glow-filter reference exists for the
  signs.

### README change
- Replace `README.md:1-13` (the `<h1>`, tagline `<p>`, and badge-row `<p>`) with:
  ```markdown
  <p align="center">
    <img src="./assets/banner.svg" alt="Monish — Full-stack developer building AI-enabled systems with agentic architectures." />
  </p>
  ```
- Everything from the `---` divider onward is untouched.

### Asset generation
- `assets/banner.svg` is generated once via the CLI and committed directly — there is
  no placeholder/real-data distinction here (unlike the contributions graph), since
  the scene has no external data source to be honest or dishonest about.

## Testing

- `scripts/render-banner.test.mjs` is the single runnable check, covering the scene's
  structural correctness (well-formed output, expected element counts, expected text
  content). Run manually via `node scripts/render-banner.test.mjs`; no Action needed
  since nothing regenerates this asset on a schedule.
