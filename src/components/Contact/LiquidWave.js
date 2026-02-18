import React, { useRef, useEffect, useCallback } from 'react';
import './LiquidWave.scss';

const NUM_COLS = 160;
const SPRING_K = 0.025;
const DAMP = 0.985;
const SPREAD = 0.25;
const PASSES = 4;
const SURFACE_Y = 0.18;

const LiquidWave = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const stateRef = useRef({
    h: new Float32Array(NUM_COLS),
    v: new Float32Array(NUM_COLS),
    lD: new Float32Array(NUM_COLS),
    rD: new Float32Array(NUM_COLS),
    t: 0,
    aid: null,
    w: 0,
    ht: 0,
    dpr: 1,
    pmx: -1,
    pmy: -1,
    mActive: false,
    lsTop: 0,
    lsTime: Date.now(),
    particles: [],
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
    const s = stateRef.current;
    s.w = r.width;
    s.ht = r.height;
    s.dpr = dpr;
  }, []);

  const disturb = useCallback((col, force) => {
    const s = stateRef.current;
    const rad = Math.min(6 + Math.abs(force) * 0.4, 14);
    for (let i = Math.floor(-rad); i <= Math.ceil(rad); i++) {
      const idx = col + i;
      if (idx >= 0 && idx < NUM_COLS) {
        s.v[idx] += force * Math.cos((Math.abs(i) / (rad + 1)) * Math.PI * 0.5);
      }
    }
    if (Math.abs(force) > 2.5) {
      const x = (col / NUM_COLS) * s.w;
      const sy = s.ht * SURFACE_Y;
      const n = Math.min(Math.floor(Math.abs(force) * 1.8), 14);
      for (let p = 0; p < n; p++) {
        s.particles.push({
          x: x + (Math.random() - 0.5) * 24,
          y: sy,
          vx: (Math.random() - 0.5) * 5,
          vy: -(1.5 + Math.random() * Math.abs(force) * 0.7),
          life: 1,
          sz: 1 + Math.random() * 2.5,
        });
      }
    }
  }, []);

  const physics = useCallback(() => {
    const s = stateRef.current;
    const { h, v, lD, rD } = s;
    const n = NUM_COLS;

    for (let i = 0; i < n; i++) {
      v[i] += -SPRING_K * h[i];
      v[i] *= DAMP;
      h[i] += v[i];
    }

    for (let p = 0; p < PASSES; p++) {
      for (let i = 0; i < n; i++) {
        lD[i] = 0;
        rD[i] = 0;
        if (i > 0) {
          lD[i] = SPREAD * (h[i] - h[i - 1]);
          v[i - 1] += lD[i];
        }
        if (i < n - 1) {
          rD[i] = SPREAD * (h[i] - h[i + 1]);
          v[i + 1] += rD[i];
        }
      }
      for (let i = 0; i < n; i++) {
        if (i > 0) h[i - 1] += lD[i];
        if (i < n - 1) h[i + 1] += rD[i];
      }
    }

    s.t += 0.016;
    const t = s.t;
    for (let i = 0; i < n; i++) {
      v[i] +=
        Math.sin(i * 0.12 + t * 0.8) * 0.05 +
        Math.sin(i * 0.05 + t * 0.5 + 1.3) * 0.03 +
        Math.sin(i * 0.25 + t * 1.4 + 3.7) * 0.015;
    }

    for (let i = s.particles.length - 1; i >= 0; i--) {
      const pt = s.particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.vy += 0.14;
      pt.life -= 0.018;
      if (pt.life <= 0) s.particles.splice(i, 1);
    }
  }, []);

  const render = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    const s = stateRef.current;
    const { w, ht, dpr, h: heights, t, particles } = s;
    const sy = ht * SURFACE_Y;
    const cw = w / (NUM_COLS - 1);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, ht);

    const bg = ctx.createLinearGradient(0, 0, 0, ht);
    bg.addColorStop(0, 'rgba(6,14,30,0)');
    bg.addColorStop(SURFACE_Y, 'rgba(6,14,30,0.08)');
    bg.addColorStop(SURFACE_Y + 0.15, 'rgba(5,12,28,0.45)');
    bg.addColorStop(0.65, 'rgba(3,9,22,0.75)');
    bg.addColorStop(1, 'rgba(2,5,14,0.95)');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, ht);

    ctx.save();
    const cy = ht * 0.72;
    for (let x = 0; x < w; x += 3) {
      const c1 = Math.sin(x * 0.014 + t * 0.55);
      const c2 = Math.cos(x * 0.009 + t * 0.38 + 1.8);
      const c3 = Math.sin(x * 0.022 + t * 0.82 + 3.2);
      const val = (c1 * c1 * c2 * c2 + c3 * c3 * 0.3) * 0.4;
      if (val > 0.08) {
        ctx.fillStyle = `rgba(70,150,240,${val * 0.13})`;
        ctx.fillRect(x, cy, 3, ht - cy);
      }
    }
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = 0.05;
    for (let r = 0; r < 5; r++) {
      const rx = w * (0.12 + r * 0.19);
      const rw = 18 + Math.sin(t * 0.28 + r * 2.1) * 10;
      ctx.beginPath();
      ctx.moveTo(rx - rw, sy + 10);
      ctx.lineTo(rx + rw, sy + 10);
      ctx.lineTo(rx + rw * 1.6 + Math.sin(t * 0.4 + r) * 12, ht);
      ctx.lineTo(rx - rw * 0.4 + Math.sin(t * 0.35 + r * 1.7) * 12, ht);
      ctx.closePath();
      const rg = ctx.createLinearGradient(0, sy, 0, ht);
      rg.addColorStop(0, 'rgba(70,145,230,0.5)');
      rg.addColorStop(0.5, 'rgba(50,120,200,0.25)');
      rg.addColorStop(1, 'rgba(30,90,170,0)');
      ctx.fillStyle = rg;
      ctx.fill();
    }
    ctx.restore();

    const pts = [];
    for (let i = 0; i < NUM_COLS; i++) {
      pts.push({ x: i * cw, y: sy - heights[i] });
    }

    ctx.beginPath();
    ctx.moveTo(-1, ht + 1);
    ctx.lineTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      const mx = (pts[i - 1].x + pts[i].x) / 2;
      const my = (pts[i - 1].y + pts[i].y) / 2;
      ctx.quadraticCurveTo(pts[i - 1].x, pts[i - 1].y, mx, my);
    }
    ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    ctx.lineTo(w + 1, ht + 1);
    ctx.closePath();

    const wg = ctx.createLinearGradient(0, sy - 25, 0, ht);
    wg.addColorStop(0, 'rgba(22,68,130,0.55)');
    wg.addColorStop(0.12, 'rgba(16,52,105,0.65)');
    wg.addColorStop(0.35, 'rgba(10,35,75,0.78)');
    wg.addColorStop(0.65, 'rgba(6,22,52,0.88)');
    wg.addColorStop(1, 'rgba(3,10,30,0.96)');
    ctx.fillStyle = wg;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      const mx = (pts[i - 1].x + pts[i].x) / 2;
      const my = (pts[i - 1].y + pts[i].y) / 2;
      ctx.quadraticCurveTo(pts[i - 1].x, pts[i - 1].y, mx, my);
    }
    ctx.strokeStyle = 'rgba(100,185,245,0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    for (let i = 1; i < pts.length - 1; i++) {
      const p = pts[i - 1], c = pts[i], nx = pts[i + 1];
      if (c.y < p.y && c.y < nx.y) {
        const ch = ((p.y - c.y) + (nx.y - c.y)) * 0.5;
        if (ch > 0.8) {
          const inten = Math.min(ch * 0.06, 0.55);
          const gs = 5 + ch * 0.9;
          const sg = ctx.createRadialGradient(c.x, c.y - 1, 0, c.x, c.y - 1, gs);
          sg.addColorStop(0, `rgba(190,225,255,${inten})`);
          sg.addColorStop(0.4, `rgba(130,190,245,${inten * 0.35})`);
          sg.addColorStop(1, 'rgba(90,160,225,0)');
          ctx.fillStyle = sg;
          ctx.fillRect(c.x - gs, c.y - gs - 1, gs * 2, gs * 2);
        }
      }
    }

    const rfg = ctx.createLinearGradient(0, sy - 4, 0, sy + 22);
    rfg.addColorStop(0, 'rgba(55,135,215,0)');
    rfg.addColorStop(0.25, 'rgba(55,135,215,0.07)');
    rfg.addColorStop(1, 'rgba(35,95,175,0)');
    ctx.fillStyle = rfg;
    ctx.fillRect(0, sy - 4, w, 26);

    for (let i = 0; i < particles.length; i++) {
      const pt = particles[i];
      const a = pt.life * 0.65;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.sz, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(185,220,250,${a})`;
      ctx.fill();
    }

    const vg = ctx.createLinearGradient(0, ht * 0.75, 0, ht);
    vg.addColorStop(0, 'rgba(2,6,16,0)');
    vg.addColorStop(1, 'rgba(2,6,16,0.35)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, ht * 0.75, w, ht * 0.25);
  }, []);

  const animate = useCallback(() => {
    physics();
    render();
    stateRef.current.aid = requestAnimationFrame(animate);
  }, [physics, render]);

  const onMMove = useCallback((e) => {
    const s = stateRef.current;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const col = Math.floor((x / s.w) * NUM_COLS);

    if (s.mActive && s.pmx >= 0) {
      const dx = x - s.pmx;
      const dy = y - s.pmy;
      const spd = Math.sqrt(dx * dx + dy * dy);
      const force = Math.min(spd * 0.4, 12);
      const surfaceAtCol = s.ht * SURFACE_Y - (col >= 0 && col < NUM_COLS ? s.h[col] : 0);
      const dir = y > surfaceAtCol ? 1 : -1;
      if (col >= 0 && col < NUM_COLS) {
        disturb(col, force * dir * 0.35);
      }
    }
    s.pmx = x;
    s.pmy = y;
    s.mActive = true;
  }, [disturb]);

  const onMDown = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const s = stateRef.current;
    const col = Math.floor((x / s.w) * NUM_COLS);
    if (col >= 0 && col < NUM_COLS) disturb(col, 10);
  }, [disturb]);

  const onMLeave = useCallback(() => {
    const s = stateRef.current;
    s.mActive = false;
    s.pmx = -1;
    s.pmy = -1;
  }, []);

  const onTMove = useCallback((e) => {
    const touch = e.touches[0];
    if (!touch) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const s = stateRef.current;
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    const col = Math.floor((x / s.w) * NUM_COLS);
    if (s.pmx >= 0) {
      const dx = x - s.pmx;
      const dy = y - s.pmy;
      const spd = Math.sqrt(dx * dx + dy * dy);
      const force = Math.min(spd * 0.4, 12);
      if (col >= 0 && col < NUM_COLS) disturb(col, force * 0.35);
    }
    s.pmx = x;
    s.pmy = y;
  }, [disturb]);

  const onTEnd = useCallback(() => {
    const s = stateRef.current;
    s.pmx = -1;
    s.pmy = -1;
  }, []);

  const onScroll = useCallback(() => {
    const sc = document.querySelector('.scroll-container');
    if (!sc) return;
    const s = stateRef.current;
    const now = Date.now();
    const dt = Math.max(now - s.lsTime, 1);
    const st = sc.scrollTop;
    const delta = Math.abs(st - s.lsTop);
    if (delta > 0) {
      const force = Math.min((delta / dt) * 7, 10);
      const count = Math.floor(NUM_COLS * 0.35);
      for (let i = 0; i < count; i++) {
        const idx = Math.floor(Math.random() * NUM_COLS);
        s.v[idx] += (Math.random() - 0.5) * force;
      }
    }
    s.lsTop = st;
    s.lsTime = now;
  }, []);

  useEffect(() => {
    resize();
    const s = stateRef.current;
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
      onMouseMove={onMMove}
      onMouseDown={onMDown}
      onMouseLeave={onMLeave}
      onTouchMove={onTMove}
      onTouchEnd={onTEnd}
    >
      <canvas ref={canvasRef} className="liquid-wave-canvas" />
    </div>
  );
};

export default LiquidWave;
