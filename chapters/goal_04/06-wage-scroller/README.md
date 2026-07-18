# Earnings for those with tertiary are higher and grow faster

| | |
|--|--|
| Chapter | **04** — Learning and Work |
| Graphic | `wage_scroller` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 4 |

## Description
Line charts showing wage profiles for workers with differing levels of education for India and Brazil.

## Data files copied
- `data/04_data_wage_scroller.csv`

## Scenes
- `india_1`: To see how learning (as measured through on-the-job productivity) evolves over a career, let us take a look at workers in [emphasis: India].
- `india_2`: In comparison, workers at the start of their careers with a tertiary degree are already earning around 75% more than their counterparts who 
- `india_3`: Over time, this wage gap continues to grow. By the end of their careers, workers with a tertiary degree have more than triple the wages as w
- `brazil`: [emphasis: Brazil ]shows a similar, but even more pronounced, divergence. Entry hourly wages for those who did not complete primary educatio

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
