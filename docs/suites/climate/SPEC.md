# Climate suite (goal_13) — RE + quality plan

**Story:** Atlas `/climate/` · *Exposure, Vulnerability, and Adaptation to Climate Hazards*  
**Local origin:** `http://127.0.0.1:8765/en/atlas/climate/`  
**Status:** quality v1.1 (2026-07-20) — maps+rasters+matrix+story; residual = PNG captures only

---

## Graphics (Atlas order)

| # | Graphic | Type (RE) | Chapter | Fidelity target |
|---|---------|-----------|---------|-----------------|
| 1–4 | `sdg13_effects_of_climate_change_scroller` ×4 | **Mapbox map** sat → bbox → vec choropleth | `00`–`03` | gold map chrome |
| 5 | `sdg13_effects_of_climate_change` | multi-hazard ranked exposure | `04` | polished ranked bars |
| 6 | `sdg13_icon_matrix` | icon / people matrix (1 cell ≈ 8M) | `05` | hand matrix |
| 7 | `sdg13_regional_exposure_vuln` | regional exposure × vulnerability | `06` | region scatter/bars |
| 8 | `sdg13_icon_matrix` (variant) | mono BFA/KEN, PHL/VNM scenes | `07` | hand matrix scenes |

---

## Hazard map scroller (RE)

**Chunk:** `_app/immutable/chunks/BmkL22Hm.js`  
**CSS:** `13_effects_of_climate_change_scroller.COYp7wms.css`

### Scene id grammar

`{hazard}__{basemap}__{frame}`

| hazard | field | accent / ramp |
|--------|-------|---------------|
| floods | `sha_flood` | blue `rgb(195,227,245)` → `seqB3` → `seqB5` |
| drought | `sha_drought` | `seqY1` → `seqY3` → `seqY5` |
| cyclones | `sha_cyclone` | `seqP1` → `seqP3` → `seqP5` |
| heatwave | `sha_heatwave` | `seqY1` → `seqY2` → `seqR4` |

| basemap | meaning |
|---------|---------|
| `sat` | Mapbox satellite |
| `vec` | vector basemap + **country exposure fill** |

| frame | camera |
|-------|--------|
| `wld` | world |
| `bbox` / `bbox1` | hazard-specific bbox |

### Bboxes (lng/lat corners from chunk)

```
floods:   [2.666, 50.626, 8.201, 53.757]     # NW Europe
drought:  [9.668, -36.739, 41.66, -14.86]    # southern Africa
cyclones: [-99.272, 7.493, -59.0186, 32.101] # Caribbean / Gulf
heatwave: [60, 6.5, 120, 45.5]               # South / Central Asia
```

### Country fill (vec mode)

Mapbox `country-boundaries-v1`, property `iso_3166_1_alpha_3`, paint `step` on share exposed:

`0 → grey100 · 1 · 10 · 20 · 30 · 40+` on hazard ramp.

Optional raster layers (Atlas production, may need data token + proxy):

| hazard | source id | tileset |
|--------|-----------|---------|
| drought | drought_asi_1km | `mapbox://mlambrechts.42umnzdv` |
| floods | floodMapGL_rp10y | `mapbox://mlambrechts.4s3qmpky` |
| cyclones | cyclone_wind_6arcmin | (see chunk) |
| heatwave | heat_max5dESI_15arcmin | (see chunk) |

**Library:** `library/hazard-exposure-map/`

---

## Data

| File | Use |
|------|-----|
| `20260130_hazard_data_prepared.csv` | `code, sha_cyclone, sha_drought, sha_flood, sha_heatwave, sha_all` |
| `2010.csv` / `2024_noimp.csv` | vulnerability matrix: `sha_exp`, `sha_vuln`, `sha_risk`, `region_code`, pops |

---

## Implementation checklist

- [x] RE notes (this file)
- [x] `library/hazard-exposure-map` + wire scrollers 00–03 (sat → bbox → vec choropleth)
- [x] Icon matrix hand component (05, 07) — `library/climate-icon-matrix`
- [x] Regional exposure/vuln (06) true axes `sha_exp` × `sha_vuln`
- [x] Overview (04) polish + global callout chips
- [x] `stories/climate/` shell (quality v1)
- [x] Optional hazard rasters (`mlambrechts.*`) via `:8790` proxy (v1.1)
- [x] Side-by-side QA checklist (`COMPARE.md`)
- [x] Pixel micro-pass (note scale, mobile sticky heights on story)
- [ ] Optional PNG captures in `recordings/compare/climate/`
