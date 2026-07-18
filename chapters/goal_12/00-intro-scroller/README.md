# Fossil fuel subsidies

| | |
|--|--|
| Chapter | **12** — Energy sources |
| Graphic | `intro_scroller` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 6 |

## Description
Describe what the visualization shows

## Data files copied
- `data/12_1_global.zip`

## Scenes
- `column_total`: Globally, government spending on fossil fuel subsidies in the period 2015-2022 has more than tripled to USD 1.3 trillion. The largest year-o
- `column_pct_gdp`: Also when measured as a share of GDP, global fossil fuel subsidies have increased substantially from 0.46 percent of global GDP in 2015 to 1
- `map_pct_change`: Over this time period fossil fuel subsidies as a percent of GDP increased in 121 out of 168 countries with data available. On average, fossi
- `map_pct_gdp`: Following the increased subsidies in 2022, 23 countries spent at least 5% of GDP - up from 11 countries in 2015. Algeria topped the list, sp
- `bubble_high`: Fossil fuel subsidies per capita tend to rise with country income as the consumption of fossil fuels also increase, particularly among expor
- `bubble_low`: Some high-income countries have kept subsidies at fairly low levels below USD 30 per capita, including Finland, Sweden, and Portugal as well

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
