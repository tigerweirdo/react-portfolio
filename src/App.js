import React, { Suspense, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Layout from './components/Layout'
import Home from './components/Home'
import About from './components/About'
import Portfolio from './components/Portfolio'
import Contact from './components/Contact'
import './App.scss'

// GSAP ScrollTrigger'ı kaydet
gsap.registerPlugin(ScrollTrigger)

const App = () => {
  useEffect(() => {
    // Smooth scrolling için
    const sections = document.querySelectorAll('section')
    
    sections.forEach(section => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top center',
        end: 'bottom center',
        toggleClass: 'active',
        markers: false
      })
    })

    // Scroll animasyonları
    gsap.from('.home-section', {
      duration: 1,
      opacity: 0,
      y: 50,
      ease: 'power3.out'
    })

    gsap.from('.about-section', {
      duration: 1,
      opacity: 0,
      y: 50,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.about-section',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    })

    gsap.from('.portfolio-section', {
      duration: 1,
      opacity: 0,
      y: 50,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.portfolio-section',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    })

    gsap.from('.contact-section', {
      duration: 1,
      opacity: 0,
      y: 50,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.contact-section',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    })
  }, [])

  return (
    <>
      <Layout>
        <Suspense fallback={<div>Yükleniyor...</div>}>
          <section className="home-section">
            <Home />
          </section>
          <section className="about-section">
            <About />
          </section>
          <section className="portfolio-section">
            <Portfolio />
          </section>
          <section className="contact-section">
            <Contact />
          </section>
        </Suspense>
      </Layout>
    </>
  )
}

export default App