# Electricity access is advancing globally and across all regions

| | |
|--|--|
| Chapter | **07** — Electricity Access |
| Graphic | `access_electricity_regions` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 5 |

## Description
Line charts describing time series trendlines of electricity access by region and the world.

## Data files copied
- `data/07_data_access_electricity.csv`

## Scenes
- `global`: Global access to electricity has expanded steadily over the past two decades. By 2023, more than 90 percent of the world’s population had ac
- `all`: Most regions already had very high levels of access in 2000, and had achieved near-universal access to electricity by 2023.
- `sas_ssf`: Two regions, South Asia and Sub-Saharan Africa lagged noticeably in 2000.
- `sas`: But South Asia has since made dramatic progress, from less than 60 percent of the population in 2000 to  near universal access by 2021.
- `ssf`: Sub-Saharan Africa started from an even lower base (around 26 percent in 2000). Although the share of people with access doubled over the ne

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
