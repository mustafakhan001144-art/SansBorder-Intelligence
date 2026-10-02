/* SansBorder — Schools. The nine Schools sit on a ring around the learner; the ring turns to bring one into focus,
   and that School opens in the world panel. Drawings come from school-worlds.js (window.SBWorlds). */
(function () {
  'use strict';

  // Set to false to stop the ambient animation (signals, orbits, dashed crossings). Reduced-motion users never get it.
  const MOTION = true;

  // Pages that exist for a School. Schools without one link back to this page's open world.
  const ROUTES = { 0: 'school-ai.html', 4: 'school-languages.html' };

  const D = [
    ['AI & Intelligence', 'How machines learn, reason and perceive — and how to think clearly alongside them.', 'a signal crossing the layers of a neural network', ['Neural systems', 'Signals', 'Cognition', 'Models'], [1, 4, 5, 2]],
    ['Technology', 'The engineered systems beneath modern life, from software to physical infrastructure.', 'components routed across a circuit lattice', ['Architecture', 'Infrastructure', 'Networks', 'Software'], [0, 6, 3, 7]],
    ['Business', 'How organisations form, decide and grow — and how people lead them.', 'an organisation, and one decision path through it', ['Strategy', 'Organisations', 'Decisions', 'People'], [3, 5, 1, 4]],
    ['Finance', 'Capital, value and risk: the quantitative relationships that move economies.', 'capital compounding at six different rates', ['Capital', 'Flows', 'Growth', 'Risk'], [2, 1, 6]],
    ['Languages & Communication', 'Scripts, speech and meaning — learning to be understood across borders.', 'two scripts, linked line by line in translation', ['Scripts', 'Dialogue', 'Translation', 'Rhetoric'], [5, 0, 2, 7]],
    ['Human & Social Sciences', 'People, cultures and societies: how we live together, and why.', 'communities, and the ties that bridge them', ['People', 'Culture', 'Relationships', 'Society'], [4, 2, 7, 0]],
    ['Future Industries', 'Fields still being invented — where engineering, science and enterprise meet.', 'a system assembled module by module, beside plots not yet built', ['Invention', 'Emerging systems', 'Advanced technology', 'Industrial futures'], [1, 8, 3, 0]],
    ['Exploration & Knowledge', 'Research and discovery: the craft of finding out what no one knows yet.', 'contour terrain, crossed by a route between two summits', ['Discovery', 'Maps', 'Research', 'Method'], [8, 5, 4, 1]],
    ['Space Science / Astronomy', 'Celestial mechanics and cosmic structure — our place among the stars.', 'bodies in orbit, each at its own period', ['Orbits', 'Stars', 'Cosmic structure', 'Planetary science'], [7, 6, 1]],
  ];
  const S = D.map(([name, desc, drawn, topics, rel], i) => ({ num: String(i + 1).padStart(2, '0'), name, desc, drawn: 'Drawn as ' + drawn, topics, rel, href: ROUTES[i] || '#world' }));

  const $ = id => document.getElementById(id);
  const root = $('universe'), dial = $('dial'), cv = $('dial-canvas'), wcv = $('world-canvas'), winEl = $('world');
  const step = Math.PI * 2 / 9;
  const reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  let sel = 0, rot = null, target = null, wipe = 1, switchT = 0, needs = true, g = null, drag = null, lastF = 0, layoutKey = '';
  const t0 = performance.now();

  // ── Static DOM: ring buttons and the bottom index
  const btn = S.map((s, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.setAttribute('aria-label', 'School ' + s.num + ': ' + s.name);
    b.addEventListener('click', () => select(i));
    $('dial-nodes').appendChild(b); return b;
  });
  const listLinks = S.map((s, i) => {
    const a = document.createElement('a');
    a.href = '#world'; a.innerHTML = '<b>' + s.num + '</b>'; a.appendChild(document.createTextNode(s.name));
    a.addEventListener('click', () => select(i));
    $('every').appendChild(a); return a;
  });

  // ── Geometry: desktop puts the ring left with the world panel to its right; narrow stacks ring above panel.
  function geom(w, h) {
    const narrow = w < 900;
    if (narrow) { const r = Math.min(w * .32, 170); return { narrow, cx: w / 2, cy: 84 + r + 30, r, focusA: Math.PI / 2, H: 84 + 2 * r + 120 }; }
    const r = Math.min(h * .33, w * .2); return { narrow, cx: w * .27, cy: h * .52, r, focusA: 0, H: h };
  }

  function layout() {
    const w = window.innerWidth, h = window.innerHeight, G = geom(w, h);
    const key = w + 'x' + h; if (key === layoutKey) return; layoutKey = key;
    root.classList.toggle('narrow', G.narrow);
    $('how-to').textContent = G.narrow
      ? 'Turn the ring or tap a School. Dashed lines show where this world crosses into others.'
      : 'Drag the ring, use the arrow keys, or choose a School. The red line is where you are looking; dashed lines show where this world crosses into others.';
    dial.style.height = G.narrow ? G.H + 'px' : '';
    winEl.style.left = G.narrow ? '' : Math.round(G.cx + G.r * 1.22 + Math.min(240, w * .16)) + 'px';
    needs = true;
  }

  function renderWorld() {
    const s = S[sel];
    $('w-num').textContent = s.num; $('w-drawn').textContent = s.drawn;
    $('w-name').textContent = s.name; $('w-desc').textContent = s.desc; $('w-enter').href = s.href;
    const tp = $('w-topics'); tp.textContent = '';
    s.topics.forEach(t => { const sp = document.createElement('span'); sp.textContent = t; tp.appendChild(sp); });
    const rl = $('w-rel'); rl.textContent = '';
    s.rel.forEach(j => {
      const b = document.createElement('button'); b.type = 'button';
      const n = document.createElement('span'); n.textContent = S[j].num; b.appendChild(n); b.appendChild(document.createTextNode(S[j].name));
      b.addEventListener('click', () => select(j, true)); rl.appendChild(b);
    });
    btn.forEach((b, i) => b.setAttribute('aria-pressed', i === sel ? 'true' : 'false'));
    listLinks.forEach((a, i) => { if (i === sel) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
    needs = true;
  }

  function select(i, focusWin) {
    if (g) { const tg = g.focusA - i * step, cur = rot ?? tg; let d = tg - cur; d = Math.atan2(Math.sin(d), Math.cos(d)); target = cur + d; if (reduced) rot = target; }
    if (i !== sel) { switchT = performance.now(); wipe = reduced ? 1 : 0; sel = i; renderWorld(); }
    if (focusWin) { const h = $('w-name'); h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    needs = true;
  }
  const next = () => select((sel + 1) % 9), prev = () => select((sel + 8) % 9);
  $('next').addEventListener('click', next); $('prev').addEventListener('click', prev);

  root.addEventListener('keydown', e => {
    if (e.target && e.target.tagName === 'A') return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); next(); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); prev(); }
  });

  // ── Drag to turn the ring; on release it settles on the nearest School.
  const angleAt = e => { const r = dial.getBoundingClientRect(); return Math.atan2(e.clientY - r.top - g.cy, e.clientX - r.left - g.cx); };
  dial.addEventListener('pointerdown', e => {
    if (e.target.tagName === 'BUTTON' || !g) return;
    drag = { a: angleAt(e), rot, moved: false };
    try { dial.setPointerCapture(e.pointerId); } catch (_) {}
  });
  dial.addEventListener('pointermove', e => {
    if (!drag) return;
    const a = angleAt(e); let d = a - drag.a; d = Math.atan2(Math.sin(d), Math.cos(d));
    if (Math.abs(d) > .02) drag.moved = true;
    rot = drag.rot + d; target = rot; drag.a = a; drag.rot = rot; needs = true;
  });
  const up = () => {
    if (!drag) return; const moved = drag.moved; drag = null; if (!moved) return;
    let best = 0, bd = 9;
    for (let i = 0; i < 9; i++) { let d = g.focusA - (i * step + rot); d = Math.abs(Math.atan2(Math.sin(d), Math.cos(d))); if (d < bd) { bd = d; best = i; } }
    select(best);
  };
  dial.addEventListener('pointerup', up); dial.addEventListener('pointercancel', up);

  function fit(c) {
    const w = c.clientWidth, h = c.clientHeight, dpr = Math.min(2, window.devicePixelRatio || 1);
    if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
    const x = c.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); return x;
  }

  // ── The dial
  function frame(now) {
    if (!window.SBWorlds) return;
    const w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return;
    const motion = MOTION && !reduced, t = (now - t0) / 1000;
    g = geom(window.innerWidth, window.innerHeight); g.cy = Math.min(g.cy, h - 40);
    if (rot == null) { rot = g.focusA - sel * step; target = rot; }
    const moving = Math.abs(target - rot) > .0005 || wipe < 1;
    if (!motion && !moving && !needs) return;
    needs = false;
    rot += (target - rot) * (motion ? .12 : 1);
    if (wipe < 1) wipe = Math.min(1, (now - switchT) / 650);

    const c = fit(cv), { cx, cy, r, focusA, narrow } = g, rel = S[sel].rel;
    c.fillStyle = '#201e1d'; c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(243,242,242,.07)'; for (let gx = 12; gx < w; gx += 24) for (let gy = 12; gy < h; gy += 24) c.fillRect(gx - .6, gy - .6, 1.2, 1.2);
    [.28, .55, 1, 1.45, 2.1, 3].forEach((f, k) => { c.beginPath(); c.arc(cx, cy, r * f, 0, 6.2832); c.strokeStyle = 'rgba(243,242,242,' + (k === 2 ? .3 : .08) + ')'; c.lineWidth = 1; c.stroke(); });
    for (let k = 0; k < 108; k++) { const a = k / 108 * 6.2832 + rot, big = k % 12 === 0, r1 = r * 1.06, r2 = r * (big ? 1.13 : 1.09); c.beginPath(); c.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); c.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2); c.strokeStyle = 'rgba(243,242,242,' + (big ? .45 : .18) + ')'; c.stroke(); }
    const P = S.map((_, i) => { const a = i * step + rot; return { a, x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r }; });

    // Every pair of worlds is faintly linked; the selected world's crossings are dashed.
    c.lineWidth = 1;
    for (let i = 0; i < 9; i++) for (let j = i + 1; j < 9; j++) { c.beginPath(); c.moveTo(P[i].x, P[i].y); c.quadraticCurveTo(cx + (P[i].x + P[j].x - 2 * cx) * .2, cy + (P[i].y + P[j].y - 2 * cy) * .2, P[j].x, P[j].y); c.strokeStyle = 'rgba(243,242,242,.045)'; c.stroke(); }
    rel.forEach(j => { const A = P[sel], B = P[j]; c.beginPath(); c.moveTo(A.x, A.y); c.quadraticCurveTo(cx + (A.x + B.x - 2 * cx) * .25, cy + (A.y + B.y - 2 * cy) * .25, B.x, B.y); c.strokeStyle = 'rgba(255,151,131,.75)'; c.lineWidth = 1.4; c.setLineDash([4, 5]); c.lineDashOffset = motion ? -t * 14 : 0; c.stroke(); c.setLineDash([]); });

    // The red line of sight: learner → focus → world panel.
    const fx = cx + Math.cos(focusA) * r, fy = cy + Math.sin(focusA) * r;
    c.beginPath(); c.moveTo(cx, cy); c.lineTo(fx, fy); c.strokeStyle = '#ec3013'; c.lineWidth = 2; c.stroke();
    if (!narrow) { const wb = winEl.getBoundingClientRect(), cb = cv.getBoundingClientRect(), wx = wb.left - cb.left; c.beginPath(); c.moveTo(fx + 18, fy); c.lineTo(wx, fy); c.stroke(); c.fillStyle = '#ec3013'; c.fillRect(wx - 6, fy - 6, 6, 12); }
    else { c.beginPath(); c.moveTo(fx, fy + 18); c.lineTo(fx, h); c.stroke(); }
    c.strokeRect(fx - 20, fy - 20, 40, 40);
    c.fillStyle = '#ec3013'; c.fillRect(cx - 7, cy - 7, 14, 14);
    c.font = '700 11px Archivo, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'top'; c.fillStyle = 'rgba(243,242,242,.85)'; c.fillText('YOU', cx, cy + 12);

    // Ring labels must stay on screen and clear of the headline (the prototype let both happen at common desktop sizes).
    const cb = cv.getBoundingClientRect(), capB = $('caption').getBoundingClientRect();
    const cap = { l: capB.left - cb.left - 8, t: capB.top - cb.top - 8, r: capB.right - cb.left + 8, b: capB.bottom - cb.top + 8 };
    P.forEach((p, i) => {
      const on = i === sel, isRel = rel.includes(i), s = on ? 12 : isRel ? 9 : 7;
      c.fillStyle = '#201e1d'; c.fillRect(p.x - s / 2 - 3, p.y - s / 2 - 3, s + 6, s + 6);
      if (on) { c.fillStyle = '#ec3013'; c.fillRect(p.x - s / 2, p.y - s / 2, s, s); }
      else if (isRel) { c.fillStyle = '#ff9783'; c.fillRect(p.x - s / 2, p.y - s / 2, s, s); }
      else { c.strokeStyle = 'rgba(243,242,242,.8)'; c.lineWidth = 1.5; c.strokeRect(p.x - s / 2, p.y - s / 2, s, s); }
      btn[i].style.left = p.x + 'px'; btn[i].style.top = p.y + 'px';
      if (on) return;
      const lr = r * 1.22, ly = cy + Math.sin(p.a) * lr, ca = Math.cos(p.a), align = ca > .3 ? 'left' : ca < -.3 ? 'right' : 'center';
      c.font = (isRel ? '700 ' : '500 ') + '13px Archivo, sans-serif';
      const tw = narrow ? 16 : Math.max(16, c.measureText(S[i].name).width), off = align === 'left' ? 0 : align === 'right' ? tw : tw / 2;
      const lx = Math.max(12 + off, Math.min(w - 12 - tw + off, cx + ca * lr)), x0 = lx - off, top = ly - (narrow ? 8 : 16), bot = ly + (narrow ? 8 : 18);
      if (!narrow && x0 < cap.r && x0 + tw > cap.l && top < cap.b && bot > cap.t) return;
      c.textAlign = align; c.textBaseline = 'middle';
      c.font = '800 12px Archivo, sans-serif'; c.fillStyle = isRel ? '#ff9783' : 'rgba(243,242,242,.55)';
      c.fillText(S[i].num, lx, ly - (narrow ? 0 : 8));
      if (!narrow) { c.font = (isRel ? '700 ' : '500 ') + '13px Archivo, sans-serif'; c.fillStyle = isRel ? '#f3f2f2' : 'rgba(243,242,242,.6)'; c.fillText(S[i].name, lx, ly + 9); }
    });
    drawWin(t, motion);
  }

  // ── The open world's drawing, revealed left to right behind a red wipe line on each switch.
  function drawWin(t, motion) {
    const w = wcv.clientWidth, h = wcv.clientHeight; if (!w || !h) return;
    const c = fit(wcv); c.clearRect(0, 0, w, h);
    const e = 1 - Math.pow(1 - wipe, 3);
    c.save(); c.beginPath(); c.rect(0, 0, w * e, h); c.clip();
    window.SBWorlds.D[sel](c, { x: 24, y: 40, w: w - 48, h: h - 80 }, motion ? 2 + t : 2);
    c.restore();
    if (e < 1) { c.fillStyle = '#ec3013'; c.fillRect(w * e - 2, 0, 3, h); }
  }

  function tick(now) { lastF = performance.now(); requestAnimationFrame(tick); frame(now); }

  layout(); renderWorld();
  window.addEventListener('resize', () => requestAnimationFrame(layout));
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(() => { needs = true; }).observe(root);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { needs = true; });
  requestAnimationFrame(tick);
  // If animation frames are throttled (background tab, some embeds), still paint the settled state.
  setInterval(() => { if (performance.now() - lastF > 400) { needs = true; wipe = 1; if (target != null) rot = target; frame(performance.now()); } }, 500);
})();
