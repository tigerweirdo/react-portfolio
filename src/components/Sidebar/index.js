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

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false)

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId)
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' })
      setIsOpen(false)
    }
  }

  return (
    <div className="nav-bar">
      <div className="logo" onClick={() => scrollToSection('home')}>
        <img className="sub-logo" src={LogoSubtitle} alt="tigerweirdo" />
      </div>
      <FontAwesomeIcon 
        onClick={() => setIsOpen(!isOpen)} 
        icon={faBars} 
        color="#ffd700" 
        size="2x" 
        className="hamburger-icon" />
      <nav className={isOpen ? 'mobile-show' : ''}>
        <div className="home-link" onClick={() => scrollToSection('home')}>
          <FontAwesomeIcon icon={faHome} className="icon" />
        </div>
        <div className="about-link" onClick={() => scrollToSection('about')}>
          <FontAwesomeIcon icon={faUser} className="icon" />
        </div>
        <div className="portfolio-link" onClick={() => scrollToSection('portfolio')}>
          <FontAwesomeIcon icon={faSuitcase} className="icon" />
        </div>
        <div className="contact-link" onClick={() => scrollToSection('contact')}>
          <FontAwesomeIcon icon={faEnvelope} className="icon" />
        </div>
        <FontAwesomeIcon 
          onClick={() => setIsOpen(false)}
          icon={faClose}
          color="#ffd700"
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
