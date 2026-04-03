import React, { useEffect, useState, useRef, memo, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./index.scss";
import { getDocs, collection } from "firebase/firestore";
import { db, ensureAuth } from "../../firebase";

const SKELETON_COUNT = 5;

const LoadingSkeleton = () => (
  <div className="portfolio-list-section">
    {Array.from({ length: SKELETON_COUNT }).map((_, idx) => (
      <div key={`sk-${idx}`} className="project-row skeleton-row">
        <div className="skeleton-pill narrow" />
        <div className="skeleton-pill wide" />
        <div className="skeleton-pill xnarrow" />
      </div>
    ))}
  </div>
);

const CursorPreview = memo(({ activeIndex, projects, previewRef }) => {
  const image =
    activeIndex !== null
      ? projects[activeIndex]?.cover || projects[activeIndex]?.image
      : null;
  const name = activeIndex !== null ? projects[activeIndex]?.name : "";

  return createPortal(
    <AnimatePresence>
      {activeIndex !== null && image && (
        <motion.div
          className="cursor-preview"
          ref={previewRef}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={activeIndex}
              src={image}
              alt={name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
});

const Portfolio = memo(() => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null);

  const targetRef = useRef({ x: -1000, y: -1000 });
  const currentRef = useRef({ x: -1000, y: -1000 });
  const rafRef = useRef(null);
  const previewRef = useRef(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        await ensureAuth();
        const snap = await getDocs(collection(db, "portfolio"));
        const data = snap.docs.map((doc, index) => ({
          ...doc.data(),
          firestoreId: doc.id || `fallback-${index}`,
        }));
        setProjects(data);
      } catch (error) {
        console.error("[Portfolio] Error fetching portfolio data:", error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // RAF lerp loop — no re-renders, direct DOM updates
  useEffect(() => {
    const lerp = (a, b, t) => a + (b - a) * t;

    const animate = () => {
      currentRef.current.x = lerp(currentRef.current.x, targetRef.current.x, 0.1);
      currentRef.current.y = lerp(currentRef.current.y, targetRef.current.y, 0.1);

      if (previewRef.current) {
        previewRef.current.style.left = currentRef.current.x + "px";
        previewRef.current.style.top = currentRef.current.y + "px";
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const handleMouseMove = useCallback((e) => {
    targetRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  return (
    <div className="portfolio-page" onMouseMove={handleMouseMove}>
      <div className="portfolio-header">
        <span className="header-eyebrow">(Sc-00)</span>
        <h1 className="header-title">Work</h1>
      </div>

      <div className="portfolio-list-section">
        {loading && <LoadingSkeleton />}

        {!loading && projects.length === 0 && (
          <div className="portfolio-empty">
            <p>No portfolio items found.</p>
          </div>
        )}

        {!loading &&
          projects.length > 0 &&
          projects.map((item, index) => (
            <motion.div
              key={item.firestoreId || `item-${index}`}
              className={`project-row ${activeIndex === index ? "is-hovered" : ""}`}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.07,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              onClick={() => {
                if (item.url) window.open(item.url, "_blank", "noopener,noreferrer");
              }}
            >
              <span className="row-index">
                SC_{String(index + 1).padStart(2, "0")}
              </span>
              <h2 className="row-title">{item.name}</h2>
              <div className="row-meta">
                <span className="row-year">
                  &copy;{item.year || "25"}
                </span>
                {item.tags && item.tags.length > 0 && (
                  <span className="row-tags">
                    {item.tags.slice(0, 2).join(", ")}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
      </div>

      <CursorPreview
        activeIndex={activeIndex}
        projects={projects}
        previewRef={previewRef}
      />
    </div>
  );
});

export default Portfolio;
