import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
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

  useEffect(() => {
    // Sayfa yüklendiğinde localStorage'dan kimlik doğrulama durumunu kontrol et
    const storedAuth = localStorage.getItem('isAdminAuthenticated');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
    setAuthChecked(true); // Kimlik doğrulama kontrolü tamamlandı
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section.main-section'); // Sadece ana bölümdeki section'ları hedefle
      const scrollPosition = window.scrollY + window.innerHeight / 3;

      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          setActiveSection(section.id);
        }
      });
    };
    // Sadece ana sayfada scroll dinleyicisini ekle
    if (window.location.pathname === '/') {
        window.addEventListener('scroll', handleScroll);
        // Sayfa yüklendiğinde de bir kez çalıştır
        handleScroll();
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [window.location.pathname]); // Pathname değiştiğinde useEffect'i yeniden çalıştır

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAdminAuthenticated', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAdminAuthenticated');
  };

  // Kimlik doğrulama kontrolü tamamlanana kadar hiçbir şey gösterme (veya bir yükleme ekranı)
  if (!authChecked) {
    return <div className="loading-auth">Kimlik doğrulama durumu kontrol ediliyor...</div>; // Basit bir yükleme mesajı
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
            <div className="app-container">
              <Layout activeSection={activeSection}>
                <section id="home" className={`section main-section ${activeSection === 'home' ? 'active' : ''}`}>
                  <Home />
                </section>
                <section id="about" className={`section main-section ${activeSection === 'about' ? 'active' : ''}`}>
                  <About />
                </section>
                <section id="portfolio" className={`section main-section ${activeSection === 'portfolio' ? 'active' : ''}`}>
                  <Portfolio />
                </section>
                <section id="contact" className={`section main-section ${activeSection === 'contact' ? 'active' : ''}`}>
                  <Contact />
                </section>
              </Layout>
            </div>
          )}
        />
        <Route 
          path="/admin"
          element={isAuthenticated ? <PortfolioAdminPanel onLogout={handleLogout} /> : <Navigate to="/admin/login" replace />}
        />
        <Route 
          path="/admin/login"
          element={!isAuthenticated ? <Login onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/admin" replace />}
        />
        {/* Diğer rotalar buraya eklenebilir */}
        <Route path="*" element={<Navigate to="/" replace />} /> {/* Eşleşmeyen yolları anasayfaya yönlendir */}      
      </Routes>
    </Router>
  );
};

export default App;