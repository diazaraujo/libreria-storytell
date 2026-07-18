# The decline in slum population has slowed in recent years

| | |
|--|--|
| Chapter | **11** — Urban Development |
| Graphic | `slum_regions` |
| Type | `vis` |
| Status | `ready` |
| Scenes | 0 |

## Description
This is a line chart with years on the x-axis and the share of the population living in slums on y-axis. Each line is a world bank region.

## Data files copied
- `data/11_data_slum_regions.csv`

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
