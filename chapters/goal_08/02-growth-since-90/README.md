# Low income countries in 1990 have experienced markedly different growth paths

| | |
|--|--|
| Chapter | **08** — Economic growth |
| Graphic | `growth_since_90` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 4 |

## Description
Describe what the visualization shows

## Data files copied
- `data/08_data_lic_growth_rates.csv`

## Scenes
- `hic`: Of the countries classified as low income in 1990 one country has managed to move to [emphasis: high income] by 2024.
- `umc`: Four countries have moved to [emphasis: upper middle income].
- `lmc`: A number of countries experienced sufficient growth to be classified as [emphasis: lower-middle income ]by 2024.
- `lic`: And a group of countries have been unable to sustain growth sufficient to escape the [emphasis: low income ]classification after 25 years.

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
