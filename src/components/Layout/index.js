import React from 'react'
import Sidebar from '../Sidebar/'
import './index.scss'

const Layout = ({ children }) => {
  return (
    <div className="App">
      <Sidebar />
      <div className="page">
        {children}
      </div>
    </div>
  )
}

export default Layout