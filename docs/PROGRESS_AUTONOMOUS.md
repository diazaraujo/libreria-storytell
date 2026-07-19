# Avance autónomo

**Repo:** https://github.com/diazaraujo/libreria-storytell  
**Última actualización:** 2026-07-19

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

## Cómo arrancar

```bash
cd ~/atlas-replicas
bash scripts/dev-servers.sh
# mapbox-config.js local (gitignored):
#   cp library/nightlights-hexmap/mapbox-config.example.js \
#      library/nightlights-hexmap/mapbox-config.js
open http://127.0.0.1:8787/gallery-atlas.html
```

## Siguiente
- Compare visual origin vs story electricity (frame by frame)
- Promover otros chapters a library patterns
- CI smoke en GitHub Actions
