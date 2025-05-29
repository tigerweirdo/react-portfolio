import React, { useEffect, useState, useRef } from "react";
import { motion } from 'framer-motion';
import "./index.scss";
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../../firebase';

const Portfolio = () => { 
    const [portfolioData, setPortfolioData] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Yatay kaydırma için kullanılan ref'ler ve state'ler kaldırıldı
    // const scrollTrackRef = useRef(null); 
    // const imagesContainerRef = useRef(null); 
    // const imagesContainerStickyWrapperRef = useRef(null);
    // const [imagesContainerScrollWidth, setImagesContainerScrollWidth] = useState(0);
    // const [stickyWrapperWidth, setStickyWrapperWidth] = useState(0);

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

    // useScroll, useTransform ve bunlarla ilgili useEffect'ler kaldırıldı

    // Basitleştirilmiş animasyon varyantları
    const pageVariants = {
        hidden: {
            opacity: 0,
        },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.5, // Animasyon süresi kısaltıldı
            }
        }
    };

    const renderPortfolio = (portfolio) => {
        console.log("[Portfolio] Rendering portfolio with data:", portfolio);
        if (!portfolio || portfolio.length === 0) {
            console.log("[Portfolio] No portfolio data to render.");
            return <p style={{ textAlign: 'center', width: '100%', color: 'white', marginTop: '20px' }}>No portfolio items to display at the moment.</p>;
        }
        return (
            <div className="images-container">
                {
                    portfolio.map((item, idx) => {
                        console.log(`[Portfolio] Rendering item ${idx}:`, item);
                        if (!item || !item.image || !item.name) {
                            console.warn(`[Portfolio] Item ${idx} is missing image or name:`, item);
                            return null; // Eksik verili öğeyi atla
                        }
                        return (
                            <div 
                                className="image-box" 
                                key={item.firestoreId || `portfolio-item-${idx}`} // Key iyileştirildi
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
                                {/* Gerekirse öğe adı gibi ek bilgiler eklenebilir */}
                                {/* <p>{item.name}</p> */}
                            </div>
                        );
                    })
                }
            </div>
        );
    }

    console.log("[Portfolio] Component rendering. Loading:", loading, "Data length:", portfolioData.length);

    return (
        <>
            <motion.div 
                className="container portfolio-page"
                key="portfolio-page"
                initial="hidden"
                animate="visible"
                variants={pageVariants}
            >
                <h1 className="page-title">
                    Portfolio
                </h1>
                
                {/* Yatay kaydırma için kullanılan sarmalayıcı div'ler kaldırıldı */}
                {/* <div ref={scrollTrackRef} className="horizontal-scroll-track"> */}
                {/*     <div ref={imagesContainerStickyWrapperRef} className="images-container-sticky-wrapper"> */}
                        {loading && <p style={{ textAlign: 'center', width: '100%', color: 'white', marginTop: '20px' }}>Loading portfolio...</p>}
                        {!loading && portfolioData.length === 0 && <p style={{ textAlign: 'center', width: '100%', color: 'white', marginTop: '20px' }}>No portfolio items found.</p>}
                        {!loading && portfolioData.length > 0 && renderPortfolio(portfolioData)}
                {/*     </div> */}
                {/* </div> */}
            </motion.div>
        </>
    );
}

export default Portfolio;