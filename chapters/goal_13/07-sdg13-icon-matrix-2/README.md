# Population at high risk depends on both exposure and vulnerability

| | |
|--|--|
| Chapter | **13** — Climate |
| Graphic | `sdg13_icon_matrix` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 4 |

## Description
The figure shows comparisons between countries, where the share of people at high risk differs greatly, despite having similar levels of exposure or vulnerability. 

## Data files copied
- `data/climate_vulnerability.zip`

## Scenes
- `mono__grid__vul__bfa_ken`: [emphasis: Burkina Faso ]and [emphasis: Kenya ]have similar levels of [emphasis: vulnerability]. In both countries, around 9 in 10 people  a
- `mono__diff__vul_exp__bfa_ken`: But [emphasis: exposure ]to climate hazards is three times higher in [emphasis: Burkina Faso]. Combining the number of vulnerable and expose
- `mono__grid__exp__phl_vnm`: Similarly, in East Asia and Pacific, almost 9 in 10 people in the [emphasis: Philippines ]and [emphasis: Vietnam] are [emphasis: exposed ]to
- `mono__diff__exp_vul__phl_vnm`: But despite their similar [emphasis: exposure ]profiles, slightly more than half the population of the [emphasis: Philippines ]is at risk, c

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
