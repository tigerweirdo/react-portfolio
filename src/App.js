import { Route, Routes } from 'react-router-dom'
import React, { Suspense, lazy } from 'react'
import Layout from './components/Layout'
import './App.scss'

// Lazy load components
const Home = lazy(() => import('./components/Home'))
const About = lazy(() => import('./components/About'))
const Contact = lazy(() => import('./components/Contact'))
const Portfolio = lazy(() => import('./components/Portfolio'))

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={
            <Suspense fallback={<div>Yükleniyor...</div>}>
              <Home />
            </Suspense>
          } />
          <Route path="about" element={
            <Suspense fallback={<div>Yükleniyor...</div>}>
              <About />
            </Suspense>
          } />
          <Route path="/contact" element={
            <Suspense fallback={<div>Yükleniyor...</div>}>
              <Contact />
            </Suspense>
          } />
          <Route path="/portfolio" element={
            <Suspense fallback={<div>Yükleniyor...</div>}>
              <Portfolio />
            </Suspense>
          } />
        </Route>
      </Routes>
    </>
  )
}

export default App