import React, { useState } from 'react';
import './Login.scss';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { signInAdmin } from '../../firebase-auth';

// Firebase'in döndürdüğü hata kodlarını kullanıcıya gösterilecek metne çevirir.
// Kullanıcı sayımı yapılmasını engellemek için "kullanıcı yok" ve "yanlış şifre"
// aynı mesajı verir.
const errorMessage = (code) => {
  switch (code) {
    case 'auth/invalid-email':
      return 'Geçersiz e-posta adresi.';
    case 'auth/user-disabled':
      return 'Bu hesap devre dışı bırakılmış.';
    case 'auth/too-many-requests':
      return 'Çok fazla deneme yapıldı. Lütfen biraz sonra tekrar deneyin.';
    case 'auth/network-request-failed':
      return 'Ağ hatası. Bağlantınızı kontrol edip tekrar deneyin.';
    case 'auth/unavailable':
    case 'auth/configuration-not-found':
    case 'auth/operation-not-allowed':
      return 'Firebase kimlik doğrulama yapılandırılmamış. Firebase Console → Authentication bölümünden E-posta/Şifre yöntemini etkinleştirin.';
    default:
      return 'E-posta veya şifre hatalı. Lütfen tekrar deneyin.';
  }
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      setError('Lütfen e-posta ve şifrenizi girin.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Doğrulama Firebase tarafında yapılır; şifre hiçbir zaman istemci
      // paketine gömülmez. Başarılı olduğunda App'teki onAuthStateChanged
      // aboneliği tetiklenir ve admin paneline yönlendirilir.
      await signInAdmin(email.trim(), password);
    } catch (err) {
      setError(errorMessage(err?.code || err?.message));
      setPassword('');
    } finally {
      setIsLoading(false);
    }
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
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="E-posta adresiniz"
              autoComplete="username"
              required
              disabled={isLoading}
              autoFocus
            />
          </div>

          <div className={`login-input-wrapper ${error ? 'has-error' : ''}`}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="Şifrenizi girin"
              autoComplete="current-password"
              required
              disabled={isLoading}
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
