# Ethiopia: progress in rural areas

| | |
|--|--|
| Chapter | **07** — Electricity Access |
| Graphic | `hexmap_ethiopia` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 4 |

## Description
Map of nighttime lights in Ethiopia as a proxy for electricity access. It focused on access progress in rural areas.

## Data files copied
_None matched automatically. Check Atlas `data/goal_*`._

## Scenes
- `nightlights12`: Let’s focus on Ethiopia’s [emphasis: rural areas only][footnote: Urban areas are left blank to focus on the nighttime lights view in rural a
- `nightlights12_powerlines`: The power grid lines reached only a few rural areas in 2012. So how did the illuminated rural areas have access to electricity? About 75 per
- `nightlights12_se`: Let’s focus on the [emphasis: south-east,] which is more sparsely populated and remained mostly in the dark in 2012[emphasis: .]
- `nightlights23`: By 2023, a lot more nighttime lights could be detected in the southeast. Much of this is due to the [emphasis: rapid uptake of solar electri

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
