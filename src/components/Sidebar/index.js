import './index.scss'
import React, { useState, useEffect } from 'react'
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
import gsap from 'gsap'

const Sidebar = ({ activeSection, scrollToSection }) => {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Logo animasyonu
    gsap.from('.logo', {
      duration: 1,
      y: -50,
      opacity: 0,
      ease: 'power3.out',
      delay: 0.5
    })

    // Menü linkleri animasyonu
    gsap.from('.nav-bar nav a', {
      duration: 0.5,
      x: -50,
      opacity: 0,
      stagger: 0.1,
      ease: 'power2.out',
      delay: 1
    })

    // Sosyal medya ikonları animasyonu
    gsap.from('.nav-bar ul li', {
      duration: 0.5,
      y: 50,
      opacity: 0,
      stagger: 0.1,
      ease: 'power2.out',
      delay: 1.5
    })
  }, [])

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
        <div 
          className={`home-link ${activeSection === 'home' ? 'active' : ''}`}
          onClick={() => scrollToSection('home')}>
          <FontAwesomeIcon icon={faHome} className="icon" />
        </div>
        <div 
          className={`about-link ${activeSection === 'about' ? 'active' : ''}`}
          onClick={() => scrollToSection('about')}>
          <FontAwesomeIcon icon={faUser} className="icon" />
        </div>
        <div
          className={`portfolio-link ${activeSection === 'portfolio' ? 'active' : ''}`}
          onClick={() => scrollToSection('portfolio')}>
          <FontAwesomeIcon icon={faSuitcase} className="icon" />
        </div>
        <div
          className={`contact-link ${activeSection === 'contact' ? 'active' : ''}`}
          onClick={() => scrollToSection('contact')}>
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
