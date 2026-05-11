'use strict';

/* ════════════════════════════════════════════════
   md.js — Mother's Day Site
   Loading screen · Typewriter · Scroll reveals · Photo upload
════════════════════════════════════════════════ */

/* ─── LANGUAGE CONTENT ─── */
const LANG = {
  en: {
    dir: 'ltr',
    messages: [
      { p: 'Loading first child’s touches…',        s: '' },
      { p: 'Preparing all the love we could carry…',     s: '' },
      { p: 'Filling every moment with warmth…',          s: '' },
      { p: 'Almost ready, Mama…',                        s: '' },
      { p: '♡',                                           s: '' },
    ],
  },
  ar: {
    dir: 'rtl',
    messages: [
      { p: 'جاري تحميل لمسات طفلك الأول…',
        s: '(Loading your firstborn’s touches…)' },
      { p: 'نُحضّر كل الحب الذي تستحقينه…',
        s: '(Preparing all the love you deserve…)' },
      { p: 'نملأ كل لحظة بدفئك وعطائك…',
        s: '(Filling every moment with your warmth…)' },
      { p: 'كل شيء جاهز بكل محبّة، يا أمي…',
        s: '(Everything ready with all our love, Mama…)' },
      { p: '♡', s: '' },
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

  document.getElementById('btn-en').addEventListener('click', () => startLoading('en'));
  document.getElementById('btn-ar').addEventListener('click', () => startLoading('ar'));
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
