import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db, ensureAuth } from '../../firebase';
import { FaBriefcase, FaImage, FaPlus, FaExternalLinkAlt } from 'react-icons/fa';
import './Dashboard.scss';

const Dashboard = () => {
  const [stats, setStats] = useState({ total: 0, withCover: 0, recentItems: [] });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        await ensureAuth();
        const snapshot = await getDocs(collection(db, 'portfolio'));
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const withCover = items.filter(item => item.cover && item.cover !== item.image).length;
        const recent = items.slice(0, 5);

        setStats({ total: items.length, withCover, recentItems: recent });
      } catch (err) {
        console.error('[Dashboard] Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner" />
        <p>Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="dashboard-subtitle">Portfolyonuzun genel durumu</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card" onClick={() => navigate('../portfolio')}>
          <div className="stat-icon portfolio-icon">
            <FaBriefcase />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Toplam Proje</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon image-icon">
            <FaImage />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.withCover}</span>
            <span className="stat-label">Özel Kapak Resmi</span>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2>Son Eklenen Projeler</h2>
          <button className="action-btn" onClick={() => navigate('../portfolio')}>
            Tümünü Gör
          </button>
        </div>

        {stats.recentItems.length === 0 ? (
          <div className="empty-state">
            <FaBriefcase className="empty-icon" />
            <p>Henüz portfolyo öğesi eklenmemiş.</p>
            <button className="add-first-btn" onClick={() => navigate('../portfolio?action=new')}>
              <FaPlus /> İlk Projenizi Ekleyin
            </button>
          </div>
        ) : (
          <div className="recent-list">
            {stats.recentItems.map(item => (
              <div key={item.id} className="recent-item">
                <div className="recent-thumb">
                  {item.cover || item.image ? (
                    <img src={item.cover || item.image} alt={item.name} />
                  ) : (
                    <div className="thumb-placeholder"><FaImage /></div>
                  )}
                </div>
                <div className="recent-info">
                  <h4>{item.name}</h4>
                  <p>{item.description?.substring(0, 80)}{item.description?.length > 80 ? '...' : ''}</p>
                </div>
                {item.url && (
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="recent-link" aria-label="Projeye git">
                    <FaExternalLinkAlt />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="quick-actions">
        <h2>Hızlı İşlemler</h2>
        <div className="actions-grid">
          <button className="quick-action-card" onClick={() => navigate('../portfolio?action=new')}>
            <FaPlus className="qa-icon" />
            <span>Yeni Proje Ekle</span>
          </button>
          <button className="quick-action-card" onClick={() => navigate('../portfolio')}>
            <FaBriefcase className="qa-icon" />
            <span>Projeleri Yönet</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
