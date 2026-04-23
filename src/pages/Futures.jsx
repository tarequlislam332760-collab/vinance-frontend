import React, { useState, useContext, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import axios from 'axios';
import {
  ChevronDown, MoreHorizontal, Settings, Plus, Minus,
  Activity, RefreshCw, TrendingUp, TrendingDown,
  AlertCircle, Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import OrderBook from "../components/OrderBook";
import LeverageSlider from "../components/LeverageSlider";
import PositionTable from "../components/PositionTable";

/* ─── axios instance ─────────────────────────────────────────────── */
const api = axios.create({
  baseURL: "https://vinance-backend.vercel.app",
  withCredentials: true,
});

/* ─── Responsive Styles ─────────────────────────────────────────── */
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&display=swap');

    .fut-root * { box-sizing: border-box; }
    .fut-root {
      font-family: 'IBM Plex Mono', 'Courier New', monospace;
      background: #0b0e11; color: #848e9c;
      min-height: 100dvh; display: flex; flex-direction: column;
    }

    /* Layout Wrapper */
    .main-layout {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    /* Desktop Adjustments */
    .side-orderbook { width: 160px; flex-shrink: 0; border-right: 1px solid #1e2329; }
    .center-content { flex: 1; display: flex; flexDirection: column; min-width: 0; }
    .side-tradeform { width: 300px; flex-shrink: 0; border-left: 1px solid #1e2329; }

    /* Mobile Responsive Logic */
    @media (max-width: 992px) {
      .main-layout {
        flex-direction: column;
        overflow-y: auto;
      }
      .side-orderbook, .side-tradeform {
        width: 100%;
        border: none;
      }
      .side-orderbook {
        display: flex;
        flex-direction: column;
        height: auto;
        border-bottom: 1px solid #1e2329;
      }
      .side-tradeform {
        order: 2; /* ট্রেড ফর্ম চার্টের নিচে নিয়ে আসার জন্য */
        border-top: 1px solid #1e2329;
      }
      .center-content {
        order: 1;
        flex: none;
      }
      .chart-container {
        height: 300px !important;
        min-height: 300px !important;
      }
    }

    /* Tabs & Cards */
    .pos-tab {
      padding: 10px 0 8px; font-size: 11px; font-weight: 600;
      background: transparent; border: none; border-bottom: 2px solid transparent;
      color: #5e6673; cursor: pointer; font-family: inherit;
      letter-spacing: .03em; transition: color .15s, border-color .15s;
    }
    .pos-tab.active { color: #eaecef; border-bottom-color: #f0b90b; }
    .pos-card {
      background: #1e2329; border-radius: 6px; padding: 10px 12px;
      margin-bottom: 6px; border-left: 3px solid transparent;
    }
    .pos-card.long  { border-left-color: #0ecb81; }
    .pos-card.short { border-left-color: #f6465d; }
    .pnl-pos { color: #0ecb81; background: rgba(14,203,129,.1); padding: 2px 7px; border-radius: 4px; font-size: 10px; font-weight: 700; }
    .pnl-neg { color: #f6465d; background: rgba(246,70,93,.1); padding: 2px 7px; border-radius: 4px; font-size: 10px; font-weight: 700; }
    .spin { animation: spin .8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .fg { animation: flashG .4s ease-out; }
    .fr { animation: flashR .4s ease-out; }
    @keyframes flashG { 0%{background:rgba(14,203,129,.15)} 100%{background:transparent} }
    @keyframes flashR { 0%{background:rgba(246,70,93,.15)} 100%{background:transparent} }
    .close-pos-btn { font-size: 9px; font-weight: 700; padding: 3px 8px; border-radius: 3px; border: 1px solid #f6465d; color: #f6465d; background: transparent; cursor: pointer; }
  `}</style>
);

/* ─── PositionCard ───────────────────────────────────────────────── */
const PositionCard = ({ pos, currentPrice, onClose }) => {
  const isLong  = pos.side === 'buy' || pos.type === 'buy';
  const entry   = parseFloat(pos.entryPrice || pos.entry_price || 0);
  const size    = parseFloat(pos.amount     || pos.size         || 0);
  const lev     = parseFloat(pos.leverage   || 1);
  const mark    = parseFloat(currentPrice   || entry);

  const pnl     = isLong ? (mark - entry) * (size / entry) * lev : (entry - mark) * (size / entry) * lev;
  const pnlPct  = entry > 0 ? ((pnl / size) * 100).toFixed(2) : '0.00';
  const liqPrice = isLong ? (entry * (1 - 1 / lev)).toFixed(2) : (entry * (1 + 1 / lev)).toFixed(2);

  return (
    <div className={`pos-card ${isLong ? 'long' : 'short'}`}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ color: isLong ? '#0ecb81':'#f6465d', fontWeight:700, fontSize:12 }}>{isLong ? '↑ LONG' : '↓ SHORT'}</span>
          <span style={{ background:'#2b3139', color:'#848e9c', fontSize:9, padding:'1px 5px', borderRadius:3 }}>{lev}x</span>
          <span style={{ color:'#eaecef', fontSize:11, fontWeight:600 }}>{(pos.symbol || 'BTC').toUpperCase()}USDT</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span className={pnl >= 0 ? 'pnl-pos' : 'pnl-neg'}>{pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} ({pnlPct}%)</span>
          <button className="close-pos-btn" onClick={() => onClose(pos._id || pos.id)}>Close</button>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:4, fontSize:10 }}>
        {[ ['Size', `${size.toFixed(2)} USDT`], ['Entry', entry.toFixed(2)], ['Mark', mark.toFixed(2)], ['Liq. Price', liqPrice] ].map(([label, val]) => (
          <div key={label}>
            <div style={{ color:'#5e6673', marginBottom:2 }}>{label}</div>
            <div style={{ color:'#c6cad2', fontWeight:600 }}>{val}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Futures = () => {
  const { coinSymbol } = useParams();
  const { user, refreshUser, token } = useContext(UserContext);
  const [leverage, setLeverage] = useState(60);
  const [amount, setAmount] = useState('');
  const [side, setSide] = useState('buy');
  const [loading, setLoading] = useState(false);
  const [currentPrice, setCurrentPrice] = useState('0.0');
  const [priceUp, setPriceUp] = useState(true);
  const [flashCls, setFlashCls] = useState('');
  const [activeTab, setActiveTab] = useState('positions');
  const [positions, setPositions] = useState([]);
  const [posLoading, setPosLoading] = useState(false);
  const [posError, setPosError] = useState(null);

  const currentCoin = (coinSymbol || 'BTC').toUpperCase();

  const fetchPositions = useCallback(async () => {
    if (!token) return;
    setPosLoading(true);
    try {
      const res = await api.get('/api/futures/positions', { headers: { Authorization: `Bearer ${token}` } });
      const data = res.data?.positions || res.data?.data || res.data || [];
      setPositions(Array.isArray(data) ? data : []);
    } catch (err) {
      setPosError('Could not load positions');
    } finally { setPosLoading(false); }
  }, [token]);

  useEffect(() => { fetchPositions(); }, [fetchPositions]);

  useEffect(() => {
    let prev = null;
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${currentCoin.toLowerCase()}usdt@ticker`);
    ws.onmessage = (e) => {
      const d = JSON.parse(e.data);
      const price = parseFloat(d.c);
      if (prev !== null) {
        const up = price >= prev;
        setPriceUp(up); setFlashCls(up ? 'fg' : 'fr');
        setTimeout(() => setFlashCls(''), 420);
      }
      prev = price; setCurrentPrice(price.toFixed(2));
    };
    return () => ws.close();
  }, [currentCoin]);

  const handleTrade = async () => {
    if (!amount || parseFloat(amount) <= 0) return toast.error('Enter valid amount');
    setLoading(true);
    try {
      const res = await api.post('/api/futures/trade', {
        type: side, amount: parseFloat(amount), leverage: Number(leverage),
        symbol: currentCoin, entryPrice: parseFloat(currentPrice),
      }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        toast.success('Trade placed!'); setAmount('');
        refreshUser?.(); fetchPositions();
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Trade failed'); }
    finally { setLoading(false); }
  };

  const handleClosePosition = async (positionId) => {
    try {
      await api.post('/api/futures/close', { positionId }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Position closed'); refreshUser?.(); fetchPositions();
    } catch (err) { toast.error('Could not close position'); }
  };

  return (
    <>
      <Styles />
      <div className="fut-root">
        {/* HEADER */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 16px', background:'#161a1e', borderBottom:'1px solid #1e2329' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:5 }}>
              <span style={{ color:'#eaecef', fontWeight:700, fontSize:15 }}>{currentCoin}USDT</span>
              <ChevronDown size={13} />
            </div>
            <span style={{ fontSize:12, fontWeight:700, color: priceUp ? '#0ecb81' : '#f6465d' }}>{currentPrice}</span>
          </div>
          <div style={{ display:'flex', gap:14, color:'#5e6673' }}>
            <Activity size={17} /> <Settings size={17} /> <MoreHorizontal size={17} />
          </div>
        </div>

        <div className="main-layout">
          {/* LEFT: Order Book */}
          <div className="side-orderbook" style={{ background:'#161a1e', padding:'8px 6px' }}>
            <OrderBook currentPrice={currentPrice} flashCls={flashCls} priceUp={priceUp} />
          </div>

          {/* MIDDLE: Chart + Tabs */}
          <div className="center-content">
            <div className="chart-container" style={{ minHeight:360, position:'relative', borderBottom:'1px solid #1e2329' }}>
              <iframe title="Futures Chart" src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${currentCoin}USDT.P&interval=15&theme=dark&style=1&timezone=Etc%2FUTC`} style={{ position:'absolute', inset:0, width:'100%', height:'100%', border:'none' }} />
            </div>

            <div style={{ background:'#161a1e', flex:1 }}>
              <div style={{ display:'flex', gap:20, borderBottom:'1px solid #1e2329', padding:'0 14px' }}>
                {['positions', 'orders', 'assets'].map(t => (
                  <button key={t} className={`pos-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
              <div style={{ padding:'10px 12px' }}>
                {activeTab === 'positions' && positions.map((pos, i) => (
                  <PositionCard key={pos._id || i} pos={pos} currentPrice={currentPrice} onClose={handleClosePosition} />
                ))}
                {activeTab === 'assets' && <div style={{ fontSize:11, color:'#eaecef' }}>Balance: {user?.balance?.toFixed(2)} USDT</div>}
              </div>
            </div>
          </div>

          {/* RIGHT: Trade Form */}
          <div className="side-tradeform" style={{ padding:14, background:'#161a1e', display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ display:'flex', background:'#2b3139', borderRadius:6, padding:3 }}>
              {['buy', 'sell'].map(s => (
                <button key={s} onClick={() => setSide(s)} style={{ flex:1, padding:'8px 0', border:'none', borderRadius:5, background: side === s ? (s==='buy' ? '#0ecb81' : '#f6465d') : 'transparent', color: side === s ? '#0b0e11' : '#5e6673', fontWeight:700 }}>{s.toUpperCase()}</button>
              ))}
            </div>
            <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} style={{ background:'#2b3139', border:'none', padding:10, color:'#fff', borderRadius:5 }} />
            <LeverageSlider onChange={v => setLeverage(v)} />
            <button onClick={handleTrade} disabled={loading} style={{ width:'100%', padding:12, border:'none', borderRadius:5, background: side==='buy' ? '#0ecb81' : '#f6465d', color:'#000', fontWeight:700 }}>
              {loading ? 'Processing...' : (side === 'buy' ? 'Buy / Long' : 'Sell / Short')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Futures;