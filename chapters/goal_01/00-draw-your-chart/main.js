/**
 * draw_your_chart — interactive guess of global extreme poverty 1950→2025
 * Reverse-engineered from DrRx8BK9.js
 */
window.AtlasReplica = {
  ready: true,
  isStub: false,
  async render(_scene, ctx) {
    const { chartEl, hidePlaceholder, config } = ctx;
    hidePlaceholder();
    const rows = await AtlasLoad.csv("./data/01_data_global_poverty.csv");
    const actual = rows
      .map((r) => ({ year: +r.year, rate: +r.rate }))
      .filter((d) => Number.isFinite(d.year) && Number.isFinite(d.rate))
      .sort((a, b) => a.year - b.year);

    const PURPLE = "#be62d0";
    const GUESS = "#34A7F2";
    const START = "#b143c7";

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText =
      "position:relative;width:100%;height:100%;font-family:'Open Sans',system-ui,sans-serif;display:flex;flex-direction:column;background:#fff";
    chartEl.appendChild(root);

    const instr = document.createElement("div");
    instr.style.cssText =
      "margin:8px 12px 0;padding:10px 12px;border:1px solid #EBEEF4;border-radius:4px;font-size:13px;line-height:1.55;color:#111;background:#fafafa";
    instr.innerHTML =
      config?.instructions ||
      'Click and drag to draw a line with your best guess, starting from the <span style="background:#b143c7;color:#fff;padding:0 4px">global poverty rate</span> in 1950 on the left';
    root.appendChild(instr);

    const plotWrap = document.createElement("div");
    plotWrap.style.cssText = "flex:1;position:relative;min-height:360px";
    root.appendChild(plotWrap);

    const bar = document.createElement("div");
    bar.style.cssText = "display:flex;gap:8px;padding:8px 12px;align-items:center;flex-wrap:wrap";
    const btnDone = document.createElement("button");
    btnDone.textContent = config?.done_button || "Done, show my result";
    btnDone.style.cssText =
      "font:600 13px Open Sans,system-ui;padding:8px 14px;border:0;border-radius:4px;background:#081079;color:#fff;cursor:pointer";
    const btnShow = document.createElement("button");
    btnShow.textContent = config?.show_data_button || "Just show the data";
    btnShow.style.cssText =
      "font:600 13px Open Sans,system-ui;padding:8px 14px;border:1px solid #cbd5e1;border-radius:4px;background:#fff;cursor:pointer";
    const btnReset = document.createElement("button");
    btnReset.textContent = config?.reset || "Reset";
    btnReset.style.cssText = btnShow.style.cssText;
    bar.append(btnDone, btnShow, btnReset);
    root.appendChild(bar);

    const resultEl = document.createElement("div");
    resultEl.style.cssText = "padding:0 12px 10px;font-size:13px;line-height:1.5;color:#111;min-height:1.5em";
    root.appendChild(resultEl);

    const w = plotWrap.clientWidth || 860;
    const h = plotWrap.clientHeight || 400;
    const margin = { top: 24, right: 200, bottom: 40, left: 52 };
    const svg = AtlasSVG.el(plotWrap, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.cssText = "width:100%;height:100%;display:block;touch-action:none";

    const xScale = AtlasSVG.scaleLinear([1950, 2025], [margin.left, w - margin.right]);
    const yScale = AtlasSVG.scaleLinear([0, 100], [h - margin.bottom, margin.top]);

    // grid + axes
    [0, 25, 50, 75, 100].forEach((t) => {
      AtlasSVG.el(svg, "line", {
        x1: margin.left, x2: w - margin.right, y1: yScale(t), y2: yScale(t), stroke: "#f1f5f9",
      });
      AtlasSVG.el(svg, "text", {
        x: margin.left - 8, y: yScale(t) + 4, "text-anchor": "end",
        fill: "#6a7781", "font-size": 11,
      }).textContent = t + "%";
    });
    [1950, 1970, 1990, 2010, 2025].forEach((yr) => {
      AtlasSVG.el(svg, "text", {
        x: xScale(yr), y: h - margin.bottom + 20, "text-anchor": "middle",
        fill: "#6a7781", "font-size": 12, "font-weight": "600",
      }).textContent = String(yr);
    });
    AtlasSVG.el(svg, "text", {
      x: 12, y: margin.top - 8, fill: "#6a7781", "font-size": 11,
    }).textContent = `${config?.y_axis_title || "Poverty rate"} (${config?.y_axis_units || "%"})`;

    // start marker 1950
    const start = actual[0];
    AtlasSVG.el(svg, "circle", {
      cx: xScale(start.year), cy: yScale(start.rate), r: 6,
      fill: START, stroke: "#fff", "stroke-width": 2,
    });
    AtlasSVG.el(svg, "text", {
      x: xScale(start.year) + 10, y: yScale(start.rate) + 4,
      fill: START, "font-size": 12, "font-weight": "700",
    }).textContent = `${start.rate}% · 1950`;

    const guessPath = AtlasSVG.el(svg, "path", {
      fill: "none", stroke: GUESS, "stroke-width": 3, "stroke-linecap": "round", "stroke-linejoin": "round",
    });
    const actualPath = AtlasSVG.el(svg, "path", {
      fill: "none", stroke: PURPLE, "stroke-width": 3, "stroke-linecap": "round",
      opacity: 0,
    });
    actualPath.setAttribute(
      "d",
      actual.map((p, i) => `${i ? "L" : "M"}${xScale(p.year)},${yScale(p.rate)}`).join(" ")
    );

    // interactive layer
    const hit = AtlasSVG.el(svg, "rect", {
      x: margin.left, y: margin.top,
      width: w - margin.left - margin.right,
      height: h - margin.top - margin.bottom,
      fill: "transparent", style: "cursor:crosshair",
    });

    let drawing = false;
    let guess = [{ year: start.year, rate: start.rate }];
    let revealed = false;

    const updateGuess = () => {
      const d = guess
        .sort((a, b) => a.year - b.year)
        .map((p, i) => `${i ? "L" : "M"}${xScale(p.year)},${yScale(p.rate)}`)
        .join(" ");
      guessPath.setAttribute("d", d);
      if (guess.at(-1).year >= 2020) {
        instr.innerHTML =
          config?.done ||
          "Click the button to see your result. You can still adjust your guess";
      } else if (guess.length > 3) {
        instr.innerHTML =
          config?.encouragement ||
          "Keep going! Draw your guess all the way to 2025 on the right";
      }
    };

    const ptFromEvent = (ev) => {
      const rect = svg.getBoundingClientRect();
      const sx = ((ev.clientX - rect.left) / rect.width) * w;
      const sy = ((ev.clientY - rect.top) / rect.height) * h;
      const year = Math.max(1950, Math.min(2025, xScale.invert(sx)));
      const rate = Math.max(0, Math.min(100, yScale.invert(sy)));
      return { year, rate };
    };

    const addPoint = (p) => {
      // keep monotonic in year; replace nearby
      guess = guess.filter((g) => g.year < p.year - 0.4 || g.year > p.year + 0.4);
      guess.push(p);
      if (!guess.find((g) => g.year === 1950)) guess.unshift({ year: start.year, rate: start.rate });
      updateGuess();
    };

    hit.addEventListener("pointerdown", (ev) => {
      if (revealed) return;
      drawing = true;
      hit.setPointerCapture(ev.pointerId);
      addPoint(ptFromEvent(ev));
    });
    hit.addEventListener("pointermove", (ev) => {
      if (!drawing || revealed) return;
      addPoint(ptFromEvent(ev));
    });
    hit.addEventListener("pointerup", () => { drawing = false; });
    hit.addEventListener("pointerleave", () => { drawing = false; });

    const score = () => {
      // mean absolute error vs actual at integer years covered by guess
      const gMap = new Map();
      const sorted = [...guess].sort((a, b) => a.year - b.year);
      // interpolate guess onto actual years
      let err = 0, n = 0;
      actual.forEach((a) => {
        if (a.year < sorted[0].year || a.year > sorted.at(-1).year) return;
        // linear interp
        let i = 0;
        while (i < sorted.length - 1 && sorted[i + 1].year < a.year) i++;
        const a0 = sorted[i], a1 = sorted[Math.min(i + 1, sorted.length - 1)];
        const t = a1.year === a0.year ? 0 : (a.year - a0.year) / (a1.year - a0.year);
        const g = a0.rate + t * (a1.rate - a0.rate);
        err += Math.abs(g - a.rate);
        n++;
      });
      return n ? err / n : 99;
    };

    const reveal = (scored) => {
      revealed = true;
      actualPath.setAttribute("opacity", "1");
      // end labels
      const lastA = actual.at(-1);
      AtlasSVG.el(svg, "text", {
        x: xScale(lastA.year) + 8, y: yScale(lastA.rate) + 4,
        fill: PURPLE, "font-size": 12, "font-weight": "700",
      }).textContent = `Global ${lastA.rate}%`;
      if (scored && guess.length > 2) {
        const mae = score();
        let msg;
        if (mae < 3) msg = config?.good_result;
        else if (mae < 8) msg = config?.ok_result;
        else if (mae < 15) msg = config?.hm_result;
        else msg = config?.poor_result;
        msg = (msg || "Your guess was on average {result} pp off.")
          .replace("{result}", (Math.round(mae * 10) / 10).toString());
        resultEl.innerHTML = msg;
      } else {
        resultEl.innerHTML =
          `<span style="background:${PURPLE};color:#fff;padding:0 4px">Global poverty rate</span> fell from ~${start.rate}% in 1950 to ~${lastA.rate}% today.`;
      }
      // legend
      const leg = document.createElement("div");
      leg.style.cssText = "position:absolute;right:16px;top:24px;font-size:12px;display:flex;flex-direction:column;gap:6px";
      leg.innerHTML = `
        <span><i style="display:inline-block;width:16px;height:3px;background:${GUESS};margin-right:6px;vertical-align:middle"></i>Your guess</span>
        <span><i style="display:inline-block;width:16px;height:3px;background:${PURPLE};margin-right:6px;vertical-align:middle"></i>Global poverty rate</span>`;
      plotWrap.appendChild(leg);
    };

    btnDone.addEventListener("click", () => reveal(true));
    btnShow.addEventListener("click", () => reveal(false));
    btnReset.addEventListener("click", () => {
      revealed = false;
      guess = [{ year: start.year, rate: start.rate }];
      updateGuess();
      actualPath.setAttribute("opacity", "0");
      resultEl.innerHTML = "";
      instr.innerHTML = config?.instructions || instr.innerHTML;
      // remove end labels/legends (re-render simple)
      location.reload();
    });
  },
};
