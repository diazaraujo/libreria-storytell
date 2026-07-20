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

## Water Access — MVP 1/11

```
http://127.0.0.1:8787/stories/water-access/
```

1. **JMP service ladder** stack — `library/service-ladder-stack`

Next water: grouped income/region, country rates, limiting factors, Tanzania paths, E. coli, arsenic.

### Scroll model

- Native document scroll (no wheel hijack)
- Scene index = `f(scroll progress)` within each sticky block
- Prefer `mount` once + `updateScene()` (story shell may remount sticky charts)
