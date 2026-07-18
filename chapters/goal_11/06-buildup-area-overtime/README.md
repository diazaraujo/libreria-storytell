# Built-up area in Addis Ababa has more than tripled in the last five decades

| | |
|--|--|
| Chapter | **11** — Urban Development |
| Graphic | `buildup_area_overtime` |
| Type | `vis` |
| Status | `ready` |
| Scenes | 0 |

## Description
This chart has two parts. One part shows the map of Addis Ababa and the built-up area over time with a time slider. The other part of the chart shows the growth in population in this city over the same time period with a line chart. 

## Data files copied
- `data/11_data_buildup_area_overtime.zip`

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
