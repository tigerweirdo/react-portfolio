import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db, ensureAuth } from '../../firebase';
import { FaExternalLinkAlt, FaImage } from 'react-icons/fa';
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
        <div className="admin-spinner" />
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="admin-page-header">
        <div className="page-header-left">
          <span className="page-eyebrow">(Db-00)</span>
          <h1 className="page-title">Overview</h1>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-item" onClick={() => navigate('../portfolio')}>
          <span className="stat-code">SC_01</span>
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">Toplam Proje</span>
        </div>
        <div className="stat-item">
          <span className="stat-code">SC_02</span>
          <span className="stat-number">{stats.withCover}</span>
          <span className="stat-label">Kapak Görselli</span>
        </div>
      </div>

      <div className="dashboard-section">
        <h2 className="section-title">Son Eklenen Projeler</h2>

        {stats.recentItems.length === 0 ? (
          <div className="dashboard-empty">
            <p>Henüz portfolyo öğesi eklenmemiş.</p>
            <button className="qa-btn" onClick={() => navigate('../portfolio?action=new')}>
              + İlk Projenizi Ekleyin
            </button>
          </div>
        ) : (
          <div className="recent-list">
            {stats.recentItems.map(item => (
              <div key={item.id} className="recent-row">
                <div className="recent-thumb">
                  {item.cover || item.image ? (
                    <img src={item.cover || item.image} alt={item.name} />
                  ) : (
                    <div className="thumb-placeholder"><FaImage /></div>
                  )}
                </div>
                <span className="recent-name">{item.name}</span>
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

      <div className="dashboard-section">
        <h2 className="section-title">Hızlı İşlemler</h2>
        <button className="qa-btn" onClick={() => navigate('../portfolio?action=new')}>
          + Yeni Proje Ekle
        </button>
        <button className="qa-btn" onClick={() => navigate('../portfolio')}>
          Projeleri Yönet
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
