'use strict';

/* ══════════════════════════════════════════════
   SHARE PAGE GENERATOR
   Builds a self-contained HTML snapshot and
   uploads it to Vercel Blob via /api/share —
   returns a real, permanent shareable URL.
══════════════════════════════════════════════ */
function updateShareBtn() {
  const wrap = document.getElementById('share-btn-wrap');
  if (!wrap) return;
  const hasPhotos = Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i))
    .some(k => k && k.startsWith('photo__'));
  wrap.classList.toggle('visible', hasPhotos);
}

async function generateSharePage() {
  const btn  = document.getElementById('share-btn');
  const txt  = document.querySelector('.share-text');
  const hint = document.querySelector('.share-hint');
  if (btn) { btn.disabled = true; if (txt) txt.textContent = 'Building…'; }

  const hasPhotos = Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i))
    .some(k => k && k.startsWith('photo__'));
  if (!hasPhotos) {
    alert('Upload some photos first!');
    if (btn) { btn.disabled = false; if (txt) txt.textContent = 'Get Share Link'; }
    return;
  }

  /* ── 1. Snapshot DOM ── */
  let bodyHtml = document.body.innerHTML;
  bodyHtml = bodyHtml.replace(/(\bclass="[^"]*)\bin\b\s*/g, '$1');
  const shareDoc = new DOMParser().parseFromString(
    `<!DOCTYPE html><html><body>${bodyHtml}</body></html>`, 'text/html'
  );
  shareDoc.querySelectorAll('.photo-slot:not(.has-photo)').forEach(el => el.remove());
  ['cur-dot', 'cur-ring', 'share-btn-wrap'].forEach(id => shareDoc.getElementById(id)?.remove());
  shareDoc.querySelector('script[src="script.js"]')?.remove();
  bodyHtml = shareDoc.body.innerHTML;

  /* ── 2. Inline CSS + JS so the file is 100% self-contained ── */
  if (txt) txt.textContent = 'Packaging…';
  let cssText = '', jsText = '';
  try {
    const [cssRes, jsRes] = await Promise.all([fetch('./style.css'), fetch('./script.js')]);
    cssText = await cssRes.text();
    jsText  = await jsRes.text();
  } catch (e) { console.warn('Asset fetch failed — falling back to linked files', e); }

  const fullHtml = cssText
    ? `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Malik Elgomati \u2014 For Ms. Lopes</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600&family=Dancing+Script:wght@500;700&display=swap" rel="stylesheet">
  <style>${cssText}<\/style>
  <script>window.VIEW_MODE = true;<\/script>
</head>
<body>${bodyHtml}
<script>${jsText}<\/script>
</body>
</html>`
    : `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Malik Elgomati \u2014 For Ms. Lopes</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600&family=Dancing+Script:wght@500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
  <script>window.VIEW_MODE = true;<\/script>
</head>
<body>${bodyHtml}
<script src="script.js"><\/script>
</body>
</html>`;

  /* ── 3. Upload via /api/share (Vercel Blob, server-side) ── */
  if (txt) txt.textContent = 'Uploading…';

  let shareUrl;
  try {
    const apiRes = await fetch('/api/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ html: fullHtml })
    });

    const data = await apiRes.json().catch(() => ({}));

    if (!apiRes.ok) {
      if (data.setup) {
        /* Blob storage not yet connected — show one-time setup instructions */
        if (hint) {
          hint.innerHTML =
            '<strong style="color:#fff">One-time setup needed (30 sec):</strong><br>' +
            '1. Open your <a href="https://vercel.com/dashboard" target="_blank" style="color:#fff">Vercel dashboard</a><br>' +
            '2. Click your project → <strong>Storage</strong> tab<br>' +
            '3. Create Database → <strong>Blob</strong> → Connect to project<br>' +
            '4. Come back here and click the button again ✓';
        }
      } else {
        alert('Upload error: ' + (data.error || apiRes.status));
      }
      if (btn) { btn.disabled = false; if (txt) txt.textContent = 'Get Share Link'; }
      return;
    }

    shareUrl = data.url;
  } catch (err) {
    /* /api/share not found — probably running on localhost, not Vercel */
    alert('This button only works on the live Vercel site.\nOpen the Vercel URL and try there.');
    if (btn) { btn.disabled = false; if (txt) txt.textContent = 'Get Share Link'; }
    return;
  }

  /* ── 4. Copy and show the link ── */
  try { await navigator.clipboard.writeText(shareUrl); } catch (_) {}

  if (txt) txt.textContent = '✓ Link copied!';
  if (hint) {
    hint.innerHTML =
      `<a href="${shareUrl}" target="_blank" style="color:inherit;font-weight:600;word-break:break-all">${shareUrl}</a>` +
      `<br><span style="opacity:0.7;font-size:0.78rem">Copied — send it to Ms. Lopes ✓</span>`;
  }

  setTimeout(() => {
    if (btn) { btn.disabled = false; if (txt) txt.textContent = 'Get Share Link'; }
    if (hint) hint.textContent = 'Click to generate a fresh shareable link';
  }, 12000);
}

/* ══════════════════════════════════════════════
   CURSOR
══════════════════════════════════════════════ */
const dot  = document.getElementById('cur-dot');
const ring = document.getElementById('cur-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

(function tickCursor() {
  requestAnimationFrame(tickCursor);
  rx += (mx - rx) * 0.13;
  ry += (my - ry) * 0.13;
  dot.style.left  = mx + 'px'; dot.style.top  = my + 'px';
  ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
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

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      /* if it's a heading, scramble as the blur clears */
      if (e.target.classList.contains('scramble')) {
        setTimeout(() => scramble(e.target), 180);
      }
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.05 });

document.querySelectorAll(revealClasses.join(', '))
  .forEach(el => revealObserver.observe(el));

/* Hero fires immediately */
setTimeout(() => {
  document.querySelectorAll('#hero .reveal-heading, #hero .reveal-up, #hero .reveal-scale')
    .forEach(el => {
      el.classList.add('in');
      if (el.classList.contains('scramble')) scramble(el);
    });
}, 120);

/* ══════════════════════════════════════════════
   SCRAMBLE TEXT on section headings
══════════════════════════════════════════════ */
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function scramble(el) {
  if (el.dataset.scrambled) return;
  el.dataset.scrambled = '1';
  const original = el.textContent.trim();
  let iter = 0;
  const interval = setInterval(() => {
    el.textContent = original.split('').map((ch, i) => {
      if (ch === ' ') return ' ';
      if (i < iter)  return original[i];
      return CHARS[Math.floor(Math.random() * CHARS.length)];
    }).join('');
    iter += 0.4;
    if (iter >= original.length) {
      el.textContent = original;
      clearInterval(interval);
    }
  }, 28);
}

/* scramble is now triggered directly inside revealObserver above */

/* ══════════════════════════════════════════════
   PARALLAX — hero bg text + photo wrap
══════════════════════════════════════════════ */
const heroBgText    = document.querySelector('.hero-bg-text');
const heroPhotoWrap = document.querySelector('.hero-photo-wrap');

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (heroBgText)    heroBgText.style.transform    = `translateX(${y * 0.18}px) translateY(${y * 0.12}px)`;
  if (heroPhotoWrap) heroPhotoWrap.style.transform = `translateY(${y * 0.14}px)`;
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

  /* Compress image to max 1400px / JPEG 0.82 before storing */
  function compressImage(file, callback) {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const MAX = 1400;
      let w = img.naturalWidth, h = img.naturalHeight;
      if (w > MAX || h > MAX) {
        if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
        else        { w = Math.round(w * MAX / h); h = MAX; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      callback(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => { URL.revokeObjectURL(url); callback(null); };
    img.src = url;
  }

  document.querySelectorAll('.photo-slot').forEach(slot => {
    const key   = 'photo__' + (slot.dataset.label || slot.className);
    const saved = localStorage.getItem(key);
    if (saved) applyPhoto(slot, saved);
    updateShareBtn();

    slot.addEventListener('click', () => {
      const inp  = document.createElement('input');
      inp.type   = 'file';
      inp.accept = 'image/*';
      inp.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;
        compressImage(file, dataUrl => {
          if (!dataUrl) return;
          applyPhoto(slot, dataUrl);
          try { localStorage.setItem(key, dataUrl); } catch (_) {}
          updateShareBtn();
        });
      };
      inp.click();
    });
  });
}

/* ── Save all photos explicitly to localStorage ── */
function saveAllPhotos() {
  const btn = document.getElementById('save-btn');
  const txt = document.querySelector('.save-text');
  if (btn) { btn.disabled = true; if (txt) txt.textContent = 'Saving…'; }

  let saved = 0, failed = 0;
  document.querySelectorAll('.photo-slot.has-photo').forEach(slot => {
    const key = 'photo__' + (slot.dataset.label || slot.className);
    const img = slot.querySelector('.slot-photo');
    if (!img || !img.src || img.src === window.location.href) return;
    try { localStorage.setItem(key, img.src); saved++; }
    catch (_) { failed++; }
  });

  setTimeout(() => {
    if (btn) btn.disabled = false;
    if (txt) {
      txt.textContent = failed > 0
        ? `⚠ ${failed} too large — try smaller photos`
        : `✓ ${saved} photo${saved !== 1 ? 's' : ''} saved`;
      setTimeout(() => { if (txt) txt.textContent = 'Save Photos'; }, 3000);
    }
  }, 350);
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
