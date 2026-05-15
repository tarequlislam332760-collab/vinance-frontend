import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import {
  Star, Bell, MoreHorizontal, ChevronDown, Search,
  TrendingUp, TrendingDown, Loader2, FileText, RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const API_BASE = "https://vinance-backend-1.onrender.com";

/* ══════════════ STYLES ══════════════ */
const TradeStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;600;700&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    .sp{font-family:'Roboto Mono',monospace;background:#0b0e11;color:#848e9c;min-height:100dvh;display:flex;flex-direction:column;font-size:12px;}
    .sp-header{display:flex;align-items:center;gap:16px;padding:10px 14px;background:#0b0e11;border-bottom:1px solid #1e2329;flex-wrap:wrap;flex-shrink:0;}
    .sp-sec-tabs{display:flex;padding:0 10px;background:#0b0e11;border-bottom:1px solid #1e2329;overflow-x:auto;scrollbar-width:none;flex-shrink:0;}
    .sp-sec-tabs::-webkit-scrollbar{display:none;}
    .sp-sec-tab{padding:9px 14px 7px;font-size:13px;background:transparent;border:none;color:#848e9c;cursor:pointer;border-bottom:2px solid transparent;white-space:nowrap;font-family:inherit;transition:all .15s;}
    .sp-sec-tab.active{color:#eaecef;border-bottom-color:#f0b90b;font-weight:700;}
    .sp-main{display:flex;flex:1;overflow:hidden;min-height:0;}
    .sp-left{width:260px;flex-shrink:0;border-right:1px solid #1e2329;display:flex;flex-direction:column;background:#0b0e11;overflow:hidden;}
    .sp-center{flex:1;display:flex;flex-direction:column;min-width:0;}
    .sp-right{width:360px;flex-shrink:0;border-left:1px solid #1e2329;display:flex;flex-direction:column;background:#0b0e11;overflow-y:auto;}
    .sp-tf-bar{display:flex;align-items:center;gap:2px;padding:5px 8px;background:#161a1e;border-bottom:1px solid #1e2329;overflow-x:auto;scrollbar-width:none;flex-shrink:0;}
    .sp-tf-bar::-webkit-scrollbar{display:none;}
    .sp-tf-btn{padding:4px 10px;font-size:11px;border-radius:3px;border:none;background:transparent;color:#848e9c;cursor:pointer;white-space:nowrap;font-family:inherit;transition:all .15s;}
    .sp-tf-btn.active{background:#2b3139;color:#eaecef;font-weight:700;}
    .sp-ob-row{display:flex;justify-content:space-between;align-items:center;padding:2px 8px;position:relative;font-size:11px;cursor:pointer;}
    .sp-ob-row:hover{background:rgba(255,255,255,.03);}
    .sp-ob-depth{position:absolute;right:0;top:0;bottom:0;opacity:.12;pointer-events:none;}
    .sp-pos-tabs{display:flex;gap:0;padding:0 12px;border-bottom:1px solid #1e2329;overflow-x:auto;scrollbar-width:none;flex-shrink:0;}
    .sp-pos-tabs::-webkit-scrollbar{display:none;}
    .sp-pos-tab{padding:9px 14px 7px;font-size:12px;background:transparent;border:none;border-bottom:2px solid transparent;color:#5e6673;cursor:pointer;white-space:nowrap;font-family:inherit;transition:all .15s;}
    .sp-pos-tab.active{color:#eaecef;border-bottom-color:#f0b90b;font-weight:700;}
    .sp-input{width:100%;background:#2b3139;border:1px solid #2b3139;border-radius:4px;padding:10px 70px 10px 12px;color:#eaecef;font-size:13px;outline:none;transition:border .15s;font-family:inherit;}
    .sp-input:focus{border-color:#f0b90b;}
    .sp-input::placeholder{color:#5e6673;}
    .sp-input-wrap{position:relative;}
    .sp-input-sfx{position:absolute;right:10px;top:50%;transform:translateY(-50%);color:#848e9c;font-size:11px;font-weight:700;pointer-events:none;}
    .sp-ot-btn{padding:8px 14px;font-size:12px;border:none;background:transparent;cursor:pointer;color:#848e9c;border-bottom:2px solid transparent;font-family:inherit;transition:all .15s;}
    .sp-ot-btn.active{color:#eaecef;border-bottom-color:#f0b90b;font-weight:700;}
    .sp-pct-btn{flex:1;padding:4px 0;background:#2b3139;border:none;border-radius:2px;font-size:10px;color:#848e9c;cursor:pointer;font-family:inherit;transition:all .15s;}
    .sp-pct-btn:hover{color:#f0b90b;background:#333a44;}
    .sp-buy-btn{width:100%;padding:14px 0;border:none;border-radius:6px;background:#0ecb81;color:#fff;font-size:15px;font-weight:800;cursor:pointer;font-family:inherit;transition:background .15s;letter-spacing:.3px;}
    .sp-buy-btn:hover:not(:disabled){background:#0fb574;}
    .sp-buy-btn:disabled{opacity:.45;cursor:not-allowed;}
    .sp-sell-btn{width:100%;padding:14px 0;border:none;border-radius:6px;background:#f6465d;color:#fff;font-size:15px;font-weight:800;cursor:pointer;font-family:inherit;transition:background .15s;letter-spacing:.3px;}
    .sp-sell-btn:hover:not(:disabled){background:#e03d52;}
    .sp-sell-btn:disabled{opacity:.45;cursor:not-allowed;}
    .pair-row{display:flex;justify-content:space-between;align-items:center;padding:7px 12px;cursor:pointer;transition:background .1s;}
    .pair-row:hover{background:#161a1e;}
    .pair-row.active-pair{background:#1e2329;}
    .mover-row{display:flex;justify-content:space-between;align-items:center;padding:5px 12px;font-size:11px;}
    .trades-row{display:flex;justify-content:space-between;padding:3px 8px;font-size:11px;}
    .empty-st{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 0;gap:8px;color:#404854;font-size:11px;}
    .sl-track{width:100%;height:3px;background:#2b3139;border-radius:2px;position:relative;cursor:pointer;}
    .sl-fill{height:100%;border-radius:2px;transition:width .1s;}
    .sl-thumb{width:12px;height:12px;border-radius:50%;position:absolute;top:-4.5px;transform:translateX(-50%);cursor:pointer;box-shadow:0 0 0 2px #0b0e11;}
    @keyframes spin{to{transform:rotate(360deg)}}
    .spin{animation:spin .8s linear infinite}
    @keyframes fG{0%{background:rgba(14,203,129,.18)}100%{background:transparent}}
    @keyframes fR{0%{background:rgba(246,70,93,.18)}100%{background:transparent}}
    .fg{animation:fG .4s ease-out}
    .fr{animation:fR .4s ease-out}
    /* RESPONSIVE */
    @media(max-width:1200px){
      .sp-left{width:200px;}
      .sp-right{width:300px;}
    }
    @media(max-width:900px){
      .sp-left{display:none;}
      .sp-right{width:280px;}
    }
    @media(max-width:680px){
      .sp-main{flex-direction:column;overflow-y:auto;}
      .sp-right{width:100%;border-left:none;border-top:1px solid #1e2329;max-height:none;}
      .sp-chart-iframe{min-height:280px !important;}
    }
    ::-webkit-scrollbar{width:3px;height:3px}
    ::-webkit-scrollbar-thumb{background:#2b3139}
    ::-webkit-scrollbar-track{background:transparent}
    input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}
    input[type=number]{-moz-appearance:textfield}
  `}</style>
);

/* ══════════════ ORDER BOOK ══════════════ */
const OrderBook = ({ symbol, currentPrice, priceUp }) => {
  const [book, setBook] = useState({ asks: [], bids: [] });
  const [trades, setTrades] = useState([]);
  const [view, setView] = useState('book');
  const wbRef = useRef(null);
  const wtRef = useRef(null);

  useEffect(() => {
    const sym = `${symbol.toLowerCase()}usdt`;
    wbRef.current = new WebSocket(`wss://stream.binance.com:9443/ws/${sym}@depth10@500ms`);
    wbRef.current.onmessage = e => {
      const d = JSON.parse(e.data);
      setBook({ asks: (d.a || []).slice(0, 12).reverse(), bids: (d.b || []).slice(0, 12) });
    };
    wtRef.current = new WebSocket(`wss://stream.binance.com:9443/ws/${sym}@trade`);
    wtRef.current.onmessage = e => {
      const d = JSON.parse(e.data);
      setTrades(p => [{
        price: parseFloat(d.p).toFixed(2),
        qty: parseFloat(d.q).toFixed(4),
        time: new Date(d.T).toTimeString().slice(0, 8),
        isBuy: !d.m
      }, ...p].slice(0, 40));
    };
    return () => { wbRef.current?.close(); wtRef.current?.close(); };
  }, [symbol]);

  const maxA = book.asks.length ? Math.max(...book.asks.map(o => parseFloat(o[1]))) : 1;
  const maxB = book.bids.length ? Math.max(...book.bids.map(o => parseFloat(o[1]))) : 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', borderBottom: '1px solid #1e2329', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {['book', 'trades'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{ background: view === v ? '#2b3139' : 'transparent', border: 'none', borderRadius: 3, padding: '3px 8px', color: view === v ? '#eaecef' : '#5e6673', cursor: 'pointer', fontSize: 10, fontWeight: 600, fontFamily: 'inherit' }}>
              {v === 'book' ? 'Order Book' : 'Market Trades'}
            </button>
          ))}
        </div>
        <MoreHorizontal size={13} style={{ color: '#5e6673', cursor: 'pointer' }} />
      </div>

      {view === 'book' ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', fontSize: 10, color: '#5e6673', flexShrink: 0, fontWeight: 600 }}>
            <span>Price (USDT)</span><span>Amount ({symbol})</span><span>Total</span>
          </div>
          {/* Asks */}
          <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none' }}>
            {book.asks.map((ask, i) => {
              const pct = (parseFloat(ask[1]) / maxA) * 100;
              const total = (parseFloat(ask[0]) * parseFloat(ask[1])).toFixed(0);
              return (
                <div key={i} className="sp-ob-row">
                  <div className="sp-ob-depth" style={{ width: `${pct}%`, background: '#f6465d' }} />
                  <span style={{ color: '#f6465d', fontWeight: 600, zIndex: 1 }}>{parseFloat(ask[0]).toFixed(2)}</span>
                  <span style={{ color: '#c6cad2', zIndex: 1 }}>{parseFloat(ask[1]).toFixed(5)}</span>
                  <span style={{ color: '#848e9c', zIndex: 1 }}>{total}</span>
                </div>
              );
            })}
          </div>
          {/* Mid price */}
          <div style={{ textAlign: 'center', padding: '7px 8px', borderTop: '1px solid #1e2329', borderBottom: '1px solid #1e2329', flexShrink: 0, background: priceUp ? 'rgba(14,203,129,.04)' : 'rgba(246,70,93,.04)' }}>
            <div style={{ color: priceUp ? '#0ecb81' : '#f6465d', fontSize: 16, fontWeight: 800 }}>
              {parseFloat(currentPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: 9, color: '#5e6673' }}>≈ ${parseFloat(currentPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
          {/* Bids */}
          <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none' }}>
            {book.bids.map((bid, i) => {
              const pct = (parseFloat(bid[1]) / maxB) * 100;
              const total = (parseFloat(bid[0]) * parseFloat(bid[1])).toFixed(0);
              return (
                <div key={i} className="sp-ob-row">
                  <div className="sp-ob-depth" style={{ width: `${pct}%`, background: '#0ecb81' }} />
                  <span style={{ color: '#0ecb81', fontWeight: 600, zIndex: 1 }}>{parseFloat(bid[0]).toFixed(2)}</span>
                  <span style={{ color: '#c6cad2', zIndex: 1 }}>{parseFloat(bid[1]).toFixed(5)}</span>
                  <span style={{ color: '#848e9c', zIndex: 1 }}>{total}</span>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', fontSize: 10, color: '#5e6673', flexShrink: 0, fontWeight: 600 }}>
            <span>Price (USDT)</span><span>Amount ({symbol})</span><span>Time</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none' }}>
            {trades.map((t, i) => (
              <div key={i} className="trades-row">
                <span style={{ color: t.isBuy ? '#0ecb81' : '#f6465d', fontWeight: 600 }}>{t.price}</span>
                <span style={{ color: '#c6cad2' }}>{t.qty}</span>
                <span style={{ color: '#5e6673' }}>{t.time}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Search + Pairs List */}
      <div style={{ borderTop: '1px solid #1e2329', flexShrink: 0 }}>
        <div style={{ padding: '6px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#2b3139', borderRadius: 4, padding: '5px 8px' }}>
            <Search size={11} style={{ color: '#5e6673' }} />
            <input type="text" placeholder="Search" style={{ background: 'transparent', border: 'none', outline: 'none', color: '#eaecef', fontSize: 11, width: '100%', fontFamily: 'inherit' }} />
          </div>
        </div>
        <div style={{ display: 'flex', padding: '0 6px', borderBottom: '1px solid #1e2329', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {['New', 'USDC', 'USDT', 'U', 'USD1'].map(t => (
            <button key={t} style={{ padding: '5px 8px', fontSize: 10, background: 'transparent', border: 'none', color: t === 'USDT' ? '#eaecef' : '#5e6673', fontWeight: t === 'USDT' ? 700 : 400, borderBottom: t === 'USDT' ? '2px solid #f0b90b' : '2px solid transparent', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit' }}>{t}</button>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 12px', fontSize: 9, color: '#5e6673', fontWeight: 600 }}>
          <span>Pair ↑</span><span>Last Price / 24h Chg ↑</span>
        </div>
        <div style={{ maxHeight: 200, overflowY: 'auto' }}>
          {[{ s: 'BTC', c: '+1.23' }, { s: 'ETH', c: '-0.87' }, { s: 'BNB', c: '+2.10' }, { s: 'SOL', c: '+3.45' }, { s: 'XRP', c: '-1.20' }, { s: 'ADA', c: '+0.67' }, { s: 'DOGE', c: '+5.32' }, { s: 'AVAX', c: '-2.11' }, { s: 'MATIC', c: '+1.89' }, { s: 'LTC', c: '+0.34' }, { s: 'LINK', c: '+4.21' }, { s: 'DOT', c: '-0.55' }].map(p => (
            <div key={p.s} className={`pair-row${symbol === p.s ? ' active-pair' : ''}`}>
              <div>
                <div style={{ color: '#eaecef', fontWeight: 700, fontSize: 11 }}>{p.s}/USDT</div>
                <div style={{ color: '#5e6673', fontSize: 10 }}>5x</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#eaecef', fontSize: 10 }}>—</div>
                <div style={{ color: parseFloat(p.c) >= 0 ? '#0ecb81' : '#f6465d', fontSize: 10, fontWeight: 700 }}>{p.c}%</div>
              </div>
            </div>
          ))}
        </div>
        {/* Top Movers */}
        <div style={{ borderTop: '1px solid #1e2329' }}>
          <div style={{ padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#eaecef', fontWeight: 700, fontSize: 11 }}>Top Movers</span>
            <span style={{ color: '#5e6673', fontSize: 10, cursor: 'pointer' }}>FAQ</span>
            <ChevronDown size={11} style={{ color: '#5e6673', marginLeft: 'auto', cursor: 'pointer' }} />
          </div>
          {[{ s: 'DOGE', v: '+5.32' }, { s: 'LINK', v: '+4.21' }, { s: 'SOL', v: '+3.45' }].map(m => (
            <div key={m.s} className="mover-row">
              <span style={{ color: '#eaecef', fontWeight: 700 }}>{m.s}/USDT</span>
              <span style={{ color: '#0ecb81', fontWeight: 700 }}>{m.v}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ══════════════ HISTORY TABLE ══════════════ */
const HistoryTable = ({ token }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = () => {
    if (!token) return;
    setLoading(true);
    axios.get(`${API_BASE}/api/transactions`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setData(r.data || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [token]);

  if (loading) return <div className="empty-st"><Loader2 size={16} className="spin" style={{ color: '#f0b90b' }} /></div>;
  if (!data.length) return <div className="empty-st"><FileText size={28} style={{ opacity: .15 }} /><span>No history found.</span></div>;

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #1e2329' }}>
            {['Date', 'Pair', 'Type', 'Amount', 'Status'].map(h => (
              <th key={h} style={{ padding: '6px 10px', color: '#5e6673', textAlign: 'left', fontWeight: 600, fontSize: 10, whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((t, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #1e232960' }}>
              <td style={{ padding: '7px 10px', color: '#848e9c', whiteSpace: 'nowrap' }}>{new Date(t.createdAt || t.date).toLocaleString()}</td>
              <td style={{ padding: '7px 10px', color: '#eaecef', fontWeight: 700 }}>{(t.symbol || 'USDT')}/USDT</td>
              <td style={{ padding: '7px 10px', color: t.type?.includes('buy') ? '#0ecb81' : t.type?.includes('sell') ? '#f6465d' : '#f0b90b', fontWeight: 700, textTransform: 'uppercase' }}>{(t.type || '').replace('spot-', '').replace('futures-', 'F-')}</td>
              <td style={{ padding: '7px 10px', color: '#eaecef', fontFamily: 'monospace' }}>${(t.amount || 0).toFixed(2)}</td>
              <td style={{ padding: '7px 10px' }}>
                <span style={{
                  padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700,
                  background: t.status === 'approved' || t.status === 'completed' ? 'rgba(14,203,129,.1)' : t.status === 'rejected' ? 'rgba(246,70,93,.1)' : 'rgba(240,185,11,.1)',
                  color: t.status === 'approved' || t.status === 'completed' ? '#0ecb81' : t.status === 'rejected' ? '#f6465d' : '#f0b90b'
                }}>{t.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* ══════════════ MAIN TRADE PAGE ══════════════ */
const Trade = () => {
  const { coinSymbol } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser, token } = useContext(UserContext);
  const coin = (coinSymbol || 'BTC').toUpperCase();

  /* Live price */
  const [currentPrice, setCurrentPrice] = useState('0.00');
  const [priceUp, setPriceUp] = useState(true);
  const [flashCls, setFlashCls] = useState('');
  const [ticker, setTicker] = useState({ changePct: '0.00', change: '0.00', high: '0', low: '0', volBase: '0', volUsdt: '0' });
  const prevRef = useRef(null);

  /* UI state */
  const [secTab, setSecTab] = useState('Chart');
  const [tf, setTf] = useState('1D');
  const [otBtn, setOtBtn] = useState('Market');
  const [posTab, setPosTab] = useState('open_orders');
  const [starred, setStarred] = useState(false);

  /* Trade form */
  const [buyAmt, setBuyAmt] = useState('');
  const [sellAmt, setSellAmt] = useState('');
  const [buyPct, setBuyPct] = useState(0);
  const [sellPct, setSellPct] = useState(0);
  const [limitBuyPrice, setLimitBuyPrice] = useState('');
  const [limitSellPrice, setLimitSellPrice] = useState('');
  const [loading, setLoading] = useState(false);

  const tfMap = { '1s': '1', '15m': '15', '1H': '60', '4H': '240', '1D': 'D', '1W': 'W' };

  useEffect(() => {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${coin.toLowerCase()}usdt@ticker`);
    ws.onmessage = e => {
      const d = JSON.parse(e.data);
      const price = parseFloat(d.c);
      const up = prevRef.current === null ? true : price >= prevRef.current;
      prevRef.current = price;
      setPriceUp(up);
      setFlashCls(up ? 'fg' : 'fr');
      setTimeout(() => setFlashCls(''), 420);
      setCurrentPrice(price.toFixed(2));
      setTicker({
        changePct: parseFloat(d.P).toFixed(2),
        change: parseFloat(d.p).toFixed(2),
        high: parseFloat(d.h).toFixed(2),
        low: parseFloat(d.l).toFixed(2),
        volBase: parseFloat(d.v).toLocaleString(undefined, { maximumFractionDigits: 2 }),
        volUsdt: (parseFloat(d.q) / 1e9).toFixed(2) + 'B',
      });
    };
    ws.onerror = () => ws.close();
    return () => ws.close();
  }, [coin]);

  const handleTrade = async (side) => {
    const amt = parseFloat(side === 'buy' ? buyAmt : sellAmt);
    if (!amt || amt <= 0) return toast.error('Enter a valid amount');
    if (amt > (user?.balance || 0)) return toast.error('Insufficient balance');
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/trade`,
        { type: side, amount: amt, symbol: coin },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message || `${side === 'buy' ? 'Buy' : 'Sell'} order placed!`);
      if (side === 'buy') { setBuyAmt(''); setBuyPct(0); } else { setSellAmt(''); setSellPct(0); }
      await refreshUser?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Trade failed');
    } finally { setLoading(false); }
  };

  const setPct = (side, pct) => {
    const val = ((user?.balance || 0) * pct / 100).toFixed(2);
    if (side === 'buy') { setBuyAmt(val); setBuyPct(pct); }
    else { setSellAmt(val); setSellPct(pct); }
  };

  const dispPrice = parseFloat(currentPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const chgNum = parseFloat(ticker.changePct);
  const chgColor = chgNum >= 0 ? '#0ecb81' : '#f6465d';

  return (
    <>
      <TradeStyles />
      <div className="sp">

        {/* ── HEADER ── */}
        <div className="sp-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, background: '#f0b90b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#0b0e11', fontSize: 14, flexShrink: 0 }}>{coin[0]}</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#eaecef', fontWeight: 800, fontSize: 18, letterSpacing: -0.5 }}>{coin}/USDT</span>
                <span style={{ color: '#5e6673', fontSize: 11 }}>Bitcoin Price</span>
                <ChevronDown size={13} style={{ color: '#5e6673' }} />
              </div>
            </div>
          </div>

          {/* Live Price */}
          <div>
            <div className={flashCls} style={{ color: priceUp ? '#f6465d' : '#0ecb81', fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{dispPrice}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 3, fontSize: 11 }}>
              <span style={{ color: '#848e9c' }}>${dispPrice}</span>
              <span style={{ color: chgColor, fontWeight: 600 }}>{chgNum >= 0 ? '+' : ''}{ticker.change} ({ticker.changePct}%)</span>
            </div>
          </div>

          {/* 24h Stats */}
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
            {[['24h High', ticker.high], ['24h Low', ticker.low], [`24h Vol(${coin})`, ticker.volBase], ['24h Vol(USDT)', ticker.volUsdt]].map(([l, v]) => (
              <div key={l} style={{ fontSize: 11 }}>
                <div style={{ color: '#5e6673' }}>{l}</div>
                <div style={{ color: '#eaecef', fontWeight: 600 }}>{v}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, color: '#848e9c', marginLeft: 'auto', flexShrink: 0 }}>
            <button onClick={() => setStarred(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <Star size={18} style={starred ? { fill: '#f0b90b', color: '#f0b90b' } : { color: '#848e9c' }} />
            </button>
            <Bell size={18} style={{ cursor: 'pointer' }} />
            <MoreHorizontal size={18} style={{ cursor: 'pointer' }} />
          </div>
        </div>

        {/* ── SECTION TABS ── */}
        <div className="sp-sec-tabs">
          {['Chart', 'Info', 'Trading Data', 'Trading Analysis', 'Square'].map(t => (
            <button key={t} className={`sp-sec-tab${secTab === t ? ' active' : ''}`} onClick={() => setSecTab(t)}>{t}</button>
          ))}
        </div>

        {/* ── MAIN ── */}
        <div className="sp-main">

          {/* LEFT: Order Book + Pairs */}
          <div className="sp-left">
            <OrderBook symbol={coin} currentPrice={currentPrice} priceUp={priceUp} />
          </div>

          {/* CENTER: Chart + Bottom Tabs */}
          <div className="sp-center">
            {/* TF Bar */}
            <div className="sp-tf-bar">
              {['1s', '15m', '1H', '4H', '1D', '1W'].map(t => (
                <button key={t} className={`sp-tf-btn${tf === t ? ' active' : ''}`} onClick={() => setTf(t)}>{t}</button>
              ))}
              <span style={{ color: '#848e9c', fontSize: 11, marginLeft: 6 }}>Depth</span>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
                <span style={{ fontSize: 11, color: '#f0b90b', cursor: 'pointer' }}>Original</span>
                <span style={{ fontSize: 11, color: '#848e9c', cursor: 'pointer' }}>Trading View</span>
              </div>
            </div>

            {/* Chart */}
            <div style={{ flex: 1, minHeight: 0, position: 'relative', background: '#0b0e11' }}>
              {secTab === 'Chart' && (
                <iframe key={`${coin}-${tf}`} title="chart" className="sp-chart-iframe"
                  src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${coin}USDT&interval=${tfMap[tf] || 'D'}&theme=dark&style=1&timezone=Etc%2FUTC&hide_top_toolbar=0&allow_symbol_change=0&locale=en&withdateranges=1`}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none', minHeight: 380 }} />
              )}
              {secTab === 'Info' && (
                <div style={{ padding: 20, lineHeight: 1.9, fontSize: 12 }}>
                  <h3 style={{ color: '#eaecef', marginBottom: 12, fontSize: 15 }}>{coin}/USDT Information</h3>
                  {[['Network', 'BTC (5)'], ['Token Tags', 'Payments | PoW | Layer 1'], ['Market Cap', '$1.58T'], ['Circulating Supply', '19.7M BTC'], ['Max Supply', '21M BTC'], ['All-Time High', '$108,786']].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', gap: 16, padding: '6px 0', borderBottom: '1px solid #1e2329' }}>
                      <span style={{ color: '#5e6673', minWidth: 160 }}>{k}</span>
                      <span style={{ color: '#eaecef', fontWeight: 600 }}>{v}</span>
                    </div>
                  ))}
                </div>
              )}
              {secTab === 'Trading Data' && (
                <div style={{ padding: 20, fontSize: 12 }}>
                  <h3 style={{ color: '#eaecef', marginBottom: 12, fontSize: 15 }}>Trading Data</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
                    {[['Buy/Sell Ratio', '44.13% / 55.87%'], ['Buy Volume', `${(Math.random() * 100 + 50).toFixed(2)} BTC`], ['Sell Volume', `${(Math.random() * 100 + 50).toFixed(2)} BTC`], ['Bid/Ask Spread', '$0.01'], ['Avg. Trade Size', `${(Math.random() * 0.1 + 0.01).toFixed(4)} BTC`], ['Trade Count', `${(Math.random() * 5000 + 10000).toFixed(0)}`]].map(([k, v]) => (
                      <div key={k} style={{ padding: '8px 0', borderBottom: '1px solid #1e2329' }}>
                        <div style={{ color: '#5e6673', fontSize: 10, marginBottom: 4 }}>{k}</div>
                        <div style={{ color: '#eaecef', fontWeight: 700, fontSize: 14 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 5 }}>
                      <span style={{ color: '#0ecb81', fontWeight: 700 }}>B 44.13%</span>
                      <span style={{ color: '#f6465d', fontWeight: 700 }}>S 55.87%</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, overflow: 'hidden', display: 'flex' }}>
                      <div style={{ width: '44.13%', background: '#0ecb81' }} />
                      <div style={{ flex: 1, background: '#f6465d' }} />
                    </div>
                  </div>
                </div>
              )}
              {(secTab === 'Trading Analysis' || secTab === 'Square') && (
                <div style={{ padding: 20, fontSize: 12 }}>
                  <p style={{ color: '#eaecef', fontWeight: 700, marginBottom: 8 }}>{secTab}</p>
                  <p style={{ color: '#848e9c' }}>Coming soon...</p>
                </div>
              )}
            </div>

            {/* Bottom Tabs */}
            <div style={{ height: 260, display: 'flex', flexDirection: 'column', borderTop: '1px solid #1e2329' }}>
              <div className="sp-pos-tabs">
                {[{ k: 'open_orders', l: 'Open Orders(0)' }, { k: 'order_history', l: 'Order History' }, { k: 'trade_history', l: 'Trade History' }, { k: 'holdings', l: 'Holdings' }, { k: 'bots', l: 'Bots' }].map(t => (
                  <button key={t.k} className={`sp-pos-tab${posTab === t.k ? ' active' : ''}`} onClick={() => setPosTab(t.k)}>{t.l}</button>
                ))}
                <span style={{ marginLeft: 'auto', fontSize: 11, color: '#5e6673', alignSelf: 'center', cursor: 'pointer', paddingRight: 8 }}>Hide Other Pairs</span>
              </div>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {posTab === 'open_orders' && <div className="empty-st"><FileText size={28} style={{ opacity: .15 }} /><span>You have no open orders.</span></div>}
                {(posTab === 'order_history' || posTab === 'trade_history') && <HistoryTable token={token} />}
                {posTab === 'holdings' && (
                  <div style={{ padding: 16, fontSize: 12 }}>
                    {[['USDT Balance', `${(user?.balance || 0).toFixed(8)} USDT`], [`${coin} Balance`, `0.00000000 ${coin}`]].map(([l, v]) => (
                      <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1e2329' }}>
                        <span style={{ color: '#5e6673' }}>{l}</span>
                        <span style={{ color: '#eaecef', fontWeight: 700 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                )}
                {posTab === 'bots' && <div className="empty-st"><span>No active bots.</span></div>}
              </div>
            </div>
          </div>

          {/* RIGHT: Trade Form */}
          <div className="sp-right">
            {/* Spot/Cross/Isolated/Grid */}
            <div style={{ display: 'flex', padding: '0 10px', borderBottom: '1px solid #1e2329' }}>
              {['Spot', 'Cross', 'Isolated', 'Grid'].map(t => (
                <button key={t} style={{ padding: '9px 10px 7px', fontSize: 12, background: 'transparent', border: 'none', color: t === 'Spot' ? '#eaecef' : '#848e9c', fontWeight: t === 'Spot' ? 700 : 400, borderBottom: t === 'Spot' ? '2px solid #f0b90b' : '2px solid transparent', cursor: 'pointer', fontFamily: 'inherit' }}>{t}</button>
              ))}
              <span style={{ marginLeft: 'auto', fontSize: 11, color: '#848e9c', alignSelf: 'center', paddingRight: 4, cursor: 'pointer' }}>% Fee Level</span>
            </div>

            {/* Order Type */}
            <div style={{ display: 'flex', padding: '0 8px', borderBottom: '1px solid #1e2329' }}>
              {['Limit', 'Market', 'Stop Limit'].map(t => (
                <button key={t} className={`sp-ot-btn${otBtn === t ? ' active' : ''}`} onClick={() => setOtBtn(t)}>{t}</button>
              ))}
            </div>

            {/* Buy + Sell Side by Side */}
            <div style={{ display: 'flex', flex: 1 }}>
              {/* BUY */}
              <div style={{ flex: 1, padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 10, borderRight: '1px solid #1e2329' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#5e6673' }}>
                  <span>Avbl</span>
                  <span style={{ color: '#eaecef', fontWeight: 700 }}>{(user?.balance || 0).toFixed(2)} USDT <span style={{ color: '#f0b90b', cursor: 'pointer' }}>+</span></span>
                </div>

                {otBtn === 'Limit' && (
                  <div className="sp-input-wrap">
                    <input className="sp-input" type="number" placeholder="Price" value={limitBuyPrice} onChange={e => setLimitBuyPrice(e.target.value)} />
                    <span className="sp-input-sfx">USDT</span>
                  </div>
                )}
                {otBtn === 'Market' && (
                  <div style={{ background: '#2b3139', borderRadius: 4, padding: '9px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                    <span style={{ color: '#5e6673' }}>Price</span>
                    <span style={{ color: '#848e9c' }}>Market Price</span>
                    <span style={{ color: '#848e9c' }}>USDT</span>
                  </div>
                )}

                <div className="sp-input-wrap">
                  <input className="sp-input" type="number" placeholder="Total" value={buyAmt} onChange={e => setBuyAmt(e.target.value)} />
                  <span className="sp-input-sfx">USDT <ChevronDown size={9} style={{ display: 'inline' }} /></span>
                </div>

                {/* Slider */}
                <div>
                  <div className="sl-track" onClick={e => {
                    const r = e.currentTarget.getBoundingClientRect();
                    const p = Math.round(((e.clientX - r.left) / r.width) * 100 / 25) * 25;
                    setPct('buy', Math.min(100, Math.max(0, p)));
                  }}>
                    <div className="sl-fill" style={{ width: `${buyPct}%`, background: '#0ecb81' }} />
                    <div className="sl-thumb" style={{ left: `${buyPct}%`, background: '#0ecb81' }} />
                  </div>
                  <div style={{ display: 'flex', gap: 3, marginTop: 7 }}>
                    {[0, 25, 50, 75, 100].map(p => (
                      <button key={p} className="sp-pct-btn" onClick={() => setPct('buy', p)}>{p}%</button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input type="checkbox" style={{ accentColor: '#f0b90b' }} />
                  <span style={{ fontSize: 10, color: '#848e9c' }}>Slippage Tolerance</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 10, color: '#5e6673' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Max Buy</span><span style={{ color: '#eaecef' }}>0 {coin}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Est. Fee</span><span style={{ color: '#eaecef' }}>{buyAmt ? (parseFloat(buyAmt) * 0.001).toFixed(4) : '--'} USDT</span></div>
                </div>

                <button className="sp-buy-btn" disabled={loading || !buyAmt || parseFloat(buyAmt) <= 0} onClick={() => handleTrade('buy')}>
                  {loading ? <Loader2 size={16} className="spin" style={{ margin: '0 auto', display: 'block' }} /> : `Buy ${coin}`}
                </button>
              </div>

              {/* SELL */}
              <div style={{ flex: 1, padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#5e6673' }}>
                  <span>Avbl</span>
                  <span style={{ color: '#eaecef', fontWeight: 700 }}>0.000 {coin} <span style={{ color: '#f0b90b', cursor: 'pointer' }}>+</span></span>
                </div>

                {otBtn === 'Limit' && (
                  <div className="sp-input-wrap">
                    <input className="sp-input" type="number" placeholder="Price" value={limitSellPrice} onChange={e => setLimitSellPrice(e.target.value)} />
                    <span className="sp-input-sfx">USDT</span>
                  </div>
                )}
                {otBtn === 'Market' && (
                  <div style={{ background: '#2b3139', borderRadius: 4, padding: '9px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                    <span style={{ color: '#5e6673' }}>Price</span>
                    <span style={{ color: '#848e9c' }}>Market Price</span>
                    <span style={{ color: '#848e9c' }}>USDT</span>
                  </div>
                )}

                <div className="sp-input-wrap">
                  <input className="sp-input" type="number" placeholder="Amount" value={sellAmt} onChange={e => setSellAmt(e.target.value)} />
                  <span className="sp-input-sfx">{coin} <ChevronDown size={9} style={{ display: 'inline' }} /></span>
                </div>

                {/* Slider */}
                <div>
                  <div className="sl-track" onClick={e => {
                    const r = e.currentTarget.getBoundingClientRect();
                    const p = Math.round(((e.clientX - r.left) / r.width) * 100 / 25) * 25;
                    setPct('sell', Math.min(100, Math.max(0, p)));
                  }}>
                    <div className="sl-fill" style={{ width: `${sellPct}%`, background: '#f6465d' }} />
                    <div className="sl-thumb" style={{ left: `${sellPct}%`, background: '#f6465d' }} />
                  </div>
                  <div style={{ display: 'flex', gap: 3, marginTop: 7 }}>
                    {[0, 25, 50, 75, 100].map(p => (
                      <button key={p} className="sp-pct-btn" onClick={() => setPct('sell', p)}>{p}%</button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input type="checkbox" style={{ accentColor: '#f0b90b' }} />
                  <span style={{ fontSize: 10, color: '#848e9c' }}>Slippage Tolerance</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 10, color: '#5e6673' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Max Sell</span><span style={{ color: '#eaecef' }}>0 USDT</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Est. Fee</span><span style={{ color: '#eaecef' }}>{sellAmt ? (parseFloat(sellAmt) * 0.001).toFixed(4) : '--'} USDT</span></div>
                </div>

                <button className="sp-sell-btn" disabled={loading || !sellAmt || parseFloat(sellAmt) <= 0} onClick={() => handleTrade('sell')}>
                  {loading ? <Loader2 size={16} className="spin" style={{ margin: '0 auto', display: 'block' }} /> : `Sell ${coin}`}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM TICKER */}
        <div style={{ display: 'flex', padding: '5px 12px', background: '#0b0e11', borderTop: '1px solid #1e2329', fontSize: 10, overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 20, animation: 'scrollLeft 60s linear infinite', whiteSpace: 'nowrap' }}>
            {['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'DOGE', 'ADA', 'AVAX', 'MATIC', 'LTC'].map(s => (
              <span key={s}><span style={{ color: '#5e6673', fontWeight: 700 }}>{s}/USDT</span> <span style={{ color: '#0ecb81' }}>+1.23%</span></span>
            ))}
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, color: '#5e6673', flexShrink: 0 }}>
            <span style={{ cursor: 'pointer' }}>Announcements</span>
            <span style={{ cursor: 'pointer' }}>Cookie Preference</span>
            <span style={{ cursor: 'pointer' }}>Online Support</span>
          </div>
        </div>
        <style>{`@keyframes scrollLeft{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
      </div>
    </>
  );
};

export default Trade;
