import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import {
  Search, Bell, Star, ChevronRight, X, CheckCircle,
  TrendingUp, AlertCircle, Loader2, RefreshCw
} from 'lucide-react';

const API_BASE = 'https://vinance-backend-1.onrender.com';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  .mk{font-family:'Inter',sans-serif;background:#0b0e11;color:#eaecef;min-height:100vh;}
  .mk *{box-sizing:border-box;margin:0;padding:0;}
  .mk-top-tabs{display:flex;gap:0;padding:0 24px;border-bottom:1px solid #1e2329;overflow-x:auto;scrollbar-width:none;}
  .mk-top-tabs::-webkit-scrollbar{display:none;}
  .mk-top-tab{padding:14px 20px;font-size:14px;font-weight:600;background:transparent;border:none;color:#848e9c;cursor:pointer;border-bottom:2px solid transparent;white-space:nowrap;margin-bottom:-1px;transition:all .15s;font-family:inherit;}
  .mk-top-tab.on{color:#eaecef;border-bottom-color:#f0b90b;}
  .mk-top-tab:hover{color:#eaecef;}
  .mk-sub-tabs{display:flex;gap:0;overflow-x:auto;scrollbar-width:none;}
  .mk-sub-tabs::-webkit-scrollbar{display:none;}
  .mk-sub-tab{padding:8px 16px;font-size:13px;font-weight:600;background:transparent;border:none;color:#848e9c;cursor:pointer;border-bottom:2px solid transparent;white-space:nowrap;transition:all .15s;font-family:inherit;}
  .mk-sub-tab.on{color:#eaecef;border-bottom-color:#f0b90b;}
  .mk-sub-tab:hover{color:#eaecef;}
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
  .coin-logo{border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:12px;flex-shrink:0;}
  .up{color:#0ecb81;} .dn{color:#f6465d;}
  .star-btn{background:none;border:none;cursor:pointer;color:#5e6673;padding:2px;transition:color .15s;display:flex;align-items:center;}
  .star-btn:hover,.star-btn.on{color:#f0b90b;}
  .trade-btn{padding:6px 18px;background:rgba(240,185,11,.1);color:#f0b90b;border:1px solid rgba(240,185,11,.3);border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;transition:all .15s;font-family:inherit;}
  .trade-btn:hover{background:#f0b90b;color:#0b0e11;}
  .cat-btn{padding:5px 14px;border:1px solid #2b3139;border-radius:20px;background:transparent;color:#848e9c;font-size:11px;cursor:pointer;white-space:nowrap;transition:all .15s;font-family:inherit;}
  .cat-btn.on{background:#2b3139;color:#eaecef;border-color:#2b3139;}
  .cat-btn:hover{color:#eaecef;border-color:#5e6673;}
  .mini-chart{display:flex;align-items:flex-end;gap:1px;height:28px;}
  .mini-bar{width:3px;border-radius:1px;}
  .badge{display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:12px;font-size:10px;font-weight:700;}
  .badge-up{background:rgba(14,203,129,.12);color:#0ecb81;}
  .badge-dn{background:rgba(246,70,93,.12);color:#f6465d;}
  /* NOTIFICATION DROPDOWN */
  .notif-overlay{position:fixed;inset:0;z-index:90;}
  .notif-drop{position:absolute;top:calc(100% + 8px);right:0;width:360px;background:#1e2329;border:1px solid #2b3139;border-radius:12px;box-shadow:0 8px 40px rgba(0,0,0,.8);z-index:99;overflow:hidden;}
  .notif-item{display:flex;gap:10px;padding:12px 16px;border-bottom:1px solid #1e232960;cursor:pointer;transition:background .15s;}
  .notif-item:hover,.notif-item.unread{background:#161a1e;}
  .notif-badge{position:absolute;top:-4px;right:-4px;min-width:16px;height:16px;background:#f6465d;border-radius:8px;font-size:9px;font-weight:700;color:#fff;display:flex;align-items:center;justify-content:center;border:2px solid #0b0e11;padding:0 3px;}
  /* ALERT MODAL */
  .alert-overlay{position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:200;display:flex;align-items:center;justify-content:center;padding:16px;}
  .alert-box{background:#1e2329;border:1px solid #2b3139;border-radius:16px;width:420px;max-width:95vw;padding:24px;}
  @keyframes spin{to{transform:rotate(360deg)}}
  .spin{animation:spin .8s linear infinite}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
  .pulse{animation:pulse 2s infinite;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
  .fade{animation:fadeUp .2s;}
  @media(max-width:768px){
    .mk-top-tab{padding:10px 14px;font-size:13px;}
    .mk-table th,.mk-table td{padding:8px 10px;font-size:12px;}
    .hide-mobile{display:none!important;}
    .notif-drop{width:320px;right:-60px;}
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

const HOT_COINS = ['BNB','BTC','ETH','SOL'];
const NEW_COINS = ['NEAR','INJ','ARB','APT'];
const TOP_GAIN  = ['NEAR','INJ','PEPE','ARB'];
const TOP_VOL   = ['BTC','ETH','BNB','SOL'];
const CATS = ['All','BNB Chain','Solana','RWA','MEME','Payments','AI','Layer 1/2','DeFi','Seed','Launchpool','Gaming'];

/* ══ NOTIFICATION DROPDOWN ══ */
const NotifDropdown = ({ notifs, loading, onClose, onReadAll, onReadOne, onDelete }) => {
  const [filter, setFilter] = useState('all');
  const unread = notifs.filter(n => !n.read).length;
  const list = filter === 'unread' ? notifs.filter(n => !n.read) : notifs;

  const typeIcon = (type) => {
    if (type === 'deposit')   return { icon:'💰', color:'#0ecb81' };
    if (type === 'withdraw')  return { icon:'💸', color:'#f6465d' };
    if (type === 'trade')     return { icon:'📈', color:'#f0b90b' };
    if (type === 'futures')   return { icon:'⚡', color:'#9b58f0' };
    if (type === 'investment')return { icon:'🏦', color:'#0ecb81' };
    if (type === 'system')    return { icon:'🔔', color:'#848e9c' };
    return { icon:'ℹ️', color:'#848e9c' };
  };

  return (
    <>
      <div className="notif-overlay" onClick={onClose}/>
      <div className="notif-drop fade">
        {/* Header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',borderBottom:'1px solid #2b3139'}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{color:'#eaecef',fontWeight:700,fontSize:14}}>Notifications</span>
            {unread > 0 && <span style={{background:'#f6465d',color:'#fff',fontSize:9,fontWeight:700,padding:'1px 7px',borderRadius:10}}>{unread}</span>}
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            {unread > 0 && <button onClick={onReadAll} style={{background:'none',border:'none',color:'#f0b90b',fontSize:11,cursor:'pointer',fontFamily:'inherit'}}>Mark all read</button>}
            <button onClick={onClose} style={{background:'none',border:'none',color:'#5e6673',cursor:'pointer'}}><X size={14}/></button>
          </div>
        </div>
        {/* Filter tabs */}
        <div style={{display:'flex',padding:'0 12px',borderBottom:'1px solid #2b3139'}}>
          {['all','unread'].map(f => (
            <button key={f} onClick={()=>setFilter(f)} style={{padding:'7px 10px',fontSize:11,background:'transparent',border:'none',cursor:'pointer',color:filter===f?'#f0b90b':'#848e9c',borderBottom:filter===f?'2px solid #f0b90b':'2px solid transparent',textTransform:'capitalize',fontFamily:'inherit'}}>{f}</button>
          ))}
        </div>
        {/* List */}
        <div style={{maxHeight:340,overflowY:'auto',scrollbarWidth:'thin',scrollbarColor:'#2b3139 transparent'}}>
          {loading ? (
            <div style={{textAlign:'center',padding:32}}><Loader2 size={20} className="spin" style={{color:'#f0b90b',display:'inline-block'}}/></div>
          ) : list.length === 0 ? (
            <div style={{padding:32,textAlign:'center',color:'#5e6673',fontSize:12}}>
              <Bell size={28} style={{opacity:.2,margin:'0 auto 8px',display:'block'}}/>
              No {filter==='unread'?'unread':''} notifications
            </div>
          ) : list.map(n => {
            const {icon, color} = typeIcon(n.type);
            return (
              <div key={n._id||n.id} className={`notif-item${!n.read?' unread':''}`} onClick={()=>onReadOne(n._id||n.id)}>
                <div style={{width:34,height:34,borderRadius:'50%',background:`${color}18`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:15}}>{icon}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',justifyContent:'space-between',gap:4,marginBottom:2}}>
                    <span style={{color:n.read?'#848e9c':'#eaecef',fontWeight:n.read?400:700,fontSize:12}}>{n.title||n.type?.toUpperCase()||'Notification'}</span>
                    <span style={{color:'#5e6673',fontSize:10,flexShrink:0}}>{n.time||new Date(n.createdAt||n.date).toLocaleString()}</span>
                  </div>
                  <p style={{color:'#848e9c',fontSize:11,lineHeight:1.5}}>
                    {n.message||n.body||`${n.type} — $${n.amount||''}`}
                  </p>
                  {n.amount && (
                    <span style={{fontSize:11,fontWeight:700,color:n.type==='deposit'?'#0ecb81':n.type==='withdraw'?'#f6465d':'#f0b90b'}}>
                      ${parseFloat(n.amount||0).toFixed(2)} USDT
                    </span>
                  )}
                </div>
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,flexShrink:0}}>
                  {!n.read && <div style={{width:7,height:7,background:'#f0b90b',borderRadius:'50%'}}/>}
                  <button onClick={e=>{e.stopPropagation();onDelete(n._id||n.id);}} style={{background:'none',border:'none',color:'#5e6673',cursor:'pointer',padding:2}}><X size={10}/></button>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{padding:'8px 16px',borderTop:'1px solid #2b3139',textAlign:'center'}}>
          <button onClick={onClose} style={{background:'none',border:'none',color:'#f0b90b',fontSize:11,cursor:'pointer',fontFamily:'inherit'}}>View All Notifications →</button>
        </div>
      </div>
    </>
  );
};

/* ══ PRICE ALERT MODAL ══ */
const PriceAlertModal = ({ coin, price, token, onClose }) => {
  const [alertPrice, setAlertPrice] = useState('');
  const [type, setType] = useState('above');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const save = async () => {
    if (!alertPrice || parseFloat(alertPrice) <= 0) return;
    setSaving(true);
    try {
      /* Store in localStorage (backend alert system can be added later) */
      const alerts = JSON.parse(localStorage.getItem('price_alerts') || '[]');
      alerts.push({ coin, type, price: parseFloat(alertPrice), set: Date.now() });
      localStorage.setItem('price_alerts', JSON.stringify(alerts));
      setDone(true);
      setTimeout(onClose, 1200);
    } finally { setSaving(false); }
  };

  return (
    <div className="alert-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="alert-box fade">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
          <div>
            <h3 style={{color:'#eaecef',fontWeight:700,fontSize:16}}>🔔 Price Alert</h3>
            <p style={{color:'#848e9c',fontSize:12,marginTop:2}}>{coin}/USDT</p>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',color:'#848e9c',cursor:'pointer'}}><X size={16}/></button>
        </div>
        <div style={{marginBottom:12,fontSize:12,color:'#5e6673'}}>
          Current: <span style={{color:'#f0b90b',fontWeight:700}}>${parseFloat(price||0).toLocaleString(undefined,{minimumFractionDigits:2})}</span>
        </div>
        <div style={{display:'flex',gap:8,marginBottom:14}}>
          {['above','below'].map(t => (
            <button key={t} onClick={()=>setType(t)} style={{flex:1,padding:'9px 0',border:`1px solid ${type===t?'#f0b90b':'#2b3139'}`,borderRadius:6,background:type===t?'rgba(240,185,11,.1)':'transparent',color:type===t?'#f0b90b':'#848e9c',fontWeight:type===t?700:400,cursor:'pointer',fontSize:12,fontFamily:'inherit',textTransform:'capitalize'}}>{t}</button>
          ))}
        </div>
        <div style={{position:'relative',marginBottom:18}}>
          <input type="number" placeholder="Alert Price" value={alertPrice} onChange={e=>setAlertPrice(e.target.value)}
            style={{width:'100%',background:'#2b3139',border:'1px solid #2b3139',borderRadius:6,padding:'10px 55px 10px 12px',color:'#eaecef',fontSize:13,outline:'none',boxSizing:'border-box'}}/>
          <span style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',color:'#848e9c',fontSize:11,fontWeight:700,pointerEvents:'none'}}>USDT</span>
        </div>
        <button onClick={save} disabled={saving||done} style={{width:'100%',padding:'12px 0',border:'none',borderRadius:8,background:done?'#0ecb81':'#f0b90b',color:'#0b0e11',fontWeight:700,fontSize:14,cursor:'pointer',fontFamily:'inherit'}}>
          {done ? '✓ Alert Set!' : saving ? 'Saving...' : 'Set Alert'}
        </button>
      </div>
    </div>
  );
};

/* ══ MAIN MARKET PAGE ══ */
export default function Market() {
  const navigate = useNavigate();
  const { user, token } = useContext(UserContext);

  const [topTab, setTopTab]   = useState('Overview');
  const [subTab, setSubTab]   = useState('Cryptos');
  const [catTab, setCatTab]   = useState('All');
  const [search, setSearch]   = useState('');
  const [favs,   setFavs]     = useState(() => JSON.parse(localStorage.getItem('mk_favs')||'[]'));
  const [prices, setPrices]   = useState({});
  const [sort,   setSort]     = useState({ key:'vol', dir:-1 });

  /* Notifications */
  const [showNotif,  setShowNotif]  = useState(false);
  const [notifs,     setNotifs]     = useState([]);
  const [notifLoad,  setNotifLoad]  = useState(false);
  const [localRead,  setLocalRead]  = useState([]);

  /* Alert modal */
  const [alertCoin, setAlertCoin] = useState(null);
  const [alertPrice, setAlertPrice] = useState(null);

  const wsRef = useRef(null);

  /* WebSocket price feed */
  useEffect(() => {
    const streams = SYMBOLS.map(s=>`${s.toLowerCase()}@ticker`).join('/');
    wsRef.current = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);
    wsRef.current.onmessage = e => {
      const { data:d } = JSON.parse(e.data);
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
          up:     parseFloat(d.P) >= 0,
        }
      }));
    };
    wsRef.current.onerror = () => wsRef.current?.close();
    return () => wsRef.current?.close();
  }, []);

  /* Fetch notifications from backend */
  const fetchNotifs = async () => {
    if (!token) return;
    setNotifLoad(true);
    try {
      const res = await axios.get(`${API_BASE}/api/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const txns = Array.isArray(res.data) ? res.data : [];
      /* Convert transactions to notifications */
      const mapped = txns.slice(0, 20).map((t, i) => ({
        _id:    t._id || String(i),
        type:   t.type || 'system',
        title:  t.type === 'deposit'   ? '💰 Deposit ' + (t.status === 'approved' ? 'Approved' : 'Pending')
               : t.type === 'withdraw' ? '💸 Withdrawal ' + (t.status === 'approved' ? 'Approved' : 'Pending')
               : t.type?.includes('buy')  ? '📈 Buy Order Filled'
               : t.type?.includes('sell') ? '📉 Sell Order Filled'
               : '🔔 Transaction Update',
        message: `$${parseFloat(t.amount||0).toFixed(2)} USDT — ${t.status}`,
        amount: t.amount,
        createdAt: t.createdAt || t.date,
        read: localRead.includes(t._id || String(i)),
      }));
      /* Add market alerts from localStorage */
      const priceAlerts = JSON.parse(localStorage.getItem('price_alerts') || '[]');
      const alertNotifs = priceAlerts.map((a, i) => ({
        _id:    `alert_${i}`,
        type:   'system',
        title:  '⚡ Price Alert Set',
        message:`${a.coin}/USDT ${a.type} $${a.price.toLocaleString()}`,
        createdAt: new Date(a.set).toISOString(),
        read: true,
      }));
      setNotifs([...mapped, ...alertNotifs]);
    } catch {
      /* Fallback demo notifs */
      setNotifs([
        { _id:'d1', type:'system',     title:'🔔 Market Update',          message:'BTC is showing strong momentum. Consider reviewing your positions.', createdAt: new Date().toISOString(), read:false },
        { _id:'d2', type:'trade',      title:'📈 Trade Signal',            message:'ETH/USDT breaking key resistance at $2,800', createdAt: new Date().toISOString(), read:false },
        { _id:'d3', type:'investment', title:'💰 Investment Opportunity',  message:'New high-yield plan available: 25% APY', createdAt: new Date().toISOString(), read:true },
      ]);
    } finally { setNotifLoad(false); }
  };

  useEffect(() => { if (showNotif) fetchNotifs(); }, [showNotif, token]);

  const markAllRead = () => {
    const ids = notifs.map(n => n._id);
    setLocalRead(p => [...new Set([...p, ...ids])]);
    setNotifs(p => p.map(n => ({...n, read:true})));
  };
  const markOneRead = (id) => {
    setLocalRead(p => [...new Set([...p, id])]);
    setNotifs(p => p.map(n => n._id===id ? {...n,read:true} : n));
  };
  const deleteNotif = (id) => setNotifs(p => p.filter(n => n._id !== id));

  const unreadCount = notifs.filter(n => !n.read).length;

  /* Favs */
  const toggleFav = (sym) => {
    setFavs(f => {
      const next = f.includes(sym) ? f.filter(s=>s!==sym) : [...f,sym];
      localStorage.setItem('mk_favs', JSON.stringify(next));
      return next;
    });
  };

  const toggleSort  = key => setSort(s => s.key===key?{key,dir:-s.dir}:{key,dir:-1});

  const allCoins  = Object.values(prices);
  const isLoading = allCoins.length === 0;

  const filtered = allCoins.filter(c => {
    if (search) return c.symbol.toLowerCase().includes(search.toLowerCase());
    if (subTab === 'Favorites') return favs.includes(c.symbol);
    return true;
  }).sort((a, b) => {
    const v = sort.dir;
    if (sort.key === 'price')  return (a.price  - b.price)  * v;
    if (sort.key === 'change') return (a.change - b.change) * v;
    if (sort.key === 'vol')    return (a.vol    - b.vol)    * v;
    return a.symbol.localeCompare(b.symbol) * v;
  });

  const SortIcon = ({ k }) => sort.key !== k
    ? <span style={{color:'#5e6673',fontSize:10,marginLeft:2}}>↕</span>
    : <span style={{color:'#f0b90b',fontSize:10,marginLeft:2}}>{sort.dir===1?'↑':'↓'}</span>;

  const fmtPrice = p => {
    if (!p) return '—';
    if (p >= 1000) return p.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
    if (p >= 1)    return p.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:4});
    return p.toFixed(6);
  };
  const fmtVol = v => {
    if (!v) return '—';
    if (v >= 1e9) return `$${(v/1e9).toFixed(2)}B`;
    if (v >= 1e6) return `$${(v/1e6).toFixed(2)}M`;
    return `$${(v/1e3).toFixed(2)}K`;
  };

  const MiniChart = ({ up }) => (
    <div className="mini-chart">
      {[40,60,35,70,55,80,45,65,50,75].map((h,i) => (
        <div key={i} className="mini-bar" style={{height:`${h}%`,background:up?'#0ecb81':'#f6465d',opacity:0.7+(i*0.03)}}/>
      ))}
    </div>
  );

  const QuickCard = ({ title, coins, icon }) => (
    <div className="mk-card">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          <span style={{fontSize:14}}>{icon}</span>
          <span style={{fontWeight:700,fontSize:13,color:'#eaecef'}}>{title}</span>
        </div>
        <span style={{color:'#f0b90b',fontSize:12,cursor:'pointer',display:'flex',alignItems:'center',gap:2}}>More <ChevronRight size={12}/></span>
      </div>
      {coins.map(sym => {
        const c = prices[`${sym}USDT`];
        return (
          <div key={sym} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'7px 0',cursor:'pointer',borderBottom:'1px solid #1e232940'}}
            onClick={()=>navigate(`/trade/${sym.toLowerCase()}`)}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div className="coin-logo" style={{background:COIN_COLORS[sym]||'#2b3139',width:24,height:24,fontSize:9,color:'#fff'}}>{sym[0]}</div>
              <div>
                <div style={{fontWeight:700,fontSize:12,color:'#eaecef'}}>{sym}</div>
                <div style={{fontSize:10,color:'#5e6673'}}>/USDT</div>
              </div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:12,color:'#eaecef',fontWeight:700}}>${fmtPrice(c?.price)}</div>
              <div className={c?.up?'up':'dn'} style={{fontSize:11,fontWeight:700}}>
                {c?.change!==undefined?`${c.up?'+':''}${c.change.toFixed(2)}%`:'—'}
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
      {alertCoin && <PriceAlertModal coin={alertCoin} price={alertPrice} token={token} onClose={()=>{setAlertCoin(null);setAlertPrice(null);}}/>}

      <div className="mk">
        {/* TOP BAR */}
        <div style={{display:'flex',alignItems:'center',padding:'0 24px',borderBottom:'1px solid #1e2329',gap:16,flexWrap:'wrap',position:'sticky',top:0,background:'#0b0e11',zIndex:50}}>
          <div className="mk-top-tabs" style={{flex:1,padding:0,border:'none',gap:0}}>
            {['Overview','Trading Data','AI Select','Token Unlock'].map(t => (
              <button key={t} className={`mk-top-tab${topTab===t?' on':''}`} onClick={()=>setTopTab(t)}>{t}</button>
            ))}
          </div>
          <div style={{display:'flex',gap:10,alignItems:'center',padding:'8px 0'}}>
            <div className="mk-search">
              <Search size={14} style={{color:'#5e6673',flexShrink:0}}/>
              <input placeholder="Search coin" value={search} onChange={e=>setSearch(e.target.value)}/>
              {search && <button onClick={()=>setSearch('')} style={{background:'none',border:'none',color:'#848e9c',cursor:'pointer',display:'flex'}}>&#x2715;</button>}
            </div>

            {/* NOTIFICATION BELL — Backend connected */}
            <div style={{position:'relative'}}>
              <button onClick={()=>setShowNotif(v=>!v)}
                style={{background:showNotif?'#2b3139':'none',border:'none',cursor:'pointer',color:showNotif?'#f0b90b':'#848e9c',display:'flex',padding:6,borderRadius:6,transition:'all .15s',position:'relative'}}>
                <Bell size={18}/>
                {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </button>
              {showNotif && (
                <NotifDropdown
                  notifs={notifs}
                  loading={notifLoad}
                  onClose={()=>setShowNotif(false)}
                  onReadAll={markAllRead}
                  onReadOne={markOneRead}
                  onDelete={deleteNotif}
                />
              )}
            </div>
          </div>
        </div>

        {/* QUICK CARDS */}
        {!search && (
          <div style={{padding:'20px 24px',display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14}}>
            <QuickCard title="Hot"        coins={HOT_COINS} icon="🔥"/>
            <QuickCard title="New"        coins={NEW_COINS}  icon="✨"/>
            <QuickCard title="Top Gainer" coins={TOP_GAIN}   icon="🚀"/>
            <QuickCard title="Top Volume" coins={TOP_VOL}    icon="📊"/>
          </div>
        )}

        {/* SUB TABS */}
        <div style={{display:'flex',alignItems:'center',padding:'0 24px',borderBottom:'1px solid #1e2329',flexWrap:'wrap',gap:0}}>
          <div className="mk-sub-tabs" style={{flex:'none'}}>
            {['Favorites','Cryptos','Spot','Futures','Alpha','New','Zones'].map(t => (
              <button key={t} className={`mk-sub-tab${subTab===t?' on':''}`} onClick={()=>setSubTab(t)}>
                {t}{t==='Alpha'&&<span className="mk-tag-new">New</span>}
              </button>
            ))}
          </div>
          <div style={{display:'flex',gap:6,overflowX:'auto',scrollbarWidth:'none',padding:'10px 0 10px 16px',flex:1}}>
            {CATS.map(c => (
              <button key={c} className={`cat-btn${catTab===c?' on':''}`} onClick={()=>setCatTab(c)}>
                {c}{c==='Solana'&&<span className="mk-tag-new">New</span>}
              </button>
            ))}
          </div>
          <div style={{display:'flex',gap:8,color:'#848e9c',padding:'0 0 0 12px',flexShrink:0}}>
            <Search size={16} style={{cursor:'pointer'}} onClick={()=>document.querySelector('.mk-search input')?.focus()}/>
            {/* Second bell for inline area */}
            <div style={{position:'relative'}}>
              <Bell size={16} style={{cursor:'pointer',color:showNotif?'#f0b90b':'#848e9c'}} onClick={()=>setShowNotif(v=>!v)}/>
              {unreadCount > 0 && <span style={{position:'absolute',top:-4,right:-4,width:8,height:8,background:'#f6465d',borderRadius:'50%'}}/>}
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div style={{padding:'0 24px 60px'}}>
          <div style={{padding:'16px 0 10px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <h3 style={{fontSize:16,fontWeight:700,color:'#eaecef',marginBottom:4}}>Top Tokens by Market Capitalization</h3>
              <p style={{fontSize:12,color:'#848e9c'}}>Real-time prices via Binance WebSocket · {filtered.length} coins</p>
            </div>
            <button onClick={()=>fetchNotifs()} style={{display:'flex',alignItems:'center',gap:6,background:'#1e2329',border:'1px solid #2b3139',borderRadius:8,padding:'7px 12px',color:'#848e9c',cursor:'pointer',fontSize:12,fontFamily:'inherit'}}>
              <RefreshCw size={13}/> Refresh
            </button>
          </div>

          <div style={{background:'#161a1e',borderRadius:12,overflow:'hidden',border:'1px solid #1e2329'}}>
            <table className="mk-table">
              <thead>
                <tr style={{background:'#0b0e11'}}>
                  <th style={{width:40}}></th>
                  <th onClick={()=>toggleSort('symbol')}>Name <SortIcon k="symbol"/></th>
                  <th onClick={()=>toggleSort('price')} style={{textAlign:'right'}}>Price <SortIcon k="price"/></th>
                  <th onClick={()=>toggleSort('change')} style={{textAlign:'right'}}>24h Change <SortIcon k="change"/></th>
                  <th style={{textAlign:'right'}} className="hide-mobile">24h High</th>
                  <th style={{textAlign:'right'}} className="hide-mobile">24h Low</th>
                  <th onClick={()=>toggleSort('vol')} style={{textAlign:'right'}} className="hide-mobile">24h Volume <SortIcon k="vol"/></th>
                  <th style={{textAlign:'right',width:80}} className="hide-mobile">Trend</th>
                  <th style={{textAlign:'right'}}>Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={9} style={{textAlign:'center',padding:60,color:'#5e6673'}}>
                    <div className="pulse" style={{display:'flex',flexDirection:'column',alignItems:'center',gap:12}}>
                      <div style={{width:32,height:32,border:'3px solid #f0b90b',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>
                      <span style={{fontSize:12}}>Loading market data...</span>
                    </div>
                  </td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={9} style={{textAlign:'center',padding:40,color:'#5e6673',fontSize:13}}>No results found</td></tr>
                ) : filtered.map((c, idx) => (
                  <tr key={c.symbol} style={{cursor:'pointer'}} onClick={()=>navigate(`/trade/${c.symbol.toLowerCase()}`)}>
                    <td onClick={e=>e.stopPropagation()}>
                      <button className={`star-btn${favs.includes(c.symbol)?' on':''}`} onClick={()=>toggleFav(c.symbol)} title={favs.includes(c.symbol)?'Remove from favorites':'Add to favorites'}>
                        <Star size={14} style={favs.includes(c.symbol)?{fill:'#f0b90b'}:{}}/>
                      </button>
                    </td>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <div style={{color:'#5e6673',fontSize:11,minWidth:20,textAlign:'right'}}>{idx+1}</div>
                        <div className="coin-logo" style={{background:COIN_COLORS[c.symbol]||'#2b3139',width:32,height:32,color:'#fff'}}>{c.symbol[0]}</div>
                        <div>
                          <div style={{fontWeight:700,fontSize:13,color:'#eaecef'}}>{c.symbol}</div>
                          <div style={{fontSize:11,color:'#848e9c'}}>{c.symbol}/USDT</div>
                        </div>
                      </div>
                    </td>
                    <td style={{textAlign:'right',fontWeight:700,color:'#eaecef',fontVariantNumeric:'tabular-nums'}}>${fmtPrice(c.price)}</td>
                    <td style={{textAlign:'right'}}>
                      <span className={`badge${c.up?' badge-up':' badge-dn'}`}>{c.up?'▲':'▼'} {Math.abs(c.change).toFixed(2)}%</span>
                    </td>
                    <td style={{textAlign:'right',color:'#0ecb81',fontSize:12}} className="hide-mobile">${fmtPrice(c.high)}</td>
                    <td style={{textAlign:'right',color:'#f6465d',fontSize:12}} className="hide-mobile">${fmtPrice(c.low)}</td>
                    <td style={{textAlign:'right',color:'#848e9c',fontVariantNumeric:'tabular-nums',fontSize:12}} className="hide-mobile">{fmtVol(c.vol)}</td>
                    <td className="hide-mobile"><div style={{display:'flex',justifyContent:'flex-end'}}><MiniChart up={c.up}/></div></td>
                    <td style={{textAlign:'right'}} onClick={e=>e.stopPropagation()}>
                      <div style={{display:'flex',gap:6,justifyContent:'flex-end'}}>
                        <button title="Set price alert" onClick={()=>{setAlertCoin(c.symbol);setAlertPrice(c.price);}}
                          style={{background:'none',border:'1px solid #2b3139',borderRadius:6,padding:'5px 7px',cursor:'pointer',color:'#848e9c',display:'flex',alignItems:'center'}}>
                          <Bell size={12}/>
                        </button>
                        <button className="trade-btn" onClick={()=>navigate(`/trade/${c.symbol.toLowerCase()}`)}>Trade</button>
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
