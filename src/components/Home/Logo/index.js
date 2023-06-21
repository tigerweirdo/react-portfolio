import { useEffect, useRef } from 'react'
import gsap from 'gsap-trial'
import DrawSVGPlugin from 'gsap-trial/DrawSVGPlugin'
import LogoS from '../../../assets/images/logo-s.png'
import './index.scss'

const Logo = () => {
  const bgRef = useRef()
  const outlineLogoRef = useRef()
  const solidLogoRef = useRef()

  useEffect(() => {
    gsap.registerPlugin(DrawSVGPlugin)

    gsap
      .timeline()
      .to(bgRef.current, {
        duration: 1,
        opacity: 1,
      })
      .from(outlineLogoRef.current, {
        drawSVG: 10,
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
  }, [])

  return (
    <div className="logo-container" ref={bgRef}>
      <img
        className="solid-logo"
        ref={solidLogoRef}
        src={LogoS}
        alt="JavaScript,  Developer"
      />

          <svg
    width="428"
    height="595"
    version="1.0"
    viewBox="-23 -4 456 320"
    xmlns="http://www.w3.org/2000/svg"
> 
        <g
          className="svg-container"
          transform="translate(0 457) scale(.1 -.1)"
          fill="none"
        >
          <path
            ref={outlineLogoRef}
            d="M57 5873 c-4 -3 -7 -145 -7 -315 l0 -308 2025 0 2025 0 -2 313 -3 312 -2016 3 c-1109 1 -2019 -1 -2022 -5z M668 5092 l-618 -2 0 -310 0 -310 630 0 630 0 0 309 c0 239 -3 310 -12 312 -7 2 -291 3 -630 1z M1464 5091 c-2 -2 -4 -1129 -4 -2503 l0 -2498 310 2 310 3 3 2185 2 2185 1002 5 1002 5 4 308 4 307 -1101 2 c-606 1 -1197 2 -1314 3 -117 0 -215 -2 -218 -4z M2240 2195 l0 -2105 315 0 315 0 0 2105 0 2105 -315 0 -315 0 0 -2105z"
          />
        </g>
      </svg>
    </div>
  )
}

export default Logo
