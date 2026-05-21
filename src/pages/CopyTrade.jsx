import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import {
  X, ChevronDown, ChevronUp, Zap, Star, Users, Clock,
  MoreHorizontal, Plus, ChevronRight, Copy, Loader2,
  Eye, EyeOff, Edit, Trash2, Info, ArrowLeft
} from 'lucide-react';

const API_URL = 'https://vinance-backend-1.onrender.com';

const FAQ_ITEMS = [
  { q: 'What Is Copy Trading?', a: 'Copy trading lets you replicate trades of experienced traders automatically. When a lead trader opens or closes a position, the same action is executed proportionally in your account.' },
  { q: 'How does copy trading work?', a: "Select a lead trader and allocate funds. Every time they trade, it's automatically replicated in your portfolio proportionally to your allocated amount." },
  { q: 'What is the portfolio maximum drawdown?', a: 'Maximum drawdown measures the largest peak-to-trough decline in portfolio value. A lower drawdown indicates better risk management by the lead trader.' },
  { q: 'What is Portfolio Sharpe Ratio?', a: 'Sharpe Ratio measures risk-adjusted return. Higher = better returns relative to risk. Formula: (return − risk-free rate) / standard deviation.' },
  { q: 'What is portfolio AUM?', a: 'AUM = Assets Under Management — total market value of all funds managed by a lead trader through copy trading.' },
  { q: "What's the benefit for lead traders?", a: 'Lead traders earn profit-share commission from copiers, typically 8–10%. More followers + better performance = higher earnings.' },
];

/* ── Copy Modal ── */
const CopyModal = ({ trader, user, onClose }) => {
  const [amount,  setAmount]  = useState('');
  const [loading, setLoading] = useState(false);

  const handleCopy = async () => {
    if (!amount || parseFloat(amount) <= 0) return alert('Enter a valid amount');
    if (parseFloat(amount) < 10)             return alert('Minimum copy amount is $10');
    if (parseFloat(amount) > (user?.balance || 0)) return alert('Insufficient balance');
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    alert(`Successfully copying ${trader.name}! $${amount} allocated.`);
    onClose();
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.85)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background:'#1e2329', border:'1px solid #2b3139', borderRadius:20, width:'100%', maxWidth:420, padding:24 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <div>
            <h3 style={{ color:'#eaecef', fontWeight:700, fontSize:16 }}>Copy {trader.name}</h3>
            <p style={{ color:'#848e9c', fontSize:12, marginTop:2 }}>Set your copy amount</p>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'#848e9c', cursor:'pointer' }}><X size={20}/></button>
        </div>

        <div style={{ background:'#0b0e11', borderRadius:10, padding:14, marginBottom:16, display:'flex', flexDirection:'column', gap:8 }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
            <span style={{ color:'#848e9c' }}>Available Balance</span>
            <span style={{ color:'#eaecef', fontWeight:700 }}>${(user?.balance||0).toFixed(2)} USDT</span>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
            <span style={{ color:'#848e9c' }}>Min Copy Amount</span>
            <span style={{ color:'#eaecef' }}>$10 USDT</span>
          </div>
        </div>

        <label style={{ fontSize:12, color:'#848e9c', display:'block', marginBottom:6 }}>Copy Amount (USDT)</label>
        <div style={{ display:'flex', alignItems:'center', background:'#0b0e11', border:'1px solid #2b3139', borderRadius:10, padding:'11px 14px', marginBottom:12 }}>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Min $10"
            style={{ flex:1, background:'transparent', border:'none', outline:'none', color:'#eaecef', fontSize:16, fontWeight:700, fontFamily:'inherit' }}/>
          <span style={{ color:'#848e9c', fontWeight:600, fontSize:13 }}>USDT</span>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6, marginBottom:14 }}>
          {[25,50,75,100].map(pct => (
            <button key={pct} onClick={() => setAmount(((user?.balance||0)*(pct/100)).toFixed(2))}
              style={{ padding:'7px 0', background:'#2b3139', border:'none', borderRadius:8, color:'#848e9c', fontSize:12, cursor:'pointer', fontFamily:'inherit', transition:'all .15s' }}
              onMouseEnter={e => e.target.style.color='#eaecef'}
              onMouseLeave={e => e.target.style.color='#848e9c'}>
              {pct}%
            </button>
          ))}
        </div>

        <div style={{ background:'rgba(240,185,11,.05)', border:'1px solid rgba(240,185,11,.2)', borderRadius:8, padding:12, marginBottom:16, fontSize:12, color:'#848e9c', display:'flex', gap:8 }}>
          <Info size={14} style={{ color:'#f0b90b', flexShrink:0, marginTop:1 }}/>
          <span>Your trades will automatically mirror this trader's positions proportionally to your copy amount.</span>
        </div>

        <button onClick={handleCopy} disabled={loading}
          style={{ width:'100%', padding:'13px 0', background:loading?'#2b3139':'#f0b90b', border:'none', borderRadius:12, color:loading?'#5e6673':'#0b0e11', fontWeight:700, fontSize:14, cursor:loading?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'all .15s', fontFamily:'inherit' }}>
          {loading ? <><Loader2 size={16} style={{ animation:'spin 1s linear infinite' }}/> Processing...</> : <><Copy size={15}/> Start Copying</>}
        </button>
      </div>
    </div>
  );
};

/* ── Trader Card ── */
const TraderCard = ({ trader, user, onDelete, onCopy }) => {
  const pnl    = trader.pnl    || (Math.random()*500+50).toFixed(2);
  const roi    = trader.roi    || (Math.random()*80+10).toFixed(2);
  const aum    = trader.aum    || (Math.random()*50000+5000).toFixed(0);
  const days   = trader.days   || Math.floor(Math.random()*200+30);
  const follow = trader.followers    || Math.floor(Math.random()*400+50);
  const maxF   = trader.maxFollowers || 500;
  const badges = ['Master','Legend','Elite'];
  const badge  = badges[trader.name?.charCodeAt(0)%3 || 0];
  const badgeStyle = {
    Master: { bg:'rgba(240,185,11,.12)', color:'#f0b90b', border:'1px solid rgba(240,185,11,.3)' },
    Legend: { bg:'rgba(14,203,129,.12)', color:'#0ecb81', border:'1px solid rgba(14,203,129,.3)' },
    Elite:  { bg:'rgba(155,88,240,.12)', color:'#9b58f0', border:'1px solid rgba(155,88,240,.3)' },
  }[badge];
  const sparkData = [30,50,40,70,55,80,60,90,75,95];

  return (
    <div style={{ background:'#161a1e', border:'1px solid #1e2329', borderRadius:16, padding:16, position:'relative', transition:'all .2s', cursor:'default' }}
      onMouseEnter={e => e.currentTarget.style.borderColor='#2b3139'}
      onMouseLeave={e => e.currentTarget.style.borderColor='#1e2329'}>

      {/* Admin buttons */}
      {user?.role === 'admin' && (
        <div style={{ position:'absolute', top:10, right:10, display:'flex', gap:6, zIndex:10 }}>
          <button onClick={() => {}} style={{ padding:'5px 10px', background:'rgba(99,126,234,.1)', border:'1px solid rgba(99,126,234,.3)', borderRadius:8, color:'#627eea', fontSize:11, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:4, fontFamily:'inherit' }}>
            <Edit size={11}/> Edit
          </button>
          <button onClick={() => onDelete(trader._id)} style={{ padding:'5px 10px', background:'rgba(246,70,93,.1)', border:'1px solid rgba(246,70,93,.3)', borderRadius:8, color:'#f6465d', fontSize:11, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:4, fontFamily:'inherit' }}>
            <Trash2 size={11}/> Del
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
        <div style={{ width:46, height:46, borderRadius:'50%', background:`hsl(${trader.name?.charCodeAt(0)*30||0},55%,42%)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, fontWeight:800, flexShrink:0, overflow:'hidden', border:'2px solid #2b3139' }}>
          {trader.image||trader.img||trader.avatar
            ? <img src={trader.image||trader.img||trader.avatar} alt={trader.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
            : trader.name?.[0]?.toUpperCase()||'T'}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3, flexWrap:'wrap' }}>
            <span style={{ fontWeight:700, fontSize:14, color:'#eaecef', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{trader.name||'Unknown'}</span>
            <span style={{ padding:'2px 8px', borderRadius:4, fontSize:10, fontWeight:700, background:badgeStyle.bg, color:badgeStyle.color, border:badgeStyle.border, flexShrink:0 }}>{badge}</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:11, color:'#848e9c', flexWrap:'wrap' }}>
            <span style={{ display:'flex', alignItems:'center', gap:3 }}><Users size={10}/> {follow}/{maxF}</span>
            <span style={{ display:'flex', alignItems:'center', gap:3 }}><Clock size={10}/> {days}d</span>
            {trader.isApiEnabled !== false && <span style={{ background:'rgba(14,203,129,.1)', color:'#0ecb81', padding:'1px 5px', borderRadius:3, fontSize:9, fontWeight:700 }}>API</span>}
          </div>
        </div>
        <button style={{ background:'none', border:'none', cursor:'pointer', color:'#5e6673', flexShrink:0, padding:2 }}>
          <Star size={15}/>
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6, marginBottom:12 }}>
        {[
          { label:'30D PNL', value:`+$${parseFloat(pnl).toFixed(2)}`, color:'#0ecb81' },
          { label:'ROI',     value:`+${parseFloat(roi).toFixed(1)}%`, color:'#0ecb81' },
          { label:'AUM',     value:`$${(parseInt(aum)/1000).toFixed(0)}K`, color:'#eaecef' },
        ].map(s => (
          <div key={s.label} style={{ background:'#0b0e11', borderRadius:8, padding:'8px 10px' }}>
            <div style={{ fontSize:9, color:'#848e9c', marginBottom:3, textTransform:'uppercase' }}>{s.label}</div>
            <div style={{ fontSize:13, fontWeight:700, color:s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Sparkline */}
      <div style={{ marginBottom:12 }}>
        <div style={{ fontSize:10, color:'#5e6673', marginBottom:5 }}>30 Days PNL Trend</div>
        <div style={{ display:'flex', alignItems:'flex-end', gap:2, height:30 }}>
          {sparkData.map((h,i) => (
            <div key={i} style={{ flex:1, borderRadius:1, background:'#0ecb81', opacity:0.4+(i*0.06), height:`${h}%` }}/>
          ))}
        </div>
      </div>

      <button onClick={() => onCopy(trader)}
        style={{ width:'100%', padding:'10px 0', background:'#f0b90b', color:'#0b0e11', border:'none', borderRadius:10, fontWeight:700, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6, fontFamily:'inherit', transition:'background .15s' }}
        onMouseEnter={e => e.currentTarget.style.background='#d4a30a'}
        onMouseLeave={e => e.currentTarget.style.background='#f0b90b'}>
        <Copy size={14}/> Copy
      </button>
    </div>
  );
};

/* ══════════════════════════════════
   MAIN CopyTrade PAGE
══════════════════════════════════ */
export default function CopyTrade() {
  const navigate = useNavigate();
  const { user, token } = useContext(UserContext);

  const [traders,   setTraders]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('Recommended');
  const [copyTarget,setCopyTarget]= useState(null);
  const [balHidden, setBalHidden] = useState(false);
  const [openFaq,   setOpenFaq]   = useState(null);
  const [promoIdx,  setPromoIdx]  = useState(0);
  const [spotOpen,  setSpotOpen]  = useState(false);

  const promos = [
    { title:'Copy Trading Lead Trader Growth Plan', sub:'Join Now',   icon:'📈' },
    { title:'Earn Up to 10% Commission on Profits', sub:'Learn More', icon:'💰' },
    { title:'Elite Trader Program — Apply Now',     sub:'Apply',      icon:'⭐' },
    { title:'Daily Picks — Best Performers Today',  sub:'View Picks', icon:'🎯' },
  ];

  useEffect(() => {
    axios.get(`${API_URL}/api/traders`)
      .then(r => setTraders(Array.isArray(r.data) ? r.data : []))
      .catch(() => setTraders([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const t = setInterval(() => setPromoIdx(i => (i+1) % promos.length), 4000);
    return () => clearInterval(t);
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this trader?')) return;
    try {
      await axios.delete(`${API_URL}/api/admin/delete-trader/${id}`, { headers:{ Authorization:`Bearer ${token}` } });
      setTraders(p => p.filter(t => t._id !== id));
    } catch { alert('Failed to delete'); }
  };

  const displayTraders = activeTab === 'My Favorites' ? [] : traders;

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    .ct{ font-family:'Inter',sans-serif; background:#0b0e11; color:#eaecef; min-height:100vh; }
    .ct *{ box-sizing:border-box; }
    @keyframes spin{ to{ transform:rotate(360deg); } }
    @keyframes fadeIn{ from{ opacity:0; transform:translateY(-5px); } to{ opacity:1; transform:none; } }
    .ct-tab{ padding:10px 14px; font-size:13px; font-weight:600; background:transparent; border:none; color:#848e9c; cursor:pointer; border-bottom:2px solid transparent; white-space:nowrap; transition:all .15s; font-family:inherit; }
    .ct-tab.on{ color:#eaecef; border-bottom-color:#f0b90b; }
    .ct-tab:hover{ color:#eaecef; }
    .faq-item{ border-bottom:1px solid #1e2329; }

    /* Mobile responsive */
    @media(max-width:640px){
      .ct-header-btns .be-trader-text{ display:none; }
      .ct-balance-grid{ grid-template-columns:1fr!important; }
      .ct-tab{ padding:8px 10px; font-size:12px; }
      .ct-header-title{ font-size:14px!important; }
      .faq-q-text{ font-size:13px!important; }
      .faq-ans{ padding:0 16px 14px 48px!important; }
      .become-banner{ flex-direction:column!important; align-items:flex-start!important; gap:12px!important; }
      .become-banner h3{ font-size:16px!important; }
    }
    @media(max-width:400px){
      .ct-tab{ padding:7px 8px; font-size:11px; }
    }
  `;

  return (
    <>
      <style>{css}</style>
      {copyTarget && <CopyModal trader={copyTarget} user={user} onClose={() => setCopyTarget(null)}/>}

      <div className="ct">

        {/* ── HEADER ── */}
        <div style={{ padding:'0 16px', borderBottom:'1px solid #1e2329', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, background:'#0b0e11', zIndex:50, gap:8 }}>
          {/* Left: title + dropdown */}
          <div style={{ display:'flex', alignItems:'center', gap:0, minWidth:0 }}>
            <div style={{ position:'relative' }}>
              <button onClick={() => setSpotOpen(v=>!v)}
                style={{ display:'flex', alignItems:'center', gap:5, padding:'13px 12px 13px 0', background:'none', border:'none', color:'#eaecef', fontWeight:700, fontSize:15, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' }}
                className="ct-header-title">
                Spot Copy <ChevronDown size={15} style={{ transform:spotOpen?'rotate(180deg)':'none', transition:'transform .2s', flexShrink:0 }}/>
              </button>
              {spotOpen && (
                <>
                  <div style={{ position:'fixed', inset:0, zIndex:98 }} onClick={() => setSpotOpen(false)}/>
                  <div style={{ position:'absolute', top:'100%', left:0, background:'#1e2329', border:'1px solid #2b3139', borderRadius:12, padding:8, zIndex:99, minWidth:160, boxShadow:'0 8px 24px rgba(0,0,0,.6)' }}>
                    {['Spot Copy','Futures Copy','Strategy Copy'].map(o => (
                      <div key={o} style={{ padding:'10px 14px', cursor:'pointer', borderRadius:8, fontSize:13, color:'#848e9c', transition:'background .15s' }}
                        onMouseEnter={e => e.currentTarget.style.background='#2b3139'}
                        onMouseLeave={e => e.currentTarget.style.background='transparent'}
                        onClick={() => setSpotOpen(false)}>
                        {o}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            <span style={{ color:'#2b3139', margin:'0 4px', flexShrink:0 }}>|</span>
            <span style={{ color:'#848e9c', fontSize:13, cursor:'pointer', whiteSpace:'nowrap' }}>Futures</span>
          </div>

          {/* Right: buttons */}
          <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }} className="ct-header-btns">
            <button onClick={() => navigate('/become-trader')}
              style={{ display:'flex', alignItems:'center', gap:5, background:'#f0b90b', border:'none', borderRadius:8, padding:'7px 14px', color:'#0b0e11', fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' }}>
              <Users size={13}/>
              <span className="be-trader-text">Be a Lead Trader</span>
            </button>
            <button onClick={() => navigate(-1)} style={{ background:'none', border:'none', color:'#848e9c', cursor:'pointer', display:'flex', padding:4 }}>
              <ArrowLeft size={18}/>
            </button>
          </div>
        </div>

        {/* ── BALANCE + PROMO ── */}
        <div style={{ padding:'16px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, maxWidth:1100, margin:'0 auto' }} className="ct-balance-grid">

          {/* Balance card */}
          <div style={{ background:'#161a1e', border:'1px solid #1e2329', borderRadius:16, padding:'18px 20px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
              <span style={{ fontSize:12, color:'#848e9c' }}>Total Copying Balance (USDT)</span>
              <button onClick={() => setBalHidden(v=>!v)} style={{ background:'none', border:'none', color:'#848e9c', cursor:'pointer', display:'flex', padding:0 }}>
                {balHidden ? <EyeOff size={13}/> : <Eye size={13}/>}
              </button>
            </div>
            <div style={{ fontSize:32, fontWeight:700, color:'#eaecef', marginBottom:4 }}>
              {balHidden ? '••••' : '0.00'}
            </div>
            <div style={{ fontSize:12, color:'#848e9c', marginBottom:16 }}>
              Unrealized PnL: <span style={{ color:'#848e9c' }}>--</span>
            </div>
            <button style={{ padding:'8px 18px', background:'#f0b90b', border:'none', borderRadius:8, color:'#0b0e11', fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
              Copy Overview
            </button>
          </div>

          {/* Promo card */}
          <div style={{ background:'linear-gradient(135deg,#1e2329,#2b3139)', border:'1px solid #2b3139', borderRadius:16, padding:'18px 20px', cursor:'pointer', position:'relative', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ flex:1, minWidth:0 }}>
              <h3 style={{ fontWeight:700, fontSize:14, color:'#eaecef', marginBottom:8, lineHeight:1.4 }}>{promos[promoIdx].title}</h3>
              <span style={{ color:'#f0b90b', fontWeight:700, fontSize:12, cursor:'pointer' }}>{promos[promoIdx].sub} →</span>
            </div>
            <div style={{ fontSize:40, marginLeft:12, flexShrink:0 }}>{promos[promoIdx].icon}</div>
            {/* Dots */}
            <div style={{ position:'absolute', bottom:10, right:10, display:'flex', gap:4 }}>
              {promos.map((_,i) => (
                <div key={i} onClick={() => setPromoIdx(i)}
                  style={{ width:i===promoIdx?14:5, height:5, borderRadius:3, background:i===promoIdx?'#f0b90b':'#2b3139', cursor:'pointer', transition:'all .3s' }}/>
              ))}
            </div>
          </div>
        </div>

        {/* ── TABS + CONTENT ── */}
        <div style={{ padding:'0 16px 16px', maxWidth:1100, margin:'0 auto' }}>

          {/* Tabs */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #1e2329', marginBottom:20, overflowX:'auto', scrollbarWidth:'none' }}>
            <div style={{ display:'flex', flexShrink:0 }}>
              {['Recommended','All Portfolios','My Favorites'].map(t => (
                <button key={t} className={`ct-tab${activeTab===t?' on':''}`} onClick={() => setActiveTab(t)}>{t}</button>
              ))}
            </div>
            <button style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', background:'#2b3139', border:'none', borderRadius:20, color:'#f0b90b', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit', flexShrink:0, marginLeft:8 }}>
              <Zap size={11} style={{ fill:'#f0b90b' }}/> Daily Picks
            </button>
          </div>

          {/* Section title */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
            <h2 style={{ fontSize:17, fontWeight:700, color:'#eaecef' }}>High PNL Traders</h2>
            <button style={{ padding:'5px 14px', background:'transparent', border:'1px solid #2b3139', borderRadius:20, color:'#848e9c', fontSize:12, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:4 }}>
              More <ChevronRight size={12}/>
            </button>
          </div>

          {/* Traders grid */}
          {loading ? (
            <div style={{ display:'flex', justifyContent:'center', alignItems:'center', padding:60 }}>
              <Loader2 size={36} style={{ color:'#f0b90b', animation:'spin 1s linear infinite' }}/>
            </div>
          ) : displayTraders.length === 0 ? (
            <div style={{ textAlign:'center', padding:60, color:'#5e6673' }}>
              <Users size={44} style={{ opacity:.15, margin:'0 auto 14px', display:'block' }}/>
              <p style={{ fontSize:14, marginBottom:8 }}>No traders available yet.</p>
              {user?.role === 'admin' && (
                <button onClick={() => navigate('/admin')}
                  style={{ padding:'9px 22px', background:'#f0b90b', border:'none', borderRadius:10, color:'#0b0e11', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>
                  Add Traders from Admin
                </button>
              )}
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:14, marginBottom:32 }}>
              {displayTraders.map(t => (
                <TraderCard key={t._id} trader={t} user={user} onDelete={handleDelete} onCopy={setCopyTarget}/>
              ))}
            </div>
          )}

          {/* Become Master Trader Banner */}
          <div style={{ background:'linear-gradient(135deg,#161a1e,#1e2329)', border:'1px solid #2b3139', borderRadius:16, padding:'20px 24px', marginBottom:40, display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }} className="become-banner">
            <div>
              <h3 style={{ color:'#eaecef', fontWeight:700, fontSize:18, marginBottom:6 }}>Become a Master Trader</h3>
              <p style={{ color:'#848e9c', fontSize:13 }}>Share expertise, grow followers, earn up to 10% commission.</p>
            </div>
            <button onClick={() => navigate('/become-trader')}
              style={{ padding:'11px 24px', background:'#f0b90b', border:'none', borderRadius:12, color:'#0b0e11', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:8, whiteSpace:'nowrap', flexShrink:0 }}>
              <Zap size={15} style={{ fill:'#0b0e11' }}/> Apply Now
            </button>
          </div>

          {/* FAQ */}
          <div style={{ maxWidth:780, margin:'0 auto 60px' }}>
            <h2 style={{ textAlign:'center', fontSize:28, fontWeight:800, color:'#eaecef', marginBottom:28 }}>FAQ</h2>
            <div style={{ background:'#161a1e', borderRadius:16, overflow:'hidden', border:'1px solid #1e2329' }}>
              {FAQ_ITEMS.map((item, i) => (
                <div key={i} className="faq-item">
                  <div style={{ display:'flex', alignItems:'center', gap:12, padding:'16px 20px', cursor:'pointer' }}
                    onClick={() => setOpenFaq(openFaq===i?null:i)}>
                    <div style={{ width:30, height:30, border:`1px solid ${openFaq===i?'rgba(240,185,11,.3)':'#2b3139'}`, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:openFaq===i?'#f0b90b':'#848e9c', flexShrink:0, background:openFaq===i?'rgba(240,185,11,.08)':'transparent', transition:'all .15s' }}>
                      {i+1}
                    </div>
                    <span className="faq-q-text" style={{ fontSize:14, fontWeight:500, color:openFaq===i?'#eaecef':'#c6cad2', flex:1, lineHeight:1.4 }}>{item.q}</span>
                    <div style={{ color:'#848e9c', flexShrink:0 }}>
                      {openFaq===i ? <ChevronUp size={17}/> : <Plus size={17}/>}
                    </div>
                  </div>
                  {openFaq===i && (
                    <div className="faq-ans" style={{ padding:'0 20px 16px 62px', fontSize:13, color:'#848e9c', lineHeight:1.7, animation:'fadeIn .2s' }}>
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
