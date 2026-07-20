/**
 * AtlasProgressRace v0.2 — pixel-matched to AccessElectricityProgressScroller
 * Chunk: Brmmsw6q.js · CSS: AccessElectricityProgressScroller.DVNMGbcQ.css
 *
 * Origin behaviour (user-refs f_054–f_068):
 *  0  access_15 — red start-dots at 2015 for ALL countries; focus labels (16.6/29.0/52.5)
 *  1  access_23 — accessTween → 2023; progress stems + arrows ONLY for focus (or selected)
 *  2  progress  — speed colors on focus stems; continuous Speed-of-progress gradient;
 *                 all countries still show 2015 dots
 *  3  all       — stems+arrows for ALL; start dots remain; multi-select chips; hover labels
 *
 * SVG cells (line+path) render when: scene===3 OR iso ∈ selected (Se in Brmmsw6q).
 * Start dots always render (Pixi-equivalent via SVG circles).
 *
 * Mount once · accessTween 2s · path scale 2s · line stroke-width/opacity 2s
 * Depends: window.AtlasSVG
 */
(function (global) {
  const SPEED_COLORS = {
    regressing: "#701d57",
    standstill: "#8a969f",
    typical: "#ffdd92",
    fast: "#00a1c4",
  };
  // Sampled from origin frames (~dusty red start markers)
  const DOT = "#c45a64";
  const GREY = {
    grey300: "#8a969f",
    grey400: "#57626a",
    text: "#111111",
    tick: "#6a7781",
    grid: "#e8ecf0",
    rule: "#c41230",
  };
  const FOCUS_DEFAULT = ["ETH", "NGA", "COD"];
  const MARGIN = { top: 28, right: 24, bottom: 72, left: 20 };
  const TRI_R = 5;
  const DOT_R = 2.4;
  const TRANSITION_MS = 2000;
  const INSTANCES = new WeakMap();

  function ensureSVG() {
    if (!global.AtlasSVG) throw new Error("AtlasProgressRace needs AtlasSVG");
    return global.AtlasSVG;
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function hexToRgb(hex) {
    const h = hex.replace("#", "");
    const full =
      h.length === 3
        ? h
            .split("")
            .map((c) => c + c)
            .join("")
        : h;
    const n = parseInt(full, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function lerpHex(a, b, t) {
    const A = hexToRgb(a);
    const B = hexToRgb(b);
    const r = Math.round(A[0] + (B[0] - A[0]) * t);
    const g = Math.round(A[1] + (B[1] - A[1]) * t);
    const bl = Math.round(A[2] + (B[2] - A[2]) * t);
    return `rgb(${r},${g},${bl})`;
  }

  /** d3-scaleLinear domain([-1,0,1,2]).range([...]).clamp(true) */
  function speedColorScale(sp) {
    const domain = [-1, 0, 1, 2];
    const range = [
      SPEED_COLORS.regressing,
      SPEED_COLORS.standstill,
      SPEED_COLORS.typical,
      SPEED_COLORS.fast,
    ];
    const v = Math.max(domain[0], Math.min(domain[domain.length - 1], sp));
    for (let i = 0; i < domain.length - 1; i++) {
      if (v <= domain[i + 1] || i === domain.length - 2) {
        const t =
          domain[i + 1] === domain[i]
            ? 0
            : (v - domain[i]) / (domain[i + 1] - domain[i]);
        return lerpHex(range[i], range[i + 1], Math.max(0, Math.min(1, t)));
      }
    }
    return range[range.length - 1];
  }

  function trianglePath(improved, r = TRI_R) {
    if (improved) return `M${-r},${-r} L${r},0 L${-r},${r} Z`;
    return `M${r},${-r} L${r},${r} L${-r},0 Z`;
  }

  function prepareData(rows, names = {}) {
    const data = rows
      .map((r) => {
        const iso = r.iso3c || r.iso || r.ISO3 || r.code;
        const a2015 = +(r.access_2015 != null ? r.access_2015 : r.a2015);
        const a2023 = +(r.access_2023 != null ? r.access_2023 : r.a2023);
        return {
          iso,
          name: names[iso] || r.name || iso,
          a2015,
          a2023,
        };
      })
      .filter(
        (d) =>
          d.iso &&
          Number.isFinite(d.a2015) &&
          Number.isFinite(d.a2023) &&
          d.a2015 !== 100 &&
          d.a2023 !== 100
      );

    data.forEach((d) => {
      d.delta = d.a2023 - d.a2015;
      // RE: domain [-1,0,1,2] — annual-ish band; delta/15 matches focus colors
      d.speed = Math.max(-1, Math.min(2, d.delta / 15));
      d.improved = d.a2023 > d.a2015;
      d.access = d.a2015;
    });
    data.sort((a, b) => a.a2015 - b.a2015);
    return data;
  }

  function mount(container, options = {}) {
    const SVG = ensureSVG();
    const {
      rows = [],
      data: dataOpt = null,
      sceneIndex = 0,
      focus = FOCUS_DEFAULT,
      names = global.ATLAS_COUNTRY_NAMES || {},
      labels = {},
      transitionMs = TRANSITION_MS,
      reuse = true,
      forceRemount = false,
      height: heightOpt = null,
    } = options;

    const L = {
      progress_speed: labels.progress_speed || "Speed of progress",
      regression: labels.regression || "regression",
      standstill: labels.standstill || "standstill",
      slow: labels.slow || "slow",
      typical: labels.typical || "typical",
      fast: labels.fast || "fast",
      very_fast: labels.very_fast || "very fast",
      select_country: labels.select_country || "Select countries to highlight",
    };

    if (!container) throw new Error("container required");

    if (reuse && !forceRemount && INSTANCES.has(container)) {
      const inst = INSTANCES.get(container);
      inst.setScene(sceneIndex, { animate: options.animate !== false });
      return inst.api;
    }
    if (INSTANCES.has(container)) {
      try {
        INSTANCES.get(container).api.destroy();
      } catch (_) {}
      INSTANCES.delete(container);
    }

    const data = dataOpt
      ? prepareData(dataOpt, names)
      : prepareData(rows, names);
    if (!data.length) {
      container.innerHTML =
        '<div style="padding:24px;color:#aa0000">progress-race: no data</div>';
      return { updateScene() {}, destroy() {}, sceneIndex: 0 };
    }

    // selected = focus + user picks (origin G set)
    let selected = new Set(focus);
    let current = sceneIndex;
    let tweenRaf = null;
    const tweenFrom = new Map();
    const tweenTo = new Map();

    container.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-progress-race atlas-chart-root";
    const w = Math.max(360, container.clientWidth || 900);
    // Origin uses full sticky height — dense band of ~86 rows
    const naturalH = Math.max(
      480,
      Math.min(680, MARGIN.top + MARGIN.bottom + data.length * 5.6)
    );
    const h = heightOpt || Math.max(container.clientHeight || 0, naturalH);
    root.style.cssText = `position:relative;width:100%;height:${h}px;font-family:'Open Sans',system-ui,sans-serif;background:#fff;overflow:hidden`;
    container.appendChild(root);

    const style = document.createElement("style");
    style.textContent = `
      .atlas-progress-race line.progress {
        stroke-linecap: round;
        transition: opacity ${transitionMs}ms, stroke-width ${transitionMs}ms, stroke ${transitionMs}ms;
      }
      .atlas-progress-race path.arrow {
        transition: transform ${transitionMs}ms, fill ${transitionMs}ms, opacity ${transitionMs}ms;
        stroke: #fff;
        stroke-width: 1px;
        transform-origin: center;
        transform-box: fill-box;
      }
      .atlas-progress-race circle.start-dot {
        transition: opacity 600ms, fill 600ms;
      }
      .atlas-progress-race .cell.highlighted path.arrow,
      .atlas-progress-race .cell:hover path.arrow {
        stroke-width: 1.5px;
        stroke: #111;
      }
      .atlas-progress-race .cell text.country {
        opacity: 0;
        transition: opacity ${transitionMs}ms ease-out;
        pointer-events: none;
      }
      .atlas-progress-race .cell.highlighted text.country,
      .atlas-progress-race .cell:hover text.country {
        opacity: 1 !important;
        transition: opacity 0.5s ease-out;
      }
      .atlas-progress-race .speed-legend {
        position: absolute;
        bottom: 14px;
        left: 20px;
        z-index: 2;
        font-size: 11px;
        color: #111;
        transition: opacity 0.5s;
        pointer-events: none;
      }
      .atlas-progress-race .speed-legend .title {
        font-weight: 700;
        margin-bottom: 4px;
        font-size: 12px;
      }
      .atlas-progress-race .speed-legend .bar-wrap {
        position: relative;
        width: min(360px, 48vw);
        height: 12px;
      }
      .atlas-progress-race .speed-legend .bar {
        width: 100%;
        height: 12px;
        border-radius: 1px;
        background: linear-gradient(90deg,
          ${SPEED_COLORS.regressing} 0%,
          ${SPEED_COLORS.standstill} 28%,
          #c4b896 42%,
          ${SPEED_COLORS.typical} 55%,
          ${SPEED_COLORS.fast} 78%,
          #0086a8 100%);
      }
      .atlas-progress-race .speed-legend .ticks {
        display: flex;
        justify-content: space-between;
        margin-top: 4px;
        color: #57626a;
        font-size: 10px;
        font-weight: 600;
        width: min(360px, 48vw);
        letter-spacing: -0.01em;
      }
      .atlas-progress-race .speed-legend .ticks span {
        flex: 0 0 auto;
        white-space: nowrap;
      }
      .atlas-progress-race .mini-year-legend {
        position: absolute;
        bottom: 52px;
        left: 20px;
        z-index: 2;
        transition: opacity 0.5s;
        pointer-events: none;
      }
      .atlas-progress-race .chip-bar {
        position: absolute;
        top: 4px;
        left: 8px;
        right: 8px;
        z-index: 4;
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        align-items: center;
        transition: opacity 0.4s;
      }
      .atlas-progress-race .chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: #f1f5f9;
        border: 1px solid #cbd5e1;
        border-radius: 999px;
        padding: 3px 10px 3px 12px;
        font: 600 12px 'Open Sans', system-ui, sans-serif;
        color: #111;
      }
      .atlas-progress-race .chip button {
        border: 0; background: transparent; cursor: pointer;
        font-size: 14px; line-height: 1; color: #64748b; padding: 0 0 0 2px;
      }
      .atlas-progress-race .chip-bar select {
        font: 12px 'Open Sans', system-ui, sans-serif;
        padding: 4px 8px;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        max-width: 220px;
        background: #fff;
      }
      .atlas-progress-race.no-anim line.progress,
      .atlas-progress-race.no-anim path.arrow,
      .atlas-progress-race.no-anim .cell text.country,
      .atlas-progress-race.no-anim circle.start-dot {
        transition: none !important;
      }
    `;
    root.appendChild(style);

    // Multi-select chips (scene 3) — origin: Ethiopia × Nigeria × Congo…
    const chipBar = document.createElement("div");
    chipBar.className = "chip-bar";
    chipBar.style.opacity = "0";
    chipBar.style.pointerEvents = "none";
    root.appendChild(chipBar);

    // Continuous speed legend (scene ≥ 2)
    const speedLeg = document.createElement("div");
    speedLeg.className = "speed-legend";
    speedLeg.style.opacity = "0";
    speedLeg.innerHTML = `
      <div class="title">${L.progress_speed}</div>
      <div class="bar-wrap"><div class="bar"></div></div>
      <div class="ticks">
        <span>${L.regression}</span>
        <span>${L.standstill}</span>
        <span>${L.slow}</span>
        <span>${L.typical}</span>
        <span>${L.fast}</span>
        <span>${L.very_fast}</span>
      </div>`;
    root.appendChild(speedLeg);

    // Mini 2015→2023 glyph (scene ≥ 1)
    const miniYear = document.createElement("div");
    miniYear.className = "mini-year-legend";
    miniYear.style.opacity = "0";
    miniYear.innerHTML = `
      <svg width="180" height="28" viewBox="0 0 180 28" aria-hidden="true">
        <text x="0" y="10" fill="#111" font-size="11" font-weight="700" font-family="Open Sans,system-ui">2015</text>
        <text x="148" y="10" fill="#111" font-size="11" font-weight="700" font-family="Open Sans,system-ui">2023</text>
        <line x1="0" y1="20" x2="150" y2="20" stroke="${SPEED_COLORS.fast}" stroke-width="5" opacity="0.35" stroke-linecap="round"/>
        <path d="M145,15 L155,20 L145,25 Z" fill="${SPEED_COLORS.fast}"/>
      </svg>`;
    root.appendChild(miniYear);

    const svg = SVG.el(root, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.cssText = "display:block;width:100%;height:100%";

    const plotW = w - MARGIN.left - MARGIN.right;
    const plotH = h - MARGIN.top - MARGIN.bottom;
    const xScale = SVG.scaleLinear([0, 100], [0, plotW]);
    // d3 padding(1) ≈ points only; we use small padding for readable rows
    const yScale = SVG.scaleBand(
      data.map((d) => d.iso),
      [0, plotH],
      0.15
    );

    const gRoot = SVG.el(svg, "g", {
      transform: `translate(${MARGIN.left},${MARGIN.top})`,
    });

    // X grid + labels (origin: 0 25 50 75 100 — no % in ticks sometimes; we match live labels with bare numbers)
    [0, 25, 50, 75, 100].forEach((t) => {
      const x = xScale(t);
      SVG.el(gRoot, "line", {
        x1: x,
        x2: x,
        y1: 0,
        y2: plotH,
        stroke: GREY.grid,
        "stroke-width": 1,
        "stroke-dasharray": t === 0 || t === 100 ? "none" : "2,3",
      });
      SVG.el(gRoot, "text", {
        x,
        y: -8,
        "text-anchor": "middle",
        fill: GREY.tick,
        "font-size": 11,
        "font-weight": "600",
      }).textContent = String(t);
    });

    const gDots = SVG.el(gRoot, "g", { class: "start-dots" });
    const gRows = SVG.el(gRoot, "g", { class: "rows" });
    const rowEls = new Map();

    data.forEach((d) => {
      const y = yScale(d.iso) + yScale.bandwidth() / 2;

      // Always-on start marker at 2015 (Pixi-equivalent)
      const dot = SVG.el(gDots, "circle", {
        class: "start-dot",
        cx: xScale(d.a2015),
        cy: y,
        r: DOT_R,
        fill: DOT,
        opacity: "1",
      });

      const g = SVG.el(gRows, "g", {
        class: "row",
        "data-iso": d.iso,
      });

      const prog = SVG.el(g, "line", {
        class: "progress",
        x1: xScale(d.a2015),
        x2: xScale(d.a2015),
        y1: y,
        y2: y,
        stroke: GREY.grey300,
        "stroke-width": 0,
        opacity: "1",
      });

      const cell = SVG.el(g, "g", {
        class: "cell",
        transform: `translate(${xScale(d.a2015)},${y})`,
        style: "cursor:pointer",
      });

      const arrow = SVG.el(cell, "path", {
        class: "arrow",
        d: trianglePath(d.improved),
        fill: GREY.grey400,
        transform: "scale(0)",
        opacity: "0",
      });

      SVG.el(cell, "line", {
        class: "hit",
        x1: 0,
        x2: 0,
        y1: 0,
        y2: 0,
        stroke: "transparent",
        "stroke-width": 10,
        "pointer-events": "stroke",
      });

      const lab = SVG.el(cell, "text", {
        class: "country small end",
        x: 10,
        y: 4,
        "text-anchor": "start",
        fill: GREY.text,
        "font-size": 11,
        "font-weight": "700",
      });
      lab.textContent = `${d.name} ${d.a2015.toFixed(1)}%`;

      rowEls.set(d.iso, { g, prog, cell, arrow, lab, dot, y, d });
    });

    function rebuildChips() {
      chipBar.innerHTML = "";
      const order = [...selected].filter((iso) => data.some((d) => d.iso === iso));
      // keep focus order first then others
      order.sort((a, b) => {
        const ia = FOCUS_DEFAULT.indexOf(a);
        const ib = FOCUS_DEFAULT.indexOf(b);
        if (ia >= 0 && ib >= 0) return ia - ib;
        if (ia >= 0) return -1;
        if (ib >= 0) return 1;
        return a.localeCompare(b);
      });
      order.forEach((iso) => {
        const d = data.find((x) => x.iso === iso);
        if (!d) return;
        const chip = document.createElement("span");
        chip.className = "chip";
        chip.innerHTML = `<span>${d.name}</span>`;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.setAttribute("aria-label", `Remove ${d.name}`);
        btn.textContent = "×";
        btn.addEventListener("click", () => {
          selected.delete(iso);
          // keep at least empty set ok
          rebuildChips();
          paintAt(current);
        });
        chip.appendChild(btn);
        chipBar.appendChild(chip);
      });
      const sel = document.createElement("select");
      sel.innerHTML =
        `<option value="">${L.select_country}</option>` +
        data
          .filter((d) => !selected.has(d.iso))
          .map((d) => `<option value="${d.iso}">${d.name}</option>`)
          .join("");
      sel.addEventListener("change", () => {
        if (sel.value) {
          selected.add(sel.value);
          rebuildChips();
          paintAt(current);
        }
      });
      chipBar.appendChild(sel);
    }
    rebuildChips();

    function showCell(iso, idx) {
      // Brmmsw6q Se: index==3 || G.includes
      return idx === 3 || selected.has(iso);
    }

    function colorFor(d, idx) {
      if (idx >= 2) return speedColorScale(d.speed);
      return selected.has(d.iso) ? GREY.grey400 : GREY.grey300;
    }

    function applyLabels(idx) {
      rowEls.forEach((el) => {
        const d = el.d;
        const endVal = idx === 0 ? d.a2015 : d.a2023;
        const showVal = endVal;
        if (idx === 0) {
          el.lab.setAttribute("x", "8");
          el.lab.setAttribute("text-anchor", "start");
        } else {
          const left = endVal > 75;
          el.lab.setAttribute("x", left ? "-8" : "8");
          el.lab.setAttribute("text-anchor", left ? "end" : "start");
        }
        el.lab.textContent = `${d.name} ${(+showVal).toFixed(1)}%`;
        el.lab.setAttribute("fill", idx >= 2 ? colorFor(d, idx) : GREY.text);
      });
    }

    function paintAt(idx) {
      rowEls.forEach((el) => {
        const d = el.d;
        const y = el.y;
        const x0 = xScale(d.a2015);
        // head follows tweened access for focus stems; for scene 0 stays at 2015
        const xHead = xScale(d.access);
        const col = colorFor(d, idx);
        const visible = showCell(d.iso, idx);
        const isHi = selected.has(d.iso);

        // Start dots: ALWAYS visible at 2015 for every country (origin frame truth)
        el.dot.setAttribute("cx", String(x0));
        el.dot.setAttribute("cy", String(y));
        el.dot.setAttribute("fill", DOT);
        el.dot.setAttribute("opacity", idx === 0 ? "0.95" : visible ? "1" : "0.55");
        el.dot.setAttribute("r", String(idx === 0 ? DOT_R + 0.3 : DOT_R));
        el.dot.style.display = "";

        // Cell visibility: scene 0 = focus labels only (stems off); dots always drawn outside cells.
        // Origin keeps ALL start dots visible; stems/labels only for focus until scene 3.
        el.g.style.display = visible || (idx === 0 && isHi) ? "" : "none";
        if (idx === 0) {
          el.g.style.display = isHi ? "" : "none";
        }

        if (idx > 0 && visible) {
          const xEnd = xHead + (d.improved ? -4 : 4);
          el.prog.setAttribute("x1", String(x0));
          el.prog.setAttribute("x2", String(xEnd));
          el.prog.setAttribute("stroke-width", "5");
          el.prog.setAttribute("opacity", "0.3");
          el.prog.setAttribute("stroke", idx >= 2 ? col : GREY.grey300);
        } else {
          el.prog.setAttribute("x1", String(x0));
          el.prog.setAttribute("x2", String(x0));
          el.prog.setAttribute("stroke-width", "0");
          el.prog.setAttribute("opacity", "1");
        }

        // Head position: scene 0 at 2015; later at tweened
        const headX = idx === 0 ? x0 : xHead;
        el.cell.setAttribute("transform", `translate(${headX},${y})`);
        el.cell.classList.toggle("highlighted", isHi);

        const showArrow = idx > 0 && visible;
        el.arrow.setAttribute("transform", showArrow ? "scale(1)" : "scale(0)");
        el.arrow.setAttribute("opacity", showArrow ? "1" : "0");
        el.arrow.setAttribute("fill", idx >= 2 ? col : GREY.grey400);
        el.arrow.setAttribute("d", trianglePath(d.improved));

        const hit = el.cell.querySelector("line.hit");
        if (hit) {
          hit.setAttribute("x1", String(x0 - headX));
          hit.setAttribute("x2", "0");
        }
      });

      miniYear.style.opacity = idx > 0 ? "1" : "0";
      speedLeg.style.opacity = idx > 1 ? "1" : "0";
      chipBar.style.opacity = idx === 3 ? "1" : "0";
      chipBar.style.pointerEvents = idx === 3 ? "auto" : "none";

      // top padding for chips
      if (idx === 3) {
        gRoot.setAttribute(
          "transform",
          `translate(${MARGIN.left},${MARGIN.top + 18})`
        );
      } else {
        gRoot.setAttribute(
          "transform",
          `translate(${MARGIN.left},${MARGIN.top})`
        );
      }

      applyLabels(idx);
    }

    function stopTween() {
      if (tweenRaf) {
        cancelAnimationFrame(tweenRaf);
        tweenRaf = null;
      }
    }

    function runTween(idx, duration) {
      stopTween();
      const targetKey = idx === 0 ? "a2015" : "a2023";
      data.forEach((d) => {
        tweenFrom.set(d.iso, d.access);
        tweenTo.set(d.iso, d[targetKey]);
      });
      if (duration <= 0) {
        data.forEach((d) => {
          d.access = tweenTo.get(d.iso);
        });
        paintAt(idx);
        return;
      }
      const t0 = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - t0) / duration);
        const e = easeInOutCubic(t);
        data.forEach((d) => {
          const a = tweenFrom.get(d.iso);
          const b = tweenTo.get(d.iso);
          d.access = a + (b - a) * e;
        });
        paintAt(idx);
        if (t < 1) tweenRaf = requestAnimationFrame(tick);
        else {
          tweenRaf = null;
          data.forEach((d) => {
            d.access = tweenTo.get(d.iso);
          });
          paintAt(idx);
        }
      };
      tweenRaf = requestAnimationFrame(tick);
    }

    function setScene(idx, { animate = true } = {}) {
      const prev = current;
      current = idx;
      stopTween();

      if (!animate) {
        root.classList.add("no-anim");
        data.forEach((d) => {
          d.access = idx === 0 ? d.a2015 : d.a2023;
        });
        paintAt(idx);
        void root.offsetHeight;
        requestAnimationFrame(() => root.classList.remove("no-anim"));
        return;
      }

      const sameEndpoint = (prev > 0 && idx > 0) || (prev === 0 && idx === 0);
      if (sameEndpoint) {
        data.forEach((d) => {
          d.access = idx === 0 ? d.a2015 : d.a2023;
        });
        paintAt(idx);
        return;
      }

      if (prev === 0 && idx > 0) {
        data.forEach((d) => {
          d.access = d.a2015;
        });
        paintAt(0);
        void root.offsetHeight;
        requestAnimationFrame(() => {
          // kick CSS scale/stroke then tween x
          paintAt(idx);
          runTween(idx, transitionMs);
        });
        return;
      }

      runTween(0, transitionMs);
    }

    data.forEach((d) => {
      d.access = sceneIndex === 0 ? d.a2015 : d.a2023;
    });
    setScene(sceneIndex, { animate: false });

    const api = {
      root,
      svg,
      updateScene(i, opts) {
        setScene(i, opts);
      },
      setScene,
      setFocus(isos) {
        selected = new Set(isos);
        rebuildChips();
        paintAt(current);
      },
      destroy() {
        stopTween();
        INSTANCES.delete(container);
        container.innerHTML = "";
      },
      get sceneIndex() {
        return current;
      },
      get data() {
        return data;
      },
    };
    INSTANCES.set(container, { api, setScene });
    return api;
  }

  global.AtlasProgressRace = {
    mount,
    prepareData,
    version: "0.2.0",
    SPEED_COLORS,
    FOCUS: FOCUS_DEFAULT,
  };
  global.AtlasLibrary = global.AtlasLibrary || {};
  global.AtlasLibrary.ProgressRace = global.AtlasProgressRace;
})(typeof window !== "undefined" ? window : globalThis);
