# The number of economies with high inequality has almost halved in the past three decades

| | |
|--|--|
| Chapter | **10** — Inequality |
| Graphic | `high_inequality_trend` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 2 |

## Description
The figure reports the number of economies with a Gini index over 40 for 1995–2024. The number of economies with high inequality has fallen from 72 in 1995 to 43 in 2024. The number of economies with low inequality, defined as those with Gini index under 30, has increased from 22 in 1995 to 33 in 2024. 

## Data files copied
- `data/10_data_high_inequality_trend.csv`

## Scenes
- ``: The number of economies with  high inequality (Gini index > 40) has decreased substantially since the 1990s. In 1995, 72 economies had high 
- ``: At the same time, the number of economies with low inequality (Gini index < 30) increased from 22 in 1995 to 33 in 2024, underlining the pro

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
