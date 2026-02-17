import React, { useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.scss';
import imagePath from '../../../assets/images/1.png';

const SECRET_CLICK_COUNT = 5;
const SECRET_CLICK_TIMEOUT = 2000; // 2 saniye içinde 5 tıklama
const ADMIN_SLUG = process.env.REACT_APP_ADMIN_SLUG || 'p-x7k9';

const Logo = () => {
  const navigate = useNavigate();
  const clickCountRef = useRef(0);
  const lastClickTimeRef = useRef(0);

  const handleSecretClick = useCallback(() => {
    const now = Date.now();

    // 2 saniyeden fazla geçtiyse sayacı sıfırla
    if (now - lastClickTimeRef.current > SECRET_CLICK_TIMEOUT) {
      clickCountRef.current = 0;
    }

    lastClickTimeRef.current = now;
    clickCountRef.current += 1;

    if (clickCountRef.current >= SECRET_CLICK_COUNT) {
      clickCountRef.current = 0;
      navigate(`/${ADMIN_SLUG}`);
    }
  }, [navigate]);

  return (
    <div className="logo-container" onClick={handleSecretClick}>
      <img src={imagePath} alt="Dynamic" />
    </div>
  );
}

export default Logo;
