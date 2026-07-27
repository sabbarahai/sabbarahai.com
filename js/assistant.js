/* ============================================================
   SABBARAH AI — Cactus Assistant (مساعد صبّارة)
   - Animated cactus character that rises from the bottom
     corner, waves and greets the visitor.
   - Bilingual (Arabic / English) with automatic language
     detection per message.
   - Answers ONLY Sabbarah-related questions (services,
     products, portfolio, pricing, process, contact, pages).
   ============================================================ */

(() => {
  "use strict";

  const BOOKING_URL = "https://calendar.app.google/NntsHaXCaKPwTb8h9";
  const EMAIL = "hello@sabbarahai.com";

  /* ---------------------------------------------------------
     Cactus character SVG (brand-built: Deep Jade → Sabbarah
     Green body, Desert Gold spark like the Sabbarah logo)
     --------------------------------------------------------- */
  const cactusSVG = (idSuffix) => `
    <svg viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="sbBody${idSuffix}" x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stop-color="#1FD9A0"/>
          <stop offset="62%" stop-color="#15A87C"/>
          <stop offset="100%" stop-color="#0E5C4A"/>
        </linearGradient>
        <linearGradient id="sbArm${idSuffix}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#1FD9A0"/>
          <stop offset="100%" stop-color="#10745D"/>
        </linearGradient>
      </defs>

      <!-- ground glow -->
      <ellipse cx="60" cy="131" rx="31" ry="6" fill="rgba(31,217,160,.16)"/>

      <g class="sb-cactus__body">
        <!-- gold spark (logo motif) -->
        <path d="M52 23 L60 15 L68 23" stroke="#C9A227" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="60" cy="30.5" r="4.6" fill="#C9A227"/>

        <!-- static arm (viewer's left) -->
        <rect x="23" y="52" width="15" height="27" rx="7.5" fill="url(#sbArm${idSuffix})"/>
        <rect x="27" y="68" width="22" height="14" rx="7" fill="url(#sbArm${idSuffix})"/>

        <!-- waving arm (viewer's right) -->
        <g class="sb-cactus__arm-wave">
          <rect x="72" y="64" width="22" height="14" rx="7" fill="url(#sbArm${idSuffix})"/>
          <rect x="83" y="40" width="15" height="34" rx="7.5" fill="url(#sbArm${idSuffix})"/>
        </g>

        <!-- main body -->
        <rect x="43" y="38" width="34" height="90" rx="17" fill="url(#sbBody${idSuffix})"/>
        <!-- cactus ridges -->
        <path d="M52 48 V118 M68 48 V118" stroke="rgba(6,18,15,.22)" stroke-width="2" stroke-linecap="round"/>

        <!-- face -->
        <circle class="sb-cactus__eye" cx="54" cy="64" r="3.4" fill="#0C1219"/>
        <circle class="sb-cactus__eye" cx="66" cy="64" r="3.4" fill="#0C1219"/>
        <path d="M53.5 74 Q60 80 66.5 74" stroke="#0C1219" stroke-width="2.6" stroke-linecap="round" fill="none"/>
        <!-- mint cheeks -->
        <circle cx="49.5" cy="70.5" r="2.3" fill="rgba(107,245,206,.35)"/>
        <circle cx="70.5" cy="70.5" r="2.3" fill="rgba(107,245,206,.35)"/>
      </g>
    </svg>`;

  /* ---------------------------------------------------------
     Bilingual UI strings
     --------------------------------------------------------- */
  const UI = {
    ar: {
      bubbleTitle: "مرحبًا! أنا مساعد صبّارة 🌵",
      bubbleText: "اضغط عليّ إذا عندك أي سؤال عن صبّارة وخدماتها.",
      panelTitle: "مساعد صبّارة",
      panelStatus: "متصل الآن · Sabbarah Assistant",
      placeholder: "اكتب سؤالك عن صبّارة…",
      greeting: "أهلًا بك في صبّارة 🌵\nكيف يمكنني مساعدتك اليوم؟",
      chips: ["حلول صبّارة", "الأسعار", "احجز استشارة", "تواصل معنا"],
    },
    en: {
      bubbleTitle: "Hi! I'm the Sabbarah Assistant 🌵",
      bubbleText: "Click me if you have any question about Sabbarah.",
      panelTitle: "Sabbarah Assistant",
      panelStatus: "Online now · مساعد صبّارة",
      placeholder: "Ask me about Sabbarah…",
      greeting: "Welcome to Sabbarah 🌵\nHow can I help you today?",
      chips: ["Our solutions", "Pricing", "Book a consultation", "Contact us"],
    },
  };

  const REFUSAL = {
    ar: "أنا مساعد صبّارة 🌵 وأستطيع المساعدة فقط في الخدمات والمنتجات والمعلومات المتعلقة بصبّارة.",
    en: "I'm the Sabbarah Assistant 🌵 and I can only help with information related to Sabbarah services, products, and website content.",
  };

  /* ---------------------------------------------------------
     Knowledge base — Sabbarah topics ONLY
     --------------------------------------------------------- */
  const KNOWLEDGE = [
    {
      id: "greeting",
      ar: ["مرحبا", "هلا", "اهلا", "السلام عليكم", "سلام", "صباح الخير", "مساء الخير", "حياك", "هاي"],
      en: ["hello", "hi", "hey", "salam", "good morning", "good evening", "greetings"],
      answer: {
        ar: "أهلًا بك في صبّارة 🌵\nكيف يمكنني مساعدتك اليوم؟",
        en: "Welcome to Sabbarah 🌵\nHow can I help you today?",
      },
    },
    {
      id: "about",
      ar: ["من انتم", "عن صباره", "وش صباره", "ما هي صباره", "مين صباره", "تعريف", "نبذه", "من انت"],
      en: ["what is sabbarah", "about sabbarah", "who are you", "who is sabbarah", "tell me about", "what do you do", "company"],
      answer: {
        ar: "صبّارة AI 🌵 شركة سعودية تبني وكلاء ذكاء اصطناعي وحلول أتمتة للأعمال، مع الأمان والخصوصية والحوكمة مدمجة في التصميم من البداية.\n\nشغلك كثير؟ خلّ صبّارة تشتغل معك!",
        en: "Sabbarah AI 🌵 is a Saudi company that builds AI agents and business automation solutions — with security, privacy, and governance built into the design from day one.\n\nToo much work? Let Sabbarah work with you!",
      },
    },
    {
      id: "services",
      ar: ["خدمات", "حلول", "منتجات", "وش تسوون", "وش تقدمون", "ماذا تقدمون", "اعمالكم"],
      en: ["services", "solutions", "products", "offerings", "what do you offer", "what can you do", "capabilities"],
      answer: {
        ar: "حلول صبّارة الذكية 🌵:\n\n١. وكلاء خدمة العملاء — يردّون على الاستفسارات والطلبات المتكررة مع تحويل الحالات للبشر عند الحاجة.\n٢. أتمتة الأعمال والـ Workflows — نحوّل العمليات اليدوية إلى مسارات عمل ذكية.\n٣. المتابعة والعمليات التلقائية — متابعات وتنبيهات وتحديثات تلقائية.\n٤. البورتفوليو الذكي — بورتفوليو تفاعلي مع مساعد ذكي.\n\nتحب تعرف أكثر عن حل معيّن؟",
        en: "Sabbarah's smart solutions 🌵:\n\n1. Customer Service Agents — AI agents that handle common inquiries and hand off to humans when needed.\n2. Business Automation & Workflows — we turn manual, repetitive processes into smart workflows.\n3. Automated Follow-ups & Operations — follow-ups, alerts, updates, and actions run automatically.\n4. Smart Portfolio — an interactive portfolio with a built-in AI assistant.\n\nWant to know more about any of them?",
      },
    },
    {
      id: "agents",
      ar: ["وكيل", "وكلاء", "خدمه العملاء", "رد الي", "شات بوت", "بوت", "دعم فني", "استفسارات"],
      en: ["customer service", "agent", "agents", "chatbot", "support bot", "answer customers", "inquiries", "whatsapp"],
      answer: {
        ar: "وكلاء خدمة العملاء من صبّارة 🌵 هم وكلاء ذكاء اصطناعي يساعدون في الرد على استفسارات وطلبات عملائك المتكررة بسرعة وبشكل متّسق، مع تحويل الحالات التي تحتاج تدخلًا بشريًا إلى فريقك.\n\nتحب تشوف كيف يخدم نشاطك؟ احجز استشارة مجانية من هنا:\n" + BOOKING_URL,
        en: "Sabbarah's Customer Service Agents 🌵 are AI agents that answer your customers' common inquiries quickly and consistently, and hand over cases that need a human touch to your team.\n\nWant to see how this fits your business? Book a free consultation here:\n" + BOOKING_URL,
      },
    },
    {
      id: "automation",
      ar: ["اتمته", "أتمته", "اتمت", "عمليات يدويه", "تكرار", "workflow", "مسارات عمل", "ربط الانظمه", "تكامل"],
      en: ["automation", "automate", "workflow", "workflows", "manual process", "repetitive", "integrate", "integration", "connect tools"],
      answer: {
        ar: "أتمتة الأعمال من صبّارة 🌵:\n\nنحوّل العمليات اليدوية والمتكررة إلى مسارات عمل ذكية تربط أدواتك وأنظمتك وتقلل العمل اليدوي — مثل الردود، المتابعة، نقل البيانات، التنبيهات، والتكامل بين الأنظمة.\n\nأي عملية متكررة وقابلة لوصف خطواتها بوضوح قد تكون مرشحة للأتمتة.",
        en: "Business Automation by Sabbarah 🌵:\n\nWe turn manual, repetitive processes into smart workflows that connect your tools and systems and reduce manual work — like replies, follow-ups, data transfer, alerts, and system integrations.\n\nAny repeatable process whose steps can be clearly described is a candidate for automation.",
      },
    },
    {
      id: "followup",
      ar: ["متابعه", "تنبيه", "تنبيهات", "تحديثات", "عمليات تلقائيه", "نقل بيانات"],
      en: ["follow up", "follow-up", "followup", "alerts", "notifications", "automatic operations", "data transfer", "reminders"],
      answer: {
        ar: "المتابعة والعمليات التلقائية 🌵:\n\nنبني أنظمة تنفّذ المتابعات والتنبيهات والتحديثات ونقل البيانات والإجراءات تلقائيًا حسب سير عمل مشروعك — بدون ما يضيع شيء أو يتأخر.",
        en: "Automated Follow-ups & Operations 🌵:\n\nWe build systems that run follow-ups, alerts, updates, data transfers, and actions automatically based on your project's workflow — nothing slips or gets delayed.",
      },
    },
    {
      id: "portfolio",
      ar: ["بورتفوليو", "ملف اعمال", "معرض اعمال", "سيره ذاتيه"],
      en: ["portfolio", "smart portfolio", "showcase", "cv", "resume"],
      answer: {
        ar: "البورتفوليو الذكي من صبّارة 🌵:\n\nبورتفوليو مهني تفاعلي يعرض خبراتك ومشاريعك، ومعه مساعد ذكي يجيب عن أسئلة الزائر حول صاحب الملف — بورتفوليو حي يتكلم عنك.",
        en: "Sabbarah's Smart Portfolio 🌵:\n\nAn interactive professional portfolio that showcases your experience and projects, with a built-in AI assistant that answers visitors' questions about you — a living portfolio that speaks for you.",
      },
    },
    {
      id: "pricing",
      ar: ["سعر", "اسعار", "الاسعار", "تكلفه", "كم يكلف", "بكم", "باقات", "ميزانيه", "فلوس"],
      en: ["price", "pricing", "cost", "how much", "packages", "plans", "budget", "fees", "rates"],
      answer: {
        ar: "أسعار حلول صبّارة 🌵 تعتمد على حجم الحل واحتياج نشاطك، لأن كل حل يُصمَّم خصيصًا لعملياتك.\n\nيمكنك البدء بحل صغير محدود النطاق ثم التوسع لاحقًا.\n\nاحجز استشارة مجانية ونعطيك تصورًا واضحًا للتكلفة:\n" + BOOKING_URL,
        en: "Sabbarah's pricing 🌵 depends on the scope of the solution and your business needs, since every solution is custom-designed for your workflows.\n\nYou can start with a small, well-scoped solution and expand later.\n\nBook a free consultation and we'll give you a clear cost estimate:\n" + BOOKING_URL,
      },
    },
    {
      id: "booking",
      ar: ["حجز", "احجز", "استشاره", "موعد", "اجتماع", "مكالمه", "ابدا", "ابغى ابدا", "نبدا"],
      en: ["book", "booking", "consultation", "appointment", "meeting", "call", "demo", "get started", "start"],
      answer: {
        ar: "يسعدنا نبدأ معك 🌵\n\nاحجز استشارتك عبر الرابط التالي:\n" + BOOKING_URL + "\n\nنفهم احتياجك، ونشوف وش تقدر صبّارة تسوي لك.",
        en: "We'd love to get started with you 🌵\n\nBook your consultation here:\n" + BOOKING_URL + "\n\nWe'll understand your needs and see what Sabbarah can do for you.",
      },
    },
    {
      id: "contact",
      ar: ["تواصل", "اتصال", "ايميل", "بريد", "رقم", "واتساب", "تواصل معنا"],
      en: ["contact", "email", "reach", "phone", "get in touch"],
      answer: {
        ar: "للتواصل مع صبّارة 🌵:\n\n📧 البريد: " + EMAIL + "\n🌐 الموقع: https://sabbarahai.com\n📍 المملكة العربية السعودية\n\nأو احجز استشارة مباشرة:\n" + BOOKING_URL,
        en: "Contact Sabbarah 🌵:\n\n📧 Email: " + EMAIL + "\n🌐 Website: https://sabbarahai.com\n📍 Saudi Arabia\n\nOr book a consultation directly:\n" + BOOKING_URL,
      },
    },
    {
      id: "process",
      ar: ["كيف تعملون", "كيف تشتغلون", "خطوات", "مراحل", "طريقه العمل", "الية العمل"],
      en: ["how do you work", "process", "steps", "methodology", "how it works", "stages"],
      answer: {
        ar: "طريقة عمل صبّارة — من الفكرة إلى التشغيل 🌵:\n\n١. نفهم — احتياجك وعملياتك وأين يضيع الوقت.\n٢. نصمم — الحل ومسارات العمل والبيانات والصلاحيات والضوابط.\n٣. نبني ونختبر — الوظائف والتكاملات والأمان قبل التشغيل.\n٤. نشغّل وندعم — نطلق الحل ونراقب الأداء وندعم التحسين المستمر.",
        en: "How Sabbarah works — from idea to operation 🌵:\n\n1. Understand — your needs, your workflows, and where time is being lost.\n2. Design — the solution, workflows, data, permissions, and controls.\n3. Build & Test — features, integrations, and security before launch.\n4. Launch & Support — we go live, monitor performance, and keep improving.",
      },
    },
    {
      id: "security",
      ar: ["امان", "امن", "خصوصيه", "حوكمه", "بيانات", "صلاحيات", "اشراف", "مراقبه", "ثقه", "حمايه"],
      en: ["security", "privacy", "governance", "data", "safe", "permissions", "oversight", "monitoring", "trust", "protection", "compliance"],
      answer: {
        ar: "في صبّارة، الذكاء الاصطناعي وحده ما يكفي 🌵\n\nالأمن والخصوصية والحوكمة جزء من التصميم من البداية:\n\n• الخصوصية من البداية — Privacy by Design\n• صلاحيات واضحة — Access Control\n• إشراف بشري — Human Oversight\n• مراقبة مستمرة — Monitoring\n• حوكمة الذكاء الاصطناعي — AI Governance\n\nنراعي نوع البيانات وأقل قدر من الوصول وفصل المسؤوليات في كل حل.",
        en: "At Sabbarah, AI alone is not enough 🌵\n\nSecurity, privacy, and governance are part of the design from day one:\n\n• Privacy by Design\n• Access Control\n• Human Oversight\n• Continuous Monitoring\n• AI Governance\n\nWe consider data types, least-privilege access, and separation of duties in every solution.",
      },
    },
    {
      id: "replace-staff",
      ar: ["يستبدل", "استبدال", "موظفين", "يوظف", "وظايف", "يسحب شغل"],
      en: ["replace", "employees", "staff", "jobs", "replace my team", "fire"],
      answer: {
        ar: "هدف صبّارة 🌵 ليس استبدال موظفيك، بل تقليل العمل المتكرر وتمكين فريقك من التركيز على المهام التي تحتاج حكمًا بشريًا — مع إبقاء التدخل البشري ضمن التصميم عند الحاجة.",
        en: "Sabbarah's goal 🌵 is not to replace your team — it's to reduce repetitive work so your people can focus on tasks that need human judgment, with human oversight built into the design where needed.",
      },
    },
    {
      id: "pages",
      ar: ["صفحات", "الموقع", "اقسام", "وين القى", "محتوى الموقع", "روابط"],
      en: ["pages", "website", "sections", "navigate", "where can i find", "site content", "links"],
      answer: {
        ar: "أقسام موقع صبّارة 🌵 (sabbarahai.com):\n\n• حلولنا — الحلول الذكية الأربعة\n• لماذا صبّارة — الأمن والخصوصية والحوكمة\n• كيف نعمل — خطوات العمل الأربع\n• الأسئلة الشائعة — إجابات مباشرة\n• تواصل معنا — الحجز والتواصل\n\nتقدر تتنقل بينها من القائمة في أعلى الصفحة.",
        en: "Sabbarah website sections 🌵 (sabbarahai.com):\n\n• Our Solutions — the four smart solutions\n• Why Sabbarah — security, privacy, and governance\n• How We Work — our four-step process\n• FAQ — direct answers\n• Contact — booking and contact info\n\nYou can navigate between them from the top menu.",
      },
    },
    {
      id: "custom",
      ar: ["مخصص", "يناسب نشاطي", "حسب احتياجي", "حل صغير", "اطوره", "توسع"],
      en: ["custom", "customized", "tailored", "my business", "small solution", "scale", "expand later"],
      answer: {
        ar: "نعم 🌵 كل حل من صبّارة يُصمَّم على نشاطك:\n\nنبدأ بفهم سير العمل الفعلي عندك، ثم نصمم الحل على احتياجك والأنظمة المستخدمة لديك.\n\nوتقدر تبدأ بحل صغير محدود النطاق ثم تتوسع بعد قياس النتيجة.",
        en: "Yes 🌵 every Sabbarah solution is designed around your business:\n\nWe start by understanding your actual workflow, then design the solution around your needs and the systems you already use.\n\nYou can also start with a small, well-scoped solution and expand after measuring results.",
      },
    },
    {
      id: "languages",
      ar: ["لغه", "لغات", "عربي", "انجليزي", "تتكلم"],
      en: ["language", "languages", "arabic", "english", "speak"],
      answer: {
        ar: "أتحدث العربية والإنجليزية 🌵\nاكتب لي بأي لغة منهما وسأرد عليك بنفس اللغة تلقائيًا.",
        en: "I speak both Arabic and English 🌵\nWrite to me in either language and I'll automatically reply in the same one.",
      },
    },
    {
      id: "thanks",
      ar: ["شكرا", "مشكور", "يعطيك العافيه", "ممتاز", "رائع", "جزاك"],
      en: ["thanks", "thank you", "great", "awesome", "perfect", "appreciated"],
      answer: {
        ar: "العفو! 🌵 سعيد بمساعدتك.\nإذا احتجت أي شيء آخر عن صبّارة، أنا هنا.",
        en: "You're welcome! 🌵 Happy to help.\nIf you need anything else about Sabbarah, I'm right here.",
      },
    },
    {
      id: "bye",
      ar: ["مع السلامه", "وداعا", "باي", "الى اللقاء", "اشوفك"],
      en: ["bye", "goodbye", "see you", "later"],
      answer: {
        ar: "إلى اللقاء! 🌵\nصبّارة دائمًا هنا متى ما احتجتنا.",
        en: "Goodbye! 🌵\nSabbarah is always here whenever you need us.",
      },
    },
  ];

  /* Clearly off-topic subjects — always refused */
  const BLOCKED = {
    ar: ["سياسه", "انتخابات", "رئيس", "حكومه", "دين", "فتوى", "طقس", "رياضه", "مباراه", "اخبار", "اسهم", "عملات", "وصفه", "طبخ", "اكتب كود", "برمج لي", "حل واجب", "قصيده", "نكته", "ترجم"],
    en: ["politics", "election", "president", "government", "religion", "weather", "sport", "football", "match", "news", "stock", "crypto", "bitcoin", "recipe", "cook", "write code", "debug", "python", "javascript", "homework", "poem", "joke", "translate", "math"],
  };

  /* ---------------------------------------------------------
     Language detection + text normalization
     --------------------------------------------------------- */
  const detectLang = (text) => (/[؀-ۿ]/.test(text) ? "ar" : "en");

  const normalize = (text) =>
    text
      .toLowerCase()
      .replace(/[ً-ْٰـ]/g, "")   // diacritics + tatweel
      .replace(/[أإآٱ]/g, "ا")
      .replace(/ة/g, "ه")
      .replace(/ى/g, "ي")
      .replace(/ؤ/g, "و")
      .replace(/ئ/g, "ي")
      .replace(/[?؟!.,،؛:]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const scoreKeywords = (normalizedText, keywords) => {
    let score = 0;
    for (const kw of keywords) {
      const nkw = normalize(kw);
      if (!nkw) continue;
      // English keywords match whole words only; Arabic matches as substrings
      const matched = /^[\x00-\x7F]+$/.test(nkw)
        ? new RegExp(`\\b${escapeRegExp(nkw)}\\b`).test(normalizedText)
        : normalizedText.includes(nkw);
      if (matched) score += nkw.length;
    }
    return score;
  };

  const getReply = (rawText) => {
    const lang = detectLang(rawText);
    const text = normalize(rawText);
    if (!text) return { lang, reply: UI[lang].greeting };

    const blockScore = scoreKeywords(text, [...BLOCKED.ar, ...BLOCKED.en]);

    let best = null;
    let bestScore = 0;
    for (const intent of KNOWLEDGE) {
      const s = scoreKeywords(text, [...intent.ar, ...intent.en]);
      if (s > bestScore) { bestScore = s; best = intent; }
    }

    if (blockScore > 0 && blockScore >= bestScore) return { lang, reply: REFUSAL[lang] };
    if (best && bestScore > 0) return { lang, reply: best.answer[lang] };
    return { lang, reply: REFUSAL[lang] };
  };

  /* ---------------------------------------------------------
     DOM construction
     --------------------------------------------------------- */
  const pageLang = detectLang(document.documentElement.lang === "ar" ? "ا" : "a");
  let currentLang = pageLang;

  const root = document.createElement("div");
  root.className = "sb-assistant";
  root.innerHTML = `
    <div class="sb-bubble" role="status">
      <strong data-sb="bubbleTitle"></strong>
      <span data-sb="bubbleText"></span>
    </div>
    <button class="sb-cactus" type="button" aria-haspopup="dialog"
            aria-label="${pageLang === "ar" ? "افتح مساعد صبّارة" : "Open the Sabbarah Assistant"}">
      ${cactusSVG("L")}
      <span class="sb-cactus__ping" aria-hidden="true"></span>
    </button>
  `;

  const panel = document.createElement("div");
  panel.className = "sb-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "false");
  panel.setAttribute("aria-label", pageLang === "ar" ? "مساعد صبّارة" : "Sabbarah Assistant");
  panel.innerHTML = `
    <div class="sb-panel__head">
      <div class="sb-panel__avatar">${cactusSVG("P")}</div>
      <div class="sb-panel__title">
        <strong data-sb="panelTitle"></strong>
        <span data-sb="panelStatus"></span>
      </div>
      <button class="sb-panel__close" type="button" aria-label="${pageLang === "ar" ? "إغلاق" : "Close"}">✕</button>
    </div>
    <div class="sb-panel__body" aria-live="polite"></div>
    <div class="sb-chips"></div>
    <form class="sb-panel__input">
      <input type="text" autocomplete="off" maxlength="500" data-sb-placeholder />
      <button class="sb-send" type="submit" aria-label="${pageLang === "ar" ? "إرسال" : "Send"}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 2 11 13"/><path d="M22 2 15 22 11 13 2 9 22 2z"/>
        </svg>
      </button>
    </form>
    <div class="sb-panel__foot">🌵 Sabbarah AI Assistant · sabbarahai.com</div>
  `;

  document.body.appendChild(root);
  document.body.appendChild(panel);

  const cactusBtn = root.querySelector(".sb-cactus");
  const bubble = root.querySelector(".sb-bubble");
  const closeBtn = panel.querySelector(".sb-panel__close");
  const body = panel.querySelector(".sb-panel__body");
  const chipsWrap = panel.querySelector(".sb-chips");
  const form = panel.querySelector(".sb-panel__input");
  const input = form.querySelector("input");

  const applyLang = (lang) => {
    currentLang = lang;
    const t = UI[lang];
    root.querySelector('[data-sb="bubbleTitle"]').textContent = t.bubbleTitle;
    root.querySelector('[data-sb="bubbleText"]').textContent = t.bubbleText;
    panel.querySelector('[data-sb="panelTitle"]').textContent = t.panelTitle;
    panel.querySelector('[data-sb="panelStatus"]').textContent = t.panelStatus;
    input.placeholder = t.placeholder;
    input.dir = lang === "ar" ? "rtl" : "ltr";
    renderChips(lang);
  };

  /* ---------------------------------------------------------
     Messages
     --------------------------------------------------------- */
  const linkify = (text) =>
    text
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#6BF5CE;text-decoration:underline">$1</a>')
      .replace(/([\w.+-]+@[\w-]+\.[\w.]+)/g, '<a href="mailto:$1" style="color:#6BF5CE;text-decoration:underline">$1</a>');

  const addMessage = (text, who, lang) => {
    const msg = document.createElement("div");
    msg.className = `sb-msg sb-msg--${who}`;
    msg.dir = lang === "ar" ? "rtl" : "ltr";
    if (who === "bot") msg.innerHTML = linkify(text);
    else msg.textContent = text;
    body.appendChild(msg);
    body.scrollTo({ top: body.scrollHeight, behavior: "smooth" });
    return msg;
  };

  const showTyping = () => {
    const typing = document.createElement("div");
    typing.className = "sb-msg sb-msg--bot sb-typing";
    typing.innerHTML = "<i></i><i></i><i></i>";
    body.appendChild(typing);
    body.scrollTo({ top: body.scrollHeight, behavior: "smooth" });
    return typing;
  };

  const botRespond = (rawText) => {
    const { lang, reply } = getReply(rawText);
    if (lang !== currentLang) applyLang(lang);
    const typing = showTyping();
    const delay = 550 + Math.min(900, reply.length * 3);
    setTimeout(() => {
      typing.remove();
      addMessage(reply, "bot", lang);
    }, delay);
  };

  const renderChips = (lang) => {
    chipsWrap.innerHTML = "";
    UI[lang].chips.forEach((label) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "sb-chip";
      chip.textContent = label;
      chip.addEventListener("click", () => {
        addMessage(label, "user", lang);
        botRespond(label);
      });
      chipsWrap.appendChild(chip);
    });
  };

  /* ---------------------------------------------------------
     Open / close
     --------------------------------------------------------- */
  let hasGreeted = false;

  const openPanel = () => {
    root.classList.add("sb-assistant--open");
    panel.classList.add("sb-panel--open");
    cactusBtn.classList.remove("sb-cactus--ping");
    bubble.classList.remove("sb-bubble--show");
    if (!hasGreeted) {
      hasGreeted = true;
      const typing = showTyping();
      setTimeout(() => {
        typing.remove();
        addMessage(UI[currentLang].greeting, "bot", currentLang);
      }, 700);
    }
    setTimeout(() => input.focus(), 350);
  };

  const closePanel = () => {
    root.classList.remove("sb-assistant--open");
    panel.classList.remove("sb-panel--open");
  };

  cactusBtn.addEventListener("click", openPanel);
  closeBtn.addEventListener("click", closePanel);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panel.classList.contains("sb-panel--open")) closePanel();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = input.value.trim();
    if (!value) return;
    input.value = "";
    addMessage(value, "user", detectLang(value));
    botRespond(value);
  });

  /* ---------------------------------------------------------
     Entrance: rise from the bottom, wave, greet
     --------------------------------------------------------- */
  applyLang(pageLang);

  setTimeout(() => {
    cactusBtn.classList.add("sb-cactus--in", "sb-cactus--waving");
    setTimeout(() => bubble.classList.add("sb-bubble--show"), 900);
    setTimeout(() => {
      bubble.classList.remove("sb-bubble--show");
      cactusBtn.classList.add("sb-cactus--ping");
    }, 9500);
  }, 1100);

  // Occasional friendly re-wave while the panel is closed
  setInterval(() => {
    if (panel.classList.contains("sb-panel--open")) return;
    cactusBtn.classList.remove("sb-cactus--waving");
    void cactusBtn.offsetWidth; // restart the animation
    cactusBtn.classList.add("sb-cactus--waving");
  }, 26000);
})();
