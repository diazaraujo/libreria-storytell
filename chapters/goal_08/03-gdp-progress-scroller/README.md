# Comparing economic growth across countries

| | |
|--|--|
| Chapter | **08** — Economic growth |
| Graphic | `gdp_progress_scroller` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 5 |

## Description
Describe what the visualization shows

## Data files copied
- `data/08_data_gdp_progress.csv`

## Scenes
- `zoom_in`: Each dot here shows one of the countries classified as having low income in 1990 showing their level of income in 2015. By then, Guyana had 
- `trends`: In the decade that followed, most countries experienced economic growth. But some had experienced a decline in GDP per capita, having a lowe
- `zoom_out`: And when we zoom out to compare with the rest of the world, it becomes very clear that there is still substantial catching up to be done.
- `progress`: It is therefore also relevant to look at how countries have performed relative to similar countries. The progress measure does exactly that,
- `regions`: We can also look at how the economies have grown across regions.

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
