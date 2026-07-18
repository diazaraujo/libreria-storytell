# Stories — chapter scroll (concatenated Atlas chapters)

## Electricity Access (MVP handoff)

```
http://127.0.0.1:8787/stories/electricity-access/
```

**Flow (matches first ~70s of user video):**

1. **Regions** sticky scroller (5 scenes) — `library/regions-small-multiples` v0.5  
2. **Prose bridge** — “While progress has been remarkable…”  
3. **Population** sticky scroller (6 scenes) — `library/population-access` v0.1  

Runtime: `shared/chapter-scroll.js` + `shared/chapter-scroll.css`  
Config: `stories/electricity-access/story.json`

### Scroll model

- Native document scroll (no wheel hijack)
- Scene index = `f(scroll progress)` within each sticky block
- Charts mount once; `updateScene()` only

### Next

- progress race block  
- hexmap Nigeria / Ethiopia  
- calibrate `vhPerScene` vs `:8765/en/atlas/electricity-access/`
