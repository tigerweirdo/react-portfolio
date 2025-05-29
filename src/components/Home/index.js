import React from 'react';
// import { Parallax } from 'react-scroll-parallax'; // Kaldırıldı
// import AnimatedLetters from '../AnimatedLetters'; // AnimatedLetters kaldırıldı
import Logo from './Logo';
import './index.scss';
// import useScrollAnimation from '../../hooks/useScrollAnimation'; // Bu hook'u şimdilik kaldırıyorum, gerekirse tekrar eklenir.
// import { FaArrowRight } from 'react-icons/fa'; // İkonlu buton yerine orijinal stile dönüyoruz

const Home = ({ scrollToSection }) => {
  // const [letterClass, setLetterClass] = useState('text-animate'); // letterClass state'i kaldırıldı

  const line1Text = "Hey,";
  const line2Text = "I build"; 
  const line3Text = "digital things.";

  // const h2Ref = useRef(null); // Scroll animasyonları kaldırıldığı için ref'ler de kaldırılabilir
  // const buttonRef = useRef(null);
  // const logoContainerRef = useRef(null);

  // letterClass ile ilgili useEffect kaldırıldı
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setLetterClass('text-animate-hover');
  //   }, 3000); 
  //   return () => clearTimeout(timer);
  // }, []);

  // useScrollAnimation([h2Ref, buttonRef, logoContainerRef]); // Şimdilik kaldırıldı

  return (
    // <Parallax speed={-10} className="container home-page"> // Kaldırıldı
    <div className="container home-page"> 
      <div className="text-zone">
        <h1 className="main-headline"> 
          {/* AnimatedLetters yerine doğrudan metinler */}
          {line1Text}
          <br />
          {line2Text}
          <br />
          {line3Text}
        </h1>
        <h2 className="sub-headline"> 
          Full Stack Developer / AI Enthusiast
        </h2>
        <button onClick={() => scrollToSection('contact')} className="flat-button"> 
          CONTACT ME
        </button>
      </div>
      {/* <Parallax speed={20} className="logo-container"> */}{/* Kaldırıldı */}
      <div className="logo-container"> 
        <Logo />
      </div>
      {/* </Parallax> */}{/* Kaldırıldı */}
    {/* </Parallax> */}{/* Kaldırıldı */}
    </div>
  );
}

export default Home;
