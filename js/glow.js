/* ============================================================
   SABBARAH AI — Living Glow Engine
   1. Floating light particles (canvas, very subtle)
   2. Cursor-following glow on cards
   Official colors only:
     Sabbarah Green #1FD9A0 · Mint AI #6BF5CE ·
     Deep Jade #0E5C4A · Desert Gold #C9A227 (rare, ≤5%)
   Fully disabled for prefers-reduced-motion.
   ============================================================ */

(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------------- 1. Floating particles ---------------- */
  const canvas = document.querySelector(".glow-particles");

  if (canvas && !reducedMotion.matches) {
    const ctx = canvas.getContext("2d");
    let width = 0;
    let height = 0;
    let particles = [];
    let rafId = null;

    // 95% green family, 5% gold — respects the Desert Gold usage cap.
    const COLORS = [
      { rgb: "31,217,160", weight: 0.55 },  // Sabbarah Green
      { rgb: "107,245,206", weight: 0.28 }, // Mint AI
      { rgb: "14,92,74", weight: 0.12 },    // Deep Jade
      { rgb: "201,162,39", weight: 0.05 },  // Desert Gold
    ];

    const pickColor = () => {
      let r = Math.random();
      for (const c of COLORS) {
        if ((r -= c.weight) <= 0) return c.rgb;
      }
      return COLORS[0].rgb;
    };

    const makeParticle = (spawnAnywhere) => ({
      x: Math.random() * width,
      y: spawnAnywhere ? Math.random() * height : height + 10,
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
      const target = Math.min(46, Math.round(width / 34));
      particles = Array.from({ length: target }, () => makeParticle(true));
    };

    const tick = () => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.y -= p.speedY;
        p.x += p.driftX;
        p.twinkle += p.twinkleSpeed;
        if (p.y < -12 || p.x < -12 || p.x > width + 12) {
          Object.assign(p, makeParticle(false));
        }
        const glow = p.alpha * (0.55 + 0.45 * Math.sin(p.twinkle));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${glow.toFixed(3)})`;
        ctx.shadowColor = `rgba(${p.color},0.55)`;
        ctx.shadowBlur = 7;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      rafId = requestAnimationFrame(tick);
    };

    const start = () => { if (rafId === null) rafId = requestAnimationFrame(tick); };
    const stop = () => { if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; } };

    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", () => {
      document.hidden ? stop() : start();
    });
    reducedMotion.addEventListener?.("change", (e) => {
      if (e.matches) { stop(); ctx.clearRect(0, 0, width, height); }
      else start();
    });

    resize();
    start();
  }

  /* ---------------- 2. Cursor-following card glow ---------------- */
  if (window.matchMedia("(hover: hover)").matches && !reducedMotion.matches) {
    const GLOW_TARGETS = ".card, .governance-card, .step, .faq details";
    document.addEventListener("pointermove", (event) => {
      const target = event.target.closest?.(GLOW_TARGETS);
      if (!target) return;
      const rect = target.getBoundingClientRect();
      target.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      target.style.setProperty("--my", `${event.clientY - rect.top}px`);
    }, { passive: true });
  }
})();
