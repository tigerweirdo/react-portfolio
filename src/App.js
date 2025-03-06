import React, { Suspense, useEffect, useState } from 'react'
import Layout from './components/Layout'
import Home from './components/Home'
import About from './components/About'
import Portfolio from './components/Portfolio'
import Contact from './components/Contact'
import './App.scss'

const App = () => {
  const [activeSection, setActiveSection] = useState('home')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Sayfa yüklendiğinde loading'i kaldır
    setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    const handleScroll = () => {
      const sections = document.querySelectorAll('section')
      const scrollPosition = window.scrollY + window.innerHeight / 2

      sections.forEach(section => {
        const sectionTop = section.offsetTop
        const sectionHeight = section.offsetHeight

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          setActiveSection(section.id)
        }
      })
    }

    // İlk yüklemede scroll pozisyonunu kontrol et
    handleScroll()

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId)
    if (section) {
      const yOffset = -80 // Header yüksekliği kadar offset
      const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset

      window.scrollTo({
        top: y,
        behavior: 'smooth'
      })
    }
  }

  if (isLoading) {
    return (
      <div className="loader-active">
        <div className="loader"></div>
      </div>
    )
  }

  return (
    <>
      <Layout activeSection={activeSection} scrollToSection={scrollToSection}>
        <Suspense fallback={<div>Yükleniyor...</div>}>
          <section id="home" className={`home-section ${activeSection === 'home' ? 'active' : ''}`}>
            <Home />
          </section>
          <section id="about" className={`about-section ${activeSection === 'about' ? 'active' : ''}`}>
            <About />
          </section>
          <section id="portfolio" className={`portfolio-section ${activeSection === 'portfolio' ? 'active' : ''}`}>
            <Portfolio />
          </section>
          <section id="contact" className={`contact-section ${activeSection === 'contact' ? 'active' : ''}`}>
            <Contact />
          </section>
        </Suspense>
      </Layout>
    </>
  )
}

export default App