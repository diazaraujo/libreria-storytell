# From national gaps to regional and global gaps

| | |
|--|--|
| Chapter | **10** — Inequality |
| Graphic | `prosperity_gaps` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 6 |

## Description
This chart shows national Prosperity Gaps aggregated to regional and global Prosperity Gaps. 

## Data files copied
- `data/10_data_prosperity_gaps.zip`

## Scenes
- `col_mex`: In 2026, the Prosperity Gap for Colombia was 4.5 and for Peru, 3.5.
- `country_gaps`: Each square represents an economy’s Prosperity Gap in 2026, colored by region and reflecting the population size.
- `country_gaps`: There is a large difference in prosperity between economies. In some, such as the United States, Japan, and Estonia, incomes are almost high
- `region_gaps`: The regional Prosperity Gaps reflect the average gap of all individuals living in the region. This is equivalent to taking the average Prosp
- `region_gaps`: Today, most people in Europe & Central Asia and North America have reached the prosperity standard of $28 per day. On average, people in Lat
- `global_gap`: The Global Prosperity Gap combines the Prosperity Gaps of every person in the world. Today, individual incomes worldwide would need to rise 

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
