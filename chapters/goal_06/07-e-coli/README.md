# <i>E. coli</i> contamination at point of use is worse than at point of water collection

| | |
|--|--|
| Chapter | **06** — Water Access |
| Graphic | `e_coli` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 3 |

## Description
Dumbbell chart comparing E. coli contamination levels at point of collection and point of use, showing contamination at source and after water is stored or handled in households in 30 countries. The difference between these two stages, highlights how contamination can change between collection and use.

## Data files copied
- `data/Ecoli_PoC_PoU_Scatter (High+Very High).csv`

## Scenes
- `scene1`: Let’s look at the shares of people who use water with high and very high E. coli  risk levels at[emphasis:  ][emphasis: point of collection]
- `scene2`: Contamination rates are even higher when measured at [emphasis: point of use] (the water actually consumed within the household). In 26 coun
- `scene3`: In 28 countries, contamination levels [emphasis: at ][emphasis: point of use] were higher than at [emphasis: point of collection]. For examp

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
