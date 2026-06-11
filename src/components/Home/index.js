import React, { memo } from 'react';
import { motion } from 'framer-motion';
import Logo from './Logo';
import './index.scss';

const Home = memo(({ scrollToSection }) => {
  const line1Text = "Hey,";
  const line2Text = "I build"; 
  const line3Text = "digital things.";

  return (
    <div className="container home-page"> 
      <div className="text-zone">
        <motion.h1 
          className="main-headline"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        > 
          {line1Text}
          <br />
          {line2Text}
          <br />
          {line3Text}
        </motion.h1>
        <motion.button 
          onClick={() => scrollToSection('contact')} 
          className="flat-button"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        > 
          CONTACT ME
        </motion.button>
      </div>
      <motion.div 
        className="logo-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      > 
        <Logo />
      </motion.div>
    </div>
  );
});

export default Home;
