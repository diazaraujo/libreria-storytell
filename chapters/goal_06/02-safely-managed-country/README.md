# Access to safely managed drinking water is low in Sub-Saharan Africa and small island economies in the Pacific

| | |
|--|--|
| Chapter | **06** — Water Access |
| Graphic | `safely_managed_country` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 3 |

## Description
A grid map displays the share of the population using safely managed drinking water services by country, using equally sized tiles.  Countries are shaded according to their level of access, with darker colors indicating higher coverage and lighter colors, lower coverage. Gray shading indicates missing data or no available estimates.

## Data files copied
- `data/Country_SafelyManaged_2024.csv`

## Scenes
- `scene1`: Data on access to safely managed drinking water services are available for 148 countries for 2024. Due to insufficient water monitoring or t
- `scene2`: Among the countries with data available, only 29 have achieved universal (99 percent or higher) access to safely managed drinking water.[foo
- `scene3`: Low access is concentrated in Sub-Saharan Africa, where less than half of the populations has access to safe drinking water in 22 of the 25 

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
