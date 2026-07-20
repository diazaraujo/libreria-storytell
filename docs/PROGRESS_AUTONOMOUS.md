# Avance autónomo

**Repo:** https://github.com/diazaraujo/libreria-storytell  
**Última actualización:** 2026-07-20

## Hecho

### Infra
- [x] Repo `diazaraujo/libreria-storytell`
- [x] Tokens Mapbox fuera de git
- [x] `scripts/dev-servers.sh` → :8787 · :8765 · :8790

### Gallery estilo Atlas
- [x] `gallery-atlas.html` (layout data360)
- [x] **Featured = 34** stills oficiales (1 card por PNG)
- [x] **All = 164** con GIF locales
- [x] Filtro por tema + búsqueda
- [x] Thumbs en `assets/gallery_thumbnails/`

### Hexmap v0.9 + Electricity
- [x] Origin Mapbox tiles vía proxy
- [x] Story electricity 7/7 · QA 14/14

### Internet story
- [x] Library `access-trends-scroller` v0.1 (world → income → regions)
- [x] Dual-line urban–rural **income** variant
- [x] Progress race (focus KHM / KGZ)
- [x] Hero particles · origin prose
- [x] Story URL: `/stories/internet-access/`

### Water story (MVP)
- [x] Library `service-ladder-stack` v0.1 (JMP ladder)
- [x] Story block 1/11 · hero particles
- [x] Story URL: `/stories/water-access/`

## Cómo arrancar

```bash
cd ~/atlas-replicas
bash scripts/dev-servers.sh
# mapbox-config.js local (gitignored):
#   cp library/nightlights-hexmap/mapbox-config.example.js \
#      library/nightlights-hexmap/mapbox-config.js
open http://127.0.0.1:8787/gallery-atlas.html
open http://127.0.0.1:8787/stories/internet-access/
open http://127.0.0.1:8787/stories/water-access/
```

### Compare electricity (2026-07-19)
- [x] Frame capture origin vs replica (`docs/COMPARE_ELECTRICITY.md`)
- [x] Hex badge hidden in chapters/story (demo-only)
- Residual: origin particle field (chrome only)

## Siguiente
- Water: más bloques goal_06 (grouped, country, limiting factors, Tanzania, E. coli)
- Internet: coverage / speed / smartphone (promover chapters → library)
- Compare visual origin vs story electricity (frame by frame residual)
- CI smoke en GitHub Actions
