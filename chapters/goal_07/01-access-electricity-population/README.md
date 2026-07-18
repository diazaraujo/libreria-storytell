# There are fewer people without electricity, even as the global population grows

| | |
|--|--|
| Chapter | **07** — Electricity Access |
| Graphic | `access_electricity_population` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 6 |

## Description
Chart decomposing global access to electricity by regions, then zooming in on Sub-Saharan Africa, which it decomposes by country.

## Data files copied
- `data/07_data_access_electricity_population.zip`

## Scenes
- `global_population`: While the global population has increased by almost 2 billion people since 2000…
- `global`: … the number of people without electricity halved, falling from 1.3 billion in 2000 to 666 million in 2023.
- `regions`: All regions, except Sub-Saharan Africa, contributed to this rapid decline, particularly South Asia. In 2000, both South Asia and Sub-Saharan
- `saf`: In 2023, Sub-Saharan Africa was home to 581 million people without electricity. This translates to nearly 9 in 10 of the world’s people livi
- `ssf_countries`: And just eight countries account for half the world’s people who still lack access to electricity.
- `countries_highlight`: Over one-third of the global population without electricity live in the region’s most populous nations: [emphasis: Nigeria], the [emphasis: 

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
