# Retail price versus Efficient Price, by country

| | |
|--|--|
| Chapter | **12** — Energy sources |
| Graphic | `efficient_price_scroller` |
| Type | `vis` |
| Status | `ready` |
| Scenes | 3 |

## Description
Bar charts depicting the same data with country-level granularity follow.

## Data files copied
- `data/fossil_fuel_subsidy_20250920.zip`

## Scenes
- `case_1`: [emphasis: High-income countries & diesel: ]A liter of diesel costs slightly below $1.00 (2021 prices). High-income countries typically set 
- `case_2`: [emphasis: High-income countries & gasoline: ]In 2022, the international price of gasoline has been roughly around $0.8 per liter (2021 pric
- `explore`: [emphasis: Explore the data for different fuels and income groups]

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
