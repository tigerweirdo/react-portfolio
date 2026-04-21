import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.scss';

// Aşağıdaki bölümler ayrı chunk — ana paket daha hafif parse edilir
const About = lazy(() =>
  import(/* webpackChunkName: "about" */ './components/About')
);
const Contact = lazy(() =>
  import(/* webpackChunkName: "contact" */ './components/Contact')
);
const Portfolio = lazy(() =>
  import(/* webpackChunkName: "portfolio-work" */ './components/Portfolio')
);

// Lazy load admin components
const Login = lazy(() => import('./components/Admin/Login'));
const AdminLayout = lazy(() => import('./components/Admin/AdminLayout'));
const Dashboard = lazy(() => import('./components/Admin/Dashboard'));
const PortfolioManager = lazy(() => import('./components/Admin/PortfolioManager'));

// Gizli admin slug - .env'den okunuyor
const ADMIN_SLUG = process.env.REACT_APP_ADMIN_SLUG || 'p-x7k9';

const SECTION_IDS = ['home', 'about', 'portfolio', 'contact'];

const App = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const appContainerRef = useRef(null);
  const portfolioSectionRef = useRef(null);
  const portfolioLazyObserverRef = useRef(null);

  const [loadPortfolio, setLoadPortfolio] = useState(
    () => typeof window !== 'undefined' && window.location.hash === '#portfolio'
  );

  // Admin route detection - window.location ile direkt kontrol
  const pathname = window.location.pathname;
  const isAdminRoute = pathname.startsWith(`/${ADMIN_SLUG}`);

  useEffect(() => {
    const storedAuth = localStorage.getItem('isAdminAuthenticated');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
    setAuthChecked(true);
  }, []);

  useEffect(() => {
    if (isAdminRoute) {
      document.documentElement.classList.add('admin-page');
      document.body.classList.add('admin-page');
    } else {
      document.documentElement.classList.remove('admin-page');
      document.body.classList.remove('admin-page');
    }
  }, [isAdminRoute]);

  // #portfolio ile doğrudan açılışta veya hash değişince Work chunk'ını yükle
  useEffect(() => {
    const onHash = () => {
      if (window.location.hash === '#portfolio') {
        setLoadPortfolio(true);
      }
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Work bölümü görünüme yaklaşınca (scroll) Portfolio lazy chunk'ını tetikle
  useEffect(() => {
    if (isAdminRoute || loadPortfolio) return undefined;

    const timer = setTimeout(() => {
      const el = portfolioSectionRef.current;
      if (!el) return;

      const scrollRoot = appContainerRef.current ?? null;
      const obs = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            setLoadPortfolio(true);
          }
        },
        {
          root: scrollRoot,
          rootMargin: '280px 0px 280px 0px',
          threshold: 0,
        }
      );
      obs.observe(el);
      portfolioLazyObserverRef.current = obs;
    }, 300);

    return () => {
      clearTimeout(timer);
      portfolioLazyObserverRef.current?.disconnect();
      portfolioLazyObserverRef.current = null;
    };
  }, [isAdminRoute, loadPortfolio]);

  // Intersection Observer for active section tracking
  useEffect(() => {
    if (isAdminRoute) return;

    const observerOptions = {
      root: appContainerRef.current,
      rootMargin: '-45% 0px -45% 0px',
      threshold: 0.1
    };

    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const currentAppContainer = appContainerRef.current;

    const timer = setTimeout(() => {
      if (currentAppContainer) {
        SECTION_IDS.forEach(sectionId => {
          const element = document.getElementById(sectionId);
          if (element) {
            observer.observe(element);
          }
        });
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      if (currentAppContainer) {
        SECTION_IDS.forEach(sectionId => {
          const element = document.getElementById(sectionId);
          if (element) {
            observer.unobserve(element);
          }
        });
        observer.disconnect();
      }
    };
  }, [isAdminRoute]);

  const handleLoginSuccess = useCallback(() => {
    setIsAuthenticated(true);
    localStorage.setItem('isAdminAuthenticated', 'true');
    window.location.href = `/${ADMIN_SLUG}/dashboard`;
  }, []);

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAdminAuthenticated');
    window.location.href = '/';
  }, []);

  const scrollToSection = useCallback((sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  if (!authChecked) {
    return (
      <div className="loading-auth">
        Kimlik doğrulama durumu kontrol ediliyor...
      </div>
    );
  }

  // Admin routes - React Router kullanmadan, doğrudan render
  if (isAdminRoute) {
    // Exact match: /p-x7k9 → Login sayfası
    if (pathname === `/${ADMIN_SLUG}`) {
      if (isAuthenticated) {
        window.location.href = `/${ADMIN_SLUG}/dashboard`;
        return null;
      }
      return (
        <>
          <ToastContainer position="top-right" autoClose={5000} theme="colored" />
          <Suspense fallback={<div className="loading-auth">Yükleniyor...</div>}>
            <Login onLoginSuccess={handleLoginSuccess} />
          </Suspense>
        </>
      );
    }

    // Admin panel sayfaları: /p-x7k9/dashboard, /p-x7k9/portfolio
    if (!isAuthenticated) {
      window.location.href = `/${ADMIN_SLUG}`;
      return null;
    }

    const adminSubPath = pathname.replace(`/${ADMIN_SLUG}`, '').replace(/^\//, '');

    return (
      <Router>
        <ToastContainer position="top-right" autoClose={5000} theme="colored" />
        <Suspense fallback={<div className="loading-auth">Yükleniyor...</div>}>
          <AdminLayout onLogout={handleLogout}>
            <Suspense fallback={<div className="admin-page-loading"><div className="admin-spinner" /></div>}>
              {adminSubPath === 'dashboard' && <Dashboard />}
              {adminSubPath === 'portfolio' && <PortfolioManager />}
              {!adminSubPath && <Dashboard />}
            </Suspense>
          </AdminLayout>
        </Suspense>
      </Router>
    );
  }

  // Ana sayfa
  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <Routes>
        <Route
          path="/"
          element={(
            <div className="one-page-app">
              <div
                ref={appContainerRef}
                className="scroll-container"
              >
                <section
                  id="home"
                  className={`page-section ${activeSection === 'home' ? 'active' : ''}`}
                >
                  <Home scrollToSection={scrollToSection} />
                </section>

                <section
                  id="about"
                  className={`page-section ${activeSection === 'about' ? 'active' : ''}`}
                >
                  <Suspense
                    fallback={(
                      <div
                        className="section-lazy-fallback"
                        aria-hidden="true"
                      />
                    )}
                  >
                    <About />
                  </Suspense>
                </section>

                <section
                  ref={portfolioSectionRef}
                  id="portfolio"
                  className={`page-section ${activeSection === 'portfolio' ? 'active' : ''}`}
                >
                  {!loadPortfolio ? (
                    <div
                      className="portfolio-lazy-placeholder"
                      aria-hidden="true"
                    />
                  ) : (
                    <Suspense
                      fallback={(
                        <div
                          className="portfolio-lazy-fallback"
                          role="status"
                          aria-live="polite"
                        >
                          Work yükleniyor…
                        </div>
                      )}
                    >
                      <Portfolio />
                    </Suspense>
                  )}
                </section>

                <section
                  id="contact"
                  className={`page-section ${activeSection === 'contact' ? 'active' : ''}`}
                >
                  <Suspense
                    fallback={(
                      <div
                        className="section-lazy-fallback"
                        aria-hidden="true"
                      />
                    )}
                  >
                    <Contact />
                  </Suspense>
                </section>
              </div>
            </div>
          )}
        />
        <Route path="/admin/*" element={<Navigate to="/" replace />} />
        <Route path="/admin" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
