# Globally, almost 8 percent of the population is exposed to cyclones

| | |
|--|--|
| Chapter | **13** — Climate |
| Graphic | `sdg13_effects_of_climate_change_scroller` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 3 |

## Description
Share of population exposed to cyclones and location of areas exposed to cyclones 

## Data files copied
- `data/20260130_hazard_data_prepared.csv`

## Scenes
- `cyclones__sat__wld`: [emphasis: Cyclones] of category 2 or above[footnote:  Cyclones are measured on the Saffir Simpson scale, which classifies them into five ca
- `cyclones__vec__bbox1`: Tropical [emphasis: cyclone] Melissa made landfall in Jamaica on October 28,  2025. The third most intense [emphasis: cyclone] ever recorded
- `cyclones__vec__wld`: [emphasis: Cyclones] occur over warm tropical oceans, exposing people in their proximity. In many Small Island Developing States, the entire

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
