import { useEffect, useState } from 'react';
import AnimatedLetters from '../AnimatedLetters';
import Logo from './Logo';
import './index.scss';

const Home = () => {
  const [letterClass, setLetterClass] = useState('text-animate');

  const nameArray = ['  ', 't', 'e', 'm', 'm', 'u', 'z'];
  const playingArray = [..."creating"];
  const webStuffArray = [..."digital experiences"];

  useEffect(() => {
    return setTimeout(() => {
      setLetterClass('text-animate-hover');
    }, 10000);
  }, []);

  const scrollToContact = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      const yOffset = -80; // Header yüksekliği kadar offset
      const y = contactSection.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      <div className="container home-page">
        <div className="text-zone">
          <h1>
            <span className={letterClass}>H</span>
            <span className={`${letterClass} _12`}>e</span>
            <span className={`${letterClass} _13`}>y</span>
            <span className={`${letterClass} _14`}>,</span>
            <br />
            <span className={`${letterClass} _15`}>I</span>
            <span className={`${letterClass} _16`}> </span>
            <span className={`${letterClass} _17`}>a</span>
            <span className={`${letterClass} _18`}>m</span>
            <AnimatedLetters
              letterClass={letterClass}
              strArray={nameArray}
              idx={19}
            />
            <br />
            <AnimatedLetters
              letterClass={letterClass}
              strArray={playingArray}
              idx={20 + nameArray.length}
              additionalClass="smaller-text"
            />
            <br />
            <AnimatedLetters
              letterClass={letterClass}
              strArray={webStuffArray}
              idx={20 + nameArray.length + playingArray.length}
              additionalClass="smaller-text"
            />
          </h1>
          <h2>Full Stack Developer / AI Enthusiast</h2>
          <button onClick={scrollToContact} className="flat-button">
            CONTACT ME
          </button>
        </div>
        <Logo />
      </div>
    </>
  );
}

export default Home;
