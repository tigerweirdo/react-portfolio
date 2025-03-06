import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Home from './components/Home';
import About from './components/About';
import Portfolio from './components/Portfolio';
import Contact from './components/Contact';
import './App.scss';

const App = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [scrollingEnabled, setScrollingEnabled] = useState(true);

  useEffect(() => {
    // Sayfa kaydırıldığında hangi section'ın görünür olduğunu tespit etme
    const handleScroll = () => {
      // Eğer scroll yapma programlı olarak kilitlenmişse işlem yapmayalım
      if (!scrollingEnabled) return;
      
      const sections = document.querySelectorAll('section');
      const scrollPosition = window.scrollY + window.innerHeight / 3; // Ekran yüksekliğinin 1/3'ü kadar offset

      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          setActiveSection(section.id);
        }
      });
    };

    // İlk yükleme sırasında scroll pozisyonunu kontrol etme
    handleScroll();

    // Scroll event listener ekleme
    window.addEventListener('scroll', handleScroll);
    
    // Body overflow özelliğini düzeltelim
    document.body.style.overflow = 'auto';
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrollingEnabled]);

  // Bir section'a scroll yapma fonksiyonu
  const scrollToSection = (sectionId) => {
    // Programlı scroll sırasında geçici olarak manuel scroll'u devre dışı bırakalım
    setScrollingEnabled(false);
    
    const section = document.getElementById(sectionId);
    if (section) {
      const yOffset = -80; // Header yüksekliği kadar offset
      const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });
      
      // Smooth scroll tamamlandıktan sonra scroll'u tekrar aktif hale getirelim
      setTimeout(() => {
        setScrollingEnabled(true);
        setActiveSection(sectionId);
      }, 1000); // 1 saniye sonra (smooth scroll süresi)
    }
  };

  return (
    <div className="app-container">
      <Layout activeSection={activeSection} scrollToSection={scrollToSection}>
        <section id="home" className={`section ${activeSection === 'home' ? 'active' : ''}`}>
          <Home />
        </section>
        <section id="about" className={`section ${activeSection === 'about' ? 'active' : ''}`}>
          <About />
        </section>
        <section id="portfolio" className={`section ${activeSection === 'portfolio' ? 'active' : ''}`}>
          <Portfolio />
        </section>
        <section id="contact" className={`section ${activeSection === 'contact' ? 'active' : ''}`}>
          <Contact />
        </section>
      </Layout>
    </div>
  );
};

export default App;