/* ============================================================
   صبّارة AI — نظام اللغة (عربي افتراضي / إنجليزي)
   SABBARAH AI — bilingual engine (Arabic-first / English)

   كيف يعمل:
   1) العربية هي المصدر — مكتوبة داخل HTML كما هي.
   2) الإنجليزية تُكتب بجانبها في السمة data-en (ومشتقاتها للسمات).
      <h2 data-en="Custom Solutions">الحلول المخصصة</h2>
      <meta name="description" data-en-content="..." content="...">
   3) النصوص التي يولّدها الجافاسكربت (الفحص، العرض الحي، المحطات،
      القراءة) تأتي من قاموس STRINGS في الأسفل عبر SB.t('key').
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
    sector: "store", /* القطاع المختار في البطل — js/main.js يحدّثه */

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
     JS-generated strings (hero demo per sector, stations readout,
     scan engine, personalisation)
     ============================================================ */
  SB.STRINGS = {
    ar: {
      /* --- العرض الحي: متجر (المثال المنشور: توصيل الخبر وفاتورة المؤسسة) --- */
      "demo.store.1": "السلام عليكم، الطلب يوصل الخبر؟",
      "demo.store.2": "وعليكم السلام 👋 إيه، التوصيل متاح. تبيني أشيك لك مدة التوصيل للمنتج اللي اخترته؟",
      "demo.store.3": "إيه لو سمحت، وأبي فاتورة باسم المؤسسة.",
      "demo.store.4": "تم. التوصيل للخبر خلال 48 ساعة، وسجّلت طلب فاتورة باسم المؤسسة. أرسل لك رابط الدفع؟",
      /* --- العرض الحي: عيادة (من مثال وكيل خدمة العملاء: مواعيد وأسعار وتأمين) --- */
      "demo.clinic.1": "السلام عليكم، عندكم موعد تنظيف أسنان هالأسبوع؟ وهل تقبلون تأمين شركتي؟",
      "demo.clinic.2": "وعليكم السلام 👋 إيه، عندنا مواعيد هالأسبوع. أي شركة تأمين معك عشان أتأكد لك؟",
      "demo.clinic.3": "تأمين الشركة اللي أشتغل فيها، وأفضّل الفترة المسائية.",
      "demo.clinic.4": "تمام، هذا التأمين مقبول عندنا. أقرب موعد مسائي الثلاثاء 6:30، أثبّته لك باسمك؟",
      /* --- العرض الحي: عقار (من مثال وكيل المبيعات: ميزانية ومنطقة وموعد مع المستشار) --- */
      "demo.estate.1": "مرحبا، أبحث عن شقة للإيجار في الرياض، حي النرجس أو قريب منه.",
      "demo.estate.2": "أهلًا بك 👋 عندنا خيارات في النرجس والياسمين. كم الميزانية السنوية تقريبًا، وكم غرفة تحتاج؟",
      "demo.estate.3": "حوالي 45 ألف سنويًا، وغرفتين.",
      "demo.estate.4": "تمام، سجّلت الميزانية والمنطقة وعدد الغرف. أحجز لك موعد معاينة مع المستشار بكرة الساعة 5؟",

      /* --- خلف كل رد: القراءة (كلمة واحدة في مكان واحد) --- */
      "st.1": "الطلب", "st.1.sub": "REQUEST", "st.1.d": "رسالة تصل من العميل عبر واتساب أو شات الموقع.",
      "st.2": "المعرفة", "st.2.sub": "KNOWLEDGE", "st.2.d": "الأسئلة والسياسات والمعلومات المعتمدة من فريقك — ولا شيء غيرها.",
      "st.3": "الفهم", "st.3.sub": "UNDERSTANDING", "st.3.d": "الذكاء الاصطناعي يفهم المطلوب ويحدد الخطوة المناسبة.",
      "st.4": "القرار", "st.4.sub": "DECISION", "st.4.d": "قرار ضمن صلاحيات واضحة، والحالات الحساسة تتحول إلى إنسان.",
      "st.5": "التنفيذ", "st.5.sub": "ACTION", "st.5.d": "رد فوري، أو حجز موعد، أو تحديث في التقويم أو CRM.",
      "st.6": "النتيجة", "st.6.sub": "RESULT", "st.6.d": "متابعة تلقائية، ومراقبة مستمرة، وتقرير أداء شهري.",
      "mark.of": "/ 06",

      /* --- الخيط: عناوين الأقسام عند العقد --- */
      "thread.hero": "رسالة تدخل",
      "thread.anatomy": "خلف كل رد",
      "thread.custom-solutions": "الحلول المخصصة",
      "thread.scan": "فحص صبّارة",
      "thread.guard": "صبّارة تحمي",
      "thread.ready-products": "المنتجات الجاهزة",
      "thread.process": "كيف نعمل",
      "thread.faq": "قبل ما نبدأ",
      "thread.contact": "ابدأ بخطوة",
      "thread.sabbarah-map": "خريطة صبّارة",
      "thread.pricing": "الأسعار",
      "thread.end": "صبّارة",

      /* --- ما بعد الفحص --- */
      "reco": "الأنسب لنتيجتك",

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
      /* --- hero live demo: store --- */
      "demo.store.1": "Hi — do you deliver to Khobar?",
      "demo.store.2": "Hello 👋 Yes, delivery is available. Want me to check the delivery time for the item you picked?",
      "demo.store.3": "Yes please, and I need an invoice under my company name.",
      "demo.store.4": "Done. Delivery to Khobar within 48 hours, and I've logged a company-name invoice request. Shall I send the payment link?",
      /* --- clinic --- */
      "demo.clinic.1": "Hi — do you have a teeth-cleaning slot this week? And do you accept my company's insurance?",
      "demo.clinic.2": "Hello 👋 Yes, we have slots this week. Which insurer are you with, so I can confirm for you?",
      "demo.clinic.3": "My employer's plan — and I'd prefer an evening slot.",
      "demo.clinic.4": "Confirmed — that insurance is accepted here. The nearest evening slot is Tuesday at 6:30. Shall I book it under your name?",
      /* --- real estate --- */
      "demo.estate.1": "Hi, I'm looking for an apartment to rent in Riyadh — Al Narjis or nearby.",
      "demo.estate.2": "Welcome 👋 We have options in Al Narjis and Al Yasmin. What's your approximate yearly budget, and how many bedrooms?",
      "demo.estate.3": "Around 45k a year, two bedrooms.",
      "demo.estate.4": "Noted — budget, area and bedrooms logged. Shall I book you a viewing with our advisor tomorrow at 5?",

      /* --- behind every reply: the readout --- */
      "st.1": "Request", "st.1.sub": "الطلب", "st.1.d": "A customer message arrives on WhatsApp or website chat.",
      "st.2": "Knowledge", "st.2.sub": "المعرفة", "st.2.d": "Your approved answers, policies, and information — nothing else.",
      "st.3": "Understanding", "st.3.sub": "الفهم", "st.3.d": "AI understands the request and picks the right next step.",
      "st.4": "Decision", "st.4.sub": "القرار", "st.4.d": "A decision within clear permissions; sensitive cases go to a person.",
      "st.5": "Action", "st.5.sub": "التنفيذ", "st.5.d": "An instant reply, a booking, or an update in your calendar or CRM.",
      "st.6": "Result", "st.6.sub": "النتيجة", "st.6.d": "Automatic follow-up, continuous monitoring, and a monthly performance report.",
      "mark.of": "/ 06",

      /* --- the thread --- */
      "thread.hero": "A message enters",
      "thread.anatomy": "Behind every reply",
      "thread.custom-solutions": "Custom Solutions",
      "thread.scan": "Sabbarah Scan",
      "thread.guard": "Sabbarah Guards",
      "thread.ready-products": "Ready Products",
      "thread.process": "How We Work",
      "thread.faq": "Before we start",
      "thread.contact": "Start with one step",
      "thread.sabbarah-map": "Sabbarah Map",
      "thread.pricing": "Pricing",
      "thread.end": "Sabbarah",

      /* --- after the scan --- */
      "reco": "Best fit for your result",

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
