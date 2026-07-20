# Pixel-perfect program (all chapters)

## Reality check

The World Bank ships a **minified production build**, not source. True 1:1 for every micro-interaction in 164 charts is multi-week work. This repo uses a **tiered fidelity model**:

| Tier | Meaning | Coverage now |
|------|---------|----------------|
| **A — Hero** | Full-bleed story landing (progress sticks, reveal, hover) | **12 chapters** |
| **B — Story graphic** | Custom main matching Atlas chart type/scenes | Water, Electricity, Poverty, Internet, D4D, … |
| **C — Functional** | Bulk generator / proxies, correct data, not layout-identical | Remaining gallery items |

## Approved pixel-perfect (2026-07-18)

**Source of truth:** [`docs/APPROVED_PIXEL_PERFECT.md`](./APPROVED_PIXEL_PERFECT.md) · [`docs/APPROVED_PIXEL_PERFECT.json`](./APPROVED_PIXEL_PERFECT.json)

**149 items** marked `_meta.fidelity = "pixel-perfect"` + `_meta.approved = true` (see `APPROVED_PIXEL_PERFECT.md`):

| Group | Count | Notes |
|-------|------:|-------|
| Heroes (Tier A) | 12 | all chapter landings |
| Water body (06) | 11 | full chapter |
| Electricity (07) | 7 | RE from AccessElectricity* chunks |
| Extreme poverty (01) | 6 | draw + scroller + venn + scatter |
| Internet (09) | 9 | hand layouts; **excl.** coverage_map map proxy |
| Data for Development (17) | 5 | + SPI ready embed |
| Prosperity gaps (10) | 1 | log scatter |
| SPI ready | 1 | `_ready/spi-scroller` |

**Not approved:** bulk (`tier-B-bulk`), Hunger suite (hand but incomplete RE), Mapbox/WebGL maps beyond nightlights proxies.

## Chapter heroes (Tier A)

Index: **http://localhost:8787/_ready/heroes.html**

Built from `atlas-global-development/yearly-data/progress/{code}.csv`:

| Hero | Progress code | Stick color |
|------|---------------|-------------|
| water-access | 61.2.0 | teal |
| electricity-access | 7.1.1 | gold |
| extreme-poverty | 1.1.1 | purple |
| internet-access | 17.8.1 | blue |
| learning-and-work | 4.1.2 | green |
| inequality | 10.1.1 | red |
| artificial-intelligence | 17.8.1 | violet |
| gender-and-jobs | 8.5.1 | pink |
| urban-development | 43.0.0 | green |
| climate | 42.0.0 | teal |
| data-for-development | 17.18.1 | WB blue |
| global-progress | 47.0.0 | light blue |

Each hero:

- start→end vertical sticks (2015→end year)
- sorted by end value
- **reveal data** toggle
- hover: country, end value, progress category (`.small` / `.large`)
- key facts + link to original Atlas

Water values validated against the original recording (AFG ~30.6, IRL ~96.1, MMR ~59.7).

## Story graphics (Tier B)

| Chapter | Status |
|---------|--------|
| **06 Water Access** | **Done (11/11 QA)** — ladder stack, urban/rural, country beeswarm, estimating, limiting factors, Tanzania paths, E. coli, arsenic |
| **07 Electricity Access** | **Done (7/7 QA)** — regions 4×2 small multiples + scene highlight map; population multi-scene; urban/rural dual-line gap fills; progress **horizontal race/arrow** chart (not slope); ETH/NGA/COD urban–rural; Nigeria zones+nightlights camera; Ethiopia rural nightlights scenes |
| **01 Extreme Poverty** | **Tier B pixel pass** — draw_your_chart interactive; regional multi-line; country scroller choreography (KOR→RWA + on-track/left-behind); projections rate4/2/1/H; venn root-cause bubbles; multi vs monetary scatter |
| **17 Data for Development** | survey strip, Nigeria dual-line, children waffles, SPI scroller, SPI–GDP scatter |
| **10** | prosperity_gaps log scatter |
| **09 Internet Access** | **Done (10/10 QA)** — access scroller; urban–rural; gender gap; progress race; mobile vs fixed; coverage; speeds; slopes; text; smartphones |
| **02 Hunger** | **Tier B** — regional undernourishment, country grid, hotspot matrix, conflict dual-line, Myanmar prices, NDVI proxy |
| **03 Health** | **Tier B** — UHC charts, mortality, RMNCH race, financial hardship bars, medical cost |
| **04–05** | **Tier B bulk** — schooling, wages, LFP, SDG5 suite |
| **08 Growth** | **Tier B bulk** — GDP growth, income maps, unemployment, NEET |
| **10 Inequality** | **Done** — prosperity gaps suite (custom earlier + bulk) |
| **11–16** | **Tier B bulk** — urban, prices, climate, plastics, land, AI/digital |
| **id4d / progress / dashboard / 99** | **Tier B** — image panels + progress tools |

**Full index:** `/_ready/all-chapters.html` (164 graphics)

**QA (2026-07-18):** `node qa-pass.mjs --status ready` → **164/164 OK**

### Chapter hubs

- All: `/_ready/all-chapters.html`
- Water: `/_ready/water-chapter.html`
- Electricity: `/_ready/electricity-chapter.html`
- Extreme poverty: `/_ready/poverty-chapter.html`
- Internet: `/_ready/internet-chapter.html`

### Water Access navigation

- Hero: `/_ready/water-access-hero/`
- Body hub: `/_ready/water-chapter.html`
- Clean pages: `chapters/goal_06/*/?clean=1`

Clean UI: append `?clean=1` on scaffold pages.

## Process for the rest (Tier B/C → B)

1. Open original Atlas URL + our page side by side  
2. Identify `graphic` name in `all_visualizations.json`  
3. Grep minified chunks for layout rules  
4. Rewrite `chapters/goal_XX/.../main.js` (do **not** leave AtlasAuto)  
5. `node qa-pass.mjs --only <graphic>`  
6. Optional screenshot compare  

## Commands

```bash
cd ~/atlas-replicas
python3 -m http.server 8787

open http://localhost:8787/_ready/heroes.html
open http://localhost:8787/chapters/goal_17/00-survey-age/index.html?clean=1

cd scripts/capture
node qa-pass.mjs --status ready
```

## Rebuild heroes after updating Atlas clone

```bash
# re-run the hero catalog builder (see session script or recreate from docs)
# data lives in: _ready/<slug>-hero/data/country_progress.json
# meta: _ready/<slug>-hero/meta.json
```
