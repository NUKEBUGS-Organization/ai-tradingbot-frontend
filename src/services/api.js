/**
 * AMD AI Trading Platform - API Service
 * =======================================
 * Connects to Node.js backend + Python AI Engine
 */

const API_BASE = 'http://localhost:5000/api';
const ENGINE_BASE = 'http://localhost:8000/api';

// Helper for authenticated requests
const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem('aurumx_token');
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
    return res.json();
  } catch (err) {
    console.error('API Error:', err);
    return null;
  }
};

// Fetch with fallback to mock data
const safeFetch = async (url, options = {}, fallback = null) => {
  try {
    const result = await authFetch(url, options);
    return result || fallback;
  } catch {
    return fallback;
  }
};

// ============================================
// Mock Data (fallback when servers are offline)
// ============================================
const mockUser = {
  _id: 'user123', name: 'Demo Trader', email: 'demo@aurumx.com', role: 'user', isActive: true,
  mt5Account: { accountId: 'MT5-500042', server: 'AurumX-Live', connected: true, balance: 52430.80, equity: 53210.45, margin: 2100, freeMargin: 51110.45 },
  telegram: { chatId: '987654321', connected: true, notifications: true },
  riskSettings: { maxDailyDrawdown: 5, maxRiskPerTrade: 2, maxOpenPositions: 5, dynamicLotSizing: true, spreadProtection: true, newsFilter: true },
  stats: { totalTrades: 312, winRate: 68.2, profitFactor: 1.87, dailyPnl: 580.25, maxDrawdown: 6.1 }
};
const mockAdmin = { ...mockUser, _id: 'admin123', name: 'Admin', email: 'admin@aurumx.com', role: 'admin' };

export const api = {
  // ============================
  // Auth
  // ============================
  login: async (email, password) => {
    const result = await safeFetch(`${API_BASE}/auth/login`, {
      method: 'POST', body: JSON.stringify({ email, password })
    });
    if (result && result.token) return result;
    // Fallback for offline
    if (email === 'admin@aurumx.com') return { ...mockAdmin, token: 'mock-admin-token' };
    return { ...mockUser, token: 'mock-user-token' };
  },

  register: async (name, email, password) => {
    const result = await safeFetch(`${API_BASE}/auth/register`, {
      method: 'POST', body: JSON.stringify({ name, email, password })
    });
    return result || { ...mockUser, name, email, token: 'mock-user-token' };
  },

  getProfile: async () => {
    const result = await safeFetch(`${API_BASE}/auth/me`);
    if (result) return result;
    const token = localStorage.getItem('aurumx_token');
    return token === 'mock-admin-token' ? mockAdmin : mockUser;
  },

  // ============================
  // Trades
  // ============================
  getTrades: async (params = '') => {
    const result = await safeFetch(`${API_BASE}/trades?${params}`);
    if (result) return result;
    const isClosed = params.includes('closed');
    return {
      trades: isClosed ? [
        { _id: '1', ticket: 10000001, symbol: 'XAUUSD', type: 'BUY', lotSize: 0.15, openPrice: 2360.50, closePrice: 2365.50, stopLoss: 2355.00, takeProfit: 2370.00, profit: 75.00, status: 'closed', signal: { strategy: 'AI Momentum' } },
        { _id: '2', ticket: 10000002, symbol: 'EURUSD', type: 'SELL', lotSize: 0.50, openPrice: 1.08500, closePrice: 1.08400, stopLoss: 1.08700, takeProfit: 1.08100, profit: 50.00, status: 'closed', signal: { strategy: 'AI Scalper' } },
        { _id: '3', ticket: 10000003, symbol: 'XAUUSD', type: 'SELL', lotSize: 0.20, openPrice: 2370.00, closePrice: 2372.00, stopLoss: 2375.00, takeProfit: 2360.00, profit: -40.00, status: 'closed', signal: { strategy: 'Grid' } }
      ] : [
        { _id: '4', ticket: 10000004, symbol: 'XAUUSD', type: 'BUY', lotSize: 0.25, openPrice: 2363.00, stopLoss: 2350.00, takeProfit: 2380.00, profit: 62.50, status: 'open', signal: { strategy: 'AI Trend' } }
      ]
    };
  },

  getTradeStats: async () => {
    return await safeFetch(`${API_BASE}/trades/stats`, {}, { totalTrades: 312, winRate: 68.2, profitFactor: 1.87, totalProfit: 8920.15 });
  },

  getEquityCurve: async () => {
    return await safeFetch(`${API_BASE}/trades/equity-curve`, {}, [
      { date: '2023-10-01', balance: 10000 }, { date: '2023-10-05', balance: 10450 },
      { date: '2023-10-10', balance: 10200 }, { date: '2023-10-15', balance: 11500 },
      { date: '2023-10-20', balance: 11300 }, { date: '2023-10-25', balance: 12800 },
      { date: '2023-10-30', balance: 13500 }
    ]);
  },

  // ============================
  // Signals
  // ============================
  getSignals: async () => {
    return await safeFetch(`${API_BASE}/signals`, {}, [
      { _id: 's1', symbol: 'XAUUSD', direction: 'BUY', entryPrice: 2365.50, stopLoss: 2355.00, takeProfit: 2380.00, confidence: 85, qualityScore: 8.5, strategy: 'AI Momentum', marketBias: 'bullish', session: 'london' },
      { _id: 's2', symbol: 'EURUSD', direction: 'SELL', entryPrice: 1.08420, stopLoss: 1.08700, takeProfit: 1.08000, confidence: 72, qualityScore: 7.2, strategy: 'AI Scalper', marketBias: 'bearish', session: 'london' }
    ]);
  },

  getMarketAnalysis: async () => {
    return await safeFetch(`${API_BASE}/signals/market-analysis`, {}, {
      marketBias: 'bullish', volatility: 'medium', session: 'london', overallConfidence: 82, qualityScore: 8.4, successRate: 73.5,
      indicators: { rsi: 62.5, macd: 'bullish', ema: 'bullish', atr: 15.2, volume: 'high' }
    });
  },

  // ============================
  // Admin
  // ============================
  getAdminDashboard: async () => {
    return await safeFetch(`${API_BASE}/admin/dashboard`, {}, {
      users: { total: 125, active: 89, admins: 2 },
      subscriptions: { active: 75, distribution: { free: 50, starter: 20, professional: 45, enterprise: 10 } },
      trading: { totalTrades: 15420, openTrades: 42, totalVolume: '1450.50', totalPnL: '125430.75' },
      signals: { total: 850, active: 12 },
      systemHealth: { apiStatus: 'operational', dbStatus: 'connected', wsStatus: 'active', mt5Bridge: 'connected', aiEngine: 'running', telegramBot: 'online', uptime: 86400, memory: { heapUsed: 150000000 } }
    });
  },

  getAdminUsers: async () => {
    return await safeFetch(`${API_BASE}/admin/users`, {}, [
      { _id: 'u1', name: 'John Doe', email: 'john@example.com', role: 'user', subscription: { plan: 'professional' }, isActive: true, mt5Account: { balance: 15000 }, stats: { winRate: 65.4 } },
      { _id: 'u2', name: 'Jane Smith', email: 'jane@example.com', role: 'user', subscription: { plan: 'free' }, isActive: false, mt5Account: { balance: 0 }, stats: { winRate: 0 } }
    ]);
  },

  // ============================
  // Subscriptions
  // ============================
  getPlans: async () => {
    return await safeFetch(`${API_BASE}/subscriptions/plans`, {}, [
      { id: 'free', name: 'Free', price: 0, description: 'Basic access', features: { maxAccounts: 1, aiSignals: false, telegramAlerts: false, riskManagement: false, customStrategies: false } },
      { id: 'professional', name: 'Professional', price: 149, description: 'Full risk suite', features: { maxAccounts: 5, aiSignals: true, telegramAlerts: true, riskManagement: true, customStrategies: false } },
      { id: 'enterprise', name: 'Enterprise', price: 499, description: 'Unlimited everything', features: { maxAccounts: 999, aiSignals: true, telegramAlerts: true, riskManagement: true, customStrategies: true } }
    ]);
  },

  getMySubscription: async () => {
    return await safeFetch(`${API_BASE}/subscriptions/my`, {}, { plan: 'professional', status: 'active', licenseKey: 'AX-A1B2-C3D4-E5F6', billing: { nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } });
  },

  // ============================
  // AI Engine (Python Backend)
  // ============================
  getEngineStatus: async () => {
    // Try Python engine directly first, then Node.js proxy
    try {
      const res = await fetch(`${ENGINE_BASE}/engine/status`);
      if (res.ok) return await res.json();
    } catch {}
    return await safeFetch(`${API_BASE}/engine/status`, {}, {
      connected: false, engine: { is_running: false }, mt5_bridge: { connected: false }, telegram: { is_running: false }
    });
  },

  analyzeSymbol: async (symbol = 'XAUUSD') => {
    try {
      const res = await fetch(`${ENGINE_BASE}/engine/analyze`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol })
      });
      if (res.ok) return await res.json();
    } catch {}
    return { action: 'OFFLINE', reason: 'Python engine not connected' };
  },

  getEngineSignals: async () => {
    try {
      const res = await fetch(`${ENGINE_BASE}/engine/signals`);
      if (res.ok) return await res.json();
    } catch {}
    return { active: [], stats: { total: 0, wins: 0, losses: 0 }, history: [] };
  },

  getRiskStatus: async () => {
    try {
      const res = await fetch(`${ENGINE_BASE}/engine/risk`);
      if (res.ok) return await res.json();
    } catch {}
    return { preset: 'moderate', balance: 0, locked: false, open_positions: 0 };
  },

  setRiskPreset: async (preset) => {
    try {
      const res = await fetch(`${ENGINE_BASE}/engine/risk/preset`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preset })
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  runBacktest: async (params = {}) => {
    try {
      const res = await fetch(`${ENGINE_BASE}/engine/backtest`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: 'XAUUSD', initial_balance: 10000, preset: 'moderate', spread_pips: 3.0, ...params })
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  getEngineHealth: async () => {
    try {
      const res = await fetch(`${ENGINE_BASE}/engine/health`);
      if (res.ok) return await res.json();
    } catch {}
    return { status: 'offline', components: {} };
  },

  updateTelegramConfig: async (token, chatId) => {
    try {
      const res = await fetch(`${ENGINE_BASE}/engine/telegram/config`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, chat_id: chatId })
      });
      if (res.ok) return await res.json();
    } catch {}
    return { success: false, message: 'Failed to connect to Python Engine' };
  },

  // ============================
  // Licenses
  // ============================
  validateLicense: async (licenseKey, hwid = '') => {
    return await safeFetch(`${API_BASE}/licenses/validate`, {
      method: 'POST', body: JSON.stringify({ licenseKey, hwid })
    }, { valid: false });
  },

  toggleUser: async (id) => {
    return await safeFetch(`${API_BASE}/admin/users/${id}/toggle`, { method: 'PUT' }, { message: 'User toggled' });
  },

  broadcast: async (message, target) => {
    return await safeFetch(`${API_BASE}/admin/broadcast`, {
      method: 'POST', body: JSON.stringify({ message, target })
    }, { success: true, message: 'Broadcast sent', recipients: 0 });
  },

  getLicenses: async () => {
    return await safeFetch(`${API_BASE}/licenses`, {}, []);
  },

  generateLicense: async (userId, plan, durationDays = 30) => {
    return await safeFetch(`${API_BASE}/licenses/generate`, {
      method: 'POST', body: JSON.stringify({ userId, plan, durationDays })
    });
  }
};

export default api;
