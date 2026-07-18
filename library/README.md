# Atlas graphic library (pixel-perfect + motion)

Reusable chart patterns reverse-engineered from the World Bank Atlas build.

## Principle

1. **Mirror** = origin visual truth (`:8765/en/atlas/…`).
2. **Library** = editable components with **scene animation** (`mount` once → `updateScene`).
3. **Chapters** = single-graphic shell (QA / isolation).
4. **Stories** = full chapter scroll (storytelling Atlas).

> **Never remount on scene change.** That kills CSS transitions and looks like static copies.

## Patterns

| Folder | Chunk / pattern | Motion | Status |
|--------|-----------------|--------|--------|
| [`regions-small-multiples/`](regions-small-multiples/) | DNnJZ53u AccessElectricityRegions | opacity **1s** + particles | **v0.5** · demo + story + chapter |
| [`population-access/`](population-access/) | BcrOvn12 AccessElectricityPopulation | opacity **2s** + stack layers | **v0.2** · demo + story + chapter |
| [`progress-race/`](progress-race/) | Brmmsw6q AccessElectricityProgress | dots 2015 · stems · gradient · chips · tween **2s** | **v0.2** · demo + story + chapter |
| [`dual-line-urban-rural/`](dual-line-urban-rural/) | Bktvr1TG + DnvCGyY_ | hatch gap · regions 4×2 + countries 1×3 | **v0.2** · demos + story |
| [`nightlights-hexmap/`](nightlights-hexmap/) | hexmap NG/ET | camera transform **0.85s** | **v0.8** · Mapbox Standard monochrome · origin layer order · demo + story + chapters |
| heroes / beeswarm / waffle / scatter | shared/ | partial | |

## Demos (animaciones)

```
http://127.0.0.1:8787/library/regions-small-multiples/demo.html
http://127.0.0.1:8787/library/population-access/demo.html
http://127.0.0.1:8787/library/progress-race/demo.html
http://127.0.0.1:8787/library/dual-line-urban-rural/demo.html
http://127.0.0.1:8787/library/dual-line-urban-rural/demo-countries.html
http://127.0.0.1:8787/library/nightlights-hexmap/demo.html
```

## Storytelling

```
http://127.0.0.1:8787/stories/electricity-access/
```

Hub capítulo: `_ready/electricity-chapter.html`  
Learnings: `docs/LEARNINGS_ATLAS_STORYTELLING.md`

## API común

```js
const chart = AtlasX.mount(el, { data…, sceneIndex: 0 });
chart.updateScene(n);           // animated
chart.setScene(n, { animate: false });
chart.destroy();
```

## Local stack

```bash
# Origen (base path /en/atlas)
mkdir -p ~/atlas-serve/en && ln -sfn ~/atlas-global-development ~/atlas-serve/en/atlas
cd ~/atlas-serve && python3 -m http.server 8765

cd ~/atlas-replicas && python3 -m http.server 8787
```
