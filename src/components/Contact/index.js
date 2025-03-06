import { useEffect, useState, useCallback } from 'react'
import { useRef } from 'react'
import emailjs from '@emailjs/browser'
import AnimatedLetters from '../AnimatedLetters'
import './index.scss'

const Contact = () => {
  const [letterClass, setLetterClass] = useState('text-animate')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)
  const form = useRef()

  useEffect(() => {
    const timer = setTimeout(() => {
      setLetterClass('text-animate-hover')
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const sendEmail = useCallback(async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      await emailjs.sendForm(
        'service_u9kudbr',
        'template_3xz79lm',
        form.current,
        '3stLvJAm6BvTLpIsx'
      )
      setSubmitStatus('success')
      form.current.reset()
    } catch (error) {
      console.error('Email gönderilirken hata oluştu:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const renderSubmitButton = () => {
    if (isSubmitting) {
      return <input type="submit" className="flat-button" value="Gönderiliyor..." disabled />
    }
    return <input type="submit" className="flat-button" value="Gönder" />
  }

  const renderStatusMessage = () => {
    if (!submitStatus) return null

    return (
      <div className={`status-message ${submitStatus}`}>
        {submitStatus === 'success' 
          ? 'Mesajınız başarıyla gönderildi!'
          : 'Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.'}
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
          <p>
            I am interested in freelance opportunities - especially on ambitious
            or large projects. However, if you have any other requests or
            questions, don't hesitate to contact me using below form either.
          </p>
          <div className="contact-form">
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