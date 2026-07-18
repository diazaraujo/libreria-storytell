# Which country made the most progress?

| | |
|--|--|
| Chapter | **progress** — Measuring Progress |
| Graphic | `poverty_progress_comparison` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 3 |

## Description
Compares progress in poverty reduction in Côte d’Ivoire and Georgia from 2015 to 2025 using different common metrics of progress.<span style="background-color: rgb(255,255,0);"></span>

## Data files copied
- `data/progress_data_poverty_slopecharts.csv`

## Scenes
- `simple`: Between 2015 and 2025, both countries made impressive reductions in poverty, with Côte d’Ivoire reducing poverty from 26.3 percent to 16.1 p
- `percentage_points`: If we compare this in [emphasis: percentage points], Côte d’Ivoire has made the most progress, with 10.2 percent of its population escaping 
- `percentages`: Yet Georgia could hardly have matched Côte d’Ivoire’s feat, as only 10.6 percent of the population was in poverty at the start of the period

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
