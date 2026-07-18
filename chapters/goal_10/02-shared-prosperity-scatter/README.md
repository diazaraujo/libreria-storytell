# In three out of four economies, income growth of the poorest 40 percent was faster than the population’s average between 2016 and 2021

| | |
|--|--|
| Chapter | **10** — Inequality |
| Graphic | `shared_prosperity_scatter` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 4 |

## Description
The figure compares the growth rates of average national income and average income of the poorest 40 percent of the population. In three out of four economies, income growth  for the poorest 40 percent was better than the average income.

## Data files copied
- `data/10_data_shared_prosperity.csv`

## Scenes
- `all_countries`: Each dot in the chart corresponds to the income growth of a particular economy, colored by region. The 45-degree line, also known as the [em
- `bol_jam`: Between 2016 and 2021, the income of the poorest 40 percent in [emphasis: Bolivia ]increased by more than four percent, whereas the average 
- `lcn`: However, although measuring income growth within the poorest 40 percent offers a practical means to assess shared prosperity, it does not ca
- `mex_per`: For example, income growth among Brazil’s poorest 40 percent is lower than Mexico’s, but the average Brazilian is still richer than the aver

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
