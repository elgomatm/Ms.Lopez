'use strict';

/* ══════════════════════════════════════════════
   CURSOR
══════════════════════════════════════════════ */
const dot  = document.getElementById('cur-dot');
const ring = document.getElementById('cur-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

/* Orb parallax state */
const heroOrbs = document.querySelectorAll('.hero-orb');
let orbTx = 0, orbTy = 0, orbCx = 0, orbCy = 0, orbT = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  document.documentElement.style.setProperty('--spot-x', e.clientX + 'px');
  document.documentElement.style.setProperty('--spot-y', e.clientY + 'px');
  orbTx = (e.clientX / window.innerWidth  - 0.5) * 70;
  orbTy = (e.clientY / window.innerHeight - 0.5) * 50;
});

/* Click ripple on cursor */
document.addEventListener('mousedown', () => {
  dot.classList.add('clicked'); ring.classList.add('clicked');
});
document.addEventListener('mouseup', () => {
  dot.classList.remove('clicked'); ring.classList.remove('clicked');
});

(function tickCursor() {
  requestAnimationFrame(tickCursor);
  rx += (mx - rx) * 0.13;
  ry += (my - ry) * 0.13;
  dot.style.left  = mx + 'px'; dot.style.top  = my + 'px';
  ring.style.left = rx + 'px'; ring.style.top = ry + 'px';

  /* Orb: lerp toward mouse + sinusoidal drift */
  orbT  += 0.004;
  orbCx += (orbTx - orbCx) * 0.035;
  orbCy += (orbTy - orbCy) * 0.035;
  heroOrbs.forEach((orb, i) => {
    const d     = (i + 1) * 0.38;
    const driftX = Math.sin(orbT + i * 2.3) * 28;
    const driftY = Math.cos(orbT * 0.8 + i * 1.7) * 22;
    orb.style.transform = `translate(${orbCx * d + driftX}px, ${orbCy * d + driftY}px)`;
  });
})();

/* ══════════════════════════════════════════════
   PROGRESS BAR + TOP NAV
══════════════════════════════════════════════ */
const bar = document.getElementById('progress-bar');
const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
  bar.style.width = Math.min(pct, 100) + '%';
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ══════════════════════════════════════════════
   SIDE NAV — active dot tracking
══════════════════════════════════════════════ */
const sideDots = document.querySelectorAll('.side-dot');
const secIds   = ['hero', 'family', 'background', 'sports', 'hobbies', 'college', 'switch', 'exotics'];

function updateSideNav() {
  let currentId = 'hero';
  for (const id of secIds) {
    const el = document.getElementById(id);
    if (!el) continue;
    if (window.scrollY >= el.offsetTop - window.innerHeight / 2) currentId = id;
  }
  sideDots.forEach(dot => {
    const href = dot.getAttribute('href').replace('#', '');
    dot.classList.toggle('active', href === currentId);
  });
}
window.addEventListener('scroll', updateSideNav, { passive: true });
updateSideNav();

/* ══════════════════════════════════════════════
   REVEAL ON SCROLL (IntersectionObserver)
══════════════════════════════════════════════ */
const revealClasses = ['.reveal-up', '.reveal-left', '.reveal-right', '.reveal-heading', '.reveal-scale'];

/* Typewriter — writes heading text out character by character */
function typewrite(el) {
  if (el.dataset.typed) return;
  el.dataset.typed = '1';
  const text  = el.textContent.trim();
  const delay = (parseFloat(el.style.getPropertyValue('--d')) || 0) * 1000;
  el.textContent = '';
  el.style.opacity = '1';
  el.style.pointerEvents = 'auto';
  setTimeout(() => {
    let i = 0;
    const tick = setInterval(() => {
      el.textContent = text.slice(0, ++i);
      if (i >= text.length) clearInterval(tick);
    }, 52);
  }, delay);
}

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      if (e.target.classList.contains('scramble')) typewrite(e.target);
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.05 });

document.querySelectorAll(revealClasses.join(', '))
  .forEach(el => revealObserver.observe(el));

/* Hero fires immediately */
setTimeout(() => {
  document.querySelectorAll('#hero .reveal-heading, #hero .reveal-up, #hero .reveal-scale')
    .forEach(el => el.classList.add('in'));
}, 120);

/* ══════════════════════════════════════════════
   PARALLAX — hero bg text + photo wrap
══════════════════════════════════════════════ */
const heroBgText    = document.querySelector('.hero-bg-text');
const heroPhotoWrap = document.querySelector('.hero-photo-wrap');

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (heroBgText)    heroBgText.style.transform    = `translateX(${y * 0.18}px) translateY(${y * 0.12}px)`;
  if (heroPhotoWrap) heroPhotoWrap.style.transform = `translateY(${y * 0.14}px)`;
  document.querySelectorAll('.sec-ghost').forEach(ghost => {
    const section = ghost.closest('section');
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const mid  = rect.top + rect.height / 2 - window.innerHeight / 2;
    ghost.style.transform = `translateY(${mid * -0.07}px)`;
  });
}, { passive: true });

/* ══════════════════════════════════════════════
   MAGNETIC NAV NAME
══════════════════════════════════════════════ */
const navName = document.querySelector('.nav-name');
if (navName) {
  navName.addEventListener('mousemove', e => {
    const r  = navName.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width  / 2) * 0.2;
    const dy = (e.clientY - r.top  - r.height / 2) * 0.2;
    navName.style.transform = `translate(${dx}px, ${dy}px)`;
  });
  navName.addEventListener('mouseleave', () => { navName.style.transform = ''; });
}

/* ══════════════════════════════════════════════
   STAGGER sport tags on entry
══════════════════════════════════════════════ */
document.querySelectorAll('.stag').forEach((t, i) => {
  t.style.transitionDelay = `${i * 0.07}s`;
});

/* ══════════════════════════════════════════════
   PHOTO SLOT — click to upload + localStorage
══════════════════════════════════════════════ */

/* Deterministic rotation per slot label (consistent across reloads) */
function slotRotation(label) {
  const angles = [-2.1, 1.8, -1.2, 2.4, -0.8, 1.5, -2.6, 0.9, -1.7, 2.0];
  let hash = 0;
  for (let i = 0; i < label.length; i++) hash = (hash * 31 + label.charCodeAt(i)) >>> 0;
  return angles[hash % angles.length];
}

function applyPhoto(slot, dataUrl) {
  slot.querySelector('.slot-icon')?.remove();
  slot.querySelector('.slot-label')?.remove();
  slot.classList.add('has-photo');

  /* polaroid tilt — unique angle per slot */
  const rot = slotRotation(slot.dataset.label || '');
  slot.style.setProperty('--rot', rot + 'deg');

  /* use <img> so the photo keeps its natural aspect ratio */
  let img = slot.querySelector('.slot-photo');
  if (!img) {
    img = document.createElement('img');
    img.className = 'slot-photo';
    img.alt = slot.dataset.label || '';
    slot.appendChild(img);
  }
  img.src = dataUrl;
}

const VIEW_MODE = window.VIEW_MODE === true;

if (VIEW_MODE) {
  /* ── View-only: photos already in DOM, just lock everything down ── */
  document.body.classList.add('view-mode');
} else {
  /* ── Edit mode: restore from localStorage + wire upload clicks ── */

  /* Compress file → returns data URL (used for upload only, never set as img.src) */
  function compressToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const tmp = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(tmp);
        try {
          const MAX = 1200;
          let w = img.naturalWidth, h = img.naturalHeight;
          if (w > MAX || h > MAX) {
            if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
            else        { w = Math.round(w * MAX / h); h = MAX; }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          const TARGET = 3.5 * 1024 * 1024;
          let q = 0.82, out = canvas.toDataURL('image/jpeg', q);
          while (out.length > TARGET && q > 0.25) {
            q -= 0.08;
            out = canvas.toDataURL('image/jpeg', Math.max(q, 0.25));
          }
          resolve(out);
        } catch (err) { reject(err); }
      };
      img.onerror = () => { URL.revokeObjectURL(tmp); reject(new Error('load')); };
      img.src = tmp;
    });
  }

  /* Upload file to Vercel Blob, then swap object URL → permanent blob URL in slot */
  async function uploadAndPersist(file, slot, objectUrl) {
    const label = slot.dataset.label || slot.className;
    try {
      const dataUrl = await compressToDataUrl(file);
      const res  = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl, filename: `photo-${label}-${Date.now()}.jpg` })
      });
      const data = await res.json().catch(() => ({}));
      if (!data.url) return;

      /* Swap to permanent Vercel Blob URL — use slot directly (never re-query by label) */
      /* Do NOT revoke objectUrl first — set new src before browser can flash broken state */
      const im = slot.querySelector('.slot-photo');
      if (im) {
        im.src = data.url;
        /* Only revoke old objectUrl AFTER new src is set */
        URL.revokeObjectURL(objectUrl);
      }
      try { localStorage.setItem('photo__' + label, data.url); } catch (_) {}

      /* Rebuild + save server manifest */
      const manifest = {};
      document.querySelectorAll('.photo-slot.has-photo').forEach(sl => {
        const lbl  = sl.dataset.label || sl.className;
        const slIm = sl.querySelector('.slot-photo');
        if (slIm && slIm.src && slIm.src.startsWith('https://')) manifest[lbl] = slIm.src;
      });
      await fetch('/api/save-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photos: manifest })
      });
    } catch (_) { /* silent — photo still shows via object URL for this session */ }
  }

  /* ── Restore from localStorage — only accept permanent https:// blob URLs ── */
  document.querySelectorAll('.photo-slot').forEach(slot => {
    const key   = 'photo__' + (slot.dataset.label || slot.className);
    const saved = localStorage.getItem(key);
    if (!saved) return;
    if (saved.startsWith('https://')) {
      applyPhoto(slot, saved);
    } else {
      /* Stale data URL from an old session — purge it */
      try { localStorage.removeItem(key); } catch (_) {}
    }
  });

  /* Fetch server manifest in background — fills any slots not in localStorage
     and ensures photos survive deployments / browser-data clears              */
  fetch('/api/load-photos')
    .then(r => r.ok ? r.json() : { photos: {} })
    .then(({ photos }) => {
      if (!photos) return;
      document.querySelectorAll('.photo-slot').forEach(slot => {
        const label = slot.dataset.label || slot.className;
        const url   = photos[label];
        /* Only use real blob URLs — never data URLs from old sessions */
        if (!url || !url.startsWith('https://')) return;
        /* Never overwrite a slot that already has a fresh photo showing */
        const existing = slot.querySelector('.slot-photo');
        if (existing && existing.src) return;
        applyPhoto(slot, url);
        try { localStorage.setItem('photo__' + label, url); } catch (_) {}
      });
    })
    .catch(() => { /* silently ignore — localStorage already applied */ });

  /* ── Wire upload click handlers ── */
  document.querySelectorAll('.photo-slot').forEach(slot => {
    slot.addEventListener('click', () => {
      const inp = document.createElement('input');
      inp.type  = 'file';
      inp.accept = 'image/*';
      inp.style.cssText = 'position:fixed;top:-999px;left:-999px;opacity:0;';
      document.body.appendChild(inp);   /* must be in DOM for iOS Safari */

      inp.addEventListener('change', e => {
        try { document.body.removeChild(inp); } catch (_) {}
        const file = e.target.files[0];
        if (!file) return;
        /* createObjectURL has no size limit — shows any photo instantly */
        const objectUrl = URL.createObjectURL(file);
        applyPhoto(slot, objectUrl);
        /* Compress in background → upload to Vercel Blob → swap objectUrl to permanent URL */
        uploadAndPersist(file, slot, objectUrl);
      });

      inp.click();
    });
  });
}

/* ══════════════════════════════════════════════
   TILT effect on filled photo slots
══════════════════════════════════════════════ */
document.querySelectorAll('.photo-slot').forEach(slot => {
  slot.addEventListener('mousemove', e => {
    if (!slot.classList.contains('has-photo')) return;
    const r  = slot.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
    const dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
    slot.style.transform =
      `rotate(0deg) translateY(-8px) scale(1.03) rotateY(${dx * 5}deg) rotateX(${-dy * 5}deg)`;
  });
  slot.addEventListener('mouseleave', () => {
    if (!slot.classList.contains('has-photo')) return;
    const rot = slot.style.getPropertyValue('--rot') || '-1deg';
    slot.style.transform = `rotate(${rot})`;
  });
});

/* ══════════════════════════════════════════════
   STAT COUNTERS — count up on entry
══════════════════════════════════════════════ */
function animateCount(el) {
  if (el.dataset.counted) return;
  el.dataset.counted = '1';
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || '';
  if (!el.dataset.count) return;
  const duration = 1500;
  const start    = performance.now();
  const tick = now => {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(eased * target) + suffix;
    if (p < 1) {
      requestAnimationFrame(tick);
    } else {
      el.classList.add('done'); /* trigger glow */
    }
  };
  requestAnimationFrame(tick);
}

const statObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateCount(e.target);
      statObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num[data-count]').forEach(el => statObserver.observe(el));

/* ══════════════════════════════════════════════
   MAGNETIC LINK CARDS
══════════════════════════════════════════════ */
document.querySelectorAll('.link-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r  = card.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width  / 2) * 0.12;
    const dy = (e.clientY - r.top  - r.height / 2) * 0.12;
    card.style.transform = `translate(${dx}px, ${dy}px) scale(1.02)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

/* ══════════════════════════════════════════════
   MAGNETIC STAT BOXES
══════════════════════════════════════════════ */
document.querySelectorAll('.stat').forEach(stat => {
  stat.addEventListener('mousemove', e => {
    const r  = stat.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width  / 2) * 0.08;
    const dy = (e.clientY - r.top  - r.height / 2) * 0.08;
    stat.style.transform = `translate(${dx}px, ${dy}px)`;
  });
  stat.addEventListener('mouseleave', () => { stat.style.transform = ''; });
});
