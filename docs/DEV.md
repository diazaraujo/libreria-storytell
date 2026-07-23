# Guía de desarrollo — Atlas replicas

## Qué tienes listo

| Pieza | Para qué |
|-------|----------|
| `chapters/goal_*/…` | **164** carpetas (1 por visualización) con `config.json` + `data/` + `main.js` |
| `shared/components/` | Kit: Line, Beeswarm, Scatter, Waffle, Axis, loaders |
| `dev/playground.html` | Demo en vivo del kit |
| `inventory/` | Catálogo filtrable (graphic, escenas, status) |
| `scripts/capture/` | Grabar videos en lote (Playwright) |
| `_ready/spi-scroller` | Réplica completa de referencia (#c21) |

## Flujo diario

```bash
cd ~/atlas-replicas
python3 -m http.server 8787

# Gallery de todos los gráficos
open http://localhost:8787/gallery.html

# Kit de componentes
open http://localhost:8787/dev/playground.html

# Un scaffold concreto
open http://localhost:8787/chapters/goal_17/04-spi-gdp-scatter/index.html
```

## Cómo implementar un gráfico (checklist)

1. **Elige** en la gallery un `scaffold` (o filtra por capítulo).
2. **Mira el original** en Data360 o un screen recording.
3. **Abre** la carpeta del graphic:
   - `config.json` → textos, escenas, ejes, `data_download`
   - `data/*` → CSV ya copiado (si existía en el Atlas)
   - `main.js` → aquí va tu código
4. **Implementa** el patrón:

```js
window.AtlasReplica = {
  ready: true,
  isStub: false,
  async render(scene, ctx) {
    ctx.hidePlaceholder();
    const { rows } = await AtlasLoad.firstCsv(ctx.config.data_download);
    // usa AtlasLineChart / AtlasBeeswarmChart / AtlasScatter / AtlasWaffle
  },
};
```

5. **Recarga** el navegador (`Cmd+Shift+R`).
6. **Actualiza calidad** en `config.json` → `_meta.status`, `_meta.fidelity` y `_meta.approved`.
   Luego ejecuta `python3 scripts/sync_quality.py --write`; no edites los inventarios derivados.
7. **Graba** (opcional):  
   `cd scripts/capture && node capture.mjs --only <graphic>`

## Kit de componentes

| API | Uso típico |
|-----|------------|
| `AtlasLoad.csv(url)` / `firstCsv(name)` | Leer `./data/*.csv` |
| `AtlasSVG.scaleLinear` / `el` | Primitivas SVG |
| `AtlasLineChart.mount(el, opts)` | Series temporales |
| `AtlasBeeswarmChart.mount(el, opts)` | Beeswarm SPI / wages |
| `AtlasScatter.mount(el, opts)` | SPI vs GDP, urban GDP… |
| `AtlasWaffle.mount(el, opts)` | Proporciones unit chart |
| `Beeswarm` | Packer crudo (mismo algoritmo Atlas) |
| `WB_COLORS` | Paleta HIC/LIC/regiones |

Scrollers: el shell ya maneja escenas (`ctx.scene`, botones, teclas).  
En `render(scene, ctx)` reacciona a `scene.id` o `ctx.sceneIndex`.

## Familias sugeridas (para priorizar)

| Familia | Ejemplos | Componente |
|---------|----------|------------|
| line / area | nigeria_poverty, growth trends | `AtlasLineChart` |
| beeswarm | spi_scroller, wage beeswarm | `AtlasBeeswarmChart` |
| scatter | spi_gdp_scatter | `AtlasScatter` |
| waffle | missing_children, slum_waffle | `AtlasWaffle` |
| map / hex | city_map, hexmap_* | Mapbox/d3-geo (aún no en kit) |
| image | id4d assets | `<img>` / static |
| scroller custom | multi-step layout changes | shell + tu lógica |

## Comandos útiles

```bash
# Regenerar inventario desde el clone del Atlas
./scripts/run_pipeline.sh

# Verificar contratos, semántica y parser CSV
npm test

# Verificar que inventarios y registry coincidan con config.json
python3 scripts/sync_quality.py --check

# Reaplicar shell HTML (kit scripts) sin tocar main.js
python3 scripts/refresh_shells.py

# QA interactivo (abre cada viz, avanza escenas, reporta fallos + screenshots)
cd scripts/capture && node qa-pass.mjs --status ready
# informe → recordings/qa/report.md

# Grabar videos
cd scripts/capture && node capture.mjs --status ready --seconds 10
```

### Loop de autocorrección recomendado

1. `node qa-pass.mjs --status ready`  
2. Leer `recordings/qa/report.md` y screenshots en `recordings/qa/failures/`  
3. Corregir `shared/*` (bugs sistémicos) o `main.js` del graphic  
4. Re-correr QA hasta **0 failed**

## Referencias listas

1. **SPI scroller** — `_ready/spi-scroller/` y `chapters/goal_17/03-spi-scroller/`
2. **Draw your chart** — `chapters/goal_01/00-draw-your-chart/main.js` (interacción completa)
3. **Playground** — `dev/playground.html`

## Qué puedes hacer tú (sin depender de grabar a mano)

1. Desarrollar gráfico a gráfico en `main.js` con el kit  
2. Pedirle al agente: *“implementa survey_age y spi_gdp_scatter con el kit”*  
3. Pedir: *“graba todas las ready”* cuando quieras demos en video  
4. Extender el kit (`shared/components/Map.js`, etc.) y reutilizar  

## Estado actual

- **164** implementaciones con `status: ready`
- **82** capítulos pixel-perfect aprobados; **79** tier-B-bulk; **3** unverified
- Kit de componentes **v0.1** usable ya  
