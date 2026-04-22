'use strict';

/* ══════════════════════════════════════════════
   SHARE PAGE GENERATOR
   Bakes photos into a self-contained HTML file
   so Ms. Lopes sees everything without upload UI
══════════════════════════════════════════════ */
function updateShareBtn() {
  const wrap = document.getElementById('share-btn-wrap');
  if (!wrap) return;
  const hasPhotos = Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i))
    .some(k => k && k.startsWith('photo__'));
  wrap.classList.toggle('visible', hasPhotos);
}

async function generateSharePage() {
  const btn = document.getElementById('share-btn');
  const txt = document.querySelector('.share-text');
  if (btn) { btn.disabled = true; if (txt) txt.textContent = 'Generating…'; }

  /* Snapshot body HTML — uploaded photos are already embedded as <img src="data:..."> */
  let bodyHtml = document.body.innerHTML;

  /* Strip animation 'in' classes so scroll reveals replay for Ms. Lopes */
  bodyHtml = bodyHtml.replace(/(\bclass="[^"]*)\bin\b\s?/g, '$1');

  /* Remove edit-only elements */
  bodyHtml = bodyHtml
    .replace(/\s*<div[^>]+id="cur-dot"[^>]*><\/div>/g, '')
    .replace(/\s*<div[^>]+id="cur-ring"[^>]*><\/div>/g, '')
    .replace(/\s*<div[^>]+id="share-btn-wrap"[^>]*>[\s\S]*?<\/div>\s*/g, '')
    .replace(/\s*<script src="script\.js"><\/script>/g, '');

  /* Fetch and inline the CSS */
  let css = '';
  try { const r = await fetch('style.css'); css = await r.text(); } catch (_) {}

  /* View-only overrides */
  const viewCss = `
    #cur-dot,#cur-ring{display:none!important}
    body{cursor:default!important}
    .photo-slot{cursor:default!important;pointer-events:none!important}
    .photo-slot:not(.has-photo){display:none!important}
  `;

  /* Minimal self-contained script for the share page */
  const viewScript = `
'use strict';
function slotRot(l){const a=[-2.1,1.8,-1.2,2.4,-0.8,1.5,-2.6,0.9,-1.7,2.0];let h=0;for(let i=0;i<l.length;i++)h=(h*31+l.charCodeAt(i))>>>0;return a[h%a.length];}
document.querySelectorAll('.photo-slot.has-photo').forEach(s=>{
  const rot=slotRot(s.dataset.label||'');
  s.style.setProperty('--rot',rot+'deg');
  s.style.transform='rotate('+rot+'deg)';
  s.addEventListener('mousemove',e=>{const r=s.getBoundingClientRect(),dx=(e.clientX-r.left-r.width/2)/(r.width/2),dy=(e.clientY-r.top-r.height/2)/(r.height/2);s.style.transform='rotate(0deg) translateY(-8px) scale(1.03) rotateY('+(dx*5)+'deg) rotateX('+(-dy*5)+'deg)';});
  s.addEventListener('mouseleave',()=>{s.style.transform='rotate('+rot+'deg)';});
});
const obs=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');obs.unobserve(e.target);}});},{threshold:0.05});
document.querySelectorAll('.reveal-up,.reveal-left,.reveal-right,.reveal-heading,.reveal-scale').forEach(el=>obs.observe(el));
setTimeout(()=>{document.querySelectorAll('#hero .reveal-heading,#hero .reveal-up,#hero .reveal-scale').forEach(el=>el.classList.add('in'));},100);
const CHR='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function scramble(el){if(el.dataset.scrambled)return;el.dataset.scrambled='1';const orig=el.textContent.trim();let it=0;const iv=setInterval(()=>{el.textContent=orig.split('').map((c,i)=>{if(c===' ')return ' ';if(i<it)return orig[i];return CHR[Math.floor(Math.random()*CHR.length)];}).join('');it+=0.4;if(it>=orig.length){el.textContent=orig;clearInterval(iv);}},28);}
const sobs=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){scramble(e.target);sobs.unobserve(e.target);}});},{threshold:0.3});
document.querySelectorAll('.scramble').forEach(el=>sobs.observe(el));
const bar=document.getElementById('progress-bar'),nav=document.getElementById('nav');
window.addEventListener('scroll',()=>{const p=window.scrollY/(document.documentElement.scrollHeight-window.innerHeight)*100;if(bar)bar.style.width=Math.min(p,100)+'%';if(nav)nav.classList.toggle('scrolled',window.scrollY>60);},{passive:true});
const sdots=document.querySelectorAll('.side-dot'),sids=['hero','family','background','sports','college','switch','exotics'];
function upNav(){let c='hero';sids.forEach(id=>{const el=document.getElementById(id);if(el&&window.scrollY>=el.offsetTop-window.innerHeight/2)c=id;});sdots.forEach(d=>d.classList.toggle('active',d.getAttribute('href')==='#'+c));}
window.addEventListener('scroll',upNav,{passive:true});upNav();
const bgt=document.querySelector('.hero-bg-text'),pw=document.querySelector('.hero-photo-wrap');
window.addEventListener('scroll',()=>{const y=window.scrollY;if(bgt)bgt.style.transform='translateX('+(y*.18)+'px) translateY('+(y*.12)+'px)';if(pw)pw.style.transform='translateY('+(y*.14)+'px)';},{passive:true});
document.querySelectorAll('.stag').forEach((t,i)=>{t.style.transitionDelay=i*.07+'s';});
  `.trim();

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Malik Elgomati \u2014 For Ms. Lopes</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600&family=Dancing+Script:wght@500;700&display=swap" rel="stylesheet">
  <style>${css}</style>
  <style>${viewCss}</style>
</head>
<body>${bodyHtml}
<script>${viewScript}<\/script>
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'share.html';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);

  if (btn) {
    if (txt) txt.textContent = '✓ Downloaded!';
    setTimeout(() => { btn.disabled = false; if (txt) txt.textContent = 'Create Share Page'; }, 3500);
  }
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
const secIds   = ['hero', 'family', 'background', 'sports', 'college', 'switch', 'exotics'];

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

document.querySelectorAll('.photo-slot').forEach(slot => {
  const key   = 'photo__' + (slot.dataset.label || slot.className);
  const saved = localStorage.getItem(key);
  if (saved) applyPhoto(slot, saved);
  updateShareBtn();

  slot.addEventListener('click', () => {
    const inp    = document.createElement('input');
    inp.type     = 'file';
    inp.accept   = 'image/*';
    inp.onchange = e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        applyPhoto(slot, ev.target.result);
        try { localStorage.setItem(key, ev.target.result); } catch (_) {}
        updateShareBtn();
      };
      reader.readAsDataURL(file);
    };
    inp.click();
  });
});

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
