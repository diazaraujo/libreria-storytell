# Climate — compare origin vs replica

**Date:** 2026-07-20  
**Origin:** `http://127.0.0.1:8765/en/atlas/climate/`  
**Replica story:** `http://127.0.0.1:8787/stories/climate/`  
**Replica chapters:** `http://127.0.0.1:8787/chapters/goal_13/…/?clean=1`  
**Map demo:** `http://127.0.0.1:8787/library/hazard-exposure-map/demo.html`

## Stack required for full fidelity

```bash
cd ~/atlas-replicas && bash scripts/dev-servers.sh
# Mapbox private tiles (mlambrechts.*):
python3 library/nightlights-hexmap/mapbox-proxy.py   # :8790
```

Tokens: `library/nightlights-hexmap/mapbox-config.js` (gitignored).

---

## Checklist (manual)

| Graphic | Origin cue | Replica | Status v1.1 |
|---------|------------|---------|-------------|
| Floods scroller | sat world → NW Europe bbox → vec choropleth | same scene ids + camera | **ok** (raster if proxy) |
| Drought scroller | sat → southern Africa bbox → vec | yes | **ok** |
| Cyclones scroller | sat/vec Caribbean bbox → vec world | yes | **ok** |
| Heatwave scroller | sat South Asia → vec | yes | **ok** |
| Overview | multi-hazard ranked + 57% narrative | callout chips + bars | **ok** (not identical layout) |
| Icon matrix | 1000 cells · region rows · SSF | hand matrix | **ok** (approx) |
| Exp × vuln scatter | region-colored, size by pop | sha_exp × sha_vuln | **ok** |
| Compare matrix | BFA/KEN · PHL/VNM | 10×10 grids | **ok** (simplified) |

### Hazard map detail

| Cue | Origin | Replica |
|-----|--------|---------|
| Projection | naturalEarth / globe chrome | **globe** |
| sat basemap | mapbox satellite | same |
| raster floods | mlambrechts.4s3qmpky step@50/255 cat1 | same + proxy |
| raster drought | .42umnzdv step band cat2 | same |
| raster cyclones | .cjvyvcle interpolate cat3 | same |
| raster heat | .224rew2o step seqR4 | same |
| vec fill | step on sha_* 0/1/10/20/30/40 | same breakpoints |
| bboxes | RE from BmkL22Hm | wired |

### Known deltas (acceptable for v1.1)

- Origin uses custom MapLibre/WB map chrome (tooltip column, disputed layers); replica uses mapbox-gl country-boundaries-v1.
- Icon matrix is geometric cells, not illustrated people icons.
- Overview is ranked bars + chips, not a multi-panel dashboard clone.
- Without `:8790`, sat mode still works (satellite + camera); rasters offline with badge note.

---

## Smoke commands

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8787/stories/climate/
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8790/health
node --check library/hazard-exposure-map/hazard-exposure-map.js
```

Captures (optional): drop PNGs in `recordings/compare/climate/` named `floods-sat|bbox|vec.png`.
