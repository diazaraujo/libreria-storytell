# Urban development suite (goal_11) — quality plan

**Story:** Atlas `/urban-development/`  
**Origin:** `http://127.0.0.1:8765/en/atlas/urban-development/`  
**Status:** quality **v2** (2026-07-20) — full 10/10 story

## Graphics

| # | Graphic | Type | Chapter | Target |
|---|---------|------|---------|--------|
| 0 | urban_rural_pop_scroller | scroller | 00 | **urban-pop-scroller** |
| 1 | city_map | **city-points-map** | 01 | keep |
| 2 | urban_gdp_scatterplot | scatter | 02 | **polished** |
| 3 | skill_violin | beeswarm by skill × U/R | 03 | done v1–v2 |
| 4 | skill_violin_groups | beeswarm by occupation | 04 | done v1–v2 |
| 5 | pay_beeswarm | urban pay premium % | 05 | done v1–v2 |
| 6 | buildup_area_overtime | dual Addis | 06 | **polished** |
| 7 | slum_regions | regional | 07 | **polished** |
| 8 | slum_waffle | dual-year people waffle | 08 | done v1–v2 |
| 9 | buildup_area_income | multi-line | 09 | hand |

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


## Checklist urban v2

- [x] SPEC + RE notes + ISCO labels (Atlas config)
- [x] `urban-pop-scroller` · `city-points-map` · skill/pay/slum libraries
- [x] GDP scatter · Addis dual · slum regions · buildup income polished
- [x] `stories/urban-development/` **10/10** quality v2
- [x] `COMPARE.md` vs origin
- [ ] Optional PNG captures in `recordings/compare/urban/`
