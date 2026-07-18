# The wealthier the country, the lower the NEET

| | |
|--|--|
| Chapter | **08** — Economic growth |
| Graphic | `neet_gdp` |
| Type | `scroller` |
| Status | `ready` |
| Scenes | 9 |

## Description
Describe what the visualization shows

## Data files copied
- `data/08_data_neet_gdp.csv`

## Scenes
- `countries`: The share of youth (15-24 years of age) not currently in employment, education or training (NEET) is correlated with the income level of the
- `SAS`: In South Asia levels are on average quite high.
- `MEA`: In the Middle East & North Africa levels are on average quite high, but there is a strong negative correlation between NEET and GDP even wit
- `SSF`: Sub-Saharan Africa has the highest levels of NEET on average of any region, without any clear relationship with a country’s income level.
- `all_countries`: Similar to the trends observed regarding labor force participation in [goal: 5] these regional differences tell a striking story related to 
- `gender`: Generally, women are more likely to be outside employment, education or training. And in some regions, these differences across genders are 
- `gender_SAS`: In South Asia, for instance, India stands out by having NEET rates for women almost 4 times the NEET rate for men.
- `gender_MEA`: In the Middle East, North Africa, Afghanistan and Pakistan region, approximately 1 in 3 youth are not in employment, education or training a
- `gender_SSF`: While Sub-Saharan Africa has the highest level of NEET across regions, gender differences are less profound although a few countries exhibit

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
