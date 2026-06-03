/**
 * API client — only calls routes exposed by the Node backend.
 * All protected requests send Authorization: Bearer <token>.
 */

import { API_BASE, ENGINE_BASE, ALLOW_MOCK_AUTH } from '../config/env';
import { pickMt5LiveAccount, mapRiskSettingsForUi } from '../utils/tradeMetrics';

const getToken = () =>
  localStorage.getItem('aurumx_token') || sessionStorage.getItem('aurumx_token');

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
      sessionStorage.removeItem('aurumx_token');
      sessionStorage.removeItem('aurumx_user');
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

/** Public route — no JWT required; throws on API error responses */
const publicFetch = async (url, options = {}) => {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }
  if (!res.ok) {
    const err = new Error(data.message || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
};

const mockUser = {
  _id: 'user123',
  name: 'VCL4X Trader',
  email: 'trader@vcl4xengine.com',
  subscription: { plan: 'professional', status: 'active', expiresAt: new Date(Date.now() + 30 * 86400000).toISOString() },
  role: 'user',
  isActive: true,
  mt5Account: { accountId: 'MT5-500042', server: 'VCL4X-Live', connected: true, balance: 52430.8, equity: 53210.45, margin: 2100, freeMargin: 51110.45 },
  telegram: { chatId: '987654321', connected: true, notifications: true },
  riskSettings: { maxDailyDrawdown: 5, maxRiskPerTrade: 2, maxOpenPositions: 5, dynamicLotSizing: true, spreadProtection: true, newsFilter: true },
  stats: { totalTrades: 312, winRate: 68.2, profitFactor: 1.87, dailyPnl: 580.25, maxDrawdown: 6.1 },
};
const mockAdmin = { ...mockUser, _id: 'admin123', name: 'VCL4X Admin', email: 'admin@vcl4xengine.com', role: 'admin' };

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
    try {
      return await publicFetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    } catch (err) {
      if (!ALLOW_MOCK_AUTH) throw err;
      const normalized = String(email || '').toLowerCase().trim();
      if (normalized === 'admin@vcl4xengine.com' && password === 'AdminX@2026!#') {
        return { ...mockAdmin, token: 'mock-admin-token' };
      }
      if (normalized === 'trader@vcl4xengine.com' && password === 'DemoX@2026!#') {
        return { ...mockUser, token: 'mock-user-token' };
      }
      throw err;
    }
  },

  register: async (name, email, password, acceptTerms = true, referralCode = '') => {
    return publicFetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({
        name,
        email,
        password,
        acceptTerms,
        ...(referralCode ? { referralCode } : {}),
      }),
    });
  },

  logout: async () => {
    await protectedFetch(`${API_BASE}/auth/logout`, { method: 'POST' }, {});
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
    try {
      return await publicFetch(`${API_BASE}/health`);
    } catch {
      return { status: 'unknown' };
    }
  },

  // —— Trades ——
  getTrades: async (params = '') => {
    const qs = params && !params.startsWith('?') ? `?${params}` : params;
    const result = await protectedFetch(`${API_BASE}/trades${qs}`);
    if (result && Array.isArray(result.trades)) return result;
    return { trades: [] };
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
    return [];
  },

  getEngineActiveSignals: async () => {
    const data = await protectedFetch(`${API_BASE}/engine/signals/active`, {}, { signals: [] });
    return data?.signals || [];
  },

  getSignalHistory: async () => {
    const result = await protectedFetch(`${API_BASE}/signals/history`, {}, []);
    return Array.isArray(result) ? result : [];
  },

  getMarketAnalysis: async () => {
    return protectedFetch(`${API_BASE}/signals/market-analysis`);
  },

  // —— Engine ——
  getAnalysisHistory: async () => {
    return protectedFetch(`${API_BASE}/engine/analysis/history`);
  },

  getAnalysisLatest: async () => {
    return protectedFetch(`${API_BASE}/engine/analysis/latest`);
  },

  getEngineStatus: async () => {
    const result = await protectedFetch(`${API_BASE}/engine/status`, {}, null);
    if (result?.connected || result?.engine?.is_running) return result;
    if (result?.code === 'SUBSCRIPTION_REQUIRED') {
      return { connected: false, mt5_bridge: { connected: false }, telegram: { is_running: false }, reason: result.message };
    }
    return (
      result ?? {
        connected: false,
        mt5_bridge: { connected: false },
        telegram: { is_running: false },
      }
    );
  },

  getEngineCandles: async (symbol, { timeframe = 'M15', limit = 150 } = {}) => {
    const qs = new URLSearchParams({ timeframe, limit: String(limit) }).toString();
    return protectedFetch(
      `${API_BASE}/engine/candles/${encodeURIComponent(symbol)}?${qs}`,
      {},
      null
    );
  },

  getEngineTrades: async () => {
    const result = await protectedFetch(`${API_BASE}/engine/trades`, {}, []);
    return Array.isArray(result) ? result : [];
  },

  getEngineRisk: async (userId, profileFromCaller = null, engineStatus = null) => {
    const profile = profileFromCaller || (await api.getProfile());
    const live = pickMt5LiveAccount(engineStatus, null);
    if (!userId) {
      if (!profile?._id) {
        return mapRiskSettingsForUi(mockUser.riskSettings, mockUser, live);
      }
      userId = profile._id;
    }
    const isMongoId = /^[a-f\d]{24}$/i.test(String(userId));
    if (!isMongoId) {
      return mapRiskSettingsForUi(profile?.riskSettings, profile || mockUser, live);
    }
    const riskSettings = await protectedFetch(`${API_BASE}/engine/risk/${userId}`, {});
    if (riskSettings && !riskSettings.message) {
      return mapRiskSettingsForUi(riskSettings, profile, live);
    }
    return mapRiskSettingsForUi(profile?.riskSettings, profile || mockUser, live);
  },

  /** @deprecated use getEngineRisk */
  getRiskStatus: async (userId) => api.getEngineRisk(userId),

  /** Use GET /api/signals — not /api/engine/signals */
  getEngineSignals: async () => {
    const data = await api.getSignals();
    return normalizeSignalsResponse(data);
  },

  // POST /api/engine/analyze (proxies to Python engine)
  analyzeSymbol: async (symbol = 'XAUUSD') => {
    const result = await protectedFetch(
      `${API_BASE}/engine/analyze`,
      { method: 'POST', body: JSON.stringify({ symbol }) },
      null
    );
    if (result?.action === 'OFFLINE') return result;
    if (result?.symbol != null || result?.analysis) return result;
    if (result?.message?.includes('Cannot POST')) {
      return { action: 'OFFLINE', reason: 'Node server missing /api/engine/analyze — restart npm run start in server/' };
    }
    return {
      action: 'OFFLINE',
      reason: result?.message || result?.error || 'Python engine not reachable. Restart Node server (npm run start in server/).',
    };
  },

  setRiskPreset: async (preset) => {
    const profile = await api.getProfile();
    return protectedFetch(`${API_BASE}/engine/risk/preset`, {
      method: 'POST',
      body: JSON.stringify({ preset, userId: profile?._id }),
    });
  },
  runBacktest: async ({ symbol = 'XAUUSD', initial_balance = 10000, preset = 'moderate', spread_pips = 3.0 } = {}) => {
    const result = await protectedFetch(
      `${API_BASE}/engine/backtest`,
      {
        method: 'POST',
        body: JSON.stringify({ symbol, initial_balance, preset, spread_pips }),
      },
      null
    );
    if (result?.metrics || result?.trades) return result;
    return {
      error: result?.detail || result?.message || result?.error || 'Backtest failed. Ensure Python engine is running with candle data.',
    };
  },
  getEngineHealth: async () => api.getHealth(),

  getAutoTradeStatus: async () =>
    protectedFetch(`${API_BASE}/engine/auto-trade/status`, {}, { enabled: false, mt5_connected: false }),

  setAutoTradeEnabled: async (enabled) =>
    protectedFetch(`${API_BASE}/engine/auto-trade/toggle`, {
      method: 'POST',
      body: JSON.stringify({ enabled }),
    }),

  testFireTrade: async (symbol = 'XAUUSD', direction = 'BUY') =>
    protectedFetch(`${API_BASE}/engine/test-fire-trade`, {
      method: 'POST',
      body: JSON.stringify({ symbol, direction }),
    }),
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

  broadcastMessage: async (message) => {
    return protectedFetch(`${API_BASE}/admin/broadcast`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  adminBroadcastSignal: async (symbol, minConfidence, isTest) => {
    return protectedFetch(`${API_BASE}/engine/admin/broadcast-signal`, {
      method: 'POST',
      body: JSON.stringify({
        symbol,
        min_confidence: minConfidence,
        is_test: isTest
      })
    });
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
    try {
      return await publicFetch(`${API_BASE}/licenses/validate`, {
        method: 'POST',
        body: JSON.stringify({ licenseKey, hwid }),
      });
    } catch {
      return { valid: false };
    }
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

  getReferralInfo: async () => {
    return protectedFetch(`${API_BASE}/referral/my`);
  },

  generateReferralCode: async () => {
    return protectedFetch(`${API_BASE}/referral/generate`, {
      method: 'POST'
    });
  },

  validateReferralCode: async (code) => {
    const response = await fetch(`${API_BASE}/referral/validate/${code}`);
    return response.json();
  },

  adminGetAllReferrals: async () => {
    return protectedFetch(`${API_BASE}/referral/admin/all`);
  },

  adminUpdateCommission: async (referralId, data) => {
    return protectedFetch(`${API_BASE}/referral/admin/${referralId}/commission`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
};

export default api;
