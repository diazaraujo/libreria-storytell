# SPEC · access-trends-scroller

**Canónico:** `internet_access_scroller` (goal_09 / 00)  
**Demo:** `http://127.0.0.1:8787/library/access-trends-scroller/demo.html`  
**Estado:** **v0.1** — multi-series lines · scene opacity · world / income / regions

## Escenas (internet)

| Scene | Keys |
|-------|------|
| 0 | WLD |
| 1 | LIC, LMC, UMC, HIC |
| 2 | WLD + 7 regions |

## API

```js
const chart = AtlasAccessTrendsScroller.mount(el, {
  rows,                 // { iso3c, year, value }[]
  sceneIndex: 0,
  // sceneKeys: optional override
  // valueField: "value"
  forceRemount: true,   // story shell remounts sticky blocks
  height: 440,
});
chart.updateScene(2);
chart.destroy();
```

## Story

`stories/internet-access/` — block `access-trends`
