# Global Internet access: trends and divides

| | |
|--|--|
| Chapter | **09** — Internet Access |
| Graphic | `internet_access_scroller` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 3 |

## Description
A scroller with three scenes, each  a line chart, showing the rise in Internet access between 2005 and 2025 for the world, regional groupings, and income groups

## Data files copied
- `data/09_data_internet_access.csv`

## Scenes
- `world`: [emphasis: Worldwide], the share of people who access the Internet has increased from 16 percent only two decades ago to over 70 percent tod
- `income_groups`: Internet adoption mirrors an economy’s level of development: it is nearly universal  (94 percent) in [emphasis: high-income countries] but l
- `regions_groups`: Basic Internet access is lowest in [emphasis: Sub-Saharan Africa], where only around  one-third  of the population is online.

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
