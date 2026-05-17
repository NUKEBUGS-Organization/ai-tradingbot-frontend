import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      navigate(data.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
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
          <div className="login-logo">Ax</div>
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Sign in to AurumX Trading Platform</p>
        </div>

        {error && <div className="login-error">{error}</div>}

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
            <a href="#" className="login-forgot">Forgot password?</a>
          </div>
          <button id="login-submit" type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </div>

        <div style={{ marginTop: 20, padding: '12px 16px', background: 'rgba(212,175,55,0.06)', borderRadius: 8, border: '1px solid rgba(212,175,55,0.15)' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#d4af37', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Demo Credentials</div>
          <div style={{ fontSize: 11, color: '#8b949e', fontFamily: 'var(--font-mono)' }}>
            Admin: admin@aurumx.com / AdminX@2026!#<br />
            User: demo@aurumx.com / DemoX@2026!#
          </div>
        </div>
      </div>
    </div>
  );
}
