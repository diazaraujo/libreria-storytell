Extracción completa. Todo verificado contra el SSR del mirror y el inventario local. Va el reporte completo.

---

# EXTRACCIÓN — Atlas of Global Development 2026 · "artificial-intelligence"

**Fuente:** `/Users/diazaraujo/atlas-global-development/artificial-intelligence/index.html` (SSR SvelteKit; URL original `https://data360.worldbank.org/en/atlas/artificial-intelligence/`). Licencia declarada en la página: **Creative Commons Attribution CC BY 3.0 IGO** (permite reproducción con atribución; cita sugerida más abajo).

**Advertencia general de extraíbles:** los 5 contenedores de gráficos son cascarones vacíos en el SSR (solo spinner `tail-spin.svg`, `min-height: 60vh`). Título/subtítulo/fuente/notas de cada gráfico NO están en el HTML — se renderizan client-side desde chunks JS que el mirror no tiene (`/en/atlas/_app/...`). `__data.json` solo trae el header del sitio. PERO: todo eso ya está replicado en el inventario local (sección 5). Los textos de los pasos del scroller tampoco están en el HTML; los recuperé del inventario local.

---

## 1) HERO

- **Kicker** (div.subTitle): `Artificial Intelligence (AI)`
- **H1:** `Inequalities in Use of and Exposure to Artificial Intelligence`
- **Lead** (p.font-display.text-lg.text-white/90):

> Artificial Intelligence is reshaping the world, but the digital shift is filtering slowly to the global poor. While wealthy nations race ahead, high costs and a lack of digital skills leave billions behind. In poorer countries, the workplace remains mostly untouched by AI, threatening to turn a technological leap into a permanent global divide.

- **Byline** (con los `<span class="font-semibold">` igual que en story.json):

> May 2026, Story by **Daniel Gerszon Mahler, He Wang & Michael Weber**, Visuals by **Jan Willem Tulp**

- **Fondo:** clases `goaltitle uses-particles bg-bg-dark-blue` — usa partículas y `--bgDarkBlue` (CSS var; el valor hex está en CSS externo no mirroreado — **no extraíble**). Mismo patrón que el hero de global-progress (`bg: #071a3d`, particles), pero color exacto y config de partículas de ESTA historia no extraíbles del mirror.

## 2) Key facts

El hero SÍ tiene bloque "**Key facts** from this story" (3 tarjetas con borde izquierdo 4px, número grande + label + link "Show details ↓"). **PERO el contenido SSR es basura de otra historia (clima), no de AI:**

1. `4.5 billion` — "people are exposed to climate-related hazards" → `#c19`
2. `2.8 billion` — "people live in highly vulnerable conditions globally" → `#c25`
3. `1.5 billion` — "people are exposed to climate-related hazards and living in highly vulnerable conditions" → `#c31`

Los anchors `#c19/#c25/#c31` no existen en esta página (los reales son c5/c14/c20/c28/c39). Es un placeholder SSR que se hidrata client-side; **los key facts genuinos de AI no son extraíbles del mirror**. Candidatos obvios desde la prosa si quieres fabricarlos: 50× ChatGPT, ~½ presupuesto para 5GB, 5% digital skills.

## 3) SECUENCIA completa (orden exacto del documento SSR)

Notación: `[n]` = referencia numerada inline (expandible, resuelve a la lista de References de la sección 4); los subtítulos en negrita son `<strong>` dentro de un div de prosa, NO headings; "CALLOUT" = `p.display.text-lg.leading-snug` (frase destacada grande).

---

**[H3 VACÍO]** — hay un `<h3 class="display wb-underline ...">` sin texto antes del primer heading real. Artefacto SSR (contenido client-side). No extraíble qué renderiza.

### H3 · The diffusion of AI

**P1:**
> AI is a rapidly spreading transformative technology that can be defined as a branch of computer science dedicated to creating systems capable of performing tasks that typically require human intelligence.[1] It has the potential to fundamentally shift the way we learn, work, and live our daily lives. The unprecedented pace of AI adoption also holds immense potential for accelerating global development and improving living standards, by boosting growth,[2] personalizing education,[3] and transforming the agricultural sector.[4] But the spread of AI is far from even.

**P2:**
> Measuring the use of AI is a challenge, partly due to the many possible ways of interacting with AI and the speed with which this is changing. High-frequency website traffic data reveals a great divergence in the use of AI across countries. Although this is partly due to greater internet penetration in wealthier nations, AI use per internet user is also much greater in wealthier nations. Focusing on the most-used AI platform, ChatGPT, as of May 2025, visits per internet user in high-income countries was nearly 50 times that of low-income countries, 8 times that of lower-middle income countries, and 3 times that of upper-middle income countries.[5][6]

**CALLOUT:**
> Visits to ChatGPT per internet user is **50 times** greater in high-income countries than in low-income countries, as of May 2025.

**>>> GRÁFICO c5** — mapa/scatter uso ChatGPT (ver mapeo §5: `00-ai-adoption`).

**P3:**
> This discrepancy is partly due to the use of different AI platforms around the world. For example, OpenAI, the company behind ChatGPT, is less present in China, where other companies dominate. Measures that account for multiple platforms also find that in most Sub-Saharan African countries, less than 10 percent of the working-age population uses AI.[7] Evidence from Anthropic, the company behind the AI assistant, Claude, also suggests that country usage is lowest in poorer countries, which have usage scores 10 times smaller than high-income countries.[8]

### H3 · What is holding back AI adoption?

**P4:**
> The disparity in AI adoption is not accidental. Rather, it is rooted in difficult development challenges. The World Bank's Digital Progress and Trends Report 2025 *(link: worldbank.org/en/publication/dptr2025-ai-foundations)* finds that to fully benefit from AI, countries need four things: reliable and affordable internet connectivity, local data that make AI tools useful and accurate, a digitally skilled population, and enough computing power. Without these elements in place, the promise of AI could remain out of reach for a significant portion of the world's population. Let's take a look at each of these in more detail.

**SUBTÍTULO (strong):** `Connectivity and affordability`

**P5:**
> Inadequate internet infrastructure is a primary barrier to AI adoption in low- and middle-income countries.[9] The absence of fiber networks means that many rural and low-income populations have to rely on mobile devices. But even among those with internet access over phones, usage remains low. This is partly because data packages are prohibitively costly for many in poorer countries, where a data-only 5GB mobile package costs more than 15 percent of the average person's total budget. With around 60 percent of the household budget allocated to food in these countries,[10] a data package would take up nearly half of the remaining budget.

**CALLOUT:**
> In low-income countries, a data-only 5GB mobile package would take up **nearly half** of a household's remaining budget after food consumption.

**P6:**
> As a result, many households in low‑income countries face a trade‑off between affording a 5 GB data package and spending on essentials such as health care, education, or clothing.

**>>> GRÁFICO c14** — asequibilidad de datos móviles (`01-affordability-barrier`).

**P7:**
> The relatively high cost of mobile phone data and the difficulty of creating fiber networks in low- and middle-income countries underscore the importance of Small AI – lightweight applications optimized for mobile-first environments that can function with limited or intermittent connectivity. For example, agricultural AI tools that identify crop diseases from a photo can perform their core analysis on-device, minimizing data usage and making them viable for farmers in remote areas.[11]

**SUBTÍTULO (strong):** `The digital divide in language`

**P8:**
> Large language models are AI systems built on vast datasets that predict and generate human-like text. These models are only effective when they have a good understanding of a language. And the digital world is dominated by English, which accounts for nearly half of global URLs and a disproportionate share of the high-quality text data used to build leading AI models. While substantial datasets exist for other languages spoken in high-income countries, there is a significant deficit for languages that are primarily spoken in low and middle-income countries. Consequently, AI models often lack the accuracy and nuance needed to be useful in these contexts.[12] This limits the utility of AI tools and perpetuates a digital world where only a fraction of global cultures and languages are well represented. If AI is to be a universal tool, it must learn to navigate the world's full linguistic map.[13]

**>>> GRÁFICO c20** — idiomas subrepresentados (`02-digital-language-divide`).

**SUBTÍTULO (strong):** `Competency: the human capital gap`

**P9:**
> Effective use of AI requires digital literacy. Basic skills are necessary for adopting AI tools, while advanced skills determine adaptation to local contexts and advancement toward the frontier of AI applications. But there is a global deficit in digital skills, particularly in low- and middle-income countries. In 2023, it was estimated that less than five percent of the population of low-income countries used basic digital devices and services such as email communication, web search, and online transactions.[14]

**STAT TILE (número gigante + hr + label):**
> **5%** of the population — of low-income countries had basic digital skills in 2023

**P10:**
> The gap is even more severe for advanced skills related to data analysis, software development, and high-level computing competences with AI systems. Without a concerted effort to build digital skills at all levels of the education system and retain local talent, poorer countries risk being unable to move from passive AI consumers to active participants and creators in the AI economy.

**>>> GRÁFICO c28** — digital skills por income group (`03-digital-skills`).

**SUBTÍTULO (strong):** `Computing power`

**P11:**
> A lack of AI, memory, and storage chips, needed to build servers, constrains computing power in many poorer countries. As of June 2025, high-income countries accounted for 77 percent of global data center capacity, middle-income countries for 23 percent, and low-income countries for less than 0.1 percent.[1] On a per capita basis, the United States had 20,000 times as many servers as low-income countries and 200 times as many as middle-income countries.[1] High entry costs, a lack of energy, and digital infrastructure constraints often deter private investment in poorer countries. Fortunately, computing power is highly tradable across countries. With access from other nations, poor countries can use AI without having national computing power.

*(Nota: NO hay gráfico en la subsección Computing power.)*

### H3 · Exposure to AI at work

**P12:**
> There is a direct link between this lack of use of AI in low- and middle-income countries and a lack of exposure to AI at work.[15] Exposure to AI allows some tasks to be augmented by AI, which can increase workers' productivity, while other tasks may become fully automated, reducing demand for some jobs. Whichever it is, high exposure suggests that the nature of jobs is likely to change.

**P13:**
> One approach to measuring workers' exposure is the AI Occupational Exposure (AIOE) index, which links human job tasks to various AI capabilities.[16] It uses a detailed database of occupations to determine how much of a person's daily work duties overlap with current AI capabilities. By analyzing these connections, the index identifies which jobs are most likely to be affected or assisted by AI. The scale ranges from 0 to 100, where 0 represents an occupation with no tasks suitable for AI and 100 indicates a role where every task is fully exposed to AI capabilities. Although the capabilities of AI have expanded significantly since this index was built, recent usage data are broadly consistent with the index, showing that AI use is closely aligned with the occupations most exposed to AI according to the index.[15][i]

**NOTA [i] (expandible, tipo footnote romana — mismo patrón `ref-i` de global-progress):**
> Yet the link between use and exposure is not perfect. Managers, for example, show high theoretical exposure to AI but relatively low usage. Since the AIOE index was created, newer frameworks for evaluation occupational exposure to AI have been constructed.[17][18]

**>>> GRÁFICO c39 — SCROLLER (`in-scroller`)** — beeswarm de exposición ocupacional (`04-exposure`, 6 escenas; textos en §5).

**P14:**
> The difference between exposure in poor and rich countries is likely underestimated for two reasons. First, many people in poorer countries do not have access to the internet or computers at home or work. Even if their occupational tasks could be exposed to AI, in practice, they are not.[19] Second, the tasks associated with an occupation differ in rich and poor countries. The AIOE Index is based on the tasks associated with occupations in the United States. In poorer countries, similar occupations are likely to involve tasks with less AI exposure.

**P15:**
> AI exposure also varies notably within countries, and is heavily concentrated among urban populations, with city dwellers facing much higher exposure than those in rural areas due to the nature of urban employment. Education is the strongest predictor of exposure, as individuals with post-secondary degrees occupy roles with high cognitive task intensity that are most susceptible to AI integration. A notable gender gap exists, with women generally experiencing higher exposure than men, largely because they are more concentrated in clerical, professional, and service roles.[20][21] Understanding these differences in exposure is vital to anticipate how AI will transform the labor market, and the socioeconomic consequences of this transformation.

**P16:**
> In middle-income countries, AI usage is highly concentrated among a few professions. Here, ICT workers and teachers account for nearly three-quarters of all AI usage, whereas in high-income countries, there is a much broader spread. This concentration reinforces the impact of foundational barriers, as adoption remains restricted to workers with the strongest digital access and text-heavy tasks.[15]

### H3 · Navigating the path forward

**P17:**
> Although the rise of AI offers a powerful engine for productivity and human development, it also threatens to deepen inequalities between and within countries. The impact of AI on jobs remains a subject of intense debate, with the future likely to involve a complex mix of both augmentation, where AI enhances human capabilities, and automation, where AI replaces certain tasks. Until now, the direct impact on the poorest countries has been limited by structural barriers and predominant occupations. As AI adoption follows a predictable diffusion pattern—starting with ICT professionals and spreading outward to other sectors—it offers a window for proactive policy.

**P18:**
> For low- and middle-income countries, the path forward involves a dual strategy. First, governments can strengthen foundational pillars by investing in the essentials, such as affordable internet, data infrastructure, and digital skills. And second, they can build the bedrock for Small AI, which does not require massive infrastructure or cutting-edge servers but flourishes instead on smaller, local datasets and is fine-tuned to address immediate challenges. By focusing on solutions that can run on everyday smartphones using minimal resources, poorer countries can harness AI to create tangible impact in key sectors, such as public health, agriculture, and education.

*(Hay además varios divs de prosa VACÍOS intercalados — placeholders SSR de contenido client-side, probablemente los slots de títulos/notas de gráficos: 1 antes del callout 5GB, 2 tras c14, 3 tras c20, 1 tras c28, 1 tras P12, 3 antes de c39.)*

## 4) About this story

**References** (ol, 21 ítems, exactos con link):

1. World Bank. 2025. *Digital Progress and Trends Report 2025: Strengthening AI Foundations*. Washington DC: World Bank. → doi.org/10.1596/978-1-4648-2264-3
2. Bergman, B J and Wang, H. 2025. "Case study 3: Co-worker, Coach, or Competitor?" Digital Progress and Trends Report 2025. World Bank. → openknowledge.worldbank.org/server/api/core/bitstreams/d0fdd76b-c77e-481a-b0f6-7096127a039a/content
3. Molina, E, Cobo Romani, J C, Pineda, J A and Rovner, H. 2024. *AI Revolution in Education: What You Need to Know*. Digital Innovations in Education Brief No.1. World Bank. → doi.org/10.1596/41806
4. Krishnakumari, P K and Shah, P. 2025. *Harnessing Artificial Intelligence for Agricultural Transformation*. Washington DC: World Bank Group. → documents.worldbank.org/curated/en/099110225213024234
5. Liu, Y, Jingyun, H and Wang, H. 2025. *Who on Earth Is Using Generative AI? Global Trends and Shifts in 2025*. Policy Research Working Paper 11231. World Bank. → hdl.handle.net/10986/43859
6. Semrush. 2025. → semrush.com
7. Misra, A, Wang, J, McCullers, S, White, K and Lavista Ferres, J. 2025. "Measuring AI Diffusion: A Population-Normalized Metric for Tracking Global AI Usage." arXiv preprint arXiv:2511.02781. → doi.org/10.48550/arXiv.2511.02781
8. Anthropic. 2026. *Anthropic Economic Index: Understanding AI's effects on the economy*. → anthropic.com/economic-index#country-usage
9. Pirlea, A F and Corso, L. 2026. "The Unfinished Digital Revolution: Expanding Internet Access." World Bank Atlas of Global Development 2026. → data360.worldbank.org/en/atlas/internet-access
10. Mahler, D G, Yonzan, N, Hill, R, Lakner, C, Wu, H and Yoshida, N. 2022. "Pandemic, Prices, and Poverty." World Bank Data Blog, April 13. → blogs.worldbank.org/en/opendata/pandemic-prices-and-poverty
11. Kim, S and Qiang, C Z. 2025. "Small AI, Big Impact: Harnessing Artificial Intelligence for Development." World Bank Blog, published on Voices, September 10. → blogs.worldbank.org/en/voices/small-ai-big-impact-harnessing-artificial-intelligence-for-development
12. Solatorio, A V, Vicente, G S, Krambeck, H and Dupriez, O. 2024. "Double Jeopardy and Climate Impact in the Use of Large Language Models: Socio-economic Disparities and Reduced Utility for Non-English Speakers." arXiv preprint arXiv:2410.10665. → doi.org/10.48550/arXiv.2410.10665
13. UNESCO. 2025. *Global Roadmap for Multilingualism in the Digital Era: Advancing the Role of Language Technologies*. Paris, France. → unesco.org/en/global-roadmap-multilingualism
14. International Telecommunication Union, ITU DataHub. → datahub.itu.int
15. Demombynes, G, Langbein, J and Weber, M. 2026. "From Predictions to Practice: What AI Usage Data Reveals About the Future of Work." World Bank Blog: Protect and Invest in People, February 19. → blogs.worldbank.org/en/investinpeople/from-predictions-to-practice--what-ai-usage-data-reveals-about-t
16. Felten, E, Raj, M and Seamans, R. 2021. "Occupational, Industry, and Geographic Exposure to Artificial Intelligence: A Novel Dataset and Its Potential Uses." Strategic Management Journal 42(12): 2195–2217. → doi.org/10.1002/smj.3286
17. Eloundou, T., Manning, S., Mishkin, P. and Rock, D. 2024. "GPTs are GPTs: Labor market impact potential of LLMs. Science", 384(6702). → science.org/doi/10.1126/science.adj0998
18. Gmyrek, P., Berg, J., Kamiński, K., Konopczyński, F., Ładna, A., Nafradi, B., Rosłaniec, K. and Troszyński, M. 2025. "Generative AI and jobs: A refined global index of occupational exposure." ILO Working Paper 140. → doi.org/10.54394/HETP0387
19. Gmyrek, P, Winkler, H and Garganta, S. 2024. *Buffer or Bottleneck? Employment Exposure to Generative AI and the Digital Divide in Latin America*. Policy Research Working Paper 10863. World Bank. → doi.org/10.1596/1813-9450-10863
20. Demombynes, G, Langbein, J and Weber, M. 2025. *The Exposure of Workers to Artificial Intelligence in Low- and Middle-Income Countries*. Policy Research Working Paper 11057. World Bank → doi.org/10.1596/1813-9450-11057
21. Wadhwa, D and Bonfert, A. 2026. "Shaping the Future of Women in the Workplace" In Atlas of Global Development 2026, edited by A F Pirlea, D Wadhwa, D Mahler, U Serajuddin, A Thudt, and M Welch. Washington DC: World Bank. License: Creative Commons Attribution CC BY 3.0 IGO. → doi.org/10.60616/mdwd-6c39

**Suggested Citation** (exacta):
> Mahler, D G, Tulp, J W, Wang, H and Weber, M. 2026. "Inequalities in AI use and exposure." In Atlas of Global Development 2026, edited by A F Pirlea, D Wadhwa, D Mahler, U Serajuddin, M Welch, A Thudt, and M Lambrechts. Washington DC: World Bank. License: Creative Commons Attribution CC BY 3.0 IGO.

(El título de la cita enlaza a doi.org/10.60616/7xx4-k167 — el DOI de la historia.)

**Credits:**
- Author(s): Daniel Gerszon Mahler · He Wang & Michael Weber
- Visuals: Jan Willem Tulp
- Art Direction: Alice Thudt
- Acknowledgements: Gordon Blackladder, David Castillo Parra, Gabriel Demombynes, Holly Krambeck, Jorg Gero Langbein, Yan Liu, Aivin Solatorio, Sharada Srinivasan

**Share:** dos `<a>` vacíos en SSR (botones client-side) — destinos no extraíbles.

**License:** `Creative Commons Attribution CC BY 3.0 IGO` (texto plano, sin link en SSR).

**Supported by:** 3 logos — SDG Fund, World Development Indicators, Data360 (SVGs del sitio, no mirroreados).

## 5) Mapeo gráficos → capítulos locales

`inventory/inventory.json`: 5 ítems con `chapterTitle: "Artificial Intelligence (AI)"` (chapterId 16), **los 5 en status "ready"**. El calce con la prosa es 1:1, sin ambigüedad y **sin gráficos huérfanos en ningún sentido** (5 anchors ↔ 5 capítulos):

| Anchor | Posición en la prosa | Capítulo local | Título del gráfico (del inventario) |
|---|---|---|---|
| **c5** | Tras callout "50 times" (sección Diffusion) | `chapters/goal_16/00-ai-adoption` (vis `ai_adoption`) | "Use of ChatGPT is 50 times higher in rich countries than in poorer countries" — subtítulo "Visits to ChatGPT per internet user, May 2025"; mapa + scatter GDP vs uso; data `chatgpt.csv` |
| **c14** | Tras "As a result, many households..." (Connectivity) | `chapters/goal_16/01-affordability-barrier` (vis `affordability_barrier`, small) | "Mobile data is prohibitively expensive in low-income countries" — "Cost of data-only 5GB mobile package as a share of non-food household budget"; data `affordability_incgroup.csv` |
| **c20** | Tras párrafo de LLMs/idiomas (Language divide) | `chapters/goal_16/02-digital-language-divide` (vis `digital_language_divide`) | "Languages spoken in poorer countries are underrepresented in AI training data" — "Global URLs and global population, by language"; data `language.csv` |
| **c28** | Tras "The gap is even more severe..." (Competency) | `chapters/goal_16/03-digital-skills` (vis `digital_skills`, small) | "Less than 5% of the population of low-income countries have the digital skills to use AI" — "Population with digital skills, 2023"; data `digitalskills.csv` |
| **c39** | Tras la nota [i], sección Exposure — ES el scroller (`in-scroller`) | `chapters/goal_16/04-exposure` (scroller `exposure`, 6 escenas) | "Workers in low-income countries are less exposed to AI" — "Index of occupational exposure to AI from 0 (no exposure) to 100 (full exposure)"; data `beeswarm_updated.csv`; fuente "Author's calculations based on Demombynes, Langbein, and Weber (2025). Note: The occupational icons are AI generated." |

**Escenas del scroller c39** (texto exacto del inventario, no extraíble del HTML):
1. "Some occupations, such as information and communications technology (ICT) professionals, are exposed to AI in most facets of their work, with an exposure score of 93."
2. "Others, such as subsistence farmers, fishers, hunters and gatherers, are largely not exposed to AI in their work, with an exposure score of 20." + footnote (AIOE basado en tareas de EE.UU.)
3. "Most occupations fall somewhere in between."
4. "Countries are exposed differently to AI because occupation types differ by country. We can see this by scaling the occupations according to their prominence. Here, this is done for the United States. Defining high exposure as greater than 50, the majority of US workers are highly exposed, because occupations such as business and administration associate professionals and teaching professionals are common."
5. "In middle-income countries, occupations such as market-oriented skilled agricultural workers and sales workers are common. These occupations are notably less exposed to AI than many of the occupations common in the US."
6. "In low-income countries, large populations of workers are engaged in subsistence farming, and less than 20 percent of workers are highly exposed to AI." + footnote (umbral de high exposure)

**Resumen de lo NO extraíble del mirror:** (a) key facts genuinos del hero (SSR trae los de la historia de clima); (b) títulos/subtítulos/fuentes/notas de gráficos tal como se pintan en la página (client-side — pero el inventario local los tiene todos); (c) contenido del H3 vacío inicial; (d) color hex del hero y config de partículas (CSS vars externas); (e) links de Share; (f) el texto que llenaría los divs de prosa vacíos (probablemente slots de gráficos).