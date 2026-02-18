import React, { useRef, useEffect, useCallback } from 'react';
import './LiquidWave.scss';

const N = 160;
const SPRING = 0.018;
const DAMP = 0.975;
const SPREAD = 0.2;
const PASSES = 3;
const SY_RATIO = 0.40;
const MAX_DROPS = 80;
const AIR_DRAG = 0.992;
const DROP_MIN_Y = 4;

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
    drops: [],
    splashes: [],
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

  const getSurfaceY = useCallback((s, worldX) => {
    const col = Math.floor((worldX / s.w) * N);
    const clamped = Math.max(0, Math.min(col, N - 1));
    return s.ht * SY_RATIO - s.h[clamped];
  }, []);

  const spawnSplash = useCallback((s, x, surfY, impactForce) => {
    const cnt = Math.min(Math.floor(impactForce * 1.8), 8);
    for (let p = 0; p < cnt; p++) {
      if (s.drops.length >= MAX_DROPS) break;
      const angle = -Math.PI * 0.25 - Math.random() * Math.PI * 0.5;
      const speed = 0.5 + Math.random() * impactForce * 0.4;
      s.drops.push({
        x: x + (Math.random() - 0.5) * 6,
        y: surfY - 1,
        vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1),
        vy: Math.sin(angle) * speed,
        life: 0.4 + Math.random() * 0.3,
        sz: 0.5 + Math.random() * 1.5,
        grav: 0.08 + Math.random() * 0.04,
        isSplash: true,
      });
    }
  }, []);

  const disturb = useCallback((col, force) => {
    const s = st.current;
    const rad = Math.min(6 + Math.abs(force) * 0.5, 16);
    for (let i = Math.floor(-rad); i <= Math.ceil(rad); i++) {
      const idx = col + i;
      if (idx >= 0 && idx < N) {
        s.v[idx] += force * Math.cos((Math.abs(i) / (rad + 1)) * Math.PI * 0.5);
      }
    }
    if (Math.abs(force) > 1.2) {
      const x = (col / N) * s.w;
      const surfY = getSurfaceY(s, x);
      const intensity = Math.abs(force);
      const cnt = Math.min(Math.floor(intensity * 2), 14);
      const maxSurfH = s.ht * SY_RATIO * 0.55;
      for (let p = 0; p < cnt; p++) {
        if (s.drops.length >= MAX_DROPS) break;
        const angle = -Math.PI * 0.2 - Math.random() * Math.PI * 0.6;
        const speed = 0.8 + Math.random() * Math.min(intensity * 0.55, 3.5);
        const maxVy = maxSurfH * 0.06;
        const rawVy = Math.sin(angle) * speed - 0.3;
        s.drops.push({
          x: x + (Math.random() - 0.5) * 12,
          y: surfY - Math.random() * 2,
          vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1) * 0.7,
          vy: Math.max(rawVy, -maxVy),
          life: 1.0 + Math.random() * 0.6,
          sz: 0.8 + Math.random() * 2.5 * Math.min(intensity * 0.2, 1),
          grav: 0.065 + Math.random() * 0.045,
          isSplash: false,
        });
      }
    }
  }, [getSurfaceY]);

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

    const headroom = s.ht * SY_RATIO * 0.85;
    for (let i = 0; i < N; i++) {
      if (h[i] > headroom) {
        const excess = (h[i] - headroom) / headroom;
        v[i] -= excess * 1.5;
        v[i] *= 0.92;
      }
      if (h[i] < -headroom * 0.6) {
        const excess = (-h[i] - headroom * 0.6) / headroom;
        v[i] += excess * 1.2;
        v[i] *= 0.92;
      }
    }

    s.t += 0.016;
    const t = s.t;
    for (let i = 0; i < N; i++) {
      v[i] +=
        Math.sin(i * 0.08 + t * 0.4) * 0.008 +
        Math.sin(i * 0.03 + t * 0.25 + 1.3) * 0.005 +
        Math.sin(i * 0.15 + t * 0.6 + 3.7) * 0.003;
    }

    for (let i = s.drops.length - 1; i >= 0; i--) {
      const d = s.drops[i];

      d.vy += d.grav;
      d.vx *= AIR_DRAG;
      d.vy *= AIR_DRAG;
      d.x += d.vx;
      d.y += d.vy;
      d.life -= 0.012;

      if (d.y < DROP_MIN_Y) {
        d.y = DROP_MIN_Y;
        d.vy = Math.abs(d.vy) * 0.3;
      }

      const surfAtDrop = getSurfaceY(s, d.x);

      if (d.vy > 0 && d.y >= surfAtDrop) {
        const col = Math.floor((d.x / s.w) * N);
        if (col >= 0 && col < N) {
          const impactForce = d.vy * d.sz * 0.35;
          const impactRad = Math.min(Math.ceil(d.sz * 1.5), 8);
          for (let r = -impactRad; r <= impactRad; r++) {
            const idx = col + r;
            if (idx >= 0 && idx < N) {
              const falloff = Math.cos((Math.abs(r) / (impactRad + 1)) * Math.PI * 0.5);
              s.v[idx] += impactForce * falloff;
            }
          }

          s.splashes.push({
            x: d.x,
            y: surfAtDrop,
            radius: 0,
            maxRadius: 8 + d.sz * 4,
            alpha: 0.5 + Math.min(d.vy * 0.1, 0.3),
            life: 1.0,
          });

          if (!d.isSplash && d.vy > 1.0 && d.sz > 1.0) {
            spawnSplash(s, d.x, surfAtDrop, d.vy * d.sz * 0.3);
          }
        }

        s.drops.splice(i, 1);
        continue;
      }

      if (d.life <= 0 || d.x < -20 || d.x > s.w + 20) {
        s.drops.splice(i, 1);
      }
    }

    for (let i = s.splashes.length - 1; i >= 0; i--) {
      const sp = s.splashes[i];
      sp.life -= 0.04;
      sp.radius += (sp.maxRadius - sp.radius) * 0.15;
      sp.alpha *= 0.94;
      if (sp.life <= 0) {
        s.splashes.splice(i, 1);
      }
    }
  }, [getSurfaceY, spawnSplash]);

  const render = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    const s = st.current;
    const { w, ht, dpr, h: hts, t, drops } = s;
    const sy = ht * SY_RATIO;
    const cw = w / (N - 1);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, ht);

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

    const wg = ctx.createLinearGradient(0, sy - 20, 0, ht);
    wg.addColorStop(0, 'rgba(40,105,178,0.80)');
    wg.addColorStop(0.04, 'rgba(32,88,162,0.88)');
    wg.addColorStop(0.10, 'rgba(24,70,142,0.92)');
    wg.addColorStop(0.22, 'rgba(18,55,120,0.95)');
    wg.addColorStop(0.42, 'rgba(12,38,92,0.97)');
    wg.addColorStop(0.68, 'rgba(7,24,62,0.98)');
    wg.addColorStop(1, 'rgba(3,12,35,1)');
    ctx.fillStyle = wg;
    ctx.fill();

    ctx.save();
    ctx.clip();

    const causticY = ht * 0.55;
    for (let x = 0; x < w; x += 3) {
      const c1 = Math.sin(x * 0.013 + t * 0.5);
      const c2 = Math.cos(x * 0.008 + t * 0.35 + 1.8);
      const c3 = Math.sin(x * 0.02 + t * 0.75 + 3.2);
      const val = (c1 * c1 * c2 * c2 + c3 * c3 * 0.25) * 0.35;
      if (val > 0.06) {
        ctx.fillStyle = `rgba(55,140,225,${val * 0.12})`;
        ctx.fillRect(x, causticY, 3, ht - causticY);
      }
    }

    ctx.globalAlpha = 0.045;
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
    slg.addColorStop(0, 'rgba(120,190,250,0.15)');
    slg.addColorStop(0.2, 'rgba(145,208,255,0.45)');
    slg.addColorStop(0.5, 'rgba(165,222,255,0.55)');
    slg.addColorStop(0.8, 'rgba(145,208,255,0.45)');
    slg.addColorStop(1, 'rgba(120,190,250,0.15)');
    ctx.strokeStyle = slg;
    ctx.lineWidth = 2.2;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y - 1);
    for (let i = 1; i < points.length; i++) {
      const mx = (points[i - 1].x + points[i].x) * 0.5;
      const my = (points[i - 1].y + points[i].y) * 0.5;
      ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y - 1, mx, my - 1);
    }
    ctx.strokeStyle = 'rgba(210,235,255,0.22)';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.restore();

    for (let i = 1; i < points.length - 1; i++) {
      const p = points[i - 1], c = points[i], nx = points[i + 1];
      if (c.y < p.y && c.y < nx.y) {
        const ch = ((p.y - c.y) + (nx.y - c.y)) * 0.5;
        if (ch > 0.5) {
          const inten = Math.min(ch * 0.06, 0.55);
          const gs = 7 + ch * 1.1;
          const sg = ctx.createRadialGradient(c.x, c.y - 2, 0, c.x, c.y, gs);
          sg.addColorStop(0, `rgba(215,240,255,${inten})`);
          sg.addColorStop(0.3, `rgba(165,215,250,${inten * 0.4})`);
          sg.addColorStop(1, 'rgba(120,185,240,0)');
          ctx.fillStyle = sg;
          ctx.fillRect(c.x - gs, c.y - gs - 2, gs * 2, gs * 2);
        }
      }
    }

    const rfg = ctx.createLinearGradient(0, sy - 2, 0, sy + 20);
    rfg.addColorStop(0, 'rgba(70,155,225,0)');
    rfg.addColorStop(0.15, 'rgba(70,155,225,0.07)');
    rfg.addColorStop(1, 'rgba(45,115,195,0)');
    ctx.fillStyle = rfg;
    ctx.fillRect(0, sy - 2, w, 22);

    const { splashes } = s;
    if (splashes.length > 0) {
      for (let i = 0; i < splashes.length; i++) {
        const sp = splashes[i];
        if (sp.alpha < 0.02) continue;
        ctx.beginPath();
        ctx.ellipse(sp.x, sp.y, sp.radius, sp.radius * 0.35, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(180,220,255,${sp.alpha * 0.6})`;
        ctx.lineWidth = Math.max(0.5, 1.5 * sp.life);
        ctx.stroke();

        if (sp.life > 0.5) {
          const inner = sp.radius * 0.5;
          ctx.beginPath();
          ctx.ellipse(sp.x, sp.y, inner, inner * 0.3, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(210,240,255,${sp.alpha * 0.3})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    if (drops.length > 0) {
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        const a = Math.min(d.life, 1);
        const sz = d.sz * (0.6 + a * 0.4);
        if (sz < 0.3) continue;

        const speed = Math.sqrt(d.vx * d.vx + d.vy * d.vy);

        if (d.vy > 0.5 && speed > 1) {
          const tailLen = Math.min(speed * 1.8, 10);
          const nx = -d.vx / speed;
          const ny = -d.vy / speed;
          ctx.beginPath();
          ctx.moveTo(d.x + ny * sz * 0.5, d.y - nx * sz * 0.5);
          ctx.quadraticCurveTo(
            d.x + nx * tailLen * 0.5, d.y + ny * tailLen * 0.5,
            d.x + nx * tailLen, d.y + ny * tailLen
          );
          ctx.quadraticCurveTo(
            d.x + nx * tailLen * 0.5, d.y + ny * tailLen * 0.5,
            d.x - ny * sz * 0.5, d.y + nx * sz * 0.5
          );
          ctx.closePath();
          ctx.fillStyle = `rgba(160,210,248,${a * 0.25})`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(d.x, d.y, sz, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,220,250,${a * 0.8})`;
        ctx.fill();

        if (sz > 1.2) {
          const hlX = d.x - sz * 0.25;
          const hlY = d.y - sz * 0.3;
          const hlR = sz * 0.4;
          ctx.beginPath();
          ctx.arc(hlX, hlY, hlR, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(230,245,255,${a * 0.5})`;
          ctx.fill();
        }

        if (sz > 1.5 && a > 0.3) {
          const glR = sz * 2;
          const gl = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, glR);
          gl.addColorStop(0, `rgba(140,200,245,${a * 0.12})`);
          gl.addColorStop(1, 'rgba(100,170,230,0)');
          ctx.fillStyle = gl;
          ctx.fillRect(d.x - glR, d.y - glR, glR * 2, glR * 2);
        }
      }
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
      const force = Math.min(spd * 0.35, 10);
      const surfAt = s.ht * SY_RATIO - (col >= 0 && col < N ? s.h[col] : 0);
      const dir = y > surfAt ? 1 : -1;
      if (col >= 0 && col < N) disturb(col, force * dir * 0.25);
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
    if (col >= 0 && col < N) disturb(col, 8);
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
      const force = Math.min(spd * 0.35, 10);
      if (col >= 0 && col < N) disturb(col, force * 0.25);
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
      const force = Math.min((delta / dt) * 4, 6);
      const count = Math.floor(N * 0.25);
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
