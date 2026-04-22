'use strict';

/* ── Custom cursor ── */
const dot  = document.getElementById('cur-dot');
const ring = document.getElementById('cur-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

(function tickCursor() {
  requestAnimationFrame(tickCursor);
  rx += (mx - rx) * 0.14;
  ry += (my - ry) * 0.14;
  dot.style.left  = mx + 'px'; dot.style.top  = my + 'px';
  ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
})();

/* ── Progress bar ── */
const bar = document.getElementById('progress-bar');
const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
  bar.style.width = Math.min(pct, 100) + '%';
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ── Reveal on scroll (IntersectionObserver) ── */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal-up, .reveal-line, .reveal-scale')
  .forEach(el => revealObserver.observe(el));

/* ── Hero line reveals fire immediately ── */
setTimeout(() => {
  document.querySelectorAll('.reveal-line').forEach(el => el.classList.add('in'));
  document.querySelectorAll('#hero .reveal-up, #hero .reveal-scale')
    .forEach(el => el.classList.add('in'));
}, 100);

/* ── Parallax on hero bg text ── */
const heroBg = document.querySelector('.hero-bg-text');
const heroPhotoWrap = document.querySelector('.hero-photo-wrap');

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (heroBg)       heroBg.style.transform       = `translateY(${y * 0.3}px)`;
  if (heroPhotoWrap) heroPhotoWrap.style.transform = `translateY(${y * 0.15}px)`;
}, { passive: true });

/* ── Magnetic hover on nav name ── */
const navName = document.querySelector('.nav-name');
if (navName) {
  navName.addEventListener('mousemove', e => {
    const r = navName.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width/2)  * 0.22;
    const dy = (e.clientY - r.top  - r.height/2) * 0.22;
    navName.style.transform = `translate(${dx}px, ${dy}px)`;
  });
  navName.addEventListener('mouseleave', () => { navName.style.transform = ''; });
}

/* ── Section active tracking (dot/line indicator could go here) ── */
const sections = document.querySelectorAll('section[data-sec]');
const secObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      document.querySelectorAll('.sec-ghost').forEach(g => g.style.opacity = '');
      const ghost = e.target.querySelector('.sec-ghost');
      if (ghost) ghost.style.opacity = '0.06';
    }
  });
}, { threshold: 0.4 });
sections.forEach(s => secObserver.observe(s));

/* ── Photo slot click-to-upload ── */
function applyPhoto(slot, dataUrl) {
  slot.style.backgroundImage    = `url(${dataUrl})`;
  slot.style.backgroundSize     = 'cover';
  slot.style.backgroundPosition = 'center';
  slot.classList.add('has-photo');
  slot.querySelector('.slot-icon')?.remove();
  slot.querySelector('.slot-label')?.remove();
}

document.querySelectorAll('.photo-slot').forEach(slot => {
  const key = 'photo__' + (slot.dataset.label || slot.dataset.slot || slot.className);
  const saved = localStorage.getItem(key);
  if (saved) applyPhoto(slot, saved);

  slot.addEventListener('click', () => {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'image/*';
    inp.onchange = e => {
      const f = e.target.files[0]; if (!f) return;
      const r = new FileReader();
      r.onload = ev => {
        applyPhoto(slot, ev.target.result);
        try { localStorage.setItem(key, ev.target.result); } catch (_) {}
      };
      r.readAsDataURL(f);
    };
    inp.click();
  });
});

/* ── Stagger sport tags ── */
document.querySelectorAll('.stag').forEach((t, i) => {
  t.style.transitionDelay = `${i * 0.06}s`;
});
