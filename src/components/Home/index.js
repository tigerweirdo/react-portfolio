import React, { memo } from 'react';
import { motion } from 'framer-motion';
import Logo from './Logo';
import './index.scss';

const Home = memo(({ scrollToSection }) => {
  const line1Text = "Hey,";
  const line2Text = "I build"; 
  const line3Text = "digital things.";

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: 0.2,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    tap: {
      scale: 0.98,
      transition: {
        duration: 0.1,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  return (
    <div className="container home-page"> 
      <div className="text-zone">
        <motion.h1 
          className="main-headline"
          variants={textVariants}
          initial=\"hidden\"
          animate=\"visible\"
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
          variants={buttonVariants}
          initial=\"hidden\"
          animate=\"visible\"
          whileHover=\"hover\"
          whileTap=\"tap\"
        > 
          CONTACT ME
        </motion.button>
      </div>
      <motion.div 
        className="logo-container"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.6,
          delay: 0.3,
          ease: [0.4, 0, 0.2, 1]
        }}
      > 
        <Logo />
      </motion.div>
    </div>
  );
});

Home.displayName = 'Home';

export default Home;
