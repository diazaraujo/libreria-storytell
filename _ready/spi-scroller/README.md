# SPI Scroller — Atlas #c21 recreation

Editable recreation of the **Statistical Performance Indicators (SPI)** scrollytelling beeswarm from:

https://data360.worldbank.org/en/atlas/data-for-development/?lang=en#c21

## Run

```bash
cd atlas-c21-spi-scroller
python3 -m http.server 8765
# open http://localhost:8765
```

Or open `index.html` via any static server (fetch needs HTTP for `data.json`).

## What’s included

| File | Role |
|------|------|
| `index.html` | Full interactive recreation (HTML + CSS + JS) |
| `data.json` | 188 economies from Atlas `17_data_spi_pillar_scores.csv` + income groups + names |

## Scenes (same as original `#c21`)

1. **spi** — single vertical beeswarm (Norway vs South Sudan)
2. **five_pillars** — splits into SPI + 5 pillars
3. **fifth_quintile** → **first_quintile** — highlight each SPI quintile
4. **fcv_pillars** — color by FCV / non-FCV
5. **fcv_data_sources** — focus Pillar 4 + median lines

## How to edit

Open `index.html` and change the **EDITABLE CONFIG** block:

- `COLORS` — income / FCV palette  
- `SCENES` — text, which countries to label, highlight rules  
- `DOT_R` — point size  
- `FCV_MEDIAN_PILLAR4` / `NON_FCV_MEDIAN_PILLAR4` — median annotations  

To change data, edit `data.json` (fields: `iso3c`, `name`, `spi_index`, `spi_quintile`, `fcv`, `pillar1`…`pillar5`, `income`, `region`).

## Notes

- The public Atlas repo is a **compiled** SvelteKit build (no `.svelte` sources).
- Layout uses the same packing algorithm family as the Atlas beeswarm helper (`calculateYPositions`), not d3-force.
- This is a fan recreation, not an official World Bank product.
