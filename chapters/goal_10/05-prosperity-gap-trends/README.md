# Global Prosperity Gap has halved in the last four decades

| | |
|--|--|
| Chapter | **10** — Inequality |
| Graphic | `prosperity_gap_trends` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 6 |

## Description
This chart reports the trend in Prosperity Gap from 1981 to 2026. It reports the trends for the world, regions, and select countries.

## Data files copied
- `data/10_data_prosperity_gap_timeseries.csv`

## Scenes
- `world`: The Global Prosperity Gap has more than halved from over [emphasis: 13 ]in [emphasis: 1981 ]to  less than [emphasis: five ]in [emphasis: 202
- `regions_eas`: All regions have made significant progress since 1981, with East Asia and Pacific standing out, having the largest (21) to the third lowest 
- `regions_ssf`: But  the most recent decade has seen stagnation in the Prosperity Gaps in two regions: Middle East, North Africa, Afghanistan & Pakistan and
- `countries_percol`: Colombia’s and Peru’s Prosperity Gaps have experienced similar developments in recent decades, including periods of increasing gaps, most no
- `countries_eth`: In Ethiopia, the level today is half what it was in the 1980s, although this hides faster progress in the 1990s and early 2000s, and a stagn
- `countries_moz`: Worryingly, in some Sub-Saharan African economies, such as Mozambique, improvements in the Prosperity Gap have stalled over the last two dec

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
