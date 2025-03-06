import React from 'react'
import Sidebar from '../Sidebar/'
import './index.scss'

const Layout = ({ children, activeSection, scrollToSection }) => {
  return (
    <div className="App">
      <Sidebar activeSection={activeSection} scrollToSection={scrollToSection} />
      <div className="page">
        {children}
      </div>
    </div>
  )
}

export default Layout