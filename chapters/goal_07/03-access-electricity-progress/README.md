# Ethiopia’s progress towards universal electrification outpaced Nigeria and the Democratic Republic of Congo 

| | |
|--|--|
| Chapter | **07** — Electricity Access |
| Graphic | `access_electricity_progress` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 4 |

## Description
Chart showing how the speed of progress in achieving electricity access varies between countries. It focuses on Ethiopia, the Democratic Republic of Congo, and Nigeria.

## Data files copied
- `data/07_data_access_electricity_countries.csv`

## Scenes
- `access_15`: In 2015, both Ethiopia and the Democratic Republic of Congo lagged Nigeria in electricity access.
- `access_23`: By 2023, the share of Democratic Republic of Congo’s population with access to electricity had increased only slightly, while Ethiopia had a
- `progress`: Ethiopia is one of the countries that progressed the fastest over the 2015–2023 period. Nigeria and the Democratic Republic of Congo, on the
- `all_countries`: Now, explore all countries by hovering over the arrow heads or searching for a country in the drop-down menu.

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
