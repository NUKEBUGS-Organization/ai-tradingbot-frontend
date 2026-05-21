import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'aurumx_token';
const USER_KEY = 'aurumx_user';
const REMEMBER_KEY = 'aurumx_remember';

const mockAdmin = {
  _id: 'admin123',
  name: 'Admin',
  email: 'admin@aurumx.com',
  role: 'admin',
  isActive: true,
  mt5Account: { accountId: 'MT5-500042', connected: true, balance: 52430.8 },
  telegram: { chatId: '987654321', connected: true },
};

const mockUser = {
  _id: 'user123',
  name: 'Demo User',
  email: 'demo@aurumx.com',
  role: 'user',
  isActive: true,
  mt5Account: { accountId: 'MT5-100200', connected: true, balance: 10000.0 },
  riskSettings: { maxDailyDrawdown: 5, maxRiskPerTrade: 2, maxOpenPositions: 5 },
};

function readStoredToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function resolveMockUser(token) {
  if (token === 'mock-admin-token') return mockAdmin;
  if (token === 'mock-user-token') return mockUser;
  return null;
}

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const initialToken = readStoredToken();
  const [user, setUser] = useState(() => {
    const stored = readStoredUser();
    if (stored) return stored;
    return resolveMockUser(initialToken);
  });
  const [token, setToken] = useState(initialToken);
  const [loading, setLoading] = useState(!!initialToken);

  const persistSession = useCallback((nextToken, nextUser, remember) => {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(USER_KEY);

    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(TOKEN_KEY, nextToken);
    if (nextUser) storage.setItem(USER_KEY, JSON.stringify(nextUser));
    if (remember) localStorage.setItem(REMEMBER_KEY, '1');
    else localStorage.removeItem(REMEMBER_KEY);
  }, []);

  const logout = useCallback(() => {
    api.logout().catch(() => {});
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await api.getProfile();
      if (data) {
        setUser(data);
        const remember = localStorage.getItem(REMEMBER_KEY) === '1';
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem(USER_KEY, JSON.stringify(data));
      } else {
        logout();
      }
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    if (token) fetchProfile();
    else setLoading(false);
  }, [token, fetchProfile]);

  const login = async (email, password, remember = false) => {
    const data = await api.login(email, password);
    if (!data?.token) throw new Error('Invalid email or password');
    persistSession(data.token, data, remember);
    setToken(data.token);
    setUser(data);
    return data;
  };

  const register = async (name, email, password, acceptTerms) => {
    const data = await api.register(name, email, password, acceptTerms);
    if (!data?.token) throw new Error('Registration failed');
    persistSession(data.token, data, true);
    setToken(data.token);
    setUser(data);
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
