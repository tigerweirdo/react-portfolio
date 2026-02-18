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
  const [isScrolling, setIsScrolling] = useState(false);
  const appContainerRef = useRef(null);
  const sectionsRef = useRef(['home', 'about', 'portfolio', 'contact']);
  const scrollTimeoutRef = useRef(null);
  const isScrollingRef = useRef(isScrolling);

  useEffect(() => {
    isScrollingRef.current = isScrolling;
  }, [isScrolling]);

  useEffect(() => {
    const storedAuth = localStorage.getItem('isAdminAuthenticated');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
    setAuthChecked(true);
  }, []);

  const scrollToSectionByIndex = useCallback((index) => {
    if (isScrolling || index < 0 || index >= sectionsRef.current.length) {
      return;
    }
    
    const sectionId = sectionsRef.current[index];
    const section = document.getElementById(sectionId);
    
    if (appContainerRef.current && section) {
      setIsScrolling(true);
      setActiveSection(sectionId);

      const targetPosition = section.offsetTop;
      
      appContainerRef.current.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
      
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 800);
    }
  }, [isScrolling]);

  const handleWheelScroll = useCallback((event) => {
    event.preventDefault();

    if (isScrolling) return;

    const currentIndex = sectionsRef.current.findIndex(section => section === activeSection);
    const threshold = 15;
    
    if (Math.abs(event.deltaY) < threshold) return;
    
    if (event.deltaY > 0) {
      if (currentIndex < sectionsRef.current.length - 1) {
        scrollToSectionByIndex(currentIndex + 1);
      }
    } else {
      if (currentIndex > 0) {
        scrollToSectionByIndex(currentIndex - 1);
      }
    }
  }, [activeSection, scrollToSectionByIndex, isScrolling]);

  useEffect(() => {
    const observerOptions = {
      root: appContainerRef.current,
      rootMargin: '-45% 0px -45% 0px',
      threshold: 0.1
    };

    const observerCallback = (entries) => {
      if (isScrollingRef.current) return;
      
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

  useEffect(() => {
    const currentAppContainer = appContainerRef.current;

    if (window.location.pathname === '/' && currentAppContainer) {
      currentAppContainer.addEventListener('wheel', handleWheelScroll, { passive: false });
    }

    return () => {
      if (currentAppContainer) {
        currentAppContainer.removeEventListener('wheel', handleWheelScroll);
      }
    };
  }, [handleWheelScroll]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (window.location.pathname !== '/' || isScrolling) return;
      
      const currentIndex = sectionsRef.current.findIndex(section => section === activeSection);
      
      switch (event.key) {
        case 'ArrowDown':
        case 'PageDown':
          event.preventDefault();
          if (currentIndex < sectionsRef.current.length - 1) {
            scrollToSectionByIndex(currentIndex + 1);
          }
          break;
        case 'ArrowUp':
        case 'PageUp':
          event.preventDefault();
          if (currentIndex > 0) {
            scrollToSectionByIndex(currentIndex - 1);
          }
          break;
        case 'Home':
          event.preventDefault();
          scrollToSectionByIndex(0);
          break;
        case 'End':
          event.preventDefault();
          scrollToSectionByIndex(sectionsRef.current.length - 1);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSection, scrollToSectionByIndex, isScrolling]);

  useEffect(() => {
    let touchStartY = 0;
    let touchEndY = 0;
    const currentAppContainer = appContainerRef.current;

    const handleTouchStart = (event) => {
      touchStartY = event.changedTouches[0].screenY;
    };

    const handleTouchEnd = (event) => {
      if (isScrolling) return;
      
      touchEndY = event.changedTouches[0].screenY;
      const swipeThreshold = window.innerWidth <= 768 ? 50 : 80;
      const difference = touchStartY - touchEndY;

      if (Math.abs(difference) > swipeThreshold) {
        const currentIndex = sectionsRef.current.findIndex(section => section === activeSection);
        
        if (difference > 0 && currentIndex < sectionsRef.current.length - 1) {
          scrollToSectionByIndex(currentIndex + 1);
        } else if (difference < 0 && currentIndex > 0) {
          scrollToSectionByIndex(currentIndex - 1);
        }
      }
    };

    if (window.location.pathname === '/' && currentAppContainer) {
      currentAppContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
      currentAppContainer.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    return () => {
      if (currentAppContainer) {
        currentAppContainer.removeEventListener('touchstart', handleTouchStart);
        currentAppContainer.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [activeSection, scrollToSectionByIndex, isScrolling]);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
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
    const sectionIndex = sectionsRef.current.findIndex(section => section === sectionId);
    if (sectionIndex !== -1) {
      scrollToSectionByIndex(sectionIndex);
    }
  }, [scrollToSectionByIndex]);

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
                className={`scroll-container ${isScrolling ? 'scrolling' : ''}`}
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
                  <Portfolio scrollToSection={scrollToSection} />
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
