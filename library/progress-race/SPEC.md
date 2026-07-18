# SPEC · progress-race

**Canónico:** `access_electricity_progress`  
**Chunk:** `Brmmsw6q.js` · CSS `AccessElectricityProgressScroller.DVNMGbcQ.css`  
**Story:** `stories/electricity-access/` bloque `progress`  
**Estado:** **v0.2** — PP: start-dots 2015, stems Se (focus|scene3), gradient legend, chips

## Escenas (Brmmsw6q)

| i | id | Contenido |
|---|-----|-----------|
| 0 | `access_15` | Dots/marcadores en 2015 · triangle `scale(0)` · focus labels ETH/NGA/COD |
| 1 | `access_23` | Tween → 2023 · progress stems grey · triangle `scale(1)` |
| 2 | `progress` | Speed colors domain `[-1,0,1,2]` · legend “Speed of progress” |
| 3 | `all_countries` | Explore all + dropdown highlight |

## Datos

- CSV: `07_data_access_electricity_countries.csv` (`iso3c`, `access_2015`, `access_2023`)
- Filter: ambos años ≠ 100
- Sort: `access_2015` asc
- Focus: `ETH`, `NGA`, `COD`
- Speed: `clamp((access_2023 - access_2015) / 15, -1, 2)` → scaleLinear colors

## Colores (BaLbg-2r)

| key | hex |
|-----|-----|
| regressing | `#701d57` |
| standstill | `#8a969f` |
| typical | `#ffdd92` |
| fast | `#00a1c4` |
| grey400 | `#57626a` |

## Layout

- margin: top/right/bottom/left **20**
- x domain: **[0, 100]**
- y: scaleBand all filtered countries, padding ~0.05
- triangle r = **5** (M-r,-r L r,0 L -r,r)
- progress line: stroke-width **5**, opacity **0.3** when scene > 0

## Motion (pixel)

```
line.progress  { transition: opacity 2s, stroke-width 2s }
path.arrow     { transition: transform 2s }
.cell text     { transition: opacity 2s ease-out }  /* hover 0.5s */
accessTween    { duration: 2000, target 2015 ↔ 2023 }
```

## API

```js
AtlasProgressRace.mount(el, {
  rows,              // CSV rows
  sceneIndex,
  focus: ['ETH','NGA','COD'],
  names: ATLAS_COUNTRY_NAMES,
  labels: { progress_speed, regression, … },
  forceRemount
});
chart.updateScene(i);
// version: 0.1.0
```
