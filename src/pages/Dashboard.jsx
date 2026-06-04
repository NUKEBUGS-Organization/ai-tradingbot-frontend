import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ForexChartDashboard from '../components/tradingview/ForexChartDashboard';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../services/websocket';
import api from '../services/api';
import { pickMt5LiveAccount, isSimulatedWsAccount, isMockDemoBalance } from '../utils/tradeMetrics';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Activity, Target, BarChart3, Wifi, WifiOff, Zap, Shield, MessageCircle } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { prices, account, connected } = useWebSocket();
  const [stats, setStats] = useState(null);
  const [trades, setTrades] = useState([]);
  const [equityCurve, setEquityCurve] = useState([]);
  const [closedTrades, setClosedTrades] = useState([]);
  const [equityPeriod, setEquityPeriod] = useState('ALL');
  const [tab, setTab] = useState('open');
  const [engineStatus, setEngineStatus] = useState(null);
  useEffect(() => {
    loadData();
    const pollMt5 = async () => {
      try {
        const eng = await api.getEngineStatus();
        setEngineStatus(eng);
      } catch (_) { /* ignore */ }
    };
    pollMt5();
    const id = setInterval(pollMt5, 15000);
    return () => clearInterval(id);
  }, []);

  const loadData = async () => {
    try {
      const [s, t, o, e] = await Promise.all([
        api.getTradeStats(), api.getTrades('status=open&limit=10'),
        api.getTrades('status=closed&limit=20'), api.getEquityCurve()
      ]);
      setStats(s);
      setTrades({ open: t.trades, closed: o.trades });
      setClosedTrades(o.trades || []);
      setEquityCurve(e);
    } catch (err) { console.error(err); }
  };

  const wsAccount = !isSimulatedWsAccount(account) && account?.source === 'mt5' ? account : null;
  const liveMt5 = pickMt5LiveAccount(engineStatus, wsAccount);
  const bal =
    liveMt5?.balance != null && Number(liveMt5.balance) > 0 && !isMockDemoBalance(liveMt5.balance)
      ? Number(liveMt5.balance)
      : null;
  const eq =
    liveMt5?.equity != null && Number(liveMt5.equity) > 0 && !isMockDemoBalance(liveMt5.equity)
      ? Number(liveMt5.equity)
      : null;
  const dailyPnl = liveMt5?.dailyPnl != null ? Number(liveMt5.dailyPnl) : null;
  const hasLiveMt5Account = bal != null && eq != null;
  const fmtMoney = (n) =>
    n == null ? '—' : `$${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  const periodMs = { '1D': 86400000, '1W': 7 * 86400000, '1M': 30 * 86400000 };
  const filteredCurve = equityPeriod === 'ALL'
    ? equityCurve
    : equityCurve.filter((pt) => {
        const t = new Date(pt.date).getTime();
        return t >= Date.now() - periodMs[equityPeriod];
      });

  const tradeStats = (() => {
    const closed = closedTrades || [];
    if (!closed.length) return null;
    const profits = closed.map((t) => t.profit ?? 0);
    const best = Math.max(...profits);
    const worst = Math.min(...profits);
    const avg = profits.reduce((a, b) => a + b, 0) / profits.length;
    let maxWinStreak = 0;
    let maxLossStreak = 0;
    let winStreak = 0;
    let lossStreak = 0;
    const sorted = [...closed].sort(
      (a, b) => new Date(a.closedAt || a.closeTime || a.createdAt) - new Date(b.closedAt || b.closeTime || b.createdAt)
    );
    sorted.forEach((t) => {
      if ((t.profit ?? 0) > 0) {
        winStreak += 1;
        lossStreak = 0;
        maxWinStreak = Math.max(maxWinStreak, winStreak);
      } else {
        lossStreak += 1;
        winStreak = 0;
        maxLossStreak = Math.max(maxLossStreak, lossStreak);
      }
    });
    return { best, worst, avg, maxWinStreak, maxLossStreak };
  })();

  const COLORS = ['#3fb950', '#f85149', '#d4af37'];
  const pieData = stats ? [
    { name: 'Wins', value: parseFloat(stats.winRate) || 0 },
    { name: 'Losses', value: 100 - (parseFloat(stats.winRate) || 0) }
  ] : [];

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Header title="Trading Dashboard" />
        <div className="page-content">
          {/* Stats Row */}
          <div className="stats-grid dashboard-stats-grid">
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Balance</span>
                <div className="stat-card-icon gold"><DollarSign size={16} /></div>
              </div>
              <div className="stat-card-value">{fmtMoney(bal)}</div>
              <div className={`stat-card-change ${hasLiveMt5Account ? 'up' : ''}`}>
                {hasLiveMt5Account ? 'MT5 Account' : 'Awaiting MT5 account sync'}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Equity</span>
                <div className="stat-card-icon blue"><Activity size={16} /></div>
              </div>
              <div className="stat-card-value">{fmtMoney(eq)}</div>
              <div className={`stat-card-change ${hasLiveMt5Account && eq >= bal ? 'up' : hasLiveMt5Account ? 'down' : ''}`}>
                {hasLiveMt5Account ? (
                  <>
                    {eq >= bal ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {bal > 0 ? `${(((eq - bal) / bal) * 100).toFixed(2)}%` : '—'}
                  </>
                ) : (
                  '—'
                )}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Daily P&L</span>
                <div className={`stat-card-icon ${dailyPnl >= 0 ? 'green' : 'red'}`}>
                  {dailyPnl >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                </div>
              </div>
              <div className={`stat-card-value ${dailyPnl != null && dailyPnl >= 0 ? 'positive' : dailyPnl != null ? 'negative' : ''}`}>
                {dailyPnl != null ? `${dailyPnl >= 0 ? '+' : ''}$${dailyPnl.toFixed(2)}` : '—'}
              </div>
              <div className={`stat-card-change ${dailyPnl != null && dailyPnl >= 0 ? 'up' : dailyPnl != null ? 'down' : ''}`}>
                {hasLiveMt5Account ? 'Today' : '—'}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Win Rate</span>
                <div className="stat-card-icon green"><Target size={16} /></div>
              </div>
              <div className="stat-card-value">{stats?.winRate || user?.stats?.winRate || 0}%</div>
              <div className="stat-card-change up">{stats?.totalTrades || 0} trades</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Profit Factor</span>
                <div className="stat-card-icon purple"><BarChart3 size={16} /></div>
              </div>
              <div className="stat-card-value">{stats?.profitFactor || user?.stats?.profitFactor || 0}</div>
              <div className="stat-card-change up">Ratio</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Max Drawdown</span>
                <div className="stat-card-icon red"><Shield size={16} /></div>
              </div>
              <div className="stat-card-value negative">{user?.stats?.maxDrawdown || 0}%</div>
              <div className="stat-card-change down">Peak to trough</div>
            </div>
          </div>

          <div className="live-chart-body dashboard-chart" style={{ marginBottom: 24 }}>
            <ForexChartDashboard />
          </div>

          {/* Charts Row */}
          <div className="grid-2-1 dashboard-bottom-grid">
            <div className="card">
              <div className="card-header">
                <span className="card-title"><Activity size={16} /> Equity Curve</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['1D', '1W', '1M', 'ALL'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setEquityPeriod(p)}
                      className={`btn ${equityPeriod === p ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontSize: 10, padding: '3px 8px' }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="card-body">
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={filteredCurve.length ? filteredCurve : equityCurve}>
                      <defs>
                        <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                      <XAxis dataKey="date" stroke="#545d68" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#545d68" tick={{ fontSize: 10 }} tickFormatter={v => `$${(v/1000).toFixed(1)}k`} />
                      <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 8, fontSize: 12 }} />
                      <Area type="monotone" dataKey="balance" stroke="#d4af37" strokeWidth={2} fill="url(#eqGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                {tradeStats && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                      gap: 12,
                      marginTop: 16,
                      paddingTop: 16,
                      borderTop: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 10, color: '#545d68' }}>Best Trade</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#3fb950' }}>+${tradeStats.best.toFixed(2)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: '#545d68' }}>Worst Trade</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#f85149' }}>${tradeStats.worst.toFixed(2)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: '#545d68' }}>Avg Trade</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#d4af37' }}>${tradeStats.avg.toFixed(2)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: '#545d68' }}>Max Win Streak</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#3fb950' }}>{tradeStats.maxWinStreak}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: '#545d68' }}>Max Loss Streak</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#f85149' }}>{tradeStats.maxLossStreak}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="card">
              <div className="card-header">
                <span className="card-title"><Target size={16} /> Win/Loss Ratio</span>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" stroke="none">
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', gap: 24, marginTop: 8 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#3fb950', fontFamily: 'var(--font-mono)' }}>{stats?.winRate || 0}%</div>
                    <div style={{ fontSize: 10, color: '#545d68' }}>WIN RATE</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#d4af37', fontFamily: 'var(--font-mono)' }}>{stats?.totalTrades || 0}</div>
                    <div style={{ fontSize: 10, color: '#545d68' }}>TOTAL</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Connection Status */}
          <div className="stats-grid dashboard-connection-grid">
            <div className="stat-card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className={`status-dot ${user?.mt5Account?.connected ? 'online' : 'offline'}`}></span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>MT5 Connection</div>
                  <div style={{ fontSize: 10, color: '#545d68' }}>{user?.mt5Account?.server || 'N/A'} • {user?.mt5Account?.accountId || 'N/A'}</div>
                </div>
                {user?.mt5Account?.connected ? <Wifi size={16} style={{ marginLeft: 'auto', color: '#3fb950' }} /> : <WifiOff size={16} style={{ marginLeft: 'auto', color: '#f85149' }} />}
              </div>
            </div>
            <div className="stat-card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className={`status-dot ${connected ? 'online' : 'offline'}`}></span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>AI Signal Engine</div>
                  <div style={{ fontSize: 10, color: '#545d68' }}>Real-time monitoring active</div>
                </div>
                <Zap size={16} style={{ marginLeft: 'auto', color: connected ? '#d4af37' : '#545d68' }} />
              </div>
            </div>
            <div className="stat-card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className={`status-dot ${user?.telegram?.connected ? 'online' : 'offline'}`}></span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>Telegram Bot</div>
                  <div style={{ fontSize: 10, color: '#545d68' }}>{user?.telegram?.connected ? 'Alerts active' : 'Not connected'}</div>
                </div>
                <MessageCircle size={16} style={{ marginLeft: 'auto', color: user?.telegram?.connected ? '#58a6ff' : '#545d68' }} />
              </div>
            </div>
          </div>

          {/* Trades Table */}
          <div className="card">
            <div className="card-header">
              <span className="card-title"><BarChart3 size={16} /> Positions</span>
              <div className="tabs" style={{ margin: 0, width: 'auto' }}>
                <button className={`tab ${tab === 'open' ? 'active' : ''}`} onClick={() => setTab('open')}>Open ({trades?.open?.length || 0})</button>
                <button className={`tab ${tab === 'closed' ? 'active' : ''}`} onClick={() => setTab('closed')}>History</button>
              </div>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-container overflow-table-wrapper table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Ticket</th><th>Symbol</th><th>Type</th><th>Lots</th>
                      <th>Open Price</th>{tab === 'closed' && <th>Close Price</th>}
                      <th>SL</th><th>TP</th><th>Profit</th><th>Strategy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(trades?.[tab] || []).map(t => (
                      <tr key={t._id}>
                        <td style={{ color: '#8b949e' }}>{t.ticket || t._id?.slice(-6)}</td>
                        <td style={{ color: '#e6edf3', fontWeight: 600 }}>{t.symbol}</td>
                        <td><span className={`badge ${t.type === 'BUY' ? 'badge-green' : 'badge-red'}`}>{t.type}</span></td>
                        <td>{t.lotSize ?? '—'}</td>
                        <td>{t.entry ?? '—'}</td>
                        {tab === 'closed' && <td>{t.closePrice ?? '—'}</td>}
                        <td style={{ color: '#f85149' }}>{t.sl ?? '—'}</td>
                        <td style={{ color: '#3fb950' }}>{t.tp ?? '—'}</td>
                        <td style={{ color: (t.profit ?? 0) >= 0 ? '#3fb950' : '#f85149', fontWeight: 700 }}>
                          {(t.profit ?? 0) >= 0 ? '+' : ''}{(t.profit ?? 0).toFixed(2)}
                        </td>
                        <td><span className="badge badge-gold">{t.amdPhase || t.grade || 'AMD'}</span></td>
                      </tr>
                    ))}
                    {(trades?.[tab] || []).length === 0 && (
                      <tr><td colSpan={tab === 'closed' ? 10 : 9} style={{ textAlign: 'center', padding: 40, color: '#545d68' }}>No positions found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
