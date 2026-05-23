import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import {
  Search, Bell, Star, ChevronRight, X, CheckCircle,
  AlertCircle, Loader2, RefreshCw
} from 'lucide-react';

const API_BASE = 'https://vinance-backend-1.onrender.com';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  .mk{font-family:'Inter',sans-serif;background:#0b0e11;color:#eaecef;min-height:100vh;}
  .mk *{box-sizing:border-box;margin:0;padding:0;}
  .mk ::-webkit-scrollbar{width:4px;height:4px;}
  .mk ::-webkit-scrollbar-thumb{background:#2b3139;border-radius:4px;}
  .mk-top-tabs{display:flex;padding:0 24px;border-bottom:1px solid #1e2329;overflow-x:auto;scrollbar-width:none;}
  .mk-top-tabs::-webkit-scrollbar{display:none;}
  .mk-top-tab{padding:14px 20px;font-size:14px;font-weight:600;background:transparent;border:none;color:#848e9c;cursor:pointer;border-bottom:2px solid transparent;white-space:nowrap;margin-bottom:-1px;transition:all .15s;font-family:inherit;}
  .mk-top-tab.on{color:#eaecef;border-bottom-color:#f0b90b;}
  .mk-sub-tabs{display:flex;overflow-x:auto;scrollbar-width:none;}
  .mk-sub-tabs::-webkit-scrollbar{display:none;}
  .mk-sub-tab{padding:8px 16px;font-size:13px;font-weight:600;background:transparent;border:none;color:#848e9c;cursor:pointer;border-bottom:2px solid transparent;white-space:nowrap;transition:all .15s;font-family:inherit;}
  .mk-sub-tab.on{color:#eaecef;border-bottom-color:#f0b90b;}
  .mk-tag-new{background:rgba(240,185,11,.15);color:#f0b90b;font-size:9px;font-weight:700;padding:1px 5px;border-radius:3px;margin-left:4px;vertical-align:middle;}
  .mk-card{background:#161a1e;border:1px solid #1e2329;border-radius:12px;padding:16px 20px;cursor:pointer;transition:all .15s;}
  .mk-card:hover{border-color:#2b3139;transform:translateY(-1px);}
  .mk-table{width:100%;border-collapse:collapse;}
  .mk-table th{padding:10px 16px;color:#848e9c;font-size:12px;font-weight:500;text-align:left;border-bottom:1px solid #1e2329;cursor:pointer;white-space:nowrap;user-select:none;}
  .mk-table th:hover{color:#eaecef;}
  .mk-table td{padding:12px 16px;border-bottom:1px solid #1e232950;font-size:13px;white-space:nowrap;}
  .mk-table tr:hover td{background:#161a1e;}
  .mk-table tr:last-child td{border-bottom:none;}
  .mk-search{display:flex;align-items:center;gap:8px;background:#1e2329;border:1px solid #2b3139;border-radius:8px;padding:8px 14px;transition:border .15s;}
  .mk-search:focus-within{border-color:#f0b90b;}
  .mk-search input{background:transparent;border:none;outline:none;color:#eaecef;font-size:13px;width:180px;font-family:inherit;}
  .mk-search input::placeholder{color:#5e6673;}
  .coin-logo{border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;flex-shrink:0;color:#fff;}
  .up{color:#0ecb81;} .dn{color:#f6465d;}
  .star-btn{background:none;border:none;cursor:pointer;color:#5e6673;padding:2px;transition:color .15s;display:flex;align-items:center;}
  .star-btn:hover,.star-btn.on{color:#f0b90b;}
  .trade-btn{padding:6px 18px;background:rgba(240,185,11,.1);color:#f0b90b;border:1px solid rgba(240,185,11,.3);border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;transition:all .15s;font-family:inherit;}
  .trade-btn:hover{background:#f0b90b;color:#0b0e11;}
  .cat-btn{padding:5px 14px;border:1px solid #2b3139;border-radius:20px;background:transparent;color:#848e9c;font-size:11px;cursor:pointer;white-space:nowrap;transition:all .15s;font-family:inherit;}
  .cat-btn.on{background:#2b3139;color:#eaecef;border-color:#2b3139;}
  .mini-chart{display:flex;align-items:flex-end;gap:1px;height:28px;}
  .mini-bar{width:3px;border-radius:1px;}
  .badge{display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:12px;font-size:10px;font-weight:700;}
  .badge-up{background:rgba(14,203,129,.12);color:#0ecb81;}
  .badge-dn{background:rgba(246,70,93,.12);color:#f6465d;}
  .notif-drop{position:absolute;top:calc(100% + 8px);right:0;width:360px;background:#1e2329;border:1px solid #2b3139;border-radius:12px;box-shadow:0 8px 40px rgba(0,0,0,.8);z-index:99;overflow:hidden;}
  .notif-item{display:flex;gap:10px;padding:12px 16px;border-bottom:1px solid #1e232960;cursor:pointer;transition:background .15s;}
  .notif-item:hover{background:rgba(255,255,255,.03);}
  .notif-item.unread{background:#161a1e;}
  .notif-badge{position:absolute;top:-4px;right:-4px;min-width:16px;height:16px;background:#f6465d;border-radius:8px;font-size:9px;font-weight:700;color:#fff;display:flex;align-items:center;justify-content:center;border:2px solid #0b0e11;padding:0 3px;}
  .alert-overlay{position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:200;display:flex;align-items:center;justify-content:center;padding:16px;}
  .alert-box{background:#1e2329;border:1px solid #2b3139;border-radius:16px;width:420px;max-width:95vw;padding:24px;}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
  .spin{animation:spin .8s linear infinite;}
  .fade{animation:fadeUp .2s;}
  @media(max-width:768px){
    .mk-top-tab{padding:10px 14px;font-size:13px;}
    .mk-table th,.mk-table td{padding:8px 10px;font-size:12px;}
    .hide-m{display:none!important;}
    .notif-drop{width:300px;right:-40px;}
    .quick-grid{grid-template-columns:1fr 1fr!important;}
  }
`;

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

const HOT  = ['BNB','BTC','ETH','SOL'];
const NEW  = ['NEAR','INJ','ARB','APT'];
const GAIN = ['NEAR','INJ','PEPE','ARB'];
const VOL  = ['BTC','ETH','BNB','SOL'];
const CATS = ['All','BNB Chain','Solana','RWA','MEME','Payments','AI','Layer 1/2','DeFi'];

/* ── Notification Dropdown ── */
const NotifDropdown = ({ notifs, loading, onClose, onReadAll, onReadOne, onDelete }) => {
  const [filter, setFilter] = useState('all');
  const unread = notifs.filter(n => !n.read).length;
  const list = filter === 'unread' ? notifs.filter(n => !n.read) : notifs;

  const typeInfo = (type) => {
    const map = {
      deposit:'💰', withdraw:'💸', spot_buy:'📈', spot_sell:'📉',
      'futures-buy':'⚡', 'futures-sell':'⚡', investment:'🏦', system:'🔔',
    };
    const colors = { deposit:'#0ecb81', withdraw:'#f6465d', investment:'#627eea' };
    return { icon: map[type] || '🔔', color: colors[type] || '#848e9c' };
  };

  return (
    <>
      <div style={{ position:'fixed', inset:0, zIndex:88 }} onClick={onClose}/>
      <div className="notif-drop fade">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', borderBottom:'1px solid #2b3139' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ color:'#eaecef', fontWeight:700, fontSize:14 }}>Notifications</span>
            {unread > 0 && <span style={{ background:'#f6465d', color:'#fff', fontSize:9, fontWeight:700, padding:'1px 7px', borderRadius:10 }}>{unread}</span>}
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            {unread > 0 && <button onClick={onReadAll} style={{ background:'none', border:'none', color:'#f0b90b', fontSize:11, cursor:'pointer', fontFamily:'inherit' }}>Mark all read</button>}
            <button onClick={onClose} style={{ background:'none', border:'none', color:'#5e6673', cursor:'pointer' }}><X size={14}/></button>
          </div>
        </div>
        <div style={{ display:'flex', padding:'0 12px', borderBottom:'1px solid #2b3139' }}>
          {['all','unread'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding:'7px 10px', fontSize:11, background:'transparent', border:'none', cursor:'pointer', color:filter===f?'#f0b90b':'#848e9c', borderBottom:filter===f?'2px solid #f0b90b':'2px solid transparent', textTransform:'capitalize', fontFamily:'inherit' }}>
              {f}
            </button>
          ))}
        </div>
        <div style={{ maxHeight:340, overflowY:'auto' }}>
          {loading ? (
            <div style={{ textAlign:'center', padding:32 }}><Loader2 size={20} className="spin" style={{ color:'#f0b90b', display:'inline-block' }}/></div>
          ) : list.length === 0 ? (
            <div style={{ padding:32, textAlign:'center', color:'#5e6673', fontSize:12 }}>
              <Bell size={28} style={{ opacity:.2, margin:'0 auto 8px', display:'block' }}/>
              No {filter==='unread'?'unread ':''}notifications
            </div>
          ) : list.map(n => {
            const { icon, color } = typeInfo(n.type);
            return (
              <div key={n._id} className={`notif-item${!n.read?' unread':''}`} onClick={() => onReadOne(n._id)}>
                <div style={{ width:36, height:36, borderRadius:'50%', background:`${color}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:16 }}>{icon}</div>
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
            );
          })}
        </div>
        <div style={{ padding:'8px 16px', borderTop:'1px solid #2b3139', textAlign:'center' }}>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'#f0b90b', fontSize:11, cursor:'pointer', fontFamily:'inherit' }}>View All →</button>
        </div>
      </div>
    </>
  );
};

/* ── Price Alert Modal ── */
const AlertModal = ({ coin, price, onClose }) => {
  const [alertPrice, setAlertPrice] = useState('');
  const [type,  setType]  = useState('above');
  const [done,  setDone]  = useState(false);

  const save = () => {
    if (!alertPrice || parseFloat(alertPrice) <= 0) return;
    const alerts = JSON.parse(localStorage.getItem('price_alerts') || '[]');
    alerts.push({ coin, type, price: parseFloat(alertPrice), set: Date.now() });
    localStorage.setItem('price_alerts', JSON.stringify(alerts));
    setDone(true);
    setTimeout(onClose, 1200);
  };

  return (
    <div className="alert-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="alert-box fade">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <div>
            <h3 style={{ color:'#eaecef', fontWeight:700, fontSize:16 }}>🔔 Price Alert — {coin}/USDT</h3>
            <p style={{ color:'#848e9c', fontSize:12, marginTop:2 }}>Current: <span style={{ color:'#f0b90b', fontWeight:700 }}>${parseFloat(price||0).toLocaleString(undefined,{minimumFractionDigits:2})}</span></p>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'#848e9c', cursor:'pointer' }}><X size={16}/></button>
        </div>
        <div style={{ display:'flex', gap:8, marginBottom:14 }}>
          {['above','below'].map(t => (
            <button key={t} onClick={() => setType(t)}
              style={{ flex:1, padding:'9px 0', border:`1px solid ${type===t?'#f0b90b':'#2b3139'}`, borderRadius:6, background:type===t?'rgba(240,185,11,.1)':'transparent', color:type===t?'#f0b90b':'#848e9c', fontWeight:type===t?700:400, cursor:'pointer', fontSize:12, fontFamily:'inherit', textTransform:'capitalize' }}>
              {t}
            </button>
          ))}
        </div>
        <div style={{ position:'relative', marginBottom:18 }}>
          <input type="number" placeholder="Alert Price" value={alertPrice} onChange={e => setAlertPrice(e.target.value)}
            style={{ width:'100%', background:'#2b3139', border:'1px solid #2b3139', borderRadius:6, padding:'10px 55px 10px 12px', color:'#eaecef', fontSize:13, outline:'none', boxSizing:'border-box' }}
            onFocus={e => e.target.style.borderColor='#f0b90b'}
            onBlur={e => e.target.style.borderColor='#2b3139'}/>
          <span style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', color:'#848e9c', fontSize:11, fontWeight:700 }}>USDT</span>
        </div>
        <button onClick={save}
          style={{ width:'100%', padding:'12px 0', border:'none', borderRadius:8, background:done?'#0ecb81':'#f0b90b', color:'#0b0e11', fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'inherit', transition:'background .2s' }}>
          {done ? '✓ Alert Set!' : 'Set Alert'}
        </button>
      </div>
    </div>
  );
};

export default function Market() {
  const navigate = useNavigate();
  const { user, token } = useContext(UserContext);

  const [topTab,  setTopTab]  = useState('Overview');
  const [subTab,  setSubTab]  = useState('Cryptos');
  const [catTab,  setCatTab]  = useState('All');
  const [search,  setSearch]  = useState('');
  const [favs,    setFavs]    = useState(() => { try { return JSON.parse(localStorage.getItem('mk_favs')||'[]'); } catch { return []; } });
  const [prices,  setPrices]  = useState({});
  const [sort,    setSort]    = useState({ key:'vol', dir:-1 });
  const [wsStatus,setWsStatus]= useState('connecting');

  /* Notifications */
  const [showNotif, setShowNotif] = useState(false);
  const [notifs,    setNotifs]    = useState([]);
  const [notifLoad, setNotifLoad] = useState(false);
  const [readIds,   setReadIds]   = useState([]);

  /* Price Alert */
  const [alertCoin,  setAlertCoin]  = useState(null);
  const [alertPrice, setAlertPrice] = useState(null);

  const wsRef    = useRef(null);
  const retryRef = useRef(null);

  /* ── WebSocket with retry ── */
  const connectWS = () => {
    if (wsRef.current) wsRef.current.close();
    setWsStatus('connecting');

    const streams = SYMBOLS.map(s => `${s.toLowerCase()}@ticker`).join('/');
    const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);
    wsRef.current = ws;

    ws.onopen = () => setWsStatus('connected');

    ws.onmessage = e => {
      try {
        const { data: d } = JSON.parse(e.data);
        if (!d?.s) return;
        const sym = d.s.replace('USDT', '');
        setPrices(p => ({
          ...p,
          [d.s]: {
            symbol: sym,
            price:  parseFloat(d.c),
            change: parseFloat(d.P),
            high:   parseFloat(d.h),
            low:    parseFloat(d.l),
            vol:    parseFloat(d.v) * parseFloat(d.c),
            up:     parseFloat(d.P) >= 0,
          }
        }));
      } catch {}
    };

    ws.onerror = () => setWsStatus('error');

    ws.onclose = () => {
      setWsStatus('reconnecting');
      retryRef.current = setTimeout(connectWS, 3000);
    };
  };

  useEffect(() => {
    connectWS();
    return () => {
      wsRef.current?.close();
      clearTimeout(retryRef.current);
    };
  }, []);

  /* Fallback: REST API if WS slow */
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
                up:     parseFloat(t.priceChangePercent) >= 0,
              };
            }
          });
          return next;
        });
      } catch {}
    }, 4000);
    return () => clearTimeout(t);
  }, [prices]);

  /* ── Fetch notifications from backend ── */
  const fetchNotifs = async () => {
    if (!token) {
      setNotifs([
        { _id:'n1', type:'system', title:'🔔 Market Alert', message:'BTC approaching $85K resistance zone', timeStr:'2m', read:false },
        { _id:'n2', type:'system', title:'📊 Trend Update', message:'ETH up +5.4% in last 4 hours', timeStr:'1h', read:true },
      ]);
      return;
    }
    setNotifLoad(true);
    try {
      const res = await axios.get(`${API_BASE}/api/transactions`, { headers:{ Authorization:`Bearer ${token}` } });
      const txns = Array.isArray(res.data) ? res.data : [];
      const mapped = txns.slice(0, 25).map(t => ({
        _id:     t._id,
        type:    t.type,
        title:   t.type==='deposit'  ? `💰 Deposit ${t.status==='approved'?'Approved':'Pending'}`
                :t.type==='withdraw' ? `💸 Withdrawal ${t.status==='approved'?'Approved':'Pending'}`
                :t.type?.includes('buy')  ? '📈 Buy Order Filled'
                :t.type?.includes('sell') ? '📉 Sell Order Filled'
                :'🔔 Transaction',
        message: `$${parseFloat(t.amount||0).toFixed(2)} USDT — ${t.status}`,
        amount:  t.amount,
        timeStr: new Date(t.createdAt||t.date).toLocaleDateString(),
        read:    readIds.includes(t._id),
      }));
      setNotifs(mapped);
    } catch {
      setNotifs([
        { _id:'e1', type:'system', title:'🔔 Market Update', message:'Check your positions and open orders', timeStr:'now', read:false },
      ]);
    } finally { setNotifLoad(false); }
  };

  useEffect(() => { if (showNotif) fetchNotifs(); }, [showNotif, token, readIds]);

  const markAllRead  = () => { setReadIds(p => [...p, ...notifs.map(n=>n._id)]); setNotifs(p => p.map(n=>({...n,read:true}))); };
  const markOneRead  = id => { setReadIds(p => [...p, id]); setNotifs(p => p.map(n => n._id===id?{...n,read:true}:n)); };
  const deleteNotif  = id => setNotifs(p => p.filter(n => n._id !== id));
  const unreadCount  = notifs.filter(n => !n.read).length;

  /* Favs */
  const toggleFav = sym => {
    setFavs(f => {
      const next = f.includes(sym) ? f.filter(s=>s!==sym) : [...f,sym];
      try { localStorage.setItem('mk_favs', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const toggleSort = key => setSort(s => s.key===key ? {key,dir:-s.dir} : {key,dir:-1});

  const allCoins = Object.values(prices);

  const filtered = allCoins.filter(c => {
    if (search) return c.symbol.toLowerCase().includes(search.toLowerCase());
    if (subTab === 'Favorites') return favs.includes(c.symbol);
    return true;
  }).sort((a,b) => {
    const v = sort.dir;
    if (sort.key==='price')  return (a.price  - b.price)  * v;
    if (sort.key==='change') return (a.change - b.change) * v;
    if (sort.key==='vol')    return (a.vol    - b.vol)    * v;
    return a.symbol.localeCompare(b.symbol) * v;
  });

  const SortIcon = ({ k }) => sort.key!==k
    ? <span style={{color:'#5e6673',fontSize:10,marginLeft:2}}>↕</span>
    : <span style={{color:'#f0b90b',fontSize:10,marginLeft:2}}>{sort.dir===1?'↑':'↓'}</span>;

  const fmtP = p => {
    if (!p) return '—';
    if (p >= 1000) return p.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
    if (p >= 1)    return p.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:4});
    return p.toFixed(6);
  };
  const fmtV = v => {
    if (!v) return '—';
    if (v >= 1e9) return `$${(v/1e9).toFixed(2)}B`;
    if (v >= 1e6) return `$${(v/1e6).toFixed(2)}M`;
    return `$${(v/1e3).toFixed(2)}K`;
  };

  const MiniChart = ({ up }) => (
    <div className="mini-chart">
      {[40,60,35,70,55,80,45,65,50,75].map((h,i) => (
        <div key={i} className="mini-bar" style={{ height:`${h}%`, background:up?'#0ecb81':'#f6465d', opacity:0.6+(i*0.04) }}/>
      ))}
    </div>
  );

  const QuickCard = ({ title, coins, icon }) => (
    <div className="mk-card">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontSize:14 }}>{icon}</span>
          <span style={{ fontWeight:700, fontSize:13, color:'#eaecef' }}>{title}</span>
        </div>
        <span style={{ color:'#f0b90b', fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:2 }}>More <ChevronRight size={12}/></span>
      </div>
      {coins.map(sym => {
        const c = prices[`${sym}USDT`];
        return (
          <div key={sym} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', cursor:'pointer', borderBottom:'1px solid #1e232440' }}
            onClick={() => navigate(`/trade/${sym.toLowerCase()}`)}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div className="coin-logo" style={{ background:COIN_COLORS[sym]||'#2b3139', width:24, height:24, fontSize:9 }}>{sym[0]}</div>
              <div>
                <div style={{ fontWeight:700, fontSize:12, color:'#eaecef' }}>{sym}</div>
                <div style={{ fontSize:10, color:'#5e6673' }}>/USDT</div>
              </div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:12, color:'#eaecef', fontWeight:700 }}>${fmtP(c?.price)}</div>
              <div className={c?.up?'up':'dn'} style={{ fontSize:11, fontWeight:700 }}>
                {c?.change !== undefined ? `${c.up?'+':''}${c.change.toFixed(2)}%` : '—'}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      <style>{css}</style>
      {alertCoin && <AlertModal coin={alertCoin} price={alertPrice} onClose={() => { setAlertCoin(null); setAlertPrice(null); }}/>}

      <div className="mk">
        {/* TOP BAR */}
        <div style={{ display:'flex', alignItems:'center', padding:'0 24px', borderBottom:'1px solid #1e2329', gap:16, flexWrap:'wrap', position:'sticky', top:0, background:'#0b0e11', zIndex:50 }}>
          <div className="mk-top-tabs" style={{ flex:1, padding:0, border:'none' }}>
            {['Overview','Trading Data','AI Select','Token Unlock'].map(t => (
              <button key={t} className={`mk-top-tab${topTab===t?' on':''}`} onClick={() => setTopTab(t)}>{t}</button>
            ))}
          </div>
          <div style={{ display:'flex', gap:10, alignItems:'center', padding:'8px 0' }}>
            {/* WS status indicator */}
            <div style={{ width:8, height:8, borderRadius:'50%', background:wsStatus==='connected'?'#0ecb81':wsStatus==='reconnecting'?'#f0b90b':'#f6465d', flexShrink:0 }} title={`WebSocket: ${wsStatus}`}/>

            <div className="mk-search">
              <Search size={14} style={{ color:'#5e6673', flexShrink:0 }}/>
              <input placeholder="Search coin" value={search} onChange={e => setSearch(e.target.value)}/>
              {search && <button onClick={() => setSearch('')} style={{ background:'none', border:'none', color:'#848e9c', cursor:'pointer', display:'flex' }}><X size={12}/></button>}
            </div>

            {/* Notification Bell */}
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

        {/* QUICK CARDS */}
        {!search && (
          <div style={{ padding:'20px 24px', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }} className="quick-grid">
            <QuickCard title="Hot"        coins={HOT}  icon="🔥"/>
            <QuickCard title="New"        coins={NEW}   icon="✨"/>
            <QuickCard title="Top Gainer" coins={GAIN}  icon="🚀"/>
            <QuickCard title="Top Volume" coins={VOL}   icon="📊"/>
          </div>
        )}

        {/* SUB TABS */}
        <div style={{ display:'flex', alignItems:'center', padding:'0 24px', borderBottom:'1px solid #1e2329', flexWrap:'wrap' }}>
          <div className="mk-sub-tabs" style={{ flex:'none' }}>
            {['Favorites','Cryptos','Spot','Futures','Alpha','New','Zones'].map(t => (
              <button key={t} className={`mk-sub-tab${subTab===t?' on':''}`} onClick={() => setSubTab(t)}>
                {t}{t==='Alpha' && <span className="mk-tag-new">New</span>}
              </button>
            ))}
          </div>
          <div style={{ display:'flex', gap:6, overflowX:'auto', scrollbarWidth:'none', padding:'10px 0 10px 16px', flex:1 }}>
            {CATS.map(c => (
              <button key={c} className={`cat-btn${catTab===c?' on':''}`} onClick={() => setCatTab(c)}>
                {c}{c==='Solana' && <span className="mk-tag-new">New</span>}
              </button>
            ))}
          </div>
        </div>

        {/* TABLE */}
        <div style={{ padding:'0 24px 60px' }}>
          <div style={{ padding:'16px 0 10px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
            <div>
              <h3 style={{ fontSize:16, fontWeight:700, color:'#eaecef', marginBottom:4 }}>Top Tokens by Market Capitalization</h3>
              <p style={{ fontSize:12, color:'#848e9c' }}>
                Real-time via Binance WebSocket ·{' '}
                <span style={{ color: wsStatus==='connected'?'#0ecb81':wsStatus==='reconnecting'?'#f0b90b':'#f6465d' }}>
                  {wsStatus==='connected'?`${filtered.length} coins live`:wsStatus==='reconnecting'?'Reconnecting...':'Connecting...'}
                </span>
              </p>
            </div>
            <button onClick={connectWS} style={{ display:'flex', alignItems:'center', gap:6, background:'#1e2329', border:'1px solid #2b3139', borderRadius:8, padding:'7px 12px', color:'#848e9c', cursor:'pointer', fontSize:12, fontFamily:'inherit' }}>
              <RefreshCw size={13}/> Reconnect
            </button>
          </div>

          <div style={{ background:'#161a1e', borderRadius:12, overflow:'hidden', border:'1px solid #1e2329' }}>
            <table className="mk-table">
              <thead>
                <tr style={{ background:'#0b0e11' }}>
                  <th style={{ width:40 }}></th>
                  <th onClick={() => toggleSort('symbol')}>Name <SortIcon k="symbol"/></th>
                  <th onClick={() => toggleSort('price')} style={{ textAlign:'right' }}>Price <SortIcon k="price"/></th>
                  <th onClick={() => toggleSort('change')} style={{ textAlign:'right' }}>24h Change <SortIcon k="change"/></th>
                  <th style={{ textAlign:'right' }} className="hide-m">24h High</th>
                  <th style={{ textAlign:'right' }} className="hide-m">24h Low</th>
                  <th onClick={() => toggleSort('vol')} style={{ textAlign:'right' }} className="hide-m">24h Volume <SortIcon k="vol"/></th>
                  <th style={{ textAlign:'right', width:80 }} className="hide-m">Trend</th>
                  <th style={{ textAlign:'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {allCoins.length === 0 ? (
                  <tr><td colSpan={9} style={{ textAlign:'center', padding:60, color:'#5e6673' }}>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
                      <div style={{ width:32, height:32, border:'3px solid #f0b90b', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 1s linear infinite' }}/>
                      <span style={{ fontSize:12 }}>
                        {wsStatus==='reconnecting'?'Reconnecting to market data...':'Loading market data...'}
                      </span>
                    </div>
                  </td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={9} style={{ textAlign:'center', padding:40, color:'#5e6673', fontSize:13 }}>No results found</td></tr>
                ) : filtered.map((c, idx) => (
                  <tr key={c.symbol} style={{ cursor:'pointer' }} onClick={() => navigate(`/trade/${c.symbol.toLowerCase()}`)}>
                    <td onClick={e => e.stopPropagation()}>
                      <button className={`star-btn${favs.includes(c.symbol)?' on':''}`} onClick={() => toggleFav(c.symbol)}>
                        <Star size={14} style={favs.includes(c.symbol)?{fill:'#f0b90b'}:{}}/>
                      </button>
                    </td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ color:'#5e6673', fontSize:11, minWidth:20, textAlign:'right' }}>{idx+1}</div>
                        <div className="coin-logo" style={{ background:COIN_COLORS[c.symbol]||'#2b3139', width:32, height:32, fontSize:11 }}>{c.symbol[0]}</div>
                        <div>
                          <div style={{ fontWeight:700, fontSize:13, color:'#eaecef' }}>{c.symbol}</div>
                          <div style={{ fontSize:11, color:'#848e9c' }}>{c.symbol}/USDT</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign:'right', fontWeight:700, color:'#eaecef', fontVariantNumeric:'tabular-nums' }}>${fmtP(c.price)}</td>
                    <td style={{ textAlign:'right' }}>
                      <span className={`badge${c.up?' badge-up':' badge-dn'}`}>{c.up?'▲':'▼'} {Math.abs(c.change).toFixed(2)}%</span>
                    </td>
                    <td style={{ textAlign:'right', color:'#0ecb81', fontSize:12 }} className="hide-m">${fmtP(c.high)}</td>
                    <td style={{ textAlign:'right', color:'#f6465d', fontSize:12 }} className="hide-m">${fmtP(c.low)}</td>
                    <td style={{ textAlign:'right', color:'#848e9c', fontVariantNumeric:'tabular-nums', fontSize:12 }} className="hide-m">{fmtV(c.vol)}</td>
                    <td className="hide-m"><div style={{ display:'flex', justifyContent:'flex-end' }}><MiniChart up={c.up}/></div></td>
                    <td style={{ textAlign:'right' }} onClick={e => e.stopPropagation()}>
                      <div style={{ display:'flex', gap:6, justifyContent:'flex-end' }}>
                        <button onClick={() => { setAlertCoin(c.symbol); setAlertPrice(c.price); }}
                          style={{ background:'none', border:'1px solid #2b3139', borderRadius:6, padding:'5px 7px', cursor:'pointer', color:'#848e9c', display:'flex', alignItems:'center', transition:'all .15s' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor='#f0b90b'; e.currentTarget.style.color='#f0b90b'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor='#2b3139'; e.currentTarget.style.color='#848e9c'; }}
                          title="Set Price Alert">
                          <Bell size={12}/>
                        </button>
                        <button className="trade-btn" onClick={() => navigate(`/trade/${c.symbol.toLowerCase()}`)}>Trade</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </>
  );
}
