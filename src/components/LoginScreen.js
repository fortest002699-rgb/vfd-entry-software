import React, { useState } from 'react';
import '../styles/LoginScreen.css';

const LoginScreen = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Simple password - change this to whatever you want
  const CORRECT_PASSWORD = 'vfd..@123';

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (password === CORRECT_PASSWORD) {
      onLogin();
      setError('');
      setPassword('');
    } else {
      setError('❌ Incorrect password. Please try again.');
      setPassword('');
    }
  };

  return (
    <div className="login-screen">
      <div className="login-container">
        <div className="login-box">
          <h1>🔐 VFD ENTRY SOFTWARE</h1>
          <p className="login-subtitle">Secure Access</p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="password">Enter Password:</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password to continue"
                  autoFocus
                  className="password-input"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="login-button">
              🔓 Unlock Access
            </button>
          </form>

          <p className="login-footer">
            Only authorized users can access this app
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
