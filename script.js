'use strict';
/* ═══════════════════════════════════════════════════════════
   MALIK  —  Sackboy-inspired animated character
   Brown/tanned Libyan, blow-dried hair stages 1-4,
   button-down + sweater + jeans teen→adult, mustache adult
════════════════════════════════════════════════════════════ */

/* ── Stage definitions ── */
const STAGES = [
  {
    idx: 0,
    age: 'Age 0 – 3',       chapter: 'The Beginning',
    desc: 'Curious, giggly, and full of wonder from day one.',
    // Sackboy proportions: BIG head, stubby everything
    totalH: 0.30,
    headR:  0.52,   // head = 52% of total height
    bodyR:  0.28,
    legR:   0.16,
    headWF: 1.10,   // wider = rounder
    bodyW: 50, legW: 16, armW: 14, footW: 20, footH: 10,
    eyeR: 13, eyeOX: 0.27, eyeOY: 0.03,
    cheekR: 11, cheekA: 0.55,
    smileR: 14, smA: 0.10*Math.PI, smB: 0.90*Math.PI,
    skin: '#C4845A', hair: '#1C0A04',
    top: '#6AAEE8', bot: '#6AAEE8', shoe: '#F9C4D0',
    hair_style: 'tuft',     // tiny baby tuft
    has_stache: false,
    swing: 0.14, aSwing: 0.10,
  },
  {
    idx: 1,
    age: 'Age 4 – 10',      chapter: 'School Days',
    desc: 'Backpack on, mind open — always asking "why?"',
    totalH: 0.40,
    headR:  0.40, bodyR: 0.29, legR: 0.24,
    headWF: 1.04, bodyW: 46, legW: 15, armW: 13, footW: 19, footH: 11,
    eyeR: 9.5, eyeOX: 0.28, eyeOY: 0.05,
    cheekR: 8, cheekA: 0.22,
    smileR: 12, smA: 0.12*Math.PI, smB: 0.88*Math.PI,
    skin: '#C4845A', hair: '#1C0A04',
    top: '#CC1C1C', bot: '#1a1a1a', shoe: '#333',
    hair_style: 'blowdry',  // blow-dried starts early
    has_stache: false,
    swing: 0.28, aSwing: 0.20,
  },
  {
    idx: 2,
    age: 'Age 11 – 17',     chapter: 'Finding My Way',
    desc: 'Soccer, football, track — and figuring out who I am.',
    totalH: 0.52,
    headR:  0.30, bodyR: 0.32, legR: 0.32,
    headWF: 0.95, bodyW: 48, legW: 16, armW: 14, footW: 22, footH: 12,
    eyeR: 8, eyeOX: 0.29, eyeOY: 0.07,
    cheekR: 6, cheekA: 0.06,
    smileR: 11, smA: 0.14*Math.PI, smB: 0.86*Math.PI,
    skin: '#C4845A', hair: '#1C0A04',
    top: '#1E1E2E', bot: '#1A2035', shoe: '#111',
    hair_style: 'blowdry',
    has_stache: false,
    swing: 0.30, aSwing: 0.22,
  },
  {
    idx: 3,
    age: 'Age 18 – 22',     chapter: 'University Life',
    desc: 'Late nights, big ambitions, and still dressing sharp.',
    totalH: 0.60,
    headR:  0.25, bodyR: 0.34, legR: 0.36,
    headWF: 0.90, bodyW: 50, legW: 17, armW: 15, footW: 24, footH: 13,
    eyeR: 7.5, eyeOX: 0.30, eyeOY: 0.08,
    cheekR: 5, cheekA: 0.02,
    smileR: 11, smA: 0.16*Math.PI, smB: 0.84*Math.PI,
    skin: '#C4845A', hair: '#1C0A04',
    top: '#6B0F1A', bot: '#1A2035', shoe: '#1a1a1a',
    hair_style: 'blowdry',
    has_stache: false,
    swing: 0.28, aSwing: 0.20,
  },
  {
    idx: 4,
    age: 'Right Now',       chapter: 'Malik Today',
    desc: 'Career-focused, family-rooted, and ready for what\'s next.',
    totalH: 0.65,
    headR:  0.22, bodyR: 0.35, legR: 0.38,
    headWF: 0.86, bodyW: 52, legW: 18, armW: 16, footW: 26, footH: 14,
    eyeR: 7, eyeOX: 0.30, eyeOY: 0.08,
    cheekR: 4, cheekA: 0,
    smileR: 12, smA: 0.18*Math.PI, smB: 0.82*Math.PI,
    skin: '#C4845A', hair: '#1C0A04',
    top: '#8B1A2A', bot: '#111111', shoe: '#2C1810',
    hair_style: 'blowdry',
    has_stache: true,   // ← mustache only, adult Malik
    swing: 0.24, aSwing: 0.16,
  },
];

/* ── Utilities ── */
const lerp  = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const easeInOutQuad = t => t < 0.5 ? 2*t*t : -1+(4-2*t)*t;

function hexToRgb(h) {
  return [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
}
function lerpColor(c1, c2, t) {
  const [r1,g1,b1]=hexToRgb(c1), [r2,g2,b2]=hexToRgb(c2);
  return `rgb(${Math.round(lerp(r1,r2,t))},${Math.round(lerp(g1,g2,t))},${Math.round(lerp(b1,b2,t))})`;
}

function lerpStage(A, B, t) {
  const L = (a, b) => lerp(a, b, t);
  return {
    idx:    L(A.idx,   B.idx),
    totalH: L(A.totalH,B.totalH), headR: L(A.headR,B.headR),
    bodyR:  L(A.bodyR, B.bodyR),  legR:  L(A.legR, B.legR),
    headWF: L(A.headWF,B.headWF), bodyW: L(A.bodyW,B.bodyW),
    legW:   L(A.legW,  B.legW),   armW:  L(A.armW, B.armW),
    footW:  L(A.footW, B.footW),  footH: L(A.footH,B.footH),
    eyeR:   L(A.eyeR,  B.eyeR),   eyeOX: L(A.eyeOX,B.eyeOX),
    eyeOY:  L(A.eyeOY, B.eyeOY),
    cheekR: L(A.cheekR,B.cheekR), cheekA: L(A.cheekA,B.cheekA),
    smileR: L(A.smileR,B.smileR), smA: L(A.smA,B.smA), smB: L(A.smB,B.smB),
    skin:   lerpColor(A.skin, B.skin, t),
    hair:   lerpColor(A.hair, B.hair, t),
    top:    lerpColor(A.top,  B.top,  t),
    bot:    lerpColor(A.bot,  B.bot,  t),
    shoe:   lerpColor(A.shoe, B.shoe, t),
    hair_style: t < 0.5 ? A.hair_style : B.hair_style,
    has_stache:  t > 0.78 ? B.has_stache : A.has_stache,
    swing:  L(A.swing, B.swing), aSwing: L(A.aSwing,B.aSwing),
  };
}

/* ── Canvas ── */
const canvas = document.getElementById('charCanvas');
const ctx    = canvas.getContext('2d');
const DPR    = window.devicePixelRatio || 1;

function resizeCanvas() {
  const panel = document.getElementById('charPanel');
  const W = panel.offsetWidth, H = panel.offsetHeight;
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  canvas.width = W * DPR; canvas.height = H * DPR;
  ctx.scale(DPR, DPR);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

/* ── Rounded rect helper ── */
function rr(ctx, x, y, w, h, r) {
  r = Math.min(Math.abs(r), Math.abs(w)/2, Math.abs(h)/2);
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill();
}

/* ── Animation state ── */
let currentIdx  = 0;
let walkPhase   = 0;
let idlePhase   = 0;
let jumpOffset  = 0;
let jumpVel     = 0;
let isJumping   = false;
let isScrolling = false;
let scrollTimer = null;
let lastScrollY = window.scrollY;
let lastStageInt = -1;
let particles   = [];
let lastTime    = 0;

/* ── Particles (clean dots, no hearts) ── */
function initParticles() {
  const W = canvas.width/DPR, H = canvas.height/DPR;
  particles = [];
  for (let i = 0; i < 28; i++) {
    particles.push({
      x: Math.random()*W, y: Math.random()*H,
      r: Math.random()*1.8+0.5,
      vx: (Math.random()-0.5)*0.25,
      vy: -(Math.random()*0.4+0.1),
      a: Math.random()*0.25+0.05,
      ph: Math.random()*Math.PI*2,
    });
  }
}
function tickParticles(ctx) {
  const W = canvas.width/DPR, H = canvas.height/DPR;
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy; p.ph += 0.015;
    if (p.y < -6) { p.y = H+4; p.x = Math.random()*W; }
    const a = p.a*(0.55+Math.sin(p.ph)*0.45);
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = p.r > 1.2 ? '#8B1A2A' : '#6B0F1A';
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  });
}

/* ── Background (light pastel per stage) ── */
function drawBg(ctx, W, H, p) {
  // Soft radial vignette in character panel bg color
  const v = ctx.createRadialGradient(W/2, H*0.58, 0, W/2, H*0.58, W*0.9);
  v.addColorStop(0, `rgba(220,130,140,0.18)`);
  v.addColorStop(1, 'rgba(255,240,240,0)');
  ctx.fillStyle = v; ctx.fillRect(0,0,W,H);

  // Ground line
  ctx.save();
  ctx.strokeStyle = 'rgba(107,15,26,0.10)';
  ctx.lineWidth = 1; ctx.setLineDash([5,9]);
  ctx.beginPath(); ctx.moveTo(0,H*0.87); ctx.lineTo(W,H*0.87); ctx.stroke();
  ctx.setLineDash([]); ctx.restore();
}

/* ══════════════════════════════════════
   MAIN CHARACTER DRAW
══════════════════════════════════════ */
function drawCharacter(ctx, W, H, p, wp, jump, idle) {
  const cx    = W / 2;
  const charH = H * p.totalH;
  const headH = charH * p.headR;
  const bodyH = charH * p.bodyR;
  const legH  = charH * p.legR;
  const headR = headH / 2;
  const headW = headR * p.headWF;
  const baseY = H * 0.87 + jump + Math.sin(idle)*2.5;

  // Ground shadow
  ctx.save(); ctx.globalAlpha = clamp(0.18 - Math.abs(jump)*0.004, 0, 0.18);
  const sg = ctx.createRadialGradient(cx, baseY+2, 0, cx, baseY+2, p.bodyW+12);
  sg.addColorStop(0, 'rgba(80,20,30,0.35)'); sg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sg;
  ctx.beginPath(); ctx.ellipse(cx, baseY+4, p.bodyW+12, 7, 0, 0, Math.PI*2); ctx.fill();
  ctx.restore();

  const spr   = p.legW * 0.52;
  const legTopY = baseY - legH;
  const lAng  = Math.sin(wp)          * p.swing;
  const rAng  = Math.sin(wp+Math.PI)  * p.swing;
  const laAng = Math.sin(wp+Math.PI)  * p.aSwing - 0.05;
  const raAng = Math.sin(wp)          * p.aSwing + 0.05;

  // ── LEGS ──
  ['L','R'].forEach(side => {
    const sx  = side==='L' ? cx-spr : cx+spr;
    const ang = side==='L' ? lAng : rAng;
    ctx.save(); ctx.translate(sx, legTopY); ctx.rotate(ang);
    // Jeans (stages 1+)
    ctx.fillStyle = p.idx < 0.5 ? p.bot : p.bot;
    rr(ctx, -p.legW/2, 0, p.legW, legH*0.70, 5);
    // Shoe
    ctx.fillStyle = p.shoe;
    const fxO = side==='L' ? -p.footW*0.07 : p.footW*0.07;
    rr(ctx, -p.footW/2+fxO, legH*0.63, p.footW, p.footH, 5);
    ctx.restore();
  });

  const bodyTopY = baseY - legH - bodyH;
  const aSpY     = bodyTopY + bodyH * 0.10;
  const aSpX     = p.bodyW / 2 + 1;

  // ── ARMS ──
  ['L','R'].forEach(side => {
    const ax  = side==='L' ? cx-aSpX : cx+aSpX;
    const ang = side==='L' ? laAng : raAng;
    // Sweater arm
    ctx.save(); ctx.translate(ax, aSpY); ctx.rotate(ang);
    ctx.fillStyle = p.top;
    rr(ctx, -p.armW/2, 0, p.armW, bodyH*0.72, 5);
    // Hand (skin)
    ctx.fillStyle = p.skin;
    ctx.beginPath(); ctx.arc(0, bodyH*0.76, p.armW*0.52, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  });

  // ── BODY ──
  // Main sweater
  ctx.fillStyle = p.top;
  rr(ctx, cx-p.bodyW/2, bodyTopY, p.bodyW, bodyH, 10);

  // Sweater ribbing at bottom
  ctx.save(); ctx.globalAlpha = 0.18; ctx.fillStyle = '#000';
  rr(ctx, cx-p.bodyW/2, bodyTopY+bodyH*0.84, p.bodyW, bodyH*0.14, 6);
  ctx.restore();

  // Button-down collar peek (visible at neck — white strip)
  const colW = p.bodyW*0.28;
  ctx.fillStyle = '#F0E8E0';   // cream shirt collar
  rr(ctx, cx-colW/2, bodyTopY-2, colW, bodyH*0.17+2, 5);

  // Collar V-line on sweater (dark line in center)
  ctx.save(); ctx.globalAlpha = 0.35; ctx.strokeStyle = '#000';
  ctx.lineWidth = 1.5; ctx.lineCap = 'round';
  const vTip = bodyTopY + bodyH*0.22;
  ctx.beginPath();
  ctx.moveTo(cx-colW*0.38, bodyTopY+2);
  ctx.lineTo(cx, vTip);
  ctx.lineTo(cx+colW*0.38, bodyTopY+2);
  ctx.stroke(); ctx.restore();

  // Backpack for child (stage 1)
  if (p.idx > 0.35 && p.idx < 1.6) {
    const bpA = clamp((p.idx - 0.4)*2, 0, 1) * clamp((1.6-p.idx)*2, 0, 1);
    ctx.save(); ctx.globalAlpha = bpA * 0.88;
    ctx.fillStyle = '#8B1A2A';
    rr(ctx, cx+p.bodyW/2-4, bodyTopY+bodyH*0.06, p.bodyW*0.46, bodyH*0.76, 8);
    ctx.globalAlpha = bpA*0.3; ctx.fillStyle = '#fff';
    rr(ctx, cx+p.bodyW/2+2, bodyTopY+bodyH*0.28, p.bodyW*0.28, bodyH*0.28, 5);
    ctx.restore();
  }

  // Soccer ball (stage 2, teen)
  if (p.idx > 1.5 && p.idx < 2.5) {
    const bA = clamp((p.idx-1.5)*2, 0, 1) * clamp((2.5-p.idx)*2, 0, 1);
    ctx.save(); ctx.globalAlpha = bA * 0.7;
    const bx = cx - p.bodyW/2 - 22, by = baseY - 14, br = 12;
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#1a1a1a'; ctx.lineWidth = 0.8; ctx.strokeStyle = '#888';
    // Pentagon pattern
    for (let i=0;i<5;i++) {
      const a = (i/5)*Math.PI*2 - Math.PI/2;
      ctx.beginPath(); ctx.arc(bx+Math.cos(a)*br*0.55, by+Math.sin(a)*br*0.55, br*0.28, 0, Math.PI*2); ctx.fill();
    }
    ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI*2); ctx.stroke();
    ctx.restore();
  }

  // ── NECK ──
  const nkW = p.bodyW*0.24;
  ctx.fillStyle = p.skin;
  rr(ctx, cx-nkW/2, bodyTopY-5, nkW, bodyH*0.16+5, 4);

  // ── HEAD ──
  const headCY = bodyTopY - headR - 1;

  // Sackboy head: nice round ellipse
  ctx.fillStyle = p.skin;
  ctx.beginPath();
  ctx.ellipse(cx, headCY, headW, headR, 0, 0, Math.PI*2);
  ctx.fill();

  // Ears
  ctx.fillStyle = p.skin;
  [cx-headW+4, cx+headW-4].forEach(ex => {
    ctx.beginPath();
    ctx.ellipse(ex, headCY+headR*0.08, headR*0.16, headR*0.22, 0, 0, Math.PI*2);
    ctx.fill();
    // Inner ear
    ctx.save(); ctx.globalAlpha = 0.22; ctx.fillStyle = '#8B3A2A';
    ctx.beginPath();
    ctx.ellipse(ex, headCY+headR*0.08, headR*0.08, headR*0.13, 0, 0, Math.PI*2);
    ctx.fill(); ctx.restore();
  });

  drawHair(ctx, cx, headCY, headR, headW, p);
  drawFace(ctx, cx, headCY, headR, p);

  // Mustache (adult only)
  if (p.has_stache && p.idx > 3.5) {
    const stacheA = clamp((p.idx - 3.7)*2.5, 0, 1);
    drawMustache(ctx, cx, headCY, headR, p, stacheA);
  }

  // Watch (adult)
  if (p.idx > 3.5) {
    const wA = clamp((p.idx-3.5)*2, 0, 0.9);
    ctx.save(); ctx.globalAlpha = wA;
    ctx.translate(cx-aSpX, aSpY); ctx.rotate(laAng);
    ctx.fillStyle = '#8B6914';
    rr(ctx, -p.armW*0.38, p.armW*0.55, p.armW*0.75, p.armW*0.5, 2);
    ctx.fillStyle = '#fff'; ctx.globalAlpha = wA*0.8;
    rr(ctx, -p.armW*0.24, p.armW*0.62, p.armW*0.48, p.armW*0.34, 1.5);
    ctx.restore();
  }
}

/* ── Hair drawing ── */
function drawHair(ctx, cx, headCY, headR, headW, p) {
  ctx.fillStyle = p.hair;
  const s = p.hair_style;

  if (s === 'tuft') {
    // Baby: tiny tuft on top
    ctx.beginPath();
    ctx.ellipse(cx, headCY - headR + 3, headW*0.18, headR*0.22, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = p.hair; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx, headCY-headR+4);
    ctx.bezierCurveTo(cx+4, headCY-headR-5, cx+11, headCY-headR-3, cx+6, headCY-headR-11);
    ctx.stroke();

  } else if (s === 'blowdry') {
    // Blow-dried: voluminous swept top, clean sides
    // Side fade (darker, lower on sides)
    ctx.save(); ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.ellipse(cx, headCY+headR*0.15, headW*1.03, headR*0.55, 0, Math.PI*0.6, Math.PI*2.4);
    ctx.fill(); ctx.restore();

    // Main voluminous top cap — swept slightly back
    ctx.save();
    ctx.beginPath();
    // Slightly off-center for the "blown back" look
    ctx.ellipse(cx + headW*0.04, headCY - headR*0.18, headW*0.98, headR*0.88, -0.06, Math.PI, Math.PI*2);
    ctx.fill();

    // Volume bump at front
    ctx.beginPath();
    ctx.ellipse(cx - headW*0.1, headCY - headR*0.62, headW*0.55, headR*0.42, -0.25, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();

    // Highlight on hair (sheen)
    ctx.save(); ctx.globalAlpha = 0.10; ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(cx - headW*0.15, headCY - headR*0.65, headW*0.22, headR*0.14, -0.3, 0, Math.PI*2);
    ctx.fill(); ctx.restore();
  }
}

/* ── Face drawing ── */
function drawFace(ctx, cx, headCY, headR, p) {
  const ox = headR * p.eyeOX * 2;
  const ey = headCY + headR * p.eyeOY;

  // Whites — Sackboy big round eyes
  ctx.fillStyle = '#fff';
  [cx-ox, cx+ox].forEach(ex => {
    ctx.beginPath();
    ctx.ellipse(ex, ey, p.eyeR*0.92, p.eyeR, 0, 0, Math.PI*2);
    ctx.fill();
  });

  // Iris (warm dark brown)
  const iR = p.eyeR * 0.60;
  [cx-ox, cx+ox].forEach(ex => {
    ctx.fillStyle = '#2C0E08';
    ctx.beginPath(); ctx.arc(ex, ey+1, iR, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(ex, ey+1, iR*0.48, 0, Math.PI*2); ctx.fill();
    // Eye shine (Sackboy signature)
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(ex+iR*0.3, ey-iR*0.3, iR*0.24, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(ex-iR*0.18, ey+iR*0.25, iR*0.11, 0, Math.PI*2); ctx.fill();
  });

  // Eyebrows — thick, expressive
  ctx.strokeStyle = p.hair;
  ctx.lineWidth = clamp(p.eyeR*0.30, 1.5, 3.2);
  ctx.lineCap = 'round';
  const by = ey - p.eyeR*1.50;
  [cx-ox, cx+ox].forEach((ex, i) => {
    ctx.beginPath();
    ctx.moveTo(ex - p.eyeR*0.82, by + (i===0 ? 1.5 : 1.5));
    ctx.quadraticCurveTo(ex, by - 2.5, ex + p.eyeR*0.82, by + (i===0 ? 1.5 : 1.5));
    ctx.stroke();
  });

  // Rosy cheeks (fade with age)
  if (p.cheekA > 0.01) {
    ctx.save(); ctx.globalAlpha = p.cheekA; ctx.fillStyle = '#F08080';
    [cx-ox*1.5, cx+ox*1.5].forEach(ex => {
      ctx.beginPath();
      ctx.ellipse(ex, ey+p.eyeR*0.95, p.cheekR, p.cheekR*0.62, 0, 0, Math.PI*2);
      ctx.fill();
    });
    ctx.restore();
  }

  // Nose — simple soft bump
  ctx.save(); ctx.globalAlpha = 0.45;
  ctx.strokeStyle = lerpColor(p.skin, '#7A3020', 0.5);
  ctx.lineWidth = clamp(p.eyeR*0.24, 1, 2.4); ctx.lineCap = 'round';
  const ny = headCY + headR * 0.24;
  ctx.beginPath(); ctx.moveTo(cx-2.5, ny-3); ctx.lineTo(cx, ny+3); ctx.lineTo(cx+2.5, ny-3);
  ctx.stroke(); ctx.restore();

  // Smile
  ctx.strokeStyle = lerpColor(p.skin, '#7A3020', 0.65);
  ctx.lineWidth = clamp(p.eyeR*0.28, 1.6, 3); ctx.lineCap = 'round';
  const sy = headCY + headR * 0.46;
  ctx.beginPath(); ctx.arc(cx, sy, p.smileR, p.smA, p.smB); ctx.stroke();
}

/* ── Mustache (adult only) ── */
function drawMustache(ctx, cx, headCY, headR, p, alpha) {
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.fillStyle = p.hair;
  const my = headCY + headR * 0.28;
  // Left wing
  ctx.beginPath();
  ctx.moveTo(cx, my+2);
  ctx.bezierCurveTo(cx-4, my-2, cx-headR*0.35, my-4, cx-headR*0.42, my+1);
  ctx.bezierCurveTo(cx-headR*0.38, my+5, cx-headR*0.18, my+4, cx, my+4);
  ctx.closePath(); ctx.fill();
  // Right wing
  ctx.beginPath();
  ctx.moveTo(cx, my+2);
  ctx.bezierCurveTo(cx+4, my-2, cx+headR*0.35, my-4, cx+headR*0.42, my+1);
  ctx.bezierCurveTo(cx+headR*0.38, my+5, cx+headR*0.18, my+4, cx, my+4);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

/* Helper for color lerp from hex */
function lerpColor(c1, c2, t) {
  try {
    const [r1,g1,b1]=hexToRgb(c1), [r2,g2,b2]=hexToRgb(c2);
    return `rgb(${Math.round(lerp(r1,r2,t))},${Math.round(lerp(g1,g2,t))},${Math.round(lerp(b1,b2,t))})`;
  } catch { return c1; }
}

/* ── Scroll → stage ── */
function getScrollStage() {
  const secs = document.querySelectorAll('.ls');
  let best = 0;
  secs.forEach(s => {
    if (s.getBoundingClientRect().top < window.innerHeight * 0.55)
      best = parseInt(s.dataset.stage || '0');
  });
  return clamp(best, 0, 4);
}

/* ── Jump ── */
function triggerJump() {
  if (isJumping) return;
  isJumping = true; jumpVel = -13;
}
function tickJump() {
  if (!isJumping) return;
  jumpVel += 0.85; jumpOffset += jumpVel;
  if (jumpOffset >= 0) { jumpOffset = 0; jumpVel = 0; isJumping = false; }
}

/* ── Meta labels ── */
function updateMeta(stage) {
  document.getElementById('charAgePill').textContent  = stage.age;
  document.getElementById('charChapter').textContent  = stage.chapter;
  document.getElementById('charDesc').textContent     = stage.desc;
  const meta = document.getElementById('charMeta');
  meta.classList.remove('flash'); void meta.offsetWidth; meta.classList.add('flash');
  document.querySelectorAll('.char-dot').forEach((d,i) =>
    d.classList.toggle('active', i === Math.round(clamp(currentIdx,0,4))));
}

/* ── Section reveal ── */
function checkReveal() {
  document.querySelectorAll('.ls').forEach(s => {
    if (s.getBoundingClientRect().top < window.innerHeight * 0.82)
      s.classList.add('visible');
  });
}

/* ── Progress bar ── */
function updateProgress() {
  const doc = document.documentElement;
  const pct = (window.scrollY / (doc.scrollHeight - window.innerHeight)) * 100;
  document.getElementById('progressBar').style.width = clamp(pct, 0, 100) + '%';
}

/* ── Photo slots ── */
function initPhotoSlots() {
  document.querySelectorAll('.photo-slot').forEach(slot => {
    slot.addEventListener('click', () => {
      const inp = document.createElement('input');
      inp.type = 'file'; inp.accept = 'image/*';
      inp.onchange = e => {
        const f = e.target.files[0]; if (!f) return;
        const r = new FileReader();
        r.onload = ev => {
          slot.style.cssText += `background-image:url(${ev.target.result});background-size:cover;background-position:center;border:1.5px solid rgba(107,15,26,0.35);`;
          slot.innerHTML = '';
        };
        r.readAsDataURL(f);
      };
      inp.click();
    });
  });
}

/* ── Card glow (Apple-style — light version) ── */
function initCardGlow() {
  document.querySelectorAll('.today-card,.hobby-tile,.diploma-block').forEach(card => {
    let raf = 0;
    card.addEventListener('mousemove', e => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX-rect.left)/rect.width*100).toFixed(1)+'%';
        const y = ((e.clientY-rect.top)/rect.height*100).toFixed(1)+'%';
        card.style.background =
          `radial-gradient(circle at ${x} ${y}, rgba(107,15,26,0.05) 0%, white 55%)`;
      });
    });
    card.addEventListener('mouseleave', () => { card.style.background = ''; });
  });
}

/* ── Build dots ── */
function buildDots() {
  const c = document.getElementById('charDots');
  STAGES.forEach((_,i) => {
    const d = document.createElement('div');
    d.className = 'char-dot' + (i===0 ? ' active' : '');
    c.appendChild(d);
  });
}

/* ══════════════════════════════════════
   RAF LOOP
══════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', () => {
  buildDots();
  initPhotoSlots();
  initCardGlow();
  initParticles();
  updateMeta(STAGES[0]);
  checkReveal();
  updateProgress();

  window.addEventListener('scroll', () => {
    updateProgress(); checkReveal();
    isScrolling = true;
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => { isScrolling = false; }, 200);
    lastScrollY = window.scrollY;
  }, { passive: true });

  window.addEventListener('resize', initParticles);

  let _p = STAGES[0];

  requestAnimationFrame(function loop(ts) {
    requestAnimationFrame(loop);
    const dt = clamp((ts - lastTime) / 1000, 0, 0.05);
    lastTime = ts;

    walkPhase += dt * (isScrolling ? 6.5 : 1.2);
    idlePhase += dt * 1.0;

    const target = getScrollStage();
    if (target !== lastStageInt) {
      lastStageInt = target;
      triggerJump();
      setTimeout(() => updateMeta(STAGES[clamp(target,0,4)]), 180);
    }

    currentIdx += (target - currentIdx) * clamp(dt * 3.5, 0, 1);
    currentIdx  = clamp(currentIdx, 0, 4);
    tickJump();

    const si = clamp(currentIdx, 0, 3.9999);
    const lo = Math.floor(si);
    const t  = easeInOutQuad(si - lo);
    _p = lerpStage(STAGES[lo], STAGES[Math.min(lo+1,4)], t);

    const W = canvas.width/DPR, H = canvas.height/DPR;
    ctx.clearRect(0, 0, W, H);
    drawBg(ctx, W, H, _p);
    tickParticles(ctx);
    drawCharacter(ctx, W, H, _p, walkPhase, jumpOffset, idlePhase);
  });
});
