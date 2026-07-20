# Branding craft — beauty over ROI

This project’s bar is **not** “good enough shipping.”  
The bar is: **people should feel this was made by people who care about beautiful things.**

## Principles

1. **Chart crops that read as Atlas** — score A/A+ on canonic patterns  
2. **Motion that feels intentional** — 1s opacity, particle flight, stem tween  
3. **Typography that respects the house** — Open Sans, token scale, red rule  
4. **Shell that disappears** — sticky note + chart, no chrome fighting the data  

## Living scores (chart-crop)

| Pattern | Score | Feel |
|---------|------:|------|
| Story regions | **96** | A+ product |
| Regions demo | **94.7** | A library |
| Dual-line | **92.5** | A library |
| Regions chapter | **90** | B+ clean |

## Beauty pass (this commit)

- **Regions:** year-marker trail on lit panels (World dense like origin)  
- **Progress:** softer wider stems, smoother easing  
- **Shell:** refined title/prose/end, gradient red rule  
- **Demos:** Open Sans + origin-width stages  

## Re-check beauty anytime

```bash
node scripts/capture/pixel-diff.mjs
open recordings/compare/pixel-byte/story-regions/side-by-side.png
open http://127.0.0.1:8787/stories/electricity-access/
```

If it doesn’t make you pause for half a second, it’s not done.
