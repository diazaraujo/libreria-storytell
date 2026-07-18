# Key data are missing for millions of children 

| | |
|--|--|
| Chapter | **17** — Data for Development |
| Graphic | `missing_children_data_waffles` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 4 |

## Description
Chart showing that key data are missing for children. Many children are living in economies lacking coverage in birth registries, learning assessments, nutrition data, etc.

## Data files copied
- `data/17_data_missing_children_data.zip`

## Scenes
- `birth_registration`: Around [emphasis: 195 million children] under five are unaccounted for in birth registries, making up about 30 percent of all children in th
- `birth_registration_regions`: These gaps are concentrated in specific regions. In [emphasis: Sub-Saharan Africa], around half of all children under five were never regist
- `stunting`: Around [emphasis: 207 million children] live in economies with no recent data on child growth, which are needed to measure malnutrition. In 
- `learn_assess`: Around [emphasis: 778 million children] aged 5–14—roughly half of all children that age—live in economies with no comparable learning assess

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
