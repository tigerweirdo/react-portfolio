import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import './AdminLayout.scss';

const AdminLayout = ({ onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  return (
    <div className="admin-layout">
      <header className="admin-topbar">
        <span className="topbar-eyebrow">(Ad-00)</span>
        <span className="topbar-logo">Admin</span>

        <nav className={`topbar-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <NavLink
            to="dashboard"
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="portfolio"
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            Portfolyo
          </NavLink>
          <button className="logout-btn" onClick={onLogout}>
            Çıkış
          </button>
        </nav>

        <button
          className="topbar-hamburger"
          onClick={toggleMobileMenu}
          aria-label={mobileMenuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </header>

      <main className="admin-content">
        <Suspense fallback={<div className="admin-page-loading"><div className="admin-spinner" /></div>}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
};

export default AdminLayout;
