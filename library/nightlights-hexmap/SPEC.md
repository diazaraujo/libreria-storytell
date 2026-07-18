# SPEC · nightlights-hexmap v0.9 (origin tiles residual)

**Docs H3:** [Indexing API](https://h3geo.org/docs/api/indexing)  
**Canónico:** HexMapNigeria (`DlSiWm-L`) / HexMapEthiopia (`lCXcxewq`) / Map (`qsNowIZD`)

## Modes

| Mode | When | Data |
|------|------|------|
| **origin-tiles** (default) | proxy `:8790` healthy + data token | `mapbox://mlambrechts.*` exact source-layers |
| **geojson** fallback | proxy down | H3 res6 Space2Stats geojson |

### Origin tilesets

| Role | URL | source-layer |
|------|-----|----------------|
| NG hex | `mlambrechts.u2grslzw` | `NGA-hex-data.zip-pwpaefcg` |
| Urban centers | `mlambrechts.9ybjbhr1` | `urban_centers_africa` |
| ET hex | `mlambrechts.rxtvtmrq` | `ETH-hex-data.zip-8hrun6xw` |
| Grid | `mlambrechts.c02hylmk` | `electricity_grid_africa-8rd41z` |

**Proxy** (URL restrictions block localhost Referer):

```bash
python3 library/nightlights-hexmap/mapbox-proxy.py   # :8790
cp mapbox-config.example.js mapbox-config.js         # fill tokens
```

## Map (origin PP)

| Element | Spec |
|---------|------|
| Basemap | Mapbox **Standard** + monochrome · labels/roads/admin OFF |
| SDK | mapbox-gl **3.18** |
| Layers | `slot:"middle"` · opacity scene switch 1s |
| Paint order | hexes-outlines **under** fills |
| Bounds / filters / colors | exact origin (see v0.8 table) |

## Demo

http://127.0.0.1:8787/library/nightlights-hexmap/demo.html  
Badge: `origin tiles` | `H3 geojson`
