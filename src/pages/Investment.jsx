import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import {
  TrendingUp, Shield, Clock, ChevronRight, Loader2,
  X, CheckCircle, AlertCircle, Star, Zap, PieChart,
  ArrowUpRight, RefreshCw, Info, DollarSign, BarChart2
} from 'lucide-react';

const API_BASE = 'https://vinance-backend-1.onrender.com';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  .inv{font-family:'Inter',sans-serif;background:#0b0e11;color:#eaecef;min-height:100vh;}
  .inv *{box-sizing:border-box;margin:0;padding:0;}
  .inv ::-webkit-scrollbar{width:4px;height:4px;}
  .inv ::-webkit-scrollbar-thumb{background:#2b3139;border-radius:4px;}

  .plan-card{background:#161a1e;border:1px solid #1e2329;border-radius:20px;padding:24px;transition:all .2s;position:relative;overflow:hidden;}
  .plan-card:hover{border-color:#f0b90b40;transform:translateY(-3px);box-shadow:0 12px 40px rgba(0,0,0,.4);}
  .plan-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--plan-color,#f0b90b);}

  .invest-btn{width:100%;padding:13px 0;border:none;border-radius:12px;background:var(--plan-color,#f0b90b);color:#0b0e11;font-weight:800;font-size:14px;cursor:pointer;font-family:inherit;transition:all .15s;display:flex;align-items:center;justify-content:center;gap:8px;}
  .invest-btn:hover{filter:brightness(1.1);}
  .invest-btn:disabled{opacity:.45;cursor:not-allowed;}

  .stat-chip{background:#0b0e11;border-radius:10px;padding:10px 14px;flex:1;}

  .inv-tab{padding:10px 18px;font-size:13px;font-weight:600;background:transparent;border:none;color:#848e9c;cursor:pointer;border-bottom:2px solid transparent;white-space:nowrap;font-family:inherit;transition:all .15s;}
  .inv-tab.on{color:#eaecef;border-bottom-color:#f0b90b;}
  .inv-tab:hover{color:#eaecef;}

  .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.85);backdrop-filter:blur(8px);z-index:200;display:flex;align-items:center;justify-content:center;padding:16px;}
  .modal-box{background:#161a1e;border:1px solid #2b3139;border-radius:22px;width:100%;max-width:480px;padding:28px;max-height:90vh;overflow-y:auto;}

  .inp{width:100%;background:#0b0e11;border:1px solid #2b3139;border-radius:10px;padding:12px 14px;color:#eaecef;font-size:14px;outline:none;font-family:inherit;transition:border .15s;}
  .inp:focus{border-color:#f0b90b;}
  .inp::placeholder{color:#5e6673;}

  .pct-btn{flex:1;padding:8px 0;background:#2b3139;border:none;border-radius:6px;color:#848e9c;font-size:12px;cursor:pointer;font-family:inherit;transition:all .15s;}
  .pct-btn:hover{color:#f0b90b;background:#333a44;}

  .my-inv-row{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;padding:14px 16px;border-bottom:1px solid #1e232950;align-items:center;transition:background .15s;cursor:default;}
  .my-inv-row:hover{background:rgba(255,255,255,.02);}

  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  .spin{animation:spin .8s linear infinite;}
  .fade{animation:fadeUp .25s;}

  /* ── RESPONSIVE ── */
  @media(max-width:1024px){
    .plan-grid{grid-template-columns:repeat(2,1fr)!important;}
  }
  @media(max-width:640px){
    .plan-grid{grid-template-columns:1fr!important;}
    .stats-grid{grid-template-columns:1fr 1fr!important;}
    .my-inv-row{grid-template-columns:1fr 1fr!important;}
    .my-inv-hide{display:none!important;}
    .modal-box{padding:20px;}
    .hero-stats{grid-template-columns:1fr 1fr!important;}
  }
  @media(max-width:400px){
    .hero-stats{grid-template-columns:1fr!important;}
    .plan-grid{grid-template-columns:1fr!important;}
  }
`;

const RISK_COLOR = { low:'#0ecb81', medium:'#f0b90b', high:'#f6465d' };
const RISK_LABEL = { low:'Low Risk', medium:'Medium Risk', high:'High Risk' };

/* Fallback plans if backend has none */
const FALLBACK_PLANS = [
  { _id:'p1', name:'Starter Plan',    minAmount:10,   maxAmount:499,   profitPercent:8,  duration:24,  color:'#0ecb81', risk:'low',    icon:'🌱', popular:false },
  { _id:'p2', name:'Growth Plan',     minAmount:500,  maxAmount:4999,  profitPercent:15, duration:48,  color:'#627eea', risk:'medium', icon:'📈', popular:true  },
  { _id:'p3', name:'Premium Plan',    minAmount:5000, maxAmount:49999, profitPercent:25, duration:72,  color:'#f0b90b', risk:'medium', icon:'⭐', popular:false },
  { _id:'p4', name:'VIP Elite Plan',  minAmount:50000,maxAmount:999999,profitPercent:40, duration:168, color:'#f6465d', risk:'high',   icon:'👑', popular:false },
];

/* ══ INVEST MODAL ══ */
const InvestModal = ({ plan, user, token, onClose, onSuccess }) => {
  const [amount,   setAmount]   = useState('');
  const [loading,  setLoading]  = useState(false);
  const [done,     setDone]     = useState(false);
  const [errMsg,   setErrMsg]   = useState('');

  const color  = plan.color || '#f0b90b';
  const profit = amount ? (parseFloat(amount) * (plan.profitPercent / 100)).toFixed(2) : '0.00';
  const total  = amount ? (parseFloat(amount) + parseFloat(profit)).toFixed(2) : '0.00';

  const setPct = pct => setAmount(((user?.balance || 0) * pct / 100).toFixed(2));

  const submit = async () => {
    setErrMsg('');
    const amt = parseFloat(amount);
    if (!amt || amt <= 0)              return setErrMsg('Enter a valid amount');
    if (amt < plan.minAmount)          return setErrMsg(`Minimum investment is $${plan.minAmount}`);
    if (amt > plan.maxAmount)          return setErrMsg(`Maximum investment is $${plan.maxAmount}`);
    if (amt > (user?.balance || 0))    return setErrMsg('Insufficient balance');

    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/invest`,
        { planId: plan._id, amount: amt },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDone(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1600);
    } catch (err) {
      setErrMsg(err.response?.data?.message || 'Investment failed. Try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && !loading && onClose()}>
      <div className="modal-box fade" style={{ '--plan-color': color }}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:22 }}>
          <div>
            <div style={{ fontSize:28, marginBottom:6 }}>{plan.icon || '💼'}</div>
            <h3 style={{ color:'#eaecef', fontWeight:800, fontSize:18, marginBottom:4 }}>{plan.name}</h3>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              <span style={{ fontSize:12, color:RISK_COLOR[plan.risk]||'#f0b90b', fontWeight:700 }}>
                ● {RISK_LABEL[plan.risk] || 'Risk'}
              </span>
              <span style={{ fontSize:12, color:'#848e9c' }}>
                ⏱ {plan.duration || plan.durationHours} hours
              </span>
            </div>
          </div>
          {!done && <button onClick={onClose} style={{ background:'none', border:'none', color:'#848e9c', cursor:'pointer', padding:4 }}><X size={18}/></button>}
        </div>

        {/* Done state */}
        {done ? (
          <div style={{ textAlign:'center', padding:'20px 0' }}>
            <CheckCircle size={52} style={{ color:'#0ecb81', margin:'0 auto 16px', display:'block' }}/>
            <h3 style={{ color:'#eaecef', fontWeight:800, fontSize:18, marginBottom:8 }}>Investment Placed!</h3>
            <p style={{ color:'#848e9c', fontSize:13 }}>
              ${parseFloat(amount).toFixed(2)} invested in {plan.name}
            </p>
          </div>
        ) : (
          <>
            {/* Plan info */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:20 }}>
              {[
                { l:'ROI', v:`+${plan.profitPercent}%`, c:color },
                { l:'Min', v:`$${plan.minAmount}`,      c:'#eaecef' },
                { l:'Max', v:`$${(plan.maxAmount).toLocaleString()}`, c:'#eaecef' },
              ].map(s => (
                <div key={s.l} style={{ background:'#0b0e11', borderRadius:10, padding:'10px 12px', textAlign:'center' }}>
                  <div style={{ fontSize:10, color:'#5e6673', marginBottom:3, textTransform:'uppercase' }}>{s.l}</div>
                  <div style={{ fontSize:14, fontWeight:800, color:s.c }}>{s.v}</div>
                </div>
              ))}
            </div>

            {/* Available balance */}
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:8 }}>
              <span style={{ color:'#848e9c' }}>Available Balance</span>
              <span style={{ color:'#eaecef', fontWeight:700 }}>${(user?.balance || 0).toFixed(2)} USDT</span>
            </div>

            {/* Amount input */}
            <div style={{ position:'relative', marginBottom:10 }}>
              <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#5e6673', fontSize:13 }}>$</span>
              <input className="inp" type="number" placeholder={`${plan.minAmount} – ${plan.maxAmount}`}
                value={amount} onChange={e => { setAmount(e.target.value); setErrMsg(''); }}
                style={{ paddingLeft:26, paddingRight:55 }}/>
              <span style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', color:'#848e9c', fontSize:11, fontWeight:700 }}>USDT</span>
            </div>

            {/* Quick % */}
            <div style={{ display:'flex', gap:6, marginBottom:16 }}>
              {[25, 50, 75, 100].map(p => (
                <button key={p} className="pct-btn" onClick={() => setPct(p)}>{p}%</button>
              ))}
            </div>

            {/* Profit estimate */}
            {parseFloat(amount) > 0 && (
              <div style={{ background:'rgba(240,185,11,.05)', border:'1px solid rgba(240,185,11,.15)', borderRadius:12, padding:'12px 14px', marginBottom:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:6 }}>
                  <span style={{ color:'#848e9c' }}>Estimated Profit</span>
                  <span style={{ color:'#0ecb81', fontWeight:700 }}>+${profit} USDT</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
                  <span style={{ color:'#848e9c' }}>Total Return</span>
                  <span style={{ color:'#eaecef', fontWeight:700 }}>${total} USDT</span>
                </div>
              </div>
            )}

            {/* Error */}
            {errMsg && (
              <div style={{ display:'flex', gap:8, alignItems:'center', background:'rgba(246,70,93,.08)', border:'1px solid rgba(246,70,93,.2)', borderRadius:8, padding:'10px 12px', marginBottom:14 }}>
                <AlertCircle size={14} style={{ color:'#f6465d', flexShrink:0 }}/>
                <span style={{ fontSize:12, color:'#f6465d' }}>{errMsg}</span>
              </div>
            )}

            {/* Submit */}
            <button className="invest-btn" style={{ '--plan-color': color }} onClick={submit} disabled={loading || !amount}>
              {loading ? <><Loader2 size={15} className="spin"/> Processing...</> : <><Zap size={15}/> Invest Now</>}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

/* ══ MAIN PAGE ══ */
export default function Investment() {
  const navigate = useNavigate();
  const { user, token, refreshUser } = useContext(UserContext);

  const [tab,        setTab]        = useState('plans');
  const [plans,      setPlans]      = useState([]);
  const [myInvests,  setMyInvests]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [myLoading,  setMyLoading]  = useState(false);
  const [selPlan,    setSelPlan]    = useState(null);
  const [toast,      setToast]      = useState(null);

  const showToast = (msg, type = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/plans`);
      const data = Array.isArray(res.data) ? res.data : [];
      /* Add color/icon if backend doesn't have them */
      const colors = ['#0ecb81','#627eea','#f0b90b','#f6465d','#9b58f0','#00b4e6'];
      const icons  = ['🌱','📈','⭐','👑','🚀','💎'];
      setPlans(data.length > 0 ? data.map((p, i) => ({
        ...p,
        color: p.color || colors[i % colors.length],
        icon:  p.icon  || icons[i % icons.length],
        risk:  p.risk  || (p.profitPercent > 30 ? 'high' : p.profitPercent > 15 ? 'medium' : 'low'),
      })) : FALLBACK_PLANS);
    } catch {
      setPlans(FALLBACK_PLANS);
    } finally { setLoading(false); }
  };

  const fetchMyInvests = async () => {
    if (!token) return;
    setMyLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/my-investments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyInvests(Array.isArray(res.data) ? res.data : []);
    } catch { setMyInvests([]); }
    finally { setMyLoading(false); }
  };

  useEffect(() => { fetchPlans(); }, []);
  useEffect(() => { if (tab === 'my') fetchMyInvests(); }, [tab, token]);

  const onSuccess = async () => {
    showToast('Investment placed successfully! 🎉');
    await refreshUser?.();
    fetchMyInvests();
  };

  /* Stats */
  const totalInvested = myInvests.reduce((s, i) => s + (i.amount || 0), 0);
  const totalProfit   = myInvests.reduce((s, i) => s + (i.profit || 0), 0);
  const activeCount   = myInvests.filter(i => i.status === 'active').length;

  return (
    <>
      <style>{css}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', top:16, right:16, zIndex:9999, background:toast.type==='err'?'#f6465d':'#0ecb81', color:'#fff', padding:'12px 20px', borderRadius:14, fontWeight:700, fontSize:13, display:'flex', alignItems:'center', gap:8, boxShadow:'0 8px 32px rgba(0,0,0,.6)', animation:'fadeUp .3s', maxWidth:340 }}>
          {toast.type === 'err' ? <AlertCircle size={15}/> : <CheckCircle size={15}/>} {toast.msg}
        </div>
      )}

      {/* Modal */}
      {selPlan && (
        <InvestModal
          plan={selPlan}
          user={user}
          token={token}
          onClose={() => setSelPlan(null)}
          onSuccess={onSuccess}
        />
      )}

      <div className="inv">

        {/* ── HERO ── */}
        <div style={{ background:'linear-gradient(135deg,#161a1e 0%,#0b0e11 100%)', borderBottom:'1px solid #1e2329', padding:'28px 20px 24px' }}>
          <div style={{ maxWidth:1200, margin:'0 auto' }}>

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:16, flexWrap:'wrap', marginBottom:24 }}>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                  <div style={{ width:40, height:40, borderRadius:12, background:'rgba(240,185,11,.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <PieChart size={20} style={{ color:'#f0b90b' }}/>
                  </div>
                  <h1 style={{ fontSize:22, fontWeight:800, color:'#eaecef' }}>AI Trading Plans</h1>
                </div>
                <p style={{ fontSize:13, color:'#848e9c', maxWidth:480, lineHeight:1.6 }}>
                  Grow your portfolio with our AI-powered investment plans. Earn passive income from crypto markets 24/7.
                </p>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={() => navigate('/my-investments')}
                  style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 16px', background:'#1e2329', border:'1px solid #2b3139', borderRadius:10, color:'#848e9c', cursor:'pointer', fontSize:13, fontFamily:'inherit', transition:'all .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='#f0b90b'; e.currentTarget.style.color='#eaecef'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='#2b3139'; e.currentTarget.style.color='#848e9c'; }}>
                  <BarChart2 size={14}/> History
                </button>
                <button onClick={fetchPlans}
                  style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 16px', background:'#1e2329', border:'1px solid #2b3139', borderRadius:10, color:'#848e9c', cursor:'pointer', fontSize:13, fontFamily:'inherit' }}>
                  <RefreshCw size={14}/> Refresh
                </button>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }} className="hero-stats">
              {[
                { l:'Your Balance',     v:`$${(user?.balance||0).toFixed(2)}`,   c:'#f0b90b', icon:<DollarSign size={16}/> },
                { l:'Total Invested',   v:`$${totalInvested.toFixed(2)}`,         c:'#627eea', icon:<TrendingUp size={16}/> },
                { l:'Total Profit',     v:`+$${totalProfit.toFixed(2)}`,          c:'#0ecb81', icon:<ArrowUpRight size={16}/> },
                { l:'Active Plans',     v:activeCount,                             c:'#eaecef', icon:<Zap size={16}/> },
              ].map(s => (
                <div key={s.l} style={{ background:'rgba(255,255,255,.04)', border:'1px solid #1e2329', borderRadius:14, padding:'14px 16px', display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:s.c+'18', display:'flex', alignItems:'center', justifyContent:'center', color:s.c, flexShrink:0 }}>
                    {s.icon}
                  </div>
                  <div>
                    <div style={{ fontSize:10, color:'#5e6673', marginBottom:3, textTransform:'uppercase', letterSpacing:'.05em' }}>{s.l}</div>
                    <div style={{ fontSize:16, fontWeight:800, color:s.c }}>{s.v}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div style={{ borderBottom:'1px solid #1e2329', padding:'0 20px', display:'flex' }}>
          {[{k:'plans',l:'Investment Plans'},{k:'my',l:`My Investments${activeCount>0?` (${activeCount})`:''}`},{k:'faq',l:'FAQ'}].map(t => (
            <button key={t.k} className={`inv-tab${tab===t.k?' on':''}`} onClick={()=>setTab(t.k)}>{t.l}</button>
          ))}
        </div>

        <div style={{ maxWidth:1200, margin:'0 auto', padding:'24px 20px 80px' }}>

          {/* ── PLANS TAB ── */}
          {tab === 'plans' && (
            <>
              {loading ? (
                <div style={{ textAlign:'center', padding:60 }}>
                  <Loader2 size={28} className="spin" style={{ color:'#f0b90b', display:'inline-block' }}/>
                  <p style={{ color:'#848e9c', fontSize:13, marginTop:12 }}>Loading plans...</p>
                </div>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }} className="plan-grid">
                  {plans.map(plan => {
                    const color = plan.color || '#f0b90b';
                    return (
                      <div key={plan._id} className="plan-card" style={{ '--plan-color': color }}>

                        {/* Popular badge */}
                        {plan.popular && (
                          <div style={{ position:'absolute', top:16, right:16, background:color, color:'#0b0e11', fontSize:10, fontWeight:800, padding:'3px 10px', borderRadius:20 }}>
                            🔥 POPULAR
                          </div>
                        )}

                        {/* Icon + Name */}
                        <div style={{ marginBottom:18 }}>
                          <div style={{ fontSize:36, marginBottom:10 }}>{plan.icon || '💼'}</div>
                          <h2 style={{ fontSize:18, fontWeight:800, color:'#eaecef', marginBottom:6 }}>{plan.name}</h2>
                          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                            <span style={{ background:RISK_COLOR[plan.risk]+'18', color:RISK_COLOR[plan.risk]||'#f0b90b', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700 }}>
                              {RISK_LABEL[plan.risk] || 'Risk'}
                            </span>
                            <span style={{ background:'rgba(255,255,255,.06)', color:'#848e9c', padding:'3px 10px', borderRadius:20, fontSize:11 }}>
                              ⏱ {plan.duration || plan.durationHours}h
                            </span>
                          </div>
                        </div>

                        {/* ROI big display */}
                        <div style={{ textAlign:'center', padding:'18px 0', marginBottom:18, background:'rgba(255,255,255,.04)', borderRadius:14 }}>
                          <div style={{ fontSize:10, color:'#5e6673', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:6 }}>Profit Return</div>
                          <div style={{ fontSize:40, fontWeight:900, color, lineHeight:1 }}>+{plan.profitPercent}%</div>
                          <div style={{ fontSize:12, color:'#848e9c', marginTop:4 }}>on invested amount</div>
                        </div>

                        {/* Stats */}
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:20 }}>
                          {[
                            { l:'Min Investment', v:`$${plan.minAmount.toLocaleString()}` },
                            { l:'Max Investment', v:`$${plan.maxAmount.toLocaleString()}` },
                          ].map(s => (
                            <div key={s.l} className="stat-chip">
                              <div style={{ fontSize:10, color:'#5e6673', marginBottom:4, textTransform:'uppercase' }}>{s.l}</div>
                              <div style={{ fontSize:13, fontWeight:700, color:'#eaecef' }}>{s.v}</div>
                            </div>
                          ))}
                        </div>

                        {/* Example profit */}
                        <div style={{ background:'rgba(255,255,255,.03)', borderRadius:10, padding:'10px 12px', marginBottom:18, fontSize:12 }}>
                          <div style={{ color:'#5e6673', marginBottom:4 }}>Example: $1,000 invested →</div>
                          <div style={{ color:'#0ecb81', fontWeight:700 }}>+${(1000 * plan.profitPercent / 100).toFixed(2)} profit = ${(1000 + 1000 * plan.profitPercent / 100).toFixed(2)} total</div>
                        </div>

                        {/* Features */}
                        <div style={{ marginBottom:20 }}>
                          {['AI-managed portfolio', '24/7 automated trading', 'Auto profit release'].map(f => (
                            <div key={f} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                              <CheckCircle size={13} style={{ color, flexShrink:0 }}/>
                              <span style={{ fontSize:12, color:'#848e9c' }}>{f}</span>
                            </div>
                          ))}
                        </div>

                        {/* Button */}
                        {token ? (
                          <button className="invest-btn" style={{ '--plan-color': color }} onClick={() => setSelPlan(plan)}>
                            <Zap size={15}/> Invest Now
                          </button>
                        ) : (
                          <button className="invest-btn" style={{ '--plan-color': color }} onClick={() => navigate('/login')}>
                            Login to Invest
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Info row */}
              <div style={{ marginTop:32, display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }} className="plan-grid">
                {[
                  { icon:'🛡️', title:'Safe & Secure',      desc:'All investments are protected by multi-layer security protocols.' },
                  { icon:'⚡', title:'Instant Returns',    desc:'Profits are automatically added to your balance when the plan completes.' },
                  { icon:'💰', title:'No Hidden Fees',     desc:'Zero management fees. You keep 100% of your earnings.' },
                ].map(f => (
                  <div key={f.title} style={{ background:'#161a1e', border:'1px solid #1e2329', borderRadius:16, padding:'18px 20px', display:'flex', gap:14 }}>
                    <span style={{ fontSize:28, flexShrink:0 }}>{f.icon}</span>
                    <div>
                      <h4 style={{ color:'#eaecef', fontWeight:700, fontSize:14, marginBottom:6 }}>{f.title}</h4>
                      <p style={{ color:'#848e9c', fontSize:12, lineHeight:1.6 }}>{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── MY INVESTMENTS TAB ── */}
          {tab === 'my' && (
            <>
              {!token ? (
                <div style={{ textAlign:'center', padding:60, color:'#5e6673' }}>
                  <PieChart size={48} style={{ opacity:.15, margin:'0 auto 16px', display:'block' }}/>
                  <p style={{ fontSize:15, color:'#eaecef', fontWeight:600, marginBottom:8 }}>Login Required</p>
                  <p style={{ fontSize:13, marginBottom:20 }}>Login to view your investment portfolio</p>
                  <button onClick={() => navigate('/login')}
                    style={{ padding:'10px 28px', background:'#f0b90b', border:'none', borderRadius:10, color:'#0b0e11', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                    Login Now
                  </button>
                </div>
              ) : myLoading ? (
                <div style={{ textAlign:'center', padding:60 }}>
                  <Loader2 size={24} className="spin" style={{ color:'#f0b90b', display:'inline-block' }}/>
                </div>
              ) : myInvests.length === 0 ? (
                <div style={{ textAlign:'center', padding:60, color:'#5e6673' }}>
                  <PieChart size={48} style={{ opacity:.15, margin:'0 auto 16px', display:'block' }}/>
                  <p style={{ fontSize:15, color:'#eaecef', fontWeight:600, marginBottom:8 }}>No Active Investments</p>
                  <p style={{ fontSize:13, marginBottom:20 }}>Choose a plan and start earning</p>
                  <button onClick={() => setTab('plans')}
                    style={{ padding:'10px 28px', background:'#f0b90b', border:'none', borderRadius:10, color:'#0b0e11', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                    View Plans
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }} className="hero-stats">
                    {[
                      { l:'Total Invested', v:`$${totalInvested.toFixed(2)}`, c:'#627eea' },
                      { l:'Total Profit',   v:`+$${totalProfit.toFixed(2)}`,  c:'#0ecb81' },
                      { l:'Active Plans',   v:activeCount,                     c:'#f0b90b' },
                      { l:'Completed',      v:myInvests.filter(i=>i.status==='completed').length, c:'#848e9c' },
                    ].map(s => (
                      <div key={s.l} style={{ background:'#161a1e', border:'1px solid #1e2329', borderRadius:12, padding:'14px 16px', textAlign:'center' }}>
                        <div style={{ fontSize:10, color:'#5e6673', textTransform:'uppercase', marginBottom:4 }}>{s.l}</div>
                        <div style={{ fontSize:18, fontWeight:800, color:s.c }}>{s.v}</div>
                      </div>
                    ))}
                  </div>

                  {/* Table */}
                  <div style={{ background:'#161a1e', border:'1px solid #1e2329', borderRadius:14, overflow:'hidden' }}>
                    <div className="my-inv-row" style={{ background:'#0b0e11', cursor:'default', fontSize:10, fontWeight:700, color:'#5e6673', textTransform:'uppercase', letterSpacing:'.05em', borderBottom:'1px solid #1e2329' }}>
                      <span>Plan</span>
                      <span style={{ textAlign:'right' }}>Amount</span>
                      <span style={{ textAlign:'right' }} className="my-inv-hide">Profit</span>
                      <span style={{ textAlign:'right' }}>Status</span>
                    </div>
                    {myInvests.map((inv, i) => (
                      <div key={inv._id || i} className="my-inv-row">
                        <div>
                          <div style={{ fontWeight:700, fontSize:13, color:'#eaecef', marginBottom:2 }}>
                            {inv.planId?.name || 'Investment Plan'}
                          </div>
                          <div style={{ fontSize:11, color:'#5e6673' }}>
                            {new Date(inv.createdAt || inv.date).toLocaleDateString()}
                          </div>
                        </div>
                        <div style={{ textAlign:'right', fontWeight:700, color:'#eaecef', fontFamily:'monospace' }}>
                          ${(inv.amount || 0).toFixed(2)}
                        </div>
                        <div style={{ textAlign:'right', fontWeight:700, color:'#0ecb81', fontFamily:'monospace' }} className="my-inv-hide">
                          +${(inv.profit || 0).toFixed(2)}
                        </div>
                        <div style={{ textAlign:'right' }}>
                          <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20,
                            background: inv.status==='active'?'rgba(14,203,129,.1)':inv.status==='completed'?'rgba(99,126,234,.1)':'rgba(240,185,11,.1)',
                            color: inv.status==='active'?'#0ecb81':inv.status==='completed'?'#627eea':'#f0b90b' }}>
                            {inv.status || 'pending'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* ── FAQ TAB ── */}
          {tab === 'faq' && (
            <div style={{ maxWidth:720, margin:'0 auto' }}>
              {[
                { q:'How do AI Trading Plans work?', a:'You invest an amount within the plan limits. Our AI system trades crypto markets 24/7 using advanced algorithms to generate returns. Profits are automatically credited to your account when the plan completes.' },
                { q:'When will I receive my profit?', a:'Profits are released automatically when the investment duration ends. For example, a 24-hour plan pays out within 24 hours of investment. You can track status in "My Investments".' },
                { q:'Is my investment safe?', a:'All investments are secured with multi-layer encryption and risk management systems. However, crypto markets carry inherent risk. Only invest what you can afford to lose.' },
                { q:'Can I withdraw early?', a:'Early withdrawal is not currently supported. Please ensure the investment duration fits your needs before investing.' },
                { q:'What are the fees?', a:'Vinance charges zero management fees. All listed profit percentages are net returns — what you see is what you earn.' },
                { q:'How do I get my money back?', a:'After the plan completes, your principal plus profit is automatically returned to your wallet balance. You can then withdraw or reinvest.' },
              ].map((item, i) => (
                <FAQItem key={i} q={item.q} a={item.a}/>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom:'1px solid #1e2329', marginBottom:4 }}>
      <button onClick={() => setOpen(v => !v)}
        style={{ width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 0', background:'none', border:'none', cursor:'pointer', textAlign:'left', fontFamily:'inherit', gap:16 }}>
        <span style={{ fontSize:15, fontWeight:600, color: open ? '#eaecef' : '#c6cad2' }}>{q}</span>
        <span style={{ color:'#848e9c', flexShrink:0, fontSize:18, transition:'transform .2s', transform: open ? 'rotate(45deg)' : 'none' }}>+</span>
      </button>
      {open && (
        <div style={{ padding:'0 0 18px', fontSize:13, color:'#848e9c', lineHeight:1.7, animation:'fadeUp .2s' }}>
          {a}
        </div>
      )}
    </div>
  );
}
