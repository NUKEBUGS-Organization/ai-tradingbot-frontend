import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LANDING_URL } from '../config/env';
import BrandLogo from '../components/BrandLogo';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password, remember);
      navigate(data.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      if (err.code === 'EMAIL_NOT_VERIFIED') {
        setUnverifiedEmail(err.email || email);
      } else {
        setUnverifiedEmail('');
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 15,
    duration: 10 + Math.random() * 20,
    size: 1 + Math.random() * 2,
  }));

  return (
    <div className="login-page">
      <div className="login-bg" />
      <div className="login-particles">
        {particles.map(p => (
          <div key={p.id} className="login-particle" style={{
            left: `${p.left}%`, width: `${p.size}px`, height: `${p.size}px`,
            animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s`,
          }} />
        ))}
      </div>
      <div className="login-card animate-in">
        <div className="login-header">
          <BrandLogo size={56} className="login-logo-img" />
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Sign in to VCL4X Trading Platform</p>
        </div>

        {error && <div className="login-error">{error}</div>}
        {unverifiedEmail && (
          <div style={{ marginBottom: 16, fontSize: 13, textAlign: 'center' }}>
            <Link
              to={`/verify-email?email=${encodeURIComponent(unverifiedEmail)}`}
              style={{ color: '#d4af37' }}
            >
              Enter verification code
            </Link>
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input id="login-email" type="email" className="form-input" placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input id="login-password" type="password" className="form-input" placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="login-options">
            <label className="login-remember">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Remember me
            </label>
            <Link to="/forgot-password" className="login-forgot">
              Forgot password?
            </Link>
          </div>
          <button id="login-submit" type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          Don&apos;t have an account? <Link to="/register">Create one</Link>
        </div>
        <p style={{ marginTop: 12, fontSize: 10, color: '#545d68', textAlign: 'center' }}>
          <a href={`${LANDING_URL}/privacy`} target="_blank" rel="noopener noreferrer" style={{ color: '#8b949e' }}>
            Privacy
          </a>
          {' · '}
          <a href={`${LANDING_URL}/terms`} target="_blank" rel="noopener noreferrer" style={{ color: '#8b949e' }}>
            Terms
          </a>
          {' · '}
          <a href={`${LANDING_URL}/refund`} target="_blank" rel="noopener noreferrer" style={{ color: '#8b949e' }}>
            Refund
          </a>
        </p>

      </div>
    </div>
  );
}
