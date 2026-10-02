/* SansBorder — the nine School world drawings, shared across pages. D[i](ctx, box{x,y,w,h}, t) */
(function(){
    const ink = a => 'rgba(32,30,29,' + a + ')', red = a => 'rgba(236,48,19,' + a + ')';
    const rng = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    const poly = (c, p) => { c.beginPath(); c.moveTo(p[0][0], p[0][1]); for (let i = 1; i < p.length; i++) c.lineTo(p[i][0], p[i][1]); c.stroke(); };
    const dot = (c, x, y, r, col) => { c.beginPath(); c.arc(x, y, r, 0, 6.2832); c.fillStyle = col; c.fill(); };
    const along = (p, f) => { const seg = []; let L = 0; for (let i = 1; i < p.length; i++) { const d = Math.hypot(p[i][0] - p[i-1][0], p[i][1] - p[i-1][1]); seg.push(d); L += d; } let g = f * L; for (let i = 0; i < seg.length; i++) { if (g <= seg[i]) { const k = seg[i] ? g / seg[i] : 0; return [p[i][0] + (p[i+1][0] - p[i][0]) * k, p[i][1] + (p[i+1][1] - p[i][1]) * k]; } g -= seg[i]; } return p[p.length - 1]; };

    const D = [];
    // 01 AI — signal across neural layers
    D[0] = (c, B, t) => {
      const L = [3, 5, 6, 5, 3];
      const P = L.map((n, li) => { const x = B.x + B.w * (0.04 + 0.92 * li / (L.length - 1)); return Array.from({ length: n }, (_, k) => [x, B.y + B.h * ((k + 0.5) / n)]); });
      c.lineWidth = 1; c.strokeStyle = ink(.14); c.beginPath();
      for (let i = 0; i < L.length - 1; i++) for (const a of P[i]) for (const b of P[i+1]) { c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); }
      c.stroke();
      const idx = [1, 3, 2, 3, 1], path = idx.map((k, i) => P[i][k]);
      c.strokeStyle = red(.95); c.lineWidth = 1.75; poly(c, path);
      P.forEach((col, i) => col.forEach((p, k) => { const on = idx[i] === k; dot(c, p[0], p[1], on ? 3.6 : 2.6, on ? red(1) : ink(.85)); }));
      const q = along(path, (t * 0.35) % 1); dot(c, q[0], q[1], 8, red(.16)); dot(c, q[0], q[1], 3, red(1));
    };
    // 02 Technology — routed lattice
    D[1] = (c, B, t) => {
      const cols = 10, rows = 6, gx = i => B.x + B.w * i / (cols - 1), gy = j => B.y + B.h * j / (rows - 1);
      for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) dot(c, gx(i), gy(j), 1, ink(.3));
      const r = rng(7); c.lineWidth = 1.2; c.strokeStyle = ink(.55); c.fillStyle = ink(.85);
      for (let n = 0; n < 10; n++) {
        const a = [Math.floor(r() * cols), Math.floor(r() * rows)], b = [Math.floor(r() * cols), Math.floor(r() * rows)];
        const p = [[gx(a[0]), gy(a[1])], [gx(b[0]), gy(a[1])], [gx(b[0]), gy(b[1])]];
        poly(c, p); c.fillStyle = ink(.85); c.fillRect(p[0][0] - 2.5, p[0][1] - 2.5, 5, 5); c.fillRect(p[2][0] - 2.5, p[2][1] - 2.5, 5, 5);
      }
      c.lineWidth = 1.5; c.strokeStyle = ink(.85);
      [[2, 1, 2, 1], [6, 3, 2, 2]].forEach(([i, j, w, h]) => { const x = gx(i) - 6, y = gy(j) - 6, W = gx(i + w) - gx(i) + 12, H = gy(j + h) - gy(j) + 12; c.fillStyle = '#f3f2f2'; c.fillRect(x, y, W, H); c.strokeRect(x, y, W, H); });
      const bus = [[gx(0), gy(2)], [gx(4), gy(2)], [gx(4), gy(4)], [gx(9), gy(4)]];
      c.strokeStyle = red(.95); c.lineWidth = 1.75; poly(c, bus);
      const q = along(bus, (t * 0.3) % 1); c.fillStyle = red(1); c.fillRect(q[0] - 3.5, q[1] - 3.5, 7, 7);
    };
    // 03 Business — organisation and a decision path
    D[2] = (c, B, t) => {
      const X = f => B.x + B.w * f, Y = f => B.y + B.h * f;
      const root = [X(.5), Y(.04)], l1 = [.17, .5, .83].map(f => [X(f), Y(.42)]), l2 = [];
      l1.forEach((p, i) => [-1, 0, 1].forEach(d => l2.push([p[0] + d * B.w * .105, Y(.92), i])));
      const elbow = (a, b) => { const m = (a[1] + b[1]) / 2; poly(c, [a, [a[0], m], [b[0], m], b]); };
      c.lineWidth = 1.2; c.strokeStyle = ink(.5); l1.forEach(p => elbow(root, p)); l2.forEach(p => elbow(l1[p[2]], p));
      c.setLineDash([3, 4]); c.lineDashOffset = -t * 14; c.strokeStyle = ink(.38);
      [[1, 4], [3, 7], [2, 6], [5, 8]].forEach(([a, b]) => { const A = l2[a], Q = l2[b]; c.beginPath(); c.moveTo(A[0], A[1]); c.quadraticCurveTo((A[0] + Q[0]) / 2, A[1] - B.h * .26, Q[0], Q[1]); c.stroke(); });
      c.setLineDash([]);
      c.strokeStyle = red(.95); c.lineWidth = 1.75; elbow(root, l1[2]); elbow(l1[2], l2[7]);
      const sq = (p, s, on) => { c.fillStyle = on ? red(1) : '#f3f2f2'; c.fillRect(p[0] - s / 2, p[1] - s / 2, s, s); c.lineWidth = 1.5; c.strokeStyle = on ? red(1) : ink(.85); c.strokeRect(p[0] - s / 2, p[1] - s / 2, s, s); };
      sq(root, 11, true); l1.forEach((p, i) => sq(p, 9, i === 2)); l2.forEach((p, i) => sq(p, 7, i === 7));
    };
    // 04 Finance — compounding at six rates
    D[3] = (c, B, t) => {
      const n = 30, rates = [.03, .05, .07, .09, .11, .13], max = Math.pow(1.13, n) - 1, hi = .07;
      const yv = (r, x) => B.y + B.h - B.h * (Math.pow(1 + r, x * n) - 1) / max;
      const curve = r => Array.from({ length: 61 }, (_, k) => [B.x + B.w * k / 60, yv(r, k / 60)]);
      c.strokeStyle = ink(.6); c.lineWidth = 1.2; poly(c, [[B.x, B.y], [B.x, B.y + B.h], [B.x + B.w, B.y + B.h]]);
      c.beginPath(); for (let k = 1; k <= 10; k++) { const x = B.x + B.w * k / 10; c.moveTo(x, B.y + B.h); c.lineTo(x, B.y + B.h + 4); } c.stroke();
      rates.forEach(r => { if (r === hi) return; c.strokeStyle = ink(.4); c.lineWidth = 1; poly(c, curve(r)); });
      const rc = curve(hi); c.beginPath(); c.moveTo(B.x, B.y + B.h); rc.forEach(p => c.lineTo(p[0], p[1])); c.lineTo(B.x + B.w, B.y + B.h); c.closePath(); c.fillStyle = red(.07); c.fill();
      c.strokeStyle = red(.95); c.lineWidth = 1.75; poly(c, rc);
      const f = .1 + ((t * 0.08) % 1) * .88, sx = B.x + B.w * f;
      c.setLineDash([2, 3]); c.strokeStyle = ink(.45); c.lineWidth = 1; c.beginPath(); c.moveTo(sx, B.y); c.lineTo(sx, B.y + B.h); c.stroke(); c.setLineDash([]);
      rates.forEach(r => dot(c, sx, yv(r, f), r === hi ? 3.5 : 2.2, r === hi ? red(1) : ink(.85)));
    };
    // 05 Languages — two scripts linked in translation
    D[4] = (c, B, t) => {
      const r = rng(11), rowH = Math.max(11, B.h / 9), n = Math.max(3, Math.floor(B.h / rowH)), cw = B.w * .36, Lx = B.x, Rx = B.x + B.w - cw, L = [], R = [];
      for (let i = 0; i < n; i++) {
        const y = B.y + rowH * (i + .5);
        let x = Lx, end = Lx + cw * (.55 + r() * .45);
        c.strokeStyle = ink(.6); c.lineWidth = 2; c.beginPath();
        while (x < end) { const w = 6 + r() * 22; c.moveTo(x, y); c.lineTo(Math.min(x + w, end), y); x += w + 5; }
        c.stroke(); L.push([end, y]);
        x = Rx + cw * (r() * .3); const rs = x; end = Rx + cw;
        c.lineWidth = 1.5; c.beginPath();
        while (x < end) { const w = 4 + r() * 12; c.moveTo(x, y); c.lineTo(Math.min(x + w, end), y); c.moveTo(x + 1, y); c.lineTo(x + 1, y - 4); x += w + 4; }
        c.stroke(); R.push([rs, y]);
      }
      const hiK = Math.floor(n / 2);
      for (let i = 0; i < n; i++) {
        const j = Math.min(n - 1, Math.max(0, i + Math.round((r() - .5) * 3))), A = L[i], Q = R[j], on = i === hiK;
        c.strokeStyle = on ? red(.95) : ink(.2); c.lineWidth = on ? 1.75 : 1;
        if (on) { c.setLineDash([5, 4]); c.lineDashOffset = -t * 20; }
        c.beginPath(); c.moveTo(A[0] + 6, A[1]); c.bezierCurveTo(A[0] + B.w * .15, A[1], Q[0] - B.w * .15, Q[1], Q[0] - 6, Q[1]); c.stroke(); c.setLineDash([]);
      }
    };
    // 06 Human & Social — communities and bridges
    D[5] = (c, B, t) => {
      const r = rng(5), C = [[.16, .32], [.52, .22], [.84, .55], [.42, .76]], rx = B.w * .13, ry = B.h * .2;
      const G = C.map(([fx, fy]) => { const n = 8 + Math.floor(r() * 5); return Array.from({ length: n }, () => { const a = r() * 6.283, d = Math.sqrt(r()); return { x: B.x + B.w * fx + Math.cos(a) * rx * d, y: B.y + B.h * fy + Math.sin(a) * ry * d, ph: r() * 6.283 }; }); });
      const pos = p => [p.x + Math.sin(t * .8 + p.ph) * 1.6, p.y + Math.cos(t * .7 + p.ph) * 1.6];
      c.lineWidth = 1; c.strokeStyle = ink(.28); c.beginPath();
      G.forEach(g => g.forEach((p, i) => { for (let k = 1; k <= 2; k++) { const a = pos(p), b = pos(g[(i + k * 3) % g.length]); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); } }));
      c.stroke();
      c.setLineDash([2, 4]); c.strokeStyle = ink(.32); c.beginPath();
      [[0, 1], [1, 3], [3, 2], [0, 3]].forEach(([a, b]) => { const p = pos(G[a][1]), q = pos(G[b][2]); c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]); });
      c.stroke(); c.setLineDash([]);
      const p = pos(G[0][0]), q = pos(G[2][0]);
      c.strokeStyle = red(.95); c.lineWidth = 1.75; c.beginPath(); c.moveTo(p[0], p[1]); c.quadraticCurveTo((p[0] + q[0]) / 2, B.y + B.h, q[0], q[1]); c.stroke();
      G.forEach((g, ci) => g.forEach((pp, i) => { const a = pos(pp), on = i === 0 && (ci === 0 || ci === 2); dot(c, a[0], a[1], on ? 4 : 2.8, on ? red(1) : ink(.85)); }));
    };
    // 07 Future Industries — modular assembly, plots not yet built
    D[6] = (c, B, t) => {
      const hm = [[3, 2, 2, 1, 0], [2, 2, 1, 1, 0], [2, 1, 1, 0, 0], [1, 1, 0, 0, 0], [0, 0, 0, 0, 0]], N = 5, maxZ = 3.4;
      const s = Math.min(B.w / (2 * N * .866), B.h / (N + maxZ)) * .96;
      const ox = B.x + B.w / 2, oy = B.y + (B.h - (N + maxZ) * s) / 2 + maxZ * s;
      const P = (x, y, z) => [ox + (x - y) * s * .866, oy + (x + y) * s * .5 - z * s];
      const face = (pts, fill, stroke) => { c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = 1.1; c.stroke(); } };
      const cube = (x, y, z, on) => {
        const st = on ? red(1) : ink(.75);
        face([P(x, y + 1, z), P(x + 1, y + 1, z), P(x + 1, y + 1, z + 1), P(x, y + 1, z + 1)], on ? '#fbd9d2' : '#dfdddd', st);
        face([P(x + 1, y, z), P(x + 1, y + 1, z), P(x + 1, y + 1, z + 1), P(x + 1, y, z + 1)], on ? '#f6c2b7' : '#cfcccc', st);
        face([P(x, y, z + 1), P(x + 1, y, z + 1), P(x + 1, y + 1, z + 1), P(x, y + 1, z + 1)], on ? '#fde9e4' : '#f3f2f2', st);
      };
      const lift = .25 + .75 * (.5 + .5 * Math.sin(t * 1.6));
      const order = []; for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) order.push([x, y]);
      order.sort((a, b) => (a[0] + a[1]) - (b[0] + b[1]));
      order.forEach(([x, y]) => {
        const h = hm[y][x];
        if (!h) { c.setLineDash([3, 3]); face([P(x, y, 0), P(x + 1, y, 0), P(x + 1, y + 1, 0), P(x, y + 1, 0)], null, ink(.4)); c.setLineDash([]); }
        for (let z = 0; z < h; z++) cube(x, y, z, false);
        if (x === 3 && y === 1) {
          const a = P(3.5, 1.5, 1), b = P(3.5, 1.5, 1 + lift);
          c.setLineDash([2, 3]); c.strokeStyle = red(.7); c.lineWidth = 1; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); c.setLineDash([]);
          cube(3, 1, 1 + lift, true);
        }
      });
    };
    // 08 Exploration — contour terrain and a route
    D[7] = (c, B, t) => {
      const gw = 56, gh = Math.max(16, Math.round(56 * B.h / B.w)), asp = B.h / B.w;
      const F = (u, v) => { const d1 = (u - .3) ** 2 + ((v - .6) * asp) ** 2, d2 = (u - .72) ** 2 + ((v - .36) * asp) ** 2; return Math.exp(-d1 / .035) + .78 * Math.exp(-d2 / .022) + .06 * Math.sin(u * 9) * Math.cos(v * 7); };
      const f = []; for (let i = 0; i <= gw; i++) { f[i] = []; for (let j = 0; j <= gh; j++) f[i][j] = F(i / gw, j / gh); }
      const X = i => B.x + B.w * i / gw, Y = j => B.y + B.h * j / gh;
      const T = { 1: [[3, 2]], 2: [[2, 1]], 3: [[3, 1]], 4: [[0, 1]], 5: [[3, 2], [0, 1]], 6: [[0, 2]], 7: [[3, 0]], 8: [[3, 0]], 9: [[0, 2]], 10: [[3, 0], [2, 1]], 11: [[0, 1]], 12: [[3, 1]], 13: [[2, 1]], 14: [[3, 2]] };
      let k = 0;
      for (let L = .07; L < 1.1; L += .07, k++) {
        c.beginPath();
        for (let i = 0; i < gw; i++) for (let j = 0; j < gh; j++) {
          const a = f[i][j], b = f[i + 1][j], cc = f[i + 1][j + 1], d = f[i][j + 1];
          const segs = T[(a > L ? 8 : 0) | (b > L ? 4 : 0) | (cc > L ? 2 : 0) | (d > L ? 1 : 0)];
          if (!segs) continue;
          const E = e => e === 0 ? [X(i + (L - a) / (b - a)), Y(j)] : e === 1 ? [X(i + 1), Y(j + (L - b) / (cc - b))] : e === 2 ? [X(i + (L - d) / (cc - d)), Y(j + 1)] : [X(i), Y(j + (L - a) / (d - a))];
          segs.forEach(([e1, e2]) => { const p = E(e1), q = E(e2); c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]); });
        }
        const major = k % 4 === 3; c.strokeStyle = major ? ink(.6) : ink(.26); c.lineWidth = major ? 1.2 : .9; c.stroke();
      }
      const R = [[.03, .94], [.17, .8], [.3, .6], [.5, .54], [.72, .36], [.86, .2], [.97, .07]].map(([u, v]) => [B.x + B.w * u, B.y + B.h * v]);
      c.strokeStyle = red(.95); c.lineWidth = 1.75; c.setLineDash([6, 5]); c.lineDashOffset = -t * 12; poly(c, R); c.setLineDash([]);
      [R[2], R[4]].forEach(p => { c.fillStyle = red(1); c.fillRect(p[0] - 3.5, p[1] - 3.5, 7, 7); });
      const q = along(R, (t * .1) % 1); dot(c, q[0], q[1], 3, ink(.95));
    };
    // 09 Space — orbital periods
    D[8] = (c, B, t) => {
      const r = rng(3); for (let k = 0; k < 40; k++) dot(c, B.x + r() * B.w, B.y + r() * B.h, .8, ink(.3));
      const cx = B.x + B.w * .5, cy = B.y + B.h * .52, S = Math.min(B.w * .5, B.h * .5 / .42), tilt = -.2, ct = Math.cos(tilt), st = Math.sin(tilt);
      const pt = (rx, ry, a) => { const x = rx * Math.cos(a), y = ry * Math.sin(a); return [cx + x * ct - y * st, cy + x * st + y * ct]; };
      const orb = [.2, .38, .6, .92];
      orb.forEach((f, i) => { const rx = S * f; c.beginPath(); c.ellipse(cx, cy, rx, rx * .4, tilt, 0, 6.2832); c.strokeStyle = i === 2 ? red(.7) : ink(i === 3 ? .25 : .4); c.lineWidth = i === 2 ? 1.3 : 1; if (i === 3) c.setLineDash([3, 4]); c.stroke(); c.setLineDash([]); });
      dot(c, cx, cy, 13, ink(.08)); dot(c, cx, cy, 6.5, ink(.9));
      orb.forEach((f, i) => {
        const rx = S * f, a = i * 1.7 + t * .9 / Math.pow(f / .2, 1.5), p = pt(rx, rx * .4, a), on = i === 2;
        if (on) { c.beginPath(); c.arc(p[0], p[1], 11, 0, 6.2832); c.strokeStyle = red(.45); c.lineWidth = 1; c.stroke(); dot(c, p[0] + Math.cos(t * 3) * 11, p[1] + Math.sin(t * 3) * 11, 1.8, red(1)); }
        dot(c, p[0], p[1], on ? 4.5 : [2.6, 3.4, 0, 3][i], on ? red(1) : ink(.85));
      });
    };
  window.SBWorlds = { D, along, ink, red, rng, dot, poly };
})();
