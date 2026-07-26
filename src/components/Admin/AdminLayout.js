import React, { useState, useCallback, Suspense } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import './AdminLayout.scss';

const ADMIN_SLUG = process.env.REACT_APP_ADMIN_SLUG || 'p-x7k9';

// NavLink "active" durumunu route eşleşmesinden hesaplar. Eskiden
// pathname.includes('portfolio') kullanılıyordu; admin slug'ı "portfolio"
// kelimesini içerseydi her iki sekme de aynı anda aktif görünürdü.
const navClass = ({ isActive }) => (isActive ? 'active' : '');

const AdminLayout = ({ onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <div className="admin-layout">
      <header className="admin-topbar">
        <span className="topbar-eyebrow">(Ad-00)</span>
        <span className="topbar-logo">Admin</span>

        <nav className={`topbar-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          {/* <a href> her tıklamada tam sayfa yeniden yükleme yapıyordu;
              NavLink ile SPA içinde kalıyoruz. */}
          <NavLink to={`/${ADMIN_SLUG}/dashboard`} className={navClass} onClick={closeMobileMenu}>
            Dashboard
          </NavLink>
          <NavLink to={`/${ADMIN_SLUG}/portfolio`} className={navClass} onClick={closeMobileMenu}>
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
          aria-expanded={mobileMenuOpen}
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
