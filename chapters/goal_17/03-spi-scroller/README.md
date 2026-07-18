# Statistical performance varies widely across economies

| | |
|--|--|
| Chapter | **17** — Data for Development |
| Graphic | `spi_scroller` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 9 |

## Description
Series of charts analysing statistical performance, showing that higher income economies tend to have better statistical capacity.

## Data files copied
- `data/17_data_spi_pillar_scores.csv`

## Scenes
- `spi`: Statistical performance varies widely across economies. Norway has an SPI score of around [emphasis: 94 points], close to the maximum of 100
- `five_pillars`: The SPI allows us to examine statistical systems along five key dimensions: data use, data services, data products, data sources, and data i
- `fifth_quintile `: High-income, OECD economies dominate the top tier of statistical systems, accounting for more than 90 percent of economies in the top SPI qu
- `fourth_quintile`: In the next quintile (60th–80th percentile of the overall SPI score), the composition shifts: upper-middle-income economies make up over hal
- `third_quintile`: The middle quintile shows more unevenness across the five pillars; it is where the highest-performing low-income economies begin to appear. 
- `second_quintile`: In the third and fourth quintiles, weaknesses in data sources begin to emerge, with performance on Pillar 4 (data sources) starting to lag n
- `first_quintile`: In the 5th quintile—the bottom 20 percent of economies based on overall SPI scores—a striking pattern is the presence of many Small Island D
- `fcv_pillars`: About 60 percent of FCV economies fall in the lowest SPI quintile. Yet these are precisely the settings where timely, credible statistics ar
- `fcv_data_sources`: The gap is starkest for Pillar 4 (data sources). FCV economies tend to score extremely low on the ability to produce the building blocks of 

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
