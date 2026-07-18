# SPEC · regions-small-multiples

**Canónico:** `access_electricity_regions`  
**Chunk:** `DNnJZ53u.js` + curva `UAFRlFgY.js` (curveNatural)  
**CSS:** `AccessElectricityRegions.D8sNcrsm.css` → `transition: opacity 1s`  
**Story local:** `http://127.0.0.1:8765/en/atlas/electricity-access/`  
**Demo:** `http://127.0.0.1:8787/library/regions-small-multiples/demo.html`  
**Estado:** **v0.5 — pixel transitions** (mount once · opacity 1s exact · particles · scroller card)

## Principio de motion (crítico)

> **Nunca remount al cambiar de escena.**  
> Remount = gráfico “nuevo” estático. El Atlas solo muta opacity / particle targets.

```js
const chart = AtlasRegionsSmallMultiples.mount(el, { series, sceneIndex: 0 });
// luego:
chart.updateScene(2); // CSS transition 1s + particle flight
```

## Motion checklist (vs grabación Atlas)

| Efecto | Atlas | v0.4 |
|--------|-------|------|
| Opacity paneles / labels | 1s ease | ✅ CSS |
| Partículas country → World (scene 0) | Pixi | ✅ SVG rects (sample regional) |
| Partículas vuelan a región (scene 1+) | Pixi layout ve() | ✅ transform 1s |
| SAS/SSF scene 1 se quedan en World | sí | ✅ |
| Line draw intro | (subtle) | ✅ stroke-dash |
| Story card fade | scroller | ✅ demo + shell |
| Partículas country reales (iso3c) | dataset full | ⚠️ sintéticas por región×año |

## Layout (DNnJZ53u)

| Param | Desktop | Mobile &lt;640 |
|-------|---------|----------------|
| height | 500 | 800 |
| cols × rows | 4 × 2 | 2 × 4 |
| margin | 16 / 20 / 20 / 32 | same |
| gap h / v | 40 / 60 | 34 / 40 |
| marker | g=6 → rect g+2 | |
| particle size | g−1 = 5 | |
| transition | **1000 ms** | |

## Escenas (`ye` map)

| key | scenes opacos |
|-----|----------------|
| WLD | 0, 1 |
| MEA, LCN, EAS, ECS, NAC | 1 |
| SAS | 2, 3 |
| SSF | 2, 4 |

Scene 2: force SAS+SSF.

## Particle layout (DNnJZ53u `ve`)

- **scene 0:** all → panel WLD, y = `worldValue`, color WLD  
- **scene 1 + SAS/SSF:** stay on WLD, y = `worldValue`  
- **else:** panel = own region, y = `regionValue`, color región  

Sintéticas: un punto por (región ≠ WLD, año) muestreado de la serie regional + `worldValue` de WLD.

## Servir origen

```bash
mkdir -p ~/atlas-serve/en && ln -sfn ~/atlas-global-development ~/atlas-serve/en/atlas
cd ~/atlas-serve && python3 -m http.server 8765
# http://127.0.0.1:8765/en/atlas/electricity-access/
```

## API

```js
const chart = AtlasRegionsSmallMultiples.mount(el, {
  series, sceneIndex, particles: true, animateIntro: true,
  forceHighlight: (key, idx) => idx === 2 && (key === "SAS" || key === "SSF"),
});
chart.updateScene(n);  // animated
chart.setScene(n, { animate: false });
chart.destroy();
// version: 0.4.0
```

## Capturas animación

`recordings/compare/regions-small-multiples-polish/`
- `anim-demo-s0-to-s1-mid.png` — partículas a medio vuelo  
- `anim-demo-walk.webm` — walk de escenas  
- `origin-v03-chart.png` / `origin-mp4-t18.jpg` — ref Atlas  
