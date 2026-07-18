# Several countries have eliminated poverty since 1950

| | |
|--|--|
| Chapter | **01** — Extreme Poverty |
| Graphic | `poverty_scroller` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 9 |

## Description
Poverty trends across selected countries from 1950-2025 as well as projections to 2050 for selected countries that still have high poverty rates. 

## Data files copied
- `data/01_data_country_poverty.zip`

## Scenes
- `korea`: Since the aftermath of the Korean War, Korea evolved from being heavily burdened by extreme poverty to having virtually eliminated it. In [e
- `other_reducers`: Japan, China, Thailand, and Bangladesh have embarked on similarly impressive journeys.
- `highlight_80`: These countries all had moments—at different points in time— where [emphasis: half the population] was living in extreme poverty…
- `shifted`: …and they all managed to reduce the share of people living in extreme poverty to [emphasis: 1 in 10 ]over a span of 10–30 years.
- `shifted_nonasia`: It is not just countries in Asia that have undergone such declines; others—including Brazil and Türkiye—have experienced similar, albeit sli
- `on_track`: Some countries have yet to achieve low poverty rates, but are on a promising path. Rwanda, for example, is estimated to have reduced extreme
- `on_track_projections`: If  it  continues this pace of progress,  Rwanda will reduce extreme poverty to less than 10 percent by 2050.
- `like_rwanda`: And Rwanda is not alone. It is one of 10 countries, mostly in Sub-Saharan Africa, that are on a pathway to reducing poverty to less than 10 
- `left_behind`: But another 43 countries are on a less encouraging trend. With their current speed of progress—or lack of it—they will continue to suffer fr

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
