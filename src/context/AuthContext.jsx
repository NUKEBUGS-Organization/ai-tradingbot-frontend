import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const mockAdmin = { 
    _id: 'admin123', name: 'Admin', email: 'admin@aurumx.com', role: 'admin', isActive: true,
    mt5Account: { accountId: 'MT5-500042', connected: true, balance: 52430.80 },
    telegram: { chatId: '987654321', connected: true }
  };
  const mockUser = { 
    _id: 'user123', name: 'Demo User', email: 'demo@aurumx.com', role: 'user', isActive: true,
    mt5Account: { accountId: 'MT5-100200', connected: true, balance: 10000.00 },
    riskSettings: { maxDailyDrawdown: 5, maxRiskPerTrade: 2, maxOpenPositions: 5 }
  };
  const initialToken = localStorage.getItem('aurumx_token');
  const getInitialUser = () => {
    if (initialToken === 'mock-admin-token') return mockAdmin;
    if (initialToken === 'mock-user-token') return mockUser;
    return null;
  };
  const [user, setUser] = useState(getInitialUser());
  const [token, setToken] = useState(initialToken);
  const [loading, setLoading] = useState(!!initialToken);

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await api.getProfile();
      if (data) {
        setUser(data);
      } else {
        logout();
      }
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const data = await api.login(email, password);
      if (data && data.token) {
        localStorage.setItem('aurumx_token', data.token);
        setToken(data.token);
        setUser(data);
        return data;
      }
      throw new Error("Invalid credentials");
    } catch (err) {
      throw new Error(err.message || "Server error");
    }
  };

  const register = async (name, email, password) => {
    try {
      const data = await api.register(name, email, password);
      if (data && data.token) {
        localStorage.setItem('aurumx_token', data.token);
        setToken(data.token);
        setUser(data);
        return data;
      }
      throw new Error("Registration failed");
    } catch (err) {
      throw new Error(err.message || "Server error");
    }
  };

  const logout = () => {
    localStorage.removeItem('aurumx_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
