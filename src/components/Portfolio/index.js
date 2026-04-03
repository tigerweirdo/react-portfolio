import React, { useEffect, useState, memo } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import "./index.scss";
import { getDocs, collection } from 'firebase/firestore';
import { db, ensureAuth } from '../../firebase';

const SKELETON_COUNT = 5;

const LoadingSkeleton = () => (
  <div className="portfolio-list">
    {Array.from({ length: SKELETON_COUNT }).map((_, idx) => (
      <div key={`skeleton-${idx}`} className="project-row skeleton-row">
        <div className="skeleton-pill narrow" />
        <div className="skeleton-pill wide" />
        <div className="skeleton-pill xnarrow" />
      </div>
    ))}
  </div>
);

const Portfolio = memo(() => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        await ensureAuth();
        const snap = await getDocs(collection(db, 'portfolio'));
        const data = snap.docs.map((doc, index) => ({
          ...doc.data(),
          firestoreId: doc.id || `fallback-${index}`,
        }));
        setProjects(data);
      } catch (error) {
        console.error('[Portfolio] Error fetching portfolio data:', error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const activeProject = activeIndex !== null ? projects[activeIndex] : null;
  const activeImage = activeProject ? (activeProject.cover || activeProject.image) : null;

  return (
    <div className="portfolio-page">
      <div className="portfolio-header">
        <span className="header-code">(Sc-00)</span>
        <h1 className="header-title">Work</h1>
      </div>

      <div className="portfolio-list-wrapper">
        <div className="portfolio-list">
          {loading && <LoadingSkeleton />}

          {!loading && projects.length === 0 && (
            <div className="portfolio-empty">
              <p>No portfolio items found.</p>
            </div>
          )}

          {!loading && projects.length > 0 && projects.map((item, index) => (
            <motion.div
              key={item.firestoreId || `item-${index}`}
              className={`project-row ${activeIndex === index ? 'is-hovered' : ''}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              onClick={() => {
                if (item.url) window.open(item.url, '_blank', 'noopener,noreferrer');
              }}
            >
              <span className="row-index">SC_{String(index + 1).padStart(2, '0')}</span>
              <h2 className="row-title">{item.name}</h2>
              <div className="row-right">
                {item.tags && item.tags.length > 0 && (
                  <span className="row-tags">{item.tags.slice(0, 2).join(', ')}</span>
                )}
                <span className="row-year">&copy;{item.year || '25'}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="portfolio-preview">
          <div className="preview-image-box">
            <AnimatePresence mode="wait">
              {activeIndex !== null && activeImage && (
                <motion.img
                  key={activeIndex}
                  src={activeImage}
                  alt={activeProject.name}
                  initial={{ opacity: 0, scale: 1.04, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: -8 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
            </AnimatePresence>

            {activeIndex === null && (
              <div className="preview-placeholder">HOVER</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default Portfolio;
