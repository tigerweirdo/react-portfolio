import { useEffect, useRef, memo } from 'react'
import { motion, useInView, useAnimation, useScroll, useTransform } from 'framer-motion'
import './index.scss';

const About = memo(() => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const textVariants = {
    hidden: { 
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.4
      }
    }
  };

  const robotVariants = {
    hidden: { 
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <motion.div 
      ref={ref}
      className="container about-page"
      initial="hidden"
      animate={controls}
      variants={containerVariants}
      style={{ opacity }}
    >
      <motion.div 
        className="robot123"
        variants={robotVariants}
        whileHover={{ 
          scale: 1.03,
          transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
        }}
        style={{ y }}
      >
        <svg className="Rolly" width="295" height="305" viewBox="0 0 295 305" fill="none" xmlns="http://www.w3.org/2000/svg">
          <motion.circle 
            cx="163" 
            cy="257" 
            r="46" 
            fill="url(#paint1_radial)"
            animate={{
              scale: [1, 1.05, 1],
              transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          />
          <g style={{ mixBlendMode: "multiply" }}>
            <path d="M209 257C209 282.405 188.405 244 163 244C137.595 244 117 282.405 117 257C117 231.595 137.595 211 163 211C188.405 211 209 231.595 209 257Z" fill="#959595" fillOpacity="0.44" />
          </g>
          <path d="M123.532 238.755C100.704 250.525 75.7475 229.396 85.1908 205.595C99.9698 168.346 120.218 125.189 140.829 105.773C142.606 104.098 144.353 103.943 146.078 104.671C157.605 109.537 161.683 106.894 172.185 100.175C177.683 96.6586 181.653 105.13 186.747 110.857C208.916 135.782 226.213 178.887 237.616 214.088C245.032 236.982 221.688 255.794 199.886 245.381L166.67 229.518C158.426 225.58 148.814 225.72 140.718 229.894L123.532 238.755Z" fill="url(#paint2_linear)" />
          <g style={{mixBlendMode:"color-burn"}}>
            <path d="M203.5 134.5C203.5 148.031 182.405 167 157 167C131.595 167 119.5 149.031 119.5 135.5C119.5 121.969 129.595 141.5 155 141.5C180.405 141.5 203.5 120.969 203.5 134.5Z" fill="url(#paint3_linear)" />
          </g>
          <path d="M238.5 36.6285V95.498C238.5 107.654 231.043 118.566 219.717 122.982L170.217 142.284C163.325 144.972 155.675 144.972 148.783 142.284L99.2828 122.982C87.957 118.566 80.5 107.654 80.5 95.498V36.6285C80.5 21.69 91.6668 9.10942 106.5 7.33692L156 1.42183C158.325 1.14397 160.675 1.14397 163 1.42183L212.5 7.33692C227.333 9.10942 238.5 21.69 238.5 36.6285Z" fill="white" stroke="#AAAAAA" />
          <g style={{mixBlendMode:"multiply"}}>
            <path d="M99.1556 10.8317C100.648 8.71035 102.969 7.3196 105.544 7.00343L154.974 0.933026C157.316 0.645347 159.685 0.635104 162.03 0.902508L211.899 6.58937C214.199 6.8516 216.29 8.04444 217.687 9.89L218.171 10.5302C223.418 17.4639 215.78 26.7582 207.961 22.9542V22.9542C206.676 22.3288 205.25 22.0474 203.823 22.1375L158.5 25L118.536 22.179C116.871 22.0615 115.203 22.3556 113.678 23.0354L110.401 24.497C101.888 28.2932 93.7919 18.4543 99.1556 10.8317V10.8317Z" fill="url(#paint4_linear)" />
          </g>
          <path d="M94 53.1441C94 35.705 108.818 21.941 126.21 23.2257L154.871 25.3428C156.289 25.4475 157.712 25.4513 159.13 25.3543L192.952 23.0397C210.286 21.8534 225 35.5948 225 52.9696V87.9124C225 100.266 217.428 111.356 205.922 115.853L170.422 129.73C163.399 132.476 155.601 132.476 148.578 129.73L113.078 115.853C101.572 111.356 94 100.266 94 87.9124V53.1441Z" fill="url(#paint5_linear)" />
          <path d="M224.902 77C227 104.5 214.947 109.954 199.5 119.826C187 125 174.805 131 159.902 131C144.999 131 132 123 120.303 119.826C104.856 109.954 92.0005 107.5 94.9018 77C94.9018 47.1766 123.102 26.5 159 26.5C194.899 26.5 224.902 47.1766 224.902 77Z" fill="#E6E6E6" />
          <motion.ellipse 
            className="eyes" 
            cx="130.5" 
            cy="70.5" 
            rx="5.5" 
            ry="11.5" 
            fill="black"
            animate={{
              scaleY: [1, 0.1, 1],
              transition: {
                duration: 0.3,
                repeat: Infinity,
                repeatDelay: 3,
                times: [0, 0.5, 1]
              }
            }}
          />
          <motion.ellipse 
            className="eyes" 
            cx="186.5" 
            cy="70.5" 
            rx="5.5" 
            ry="11.5" 
            fill="black"
            animate={{
              scaleY: [1, 0.1, 1],
              transition: {
                duration: 0.3,
                repeat: Infinity,
                repeatDelay: 3,
                times: [0, 0.5, 1]
              }
            }}
          />
          <defs>
            <radialGradient id="paint1_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(163 257) rotate(90) scale(46)">
              <stop stopColor="#AEAEAE" />
              <stop offset="1" stopColor="#7F7F7F" />
            </radialGradient>
            <linearGradient id="paint2_linear" x1="163.876" y1="224.41" x2="160.788" y2="109.555" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4CAF50" />
              <stop offset="1" stopColor="#F7A04D" />
            </linearGradient>
            <linearGradient id="paint3_linear" x1="161.5" y1="129.885" x2="161.5" y2="167" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F7A04D" />
              <stop offset="0.927101" stopColor="#7F7F7F" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="paint4_linear" x1="159.5" y1="1" x2="159.5" y2="48" gradientUnits="userSpaceOnUse">
              <stop stopColor="#E8E8E8" />
              <stop offset="1" stopColor="white" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="paint5_linear" x1="159.5" y1="42" x2="159.5" y2="134" gradientUnits="userSpaceOnUse">
              <stop stopColor="#D2D3D9" />
              <stop offset="1" stopColor="#F7A04D" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
        <svg className="Shaddow" width="295" height="12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="166.5" cy="6" rx="113.5" ry="12" fill="url(#paint0_radial)" />
          <defs>
            <radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(166.5 6) rotate(90) scale(12 88.3351)">
              <stop offset="0.161445" stopColor="#3B3B3B" />
              <stop offset="0.587964" stopColor="#7C7C7C" stopOpacity="0.522476" />
              <stop offset="1" stopColor="#C4C4C4" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </motion.div>

      <motion.div 
        className="text-zone"
        variants={containerVariants}
      >
        <motion.h1 variants={textVariants}>
          ABOUT ME
        </motion.h1>
        <motion.p variants={textVariants}>
          I'm a full-stack developer, but I don't just write code. I enjoy exploring new technologies and trying out different approaches. That's why I use my personal website as a testing ground. Whenever I learn something new, I try it out here — sometimes it works, sometimes I start over — but I always learn something.
        </motion.p>
        <motion.p variants={textVariants} align="LEFT">
          I have a particular interest in AI. In my spare time, I build small projects in this area. I'm not an expert yet, but I'm constantly learning and improving.
        </motion.p>
        <motion.p variants={textVariants}>
          This site is a personal space where I share what I've learned and experiment with new ideas. Hopefully, it'll be useful to others too.
        </motion.p>
      </motion.div>
    </motion.div>
  )
});

export default About