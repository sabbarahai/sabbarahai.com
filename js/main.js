/* ============================================================
   صبّارة AI — التنقل، ظهور العناصر، والعرض الحي
   SABBARAH AI — navigation, scroll reveal, hero demo
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
})();

/* ============ خط الهيدر عند التمرير (يفعّل تأثير css/glow.css) ============ */
(function () {
  var h = document.querySelector('.site-header');
  if (!h) return;
  var onScroll = function () { h.classList.toggle('is-scrolled', window.scrollY > 8) };
  onScroll(); addEventListener('scroll', onScroll, { passive: true });
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

/* ============ hero live demo (ثنائي اللغة) ============ */
(function () {
  var body = document.getElementById('demoBody');
  if (!body) return;

  var SCRIPT = [
    { who: 'user', key: 'demo.1' },
    { who: 'bot', key: 'demo.2' },
    { who: 'user', key: 'demo.3' },
    { who: 'bot', key: 'demo.4' }
  ];
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var timers = [], i = 0;

  function line(key) { return window.SB ? window.SB.t(key) : ''; }

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
  function step() {
    if (i >= SCRIPT.length) {
      timers.push(setTimeout(function () { body.innerHTML = ''; i = 0; step() }, 6000));
      return;
    }
    var s = SCRIPT[i++];
    if (s.who === 'user') {
      bubble('user', line(s.key));
      timers.push(setTimeout(step, 1100));
    } else {
      var t = typing();
      timers.push(setTimeout(function () {
        t.remove(); bubble('bot', line(s.key));
        timers.push(setTimeout(step, 2100));
      }, 1200));
    }
  }
  function start() {
    clearTimers();
    body.innerHTML = '';
    i = 0;
    if (reduce) { SCRIPT.forEach(function (s) { bubble(s.who, line(s.key)) }); return; }
    step();
  }

  /* ننتظر جاهزية القاموس، ونعيد التشغيل عند تبديل اللغة */
  if (window.SB) start();
  else document.addEventListener('DOMContentLoaded', start);
  document.addEventListener('sb:langchange', start);
})();
