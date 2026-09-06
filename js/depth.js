/* ============================================================
   صبّارة AI — محرك العمق (depth.js)
   DEPTH ENGINE — pairs with css/depth.css.
   1) hero stage tilt (pointer-driven, fine pointers only)
   2) pipeline nodes synced to the live demo (MutationObserver)
   3) magnetic primary buttons through a CSS variable (press state kept)
   The exploded anatomy and the scroll-spy moved to js/journey.js on 2026-09-06.
   Fully calm under prefers-reduced-motion. No layout changes.
   ============================================================ */
(() => {
  "use strict";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ---------------- 1. hero stage tilt ---------------- */
  const stage = document.querySelector(".hero__stage");
  const scene = stage && stage.querySelector(".stage-3d");
  if (stage && scene && fine && !reduced) {
    let rx = 0, ry = 0, raf = null;
    const apply = () => {
      scene.style.setProperty("--rx", rx.toFixed(2) + "deg");
      scene.style.setProperty("--ry", ry.toFixed(2) + "deg");
      raf = null;
    };
    stage.addEventListener("pointermove", (e) => {
      const r = stage.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      ry = clamp(px * 11, -6, 6);
      rx = clamp(-py * 9, -5, 5);
      if (raf === null) raf = requestAnimationFrame(apply);
    }, { passive: true });
    stage.addEventListener("pointerleave", () => {
      rx = 0; ry = 0;
      if (raf === null) raf = requestAnimationFrame(apply);
    });
  }

  /* ---------------- 2. pipeline nodes follow the live demo ----------------
     main.js appends the bubbles; each bubble that lands lights the next stage
     (understand → next step → capture → follow-up). Resets when the script restarts. */
  const flow = document.querySelector(".demo__flow");
  const demoBody = document.getElementById("demoBody");
  if (flow && demoBody && "MutationObserver" in window) {
    const nodes = Array.prototype.slice.call(flow.children);
    const sync = () => {
      const n = demoBody.querySelectorAll(".bubble:not(.bubble--typing)").length;
      nodes.forEach((li, i) => {
        li.classList.toggle("is-on", i < n);
        li.classList.toggle("is-now", i === n - 1);
      });
    };
    new MutationObserver(sync).observe(demoBody, { childList: true });
    sync();
  }

  /* ---------------- 3. magnetic primary buttons (CSS variable, so :active still presses) ---------------- */
  if (fine && !reduced) {
    document.querySelectorAll(".button--primary").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * 0.18;
        const dy = (e.clientY - (r.top + r.height / 2)) * 0.26;
        btn.style.setProperty("--mx", dx.toFixed(1) + "px");
        btn.style.setProperty("--my", (dy - 2).toFixed(1) + "px");
      }, { passive: true });
      btn.addEventListener("pointerleave", () => { btn.style.removeProperty("--mx"); btn.style.removeProperty("--my"); });
    });
  }
})();
