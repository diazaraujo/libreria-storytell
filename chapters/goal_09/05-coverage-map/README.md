# Most of the world is covered by 3G and 4G networks. Sub-Saharan Africa is the least connected region

| | |
|--|--|
| Chapter | **09** — Internet Access |
| Graphic | `coverage_map` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 4 |

## Description
Three choropleth world maps showing levels of country coverage for at least 3G, 4G, and 5G networks

## Data files copied
- `data/09_data_network_coverages.csv`

## Scenes
- `coverage_3G`: 96 percent of the global population lives within reach of at least a  3G network.
- `coverage_4G`: Although 4G networks cover over 93 percent of the people in the world, [emphasis: there are large gaps in] [emphasis: low-income economies, 
- `coverage_5G`: 5G is widely available in many high-income economies. In some upper- and lower-middle-income countries like [emphasis: China], [emphasis: In
- `coverage_5G`: In Sub-Saharan Africa, the deployment of 5G remains largely confined to a few high-density urban areas, and only [emphasis: Mauritius][empha

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
