# The world is urbanizing, but growth is concentrated in some regions

| | |
|--|--|
| Chapter | **11** — Urban Development |
| Graphic | `urban_rural_pop_scroller` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 5 |

## Description
This chart shows how the global population has evolved from 1960 to 2025 with an area chart.

## Data files copied
- `data/11_data_urban_rural_pop.csv`

## Scenes
- `1`: Although urbanization is a global phenomenon, it has not unfolded evenly across regions. The stacked view of urban and rural populations sho
- `2`: Unstacking these two groups reveals how each has changed individually. Over the past 25 years, [emphasis: Europe] [emphasis: and Central Asi
- `3`: In [emphasis: North America, Latin America, and the Caribbean], rural populations have plateaued while cities have expanded steadily.
- `4`: In [emphasis: East Asia & Pacific], urbanization has been particularly dramatic, with urban populations growing rapidly as rural populations
- `5`: Meanwhile, in [emphasis: Sub-Saharan Africa], [emphasis: the Middle East, North Africa, Afghanistan, Pakistan], and [emphasis: South Asia], 

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
