import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Home from './components/Home';
import About from './components/About';
import Portfolio from './components/Portfolio';
import Contact from './components/Contact';
import Login from './components/Admin/Login';
import PortfolioAdminPanel from './components/Admin/PortfolioAdminPanel';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.scss';

const App = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const appContainerRef = useRef(null);
  const sectionsRef = useRef(['home', 'about', 'portfolio', 'contact']);
  const scrollTimeoutRef = useRef(null);

  // isScrolling durumunu ref ile takip et
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

  // Basitleştirilmiş scroll fonksiyonu
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

  // Daha stabil wheel handler
  const handleWheelScroll = useCallback((event) => {
    if (isScrolling) {
      event.preventDefault();
      return;
    }

    const currentIndex = sectionsRef.current.findIndex(section => section === activeSection);
    const threshold = 50; // Minimum scroll değeri
    
    if (Math.abs(event.deltaY) < threshold) {
      return; // Çok küçük scroll hareketlerini yok say
    }
    
    if (event.deltaY > 0) {
      // Aşağı scroll
      if (currentIndex < sectionsRef.current.length - 1) {
        event.preventDefault();
        scrollToSectionByIndex(currentIndex + 1);
      }
    } else {
      // Yukarı scroll
      if (currentIndex > 0) {
        event.preventDefault();
        scrollToSectionByIndex(currentIndex - 1);
      }
    }
  }, [activeSection, scrollToSectionByIndex, isScrolling]);

  // Daha basit intersection observer
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

    // Kısa bir gecikme ile observer'ı başlat
    const timer = setTimeout(() => {
      if (currentAppContainer) {
        sectionsRef.current.forEach(sectionId => {
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
        sectionsRef.current.forEach(sectionId => {
          const element = document.getElementById(sectionId);
          if (element) {
            observer.unobserve(element);
          }
        });
        observer.disconnect();
      }
    };
  }, []);

  // Wheel event listener
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

  // Keyboard navigation - basitleştirilmiş
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

  // Touch support - basitleştirilmiş
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
      const swipeThreshold = 80;
      const difference = touchStartY - touchEndY;

      if (Math.abs(difference) > swipeThreshold) {
        const currentIndex = sectionsRef.current.findIndex(section => section === activeSection);
        
        if (difference > 0 && currentIndex < sectionsRef.current.length - 1) {
          // Yukarı swipe (sonraki section)
          scrollToSectionByIndex(currentIndex + 1);
        } else if (difference < 0 && currentIndex > 0) {
          // Aşağı swipe (önceki section)
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

  // Cleanup
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAdminAuthenticated', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAdminAuthenticated');
  };

  const scrollToSection = (sectionId) => {
    const sectionIndex = sectionsRef.current.findIndex(section => section === sectionId);
    if (sectionIndex !== -1) {
      scrollToSectionByIndex(sectionIndex);
    }
  };

  if (!authChecked) {
    return <div className="loading-auth">Kimlik doğrulama durumu kontrol ediliyor...</div>;
  }

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
                className={`scroll-container ${isScrolling ? 'scrolling' : ''}`}
              >
                <motion.section 
                  id="home" 
                  className={`page-section ${activeSection === 'home' ? 'active' : ''}`}
                >
                  <Home scrollToSection={scrollToSection} />
                </motion.section>

                <motion.section 
                  id="about" 
                  className={`page-section ${activeSection === 'about' ? 'active' : ''}`}
                >
                  <About />
                </motion.section>

                <motion.section 
                  id="portfolio" 
                  className={`page-section ${activeSection === 'portfolio' ? 'active' : ''}`}
                >
                  <Portfolio />
                </motion.section>

                <motion.section 
                  id="contact" 
                  className={`page-section ${activeSection === 'contact' ? 'active' : ''}`}
                >
                  <Contact />
                </motion.section>
              </div>
            </div>
          )}
        />
        <Route 
          path="/admin"
          element={
            isAuthenticated ? (
              <Navigate to="/admin/portfolio" replace />
            ) : (
              <Login onLoginSuccess={handleLoginSuccess} />
            )
          }
        />
        <Route 
          path="/admin/portfolio"
          element={
            isAuthenticated ? (
              <PortfolioAdminPanel onLogout={handleLogout} />
            ) : (
              <Navigate to="/admin" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;