import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { RefreshCw, TrendingUp, TrendingDown, Loader2, FileText } from 'lucide-react';

const API = "https://vinance-backend-1.onrender.com";

const TradeHistory = ({ symbol }) => {
  const { token } = useContext(UserContext);
  const [trades,  setTrades]  = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/trade/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data) ? res.data : [];
      setTrades(symbol ? data.filter(t => t.symbol === symbol.toUpperCase() + 'USDT' || t.symbol === symbol.toUpperCase()) : data);
    } catch { setTrades([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [token, symbol]);

  return (
    <div style={{ background: '#161a1e', borderRadius: 12, overflow: 'hidden', border: '1px solid #1e2329' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #1e2329' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#eaecef' }}>Trade History</span>
        <button onClick={fetch} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#848e9c', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
          <RefreshCw size={13} style={loading ? { animation: 'spin .8s linear infinite' } : {}} /> Refresh
        </button>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Column headers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', padding: '8px 16px', background: '#0b0e11', fontSize: 10, fontWeight: 700, color: '#5e6673', textTransform: 'uppercase', letterSpacing: '.04em' }}>
        <span>Pair</span><span>Side</span><span>Price</span><span>Amount</span><span style={{ textAlign: 'right' }}>Time</span>
      </div>

      <div style={{ maxHeight: 280, overflowY: 'auto' }}>
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
            <Loader2 size={20} style={{ color: '#f0b90b', animation: 'spin .8s linear infinite' }} />
          </div>
        )}
        {!loading && trades.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 32, color: '#5e6673', gap: 8 }}>
            <FileText size={28} style={{ opacity: .2 }} />
            <span style={{ fontSize: 12 }}>No trade history</span>
          </div>
        )}
        {!loading && trades.map((t, i) => {
          const isBuy = t.side === 'buy';
          const date  = new Date(t.createdAt);
          return (
            <div key={t._id || i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', padding: '9px 16px', borderBottom: '1px solid #1e232940', fontSize: 12, alignItems: 'center', transition: 'background .1s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.02)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span style={{ color: '#eaecef', fontWeight: 600 }}>{t.symbol || 'USDT'}</span>
              <span style={{ color: isBuy ? '#0ecb81' : '#f6465d', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                {isBuy ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {isBuy ? 'Buy' : 'Sell'}
              </span>
              <span style={{ color: '#eaecef', fontFamily: 'monospace' }}>${parseFloat(t.price || 0).toLocaleString()}</span>
              <span style={{ color: '#eaecef', fontFamily: 'monospace' }}>${parseFloat(t.amount || 0).toFixed(2)}</span>
              <span style={{ color: '#848e9c', textAlign: 'right', fontSize: 11 }}>
                {isNaN(date) ? '-' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TradeHistory;
