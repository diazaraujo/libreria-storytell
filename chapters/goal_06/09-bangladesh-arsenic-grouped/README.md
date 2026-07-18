# In Bangladesh, rural dwellers and poorer people are more exposed to arsenic-contaminated water

| | |
|--|--|
| Chapter | **06** — Water Access |
| Graphic | `bangladesh_arsenic_grouped` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 2 |

## Description
Three bar charts showing the share of Bangladesh’s population exposed to arsenic contamination in drinking water, grouped by concentration levels of 10–50 ppb and above 50 ppb. The left column shows rural populations; the middle column, urban populations; and the right column, the total population. In the next scene, the same data are presented by wealth quintiles, with the poorest on the left, the middle in the center, and the richest on the right.

## Data files copied
- `data/Bangladesh_arsenic_by_group.csv`

## Scenes
- `scene1`: Rural dwellers in Bangladesh are more exposed to arsenic-contaminated water than their urban counterparts. About 12 percent of people in rur
- `scene2`: Looking at arsenic contamination by wealth quintiles, people in the poorer and middle wealth quintiles face greater exposure than those in t

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
