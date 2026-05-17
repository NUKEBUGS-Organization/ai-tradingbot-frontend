import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Shield, Brain, MessageCircle, CreditCard, Activity, Users, LogOut, BarChart3, Cpu } from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = [
    { to: '/dashboard', icon: <LayoutDashboard />, label: 'Dashboard', section: 'main' },
    { to: '/engine', icon: <Cpu />, label: 'AI Engine', section: 'main' },
    { to: '/signals', icon: <Brain />, label: 'AI Signals', section: 'main' },
    { to: '/risk', icon: <Shield />, label: 'Risk Management', section: 'main' },
    { to: '/subscriptions', icon: <CreditCard />, label: 'Subscriptions', section: 'tools' },
  ];

  if (user?.role === 'admin') {
    navItems.splice(1, 0, { to: '/admin', icon: <Users />, label: 'Admin Panel', section: 'main' });
    navItems.push({ to: '/telegram', icon: <MessageCircle />, label: 'Telegram', section: 'tools' });
  }

  const mainItems = navItems.filter(i => i.section === 'main');
  const toolItems = navItems.filter(i => i.section === 'tools');

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">Ax</div>
          <div className="sidebar-logo-text">Aurum<span>X</span></div>
        </div>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-title">Overview</div>
          {mainItems.map(item => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </div>
        <div className="nav-section">
          <div className="nav-section-title">Tools</div>
          {toolItems.map(item => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{user?.name?.charAt(0) || 'U'}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name || 'User'}</div>
            <div className="sidebar-user-role">{user?.role || 'user'}</div>
          </div>
          <button onClick={handleLogout} className="top-bar-btn" title="Logout" style={{ marginLeft: 'auto', width: 28, height: 28 }}>
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
