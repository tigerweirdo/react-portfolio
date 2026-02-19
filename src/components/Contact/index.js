import { useEffect, useState, useCallback, useRef, memo } from 'react'
import { motion, useInView, useAnimation } from 'framer-motion'
import emailjs from '@emailjs/browser'
import LiquidWave from './LiquidWave'
import './index.scss'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 }
  }
}

const formVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      staggerChildren: 0.05,
      delayChildren: 0.2
    }
  }
}

const inputVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 }
  }
}

const GlassWrap = ({ children, className = '' }) => (
  <div className={`glass-wrap ${className}`}>
    <div className="glass-filter" />
    <div className="glass-overlay" />
    <div className="glass-specular" />
    <div className="glass-content">
      {children}
    </div>
  </div>
)

const Contact = memo(() => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)
  const form = useRef()
  const containerRef = useRef(null)
  const controls = useAnimation()
  const isInView = useInView(containerRef, { once: false, amount: 0.3 })

  useEffect(() => {
    emailjs.init('3stLvJAm6BvTLpIsx')
  }, [])

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
      document.body.style.backgroundColor = '#002fa7' // Liquid wave bottom color
    } else {
      document.body.style.backgroundColor = '#ffffff' // Default background
    }

    return () => {
      document.body.style.backgroundColor = '#ffffff'
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

      setTimeout(() => {
        setSubmitStatus(null)
      }, 3000)
    } catch (error) {
      console.error('[Contact] E-posta gönderme hatası:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const renderSubmitButton = () => {
    if (isSubmitting) {
      return (
        <motion.button
          type="submit"
          className="flat-button"
          disabled
          animate={{ opacity: [1, 0.7, 1] }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="btn-text">Sending...</span>
          <span className="btn-spinner" />
        </motion.button>
      )
    }
    return (
      <motion.button
        type="submit"
        className="flat-button"
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        Send
      </motion.button>
    )
  }

  const renderStatusMessage = () => {
    return (
      <motion.div
        className={`status-message ${submitStatus || ''}`}
        initial={false}
        animate={{
          opacity: submitStatus ? 1 : 0,
          y: submitStatus ? 0 : -10
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut"
        }}
        style={{
          pointerEvents: submitStatus ? 'auto' : 'none'
        }}
      >
        {submitStatus === 'success'
          ? 'Your message has been sent successfully!'
          : submitStatus === 'error'
          ? 'An error occurred while sending the message. Please try again.'
          : '\u00A0'}
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
                <GlassWrap>
                  <input
                    placeholder="Name"
                    type="text"
                    name="name"
                    required
                    disabled={isSubmitting}
                  />
                </GlassWrap>
              </motion.li>
              <motion.li
                className="half"
                variants={inputVariants}
              >
                <GlassWrap>
                  <input
                    placeholder="Email"
                    type="email"
                    name="email"
                    required
                    disabled={isSubmitting}
                  />
                </GlassWrap>
              </motion.li>
              <motion.li variants={inputVariants}>
                <GlassWrap>
                  <input
                    placeholder="Subject"
                    type="text"
                    name="subject"
                    required
                    disabled={isSubmitting}
                  />
                </GlassWrap>
              </motion.li>
              <motion.li variants={inputVariants}>
                <GlassWrap>
                  <textarea
                    placeholder="Message"
                    name="message"
                    required
                    disabled={isSubmitting}
                  />
                </GlassWrap>
              </motion.li>
              <input
                type="hidden"
                name="to_email"
                value="temmuzcetiner@gmail.com"
              />
              <motion.li variants={inputVariants} className="submit-row">
                <GlassWrap className="glass-wrap--btn">
                  {renderSubmitButton()}
                </GlassWrap>
                {renderStatusMessage()}
              </motion.li>
            </ul>
          </form>
        </motion.div>
      </div>

      <svg xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
        <filter id="glassLens" x="0%" y="0%" width="100%" height="100%" filterUnits="objectBoundingBox">
          <feComponentTransfer in="SourceAlpha" result="alpha">
            <feFuncA type="identity" />
          </feComponentTransfer>
          <feGaussianBlur in="alpha" stdDeviation="50" result="blur" />
          <feDisplacementMap in="SourceGraphic" in2="blur" scale="50" xChannelSelector="A" yChannelSelector="A" />
        </filter>
      </svg>

      <LiquidWave />
    </motion.div>
  )
});

export default Contact
