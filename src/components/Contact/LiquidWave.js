import React, { useRef, useEffect, useCallback, useState } from 'react';
import './LiquidWave.scss';

/** Yüzey çözünürlüğü. 56 kolon 1280px'de ~23px/kolon demekti — su için fazla kaba. */
const N = 96;
/**
 * Etkileşimli dalgacıklar (scroll / damla çarpması) için yay-kütle sistemi.
 * Eski değerler (SPRING 0.012, DAMP 0.992) bozulmaları çok uzun süre
 * canlı tutuyordu; sonuç jelatinimsi, lastik bir yüzeydi. Su daha sert
 * geri gelir ve daha hızlı sönümlenir.
 */
const SPRING = 0.022;
const DAMP = 0.976;
const SPREAD = 0.18;
const PASSES = 2;

/**
 * Ortam kabarması (swell): birbirine oranı irrasyonel, farklı dalga boyu ve
 * hızda katmanların toplamı. Tek bir sinüs "duran dalga" gibi görünür;
 * üst üste binen ve farklı yönlere ilerleyen katmanlar gözle
 * tekrar yakalanamayan, organik bir su yüzeyi verir.
 *
 * len : dalga boyu (genişliğin oranı)   spd : açısal hız   dir : ilerleme yönü
 */
const SWELL = [
  { amp: 4.5, len: 0.90,  spd: 0.50, phase: 0.0, dir: -1 },
  { amp: 2.4, len: 0.47,  spd: 0.85, phase: 1.7, dir: -1 },
  { amp: 1.2, len: 0.26,  spd: 1.30, phase: 3.1, dir: +1 }, // ters yön → girişim
  { amp: 0.6, len: 0.145, spd: 2.00, phase: 0.6, dir: -1 },
];
/** Tüm yüzeyin çok yavaş alçalıp yükselmesi — "nefes alma" */
const TIDE_AMP = 1.6;
const TIDE_SPD = 0.13;
const SY_RATIO = 0.25;
const MAX_DROPS = 28;
const AIR_DRAG = 0.99;
const GRAVITY = 0.24;
/** ~30 FPS: render maliyetini yaklaşık yarıya indirir */
const MIN_FRAME_MS = 1000 / 30;
/** DPR sınırı: retina ekranlarda bile makul piksel sayısı */
const MAX_DPR = 1.5;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const fn = () => setReduced(mq.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);
  return reduced;
}

const LiquidWave = () => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const canvasRef = useRef(null);
  const canvasCtxRef = useRef(null);
  const lastFrameTsRef = useRef(0);
  const containerRef = useRef(null);
  /** Throttle: ağır scroll gövdesi en fazla ~31/s */
  const scrollWorkLastRunRef = useRef(0);
  /** rAF döngüsü — useEffect bağımlılığı olmadan güncel physics/render kullanır */
  const animateRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
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
  });

  const resize = useCallback(() => {
    const cv = canvasRef.current;
    const ct = containerRef.current;
    if (!cv || !ct) return;
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const r = ct.getBoundingClientRect();
    cv.width = r.width * dpr;
    cv.height = r.height * dpr;
    cv.style.width = `${r.width}px`;
    cv.style.height = `${r.height}px`;
    canvasCtxRef.current = cv.getContext('2d', { alpha: true });
    const s = st.current;
    s.w = r.width;
    s.ht = r.height;
    s.dpr = dpr;
  }, []);

  /**
   * Ortam kabarmasının verilen kolondaki yüksekliği. Yay sistemine
   * enerji pompalamak yerine analitik olarak hesaplanıp yüzeye eklenir:
   * böylece ortam hareketi ile çarpma dalgacıkları birbirine karışmaz.
   */
  const swellAt = useCallback((s, col) => {
    const u = col / (N - 1);
    const t = s.t;
    let y = TIDE_AMP * Math.sin(t * TIDE_SPD);
    for (let k = 0; k < SWELL.length; k++) {
      const { amp, len, spd, phase, dir } = SWELL[k];
      y += amp * Math.sin((2 * Math.PI * u) / len + dir * spd * t + phase);
    }
    return y;
  }, []);

  const getSurfaceY = useCallback(
    (s, worldX) => {
      const col = Math.floor((worldX / s.w) * N);
      const clamped = Math.max(0, Math.min(col, N - 1));
      return s.ht * SY_RATIO - (s.h[clamped] + swellAt(s, clamped));
    },
    [swellAt]
  );

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

    for (let i = 0; i < N; i++) {
      v[i] += -SPRING * h[i];
      v[i] *= DAMP;
      h[i] += v[i];
    }

    for (let p = 0; p < PASSES; p++) {
      for (let i = 0; i < N; i++) {
        ld[i] = 0;
        rd[i] = 0;
        if (i > 0) {
          ld[i] = SPREAD * (h[i] - h[i - 1]);
          v[i - 1] += ld[i];
        }
        if (i < N - 1) {
          rd[i] = SPREAD * (h[i] - h[i + 1]);
          v[i + 1] += rd[i];
        }
      }
      for (let i = 0; i < N; i++) {
        if (i > 0) h[i - 1] += ld[i];
        if (i < N - 1) h[i + 1] += rd[i];
      }
    }

    // Ortam hareketi artık burada üretilmiyor. Eskiden tek bir sinüs
    // doğrudan hız dizisine ekleniyordu (v[i] += sin(i*0.1 + t*0.5)) ve
    // yüzeyi tek frekanslı, mekanik bir salınıma kilitliyordu.
    // Kabarma render/çarpışma anında swellAt() ile ekleniyor.
    s.t += 0.05;

    for (let i = s.drops.length - 1; i >= 0; i--) {
      const d = s.drops[i];

      d.vy += d.grav;
      d.vx *= AIR_DRAG;
      d.vy *= AIR_DRAG;
      d.x += d.vx;
      d.y += d.vy;
      d.life -= 0.015;

      if (d.x < 0 || d.x > s.w) {
        d.vx *= -0.6;
        d.x = Math.max(0, Math.min(d.x, s.w));
      }

      const surfAtDrop = getSurfaceY(s, d.x);

      if (d.vy > 0 && d.y >= surfAtDrop) {
        const col = Math.floor((d.x / s.w) * N);
        if (col >= 0 && col < N) {
          const impactForce = d.vy * d.sz * 0.6;
          const impactRad = Math.min(Math.ceil(d.sz * 2.0), 10);

          for (let r = -impactRad; r <= impactRad; r++) {
            const idx = col + r;
            if (idx >= 0 && idx < N) {
              const falloff = Math.cos(
                (Math.abs(r) / (impactRad + 1)) * Math.PI * 0.5
              );
              s.v[idx] += impactForce * falloff;
            }
          }

          s.splashes.push({
            x: d.x,
            y: surfAtDrop,
            radius: 0,
            maxRadius: 10 + d.sz * 5,
            alpha: 0.8,
            life: 1.0,
            width: 3 + d.sz,
          });

          if (!d.isSplash && d.vy > 2.0) {
            spawnSplash(s, d.x, surfAtDrop, d.vy * d.sz * 0.4);
          }
        }

        s.drops.splice(i, 1);
        continue;
      }

      if (d.life <= 0) s.drops.splice(i, 1);
    }

    for (let i = s.splashes.length - 1; i >= 0; i--) {
      const sp = s.splashes[i];
      sp.life -= 0.05;
      sp.radius += (sp.maxRadius - sp.radius) * 0.2;
      if (sp.life <= 0) s.splashes.splice(i, 1);
    }
  }, [getSurfaceY, spawnSplash]);

  const render = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    let ctx = canvasCtxRef.current;
    if (!ctx) {
      ctx = cv.getContext('2d', { alpha: true });
      canvasCtxRef.current = ctx;
    }
    if (!ctx) return;

    const s = st.current;
    const { w, ht, dpr, h: hts, drops, splashes } = s;
    const sy = ht * SY_RATIO;
    const cw = w / (N - 1);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, ht);

    // Yüzey noktaları = etkileşimli dalgacık + ortam kabarması
    const points = [];
    for (let i = 0; i < N; i++) {
      points.push({ x: i * cw, y: sy - (hts[i] + swellAt(s, i)) });
    }

    // Bir yüzey eğrisini AÇIK OLAN alt yola ekler. `lift` ile aynı eğri
    // dikeyde kaydırılarak arka katman elde edilir.
    //
    // DİKKAT: burada `moveTo` KULLANILMAZ. Çağıran taraf poligonu zaten
    // sol kenardan başlatmış oluyor; `moveTo` yeni bir alt yol (subpath)
    // açar ve poligonu ortadan ikiye böler — sonuç, su kütlesi yerine
    // çapraz bir kama olur.
    const tracePath = (lift) => {
      ctx.lineTo(points[0].x, points[0].y + lift);
      for (let i = 1; i < points.length; i++) {
        const mx = (points[i - 1].x + points[i].x) * 0.5;
        const my = (points[i - 1].y + points[i].y) * 0.5 + lift;
        ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y + lift, mx, my);
      }
    };

    // --- Arka katman: paralaks kabarma. Tek bir düz yüzey yerine
    //     üst üste iki su kütlesi görmek hacim/derinlik hissi verir.
    ctx.beginPath();
    ctx.moveTo(-10, ht + 10);
    ctx.lineTo(-10, points[0].y + 9);
    tracePath(9);
    ctx.lineTo(w + 10, points[points.length - 1].y + 9);
    ctx.lineTo(w + 10, ht + 10);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0, 47, 167, 0.55)';
    ctx.fill();

    // --- Ana su kütlesi
    ctx.beginPath();
    ctx.moveTo(-10, ht + 10);
    ctx.lineTo(-10, points[0].y);
    tracePath(0);
    ctx.lineTo(w + 10, points[points.length - 1].y);
    ctx.lineTo(w + 10, ht + 10);
    ctx.closePath();

    const wg = ctx.createLinearGradient(0, sy - 40, 0, ht);
    wg.addColorStop(0, '#4facfe');
    wg.addColorStop(0.1, '#00f2fe');
    wg.addColorStop(0.4, '#0061ff');
    wg.addColorStop(1, '#002fa7');
    ctx.fillStyle = wg;
    ctx.fill();

    // --- Tepe ışığı: sabit 4px beyaz çizgi lastik bir kontur gibi
    //     duruyordu. Çizgi kalınlığı/opaklığı yerel eğime göre değişince
    //     ışık yalnızca dalga tepelerinde parlar.
    ctx.save();
    ctx.lineCap = 'round';
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      const slope = Math.min(Math.abs(p1.y - p0.y) / cw, 1);
      const crest = 1 - slope;            // düz tepeler parlar, dik yamaçlar sönük
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.14 + crest * 0.34})`;
      ctx.lineWidth = 1.4 + crest * 1.8;
      ctx.stroke();
    }
    ctx.restore();

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

    if (drops.length > 0) {
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        const sz = d.sz * 2.5;
        const speed = Math.sqrt(d.vx * d.vx + d.vy * d.vy);
        const angle = Math.atan2(d.vy, d.vx);
        const stretch = 1 + Math.min(speed * 0.15, 0.8);
        const squash = 1 / Math.sqrt(stretch);

        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(angle);
        ctx.scale(stretch, squash);

        ctx.beginPath();
        ctx.arc(0, 0, sz, 0, Math.PI * 2);
        ctx.fillStyle = '#00f2fe';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(-sz * 0.3, -sz * 0.3, sz * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();

        ctx.restore();
      }
    }
  }, [swellAt]);

  animateRef.current = (now) => {
    const t =
      typeof now === 'number' && Number.isFinite(now)
        ? now
        : performance.now();
    const prev = lastFrameTsRef.current;
    if (prev > 0 && t - prev < MIN_FRAME_MS) {
      st.current.aid = requestAnimationFrame((n) => animateRef.current?.(n));
      return;
    }
    lastFrameTsRef.current = t;

    /* Tek fizik adımı: SPRING/SPREAD artırılarak simülasyon hızı korunuyor */
    physics();
    render();
    st.current.aid = requestAnimationFrame((n) => animateRef.current?.(n));
  };

  const onScroll = useCallback(() => {
    const now = Date.now();
    if (now - scrollWorkLastRunRef.current < 32) return;
    scrollWorkLastRunRef.current = now;

    const sc = document.querySelector('.scroll-container');
    if (!sc) return;
    const s = st.current;
    const dt = Math.max(now - s.lsT, 1);
    const top = sc.scrollTop;
    const delta = Math.abs(top - s.lst);
    if (delta > 0) {
      const force = Math.min((delta / dt) * 6, 8);
      const count = Math.floor(N * 0.18);
      for (let i = 0; i < count; i++) {
        const idx = Math.floor(Math.random() * N);
        s.v[idx] += (Math.random() - 0.5) * force;
      }
    }
    s.lst = top;
    s.lsT = now;
  }, []);

  /** Contact görünür değilken veya reduced-motion: RAF ve scroll dinleyicisi yok — CPU boşa yanmaz */
  useEffect(() => {
    if (prefersReducedMotion) return undefined;

    const el = containerRef.current;
    const root = document.querySelector('.scroll-container');
    if (!el) return undefined;

    const obs = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        root: root || null,
        rootMargin: '100px 0px 100px 0px',
        threshold: 0.02,
      }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) return undefined;

    const s = st.current;
    const stop = () => {
      if (s.aid != null) {
        cancelAnimationFrame(s.aid);
        s.aid = null;
      }
    };

    if (!isVisible) {
      stop();
      return undefined;
    }

    resize();
    lastFrameTsRef.current = 0;

    const onVisibility = () => {
      if (document.hidden) {
        stop();
      } else if (s.aid == null) {
        lastFrameTsRef.current = 0;
        s.aid = requestAnimationFrame((n) => animateRef.current?.(n));
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    const sc = document.querySelector('.scroll-container');
    sc?.addEventListener('scroll', onScroll, { passive: true });
    const ro = new ResizeObserver(resize);
    if (containerRef.current) ro.observe(containerRef.current);

    if (!document.hidden) {
      s.aid = requestAnimationFrame((n) => animateRef.current?.(n));
    }

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      stop();
      sc?.removeEventListener('scroll', onScroll);
      ro.disconnect();
    };
  }, [prefersReducedMotion, isVisible, resize, onScroll]);

  if (prefersReducedMotion) {
    return (
      <div
        className="liquid-wave-container liquid-wave-static"
        aria-hidden="true"
      />
    );
  }

  return (
    <div ref={containerRef} className="liquid-wave-container">
      <canvas ref={canvasRef} className="liquid-wave-canvas" />
    </div>
  );
};

export default LiquidWave;
