# Pixel-byte compare (chart crops)

**Viewport:** 1440×900

| Case | Score | MAE | Δ% pixels | Size |
|------|------:|----:|----------:|------|
| regions-demo | **94.7** | 2.631 | 3.55 | 888×502 |
| regions-chapter | **90** | 5.118 | 5.27 | 888×743 |
| dual-line-demo | **92.5** | 3.864 | 3.82 | 888×600 |
| story-regions | **96** | 2.038 | 2.28 | 756×560 |

## How to read

- **score** ≈ 100 − MAE×1.8 − Δ%×0.15 (heuristic fidelity after common-box resize)
- **Byte-identical full pages is impossible** (Atlas nav chrome vs story shell)
- Diffs live in `recordings/compare/pixel-byte/<case>/` (gitignored)

Open side-by-side PNGs under each case folder.
