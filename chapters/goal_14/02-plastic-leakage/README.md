# Plastic leakage into aquatic environments is projected to double 

| | |
|--|--|
| Chapter | **14** — Ocean pollution |
| Graphic | `plastic_leakage` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 7 |

## Description
Describe what the visualization shows

## Data files copied
- `data/14_data_plastic_leakage.csv`

## Scenes
- `leakage19`: Leakage in 2019
- `sinking`: Sinking to lake and river beds
- `in_rivers`: In rivers
- `coastal`: Coastal leakage
- `to_oceans`: To oceans
- `in_oceans`: In oceans
- `projection_2060`: 2060 projection

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
