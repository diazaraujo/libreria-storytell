# Stories — chapter scroll (concatenated Atlas chapters)

Runtime: `shared/chapter-scroll.js` + `shared/chapter-scroll.css` + `shared/particles.js`

## Electricity Access — 7/7

```
http://127.0.0.1:8787/stories/electricity-access/
```

Regions · population · progress · urban–rural · countries dual-line · hexmap NG/ET

## Internet Access — library blocks

```
http://127.0.0.1:8787/stories/internet-access/
```

1. **Access trends** scroller (world → income → regions) — `library/access-trends-scroller`  
2. **Urban–rural by income** — `library/dual-line-urban-rural` variant `income`  
3. **Progress race** 2015→2024 — `library/progress-race` (focus KHM/KGZ)

Origin: `:8765/en/atlas/internet-access/`

## Water Access — 6/11

```
http://127.0.0.1:8787/stories/water-access/
```

1. **JMP service ladder** — `library/service-ladder-stack`  
2. **Urban–rural by region** — `library/dual-line-urban-rural` (2000–2024)  
3. **Country beeswarm** — `library/value-beeswarm`  
4. **Component min bars** (Mongolia / Nepal) — `library/component-min-bars`  
5. **Limiting factors** — `library/limiting-factors-bars`  
6. **Tanzania + typical paths** — `library/component-paths`

Next water: E. coli table/scatter, urban–rural E. coli, Bangladesh arsenic.

### Scroll model

- Native document scroll (no wheel hijack)
- Scene index = `f(scroll progress)` within each sticky block
- Prefer `mount` once + `updateScene()` (story shell may remount sticky charts)
