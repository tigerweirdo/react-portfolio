import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, useInView, useAnimation } from 'framer-motion'
import emailjs from '@emailjs/browser'
// import AnimatedLetters from '../AnimatedLetters'
import './index.scss'

const Contact = () => {
  // const [letterClass, setLetterClass] = useState('text-animate')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)
  const form = useRef()
  const containerRef = useRef(null)
  const controls = useAnimation()
  const isInView = useInView(containerRef, { once: false, amount: 0.3 })

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [controls, isInView])

  const sendEmail = useCallback(async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      await emailjs.sendForm(
        'service_1di4zfn',
        'template_3xz79lm',
        form.current,
        '3stLvJAm6BvTLpIsx'
      )
      setSubmitStatus('success')
      form.current.reset()
    } catch (error) {
      console.error('Error sending email:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 50 
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 20
      }
    }
  }

  const formVariants = {
    hidden: { 
      opacity: 0, 
      x: -100 
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 50,
        damping: 20,
        staggerChildren: 0.1,
        delayChildren: 0.5
      }
    }
  }

  const inputVariants = {
    hidden: { 
      opacity: 0, 
      x: -50 
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  }

  const renderSubmitButton = () => {
    if (isSubmitting) {
      return (
        <motion.input 
          type="submit" 
          className="flat-button" 
          value="Sending..." 
          disabled
          animate={{ opacity: [1, 0.7, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )
    }
    return (
      <motion.input 
        type="submit" 
        className="flat-button" 
        value="Send"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      />
    )
  }

  const renderStatusMessage = () => {
    if (!submitStatus) return null

    return (
      <motion.div 
        className={`status-message ${submitStatus}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        {submitStatus === 'success' 
          ? 'Your message has been sent successfully!'
          : 'An error occurred while sending the message. Please try again.'}
      </motion.div>
    )
  }

  return (
    <motion.div 
      ref={containerRef}
      className="container contact-page"
      initial="hidden"
      animate={controls}
      variants={containerVariants}
    >
      <div className="text-zone">
        <motion.h1 variants={itemVariants}>
          {/* <AnimatedLetters
            letterClass={letterClass}
            strArray={['C', 'o', 'n', 't', 'a', 'c', 't', ' ', 'm', 'e']}
            idx={15}
          /> */}
          Contact me
        </motion.h1>
        <motion.p variants={itemVariants}>
          I am interested in freelance opportunities - especially on ambitious
          or large projects. However, if you have any other requests or
          questions, don't hesitate to contact me using below form either.
        </motion.p>
        <motion.div 
          className="contact-form"
          variants={formVariants}
        >
          <form ref={form} onSubmit={sendEmail}>
            <ul>
              <motion.li 
                className="half"
                variants={inputVariants}
              >
                <motion.input 
                  placeholder="Name" 
                  type="text" 
                  name="name" 
                  required 
                  disabled={isSubmitting}
                  whileFocus={{ scale: 1.02 }}
                />
              </motion.li>
              <motion.li 
                className="half"
                variants={inputVariants}
              >
                <motion.input
                  placeholder="Email"
                  type="email"
                  name="email"
                  required
                  disabled={isSubmitting}
                  whileFocus={{ scale: 1.02 }}
                />
              </motion.li>
              <motion.li variants={inputVariants}>
                <motion.input
                  placeholder="Subject"
                  type="text"
                  name="subject"
                  required
                  disabled={isSubmitting}
                  whileFocus={{ scale: 1.02 }}
                />
              </motion.li>
              <motion.li variants={inputVariants}>
                <motion.textarea
                  placeholder="Message"
                  name="message"
                  required
                  disabled={isSubmitting}
                  whileFocus={{ scale: 1.02 }}
                ></motion.textarea>
              </motion.li>
              <motion.li variants={inputVariants}>
                {renderSubmitButton()}
              </motion.li>
            </ul>
          </form>
          {renderStatusMessage()}
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Contact