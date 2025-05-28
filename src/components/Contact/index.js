import { useEffect, useState, useCallback, useRef } from 'react'
import emailjs from '@emailjs/browser'
import AnimatedLetters from '../AnimatedLetters'
import './index.scss'
import useScrollAnimation from '../../hooks/useScrollAnimation'

const Contact = () => {
  const [letterClass, setLetterClass] = useState('text-animate')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)
  const form = useRef()

  const pRef = useRef(null)
  const contactFormContainerRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLetterClass('text-animate-hover')
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  useScrollAnimation([pRef, contactFormContainerRef])

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

  const renderSubmitButton = () => {
    if (isSubmitting) {
      return <input type="submit" className="flat-button" value="Sending..." disabled />
    }
    return <input type="submit" className="flat-button" value="Send" />
  }

  const renderStatusMessage = () => {
    if (!submitStatus) return null

    return (
      <div className={`status-message ${submitStatus}`}>
        {submitStatus === 'success' 
          ? 'Your message has been sent successfully!'
          : 'An error occurred while sending the message. Please try again.'}
      </div>
    )
  }

  return (
    <>
      <div className="container contact-page">
        <div className="text-zone">
          <h1>
            <AnimatedLetters
              letterClass={letterClass}
              strArray={['C', 'o', 'n', 't', 'a', 'c', 't', ' ', 'm', 'e']}
              idx={15}
            />
          </h1>
          <p ref={pRef} className="scroll-animate">
            I am interested in freelance opportunities - especially on ambitious
            or large projects. However, if you have any other requests or
            questions, don't hesitate to contact me using below form either.
          </p>
          <div ref={contactFormContainerRef} className="contact-form scroll-animate-from-left">
            <form ref={form} onSubmit={sendEmail}>
              <ul>
                <li className="half">
                  <input 
                    placeholder="Name" 
                    type="text" 
                    name="name" 
                    required 
                    disabled={isSubmitting}
                  />
                </li>
                <li className="half">
                  <input
                    placeholder="Email"
                    type="email"
                    name="email"
                    required
                    disabled={isSubmitting}
                  />
                </li>
                <li>
                  <input
                    placeholder="Subject"
                    type="text"
                    name="subject"
                    required
                    disabled={isSubmitting}
                  />
                </li>
                <li>
                  <textarea
                    placeholder="Message"
                    name="message"
                    required
                    disabled={isSubmitting}
                  ></textarea>
                </li>
                <li>
                  {renderSubmitButton()}
                </li>
              </ul>
            </form>
            {renderStatusMessage()}
          </div>
        </div>
      </div>
    </>
  )
}

export default Contact