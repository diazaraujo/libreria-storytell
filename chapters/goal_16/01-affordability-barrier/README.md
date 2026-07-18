# Mobile data is prohibitively expensive in low-income countries

| | |
|--|--|
| Chapter | **16** — Artificial Intelligence (AI) |
| Graphic | `affordability_barrier` |
| Type | `vis` |
| Status | `ready` |
| Scenes | 0 |

## Description
Chart showing the cost of a data package relative to a household’s budget, by income group, and relative to food expenditure.

## Data files copied
- `data/affordability_incgroup.csv`

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
