import React, { useState } from 'react';
import './Login.scss';
import { FaLock, FaSignInAlt, FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Lütfen şifrenizi girin.');
      return;
    }

    setIsLoading(true);
    setError('');

    await new Promise(resolve => setTimeout(resolve, 600));

    const adminPassword = process.env.REACT_APP_ADMIN_PASSWORD || '5489031744HmHH.';
    if (password === adminPassword) {
      onLoginSuccess();
    } else {
      setError('Yanlış şifre. Lütfen tekrar deneyin.');
    }
    setIsLoading(false);
  };

  return (
    <div className="login-page-container">
      <div className="login-box">
        <div className="login-header">
          <div className="header-icon-wrapper">
            <FaLock className="header-icon" />
          </div>
          <h2>Admin Panel</h2>
          <p className="login-subtitle">Devam etmek için şifrenizi girin</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <div className={`input-group ${error ? 'has-error' : ''}`}>
            <FaLock className="input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="Şifrenizi girin"
              required
              disabled={isLoading}
              autoFocus
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(prev => !prev)}
              tabIndex={-1}
              aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {error && <p className="error-message">{error}</p>}
          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner" /> Giriş yapılıyor...
              </>
            ) : (
              <>
                Giriş Yap <FaSignInAlt className="button-icon" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
