import React, { useEffect, useState } from 'react';
import '../styles/Login.css';

function Login({ onLogin, theme, onThemeToggle }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeInput, setActiveInput] = useState(null);

  useEffect(() => {
    // Add animation class to form when component mounts
    const form = document.querySelector('.login-form');
    if (form) {
      form.classList.add('form-visible');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API call with timeout
    setTimeout(() => {
      // Map usernames to user types
      const userTypeMap = {
        'super': 'super',
        'admin': 'admin',
        'appadmin': 'app_admin',
        'enduser': 'end'
      };

      const userType = userTypeMap[username.toLowerCase()];
      
      if (userType && password) {
        onLogin(userType);
      } else if (!password) {
        setError('Please enter a password.');
      } else {
        setError('Invalid username. Please try again.');
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleInputFocus = (inputName) => {
    setActiveInput(inputName);
  };

  const handleInputBlur = () => {
    setActiveInput(null);
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="theme-toggle-container">
          <button 
            className="theme-toggle-button" 
            onClick={onThemeToggle}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
        <h2 className="login-title">
          <span className="title-icon">🔐</span>
          Keyper
        </h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-fields">
            <div className={`form-group ${activeInput === 'username' ? 'active' : ''}`}>
              <label htmlFor="username">
                <span className="input-icon">👤</span>
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => handleInputFocus('username')}
                onBlur={handleInputBlur}
                placeholder="Enter your username"
                required
              />
            </div>
            <div className={`form-group ${activeInput === 'password' ? 'active' : ''}`}>
              <label htmlFor="password">
                <span className="input-icon">🔑</span>
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => handleInputFocus('password')}
                onBlur={handleInputBlur}
                placeholder="Enter your password"
                required
              />
            </div>
          </div>
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}
          <div className="submit-section">
            <button 
              type="submit" 
              className={`submit-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Logging in...
                </>
              ) : (
                <>
                  <span className="button-icon">→</span>
                  Go to Dashboard
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login; 