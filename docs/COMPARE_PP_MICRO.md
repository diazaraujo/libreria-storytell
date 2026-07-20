# Micro residual — note type + coverage basemap

**Date:** 2026-07-20  
**Captures:** `recordings/compare/pp-micro/`

## 1. Annotation note typography

Aligned to Atlas design tokens (`0.prW2ebEu.css`):

| Viewport | Token | Replica |
|----------|-------|---------|
| Desktop | `--font-size-l-m` 16px | **16px / 24px** · pad 18×20 |
| Tablet ≤960 | `--font-size-m-m` 15px | **15px / 1.5** |
| Phone ≤560 | `--font-size-s-m` 14px | **14px / 1.45** (was 12.5) |

Color `#100e2b`, Open Sans 400, chip clone padding, source footer 12px `#6a7781`.

## 2. Coverage basemap (v0.3)

| Cue | Change |
|-----|--------|
| Projection | **`globe`** (Atlas digital chrome) |
| Atmosphere | `setFog` space/horizon blend |
| Noise | mute roads / buildings / POI |
| Water | near-black `#060d1c` |
| Labels | dim country labels |
| Join | ISO `match` paint (unchanged, reliable) |

Smoke: canvas present desk+phone · 0 page errors.

## Files
- `shared/chapter-scroll.css`
- `library/coverage-choropleth-map/coverage-choropleth-map.js` v0.3
