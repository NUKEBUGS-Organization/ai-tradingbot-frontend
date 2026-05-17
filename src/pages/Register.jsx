import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const particles = Array.from({ length: 25 }, (_, i) => ({
    id: i, left: Math.random() * 100, delay: Math.random() * 15,
    duration: 10 + Math.random() * 20, size: 1 + Math.random() * 2,
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
          <h1 className="login-title">Create Account</h1>
          <p className="login-subtitle">Join AurumX Trading Platform</p>
        </div>
        {error && <div className="login-error">{error}</div>}
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" placeholder="John Doe"
              value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-input" placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-input" placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input type="password" className="form-input" placeholder="••••••••"
              value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </div>
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <div className="login-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
