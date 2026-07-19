# SPEC · dual-line-urban-rural

**Canónico:** `access_electricity_urban_rural`  
**Chunk:** `Bktvr1TG.js` · CSS `AccessElectricityUrbanRural.DByRSGQJ.css`  
**Tipo:** **vis** (sin escenas)  
**Estado:** **v0.3** — + variant `income` (Internet Access) — hatch gap + curveNatural + layout 4×2

## Layout (Bktvr1TG)

| | Desktop | Mobile `<640` |
|--|---------|----------------|
| height | 600 | 800 |
| cols × rows | 4 × 2 | 2 × 4 |
| margin | t40 r20 b30 l32 | same |
| gap | 44 | 44 |
| order | WLD, SSF, SAS, MEA, LCN, EAS, ECS, NAC | |

- x domain **[2000, 2023]**  
- y domain **[0, 100]**, range `[cellH, 20]` (20px headroom)  
- y ticks 0 / 50 / 100 (labels only col 0)  
- x ticks 2000 / 2023 (bottom row only)  
- MEA label top offset **−32** (others −16)

## Visual

| Element | Spec |
|---------|------|
| Urban line | `#6D88D1` stroke 2 · curveNatural |
| Rural line | `#54AE89` stroke 2 · curveNatural |
| Gap | `fill:url(#diagonalHatchDark)` opacity 0.3 · CSS class `.gap` |
| Hatch | pattern rotate −45 · line `#111` stroke-width 10 |
| End dots | r=4 · stroke `#fff` 1.5 · year 2023 |
| End labels | urban y−8 · rural y+18 · digits 0 |
| WLD labels | Urban (2012,94) `#5071c8` · Rural (2012,73) `#21865d` |

## API

```js
AtlasDualLineUrbanRural.mount(el, {
  rows, labels: { urban, rural, y_axis_units }, intro: true
});
// version: 0.3.0
// variant: "regions" | "countries" | "income"
```
