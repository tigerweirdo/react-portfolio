import React, { useRef, useEffect, useCallback } from 'react';
import './LiquidWave.scss';

const DAMPING = 0.94;
const LERP_SPEED = 0.06;
const VELOCITY_SCALE = 0.18;
const MAX_AMPLITUDE = 1;

function noise(x) {
  const s = Math.sin(x * 127.1 + x * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function smoothNoise(x) {
  const i = Math.floor(x);
  const f = x - i;
  const t = f * f * (3 - 2 * f);
  return noise(i) * (1 - t) + noise(i + 1) * t;
}

function fbm(x, octaves) {
  let val = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    val += amp * smoothNoise(x * freq);
    amp *= 0.5;
    freq *= 2.1;
  }
  return val;
}

function waveY(x, time, layer, scrollAmp) {
  const { baseFreq, speed, harmonics, baseAmp, scrollBoost, phaseOffset } = layer;
  let y = 0;
  for (let h = 0; h < harmonics.length; h++) {
    const harm = harmonics[h];
    const amp = (harm.amp + scrollAmp * harm.scrollMul) * (baseAmp + scrollAmp * scrollBoost);
    y += Math.sin(x * baseFreq * harm.freqMul + time * speed * harm.speedMul + phaseOffset + harm.phase) * amp;
  }
  y += fbm(x * 0.003 + time * speed * 0.3 + phaseOffset, 3) * (6 + scrollAmp * 14);
  return y;
}

const LAYERS = [
  {
    baseFreq: 0.0025, speed: 0.35, baseAmp: 1, scrollBoost: 0.8, phaseOffset: 0,
    yPos: 0.22,
    gradient: [
      { stop: 0, color: 'rgba(15,25,45,0.0)' },
      { stop: 0.3, color: 'rgba(15,25,45,0.15)' },
      { stop: 1, color: 'rgba(10,18,35,0.4)' },
    ],
    harmonics: [
      { freqMul: 1, speedMul: 1, amp: 8, scrollMul: 12, phase: 0 },
      { freqMul: 2.3, speedMul: 1.4, amp: 4, scrollMul: 8, phase: 1.2 },
      { freqMul: 4.1, speedMul: 0.7, amp: 2, scrollMul: 5, phase: 3.5 },
      { freqMul: 7.3, speedMul: 2.1, amp: 1, scrollMul: 3, phase: 5.1 },
    ],
  },
  {
    baseFreq: 0.003, speed: 0.5, baseAmp: 1, scrollBoost: 1, phaseOffset: 2.5,
    yPos: 0.35,
    gradient: [
      { stop: 0, color: 'rgba(20,40,75,0.0)' },
      { stop: 0.25, color: 'rgba(20,40,75,0.2)' },
      { stop: 1, color: 'rgba(12,25,50,0.55)' },
    ],
    harmonics: [
      { freqMul: 1, speedMul: 1, amp: 10, scrollMul: 16, phase: 0 },
      { freqMul: 1.8, speedMul: 1.3, amp: 6, scrollMul: 10, phase: 0.8 },
      { freqMul: 3.5, speedMul: 0.9, amp: 3, scrollMul: 6, phase: 2.4 },
      { freqMul: 6.2, speedMul: 1.8, amp: 1.5, scrollMul: 4, phase: 4.7 },
    ],
  },
  {
    baseFreq: 0.004, speed: 0.65, baseAmp: 1, scrollBoost: 1.2, phaseOffset: 5.2,
    yPos: 0.48,
    gradient: [
      { stop: 0, color: 'rgba(30,60,110,0.0)' },
      { stop: 0.2, color: 'rgba(30,60,110,0.25)' },
      { stop: 1, color: 'rgba(15,35,70,0.65)' },
    ],
    harmonics: [
      { freqMul: 1, speedMul: 1, amp: 12, scrollMul: 20, phase: 0 },
      { freqMul: 2.1, speedMul: 1.5, amp: 7, scrollMul: 12, phase: 1.5 },
      { freqMul: 3.8, speedMul: 0.8, amp: 3.5, scrollMul: 7, phase: 3.1 },
      { freqMul: 5.5, speedMul: 2.2, amp: 1.8, scrollMul: 4, phase: 5.8 },
    ],
  },
  {
    baseFreq: 0.005, speed: 0.85, baseAmp: 1, scrollBoost: 1.5, phaseOffset: 8.1,
    yPos: 0.60,
    gradient: [
      { stop: 0, color: 'rgba(40,80,140,0.0)' },
      { stop: 0.15, color: 'rgba(40,80,140,0.3)' },
      { stop: 0.6, color: 'rgba(20,50,100,0.6)' },
      { stop: 1, color: 'rgba(10,30,65,0.8)' },
    ],
    harmonics: [
      { freqMul: 1, speedMul: 1, amp: 14, scrollMul: 24, phase: 0 },
      { freqMul: 1.6, speedMul: 1.2, amp: 8, scrollMul: 14, phase: 0.6 },
      { freqMul: 3.2, speedMul: 1.7, amp: 4, scrollMul: 8, phase: 2.8 },
      { freqMul: 5.8, speedMul: 0.6, amp: 2, scrollMul: 5, phase: 4.4 },
    ],
  },
  {
    baseFreq: 0.006, speed: 1.1, baseAmp: 1, scrollBoost: 1.8, phaseOffset: 11.7,
    yPos: 0.72,
    gradient: [
      { stop: 0, color: 'rgba(55,110,180,0.0)' },
      { stop: 0.1, color: 'rgba(55,110,180,0.2)' },
      { stop: 0.5, color: 'rgba(30,70,130,0.55)' },
      { stop: 1, color: 'rgba(12,35,75,0.85)' },
    ],
    harmonics: [
      { freqMul: 1, speedMul: 1, amp: 16, scrollMul: 28, phase: 0 },
      { freqMul: 2.4, speedMul: 1.6, amp: 9, scrollMul: 16, phase: 1.1 },
      { freqMul: 4.5, speedMul: 0.5, amp: 5, scrollMul: 9, phase: 3.7 },
      { freqMul: 7.1, speedMul: 2.5, amp: 2.5, scrollMul: 5, phase: 6.2 },
    ],
  },
];

const LiquidWave = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const stateRef = useRef({
    time: 0,
    targetAmp: 0,
    currentAmp: 0,
    lastScrollTop: 0,
    lastScrollTime: Date.now(),
    animId: null,
    width: 0,
    height: 0,
    dpr: 1,
  });

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = container.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const s = stateRef.current;
    s.width = w;
    s.height = h;
    s.dpr = dpr;
  }, []);

  const drawWaves = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const s = stateRef.current;
    const { width, height, dpr, currentAmp, time } = s;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const depthGrad = ctx.createLinearGradient(0, 0, 0, height);
    depthGrad.addColorStop(0, 'rgba(5,12,30,0)');
    depthGrad.addColorStop(0.5, 'rgba(5,12,30,0.15)');
    depthGrad.addColorStop(1, 'rgba(5,12,30,0.5)');
    ctx.fillStyle = depthGrad;
    ctx.fillRect(0, 0, width, height);

    const step = 3;

    for (let i = 0; i < LAYERS.length; i++) {
      const layer = LAYERS[i];
      const baseY = height * layer.yPos;

      ctx.beginPath();
      ctx.moveTo(-1, height + 1);

      const points = [];
      for (let x = -1; x <= width + 1; x += step) {
        const y = baseY + waveY(x, time, layer, currentAmp);
        points.push({ x, y });
      }

      for (let p = 0; p < points.length; p++) {
        if (p === 0) {
          ctx.lineTo(points[p].x, points[p].y);
        } else {
          const prev = points[p - 1];
          const curr = points[p];
          const cpx = (prev.x + curr.x) / 2;
          ctx.quadraticCurveTo(prev.x, prev.y, cpx, (prev.y + curr.y) / 2);
          if (p === points.length - 1) {
            ctx.lineTo(curr.x, curr.y);
          }
        }
      }

      ctx.lineTo(width + 1, height + 1);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, baseY - 30, 0, height);
      for (let g = 0; g < layer.gradient.length; g++) {
        grad.addColorStop(layer.gradient[g].stop, layer.gradient[g].color);
      }
      ctx.fillStyle = grad;
      ctx.fill();

      if (i >= 2 && currentAmp > 0.05) {
        const highlightIntensity = Math.min(currentAmp * 0.6, 0.3);
        for (let p = 1; p < points.length - 1; p++) {
          const prev = points[p - 1];
          const curr = points[p];
          const next = points[p + 1];
          if (curr.y < prev.y && curr.y < next.y) {
            const crestStrength = Math.min((prev.y - curr.y + next.y - curr.y) * 0.02, 1);
            if (crestStrength > 0.15) {
              const glowRadius = 8 + currentAmp * 20;
              const radGrad = ctx.createRadialGradient(
                curr.x, curr.y, 0,
                curr.x, curr.y, glowRadius
              );
              const alpha = highlightIntensity * crestStrength;
              radGrad.addColorStop(0, `rgba(140,180,230,${alpha})`);
              radGrad.addColorStop(0.5, `rgba(100,150,210,${alpha * 0.4})`);
              radGrad.addColorStop(1, 'rgba(80,130,200,0)');
              ctx.fillStyle = radGrad;
              ctx.fillRect(curr.x - glowRadius, curr.y - glowRadius, glowRadius * 2, glowRadius * 2);
            }
          }
        }
      }
    }

    if (currentAmp > 0.15) {
      const foamCount = Math.floor(currentAmp * 25);
      for (let f = 0; f < foamCount; f++) {
        const fx = noise(time * 3 + f * 17.3) * width;
        const fy = height * (0.3 + noise(f * 31.7 + time * 2) * 0.5);
        const fSize = 1 + noise(f * 53.1) * 2.5 * currentAmp;
        const fAlpha = currentAmp * 0.3 * noise(f * 71.3 + time);
        ctx.beginPath();
        ctx.arc(fx, fy, fSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,210,240,${fAlpha})`;
        ctx.fill();
      }
    }

    const vignetteGrad = ctx.createLinearGradient(0, height * 0.7, 0, height);
    vignetteGrad.addColorStop(0, 'rgba(5,10,25,0)');
    vignetteGrad.addColorStop(1, 'rgba(5,10,25,0.4)');
    ctx.fillStyle = vignetteGrad;
    ctx.fillRect(0, height * 0.7, width, height * 0.3);
  }, []);

  const animate = useCallback(() => {
    const s = stateRef.current;

    s.time += 0.016;

    s.targetAmp *= DAMPING;
    if (s.targetAmp < 0.001) s.targetAmp = 0;

    s.currentAmp += (s.targetAmp - s.currentAmp) * LERP_SPEED;

    drawWaves();

    s.animId = requestAnimationFrame(animate);
  }, [drawWaves]);

  const handleScroll = useCallback(() => {
    const scrollContainer = document.querySelector('.scroll-container');
    if (!scrollContainer) return;

    const s = stateRef.current;
    const now = Date.now();
    const dt = Math.max(now - s.lastScrollTime, 1);
    const scrollTop = scrollContainer.scrollTop;
    const delta = Math.abs(scrollTop - s.lastScrollTop);

    const velocity = Math.min((delta / dt) * VELOCITY_SCALE, MAX_AMPLITUDE);
    s.targetAmp = Math.max(s.targetAmp, velocity);

    s.lastScrollTop = scrollTop;
    s.lastScrollTime = now;
  }, []);

  useEffect(() => {
    resize();

    const s = stateRef.current;
    const scrollContainer = document.querySelector('.scroll-container');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    }

    const ro = new ResizeObserver(resize);
    if (containerRef.current) {
      ro.observe(containerRef.current);
    }

    s.animId = requestAnimationFrame(animate);

    return () => {
      if (s.animId) {
        cancelAnimationFrame(s.animId);
      }
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
      ro.disconnect();
    };
  }, [resize, animate, handleScroll]);

  return (
    <div ref={containerRef} className="liquid-wave-container">
      <canvas ref={canvasRef} className="liquid-wave-canvas" />
    </div>
  );
};

export default LiquidWave;
