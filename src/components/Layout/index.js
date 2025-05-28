import React from 'react'
// import { ParallaxProvider } from 'react-scroll-parallax'; // Kaldırıldı
import './index.scss'

const Layout = ({ children, activeSection, scrollToSection }) => {
  return (
    // <ParallaxProvider> // Kaldırıldı
      <div className="App">
        <div className="page">
          {children}
        </div>
      </div>
    // </ParallaxProvider> // Kaldırıldı
  )
}

export default Layout