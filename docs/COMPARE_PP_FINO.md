# Pixel-perfect fine pass — mobile chart heights

**Date:** 2026-07-20  
**Captures:** `recordings/compare/pp-fino/`

## Metrics (after)

| Story | Desk chart H | Phone chart H | Phone note H | Grid phone |
|-------|--------------|---------------|--------------|------------|
| water | **560** | **596** | 106 | 1-col |
| electricity | **560** | **614** | 88 | 1-col |
| internet | **560** | **647** | 88 | 1-col |

### Before (pass 3)
| Story | Desk | Phone chart |
|-------|------|-------------|
| water | 520 | 420 |
| electricity | 520 | 440 |
| internet | 480 | 400 |

Phone chart height **+40–60%** · desk chart max **560**.

## Changes
1. `AtlasChapterScroll.fitChartHeight()` — responsive min/max, uses sticky box
2. Sticky flex fill · chart `flex:1` · CSS vars `--ch-chart-min-h` / `max-h`
3. Phone note capped **16–18dvh** so viz wins vertical space
4. Service ladder: **full timeline** + layer dim (no zero-width year strip)

## Residual (micro)
- Origin note typography scale on phone
- Mapbox globe vs flat style (Atlas may use different basemap)
