# Avance autónomo

**Repo:** https://github.com/diazaraujo/libreria-storytell  
**Última actualización:** 2026-07-20

## Stories (cerradas)

| Story | Blocks | URL |
|-------|--------|-----|
| **Electricity** | **7/7** | `/stories/electricity-access/` |
| **Internet** | **10/10** | `/stories/internet-access/` |
| **Water** | **11/11** | `/stories/water-access/` |

## Hecho

### Infra
- [x] Repo `diazaraujo/libreria-storytell`
- [x] Tokens Mapbox fuera de git
- [x] `scripts/dev-servers.sh` → :8787 · :8765 · :8790
- [x] CI smoke: gallery JSON · story counts 7/10/11 · library `node --check`

### Gallery estilo Atlas
- [x] `gallery-atlas.html` · Featured 34 · All 164

### Electricity 7/7
- [x] regions · population · progress · urban–rural · countries · hex NG/ET
- [x] Mapbox origin tiles vía proxy

### Internet 10/10
- [x] trends · urban–rural income · gender gap · progress race  
- [x] mobile/fixed · coverage ranked · speed · slopes · text · smartphone  

### Water 11/11
- [x] JMP ladder · dual-line · beeswarm · components · limiting · Tanzania  
- [x] E. coli table/PoC-PoU/UR · arsenic groups/source  

## Cómo arrancar

```bash
cd ~/atlas-replicas
bash scripts/dev-servers.sh
open http://127.0.0.1:8787/gallery-atlas.html
open http://127.0.0.1:8787/stories/internet-access/
open http://127.0.0.1:8787/stories/water-access/
open http://127.0.0.1:8787/stories/electricity-access/
```

## Pixel-perfect (2026-07-20)

### Pass 1 — heroes
- [x] Dark navy heroes + origin lead/byline/key facts (3 stories)
- [x] Transparent topbar over hero
- [x] Compare matrix: `docs/COMPARE_PP_STORIES.md`

### Pass 2 — residuals 1–4
- [x] **Chart-level:** service-ladder year-clip + layer dim · dual-line end-year markers · progress dots always on
- [x] **Key facts:** “Show details” → `#block-id` anchors
- [x] **Particles v0.2:** world scatter via `library/particles-world/centroids.json`
- [x] **Coverage Mapbox:** `coverage-choropleth-map` (country-boundaries-v1) + ranked fallback

### Pass 3 — residual opcional
- [x] Mobile: stacked sticky ≤960 · phone hero/keyfacts ≤560
- [x] Particles v0.3 denser world scatter (centroids v2)
- [x] Coverage map v0.2: property `match` join (fiable)

### Pass 4 — fino (mobile chart heights)
- [x] `fitChartHeight()` · sticky flex fill · phone note 16dvh
- [x] Desk chart 560 · phone chart ~600 (+40–60% vs pass 3)
- [x] Ladder full timeline + layer dim
- Docs: `docs/COMPARE_PP_FINO.md`

### Pass 5 — micro
- [x] Note type scale Atlas tokens (16 / 15 / 14)
- [x] Coverage basemap globe + fog + muted roads (v0.3)
- Docs: `docs/COMPARE_PP_MICRO.md`

### Pixel-byte pipeline
- [x] `scripts/capture/pixel-diff.mjs` — chart-crop MAE / Δ% / score
- [x] Story regions score **95.5** · chapter **90.2** · demos **83–87**
- Docs: `docs/PIXEL_BYTE_COMPARE.md`

## Residual
- Marker density / Pixi AA residual (score ceiling ~96 without origin engine)
- Plan: `docs/PLAN_REMAINING.md` (stories 7/10/11 · PP 1–5 · pixel-byte A/B+)
