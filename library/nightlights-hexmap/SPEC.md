# SPEC · nightlights-hexmap v0.8 (origin PP)

**Docs H3:** [Indexing API](https://h3geo.org/docs/api/indexing)  
**Canónico:** HexMapNigeria (`DlSiWm-L`) / HexMapEthiopia (`lCXcxewq`) / Map (`qsNowIZD`)

## Pipeline PP

```
h3.polygonToCells(aoi, 6)
  → Space2Stats VIIRS + pop + GHS rural%
  → h3.cellToBoundary(id, true)
  → clip centroid ∈ ADM0
  → Mapbox Standard monochrome + scene layers
```

## Origin match v0.8

| Elemento | Spec |
|----------|------|
| Basemap | **`mapbox://styles/mapbox/standard`** + `config.basemap.theme:"monochrome"` · labels/POI/roads/admin OFF |
| SDK | mapbox-gl **3.18** (origin) |
| Layer slot | `slot:"middle"` (Standard) |
| Scene switch | **opacity** 0↔on con transition **1000ms** (no visibility) |
| Paint order | **hexes-outlines under fills** (solid dark regions) |
| Bounds NG | `[2.5,4]→[15,14]` · Kano · cell exact |
| Bounds ET | `[33,3.3]→[48,15]` · SE `[38,3.3]→[45,8]` |
| NTL step | 100 / 500 · colors `#00204d` `#8b7c55` `#ffea46` |
| ET step | 100 · `#00204d` / `#95c4f3` |
| Outlines | grey200 `#CED4DE` w1 unfiltered |
| Labels hi | Lagos/PH/Abuja · white + `#222` halo |
| Power lines | `#eb5757` opacity 0.7 · dash Planned · width 1→6 kV |
| Hatch | diagonalhatch grey300 |
| fitBounds | padding bottom 60 · 850ms |

## Gaps residual (still real)

| Gap | Why |
|-----|-----|
| Private tilesets `mapbox://mlambrechts.u2grslzw` (NG hex), `.9ybjbhr1` (urban centers), `.rxtvtmrq` (ET hex), `.c02hylmk` (grid) | 404/403 with public tokens — H3 geojson substitute |
| Urban hatch footprints | GHSL urban centers tileset private → approx dense H3 cells |
| VIIRS cell values | Space2Stats vs Atlas tileset may differ slightly at thresholds |
| Origin on localhost | also 403 on same private tilesets (URL restrictions) |

## Demo

http://127.0.0.1:8787/library/nightlights-hexmap/demo.html
