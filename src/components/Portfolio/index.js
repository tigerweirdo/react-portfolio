import React, { useState, useEffect, useCallback } from "react";
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../../firebase';
import "./index.scss";

const Portfolio = () => {
    const [portfolio, setPortfolio] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState('all');
    
    // Firestore'dan portfolio verilerini çekme
    const fetchPortfolio = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const querySnapshot = await getDocs(collection(db, 'portfolio'));
            const data = querySnapshot.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id,
                category: doc.data().category || 'other'
            }));
            setPortfolio(data);
        } catch (err) {
            console.error("Veriler yüklenirken hata oluştu:", err);
            setError("Portfolio projeleri yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
        } finally {
            setLoading(false);
        }
    }, []);
    
    useEffect(() => {
        fetchPortfolio();
    }, [fetchPortfolio]);
    
    // Kategorileri oluştur
    const categories = React.useMemo(() => {
        const categorySet = new Set(portfolio.map(item => item.category));
        return ['all', ...Array.from(categorySet)];
    }, [portfolio]);
    
    // Filtrelenmiş projeleri al
    const filteredProjects = React.useMemo(() => {
        if (activeCategory === 'all') {
            return portfolio;
        }
        return portfolio.filter(item => item.category === activeCategory);
    }, [portfolio, activeCategory]);
    
    // Link tıklama işleyicisi
    const handleProjectClick = useCallback((url) => {
        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    }, []);
    
    // Kategori değiştirme işleyicisi
    const handleCategoryChange = useCallback((category) => {
        setActiveCategory(category);
    }, []);
    
    return (
        <div className="portfolio-container">
            <div className="portfolio-header">
                <h1>Portfolio</h1>
                <p>Oluşturduğum projelerden bazı örnekler</p>
            </div>
            
            <div className="portfolio-categories">
                {categories.map(category => (
                    <button 
                        key={category}
                        className={`category-btn ${activeCategory === category ? 'active' : ''}`}
                        onClick={() => handleCategoryChange(category)}
                    >
                        {category === 'all' ? 'Tümü' : category}
                    </button>
                ))}
            </div>
            
            {loading && (
                <div className="portfolio-loading">
                    <div className="loader"></div>
                    <p>Projeler yükleniyor...</p>
                </div>
            )}
            
            {error && (
                <div className="portfolio-error">
                    <p>{error}</p>
                    <button onClick={fetchPortfolio}>Tekrar Dene</button>
                </div>
            )}
            
            {!loading && !error && (
                <>
                    {filteredProjects.length === 0 ? (
                        <div className="no-projects">
                            <p>Bu kategoride henüz proje bulunmuyor.</p>
                        </div>
                    ) : (
                        <div className="portfolio-grid">
                            {filteredProjects.map(project => (
                                <div className="portfolio-card" key={project.id}>
                                    <div className="card-image">
                                        <img 
                                            src={project.image} 
                                            alt={project.title} 
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = '/images/placeholder.jpg';
                                            }}
                                        />
                                        {project.category && (
                                            <span className="project-category">{project.category}</span>
                                        )}
                                    </div>
                                    <div className="card-content">
                                        <h3>{project.title || project.name}</h3>
                                        <p>{project.description}</p>
                                        <div className="card-actions">
                                            {project.url && (
                                                <button 
                                                    className="view-project"
                                                    onClick={() => handleProjectClick(project.url)}
                                                >
                                                    Projeyi Görüntüle
                                                </button>
                                            )}
                                            {project.github && (
                                                <button 
                                                    className="view-source"
                                                    onClick={() => handleProjectClick(project.github)}
                                                >
                                                    <svg viewBox="0 0 24 24" fill="currentColor" height="20" width="20">
                                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                                    </svg>
                                                    Kaynak Kodu
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Portfolio;