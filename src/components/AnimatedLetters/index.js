import React, { memo, useMemo } from 'react'
import PropTypes from 'prop-types'
import './index.scss'

const AnimatedLetters = memo(({ letterClass, strArray, idx, additionalClass = '' }) => {
  const letters = useMemo(() => {
    return strArray.map((char, i) => (
      <span 
        key={`${char}-${i}-${idx}`} 
        className={`${letterClass} _${i + idx} ${additionalClass}`}
      >
        {char}
      </span>
    ))
  }, [strArray, letterClass, idx, additionalClass])

  return <span>{letters}</span>
})

AnimatedLetters.propTypes = {
  letterClass: PropTypes.string.isRequired,
  strArray: PropTypes.arrayOf(PropTypes.string).isRequired,
  idx: PropTypes.number.isRequired,
  additionalClass: PropTypes.string
}

export default AnimatedLetters