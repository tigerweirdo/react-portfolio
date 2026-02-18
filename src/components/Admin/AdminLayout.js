import React, { useState, useCallback, useEffect, Suspense } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { FaThLarge, FaBriefcase, FaSignOutAlt, FaBars, FaTimes, FaChevronLeft } from 'react-icons/fa';
import './AdminLayout.scss';

const NAV_ITEMS = [
  { to: 'dashboard', label: 'Dashboard', icon: <FaThLarge /> },
  { to: 'portfolio', label: 'Portfolyo', icon: <FaBriefcase /> },
];

const AdminLayout = ({ onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);
  const toggleMobile = useCallback(() => setMobileOpen(prev => !prev), []);

  return (
    <div className={`admin-layout ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}

      <aside className={`admin-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          {sidebarOpen && <h2 className="sidebar-title">Admin Panel</h2>}
          <button className="collapse-btn desktop-only" onClick={toggleSidebar} aria-label="Sidebar toggle">
            <FaChevronLeft className={`collapse-icon ${sidebarOpen ? '' : 'rotated'}`} />
          </button>
          <button className="close-btn mobile-only" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <FaTimes />
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title={item.label}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={onLogout} title="Çıkış Yap">
            <FaSignOutAlt className="nav-icon" />
            {sidebarOpen && <span className="nav-label">Çıkış Yap</span>}
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <button className="hamburger-btn mobile-only" onClick={toggleMobile} aria-label="Open menu">
            <FaBars />
          </button>
          <div className="topbar-title">
            {NAV_ITEMS.find(item => location.pathname.includes(item.to))?.label || 'Admin'}
          </div>
        </header>
        <main className="admin-content">
          <Suspense fallback={<div className="admin-page-loading"><div className="loading-dot-spinner" /></div>}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
