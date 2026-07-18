# Urban areas offer jobs of a variety of skills

| | |
|--|--|
| Chapter | **11** — Urban Development |
| Graphic | `skill_violin` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 5 |

## Description
This chart shows the specialization indicator defined in the body of the story. Each dot represents the value in one of three levels of skills (low, medium, high) and either in rural or urban areas of a country. So each country has 6 dots in this chart. The specialization values are displayed on the x-axis and grouped first by urban and rural and then by skill, so you can compare across all six categories. The further right the dot is from one, greater is the specialization rate. The further left the dot is from one, lower is the specialization rate.

## Data files copied
- `data/11_data_skill_beeswarm.zip`

## Scenes
- `1`: Each [emphasis: dot represents a country or an economy]. If a job is more specialized than employment overall, the indicator is above 1 for 
- `1`: Let’s take [emphasis: Indonesia] as an example, where the specialization value for low-skill jobs in rural areas is 1.07 and in urban areas 
- `1`: Similarly, medium-skill jobs are only 5 percent more common in rural areas and 4 percent less common in urban areas.
- `1`: High-skill jobs have the starkest contrast: they are 30 percent more common in urban areas and 40 percent less common in rural areas.
- `2`: More generally, low- and medium-skill jobs are roughly in proportion to overall employment in rural areas (with specialization rates around 

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
