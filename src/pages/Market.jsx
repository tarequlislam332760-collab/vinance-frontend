import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import {
  Search, Bell, Star, ChevronRight, X, CheckCircle,
  AlertCircle, Loader2, RefreshCw, TrendingUp, TrendingDown,
  BarChart2, Activity, Zap, Globe, Lock, Cpu
} from 'lucide-react';

const API_BASE = 'https://vinance-backend-1.onrender.com';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  .mk{font-family:'Inter',sans-serif;background:#0b0e11;color:#eaecef;min-height:100vh;}
  .mk *{box-sizing:border-box;margin:0;padding:0;}
  .mk ::-webkit-scrollbar{width:4px;height:4px;}
  .mk ::-webkit-scrollbar-thumb{background:#2b3139;border-radius:4px;}

  /* Top tabs */
  .mk-top-tabs{display:flex;overflow-x:auto;scrollbar-width:none;border-bottom:1px solid #1e2329;}
  .mk-top-tabs::-webkit-scrollbar{display:none;}
  .mk-top-tab{padding:14px 20px;font-size:14px;font-weight:600;background:transparent;border:none;color:#848e9c;cursor:pointer;border-bottom:2px solid transparent;white-space:nowrap;margin-bottom:-1px;transition:all .15s;font-family:inherit;flex-shrink:0;}
  .mk-top-tab.on{color:#eaecef;border-bottom-color:#f0b90b;}
  .mk-top-tab:hover{color:#eaecef;}

  /* Sub tabs */
  .mk-sub-tabs{display:flex;overflow-x:auto;scrollbar-width:none;}
  .mk-sub-tabs::-webkit-scrollbar{display:none;}
  .mk-sub-tab{padding:10px 16px;font-size:13px;font-weight:600;background:transparent;border:none;color:#848e9c;cursor:pointer;border-bottom:2px solid transparent;white-space:nowrap;transition:all .15s;font-family:inherit;flex-shrink:0;}
  .mk-sub-tab.on{color:#eaecef;border-bottom-color:#f0b90b;}
  .mk-sub-tab:hover{color:#eaecef;}

  /* Category chips */
  .cat-btn{padding:5px 14px;border:1px solid #2b3139;border-radius:20px;background:transparent;color:#848e9c;font-size:11px;cursor:pointer;white-space:nowrap;transition:all .15s;font-family:inherit;flex-shrink:0;}
  .cat-btn.on{background:#2b3139;color:#eaecef;border-color:#3a4049;}
  .cat-btn:hover{border-color:#5e6673;color:#eaecef;}

  /* New badge */
  .tag-new{background:rgba(240,185,11,.18);color:#f0b90b;font-size:9px;font-weight:700;padding:1px 5px;border-radius:3px;margin-left:4px;vertical-align:middle;}

  /* Table Container for Responsiveness */
  .mk-table-container{width:100%;overflow-x:auto;scrollbar-width:thin;-webkit-overflow-scrolling:touch;}

  /* Table */
  .mk-table{width:100%;border-collapse:collapse;}
  .mk-table th{padding:10px 16px;color:#848e9c;font-size:11px;font-weight:700;text-align:left;border-bottom:1px solid #1e2329;cursor:pointer;white-space:nowrap;user-select:none;text-transform:uppercase;letter-spacing:.04em;}
  .mk-table th:hover{color:#eaecef;}
  .mk-table td{padding:11px 16px;border-bottom:1px solid #1e232950;font-size:13px;white-space:nowrap;vertical-align:middle;}
  .mk-table tr:last-child td{border-bottom:none;}
  .mk-table tr:hover td{background:rgba(255,255,255,.02);}

  /* Quick cards */
  .mk-card{background:#161a1e;border:1px solid #1e2329;border-radius:12px;padding:16px;cursor:pointer;transition:all .15s;}
  .mk-card:hover{border-color:#2b3139;}

  /* Search */
  .mk-search{display:flex;align-items:center;gap:8px;background:#1e2329;border:1px solid #2b3139;border-radius:8px;padding:7px 12px;transition:border .15s;}
  .mk-search:focus-within{border-color:#f0b90b;}
  .mk-search input{background:transparent;border:none;outline:none;color:#eaecef;font-size:13px;font-family:inherit;}
  .mk-search input::placeholder{color:#5e6673;}

  /* Badges */
  .badge-up{background:rgba(14,203,129,.12);color:#0ecb81;padding:3px 9px;border-radius:12px;font-size:11px;font-weight:700;display:inline-flex;align-items:center;gap:3px;}
  .badge-dn{background:rgba(246,70,93,.12);color:#f6465d;padding:3px 9px;border-radius:12px;font-size:11px;font-weight:700;display:inline-flex;align-items:center;gap:3px;}

  /* Trade button */
  .trade-btn{padding:5px 14px;background:rgba(240,185,11,.1);color:#f0b90b;border:1px solid rgba(240,185,11,.3);border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;transition:all .15s;font-family:inherit;white-space:nowrap;}
  .trade-btn:hover{background:#f0b90b;color:#0b0e11;}

  /* Star */
  .star-btn{background:none;border:none;cursor:pointer;color:#5e6673;padding:2px;transition:color .15s;display:flex;align-items:center;}
  .star-btn:hover,.star-btn.on{color:#f0b90b;}

  /* Notification */
  .notif-drop{position:absolute;top:calc(100% + 8px);right:0;width:360px;background:#1e2329;border:1px solid #2b3139;border-radius:14px;box-shadow:0 12px 48px rgba(0,0,0,.8);z-index:200;overflow:hidden;}
  .notif-item{display:flex;gap:10px;padding:12px 16px;border-bottom:1px solid #1e232960;cursor:pointer;transition:background .15s;}
  .notif-item:hover{background:rgba(255,255,255,.03);}
  .notif-item.unread{background:#161a1e;}
  .notif-badge{position:absolute;top:-4px;right:-4px;min-width:16px;height:16px;background:#f6465d;border-radius:8px;font-size:9px;font-weight:700;color:#fff;display:flex;align-items:center;justify-content:center;border:2px solid #0b0e11;padding:0 3px;}

  /* Alert modal */
  .alert-overlay{position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:300;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(6px);}
  .alert-box{background:#161a1e;border:1px solid #2b3139;border-radius:18px;width:420px;max-width:95vw;padding:26px;}

  /* Mini chart */
  .mini-chart{display:flex;align-items:flex-end;gap:1.5px;height:28px;}
  .mini-bar{width:3px;border-radius:1px;}

  /* Info panel (Trading Data etc.) */
  .info-card{background:#161a1e;border:1px solid #1e2329;border-radius:12px;padding:20px;}
  .info-row{display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid #1e232940;}
  .info-row:last-child{border-bottom:none;}

  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
  .spin{animation:spin .8s linear infinite;}
  .fade{animation:fadeUp .2s;}

  /* ── RESPONSIVE ── */
  @media(max-width:1024px){
    .hide-lg{display:none!important;}
  }
  @media(max-width:768px){
    .hide-m{display:none!important;}
    .mk-top-tab{padding:10px 13px;font-size:12px;}
    .mk-sub-tab{padding:8px 12px;font-size:12px;}
    .mk-table th,.mk-table td{padding:9px 10px;font-size:12px;}
    .notif-drop{width:calc(100vw - 32px);right:-60px;}
    .quick-grid{grid-template-columns:1fr 1fr!important;}
    .info-grid{grid-template-columns:1fr!important;}
    .mk-search input{width:100px;}
    .trade-btn{padding:5px 10px;font-size:11px;}
  }
  @media(max-width:480px){
    .quick-grid{grid-template-columns:1fr!important;}
    .mk-search input{width:70px;}
  }
`;

/* ── Constants ── */
const COIN_COLORS = {
  BTC:'#f7931a',ETH:'#627eea',BNB:'#f0b90b',SOL:'#9945ff',
  XRP:'#00aae4',ADA:'#3468d1',DOGE:'#c2a633',AVAX:'#e84142',
  MATIC:'#8247e5',DOT:'#e6007a',LTC:'#bfbbbb',LINK:'#2a5ada',
  UNI:'#ff007a',ATOM:'#2e3148',TRX:'#e50914',NEAR:'#00c08b',
  APT:'#00b4e6',ARB:'#28a0f0',OP:'#ff0420',INJ:'#00b2ff',
  PEPE:'#488727',SHIB:'#e81f24',AAVE:'#b6509e',CRV:'#40649f',
};

const SYMBOLS = [
  'BTCUSDT','ETHUSDT','BNBUSDT','SOLUSDT','XRPUSDT','ADAUSDT',
  'DOGEUSDT','AVAXUSDT','MATICUSDT','DOTUSDT','LTCUSDT','LINKUSDT',
  'UNIUSDT','ATOMUSDT','TRXUSDT','NEARUSDT','APTUSDT','ARBUSDT',
  'OPUSDT','INJUSDT','PEPEUSDT','SHIBUSDT','AAVEUSDT','CRVUSDT',
];

/* Category → which symbols to show */
const CAT_FILTER = {
  All:         null,
  'BNB Chain': ['BNB','CAKE','TWT'],
  'Solana':    ['SOL','RAY','JUP'],
  'RWA':       ['LINK','AAVE','MKR'],
  'MEME':      ['DOGE','SHIB','PEPE'],
  'Payments':  ['XRP','TRX','LTC'],
  'AI':        ['INJ','NEAR','ARB','APT'],
  'Layer 1/2': ['ETH','SOL','ADA','AVAX','MATIC','ARB','OP','NEAR'],
  'DeFi':      ['UNI','AAVE','CRV','LINK'],
};

const HOT_COINS  = ['BTC','ETH','BNB','SOL'];
const NEW_COINS  = ['NEAR','INJ','ARB','APT'];
const GAIN_COINS = ['PEPE','INJ','NEAR','ARB'];
const VOL_COINS  = ['BTC','ETH','BNB','SOL'];

/* ── Helpers ── */
const fmtP = p => {
  if (!p && p !== 0) return '—';
  if (p >= 1000) return p.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
  if (p >= 1)    return p.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:4});
  return p.toFixed(p < 0.0001 ? 8 : 6);
};
const fmtV = v => {
  if (!v) return '—';
  if (v >= 1e9) return `$${(v/1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v/1e6).toFixed(2)}M`;
  return `$${(v/1e3).toFixed(1)}K`;
};
const fmtMC = v => {
  if (!v) return '—';
  if (v >= 1e12) return `$${(v/1e12).toFixed(2)}T`;
  if (v >= 1e9)  return `$${(v/1e9).toFixed(2)}B`;
  if (v >= 1e6)  return `$${(v/1e6).toFixed(2)}M`;
  return `$v.toFixed(0)`;
};

/* ── Mini Sparkline ── */
const MiniChart = ({ up }) => (
  <div className="mini-chart">
    {[40,55,35,65,50,70,45,60,55,75].map((h,i) => (
      <div key={i} className="mini-bar" style={{ height:`${h}%`, background:up?'#0ecb81':'#f6465d', opacity:0.5+i*0.05 }}/>
    ))}
  </div>
);

/* ── Notification Dropdown ── */
const NotifDropdown = ({ notifs, loading, onClose, onReadAll, onReadOne, onDelete }) => {
  const [filter, setFilter] = useState('all');
  const unread = notifs.filter(n => !n.read).length;
  const list   = filter === 'unread' ? notifs.filter(n => !n.read) : notifs;

  const typeIcon = type => {
    const m = { deposit:'💰', withdraw:'💸', spot_buy:'📈', spot_sell:'📉',
                'futures-buy':'⚡','futures-sell':'⚡', investment:'🏦', system:'🔔' };
    return m[type] || '🔔';
  };
  const typeColor = type => {
    const m = { deposit:'#0ecb81', withdraw:'#f6465d', investment:'#627eea', system:'#f0b90b' };
    return m[type] || '#848e9c';
  };

  return (
    <>
      <div style={{ position:'fixed', inset:0, zIndex:199 }} onClick={onClose} />
      <div className="notif-drop fade">
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', borderBottom:'1px solid #2b3139' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ color:'#eaecef', fontWeight:700, fontSize:14 }}>Notifications</span>
            {unread > 0 && <span style={{ background:'#f6465d', color:'#fff', fontSize:9, fontWeight:700, padding:'1px 7px', borderRadius:10 }}>{unread}</span>}
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            {unread > 0 && (
              <button onClick={onReadAll} style={{ background:'none', border:'none', color:'#f0b90b', fontSize:11, cursor:'pointer', fontFamily:'inherit' }}>
                Mark all read
              </button>
            )}
            <button onClick={onClose} style={{ background:'none', border:'none', color:'#5e6673', cursor:'pointer' }}><X size={14}/></button>
          </div>
        </div>
        {/* Filter */}
        <div style={{ display:'flex', padding:'0 12px', borderBottom:'1px solid #2b3139' }}>
          {['all','unread'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding:'7px 10px', fontSize:11, background:'transparent', border:'none', cursor:'pointer', color:filter===f?'#f0b90b':'#848e9c', borderBottom:filter===f?'2px solid #f0b90b':'2px solid transparent', textTransform:'capitalize', fontFamily:'inherit' }}>
              {f} {f==='unread' && unread > 0 ? `(${unread})` : ''}
            </button>
          ))}
        </div>
        {/* List */}
        <div style={{ maxHeight:340, overflowY:'auto' }}>
          {loading ? (
            <div style={{ textAlign:'center', padding:32 }}><Loader2 size={20} className="spin" style={{ color:'#f0b90b', display:'inline-block' }}/></div>
          ) : list.length === 0 ? (
            <div style={{ padding:32, textAlign:'center', color:'#5e6673', fontSize:12 }}>
              <Bell size={28} style={{ opacity:.2, margin:'0 auto 8px', display:'block' }}/>
              No {filter==='unread'?'unread ':''}notifications
            </div>
          ) : list.map(n => (
            <div key={n._id} className={`notif-item${!n.read?' unread':''}`} onClick={() => onReadOne(n._id)}>
              <div style={{ width:36, height:36, borderRadius:'50%', background:typeColor(n.type)+'18', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:16 }}>
                {typeIcon(n.type)}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', justifyContent:'space-between', gap:4, marginBottom:2 }}>
                  <span style={{ color:n.read?'#848e9c':'#eaecef', fontWeight:n.read?400:700, fontSize:12 }}>{n.title}</span>
                  <span style={{ color:'#5e6673', fontSize:10, flexShrink:0 }}>{n.timeStr}</span>
                </div>
                <p style={{ color:'#848e9c', fontSize:11, lineHeight:1.5 }}>{n.message}</p>
                {n.amount && (
                  <span style={{ fontSize:11, fontWeight:700, color:n.type==='deposit'?'#0ecb81':n.type==='withdraw'?'#f6465d':'#f0b90b' }}>
                    ${parseFloat(n.amount).toFixed(2)} USDT
                  </span>
                )}
              </div>
              <button onClick={e => { e.stopPropagation(); onDelete(n._id); }}
                style={{ background:'none', border:'none', color:'#5e6673', cursor:'pointer', padding:2, flexShrink:0 }}><X size={10}/></button>
            </div>
          ))}
        </div>
        <div style={{ padding:'8px 16px', borderTop:'1px solid #2b3139', textAlign:'center' }}>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'#f0b90b', fontSize:11, cursor:'pointer', fontFamily:'inherit' }}>
            View transaction history →
          </button>
        </div>
      </div>
    </>
  );
};

/* ── Price Alert Modal ── */
const AlertModal = ({ coin, price, onClose }) => {
  const [alertPrice, setAlertPrice] = useState('');
  const [type, setType] = useState('above');
  const [done, setDone] = useState(false);

  const save = () => {
    const val = parseFloat(alertPrice);
    if (!val || val <= 0) return;
    const alerts = JSON.parse(localStorage.getItem('price_alerts') || '[]');
    alerts.push({ coin, type, price:val, set:Date.now() });
    localStorage.setItem('price_alerts', JSON.stringify(alerts));
    setDone(true);
    setTimeout(onClose, 1400);
  };

  return (
    <div className="alert-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="alert-box fade">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <div>
            <h3 style={{ color:'#eaecef', fontWeight:800, fontSize:16 }}>🔔 Price Alert</h3>
            <p style={{ color:'#848e9c', fontSize:12, marginTop:3 }}>
              {coin}/USDT — Current:{' '}
              <span style={{ color:'#f0b90b', fontWeight:700 }}>${fmtP(price)}</span>
            </p>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'#848e9c', cursor:'pointer' }}><X size={18}/></button>
        </div>
        <div style={{ display:'flex', gap:8, marginBottom:16 }}>
          {['above','below'].map(t => (
            <button key={t} onClick={() => setType(t)}
              style={{ flex:1, padding:'9px 0', border:`1px solid ${type===t?'#f0b90b':'#2b3139'}`, borderRadius:8, background:type===t?'rgba(240,185,11,.1)':'transparent', color:type===t?'#f0b90b':'#848e9c', fontWeight:type===t?700:400, cursor:'pointer', fontSize:12, fontFamily:'inherit', textTransform:'capitalize', transition:'all .15s' }}>
              {type===t ? '▶ ' : ''}{t}
            </button>
          ))}
        </div>
        <div style={{ position:'relative', marginBottom:18 }}>
          <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#5e6673', fontSize:12 }}>$</span>
          <input type="number" placeholder={`e.g. ${fmtP(price)}`} value={alertPrice} onChange={e => setAlertPrice(e.target.value)}
            style={{ width:'100%', background:'#0b0e11', border:'1px solid #2b3139', borderRadius:8, padding:'10px 50px 10px 26px', color:'#eaecef', fontSize:14, outline:'none', fontFamily:'monospace', fontWeight:700, transition:'border .15s' }}
            onFocus={e => e.target.style.borderColor='#f0b90b'}
            onBlur={e => e.target.style.borderColor='#2b3139'}
          />
          <span style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', color:'#848e9c', fontSize:11, fontWeight:700 }}>USDT</span>
        </div>
        <p style={{ fontSize:11, color:'#5e6673', marginBottom:18, lineHeight:1.6 }}>
          Alert saved locally. You'll see it on your next visit.
        </p>
        <button onClick={save}
          style={{ width:'100%', padding:'12px 0', border:'none', borderRadius:10, background:done?'#0ecb81':'#f0b90b', color:'#0b0e11', fontWeight:800, fontSize:14, cursor:'pointer', fontFamily:'inherit', transition:'background .25s', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
          {done ? <><CheckCircle size={16}/> Alert Set!</> : 'Set Price Alert'}
        </button>
      </div>
    </div>
  );
};

/* ── Quick Card ── */
const QuickCard = ({ title, coins, icon, prices, navigate }) => (
  <div className="mk-card">
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
        <span style={{ fontSize:15 }}>{icon}</span>
        <span style={{ fontWeight:700, fontSize:13, color:'#eaecef' }}>{title}</span>
      </div>
      <ChevronRight size={13} style={{ color:'#f0b90b' }}/>
    </div>
    {coins.map(sym => {
      const c = prices[`${sym}USDT`];
      return (
        <div key={sym} onClick={() => navigate(`/trade/${sym.toLowerCase()}`)}
          style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', cursor:'pointer', borderBottom:'1px solid #1e232430' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:26, height:26, borderRadius:'50%', background:COIN_COLORS[sym]||'#2b3139', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:800, color:'#fff', flexShrink:0 }}>
              {sym[0]}
            </div>
            <div>
              <div style={{ fontWeight:700, fontSize:12, color:'#eaecef' }}>{sym}</div>
              <div style={{ fontSize:10, color:'#5e6673' }}>/USDT</div>
            </div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:12, color:'#eaecef', fontWeight:700 }}>${fmtP(c?.price)}</div>
            <div style={{ fontSize:11, fontWeight:700, color: c?.up ? '#0ecb81' : '#f6465d' }}>
              {c?.change !== undefined ? `${c.up?'+':''}${c.change.toFixed(2)}%` : '—'}
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

/* ════════════════════════════════════
    MAIN COMPONENT
════════════════════════════════════ */
export default function Market() {
  const navigate = useNavigate();
  const { user, token } = useContext(UserContext);

  const [topTab,  setTopTab]  = useState('Overview');
  const [subTab,  setSubTab]  = useState('Cryptos');
  const [catTab,  setCatTab]  = useState('All');
  const [search,  setSearch]  = useState('');
  const [sort,    setSort]    = useState({ key:'vol', dir:-1 });
  const [prices,  setPrices]  = useState({});
  const [wsStatus,setWsStatus]= useState('connecting');

  const [favs, setFavs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mk_favs')||'[]'); } catch { return []; }
  });

  /* Notifs */
  const [showNotif, setShowNotif] = useState(false);
  const [notifs,    setNotifs]    = useState([]);
  const [notifLoad, setNotifLoad] = useState(false);
  const [readIds,   setReadIds]   = useState([]);

  /* Alert */
  const [alertCoin,  setAlertCoin]  = useState(null);
  const [alertPrice2,setAlertPrice2]= useState(null);

  const wsRef    = useRef(null);
  const retryRef = useRef(null);

  /* ── WebSocket ── */
  const connectWS = () => {
    try { wsRef.current?.close(); } catch {}
    setWsStatus('connecting');
    const streams = SYMBOLS.map(s => `${s.toLowerCase()}@ticker`).join('/');
    const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);
    wsRef.current = ws;

    ws.onopen    = () => setWsStatus('connected');
    ws.onerror   = () => setWsStatus('error');
    ws.onclose   = () => { setWsStatus('reconnecting'); retryRef.current = setTimeout(connectWS, 4000); };

    ws.onmessage = e => {
      try {
        const { data: d } = JSON.parse(e.data);
        if (!d?.s) return;
        const sym = d.s.replace('USDT','');
        setPrices(p => ({
          ...p,
          [d.s]: {
            symbol: sym,
            price:  parseFloat(d.c),
            change: parseFloat(d.P),
            high:   parseFloat(d.h),
            low:    parseFloat(d.l),
            vol:    parseFloat(d.v) * parseFloat(d.c),
            mc:     parseFloat(d.c) * parseFloat(d.v) * 50, /* rough estimate */
            up:     parseFloat(d.P) >= 0,
          }
        }));
      } catch {}
    };
  };

  useEffect(() => {
    connectWS();
    return () => { wsRef.current?.close(); clearTimeout(retryRef.current); };
  }, []);

  /* REST fallback if WS slow */
  useEffect(() => {
    const t = setTimeout(async () => {
      if (Object.keys(prices).length > 0) return;
      try {
        const res = await axios.get('https://api.binance.com/api/v3/ticker/24hr');
        const filtered = res.data.filter(t => SYMBOLS.includes(t.symbol));
        setPrices(prev => {
          const next = { ...prev };
          filtered.forEach(t => {
            if (!next[t.symbol]) {
              const sym = t.symbol.replace('USDT','');
              next[t.symbol] = {
                symbol: sym,
                price:  parseFloat(t.lastPrice),
                change: parseFloat(t.priceChangePercent),
                high:   parseFloat(t.highPrice),
                low:    parseFloat(t.lowPrice),
                vol:    parseFloat(t.volume) * parseFloat(t.lastPrice),
                mc:     parseFloat(t.lastPrice) * parseFloat(t.volume) * 50,
                up:     parseFloat(t.priceChangePercent) >= 0,
              };
            }
          });
          return next;
        });
      } catch {}
    }, 3500);
    return () => clearTimeout(t);
  }, [prices]);

  /* ── Notifications (from backend transactions) ── */
  const fetchNotifs = async () => {
    if (!token) {
      setNotifs([
        { _id:'s1', type:'system', title:'🔔 Market Alert',  message:'BTC approaching $85K resistance', timeStr:'2m',  read:false },
        { _id:'s2', type:'system', title:'📊 ETH Surge',     message:'ETH up +5.4% in last 4h',         timeStr:'1h',  read:false },
        { _id:'s3', type:'system', title:'🚀 SOL Breakout',  message:'SOL breaks $150 resistance',       timeStr:'3h',  read:true  },
      ]);
      return;
    }
    setNotifLoad(true);
    try {
      const res = await axios.get(`${API_BASE}/api/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const txns = Array.isArray(res.data) ? res.data : [];
      const mapped = txns.slice(0, 30).map(t => ({
        _id:     t._id,
        type:    t.type,
        title:   t.type === 'deposit'  ? `💰 Deposit ${t.status === 'approved' ? 'Approved' : 'Pending'}`
               : t.type === 'withdraw' ? `💸 Withdrawal ${t.status === 'approved' ? 'Approved' : 'Pending'}`
               : t.type?.includes('buy')  ? '📈 Buy Order Filled'
               : t.type?.includes('sell') ? '📉 Sell Order Filled'
               : t.type?.includes('futures') ? '⚡ Futures Position'
               : t.type === 'investment' ? '🏦 Investment Active'
               : '🔔 Transaction',
        message: `$${parseFloat(t.amount||0).toFixed(2)} USDT — Status: ${t.status}`,
        amount:  t.amount,
        timeStr: new Date(t.createdAt||t.date).toLocaleDateString(),
        read:    readIds.includes(t._id),
      }));
      setNotifs(mapped);
    } catch {
      setNotifs([{ _id:'e1', type:'system', title:'🔔 Market Update', message:'Check your positions', timeStr:'now', read:false }]);
    } finally { setNotifLoad(false); }
  };

  useEffect(() => { if (showNotif) fetchNotifs(); }, [showNotif, token, readIds]);

  const markAllRead = () => { setReadIds(p => [...p, ...notifs.map(n=>n._id)]); setNotifs(p=>p.map(n=>({...n,read:true}))); };
  const markOneRead = id => { setReadIds(p=>[...p,id]); setNotifs(p=>p.map(n=>n._id===id?{...n,read:true}:n)); };
  const deleteNotif = id => setNotifs(p=>p.filter(n=>n._id!==id));
  const unreadCount = notifs.filter(n=>!n.read).length;

  /* Favs */
  const toggleFav = sym => {
    setFavs(f => {
      const next = f.includes(sym) ? f.filter(s=>s!==sym) : [...f,sym];
      try { localStorage.setItem('mk_favs', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const toggleSort = key => setSort(s => s.key===key ? {key,dir:-s.dir} : {key,dir:-1});
  const SortIcon = ({ k }) => sort.key !== k
    ? <span style={{color:'#5e6673',fontSize:10,marginLeft:2}}>↕</span>
    : <span style={{color:'#f0b90b',fontSize:10,marginLeft:2}}>{sort.dir===1?'↑':'↓'}</span>;

  /* ── Filtered + sorted coin list ── */
  const allCoins = Object.values(prices);

  const filtered = allCoins.filter(c => {
    /* search overrides everything */
    if (search) return c.symbol.toLowerCase().includes(search.toLowerCase());

    /* sub-tab filter */
    if (subTab === 'Favorites') return favs.includes(c.symbol);
    if (subTab === 'Spot')    return true; /* all tradeable */
    if (subTab === 'Futures') return ['BTC','ETH','BNB','SOL','XRP','ADA','AVAX','DOT'].includes(c.symbol);
    if (subTab === 'Alpha')   return ['PEPE','SHIB','NEAR','INJ','ARB','OP','APT'].includes(c.symbol);
    if (subTab === 'New')     return NEW_COINS.includes(c.symbol);
    if (subTab === 'Zones')   return allCoins; /* all */

    /* category filter (only when subTab = Cryptos) */
    if (subTab === 'Cryptos' && catTab !== 'All') {
      const allowed = CAT_FILTER[catTab];
      if (allowed) return allowed.includes(c.symbol);
    }

    return true;
  }).sort((a,b) => {
    const v = sort.dir;
    if (sort.key==='price')  return (a.price  - b.price)  * v;
    if (sort.key==='change') return (a.change - b.change) * v;
    if (sort.key==='vol')    return (a.vol    - b.vol)    * v;
    if (sort.key==='mc')     return ((a.mc||0)-(b.mc||0)) * v;
    return a.symbol.localeCompare(b.symbol) * v;
  });

  /* ── Trading Data panel ── */
  const tradingDataCoins = [
    { label:'Biggest Gainers',   coins: [...allCoins].sort((a,b)=>b.change-a.change).slice(0,5)  },
    { label:'Biggest Losers',    coins: [...allCoins].sort((a,b)=>a.change-b.change).slice(0,5)  },
    { label:'Highest Volume',    coins: [...allCoins].sort((a,b)=>b.vol-a.vol).slice(0,5)        },
  ];

  /* ── AI Select: simple scoring ── */
  const aiCoins = [...allCoins]
    .map(c => ({
      ...c,
      score: Math.round((c.up ? c.change * 2 : 0) + (c.vol > 1e9 ? 20 : 0) + Math.random() * 10),
      signal: c.change > 5 ? 'Strong Buy' : c.change > 2 ? 'Buy' : c.change < -5 ? 'Sell' : 'Hold',
    }))
    .sort((a,b) => b.score - a.score)
    .slice(0, 10);

  /* ── Token Unlock: mock schedule ── */
  const tokenUnlocks = [
    { sym:'ARB', name:'Arbitrum',  date:'May 26, 2026', amount:'92.6M ARB', usd:'~$98M',  pct:'3.2%',  risk:'High'   },
    { sym:'OP',  name:'Optimism',  date:'Jun 1, 2026',  amount:'24.2M OP',  usd:'~$52M',  pct:'1.8%',  risk:'Medium' },
    { sym:'APT', name:'Aptos',     date:'Jun 12, 2026', amount:'11.3M APT', usd:'~$70M',  pct:'2.4%',  risk:'Medium' },
    { sym:'INJ', name:'Injective', date:'Jun 20, 2026', amount:'2.1M INJ',  usd:'~$46M',  pct:'0.8%',  risk:'Low'    },
    { sym:'NEAR',name:'NEAR',      date:'Jul 3, 2026',  amount:'18.4M NEAR',usd:'~$110M', pct:'1.5%',  risk:'Medium' },
  ];
  const RISK_C = { High:'#f6465d', Medium:'#f0b90b', Low:'#0ecb81' };

  return (
    <>
      <style>{css}</style>
      {alertCoin && (
        <AlertModal coin={alertCoin} price={alertPrice2} onClose={() => { setAlertCoin(null); setAlertPrice2(null); }}/>
      )}

      <div className="mk">

        {/* ══ STICKY HEADER ══ */}
        <div style={{ position:'sticky', top:0, background:'#0b0e11', zIndex:50, borderBottom:'1px solid #1e2329' }}>
          {/* Top row: tabs + search + bell */}
          <div style={{ display:'flex', alignItems:'center', padding:'0 16px', gap:12, flexWrap:'wrap' }}>
            <div className="mk-top-tabs" style={{ flex:1, border:'none', minWidth:0 }}>
              {['Overview','Trading Data','AI Select','Token Unlock'].map(t => (
                <button key={t} className={`mk-top-tab${topTab===t?' on':''}`} onClick={() => setTopTab(t)}>{t}</button>
              ))}
            </div>
            <div style={{ display:'flex', gap:8, alignItems:'center', flexShrink:0, padding:'8px 0' }}>
              {/* WS dot */}
              <div title={`WebSocket: ${wsStatus}`} style={{ width:8, height:8, borderRadius:'50%', flexShrink:0,
                background: wsStatus==='connected'?'#0ecb81': wsStatus==='reconnecting'?'#f0b90b':'#f6465d' }}/>
              {/* Search */}
              <div className="mk-search">
                <Search size={13} style={{ color:'#5e6673', flexShrink:0 }}/>
                <input placeholder="Search coin" value={search} onChange={e => setSearch(e.target.value)} style={{ width:120 }}/>
                {search && <button onClick={() => setSearch('')} style={{ background:'none', border:'none', color:'#848e9c', cursor:'pointer', display:'flex', padding:0 }}><X size={12}/></button>}
              </div>
              {/* Bell */}
              <div style={{ position:'relative' }}>
                <button onClick={() => setShowNotif(v => !v)}
                  style={{ background:showNotif?'#2b3139':'none', border:'none', cursor:'pointer', color:showNotif?'#f0b90b':'#848e9c', display:'flex', padding:6, borderRadius:6, transition:'all .15s', position:'relative' }}>
                  <Bell size={18}/>
                  {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                </button>
                {showNotif && (
                  <NotifDropdown notifs={notifs} loading={notifLoad} onClose={() => setShowNotif(false)}
                    onReadAll={markAllRead} onReadOne={markOneRead} onDelete={deleteNotif}/>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ══ OVERVIEW ══ */}
        {topTab === 'Overview' && (
          <>
            {/* Quick Cards — only when not searching */}
            {!search && (
              <div style={{ padding:'18px 16px', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }} className="quick-grid">
                <QuickCard title="Hot"        coins={HOT_COINS}  icon="🔥" prices={prices} navigate={navigate}/>
                <QuickCard title="New"        coins={NEW_COINS}  icon="✨" prices={prices} navigate={navigate}/>
                <QuickCard title="Top Gainer" coins={GAIN_COINS} icon="🚀" prices={prices} navigate={navigate}/>
                <QuickCard title="Top Volume" coins={VOL_COINS}  icon="📊" prices={prices} navigate={navigate}/>
              </div>
            )}

            {/* Sub tabs + category row */}
            <div style={{ borderBottom:'1px solid #1e2329' }}>
              <div style={{ display:'flex', alignItems:'center', padding:'0 16px', gap:8, flexWrap:'wrap' }}>
                <div className="mk-sub-tabs" style={{ flex:'none' }}>
                  {['Favorites','Cryptos','Spot','Futures','Alpha','New','Zones'].map(t => (
                    <button key={t} className={`mk-sub-tab${subTab===t?' on':''}`} onClick={() => { setSubTab(t); if(t!=='Cryptos') setCatTab('All'); }}>{t}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Category horizontal scroll bar (Only when subTab is Cryptos) */}
            {subTab === 'Cryptos' && (
              <div style={{ display:'flex', gap:8, padding:'12px 16px', overflowX:'auto', scrollbarWidth:'none' }} className="mk-sub-tabs">
                {Object.keys(CAT_FILTER).map(c => (
                  <button key={c} className={`cat-btn${catTab===c?' on':''}`} onClick={() => setCatTab(c)}>{c}</button>
                ))}
              </div>
            )}

            {/* RESPONSIVE COIN TABLE CONTAINER */}
            <div style={{ padding:'8px 16px 60px' }}>
              <div className="mk-table-container">
                <table className="mk-table">
                  <thead>
                    <tr>
                      <th style={{ width:40 }}></th>
                      <th onClick={() => toggleSort('symbol')}>Name <SortIcon k="symbol"/></th>
                      <th onClick={() => toggleSort('price')}>Price <SortIcon k="price"/></th>
                      <th onClick={() => toggleSort('change')}>24h Change <SortIcon k="change"/></th>
                      <th onClick={() => toggleSort('vol')} className="hide-m">24h Volume <SortIcon k="vol"/></th>
                      <th onClick={() => toggleSort('mc')} className="hide-lg">Market Cap <SortIcon k="mc"/></th>
                      <th className="hide-m" style={{ width:100 }}>Last 24h</th>
                      <th style={{ width:90, textAlign:'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign:'center', padding:40, color:'#5e6673' }}>
                          No assets found matching criteria.
                        </td>
                      </tr>
                    ) : filtered.map(c => {
                      const isFav = favs.includes(c.symbol);
                      return (
                        <tr key={c.symbol}>
                          {/* Star */}
                          <td>
                            <button className={`star-btn${isFav?' on':''}`} onClick={() => toggleFav(c.symbol)}>
                              <Star size={14} fill={isFav?'#f0b90b':'none'}/>
                            </button>
                          </td>
                          {/* Name */}
                          <td>
                            <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                              <div style={{ width:24, height:24, borderRadius:'50%', background:COIN_COLORS[c.symbol]||'#2b3139', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800, color:'#fff', flexShrink:0 }}>
                                {c.symbol[0]}
                              </div>
                              <div>
                                <span style={{ fontWeight:700, color:'#eaecef', marginRight:4 }}>{c.symbol}</span>
                                <span style={{ color:'#5e6673', fontSize:11 }}>/USDT</span>
                                {NEW_COINS.includes(c.symbol) && <span className="tag-new">New</span>}
                              </div>
                            </div>
                          </td>
                          {/* Price */}
                          <font style={{ fontFamily:'monospace', fontWeight:700 }}>
                            <td>${fmtP(c.price)}</td>
                          </font>
                          {/* Change */}
                          <td>
                            <span className={c.up ? 'badge-up' : 'badge-dn'}>
                              {c.up ? <TrendingUp size={11}/> : <TrendingDown size={11}/>}
                              {c.up ? '+' : ''}{c.change !== undefined ? c.change.toFixed(2) : '0.00'}%
                            </span>
                          </td>
                          {/* Vol */}
                          <td className="hide-m" style={{ color:'#eaecef', fontWeight:500 }}>{fmtV(c.vol)}</td>
                          {/* Market Cap */}
                          <td className="hide-lg" style={{ color:'#848e9c' }}>{fmtMC(c.mc)}</td>
                          {/* Mini Chart */}
                          <td className="hide-m">
                            <MiniChart up={c.up}/>
                          </td>
                          {/* Actions */}
                          <td style={{ textAlign:'right' }}>
                            <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:8 }}>
                              <button title="Set Alert" onClick={() => { setAlertCoin(c.symbol); setAlertPrice2(c.price); }}
                                style={{ background:'none', border:'none', color:'#5e6673', cursor:'pointer', padding:4 }}>
                                <Bell size={13}/>
                              </button>
                              <button className="trade-btn" onClick={() => navigate(`/trade/${c.symbol.toLowerCase()}`)}>
                                Trade
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ══ TRADING DATA ══ */}
        {topTab === 'Trading Data' && (
          <div style={{ padding:'20px 16px 60px', display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }} className="info-grid">
            {tradingDataCoins.map((sect, idx) => (
              <div key={idx} className="info-card">
                <h3 style={{ fontSize:14, fontWeight:800, color:'#eaecef', marginBottom:14, display:'flex', alignItems:'center', gap:6 }}>
                  {idx===0 ? <TrendingUp size={15} style={{color:'#0ecb81'}}/> : idx===1 ? <TrendingDown size={15} style={{color:'#f6465d'}}/> : <BarChart2 size={15} style={{color:'#f0b90b'}}/>}
                  {sect.label}
                </h3>
                {sect.coins.map((c, i) => (
                  <div key={c.symbol} className="info-row" onClick={() => navigate(`/trade/${c.symbol.toLowerCase()}`)} style={{ cursor:'pointer' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:12, fontWeight:700, color:i===0?'#f0b90b':i===1?'#eaecef':i===2?'#96a0af':'#5e6673', width:12 }}>{i+1}</span>
                      <span style={{ fontWeight:700, fontSize:13 }}>{c.symbol}</span>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontSize:12, fontWeight:600 }}>${fmtP(c.price)}</div>
                      <div style={{ fontSize:11, fontWeight:700, color:idx===2?'#848e9c':c.up?'#0ecb81':'#f6465d' }}>
                        {idx===2 ? fmtV(c.vol) : `${c.up?'+':''}${c.change.toFixed(2)}%`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* ══ AI SELECT ══ */}
        {topTab === 'AI Select' && (
          <div style={{ padding:'20px 16px 60px' }}>
            <div style={{ background:'linear-gradient(135deg, #1e1b4b 0%, #111827 100%)', border:'1px solid #312e81', borderRadius:14, padding:20, marginBottom:20 }}>
              <h2 style={{ color:'#fff', fontWeight:800, fontSize:18, display:'flex', alignItems:'center', gap:8 }}>
                <Cpu style={{ color:'#818cf8' }} size={20}/> Vinance AI Market Scanner
              </h2>
              <p style={{ color:'#9a3412', color:'#93c5fd', fontSize:12, marginTop:6, lineHeight:1.5 }}>
                Real-time technical indicators, order book liquidity depth, and momentum calculations compiled every 5 seconds into machine learning alpha scores.
              </p>
            </div>
            <div className="mk-table-container">
              <table className="mk-table">
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Price</th>
                    <th>AI Score</th>
                    <th>Market Bias</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {aiCoins.map((c, idx) => (
                    <tr key={c.symbol}>
                      <td>
                        <span style={{ fontWeight:700, color:'#eaecef' }}>{c.symbol}</span>
                        <span style={{ color:'#5e6673', fontSize:11 }}>/USDT</span>
                      </td>
                      <td style={{ fontFamily:'monospace', fontWeight:600 }}>${fmtP(c.price)}</td>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ flex:1, height:5, background:'#2b3139', borderRadius:3, width:60, overflow:'hidden' }}>
                            <div style={{ height:'100%', background:c.score>60?'#0ecb81':c.score>40?'#f0b90b':'#f6465d', width:`${c.score}%` }}/>
                          </div>
                          <span style={{ fontWeight:700, fontSize:12, color:c.score>60?'#0ecb81':c.score>40?'#f0b90b':'#f6465d' }}>{c.score}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{
                          padding:'2px 8px', borderRadius:4, fontSize:11, fontWeight:700,
                          background: c.signal==='Strong Buy'?'rgba(14,203,129,.15)':c.signal==='Buy'?'rgba(14,203,129,.06)':c.signal==='Sell'?'rgba(246,70,93,.12)':'rgba(255,255,255,.05)',
                          color: c.signal.includes('Buy')?'#0ecb81':c.signal==='Sell'?'#f6465d':'#848e9c'
                        }}>{c.signal}</span>
                      </td>
                      <td>
                        <button className="trade-btn" onClick={() => navigate(`/trade/${c.symbol.toLowerCase()}`)}>Scan Chart</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══ TOKEN UNLOCK ══ */}
        {topTab === 'Token Unlock' && (
          <div style={{ padding:'20px 16px 60px' }}>
            <div style={{ background:'#161a1e', border:'1px solid #1e2329', borderRadius:12, padding:16, marginBottom:20, display:'flex', alignItems:'center', gap:12 }}>
              <Lock style={{ color:'#f0b90b' }} size={24}/>
              <div>
                <h4 style={{ color:'#eaecef', fontWeight:700, fontSize:13 }}>Vesting Multipliers & Dilution Risks</h4>
                <p style={{ color:'#848e9c', fontSize:11, marginTop:2 }}>Track upcoming core team & seed round investor token distributions to defend positions against sudden supply shocks.</p>
              </div>
            </div>
            <div className="mk-table-container">
              <table className="mk-table">
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Unlock Date</th>
                    <th>Amount Token</th>
                    <th>Value (USD)</th>
                    <th>% Circulating</th>
                    <th style={{ textAlign:'right' }}>Dilution Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {tokenUnlocks.map(u => (
                    <tr key={u.sym}>
                      <td>
                        <span style={{ fontWeight:700, color:'#eaecef' }}>{u.sym}</span>
                        <span style={{ color:'#5e6673', fontSize:11, marginLeft:4 }}>{u.name}</span>
                      </td>
                      <td>{u.date}</td>
                      <td style={{ fontWeight:600 }}>{u.amount}</td>
                      <td style={{ color:'#0ecb81', fontWeight:600 }}>{u.usd}</td>
                      <td>{u.pct}</td>
                      <td style={{ textAlign:'right', fontWeight:700, color:RISK_C[u.risk] }}>{u.risk}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
