# RMNCH Service Coverage Change in High-Improvement Countries 

| | |
|--|--|
| Chapter | **03** — Health |
| Graphic | `rmnch_progress_scroller` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 3 |

## Description
_No description in config._

## Data files copied
- `data/03_data_rmnch_progress_scroller.zip`

## Scenes
- `1`: Countries such as Bangladesh, Sierra Leone, and Timor-Leste combined rapid declines in [emphasis: maternal mortality] with steady increases 
- `2`: Rwanda, Malawi, and Cambodia achieved some of the fastest reductions in [emphasis: under-five mortality] alongside substantial improvements 
- `3`: China, India, Cambodia, and Mongolia recorded rapid declines in[emphasis:  neonatal mortality] while expanding coverage of essential materna

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
