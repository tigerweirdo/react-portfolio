import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap-trial'
import DrawSVGPlugin from 'gsap-trial/DrawSVGPlugin'
import './index.scss'
import NewComponent from './sign'

const Logo = () => {
  const bgRef = useRef()
  const outlineLogoRef = useRef()
  const solidLogoRef = useRef()
  const [key, setKey] = useState(0)
  const [loadComponent, setLoadComponent] = useState(false) // Yeni durumu ekledik.

  const handleMouseEnter = () => {
    setKey(prevKey => prevKey + 1); // Mouse üzerine gelindiğinde anahtarı artır
  }

  useEffect(() => {
    gsap.registerPlugin(DrawSVGPlugin)

    gsap
      .timeline()
      .to(bgRef.current, {
        duration: 1,
        opacity: 1,
      })
      .from(outlineLogoRef.current, {
        drawSVG: 1,
        duration: 15,
      })

    gsap.fromTo(
      solidLogoRef.current,
      {
        opacity: 0,
      },
      {
        opacity: 1,
        delay: 5,
        duration: 4,
      }
    )
    setTimeout(() => { // Yeni bileşeni yükle
      setLoadComponent(true);
    }, 1000); // Burada 1 saniye gecikme ekliyoruz
  }, [])
  

  return (
    <div className="logo-container" ref={bgRef}>
      <img
        className="solid-logo"
        ref={solidLogoRef}
      />
      <div onMouseEnter={handleMouseEnter}>
        {loadComponent && <NewComponent key={key} />} {/* Yüklemeyi burada kontrol ediyoruz */}
      </div>
    </div>
  )
}

export default Logo
