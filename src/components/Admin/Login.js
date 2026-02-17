import React, { useState } from 'react';
import './Login.scss';
import { FaLock, FaSignInAlt } from 'react-icons/fa';

const Login = ({ onLoginSuccess }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        await new Promise(resolve => setTimeout(resolve, 1000));

        if (password === process.env.REACT_APP_ADMIN_PASSWORD) {
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
                    <FaLock className="header-icon" />
                    <h2>Admin Panel Girişi</h2>
                </div>
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <FaLock className="input-icon" />
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Şifrenizi Girin"
                            required
                            disabled={isLoading}
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button 
                        type="submit" 
                        className="login-button"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner" /> Yükleniyor...
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