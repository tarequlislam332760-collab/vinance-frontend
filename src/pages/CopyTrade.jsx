import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import {
  X, ChevronDown, Zap, Star, TrendingUp, Users, Clock,
  MoreHorizontal, Plus, ChevronRight, BarChart2, Shield,
  Award, Copy, RefreshCw, Loader2, Eye, EyeOff,
  ChevronUp, Edit, Trash2, Info
} from 'lucide-react';

const API_URL = "https://vinance-backend-1.onrender.com";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  .ct{font-family:'Inter',sans-serif;background:#0b0e11;color:#eaecef;min-height:100vh;}
  .ct *{box-sizing:border-box;}
  .ct-tab{padding:10px 16px;font-size:13px;font-weight:600;background:transparent;border:none;color:#848e9c;cursor:pointer;border-bottom:2px solid transparent;white-space:nowrap;transition:all .15s;font-family:inherit;}
  .ct-tab.on{color:#eaecef;border-bottom-color:#f0b90b;}
  .ct-tab:hover{color:#eaecef;}
  .trader-card{background:#161a1e;border:1px solid #1e2329;border-radius:16px;padding:18px;cursor:pointer;transition:all .2s;position:relative;overflow:hidden;}
  .trader-card:hover{border-color:#2b3139;transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.4);}
  .copy-btn{width:100%;padding:10px 0;background:#f0b90b;color:#0b0e11;border:none;border-radius:8px;font-weight:700;font-size:13px;cursor:pointer;transition:all .15s;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:6px;}
  .copy-btn:hover{background:#d4a30a;}
  .stat-box{background:#0b0e11;border-radius:8px;padding:10px 12px;flex:1;}
  .badge-master{background:rgba(240,185,11,.12);color:#f0b90b;border:1px solid rgba(240,185,11,.3);}
  .badge-legend{background:rgba(14,203,129,.12);color:#0ecb81;border:1px solid rgba(14,203,129,.3);}
  .badge-elite{background:rgba(155,88,240,.12);color:#9b58f0;border:1px solid rgba(155,88,240,.3);}
  .ct-badge{padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700;}
  .mini-sparkline{display:flex;align-items:flex-end;gap:2px;height:32px;}
  .mini-bar{border-radius:1px;transition:all .3s;}
  .faq-item{border-bottom:1px solid #1e2329;}
  .faq-q{display:flex;align-items:center;gap:14px;padding:18px 0;cursor:pointer;transition:background .15s;}
  .faq-q:hover .faq-text{color:#eaecef;}
  .faq-num{width:32px;height:32px;border:1px solid #2b3139;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#848e9c;flex-shrink:0;}
  .faq-text{font-size:15px;font-weight:500;color:#c6cad2;flex:1;}
  .faq-ans{padding:0 0 18px 46px;font-size:13px;color:#848e9c;line-height:1.7;}
  .balance-card{background:#161a1e;border:1px solid #1e2329;border-radius:16px;padding:24px;}
  .promo-card{background:linear-gradient(135deg,#1e2329 0%,#2b3139 100%);border:1px solid #2b3139;border-radius:16px;padding:24px;cursor:pointer;position:relative;overflow:hidden;}
  .promo-card::after{content:'';position:absolute;right:-20px;top:-20px;width:120px;height:120px;border-radius:50%;background:rgba(240,185,11,.05);}
  .section-title{font-size:18px;font-weight:700;color:#eaecef;margin-bottom:4px;}
  .view-more-btn{padding:6px 16px;background:transparent;border:1px solid #2b3139;border-radius:20px;color:#848e9c;font-size:12px;cursor:pointer;transition:all .15s;font-family:inherit;white-space:nowrap;}
  .view-more-btn:hover{border-color:#f0b90b;color:#f0b90b;}
  .admin-btn{padding:6px 12px;border:none;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:4px;font-family:inherit;transition:all .15s;}
  @media(max-width:768px){
    .grid-cols-4{grid-template-columns:1fr 1fr!important;}
    .hide-mobile{display:none!important;}
  }
`;

const FAQ_ITEMS = [
  { q:'What Is Copy Trading?', a:'Copy trading is a form of investing that allows you to replicate the trades of experienced traders automatically. When a lead trader opens or closes a position, the same action is executed proportionally in your account.' },
  { q:'How does copy trading work?', a:'You select a lead trader and allocate funds to copy their trades. Every time they execute a trade, it\'s automatically replicated in your portfolio proportionally to the amount you\'ve allocated.' },
  { q:'What is the portfolio maximum drawdown?', a:'Maximum drawdown measures the largest peak-to-trough decline in portfolio value over a specific period. A lower drawdown indicates better risk management by the lead trader.' },
  { q:'What is Portfolio Sharpe Ratio?', a:'The Sharpe Ratio measures risk-adjusted return. A higher ratio indicates better returns relative to the risk taken. It\'s calculated as (portfolio return - risk-free rate) / portfolio standard deviation.' },
  { q:'What is portfolio AUM?', a:'AUM stands for Assets Under Management — the total market value of all funds managed by a lead trader through copy trading relationships.' },
  { q:'What\'s the benefit for lead traders?', a:'Lead traders earn a profit share commission from their copiers\' profits, typically 8–10%. The more followers they have and the better their performance, the more they earn.' },
];

const TraderCard = ({ trader, user, onDelete, onCopy }) => {
  const pnl    = trader.pnl || (Math.random() * 500 + 50).toFixed(2);
  const roi    = trader.roi || (Math.random() * 80 + 10).toFixed(2);
  const aum    = trader.aum || (Math.random() * 50000 + 5000).toFixed(0);
  const days   = trader.days || Math.floor(Math.random() * 200 + 30);
  const follow = trader.followers || Math.floor(Math.random() * 400 + 50);
  const maxF   = trader.maxFollowers || 500;
  const badges = ['Master','Legend','Elite'];
  const badge  = badges[Math.floor(Math.random() * badges.length)];
  const badgeCls = badge==='Master'?'badge-master':badge==='Legend'?'badge-legend':'badge-elite';
  const sparkData = [30,50,40,70,55,80,60,90,75,95];

  return (
    <div className="trader-card">
      {/* Admin buttons */}
      {user?.role === 'admin' && (
        <div style={{ position:'absolute', top:12, right:12, display:'flex', gap:6, zIndex:10 }}>
          <button className="admin-btn" style={{ background:'#1976d2', color:'#fff' }}>
            <Edit size={12}/> Edit
          </button>
          <button className="admin-btn" style={{ background:'#d32f2f', color:'#fff' }} onClick={() => onDelete(trader._id)}>
            <Trash2 size={12}/> Delete
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
        <div style={{ width:48, height:48, borderRadius:'50%', background:`hsl(${Math.random()*360},60%,45%)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:800, flexShrink:0, overflow:'hidden' }}>
          {trader.avatar ? <img src={trader.avatar} alt={trader.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : trader.name?.[0]?.toUpperCase() || 'T'}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
            <span style={{ fontWeight:700, fontSize:14, color:'#eaecef' }}>{trader.name || 'Unknown Trader'}</span>
            <span className={`ct-badge ${badgeCls}`}>{badge}</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:11, color:'#848e9c' }}>
            <span style={{ display:'flex', alignItems:'center', gap:3 }}><Users size={10}/> {follow}/{maxF}</span>
            <span style={{ display:'flex', alignItems:'center', gap:3 }}><Clock size={10}/> {days} days</span>
            {trader.isApiEnabled && <span style={{ background:'rgba(14,203,129,.1)', color:'#0ecb81', padding:'1px 5px', borderRadius:3, fontSize:9, fontWeight:700 }}>API</span>}
          </div>
        </div>
        <button onClick={() => { /* star */ }} style={{ background:'none', border:'none', cursor:'pointer', color:'#5e6673' }}>
          <Star size={16}/>
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:14 }}>
        <div className="stat-box">
          <div style={{ fontSize:10, color:'#848e9c', marginBottom:3 }}>30D PNL</div>
          <div style={{ fontSize:14, fontWeight:700, color:'#0ecb81' }}>+${parseFloat(pnl).toFixed(2)}</div>
        </div>
        <div className="stat-box">
          <div style={{ fontSize:10, color:'#848e9c', marginBottom:3 }}>ROI</div>
          <div style={{ fontSize:14, fontWeight:700, color:'#0ecb81' }}>+{parseFloat(roi).toFixed(2)}%</div>
        </div>
        <div className="stat-box">
          <div style={{ fontSize:10, color:'#848e9c', marginBottom:3 }}>AUM</div>
          <div style={{ fontSize:14, fontWeight:700, color:'#eaecef' }}>${parseInt(aum).toLocaleString()}</div>
        </div>
      </div>

      {/* Sparkline */}
      <div style={{ marginBottom:14 }}>
        <div style={{ fontSize:10, color:'#5e6673', marginBottom:6 }}>30 Days PNL (USD)</div>
        <div className="mini-sparkline" style={{ width:'100%', height:36 }}>
          {sparkData.map((h,i) => (
            <div key={i} className="mini-bar" style={{ flex:1, height:`${h}%`, background:'#0ecb81', opacity:0.5+(i*0.05) }}/>
          ))}
        </div>
      </div>

      <button className="copy-btn" onClick={() => onCopy(trader)}>
        <Copy size={14}/> Copy
      </button>
    </div>
  );
};

const CopyModal = ({ trader, user, onClose }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCopy = async () => {
    if (!amount || parseFloat(amount) <= 0) return alert('Enter a valid amount');
    if (parseFloat(amount) > (user?.balance || 0)) return alert('Insufficient balance');
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    alert(`✅ Successfully copying ${trader.name}! $${amount} allocated.`);
    onClose();
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.8)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ background:'#1e2329', border:'1px solid #2b3139', borderRadius:16, width:400, maxWidth:'95vw', padding:24 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <div>
            <h3 style={{ color:'#eaecef', fontWeight:700, fontSize:16 }}>Copy {trader.name}</h3>
            <p style={{ color:'#848e9c', fontSize:12, marginTop:2 }}>Set your copy amount</p>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'#848e9c', cursor:'pointer' }}><X size={18}/></button>
        </div>

        <div style={{ background:'#0b0e11', borderRadius:10, padding:14, marginBottom:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:8 }}>
            <span style={{ color:'#848e9c' }}>Available Balance</span>
            <span style={{ color:'#eaecef', fontWeight:700 }}>${(user?.balance||0).toFixed(2)} USDT</span>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
            <span style={{ color:'#848e9c' }}>Min Copy Amount</span>
            <span style={{ color:'#eaecef' }}>$10 USDT</span>
          </div>
        </div>

        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:12, color:'#848e9c', display:'block', marginBottom:6 }}>Copy Amount (USDT)</label>
          <div style={{ display:'flex', alignItems:'center', background:'#2b3139', borderRadius:8, padding:'10px 14px', border:'1px solid #2b3139' }}>
            <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Min $10"
              style={{ flex:1, background:'transparent', border:'none', outline:'none', color:'#eaecef', fontSize:15, fontWeight:700 }}/>
            <span style={{ color:'#848e9c', fontWeight:600, fontSize:13 }}>USDT</span>
          </div>
        </div>

        <div style={{ display:'flex', gap:8, marginBottom:16 }}>
          {[25,50,75,100].map(pct => (
            <button key={pct} onClick={() => setAmount(((user?.balance||0)*(pct/100)).toFixed(2))}
              style={{ flex:1, padding:'6px 0', background:'#2b3139', border:'none', borderRadius:6, color:'#848e9c', fontSize:12, cursor:'pointer' }}>
              {pct}%
            </button>
          ))}
        </div>

        <div style={{ background:'rgba(240,185,11,.05)', border:'1px solid rgba(240,185,11,.2)', borderRadius:8, padding:12, marginBottom:16, fontSize:12, color:'#848e9c', display:'flex', gap:8 }}>
          <Info size={14} style={{ color:'#f0b90b', flexShrink:0, marginTop:1 }}/>
          <span>Your trades will automatically mirror this trader's positions proportionally to your copy amount.</span>
        </div>

        <button onClick={handleCopy} disabled={loading}
          style={{ width:'100%', padding:'13px 0', background:loading?'#2b3139':'#f0b90b', border:'none', borderRadius:10, color:loading?'#5e6673':'#0b0e11', fontWeight:700, fontSize:14, cursor:loading?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
          {loading ? <><Loader2 size={16} style={{ animation:'spin 1s linear infinite' }}/> Processing...</> : <><Copy size={16}/> Start Copying</>}
        </button>
      </div>
    </div>
  );
};

export default function CopyTrade() {
  const navigate  = useNavigate();
  const { user, token } = useContext(UserContext);
  const [traders,   setTraders]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('Recommended');
  const [showBanner, setShowBanner] = useState(true);
  const [copyTarget, setCopyTarget] = useState(null);
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [promoIdx, setPromoIdx] = useState(0);
  const [spotOpen, setSpotOpen] = useState(false);

  const promos = [
    { title:'Copy Trading Lead Trader Growth Plan', sub:'Join Now', icon:'📈' },
    { title:'Earn Up to 10% Commission on Profits', sub:'Learn More', icon:'💰' },
    { title:'Elite Trader Program — Apply Now',     sub:'Apply',     icon:'⭐' },
    { title:'Daily Picks — Best Performers Today',  sub:'View Picks', icon:'🎯' },
  ];

  useEffect(() => {
    const fetchTraders = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/traders`);
        setTraders(Array.isArray(res.data) ? res.data : []);
      } catch { setTraders([]); }
      finally { setLoading(false); }
    };
    fetchTraders();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setPromoIdx(i => (i+1) % promos.length), 4000);
    return () => clearInterval(t);
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this trader?')) return;
    try {
      await axios.delete(`${API_URL}/api/admin/delete-trader/${id}`, { headers:{ Authorization:`Bearer ${token}` } });
      setTraders(p => p.filter(t => t._id !== id));
    } catch { alert('Failed to delete'); }
  };

  const sections = {
    'Recommended': traders,
    'All Portfolios': traders,
    'My Favorites': [],
  };
  const displayTraders = sections[activeTab] || [];

  return (
    <>
      <style>{css}</style>
      {copyTarget && <CopyModal trader={copyTarget} user={user} onClose={() => setCopyTarget(null)}/>}

      <div className="ct">

        {/* HEADER */}
        <div style={{ padding:'0 24px', borderBottom:'1px solid #1e2329', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, background:'#0b0e11', zIndex:50 }}>
          <div style={{ display:'flex', alignItems:'center', gap:0 }}>
            {/* Spot Copy dropdown */}
            <div style={{ position:'relative' }}>
              <button onClick={() => setSpotOpen(v=>!v)}
                style={{ display:'flex', alignItems:'center', gap:6, padding:'14px 16px 14px 0', background:'none', border:'none', color:'#eaecef', fontWeight:700, fontSize:16, cursor:'pointer', fontFamily:'inherit' }}>
                Spot Copy <ChevronDown size={16} style={{ transform:spotOpen?'rotate(180deg)':'none', transition:'transform .2s' }}/>
              </button>
              {spotOpen && (
                <>
                  <div style={{ position:'fixed', inset:0, zIndex:98 }} onClick={() => setSpotOpen(false)}/>
                  <div style={{ position:'absolute', top:'100%', left:0, background:'#1e2329', border:'1px solid #2b3139', borderRadius:10, padding:8, zIndex:99, minWidth:160, boxShadow:'0 8px 24px rgba(0,0,0,.6)' }}>
                    {['Spot Copy','Futures Copy','Strategy Copy'].map(o => (
                      <div key={o} style={{ padding:'10px 14px', cursor:'pointer', borderRadius:6, fontSize:13, color:'#848e9c', transition:'all .15s' }}
                        onMouseEnter={e=>e.target.style.background='#2b3139'}
                        onMouseLeave={e=>e.target.style.background='transparent'}
                        onClick={() => setSpotOpen(false)}>
                        {o}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            <span style={{ color:'#2b3139', margin:'0 4px' }}>|</span>
            <span style={{ color:'#848e9c', fontSize:14, cursor:'pointer' }}>Futures</span>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:16, color:'#848e9c' }}>
            <button style={{ display:'flex', alignItems:'center', gap:6, background:'#f0b90b', border:'none', borderRadius:8, padding:'8px 16px', color:'#0b0e11', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}
              onClick={() => navigate('/become-trader')}>
              <Users size={14}/> Be a Lead Trader
            </button>
            <MoreHorizontal size={20} style={{ cursor:'pointer' }}/>
            <X size={20} style={{ cursor:'pointer' }} onClick={() => navigate(-1)}/>
          </div>
        </div>

        <div style={{ padding:'24px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, maxWidth:1200, margin:'0 auto' }}>

          {/* BALANCE CARD */}
          <div className="balance-card">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ fontSize:13, color:'#848e9c' }}>Total Copying Balance (USDT)</span>
                <button onClick={() => setBalanceHidden(v=>!v)} style={{ background:'none', border:'none', color:'#848e9c', cursor:'pointer' }}>
                  {balanceHidden ? <EyeOff size={14}/> : <Eye size={14}/>}
                </button>
              </div>
            </div>
            <div style={{ fontSize:36, fontWeight:700, color:'#eaecef', marginBottom:6 }}>
              {balanceHidden ? '••••' : '0.00'}
            </div>
            <div style={{ fontSize:13, color:'#848e9c', marginBottom:20 }}>
              Total Unrealized PnL (USDT) <span style={{ color:'#848e9c' }}>--</span>
            </div>
            <button style={{ padding:'9px 20px', background:'#f0b90b', border:'none', borderRadius:8, color:'#0b0e11', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>
              Copy Overview
            </button>
          </div>

          {/* PROMO CARD */}
          <div className="promo-card" style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ flex:1 }}>
              <h3 style={{ fontWeight:700, fontSize:16, color:'#eaecef', marginBottom:8 }}>{promos[promoIdx].title}</h3>
              <span style={{ color:'#f0b90b', fontWeight:700, fontSize:13, cursor:'pointer' }}>{promos[promoIdx].sub} →</span>
            </div>
            <div style={{ fontSize:48, marginLeft:16 }}>{promos[promoIdx].icon}</div>
            <div style={{ position:'absolute', bottom:12, right:12, display:'flex', gap:4 }}>
              {promos.map((_,i) => (
                <div key={i} onClick={() => setPromoIdx(i)} style={{ width: i===promoIdx?16:6, height:6, borderRadius:3, background:i===promoIdx?'#f0b90b':'#2b3139', cursor:'pointer', transition:'all .3s' }}/>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding:'0 24px 24px', maxWidth:1200, margin:'0 auto' }}>

          {/* TABS */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #1e2329', marginBottom:24 }}>
            <div style={{ display:'flex', gap:0 }}>
              {['Recommended','All Portfolios','My Favorites'].map(t => (
                <button key={t} className={`ct-tab${activeTab===t?' on':''}`} onClick={() => setActiveTab(t)}>{t}</button>
              ))}
            </div>
            <button style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 14px', background:'#2b3139', border:'none', borderRadius:20, color:'#f0b90b', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
              <Zap size={11} style={{ fill:'#f0b90b' }}/> Daily Picks
            </button>
          </div>

          {/* HIGH PNL */}
          <div style={{ marginBottom:32 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <h2 className="section-title">High PNL</h2>
              <button className="view-more-btn">More <ChevronRight size={12} style={{ display:'inline' }}/></button>
            </div>

            {loading ? (
              <div style={{ display:'flex', justifyContent:'center', padding:40 }}>
                <Loader2 size={32} style={{ color:'#f0b90b', animation:'spin 1s linear infinite' }}/>
              </div>
            ) : displayTraders.length === 0 ? (
              <div style={{ textAlign:'center', padding:60, color:'#5e6673', fontSize:13 }}>
                <Users size={40} style={{ opacity:.2, margin:'0 auto 12px', display:'block' }}/>
                <p>No traders available yet.</p>
                {user?.role === 'admin' && (
                  <button onClick={() => navigate('/admin')} style={{ marginTop:12, padding:'8px 20px', background:'#f0b90b', border:'none', borderRadius:8, color:'#0b0e11', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                    Add Traders from Admin
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:16 }}>
                {displayTraders.map(t => (
                  <TraderCard key={t._id} trader={t} user={user} onDelete={handleDelete} onCopy={setCopyTarget}/>
                ))}
              </div>
            )}
          </div>

          {/* BECOME MASTER TRADER */}
          <div style={{ background:'linear-gradient(135deg,#161a1e,#1e2329)', border:'1px solid #2b3139', borderRadius:16, padding:24, marginBottom:40, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
            <div>
              <h3 style={{ color:'#eaecef', fontWeight:700, fontSize:18, marginBottom:6 }}>Become a Master Trader</h3>
              <p style={{ color:'#848e9c', fontSize:13 }}>Share your expertise, grow your followers, and earn up to 10% commission.</p>
            </div>
            <button onClick={() => navigate('/become-trader')}
              style={{ padding:'12px 28px', background:'#f0b90b', border:'none', borderRadius:10, color:'#0b0e11', fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:8, whiteSpace:'nowrap' }}>
              <Zap size={16} style={{ fill:'#0b0e11' }}/> Apply Now
            </button>
          </div>

          {/* FAQ */}
          <div style={{ maxWidth:800, margin:'0 auto 60px' }}>
            <h2 style={{ textAlign:'center', fontSize:32, fontWeight:800, color:'#eaecef', marginBottom:32 }}>FAQ</h2>
            <div style={{ background:'#161a1e', borderRadius:16, overflow:'hidden', border:'1px solid #1e2329' }}>
              {FAQ_ITEMS.map((item, i) => (
                <div key={i} className="faq-item">
                  <div className="faq-q" style={{ padding:'18px 24px' }} onClick={() => setOpenFaq(openFaq===i?null:i)}>
                    <div className="faq-num" style={{ background: openFaq===i?'rgba(240,185,11,.1)':'transparent', borderColor:openFaq===i?'rgba(240,185,11,.3)':'#2b3139', color:openFaq===i?'#f0b90b':'#848e9c' }}>
                      {i+1}
                    </div>
                    <span className="faq-text" style={{ color:openFaq===i?'#eaecef':'#c6cad2' }}>{item.q}</span>
                    <div style={{ color:'#848e9c', flexShrink:0 }}>
                      {openFaq===i ? <ChevronUp size={18}/> : <Plus size={18}/>}
                    </div>
                  </div>
                  {openFaq===i && (
                    <div className="faq-ans" style={{ padding:'0 24px 18px 78px', animation:'fadeIn .2s' }}>
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
    </>
  );
}
export default CopyTrade;
