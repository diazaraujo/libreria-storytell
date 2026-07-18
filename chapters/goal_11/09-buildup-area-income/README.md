# Built-up area will expand by more than 50 percent over the next 25 years

| | |
|--|--|
| Chapter | **11** — Urban Development |
| Graphic | `buildup_area_income` |
| Type | `vis` |
| Status | `ready` |
| Scenes | 0 |

## Description
This is a stacked area chart showing total built-up area over time - from 2000 to 2025 (actual) and from 2025 to 2050 (estimated). Each stack represents an income group.

## Data files copied
- `data/11_data_buildup_area_income.csv`

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
