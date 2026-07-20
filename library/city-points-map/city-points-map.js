/**
 * AtlasCityPointsMap
 * World cities as proportional points (Atlas city_map narrative).
 * Data: city_ids (id,name,iso3c,lat,lng) + city_values (id,year,value=pop)
 * Scenes: year 2000 → 2025 → 2050 focus megacities → mid-size growth
 */
(function (global) {
  const INSTANCES = new WeakMap();
  const YEARS = [2000, 2025, 2050];
  const MEGA = 10_000_000;
  const LARGE = 1_000_000;

  function project(lng, lat, w, h, margin) {
    // equirectangular, clip Antarctica slightly
    const x =
      margin.left +
      ((lng + 180) / 360) * (w - margin.left - margin.right);
    const y =
      margin.top +
      ((90 - lat) / 150) * (h - margin.top - margin.bottom);
    return { x, y };
  }

  function mount(container, options = {}) {
    if (!container) throw new Error("container required");
    const {
      cities = [], // {id, name, lat, lng, iso3c}
      values = [], // {id, year, value}
      sceneIndex = 0,
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

    const byId = new Map();
    cities.forEach((c) => {
      const id = String(c.id);
      const lat = +c.lat,
        lng = +c.lng;
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      byId.set(id, {
        id,
        name: c.name,
        iso: c.iso3c,
        lat,
        lng,
        byYear: {},
      });
    });
    values.forEach((v) => {
      const id = String(v.id);
      const y = +v.year;
      const pop = +v.value;
      if (!byId.has(id) || !Number.isFinite(pop)) return;
      byId.get(id).byYear[y] = pop;
    });
    const all = [...byId.values()];

    container.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-city-points atlas-chart-root";
    const H = heightOpt || Math.max(440, container.clientHeight || 480);
    root.style.cssText = `position:relative;width:100%;height:${H}px;font-family:'Open Sans',system-ui,sans-serif;background:#0b1220`;
    container.appendChild(root);

    const header = document.createElement("div");
    header.style.cssText =
      "position:absolute;z-index:2;left:12px;top:10px;padding:8px 12px;background:rgba(15,23,42,0.9);color:#e2e8f0;font-size:13px;font-weight:700;border-left:4px solid #87b147;max-width:70%";
    root.appendChild(header);

    const meta = document.createElement("div");
    meta.style.cssText =
      "position:absolute;z-index:2;left:12px;bottom:10px;font-size:11px;color:#94a3b8;font-weight:600";
    root.appendChild(meta);

    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%";
    root.appendChild(canvas);

    function yearFor(idx) {
      if (idx <= 0) return 2000;
      if (idx === 1) return 2025;
      return 2050; // 2 and 3
    }

    function paint(idx) {
      const w = root.clientWidth || 900;
      const h = root.clientHeight || H;
      const dpr = Math.min(global.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // ocean / land simple
      ctx.fillStyle = "#0b1220";
      ctx.fillRect(0, 0, w, h);
      // graticule faint
      ctx.strokeStyle = "rgba(148,163,184,0.12)";
      ctx.lineWidth = 1;
      for (let lon = -180; lon <= 180; lon += 30) {
        const p0 = project(lon, 75, w, h, { top: 0, right: 0, bottom: 0, left: 0 });
        const p1 = project(lon, -60, w, h, { top: 0, right: 0, bottom: 0, left: 0 });
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
      }

      const year = yearFor(idx);
      const margin = { top: 0, right: 0, bottom: 0, left: 0 };
      let pts = all
        .map((c) => ({ ...c, pop: c.byYear[year] }))
        .filter((c) => Number.isFinite(c.pop));

      // scene 2: emphasize megacities; scene 3: mid-size (100k–1M) growth narrative
      if (idx === 2) {
        // draw small faint, mega bright
      } else if (idx === 3) {
        // mid-size highlight
      }

      // sort small first
      pts.sort((a, b) => a.pop - b.pop);

      const maxPop = Math.max(...pts.map((p) => p.pop), 1);
      let n = 0;
      let nMega = 0;
      pts.forEach((c) => {
        const { x, y } = project(c.lng, c.lat, w, h, margin);
        if (x < -20 || x > w + 20 || y < -20 || y > h + 20) return;
        const isMega = c.pop >= MEGA;
        const isLarge = c.pop >= LARGE;
        const isMid = c.pop >= 100_000 && c.pop < LARGE;
        if (isMega) nMega++;

        let r = 1.1 + 7 * Math.sqrt(c.pop / maxPop);
        let alpha = 0.35;
        let fill = "#5b8def";

        if (idx === 2) {
          if (isMega) {
            alpha = 0.95;
            fill = "#87b147";
            r = Math.max(r, 5);
          } else {
            alpha = 0.12;
            fill = "#64748b";
          }
        } else if (idx === 3) {
          if (isMid) {
            alpha = 0.75;
            fill = "#f7b841";
            r = Math.max(r * 0.9, 2);
          } else if (isMega) {
            alpha = 0.25;
            fill = "#87b147";
          } else {
            alpha = 0.08;
            fill = "#475569";
          }
        } else {
          if (isMega) {
            fill = "#87b147";
            alpha = 0.85;
          } else if (isLarge) {
            fill = "#34A7F2";
            alpha = 0.55;
          } else {
            fill = "#5b8def";
            alpha = 0.3;
          }
        }

        ctx.beginPath();
        ctx.fillStyle =
          fill +
          Math.round(alpha * 255)
            .toString(16)
            .padStart(2, "0");
        // use rgba instead
        const a = alpha;
        ctx.fillStyle =
          fill.startsWith("#") && fill.length === 7
            ? `rgba(${parseInt(fill.slice(1, 3), 16)},${parseInt(
                fill.slice(3, 5),
                16
              )},${parseInt(fill.slice(5, 7), 16)},${a})`
            : fill;
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        n++;
      });

      const titles = {
        0: `Cities in ${year} · just over ${Math.round(n / 100) * 100 || n} with data`,
        1: `Cities in ${year} · network expands`,
        2: `Megacities (≥10M) in ${year} · growth expected to slow`,
        3: `Mid-size cities drive future growth · ${year}`,
      };
      header.textContent = titles[Math.min(idx, 3)];
      meta.textContent = `${n.toLocaleString()} cities · ${nMega} megacities · pop encoded as point size`;
    }

    const api = {
      setScene: paint,
      updateScene: paint,
      destroy() {
        INSTANCES.delete(container);
        container.innerHTML = "";
      },
    };
    INSTANCES.set(container, { api, setScene: paint });
    paint(sceneIndex || 0);
    return api;
  }

  global.AtlasCityPointsMap = { mount, YEARS, version: "1.0.0" };
})(typeof window !== "undefined" ? window : globalThis);
