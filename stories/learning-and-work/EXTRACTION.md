Extracción completa. Reporte en texto plano:

================================================================
ATLAS 2026 — "LEARNING AND WORK" · ESTRUCTURA NARRATIVA COMPLETA
Fuente: /Users/diazaraujo/atlas-global-development/learning-and-work/index.html (SSR SvelteKit; prosa en markup; gráficos client-side con spinner "loading" + anchor `<a name="cN">`; `__data.json` solo trae el header global del sitio, sin data de historia)
================================================================

1) HERO
- Kicker (subTitle): "Learning and Work"
- H1: "Skills Are Used and Built on the Job"
- Lead (p.font-display text-lg): "Education is one of the most powerful drivers of growth and poverty reduction. Each year of schooling that a worker attains improves productivity and wages. But learning does not end at school; workers acquire a significant share of their skills through on-the-job learning."
- Byline: "May 2026, Story by **Brian Stacy**, Visuals by **Christian Laesser**" (nombres en span.font-semibold)
- Fondo: `bg-bg-dark-blue` (var --bgDarkBlue), min-height 100vh−66px, clase "uses-particles" (partículas client-side, no hay config SSR de color/count en el HTML — no extraíble del mirror).

2) KEY FACTS (widget del hero: "Key facts from this story")
OJO — ARTEFACTO DEL MIRROR: las 3 cards SSR traen facts de POBREZA, no de esta historia, y sus links apuntan a anchors que no existen en esta página (#c7, #c17):
- Card 1: "10%" / "of people worldwide live in extreme poverty today, compared to 60% in 1950" → #c7
- Card 2: "43 countries" / "with high poverty are making little progress or reversing past gains" → #c9
- Card 3: "600 million" / "more people will live in extreme poverty in 2050 if countries' current trajectories continue" → #c17
Es el payload SSR de la historia de pobreza (goal_01); en producción se hidrata client-side. Los key facts propios de esta historia sí existen en el inventario local como config.keyFact: "11 years" (schooling_regions), "In 1 in 3" (lays_change), "10%" (mincer_coefficients).

3) SECUENCIA COMPLETA (orden exacto del DOM; P1–P24 = párrafos EXACTOS de abajo; [n] = footnote sup con tooltip que contiene la cita completa; los "side facts" son bloques laterales con intro en p.font-display.font-bold + número grande + caption)

H3 "Education and work"
  P1
  SIDE FACT A: (sin intro) "2/3rds" / "of the differences in income between high-income and low- and middle-income countries can be accounted for by human capital"
  P2
H3 "Learning at school"
  P3
  ► GRÁFICO c6 (contenedor inview, estático) — contexto: entre P3 (define expected years of schooling) y P4 → chart de expected years of schooling por región
  P4
  P5
  ► GRÁFICO c9 (contenedor inview-container in-scroller = SCROLLER) — tras P5 (dataset Barro-Lee, 1870→hoy) → scroller de average years of schooling en el tiempo. Los textos de steps NO están en el SSR (client-side); sí están en la réplica local (5 escenas).
  P6
  SIDE FACT B: "In 2000, a child in a low-income country had around a" / "50 %" / "chance of completing secondary school. By 2020, this had risen to 70%."
H3 "Learning quality"
  P7
  ► GRÁFICO c14 (estático) — tras P7 (ajuste por aprendizaje) → barras expected vs learning-adjusted years por país
  P8 (spans coloreados: high-income countries=HIC, low-income countries=LIC, lower-middle=LMC, upper-middle=UMC)
  P9
  SIDE FACT C: "Learning-adjusted years of schooling have decreased in around" / "1/3 rd" / "of low or lower-middle income countries with data since 2010."
  P10 (span coloreado: Sub-Saharan Africa=SSF)
  ► GRÁFICO c19 (estático) — cierra la sección, tras P10 (37 países, 13 con caídas) → scatter LAYS 2010 vs 2025
H3 "How does schooling impact jobs?"
  P11
  P12 (footnote [i] nº1)
  SIDE FACT D: "Women who go to college are" / "16 percentage points" / "more likely to work than those with less than a primary education"
  P13 (span: Brazil=LCN)
  P14 (spans: Georgia=ECS, India=SAS, Philippines=EAS, South Africa=SSF)
  ► GRÁFICO c26 (estático) — tras P14 (wage premiums Brazil/Georgia/India/Philippines/South Africa) → barras de wage premium por nivel educativo
  P15
  SIDE FACT E: "Each additional year of schooling boosts earnings by about" / "10 %" / (sin caption)
  P16 (footnote [i] nº2)
  ► GRÁFICO c31 (estático) — cierra la sección, tras P16 → scatter retornos Mincer vs GDP per capita. (Tras c31 hay un div de prosa VACÍO en el markup.)
H3 "How do jobs impact learning?"
  P17
  P18
  SIDE FACT F: "Each year of experience makes workers around" / "2.5 %" / "more productive, on average."
H3 "Learning on the job"
  P19
  ► GRÁFICO c39 (in-scroller = SCROLLER) — tras P19 (labor force surveys, wages por cohortes) → scroller de perfiles salariales por experiencia (India/Brazil). Steps no-SSR; 4 escenas en réplica local.
  P20
  P21
  SIDE FACT G: (sin intro) "70 %" / "of workers in low- and middle-income countries are farmers, self-employed, or wage workers in microfirms and have less access to skills improvement."
H3 "The path forward"
  P22, P23, P24 (sin gráficos)

No hay blockquotes/callouts tipo ch-callout en esta historia; el equivalente son los 7 side facts.

PÁRRAFOS EXACTOS (P1–P24):

P1: "Education can drive growth and reduce poverty. In economics, human capital refers to the knowledge, skills, health, and capabilities that people accumulate over their lives, which enable them to be productive contributors to the economy. Human capital increases people's wages, employment prospects, and adaptability throughout their career. Around 2/3rds of the difference in income between high-income and low-and middle-income countries can be accounted for by differences in human capital.[1][2][3] And roughly 1/3rd of the improvements in extreme poverty since 1980 can be traced to an increase in the number of years of schooling.[4]"

P2: "Schools build foundational skills that people will use in their career or work. But this is only part of the story. People learn at least 25 percent of the skills they use in their careers at work through on-the-job learning.[1][5][6] Here, we look at the learning that takes place, or does not take place, in the classroom and the learning that continues in the workplace."

P3: "While we often measure an economy's wealth by its natural resources or industries, one of the most valuable assets is its human capital. Education typically makes up a significant share of a person's human capital. Expected years of schooling is a measure of the number of years of schooling a child starting school today is likely to receive by the time they turn 18."

P4: "Measuring how many years a child will spend in school is vital for planning the future. But to understand the economy today, we must look at the average years of schooling for today's adults (aged 25–64). This represents a country's current stock of human capital—the collective skills and knowledge of its existing workforce and the adult population that will be building the human capital of the next generation."

P5: "The average number of years of schooling has expanded dramatically. The Barro-Lee dataset combines national census and survey records to estimate average years of schooling for adults over time.[7] This harmonized data across nearly 150 countries and multiple decades creates a consistent picture of educational attainment from 1870 to today, making it possible to track long-run trends that show how countries have expanded schooling and converged (or diverged) in educational outcomes over the past century."

P6: "These changes have been driven by improvements in enrollment rates, most notably for primary school, but also for secondary school. In 2000, a child in a low-income country had only a 50 percent chance of being enrolled in secondary school, with girls being around 5 percentage points less likely to be enrolled than boys. By 2020, the odds had risen to 70 percent. The closing of gender gaps in educational attainment is a significant factor in this improvement."

P7: "The quantity of schooling alone is not the full story. Students in high-income countries tend to learn more per year of schooling than those in poorer countries. So, if we adjust for learning, the gaps are even larger. Improving education quality could therefore unlock even greater gains."

P8: "This gap is visible across the entire income distribution. In high-income countries, a child born today can expect about 12.2 years of schooling, which translates into roughly 9.5 learning-adjusted years. In low-income countries, expected years of schooling are just over 7 years, but this amounts to just 3.7 learning-adjusted years. Middle-income countries sit between these extremes, with just over 9.7 years (and around 5.7 learning-adjusted years) of schooling in lower-middle-income countries and over 11.5 years (and 7.8 learning-adjusted years) in upper-middle-income countries."

P9: "One reason learning quality is lower in poorer countries is that it partly reflects what children bring from home. Children whose mothers have completed secondary education are dramatically more likely to have adequate nutrition and mathematics proficiency than those whose mothers have little schooling, and these gaps remain virtually constant throughout childhood and adolescence, even after children begin attending school.[5] Improving learning quality in schools and improving the home environments of children can be complementary. It also means that the returns to girls' education compound across generations, as educating mothers today raises the human capital of children tomorrow."

P10: "A concerning trend is that learning has been declining in many low- and lower-middle-income countries, especially in Sub-Saharan Africa.[5] In some cases, this declining trend in learning is cancelling out the increase in years of schooling that have taken place in recent years, with learning-adjusted years of schooling falling. Out of 37 low- or lower-middle-income countries with internationally comparable data in both 2010 and 2025, 13 of these countries saw declines in learning-adjusted years of school, despite an overall trend of rising enrollment."

P11: "Few economic policies consistently yield double-digit returns at scale. But education is one that can, with each year of schooling improving earnings by around 10 percent.[8] Each year of education also increases the likelihood of employment and improves the quality of job that an individual is likely to have."

P12: "In low- and middle-income countries, men with college education are about 5 percentage points more likely to work than those with little schooling. The gap is even larger for women, at 16 percentage points.[i] Wage workers typically have 2.5 more years of schooling than the self-employed, and wage jobs tend to deliver more earnings growth over time.[9] But even among workers with similar levels of education, the self-employed in low- and middle-income countries tend to earn less than their counterparts in wage employment, suggesting that the type of job matters for earnings, not just the schooling a worker brings to it.[5]"

P13: "These gaps in educational attainment and job quality do not arise at random. Where a child grows up shapes their access to schools, health services, and social or environmental conditions. In Brazil, children from low-income families who grew up in wealthier neighborhoods completed 2.3 more years of schooling compared to similarly low-income children who grew up in poorer neighborhoods.[5]"

P14: "The payoff to education shows clearly in wages across countries. In Brazil, workers with secondary education earn nearly twice as much as those who do not complete primary school. With a university degree, the premium rises to 167 percent. Similar patterns hold in Georgia, India, the Philippines, and South Africa."

P15: "The earnings boost from an extra year of schooling varies widely across countries, reflecting differences in school quality, labor markets, demand for skills, and measurement, but the returns are consistently positive. There is no strong link between a country's income level and the return to education, and high returns to education can be found in both high-and low-income countries. On average across countries, each additional year of schooling raises earnings by close to 10 percent."

P16: "These returns easily outweigh the modest costs of schooling in many countries. In Sub-Saharan Africa, public spending averages about $283 per child per year of schooling.[10] If one additional year of education raises earnings by ten percent, applied to average annual earnings of $1,727, the lifetime gains are substantial. Over a 40-year career, and discounting future earnings at five percent, this translates into roughly $3,000 in additional lifetime income.[i] In other words, a single year of schooling delivers returns on the order of ten times its upfront cost. This does not even account for the broader fiscal benefits of education, including higher tax revenues, reduced crime, and lower dependence on social assistance.[11]"

P17: "Learning in formal classroom settings is a critical driver of human capital accumulation. But the classroom is not the only place where people learn. Learning also happens in the workplace."

P18: "Each year of work experience increases productivity by around 2.5 percent per year, and individuals tend to spend more time working than in schooling. Globally, the average person has around nine years of education, while careers often span 40 years or more. Because of differences in workplace learning, workers in high-income countries earn another 1/3rd more, on average, than those in low- and middle-income countries.[1][5]"

P19: "Labor force surveys allow us to go beyond simple averages to understand how earnings evolve with age and experience. In competitive labor markets, an increase in productivity directly translates into an increase in wages, so changes in wages can be interpreted as a measure of skills gained on the job. By breaking down wages across cohorts, we can observe not just how schooling raises earnings, but how learning continues in the workplace over the course of a career. This shows how education and experience interact to shape lifetime earnings trajectories."

P20: "These differences over time arise from two advantages conferred by education: higher entry-level wages and steeper experiential wage growth for more educated workers. Thus experience appears to amplify (rather than narrow) education-based disparities over the lifecycle."

P21: "Why does this happen? In many cases, people with lower levels of education work in jobs where little to no learning takes place. In low- and lower-middle-income countries, around 69 percent of workers are self-employed. And these workers tend to accumulate around half as much human capital as workers in wage employment.[5] At the same time, workers in sectors with lower exposure to technology, such as agriculture, and those employed in domestic or manual occupations or micro firms also accumulate less human capital. This is because there is less opportunity to learn from peers or managers and less access to explicit workplace training. Occupational choice is closely tied to education levels, and as a result, gaps in earnings between highly and lesser educated workers tend to expand over time."

P22: "Education is one of the key drivers of economic growth and poverty reduction. While we learn a substantial portion of what we know at school, learning occurs in other settings. It begins even earlier in the home, where nutrition, early stimulation, and parental engagement shape the foundations of a child's cognitive and social-emotional development.[5] And learning continues throughout the working life, with on-the-job learning delivering at least 25 percent of the human capital workers acquire during their careers."

P23: "There have been considerable improvements in average educational attainment over the past century, which rose from around 1 to close to 9 years of schooling. This progress has substantially increased earnings over time. But completion rates still need to improve, particularly for secondary and tertiary education. And while there has been some progress on increasing completion rates, there is still much to do to improve the quality of education. Critically, gaps in learning quality often reflect gaps in the home and the neighborhood: children whose mothers have little schooling, or who grow up in disadvantaged neighborhoods with poorly resourced local schools, arrive in the classroom already behind. Those gaps tend to persist throughout childhood even after years of schooling.[5]"

P24: "Investing in skills, by expanding access to education and improving learning quality and fostering skill formation at work, is essential for broad-based growth. Today, many workers, particularly the least educated, are trapped in jobs with little opportunity to learn or advance: more than two-thirds of workers in low- and middle-income countries work in occupations with low skills growth. Strengthening learning in homes, schools, neighborhoods, and workplaces is central to raising employment, earnings, and living standards worldwide."

FOOTNOTES [i] (tooltips "Author's calculations", texto exacto):
- [i] en P12: "Author's calculations based on ILOSTAT data on employment by sex, age, and education from 2010 to 2024. Calculation includes prime aged workers, aged 25-54 years old. High education individuals classified as having "Advanced" education according to ILO definitions. Low education individuals classified as "Less than basic" education according to ILO definitions."
- [i] en P16: "Average earnings are proxied by mean consumption per capita from World Bank PIP (Survey mean consumption or income per capita, total population, 2021 PPP $ per day), annualized to $1,727. Since this measure includes children and non-workers, it likely understates actual worker earnings, making the benefit estimate conservative. The net present value is computed as: a 10% earnings premium on $1,727 yields $172.70 in additional annual income; discounted over a 40-year career at a 5% discount rate (annuity factor of 17.16), this gives a lifetime gain of approximately $172.70 × 17.16 ≈ $2,960, or roughly $3,000. The calculation does not subtract foregone earnings during the additional year of schooling, although the foregone earnings would need to be extremely high to offset the higher wages later in life."

4) ABOUT THIS STORY
References (ol.list-decimal, 11 items; los sup [1]–[11] del texto apuntan a estos):
1. Jedwab, Remi, Paul Romer, Asif M. Islam, and Roberto Samaniego. 2023. "Human Capital Accumulation at Work: Estimates for the World and Implications for Development." American Economic Journal: Macroeconomics 15 (3): 191–223. [https://www.aeaweb.org/articles?id=10.1257/mac.20210002]
2. Lutz Hendricks, Todd Schoellman, Human Capital and Development Accounting: New Evidence from Wage Gains at Migration, The Quarterly Journal of Economics, Volume 133, Issue 2, May 2018, Pages 665–700, [https://doi.org/10.1093/qje/qjx047]
3. Hendricks, Lutz, and Todd Schoellman. 2023. "Skilled Labor Productivity and Cross-Country Income Differences." American Economic Journal: Macroeconomics 15 (1): 240–68. [https://www.aeaweb.org/articles?id=10.1257/mac.20200256]
4. Amory Gethin, Distributional Growth Accounting: Education and the Reduction of Global Poverty, 1980–2019, The Quarterly Journal of Economics, Volume 140, Issue 4, November 2025, Pages 2571–2618, [https://doi.org/10.1093/qje/qjaf033]
5. Holla, Alaka, Norbert Schady, and Joana Silva, eds. 2026. Building Human Capital Where It Matters: Homes, Neighborhoods, and Workplaces. World Bank. doi: [https://hdl.handle.net/10986/44282] (el texto tras "doi:" queda vacío en el HTML — así viene)
6. Decerf, Benoît; D'Souza, Ritika; Schady, Norbert; Silva, Joana; Stacy, Brian. 2026. The Human Capital Index Plus 2026: Methodology Note. [https://hdl.handle.net/10986/34343]
7. Barro, Robert and Jong-Wha Lee, 2013, "A New Data Set of Educational Attainment in the World, 1950-2010." Journal of Development Economics, vol 104, pp.184-198. [http://www.sciencedirect.com/science/article/pii/S0304387812000855]
8. Montenegro, C.E. and Patrinos, H.A., 2023. "A data set of comparable estimates of the private rate of return to schooling in the world, 1970–2014". International Journal of Manpower, 44(6), pp.1248-1268. [https://www.emerald.com/insight/content/doi/10.1108/IJM-03-2021-0184/full/html]
9. Gindling, T.H. and Newhouse, D., 2014. Self-employment in the developing world. World development, 56, pp.313-331. [http://dx.doi.org/10.1016/j.worlddev.2013.03.003]
10. Tanaka, Nobuyuki; Angel-Urdinola, Diego; Bend, May; Hu, Yitong; Rivera-Olvera, Angelica; Antoninis, Manos; Murakami, Yuki; Montoya, Silvia. Education Finance Watch 2024 (English). Washington, D.C. : World Bank Group. [http://documents.worldbank.org/curated/en/099102824144527868]
11. Hendren, Nathaniel, and Ben Sprung-Keyser. 2020. A Unified Welfare Analysis of Government Policies. The Quarterly Journal of Economics 135 (3): 1209–1318. [https://doi.org/10.1093/qje/qjaa006]

Suggested Citation (exacta): "Stacy, B & Laesser, C. 2026. "Skills Are Used and Built on the Job." In Atlas of Global Development 2026, edited by A F Pirlea, D Wadhwa, D Mahler, U Serajuddin, M Welch, A Thudt, and M Lambrechts. Washington DC: World Bank. License: Creative Commons Attribution CC BY 3.0 IGO."

Credits: Author(s): Brian Stacy · Visuals: Christian Laesser · Art Direction: Alice Thudt · Acknowledgements: Norbert Schady, Joana Silva, Alaka Holla.
Share: LinkedIn y Facebook, ambos apuntando a https://data360.worldbank.org/en/atlas/learning-and-work/ (título compartido "Atlas of Global Development").
License: "Creative Commons Attribution CC BY 3.0 IGO" (texto plano, SIN link en el markup).
Supported by: logos SDG Fund, World Development Indicators, Data360 (imgs, sin texto adicional).

5) MAPEO GRÁFICOS → CAPÍTULOS LOCALES (inventory.json, chapterTitle "Learning and Work", 7 items, todos status "ready", fidelity tier-B-bulk, approved=false). Mapeo 1:1 PERFECTO — el translationPrefix del config (goal_04.content.#N) coincide con el anchor cN; CERO gráficos sin réplica:

- c6 → chapters/goal_04/00-schooling-regions (vis, schooling_regions) — "Schooling is rising in most regions / Expected years of schooling by region". Calza: sigue a P3 que define expected years of schooling. La réplica trae un textParagraph propio (South Asia 8→11 años, etc.) que en el Atlas se renderiza dentro del componente del gráfico (client-side, no está en el SSR).
- c9 → chapters/goal_04/01-schooling-scroller (scroller, schooling_scroller, 5 escenas: 1920/1960/post-1960/Korea-Egipto-India-México/2025) — "Years of schooling have improved significantly over time". Calza: sigue a P5 (Barro-Lee); es el 1er in-scroller del SSR. Los steps solo existen en la réplica, no en el SSR.
- c14 → chapters/goal_04/02-education-quality-details (vis, education_quality_details) — "Learning-adjusted years of schooling are, on average, only two-thirds as high as unadjusted years of schooling". Calza: tras P7 (ajuste por aprendizaje); textParagraph propio (Mali 4.7→2.4, Philippines, Brazil, Korea).
- c19 → chapters/goal_04/03-lays-change (vis, lays_change, scatter 2010 vs 2025, visSize small) — "Learning-adjusted years of schooling have decreased in around 1/3rd of low or lower-middle-income economies". Calza: cierre de "Learning quality", tras P10 (37 países / 13 caídas).
- c26 → chapters/goal_04/04-wages (vis, wages, barras wage premium por nivel) — "More schooling leads to higher earnings in the labor market / Typical wage premiums by education level". Calza: tras P14 (Brazil 2x secundaria, 167% universitaria, Georgia/India/Philippines/South Africa).
- c31 → chapters/goal_04/05-mincer-coefficients (vis, mincer_coefficients, scatter retornos vs GDP pc, visSize fullScreen) — "On average, each year of schooling raises earnings by 10%". Calza: cierre de "How does schooling impact jobs?", tras P16 (costo-beneficio $283/$3,000).
- c39 → chapters/goal_04/06-wage-scroller (scroller, wage_scroller, 4 escenas: india_1, india_2, india_3, brazil) — "Earnings for those with tertiary are higher and grow faster / Wage profiles by worker experience". Calza: 2º in-scroller del SSR, tras P19; P20 ("These differences over time…") comenta el resultado del scroller.

NO EXTRAÍBLE del mirror: (a) config de partículas del hero (color/count — client-side); (b) textos de steps de los 2 scrollers en el SSR (solo en réplicas locales); (c) títulos/subtítulos/fuentes de los gráficos en el SSR (contenedores = solo spinner; los títulos citados salen del inventario local); (d) key facts propios del hero (el SSR trae los de pobreza — artefacto a corregir en la réplica usando los keyFact del inventario o el sitio vivo).

Archivos: /Users/diazaraujo/atlas-global-development/learning-and-work/index.html · /Users/diazaraujo/atlas-global-development/learning-and-work/__data.json · /Users/diazaraujo/libreria-storytell/inventory/inventory.json · referencia de formato /Users/diazaraujo/libreria-storytell/stories/global-progress/story.json