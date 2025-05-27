import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import AnimatedLetters from "../AnimatedLetters";
import "./index.scss";
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../../firebase';
import useScrollAnimation from "../../hooks/useScrollAnimation";

const MAX_DIMENSION_RETRIES = 20;
const GRID_SIZE = 20; // Grid hücre boyutu (piksel)

// --- Yeni Paketleme Algoritması ---
const createGrid = (containerWidth, containerHeight) => {
    const cols = Math.floor(containerWidth / GRID_SIZE);
    const rows = Math.floor(containerHeight / GRID_SIZE);
    return Array(rows).fill().map(() => Array(cols).fill(false));
};

const canPlaceItem = (grid, startRow, startCol, itemRows, itemCols) => {
    if (startRow + itemRows > grid.length || startCol + itemCols > grid[0].length) {
        return false;
    }
    
    for (let r = startRow; r < startRow + itemRows; r++) {
        for (let c = startCol; c < startCol + itemCols; c++) {
            if (grid[r][c]) return false;
        }
    }
    return true;
};

const placeItem = (grid, startRow, startCol, itemRows, itemCols) => {
    for (let r = startRow; r < startRow + itemRows; r++) {
        for (let c = startCol; c < startCol + itemCols; c++) {
            grid[r][c] = true;
        }
    }
};

const findCompactPosition = (grid, itemRows, itemCols) => {
    let bestPosition = null;
    let bestScore = Infinity; // En düşük skor = en kompakt pozisyon
    
    // Tüm olası pozisyonları kontrol et
    for (let row = 0; row <= grid.length - itemRows; row++) {
        for (let col = 0; col <= grid[0].length - itemCols; col++) {
            if (canPlaceItem(grid, row, col, itemRows, itemCols)) {
                // Bu pozisyon için "kompaktlık skoru" hesapla
                // Skor = sol üst köşeye olan uzaklık + çevredeki dolu hücre sayısı (ters)
                const distanceScore = row + col; // Sol üst köşeye yakınlık
                const adjacencyScore = calculateAdjacencyScore(grid, row, col, itemRows, itemCols);
                const totalScore = distanceScore - adjacencyScore; // Adjacency'yi çıkarıyoruz (daha fazla komşu = daha iyi)
                
                if (totalScore < bestScore) {
                    bestScore = totalScore;
                    bestPosition = { row, col };
                }
            }
        }
    }
    
    return bestPosition;
};

// Çevredeki dolu hücrelerin sayısını hesapla (komşuluk skoru)
const calculateAdjacencyScore = (grid, startRow, startCol, itemRows, itemCols) => {
    let adjacentCount = 0;
    
    // Öğenin etrafındaki hücreleri kontrol et
    for (let r = startRow - 1; r <= startRow + itemRows; r++) {
        for (let c = startCol - 1; c <= startCol + itemCols; c++) {
            // Grid sınırları içinde mi?
            if (r >= 0 && r < grid.length && c >= 0 && c < grid[0].length) {
                // Öğenin kendisi değil mi?
                if (!(r >= startRow && r < startRow + itemRows && c >= startCol && c < startCol + itemCols)) {
                    // Dolu hücre mi?
                    if (grid[r][c]) {
                        adjacentCount++;
                    }
                }
            }
        }
    }
    
    return adjacentCount;
};

const packAllItems = (items, containerWidth, containerHeight) => {
    const grid = createGrid(containerWidth, containerHeight);
    const packedItems = [];
    
    // Öğeleri boyutlarına göre sırala (büyükten küçüğe) - bu daha iyi paketleme sağlar
    const sortedItems = [...items].sort((a, b) => (b.width * b.height) - (a.width * a.height));
    
    sortedItems.forEach(item => {
        const itemRows = Math.ceil(item.height / GRID_SIZE);
        const itemCols = Math.ceil(item.width / GRID_SIZE);
        
        const position = findCompactPosition(grid, itemRows, itemCols);
        
        if (position) {
            placeItem(grid, position.row, position.col, itemRows, itemCols);
            packedItems.push({
                ...item,
                top: position.row * GRID_SIZE,
                left: position.col * GRID_SIZE,
                // Boyutları grid'e hizala
                width: itemCols * GRID_SIZE,
                height: itemRows * GRID_SIZE
            });
        } else {
            console.warn(`[Portfolio] Could not find position for item ${item.id} (${itemCols}x${itemRows} grid units)`);
        }
    });
    
    return packedItems;
};
// --- Paketleme Algoritması Sonu ---

const Portfolio = () => { 
    const [letterClass, setLetterClass] = useState('text-animate');
    const [portfolioData, setPortfolioData] = useState([]);
    const [animatedItems, setAnimatedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const containerRef = useRef(null);
    const [containerDimensions, setContainerDimensions] = useState(null);
    const dimensionRetryCount = useRef(0);
    const itemRefs = useRef({}); // Öğelerin referanslarını tutmak için

    const sizeProfiles = useMemo(() => [
        { id: 's', width: 160, height: 160 }, // Yeni en küçük kare
        { id: 'm', width: 200, height: 200 }, // Yeni orta kare
        { id: 'l', width: 240, height: 240 }, // Yeni büyük kare
        { id: 'xl', width: 280, height: 280 }  // Yeni en büyük kare
    ], []);

    useEffect(() => {
        const timer = setTimeout(() => setLetterClass('text-animate-hover'), 3000);
        return () => clearTimeout(timer);
    }, []);

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
    
    useEffect(() => {
        let retryTimeoutId = null;
        const updateDimensions = () => {
            if (containerRef.current) {
                dimensionRetryCount.current = 0;
                requestAnimationFrame(() => {
                    if (!containerRef.current) {
                        console.warn('[Portfolio] updateDimensions (in rAF) - containerRef.current became null after rAF scheduled');
                        return;
                    }
                    const currentWidth = containerRef.current.offsetWidth;
                    const currentHeight = containerRef.current.offsetHeight;
                    console.log('[Portfolio] updateDimensions (in rAF) - offsetWidth:', currentWidth, 'offsetHeight:', currentHeight);
                    const paddingValue = 20;
                    const newDims = {
                        width: Math.max(0, currentWidth - (paddingValue * 2)),
                        height: Math.max(0, currentHeight - (paddingValue * 2)),
                        rawWidth: currentWidth,
                        rawHeight: currentHeight
                    };
                    console.log('[Portfolio] updateDimensions (in rAF) - newDims set:', newDims);
                    setContainerDimensions(newDims);
                });
            } else {
                if (dimensionRetryCount.current < MAX_DIMENSION_RETRIES) {
                    dimensionRetryCount.current++;
                    console.warn(`[Portfolio] updateDimensions - containerRef.current is null. Retry ${dimensionRetryCount.current}/${MAX_DIMENSION_RETRIES}...`);
                    retryTimeoutId = setTimeout(updateDimensions, 100 + dimensionRetryCount.current * 50);
                } else {
                    console.error("[Portfolio] updateDimensions - Max retries reached. containerRef.current is still null.");
                }
            }
        };
        console.log("[Portfolio] Setting up dimension listener and performing initial measurement.");
        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => {
            console.log("[Portfolio] Cleaning up dimension listener and retry timeout.");
            if (retryTimeoutId) clearTimeout(retryTimeoutId);
            window.removeEventListener('resize', updateDimensions);
        };
    }, []);
    
    // Başlangıç paketleme
    useEffect(() => {
        console.log('[Portfolio] Compact Packing Effect - portfolioData.length:', portfolioData.length, 'containerDimensions:', containerDimensions);
        if (portfolioData.length > 0 && containerDimensions && containerDimensions.width > 0 && containerDimensions.height > 0) {
            const { width: availableWidth, height: availableHeight } = containerDimensions;
            console.log("[Portfolio] Initializing compact packing with available space:", availableWidth, "x", availableHeight);

            const itemsWithSizes = portfolioData.map((itemData, index) => {
                const baseSizeProfile = sizeProfiles[index % sizeProfiles.length];
                return {
                    ...itemData,
                    id: itemData.firestoreId,
                    width: Math.min(baseSizeProfile.width, availableWidth),
                    height: Math.min(baseSizeProfile.height, availableHeight),
                    zIndex: index + 1
                };
            });

            const packedItems = packAllItems(itemsWithSizes, availableWidth, availableHeight);
            console.log("[Portfolio] Compact packed items:", packedItems);
            setAnimatedItems(packedItems);
        } else if (portfolioData.length > 0) {
            console.warn("[Portfolio] Compact Packing: Data available, but container dimensions not suitable.");
            setAnimatedItems([]);
        } else {
            console.log("[Portfolio] Compact Packing: No portfolio data or no suitable container dimensions.");
            setAnimatedItems([]);
        }
    }, [portfolioData, sizeProfiles, containerDimensions]);

    // Intersection Observer efekti (artık useScrollAnimation hook'u kullanılacak)
    // useEffect(() => { ... eski IntersectionObserver kodu ... }); // Bu bloğu kaldır

    // animatedItems değiştiğinde scroll animasyonunu uygula
    // Not: itemRefs.current, animatedItems'daki her bir öğe için bir ref içermelidir.
    // Portfolio bileşeninde bu, renderPortfolio içinde dinamik olarak ayarlanıyor.
    // Bu nedenle, hook'a doğrudan itemRefs.current'ı geçmek yerine,
    // animatedItems'dan türetilmiş bir ref listesi geçebiliriz veya hook'u buna göre ayarlayabiliriz.
    // Şimdilik, hook'un itemRefs.current'ı ve içindeki öğeleri doğru şekilde işlemesini bekleyeceğiz.
    
    // useScrollAnimation'ı çağıralım. animatedItems'dan bir öğe listesi oluşturup refs olarak geçelim
    // Bu, her bir öğenin DOM'da gerçekten var olmasını ve ref'inin itemRefs.current'a eklenmiş olmasını gerektirir.
    const observerTargets = useMemo(() => 
        animatedItems.map(item => ({ id: item.id, current: itemRefs.current[item.id] })).filter(t => t.current)
    , [animatedItems]);
    
    useScrollAnimation(observerTargets.map(t => t.current));

    // Kompakt animasyon döngüsü
    useEffect(() => {
        if (animatedItems.length === 0 || !containerDimensions || containerDimensions.width === 0 || containerDimensions.height === 0) {
            return;
        }

        const { width: availableWidth, height: availableHeight } = containerDimensions;

        const intervalId = setInterval(() => {
            setAnimatedItems(prevItems => {
                if (prevItems.length === 0) return [];

                // Rastgele bir öğeyi seç ve yeni boyut ver
                const itemIndexToChange = Math.floor(Math.random() * prevItems.length);
                const newSizeProfile = sizeProfiles[Math.floor(Math.random() * sizeProfiles.length)];
                
                const updatedItems = prevItems.map((item, index) => {
                    if (index === itemIndexToChange) {
                        return {
                            ...item,
                            width: Math.min(newSizeProfile.width, availableWidth),
                            height: Math.min(newSizeProfile.height, availableHeight),
                            zIndex: Math.floor(Math.random() * prevItems.length) + 1
                        };
                    }
                    return item;
                });

                // Tüm öğeleri yeniden kompakt şekilde paketle
                const repackedItems = packAllItems(updatedItems, availableWidth, availableHeight);
                return repackedItems;
            });
        }, 8000); // 8 saniyede bir yeniden paketleme (daha da uzun aralık)

        return () => clearInterval(intervalId);
    }, [animatedItems.length, sizeProfiles, containerDimensions]);

    const renderPortfolio = useMemo(() => {
        let contentInsideContainer = null;
        if (loading && portfolioData.length === 0) {
            contentInsideContainer = <div className="loading">Portfolyo yükleniyor...</div>;
        } else if (!loading && portfolioData.length === 0) {
            contentInsideContainer = <div className="loading">Portfolyo verisi bulunamadı.</div>;
        } else if (!containerDimensions || containerDimensions.rawWidth === 0 || containerDimensions.rawHeight === 0) {
            contentInsideContainer = <div className="loading">Animasyon alanı ölçülüyor... (G: {containerDimensions?.rawWidth || 'N/A'}, Y: {containerDimensions?.rawHeight || 'N/A'})</div>;
        } else if (portfolioData.length > 0 && animatedItems.length === 0 && (containerDimensions.width === 0 || containerDimensions.height === 0)) {
            contentInsideContainer = <div className="loading">Kullanılabilir alan yok (İç G: {containerDimensions.width}, İç Y: {containerDimensions.height}). CSS kontrol edin.</div>;
        } else if (animatedItems.length > 0) {
            contentInsideContainer = animatedItems.map(item => (
                <div
                    className={`image-box`}
                    key={item.id}
                    ref={el => itemRefs.current[item.id] = el}
                    style={{
                        width: `${item.width}px`,
                        height: `${item.height}px`,
                        top: `${item.top}px`,
                        left: `${item.left}px`,
                        zIndex: item.zIndex
                    }}
                    onClick={() => window.open(item.url, "_blank")}
                >
                    <img src={item.image} className="portfolio-image" alt={item.name} loading="lazy" decoding="async" />
                    <div className="content">
                        <p className="title">{item.name}</p>
                        <h4 className="description">{item.description}</h4>
                        <button className="btn" onClick={(e) => { e.stopPropagation(); }}>View</button>
                    </div>
                </div>
            ));
        } else if (portfolioData.length > 0 && animatedItems.length === 0) {
             contentInsideContainer = <div className="loading">Portfolyo öğeleri yerleştirilemiyor. Alanı veya öğe boyutlarını kontrol edin.</div>;
        } else {
            contentInsideContainer = <div className="loading">Portfolyo öğeleri hazırlanıyor...</div>;
        }
        return (
            <div
                className="images-container"
                ref={containerRef}
            >
                {contentInsideContainer}
            </div>
        );
    }, [loading, portfolioData, animatedItems, containerDimensions]);

    return (
        <>
        <div className="container portfolio-page">
            <h1 className="page-title">
                <AnimatedLetters
                    letterClass={letterClass}
                    strArray={"Portfolio".split("")}
                    idx={15}
                />
            </h1>
            {renderPortfolio}
        </div>
        </>
    );
};

export default Portfolio;