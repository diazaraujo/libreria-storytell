# Pixel-perfect push — chart-crop scores

**Pipeline:** `node scripts/capture/pixel-diff.mjs`  
**Artifacts:** `recordings/compare/pixel-byte/` (gitignored)  
**Viewport:** 1440×900

## Limit (honest)

Full-page **byte identity** with Atlas is impossible (nav shell, Pixi vs SVG, font AA).  
We score **chart crops** after common-box resize.

## Scores (latest push)

| Case | Score | MAE | Δ% | Grade |
|------|------:|----:|---:|:-----:|
| **story-regions** | **96.2** | 1.95 | 2.2 | **A+** |
| **regions-demo** | **94.9** | 2.55 | 3.5 | **A** |
| **dual-line-demo** | **92.6** | 3.81 | 3.8 | **A** |
| **regions-chapter** | **90.1** | 5.04 | 5.3 | **B+** |
| progress-demo | ~84 | — | — | B (origin Pixi-heavy) |

### Delta vs first honest run

| Case | Before | After |
|------|-------:|------:|
| story-regions | 95.5 | **96.2** |
| regions-demo | 86.2 → 94.2 | **94.9** |
| dual-line | 86.6 | **92.6** |

## What we tightened

1. **Regions** — denser particle cloud (2–4 dots/year 2014–2023) · `yDomain [0,100]`  
2. **Progress** — denser row band (`ROW_H 4.85`) · smaller origin-like dots  
3. **Demos** — stage width **888px** = origin chart column  
4. **Crop finder** — real SVG (paths+text), centered in viewport  

## Re-run

```bash
bash scripts/dev-servers.sh
node scripts/capture/pixel-diff.mjs
open recordings/compare/pixel-byte/story-regions/side-by-side.png
```

## Ceiling

Without shipping Atlas minified Pixi bundles: **~96–97** on story chart column.  
We are there on **regions**. Progress needs engine-level work for A+.
