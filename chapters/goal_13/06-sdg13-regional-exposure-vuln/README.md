# The number of people at high risk from climate-related hazards varies by region

| | |
|--|--|
| Chapter | **13** — Climate |
| Graphic | `sdg13_regional_exposure_vuln` |
| Type | `vis` |
| Status | `ready` |
| Scenes | 0 |

## Description
Map showing the share of regional populations defined as being at high risk from climate-related hazards in 2024.

## Data files copied
- `data/climate_vulnerability.zip`

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
