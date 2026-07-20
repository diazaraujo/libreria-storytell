# Urban development suite (goal_11) — quality plan

**Story:** Atlas `/urban-development/`  
**Origin:** `http://127.0.0.1:8765/en/atlas/urban-development/`  
**Status:** quality v1 in progress (2026-07-20)

## Graphics

| # | Graphic | Type | Chapter | Target |
|---|---------|------|---------|--------|
| 0 | urban_rural_pop_scroller | scroller | 00 | keep hand |
| 1 | city_map | map proxy | 01 | keep |
| 2 | urban_gdp_scatterplot | scatter | 02 | keep |
| 3 | skill_violin | beeswarm by skill × U/R | 03 | **rewrite library** |
| 4 | skill_violin_groups | beeswarm by occupation | 04 | **rewrite library** |
| 5 | pay_beeswarm | urban pay premium % | 05 | **rewrite library** |
| 6 | buildup_area_overtime | multi-line | 06 | keep |
| 7 | slum_regions | regional | 07 | keep |
| 8 | slum_waffle | dual-year people waffle | 08 | **rewrite library** |
| 9 | buildup_area_income | multi-line | 09 | keep |

## Skill specialization (RE narrative)

- Value ≈ relative specialization (1 = proportional to overall employment)
- Low / medium / high skill; urban vs rural tracks
- Scenes highlight Indonesia, then skill levels

## Pay

- `value` = % by which urban hourly earnings exceed rural (can be negative)
- Beeswarm with 0 reference line

## Slum waffle

- Absolute people in slums 2018 → 2022 (+25%)
- Unit chart scaled to global totals


## Checklist urban v1

- [x] SPEC + RE notes
- [x] `library/urban-skill-swarm` + chapters 03/04
- [x] `library/urban-pay-beeswarm` + chapter 05
- [x] `library/slum-pop-waffle` + chapter 08
- [x] `stories/urban-development/` quality v1 shell
- [ ] Side-by-side captures vs `:8765/en/atlas/urban-development/`
- [ ] Deep RE of occupation labels ISCO
