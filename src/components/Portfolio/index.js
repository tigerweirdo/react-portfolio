import React, { useEffect, useState, useMemo, useCallback } from "react";
import AnimatedLetters from "../AnimatedLetters";
import "./index.scss";
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../../firebase';

const Portfolio = () => { 
    const [letterClass, setLetterClass] = useState('text-animate');
    const [portfolio, setPortfolio] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLetterClass('text-animate-hover');
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    const getPortfolio = useCallback(async () => {
        try {
            setError(null);
            const querySnapshot = await getDocs(collection(db, 'portfolio'));
            setPortfolio(querySnapshot.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id
            })));
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

    const handlePortfolioClick = useCallback((url) => {
        window.open(url, '_blank');
    }, []);

    const handleImageError = useCallback((e) => {
        e.target.src = '/placeholder-image.jpg'; // Varsayılan bir resim ekleyin
    }, []);

    const renderPortfolio = useMemo(() => {
        if (loading) {
            return <div className="loading">Yükleniyor...</div>;
        }

        if (error) {
            return <div className="error">{error}</div>;
        }

        return (
            <div className="images-container">
                {portfolio.map((port) => (
                    <div className="image-box" key={port.id}>
                        <img 
                            src={port.image}
                            className="portfolio-image"
                            alt={port.name}
                            loading="lazy"
                            decoding="async"
                            onError={handleImageError}
                            width="300"
                            height="200"
                        />
                        <div className="content">
                            <p className="title">{port.name}</p>
                            <h4 className="description">{port.description}</h4>
                            <button
                                className="btn"
                                onClick={() => handlePortfolioClick(port.url)}
                            >View</button>
                        </div>
                    </div>
                ))}
            </div>
        );
    }, [portfolio, loading, error, handlePortfolioClick, handleImageError]);

    return (
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
    );
}

export default Portfolio;