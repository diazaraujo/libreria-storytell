# Estado del espejo Atlas (download first)

**Fecha:** 2026-07-18  
**Estrategia:** bajar todo → luego pulir librería pixel-perfect (no al revés).

## Espejo principal — COMPLETO

| Item | Path | Estado |
|------|------|--------|
| Build Atlas producción | `~/atlas-global-development` (~241 MB) | ✅ synced (`18407c1`) |
| 14 story routes | `electricity-access/`, `water-access/`, … | ✅ |
| JS minificado | `_app/immutable/chunks/` (368) | ✅ |
| Datos gráficos | `data/goal_*` (CSV/JSON/ZIP) | ✅ 28 zips OK |
| Progress / heroes | `yearly-data/progress/` | ✅ |
| Imágenes / thumbs | `assets/images/` | ✅ |
| Catálogo 164 viz | `data/all_visualizations.json` | ✅ |
| Estilos WB | `wb-style.json` | ✅ |

### Correr origen local

> **Importante:** el HTML del clone usa base path `/en/atlas/`. Servir la raíz del repo
> rompe la hidratación (JS 404 en `/en/atlas/_app/...`). Usar el alias:

```bash
mkdir -p ~/atlas-serve/en
ln -sfn ~/atlas-global-development ~/atlas-serve/en/atlas
cd ~/atlas-serve && python3 -m http.server 8765
open http://127.0.0.1:8765/en/atlas/electricity-access/
open http://127.0.0.1:8765/en/atlas/gallery.html
```

### Resync

```bash
./scripts/mirror/sync-atlas.sh
```

## Catálogo machine-readable — COMPLETO

| Archivo | Contenido |
|---------|-----------|
| `docs/graphic-catalog.json` | 164 gráficos → paths locales + live + réplica |
| `docs/graphic-catalog.md` | índice legible |
| `inventory/` | inventario pipeline |

## Réplicas workspace

| Item | Estado |
|------|--------|
| `chapters/goal_*` (164 scaffolds/mains) | ✅ presentes |
| `shared/` kit base | ✅ |
| `library/regions-small-multiples/` | ✅ **v0.3 cerrado** (layout+curveNatural+labels; partículas deferred) |
| Approved pixel-perfect | 39 en configs (pendiente revalidar tras resync inventario) |

```bash
cd ~/atlas-replicas && python3 -m http.server 8787
open http://127.0.0.1:8787/_ready/all-chapters.html
```

## Referencias live (Firecrawl) — en curso / opcional

Screenshots del origen Data360 (no reemplazan el clone):

```bash
cd scripts/capture && source .env
./scripts/mirror/firecrawl-all-chapters.sh
# → recordings/firecrawl/
```

## Qué NO se “baja” (límites)

- Código fuente `.svelte` (no existe en público)
- Tiles Mapbox en tiempo real (necesitan token de red)
- Interacciones live sin browser (por eso el clone + reimplementación)

## Fase siguiente (cuando digas “a pulir”)

1. Origen local `:8765` + réplica `:8787` por gráfico  
2. Extraer patrones a `library/`  
3. QA + approve pixel-perfect  
4. No re-inventar datos: ya están en el espejo  

## Checklist “todo bajado”

- [x] Clone GitHub Atlas  
- [x] Datos goal_01…17 + dashboard/progress  
- [x] Assets / fonts / thumbs  
- [x] Catálogo 164  
- [x] Workspace réplicas  
- [x] Firecrawl batch de 13 stories (screenshot + md en `recordings/firecrawl/`)  
- [ ] Pulido pixel-perfect de la librería (después)  
