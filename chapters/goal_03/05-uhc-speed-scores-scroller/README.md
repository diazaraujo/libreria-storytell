# Speed of Progress in RMNCH Mortality (2015–2030)

| | |
|--|--|
| Chapter | **03** — Health |
| Graphic | `uhc_speed_scores_scroller` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 3 |

## Description
_No description in config._

## Data files copied
- `data/03_data_speed_scores_scroller.zip`

## Scenes
- `1`: In reducing [emphasis: maternal mortality], several countries in Sub-Saharan Africa recorded rapid gains, while many countries in Latin Amer
- `2`: Similar contrasts emerge for [emphasis: under-five mortality]. South Sudan recorded one of the fastest declines, reducing under-five mortali
- `3`: Progress in reducing [emphasis: neonatal mortality] has also been uneven. Several countries in South Asia, including India, Bangladesh, and 

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
