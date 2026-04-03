import React, { useState } from 'react';
import './Login.scss';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

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
    <div className="login-page">
      <span className="login-eyebrow">(Ad-00)</span>

      <div className="login-center">
        <h1 className="login-title">Admin</h1>
        <div className="login-divider" />

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <div className={`login-input-wrapper ${error ? 'has-error' : ''}`}>
            <input
              type={showPassword ? 'text' : 'password'}
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

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="login-spinner" /> Giriş yapılıyor...
              </>
            ) : (
              'Giriş Yap'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
