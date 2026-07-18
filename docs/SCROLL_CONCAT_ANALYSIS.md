# Análisis crítico: concatenar scroll armónico (como el video Atlas)

**Referencia:** `recordings/user-refs/atlas-anim-2026-07-18-1505.mov` (~113 s)  
**Story:** Electricity Access (`electricity-access`)  
**Fecha:** 2026-07-18  

---

## 1. Qué es realmente el video (no un gráfico)

El video **no** es “un chart con 5 escenas”. Es **un solo flujo de lectura** de un capítulo completo:

| Tiempo (aprox.) | Bloque en pantalla | Graphic / patrón |
|-----------------|--------------------|------------------|
| 0–15 s | Hero + key facts | layout story |
| 15–35 s | Small multiples regiones + annotation | `access_electricity_regions` (scroller, 5 escenas) |
| 35–40 s | **Puente de texto** (sin viz sticky) | prose entre bloques |
| 40–70 s | Población sin acceso (stacked/ridge) | `access_electricity_population` (scroller, 6) |
| 70–85 s | Progress race ETH/NGA/COD | `access_electricity_progress` (scroller, 4) |
| 85–113 s | Hexmap Nigeria night lights | `hexmap_nigeria` (scroller, 8) |
| (más abajo, no siempre en el cut) | Urban/rural vis, Ethiopia hexmap… | `…urban_rural`, `hexmap_ethiopia` |

Del catálogo Atlas `goal_07` hay **7 bloques** en orden fijo:

```
00 regions (scroller×5)
01 population (scroller×6)
02 urban_rural (vis, 0 scenes)
03 progress (scroller×4)
04 urban_rural_countries (vis)
05 hexmap_nigeria (scroller×8)
06 hexmap_ethiopia (scroller×4)
```

**Armonía del video = continuidad del documento + sticky + motion dentro de cada bloque + handoff limpio entre bloques.**

Hoy la réplica tiene lo primero bien a nivel *patrón* (regions v0.5), pero el *capítulo* sigue siendo **7 páginas sueltas**.

---

## 2. Cómo construye el Atlas esa armonía (mecánica)

### 2.1 Un solo scroll nativo
- La página es un **documento largo**.
- No hay “siguiente gráfico” con click obligatorio.
- El scroll del browser es el timeline.

### 2.2 Sticky chart + pasos invisibles (`inview`)
CSS del clone (`triggerAnalytics…inview`):

- `.inview-parent-container` → altura del tramo (fit-content del scroller).
- `.inview-container` → sensor absoluto:  
  `top: 50vh`, `height: calc(100% - 100vh)`  
  o en scroller: `top: 50vh; height: calc(100% - 100vh)`.

Eso significa:

> Mientras el bloque scroller ocupa N viewports de altura, el **gráfico se queda pinneado** y el **progreso vertical** dentro del bloque cambia `activeScene`.

No es “cada rueda = escena” (como nuestra shell). Es **posición de scroll → escena**.

### 2.3 Tres capas de motion (y por qué se siente un solo sistema)

| Capa | Qué se mueve | Timing típico |
|------|----------------|---------------|
| A. Escena *intra*-viz | opacity paneles, partículas, labels | **1 s** (`transition: opacity 1s`) |
| B. Annotation card | copy + borde de color | ~0.3–0.5 s fade, alineado al cambio de escena |
| C. Handoff *inter*-viz | un sticky sale, entra el siguiente; a veces prose en medio | scroll continuo + mount on enter |

La armonía viene de que **A y B comparten la misma ventana temporal** y **C no resetea el scroll ni el contexto visual de golpe**.

### 2.4 Continuidad narrativa (no solo técnica)
El video no salta “regions → population” a secas:

1. Cierra regions con SSF + partículas naranjas.  
2. **Baja a prosa** (“While progress has been remarkable… But has this translated…?”).  
3. Aparece el H2 del siguiente bloque y el nuevo sticky.

Ese **puente de texto** es parte del diseño. Sin él, concatenar 7 charts se siente playlist, no story.

### 2.5 Partículas / canvas compartidos
En Atlas, `activeParticles` es store global. Entre escenas del **mismo** scroller, los puntos **vuelan**.  
Entre **bloques distintos**, a menudo el sistema de partículas se reusa o se limpia — pero la **paleta** (SSF naranja, WLD azul) se mantiene. Eso da cohesión de marca.

---

## 3. Qué tenemos hoy (crítico)

| | Atlas (video) | Réplica actual |
|--|---------------|----------------|
| Unidad de navegación | Capítulo completo | Un `chapters/goal_07/0N-…` aislado |
| Trigger de escena | Scroll position / inview | Wheel step + botones + lock 1 s |
| Sticky multi-bloque | Sí (N viewports por scroller) | No: un stage fijo ~72 vh |
| Puentes de prosa | Sí, entre bloques | No |
| Handoff viz→viz | Continuo | Hard navigation / gallery |
| Motion intra-escena regions | 1 s opacity + particles | **v0.5 OK** |
| Motion otros 6 graphics | Completo en origen | Mayormente scaffold / bulk |
| Shared particle layer | Global | Solo RSM sintético |
| URL / deep link | `#contentId` por bloque | `?clean=1` por carpeta |

### El fallo no es la transición de regions
Regions **ya se siente bien** dentro de su burbuja.  
El fallo es **escala**: concatenar scroll sin arquitectura de capítulo produce:

1. **Playlist effect** — cada viz “empieza de cero”.  
2. **Ritmo roto** — wheel-lock de 1 s × escena no imita scroll continuo (en Atlas puedes pasar lento o rápido).  
3. **Sin sticky height** — no hay “espacio de scroll” proporcional a `#scenes`.  
4. **Sin handoff** — population no hereda el cierre emocional de SSF; el naranja no “continúa” la historia.  
5. **Chrome de réplica** (footer 1/5, source bar) compite con el full-bleed del video.

---

## 4. Qué significa “armónico” (criterios medibles)

Para que el scroll concatenado se acerque al video, hace falta pasar estos checks:

### 4.1 Continuidad espacial
- [ ] Un solo `document` scrollable para electricity-access.  
- [ ] Cada scroller tiene altura ≈ `(scenes.length) * k * 100vh` (k ~ 0.7–1.0, calibrar vs origen).  
- [ ] Chart sticky `top: ~header` mientras el bloque está activo.

### 4.2 Continuidad temporal
- [ ] Escena = `f(scrollProgress)` del bloque, no click.  
- [ ] Transición escena ≤ 1 s; no bloquear el scroll del usuario (lock solo anti-spam, no anti-scroll).  
- [ ] Annotation y chart cambian en el **mismo frame de decisión** (mismo índice de escena).

### 4.3 Continuidad narrativa
- [ ] Prose bridges entre bloques (del HTML/SSR del clone o de `all_visualizations` + story text).  
- [ ] Títulos H2 del siguiente bloque entran *antes* de que el sticky anterior se despinne (como en arc_08 del video).

### 4.4 Continuidad visual
- [ ] Misma tipografía (Open Sans), márgenes, source footer, menú.  
- [ ] Paleta región/país estable en todo el capítulo.  
- [ ] Partículas / dots no “pop” al montar: fade-in on inview.

### 4.5 Continuidad de estado (avanzado)
- [ ] Opcional: al salir de regions en SSF, population abre con énfasis SSF/África.  
- [ ] Deep-link `#c…` restaura bloque + escena.

---

## 5. Arquitectura propuesta: Chapter Scroll Runtime

No concatenar iframes de 7 folders. Un **runtime de capítulo**:

```
chapters/goal_07/story.html   (o electricity-access/index.html en réplicas)
  shared/chapter-scroll.js    ← IntersectionObserver + sticky stages
  blocks/
    00-regions/     → mount AtlasRegionsSmallMultiples
    01-population/  → mount population pattern
    …
  prose/            → HTML bridges (del mirror)
```

### 5.1 Modelo de datos (un JSON de historia)

```json
{
  "slug": "electricity-access",
  "blocks": [
    {
      "id": "regions",
      "type": "scroller",
      "graphic": "access_electricity_regions",
      "library": "RegionsSmallMultiples",
      "scenes": [/* del config */],
      "scroll": { "vhPerScene": 0.85 },
      "proseAfter": "while-progress-remarkable.html"
    },
    {
      "id": "population",
      "type": "scroller",
      "graphic": "access_electricity_population",
      …
    }
  ]
}
```

Fuente de verdad: `all_visualizations.json` → `07.en` + configs de réplica.

### 5.2 Motor de scroll (API mental)

```js
// Por cada bloque scroller:
// height = scenes.length * vhPerScene * window.innerHeight
// sticky chart inside
// progress = clamp((scrollY - blockTop) / (blockHeight - 100vh), 0, 1)
// sceneIndex = min(scenes-1, floor(progress * scenes))
// if sceneIndex changed → chart.updateScene(i)  // NUNCA remount
```

Reglas:

1. **`updateScene` only** dentro del bloque (ya validado en RSM v0.5).  
2. **Mount on enter / destroy on leave lejano** (lazy) para no cargar 7 Pixi/Mapbox a la vez.  
3. **Sin wheel hijack** que impida scroll nativo; como mucho *debounce* de escena.

### 5.3 Handoff entre bloques

| Momento | Qué hacer |
|---------|-----------|
| progress → 1 en bloque A | último `updateScene`; annotation final |
| scroll entra proseAfter | sticky A se despinne; fade chart A |
| inview B | mount B (animateIntro suave); no hard cut blanco |
| progress B > 0 | primera escena B con opacity 1 s |

El “blanco del video” entre charts **no es vacío accidental**: es **prose + aire tipográfico**. Hay que **diseñarlo**, no rellenarlo con el siguiente chart pegado.

### 5.4 Qué no concatenar todavía

- Mapbox hexmaps (Nigeria/Ethiopia) sin tokens/tiles → placeholder o mirror de tiles.  
- Progress race sin patrón library → bulk se ve “otro producto”.  
- Population ridge/stack es un **segundo patrón** tan pesado como regions; sin él el scroll se rompe en el minuto 1 del video.

**Orden honesto de valor:**

1. Chapter shell scroll (estructura + prose + sticky vacío).  
2. Regions ya OK → primer bloque real.  
3. Population (segundo patrón del video, ~30 s).  
4. Progress race.  
5. Hexmaps al final (o capturas estáticas + nota).

---

## 6. Diferencias de ritmo: wheel-step vs scroll-progress

| | Wheel-step (shell actual) | Scroll-progress (Atlas) |
|--|---------------------------|-------------------------|
| Control | 1 gesto = 1 escena | usuario define velocidad |
| Sensación | deck / carrusel | lectura |
| Mid-scroll | no existe | sí (halfway = mid scene) |
| Armonía multi-bloque | mala | natural |

**Conclusión:** mantener botones/dots como *accesibilidad*, pero el path pixel del video es **scroll-progress**. El lock de 1 s en wheel fue útil para QA de motion; para concatenar es **contraproducente** si bloquea el documento.

---

## 7. Riesgos y costos

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Remount al cambiar bloque | flash / “gráfico nuevo” | mount once per block; hide no destroy |
| 7 charts montados | jank | mount solo ±1 bloque del viewport |
| Altura vh mal calibrada | escenas se saltan | calibrar con `:8765/en/atlas/` + Playwright |
| Prose missing | handoffs secos | copiar del SSR del mirror |
| Mapbox offline | huecos en 05/06 | tiles cache o poster frames del video |
| Partículas globales | fugas de estado | reset store al leave del bloque |

---

## 8. Veredicto crítico

### Lo que ya está “video-ready”
- **Intra-escena** de `regions-small-multiples` (opacity 1 s, partículas, annotation card en scroller-layout).  
- Metodología: mount once / updateScene.

### Lo que **impide** la armonía del video
1. **No hay capítulo**: hay 7 monorepos visuales.  
2. **No hay scroll-linked scenes**: hay carrusel.  
3. **No hay prose bridges**.  
4. **Faltan los patrones del medio del video** (population, progress) al mismo nivel que regions.  
5. **Chrome de réplica** vs full story de Data360.

### Frase dura (útil)
> Pixel-perfect de un panel **no escala** a pixel-perfect de un capítulo.  
> El video es un **sistema de scroll**; la réplica es un **kit de componentes**.  
> Concatenar sin runtime de capítulo solo pega piezas y se nota.

---

## 9. Plan de concatenación (recomendado)

### Fase A — Skeleton armónico (1 runtime, charts mock)
- `story.html` con 7 bloques + prose del mirror.  
- Sticky + inview + `sceneIndex` por scroll.  
- Dots / progress solo visual.  
- **Exit criterion:** scrollear electricity-access en réplica se *siente* como el video aunque los charts sean placeholders.

### Fase B — Bloque 0 real (regions)
- Enchufar RSM v0.5 al bloque 0.  
- Calibrar `vhPerScene` vs origen `:8765/en/atlas/`.  
- **Exit:** 0–35 s del video ≈ réplica.

### Fase C — Bloque 1 population (nuevo patrón library)
- Mismo rigor que regions (chunk RE + mount once + updateScene).  
- **Exit:** 35–70 s del video.

### Fase D — Progress + hexmaps
- Progress como patrón 3.  
- Hexmaps: real o “cinematic stills” del video si Mapbox no cierra.

### Fase E — Polish de handoff
- Shared particles / color continuity.  
- Deep links.  
- Clean mode full-bleed.

---

## 10. Métricas de “se ve como el video”

Comparar lado a lado (Playwright + grabación):

1. **Tiempo en cada bloque** ±15 % vs video a scroll “lectura normal”.  
2. **Misma secuencia de títulos H2**.  
3. **Annotation left** en todos los scrollers.  
4. **Nunca** flash blanco > 100 ms entre bloques (salvo prose intencional).  
5. **Intra-escena** regions: mid-frame con partículas en vuelo (ya capturado).  
6. **Source line + share icons** consistentes al pie del sticky (Atlas).

---

## 11. Decisión que necesitamos de ti

Para ejecutar concatenación sin diluir esfuerzo:

| Opción | Qué implica |
|--------|-------------|
| **A. Solo electricity-access** (recomendado) | Un story runtime; 7 bloques; patterns en orden del video |
| **B. Runtime genérico multi-capítulo** | Más infra, más lento al primer “se siente como el video” |
| **C. Concatenar solo regions→population** | MVP de handoff en ~2 patrones; demo corta del video |

**Recomendación:** **C → A**. Primero handoff regions→population con prose bridge (el corte más visible del video ~35–45 s). Luego expandir al capítulo completo.

---

## 12. Resumen en una tabla

| Pregunta | Respuesta |
|----------|-----------|
| ¿Las transiciones de regions están bien? | Sí (v0.5). |
| ¿Eso basta para el video? | **No.** |
| ¿Qué falta? | Scroll-progress chapter runtime + prose + sticky multi-bloque + 2–3 patrones más. |
| ¿Cómo concatenar sin que se vea playlist? | Un documento, inview, updateScene, puentes de texto, mount lazy. |
| ¿Primer entregable armónico? | `electricity-access` story con regions real + population placeholder sticky + prose del mirror. |

---

*Cuando digas “vamos por el runtime” o “C / A”, se implementa la Fase A/C sin reabrir el RE de regions.*

## Implementado (2026-07-18)

- Runtime: `shared/chapter-scroll.js`
- Story MVP: [`stories/electricity-access/`](../stories/electricity-access/) — regions → prose → population
- Capturas: `recordings/compare/chapter-scroll-electricity/`
