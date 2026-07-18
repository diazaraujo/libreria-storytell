# Countries face different challenges in achieving access to safely managed drinking water 

| | |
|--|--|
| Chapter | **06** — Water Access |
| Graphic | `limiting_factors` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 4 |

## Description
Three-column charts showing the components of safely managed drinking water among people using improved water sources. The left column represents water that is free from contamination, the middle column, water that is accessible on premises, and the right column, water that is available when needed. The first scene shows charts for six countries where water quality is the limiting factor. The second scene shows charts for five countries where accessibility is the limiting factor. The third scene shows charts for four countries where availability is the limiting factor. In the final scene, a grid map shows countries as equally sized tiles, each displaying a level of access to safely managed drinking water and its three components: accessibility, availability, and water quality. Within each tile, bars represent the level of each component, allowing comparison of limiting factors across countries.

## Data files copied
- `data/Limiting Factors.csv`

## Scenes
- `scene1`: In several Pacific Island nations, including Tuvalu, Nauru, and Tonga, the share of people with water[emphasis:  ][emphasis: free from conta
- `scene2`: [emphasis: Accessibility] is a major challenge in many Sub-Saharan African countries, such as Democratic Republic of the Congo, Malawi, Guin
- `scene3`: Water is considered available when needed if households report having sufficient water or access to it most of the day.[footnote:  For examp
- `scene4`: The map presents the limiting factor for safely managed drinking water access in 148 countries. Please note that countries shaded gray have 

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
