# Progress in improving water quality lags progress in availability and accessibility

| | |
|--|--|
| Chapter | **06** — Water Access |
| Graphic | `tanzania_typical_progress` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 5 |

## Description
Three line charts showing the share of population meeting each component of safely managed drinking water—quality, accessibility, and availability—from 2000 to 2024. Each line represents one component, and the slope indicates how quickly it is changing. In the final two scenes, the charts compare progress in Tanzania with the typical trajectory.

## Data files copied
- `data/06_data_drinking_water_progress.zip`

## Scenes
- `tanzania_start`: In 2000, nearly 15 percent of people in [emphasis: Tanzania ]had access to uncontaminated water, but only 1 percent had access to water on p
- `tanzania_progress`: Over the next two decades, accessibility improved dramatically but improvements in water quality were more limited. Infrastructure expanded 
- `scene2_Id`: Is this pattern unique to Tanzania? Let’s take a look at the average path of[emphasis:  progress across countries ]from 2000 to 2024. Using 
- `scene3_Id`: The contrast is striking. On the typical path, increasing water accessibility from 40 percent to 75 percent of the population would take 33 
- `scene4_Id`: Achieving the same scale of progress in water quality would take 101 years, or three times longer.

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
