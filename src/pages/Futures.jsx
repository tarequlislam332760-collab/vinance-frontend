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

/* ─── IBM Plex Mono + styles ─────────────────────────────────────── */
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
    .side-orderbook { width: 160px; flex-shrink: 0; border-right: 1px solid #1e2329; background: #161a1e; }
    .center-content { flex: 1; display: flex; flex-direction: column; min-width: 0; }
    .side-tradeform { width: 300px; flex-shrink: 0; border-left: 1px solid #1e2329; background: #161a1e; overflow-y: auto; }

    /* Mobile Responsive Logic */
    @media (max-width: 992px) {
      .main-layout { flex-direction: column; overflow-y: auto; }
      .side-orderbook { width: 100%; border: none; height: auto; border-bottom: 1px solid #1e2329; }
      .side-tradeform { width: 100%; border: none; border-top: 1px solid #1e2329; order: 2; height: auto; }
      .center-content { order: 1; flex: none; }
      .chart-container { height: 300px !important; min-height: 300px !important; }
    }

    /* tabs */
    .pos-tab {
      padding: 10px 0 8px; font-size: 11px; font-weight: 600;
      background: transparent; border: none; border-bottom: 2px solid transparent;
      color: #5e6673; cursor: pointer; font-family: inherit;
      letter-spacing: .03em; transition: color .15s, border-color .15s;
    }
    .pos-tab.active { color: #eaecef; border-bottom-color: #f0b90b; }

    /* position card */
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .pos-card {
      background: #1e2329; border-radius: 6px; padding: 10px 12px;
      margin-bottom: 6px; animation: slideIn .2s ease-out;
      border-left: 3px solid transparent;
    }
    .pos-card.long  { border-left-color: #0ecb81; }
    .pos-card.short { border-left-color: #f6465d; }

    /* pnl badge */
    .pnl-pos { color: #0ecb81; background: rgba(14,203,129,.1); padding: 2px 7px; border-radius: 4px; font-size: 10px; font-weight: 700; }
    .pnl-neg { color: #f6465d; background: rgba(246,70,93,.1); padding: 2px 7px; border-radius: 4px; font-size: 10px; font-weight: 700; }

    /* empty state */
    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 28px 0; gap: 8px; color: #404854; font-size: 11px; }

    /* spinner */
    @keyframes spin { to { transform: rotate(360deg); } }
    .spin { animation: spin .8s linear infinite; }

    /* price flash */
    @keyframes flashG { 0%{background:rgba(14,203,129,.15)} 100%{background:transparent} }
    @keyframes flashR { 0%{background:rgba(246,70,93,.15)}  100%{background:transparent} }
    .fg { animation: flashG .4s ease-out; }
    .fr { animation: flashR .4s ease-out; }

    /* close btn */
    .close-pos-btn { font-size: 9px; font-weight: 700; padding: 3px 8px; border-radius: 3px; border: 1px solid #f6465d; color: #f6465d; background: transparent; cursor: pointer; transition: background .15s, color .15s; }
    .close-pos-btn:hover { background: #f6465d; color: #fff; }
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

/* ─── Main Component ─────────────────────────────────────────────── */
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
    setPosError(null);
    try {
      const res = await api.get('/api/futures/positions', { headers: { Authorization: `Bearer ${token}` } });
      const data = res.data?.positions || res.data?.data || res.data || [];
      setPositions(Array.isArray(data) ? data : []);
    } catch (err) {
      setPosError('Could not load positions');
      setPositions([]);
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
    ws.onerror = () => ws.close();
    return () => ws.close();
  }, [currentCoin]);

  const handleTrade = async () => {
    if (!amount || parseFloat(amount) <= 0) return toast.error('Enter valid amount');
    if (parseFloat(amount) > (user?.balance || 0)) return toast.error('Insufficient balance');
    setLoading(true);
    try {
      const res = await api.post('/api/futures/trade', {
        type: side, amount: parseFloat(amount), leverage: Number(leverage),
        symbol: currentCoin, entryPrice: parseFloat(currentPrice),
      }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        toast.success(res.data.message || 'Trade placed!');
        setAmount('');
        await Promise.all([refreshUser?.(), fetchPositions()]);
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Trade failed'); }
    finally { setLoading(false); }
  };

  const handleClosePosition = async (positionId) => {
    if (!positionId) return toast.error('Invalid position');
    try {
      await api.post('/api/futures/close', { positionId }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Position closed');
      await Promise.all([refreshUser?.(), fetchPositions()]);
    } catch (err) { toast.error(err.response?.data?.message || 'Could not close position'); }
  };

  const adjustAmount = (val) => {
    setAmount(prev => {
      const n = Math.max(0, (parseFloat(prev) || 0) + val);
      return n === 0 ? '' : n.toString();
    });
  };

  return (
    <>
      <Styles />
      <div className="fut-root">
        {/* HEADER */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 16px', background:'#161a1e', borderBottom:'1px solid #1e2329' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:5, cursor:'pointer' }}>
              <span style={{ color:'#eaecef', fontWeight:700, fontSize:15 }}>{currentCoin}USDT</span>
              <span style={{ background:'#2b3139', color:'#848e9c', fontSize:8, padding:'1px 5px', borderRadius:3 }}>PERP</span>
              <ChevronDown size={13} />
            </div>
            <span style={{ fontSize:12, fontWeight:700, color: priceUp ? '#0ecb81' : '#f6465d' }}>{currentPrice}</span>
          </div>
          <div style={{ display:'flex', gap:14, color:'#5e6673' }}>
            <Activity size={17} style={{ cursor:'pointer' }} />
            <Settings size={17} style={{ cursor:'pointer' }} />
            <MoreHorizontal size={17} style={{ cursor:'pointer' }} />
          </div>
        </div>

        <div className="main-layout">
          {/* LEFT: Order Book */}
          <div className="side-orderbook" style={{ padding:'8px 6px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:9, color:'#5e6673', marginBottom:6, padding:'0 2px' }}>
              <span>Price</span><span>Size</span>
            </div>
            {[...Array(7)].map((_,i) => (
              <div key={`a${i}`} style={{ display:'flex', justifyContent:'space-between', fontSize:11, padding:'2px 2px' }}>
                <span style={{ color:'#f6465d' }}>{(parseFloat(currentPrice) + (i+1)*0.5).toFixed(2)}</span>
                <span style={{ color:'#c6cad2' }}>{(Math.random()*5+0.5).toFixed(2)}K</span>
              </div>
            ))}
            <div className={flashCls} style={{ textAlign:'center', padding:'5px 0', margin:'4px 0', borderTop:'1px solid #1e2329', borderBottom:'1px solid #1e2329', color: priceUp ? '#0ecb81' : '#f6465d', fontWeight:700, fontSize:13 }}>{currentPrice}</div>
            {[...Array(7)].map((_,i) => (
              <div key={`b${i}`} style={{ display:'flex', justifyContent:'space-between', fontSize:11, padding:'2px 2px' }}>
                <span style={{ color:'#0ecb81' }}>{(parseFloat(currentPrice) - (i+1)*0.5).toFixed(2)}</span>
                <span style={{ color:'#c6cad2' }}>{(Math.random()*5+0.5).toFixed(2)}K</span>
              </div>
            ))}
          </div>

          {/* MIDDLE: Chart + Tabs */}
          <div className="center-content">
            <div className="chart-container" style={{ flex:1, minHeight:360, position:'relative', borderBottom:'1px solid #1e2329' }}>
              <iframe title="Futures Chart" src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${currentCoin}USDT.P&interval=15&theme=dark&style=1&timezone=Etc%2FUTC`} style={{ position:'absolute', inset:0, width:'100%', height:'100%', border:'none' }} />
            </div>

            <div style={{ height:240, display:'flex', flexDirection:'column', background:'#161a1e' }}>
              <div style={{ display:'flex', gap:20, borderBottom:'1px solid #1e2329', padding:'0 14px', flexShrink:0 }}>
                {[ { key:'positions', label:`Positions(${positions.length})` }, { key:'orders', label:'Open Orders(0)' }, { key:'assets', label:'Assets' } ].map(t => (
                  <button key={t.key} className={`pos-tab${activeTab === t.key ? ' active' : ''}`} onClick={() => { setActiveTab(t.key); if (t.key === 'positions') fetchPositions(); }}>{t.label}</button>
                ))}
                <button onClick={fetchPositions} style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', color:'#5e6673' }}><RefreshCw size={12} className={posLoading ? 'spin' : ''} /></button>
              </div>

              <div style={{ flex:1, overflowY:'auto', padding:'10px 12px' }}>
                {activeTab === 'positions' && (
                  <>
                    {posLoading && <div className="empty-state"><Loader2 size={20} className="spin" style={{ color:'#f0b90b' }} /><span>Loading...</span></div>}
                    {!posLoading && posError && <div className="empty-state" style={{ color:'#f6465d' }}><AlertCircle size={20} /><span>{posError}</span></div>}
                    {!posLoading && !posError && positions.length === 0 && <div className="empty-state"><TrendingUp size={24} style={{ opacity:.3 }} /><span>No open positions</span></div>}
                    {!posLoading && !posError && positions.map((pos, i) => (
                      <PositionCard key={pos._id || pos.id || i} pos={pos} currentPrice={currentPrice} onClose={handleClosePosition} />
                    ))}
                  </>
                )}
                {activeTab === 'assets' && (
                  <div style={{ fontSize:11 }}>
                    {[ ['Wallet Balance', `${user?.balance?.toFixed(2) || '0.00'} USDT`, '#eaecef'], ['Margin Balance', `${user?.balance?.toFixed(2) || '0.00'} USDT`, '#eaecef'] ].map(([label, val, color]) => (
                      <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid #1e2329' }}>
                        <span style={{ color:'#5e6673' }}>{label}</span><span style={{ color, fontWeight:600 }}>{val}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Trade Form */}
          <div className="side-tradeform" style={{ padding:14, display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ display:'flex', gap:8 }}>
              {['Cross', `${leverage}x`].map((label, i) => (
                <button key={i} style={{ flex:1, background:'#2b3139', border:'none', borderRadius:5, padding:'7px 0', fontSize:11, fontWeight:700, color:'#eaecef', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}>{label} <ChevronDown size={11} color="#848e9c"/></button>
              ))}
            </div>

            <div style={{ display:'flex', background:'#2b3139', borderRadius:6, padding:3 }}>
              {['buy','sell'].map(s => (
                <button key={s} onClick={() => setSide(s)} style={{ flex:1, padding:'8px 0', border:'none', borderRadius:5, fontSize:13, fontWeight:700, cursor:'pointer', background: side === s ? (s==='buy' ? '#0ecb81' : '#f6465d') : 'transparent', color: side === s ? (s==='buy' ? '#0b0e11' : '#fff') : '#5e6673' }}>{s === 'buy' ? 'Buy' : 'Sell'}</button>
              ))}
            </div>

            <div style={{ background:'#2b3139', padding:'8px 12px', borderRadius:5, display:'flex', alignItems:'center' }}>
              <button onClick={() => adjustAmount(-1)} style={{ background:'none', border:'none', color:'#848e9c' }}><Minus size={15}/></button>
              <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} style={{ flex:1, background:'transparent', border:'none', outline:'none', textAlign:'center', color:'#eaecef', fontSize:14, fontWeight:700 }} />
              <button onClick={() => adjustAmount(1)} style={{ background:'none', border:'none', color:'#848e9c' }}><Plus size={15}/></button>
            </div>

            <LeverageSlider onChange={v => setLeverage(v)} />

            <button onClick={handleTrade} disabled={loading} style={{ width:'100%', padding:'14px 0', border:'none', borderRadius:7, fontSize:13, fontWeight:700, cursor: loading ? 'not-allowed' : 'pointer', background: loading ? '#2b3139' : side==='buy' ? '#0ecb81' : '#f6465d', color: loading ? '#5e6673' : side==='buy' ? '#0b0e11' : '#fff', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              {loading ? <><Loader2 size={15} className="spin"/> Processing...</> : (side === 'buy' ? <><TrendingUp size={15}/> Buy / Long</> : <><TrendingDown size={15}/> Sell / Short</>)}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Futures;