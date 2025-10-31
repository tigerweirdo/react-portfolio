import React, { useEffect, useState, useRef } from "react";
import { motion, useInView, useAnimation } from 'framer-motion';
import "./index.scss";
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../../firebase';

const Portfolio = () => { 
    const [portfolioData, setPortfolioData] = useState([]);
    const [loading, setLoading] = useState(true);
    const containerRef = useRef(null);
    const scrollWrapperRef = useRef(null);
    const controls = useAnimation();
    const isInView = useInView(containerRef, { once: false, amount: 0.2 });
    
    useEffect(() => {
        const getPortfolio = async () => {
            console.log("[Portfolio] Fetching portfolio data...");
            setLoading(true);
            try {
                const querySnapshot = await getDocs(collection(db, 'portfolio'));
                console.log("[Portfolio] querySnapshot:", querySnapshot);
                if (querySnapshot.empty) {
                    console.log("[Portfolio] No documents found in 'portfolio' collection.");
                }
                const data = querySnapshot.docs.map((doc, index) => ({
                    ...doc.data(),
                    firestoreId: doc.id || `fallback-${index}` // Fallback ID eklendi
                }));
                console.log("[Portfolio] Portfolio data fetched and mapped:", data);
                setPortfolioData(data);
            } catch (error) {
                console.error('[Portfolio] Error fetching portfolio data:', error);
                setPortfolioData([]); // Hata durumunda boş dizi ata
            } finally {
                setLoading(false);
                console.log("[Portfolio] Loading state set to false.");
            }
        };
        getPortfolio();
    }, []);

    useEffect(() => {
        if (isInView) {
            controls.start("visible");
        }
    }, [controls, isInView]);

    useEffect(() => {
        const wrapperEl = scrollWrapperRef.current;
        if (!wrapperEl) {
            return;
        }

        const handleWheel = (event) => {
            const horizontalSpace = wrapperEl.scrollWidth - wrapperEl.clientWidth;

            if (horizontalSpace <= 0) {
                return;
            }

            const dominantDelta = Math.abs(event.deltaY) >= Math.abs(event.deltaX)
                ? event.deltaY
                : event.deltaX;

            if (dominantDelta === 0) {
                return;
            }

            const maxScrollLeft = horizontalSpace;
            const currentScrollLeft = wrapperEl.scrollLeft;
            const nextScrollLeft = currentScrollLeft + dominantDelta;

            if ((dominantDelta < 0 && currentScrollLeft <= 0) || (dominantDelta > 0 && currentScrollLeft >= maxScrollLeft)) {
                return;
            }

            event.preventDefault();
            wrapperEl.scrollLeft = Math.min(Math.max(nextScrollLeft, 0), maxScrollLeft);
        };

        wrapperEl.addEventListener("wheel", handleWheel, { passive: false });

        return () => {
            wrapperEl.removeEventListener("wheel", handleWheel);
        };
    }, [portfolioData.length, loading]);

    // useScroll, useTransform ve bunlarla ilgili useEffect'ler kaldırıldı

    // Basitleştirilmiş animasyon varyantları
    const pageVariants = {
        hidden: {
            opacity: 0,
        },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.4,
                ease: "easeOut"
            }
        }
    };

    const titleVariants = {
        hidden: {
            opacity: 0,
            y: -20
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                delay: 0.1,
                ease: [0.25, 0.46, 0.45, 0.94]
            }
        }
    };



    const renderPortfolio = (portfolio) => {
        console.log("[Portfolio] Rendering portfolio with data:", portfolio);
        if (!portfolio || portfolio.length === 0) {
            console.log("[Portfolio] No portfolio data to render.");
            return (
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    style={{ textAlign: 'center', width: '100%', color: 'white', marginTop: '20px' }}
                >
                    No portfolio items to display at the moment.
                </motion.p>
            );
        }
        return (
            <div className="horizontal-scroll-wrapper" ref={scrollWrapperRef}>
                <div className="images-container">
                {
                    portfolio.map((item, idx) => {
                        console.log(`[Portfolio] Rendering item ${idx}:`, item);
                        if (!item || !item.image || !item.name) {
                            console.warn(`[Portfolio] Item ${idx} is missing image or name:`, item);
                            return null; // Eksik verili öğeyi atla
                        }
                        return (
                            <motion.div 
                                className="image-box" 
                                key={item.firestoreId || `portfolio-item-${idx}`}
                                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.3 }}
                                transition={{
                                    duration: 0.5,
                                    delay: idx * 0.08,
                                    ease: [0.25, 0.46, 0.45, 0.94]
                                }}
                                whileHover={{ 
                                    scale: 1.05,
                                    transition: { duration: 0.2 }
                                }}
                                onClick={() => {
                                    console.log("[Portfolio] Opening URL:", item.url);
                                    if (item.url) window.open(item.url, "_blank");
                                }}
                            >
                                <img 
                                    src={item.image} 
                                    className="portfolio-image"
                                    alt={item.name}
                                    loading="lazy"
                                    onError={(e) => console.error(`[Portfolio] Error loading image ${item.image} for item ${item.name}:`, e)}
                                />
                            </motion.div>
                        );
                    })
                }
                </div>
            </div>
        );
    }

    // Loading skeleton component
    const LoadingSkeleton = () => {
        const skeletonCount = 6; // Gösterilecek skeleton sayısı
        return (
            <div className="horizontal-scroll-wrapper" ref={scrollWrapperRef}>
                <div className="images-container">
                    {Array.from({ length: skeletonCount }).map((_, idx) => (
                        <div
                            key={`skeleton-${idx}`}
                            className="skeleton-box"
                        />
                    ))}
                </div>
            </div>
        );
    };

    console.log("[Portfolio] Component rendering. Loading:", loading, "Data length:", portfolioData.length);

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
                        style={{ textAlign: 'center', width: '100%', color: 'white', marginTop: '20px' }}
                    >
                        No portfolio items found.
                    </motion.p>
                )}
                {!loading && portfolioData.length > 0 && renderPortfolio(portfolioData)}
            </motion.div>
        </>
    );
}

export default Portfolio;