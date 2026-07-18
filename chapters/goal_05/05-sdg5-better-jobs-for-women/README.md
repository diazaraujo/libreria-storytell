# A tale of two countries: similar labor force participation, different types of employment

| | |
|--|--|
| Chapter | **05** — Gender and Jobs |
| Graphic | `sdg5_better_jobs_for_women` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 4 |

## Description
This is a stacked bar chart. There are four bars: one for women in Tanzania, one for men in Tanzania, one for women in Switzerland and one for men in Switzerland. The stacks show the distribution of employment status.

## Data files copied
- `data/05_data_types_employment_gender.csv`

## Scenes
- `tza_che`: Among the employed, some are wage and salaried workers, while others are in more precarious forms of work, categorized as vulnerable employm
- `che`: In Switzerland, over 80 percent of men and women are waged or salaried—over 8 in 10 men and women and only 1 in 10 employees fall into the v
- `tza__vulnerable`: In Tanzania, the pattern is entirely flipped: the labor market is dominated by workers in vulnerable employment, with about 9 in 10 women an
- `tza__wage`: This means that only 1 in 10 women hold waged or salaried jobs, that is half the rate for men, 2 in 10 of whom are in waged and salaried wor

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
