Extracción completa. Informe en texto plano:

================================================================
MIRROR: /Users/diazaraujo/atlas-global-development/data-for-development/index.html (SvelteKit SSR, 74 KB; `__data.json` solo trae HTML de header/footer, sin configs de gráficos)
`<title>`: The State of Development Data | Atlas of Global Development

Convenciones de esta transcripción: `**…**` = `<strong>` del original; `[NOTA i: …]` = widget de footnote inline (label "i" + `.details`); `[REF n: …]` = widget de referencia inline (`div.summary.reference`). Todo lo demás es prosa literal.

1) HERO
- Kicker (`div.subTitle`, sobre el H1): Data for Development
- H1: The State of Development Data
- Lead (p.font-display text-lg): "Without reliable data, the true extent of extreme poverty or gaps in children's health and learning outcomes remains hidden from the people tasked with fixing them. But as the World Bank's Statistical Performance Indicators (SPI) shows, low data availability is not inevitable. Some economies build strong, reliable data systems, even with limited resources."
- Byline: "May 2026, Story by **Zander Prinsloo & Brian Stacy**, Visuals by **Maarten Lambrechts**"
- Fondo: `goaltitle uses-particles bg-bg-dark-blue` con un `inview-parent-container` SIN anchor + `<svg class="absolute vis">` vacío → visual de partículas client-side (equivalente al `particles` del hero en story.json de global-progress).

2) KEY FACTS DEL HERO (bloque "**Key facts** from this story", 3 tarjetas border-l-[4px], cada una con link "Show details")
- Tarjeta 1 → #c5: "50 times" / "more ChatGPT usage occurs per internet user in high-income countries than in low-income countries."
- Tarjeta 2 → #c14: "Nearly 50%" / "of households' budget remaining after food consumption in low-income countries would be taken up by a data-only 5GB mobile package."
- Tarjeta 3 → #c39: "Less than 1 in 5" / "workers in low-income countries are highly exposed to AI."
OJO: c5, c14 y c39 NO existen como anchors en este documento (los únicos SSR son c8, c10, c17, c21, c23). Los links quedan muertos en el mirror; además el contenido de las 3 tarjetas (ChatGPT, paquete 5GB, exposición a IA) no corresponde a la narrativa de esta historia — parece ser el componente de key facts a nivel de goal/página compuesta, con gráficos de la historia hermana "digital" renderizados solo client-side. Sin réplica local.

3) SECUENCIA NARRATIVA COMPLETA (17 bloques de prosa `div.leading-relaxed`, 3 callouts, 5 gráficos — orden documental exacto)

H3 — Decisions and data
P1: "Imagine you've just been appointed Minister of Finance. Tomorrow morning, you must decide where to build schools and clinics, how much to borrow, which programs to prioritize. Every decision will affect millions of lives. To govern well, you need answers to basic questions: How fast is the economy growing? How many children are healthy? How many young people are unemployed?"

H4 — Missing data sources
P2: "The answers to each of these questions lie in national accounts, population censuses, health surveys, household surveys, labor force surveys, and other types of data. Now imagine opening your briefing folders and discovering that much of the available data are years old."
CALLOUT 1 (border-l-[7px], número grande): "In nearly" / "6 out of 10" / "low- and middle-income economies, the most recent poverty survey is more than five years old."
P3: "Every day, governments make decisions that affect millions of lives, such as setting budgets and regulating the scope and quality of services. Yet for many economies, the data guiding those decisions are years out of date, leaving millions of people invisible to policy makers."
P4: "Take data on unemployment, for instance. For the average low- and middle-income economy, the latest labor force survey is from 2019, the most recent poverty survey is from 2020, and the most recent health survey—measuring everything from child vaccinations to malnourishment and access to health care— is from 2015, more than 10 years ago. [NOTA i: The latest labor force survey is calculated as the median year for all low- and middle-income economies. An analogous approach is used for poverty, health, and other surveys.] So, most of the surveys informing our current understanding of labor markets and public health are from before the COVID-19 pandemic."
P5: "In more than 30 low- and middle-income economies, the latest labor force, health, business, agriculture, and** **poverty surveys **are more than five years old**. In another 46 economies, four out five of these surveys are more than five years old. Together, this amounts to around 60 percent of all low- and middle-income economies. So, when these economies try to make data-informed decisions, they are charting their future using an outdated picture." (el `** **` — strong con solo un espacio — y el "four out five" sin "of" son así en el original)
>>> GRÁFICO c8 — inline (NO scroller). Contexto: cierra la sección "Missing data sources", inmediatamente tras P5 (edad de las encuestas).
P6: "When survey data are missing, policy makers rely on models. But these, while useful, can miss the truth by a wide margin, as illustrated by **Nigeria's** poverty data. [NOTA i: Poverty estimates are drawn from the World Bank's Poverty and Inequality Platform (PIP). The 2018 figure (34.2 percent) and the extrapolated 2022 figure (34.8 percent) are based on Nigeria's 2018 Living Standards Survey (LSS), with the extrapolation projecting poverty forward using national accounts (gross domestic product or GDP) data. The survey-based 2022 figure (41.8 percent) was incorporated in PIP's Spring 2025 update, following the release of Nigeria's 2022 LSS. The seven percentage point gap between the extrapolated and survey-based 2022 estimates illustrates the limitations of nowcasting as a substitute for timely household survey data.] In Nigeria's case, any programs targeting households by poverty status would have missed millions of households."
>>> GRÁFICO c10 — SCROLLER (in-scroller). Contexto: justo tras P6 (Nigeria, encuesta vs extrapolación). Sin textos de escena en el SSR.

H4 — Methods matter
P7: "The timeliness of statistics is not the only issue. In many cases, the methods and data used to calculate statistics are outdated, producing misleading estimates. An example from Ghana illustrates this starkly. When it updated its national accounts framework in 2010, incorporating new industrial census data, value added tax records, and household surveys and modernizing the way it classified the services sector, **reported GDP rose by more than 60 percent**. [REF 1][REF 2] Three-quarters of that increase came from the services sector alone, which had been systematically undercounted under the old framework. But many economies continue to use old methodologies, with 52 still using a 1993 manual to report GDP statistics today."
CALLOUT 2: "Changes to the methodology and data used to produce GDP led to a" / "60 percent" / "increase in Ghana's estimated GDP in 2010."
(No hay gráfico en esta sección — solo el callout.)

H4 — Invisible children
P8: "The absence of data also severely limits an economy's ability to understand the needs of important populations, such as children, leaving policy makers unable to address the most pressing challenges they face."
CALLOUT 3: "778 million" / "children aged 5–14, or nearly half of the world's children in that age range, live in a country with no recent internationally comparable learning assessment." (el texto va en un span con color rgb(68,71,70))
>>> GRÁFICO c17 — SCROLLER (in-scroller). Contexto: entre el callout de 778 millones y P9.
P9: "Without these data, it is impossible to know how many children live in a country and whether they are healthy and learning. And without such basic information, how can a government plan where to build schools and clinics, how many teachers and health care staff to hire, or what kind of programs are needed to address nutrition or skill deficits before they become permanent? [NOTA i: Birth registration data measure the share of children under five whose births have been officially recorded with a civil authority. Stunting (low height-for-age) is the primary indicator of chronic undernutrition in children under five. Learning assessment figures refer to internationally comparable assessments conducted since 2019.]"

H3 — Measuring statistical systems
P10: "The SPI measures the performance of statistical systems across five pillars using 51 indicators that cover everything from whether surveys are conducted to whether key data are produced and used, data are accessible online, and the legal foundations and financial resources for statistics are in place. [NOTA i: The five pillars are data use, services, products, sources, and infrastructure. For data to have an impact, they must first be used. The data use pillar also measures whether data meet the needs of key users of a statistical system, such as the Minister of Finance. The data services pillar measures whether services, such as online accessibility, are available to connect users to data. The data products pillar measures whether the system produces key statistics, including those concerning the well-being of children, to meet the needs of users. The data sources pillar tracks the availability of foundational data sources, while the data infrastructure pillar assesses the hard and soft infrastructure, such as statistical legislation, financing, and the methodologies that underpin statistical production.] It includes an overall score that measures statistical performance on a scale from 0–100, where 100 represents the best possible statistical system. [REF 3]"
>>> GRÁFICO c21 — SCROLLER + fullScreen (único con `inview-parent-container fullScreen`). Contexto: tras P10 (los 5 pilares del SPI).
P11: "An economy's income tends to be correlated with the performance and maturity of its statistical system. But this relationship is not deterministic. Many economies perform at the same level as far richer economies, providing valuable insights for how to improve statistical systems in the places where it is most needed."
>>> GRÁFICO c23 — inline (NO scroller). Contexto: tras P11 (ingreso vs desempeño estadístico), antes del H3 final.

H3 — Building capacity for mature statistical systems
P12: "The information available to guide policy is often incomplete, outdated, or uneven in quality. These constraints are not distributed randomly. They tend to be most binding in low-income and FCV settings where the demands on the state are greatest and the costs of policy error are highest. It is precisely in such settings that rapid shifts in economic conditions, prices, displacement, and service delivery can quickly render old statistics misleading."
P13: "But the evidence also cautions against a deterministic view of capacity. Several countries, such as **Mexico**, **Burkina Faso**, **Senegal**, **Uzbekistan**, and the **Philippines**, achieve levels of statistical performance comparable to peers with far higher GDP per capita."
P14: "The implication is straightforward but important: while resources matter, income alone does not determine statistical effectiveness. Institutions, incentives, and sustained investments in statistical systems are critical for good performance."
P15: "For policy makers and development partners, this finding points to a need to organize improvements in statistical performance around strengthening data sources. This includes traditional instruments, such as household surveys and administrative systems, and complementary sources, such as geospatial and other high-frequency data. At the same time, modernizing methods for integrating, validating, and using these inputs is vital."
P16: "Emerging technologies, including artificial intelligence, offer genuine opportunities to reduce the costs of data collection and processing and expand data use by improving discoverability, timeliness, and dissemination. But realizing these gains will require deliberate investments in governance, skills, and quality assurance, as well as technology."
P17: "National statistical offices can rarely meet these demands in isolation. Building durable foundational and frontier statistical capacity will increasingly depend on international partnerships that support training, peer learning, and the adoption of best-practice standards. For a finance minister tasked with making decisions under uncertainty, such investments are not ancillary. Rather, they are part of the core infrastructure of effective economic management."
(Sección final sin gráfico.)

4) ABOUT THIS STORY (H2)
References (H3, lista numerada — son los mismos textos de los widgets inline REF 1–3):
1. Devarajan, S. 2013. "Africa's Statistical Tragedy" (link: onlinelibrary.wiley.com/doi/abs/10.1111/roiw.12013). Review of Income and Wealth 59: 9–15.
2. Jerven, M and Duncan, M E. 2012. "Revising GDP Estimates in Sub-Saharan Africa: Lessons from Ghana" (link: mortenjerven.com/wp-content/uploads/2013/02/ASJ15-Section1-Eng.pdf). The African Statistical Journal, 15(15):13–24.
3. Dang, H A H, Pullinger, J, Serajuddin, U and Stacy, B. 2023. "Statistical Performance Indicators and Index—A New Tool to Measure Country Statistical Capacity" (link: nature.com/articles/s41597-023-01971-0). Scientific Data 10(1): 146.

Suggested Citation: "Prinsloo, Z, Stacy, B & Lambrechts, M. 2026. "The State of Development Data" [link: https://doi.org/10.60616/ttes-8t11]. In Atlas of Global Development 2026, edited by A F Pirlea, D Wadhwa, D Mahler, U Serajuddin, M Welch, A Thudt, and M Lambrechts. Washington DC: World Bank. License: Creative Commons Attribution CC BY 3.0 IGO."

Credits — Author(s): Zander Prinsloo & Brian Stacy · Visuals: Maarten Lambrechts · Art Direction: Alice Thudt · Acknowledgements: Maria Eugenia Genoni; Alaka Holla.
Share: solo iconos SVG (sin texto extraíble).
License: "Creative Commons Attribution CC BY 3.0 IGO"
Supported by: logos SDG Fund, World Development Indicators, Data360.

5) MAPEO GRÁFICOS → CAPÍTULOS LOCALES (inventory.json, chapterTitle "Data for Development", 5 items, todos status=ready, fidelity=pixel-perfect, approved=true). El calce es inequívoco: los `translationPrefix` del inventory son `goal_17.content.#8/#10/#17/#21/#23` = anchors c8/c10/c17/c21/c23; además tipos y prosa coinciden 1:1.
- c8 → chapters/goal_17/00-survey-age (vis, small) — "Many economies rely on survey data that are more than five years old" / "Average age of latest surveys in low-and middle-income economies". Calza con P5 (edad de encuestas) y el keyFact del config repite el CALLOUT 1 ("In 60% / …poverty survey more than five years old").
- c10 → chapters/goal_17/01-nigeria-poverty-extrapolation (scroller, 4 escenas: initial_survey, extapolation, new_survey, difference) — "Nigeria's rate of extreme poverty / Survey vs extrapolation estimates". Calza con P6 y su NOTA (34.2/34.8/41.8%, brecha de 7 pp).
- c17 → chapters/goal_17/02-missing-children-data-waffles (scroller, 4 escenas: birth_registration, birth_registration_regions, stunting, learn_assess) — "Key data are missing for millions of children". Calza con CALLOUT 3 (778 millones) + P9 y su NOTA (birth registration/stunting/learning assessment).
- c21 → chapters/goal_17/03-spi-scroller (scroller, visSize=fullScreen — coincide con el único contenedor fullScreen del HTML; 9 escenas; reference: "atlas-c21-spi-scroller") — "Statistical performance varies widely across economies". Calza con P10 (5 pilares, escala 0–100).
- c23 → chapters/goal_17/04-spi-gdp-scatter (vis, default) — "Income matters, but it is not destiny". Calza con P11 y P13 (config.textParagraph nombra Mexico/Burkina Faso/Senegal/Uzbekistan/Philippines, mismos países de P13).
SIN RÉPLICA: c5, c14, c39 (key facts del hero) — no existen ni en el SSR del mirror ni en el inventory de este capítulo.

NO EXTRAÍBLE (y por qué):
- Textos de escena de los 3 scrollers: no están en el SSR (contenedores `inview-container` vacíos con spinner); se renderizan client-side. Se recuperan del inventory local (escenas transcritas arriba vía los items 01/02/03).
- Títulos/subtítulos/fuentes de los 5 gráficos: tampoco SSR; los aporta el inventory (campos title/subtitle/source por item).
- Visual de partículas del hero y los mini-charts de las key facts: client-side puro.
- Los H2 "Progress/People/Prosperity/Planet/Infrastructure/Digital" del inicio son el nav del sitio, no contenido de la historia.
- Todos los footnotes inline usan el marcador "i" (no numeración correlativa); es así en el markup.