import React, { Suspense } from 'react'
import Layout from './components/Layout'
import { Outlet } from 'react-router-dom'
import './App.scss'

const App = () => {
  return (
    <>
      <Layout>
        <Suspense fallback={<div>Yükleniyor...</div>}>
          <div className="content">
            <Outlet />
          </div>
        </Suspense>
      </Layout>
    </>
  )
}

export default App