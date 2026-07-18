# Over 60 countries are moving further away from ending hunger

| | |
|--|--|
| Chapter | **02** — Global hunger |
| Graphic | `prevalence_undernourishment_gridmap` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 5 |

## Description
Describe what the visualization shows

## Data files copied
- `data/02_data_prevalence_undernourishment_countries.csv`

## Scenes
- `histogram`: By the SDGs, 60 countries have already met the target—49 of them before the SDGs began in 2015.
- `tile_map`: These success stories are concentrated in North America and Europe & Central Asia, where food insecurity is rare.
- `tile_map`: In contrast, the countries facing the steepest challenges in reaching the target are largely in Sub-Saharan Africa.
- `speed_scores`: Since 2015, prevalence of undernourishment has worsened in 61 countries, mostly concentrated in Sub-Saharan Africa and the Caribbean regions
- `speed_scores`: In another 12 countries, progress has been slower than expected such as Rwanda, Jamaica, and Indonesia. Expected progress is considered typi

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
