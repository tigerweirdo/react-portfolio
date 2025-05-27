import { useEffect, useState } from 'react';
// import AnimatedLetters from '../AnimatedLetters'; // AnimatedLetters kaldırıldı
import Logo from './Logo';
import './index.scss';
// import useScrollAnimation from '../../hooks/useScrollAnimation'; // Bu hook'u şimdilik kaldırıyorum, gerekirse tekrar eklenir.
// import { FaArrowRight } from 'react-icons/fa'; // İkonlu buton yerine orijinal stile dönüyoruz

const Home = () => {
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

  const scrollToContact = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      const yOffset = -80; 
      const y = contactSection.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });
    }
  };

  return (
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
        <button onClick={scrollToContact} className="flat-button"> 
          CONTACT ME
        </button>
      </div>
      <div className="logo-container"> 
        <Logo />
      </div>
    </div>
  );
}

export default Home;
