/* ============================================================
   المساعدة صبّارة v2 — the Sabbarah consultant
   - Real intent engine: normalization, fuzzy matching, phrase +
     token scoring, Arabic / English / MIXED messages.
   - Pain-to-solution mapping: describes a problem in any words,
     gets the right Sabbarah solution with tailored reasoning.
   - Smart follow-up questions for vague requests + context
     memory ("تفاصيل أكثر", "كم السعر؟" follow the last topic).
   - Guides visitors through the page (buttons scroll to sections).
   Client-side only. No external calls.
   ============================================================ */
(() => {
  "use strict";

  const BOOKING_URL = "https://calendar.app.google/QceQcMgBjPm7fMYY8";
  const EMAIL = "hello@sabbarahai.com";

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
    // add stripped variants for common Arabic prefixes (ال، و، بال، لل)
    for (const w of base) {
      if (w.startsWith("بال") && w.length > 5) out.push(w.slice(3));
      else if (w.startsWith("ال") && w.length > 4) out.push(w.slice(2));
      else if (w.startsWith("لل") && w.length > 4) out.push(w.slice(2));
      else if (w.startsWith("و") && w.length > 4) out.push(w.slice(1));
    }
    return out;
  };

  // Arabic if it contains a real Arabic word — so mixed messages reply in Arabic
  const replyLang = (t) => ((t.match(/[؀-ۿ]/g) || []).length >= 2 ? "ar" : "en");

  // tiny Levenshtein for typo tolerance (distance <= 1)
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

  // score a message against a pattern list (phrases + words, both languages at once)
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

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  /* ================= knowledge: the five solutions ================= */
  const SOL = {
    sell: {
      ar: { name: "صبّارة تبيع", what: "تفهم عميلك، تجاوبه، ترشده للخطوة التالية، وتوصله للشراء أو الحجز — وتحوّل لموظفك وقت الحاجة.",
        deep: "صبّارة تبيع 🌵 تشتغل كذا:\n• تستقبل استفسار العميل وتفهم وش يبي\n• تجاوبه فورًا وترشح له المنتج أو الخدمة المناسبة\n• تاخذ بياناته وتحجز له أو تكمل معه الطلب\n• وإذا الحالة تحتاج إنسان — تحوّلها لفريقك بسياق كامل\n\nالنتيجة: عميل ما ينتظر، وفرصة ما تضيع." },
      en: { name: "Sabbarah Sells (صبّارة تبيع)", what: "understands your customer, guides them to the next step, and gets them to purchase or booking — handing off to your team when needed.",
        deep: "How it works 🌵:\n• Receives the inquiry and understands the intent\n• Replies instantly and recommends the right product/service\n• Captures details and books or completes the order\n• Hands sensitive cases to your team with full context" },
    },
    follow: {
      ar: { name: "صبّارة تتابع", what: "ترجع الفرص اللي كانت بتضيع بصمت: سلات متروكة، عملاء اختفوا، مواعيد ما تأكدت.",
        deep: "صبّارة تتابع 🌵 تمسك الفرص اللي تنسل من بين الأصابع:\n• سلة متروكة؟ رسالة متابعة مخصصة في الوقت الصحيح\n• عميل سأل واختفى؟ تفتح معه الموضوع من جديد\n• موعد ما تأكد؟ تذكير وتأكيد وإعادة جدولة تلقائية\n\nكل متابعة تصير في وقتها — بدون ما أحد يتذكرها يدويًا." },
      en: { name: "Sabbarah Follows Up (صبّارة تتابع)", what: "recovers what silently disappears: abandoned carts, ghosting leads, unconfirmed appointments.",
        deep: "How it works 🌵:\n• Abandoned cart? A personalized nudge at the right moment\n• A lead went quiet? It re-opens the conversation\n• Unconfirmed appointment? Reminders and smart rescheduling" },
    },
    care: {
      ar: { name: "صبّارة تهتم", what: "ترد على عملائك فورًا — بالليل والنهار — تجاوب المتكرر، وتحوّل المهم لفريقك.",
        deep: "صبّارة تهتم 🌵 خدمة عملاء ما تنام:\n• رد فوري على الأسئلة المتكررة بأي وقت\n• تحديثات الطلبات والإرجاع والاستبدال\n• الشكاوى والحالات الحساسة تتصعّد لإنسان مباشرة\n• وبعد البيع: طلب تقييم ومتابعة رضا\n\nعميلك يحس إن أحد موجود له — دائمًا." },
      en: { name: "Sabbarah Cares (صبّارة تهتم)", what: "replies to your customers instantly — day and night — answers the repetitive, and escalates what matters to your team.",
        deep: "How it works 🌵:\n• Instant answers to repeated questions, any hour\n• Order updates, returns and exchanges\n• Complaints escalate straight to a human\n• Post-sale reviews and satisfaction follow-up" },
    },
    brief: {
      ar: { name: "صبّارة تختصر", what: "تنهي الشغل اليدوي المتكرر: تقارير، ملخصات، نقل بيانات — ويوصلك ملخصك كل صباح.",
        deep: "صبّارة تختصر 🌵 ترفع الشغل المتكرر عن فريقك:\n• التقارير والملخصات تتجهز تلقائيًا\n• البيانات تنتقل بين أنظمتك بدون نسخ ولصق\n• تنبيهات تشغيلية لما يصير شيء يحتاج انتباه\n• وملخص صباحي لك: وش صار، ووش يحتاج قرارك\n\nساعات أسبوعيًا ترجع لفريقك." },
      en: { name: "Sabbarah Simplifies (صبّارة تختصر)", what: "kills repetitive manual work: reports, summaries, data movement — plus your morning brief.",
        deep: "How it works 🌵:\n• Reports and summaries generate themselves\n• Data moves between your systems without copy-paste\n• Operational alerts when something needs attention\n• A morning brief: what happened, what needs your call" },
    },
    guard: {
      ar: { name: "صبّارة تحمي", what: "خصوصية، صلاحيات واضحة، إشراف بشري، ومراقبة — مدمجة في كل حل من البداية.",
        deep: "صبّارة تحمي 🌵 لأن الذكاء الاصطناعي وحده ما يكفي:\n• الخصوصية من التصميم — نحدد وش نحتاج فعلًا من البيانات\n• صلاحيات واضحة وأقل قدر من الوصول\n• الحالات الحساسة لها إشراف بشري دائمًا\n• مراقبة مستمرة وسجلات لكل إجراء\n\nمو إضافة بعد التشغيل — جزء من التصميم." },
      en: { name: "Sabbarah Guards (صبّارة تحمي)", what: "privacy, clear permissions, human oversight, and monitoring — built into every solution from day one.",
        deep: "How it works 🌵:\n• Privacy by design — we only touch the data the solution needs\n• Clear permissions with least-privilege access\n• Human oversight on every sensitive case\n• Continuous monitoring with a log for every action" },
    },
  };

  const solutionReply = (lang, solId, ack, extra) => {
    const s = SOL[solId][lang];
    if (lang === "ar") {
      return {
        html: ack + "<br><br>الأنسب لحالتك غالبًا: <b>" + s.name + "</b> 🌵<br>" + s.what + (extra ? "<br><br>" + extra : "") +
              "<br><br>تبي تتأكد إنها الأنسب لنشاطك؟ سوّ <b>فحص صبّارة</b> — أقل من دقيقة.",
        chips: [
          { t: "🌵 افحص نشاطك مجانًا", goto: "#scan" },
          { t: "كيف تشتغل بالضبط؟", send: true },
          { t: "احجز استشارة", book: true },
        ],
      };
    }
    return {
      html: ack + "<br><br>Your best fit is likely <b>" + s.name + "</b> 🌵<br>It " + s.what + (extra ? "<br><br>" + extra : "") +
            "<br><br>Want to confirm the fit? Try <b>فحص صبّارة</b> — under a minute.",
      chips: [
        { t: "🌵 Try the free check", goto: "#scan" },
        { t: "How does it work?", send: true },
        { t: "Book a consultation", book: true },
      ],
    };
  };

  /* ================= pains → solutions (the consultant core) ================= */
  const PAINS = [
    { id: "missed-calls", sol: "care",
      p: ["تفوتني مكالمات", "تفوتنا مكالمات", "ما نرد علي المكالمات", "مكالمات كثيره", "ما اقدر ارد", "اتصالات فايته", "مكالمات فايته", "ما الحق ارد",
          "miss calls", "missed calls", "miss customer calls", "missing calls", "cant answer calls", "can not answer calls", "phone keeps ringing"],
      ack: { ar: "واضحة — مكالمات واستفسارات تفوتك وأنت مشغول، وكل وحدة منها عميل محتمل.", en: "Got it — calls and inquiries slip past you while you're busy, and each one is a potential customer." },
      extra: { ar: "وكل استفسار يوصل، صبّارة تلتقط بيانات صاحبه — فما يضيع حتى لو ما اشترى فورًا.", en: "Every inquiry gets captured with the customer's details — nothing is lost even if they don't buy right away." } },
    { id: "whatsapp-overload", sol: "care",
      p: ["رسائل واتساب كثيره", "الواتساب معبي", "الواتس معبي", "ما الحق علي الرسائل", "رسائل كثيره", "غرقانين رسائل", "رسايل كثيره", "الرسائل ما تخلص",
          "whatsapp overwhelming", "whatsapp messages", "too many messages", "flooded with messages", "cant keep up with messages", "dms are crazy", "overwhelmed by messages"],
      ack: { ar: "أعرف هالشعور — واتساب ما يوقف، وفريقك غرقان في نفس الأسئلة.", en: "I know that feeling — WhatsApp never stops, and your team is drowning in the same questions." },
      extra: { ar: "أغلب الرسائل متكررة — وهذي بالذات اللي صبّارة تنهيها فورًا وتخلي فريقك للمهم.", en: "Most of those messages are repetitive — exactly what Sabbarah clears instantly, freeing your team for what matters." } },
    { id: "slow-reply", sol: "care",
      p: ["نرد متاخر", "العملاء ينتظرون", "ما نرد بالليل", "بعد الدوام", "الرد بطيء", "ردنا بطيء", "وقت الرد",
          "slow response", "reply late", "slow replies", "after hours", "at night no one replies", "response time"],
      ack: { ar: "صح — العميل اللي ينتظر ساعات غالبًا يشتري من غيرك.", en: "True — a customer who waits hours usually buys from someone else." } },
    { id: "repetitive-questions", sol: "care",
      p: ["نفس الاسئله", "اسئله متكرره", "يسالون نفس الشي", "اسئله مكرره",
          "same questions", "repetitive questions", "answering the same", "faq all day"],
      ack: { ar: "نفس الأسئلة كل يوم — وقت يروح بدون قيمة.", en: "The same questions every day — time spent with no value added." } },
    { id: "abandoned-carts", sol: "follow",
      p: ["سلات متروكه", "سله متروكه", "يتركون السله", "ما يكملون الشراء", "يضيفون ولا يشترون", "سلات مهجوره",
          "abandoned cart", "abandoned carts", "cart abandonment", "dont complete checkout", "leave the cart", "add to cart and leave"],
      ack: { ar: "السلات المتروكة أوجع نوع من الفرص الضائعة — العميل وصل للنهاية… ووقف.", en: "Abandoned carts are the most painful lost opportunity — the customer got to the finish line… and stopped." } },
    { id: "lost-leads", sol: "follow",
      p: ["عملاء يختفون", "ما نتابع", "ننسي المتابعه", "نسيان المتابعه", "عملاء مهتمين وراحوا", "ما نرجع لهم", "المتابعه ضعيفه", "يسال ويختفي",
          "leads disappear", "lost leads", "forget to follow up", "no follow up", "leads go cold", "they ask then disappear", "ghosting"],
      ack: { ar: "عميل سأل واختفى ما هو رافض — هو بس ما أحد رجع له في الوقت الصحيح.", en: "A lead who asked then vanished didn't say no — nobody got back to them at the right time." } },
    { id: "no-shows", sol: "follow",
      p: ["مواعيد تضيع", "ما يجون للموعد", "تاكيد المواعيد", "ينسون الموعد", "مواعيد ملغيه", "غياب عن المواعيد",
          "no show", "no shows", "missed appointments", "confirm appointments", "forget appointments", "appointment reminders"],
      ack: { ar: "المواعيد الضائعة تكلفك مرتين: وقت فاضي وعميل راح.", en: "No-shows cost you twice: an empty slot and a lost customer." } },
    { id: "manual-work", sol: "brief",
      p: ["شغل يدوي", "تقارير يدويه", "التقارير تاخذ وقت", "ادخال بيانات", "نسخ ولصق", "جداول اكسل", "تعبنا من التقارير", "شغل متكرر",
          "manual work", "manual reports", "data entry", "copy paste", "spreadsheets", "repetitive tasks", "paperwork", "reporting takes forever"],
      ack: { ar: "الشغل اليدوي المتكرر أغلى شيء تدفعه — لأنه يستهلك أفضل ناسك في أرخص مهام.", en: "Repetitive manual work is your most expensive cost — it burns your best people on the cheapest tasks." } },
    { id: "more-sales", sol: "sell",
      p: ["ابغي مبيعات", "ازيد المبيعات", "زياده المبيعات", "يسالون وما يشترون", "احول الزوار", "عملاء محتملين", "تاهيل العملاء", "اقفل صفقات",
          "more sales", "increase sales", "boost sales", "convert visitors", "they ask but dont buy", "qualify leads", "close deals", "grow revenue"],
      ack: { ar: "تمام — الهدف واضح: استفسارات أكثر تتحول لمبيعات فعلية.", en: "Clear goal — turn more inquiries into actual sales." } },
    { id: "bookings", sol: "sell",
      p: ["حجوزات", "حجز مواعيد", "احجز عملائي", "نظام حجز",
          "bookings", "booking system", "schedule customers", "book appointments"],
      ack: { ar: "الحجز لازم يكون أسهل خطوة — أي احتكاك فيه يعني عميل أقل.", en: "Booking should be the easiest step — any friction there means fewer customers." } },
    { id: "privacy-worry", sol: "guard",
      p: ["اخاف علي البيانات", "خصوصيه", "امان البيانات", "مين يشوف البيانات", "الذكاء الاصطناعي يخوف", "ما اثق",
          "privacy", "data safety", "is it secure", "who sees my data", "trust ai", "data protection", "afraid of ai"],
      ack: { ar: "سؤال في محله — وهذا بالضبط ليش نقول: الذكاء الاصطناعي وحده ما يكفي.", en: "The right question to ask — and exactly why we say AI alone is not enough." } },
    { id: "team-overload", sol: "brief",
      p: ["الموظفين مشغولين", "الفريق ما يلحق", "ضغط شغل", "شغلنا كثير", "ما نلحق", "الضغط علينا",
          "team overloaded", "staff busy", "overwhelmed team", "too much work", "cant keep up", "burned out"],
      ack: { ar: "لما الفريق ما يلحق، المشكلة غالبًا مو في عددهم — في كمية الشغل المتكرر عليهم.", en: "When the team can't keep up, the problem is usually not headcount — it's the volume of repetitive work on them." },
      extra: { ar: "وغالبًا يرافقها ضغط في الرد على العملاء — إذا هذا وضعك، «صبّارة تهتم» تكمل الصورة.", en: "It usually comes with customer-reply pressure too — if that's you, «صبّارة تهتم» completes the picture." } },
  ];

  /* ================= info intents ================= */
  const INTENTS = [
    { id: "greeting",
      p: ["مرحبا", "هلا", "اهلا", "السلام عليكم", "سلام", "صباح الخير", "مساء الخير", "هاي", "حياك",
          "hello", "hi", "hey", "salam", "good morning", "good evening"],
      run: (lang) => lang === "ar"
        ? { html: "أهلًا بك في صبّارة 🌵<br>أنا هنا أساعدك توصل للحل الصح — احكِ لي وش أكثر شيء ياخذ وقتك، أو اسألني عن صبّارة.",
            chips: [{ t: "عندي مشكلة أبغى لها حل", send: true }, { t: "وش حلول صبّارة؟", send: true }, { t: "🌵 افحص نشاطك مجانًا", goto: "#scan" }] }
        : { html: "Welcome to Sabbarah 🌵<br>I'm here to guide you to the right solution — tell me what eats your time, or ask me anything about Sabbarah.",
            chips: [{ t: "I have a problem to solve", send: true }, { t: "What are Sabbarah's solutions?", send: true }, { t: "🌵 Try the free check", goto: "#scan" }] } },
    { id: "solutions",
      p: ["حلول", "خدمات", "منتجات", "وش تسوون", "وش تقدمون", "وش عندكم", "ايش تقدمون",
          "solutions", "services", "products", "what do you do", "what do you offer", "offerings", "capabilities"],
      run: (lang) => lang === "ar"
        ? { html: "حلول صبّارة الجاهزة للأعمال 🌵:<br><br>• <b>صبّارة تبيع</b> — توصل عميلك للشراء أو الحجز<br>• <b>صبّارة تتابع</b> — ترجع الفرص اللي كانت بتضيع<br>• <b>صبّارة تهتم</b> — خدمة عملاء ما تنام<br>• <b>صبّارة تختصر</b> — تنهي الشغل اليدوي والتقارير<br>• <b>صبّارة تحمي</b> — خصوصية وصلاحيات وحوكمة<br><br>وهذي بعض حلولنا الجاهزة — ونبني حلولًا مخصصة حسب عمليات نشاطك. أي واحد يلمس وجعك أكثر؟",
            chips: [{ t: "صبّارة تبيع", send: true }, { t: "صبّارة تتابع", send: true }, { t: "صبّارة تهتم", send: true }, { t: "صبّارة تختصر", send: true }, { t: "صبّارة تحمي", send: true }] }
        : { html: "Sabbarah's ready business solutions 🌵:<br><br>• <b>صبّارة تبيع</b> — gets your customer to purchase or booking<br>• <b>صبّارة تتابع</b> — recovers opportunities before they vanish<br>• <b>صبّارة تهتم</b> — customer care that never sleeps<br>• <b>صبّارة تختصر</b> — ends manual work and reports<br>• <b>صبّارة تحمي</b> — privacy, permissions, governance<br><br>These are the ready ones — we also build custom solutions around your workflows. Which one touches your pain most?",
            chips: [{ t: "Selling", send: true }, { t: "Follow-up", send: true }, { t: "Customer care", send: true }, { t: "Operations", send: true }] } },
    { id: "vague-automation",
      p: ["اتمته", "أتمته", "ابغي اتمته", "ذكاء اصطناعي", "ai", "بوت", "روبوت", "اتمت", "ابي نظام",
          "automation", "automate", "i need automation", "need ai", "chatbot", "bot", "want a system", "digital transformation"],
      run: (lang, ctx) => {
        ctx.pendingClarify = "area";
        return lang === "ar"
          ? { html: "حلو إنك تفكر بالأتمتة 🌵 وعشان أوجهك للحل الصح مو أي حل — خلني أفهمك أكثر:<br><br><b>وش أكثر شيء ياخذ وقتكم اليوم؟</b>",
              chips: [{ t: "الرد على العملاء والرسائل", send: true }, { t: "المتابعة والفرص الضائعة", send: true }, { t: "التقارير والشغل اليدوي", send: true }, { t: "زيادة المبيعات", send: true }] }
          : { html: "Great that you're thinking automation 🌵 To point you to the right solution — not just any solution:<br><br><b>What eats most of your team's time today?</b>",
              chips: [{ t: "Replying to customers", send: true }, { t: "Follow-ups and lost leads", send: true }, { t: "Reports and manual work", send: true }, { t: "Increasing sales", send: true }] };
      } },
    { id: "help-problem",
      p: ["عندي مشكله", "ابغي حل", "احتاج مساعده", "ساعدني", "مشكلتي",
          "i have a problem", "need help", "help me", "i need a solution"],
      run: (lang, ctx) => {
        ctx.pendingClarify = "area";
        return lang === "ar"
          ? { html: "أنا معك 🌵 احكِ لي المشكلة بكلماتك — أو اختر الأقرب:",
              chips: [{ t: "رسائل ومكالمات ما نلحق عليها", send: true }, { t: "عملاء يسألون ويختفون", send: true }, { t: "سلات متروكة", send: true }, { t: "تقارير وشغل يدوي", send: true }] }
          : { html: "I'm with you 🌵 Describe the problem in your own words — or pick the closest:",
              chips: [{ t: "Messages and calls we can't keep up with", send: true }, { t: "Leads ask then disappear", send: true }, { t: "Abandoned carts", send: true }, { t: "Reports and manual work", send: true }] };
      } },
    { id: "scan",
      p: ["فحص", "افحص", "الفحص", "اختبار النشاط", "تحليل نشاطي",
          "scan", "check", "assessment", "diagnose", "free check"],
      run: (lang) => lang === "ar"
        ? { html: "فحص صبّارة 🌵 — أسئلة قصيرة، أقل من دقيقة، وتطلع بـ:<br>• جاهزية نشاطك للأتمتة<br>• وين تضيع الفرص ووين يضيع الوقت<br>• تشخيص مخصص حسب نوع نشاطك<br><br>الفحص يشخّص، لكنه ما يعطي الوصفة — التفاصيل تجي في <b>خريطة صبّارة</b>.",
            chips: [{ t: "🌵 ابدأ الفحص الآن", goto: "#scan" }, { t: "وش خريطة صبّارة؟", send: true }] }
        : { html: "فحص صبّارة 🌵 — a few short questions, under a minute, and you get:<br>• Your automation readiness<br>• Where time and opportunities leak<br>• A diagnosis tailored to your business type<br><br>It diagnoses — it never hands out the recipe. Details come in <b>خريطة صبّارة</b>.",
            chips: [{ t: "🌵 Start the check", goto: "#scan" }, { t: "What is خريطة صبّارة?", send: true }] } },
    { id: "map",
      p: ["خريطه", "خارطه", "خريطه صباره", "التصور", "الخطه",
          "map", "roadmap", "the plan", "next step after check"],
      run: (lang) => lang === "ar"
        ? { html: "خريطة صبّارة 🌵 — من التشخيص إلى الحل:<br>الفحص يوضح لك <b>أين</b> توجد الفرص. الخريطة تحول النتيجة إلى تصور مخصص: الأولويات، نطاق الحل، التكاملات المطلوبة، الضوابط، ومؤشرات النجاح.<br><br>هي المرحلة التالية بعد فحص صبّارة.",
            chips: [{ t: "🌵 سوّ الفحص أول", goto: "#scan" }, { t: "اطلب خريطة صبّارة", book: true }] }
        : { html: "خريطة صبّارة 🌵 — from diagnosis to solution:<br>The check shows you <b>where</b> the opportunities are. The map turns that into a tailored plan: priorities, scope, integrations, controls, and success metrics.<br><br>It's the next step after the check.",
            chips: [{ t: "🌵 Do the check first", goto: "#scan" }, { t: "Request خريطة صبّارة", book: true }] } },
    { id: "portfolio",
      p: ["بورتفوليو", "البورتفوليو", "افراد", "للافراد", "سيره ذاتيه", "ملف مهني", "موقع شخصي",
          "portfolio", "individuals", "cv", "resume", "personal site", "personal brand"],
      run: (lang) => lang === "ar"
        ? { html: "صبّارة للأفراد 🌵 — <b>البورتفوليو الذكي</b>:<br>حضور مهني أذكى من ملف PDF: موقعك المهني بخبراتك ومشاريعك، ومعه مساعدة ذكية تجيب زوارك عنك.<br><br>بورتفوليو يتكلم عنك، حتى وأنت مو موجود.",
            chips: [{ t: "شوف القسم", goto: "#individuals" }, { t: "اكتشف البورتفوليو الذكي", book: true }] }
        : { html: "Sabbarah for Individuals 🌵 — the <b>Smart Portfolio</b>:<br>A professional presence smarter than a PDF: your site with your experience and projects, plus an AI assistant that answers visitors about you.<br><br>A portfolio that speaks for you, even when you're away.",
            chips: [{ t: "See the section", goto: "#individuals" }, { t: "Discover the Smart Portfolio", book: true }] } },
    { id: "pricing",
      p: ["سعر", "اسعار", "الاسعار", "تكلفه", "بكم", "كم يكلف", "باقات", "ميزانيه", "فلوس", "كم سعره",
          "price", "pricing", "cost", "how much", "packages", "budget", "fees", "expensive"],
      run: (lang, ctx) => {
        const last = ctx.lastTopic && SOL[ctx.lastTopic] ? SOL[ctx.lastTopic][lang].name : null;
        return lang === "ar"
          ? { html: (last ? "بالنسبة لـ<b>" + last + "</b> — " : "") + "كل حل يُصمم على نشاطك وعملياتك 🌵 فالتكلفة تعتمد على النطاق: قنوات، تكاملات، وعمق الأتمتة.<br><br>أفضل بداية: <b>فحص صبّارة</b> المجاني، وبعده استشارة مجانية نحدد فيها النطاق والتكلفة بوضوح — بدون التزام.",
              chips: [{ t: "🌵 افحص نشاطك مجانًا", goto: "#scan" }, { t: "احجز استشارة مجانية", book: true }] }
          : { html: (last ? "For <b>" + last + "</b> — " : "") + "every solution is tailored to your business 🌵 so cost depends on scope: channels, integrations, automation depth.<br><br>Best start: the free <b>فحص صبّارة</b>, then a free consultation to define scope and cost clearly — no commitment.",
              chips: [{ t: "🌵 Try the free check", goto: "#scan" }, { t: "Book a free consultation", book: true }] };
      } },
    { id: "about",
      p: ["من انتم", "عن صباره", "وش صباره", "مين صباره", "من انت", "مين انتي", "تعريف", "ليش صباره", "وش يميزكم", "ليش انتم",
          "who are you", "about sabbarah", "what is sabbarah", "why sabbarah", "what makes you different", "your value"],
      run: (lang) => lang === "ar"
        ? { html: "صبّارة AI 🌵 شركة سعودية تبني وكلاء ذكاء اصطناعي وأنظمة أتمتة — للأعمال وللأفراد.<br><br>اللي يميزنا؟ <b>نبنيها صح</b>: الأمان والخصوصية والحوكمة جزء من التصميم من البداية، مو إضافة بعد التشغيل. ونشتغل بالعربي، لسوقنا، وبحلول تُقاس نتيجتها.",
            chips: [{ t: "وش حلولكم؟", send: true }, { t: "كيف تشتغلون؟", send: true }, { t: "احجز استشارة", book: true }] }
        : { html: "Sabbarah AI 🌵 is a Saudi company building AI agents and automation — for businesses and individuals.<br><br>What makes us different? <b>We build it right</b>: security, privacy, and governance are part of the design from day one — not an afterthought. Arabic-first, built for this market, measured by results.",
            chips: [{ t: "Your solutions?", send: true }, { t: "How do you work?", send: true }, { t: "Book a consultation", book: true }] } },
    { id: "guard-info",
      p: ["حوكمه", "الحوكمه", "تحمي", "نبنيها صح", "اشراف بشري", "صلاحيات",
          "governance", "oversight", "guardrails", "permissions", "compliance approach"],
      run: (lang) => solutionReply(lang, "guard",
        lang === "ar" ? "هذا قلب صبّارة." : "This is Sabbarah's core.") },
    { id: "process",
      p: ["كيف تعملون", "كيف تشتغلون", "خطوات", "مراحل", "طريقه العمل", "كيف نبدا", "وش الخطوات",
          "how do you work", "process", "steps", "how to start", "methodology", "how it works with you"],
      run: (lang) => lang === "ar"
        ? { html: "كيف نعمل 🌵:<br><b>1. نفهم</b> — احتياجك وعملياتك وأين يضيع الوقت<br><b>2. نصمم</b> — الحل والمسارات والضوابط<br><b>3. نبني ونختبر</b> — قبل التشغيل<br><b>4. نشغّل وندعم</b> — بمراقبة وتحسين مستمر<br><br>وأسهل نقطة بداية: فحص صبّارة.",
            chips: [{ t: "شوف القسم", goto: "#process" }, { t: "🌵 ابدأ بالفحص", goto: "#scan" }] }
        : { html: "How we work 🌵:<br><b>1. Understand</b> — your needs and where time leaks<br><b>2. Design</b> — the solution, flows, and controls<br><b>3. Build & test</b> — before launch<br><b>4. Run & support</b> — with monitoring and improvement<br><br>Easiest starting point: the free check.",
            chips: [{ t: "See the section", goto: "#process" }, { t: "🌵 Start with the check", goto: "#scan" }] } },
    { id: "contact",
      p: ["تواصل", "اتواصل", "ايميل", "بريد", "رقم", "اكلمكم", "التواصل",
          "contact", "email", "reach you", "get in touch", "talk to you"],
      run: (lang) => lang === "ar"
        ? { html: "يسعدنا نسمع منك 🌵<br>📧 " + EMAIL + "<br>📍 المملكة العربية السعودية<br><br>أو احجز استشارة مجانية مباشرة:",
            chips: [{ t: "احجز استشارة", book: true }, { t: "كلمني إنسان", human: true }] }
        : { html: "We'd love to hear from you 🌵<br>📧 " + EMAIL + "<br>📍 Saudi Arabia<br><br>Or book a free consultation directly:",
            chips: [{ t: "Book a consultation", book: true }, { t: "Talk to a human", human: true }] } },
    { id: "navigate",
      p: ["وين القي", "وين الاقي", "وين اروح", "دليني", "وريني الموقع", "اقسام الموقع", "الصفحه",
          "where do i find", "show me around", "navigate", "sections", "where is"],
      run: (lang) => lang === "ar"
        ? { html: "أدلّك 🌵 — اختر وأنا أوديك للقسم:",
            chips: [{ t: "حلول الأعمال", goto: "#business" }, { t: "فحص صبّارة", goto: "#scan" }, { t: "للأفراد", goto: "#individuals" }, { t: "كيف نعمل", goto: "#process" }, { t: "تواصل معنا", goto: "#contact" }] }
        : { html: "Let me guide you 🌵 — pick a section and I'll take you there:",
            chips: [{ t: "Business solutions", goto: "#business" }, { t: "The free check", goto: "#scan" }, { t: "For individuals", goto: "#individuals" }, { t: "How we work", goto: "#process" }, { t: "Contact", goto: "#contact" }] } },
    { id: "human",
      p: ["انسان", "بشر", "موظف", "كلمني احد", "ابغي اكلم احد", "شخص حقيقي",
          "human", "real person", "agent", "talk to someone", "speak to a person"],
      run: (lang) => lang === "ar"
        ? { html: "أكيد 🌵 فريقنا (البشري 😄) جاهز — أجهز لك رسالة توصلهم مباشرة، أو احجز مكالمة:",
            chips: [{ t: "أرسل رسالة للفريق", human: true }, { t: "احجز مكالمة", book: true }] }
        : { html: "Of course 🌵 Our (human 😄) team is ready — I'll prepare a message for them, or book a call:",
            chips: [{ t: "Message the team", human: true }, { t: "Book a call", book: true }] } },
    { id: "thanks",
      p: ["شكرا", "مشكور", "مشكوره", "يعطيك العافيه", "ممتاز", "رائع", "جزاك",
          "thanks", "thank you", "great", "awesome", "perfect"],
      run: (lang) => lang === "ar"
        ? { html: "العفو! 🌵 أنا هنا متى ما احتجتني.", chips: [{ t: "🌵 افحص نشاطك مجانًا", goto: "#scan" }] }
        : { html: "You're welcome! 🌵 I'm here whenever you need me.", chips: [{ t: "🌵 Try the free check", goto: "#scan" }] } },
    { id: "bye",
      p: ["مع السلامه", "وداعا", "باي", "اشوفك",
          "bye", "goodbye", "see you", "later"],
      run: (lang) => lang === "ar"
        ? { html: "إلى اللقاء! 🌵 صبّارة دايم هنا." }
        : { html: "Goodbye! 🌵 Sabbarah is always here." } },
  ];

  /* per-solution direct asks: «صبّارة تبيع» or "selling" etc. */
  const SOL_ASKS = [
    { sol: "sell", p: ["صباره تبيع", "تبيع", "البيع", "المبيعات", "selling", "sales solution", "sell"] },
    { sol: "follow", p: ["صباره تتابع", "تتابع", "المتابعه", "follow up solution", "follow-up", "follow"] },
    { sol: "care", p: ["صباره تهتم", "تهتم", "خدمه العملاء", "customer care", "customer service", "support"] },
    { sol: "brief", p: ["صباره تختصر", "تختصر", "التشغيل", "التقارير", "operations", "reports solution", "simplify"] },
    { sol: "guard", p: ["صباره تحمي", "تحمي", "الامان", "security", "privacy solution", "protect"] },
  ];

  /* clearly off-topic — confident, warm refusal */
  const BLOCKED = ["سياسه", "انتخابات", "دين", "فتوي", "طقس", "رياضه", "مباراه", "اسهم", "عملات", "وصفه طبخ", "اكتب كود", "برمج لي", "واجب",
    "politics", "election", "religion", "weather", "football", "stocks", "crypto", "bitcoin", "recipe", "write code", "homework", "poem", "joke"];

  /* clarify-area answers (after the follow-up question) */
  const CLARIFY_MAP = [
    { sol: "care", p: ["الرد علي العملاء", "الرد علي العملاء والرسائل", "رسائل ومكالمات", "replying to customers", "messages and calls"] },
    { sol: "follow", p: ["المتابعه والفرص", "الفرص الضائعه", "يسالون ويختفون", "سلات متروكه", "follow-ups and lost leads", "leads ask then disappear", "abandoned carts"] },
    { sol: "brief", p: ["التقارير والشغل اليدوي", "تقارير وشغل يدوي", "reports and manual work"] },
    { sol: "sell", p: ["زياده المبيعات", "المبيعات", "increasing sales"] },
  ];

  /* ================= brain ================= */
  const ctx = { lastTopic: null, pendingClarify: null };

  const think = (raw) => {
    const lang = replyLang(raw);
    const text = normalize(raw);
    const tokens = tokenize(raw);

    /* follow-up on last topic: "تفاصيل أكثر / كيف تشتغل / how" */
    const followWords = ["تفاصيل", "اشرح", "كيف تشتغل", "كيف بالضبط", "اكثر", "وضح", "how does it work", "details", "tell me more", "explain", "how exactly"];
    if (ctx.lastTopic && SOL[ctx.lastTopic] && scorePatterns(text, tokens, followWords) >= 3 && tokens.length <= 6) {
      const s = SOL[ctx.lastTopic][lang];
      return { html: s.deep.replace(/\n/g, "<br>"),
        chips: lang === "ar"
          ? [{ t: "🌵 افحص نشاطك مجانًا", goto: "#scan" }, { t: "كم التكلفة؟", send: true }, { t: "احجز استشارة", book: true }]
          : [{ t: "🌵 Try the free check", goto: "#scan" }, { t: "What does it cost?", send: true }, { t: "Book a consultation", book: true }] };
    }

    /* pending clarification answer */
    if (ctx.pendingClarify === "area") {
      let best = null, bestScore = 0;
      for (const c of CLARIFY_MAP) {
        const s = scorePatterns(text, tokens, c.p);
        if (s > bestScore) { bestScore = s; best = c; }
      }
      if (best && bestScore >= 3) {
        ctx.pendingClarify = null;
        ctx.lastTopic = best.sol;
        return solutionReply(lang, best.sol, lang === "ar" ? "تمام، فهمتك." : "Got it.");
      }
      ctx.pendingClarify = null; // fall through to full understanding
    }

    /* score everything: pains, solution asks, info intents */
    let winner = null, winScore = 0, kind = null;
    for (const pain of PAINS) {
      const s = scorePatterns(text, tokens, pain.p);
      if (s > winScore) { winScore = s; winner = pain; kind = "pain"; }
    }
    for (const ask of SOL_ASKS) {
      const s = scorePatterns(text, tokens, ask.p);
      if (s > winScore) { winScore = s; winner = ask; kind = "sol"; }
    }
    for (const intent of INTENTS) {
      const s = scorePatterns(text, tokens, intent.p);
      if (s > winScore) { winScore = s; winner = intent; kind = "intent"; }
    }
    const blockedScore = scorePatterns(text, tokens, BLOCKED);

    if (blockedScore > 0 && blockedScore >= winScore) {
      return lang === "ar"
        ? { html: "أنا المساعدة صبّارة 🌵 وتخصصي كل شيء عن صبّارة: حلولها، الفحص، الأسعار، والبورتفوليو الذكي.<br>فيه شيء من هذي أقدر أخدمك فيه؟",
            chips: [{ t: "وش حلول صبّارة؟", send: true }, { t: "🌵 افحص نشاطك", goto: "#scan" }] }
        : { html: "I'm the Sabbarah assistant 🌵 and my specialty is everything Sabbarah: solutions, the check, pricing, and the Smart Portfolio.<br>Anything there I can help with?",
            chips: [{ t: "Sabbarah's solutions?", send: true }, { t: "🌵 Try the check", goto: "#scan" }] };
    }

    if (winner && winScore >= 3) {
      if (kind === "pain") {
        ctx.lastTopic = winner.sol;
        return solutionReply(lang, winner.sol, winner.ack[lang], winner.extra ? winner.extra[lang] : "");
      }
      if (kind === "sol") {
        ctx.lastTopic = winner.sol;
        const s = SOL[winner.sol][lang];
        return { html: s.deep.replace(/\n/g, "<br>"),
          chips: lang === "ar"
            ? [{ t: "🌵 افحص نشاطك مجانًا", goto: "#scan" }, { t: "كم التكلفة؟", send: true }, { t: "احجز استشارة", book: true }]
            : [{ t: "🌵 Try the free check", goto: "#scan" }, { t: "What does it cost?", send: true }, { t: "Book a consultation", book: true }] };
      }
      return winner.run(lang, ctx);
    }

    /* consultant fallback: probe, don't shrug */
    ctx.pendingClarify = "area";
    return lang === "ar"
      ? { html: pick(["خلني أفهمك صح 🌵", "أبي أساعدك بدقة 🌵"]) + " احكِ لي أكثر عن نشاطك — أو اختر الأقرب لوضعك:",
          chips: [{ t: "رسائل ومكالمات ما نلحق عليها", send: true }, { t: "عملاء يسألون ويختفون", send: true }, { t: "تقارير وشغل يدوي", send: true }, { t: "أسئلة عن صبّارة نفسها", send: true }] }
      : { html: pick(["Let me understand you properly 🌵", "I want to help precisely 🌵"]) + " Tell me more about your business — or pick the closest:",
          chips: [{ t: "Messages and calls we can't keep up with", send: true }, { t: "Leads ask then disappear", send: true }, { t: "Reports and manual work", send: true }, { t: "Questions about Sabbarah itself", send: true }] };
  };

  /* ================= UI (same visual shell as before) ================= */
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

  const root = document.createElement("div");
  root.className = "sb-assistant";
  root.innerHTML = `
    <div class="sb-bubble" role="status"><strong>مرحبًا! أنا المساعدة صبّارة 🌵</strong>احكِ لي مشكلتك — وأدلّك على الحل الصح.</div>
    <button class="sb-cactus" type="button" aria-haspopup="dialog" aria-label="افتح المساعدة صبّارة">${cactusSVG("L")}</button>`;

  const panel = document.createElement("div");
  panel.className = "sb-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.setAttribute("aria-label", "المساعدة صبّارة");
  panel.innerHTML = `
    <div class="sb-panel__head">
      <div class="sb-panel__avatar">${cactusSVG("P")}</div>
      <div class="sb-panel__title"><strong>المساعدة صبّارة</strong><span>مستشارتك الذكية · متصلة الآن</span></div>
      <button class="sb-panel__close" aria-label="إغلاق">✕</button>
    </div>
    <div class="sb-panel__body" aria-live="polite"></div>
    <form class="sb-input">
      <input type="text" autocomplete="off" maxlength="400" placeholder="اكتب مشكلتك أو سؤالك…" aria-label="سؤالك">
      <button class="sb-send" type="submit" aria-label="إرسال"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"/><path d="M22 2 15 22 11 13 2 9 22 2z"/></svg></button>
    </form>`;

  document.body.appendChild(root);
  document.body.appendChild(panel);

  const cactusBtn = root.querySelector(".sb-cactus");
  const bubble = root.querySelector(".sb-bubble");
  const body = panel.querySelector(".sb-panel__body");
  const input = panel.querySelector("input");

  const sendAsUser = (text) => {
    addMsg(text, "user", replyLang(text));
    respond(text);
  };

  const doBook = () => window.open(BOOKING_URL, "_blank", "noopener,noreferrer");
  const doHuman = () => {
    const mail = "mailto:" + EMAIL + "?subject=" + encodeURIComponent("رسالة من زائر موقع صبّارة 🌵")
      + "&body=" + encodeURIComponent("مرحبًا فريق صبّارة،\n\n(اكتب رسالتك هنا)\n");
    window.open(mail, "_blank");
  };
  const doGoto = (sel) => {
    document.querySelector(sel)?.scrollIntoView({ behavior: "smooth", block: "start" });
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

  const addChips = (chips, lang) => {
    if (!chips || !chips.length) return;
    const row = document.createElement("div");
    row.className = "sb-acts";
    row.dir = lang === "en" ? "ltr" : "rtl";
    chips.forEach((c) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = c.t;
      b.addEventListener("click", () => {
        row.remove();
        if (c.goto) { doGoto(c.goto); addMsg(lang === "ar" ? "ودّيتك للقسم 🌵 وأنا هنا لو احتجتني." : "Took you there 🌵 I'm here if you need me.", "bot", lang, false); }
        else if (c.book) { doBook(); addMsg(lang === "ar" ? "فتحت لك صفحة الحجز 🌵 اختر الوقت المناسب." : "Opened the booking page 🌵 pick your time.", "bot", lang, false); }
        else if (c.human) { doHuman(); addMsg(lang === "ar" ? "جهزت لك رسالة للفريق ✓" : "Prepared a message to the team ✓", "bot", lang, false); }
        else sendAsUser(c.t);
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
    }, 600 + Math.min(1000, reply.html.length * 2.5));
  };

  /* open / close */
  let lastFocus = null;
  const open = () => {
    lastFocus = document.activeElement;
    root.classList.add("sb-assistant--open");
    panel.classList.add("sb-panel--open");
    bubble.classList.remove("sb-bubble--show");
    if (body.childElementCount === 0) {
      const typing = document.createElement("div");
      typing.className = "sb-msg sb-msg--bot sb-typing";
      typing.innerHTML = "<i></i><i></i><i></i>";
      body.appendChild(typing);
      setTimeout(() => {
        typing.remove();
        addMsg("أهلًا بك في صبّارة 🌵<br>أنا مستشارتك هنا — احكِ لي وش أكثر شيء ياخذ وقتك، وأدلّك على الحل الصح.", "bot", "ar", true);
        addChips([
          { t: "عندي مشكلة أبغى لها حل", send: true },
          { t: "وش حلول صبّارة؟", send: true },
          { t: "🌵 افحص نشاطك مجانًا", goto: "#scan" },
        ], "ar");
      }, 700);
    }
    setTimeout(() => input.focus(), 350);
  };
  const close = () => {
    root.classList.remove("sb-assistant--open");
    panel.classList.remove("sb-panel--open");
    if (lastFocus) lastFocus.focus();
  };
  cactusBtn.addEventListener("click", open);
  panel.querySelector(".sb-panel__close").addEventListener("click", close);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && panel.classList.contains("sb-panel--open")) close(); });

  panel.querySelector(".sb-input").addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    sendAsUser(text);
  });

  /* entrance */
  setTimeout(() => {
    cactusBtn.classList.add("sb-cactus--in", "sb-cactus--waving");
    setTimeout(() => bubble.classList.add("sb-bubble--show"), 900);
    setTimeout(() => bubble.classList.remove("sb-bubble--show"), 9000);
  }, 1000);
})();
