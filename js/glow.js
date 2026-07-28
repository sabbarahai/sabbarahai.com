/* ============================================================
   ZAHRA — Living Glow Engine
   1) floating light particles (canvas, ~95% green family, ≤5% gold)
   2) cursor-following glow on interactive surfaces
   3) scroll-reactive parallax on the ambient orbs
   Fully disabled under prefers-reduced-motion. No layout changes.
   ============================================================ */
(() => {
  "use strict";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------------- 1. particles ---------------- */
  const canvas = document.querySelector(".glow-particles");
  if (canvas && !reduced.matches) {
    const ctx = canvas.getContext("2d");
    let width = 0, height = 0, particles = [], rafId = null;

    const COLORS = [
      { rgb: "31,217,160", weight: 0.55 },  // Sabbarah Green
      { rgb: "107,245,206", weight: 0.28 }, // Mint AI
      { rgb: "14,92,74", weight: 0.12 },    // Deep Jade
      { rgb: "201,162,39", weight: 0.05 },  // Desert Gold
    ];
    const pickColor = () => {
      let r = Math.random();
      for (const c of COLORS) if ((r -= c.weight) <= 0) return c.rgb;
      return COLORS[0].rgb;
    };
    const makeParticle = (anywhere) => ({
      x: Math.random() * width,
      y: anywhere ? Math.random() * height : height + 10,
      radius: 0.7 + Math.random() * 1.7,
      speedY: 0.08 + Math.random() * 0.22,
      driftX: (Math.random() - 0.5) * 0.12,
      alpha: 0.12 + Math.random() * 0.3,
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.004 + Math.random() * 0.012,
      color: pickColor(),
    });
    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      particles = Array.from({ length: Math.min(44, Math.round(width / 34)) }, () => makeParticle(true));
    };
    const tick = () => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.y -= p.speedY; p.x += p.driftX; p.twinkle += p.twinkleSpeed;
        if (p.y < -12 || p.x < -12 || p.x > width + 12) Object.assign(p, makeParticle(false));
        const glow = p.alpha * (0.55 + 0.45 * Math.sin(p.twinkle));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(" + p.color + "," + glow.toFixed(3) + ")";
        ctx.shadowColor = "rgba(" + p.color + ",0.55)";
        ctx.shadowBlur = 7;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      rafId = requestAnimationFrame(tick);
    };
    const start = () => { if (rafId === null) rafId = requestAnimationFrame(tick); };
    const stop = () => { if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; } };
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
    reduced.addEventListener?.("change", (e) => { if (e.matches) { stop(); ctx.clearRect(0, 0, width, height); } else start(); });
    resize();
    start();
  }

  /* ---------------- 2. cursor-following surface glow ---------------- */
  if (window.matchMedia("(hover: hover)").matches && !reduced.matches) {
    const TARGETS = ".sol-card, .steps li, .faq details, .portfolio__site, .portfolio__chat";
    document.addEventListener("pointermove", (event) => {
      const target = event.target.closest?.(TARGETS);
      if (!target) return;
      const rect = target.getBoundingClientRect();
      target.style.setProperty("--mx", (event.clientX - rect.left) + "px");
      target.style.setProperty("--my", (event.clientY - rect.top) + "px");
    }, { passive: true });
  }

  /* ---------------- 3. scroll-reactive orb parallax ---------------- */
  if (!reduced.matches) {
    const orbs = [
      { el: document.querySelector(".ambient__orb--one"), f: 0.05 },
      { el: document.querySelector(".ambient__orb--two"), f: -0.08 },
      { el: document.querySelector(".ambient__orb--three"), f: 0.035 },
    ].filter((o) => o.el);
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      orbs.forEach((o) => { o.el.style.translate = "0 " + (y * o.f).toFixed(1) + "px"; });
      ticking = false;
    };
    window.addEventListener("scroll", () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }
})();
