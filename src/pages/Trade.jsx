import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import {
  ChevronLeft, Bell, Star, MoreHorizontal,
  LayoutGrid, Zap, TrendingUp, TrendingDown,
  RefreshCw
} from 'lucide-react';

/* ─── Google Font: IBM Plex Mono ─────────────────────────────────── */
const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    .trade-root {
      font-family: 'IBM Plex Mono', 'Courier New', monospace;
      background: #0b0e11;
      color: #eaecef;
      height: 100dvh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    /* ── price flash animations ── */
    @keyframes flashGreen {
      0%   { background: rgba(2,192,118,.18); }
      100% { background: transparent; }
    }
    @keyframes flashRed {
      0%   { background: rgba(246,70,93,.18); }
      100% { background: transparent; }
    }
    .flash-green { animation: flashGreen .45s ease-out; }
    .flash-red   { animation: flashRed   .45s ease-out; }

    /* ── order-type tabs ── */
    .order-tab {
      flex: 1; padding: 7px 0; font-size: 11px; font-weight: 600;
      background: transparent; border: none; color: #5e6673; cursor: pointer;
      border-bottom: 2px solid transparent;
      font-family: 'IBM Plex Mono', monospace;
      letter-spacing: .03em; transition: color .2s, border-color .2s;
    }
    .order-tab.active { color: #eaecef; border-bottom-color: #f0b90b; }

    /* ── pct quick buttons ── */
    .pct-btn {
      flex: 1; padding: 5px 0; font-size: 10px; font-weight: 700;
      background: #1e2329; color: #5e6673; border: none; border-radius: 4px;
      cursor: pointer; font-family: 'IBM Plex Mono', monospace;
      transition: background .15s, color .15s;
    }
    .pct-btn:hover { background: #2b3139; color: #eaecef; }
    .pct-btn.active { background: #2b3139; color: #f0b90b; }

    /* ── trade buttons ── */
    .btn-long, .btn-short {
      flex: 1; height: 46px; border: none; border-radius: 6px;
      font-size: 14px; font-weight: 700; cursor: pointer;
      font-family: 'IBM Plex Mono', monospace; letter-spacing: .04em;
      display: flex; align-items: center; justify-content: center; gap: 6px;
      transition: opacity .2s, transform .1s;
    }
    .btn-long  { background: #0ecb81; color: #0b0e11; }
    .btn-short { background: #f6465d; color: #fff; }
    .btn-long:hover  { opacity: .88; }
    .btn-short:hover { opacity: .88; }
    .btn-long:active, .btn-short:active  { transform: scale(.97); }
    .btn-long:disabled, .btn-short:disabled { opacity: .35; cursor: not-allowed; transform: none; }

    /* ── input ── */
    .amount-input {
      width: 100%; background: #1e2329; border: 1px solid #2b3139;
      border-radius: 6px; padding: 11px 54px 11px 12px;
      color: #eaecef; font-size: 13px; font-family: 'IBM Plex Mono', monospace;
      outline: none; transition: border-color .2s;
    }
    .amount-input:focus { border-color: #f0b90b; }
    .amount-input::placeholder { color: #404854; }

    /* ── stat pill ── */
    .stat-row { display: flex; flex-direction: column; gap: 4px; }
    .stat-item { display: flex; justify-content: space-between; font-size: 10px; }
    .stat-label { color: #5e6673; }
    .stat-val   { color: #c6cad2; }

    /* ── bottom nav ── */
    .bottom-nav {
      position: fixed; bottom: 0; left: 0; right: 0;
      display: flex; justify-content: space-around; align-items: center;
      padding: 10px 0 14px; background: #161a1e;
      border-top: 1px solid #1e2329;
    }
    .nav-item {
      display: flex; flex-direction: column; align-items: center; gap: 3px;
      font-size: 9px; color: #5e6673; cursor: pointer;
    }
    .nav-item.active { color: #f0b90b; }

    /* ── timeframe ── */
    .tf-btn {
      font-size: 11px; font-weight: 600; padding: 4px 2px;
      background: transparent; border: none; color: #5e6673;
      cursor: pointer; font-family: 'IBM Plex Mono', monospace;
      border-bottom: 2px solid transparent;
      transition: color .15s, border-color .15s;
    }
    .tf-btn.active { color: #f0b90b; border-bottom-color: #f0b90b; }

    /* ── estimated value chip ── */
    .est-chip {
      font-size: 10px; color: #5e6673; text-align: right; padding: 2px 0;
    }

    /* ── divider ── */
    .divider { border: none; border-top: 1px solid #1e2329; }

    /* ── funding rate badge ── */
    .funding-badge {
      background: #1e2329; border-radius: 4px;
      padding: 3px 7px; font-size: 9px; font-weight: 600;
      display: flex; align-items: center; gap: 4px;
    }
  `}</style>
);

/* ─── Timeframes ─────────────────────────────────────────────────── */
const TIMEFRAMES = [
  { label: '15m', value: '15'  },
  { label: '1h',  value: '60'  },
  { label: '4h',  value: '240' },
  { label: '1D',  value: '1D'  },
];

/* ─── Component ──────────────────────────────────────────────────── */
const Trade = () => {
  const { coinSymbol } = useParams();
  const { user, refreshUser, API_URL, token } = useContext(UserContext);

  const [amount,    setAmount]    = useState('');
  const [loading,   setLoading]   = useState(false);
  const [timeframe, setTimeframe] = useState('240');
  const [chartKey,  setChartKey]  = useState(0);          // force chart reload
  const [orderType, setOrderType] = useState('market');   // 'market' | 'limit'
  const [limitPrice, setLimitPrice] = useState('');
  const [activePct, setActivePct]  = useState(null);

  /* ── WebSocket price ── */
  const [livePrice,   setLivePrice]   = useState(null);
  const [rawPrice,    setRawPrice]    = useState(null);
  const [priceChange, setPriceChange] = useState(null);
  const [high24h,     setHigh24h]     = useState(null);
  const [low24h,      setLow24h]      = useState(null);
  const [vol24h,      setVol24h]      = useState(null);
  const [priceUp,     setPriceUp]     = useState(true);
  const [flashClass,  setFlashClass]  = useState('');

  const priceRef = useRef(null);
  const currentCoin = (coinSymbol || 'btc').toUpperCase();

  /* ── WebSocket ── */
  useEffect(() => {
    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${currentCoin.toLowerCase()}usdt@ticker`
    );
    let prev = null;
    ws.onmessage = (e) => {
      const d = JSON.parse(e.data);
      const price = parseFloat(d.c);
      if (prev !== null) {
        const up = price >= prev;
        setPriceUp(up);
        setFlashClass(up ? 'flash-green' : 'flash-red');
        setTimeout(() => setFlashClass(''), 460);
      }
      prev = price;
      setRawPrice(price);
      setLivePrice(
        price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      );
      setPriceChange(parseFloat(d.P).toFixed(2));
      setHigh24h(parseFloat(d.h).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
      setLow24h(parseFloat(d.l).toLocaleString(undefined,  { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
      setVol24h((parseFloat(d.q) / 1e9).toFixed(2) + 'B');
    };
    ws.onerror = () => ws.close();
    return () => ws.close();
  }, [currentCoin]);

  /* ── Timeframe change → reload chart ── */
  const handleTimeframe = (val) => {
    setTimeframe(val);
    setChartKey(k => k + 1);
  };

  /* ── Quick % fill ── */
  const handlePct = (pct) => {
    setActivePct(pct);
    setAmount(((user?.balance || 0) * pct / 100).toFixed(2));
  };

  /* ── Trade ── */
  const handleTrade = async (tradeType) => {
    const parsed = parseFloat(amount);
    if (!amount || parsed <= 0) return alert('অ্যামাউন্ট লিখুন');
    if (parsed > (user?.balance || 0)) return alert('Balance insufficient!');
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_URL}/api/trade`,
        { type: tradeType, amount: parsed, symbol: currentCoin },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);
      setAmount(''); setActivePct(null);
      if (refreshUser) await refreshUser();
    } catch (err) {
      alert(err.response?.data?.message || 'ট্রেড সফল হয়নি');
    } finally {
      setLoading(false);
    }
  };

  /* ── Derived ── */
  const priceColor     = priceUp ? '#0ecb81' : '#f6465d';
  const changePositive = parseFloat(priceChange) >= 0;
  const balance        = user?.balance || 0;
  const estCoins       = rawPrice && parseFloat(amount) > 0
    ? (parseFloat(amount) / rawPrice).toFixed(6)
    : null;
  const execPrice      = orderType === 'market' ? livePrice : (limitPrice || '---');

  return (
    <>
      <FontStyle />
      <div className="trade-root">

        {/* ═══ HEADER ═══════════════════════════════════════════ */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '10px 16px 9px', borderBottom: '1px solid #1e2329',
          background: '#0b0e11',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ChevronLeft
              size={22} color="#848e9c" style={{ cursor: 'pointer' }}
              onClick={() => window.history.back()}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: '#eaecef', letterSpacing: '.02em' }}>
                  {currentCoin}USDT
                </span>
                <span style={{
                  background: '#2b3139', color: '#848e9c', fontSize: 8,
                  padding: '1px 5px', borderRadius: 3, fontWeight: 600,
                }}>PERP</span>
              </div>
              <div style={{ fontSize: 9, color: '#5e6673', marginTop: 1 }}>
                {currentCoin === 'BTC' ? 'Bitcoin Perpetual' : `${currentCoin} Perpetual`}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <Star size={16} color="#5e6673" style={{ cursor: 'pointer' }} />
            <Bell size={16} color="#5e6673" style={{ cursor: 'pointer' }} />
          </div>
        </div>

        {/* ═══ PRICE SECTION ═════════════════════════════════════ */}
        <div
          ref={priceRef}
          className={flashClass}
          style={{
            padding: '10px 16px 8px',
            borderBottom: '1px solid #1e2329',
            transition: 'background .1s',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            {/* Left: price */}
            <div>
              <div style={{
                fontSize: 26, fontWeight: 700, color: priceColor,
                letterSpacing: '-.01em', lineHeight: 1,
                transition: 'color .3s',
              }}>
                {livePrice || '──────'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
                <span style={{ fontSize: 10, color: '#848e9c' }}>≈ ${livePrice || '---'}</span>
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  color: changePositive ? '#0ecb81' : '#f6465d',
                  background: changePositive ? 'rgba(14,203,129,.1)' : 'rgba(246,70,93,.1)',
                  padding: '1px 6px', borderRadius: 4,
                }}>
                  {changePositive ? '+' : ''}{priceChange || '0.00'}%
                </span>
              </div>
            </div>

            {/* Right: 24h stats */}
            <div className="stat-row" style={{ textAlign: 'right' }}>
              <div className="stat-item">
                <span className="stat-label" style={{ marginRight: 8 }}>24h High</span>
                <span className="stat-val">{high24h || '─────'}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label" style={{ marginRight: 8 }}>24h Low</span>
                <span className="stat-val">{low24h  || '─────'}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label" style={{ marginRight: 8 }}>Vol(USDT)</span>
                <span className="stat-val">{vol24h  || '─────'}</span>
              </div>
            </div>
          </div>

          {/* Funding rate / mark price row */}
          <div style={{ display: 'flex', gap: 8, marginTop: 7 }}>
            <div className="funding-badge">
              <span style={{ color: '#848e9c' }}>Mark</span>
              <span style={{ color: '#eaecef' }}>{livePrice || '---'}</span>
            </div>
            <div className="funding-badge">
              <span style={{ color: '#848e9c' }}>Index</span>
              <span style={{ color: '#eaecef' }}>{livePrice || '---'}</span>
            </div>
            <div className="funding-badge">
              <span style={{ color: '#0ecb81' }}>Funding</span>
              <span style={{ color: '#0ecb81' }}>0.0100%</span>
            </div>
          </div>
        </div>

        {/* ═══ TIMEFRAME BAR ═════════════════════════════════════ */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '0 16px', borderBottom: '1px solid #1e2329',
          background: '#0b0e11', height: 36,
        }}>
          <span style={{ fontSize: 10, color: '#5e6673', fontWeight: 600 }}>TF</span>
          {TIMEFRAMES.map(tf => (
            <button
              key={tf.value}
              className={`tf-btn${timeframe === tf.value ? ' active' : ''}`}
              onClick={() => handleTimeframe(tf.value)}
            >
              {tf.label}
            </button>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
            <RefreshCw
              size={12} color="#5e6673" style={{ cursor: 'pointer' }}
              onClick={() => setChartKey(k => k + 1)}
            />
          </div>
        </div>

        {/* ═══ CHART ═════════════════════════════════════════════ */}
        <div style={{ flex: 1, background: '#0b0e11', overflow: 'hidden' }}>
          <iframe
            key={chartKey}
            title="TV Chart"
            src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${currentCoin}USDT&interval=${timeframe}&theme=dark&style=1&timezone=Etc%2FUTC&hide_top_toolbar=true&withdateranges=true&hide_side_toolbar=true&allow_symbol_change=false&locale=en`}
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        </div>

        {/* ═══ TRADE PANEL ═══════════════════════════════════════ */}
        <div style={{
          background: '#161a1e',
          borderTop: '1px solid #1e2329',
          padding: '12px 16px 78px',
        }}>

          {/* Order type tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #1e2329', marginBottom: 12 }}>
            {['market', 'limit'].map(t => (
              <button
                key={t}
                className={`order-tab${orderType === t ? ' active' : ''}`}
                onClick={() => setOrderType(t)}
                style={{ textTransform: 'capitalize' }}
              >
                {t === 'market' ? 'Market' : 'Limit'}
              </button>
            ))}
          </div>

          {/* Balance row */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: 10,
          }}>
            <span style={{ fontSize: 10, color: '#5e6673' }}>Available Balance</span>
            <span style={{ fontSize: 11, color: '#eaecef', fontWeight: 600 }}>
              {balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              <span style={{ color: '#5e6673', marginLeft: 4 }}>USDT</span>
            </span>
          </div>

          {/* Limit price input (only for Limit orders) */}
          {orderType === 'limit' && (
            <div style={{ position: 'relative', marginBottom: 8 }}>
              <input
                className="amount-input"
                type="number"
                value={limitPrice}
                onChange={e => setLimitPrice(e.target.value)}
                placeholder="Limit Price"
              />
              <span style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                fontSize: 10, fontWeight: 700, color: '#5e6673',
              }}>USDT</span>
            </div>
          )}

          {/* Amount input */}
          <div style={{ position: 'relative', marginBottom: 6 }}>
            <input
              className="amount-input"
              type="number"
              value={amount}
              onChange={e => { setAmount(e.target.value); setActivePct(null); }}
              placeholder="Amount"
              min="1"
              max={balance}
            />
            <span style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              fontSize: 10, fontWeight: 700, color: '#5e6673',
            }}>USDT</span>
          </div>

          {/* Estimated coins */}
          <div className="est-chip" style={{ marginBottom: 8 }}>
            {estCoins
              ? `≈ ${estCoins} ${currentCoin}  @  ${execPrice} USDT`
              : `Exec price: ${execPrice}`}
          </div>

          {/* Quick % buttons */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            {[25, 50, 75, 100].map(pct => (
              <button
                key={pct}
                className={`pct-btn${activePct === pct ? ' active' : ''}`}
                onClick={() => handlePct(pct)}
              >
                {pct}%
              </button>
            ))}
          </div>

          {/* Buy / Sell buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="btn-long"
              disabled={loading || !amount || parseFloat(amount) <= 0}
              onClick={() => handleTrade('buy')}
            >
              {loading ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <><TrendingUp size={15}/> Long</>}
            </button>
            <button
              className="btn-short"
              disabled={loading || !amount || parseFloat(amount) <= 0}
              onClick={() => handleTrade('sell')}
            >
              {loading ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <><TrendingDown size={15}/> Short</>}
            </button>
          </div>
        </div>

        {/* ═══ BOTTOM NAV ════════════════════════════════════════ */}
        <div className="bottom-nav">
          <div className="nav-item">
            <MoreHorizontal size={17}/>
            <span>More</span>
          </div>
          <div className="nav-item">
            <LayoutGrid size={17}/>
            <span>Hub</span>
          </div>
          <div className="nav-item active">
            <Zap size={17}/>
            <span>Trade</span>
          </div>
        </div>

      </div>
    </>
  );
};

export default Trade;