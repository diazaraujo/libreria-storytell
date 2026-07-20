/**
 * AtlasParticles v0.2 — full-viewport field closer to Atlas Pixi scatter
 *
 * Modes:
 *  - plume (default): left-biased synthetic cloud
 *  - world: project country-like centroids (equirectangular) for density map feel
 *
 * API:
 *   AtlasParticles.mount({ color, count, mode:'world'|'plume', centroidsUrl })
 */
(function (global) {
  const DEFAULT_CENTROIDS =
    (typeof document !== "undefined" &&
      document.currentScript &&
      document.currentScript.src &&
      document.currentScript.src.replace(/\/[^/]*$/, "/")) ||
    "";

  function project(lon, lat, w, h) {
    // Equirectangular framed like Atlas heroes: map sits mid-viewport,
    // slightly left-weighted, poles cropped.
    const padX = w * 0.04;
    const padY = h * 0.08;
    const x = padX + ((lon + 180) / 360) * (w - padX * 2) * 0.96;
    const y = padY + ((85 - lat) / 160) * (h - padY * 2);
    return [x, y];
  }

  function mount(options = {}) {
    const {
      color = "#e31c3d",
      count = 820,
      zIndex = 1,
      opacity = 0.78,
      sizeMin = 0.9,
      sizeMax = 2.8,
      speed = 0.08,
      parent = document.body,
      biasLeft = 0.55,
      biasY = 0.45,
      mode = "world", // 'world' | 'plume'
      centroidsUrl =
        "../../library/particles-world/centroids.json",
      centroids = null,
    } = options;

    if (
      global.matchMedia &&
      global.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return { destroy() {}, canvas: null, reduced: true };
    }

    const canvas = document.createElement("canvas");
    canvas.className = "atlas-particles-canvas";
    canvas.setAttribute("aria-hidden", "true");
    Object.assign(canvas.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100vw",
      height: "100vh",
      zIndex: String(zIndex),
      pointerEvents: "none",
      opacity: String(opacity),
    });
    parent.appendChild(canvas);

    const ctx = canvas.getContext("2d", { alpha: true });
    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let t0 = performance.now();
    let running = true;
    let worldPts = centroids && centroids.points ? centroids.points : null;

    const particles = [];

    function resize() {
      dpr = Math.min(global.devicePixelRatio || 1, 2);
      w = global.innerWidth || 1;
      h = global.innerHeight || 1;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function seedPlume() {
      particles.length = 0;
      for (let i = 0; i < count; i++) {
        const plume = Math.random() < biasLeft;
        const x = plume
          ? Math.pow(Math.random(), 1.35) * w * 0.55 + Math.random() * w * 0.08
          : Math.random() * w;
        const y = plume
          ? h * (0.12 + Math.random() * 0.7) * (0.65 + biasY * 0.35)
          : Math.random() * h;
        particles.push(makeP(x, y, 0.3 + Math.random() * 0.7));
      }
    }

    function makeP(x, y, weight) {
      return {
        x,
        y,
        r: sizeMin + Math.random() * (sizeMax - sizeMin) * (0.7 + weight * 0.5),
        a: Math.random(),
        b: Math.random(),
        c: Math.random(),
        vx: (Math.random() - 0.5) * speed * 0.6,
        vy: (Math.random() - 0.5) * speed * 0.4,
        alpha: 0.2 + Math.random() * 0.55 * weight,
      };
    }

    function seedWorld() {
      particles.length = 0;
      if (!worldPts || !worldPts.length) {
        seedPlume();
        return;
      }
      // Over-sample centroids with jitter → dense country scatter (Pixi-like)
      const base = worldPts;
      const n = Math.max(count, base.length);
      for (let i = 0; i < n; i++) {
        const src = base[i % base.length];
        // prefer heavier weights more often
        if ((src.w || 0.5) < 0.35 && Math.random() < 0.4) continue;
        const jitterLon = (Math.random() - 0.5) * (4.5 + (1 - (src.w || 0.5)) * 3);
        const jitterLat = (Math.random() - 0.5) * (3.2 + (1 - (src.w || 0.5)) * 2);
        const [x, y] = project(src.lon + jitterLon, src.lat + jitterLat, w, h);
        if (x < -20 || x > w + 20 || y < -20 || y > h + 20) continue;
        // faint ambient dust (origin has sparse field outside land)
        if (Math.random() < 0.08) {
          particles.push(
            makeP(Math.random() * w, Math.random() * h, 0.18 + Math.random() * 0.25)
          );
        }
        particles.push(makeP(x, y, src.w || 0.8));
      }
      // ensure we hit requested count
      while (particles.length < count * 0.85 && base.length) {
        const src = base[(Math.random() * base.length) | 0];
        const [x, y] = project(
          src.lon + (Math.random() - 0.5) * 5,
          src.lat + (Math.random() - 0.5) * 3.5,
          w,
          h
        );
        particles.push(makeP(x, y, src.w || 0.7));
      }
    }

    function seed() {
      if (mode === "world") seedWorld();
      else seedPlume();
    }

    function frame(now) {
      if (!running) return;
      const t = (now - t0) / 1000;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = color;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const wx = Math.cos(p.a * 12 + t * (0.35 + p.c * 0.7)) * 0.28;
        const wy = Math.sin(p.b * 10 + t * (0.3 + p.a * 0.6)) * 0.28;
        p.x += p.vx + wx * 0.015;
        p.y += p.vy + wy * 0.015;
        // soft clamp — less wrap than plume so map shape holds
        if (mode === "world") {
          if (p.x < -8) p.x = w + 8;
          if (p.x > w + 8) p.x = -8;
          if (p.y < -8) p.y = h + 8;
          if (p.y > h + 8) p.y = -8;
        } else {
          if (p.x < -4) p.x = w + 4;
          if (p.x > w + 4) p.x = -4;
          if (p.y < -4) p.y = h + 4;
          if (p.y > h + 4) p.y = -4;
        }
        const pulse =
          p.r * (0.88 + 0.16 * (0.5 + 0.5 * Math.cos(t * 1.1 + p.a * 18)));
        ctx.globalAlpha = p.alpha * (0.78 + 0.22 * Math.sin(t + p.b * 9));
        ctx.beginPath();
        ctx.arc(p.x, p.y, pulse, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }

    function onResize() {
      resize();
      seed();
    }

    async function loadCentroids() {
      if (worldPts || mode !== "world") return;
      try {
        // resolve relative to site root
        const url = centroidsUrl.startsWith("http")
          ? centroidsUrl
          : new URL(
              centroidsUrl.replace(/^\.\.\/\.\.\//, "/"),
              global.location.origin
            ).href;
        // stories load from /stories/x/ so prefer absolute path
        const tryUrls = [
          "/library/particles-world/centroids.json",
          url,
          centroidsUrl,
        ];
        for (const u of tryUrls) {
          try {
            const res = await fetch(u, { cache: "force-cache" });
            if (!res.ok) continue;
            const data = await res.json();
            worldPts = data.points || data;
            break;
          } catch (_) {}
        }
      } catch (_) {}
    }

    resize();
    seed();
    raf = requestAnimationFrame(frame);
    global.addEventListener("resize", onResize, { passive: true });

    // upgrade to world scatter when JSON arrives
    loadCentroids().then(() => {
      if (worldPts && mode === "world") seed();
    });

    return {
      canvas,
      reduced: false,
      destroy() {
        running = false;
        cancelAnimationFrame(raf);
        global.removeEventListener("resize", onResize);
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      },
    };
  }

  global.AtlasParticles = { mount, version: "0.3.0" };
})(typeof window !== "undefined" ? window : globalThis);
