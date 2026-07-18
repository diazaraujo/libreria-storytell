# Safely managed drinking water access is determined by the lowest value of the three component

| | |
|--|--|
| Chapter | **06** — Water Access |
| Graphic | `estimating` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 2 |

## Description
Three-column charts show the components of safely managed drinking water among people using improved water sources. The left column represents water that is free from contamination; the middle column, water that is accessible on premises; and the right column, water that is available when needed. The first scene shows data for Mongolia; the second, for Nepal.

## Data files copied
- `data/Indicator.csv`

## Scenes
- `scene1`: For example, [emphasis: in Mongolia], 84 percent of individuals with improved water sources have water available when needed, and 82 percent
- `scene2`: Conversely, [emphasis: in Nepal], accessibility and availabilityare relatively high (around 80 percent each), but [emphasis: only 16 percent

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
