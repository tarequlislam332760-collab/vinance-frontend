import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { RefreshCw, Loader2, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';

const API = "https://vinance-backend-1.onrender.com";

const STATUS_STYLE = {
  filled:    { bg: 'rgba(14,203,129,.12)',  color: '#0ecb81' },
  completed: { bg: 'rgba(14,203,129,.12)',  color: '#0ecb81' },
  pending:   { bg: 'rgba(240,185,11,.12)', color: '#f0b90b' },
  cancelled: { bg: 'rgba(246,70,93,.12)',  color: '#f6465d' },
  rejected:  { bg: 'rgba(246,70,93,.12)',  color: '#f6465d' },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLE[status] || { bg: 'rgba(132,142,156,.1)', color: '#848e9c' };
  return (
    <span style={{ background: s.bg, color: s.color, padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>
      {status}
    </span>
  );
};

const OrderHistory = ({ symbol, type = 'spot' }) => {
  const { token } = useContext(UserContext);
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');

  const fetch = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const endpoint = type === 'futures'
        ? `${API}/api/futures/history`
        : `${API}/api/trade/history`;

      const res  = await axios.get(endpoint, { headers: { Authorization: `Bearer ${token}` } });
      let data   = Array.isArray(res.data) ? res.data : [];
      if (symbol) {
        const sym = symbol.toUpperCase();
        data = data.filter(o => o.symbol?.includes(sym));
      }
      setOrders(data);
    } catch { setOrders([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [token, symbol, type]);

  const filtered = filter === 'all' ? orders : orders.filter(o => (o.status || 'filled') === filter);

  return (
    <div style={{ background: '#161a1e', borderRadius: 12, overflow: 'hidden', border: '1px solid #1e2329' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid #1e2329', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#eaecef' }}>
          {type === 'futures' ? 'Futures' : 'Spot'} Order History
        </span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {['all', 'filled', 'pending', 'cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '3px 10px', border: `1px solid ${filter === f ? '#f0b90b' : '#2b3139'}`, borderRadius: 20, background: filter === f ? 'rgba(240,185,11,.1)' : 'transparent', color: filter === f ? '#f0b90b' : '#848e9c', fontSize: 11, cursor: 'pointer', textTransform: 'capitalize', fontFamily: 'inherit' }}>
              {f}
            </button>
          ))}
          <button onClick={fetch} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#848e9c' }}>
            <RefreshCw size={13} style={loading ? { animation: 'spin .8s linear infinite' } : {}} />
          </button>
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Column headers */}
      <div style={{ display: 'grid', gridTemplateColumns: type === 'futures' ? '1fr 1fr 1fr 1fr 1fr 1fr' : '1fr 1fr 1fr 1fr 1fr', padding: '7px 16px', background: '#0b0e11', fontSize: 10, fontWeight: 700, color: '#5e6673', textTransform: 'uppercase', letterSpacing: '.04em' }}>
        <span>Symbol</span>
        <span>Side</span>
        <span>Price</span>
        <span>Amount</span>
        {type === 'futures' && <span>Leverage</span>}
        <span style={{ textAlign: 'right' }}>Status</span>
      </div>

      <div style={{ maxHeight: 300, overflowY: 'auto' }}>
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
            <Loader2 size={20} style={{ color: '#f0b90b', animation: 'spin .8s linear infinite' }} />
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 32, color: '#5e6673', gap: 8 }}>
            <FileText size={28} style={{ opacity: .2 }} />
            <span style={{ fontSize: 12 }}>No orders found</span>
          </div>
        )}
        {!loading && filtered.map((o, i) => {
          const isBuy   = (o.side || o.type) === 'buy';
          const colCols = type === 'futures'
            ? '1fr 1fr 1fr 1fr 1fr 1fr'
            : '1fr 1fr 1fr 1fr 1fr';
          return (
            <div key={o._id || i} style={{ display: 'grid', gridTemplateColumns: colCols, padding: '9px 16px', borderBottom: '1px solid #1e232940', fontSize: 12, alignItems: 'center' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.02)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span style={{ color: '#eaecef', fontWeight: 600 }}>{o.symbol || '-'}</span>
              <span style={{ color: isBuy ? '#0ecb81' : '#f6465d', fontWeight: 700 }}>
                {isBuy ? 'Buy/Long' : 'Sell/Short'}
              </span>
              <span style={{ color: '#eaecef', fontFamily: 'monospace' }}>
                ${parseFloat(o.price || o.entryPrice || 0).toLocaleString()}
              </span>
              <span style={{ color: '#eaecef', fontFamily: 'monospace' }}>
                ${parseFloat(o.amount || o.total || 0).toFixed(2)}
              </span>
              {type === 'futures' && (
                <span style={{ color: '#f0b90b', fontWeight: 700 }}>{o.leverage || 1}x</span>
              )}
              <div style={{ textAlign: 'right' }}>
                <StatusBadge status={o.status || 'filled'} />
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length > 0 && (
        <div style={{ padding: '8px 16px', borderTop: '1px solid #1e2329', fontSize: 11, color: '#5e6673', textAlign: 'right' }}>
          {filtered.length} order{filtered.length !== 1 ? 's' : ''} total
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
