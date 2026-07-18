# Urban areas offer a variety of occupations

| | |
|--|--|
| Chapter | **11** — Urban Development |
| Graphic | `skill_violin_groups` |
| Type | `vis` |
| Status | `ready` |
| Scenes | 0 |

## Description
This chart shows the specialization indicator defined in the body of the story. Each dot represents the value in one of 10 occupations (further classified into three economic activities: agriculture, industry, and services) and either in rural or urban areas of a country. So each country has 20 dots in this chart. The specialization values are displayed on the x-axis and grouped first by urban and rural and then by occupation, so you can compare across all 20 categories. The further right the dot is from one, greater is the specialization rate. The further left the dot is from one, lower is the specialization rate.

## Data files copied
- `data/11_data_skill_violin.csv`

## Scenes
_Single-view (no scroller scenes)._

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
