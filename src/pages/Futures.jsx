import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import axios from 'axios';
import {
  ChevronDown, MoreHorizontal, Settings, Bell,
  RefreshCw, Loader2, TrendingUp, TrendingDown,
  FileText, BarChart2, X, ExternalLink, Link as LinkIcon,
  AlertTriangle, Info, Sliders, Layout, ArrowUpRight,
  ArrowDownLeft, Wallet, Shield, Zap, Copy
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const API_BASE = "https://vinance-backend-1.onrender.com";
const api = axios.create({ baseURL: API_BASE, withCredentials: true });

/* ═══════════════════════════════════════
   STYLES
═══════════════════════════════════════ */
const FuturesStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;600;700&display=swap');
    .fut-wrap{font-family:'Roboto Mono','IBM Plex Mono',monospace;background:#0b0e11;color:#848e9c;min-height:100vh;display:flex;flex-direction:column;}
    .fut-ticker-bar{display:flex;gap:24px;padding:0 12px;background:#161a1e;border-bottom:1px solid #1e2329;overflow-x:auto;scrollbar-width:none;}
    .fut-ticker-bar::-webkit-scrollbar{display:none;}
    .fut-ticker-item{display:flex;gap:6px;align-items:center;padding:8px 0;font-size:11px;white-space:nowrap;cursor:pointer;border-bottom:2px solid transparent;transition:color .15s;}
    .fut-ticker-item:hover{color:#eaecef;}
    .fut-ticker-item.active{border-bottom-color:#f0b90b;}
    .fut-main{display:flex;flex:1;overflow:hidden;min-height:0;}
    .fut-left{width:220px;flex-shrink:0;border-right:1px solid #1e2329;display:flex;flex-direction:column;background:#0b0e11;}
    .fut-center{flex:1;display:flex;flex-direction:column;min-width:0;}
    .fut-right{width:290px;flex-shrink:0;border-left:1px solid #1e2329;display:flex;flex-direction:column;background:#0b0e11;overflow-y:auto;}
    .fut-header{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:#0b0e11;border-bottom:1px solid #1e2329;gap:8px;flex-wrap:wrap;}
    .fut-chart-tabs{display:flex;padding:0 10px;background:#161a1e;border-bottom:1px solid #1e2329;}
    .fut-chart-tab{padding:8px 12px;font-size:12px;font-weight:500;background:transparent;border:none;color:#848e9c;cursor:pointer;border-bottom:2px solid transparent;white-space:nowrap;font-family:inherit;transition:color .15s;}
    .fut-chart-tab.active{color:#eaecef;border-bottom-color:#f0b90b;}
    .fut-tf-bar{display:flex;align-items:center;gap:2px;padding:4px 8px;background:#161a1e;border-bottom:1px solid #1e2329;overflow-x:auto;scrollbar-width:none;}
    .fut-tf-bar::-webkit-scrollbar{display:none;}
    .fut-tf-btn{padding:3px 8px;font-size:11px;border-radius:3px;border:none;background:transparent;color:#848e9c;cursor:pointer;white-space:nowrap;font-family:inherit;transition:all .15s;}
    .fut-tf-btn.active{background:#2b3139;color:#eaecef;}
    /* ORDER BOOK */
    .ob-row{display:flex;justify-content:space-between;align-items:center;padding:2px 8px;position:relative;font-size:11px;cursor:pointer;}
    .ob-row:hover{background:rgba(255,255,255,.03);}
    .ob-depth{position:absolute;right:0;top:0;bottom:0;opacity:.12;pointer-events:none;}
    /* POSITION TABS */
    .fut-pos-tabs{display:flex;padding:0 8px;border-bottom:1px solid #1e2329;overflow-x:auto;scrollbar-width:none;flex-shrink:0;}
    .fut-pos-tabs::-webkit-scrollbar{display:none;}
    .fut-pos-tab{padding:9px 10px 7px;font-size:11px;font-weight:600;background:transparent;border:none;border-bottom:2px solid transparent;color:#5e6673;cursor:pointer;white-space:nowrap;font-family:inherit;transition:all .15s;flex-shrink:0;}
    .fut-pos-tab.active{color:#eaecef;border-bottom-color:#f0b90b;}
    /* ORDER TYPE */
    .order-type-tab{padding:6px 12px;font-size:12px;border:none;background:transparent;cursor:pointer;color:#848e9c;border-bottom:2px solid transparent;font-family:inherit;transition:all .15s;}
    .order-type-tab.active{color:#f0b90b;border-bottom-color:#f0b90b;}
    /* INPUT */
    .fut-input{width:100%;background:#2b3139;border:1px solid #2b3139;border-radius:4px;padding:8px 10px;color:#eaecef;font-size:13px;outline:none;transition:border .15s;font-family:inherit;}
    .fut-input:focus{border-color:#f0b90b;}
    .fut-input::placeholder{color:#5e6673;}
    /* LEVERAGE TRACK */
    .leverage-track{width:100%;height:4px;background:#2b3139;border-radius:2px;position:relative;cursor:pointer;}
    .leverage-fill{height:100%;background:#f0b90b;border-radius:2px;}
    .leverage-thumb{width:12px;height:12px;background:#f0b90b;border-radius:50%;position:absolute;top:-4px;transform:translateX(-50%);cursor:pointer;box-shadow:0 0 4px rgba(240,185,11,.5);}
    /* POSITION CARDS */
    .pos-card{background:#161a1e;border-radius:6px;margin:6px 12px;padding:10px 12px;border-left:3px solid transparent;}
    .pos-card.long{border-left-color:#0ecb81;}
    .pos-card.short{border-left-color:#f6465d;}
    .pos-badge{padding:1px 6px;border-radius:3px;font-size:9px;font-weight:700;}
    .pos-badge.long{background:rgba(14,203,129,.15);color:#0ecb81;}
    .pos-badge.short{background:rgba(246,70,93,.15);color:#f6465d;}
    .lev-badge{background:#2b3139;color:#f0b90b;padding:1px 5px;border-radius:3px;font-size:9px;font-weight:700;}
    .pnl-pos{color:#0ecb81;font-weight:700;}
    .pnl-neg{color:#f6465d;font-weight:700;}
    .close-pos-btn{padding:3px 10px;border-radius:3px;border:1px solid #f6465d;color:#f6465d;background:transparent;font-size:10px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .15s;}
    .close-pos-btn:hover{background:#f6465d;color:#fff;}
    /* ICON BTN */
    .icon-btn{background:transparent;border:none;border-radius:6px;padding:6px 8px;cursor:pointer;display:flex;align-items:center;position:relative;transition:background .15s;}
    .icon-btn:hover{background:#2b3139;}
    .icon-btn.active{background:#2b3139;}
    .notif-badge{position:absolute;top:-3px;right:-3px;min-width:15px;height:15px;background:#f6465d;border-radius:50%;font-size:8px;font-weight:700;color:#fff;display:flex;align-items:center;justify-content:center;border:2px solid #0b0e11;padding:0 2px;}
    /* DROPDOWNS */
    .drop-overlay{position:fixed;inset:0;z-index:98;}
    .notif-drop{position:absolute;top:calc(100% + 6px);right:0;width:340px;background:#1e2329;border:1px solid #2b3139;border-radius:8px;box-shadow:0 8px 32px rgba(0,0,0,.7);z-index:99;overflow:hidden;}
    .notif-item{display:flex;gap:10px;padding:10px 14px;border-bottom:1px solid #1e232960;cursor:pointer;transition:background .15s;}
    .notif-item:hover,.notif-item.unread{background:#161a1e;}
    .threedot-drop{position:absolute;top:calc(100% + 6px);right:0;width:200px;background:#1e2329;border:1px solid #2b3139;border-radius:8px;box-shadow:0 8px 32px rgba(0,0,0,.7);z-index:99;overflow:hidden;}
    .td-item{display:flex;align-items:center;gap:10px;padding:10px 14px;font-size:12px;color:#848e9c;cursor:pointer;font-family:inherit;transition:all .15s;border:none;background:transparent;width:100%;text-align:left;}
    .td-item:hover{background:#2b3139;color:#eaecef;}
    /* SETTINGS MODAL */
    .settings-overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:200;display:flex;align-items:center;justify-content:center;}
    .settings-modal{background:#1e2329;border:1px solid #2b3139;border-radius:12px;width:480px;max-width:95vw;max-height:85vh;display:flex;flex-direction:column;box-shadow:0 16px 64px rgba(0,0,0,.9);}
    .settings-header{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #2b3139;}
    .settings-body{display:flex;flex:1;overflow:hidden;}
    .settings-nav{width:130px;border-right:1px solid #2b3139;padding:8px 0;flex-shrink:0;}
    .s-nav-item{padding:10px 14px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:8px;color:#848e9c;font-family:inherit;transition:all .15s;}
    .s-nav-item:hover{background:#2b3139;color:#eaecef;}
    .s-nav-item.active{background:#2b3139;color:#f0b90b;}
    .settings-content{flex:1;padding:16px;overflow-y:auto;}
    .s-row{display:flex;align-items:center;justify-content:space-between;padding:9px 0;border-bottom:1px solid #1e2329;}
    .s-label{font-size:12px;color:#848e9c;}
    .s-toggle{width:36px;height:20px;background:#2b3139;border-radius:10px;position:relative;cursor:pointer;border:none;transition:background .2s;flex-shrink:0;}
    .s-toggle.on{background:#f0b90b;}
    .s-thumb{width:14px;height:14px;background:#fff;border-radius:50%;position:absolute;top:3px;left:3px;transition:left .2s;pointer-events:none;}
    .s-toggle.on .s-thumb{left:19px;}
    .s-select{background:#2b3139;border:1px solid #2b3139;border-radius:4px;padding:4px 8px;color:#eaecef;font-size:11px;outline:none;cursor:pointer;font-family:inherit;}
    .s-select:focus{border-color:#f0b90b;}
    .s-section{color:#5e6673;font-size:10px;margin:12px 0 8px;text-transform:uppercase;letter-spacing:.05em;}
    /* HISTORY TABLE */
    .hist-table{width:100%;font-size:11px;border-collapse:collapse;}
    .hist-table th{padding:6px 10px;color:#5e6673;text-align:left;font-weight:600;font-size:10px;border-bottom:1px solid #1e2329;text-transform:uppercase;white-space:nowrap;}
    .hist-table td{padding:7px 10px;border-bottom:1px solid #1e232950;white-space:nowrap;}
    .hist-table tr:hover td{background:rgba(255,255,255,.02);}
    /* ACCOUNT PANEL */
    .acct-panel{padding:14px;border-top:1px solid #1e2329;flex-shrink:0;}
    .acct-row{display:flex;justify-content:space-between;padding:4px 0;font-size:11px;}
    /* EMPTY */
    .empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 0;gap:8px;color:#404854;font-size:11px;}
    /* ANIMATIONS */
    @keyframes spin{to{transform:rotate(360deg);}}
    .spin{animation:spin .8s linear infinite;}
    @keyframes flashG{0%{background:rgba(14,203,129,.2)}100%{background:transparent}}
    @keyframes flashR{0%{background:rgba(246,70,93,.2)}100%{background:transparent}}
    .fg{animation:flashG .4s ease-out;}
    .fr{animation:flashR .4s ease-out;}
    /* TICKER */
    .bottom-ticker{display:flex;padding:5px 12px;background:#0b0e11;border-top:1px solid #1e2329;overflow:hidden;font-size:10px;white-space:nowrap;flex-shrink:0;}
    @keyframes scrollLeft{from{transform:translateX(0)}to{transform:translateX(-50%)}}
    .ticker-scroll{display:flex;gap:24px;animation:scrollLeft 60s linear infinite;}
    /* RESPONSIVE */
    @media(max-width:1100px){.fut-left{display:none;}.fut-right{width:240px;}}
    @media(max-width:768px){.fut-main{flex-direction:column;overflow-y:auto;}.fut-right{width:100%;border-left:none;border-top:1px solid #1e2329;}.fut-left{display:none;}.notif-drop{width:300px;right:-40px;}}
    ::-webkit-scrollbar{width:3px;height:3px}::-webkit-scrollbar-thumb{background:#2b3139}
    input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}
    input[type=number]{-moz-appearance:textfield}
  `}</style>
);

/* ═══════════════════════════════════════
   NOTIFICATIONS
═══════════════════════════════════════ */
const INIT_NOTIFS = [
  { id:1, icon:'📈', color:'#0ecb81', title:'BTC Price Alert',      body:'BTC crossed your $80,000 threshold.',             time:'2m ago',  read:false },
  { id:2, icon:'⚡', color:'#f0b90b', title:'Position Opened',       body:'Long BTC ×20 opened at $79,850.',                 time:'5m ago',  read:false },
  { id:3, icon:'ℹ️', color:'#848e9c', title:'Funding Rate Updated', body:'BTC funding changed to 0.0156% (8h).',            time:'1h ago',  read:true  },
  { id:4, icon:'💰', color:'#0ecb81', title:'Deposit Confirmed',     body:'Your USDT deposit of $500 was approved.',         time:'3h ago',  read:true  },
  { id:5, icon:'⚠️', color:'#f6465d', title:'Margin Warning',       body:'Margin ratio approaching liquidation threshold.', time:'5h ago',  read:true  },
];

const NotifDropdown = ({ onClose, onReadAll }) => {
  const [notifs, setNotifs] = useState(INIT_NOTIFS);
  const [filter, setFilter] = useState('all');
  const unread = notifs.filter(n => !n.read).length;
  const markAll = () => { setNotifs(p => p.map(n => ({...n, read:true}))); onReadAll(); };
  const markOne = id => setNotifs(p => p.map(n => n.id===id ? {...n, read:true} : n));
  const del = (id,e) => { e.stopPropagation(); setNotifs(p => p.filter(n => n.id!==id)); };
  const list = filter==='unread' ? notifs.filter(n=>!n.read) : notifs;
  return (
    <>
      <div className="drop-overlay" onClick={onClose}/>
      <div className="notif-drop">
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 14px',borderBottom:'1px solid #2b3139'}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{color:'#eaecef',fontWeight:700,fontSize:13}}>Notifications</span>
            {unread>0 && <span style={{background:'#f6465d',color:'#fff',fontSize:9,fontWeight:700,padding:'1px 6px',borderRadius:10}}>{unread}</span>}
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            {unread>0 && <button onClick={markAll} style={{background:'none',border:'none',color:'#f0b90b',fontSize:11,cursor:'pointer',fontFamily:'inherit'}}>Mark all read</button>}
            <button onClick={onClose} style={{background:'none',border:'none',color:'#5e6673',cursor:'pointer'}}><X size={13}/></button>
          </div>
        </div>
        <div style={{display:'flex',padding:'0 10px',borderBottom:'1px solid #2b3139'}}>
          {['all','unread'].map(f => (
            <button key={f} onClick={()=>setFilter(f)} style={{padding:'7px 10px',fontSize:11,background:'transparent',border:'none',cursor:'pointer',color:filter===f?'#f0b90b':'#848e9c',borderBottom:filter===f?'2px solid #f0b90b':'2px solid transparent',textTransform:'capitalize',fontFamily:'inherit'}}>{f}</button>
          ))}
        </div>
        <div style={{maxHeight:280,overflowY:'auto',scrollbarWidth:'thin',scrollbarColor:'#2b3139 transparent'}}>
          {list.length===0 ? (
            <div style={{padding:24,textAlign:'center',color:'#5e6673',fontSize:12}}>
              <Bell size={24} style={{opacity:.2,margin:'0 auto 8px',display:'block'}}/>No {filter==='unread'?'unread':''} notifications
            </div>
          ) : list.map(n => (
            <div key={n.id} className={`notif-item${!n.read?' unread':''}`} onClick={()=>markOne(n.id)}>
              <div style={{width:32,height:32,borderRadius:'50%',background:`${n.color}18`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:14}}>{n.icon}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',justifyContent:'space-between',gap:4}}>
                  <span style={{color:n.read?'#848e9c':'#eaecef',fontWeight:n.read?400:700,fontSize:12}}>{n.title}</span>
                  <span style={{color:'#5e6673',fontSize:10,flexShrink:0}}>{n.time}</span>
                </div>
                <p style={{color:'#848e9c',fontSize:11,marginTop:2,lineHeight:1.4}}>{n.body}</p>
              </div>
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,flexShrink:0}}>
                {!n.read && <div style={{width:6,height:6,background:'#f0b90b',borderRadius:'50%'}}/>}
                <button onClick={e=>del(n.id,e)} style={{background:'none',border:'none',color:'#5e6673',cursor:'pointer',padding:2}}><X size={9}/></button>
              </div>
            </div>
          ))}
        </div>
        <div style={{padding:'8px 14px',borderTop:'1px solid #2b3139',textAlign:'center'}}>
          <button style={{background:'none',border:'none',color:'#f0b90b',fontSize:11,cursor:'pointer',fontFamily:'inherit'}}>View All →</button>
        </div>
      </div>
    </>
  );
};

/* ═══════════════════════════════════════
   SETTINGS MODAL
═══════════════════════════════════════ */
const SettingsModal = ({ onClose }) => {
  const [tab, setTab] = useState('trading');
  const [cfg, setCfg] = useState({
    confirmOrders:true, autoClose:false, soundAlerts:true, priceAlerts:true,
    defaultLeverage:20, marginMode:'cross',
    colorScheme:'red-green', chartType:'candles', showPnlPct:true, compactMode:false,
    tradeNotif:true, priceNotif:true, fundingNotif:false, systemNotif:true,
  });
  const tog = k => setCfg(p => ({...p, [k]:!p[k]}));
  const set = (k,v) => setCfg(p => ({...p, [k]:v}));
  const Toggle = ({k}) => (
    <button className={`s-toggle${cfg[k]?' on':''}`} onClick={()=>tog(k)}><div className="s-thumb"/></button>
  );
  const navItems = [
    {k:'trading', label:'Trading', icon:<Sliders size={11}/>},
    {k:'display',  label:'Display', icon:<Layout size={11}/>},
    {k:'alerts',   label:'Alerts',  icon:<Bell size={11}/>},
    {k:'security', label:'Security',icon:<Settings size={11}/>},
  ];
  return (
    <div className="settings-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="settings-modal">
        <div className="settings-header">
          <span style={{color:'#eaecef',fontWeight:700,fontSize:14}}>Futures Settings</span>
          <button onClick={onClose} style={{background:'none',border:'none',color:'#848e9c',cursor:'pointer'}}><X size={16}/></button>
        </div>
        <div className="settings-body">
          <div className="settings-nav">
            {navItems.map(n => (
              <div key={n.k} className={`s-nav-item${tab===n.k?' active':''}`} onClick={()=>setTab(n.k)}>{n.icon}{n.label}</div>
            ))}
          </div>
          <div className="settings-content">
            {tab==='trading' && <>
              <p className="s-section">Order Settings</p>
              {[['confirmOrders','Confirm orders before placing'],['autoClose','Auto-close at liquidation']].map(([k,l]) => (
                <div key={k} className="s-row"><span className="s-label">{l}</span><Toggle k={k}/></div>
              ))}
              <div className="s-row">
                <span className="s-label">Default Leverage</span>
                <select className="s-select" value={cfg.defaultLeverage} onChange={e=>set('defaultLeverage',Number(e.target.value))}>
                  {[1,5,10,20,50,75,100,125].map(v=><option key={v} value={v}>{v}x</option>)}
                </select>
              </div>
              <div className="s-row">
                <span className="s-label">Margin Mode</span>
                <select className="s-select" value={cfg.marginMode} onChange={e=>set('marginMode',e.target.value)}>
                  <option value="cross">Cross</option><option value="isolated">Isolated</option>
                </select>
              </div>
              <p className="s-section">Sound</p>
              {[['soundAlerts','Sound on order fill'],['priceAlerts','Price movement alerts']].map(([k,l]) => (
                <div key={k} className="s-row"><span className="s-label">{l}</span><Toggle k={k}/></div>
              ))}
            </>}
            {tab==='display' && <>
              <p className="s-section">Chart & Colors</p>
              <div className="s-row">
                <span className="s-label">Color Scheme</span>
                <select className="s-select" value={cfg.colorScheme} onChange={e=>set('colorScheme',e.target.value)}>
                  <option value="red-green">Red Up / Green Down</option>
                  <option value="green-red">Green Up / Red Down</option>
                </select>
              </div>
              <div className="s-row">
                <span className="s-label">Chart Type</span>
                <select className="s-select" value={cfg.chartType} onChange={e=>set('chartType',e.target.value)}>
                  <option value="candles">Candlesticks</option>
                  <option value="line">Line</option>
                  <option value="area">Area</option>
                </select>
              </div>
              {[['showPnlPct','Show PNL percentage'],['compactMode','Compact mode']].map(([k,l]) => (
                <div key={k} className="s-row"><span className="s-label">{l}</span><Toggle k={k}/></div>
              ))}
            </>}
            {tab==='alerts' && <>
              <p className="s-section">Push Notifications</p>
              {[['tradeNotif','Trade fills & position updates'],['priceNotif','Price alerts'],['fundingNotif','Funding rate changes'],['systemNotif','System alerts']].map(([k,l]) => (
                <div key={k} className="s-row"><span className="s-label">{l}</span><Toggle k={k}/></div>
              ))}
            </>}
            {tab==='security' && <>
              <p className="s-section">Account Security</p>
              <div style={{padding:12,background:'#0b0e11',borderRadius:6,marginBottom:10}}>
                <p style={{color:'#eaecef',fontSize:12,fontWeight:600,marginBottom:4}}>Two-Factor Authentication</p>
                <p style={{color:'#5e6673',fontSize:11,marginBottom:8}}>Protect your account with 2FA.</p>
                <button style={{background:'#f0b90b',border:'none',borderRadius:4,padding:'6px 14px',color:'#0b0e11',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Enable 2FA</button>
              </div>
              <div style={{padding:12,background:'#0b0e11',borderRadius:6}}>
                <p style={{color:'#eaecef',fontSize:12,fontWeight:600,marginBottom:4}}>Withdrawal Whitelist</p>
                <p style={{color:'#5e6673',fontSize:11,marginBottom:8}}>Allow withdrawals only to trusted addresses.</p>
                <button style={{background:'#2b3139',border:'none',borderRadius:4,padding:'6px 14px',color:'#eaecef',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Manage Whitelist</button>
              </div>
            </>}
            <button onClick={()=>{toast.success('Settings saved!');onClose();}}
              style={{width:'100%',marginTop:14,padding:'10px 0',background:'#f0b90b',border:'none',borderRadius:6,color:'#0b0e11',fontWeight:700,fontSize:13,cursor:'pointer',fontFamily:'inherit'}}>
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════
   THREE DOT MENU
═══════════════════════════════════════ */
const ThreeDotMenu = ({ coin, onClose }) => {
  const items = [
    {icon:<ExternalLink size={12}/>, label:'Open Full Screen', fn:()=>{window.open(window.location.href,'_blank');onClose();}},
    {icon:<Copy size={12}/>, label:'Copy Chart Link', fn:()=>{navigator.clipboard?.writeText(window.location.href);toast.success('Link copied!');onClose();}},
    {icon:<BarChart2 size={12}/>, label:'Trading Data', fn:()=>{toast('Trading data');onClose();}},
    {icon:<AlertTriangle size={12}/>, label:'Set Price Alert', fn:()=>{toast('Price alert: coming soon');onClose();}},
    {divider:true},
    {icon:<Info size={12}/>, label:'Market Info', fn:()=>{toast(`${coin}/USDT — Perpetual`);onClose();}},
    {icon:<FileText size={12}/>, label:'Futures Guide', fn:()=>{window.open('https://www.binance.com/en/futures/guide','_blank');onClose();}},
  ];
  return (
    <>
      <div className="drop-overlay" onClick={onClose}/>
      <div className="threedot-drop">
        {items.map((item,i) => item.divider
          ? <div key={i} style={{height:1,background:'#2b3139',margin:'3px 0'}}/>
          : <button key={i} className="td-item" onClick={item.fn}>
              <span style={{color:'#5e6673'}}>{item.icon}</span>{item.label}
            </button>
        )}
      </div>
    </>
  );
};

/* ═══════════════════════════════════════
   ORDER BOOK (Left Panel)
═══════════════════════════════════════ */
const FuturesOrderBook = ({ symbol, currentPrice, priceUp }) => {
  const [book, setBook] = useState({asks:[],bids:[]});
  const [trades, setTrades] = useState([]);
  const [view, setView] = useState('book');
  const wbRef = useRef(null);
  const wtRef = useRef(null);

  useEffect(() => {
    const sym = `${symbol.toLowerCase()}usdt`;
    wbRef.current = new WebSocket(`wss://stream.binance.com:9443/ws/${sym}@depth10@500ms`);
    wbRef.current.onmessage = e => {
      const d = JSON.parse(e.data);
      setBook({asks:(d.a||[]).slice(0,12).reverse(), bids:(d.b||[]).slice(0,12)});
    };
    wtRef.current = new WebSocket(`wss://stream.binance.com:9443/ws/${sym}@trade`);
    wtRef.current.onmessage = e => {
      const d = JSON.parse(e.data);
      setTrades(p => [{price:parseFloat(d.p).toFixed(2),qty:parseFloat(d.q).toFixed(3),time:new Date(d.T).toTimeString().slice(0,8),isBuy:!d.m},...p].slice(0,40));
    };
    return () => {wbRef.current?.close(); wtRef.current?.close();};
  }, [symbol]);

  const maxA = book.asks.length ? Math.max(...book.asks.map(o=>parseFloat(o[1]))) : 1;
  const maxB = book.bids.length ? Math.max(...book.bids.map(o=>parseFloat(o[1]))) : 1;

  const totalBid = book.bids.reduce((s,b)=>s+parseFloat(b[1]),0);
  const totalAsk = book.asks.reduce((s,a)=>s+parseFloat(a[1]),0);
  const bidPct = totalBid+totalAsk>0 ? ((totalBid/(totalBid+totalAsk))*100).toFixed(1) : '50.0';

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'6px 8px',borderBottom:'1px solid #1e2329',flexShrink:0}}>
        <div style={{display:'flex',gap:4}}>
          {['book','trades'].map(v => (
            <button key={v} onClick={()=>setView(v)}
              style={{background:view===v?'#2b3139':'transparent',border:'none',borderRadius:3,padding:'3px 8px',color:view===v?'#eaecef':'#5e6673',cursor:'pointer',fontSize:10,fontWeight:600,fontFamily:'inherit'}}>
              {v==='book'?'Book':'Trades'}
            </button>
          ))}
        </div>
        <MoreHorizontal size={13} style={{color:'#5e6673'}}/>
      </div>

      {view==='book' ? <>
        <div style={{display:'flex',justifyContent:'space-between',padding:'3px 8px',fontSize:10,color:'#5e6673',flexShrink:0,fontWeight:600}}>
          <span>Price(USDT)</span><span>Size</span><span>Sum</span>
        </div>
        <div style={{flex:1,overflowY:'auto',scrollbarWidth:'none'}}>
          {book.asks.map((ask,i) => {
            const pct=(parseFloat(ask[1])/maxA)*100;
            const sum=book.asks.slice(0,i+1).reduce((a,o)=>a+parseFloat(o[1]),0);
            return (
              <div key={i} className="ob-row">
                <div className="ob-depth" style={{width:`${pct}%`,background:'#f6465d'}}/>
                <span style={{color:'#f6465d',fontWeight:600,zIndex:1}}>{parseFloat(ask[0]).toFixed(2)}</span>
                <span style={{color:'#c6cad2',zIndex:1}}>{parseFloat(ask[1]).toFixed(3)}</span>
                <span style={{color:'#848e9c',zIndex:1}}>{sum.toFixed(3)}</span>
              </div>
            );
          })}
        </div>
        <div style={{textAlign:'center',padding:'7px 8px',borderTop:'1px solid #1e2329',borderBottom:'1px solid #1e2329',flexShrink:0,background:priceUp?'rgba(14,203,129,.04)':'rgba(246,70,93,.04)'}}>
          <div style={{color:priceUp?'#0ecb81':'#f6465d',fontSize:15,fontWeight:800}}>
            {parseFloat(currentPrice).toLocaleString(undefined,{minimumFractionDigits:2})}
          </div>
          <div style={{fontSize:9,color:'#5e6673'}}>≈ ${parseFloat(currentPrice).toLocaleString(undefined,{minimumFractionDigits:2})}</div>
          <div style={{display:'flex',height:3,borderRadius:2,overflow:'hidden',marginTop:4}}>
            <div style={{width:`${bidPct}%`,background:'#0ecb81'}}/><div style={{flex:1,background:'#f6465d'}}/>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:9,marginTop:2}}>
            <span style={{color:'#0ecb81'}}>B {bidPct}%</span>
            <span style={{color:'#f6465d'}}>S {(100-parseFloat(bidPct)).toFixed(1)}%</span>
          </div>
        </div>
        <div style={{flex:1,overflowY:'auto',scrollbarWidth:'none'}}>
          {book.bids.map((bid,i) => {
            const pct=(parseFloat(bid[1])/maxB)*100;
            const sum=book.bids.slice(0,i+1).reduce((a,o)=>a+parseFloat(o[1]),0);
            return (
              <div key={i} className="ob-row">
                <div className="ob-depth" style={{width:`${pct}%`,background:'#0ecb81'}}/>
                <span style={{color:'#0ecb81',fontWeight:600,zIndex:1}}>{parseFloat(bid[0]).toFixed(2)}</span>
                <span style={{color:'#c6cad2',zIndex:1}}>{parseFloat(bid[1]).toFixed(3)}</span>
                <span style={{color:'#848e9c',zIndex:1}}>{sum.toFixed(3)}</span>
              </div>
            );
          })}
        </div>
      </> : <>
        <div style={{display:'flex',justifyContent:'space-between',padding:'3px 8px',fontSize:10,color:'#5e6673',flexShrink:0,fontWeight:600}}>
          <span>Price</span><span>Amount</span><span>Time</span>
        </div>
        <div style={{flex:1,overflowY:'auto',scrollbarWidth:'none'}}>
          {trades.map((t,i) => (
            <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'2px 8px',fontSize:11}}>
              <span style={{color:t.isBuy?'#0ecb81':'#f6465d',fontWeight:600}}>{t.price}</span>
              <span style={{color:'#c6cad2'}}>{t.qty}</span>
              <span style={{color:'#5e6673'}}>{t.time}</span>
            </div>
          ))}
        </div>
      </>}
    </div>
  );
};

/* ═══════════════════════════════════════
   POSITION CARD
═══════════════════════════════════════ */
const PositionCard = ({ pos, currentPrice, onClose }) => {
  const isLong = pos.type==='buy'||pos.side==='Buy';
  const entry  = parseFloat(pos.entryPrice||0);
  const size   = parseFloat(pos.amount||0);
  const lev    = parseFloat(pos.leverage||1);
  const mark   = parseFloat(currentPrice||entry);
  const pnl    = isLong?(mark-entry)*(size/entry)*lev:(entry-mark)*(size/entry)*lev;
  const pnlPct = entry>0?((pnl/size)*100).toFixed(2):'0.00';
  const liq    = isLong?(entry*(1-1/lev)).toFixed(2):(entry*(1+1/lev)).toFixed(2);
  return (
    <div className={`pos-card ${isLong?'long':'short'}`}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          <span className={`pos-badge ${isLong?'long':'short'}`}>{isLong?'↑ LONG':'↓ SHORT'}</span>
          <span className="lev-badge">{lev}x</span>
          <span style={{color:'#eaecef',fontSize:12,fontWeight:700}}>{(pos.symbol||'BTC').replace('USDT','')}USDT</span>
        </div>
        <button className="close-pos-btn" onClick={()=>onClose(pos._id||pos.id)}>Close</button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6,fontSize:10}}>
        {[['Size',`${size.toFixed(2)}`],['Entry',entry.toFixed(2)],['Mark',mark.toFixed(2)],['Liq.',liq]].map(([l,v]) => (
          <div key={l}><div style={{color:'#5e6673',marginBottom:2}}>{l}</div><div style={{color:'#c6cad2',fontWeight:600}}>{v}</div></div>
        ))}
      </div>
      <div style={{marginTop:8,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{fontSize:10,color:'#5e6673'}}>PNL (ROE%)</span>
        <span className={pnl>=0?'pnl-pos':'pnl-neg'}>{pnl>=0?'+':''}{pnl.toFixed(2)} USDT ({pnlPct}%)</span>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════
   TRADE HISTORY (Binance-style)
═══════════════════════════════════════ */
const TradeHistory = ({ token, symbol }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    api.get('/api/transactions', {headers:{Authorization:`Bearer ${token}`}})
      .then(r => {
        const filtered = (r.data||[]).filter(t =>
          t.type?.includes('futures') || t.type?.includes('trade') || t.type?.includes('spot')
        );
        setData(filtered);
      })
      .catch(()=>setData([]))
      .finally(()=>setLoading(false));
  }, [token]);

  if (loading) return <div className="empty-state"><Loader2 size={16} className="spin" style={{color:'#f0b90b'}}/></div>;
  if (!data.length) return <div className="empty-state"><FileText size={28} style={{opacity:.2}}/><span>No trade history</span></div>;

  return (
    <div style={{overflowX:'auto'}}>
      <table className="hist-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Pair</th>
            <th>Side</th>
            <th style={{textAlign:'right'}}>Amount</th>
            <th style={{textAlign:'right'}}>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((t,i) => {
            const isBuy = t.type?.includes('buy');
            const isSell = t.type?.includes('sell');
            return (
              <tr key={i}>
                <td style={{color:'#848e9c'}}>{new Date(t.createdAt||t.date).toLocaleString()}</td>
                <td style={{color:'#eaecef',fontWeight:700}}>{(t.symbol||'BTC')}/USDT</td>
                <td>
                  <span style={{color:isBuy?'#0ecb81':isSell?'#f6465d':'#f0b90b',fontWeight:700,textTransform:'uppercase',fontSize:10}}>
                    {isBuy?'BUY':isSell?'SELL':(t.type||'').replace('futures-','').replace('spot-','').toUpperCase()}
                  </span>
                </td>
                <td style={{textAlign:'right',color:'#eaecef',fontFamily:'monospace'}}>${(t.amount||0).toFixed(2)}</td>
                <td style={{textAlign:'right'}}>
                  <span style={{padding:'2px 8px',borderRadius:10,fontSize:10,fontWeight:700,
                    background:t.status==='approved'||t.status==='completed'?'rgba(14,203,129,.1)':t.status==='rejected'?'rgba(246,70,93,.1)':'rgba(240,185,11,.1)',
                    color:t.status==='approved'||t.status==='completed'?'#0ecb81':t.status==='rejected'?'#f6465d':'#f0b90b'
                  }}>{t.status}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

/* ═══════════════════════════════════════
   ORDER HISTORY (Binance-style tabs)
═══════════════════════════════════════ */
const OrderHistory = ({ token }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [subTab, setSubTab] = useState('open');

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    api.get('/api/transactions', {headers:{Authorization:`Bearer ${token}`}})
      .then(r => setData(r.data||[]))
      .catch(()=>setData([]))
      .finally(()=>setLoading(false));
  }, [token]);

  const filtered = subTab==='open'
    ? data.filter(t => t.status==='pending')
    : subTab==='filled'
    ? data.filter(t => t.status==='approved'||t.status==='completed')
    : data.filter(t => t.status==='rejected');

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%'}}>
      <div style={{display:'flex',padding:'0 8px',borderBottom:'1px solid #1e2329',flexShrink:0}}>
        {[{k:'open',l:'Open Orders'},{k:'filled',l:'Filled'},{k:'cancelled',l:'Cancelled'}].map(t => (
          <button key={t.k} onClick={()=>setSubTab(t.k)}
            style={{padding:'7px 10px',fontSize:11,background:'transparent',border:'none',cursor:'pointer',color:subTab===t.k?'#eaecef':'#5e6673',borderBottom:subTab===t.k?'2px solid #f0b90b':'2px solid transparent',fontFamily:'inherit',whiteSpace:'nowrap'}}>
            {t.l}{subTab===t.k&&filtered.length>0?` (${filtered.length})`:''}
          </button>
        ))}
      </div>
      <div style={{flex:1,overflowY:'auto'}}>
        {loading && <div className="empty-state"><Loader2 size={16} className="spin" style={{color:'#f0b90b'}}/></div>}
        {!loading && filtered.length===0 && (
          <div className="empty-state">
            <FileText size={28} style={{opacity:.2}}/>
            <span>{subTab==='open'?'No open orders':subTab==='filled'?'No filled orders':'No cancelled orders'}</span>
          </div>
        )}
        {!loading && filtered.length>0 && (
          <div style={{overflowX:'auto'}}>
            <table className="hist-table">
              <thead>
                <tr>
                  <th>Date</th><th>Pair</th><th>Type</th><th>Side</th>
                  <th style={{textAlign:'right'}}>Amount</th><th style={{textAlign:'right'}}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t,i) => (
                  <tr key={i}>
                    <td style={{color:'#848e9c'}}>{new Date(t.createdAt||t.date).toLocaleString()}</td>
                    <td style={{color:'#eaecef',fontWeight:700}}>{(t.symbol||'BTC')}/USDT</td>
                    <td style={{color:'#f0b90b',textTransform:'uppercase',fontSize:10}}>Market</td>
                    <td>
                      <span style={{color:t.type?.includes('buy')?'#0ecb81':'#f6465d',fontWeight:700,textTransform:'uppercase',fontSize:10}}>
                        {t.type?.includes('buy')?'BUY':'SELL'}
                      </span>
                    </td>
                    <td style={{textAlign:'right',color:'#eaecef',fontFamily:'monospace'}}>${(t.amount||0).toFixed(2)}</td>
                    <td style={{textAlign:'right'}}>
                      <span style={{padding:'2px 8px',borderRadius:10,fontSize:10,fontWeight:700,
                        background:t.status==='approved'||t.status==='completed'?'rgba(14,203,129,.1)':t.status==='rejected'?'rgba(246,70,93,.1)':'rgba(240,185,11,.1)',
                        color:t.status==='approved'||t.status==='completed'?'#0ecb81':t.status==='rejected'?'#f6465d':'#f0b90b'
                      }}>{t.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════
   ACCOUNT PANEL (Right Side Bottom)
═══════════════════════════════════════ */
const AccountPanel = ({ user, positions }) => {
  const navigate = useNavigate();
  const balance = user?.balance || 0;
  const totalPnl = positions.reduce((sum, pos) => sum + (pos.pnl || 0), 0);
  const marginUsed = positions.reduce((sum, pos) => sum + (parseFloat(pos.amount||0) / parseFloat(pos.leverage||1)), 0);
  const marginRatio = balance > 0 ? ((marginUsed / balance) * 100).toFixed(2) : '0.00';
  const ratioColor = parseFloat(marginRatio) < 20 ? '#0ecb81' : parseFloat(marginRatio) < 50 ? '#f0b90b' : '#f6465d';

  return (
    <div className="acct-panel">
      {/* Title */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <span style={{fontSize:13,fontWeight:700,color:'#eaecef'}}>Account</span>
        <button onClick={()=>navigate('/wallet')} style={{background:'none',border:'none',color:'#f0b90b',fontSize:11,cursor:'pointer',display:'flex',alignItems:'center',gap:4,fontFamily:'inherit'}}>
          <Wallet size={12}/> Wallet
        </button>
      </div>

      {/* Margin Ratio */}
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12,background:'#161a1e',borderRadius:6,padding:'8px 10px'}}>
        <div style={{width:32,height:32,borderRadius:'50%',border:`3px solid ${ratioColor}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,color:ratioColor,fontWeight:700,flexShrink:0}}>⊙</div>
        <div>
          <div style={{fontSize:10,color:'#5e6673',marginBottom:2}}>Margin Ratio</div>
          <div style={{fontSize:15,fontWeight:700,color:ratioColor}}>{marginRatio}%</div>
        </div>
      </div>

      {/* Stats */}
      {[
        ['Wallet Balance',  `${balance.toFixed(4)} USDT`, '#eaecef'],
        ['Margin Balance',  `${balance.toFixed(4)} USDT`, '#eaecef'],
        ['Unrealized PNL',  `${totalPnl>=0?'+':''}${totalPnl.toFixed(4)} USDT`, totalPnl>=0?'#0ecb81':'#f6465d'],
        ['Maint. Margin',   `${marginUsed.toFixed(4)} USDT`, '#eaecef'],
        ['Open Positions',  positions.length.toString(), '#f0b90b'],
      ].map(([l,v,c]) => (
        <div key={l} className="acct-row">
          <span style={{color:'#5e6673'}}>{l}</span>
          <span style={{color:c,fontWeight:600}}>{v}</span>
        </div>
      ))}

      {/* Single Asset Mode */}
      <button style={{width:'100%',marginTop:10,padding:'7px 0',background:'#2b3139',border:'none',borderRadius:4,color:'#eaecef',fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>
        Single-Asset Mode
      </button>

      {/* Action Buttons */}
      <div style={{display:'flex',gap:6,marginTop:8}}>
        {[
          {l:'Transfer',  fn:()=>navigate('/wallet'),  c:'#2b3139'},
          {l:'Buy Crypto', fn:()=>navigate('/deposit'), c:'#2b3139'},
          {l:'Swap',       fn:()=>toast('Swap: coming soon'), c:'#2b3139'},
        ].map(b => (
          <button key={b.l} onClick={b.fn}
            style={{flex:1,padding:'6px 0',background:b.c,border:'none',borderRadius:4,color:'#eaecef',fontSize:10,fontWeight:600,cursor:'pointer',fontFamily:'inherit',transition:'background .15s'}}
            onMouseEnter={e=>e.target.style.background='#363c46'}
            onMouseLeave={e=>e.target.style.background=b.c}>
            {b.l}
          </button>
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════
   MAIN FUTURES PAGE
═══════════════════════════════════════ */
const Futures = () => {
  const { coinSymbol } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser, token } = useContext(UserContext);

  const coin = (coinSymbol||'BTC').toUpperCase();

  const [leverage,     setLeverage]     = useState(20);
  const [amount,       setAmount]       = useState('');
  const [side,         setSide]         = useState('buy');
  const [orderType,    setOrderType]    = useState('Market');
  const [limitPrice,   setLimitPrice]   = useState('');
  const [tpslEnabled,  setTpslEnabled]  = useState(false);
  const [tpPrice,      setTpPrice]      = useState('');
  const [slPrice,      setSlPrice]      = useState('');
  const [loading,      setLoading]      = useState(false);
  const [currentPrice, setCurrentPrice] = useState('0.00');
  const [priceUp,      setPriceUp]      = useState(true);
  const [flashCls,     setFlashCls]     = useState('');
  const [ticker24h,    setTicker24h]    = useState({change:'0.00',changePct:'0.00',high:'0',low:'0',vol:'0',markPrice:'0',fundingRate:'0.0156',countdown:'00:33:44'});
  const [activeChartTab,  setActiveChartTab]  = useState('Chart');
  const [activeTimeframe, setActiveTimeframe] = useState('1D');
  const [activePosTab,    setActivePosTab]    = useState('positions');
  const [positions,    setPositions]    = useState([]);
  const [posLoading,   setPosLoading]   = useState(false);

  const [showNotif,    setShowNotif]    = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showThreeDot, setShowThreeDot] = useState(false);
  const [unreadCount,  setUnreadCount]  = useState(2);

  const tfMap = {'1s':'1','15m':'15','1H':'60','4H':'240','1D':'1D','1W':'1W'};
  const prevRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${coin.toLowerCase()}usdt@ticker`);
    ws.onmessage = e => {
      const d = JSON.parse(e.data);
      const price = parseFloat(d.c);
      const up = prevRef.current===null?true:price>=prevRef.current;
      prevRef.current = price;
      setPriceUp(up); setFlashCls(up?'fg':'fr');
      setTimeout(()=>setFlashCls(''),420);
      setCurrentPrice(price.toFixed(2));
      setTicker24h(p => ({...p,
        change:parseFloat(d.p).toFixed(2),
        changePct:parseFloat(d.P).toFixed(2),
        high:parseFloat(d.h).toFixed(2),
        low:parseFloat(d.l).toFixed(2),
        vol:parseFloat(d.v).toLocaleString(undefined,{maximumFractionDigits:0}),
        markPrice:(price+Math.random()*.5-.25).toFixed(2)
      }));
    };
    ws.onerror = ()=>ws.close();
    return ()=>ws.close();
  }, [coin]);

  const fetchPositions = useCallback(async () => {
    if (!token) return;
    setPosLoading(true);
    try {
      const res = await api.get('/api/futures/positions', {headers:{Authorization:`Bearer ${token}`}});
      const data = res.data?.positions||res.data||[];
      setPositions(Array.isArray(data)?data:[]);
    } catch { setPositions([]); }
    finally { setPosLoading(false); }
  }, [token]);

  useEffect(()=>{fetchPositions();},[fetchPositions]);

  const handleTrade = async () => {
    if (!amount||parseFloat(amount)<=0) return toast.error('Enter a valid amount');
    if (parseFloat(amount)>(user?.balance||0)) return toast.error('Insufficient balance');
    setLoading(true);
    try {
      const res = await api.post('/api/futures/trade', {
        type:side, amount:parseFloat(amount), leverage:Number(leverage),
        symbol:coin, entryPrice:parseFloat(currentPrice),
        ...(tpslEnabled&&tpPrice?{tp:parseFloat(tpPrice)}:{}),
        ...(tpslEnabled&&slPrice?{sl:parseFloat(slPrice)}:{}),
      }, {headers:{Authorization:`Bearer ${token}`}});
      if (res.data.trade||res.data.message) {
        toast.success(res.data.message||'Trade placed!');
        setAmount(''); setTpPrice(''); setSlPrice('');
        await Promise.all([refreshUser?.(), fetchPositions()]);
      }
    } catch (err) { toast.error(err.response?.data?.message||'Trade failed'); }
    finally { setLoading(false); }
  };

  const handleClosePosition = async posId => {
    if (!posId) return;
    try {
      await api.post(`/api/futures/close/${posId}`, {}, {headers:{Authorization:`Bearer ${token}`}});
      toast.success('Position closed');
      await Promise.all([refreshUser?.(), fetchPositions()]);
    } catch (err) { toast.error(err.response?.data?.message||'Could not close'); }
  };

  const changePctNum = parseFloat(ticker24h.changePct);
  const changeColor  = changePctNum>=0?'#0ecb81':'#f6465d';

  const POSITION_TABS = [
    {key:'positions',        label:`Positions(${positions.length})`},
    {key:'open_orders',      label:'Open Orders(0)'},
    {key:'order_history',    label:'Order History'},
    {key:'trade_history',    label:'Trade History'},
    {key:'transaction',      label:'Transaction History'},
    {key:'position_history', label:'Position History'},
    {key:'assets',           label:'Assets'},
  ];

  return (
    <>
      <FuturesStyles/>
      {showSettings && <SettingsModal onClose={()=>setShowSettings(false)}/>}

      <div className="fut-wrap">

        {/* TICKER BAR */}
        <div className="fut-ticker-bar">
          {['BTCUSDT','ETHUSDT','BNBUSDT','SOLUSDT','XRPUSDT'].map(tc => (
            <div key={tc} className={`fut-ticker-item${tc===`${coin}USDT`?' active':''}`}
              onClick={()=>navigate(`/futures/${tc.replace('USDT','')}`)}>
              <span style={{color:tc===`${coin}USDT`?'#eaecef':'#848e9c',fontWeight:700,fontSize:12}}>{tc}</span>
            </div>
          ))}
        </div>

        {/* HEADER */}
        <div className="fut-header">
          <div style={{display:'flex',alignItems:'center',gap:16}}>
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <div style={{width:24,height:24,background:'#f0b90b',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:900,color:'#0b0e11'}}>{coin[0]}</div>
              <span style={{color:'#eaecef',fontWeight:700,fontSize:16}}>{coin}USDT</span>
              <span style={{background:'#2b3139',color:'#848e9c',fontSize:9,padding:'2px 6px',borderRadius:3,fontWeight:700}}>Perp</span>
              <ChevronDown size={13} style={{color:'#848e9c'}}/>
            </div>
            <div>
              <div className={flashCls} style={{color:priceUp?'#0ecb81':'#f6465d',fontSize:20,fontWeight:700,lineHeight:1}}>
                {parseFloat(currentPrice).toLocaleString(undefined,{minimumFractionDigits:2})}
              </div>
              <div style={{color:changeColor,fontSize:11,marginTop:2}}>
                {changePctNum>=0?'+':''}{ticker24h.change} ({ticker24h.changePct}%)
              </div>
            </div>
          </div>

          <div style={{display:'flex',gap:20,overflow:'hidden',flex:1,justifyContent:'center',flexWrap:'wrap'}}>
            {[{label:'Mark',val:ticker24h.markPrice},{label:'Funding (8h)',val:`${ticker24h.fundingRate}% / ${ticker24h.countdown}`},{label:'24h High',val:ticker24h.high},{label:'24h Low',val:ticker24h.low},{label:'24h Vol',val:ticker24h.vol}].map(({label,val}) => (
              <div key={label} style={{fontSize:11}}>
                <div style={{color:'#5e6673',marginBottom:2}}>{label}</div>
                <div style={{color:'#eaecef',fontWeight:600}}>{val}</div>
              </div>
            ))}
          </div>

          <div style={{display:'flex',gap:4,alignItems:'center'}}>
            <div style={{position:'relative'}}>
              <button className={`icon-btn${showNotif?' active':''}`}
                onClick={()=>{setShowNotif(v=>!v);setShowThreeDot(false);}}>
                <Bell size={16} style={{color:showNotif?'#f0b90b':'#848e9c'}}/>
                {unreadCount>0 && <span className="notif-badge">{unreadCount}</span>}
              </button>
              {showNotif && <NotifDropdown onClose={()=>setShowNotif(false)} onReadAll={()=>setUnreadCount(0)}/>}
            </div>
            <button className={`icon-btn${showSettings?' active':''}`}
              onClick={()=>{setShowSettings(true);setShowNotif(false);setShowThreeDot(false);}}>
              <Settings size={16} style={{color:'#848e9c',transition:'transform .4s',transform:showSettings?'rotate(90deg)':'none'}}/>
            </button>
            <div style={{position:'relative'}}>
              <button className={`icon-btn${showThreeDot?' active':''}`}
                onClick={()=>{setShowThreeDot(v=>!v);setShowNotif(false);}}>
                <MoreHorizontal size={16} style={{color:showThreeDot?'#f0b90b':'#848e9c'}}/>
              </button>
              {showThreeDot && <ThreeDotMenu coin={coin} onClose={()=>setShowThreeDot(false)}/>}
            </div>
          </div>
        </div>

        {/* MAIN LAYOUT */}
        <div className="fut-main">

          {/* LEFT: ORDER BOOK */}
          <div className="fut-left">
            <FuturesOrderBook symbol={coin} currentPrice={currentPrice} priceUp={priceUp}/>
          </div>

          {/* CENTER: CHART + TABS */}
          <div className="fut-center">
            <div className="fut-chart-tabs">
              {['Chart','Info','Trading Data'].map(t => (
                <button key={t} className={`fut-chart-tab${activeChartTab===t?' active':''}`} onClick={()=>setActiveChartTab(t)}>{t}</button>
              ))}
              <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:10,color:'#5e6673',paddingRight:8}}>
                <Bell size={14} style={{cursor:'pointer'}} onClick={()=>setShowNotif(v=>!v)}/>
                <BarChart2 size={14} style={{cursor:'pointer'}}/>
              </div>
            </div>

            <div className="fut-tf-bar">
              {['1s','15m','1H','4H','1D','1W'].map(tf => (
                <button key={tf} className={`fut-tf-btn${activeTimeframe===tf?' active':''}`} onClick={()=>setActiveTimeframe(tf)}>{tf}</button>
              ))}
              <span style={{color:'#5e6673',fontSize:11,marginLeft:4}}>Original</span>
              <span style={{color:'#f0b90b',fontSize:11,marginLeft:8,cursor:'pointer'}}>Trading View</span>
              <span style={{color:'#848e9c',fontSize:11,marginLeft:8,cursor:'pointer'}}>Depth</span>
            </div>

            <div style={{flex:1,minHeight:0,position:'relative',background:'#0b0e11'}}>
              {activeChartTab==='Chart' && (
                <iframe key={`${coin}-${activeTimeframe}`} title="chart"
                  src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${coin}USDT.P&interval=${tfMap[activeTimeframe]||'1D'}&theme=dark&style=1&timezone=Etc%2FUTC&hide_top_toolbar=0&allow_symbol_change=0&locale=en`}
                  style={{position:'absolute',inset:0,width:'100%',height:'100%',border:'none'}}/>
              )}
              {activeChartTab==='Info' && (
                <div style={{padding:20,color:'#848e9c',fontSize:13,lineHeight:1.9,overflowY:'auto',height:'100%'}}>
                  <h3 style={{color:'#eaecef',marginBottom:12}}>{coin} Perpetual Contract</h3>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px 24px'}}>
                    {[['Contract Type','Perpetual'],['Underlying',`${coin}USDT`],['Settlement','USDT'],['Max Leverage','125x'],['Funding Interval','8 Hours'],['Tick Size','0.10'],['Min Order Qty','0.001'],['Max Order Qty','1000']].map(([k,v]) => (
                      <div key={k}><span style={{color:'#5e6673'}}>{k}: </span><span style={{color:'#eaecef',fontWeight:600}}>{v}</span></div>
                    ))}
                  </div>
                </div>
              )}
              {activeChartTab==='Trading Data' && (
                <div style={{padding:20,color:'#848e9c',fontSize:13,overflowY:'auto',height:'100%'}}>
                  <h3 style={{color:'#eaecef',marginBottom:12}}>Trading Data — {coin}USDT</h3>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px 24px'}}>
                    {[['Open Interest',`${(Math.random()*500+200).toFixed(2)}M USDT`],['Long/Short Ratio',`${(Math.random()*.5+.9).toFixed(2)}`],['Buy Volume',`${(Math.random()*1000+500).toFixed(0)} ${coin}`],['Sell Volume',`${(Math.random()*1000+500).toFixed(0)} ${coin}`],['Funding Rate',`${ticker24h.fundingRate}%`],['Next Funding',ticker24h.countdown]].map(([k,v]) => (
                      <div key={k} style={{padding:'8px 0',borderBottom:'1px solid #1e2329'}}>
                        <div style={{color:'#5e6673',fontSize:11,marginBottom:4}}>{k}</div>
                        <div style={{color:'#eaecef',fontWeight:700,fontSize:14}}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* POSITION TABS */}
            <div style={{height:270,display:'flex',flexDirection:'column',borderTop:'1px solid #1e2329',background:'#0b0e11'}}>
              <div className="fut-pos-tabs">
                {POSITION_TABS.map(t => (
                  <button key={t.key} className={`fut-pos-tab${activePosTab===t.key?' active':''}`}
                    onClick={()=>{setActivePosTab(t.key);if(t.key==='positions')fetchPositions();}}>
                    {t.label}
                  </button>
                ))}
                <button onClick={fetchPositions} style={{marginLeft:'auto',background:'none',border:'none',cursor:'pointer',color:'#5e6673',padding:'0 8px',flexShrink:0}}>
                  <RefreshCw size={12} className={posLoading?'spin':''}/>
                </button>
              </div>

              <div style={{flex:1,overflowY:'auto',scrollbarWidth:'thin',scrollbarColor:'#2b3139 transparent'}}>
                {/* POSITIONS */}
                {activePosTab==='positions' && (
                  <>
                    {posLoading && <div className="empty-state"><Loader2 size={16} className="spin" style={{color:'#f0b90b'}}/></div>}
                    {!posLoading && positions.length===0 && <div className="empty-state"><FileText size={28} style={{opacity:.2}}/><span>You have no open positions.</span></div>}
                    {!posLoading && positions.map((pos,i) => <PositionCard key={pos._id||i} pos={pos} currentPrice={currentPrice} onClose={handleClosePosition}/>)}
                  </>
                )}

                {/* OPEN ORDERS */}
                {activePosTab==='open_orders' && (
                  <div className="empty-state"><FileText size={28} style={{opacity:.2}}/><span>No open orders.</span></div>
                )}

                {/* ORDER HISTORY — uses OrderHistory component */}
                {activePosTab==='order_history' && <OrderHistory token={token}/>}

                {/* TRADE HISTORY — uses TradeHistory component */}
                {activePosTab==='trade_history' && <TradeHistory token={token} symbol={coin}/>}

                {/* TRANSACTION HISTORY */}
                {activePosTab==='transaction' && <TradeHistory token={token} symbol={null}/>}

                {/* POSITION HISTORY */}
                {activePosTab==='position_history' && <TradeHistory token={token} symbol={coin}/>}

                {/* ASSETS */}
                {activePosTab==='assets' && (
                  <div style={{padding:'12px 16px',fontSize:12}}>
                    {[
                      ['Wallet Balance',`${(user?.balance||0).toFixed(4)} USDT`,'#eaecef'],
                      ['Margin Balance',`${(user?.balance||0).toFixed(4)} USDT`,'#eaecef'],
                      ['Unrealized PNL','0.00 USDT','#848e9c'],
                      ['Maintenance Margin','0.0000 USDT','#eaecef'],
                      ['Available Balance',`${(user?.balance||0).toFixed(4)} USDT`,'#0ecb81'],
                    ].map(([l,v,c]) => (
                      <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid #1e2329'}}>
                        <span style={{color:'#5e6673'}}>{l}</span><span style={{color:c,fontWeight:600}}>{v}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: TRADE FORM */}
          <div className="fut-right">
            {/* Cross / Leverage / S */}
            <div style={{display:'flex',gap:6,padding:'10px 12px',borderBottom:'1px solid #1e2329',flexShrink:0}}>
              <button style={{flex:1,background:'#2b3139',border:'none',borderRadius:4,padding:'6px 0',fontSize:11,fontWeight:700,color:'#eaecef',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:4,fontFamily:'inherit'}}>
                Cross <ChevronDown size={10} style={{color:'#848e9c'}}/>
              </button>
              <button style={{flex:1,background:'#2b3139',border:'none',borderRadius:4,padding:'6px 0',fontSize:11,fontWeight:700,color:'#eaecef',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:4,fontFamily:'inherit'}}>
                {leverage}x <ChevronDown size={10} style={{color:'#848e9c'}}/>
              </button>
              <button style={{background:'#2b3139',border:'none',borderRadius:4,padding:'6px 8px',color:'#848e9c',cursor:'pointer',fontFamily:'inherit'}}>S</button>
            </div>

            {/* Order Type */}
            <div style={{display:'flex',padding:'0 8px',borderBottom:'1px solid #1e2329',flexShrink:0}}>
              {['Limit','Market','Conditional'].map(t => (
                <button key={t} className={`order-type-tab${orderType===t?' active':''}`} onClick={()=>setOrderType(t)}>{t}</button>
              ))}
            </div>

            {/* Trade Form */}
            <div style={{padding:'12px',display:'flex',flexDirection:'column',gap:10,flex:1,overflowY:'auto'}}>
              {/* Buy/Sell */}
              <div style={{display:'flex',gap:6}}>
                <button onClick={()=>setSide('buy')} style={{flex:1,padding:'9px 0',border:'none',borderRadius:4,fontSize:13,fontWeight:700,cursor:'pointer',background:side==='buy'?'#0ecb81':'#2b3139',color:side==='buy'?'#0b0e11':'#5e6673',fontFamily:'inherit',transition:'all .15s'}}>Buy/Long</button>
                <button onClick={()=>setSide('sell')} style={{flex:1,padding:'9px 0',border:'none',borderRadius:4,fontSize:13,fontWeight:700,cursor:'pointer',background:side==='sell'?'#f6465d':'#2b3139',color:side==='sell'?'#fff':'#5e6673',fontFamily:'inherit',transition:'all .15s'}}>Sell/Short</button>
              </div>

              {/* Available Balance */}
              <div style={{display:'flex',justifyContent:'space-between',fontSize:11}}>
                <span style={{color:'#5e6673'}}>Avbl</span>
                <span style={{color:'#eaecef',fontWeight:600}}>{(user?.balance||0).toFixed(2)} USDT</span>
              </div>

              {/* Price (Limit) */}
              {orderType==='Limit' && (
                <div>
                  <div style={{fontSize:10,color:'#5e6673',marginBottom:4}}>Price</div>
                  <div style={{display:'flex',alignItems:'center',gap:4}}>
                    <input className="fut-input" type="number" value={limitPrice} onChange={e=>setLimitPrice(e.target.value)} placeholder={currentPrice}/>
                    <span style={{color:'#848e9c',fontSize:11,minWidth:38}}>USDT</span>
                    <button style={{background:'#2b3139',border:'none',borderRadius:3,padding:'4px 8px',color:'#848e9c',fontSize:10,cursor:'pointer',fontFamily:'inherit'}}>BBO</button>
                  </div>
                </div>
              )}

              {/* Size */}
              <div>
                <div style={{fontSize:10,color:'#5e6673',marginBottom:4}}>Size</div>
                <input className="fut-input" type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.000"/>
              </div>

              {/* Quick % */}
              <div style={{display:'flex',gap:4}}>
                {[25,50,75,100].map(p => (
                  <button key={p} onClick={()=>setAmount(((user?.balance||0)*p/100).toFixed(2))}
                    style={{flex:1,padding:'4px 0',background:'#2b3139',border:'none',borderRadius:3,color:'#848e9c',fontSize:10,cursor:'pointer',fontFamily:'inherit'}}>
                    {p}%
                  </button>
                ))}
              </div>

              {/* Leverage Slider */}
              <div>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'#5e6673',marginBottom:6}}>
                  <span>Leverage</span><span style={{color:'#f0b90b',fontWeight:700}}>{leverage}x</span>
                </div>
                <div className="leverage-track" onClick={e=>{const r=e.currentTarget.getBoundingClientRect();setLeverage(Math.round(Math.max(1,Math.min(125,((e.clientX-r.left)/r.width)*125))));}}>
                  <div className="leverage-fill" style={{width:`${(leverage/125)*100}%`}}/>
                  <div className="leverage-thumb" style={{left:`${(leverage/125)*100}%`}}/>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',marginTop:6}}>
                  {[1,25,50,75,100].map(m => (
                    <span key={m} style={{fontSize:9,color:'#5e6673',cursor:'pointer'}} onClick={()=>setLeverage(m)}>{m}%</span>
                  ))}
                </div>
              </div>

              {/* TP/SL */}
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <div onClick={()=>setTpslEnabled(v=>!v)} style={{width:28,height:16,background:tpslEnabled?'#f0b90b':'#2b3139',borderRadius:8,position:'relative',cursor:'pointer',transition:'background .2s',flexShrink:0}}>
                  <div style={{width:12,height:12,background:'#fff',borderRadius:'50%',position:'absolute',top:2,left:tpslEnabled?14:2,transition:'left .2s',pointerEvents:'none'}}/>
                </div>
                <span style={{fontSize:11,color:'#848e9c',cursor:'pointer'}} onClick={()=>setTpslEnabled(v=>!v)}>TP/SL</span>
              </div>
              {tpslEnabled && (
                <div style={{display:'flex',gap:8}}>
                  <input className="fut-input" type="number" value={tpPrice} onChange={e=>setTpPrice(e.target.value)} placeholder="Take Profit" style={{flex:1}}/>
                  <input className="fut-input" type="number" value={slPrice} onChange={e=>setSlPrice(e.target.value)} placeholder="Stop Loss" style={{flex:1}}/>
                </div>
              )}

              {/* Cost/Max */}
              <div style={{fontSize:10,color:'#5e6673',display:'flex',justifyContent:'space-between',background:'#161a1e',borderRadius:4,padding:'6px 8px'}}>
                <span>Cost: <span style={{color:'#eaecef'}}>{amount?(parseFloat(amount)/leverage).toFixed(4):0} USDT</span></span>
                <span>Max: <span style={{color:'#eaecef'}}>{amount?(parseFloat(amount)*leverage).toFixed(2):0} {coin}</span></span>
              </div>

              {/* Trade Button */}
              <button onClick={handleTrade} disabled={loading||!amount||parseFloat(amount)<=0}
                style={{width:'100%',padding:'13px 0',border:'none',borderRadius:6,fontSize:14,fontWeight:700,
                  cursor:loading||!amount?'not-allowed':'pointer',
                  background:!amount||loading?'#2b3139':side==='buy'?'#0ecb81':'#f6465d',
                  color:!amount||loading?'#5e6673':side==='buy'?'#0b0e11':'#fff',
                  display:'flex',alignItems:'center',justifyContent:'center',gap:8,fontFamily:'inherit'}}>
                {loading ? <><Loader2 size={14} className="spin"/> Processing...</>
                  : side==='buy' ? <><TrendingUp size={14}/> Buy / Long</>
                  : <><TrendingDown size={14}/> Sell / Short</>}
              </button>

              {/* Liq Price info */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,fontSize:10}}>
                <div>
                  <div style={{color:'#5e6673'}}>Liq Price (Long)</div>
                  <div style={{color:'#eaecef'}}>
                    {currentPrice!=='0.00'&&amount
                      ? (parseFloat(currentPrice)*(1-1/leverage)).toFixed(2)+' USDT'
                      : '-- USDT'}
                  </div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{color:'#5e6673'}}>Liq Price (Short)</div>
                  <div style={{color:'#eaecef'}}>
                    {currentPrice!=='0.00'&&amount
                      ? (parseFloat(currentPrice)*(1+1/leverage)).toFixed(2)+' USDT'
                      : '-- USDT'}
                  </div>
                </div>
              </div>
            </div>

            {/* ACCOUNT PANEL */}
            <AccountPanel user={user} positions={positions}/>
          </div>
        </div>

        {/* BOTTOM TICKER */}
        <div className="bottom-ticker">
          <div className="ticker-scroll">
            {['BTCUSDT','ETHUSDT','BNBUSDT','SOLUSDT','XRPUSDT','DOGEUSDT','ADAUSDT','AVAXUSDT'].flatMap(s => [
              <span key={s} style={{color:'#5e6673',fontWeight:700,marginRight:8}}>{s}</span>,
              <span key={`${s}v`} style={{color:'#0ecb81',marginRight:16}}>+1.23%</span>,
            ])}
          </div>
        </div>
      </div>
    </>
  );
};

export default Futures;
