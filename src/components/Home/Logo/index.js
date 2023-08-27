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
  const [loadComponent, setLoadComponent] = useState(false) 

  const handleMouseEnter = () => {
    setKey(prevKey => prevKey + 1); 
  }

  useEffect(() => {
    gsap.registerPlugin(DrawSVGPlugin)

    gsap
      .timeline()
      .to(bgRef.current, {
        duration: 1, // 10 saniyeden 1 saniyeye düşürdük
        opacity: 1,
      })
      .from(outlineLogoRef.current, {
        drawSVG: '0%', // Eksik olan başlangıç değerini ekledik.
        duration: 2, // 1 saniyeden 2 saniyeye çıkardık.
      })

    

    setTimeout(() => { 
      setLoadComponent(true);
    }, 2500);
  }, [])
  

  return (
    <div className="logo-container" ref={bgRef}>
      <img
        className="solid-logo"
        ref={solidLogoRef}
      />
      <div onMouseEnter={handleMouseEnter}>
        {loadComponent && <NewComponent key={key} />} 
      </div>
    </div>
  )
}

export default Logo
