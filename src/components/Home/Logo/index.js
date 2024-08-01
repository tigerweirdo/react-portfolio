import React from 'react';
import './index.scss';
import imagePath from '../../../assets/images/1.png'; // Resim yolunu doğru şekilde ayarlayın

const Logo = () => {
  return (
    <div className="logo-container">
      <img src={imagePath} alt="Dynamic" />
    </div>
  );
}

export default Logo;
