import { Outlet } from 'react-router-dom'
import Sidebar from '../Sidebar/'
import './index.scss'

const Layout = () => {
  return (
    <div className="App">
      <Sidebar />
      <div className="page">
        <span className="tags top-tags">_________________</span>

        <Outlet />
        <span className="tags bottom-tags">
          _______
          <span className="bottom-tag-html">________</span>
        </span>
      </div>
    </div>
  )
}

export default Layout