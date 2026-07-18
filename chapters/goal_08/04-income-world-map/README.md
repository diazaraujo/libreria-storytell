# Countries by income group

| | |
|--|--|
| Chapter | **08** — Economic growth |
| Graphic | `income_world_map` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 3 |

## Description
Describe what the visualization shows

## Data files copied
- `data/08_data_income_levels.csv`

## Scenes
- `normal_map`: This map shows how countries were classified according to their income level in 1990.
- `shifted_countries`: Let us transition into a map, where all countries are equally visible.
- `tiles`: Now, each tile represents a country with the color showing their income group as of 1990.

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
