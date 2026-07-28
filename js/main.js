/* ============================================================
   صبّارة AI — التنقل، ظهور العناصر، العرض الحي، ومفتاح الحلول
   ============================================================ */

/* ============ nav ============ */
(function(){
  var t=document.querySelector('.nav-toggle'),m=document.getElementById('navMenu');
  t.addEventListener('click',function(){
    var open=m.classList.toggle('is-open');
    t.setAttribute('aria-expanded',open?'true':'false');
  });
  m.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click',function(){m.classList.remove('is-open');t.setAttribute('aria-expanded','false')});
  });
})();

/* ============ خط الهيدر عند التمرير (يفعّل تأثير css/glow.css) ============ */
(function(){
  var h=document.querySelector('.site-header');
  var onScroll=function(){h.classList.toggle('is-scrolled',window.scrollY>8)};
  onScroll();addEventListener('scroll',onScroll,{passive:true});
})();

/* ============ reveal on scroll ============ */
(function(){
  var els=document.querySelectorAll('.reveal');
  if(!('IntersectionObserver' in window)){Array.prototype.forEach.call(els,function(e){e.classList.add('is-visible')});return}
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(en){if(en.isIntersecting){en.target.classList.add('is-visible');io.unobserve(en.target)}});
  },{threshold:.12,rootMargin:'0px 0px -8% 0px'});
  els.forEach(function(e){io.observe(e)});
})();

/* ============ hero live demo ============ */
(function(){
  var body=document.getElementById('demoBody');
  if(!body)return;
  var script=[
    {who:'user',text:'السلام عليكم، الطلب يوصل الخبر؟'},
    {who:'bot',text:'وعليكم السلام 👋 إيه، التوصيل متاح. تبيني أشيك لك مدة التوصيل للمنتج اللي اخترته؟'},
    {who:'user',text:'إيه لو سمحت، وأبي فاتورة باسم المؤسسة.'},
    {who:'bot',text:'تم. التوصيل للخبر خلال 48 ساعة، وسجّلت طلب فاتورة باسم المؤسسة. أرسل لك رابط الدفع؟'}
  ];
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function bubble(cls,text){
    var d=document.createElement('div');d.className='bubble bubble--'+cls;d.textContent=text;
    body.appendChild(d);return d;
  }
  function typing(){
    var d=document.createElement('div');d.className='bubble bubble--bot bubble--typing';
    d.innerHTML='<i></i><i></i><i></i>';body.appendChild(d);return d;
  }
  if(reduce){script.forEach(function(s){bubble(s.who,s.text)});return}
  var i=0,timers=[];
  function step(){
    if(i>=script.length){
      timers.push(setTimeout(function(){body.innerHTML='';i=0;step()},6000));return;
    }
    var s=script[i++];
    if(s.who==='user'){bubble('user',s.text);timers.push(setTimeout(step,1100));}
    else{
      var t=typing();
      timers.push(setTimeout(function(){t.remove();bubble('bot',s.text);timers.push(setTimeout(step,2100))},1200));
    }
  }
  step();
})();

/* ============ audience switch ============ */
(function(){
  var wrap=document.querySelector('.aud-switch'),
      tb=document.getElementById('tabBiz'),ti=document.getElementById('tabInd'),
      pb=document.getElementById('panelBiz'),pi=document.getElementById('panelInd'),
      head=document.getElementById('solHeading'),
      hEye=document.getElementById('solEyebrow'),hTitle=document.getElementById('solTitle'),
      hSub=document.getElementById('solSub');
  /* نص القسم يتغيّر مع التبويب — عدّل هنا */
  var HEAD={
    biz:{eyebrow:'صبّارة للأعمال',title:'حلول ذكية لأعمالك',
         sub:'من خدمة العميل إلى متابعة الفرص وتشغيل المهام اليومية — حلول جاهزة، ونبني لك حلًا مخصصًا حسب احتياج نشاطك.'},
    ind:{eyebrow:'صبّارة للأفراد',title:'حضورك المهني وشغلك اليومي، بس أذكى.',
         sub:'حلول ذكية للمهنيين والخريجين والمستقلين تساعدك تعرض خبرتك، ترتب فرصك، وتخفف عنك الشغل المتكرر.'}
  };
  function show(which){
    var biz=which==='biz';
    var h=HEAD[biz?'biz':'ind'];
    if(hEye.textContent!==h.eyebrow){
      hEye.textContent=h.eyebrow;hTitle.textContent=h.title;hSub.textContent=h.sub;
      head.classList.remove('is-swap');void head.offsetWidth;head.classList.add('is-swap');
    }
    wrap.classList.toggle('is-ind',!biz);
    tb.classList.toggle('is-active',biz);ti.classList.toggle('is-active',!biz);
    tb.setAttribute('aria-selected',biz);ti.setAttribute('aria-selected',!biz);
    tb.tabIndex=biz?0:-1;ti.tabIndex=biz?-1:0;
    pb.hidden=!biz;pi.hidden=biz;
    (biz?pb:pi).classList.add('is-visible');
  }
  tb.addEventListener('click',function(){show('biz')});
  ti.addEventListener('click',function(){show('ind')});
  document.querySelectorAll('[data-aud]').forEach(function(l){
    l.addEventListener('click',function(){show(l.getAttribute('data-aud'))});
  });
  wrap.addEventListener('keydown',function(e){
    if(e.key==='ArrowLeft'||e.key==='ArrowRight'){
      var toBiz=document.activeElement===ti;show(toBiz?'biz':'ind');(toBiz?tb:ti).focus();
    }
  });
})();
