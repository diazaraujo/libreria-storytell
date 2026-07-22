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
- [ ] measuring-progress
- [ ] inequality
- [ ] gender-and-jobs
- [ ] learning-and-work
- [ ] artificial-intelligence
- [ ] data-for-development

After all six: run full suites, rebuild dist, Antonio redeploys, update
gallery links if stories should be listed, delete this file.
