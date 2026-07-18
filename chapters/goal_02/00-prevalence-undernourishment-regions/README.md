# Global hunger is on the rise

| | |
|--|--|
| Chapter | **02** — Global hunger |
| Graphic | `prevalence_undernourishment_regions` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 7 |

## Description
Describe what the visualization shows

## Data files copied
- `data/02_data_prevalence_undernourishment_regions.csv`

## Scenes
- `global15`: Between 2001 and 2015, global hunger fell impressively, nearly halving from 13 percent to 7.5 percent.
- `global_full`: Since then, however, progress has stalled and even reversed. By 2023, nearly one in eleven people faced undernourishment.
- `regions15`: This pattern is true for nearly all regions. Sub-Saharan Africa, South Asia, East Asia & Pacific, and Latin America & the Caribbean all saw 
- `regions_full`: …only for gains to slow or reverse.
- `risen`: In South Asia, and Latin America & the Caribbean, hunger rates have risen again…
- `stalled`: …while progress in East Asia & Pacific has largely stalled.
- `mea`: The most concerning trend is in the Middle East & North Africa, Afghanistan & Pakistan and Sub-Saharan Africa where hunger has been on a con

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
