/* ============================================================
   صبّارة AI — التنقل، المظهر، ظهور العناصر، والعرض الحي
   SABBARAH AI — navigation, theme, scroll reveal, hero demo (sectors),
   headline word masks, language pill.
   ============================================================ */

/* ============ nav ============ */
(function () {
  var t = document.querySelector('.nav-toggle'), m = document.getElementById('navMenu');
  if (!t || !m) return;
  t.addEventListener('click', function () {
    var open = m.classList.toggle('is-open');
    t.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  m.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      m.classList.remove('is-open');
      t.setAttribute('aria-expanded', 'false');
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && m.classList.contains('is-open')) { m.classList.remove('is-open'); t.setAttribute('aria-expanded', 'false'); t.focus(); }
  });
})();

/* ============ تبديل المظهر (فاتح/داكن) — تبديل وقت النهار للغرفة نفسها ============ */
(function () {
  var KEY = 'sabbarah-theme', root = document.documentElement;
  var btns = document.querySelectorAll('.theme-toggle');
  var meta = document.querySelector('meta[name="theme-color"]');
  if (!btns.length) return;
  function sync() {
    var light = root.getAttribute('data-theme') === 'light';
    for (var i = 0; i < btns.length; i++) btns[i].setAttribute('aria-pressed', light ? 'true' : 'false');
    if (meta) meta.setAttribute('content', light ? '#F5F1E8' : '#0B0F14');
  }
  var timer = null;
  function apply(theme) {
    root.classList.add('is-theming');
    if (theme === 'light') root.setAttribute('data-theme', 'light');
    else root.removeAttribute('data-theme');
    try { localStorage.setItem(KEY, theme); } catch (e) { /* تصفح خاص */ }
    sync();
    clearTimeout(timer);
    timer = setTimeout(function () { root.classList.remove('is-theming'); }, 320);
    document.dispatchEvent(new CustomEvent('sb:themechange', { detail: { theme: theme } }));
  }
  for (var i = 0; i < btns.length; i++) {
    btns[i].addEventListener('click', function () {
      apply(root.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
    });
  }
  sync();
})();

/* ============ حالة الهيدر عند التمرير ============ */
(function () {
  var h = document.querySelector('.site-header');
  if (!h) return;
  var onScroll = function () { h.classList.toggle('is-scrolled', window.scrollY > 8) };
  onScroll(); addEventListener('scroll', onScroll, { passive: true });
})();

/* ============ مبدّل اللغة: الحبة تنزلق باتجاه قراءة اللغة الهدف ============ */
(function () {
  var sw = document.querySelector('.lang-switch');
  if (!sw || !document.documentElement.classList.contains('js')) return;
  function place() {
    var on = sw.querySelector('button[aria-pressed="true"]');
    if (!on) return;
    sw.style.setProperty('--pill-x', on.offsetLeft + 'px');
    sw.style.setProperty('--pill-w', on.offsetWidth + 'px');
    sw.style.setProperty('--pill-on', '1');
    sw.classList.add('has-pill');
  }
  place();
  document.addEventListener('sb:langchange', function () { requestAnimationFrame(place); });
  addEventListener('resize', place);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
})();

/* ============ reveal on scroll ============ */
(function () {
  var els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(els, function (e) { e.classList.add('is-visible') }); return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target) }
    });
  }, { threshold: .12, rootMargin: '0px 0px -8% 0px' });
  els.forEach(function (e) { io.observe(e) });
})();

/* ============ العنوان: يظهر كلمةً كلمة (لا حرفًا حرفًا) ============ */
(function () {
  var h1 = document.querySelector('.hero h1');
  if (!h1 || !document.documentElement.classList.contains('js')) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  function split() {
    var i = 0;
    Array.prototype.forEach.call(h1.querySelectorAll('b, span'), function (line) {
      if (line.querySelector('.w')) return;
      var words = line.textContent.split(/\s+/).filter(Boolean);
      line.textContent = '';
      words.forEach(function (w, k) {
        var s = document.createElement('span');
        s.className = 'w';
        s.textContent = w;
        s.style.setProperty('--i', i++);
        line.appendChild(s);
        if (k < words.length - 1) line.appendChild(document.createTextNode(' '));
      });
    });
    h1.classList.add('is-split');
  }
  split();
  document.addEventListener('sb:langchange', function () { h1.classList.remove('is-split'); split(); });
})();

/* ============ hero live demo — ثنائي اللغة، ثلاثة قطاعات من الأمثلة المنشورة ============ */
(function () {
  var body = document.getElementById('demoBody');
  if (!body) return;
  var stage = document.querySelector('.hero__stage');
  var KEY = 'sabbarah-sector';
  var SECTORS = ['clinic', 'store', 'estate'];
  var sector = 'store';
  try { var s = localStorage.getItem(KEY); if (SECTORS.indexOf(s) !== -1) sector = s; } catch (e) { /* private */ }
  if (window.SB) window.SB.sector = sector;

  var SCRIPT = [
    { who: 'user', n: 1 },
    { who: 'bot', n: 2 },
    { who: 'user', n: 3 },
    { who: 'bot', n: 4 }
  ];
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var timers = [], i = 0, paused = false, waiting = null;

  function line(n) { return window.SB ? window.SB.t('demo.' + sector + '.' + n) : ''; }

  function bubble(cls, text) {
    var d = document.createElement('div');
    d.className = 'bubble bubble--' + cls;
    d.textContent = text;
    body.appendChild(d);
    return d;
  }
  function typing() {
    var d = document.createElement('div');
    d.className = 'bubble bubble--bot bubble--typing';
    d.innerHTML = '<i></i><i></i><i></i>';
    body.appendChild(d);
    return d;
  }
  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function step() {
    if (paused) { waiting = step; return; }
    if (i >= SCRIPT.length) {
      later(function () { body.innerHTML = ''; i = 0; step() }, 6000);
      return;
    }
    var s = SCRIPT[i++];
    if (s.who === 'user') {
      bubble('user', line(s.n));
      later(step, 1100);
    } else {
      var t = typing();
      later(function () {
        t.remove(); bubble('bot', line(s.n));
        if (stage) { stage.classList.add('has-reply'); later(function () { stage.classList.remove('has-reply'); }, 1600); }
        if (i >= SCRIPT.length) document.dispatchEvent(new CustomEvent('sb:demoend', { detail: { sector: sector } }));
        later(step, 2100);
      }, 1200);
    }
  }
  function start() {
    clearTimers();
    body.innerHTML = '';
    i = 0; waiting = null;
    if (reduce) { SCRIPT.forEach(function (s) { bubble(s.who, line(s.n)) }); return; }
    step();
  }

  /* يتوقف خارج الشاشة ويستأنف عند العودة — بلا مؤقتات تعمل في الخلفية */
  function setPaused(p) {
    if (p === paused) return;
    paused = p;
    if (!paused && waiting) { var w = waiting; waiting = null; w(); }
  }
  if ('IntersectionObserver' in window && stage) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { setPaused(!en.isIntersecting || document.hidden); });
    }, { threshold: 0.05 }).observe(stage);
  }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) setPaused(true);
    else if (stage) { var r = stage.getBoundingClientRect(); setPaused(!(r.bottom > 0 && r.top < innerHeight)); }
  });

  /* اختيار القطاع */
  var chips = document.querySelectorAll('.sector');
  function setSector(s, persist) {
    if (SECTORS.indexOf(s) === -1) return;
    sector = s;
    if (window.SB) window.SB.sector = s;
    Array.prototype.forEach.call(chips, function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-sector') === s ? 'true' : 'false'); });
    if (persist) { try { localStorage.setItem(KEY, s); } catch (e) { /* private */ } }
    document.dispatchEvent(new CustomEvent('sb:sector', { detail: { sector: s } }));
  }
  Array.prototype.forEach.call(chips, function (b) {
    b.addEventListener('click', function () { setSector(b.getAttribute('data-sector'), true); start(); });
  });
  setSector(sector, false);

  /* ننتظر جاهزية القاموس، ونعيد التشغيل عند تبديل اللغة */
  if (window.SB) start();
  else document.addEventListener('DOMContentLoaded', start);
  document.addEventListener('sb:langchange', start);
})();
