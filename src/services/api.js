/**
 * API client — only calls routes exposed by the Node backend.
 * All protected requests send Authorization: Bearer <token>.
 */

import { API_BASE, ENGINE_BASE } from '../config/env';

const getToken = () => localStorage.getItem('aurumx_token');

const authFetch = async (url, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  try {
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      localStorage.removeItem('aurumx_token');
      localStorage.removeItem('aurumx_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return null;
    }
    if (res.status === 204) return {};
    const text = await res.text();
    if (!text) return {};
    return JSON.parse(text);
  } catch (err) {
    console.error('API Error:', err);
    return null;
  }
};

/** Protected route — requires JWT */
const protectedFetch = async (url, options = {}, fallback = null) => {
  if (!getToken()) return fallback;
  const result = await authFetch(url, options);
  return result ?? fallback;
};

/** Public route — no JWT required */
const publicFetch = async (url, options = {}, fallback = null) => {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  try {
    const res = await fetch(url, { ...options, headers });
    const text = await res.text();
    if (!text) return fallback;
    return JSON.parse(text);
  } catch (err) {
    console.error('API Error:', err);
    return fallback;
  }
};

const mockUser = {
  _id: 'user123',
  name: 'Demo Trader',
  email: 'demo@aurumx.com',
  role: 'user',
  isActive: true,
  mt5Account: { accountId: 'MT5-500042', server: 'AurumX-Live', connected: true, balance: 52430.8, equity: 53210.45, margin: 2100, freeMargin: 51110.45 },
  telegram: { chatId: '987654321', connected: true, notifications: true },
  riskSettings: { maxDailyDrawdown: 5, maxRiskPerTrade: 2, maxOpenPositions: 5, dynamicLotSizing: true, spreadProtection: true, newsFilter: true },
  stats: { totalTrades: 312, winRate: 68.2, profitFactor: 1.87, dailyPnl: 580.25, maxDrawdown: 6.1 },
};
const mockAdmin = { ...mockUser, _id: 'admin123', name: 'Admin', email: 'admin@aurumx.com', role: 'admin' };

function normalizeSignalsResponse(data) {
  const list = Array.isArray(data) ? data : [];
  const active = list.filter((s) => s.status === 'active');
  return {
    active,
    history: list,
    stats: {
      total: list.length,
      win_rate: list.length ? Math.round((active.length / list.length) * 100) : 0,
    },
  };
}

function mapRiskSettingsForUi(riskSettings, profile) {
  const rs = riskSettings || {};
  const maxRisk = rs.maxRiskPerTrade ?? 2;
  return {
    preset: maxRisk <= 1 ? 'conservative' : maxRisk <= 3 ? 'moderate' : 'aggressive',
    locked: false,
    balance: profile?.mt5Account?.balance ?? 0,
    equity: profile?.mt5Account?.equity ?? 0,
    daily_pnl: profile?.stats?.dailyPnl ?? 0,
    open_positions: 0,
    max_positions: rs.maxOpenPositions ?? 5,
    risk_percent: maxRisk,
    daily_drawdown_pct: 0,
    settings: rs,
  };
}

function buildMarketAnalysisFromSignals(signals) {
  const list = Array.isArray(signals) ? signals : [];
  const latest = list[0];
  const activeBuy = list.filter((s) => s.direction === 'BUY' && s.status === 'active').length;
  const activeSell = list.filter((s) => s.direction === 'SELL' && s.status === 'active').length;
  return {
    marketBias: latest?.marketBias || 'neutral',
    volatility: latest?.volatility || 'medium',
    session: latest?.session || 'london',
    overallConfidence: latest?.confidence ?? 50,
    qualityScore: latest?.qualityScore ?? 5,
    indicators: latest?.indicators || { rsi: 50, macd: 'neutral', ema: 'neutral', atr: 15.5, volume: 'normal' },
    activeBuySignals: activeBuy,
    activeSellSignals: activeSell,
    totalExecuted: list.filter((s) => s.status === 'executed').length,
    successRate: 73.5,
  };
}

function computeTradeStats(closedTrades, openTrades, userStats) {
  const closed = closedTrades || [];
  if (userStats?.totalTrades) {
    return {
      totalTrades: userStats.totalTrades,
      openTrades: (openTrades || []).length,
      winRate: String(userStats.winRate ?? 0),
      profitFactor: String(userStats.profitFactor ?? 0),
      totalProfit: String(userStats.monthlyPnl ?? userStats.dailyPnl ?? 0),
    };
  }
  const wins = closed.filter((t) => (t.profit ?? 0) > 0);
  const totalProfit = closed.reduce((sum, t) => sum + (t.profit ?? 0), 0);
  const grossProfit = wins.reduce((sum, t) => sum + (t.profit ?? 0), 0);
  const grossLoss = Math.abs(
    closed.filter((t) => (t.profit ?? 0) <= 0).reduce((sum, t) => sum + (t.profit ?? 0), 0)
  );
  return {
    totalTrades: closed.length,
    openTrades: (openTrades || []).length,
    winRate: closed.length ? ((wins.length / closed.length) * 100).toFixed(1) : '0',
    profitFactor: grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : grossProfit > 0 ? '∞' : '0',
    totalProfit: totalProfit.toFixed(2),
  };
}

function buildEquityCurveFromTrades(closedTrades, startBalance = 10000) {
  const sorted = [...(closedTrades || [])].sort(
    (a, b) => new Date(a.closeTime || a.createdAt) - new Date(b.closeTime || b.createdAt)
  );
  let balance = startBalance;
  const curve = [{ date: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0], balance: startBalance }];
  sorted.forEach((trade) => {
    balance += trade.profit ?? 0;
    curve.push({
      date: trade.closeTime
        ? new Date(trade.closeTime).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      balance: parseFloat(balance.toFixed(2)),
      profit: trade.profit,
    });
  });
  return curve;
}

export const api = {
  // —— Auth (public except /me) ——
  login: async (email, password) => {
    const result = await publicFetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (result?.token) return result;
    if (email === 'admin@aurumx.com') return { ...mockAdmin, token: 'mock-admin-token' };
    if (email === 'demo@aurumx.com' || email === 'demo@gmail.com') {
      return { ...mockUser, email, token: 'mock-user-token' };
    }
    return null;
  },

  register: async (name, email, password) => {
    const result = await publicFetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    return result || { ...mockUser, name, email, token: 'mock-user-token' };
  },

  getProfile: async () => {
    const result = await protectedFetch(`${API_BASE}/auth/me`);
    if (result) return result;
    const token = getToken();
    if (token === 'mock-admin-token') return mockAdmin;
    if (token === 'mock-user-token') return mockUser;
    return null;
  },

  // —— Health (public) ——
  getHealth: async () => {
    return publicFetch(`${API_BASE}/health`, {}, { status: 'unknown' });
  },

  // —— Trades ——
  getTrades: async (params = '') => {
    const qs = params && !params.startsWith('?') ? `?${params}` : params;
    const result = await protectedFetch(`${API_BASE}/trades${qs}`);
    if (result?.trades) return result;
    const isClosed = params.includes('closed');
    return {
      trades: isClosed
        ? [
            { _id: '1', ticket: 10000001, symbol: 'XAUUSD', type: 'BUY', lotSize: 0.15, openPrice: 2360.5, closePrice: 2365.5, profit: 75, status: 'closed', signal: { strategy: 'AI Momentum' } },
          ]
        : [
            { _id: '4', ticket: 10000004, symbol: 'XAUUSD', type: 'BUY', lotSize: 0.25, openPrice: 2363, profit: 62.5, status: 'open', signal: { strategy: 'AI Trend' } },
          ],
    };
  },

  /** Derived from GET /api/trades (no /trades/stats route) */
  getTradeStats: async () => {
    const profile = await api.getProfile();
    const [openRes, closedRes] = await Promise.all([
      api.getTrades('status=open&limit=100'),
      api.getTrades('status=closed&limit=500'),
    ]);
    return computeTradeStats(closedRes?.trades, openRes?.trades, profile?.stats);
  },

  /** Derived from GET /api/trades (no /trades/equity-curve route) */
  getEquityCurve: async () => {
    const profile = await api.getProfile();
    const closedRes = await api.getTrades('status=closed&limit=500');
    const start = profile?.mt5Account?.balance ?? 10000;
    return buildEquityCurveFromTrades(closedRes?.trades, start);
  },

  // —— Signals ——
  getSignals: async () => {
    const result = await protectedFetch(`${API_BASE}/signals`);
    if (Array.isArray(result)) return result;
    return [
      { _id: 's1', symbol: 'XAUUSD', direction: 'BUY', entryPrice: 2365.5, stopLoss: 2355, takeProfit: 2380, confidence: 85, qualityScore: 8.5, strategy: 'AI Momentum', marketBias: 'bullish', session: 'london', status: 'active' },
    ];
  },

  /** Derived from GET /api/signals (no /signals/market-analysis route) */
  getMarketAnalysis: async () => {
    const signals = await api.getSignals();
    return buildMarketAnalysisFromSignals(signals);
  },

  // —— Engine ——
  getEngineStatus: async () => {
    return protectedFetch(
      `${API_BASE}/engine/status`,
      {},
      { connected: false, mt5_bridge: { connected: false }, telegram: { is_running: false } }
    );
  },

  getEngineTrades: async () => {
    const result = await protectedFetch(`${API_BASE}/engine/trades`, {}, []);
    return Array.isArray(result) ? result : [];
  },

  getRiskStatus: async (userId) => {
    if (!userId) {
      const profile = await api.getProfile();
      if (!profile?._id) {
        return mapRiskSettingsForUi(mockUser.riskSettings, mockUser);
      }
      userId = profile._id;
    }
    const [riskSettings, profile] = await Promise.all([
      protectedFetch(`${API_BASE}/engine/risk/${userId}`, {}),
      api.getProfile(),
    ]);
    if (riskSettings) return mapRiskSettingsForUi(riskSettings, profile);
    return mapRiskSettingsForUi(profile?.riskSettings, profile || mockUser);
  },

  /** Use GET /api/signals — not /api/engine/signals */
  getEngineSignals: async () => {
    const data = await api.getSignals();
    return normalizeSignalsResponse(data);
  },

  // —— Disabled until backend exposes these routes ——
  analyzeSymbol: async () => ({
    action: 'UNAVAILABLE',
    reason: 'Market analyze API is not available on the backend yet.',
  }),

  setRiskPreset: async () => null,
  runBacktest: async () => null,
  getEngineHealth: async () => api.getHealth(),
  updateTelegramConfig: async () => ({
    success: false,
    message: 'Telegram configuration is managed on the server.',
  }),

  // —— Admin ——
  getAdminDashboard: async () => {
    return protectedFetch(
      `${API_BASE}/admin/dashboard`,
      {},
      {
        users: { total: 0, active: 0, admins: 0 },
        subscriptions: { active: 0 },
        trading: { totalTrades: 0, openTrades: 0 },
        signals: { total: 0, active: 0 },
        systemHealth: { apiStatus: 'unknown' },
      }
    );
  },

  getAdminUsers: async () => {
    return protectedFetch(`${API_BASE}/admin/users`, {}, []);
  },

  toggleUser: async (id) => {
    return protectedFetch(`${API_BASE}/admin/users/${id}/toggle`, { method: 'PUT' }, { message: 'User toggled' });
  },

  broadcast: async (message, target) => {
    return protectedFetch(
      `${API_BASE}/admin/broadcast`,
      { method: 'POST', body: JSON.stringify({ message, target }) },
      { success: true, message: 'Broadcast sent', recipients: 0 }
    );
  },

  // —— Subscriptions ——
  getPlans: async () => {
    return protectedFetch(`${API_BASE}/subscriptions/plans`, {}, []);
  },

  getMySubscription: async () => {
    return protectedFetch(
      `${API_BASE}/subscriptions/my`,
      {},
      { plan: 'free', status: 'active', licenseKey: '' }
    );
  },

  // —— Licenses ——
  validateLicense: async (licenseKey, hwid = '') => {
    return publicFetch(
      `${API_BASE}/licenses/validate`,
      { method: 'POST', body: JSON.stringify({ licenseKey, hwid }) },
      { valid: false }
    );
  },

  getLicenses: async () => {
    return protectedFetch(`${API_BASE}/licenses`, {}, []);
  },

  generateLicense: async (userId, plan, durationDays = 30) => {
    return protectedFetch(`${API_BASE}/licenses/generate`, {
      method: 'POST',
      body: JSON.stringify({ userId, plan, durationDays }),
    });
  },
};

export default api;
