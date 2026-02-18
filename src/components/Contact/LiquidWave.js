import React, { useRef, useEffect, useCallback } from 'react';
import './LiquidWave.scss';

const N = 160;
const SPRING = 0.025;
const DAMP = 0.985;
const SPREAD = 0.25;
const PASSES = 4;
const SY_RATIO = 0.28;

const LiquidWave = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const st = useRef({
    h: new Float32Array(N),
    v: new Float32Array(N),
    ld: new Float32Array(N),
    rd: new Float32Array(N),
    t: 0,
    aid: null,
    w: 0,
    ht: 0,
    dpr: 1,
    px: -1,
    py: -1,
    ma: false,
    lst: 0,
    lsT: Date.now(),
    pts: [],
  });

  const resize = useCallback(() => {
    const cv = canvasRef.current;
    const ct = containerRef.current;
    if (!cv || !ct) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = ct.getBoundingClientRect();
    cv.width = r.width * dpr;
    cv.height = r.height * dpr;
    cv.style.width = `${r.width}px`;
    cv.style.height = `${r.height}px`;
    const s = st.current;
    s.w = r.width;
    s.ht = r.height;
    s.dpr = dpr;
  }, []);

  const disturb = useCallback((col, force) => {
    const s = st.current;
    const rad = Math.min(6 + Math.abs(force) * 0.4, 14);
    for (let i = Math.floor(-rad); i <= Math.ceil(rad); i++) {
      const idx = col + i;
      if (idx >= 0 && idx < N) {
        s.v[idx] += force * Math.cos((Math.abs(i) / (rad + 1)) * Math.PI * 0.5);
      }
    }
    if (Math.abs(force) > 2.5) {
      const x = (col / N) * s.w;
      const sy = s.ht * SY_RATIO;
      const cnt = Math.min(Math.floor(Math.abs(force) * 1.5), 12);
      for (let p = 0; p < cnt; p++) {
        s.pts.push({
          x: x + (Math.random() - 0.5) * 20,
          y: sy - Math.random() * 4,
          vx: (Math.random() - 0.5) * 4,
          vy: -(1.2 + Math.random() * Math.abs(force) * 0.6),
          life: 1,
          sz: 0.8 + Math.random() * 2,
        });
      }
    }
  }, []);

  const physics = useCallback(() => {
    const s = st.current;
    const { h, v, ld, rd } = s;

    for (let i = 0; i < N; i++) {
      v[i] += -SPRING * h[i];
      v[i] *= DAMP;
      h[i] += v[i];
    }

    for (let p = 0; p < PASSES; p++) {
      for (let i = 0; i < N; i++) {
        ld[i] = 0;
        rd[i] = 0;
        if (i > 0) { ld[i] = SPREAD * (h[i] - h[i - 1]); v[i - 1] += ld[i]; }
        if (i < N - 1) { rd[i] = SPREAD * (h[i] - h[i + 1]); v[i + 1] += rd[i]; }
      }
      for (let i = 0; i < N; i++) {
        if (i > 0) h[i - 1] += ld[i];
        if (i < N - 1) h[i + 1] += rd[i];
      }
    }

    s.t += 0.016;
    const t = s.t;
    for (let i = 0; i < N; i++) {
      v[i] +=
        Math.sin(i * 0.10 + t * 0.7) * 0.04 +
        Math.sin(i * 0.04 + t * 0.45 + 1.3) * 0.025 +
        Math.sin(i * 0.20 + t * 1.2 + 3.7) * 0.012;
    }

    for (let i = s.pts.length - 1; i >= 0; i--) {
      const pt = s.pts[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.vy += 0.12;
      pt.life -= 0.016;
      if (pt.life <= 0) s.pts.splice(i, 1);
    }
  }, []);

  const render = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    const s = st.current;
    const { w, ht, dpr, h: hts, t, pts } = s;
    const sy = ht * SY_RATIO;
    const cw = w / (N - 1);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, ht);

    const fadeZone = sy * 0.7;
    const fadeG = ctx.createLinearGradient(0, 0, 0, sy + 30);
    fadeG.addColorStop(0, 'rgba(255,255,255,0)');
    fadeG.addColorStop(0.5, 'rgba(220,232,245,0.15)');
    fadeG.addColorStop(0.8, 'rgba(180,210,240,0.25)');
    fadeG.addColorStop(1, 'rgba(140,185,230,0.35)');
    ctx.fillStyle = fadeG;
    ctx.fillRect(0, fadeZone * 0.3, w, sy + 30 - fadeZone * 0.3);

    const points = [];
    for (let i = 0; i < N; i++) {
      points.push({ x: i * cw, y: sy - hts[i] });
    }

    ctx.beginPath();
    ctx.moveTo(-2, ht + 2);
    ctx.lineTo(-2, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const mx = (points[i - 1].x + points[i].x) * 0.5;
      const my = (points[i - 1].y + points[i].y) * 0.5;
      ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, mx, my);
    }
    ctx.lineTo(w + 2, points[points.length - 1].y);
    ctx.lineTo(w + 2, ht + 2);
    ctx.closePath();

    const wg = ctx.createLinearGradient(0, sy - 30, 0, ht);
    wg.addColorStop(0, 'rgba(45,120,190,0.45)');
    wg.addColorStop(0.06, 'rgba(35,100,175,0.55)');
    wg.addColorStop(0.15, 'rgba(25,78,148,0.68)');
    wg.addColorStop(0.30, 'rgba(18,58,118,0.78)');
    wg.addColorStop(0.50, 'rgba(12,40,88,0.86)');
    wg.addColorStop(0.75, 'rgba(8,25,60,0.92)');
    wg.addColorStop(1, 'rgba(4,14,38,0.97)');
    ctx.fillStyle = wg;
    ctx.fill();

    ctx.save();
    ctx.clip();

    const causticY = ht * 0.6;
    for (let x = 0; x < w; x += 3) {
      const c1 = Math.sin(x * 0.013 + t * 0.5);
      const c2 = Math.cos(x * 0.008 + t * 0.35 + 1.8);
      const c3 = Math.sin(x * 0.02 + t * 0.75 + 3.2);
      const val = (c1 * c1 * c2 * c2 + c3 * c3 * 0.25) * 0.35;
      if (val > 0.06) {
        ctx.fillStyle = `rgba(65,145,230,${val * 0.1})`;
        ctx.fillRect(x, causticY, 3, ht - causticY);
      }
    }

    ctx.globalAlpha = 0.04;
    for (let r = 0; r < 6; r++) {
      const rx = w * (0.08 + r * 0.16);
      const rw = 15 + Math.sin(t * 0.25 + r * 2.1) * 8;
      const sway = Math.sin(t * 0.3 + r * 1.5) * 10;
      ctx.beginPath();
      ctx.moveTo(rx - rw, sy + 5);
      ctx.lineTo(rx + rw, sy + 5);
      ctx.lineTo(rx + rw * 1.4 + sway, ht);
      ctx.lineTo(rx - rw * 0.3 + sway, ht);
      ctx.closePath();
      const rg = ctx.createLinearGradient(0, sy, 0, ht);
      rg.addColorStop(0, 'rgba(80,160,240,0.6)');
      rg.addColorStop(0.4, 'rgba(55,130,210,0.3)');
      rg.addColorStop(1, 'rgba(30,90,170,0)');
      ctx.fillStyle = rg;
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const mx = (points[i - 1].x + points[i].x) * 0.5;
      const my = (points[i - 1].y + points[i].y) * 0.5;
      ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, mx, my);
    }
    const slg = ctx.createLinearGradient(0, 0, w, 0);
    slg.addColorStop(0, 'rgba(130,195,255,0.15)');
    slg.addColorStop(0.25, 'rgba(150,210,255,0.4)');
    slg.addColorStop(0.5, 'rgba(170,220,255,0.5)');
    slg.addColorStop(0.75, 'rgba(150,210,255,0.4)');
    slg.addColorStop(1, 'rgba(130,195,255,0.15)');
    ctx.strokeStyle = slg;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y - 0.5);
    for (let i = 1; i < points.length; i++) {
      const mx = (points[i - 1].x + points[i].x) * 0.5;
      const my = (points[i - 1].y + points[i].y) * 0.5;
      ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y - 0.5, mx, my - 0.5);
    }
    ctx.strokeStyle = 'rgba(200,230,255,0.2)';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.restore();

    for (let i = 1; i < points.length - 1; i++) {
      const p = points[i - 1], c = points[i], nx = points[i + 1];
      if (c.y < p.y && c.y < nx.y) {
        const ch = ((p.y - c.y) + (nx.y - c.y)) * 0.5;
        if (ch > 0.6) {
          const inten = Math.min(ch * 0.055, 0.5);
          const gs = 6 + ch * 1.0;
          const sg = ctx.createRadialGradient(c.x, c.y - 2, 0, c.x, c.y, gs);
          sg.addColorStop(0, `rgba(210,235,255,${inten})`);
          sg.addColorStop(0.3, `rgba(160,210,250,${inten * 0.4})`);
          sg.addColorStop(1, 'rgba(120,185,240,0)');
          ctx.fillStyle = sg;
          ctx.fillRect(c.x - gs, c.y - gs - 2, gs * 2, gs * 2);
        }
      }
    }

    const rfg = ctx.createLinearGradient(0, sy - 2, 0, sy + 18);
    rfg.addColorStop(0, 'rgba(80,160,230,0)');
    rfg.addColorStop(0.2, 'rgba(80,160,230,0.06)');
    rfg.addColorStop(1, 'rgba(50,120,200,0)');
    ctx.fillStyle = rfg;
    ctx.fillRect(0, sy - 2, w, 20);

    for (let i = 0; i < pts.length; i++) {
      const pt = pts[i];
      const a = pt.life * 0.6;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.sz, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,230,255,${a})`;
      ctx.fill();
    }

    const vg = ctx.createLinearGradient(0, ht * 0.78, 0, ht);
    vg.addColorStop(0, 'rgba(3,10,28,0)');
    vg.addColorStop(1, 'rgba(3,10,28,0.3)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, ht * 0.78, w, ht * 0.22);
  }, []);

  const animate = useCallback(() => {
    physics();
    render();
    st.current.aid = requestAnimationFrame(animate);
  }, [physics, render]);

  const onMM = useCallback((e) => {
    const s = st.current;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const col = Math.floor((x / s.w) * N);

    if (s.ma && s.px >= 0) {
      const dx = x - s.px;
      const dy = y - s.py;
      const spd = Math.sqrt(dx * dx + dy * dy);
      const force = Math.min(spd * 0.45, 14);
      const surfAt = s.ht * SY_RATIO - (col >= 0 && col < N ? s.h[col] : 0);
      const dir = y > surfAt ? 1 : -1;
      if (col >= 0 && col < N) disturb(col, force * dir * 0.35);
    }
    s.px = x;
    s.py = y;
    s.ma = true;
  }, [disturb]);

  const onMD = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const s = st.current;
    const col = Math.floor((x / s.w) * N);
    if (col >= 0 && col < N) disturb(col, 10);
  }, [disturb]);

  const onML = useCallback(() => {
    const s = st.current;
    s.ma = false;
    s.px = -1;
    s.py = -1;
  }, []);

  const onTM = useCallback((e) => {
    const touch = e.touches[0];
    if (!touch) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const s = st.current;
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    const col = Math.floor((x / s.w) * N);
    if (s.px >= 0) {
      const dx = x - s.px;
      const dy = y - s.py;
      const spd = Math.sqrt(dx * dx + dy * dy);
      const force = Math.min(spd * 0.45, 14);
      if (col >= 0 && col < N) disturb(col, force * 0.35);
    }
    s.px = x;
    s.py = y;
  }, [disturb]);

  const onTE = useCallback(() => {
    const s = st.current;
    s.px = -1;
    s.py = -1;
  }, []);

  const onScroll = useCallback(() => {
    const sc = document.querySelector('.scroll-container');
    if (!sc) return;
    const s = st.current;
    const now = Date.now();
    const dt = Math.max(now - s.lsT, 1);
    const top = sc.scrollTop;
    const delta = Math.abs(top - s.lst);
    if (delta > 0) {
      const force = Math.min((delta / dt) * 7, 10);
      const count = Math.floor(N * 0.35);
      for (let i = 0; i < count; i++) {
        const idx = Math.floor(Math.random() * N);
        s.v[idx] += (Math.random() - 0.5) * force;
      }
    }
    s.lst = top;
    s.lsT = now;
  }, []);

  useEffect(() => {
    resize();
    const s = st.current;
    const sc = document.querySelector('.scroll-container');
    if (sc) sc.addEventListener('scroll', onScroll, { passive: true });
    const ro = new ResizeObserver(resize);
    if (containerRef.current) ro.observe(containerRef.current);
    s.aid = requestAnimationFrame(animate);
    return () => {
      if (s.aid) cancelAnimationFrame(s.aid);
      if (sc) sc.removeEventListener('scroll', onScroll);
      ro.disconnect();
    };
  }, [resize, animate, onScroll]);

  return (
    <div
      ref={containerRef}
      className="liquid-wave-container"
      onMouseMove={onMM}
      onMouseDown={onMD}
      onMouseLeave={onML}
      onTouchMove={onTM}
      onTouchEnd={onTE}
    >
      <canvas ref={canvasRef} className="liquid-wave-canvas" />
    </div>
  );
};

export default LiquidWave;
