import React, { useRef, useEffect, useCallback } from 'react';
import './LiquidWave.scss';

const WAVE_LAYERS = [
  { color: 'rgba(232,234,237,0.5)', baseAmp: 6,  scrollBoost: 18, freq: 0.008,  speed: 0.4,  freq2: 0.012, speed2: 0.25, amp2: 3,  yOffset: 0.35 },
  { color: 'rgba(95,99,104,0.35)',  baseAmp: 8,  scrollBoost: 24, freq: 0.006,  speed: 0.55, freq2: 0.015, speed2: 0.35, amp2: 4,  yOffset: 0.50 },
  { color: 'rgba(32,33,36,0.55)',   baseAmp: 10, scrollBoost: 30, freq: 0.005,  speed: 0.7,  freq2: 0.018, speed2: 0.45, amp2: 5,  yOffset: 0.65 },
];

const DAMPING = 0.92;
const LERP_SPEED = 0.08;
const VELOCITY_SCALE = 0.15;
const MAX_AMPLITUDE = 1;

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

    for (let i = 0; i < WAVE_LAYERS.length; i++) {
      const layer = WAVE_LAYERS[i];
      const amp = layer.baseAmp + currentAmp * layer.scrollBoost;
      const amp2 = layer.amp2 + currentAmp * layer.amp2 * 2;
      const baseY = height * layer.yOffset;

      ctx.beginPath();
      ctx.moveTo(0, height);

      const step = 2;
      for (let x = 0; x <= width; x += step) {
        const y = baseY
          + Math.sin(x * layer.freq + time * layer.speed) * amp
          + Math.sin(x * layer.freq2 + time * layer.speed2) * amp2;
        ctx.lineTo(x, y);
      }

      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fillStyle = layer.color;
      ctx.fill();
    }
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

    const scrollContainer = document.querySelector('.scroll-container');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    }

    const ro = new ResizeObserver(resize);
    if (containerRef.current) {
      ro.observe(containerRef.current);
    }

    stateRef.current.animId = requestAnimationFrame(animate);

    return () => {
      if (stateRef.current.animId) {
        cancelAnimationFrame(stateRef.current.animId);
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
