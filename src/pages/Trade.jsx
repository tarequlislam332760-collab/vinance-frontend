import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { ChevronLeft, Bell, Star, ChevronDown, Maximize2 } from 'lucide-react';

const API_BASE = "https://vinance-backend-1.onrender.com";
const TIMEFRAMES = [{ label: '1s', interval: '1' }, { label: '15m', interval: '15' }, { label: '1H', interval: '60' }, { label: '4H', interval: '240' }, { label: '1D', interval: 'D' }, { label: '1W', interval: 'W' }];

const Trade = () => {
  const { coinSymbol } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser, token } = useContext(UserContext);
  const coin = (coinSymbol || 'BTC').toUpperCase();

  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Spot');
  const [tradeTab, setTradeTab] = useState('Market');
  const [activeSection, setActiveSection] = useState('Price');
  const [timeframe, setTimeframe] = useState('4H');
  const [tvInterval, setTvInterval] = useState('240');
  const [starred, setStarred] = useState(false);
  const [limitPrice, setLimitPrice] = useState('');
  const [ticker, setTicker] = useState({ price: null, changePct: '0.00', high: null, low: null, volBase: null, volQuote: null, up: true });
  const [book, setBook] = useState({ asks: [], bids: [] });
  const prevPrice = useRef(null);

  useEffect(() => {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${coin.toLowerCase()}usdt@ticker`);
    ws.onmessage = ({ data }) => {
      const d = JSON.parse(data);
      const price = parseFloat(d.c);
      const up = prevPrice.current == null ? true : price >= prevPrice.current;
      prevPrice.current = price;
      setTicker({ price, up, changePct: parseFloat(d.P).toFixed(2), high: parseFloat(d.h), low: parseFloat(d.l), volBase: parseFloat(d.v).toLocaleString(undefined, { maximumFractionDigits: 2 }), volQuote: (parseFloat(d.q) / 1e9).toFixed(3) + 'B' });
    };
    ws.onerror = () => ws.close();
    return () => ws.close();
  }, [coin]);

  useEffect(() => {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${coin.toLowerCase()}usdt@depth10@100ms`);
    ws.onmessage = (e) => { const d = JSON.parse(e.data); setBook({ asks: d.a.slice(0, 8).reverse(), bids: d.b.slice(0, 8) }); };
    ws.onerror = () => ws.close();
    return () => ws.close();
  }, [coin]);

  const handleTrade = async (side) => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return alert('Enter a valid amount');
    if (amt > (user?.balance || 0)) return alert('Insufficient balance');
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/trade`, { type: side, amount: amt, symbol: coin }, { headers: { Authorization: `Bearer ${token}` } });
      alert(res.data.message || 'Order placed!');
      setAmount('');
      if (refreshUser) await refreshUser();
    } catch (err) { alert(err.response?.data?.message || 'Trade failed'); }
    finally { setLoading(false); }
  };

  const priceDisplay = ticker.price ? ticker.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—';
  const changePos = parseFloat(ticker.changePct) >= 0;
  const maxVol = (arr) => Math.max(...arr.map(o => parseFloat(o[1])), 1);

  return (
    <div style={{ background: '#1a1d24', color: '#eaecef', minHeight: '100dvh', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif', fontSize: 13 }}>
      <style>{`
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#2b3139}
        input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}
        input[type=number]{-moz-appearance:textfield}
        .nsb{scrollbar-width:none}.nsb::-webkit-scrollbar{display:none}
      `}</style>

      {/* HEADER */}
      <div style={{ background: '#1a1d24', padding: '10px 14px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #2b3139' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ChevronLeft size={20} style={{ cursor: 'pointer' }} onClick={() => navigate(-1)} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 17 }}>{coin}/USDT</span>
              <ChevronDown size={13} color="#848e9c" />
            </div>
            <div style={{ color: ticker.up ? '#f6465d' : '#0ecb81', fontSize: 12, fontWeight: 700, marginTop: 1 }}>{priceDisplay}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={() => setStarred(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <Star size={18} style={starred ? { fill: '#f0b90b', color: '#f0b90b' } : { color: '#848e9c' }} />
          </button>
          <Bell size={18} style={{ color: '#848e9c', cursor: 'pointer' }} />
        </div>
      </div>

      {/* TABS */}
      <div className="nsb" style={{ display: 'flex', padding: '0 14px', background: '#1a1d24', borderBottom: '1px solid #2b3139', overflowX: 'auto' }}>
        {['Price', 'Info', 'Trading Data', 'Trading Analysis', 'Square'].map(tab => (
          <button key={tab} onClick={() => setActiveSection(tab)} style={{ padding: '9px 12px 7px', fontSize: 12, fontWeight: activeSection === tab ? 700 : 400, color: activeSection === tab ? '#fff' : '#848e9c', background: 'transparent', border: 'none', cursor: 'pointer', borderBottom: activeSection === tab ? '2px solid #f0b90b' : '2px solid transparent', whiteSpace: 'nowrap' }}>{tab}</button>
        ))}
      </div>

      {/* MAIN */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>

        {/* LEFT: Price + Order Book */}
        <div style={{ width: 195, borderRight: '1px solid #2b3139', overflowY: 'auto', flexShrink: 0, background: '#1a1d24' }}>
          <div style={{ padding: '10px 10px 8px', borderBottom: '1px solid #2b3139' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: ticker.up ? '#f6465d' : '#0ecb81', letterSpacing: -0.5 }}>{priceDisplay}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 2, fontSize: 11 }}>
              <span style={{ color: '#848e9c' }}>${priceDisplay}</span>
              <span style={{ color: changePos ? '#f6465d' : '#0ecb81', fontWeight: 600 }}>{changePos ? '' : '+'}{ticker.changePct}%</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 6px', marginTop: 8, fontSize: 10 }}>
              {[['24h High', ticker.high?.toFixed(2) || '—'], ['24h Low', ticker.low?.toFixed(2) || '—'], [`Vol(${coin})`, ticker.volBase || '—'], ['Vol(USDT)', ticker.volQuote || '—']].map(([l, v]) => (
                <div key={l}><div style={{ color: '#5e6673' }}>{l}</div><div style={{ color: '#c6cad2', fontWeight: 600, marginTop: 1 }}>{v}</div></div>
              ))}
            </div>
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 10, padding: '4px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 8px', marginBottom: 4, color: '#5e6673', fontWeight: 600 }}><span>Price</span><span>Amount</span><span>Total</span></div>
            {book.asks.map((ask, i) => {
              const w = (parseFloat(ask[1]) / maxVol(book.asks)) * 100;
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 8px', position: 'relative' }}>
                  <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: `${w}%`, background: 'rgba(246,70,93,0.07)' }} />
                  <span style={{ color: '#f6465d', zIndex: 1 }}>{parseFloat(ask[0]).toFixed(2)}</span>
                  <span style={{ color: '#c6cad2', zIndex: 1 }}>{parseFloat(ask[1]).toFixed(3)}</span>
                  <span style={{ color: '#5e6673', zIndex: 1 }}>{(parseFloat(ask[0]) * parseFloat(ask[1])).toFixed(0)}</span>
                </div>
              );
            })}
            <div style={{ padding: '5px 8px', borderTop: '1px solid #2b3139', borderBottom: '1px solid #2b3139', textAlign: 'center' }}>
              <span style={{ color: ticker.up ? '#f6465d' : '#0ecb81', fontWeight: 800, fontSize: 13 }}>{priceDisplay}</span>
            </div>
            {book.bids.map((bid, i) => {
              const w = (parseFloat(bid[1]) / maxVol(book.bids)) * 100;
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 8px', position: 'relative' }}>
                  <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: `${w}%`, background: 'rgba(14,203,129,0.07)' }} />
                  <span style={{ color: '#0ecb81', zIndex: 1 }}>{parseFloat(bid[0]).toFixed(2)}</span>
                  <span style={{ color: '#c6cad2', zIndex: 1 }}>{parseFloat(bid[1]).toFixed(3)}</span>
                  <span style={{ color: '#5e6673', zIndex: 1 }}>{(parseFloat(bid[0]) * parseFloat(bid[1])).toFixed(0)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CENTER: Chart */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div className="nsb" style={{ display: 'flex', alignItems: 'center', padding: '5px 10px', background: '#1a1d24', borderBottom: '1px solid #2b3139', gap: 2, overflowX: 'auto' }}>
            {TIMEFRAMES.map(tf => (
              <button key={tf.label} onClick={() => { setTimeframe(tf.label); setTvInterval(tf.interval); }} style={{ padding: '4px 9px', fontSize: 12, fontWeight: timeframe === tf.label ? 700 : 400, color: timeframe === tf.label ? '#fff' : '#848e9c', background: 'transparent', border: 'none', cursor: 'pointer', borderBottom: timeframe === tf.label ? '2px solid #f0b90b' : '2px solid transparent', whiteSpace: 'nowrap' }}>{tf.label}</button>
            ))}
            <span style={{ color: '#848e9c', fontSize: 12, marginLeft: 10 }}>Depth</span>
            <div style={{ marginLeft: 'auto' }}><Maximize2 size={14} color="#848e9c" style={{ cursor: 'pointer' }} /></div>
          </div>
          <div style={{ flex: 1, position: 'relative', minHeight: 400 }}>
            <iframe key={`${coin}-${tvInterval}`} title="TradingView"
              src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${coin}USDT&interval=${tvInterval}&theme=dark&style=1&timezone=Etc%2FUTC&hide_top_toolbar=0&allow_symbol_change=0&locale=en&withdateranges=1`}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} />
          </div>
          <div style={{ borderTop: '1px solid #2b3139', background: '#1a1d24' }}>
            <div className="nsb" style={{ display: 'flex', padding: '0 14px', borderBottom: '1px solid #2b3139', overflowX: 'auto' }}>
              {['Open Orders(0)', 'Order History', 'Trade History', 'Holdings', 'Bots'].map(t => (
                <button key={t} style={{ padding: '8px 12px 7px', fontSize: 11, fontWeight: t === 'Open Orders(0)' ? 700 : 400, color: t === 'Open Orders(0)' ? '#eaecef' : '#5e6673', background: 'transparent', border: 'none', cursor: 'pointer', borderBottom: t === 'Open Orders(0)' ? '2px solid #f0b90b' : '2px solid transparent', whiteSpace: 'nowrap' }}>{t}</button>
              ))}
            </div>
            <div style={{ padding: '24px 0', textAlign: 'center', color: '#3a3f47', fontSize: 11 }}>You have no open orders.</div>
          </div>
        </div>

        {/* RIGHT: Trade Form */}
        <div style={{ width: 255, borderLeft: '1px solid #2b3139', background: '#1a1d24', overflowY: 'auto', flexShrink: 0, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="nsb" style={{ display: 'flex', borderBottom: '1px solid #2b3139', overflowX: 'auto' }}>
            {['Spot', 'Cross', 'Isolated', 'Grid'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{ padding: '7px 10px 6px', fontSize: 11, fontWeight: activeTab === t ? 700 : 400, color: activeTab === t ? '#eaecef' : '#5e6673', background: 'transparent', border: 'none', cursor: 'pointer', borderBottom: activeTab === t ? '2px solid #f0b90b' : '2px solid transparent', whiteSpace: 'nowrap' }}>{t}</button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 4 }}>
            {['Limit', 'Market', 'Stop Limit'].map(t => (
              <button key={t} onClick={() => setTradeTab(t)} style={{ padding: '5px 8px', fontSize: 11, fontWeight: tradeTab === t ? 700 : 400, color: tradeTab === t ? '#eaecef' : '#5e6673', background: 'transparent', border: 'none', cursor: 'pointer', borderBottom: tradeTab === t ? '2px solid #f0b90b' : '2px solid transparent' }}>{t}</button>
            ))}
            <span style={{ marginLeft: 'auto', fontSize: 10, color: '#848e9c', alignSelf: 'center', cursor: 'pointer' }}>% Fee Level</span>
          </div>

          {tradeTab === 'Limit' && (
            <div style={{ background: '#2b3139', borderRadius: 4, padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, color: '#5e6673', minWidth: 30 }}>Price</span>
              <input type="number" placeholder="Market Price" value={limitPrice} onChange={e => setLimitPrice(e.target.value)} style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#eaecef', fontSize: 13, fontWeight: 700, textAlign: 'right' }} />
              <span style={{ color: '#5e6673', fontSize: 11 }}>USDT</span>
            </div>
          )}
          {tradeTab === 'Market' && (
            <div style={{ background: '#2b3139', borderRadius: 4, padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, color: '#5e6673', minWidth: 30 }}>Price</span>
              <span style={{ flex: 1, color: '#5e6673', fontSize: 12, textAlign: 'right' }}>Market Price</span>
              <span style={{ color: '#5e6673', fontSize: 11 }}>USDT</span>
            </div>
          )}

          <div style={{ background: '#2b3139', borderRadius: 4, padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 10, color: '#5e6673', minWidth: 36 }}>Total</span>
            <input type="number" placeholder="Minimum 5" value={amount} onChange={e => setAmount(e.target.value)} style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#eaecef', fontSize: 13, fontWeight: 700, textAlign: 'right' }} />
            <span style={{ color: '#5e6673', fontSize: 11 }}>USDT</span>
          </div>

          <input type="range" min={0} max={100} defaultValue={0} style={{ width: '100%', accentColor: '#f0b90b', cursor: 'pointer' }}
            onChange={e => setAmount(((user?.balance || 0) * e.target.value / 100).toFixed(2))} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#5e6673' }}>
            {[0, 25, 50, 75, 100].map(v => <span key={v} style={{ cursor: 'pointer' }} onClick={() => setAmount(((user?.balance || 0) * v / 100).toFixed(2))}>{v}%</span>)}
          </div>

          <div style={{ fontSize: 11, color: '#5e6673', display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div>Avbl <span style={{ color: '#eaecef', fontWeight: 700 }}>{(user?.balance || 0).toFixed(2)} USDT</span></div>
            <div>Max Buy <span style={{ color: '#eaecef', fontWeight: 700 }}>{ticker.price && amount ? (parseFloat(amount) / ticker.price).toFixed(6) : '0'} {coin}</span></div>
            <div>Est. Fee <span style={{ color: '#eaecef', fontWeight: 700 }}>{amount ? (parseFloat(amount) * 0.001).toFixed(4) : '—'} USDT</span></div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button onClick={() => handleTrade('buy')} disabled={loading || !amount || parseFloat(amount) <= 0} style={{ flex: 1, padding: '13px 0', borderRadius: 6, border: 'none', background: '#0ecb81', color: '#fff', fontWeight: 800, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', opacity: !amount || parseFloat(amount) <= 0 ? 0.5 : 1 }}>
              Buy {coin}
            </button>
            <button onClick={() => handleTrade('sell')} disabled={loading || !amount || parseFloat(amount) <= 0} style={{ flex: 1, padding: '13px 0', borderRadius: 6, border: 'none', background: '#f6465d', color: '#fff', fontWeight: 800, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', opacity: !amount || parseFloat(amount) <= 0 ? 0.5 : 1 }}>
              Sell {coin}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trade;
