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

/**
 * GEÇİCİ: yalnızca hero bölümü yayında; About / Work / Contact gizli.
 *
 * Geri açmak için tek yapman gereken bunu `false` yapıp yeniden build almak —
 * hiçbir bölüm silinmedi, bileşenler ve stilleri yerinde duruyor.
 * Admin paneli bu bayraktan etkilenmez, her durumda çalışır.
 */
const HERO_ONLY = true;

const SECTION_IDS = ['home', 'about', 'portfolio', 'contact'];

const App = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const appContainerRef = useRef(null);
  const portfolioSectionRef = useRef(null);
  const portfolioLazyObserverRef = useRef(null);
  const contactSectionRef = useRef(null);
  const contactLazyObserverRef = useRef(null);

  const [loadPortfolio, setLoadPortfolio] = useState(
    () => typeof window !== 'undefined' && window.location.hash === '#portfolio'
  );

  const [loadContact, setLoadContact] = useState(
    () => typeof window !== 'undefined' && window.location.hash === '#contact'
  );

  // Admin route detection - window.location ile direkt kontrol
  const pathname = window.location.pathname;
  const isAdminRoute = pathname.startsWith(`/${ADMIN_SLUG}`);

  // Oturum durumu Firebase Auth'tan gelir. Eskiden yalnızca
  // localStorage['isAdminAuthenticated'] bayrağına bakılıyordu; bu bayrağı
  // tarayıcı konsolundan herkes set edebildiği için gerçek bir koruma değildi.
  // firebase/auth SDK'sı yalnızca admin yolunda, dinamik import ile yüklenir —
  // public sayfanın paketi bundan etkilenmez.
  useEffect(() => {
    if (!isAdminRoute) return undefined;

    let cancelled = false;
    let unsubscribe = () => {};

    import('./firebase-auth')
      .then(({ subscribeToAuth }) => {
        if (cancelled) return;
        unsubscribe = subscribeToAuth((user) => {
          setIsAuthenticated(Boolean(user));
          setAuthChecked(true);
        });
      })
      .catch((error) => {
        console.error('[Admin] Kimlik doğrulama modülü yüklenemedi:', error);
        if (cancelled) return;
        setIsAuthenticated(false);
        setAuthChecked(true);
      });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [isAdminRoute]);

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
      } else if (window.location.hash === '#contact') {
        setLoadContact(true);
      }
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Work bölümü görünüme yaklaşınca (scroll) Portfolio lazy chunk'ını tetikle
  useEffect(() => {
    if (isAdminRoute || HERO_ONLY || loadPortfolio) return undefined;

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

  // Contact bölümü görünüme yaklaşınca Contact lazy chunk'ını tetikle
  useEffect(() => {
    if (isAdminRoute || HERO_ONLY || loadContact) return undefined;

    const timer = setTimeout(() => {
      const el = contactSectionRef.current;
      if (!el) return;

      const scrollRoot = appContainerRef.current ?? null;
      const obs = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            setLoadContact(true);
          }
        },
        {
          root: scrollRoot,
          rootMargin: '280px 0px 280px 0px',
          threshold: 0,
        }
      );
      obs.observe(el);
      contactLazyObserverRef.current = obs;
    }, 300);

    return () => {
      clearTimeout(timer);
      contactLazyObserverRef.current?.disconnect();
      contactLazyObserverRef.current = null;
    };
  }, [isAdminRoute, loadContact]);

  // Intersection Observer for active section tracking
  useEffect(() => {
    // Hero-only modda izlenecek başka bölüm yok.
    if (isAdminRoute || HERO_ONLY) return;

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

  const handleLogout = useCallback(async () => {
    try {
      const { signOutAdmin } = await import('./firebase-auth');
      await signOutAdmin();
      // onAuthStateChanged tetiklenir → aşağıdaki Routes login ekranına düşer.
    } catch (error) {
      console.error('[Admin] Çıkış yapılamadı:', error);
    }
  }, []);

  const scrollToSection = useCallback((sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Admin bölümü. Yalnızca burada oturum beklenir; public sayfa artık
  // "kimlik doğrulanıyor" ekranında bekletilmiyor.
  if (isAdminRoute) {
    if (!authChecked) {
      return (
        <div className="loading-auth">
          Kimlik doğrulama durumu kontrol ediliyor...
        </div>
      );
    }

    // Admin sayfaları gerçek iç içe route'lar olarak tanımlanır. Eskiden
    // pathname string'i elle parçalanıyor ve hiç <Routes> render edilmiyordu;
    // bu yüzden Dashboard içindeki navigate('../portfolio') çağrıları
    // /portfolio adresine düşüyor ve panelde hiçbir şey olmuyordu.
    return (
      <Router>
        <ToastContainer position="top-right" autoClose={5000} theme="colored" />
        <Suspense fallback={<div className="loading-auth">Yükleniyor...</div>}>
          {isAuthenticated ? (
            <Routes>
              <Route path={`/${ADMIN_SLUG}`} element={<AdminLayout onLogout={handleLogout} />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="portfolio" element={<PortfolioManager />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Route>
              <Route path="*" element={<Navigate to={`/${ADMIN_SLUG}/dashboard`} replace />} />
            </Routes>
          ) : (
            <Routes>
              <Route path={`/${ADMIN_SLUG}`} element={<Login />} />
              <Route path="*" element={<Navigate to={`/${ADMIN_SLUG}`} replace />} />
            </Routes>
          )}
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
                  <Home scrollToSection={scrollToSection} heroOnly={HERO_ONLY} />
                </section>

                {HERO_ONLY ? null : (
                <>
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
                  ref={contactSectionRef}
                  id="contact"
                  className={`page-section ${activeSection === 'contact' ? 'active' : ''}`}
                >
                  {!loadContact ? (
                    <div
                      className="section-lazy-fallback"
                      aria-hidden="true"
                    />
                  ) : (
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
                  )}
                </section>
                </>
                )}
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
