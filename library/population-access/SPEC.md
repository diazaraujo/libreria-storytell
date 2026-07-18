# SPEC · population-access

**Canónico:** `access_electricity_population`  
**Chunk:** `BcrOvn12.js` · CSS `AccessElectricityPopulation.Deu-ub7U.css` (`opacity 2s`)  
**Story:** `stories/electricity-access/` bloque `population`  
**Estado:** **v0.2** — stack regions/countries + y-domain por escena + right axis %

## Escenas (BcrOvn12)

| i | Contenido | yMax |
|---|-----------|------|
| 0 | World population area | 8.2B |
| 1 | + WLD without (band) + labels with/without | 8.2B |
| 2 | Stacked regions | 1.5B |
| 3 | SSF focus (others ~0.05) + right 100%/87% | 666M |
| 4 | Country stack top-8 + right 50% | 666M |
| 5 | NGA/COD/ETH highlight + million labels + 33% | 666M |

## Layout

- margin: top 24, right 56, bottom 28, left 52  
- x: [2000, 2023]  
- curve: natural (mismo solver que regions)  
- stack: order by total desc (largest bottom), offset none  

## API

```js
AtlasPopulationAccess.mount(el, {
  aggregates, worldPop, countries,
  sceneIndex, labels, forceRemount
});
chart.updateScene(i);
// version: 0.2.0
```
