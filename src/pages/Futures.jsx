import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import axios from 'axios';
import {
  ChevronDown, Settings, RefreshCw, TrendingUp, TrendingDown,
  AlertCircle, Loader2, Plus, Minus, Activity, MoreHorizontal
} from 'lucide-react';

const API_BASE = "https://vinance-backend-1.onrender.com";
const api = axios.create({ baseURL: API_BASE });

/* ── Real Order Book from Binance ── */
const OrderBook = ({ symbol }) => {
  const [book, setBook] = useState({ asks: [], bids: [] });
  const [midPrice, setMidPrice] = useState(null);
  const [priceUp, setPriceUp] = useState(true);
  const prev = useRef(null);

  useEffect(() => {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}usdt@depth10@100ms`);
    ws.onmessage = (e) => {
      const d = JSON.parse(e.data);
      const bid0 = parseFloat(d.b[0]?.[0] || 0);
      const ask0 = parseFloat(d.a[0]?.[0] || 0);
      const mid = (bid0 + ask0) / 2;
      if (prev.current !== null) setPriceUp(mid >= prev.current);
      prev.current = mid;
      setMidPrice(mid);
      setBook({ asks: d.a.slice(0, 12).reverse(), bids: d.b.slice(0, 12) });
    };
    ws.onerror = () => ws.close();
    return () => ws.close();
  }, [symbol]);

  const maxVol = (arr) => Math.max(...arr.map(o => parseFloat(o[1])), 1);

  return (
    <div style={{ fontFamily: 'monospace', fontSize: 11, padding: '6px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#5e6673', fontSize: 10, padding: '0 8px', marginBottom: 6, fontWeight: 600 }}>
        <span>Price(USDT)</span><span>Size</span><span>Total</span>
      </div>
      {book.asks.map((ask, i) => {
        const w = (parseFloat(ask[1]) / maxVol(book.asks)) * 100;
        return (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 8px', position: 'relative' }}>
            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: `${w}%`, background: 'rgba(246,70,93,0.08)' }} />
            <span style={{ color: '#f6465d', fontWeight: 600, zIndex: 1, minWidth: 70 }}>{parseFloat(ask[0]).toFixed(2)}</span>
            <span style={{ color: '#c6cad2', zIndex: 1 }}>{parseFloat(ask[1]).toFixed(3)}</span>
            <span style={{ color: '#5e6673', zIndex: 1 }}>{(parseFloat(ask[0]) * parseFloat(ask[1])).toFixed(0)}</span>
          </div>
        );
      })}
      <div style={{ padding: '6px 8px', margin: '3px 0', borderTop: '1px solid #2b3139', borderBottom: '1px solid #2b3139', background: priceUp ? 'rgba(14,203,129,0.06)' : 'rgba(246,70,93,0.06)', textAlign: 'center' }}>
        <div style={{ color: priceUp ? '#0ecb81' : '#f6465d', fontWeight: 800, fontSize: 14 }}>
          {midPrice ? midPrice.toFixed(2) : '—'} {priceUp ? '▲' : '▼'}
        </div>
        <div style={{ color: '#5e6673', fontSize: 9 }}>≈ ${midPrice ? midPrice.toFixed(2) : '—'}</div>
      </div>
      {book.bids.map((bid, i) => {
        const w = (parseFloat(bid[1]) / maxVol(book.bids)) * 100;
        return (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 8px', position: 'relative' }}>
            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: `${w}%`, background: 'rgba(14,203,129,0.08)' }} />
            <span style={{ color: '#0ecb81', fontWeight: 600, zIndex: 1, minWidth: 70 }}>{parseFloat(bid[0]).toFixed(2)}</span>
            <span style={{ color: '#c6cad2', zIndex: 1 }}>{parseFloat(bid[1]).toFixed(3)}</span>
            <span style={{ color: '#5e6673', zIndex: 1 }}>{(parseFloat(bid[0]) * parseFloat(bid[1])).toFixed(0)}</span>
          </div>
        );
      })}
    </div>
  );
};

/* ── Position Card ── */
const PositionCard = ({ pos, livePrice, onClose }) => {
  const isLong = pos.type === 'buy';
  const entry = parseFloat(pos.entryPrice || 0);
  const size = parseFloat(pos.amount || 0);
  const lev = parseFloat(pos.leverage || 1);
  const mark = parseFloat(livePrice || entry);
  const pnl = isLong ? (mark - entry) * (size / entry) * lev : (entry - mark) * (size / entry) * lev;
  const pnlPct = size > 0 ? ((pnl / size) * 100).toFixed(2) : '0.00';
  const liq = isLong ? (entry * (1 - 1 / lev)).toFixed(2) : (entry * (1 + 1 / lev)).toFixed(2);

  return (
    <div style={{ background: '#1e2329', borderRadius: 4, padding: '10px 12px', marginBottom: 4, borderLeft: `3px solid ${isLong ? '#0ecb81' : '#f6465d'}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: isLong ? '#0ecb81' : '#f6465d', fontWeight: 700, fontSize: 11 }}>{isLong ? '↑ LONG' : '↓ SHORT'}</span>
          <span style={{ background: '#2b3139', color: '#848e9c', fontSize: 9, padding: '1px 5px', borderRadius: 3 }}>{lev}x</span>
          <span style={{ color: '#eaecef', fontWeight: 700, fontSize: 11 }}>{pos.symbol}USDT</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: pnl >= 0 ? '#0ecb81' : '#f6465d', background: pnl >= 0 ? 'rgba(14,203,129,.1)' : 'rgba(246,70,93,.1)', padding: '2px 7px', borderRadius: 3, fontSize: 10, fontWeight: 700 }}>
            {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} ({pnlPct}%)
          </span>
          <button onClick={() => onClose(pos._id)} style={{ fontSize: 9, fontWeight: 700, padding: '3px 9px', borderRadius: 3, border: '1px solid #f6465d', color: '#f6465d', background: 'transparent', cursor: 'pointer' }}>Close</button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 4, fontSize: 10 }}>
        {[['Size', `${size.toFixed(2)} USDT`], ['Entry', entry.toFixed(2)], ['Mark', mark.toFixed(2)], ['Liq.', liq]].map(([l, v]) => (
          <div key={l}><div style={{ color: '#5e6673', marginBottom: 2 }}>{l}</div><div style={{ color: '#c6cad2', fontWeight: 600 }}>{v}</div></div>
        ))}
      </div>
    </div>
  );
};

/* ── Main Futures ── */
const Futures = () => {
  const { coinSymbol } = useParams();
  const { user, refreshUser, token } = useContext(UserContext);
  const coin = (coinSymbol || 'BTC').toUpperCase();

  const [leverage, setLeverage] = useState(20);
  const [amount, setAmount] = useState('');
  const [side, setSide] = useState('buy');
  const [orderType, setOrderType] = useState('Market');
  const [limitPrice, setLimitPrice] = useState('');
  const [tp, setTp] = useState('');
  const [sl, setSl] = useState('');
  const [showTpSl, setShowTpSl] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('positions');
  const [positions, setPositions] = useState([]);
  const [posLoading, setPosLoading] = useState(false);
  const [livePrice, setLivePrice] = useState('0.00');
  const [priceUp, setPriceUp] = useState(true);
  const [ticker, setTicker] = useState({ high: '0', low: '0', changePct: '0.00', vol: '0B' });
  const prevRef = useRef(null);

  const fetchPositions = useCallback(async () => {
    if (!token) return;
    setPosLoading(true);
    try {
      const res = await api.get('/api/futures/positions', { headers: { Authorization: `Bearer ${token}` } });
      const data = res.data?.positions || res.data?.data || res.data || [];
      setPositions(Array.isArray(data) ? data : []);
    } catch { setPositions([]); }
    finally { setPosLoading(false); }
  }, [token]);

  useEffect(() => { fetchPositions(); }, [fetchPositions]);

  useEffect(() => {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${coin.toLowerCase()}usdt@ticker`);
    ws.onmessage = (e) => {
      const d = JSON.parse(e.data);
      const price = parseFloat(d.c);
      if (prevRef.current !== null) setPriceUp(price >= prevRef.current);
      prevRef.current = price;
      setLivePrice(price.toFixed(2));
      setTicker({ high: parseFloat(d.h).toFixed(2), low: parseFloat(d.l).toFixed(2), changePct: parseFloat(d.P).toFixed(2), vol: (parseFloat(d.q) / 1e9).toFixed(2) + 'B' });
    };
    ws.onerror = () => ws.close();
    return () => ws.close();
  }, [coin]);

  const handleTrade = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return alert('Enter valid amount');
    if (amt > (user?.balance || 0)) return alert('Insufficient balance');
    setLoading(true);
    try {
      const payload = { type: side, amount: amt, leverage, symbol: coin, entryPrice: parseFloat(livePrice) };
      if (showTpSl && tp) payload.tp = parseFloat(tp);
      if (showTpSl && sl) payload.sl = parseFloat(sl);
      await api.post('/api/futures/trade', payload, { headers: { Authorization: `Bearer ${token}` } });
      setAmount(''); setTp(''); setSl('');
      await Promise.all([refreshUser?.(), fetchPositions()]);
    } catch (err) { alert(err.response?.data?.message || 'Trade failed'); }
    finally { setLoading(false); }
  };

  const handleClose = async (id) => {
    try {
      await api.post(`/api/futures/close/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      await Promise.all([refreshUser?.(), fetchPositions()]);
    } catch (err) { alert(err.response?.data?.message || 'Close failed'); }
  };

  const liqEst = amount && livePrice ? (side === 'buy' ? (parseFloat(livePrice) * (1 - 1 / leverage)).toFixed(2) : (parseFloat(livePrice) * (1 + 1 / leverage)).toFixed(2)) : '—';

  return (
    <div style={{ fontFamily: "'IBM Plex Mono',monospace", background: '#0b0e11', color: '#848e9c', minHeight: '100dvh', display: 'flex', flexDirection: 'column', fontSize: 12 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#2b3139}
        input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}
        input[type=number]{-moz-appearance:textfield}
      `}</style>

      {/* HEADER */}
      <div style={{ background: '#161a1e', borderBottom: '1px solid #2b3139', padding: '8px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#eaecef', fontWeight: 800, fontSize: 15 }}>{coin}USDT</span>
            <span style={{ background: '#2b3139', color: '#848e9c', fontSize: 8, padding: '1px 5px', borderRadius: 3 }}>PERP</span>
            <ChevronDown size={12} color="#848e9c" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: priceUp ? '#0ecb81' : '#f6465d', fontWeight: 800, fontSize: 20 }}>{livePrice}</span>
            <span style={{ color: priceUp ? '#0ecb81' : '#f6465d', fontSize: 11 }}>{parseFloat(ticker.changePct) >= 0 ? '+' : ''}{ticker.changePct}%</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 18, fontSize: 10 }}>
          {[['Mark', (parseFloat(livePrice)*1.0001).toFixed(2)], ['Index', (parseFloat(livePrice)*0.9999).toFixed(2)], ['Funding(8h)', '0.01559%'], ['24h High', ticker.high], ['24h Low', ticker.low], ['24h Vol', ticker.vol]].map(([l, v]) => (
            <div key={l}><div style={{ color: '#5e6673' }}>{l}</div><div style={{ color: '#c6cad2', fontWeight: 600 }}>{v}</div></div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, color: '#5e6673' }}>
          <Activity size={15} style={{ cursor: 'pointer' }} />
          <Settings size={15} style={{ cursor: 'pointer' }} />
          <MoreHorizontal size={15} style={{ cursor: 'pointer' }} />
        </div>
      </div>

      {/* BODY */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>

        {/* LEFT: Order Book */}
        <div style={{ width: 220, borderRight: '1px solid #2b3139', background: '#161a1e', overflowY: 'auto', flexShrink: 0 }}>
          <div style={{ padding: '6px 8px', borderBottom: '1px solid #2b3139', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#848e9c' }}>Order Book</span>
            <select style={{ background: '#2b3139', border: 'none', color: '#848e9c', fontSize: 10, borderRadius: 3, padding: '2px 4px', cursor: 'pointer' }}>
              <option>0.01</option><option>0.1</option><option>1</option>
            </select>
          </div>
          <OrderBook symbol={coin} />
        </div>

        {/* CENTER: Chart + Positions */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ flex: 1, minHeight: 360, position: 'relative', borderBottom: '1px solid #2b3139' }}>
            <iframe title="Chart" src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${coin}USDT.P&interval=15&theme=dark&style=1&timezone=Etc%2FUTC&hide_top_toolbar=0&locale=en`}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} />
          </div>

          {/* Tabs */}
          <div style={{ height: 265, display: 'flex', flexDirection: 'column', background: '#161a1e' }}>
            <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #2b3139', padding: '0 12px', flexShrink: 0 }}>
              {[{ key: 'positions', label: `Positions(${positions.length})` }, { key: 'orders', label: 'Open Orders(0)' }, { key: 'history', label: 'Order History' }, { key: 'tradeHistory', label: 'Trade History' }, { key: 'assets', label: 'Assets' }].map(t => (
                <button key={t.key} onClick={() => { setActiveTab(t.key); if (t.key === 'positions') fetchPositions(); }} style={{ padding: '9px 12px 8px', fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer', background: 'transparent', color: activeTab === t.key ? '#eaecef' : '#5e6673', fontFamily: 'inherit', borderBottom: activeTab === t.key ? '2px solid #f0b90b' : '2px solid transparent' }}>{t.label}</button>
              ))}
              <button onClick={fetchPositions} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#5e6673' }}>
                <RefreshCw size={11} style={posLoading ? { animation: 'spin .8s linear infinite' } : {}} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
              {activeTab === 'positions' && (
                <>
                  {posLoading && <div style={{ textAlign: 'center', padding: 20 }}><Loader2 size={16} style={{ animation: 'spin .8s linear infinite', color: '#f0b90b' }} /></div>}
                  {!posLoading && positions.length === 0 && <div style={{ textAlign: 'center', padding: '28px 0', color: '#3a3f47', fontSize: 11 }}><TrendingUp size={20} style={{ margin: '0 auto 6px' }} /><br />No open positions</div>}
                  {!posLoading && positions.map((pos, i) => <PositionCard key={pos._id || i} pos={pos} livePrice={livePrice} onClose={handleClose} />)}
                </>
              )}
              {activeTab === 'orders' && <div style={{ textAlign: 'center', padding: '28px 0', color: '#3a3f47', fontSize: 11 }}><AlertCircle size={20} style={{ margin: '0 auto 6px' }} /><br />No open orders</div>}
              {activeTab === 'assets' && (
                <div style={{ fontSize: 11 }}>
                  {[['Wallet Balance', `${(user?.balance || 0).toFixed(2)} USDT`], ['Margin Balance', `${(user?.balance || 0).toFixed(2)} USDT`], ['Unrealized PNL', '0.00 USDT'], ['Available Margin', `${(user?.balance || 0).toFixed(2)} USDT`]].map(([l, v]) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #2b3139' }}>
                      <span style={{ color: '#5e6673' }}>{l}</span><span style={{ color: '#eaecef', fontWeight: 600 }}>{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Trade Form */}
        <div style={{ width: 285, borderLeft: '1px solid #2b3139', background: '#161a1e', overflowY: 'auto', flexShrink: 0, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {['Cross', `${leverage}x`].map((label, i) => (
              <button key={i} style={{ flex: 1, background: '#2b3139', border: 'none', borderRadius: 4, padding: '7px 0', fontSize: 11, fontWeight: 700, color: '#eaecef', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontFamily: 'inherit' }}>
                {label} <ChevronDown size={11} color="#848e9c" />
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', background: '#2b3139', borderRadius: 5, padding: 3 }}>
            {['buy', 'sell'].map(s => (
              <button key={s} onClick={() => setSide(s)} style={{ flex: 1, padding: '9px 0', border: 'none', borderRadius: 4, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', background: side === s ? (s === 'buy' ? '#0ecb81' : '#f6465d') : 'transparent', color: side === s ? (s === 'buy' ? '#0b0e11' : '#fff') : '#5e6673', transition: 'all .2s' }}>
                {s === 'buy' ? 'Buy / Long' : 'Sell / Short'}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', borderBottom: '1px solid #2b3139' }}>
            {['Limit', 'Market', 'Stop Limit'].map(t => (
              <button key={t} onClick={() => setOrderType(t)} style={{ padding: '6px 10px', fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer', background: 'transparent', color: orderType === t ? '#eaecef' : '#5e6673', fontFamily: 'inherit', borderBottom: orderType === t ? '2px solid #f0b90b' : '2px solid transparent' }}>{t}</button>
            ))}
          </div>

          {orderType === 'Limit' && (
            <div style={{ background: '#2b3139', borderRadius: 4, padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, color: '#5e6673' }}>Price</span>
              <input type="number" placeholder={livePrice} value={limitPrice} onChange={e => setLimitPrice(e.target.value)} style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#eaecef', fontSize: 13, fontWeight: 700, textAlign: 'right', fontFamily: 'inherit' }} />
              <span style={{ color: '#5e6673', fontSize: 11 }}>USDT</span>
            </div>
          )}

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#5e6673', marginBottom: 4 }}>
              <span>Amount</span>
              <span>Avbl: <span style={{ color: '#eaecef', fontWeight: 700 }}>{(user?.balance || 0).toFixed(2)} USDT</span></span>
            </div>
            <div style={{ background: '#2b3139', borderRadius: 4, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 4 }}>
              <button onClick={() => setAmount(p => Math.max(0, (parseFloat(p) || 0) - 1).toString())} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#848e9c' }}><Minus size={13} /></button>
              <input type="number" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#eaecef', fontSize: 13, fontWeight: 700, textAlign: 'center', fontFamily: 'inherit' }} />
              <button onClick={() => setAmount(p => ((parseFloat(p) || 0) + 1).toString())} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#848e9c' }}><Plus size={13} /></button>
              <span style={{ color: '#5e6673', fontSize: 11 }}>USDT</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 4 }}>
            {[25, 50, 75, 100].map(pct => (
              <button key={pct} onClick={() => setAmount(((user?.balance || 0) * pct / 100).toFixed(2))} style={{ flex: 1, padding: '4px 0', fontSize: 10, fontWeight: 700, border: '1px solid #2b3139', borderRadius: 3, cursor: 'pointer', background: 'transparent', color: '#5e6673', fontFamily: 'inherit' }}>{pct}%</button>
            ))}
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#5e6673', marginBottom: 4 }}>
              <span>Leverage</span><span style={{ color: '#f0b90b', fontWeight: 700 }}>{leverage}x</span>
            </div>
            <input type="range" min={1} max={125} value={leverage} onChange={e => setLeverage(Number(e.target.value))} style={{ width: '100%', accentColor: '#f0b90b', cursor: 'pointer' }} />
            <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
              {[1, 25, 50, 75, 100, 125].map(v => (
                <button key={v} onClick={() => setLeverage(v)} style={{ flex: 1, padding: '3px 0', fontSize: 9, fontWeight: 700, fontFamily: 'inherit', border: `1px solid ${leverage === v ? '#f0b90b' : '#2b3139'}`, borderRadius: 3, cursor: 'pointer', background: leverage === v ? 'rgba(240,185,11,.12)' : 'transparent', color: leverage === v ? '#f0b90b' : '#5e6673' }}>{v}x</button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }} onClick={() => setShowTpSl(v => !v)}>
            <div style={{ width: 13, height: 13, border: `1px solid ${showTpSl ? '#f0b90b' : '#5e6673'}`, borderRadius: 2, background: showTpSl ? '#f0b90b' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {showTpSl && <span style={{ color: '#0b0e11', fontSize: 9, fontWeight: 900 }}>✓</span>}
            </div>
            <span style={{ fontSize: 11 }}>TP/SL</span>
          </div>
          {showTpSl && (
            <div style={{ display: 'flex', gap: 8 }}>
              {[['Take Profit', '#0ecb81', tp, setTp], ['Stop Loss', '#f6465d', sl, setSl]].map(([label, color, val, setter]) => (
                <div key={label} style={{ flex: 1, background: '#2b3139', borderRadius: 4, padding: '6px 8px' }}>
                  <div style={{ fontSize: 9, color, marginBottom: 2 }}>{label}</div>
                  <input type="number" placeholder="Price" value={val} onChange={e => setter(e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: '#eaecef', fontSize: 11, fontWeight: 700, fontFamily: 'inherit' }} />
                </div>
              ))}
            </div>
          )}

          <div style={{ background: '#0b0e11', borderRadius: 4, padding: '8px 10px', fontSize: 10 }}>
            {[['Cost', amount ? `${(parseFloat(amount) / leverage).toFixed(4)} USDT` : '—'], ['Max Position', amount ? `${(parseFloat(amount) * leverage).toFixed(2)} USDT` : '—'], ['Liq. Price', liqEst]].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ color: '#5e6673' }}>{l}</span><span style={{ color: '#eaecef', fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>

          <button onClick={handleTrade} disabled={loading || !amount || parseFloat(amount) <= 0} style={{ width: '100%', padding: '13px 0', border: 'none', borderRadius: 5, fontSize: 13, fontWeight: 800, cursor: loading || !amount ? 'not-allowed' : 'pointer', fontFamily: 'inherit', background: !amount || loading ? '#2b3139' : side === 'buy' ? '#0ecb81' : '#f6465d', color: !amount || loading ? '#5e6673' : side === 'buy' ? '#0b0e11' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loading ? <><Loader2 size={14} style={{ animation: 'spin .8s linear infinite' }} /> Processing...</> : side === 'buy' ? <><TrendingUp size={14} /> Buy / Long</> : <><TrendingDown size={14} /> Sell / Short</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Futures;
