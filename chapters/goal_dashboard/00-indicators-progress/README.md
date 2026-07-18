# The global speed of progress is falling in many domains

| | |
|--|--|
| Chapter | **dashboard** — Global Progress |
| Graphic | `indicators_progress` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 6 |

## Description
Line charts showing  the speed of progress across six development indicators from 1950 to 2025 . The y-axes reflect the speed of development and are annotated with values to make the values more comprehensible.

## Data files copied
- `data/dashboard_data_progress_speeds.zip`

## Scenes
- `values`: Looking at  extreme poverty rates, where a year’s speed of progress refers to changes over the previous five years, progress in reducing pov
- `smooth`: Looking at other indicators, we can see that the pace of progress changes annually and smoothing the data helps distinguish patterns from no
- `2010`: For life expectancy and electricity supply, the pace of progress today is the slowest it has been in 75 years. For schooling, it is the slow
- `overlay`: Overlaying the six indicators, allows us to compare them against each other, confirming that only CO2 emissions per GDP has a higher-than-ty
- `average_of_averages`: Calculating the average speed across indicators provides a picture of how the pace of global development has changed over the last 75 years.
- `region_progress`: This slowdown is widespread across regions, with the pace of progress across all regions except South Asia now at its slowest since 1950.

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
