/* ============================================================
   فحص صبّارة — تشخيص قائم على قواعد (ثنائي اللغة)
   Sabbarah Scan — rule-based diagnostic (bilingual)

   المنطق كما هو من النسخة السابقة، مع فصل النصوص عن القواعد
   حتى تعمل الواجهة بالعربية والإنجليزية دون تكرار المحرّك.
   ============================================================ */
(function () {
  "use strict";

  /* اللغة الحالية — يوفرها js/i18n.js */
  function lang() {
    return window.SB && window.SB.lang === "en" ? "en" : "ar";
  }
  function L(pair) {
    return pair && (pair[lang()] || pair.ar);
  }
  function T(key) {
    return window.SB ? window.SB.t(key) : "";
  }

  /* ---------- 1) إعدادات أنواع النشاط ---------- */
  var TYPES = {
    ecom: {
      label: { ar: "متجر إلكتروني", en: "Online store" },
      start: {
        comm: { ar: "الرد على استفسارات المنتجات والطلبات", en: "Answering product and order inquiries" },
        leak: { ar: "متابعة العميل اللي سأل وما أكمل الطلب", en: "Following up with customers who asked but didn't complete the order" },
        manual: { ar: "متابعة الطلبات والتقارير اليومية", en: "Tracking orders and daily reporting" },
        frag: { ar: "نقل بيانات الطلبات بين أدواتك", en: "Moving order data between your tools" },
      },
    },
    clinic: {
      label: { ar: "عيادة / مركز طبي", en: "Clinic / medical centre" },
      start: {
        comm: { ar: "الرد على استفسارات الحجز والأسعار", en: "Answering booking and pricing inquiries" },
        leak: { ar: "تذكير ومتابعة المواعيد", en: "Appointment reminders and follow-up" },
        manual: { ar: "تنظيم الحجوزات والتقارير اليومية", en: "Organising bookings and daily reports" },
        frag: { ar: "نقل بيانات المراجعين بين الأنظمة", en: "Moving patient data between systems" },
      },
    },
    restaurant: {
      label: { ar: "مطعم / كافيه", en: "Restaurant / café" },
      start: {
        comm: { ar: "الرد على الاستفسارات المتكررة", en: "Answering repetitive inquiries" },
        leak: { ar: "متابعة الحجوزات والطلبات المفتوحة", en: "Following up on reservations and open orders" },
        manual: { ar: "تنظيم الطلبات والتقارير اليومية", en: "Organising orders and daily reports" },
        frag: { ar: "ربط الطلبات مع بقية أدواتك", en: "Connecting orders with the rest of your tools" },
      },
    },
    realestate: {
      label: { ar: "عقارات", en: "Real estate" },
      start: {
        comm: { ar: "الرد على استفسارات العروض والمعاينات", en: "Answering listing and viewing inquiries" },
        leak: { ar: "متابعة العميل المحتمل", en: "Following up with prospective buyers" },
        manual: { ar: "تنظيم بيانات العروض والتقارير", en: "Organising listing data and reports" },
        frag: { ar: "نقل بيانات العملاء بين الأنظمة", en: "Moving client data between systems" },
      },
    },
    b2b: {
      label: { ar: "خدمات B2B", en: "B2B services" },
      start: {
        comm: { ar: "استقبال الطلبات الواردة وتأهيلها", en: "Receiving and qualifying inbound requests" },
        leak: { ar: "متابعة العميل المحتمل", en: "Following up with prospects" },
        manual: { ar: "التقارير التشغيلية والمتابعة الداخلية", en: "Operational reporting and internal follow-up" },
        frag: { ar: "نقل البيانات بين الأنظمة", en: "Moving data between systems" },
      },
    },
    services: {
      label: { ar: "شركة / مكتب خدمات", en: "Services company / office" },
      start: {
        comm: { ar: "الرد على الاستفسارات المتكررة", en: "Answering repetitive inquiries" },
        leak: { ar: "متابعة الطلبات المفتوحة", en: "Following up on open requests" },
        manual: { ar: "التقارير التشغيلية والعمل الإداري", en: "Operational reporting and admin work" },
        frag: { ar: "نقل البيانات بين الأنظمة", en: "Moving data between systems" },
      },
    },
    other: {
      label: { ar: "نشاط آخر", en: "Another business type" },
      start: {
        comm: { ar: "الرد على الاستفسارات المتكررة", en: "Answering repetitive inquiries" },
        leak: { ar: "متابعة العميل المحتمل", en: "Following up with prospects" },
        manual: { ar: "العمل الإداري المتكرر والتقارير", en: "Repetitive admin work and reports" },
        frag: { ar: "نقل البيانات بين الأنظمة", en: "Moving data between systems" },
      },
    },
  };

  /* ---------- 2) الأسئلة السبعة ---------- */
  var Q = [
    {
      q: { ar: "وش نوع نشاطك؟", en: "What type of business do you run?" },
      wide: true,
      a: [
        [{ ar: "متجر إلكتروني", en: "Online store" }, { type: "ecom" }],
        [{ ar: "عيادة / مركز طبي", en: "Clinic / medical centre" }, { type: "clinic" }],
        [{ ar: "مطعم / كافيه", en: "Restaurant / café" }, { type: "restaurant" }],
        [{ ar: "عقارات", en: "Real estate" }, { type: "realestate" }],
        [{ ar: "خدمات B2B", en: "B2B services" }, { type: "b2b" }],
        [{ ar: "شركة / مكتب خدمات", en: "Services company / office" }, { type: "services" }],
        [{ ar: "نشاط آخر", en: "Another business type" }, { type: "other" }],
      ],
    },
    {
      q: { ar: "ما أكثر شيء يستهلك وقتك يوميًا؟", en: "What consumes most of your time each day?" },
      a: [
        [{ ar: "الرد على الاستفسارات المتكررة", en: "Answering repetitive inquiries" }, { comm: 2, pain: "comm" }],
        [{ ar: "متابعة العملاء والمواعيد", en: "Following up with customers and appointments" }, { leak: 2, pain: "leak" }],
        [{ ar: "التقارير وإدخال البيانات", en: "Reports and data entry" }, { manual: 2, pain: "manual" }],
        [{ ar: "تنسيق الطلبات والعمليات اليومية", en: "Coordinating orders and daily operations" }, { manual: 1, frag: 1, pain: "frag" }],
      ],
    },
    {
      q: { ar: "من وين توصلك الاستفسارات، وكم تقريبًا؟", en: "Where do inquiries reach you, and roughly how many?" },
      a: [
        [{ ar: "قناة وحدة وعدد محدود", en: "One channel, a limited number" }, { comm: 1 }],
        [{ ar: "قناة وحدة وعدد كبير يوميًا", en: "One channel, a high daily volume" }, { comm: 3 }],
        [{ ar: "أكثر من قناة وعدد متوسط", en: "Several channels, a moderate volume" }, { comm: 3, frag: 1 }],
        [{ ar: "أكثر من قناة وصعب نلحق عليها", en: "Several channels, hard to keep up with" }, { comm: 4, frag: 1 }],
      ],
    },
    {
      q: { ar: "هل تتابعون العميل إذا سأل وما أكمل؟", en: "Do you follow up when a customer asks but doesn't complete?" },
      a: [
        [{ ar: "نعم، متابعة منظمة ومسجّلة", en: "Yes — structured and logged follow-up" }, { leak: 1 }],
        [{ ar: "نتابع، بس حسب الوقت والتذكر", en: "We do, but it depends on time and memory" }, { leak: 3 }],
        [{ ar: "نادرًا", en: "Rarely" }, { leak: 4 }],
        [{ ar: "ما نتابع أصلًا", en: "We don't follow up at all" }, { leak: 4 }],
      ],
    },
    {
      q: {
        ar: "كم من شغلك اليومي يتكرر يدويًا (تعبئة، نسخ، تجهيز تقارير)؟",
        en: "How much of your daily work is repeated manually (filling, copying, preparing reports)?",
      },
      a: [
        [{ ar: "شي بسيط", en: "Very little" }, { manual: 1 }],
        [{ ar: "ربع اليوم تقريبًا", en: "About a quarter of the day" }, { manual: 2 }],
        [{ ar: "نص اليوم تقريبًا", en: "About half the day" }, { manual: 3 }],
        [{ ar: "أغلب اليوم", en: "Most of the day" }, { manual: 4 }],
      ],
    },
    {
      q: {
        ar: "هل تنقلون معلومات يدويًا بين أكثر من نظام أو ملف؟",
        en: "Do you move information by hand between more than one system or file?",
      },
      a: [
        [{ ar: "لا، أنظمتنا مربوطة", en: "No — our systems are connected" }, { frag: 1 }],
        [{ ar: "أحيانًا وفي حالات محددة", en: "Sometimes, in specific cases" }, { frag: 2 }],
        [{ ar: "نعم، بشكل شبه يومي", en: "Yes — almost daily" }, { frag: 4 }],
        [{ ar: "نشتغل على ملفات وواتساب بدون نظام", en: "We work off files and WhatsApp with no system" }, { frag: 4, manual: 1 }],
      ],
    },
    {
      q: { ar: "وين تحتاجون قرار موظف بشري؟", en: "Where do you need a human decision?" },
      a: [
        [{ ar: "أغلب القرارات تحتاج موظف", en: "Most decisions need a person" }, { human: 4 }],
        [
          { ar: "في الحالات الحساسة فقط (تسعير، شكاوى، استثناءات)", en: "Only in sensitive cases (pricing, complaints, exceptions)" },
          { human: 2 },
        ],
        [{ ar: "نادرًا — أغلب الطلبات متشابهة", en: "Rarely — most requests are alike" }, { human: 1 }],
        [{ ar: "ما هو واضح عندنا", en: "It isn't clearly defined for us" }, { human: 2 }],
      ],
    },
  ];

  /* ---------- 3) محرك القواعد ---------- */
  var DIMS = ["comm", "leak", "manual", "frag"];
  var LEVEL_BAR = [28, 52, 78, 95];

  /* «الفرق اللي ممكن تصنعه صبّارة» — كل شريط يمثل حجم الاحتكاك: أقصر = أفضل */
  var TARGET = {
    repetitiveQuestions: { comm: "low", leak: "medium", manual: "low", frag: "unchanged" },
    followUp: { comm: "medium", leak: "low", manual: "low", frag: "unchanged" },
    reporting: { comm: "slight", leak: "slight", manual: "low", frag: "low" },
    appointments: { comm: "low", leak: "medium", manual: "low", frag: "depends" },
    systemIntegration: { comm: "unchanged", leak: "depends", manual: "low", frag: "low" },
  };

  function targetKey(top, type) {
    if (top === "leak" && (type === "clinic" || type === "restaurant")) return "appointments";
    if (top === "comm") return "repetitiveQuestions";
    if (top === "leak") return "followUp";
    if (top === "manual") return "reporting";
    return "systemIntegration";
  }

  /* الهدف لا يكون أسوأ من الوضع الحالي أبدًا */
  function targetLevel(rule, cur) {
    switch (rule) {
      case "low":
        return 0;
      case "medium":
        return Math.min(cur, 1);
      case "slight":
        return cur >= 2 ? cur - 1 : cur;
      case "depends":
        return cur >= 2 ? cur - 1 : cur;
      default:
        return cur;
    }
  }

  function levelOf(v) {
    if (v <= 1) return 0;
    if (v <= 2) return 1;
    if (v <= 4) return 2;
    return 3;
  }

  function evaluate(answers) {
    var d = { comm: 0, leak: 0, manual: 0, frag: 0, human: 2 },
      type = "other",
      pain = null;

    answers.forEach(function (e) {
      if (!e) return;
      if (e.type) type = e.type;
      if (e.pain) pain = e.pain;
      DIMS.concat(["human"]).forEach(function (k) {
        if (e[k]) d[k] = k === "human" ? e[k] : d[k] + e[k];
      });
    });

    var cfg = TYPES[type] || TYPES.other;

    /* أولوية الأتمتة: مجموع الأبعاد الأربعة (4 → 18) */
    var total = d.comm + d.leak + d.manual + d.frag;
    var band = total <= 7 ? 0 : total <= 11 ? 1 : total <= 15 ? 2 : 3;

    /* أول موضع يستاهل الأتمتة: أعلى بُعد، والتعادل يُحسم بأكثر شي يستهلك الوقت */
    var order = [pain, "leak", "comm", "manual", "frag"];
    var top = DIMS.slice().sort(function (a, b) {
      if (d[b] !== d[a]) return d[b] - d[a];
      return order.indexOf(a) - order.indexOf(b);
    })[0];

    var tKey = targetKey(top, type),
      rules = TARGET[tKey];
    var compare = { model: tKey, now: [], next: [] };

    DIMS.forEach(function (k) {
      var cur = levelOf(d[k]),
        tgt = targetLevel(rules[k], cur);
      compare.now.push({ key: k, level: cur, ok: cur <= 1, focus: false });
      compare.next.push({ key: k, level: tgt, ok: tgt <= 1, focus: cur - tgt >= 2 });
    });

    return {
      type: type,
      typeLabel: cfg.label,
      compare: compare,
      band: band,
      topKey: top,
      topLabel: cfg.start[top],
      human: d.human,
      _debug: { total: total, dims: d },
    };
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { Q: Q, evaluate: evaluate };
  }

  /* ---------- 4) الربط بالواجهة ---------- */
  var panel = typeof document !== "undefined" && document.getElementById("scanPanel");
  if (!panel) return;

  var stages = {
    intro: document.getElementById("scanIntro"),
    quiz: document.getElementById("scanQuiz"),
    load: document.getElementById("scanAnalyzing"),
    res: document.getElementById("scanResult"),
  };
  var elStep = document.getElementById("scanStep"),
    elBar = document.getElementById("scanBarFill"),
    elQ = document.getElementById("scanQuestion"),
    elOpts = document.getElementById("scanOptions"),
    elBack = document.getElementById("scanBack"),
    elPhase = document.getElementById("scanPhase"),
    elPriority = document.getElementById("scanPriority"),
    elTop = document.getElementById("scanTop"),
    elHuman = document.getElementById("scanHuman"),
    elWhy = document.getElementById("scanWhy"),
    elBadge = document.querySelector(".scan-head__badge"),
    elNow = document.getElementById("cmpNow"),
    elNext = document.getElementById("cmpNext");

  var idx = 0,
    answers = [],
    lastResult = null,
    current = "intro";

  function drawBars(box, rows) {
    box.innerHTML = "";
    rows.forEach(function (r) {
      var w = document.createElement("div");
      w.className = "cbar" + (r.ok ? " cbar--ok" : "") + (r.focus ? " cbar--focus" : "");
      var name = document.createElement("b");
      name.textContent = T("dim." + r.key);
      var label = document.createElement("span");
      label.textContent = T("level." + r.level);
      var bar = document.createElement("i");
      w.appendChild(name);
      w.appendChild(label);
      w.appendChild(bar);
      box.appendChild(w);
      requestAnimationFrame(function () {
        bar.style.setProperty("--v", LEVEL_BAR[r.level] + "%");
      });
    });
  }

  function stage(name) {
    current = name;
    Object.keys(stages).forEach(function (k) {
      stages[k].hidden = k !== name;
    });
    if (elBadge) elBadge.hidden = name !== "intro"; /* الشارة للتمهيد فقط */
  }

  function render() {
    elStep.textContent = T("scan.step").replace("{n}", idx + 1).replace("{total}", Q.length);
    elBar.style.width = (idx / Q.length) * 100 + "%";
    elQ.textContent = L(Q[idx].q);
    elOpts.className = "scan__options" + (Q[idx].wide ? " scan__options--wide" : "");
    elOpts.innerHTML = "";
    Q[idx].a.forEach(function (opt) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "scan__opt";
      b.textContent = L(opt[0]);
      if (answers[idx] === opt[1]) b.classList.add("is-picked");
      b.addEventListener("click", function () {
        answers[idx] = opt[1];
        next();
      });
      elOpts.appendChild(b);
    });
    elBack.textContent = T("scan.back");
    elBack.hidden = idx === 0;
  }

  function next() {
    if (idx < Q.length - 1) {
      idx++;
      render();
    } else {
      elBar.style.width = "100%";
      analyze();
    }
  }

  function analyze() {
    stage("load");
    var p = 0;
    elPhase.textContent = T("scan.phase.1");
    var iv = setInterval(function () {
      p++;
      if (p < 4) elPhase.textContent = T("scan.phase." + (p + 1));
    }, 760);
    setTimeout(function () {
      clearInterval(iv);
      lastResult = evaluate(answers);
      show(lastResult);
    }, 3000);
  }

  function show(r) {
    stage("res");
    elPriority.textContent = T("band." + r.band);
    elTop.textContent = L(r.topLabel);

    elWhy.innerHTML = "";
    var whyLabel = document.createElement("b");
    whyLabel.textContent = T("scan.why");
    elWhy.appendChild(whyLabel);
    elWhy.appendChild(document.createTextNode(" " + T("why." + r.topKey)));

    elHuman.innerHTML = "";
    elHuman.appendChild(document.createTextNode(T("scan.human") + " "));
    var humanVal = document.createElement("b");
    humanVal.textContent = T("human." + r.human) || T("human.2");
    elHuman.appendChild(humanVal);

    drawBars(elNow, r.compare.now);
    drawBars(elNext, r.compare.next);
  }

  document.getElementById("scanStart").addEventListener("click", function () {
    idx = 0;
    answers = [];
    stage("quiz");
    render();
    panel.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  elBack.addEventListener("click", function () {
    if (idx > 0) {
      idx--;
      render();
    }
  });

  document.getElementById("scanRestart").addEventListener("click", function () {
    idx = 0;
    answers = [];
    lastResult = null;
    stage("intro");
    panel.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  /* إعادة رسم المحتوى المولَّد عند تبديل اللغة */
  document.addEventListener("sb:langchange", function () {
    if (current === "quiz") render();
    else if (current === "res" && lastResult) show(lastResult);
  });
})();
