# libreria-storytell

Librería y réplicas de **storytelling / data-viz** inspiradas en el *Atlas of Global Development 2026* (World Bank).

Repo: [github.com/diazaraujo/libreria-storytell](https://github.com/diazaraujo/libreria-storytell)

## Qué incluye

- **`library/`** — componentes reutilizables (regions, population, progress-race, dual-line, nightlights-hexmap H3/Mapbox)
- **`chapters/`** — capítulos goal-by-goal (electricity, water, poverty…)
- **`stories/`** — stories scroller completas
- **`docs/`** — metodología pixel-perfect, inventario, pipeline

## Arranque en 30 segundos

```bash
cd ~/atlas-replicas
bash scripts/dev-servers.sh   # :8787 réplicas · :8765 origin · :8790 mapbox-proxy
# o solo estáticos:
python3 -m http.server 8787
```

| URL | Qué es |
|-----|--------|
| http://localhost:8787/gallery-atlas.html | **Gallery estilo Atlas** (como [data360 gallery](https://data360.worldbank.org/en/atlas/gallery)) |
| http://localhost:8787/gallery.html | Gallery dev · 164 GIF + hub storytelling |
| http://localhost:8787/_ready/heroes.html | Héroes de capítulo (progress sticks) |
| http://localhost:8787/dev/playground.html | Kit de componentes |
| http://localhost:8787/docs/DEV.md | Guía de desarrollo |

### Regenerar thumbnails GIF

```bash
cd ~/atlas-replicas/scripts/capture
node thumbs.mjs --status ready          # todos (omite existentes)
node thumbs.mjs --only 06 --force       # un capítulo, regenerar
```

Los GIF van a `thumbs/` y la gallery se reescribe al terminar.

## Qué puedes hacer ya

### 1. Desarrollar un gráfico
1. Abre la **gallery** y elige un `scaffold`
2. Edita `chapters/goal_XX/…/main.js`
3. Usa el kit (`AtlasLineChart`, `AtlasBeeswarmChart`, `AtlasScatter`, `AtlasWaffle`, `AtlasLoad`)
4. Datos en `./data/` · textos/escenas en `config.json`

Patrón:

```js
window.AtlasReplica = {
  ready: true,
  isStub: false,
  async render(scene, ctx) {
    ctx.hidePlaceholder();
    const { rows } = await AtlasLoad.firstCsv(ctx.config.data_download);
    AtlasScatter.mount(ctx.chartEl, { data: rows, /* … */ });
  }
};
```

### 2. Pedirle al agente implementaciones
Ejemplos de prompts:

- *“Implementa `survey_age` y `nigeria_poverty_extrapolation` con el kit”*
- *“Haz todos los scatter del Atlas con AtlasScatter”*
- *“Graba las ready en video”*

### 3. QA automático + videos (sin screen recording manual)

```bash
cd scripts/capture

# 1) Jugar la interfaz y detectar fallos (énfasis crudo, ejes, vacíos, JS…)
node qa-pass.mjs --status ready
# → recordings/qa/report.md  (+ screenshots de fallos)

# 2) Grabar demos
node capture.mjs --status ready --seconds 10

# Atlas live (scroll de capítulo)
node capture.mjs --target atlas --only data-for-development --seconds 50
```

Último QA: **164/164 OK** (loop de autocorrección).

### Pixel-perfect (programa completo)

Ver [docs/PIXEL_PERFECT.md](docs/PIXEL_PERFECT.md).

| Tier | Qué | Dónde |
|------|-----|--------|
| **A Heroes** | 12 capítulos con progress sticks (como el video de Water) | http://localhost:8787/_ready/heroes.html |
| **B Story** | Goal 17 + gráficos custom | `chapters/goal_17/…?clean=1` |
| **C Functional** | Resto del gallery (datos correctos, layout genérico) | http://localhost:8787/gallery.html |

### 4. Extender el kit
Añade archivos en `shared/components/` (Map, StackedBar…) y cárgalos en `templates/shell.html` + `python3 scripts/refresh_shells.py`.

## Estructura

```
atlas-replicas/
  chapters/goal_*/NN-graphic/   # 164 unidades de trabajo
    main.js                     # ← tu código
    config.json                 # escenas, labels, data_download
    data/                       # CSV del Atlas (si existía)
  shared/components/            # kit reutilizable
  dev/playground.html
  inventory/                    # catálogo
  scripts/                      # pipeline + capture
  _ready/                       # réplicas full (SPI)
  recordings/                   # videos generados
```

## Estado

| | |
|--|--|
| Total | **164** visualizaciones |
| **Ready (con datos + render)** | **~136** vía `AtlasAuto` + ejemplos custom |
| **Partial** (sin CSV local: mapas/imágenes) | **~28** |
| Kit | Line · Beeswarm · Scatter · Waffle · Load · **Auto-render** |
| Custom full | `draw_your_chart`, `spi_scroller`, SPI pillars, nigeria, survey_age, missing children, `spi_gdp_scatter` |

## Pipeline (regenerar desde el Atlas)

```bash
./scripts/run_pipeline.sh          # inventory + scaffolds
python3 scripts/refresh_shells.py  # actualiza HTML con el kit (no toca main.js)
```

Fuente: [worldbank/atlas-global-development](https://github.com/worldbank/atlas-global-development)  
Live: https://data360.worldbank.org/en/atlas  

Réplicas independientes para desarrollo — no son producto oficial del World Bank. Cita siempre las fuentes del `config.json`.
