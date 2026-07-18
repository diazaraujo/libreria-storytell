# What percentage of the efficient price is reflected in the retail price of fuel?

| | |
|--|--|
| Chapter | **12** — Energy sources |
| Graphic | `sdg12_efficient_price_dotplot` |
| Type | `vis` |
| Status | `ready` |
| Scenes | 0 |

## Description
Across all income groups, the retail price of fuel is often a fraction of the efficient price. The gap is substantial in middle-income countries, especially upper-middle-income countries. The highest gap is observed for coal, followed by diesel. These are important sources of external costs, such as air pollution and global warming. In middle-income countries, the retail prices of coal and diesel should more than double to internalize all social costs.

## Data files copied
- `data/fossil_fuel_subsidy_20250920.zip`

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
