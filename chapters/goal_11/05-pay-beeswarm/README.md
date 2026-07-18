# In most countries, hourly earnings are higher in urban than rural areas

| | |
|--|--|
| Chapter | **11** — Urban Development |
| Graphic | `pay_beeswarm` |
| Type | `vis` |
| Status | `ready` |
| Scenes | 0 |

## Description
This is a beeswarm chart with each dot representing a country. The x-axis shows how much higher or lower are urban wages compared to rural wages.

## Data files copied
- `data/11_data_pay_beeswarm.csv`

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
