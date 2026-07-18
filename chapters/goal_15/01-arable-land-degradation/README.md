# Four processes degrading arable land

| | |
|--|--|
| Chapter | **15** — Life on land |
| Graphic | `arable_land_degradation` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 5 |

## Description
World map showing the distribution of arable lands, and of the salinization, loss of organic carbon, erosion and aridity degradation processes.

## Data files copied
- `data/15_data_arable_land_degradation.csv`

## Scenes
- `arable_land`: Global arable lands cover 14.2 million square kilometers, 1.5 times the land area of the United States or China. This land is used for the p
- `salinization`: [emphasis: Salinization] is the process of accumulation of salts in the soil. It reduces plant growth, and can even make land unsuitable for
- `carbon_decline`: Organic carbon in the soil makes it fertile: it retains nutrients and water for plants, and makes it structurally stable. Agricultural pract
- `erosion`: A more important factor in the degradation of arable land is [emphasis: soil erosion]. Soil erosion happens when rainfall or water runoff de
- `aridity`: But by far the largest pressure for these agricultural systems is [emphasis: aridity]. Water resources are a subsystem of land, and under ar

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
