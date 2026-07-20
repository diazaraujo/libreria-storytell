# Aprendizajes Atlas → réplicas animadas + storytelling

**Actualizado:** 2026-07-18  
**Story de referencia:** Electricity Access (`stories/electricity-access/`)

---

## 1. Qué estamos construyendo

Tres capas, no una:

| Capa | Producto | Ejemplo |
|------|----------|---------|
| **Patrón (library)** | Componente reutilizable con motion | `library/regions-small-multiples` |
| **Capítulo unitario** | Un graphic con shell de escenas | `chapters/goal_07/00-…?clean=1` |
| **Story (scroll)** | Capítulo completo Atlas: sticky + prose + varios gráficos | `stories/electricity-access/` |

La **galería** debe exponer las tres: demos de librería, capítulos con animación, y stories.

---

## 2. Principios no negociables (aprendidos a la fuerza)

### 2.1 Nunca remount al cambiar de escena
```js
// ❌ Mata transitions
mount(el, { sceneIndex: n }); // cada vez

// ✅
const chart = mount(el, { sceneIndex: 0 });
chart.updateScene(n); // muta opacity / layers
```
Si remountas, se ve “gráficos nuevos estáticos”.

### 2.2 Scroll de story ≠ carrusel
- **Atlas:** `sceneIndex = f(scrollProgress)` dentro de un bloque sticky de altura `~scenes × 0.9vh`.
- **Shell unitario** (botones/rueda): útil para QA de un patrón.
- **Story:** scroll nativo del documento; no hijackear el wheel con lock de 1s en el documento completo.

### 2.3 Verificar la invariante de escena
Antes de “listo”:
```
scroll 20% del bloque → scene 1 + note correcta + highlight correcto
```
Un bug real (`state.nScenes` undefined → siempre escena 0) pasó QA cosmético y falló al usuario.

### 2.4 Espejo local con base path correcta
```bash
# El HTML del clone pide /en/atlas/_app/...
mkdir -p ~/atlas-serve/en
ln -sfn ~/atlas-global-development ~/atlas-serve/en/atlas
cd ~/atlas-serve && python3 -m http.server 8765
# → http://127.0.0.1:8765/en/atlas/electricity-access/
```
Servir la raíz del clone sin `/en/atlas` = sin hidratación = footer/hero, no el scroller.

### 2.5 Layout sticky Atlas (pixel)
```
[ annotation card izq · borde rojo ]  [ título + regla roja + chart + source ]
```
- Título **solo** sobre la columna del chart.
- Regla roja bajo subtítulo.
- Annotation: borde rojo fijo; color en chips de texto (`WLD`, `SSF`…).
- Chart height ~500 (regions), no estirar a 800px.

### 2.6 Storytelling = handoffs
Entre bloques del video hay **prosa**, no hard cut:
```
regions (SSF final) → prose bridge → population
```
Sin puentes se siente playlist.

---

## 3. Motion por patrón (specs)

### regions-small-multiples (DNnJZ53u)
- `transition: opacity 1s` en paneles y labels
- Partículas: transform 1s (layout scene 0→World, luego regiones)
- dim = 0.1
- curveNatural (UAFRlFgY)
- highlight map `ye`: WLD[0,1], high regions[1], SAS[2,3], SSF[2,4]
- **version 0.5**

### population-access (BcrOvn12)
- path opacity **2s**
- Escenas: pop → without band → region stack → SSF focus → country stack → NGA/COD/ETH
- yMax por escena: 8.2B → 1.5B → 666M
- Right axis % en escenas 3–5
- stack order by total; curve natural
- **version 0.2**

### chapter-scroll runtime
- Sticky 100dvh + `minHeight = nScenes * vhPerScene * 100vh`
- `sceneFromProgress(scrolled/travel, nScenes)`
- Mount once per block; `updateScene` on scroll
- Prose blocks entre scrollers
- **version 0.1.1** (nScenes en state)

---

## 4. Setup diario

```bash
# Origen
mkdir -p ~/atlas-serve/en && ln -sfn ~/atlas-global-development ~/atlas-serve/en/atlas
cd ~/atlas-serve && python3 -m http.server 8765

# Réplicas
cd ~/atlas-replicas && python3 -m http.server 8787
```

| URL | Qué es |
|-----|--------|
| `:8765/en/atlas/electricity-access/` | Origen |
| `:8787/stories/electricity-access/` | Story scroll (narrativa) |
| `:8787/library/regions-small-multiples/demo.html` | Demo motion regions |
| `:8787/library/population-access/` | (usar story o chapter) |
| `:8787/chapters/goal_07/00-…?clean=1` | Capítulo unitario regions |
| `:8787/gallery.html` | Índice |

---

## 5. Roadmap storytelling electricity

| # | Bloque video | Estado |
|---|--------------|--------|
| 0 | Regions small multiples | ✅ library + story |
| 1 | Prose bridge | ✅ |
| 2 | Population stack | ✅ library v0.2 + story |
| 3 | Progress race ETH/NGA/COD | ⬜ siguiente |
| 4 | Urban/rural | ⬜ |
| 5 | Hexmap Nigeria / Ethiopia | ⬜ (Mapbox) |

---

## 6. Checklist al agregar un patrón

1. RE chunk + constants en SPEC.md  
2. `mount` + `updateScene` (nunca solo remount)  
3. Demo HTML con botones de escena  
4. Wire `chapters/.../main.js` + script en `index.html`  
5. Añadir bloque a `stories/.../story.json` si es scroller de capítulo  
6. Card en gallery con badge **animated** / link a story  
7. Test: sceneIndex cambia con scroll o con botones  
8. Captura mid-transition en `recordings/compare/`

---

## 7. Anti-patrones

| Evitar | Por qué |
|--------|---------|
| Remount por escena | Mata CSS transitions |
| `nScenes` hardcodeado o undefined | Scroll no avanza escenas |
| Topbar sticky + chart sticky | Títulos clippeados |
| QA solo “¿hay SVG?” | Falso positivo |
| Decir “pixel perfect” sin side-by-side :8765 | Inflación |
| Firecrawl como runtime | Solo ref de copy/hero |

---

## 8. Inventario (orden de las 164)

- **Total canónico: 164** (no 167).  
- Fichero vivo: [`INVENTARIO_164.md`](./INVENTARIO_164.md) · JSON [`INVENTARIO_164.json`](./INVENTARIO_164.json)  
- Rebuild: `python3 scripts/build-inventory.py`  
- Tiers: **A-animated** (3 hoy) → B approved static → C scroller shell → D bulk  

Orden de trabajo: story electricity progress **beauty A** + water ladder/dual; hexmaps ya en v0.9.

### Progress-race (Brmmsw6q) — v0.3.1 beauty A

- CSS origin: `line.progress` opacity+stroke-width **2s**; `path` transform **2s**; text opacity 2s (hover 0.5s).
- `accessTween` JS 2s — **cancelar** tween al cambiar de escena.
- **Square marks 2015** siempre (Pixi-equivalent SVG rects `#d14b55`, ~3.6px); stems+arrows si `scene===3 || selected` (Se).
- Escena 0: dots + labels focus (16.6 / 29.0 / 52.5). Escena 2: 3 stems speed-colored + gradient legend. Escena 3: race full + chips.
- Legend stack: mini 2015→2023 **sobre** barra continua Speed of progress.
- Stem uniform ~5px / op 0.32 (focus 0.42); mount-once + `forceRemount: false` en story electricity.
- Filter ambos años ≠100; focus ETH/NGA/COD; speed domain `[-1,0,1,2]`.
- QA: `recordings/compare/beauty-progress/` · origin Pixi hace ruidoso el pixel-byte SVG crop.

### Service-ladder-stack — v0.3

- Pivot **Global=Total** (CSV trae Total/Urban/Rural; last-write sin filtro = Rural ~42% en vez de 61%).
- Stacked area 2000–2024 · layer dim por escena · mount-once en water story.

---

*Base para urban-rural y el resto del storytelling.*
