import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AnimatedLetters from '../AnimatedLetters';
import Logo from './Logo';
import './index.scss';

const Home = () => {
  const [letterClass, setLetterClass] = useState('text-animate');

  const hiArray = ['H', 'i', ','];
  const iAmArray = ['I', ' ', 'a', 'm'];
  const nameArray = ['T', 'e', 'm', 'm', 'u', 'z'];
  const jobTitleArray = ['F', 'u', 'l', 'l', ' ', 'S', 't', 'a', 'c', 'k', ' ', 'D', 'e', 'v', 'e', 'l', 'o', 'p', 'e', 'r'];

  useEffect(() => {
    const timer = setTimeout(() => {
      setLetterClass('text-animate-hover');
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <div className="container home-page">
        <div className="text-zone">
          <h1>
            <AnimatedLetters
              letterClass={letterClass}
              strArray={hiArray}
              idx={1}
            />
            <br />
            <AnimatedLetters
              letterClass={letterClass}
              strArray={iAmArray}
              idx={4}
            />
            <AnimatedLetters
              letterClass={letterClass}
              strArray={nameArray}
              idx={8}
            />
            <br />
            <AnimatedLetters
              letterClass={letterClass}
              strArray={jobTitleArray}
              idx={14}
              additionalClass="smaller-text"
            />
          </h1>
          <h2>Yazılım Geliştirici / AI Meraklısı / Teknoloji Tutkunu</h2>
          <Link to="/contact" className="flat-button">
            İLETİŞİME GEÇ
          </Link>
        </div>
        <Logo />
      </div>
    </>
  );
}

export default Home;
