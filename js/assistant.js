/* ============================================================
   المساعدة صبّارة v3 — مساعدة موقع صبّارة (website-only)
   - Knowledge = the CURRENT site content only: the five custom
     solutions, the Smart Portfolio, Sabbarah Map, Sabbarah Scan,
     the six stages, the five guard pillars, how we work, the FAQ,
     the pricing statement, and the published contact details.
   - Strict boundary: unrelated questions get a professional
     redirect; related questions the site does not answer get
     "not currently available on the website" — never a guess.
   - Arabic / English / mixed messages; replies in the user's language.
   - Real dialog: role, focus trap, scroll lock on phones, Escape,
     backdrop, focus return. Quiet entrance: arrives once, waves once.
   Client-side only. No external calls. No tools or providers named.
   ============================================================ */
(() => {
  "use strict";

  const BOOKING_URL = "https://calendar.app.google/QceQcMgBjPm7fMYY8";
  const EMAIL = "hello@sabbarahai.com";
  const PHONE = "+966 53 986 9360";
  const WHATSAPP = "https://wa.me/966539869360";

  /* ================= text engine ================= */
  const normalize = (t) => t
    .toLowerCase()
    .replace(/[ً-ْٰـ]/g, "")
    .replace(/[أإآٱ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/ؤ/g, "و").replace(/ئ/g, "ي")
    .replace(/[?؟!.,،؛;:'"()\-_/\\]/g, " ")
    .replace(/\s+/g, " ").trim();

  const tokenize = (t) => {
    const base = normalize(t).split(" ").filter(Boolean);
    const out = [...base];
    for (const w of base) {
      if (w.startsWith("بال") && w.length > 5) out.push(w.slice(3));
      else if (w.startsWith("وال") && w.length > 5) out.push(w.slice(3));
      else if (w.startsWith("ال") && w.length > 4) out.push(w.slice(2));
      else if (w.startsWith("لل") && w.length > 4) out.push(w.slice(2));
      else if (w.startsWith("و") && w.length > 4) out.push(w.slice(1));
      if (w.endsWith("كم") && w.length > 5) out.push(w.slice(0, -2));
    }
    return out;
  };

  const uiLang = () => (window.SB && window.SB.lang === "en" ? "en" : "ar");
  const replyLang = (t) => {
    const ar = (t.match(/[؀-ۿ]/g) || []).length, en = (t.match(/[a-z]/gi) || []).length;
    if (ar >= 2) return "ar";
    if (en >= 2) return "en";
    return uiLang();
  };

  const near = (a, b) => {
    if (a === b) return true;
    if (Math.abs(a.length - b.length) > 1) return false;
    if (a.length < 5 && b.length < 5) return false;
    let i = 0, j = 0, edits = 0;
    while (i < a.length && j < b.length) {
      if (a[i] === b[j]) { i++; j++; continue; }
      if (++edits > 1) return false;
      if (a.length > b.length) i++;
      else if (b.length > a.length) j++;
      else { i++; j++; }
    }
    return edits + (a.length - i) + (b.length - j) <= 1;
  };

  const scorePatterns = (text, tokens, patterns) => {
    let score = 0;
    for (const raw of patterns) {
      const p = normalize(raw);
      if (!p) continue;
      if (p.includes(" ")) {
        if (text.includes(p)) score += 5 + p.split(" ").length * 2;
      } else if (tokens.some((tok) => tok === p)) {
        score += 3 + Math.min(3, p.length / 4);
      } else if (tokens.some((tok) => near(tok, p))) {
        score += 2;
      }
    }
    return score;
  };

  /* ================= the knowledge: the current website, verbatim ================= */
  const P = {
    cs: {
      anchor: "pricing.html#customer-service-agent", home: "#sol-cs",
      name: { ar: "وكيل ذكاء اصطناعي لخدمة العملاء", en: "AI Customer Service Agent" },
      what: { ar: "يرد على استفسارات العملاء، يساعد في الطلبات، ويحوّل الحالات المعقدة أو الحساسة إلى فريقك.", en: "Answers customer inquiries, helps with orders, and hands complex or sensitive cases to your team." },
      price: { ar: "يبدأ من <b>9,900 ريال</b> تأسيسًا وتنفيذًا مرة واحدة، والتشغيل والإدارة من <b>1,900 ريال شهريًا</b>.", en: "From <b>SAR 9,900</b> one-time setup and implementation; operation and management from <b>SAR 1,900/month</b>." },
      scope: { ar: ["وكيل خدمة عملاء واحد", "قناة واحدة: واتساب أو شات الموقع", "حتى 750 محادثة شهريًا", "إعداد المعرفة والأسئلة والسياسات المعتمدة", "تحويل الحالات المعقدة أو الحساسة إلى الفريق", "تقرير أداء شهري ومراقبة أساسية"],
               en: ["One customer service agent", "One channel: WhatsApp or website chat", "Up to 750 conversations per month", "Set-up of approved knowledge, questions, and policies", "Escalation of complex or sensitive cases to your team", "Monthly performance report and basic monitoring"] },
      example: { ar: "وكيل لعيادة أسنان يجيب عن المواعيد والأسعار والتأمين، ويحوّل الحالات الطبية للموظف.", en: "An agent for a dental clinic that answers questions on appointments, pricing, and insurance, and passes medical cases to a staff member." },
    },
    sales: {
      anchor: "pricing.html#sales-booking-agent", home: "#sol-sales",
      name: { ar: "وكيل ذكاء اصطناعي للمبيعات والحجوزات", en: "AI Sales & Booking Agent" },
      what: { ar: "يؤهل العميل، يوجّهه إلى الخطوة المناسبة، ويحجز أو يحوّله إلى فريق المبيعات.", en: "Qualifies the customer, guides them to the right next step, and books an appointment or hands over to your sales team." },
      price: { ar: "يبدأ من <b>13,900 ريال</b> تأسيسًا وتنفيذًا مرة واحدة، والتشغيل والإدارة من <b>2,400 ريال شهريًا</b>.", en: "From <b>SAR 13,900</b> one-time setup and implementation; operation and management from <b>SAR 2,400/month</b>." },
      scope: { ar: ["وكيل واحد وقناة واحدة", "حتى 750 محادثة شهريًا", "جمع بيانات العميل وتأهيله مبدئيًا", "توجيه العميل إلى الخدمة أو الخطوة المناسبة", "حجز موعد أو تحويله إلى فريق المبيعات", "تكامل قياسي واحد مع تقويم أو CRM", "متابعة أساسية للفرص وتقرير شهري"],
               en: ["One agent and one channel", "Up to 750 conversations per month", "Capturing customer details and initial qualification", "Guiding the customer to the right service or next step", "Booking an appointment or handing over to the sales team", "One standard integration with a calendar or CRM", "Basic opportunity follow-up and a monthly report"] },
      example: { ar: "وكيل لشركة عقارية يسأل عن الميزانية والمنطقة، يؤهل العميل ويحجز له موعدًا مع المستشار.", en: "An agent for a real estate company that asks about budget and area, qualifies the client, and books an appointment with an advisor." },
    },
    pro: {
      anchor: "pricing.html#professional-ai-assistant", home: "#sol-pro",
      name: { ar: "مساعد مهني متخصص بالذكاء الاصطناعي", en: "Specialized Professional AI Assistant" },
      what: { ar: "مساعد يُبنى لمهنة أو دور وظيفي محدد، وينظم المعلومات ويحلل المدخلات ويجهز المخرجات.", en: "An assistant built for one specific profession or role — it organises information, analyses inputs, and prepares the outputs." },
      price: { ar: "يبدأ من <b>18,900 ريال</b> تصميمًا وتنفيذًا مرة واحدة، والتشغيل والإدارة من <b>1,490 ريال شهريًا</b>.", en: "From <b>SAR 18,900</b> one-time design and implementation; operation and management from <b>SAR 1,490/month</b>." },
      scope: { ar: ["مساعد مخصص لمهنة أو دور وظيفي واحد", "سير عمل رئيسي واحد", "إعداد معرفة من مصادر معتمدة", "تنظيم وتحليل المدخلات", "حتى 3 مخرجات رئيسية", "نقاط مراجعة واعتماد بشري", "مستخدم واحد وواجهة استخدام أساسية"],
               en: ["An assistant dedicated to one profession or role", "One primary workflow", "Knowledge set up from approved sources", "Organising and analysing inputs", "Up to 3 primary outputs", "Human review and approval checkpoints", "One user and a basic interface"] },
      example: { ar: "مساعد لمراجع تقنية المعلومات ينظم الملاحظة، يصيغ 5Cs ويجهز مسودة التقرير للاعتماد.", en: "An assistant for an IT auditor that organises the observation, drafts the 5Cs, and prepares the report draft for approval." },
    },
    auto: {
      anchor: "pricing.html#workflow-automation", home: "#sol-auto",
      name: { ar: "أتمتة العمليات وسير العمل", en: "Workflow & Process Automation" },
      what: { ar: "تربط خطوات العمل والأنظمة، وتؤتمت نقل البيانات والمتابعات والتنبيهات والتقارير.", en: "Connects your work steps and systems, automating data movement, follow-ups, alerts, and reports." },
      price: { ar: "تبدأ من <b>9,900 ريال</b> للمسار البسيط تأسيسًا وتنفيذًا مرة واحدة، والمراقبة والصيانة من <b>990 ريال شهريًا</b>.", en: "From <b>SAR 9,900</b> for a simple workflow, one-time setup and implementation; monitoring and maintenance from <b>SAR 990/month</b>." },
      scope: { ar: ["مسار عمل واحد واضح", "الربط بين أداتين أو نظامين", "نقل بيانات أو تحديث حالة تلقائيًا", "تنبيهات أو متابعات آلية", "معالجة أساسية لحالات التعطل", "اختبار وتوثيق طريقة التشغيل"],
               en: ["One clearly defined workflow", "Connection between two tools or systems", "Automatic data transfer or status updates", "Automated alerts or follow-ups", "Basic handling of failure cases", "Testing and documentation of how it runs"] },
      example: { ar: "وصول طلب جديد من متجر إلكتروني، إضافته إلى النظام، تنبيه الفريق، تحديث الحالة وإرسال إشعار للعميل.", en: "A new order arrives from an online store, is added to the system, the team is alerted, the status is updated, and the customer is notified." },
    },
    custom: {
      anchor: "pricing.html#custom-ai-solution", home: "#sol-custom",
      name: { ar: "حل ذكاء اصطناعي وأتمتة مخصص", en: "Custom AI & Automation Solution" },
      what: { ar: "حل متكامل للمنشآت التي تحتاج عدة وكلاء أو قنوات أو تكاملات أو منطق تشغيل خاص.", en: "A complete solution for organisations that need several agents, channels, integrations, or their own operating logic." },
      price: { ar: "يبدأ من <b>29,900 ريال</b> تصميمًا وتنفيذًا حسب النطاق، والتشغيل المُدار من <b>2,490 ريال شهريًا</b>.", en: "From <b>SAR 29,900</b> design and implementation according to scope; managed operation from <b>SAR 2,490/month</b>." },
      scopeTitle: { ar: "مناسب للحلول التي تحتاج:", en: "Suited to solutions that need:" },
      scope: { ar: ["أكثر من وكيل أو مسار عمل", "قنوات وتكاملات متعددة", "منطق عمل مخصص للمنشأة", "واجهة أو لوحة تشغيل خاصة", "صلاحيات وأدوار وموافقات متعددة", "إشراف بشري وضوابط تشغيل", "إطلاق مرحلي وتشغيل مُدار"],
               en: ["More than one agent or workflow", "Multiple channels and integrations", "Business logic tailored to the organisation", "A dedicated interface or operations dashboard", "Multiple permissions, roles, and approvals", "Human oversight and operating controls", "Phased launch and managed operation"] },
      example: { ar: "حل لمجموعة عيادات يجمع خدمة العملاء والحجوزات والتذكيرات والتقارير في منظومة واحدة.", en: "A solution for a group of clinics that brings customer service, bookings, reminders, and reporting into a single system." },
    },
    portfolio: {
      anchor: "pricing.html#smart-portfolio", home: "#ready-products", ready: true,
      name: { ar: "البورتفوليو الذكي", en: "Smart Portfolio" },
      what: { ar: "موقع مهني تفاعلي يعرض خبرتك ومشاريعك، ومعه مساعد ذكي يجيب عن معلوماتك المهنية. يجمع خبرتك ومهاراتك ومشاريعك في مكان واحد، ويتيح للزائر استكشاف معلوماتك المهنية وسؤال المساعد الذكي عنها.", en: "An interactive professional site that presents your experience and projects, with an AI assistant that answers questions about your professional background. It brings your experience, skills, and projects together in one place." },
      price: { ar: "سعر ثابت: <b>499 ريال</b> دفعة واحدة (قبل الخصم 1,900 ريال — خصم لفترة محدودة)، والتجديد بعد السنة الأولى <b>249 ريال سنويًا</b>.", en: "Fixed price: <b>SAR 499</b> one-time (was SAR 1,900 — limited-time offer); renewal after the first year <b>SAR 249/year</b>." },
      scopeTitle: { ar: "يشمل:", en: "What you receive:" },
      scope: { ar: ["موقع مهني متجاوب بلغة واحدة", "عرض الخبرات والمهارات والمشاريع", "حتى 5 أقسام و3 مشاريع رئيسية", "مساعد ذكي يجيب من معلوماتك المهنية", "جولتان من التعديلات", "الاستضافة والاستخدام الأساسي للسنة الأولى"],
               en: ["A responsive professional site in one language", "Presentation of your experience, skills, and projects", "Up to 5 sections and 3 main projects", "An AI assistant that answers from your professional information", "Two rounds of revisions", "Hosting and basic usage for the first year"] },
      example: { ar: "بورتفوليو لمتخصصة أمن سيبراني يعرض مشاريعها ويجيب الزائر عن خبراتها وشهاداتها.", en: "A portfolio for a cybersecurity specialist that showcases her projects and answers visitors about her experience and certifications." },
    },
  };
  const ORDER = ["cs", "sales", "pro", "auto", "custom"];

  const MAP = {
    price: { ar: "<b>2,900 ريال</b> دفعة واحدة — ويُخصم كامل المبلغ من قيمة التنفيذ عند التعاقد خلال 30 يومًا.", en: "<b>SAR 2,900</b> one-time — the full fee is credited against the implementation cost when you contract within 30 days." },
    scope: { ar: ["فهم العملية الحالية", "تحديد الأولويات", "تصور نطاق الحل", "الأنظمة والتكاملات المطلوبة", "نقاط التدخل البشري والضوابط", "مؤشرات النجاح ومراحل التنفيذ"],
             en: ["Understanding the current process", "Setting priorities", "Defining the solution scope", "The systems and integrations required", "Human intervention points and controls", "Success metrics and implementation phases"] },
  };

  const t = {
    ar: {
      bullets: (arr) => arr.map((x) => "• " + x).join("<br>"),
      priceLabel: "السعر:", scopeLabel: "النطاق الأساسي يشمل:", exampleLabel: "مثال منشور:",
      details: "التفاصيل والنطاق", pricingPage: "قائمة الأسعار", book: "احجز استشارة", scan: "افحص نشاطك مجانًا", human: "تواصل مع الفريق",
      onPage: "الرابط على الموقع:", custom: "الحلول المخصصة", ready: "المنتجات الجاهزة",
    },
    en: {
      bullets: (arr) => arr.map((x) => "• " + x).join("<br>"),
      priceLabel: "Price:", scopeLabel: "The base scope includes:", exampleLabel: "Published example:",
      details: "Details and scope", pricingPage: "Pricing page", book: "Book a consultation", scan: "Run the free check", human: "Contact the team",
      onPage: "On the site:", custom: "Custom Solutions", ready: "Ready Products",
    },
  };

  const chips = {
    ar: {
      base: () => [{ t: "قائمة الأسعار", goto: "pricing.html" }, { t: "افحص نشاطك مجانًا", goto: "#scan" }, { t: "احجز استشارة", book: true }],
      menu: () => [{ t: "الحلول المخصصة", send: "وش الحلول المخصصة؟" }, { t: "المنتجات الجاهزة", send: "وش المنتجات الجاهزة؟" }, { t: "الأسعار", send: "كم الأسعار؟" }, { t: "فحص صبّارة", send: "وش فحص صبّارة؟" }, { t: "كيف تعملون؟", send: "كيف تعملون؟" }, { t: "تواصل معنا", send: "كيف أتواصل معكم؟" }],
    },
    en: {
      base: () => [{ t: "Pricing page", goto: "pricing.html" }, { t: "Run the free check", goto: "#scan" }, { t: "Book a consultation", book: true }],
      menu: () => [{ t: "Custom Solutions", send: "What are the custom solutions?" }, { t: "Ready Products", send: "What are the ready products?" }, { t: "Pricing", send: "What are your prices?" }, { t: "Sabbarah Scan", send: "What is the Sabbarah Scan?" }, { t: "How do you work?", send: "How do you work?" }, { t: "Contact", send: "How can I contact you?" }],
    },
  };

  /* ---------- reply builders ---------- */
  const productReply = (lang, id, mode) => {
    const p = P[id], s = t[lang];
    const nm = "<b>" + p.name[lang] + "</b>";
    let html;
    if (mode === "price") {
      html = nm + "<br>" + p.price[lang];
    } else if (mode === "scope") {
      html = nm + "<br>" + (p.scopeTitle ? p.scopeTitle[lang] : s.scopeLabel) + "<br>" + s.bullets(p.scope[lang]);
    } else if (mode === "example") {
      html = nm + "<br>" + s.exampleLabel + " " + p.example[lang];
    } else {
      html = nm + "<br>" + p.what[lang] + "<br><br>" + s.priceLabel + " " + p.price[lang] + "<br>" + s.exampleLabel + " " + p.example[lang];
    }
    const c = lang === "ar"
      ? [{ t: mode === "scope" ? "السعر" : "وش يشمل؟", send: mode === "scope" ? "كم سعر " + p.name.ar + "؟" : "وش يشمل " + p.name.ar + "؟" }, { t: "صفحة الأسعار", goto: p.anchor }, { t: "احجز استشارة", book: true }]
      : [{ t: mode === "scope" ? "Price" : "What's included?", send: mode === "scope" ? "How much is the " + p.name.en + "?" : "What does the " + p.name.en + " include?" }, { t: "Pricing page", goto: p.anchor }, { t: "Book a consultation", book: true }];
    return { html, chips: c };
  };

  const solutionsReply = (lang) => {
    const s = t[lang];
    const list = ORDER.map((id) => "• <b>" + P[id].name[lang] + "</b> — " + P[id].what[lang]).join("<br>");
    const html = lang === "ar"
      ? "<b>الحلول المخصصة</b> تُبنى على طريقة عملك، وأسعارها تبدأ من نطاق أساسي واضح:<br>" + list + "<br><br><b>المنتجات الجاهزة</b> بسعر ثابت: <b>البورتفوليو الذكي</b> — " + P.portfolio.what.ar.split("।")[0].split(" يجمع")[0] + "<br><br>أي حل يهمك أكثر؟"
      : "<b>Custom Solutions</b> are built around the way you work, with starting prices from a clear base scope:<br>" + list + "<br><br><b>Ready Products</b> at a fixed price: <b>Smart Portfolio</b> — " + P.portfolio.what.en.split(". It brings")[0] + ".<br><br>Which one matters most to you?";
    const c = ORDER.map((id) => ({ t: lang === "ar" ? P[id].name.ar.replace("ذكاء اصطناعي ", "").replace("بالذكاء الاصطناعي", "") : P[id].name.en, send: (lang === "ar" ? "" : "Tell me about the ") + P[id].name[lang] })).concat([{ t: P.portfolio.name[lang], send: P.portfolio.name[lang] }]);
    void s;
    return { html, chips: c };
  };

  const pricingReply = (lang) => {
    const rows = ORDER.map((id) => "• <b>" + P[id].name[lang] + "</b>: " + P[id].price[lang].replace(/<\/?b>/g, "")).join("<br>");
    const html = lang === "ar"
      ? "الأسعار معلنة على الموقع.<br><b>الحلول المخصصة</b> (أسعار تبدأ من، والسعر النهائي حسب النطاق):<br>" + rows +
        "<br><br><b>خريطة صبّارة</b>: " + MAP.price.ar.replace(/<\/?b>/g, "") +
        "<br><b>البورتفوليو الذكي</b> (منتج جاهز): " + P.portfolio.price.ar.replace(/<\/?b>/g, "") +
        "<br><br>الأسعار لا تشمل ضريبة القيمة المضافة عند انطباقها، وأي تكلفة إضافية تُوضح قبل التعاقد."
      : "Pricing is published on the site.<br><b>Custom Solutions</b> (starting prices; the final price depends on the agreed scope):<br>" + rows +
        "<br><br><b>Sabbarah Map</b>: " + MAP.price.en.replace(/<\/?b>/g, "") +
        "<br><b>Smart Portfolio</b> (ready product): " + P.portfolio.price.en.replace(/<\/?b>/g, "") +
        "<br><br>Prices exclude VAT where applicable, and any additional cost is explained before engagement.";
    return { html, chips: chips[lang].base() };
  };

  const disclaimerReply = (lang) => ({
    html: lang === "ar"
      ? "<b>ما الذي يؤثر على السعر النهائي</b> (كما هو منشور على صفحة الأسعار):<br>الأسعار المعروضة للحلول المخصصة تبدأ من النطاق الأساسي الموضح. يتغير السعر النهائي حسب عدد القنوات والتكاملات، حجم الاستخدام والمعرفة، حساسية البيانات ومتطلبات التشغيل. رسوم المنصات والرسائل والمكالمات والاستضافات الخارجية تُحسب بشكل منفصل وتُوضح قبل التعاقد. لا يبدأ أي عمل إضافي دون موافقة العميل. الأسعار لا تشمل ضريبة القيمة المضافة عند انطباقها."
      : "<b>What affects the final price</b> (as published on the pricing page):<br>Custom solution prices start from the base scope shown. Final pricing depends on the number of channels and integrations, usage and knowledge volume, data sensitivity, and operating requirements. Third-party platform, messaging, calling, and external hosting fees are charged separately and disclosed before engagement. No additional work begins without client approval. Prices exclude VAT where applicable.",
    chips: chips[lang].base(),
  });

  const mapReply = (lang) => ({
    html: lang === "ar"
      ? "<b>خريطة صبّارة</b> — من التشخيص إلى نطاق حل واضح.<br>الفحص يوضح لك أين توجد الفرص، والخريطة تحوّل النتيجة إلى تصور مخصص يحدد الأولويات، نطاق الحل، التكاملات المطلوبة، الضوابط، ومؤشرات النجاح.<br><br><b>السعر:</b> " + MAP.price.ar + "<br><b>تشمل:</b><br>" + t.ar.bullets(MAP.scope.ar)
      : "<b>Sabbarah Map</b> — from diagnosis to a clear solution scope.<br>The check shows you where the opportunities are; the Map turns that result into a tailored plan: priorities, solution scope, required integrations, controls, and success metrics.<br><br><b>Price:</b> " + MAP.price.en + "<br><b>It includes:</b><br>" + t.en.bullets(MAP.scope.en),
    chips: lang === "ar" ? [{ t: "سوّ الفحص أولًا", goto: "#scan" }, { t: "خريطة صبّارة على صفحة الأسعار", goto: "pricing.html#sabbarah-map" }, { t: "اطلب خريطة صبّارة", book: true }]
                        : [{ t: "Do the check first", goto: "#scan" }, { t: "Sabbarah Map on the pricing page", goto: "pricing.html#sabbarah-map" }, { t: "Request Sabbarah Map", book: true }],
  });

  const scanReply = (lang) => ({
    html: lang === "ar"
      ? "<b>فحص صبّارة</b> — الخطوة الأولى، ومجاني.<br>7 أسئلة قصيرة تبدأ بنوع نشاطك، بدون تسجيل وبدون رابط موقع، والنتيجة فورية. تطلع بـ:<br>• أولوية الأتمتة عند نشاطك: منخفضة، متوسطة، مرتفعة، أو مرتفعة جدًا<br>• قراءة لأربعة محاور: ضغط التواصل، فقدان الفرص، العمل المتكرر، ترابط الأنظمة<br>• أول موضع يستاهل الأتمتة عندك — وليش هو بالذات<br><br>المرحلة التالية بعد الفحص هي <b>خريطة صبّارة</b>."
      : "<b>Sabbarah Scan</b> — the first step, and free.<br>7 short questions starting with your business type, no sign-up and no website link, with an instant result. You get:<br>• Your automation priority: low, moderate, high, or very high<br>• A read on four axes: communication load, lost opportunities, repetitive work, and system connectivity<br>• The first area worth automating — and exactly why<br><br>The next step after the check is <b>Sabbarah Map</b>.",
    chips: lang === "ar" ? [{ t: "ابدأ الفحص", goto: "#scan" }, { t: "وش خريطة صبّارة؟", send: "وش خريطة صبّارة؟" }] : [{ t: "Start the check", goto: "#scan" }, { t: "What is Sabbarah Map?", send: "What is Sabbarah Map?" }],
  });

  const processReply = (lang) => ({
    html: lang === "ar"
      ? "<b>كيف نعمل</b> — مسار واضح من الفكرة إلى التشغيل:<br><b>1. نفهم</b> — احتياجك وعملياتك وأين يضيع الوقت<br><b>2. نصمم</b> — الحل والمسارات والضوابط المطلوبة<br><b>3. نبني ونختبر</b> — الوظائف والتكاملات والأمان قبل التشغيل<br><b>4. نشغّل وندعم</b> — إطلاق، مراقبة، وتحسين مستمر<br><br>أسهل بداية: فحص صبّارة، ثم خريطة صبّارة لتحديد النطاق قبل التنفيذ."
      : "<b>How we work</b> — a clear path from idea to operation:<br><b>1. Understand</b> — your needs, your operations, and where time is lost<br><b>2. Design</b> — the solution, the flows, and the controls required<br><b>3. Build & test</b> — functionality, integrations, and security before launch<br><b>4. Run & support</b> — launch, monitoring, and continuous improvement<br><br>The easiest start: the Sabbarah Scan, then Sabbarah Map to define the scope before implementation.",
    chips: lang === "ar" ? [{ t: "شوف القسم", goto: "#process" }, { t: "ابدأ بالفحص", goto: "#scan" }, { t: "احجز استشارة", book: true }] : [{ t: "See the section", goto: "#process" }, { t: "Start with the check", goto: "#scan" }, { t: "Book a consultation", book: true }],
  });

  const guardReply = (lang) => ({
    html: lang === "ar"
      ? "<b>صبّارة تحمي</b> — لأن الذكاء الاصطناعي وحده ما يكفي.<br>في صبّارة، الأمن والخصوصية والحوكمة جزء من التصميم من البداية، وليس إضافة بعد التشغيل:<br>• الخصوصية من البداية<br>• صلاحيات واضحة<br>• إشراف بشري<br>• مراقبة مستمرة<br>• حوكمة الذكاء الاصطناعي<br><br>وفي التعامل مع البيانات نأخذ في الاعتبار نوع البيانات، الصلاحيات، أقل قدر من الوصول، وفصل المسؤوليات ضمن تصميم الحل منذ البداية."
      : "<b>Sabbarah Guards</b> — because AI alone is not enough.<br>At Sabbarah, security, privacy, and governance are part of the design from day one — not an addition after launch:<br>• Privacy by Design<br>• Access Control<br>• Human Oversight<br>• Monitoring<br>• AI Governance<br><br>For data, we account for the type of data, permissions, least-privilege access, and separation of duties within the solution design from the very beginning.",
    chips: lang === "ar" ? [{ t: "شوف القسم", goto: "#guard" }, { t: "كيف يشتغل النظام خلف الرد؟", send: "وش المراحل الست خلف كل رد؟" }] : [{ t: "See the section", goto: "#guard" }, { t: "What happens behind a reply?", send: "What are the six stages behind every reply?" }],
  });

  const stagesReply = (lang) => ({
    html: lang === "ar"
      ? "<b>خلف كل رد</b> — الرد اللي يشوفه عميلك هو آخر طبقة من نظام كامل. كل رسالة تمر بست مراحل:<br><b>01 الطلب</b> — رسالة تصل من العميل عبر واتساب أو شات الموقع<br><b>02 المعرفة</b> — الأسئلة والسياسات والمعلومات المعتمدة من فريقك، ولا شيء غيرها<br><b>03 الفهم</b> — الذكاء الاصطناعي يفهم المطلوب ويحدد الخطوة المناسبة<br><b>04 القرار</b> — قرار ضمن صلاحيات واضحة، والحالات الحساسة تتحول إلى إنسان<br><b>05 التنفيذ</b> — رد فوري، أو حجز موعد، أو تحديث في التقويم أو CRM<br><b>06 النتيجة</b> — متابعة تلقائية، ومراقبة مستمرة، وتقرير أداء شهري"
      : "<b>Behind every reply</b> — the reply your customer sees is the last layer of a complete system. Every message passes through six stages:<br><b>01 Request</b> — a customer message arrives on WhatsApp or website chat<br><b>02 Knowledge</b> — your approved answers, policies, and information, nothing else<br><b>03 Understanding</b> — AI understands the request and picks the right next step<br><b>04 Decision</b> — a decision within clear permissions; sensitive cases go to a person<br><b>05 Action</b> — an instant reply, a booking, or an update in your calendar or CRM<br><b>06 Result</b> — automatic follow-up, continuous monitoring, and a monthly performance report",
    chips: lang === "ar" ? [{ t: "شوف الشعار ينفتح", goto: "#anatomy" }, { t: "الحلول المخصصة", send: "وش الحلول المخصصة؟" }] : [{ t: "Watch the mark open", goto: "#anatomy" }, { t: "Custom Solutions", send: "What are the custom solutions?" }],
  });

  const contactReply = (lang) => ({
    html: lang === "ar"
      ? "يسعدنا نسمع منك:<br>• البريد: <a href=\"mailto:" + EMAIL + "\">" + EMAIL + "</a><br>• الجوال: <bdi>" + PHONE + "</bdi><br>• واتساب: <a href=\"" + WHATSAPP + "\" target=\"_blank\" rel=\"noopener\">wa.me/966539869360</a><br>• المملكة العربية السعودية<br><br>أو احجز استشارة مباشرة من الرابط أدناه."
      : "We'd love to hear from you:<br>• Email: <a href=\"mailto:" + EMAIL + "\">" + EMAIL + "</a><br>• Phone: <bdi>" + PHONE + "</bdi><br>• WhatsApp: <a href=\"" + WHATSAPP + "\" target=\"_blank\" rel=\"noopener\">wa.me/966539869360</a><br>• Saudi Arabia<br><br>Or book a consultation directly below.",
    chips: lang === "ar" ? [{ t: "احجز استشارة", book: true }, { t: "أرسل بريدًا للفريق", human: true }, { t: "قسم التواصل", goto: "#contact" }] : [{ t: "Book a consultation", book: true }, { t: "Email the team", human: true }, { t: "Contact section", goto: "#contact" }],
  });

  const socialReply = (lang) => ({
    html: lang === "ar"
      ? "تابع صبّارة:<br>• LinkedIn: linkedin.com/company/sabbarah-ai<br>• TikTok: @sabbarh.ai<br>• X: @sabbarahai<br>• واتساب: wa.me/966539869360"
      : "Follow SABBARAH AI:<br>• LinkedIn: linkedin.com/company/sabbarah-ai<br>• TikTok: @sabbarh.ai<br>• X: @sabbarahai<br>• WhatsApp: wa.me/966539869360",
    chips: lang === "ar" ? [{ t: "روابط التواصل", goto: "#footer" }] : [{ t: "Social links", goto: "#footer" }],
  });

  const aboutReply = (lang) => ({
    html: lang === "ar"
      ? "<b>صبّارة AI</b> تبني وكلاء ذكاء اصطناعي وحلول أتمتة — حلول مخصصة على عملياتك ومنتجات جاهزة بسعر ثابت — مع الأمان والخصوصية والحوكمة مدمجة من البداية.<br>نفهم العملية، نصمم الحل، نربط الأنظمة، ونشغّله معك — مع الخصوصية والضوابط والإشراف البشري من البداية. المملكة العربية السعودية."
      : "<b>SABBARAH AI</b> builds AI agents and automation — custom solutions shaped around your operations and ready products at a fixed price — with security, privacy, and governance built in from day one.<br>We understand the process, design the solution, connect the systems, and run it with you — with privacy, controls, and human oversight from day one. Saudi Arabia.",
    chips: lang === "ar" ? [{ t: "وش الحلول؟", send: "وش الحلول المخصصة؟" }, { t: "كيف تعملون؟", send: "كيف تعملون؟" }, { t: "احجز استشارة", book: true }] : [{ t: "The solutions", send: "What are the custom solutions?" }, { t: "How do you work?", send: "How do you work?" }, { t: "Book a consultation", book: true }],
  });

  const readyReply = (lang) => {
    const r = productReply(lang, "portfolio");
    r.html = (lang === "ar" ? "<b>المنتجات الجاهزة</b> — منتجات واضحة، بسعر ونطاق محدد، بدون مشروع مخصص طويل. المتاح الآن:<br><br>" : "<b>Ready Products</b> — clear products with a defined price and scope, without a long custom project. Available now:<br><br>") + r.html;
    return r;
  };

  const FAQ = [
    { id: "automate", p: ["وش تقدر تاتمت", "ايش تقدرون تاتمتون", "وش ممكن اتمته", "ايش ممكن اتمت", "وش يمكن اتمتته", "what can you automate", "what can sabbarah automate", "what can be automated", "what do you automate"],
      ar: "<b>وش تقدر صبّارة تأتمت؟</b><br>أي عملية متكررة وقابلة لوصف خطواتها بوضوح قد تكون مرشحة للأتمتة، مثل الردود، المتابعة، نقل البيانات، التنبيهات، والتكامل بين الأنظمة.",
      en: "<b>What can Sabbarah automate?</b><br>Any repetitive process whose steps can be described clearly is a candidate for automation — replies, follow-up, data movement, alerts, and integration between systems." },
    { id: "tailored", p: ["مخصص لنشاطي", "يناسب نشاطي", "حسب نشاطي", "علي مقاس", "خاص بنشاطي", "tailored", "fit my business", "customised", "customized", "specific to my business", "built for my"],
      ar: "<b>هل الحل يكون مخصص لنشاطي؟</b><br>نعم. نبدأ بفهم سير العمل الفعلي ثم نصمم الحل على احتياج النشاط والأنظمة المستخدمة فيه.",
      en: "<b>Will the solution be tailored to my business?</b><br>Yes. We start by understanding your actual workflow, then design the solution around your needs and the systems you already use." },
    { id: "replace", p: ["يستبدل", "بديل الموظفين", "يبدل الموظفين", "استغني عن الموظفين", "مكان الموظفين", "يسرح", "replace my employees", "replace staff", "replace employees", "replace my team", "lose their jobs"],
      ar: "<b>هل الذكاء الاصطناعي يستبدل موظفيني؟</b><br>الهدف هو تقليل العمل المتكرر وتمكين الفريق من التركيز على المهام التي تحتاج حكمًا بشريًا، مع إبقاء التدخل البشري ضمن التصميم عند الحاجة.",
      en: "<b>Will AI replace my employees?</b><br>The goal is to reduce repetitive work so your team can focus on what needs human judgement — with human intervention kept in the design wherever it is needed." },
    { id: "data", p: ["تتعاملون مع البيانات", "بياناتي", "البيانات والخصوصيه", "بيانات العملاء", "وين تروح البيانات", "handle data", "my data", "customer data", "data and privacy", "where does the data go"],
      ar: "<b>كيف تتعاملون مع البيانات والخصوصية؟</b><br>نأخذ في الاعتبار نوع البيانات، الصلاحيات، أقل قدر من الوصول، وفصل المسؤوليات ضمن تصميم الحل منذ البداية.",
      en: "<b>How do you handle data and privacy?</b><br>We account for the type of data, permissions, least-privilege access, and separation of duties within the solution design from the very beginning." },
    { id: "small", p: ["ابدا صغير", "حل صغير", "اطوره لاحقا", "اوسع بعدين", "اطور بعدين", "ابدا بشي بسيط", "start small", "expand later", "grow later", "scale later", "start with something small"],
      ar: "<b>هل أقدر أبدأ بحل صغير وأطوره لاحقًا؟</b><br>نعم. يمكن البدء بنطاق واضح ومحدود ثم التوسع بعد قياس النتيجة والتأكد من ملاءمة الحل.",
      en: "<b>Can I start small and expand later?</b><br>Yes. You can start with a clear, limited scope and expand once the results are measured and the fit is confirmed." },
  ];

  /* ---------- intent patterns ---------- */
  const PRODUCT_P = {
    cs: ["خدمه العملاء", "وكيل خدمه", "وكيل خدمة", "الرد علي العملاء", "استفسارات العملاء", "دعم العملاء", "خدمة عملاء", "يرد علي", "الرد", "يرد", "المرضي", "المراجعين", "عياده", "عيادتي", "مطعم", "كافيه", "متجري", "customer service", "customer support", "support agent", "reply to customers", "answer customers", "customer care", "clinic", "patients", "restaurant", "cafe", "my store"],
    sales: ["المبيعات", "مبيعات", "الحجوزات", "حجوزات", "وكيل الحجز", "وكيل مبيعات", "تاهيل العميل", "عقار", "عقاريه", "عقارات", "sales agent", "booking agent", "bookings", "sales and booking", "qualify leads", "sales", "real estate", "property"],
    pro: ["مساعد مهني", "المساعد المهني", "مهني متخصص", "دور وظيفي", "مراجع", "لمهنه", "مهنه", "professional assistant", "specialized assistant", "specialised assistant", "profession", "auditor", "professional ai"],
    auto: ["اتمته العمليات", "سير العمل", "اتمته عمليات", "ربط الانظمه", "نقل البيانات", "workflow", "process automation", "workflow automation", "connect systems", "integrate systems", "data transfer"],
    custom: ["حل مخصص", "الحل المخصص", "حل متكامل", "عده وكلاء", "اكثر من وكيل", "عده فروع", "مجموعه فروع", "منظومه واحده", "لوحه تشغيل", "custom solution", "custom ai", "complete solution", "several agents", "multiple channels", "group of branches", "operations dashboard", "enterprise solution"],
    portfolio: ["البورتفوليو", "بورتفوليو", "بورتفليو", "بورتفوليو الذكي", "الموقع المهني", "موقع مهني", "سيره ذاتيه", "سيرتي", "ملف مهني", "موقع شخصي", "للافراد", "افراد", "smart portfolio", "portfolio", "personal site", "personal website", "cv", "resume", "professional site", "for individuals"],
  };
  const SUB_P = {
    price: ["سعر", "اسعار", "الاسعار", "تكلفه", "التكلفه", "بكم", "كم يكلف", "كم سعر", "كم سعره", "ميزانيه", "رسوم", "شهري", "شهريا", "اشتراك", "price", "prices", "pricing", "cost", "costs", "how much", "fees", "monthly", "subscription", "budget", "expensive", "cheap", "rate", "rates"],
    scope: ["يشمل", "تشمل", "النطاق", "نطاق", "وش فيه", "ايش يشمل", "وش يشمل", "وش يتضمن", "included", "include", "includes", "scope", "what do i get", "what does it cover", "covers"],
    example: ["مثال", "امثله", "مثلا", "example", "examples", "use case", "for instance"],
    detail: ["تفاصيل", "اشرح", "وضح", "اكثر", "كيف يشتغل", "كيف تشتغل", "details", "tell me more", "explain", "more", "how does it work", "how it works"],
  };
  const TOPIC_P = {
    solutions: ["حلول", "الحلول", "الحلول المخصصه", "خدمات", "الخدمات", "وش عندكم", "ايش عندكم", "وش تقدمون", "ايش تقدمون", "وش تسوون", "solutions", "custom solutions", "services", "offerings", "what do you offer", "what do you sell", "what do you do"],
    ready: ["المنتجات الجاهزه", "منتجات جاهزه", "منتجات", "المنتجات", "جاهز", "ready products", "products", "ready product"],
    pricing: SUB_P.price.concat(["قائمه الاسعار", "كل الاسعار", "الباقات", "باقات", "price list", "all prices", "packages", "plans"]),
    disclaimer: ["ضريبه", "الضريبه", "القيمه المضافه", "تشمل الضريبه", "شامل الضريبه", "مع الضريبه", "vat", "tax", "include vat", "including vat", "plus vat", "include tax", "رسوم المنصات", "رسوم اضافيه", "تكلفه اضافيه", "تكاليف اضافيه", "السعر النهائي", "يتغير السعر", "additional cost", "hidden fees", "extra fees", "what affects the price", "final price", "third party fees"],
    map: ["خريطه صباره", "خريطه", "الخريطه", "خارطه", "sabbarah map", "the map", "roadmap", "credited", "خصم الخريطه"],
    scan: ["فحص صباره", "فحص", "الفحص", "افحص", "تشخيص", "اختبار مجاني", "الاختبار", "sabbarah scan", "scan", "check", "free check", "diagnosis", "diagnose", "assessment", "quiz", "questionnaire"],
    process: ["كيف تعملون", "كيف تشتغلون", "طريقه العمل", "طريقه عملكم", "خطوات", "الخطوات", "مراحل العمل", "كيف نبدا", "من وين ابدا", "وش الخطوه الاولي", "how do you work", "process", "steps", "how to start", "how do we start", "methodology", "where to start", "where do i start", "get started", "first step"],
    guard: ["تحمي", "صباره تحمي", "نبنيها صح", "الامان", "امان", "الخصوصيه", "خصوصيه", "حوكمه", "الحوكمه", "اشراف بشري", "صلاحيات", "مراقبه", "امن", "امنه", "secure", "security", "privacy", "governance", "oversight", "permissions", "monitoring", "safe", "trust", "safety", "guards"],
    stages: ["خلف كل رد", "ست مراحل", "المراحل", "المراحل الست", "كيف يشتغل الوكيل", "كيف يرد", "كيف يفهم", "طبقات", "وش يصير خلف", "how does the agent work", "six stages", "stages", "behind every reply", "how does it reply", "layers", "behind a reply", "what happens behind"],
    contact: ["تواصل", "اتواصل", "التواصل", "ايميل", "بريد", "رقم", "رقمكم", "جوال", "واتساب", "اتصل", "اكلمكم", "وين مكانكم", "عنوانكم", "contact", "email", "phone", "number", "whatsapp", "call you", "reach you", "get in touch", "location", "where are you", "address"],
    book: ["احجز", "حجز استشاره", "استشاره", "موعد معكم", "اجتماع", "مكالمه", "book", "consultation", "meeting", "schedule a call", "book a call", "appointment with you"],
    human: ["انسان", "بشر", "موظف", "شخص حقيقي", "اكلم احد", "احد من الفريق", "human", "real person", "someone", "talk to a person", "speak to someone", "your team"],
    about: ["من انتم", "عن صباره", "وش صباره", "مين صباره", "من انت", "مين انتي", "مين انت", "عرفيني", "عرفني", "who are you", "about sabbarah", "what is sabbarah", "what does sabbarah do", "company", "tell me about sabbarah", "who is sabbarah"],
    navigate: ["وين القي", "وين الاقي", "وين اروح", "دليني", "وريني", "اقسام الموقع", "الصفحه", "where do i find", "show me", "navigate", "take me to", "which section"],
    social: ["لينكدان", "لينكد ان", "تيك توك", "تويتر", "اكس", "حساباتكم", "تابعكم", "سوشيال", "linkedin", "tiktok", "twitter", "social media", "follow you", "accounts"],
    discount: ["خصم", "عرض", "عروض", "تخفيض", "كوبون", "discount", "offer", "offers", "promo", "coupon", "deal"],
    greeting: ["مرحبا", "هلا", "اهلا", "السلام عليكم", "سلام", "صباح الخير", "مساء الخير", "هاي", "حياك", "يا هلا", "hello", "hi", "hey", "salam", "good morning", "good evening", "greetings"],
    thanks: ["شكرا", "مشكور", "مشكوره", "يعطيك العافيه", "ممتاز", "رائع", "جزاك", "تسلم", "thanks", "thank you", "great", "awesome", "perfect", "helpful"],
    bye: ["مع السلامه", "وداعا", "باي", "اشوفك", "الي اللقاء", "bye", "goodbye", "see you", "later"],
    help: ["ساعديني", "ساعدني", "مساعده", "وش تقدرين", "وش تقدر تسوين", "وش تسوين", "help", "what can you do", "what can you help", "how can you help"],
  };
  /* pains → the current solution (acknowledgement + the product, never a promise) */
  const PAINS = [
    { id: "cs", p: ["تفوتني مكالمات", "مكالمات كثيره", "ما الحق ارد", "رسائل واتساب كثيره", "الواتساب معبي", "ما الحق علي الرسائل", "رسائل كثيره", "غرقانين", "نفس الاسئله", "اسئله متكرره", "استفسارات كثيره", "نرد متاخر", "الرد بطيء", "بعد الدوام", "ما نرد بالليل", "العملاء ينتظرون", "استفسارات",
                    "missed calls", "too many messages", "whatsapp messages", "cant keep up with messages", "same questions", "repetitive questions", "slow replies", "after hours", "customers waiting", "flooded with inquiries", "inquiries"],
      ack: { ar: "واضح: ضغط الرد على العملاء هو اللي ياخذ الوقت.", en: "Understood: the pressure of replying to customers is what takes the time." } },
    { id: "sales", p: ["عملاء يختفون", "ما نتابع", "ننسي المتابعه", "المتابعه ضعيفه", "يسال ويختفي", "يسالون ويختفون", "يختفون", "يختفي", "اختفوا", "ما يكملون", "المتابعه", "متابعه", "فرص تضيع", "الفرص", "مواعيد تضيع", "ما يجون للموعد", "تاكيد المواعيد", "حجز مواعيد", "المواعيد", "ازيد المبيعات", "زياده المبيعات", "يسالون وما يشترون", "احول الزوار", "عملاء محتملين", "اقفل صفقات", "سلات متروكه",
                       "leads disappear", "leads", "no follow up", "follow up", "forget to follow up", "leads go cold", "no shows", "missed appointments", "book appointments", "more sales", "increase sales", "they ask but dont buy", "ask then disappear", "disappear", "convert visitors", "qualify", "close deals", "abandoned carts"],
      ack: { ar: "واضح: فرص تضيع بين السؤال والحجز أو الشراء.", en: "Understood: opportunities are lost between the question and the booking or purchase." } },
    { id: "pro", p: ["تقارير مهنيه", "اصيغ تقارير", "مسوده التقرير", "تحليل المدخلات", "شغل مكتبي متخصص", "مراجعه", "تدقيق", "اعداد المخرجات", "ملفات كثيره اراجعها", "مهنتي",
                     "draft reports", "prepare reports for my job", "analyse inputs", "review documents", "audit work", "my profession", "specialist work", "prepare outputs"],
      ack: { ar: "واضح: شغل مهني متخصص يحتاج تنظيم المدخلات وتجهيز المخرجات.", en: "Understood: specialised professional work that needs organised inputs and prepared outputs." } },
    { id: "auto", p: ["ادخال بيانات", "نسخ ولصق", "جداول اكسل", "اكسل", "شغل يدوي", "تقارير يدويه", "ننقل البيانات يدوي", "بين الانظمه", "تحديث الحاله", "تنبيه الفريق", "الطلبات الجديده", "طلب جديد",
                      "data entry", "copy paste", "spreadsheets", "excel", "manual work", "manual reports", "move data manually", "between systems", "update the status", "alert the team", "new orders", "repetitive tasks"],
      ack: { ar: "واضح: خطوات يدوية متكررة بين أدوات أو أنظمة.", en: "Understood: repetitive manual steps between tools or systems." } },
    { id: "custom", p: ["عندنا فروع", "اكثر من فرع", "عده اقسام", "شركه كبيره", "منشاه", "نظام كامل", "كل شي في مكان واحد", "اكثر من قناه", "عده قنوات",
                        "we have branches", "several branches", "multiple departments", "large company", "whole system", "everything in one place", "several channels", "many channels"],
      ack: { ar: "واضح: منشأة بأكثر من فرع أو قناة تحتاج منظومة واحدة.", en: "Understood: an organisation with several branches or channels that needs one system." } },
    { id: "portfolio", p: ["اعرض خبراتي", "اعرض مشاريعي", "موقع لي", "موقع يعرض شغلي", "مستقل", "فريلانسر", "حضور مهني", "اسوي لي موقع",
                           "showcase my work", "show my projects", "a site for me", "freelancer", "professional presence", "personal brand", "make me a website"],
      ack: { ar: "واضح: تبي حضورًا مهنيًا يعرض خبرتك ومشاريعك.", en: "Understood: you want a professional presence that shows your experience and projects." } },
  ];
  /* related to Sabbarah, but the website does not answer it — say so, never guess */
  const NOT_ON_SITE = [
    "تكامل مع", "يدعم", "تدعمون", "يشتغل مع", "integration with", "integrate with", "does it work with", "do you support",
    "salesforce", "hubspot", "zoho", "shopify", "salla", "سله", "زد", "zid", "odoo", "sap", "microsoft", "google workspace", "slack", "telegram", "تيليجرام", "انستقرام", "instagram", "snapchat", "سناب",
    "كم يستغرق", "المده", "مده التنفيذ", "كم يوم", "كم اسبوع", "متي يجهز", "how long", "timeline", "delivery time", "how many days", "how many weeks", "when will it be ready",
    "ضمان", "تضمنون", "guarantee", "guaranteed", "roi", "return on investment", "نتائج مضمونه", "نسبه", "percent", "كم بتزيد",
    "كم عددكم", "فريقكم", "حجم الفريق", "team size", "how many people", "how many employees", "founders", "مؤسس", "المؤسس", "ceo", "المدير",
    "عنوان", "مكتب", "المكتب", "office", "الرياض", "جده", "الدمام", "الخبر", "riyadh", "jeddah", "dammam", "khobar",
    "عملاء سابقين", "عملائكم", "مين تعاملتم", "مع مين اشتغلتم", "references", "your clients", "testimonials", "case study", "case studies", "who are your clients", "previous clients",
    "شهاده", "معتمد", "iso", "soc", "pdpl", "compliance", "certified", "certificate", "license", "ترخيص", "سجل تجاري", "الهيئه",
    "لغات", "الانجليزيه", "يدعم الانجليزي", "languages", "english support", "french", "urdu", "اردو", "هندي", "فلبيني",
    "خارج السعوديه", "الامارات", "الكويت", "قطر", "البحرين", "عمان", "مصر", "uae", "dubai", "kuwait", "qatar", "bahrain", "oman", "egypt", "abroad", "outside saudi", "international",
    "تقسيط", "اقساط", "طرق الدفع", "تحويل بنكي", "مدي", "فيزا", "installments", "payment methods", "how to pay", "bank transfer", "refund", "استرجاع", "استرداد", "cancel", "الغاء",
    "api", "تقني", "كود", "البرمجه", "stack", "model", "نموذج", "gpt", "openai", "chatgpt", "claude", "gemini", "llm", "n8n", "الادوات", "اي اداه", "which tool", "which model", "what ai do you use", "what model", "technology", "التقنيه المستخدمه",
    "وظيفه", "توظيف", "تدريب", "careers", "hiring", "job", "internship", "شراكه", "partner", "partnership", "وكاله", "reseller", "affiliate",
    "عقد", "contract", "sla", "الدعم الفني", "support hours", "ساعات الدعم", "24/7", "on site", "حضوري", "زياره",
  ];
  const OFF_TOPIC = [
    "سياسه", "انتخابات", "حكومه", "دين", "فتوي", "حلال", "حرام", "طقس", "الجو", "رياضه", "مباراه", "الهلال", "النصر", "الاتحاد", "اسهم", "تداول", "عملات", "بيتكوين", "وصفه", "طبخ", "اكتب كود", "برمج لي", "واجب", "قصيده", "نكته", "ترجم", "ترجمه", "احسب", "اجمع", "اضرب", "دواء", "علاج", "مرض", "طبيب", "محامي", "قانون", "عقد ايجار", "سفر", "تذاكر", "فندق", "اخبار", "وش صار", "الرئيس", "عاصمه", "وش هو الذكاء الاصطناعي", "ما هو الذكاء الاصطناعي", "اشرح لي الذكاء", "افضل لابتوب", "فيلم", "اغنيه", "لعبه", "كره",
    "كود", "بايثون", "برمجه", "برمج", "جافا", "رئيس", "امريكا", "وزير", "الملك", "حرب", "الرياضه", "دوري", "مباريات", "ديكور", "طبخه", "سياره", "سيارات", "ايفون", "جوال جديد", "درس", "امتحان", "الجامعه", "قصه",
    "weather", "politics", "election", "government", "religion", "football", "match", "stocks", "crypto", "bitcoin", "recipe", "cook", "write code", "code for me", "code", "python", "javascript", "homework", "poem", "joke", "translate", "calculate", "math", "medicine", "doctor", "symptoms", "lawyer", "legal advice", "law", "travel", "hotel", "flight", "news", "what happened", "president", "capital of", "explain machine learning", "machine learning", "deep learning", "neural network", "what is ai", "what is artificial intelligence", "how does ai work", "how does gpt work", "best laptop", "movie", "song", "game", "who won", "history of", "define", "essay", "story", "car", "iphone", "exam", "university", "war",
  ];
  const SABBARAH_WORDS = ["صباره", "sabbarah", "وكيل", "agent", "الحل", "solution", "الاتمته", "automation", "الذكاء الاصطناعي", "ai", "الموقع", "site", "الخدمه", "service"];
  /* a short follow-up that points back at the last product: "كم سعره؟", "what does it include?" */
  const REF_WORDS = ["سعره", "سعرها", "تكلفته", "تكلفتها", "يشمله", "يشمل", "تشمل", "مثاله", "هذا", "هذي", "ذا", "هو", "هي", "it", "its", "this", "that", "one", "include", "included"];
  const GENERAL_TOPICS = ["disclaimer", "map", "scan", "process", "guard", "stages", "contact", "about", "solutions", "ready", "social", "navigate", "discount", "pricing"];
  const INTEGRATION_P = ["تكامل", "تكاملات", "تتكاملون", "تتكامل", "يتكامل", "ربط", "تربطون", "يربط", "الربط", "integration", "integrations", "integrate", "connect with", "works with", "compatible",
    "salesforce", "hubspot", "zoho", "shopify", "salla", "سله", "زد", "zid", "odoo", "sap", "microsoft", "google workspace", "slack", "telegram", "تيليجرام", "انستقرام", "instagram", "snapchat", "سناب", "فودكس", "foodics", "moyasar", "tap", "stripe", "excel", "اكسل", "gmail", "outlook", "calendly", "crm"];
  const integrationReply = (lang) => ({
    html: lang === "ar"
      ? "الموقع لا يذكر منصات أو أدوات بعينها، فما أقدر أأكد تكاملًا مع اسم محدد. المنشور عن التكاملات:<br>• <b>وكيل المبيعات والحجوزات</b>: تكامل قياسي واحد مع تقويم أو CRM ضمن النطاق الأساسي<br>• <b>أتمتة العمليات وسير العمل</b>: الربط بين أداتين أو نظامين، ونقل بيانات أو تحديث حالة تلقائيًا<br>• <b>الحل المخصص</b>: قنوات وتكاملات متعددة حسب النطاق<br>• <b>وكيل خدمة العملاء</b>: قناة واحدة، واتساب أو شات الموقع<br><br>والتكاملات المطلوبة تُحدد في خريطة صبّارة قبل التنفيذ، وأي رسوم لمنصات خارجية تُوضح قبل التعاقد."
      : "The site does not name specific platforms or tools, so I can't confirm an integration with a particular name. What is published about integrations:<br>• <b>Sales & Booking Agent</b>: one standard integration with a calendar or CRM in the base scope<br>• <b>Workflow & Process Automation</b>: connection between two tools or systems, with automatic data transfer or status updates<br>• <b>Custom Solution</b>: multiple channels and integrations according to scope<br>• <b>Customer Service Agent</b>: one channel, WhatsApp or website chat<br><br>The required integrations are defined in Sabbarah Map before implementation, and any third-party platform fees are disclosed before engagement.",
    chips: lang === "ar" ? [{ t: "خريطة صبّارة", send: "وش خريطة صبّارة؟" }, { t: "احجز استشارة", book: true }, { t: "قائمة الأسعار", goto: "pricing.html" }] : [{ t: "Sabbarah Map", send: "What is the Sabbarah Map?" }, { t: "Book a consultation", book: true }, { t: "Pricing page", goto: "pricing.html" }],
  });

  /* ---------- the brain ---------- */
  const ctx = { lastProduct: null, lastTopic: null };
  const boundaryReply = (lang) => ({
    html: lang === "ar"
      ? "أنا المساعدة صبّارة، ومهمتي الإجابة عن محتوى موقع صبّارة تحديدًا: الحلول المخصصة، المنتجات الجاهزة، الأسعار المنشورة، فحص صبّارة وخريطة صبّارة، طريقة العمل، والتواصل.<br>هذا الموضوع خارج نطاقي، لكن يسعدني أساعدك في أي شيء يخص صبّارة."
      : "I'm the Sabbarah assistant, and my role is to answer about the Sabbarah website specifically: custom solutions, ready products, published pricing, the Sabbarah Scan and Map, how we work, and contact.<br>That topic is outside my scope, but I'd be glad to help with anything about Sabbarah.",
    chips: chips[lang].menu(),
  });
  const notOnSiteReply = (lang, hint) => ({
    html: (lang === "ar"
      ? "هذه المعلومة غير متوفرة حاليًا على موقع صبّارة، فما أقدر أأكدها لك."
      : "That information is not currently available on the Sabbarah website, so I can't confirm it.")
      + (hint ? "<br>" + hint : "")
      + (lang === "ar" ? "<br>للتفاصيل الدقيقة، احجز استشارة أو راسل الفريق على " + EMAIL + "." : "<br>For exact details, book a consultation or email the team at " + EMAIL + "."),
    chips: lang === "ar" ? [{ t: "احجز استشارة", book: true }, { t: "أرسل بريدًا للفريق", human: true }, { t: "الأسئلة الشائعة", goto: "#faq" }] : [{ t: "Book a consultation", book: true }, { t: "Email the team", human: true }, { t: "FAQ", goto: "#faq" }],
  });
  const fallbackReply = (lang) => ({
    html: lang === "ar"
      ? "ما قدرت أحدد سؤالك بدقة. أقدر أساعدك في محتوى موقع صبّارة — اختر موضوعًا أو اكتب سؤالك بصيغة أخرى:"
      : "I couldn't pin down your question. I can help with the Sabbarah website content — pick a topic or rephrase:",
    chips: chips[lang].menu(),
  });
  const greetingReply = (lang) => ({
    html: lang === "ar"
      ? "أهلًا بك في صبّارة. أنا المساعدة صبّارة، أجيبك عن كل ما هو منشور على الموقع: الحلول، المنتجات، الأسعار، فحص صبّارة، وطريقة العمل. وش تحب تعرف؟"
      : "Welcome to Sabbarah. I'm the Sabbarah assistant — I answer from what is published on the site: solutions, products, pricing, the Sabbarah Scan, and how we work. What would you like to know?",
    chips: chips[lang].menu(),
  });

  const best = (text, tokens, table) => {
    let id = null, s = 0;
    for (const k in table) { const v = scorePatterns(text, tokens, table[k]); if (v > s) { s = v; id = k; } }
    return { id, s };
  };

  const think = (raw) => {
    const lang = replyLang(raw);
    const text = normalize(raw);
    const tokens = tokenize(raw);
    if (!text) return fallbackReply(lang);

    const prod = best(text, tokens, PRODUCT_P);
    const sub = best(text, tokens, SUB_P);
    const topic = best(text, tokens, TOPIC_P);
    let pain = null, painS = 0;
    for (const p of PAINS) { const s = scorePatterns(text, tokens, p.p); if (s > painS) { painS = s; pain = p; } }
    let faq = null, faqS = 0;
    for (const f of FAQ) { const s = scorePatterns(text, tokens, f.p); if (s > faqS) { faqS = s; faq = f; } }
    const off = scorePatterns(text, tokens, OFF_TOPIC);
    const nos = scorePatterns(text, tokens, NOT_ON_SITE);
    const onTop = Math.max(prod.s, topic.s, painS, faqS);

    /* 1) clearly unrelated */
    if (off >= 4 && off >= onTop) return boundaryReply(lang);

    /* 1b) integrations: the site names none by platform; it states what each solution connects */
    const integ = scorePatterns(text, tokens, INTEGRATION_P);
    if (integ >= 3 && integ >= prod.s && topic.id !== "contact") return integrationReply(lang);

    /* 2) a product named (or remembered through a reference word) + a sub-question */
    const pid = prod.s >= 3 ? prod.id : null;
    if (pid) ctx.lastProduct = pid;
    const hasRef = tokens.some((w) => REF_WORDS.indexOf(w) !== -1);
    const generalTopic = topic.s >= 4 && GENERAL_TOPICS.indexOf(topic.id) !== -1;
    const remembered = !pid && ctx.lastProduct && tokens.length <= 6 && hasRef && !generalTopic;
    if (pid || (remembered && sub.s >= 3)) {
      const id = pid || ctx.lastProduct;
      if (nos >= 5 && nos > sub.s) return notOnSiteReply(lang, (lang === "ar" ? "المنشور عن " : "What is published about the ") + "<b>" + P[id].name[lang] + "</b>" + (lang === "ar" ? ": " : ": ") + P[id].price[lang]);
      if (sub.s >= 3 && sub.id !== "detail") return productReply(lang, id, sub.id);
      return productReply(lang, id, "overview");
    }

    /* 3) FAQ questions */
    if (faqS >= 4 && faqS >= topic.s && faqS >= painS) {
      return { html: faq[lang], chips: lang === "ar" ? [{ t: "الأسئلة الشائعة", goto: "#faq" }, { t: "افحص نشاطك مجانًا", goto: "#scan" }, { t: "احجز استشارة", book: true }] : [{ t: "FAQ", goto: "#faq" }, { t: "Run the free check", goto: "#scan" }, { t: "Book a consultation", book: true }] };
    }

    /* 4) topics */
    if (topic.s >= 3 && topic.s >= painS) {
      ctx.lastTopic = topic.id;
      switch (topic.id) {
        case "greeting": if (tokens.length <= 4) return greetingReply(lang); break;
        case "thanks": return { html: lang === "ar" ? "العفو. أنا هنا متى ما احتجت شيئًا عن صبّارة." : "You're welcome. I'm here whenever you need anything about Sabbarah.", chips: chips[lang].base() };
        case "bye": return { html: lang === "ar" ? "إلى اللقاء. صبّارة دائمًا هنا." : "Goodbye. Sabbarah is always here." };
        case "help": return greetingReply(lang);
        case "solutions": return solutionsReply(lang);
        case "ready": return readyReply(lang);
        case "disclaimer": return disclaimerReply(lang);
        case "pricing": return pricingReply(lang);
        case "map": return mapReply(lang);
        case "scan": return scanReply(lang);
        case "process": return processReply(lang);
        case "guard": return guardReply(lang);
        case "stages": return stagesReply(lang);
        case "contact": return contactReply(lang);
        case "social": return socialReply(lang);
        case "about": return aboutReply(lang);
        case "book": return { html: lang === "ar" ? "يمكنك حجز استشارة مباشرة من رابط الحجز على الموقع — اختر الوقت المناسب لك." : "You can book a consultation directly through the booking link on the site — pick the time that suits you.", chips: lang === "ar" ? [{ t: "احجز استشارة", book: true }, { t: "افحص نشاطك أولًا", goto: "#scan" }] : [{ t: "Book a consultation", book: true }, { t: "Run the check first", goto: "#scan" }] };
        case "human": return { html: lang === "ar" ? "أكيد. فريق صبّارة يستقبل رسائلك على " + EMAIL + "، وعلى واتساب wa.me/966539869360، أو احجز مكالمة مباشرة:" : "Of course. The Sabbarah team receives messages at " + EMAIL + " and on WhatsApp at wa.me/966539869360, or book a call directly:", chips: lang === "ar" ? [{ t: "أرسل بريدًا للفريق", human: true }, { t: "احجز مكالمة", book: true }] : [{ t: "Email the team", human: true }, { t: "Book a call", book: true }] };
        case "navigate": return { html: lang === "ar" ? "اختر القسم وأنقلك إليه:" : "Pick a section and I'll take you there:", chips: lang === "ar" ? [{ t: "الحلول المخصصة", goto: "#custom-solutions" }, { t: "المنتجات الجاهزة", goto: "#ready-products" }, { t: "فحص صبّارة", goto: "#scan" }, { t: "الأسعار", goto: "pricing.html" }, { t: "كيف نعمل", goto: "#process" }, { t: "تواصل معنا", goto: "#contact" }] : [{ t: "Custom Solutions", goto: "#custom-solutions" }, { t: "Ready Products", goto: "#ready-products" }, { t: "Sabbarah Scan", goto: "#scan" }, { t: "Pricing", goto: "pricing.html" }, { t: "How we work", goto: "#process" }, { t: "Contact", goto: "#contact" }] };
        case "discount": return { html: lang === "ar" ? "الخصم المعلن على الموقع حاليًا واحد: <b>البورتفوليو الذكي</b> بـ 499 ريال دفعة واحدة بدلًا من 1,900 ريال — خصم لفترة محدودة. ولا توجد عروض أخرى منشورة على الموقع." : "The one published discount right now is the <b>Smart Portfolio</b> at SAR 499 one-time instead of SAR 1,900 — a limited-time offer. No other offers are published on the site.", chips: lang === "ar" ? [{ t: "البورتفوليو الذكي", goto: "pricing.html#smart-portfolio" }, { t: "قائمة الأسعار", goto: "pricing.html" }] : [{ t: "Smart Portfolio", goto: "pricing.html#smart-portfolio" }, { t: "Pricing page", goto: "pricing.html" }] };
      }
    }

    /* 5) a described pain → the current solution that fits */
    if (pain && painS >= 3) {
      ctx.lastProduct = pain.id;
      const r = productReply(lang, pain.id, "overview");
      r.html = pain.ack[lang] + (lang === "ar" ? " الأقرب لذلك على الموقع:<br><br>" : " The closest fit on the site:<br><br>") + r.html;
      r.chips = r.chips.concat([{ t: lang === "ar" ? "افحص نشاطك مجانًا" : "Run the free check", goto: "#scan" }]);
      return r;
    }

    /* 6) related but not published */
    if (nos >= 3.5) return notOnSiteReply(lang, null);
    if (scorePatterns(text, tokens, SABBARAH_WORDS) >= 3 && tokens.length >= 3) return notOnSiteReply(lang, null);

    /* 7) remembered product, general follow-up */
    if (ctx.lastProduct && sub.s >= 3) return productReply(lang, ctx.lastProduct, sub.id === "detail" ? "overview" : sub.id);

    return fallbackReply(lang);
  };

  /* ================= UI ================= */
  const cactusSVG = (id) => `
    <svg viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="zb${id}" x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stop-color="#1FD9A0"/><stop offset="62%" stop-color="#15A87C"/><stop offset="100%" stop-color="#0E5C4A"/>
        </linearGradient>
        <linearGradient id="za${id}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#1FD9A0"/><stop offset="100%" stop-color="#10745D"/>
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="131" rx="31" ry="6" fill="rgba(31,217,160,.16)"/>
      <g class="sb-cactus__body">
        <path d="M52 23 L60 15 L68 23" stroke="#C9A227" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="60" cy="30.5" r="4.6" fill="#C9A227"/>
        <rect x="23" y="52" width="15" height="27" rx="7.5" fill="url(#za${id})"/>
        <rect x="27" y="68" width="22" height="14" rx="7" fill="url(#za${id})"/>
        <g class="sb-cactus__arm-wave">
          <rect x="72" y="64" width="22" height="14" rx="7" fill="url(#za${id})"/>
          <rect x="83" y="40" width="15" height="34" rx="7.5" fill="url(#za${id})"/>
        </g>
        <rect x="43" y="38" width="34" height="90" rx="17" fill="url(#zb${id})"/>
        <path d="M52 48 V118 M68 48 V118" stroke="rgba(6,18,15,.22)" stroke-width="2" stroke-linecap="round"/>
        <circle class="sb-cactus__eye" cx="54" cy="64" r="3.4" fill="#0C1219"/>
        <circle class="sb-cactus__eye" cx="66" cy="64" r="3.4" fill="#0C1219"/>
        <path d="M53.5 74 Q60 80 66.5 74" stroke="#0C1219" stroke-width="2.6" stroke-linecap="round" fill="none"/>
        <circle cx="49.5" cy="70.5" r="2.3" fill="rgba(107,245,206,.35)"/>
        <circle cx="70.5" cy="70.5" r="2.3" fill="rgba(107,245,206,.35)"/>
      </g>
    </svg>`;

  const UI = {
    ar: { open: "افتح المساعدة صبّارة", title: "المساعدة صبّارة", sub: "مساعدة موقع صبّارة", close: "إغلاق", placeholder: "اسأل عن صبّارة…", send: "إرسال", input: "سؤالك",
          bubble: "<strong>مرحبًا، أنا المساعدة صبّارة</strong>أجيبك عن الحلول والمنتجات والأسعار المنشورة على الموقع." },
    en: { open: "Open the Sabbarah assistant", title: "Sabbarah Assistant", sub: "Website assistant", close: "Close", placeholder: "Ask about Sabbarah…", send: "Send", input: "Your question",
          bubble: "<strong>Hi, I'm the Sabbarah assistant</strong>I answer about the solutions, products and pricing published on this site." },
  };

  const root = document.createElement("div");
  root.className = "sb-assistant";
  root.innerHTML = `
    <div class="sb-bubble" role="status"></div>
    <button class="sb-cactus" type="button" aria-haspopup="dialog" aria-expanded="false">${cactusSVG("L")}</button>`;
  const backdrop = document.createElement("div");
  backdrop.className = "sb-backdrop";
  const panel = document.createElement("div");
  panel.className = "sb-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.innerHTML = `
    <div class="sb-panel__head">
      <div class="sb-panel__avatar">${cactusSVG("P")}</div>
      <div class="sb-panel__title"><strong></strong><span></span></div>
      <button class="sb-panel__close" type="button">✕</button>
    </div>
    <div class="sb-panel__body" aria-live="polite"></div>
    <form class="sb-input">
      <input type="text" autocomplete="off" maxlength="400">
      <button class="sb-send" type="submit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"/><path d="M22 2 15 22 11 13 2 9 22 2z"/></svg></button>
    </form>`;
  document.body.appendChild(root);
  document.body.appendChild(backdrop);
  document.body.appendChild(panel);

  const cactusBtn = root.querySelector(".sb-cactus");
  const bubble = root.querySelector(".sb-bubble");
  const body = panel.querySelector(".sb-panel__body");
  const input = panel.querySelector("input");
  const closeBtn = panel.querySelector(".sb-panel__close");

  const applyUI = () => {
    const u = UI[uiLang()];
    cactusBtn.setAttribute("aria-label", u.open);
    panel.setAttribute("aria-label", u.title);
    panel.querySelector(".sb-panel__title strong").textContent = u.title;
    panel.querySelector(".sb-panel__title span").textContent = u.sub;
    closeBtn.setAttribute("aria-label", u.close);
    input.setAttribute("placeholder", u.placeholder);
    input.setAttribute("aria-label", u.input);
    panel.querySelector(".sb-send").setAttribute("aria-label", u.send);
    bubble.innerHTML = u.bubble;
    panel.dir = uiLang() === "en" ? "ltr" : "rtl";
  };
  applyUI();
  document.addEventListener("sb:langchange", applyUI);

  const doBook = () => window.open(BOOKING_URL, "_blank", "noopener,noreferrer");
  const doHuman = () => {
    const ar = uiLang() !== "en";
    const mail = "mailto:" + EMAIL + "?subject=" + encodeURIComponent(ar ? "رسالة من زائر موقع صبّارة" : "Message from a sabbarahai.com visitor")
      + "&body=" + encodeURIComponent(ar ? "مرحبًا فريق صبّارة،\n\n(اكتب رسالتك هنا)\n" : "Hello Sabbarah team,\n\n(write your message here)\n");
    window.open(mail, "_blank");
  };
  const doGoto = (sel) => {
    if (!sel.startsWith("#")) { window.location.href = sel; return; }
    const el = document.querySelector(sel);
    if (el) { el.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    window.location.href = "index.html" + sel;
  };

  const addMsg = (content, who, lang, isHtml) => {
    const msg = document.createElement("div");
    msg.className = "sb-msg sb-msg--" + who;
    msg.dir = lang === "en" ? "ltr" : "rtl";
    if (isHtml) msg.innerHTML = content; else msg.textContent = content;
    body.appendChild(msg);
    body.scrollTo({ top: body.scrollHeight, behavior: "smooth" });
    return msg;
  };

  const sendAsUser = (text) => { addMsg(text, "user", replyLang(text)); respond(text); };

  const addChips = (list, lang) => {
    if (!list || !list.length) return;
    const row = document.createElement("div");
    row.className = "sb-acts";
    row.dir = lang === "en" ? "ltr" : "rtl";
    list.forEach((c) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = c.t;
      b.addEventListener("click", () => {
        row.remove();
        if (c.goto) { doGoto(c.goto); addMsg(lang === "ar" ? "نقلتك إلى القسم. أنا هنا إذا احتجت شيئًا آخر." : "Took you there. I'm here if you need anything else.", "bot", lang, false); if (window.matchMedia("(max-width: 720px)").matches) close(); }
        else if (c.book) { doBook(); addMsg(lang === "ar" ? "فتحت لك صفحة الحجز — اختر الوقت المناسب." : "Opened the booking page — pick your time.", "bot", lang, false); }
        else if (c.human) { doHuman(); addMsg(lang === "ar" ? "جهزت لك رسالة بريد للفريق." : "Prepared an email to the team.", "bot", lang, false); }
        else sendAsUser(typeof c.send === "string" ? c.send : c.t);
      });
      row.appendChild(b);
    });
    body.appendChild(row);
    body.scrollTo({ top: body.scrollHeight, behavior: "smooth" });
  };

  const respond = (raw) => {
    const lang = replyLang(raw);
    const typing = document.createElement("div");
    typing.className = "sb-msg sb-msg--bot sb-typing";
    typing.innerHTML = "<i></i><i></i><i></i>";
    body.appendChild(typing);
    body.scrollTo({ top: body.scrollHeight, behavior: "smooth" });
    const reply = think(raw);
    setTimeout(() => {
      typing.remove();
      addMsg(reply.html, "bot", lang, true);
      addChips(reply.chips, lang);
    }, 500 + Math.min(900, reply.html.length * 2));
  };

  /* open / close — a real dialog */
  let lastFocus = null, isOpen = false;
  const focusables = () => Array.prototype.slice.call(panel.querySelectorAll("button, input, a[href]")).filter((el) => !el.disabled && el.offsetParent !== null);
  const trap = (e) => {
    if (!isOpen || e.key !== "Tab") return;
    const f = focusables(); if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  const open = () => {
    if (isOpen) return;
    isOpen = true;
    lastFocus = document.activeElement;
    root.classList.add("sb-assistant--open");
    panel.classList.add("sb-panel--open");
    cactusBtn.setAttribute("aria-expanded", "true");
    bubble.classList.remove("sb-bubble--show");
    document.body.classList.add("sb-open");
    if (window.matchMedia("(max-width: 720px)").matches) { backdrop.classList.add("is-on"); document.body.classList.add("sb-locked"); }
    document.dispatchEvent(new CustomEvent("sb:assistant", { detail: { open: true } }));
    if (body.childElementCount === 0) {
      const lang = uiLang();
      const typing = document.createElement("div");
      typing.className = "sb-msg sb-msg--bot sb-typing";
      typing.innerHTML = "<i></i><i></i><i></i>";
      body.appendChild(typing);
      setTimeout(() => {
        typing.remove();
        const g = greetingReply(lang);
        addMsg(g.html, "bot", lang, true);
        addChips(g.chips, lang);
      }, 600);
    }
    setTimeout(() => input.focus(), 350);
  };
  const close = () => {
    if (!isOpen) return;
    isOpen = false;
    root.classList.remove("sb-assistant--open");
    panel.classList.remove("sb-panel--open");
    cactusBtn.setAttribute("aria-expanded", "false");
    backdrop.classList.remove("is-on");
    document.body.classList.remove("sb-locked", "sb-open");
    document.dispatchEvent(new CustomEvent("sb:assistant", { detail: { open: false } }));
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  };
  cactusBtn.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
  backdrop.addEventListener("click", close);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen) { close(); return; }
    trap(e);
  });

  panel.querySelector(".sb-input").addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    sendAsUser(text);
  });

  /* entrance: once */
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  setTimeout(() => {
    cactusBtn.classList.add("sb-cactus--in");
    if (!reduced) cactusBtn.classList.add("sb-cactus--waving");
    setTimeout(() => cactusBtn.classList.remove("sb-cactus--waving"), 4200);
    setTimeout(() => { if (!isOpen) bubble.classList.add("sb-bubble--show"); }, 900);
    setTimeout(() => bubble.classList.remove("sb-bubble--show"), 9000);
  }, 1000);

  /* exposed for QA only: local, read-only reasoning */
  window.SB_ASSIST = { ask: (q) => think(q) };
})();
