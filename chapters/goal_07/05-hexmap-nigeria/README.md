# Nigeria: uneven and unreliable access 

| | |
|--|--|
| Chapter | **07** — Electricity Access |
| Graphic | `hexmap_nigeria` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 8 |

## Description
Map of nightlights in Nigeria as a proxy for electricity access. 

## Data files copied
- `data/07_data_access_electricity_nigeria_zones.csv`

## Scenes
- `zones`: [emphasis: Electricity access in Nigeria is highly uneven]. Southern zones enjoy relatively high coverage, while the north lags far behind. 
- `nightlights`: [emphasis: Nighttime lights provide a more granular view of electricity access]. They are a proxy for electricity access and usage. When ove
- `nightlights_cities`: The[emphasis:  ]brightest clusters correspond to major cities, such as Lagos, Abuja, and Port Harcourt, where grid access is widespread and 
- `nightlights_urban`: Let’s focus on Nigeria’s[emphasis:  urban areas]…
- `zoom_kano`: … and zoom in on Kano. As in most cities, a large majority of households here are connected to the grid. Where bright lights are detected, n
- `urban_dark`: Filtering out the brightest data points highlights that, even when connected to the grid, [emphasis: large urban and suburban zones may rema
- `urban_population_dark`: Although these are densely populated suburban settlements, they  still lack highly visible illuminations.
- `kano_cell_highlight`: For example, this 36 square kilometer cell is estimated to house more than 100,000 people, but remains largely in the dark. This illustrates

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
