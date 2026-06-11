import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'aurumx_token';
const USER_KEY = 'aurumx_user';
const REMEMBER_KEY = 'aurumx_remember';
const TOUR_LOGIN_PREFIX = 'aurumx_tour_login_count_';
const TOUR_PENDING_KEY = 'aurumx_tour_pending';

const mockAdmin = {
  _id: 'admin123',
  name: 'VCL4X Admin',
  email: 'admin@vcl4xengine.com',
  role: 'admin',
  isActive: true,
  mt5Account: { accountId: null, server: null, connected: false, balance: null, equity: null },
  telegram: { chatId: '987654321', connected: true },
};

const mockUser = {
  _id: 'user123',
  name: 'VCL4X Trader',
  email: 'trader@vcl4xengine.com',
  role: 'user',
  isActive: true,
  subscription: { plan: 'professional', status: 'active', expiresAt: new Date(Date.now() + 30 * 86400000).toISOString() },
  mt5Account: { accountId: null, server: null, connected: false, balance: null, equity: null },
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

function getTourUserKey(user) {
  return user?._id || user?.email || 'guest';
}

function markTourEligibleLogin(user) {
  const userKey = getTourUserKey(user);
  try {
    const countKey = `${TOUR_LOGIN_PREFIX}${userKey}`;
    const currentCount = Number(localStorage.getItem(countKey) || 0);
    const nextCount = currentCount + 1;
    localStorage.setItem(countKey, String(nextCount));

    if (nextCount <= 3) {
      sessionStorage.setItem(TOUR_PENDING_KEY, JSON.stringify({
        userKey,
        loginCount: nextCount,
      }));
    } else {
      sessionStorage.removeItem(TOUR_PENDING_KEY);
    }
  } catch {
    /* ignore storage failures */
  }
}

export const getUserTier = (user) => {
  if (!user) return 'free';
  const plan = user.subscription?.plan || user.plan || 'free';
  if (['elite', 'vcl4x_elite'].includes(plan?.toLowerCase())) return 'elite';
  if (['pro', 'professional', 'vcl4x_pro'].includes(plan?.toLowerCase())) return 'pro';
  if (['discovery', 'starter', 'vcl4x_discovery'].includes(plan?.toLowerCase())) return 'discovery';
  return 'free';
};

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
    const activeToken = readStoredToken();
    try {
      const data = await api.getProfile();
      if (data) {
        setUser(data);
        const remember = localStorage.getItem(REMEMBER_KEY) === '1';
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem(USER_KEY, JSON.stringify(data));
      } else {
        const mock = resolveMockUser(activeToken);
        const stored = readStoredUser();
        if (mock) setUser(mock);
        else if (stored) setUser(stored);
        else logout();
      }
    } catch {
      const mock = resolveMockUser(activeToken);
      const stored = readStoredUser();
      if (mock) setUser(mock);
      else if (stored) setUser(stored);
      else logout();
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
    markTourEligibleLogin(data);
    setToken(data.token);
    setUser(data);
    return data;
  };

  const register = async (name, email, password, acceptTerms, referralCode = '') => {
    const data = await api.register(name, email, password, acceptTerms, referralCode);
    if (data?.requiresVerification) {
      return data;
    }
    if (!data?.token) throw new Error('Registration failed');
    persistSession(data.token, data, true);
    setToken(data.token);
    setUser(data);
    return data;
  };

  const acceptRiskDisclosure = useCallback(async () => {
    const activeToken = readStoredToken();
    const data = await api.acceptRiskDisclosure();
    const acceptedAt = data?.acceptedRiskDisclosureAt || new Date().toISOString();
    setUser((prev) => {
      const next = { ...(prev || {}), acceptedRiskDisclosureAt: acceptedAt };
      const remember = localStorage.getItem(REMEMBER_KEY) === '1';
      const storage = remember ? localStorage : sessionStorage;
      if (activeToken) storage.setItem(USER_KEY, JSON.stringify(next));
      return next;
    });
    return { acceptedRiskDisclosureAt: acceptedAt };
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, fetchProfile, acceptRiskDisclosure }}>
      {children}
    </AuthContext.Provider>
  );
}
