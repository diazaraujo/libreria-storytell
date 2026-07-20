# Plan — lo que faltaba y cierre

**Fecha:** 2026-07-20  
**Repo:** https://github.com/diazaraujo/libreria-storytell

## Estado al inicio de este cierre

| Story | Antes | Objetivo |
|-------|-------|----------|
| Electricity | **7/7** | mantener |
| Water | **11/11** | mantener |
| Internet | **3/10** | **10/10** |

## Gap real (único story incompleto)

Internet `goal_09` chapters no cableados:

1. income_gender_gap  
2. mobile_vs_fixed_broadband  
3. coverage_map (ranked proxy)  
4. speed_test  
5. coverage_access_slopes  
6. can_send_text_message  
7. smartphone_ownership  

(+ CI smoke incompleto · docs “siguiente” desactualizado)

## Ejecución (este cierre)

- [x] 7 library patterns nuevos para internet  
- [x] Story internet 10/10 + datos locales  
- [x] CI smoke: counts 7/10/11 + node --check library  
- [x] Docs / hub / progress  

## Residual (no bloquea “completo story”)

- Pixel polish frame-a-frame vs origen (electricity / water / internet)  
- Coverage map Atlas real (Mapbox) — proxy ranked bars intencional  
- Hero particles “chrome only” residual electricity  

## URLs

```
http://127.0.0.1:8787/stories/electricity-access/
http://127.0.0.1:8787/stories/internet-access/
http://127.0.0.1:8787/stories/water-access/
```
