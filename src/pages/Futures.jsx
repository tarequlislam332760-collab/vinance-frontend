import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import axios from 'axios';
import {
  ChevronDown, MoreHorizontal, Settings, Star, Bell,
  RefreshCw, Loader2, TrendingUp, TrendingDown, AlertCircle,
  ArrowUpDown, Clock, FileText, BarChart2, Layers, Wallet
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const API_BASE = "https://vinance-backend-1.onrender.com";

const api = axios.create({ baseURL: API_BASE, withCredentials: true });

/* ─── Styles ─────────────────────────────────────────────────────── */
const FuturesStyles = () => (
  <style>{`
    .fut-wrap { font-family: 'Roboto Mono', 'IBM Plex Mono', monospace; background:#0b0e11; color:#848e9c; min-height:100vh; display:flex; flex-direction:column; }
    .fut-ticker-bar { display:flex; gap:24px; padding:0 12px; background:#161a1e; border-bottom:1px solid #1e2329; overflow-x:auto; scrollbar-width:none; }
    .fut-ticker-bar::-webkit-scrollbar{display:none;}
    .fut-ticker-item { display:flex; gap:6px; align-items:center; padding:8px 0; font-size:11px; white-space:nowrap; cursor:pointer; border-bottom:2px solid transparent; }
    .fut-ticker-item:hover { color:#eaecef; }
    .fut-ticker-item.active { border-bottom-color:#f0b90b; }
    .fut-main { display:flex; flex:1; overflow:hidden; min-height:0; }
    .fut-left { width:220px; flex-shrink:0; border-right:1px solid #1e2329; display:flex; flex-direction:column; background:#0b0e11; }
    .fut-center { flex:1; display:flex; flex-direction:column; min-width:0; }
    .fut-right { width:280px; flex-shrink:0; border-left:1px solid #1e2329; display:flex; flex-direction:column; background:#0b0e11; }
    .fut-header { display:flex; align-items:center; justify-content:space-between; padding:10px 14px; background:#0b0e11; border-bottom:1px solid #1e2329; }
    .fut-chart-tabs { display:flex; gap:0; padding:0 10px; background:#161a1e; border-bottom:1px solid #1e2329; }
    .fut-chart-tab { padding:8px 12px; font-size:12px; font-weight:500; background:transparent; border:none; color:#848e9c; cursor:pointer; border-bottom:2px solid transparent; white-space:nowrap; }
    .fut-chart-tab.active { color:#eaecef; border-bottom-color:#f0b90b; }
    .fut-tf-bar { display:flex; align-items:center; gap:2px; padding:4px 8px; background:#161a1e; border-bottom:1px solid #1e2329; overflow-x:auto; scrollbar-width:none; }
    .fut-tf-bar::-webkit-scrollbar{display:none;}
    .fut-tf-btn { padding:3px 8px; font-size:11px; border-radius:3px; border:none; background:transparent; color:#848e9c; cursor:pointer; white-space:nowrap; }
    .fut-tf-btn.active { background:#2b3139; color:#eaecef; }
    .fut-tf-btn:hover { color:#eaecef; }
    .fut-ob-header { display:flex; justify-content:space-between; padding:6px 8px 4px; font-size:10px; color:#5e6673; }
    .fut-ob-row { display:flex; justify-content:space-between; align-items:center; padding:2px 8px; position:relative; font-size:11px; cursor:pointer; }
    .fut-ob-row:hover { background:rgba(255,255,255,.03); }
    .fut-ob-depth { position:absolute; right:0; top:0; bottom:0; opacity:.15; pointer-events:none; }
    .fut-ob-mid { text-align:center; padding:8px; border-top:1px solid #1e2329; border-bottom:1px solid #1e2329; margin:2px 0; }
    .fut-pos-tabs { display:flex; gap:0; padding:0 12px; border-bottom:1px solid #1e2329; overflow-x:auto; scrollbar-width:none; flex-shrink:0; }
    .fut-pos-tabs::-webkit-scrollbar{display:none;}
    .fut-pos-tab { padding:10px 12px 8px; font-size:11px; font-weight:600; background:transparent; border:none; border-bottom:2px solid transparent; color:#5e6673; cursor:pointer; white-space:nowrap; }
    .fut-pos-tab.active { color:#eaecef; border-bottom-color:#f0b90b; }
    .trade-type-btn { flex:1; padding:9px 0; border:none; border-radius:4px; font-size:13px; font-weight:700; cursor:pointer; transition:all .15s; }
    .buy-btn { background:#0ecb81; color:#fff; }
    .buy-btn:hover { background:#0fb574; }
    .sell-btn { background:#f6465d; color:#fff; }
    .sell-btn:hover { background:#e03d52; }
    .order-type-tab { padding:6px 12px; font-size:12px; border:none; background:transparent; cursor:pointer; color:#848e9c; border-bottom:2px solid transparent; }
    .order-type-tab.active { color:#f0b90b; border-bottom-color:#f0b90b; }
    .fut-input { width:100%; background:#2b3139; border:1px solid #2b3139; border-radius:4px; padding:8px 10px; color:#eaecef; font-size:13px; outline:none; transition:border .15s; }
    .fut-input:focus { border-color:#f0b90b; }
    .fut-input::placeholder { color:#5e6673; }
    .leverage-track { width:100%; height:4px; background:#2b3139; border-radius:2px; position:relative; cursor:pointer; }
    .leverage-fill { height:100%; background:#f0b90b; border-radius:2px; transition:width .1s; }
    .leverage-thumb { width:12px; height:12px; background:#f0b90b; border-radius:50%; position:absolute; top:-4px; transform:translateX(-50%); cursor:pointer; box-shadow:0 0 4px rgba(240,185,11,.5); }
    .leverage-marks { display:flex; justify-content:space-between; margin-top:6px; }
    .leverage-mark { font-size:9px; color:#5e6673; cursor:pointer; }
    .leverage-mark:hover { color:#f0b90b; }
    .acct-panel { padding:14px; border-top:1px solid #1e2329; }
    .acct-row { display:flex; justify-content:space-between; padding:4px 0; font-size:11px; }
    .pos-card { background:#161a1e; border-radius:6px; margin:8px 12px; padding:10px 12px; border-left:3px solid transparent; }
    .pos-card.long { border-left-color:#0ecb81; }
    .pos-card.short { border-left-color:#f6465d; }
    .pos-badge { padding:1px 6px; border-radius:3px; font-size:9px; font-weight:700; }
    .pos-badge.long { background:rgba(14,203,129,.15); color:#0ecb81; }
    .pos-badge.short { background:rgba(246,70,93,.15); color:#f6465d; }
    .lev-badge { background:#2b3139; color:#f0b90b; padding:1px 5px; border-radius:3px; font-size:9px; font-weight:700; }
    .pnl-pos { color:#0ecb81; font-weight:700; font-size:11px; }
    .pnl-neg { color:#f6465d; font-weight:700; font-size:11px; }
    .close-pos-btn { padding:3px 10px; border-radius:3px; border:1px solid #f6465d; color:#f6465d; background:transparent; font-size:10px; font-weight:700; cursor:pointer; }
    .close-pos-btn:hover { background:#f6465d; color:#fff; }
    .empty-state { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:32px 0; gap:8px; color:#404854; font-size:11px; }
    .trades-row { display:flex; justify-content:space-between; padding:3px 8px; font-size:11px; }
    @keyframes spin { to{transform:rotate(360deg);} }
    .spin { animation:spin .8s linear infinite; }
    @keyframes flashG { 0%{background:rgba(14,203,129,.2)} 100%{background:transparent} }
    @keyframes flashR { 0%{background:rgba(246,70,93,.2)} 100%{background:transparent} }
    .fg { animation:flashG .4s ease-out; }
    .fr { animation:flashR .4s ease-out; }
    .bottom-ticker { display:flex; gap:16px; padding:5px 12px; background:#0b0e11; border-top:1px solid #1e2329; overflow:hidden; font-size:10px; white-space:nowrap; }
    @keyframes scrollLeft { from{transform:translateX(0)} to{transform:translateX(-50%)} }
    .ticker-scroll { display:flex; gap:24px; animation:scrollLeft 60s linear infinite; }
    @media(max-width:1100px){
      .fut-left{display:none;}
      .fut-right{width:240px;}
    }
    @media(max-width:768px){
      .fut-main{flex-direction:column; overflow-y:auto;}
      .fut-right{width:100%; border-left:none; border-top:1px solid #1e2329;}
      .fut-left{display:none;}
    }
  `}</style>
);

/* ─── Real OrderBook Component ───────────────────────────────────── */
const FuturesOrderBook = ({ symbol, currentPrice, priceUp }) => {
  const [book, setBook] = useState({ asks: [], bids: [] });
  const [trades, setTrades] = useState([]);
  const [activeView, setActiveView] = useState('book'); // 'book' | 'trades'
  const wsBook = useRef(null);
  const wsTrades = useRef(null);

  useEffect(() => {
    const sym = `${symbol.toLowerCase()}usdt`;
    // Order Book WebSocket
    wsBook.current = new WebSocket(`wss://stream.binance.com:9443/ws/${sym}@depth10@500ms`);
    wsBook.current.onmessage = (e) => {
      const d = JSON.parse(e.data);
      setBook({
        asks: (d.a || []).slice(0, 10).reverse(),
        bids: (d.b || []).slice(0, 10),
      });
    };
    // Trade stream
    wsTrades.current = new WebSocket(`wss://stream.binance.com:9443/ws/${sym}@trade`);
    wsTrades.current.onmessage = (e) => {
      const d = JSON.parse(e.data);
      setTrades(prev => [{
        price: parseFloat(d.p).toFixed(2),
        qty: parseFloat(d.q).toFixed(3),
        time: new Date(d.T).toTimeString().slice(0,8),
        isBuy: !d.m
      }, ...prev].slice(0, 30));
    };
    return () => {
      wsBook.current?.close();
      wsTrades.current?.close();
    };
  }, [symbol]);

  const maxAsk = book.asks.length ? Math.max(...book.asks.map(o => parseFloat(o[1]))) : 1;
  const maxBid = book.bids.length ? Math.max(...book.bids.map(o => parseFloat(o[1]))) : 1;

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      {/* Top icons */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'6px 8px', borderBottom:'1px solid #1e2329' }}>
        <div style={{ display:'flex', gap:6 }}>
          <button onClick={() => setActiveView('book')} style={{ background: activeView==='book' ? '#2b3139':'transparent', border:'none', borderRadius:3, padding:'3px 8px', color: activeView==='book' ? '#eaecef':'#5e6673', cursor:'pointer', fontSize:10, fontWeight:600 }}>Book</button>
          <button onClick={() => setActiveView('trades')} style={{ background: activeView==='trades' ? '#2b3139':'transparent', border:'none', borderRadius:3, padding:'3px 8px', color: activeView==='trades' ? '#eaecef':'#5e6673', cursor:'pointer', fontSize:10, fontWeight:600 }}>Trades</button>
        </div>
        <MoreHorizontal size={13} style={{ color:'#5e6673', cursor:'pointer' }} />
      </div>

      {activeView === 'book' ? (
        <>
          <div className="fut-ob-header">
            <span>Price (USDT)</span><span>Size</span><span>Sum</span>
          </div>
          {/* Asks (sell side, red) */}
          <div style={{ flex:1, overflowY:'auto', scrollbarWidth:'none' }}>
            {book.asks.map((ask, i) => {
              const pct = (parseFloat(ask[1]) / maxAsk) * 100;
              const sum = book.asks.slice(0, i+1).reduce((a,o) => a + parseFloat(o[1]), 0);
              return (
                <div key={i} className="fut-ob-row">
                  <div className="fut-ob-depth" style={{ width:`${pct}%`, background:'#f6465d' }} />
                  <span style={{ color:'#f6465d', zIndex:1, fontWeight:600 }}>{parseFloat(ask[0]).toFixed(2)}</span>
                  <span style={{ color:'#c6cad2', zIndex:1 }}>{parseFloat(ask[1]).toFixed(3)}</span>
                  <span style={{ color:'#848e9c', zIndex:1 }}>{sum.toFixed(3)}</span>
                </div>
              );
            })}
          </div>
          {/* Mid price */}
          <div className="fut-ob-mid">
            <div style={{ color: priceUp ? '#0ecb81':'#f6465d', fontSize:16, fontWeight:700 }}>
              {parseFloat(currentPrice).toLocaleString(undefined,{minimumFractionDigits:2})}
            </div>
            <div style={{ fontSize:9, color:'#5e6673' }}>≈ ${parseFloat(currentPrice).toLocaleString(undefined,{minimumFractionDigits:2})}</div>
          </div>
          {/* Bids (buy side, green) */}
          <div style={{ flex:1, overflowY:'auto', scrollbarWidth:'none' }}>
            {book.bids.map((bid, i) => {
              const pct = (parseFloat(bid[1]) / maxBid) * 100;
              const sum = book.bids.slice(0, i+1).reduce((a,o) => a + parseFloat(o[1]), 0);
              return (
                <div key={i} className="fut-ob-row">
                  <div className="fut-ob-depth" style={{ width:`${pct}%`, background:'#0ecb81' }} />
                  <span style={{ color:'#0ecb81', zIndex:1, fontWeight:600 }}>{parseFloat(bid[0]).toFixed(2)}</span>
                  <span style={{ color:'#c6cad2', zIndex:1 }}>{parseFloat(bid[1]).toFixed(3)}</span>
                  <span style={{ color:'#848e9c', zIndex:1 }}>{sum.toFixed(3)}</span>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <div className="fut-ob-header"><span>Price</span><span>Amount</span><span>Time</span></div>
          <div style={{ flex:1, overflowY:'auto', scrollbarWidth:'none' }}>
            {trades.map((t, i) => (
              <div key={i} className="trades-row">
                <span style={{ color: t.isBuy ? '#0ecb81':'#f6465d', fontWeight:600 }}>{t.price}</span>
                <span style={{ color:'#c6cad2' }}>{t.qty}</span>
                <span style={{ color:'#5e6673' }}>{t.time}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

/* ─── Position Card ──────────────────────────────────────────────── */
const PositionCard = ({ pos, currentPrice, onClose }) => {
  const isLong = pos.type === 'buy' || pos.side === 'Buy';
  const entry  = parseFloat(pos.entryPrice || 0);
  const size   = parseFloat(pos.amount || 0);
  const lev    = parseFloat(pos.leverage || 1);
  const mark   = parseFloat(currentPrice || entry);
  const pnl    = isLong ? (mark - entry) * (size / entry) * lev : (entry - mark) * (size / entry) * lev;
  const pnlPct = entry > 0 ? ((pnl / size) * 100).toFixed(2) : '0.00';
  const liq    = isLong ? (entry * (1 - 1/lev)).toFixed(2) : (entry * (1 + 1/lev)).toFixed(2);

  return (
    <div className={`pos-card ${isLong ? 'long':'short'}`}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span className={`pos-badge ${isLong?'long':'short'}`}>{isLong ? '↑ LONG' : '↓ SHORT'}</span>
          <span className="lev-badge">{lev}x</span>
          <span style={{ color:'#eaecef', fontSize:12, fontWeight:700 }}>{(pos.symbol||'BTC').replace('USDT','')}USDT</span>
        </div>
        <button className="close-pos-btn" onClick={() => onClose(pos._id || pos.id)}>Close</button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6, fontSize:10 }}>
        {[
          ['Size', `${size.toFixed(2)}`],
          ['Entry', entry.toFixed(2)],
          ['Mark', mark.toFixed(2)],
          ['Liq.', liq],
        ].map(([l, v]) => (
          <div key={l}>
            <div style={{ color:'#5e6673', marginBottom:2 }}>{l}</div>
            <div style={{ color:'#c6cad2', fontWeight:600 }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop:8, display:'flex', justifyContent:'flex-end', alignItems:'center', gap:8 }}>
        <span style={{ fontSize:10, color:'#5e6673' }}>PNL (ROE%)</span>
        <span className={pnl >= 0 ? 'pnl-pos':'pnl-neg'}>
          {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} USDT ({pnlPct}%)
        </span>
      </div>
    </div>
  );
};

/* ─── History Table ──────────────────────────────────────────────── */
const HistoryTable = ({ type, token }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    api.get('/api/transactions', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setData(res.data || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [token, type]);

  const filtered = type === 'all' ? data : data.filter(t => t.type === type);

  if (loading) return <div className="empty-state"><Loader2 size={16} className="spin" style={{color:'#f0b90b'}}/><span>Loading...</span></div>;
  if (!filtered.length) return (
    <div className="empty-state">
      <FileText size={28} style={{opacity:.2}}/>
      <span>No {type} history</span>
    </div>
  );

  return (
    <div style={{ overflowX:'auto' }}>
      <table style={{ width:'100%', fontSize:11, borderCollapse:'collapse' }}>
        <thead>
          <tr style={{ color:'#5e6673', borderBottom:'1px solid #1e2329' }}>
            {['Date','Type','Amount','Status'].map(h => (
              <th key={h} style={{ padding:'6px 10px', textAlign:'left', fontWeight:600, textTransform:'uppercase', fontSize:10 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((t, i) => (
            <tr key={i} style={{ borderBottom:'1px solid #1e232960' }}>
              <td style={{ padding:'7px 10px', color:'#848e9c' }}>{new Date(t.date||t.createdAt).toLocaleString()}</td>
              <td style={{ padding:'7px 10px', color: t.type==='deposit' ? '#0ecb81' : t.type==='withdraw' ? '#f6465d' : '#f0b90b', textTransform:'uppercase', fontWeight:700 }}>{t.type}</td>
              <td style={{ padding:'7px 10px', color:'#eaecef', fontWeight:600 }}>{t.amount?.toFixed(2)} {t.symbol||'USDT'}</td>
              <td style={{ padding:'7px 10px' }}>
                <span style={{ padding:'2px 8px', borderRadius:20, fontSize:10, fontWeight:700,
                  background: t.status==='completed'||t.status==='approved' ? 'rgba(14,203,129,.1)' : t.status==='rejected' ? 'rgba(246,70,93,.1)' : 'rgba(240,185,11,.1)',
                  color: t.status==='completed'||t.status==='approved' ? '#0ecb81' : t.status==='rejected' ? '#f6465d' : '#f0b90b'
                }}>{t.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* ─── Main Futures Component ─────────────────────────────────────── */
const Futures = () => {
  const { coinSymbol } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser, token } = useContext(UserContext);

  const coin = (coinSymbol || 'BTC').toUpperCase();

  const [leverage, setLeverage] = useState(20);
  const [amount, setAmount] = useState('');
  const [side, setSide] = useState('buy');
  const [orderType, setOrderType] = useState('Market');
  const [limitPrice, setLimitPrice] = useState('');
  const [tpslEnabled, setTpslEnabled] = useState(false);
  const [tpPrice, setTpPrice] = useState('');
  const [slPrice, setSlPrice] = useState('');
  const [loading, setLoading] = useState(false);

  const [currentPrice, setCurrentPrice] = useState('0.00');
  const [priceUp, setPriceUp] = useState(true);
  const [flashCls, setFlashCls] = useState('');
  const [ticker24h, setTicker24h] = useState({ change: '0.00', changePct: '0.00', high: '0', low: '0', vol: '0', markPrice: '0', fundingRate: '0.0156', countdown: '00:33:44' });

  const [activeChartTab, setActiveChartTab] = useState('Chart');
  const [activeTimeframe, setActiveTimeframe] = useState('1D');
  const [activePosTab, setActivePosTab] = useState('positions');

  const [positions, setPositions] = useState([]);
  const [posLoading, setPosLoading] = useState(false);

  const [tickerCoins] = useState(['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT']);

  const tfMap = { '1s':'1','15m':'15','1H':'60','4H':'240','1D':'1D','1W':'1W' };

  const prevRef = useRef(null);

  // Live price WebSocket
  useEffect(() => {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${coin.toLowerCase()}usdt@ticker`);
    ws.onmessage = (e) => {
      const d = JSON.parse(e.data);
      const price = parseFloat(d.c);
      const up = prevRef.current === null ? true : price >= prevRef.current;
      prevRef.current = price;
      setPriceUp(up);
      setFlashCls(up ? 'fg' : 'fr');
      setTimeout(() => setFlashCls(''), 420);
      setCurrentPrice(price.toFixed(2));
      setTicker24h(prev => ({
        ...prev,
        change: parseFloat(d.p).toFixed(2),
        changePct: parseFloat(d.P).toFixed(2),
        high: parseFloat(d.h).toFixed(2),
        low: parseFloat(d.l).toFixed(2),
        vol: (parseFloat(d.v)).toLocaleString(undefined, {maximumFractionDigits:0}),
        markPrice: (price + Math.random()*0.5 - 0.25).toFixed(2),
      }));
    };
    ws.onerror = () => ws.close();
    return () => ws.close();
  }, [coin]);

  const fetchPositions = useCallback(async () => {
    if (!token) return;
    setPosLoading(true);
    try {
      const res = await api.get('/api/futures/positions', { headers: { Authorization: `Bearer ${token}` } });
      const data = res.data?.positions || res.data || [];
      setPositions(Array.isArray(data) ? data : []);
    } catch { setPositions([]); }
    finally { setPosLoading(false); }
  }, [token]);

  useEffect(() => { fetchPositions(); }, [fetchPositions]);

  const handleTrade = async () => {
    if (!amount || parseFloat(amount) <= 0) return toast.error('Enter a valid amount');
    if (parseFloat(amount) > (user?.balance || 0)) return toast.error('Insufficient balance');
    setLoading(true);
    try {
      const payload = {
        type: side, amount: parseFloat(amount),
        leverage: Number(leverage), symbol: coin,
        entryPrice: parseFloat(currentPrice),
        ...(tpslEnabled && tpPrice ? { tp: parseFloat(tpPrice) } : {}),
        ...(tpslEnabled && slPrice ? { sl: parseFloat(slPrice) } : {}),
      };
      const res = await api.post('/api/futures/trade', payload, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.trade || res.data.message) {
        toast.success(res.data.message || 'Trade placed!');
        setAmount(''); setTpPrice(''); setSlPrice('');
        await Promise.all([refreshUser?.(), fetchPositions()]);
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Trade failed'); }
    finally { setLoading(false); }
  };

  const handleClosePosition = async (posId) => {
    if (!posId) return;
    try {
      await api.post(`/api/futures/close/${posId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Position closed');
      await Promise.all([refreshUser?.(), fetchPositions()]);
    } catch (err) { toast.error(err.response?.data?.message || 'Could not close'); }
  };

  const changePctNum = parseFloat(ticker24h.changePct);
  const changeColor = changePctNum >= 0 ? '#0ecb81' : '#f6465d';

  const sliderMarks = [1, 25, 50, 75, 100];

  return (
    <>
      <FuturesStyles />
      <div className="fut-wrap">

        {/* ── TOP TICKER BAR ── */}
        <div className="fut-ticker-bar">
          {tickerCoins.map(tc => (
            <div key={tc} className={`fut-ticker-item ${tc === `${coin}USDT` ? 'active' : ''}`}
              onClick={() => navigate(`/futures/${tc.replace('USDT','')}`)}>
              <span style={{ color: tc===`${coin}USDT` ? '#eaecef':'#848e9c', fontWeight:700, fontSize:12 }}>{tc}</span>
            </div>
          ))}
        </div>

        {/* ── HEADER INFO BAR ── */}
        <div className="fut-header">
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer' }}>
              <div style={{ width:24, height:24, background:'#f0b90b', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:900, color:'#0b0e11' }}>
                {coin[0]}
              </div>
              <span style={{ color:'#eaecef', fontWeight:700, fontSize:16 }}>{coin}USDT</span>
              <span style={{ background:'#2b3139', color:'#848e9c', fontSize:9, padding:'2px 6px', borderRadius:3, fontWeight:700 }}>Perp</span>
              <ChevronDown size={13} style={{ color:'#848e9c' }} />
            </div>
            {/* Big price */}
            <div>
              <div className={flashCls} style={{ color: priceUp ? '#0ecb81':'#f6465d', fontSize:20, fontWeight:700, fontVariantNumeric:'tabular-nums', lineHeight:1 }}>
                {parseFloat(currentPrice).toLocaleString(undefined,{minimumFractionDigits:2})}
              </div>
              <div style={{ color: changeColor, fontSize:11, marginTop:2 }}>
                {changePctNum >= 0 ? '+':''}{ticker24h.change} ({ticker24h.changePct}%)
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display:'flex', gap:20, overflow:'hidden' }}>
            {[
              { label:'Mark', val: ticker24h.markPrice },
              { label:`Funding (8h)`, val: `${ticker24h.fundingRate}% / ${ticker24h.countdown}` },
              { label:'24h High', val: ticker24h.high },
              { label:'24h Low', val: ticker24h.low },
              { label:'24h Vol', val: ticker24h.vol },
            ].map(({ label, val }) => (
              <div key={label} style={{ fontSize:11 }}>
                <div style={{ color:'#5e6673', marginBottom:2 }}>{label}</div>
                <div style={{ color:'#eaecef', fontWeight:600 }}>{val}</div>
              </div>
            ))}
          </div>

          <div style={{ display:'flex', gap:12, color:'#5e6673' }}>
            <Bell size={16} style={{ cursor:'pointer' }} />
            <Settings size={16} style={{ cursor:'pointer' }} />
            <MoreHorizontal size={16} style={{ cursor:'pointer' }} />
          </div>
        </div>

        {/* ── MAIN LAYOUT ── */}
        <div className="fut-main">

          {/* ── LEFT: Order Book ── */}
          <div className="fut-left">
            <FuturesOrderBook symbol={coin} currentPrice={currentPrice} priceUp={priceUp} />
          </div>

          {/* ── CENTER: Chart + Positions ── */}
          <div className="fut-center">

            {/* Chart tabs */}
            <div className="fut-chart-tabs">
              {['Chart', 'Info', 'Trading Data'].map(t => (
                <button key={t} className={`fut-chart-tab${activeChartTab===t?' active':''}`}
                  onClick={() => setActiveChartTab(t)}>{t}</button>
              ))}
              <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:10, color:'#5e6673', paddingRight:8 }}>
                <Bell size={14} style={{ cursor:'pointer' }} />
                <BarChart2 size={14} style={{ cursor:'pointer' }} />
              </div>
            </div>

            {/* Timeframe bar */}
            <div className="fut-tf-bar">
              {['1s','15m','1H','4H','1D','1W'].map(tf => (
                <button key={tf} className={`fut-tf-btn${activeTimeframe===tf?' active':''}`}
                  onClick={() => setActiveTimeframe(tf)}>{tf}</button>
              ))}
              <span style={{ color:'#5e6673', fontSize:11, marginLeft:4 }}>Original</span>
              <span style={{ color: activeChartTab==='Chart' ? '#f0b90b':'#848e9c', fontSize:11, marginLeft:8, cursor:'pointer' }}>Trading View</span>
              <span style={{ color:'#848e9c', fontSize:11, marginLeft:8, cursor:'pointer' }}>Depth</span>
            </div>

            {/* Chart / Info / Trading Data */}
            <div style={{ flex:1, minHeight:0, position:'relative', background:'#0b0e11' }}>
              {activeChartTab === 'Chart' && (
                <iframe
                  key={`${coin}-${activeTimeframe}`}
                  title="Futures Chart"
                  src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${coin}USDT.P&interval=${tfMap[activeTimeframe]||'1D'}&theme=dark&style=1&timezone=Etc%2FUTC&hide_top_toolbar=0&allow_symbol_change=0&locale=en`}
                  style={{ position:'absolute', inset:0, width:'100%', height:'100%', border:'none' }}
                />
              )}
              {activeChartTab === 'Info' && (
                <div style={{ padding:20, color:'#848e9c', fontSize:13, lineHeight:1.8 }}>
                  <h3 style={{ color:'#eaecef', marginBottom:12 }}>{coin} Perpetual Contract Info</h3>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px 24px' }}>
                    {[
                      ['Contract Type', 'Perpetual'],
                      ['Underlying Asset', `${coin}USDT`],
                      ['Settlement', 'USDT'],
                      ['Max Leverage', '125x'],
                      ['Funding Interval', '8 Hours'],
                      ['Tick Size', '0.10'],
                      ['Min Order Qty', '0.001'],
                      ['Max Order Qty', '1000'],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <span style={{ color:'#5e6673' }}>{k}: </span>
                        <span style={{ color:'#eaecef', fontWeight:600 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeChartTab === 'Trading Data' && (
                <div style={{ padding:20, color:'#848e9c', fontSize:13 }}>
                  <h3 style={{ color:'#eaecef', marginBottom:12 }}>Trading Data — {coin}USDT</h3>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px 24px' }}>
                    {[
                      ['Open Interest', `${(Math.random()*500+200).toFixed(2)}M USDT`],
                      ['Long/Short Ratio', `${(Math.random()*0.5+0.9).toFixed(2)}`],
                      ['Buy Volume', `${(Math.random()*1000+500).toFixed(0)} BTC`],
                      ['Sell Volume', `${(Math.random()*1000+500).toFixed(0)} BTC`],
                      ['Funding Rate', `${ticker24h.fundingRate}%`],
                      ['Next Funding', ticker24h.countdown],
                    ].map(([k, v]) => (
                      <div key={k} style={{ padding:'8px 0', borderBottom:'1px solid #1e2329' }}>
                        <div style={{ color:'#5e6673', fontSize:11, marginBottom:4 }}>{k}</div>
                        <div style={{ color:'#eaecef', fontWeight:700, fontSize:14 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── POSITIONS / HISTORY PANEL ── */}
            <div style={{ height:260, display:'flex', flexDirection:'column', borderTop:'1px solid #1e2329', background:'#0b0e11' }}>
              <div className="fut-pos-tabs">
                {[
                  { key:'positions', label:`Positions(${positions.length})` },
                  { key:'open_orders', label:'Open Orders(0)' },
                  { key:'order_history', label:'Order History' },
                  { key:'trade_history', label:'Trade History' },
                  { key:'transaction', label:'Transaction History' },
                  { key:'position_history', label:'Position History' },
                  { key:'assets', label:'Assets' },
                ].map(t => (
                  <button key={t.key} className={`fut-pos-tab${activePosTab===t.key?' active':''}`}
                    onClick={() => { setActivePosTab(t.key); if(t.key==='positions') fetchPositions(); }}>
                    {t.label}
                  </button>
                ))}
                <button onClick={fetchPositions} style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', color:'#5e6673' }}>
                  <RefreshCw size={12} className={posLoading ? 'spin':''} />
                </button>
              </div>

              <div style={{ flex:1, overflowY:'auto', scrollbarWidth:'thin', scrollbarColor:'#2b3139 transparent' }}>
                {activePosTab === 'positions' && (
                  <>
                    {posLoading && <div className="empty-state"><Loader2 size={16} className="spin" style={{color:'#f0b90b'}}/></div>}
                    {!posLoading && positions.length === 0 && (
                      <div className="empty-state">
                        <FileText size={28} style={{ opacity:.2 }} />
                        <span>You have no open positions.</span>
                      </div>
                    )}
                    {!posLoading && positions.map((pos, i) => (
                      <PositionCard key={pos._id||i} pos={pos} currentPrice={currentPrice} onClose={handleClosePosition} />
                    ))}
                  </>
                )}
                {activePosTab === 'open_orders' && (
                  <div className="empty-state"><FileText size={28} style={{opacity:.2}}/><span>You have no open orders.</span></div>
                )}
                {(activePosTab === 'order_history' || activePosTab === 'trade_history') && (
                  <HistoryTable type="trade" token={token} />
                )}
                {activePosTab === 'transaction' && (
                  <HistoryTable type="all" token={token} />
                )}
                {activePosTab === 'position_history' && (
                  <HistoryTable type="trade" token={token} />
                )}
                {activePosTab === 'assets' && (
                  <div style={{ padding:'12px 16px', fontSize:12 }}>
                    {[
                      ['Wallet Balance', `${(user?.balance||0).toFixed(4)} USDT`],
                      ['Margin Balance', `${(user?.balance||0).toFixed(4)} USDT`],
                      ['Unrealized PNL', '0.00 USDT'],
                      ['Maintenance Margin', '0.0000 USDT'],
                    ].map(([l,v]) => (
                      <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid #1e2329' }}>
                        <span style={{ color:'#5e6673' }}>{l}</span>
                        <span style={{ color:'#eaecef', fontWeight:600 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Trade Form + Account ── */}
          <div className="fut-right">
            {/* Cross/Leverage selector */}
            <div style={{ display:'flex', gap:6, padding:'10px 12px', borderBottom:'1px solid #1e2329' }}>
              <button style={{ flex:1, background:'#2b3139', border:'none', borderRadius:4, padding:'6px 0', fontSize:11, fontWeight:700, color:'#eaecef', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}>
                Cross <ChevronDown size={10} style={{color:'#848e9c'}}/>
              </button>
              <button style={{ flex:1, background:'#2b3139', border:'none', borderRadius:4, padding:'6px 0', fontSize:11, fontWeight:700, color:'#eaecef', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}>
                {leverage}x <ChevronDown size={10} style={{color:'#848e9c'}}/>
              </button>
              <button style={{ background:'#2b3139', border:'none', borderRadius:4, padding:'6px 8px', color:'#848e9c', cursor:'pointer' }}>
                S
              </button>
            </div>

            {/* Order type tabs */}
            <div style={{ display:'flex', padding:'0 8px', borderBottom:'1px solid #1e2329' }}>
              {['Limit','Market','Conditional'].map(t => (
                <button key={t} className={`order-type-tab${orderType===t?' active':''}`}
                  onClick={() => setOrderType(t)}>{t}</button>
              ))}
            </div>

            <div style={{ padding:'12px 12px', display:'flex', flexDirection:'column', gap:10, flex:1, overflowY:'auto' }}>
              {/* Buy/Sell toggle */}
              <div style={{ display:'flex', gap:6 }}>
                <button className="trade-type-btn buy-btn" onClick={() => setSide('buy')}
                  style={{ opacity: side==='buy' ? 1:0.45 }}>Buy/Long</button>
                <button className="trade-type-btn sell-btn" onClick={() => setSide('sell')}
                  style={{ opacity: side==='sell' ? 1:0.45 }}>Sell/Short</button>
              </div>

              {/* Avbl */}
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:11 }}>
                <span style={{ color:'#5e6673' }}>Avbl</span>
                <span style={{ color:'#eaecef', fontWeight:600 }}>{(user?.balance||0).toFixed(2)} USDT <span style={{ color:'#f0b90b', cursor:'pointer', fontSize:11 }}>⇄</span></span>
              </div>

              {/* Limit price (if Limit) */}
              {orderType === 'Limit' && (
                <div>
                  <div style={{ fontSize:10, color:'#5e6673', marginBottom:4 }}>Price</div>
                  <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                    <input className="fut-input" type="number" value={limitPrice}
                      onChange={e => setLimitPrice(e.target.value)} placeholder={currentPrice} />
                    <span style={{ color:'#848e9c', fontSize:11, minWidth:40 }}>USDT</span>
                    <button style={{ background:'#2b3139', border:'none', borderRadius:3, padding:'4px 8px', color:'#848e9c', fontSize:10, cursor:'pointer' }}>BBO</button>
                  </div>
                </div>
              )}

              {/* Size */}
              <div>
                <div style={{ fontSize:10, color:'#5e6673', marginBottom:4 }}>Size</div>
                <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                  <input className="fut-input" type="number" value={amount}
                    onChange={e => setAmount(e.target.value)} placeholder="0.000" />
                  <span style={{ color:'#848e9c', fontSize:11, minWidth:40 }}>USDT <ChevronDown size={10} style={{display:'inline'}}/></span>
                </div>
              </div>

              {/* Leverage slider */}
              <div>
                <div className="leverage-track" onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = (e.clientX - rect.left) / rect.width;
                  setLeverage(Math.round(Math.max(1, Math.min(125, pct * 125))));
                }}>
                  <div className="leverage-fill" style={{ width:`${(leverage/125)*100}%` }} />
                  <div className="leverage-thumb" style={{ left:`${(leverage/125)*100}%` }} />
                </div>
                <div className="leverage-marks">
                  {sliderMarks.map(m => (
                    <span key={m} className="leverage-mark" onClick={() => setLeverage(m=== 100 ? 100 : m)}>{m}%</span>
                  ))}
                </div>
              </div>

              {/* TP/SL toggle */}
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div onClick={() => setTpslEnabled(v => !v)} style={{ width:28, height:16, background: tpslEnabled ? '#f0b90b':'#2b3139', borderRadius:8, position:'relative', cursor:'pointer', transition:'background .2s', flexShrink:0 }}>
                  <div style={{ width:12, height:12, background:'#fff', borderRadius:'50%', position:'absolute', top:2, left: tpslEnabled ? 14:2, transition:'left .2s' }} />
                </div>
                <span style={{ fontSize:11, color:'#848e9c', cursor:'pointer' }} onClick={() => setTpslEnabled(v=>!v)}>TP/SL</span>
              </div>

              {tpslEnabled && (
                <div style={{ display:'flex', gap:8 }}>
                  <input className="fut-input" type="number" value={tpPrice} onChange={e => setTpPrice(e.target.value)} placeholder="Take Profit" style={{ flex:1 }} />
                  <input className="fut-input" type="number" value={slPrice} onChange={e => setSlPrice(e.target.value)} placeholder="Stop Loss" style={{ flex:1 }} />
                </div>
              )}

              {/* Cost/Max display */}
              <div style={{ fontSize:10, color:'#5e6673', display:'flex', justifyContent:'space-between' }}>
                <span>Cost: <span style={{color:'#eaecef'}}>0.00 USDT</span></span>
                <span>Max: <span style={{color:'#eaecef'}}>0.000 {coin}</span></span>
              </div>

              {/* Submit button */}
              <button onClick={handleTrade} disabled={loading}
                style={{ width:'100%', padding:'13px 0', border:'none', borderRadius:6, fontSize:14, fontWeight:700,
                  cursor: loading ? 'not-allowed':'pointer',
                  background: loading ? '#2b3139' : side==='buy' ? '#0ecb81':'#f6465d',
                  color: loading ? '#5e6673' : side==='buy' ? '#0b0e11':'#fff',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                {loading ? <><Loader2 size={14} className="spin"/> Processing...</>
                  : side==='buy' ? <><TrendingUp size={14}/> Buy / Long</>
                  : <><TrendingDown size={14}/> Sell / Short</>}
              </button>

              {/* Liq Price row */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, fontSize:10 }}>
                <div>
                  <div style={{ color:'#5e6673' }}>Liq Price</div>
                  <div style={{ color:'#eaecef' }}>-- USDT</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ color:'#5e6673' }}>Liq Price</div>
                  <div style={{ color:'#eaecef' }}>-- USDT</div>
                </div>
              </div>
            </div>

            {/* ── ACCOUNT PANEL ── */}
            <div className="acct-panel">
              <div style={{ fontSize:12, fontWeight:700, color:'#eaecef', marginBottom:10 }}>Account</div>
              <div style={{ fontSize:11, fontWeight:700, color:'#848e9c', marginBottom:8 }}>Margin Ratio</div>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                <div style={{ width:28, height:28, borderRadius:'50%', background:'conic-gradient(#0ecb81 0%, #1e2329 0%)', border:'3px solid #1e2329', display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, color:'#0ecb81', fontWeight:700 }}>⊙</div>
                <span style={{ color:'#0ecb81', fontSize:13, fontWeight:700 }}>0.00%</span>
              </div>
              {[
                ['Margin Ratio', '0.00%'],
                ['Maintenance Margin', '0.0000 USDT'],
                ['Margin Balance', `${(user?.balance||0).toFixed(4)} USDT`],
              ].map(([l,v]) => (
                <div key={l} className="acct-row">
                  <span style={{ color:'#5e6673' }}>{l}</span>
                  <span style={{ color:'#eaecef', fontWeight:600 }}>{v}</span>
                </div>
              ))}
              <button style={{ width:'100%', marginTop:10, padding:'7px 0', background:'#2b3139', border:'none', borderRadius:4, color:'#eaecef', fontSize:11, fontWeight:600, cursor:'pointer' }}>
                Single-Asset Mode
              </button>
              <div style={{ display:'flex', gap:6, marginTop:8 }}>
                {['Transfer','Buy Crypto','Swap'].map(b => (
                  <button key={b} style={{ flex:1, padding:'6px 0', background:'#2b3139', border:'none', borderRadius:4, color:'#eaecef', fontSize:10, fontWeight:600, cursor:'pointer' }}>{b}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── BOTTOM TICKER MARQUEE ── */}
        <div className="bottom-ticker">
          <div className="ticker-scroll">
            {['BTCUSDT','ETHUSDT','BNBUSDT','SOLUSDT','XRPUSDT','DOGEUSDT','ADAUSDT','AVAXUSDT'].flatMap(s => [
              <span key={s} style={{ color:'#5e6673', fontWeight:700 }}>{s}</span>,
              <span key={`${s}v`} style={{ color:'#0ecb81' }}>+1.23%</span>,
            ])}
          </div>
        </div>
      </div>
    </>
  );
};

export default Futures;
