# 775 million people are exposed to floods globally

| | |
|--|--|
| Chapter | **13** — Climate |
| Graphic | `sdg13_effects_of_climate_change_scroller` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 3 |

## Description
Share of population exposed to floods and location of areas exposed to flood risk

## Data files copied
- `data/20260130_hazard_data_prepared.csv`

## Scenes
- `floods__sat__wld`: [emphasis: Floods] can severely damage infrastructure and homes, disrupt the economy, and destroy crops and livestock. Impacts become partic
- `floods__sat__bbox1`: The [emphasis: population exposed to ][emphasis: floods] live near rivers, in areas with low elevation, and near the coast. In The Netherlan
- `floods__vec__wld`: Globally, [emphasis: 775 million people are exposed to] [emphasis: floods.] Half of them live in three populous countries: China, India, and

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
