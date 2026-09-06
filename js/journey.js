/* ============================================================
   صبّارة AI — محرك الرحلة (journey.js) · «نظام واحد، رحلة واحدة»
   JOURNEY ENGINE — pairs with css/journey.css. Vanilla, no library.
   1)  the Sabbarah Thread: one path down the page, nodes per section,
       progress by scroll, a token that travels (drag to scrub), scroll-spy,
       header title morph, the four process nodes on the line itself
   2)  «الشعار ينفتح» — the official mark flattened from its own path and
       projected vertex by vertex into one SVG (film 016 method): six layers
       along one axis, a real message descending, station shapes, one readout,
       the elevator on phones, reduced-motion and no-JS states
   3)  solutions as living stations (three frames, once, replay)
   4)  the scan as an instrument (axes, active sweep) + post-scan personalisation
   5)  the guard vault, the Smart Portfolio sequence, before-and-after,
       footer arrival, numeral counters, thumb-reach actions
   6)  cross-document view transitions, daylight caustics (WebGL, light only)
   Nothing here reads layout inside the scroll loop except the thread's
   cached geometry; the projection is pure maths.
   ============================================================ */
(() => {
  "use strict";
  const root = document.documentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const phone = () => window.matchMedia("(max-width: 720px)").matches;
  const rtl = () => root.dir !== "ltr";
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeInOut = (t) => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const T = (k) => (window.SB ? window.SB.t(k) : "");
  const SVGNS = "http://www.w3.org/2000/svg";
  const svgEl = (tag, attrs, parent) => {
    const el = document.createElementNS(SVGNS, tag);
    if (attrs) for (const k in attrs) el.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(el);
    return el;
  };
  const docTop = (el) => el.getBoundingClientRect().top + window.scrollY;
  const isPricing = !!document.querySelector(".pricing-hero");
  const header = document.querySelector(".site-header");
  const navMenu = document.getElementById("navMenu");

  /* shared scroll pump: one listener, one rAF, everyone subscribes */
  const subs = [];
  let pumping = false;
  const pump = () => { pumping = false; for (const f of subs) f(); };
  const request = () => { if (!pumping) { pumping = true; requestAnimationFrame(pump); } };
  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", request);

  /* =====================================================================
     1. THE THREAD
     ===================================================================== */
  const Thread = (() => {
    const main = document.getElementById("main");
    if (!main) return null;
    const svg = svgEl("svg", { class: "thread", "aria-hidden": "true" }, main);
    const ghost = svgEl("path", { class: "thread__ghost" }, svg);
    const glow = svgEl("path", { class: "thread__glow" }, svg);
    const path = svgEl("path", { class: "thread__path" }, svg);
    const branchG = svgEl("g", {}, svg);
    const nodeG = svgEl("g", {}, svg);
    const labelG = svgEl("g", {}, svg);
    const start = svgEl("circle", { class: "thread__node", r: 6 }, nodeG);
    const token = svgEl("circle", { class: "thread__token", r: 6.5 }, svg);
    let stops = [], total = 0, table = [], geom = null, active = null, lastLit = -1, lastActive = null;
    const nav = navMenu ? Array.prototype.slice.call(navMenu.querySelectorAll("a")) : [];

    const q = (sel) => document.querySelector(sel);
    /* the stops of each page: element, key, kind, key object for the branch lead */
    const homeStops = () => [
      { key: "anatomy", el: q("#anatomy .anatomy__head"), sec: q("#anatomy"), lead: q("#anatomy .section-heading") },
      { key: "custom-solutions", el: q("#custom-solutions .section-heading"), sec: q("#custom-solutions"), lead: q("#custom-solutions .sol-grid"), leadKey: "solutions" },
      { key: "scan", el: q("#scan .scan-head"), sec: q("#scan"), lead: q("#scanPanel"), gold: true },
      { key: "guard", el: q("#guard .guard__copy"), sec: q("#guard"), lead: q(".guard__glass") },
      { key: "ready-products", el: q("#ready-products .section-heading"), sec: q("#ready-products"), lead: q(".ready-flag") },
      { key: "process", el: q("#process .section-heading"), sec: q("#process"), steps: Array.prototype.slice.call(document.querySelectorAll("#steps > li")) },
      { key: "faq", el: q("#faq .section-heading"), sec: q("#faq"), lead: q(".faq") },
      { key: "contact", el: q("#contact .cta-card"), sec: q("#contact"), lead: q(".cta-card"), mid: true }
    ].filter((s) => s.el);
    const pricingStops = () => [
      { key: "custom-solutions", el: q("#custom-solutions .section-heading"), sec: q("#custom-solutions") },
      { key: "customer-service-agent", el: q("#customer-service-agent h3"), lead: q("#customer-service-agent"), small: true },
      { key: "sales-booking-agent", el: q("#sales-booking-agent h3"), lead: q("#sales-booking-agent"), small: true },
      { key: "professional-ai-assistant", el: q("#professional-ai-assistant h3"), lead: q("#professional-ai-assistant"), small: true },
      { key: "workflow-automation", el: q("#workflow-automation h3"), lead: q("#workflow-automation"), small: true },
      { key: "custom-ai-solution", el: q("#custom-ai-solution h3"), lead: q("#custom-ai-solution"), small: true },
      { key: "sabbarah-map", el: q("#sabbarah-map .map-strip__label"), sec: q("#sabbarah-map"), lead: q(".map-strip"), gold: true },
      { key: "ready-products", el: q("#ready-products .section-heading"), sec: q("#ready-products") },
      { key: "smart-portfolio", el: q("#smart-portfolio h3"), lead: q("#smart-portfolio"), small: true },
      { key: "contact", el: q("#contact .cta-card"), sec: q("#contact"), lead: q(".cta-card"), mid: true }
    ].filter((s) => s.el);

    /* orthogonal polyline → rounded path */
    const roundPath = (pts, r) => {
      let d = "M" + pts[0][0].toFixed(1) + " " + pts[0][1].toFixed(1);
      for (let i = 1; i < pts.length - 1; i++) {
        const p = pts[i], a = pts[i - 1], b = pts[i + 1];
        const d1 = Math.hypot(p[0] - a[0], p[1] - a[1]), d2 = Math.hypot(b[0] - p[0], b[1] - p[1]);
        const rr = Math.min(r, d1 / 2, d2 / 2);
        const ux = (p[0] - a[0]) / (d1 || 1), uy = (p[1] - a[1]) / (d1 || 1);
        const vx = (b[0] - p[0]) / (d2 || 1), vy = (b[1] - p[1]) / (d2 || 1);
        d += " L" + (p[0] - ux * rr).toFixed(1) + " " + (p[1] - uy * rr).toFixed(1);
        d += " Q" + p[0].toFixed(1) + " " + p[1].toFixed(1) + " " + (p[0] + vx * rr).toFixed(1) + " " + (p[1] + vy * rr).toFixed(1);
      }
      const l = pts[pts.length - 1];
      d += " L" + l[0].toFixed(1) + " " + l[1].toFixed(1);
      return d;
    };

    const label = (key) => {
      const s = T("thread." + key);
      if (s) return s;
      const link = nav.find((a) => (a.getAttribute("href") || "").endsWith("#" + key));
      if (link) return link.textContent.trim();
      const el = document.getElementById(key);
      const h = el && (el.querySelector(".eyebrow") || el.querySelector("h2, h3"));
      return h ? h.textContent.trim() : "";
    };

    function layout() {
      stops = isPricing ? pricingStops() : homeStops();
      const mainRect = main.getBoundingClientRect();
      const mainTop = mainRect.top + window.scrollY;
      svg.style.height = "0px"; /* measure the content, never the previous thread */
      const H = main.scrollHeight, W = main.clientWidth;
      svg.setAttribute("viewBox", "0 0 " + W + " " + H);
      svg.style.height = H + "px";
      const cont = document.querySelector("main .container");
      const cr = cont.getBoundingClientRect();
      const isRtl = rtl();
      const space = isRtl ? W - cr.right : cr.left;
      /* the gutter line: outside the content column when there is room, inside the gutter otherwise */
      const small = phone();
      const x0 = small ? (isRtl ? W - 7 : 7) : (space >= 56 ? (isRtl ? cr.right + 24 : cr.left - 24) : (isRtl ? W - Math.max(9, space + 18) : Math.max(9, space - 18)));
      const gx = clamp(x0, 6, W - 6);
      const R = 22;
      const pts = [];
      /* start: under the demo pipeline (home) or under the pricing headline */
      const startEl = q(".demo__flow") || q(".pricing-hero .section-heading");
      const sr = startEl.getBoundingClientRect();
      const sx = clamp(sr.left + sr.width / 2, 20, W - 20), sy = sr.bottom + window.scrollY - mainTop + (isPricing ? 26 : 10);
      const heroEl = q("#hero") || q(".pricing-hero");
      const hr = heroEl.getBoundingClientRect();
      const floorY = hr.bottom + window.scrollY - mainTop - (isPricing ? 8 : 34);
      pts.push([sx, sy], [sx, floorY], [gx, floorY]);
      const nodes = [];
      for (const s of stops) {
        const r = s.el.getBoundingClientRect();
        const y = r.top + window.scrollY - mainTop + (s.mid ? Math.min(60, r.height / 2) : 22);
        if (s.steps && s.steps.length) {
          const first = s.steps[0].getBoundingClientRect(), last = s.steps[s.steps.length - 1].getBoundingClientRect();
          const xs = isRtl ? first.right + 30 : first.left - 30;
          const yTop = first.top + window.scrollY - mainTop - 44, yBot = last.bottom + window.scrollY - mainTop + 18;
          pts.push([gx, yTop], [xs, yTop]);
          s.steps.forEach((li, i) => {
            const lr = li.querySelector("b").getBoundingClientRect();
            nodes.push({ stop: s, step: i, li, x: xs, y: lr.top + lr.height / 2 + window.scrollY - mainTop, key: s.key });
          });
          nodes.push({ stop: s, x: gx, y, key: s.key, hidden: true });
          pts.push([xs, yBot], [gx, yBot]);
        } else {
          nodes.push({ stop: s, x: gx, y, key: s.key, gold: s.gold, small: s.small });
        }
      }
      /* the end: the footer mark */
      const endEl = document.getElementById("footerLogo");
      let endPt = null;
      if (endEl) {
        const er = endEl.getBoundingClientRect();
        const ex = er.left + er.width / 2, ey = er.top + window.scrollY - mainTop + 2;
        const yj = ey - 54;
        pts.push([gx, yj], [ex, yj], [ex, ey]);
        endPt = [ex, ey];
      } else {
        pts.push([gx, H - 20]);
      }
      const d = roundPath(pts, R);
      path.setAttribute("d", d); ghost.setAttribute("d", d); glow.setAttribute("d", d);
      total = path.getTotalLength();
      path.style.strokeDasharray = total + " " + total;
      glow.style.strokeDasharray = total + " " + total;
      /* a lookup from document y to path length (the path only ever moves down or sideways) */
      table = [];
      const N = Math.max(120, Math.round(total / 60));
      for (let i = 0; i <= N; i++) { const L = total * i / N, p = path.getPointAtLength(L); table.push([p.y, L, p.x]); }
      /* nodes, leads, labels */
      nodeG.innerHTML = ""; branchG.innerHTML = ""; labelG.innerHTML = "";
      nodeG.appendChild(start);
      start.setAttribute("cx", sx); start.setAttribute("cy", sy);
      for (const n of nodes) {
        if (n.hidden) continue;
        n.el = svgEl("circle", { class: "thread__node" + (n.gold ? " thread__node--gold" : "") + (n.step !== undefined ? " thread__node--step" : ""), r: small ? 4.5 : (n.small ? 4.5 : (n.step !== undefined ? 5 : 6.5)), cx: n.x, cy: n.y, tabindex: "-1" }, nodeG);
        n.title = n.step !== undefined ? n.li.querySelector("b").textContent.trim() : label(n.key);
        n.el.addEventListener("click", () => {
          const target = n.step !== undefined ? n.li : (n.stop.sec || n.stop.lead || n.stop.el);
          target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: n.step !== undefined ? "center" : "start" });
        });
        if (n.title) {
          const tx = isRtl ? n.x - 14 : n.x + 14;
          n.label = svgEl("text", { class: "thread__label", x: tx, y: n.y + 4.5, "text-anchor": isRtl ? "end" : "start" }, labelG);
          n.label.textContent = n.title;
          n.el.addEventListener("pointerenter", () => n.label.classList.add("is-on"));
          n.el.addEventListener("pointerleave", () => n.label.classList.remove("is-on"));
        }
        if (n.stop.lead && n.step === undefined && !phone()) {
          const lr = n.stop.lead.getBoundingClientRect();
          const xEnd = isRtl ? Math.min(lr.right + 6, n.x - 12) : Math.max(lr.left - 6, n.x + 12);
          if (Math.abs(xEnd - n.x) > 18 && Math.abs(xEnd - n.x) <= 170) {
            n.branch = svgEl("path", { class: "thread__branch", d: "M" + n.x + " " + n.y + " L" + xEnd.toFixed(1) + " " + n.y }, branchG);
            n.branch.style.setProperty("--blen", Math.abs(xEnd - n.x).toFixed(0));
            svgEl("circle", { class: "thread__node thread__node--step", r: 2.6, cx: xEnd, cy: n.y, style: "pointer-events:none" }, branchG);
          }
        }
        if (n.step !== undefined) {
          n.li.addEventListener("pointerenter", () => n.el.classList.add("is-hot"));
          n.li.addEventListener("pointerleave", () => n.el.classList.remove("is-hot"));
        }
      }
      geom = { nodes, mainTop, endPt, gx };
      lastLit = -1; lastActive = null;
      update(true);
    }

    const lenAtY = (y) => {
      if (!table.length) return 0;
      if (y <= table[0][0]) return 0;
      let lo = 0, hi = table.length - 1;
      while (lo < hi) { const m = (lo + hi) >> 1; if (table[m][0] < y) lo = m + 1; else hi = m; }
      const b = table[lo], a = table[Math.max(0, lo - 1)];
      if (b[0] === a[0]) return b[1];
      return lerp(a[1], b[1], clamp((y - a[0]) / (b[0] - a[0]), 0, 1));
    };

    function update(force) {
      if (!geom) return;
      const vh = window.innerHeight;
      const readY = window.scrollY + vh * 0.6 - geom.mainTop;
      const L = reduced ? total : clamp(lenAtY(readY), 0, total);
      const off = total - L;
      path.style.strokeDashoffset = off; glow.style.strokeDashoffset = off;
      if (!token.classList.contains("is-dragging")) {
        const p = path.getPointAtLength(L);
        token.setAttribute("cx", p.x.toFixed(1)); token.setAttribute("cy", p.y.toFixed(1));
      }
      /* nodes light when their section crosses 40% of the viewport (their y passes the reading line) */
      const litY = window.scrollY + vh * 0.62 - geom.mainTop;
      let act = null;
      geom.nodes.forEach((n) => {
        const lit = reduced || n.y <= litY;
        if (n.el) n.el.classList.toggle("is-lit", lit);
        if (n.branch) n.branch.classList.toggle("is-lit", lit);
        if (n.li) n.li.classList.toggle("is-lit", lit);
        if (lit && !n.hidden) act = n;
      });
      /* scroll-spy: the section holding the reading line */
      let secKey = null;
      for (const s of stops) {
        const sec = s.sec; if (!sec) continue;
        const top = docTop(sec) - geom.mainTop, bottom = top + sec.offsetHeight;
        if (readY >= top && readY < bottom) { secKey = s.key; break; }
      }
      if (window.scrollY < 160) secKey = null;
      if (secKey !== lastActive || force) {
        lastActive = secKey;
        nav.forEach((a) => a.classList.toggle("is-active", !!secKey && (a.getAttribute("href") || "") === "#" + secKey));
        if (navMenu) navMenu.classList.toggle("has-active", !!secKey && nav.some((a) => (a.getAttribute("href") || "") === "#" + secKey));
        const now = document.querySelector(".brand__now");
        if (now && header) {
          const t = secKey ? label(secKey) : "";
          now.textContent = t;
          header.classList.toggle("has-now", !!t);
        }
        document.dispatchEvent(new CustomEvent("sb:section", { detail: { key: secKey } }));
      }
      geom.nodes.forEach((n) => { if (n.el && n.step === undefined) n.el.classList.toggle("is-hot", n === act); });
      if (act && act.step !== undefined) act.li.classList.add("is-hot");
      active = act;
    }

    /* drag the token to scrub the page (fine pointers) */
    if (fine && !reduced) {
      let dragging = false, lastY = 0;
      token.addEventListener("pointerdown", (e) => {
        dragging = true; lastY = e.clientY; token.classList.add("is-dragging"); token.setPointerCapture(e.pointerId); e.preventDefault();
      });
      token.addEventListener("pointermove", (e) => {
        if (!dragging) return;
        const dy = e.clientY - lastY; lastY = e.clientY;
        window.scrollBy(0, dy * 1.6);
        const p = path.getPointAtLength(clamp(lenAtY(window.scrollY + window.innerHeight * 0.6 - geom.mainTop), 0, total));
        token.setAttribute("cx", p.x.toFixed(1)); token.setAttribute("cy", p.y.toFixed(1));
      });
      const release = () => {
        if (!dragging) return;
        dragging = false; token.classList.remove("is-dragging");
        /* spring back to the nearest node if released between nodes */
        const readY = window.scrollY + window.innerHeight * 0.6 - geom.mainTop;
        let best = null, bd = 1e9;
        geom.nodes.forEach((n) => { if (n.hidden) return; const d = Math.abs(n.y - readY); if (d < bd) { bd = d; best = n; } });
        if (best && bd > 40) {
          const target = best.li || best.stop.sec || best.stop.lead || best.stop.el;
          target.scrollIntoView({ behavior: "smooth", block: best.li ? "center" : "start" });
        }
        request();
      };
      token.addEventListener("pointerup", release);
      token.addEventListener("pointercancel", release);
    }

    /* the hand-off: when the demo's last reply lands, the message leaves the card and rides the first segment */
    const handoff = svgEl("circle", { class: "thread__token thread__token--handoff", r: 5, style: "opacity:0;pointer-events:none" }, svg);
    document.addEventListener("sb:demoend", () => {
      if (reduced || !geom || document.hidden) return;
      const r = document.querySelector(".hero__stage");
      if (r) { const rr = r.getBoundingClientRect(); if (rr.bottom < 0 || rr.top > window.innerHeight) return; }
      start.classList.add("is-lit");
      const len = Math.min(total, 420), t0 = performance.now();
      handoff.style.opacity = "1";
      const run = (now) => {
        const t = clamp((now - t0) / 1100, 0, 1), p = path.getPointAtLength(len * easeInOut(t));
        handoff.setAttribute("cx", p.x.toFixed(1)); handoff.setAttribute("cy", p.y.toFixed(1));
        if (t < 1) requestAnimationFrame(run); else { handoff.style.opacity = "0"; setTimeout(() => start.classList.remove("is-lit"), 2400); }
      };
      requestAnimationFrame(run);
    });

    subs.push(() => update(false));
    let rl = null;
    const relayout = () => { clearTimeout(rl); rl = setTimeout(layout, 120); };
    window.addEventListener("resize", relayout);
    document.addEventListener("sb:langchange", () => setTimeout(layout, 60));
    if ("ResizeObserver" in window) {
      let lastH = 0;
      new ResizeObserver(() => { const h = main.scrollHeight; if (Math.abs(h - lastH) > 4) { lastH = h; relayout(); } }).observe(main);
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => setTimeout(layout, 30));
    layout();
    return {
      hot(key, on) { if (!geom) return; geom.nodes.forEach((n) => { if (n.key === key && n.branch) n.branch.classList.toggle("is-hot", !!on); }); },
      relayout
    };
  })();

  /* =====================================================================
     2. THE MARK OPENS
     ===================================================================== */
  (() => {
    const track = document.getElementById("mark");
    const scene = document.getElementById("markScene");
    const svg = document.getElementById("markSvg");
    if (!track || !scene || !svg) return;
    const sticky = track.querySelector(".mark__sticky");
    const elevator = document.getElementById("markElevator");
    const R = {
      idx: document.getElementById("markIdx"), main: document.getElementById("markMain"), sub: document.getElementById("markSub"),
      desc: document.getElementById("markDesc"), rule: track.querySelector(".mark__rule"), word: document.getElementById("markWord"),
      msg: document.getElementById("markMsgText"), of: document.getElementById("markOf"),
      index: Array.prototype.slice.call(track.querySelectorAll(".mark__index button"))
    };

    /* ---- geometry: the verbatim logo path, flattened ---- */
    const BODY = "M318 328 C291 328 270 349 270 376 L270 576 C270 603 291 624 318 624 L478 624 L478 639 C478 655 491 668 507 668 L694 668 C721 668 742 647 742 620 L742 458 C742 431 721 410 694 410 C667 410 646 431 646 458 L646 572 L536 572 L536 529 C536 513 523 500 507 500 C491 500 478 513 478 529 L478 528 L366 528 L366 376 C366 349 345 328 318 328 Z";
    const flatten = (d, steps) => {
      const tok = d.match(/[MLCZ]|-?\d+(?:\.\d+)?/g);
      const pts = []; let i = 0, cur = null;
      while (i < tok.length) {
        const c = tok[i++];
        if (c === "M" || c === "L") { cur = [+tok[i++], +tok[i++]]; pts.push(cur); }
        else if (c === "C") {
          const p0 = cur, p1 = [+tok[i++], +tok[i++]], p2 = [+tok[i++], +tok[i++]], p3 = [+tok[i++], +tok[i++]];
          for (let k = 1; k <= steps; k++) {
            const t = k / steps, mt = 1 - t;
            pts.push([mt * mt * mt * p0[0] + 3 * mt * mt * t * p1[0] + 3 * mt * t * t * p2[0] + t * t * t * p3[0],
                      mt * mt * mt * p0[1] + 3 * mt * mt * t * p1[1] + 3 * mt * t * t * p2[1] + t * t * t * p3[1]]);
          }
          cur = p3;
        }
      }
      return pts;
    };
    const POLY = flatten(BODY, phone() ? 5 : 9);
    const CX = 506, CY = 474, D = 3400;
    const LAYERS = 6;
    const GAP = 100; /* 500 units of separation at full open — the film's measured limit */

    /* ---- camera ---- */
    let yaw = 0, pitch = 0, dragYaw = 0, sinY = 0, cosY = 1, sinP = 0, cosP = 1;
    const setCamera = (e) => {
      const ys = rtl() ? 1 : -1;
      const y = (18 * e + dragYaw) * ys * Math.PI / 180, p = 14 * e * Math.PI / 180;
      yaw = y; pitch = p; sinY = Math.sin(y); cosY = Math.cos(y); sinP = Math.sin(p); cosP = Math.cos(p);
    };
    const project = (x, y, z) => {
      const dx = x - CX, dy = y - CY;
      const x1 = dx * cosY - z * sinY;
      const z1 = dx * sinY + z * cosY;
      const y1 = dy * cosP + z1 * sinP;
      const z2 = -dy * sinP + z1 * cosP;
      const s = D / (D - z2);
      return [CX + x1 * s, CY + y1 * s, s];
    };
    const polyD = (pts, z) => {
      let d = "";
      for (let i = 0; i < pts.length; i++) { const p = project(pts[i][0], pts[i][1], z); d += (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1); }
      return d + "Z";
    };
    const rectD = (x, y, w, h, z) => polyD([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], z);
    const lineD = (pts, z) => {
      let d = "";
      for (let i = 0; i < pts.length; i++) { const p = project(pts[i][0], pts[i][1], z); d += (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1); }
      return d;
    };
    const setEllipse = (el, x, y, r, z) => {
      const p = project(x, y, z);
      el.setAttribute("cx", p[0].toFixed(1)); el.setAttribute("cy", p[1].toFixed(1));
      el.setAttribute("rx", (r * p[2]).toFixed(1)); el.setAttribute("ry", (r * p[2] * cosP).toFixed(1));
    };

    /* ---- station shapes (model space, in the mark's inner frame) — shapes only, never words ---- */
    const isRtl0 = rtl();
    const chipsX = [392, 467, 542];
    const SHAPES = [
      [{ t: "circle", x: 400, y: 372, r: 10, cls: "mk-shape mk-dim", on: "mk-on" }, { t: "circle", x: 400, y: 372, r: 19, cls: "mk-shape mk-line", ring: true }],
      chipsX.map((x, k) => ({ t: "rect", x, y: 478, w: 66, h: 22, cls: "mk-shape mk-dim", on: "mk-on", delay: k })),
      [{ t: "rect", x: 412, y: 372, w: 58, h: 18, cls: "mk-shape mk-dim", on: "mk-on" }, { t: "rect", x: 478, y: 372, w: 58, h: 18, cls: "mk-shape mk-dim", on: "mk-on", delay: 1 }],
      [{ t: "line", pts: [[505, 462], [505, 486], [455, 506]], cls: "mk-shape mk-line", on: "mk-on" }, { t: "line", pts: [[505, 486], [551, 506]], cls: "mk-shape mk-line", on: "mk-on" },
       { t: "circle", x: 561, y: 508, r: 11, cls: "mk-shape mk-gold" }, { t: "circle", x: 561, y: 505, r: 3, cls: "mk-shape mk-node" }, { t: "rect", x: 555, y: 510, w: 12, h: 4, cls: "mk-shape mk-node" }],
      [0, 1, 2, 3, 4, 5, 6].map((k) => ({ t: "rect", x: 392 + k * 34, y: 470, w: 26, h: 26, cls: "mk-shape mk-dim", on: k === 3 ? "mk-on" : null })).concat([
        { t: "rect", x: 400, y: 506, w: 210, h: 12, cls: "mk-shape mk-dim" }, { t: "rect", x: isRtl0 ? 400 : 556, y: 506, w: 54, h: 12, cls: "mk-shape mk-dim", on: "mk-on", delay: 1 }]),
      [{ t: "line", pts: [[400, 506], [440, 490], [480, 498], [520, 478], [560, 470]], cls: "mk-shape mk-line", on: "mk-on" }, { t: "circle", x: 560, y: 470, r: 5, cls: "mk-shape mk-dim", on: "mk-on", delay: 1 }]
    ];

    /* ---- build the SVG once ---- */
    svg.innerHTML = "";
    const defs = svgEl("defs", {}, svg);
    /* the reflection fades out within 150 units below the floor line (user-space mask, updated per frame) */
    const fade = svgEl("linearGradient", { id: "mkFade", x1: "0", y1: "0", x2: "0", y2: "1", gradientUnits: "objectBoundingBox" }, defs);
    svgEl("stop", { offset: "0", "stop-color": "#fff", "stop-opacity": ".9" }, fade);
    svgEl("stop", { offset: "1", "stop-color": "#fff", "stop-opacity": "0" }, fade);
    const mask = svgEl("mask", { id: "mkMask", maskUnits: "userSpaceOnUse", x: "-1000", y: "-1000", width: "3000", height: "3000" }, defs);
    const maskRect = svgEl("rect", { x: "-1000", y: "0", width: "3000", height: "150", fill: "url(#mkFade)" }, mask);
    const world = svgEl("g", {}, svg);
    const pool = svgEl("ellipse", { class: "mk-pool" }, world);
    const reflectG = svgEl("g", { class: "mk-reflect", mask: "url(#mkMask)" }, world);
    const reflect = svgEl("path", { class: "mk-reflect__body" }, reflectG);
    const layers = [];
    for (let i = 0; i < LAYERS; i++) {
      const g = svgEl("g", { class: "mk-layer", "data-i": i }, world);
      const slab = svgEl("path", { class: "mk-slab" }, g);
      const edge = svgEl("path", { class: "mk-edge" }, g);
      const shapes = SHAPES[i].map((s) => {
        const el = s.t === "circle" ? svgEl("ellipse", { class: s.cls }, g) : svgEl("path", { class: s.cls }, g);
        if (s.ring) { el.setAttribute("class", "mk-shape mk-line"); el.style.fill = "none"; }
        return { s, el };
      });
      layers.push({ g, slab, edge, shapes, z: 0 });
    }
    /* the official mark on the front layer (fades to glass as it opens) */
    const front = svgEl("g", { class: "mk-front" }, layers[LAYERS - 1].g);
    const fBody = svgEl("path", { fill: "url(#logoGrad)" }, front);
    const fRing = svgEl("ellipse", { class: "mk-ring" }, front);
    const fNodes = [0, 1, 2].map(() => svgEl("ellipse", { class: "mk-node" }, front));
    const fStem = svgEl("path", { fill: "none", stroke: "#16C99A", "stroke-width": 14, "stroke-linecap": "round" }, front);
    const fFeet = [0, 1].map(() => svgEl("ellipse", { fill: "#F2CF4A" }, front));
    const fChev = svgEl("path", { fill: "none", stroke: "#F2CF4A", "stroke-width": 20, "stroke-linecap": "round", "stroke-linejoin": "round" }, front);
    const fApex = svgEl("ellipse", { fill: "#F2CF4A" }, front);
    /* the message card: white paper riding down the stations */
    const card = svgEl("g", { class: "mk-cardg" }, world);
    const cBody = svgEl("path", { class: "mk-card" }, card);
    const cTail = svgEl("path", { class: "mk-card" }, card);
    const cL1 = svgEl("path", { class: "mk-card-line" }, card);
    const cL2 = svgEl("path", { class: "mk-card-line" }, card);
    const cTags = [0, 1].map(() => svgEl("path", { class: "mk-shape mk-on" }, card));
    const hint = svgEl("path", { class: "mk-hint" }, world);
    hint.style.display = "none";

    /* ---- state ---- */
    let p = 0, explode = 0, station = 1, sPos = 0, trackTop = 0, trackH = 1, stickyH = 1, open = false, pinned = null, lastScrollY = window.scrollY;
    const stationCount = LAYERS;
    const layerZ = (i, e) => -(LAYERS - 1 - i) * GAP * e;

    function render() {
      const e = explode;
      setCamera(e);
      /* framing: fit the opened stack into the viewBox around the closed mark's centre */
      const back = project(CX, CY, layerZ(0, e)), fr = project(CX, CY, 0);
      const spreadX = Math.abs(back[0] - fr[0]), spreadY = Math.abs(back[1] - fr[1]);
      const k = Math.min(1, 720 / (520 + spreadX * 1.15), 760 / (560 + spreadY * 1.2));
      const cx = (back[0] + fr[0]) / 2, cy = (back[1] + fr[1]) / 2;
      world.setAttribute("transform", "translate(" + (CX - cx * k).toFixed(1) + " " + (CY - cy * k + 10 * e).toFixed(1) + ") scale(" + k.toFixed(4) + ")");
      /* layers back to front */
      const act = station - 1;
      for (let i = 0; i < LAYERS; i++) {
        const L = layers[i], z = layerZ(i, e); L.z = z;
        const d = polyD(POLY, z);
        L.slab.setAttribute("d", d); L.edge.setAttribute("d", d);
        const op = i === LAYERS - 1 ? 1 : (0.3 + 0.5 * (i / (LAYERS - 1))) * Math.min(1, e * 3);
        L.g.style.opacity = op.toFixed(3);
        L.g.classList.toggle("is-active", i === act && e > 0.05);
        L.g.classList.toggle("is-done", i < act);
        const showShapes = e > 0.25 && !(i === LAYERS - 1 && e < 0.4);
        L.shapes.forEach(({ s, el }, j) => {
          el.style.display = showShapes ? "" : "none";
          if (!showShapes) return;
          if (s.t === "circle") setEllipse(el, s.x, s.y, s.r, z);
          else if (s.t === "rect") el.setAttribute("d", rectD(s.x, s.y, s.w, s.h, z));
          else el.setAttribute("d", lineD(s.pts, z));
          if (s.on) {
            const reached = i < act || (i === act && (sPos - i) >= 0.02 * ((s.delay || 0) + 1));
            el.classList.toggle(s.on, reached);
          }
        });
      }
      /* the front mark: official when closed, glass when open */
      front.style.opacity = (1 - 0.62 * e).toFixed(3);
      layers[LAYERS - 1].slab.style.opacity = Math.min(1, e * 2).toFixed(3);
      layers[LAYERS - 1].edge.style.opacity = "";
      fBody.setAttribute("d", polyD(POLY, 0));
      setEllipse(fRing, 505, 500, 13, 0);
      [548, 596, 644].forEach((y, j) => setEllipse(fNodes[j], 505, y, 15, 0));
      fStem.setAttribute("d", lineD([[500, 745], [500, 826]], 0) + " " + lineD([[360, 826], [640, 826]], 0));
      setEllipse(fFeet[0], 360, 826, 24, 0); setEllipse(fFeet[1], 640, 826, 24, 0);
      fChev.setAttribute("d", lineD([[452, 171], [500, 123], [548, 171]], 0));
      setEllipse(fApex, 500, 224, 38, 0);
      /* reflection under the front layer (dark theme) */
      const fp = project(CX, 826, 0);
      reflectG.setAttribute("transform", "translate(0 " + (2 * fp[1] + 4).toFixed(1) + ") scale(1 -1)");
      reflect.setAttribute("d", polyD(POLY, 0) + " " + rectD(493, 745, 14, 81, 0) + " " + rectD(360, 819, 280, 14, 0));
      maskRect.setAttribute("y", (fp[1] + 4).toFixed(1));
      reflectG.style.opacity = (0.22 * e).toFixed(3);
      /* the pool sits under the active layer */
      const ap = project(CX, 700, layers[act].z);
      pool.setAttribute("cx", ap[0].toFixed(1)); pool.setAttribute("cy", (fp[1] + 40).toFixed(1));
      pool.setAttribute("rx", (200 * ap[2]).toFixed(1)); pool.setAttribute("ry", (34).toFixed(1));
      pool.style.opacity = (0.9 * e).toFixed(3);
      /* the message card: hops between planes; becomes the reply at the last station */
      const show = e > 0.3;
      card.style.display = show ? "" : "none";
      if (show) {
        const k0 = Math.floor(sPos), f = sPos - k0;
        const zc = lerp(layerZ(Math.min(k0, LAYERS - 1), e), layerZ(Math.min(k0 + 1, LAYERS - 1), e), easeInOut(f));
        const w = 190, h = 64, x = 505 - w / 2, y = 430 - h / 2;
        cBody.setAttribute("d", rectD(x, y, w, h, zc));
        const isReply = station === stationCount;
        cBody.classList.toggle("is-reply", isReply);
        cTail.setAttribute("d", isReply ? lineD(isRtl0 ? [[x + w, y + h - 4], [x + w + 14, y + h + 8], [x + w - 16, y + h]] : [[x, y + h - 4], [x - 14, y + h + 8], [x + 16, y + h]], zc) + "Z" : "");
        cTail.classList.toggle("is-reply", isReply);
        const lx1 = isRtl0 ? x + w - 130 : x + 14, lx2 = isRtl0 ? x + w - 96 : x + 14;
        cL1.setAttribute("d", rectD(lx1, y + 18, 116, 7, zc));
        cL2.setAttribute("d", rectD(lx2, y + 34, 82, 7, zc));
        const tagged = sPos >= 2;
        cTags.forEach((t, j) => {
          t.style.display = tagged ? "" : "none";
          if (tagged) t.setAttribute("d", rectD((isRtl0 ? x + w - 60 - j * 66 : x + 4 + j * 66), y - 22, 56, 16, zc));
        });
        card.style.opacity = (1 - Math.max(0, (0.98 - e) / 0.98 * 0) ).toFixed(2);
        card.style.opacity = e < 0.55 ? ((e - 0.3) / 0.25).toFixed(2) : "1";
      }
    }

    /* ---- readout ---- */
    const two = (n) => (n < 10 ? "0" : "") + n;
    let lastRendered = 0;
    function readout(k, animate) {
      if (k === lastRendered) return;
      const first = lastRendered === 0;
      lastRendered = k;
      R.idx.textContent = two(k);
      if (animate && !first && !reduced) {
        const leave = R.main.cloneNode(true);
        leave.className = "mark__ar mark__leave";
        leave.removeAttribute("id");
        R.word.appendChild(leave);
        setTimeout(() => leave.remove(), 300);
      }
      R.main.textContent = T("st." + k);
      R.sub.textContent = T("st." + k + ".sub");
      R.desc.textContent = T("st." + k + ".d");
      if (animate && !first && !reduced) {
        [R.main, R.rule, R.desc].forEach((el) => { el.classList.remove("is-in"); void el.offsetWidth; el.classList.add("is-in"); });
      }
      R.index.forEach((b) => {
        const n = +b.getAttribute("data-station");
        b.setAttribute("aria-pressed", n === k ? "true" : "false");
        b.classList.toggle("is-done", n < k);
      });
      if (elevator) {
        Array.prototype.forEach.call(elevator.querySelectorAll("li"), (li) => {
          const n = +li.getAttribute("data-station");
          li.classList.toggle("is-active", n === k);
          li.classList.toggle("is-done", n < k);
        });
        const c = elevator.querySelector(".el__card");
        if (c) { c.style.setProperty("--el", k - 1); c.classList.toggle("is-reply", k === stationCount); }
      }
    }
    const setMessage = () => { if (R.msg) R.msg.textContent = T("demo." + ((window.SB && window.SB.sector) || "store") + ".1"); };
    setMessage();
    document.addEventListener("sb:sector", setMessage);
    document.addEventListener("sb:langchange", () => { lastRendered = 0; readout(station, false); setMessage(); if (R.of) R.of.textContent = T("mark.of"); });

    /* ---- progress from scroll ---- */
    function measure() {
      trackTop = docTop(track);
      trackH = track.offsetHeight;
      stickyH = sticky.offsetHeight;
    }
    const smooth = (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
    function compute() {
      if (reduced) { explode = 1; sPos = 3; station = 4; return; }
      const range = Math.max(1, trackH - stickyH);
      p = clamp((window.scrollY - trackTop) / range, 0, 1);
      explode = p < 0.22 ? smooth(p / 0.22) : (p > 0.86 ? 1 - smooth((p - 0.86) / 0.14) : 1);
      const raw = clamp((p - 0.24) / (0.82 - 0.24), 0, 1) * (stationCount - 1);
      const k0 = Math.floor(raw), f = raw - k0;
      /* the card lingers at each station, then hops */
      const hop = f < 0.55 ? 0 : easeInOut((f - 0.55) / 0.45);
      sPos = Math.min(stationCount - 1, k0 + hop);
      if (pinned !== null) { sPos = pinned - 1; }
      station = clamp(Math.round(sPos), 0, stationCount - 1) + 1;
    }
    function frame() {
      compute();
      const nowOpen = explode > 0.015;
      if (nowOpen !== open) { open = nowOpen; scene.classList.toggle("is-open", open); }
      if (open || reduced) render();
      readout(station, true);
    }
    subs.push(() => {
      if (pinned !== null && Math.abs(window.scrollY - lastScrollY) > 40) { pinned = null; }
      lastScrollY = window.scrollY;
      if (!reduced) frame();
    });
    const remeasure = () => { measure(); frame(); };
    window.addEventListener("resize", remeasure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(remeasure);
    if ("ResizeObserver" in window) new ResizeObserver(() => { measure(); }).observe(document.body);

    /* ---- interaction: index buttons scroll to the station; hover a layer pins; drag orbits; arrows step ---- */
    const scrollToStation = (k) => {
      const range = Math.max(1, trackH - stickyH);
      const pk = 0.24 + ((k - 1) / (stationCount - 1)) * (0.82 - 0.24) + 0.012;
      window.scrollTo({ top: trackTop + pk * range, behavior: reduced ? "auto" : "smooth" });
    };
    R.index.forEach((b) => {
      b.addEventListener("click", () => { pinned = null; scrollToStation(+b.getAttribute("data-station")); });
      b.addEventListener("keydown", (e) => {
        const k = +b.getAttribute("data-station");
        const next = (e.key === "ArrowRight" || e.key === "ArrowDown") ? (rtl() && e.key === "ArrowRight" ? k - 1 : k + 1)
          : (e.key === "ArrowLeft" || e.key === "ArrowUp") ? (rtl() && e.key === "ArrowLeft" ? k + 1 : k - 1) : null;
        if (next && next >= 1 && next <= stationCount) { e.preventDefault(); R.index[next - 1].focus(); scrollToStation(next); }
      });
    });
    if (fine && !reduced) {
      layers.forEach((L, i) => {
        L.slab.style.pointerEvents = "auto";
        L.slab.addEventListener("pointerenter", () => { if (explode > 0.5) { pinned = i + 1; lastScrollY = window.scrollY; frame(); } });
      });
      scene.addEventListener("pointerleave", () => { pinned = null; frame(); });
      /* drag to orbit within ±15°, springs back with high damping */
      let dragging = false, x0 = 0, v = 0, raf = null;
      const spring = () => {
        dragYaw *= 0.82; if (Math.abs(dragYaw) < 0.05) { dragYaw = 0; raf = null; frame(); return; }
        frame(); raf = requestAnimationFrame(spring);
      };
      scene.addEventListener("pointerdown", (e) => { if (e.button !== 0) return; dragging = true; x0 = e.clientX; scene.classList.add("is-grabbing"); scene.setPointerCapture(e.pointerId); if (raf) { cancelAnimationFrame(raf); raf = null; } });
      scene.addEventListener("pointermove", (e) => { if (!dragging) return; dragYaw = clamp((e.clientX - x0) * 0.12, -15, 15); frame(); });
      const up = () => { if (!dragging) return; dragging = false; scene.classList.remove("is-grabbing"); raf = requestAnimationFrame(spring); };
      scene.addEventListener("pointerup", up); scene.addEventListener("pointercancel", up);
    }
    if (elevator) {
      Array.prototype.forEach.call(elevator.querySelectorAll("li"), (li) => li.addEventListener("click", () => scrollToStation(+li.getAttribute("data-station"))));
    }
    if (reduced) {
      track.classList.add("is-static");
      scene.classList.add("is-open");
      measure(); explode = 1; sPos = 3; station = 4; render(); readout(4, false);
    } else {
      measure(); frame();
    }
    document.addEventListener("sb:themechange", () => { if (open) render(); });
  })();

  /* =====================================================================
     3. STATIONS — solutions that finish a job
     ===================================================================== */
  const stations = Array.prototype.slice.call(document.querySelectorAll(".station"));
  if (stations.length) {
    const play = (st) => {
      if (st.classList.contains("is-playing")) return;
      st.classList.remove("is-done");
      void st.offsetWidth;
      st.classList.add("is-playing");
      const card = st.closest(".sol-card");
      if (card) card.classList.add("is-active");
      if (Thread) Thread.hot("custom-solutions", true);
      clearTimeout(st._t);
      st._t = setTimeout(() => {
        st.classList.remove("is-playing"); st.classList.add("is-done"); st._end = Date.now();
        if (card) card.classList.remove("is-active");
        if (Thread) Thread.hot("custom-solutions", false);
      }, reduced ? 10 : 2500);
    };
    if ("IntersectionObserver" in window && !reduced) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => { if (en.isIntersecting && !en.target.classList.contains("is-done")) { play(en.target); io.unobserve(en.target); } });
      }, { threshold: phone() ? 0.5 : 0.6 });
      stations.forEach((s) => io.observe(s));
    } else {
      stations.forEach((s) => s.classList.add("is-done"));
    }
    stations.forEach((st) => {
      const btn = st.querySelector(".station__replay");
      if (btn) btn.addEventListener("click", (e) => { e.stopPropagation(); play(st); });
      st.addEventListener("click", (e) => { if (e.target.closest("a, button")) return; if (st.classList.contains("is-done")) play(st); });
      if (fine) st.addEventListener("pointerenter", () => { if (st.classList.contains("is-done") && Date.now() - (st._end || 0) > 1500) play(st); });
    });
  }

  /* =====================================================================
     4. THE SCAN: active sweep, axes are drawn by scan.js; personalisation
     ===================================================================== */
  const scanPanel = document.getElementById("scanPanel");
  if (scanPanel && "IntersectionObserver" in window && !reduced) {
    new IntersectionObserver((entries) => entries.forEach((en) => scanPanel.classList.toggle("is-active", en.isIntersecting)), { threshold: 0.25 }).observe(scanPanel);
  }
  (() => {
    const MAP = { comm: "sol-cs", leak: "sol-sales", manual: "sol-auto", frag: "sol-auto" };
    let current = null;
    const clear = () => {
      document.querySelectorAll(".sol-card.is-recommended").forEach((c) => { c.classList.remove("is-recommended"); const chip = c.querySelector(".sol-card__reco"); if (chip) chip.remove(); });
      const from = document.getElementById("ctaFrom"); if (from) from.hidden = true;
      current = null;
    };
    document.addEventListener("sb:scanresult", (e) => {
      clear();
      const d = e.detail || {};
      let id = MAP[d.topKey] || "sol-cs";
      if (d.band === 3 && (d.type === "b2b" || d.type === "services" || d.type === "clinic") && d.topKey === "frag") id = "sol-custom";
      if (d.topKey === "manual" && (d.type === "b2b" || d.type === "services")) id = "sol-pro";
      const card = document.getElementById(id);
      if (card) {
        card.classList.add("is-recommended");
        const chip = document.createElement("span"); chip.className = "sol-card__reco"; chip.textContent = T("reco"); card.appendChild(chip);
        current = card;
      }
      const from = document.getElementById("ctaFrom"), lbl = document.getElementById("ctaFromLabel");
      if (from && lbl && d.topLabel) { lbl.textContent = d.topLabel; from.hidden = false; }
      if (Thread) Thread.hot("custom-solutions", true);
    });
    document.addEventListener("sb:scanreset", () => { clear(); if (Thread) Thread.hot("custom-solutions", false); });
    document.addEventListener("sb:langchange", () => { if (current) { const chip = current.querySelector(".sol-card__reco"); if (chip) chip.textContent = T("reco"); } });
  })();

  /* =====================================================================
     5. GUARD, PORTFOLIO, SHIFT, FOOTER, COUNTERS, ACTION BAR
     ===================================================================== */
  const guard = document.querySelector(".guard");
  if (guard) {
    if ("IntersectionObserver" in window) new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) guard.classList.add("is-visible"); }), { threshold: 0.2 }).observe(guard);
    else guard.classList.add("is-visible");
    guard.querySelectorAll(".guard__list li").forEach((li) => {
      li.addEventListener("click", () => li.classList.toggle("is-open"));
      li.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); li.classList.toggle("is-open"); } });
    });
  }
  const pf = document.getElementById("pfMock");
  if (pf) {
    const playPf = () => { pf.classList.remove("is-done", "is-playing"); void pf.offsetWidth; pf.classList.add("is-playing"); clearTimeout(pf._t); pf._t = setTimeout(() => { pf.classList.remove("is-playing"); pf.classList.add("is-done"); }, 4200); };
    if ("IntersectionObserver" in window && !reduced) {
      const io = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { playPf(); io.unobserve(pf); } }), { threshold: 0.5 });
      io.observe(pf);
    } else pf.classList.add("is-done");
    const rb = document.querySelector(".pf-mock__replay");
    if (rb) rb.addEventListener("click", playPf);
    pf.addEventListener("click", () => { if (pf.classList.contains("is-done")) playPf(); });
  }
  const shift = document.getElementById("shift");
  if (shift) {
    const set = (w) => {
      shift.style.setProperty("--wipe", w);
      shift.querySelectorAll(".shift__switch button").forEach((b) => b.setAttribute("aria-pressed", (b.getAttribute("data-shift") === "after") === (w >= 0.5) ? "true" : "false"));
    };
    shift.querySelectorAll(".shift__switch button").forEach((b) => b.addEventListener("click", () => { shift._manual = true; set(b.getAttribute("data-shift") === "after" ? 1 : 0); }));
    if (reduced) set(1);
    else if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting && !shift._manual) { setTimeout(() => { if (!shift._manual) set(1); }, 700); io.unobserve(shift); } }), { threshold: 0.6 });
      io.observe(shift);
    }
  }
  const footer = document.getElementById("footer");
  if (footer && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { footer.classList.add("is-arrived"); io.unobserve(footer); } }), { threshold: 0.3 });
    io.observe(footer);
  }
  /* numerals count once on reveal */
  if (!reduced && "IntersectionObserver" in window) {
    const targets = document.querySelectorAll(".price-block__main b, .price-card__price b, .map-strip__amount b, .price-now");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        const el = en.target, text = el.textContent, m = text.match(/(\d[\d,]*)/);
        if (!m) return;
        const target = parseInt(m[1].replace(/,/g, ""), 10);
        if (!target) return;
        const pre = text.slice(0, m.index), post = text.slice(m.index + m[1].length);
        const t0 = performance.now();
        el.classList.add("is-counting");
        const tick = (now) => {
          const t = clamp((now - t0) / 600, 0, 1), v = Math.round(target * easeOut(t));
          el.textContent = pre + v.toLocaleString("en-US") + post;
          if (t < 1) requestAnimationFrame(tick); else el.classList.remove("is-counting");
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });
    targets.forEach((t) => io.observe(t));
  }
  /* the thumb-reach action pair after the hero (phones) */
  const actbar = document.getElementById("actbar");
  const hero = document.getElementById("hero");
  if (actbar && hero && "IntersectionObserver" in window) {
    let heroOut = false, near = false;
    const apply = () => {
      const on = phone() && heroOut && !near && !document.body.classList.contains("sb-open");
      actbar.classList.toggle("is-on", on);
      document.body.classList.toggle("has-actbar", on);
    };
    new IntersectionObserver((entries) => entries.forEach((en) => { heroOut = !en.isIntersecting; apply(); }), { threshold: 0.05 }).observe(hero);
    const nearIO = new IntersectionObserver((entries) => { near = entries.some((en) => en.isIntersecting); apply(); }, { threshold: 0.15 });
    ["scan", "contact"].forEach((id) => { const el = document.getElementById(id); if (el) nearIO.observe(el); });
    actbar.hidden = false;
    window.addEventListener("resize", apply);
    document.addEventListener("sb:assistant", apply);
  }

  /* =====================================================================
     6. VIEW TRANSITIONS between the pages
     ===================================================================== */
  document.querySelectorAll('a[href^="pricing.html#"]').forEach((a) => {
    a.addEventListener("click", () => {
      const holder = a.closest(".sol-card, .ready-flag, .map-card");
      if (holder) holder.style.viewTransitionName = "card";
    });
  });

  /* =====================================================================
     7. DAYLIGHT CAUSTICS — a small shader on the Sand ground (light theme, desktop)
     ===================================================================== */
  (() => {
    const ambient = document.querySelector(".ambient");
    if (!ambient || reduced || !("WebGLRenderingContext" in window) || window.matchMedia("(max-width: 1024px)").matches) return;
    let canvas = null, gl = null, prog = null, uT = null, uR = null, running = false, last = 0, raf = null;
    const isLight = () => root.getAttribute("data-theme") === "light";
    const setup = () => {
      canvas = document.createElement("canvas"); canvas.className = "ambient__gl";
      ambient.appendChild(canvas);
      gl = canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: "low-power" });
      if (!gl) { canvas.remove(); canvas = null; return false; }
      const vs = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";
      const fs = "precision mediump float;uniform float t;uniform vec2 r;" +
        "void main(){vec2 uv=gl_FragCoord.xy/r;uv.x*=r.x/r.y;float a=0.;" +
        "for(int i=0;i<3;i++){float f=float(i);vec2 p=uv*(1.6+f*1.1)+vec2(sin(t*.05+f*1.7),cos(t*.04+f*.9))*.7;" +
        "float c=sin(p.x*3.1+t*.09+sin(p.y*2.7-t*.07))*cos(p.y*2.3-t*.06+sin(p.x*1.9+t*.05));a+=pow(max(0.,c),5.)/(1.6+f);}" +
        "a=smoothstep(.03,.9,a)*.16;gl_FragColor=vec4(vec3(a),a);}";
      const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
      prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); canvas = null; return false; }
      gl.useProgram(prog);
      const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, "a"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      uT = gl.getUniformLocation(prog, "t"); uR = gl.getUniformLocation(prog, "r");
      size();
      return true;
    };
    const size = () => { if (!canvas) return; canvas.width = Math.max(64, Math.round(innerWidth / 4)); canvas.height = Math.max(64, Math.round(innerHeight / 4)); gl.viewport(0, 0, canvas.width, canvas.height); };
    const loop = (now) => {
      if (!running) { raf = null; return; }
      if (now - last > 41) { last = now; gl.uniform1f(uT, now / 1000); gl.uniform2f(uR, canvas.width, canvas.height); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); }
      raf = requestAnimationFrame(loop);
    };
    const sync = () => {
      const want = isLight() && !document.hidden;
      if (want && !canvas && !setup()) return;
      if (!canvas) return;
      canvas.classList.toggle("is-on", want);
      if (want && !running) { running = true; raf = requestAnimationFrame(loop); }
      if (!want) running = false;
    };
    document.addEventListener("sb:themechange", sync);
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("resize", () => { size(); });
    sync();
  })();
})();
