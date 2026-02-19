import React, { useState, useEffect, useRef, useCallback, memo, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Home from './components/Home';
import About from './components/About';
import Portfolio from './components/Portfolio';
import Contact from './components/Contact';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.scss';

// Lazy load admin components
const Login = lazy(() => import('./components/Admin/Login'));
const AdminLayout = lazy(() => import('./components/Admin/AdminLayout'));
const Dashboard = lazy(() => import('./components/Admin/Dashboard'));
const PortfolioManager = lazy(() => import('./components/Admin/PortfolioManager'));

// Gizli admin slug - .env'den okunuyor
const ADMIN_SLUG = process.env.REACT_APP_ADMIN_SLUG || 'p-x7k9';

// Admin route handler
const AdminRouteHandler = memo(({ children }) => {
  const location = useLocation();

  useEffect(() => {
    const isAdminRoute = location.pathname.startsWith(`/${ADMIN_SLUG}`);
    if (isAdminRoute) {
      document.documentElement.classList.add('admin-page');
      document.body.classList.add('admin-page');
    } else {
      document.documentElement.classList.remove('admin-page');
      document.body.classList.remove('admin-page');
    }
  }, [location.pathname]);

  return <>{children}</>;
});

// Page transition variants - very subtle
const pageTransition = {
  initial: { opacity: 1 },
  animate: { 
    opacity: 1,
    transition: {
      duration: 0.3
    }
  },
  exit: { 
    opacity: 1
  }
};

const App = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const appContainerRef = useRef(null);
  const sectionsRef = useRef(['home', 'about', 'portfolio', 'contact']);

  useEffect(() => {
    const storedAuth = localStorage.getItem('isAdminAuthenticated');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
    setAuthChecked(true);
  }, []);

  // Intersection Observer for active section tracking
  useEffect(() => {
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
    const sections = sectionsRef.current;

    const timer = setTimeout(() => {
      if (currentAppContainer) {
        sections.forEach(sectionId => {
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
        sections.forEach(sectionId => {
          const element = document.getElementById(sectionId);
          if (element) {
            observer.unobserve(element);
          }
        });
        observer.disconnect();
      }
    };
  }, []);

  const handleLoginSuccess = useCallback(() => {
    setIsAuthenticated(true);
    localStorage.setItem('isAdminAuthenticated', 'true');
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          Kimlik doğrulama durumu kontrol ediliyor...
        </motion.div>
      </div>
    );
  }

  return (
    <Router>
      <AdminRouteHandler>
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
                <motion.section 
                  id="home" 
                  className={`page-section ${activeSection === 'home' ? 'active' : ''}`}
                  {...pageTransition}
                >
                  <Home scrollToSection={scrollToSection} />
                </motion.section>

                <motion.section 
                  id="about" 
                  className={`page-section ${activeSection === 'about' ? 'active' : ''}`}
                  {...pageTransition}
                >
                  <About />
                </motion.section>

                <motion.section 
                  id="portfolio" 
                  className={`page-section ${activeSection === 'portfolio' ? 'active' : ''}`}
                  {...pageTransition}
                >
                  <Portfolio />
                </motion.section>

                <motion.section 
                  id="contact" 
                  className={`page-section ${activeSection === 'contact' ? 'active' : ''}`}
                  {...pageTransition}
                >
                  <Contact />
                </motion.section>
              </div>
            </div>
          )}
        />
        {/* Admin login */}
        <Route
          path={`/${ADMIN_SLUG}`}
          element={
            <Suspense fallback={<div className="loading-auth">Yükleniyor...</div>}>
              {isAuthenticated ? (
                <Navigate to={`/${ADMIN_SLUG}/dashboard`} replace />
              ) : (
                <Login onLoginSuccess={handleLoginSuccess} />
              )}
            </Suspense>
          }
        />
        {/* Admin panel - nested routes */}
        <Route
          path={`/${ADMIN_SLUG}/*`}
          element={
            <Suspense fallback={<div className="loading-auth">Yükleniyor...</div>}>
              {isAuthenticated ? (
                <AdminLayout onLogout={handleLogout} />
              ) : (
                <Navigate to={`/${ADMIN_SLUG}`} replace />
              )}
            </Suspense>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="portfolio" element={<PortfolioManager />} />
        </Route>
        {/* Eski /admin URL'lerini ana sayfaya yönlendir */}
        <Route path="/admin/*" element={<Navigate to="/" replace />} />
        <Route path="/admin" element={<Navigate to="/" replace />} />
        </Routes>
      </AdminRouteHandler>
    </Router>
  );
};

export default App;
