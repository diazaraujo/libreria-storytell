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

- [x] Dark navy heroes + origin lead/byline/key facts (3 stories)
- [x] Particle plume bias · theme colors on navy
- [x] Transparent topbar over hero
- [x] Compare matrix: `docs/COMPARE_PP_STORIES.md`
- Captures: `recordings/compare/pp-stories-2026-07-20/`

## Residual

- Chart-level PP pass (ladder year-reveal, dual-line hatch parity, etc.)
- Coverage map real Mapbox (ranked bars proxy)
- Plan: `docs/PLAN_REMAINING.md`
