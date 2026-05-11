'use strict';

/* ════════════════════════════════════════════════
   md.js — Mother's Day Site
   Loading screen · Typewriter · Scroll reveals · Photo upload
════════════════════════════════════════════════ */

/* ─── SELECTED LANGUAGE (set on button click, used when site reveals) ─── */
let selectedLang = "en";

/* ─── LOADER MESSAGES ─── */
const LANG = {
  en: {
    dir: "ltr",
    messages: [
      { p: "Loading first child’s touches…",           s: "" },
      { p: "Preparing all the love we could carry…",   s: "" },
      { p: "Filling every moment with warmth…",        s: "" },
      { p: "Almost ready, Mama…",                      s: "" },
      { p: "♡",                                         s: "" },
    ],
  },
  ar: {
    dir: "rtl",
    messages: [
      { p: "جاري تحميل لمسات طفلك الأوّل…",
        s: "(Loading your firstborn’s touches…)" },
      { p: "نُحضِّر كل الحب الذي تستحقينه…",
        s: "(Preparing all the love you deserve…)" },
      { p: "نملأ كل لحظة بدفئك وعطائك…",
        s: "(Filling every moment with your warmth…)" },
      { p: "كل شيء جاهز بكل محبّة، يا أمي…",
        s: "(Everything ready with all our love, Mama…)" },
      { p: "♡", s: "" },
    ],
  },
};

/* ════════════════════════════════════════════════
   LOADING SCREEN
════════════════════════════════════════════════ */
(function initLoader() {
  /* Draw the heart path */
  const path = document.getElementById('heart-path');
  if (path) {
    const len = path.getTotalLength ? path.getTotalLength() : 400;
    path.style.strokeDasharray  = len;
    path.style.strokeDashoffset = len;
    setTimeout(() => {
      path.style.transition = 'stroke-dashoffset 1.8s cubic-bezier(0.4,0,0.2,1)';
      path.style.strokeDashoffset = '0';
    }, 280);
  }

  document.getElementById('btn-en').addEventListener('click', () => { selectedLang = "en"; startLoading('en'); });
  document.getElementById('btn-ar').addEventListener('click', () => { selectedLang = "ar"; startLoading('ar'); });
})();

function startLoading(lang) {
  const langPhase = document.getElementById('loader-lang');
  const animPhase = document.getElementById('loader-anim');

  /* Fade out language picker */
  langPhase.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
  langPhase.style.opacity    = '0';
  langPhase.style.transform  = 'scale(0.95) translateY(-8px)';

  setTimeout(() => {
    langPhase.style.display = 'none';
    animPhase.style.display = 'flex';
    /* Force reflow before fading in */
    void animPhase.offsetHeight;
    animPhase.style.transition = 'opacity 0.45s ease';
    animPhase.style.opacity    = '1';
    runLoadingSequence(lang);
  }, 460);
}

function runLoadingSequence(lang) {
  const msgs     = LANG[lang].messages;
  const elP      = document.getElementById('loader-msg-primary');
  const elS      = document.getElementById('loader-msg-secondary');
  const elBar    = document.getElementById('loader-bar');
  const animEl   = document.getElementById('loader-anim');

  /* RTL for Arabic */
  if (lang === 'ar') {
    elP.setAttribute('dir', 'rtl');
    animEl.setAttribute('dir', 'rtl');
    elP.style.fontFamily = "var(--arabic, 'Noto Naskh Arabic', serif)";
  }

  /* Kick off progress bar */
  const TOTAL_MS = 4600;
  requestAnimationFrame(() => {
    elBar.style.transition = `width ${TOTAL_MS}ms cubic-bezier(0.4,0,0.2,1)`;
    requestAnimationFrame(() => { elBar.style.width = '100%'; });
  });

  /* Cycle messages */
  const INTERVAL = Math.floor(TOTAL_MS / msgs.length);
  let i = 0;

  function showNext() {
    const m = msgs[i++];

    /* Fade out */
    elP.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
    elS.style.transition = 'opacity 0.25s ease';
    elP.style.opacity    = '0';
    elP.style.transform  = 'translateY(6px)';
    elS.style.opacity    = '0';

    setTimeout(() => {
      elP.textContent = m.p;
      elS.textContent = m.s;
      /* Fade in */
      elP.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      elS.style.transition = 'opacity 0.4s ease 0.08s';
      elP.style.opacity    = '1';
      elP.style.transform  = 'translateY(0)';
      elS.style.opacity    = '1';
    }, 260);

    if (i < msgs.length) {
      setTimeout(showNext, INTERVAL);
    } else {
      /* Exit after final message lingers */
      setTimeout(exitLoader, INTERVAL + 300);
    }
  }

  elP.style.opacity = '0'; elS.style.opacity = '0';
  setTimeout(showNext, 180);
}

function exitLoader() {
  const loader = document.getElementById('loader');
  const site   = document.getElementById('site');

  loader.style.transition = 'opacity 0.85s ease, transform 0.85s ease';
  loader.style.opacity    = '0';
  loader.style.transform  = 'scale(1.04)';

  setTimeout(() => {
    loader.style.display = 'none';
    site.style.display   = 'block';
    void site.offsetHeight;
    site.style.transition = 'opacity 0.7s ease';
    site.style.opacity    = '1';

    initSite();
  }, 860);
}


/* ════════════════════════════════════════════════
   SITE INIT
════════════════════════════════════════════════ */
function initSite() {
  applyLanguage(selectedLang);
  spawnParticles();
  initRevealObserver();
  /* Fire hero immediately (already in viewport) */
  setTimeout(() => {
    document.querySelectorAll('#dear-mama .reveal-up, #dear-mama .reveal-scale, #dear-mama .reveal-write, #dear-mama .sec-tag')
      .forEach(el => triggerReveal(el));
  }, 80);
  initPhotoSlots();
}


/* ════════════════════════════════════════════════
   FLOATING PARTICLES
════════════════════════════════════════════════ */
function spawnParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  /* Fewer on mobile for perf */
  const isMobile = window.matchMedia('(max-width:768px)').matches;
  const count    = isMobile ? 5 : 12;
  const symbols  = ['♡', '♥', '✿', '·', '✦', '♥'];

  for (let i = 0; i < count; i++) {
    const el = document.createElement('span');
    el.className = 'particle';
    el.textContent = symbols[i % symbols.length];
    el.style.setProperty('--x',     (Math.random() * 96 + 2) + 'vw');
    el.style.setProperty('--sz',    (10 + Math.random() * 12) + 'px');
    el.style.setProperty('--dur',   (9  + Math.random() * 8)  + 's');
    el.style.setProperty('--delay', (Math.random() * 10)      + 's');
    container.appendChild(el);
  }
}


/* ════════════════════════════════════════════════
   SCROLL REVEAL (IntersectionObserver)
════════════════════════════════════════════════ */
function triggerReveal(el) {
  if (el.dataset.revealed) return;
  el.dataset.revealed = '1';

  if (el.classList.contains('reveal-write')) {
    el.classList.add('in');
    startTypewriter(el);
  } else {
    el.classList.add('in');
  }
}

function initRevealObserver() {
  /* Skip if reduced-motion */
  if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
    document.querySelectorAll('.reveal-up,.reveal-scale,.reveal-write,.sec-tag')
      .forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
    return;
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      triggerReveal(e.target);
      obs.unobserve(e.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal-up,.reveal-scale,.reveal-write,.sec-tag')
    .forEach(el => obs.observe(el));
}


/* ════════════════════════════════════════════════
   TYPEWRITER — "live writing" effect
════════════════════════════════════════════════ */
function startTypewriter(el) {
  if (el.dataset.typed) return;
  el.dataset.typed = '1';

  const fullText = el.textContent.trim();
  const delay    = (parseFloat(el.style.getPropertyValue('--d') || '0')) * 1000;

  el.textContent = '';
  el.classList.add('writing');

  const SPEED = el.classList.contains('hero-title') ? 80 : 58;

  setTimeout(() => {
    let i = 0;
    const tick = setInterval(() => {
      el.textContent = fullText.slice(0, ++i);
      if (i >= fullText.length) {
        clearInterval(tick);
        el.classList.remove('writing');
        el.classList.add('write-done');
        /* Remove cursor class after fade-out */
        setTimeout(() => el.classList.remove('write-done'), 700);
      }
    }, SPEED);
  }, delay);
}


/* ════════════════════════════════════════════════
   FULL SITE CONTENT — English & Arabic
════════════════════════════════════════════════ */
const CONTENT = {
  en: {
    "hero.tag":           "A Letter",
    "hero.title":         "Dear Mama.",
    "hero.sub":           "To the woman who built an entire world from nothing<br class=\"hide-mobile\"/> so her children could have everything.",
    "ui.tap":             "Tap to add",
    "ui.scroll":          "Scroll",
    "cap.mama-me":        "Mama & Me",

    "sac.tag":            "The Beginning",
    "sac.title":          "From Libya, With Everything.",
    "sac.body1":          "You left behind everything familiar — your family, your home, your language, the streets you grew up on — and stepped into a country that didn't know your name, didn't speak your tongue, and didn't owe you a single thing.",
    "sac.body2":          "Most people never understand what that truly takes. To build a life from a blank page, in a place you didn't choose, with people you didn't know, in a language you were still learning — and to do it not for yourself, but for children who weren't even old enough to understand what sacrifice meant.",
    "sac.body3":          "You built something beautiful, Mama. And you built it from nothing but love and faith.",
    "sac.quote":          "“She didn’t just raise a family. She built a home — out of faith, out of grit, and out of a love so steady it never needed saying.”",

    "fruits.tag":         "Your Legacy",
    "fruits.title":       "Look What You Built.",
    "fruits.intro":       "Whether your health had its hiccups, or you quietly felt the weight of being far from your own family — the meals were always cooked. The clothes were always there. The house was always known in our community as the most generous, most welcoming place anyone had ever walked into. You never took a day off from being our mom.",
    "fruits.anis-name":   "Anis",
    "fruits.anis-desc":   "Your youngest — now studying Engineering at Brown University on the East Coast. The scrawny little kid who knocked on my door just to play is now stepping into something great.",
    "cap.anis":           "Anis",
    "fruits.daniah-name": "Daniah",
    "fruits.daniah-desc": "Your middle — CU Denver Engineering grad, now working as a Software Engineer, and about to get married. The one who quietly kept Anis and I on track our entire lives.",
    "cap.daniah":         "Daniah",
    "fruits.malik-name":  "Malik",
    "fruits.malik-desc":  "Your oldest — a Software Engineer pursuing entrepreneurship in Texas. Still chasing what you always told me was worth chasing: something I could call my own.",
    "cap.malik":          "Malik",
    "fruits.body1":       "Three kids. Three degrees. Three lives you shaped from the ground up with nothing but your own two hands. You were our shoulder when relationships fell apart. Our backbone when we wanted to give up. The voice of reason when everything felt impossible. And through all of it — you never asked for a single thing in return.",
    "fruits.body2":       "Multiple people have told me directly — your home is known. Known for the food that’s always there, for the warmth that greets anyone who walks through the door, for the way you treat every guest like family. You built that reputation.",

    "apart.tag":          "This Year",
    "apart.title":        "Though Miles Apart.",
    "cap.with-love":      "With Love",
    "cap.always":         "Always",
    "apart.body1":        "I know we have our differences. I always knew that. But what I didn’t know — what I only started to truly understand after moving out and being on my own — is just how much you were doing every single day without ever making it a thing.",
    "apart.body2":        "This is the first Mother’s Day we spend apart. I always thought of you as superwoman — and I still do — but now I get it. Now I understand the real weight behind it all. And I want you to know: Anis and I are missing you. Every single day.",
    "apart.body3":        "I notice your absence in everything. In the quiet of a morning with no food already made. In a hard day with no one to call who truly, fully knows me. In every little thing I never stopped to notice when you were right there.",
    "apart.quote":        "“Through thick and thin, Mama — we all love you. May Allah bless every struggle, every tear shed, and every sacrifice you have ever made for us.”",

    "chapter.tag":        "Looking Forward",
    "chapter.title":      "Just A Chapter.",
    "cap.until-then":     "Until Then",
    "chapter.body1":      "Inshallah, Mama — this is just a chapter. Not the whole book.",
    "chapter.body2":      "Anis will graduate and come back. I will move back after this company takes off — after I can stand in front of you and say I built something I’m proud of. And we will all be reunited. In the same city. Around the same table.",
    "chapter.body3":      "Until then, stay strong for us. You’ve always been so unbelievably strong — and now it really gets tested. But I am so confident you will make it through, because everything you have ever done has been for the sake of us. And that is a strength no distance can ever touch.",
    "chapter.love":       "Happy Mother’s Day, Mama.<br/>I love you.",
    "chapter.sig":        "— Malik",

    "collage.tag":        "With All Our Love",
    "collage.title":      "Always & Forever.",
    "cap.a-moment":       "A Moment",
    "cap.a-memory":       "A Memory",
    "cap.a-lifetime":     "A Lifetime",

    "footer.title":       "Happy Mother’s Day",
    "footer.sub":         "Made with every bit of love your oldest child could fit onto a screen.",
    "footer.arabic":      "كل عام وأنتِ بخير يا أمي ❤️",
  },

  ar: {
    "hero.tag":           "رسالة",
    "hero.title":         "غاليتي أمي.",
    "hero.sub":           "إلى المرأة التي بنت عالماً بأكمله من لا شيء، حتى لا يحتاج أطفالها إلى شيء.",
    "ui.tap":             "اضغط لإضافة",
    "ui.scroll":          "اسحب",
    "cap.mama-me":        "أنا وأمي",

    "sac.tag":            "البداية",
    "sac.title":          "من ليبيا، بكل شيء.",
    "sac.body1":          "تركتِ وراءكِ كل ما هو مألوف — عائلتكِ، وبيتكِ، ولغتكِ، والأزقة التي نشأتِ فيها — وخطوتِ نحو بلدٍ لا يعرف اسمكِ، ولا يتكلم بلسانكِ، ولا يدين لكِ بشيء.",
    "sac.body2":          "قلّة من الناس تدرك حقّاً ما يتطلبه ذلك. أن تبني حياةً من صفحة بيضاء، في مكانٍ لم تختاريه، بين أناسٍ لم تكوني تعرفينهم، بلغةٍ كنتِ لا تزالين تتعلمينها — وأن تفعلي ذلك ليس لأجل نفسكِ، بل لأجل أطفالٍ لم يبلغوا من السنّ ما يدركون به معنى التضحية.",
    "sac.body3":          "لقد بنيتِ شيئاً جميلاً، يا أمي. وبنيتِه من لا شيء سوى الحبّ والإيمان.",
    "sac.quote":          "“هي لم تُربِّ عائلةً فحسب. هي شيَّدت وطناً — من الإيمان، ومن الإرادة، ومن حبٍّ راسخٍ لم يحتج إلى كلمات.”",

    "fruits.tag":         "إرثكِ",
    "fruits.title":       "انظري ما بنيتِ.",
    "fruits.intro":       "سواء أصابت صحّتكِ بعض الوعكات، أو أحسستِ في قرارة نفسكِ بثقل الغربة عن أهلكِ — كانت الوجبات دائماً جاهزة. والملابس دائماً في انتظارنا. وكان بيتكِ مشهوراً في مجتمعنا بأنه أكثر البيوت كرماً ودفءاً. لم تأخذي يوماً إجازةً من دور الأم.",
    "fruits.anis-name":   "أنيس",
    "fruits.anis-desc":   "أصغرهم — يدرس الهندسة في جامعة براون على الساحل الشرقي. ذلك الطفل النحيل الذي كان يطرق بابي ليلعب معي أصبح اليوم يمضي نحو مستقبلٍ عظيم.",
    "cap.anis":           "أنيس",
    "fruits.daniah-name": "دانية",
    "fruits.daniah-desc": "الوسطى — خريجة هندسة من جامعة كولورادو دنفر، وتعمل الآن مهندسة برمجيات، وعلى وشك الزواج. هي من أبقت أنيس وأنا على المسار الصحيح طوال حياتنا بهدوءٍ دون ضجة.",
    "cap.daniah":         "دانية",
    "fruits.malik-name":  "مالك",
    "fruits.malik-desc":  "الأكبر — مهندس برمجيات يسعى نحو ريادة الأعمال في تكساس. لا يزال يلاحق ما طالما قلتِ له إنه يستحق الملاحقة: شيءٌ يستطيع أن يسميه ملكه.",
    "cap.malik":          "مالك",
    "fruits.body1":       "ثلاثة أبناء. ثلاث شهادات. ثلاثة مصائر شكَّلتِها بيديكِ دون أن تطلبي شيئاً في المقابل. كنتِ كتفنا حين تعثَّرت علاقاتنا. وعمودنا حين كدنا نستسلم. وصوت العقل حين بدا كل شيء مستحيلاً. وطوال ذلك كله — لم تطلبي شيئاً في المقابل.",
    "fruits.body2":       "أخبرني أشخاص كثيرون مباشرةً — بيتكِ مشهور. مشهور بالطعام الذي لا ينقص، وبالدفء الذي يستقبل كل من يدخل بابه، وبكِ أنتِ. أنتِ من صنعتِ هذه السمعة.",

    "apart.tag":          "هذه السنة",
    "apart.title":        "رغم البُعد.",
    "cap.with-love":      "بكل الحب",
    "cap.always":         "دائماً",
    "apart.body1":        "أعرف أن بيننا خلافاتنا. وكنت أعرف ذلك دائماً. لكن ما لم أكن أعرفه — ما بدأت أدركه حقّاً فقط بعد أن انتقلت وأصبحت وحدي — هو كمّ ما كنتِ تقومين به كل يوم دون أن تجعليه مسألةً كبيرة.",
    "apart.body2":        "هذا أول عيد أمّ نقضيه بعيدين. كنت دائماً أراكِ امرأةً خارقة — وما زلت — لكنني اليوم أفهم. اليوم أدرك حقيقة ثقل ما كنتِ تحملينه. وأريدكِ أن تعرفي: أنيس وأنا نشتاق إليكِ. كل يوم.",
    "apart.body3":        "أحسّ بغيابكِ في كل شيء. في هدوء الصباح حين لا يكون الطعام جاهزاً. في اليوم الصعب حين لا أجد من يعرفني حقّاً لأتصل به. في كل صغيرةٍ لم أتوقّف لألاحظها حين كنتِ بجانبي.",
    "apart.quote":        "“في السرّاء والضرّاء، يا أمي — كلنا نحبكِ. أسأل الله أن يبارك كل كفاحٍ، وكل دمعةٍ ذُرفت، وكل تضحيةٍ قدَّمتِها من أجلنا.”",

    "chapter.tag":        "نظرة للأمام",
    "chapter.title":      "مجرد فصل.",
    "cap.until-then":     "حتى نلتقي",
    "chapter.body1":      "إن شاء الله، يا أمي — هذا مجرد فصل. وليس الكتاب كله.",
    "chapter.body2":      "سيتخرّج أنيس ويعود. وسأعود أنا بعد أن تنطلق هذه الشركة — بعد أن أستطيع أن أقف أمامكِ وأقول إنني بنيت شيئاً أفتخر به. وسنجتمع كلّنا من جديد. في نفس المدينة. حول نفس الطاولة.",
    "chapter.body3":      "حتى ذلك اليوم، ابقي قويَّةً من أجلنا. كنتِ دائماً قويَّةً بشكل لا يُصدَّق — والآن يُختبر ذلك حقّاً. لكنني واثق جدّاً أنكِ ستجتازين هذه المرحلة، لأن كل ما فعلتِه في حياتكِ كان من أجلنا. وهذه قوّة لا يستطيع أي بُعد أن يمسَّها.",
    "chapter.love":       "عيد أمّ سعيد، يا أمي.<br/>أحبكِ.",
    "chapter.sig":        "— مالك",

    "collage.tag":        "بكل محبتنا",
    "collage.title":      "دائماً وإلى الأبد.",
    "cap.a-moment":       "لحظة",
    "cap.a-memory":       "ذكرى",
    "cap.a-lifetime":     "عمر بأكمله",

    "footer.title":       "عيد أمّ مبارك",
    "footer.sub":         "صنعته بكل الحب الذي استطاع أكبر أبنائكِ أن يجمعه في شاشة.",
    "footer.arabic":      "كل عام وأنتِ بخير يا أمي ❤️",
  },
};

/* ─── APPLY LANGUAGE TO FULL SITE ─── */
function applyLanguage(lang) {
  const c = CONTENT[lang] || CONTENT.en;

  /* Text-only elements */
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const val = c[el.dataset.i18n];
    if (val !== undefined) el.textContent = val;
  });

  /* Elements with embedded HTML (e.g. <br/>) */
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const val = c[el.dataset.i18nHtml];
    if (val !== undefined) el.innerHTML = val;
  });

  /* Direction + font class */
  const site = document.getElementById('site');
  if (lang === 'ar') {
    site.setAttribute('dir', 'rtl');
    site.classList.add('lang-ar');
    document.documentElement.setAttribute('lang', 'ar');
  } else {
    site.setAttribute('dir', 'ltr');
    site.classList.remove('lang-ar');
    document.documentElement.setAttribute('lang', 'en');
  }
}

/* ════════════════════════════════════════════════
   PHOTO SLOTS — Upload, Persist, Restore
════════════════════════════════════════════════ */

/* Deterministic rotation per label so it's consistent across reloads */
function slotRotation(label) {
  const angles = [-2.4, 1.9, -1.3, 2.7, -0.9, 1.6, -2.8, 1.1, -1.8, 2.2];
  let h = 0;
  for (let i = 0; i < label.length; i++) h = (h * 31 + label.charCodeAt(i)) >>> 0;
  return angles[h % angles.length];
}

function applyPhoto(slot, src) {
  /* Remove empty-state elements */
  slot.querySelector('.slot-icon')?.remove();
  slot.querySelector('.slot-hint')?.remove();
  slot.classList.add('has-photo');

  /* Polaroid tilt */
  const cssRot = slot.style.getPropertyValue('--rot');
  const rot    = cssRot ? parseFloat(cssRot) : slotRotation(slot.dataset.label || '');
  if (!cssRot) slot.style.setProperty('--rot', rot + 'deg');
  slot.style.transform = `rotate(${rot}deg)`;

  /* Add or update image inside frame-img-wrap */
  const wrap = slot.querySelector('.frame-img-wrap');
  if (!wrap) return;
  let img = wrap.querySelector('.slot-photo');
  if (!img) {
    img = document.createElement('img');
    img.className = 'slot-photo';
    img.alt       = slot.dataset.label || '';
    wrap.appendChild(img);
  }
  img.src = src;
}

/* Compress to data URL for upload (never used as img.src) */
function compressToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const objUrl = URL.createObjectURL(file);
    const tmp    = new Image();
    tmp.onload = () => {
      URL.revokeObjectURL(objUrl);
      try {
        const MAX  = 1200;
        let w = tmp.naturalWidth, h = tmp.naturalHeight;
        if (w > MAX || h > MAX) {
          if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
          else       { w = Math.round(w * MAX / h); h = MAX; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(tmp, 0, 0, w, h);
        const TARGET = 3.5 * 1024 * 1024;
        let q   = 0.82;
        let out = canvas.toDataURL('image/jpeg', q);
        while (out.length > TARGET && q > 0.25) {
          q -= 0.08;
          out = canvas.toDataURL('image/jpeg', Math.max(q, 0.25));
        }
        resolve(out);
      } catch (err) { reject(err); }
    };
    tmp.onerror = () => { URL.revokeObjectURL(objUrl); reject(new Error('load')); };
    tmp.src = objUrl;
  });
}

/* Upload to Vercel Blob, then swap objectUrl → permanent URL */
async function uploadAndPersist(file, label, objectUrl) {
  try {
    const dataUrl = await compressToDataUrl(file);
    const res  = await fetch('/api/md-upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl, filename: `md-photo-${label}-${Date.now()}.jpg` }),
    });
    const data = await res.json().catch(() => ({}));
    if (!data.url) return;

    /* Swap objectUrl → permanent blob URL */
    URL.revokeObjectURL(objectUrl);
    const slot = document.querySelector(`.photo-slot[data-label="${CSS.escape(label)}"]`);
    const img  = slot?.querySelector('.slot-photo');
    if (img) img.src = data.url;
    try { localStorage.setItem('md_photo__' + label, data.url); } catch (_) {}

    /* Rebuild manifest from all filled slots (exclude blob: URLs) */
    const manifest = {};
    document.querySelectorAll('.photo-slot.has-photo').forEach(s => {
      const lbl = s.dataset.label;
      const im  = s.querySelector('.slot-photo');
      if (lbl && im?.src && !im.src.startsWith('blob:')) manifest[lbl] = im.src;
    });
    await fetch('/api/md-save-photos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photos: manifest }),
    });
  } catch (_) { /* silent — photo shows via objectUrl for this session */ }
}

function initPhotoSlots() {
  /* 1. Restore from localStorage immediately (instant) */
  document.querySelectorAll('.photo-slot').forEach(slot => {
    const key   = 'md_photo__' + (slot.dataset.label || '');
    const saved = localStorage.getItem(key);
    if (saved) applyPhoto(slot, saved);
  });

  /* 2. Sync server manifest in background */
  fetch('/api/md-load-photos')
    .then(r => r.ok ? r.json() : { photos: {} })
    .then(({ photos }) => {
      if (!photos) return;
      document.querySelectorAll('.photo-slot').forEach(slot => {
        const label = slot.dataset.label;
        const url   = photos[label];
        if (!url) return;
        applyPhoto(slot, url);
        try { localStorage.setItem('md_photo__' + label, url); } catch (_) {}
      });
    })
    .catch(() => {});

  /* 3. Wire click → file input */
  document.querySelectorAll('.photo-slot').forEach(slot => {
    slot.addEventListener('click', () => {
      if (slot.classList.contains('has-photo')) return; /* locked after upload */
      const inp    = document.createElement('input');
      inp.type     = 'file';
      inp.accept   = 'image/*';
      /* Must be in DOM for iOS Safari */
      inp.style.cssText = 'position:fixed;top:-999px;left:-999px;opacity:0;';
      document.body.appendChild(inp);

      inp.addEventListener('change', e => {
        try { document.body.removeChild(inp); } catch (_) {}
        const file = e.target.files?.[0];
        if (!file) return;
        const label     = slot.dataset.label || slot.className;
        const objectUrl = URL.createObjectURL(file);
        applyPhoto(slot, objectUrl);
        uploadAndPersist(file, label, objectUrl);
      });

      inp.click();
    });

    /* 3D tilt on hover (desktop) */
    slot.addEventListener('mousemove', e => {
      if (!slot.classList.contains('has-photo')) return;
      const r  = slot.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
      const dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
      slot.style.transform =
        `rotate(0deg) translateY(-7px) scale(1.04) rotateY(${dx * 6}deg) rotateX(${-dy * 6}deg)`;
    });
    slot.addEventListener('mouseleave', () => {
      if (!slot.classList.contains('has-photo')) return;
      const rot = slot.style.getPropertyValue('--rot') || '0deg';
      slot.style.transform = `rotate(${rot})`;
    });
  });
}
