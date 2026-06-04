import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import BrandLogo from '../components/BrandLogo';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const data = await api.forgotPassword(email);
      setSent(true);
      setMessage(data.message || 'If an account exists for that email, a reset link has been sent.');
    } catch (err) {
      setError(err.message || 'Could not send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg" />
      <div className="login-card animate-in">
        <div className="login-header">
          <BrandLogo size={56} className="login-logo-img" />
          <h1 className="login-title">Forgot Password</h1>
          <p className="login-subtitle">We&apos;ll email you a reset link</p>
        </div>

        {error && <div className="login-error">{error}</div>}
        {message && (
          <div style={{ color: '#3fb950', marginBottom: 16, fontSize: 14, lineHeight: 1.5 }}>
            {message}
          </div>
        )}

        {!sent && (
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div className="login-footer">
          <Link to="/login">Back to Sign In</Link>
        </div>
      </div>
    </div>
  );
}
