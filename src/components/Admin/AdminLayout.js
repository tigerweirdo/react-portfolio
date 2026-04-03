import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import './AdminLayout.scss';

const ADMIN_SLUG = process.env.REACT_APP_ADMIN_SLUG || 'p-x7k9';

const AdminLayout = ({ onLogout, children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = window.location.pathname;

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  return (
    <div className="admin-layout">
      <header className="admin-topbar">
        <span className="topbar-eyebrow">(Ad-00)</span>
        <span className="topbar-logo">Admin</span>

        <nav className={`topbar-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <a
            href={`/${ADMIN_SLUG}/dashboard`}
            className={pathname.includes('dashboard') ? 'active' : ''}
          >
            Dashboard
          </a>
          <a
            href={`/${ADMIN_SLUG}/portfolio`}
            className={pathname.includes('portfolio') ? 'active' : ''}
          >
            Portfolyo
          </a>
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
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
