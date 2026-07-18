# Vulnerable employment is higher among women than men in lower-income countries and economies 

| | |
|--|--|
| Chapter | **05** — Gender and Jobs |
| Graphic | `gender_gap_informal_gdp` |
| Type | `vis` |
| Status | `ready` |
| Scenes | 0 |

## Description
This is a range chart with two dots for men and women for every country. The x-axis shows the country’s income and is classified by its income group and the y-axis shows the rate of vulnerable employment for women and men.

## Data files copied
- `data/05_data_vulnerable_employment.csv`

## Scenes
_Single-view (no scroller scenes)._

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
