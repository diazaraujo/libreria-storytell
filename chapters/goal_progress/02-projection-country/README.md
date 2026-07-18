# Possible poverty targets for Côte d'Ivoire

| | |
|--|--|
| Chapter | **progress** — Measuring Progress |
| Graphic | `projection_country` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 4 |

## Description
The visualization shows poverty rates Côte d'Ivoire could target by 2050. 

## Data files copied
- `data/progress_data_poverty_projection_country.zip`

## Scenes
- `past_decade`: In 2025, Côte d’Ivoire’s poverty rate was 16.1 percent.
- `speed_double`: At the typical speed of progress, poverty will be driven down to 6.3 percent in 2050. This is one possible 2050 target for Côte d’Ivoire.
- `speed_typical`: But Côte d’Ivoire moved almost twice as fast as the typical speed in the past decade. If it continues at a speed of two, it would reach a po
- `speed_4x`: It could also choose an even more ambitious target, such as moving at four times the typical speed. This would reflect some of the fastest m

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
