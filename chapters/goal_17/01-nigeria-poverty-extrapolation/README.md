# Nigeria’s rate of extreme poverty

| | |
|--|--|
| Chapter | **17** — Data for Development |
| Graphic | `nigeria_poverty_extrapolation` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 4 |

## Description
Comparison of extrapolated versus actual survey-based poverty estimates for Nigeria (2018–22), showing how national accounts-based projections underestimated the true poverty rate revealed by the 2022 household survey.

## Data files copied
- `data/17_data_nigeria_poverty.csv`

## Scenes
- `initial_survey`: In 2018, survey estimates revealed that around 34 percent of Nigerians (71 million people) were living in extreme poverty.
- `extapolation`: Without updated survey data, poverty monitoring between 2018 and 2022 relied on model-based projections, which estimated that the poverty ra
- `new_survey`: The 2022 survey data revealed that the poverty rate was actually 41.8 percent, substantially higher than the projected 34.8 percent.
- `difference`: The seven percentage point discrepancy corresponds roughly to [emphasis: an additional 17 million additional Nigerians living in extreme pov

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
