# dashboard_scroller

| | |
|--|--|
| Chapter | **dashboard** — Global Progress |
| Graphic | `dashboard_scroller` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 6 |

## Description
Interactive dashboard showing how much progress countries have made on development indicators over the last 10 years. It allows users to explore different options to compare progress. 

## Data files copied
_None matched automatically. Check Atlas `data/goal_*`._

## Scenes
- `intro`: In the Atlas, each square represents a data point for a particular country, year, and development indicator. You can change the selected ind
- `indicator`: This shows the [emphasis: latest available values] for the [emphasis: {selectedDashboardIndicator}] across countries, with larger squares si
- `progress_top`: Current outcomes do not reveal how much progress has been made. In this illustrative chart, a dark triangle represents the latest observed v
- `progress_comparison`: Let’s look at a [emphasis: slow-], a [emphasis: typical-], and a [emphasis: fast-][emphasis: progressing country]. For the country with [emp
- `progress_all`: Now, let’s [emphasis: compare the speed of progress of all countries]. The countries on the left made the slowest progress, often reversing 
- `explore`: Some countries that were far apart 10 years ago have similar outcomes today because they have progressed at different speeds. See how this c

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
