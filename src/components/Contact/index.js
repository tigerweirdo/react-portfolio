import { useEffect, useState, useCallback, useRef, memo } from 'react'
import { motion, useInView, useAnimation } from 'framer-motion'
import emailjs from '@emailjs/browser'
import './index.scss'

const Contact = memo(() => {
  // const [letterClass, setLetterClass] = useState('text-animate')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)
  const form = useRef()
  const containerRef = useRef(null)
  const controls = useAnimation()
  const isInView = useInView(containerRef, { once: false, amount: 0.3 })

  // EmailJS'i initialize et (localhost ve production için)
  useEffect(() => {
    emailjs.init('3stLvJAm6BvTLpIsx')
  }, [])

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
      console.log('[Contact] Form gönderiliyor...', {
        serviceId: 'service_1di4zfn',
        templateId: 'template_3xz79lm',
        formData: form.current
      })

      const result = await emailjs.sendForm(
        'service_1di4zfn',
        'template_3xz79lm',
        form.current,
        '3stLvJAm6BvTLpIsx'
      )
      
      console.log('[Contact] E-posta başarıyla gönderildi:', result)
      setSubmitStatus('success')
      form.current.reset()
      
      // Başarı mesajını 3 saniye sonra kaybet
      setTimeout(() => {
        setSubmitStatus(null)
      }, 3000)
    } catch (error) {
      console.error('[Contact] E-posta gönderme hatası:', error)
      console.error('[Contact] Hata detayları:', {
        status: error.status,
        text: error.text,
        message: error.message
      })
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
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30 
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  }

  const formVariants = {
    hidden: { 
      opacity: 0, 
      x: -50 
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
        staggerChildren: 0.08,
        delayChildren: 0.3
      }
    }
  }

  const inputVariants = {
    hidden: { 
      opacity: 0, 
      x: -30 
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1]
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
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        />
      )
    }
    return (
      <motion.input 
        type="submit" 
        className="flat-button" 
        value="Send"
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98, y: 0 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      />
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
              {/* Gizli input: Alıcı e-posta adresi */}
              <input
                type="hidden"
                name="to_email"
                value="temmuzcetiner@gmail.com"
              />
              <motion.li variants={inputVariants}>
                {renderSubmitButton()}
              </motion.li>
              <motion.li 
                variants={inputVariants} 
                style={{ 
                  height: '60px', 
                  display: 'flex', 
                  alignItems: 'flex-start',
                  marginBottom: '15px'
                }}
              >
                {renderStatusMessage()}
              </motion.li>
            </ul>
          </form>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Contact