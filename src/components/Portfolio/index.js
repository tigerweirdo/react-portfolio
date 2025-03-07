import React, { useEffect, useState, useMemo, useCallback } from "react";
import AnimatedLetters from "../AnimatedLetters";
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../../firebase';
import "./index.scss";

const Portfolio = () => {
    const [letterClass, setLetterClass] = useState('text-animate');
    const [portfolio, setPortfolio] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const [filteredPortfolio, setFilteredPortfolio] = useState([]);
    
    // Animasyon için timer
    useEffect(() => {
        const timer = setTimeout(() => {
            setLetterClass('text-animate-hover');
        }, 3000);
        
        return () => clearTimeout(timer);
    }, []);
    
    // Firestore'dan veri çekme
    const getPortfolio = useCallback(async () => {
        try {
            setError(null);
            const querySnapshot = await getDocs(collection(db, 'portfolio'));
            const portfolioData = querySnapshot.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id,
                tags: doc.data().tags || ['Genel'] // Eğer etiket yoksa varsayılan "Genel" ekle
            }));
            setPortfolio(portfolioData);
            setFilteredPortfolio(portfolioData);
        } catch (error) {
            console.error('Portfolio verisi alınırken hata oluştu:', error);
            setError('Portfolio verileri yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    }, []);
    
    useEffect(() => {
        getPortfolio();
    }, [getPortfolio]);
    
    // Filtreleme fonksiyonu
    useEffect(() => {
        if (activeFilter === 'all') {
            setFilteredPortfolio(portfolio);
        } else {
            setFilteredPortfolio(
                portfolio.filter(item => 
                    item.tags && item.tags.includes(activeFilter)
                )
            );
        }
    }, [portfolio, activeFilter]);
    
    // Benzersiz etiketleri al
    const uniqueTags = useMemo(() => {
        const tags = new Set();
        portfolio.forEach(item => {
            if (item.tags && Array.isArray(item.tags)) {
                item.tags.forEach(tag => tags.add(tag));
            }
        });
        return Array.from(tags);
    }, [portfolio]);
    
    // Link tıklaması
    const handlePortfolioClick = useCallback((url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    }, []);
    
    // Resim yükleme hatası
    const handleImageError = useCallback((e) => {
        e.target.src = '/placeholder-image.jpg';
    }, []);
    
    // Yeniden deneme
    const handleRetry = useCallback(() => {
        setLoading(true);
        getPortfolio();
    }, [getPortfolio]);
    
    // Filtre değiştirme
    const handleFilterChange = useCallback((filter) => {
        setActiveFilter(filter);
    }, []);
    
    // UI Render Fonksiyonları
    const renderFilterButtons = useMemo(() => (
        <div className="filter-container">
            <button 
                className={`filter-button ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => handleFilterChange('all')}
            >
                Tümü
            </button>
            {uniqueTags.map(tag => (
                <button 
                    key={tag}
                    className={`filter-button ${activeFilter === tag ? 'active' : ''}`}
                    onClick={() => handleFilterChange(tag)}
                >
                    {tag}
                </button>
            ))}
        </div>
    ), [uniqueTags, activeFilter, handleFilterChange]);
    
    const renderPortfolio = useMemo(() => {
        if (loading) {
            return (
                <div className="loading">
                    <div className="spinner"></div>
                </div>
            );
        }
        
        if (error) {
            return (
                <div className="error">
                    <div>
                        <p>{error}</p>
                        <button className="retry-button" onClick={handleRetry}>
                            Yeniden Dene
                        </button>
                    </div>
                </div>
            );
        }
        
        if (filteredPortfolio.length === 0) {
            return (
                <div className="error">
                    <p>Bu filtreye uygun proje bulunamadı.</p>
                </div>
            );
        }
        
        return (
            <div className="portfolio-grid">
                {filteredPortfolio.map((port) => (
                    <div className="portfolio-item" key={port.id}>
                        <div className="portfolio-image-container">
                            <img
                                src={port.image}
                                className="portfolio-image"
                                alt={port.name}
                                loading="lazy"
                                decoding="async"
                                onError={handleImageError}
                            />
                        </div>
                        
                        {port.tags && port.tags.length > 0 && (
                            <div className="tags">
                                {port.tags.slice(0, 2).map(tag => (
                                    <span className="tag" key={tag}>{tag}</span>
                                ))}
                            </div>
                        )}
                        
                        <div className="content">
                            <h3 className="title">{port.name}</h3>
                            <p className="description">{port.description}</p>
                            <div className="button-container">
                                <button
                                    className="btn primary"
                                    onClick={() => handlePortfolioClick(port.url)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                        <polyline points="15 3 21 3 21 9"></polyline>
                                        <line x1="10" y1="14" x2="21" y2="3"></line>
                                    </svg>
                                    Görüntüle
                                </button>
                                {port.sourceCode && (
                                    <button
                                        className="btn secondary"
                                        onClick={() => handlePortfolioClick(port.sourceCode)}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="16 18 22 12 16 6"></polyline>
                                            <polyline points="8 6 2 12 8 18"></polyline>
                                        </svg>
                                        Kaynak Kodu
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }, [filteredPortfolio, loading, error, handlePortfolioClick, handleImageError, handleRetry]);
    
    return (
        <div className="portfolio-page">
            <div className="container">
                <div className="page-header">
                    <h1 className="page-title">
                        <AnimatedLetters
                            letterClass={letterClass}
                            strArray={"Portfolio".split("")}
                            idx={15}
                        />
                    </h1>
                </div>
                
                {renderFilterButtons}
                {renderPortfolio}
            </div>
        </div>
    );
};

export default Portfolio;