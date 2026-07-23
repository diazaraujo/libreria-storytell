Extracción completa. Todo verificado contra el markup SSR (los 10 anchors, la prosa exacta, footnotes, About) y contra el inventario local. Va el reporte:

ARCHIVO FUENTE: /Users/diazaraujo/atlas-global-development/gender-and-jobs/index.html
(SSR SvelteKit; `__data.json` viene con payload vacío `[null]` — no hay metadata de gráficos ahí; los gráficos son 100% client-side, contenedores vacíos con spinner + `<a name="cN">`.)

Convenciones de notación en la prosa de abajo: `[ref N]` = superíndice de referencia inline; `[note i]` = footnote "i"; `{clase:texto}` = span coloreado con esa clase CSS (female/male/cat6/NAC/LIC — colores por categoría del sistema Atlas); `**...**` = strong.

=====================================================================
1) HERO
=====================================================================
- Kicker/subtítulo de capítulo: "Gender and Jobs"
- Título (H1): "Shaping the Future of Women in the Workplace"
- Lead (P exacto): "Women face persistent barriers when it comes to participating in the labor force. And those who do work are more likely to be in vulnerable employment, earn lower wages, and shoulder the majority of domestic and care responsibilities, highlighting slow and uneven progress toward gender equality at work."
- Byline (HTML exacto): `May 2026, Story by <span class="font-semibold">Divyanshi Wadhwa & Anna Tabitha Bonfert</span>, Visuals by <span class="font-semibold">Ændra Rininsland & Maarten Lambrechts</span>`
- Fondo: contenedor `goaltitle uses-particles pb-2xl bg-bg-dark-blue mb-4xl` (mismo dark blue + partículas que global-progress). Tema del capítulo: `--theme-color: var(--wbBlue)`, `--theme-text-color: var(--wbBlueDark)` (pilar People — el nav marca el capítulo con `border-l-people`). Color concreto de partículas no extraíble del SSR (es client-side).

=====================================================================
2) KEY FACTS — EXISTEN, PERO OJO: SON DE OTRO CAPÍTULO (bug del origen)
=====================================================================
Bloque "Key facts from this story" con 3 cards (estilo: `border-l-[4px]`, fondo `color-mix(var(--theme-color) 25%)`, link "Show details" + flecha ↓):
1. "11 years" / "of schooling for the average child globally in 2024." → link #c6
2. "In 1 in 3" / "low- and lower-middle-income economies, learning-adjusted years of schooling fell between 2010 and 2025." → link #c19
3. "10%" / "Increase in earnings for each additional year of schooling globally." → link #c31

ANOMALÍA: estos tres facts son de escolaridad — pertenecen al capítulo "Learning and Work: Skills Are Used and Built on the Job", no a Gender and Jobs. Además el anchor #c6 NO existe en esta página (anchors reales: c3,c8,c16,c19,c22,c31,c34,c43,c49,c56; #c19 y #c31 sí existen pero apuntan a fertilidad de Türkiye y al scroller Suiza/Tanzania — sin relación con el texto del fact). Es contenido SSR residual del origen. Para la réplica: o se omiten, o se reemplazan por key facts propios del capítulo.

=====================================================================
3) SECUENCIA NARRATIVA COMPLETA (orden del documento)
=====================================================================

===== H3: Women's participation in the labor force

P1: "Historically, there have been many barriers to women's full participation in labor markets and jobs. Social norms have prioritized women's role in unpaid care and household responsibilities, limiting their access to income-generating work. Restricted access to finance has also prevented many women from starting their own business, while restricted access to education and skills have kept them out of available jobs.[ref 1] Such barriers have shaped women's participation in the labor force for decades, with lasting consequences for economic growth, household well-being, and gender equality."

P2: "In simple terms, the labor force includes everyone who works or is actively seeking work.[ref 2] Globally, around 8 in 10 {male:men aged 15–64} are part of the labor force.[ref 3] But what about {female:women}? Take a guess in the chart below and see how close you come to the actual share."

>>> GRÁFICO c3 — fullScreen, estático (no scroller). Contexto: el chart interactivo "adivina la línea" de participación laboral femenina. La prosa lo introduce explícitamente ("Take a guess in the chart below").

CALLOUT (blockquote con borde izq 7px, exacto): "Since 1990, women's participation in the labor force has remained largely unchanged, with **only half of women aged 15**–**64 engaged in income-generating work.**" (el guión "–" va en un span suelto con color rgb(0,0,0) entre los dos strong)

P3: "Roughly 30 percentage points lower than men, this represents a substantial gap.[ref 3]"

===== H3: Equality could still be 350 years away

P4: "There has been little progress in increasing women's participation in the labor force. And this has varied widely across countries and economies, depending on their stage of development. To put this into perspective, we use historical country-level data from 1990 to 2024 to calculate a 'typical' path of progress.[note i][ref 4]"
   [note i, con link]: "More details on the methodology can be found on <a href="https://data360.worldbank.org/en/atlas/measuring-progress">this page</a>."

>>> GRÁFICO c8 — SCROLLER (in-scroller). Contexto: el "typical path" / 350 años. Los textos de los pasos del scroller NO están en el SSR (client-side) — pero SÍ están en el inventario local (8 escenas, ver mapeo).

P5: "Despite sluggish global progress, countries like Türkiye have achieved substantial gains through targeted policy shifts that enable women's employment. Let us take a look at what has contributed to the increase in women's participation in Türkiye's labor force."

===== H3: Drivers for increasing women's labor force participation

P6: "Several factors came together to shape women's work in Türkiye, including a shift toward the industry and services sectors, a fall in the fertility rate, an increase in education levels, and a shift in social and cultural norms."

--- H4: Shift toward industry and services

P7: "From the 1990s, the Turkish economy underwent a structural transformation, shifting away from agriculture toward industry and services. Many women had worked in {female:agriculture}, especially on family farms, but as these shrank, families migrated to cities.[ref 5]"

P8: "Opportunities in urban labor markets often demanded new skills and formal training, and childcare support was limited. As is common in the early stages of industrialization, men were more likely to acquire the new skills needed, while women—faced with lower levels of education and a lack of childcare—were excluded from these opportunities. With few jobs available to them, many women withdrew from the workforce,[ref 5] and between 1990 and 2004, their labor force participation fell from 36 percent to 25 percent.[ref 3]"

P9: "As education levels rose, younger generations of women began to join the labor market in greater numbers, finding opportunities in {cat6:industry} and {NAC:services}.[ref 6]"

>>> GRÁFICO c16 — estático/inline. Contexto: sectores de empleo Türkiye por género.

--- H4: Smaller families

P10: "Social norms and family dynamics were also evolving at this time.[ref 7] Türkiye's fertility rate—the number of children born per woman—declined faster than the global average, falling to 1.5 by 2023 (compared with 2.2 globally).[ref 8] With fewer children, the childcare barrier lessened, allowing women to pursue jobs."

>>> GRÁFICO c19 — estático/inline. Contexto: tasa de fertilidad Türkiye vs mundo.

--- H4: Gains in education

P11: "Education played an equally important role: while women's participation in Türkiye's labor force has historically been lower than men's, the gap is widest among those with little or no education, and narrowest among those with tertiary degrees.[ref 9] As more women gained access to higher levels of schooling, their opportunities in the labor market expanded."

>>> GRÁFICO c22 — estático/inline. Contexto: participación laboral por nivel educativo y género en Türkiye.

P12: "Starting in the 2000s, falling fertility, rising education levels, and the gradual change in social norms, combined with economic growth, have helped create more jobs for women.[ref 7] As these changes took hold, female labor force participation began to recover, reaching 41 percent by 2024.[ref 3]"

P13: "This progress shows that narrowing the gap in labor force participation between women and men is possible within a generation when the right social and economic conditions align.[ref 1]"

===== H3: Challenges beyond joining the workforce

P14: "Simply entering the labor force does not guarantee equal opportunity.[ref 10] Social, legal, and institutional barriers limit women's access to the most productive jobs, shaping the kind of work they do, how it is valued, and how much they are paid. When women's skills are unused or underused, economies produce less than they could. In many countries, removing such barriers could increase output by 15 to 20 percent.[ref 10]"

P15: "Let's have a closer look at some of the challenges women face in the workforce—from vulnerable employment to unequal pay and juggling domestic and care work alongside paid work."

--- H4: Vulnerable employment

P16: "To explore women's vulnerability in employment, let's take a look at the labor force in two very different settings: Switzerland, one of the world's richest countries, and Tanzania, a lower-middle-income country."

P17: "Both countries' female labor force participation rates are among the world's highest, at nearly 80 percent, and their male participation rates are slightly higher, nearing 90 percent. But, the composition of the labor force differs enormously.[ref 11]"

>>> GRÁFICO c31 — SCROLLER (in-scroller). Contexto: composición del empleo Suiza vs Tanzania (pasos client-side; 4 escenas en inventario local).

P18: "Vulnerable employment includes jobs that typically lack contracts, social protection, and income security. It includes contributing family workers—who may help on a family farm with no direct pay—and self-employed workers, such as street vendors. Vulnerable and informal work are two concepts that are frequently discussed together. But while vulnerable work overlaps with informal work, the distinction matters: informal employment is about the informality of working arrangements, while vulnerable employment captures economic insecurity and exposure to risk.[ref 12]"

P19: "It is not only in Tanzania that vulnerable employment rates among women are high. In many {LIC:low-income} countries and economies, vulnerable employment rates can reach 90 percent, with {female:women} more likely than {male:men} to work in vulnerable jobs, particularly those with greater care responsibilities.[ref 13]"

>>> GRÁFICO c34 — fullScreen, estático. Contexto: empleo vulnerable por género vs nivel de ingreso.

[2 divs de párrafo VACÍOS — solo `<span style="background-color: rgb(255,255,0);"></span>`, residuo de CMS con highlight amarillo vacío. Omitir en la réplica.]

P20: "Vulnerable employment is far less common in high-income countries or economies, where higher education levels and stronger legal protections open the door to more stable jobs. Men are more likely than women to be in vulnerable employment in these countries. The drivers of this pattern are not well established. It may be that, women in high-income countries are less likely to participate in the labor market when work is vulnerable, and in some cases, measurement may classify certain self‑employed professionals (such as accountants or attorneys) as "vulnerable", which can raise men's rates without reflecting economic precarity." (sin referencia; nota: doble espacio original en "such as  accountants")

--- H4: Gender wage gap

P21: "Disadvantages for women persist in the way their work is valued. This is evident in enduring wage gaps, driven by a range of factors."

P22: "Women are often concentrated in lower-paying sectors, such as domestic work, clerical services, and contributing farmwork, while men are more likely to hold jobs in higher-paying fields like industry, technology, or formal wage employment. And, although women have made significant progress in closing education gaps,[ref 14] a combination of skills mismatches, limited access to professional networks and information, and restrictive social norms continue to channel them into lower-productivity occupations."

[1 div de párrafo VACÍO — mismo residuo de span amarillo. Omitir.]

P23: "Even within the same sector, women are less likely to occupy supervisory or leadership positions, limiting their earning potential.[ref 15]"

>>> GRÁFICO c43 — SCROLLER (in-scroller). Contexto: brecha salarial (beeswarm de wage ratio; 3 escenas en inventario local).

P24: "Although this measure has its limitations, it shows a basic average across all jobs, so it doesn't tease out pay differences within the same role. Studies indicate that women can be compensated less than men for the same job. For example, firms might offer greater incentives, sometimes in the form of higher pay, for working longer and fixed hours. This strongly disadvantages women, who often bear greater household responsibilities, and require more flexible work arrangements.[ref 16]"

P25: "Narrowing the gender wage gap benefits not only individual women and their economic well-being, but also society as a whole. On average, countries could see a 14 percent increase in wealth by closing the gap in lifetime earnings between men and women.[ref 17]"

--- H4: Unpaid domestic and care work

P26: "Employment discussions usually focus on paid work outside the household. But a substantial share of productive activity is unpaid domestic and care work carried out within households."

P27: "Domestic and care work includes cooking, cleaning, the upkeep of a dwelling, shopping, and caring for children and sick, elderly, or disabled household members.[ref 18] This vital everyday work contributes to human capital development and productivity; but it is not equally divided between women and men."

>>> GRÁFICO c49 — fullScreen + SCROLLER (in-scroller). Contexto: tiempo en trabajo pago/no-pago por género. OJO: las referencias 19 (ILO GEDI-STAT 2024) y 20 (Hochschild & Machung, The Second Shift) NO aparecen en ninguna prosa SSR — viven dentro de los pasos client-side de este scroller (por eso el texto salta de [ref 18] a [ref 21]).

P28: "Care arrangements differ across societies, but in most countries and economies with available data, women's total workload—encompassing both paid and unpaid work— exceeds that of men. A conservative estimate of the total value of care work provided by women is $11 trillion, or 9 percent of global gross domestic product.[ref 21]"

P29: "So, women are typically more time-poor than men, and this has negative implications for their well-being.[ref 22] But why is it that women shoulder a disproportionate share of unpaid work? Although reasons vary by family, they often include social attitudes and cultural traditions that dictate gendered division of labor, economic inequalities such as the gender pay gap, and a lack of social provision, such as childcare. When access to childcare services is expanded, more women can join the labor force and those who are already in employment can work more hours.[ref 23]"

===== H3: Artificial intelligence and the future of jobs

P30: "Artificial intelligence (AI) is reshaping labor markets globally, and the future of work is rapidly evolving. AI exposure can have different effects, displacing, enhancing or creating new jobs. While the full impact remains uncertain, two things are clear: AI will automate certain routine tasks, making some jobs redundant; but it will also increase demand for higher-skilled, technology-enabled roles."

P31: "This is disruptive for all workers, especially in high- and upper-middle-income countries where AI adoption is more advanced. Based on current technologies, it is estimated that over one-third of all jobs in high- and upper-middle-income countries could be affected by generative-AI technologies.[ref 24]"

P32: "And in these countries, AI-induced disruption in the workplace will be greater for women than for men. This is because women are concentrated in clerical and administrative support roles and similar occupations that face high automation risk, raising both the likelihood of job losses and the need for reskilling to transition into new opportunities. In high-income economies, nearly 10 percent of employed women work in jobs that are at the highest risk of AI-driven task automation, compared with about 3.5 percent of men.[ref 24][note i]"
   [note i, texto completo — incluye la ref 25 anidada]: "Each occupation consists of many different tasks. To understand the potential impact of AI, the ILO team assigned each of the tasks within an occupation a potential automation score from 0 to 1, with 0 indicating it is not possible and 1 indicating it was entirely possible to perform the task with generative AI. Exposure measures how much of an occupation's tasks can be done or assisted by generative AI. Task variability measures how unevenly that exposure is distributed across the tasks within the occupation (whether all tasks are similarly exposed or only some are).[ref 25]"

>>> GRÁFICO c56 — estático/inline. Contexto: exposición ocupacional a IA por género y grupo de ingreso.

P33: "The diffusion of AI-enabled technologies in the workplace can also benefit both men and women. New opportunities for high-skilled labor are rising. One study of 16 European countries found that increased exposure to AI benefits women twice as much as the overall labor force, with the largest positive impact on female employment from AI adoption seen in countries where women have made greater educational progress and already participate more in the labor market.[ref 26]"

P34: "In low-income countries, AI exposure remains limited for both men and women due to gaps in internet access and reliable electricity.[ref 27] But as digitalization deepens, existing jobs may be displaced towards jobs that require a different, and perhaps higher technical skillset. This displacement risk may be particularly faced in the services sector, and rise for both women and men unless proactive measures are taken. Women in low-income countries also have lower digital literacy and less access to digital services,[ref 28] which could prevent them from adopting AI."

===== H3: The way forward

P35: "AI is already changing the way we work. To meet shifting demand, countries at all income levels must expand their efforts to equip young people for emerging roles and reskill their existing workforce in AI-related competencies.[ref 29] But skills enhancements alone will not bring more women into the workforce. Countries must also fix discriminatory laws—especially those that affect childcare and parental leave—sustain improvements in access to quality education and training for girls and women, and bring about shifts in social norms that truly support women's work.[ref 30] It is only through these complementary legal, educational, and societal changes that more women will be prepared, and empowered, for the future of work."

(No hay gráfico después de "The way forward".)

=====================================================================
4) ABOUT THIS STORY
=====================================================================

REFERENCES (30, en orden):
1. Jayachandran, S. 2021. Social Norms as a Barrier to Women's Employment in Developing Countries. IMF Economic Review 69(3): 1–20.
2. International Labour Organization.2016. Labour force. April 14. Date accessed: February 12, 2026.
3. ILO Modelled Estimates database (ILOEST), International Labour Organization (ILO). Retrieved from World Development Indicators (SL.TLF.ACTI.FE.ZS, SL.TLF.ACTI.MA.ZS). Date accessed: January 07, 2025.
4. Mahler, D G, Serajuddin, U, Wadhwa, D and Yonzan, N. 2026. The World Is Developing at Its Slowest Pace in 75 Years. Washington DC: World Bank Group
5. Lugo, M A, Muller, M and Wai-Poi, M G. 2020. Middle East and North Africa - Women's Economic Participation in Iraq, Jordan, and Lebanon. Washington DC: World Bank Group.
6. World Bank. 2024. Streamlined Türkiye Systematic Country Diagnostic: The Path Towards High-income.
7. World Bank. 2014. Turkey's Transitions: integration, inclusion, institutions. Report No. 90509, Volume 2 – TR.
8. World Population Prospects, United Nations (UN), publisher: UN Population Division; Statistical databases and publications from national statistical offices, National statistical offices; Demographic Statistics, Eurostat (ESTAT). Retrieved from World Development Indicators (SP.DYN.TFRT.IN). Date accessed:November,10 2025.
9. ILOSTAT. Education and Mismatch Indicators (EMI) database, International Labour Organization. Date accessed: December 01, 2025.
10. Goldberg, P, Gottlieb, C, Lall, S V, Mehta, M, Peters, M and Ratan, A L. 2025. The Global Gender Distortions Index (GGDI). Washington DC: World Bank Group.
11. ILOSTAT. Modelled Estimates Database (ILOEST). International Labour Organization. Data retrieved from World Bank Gender Data Portal. Date accessed: October 19, 2025.
12. Gardner, J, Walsh, Kand Frosch, M. 2022. Engendering Informality Statistics: Gaps and Opportunities: Working Paper to Support Revision of the Standards for Statistics on Informality. Geneva: ILO. [sic "Kand"]
13. Lo Bue, M C Le, T T N, Santos Silva, M and Sen, K. 2022. Gender and Vulnerable Employment in the Developing World: Evidence from Global Microdata. World Development 159: 106010.
14. Bonfert, A and Wadhwa, D. 2024. Tracing Global Trends in Education: A Tale of Old and New Gender Gaps. Gender Data Portal, April 18. World Bank Group. Date accessed: January 12, 2026.
15. Carranza, A, Das, S, and Kotikula, A. 2019. Gender-based Employment Segregation: Understanding Causes and Policy Interventions. Jobs Working Paper 26. World Bank.
16. Goldin, C. 2014. A Grand Gender Convergence: Its Last Chapter. American Economic Review 2014, 104(4): 1091–1119.
17. Sahay, A. 2023. Closing Gender Gaps In Earnings. World Bank Group Gender Thematic Policy Notes Series: Evidence And Practice Note.
18. National statistical offices or national database and publications, United Nations (UN), note: Indicator code from the original source: SH_FPL_INFM; Indicator name from the original source: Proportion of time spent on unpaid domestic chores and care work, by sex, age and location (%). Retrieved from World Bank Gender Data Portal. sg-tim-uwrk: Proportion of time spent on unpaid domestic and care work (% of 24 hour day). Date accessed December 3, 2025.
19. International Labour Organization. 2024. The Impact of Care Responsibilities on women's labour force participation: Statistical brief (GEDI-STAT Brief).
20. Hochschild, A R and Machung, A. 1989. The Second Shift: Working Parents and the Revolution at Home. New York, NY: Viking.
21. International Labour Organization. 2018. Care Work and Care Jobs for the Future of Decent Work. Executive Summary. Report No. WCMS 633166.
22. UN Statistics Division. Minimum Set of Gender Indicators.
23. Halim, D, Perova, E and Reynolds, S. 2023. Childcare and Mothers' Labor Market Outcomes in Lower- and Middle-Income Countries. The World Bank Research Observer 38(1): 73–114.
24. Gmyrek, P, Berg, J, Kamiński, K, Konopczyński, F, Ładna, A, Nafradi, B, Rosłaniec, Kand Troszyński, M. 2025. Generative AI and Jobs: A Refined Global Index of Occupational Exposure. Geneva: International Labour Office. [sic "Kand"]
25. International Labour Organization. 2025. How might generative AI impact different occupations? ILO. Date accessed April 20, 2026.
26. Albanesi, S, Dias da Silva, A, Jimeno, J F, Lamo, A and Wabitsch, A. 2025. AI and Women's Employment in Europe. European Central Bank.
27. Demombynes, G, Langbein, J and Weber, M. 2025. The Exposure of Workers to Artificial Intelligence in Low- and Middle-Income Countries. Washington DC: World Bank.
28. Klapper, L, Singer, D, Starita, L and Norris, A. 2025. The Global Findex Database 2025: Connectivity and Financial Inclusion in the Digital Economy. Washington, DC: World Bank.
29. UNESCO, OECD and IDB. 2022. The Effects of AI on the Working Lives of Women. Paris and New York: United Nations Educational, Scientific and Cultural Organization, Organisation for Economic Co-operation and Development and Inter-American Development Bank.
30. Halim, D, O'Sullivan, M B and Sahay, A. 2023. Increasing Female Labor Force Participation. World Bank Group Gender Thematic Notes Series, Evidence and Practice Note. Washington DC: World Bank.

SUGGESTED CITATION (exacto): "Wadhwa, D., Bonfert, A.T., Rininsland, A. and Lambrechts, M. 2026. "Shaping the Future of Women in the Workplace." In Atlas of Global Development 2026, edited by A F Pirlea, D Wadhwa, D Mahler, U Serajuddin, A Thudt, and M Welch. Washington DC: World Bank. License: Creative Commons Attribution CC BY 3.0 IGO." — el título del story es link a https://doi.org/10.60616/mdwd-6c39

CREDITS: Author(s): Divyanshi Wadhwa & Anna Tabitha Bonfert · Visuals: Ændra Rininsland & Maarten Lambrechts · Art Direction: Alice Thudt · Acknowledgements: Ana Maria Munoz Boudet; Kathleen Beegle.
SHARE: sección presente, iconos client-side (vacía en SSR).
LICENSE: "Creative Commons Attribution CC BY 3.0 IGO".
SUPPORTED BY: 3 logos — SDG Fund, World Development Indicators, Data360.

=====================================================================
5) MAPEO GRÁFICOS ↔ CAPÍTULOS LOCALES (inventory: 10 items chapterId 05, todos status=ready)
=====================================================================
Calce 1:1 perfecto — 10 anchors, 10 items, mismo orden, flags fullScreen/scroller coinciden. NINGÚN gráfico sin réplica y ningún item local sobrante.

- c3 (fullScreen) → ord 0 · vis `global_labor_force_participation` · chapters/goal_05/00-global-labor-force-participation · "How has female labor force participation changed globally since 1990?" (draw-your-guess; visSize=fullScreen ✔) · tier-B-bulk
- c8 (scroller) → ord 1 · scroller `sdg5_350_years` · chapters/goal_05/01-sdg5-350-years · "Women's labor force participation is over 350 years away from equality" · 8 escenas ✔ (calza con H3 "Equality could still be 350 years away") · tier-B-bulk
- c16 (inline) → ord 2 · vis `sdg5_turkiye_lfp_drivers` · chapters/goal_05/02-sdg5-turkiye-lfp-drivers · "Türkiye's shift from agriculture to services reshaped women's work" (calza con H4 "Shift toward industry and services") · tier-B-bulk
- c19 (inline) → ord 3 · vis `sdg5_turkiye_fertility` · chapters/goal_05/03-sdg5-turkiye-fertility · "Türkiye's fertility rate fell faster than the global average" (calza con H4 "Smaller families") · tier-B-bulk
- c22 (inline) → ord 4 · vis `sdg5_turkiye_education` · chapters/goal_05/04-sdg5-turkiye-education · "The gender gap in Türkiye's labor force participation is narrowest in the highest level of education" (calza con H4 "Gains in education") · tier-B-bulk
- c31 (scroller) → ord 5 · scroller `sdg5_better_jobs_for_women` · chapters/goal_05/05-sdg5-better-jobs-for-women · "A tale of two countries: similar labor force participation, different types of employment" · 4 escenas (calza con Suiza/Tanzania) · pixel-perfect
- c34 (fullScreen) → ord 6 · vis `gender_gap_informal_gdp` · chapters/goal_05/06-gender-gap-informal-gdp · "Vulnerable employment is higher among women than men in lower-income countries and economies" (visSize=fullScreen ✔) · tier-B-bulk
- c43 (scroller) → ord 7 · scroller `sdg5_wage_gap_beeswarm` · chapters/goal_05/07-sdg5-wage-gap-beeswarm · "In most countries, men's wages are higher, on average, than women's" · 3 escenas (calza con H4 "Gender wage gap"; P24 "Although this measure has its limitations" retoma el wage ratio del scroller) · pixel-perfect
- c49 (fullScreen + scroller) → ord 8 · scroller `unpaid_time_animation` · chapters/goal_05/08-unpaid-time-animation · "Women spend more time in unpaid work and men spend more time in paid work" · 4 escenas (calza con H4 "Unpaid domestic and care work"; las refs 19/20 del About viven en estas escenas) · tier-B-bulk
- c56 (inline) → ord 9 · vis `sdg5_ai_occupational_exposure_by_gender` · chapters/goal_05/09-sdg5-ai-occupational-exposure-by-gender · "Occupational exposure to AI is highest among women in high- and upper-middle-income countries" (calza con la sección de IA) · tier-B-bulk

=====================================================================
NO EXTRAÍBLE DEL SSR (explícito)
=====================================================================
- Títulos/subtítulos/fuentes/ejes de los gráficos y textos de pasos de scroller: client-side; los contenedores solo traen spinner + anchor. `__data.json` del mirror trae `data:[null]`. Todo eso SÍ está en el inventario local (campo config de cada item).
- Color/parámetros de partículas del hero y los íconos de Share: client-side.
- 3 divs de párrafo "vacíos" en el cuerpo = residuos de CMS (`<span style="background-color: rgb(255,255,0);"></span>`); también el subtitle del item ord 1 arrastra ese mismo span residual.
- Key facts: presentes en SSR pero con contenido de otro capítulo (detallado en la sección 2).