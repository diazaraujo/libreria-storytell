# Paso 1: videos de referencia Atlas vs Galería

Antes de re-hacer gráficos “pixel perfect”, cada uno debe tener **evidencia visual** del original y de nuestra copia.

## Viewer

**http://localhost:8787/recordings/compare/**

Por gráfico verás tres paneles:

| Panel | Qué es |
|-------|--------|
| **Atlas original** | Scroll del capítulo en el build estático / Data360 |
| **Réplica local** | Nuestra página `?clean=1` con walk de escenas |
| **Galería GIF** | Thumb animado de `thumbs/` |

Filtros: capítulo, búsqueda, solo pixel-perfect aprobados.

## Cómo regenerar

```bash
# Servidores
cd ~/atlas-replicas && python3 -m http.server 8787
cd ~/atlas-global-development && python3 -m http.server 8765

# Un capítulo
cd ~/atlas-replicas/scripts/capture
node compare-capture.mjs --only goal_07 --skip-existing

# Todo (lento)
node compare-capture.mjs --skip-existing
```

Opciones útiles:

- `--replica-only` / `--atlas-only`
- `--live` — prioriza https://data360.worldbank.org/en/atlas
- `--seconds-replica 12` / `--seconds-atlas 45`
- `--list`

## Salida

```
recordings/compare/
  index.html
  manifest.json
  _atlas_chapters/{slug}/chapter.mp4
  051_07_access-electricity-regions/
    atlas.mp4
    replica.mp4
    gallery.gif
    meta.json
  …
```

## Uso en el flujo pixel-perfect

1. Abrir el compare del gráfico.
2. Anotar diferencias (tipo de chart, escenas, colores, interacción).
3. Reverse-engineer el chunk minificado.
4. Reescribir `main.js`.
5. Re-capturar solo ese gráfico:  
   `node compare-capture.mjs --only access_electricity_regions`

## Notas

- El Atlas no expone URL por gráfico: el video “Atlas” es **scroll del capítulo** (contexto completo).
- La réplica sí es **por gráfico** (escenas con `#btn-next`).
- Algunos capítulos del clone local no tienen slug 1:1; el script hace fallback a Data360 live.
- **Data360 bloquea iframes** (`X-Frame-Options`). Para capturar el origen live sin iframe, usar Firecrawl (abajo).

## Firecrawl (origen live → screenshot)

Útil porque Firecrawl abre un browser real en su infra y puede sacar screenshot/markdown del Atlas **en Data360**, sin depender de iframe ni de nuestro scroll ciego.

```bash
export FIRECRAWL_API_KEY='fc-...'   # desde firecrawl.dev/app → API Keys
cd ~/atlas-replicas/scripts/capture
npm i @mendable/firecrawl-js

# Un capítulo (empezar por electricity)
node firecrawl-atlas-ref.mjs --slug electricity-access

# Viewer
open http://127.0.0.1:8787/recordings/firecrawl/
```

| Herramienta | Rol |
|-------------|-----|
| **live-one.html** + clone `:8765` | Side-by-side interactivo embebible |
| **Data360 pestaña nueva** | Origen 100% real (manual) |
| **Firecrawl screenshot** | Referencia fija del origen live (automatizable) |
| **Réplica `?clean=1`** | Lo que estamos editando |

**No subas la API key al chat ni a git.** Si la pegaste en una captura de pantalla, rótala en el dashboard de Firecrawl.
