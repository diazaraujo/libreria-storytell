# Pixel-byte compare (chart crops)

**Pipeline:** `node scripts/capture/pixel-diff.mjs`  
**Artifacts:** `recordings/compare/pixel-byte/` (gitignored)  
**Viewport:** 1440×900 · deviceScaleFactor 1

## Honest limit

| Layer | Byte-identical? | Why |
|-------|-----------------|-----|
| Full page origin vs story | **No** | Atlas global nav / theme shell ≠ story topbar |
| Chart crop (common-box) | **Near — A grade** | Heuristic score after LANCZOS fit |
| Same SVG/engine bytes | **No** | Origin Pixi/WebGL vs our SVG |

We measure **chart-crop fidelity**, not `cmp` of full pages.

## Scores (after origin crop fix + demo 888-wide stages)

| Case | Score | MAE | Δ% | Size |
|------|------:|----:|---:|------|
| **story-regions** | **95.5** | 2.26 | 2.6 | 756×560 |
| **regions-demo** | **94.2** | 2.87 | 4.1 | 888×502 |
| **dual-line-demo** | **92.6** | 3.81 | 3.8 | 888×600 |
| **regions-chapter** | **90.2** | 5.00 | 5.3 | 888×743 |
| progress-demo | ~83–86 | — | — | denser stems residual |

**Score** ≈ `100 − MAE×1.8 − Δ%×0.15`.

## Grades

| Grade | Score | Status |
|-------|------:|--------|
| **A** | ≥ 92 | story-regions · regions-demo · dual-line |
| **B+** | 90–91 | regions-chapter clean |
| B | 85–89 | progress denser markers |

## Re-run

```bash
bash scripts/dev-servers.sh
node scripts/capture/pixel-diff.mjs
node scripts/capture/pixel-diff.mjs --only regions
# side-by-side:
open recordings/compare/pixel-byte/story-regions/side-by-side.png
```

## Why not 100?

1. Marker / particle density (Pixi vs SVG sample)  
2. Font anti-aliasing bitmaps  
3. Aspect residual after resize  
4. Non-focus panel opacity timing  

**Ceiling without shipping origin minified engine: ~96.** We are at **95.5** on the product story chart column — that is the practical pixel-perfect bar.
