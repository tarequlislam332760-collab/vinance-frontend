import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import {
  X, ChevronDown, Zap, Star, Users, Clock,
  MoreHorizontal, Plus, ChevronRight, Copy, Loader2,
  Eye, EyeOff, Edit, Trash2, Info, ArrowLeft,
  TrendingUp, DollarSign, Activity, RefreshCw,
  CheckCircle, AlertCircle, StopCircle, Play
} from 'lucide-react';

const API = 'https://vinance-backend-1.onrender.com';

const FAQ_ITEMS = [
  { q:'What Is Copy Trading?', a:'Copy trading lets you replicate trades of experienced traders automatically. When a lead trader opens or closes a position, the same action is executed proportionally in your account.' },
  { q:'How does copy trading work?', a:'Select a lead trader and allocate funds. Every time they trade, it\'s automatically replicated in your portfolio proportionally to your allocated amount.' },
  { q:'What is the portfolio maximum drawdown?', a:'Maximum drawdown measures the largest peak-to-trough decline in portfolio value. A lower drawdown indicates better risk management by the lead trader.' },
  { q:'What is Portfolio Sharpe Ratio?', a:'Sharpe Ratio measures risk-adjusted return. Higher = better returns relative to risk. Formula: (return − risk-free rate) / standard deviation.' },
  { q:'What is portfolio AUM?', a:'AUM = Assets Under Management — total market value of all funds managed by a lead trader through copy trading.' },
  { q:"What's the benefit for lead traders?", a:'Lead traders earn profit-share commission from copiers, typically 8–10%. More followers + better performance = higher earnings.' },
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  .ct{font-family:'Inter',sans-serif;background:#0b0e11;color:#eaecef;min-height:100vh;}
  .ct *{box-sizing:border-box;}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes fadeIn{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:none}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  .ct-tab{padding:10px 14px;font-size:13px;font-weight:600;background:transparent;border:none;color:#848e9c;cursor:pointer;border-bottom:2px solid transparent;white-space:nowrap;transition:all .15s;font-family:inherit;}
  .ct-tab.on{color:#eaecef;border-bottom-color:#f0b90b;}
  .ct-tab:hover{color:#eaecef;}
  .faq-item{border-bottom:1px solid #1e2329;}
  .spin{animation:spin .8s linear infinite;}
  .fade{animation:fadeUp .25s;}
  /* Modal */
  .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.88);backdrop-filter:blur(8px);z-index:999;display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto;}
  .modal-box{background:#161a1e;border:1px solid #2b3139;border-radius:20px;padding:24px;width:100%;max-width:460px;max-height:92vh;overflow-y:auto;}
  @media(max-width:640px){
    .ct-header-btns .be-trader-text{display:none;}
    .ct-balance-grid{grid-template-columns:1fr!important;}
    .ct-tab{padding:8px 10px;font-size:12px;}
    .become-banner{flex-direction:column!important;align-items:flex-start!important;gap:12px!important;}
  }
`;

/* ── Copy Modal ── */
const CopyModal = ({ trader, user, token, onClose, onSuccess }) => {
  const [amount,  setAmount]  = useState('');
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [err,     setErr]     = useState('');

  const handleCopy = async () => {
    setErr('');
    const amt = parseFloat(amount);
    if (!amt || amt <= 0)               return setErr('Enter a valid amount');
    if (amt < 10)                       return setErr('Minimum copy amount is $10');
    if (amt > (user?.balance || 0))     return setErr('Insufficient balance');
    setLoading(true);
    try {
      await axios.post(`${API}/api/copy-trade/start`,
        { traderId: trader._id, amount: amt },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDone(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1400);
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed to start copy trade');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-bg" onClick={e => e.target===e.currentTarget && !loading && onClose()}>
      <div className="modal-box fade">
        {done ? (
          <div style={{ textAlign:'center', padding:'20px 0' }}>
            <CheckCircle size={52} style={{ color:'#0ecb81', margin:'0 auto 14px', display:'block' }}/>
            <h3 style={{ color:'#eaecef', fontWeight:800, fontSize:17, marginBottom:8 }}>Copy Trade Started!</h3>
            <p style={{ color:'#848e9c', fontSize:13 }}>You are now copying {trader.name}</p>
          </div>
        ) : (
          <>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
              <div>
                <h3 style={{ color:'#eaecef', fontWeight:700, fontSize:16 }}>Copy {trader.name}</h3>
                <p style={{ color:'#848e9c', fontSize:12, marginTop:2 }}>Set your copy amount</p>
              </div>
              <button onClick={onClose} style={{ background:'none', border:'none', color:'#848e9c', cursor:'pointer' }}><X size={20}/></button>
            </div>

            {/* Trader stats */}
            <div style={{ background:'#0b0e11', borderRadius:12, padding:14, marginBottom:16, border:'1px solid #2b3139' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                {[
                  { l:'30D ROI',   v:`+${trader.roi||0}%`,    c:'#0ecb81' },
                  { l:'Win Rate',  v:`${trader.winRate||0}%`,  c:'#eaecef' },
                  { l:'Followers', v:trader.followers||0,      c:'#f0b90b' },
                ].map(s => (
                  <div key={s.l} style={{ textAlign:'center' }}>
                    <div style={{ fontSize:10, color:'#5e6673', marginBottom:4, textTransform:'uppercase' }}>{s.l}</div>
                    <div style={{ fontSize:14, fontWeight:700, color:s.c }}>{s.v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Balance */}
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:8 }}>
              <span style={{ color:'#848e9c' }}>Available Balance</span>
              <span style={{ color:'#f0b90b', fontWeight:700 }}>${(user?.balance||0).toFixed(2)} USDT</span>
            </div>

            {/* Amount input */}
            <label style={{ fontSize:11, color:'#848e9c', fontWeight:700, textTransform:'uppercase', marginBottom:6, display:'block' }}>Copy Amount (USDT)</label>
            <div style={{ display:'flex', alignItems:'center', background:'#0b0e11', border:'1px solid #2b3139', borderRadius:10, padding:'11px 14px', marginBottom:10, gap:8 }}>
              <input type="number" value={amount} onChange={e => { setAmount(e.target.value); setErr(''); }} placeholder="Min $10"
                style={{ flex:1, background:'transparent', border:'none', outline:'none', color:'#eaecef', fontSize:16, fontWeight:700, fontFamily:'inherit' }}/>
              <span style={{ color:'#848e9c', fontWeight:600, fontSize:13 }}>USDT</span>
            </div>

            {/* Quick % */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6, marginBottom:14 }}>
              {[25,50,75,100].map(pct => (
                <button key={pct} onClick={() => setAmount(((user?.balance||0)*(pct/100)).toFixed(2))}
                  style={{ padding:'7px 0', background:'#2b3139', border:'none', borderRadius:8, color:'#848e9c', fontSize:12, cursor:'pointer', fontFamily:'inherit', transition:'all .15s' }}
                  onMouseEnter={e=>e.target.style.color='#eaecef'} onMouseLeave={e=>e.target.style.color='#848e9c'}>
                  {pct}%
                </button>
              ))}
            </div>

            {/* Info */}
            <div style={{ background:'rgba(240,185,11,.05)', border:'1px solid rgba(240,185,11,.2)', borderRadius:8, padding:12, marginBottom:14, fontSize:12, color:'#848e9c', display:'flex', gap:8 }}>
              <Info size={14} style={{ color:'#f0b90b', flexShrink:0, marginTop:1 }}/>
              <span>Your trades will automatically mirror {trader.name}'s positions. Funds are deducted immediately and returned when you stop copying.</span>
            </div>

            {/* Error */}
            {err && (
              <div style={{ display:'flex', gap:8, alignItems:'center', background:'rgba(246,70,93,.08)', border:'1px solid rgba(246,70,93,.2)', borderRadius:8, padding:'9px 12px', marginBottom:12 }}>
                <AlertCircle size={13} style={{ color:'#f6465d', flexShrink:0 }}/>
                <span style={{ fontSize:12, color:'#f6465d' }}>{err}</span>
              </div>
            )}

            <button onClick={handleCopy} disabled={loading || !amount}
              style={{ width:'100%', padding:'13px 0', background:loading||!amount?'#2b3139':'#f0b90b', border:'none', borderRadius:12, color:loading||!amount?'#5e6673':'#0b0e11', fontWeight:700, fontSize:14, cursor:loading||!amount?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'all .15s', fontFamily:'inherit' }}>
              {loading ? <><Loader2 size={16} className="spin"/> Processing...</> : <><Copy size={15}/> Start Copying</>}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

/* ── Trader Card ── */
const TraderCard = ({ trader, user, onDelete, onCopy }) => {
  const pnl    = trader.pnl    || trader.profit || 0;
  const roi    = trader.roi    || 0;
  const aum    = trader.aum    || 0;
  const days   = trader.days   || 0;
  const follow = trader.followers    || 0;
  const maxF   = trader.maxFollowers || 500;
  const winRate = trader.winRate || 0;

  const badges = ['Master','Legend','Elite'];
  const badge  = badges[trader.name?.charCodeAt(0)%3 || 0];
  const badgeStyle = {
    Master: { bg:'rgba(240,185,11,.12)', color:'#f0b90b', border:'1px solid rgba(240,185,11,.3)' },
    Legend: { bg:'rgba(14,203,129,.12)', color:'#0ecb81', border:'1px solid rgba(14,203,129,.3)' },
    Elite:  { bg:'rgba(155,88,240,.12)', color:'#9b58f0', border:'1px solid rgba(155,88,240,.3)' },
  }[badge];

  const sparkData = [30,50,40,70,55,80,60,90,75,95];

  return (
    <div style={{ background:'#161a1e', border:'1px solid #1e2329', borderRadius:16, padding:16, position:'relative', transition:'border .2s' }}
      onMouseEnter={e=>e.currentTarget.style.borderColor='#2b3139'}
      onMouseLeave={e=>e.currentTarget.style.borderColor='#1e2329'}>

      {/* Admin buttons */}
      {user?.role === 'admin' && (
        <div style={{ position:'absolute', top:10, right:10, display:'flex', gap:6, zIndex:10 }}>
          <button onClick={() => onDelete(trader._id)} style={{ padding:'5px 10px', background:'rgba(246,70,93,.1)', border:'1px solid rgba(246,70,93,.3)', borderRadius:8, color:'#f6465d', fontSize:11, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:4, fontFamily:'inherit' }}>
            <Trash2 size={11}/> Del
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
        <div style={{ width:46, height:46, borderRadius:'50%', background:`hsl(${trader.name?.charCodeAt(0)*30||0},55%,42%)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, fontWeight:800, flexShrink:0, border:'2px solid #2b3139', color:'#fff', overflow:'hidden' }}>
          {trader.image||trader.img||trader.avatar
            ? <img src={trader.image||trader.img||trader.avatar} alt={trader.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
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
          { label:'30D PNL',  value:`+$${parseFloat(pnl).toFixed(0)}`,  color:'#0ecb81' },
          { label:'ROI',      value:`+${parseFloat(roi).toFixed(1)}%`,   color:'#0ecb81' },
          { label:'Win Rate', value:`${parseFloat(winRate).toFixed(0)}%`,color:'#eaecef' },
        ].map(s => (
          <div key={s.label} style={{ background:'#0b0e11', borderRadius:8, padding:'8px 10px' }}>
            <div style={{ fontSize:9, color:'#848e9c', marginBottom:3, textTransform:'uppercase' }}>{s.label}</div>
            <div style={{ fontSize:13, fontWeight:700, color:s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Sparkline */}
      <div style={{ marginBottom:12 }}>
        <div style={{ fontSize:10, color:'#5e6673', marginBottom:5 }}>30 Days Trend</div>
        <div style={{ display:'flex', alignItems:'flex-end', gap:2, height:28 }}>
          {sparkData.map((h,i) => (
            <div key={i} style={{ flex:1, borderRadius:1, background:'#0ecb81', opacity:0.4+(i*0.06), height:`${h}%` }}/>
          ))}
        </div>
      </div>

      <button onClick={() => onCopy(trader)}
        style={{ width:'100%', padding:'10px 0', background:'#f0b90b', color:'#0b0e11', border:'none', borderRadius:10, fontWeight:700, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6, fontFamily:'inherit', transition:'background .15s' }}
        onMouseEnter={e=>e.currentTarget.style.background='#d4a30a'}
        onMouseLeave={e=>e.currentTarget.style.background='#f0b90b'}>
        <Copy size={14}/> Copy
      </button>
    </div>
  );
};

/* ════════════════════
   MAIN PAGE
════════════════════ */
export default function CopyTrade() {
  const navigate = useNavigate();
  const { user, token, refreshUser } = useContext(UserContext);

  const [traders,    setTraders]    = useState([]);
  const [myCopies,   setMyCopies]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [activeTab,  setActiveTab]  = useState('Recommended');
  const [copyTarget, setCopyTarget] = useState(null);
  const [balHidden,  setBalHidden]  = useState(false);
  const [openFaq,    setOpenFaq]    = useState(null);
  const [promoIdx,   setPromoIdx]   = useState(0);
  const [spotOpen,   setSpotOpen]   = useState(false);
  const [toast,      setToast]      = useState(null);
  const [stopping,   setStopping]   = useState(null);
  const [myTab,      setMyTab]      = useState('copies');

  const showToast = (msg, type='ok') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  const promos = [
    { title:'Copy Trading Lead Trader Growth Plan', sub:'Join Now',   icon:'📈' },
    { title:'Earn Up to 10% Commission on Profits', sub:'Learn More', icon:'💰' },
    { title:'Elite Trader Program — Apply Now',     sub:'Apply',      icon:'⭐' },
    { title:'Daily Picks — Best Performers Today',  sub:'View Picks', icon:'🎯' },
  ];

  /* Fetch traders */
  const fetchTraders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/traders`);
      setTraders(Array.isArray(res.data) ? res.data : []);
    } catch { setTraders([]); }
    finally { setLoading(false); }
  };

  /* Fetch my copy trades */
  const fetchMyCopies = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API}/api/copy-trade/my`, { headers: { Authorization: `Bearer ${token}` } });
      setMyCopies(Array.isArray(res.data) ? res.data : []);
    } catch { setMyCopies([]); }
  };

  useEffect(() => { fetchTraders(); }, []);
  useEffect(() => { if (token) fetchMyCopies(); }, [token, activeTab]);
  useEffect(() => {
    const t = setInterval(() => setPromoIdx(i => (i+1) % promos.length), 4000);
    return () => clearInterval(t);
  }, []);

  const handleCopySuccess = async () => {
    showToast('Copy trade started! 🎉');
    await refreshUser?.();
    fetchMyCopies();
  };

  const stopCopy = async (id) => {
    if (!window.confirm('Stop this copy trade? Funds will be returned.')) return;
    setStopping(id);
    try {
      await axios.post(`${API}/api/copy-trade/stop/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      showToast('Copy trade stopped. Funds returned.');
      await refreshUser?.();
      fetchMyCopies();
    } catch (e) { showToast(e.response?.data?.message || 'Failed to stop', 'err'); }
    finally { setStopping(null); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this trader?')) return;
    try {
      await axios.delete(`${API}/api/admin/delete-trader/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setTraders(p => p.filter(t => t._id !== id));
      showToast('Trader deleted');
    } catch { showToast('Failed to delete', 'err'); }
  };

  const totalCopyProfit = myCopies.reduce((s, c) => s + (c.profit || 0), 0);
  const activeCopies    = myCopies.filter(c => c.status === 'active');

  return (
    <>
      <style>{css}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', top:16, right:16, zIndex:9999, background:toast.type==='err'?'#f6465d':'#0ecb81', color:'#fff', padding:'11px 18px', borderRadius:12, fontWeight:700, fontSize:13, display:'flex', alignItems:'center', gap:8, boxShadow:'0 8px 32px rgba(0,0,0,.5)', animation:'fadeUp .3s', maxWidth:320 }}>
          {toast.type==='err' ? <AlertCircle size={15}/> : <CheckCircle size={15}/>} {toast.msg}
        </div>
      )}

      {copyTarget && (
        <CopyModal trader={copyTarget} user={user} token={token}
          onClose={() => setCopyTarget(null)} onSuccess={handleCopySuccess}/>
      )}

      <div className="ct">

        {/* ── HEADER ── */}
        <div style={{ padding:'0 16px', borderBottom:'1px solid #1e2329', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, background:'#0b0e11', zIndex:50, gap:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:0, minWidth:0 }}>
            <div style={{ position:'relative' }}>
              <button onClick={() => setSpotOpen(v=>!v)}
                style={{ display:'flex', alignItems:'center', gap:5, padding:'13px 12px 13px 0', background:'none', border:'none', color:'#eaecef', fontWeight:700, fontSize:15, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' }}>
                Spot Copy <ChevronDown size={15} style={{ transform:spotOpen?'rotate(180deg)':'none', transition:'transform .2s', flexShrink:0 }}/>
              </button>
              {spotOpen && (
                <>
                  <div style={{ position:'fixed', inset:0, zIndex:98 }} onClick={() => setSpotOpen(false)}/>
                  <div style={{ position:'absolute', top:'100%', left:0, background:'#1e2329', border:'1px solid #2b3139', borderRadius:12, padding:8, zIndex:99, minWidth:160, boxShadow:'0 8px 24px rgba(0,0,0,.6)' }}>
                    {['Spot Copy','Futures Copy','Strategy Copy'].map(o => (
                      <div key={o} style={{ padding:'10px 14px', cursor:'pointer', borderRadius:8, fontSize:13, color:'#848e9c', transition:'background .15s' }}
                        onMouseEnter={e=>e.currentTarget.style.background='#2b3139'}
                        onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                        onClick={() => setSpotOpen(false)}>{o}</div>
                    ))}
                  </div>
                </>
              )}
            </div>
            <span style={{ color:'#2b3139', margin:'0 4px', flexShrink:0 }}>|</span>
            <span style={{ color:'#848e9c', fontSize:13, cursor:'pointer', whiteSpace:'nowrap' }}>Futures</span>
          </div>
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
          <div style={{ background:'#161a1e', border:'1px solid #1e2329', borderRadius:16, padding:'18px 20px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
              <span style={{ fontSize:12, color:'#848e9c' }}>Total Copying Balance (USDT)</span>
              <button onClick={() => setBalHidden(v=>!v)} style={{ background:'none', border:'none', color:'#848e9c', cursor:'pointer', display:'flex', padding:0 }}>
                {balHidden ? <EyeOff size={13}/> : <Eye size={13}/>}
              </button>
            </div>
            <div style={{ fontSize:32, fontWeight:700, color:'#eaecef', marginBottom:4 }}>
              {balHidden ? '••••' : `$${(user?.balance||0).toFixed(2)}`}
            </div>
            <div style={{ fontSize:12, color:'#848e9c', marginBottom:4 }}>
              Copy Profit: <span style={{ color:'#0ecb81', fontWeight:700 }}>+${totalCopyProfit.toFixed(2)}</span>
            </div>
            <div style={{ fontSize:12, color:'#848e9c', marginBottom:16 }}>
              Active: <span style={{ color:'#f0b90b', fontWeight:700 }}>{activeCopies.length}</span>
            </div>
            <button onClick={() => setActiveTab('My Copies')}
              style={{ padding:'8px 18px', background:'#f0b90b', border:'none', borderRadius:8, color:'#0b0e11', fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
              Copy Overview
            </button>
          </div>

          {/* Promo card */}
          <div style={{ background:'linear-gradient(135deg,#1e2329,#2b3139)', border:'1px solid #2b3139', borderRadius:16, padding:'18px 20px', cursor:'pointer', position:'relative', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ flex:1, minWidth:0 }}>
              <h3 style={{ fontWeight:700, fontSize:14, color:'#eaecef', marginBottom:8, lineHeight:1.4 }}>{promos[promoIdx].title}</h3>
              <span style={{ color:'#f0b90b', fontWeight:700, fontSize:12 }}>{promos[promoIdx].sub} →</span>
            </div>
            <div style={{ fontSize:40, marginLeft:12, flexShrink:0 }}>{promos[promoIdx].icon}</div>
            <div style={{ position:'absolute', bottom:10, right:10, display:'flex', gap:4 }}>
              {promos.map((_,i) => (
                <div key={i} onClick={() => setPromoIdx(i)}
                  style={{ width:i===promoIdx?14:5, height:5, borderRadius:3, background:i===promoIdx?'#f0b90b':'#2b3139', cursor:'pointer', transition:'all .3s' }}/>
              ))}
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div style={{ padding:'0 16px', maxWidth:1100, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #1e2329', marginBottom:20, overflowX:'auto', scrollbarWidth:'none' }}>
            <div style={{ display:'flex', flexShrink:0 }}>
              {['Recommended','All Portfolios','My Copies'].map(t => (
                <button key={t} className={`ct-tab${activeTab===t?' on':''}`} onClick={() => setActiveTab(t)}>{t}{t==='My Copies'&&myCopies.length>0?` (${myCopies.length})`:''}</button>
              ))}
            </div>
            <button style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', background:'#2b3139', border:'none', borderRadius:20, color:'#f0b90b', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit', flexShrink:0, marginLeft:8 }}>
              <Zap size={11} style={{ fill:'#f0b90b' }}/> Daily Picks
            </button>
          </div>

          {/* ── MY COPIES TAB ── */}
          {activeTab === 'My Copies' && (
            <div style={{ marginBottom:40 }}>
              {!token ? (
                <div style={{ textAlign:'center', padding:60, color:'#5e6673' }}>
                  <Copy size={44} style={{ opacity:.15, margin:'0 auto 14px', display:'block' }}/>
                  <p style={{ fontSize:14, marginBottom:16 }}>Login to view your copy trades</p>
                  <button onClick={() => navigate('/login')} style={{ padding:'9px 22px', background:'#f0b90b', border:'none', borderRadius:10, color:'#0b0e11', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>Login Now</button>
                </div>
              ) : myCopies.length === 0 ? (
                <div style={{ textAlign:'center', padding:60, color:'#5e6673' }}>
                  <Copy size={44} style={{ opacity:.15, margin:'0 auto 14px', display:'block' }}/>
                  <p style={{ fontSize:14, fontWeight:600, color:'#eaecef', marginBottom:8 }}>No active copy trades</p>
                  <p style={{ fontSize:13, marginBottom:16 }}>Choose a trader and start copying</p>
                  <button onClick={() => setActiveTab('Recommended')} style={{ padding:'9px 22px', background:'#f0b90b', border:'none', borderRadius:10, color:'#0b0e11', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>Browse Traders</button>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {/* Summary */}
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:10, marginBottom:8 }}>
                    {[
                      { l:'Total Copied',  v:`$${myCopies.reduce((s,c)=>s+(c.amount||0),0).toFixed(2)}`, c:'#f0b90b' },
                      { l:'Total Profit',  v:`+$${totalCopyProfit.toFixed(2)}`, c:'#0ecb81' },
                      { l:'Active Copies', v:activeCopies.length, c:'#627eea' },
                      { l:'Total Trades',  v:myCopies.reduce((s,c)=>s+(c.trades||0),0), c:'#848e9c' },
                    ].map(s => (
                      <div key={s.l} style={{ background:'#161a1e', border:'1px solid #1e2329', borderRadius:12, padding:'12px 14px', textAlign:'center' }}>
                        <div style={{ fontSize:9, color:'#5e6673', textTransform:'uppercase', marginBottom:4 }}>{s.l}</div>
                        <div style={{ fontSize:16, fontWeight:800, color:s.c }}>{s.v}</div>
                      </div>
                    ))}
                  </div>

                  {myCopies.map(ct => {
                    const trader = ct.traderId;
                    return (
                      <div key={ct._id} style={{ background:'#161a1e', border:'1px solid #1e2329', borderRadius:14, padding:16 }}>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <div style={{ width:40, height:40, borderRadius:'50%', background:`hsl(${trader?.name?.charCodeAt(0)*30||0},55%,42%)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:800, color:'#fff', flexShrink:0 }}>
                              {trader?.name?.[0]||'T'}
                            </div>
                            <div>
                              <p style={{ fontWeight:700, fontSize:14, color:'#eaecef', marginBottom:2 }}>{trader?.name||'Unknown Trader'}</p>
                              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                                <span style={{ background:ct.status==='active'?'rgba(14,203,129,.12)':'rgba(132,142,156,.12)', color:ct.status==='active'?'#0ecb81':'#848e9c', padding:'2px 8px', borderRadius:20, fontSize:10, fontWeight:700 }}>
                                  {ct.status==='active'?'● Active':'⏸ Stopped'}
                                </span>
                                <span style={{ fontSize:11, color:'#5e6673' }}>
                                  {new Date(ct.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div style={{ display:'flex', gap:16, flexWrap:'wrap', alignItems:'center' }}>
                            {[
                              { l:'Invested', v:`$${(ct.amount||0).toFixed(2)}`,  c:'#eaecef' },
                              { l:'Profit',   v:`+$${(ct.profit||0).toFixed(2)}`, c:'#0ecb81' },
                              { l:'ROI',      v:`+${(ct.roi||0).toFixed(2)}%`,    c:'#0ecb81' },
                              { l:'Trades',   v:ct.trades||0,                     c:'#848e9c' },
                            ].map(s => (
                              <div key={s.l} style={{ textAlign:'center', minWidth:56 }}>
                                <p style={{ fontSize:9, color:'#5e6673', marginBottom:3, textTransform:'uppercase' }}>{s.l}</p>
                                <p style={{ fontSize:14, fontWeight:700, color:s.c, fontFamily:'monospace' }}>{s.v}</p>
                              </div>
                            ))}
                            {ct.status === 'active' && (
                              <button onClick={() => stopCopy(ct._id)} disabled={stopping===ct._id}
                                style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', background:'rgba(246,70,93,.1)', border:'1px solid rgba(246,70,93,.25)', borderRadius:10, color:'#f6465d', fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
                                {stopping===ct._id ? <Loader2 size={13} className="spin"/> : <StopCircle size={13}/>}
                                Stop
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div style={{ display:'flex', justifyContent:'flex-end' }}>
                    <button onClick={fetchMyCopies} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', background:'#1e2329', border:'1px solid #2b3139', borderRadius:8, color:'#848e9c', cursor:'pointer', fontSize:12, fontFamily:'inherit' }}>
                      <RefreshCw size={12}/> Refresh
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TRADERS GRID ── */}
          {(activeTab === 'Recommended' || activeTab === 'All Portfolios') && (
            <>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                <h2 style={{ fontSize:17, fontWeight:700, color:'#eaecef' }}>High PNL Traders</h2>
                <button onClick={fetchTraders} style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', background:'transparent', border:'1px solid #2b3139', borderRadius:20, color:'#848e9c', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
                  <RefreshCw size={12}/> Refresh
                </button>
              </div>

              {loading ? (
                <div style={{ display:'flex', justifyContent:'center', alignItems:'center', padding:60 }}>
                  <Loader2 size={36} style={{ color:'#f0b90b', animation:'spin .8s linear infinite' }}/>
                </div>
              ) : traders.length === 0 ? (
                <div style={{ textAlign:'center', padding:60, color:'#5e6673' }}>
                  <Users size={44} style={{ opacity:.15, margin:'0 auto 14px', display:'block' }}/>
                  <p style={{ fontSize:14, marginBottom:8 }}>No traders available yet.</p>
                  {user?.role === 'admin' && (
                    <button onClick={() => navigate('/admin')} style={{ padding:'9px 22px', background:'#f0b90b', border:'none', borderRadius:10, color:'#0b0e11', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>
                      Add Traders from Admin
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:14, marginBottom:32 }}>
                  {traders.map(t => (
                    <TraderCard key={t._id} trader={t} user={user} onDelete={handleDelete} onCopy={trader => { if (!token) { navigate('/login'); return; } setCopyTarget(trader); }}/>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Become Banner */}
          {activeTab !== 'My Copies' && (
            <div style={{ background:'linear-gradient(135deg,#161a1e,#1e2329)', border:'1px solid #2b3139', borderRadius:16, padding:'20px 24px', marginBottom:40, display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }} className="become-banner">
              <div>
                <h3 style={{ color:'#eaecef', fontWeight:700, fontSize:18, marginBottom:6 }}>Become a Master Trader</h3>
                <p style={{ color:'#848e9c', fontSize:13 }}>Share expertise, grow followers, earn up to 10% commission.</p>
              </div>
              <button onClick={() => navigate('/become-trader')} style={{ padding:'11px 24px', background:'#f0b90b', border:'none', borderRadius:12, color:'#0b0e11', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:8, whiteSpace:'nowrap', flexShrink:0 }}>
                <Zap size={15} style={{ fill:'#0b0e11' }}/> Apply Now
              </button>
            </div>
          )}

          {/* FAQ */}
          {activeTab !== 'My Copies' && (
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
                      <span style={{ fontSize:14, fontWeight:500, color:openFaq===i?'#eaecef':'#c6cad2', flex:1, lineHeight:1.4 }}>{item.q}</span>
                      <span style={{ color:'#848e9c', flexShrink:0, fontSize:18 }}>{openFaq===i?'−':'+'}</span>
                    </div>
                    {openFaq===i && (
                      <div style={{ padding:'0 20px 16px 62px', fontSize:13, color:'#848e9c', lineHeight:1.7, animation:'fadeIn .2s' }}>{item.a}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
