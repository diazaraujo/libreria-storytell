# The number of cities worldwide is projected to nearly double between 2000 and 2050

| | |
|--|--|
| Chapter | **11** — Urban Development |
| Graphic | `city_map` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 4 |

## Description
This is a waffle chart. Each dot represents a city in the world and the cities are colored by their size category: very small (50,000 to 250,000 residents), small (250,000 to 1 million residents), medium (1 million to 5 million residents), large (5 million to 10 million residents), very large (over 10 million residents) cities. 

## Data files copied
- `data/11_data_city_map.zip`

## Scenes
- `1`: In 2000, there were just over 9,000 cities in the world.
- `2`: By 2025, the world had over 12,000 cities. Small and very small cities (50,000–1 million residents) drove some of this growth, expanding fro
- `3`: But this growth in megacities is expected to slow down over the next 25 years, with projections suggesting that there will only be four more
- `4`: Instead, urban growth will be driven by an increase in the number of small and very small cities, nearing 15,000 by 2050.

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
