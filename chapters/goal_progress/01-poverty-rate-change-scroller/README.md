# The relationship between changes in poverty and levels of poverty

| | |
|--|--|
| Chapter | **progress** — Measuring Progress |
| Graphic | `poverty_rate_change_scroller` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 20 |

## Description
Shows the typical changes in poverty rates as a function of initial changes in poverty rates, and how this predicts typical trajectories of poverty rates.

## Data files copied
- `data/progress_data_poverty_rate_change.zip`

## Scenes
- `all`: First, we use all poverty data around the world since 1950 to plot changes in poverty rates over five years as a function of the poverty rat
- `median`: Next, we estimate the typical change in poverty as a function of the level of poverty. That is, we divide the observed changes so that at ev
- `median_explanation1`: Changes in poverty are typically smallest (in absolute terms) for very low and very high poverty rates and largest for poverty rates around 
- `median_explanation2`: A country with a 50 percent poverty rate typically decreases poverty by 0.72 percentage points the following year…
- `median_explanation3`: …while a country with a 5 percent poverty rate typically decreases poverty by 0.22 percentage points the following year.
- `country1_15`: From this, we can trace out a typical trajectory from any starting point. If we look at Côte d’Ivoire’s 2015 poverty rate of 26.3 percent, t
- `country1_16`: So, if Côte d’Ivoire had followed the typical pattern, in 2016, its poverty rate would have been 25.6 percent.
- `country1_25`: Following this method iteratively, we can trace the typical path a country with Côte d’Ivoire’s starting point would have followed over 10 y
- `country1_actual`: Next, we compare that with Côte d’Ivoire’s actual trend from 2015 to 2025.
- `country1_end`: The progress Côte d’Ivoire achieved between 2015 and 2025 would have typically taken until 2033. In other words, Côte d’Ivoire achieved in 1
- `country2`: If we do the same for Georgia, we can see that its progress over 10 years was equivalent to what typically takes 26 years, giving us a speed
- `start_s_curve`: Let us now take a look at the pathway for a country that starts entrenched in extreme poverty.
- … +8 more

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
