# Worldwide, mobile broadband far surpasses fixed broadband adoption

| | |
|--|--|
| Chapter | **09** — Internet Access |
| Graphic | `mobile_vs_fixed_broadband` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 4 |

## Description
Scatterplot showing the number of fixed and mobile broadband subscriptions, per 100 people, by country

## Data files copied
- `data/09_data_mobile_fixed_broadband_subscriptions.zip`

## Scenes
- `global`: Between 2015 and 2025, fixed broadband levels doubled, reaching 20 subscriptions per 100 people. Meanwhile, [emphasis: mobile Internet conne
- `hic`: [emphasis: Fixed broadband] is common in many high-income countries. In [emphasis: Germany], for example, there are approximately 46 fixed b
- `income_levels`: But fixed broadband is nearly absent in low and lower middle-income economies. In [emphasis: Morocco][emphasis:  ]and[emphasis:  ][emphasis:
- `civ_sen`: Across much of the world, people connect to the Internet through mobile phones. In [emphasis: Morocco] and in [emphasis: Eswatini][emphasis:

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
