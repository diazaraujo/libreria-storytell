# Plan: 6 remaining Atlas story assemblies (2026-07-21)

Pattern proven by stories/extreme-poverty and stories/global-progress:
verbatim prose from the local mirror (~/atlas-global-development/<slug>/),
chapters mounted via the shared chapter-mount shell (sequential main.js
capture, per-chapter data URL rewrite, serialized renders, scenes from
chapter configs), About section with references + suggested citation
(CC BY 3.0 IGO), story-<slug> collection registered in docs/data-catalog.json
(requires git add first), in-browser QA (zero errors/fails/overflow) before
commit to main.

Queue (chapterTitle → chapter dirs from inventory/inventory.json):
1. measuring-progress — Measuring Progress → goal_progress/* (3)
2. inequality — Inequality → goal_10/* (9; story likely uses a subset — map by prose)
3. gender-and-jobs — Gender and Jobs → goal_05/* (10; subset by prose)
4. learning-and-work — Learning and Work → goal_04/* (7; subset by prose)
5. artificial-intelligence — Artificial Intelligence (AI) → goal_16/* (5)
6. data-for-development — Data for Development → goal_17/* (5)

Per story, mark here when done:
- [x] measuring-progress (9faddd0)
- [ ] inequality
- [ ] gender-and-jobs
- [ ] learning-and-work
- [ ] artificial-intelligence
- [x] data-for-development

After all six: run full suites, rebuild dist, Antonio redeploys, update
gallery links if stories should be listed, delete this file.

## Estado 2026-07-21 (continuación)
- Hechas: extreme-poverty (911e25d), global-progress (35a6e21), measuring-progress (9faddd0).
- Extracciones verbatim listas en stories/<slug>/EXTRACTION.md para: inequality
  (9 gráficos ↔ goal_10/00..08 1:1), gender-and-jobs (10 ↔ goal_05/00..09 1:1),
  learning-and-work (7 ↔ goal_04/00..06 1:1; side facts como ch-callout),
  data-for-development (5 ↔ goal_17/00..04 1:1).
- artificial-intelligence: agente de extracción aún corriendo; su reporte se
  persiste igual (extraer del task output con el patrón usado antes).
- GOTCHA key facts: los "Key facts" SSR de los mirrors traen data de OTRAS
  stories (bug del origen) — omitirlos, salvo que calcen temáticamente.
- Ensamblaje: clonar stories/global-progress/index.html (reemplazar título,
  tag, URL origen, About con referencias del EXTRACTION.md) + story.json con
  prosa del EXTRACTION.md; scrollers con scenesFromChapter; vis sin escenas
  igual usan chapterDir. QA browser (cero errs/fails/overflow) + registrar
  story-<slug> en docs/data-catalog.json (git add antes del check) + commit.
