# Women spend more time in unpaid work and men spend more time in paid work

| | |
|--|--|
| Chapter | **05** — Gender and Jobs |
| Graphic | `unpaid_time_animation` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 4 |

## Description
This chart first shows the distribution of the average number of hours spent by men and women in unpaid work and in paid work. There are four dots for each country. In the last scene we see the correlation between unpaid care work for men and women with their labor force participation rates.

## Data files copied
- `data/unpaid-work.zip`

## Scenes
- `beeswarm__unpaid`: Across all countries and economies, women do the majority of unpaid work…
- `beeswarm__paid_unpaid`: …While men spend more time in paid work.
- `scatter_f`: The burden of unpaid work has implications for women’s ability to take up paid work opportunities. Female labor force participation is espec
- `scatter_mf`: Even when women have a paid job, they continue performing most of their household’s unpaid work. In countries with high levels of female lab

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
