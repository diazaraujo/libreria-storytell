# Almost all economies have increased their Internet access since 2015

| | |
|--|--|
| Chapter | **09** — Internet Access |
| Graphic | `internet_progress` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 2 |

## Description
This chart uses arrows to show Internet access levels by economy in 2015 and 2024. It also shows where the economies would have been, had they followed the typical pace of progress since 2015.

## Data files copied
- `data/09_data_internet_usage_progress.csv`

## Scenes
- `progress1 `: By 2024, in 54 countries, more than 90 percent of the population was using the Internet.
- `progress2 `: Countries like [emphasis: Cambodia][emphasis:  ]and the[emphasis:  ][emphasis: Kyrgyz Republic][emphasis:  ]had made much more progress by 2

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
