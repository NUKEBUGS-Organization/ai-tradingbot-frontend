import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import BrandLogo from '../components/BrandLogo';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!token) {
      setError('Invalid reset link. Request a new one from the forgot password page.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const data = await api.resetPassword(token, password);
      if (data?.token) {
        localStorage.setItem('aurumx_token', data.token);
        localStorage.setItem('aurumx_user', JSON.stringify(data));
        localStorage.setItem('aurumx_remember', '1');
        window.location.href = data.role === 'admin' ? '/admin' : '/dashboard';
        return;
      }
    } catch (err) {
      setError(err.message || 'Password reset failed');
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
          <h1 className="login-title">Reset Password</h1>
          <p className="login-subtitle">Choose a new password for your account</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-btn" disabled={loading || !token}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        <div className="login-footer">
          <Link to="/forgot-password">Request a new link</Link>
          {' · '}
          <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
