# People can be highly vulnerable for several different reasons

| | |
|--|--|
| Chapter | **13** — Climate |
| Graphic | `sdg13_icon_matrix` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 4 |

## Description
Figure showing the number of vulnerable people globally as well as by region and country. The figure also breaks down the vulnerability by six of its dimensions, showing the share of the population classified as vulnerable due to lack of access to clean water, electricity or financial services or lack of income, education, or social protection.

## Data files copied
- `data/climate_vulnerability.zip`

## Scenes
- `multi__grid__vuln__wld`: Each row has 1,000 squares, and each individual square represents 8 million people. More than one-third of the[emphasis:  ][emphasis: world’
- `multi__grid__vuln__nac`: Levels of vulnerability range from 1.7–94 percent across regions. In [emphasis: North America], only 1.7 percent of the population is vulner
- `multi__grid__vuln__ssf`: In [emphasis: Sub-Saharan Africa,] a staggering 94 percent of the population is vulnerable. [emphasis: Lack of social protection] impacts al
- `multi__explore`: Select an economy or region to see the share of population and number of people that are vulnerable and the dimensions of vulnerability that

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
