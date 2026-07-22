/* Capital Trade × Unholster — "Cómo se arma un modelo cuant estilo Jim Simons"
 *
 * Story construida SOBRE el motor de libreria-storytell (AtlasChapterScroll):
 * hero + partículas, rail de anotación a la izquierda, gráfico animado a la
 * derecha que avanza por escena al hacer scroll. Tematizada Unholster.
 * Cada bloque de viz trae su propio mount(chartEl, ctx) -> { updateScene(i) }.
 *
 * Todas las cifras salen de corridas reales (ver capital-trade/sot/SOT.md).
 */
(function () {
  "use strict";

  // ---- helpers ----
  var sc = 0;
  function S(text) { return { id: "s" + (sc++), text: text }; }

  function host(chartEl, viewBox, inner) {
    chartEl.innerHTML =
      '<svg class="ct" viewBox="' + viewBox + '" preserveAspectRatio="xMidYMid meet" ' +
      'style="width:100%;height:100%;overflow:visible">' + inner + "</svg>";
    return chartEl.querySelector("svg.ct");
  }

  // controller: agrega .anim una vez (dispara los intros) y setea data-scene (dispara reveals)
  function controller(svg, n) {
    return {
      updateScene: function (i) {
        i = Math.max(0, Math.min(n - 1, i | 0));
        if (!svg.classList.contains("anim")) {
          svg.getBoundingClientRect(); // fuerza reflow para que las transiciones corran
          svg.classList.add("anim");
        }
        svg.setAttribute("data-scene", String(i));
      },
    };
  }

  // fábrica de bloque de gráfico
  function vis(cfg) {
    var n = cfg.scenes.length;
    return {
      id: cfg.id,
      type: "scroller",
      title: cfg.title,
      subtitle: cfg.subtitle,
      source: cfg.source,
      scenes: cfg.scenes,
      vhPerScene: cfg.vhPerScene || 1.0,
      mount: function (chartEl, ctx) {
        var svg = host(chartEl, cfg.viewBox, cfg.inner);
        var c = controller(svg, n);
        c.updateScene((ctx && ctx.sceneIndex) || 0);
        return c;
      },
    };
  }

  // ============================================================ SVGs por acto

  var DATOS =
    '<g font-size="12.5">' +
    row(20, "Transacciones de insiders", "18.991", "#184D9B", 520, "#266FE0", ".05s") +
    row(68, "Precios de bolsa · 131 acciones", "18 años", "#0a7d5a", 352, "#10B981", ".13s") +
    row(116, "Hechos esenciales CMF", "1.881", "#6b3fd0", 240, "#8B5CF6", ".21s") +
    row(164, "Estados financieros (FECU)", "166", "#B87908", 120, "#F59E0B", ".29s") +
    row(212, "Fuentes de datos · Unholster", "~170", "#171B21", 470, "#171B21", ".37s") +
    "</g>";
  function row(y, label, val, valcol, w, barcol, delay) {
    return (
      '<g transform="translate(0,' + y + ')">' +
      '<text x="0" y="16" fill="#33383f">' + label + "</text>" +
      '<text x="520" y="16" text-anchor="end" fill="' + valcol + '">' + val + "</text>" +
      '<rect x="0" y="26" width="520" height="13" rx="6.5" fill="#F5F6F8"/>' +
      '<rect class="growx" x="0" y="26" width="' + w + '" height="13" rx="6.5" fill="' + barcol + '" style="transition-delay:' + delay + '"/>' +
      "</g>"
    );
  }

  var INSIDER =
    '<line x1="52" y1="30" x2="52" y2="250" stroke="#E5E7EB"/>' +
    '<line x1="52" y1="200" x2="530" y2="200" stroke="#E5E7EB"/>' +
    '<text x="52" y="272" font-size="10.5" fill="#6B7280" text-anchor="middle">compra</text>' +
    '<text x="530" y="272" font-size="10.5" fill="#6B7280" text-anchor="end">+120 días</text>' +
    '<text x="44" y="60" font-size="10.5" fill="#6B7280" text-anchor="end">+22%</text>' +
    '<text x="44" y="204" font-size="10.5" fill="#6B7280" text-anchor="end">0%</text>' +
    '<path class="draw" d="M52 200 C 150 190, 210 150, 300 130 C 380 112, 450 78, 530 52" fill="none" stroke="#266FE0" stroke-width="2.6"/>' +
    '<g class="rev1">' +
      '<path d="M52 200 C 150 205, 240 210, 340 213 C 420 215, 470 214, 530 214" fill="none" stroke="#94A3B8" stroke-width="2" stroke-dasharray="4 4"/>' +
      '<rect x="356" y="196" width="176" height="34" rx="7" fill="#F2F4F7"/>' +
      '<text x="366" y="211" font-size="10.5" fill="#33383f">— El ejecutivo persona</text>' +
      '<text x="366" y="225" font-size="10.5" fill="#33383f">no anticipa nada.</text>' +
    "</g>" +
    '<g class="pop" style="transition-delay:1s"><circle cx="300" cy="130" r="4.5" fill="#266FE0"/>' +
      '<text x="300" y="120" text-anchor="middle" font-size="11" font-weight="700" fill="#184D9B">+9,7%</text>' +
      '<text x="300" y="146" text-anchor="middle" font-size="9.5" fill="#6B7280">a 60 días · t = 6,4</text></g>' +
    '<text x="120" y="96" font-size="11" font-weight="700" fill="#184D9B" class="fade" style="transition-delay:.6s">HOLDING del director</text>';

  var BANDAS =
    '<line x1="40" y1="230" x2="540" y2="230" stroke="#E5E7EB"/>' +
    '<g font-size="11" text-anchor="middle">' +
    '<rect class="grow" x="70" y="188" width="80" height="42" fill="#94A3B8" rx="4" style="transition-delay:.05s"/>' +
    '<text x="110" y="180" fill="#6B7280" class="fade" style="transition-delay:.4s">+2%</text>' +
    '<text x="110" y="250" fill="#33383f">&lt; $10 MM</text>' +
    '<rect class="grow" x="185" y="70" width="80" height="160" fill="#94A3B8" rx="4" style="transition-delay:.18s"/>' +
    '<rect class="grow rev1" x="185" y="70" width="80" height="160" fill="#266FE0" rx="4" style="transition-delay:.18s"/>' +
    '<text x="225" y="62" fill="#184D9B" font-weight="700" font-size="13" class="rev1">+9,7%</text>' +
    '<text x="225" y="250" fill="#171B21" font-weight="700">$10–50 MM</text>' +
    '<text x="225" y="264" fill="#6B7280" font-size="9.5" class="rev1">el sweet spot</text>' +
    '<rect class="grow" x="300" y="176" width="80" height="54" fill="#94A3B8" rx="4" style="transition-delay:.31s"/>' +
    '<text x="340" y="168" fill="#6B7280" class="fade" style="transition-delay:.7s">+3%</text>' +
    '<text x="340" y="250" fill="#33383f">$50–200 MM</text>' +
    '<rect class="grow" x="415" y="214" width="80" height="16" fill="#94A3B8" rx="4" style="transition-delay:.44s"/>' +
    '<text x="455" y="206" fill="#6B7280" class="fade" style="transition-delay:.8s">~0%</text>' +
    '<text x="455" y="250" fill="#33383f">&gt; $200 MM</text>' +
    "</g>";

  var RIGOR =
    '<g font-size="11.5" text-anchor="middle">' +
    '<rect class="grow" x="40" y="60" width="100" height="170" fill="#10B981" rx="5" style="transition-delay:.05s"/>' +
    '<text x="90" y="50" fill="#0a7d5a" font-weight="700" font-size="13" class="fade" style="transition-delay:.5s">20,2%</text>' +
    '<text x="90" y="250" fill="#33383f">bruto</text>' +
    '<rect class="grow" x="185" y="76" width="100" height="154" fill="#266FE0" rx="5" style="transition-delay:.2s"/>' +
    '<text x="235" y="66" fill="#184D9B" font-weight="700" font-size="13" class="fade" style="transition-delay:.65s">18,3%</text>' +
    '<text x="235" y="250" fill="#33383f">− costos</text>' +
    '<rect class="grow" x="330" y="130" width="100" height="100" fill="#8B5CF6" rx="5" style="transition-delay:.35s"/>' +
    '<text x="380" y="120" fill="#6b3fd0" font-weight="700" font-size="13" class="fade" style="transition-delay:.8s">11,8%</text>' +
    '<text x="380" y="250" fill="#33383f">solo líquidos</text>' +
    '<rect class="grow" x="475" y="222" width="60" height="8" fill="#F59E0B" rx="4" style="transition-delay:.5s"/>' +
    '<text x="505" y="214" fill="#B87908" font-weight="700" font-size="13" class="fade" style="transition-delay:.95s">~0%</text>' +
    '<text x="505" y="250" fill="#33383f">insider solo</text>' +
    "</g>" +
    '<line x1="30" y1="230" x2="540" y2="230" stroke="#E5E7EB"/>' +
    '<text x="505" y="266" text-anchor="middle" font-size="9.5" fill="#6B7280" class="fade" style="transition-delay:1.1s">70% en caja</text>';

  var MOTOR =
    '<line x1="52" y1="30" x2="52" y2="210" stroke="#E5E7EB"/>' +
    '<line x1="52" y1="210" x2="530" y2="210" stroke="#E5E7EB"/>' +
    '<path class="draw" d="M52 210 C 120 200, 150 205, 190 160 C 230 118, 260 165, 300 120 C 350 66, 390 130, 430 92 C 470 58, 500 74, 530 44" fill="none" stroke="#266FE0" stroke-width="2.6"/>' +
    '<text x="150" y="235" font-size="10" fill="#6B7280" text-anchor="middle">2010</text>' +
    '<text x="512" y="235" font-size="10" fill="#6B7280" text-anchor="middle">2026</text>' +
    '<text x="62" y="42" font-size="10" fill="#6B7280">selección con solo data pasada (walk-forward)</text>' +
    statbox(52, "#E7F0FF", "Factor long-short", "Sharpe 1,19", "#184D9B", "1s", 150) +
    statbox(214, "#F2F4F7", "Investable (long-only)", "IR ~0,44", "#171B21", "1.15s", 150) +
    statbox(376, "#F2F4F7", "Positivo en", "11 de 17 años", "#171B21", "1.3s", 154);

  function statbox(x, bg, label, big, bigcol, delay, w) {
    return (
      '<g class="fade" style="transition-delay:' + delay + '">' +
      '<rect x="' + x + '" y="252" width="' + w + '" height="42" rx="8" fill="' + bg + '"/>' +
      '<text x="' + (x + 14) + '" y="270" font-size="10.5" fill="#6B7280">' + label + "</text>" +
      '<text x="' + (x + 14) + '" y="287" font-size="15" font-weight="800" fill="' + bigcol + '" font-family="\'JetBrains Mono\',monospace">' + big + "</text>" +
      "</g>"
    );
  }

  var BANDIT =
    '<defs><clipPath id="ctReveal"><rect class="growx" x="52" y="0" width="478" height="300" style="transition-delay:.05s"/></clipPath></defs>' +
    '<line x1="52" y1="30" x2="52" y2="210" stroke="#E5E7EB"/>' +
    '<line x1="52" y1="210" x2="530" y2="210" stroke="#E5E7EB"/>' +
    '<g clip-path="url(#ctReveal)">' +
      '<path d="M52 210 L52 150 C 160 120, 260 60, 360 46 C 430 40, 480 44, 530 42 L530 210 Z" fill="#266FE0" fill-opacity=".85"/>' +
      '<path d="M52 150 L52 96 C 160 92, 240 100, 360 130 C 430 146, 480 150, 530 150 L530 42 C 480 44, 430 40, 360 46 C 260 60, 160 120, 52 150 Z" fill="#8B5CF6" fill-opacity=".8"/>' +
      '<path d="M52 96 L52 60 C 160 66, 240 74, 360 152 C 430 178, 480 176, 530 172 L530 150 C 480 150, 430 146, 360 130 C 240 100, 160 92, 52 96 Z" fill="#F59E0B" fill-opacity=".8"/>' +
      '<path d="M52 60 L52 34 C 200 40, 320 150, 360 180 C 430 196, 480 192, 530 190 L530 172 C 480 176, 430 178, 360 152 C 240 74, 160 66, 52 60 Z" fill="#10B981" fill-opacity=".8"/>' +
    "</g>" +
    '<g font-size="10.5" class="fade" style="transition-delay:1s">' +
      leg(118, "#266FE0", "momentum") + leg(232, "#8B5CF6", "residual") +
      leg(338, "#F59E0B", "quality") + leg(432, "#10B981", "baja-beta") +
    "</g>" +
    statbox(52, "#E7F0FF", "Asignador adaptativo", "Sharpe 0,27", "#184D9B", "1.2s", 150) +
    '<g class="fade" style="transition-delay:1.35s">' +
      '<rect x="214" y="252" width="316" height="42" rx="8" fill="#F2F4F7"/>' +
      '<text x="228" y="270" font-size="10.5" fill="#6B7280">le gana a momentum solo (0,21) y al promedio ingenuo</text>' +
      '<text x="228" y="287" font-size="12.5" font-weight="700" fill="#171B21">La baja-beta que quisimos botar aportó 34%</text>' +
    "</g>";
  function leg(x, col, label) {
    return '<rect x="' + x + '" y="224" width="10" height="10" rx="2" fill="' + col + '"/><text x="' + (x + 16) + '" y="233" fill="#33383f">' + label + "</text>";
  }

  var HEDGE =
    '<line x1="52" y1="24" x2="52" y2="210" stroke="#E5E7EB"/>' +
    '<line x1="52" y1="40" x2="530" y2="40" stroke="#E5E7EB" stroke-dasharray="3 4"/>' +
    '<text x="44" y="44" font-size="10" fill="#6B7280" text-anchor="end">0%</text>' +
    '<path class="draw" d="M52 40 C 130 70, 170 200, 240 200 C 300 200, 320 90, 400 120 C 460 142, 490 96, 530 84" fill="none" stroke="#94A3B8" stroke-width="2.2"/>' +
    '<text x="240" y="222" font-size="10.5" font-weight="600" fill="#6B7280" text-anchor="middle" class="fade" style="transition-delay:.9s">sin hedge · −53% · Sharpe 0,03</text>' +
    '<g class="rev1">' +
      '<path d="M52 40 C 130 52, 170 120, 240 118 C 300 116, 320 66, 400 74 C 460 80, 490 58, 530 54" fill="none" stroke="#266FE0" stroke-width="2.6"/>' +
      '<text x="360" y="66" font-size="10.5" font-weight="700" fill="#184D9B">con ECH · −33% · Sharpe 0,19</text>' +
      '<rect x="52" y="248" width="478" height="44" rx="8" fill="#FFF6E8"/>' +
      '<text x="66" y="266" font-size="11" fill="#7a5405"><tspan font-weight="700">El short local en Chile es inviable</tspan> (mercado ~US$60M).</text>' +
      '<text x="66" y="282" font-size="11" fill="#7a5405">La ruta: shortear ECH (ETF Chile) vía un prime broker en EE.UU.</text>' +
    "</g>";

  var VEREDICTO =
    '<circle class="pop" cx="212" cy="118" r="94" fill="#266FE0" fill-opacity=".10" stroke="#266FE0" style="transition-delay:.05s"/>' +
    '<circle class="pop" cx="348" cy="118" r="94" fill="#F59E0B" fill-opacity=".10" stroke="#F59E0B" style="transition-delay:.2s"/>' +
    '<g class="fade" style="transition-delay:.5s" text-anchor="middle">' +
      '<text x="162" y="98" font-family="\'JetBrains Mono\',monospace" font-size="11" font-weight="700" fill="#184D9B">UNHOLSTER</text>' +
      '<text x="162" y="116" font-size="11.5" font-weight="600" fill="#171B21">datos + IA</text>' +
      '<text x="162" y="133" font-size="10" fill="#6B7280">la máquina</text></g>' +
    '<g class="fade" style="transition-delay:.65s" text-anchor="middle">' +
      '<text x="398" y="98" font-family="\'JetBrains Mono\',monospace" font-size="11" font-weight="700" fill="#B87908">MERCADO</text>' +
      '<text x="398" y="116" font-size="11.5" font-weight="600" fill="#171B21">idea + capital</text>' +
      '<text x="398" y="133" font-size="10" fill="#6B7280">el criterio</text></g>' +
    '<g class="fade" style="transition-delay:.8s" text-anchor="middle">' +
      '<text x="280" y="112" font-size="10.5" font-weight="700" fill="#171B21">la unión:</text>' +
      '<text x="280" y="127" font-size="10.5" font-weight="600" fill="#171B21">un motor</text></g>' +
    '<g text-anchor="middle" class="fade" style="transition-delay:1s">' +
      metric(70, "6", "días") + metric(210, "~30", "módulos") +
      metric(350, "6", "factores") + metric(490, "+1", "= horas") +
    "</g>";
  function metric(x, big, label) {
    return (
      '<g transform="translate(' + x + ',238)">' +
      '<text y="0" font-family="\'JetBrains Mono\',monospace" font-size="22" font-weight="800" fill="#184D9B">' + big + "</text>" +
      '<text y="18" font-size="10" fill="#6B7280">' + label + "</text></g>"
    );
  }

  // ============================================================ la story

  window.CT_STORY = {
    title: "Cómo se arma un modelo cuant estilo Jim Simons",
    hero: {
      kicker: "La unión de dos mundos · caso real",
      title: "Cómo se arma un modelo cuant estilo Jim Simons",
      lead:
        "No se busca una fórmula mágica, sino una máquina: juntar toda la data, encontrar señales que persistan y combinarlas con disciplina. Renaissance no ganó con una idea genial — ganó con muchas señales débiles, medidas sin autoengaño. Este es ese proceso, aplicado al mercado chileno con la data de Unholster.",
      byline:
        "Un ejemplo Capital Trade × Unholster · datos públicos reales, cruzados con la máquina de Unholster · construido en 6 días.",
      bg: "#0A1E4D",
      particles: { mode: "plume", color: "#266FE0", count: 560, opacity: 0.5, biasLeft: 0.5, biasY: 0.5 },
      keyFacts: [
        { value: "18.991", label: "transacciones de insiders analizadas" },
        { value: "6 días", label: "de trabajo, de la idea al motor" },
        { value: "Sharpe 1,19", label: "el factor momentum, validado sin look-ahead" },
      ],
    },
    blocks: [
      {
        type: "prose",
        id: "intro",
        html:
          '<h2 class="u-h2">El sueño Medallion, aterrizado</h2>' +
          "<p>El mejor fondo de la historia no adivinó el futuro. Recolectó <strong>toda la data que pudo</strong>, buscó patrones que persistieran y los combinó. La ventaja no fue una fórmula — fue la <strong>máquina</strong>.</p>" +
          "<p>Unholster ya tiene esa máquina de datos. Lo que sigue es apuntarla al mercado — y mostrar, paso a paso, cómo se arma el motor.</p>",
      },
      vis({
        id: "datos", title: "Los datos", subtitle: "Primero, recolectar toda la materia prima",
        source: "CMF · Bolsa de Santiago · fuentes Unholster", viewBox: "0 0 560 300", inner: DATOS,
        scenes: [S("En días armamos el corpus: <b>18.991</b> transacciones de insiders de la CMF, <b>18 años</b> de precios de 131 acciones, <b>1.881</b> hechos esenciales, estados financieros, y detrás las <b>~170 fuentes</b> de Unholster para saber quién es quién. Todo dato público real, cruzado.")],
      }),
      vis({
        id: "senal", title: "La primera señal", subtitle: "Cuando el holding de un director compra",
        source: "CMF art. 12/20 · event-study propio", viewBox: "0 0 560 300", inner: INSIDER,
        scenes: [
          S("Idea clásica del mercado: seguí a los que saben. La medimos con un event-study y salió un hallazgo <b>contraintuitivo</b>: el edge no está en el ejecutivo como persona — está en su <b>sociedad de inversión</b> acumulando. <b>+9,7%</b> sobre el mercado a 60 días, t = 6,4."),
          S("¿Y el ejecutivo comprando a título personal? <b>Nada.</b> La señal vive en el holding, no en la persona. Distinguir uno de otro ya obliga a cruzar identidad — justo lo que hace la máquina."),
        ],
      }),
      vis({
        id: "bandas", title: "Dónde está el edge", subtitle: "La compra moderada, no la grande",
        source: "Retorno abnormal 60d por banda de monto", viewBox: "0 0 560 300", inner: BANDAS,
        scenes: [
          S("Segundo filtro: ¿importa el tamaño de la compra? Uno esperaría que la compra <b>enorme</b> —la estructural— sea la que más dice."),
          S("Al revés: las grandes ya están priceadas. El dinero está en la compra <b>oportunista de $10–50 MM</b> — el director que ve algo a corto plazo y actúa. La data te dice dónde mirar."),
        ],
      }),
      vis({
        id: "rigor", title: "Abogado del diablo", subtitle: "Una señal no es una estrategia",
        source: "Backtest neto de costos · universo líquido", viewBox: "0 0 560 300", inner: RIGOR,
        scenes: [S("Acá casi todos se engañan. Una señal linda en el papel no es plata. Le descontamos costos, exigimos que sea transable y la medimos como <b>cartera de verdad</b>: de 20% a casi nada — es esparsa, queda 70% en caja. Veredicto honesto: el insider es una <b>alerta</b>, no un motor solo. Decirlo separa a un cuant de un vendedor.")],
      }),
      vis({
        id: "motor", title: "El motor real", subtitle: "Momentum, validado sin trampa",
        source: "Momentum 12-1 · point-in-time · walk-forward", viewBox: "0 0 560 300", inner: MOTOR,
        scenes: [S("Buscando en serio apareció el motor: <b>momentum</b> en el universo líquido chileno. Validado como se debe — universo <b>point-in-time</b> (sin mirar el futuro), reselección con solo el pasado, 16 años. Mostramos los <b>dos</b> números: el factor fuerte (Sharpe 1,19) y el honesto para capital (IR ~0,44). Nunca solo el bonito.")],
      }),
      vis({
        id: "bandit", title: "El corazón del modelo", subtitle: "No descartar: dejar que la data elija",
        source: "Asignador adaptativo (bandit) · IR reciente", viewBox: "0 0 560 300", inner: BANDIT,
        scenes: [S("El instinto es quedarse con el mejor factor y botar el resto. <b>Error.</b> Los premios rotan con el régimen y el arbitraje de información se agota por crowding. Cableamos <b>todas</b> las señales y un bandit las pondera por su desempeño reciente — nunca a cero. El adaptativo le gana a todo; la señal que quisimos botar aportó <b>34%</b> en su mejor tramo.")],
      }),
      vis({
        id: "hedge", title: "La ejecución", subtitle: "Aislar el alpha del mercado",
        source: "Libro momentum USD · short de ECH, 2011–26", viewBox: "0 0 560 300", inner: HEDGE,
        scenes: [
          S("El alpha es genuinamente <b>market-neutral</b>. Pero sin cubrir el beta, el libro sigue al mercado: drawdown de <b>−53%</b>. El problema no es la estrategia."),
          S("Al cubrirlo con un short del ETF de Chile, el drawdown se aplana a <b>−33%</b> y el Sharpe salta. El cuello de botella es la <b>plomería</b>: shortear en Chile es inviable a este tamaño; la ruta real es un <b>prime broker en EE.UU.</b>"),
        ],
      }),
      vis({
        id: "veredicto", title: "La máquina", subtitle: "La unión de dos mundos",
        source: "Capital Trade × Unholster", viewBox: "0 0 560 300", inner: VEREDICTO,
        scenes: [S("No vendemos una máquina de hacer plata probada. Construimos un <b>motor validado</b> y —más importante— una <b>fábrica de señales</b>: sumar el próximo candidato (value, la familia de los insiders, otra fuente) cuesta <b>horas</b>, no meses. Un motor cuant multi-factor, validado y honesto, en <b>6 días</b>. Ese es el potencial cuando se juntan los dos mundos.")],
      }),
      {
        type: "prose",
        id: "cierre",
        html:
          '<div class="u-endbox">' +
          '<div class="k">Y ahora</div>' +
          "<h3>Lo que falta no es research — es infraestructura</h3>" +
          "<p>El código está maduro. Los tres pendientes (factor value, sesgo de supervivencia, short real) convergen en <b style=\"color:#fff\">una</b> decisión operativa: abrir un prime broker en EE.UU. + acceso a un data vendor. Después, un piloto en vivo de 60–90 días antes de escalar.</p>" +
          '<div class="tag">Capital Trade pone el mercado y la estructura · Unholster pone la máquina · la unión pone el motor</div>' +
          "</div>" +
          '<div class="u-foot"><b>Capital Trade × Unholster</b> · documento de trabajo, uso interno. Todas las cifras salen de corridas reales y reproducibles sobre data pública. El “Sharpe 1,19” es el factor long-short bruto, no investable; el número para capital es el long-only (IR ~0,44). No constituye asesoría ni recomendación de inversión; rentabilidades pasadas no garantizan resultados futuros.</div>',
      },
    ],
  };
})();
