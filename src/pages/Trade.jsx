import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import {
  ChevronLeft, Bell, Star, MoreHorizontal, LayoutGrid, Zap,
  ChevronDown, Maximize2, Grid
} from 'lucide-react';

/* ─── timeframes ─── */
const TIMEFRAMES = ['Time','15m','1h','4h','1D','More'];
const INDICATORS  = ['MA','EMA','BOLL','SAR','AVL','SUPER','VOL'];
const PERIODS     = ['Today','7 Days','30 Days','90 Days','180 Days','1 Year'];

const fmt = (n, d = 1) =>
  n == null ? '—' : Number(n).toLocaleString(undefined, {
    minimumFractionDigits: d, maximumFractionDigits: d,
  });

/* ══════════════════════════════════════
   TRADE.JSX  —  Exact Binance Screenshot
══════════════════════════════════════ */
const Trade = () => {
  const { coinSymbol }                        = useParams();
  const navigate                              = useNavigate();
  const { user, refreshUser, API_URL, token } = useContext(UserContext);

  const [amount, setAmount]       = useState('');
  const [loading, setLoading]     = useState(false);
  const [timeframe, setTimeframe] = useState('4h');
  const [tvInterval, setTvInterval] = useState('240');
  const [activeTab, setActiveTab] = useState('Price');
  const [starred, setStarred]     = useState(false);

  /* live ticker */
  const [ticker, setTicker] = useState({
    price: null, change: null, changePct: null,
    high: null, low: null, volBtc: null, volUsdt: null,
    markPrice: null, up: true,
  });
  const prevPrice = useRef(null);
  const coin = (coinSymbol || 'BTC').toUpperCase();

  /* interval map */
  const intervalMap = { 'Time':'1','15m':'15','1h':'60','4h':'240','1D':'1D','More':'1D' };

  useEffect(() => {
    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${coin.toLowerCase()}usdt@ticker`
    );
    ws.onmessage = ({ data }) => {
      const d     = JSON.parse(data);
      const price = parseFloat(d.c);
      const up    = prevPrice.current == null ? true : price >= prevPrice.current;
      prevPrice.current = price;
      setTicker({
        price,
        change:    parseFloat(d.p).toFixed(1),
        changePct: parseFloat(d.P).toFixed(2),
        high:      parseFloat(d.h),
        low:       parseFloat(d.l),
        volBtc:    parseFloat(d.v).toLocaleString(undefined, { maximumFractionDigits: 3 }),
        volUsdt:   (parseFloat(d.q) / 1e9).toFixed(2) + 'B',
        markPrice: (parseFloat(d.c) + Math.random() * 50).toFixed(1),
        up,
      });
    };
    ws.onerror = () => ws.close();
    return () => ws.close();
  }, [coin]);

  const handleTrade = async (side) => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0)           return alert('Enter a valid amount');
    if (amt > (user?.balance || 0)) return alert('Insufficient balance');
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_URL}/api/trade`,
        { type: side, amount: amt, symbol: coin },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);
      setAmount('');
      if (refreshUser) await refreshUser();
    } catch (err) {
      alert(err.response?.data?.message || 'Trade failed');
    } finally {
      setLoading(false);
    }
  };

  const priceColor  = ticker.up ? '#f6465d' : '#0ecb81'; // screenshot shows red price
  const changePos   = parseFloat(ticker.changePct || 0) >= 0;
  const displayPrice = ticker.price
    ? ticker.price.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
    : '67,111.0';

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ background: '#1a1d24', color: '#eaecef', fontFamily: 'sans-serif', fontSize: 14 }}
    >
      {/* ══ HEADER ══ */}
      <div
        className="flex items-center justify-between px-4 pt-3 pb-2 shrink-0"
        style={{ background: '#1a1d24' }}
      >
        <div className="flex items-center gap-3">
          <ChevronLeft
            size={22}
            className="cursor-pointer"
            style={{ color: '#eaecef' }}
            onClick={() => navigate(-1)}
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 18, letterSpacing: -0.5 }}>
                {coin}USDT
              </span>
              <span
                style={{
                  fontSize: 10, fontWeight: 700,
                  background: '#2b3139', color: '#848e9c',
                  padding: '1px 5px', borderRadius: 3,
                }}
              >
                Perp
              </span>
              <ChevronDown size={14} style={{ color: '#848e9c' }} />
            </div>
            <div style={{ color: '#848e9c', fontSize: 11 }}>Bitcoin</div>
          </div>
        </div>
        <div className="flex items-center gap-5" style={{ color: '#848e9c' }}>
          <button onClick={() => setStarred(v => !v)}>
            <Star
              size={19}
              style={starred ? { fill: '#f0b90b', color: '#f0b90b' } : {}}
            />
          </button>
          <Bell size={19} />
        </div>
      </div>

      {/* ══ SECTION TABS: Price / Info / Trading Data / Square / Trade-X ══ */}
      <div
        className="flex gap-5 px-4 pb-0 shrink-0 overflow-x-auto no-scrollbar"
        style={{ background: '#1a1d24', borderBottom: '1px solid #2b3139' }}
      >
        {['Price','Info','Trading Data','Square','Trade-X'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="pb-2 whitespace-nowrap relative"
            style={{
              color:      activeTab === tab ? '#fff' : '#848e9c',
              fontWeight: activeTab === tab ? 700 : 400,
              fontSize:   13,
            }}
          >
            {tab}
            {tab === 'Trade-X' && (
              <span
                style={{
                  fontSize: 8, fontWeight: 700, color: '#f0b90b',
                  background: 'rgba(240,185,11,0.15)',
                  padding: '1px 4px', borderRadius: 3,
                  position: 'absolute', top: -2, right: -18,
                }}
              >
                New
              </span>
            )}
            {activeTab === tab && (
              <span
                style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  height: 2, background: '#f0b90b', borderRadius: 1,
                }}
              />
            )}
          </button>
        ))}
      </div>

      {/* ══ PRICE BLOCK ══ */}
      <div className="px-4 pt-3 pb-2 shrink-0" style={{ background: '#1a1d24' }}>
        {/* Last Price label */}
        <div className="flex items-center gap-1 mb-1" style={{ color: '#848e9c', fontSize: 11 }}>
          <span>Last Price</span>
          <ChevronDown size={12} />
        </div>

        <div className="flex items-start justify-between">
          {/* left: big price */}
          <div>
            <div
              style={{
                fontSize: 34, fontWeight: 800, lineHeight: 1,
                color: ticker.up ? '#f6465d' : '#0ecb81',
                letterSpacing: -1, fontVariantNumeric: 'tabular-nums',
              }}
            >
              {displayPrice}
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <span style={{ color: '#eaecef', fontSize: 12 }}>
                ${displayPrice}
              </span>
              <span
                style={{
                  color:      changePos ? '#f6465d' : '#0ecb81',
                  fontSize:   12,
                  fontWeight: 600,
                }}
              >
                {changePos ? '' : '+'}{ticker.changePct ?? '-0.92'}%
              </span>
            </div>
            <div style={{ color: '#848e9c', fontSize: 11, marginTop: 2 }}>
              Mark Price {ticker.markPrice ?? '67,136.5'}
            </div>
          </div>

          {/* right: 24h stats */}
          <div style={{ fontSize: 11, color: '#848e9c', textAlign: 'right', lineHeight: 1.9 }}>
            <div>
              24h High{'  '}
              <span style={{ color: '#eaecef', fontWeight: 600 }}>
                {ticker.high ? fmt(ticker.high) : '68,377.0'}
              </span>
            </div>
            <div>
              24h Vol(BTC){'  '}
              <span style={{ color: '#eaecef', fontWeight: 600 }}>
                {ticker.volBtc ?? '198,801.356'}
              </span>
            </div>
            <div>
              24h Low{'  '}
              <span style={{ color: '#eaecef', fontWeight: 600 }}>
                {ticker.low ? fmt(ticker.low) : '65,938.0'}
              </span>
            </div>
            <div>
              24h Vol(USDT){'  '}
              <span style={{ color: '#eaecef', fontWeight: 600 }}>
                {ticker.volUsdt ?? '13.33B'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ══ TIMEFRAME BAR ══ */}
      <div
        className="flex items-center gap-3 px-4 py-1.5 shrink-0 overflow-x-auto no-scrollbar"
        style={{ background: '#1a1d24', borderBottom: '1px solid #2b3139' }}
      >
        {TIMEFRAMES.map(tf => (
          <button
            key={tf}
            onClick={() => { setTimeframe(tf); setTvInterval(intervalMap[tf] || '240'); }}
            style={{
              color:      timeframe === tf ? '#fff' : '#848e9c',
              fontWeight: timeframe === tf ? 700   : 400,
              fontSize:   13,
              borderBottom: timeframe === tf ? '2px solid #f0b90b' : '2px solid transparent',
              paddingBottom: 2,
              whiteSpace: 'nowrap',
            }}
          >
            {tf}
          </button>
        ))}
        <span style={{ color: '#848e9c', fontSize: 13, whiteSpace: 'nowrap' }}>Depth</span>
        <div className="ml-auto flex items-center gap-3" style={{ color: '#848e9c' }}>
          <Maximize2 size={16} />
          <Grid size={16} />
        </div>
      </div>

      {/* ══ CHART ══ */}
      <div className="relative shrink-0" style={{ height: 320, background: '#1a1d24' }}>
        <iframe
          key={`${coin}-${tvInterval}`}
          title="TradingView"
          src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${coin}USDT&interval=${tvInterval}&theme=dark&style=1&timezone=Etc%2FUTC&hide_top_toolbar=1&hide_side_toolbar=0&allow_symbol_change=0&locale=en&withdateranges=1&studies=MASimple%4020`}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
        />
      </div>

      {/* ══ INDICATOR STRIP ══ */}
      <div
        className="flex items-center gap-4 px-4 py-1.5 shrink-0 overflow-x-auto no-scrollbar"
        style={{ background: '#1a1d24', borderTop: '1px solid #2b3139', borderBottom: '1px solid #2b3139' }}
      >
        {INDICATORS.map((ind, i) => (
          <button
            key={ind}
            style={{
              color:      i === 0 ? '#f0b90b' : '#848e9c',
              fontSize:   12,
              fontWeight: i === 0 ? 700 : 400,
              whiteSpace: 'nowrap',
            }}
          >
            {ind}
          </button>
        ))}
      </div>

      {/* ══ PERIOD TABS ══ */}
      <div
        className="flex items-center gap-3 px-4 py-1.5 shrink-0 overflow-x-auto no-scrollbar"
        style={{ background: '#1a1d24', borderBottom: '1px solid #2b3139' }}
      >
        {PERIODS.map(p => (
          <button
            key={p}
            style={{ color: '#848e9c', fontSize: 11, whiteSpace: 'nowrap' }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* ══ BOTTOM CONTROLS ══ */}
      <div
        className="shrink-0 px-4 pt-3 pb-2"
        style={{ background: '#1a1d24', borderTop: '1px solid #2b3139' }}
      >
        {/* balance row */}
        <div className="flex items-center justify-between mb-2">
          <div style={{ color: '#848e9c', fontSize: 11 }}>
            Available:{' '}
            <span style={{ color: '#fff', fontWeight: 700 }}>
              {(user?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
            </span>
          </div>
        </div>

        {/* amount input */}
        <div className="relative mb-3">
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="Enter Amount"
            style={{
              width: '100%',
              background: '#2b3139',
              border: 'none',
              borderRadius: 6,
              padding: '10px 48px 10px 12px',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <span
            style={{
              position: 'absolute', right: 12, top: '50%',
              transform: 'translateY(-50%)',
              color: '#848e9c', fontSize: 12, fontWeight: 700,
            }}
          >
            USDT
          </span>
        </div>

        {/* LONG / SHORT big buttons — exact Binance style */}
        <div className="flex gap-3">
          <button
            disabled={loading || !amount || parseFloat(amount) <= 0}
            onClick={() => handleTrade('buy')}
            style={{
              flex: 1,
              padding: '14px 0',
              borderRadius: 8,
              background: loading ? '#0a7a4e' : '#0ecb81',
              color: '#fff',
              fontWeight: 800,
              fontSize: 18,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: (!amount || parseFloat(amount) <= 0) ? 0.5 : 1,
              letterSpacing: 0.5,
            }}
          >
            {loading ? '…' : 'Long'}
          </button>
          <button
            disabled={loading || !amount || parseFloat(amount) <= 0}
            onClick={() => handleTrade('sell')}
            style={{
              flex: 1,
              padding: '14px 0',
              borderRadius: 8,
              background: loading ? '#8a1f2e' : '#f6465d',
              color: '#fff',
              fontWeight: 800,
              fontSize: 18,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: (!amount || parseFloat(amount) <= 0) ? 0.5 : 1,
              letterSpacing: 0.5,
            }}
          >
            {loading ? '…' : 'Short'}
          </button>
        </div>
      </div>

      {/* ══ BOTTOM NAV ══ */}
      <div
        className="flex justify-around items-center py-2 shrink-0"
        style={{ background: '#1a1d24', borderTop: '1px solid #2b3139' }}
      >
        {[
          { icon: <MoreHorizontal size={20} />, label: 'More',  path: null        },
          { icon: <LayoutGrid    size={20} />, label: 'Hub',   path: '/dashboard' },
          { icon: <Zap           size={20} />, label: 'Spot',  path: '/trade',    active: true },
        ].map(({ icon, label, path, active }) => (
          <button
            key={label}
            onClick={() => path && navigate(path)}
            className="flex flex-col items-center gap-0.5"
            style={{ color: active ? '#f0b90b' : '#848e9c', fontSize: 10, fontWeight: active ? 700 : 400 }}
          >
            {icon}
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Trade;