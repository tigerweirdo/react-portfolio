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
          <div className="content">
            <Home />
            <About />
            <Portfolio />
            <Contact />
          </div>
        </Suspense>
      </Layout>
    </>
  )
}

export default App