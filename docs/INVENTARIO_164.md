# Inventario ordenado — 164 gráficos Atlas

**Fecha:** 2026-07-18  
**Total canónico: 164** (fuentes alineadas: all_visualizations · graphic-catalog · chapters · gallery).

## Conteos

| Métrica | N |
|---------|---|
| Total | **164** |
| Scroller | 72 |
| Vis | 92 |
| Status ready | **164** |
| Fidelity pixel-perfect | **82** |
| Fidelity tier-B-bulk | **79** |
| Fidelity unverified | **3** |
| Approved | **82** |
| **A — animated** | **7** |
| B — approved static | 31 |
| C — scroller shell | 50 |
| D — bulk | 76 |

## Tiers

| Tier | Significado |
|------|-------------|
| A-animated | Library con motion real |
| B-approved-static | Meta PP; re-QA |
| C-scroller-shell | Scroller genérico |
| D-bulk | Scaffold / vis simple |

Los tiers editoriales de este documento no sustituyen los campos de calidad. La fuente canónica de `status`, `fidelity` y `approved` es `chapters/**/config.json#_meta`; `python3 scripts/sync_quality.py --write` actualiza los inventarios derivados.

## Story en curso

| Story | Vivos | Siguiente |
|-------|-------|-----------|
| [electricity-access](../stories/electricity-access/) | **7/7 complete** | — |

## Librería

| Patrón | Graphic | Motion |
|--------|---------|--------|
| `regions-small-multiples` v0.5 | `access_electricity_regions` | opacity 1s + particles |
| `population-access` v0.2 | `access_electricity_population` | opacity 2s + stack layers |
| `progress-race` v0.3.2 | `access_electricity_progress` / `internet_progress` | square marks + yearStart/End + stems + chips + tween 2s |
| `dual-line-urban-rural` v0.3.2 | urban–rural regions / countries / **income** | hatch gap · income x-ticks no-collide · score 92.5 regions |
| `service-ladder-stack` v0.3 | `safely_managed` | Total-scope JMP stack + layer dim · water story |
| `nightlights-hexmap` v0.9 | `hexmap_nigeria` | Mapbox Standard + origin tiles (proxy) · H3 fallback |
| `nightlights-hexmap` v0.9 | `hexmap_ethiopia` | Mapbox Standard + origin tiles rural NTL + grid |

## Orden por capítulo

### 01 — Extreme Poverty (6)

| # | graphic | type | scenes | tier |
|---|---------|------|--------|------|
| 0 | `draw_your_chart` | vis | — | B-approved-static |
| 1 | `poverty_regions` | vis | — | B-approved-static |
| 2 | `poverty_scroller` | scroller | 9 | B-approved-static |
| 3 | `poverty_projections` | scroller | 4 | C-scroller-shell |
| 4 | `venn_diagram` | vis | — | B-approved-static |
| 5 | `national_poverty_comparison` | vis | — | B-approved-static |

### 02 — Global hunger (7)

| # | graphic | type | scenes | tier |
|---|---------|------|--------|------|
| 6 | `prevalence_undernourishment_regions` | scroller | 7 | C-scroller-shell |
| 7 | `prevalence_undernourishment_gridmap` | scroller | 5 | C-scroller-shell |
| 8 | `food_insecurity_hotspots` | vis | — | D-bulk |
| 9 | `food_insecurity_matrix` | vis | — | D-bulk |
| 10 | `undernourishment_conflict` | vis | — | D-bulk |
| 11 | `myanmar_foodprices_conflict` | scroller | 1 | C-scroller-shell |
| 12 | `ndvi_map_scroller` | scroller | 5 | C-scroller-shell |

### 03 — Health (10)

| # | graphic | type | scenes | tier |
|---|---------|------|--------|------|
| 13 | `uhc_chart` | vis | — | D-bulk |
| 14 | `uhc_small_multiple` | vis | — | D-bulk |
| 15 | `uhc_index_scroller` | scroller | 2 | C-scroller-shell |
| 16 | `mortality_plot` | vis | — | D-bulk |
| 17 | `mortality_region_scroller` | scroller | 3 | C-scroller-shell |
| 18 | `uhc_speed_scores_scroller` | scroller | 3 | C-scroller-shell |
| 19 | `uhc_outcomes_scroller` | scroller | 3 | C-scroller-shell |
| 20 | `rmnch_progress_scroller` | scroller | 3 | C-scroller-shell |
| 21 | `financial_hardship_chart` | vis | — | D-bulk |
| 22 | `medical_cost_chart` | vis | — | D-bulk |

### 04 — Learning and Work (7)

| # | graphic | type | scenes | tier |
|---|---------|------|--------|------|
| 23 | `schooling_regions` | vis | — | D-bulk |
| 24 | `schooling_scroller` | scroller | 5 | C-scroller-shell |
| 25 | `education_quality_details` | vis | — | D-bulk |
| 26 | `lays_change` | vis | — | D-bulk |
| 27 | `wages` | vis | — | D-bulk |
| 28 | `mincer_coefficients` | vis | — | D-bulk |
| 29 | `wage_scroller` | scroller | 4 | C-scroller-shell |

### 05 — Gender and Jobs (10)

| # | graphic | type | scenes | tier |
|---|---------|------|--------|------|
| 30 | `global_labor_force_participation` | vis | — | D-bulk |
| 31 | `sdg5_350_years` | scroller | 8 | C-scroller-shell |
| 32 | `sdg5_turkiye_lfp_drivers` | vis | — | D-bulk |
| 33 | `sdg5_turkiye_fertility` | vis | — | D-bulk |
| 34 | `sdg5_turkiye_education` | vis | — | D-bulk |
| 35 | `sdg5_better_jobs_for_women` | scroller | 4 | C-scroller-shell |
| 36 | `gender_gap_informal_gdp` | vis | — | D-bulk |
| 37 | `sdg5_wage_gap_beeswarm` | scroller | 3 | C-scroller-shell |
| 38 | `unpaid_time_animation` | scroller | 4 | C-scroller-shell |
| 39 | `sdg5_ai_occupational_exposure_by_gender` | vis | — | D-bulk |

### 06 — Water Access (11)

| # | graphic | type | scenes | tier |
|---|---------|------|--------|------|
| 40 | `safely_managed` | scroller | 3 | B-approved-static |
| 41 | `safely_managed_grouped` | scroller | 3 | B-approved-static |
| 42 | `safely_managed_country` | scroller | 3 | B-approved-static |
| 43 | `estimating` | scroller | 2 | B-approved-static |
| 44 | `limiting_factors` | scroller | 4 | B-approved-static |
| 45 | `tanzania_typical_progress` | scroller | 5 | B-approved-static |
| 46 | `ecoli_table` | vis | — | B-approved-static |
| 47 | `e_coli` | scroller | 3 | B-approved-static |
| 48 | `e_coli_urban_rural` | vis | — | B-approved-static |
| 49 | `bangladesh_arsenic_grouped` | scroller | 2 | B-approved-static |
| 50 | `arsenic_by_source` | vis | — | B-approved-static |

### 07 — Electricity Access (7)

| # | graphic | type | scenes | tier |
|---|---------|------|--------|------|
| 51 | `access_electricity_regions` | scroller | 5 | A-animated · `regions-small-multiples` |
| 52 | `access_electricity_population` | scroller | 6 | A-animated · `population-access` |
| 53 | `access_electricity_urban_rural` | vis | — | A-animated · `dual-line-urban-rural` |
| 54 | `access_electricity_progress` | scroller | 4 | A-animated · `progress-race` |
| 55 | `access_electricity_urban_rural_countries` | vis | — | A-animated · `dual-line-urban-rural` |
| 56 | `hexmap_nigeria` | scroller | 8 | A-animated · `nightlights-hexmap` |
| 57 | `hexmap_ethiopia` | scroller | 4 | A-animated · `nightlights-hexmap` |

### 08 — Economic growth (8)

| # | graphic | type | scenes | tier |
|---|---------|------|--------|------|
| 58 | `gdp_growth_global_countries` | vis | — | D-bulk |
| 59 | `gdp_growth_income_levels` | vis | — | D-bulk |
| 60 | `growth_since_90` | scroller | 4 | C-scroller-shell |
| 61 | `gdp_progress_scroller` | scroller | 5 | C-scroller-shell |
| 62 | `income_world_map` | scroller | 3 | C-scroller-shell |
| 63 | `income_classification_scroller` | scroller | 6 | C-scroller-shell |
| 64 | `unemployment_global` | scroller | 2 | C-scroller-shell |
| 65 | `neet_gdp` | scroller | 9 | C-scroller-shell |

### 09 — Internet Access (10)

| # | graphic | type | scenes | tier |
|---|---------|------|--------|------|
| 66 | `internet_access_scroller` | scroller | 3 | B-approved-static |
| 67 | `internet_access_urban_rural` | vis | — | B-approved-static |
| 68 | `income_gender_gap` | vis | — | B-approved-static |
| 69 | `internet_progress` | scroller | 2 | B-approved-static |
| 70 | `mobile_vs_fixed_broadband` | scroller | 4 | B-approved-static |
| 71 | `coverage_map` | scroller | 4 | C-scroller-shell |
| 72 | `speed_test` | vis | — | B-approved-static |
| 73 | `coverage_access_slopes` | vis | — | B-approved-static |
| 74 | `can_send_text_message` | vis | — | B-approved-static |
| 75 | `smartphone_ownership` | scroller | 2 | B-approved-static |

### 10 — Inequality (9)

| # | graphic | type | scenes | tier |
|---|---------|------|--------|------|
| 76 | `high_inequality_trend` | scroller | 2 | C-scroller-shell |
| 77 | `high_inequality_map` | vis | — | D-bulk |
| 78 | `shared_prosperity_scatter` | scroller | 4 | C-scroller-shell |
| 79 | `prosperity_gap_scroller` | scroller | 8 | C-scroller-shell |
| 80 | `prosperity_gaps` | scroller | 6 | B-approved-static |
| 81 | `prosperity_gap_trends` | scroller | 6 | C-scroller-shell |
| 82 | `income_prosperity_gap` | vis | — | D-bulk |
| 83 | `income_prosperity_gap` | vis | — | D-bulk |
| 84 | `prosperity_gap_playground` | vis | — | D-bulk |

### 11 — Urban Development (10)

| # | graphic | type | scenes | tier |
|---|---------|------|--------|------|
| 85 | `urban_rural_pop_scroller` | scroller | 5 | C-scroller-shell |
| 86 | `city_map` | scroller | 4 | C-scroller-shell |
| 87 | `urban_gdp_scatterplot` | vis | — | D-bulk |
| 88 | `skill_violin` | scroller | 5 | C-scroller-shell |
| 89 | `skill_violin_groups` | vis | — | D-bulk |
| 90 | `pay_beeswarm` | vis | — | D-bulk |
| 91 | `buildup_area_overtime` | vis | — | D-bulk |
| 92 | `slum_regions` | vis | — | D-bulk |
| 93 | `slum_waffle` | vis | — | D-bulk |
| 94 | `buildup_area_income` | vis | — | D-bulk |

### 12 — Energy sources (7)

| # | graphic | type | scenes | tier |
|---|---------|------|--------|------|
| 95 | `intro_scroller` | scroller | 6 | C-scroller-shell |
| 96 | `efficient_price_explanation` | scroller | 10 | C-scroller-shell |
| 97 | `sdg12_efficient_price_dotplot` | vis | — | D-bulk |
| 98 | `efficient_price_scroller` | vis | 3 | D-bulk |
| 99 | `intro_scroller` | scroller | 3 | C-scroller-shell |
| 100 | `sdg12_challenges_scroller` | vis | — | D-bulk |
| 101 | `ch12_reforms_scroller` | scroller | 4 | C-scroller-shell |

### 13 — Climate (8)

| # | graphic | type | scenes | tier |
|---|---------|------|--------|------|
| 102 | `sdg13_effects_of_climate_change_scroller` | scroller | 3 | C-scroller-shell |
| 103 | `sdg13_effects_of_climate_change_scroller` | scroller | 3 | C-scroller-shell |
| 104 | `sdg13_effects_of_climate_change_scroller` | scroller | 3 | C-scroller-shell |
| 105 | `sdg13_effects_of_climate_change_scroller` | scroller | 3 | C-scroller-shell |
| 106 | `sdg13_effects_of_climate_change` | vis | — | D-bulk |
| 107 | `sdg13_icon_matrix` | scroller | 4 | C-scroller-shell |
| 108 | `sdg13_regional_exposure_vuln` | vis | — | D-bulk |
| 109 | `sdg13_icon_matrix` | scroller | 4 | C-scroller-shell |

### 14 — Ocean pollution (15)

| # | graphic | type | scenes | tier |
|---|---------|------|--------|------|
| 110 | `plastic_production` | vis | — | D-bulk |
| 111 | `plastic_waste` | vis | — | D-bulk |
| 112 | `plastic_leakage` | scroller | 7 | C-scroller-shell |
| 113 | `plastic_discharge` | vis | — | D-bulk |
| 114 | `plastic_concentration` | vis | — | D-bulk |
| 115 | `north_pacific_garbage_patch` | vis | — | D-bulk |
| 116 | `fish_mortality` | vis | — | D-bulk |
| 117 | `plastic_seafood` | vis | — | D-bulk |
| 118 | `nitrogen_phosphorus` | vis | — | D-bulk |
| 119 | `phosphorus_increase` | vis | — | D-bulk |
| 120 | `nitrogen_increase` | vis | — | D-bulk |
| 121 | `chlorophyll_a_trend` | vis | — | D-bulk |
| 122 | `chlorophyll_deviation` | vis | — | D-bulk |
| 123 | `phytoplankton_blooms` | vis | — | D-bulk |
| 124 | `algal_blooms` | vis | — | D-bulk |

### 15 — Life on land (9)

| # | graphic | type | scenes | tier |
|---|---------|------|--------|------|
| 125 | `land_use` | vis | — | D-bulk |
| 126 | `arable_land_degradation` | scroller | 5 | C-scroller-shell |
| 127 | `aridity_classes` | vis | — | D-bulk |
| 128 | `aridity_difference` | vis | — | D-bulk |
| 129 | `new_drylands` | vis | — | D-bulk |
| 130 | `image` | vis | — | D-bulk |
| 131 | `aridity_biodiversity_map` | vis | — | D-bulk |
| 132 | `protected_areas` | vis | — | D-bulk |
| 133 | `image` | vis | — | D-bulk |

### 16 — Artificial Intelligence (AI) (5)

| # | graphic | type | scenes | tier |
|---|---------|------|--------|------|
| 134 | `ai_adoption` | vis | — | D-bulk |
| 135 | `affordability_barrier` | vis | — | D-bulk |
| 136 | `digital_language_divide` | vis | — | D-bulk |
| 137 | `digital_skills` | vis | — | D-bulk |
| 138 | `exposure` | scroller | 6 | C-scroller-shell |

### 17 — Data for Development (5)

| # | graphic | type | scenes | tier |
|---|---------|------|--------|------|
| 139 | `survey_age` | vis | — | B-approved-static |
| 140 | `nigeria_poverty_extrapolation` | scroller | 4 | B-approved-static |
| 141 | `missing_children_data_waffles` | scroller | 4 | B-approved-static |
| 142 | `spi_scroller` | scroller | 9 | B-approved-static |
| 143 | `spi_gdp_scatter` | vis | — | B-approved-static |

### 99 — Story Topic (3)

| # | graphic | type | scenes | tier |
|---|---------|------|--------|------|
| 144 | `basic_scatterplot` | vis | — | D-bulk |
| 145 | `poverty_projections` | scroller | 3 | C-scroller-shell |
| 146 | `basic_scatterplot_particles` | scroller | 3 | C-scroller-shell |

### dashboard — Global Progress (2)

| # | graphic | type | scenes | tier |
|---|---------|------|--------|------|
| 147 | `indicators_progress` | scroller | 6 | C-scroller-shell |
| 148 | `dashboard_scroller` | scroller | 6 | C-scroller-shell |

### id4d — ID4D (12)

| # | graphic | type | scenes | tier |
|---|---------|------|--------|------|
| 149 | `image` | vis | — | D-bulk |
| 150 | `image` | vis | — | D-bulk |
| 151 | `image` | vis | — | D-bulk |
| 152 | `image` | vis | — | D-bulk |
| 153 | `image` | vis | — | D-bulk |
| 154 | `image` | vis | — | D-bulk |
| 155 | `image` | vis | — | D-bulk |
| 156 | `image` | vis | — | D-bulk |
| 157 | `image` | vis | — | D-bulk |
| 158 | `image` | vis | — | D-bulk |
| 159 | `image` | vis | — | D-bulk |
| 160 | `image` | vis | — | D-bulk |

### progress — Measuring Progress (3)

| # | graphic | type | scenes | tier |
|---|---------|------|--------|------|
| 161 | `poverty_progress_comparison` | scroller | 3 | C-scroller-shell |
| 162 | `poverty_rate_change_scroller` | scroller | 20 | C-scroller-shell |
| 163 | `projection_country` | scroller | 4 | C-scroller-shell |

## Cómo avanzar

1. Cerrar story electricity (progress → …).
2. Cada patrón nuevo → `library/` + demo + `updateScene`.
3. Marcar A-animated en este inventario (`LIBRARY` map en el script).
4. No reabrir bulk 164 hasta 1–2 stories sólidas.

```bash
python3 scripts/build-inventory.py
```
