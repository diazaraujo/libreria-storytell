/**
 * AtlasParticles — lightweight full-viewport particle field
 * Inspired by Atlas of Global Development particle canvas (Pixi ParticleContainer).
 *
 * Origin cues (electricity-access intro):
 *  - fixed full-viewport canvas, pointer-events: none
 *  - ~300–800 soft dots scattered
 *  - gentle drift / cos wobble
 *  - theme-tinted (default infrastructure-ish coral/red)
 *  - respects prefers-reduced-motion
 *
 * API:
 *   const ctl = AtlasParticles.mount({ color, count, zIndex });
 *   ctl.destroy();
 */
(function (global) {
  function mount(options = {}) {
    const {
      color = "#e31c3d",
      count = 520,
      zIndex = 1,
      opacity = 0.55,
      sizeMin = 1.1,
      sizeMax = 2.4,
      speed = 0.12,
      parent = document.body,
      // Atlas heroes cluster particles toward left mid-height (plume)
      biasLeft = 0.55,
      biasY = 0.45,
    } = options;

    if (
      global.matchMedia &&
      global.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return {
        destroy() {},
        canvas: null,
        reduced: true,
      };
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

    const particles = [];

    function resize() {
      dpr = Math.min(global.devicePixelRatio || 1, 2);
      w = global.innerWidth || 1;
      h = global.innerHeight || 1;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function seed() {
      particles.length = 0;
      const n = count;
      for (let i = 0; i < n; i++) {
        // mixture: uniform scatter + left-plume density like Atlas heroes
        const plume = Math.random() < biasLeft;
        const x = plume
          ? Math.pow(Math.random(), 1.35) * w * 0.55 + Math.random() * w * 0.08
          : Math.random() * w;
        const y = plume
          ? h * (0.12 + Math.random() * 0.7) * (0.65 + biasY * 0.35)
          : Math.random() * h;
        particles.push({
          x,
          y,
          r: sizeMin + Math.random() * (sizeMax - sizeMin),
          // origin-like random channels
          a: Math.random(),
          b: Math.random(),
          c: Math.random(),
          vx: (Math.random() - 0.5) * speed,
          vy: (Math.random() - 0.5) * speed * 0.6,
          alpha: 0.25 + Math.random() * 0.55,
        });
      }
    }

    function frame(now) {
      if (!running) return;
      const t = (now - t0) / 1000;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = color;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        // gentle cos drift (similar spirit to origin cos wobble)
        const wx = Math.cos(p.a * 12 + t * (0.4 + p.c * 0.8)) * 0.35;
        const wy = Math.sin(p.b * 10 + t * (0.35 + p.a * 0.7)) * 0.35;
        p.x += p.vx + wx * 0.02;
        p.y += p.vy + wy * 0.02;

        // wrap
        if (p.x < -4) p.x = w + 4;
        if (p.x > w + 4) p.x = -4;
        if (p.y < -4) p.y = h + 4;
        if (p.y > h + 4) p.y = -4;

        const pulse =
          p.r * (0.85 + 0.2 * (0.5 + 0.5 * Math.cos(t * 1.2 + p.a * 20)));
        ctx.globalAlpha = p.alpha * (0.75 + 0.25 * Math.sin(t + p.b * 10));
        ctx.beginPath();
        ctx.arc(p.x, p.y, pulse, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }

    function onResize() {
      resize();
      // keep relative density
      seed();
    }

    resize();
    seed();
    raf = requestAnimationFrame(frame);
    global.addEventListener("resize", onResize, { passive: true });

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

  global.AtlasParticles = { mount, version: "0.1.0" };
})(typeof window !== "undefined" ? window : globalThis);
