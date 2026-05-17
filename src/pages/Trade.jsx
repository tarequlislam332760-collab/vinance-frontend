import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import {
  Star, Bell, MoreHorizontal, ChevronDown, Search,
  Loader2, FileText, X, ExternalLink, Copy, Check,
  BarChart2, AlertTriangle, Info, Volume2, VolumeX,
  Maximize2, Share2, RefreshCw, TrendingUp
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const API_BASE = "https://vinance-backend-1.onrender.com";

/* ══ STYLES ══ */
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;600;700&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    .sp{font-family:'Roboto Mono',monospace;background:#0b0e11;color:#848e9c;min-height:100dvh;display:flex;flex-direction:column;font-size:12px;}
    /* HEADER */
    .sp-header{display:flex;align-items:center;gap:12px;padding:10px 14px;background:#0b0e11;border-bottom:1px solid #1e2329;flex-wrap:wrap;flex-shrink:0;}
    /* SECTION TABS */
    .sp-sec-tabs{display:flex;padding:0 10px;background:#0b0e11;border-bottom:1px solid #1e2329;overflow-x:auto;scrollbar-width:none;flex-shrink:0;}
    .sp-sec-tabs::-webkit-scrollbar{display:none;}
    .sp-sec-tab{padding:9px 14px 7px;font-size:13px;background:transparent;border:none;color:#848e9c;cursor:pointer;border-bottom:2px solid transparent;white-space:nowrap;font-family:inherit;transition:all .15s;}
    .sp-sec-tab.active{color:#eaecef;border-bottom-color:#f0b90b;font-weight:700;}
    /* MAIN LAYOUT */
    .sp-main{display:flex;flex:1;overflow:hidden;min-height:0;}
    .sp-left{width:260px;flex-shrink:0;border-right:1px solid #1e2329;display:flex;flex-direction:column;background:#0b0e11;overflow:hidden;}
    .sp-center{flex:1;display:flex;flex-direction:column;min-width:0;}
    .sp-right{width:360px;flex-shrink:0;border-left:1px solid #1e2329;display:flex;flex-direction:column;background:#0b0e11;overflow-y:auto;}
    /* TF BAR */
    .sp-tf-bar{display:flex;align-items:center;gap:2px;padding:5px 8px;background:#161a1e;border-bottom:1px solid #1e2329;overflow-x:auto;scrollbar-width:none;flex-shrink:0;}
    .sp-tf-bar::-webkit-scrollbar{display:none;}
    .sp-tf-btn{padding:4px 10px;font-size:11px;border-radius:3px;border:none;background:transparent;color:#848e9c;cursor:pointer;white-space:nowrap;font-family:inherit;transition:all .15s;}
    .sp-tf-btn.active{background:#2b3139;color:#eaecef;font-weight:700;}
    /* ORDER BOOK */
    .sp-ob-row{display:flex;justify-content:space-between;align-items:center;padding:2px 8px;position:relative;font-size:11px;cursor:pointer;}
    .sp-ob-row:hover{background:rgba(255,255,255,.03);}
    .sp-ob-depth{position:absolute;right:0;top:0;bottom:0;opacity:.12;pointer-events:none;}
    /* BOTTOM TABS — KEY FIX: nowrap + overflow-x:auto */
    .sp-pos-tabs{display:flex;padding:0 8px;border-bottom:1px solid #1e2329;overflow-x:auto;scrollbar-width:none;flex-shrink:0;white-space:nowrap;}
    .sp-pos-tabs::-webkit-scrollbar{display:none;}
    .sp-pos-tab{padding:9px 12px 7px;font-size:11px;background:transparent;border:none;border-bottom:2px solid transparent;color:#5e6673;cursor:pointer;white-space:nowrap;font-family:inherit;transition:all .15s;flex-shrink:0;}
    .sp-pos-tab.active{color:#eaecef;border-bottom-color:#f0b90b;font-weight:700;}
    /* INPUTS */
    .sp-input{width:100%;background:#2b3139;border:1px solid #2b3139;border-radius:4px;padding:10px 70px 10px 12px;color:#eaecef;font-size:13px;outline:none;transition:border .15s;font-family:inherit;}
    .sp-input:focus{border-color:#f0b90b;}
    .sp-input::placeholder{color:#5e6673;}
    .sp-input-wrap{position:relative;}
    .sp-input-sfx{position:absolute;right:10px;top:50%;transform:translateY(-50%);color:#848e9c;font-size:11px;font-weight:700;pointer-events:none;}
    .sp-ot-btn{padding:8px 14px;font-size:12px;border:none;background:transparent;cursor:pointer;color:#848e9c;border-bottom:2px solid transparent;font-family:inherit;transition:all .15s;}
    .sp-ot-btn.active{color:#eaecef;border-bottom-color:#f0b90b;font-weight:700;}
    .sp-pct-btn{flex:1;padding:4px 0;background:#2b3139;border:none;border-radius:2px;font-size:10px;color:#848e9c;cursor:pointer;font-family:inherit;transition:all .15s;}
    .sp-pct-btn:hover{color:#f0b90b;background:#333a44;}
    /* BUY/SELL BUTTONS */
    .sp-buy-btn{width:100%;padding:14px 0;border:none;border-radius:6px;background:#0ecb81;color:#fff;font-size:15px;font-weight:800;cursor:pointer;font-family:inherit;transition:background .15s;}
    .sp-buy-btn:hover:not(:disabled){background:#0fb574;}
    .sp-buy-btn:disabled{opacity:.45;cursor:not-allowed;}
    .sp-sell-btn{width:100%;padding:14px 0;border:none;border-radius:6px;background:#f6465d;color:#fff;font-size:15px;font-weight:800;cursor:pointer;font-family:inherit;transition:background .15s;}
    .sp-sell-btn:hover:not(:disabled){background:#e03d52;}
    .sp-sell-btn:disabled{opacity:.45;cursor:not-allowed;}
    /* PAIRS */
    .pair-row{display:flex;justify-content:space-between;align-items:center;padding:7px 12px;cursor:pointer;transition:background .1s;}
    .pair-row:hover{background:#161a1e;}
    .pair-row.active-pair{background:#1e2329;}
    /* ICON BUTTONS */
    .icon-btn{background:transparent;border:none;border-radius:6px;padding:6px 8px;cursor:pointer;display:flex;align-items:center;justify-content:center;position:relative;transition:all .15s;color:#848e9c;}
    .icon-btn:hover{background:#1e2329;color:#eaecef;}
    .icon-btn.active-icon{background:#1e2329;color:#f0b90b;}
    /* NOTIFICATION BADGE */
    .notif-badge{position:absolute;top:-2px;right:-2px;min-width:14px;height:14px;background:#f6465d;border-radius:50%;font-size:8px;font-weight:700;color:#fff;display:flex;align-items:center;justify-content:center;border:2px solid #0b0e11;padding:0 2px;}
    /* DROPDOWNS */
    .drop-overlay{position:fixed;inset:0;z-index:90;}
    .notif-drop{position:absolute;top:calc(100% + 8px);right:0;width:340px;background:#1e2329;border:1px solid #2b3139;border-radius:10px;box-shadow:0 8px 32px rgba(0,0,0,.85);z-index:99;overflow:hidden;}
    .notif-item{display:flex;gap:10px;padding:10px 14px;border-bottom:1px solid #2b313960;cursor:pointer;transition:background .15s;}
    .notif-item:hover{background:rgba(255,255,255,.03);}
    .notif-item.unread-n{background:#161a1e;}
    .threedot-drop{position:absolute;top:calc(100% + 8px);right:0;width:210px;background:#1e2329;border:1px solid #2b3139;border-radius:8px;box-shadow:0 8px 32px rgba(0,0,0,.85);z-index:99;overflow:hidden;}
    .td-item{display:flex;align-items:center;gap:10px;padding:10px 14px;font-size:12px;color:#848e9c;cursor:pointer;font-family:inherit;transition:all .15s;border:none;background:transparent;width:100%;text-align:left;}
    .td-item:hover{background:#2b3139;color:#eaecef;}
    /* ALERT MODAL */
    .modal-ov{position:fixed;inset:0;background:rgba(0,0,0,.78);z-index:200;display:flex;align-items:center;justify-content:center;}
    .modal-bx{background:#1e2329;border:1px solid #2b3139;border-radius:12px;width:420px;max-width:95vw;padding:24px;box-shadow:0 16px 64px rgba(0,0,0,.9);}
    /* SLIDER */
    .sl-track{width:100%;height:3px;background:#2b3139;border-radius:2px;position:relative;cursor:pointer;}
    .sl-fill{height:100%;border-radius:2px;transition:width .1s;}
    .sl-thumb{width:12px;height:12px;border-radius:50%;position:absolute;top:-4.5px;transform:translateX(-50%);cursor:pointer;box-shadow:0 0 0 2px #0b0e11;}
    /* TRADES */
    .trades-row{display:flex;justify-content:space-between;padding:3px 8px;font-size:11px;}
    .empty-st{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 0;gap:8px;color:#404854;font-size:11px;}
    /* ANIMATIONS */
    @keyframes spin{to{transform:rotate(360deg)}}
    .spin{animation:spin .8s linear infinite}
    @keyframes fG{0%{background:rgba(14,203,129,.18)}100%{background:transparent}}
    @keyframes fR{0%{background:rgba(246,70,93,.18)}100%{background:transparent}}
    .fg{animation:fG .4s ease-out}
    .fr{animation:fR .4s ease-out}
    @keyframes scrollLeft{from{transform:translateX(0)}to{transform:translateX(-50%)}}
    /* RESPONSIVE */
    @media(max-width:1200px){.sp-left{width:200px;}.sp-right{width:300px;}}
    @media(max-width:900px){.sp-left{display:none;}.sp-right{width:260px;}}
    @media(max-width:680px){
      .sp-main{flex-direction:column;overflow-y:auto;}
      .sp-right{width:100%;border-left:none;border-top:1px solid #1e2329;}
      .sp-header{padding:8px 10px;gap:8px;}
    }
    ::-webkit-scrollbar{width:3px;height:3px}
    ::-webkit-scrollbar-thumb{background:#2b3139}
    input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}
    input[type=number]{-moz-appearance:textfield}
  `}</style>
);

/* ══ NOTIFICATIONS ══ */
const NOTIFS = [
  { id:1, icon:'📈', color:'#0ecb81', title:'Price Alert Triggered', body:'BTC/USDT crossed your $80,000 alert.', time:'2m ago', read:false },
  { id:2, icon:'✅', color:'#0ecb81', title:'Buy Order Filled', body:'Your BTC market buy of $500 was filled at $80,547.', time:'8m ago', read:false },
  { id:3, icon:'💰', color:'#f0b90b', title:'Deposit Approved', body:'Your USDT deposit of $1,000 has been approved.', time:'1h ago', read:true },
  { id:4, icon:'⚠️', color:'#f6465d', title:'Low Balance Warning', body:'Your available balance is below $100.', time:'3h ago', read:true },
  { id:5, icon:'ℹ️', color:'#848e9c', title:'Market Volatility Alert', body:'High volatility detected in BTC/USDT.', time:'6h ago', read:true },
];

const NotifDropdown = ({ onClose, onReadAll }) => {
  const [notifs, setNotifs] = useState(NOTIFS);
  const [filter, setFilter] = useState('all');
  const unread = notifs.filter(n => !n.read).length;

  const markAll = () => { setNotifs(p => p.map(n => ({...n, read:true}))); onReadAll(); };
  const markOne = id => setNotifs(p => p.map(n => n.id===id ? {...n, read:true} : n));
  const del = (id, e) => { e.stopPropagation(); setNotifs(p => p.filter(n => n.id!==id)); };
  const list = filter==='unread' ? notifs.filter(n=>!n.read) : notifs;

  return (
    <>
      <div className="drop-overlay" onClick={onClose} />
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
        <div style={{maxHeight:300,overflowY:'auto'}}>
          {list.length===0 ? (
            <div style={{padding:24,textAlign:'center',color:'#5e6673',fontSize:12}}>
              <Bell size={24} style={{opacity:.2,margin:'0 auto 8px',display:'block'}}/>No {filter==='unread'?'unread':''} notifications
            </div>
          ) : list.map(n => (
            <div key={n.id} className={`notif-item${!n.read?' unread-n':''}`} onClick={()=>markOne(n.id)}>
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
          <button style={{background:'none',border:'none',color:'#f0b90b',fontSize:11,cursor:'pointer',fontFamily:'inherit'}}>View All Notifications →</button>
        </div>
      </div>
    </>
  );
};

/* ══ PRICE ALERT MODAL ══ */
const AlertModal = ({ coin, price, onClose }) => {
  const [ap, setAp] = useState('');
  const [type, setType] = useState('above');
  const [done, setDone] = useState(false);
  const submit = () => {
    if (!ap || parseFloat(ap)<=0) return toast.error('Enter a valid price');
    setDone(true);
    toast.success(`🔔 Alert set: ${coin}/USDT ${type} $${parseFloat(ap).toLocaleString()}`);
    setTimeout(onClose, 1200);
  };
  return (
    <div className="modal-ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-bx">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
          <span style={{color:'#eaecef',fontWeight:700,fontSize:15}}>🔔 Set Price Alert — {coin}/USDT</span>
          <button onClick={onClose} style={{background:'none',border:'none',color:'#848e9c',cursor:'pointer'}}><X size={16}/></button>
        </div>
        <div style={{marginBottom:14,fontSize:12,color:'#5e6673'}}>Current: <span style={{color:'#f0b90b',fontWeight:700}}>${parseFloat(price).toLocaleString(undefined,{minimumFractionDigits:2})}</span></div>
        <div style={{display:'flex',gap:8,marginBottom:14}}>
          {['above','below'].map(t => (
            <button key={t} onClick={()=>setType(t)} style={{flex:1,padding:'9px 0',border:`1px solid ${type===t?'#f0b90b':'#2b3139'}`,borderRadius:4,background:type===t?'rgba(240,185,11,.1)':'transparent',color:type===t?'#f0b90b':'#848e9c',fontWeight:type===t?700:400,cursor:'pointer',fontSize:12,fontFamily:'inherit',textTransform:'capitalize'}}>{t}</button>
          ))}
        </div>
        <div className="sp-input-wrap" style={{marginBottom:18}}>
          <input className="sp-input" type="number" placeholder="Alert Price" value={ap} onChange={e=>setAp(e.target.value)} style={{paddingRight:60}}/>
          <span className="sp-input-sfx">USDT</span>
        </div>
        <button onClick={submit} disabled={done} style={{width:'100%',padding:'12px 0',border:'none',borderRadius:6,background:'#f0b90b',color:'#0b0e11',fontWeight:800,fontSize:14,cursor:'pointer',fontFamily:'inherit'}}>
          {done ? '✓ Alert Set!' : 'Confirm Alert'}
        </button>
      </div>
    </div>
  );
};

/* ══ THREE DOT MENU ══ */
const ThreeDot = ({ coin, price, onClose, onAlert }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(()=>{setCopied(false);onClose();}, 800);
  };
  const items = [
    {icon:<ExternalLink size={13}/>, label:'Open in New Tab', fn:()=>{window.open(window.location.href,'_blank');onClose();}},
    {icon:copied?<Check size={13}/>:<Copy size={13}/>, label:copied?'Copied!':'Copy Chart Link', fn:copy},
    {icon:<Share2 size={13}/>, label:'Share', fn:()=>{if(navigator.share)navigator.share({title:`${coin}/USDT`,url:window.location.href});else copy();}},
    {divider:true},
    {icon:<AlertTriangle size={13}/>, label:'Set Price Alert', fn:()=>{onAlert();onClose();}},
    {icon:<BarChart2 size={13}/>, label:'View Full Chart', fn:()=>{window.open(`https://www.tradingview.com/chart/?symbol=BINANCE:${coin}USDT`,'_blank');onClose();}},
    {divider:true},
    {icon:<Info size={13}/>, label:'Market Info', fn:()=>{toast(`${coin}/USDT — Spot Trading | Price: $${parseFloat(price).toLocaleString()}`);onClose();}},
    {icon:<FileText size={13}/>, label:'Trading Guide', fn:()=>{window.open('https://www.binance.com/en/support/faq/spot-trading','_blank');onClose();}},
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

/* ══ ORDER BOOK ══ */
const OrderBook = ({ symbol, currentPrice, priceUp }) => {
  const [book, setBook] = useState({asks:[],bids:[]});
  const [trades, setTrades] = useState([]);
  const [view, setView] = useState('book');
  const wb = useRef(null), wt = useRef(null);

  useEffect(() => {
    const sym = `${symbol.toLowerCase()}usdt`;
    wb.current = new WebSocket(`wss://stream.binance.com:9443/ws/${sym}@depth10@500ms`);
    wb.current.onmessage = e => {
      const d = JSON.parse(e.data);
      setBook({asks:(d.a||[]).slice(0,12).reverse(), bids:(d.b||[]).slice(0,12)});
    };
    wt.current = new WebSocket(`wss://stream.binance.com:9443/ws/${sym}@trade`);
    wt.current.onmessage = e => {
      const d = JSON.parse(e.data);
      setTrades(p => [{price:parseFloat(d.p).toFixed(2),qty:parseFloat(d.q).toFixed(4),time:new Date(d.T).toTimeString().slice(0,8),isBuy:!d.m},...p].slice(0,40));
    };
    return () => {wb.current?.close(); wt.current?.close();};
  }, [symbol]);

  const maxA = book.asks.length ? Math.max(...book.asks.map(o=>parseFloat(o[1]))) : 1;
  const maxB = book.bids.length ? Math.max(...book.bids.map(o=>parseFloat(o[1]))) : 1;

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'6px 8px',borderBottom:'1px solid #1e2329',flexShrink:0}}>
        <div style={{display:'flex',gap:4}}>
          {['book','trades'].map(v => (
            <button key={v} onClick={()=>setView(v)} style={{background:view===v?'#2b3139':'transparent',border:'none',borderRadius:3,padding:'3px 8px',color:view===v?'#eaecef':'#5e6673',cursor:'pointer',fontSize:10,fontWeight:view===v?700:400,fontFamily:'inherit'}}>
              {v==='book'?'Order Book':'Market Trades'}
            </button>
          ))}
        </div>
        <MoreHorizontal size={13} style={{color:'#5e6673',cursor:'pointer'}}/>
      </div>

      {view==='book' ? <>
        <div style={{display:'flex',justifyContent:'space-between',padding:'4px 8px',fontSize:10,color:'#5e6673',flexShrink:0,fontWeight:600}}>
          <span>Price (USDT)</span><span>Amount ({symbol})</span><span>Total</span>
        </div>
        <div style={{flex:1,overflowY:'auto',scrollbarWidth:'none'}}>
          {book.asks.map((ask,i) => (
            <div key={i} className="sp-ob-row">
              <div className="sp-ob-depth" style={{width:`${(parseFloat(ask[1])/maxA)*100}%`,background:'#f6465d'}}/>
              <span style={{color:'#f6465d',fontWeight:600,zIndex:1}}>{parseFloat(ask[0]).toFixed(2)}</span>
              <span style={{color:'#c6cad2',zIndex:1}}>{parseFloat(ask[1]).toFixed(5)}</span>
              <span style={{color:'#848e9c',zIndex:1}}>{(parseFloat(ask[0])*parseFloat(ask[1])).toFixed(0)}</span>
            </div>
          ))}
        </div>
        <div style={{textAlign:'center',padding:'7px 8px',borderTop:'1px solid #1e2329',borderBottom:'1px solid #1e2329',flexShrink:0,background:priceUp?'rgba(14,203,129,.04)':'rgba(246,70,93,.04)'}}>
          <div style={{color:priceUp?'#0ecb81':'#f6465d',fontSize:16,fontWeight:800}}>{parseFloat(currentPrice||0).toLocaleString(undefined,{minimumFractionDigits:2})}</div>
          <div style={{fontSize:9,color:'#5e6673'}}>≈ ${parseFloat(currentPrice||0).toLocaleString(undefined,{minimumFractionDigits:2})}</div>
        </div>
        <div style={{flex:1,overflowY:'auto',scrollbarWidth:'none'}}>
          {book.bids.map((bid,i) => (
            <div key={i} className="sp-ob-row">
              <div className="sp-ob-depth" style={{width:`${(parseFloat(bid[1])/maxB)*100}%`,background:'#0ecb81'}}/>
              <span style={{color:'#0ecb81',fontWeight:600,zIndex:1}}>{parseFloat(bid[0]).toFixed(2)}</span>
              <span style={{color:'#c6cad2',zIndex:1}}>{parseFloat(bid[1]).toFixed(5)}</span>
              <span style={{color:'#848e9c',zIndex:1}}>{(parseFloat(bid[0])*parseFloat(bid[1])).toFixed(0)}</span>
            </div>
          ))}
        </div>
      </> : <>
        <div style={{display:'flex',justifyContent:'space-between',padding:'4px 8px',fontSize:10,color:'#5e6673',flexShrink:0,fontWeight:600}}>
          <span>Price (USDT)</span><span>Amount ({symbol})</span><span>Time</span>
        </div>
        <div style={{flex:1,overflowY:'auto',scrollbarWidth:'none'}}>
          {trades.map((t,i) => (
            <div key={i} className="trades-row">
              <span style={{color:t.isBuy?'#0ecb81':'#f6465d',fontWeight:600}}>{t.price}</span>
              <span style={{color:'#c6cad2'}}>{t.qty}</span>
              <span style={{color:'#5e6673'}}>{t.time}</span>
            </div>
          ))}
        </div>
      </>}

      {/* Pairs list */}
      <div style={{borderTop:'1px solid #1e2329',flexShrink:0}}>
        <div style={{padding:'6px 8px'}}>
          <div style={{display:'flex',alignItems:'center',gap:6,background:'#2b3139',borderRadius:4,padding:'5px 8px'}}>
            <Search size={11} style={{color:'#5e6673'}}/>
            <input type="text" placeholder="Search" style={{background:'transparent',border:'none',outline:'none',color:'#eaecef',fontSize:11,width:'100%',fontFamily:'inherit'}}/>
          </div>
        </div>
        <div style={{display:'flex',padding:'0 6px',borderBottom:'1px solid #1e2329',overflowX:'auto',scrollbarWidth:'none'}}>
          {['New','USDC','USDT','U','USD1'].map(t => (
            <button key={t} style={{padding:'5px 8px',fontSize:10,background:'transparent',border:'none',color:t==='USDT'?'#eaecef':'#5e6673',fontWeight:t==='USDT'?700:400,borderBottom:t==='USDT'?'2px solid #f0b90b':'2px solid transparent',cursor:'pointer',whiteSpace:'nowrap',fontFamily:'inherit'}}>{t}</button>
          ))}
        </div>
        <div style={{display:'flex',justifyContent:'space-between',padding:'4px 12px',fontSize:9,color:'#5e6673',fontWeight:600}}><span>Pair ↑</span><span>Last Price / 24h Chg ↑</span></div>
        <div style={{maxHeight:200,overflowY:'auto'}}>
          {[{s:'BTC',c:'+1.23'},{s:'ETH',c:'-0.87'},{s:'BNB',c:'+2.10'},{s:'SOL',c:'+3.45'},{s:'XRP',c:'-1.20'},{s:'ADA',c:'+0.67'},{s:'DOGE',c:'+5.32'},{s:'AVAX',c:'-2.11'},{s:'MATIC',c:'+1.89'},{s:'LTC',c:'+0.34'},{s:'LINK',c:'+4.21'},{s:'DOT',c:'-0.55'}].map(p => (
            <div key={p.s} className={`pair-row${symbol===p.s?' active-pair':''}`}>
              <div><div style={{color:'#eaecef',fontWeight:700,fontSize:11}}>{p.s}/USDT</div><div style={{color:'#5e6673',fontSize:10}}>5x</div></div>
              <div style={{textAlign:'right'}}><div style={{color:'#eaecef',fontSize:10}}>—</div><div style={{color:parseFloat(p.c)>=0?'#0ecb81':'#f6465d',fontSize:10,fontWeight:700}}>{p.c}%</div></div>
            </div>
          ))}
        </div>
        <div style={{borderTop:'1px solid #1e2329'}}>
          <div style={{padding:'5px 12px',display:'flex',alignItems:'center',gap:6}}>
            <span style={{color:'#eaecef',fontWeight:700,fontSize:11}}>Top Movers</span>
            <span style={{color:'#5e6673',fontSize:10,cursor:'pointer'}}>FAQ</span>
            <ChevronDown size={11} style={{color:'#5e6673',marginLeft:'auto'}}/>
          </div>
          {[{s:'DOGE',v:'+5.32'},{s:'LINK',v:'+4.21'},{s:'SOL',v:'+3.45'}].map(m => (
            <div key={m.s} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'5px 12px',fontSize:11}}>
              <span style={{color:'#eaecef',fontWeight:700}}>{m.s}/USDT</span>
              <span style={{color:'#0ecb81',fontWeight:700}}>{m.v}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ══ HISTORY TABLE ══ */
const HistoryTable = ({ token }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = () => {
    if (!token) return;
    setLoading(true);
    axios.get(`${API_BASE}/api/transactions`, {headers:{Authorization:`Bearer ${token}`}})
      .then(r => setData(r.data||[])).catch(()=>setData([])).finally(()=>setLoading(false));
  };
  useEffect(() => { load(); }, [token]);

  if (loading) return <div className="empty-st"><Loader2 size={16} className="spin" style={{color:'#f0b90b'}}/></div>;
  if (!data.length) return <div className="empty-st"><FileText size={28} style={{opacity:.15}}/><span>No history found.</span></div>;

  return (
    <div style={{overflowX:'auto'}}>
      <table style={{width:'100%',fontSize:11,borderCollapse:'collapse'}}>
        <thead>
          <tr style={{borderBottom:'1px solid #1e2329'}}>
            {['Date','Pair','Type','Amount','Status'].map(h => <th key={h} style={{padding:'6px 10px',color:'#5e6673',textAlign:'left',fontWeight:600,fontSize:10,whiteSpace:'nowrap'}}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map((t,i) => (
            <tr key={i} style={{borderBottom:'1px solid #1e232960'}}>
              <td style={{padding:'7px 10px',color:'#848e9c',whiteSpace:'nowrap'}}>{new Date(t.createdAt||t.date).toLocaleString()}</td>
              <td style={{padding:'7px 10px',color:'#eaecef',fontWeight:700}}>{(t.symbol||'USDT')}/USDT</td>
              <td style={{padding:'7px 10px',color:t.type?.includes('buy')?'#0ecb81':t.type?.includes('sell')?'#f6465d':'#f0b90b',fontWeight:700,textTransform:'uppercase',fontSize:10}}>{(t.type||'').replace('spot-','').replace('futures-','F-')}</td>
              <td style={{padding:'7px 10px',color:'#eaecef',fontFamily:'monospace'}}>${(t.amount||0).toFixed(2)}</td>
              <td style={{padding:'7px 10px'}}>
                <span style={{padding:'2px 8px',borderRadius:10,fontSize:10,fontWeight:700,background:t.status==='approved'||t.status==='completed'?'rgba(14,203,129,.1)':t.status==='rejected'?'rgba(246,70,93,.1)':'rgba(240,185,11,.1)',color:t.status==='approved'||t.status==='completed'?'#0ecb81':t.status==='rejected'?'#f6465d':'#f0b90b'}}>{t.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* ══ MAIN ══ */
const Trade = () => {
  const { coinSymbol } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser, token } = useContext(UserContext);
  const coin = (coinSymbol || 'BTC').toUpperCase();

  const [price, setPrice] = useState('0.00');
  const [priceUp, setPriceUp] = useState(true);
  const [flashCls, setFlashCls] = useState('');
  const [ticker, setTicker] = useState({changePct:'0.00',change:'0.00',high:'0',low:'0',volBase:'0',volUsdt:'0'});
  const prevRef = useRef(null);

  const [secTab, setSecTab] = useState('Chart');
  const [tf, setTf] = useState('1D');
  const [otBtn, setOtBtn] = useState('Market');
  const [posTab, setPosTab] = useState('open_orders');

  // Icon states
  const [starred, setStarred] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [showNotif, setShowNotif] = useState(false);
  const [showThreeDot, setShowThreeDot] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [unread, setUnread] = useState(2);

  // Trade form
  const [buyAmt, setBuyAmt] = useState('');
  const [sellAmt, setSellAmt] = useState('');
  const [buyPct, setBuyPct] = useState(0);
  const [sellPct, setSellPct] = useState(0);
  const [limitBuy, setLimitBuy] = useState('');
  const [limitSell, setLimitSell] = useState('');
  const [loading, setLoading] = useState(false);

  const tfMap = {'1s':'1','15m':'15','1H':'60','4H':'240','1D':'D','1W':'W'};

  useEffect(() => {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${coin.toLowerCase()}usdt@ticker`);
    ws.onmessage = e => {
      const d = JSON.parse(e.data);
      const p = parseFloat(d.c);
      const up = prevRef.current===null ? true : p>=prevRef.current;
      prevRef.current = p;
      setPriceUp(up); setFlashCls(up?'fg':'fr');
      setTimeout(()=>setFlashCls(''), 420);
      setPrice(p.toFixed(2));
      setTicker({changePct:parseFloat(d.P).toFixed(2),change:parseFloat(d.p).toFixed(2),high:parseFloat(d.h).toFixed(2),low:parseFloat(d.l).toFixed(2),volBase:parseFloat(d.v).toLocaleString(undefined,{maximumFractionDigits:2}),volUsdt:(parseFloat(d.q)/1e9).toFixed(2)+'B'});
    };
    ws.onerror = () => ws.close();
    return () => ws.close();
  }, [coin]);

  const playBeep = (type) => {
    if (!soundOn) return;
    try {
      const ctx = new (window.AudioContext||window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g); g.connect(ctx.destination);
      osc.frequency.value = type==='buy' ? 880 : 440;
      osc.type = 'sine';
      g.gain.setValueAtTime(0.08, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+0.25);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime+0.25);
    } catch {}
  };

  const handleTrade = async (side) => {
    const amt = parseFloat(side==='buy' ? buyAmt : sellAmt);
    if (!amt || amt<=0) return toast.error('Enter a valid amount');
    if (amt>(user?.balance||0)) return toast.error('Insufficient balance');
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/trade`, {type:side,amount:amt,symbol:coin}, {headers:{Authorization:`Bearer ${token}`}});
      toast.success(res.data.message || `${side==='buy'?'Buy':'Sell'} order placed!`);
      playBeep(side);
      if (side==='buy') {setBuyAmt('');setBuyPct(0);} else {setSellAmt('');setSellPct(0);}
      await refreshUser?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Trade failed');
    } finally { setLoading(false); }
  };

  const setPct = (side, pct) => {
    const val = ((user?.balance||0)*pct/100).toFixed(2);
    if (side==='buy') {setBuyAmt(val);setBuyPct(pct);} else {setSellAmt(val);setSellPct(pct);}
  };

  const dispPrice = parseFloat(price).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
  const chgNum = parseFloat(ticker.changePct);
  const chgColor = chgNum>=0 ? '#0ecb81' : '#f6465d';

  return (
    <>
      <Styles />
      {showAlert && <AlertModal coin={coin} price={price} onClose={()=>setShowAlert(false)}/>}

      <div className="sp">

        {/* ── HEADER ── */}
        <div className="sp-header">
          {/* Coin */}
          <div style={{display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
            <div style={{width:34,height:34,background:'#f0b90b',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,color:'#0b0e11',fontSize:14}}>{coin[0]}</div>
            <div>
              <div style={{display:'flex',alignItems:'center',gap:5}}>
                <span style={{color:'#eaecef',fontWeight:800,fontSize:18,letterSpacing:-0.5}}>{coin}/USDT</span>
                <span style={{color:'#5e6673',fontSize:11}}>Bitcoin Price</span>
                <ChevronDown size={13} style={{color:'#5e6673',cursor:'pointer'}}/>
              </div>
            </div>
          </div>

          {/* Price */}
          <div style={{flexShrink:0}}>
            <div className={flashCls} style={{color:priceUp?'#f6465d':'#0ecb81',fontSize:22,fontWeight:800,lineHeight:1}}>{dispPrice}</div>
            <div style={{display:'flex',gap:6,marginTop:3,fontSize:11}}>
              <span style={{color:'#848e9c'}}>${dispPrice}</span>
              <span style={{color:chgColor,fontWeight:600}}>{chgNum>=0?'+':''}{ticker.change} ({ticker.changePct}%)</span>
            </div>
          </div>

          {/* Stats */}
          <div style={{display:'flex',gap:16,flexWrap:'wrap',flex:1}}>
            {[['24h High',ticker.high],['24h Low',ticker.low],[`24h Vol(${coin})`,ticker.volBase],['24h Vol(USDT)',ticker.volUsdt]].map(([l,v]) => (
              <div key={l} style={{fontSize:11}}><div style={{color:'#5e6673'}}>{l}</div><div style={{color:'#eaecef',fontWeight:600}}>{v}</div></div>
            ))}
          </div>

          {/* ── ICONS ── */}
          <div style={{display:'flex',gap:2,alignItems:'center',flexShrink:0}}>

            {/* STAR */}
            <button
              className={`icon-btn${starred?' active-icon':''}`}
              title={starred?'Remove from watchlist':'Add to watchlist'}
              onClick={()=>{
                setStarred(v=>!v);
                toast(starred?`${coin}/USDT removed from watchlist`:`⭐ ${coin}/USDT added to watchlist`);
              }}
            >
              <Star size={18} style={starred?{fill:'#f0b90b',color:'#f0b90b'}:{}}/>
            </button>

            {/* SOUND */}
            <button
              className="icon-btn"
              title={soundOn?'Mute trade sounds':'Enable trade sounds'}
              onClick={()=>{
                setSoundOn(v=>!v);
                toast(soundOn?'🔇 Trade sounds muted':'🔊 Trade sounds enabled');
              }}
            >
              {soundOn ? <Volume2 size={17}/> : <VolumeX size={17} style={{color:'#f6465d'}}/>}
            </button>

            {/* BELL */}
            <div style={{position:'relative'}}>
              <button
                className={`icon-btn${showNotif?' active-icon':''}`}
                title="Notifications"
                onClick={()=>{setShowNotif(v=>!v);setShowThreeDot(false);}}
              >
                <Bell size={18} style={{color:showNotif?'#f0b90b':'#848e9c'}}/>
                {unread>0 && <span className="notif-badge">{unread}</span>}
              </button>
              {showNotif && (
                <NotifDropdown
                  onClose={()=>setShowNotif(false)}
                  onReadAll={()=>setUnread(0)}
                />
              )}
            </div>

            {/* THREE DOT */}
            <div style={{position:'relative'}}>
              <button
                className={`icon-btn${showThreeDot?' active-icon':''}`}
                title="More options"
                onClick={()=>{setShowThreeDot(v=>!v);setShowNotif(false);}}
              >
                <MoreHorizontal size={18} style={{color:showThreeDot?'#f0b90b':'#848e9c'}}/>
              </button>
              {showThreeDot && (
                <ThreeDot
                  coin={coin} price={price}
                  onClose={()=>setShowThreeDot(false)}
                  onAlert={()=>setShowAlert(true)}
                />
              )}
            </div>
          </div>
        </div>

        {/* ── SECTION TABS ── */}
        <div className="sp-sec-tabs">
          {['Chart','Info','Trading Data','Trading Analysis','Square'].map(t => (
            <button key={t} className={`sp-sec-tab${secTab===t?' active':''}`} onClick={()=>setSecTab(t)}>{t}</button>
          ))}
        </div>

        {/* ── MAIN ── */}
        <div className="sp-main">

          {/* LEFT */}
          <div className="sp-left">
            <OrderBook symbol={coin} currentPrice={price} priceUp={priceUp}/>
          </div>

          {/* CENTER */}
          <div className="sp-center">
            <div className="sp-tf-bar">
              {['1s','15m','1H','4H','1D','1W'].map(t => (
                <button key={t} className={`sp-tf-btn${tf===t?' active':''}`} onClick={()=>setTf(t)}>{t}</button>
              ))}
              <span style={{color:'#848e9c',fontSize:11,marginLeft:6}}>Depth</span>
              <div style={{marginLeft:'auto',display:'flex',gap:10,alignItems:'center'}}>
                <span style={{fontSize:11,color:'#f0b90b',cursor:'pointer'}}>Original</span>
                <span style={{fontSize:11,color:'#848e9c',cursor:'pointer'}}>Trading View</span>
                <button onClick={()=>window.open(`https://www.tradingview.com/chart/?symbol=BINANCE:${coin}USDT`,'_blank')} style={{background:'none',border:'none',cursor:'pointer',color:'#5e6673',display:'flex'}} title="Fullscreen">
                  <Maximize2 size={13}/>
                </button>
              </div>
            </div>

            {/* Chart area */}
            <div style={{flex:1,minHeight:0,position:'relative',background:'#0b0e11'}}>
              {secTab==='Chart' && (
                <iframe key={`${coin}-${tf}`} title="chart"
                  src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${coin}USDT&interval=${tfMap[tf]||'D'}&theme=dark&style=1&timezone=Etc%2FUTC&hide_top_toolbar=0&allow_symbol_change=0&locale=en&withdateranges=1`}
                  style={{position:'absolute',inset:0,width:'100%',height:'100%',border:'none',minHeight:380}}/>
              )}
              {secTab==='Info' && (
                <div style={{padding:20,lineHeight:1.9,fontSize:12,overflowY:'auto',height:'100%'}}>
                  <h3 style={{color:'#eaecef',marginBottom:12,fontSize:15}}>{coin}/USDT Information</h3>
                  {[['Network','BTC (5)'],['Token Tags','Payments | PoW | Layer 1'],['Market Cap','$1.58T'],['Circulating Supply','19.7M BTC'],['Max Supply','21M BTC'],['All-Time High','$108,786'],['Current Price',`$${dispPrice}`],['24h Change',`${chgNum>=0?'+':''}${ticker.changePct}%`]].map(([k,v]) => (
                    <div key={k} style={{display:'flex',gap:16,padding:'6px 0',borderBottom:'1px solid #1e2329'}}>
                      <span style={{color:'#5e6673',minWidth:160}}>{k}</span>
                      <span style={{color:'#eaecef',fontWeight:600}}>{v}</span>
                    </div>
                  ))}
                </div>
              )}
              {secTab==='Trading Data' && (
                <div style={{padding:20,fontSize:12,overflowY:'auto',height:'100%'}}>
                  <h3 style={{color:'#eaecef',marginBottom:12,fontSize:15}}>Trading Data — {coin}/USDT</h3>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px 24px',marginBottom:16}}>
                    {[['Current Price',`$${dispPrice}`],['24h High',`$${ticker.high}`],['24h Low',`$${ticker.low}`],['24h Vol (BTC)',ticker.volBase],['24h Vol (USDT)',ticker.volUsdt],['Price Change',`${chgNum>=0?'+':''}${ticker.changePct}%`]].map(([k,v]) => (
                      <div key={k} style={{padding:'8px 0',borderBottom:'1px solid #1e2329'}}>
                        <div style={{color:'#5e6673',fontSize:10,marginBottom:4}}>{k}</div>
                        <div style={{color:'#eaecef',fontWeight:700,fontSize:14}}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{marginTop:14}}>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:5}}>
                      <span style={{color:'#0ecb81',fontWeight:700}}>B 44.13%</span>
                      <span style={{color:'#f6465d',fontWeight:700}}>S 55.87%</span>
                    </div>
                    <div style={{height:6,borderRadius:3,overflow:'hidden',display:'flex'}}>
                      <div style={{width:'44.13%',background:'#0ecb81'}}/><div style={{flex:1,background:'#f6465d'}}/>
                    </div>
                  </div>
                </div>
              )}
              {secTab==='Trading Analysis' && (
                <div style={{padding:20,fontSize:12,overflowY:'auto',height:'100%'}}>
                  <h3 style={{color:'#eaecef',marginBottom:12}}>Technical Analysis — {coin}/USDT</h3>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                    {[['RSI (14)','58.4','#f0b90b'],['MACD','Bullish','#0ecb81'],['Moving Avg (50)','Above','#0ecb81'],['Bollinger Bands','Upper band','#f0b90b'],['Volume','Above avg','#0ecb81'],['Trend','Uptrend','#0ecb81']].map(([k,v,c]) => (
                      <div key={k} style={{background:'#161a1e',borderRadius:6,padding:'10px 12px',border:'1px solid #1e2329'}}>
                        <div style={{color:'#5e6673',fontSize:10,marginBottom:4}}>{k}</div>
                        <div style={{color:c,fontWeight:700,fontSize:13}}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {secTab==='Square' && (
                <div style={{padding:20,fontSize:12,overflowY:'auto',height:'100%'}}>
                  <h3 style={{color:'#eaecef',marginBottom:12}}>Square — Community</h3>
                  {[{u:'CryptoTrader99',m:`BTC looking strong above $80k. Watch for breakout to $85k.`,t:'5m',up:true},{u:'WhaleFinder',m:`Large wallet moved 500 BTC to exchange. Possible sell-off.`,t:'12m',up:false},{u:'AnalystPro',m:`${coin}/USDT daily candle closed bullish. RSI not overbought.`,t:'28m',up:true}].map((p,i) => (
                    <div key={i} style={{background:'#161a1e',borderRadius:6,padding:'12px 14px',marginBottom:10,border:'1px solid #1e2329'}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                        <span style={{color:'#f0b90b',fontWeight:700,fontSize:12}}>{p.u}</span>
                        <span style={{color:'#5e6673',fontSize:10}}>{p.t} ago</span>
                      </div>
                      <p style={{color:'#c6cad2',fontSize:12,lineHeight:1.5}}>{p.m}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── BOTTOM TABS ── */}
            <div style={{height:260,display:'flex',flexDirection:'column',borderTop:'1px solid #1e2329'}}>
              {/* KEY FIX: scrollable tabs so all labels visible */}
              <div className="sp-pos-tabs">
                {[
                  {k:'open_orders', l:'Open Orders(0)'},
                  {k:'order_history', l:'Order History'},
                  {k:'trade_history', l:'Trade History'},
                  {k:'holdings', l:'Holdings'},
                  {k:'bots', l:'Bots'},
                ].map(t => (
                  <button key={t.k} className={`sp-pos-tab${posTab===t.k?' active':''}`} onClick={()=>setPosTab(t.k)}>{t.l}</button>
                ))}
                <button style={{marginLeft:'auto',fontSize:10,color:'#5e6673',background:'none',border:'none',cursor:'pointer',padding:'0 8px',flexShrink:0,fontFamily:'inherit'}}
                  onClick={()=>toast('Filter applied')}>
                  Hide Other Pairs
                </button>
              </div>

              <div style={{flex:1,overflowY:'auto'}}>
                {posTab==='open_orders' && (
                  <div className="empty-st">
                    <FileText size={28} style={{opacity:.15}}/>
                    <span>You have no open orders.</span>
                  </div>
                )}
                {posTab==='order_history' && <HistoryTable token={token}/>}
                {posTab==='trade_history' && <HistoryTable token={token}/>}
                {posTab==='holdings' && (
                  <div style={{padding:16,fontSize:12}}>
                    <div style={{marginBottom:10,color:'#5e6673',fontSize:11}}>Your asset holdings:</div>
                    {[
                      ['USDT Balance', `${(user?.balance||0).toFixed(8)} USDT`, '#0ecb81'],
                      [`${coin} Balance`, `0.00000000 ${coin}`, '#eaecef'],
                      ['Total Value (USDT)', `$${(user?.balance||0).toFixed(2)}`, '#f0b90b'],
                    ].map(([l,v,c]) => (
                      <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #1e2329'}}>
                        <span style={{color:'#5e6673'}}>{l}</span>
                        <span style={{color:c,fontWeight:700}}>{v}</span>
                      </div>
                    ))}
                  </div>
                )}
                {posTab==='bots' && (
                  <div className="empty-st">
                    <TrendingUp size={28} style={{opacity:.15}}/>
                    <span>No active trading bots.</span>
                    <button onClick={()=>toast('Bot creation coming soon')} style={{marginTop:8,padding:'6px 14px',background:'#2b3139',border:'none',borderRadius:4,color:'#eaecef',fontSize:11,cursor:'pointer',fontFamily:'inherit'}}>Create Bot</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Trade Form */}
          <div className="sp-right">
            <div style={{display:'flex',padding:'0 10px',borderBottom:'1px solid #1e2329',overflowX:'auto',scrollbarWidth:'none'}}>
              {['Spot','Cross','Isolated','Grid'].map(t => (
                <button key={t} style={{padding:'9px 10px 7px',fontSize:12,background:'transparent',border:'none',color:t==='Spot'?'#eaecef':'#848e9c',fontWeight:t==='Spot'?700:400,borderBottom:t==='Spot'?'2px solid #f0b90b':'2px solid transparent',cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap'}}>{t}</button>
              ))}
              <span style={{marginLeft:'auto',fontSize:11,color:'#848e9c',alignSelf:'center',paddingRight:4,cursor:'pointer',whiteSpace:'nowrap'}} onClick={()=>toast('Fee level settings')}>% Fee Level</span>
            </div>
            <div style={{display:'flex',padding:'0 8px',borderBottom:'1px solid #1e2329'}}>
              {['Limit','Market','Stop Limit'].map(t => (
                <button key={t} className={`sp-ot-btn${otBtn===t?' active':''}`} onClick={()=>setOtBtn(t)}>{t}</button>
              ))}
            </div>

            <div style={{display:'flex',flex:1}}>
              {/* BUY */}
              <div style={{flex:1,padding:'14px 12px',display:'flex',flexDirection:'column',gap:10,borderRight:'1px solid #1e2329'}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'#5e6673'}}>
                  <span>Avbl</span>
                  <span style={{color:'#eaecef',fontWeight:700}}>{(user?.balance||0).toFixed(2)} USDT <span style={{color:'#f0b90b',cursor:'pointer'}} onClick={()=>navigate('/wallet')}>+</span></span>
                </div>
                {otBtn==='Limit' && (
                  <div className="sp-input-wrap">
                    <input className="sp-input" type="number" placeholder="Price" value={limitBuy} onChange={e=>setLimitBuy(e.target.value)}/>
                    <span className="sp-input-sfx">USDT</span>
                  </div>
                )}
                {(otBtn==='Market'||otBtn==='Stop Limit') && (
                  <div style={{background:'#2b3139',borderRadius:4,padding:'9px 12px',display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:11}}>
                    <span style={{color:'#5e6673'}}>Price</span>
                    <span style={{color:'#848e9c'}}>Market Price</span>
                    <span style={{color:'#848e9c'}}>USDT</span>
                  </div>
                )}
                <div className="sp-input-wrap">
                  <input className="sp-input" type="number" placeholder="Total" value={buyAmt} onChange={e=>setBuyAmt(e.target.value)}/>
                  <span className="sp-input-sfx">USDT <ChevronDown size={9} style={{display:'inline'}}/></span>
                </div>
                <div>
                  <div className="sl-track" onClick={e=>{const r=e.currentTarget.getBoundingClientRect();const p=Math.round(((e.clientX-r.left)/r.width)*100/25)*25;setPct('buy',Math.min(100,Math.max(0,p)));}}>
                    <div className="sl-fill" style={{width:`${buyPct}%`,background:'#0ecb81'}}/>
                    <div className="sl-thumb" style={{left:`${buyPct}%`,background:'#0ecb81'}}/>
                  </div>
                  <div style={{display:'flex',gap:3,marginTop:7}}>
                    {[0,25,50,75,100].map(p => <button key={p} className="sp-pct-btn" onClick={()=>setPct('buy',p)}>{p}%</button>)}
                  </div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <input type="checkbox" style={{accentColor:'#f0b90b'}}/>
                  <span style={{fontSize:10,color:'#848e9c'}}>Slippage Tolerance</span>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:3,fontSize:10,color:'#5e6673'}}>
                  <div style={{display:'flex',justifyContent:'space-between'}}><span>Max Buy</span><span style={{color:'#eaecef'}}>{price!=='0.00'&&buyAmt?(parseFloat(buyAmt)/parseFloat(price)).toFixed(6):'0'} {coin}</span></div>
                  <div style={{display:'flex',justifyContent:'space-between'}}><span>Est. Fee</span><span style={{color:'#eaecef'}}>{buyAmt?(parseFloat(buyAmt)*0.001).toFixed(4):'--'} USDT</span></div>
                </div>
                <button className="sp-buy-btn" disabled={loading||!buyAmt||parseFloat(buyAmt)<=0} onClick={()=>handleTrade('buy')}>
                  {loading ? <Loader2 size={16} className="spin" style={{margin:'0 auto',display:'block'}}/> : `Buy ${coin}`}
                </button>
              </div>

              {/* SELL */}
              <div style={{flex:1,padding:'14px 12px',display:'flex',flexDirection:'column',gap:10}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'#5e6673'}}>
                  <span>Avbl</span>
                  <span style={{color:'#eaecef',fontWeight:700}}>0.000 {coin} <span style={{color:'#f0b90b',cursor:'pointer'}} onClick={()=>navigate('/wallet')}>+</span></span>
                </div>
                {otBtn==='Limit' && (
                  <div className="sp-input-wrap">
                    <input className="sp-input" type="number" placeholder="Price" value={limitSell} onChange={e=>setLimitSell(e.target.value)}/>
                    <span className="sp-input-sfx">USDT</span>
                  </div>
                )}
                {(otBtn==='Market'||otBtn==='Stop Limit') && (
                  <div style={{background:'#2b3139',borderRadius:4,padding:'9px 12px',display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:11}}>
                    <span style={{color:'#5e6673'}}>Price</span>
                    <span style={{color:'#848e9c'}}>Market Price</span>
                    <span style={{color:'#848e9c'}}>USDT</span>
                  </div>
                )}
                <div className="sp-input-wrap">
                  <input className="sp-input" type="number" placeholder="Amount" value={sellAmt} onChange={e=>setSellAmt(e.target.value)}/>
                  <span className="sp-input-sfx">{coin} <ChevronDown size={9} style={{display:'inline'}}/></span>
                </div>
                <div>
                  <div className="sl-track" onClick={e=>{const r=e.currentTarget.getBoundingClientRect();const p=Math.round(((e.clientX-r.left)/r.width)*100/25)*25;setPct('sell',Math.min(100,Math.max(0,p)));}}>
                    <div className="sl-fill" style={{width:`${sellPct}%`,background:'#f6465d'}}/>
                    <div className="sl-thumb" style={{left:`${sellPct}%`,background:'#f6465d'}}/>
                  </div>
                  <div style={{display:'flex',gap:3,marginTop:7}}>
                    {[0,25,50,75,100].map(p => <button key={p} className="sp-pct-btn" onClick={()=>setPct('sell',p)}>{p}%</button>)}
                  </div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <input type="checkbox" style={{accentColor:'#f0b90b'}}/>
                  <span style={{fontSize:10,color:'#848e9c'}}>Slippage Tolerance</span>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:3,fontSize:10,color:'#5e6673'}}>
                  <div style={{display:'flex',justifyContent:'space-between'}}><span>Max Sell</span><span style={{color:'#eaecef'}}>0 USDT</span></div>
                  <div style={{display:'flex',justifyContent:'space-between'}}><span>Est. Fee</span><span style={{color:'#eaecef'}}>{sellAmt?(parseFloat(sellAmt)*0.001).toFixed(4):'--'} USDT</span></div>
                </div>
                <button className="sp-sell-btn" disabled={loading||!sellAmt||parseFloat(sellAmt)<=0} onClick={()=>handleTrade('sell')}>
                  {loading ? <Loader2 size={16} className="spin" style={{margin:'0 auto',display:'block'}}/> : `Sell ${coin}`}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM TICKER */}
        <div style={{display:'flex',padding:'5px 12px',background:'#0b0e11',borderTop:'1px solid #1e2329',fontSize:10,overflow:'hidden',flexShrink:0}}>
          <div style={{display:'flex',gap:20,animation:'scrollLeft 60s linear infinite',whiteSpace:'nowrap'}}>
            {['BTC','ETH','BNB','SOL','XRP','DOGE','ADA','AVAX','MATIC','LTC'].map(s => (
              <span key={s}><span style={{color:'#5e6673',fontWeight:700}}>{s}/USDT</span> <span style={{color:'#0ecb81'}}>+1.23%</span></span>
            ))}
          </div>
          <div style={{marginLeft:'auto',display:'flex',gap:12,color:'#5e6673',flexShrink:0}}>
            <span style={{cursor:'pointer'}} onClick={()=>toast('Announcements: No new announcements')}>Announcements</span>
            <span style={{cursor:'pointer'}} onClick={()=>toast('Cookie preferences saved')}>Cookie Preference</span>
            <span style={{cursor:'pointer'}} onClick={()=>toast('Support: support@vinance.com')}>Online Support</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Trade;
