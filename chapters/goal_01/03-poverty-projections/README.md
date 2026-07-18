# Global poverty could increase if current trends continue

| | |
|--|--|
| Chapter | **01** — Extreme Poverty |
| Graphic | `poverty_projections` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 4 |

## Description
Global poverty projections to 2050 under various scenarios

## Data files copied
- `data/01_data_global_projections.zip`

## Scenes
- `rate4`: If all countries progress at Korea’s historical pace, global extreme poverty would be reduced to 1.2 percent by 2050.
- `rate2`: But copying Korea's trajectory will be difficult. If countries progress at the pace of Brazil or Türkiye, there will be modest declines.
- `typical`: If countries manage to progress at the typical speed observed since 1950, global extreme poverty will stand  at around 8.5 percent poverty b
- `rateH`: Unfortunately, the speed of global poverty reduction has slowed down over the past years, and if countries continue on their current paths, 

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
