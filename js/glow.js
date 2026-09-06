/* ============================================================
   ZAHRA — Living Glow Engine (glow.js)
   1) pointer-following light on interactive surfaces
      (a green glow in the night room, a warm fill light in daylight)
   2) the baked ambient layer parallaxes on transform only
   Fully disabled under prefers-reduced-motion. No layout changes.
   ============================================================ */
(() => {
  "use strict";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------------- 1. pointer light ---------------- */
  if (window.matchMedia("(hover: hover)").matches && !reduced.matches) {
    const TARGETS = ".sol-card, .faq details, .price-card, .guard__list li";
    document.addEventListener("pointermove", (event) => {
      const target = event.target.closest?.(TARGETS);
      if (!target) return;
      const rect = target.getBoundingClientRect();
      target.style.setProperty("--mx", (event.clientX - rect.left) + "px");
      target.style.setProperty("--my", (event.clientY - rect.top) + "px");
    }, { passive: true });
  }

  /* ---------------- 2. baked ambient parallax ---------------- */
  const bake = document.querySelector(".ambient__bake");
  if (bake && !reduced.matches) {
    let ticking = false;
    const update = () => {
      bake.style.transform = "translate3d(0," + (window.scrollY * 0.06).toFixed(1) + "px,0)";
      ticking = false;
    };
    window.addEventListener("scroll", () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }
})();
