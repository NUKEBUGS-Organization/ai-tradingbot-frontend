import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import RiskManagement from './pages/RiskManagement';
import AISignals from './pages/AISignals';
import TelegramPanel from './pages/TelegramPanel';
import Subscriptions from './pages/Subscriptions';
import EnginePanel from './pages/EnginePanel';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#d4af37', fontSize: '16px' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />
          <Route path="/risk" element={<ProtectedRoute><RiskManagement /></ProtectedRoute>} />
          <Route path="/signals" element={<ProtectedRoute><AISignals /></ProtectedRoute>} />
          <Route path="/telegram" element={<ProtectedRoute adminOnly><TelegramPanel /></ProtectedRoute>} />
          <Route path="/subscriptions" element={<ProtectedRoute><Subscriptions /></ProtectedRoute>} />
          <Route path="/engine" element={<ProtectedRoute><EnginePanel /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/admin" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
