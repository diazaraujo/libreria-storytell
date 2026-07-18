# Income group classification

| | |
|--|--|
| Chapter | **08** — Economic growth |
| Graphic | `income_classification_scroller` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 6 |

## Description
Describe what the visualization shows

## Data files copied
- `data/08_data_income_levels.csv`

## Scenes
- `income_1990`: The threshold for being a low income country was 610 USD in 1990. Countries with GDP per capita below this level were classified as low inco
- `income_2024`: The threshold for being a low income country is updated annually for inflation. By 2024 the threshold stood at 1,135 USD.
- `income_change`: Compared to 1990, many countries managed to move to a higher income class by 2024.
- `escapees`: 28 countries managed to escape low income - Guyana even making it to high income.
- `fallen`: However, five additional countries have since been classified as low income.
- `gdp_growth`: The countries currently classified as low income have had average GDP per capita growth rates of 0.47 percent per year since 1981. A recent 

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
