# Workers in low-income countries are less exposed to AI

| | |
|--|--|
| Chapter | **16** — Artificial Intelligence (AI) |
| Graphic | `exposure` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 6 |

## Description
Chart showing the occupational exposure to AI, by occupation type and income group

## Data files copied
- `data/beeswarm_updated.csv`

## Scenes
- `scene1_id`: Some occupations, such as information and communications technology (ICT) professionals, are exposed to AI in most facets of their work, wit
- `scene2_id`: Others, such as subsistence farmers, fishers, hunters and gatherers, are largely not exposed to AI in their work, with an exposure score of 
- `scene3_id`: Most occupations fall somewhere in between.
- `scene4_id`: Countries are exposed differently to AI because occupation types differ by country. We can see this by scaling the occupations according to 
- `scene5_id`: In middle-income countries, occupations such as market-oriented skilled agricultural workers and sales workers are common. These occupations
- `scene6_id`: In low-income countries, large populations of workers are engaged in subsistence farming, and less than 20 percent of workers are highly exp

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
