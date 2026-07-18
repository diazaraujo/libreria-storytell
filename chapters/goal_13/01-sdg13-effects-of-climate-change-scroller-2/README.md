# Globally, almost 1.4 billion people in rural areas are exposed to agricultural drought 

| | |
|--|--|
| Chapter | **13** — Climate |
| Graphic | `sdg13_effects_of_climate_change_scroller` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 3 |

## Description
Share of population exposed to agricultural drought and location of areas exposed to agricultural drought.

## Data files copied
- `data/20260130_hazard_data_prepared.csv`

## Scenes
- `drought__sat__wld`: An [emphasis: area] is defined as exposed to [emphasis: agricultural drought] if more than 30 percent of cropland or pasture experienced sev
- `drought__sat__bbox1`: [emphasis: Agricultural drought] is most prevalent in arid and semi-arid regions. In Eswatini, Lesotho, Namibia, and Zimbabwe, more than hal
- `drought__vec__wld`: Globally, almost 1.4 billion people are exposed to [emphasis: agricultural drought][reference: WB2], which can halt or reverse progress in p

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
