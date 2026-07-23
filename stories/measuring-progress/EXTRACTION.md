Everything is extracted and corroborated. Final report:

---

# ESTRUCTURA NARRATIVA — "A New Framework for Measuring Progress" (measuring-progress)

Fuente: `/Users/diazaraujo/atlas-global-development/measuring-progress/index.html` (SvelteKit SSR; prosa completa en markup; 3 contenedores de gráfico vacíos con anchors c7/c10/c15, los tres `in-scroller`).

## 1) HERO

- **Kicker:** `Measuring Progress`
- **Título (h1):** `A New Framework for Measuring Progress`
- **Lead:** `Measuring progress in development is complex, and simple metrics often paint different pictures. This explainer introduces a measure that compares a country's progress against other countries at a similar stage of development. The approach offers a contextualized way to evaluate performance, set realistic targets, and understand the scale of development challenges.`
- **Byline (HTML):** `May 2026, Story by <span class="font-semibold">Daniel Gerszon Mahler</span>, Visuals by <span class="font-semibold">Maarten Lambrechts</span>`
- Fondo hero: mismo patrón `goaltitle uses-particles bg-bg-dark-blue` que global-progress (canvas de partículas + svg vis en el título; ese es el primer `inview-parent-container` del main, sin anchor).
- `<title>`: "A New Framework for Measuring Progress | Atlas of Global Development"; `og:url` = https://data360.worldbank.org/en/atlas/measuring-progress/

## 2) KEY FACTS ("Key facts from this story", 3 cards)

1. **In 60%** — "of low- and middle-income economies, the most recent poverty survey is more than five years old." → Show details `#c8`
2. **778 million** — "children live in an economy with no recent internationally comparable learning assessment." → Show details `#c17`
3. **34 points** — "High-income economies score 34 points higher than low-income economies on the World Bank’s Statistical Performance Indicators." → Show details `#c21`

⚠️ **Los tres anchors (#c8, #c17, #c21) NO existen en esta página** (solo hay c7, c10, c15). Verifiqué que c8, c17 y c21 sí existen como `name="cN"` en `data-for-development/index.html` (sus anchors: c8, c10, c17, c21, c23), y el texto "poverty survey is more than five years old" aparece allí. Son key facts a nivel de goal que apuntan a gráficos de la historia hermana; en este mirror son links muertos.

## 3) SECUENCIA COMPLETA (orden del documento)

Formato de párrafo ya limpio (solo p/a/strong/sup; los widgets de referencia inline convertidos a `<sup><a href="#ref-N">N</a></sup>`). **No hay callouts/blockquotes en esta historia** (0 ocurrencias de callout/quote en el HTML).

### H3: Measuring progress is not easy

`<p>Tracking progress toward development goals is crucial for countries to identify areas to prioritize and learn from their own—and other countries’— successes and failures.</p>`

`<p>India’s open defecation challenge is a good example<strong>. </strong>Lagging behind its peers and its own target for ending open defecation, in 2014 the government launched the<a href="https://swachhbharatmission.ddws.gov.in/index.php/about"> </a><a href="https://swachhbharatmission.ddws.gov.in/index.php/about">Swachh Bharat Mission</a> to build toilets and change behavior regarding sanitation practices. During the first five years, the mission built over 100 million toilets and the proportion of the population practicing open defecation fell from 33 percent to 20 percent—a 40 percent drop.<sup><a href="#ref-1">1</a></sup> Progress has since continued, and in 2024, only around 7 percent of the population practiced open defecation.</p>`
*(Nota: el `<strong>. </strong>` y el `<a>` vacío duplicado antes de "Swachh Bharat Mission" son artefactos reales del markup original; los reproduzco tal cual.)*

`<p>Cases like this illustrate how understanding a country's progress, or lack of it, can drive policy change. Although India’s achievements are impressive, how can we quantify how well it did over this time span? It is not as trivial as it may sound.</p>`

`<p>When measuring progress toward a development indicator, a common first step is to track whether a country has met a specific target, such as a Sustainable Development Goal (SDG) target. But tracking in this way overlooks that, despite making significant progress, a country can still fall short of a target.<sup><a href="#ref-2">2</a></sup><sup><a href="#ref-3">3</a></sup> In this case, despite the massive headways made by the Swachh Bharat Mission, India’s 7 percent open defecation rate of 2024 is above SDG target 6.2, which calls for an end to open defecation.</p>`

`<p>Another way of measuring progress is to compare across countries the changes they have experienced. In this case, we could compare the decline in the proportion of people practicing open defecation over five years using percent (which for India was 40 percent) or percentage points (13 percentage points, from 33 percent to 20 percent).</p>`

`<p>These two simple and frequently used measures of progress can paint very different pictures. To see this difference, let us take a look at Côte d’Ivoire and Georgia, and their recent progress in reducing extreme poverty.</p>`

**>>> GRÁFICO 1 — anchor `c7` — SCROLLER (in-scroller), no fullScreen.** Contexto: cierra la comparación CIV vs GEO en pobreza extrema con métricas simples (pp vs %).

### H3: The speed of development

`<p>It is unclear which country has made more progress because standard measures provide conflicting answers. This is because these common measures inherently favor or disadvantage specific stages of development.<sup><a href="#ref-4">4</a></sup> To accurately gauge a country's progress, we need to account for the fact that large changes are more likely during certain phases of development than others.<sup><a href="#ref-5">5</a></sup><sup><a href="#ref-6">6</a></sup> Let us take a look now at how we can apply this for extreme poverty rates.</p>`

**>>> GRÁFICO 2 — anchor `c10` — SCROLLER (in-scroller), parent con clase `fullScreen`.** Contexto: la metodología del "speed of development" aplicada a tasas de pobreza (es el corazón metodológico de la historia).

### H3: The future and setting targets beyond 2030

`<p>At the typical speed of development, going from very high poverty rates to a society free of extreme poverty can take centuries. This also applies to other domains of development.<sup><a href="#ref-7">7</a></sup> Even if countries move drastically faster than the typical speed of development—like Singapore and the Republic of Korea have done since the 1950s—transitioning from the worst-observed outcomes to some of the best easily takes 75 years.</p>`

`<p>The long road to development suggests that some SDG targets—such as complete access to services or elimination of deprivations—were plausible for some countries but virtually impossible for others, which are generations away from reaching these levels. Globally ambitious targets are harder to achieve for poorer countries, which need much faster speeds of progress to obtain the same level as countries starting from better positions. Yet perceived success and failure has been closely associated with the outcome of these targets.<sup><a href="#ref-8">8</a></sup></p>`

`<p>So, how should countries set realistic and aspirational targets? We can use the speed scores explained above to create targets at varying levels of ambition and with various comparator countries.</p>`

**>>> GRÁFICO 3 — anchor `c15` — SCROLLER (in-scroller), no fullScreen.** Contexto: targets a distintos niveles de ambición usando speed scores.

*(Sin H3 — continúa la sección de targets tras el gráfico:)*

`<p>Countries should not necessarily consider such high speeds of development for their targets. Those with less capacity to develop—for example, due to high debt levels or conflict—may prefer to choose a target based on their own, slower historical pace of progress. Others could choose to define their target by following the speed of an aspirational set of countries—say, the best performers in their region.</p>`

`<p>In many situations, historical development paths are unlikely to be appropriate; technological change may make expected future progress faster while climate change or geopolitical uncertainties may make it slower. Ultimately, target setting is a complex and multifaceted process.</p>`

### H3: Challenges when measuring progress

`<p>The method presented here and most other measures of progress face limitations that are important to consider.</p>`

`<p><strong>First, this method cannot be applied to all indicators. </strong>The speed method does not work for indicators where countries on expectation have not made historical progress, such as forest cover. For such cases, we have developed a complementary way of measuring progress that gives all countries a score from 0–100 that reflects the share of historical experiences they are outperforming.<sup><a href="#ref-7">7</a></sup> For example, a score of 80 means that a country is progressing faster than 80 percent of all the cases observed historically.</p>`

`<p><strong>Second, measuring progress is difficult when indicators change drastically from year to year, such as when measuring deaths from natural disasters</strong>. Even if a country is making fast progress on its emergency preparedness and adaptation to climate change, one rare natural disaster could suggest a lack of progress.</p>`

`<p><strong>Third, the speed method requires indicators with a large amount of data to estimate expected changes with enough accuracy. </strong>As a result, indicators that lack data over a long time period or a large set of countries will involve greater uncertainty.</p>`

`<p><strong>Finally, the speed method is limited because we do not observe all countries at all stages of development. </strong>For example, to estimate how countries typically progress at high levels of development, we can only rely on information from countries that have achieved such standards. Conversely, we do not have data at low levels of development for most of the countries that are currently highly developed.</p>`

Fin de la narrativa; no hay gráfico de cierre. Referencias usadas en el texto: 1–8, con la 7 citada dos veces (en "The future…" y en "Challenges…"). No hay notas romanas tipo `ref-i` (a diferencia de global-progress).

## 4) ABOUT THIS STORY

**References** (ol, en orden; link como [texto](url)):
1. United Nations Statistics Division, “[Global SDG Indicators Platform](https://unstats.un.org/sdgs/dataportal).” Accessed October 17, 2025.
2. Easterly, W. 2009. "[How the Millennium Development Goals are Unfair to Africa.](https://doi.org/10.1016/j.worlddev.2008.02.009)" World Development 37(1): 26–35.
3. Clemens, M A, Kenny, C J and Moss, T J. 2007. "[The Trouble with the MDGs: Confronting Expectations of Aid and Development Success](https://doi.org/10.1016/j.worlddev.2006.08.003)." World Development 35(5): 735–751.
4. Klasen S and Lange, S. 2012. “[Getting Progress Right: Measuring Progress Towards the MDGs Against Historical Trends](https://ferdi.fr/dl/df-E5M58xqoCEfrWhfSdDjo4ZGX/ferdi-p60-getting-progress-right-measuring-progress-towards-the-mdgs.pdf).” FERDi.
5. Allwine, M, Rigolini, J and López-Calva, L F. 2016. "[The Unfairness of (Poverty) Targets.](https://doi.org/10.1093/oep/gpv066)" Oxford Economic Papers 68(2): 379–397.
6. Ravallion, Martin. 2012. "[Why Don't We See Poverty Convergence?](http://dx.doi.org/10.1257/aer.102.1.504)" American Economic Review 102(1): 504–523.
7. Mahler, D G, Serajuddin, U, Wadhwa, D and Yonzan, N. 2026. [The World Is Developing at Its Slowest Pace in 75 Years.](https://doi.org/10.1596/1813-9450-11350) World Bank.
8. Waage, J, Banerji, R, Campbell, O, Chirwa, E, Collender, G, Dieltiens, V, Dorward, A, Godfrey-Faussett, P, Hanvoravongchai, P, Kingdon, G et al. 2010. "[The Millennium Development Goals: A Cross-sectoral Analysis and Principles for Goal Setting after 2015: Lancet and London International Development Centre Commission](https://www.thelancet.com/journals/lancet/article/PIIS0140673610611968/fulltext)." The Lancet 376(9745): 991–1023.

**Suggested Citation:** Mahler, D G and Lambrechts, M. 2026. “[A New Framework for Measuring Progress.](https://doi.org/10.60616/bac1-pq35)” In Atlas of Global Development 2026, edited by A F Pirlea, D Wadhwa, D Mahler, U Serajuddin, M Welch, A Thudt, and M Lambrechts. Washington DC: World Bank. License: Creative Commons Attribution CC BY 3.0 IGO.

**Credits:** Author(s): Daniel Gerszon Mahler · Visuals: Maarten Lambrechts · Art Direction: Alice Thudt · Acknowledgements: Daniel Boller, Bob Rijkers, Nishant Yonzan.
**Share:** LinkedIn + Facebook (URL de la historia). **License:** Creative Commons Attribution CC BY 3.0 IGO. **Supported by:** SDG Fund, WDI, Data360 (logos).

## 5) MAPEO gráficos ↔ capítulos locales

Inventory (`/Users/diazaraujo/libreria-storytell/inventory/inventory.json`) tiene exactamente 3 items con chapterTitle "Measuring Progress" (índices 161–163, chapterId "progress", los tres template "scroller", status "ready", fidelity tier-B-bulk, approved false). El calce es 1:1 y está corroborado doblemente: por la prosa Y porque el `translationPrefix` de cada item es `goal_progress.content.#7 / #10 / #15` — los mismos números de los anchors c7/c10/c15.

- **c7** → `chapters/goal_progress/00-poverty-progress-comparison` — graphic `poverty_progress_comparison`, "Which country made the most progress?" (Extreme poverty rate %), 3 escenas (simple / percentage_points / percentages), visSize "small". Calza con el párrafo previo "…let us take a look at Côte d’Ivoire and Georgia, and their recent progress in reducing extreme poverty" y las escenas comparan CIV vs GEO en pp vs percent — exactamente lo que el párrafo posterior retoma ("It is unclear which country has made more progress…").
- **c10** → `chapters/goal_progress/01-poverty-rate-change-scroller` — graphic `poverty_rate_change_scroller`, "The relationship between changes in poverty and levels of poverty", 20 escenas (metodología completa: nube de cambios desde 1950 → mediana → trayectoria típica → speed CIV 1.8 / GEO 2.6 → S-curve → Sierra Leone 0 / Malawi -1 → todos los países), visSize "fullScreen" — coincide con la clase `fullScreen` del contenedor en el HTML. Calza con "Let us take a look now at how we can apply this for extreme poverty rates."
- **c15** → `chapters/goal_progress/02-projection-country` — graphic `projection_country`, "Possible poverty targets for Côte d'Ivoire", 4 escenas (16.1% en 2025 → 6.3% typical speed 2050 → 2.1% speed 2x → 0.3% speed 4x), visSize "default". Calza con "We can use the speed scores explained above to create targets at varying levels of ambition…" y el párrafo posterior ("Countries should not necessarily consider such high speeds…").

Los tres dirs existen con config.json/index.html/main.js/data/meta.json.

## No extraíble del mirror

- **Textos de escenas y títulos/subtítulos/fuentes de los gráficos:** no están en el SSR (contenedores vacíos, solo spinner `tail-spin.svg`); vienen de los bundles JS. Sí están completos en el inventory local (los pegué arriba vía los items 161–163).
- **Key facts "Show details":** anchors #c8/#c17/#c21 irresolubles en esta página (son de data-for-development).
- `__data.json` local solo trae el header del sitio, nada narrativo.

Diferencias de shape vs `stories/global-progress/story.json`: esta historia tiene **key facts** (global-progress no los tiene en su story.json), **no tiene callouts**, y sus 3 gráficos son todos scrollers con capítulo local propio (patrón `type: "scroller"` + `chapterDir` + `scenesFromChapter: true`; para c10 correspondería además el tratamiento fullScreen).