/**
 * AtlasUrbanSkillSwarm
 * Specialization of jobs by skill (or occupation) × urban/rural.
 * Each dot = economy; x = specialization index (1 = proportional).
 *
 * Scenes (skill levels):
 *  0 all skills
 *  1 highlight country (default IDN)
 *  2 focus medium (L2)
 *  3 focus high (L3-4)
 *  4 low+medium emphasis
 */
(function (global) {
  const INSTANCES = new WeakMap();

  const SKILL_META = {
    OCU_SKILL_L1: { label: "Low skill", order: 0 },
    OCU_SKILL_L2: { label: "Medium skill", order: 1 },
    "OCU_SKILL_L3-4": { label: "High skill", order: 2 },
  };

  const URBAN = (global.WB_COLORS && global.WB_COLORS.urban) || "#6D88D1";
  const RURAL = (global.WB_COLORS && global.WB_COLORS.rural) || "#54AE89";

  function skillLabel(code) {
    if (SKILL_META[code]) return SKILL_META[code].label;
    // occupation codes OCU_ISCO08_n
    const m = String(code).match(/OCU_ISCO08_(\d+)/);
    if (m) return "ISCO " + m[1];
    return String(code).replace(/^OCU_/, "");
  }

  function packBeeswarm(values, xScale, yCenter, r) {
    // values: [{v, ...}] sorted
    if (global.Beeswarm) {
      const items = values.map((d) => d);
      const bs = new global.Beeswarm(items, r, (d) => xScale(d.v));
      const placed = bs.calculateYPositions();
      return placed.map((p) => ({
        ...p.datum,
        x: p.x,
        y: yCenter + (p.y || 0),
      }));
    }
    // fallback: simple jitter
    return values.map((d, i) => ({
      ...d,
      x: xScale(d.v),
      y: yCenter + ((i % 7) - 3) * (r * 0.9),
    }));
  }

  function mount(container, options = {}) {
    if (!container) throw new Error("container required");

    const {
      rows = [],
      sceneIndex = 0,
      highlightIso = "IDN",
      mode = "skill", // skill | occupation
      height: heightOpt = null,
      reuse = true,
      forceRemount = false,
    } = options;

    if (reuse && !forceRemount && INSTANCES.has(container)) {
      const inst = INSTANCES.get(container);
      inst.setScene(sceneIndex);
      return inst.api;
    }
    if (INSTANCES.has(container)) {
      try {
        INSTANCES.get(container).api.destroy();
      } catch (_) {}
      INSTANCES.delete(container);
    }

    const NAMES = global.ATLAS_COUNTRY_NAMES || {};
    const data = (rows || [])
      .map((r) => ({
        iso: String(r.iso3c || r.code || "").toUpperCase(),
        skill: r.skill,
        group: String(r.group || "").toLowerCase(),
        v: +r.value,
        name: NAMES[r.iso3c] || r.iso3c,
      }))
      .filter((d) => Number.isFinite(d.v) && d.iso && d.skill);

    // skill order
    let skills = [...new Set(data.map((d) => d.skill))];
    if (mode === "skill") {
      skills.sort(
        (a, b) =>
          (SKILL_META[a]?.order ?? 99) - (SKILL_META[b]?.order ?? 99)
      );
    } else {
      skills.sort();
      // occupation: show a manageable subset if huge
      if (skills.length > 8) skills = skills.slice(0, 8);
    }

    container.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-urban-skill-swarm atlas-chart-root";
    const H = heightOpt || Math.max(440, container.clientHeight || 480);
    root.style.cssText = `position:relative;width:100%;height:${H}px;font-family:'Open Sans',system-ui,sans-serif;background:#fff`;
    container.appendChild(root);

    const header = document.createElement("div");
    header.style.cssText =
      "position:absolute;left:12px;top:8px;right:12px;z-index:2;font-size:13px;font-weight:700;color:#111";
    root.appendChild(header);

    const leg = document.createElement("div");
    leg.style.cssText =
      "position:absolute;right:12px;top:8px;z-index:2;display:flex;gap:12px;font-size:11px;font-weight:600";
    leg.innerHTML = `<span><i style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${URBAN};margin-right:4px"></i>Urban</span>
      <span><i style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${RURAL};margin-right:4px"></i>Rural</span>`;
    root.appendChild(leg);

    const plot = document.createElement("div");
    plot.style.cssText = "position:absolute;inset:36px 8px 32px 8px";
    root.appendChild(plot);

    const note = document.createElement("div");
    note.style.cssText =
      "position:absolute;left:12px;bottom:8px;font-size:11px;color:#6a7781;font-weight:600";
    note.textContent = "Specialization index · 1 = proportional to overall employment";
    root.appendChild(note);

    const inst = { root, data, skills, highlightIso, mode, header, plot, note };

    function paint(idx) {
      const w = plot.clientWidth || 900;
      const h = plot.clientHeight || 400;
      plot.innerHTML = "";
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      svg.style.cssText = "width:100%;height:100%";
      plot.appendChild(svg);

      const margin = { top: 8, right: 16, bottom: 28, left: 100 };
      const xMin = 0;
      const xMax = Math.min(
        4,
        Math.max(2.2, ...inst.data.map((d) => d.v)) * 1.05
      );
      const xScale = (global.AtlasSVG && global.AtlasSVG.scaleLinear)
        ? global.AtlasSVG.scaleLinear([xMin, xMax], [margin.left, w - margin.right])
        : (v) =>
            margin.left +
            ((v - xMin) / (xMax - xMin)) * (w - margin.left - margin.right);

      // which skills visible
      let showSkills = inst.skills.slice();
      if (idx === 2) showSkills = inst.skills.filter((s) => /L2|_2$/.test(s) || s.includes("L2"));
      if (idx === 3) showSkills = inst.skills.filter((s) => /L3|L3-4|_1$/.test(s) || s.includes("L3"));
      // for skill mode high is L3-4
      if (idx === 3 && inst.mode === "skill") {
        showSkills = inst.skills.filter((s) => s.includes("L3"));
      }
      if (idx === 2 && inst.mode === "skill") {
        showSkills = inst.skills.filter((s) => s.includes("L2"));
      }
      if (idx === 4 && inst.mode === "skill") {
        showSkills = inst.skills.filter((s) => s.includes("L1") || s.includes("L2"));
      }
      if (!showSkills.length) showSkills = inst.skills.slice();

      const bandH = (h - margin.top - margin.bottom) / showSkills.length;

      // grid + ref line at 1
      const refX = xScale(1);
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", refX);
      line.setAttribute("x2", refX);
      line.setAttribute("y1", margin.top);
      line.setAttribute("y2", h - margin.bottom);
      line.setAttribute("stroke", "#94a3b8");
      line.setAttribute("stroke-dasharray", "4 3");
      line.setAttribute("stroke-width", "1.5");
      svg.appendChild(line);
      const refLab = document.createElementNS("http://www.w3.org/2000/svg", "text");
      refLab.setAttribute("x", refX + 4);
      refLab.setAttribute("y", margin.top + 10);
      refLab.setAttribute("fill", "#6a7781");
      refLab.setAttribute("font-size", "10");
      refLab.setAttribute("font-weight", "700");
      refLab.textContent = "1.0";
      svg.appendChild(refLab);

      [0.5, 1, 1.5, 2, 2.5].forEach((t) => {
        if (t > xMax) return;
        const tx = document.createElementNS("http://www.w3.org/2000/svg", "text");
        tx.setAttribute("x", xScale(t));
        tx.setAttribute("y", h - 8);
        tx.setAttribute("text-anchor", "middle");
        tx.setAttribute("fill", "#6a7781");
        tx.setAttribute("font-size", "11");
        tx.setAttribute("font-weight", "600");
        tx.textContent = String(t);
        svg.appendChild(tx);
      });

      const r = showSkills.length > 4 ? 2.6 : 3.2;
      showSkills.forEach((sk, si) => {
        const y0 = margin.top + si * bandH;
        const yMid = y0 + bandH / 2;
        // label
        const lab = document.createElementNS("http://www.w3.org/2000/svg", "text");
        lab.setAttribute("x", margin.left - 8);
        lab.setAttribute("y", yMid + 4);
        lab.setAttribute("text-anchor", "end");
        lab.setAttribute("fill", "#111");
        lab.setAttribute("font-size", "12");
        lab.setAttribute("font-weight", "700");
        lab.textContent = skillLabel(sk);
        svg.appendChild(lab);

        // subtle band
        const band = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        band.setAttribute("x", margin.left);
        band.setAttribute("y", y0 + 4);
        band.setAttribute("width", w - margin.left - margin.right);
        band.setAttribute("height", bandH - 8);
        band.setAttribute("fill", si % 2 ? "#f8fafc" : "#ffffff");
        svg.insertBefore(band, svg.firstChild);

        ["urban", "rural"].forEach((grp, gi) => {
          const subset = inst.data
            .filter((d) => d.skill === sk && d.group === grp)
            .map((d) => ({ ...d }))
            .sort((a, b) => a.v - b.v);
          // offset urban slightly above rural track within band
          const yCenter = yMid + (grp === "urban" ? -bandH * 0.14 : bandH * 0.14);
          const placed = packBeeswarm(subset, xScale, yCenter, r);
          placed.forEach((p) => {
            let opacity = 0.75;
            let rr = r;
            let stroke = "#fff";
            if (idx === 1) {
              // highlight one country
              if (p.iso === inst.highlightIso) {
                opacity = 1;
                rr = r + 2.5;
                stroke = "#111";
              } else {
                opacity = 0.18;
              }
            } else if (idx >= 2 && idx <= 3) {
              opacity = 0.85;
            }
            const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            c.setAttribute("cx", p.x);
            c.setAttribute("cy", p.y);
            c.setAttribute("r", rr);
            c.setAttribute("fill", grp === "urban" ? URBAN : RURAL);
            c.setAttribute("opacity", opacity);
            c.setAttribute("stroke", stroke);
            c.setAttribute("stroke-width", p.iso === inst.highlightIso && idx === 1 ? 1.2 : 0.5);
            svg.appendChild(c);
            if (idx === 1 && p.iso === inst.highlightIso) {
              const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
              t.setAttribute("x", p.x + 6);
              t.setAttribute("y", p.y - 6);
              t.setAttribute("fill", "#111");
              t.setAttribute("font-size", "10");
              t.setAttribute("font-weight", "700");
              t.textContent = p.name || p.iso;
              svg.appendChild(t);
            }
          });
        });
      });

      // header text
      const titles = [
        "Each dot is an economy · urban vs rural specialization",
        `Highlight: ${NAMES[inst.highlightIso] || inst.highlightIso}`,
        "Medium-skill jobs",
        "High-skill jobs — strongest urban contrast",
        "Low- and medium-skill jobs",
      ];
      header.textContent = titles[Math.min(idx, titles.length - 1)];
    }

    const api = {
      setScene(i) {
        paint(i || 0);
      },
      updateScene(i) {
        paint(i || 0);
      },
      destroy() {
        INSTANCES.delete(container);
        container.innerHTML = "";
      },
    };
    INSTANCES.set(container, { ...inst, api, setScene: api.setScene });
    paint(sceneIndex || 0);
    return api;
  }

  global.AtlasUrbanSkillSwarm = {
    mount,
    SKILL_META,
    version: "1.0.0",
  };
})(typeof window !== "undefined" ? window : globalThis);
