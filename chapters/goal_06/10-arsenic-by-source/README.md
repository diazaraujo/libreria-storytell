# Arsenic contamination levels are highest in wells—including tubewells—in Bangladesh

| | |
|--|--|
| Chapter | **06** — Water Access |
| Graphic | `arsenic_by_source` |
| Type | `vis` |
| Status | `ready` |
| Scenes | 0 |

## Description
Three charts presenting the proportion of people exposed to arsenic-contaminated drinking water by source: water wells at the top, piped water in the middle, and other sources at the bottom. Each chart represents the population using icons (one person = 1 percent), shaded according to their exposure level, with dark green indicating exposure above 10 ppb, and light green, above 50 ppb.

## Data files copied
- `data/ArsenicBySource.csv`

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
