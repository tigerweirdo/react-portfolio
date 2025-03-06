import React, { Suspense, useEffect, useState } from 'react'
import Layout from './components/Layout'
import Home from './components/Home'
import About from './components/About'
import Portfolio from './components/Portfolio'
import Contact from './components/Contact'
import './App.scss'

const App = () => {
  const [activeSection, setActiveSection] = useState('home')

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section')
      const scrollPosition = window.scrollY

      sections.forEach(section => {
        const sectionTop = section.offsetTop
        const sectionHeight = section.offsetHeight

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          setActiveSection(section.id)
        }
      })
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId)
    section.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <Layout activeSection={activeSection} scrollToSection={scrollToSection}>
        <Suspense fallback={<div>Yükleniyor...</div>}>
          <section id="home" className="home-section">
            <Home />
          </section>
          <section id="about" className="about-section">
            <About />
          </section>
          <section id="portfolio" className="portfolio-section">
            <Portfolio />
          </section>
          <section id="contact" className="contact-section">
            <Contact />
          </section>
        </Suspense>
      </Layout>
    </>
  )
}

export default App