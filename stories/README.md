# Stories — chapter scroll (concatenated Atlas chapters)

Runtime: `shared/chapter-scroll.js` + `shared/chapter-scroll.css` + `shared/particles.js`

## Electricity Access — 7/7

```
http://127.0.0.1:8787/stories/electricity-access/
```

Regions · population · progress · urban–rural · countries dual-line · hexmap NG/ET

## Internet Access — 10/10

```
http://127.0.0.1:8787/stories/internet-access/
```

1. trends · 2. urban–rural income · 3. gender gap · 4. progress race  
5. mobile/fixed · 6. coverage ranked · 7. speed · 8. coverage–use slopes  
9. can-send text · 10. smartphone ownership  

Origin: `:8765/en/atlas/internet-access/`

## Water Access — 11/11

```
http://127.0.0.1:8787/stories/water-access/
```

1. JMP ladder · 2. urban–rural dual-line · 3. country beeswarm · 4. component min bars  
5. limiting factors · 6. Tanzania paths · 7. E. coli risk table · 8. PoC vs PoU  
9. E. coli urban–rural · 10. Bangladesh arsenic groups · 11. arsenic by source

### Scroll model

- Native document scroll (no wheel hijack)
- Scene index = `f(scroll progress)` within each sticky block
- Prefer `mount` once + `updateScene()` (story shell may remount sticky charts)
