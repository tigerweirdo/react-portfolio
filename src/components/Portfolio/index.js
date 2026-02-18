import React, { useEffect, useState, useRef, memo, useCallback } from "react";
import { motion, useInView, useAnimation } from 'framer-motion';
import "./index.scss";
import { getDocs, collection } from 'firebase/firestore';
import { db, ensureAuth } from '../../firebase';

// ===========================
// STATIC VARIANTS (bileşen dışı — her render'da yeniden oluşturulmaz)
// ===========================
const pageVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.3 }
    }
};

const titleVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.4 }
    }
};

// Grid container — staggered children giriş animasyonu
const gridVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.15
        }
    }
};

// Tek kart giriş animasyonu
const cardVariants = {
    hidden: {
        opacity: 0,
        y: 30,
        scale: 0.95
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94]
        }
    }
};

const SKELETON_COUNT = 6;

// Arrow SVG icon bileşeni
const ArrowIcon = () => (
    <svg className="arrow-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
            d="M3 8h10M9 4l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

// LoadingSkeleton — yeni grid layout ile
const LoadingSkeleton = () => (
    <div className="portfolio-grid">
        {Array.from({ length: SKELETON_COUNT }).map((_, idx) => (
            <div
                key={`skeleton-${idx}`}
                className="skeleton-box"
            />
        ))}
    </div>
);

// ===========================
// PORTFOLIO COMPONENT
// ===========================
const Portfolio = memo(() => {
    const [portfolioData, setPortfolioData] = useState([]);
    const [loading, setLoading] = useState(true);
    const containerRef = useRef(null);
    const controls = useAnimation();
    const isInView = useInView(containerRef, { once: false, amount: 0.2 });

    // Firebase'den portfolio verilerini çek
    useEffect(() => {
        const getPortfolio = async () => {
            setLoading(true);
            try {
                await ensureAuth();
                const querySnapshot = await getDocs(collection(db, 'portfolio'));
                const data = querySnapshot.docs.map((doc, index) => ({
                    ...doc.data(),
                    firestoreId: doc.id || `fallback-${index}`
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

    // Görünürlük animasyonu
    useEffect(() => {
        if (isInView) {
            controls.start("visible");
        }
    }, [controls, isInView]);

    // Açıklamayı kırp
    const truncateDescription = useCallback((text, maxLength = 80) => {
        if (!text) return '';
        return text.length > maxLength
            ? text.substring(0, maxLength) + '...'
            : text;
    }, []);

    // Portfolio kartlarını render et
    const renderPortfolio = useCallback((portfolio) => {
        if (!portfolio || portfolio.length === 0) {
            return (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    style={{ textAlign: 'center', width: '100%', color: '$primary-color', marginTop: '20px' }}
                >
                    No portfolio items to display at the moment.
                </motion.p>
            );
        }

        return (
            <motion.div
                className="portfolio-grid"
                variants={gridVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
            >
                {portfolio.map((item, idx) => {
                    if (!item || !item.image || !item.name) {
                        return null;
                    }

                    return (
                        <motion.div
                            className="portfolio-card"
                            key={item.firestoreId || `portfolio-item-${idx}`}
                            variants={cardVariants}
                            whileTap={{ scale: 0.98 }}
                        >
                            <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="card-link"
                                aria-label={`View project: ${item.name}`}
                            >
                                <div className="card-image-wrapper">
                                    <img
                                        src={item.cover || item.image}
                                        className="card-image"
                                        alt={item.name}
                                        loading="lazy"
                                    />
                                    <div className="card-overlay">
                                        <div className="card-content">
                                            <h3 className="card-title">{item.name}</h3>
                                            {item.description && (
                                                <p className="card-description">
                                                    {truncateDescription(item.description)}
                                                </p>
                                            )}
                                            <span className="card-cta">
                                                View Project <ArrowIcon />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </a>
                        </motion.div>
                    );
                })}
            </motion.div>
        );
    }, [truncateDescription]);

    return (
        <>
            <motion.div
                ref={containerRef}
                className="container portfolio-page"
                key="portfolio-page"
                initial="hidden"
                animate={controls}
                variants={pageVariants}
            >
                <motion.h1
                    className="page-title"
                    variants={titleVariants}
                >
                    Portfolio
                </motion.h1>

                {loading && <LoadingSkeleton />}
                {!loading && portfolioData.length === 0 && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ textAlign: 'center', width: '100%', marginTop: '20px' }}
                    >
                        No portfolio items found.
                    </motion.p>
                )}
                {!loading && portfolioData.length > 0 && renderPortfolio(portfolioData)}
            </motion.div>
        </>
    );
});

export default Portfolio;
