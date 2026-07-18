# Espejo Atlas + librería pixel-perfect

## Objetivo

1. **Bajar y correr localmente** todo el Atlas (y assets WB asociados a gráficos).
2. Usar ese espejo como **fuente de verdad visual + datos + JS minificado**.
3. Extraer una **librería de gráficos reutilizable** pixel-perfect (componentes editables).

No es “scrapear el sitio y ya”. El Atlas se publica como **build estático de producción** (sin `.svelte` fuente). La librería se **reimplementa** a partir de:

| Capa | Dónde está offline |
|------|--------------------|
| UI / rutas / chunks | `~/atlas-global-development/` (clone GitHub) |
| Datos por gráfico | `data/goal_*/` + `yearly-data/` |
| Thumbs / mapas / texturas | `assets/images/` |
| Catálogo 164 viz | `data/all_visualizations.json` |
| Réplicas editables | `~/atlas-replicas/chapters/` |
| Componentes compartidos | `~/atlas-replicas/shared/` |
| Refs live (opcional) | Firecrawl → `recordings/firecrawl/` |

## Ya tienes offline (espejo principal)

```bash
~/atlas-global-development/     # ~240MB, build completo
  _app/immutable/chunks/        # 368 JS (comportamiento)
  data/goal_01 … goal_17        # CSV/JSON/ZIP
  yearly-data/progress/         # series hero
  assets/images/                # thumbs, mapas, texturas
  electricity-access/ …         # cada story HTML
  gallery.html
```

Servir el origen **local** (mismo build que Data360, embebible).

> El HTML usa base path `/en/atlas/`. Si sirves la raíz del clone directo, el JS
> pide `/en/atlas/_app/...` y devuelve 404 → **no hidrata** (solo HTML SSR/footer).

```bash
mkdir -p ~/atlas-serve/en
ln -sfn ~/atlas-global-development ~/atlas-serve/en/atlas
cd ~/atlas-serve && python3 -m http.server 8765
open http://127.0.0.1:8765/en/atlas/electricity-access/
```

Réplicas:

```bash
cd ~/atlas-replicas && python3 -m http.server 8787
open http://127.0.0.1:8787/_ready/all-chapters.html
```

## Qué NO está en el clone (y cómo cubrirlo)

| Falta | Por qué | Mitigación |
|-------|---------|------------|
| Código Svelte fuente | Repo solo shippea build | Reverse-engineer chunks + reimplementar en `shared/` |
| Tiles Mapbox en vivo | API key / red | Assets estáticos locales o tokens propios |
| Header Data360 remoto | Cargado de CDN | No crítico para la viz |
| Screenshots live frescos | Deploy puede cambiar | `firecrawl-api.mjs scrape <slug>` |

## Pipeline de espejo

```bash
# 1) Sync Atlas build
./scripts/mirror/sync-atlas.sh

# 2) Rebuild inventory + catalog
python3 scripts/mirror/build-graphic-catalog.py

# 3) (Opcional) refs live con Firecrawl
export FIRECRAWL_API_KEY=...   # o scripts/capture/.env
cd scripts/capture
node firecrawl-api.mjs scrape electricity-access
# batch: ./scripts/mirror/firecrawl-all-chapters.sh
```

Salidas:

- `inventory/` — catálogo machine-readable  
- `docs/graphic-catalog.json` — 164 gráficos → datos + paths locales  
- `recordings/firecrawl/` — screenshots del origen live  

## Arquitectura de la librería pixel-perfect

```
atlas-replicas/
  shared/                    # ← librería reutilizable
    components/              # LineChart, Axis, Beeswarm, Waffle, Scatter…
    wb-colors.js
    svg.js
    shell.js                 # scroller shell
  library/                   # ← componentes “Atlas grade” (nuevo)
    README.md
    regions-small-multiples/ # un componente = un patrón del Atlas
    progress-race/
    slope-chart/
    …
  chapters/goal_XX/…/main.js # cada viz instancia la librería
```

### Flujo por patrón de gráfico (no por capítulo)

1. Abrir **origen local** `:8765/<story>/` y localizar la viz.  
2. Identificar `graphic` en `all_visualizations.json`.  
3. Grep del chunk minificado → layout, colores, escenas.  
4. Extraer o generalizar en `library/<pattern>/`.  
5. Conectar `chapters/.../main.js` al componente.  
6. QA: `node scripts/capture/qa-pass.mjs --only <graphic>`.  
7. Compare visual: origen `:8765` | réplica `:8787`.

### Patrones prioritarios (del Atlas)

| Patrón | Ejemplos en Atlas |
|--------|-------------------|
| Small multiples regionales | `access_electricity_regions` |
| Progress race / arrows | `access_electricity_progress`, internet progress |
| Dual urban/rural lines | water, electricity urban-rural |
| Beeswarm / sticks hero | progress heroes, SPI |
| Log scatter | prosperity_gaps |
| Waffle | missing children, slum |
| Slope chart | coverage–access gaps |
| Map / hex / nightlights | Nigeria, Ethiopia (assets + WebGL) |

## Relación con Firecrawl

Firecrawl **no reemplaza** el clone: no te da el JS/datos ejecutables.  
Sirve para:

- screenshots del **origen live** cuando el iframe está bloqueado  
- markdown de copy/escenas  
- auditoría de que el deploy live ≈ clone  

El runtime pixel-perfect se construye sobre el **clone + reimplementación**.

## Principio

> **Espejo local = runtime + datos.**  
> **Librería = abstracciones editables derivadas del espejo.**  
> **Firecrawl = referencia fotográfica del live.**

Sin el espejo, no hay librería fiel. Sin reverse-engineer por patrón, solo hay “copias simples”.
