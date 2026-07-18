# The share of global protected lands needs to double to reach the 30% goal

| | |
|--|--|
| Chapter | **15** — Life on land |
| Graphic | `protected_areas` |
| Type | `vis` |
| Status | `ready` |
| Scenes | 0 |

## Description
A line chart showing the global terrestrial protected areas as share of the total land area. Compared the the 30% target, the line is mostly flat.

## Data files copied
- `data/15_data_protected_areas.csv`

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
