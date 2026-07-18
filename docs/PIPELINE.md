# Pipeline: replicate all Atlas animations

## Goal

Turn the World Bank **Atlas of Global Development 2026** static build into an **editable replica workspace**: one folder per visualization, shared helpers, and a gallery.

## Sources of truth

| Source | Role |
|--------|------|
| `worldbank/atlas-global-development` | Production static build (configs + data + minified JS) |
| `data/all_visualizations.json` | Per-chapter visual list, scenes, labels |
| `data/goal_*/` | CSV / JSON datasets |
| `_app/immutable/chunks/*.js` | Behavior hints (scene logic, packers, colors) |
| Live site / screen recordings | Visual QA target |

There is **no public Svelte source**. Replicas reimplement behavior; they do not compile the original app.

## Commands

```bash
# One shot (clone if needed + inventory + scaffold)
./scripts/run_pipeline.sh

# Or step by step
python3 scripts/build_inventory.py --atlas ~/atlas-global-development
python3 scripts/scaffold_all.py --atlas ~/atlas-global-development

# Only one chapter or graphic
python3 scripts/scaffold_all.py --only 17
python3 scripts/scaffold_all.py --only spi_scroller --force-main
```

Serve:

```bash
cd ~/atlas-replicas && python3 -m http.server 8787
open http://localhost:8787/gallery.html
```

## Layout

```
atlas-replicas/
  inventory/           # catalog generated from Atlas
  chapters/goal_XX/…   # one dir per visualization
  shared/              # colors, beeswarm, shell
  templates/           # HTML shell
  _ready/              # full working replicas
  scripts/             # pipeline
  gallery.html         # browsable index
```

Each visualization folder:

```
index.html    # shell
config.json   # Atlas config + scenes + _meta
main.js       # YOUR implementation (AtlasReplica.render)
data/         # copied CSVs when matched
README.md     # scenes + notes
```

## Implementation workflow (per graphic)

1. Open live Atlas chapter or screen recording.
2. Open `config.json` + `data/`.
3. Grep production bundles for the `graphic` name:
   ```bash
   grep -R "spi_scroller" ~/atlas-global-development/_app/immutable/chunks | head
   ```
4. Implement `main.js`:
   ```js
   window.AtlasReplica = {
     async render(scene, ctx) { /* draw into ctx.chartEl */ }
   };
   ```
5. Compare scene-by-scene; mark status `ready` in inventory when done.
6. Optionally promote a full self-contained copy under `_ready/`.

## Status levels

| Status | Meaning |
|--------|---------|
| `scaffold` | Shell + config + data stub |
| `partial` | Some scenes work |
| `ready` | Faithful interactive replica |

Reference ready graphic: **SPI scroller** (`goal_17`, `#c21`) → `_ready/spi-scroller/` and `~/atlas-c21-spi-scroller/`.

## Scaling strategy

1. **Inventory** always first (cheap, complete).
2. **Scaffold all** (automatic).
3. Implement by **graphic family** (beeswarm, waffle, line scroller, map, particles…) reusing `shared/`.
4. Prioritize chapters you need; the gallery filters by status.

## Limits

- Mapbox tiles / API keys may be required for some maps.
- Pixi particle factoids need a WebGL port or simplified canvas.
- Huge binary/geo assets stay in the Atlas clone; copy only what each replica needs.
"""