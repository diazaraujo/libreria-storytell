# In most countries, men’s wages are higher, on average, than women’s

| | |
|--|--|
| Chapter | **05** — Gender and Jobs |
| Graphic | `sdg5_wage_gap_beeswarm` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 3 |

## Description
This is a beeswarm where the x-axis shows World Bank regions and each dot represents the ratio of women’s average wages to men’s average wages in a country. The y-axis shows this ratio. 

## Data files copied
- `data/wage_month.csv`

## Scenes
- `wage_ratio`: These dynamics are reflected in women’s earnings: in the average country or economy and looking at hourly pay, they earn 91 cents for every 
- `wage_ratio`: Of the 131 countries or economies with data, men are paid a higher hourly wage, on average, than women in 93 countries.
- `wage_ratio_month`: When measured in monthly earnings, the gap widens. As care and household responsibilities fall disproportionately on women, they are more li

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
