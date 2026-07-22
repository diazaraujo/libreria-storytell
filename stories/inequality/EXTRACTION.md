Extraction complete y verificada. Aquí va el reporte íntegro.

================================================================================
EXTRACCIÓN NARRATIVA — Atlas 2026 "Inequality"
Fuente: /Users/diazaraujo/atlas-global-development/inequality/index.html (SSR Svelte; 9 contenedores de gráfico vacíos con `<a name="cN">`; scroller = clase `in-scroller` en el `inview-container`)
================================================================================

1) HERO
- Kicker (subTitle): `Inequality`
- Título (h1): `Combining Income Growth with Inequality Reduction Benefits Everyone`
- Lead (p.font-display): `Most inequality measures fail to account for overall economic development. The Prosperity Gap tracks both economic progress and its distribution. Although prosperity has improved globally, many economies—particularly in Sub-Saharan Africa—have regressed in recent decades.`
- Byline (HTML exacto): `May 2026, Story by <span class="font-semibold">Jonas Helth Lønborg &amp; Nishant Yonzan</span>, Visuals by <span class="font-semibold">Maarten Lambrechts</span>`
- El SVG del hero está vacío (width/height 0) — partículas client-side, nada extraíble.

2) KEY FACTS — EXISTEN PERO SON DE OTRA HISTORIA (bug del SSR del mirror)
El hero trae bloque "Key facts from this story" con 3 cards, pero el contenido es de la historia de conectividad digital, no de inequality:
- `2.2 billion` / `people worldwide do not use the Internet` → link "Show details" a `#c6`
- `9 in 10 people` / `in Sub-Saharan Africa are not covered by a 5G network` → link a `#c34`
- `22%` / `of people in low-income countries own a smartphone` → link a `#c51`
Los anchors #c6/#c34/#c51 NO existen en esta página (los de aquí son c5,c8,c13,c23,c28,c33,c37,c40,c43). Veredicto: los key facts reales de inequality no son extraíbles de este mirror; lo capturado es data ajena renderizada por el componente compartido. No usarlos.

3) SECUENCIA COMPLETA (orden del documento)

Notación: los footnotes inline van como [ref N] (en el markup son bloques expandibles `<div><label>N</label><input id=…><div>cita</div></div>` insertados en medio del párrafo; las 17 citas coinciden 1:1 con References del footer, sección 4). Los `<span>` sin atributos alrededor de nombres de regiones son spans de color client-side (los conservo).

[P1] `A country’s growth in gross domestic product (GDP) per capita is commonly used to measure economic development. But this metric says nothing about how progress is shared among the wider population. Although it is important that the income of the poor continue to increase, it is better if their income grows as quickly—or faster than—the income of the rich. When this happens, prosperity is shared more fairly and inequality decreases.`

[P2] `Hence, it is important not only to examine growth rates, but also the distribution of benefits across the population. Traditional indicators, such as the Gini index and income growth of the poorest 40 percent, only partially capture this. The Prosperity Gap is a new measure that captures both income growth and its distribution. It importantly gives the most emphasis to income changes of the poorest in society. This story reviews the conventional measures used to assess inequality and provides an overview of the Prosperity Gap.`

=== H3: Inequality around the world ===

[P3] `High levels of inequality impedes poverty reduction and slows shared progress.` [ref 1][ref 2][ref 3] ` Inequalities today also signal differences in opportunities in early life usually stemming from factors that cannot be changed, such as gender, race, family background, or birthplace.` [ref 4][ref 5][ref 6]  (sic: "impedes")

[P4] `To that end, in line with SGD 10 to reduce inequality within and across countries, the World Bank has started tracking the<strong> number of economies with high inequality</strong>, defined as economies with a Gini index over 40.` [ref 7] ` You can find a visual explanation of how the Gini index works in the 2023 Atlas.` [ref 8] ` Of the 169 economies with data to calculate the Gini index, 72 economies had high inequality in 1995 compared to 43 in 2024. This is substantial progress.`  (sic: "SGD 10")

>>> GRÁFICO anchor=c5 — SCROLLER (in-scroller) — contexto: tendencia del número de economías con alta desigualdad 1995→2024.

[P5] `The map below uses the latest household survey to report the Gini index for each economy. Looking at the regional pattern, we see that high inequality is concentrated in <span>Latin America &amp; the Caribbean</span> and <span>Sub-Saharan Africa</span>. High inequality in Latin American economies is well known` [ref 9] `, whereas similar disparities in Sub-Saharan African economies are only beginning to receive attention.` [ref 10][ref 11]

[P6] `Sub-Saharan Africa<strong> faces high levels of both poverty and inequality</strong>.<strong> </strong>Despite this, <strong>Benin </strong>is among the economies that have managed to move from high to moderate inequality. Here, a combination of high economic growth and a stronger tax collection system has increased domestic resource mobilization, enabling an expansion of social safety net programs targeting the poorest.` [ref 12]

>>> GRÁFICO anchor=c8 — NO scroller — FULLSCREEN (clase `fullScreen` en el parent) — contexto: mapa Gini por economía, última encuesta de hogares.

[P7] `Although it is clear that the number of economies with high inequality has decreased over recent decades, this metric says little about how much the economies grew or which groups experienced progress. In extreme cases, an improvement in the Gini index could be due to the poorest experiencing proportionally smaller income losses than the wealthy, as happened in some cases during the COVID-19 pandemic. In such a case, a reduction in the Gini index would not be the result of progress towards shared prosperity.`

=== H3: Capturing progress of the poor ===

[P8] `Now, let’s take a look at a measure that focuses on the bottom end of the income distribution.`

[P9] `Comparing the growth experienced by the poorest 40 percent of the population in the economy to the average income growth of the entire population of that economy is one way to assess progress of the poor.` [ref 13] ` Progress is more equitable when income growth for the poorest 40 percent is faster than the average in the economy. In many cases, an economy’s outcome using this method aligns quite well with the changes in the Gini index.`

>>> GRÁFICO anchor=c13 — SCROLLER — contexto: scatter crecimiento del 40% más pobre vs promedio.

[P10] `So, let’s see how economies perform when we compare the growth of the poorest 40 percent with the average income growth of the entire population. Calculating growth of the poorest 40 percent also requires comparable surveys across two years. As a result, the chart only reports growth for 88 economies using data from years around 2016 and 2021. There are not enough recent comparable surveys to calculate growth for a meaningful number of economies beyond 2021.`

[P11] `A thorough evaluation of prosperity requires analyzing income levels, growth rates, and how gains are shared among the population. This is crucial for identifying vulnerable groups and designing targeted interventions. And if such interventions are to be impactful, analysis needs to be timely in order to be accurate and relevant. The measure introduced below attempts to do this.`

=== H3: The Prosperity Gap: combining inequality and progress of the poor ===

[P12] `The World Bank has introduced the <strong>Global Prosperity Gap</strong> as a key vision indicator ` [ref 14] ` for monitoring inclusive progress. This measure integrates both average income growth and advancements in equity—reflecting reductions in inequality—into a single metric, assigning the greatest emphasis to growth among the lowest-income segments of the population.`

[P13] `The <strong>Prosperity Gap</strong> is <strong>the average factor by which individuals’ incomes must be multiplied to reach a global prosperity standard</strong>. This standard is currently set at $28 per person per day, which is approximately equal to the average income of a person living in an economy that is at the threshold of high-income status.` [ref 15]

[CALLOUT 1] (div `border-l-[7px]`, patrón keyfact):
  título: `Global prosperity standard`
  cifra: `$28` + `per person per day`
  <hr>
  texto: `Approximately equivalent to the average income of a typical individual living in an economy that is graduating from middle- to high-income status.`

[P14] `The Prosperity Gap is a measure that gives higher emphasis to the level of income of the poor. Consider an individual earning $14 a day and another earning $7 a day. To reach the $28 a day standard, the first individual must <strong>double </strong>their income while the second must increase their income <strong>fourfold</strong>. Consequently, the Prosperity Gap is two for the first individual and four for the second. In other words, this measure gives the person with half the income double the emphasis.`

[P15] `We can calculate the Prosperity Gap for individuals or for any defined population group. So, the Prosperity Gap of the population can be separated to reflect the contribution of each individual. This approach lets us analyze data in more detail and tailor policy suggestions for sub-population groups, unlike the Gini index or poorest 40 percent income growth measure, which only look at groups as a whole.`

[P16] `To understand how the measure works, let’s consider two economies: Colombia and Peru.`

>>> GRÁFICO anchor=c23 — SCROLLER — contexto: explicación del Prosperity Gap con Colombia y Perú, percentiles.

[P17] `If we only consider the Gini index, we could see that Colombia (with 54) is more unequal than Peru (with 41) today. If we instead only looked at income levels, people in Colombia earn more on average ($20 per day) than people in Peru ($14 per day). <strong>The Prosperity Gap rewards higher levels of income while also imposing a “penalty” for inequality. </strong>In the case of Colombia and Peru, the negative effect of higher inequality in Colombia outweighs its higher average income – the Prosperity Gap is larger in Columbia than in Peru.`  (sic: "Columbia")

[P18] `Next, we’ll look at the Prosperity Gap of economies, regions, and the world in 2026, and consider trends to highlight changes over time. Then we will break down these trends to examine the roles that mean income and inequality play in shaping the Prosperity Gap.`

=== H3: Linking the national Prosperity Gaps to regional and global Prosperity Gaps ===

[P19] `Just like an economy’s Prosperity Gap is simply the average Prosperity Gap of everyone in the economy, the region’s or world’s Prosperity Gap is the average across everyone in the region or the world. This is important, as the global gap in prosperity can easily connect to regional, national, or individual gaps.`

>>> GRÁFICO anchor=c28 — SCROLLER — contexto: de gaps nacionales a regionales y global (squares por economía).

[P20] `Nations can learn from the <span>East Asian</span> case, where incomes grew rapidly in the past few decades, helping them reduce the Prosperity Gap considerably from close to 21 in 1981 to 2.5 today. In the next section, we will take a closer look at these trends.`

[CALLOUT 2] (mismo patrón):
  título: `Global Prosperity Gap`
  cifra: `4.5` (sin unidad)
  <hr>
  texto: `Incomes today need to increase nearly <strong>five times, </strong>on average, for everyone to reach the prosperity standard of $28 a day.`

=== H3: Tracking the Prosperity Gap over time ===

[P21] `Looking at the Prosperity Gap over time can be useful to understand the patterns of development. A reduction in the Prosperity Gap signals an improvement of welfare.`

>>> GRÁFICO anchor=c33 — SCROLLER — contexto: series de tiempo del Prosperity Gap 1981→hoy (global, regiones, países).

=== H3: The Prosperity Gap improves when average income increases, inequality decreases, or both ===

[P22] `Changes in the Prosperity Gap can be due to <strong>changes in average income, inequality, </strong>or<strong> both</strong>. To illustrate this, let’s consider scenarios where only average income changes, to a scenario where both inequality and income changes.`

[P23] `Consider a scenario where everyone earns 10 percent higher income. This raises everyone’s income equally in relative terms, hence, relative inequality stays unchanged. For example, say person A had an initial income of $10 and person B, $20. With a 10 percent increase, A earns $11 and B earns $22. The initial ratio of income between A and B ($20/$10 = 2) remains the same even after the increase ($22/$11 = 2). Since inequality is unchanged, all the change in the Prosperity Gap in that economy is due to the change in average income alone.`

>>> GRÁFICO anchor=c37 — NO scroller, no fullscreen — contexto: escenario +10% de ingreso (cambio relativo).

[P24] `Next, consider what happens to the Prosperity Gap if every person’s income increases by $10 instead of 10 percent. This raises everyone’s income, including the average national income, by $10. The difference here is that the $10 increase is a relatively larger increase for those with lower incomes and a relatively smaller increase for those with higher incomes.`

[P25] `Consider again the same example, with person A earning an initial income of $10 and person B, $20. With a $10 increase, A now earns $20 and B earns $30. This means that the initial ratio of income for A and B ($20/$10 = 2) has now been reduced ($30/$20 = 1.5). With the $10 increase in income, the difference in income between the two individuals has narrowed. In this case, any change in the Prosperity Gap of the economy is due to the change in both average income and inequality.`

>>> GRÁFICO anchor=c40 — NO scroller — contexto: escenario +$10 de ingreso (cambio absoluto).

=== H3: Find out what happens to the Prosperity Gap for any country ===

[P26] `The chart below shows how much a change in income can affect an economy’s Prosperity Gap. There are two ways to change income: (a) the dollar amount (absolute change), and (b) a percent amount (relative change). Selecting only the dollar amount (changing absolute income) will not change inequality, but selecting the percent amount (changing relative income) will change both inequality and average income. Type in the name of any economy and adjust the absolute and relative income sliders below to see changes in their Prosperity Gaps.`

>>> GRÁFICO anchor=c43 — NO scroller — contexto: playground interactivo (buscador de economía + sliders absoluto/relativo).

=== H3: What about the future? ===

[P27] `The world has made a lot of progress in the last 40 years. The Prosperity Gap has fallen by more than half. A large part of this progress is due to people’s incomes in large populous economies in Asia catching up to their counterparts in richer economies.` [ref 16] ` But there is still a long way to go. Worldwide, people need to increase their incomes by nearly five times, on average, to reach the prosperity standard of a typical person in an economy moving into high-income status.`

[P28] `Prosperity Gaps vary by region. In <span>East Asia &amp; Pacific</span>, which had the highest Prosperity Gap (21) in 1981, incomes today need to grow close to three times, on average, to reach the global prosperity standard. In <span>Sub-Saharan Africa</span>, on the other hand, incomes must increase at least 11 times to reach the same standard, placing the region at the level equivalent to the global gap in the 1980s. Most of the global progress has come from high income growth in populous Asian economies, although reduced inequality has made a significant contribution.` [ref 17]

[P29] `To further close the prosperity gaps, high income growth is a prerequisite, not just for economies in Sub-Saharan, but also for those in <span>South Asia</span> and the <span>Middle East, North Africa, Afghanistan &amp; Pakistan</span>. In some regions, particularly <span>Sub-Saharan Africa</span> and <span>Latin America &amp; the Caribbean</span>, ongoing high levels of inequality require continued attention to improve prosperity.`  (sic: "Sub-Saharan," sin "Africa"; fin de la historia, sin párrafo de cierre adicional)

4) ABOUT THIS STORY (footer)

References (17, ol ordenada; texto exacto + URL):
1. Bourguignon, F. 2003. "The Growth Elasticity of Poverty Reduction: Explaining Heterogeneity across Countries and Time Periods." In Inequality and Growth: Theory and Policy Implications, edited by T S Eicher and S J Turnovsky. Cambridge: MIT Press. — https://doi.org/10.7551/mitpress/3750.003.0004
2. Bergstrom, K. 2022. "The Role of Income Inequality for Poverty Reduction." The World Bank Economic Review 36(3): 583–604. — https://doi.org/10.1093/wber/lhab026
3. Lakner, C, Gerszon Mahler, D, Negre, M and Prydz, E B. 2022. "How Much Does Reducing Inequality Matter for Global Poverty?" The Journal of Economic Inequality 20(3): 559–85. — https://doi.org/10.1007/s10888-021-09510-w
4. Brunori, P, Ferreira, F H G and Peragine, V. 2013. "Inequality of Opportunity, Income Inequality, and Economic Mobility: Some International Comparisons." In Getting Development Right…, edited by E Paus, 85–115. New York: Palgrave Macmillan. — https://doi.org/10.1057/9781137333117_5
5. Chetty, R, Grusky, D, Hell, M, Hendren, N, Manduca, R and Narang, J. 2017. "The Fading American Dream: Trends in Absolute Income Mobility Since 1940." Science 356(6336): 398–406. — https://doi.org/10.1126/science.aal4617
6. Corak, M. 2013. "Income Inequality, Equality of Opportunity, and Intergenerational Mobility." Journal of Economic Perspectives 27(3): 79–102. — https://doi.org/10.1257/jep.27.3.79
7. Haddad, C N ⓡ Mahler, D G ⓡ Diaz-Bonilla, C ⓡ Hill, R ⓡ Lakner, C ⓡ Lara Ibarra, G. 2024. "The World Bank's New Inequality Indicator: The Number of Countries with High Inequality (English)." Policy Research Working Paper 10796, Washington DC: World Bank. — https://documents.worldbank.org/en/publication/documents-reports/documentdetail/099549506102441825/IDU1bd155bac16d78143af188331f87564a9d6c8
8. Mahler, Daniel Gerszon, and Dominikus Baur. 2023. "Progress and setbacks in reducing income inequalities" In Atlas of Sustainable Development Goals 2023, edited by A. F. Pirlea, U. Serajuddin, A. Thudt, D. Wadhwa, and M. Welch. Washington, DC: World Bank. License: CC BY 3.0 IGO. — https://www.doi.org/10.60616/97pn-6m86
9. Alvaredo, F, Bourguignon, F, Ferreira, F H G and Lustig, N. 2023. "Seventy-five Years of Measuring Income Inequality in Latin America." IDB Publications [preprint]. — https://doi.org/10.18235/0005211
10. David, A, Leibbrandt, M, Ranchhod, V, Yasser, R, editors. 2025. "Inequalities in Sub-Saharan Africa: Multidimensional Perspectives and Future Challenges." © World Bank. License: CC BY 3.0 IGO. — https://doi.org/10.1596/978-1-4648-2150-9 y http://hdl.handle.net/10986/42457
11. "Sinha, Nistha; Inchauste, Gabriela; Narayan, Ambar, editors. 2024. Leveling the Playing Field: Addressing Structural Inequalities to Accelerate Poverty Reduction in Africa. © World Bank. License: CC BY 3.0 IGO." — http://hdl.handle.net/10986/42458 (el href trae un espacio final, sic)
12. World Bank. 2025. Perspectives économiques du Bénin: Accroître la mobilisation des recettes intérieures tout en protégeant les pauvres. Washington DC: World Bank. — https://documents1.worldbank.org/curated/en/099071425082573022/pdf/P507241-7679d9db-22e2-4f6d-b127-3a14999da431.pdf
13. World Bank. 2015. A Measured Approach to Ending — https://www.worldbank.org/en/research/publication/a-measured-approach-to-ending-poverty-and-boosting-shared-prosperity (cita truncada en la fuente, sic: falta "…Poverty and Boosting Shared Prosperity")
14. World Bank Group Scorecard (accessed March 11, 2026). — https://scorecard.worldbank.org/en/vision?orgCode=ALL&refareatype=REGION&refareacode=ACW&age=_T&disability=_T&sex=_T
15. Kraay, A ⓡ Lakner, C ⓡ Özler, B ⓡ Decerf, B ⓡ Jolliffe, D ⓡ Sterck, O ⓡ Yonzan, N. 2023. "A New Distribution Sensitive Index for Measuring Welfare, Poverty, and Inequality." Policy Research Working Paper 10470. Washington DC: World Bank. — http://hdl.handle.net/10986/39913
16. Garcia Rojas, D C ⓡ Yonzan, N ⓡ Lakner, C. 2025. "Global Inequality and Economic Growth: The Three Decades before Covid-19 and Three Decades After." Policy Research Working Paper; 11093. Washington DC: World Bank. — https://openknowledge.worldbank.org/entities/publication/2683322d-068d-4300-b0dc-532ca49c8c13
17. World Bank. 2024. "Poverty, Prosperity, and Planet Report 2024: Pathways Out of the Polycrisis." Washington DC.: World Bank. — http://hdl.handle.net/10986/42211

Suggested Citation (exacta):
`Lønborg, J H, Lambrechts, M & Yonzan, N. 2026. "Combining income growth with inequality reduction benefits everyone." In Atlas of Global Development 2026, edited by A F Pirlea, D Wadhwa, D Mahler, U Serajuddin, M Welch, A Thudt, and M Lambrechts. Washington DC: World Bank. License: Creative Commons Attribution CC BY 3.0 IGO.` — el título de la historia lleva link a https://doi.org/10.60616/76hj-ty07

Credits:
- Author(s): Jonas Helth Lønborg & Nishant Yonzan
- Visuals: Maarten Lambrechts
- Art Direction: Alice Thudt
- Acknowledgements: Aart Kraay, Miki Khanh Doan, Maria Eugenia Genoni, Christoph Lakner
- Share: LinkedIn y Facebook (URL canónica https://data360.worldbank.org/en/atlas/inequality/)
- License: `Creative Commons Attribution CC BY 3.0 IGO`
- Supported by: SDG Fund, World Development Indicators, Data360 (logos)

5) MAPEO GRÁFICOS ↔ CAPÍTULOS LOCALES (inventory.json, chapterTitle "Inequality", 9 items)

Calce 1:1, mismo orden, sin huérfanos en ningún lado:

- c5 (scroller) → chapters/goal_10/00-high-inequality-trend — scroller "high_inequality_trend", 2 escenas (72→43 economías Gini>40; coincide con P4). visSize small; el mirror no lo marca fullscreen. Coincide.
- c8 (NO scroller, fullScreen) → chapters/goal_10/01-high-inequality-map — vis "high_inequality_map", visSize fullScreen. Coincide con P5 ("The map below…"). Coincide exacto (ambos fullscreen, ambos no-scroller).
- c13 (scroller) → chapters/goal_10/02-shared-prosperity-scatter — scroller 4 escenas (poorest 40 vs average, Bolivia/Brazil/Mexico; coincide con P9-P10, "88 economies… 2016 and 2021").
- c23 (scroller) → chapters/goal_10/03-prosperity-gap-scroller — scroller 8 escenas (Peru/Colombia percentiles, $28, bricks; coincide con P16 "let's consider two economies: Colombia and Peru").
- c28 (scroller) → chapters/goal_10/04-prosperity-gaps — scroller 6 escenas (nacional→regional→global, squares; coincide con P19). Fidelity pixel-perfect.
- c33 (scroller) → chapters/goal_10/05-prosperity-gap-trends — scroller 6 escenas (13→<5 desde 1981, Ethiopia, Mozambique; coincide con P21 "over time").
- c37 (NO scroller) → chapters/goal_10/06-income-prosperity-gap — vis "Raise everyone's income by 10 percent" (coincide con P23, escenario +10%).
- c40 (NO scroller) → chapters/goal_10/07-income-prosperity-gap-2 — vis "Raise everyone's income by $10" (coincide con P24-P25, escenario +$10). Mismo graphic id "income_prosperity_gap" en ambos.
- c43 (NO scroller) → chapters/goal_10/08-prosperity-gap-playground — vis "prosperity_gap_playground" (coincide con P26: buscador + sliders).

Discrepancia menor de dato: el inventario (escena 0 de 05-prosperity-gap-trends) dice gap global "over 13 in 1981"; la prosa del mirror (P20/P28) da 21 en 1981 para East Asia (no global) y callout global 4.5 hoy — no es conflicto, son series distintas.

Notas de extracción:
- No extraíble: contenido de los 9 gráficos (client-side; los `div.loading` están vacíos), el visual del hero (SVG 0x0) y los key facts reales de la historia (los del SSR son de la historia digital, links rotos #c6/#c34/#c51).
- `__data.json` solo contiene el header del sitio; sin metadata de charts.
- Erratas presentes en la fuente y conservadas: "impedes", "SGD 10", "Columbia", "economies in Sub-Saharan,", ref 13 truncada.

Archivos: mirror /Users/diazaraujo/atlas-global-development/inequality/index.html; referencia /Users/diazaraujo/libreria-storytell/stories/global-progress/story.json; inventario /Users/diazaraujo/libreria-storytell/inventory/inventory.json; capítulos /Users/diazaraujo/libreria-storytell/chapters/goal_10/00…08.