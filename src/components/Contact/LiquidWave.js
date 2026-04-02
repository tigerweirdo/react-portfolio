import React, { useRef, useEffect, useCallback } from 'react';
import './LiquidWave.scss';

const N = 140; // Slightly fewer points for smoother curves
const SPRING = 0.007; // Extremely soft tension for heavy/viscous feel
const DAMP = 0.995; // Very low damping, waves oscillate for a long time
const SPREAD = 0.15; // Low spread, waves don't travel far
const PASSES = 4;
const SY_RATIO = 0.25;
const MAX_DROPS = 60;
const AIR_DRAG = 0.99;
const GRAVITY = 0.24; // Stronger gravity for punchy drops

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
    lst: 0,
    lsT: Date.now(),
    drops: [],
    splashes: [],
    fish: { x: -60, speed: 0.6, size: 24, tailPhase: 0, tailAmp: 0.4, depthOffset: 20 },
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
    const cnt = Math.min(Math.floor(impactForce * 2.5), 10);
    for (let p = 0; p < cnt; p++) {
      if (s.drops.length >= MAX_DROPS) break;
      const angle = -Math.PI * 0.2 - Math.random() * Math.PI * 0.6;
      const speed = 1.0 + Math.random() * impactForce * 0.6;
      s.drops.push({
        x: x + (Math.random() - 0.5) * 10,
        y: surfY - 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.6 + Math.random() * 0.4,
        sz: 1.0 + Math.random() * 2.0,
        grav: GRAVITY,
        isSplash: true,
      });
    }
  }, []);

  const physics = useCallback(() => {
    const s = st.current;
    const { h, v, ld, rd } = s;

    // Spring physics
    for (let i = 0; i < N; i++) {
      v[i] += -SPRING * h[i];
      v[i] *= DAMP;
      h[i] += v[i];
    }

    // Spread
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

    // Ambient motion
    s.t += 0.02;
    const t = s.t;
    for (let i = 0; i < N; i++) {
      v[i] += Math.sin(i * 0.1 + t * 0.5) * 0.015;
    }

    // Drops physics
    for (let i = s.drops.length - 1; i >= 0; i--) {
      const d = s.drops[i];

      d.vy += d.grav;
      d.vx *= AIR_DRAG;
      d.vy *= AIR_DRAG;
      d.x += d.vx;
      d.y += d.vy;
      d.life -= 0.015;

      // Bounce off walls
      if (d.x < 0 || d.x > s.w) {
        d.vx *= -0.6;
        d.x = Math.max(0, Math.min(d.x, s.w));
      }

      const surfAtDrop = getSurfaceY(s, d.x);

      // Hit surface
      if (d.vy > 0 && d.y >= surfAtDrop) {
        const col = Math.floor((d.x / s.w) * N);
        if (col >= 0 && col < N) {
          const impactForce = d.vy * d.sz * 0.6; // Stronger impact
          const impactRad = Math.min(Math.ceil(d.sz * 2.0), 10);
          
          // Create wave
          for (let r = -impactRad; r <= impactRad; r++) {
            const idx = col + r;
            if (idx >= 0 && idx < N) {
              const falloff = Math.cos((Math.abs(r) / (impactRad + 1)) * Math.PI * 0.5);
              s.v[idx] += impactForce * falloff;
            }
          }

          // Create splash ring
          s.splashes.push({
            x: d.x,
            y: surfAtDrop,
            radius: 0,
            maxRadius: 10 + d.sz * 5,
            alpha: 0.8,
            life: 1.0,
            width: 3 + d.sz // Thicker lines for cartoon look
          });

          // Secondary splash
          if (!d.isSplash && d.vy > 2.0) {
            spawnSplash(s, d.x, surfAtDrop, d.vy * d.sz * 0.4);
          }
        }

        s.drops.splice(i, 1);
        continue;
      }

      if (d.life <= 0) s.drops.splice(i, 1);
    }

    // Splash rings physics
    for (let i = s.splashes.length - 1; i >= 0; i--) {
      const sp = s.splashes[i];
      sp.life -= 0.05;
      sp.radius += (sp.maxRadius - sp.radius) * 0.2; // Snappy expansion
      if (sp.life <= 0) s.splashes.splice(i, 1);
    }

    // Fish swimming
    const f = s.fish;
    f.tailPhase += 0.12;
    f.x += f.speed;
    if (f.x > s.w + 80) {
      f.x = -80;
      f.depthOffset = 15 + Math.random() * 25;
      f.size = 20 + Math.random() * 12;
      f.speed = 0.5 + Math.random() * 0.4;
    }
  }, [getSurfaceY, spawnSplash]);

  const render = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    const s = st.current;
    const { w, ht, dpr, h: hts, drops, splashes } = s;
    const sy = ht * SY_RATIO;
    const cw = w / (N - 1);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, ht);

    // Build surface path
    const points = [];
    for (let i = 0; i < N; i++) {
      points.push({ x: i * cw, y: sy - hts[i] });
    }

    // Draw main liquid body
    ctx.beginPath();
    ctx.moveTo(-10, ht + 10);
    ctx.lineTo(-10, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const mx = (points[i - 1].x + points[i].x) * 0.5;
      const my = (points[i - 1].y + points[i].y) * 0.5;
      ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, mx, my);
    }
    ctx.lineTo(w + 10, points[points.length - 1].y);
    ctx.lineTo(w + 10, ht + 10);
    ctx.closePath();

    // Cartoon style gradient - sharper transitions
    const wg = ctx.createLinearGradient(0, sy - 40, 0, ht);
    wg.addColorStop(0, '#4facfe'); // Bright blue top
    wg.addColorStop(0.1, '#00f2fe'); // Cyan highlight
    wg.addColorStop(0.4, '#0061ff'); // Deep blue body
    wg.addColorStop(1, '#002fa7'); // Dark bottom
    ctx.fillStyle = wg;
    ctx.fill();

    // Draw swimming fish (just under the surface)
    {
      const f = s.fish;
      const surfaceAtX = getSurfaceY(s, f.x);
      const fy = surfaceAtX + f.depthOffset;
      const bodyLen = f.size * 1.6;
      const bodyH = f.size * 0.55;
      const tailSway = Math.sin(f.tailPhase) * f.tailAmp * f.size;

      ctx.save();
      ctx.translate(f.x, fy);

      // Body
      ctx.beginPath();
      ctx.moveTo(bodyLen * 0.5, 0);
      ctx.bezierCurveTo(
        bodyLen * 0.3, -bodyH,
        -bodyLen * 0.2, -bodyH,
        -bodyLen * 0.35, -bodyH * 0.3
      );
      ctx.lineTo(-bodyLen * 0.35 + tailSway * 0.3, -bodyH * 0.3);
      ctx.lineTo(-bodyLen * 0.35 + tailSway, -bodyH * 0.8);
      ctx.lineTo(-bodyLen * 0.35 + tailSway, bodyH * 0.8);
      ctx.lineTo(-bodyLen * 0.35 + tailSway * 0.3, bodyH * 0.3);
      ctx.bezierCurveTo(
        -bodyLen * 0.2, bodyH,
        bodyLen * 0.3, bodyH,
        bodyLen * 0.5, 0
      );
      ctx.closePath();

      const fishGrad = ctx.createLinearGradient(-bodyLen * 0.3, -bodyH, bodyLen * 0.5, 0);
      fishGrad.addColorStop(0, '#ff8c00');
      fishGrad.addColorStop(0.5, '#ffaa33');
      fishGrad.addColorStop(1, '#ff7700');
      ctx.fillStyle = fishGrad;
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 140, 0, 0.5)';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Eye
      const eyeR = f.size * 0.1;
      const eyeX = bodyLen * 0.3;
      const eyeY = -bodyH * 0.15;
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, eyeR, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(eyeX + eyeR * 0.3, eyeY, eyeR * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = '#1a1a2e';
      ctx.fill();

      // Subtle scale pattern
      ctx.globalAlpha = 0.15;
      for (let sc = 0; sc < 3; sc++) {
        const sx = bodyLen * 0.1 - sc * bodyLen * 0.12;
        ctx.beginPath();
        ctx.arc(sx, 0, bodyH * 0.65, -0.5, 0.5);
        ctx.strokeStyle = '#ffd470';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    // Top highlight rim (Cartoon outline effect)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const mx = (points[i - 1].x + points[i].x) * 0.5;
      const my = (points[i - 1].y + points[i].y) * 0.5;
      ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, mx, my);
    }
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();

    // Draw splashes (Rings)
    if (splashes.length > 0) {
      for (let i = 0; i < splashes.length; i++) {
        const sp = splashes[i];
        ctx.beginPath();
        ctx.ellipse(sp.x, sp.y, sp.radius, sp.radius * 0.3, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${sp.alpha})`;
        ctx.lineWidth = sp.width * sp.life;
        ctx.stroke();
      }
    }

    // Draw drops with Squash & Stretch
    if (drops.length > 0) {
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        const sz = d.sz * 2.5; // Bigger drops for cartoon look
        
        // Calculate squash and stretch based on velocity
        const speed = Math.sqrt(d.vx * d.vx + d.vy * d.vy);
        const angle = Math.atan2(d.vy, d.vx);
        const stretch = 1 + Math.min(speed * 0.15, 0.8); // Cap stretch
        const squash = 1 / Math.sqrt(stretch); // Conserve volume

        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(angle);
        ctx.scale(stretch, squash);
        
        ctx.beginPath();
        ctx.arc(0, 0, sz, 0, Math.PI * 2);
        ctx.fillStyle = '#00f2fe'; // Bright cyan drops
        ctx.fill();

        // Highlight dot (Glossy look)
        ctx.beginPath();
        ctx.arc(-sz * 0.3, -sz * 0.3, sz * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();

        ctx.restore();
      }
    }

  }, []);

  const animate = useCallback(() => {
    physics();
    render();
    st.current.aid = requestAnimationFrame(animate);
  }, [physics, render]);

  // Interaction handlers (Mouse/Touch) - REMOVED
  /*
  const onMM = useCallback((e) => { ... }, [disturb]);
  const onMD = useCallback((e) => { ... }, [disturb]);
  const onML = useCallback(() => { ... }, []);
  const onTM = useCallback((e) => { ... }, [disturb]);
  const onTE = useCallback(() => { ... }, []);
  */

  const onScroll = useCallback(() => {
    const sc = document.querySelector('.scroll-container');
    if (!sc) return;
    const s = st.current;
    const now = Date.now();
    const dt = Math.max(now - s.lsT, 1);
    const top = sc.scrollTop;
    const delta = Math.abs(top - s.lst);
    if (delta > 0) {
      const force = Math.min((delta / dt) * 8, 12);
      const count = Math.floor(N * 0.4);
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
    >
      <canvas ref={canvasRef} className="liquid-wave-canvas" />
    </div>
  );
};

export default LiquidWave;
