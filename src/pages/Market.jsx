import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import {
  Search, Bell, Star, ChevronRight, X, CheckCircle,
  AlertCircle, Loader2, RefreshCw, TrendingUp, TrendingDown,
  BarChart2, Activity, Lock, Cpu
} from 'lucide-react';

const API_BASE = 'https://vinance-backend-1.onrender.com';

/* ════════ CSS ════════ */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  .mk { font-family:'Inter',sans-serif; background:#0b0e11; color:#eaecef; min-height:100vh; }
  .mk * { box-sizing:border-box; margin:0; padding:0; }
  .mk ::-webkit-scrollbar { width:3px; height:3px; }
  .mk ::-webkit-scrollbar-thumb { background:#2b3139; border-radius:4px; }

  /* ── HEADER ── */
  .mk-header {
    position:sticky; top:0; background:#0b0e11; z-index:60;
    border-bottom:1px solid #1e2329;
  }

  /* top row: tabs + actions */
  .mk-toprow {
    display:flex; align-items:center;
    padding:0 12px; gap:8px;
    min-height:48px;
  }

  /* scrollable tab strip */
  .mk-tabstrip {
    display:flex; flex:1; overflow-x:auto; scrollbar-width:none;
    -webkit-overflow-scrolling:touch;
  }
  .mk-tabstrip::-webkit-scrollbar { display:none; }

  .mk-ttab {
    flex-shrink:0; padding:14px 14px 12px;
    font-size:13px; font-weight:600;
    background:transparent; border:none; color:#848e9c;
    cursor:pointer; border-bottom:2px solid transparent;
    white-space:nowrap; transition:all .15s; font-family:inherit;
    margin-bottom:-1px;
  }
  .mk-ttab.on { color:#eaecef; border-bottom-color:#f0b90b; }
  .mk-ttab:hover { color:#eaecef; }

  /* right actions */
  .mk-actions {
    display:flex; align-items:center; gap:8px; flex-shrink:0; padding:6px 0;
  }

  .mk-searchbox {
    display:flex; align-items:center; gap:6px;
    background:#161a1e; border:1px solid #2b3139; border-radius:8px;
    padding:6px 10px; transition:border .15s; height:34px;
  }
  .mk-searchbox:focus-within { border-color:#f0b90b; }
  .mk-searchbox input {
    background:transparent; border:none; outline:none;
    color:#eaecef; font-size:12px; font-family:inherit; width:90px;
  }
  .mk-searchbox input::placeholder { color:#5e6673; }

  .mk-bellbtn {
    background:none; border:none; cursor:pointer; color:#848e9c;
    padding:6px; border-radius:6px; transition:all .15s;
    position:relative; display:flex; align-items:center;
  }
  .mk-bellbtn.on { background:#2b3139; color:#f0b90b; }

  /* sub tabs */
  .mk-subrow {
    display:flex; align-items:stretch;
    border-top:1px solid #1e2329; overflow-x:auto;
    scrollbar-width:none; -webkit-overflow-scrolling:touch;
    padding:0 12px;
  }
  .mk-subrow::-webkit-scrollbar { display:none; }

  .mk-stab {
    flex-shrink:0; padding:10px 12px;
    font-size:12px; font-weight:600;
    background:transparent; border:none; color:#848e9c;
    cursor:pointer; border-bottom:2px solid transparent;
    white-space:nowrap; transition:all .15s; font-family:inherit;
  }
  .mk-stab.on { color:#eaecef; border-bottom-color:#f0b90b; }
  .mk-stab:hover { color:#eaecef; }

  /* category chips */
  .mk-catrow {
    display:flex; gap:6px; padding:8px 12px; overflow-x:auto;
    scrollbar-width:none; -webkit-overflow-scrolling:touch;
    border-top:1px solid #1e232960;
  }
  .mk-catrow::-webkit-scrollbar { display:none; }

  .mk-cat {
    flex-shrink:0; padding:4px 12px;
    border:1px solid #2b3139; border-radius:20px;
    background:transparent; color:#848e9c;
    font-size:11px; cursor:pointer; white-space:nowrap;
    transition:all .15s; font-family:inherit;
  }
  .mk-cat.on { background:#2b3139; color:#eaecef; border-color:#3a4049; }
  .mk-cat:hover { border-color:#5e6673; color:#eaecef; }

  /* "New" badge */
  .tag-new {
    background:rgba(240,185,11,.2); color:#f0b90b;
    font-size:9px; font-weight:700; padding:1px 5px;
    border-radius:3px; margin-left:3px; vertical-align:middle;
  }

  /* ── QUICK CARDS ── */
  .mk-cards {
    display:grid;
    grid-template-columns:repeat(2, 1fr);
    gap:10px;
    padding:12px;
  }
  @media(min-width:640px) {
    .mk-cards { grid-template-columns:repeat(4,1fr); }
    .mk-searchbox input { width:130px; }
    .mk-ttab { font-size:14px; padding:14px 18px 12px; }
  }
  @media(min-width:1024px) {
    .mk-cards { padding:18px 20px; gap:14px; }
    .mk-toprow { padding:0 20px; }
    .mk-subrow { padding:0 20px; }
    .mk-catrow { padding:8px 20px; }
  }

  .mk-qcard {
    background:#161a1e; border:1px solid #1e2329;
    border-radius:12px; padding:14px 12px;
    transition:border .15s;
  }
  .mk-qcard:hover { border-color:#2b3139; }

  .mk-qcard-head {
    display:flex; justify-content:space-between;
    align-items:center; margin-bottom:10px;
  }

  .mk-qcard-row {
    display:flex; justify-content:space-between;
    align-items:center; padding:6px 0;
    cursor:pointer; border-bottom:1px solid #1e232430;
    transition:background .1s;
  }
  .mk-qcard-row:last-child { border-bottom:none; }
  .mk-qcard-row:hover { background:rgba(255,255,255,.02); border-radius:6px; }

  .coin-dot {
    width:28px; height:28px; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    font-size:10px; font-weight:800; color:#fff; flex-shrink:0;
  }

  /* ── TABLE ── */
  .mk-tableview { padding:0 12px 80px; overflow-x:auto; }
  @media(min-width:1024px) { .mk-tableview { padding:0 20px 60px; } }

  .mk-table-wrap {
    background:#161a1e; border:1px solid #1e2329;
    border-radius:12px; overflow:hidden; min-width:360px;
  }

  table.mk-tbl { width:100%; border-collapse:collapse; }
  table.mk-tbl th {
    padding:9px 12px; color:#848e9c; font-size:10px; font-weight:700;
    text-align:left; border-bottom:1px solid #1e2329;
    cursor:pointer; white-space:nowrap; text-transform:uppercase;
    letter-spacing:.04em; background:#0b0e11; user-select:none;
  }
  table.mk-tbl th:hover { color:#eaecef; }
  table.mk-tbl td {
    padding:10px 12px; border-bottom:1px solid #1e232940;
    font-size:12px; white-space:nowrap; vertical-align:middle;
  }
  table.mk-tbl tr:last-child td { border-bottom:none; }
  table.mk-tbl tr:hover td { background:rgba(255,255,255,.025); }

  .badge-up {
    background:rgba(14,203,129,.12); color:#0ecb81;
    padding:3px 8px; border-radius:10px; font-size:11px; font-weight:700;
    display:inline-flex; align-items:center; gap:3px;
  }
  .badge-dn {
    background:rgba(246,70,93,.12); color:#f6465d;
    padding:3px 8px; border-radius:10px; font-size:11px; font-weight:700;
    display:inline-flex; align-items:center; gap:3px;
  }

  .star-btn {
    background:none; border:none; cursor:pointer; color:#5e6673;
    padding:3px; transition:color .15s; display:flex; align-items:center;
  }
  .star-btn:hover,.star-btn.on { color:#f0b90b; }

  .trade-btn {
    padding:4px 12px; background:rgba(240,185,11,.1);
    color:#f0b90b; border:1px solid rgba(240,185,11,.3);
    border-radius:6px; font-size:11px; font-weight:700;
    cursor:pointer; transition:all .15s; font-family:inherit;
    white-space:nowrap;
  }
  .trade-btn:hover { background:#f0b90b; color:#0b0e11; }

  .alert-bell-btn {
    background:none; border:1px solid #2b3139; border-radius:5px;
    padding:4px 6px; cursor:pointer; color:#848e9c;
    display:flex; align-items:center; transition:all .15s;
  }
  .alert-bell-btn:hover { border-color:#f0b90b; color:#f0b90b; }

  .mini-chart { display:flex; align-items:flex-end; gap:1.5px; height:24px; }
  .mini-bar { width:3px; border-radius:1px; }

  /* hide columns by breakpoint */
  .col-md { display:none; }
  .col-lg { display:none; }
  @media(min-width:600px) { .col-md { display:table-cell; } }
  @media(min-width:900px) { .col-lg { display:table-cell; } }

  /* ── NOTIFICATION DROPDOWN ── */
  .notif-drop {
    position:absolute; top:calc(100% + 8px); right:0;
    width:min(360px, calc(100vw - 16px));
    background:#1e2329; border:1px solid #2b3139;
    border-radius:14px; box-shadow:0 12px 48px rgba(0,0,0,.85);
    z-index:300; overflow:hidden;
  }
  .notif-item {
    display:flex; gap:10px; padding:11px 14px;
    border-bottom:1px solid #1e232960;
    cursor:pointer; transition:background .15s;
  }
  .notif-item:hover { background:rgba(255,255,255,.03); }
  .notif-item.unread { background:#161a1e; }
  .notif-badge {
    position:absolute; top:-4px; right:-4px;
    min-width:16px; height:16px; background:#f6465d;
    border-radius:8px; font-size:9px; font-weight:700; color:#fff;
    display:flex; align-items:center; justify-content:center;
    border:2px solid #0b0e11; padding:0 3px;
  }

  /* ── ALERT MODAL ── */
  .alert-ov {
    position:fixed; inset:0; background:rgba(0,0,0,.88);
    z-index:999; display:flex; align-items:center;
    justify-content:center; padding:16px; backdrop-filter:blur(6px);
  }
  .alert-box {
    background:#161a1e; border:1px solid #2b3139;
    border-radius:18px; width:min(420px, calc(100vw - 32px));
    padding:22px; max-height:90vh; overflow-y:auto;
  }

  /* ── INFO / TRADING DATA ── */
  .info-grid {
    display:grid;
    grid-template-columns:1fr;
    gap:14px; padding:16px 12px 80px;
  }
  @media(min-width:640px) {
    .info-grid { grid-template-columns:repeat(2,1fr); padding:20px; }
  }
  @media(min-width:1024px) {
    .info-grid { grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); }
  }

  .info-card {
    background:#161a1e; border:1px solid #1e2329;
    border-radius:14px; padding:18px;
  }
  .info-row {
    display:flex; justify-content:space-between;
    align-items:center; padding:8px 0;
    border-bottom:1px solid #1e232940;
    cursor:pointer; transition:background .1s;
  }
  .info-row:last-child { border-bottom:none; }
  .info-row:hover { background:rgba(255,255,255,.02); border-radius:6px; }

  /* ── AI SELECT ── */
  .ai-row {
    display:grid;
    grid-template-columns:1fr 80px 70px;
    gap:8px; padding:12px 14px;
    border-bottom:1px solid #1e232940;
    align-items:center; cursor:pointer; transition:background .15s;
  }
  .ai-row:hover { background:rgba(255,255,255,.02); }
  @media(min-width:600px) {
    .ai-row { grid-template-columns:1fr 90px 80px 80px 90px; }
    .ai-col-md { display:flex!important; }
  }
  .ai-col-md { display:none; }

  /* ── TOKEN UNLOCK ── */
  .unlock-row {
    display:flex; align-items:center; gap:12px;
    padding:14px 16px; border-bottom:1px solid #1e2329;
    flex-wrap:wrap;
  }
  .unlock-row:last-child { border-bottom:none; }

  @keyframes spin { to { transform:rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }
  .spin { animation:spin .8s linear infinite; }
  .fade { animation:fadeUp .2s; }
`;

/* ════════ CONSTANTS ════════ */
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

const CAT_FILTER = {
  All:null,
  'BNB Chain':['BNB'],
  'Solana':['SOL'],
  'RWA':['LINK','AAVE'],
  'MEME':['DOGE','SHIB','PEPE'],
  'Payments':['XRP','TRX','LTC'],
  'AI':['INJ','NEAR','ARB','APT'],
  'Layer 1/2':['ETH','SOL','ADA','AVAX','MATIC','ARB','OP','NEAR'],
  'DeFi':['UNI','AAVE','CRV','LINK'],
};

const HOT  = ['BTC','ETH','BNB','SOL'];
const NEW  = ['NEAR','INJ','ARB','APT'];
const GAIN = ['PEPE','INJ','NEAR','ARB'];
const VOL  = ['BTC','ETH','BNB','SOL'];

/* helpers */
const fmtP = p => {
  if (!p && p!==0) return '—';
  if (p>=1000) return p.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
  if (p>=1)    return p.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:4});
  return p.toFixed(p<0.0001?8:6);
};
const fmtV = v => {
  if (!v) return '—';
  if (v>=1e9) return `$${(v/1e9).toFixed(2)}B`;
  if (v>=1e6) return `$${(v/1e6).toFixed(2)}M`;
  return `$${(v/1e3).toFixed(1)}K`;
};
const fmtMC = v => {
  if (!v) return '—';
  if (v>=1e12) return `$${(v/1e12).toFixed(2)}T`;
  if (v>=1e9)  return `$${(v/1e9).toFixed(2)}B`;
  if (v>=1e6)  return `$${(v/1e6).toFixed(2)}M`;
  return `$${v.toFixed(0)}`;
};

const MiniChart = ({ up }) => (
  <div className="mini-chart">
    {[40,55,35,65,50,70,45,60,55,75].map((h,i)=>(
      <div key={i} className="mini-bar"
        style={{height:`${h}%`,background:up?'#0ecb81':'#f6465d',opacity:0.5+i*0.05}}/>
    ))}
  </div>
);

/* ════════ NOTIFICATION DROPDOWN ════════ */
const NotifDrop = ({ notifs, loading, onClose, onReadAll, onReadOne, onDelete }) => {
  const [filter, setFilter] = useState('all');
  const unread = notifs.filter(n=>!n.read).length;
  const list   = filter==='unread' ? notifs.filter(n=>!n.read) : notifs;
  const icon   = t => ({deposit:'💰',withdraw:'💸',spot_buy:'📈',spot_sell:'📉','futures-buy':'⚡','futures-sell':'⚡',investment:'🏦'}[t]||'🔔');
  const col    = t => ({deposit:'#0ecb81',withdraw:'#f6465d',investment:'#627eea'}[t]||'#f0b90b');

  return (
    <>
      <div style={{position:'fixed',inset:0,zIndex:299}} onClick={onClose}/>
      <div className="notif-drop fade">
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 14px',borderBottom:'1px solid #2b3139'}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{color:'#eaecef',fontWeight:700,fontSize:13}}>Notifications</span>
            {unread>0&&<span style={{background:'#f6465d',color:'#fff',fontSize:9,fontWeight:700,padding:'1px 7px',borderRadius:10}}>{unread}</span>}
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            {unread>0&&<button onClick={onReadAll} style={{background:'none',border:'none',color:'#f0b90b',fontSize:11,cursor:'pointer',fontFamily:'inherit'}}>Mark all read</button>}
            <button onClick={onClose} style={{background:'none',border:'none',color:'#5e6673',cursor:'pointer',display:'flex'}}><X size={14}/></button>
          </div>
        </div>
        <div style={{display:'flex',padding:'0 10px',borderBottom:'1px solid #2b3139'}}>
          {['all','unread'].map(f=>(
            <button key={f} onClick={()=>setFilter(f)}
              style={{padding:'6px 10px',fontSize:11,background:'transparent',border:'none',cursor:'pointer',color:filter===f?'#f0b90b':'#848e9c',borderBottom:filter===f?'2px solid #f0b90b':'2px solid transparent',textTransform:'capitalize',fontFamily:'inherit'}}>
              {f}{f==='unread'&&unread>0?` (${unread})`:''}
            </button>
          ))}
        </div>
        <div style={{maxHeight:320,overflowY:'auto'}}>
          {loading?(
            <div style={{textAlign:'center',padding:28}}><Loader2 size={20} className="spin" style={{color:'#f0b90b',display:'inline-block'}}/></div>
          ):list.length===0?(
            <div style={{padding:28,textAlign:'center',color:'#5e6673',fontSize:12}}>
              <Bell size={24} style={{opacity:.15,margin:'0 auto 8px',display:'block'}}/>
              No {filter==='unread'?'unread ':''}notifications
            </div>
          ):list.map(n=>(
            <div key={n._id} className={`notif-item${!n.read?' unread':''}`} onClick={()=>onReadOne(n._id)}>
              <div style={{width:34,height:34,borderRadius:'50%',background:col(n.type)+'18',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:15}}>{icon(n.type)}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',justifyContent:'space-between',gap:4,marginBottom:2}}>
                  <span style={{color:n.read?'#848e9c':'#eaecef',fontWeight:n.read?400:700,fontSize:12,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{n.title}</span>
                  <span style={{color:'#5e6673',fontSize:10,flexShrink:0}}>{n.timeStr}</span>
                </div>
                <p style={{color:'#848e9c',fontSize:11,lineHeight:1.5,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{n.message}</p>
              </div>
              <button onClick={e=>{e.stopPropagation();onDelete(n._id);}} style={{background:'none',border:'none',color:'#5e6673',cursor:'pointer',padding:2,flexShrink:0}}><X size={10}/></button>
            </div>
          ))}
        </div>
        <div style={{padding:'8px 14px',borderTop:'1px solid #2b3139',textAlign:'center'}}>
          <button onClick={onClose} style={{background:'none',border:'none',color:'#f0b90b',fontSize:11,cursor:'pointer',fontFamily:'inherit'}}>View all transactions →</button>
        </div>
      </div>
    </>
  );
};

/* ════════ ALERT MODAL ════════ */
const AlertModal = ({ coin, price, onClose }) => {
  const [val,  setVal]  = useState('');
  const [type, setType] = useState('above');
  const [done, setDone] = useState(false);
  const save = () => {
    const n = parseFloat(val);
    if (!n||n<=0) return;
    const a = JSON.parse(localStorage.getItem('price_alerts')||'[]');
    a.push({coin,type,price:n,set:Date.now()});
    localStorage.setItem('price_alerts',JSON.stringify(a));
    setDone(true);
    setTimeout(onClose,1400);
  };
  return (
    <div className="alert-ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="alert-box fade">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
          <div>
            <h3 style={{color:'#eaecef',fontWeight:800,fontSize:16}}>🔔 Price Alert</h3>
            <p style={{color:'#848e9c',fontSize:12,marginTop:3}}>
              {coin}/USDT · <span style={{color:'#f0b90b',fontWeight:700}}>${fmtP(price)}</span>
            </p>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',color:'#848e9c',cursor:'pointer',display:'flex'}}><X size={18}/></button>
        </div>
        <div style={{display:'flex',gap:8,marginBottom:14}}>
          {['above','below'].map(t=>(
            <button key={t} onClick={()=>setType(t)}
              style={{flex:1,padding:'8px 0',border:`1px solid ${type===t?'#f0b90b':'#2b3139'}`,borderRadius:8,background:type===t?'rgba(240,185,11,.1)':'transparent',color:type===t?'#f0b90b':'#848e9c',fontWeight:type===t?700:400,cursor:'pointer',fontSize:12,fontFamily:'inherit',textTransform:'capitalize',transition:'all .15s'}}>
              {t}
            </button>
          ))}
        </div>
        <div style={{position:'relative',marginBottom:16}}>
          <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'#5e6673',fontSize:13}}>$</span>
          <input type="number" placeholder={fmtP(price)} value={val} onChange={e=>setVal(e.target.value)}
            style={{width:'100%',background:'#0b0e11',border:'1px solid #2b3139',borderRadius:8,padding:'11px 48px 11px 28px',color:'#eaecef',fontSize:15,outline:'none',fontFamily:'monospace',fontWeight:700,transition:'border .15s'}}
            onFocus={e=>e.target.style.borderColor='#f0b90b'}
            onBlur={e=>e.target.style.borderColor='#2b3139'}/>
          <span style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',color:'#848e9c',fontSize:11,fontWeight:700}}>USDT</span>
        </div>
        <button onClick={save}
          style={{width:'100%',padding:'12px 0',border:'none',borderRadius:10,background:done?'#0ecb81':'#f0b90b',color:'#0b0e11',fontWeight:800,fontSize:14,cursor:'pointer',fontFamily:'inherit',transition:'background .25s',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
          {done?<><CheckCircle size={15}/> Alert Set!</>:'Set Price Alert'}
        </button>
      </div>
    </div>
  );
};

/* ════════ QUICK CARD ════════ */
const QCard = ({ title, icon, coins, prices, navigate }) => (
  <div className="mk-qcard">
    <div className="mk-qcard-head">
      <div style={{display:'flex',alignItems:'center',gap:6}}>
        <span style={{fontSize:15}}>{icon}</span>
        <span style={{fontWeight:700,fontSize:13,color:'#eaecef'}}>{title}</span>
      </div>
      <ChevronRight size={13} style={{color:'#f0b90b'}}/>
    </div>
    {coins.map(sym=>{
      const c=prices[`${sym}USDT`];
      return (
        <div key={sym} className="mk-qcard-row" onClick={()=>navigate(`/trade/${sym.toLowerCase()}`)}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <div className="coin-dot" style={{background:COIN_COLORS[sym]||'#2b3139',width:28,height:28,fontSize:10}}>
              {sym[0]}
            </div>
            <div>
              <div style={{fontWeight:700,fontSize:12,color:'#eaecef'}}>{sym}</div>
              <div style={{fontSize:10,color:'#5e6673'}}>/USDT</div>
            </div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:12,color:'#eaecef',fontWeight:700}}>${fmtP(c?.price)}</div>
            <div style={{fontSize:11,fontWeight:700,color:c?.up?'#0ecb81':'#f6465d'}}>
              {c?.change!==undefined?`${c.up?'+':''}${c.change.toFixed(2)}%`:'—'}
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

/* ════════ MAIN ════════ */
export default function Market() {
  const navigate = useNavigate();
  const { token } = useContext(UserContext);

  const [topTab,    setTopTab]    = useState('Overview');
  const [subTab,    setSubTab]    = useState('Cryptos');
  const [catTab,    setCatTab]    = useState('All');
  const [search,    setSearch]    = useState('');
  const [sort,      setSort]      = useState({key:'vol',dir:-1});
  const [prices,    setPrices]    = useState({});
  const [wsStatus,  setWsStatus]  = useState('connecting');
  const [favs,      setFavs]      = useState(()=>{try{return JSON.parse(localStorage.getItem('mk_favs')||'[]');}catch{return[];}});
  const [showNotif, setShowNotif] = useState(false);
  const [notifs,    setNotifs]    = useState([]);
  const [notifLoad, setNotifLoad] = useState(false);
  const [readIds,   setReadIds]   = useState([]);
  const [alertCoin, setAlertCoin] = useState(null);
  const [alertPx,   setAlertPx]   = useState(null);

  const wsRef    = useRef(null);
  const retryRef = useRef(null);

  /* ── WebSocket ── */
  const connectWS = () => {
    try { wsRef.current?.close(); } catch {}
    setWsStatus('connecting');
    const streams = SYMBOLS.map(s=>`${s.toLowerCase()}@ticker`).join('/');
    const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);
    wsRef.current = ws;
    ws.onopen  = () => setWsStatus('connected');
    ws.onerror = () => setWsStatus('error');
    ws.onclose = () => { setWsStatus('reconnecting'); retryRef.current=setTimeout(connectWS,4000); };
    ws.onmessage = e => {
      try {
        const {data:d} = JSON.parse(e.data);
        if (!d?.s) return;
        const sym = d.s.replace('USDT','');
        setPrices(p => ({...p, [d.s]:{
          symbol:sym, price:parseFloat(d.c), change:parseFloat(d.P),
          high:parseFloat(d.h), low:parseFloat(d.l),
          vol:parseFloat(d.v)*parseFloat(d.c),
          mc:parseFloat(d.c)*parseFloat(d.v)*50,
          up:parseFloat(d.P)>=0,
        }}));
      } catch {}
    };
  };

  useEffect(() => {
    connectWS();
    return () => { wsRef.current?.close(); clearTimeout(retryRef.current); };
  }, []);

  /* REST fallback */
  useEffect(() => {
    const t = setTimeout(async () => {
      if (Object.keys(prices).length>0) return;
      try {
        const res = await axios.get('https://api.binance.com/api/v3/ticker/24hr');
        setPrices(prev => {
          const next={...prev};
          res.data.filter(t=>SYMBOLS.includes(t.symbol)).forEach(t => {
            if (!next[t.symbol]) {
              const sym=t.symbol.replace('USDT','');
              next[t.symbol]={symbol:sym,price:parseFloat(t.lastPrice),change:parseFloat(t.priceChangePercent),high:parseFloat(t.highPrice),low:parseFloat(t.lowPrice),vol:parseFloat(t.volume)*parseFloat(t.lastPrice),mc:parseFloat(t.lastPrice)*parseFloat(t.volume)*50,up:parseFloat(t.priceChangePercent)>=0};
            }
          });
          return next;
        });
      } catch {}
    }, 3500);
    return () => clearTimeout(t);
  }, [prices]);

  /* notifications */
  const fetchNotifs = async () => {
    if (!token) {
      setNotifs([
        {_id:'s1',type:'system',title:'🔔 Market Alert',message:'BTC approaching $85K resistance',timeStr:'2m',read:false},
        {_id:'s2',type:'system',title:'📊 ETH Surge',message:'ETH up +5.4% in last 4h',timeStr:'1h',read:false},
        {_id:'s3',type:'system',title:'🚀 SOL Breakout',message:'SOL breaks $150 resistance',timeStr:'3h',read:true},
      ]);
      return;
    }
    setNotifLoad(true);
    try {
      const res = await axios.get(`${API_BASE}/api/transactions`,{headers:{Authorization:`Bearer ${token}`}});
      const txns = Array.isArray(res.data)?res.data:[];
      setNotifs(txns.slice(0,30).map(t=>({
        _id:t._id, type:t.type,
        title:t.type==='deposit'?`💰 Deposit ${t.status==='approved'?'Approved':'Pending'}`:t.type==='withdraw'?`💸 Withdrawal ${t.status==='approved'?'Approved':'Pending'}`:t.type?.includes('buy')?'📈 Buy Filled':t.type?.includes('sell')?'📉 Sell Filled':t.type==='investment'?'🏦 Investment':'🔔 Transaction',
        message:`$${parseFloat(t.amount||0).toFixed(2)} USDT — ${t.status}`,
        amount:t.amount, timeStr:new Date(t.createdAt||t.date).toLocaleDateString(),
        read:readIds.includes(t._id),
      })));
    } catch {
      setNotifs([{_id:'e1',type:'system',title:'🔔 Market Update',message:'Check your positions',timeStr:'now',read:false}]);
    } finally { setNotifLoad(false); }
  };

  useEffect(()=>{ if(showNotif) fetchNotifs(); },[showNotif,token,readIds]);

  const markAll = () => { setReadIds(p=>[...p,...notifs.map(n=>n._id)]); setNotifs(p=>p.map(n=>({...n,read:true}))); };
  const markOne = id => { setReadIds(p=>[...p,id]); setNotifs(p=>p.map(n=>n._id===id?{...n,read:true}:n)); };
  const delNotif= id => setNotifs(p=>p.filter(n=>n._id!==id));
  const unread  = notifs.filter(n=>!n.read).length;

  const toggleFav = sym => {
    setFavs(f=>{
      const next=f.includes(sym)?f.filter(s=>s!==sym):[...f,sym];
      try{localStorage.setItem('mk_favs',JSON.stringify(next));}catch{}
      return next;
    });
  };

  const toggleSort = key => setSort(s=>s.key===key?{key,dir:-s.dir}:{key,dir:-1});
  const SortIcon = ({k}) => sort.key!==k
    ?<span style={{color:'#5e6673',fontSize:9,marginLeft:2}}>↕</span>
    :<span style={{color:'#f0b90b',fontSize:9,marginLeft:2}}>{sort.dir===1?'↑':'↓'}</span>;

  const allCoins = Object.values(prices);

  const filtered = allCoins.filter(c => {
    if (search) return c.symbol.toLowerCase().includes(search.toLowerCase());
    if (subTab==='Favorites') return favs.includes(c.symbol);
    if (subTab==='Futures')   return ['BTC','ETH','BNB','SOL','XRP','ADA','AVAX','DOT'].includes(c.symbol);
    if (subTab==='Alpha')     return ['PEPE','SHIB','NEAR','INJ','ARB','OP','APT'].includes(c.symbol);
    if (subTab==='New')       return NEW.includes(c.symbol);
    if (subTab==='Cryptos' && catTab!=='All') {
      const a=CAT_FILTER[catTab]; if(a) return a.includes(c.symbol);
    }
    return true;
  }).sort((a,b)=>{
    const v=sort.dir;
    if(sort.key==='price')  return (a.price-b.price)*v;
    if(sort.key==='change') return (a.change-b.change)*v;
    if(sort.key==='vol')    return (a.vol-b.vol)*v;
    return a.symbol.localeCompare(b.symbol)*v;
  });

  const aiCoins = [...allCoins].map(c=>({
    ...c,
    score:Math.round((c.up?c.change*2:0)+(c.vol>1e9?20:0)+Math.random()*10),
    signal:c.change>5?'Strong Buy':c.change>2?'Buy':c.change<-5?'Sell':'Hold',
  })).sort((a,b)=>b.score-a.score).slice(0,10);

  const tokenUnlocks=[
    {sym:'ARB',name:'Arbitrum',  date:'May 26, 2026',amount:'92.6M ARB',usd:'~$98M', pct:'3.2%',risk:'High'},
    {sym:'OP', name:'Optimism',  date:'Jun 1, 2026', amount:'24.2M OP', usd:'~$52M', pct:'1.8%',risk:'Medium'},
    {sym:'APT',name:'Aptos',     date:'Jun 12, 2026',amount:'11.3M APT',usd:'~$70M', pct:'2.4%',risk:'Medium'},
    {sym:'INJ',name:'Injective', date:'Jun 20, 2026',amount:'2.1M INJ', usd:'~$46M', pct:'0.8%',risk:'Low'},
    {sym:'NEAR',name:'NEAR',     date:'Jul 3, 2026', amount:'18.4M NEAR',usd:'~$110M',pct:'1.5%',risk:'Medium'},
  ];
  const RISK_C={High:'#f6465d',Medium:'#f0b90b',Low:'#0ecb81'};

  return (
    <>
      <style>{css}</style>
      {alertCoin&&<AlertModal coin={alertCoin} price={alertPx} onClose={()=>{setAlertCoin(null);setAlertPx(null);}}/>}

      <div className="mk">

        {/* ══ STICKY HEADER ══ */}
        <div className="mk-header">
          {/* Top row */}
          <div className="mk-toprow">
            <div className="mk-tabstrip">
              {['Overview','Trading Data','AI Select','Token Unlock'].map(t=>(
                <button key={t} className={`mk-ttab${topTab===t?' on':''}`} onClick={()=>setTopTab(t)}>{t}</button>
              ))}
            </div>
            <div className="mk-actions">
              {/* WS dot */}
              <div style={{width:7,height:7,borderRadius:'50%',flexShrink:0,
                background:wsStatus==='connected'?'#0ecb81':wsStatus==='reconnecting'?'#f0b90b':'#f6465d'}}/>
              {/* Search */}
              <div className="mk-searchbox">
                <Search size={13} style={{color:'#5e6673',flexShrink:0}}/>
                <input placeholder="Search coin" value={search} onChange={e=>setSearch(e.target.value)}/>
                {search&&<button onClick={()=>setSearch('')} style={{background:'none',border:'none',color:'#848e9c',cursor:'pointer',display:'flex',padding:0}}><X size={12}/></button>}
              </div>
              {/* Bell */}
              <div style={{position:'relative'}}>
                <button className={`mk-bellbtn${showNotif?' on':''}`} onClick={()=>setShowNotif(v=>!v)}>
                  <Bell size={18}/>
                  {unread>0&&<span className="notif-badge">{unread>9?'9+':unread}</span>}
                </button>
                {showNotif&&<NotifDrop notifs={notifs} loading={notifLoad} onClose={()=>setShowNotif(false)} onReadAll={markAll} onReadOne={markOne} onDelete={delNotif}/>}
              </div>
            </div>
          </div>

          {/* Sub tabs (only in Overview) */}
          {topTab==='Overview' && (
            <>
              <div className="mk-subrow">
                {['Favorites','Cryptos','Spot','Futures','Alpha','New','Zones'].map(t=>(
                  <button key={t} className={`mk-stab${subTab===t?' on':''}`} onClick={()=>{setSubTab(t);setCatTab('All');}}>
                    {t}{t==='Alpha'&&<span className="tag-new">New</span>}
                  </button>
                ))}
              </div>
              {subTab==='Cryptos'&&(
                <div className="mk-catrow">
                  {Object.keys(CAT_FILTER).map(c=>(
                    <button key={c} className={`mk-cat${catTab===c?' on':''}`} onClick={()=>setCatTab(c)}>
                      {c}{c==='Solana'&&<span className="tag-new">New</span>}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* ══ OVERVIEW ══ */}
        {topTab==='Overview'&&(
          <>
            {/* Quick cards */}
            {!search&&(
              <div className="mk-cards">
                <QCard title="Hot"        icon="🔥" coins={HOT}  prices={prices} navigate={navigate}/>
                <QCard title="New"        icon="✨" coins={NEW}  prices={prices} navigate={navigate}/>
                <QCard title="Top Gainer" icon="🚀" coins={GAIN} prices={prices} navigate={navigate}/>
                <QCard title="Top Volume" icon="📊" coins={VOL}  prices={prices} navigate={navigate}/>
              </div>
            )}

            {/* Table heading */}
            <div style={{padding:'10px 12px 6px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
              <div>
                <h3 style={{fontSize:14,fontWeight:700,color:'#eaecef',marginBottom:2}}>
                  {subTab==='Favorites'?'My Favorites':subTab==='Alpha'?'Alpha Tokens':catTab!=='All'?`${catTab} Tokens`:'Top Tokens by Market Cap'}
                </h3>
                <p style={{fontSize:11,color:'#848e9c'}}>
                  Binance WebSocket ·{' '}
                  <span style={{color:wsStatus==='connected'?'#0ecb81':'#f0b90b'}}>
                    {wsStatus==='connected'?`${filtered.length} live`:wsStatus}
                  </span>
                </p>
              </div>
              <button onClick={connectWS} style={{display:'flex',alignItems:'center',gap:5,background:'#1e2329',border:'1px solid #2b3139',borderRadius:8,padding:'5px 10px',color:'#848e9c',cursor:'pointer',fontSize:11,fontFamily:'inherit'}}>
                <RefreshCw size={11}/> Reconnect
              </button>
            </div>

            {/* Table */}
            <div className="mk-tableview">
              <div className="mk-table-wrap">
                <table className="mk-tbl">
                  <thead>
                    <tr>
                      <th style={{width:32}}></th>
                      <th onClick={()=>toggleSort('symbol')}>Name <SortIcon k="symbol"/></th>
                      <th onClick={()=>toggleSort('price')} style={{textAlign:'right'}}>Price <SortIcon k="price"/></th>
                      <th onClick={()=>toggleSort('change')} style={{textAlign:'right'}}>24h <SortIcon k="change"/></th>
                      <th className="col-md" style={{textAlign:'right'}}>High</th>
                      <th className="col-md" style={{textAlign:'right'}}>Low</th>
                      <th className="col-lg" onClick={()=>toggleSort('vol')} style={{textAlign:'right'}}>Volume <SortIcon k="vol"/></th>
                      <th className="col-lg" style={{textAlign:'right',width:60}}>Trend</th>
                      <th style={{textAlign:'right'}}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allCoins.length===0?(
                      <tr><td colSpan={9} style={{textAlign:'center',padding:50,color:'#5e6673'}}>
                        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:12}}>
                          <div style={{width:30,height:30,border:'3px solid #f0b90b',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>
                          <span style={{fontSize:12}}>{wsStatus==='reconnecting'?'Reconnecting...':'Loading market data...'}</span>
                        </div>
                      </td></tr>
                    ):filtered.length===0?(
                      <tr><td colSpan={9} style={{textAlign:'center',padding:36,color:'#5e6673',fontSize:13}}>
                        {subTab==='Favorites'&&favs.length===0?'Star coins to add favorites':'No results found'}
                      </td></tr>
                    ):filtered.map((c,idx)=>(
                      <tr key={c.symbol} style={{cursor:'pointer'}} onClick={()=>navigate(`/trade/${c.symbol.toLowerCase()}`)}>
                        <td onClick={e=>e.stopPropagation()}>
                          <button className={`star-btn${favs.includes(c.symbol)?' on':''}`} onClick={()=>toggleFav(c.symbol)}>
                            <Star size={13} style={favs.includes(c.symbol)?{fill:'#f0b90b'}:{}}/>
                          </button>
                        </td>
                        <td>
                          <div style={{display:'flex',alignItems:'center',gap:8}}>
                            <span style={{color:'#5e6673',fontSize:10,minWidth:16,textAlign:'right'}}>{idx+1}</span>
                            <div className="coin-dot" style={{background:COIN_COLORS[c.symbol]||'#2b3139',width:28,height:28,fontSize:10}}>
                              {c.symbol[0]}
                            </div>
                            <div>
                              <div style={{fontWeight:700,fontSize:12,color:'#eaecef'}}>{c.symbol}</div>
                              <div style={{fontSize:10,color:'#848e9c'}}>/USDT</div>
                            </div>
                          </div>
                        </td>
                        <td style={{textAlign:'right',fontWeight:700,color:'#eaecef',fontVariantNumeric:'tabular-nums',fontSize:12}}>
                          ${fmtP(c.price)}
                        </td>
                        <td style={{textAlign:'right'}}>
                          <span className={c.up?'badge-up':'badge-dn'}>
                            {c.up?'▲':'▼'} {Math.abs(c.change).toFixed(2)}%
                          </span>
                        </td>
                        <td className="col-md" style={{textAlign:'right',color:'#0ecb81',fontSize:11}}>${fmtP(c.high)}</td>
                        <td className="col-md" style={{textAlign:'right',color:'#f6465d',fontSize:11}}>${fmtP(c.low)}</td>
                        <td className="col-lg" style={{textAlign:'right',color:'#848e9c',fontSize:11}}>{fmtV(c.vol)}</td>
                        <td className="col-lg"><div style={{display:'flex',justifyContent:'flex-end'}}><MiniChart up={c.up}/></div></td>
                        <td style={{textAlign:'right'}} onClick={e=>e.stopPropagation()}>
                          <div style={{display:'flex',gap:4,justifyContent:'flex-end',alignItems:'center'}}>
                            <button className="alert-bell-btn" onClick={()=>{setAlertCoin(c.symbol);setAlertPx(c.price);}} title="Set Alert">
                              <Bell size={11}/>
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
          </>
        )}

        {/* ══ TRADING DATA ══ */}
        {topTab==='Trading Data'&&(
          <div style={{padding:'16px 12px 80px'}}>
            <h2 style={{fontSize:16,fontWeight:800,color:'#eaecef',marginBottom:4}}>Trading Data</h2>
            <p style={{fontSize:12,color:'#848e9c',marginBottom:16}}>Real-time market leaders and laggards</p>
            <div className="info-grid" style={{padding:0}}>
              {[
                {label:'Biggest Gainers',coins:[...allCoins].sort((a,b)=>b.change-a.change).slice(0,5),icon:<TrendingUp size={14} style={{color:'#0ecb81'}}/>},
                {label:'Biggest Losers', coins:[...allCoins].sort((a,b)=>a.change-b.change).slice(0,5),icon:<TrendingDown size={14} style={{color:'#f6465d'}}/>},
                {label:'Highest Volume', coins:[...allCoins].sort((a,b)=>b.vol-a.vol).slice(0,5),       icon:<BarChart2 size={14} style={{color:'#627eea'}}/>},
                {label:'Market Overview',coins:null,icon:<Activity size={14} style={{color:'#f0b90b'}}/>},
              ].map(({label,coins,icon})=>(
                <div key={label} className="info-card">
                  <h3 style={{fontSize:13,fontWeight:700,color:'#eaecef',marginBottom:12,display:'flex',alignItems:'center',gap:7}}>
                    {icon}{label}
                  </h3>
                  {coins?coins.map(c=>(
                    <div key={c.symbol} className="info-row" onClick={()=>navigate(`/trade/${c.symbol.toLowerCase()}`)}>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <div className="coin-dot" style={{background:COIN_COLORS[c.symbol]||'#2b3139',width:28,height:28,fontSize:10}}>{c.symbol[0]}</div>
                        <div>
                          <div style={{fontWeight:700,fontSize:13,color:'#eaecef'}}>{c.symbol}</div>
                          <div style={{fontSize:11,color:'#5e6673'}}>{fmtV(c.vol)}</div>
                        </div>
                      </div>
                      <div style={{textAlign:'right'}}>
                        <div style={{fontWeight:700,fontSize:13,color:'#eaecef'}}>${fmtP(c.price)}</div>
                        <div style={{fontSize:12,fontWeight:700,color:c.up?'#0ecb81':'#f6465d'}}>{c.up?'+':''}{c.change.toFixed(2)}%</div>
                      </div>
                    </div>
                  )):[
                    {l:'Total Vol 24h',v:fmtV(allCoins.reduce((s,c)=>s+(c.vol||0),0))},
                    {l:'Gainers',      v:`${allCoins.filter(c=>c.up).length} / ${allCoins.length}`},
                    {l:'Avg Change',   v:`${(allCoins.reduce((s,c)=>s+c.change,0)/Math.max(allCoins.length,1)).toFixed(2)}%`},
                    {l:'Live Coins',   v:`${allCoins.length}`},
                  ].map(s=>(
                    <div key={s.l} className="info-row">
                      <span style={{fontSize:12,color:'#848e9c'}}>{s.l}</span>
                      <span style={{fontSize:13,fontWeight:700,color:'#eaecef'}}>{s.v}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ AI SELECT ══ */}
        {topTab==='AI Select'&&(
          <div style={{padding:'16px 12px 80px'}}>
            <div style={{background:'linear-gradient(135deg,#161a1e,#1e2329)',border:'1px solid #2b3139',borderRadius:14,padding:'16px',marginBottom:16,display:'flex',alignItems:'center',gap:14,flexWrap:'wrap'}}>
              <div style={{width:44,height:44,borderRadius:12,background:'rgba(240,185,11,.12)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <Cpu size={22} style={{color:'#f0b90b'}}/>
              </div>
              <div>
                <h2 style={{fontSize:15,fontWeight:800,color:'#eaecef',marginBottom:3}}>AI Market Intelligence</h2>
                <p style={{fontSize:12,color:'#848e9c'}}>Scored by momentum, volume, and price action. Live.</p>
              </div>
            </div>
            <div style={{background:'#161a1e',borderRadius:12,border:'1px solid #1e2329',overflow:'hidden'}}>
              {/* header */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 80px 70px',gap:8,padding:'9px 14px',background:'#0b0e11',fontSize:10,color:'#5e6673',fontWeight:700,textTransform:'uppercase',letterSpacing:'.04em'}}>
                <span>Token</span>
                <span style={{textAlign:'right'}}>Price</span>
                <span style={{textAlign:'right'}}>Signal</span>
              </div>
              {aiCoins.map((c,i)=>(
                <div key={c.symbol} style={{display:'grid',gridTemplateColumns:'1fr 80px 70px',gap:8,padding:'11px 14px',borderBottom:'1px solid #1e232940',alignItems:'center',cursor:'pointer',transition:'background .15s'}}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.02)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                  onClick={()=>navigate(`/trade/${c.symbol.toLowerCase()}`)}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <span style={{color:'#5e6673',fontSize:10,minWidth:16}}>#{i+1}</span>
                    <div className="coin-dot" style={{background:COIN_COLORS[c.symbol]||'#2b3139',width:28,height:28,fontSize:10}}>{c.symbol[0]}</div>
                    <div>
                      <div style={{fontWeight:700,color:'#eaecef',fontSize:12}}>{c.symbol}</div>
                      <div style={{fontSize:10,color:c.up?'#0ecb81':'#f6465d'}}>{c.up?'+':''}{c.change.toFixed(2)}%</div>
                    </div>
                  </div>
                  <span style={{textAlign:'right',fontWeight:700,color:'#eaecef',fontSize:12}}>${fmtP(c.price)}</span>
                  <div style={{textAlign:'right'}}>
                    <span style={{fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:20,
                      background:c.signal==='Strong Buy'?'rgba(14,203,129,.15)':c.signal==='Buy'?'rgba(14,203,129,.08)':c.signal==='Sell'?'rgba(246,70,93,.12)':'rgba(132,142,156,.1)',
                      color:c.signal==='Strong Buy'||c.signal==='Buy'?'#0ecb81':c.signal==='Sell'?'#f6465d':'#848e9c'}}>
                      {c.signal}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ TOKEN UNLOCK ══ */}
        {topTab==='Token Unlock'&&(
          <div style={{padding:'16px 12px 80px'}}>
            <h2 style={{fontSize:16,fontWeight:800,color:'#eaecef',marginBottom:4,display:'flex',alignItems:'center',gap:8}}>
              <Lock size={16} style={{color:'#f0b90b'}}/> Token Unlock Schedule
            </h2>
            <p style={{fontSize:12,color:'#848e9c',marginBottom:16}}>Upcoming unlocks that may impact price.</p>
            <div style={{background:'#161a1e',borderRadius:14,border:'1px solid #1e2329',overflow:'hidden',marginBottom:16}}>
              {tokenUnlocks.map((u,i)=>{
                const c=prices[`${u.sym}USDT`];
                return (
                  <div key={u.sym} className="unlock-row">
                    <div className="coin-dot" style={{background:COIN_COLORS[u.sym]||'#2b3139',width:36,height:36,fontSize:12,flexShrink:0}}>{u.sym[0]}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4,flexWrap:'wrap'}}>
                        <span style={{fontWeight:700,fontSize:13,color:'#eaecef'}}>{u.sym}</span>
                        <span style={{fontSize:11,color:'#848e9c'}}>{u.name}</span>
                        <span style={{fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:10,background:RISK_C[u.risk]+'18',color:RISK_C[u.risk]}}>{u.risk}</span>
                      </div>
                      <div style={{display:'flex',gap:12,fontSize:11,color:'#848e9c',flexWrap:'wrap'}}>
                        <span>📅 {u.date}</span>
                        <span>🔓 {u.amount}</span>
                        <span>💵 {u.usd}</span>
                      </div>
                    </div>
                    <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4,flexShrink:0}}>
                      <div style={{fontWeight:700,fontSize:13,color:'#eaecef'}}>${fmtP(c?.price)}</div>
                      <button className="trade-btn" onClick={()=>navigate(`/trade/${u.sym.toLowerCase()}`)}>Trade</button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{background:'rgba(246,70,93,.05)',border:'1px solid rgba(246,70,93,.15)',borderRadius:12,padding:'12px 14px',display:'flex',gap:8}}>
              <AlertCircle size={14} style={{color:'#f6465d',flexShrink:0,marginTop:2}}/>
              <p style={{fontSize:12,color:'#848e9c',lineHeight:1.6}}>
                <strong style={{color:'#f6465d'}}>Risk:</strong> Token unlocks can cause sell pressure. DYOR before trading around unlock events.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
