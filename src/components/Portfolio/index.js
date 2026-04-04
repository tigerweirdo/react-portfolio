import React, { useEffect, useState, useCallback, memo } from "react";
import { motion } from "framer-motion";
import PeekInner from "./PeekInner";
import CardBackground from "./CardBackground";
import "./index.scss";
import { getDocs, collection } from "firebase/firestore";
import { db, ensureAuth, firebaseEnabled } from "../../firebase";

const SKELETON_COUNT = 4;

const easePremium = [0.16, 1, 0.3, 1];

function labelFromItem(item) {
  const rawTags = item.tags;
  const tag = Array.isArray(rawTags) ? rawTags[0] : rawTags;
  if (tag && String(tag).trim()) {
    return String(tag)
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "_")
      .slice(0, 24);
  }
  const name = item.name || "PROJECT";
  return String(name)
    .toUpperCase()
    .replace(/\s+/g, "_")
    .slice(0, 24);
}

const LoadingSkeleton = () => (
  <section className="premium-grid" aria-hidden="true">
    {Array.from({ length: SKELETON_COUNT }).map((_, idx) => (
      <div key={`sk-${idx}`} className="premium-card premium-card--skeleton">
        <div className="skeleton-shine" />
      </div>
    ))}
  </section>
);

const Portfolio = memo(() => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      if (!firebaseEnabled) {
        console.warn("[Portfolio] Firebase not enabled, showing empty state.");
        setProjects([]);
        setLoading(false);
        return;
      }
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

  const openDetail = useCallback((index) => {
    setOpenIndex(index);
  }, []);

  const closeDetail = useCallback((e) => {
    e.stopPropagation();
    setOpenIndex(null);
  }, []);

  const handleDetailInnerClick = useCallback((e) => {
    e.stopPropagation();
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpenIndex(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="portfolio-page">
      <div className="portfolio-header">
        <h1 className="header-title">Work</h1>
      </div>

      {loading && <LoadingSkeleton />}

      {!loading && projects.length === 0 && (
        <div className="portfolio-empty">
          <p>Henüz portfolyo öğesi yok.</p>
        </div>
      )}

      {!loading && projects.length > 0 && (
        <section className="premium-grid">
          {projects.map((item, index) => {
            const coverIsVideo = item.coverIsVideo === true && item.cover;
            const peekVideoField =
              typeof item.peekVideo === "string" && item.peekVideo.trim()
                ? item.peekVideo.trim()
                : null;
            /** İç (hover) video: önce ayrı peek alanı, yoksa kapak video dosyası */
            const innerVideoSrc =
              peekVideoField || (coverIsVideo ? item.cover : null);

            let innerStill = null;
            if (!innerVideoSrc) {
              const c = item.cover || item.image;
              innerStill =
                item.image &&
                item.cover &&
                !coverIsVideo &&
                item.image !== item.cover
                  ? item.image
                  : c;
            }
            const isOpen = openIndex === index;
            const leftLabel = labelFromItem(item);

            return (
              <motion.article
                key={item.firestoreId || `item-${index}`}
                className={`premium-card group ${isOpen ? "is-open" : ""}`}
                layout={false}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.55,
                  delay: index * 0.06,
                  ease: easePremium,
                }}
                onClick={() => openDetail(index)}
                role="button"
                tabIndex={0}
                aria-label={`${item.name || "Proje"} — detayı aç`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openDetail(index);
                  }
                }}
                aria-expanded={isOpen}
              >
                <CardBackground item={item} index={index} />

                <div className="premium-card__hover-layer" aria-hidden="true">
                  <div className="premium-card__inner-wrap">
                    <PeekInner
                      peekVideo={innerVideoSrc}
                      innerSrc={innerVideoSrc ? null : innerStill}
                      isOpen={isOpen}
                    />
                  </div>

                  <div className="premium-card__label premium-card__label--left">
                    {leftLabel}
                  </div>
                  <div className="premium-card__label premium-card__label--right">
                    ( PEEK )
                  </div>
                </div>

                <div
                  className="premium-card__detail"
                  onClick={closeDetail}
                  role="dialog"
                  aria-modal="true"
                  aria-label={item.name || "Proje detayı"}
                  aria-describedby={`portfolio-detail-hint-${index}`}
                >
                  <span
                    id={`portfolio-detail-hint-${index}`}
                    className="portfolio-sr-only"
                  >
                    Kapatmak için boş alana tıklayın, Escape tuşunu kullanın veya
                    kapat düğmesine basın.
                  </span>
                  <button
                    type="button"
                    className="premium-card__close"
                    onClick={closeDetail}
                    aria-label="Detayı kapat"
                  >
                    <svg
                      className="premium-card__close-icon"
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path
                        d="M6 6l12 12M18 6L6 18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                  <div
                    className="premium-card__detail-inner"
                    onClick={handleDetailInnerClick}
                  >
                    <div className="text-mask premium-card__title-mask">
                      <span className="text-reveal title-reveal premium-card__detail-title">
                        {item.name || "—"}
                      </span>
                    </div>
                    <div className="text-mask">
                      <p className="text-reveal desc-reveal premium-card__detail-desc">
                        {item.description?.trim()
                          ? item.description
                          : "Bu proje için açıklama henüz eklenmemiş."}
                      </p>
                    </div>
                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="premium-card__detail-link"
                      >
                        Projeyi aç →
                      </a>
                    ) : null}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </section>
      )}
    </div>
  );
});

export default Portfolio;
