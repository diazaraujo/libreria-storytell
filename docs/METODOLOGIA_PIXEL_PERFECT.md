# Metodología: librería de gráficos Atlas pixel-perfect

## Principio

> **Primero espejo local ejecutable. Luego un patrón de gráfico a la vez.  
> La fuente de verdad visual es el build de producción corriendo en local (`:8765`), no un screenshot de Firecrawl ni un multi-line genérico.**

---

## Capas (qué es cada cosa)

| Capa | Qué es | Puerto / path | Rol en el método |
|------|--------|---------------|------------------|
| **A. Espejo Atlas** | Build oficial WB (HTML+JS minificado+datos+assets) | `~/atlas-global-development` → **:8765** | **Origen** (ver y reverse-engineer) |
| **B. Datos** | CSV/JSON/ZIP por goal | `data/goal_*`, `yearly-data/` | Input de la librería |
| **C. Chunks** | Lógica de layout/escenas | `_app/immutable/chunks/*.js` | Spec técnica del gráfico |
| **D. Librería** | Componentes editables reutilizables | `library/<patron>/` | Producto reutilizable |
| **E. Capítulos** | Una viz = instancia de la librería | `chapters/goal_XX/.../main.js` | Producto por story |
| **F. Firecrawl** | Screenshots live Data360 | `recordings/firecrawl/` | Solo referencia auxiliar (heroes/copy) |
| **G. Live Data360** | Sitio público | pestaña aparte | Check final; **no se embebe** (X-Frame) |

**No confundir:** Firecrawl no baja el runtime. El clone GitHub sí.

---

## Setup diario (2 terminales)

```bash
# Terminal 1 — ORIGEN (Atlas real offline)
cd ~/atlas-global-development && python3 -m http.server 8765

# Terminal 2 — RÉPLICAS + librería
cd ~/atlas-replicas && python3 -m http.server 8787
```

Mantener el espejo al día cuando haga falta:

```bash
./scripts/mirror/sync-atlas.sh
```

---

## Flujo por patrón (no por capítulo)

Trabajamos **un patrón de chart** que se repite en el Atlas. Ejemplo: `regions-small-multiples`.

### Paso 0 — Elegir el gráfico canónico

| Criterio | Ejemplo |
|----------|---------|
| Representa bien el patrón | `access_electricity_regions` |
| Tiene datos locales claros | `data/goal_07/07_data_access_electricity.csv` |
| Tiene chunk identificable | grep `AccessElectricityRegions` / nombre graphic |
| Scroller con N escenas documentadas | `config.json` → scenes |

Catálogo: `docs/graphic-catalog.json` / `.md`.

### Paso 1 — Ver el origen (obligatorio)

1. Abrir en **:8765** la story (ej. `/electricity-access/`).
2. Scroll **hasta el gráfico** (no confiar en Firecrawl footer shots).
3. Anotar en una ficha corta:
   - Tipo: small multiples / race / dual-line / beeswarm / scatter / waffle / map…
   - Grid (cols × rows), márgenes, dominio ejes
   - Colores por serie (ISO3 / región)
   - Comportamiento por escena (qué se opaca, qué se destaca)
   - Marcadores, labels, tipografía, animación

**Plantilla de ficha:** `docs/templates/FICHA_PATRON.md`

### Paso 2 — Spec desde el chunk minificado

```bash
# localizar módulo
grep -l "access_electricity_regions\|AccessElectricityRegions" \
  ~/atlas-global-development/_app/immutable/chunks/*.js

# extraer dominios, orden de series, highlight por escena
# (ya documentado para electricity regions → DNnJZ53u.js)
```

Guardar constantes en la librería o en `library/<patron>/SPEC.md`:
- `ORDER`, `HIGHLIGHT`, `yDomain`, `xDomain`, `marker size`, gaps

### Paso 3 — Implementar en `library/<patron>/`

```
library/<patron>/
  <patron>.js      # API: seriesFromRows + mount
  demo.html        # playground de escenas sin shell del chapter
  SPEC.md          # notas del reverse-engineer
  README.md        # uso
```

Reglas:
- **Sin hardcode del chapter** en el core (datos entran por opciones).
- Colores WB por defecto (`WB_COLORS` / defaults del patrón).
- Escenas solo vía `sceneIndex` + maps de highlight configurables.
- Depende de `shared/svg.js` (y lo mínimo más).

### Paso 4 — Conectar el chapter

```js
// chapters/goal_07/00-.../main.js
const series = AtlasXxx.seriesFromRows(rows, { … });
AtlasXxx.mount(chartEl, { series, sceneIndex });
```

Cargar el script de la librería en `index.html` del chapter.

### Paso 5 — QA técnico

```bash
cd scripts/capture
node qa-pass.mjs --only access_electricity_regions
```

Criterios mínimos:
- No placeholder
- SVG con marks (path/circle/rect)
- Escenas navegan sin error JS

### Paso 6 — QA visual (pixel-perfect)

**Lado a lado obligatorio:**

| Izquierda | Derecha |
|-----------|---------|
| `http://127.0.0.1:8765/<story>/` en el scroller | `http://127.0.0.1:8787/chapters/.../index.html?clean=1` |

Checklist visual:
- [ ] Mismo tipo de chart (no un multi-line si el original es 4×2)
- [ ] Mismos paneles / orden de regiones
- [ ] Mismos colores (tolerancia 0 en hex WB)
- [ ] Highlight de escena equivalente
- [ ] Labels / valores inicio–fin
- [ ] Márgenes y densidades “misma familia” (no hace falta 1px ciego si el resto es fiel)

Opcional: captura de pantalla de ambos en `recordings/compare/<graphic>/`.

### Paso 7 — Aprobar

En `config.json` del chapter:

```json
"_meta": {
  "fidelity": "pixel-perfect",
  "approved": true,
  "approvedAt": "YYYY-MM-DD",
  "libraryPattern": "regions-small-multiples",
  "originChunk": "DNnJZ53u.js"
}
```

Actualizar `docs/APPROVED_PIXEL_PERFECT.json` / lista.

### Paso 8 — Siguiente gráfico del mismo patrón

Reutilizar la librería con **otros datos / highlight**. Solo si rompe el patrón, extender la API (no copiar-pegar otro main de 200 líneas).

---

## Orden recomendado de patrones

| # | Patrón | Gráfico canónico | Por qué |
|---|--------|------------------|---------|
| 1 | `regions-small-multiples` | `access_electricity_regions` | Ya empezado; muy visible |
| 2 | `progress-race` | `access_electricity_progress` | Otro scroller estrella de electricity |
| 3 | `dual-line-urban-rural` | electricity / water urban-rural | Muy repetido |
| 4 | `hero-sticks` | `*_hero` en `_ready/` | Ya fuerte; unificar API |
| 5 | `beeswarm` / sticks país | SPI, wages | Ya hay base en `shared/` |
| 6 | `scatter-log` | `prosperity_gaps` | Ejes log / gaps |
| 7 | `waffle` | missing children | Ya hay Waffle |
| 8 | Maps / hex / nightlights | Nigeria, Ethiopia | Assets + WebGL al final |

No hacer 164 gráficos en paralelo. **Un patrón maduro desbloquea muchos chapters.**

---

## Anti-patrones (lo que ya nos falló)

| Anti-patrón | Por qué falla |
|-------------|----------------|
| Generador bulk multi-line para todo | “Copia simple”, no es el Atlas |
| Confiar en video de scroll ciego del capítulo | Atrapa footer / intro, no la viz |
| Iframe de Data360 | `refused to connect` |
| Firecrawl como única verdad | Screenshots a menudo en pie de página |
| Marcar pixel-perfect sin ver `:8765` | Aprobación falsa |
| Reimplementar sin mirar el chunk | Colores/escenas inventados |

---

## Definición de “done” de un patrón

1. `library/<patron>/demo.html` funciona solo con datos de ejemplo o CSV real.  
2. Al menos **1 chapter** canónico aprobado.  
3. Al menos **1 segundo chapter** reusa el mismo componente (prueba de reutilización).  
4. SPEC.md con referencias al chunk y mapa de escenas.  
5. QA pass + checklist visual firmada.

---

## Roles de herramientas

| Herramienta | Usar para | No usar para |
|-------------|-----------|--------------|
| Clone `:8765` | Ver origen, scroll real, particulas/WebGL locales | — |
| Réplica `:8787` | Editar, escenas, librería | — |
| `grep` chunks | Spec numérica | — |
| Firecrawl | Hero shot, copy, audit live | Runtime, pixel 1:1 scroller |
| Playwright QA | Regresión automática | Sustituir ojo humano |
| Data360 pestaña | Check final de deploy | Embeber |

---

## Ritual de una sesión de pulido (60–90 min)

1. Elegir **un** patrón o **un** gráfico canónico.  
2. Abrir origen + réplica.  
3. Escribir/actualizar SPEC (5 min).  
4. Código en `library/` (mayor parte del tiempo).  
5. Wire chapter + demo.  
6. QA + checklist visual.  
7. Commit mental: “patrón X mejoró” / “graphic Y approved”.  
8. Parar. No abrir 10 gráficos a la vez.

---

## Estado actual (punto de partida)

- [x] Espejo Atlas offline completo  
- [x] Catálogo 164  
- [x] Firecrawl 13 stories (refs; calidad variable)  
- [x] `library/regions-small-multiples` **v0.4 animated**  
  - mount once + `updateScene` (nunca remount)  
  - opacity 1s + particle flight + line intro  
  - geometría DNnJZ53u / curveNatural / labels i18n  
- [x] Cerrar patrón 1 vs origen hidratado `:8765/en/atlas/`  
- [ ] Segundo consumer del mismo patrón  
- [x] Patrón 2 `progress-race`  
- [ ] Partículas con iso3c reales (ahora sample regional)  

---

## Siguiente acción concreta

**`regions-small-multiples` v0.4** — motion ported (ver grabación usuario 15.05.28).

Refs:
- Demo animada: `http://127.0.0.1:8787/library/regions-small-multiples/demo.html`  
- Chapter: `...?clean=1` (shell reusa chart, no remount)  
- Video walk: `recordings/compare/regions-small-multiples-polish/anim-demo-walk.webm`  
- Origen: `http://127.0.0.1:8765/en/atlas/electricity-access/`  

**Regla de oro:** cambiar escena = mutar estado, no recrear el DOM del chart.

**Siguiente:** `dual-line-urban-rural` (mismo criterio de transitions).


---

## Actualización 2026-07-18 — storytelling + motion

Ver resumen operativo completo: **[LEARNINGS_ATLAS_STORYTELLING.md](./LEARNINGS_ATLAS_STORYTELLING.md)**

| Listo | Link |
|-------|------|
| Story scroll electricity | `/stories/electricity-access/` |
| RSM v0.5 animated | `/library/regions-small-multiples/demo.html` |
| Population v0.2 animated | `/library/population-access/demo.html` |
| Gallery hub | `/gallery.html` (filtros Storytelling / Animated) |
| Electricity hub | `/_ready/electricity-chapter.html` |

**Hecho (2026-07-18):** Story electricity **7/7 complete** · A-animated **7**.  
Patrones: regions, population, progress-race, dual-line (regions+countries), nightlights-hexmap NG/ET.  
QA: demos + chapters + story blocks montan.  
**Siguiente:** refinar PP residual o abrir otro chapter story.
