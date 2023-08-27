import { useEffect, useState } from 'react'
import AnimatedLetters from '../AnimatedLetters'
import './index.scss';
  
const About = () => {
  const [letterClass, setLetterClass] = useState('text-animate')

  useEffect(() => {
    return setTimeout(() => {
      setLetterClass('text-animate-hover')
    }, 3000)
  }, [])

  return (
    <>
      <div className="container about-page">
        <div className="text-zone">
          <h1>
            <AnimatedLetters
              letterClass={letterClass}
              strArray={['A', 'b', 'o', 'u', 't', ' ', 'm', 'e']}
              idx={15}
            />
          </h1>
          <p>
          I'm a full-stack developer on the hunt for a gig at a top-notch, 
          kick-ass IT company where I can dive into thrilling and mind-bending projects, 
          while rubbing shoulders with the brightest minds in the industry.
           I'm craving to be a part of a dynamic and multidisciplinary team that thrives on cutting-edge technologies,
            pushing boundaries, and turning dreams into digital realities
          </p>
          <p align="LEFT">
          I'm like a detective, constantly honing my skills and tackling development challenges with gusto,
           never shying away from a chance to level up my expertise.
           I'm a problem-solving virtuoso, always striving to elevate my game.
          </p>
          <p>
          I'm a tech trend enthusiast, and when it comes to robotics and artificial intelligence,
           my curiosity reaches a level of obsession that borders on being downright geeky!
          </p>
        </div>
        <div className="robot123">
                <svg className="Rolly" width="295" height="305" viewBox="0 0 295 305" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="163" cy="257" r="46" fill="url(#paint1_radial)" />
    <g style={{ mixBlendMode: "multiply" }}>
              <path d="M209 257C209 282.405 188.405 244 163 244C137.595 244 117 282.405 117 257C117 231.595 137.595 211 163 211C188.405 211 209 231.595 209 257Z" fill="#959595" fill-opacity="0.44" />
    </g>
    <path d="M123.532 238.755C100.704 250.525 75.7475 229.396 85.1908 205.595C99.9698 168.346 120.218 125.189 140.829 105.773C142.606 104.098 144.353 103.943 146.078 104.671C157.605 109.537 161.683 106.894 172.185 100.175C177.683 96.6586 181.653 105.13 186.747 110.857C208.916 135.782 226.213 178.887 237.616 214.088C245.032 236.982 221.688 255.794 199.886 245.381L166.67 229.518C158.426 225.58 148.814 225.72 140.718 229.894L123.532 238.755Z" fill="url(#paint2_linear)" />
    <g style= {{mixBlendMode:"color-burn"}}>
      <path d="M203.5 134.5C203.5 148.031 182.405 167 157 167C131.595 167 119.5 149.031 119.5 135.5C119.5 121.969 129.595 141.5 155 141.5C180.405 141.5 203.5 120.969 203.5 134.5Z" fill="url(#paint3_linear)" />
    </g>
    <path d="M238.5 36.6285V95.498C238.5 107.654 231.043 118.566 219.717 122.982L170.217 142.284C163.325 144.972 155.675 144.972 148.783 142.284L99.2828 122.982C87.957 118.566 80.5 107.654 80.5 95.498V36.6285C80.5 21.69 91.6668 9.10942 106.5 7.33692L156 1.42183C158.325 1.14397 160.675 1.14397 163 1.42183L212.5 7.33692C227.333 9.10942 238.5 21.69 238.5 36.6285Z" fill="white" stroke="#AAAAAA" />
    <g style= {{mixBlendMode:"multiply"}}>
      <path d="M99.1556 10.8317C100.648 8.71035 102.969 7.3196 105.544 7.00343L154.974 0.933026C157.316 0.645347 159.685 0.635104 162.03 0.902508L211.899 6.58937C214.199 6.8516 216.29 8.04444 217.687 9.89L218.171 10.5302C223.418 17.4639 215.78 26.7582 207.961 22.9542V22.9542C206.676 22.3288 205.25 22.0474 203.823 22.1375L158.5 25L118.536 22.179C116.871 22.0615 115.203 22.3556 113.678 23.0354L110.401 24.497C101.888 28.2932 93.7919 18.4543 99.1556 10.8317V10.8317Z" fill="url(#paint4_linear)" />
    </g>
    <path d="M94 53.1441C94 35.705 108.818 21.941 126.21 23.2257L154.871 25.3428C156.289 25.4475 157.712 25.4513 159.13 25.3543L192.952 23.0397C210.286 21.8534 225 35.5948 225 52.9696V87.9124C225 100.266 217.428 111.356 205.922 115.853L170.422 129.73C163.399 132.476 155.601 132.476 148.578 129.73L113.078 115.853C101.572 111.356 94 100.266 94 87.9124V53.1441Z" fill="url(#paint5_linear)" />
    <path d="M224.902 77C227 104.5 214.947 109.954 199.5 119.826C187 125 174.805 131 159.902 131C144.999 131 132 123 120.303 119.826C104.856 109.954 92.0005 107.5 94.9018 77C94.9018 47.1766 123.102 26.5 159 26.5C194.899 26.5 224.902 47.1766 224.902 77Z" fill="#E6E6E6" />
    <ellipse class="eyes" cx="130.5" cy="70.5" rx="5.5" ry="11.5" fill="black" />
    <ellipse class="eyes" cx="186.5" cy="70.5" rx="5.5" ry="11.5" fill="black" />
    <defs>
      <radialGradient id="paint1_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(163 257) rotate(90) scale(46)">
        <stop stop-color="#AEAEAE" />
        <stop offset="1" stop-color="#7F7F7F" />
          </radialGradient>
      <linearGradient id="paint2_linear" x1="163.876" y1="224.41" x2="160.788" y2="109.555" gradientUnits="userSpaceOnUse">
        <stop stop-color="#0e8543" />
        <stop offset="1" stop-color="#F7A04D" />
      </linearGradient>
      <linearGradient id="paint3_linear" x1="161.5" y1="129.885" x2="161.5" y2="167" gradientUnits="userSpaceOnUse">
        <stop stop-color="#F7A04D" />
        <stop offset="0.927101" stop-color="#7F7F7F" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="paint4_linear" x1="159.5" y1="1" x2="159.5" y2="48" gradientUnits="userSpaceOnUse">
        <stop stop-color="#E8E8E8" />
        <stop offset="1" stop-color="white" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="paint5_linear" x1="159.5" y1="42" x2="159.5" y2="134" gradientUnits="userSpaceOnUse">
        <stop stop-color="#D2D3D9" />
        <stop offset="1" stop-color="#F7A04D" stop-opacity="0" />
      </linearGradient>
    </defs>
        </svg>
  <svg className="Shaddow" width="295" height="12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="166.5" cy="6" rx="113.5" ry="12" fill="url(#paint0_radial)" />
    <defs>
      <radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(166.5 6) rotate(90) scale(12 88.3351)">
        <stop offset="0.161445" stop-color="#3B3B3B" />
        <stop offset="0.587964" stop-color="#7C7C7C" stop-opacity="0.522476" />
        <stop offset="1" stop-color="#C4C4C4" stop-opacity="0" />
      </radialGradient>
    </defs>
  </svg>
            </div>
       
      </div>
      

    </>
  )
}

export default About