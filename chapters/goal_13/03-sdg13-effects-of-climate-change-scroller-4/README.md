# 40 percent of the global population is exposed to heatwaves

| | |
|--|--|
| Chapter | **13** — Climate |
| Graphic | `sdg13_effects_of_climate_change_scroller` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 3 |

## Description
Share of population exposed to heatwaves and location of areas exposed to heatwaves[emphasis: ]

## Data files copied
- `data/20260130_hazard_data_prepared.csv`

## Scenes
- `heatwave__sat__wld`: The impact of [emphasis: heatwaves] on the human body depends on other factors, such as humidity and wind. So, instead of using a simple tem
- `heatwave__sat__bbox`: [emphasis: Heatwaves] are mostly prevalent in the tropics. More than three-quarters of the global population exposed to heatwaves live in fo
- `heatwave__vec__wld`: Globally, 40 percent of the population is exposed to [emphasis: heatwaves]. The share of people exposed to [emphasis: heatwaves] is especial

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
