# A quarter of the world’s population lacks access to safe drinking water

| | |
|--|--|
| Chapter | **06** — Water Access |
| Graphic | `safely_managed` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 3 |

## Description
Line chart showing the distribution of the global population across drinking water service levels from 2000 to 2024. Each line represents a service level—safely managed, basic, limited, unimproved, and surface water—and together they sum to 100 percent in each year. The chart illustrates how the composition of service levels has changed over time.

## Data files copied
- `data/Safely managed.zip`

## Scenes
- `scene1_Id`: [emphasis: Safely managed]: The highest service level, this is water from an[emphasis:  improved source] that is [emphasis: available on pre
- `scene2_Id`: [emphasis: Basic][emphasis: : From an improved source, often off-premises but within a 30-minute round trip and without guaranteed water qua
- `scene3_Id`: In 2024, one-tenth of the global population lacked even basic drinking water: 4 percent had access to an improved source but with a collecti

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
