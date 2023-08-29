import React, { useRef, useState } from 'react'
import './index.scss'
import NewComponent from './sign'

const Logo = () => {
  const bgRef = useRef()
  const [key, setKey] = useState(0)
  const [loadComponent, setLoadComponent] = useState(false) 

  const handleMouseEnter = () => {
    setKey(prevKey => prevKey + 1); 
  }

  // Resmi göstermek için animasyon gereksiz olduğundan bu useEffect'i kaldırabiliriz.
  // Eğer başka bir işlem yapmak isterseniz bu useEffect içerisinde yapabilirsiniz.
  
  setTimeout(() => { 
    setLoadComponent(true);
  }, 2500);

  return (
    <div className="logo-container" ref={bgRef}>
      
      <div onMouseEnter={handleMouseEnter}>
        {loadComponent && <NewComponent key={key} />} 
      </div>
    </div>
  )
}

export default Logo
