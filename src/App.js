import React, { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './components/Home'
import About from './components/About'
import Portfolio from './components/Portfolio'
import Contact from './components/Contact'
import './App.scss'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <Layout>
            <Suspense fallback={<div>Yükleniyor...</div>}>
              <Home />
            </Suspense>
          </Layout>
        } />
        <Route path="/about" element={
          <Layout>
            <Suspense fallback={<div>Yükleniyor...</div>}>
              <About />
            </Suspense>
          </Layout>
        } />
        <Route path="/portfolio" element={
          <Layout>
            <Suspense fallback={<div>Yükleniyor...</div>}>
              <Portfolio />
            </Suspense>
          </Layout>
        } />
        <Route path="/contact" element={
          <Layout>
            <Suspense fallback={<div>Yükleniyor...</div>}>
              <Contact />
            </Suspense>
          </Layout>
        } />
      </Routes>
    </Router>
  )
}

export default App