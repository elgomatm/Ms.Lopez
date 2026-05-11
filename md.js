'use strict';

/* ════════════════════════════════════════════════
   md.js — Mother's Day Site
   Loading screen · Typewriter · Scroll reveals · Photo upload
════════════════════════════════════════════════ */

/* ─── SELECTED LANGUAGE (set on button click, used when site reveals) ─── */
let selectedLang = "en";

/* ─── INDEXED DB PHOTO CACHE ────────────────────────────────────────────
   Same-device fallback: saves compressed image immediately so photos
   survive reload even before the Blob upload completes.
──────────────────────────────────────────────────────────────────────── */
const IDB_NAME = 'md-photos', IDB_STORE = 'slots';

function _openIdb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = e => e.target.result.createObjectStore(IDB_STORE);
    req.onsuccess = e => resolve(e.target.result);
    req.onerror   = () => reject(req.error);
  });
}
async function idbSave(label, value) {
  try {
    const db = await _openIdb();
    await new Promise((res, rej) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put(value, label);
      tx.oncomplete = res; tx.onerror = () => rej(tx.error);
    });
  } catch (_) {}
}
async function idbLoadAll() {
  try {
    const db = await _openIdb();
    return new Promise((resolve, reject) => {
      const result = {}, tx = db.transaction(IDB_STORE, 'readonly');
      const req = tx.objectStore(IDB_STORE).openCursor();
      req.onsuccess = e => {
        const c = e.target.result;
        if (c) { result[c.key] = c.value; c.continue(); } else resolve(result);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (_) { return {}; }
}

/* In-memory map of every permanently-uploaded photo URL.
   Populated on load from server manifest + updated after each upload.
   Used to build the saved manifest so no photo ever gets dropped. */
const uploadedPhotos = {};

/* Start fetching + preloading photos immediately so they are browser-cached
   by the time the user finishes the language selection screen. */
const _photosPrefetchPromise = fetch('/api/md-load-photos')
  .then(r => r.ok ? r.json() : { photos: {} })
  .then(({ photos }) => {
    if (!photos) return {};
    Object.assign(uploadedPhotos, photos);
    Object.values(photos).forEach(url => { const i = new Image(); i.src = url; });
    return photos;
  })
  .catch(() => ({}));

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
    "hero.tag":           "رسالة",
    "hero.title":         "غاليتي أمي.",
    "hero.sub":           "إلى المرأة التي تركت كل ما تعرفه، لتعطينا كل ما تملك.",
    "ui.tap":             "اضغط لإضافة",
    "ui.scroll":          "اسحب",
    "cap.mama-me":        "أنا وأمي",

    "sac.tag":            "البداية",
    "sac.title":          "من ليبيا، بكل شيء.",
    "sac.body1":          "تركتِ بلداً كان يحمل كل ما أنتِ عليه — عائلتكِ، وأزقتكِ، ولغتكِ — ووصلتِ إلى مكانٍ لا يعرفكِ ولا يدين لكِ بشيء. بدأتِ من جديد. ليس لأن الأمر كان سهلاً، بل لأننا كنّا نحتاج إليكِ.",
    "sac.body2":          "قلّة من الناس تدرك ثمن ذلك. ليس الانتقال، وليس اللغة — بل فعل البناء اليومي في أرضٍ لم تكن أرضكِ، لأجل أطفالٍ كانوا أصغر من أن يدركوا ما كنتِ تتخلّين عنه.",
    "sac.body3":          "ما بنيتِه حقيقي. ولم يأتِ من شيء أعطاكِ إياه العالم.",
    "sac.quote":          "\u201chي لم تُربِّ عائلة. هي بنت واحدة — من الإيمان، ومن الإرادة، ومن حبٍّ راسخٍ لم يحتج يوماً إلى أن يُعلن عن نفسه.\u201d",

    "fruits.tag":         "إرثكِ",
    "fruits.title":       "انظري ما بنيتِ.",
    "fruits.intro":       "مهما كانت صحّتكِ تحمله، ومهما كان بُعدكِ عن أهلكِ يثقل عليكِ — كانت الوجبات جاهزة. والبيت دافئاً. وكل من دخل ذلك الباب خرج وفي نفسه أنه ينتمي إلى شيء. لم تتوقّفي يوماً عن كونكِ أمّنا.",
    "fruits.anis-name":   "أنيس",
    "fruits.anis-desc":   "أصغرهم — يدرس الهندسة في جامعة براون. ذلك الولد الذي كان يطرق بابي ليجد من يجلس معه أصبح اليوم يبني شيئاً خاصاً به على الساحل الشرقي.",
    "cap.anis":           "أنيس",
    "fruits.daniah-name": "دانية",
    "fruits.daniah-desc": "الوسطى — مهندسة برمجيات، خريجة جامعة كولورادو دنفر، وعلى أعتاب الزواج. كانت القوة الهادئة التي أبقت أنيس وأنا على المسار الصحيح. أنتِ من زرعت ذلك فيها.",
    "cap.daniah":         "دانية",
    "fruits.malik-name":  "مالك",
    "fruits.malik-desc":  "الأكبر — مهندس برمجيات يبني شيئاً في تكساس. لا يزال يلاحق ما طالما أخبرتِه بأنه يستحق الملاحقة: عمل يستطيع أن يسمّيه ملكه وحده.",
    "cap.malik":          "مالك",
    "fruits.body1":       "ثلاثة أبناء. ثلاث شهادات. ثلاثة مسارات شكّلتِها بيديكِ. حين تعثّرت الأمور — علاقات، وثقة، واتجاه — كنتِ أنتِ من نعود إليه. ليس لأنكِ تملكين الإجابات، بل لأنكِ كنتِ ثابتةً حين لم يكن شيء آخر ثابتاً. ولم تطلبي شيئاً في المقابل.",
    "fruits.body2":       "لا يزال الناس يقولون لي: بيتكِ معروف. ليس بما فيه، بل بما يعطيه. أنتِ من صنعت ذلك.",

    "apart.tag":          "هذه السنة",
    "apart.title":        "رغم البُعد.",
    "cap.with-love":      "بكل الحب",
    "cap.always":         "دائماً",
    "apart.body1":        "كنت أعرف دائماً أن بيننا خلافاتنا. ما لم أكن أعرفه — ما بدأت أدركه فقط بعد أن غادرت — هو كمّ ما كنتِ تحملينه كل يوم دون أن تجعليني أشعر بثقله.",
    "apart.body2":        "هذا أول عيد أمّ نقضيه بعيدين. كنت أراكِ لا تُقهر. وما زلت — لكن بفهم مختلف الآن. الآن أدرك ما كلّفكِ ذلك. أنيس وأنا نفكّر فيكِ كل يوم.",
    "apart.body3":        "أشعر بغيابكِ في الأشياء الصغيرة. في صمت الصباح حين لا يكون الطعام جاهزاً على الطاولة. في يومٍ صعب حين تكون من تعرفني أكثر من أي أحد على بُعد ثلاث ولايات. كنتِ في كل مكان من تلك الحياة التي اعتبرتُها مسلّماً بها.",
    "apart.quote":        "\u201cفي كل فصل، يا أمي — نحبكِ. أسأل الله أن يبارك كل كفاحٍ، وكل دمعةٍ ذُرفت في خلوة، وكل تضحيةٍ قدَّمتِها دون أن تطلبي من أحد أن يراها.\u201d",

    "chapter.tag":        "نظرة للأمام",
    "chapter.title":      "مجرد فصل.",
    "cap.until-then":     "حتى نلتقي",
    "chapter.body1":      "إن شاء الله، يا أمي — هذا مجرد فصل. وليس الكتاب كله.",
    "chapter.body2":      "سيتخرّج أنيس ويعود. وسأعود أنا — بعد أن أبني شيئاً أستطيع أن أقف خلفه. وسنكون في نفس المدينة مجدداً. حول نفس الطاولة.",
    "chapter.body3":      "حتى ذلك الحين، تمسّكي. كنتِ دائماً أثبت شخص في الغرفة، حتى حين لم يكن أحد يراكِ. هذا لم يتغيّر. إنه فقط يُطلب منه أن يُثبت نفسه من جديد.",
    "chapter.love":       "عيد أمّ سعيد، يا أمي.<br/>أحبكِ.",
    "chapter.sig":        "— مالك",

    "collage.tag":        "بكل محبتنا",
    "collage.title":      "دائماً وإلى الأبد.",
    "cap.a-moment":       "لحظة",
    "cap.a-memory":       "ذكرى",
    "cap.a-lifetime":     "عمر بأكمله",

    "footer.title":       "عيد أمّ مبارك",
    "footer.sub":         "صنعه أكبر أبنائكِ بكل ما عنده.",
    "footer.arabic":      "كل عام وأنتِ بخير يا أمي ❤️",
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

  document.getElementById('btn-en').addEventListener('click', () => { selectedLang = "en"; startBgm(); startLoading('en'); });
  document.getElementById('btn-ar').addEventListener('click', () => { selectedLang = "ar"; startBgm(); startLoading('ar'); });
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
    “hero.tag”:           “A Letter”,
    “hero.title”:         “Dear Mama.”,
    “hero.sub”:           “To the woman who traded everything she knew<br class=\”hide-mobile\”/> for the chance to give us everything she had.”,
    “ui.tap”:             “Tap to add”,
    “ui.scroll”:          “Scroll”,
    “cap.mama-me”:        “Mama & Me”,

    “sac.tag”:            “The Beginning”,
    “sac.title”:          “From Libya, With Everything.”,
    “sac.body1”:          “You left a country that held everything you were — your family, your streets, your language — and arrived somewhere that held nothing. No recognition. No debt owed to you. You began again. Not because it was easy. Because we needed you to.”,
    “sac.body2”:          “Most people will never understand what that costs. Not the moving, not the language — but the daily act of building a life in soil that isn’t yours, for children who were too young to know what you were giving up.”,
    “sac.body3”:          “What you built is real. And it came from nothing the world gave you.”,
    “sac.quote”:          “”She didn’t raise a family. She built one — from faith, from will, and from a love so steady it never needed to announce itself.””,

    “fruits.tag”:         “Your Legacy”,
    “fruits.title”:       “Look What You Built.”,
    “fruits.intro”:       “Whatever your health was carrying, however far you were from your own family — the meals were made. The house was warm. Anyone who walked through that door left feeling like they belonged. You never stopped being our mother, not for a single day.”,
    “fruits.anis-name”:   “Anis”,
    “fruits.anis-desc”:   “Your youngest — studying Engineering at Brown University. The kid who used to knock on my door just to have someone around is now building something of his own on the East Coast.”,
    “cap.anis”:           “Anis”,
    “fruits.daniah-name”: “Daniah”,
    “fruits.daniah-desc”: “Your middle — CU Denver Engineering graduate, now a Software Engineer, and soon to be married. She was the quiet force that kept Anis and me from losing our way. You raised that in her.”,
    “cap.daniah”:         “Daniah”,
    “fruits.malik-name”:  “Malik”,
    “fruits.malik-desc”:  “Your oldest — a Software Engineer building something in Texas. Still chasing the thing you always told him was worth chasing: work he could call entirely his own.”,
    “cap.malik”:          “Malik”,
    “fruits.body1”:       “Three kids. Three degrees. Three lives shaped entirely by what you gave. When things fell apart — relationships, confidence, direction — you were the one we came back to. Not because you had the answers, but because you were steady when nothing else was. You never asked for anything in return.”,
    “fruits.body2”:       “People still tell me: your home is known. Not for what it has, but for what it gives. You made that.”,

    “apart.tag”:          “This Year”,
    “apart.title”:        “Though Miles Apart.”,
    “cap.with-love”:      “With Love”,
    “cap.always”:         “Always”,
    “apart.body1”:        “I always knew we had our differences. What I didn’t know — what I only began to understand after leaving — is how much you were carrying every single day without ever letting me feel the weight of it.”,
    “apart.body2”:        “This is the first Mother’s Day we spend apart. I used to think of you as invincible. I still do — but differently now. Now I understand what that invincibility actually cost you. Anis and I think of you every day.”,
    “apart.body3”:        “I feel your absence in the small things. In a quiet morning with no food already on the table. In a hard day when the person who knows me best is three states away. You were everywhere in the life I took for granted.”,
    “apart.quote”:        “”In every season, Mama — we love you. May Allah bless every struggle, every quiet tear, and every sacrifice you made for us without ever asking to be seen.””,

    “chapter.tag”:        “Looking Forward”,
    “chapter.title”:      “Just A Chapter.”,
    “cap.until-then”:     “Until Then”,
    “chapter.body1”:      “Inshallah, Mama — this is just a chapter. Not the whole book.”,
    “chapter.body2”:      “Anis will finish and come home. I will come back — after I’ve built something I can stand behind. And we’ll be in the same city again. Around the same table.”,
    “chapter.body3”:      “Until then, hold on. You have always been the steadiest person in the room, even when no one was watching. That hasn’t changed. It’s just being asked to prove itself again.”,
    “chapter.love”:       “Happy Mother’s Day, Mama.<br/>I love you.”,
    “chapter.sig”:        “— Malik”,

    “collage.tag”:        “With All Our Love”,
    “collage.title”:      “Always & Forever.”,
    “cap.a-moment”:       “A Moment”,
    “cap.a-memory”:       “A Memory”,
    “cap.a-lifetime”:     “A Lifetime”,

    “footer.title”:       “Happy Mother’s Day”,
    “footer.sub”:         “Built by your oldest, with everything he had.”,
    “footer.arabic”:      “كل عام وأنتِ بخير يا أمي ❤️”,
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

/* Upload to Vercel Blob via serverless function, then update manifest */
async function uploadAndPersist(file, label, objectUrl) {
  try {
    const dataUrl = await compressToDataUrl(file);

    /* Step 1 — save to IndexedDB immediately (same-device reload guaranteed) */
    await idbSave(label, dataUrl);

    /* Step 2 — upload via serverless function to Vercel Blob */
    const fname = `md-photo-${label.replace(/\s+/g, '-')}-${Date.now()}.jpg`;
    const res   = await fetch('/api/md-upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl, filename: fname }),
    });
    if (!res.ok) throw new Error(`upload ${res.status}`);
    const data = await res.json();
    if (!data.url) throw new Error('no url returned');

    /* Step 3 — swap display + IDB to permanent CDN URL */
    URL.revokeObjectURL(objectUrl);
    const slot = document.querySelector(`.photo-slot[data-label="${CSS.escape(label)}"]`);
    const img  = slot?.querySelector('.slot-photo');
    if (img) img.src = data.url;
    await idbSave(label, data.url);

    /* Step 4 — add to in-memory map and save complete manifest */
    uploadedPhotos[label] = data.url;
    const saveRes = await fetch('/api/md-save-photos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photos: uploadedPhotos }),
    });
    if (!saveRes.ok) throw new Error(`save-manifest ${saveRes.status}`);
  } catch (err) {
    console.error('[md] uploadAndPersist failed:', err.message);
    /* photo still visible this session via objectUrl; IndexedDB has dataUrl for reload */
  }
}

/* Auto-sync: if IndexedDB has dataUrls that never made it to Blob,
   upload them silently in the background on the next page load. */
async function autoSyncToBlob(cached) {
  const needSync = Object.entries(cached).filter(([, src]) => src.startsWith('data:'));
  if (!needSync.length) return;

  /* Seed from already-permanent IDB entries */
  for (const [label, src] of Object.entries(cached)) {
    if (!src.startsWith('data:') && !src.startsWith('blob:')) uploadedPhotos[label] = src;
  }

  await Promise.all(needSync.map(async ([label, dataUrl]) => {
    try {
      const fname = `md-photo-${label.replace(/\s+/g, '-')}-${Date.now()}.jpg`;
      const res   = await fetch('/api/md-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl, filename: fname }),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (!data.url) return;

      const slot = document.querySelector(`.photo-slot[data-label="${CSS.escape(label)}"]`);
      const img  = slot?.querySelector('.slot-photo');
      if (img) img.src = data.url;
      await idbSave(label, data.url);
      uploadedPhotos[label] = data.url;
    } catch (_) {}
  }));

  if (Object.keys(uploadedPhotos).length) {
    await fetch('/api/md-save-photos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photos: uploadedPhotos }),
    }).catch(() => {});
  }
}

function initPhotoSlots() {
  /* 1. Restore from IndexedDB + auto-push any unsynced photos to Blob */
  idbLoadAll().then(cached => {
    document.querySelectorAll('.photo-slot').forEach(slot => {
      const src = cached[slot.dataset.label || ''];
      if (src) applyPhoto(slot, src);
    });
    autoSyncToBlob(cached); /* silent background sync — no re-upload needed */
  });

  /* 2. Reuse the already-in-flight prefetch (started on page load) */
  _photosPrefetchPromise.then(photos => {
    if (!photos) return;
    document.querySelectorAll('.photo-slot').forEach(slot => {
      const url = photos[slot.dataset.label];
      if (!url) return;
      applyPhoto(slot, url);
      idbSave(slot.dataset.label, url);
    });
  }).catch(err => console.error('[md] load-photos failed:', err.message));

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

    /* Drag-and-drop upload */
    slot.addEventListener('dragover', e => {
      if (slot.classList.contains('has-photo')) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      slot.classList.add('drag-over');
    });
    slot.addEventListener('dragleave', e => {
      if (!slot.contains(e.relatedTarget)) slot.classList.remove('drag-over');
    });
    slot.addEventListener('drop', e => {
      e.preventDefault();
      slot.classList.remove('drag-over');
      if (slot.classList.contains('has-photo')) return;
      const file = e.dataTransfer.files[0];
      if (!file || !file.type.startsWith('image/')) return;
      const label     = slot.dataset.label || slot.className;
      const objectUrl = URL.createObjectURL(file);
      applyPhoto(slot, objectUrl);
      uploadAndPersist(file, label, objectUrl);
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

/* ─── BACKGROUND MUSIC ─────────────────────────────────────────────────── */
function startBgm() {
  const bgm = document.getElementById('bgm');
  if (!bgm) return;

  bgm.volume = 0;
  bgm.play().catch(() => {});

  // Fade in over 3 seconds
  let vol = 0;
  const fadeIn = setInterval(() => {
    vol = Math.min(vol + 0.02, 0.35);
    bgm.volume = vol;
    if (vol >= 0.35) clearInterval(fadeIn);
  }, 60);

  // Inject mute toggle button
  const btn = document.createElement('button');
  btn.id = 'bgm-toggle';
  btn.setAttribute('aria-label', 'Toggle music');
  btn.innerHTML = '♪';
  btn.addEventListener('click', () => {
    bgm.muted = !bgm.muted;
    btn.classList.toggle('muted', bgm.muted);
    btn.innerHTML = bgm.muted ? '♪̶' : '♪';
  });
  document.body.appendChild(btn);
}
