# Levels of fecal contamination risk

| | |
|--|--|
| Chapter | **06** — Water Access |
| Graphic | `ecoli_table` |
| Type | `vis` |
| Status | `ready` |
| Scenes | 0 |

## Description
Table showing <i>E. coli</i> risk levels based on the number of CFU per 100 mL of water. Risk levels are classified as low (fewer than 1 CFU per 100 mL), moderate (1 to 10), high (11 to 100), and very high (more than 100).

## Data files copied
- `data/E-coli Table.csv`

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
