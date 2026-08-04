/* ============================================================
   صبّارة AI — نظام اللغة (عربي افتراضي / إنجليزي)
   SABBARAH AI — bilingual engine (Arabic-first / English)

   كيف يعمل:
   1) العربية هي المصدر — مكتوبة داخل HTML كما هي.
   2) الإنجليزية تُكتب بجانبها في السمة data-en (ومشتقاتها للسمات).
      <h2 data-en="Custom Solutions">الحلول المخصصة</h2>
      <meta name="description" data-en-content="..." content="...">
   3) النصوص التي يولّدها الجافاسكربت (الفحص، العرض الحي) تأتي من
      قاموس STRINGS في الأسفل عبر SB.t('key').
   4) اللغة تُحفظ في localStorage وتبقى ثابتة بين index.html و pricing.html.
   ============================================================ */
(function (global) {
  "use strict";

  var STORAGE_KEY = "sabbarah-lang";
  var ATTR_MAP = {
    enContent: "content",
    enAriaLabel: "aria-label",
    enTitle: "title",
    enPlaceholder: "placeholder",
    enAlt: "alt",
  };

  /* نسخة العربية الأصلية من الصفحة — تُلتقط مرة واحدة قبل أي تبديل */
  var originalHTML = new WeakMap();
  var originalAttr = new WeakMap();

  function readStored() {
    try {
      return localStorage.getItem(STORAGE_KEY) === "en" ? "en" : "ar";
    } catch (e) {
      return "ar";
    }
  }

  function store(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      /* التصفح الخاص — نكمل بدون حفظ */
    }
  }

  /* ---------- تبديل النصوص ---------- */
  function applyText(lang) {
    var nodes = document.querySelectorAll("[data-en]");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (!originalHTML.has(el)) originalHTML.set(el, el.innerHTML);
      el.innerHTML = lang === "en" ? el.getAttribute("data-en") : originalHTML.get(el);
    }
  }

  function applyAttrs(lang) {
    for (var key in ATTR_MAP) {
      if (!Object.prototype.hasOwnProperty.call(ATTR_MAP, key)) continue;
      var attr = ATTR_MAP[key];
      var nodes = document.querySelectorAll("[data-en-" + attr + "]");
      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i];
        var bag = originalAttr.get(el) || {};
        if (!(attr in bag)) {
          bag[attr] = el.getAttribute(attr) || "";
          originalAttr.set(el, bag);
        }
        el.setAttribute(attr, lang === "en" ? el.getAttribute("data-en-" + attr) : bag[attr]);
      }
    }
  }

  function syncSwitch(lang) {
    var btns = document.querySelectorAll("[data-lang-btn]");
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      b.setAttribute("aria-pressed", b.getAttribute("data-lang-btn") === lang ? "true" : "false");
    }
  }

  var SB = {
    lang: "ar",

    /* نص من قاموس الجافاسكربت */
    t: function (key) {
      var table = SB.STRINGS[SB.lang] || SB.STRINGS.ar;
      if (table && key in table) return table[key];
      return (SB.STRINGS.ar && SB.STRINGS.ar[key]) || "";
    },

    set: function (lang, persist) {
      lang = lang === "en" ? "en" : "ar";
      SB.lang = lang;
      var root = document.documentElement;
      root.setAttribute("data-lang", lang);
      root.lang = lang === "en" ? "en" : "ar";
      root.dir = lang === "en" ? "ltr" : "rtl";
      applyText(lang);
      applyAttrs(lang);
      syncSwitch(lang);
      if (persist !== false) store(lang);
      root.classList.add("i18n-ready");
      document.dispatchEvent(new CustomEvent("sb:langchange", { detail: { lang: lang } }));
    },

    toggle: function () {
      SB.set(SB.lang === "en" ? "ar" : "en");
    },
  };

  /* ============================================================
     قاموس النصوص التي يولّدها الجافاسكربت
     JS-generated strings (scan engine, hero demo, assistant hooks)
     ============================================================ */
  SB.STRINGS = {
    ar: {
      /* --- العرض الحي في الواجهة --- */
      "demo.1": "السلام عليكم، الطلب يوصل الخبر؟",
      "demo.2": "وعليكم السلام 👋 إيه، التوصيل متاح. تبيني أشيك لك مدة التوصيل للمنتج اللي اخترته؟",
      "demo.3": "إيه لو سمحت، وأبي فاتورة باسم المؤسسة.",
      "demo.4": "تم. التوصيل للخبر خلال 48 ساعة، وسجّلت طلب فاتورة باسم المؤسسة. أرسل لك رابط الدفع؟",

      /* --- فحص صبّارة: واجهة --- */
      "scan.step": "السؤال {n} من {total}",
      "scan.back": "→ السؤال السابق",
      "scan.phase.1": "صبّارة ترتب إجاباتك…",
      "scan.phase.2": "تبحث عن أكثر نقاط العمل المتكرر…",
      "scan.phase.3": "تراجع أين تضيع الفرص…",
      "scan.phase.4": "تحدد لك أفضل مكان تبدأ منه…",
      "scan.why": "ليش؟",
      "scan.human": "التدخل البشري:",

      /* --- فحص صبّارة: مستويات --- */
      "band.0": "منخفضة",
      "band.1": "متوسطة",
      "band.2": "مرتفعة",
      "band.3": "مرتفعة جدًا",
      "level.0": "منخفض",
      "level.1": "متوسط",
      "level.2": "مرتفع",
      "level.3": "مرتفع جدًا",
      "human.1": "محدود",
      "human.2": "مهم في نقاط محددة",
      "human.4": "ضروري في القرارات الحساسة",

      /* --- محاور الفحص --- */
      "dim.comm": "ضغط التواصل",
      "dim.leak": "فقدان الفرص",
      "dim.manual": "العمل المتكرر",
      "dim.frag": "ضعف ترابط الأنظمة",

      /* --- لماذا يستحق هذا الموضع --- */
      "why.comm": "نفس الأسئلة تتكرر يوميًا وتأخذ وقت الفريق، وتأخر الرد ممكن يخلي العميل يروح لمكان ثاني.",
      "why.leak": "المتابعة تعتمد اليوم على التذكر، وبعض الفرص تضيع قبل ما تكمل رحلتها.",
      "why.manual": "جزء من يومك يروح في شغل متكرر ما يضيف قيمة، وهو وقت كان ممكن يروح للشغل المهم.",
      "why.frag": "المعلومة تتنقل يدويًا بين أكثر من مكان، وهذا يفتح باب التأخير وتكرار الإدخال والخطأ.",
    },

    en: {
      /* --- hero live demo --- */
      "demo.1": "Hi — do you deliver to Khobar?",
      "demo.2": "Hello 👋 Yes, delivery is available. Want me to check the delivery time for the item you picked?",
      "demo.3": "Yes please, and I need an invoice under my company name.",
      "demo.4": "Done. Delivery to Khobar within 48 hours, and I've logged a company-name invoice request. Shall I send the payment link?",

      /* --- Sabbarah Scan: interface --- */
      "scan.step": "Question {n} of {total}",
      "scan.back": "← Previous question",
      "scan.phase.1": "Sabbarah is sorting your answers…",
      "scan.phase.2": "Looking for the most repetitive work…",
      "scan.phase.3": "Reviewing where opportunities leak…",
      "scan.phase.4": "Pinpointing the best place to start…",
      "scan.why": "Why?",
      "scan.human": "Human involvement:",

      /* --- Sabbarah Scan: levels --- */
      "band.0": "Low",
      "band.1": "Moderate",
      "band.2": "High",
      "band.3": "Very high",
      "level.0": "Low",
      "level.1": "Moderate",
      "level.2": "High",
      "level.3": "Very high",
      "human.1": "Limited",
      "human.2": "Important at specific points",
      "human.4": "Essential for sensitive decisions",

      /* --- scan dimensions --- */
      "dim.comm": "Communication load",
      "dim.leak": "Lost opportunities",
      "dim.manual": "Repetitive work",
      "dim.frag": "Disconnected systems",

      /* --- why this area --- */
      "why.comm": "The same questions come in every day and consume your team's time — and a slow reply often sends the customer elsewhere.",
      "why.leak": "Follow-up depends on someone remembering, so a share of opportunities goes cold before the journey completes.",
      "why.manual": "Part of your day goes to repetitive work that adds no value — time that could go to work that matters.",
      "why.frag": "Information is moved by hand between several places, which invites delays, double entry, and errors.",
    },
  };

  /* ---------- التشغيل ---------- */
  function init() {
    SB.set(readStored(), false);

    var btns = document.querySelectorAll("[data-lang-btn]");
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener("click", function (e) {
        SB.set(e.currentTarget.getAttribute("data-lang-btn"));
      });
    }
  }

  global.SB = SB;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window);
