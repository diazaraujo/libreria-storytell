# Efficient fuel price

| | |
|--|--|
| Chapter | **12** — Energy sources |
| Graphic | `efficient_price_explanation` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 10 |

## Description
Describe what the visualization shows

## Data files copied
_None matched automatically. Check Atlas `data/goal_*`._

## Scenes
- `intro`: The “efficient price” of a fuel is its cost after externalities have been factored in.
- `price_at_pump`: Firms or households pay a price at the pump. This is the retail price.
- `subsidy`: The amount firms and individuals pay is reduced by government subsidies intended to keep affordable. This amount is added to the retail pric
- `externalities_intro`: There are more costs on top of this, which are burdened by society at large.
- `air_pollution`: Burning fuels emits air pollution, which impacts life expectancy locally and across borders.
- `congestion`: Vehicles cause congestion and deteriorate roads, which must then be repaired to allow the continued operation.
- `global_warming`: In addition, fossil fuels release carbon dioxide into the atmosphere, which contributes to global warming.
- `forgone_vat`: On top of all of that, governments forgo collecting VAT on fuels, which acts as an additional implicit subsidy via lost tax revenues.
- `externalities_outro`: Together, these types of costs are labelled externalities, or external costs.
- `outro`: When you add the [emphasis: private/supply costs] and the [emphasis: external costs] together, you get the [emphasis: efficient price].

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
