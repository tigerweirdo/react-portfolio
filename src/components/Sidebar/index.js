import './index.scss'
import { useState } from 'react'
import LogoSubtitle from '../../assets/images/logo_sub.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faLinkedin,
  faGithub,
  faInstagram,
} from '@fortawesome/free-brands-svg-icons'
import {
  faHome,
  faUser,
  faEnvelope,
  faSuitcase,
  faClose,
  faBars
} from '@fortawesome/free-solid-svg-icons'
import { Link, NavLink } from 'react-router-dom'

const Sidebar = () => {
  const [showNav, setShowNav] = useState(false);

  return (
    <div className="nav-bar">
      <Link 
        className="logo"
        to="/"
        onClick={() => setShowNav(false)}>
        <img className="sub-logo" src={LogoSubtitle} alt="tigerweirdo" />
      </Link>
      <FontAwesomeIcon 
        onClick={() => setShowNav(!showNav)} 
        icon={faBars} 
        color="#000" 
        size="2x" 
        className="hamburger-icon" />
      <nav className={showNav ? 'mobile-show' : ''}>
        
        <NavLink 
          exact="true"
          activeclassname="active"
          className="home-link"
          to="/"
          onClick={() => setShowNav(false)}>
          <FontAwesomeIcon icon={faHome} className="icon" />
        </NavLink>
        <NavLink 
          activeclassname="active"
          className="about-link"
          to="/about"
          onClick={() => setShowNav(false)}>
          <FontAwesomeIcon icon={faUser} className="icon" />
        </NavLink>
        <NavLink
          activeclassname="active"
          className="portfolio-link"
          to="/portfolio"
          onClick={() => setShowNav(false)}
        >
          <FontAwesomeIcon icon={faSuitcase} className="icon" />
        </NavLink>
        <NavLink
          activeclassname="active"
          className="contact-link"
          to="/contact"
          onClick={() => setShowNav(false)}
        >
          <FontAwesomeIcon icon={faEnvelope} className="icon" />
        </NavLink>
        <FontAwesomeIcon 
          onClick={() => setShowNav(false)}
          icon={faClose}
          color="#ECA869"
          size="3x"
          className="close-icon" />
      </nav>
      <div className={showNav ? 'mobile-show' : ''}>
      <ul>
        <li>
          <a
            href="https://www.linkedin.com/in/mete-han-%C3%A7etiner-3534431a8/"
            target="_blank"
            rel="noreferrer"
          >
            <FontAwesomeIcon
              icon={faLinkedin}
              className="icon"
            />
          </a>
        </li>
        <li>
          <a
            href="https://github.com/tigerweirdo"
            target="_blank"
            rel="noreferrer"
          >
            <FontAwesomeIcon
              icon={faGithub}
              className="icon"
            />
          </a>
        </li>
        <li>
          <a
            href="https://www.instagram.com/temmuzcetiner/"
            rel="noreferrer"
            target="_blank"
          >
            <FontAwesomeIcon
              icon={faInstagram}
              className="icon"
            />
          </a>
        </li>
      </ul>
      </div>
    </div>
  )
}

export default Sidebar
