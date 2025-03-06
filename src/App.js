import React, { Suspense } from 'react'
import Layout from './components/Layout'
import Home from './components/Home'
import About from './components/About'
import Portfolio from './components/Portfolio'
import Contact from './components/Contact'
import './App.scss'

const App = () => {
  return (
    <>
      <Layout>
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