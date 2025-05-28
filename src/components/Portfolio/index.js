import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
// import AnimatedLetters from "../AnimatedLetters"; // Kaldırıldı
import "./index.scss";
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../../firebase';
// import useScrollAnimation from "../../hooks/useScrollAnimation"; // Kaldırıldı

// --- Paketleme Algoritması Başlangıcı ---
// createGrid, canPlaceItem, placeItem, findCompactPosition, calculateAdjacencyScore, packAllItems fonksiyonları kaldırıldı.
// --- Paketleme Algoritması Sonu ---

const Portfolio = () => { 
    // const [letterClass, setLetterClass] = useState('text-animate'); // Kaldırıldı
    const [portfolioData, setPortfolioData] = useState([]);
    // const [animatedItems, setAnimatedItems] = useState([]); // Kaldırıldı
    const [loading, setLoading] = useState(true);
    const containerRef = useRef(null); // Grid container için ref kalabilir, ancak boyut hesaplaması için değil.
    // const [containerDimensions, setContainerDimensions] = useState(null); // Kaldırıldı
    // const dimensionRetryCount = useRef(0); // Kaldırıldı
    // const itemRefs = useRef({}); // Kaldırıldı

    // const sizeProfiles = useMemo(() => [ // Kaldırıldı
    // ...
    // ], []);

    // useEffect(() => { // letterClass için useEffect kaldırıldı
    // const timer = setTimeout(() => setLetterClass('text-animate-hover'), 3000);
    // return () => clearTimeout(timer);
    // }, []);

    useEffect(() => {
        const getPortfolio = async () => {
            console.log("[Portfolio] Fetching portfolio data...");
            setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, 'portfolio'));
                const data = querySnapshot.docs.map((doc, index) => ({ ...doc.data(), firestoreId: doc.id || `fallback-${index}` }));
                console.log("[Portfolio] Portfolio data fetched:", data);
                setPortfolioData(data);
        } catch (error) {
                console.error('[Portfolio] Portfolio verisi alınırken hata oluştu:', error);
                setPortfolioData([]);
        } finally {
            setLoading(false);
        }
        };
        getPortfolio();
    }, []);
    
    // useEffect(() => { // containerDimensions için useEffect kaldırıldı
    // ...
    // }, []);
    
    // useEffect(() => { // Başlangıç paketleme için useEffect (animatedItems) kaldırıldı
    // ...
    // }, [portfolioData, sizeProfiles, containerDimensions]);

    // useScrollAnimation ile ilgili kısımlar kaldırıldı
    // const observerTargets = useMemo(() => ... , [animatedItems]);
    // useScrollAnimation(observerTargets.map(t => t.current));

    const renderPortfolio = (portfolio) => {
        return (
            <div className="images-container" ref={containerRef}>
                {
                    portfolio.map((item, idx) => (
                        <div 
                            className="image-box" 
                            key={item.firestoreId || idx}
                            onClick={() => window.open(item.url, "_blank")}
                        >
                            <img 
                                src={item.image} 
                                className="portfolio-image"
                                alt={item.name}
                            />
                        </div>
                    ))
                }
            </div>
        );
    }

    return (
        <>
            <div className="container portfolio-page">
                <h1 className="page-title">
                    {/* <AnimatedLetters // Kaldırıldı
                        letterClass={letterClass}
                        strArray={"Portfolio".split("")}
                        idx={15}
                    /> */}
                    Portfolio
                </h1>
                {loading && <p>Loading portfolio...</p>}
                {!loading && portfolioData.length === 0 && <p>No portfolio items found.</p>}
                {!loading && portfolioData.length > 0 && renderPortfolio(portfolioData)}
            </div>
            {/* <Loader type="pacman" /> // Loader'ı da sadeleştirebilir veya farklı bir yerde yönetebiliriz. Şimdilik kalsın. */}
        </>
    );
}

export default Portfolio;