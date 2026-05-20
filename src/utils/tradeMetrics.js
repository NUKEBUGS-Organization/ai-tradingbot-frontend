/** Client-side helpers — no HTTP; data comes from GET /api/trades and GET /api/signals only. */

export function computeTradeStats(closedTrades, openTrades, userStats) {
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

export function buildEquityCurveFromTrades(closedTrades, startBalance = 10000) {
  const sorted = [...(closedTrades || [])].sort(
    (a, b) => new Date(a.closeTime || a.createdAt) - new Date(b.closeTime || b.createdAt)
  );
  let balance = startBalance;
  const curve = [
    { date: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0], balance: startBalance },
  ];
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

export function buildMarketAnalysisFromSignals(signals) {
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
    indicators: latest?.indicators || {
      rsi: 50,
      macd: 'neutral',
      ema: 'neutral',
      atr: 15.5,
      volume: 'normal',
    },
    activeBuySignals: activeBuy,
    activeSellSignals: activeSell,
    totalExecuted: list.filter((s) => s.status === 'executed').length,
    successRate: 73.5,
  };
}

export function normalizeSignalsList(data) {
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

function normalizeLiveAccount(acc) {
  if (!acc || (acc.balance == null && acc.equity == null)) return null;
  const balance = Number(acc.balance) || 0;
  const equity = Number(acc.equity) || balance;
  return {
    balance,
    equity,
    margin: Number(acc.margin) || 0,
    freeMargin: Number(acc.freeMargin ?? acc.free_margin) || 0,
    marginLevel: Number(acc.marginLevel ?? acc.margin_level) || 0,
    openPositions: Number(acc.openPositions ?? acc.open_positions) || 0,
    dailyPnl: Number(acc.dailyPnl ?? acc.daily_pnl ?? equity - balance) || 0,
  };
}

const MOCK_DEMO_BALANCE = 52430.8;

function isSimulatedWsAccount(wsAccount) {
  if (!wsAccount) return true;
  if (wsAccount.source === 'simulation') return true;
  if (wsAccount.source !== 'mt5') {
    const b = Number(wsAccount.balance);
    if (Math.abs(b - MOCK_DEMO_BALANCE) < 1) return true;
  }
  return false;
}

/** Prefer engine/MT5 bridge over WebSocket; ignore demo/simulated WS account updates. */
export function pickMt5LiveAccount(engineStatus, wsAccount) {
  const fromTop = normalizeLiveAccount(engineStatus?.mt5_account);
  if (fromTop && (fromTop.balance > 0 || fromTop.equity > 0)) return fromTop;
  const fromBridge = normalizeLiveAccount(engineStatus?.mt5_bridge?.account);
  if (fromBridge && (fromBridge.balance > 0 || fromBridge.equity > 0)) return fromBridge;

  if (!isSimulatedWsAccount(wsAccount)) {
    const fromWs = normalizeLiveAccount(wsAccount);
    if (fromWs && (fromWs.balance > 0 || fromWs.equity > 0)) return fromWs;
  }

  const risk = engineStatus?.engine?.risk;
  if (risk?.balance != null && risk.balance > 0) {
    return normalizeLiveAccount({
      balance: risk.balance,
      equity: risk.balance,
      daily_pnl: risk.daily_pnl,
      open_positions: risk.open_positions,
    });
  }
  return null;
}

export function mapRiskSettingsForUi(riskSettings, profile, liveAccount = null) {
  const rs = riskSettings || {};
  const maxRisk = rs.maxRiskPerTrade ?? 2;
  const live = liveAccount || {};
  const balance = live.balance ?? profile?.mt5Account?.balance ?? 0;
  const equity = live.equity ?? profile?.mt5Account?.equity ?? balance;
  const dailyPnl =
    live.dailyPnl ??
    live.daily_pnl ??
    profile?.stats?.dailyPnl ??
    (equity && balance ? equity - balance : 0);
  const openPositions = live.openPositions ?? live.open_positions ?? 0;
  const drawdownPct =
    live.marginLevel != null && live.marginLevel > 0
      ? 0
      : balance > 0 && dailyPnl < 0
        ? (Math.abs(dailyPnl) / balance) * 100
        : 0;

  return {
    preset: maxRisk <= 1 ? 'conservative' : maxRisk <= 3 ? 'moderate' : 'aggressive',
    locked: false,
    balance,
    equity,
    daily_pnl: dailyPnl,
    open_positions: openPositions,
    max_positions: rs.maxOpenPositions ?? 5,
    risk_percent: maxRisk,
    daily_drawdown_pct: drawdownPct,
    settings: rs,
    fromMt5: !!(live.balance > 0),
  };
}
