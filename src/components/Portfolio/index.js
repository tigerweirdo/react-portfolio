import React, { useEffect, useState, useMemo, useCallback } from "react";
import AnimatedLetters from "../AnimatedLetters";
import "./index.scss";
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../../firebase';

const Portfolio = () => { 
    const [letterClass, setLetterClass] = useState('text-animate');
    const [portfolio, setPortfolio] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLetterClass('text-animate-hover');
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        getPortfolio();
    }, []);

    const getPortfolio = useCallback(async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'portfolio'));
            setPortfolio(querySnapshot.docs.map((doc) => doc.data()));
        } catch (error) {
            console.error('Portfolio verisi alınırken hata oluştu:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const renderPortfolio = useMemo(() => {
        if (loading) {
            return <div className="loading">Yükleniyor...</div>;
        }
        return (
            <div className="images-container">
                {portfolio.map((port, idx) => (
                    <div className="image-box" key={idx}>
                        <img 
                            src={port.image}
                            className="portfolio-image"
                            alt={port.name}
                            loading="lazy"
                            decoding="async"
                        />
                        <div className="content">
                            <p className="title">{port.name}</p>
                            <h4 className="description">{port.description}</h4>
                            <button
                                className="btn"
                                onClick={() => window.open(port.url, '_blank')}
                            >View</button>
                        </div>
                    </div>
                ))}
            </div>
        );
    }, [portfolio, loading]);

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