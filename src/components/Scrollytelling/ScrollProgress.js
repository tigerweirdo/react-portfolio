import { memo } from 'react';
import { motion, useScroll, useSpring, useReducedMotion } from 'framer-motion';
import './index.scss';

/**
 * Sayfanın en üstünde, scroll ilerlemesini gösteren ince çubuk.
 * Gerçek scroll `.scroll-container` içinde döndüğü için container ref'i alıyoruz.
 */
const ScrollProgress = memo(({ containerRef }) => {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ container: containerRef });

  // Spring ile takip daha akıcı; reduced-motion'da birebir scroll'a bağla.
  const smooth = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    mass: 0.3,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="scroll-progress"
      style={{ scaleX: reduceMotion ? scrollYProgress : smooth }}
      aria-hidden="true"
    />
  );
});

export default ScrollProgress;
