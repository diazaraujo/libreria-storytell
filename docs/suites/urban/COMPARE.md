# Urban development — compare origin vs replica

**Date:** 2026-07-20  
**Origin:** `http://127.0.0.1:8765/en/atlas/urban-development/`  
**Replica:** `http://127.0.0.1:8787/stories/urban-development/`  
**Quality pass:** **v2** (10/10 chapter graphics)

## Checklist

| # | Graphic | Origin cue | Replica | v2 |
|---|---------|------------|---------|----|
| 0 | urban_rural_pop_scroller | region U/R lines, scene regions | `urban-pop-scroller` WLD→NAC/LCN→EAS→SSF | **ok** |
| 1 | city_map | city points grow 2000→2050 | canvas points, mega/mid scenes | **ok** (not Mapbox basemap) |
| 2 | urban_gdp_scatterplot | urb% × GDP | scatter + income-ish colors | **ok** |
| 3 | skill_violin | beeswarm skill × U/R, IDN | `urban-skill-swarm` | **ok** |
| 4 | skill_violin_groups | ISCO occupation labels | full ISCO names from Atlas config | **ok** |
| 5 | pay_beeswarm | urban pay premium % | zero-line beeswarm | **ok** |
| 6 | buildup_area_overtime | Addis area (+pop) | dual series area/pop | **ok** |
| 7 | slum_regions | regional slum share | multi-line region colors | **ok** |
| 8 | slum_waffle | people in slums +25% | dual-year unit chart | **ok** |
| 9 | buildup_area_income | built-up by income | multi-line HIC–LIC | **ok** |

## Known deltas

- City map is equirectangular canvas, not a full Mapbox/WebGL globe (performance: 9k–15k points).
- GDP scatter uses sqrt-Y for readability (Atlas may use log); color bands approximate income groups by GDP.
- Occupation swarm shows all 10 ISCO rows; Atlas may use violin density shapes — beeswarm is intentional shared pattern with skill chart.

## Smoke

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8787/stories/urban-development/
node --check library/city-points-map/city-points-map.js
node --check library/urban-pop-scroller/urban-pop-scroller.js
node --check library/urban-skill-swarm/urban-skill-swarm.js
```
