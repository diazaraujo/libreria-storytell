# Women’s labor force participation is over 350 years away from equality

| | |
|--|--|
| Chapter | **05** — Gender and Jobs |
| Graphic | `sdg5_350_years` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 8 |

## Description
This is a line chart with the number of years before reaching equality on the x-axis and the rate of female labor force participation on the y-axis. The line shows the typical path and how much progress has been made by individual countries from 2015.

## Data files copied
- `data/05_data_typical_path_speeds.zip`

## Scenes
- `intro_drawTypical`: Imagine a country with nearly no women in the labor force.
- `example850`: If this country took the typical path of progress, it would take 825 years for women’s labor force participation to reach 80 percent, which 
- `example850_draw2024`: With the global average at 55 percent in 2024, this means women are still over 350 years away from reaching parity with men. So, are there a
- `exampleTurkiye_1`: Türkiye is one example. In 2015, women’s labor force participation stood at 34 percent.
- `exampleTurkiye_2`: By 2024, it had risen to nearly 42 percent—an increase of 7.8 percentage points.
- `exampleTurkiye_3`: But for a typical country or economy, this increase would take 36 years.
- `exampleTurkiye_4`: Türkiye has made notable gains in women’s participation, progressing four times faster than a typical country or economy.
- `explore`: Use the drop-down menu to explore where different countries and economies  stand today, how fast they have progressed since 2015, and how fa

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
