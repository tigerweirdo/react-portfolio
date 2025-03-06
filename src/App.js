import React, { Suspense, useEffect } from 'react'
import Layout from './components/Layout'
import { Outlet, useLocation } from 'react-router-dom'
import './App.scss'

const App = () => {
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      const section = document.getElementById(location.pathname.slice(1) || 'home')
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' })
      }
    }

    handleScroll()
  }, [location])

  return (
    <>
      <Layout>
        <Suspense fallback={<div>Yükleniyor...</div>}>
          <div className="content">
            <div id="home">
              <Home />
            </div>
            <div id="about">
              <About />
            </div>
            <div id="portfolio">
              <Portfolio />
            </div>
            <div id="contact">
              <Contact />
            </div>
          </div>
        </Suspense>
      </Layout>
    </>
  )
}

export default App