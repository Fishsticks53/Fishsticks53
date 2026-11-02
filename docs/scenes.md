# Profile scenes

The README is four stacked 800px images, each its own SVG so each can carry its own link. Dark and light
variants of each are swapped with `<picture>`.

| scene | file | data |
| --- | --- | --- |
| About (apartment, balcony, pool) | `assets/about-*.svg` | `scripts/profile.mjs` |
| Activity (30-day skyline) | `assets/activity-*.svg` | GitHub contributions, refreshed daily |
| Tech stack (arcade station, train) | `assets/stack-*.svg` | none |
| Portfolio (vault door, guards) | `assets/portfolio-*.svg` | none |

## Pipeline

```
scripts/scenes/*.mjs   draw a scene as var(--token) markup (R/P/B3/T helpers in draw.mjs)
scripts/optimize.mjs   theme it, merge shapes, drop unused CSS            (palette.mjs, animations.mjs)
scripts/render-scenes.mjs  writes assets/<scene>-<dark|light>.svg
```

`node scripts/render-scenes.mjs <data.json> assets` renders all eight files in well under a second. The scheduled
workflow runs the self-tests first, then renders and commits only if a file changed.

To change the headline or tagline, edit `scripts/profile.mjs`. To change colours, edit `scripts/palette.mjs`.

## Text

GitHub blocks web fonts inside images, so text is drawn from Pixelify Sans outlines (`font-data.mjs`, SIL OFL 1.1).
Each glyph outline is defined once in `<defs>` and referenced with `<use>`; kerning comes from the font. Supported
characters are ASCII plus the middle dot.

## What the optimiser does (and must not change)

The output is meant to be pixel-identical to the unoptimised drawing.

1. Colour tokens become literals and paint declarations become attributes.
2. Plain rect/polygon shapes with the same paint (fill, opacity, animation class and delay) are merged into one
   `<path>`. A shape may only join an earlier group if no shape drawn in between overlaps it, so stacking order is
   unchanged. Translucent shapes only merge when disjoint (they would otherwise blend differently).
3. Inside a scaled or skewed group only non-animated shapes merge, and inside a group that is moved by an animation
   (train, planes, cat) nothing merges, because rect and path rasterisation can differ by a pixel at fractional
   device coordinates.
4. Shapes with SMIL children (`animateMotion` etc.) stay individual.
5. Only the CSS rules and keyframes a scene uses are shipped.

Compared with the unoptimised drawing this roughly halves the DOM (for example about: 1,628 to ~940 nodes), cuts the
files by about 40% raw and about 20% gzipped, and keeps every pixel (see below).

## Verifying a change

Self-tests (`node scripts/*.test.mjs`) cover the merge rules, text, size budgets and well-formedness. For visual
changes to the optimiser, render the unoptimised markup and the optimised SVG in a browser with animations paused at the
same times (`document.getAnimations()` plus `svg.setCurrentTime()`) and diff the screenshots; the optimised output
should match except for anti-aliasing on glyph edges.
