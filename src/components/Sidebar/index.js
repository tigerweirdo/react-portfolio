import './index.scss'
import React, { useState } from 'react'
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
import { gsap } from 'gsap'

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false)

  const scrollToSection = (sectionId) => {
    const section = document.querySelector(sectionId)
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' })
      setIsOpen(false)
    }
  }

  return (
    <div className="nav-bar">
      <Link className="logo" to="/" onClick={() => scrollToSection('.home-section')}>
        <img className="sub-logo" src={LogoSubtitle} alt="tigerweirdo" />
      </Link>
      <FontAwesomeIcon 
        onClick={() => setIsOpen(!isOpen)} 
        icon={faBars} 
        color="#000" 
        size="2x" 
        className="hamburger-icon" />
      <nav className={isOpen ? 'mobile-show' : ''}>
        
        <NavLink 
          exact="true"
          activeclassname="active"
          className="home-link"
          to="/"
          onClick={() => scrollToSection('.home-section')}>
          <FontAwesomeIcon icon={faHome} className="icon" />
        </NavLink>
        <NavLink 
          activeclassname="active"
          className="about-link"
          to="/about"
          onClick={() => scrollToSection('.about-section')}>
          <FontAwesomeIcon icon={faUser} className="icon" />
        </NavLink>
        <NavLink
          activeclassname="active"
          className="portfolio-link"
          to="/portfolio"
          onClick={() => scrollToSection('.portfolio-section')}>
          <FontAwesomeIcon icon={faSuitcase} className="icon" />
        </NavLink>
        <NavLink
          activeclassname="active"
          className="contact-link"
          to="/contact"
          onClick={() => scrollToSection('.contact-section')}>
          <FontAwesomeIcon icon={faEnvelope} className="icon" />
        </NavLink>
        <FontAwesomeIcon 
          onClick={() => setIsOpen(false)}
          icon={faClose}
          color="#ECA869"
          size="3x"
          className="close-icon" />
      </nav>
      <div className={isOpen ? 'mobile-show' : ''}>
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
