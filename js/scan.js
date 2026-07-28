/* ============ فحص صبّارة — rule-based diagnostic (v1) ============ */
(function(){
  /* ---------- 1) إعدادات أنواع النشاط: عدّل هنا بدون لمس المنطق ----------
     (opener: نص القطاع — محفوظ للاستخدام لاحقًا، وغير معروض حاليًا لتقصير التشخيص) */
  var TYPES={
    ecom:{label:'متجر إلكتروني',
      opener:'توجد فرصة واضحة لتحسين انتقال العميل من الاستفسار إلى الشراء.',
      start:{comm:'الرد على استفسارات المنتجات والطلبات',
             leak:'متابعة العميل اللي سأل وما أكمل الطلب',
             manual:'متابعة الطلبات والتقارير اليومية',
             frag:'نقل بيانات الطلبات بين أدواتك'}},
    clinic:{label:'عيادة / مركز طبي',
      opener:'توجد فرصة لتقليل العمل اليدوي في الحجز والتذكير والمتابعة.',
      start:{comm:'الرد على استفسارات الحجز والأسعار',
             leak:'تذكير ومتابعة المواعيد',
             manual:'تنظيم الحجوزات والتقارير اليومية',
             frag:'نقل بيانات المراجعين بين الأنظمة'}},
    restaurant:{label:'مطعم / كافيه',
      opener:'توجد فرصة لتخفيف الاستفسارات المتكررة وتنظيم الطلبات والمتابعة.',
      start:{comm:'الرد على الاستفسارات المتكررة',
             leak:'متابعة الحجوزات والطلبات المفتوحة',
             manual:'تنظيم الطلبات والتقارير اليومية',
             frag:'ربط الطلبات مع بقية أدواتك'}},
    realestate:{label:'عقارات',
      opener:'توجد فرصة لتحسين تأهيل العملاء ومتابعة الفرص قبل أن تبرد.',
      start:{comm:'الرد على استفسارات العروض والمعاينات',
             leak:'متابعة العميل المحتمل',
             manual:'تنظيم بيانات العروض والتقارير',
             frag:'نقل بيانات العملاء بين الأنظمة'}},
    b2b:{label:'خدمات B2B',
      opener:'توجد فرصة لتقليل الوقت بين دخول العميل المحتمل وتحويله إلى فرصة جاهزة للفريق.',
      start:{comm:'استقبال الطلبات الواردة وتأهيلها',
             leak:'متابعة العميل المحتمل',
             manual:'التقارير التشغيلية والمتابعة الداخلية',
             frag:'نقل البيانات بين الأنظمة'}},
    services:{label:'شركة / مكتب خدمات',
      opener:'توجد فرصة لتقليل العمل اليدوي من استقبال الطلب حتى إغلاقه.',
      start:{comm:'الرد على الاستفسارات المتكررة',
             leak:'متابعة الطلبات المفتوحة',
             manual:'التقارير التشغيلية والعمل الإداري',
             frag:'نقل البيانات بين الأنظمة'}},
    other:{label:'نشاط آخر',
      opener:'توجد فرصة لتقليل العمل المتكرر وتنظيم متابعة العملاء.',
      start:{comm:'الرد على الاستفسارات المتكررة',
             leak:'متابعة العميل المحتمل',
             manual:'العمل الإداري المتكرر والتقارير',
             frag:'نقل البيانات بين الأنظمة'}}
  };

  /* ليش يستاهل هذا الموضع — مشكلة عمل، مو حل تقني */
  var WHY={
    comm:'نفس الأسئلة تتكرر يوميًا وتأخذ وقت الفريق، وتأخر الرد ممكن يخلي العميل يروح لمكان ثاني.',
    leak:'المتابعة تعتمد اليوم على التذكر، وبعض الفرص تضيع قبل ما تكمل رحلتها.',
    manual:'جزء من يومك يروح في شغل متكرر ما يضيف قيمة، وهو وقت كان ممكن يروح للشغل المهم.',
    frag:'المعلومة تتنقل يدويًا بين أكثر من مكان، وهذا يفتح باب التأخير وتكرار الإدخال والخطأ.'
  };

  /* مقدمة التشخيص — تتركب من أعلى محورين عند العميل */
  var LEAD={
    comm:'أغلب وقتك يروح على استفسارات متكررة',
    leak:'متابعتك للعملاء تعتمد على التذكر اليدوي',
    manual:'عندك شغل يومي متكرر يتسوى يدويًا',
    frag:'معلوماتك تتنقل يدويًا بين أكثر من مكان'
  };

  var BAND=['منخفضة','متوسطة','مرتفعة','مرتفعة جدًا'];

  /* ---------- 2) الأسئلة السبعة ---------- */
  /* كل خيار: [النص, التأثير] — التأثير يغذّي أبعاد داخلية فقط */
  var Q=[
    {q:'وش نوع نشاطك؟',wide:true,
     a:[['متجر إلكتروني',{type:'ecom'}],
        ['عيادة / مركز طبي',{type:'clinic'}],
        ['مطعم / كافيه',{type:'restaurant'}],
        ['عقارات',{type:'realestate'}],
        ['خدمات B2B',{type:'b2b'}],
        ['شركة / مكتب خدمات',{type:'services'}],
        ['نشاط آخر',{type:'other'}]]},

    {q:'ما أكثر شيء يستهلك وقتك يوميًا؟',
     a:[['الرد على الاستفسارات المتكررة',{comm:2,pain:'comm'}],
        ['متابعة العملاء والمواعيد',{leak:2,pain:'leak'}],
        ['التقارير وإدخال البيانات',{manual:2,pain:'manual'}],
        ['تنسيق الطلبات والعمليات اليومية',{manual:1,frag:1,pain:'frag'}]]},

    {q:'من وين توصلك الاستفسارات، وكم تقريبًا؟',
     a:[['قناة وحدة وعدد محدود',{comm:1}],
        ['قناة وحدة وعدد كبير يوميًا',{comm:3}],
        ['أكثر من قناة وعدد متوسط',{comm:3,frag:1}],
        ['أكثر من قناة وصعب نلحق عليها',{comm:4,frag:1}]]},

    {q:'هل تتابعون العميل إذا سأل وما أكمل؟',
     a:[['نعم، متابعة منظمة ومسجّلة',{leak:1}],
        ['نتابع، بس حسب الوقت والتذكر',{leak:3}],
        ['نادرًا',{leak:4}],
        ['ما نتابع أصلًا',{leak:4}]]},

    {q:'كم من شغلك اليومي يتكرر يدويًا (تعبئة، نسخ، تجهيز تقارير)؟',
     a:[['شي بسيط',{manual:1}],
        ['ربع اليوم تقريبًا',{manual:2}],
        ['نص اليوم تقريبًا',{manual:3}],
        ['أغلب اليوم',{manual:4}]]},

    {q:'هل تنقلون معلومات يدويًا بين أكثر من نظام أو ملف؟',
     a:[['لا، أنظمتنا مربوطة',{frag:1}],
        ['أحيانًا وفي حالات محددة',{frag:2}],
        ['نعم، بشكل شبه يومي',{frag:4}],
        ['نشتغل على ملفات وواتساب بدون نظام',{frag:4,manual:1}]]},

    {q:'وين تحتاجون قرار موظف بشري؟',
     a:[['أغلب القرارات تحتاج موظف',{human:4}],
        ['في الحالات الحساسة فقط (تسعير، شكاوى، استثناءات)',{human:2}],
        ['نادرًا — أغلب الطلبات متشابهة',{human:1}],
        ['ما هو واضح عندنا',{human:2}]]}
  ];

  /* ---------- 3) محرك القواعد ---------- */
  var DIMS=['comm','leak','manual','frag'];
  var NAMES={comm:'ضغط التواصل',leak:'فقدان الفرص',manual:'العمل المتكرر',frag:'ترابط الأنظمة'};

  function levelOf(v){                       /* منخفض → مرتفع جدًا */
    if(v<=1)return 0; if(v<=2)return 1; if(v<=4)return 2; return 3;
  }
  var LEVEL_TEXT=['منخفض','متوسط','مرتفع','مرتفع جدًا'];
  var LEVEL_BAR=[28,52,78,95];
  var LINK_TEXT=['جيد','جزئي','يحتاج تحسين','يحتاج تحسين'];
  var HUMAN_TEXT={1:'محدود',2:'مهم في نقاط محددة',4:'مرتفع'};

  function evaluate(answers){
    var d={comm:0,leak:0,manual:0,frag:0,human:2},type='other',pain=null;
    answers.forEach(function(e){
      if(!e)return;
      if(e.type)type=e.type;
      if(e.pain)pain=e.pain;
      DIMS.concat(['human']).forEach(function(k){ if(e[k])d[k]=(k==='human')?e[k]:d[k]+e[k]; });
    });
    var cfg=TYPES[type]||TYPES.other;

    /* أولوية الأتمتة: مجموع الأبعاد الأربعة (4 → 18) */
    var total=d.comm+d.leak+d.manual+d.frag;
    var band = total<=7?0 : total<=11?1 : total<=15?2 : 3;

    /* أول موضع يستاهل الأتمتة: أعلى بُعد، والتعادل يُحسم بأكثر شي يستهلك الوقت */
    var order=[pain,'leak','comm','manual','frag'];
    var top=DIMS.slice().sort(function(a,b){
      if(d[b]!==d[a])return d[b]-d[a];
      return order.indexOf(a)-order.indexOf(b);
    })[0];

    var indicators=DIMS.map(function(k){
      var lv=levelOf(d[k]);
      return {key:k,name:NAMES[k],
              label:(k==='frag')?LINK_TEXT[lv]:LEVEL_TEXT[lv],
              warn:(k==='frag')?lv>=2:lv>=2,
              bar:(k==='frag')?[26,54,86,86][lv]:LEVEL_BAR[lv]};
    });

    /* الجملة الأولى: أعلى محورين (قيمة 3 فما فوق) + الأولوية */
    var lead=DIMS.slice().sort(function(a,b){return d[b]-d[a]})
                 .filter(function(k){return d[k]>=3}).slice(0,2).map(function(k){return LEAD[k]});
    var summary=(lead.length?lead.join('، و'):'أغلب عملياتك مرتبة')+
                '، لذلك الأتمتة عندك أولوية '+BAND[band]+'.';

    return {
      type:type,typeLabel:cfg.label,
      priority:BAND[band],
      summary:summary,
      topKey:top,
      topLabel:cfg.start[top],
      opener:cfg.opener,
      why:WHY[top],
      human:HUMAN_TEXT[d.human]||'مهم في نقاط محددة',
      indicators:indicators,
      _debug:{total:total,dims:d}
    };
  }

  if(typeof module!=='undefined'&&module.exports){module.exports={Q:Q,evaluate:evaluate};}

  /* ---------- 4) الربط بالواجهة ---------- */
  var panel=(typeof document!=='undefined')&&document.getElementById('scanPanel');
  if(!panel)return;

  var stages={intro:document.getElementById('scanIntro'),quiz:document.getElementById('scanQuiz'),
              load:document.getElementById('scanAnalyzing'),res:document.getElementById('scanResult')};
  var elStep=document.getElementById('scanStep'),elBar=document.getElementById('scanBarFill'),
      elQ=document.getElementById('scanQuestion'),elOpts=document.getElementById('scanOptions'),
      elBack=document.getElementById('scanBack'),elPhase=document.getElementById('scanPhase'),
      elPriority=document.getElementById('scanPriority'),elTop=document.getElementById('scanTop'),
      elInd=document.getElementById('scanIndicators'),elHuman=document.getElementById('scanHuman'),
      elDiag=document.getElementById('scanDiagnosis');
  var idx=0,answers=[];

  function stage(name){Object.keys(stages).forEach(function(k){stages[k].hidden=k!==name})}

  function render(){
    elStep.textContent='السؤال '+(idx+1)+' من '+Q.length;
    elBar.style.width=(idx/Q.length*100)+'%';
    elQ.textContent=Q[idx].q;
    elOpts.className='scan__options'+(Q[idx].wide?' scan__options--wide':'');
    elOpts.innerHTML='';
    Q[idx].a.forEach(function(opt){
      var b=document.createElement('button');
      b.type='button';b.className='scan__opt';b.textContent=opt[0];
      if(answers[idx]===opt[1])b.classList.add('is-picked');
      b.addEventListener('click',function(){answers[idx]=opt[1];next()});
      elOpts.appendChild(b);
    });
    elBack.hidden=idx===0;
  }

  function next(){
    if(idx<Q.length-1){idx++;render()}
    else{elBar.style.width='100%';analyze()}
  }

  function analyze(){
    stage('load');
    var phases=['صبّارة ترتب إجاباتك…','تبحث عن أكثر نقاط العمل المتكرر…',
                'تراجع أين تضيع الفرص…','تحدد لك أفضل مكان تبدأ منه…'];
    var p=0;elPhase.textContent=phases[0];
    var iv=setInterval(function(){p++;if(p<phases.length)elPhase.textContent=phases[p]},760);
    setTimeout(function(){clearInterval(iv);show(evaluate(answers))},3000);
  }

  function show(r){
    stage('res');
    elPriority.textContent=r.priority;
    elTop.textContent=r.topLabel;
    elInd.innerHTML='';
    r.indicators.forEach(function(d){
      var w=document.createElement('div');
      w.className='ind'+(d.warn?' ind--warn':'');
      w.innerHTML='<b>'+d.name+'</b><span>'+d.label+'</span><i></i>';
      elInd.appendChild(w);
      var bar=w.querySelector('i');
      requestAnimationFrame(function(){bar.style.setProperty('--v',d.bar+'%')});
    });
    elHuman.innerHTML='التدخل البشري: <b>'+r.human+'</b>';
    elDiag.innerHTML='<span>'+r.summary+'</span>'+
                     '<span>أفضل مكان تبدأ منه: <b>'+r.topLabel+'</b>.</span>'+
                     '<span>السبب: '+r.why+'</span>';
  }

  document.getElementById('scanStart').addEventListener('click',function(){
    idx=0;answers=[];stage('quiz');render();
    panel.scrollIntoView({behavior:'smooth',block:'center'});
  });
  elBack.addEventListener('click',function(){if(idx>0){idx--;render()}});
  document.getElementById('scanRestart').addEventListener('click',function(){
    idx=0;answers=[];stage('intro');
    panel.scrollIntoView({behavior:'smooth',block:'center'});
  });
})();
