import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import SignalDetailModal from '../components/SignalDetailModal';
import { GradeBadge, SessionBadge } from '../components/signalBadges';
import MaskedSignalValue, { isSignalMasked } from '../components/MaskedSignalValue';
import api from '../services/api';
import { History, Filter } from 'lucide-react';
import {
  isSignalWin,
  isSignalLoss,
  isSignalClosed,
  outcomeLabel,
  outcomeBadgeClass,
  normalizeSignalStatus,
} from '../utils/signalOutcome';

export default function SignalHistory() {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [symbolFilter, setSymbolFilter] = useState('ALL');
  const [directionFilter, setDirectionFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedSignal, setSelectedSignal] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await api.getSignalHistory();
        setSignals(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    return signals.filter((s) => {
      if (symbolFilter !== 'ALL' && s.symbol !== symbolFilter) return false;
      if (directionFilter !== 'ALL' && s.direction !== directionFilter) return false;
      if (statusFilter !== 'ALL') {
        const st = normalizeSignalStatus(s.status);
        const want = normalizeSignalStatus(statusFilter);
        if (statusFilter === 'win' && !isSignalWin(s)) return false;
        else if (statusFilter === 'loss' && !isSignalLoss(s)) return false;
        else if (statusFilter !== 'win' && statusFilter !== 'loss' && st !== want && s.status !== statusFilter) return false;
      }
      return true;
    });
  }, [signals, symbolFilter, directionFilter, statusFilter]);

  const stats = useMemo(() => {
    const closed = filtered.filter(isSignalClosed);
    const wins = filtered.filter(isSignalWin);
    const confSum = filtered.reduce((a, s) => a + (s.confidence || 0), 0);
    const sessions = {};
    filtered.forEach((s) => {
      const sess = s.session || 'unknown';
      sessions[sess] = (sessions[sess] || 0) + 1;
    });
    const topSession = Object.entries(sessions).sort((a, b) => b[1] - a[1])[0];
    return {
      total: filtered.length,
      winRate: closed.length ? ((wins.length / closed.length) * 100).toFixed(1) : '0',
      avgConfidence: filtered.length ? (confSum / filtered.length).toFixed(1) : '0',
      topSession: topSession ? `${topSession[0]} (${topSession[1]})` : '—',
    };
  }, [filtered]);

  const symbols = ['ALL', ...new Set(signals.map((s) => s.symbol).filter(Boolean))];

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Header title="Signal History" />
        <div className="page-content">
          <div className="stats-grid signal-stats-4">
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Total Signals</span>
                <div className="stat-card-icon gold"><History size={16} /></div>
              </div>
              <div className="stat-card-value">{stats.total}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Win Rate</span>
                <div className="stat-card-icon green"><Filter size={16} /></div>
              </div>
              <div className="stat-card-value">{stats.winRate}%</div>
              <div className="stat-card-change">Closed signals only</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Avg Confidence</span>
                <div className="stat-card-icon blue"><History size={16} /></div>
              </div>
              <div className="stat-card-value">{stats.avgConfidence}%</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Top Session</span>
                <div className="stat-card-icon purple"><History size={16} /></div>
              </div>
              <div className="stat-card-value" style={{ fontSize: 16, textTransform: 'capitalize' }}>
                {stats.topSession}
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: 20 }}>
            <div className="card-header">
              <span className="card-title">Filters</span>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <select
                  value={symbolFilter}
                  onChange={(e) => setSymbolFilter(e.target.value)}
                  style={{ background: '#161b22', border: '1px solid #21262d', color: '#e6edf3', padding: '4px 8px', borderRadius: 6, fontSize: 12 }}
                >
                  {symbols.map((sym) => (
                    <option key={sym} value={sym}>{sym}</option>
                  ))}
                </select>
                <select
                  value={directionFilter}
                  onChange={(e) => setDirectionFilter(e.target.value)}
                  style={{ background: '#161b22', border: '1px solid #21262d', color: '#e6edf3', padding: '4px 8px', borderRadius: 6, fontSize: 12 }}
                >
                  {['ALL', 'BUY', 'SELL'].map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ background: '#161b22', border: '1px solid #21262d', color: '#e6edf3', padding: '4px 8px', borderRadius: 6, fontSize: 12 }}
                >
                  {['ALL', 'active', 'win', 'loss', 'executed', 'expired', 'cancelled'].map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th><th>Symbol</th><th>Dir</th><th>Entry</th><th>SL</th><th>TP</th>
                      <th>Conf</th><th>Grade</th><th>Session</th><th>Outcome</th><th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s) => (
                      <tr key={s._id || s.id} onClick={() => setSelectedSignal(s)} style={{ cursor: 'pointer' }}>
                        <td style={{ fontSize: 10, color: '#545d68' }}>{String(s._id || s.id || '').slice(-6) || '—'}</td>
                        <td style={{ fontWeight: 600 }}>{s.symbol}</td>
                        <td>
                          <span className={`badge ${s.direction === 'BUY' ? 'badge-green' : 'badge-red'}`}>{s.direction}</span>
                        </td>
                        <td><MaskedSignalValue signal={s} value={s.entryPrice ?? s.entry} /></td>
                        <td style={{ color: '#f85149' }}><MaskedSignalValue signal={s} value={s.stopLoss ?? s.sl} color="#f85149" /></td>
                        <td style={{ color: '#3fb950' }}><MaskedSignalValue signal={s} value={s.takeProfit ?? s.tp} color="#3fb950" /></td>
                        <td>{isSignalMasked(s) ? <MaskedSignalValue signal={s} value={s.confidence} /> : `${s.confidence}%`}</td>
                        <td>{isSignalMasked(s) ? <MaskedSignalValue signal={s} value={s.grade} /> : <GradeBadge grade={s.grade} />}</td>
                        <td><SessionBadge session={s.session} /></td>
                        <td>
                          <span className={`badge ${outcomeBadgeClass(s.status)}`}>
                            {outcomeLabel(s.status)}
                          </span>
                        </td>
                        <td style={{ fontSize: 11, color: '#8b949e' }}>
                          {s.createdAt || s.timestamp ? new Date(s.createdAt || s.timestamp).toLocaleString() : '—'}
                        </td>
                      </tr>
                    ))}
                    {!loading && filtered.length === 0 && (
                      <tr>
                        <td colSpan={11} style={{ textAlign: 'center', padding: 40, color: '#545d68' }}>
                          No signals match filters
                        </td>
                      </tr>
                    )}
                    {loading && (
                      <tr>
                        <td colSpan={11} style={{ textAlign: 'center', padding: 40, color: '#545d68' }}>
                          Loading...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <SignalDetailModal signal={selectedSignal} onClose={() => setSelectedSignal(null)} />
      </main>
    </div>
  );
}
