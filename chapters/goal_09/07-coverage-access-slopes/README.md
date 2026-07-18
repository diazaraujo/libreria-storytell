# Mobile networks now reach most of the population, but many people remain offline

| | |
|--|--|
| Chapter | **09** — Internet Access |
| Graphic | `coverage_access_slopes` |
| Type | `vis` |
| Status | `ready` |
| Scenes | 0 |

## Description
A set of four slope charts showing 3G network coverage and Internet access levels for countries, by income group: low, lower-middle, upper-middle, and high-income 

## Data files copied
- `data/09_data_coverage_access_gaps.csv`

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
