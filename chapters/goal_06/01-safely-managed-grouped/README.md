# Access to safely managed drinking water remains much lower in rural areas

| | |
|--|--|
| Chapter | **06** — Water Access |
| Graphic | `safely_managed_grouped` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 3 |

## Description
Two line charts showing the distribution of the global population across drinking water service levels from 2000 to 2024, one for urban areas and one for rural areas. In the first scene, each line represents a service level—safely managed, basic, limited, unimproved, and surface water—and together they sum to 100 percent in each year. In the next scene, line charts are shown for eight regions, including the world. For each region, two line charts—urban and rural—show trends in safely managed drinking water access over the same period. In the final scene, South Asia and Sub-Saharan Africa are highlighted.

## Data files copied
- `data/Safely managed.zip`

## Scenes
- `scene1`: While the proportion of urban dwellers with [emphasis: safely managed] drinking water remained stable at just over 80 percent between 2000 a
- `scene2`: Despite this progress,  rural access still lags urban access in regions with available data, with a global gap of about 20 percentage points
- `scene3`: [emphasis: South Asia] is an exception: the　urban–rural gap narrowed sharply between 2000 and 2024 as access expanded in rural areas. [empha

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
