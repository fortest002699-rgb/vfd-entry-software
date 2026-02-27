import React, { useState } from 'react';
import '../styles/PasswordModal.css';

const PasswordModal = ({ title, onSubmit, onCancel, correctPassword }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (password === correctPassword) {
      onSubmit();
      setError('');
      setPassword('');
    } else {
      setError('❌ Incorrect password. Please try again.');
      setPassword('');
    }
  };

  const handleCancel = () => {
    setPassword('');
    setError('');
    onCancel();
  };

  return (
    <div className="password-modal-overlay">
      <div className="password-modal">
        <h2>{title}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="modal-password">Enter Password:</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="modal-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
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

          <div className="modal-buttons">
            <button type="submit" className="btn btn-primary">
              ✓ Confirm
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>
              ✕ Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordModal;
