# Avance autónomo (session)

**Repo:** https://github.com/diazaraujo/libreria-storytell  
**Última actualización:** 2026-07-18

## Hecho

### Infra
- [x] Repo GitHub `diazaraujo/libreria-storytell` · `main`
- [x] Tokens Mapbox **no** en git (`mapbox-config.example.js` only)
- [x] Servers :8787 · :8765 · :8790 mapbox-proxy

### Hexmap residual → **v0.9.0**
- [x] Mapbox Standard monochrome
- [x] Origin layer order + opacity scenes
- [x] **Origin tiles** `mlambrechts.*` vía proxy + data token
- [x] Dual token: basemap user · tiles data
- [x] Fallback H3 geojson
- [x] Urban GHSL real (tileset)
- [x] Badge `origin tiles`

### Electricity — QA Playwright (2026-07-18)

| Entry | HTTP | Render | Errors |
|-------|------|--------|--------|
| library hex demo | 200 | 2 canvas · origin tiles | 0 |
| progress-race demo | 200 | svg | 0 |
| dual-line regions | 200 | svg | 0 |
| dual-line countries | 200 | svg | 0 |
| regions-small-multiples | 200 | svg | 0 |
| population-access | 200 | svg | 0 |
| ch 00 regions | 200 | svg | 0 |
| ch 01 population | 200 | svg | 0 |
| ch 02 urban-rural | 200 | svg | 0 |
| ch 03 progress | 200 | svg | 0 |
| ch 04 ur countries | 200 | svg | 0 |
| ch 05 hex NG | 200 | canvas · origin tiles | 0 |
| ch 06 hex ET | 200 | canvas · origin tiles | 0 |
| **story electricity-access** | 200 | all libs loaded | 0 |

**14/14 OK**

Story deep scroll: 6 SVG + 2 canvas · all libs · 0 errors.

## Cómo retomar

```bash
cd ~/atlas-replicas
python3 -m http.server 8787 &
python3 library/nightlights-hexmap/mapbox-proxy.py &
# mapbox-config.js local (gitignored)
open http://127.0.0.1:8787/stories/electricity-access/
open http://127.0.0.1:8787/docs/PROGRESS_AUTONOMOUS.md
git log --oneline -8
```

## Siguiente (opcional)
- Compare visual frame-by-frame origin :8765 vs story
- Expand library a otros goals (internet, poverty residual)
- CI smoke Playwright en GitHub Actions
