# The Prosperity Gap tracks both income level and its distribution

| | |
|--|--|
| Chapter | **10** — Inequality |
| Graphic | `prosperity_gap_scroller` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 8 |

## Description
This chart shows the Prosperity Gap for each percentile of the income distributions in Peru and Colombia. 

## Data files copied
- `data/10_data_prosperity_gap.csv`

## Scenes
- `prosperity_gap_intro`: Suppose that there are 100 people in each economy ranked from poorest on the left to richest on the right. The height of each bar represents
- `prosperity_gap_threshold`: The Prosperity Gap measures the income multiple necessary to reach the global prosperity standard of $28 per day. The smaller the level of i
- `percentiles20`: For example, the income of the 10th poorest person in Peru is close to $4 and in Colombia, it is close to $3.50.
- `percentiles20`: The Peruvian with a $4 income needs to increase their income [emphasis: seven times] to reach the prosperity standard, whereas the Colombian
- `all_gaps`: Each brick represents the person's level of income. The number of bricks represents how many times their income needs to increase. Individua
- `colombia_10_20`: For example, the [emphasis: 10th poorest ]Colombian would need to increase their income [emphasis: eight times] while the [emphasis: 20th po
- `poorest_col_vs_per`: It is important to note that individuals with lower income in Colombia face greater challenges in achieving the prosperity standard compared
- `prosperity_gap_averages`: A nation’s Prosperity Gap is the average gap of all individuals in that nation. The Prosperity Gap is higher in Colombia (4.5) than in Peru 

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
