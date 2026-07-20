# hazard-exposure-map

**Atlas graphic:** `sdg13_effects_of_climate_change_scroller`  
**RE chunk:** `BmkL22Hm.js`  
**See also:** `docs/suites/climate/SPEC.md`

## API

```js
const rows = await AtlasLoad.csv("./data/20260130_hazard_data_prepared.csv");
// mount once
AtlasHazardExposureMap.mount(chartEl, {
  rows,
  hazard: "floods",           // floods | drought | cyclones | heatwave
  sceneId: "floods__sat__wld", // or sceneIndex 0..2 with default scene list
  sceneIndex: 0,
});
// on scene change
AtlasHazardExposureMap.updateScene(chartEl, {
  sceneId: scene.id,
  sceneIndex,
});
```

## Scene grammar

`{hazard}__{sat|vec}__{wld|bbox|bbox1}`

| mode | basemap | choropleth |
|------|---------|------------|
| sat | mapbox satellite | off (or very faint) |
| vec | dark-v11 muted | country fill by `sha_*` |

Camera: world vs hazard bbox from RE.

## Data fields

`code` (ISO3) → `sha_flood` | `sha_drought` | `sha_cyclone` | `sha_heatwave` | `sha_all`
