import React from 'react'
import './index.scss'

const Layout = ({ children, activeSection, scrollToSection }) => {
  return (
    <div className="App">
      {/* Sidebar removed */}
      <div className="page">
        {children}
      </div>
    </div>
  )
}

export default Layout