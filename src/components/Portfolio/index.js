import React, { useEffect, useState, useRef, memo, useCallback } from "react";
import { motion } from 'framer-motion';
import "./index.scss";
import { getDocs, collection } from 'firebase/firestore';
import { db, ensureAuth } from '../../firebase';

const ArrowIcon = () => (
  <svg className="arrow-icon" width="18" height="18" viewBox="0 0 16 16" fill="none">
    <path
      d="M3 8h10M9 4l4 4-4 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SKELETON_COUNT = 3;

const LoadingSkeleton = () => (
  <div className="portfolio-skeletons">
    {Array.from({ length: SKELETON_COUNT }).map((_, idx) => (
      <div key={`skeleton-${idx}`} className="skeleton-scene">
        <div className="skeleton-image" />
        <div className="skeleton-text">
          <div className="skeleton-line wide" />
          <div className="skeleton-line medium" />
          <div className="skeleton-line narrow" />
        </div>
      </div>
    ))}
  </div>
);

const imageVariants = {
  hidden: { opacity: 0, scale: 0.85, y: 60 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const textContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const textItemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const ProjectScene = memo(({ item, index }) => {
  const isReversed = index % 2 !== 0;

  if (!item || !item.image || !item.name) return null;

  return (
    <div className={`project-scene ${isReversed ? 'reversed' : ''}`}>
      <motion.div
        className="scene-visual"
        variants={imageVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
      >
        <div className="visual-inner">
          <img
            src={item.cover || item.image}
            alt={item.name}
            loading="lazy"
          />
        </div>
      </motion.div>

      <motion.div
        className="scene-content"
        variants={textContainerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.span className="scene-number" variants={textItemVariants}>
          {String(index + 1).padStart(2, '0')}
        </motion.span>
        <motion.h2 className="scene-title" variants={textItemVariants}>
          {item.name}
        </motion.h2>
        {item.description && (
          <motion.p className="scene-description" variants={textItemVariants}>
            {item.description}
          </motion.p>
        )}
        {item.url && (
          <motion.a
            className="scene-cta"
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            variants={textItemVariants}
            whileHover={{ x: 6 }}
            transition={{ duration: 0.2 }}
          >
            View Project <ArrowIcon />
          </motion.a>
        )}
      </motion.div>
    </div>
  );
});

const Portfolio = memo(({ scrollToSection }) => {
  const [portfolioData, setPortfolioData] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    const getPortfolio = async () => {
      setLoading(true);
      try {
        await ensureAuth();
        const snap = await getDocs(collection(db, 'portfolio'));
        const data = snap.docs.map((doc, index) => ({
          ...doc.data(),
          firestoreId: doc.id || `fallback-${index}`,
        }));
        setPortfolioData(data);
      } catch (error) {
        console.error('[Portfolio] Error fetching portfolio data:', error);
        setPortfolioData([]);
      } finally {
        setLoading(false);
      }
    };
    getPortfolio();
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (e) => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const atTop = scrollTop <= 1;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 2;
      const canScroll = scrollHeight > clientHeight + 5;

      if (!canScroll) return;
      
      if (e.deltaY > 0 && atBottom) {
        e.preventDefault();
        e.stopPropagation();
        if (scrollToSection) scrollToSection('contact');
        return;
      }
      
      if (e.deltaY < 0 && atTop) {
        e.preventDefault();
        e.stopPropagation();
        if (scrollToSection) scrollToSection('about');
        return;
      }

      e.stopPropagation();
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const handleTouchEvent = useCallback((e) => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const canScroll = scrollHeight > clientHeight + 5;
    const atTop = scrollTop <= 5;
    const atBottom = Math.abs(scrollHeight - clientHeight - scrollTop) <= 5;
    if (canScroll && !atTop && !atBottom) {
      e.stopPropagation();
    }
  }, []);

  return (
    <div className="portfolio-page">
      <div
        ref={scrollRef}
        className="portfolio-scroll-area"
        onTouchStart={handleTouchEvent}
        onTouchEnd={handleTouchEvent}
      >
        <motion.div
          className="portfolio-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="portfolio-title">Portfolio</h1>
          <p className="portfolio-subtitle">A selection of my recent work</p>
        </motion.div>

        {loading && <LoadingSkeleton />}

        {!loading && portfolioData.length === 0 && (
          <motion.div
            className="portfolio-empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p>No portfolio items found.</p>
          </motion.div>
        )}

        {!loading && portfolioData.length > 0 && (
          <div className="portfolio-scenes">
            {portfolioData.map((item, idx) => (
              <ProjectScene
                key={item.firestoreId || `item-${idx}`}
                item={item}
                index={idx}
              />
            ))}
          </div>
        )}

        <div className="portfolio-end-spacer" />
      </div>
    </div>
  );
});

export default Portfolio;
