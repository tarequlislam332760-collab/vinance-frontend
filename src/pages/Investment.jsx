import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import {
  PieChart, TrendingUp, Clock, Shield, Zap,
  CheckCircle, AlertCircle, Loader2, X, RefreshCw,
  DollarSign, BarChart2, Award, Lock
} from 'lucide-react';

const API_URL = 'https://vinance-backend-1.onrender.com';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  .inv { font-family:'Inter',sans-serif; background:#0b0e11; color:#eaecef; min-height:100vh; }
  .inv * { box-sizing:border-box; margin:0; padding:0; }
  .inv ::-webkit-scrollbar { width:4px; } .inv ::-webkit-scrollbar-thumb { background:#2b3139; border-radius:4px; }
  .inv-card { background:#161a1e; border:1px solid #1e2329; border-radius:20px; padding:22px; transition:all .2s; position:relative; overflow:hidden; }
  .inv-card:hover { border-color:rgba(240,185,11,.3); transform:translateY(-2px); box-shadow:0 12px 40px rgba(0,0,0,.4); }
  .inv-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:var(--plan-color,#f0b90b); }
  .inv-btn { display:inline-flex; align-items:center; gap:6px; padding:10px 20px; border:none; border-radius:10px; font-size:13px; font-weight:700; cursor:pointer; font-family:inherit; transition:all .15s; white-space:nowrap; }
  .inv-btn.gold { background:#f0b90b; color:#0b0e11; }
  .inv-btn.gold:hover { background:#d4a30a; }
  .inv-btn.gold:disabled { background:#2b3139; color:#5e6673; cursor:not-allowed; }
  .inv-btn.gray { background:#1e2329; color:#848e9c; border:1px solid #2b3139; }
  .inv-btn.gray:hover { color:#eaecef; }
  .inv-input { width:100%; background:#0b0e11; border:1px solid #2b3139; border-radius:10px; padding:12px 14px; color:#eaecef; font-size:15px; outline:none; font-family:monospace; transition:border .15s; font-weight:700; }
  .inv-input:focus { border-color:#f0b90b; }
  .inv-input::placeholder { color:#5e6673; font-weight:400; font-family:'Inter',sans-serif; }
  .inv-tab { padding:10px 20px; font-size:13px; font-weight:600; background:transparent; border:none; color:#848e9c; cursor:pointer; border-bottom:2px solid transparent; white-space:nowrap; font-family:inherit; transition:all .15s; }
  .inv-tab.on { color:#eaecef; border-bottom-color:#f0b90b; }
  .inv-tab:hover { color:#eaecef; }
  .modal-bg { position:fixed; inset:0; background:rgba(0,0,0,.88); backdrop-filter:blur(8px); z-index:9999; display:flex; align-items:center; justify-content:center; padding:16px; overflow-y:auto; }
  .modal-box { background:#161a1e; border:1px solid #2b3139; border-radius:22px; padding:26px; width:100%; max-width:460px; max-height:92vh; overflow-y:auto; }
  .stat-row { display:flex; justify-content:space-between; align-items:center; padding:9px 0; border-bottom:1px solid #1e232940; }
  .stat-row:last-child { border-bottom:none; }
  .badge { display:inline-flex; align-items:center; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; }
  @keyframes spin { to { transform:rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
  .spin { animation:spin .8s linear infinite; }
  .fade { animation:fadeUp .25s; }
  @media(max-width:900px) { .inv-grid { grid-template-columns:repeat(2,1fr)!important; } }
  @media(max-width:600px) {
    .inv-grid { grid-template-columns:1fr!important; }
    .inv-stats { grid-template-columns:1fr 1fr!important; }
    .modal-box { padding:18px; }
    .hide-sm { display:none!important; }
  }
`;

const PLAN_COLORS = ['#f0b90b','#0ecb81','#627eea','#f6465d','#9b58f0','#00b4e6'];

/* ── Safe helpers — never crash on bad data ── */
const safeNum   = (v, fallback = 0) => { const n = parseFloat(v); return isNaN(n) ? fallback : n; };
const safeMin   = (p) => Math.min(safeNum(p.minAmount, 0), safeNum(p.maxAmount, 0));
const safeMax   = (p) => Math.max(safeNum(p.minAmount, 0), safeNum(p.maxAmount, 0));
const safeDur   = (p) => safeNum(p.duration || p.durationHours, 24);
const safeProfit= (p) => safeNum(p.profitPercent, 0);

const getRisk = pct => {
  if (pct <= 8)  return { label:'Low Risk',    color:'#0ecb81' };
  if (pct <= 20) return { label:'Medium Risk', color:'#f0b90b' };
  return               { label:'High Risk',   color:'#f6465d' };
};

/* ════════════════ MODAL ════════════════ */
const InvestModal = ({ plan, user, token, onClose, onSuccess, showToast }) => {
  const [amount,    setAmount]    = useState('');
  const [investing, setInvesting] = useState(false);
  const [done,      setDone]      = useState(false);
  const [err,       setErr]       = useState('');

  const minAmt  = safeMin(plan);
  const maxAmt  = safeMax(plan);
  const dur     = safeDur(plan);
  const profit  = safeProfit(plan);
  const balance = safeNum(user?.balance, 0);

  const amt     = safeNum(amount, 0);
  const estProfit = amt > 0 ? (amt * profit / 100).toFixed(2) : '0.00';
  const estTotal  = amt > 0 ? (amt + amt * profit / 100).toFixed(2) : '0.00';

  const quickFill = pct => {
    const val = Math.min(balance * pct / 100, maxAmt);
    setAmount(Math.max(val, 0).toFixed(2));
  };

  const submit = async () => {
    setErr('');
    if (!amt || amt <= 0)         return setErr('Enter a valid amount');
    if (minAmt > 0 && amt < minAmt) return setErr(`Minimum investment is $${minAmt}`);
    if (maxAmt > 0 && amt > maxAmt) return setErr(`Maximum investment is $${maxAmt}`);
    if (amt > balance)            return setErr('Insufficient balance');

    setInvesting(true);
    try {
      await axios.post(`${API_URL}/api/invest`,
        { planId: plan._id, amount: amt },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDone(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1500);
    } catch (e) {
      setErr(e.response?.data?.message || 'Investment failed. Try again.');
    } finally { setInvesting(false); }
  };

  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && !investing && onClose()}>
      <div className="modal-box fade">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <div>
            <h3 style={{ fontSize:17, fontWeight:800, color:'#eaecef' }}>{plan.name || 'Investment Plan'}</h3>
            <p style={{ fontSize:12, color:'#848e9c', marginTop:3 }}>
              +{profit}% return · {dur}h duration
            </p>
          </div>
          {!done && <button onClick={onClose} style={{ background:'none', border:'none', color:'#848e9c', cursor:'pointer' }}><X size={18}/></button>}
        </div>

        {done ? (
          <div style={{ textAlign:'center', padding:'20px 0' }}>
            <CheckCircle size={52} style={{ color:'#0ecb81', margin:'0 auto 14px', display:'block' }}/>
            <h3 style={{ color:'#eaecef', fontWeight:800, fontSize:17, marginBottom:8 }}>Investment Confirmed!</h3>
            <p style={{ color:'#848e9c', fontSize:13 }}>${amt.toFixed(2)} invested in {plan.name}</p>
          </div>
        ) : (
          <>
            {/* Plan summary */}
            <div style={{ background:'#0b0e11', borderRadius:12, padding:14, marginBottom:18, border:'1px solid #2b3139' }}>
              {[
                { l:'Min Investment', v: minAmt > 0 ? `$${minAmt.toLocaleString()}` : 'No minimum' },
                { l:'Max Investment', v: maxAmt > 0 ? `$${maxAmt.toLocaleString()}` : 'No maximum' },
                { l:'Profit Rate',    v:`+${profit}%`, c:'#0ecb81' },
                { l:'Duration',       v:`${dur} hours` },
                { l:'Your Balance',   v:`$${balance.toFixed(2)}`, c:'#f0b90b' },
              ].map(s => (
                <div key={s.l} className="stat-row">
                  <span style={{ fontSize:12, color:'#848e9c' }}>{s.l}</span>
                  <span style={{ fontSize:13, fontWeight:700, color: s.c || '#eaecef' }}>{s.v}</span>
                </div>
              ))}
            </div>

            {/* Amount input */}
            <label style={{ fontSize:11, color:'#848e9c', fontWeight:700, textTransform:'uppercase', marginBottom:7, display:'block' }}>
              Investment Amount (USDT)
            </label>
            <div style={{ position:'relative', marginBottom:10 }}>
              <span style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'#f0b90b', fontWeight:800, fontSize:16 }}>$</span>
              <input className="inv-input" type="number" placeholder="0.00"
                value={amount} onChange={e => { setAmount(e.target.value); setErr(''); }}
                style={{ paddingLeft:30, paddingRight:55 }}/>
              <span style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', color:'#848e9c', fontSize:11, fontWeight:700 }}>USDT</span>
            </div>

            {/* Quick % */}
            <div style={{ display:'flex', gap:6, marginBottom:18 }}>
              {[25,50,75,100].map(p => (
                <button key={p} className="inv-btn gray" style={{ flex:1, padding:'7px 0', fontSize:11, justifyContent:'center' }}
                  onClick={() => quickFill(p)}>{p}%</button>
              ))}
            </div>

            {/* Estimate */}
            {amt > 0 && (
              <div style={{ background:'rgba(14,203,129,.06)', border:'1px solid rgba(14,203,129,.2)', borderRadius:12, padding:'12px 16px', marginBottom:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <p style={{ fontSize:11, color:'#848e9c', marginBottom:4 }}>Estimated Profit</p>
                    <p style={{ fontSize:18, fontWeight:800, color:'#0ecb81' }}>+${estProfit}</p>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <p style={{ fontSize:11, color:'#848e9c', marginBottom:4 }}>Total Return</p>
                    <p style={{ fontSize:16, fontWeight:700, color:'#eaecef' }}>${estTotal}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {err && (
              <div style={{ display:'flex', gap:8, alignItems:'center', background:'rgba(246,70,93,.08)', border:'1px solid rgba(246,70,93,.2)', borderRadius:8, padding:'10px 12px', marginBottom:14 }}>
                <AlertCircle size={14} style={{ color:'#f6465d', flexShrink:0 }}/>
                <span style={{ fontSize:12, color:'#f6465d' }}>{err}</span>
              </div>
            )}

            <div style={{ display:'flex', gap:10 }}>
              <button className="inv-btn gray" style={{ flex:1 }} onClick={onClose} disabled={investing}>Cancel</button>
              <button className="inv-btn gold" style={{ flex:2, justifyContent:'center' }}
                onClick={submit} disabled={investing || amt <= 0}>
                {investing ? <><Loader2 size={14} className="spin"/> Processing...</> : <><Zap size={14}/> Invest Now</>}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* ════════════════ MAIN PAGE ════════════════ */
export default function Investment() {
  const navigate = useNavigate();
  const { user, token, refreshUser } = useContext(UserContext);

  const [plans,     setPlans]     = useState([]);
  const [myInvests, setMyInvests] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [tab,       setTab]       = useState('plans');
  const [selPlan,   setSelPlan]   = useState(null);
  const [toast,     setToast]     = useState(null);
  const [tick,      setTick]      = useState(0);

  const showToast = (msg, type = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [pRes, mRes] = await Promise.all([
          axios.get(`${API_URL}/api/plans`),
          token
            ? axios.get(`${API_URL}/api/my-investments`, { headers: { Authorization: `Bearer ${token}` } })
            : Promise.resolve({ data: [] }),
        ]);
        /* Safe parse — never crash on malformed data */
        const rawPlans = Array.isArray(pRes.data) ? pRes.data : [];
        setPlans(rawPlans.map((p, i) => ({
          ...p,
          _safe_min:    safeMin(p),
          _safe_max:    safeMax(p),
          _safe_dur:    safeDur(p),
          _safe_profit: safeProfit(p),
          _color:       PLAN_COLORS[i % PLAN_COLORS.length],
        })));
        setMyInvests(Array.isArray(mRes.data) ? mRes.data : []);
      } catch {
        showToast('Could not load plans', 'err');
      } finally { setLoading(false); }
    })();
  }, [token, tick]);

  const onSuccess = async () => {
    showToast('Investment placed successfully! 🎉');
    try { await refreshUser?.(); } catch {}
    setTick(t => t + 1);
    setTab('my-investments');
  };

  const totalInvested = myInvests.reduce((s, i) => s + safeNum(i.amount,  0), 0);
  const totalProfit   = myInvests.reduce((s, i) => s + safeNum(i.profit,  0), 0);
  const activeCount   = myInvests.filter(i => i.status === 'active').length;

  /* ─── LOADING ─── */
  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#0b0e11', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:14 }}>
      <Loader2 size={36} style={{ color:'#f0b90b', animation:'spin .8s linear infinite' }}/>
      <span style={{ color:'#f0b90b', fontWeight:700, fontSize:12, textTransform:'uppercase', letterSpacing:3 }}>Loading Plans...</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <>
      <style>{CSS}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', top:16, right:16, zIndex:99999, background:toast.type==='err'?'#f6465d':'#0ecb81', color:'#fff', padding:'12px 20px', borderRadius:14, fontWeight:700, fontSize:13, display:'flex', alignItems:'center', gap:8, boxShadow:'0 8px 32px rgba(0,0,0,.5)', animation:'fadeUp .3s', maxWidth:340 }}>
          {toast.type==='err' ? <AlertCircle size={15}/> : <CheckCircle size={15}/>} {toast.msg}
        </div>
      )}

      {/* Modal */}
      {selPlan && (
        <InvestModal plan={selPlan} user={user} token={token}
          onClose={() => setSelPlan(null)} onSuccess={onSuccess} showToast={showToast}/>
      )}

      <div className="inv">

        {/* ── STICKY HEADER ── */}
        <div style={{ background:'#0b0e11', borderBottom:'1px solid #1e2329', padding:'13px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10, position:'sticky', top:0, zIndex:50 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <PieChart size={19} style={{ color:'#f0b90b' }}/>
            <h1 style={{ fontSize:17, fontWeight:800, color:'#eaecef' }}>Investment Plans</h1>
          </div>
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            <span style={{ fontSize:12, color:'#848e9c' }}>
              Balance: <strong style={{ color:'#f0b90b' }}>${safeNum(user?.balance,0).toFixed(2)}</strong>
            </span>
            <button className="inv-btn gray" style={{ padding:'6px 10px' }} onClick={() => setTick(t=>t+1)}>
              <RefreshCw size={13}/>
            </button>
          </div>
        </div>

        {/* ── HERO ── */}
        <div style={{ background:'linear-gradient(135deg,#161a1e,#1a2028,#0d1117)', padding:'30px 20px', borderBottom:'1px solid #1e2329' }}>
          <div style={{ maxWidth:1100, margin:'0 auto' }}>
            <h2 style={{ fontSize:24, fontWeight:800, color:'#eaecef', marginBottom:8 }}>
              Earn Passive Income with <span style={{ color:'#f0b90b' }}>AI Trading Plans</span>
            </h2>
            <p style={{ color:'#848e9c', fontSize:13, maxWidth:480, lineHeight:1.7, marginBottom:20 }}>
              Deposit once, earn automatically. Our AI trading plans generate consistent returns through diversified crypto strategies.
            </p>

            {/* Stats */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }} className="inv-stats">
              {[
                { l:'Your Balance',   v:`$${safeNum(user?.balance,0).toFixed(2)}`, c:'#f0b90b', icon:<DollarSign size={15}/> },
                { l:'Total Invested', v:`$${totalInvested.toFixed(2)}`,              c:'#627eea', icon:<TrendingUp size={15}/> },
                { l:'Total Profit',   v:`+$${totalProfit.toFixed(2)}`,               c:'#0ecb81', icon:<Award size={15}/> },
                { l:'Active Plans',   v:activeCount,                                  c:'#eaecef', icon:<Zap size={15}/> },
              ].map(s => (
                <div key={s.l} style={{ background:'rgba(255,255,255,.04)', border:'1px solid #1e2329', borderRadius:14, padding:'14px 16px', display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:34, height:34, borderRadius:9, background:s.c+'18', display:'flex', alignItems:'center', justifyContent:'center', color:s.c, flexShrink:0 }}>{s.icon}</div>
                  <div>
                    <div style={{ fontSize:9, color:'#5e6673', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:2 }}>{s.l}</div>
                    <div style={{ fontSize:15, fontWeight:800, color:s.c }}>{s.v}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div style={{ display:'flex', borderBottom:'1px solid #1e2329', padding:'0 20px', overflowX:'auto', scrollbarWidth:'none' }}>
          {[
            { k:'plans',          l:'All Plans'   },
            { k:'my-investments', l:`My Investments${myInvests.length>0?` (${myInvests.length})`:''}`},
          ].map(t => (
            <button key={t.k} className={`inv-tab${tab===t.k?' on':''}`} onClick={()=>setTab(t.k)}>{t.l}</button>
          ))}
        </div>

        <div style={{ maxWidth:1100, margin:'0 auto', padding:'22px 20px 80px' }}>

          {/* ══ PLANS TAB ══ */}
          {tab === 'plans' && (
            <>
              {/* Admin notice if bad data */}
              {plans.some(p => safeNum(p.minAmount,0) > safeNum(p.maxAmount,0)) && user?.role === 'admin' && (
                <div style={{ background:'rgba(246,70,93,.08)', border:'1px solid rgba(246,70,93,.2)', borderRadius:12, padding:'12px 16px', marginBottom:20, display:'flex', gap:10 }}>
                  <AlertCircle size={16} style={{ color:'#f6465d', flexShrink:0 }}/>
                  <div style={{ fontSize:12, color:'#848e9c' }}>
                    <strong style={{ color:'#f6465d' }}>Admin Notice:</strong> Some plans have minAmount &gt; maxAmount in MongoDB. 
                    Please fix them in MongoDB Atlas → VinanceDB → plans → edit document. 
                    The page displays them with min/max swapped automatically.
                  </div>
                </div>
              )}

              {plans.length === 0 ? (
                <div style={{ textAlign:'center', padding:80, color:'#5e6673' }}>
                  <PieChart size={52} style={{ opacity:.1, margin:'0 auto 16px', display:'block' }}/>
                  <p style={{ fontSize:16, fontWeight:600, color:'#eaecef', marginBottom:8 }}>No Plans Available</p>
                  <p style={{ fontSize:13, marginBottom:20 }}>Add plans from Admin Panel → Manage Plans</p>
                  {user?.role === 'admin' && (
                    <button className="inv-btn gold" onClick={()=>navigate('/admin/manage-plans')}>Go to Admin</button>
                  )}
                </div>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }} className="inv-grid">
                  {plans.map((plan, i) => {
                    const color  = plan._color;
                    const minAmt = plan._safe_min;
                    const maxAmt = plan._safe_max;
                    const dur    = plan._safe_dur;
                    const pct    = plan._safe_profit;
                    const risk   = getRisk(pct);

                    return (
                      <div key={plan._id} className="inv-card fade" style={{ '--plan-color': color }}>

                        {/* Popular badge */}
                        {i === 1 && (
                          <div style={{ position:'absolute', top:14, right:14, background:color, color:'#0b0e11', fontSize:9, fontWeight:800, padding:'3px 9px', borderRadius:20 }}>
                            POPULAR
                          </div>
                        )}

                        {/* Icon + name */}
                        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:18 }}>
                          <div style={{ width:48, height:48, borderRadius:14, background:`${color}18`, border:`1px solid ${color}30`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            <BarChart2 size={22} style={{ color }}/>
                          </div>
                          <div>
                            <h3 style={{ fontSize:15, fontWeight:800, color:'#eaecef', marginBottom:4 }}>{plan.name || 'Plan'}</h3>
                            <span className="badge" style={{ background:`${risk.color}18`, color:risk.color, border:`1px solid ${risk.color}30` }}>
                              {risk.label}
                            </span>
                          </div>
                        </div>

                        {/* ROI */}
                        <div style={{ background:`${color}08`, border:`1px solid ${color}20`, borderRadius:12, padding:'16px 20px', marginBottom:16, textAlign:'center' }}>
                          <p style={{ fontSize:10, color:'#848e9c', marginBottom:5, textTransform:'uppercase', fontWeight:700, letterSpacing:1 }}>Returns</p>
                          <div style={{ fontSize:38, fontWeight:900, color, lineHeight:1 }}>+{pct}%</div>
                          <p style={{ fontSize:11, color:'#848e9c', marginTop:5 }}>in {dur} hours</p>
                        </div>

                        {/* Details */}
                        <div style={{ marginBottom:16 }}>
                          {[
                            { l:'Min Investment', v: minAmt > 0 ? `$${minAmt.toLocaleString()}` : 'No minimum' },
                            { l:'Max Investment', v: maxAmt > 0 ? `$${maxAmt.toLocaleString()}` : 'No maximum' },
                            { l:'Duration',       v:`${dur} hours` },
                            { l:'Example (↑$1K)', v:`+$${(1000 * pct / 100).toFixed(0)}` },
                          ].map(s => (
                            <div key={s.l} className="stat-row">
                              <span style={{ fontSize:12, color:'#848e9c' }}>{s.l}</span>
                              <span style={{ fontSize:12, fontWeight:700, color:'#eaecef' }}>{s.v}</span>
                            </div>
                          ))}
                        </div>

                        {/* Features */}
                        <div style={{ marginBottom:18 }}>
                          {['Automated AI trading','Principal returned at maturity','Real-time tracking'].map(f => (
                            <div key={f} style={{ display:'flex', alignItems:'center', gap:7, fontSize:11, color:'#848e9c', marginBottom:5 }}>
                              <CheckCircle size={12} style={{ color, flexShrink:0 }}/> {f}
                            </div>
                          ))}
                        </div>

                        <button className="inv-btn gold" style={{ width:'100%', justifyContent:'center', padding:'13px 0', fontSize:14 }}
                          onClick={() => token ? setSelPlan(plan) : navigate('/login')}>
                          <Zap size={14}/> Invest Now
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* How it works */}
              <div style={{ marginTop:36, background:'#161a1e', border:'1px solid #1e2329', borderRadius:20, padding:26 }}>
                <h3 style={{ fontSize:15, fontWeight:800, color:'#eaecef', marginBottom:20, textAlign:'center' }}>How It Works</h3>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:16 }}>
                  {[
                    { step:'1', icon:'💰', title:'Choose a Plan',     desc:'Select a plan matching your investment goals.' },
                    { step:'2', icon:'⚡', title:'Deposit Funds',     desc:'Balance is deducted instantly on confirmation.'  },
                    { step:'3', icon:'🤖', title:'AI Trades for You', desc:'Algorithms execute trades 24/7.'                 },
                    { step:'4', icon:'📈', title:'Collect Profit',    desc:'Principal + profit auto-returned at maturity.'  },
                  ].map(s => (
                    <div key={s.step} style={{ textAlign:'center', padding:'14px 10px' }}>
                      <div style={{ fontSize:30, marginBottom:8 }}>{s.icon}</div>
                      <div style={{ width:22, height:22, borderRadius:'50%', background:'rgba(240,185,11,.15)', color:'#f0b90b', fontSize:10, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 8px' }}>{s.step}</div>
                      <p style={{ fontSize:12, fontWeight:700, color:'#eaecef', marginBottom:5 }}>{s.title}</p>
                      <p style={{ fontSize:11, color:'#848e9c', lineHeight:1.6 }}>{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ══ MY INVESTMENTS TAB ══ */}
          {tab === 'my-investments' && (
            <>
              {!token ? (
                <div style={{ textAlign:'center', padding:80, color:'#5e6673' }}>
                  <Lock size={48} style={{ opacity:.1, margin:'0 auto 16px', display:'block' }}/>
                  <p style={{ fontSize:15, fontWeight:600, color:'#eaecef', marginBottom:8 }}>Login Required</p>
                  <p style={{ fontSize:13, marginBottom:20 }}>Login to view your investments</p>
                  <button className="inv-btn gold" onClick={() => navigate('/login')}>Login Now</button>
                </div>
              ) : myInvests.length === 0 ? (
                <div style={{ textAlign:'center', padding:80, color:'#5e6673' }}>
                  <Lock size={48} style={{ opacity:.1, margin:'0 auto 16px', display:'block' }}/>
                  <p style={{ fontSize:15, fontWeight:600, color:'#eaecef', marginBottom:8 }}>No Investments Yet</p>
                  <p style={{ fontSize:13, marginBottom:20 }}>Choose a plan and start earning</p>
                  <button className="inv-btn gold" onClick={() => setTab('plans')}><Zap size={14}/> Browse Plans</button>
                </div>
              ) : (
                <>
                  {/* Portfolio stats */}
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:22 }} className="inv-stats">
                    {[
                      { l:'Invested', v:`$${totalInvested.toFixed(2)}`,           c:'#627eea' },
                      { l:'Profit',   v:`+$${totalProfit.toFixed(2)}`,             c:'#0ecb81' },
                      { l:'Active',   v:activeCount,                                c:'#f0b90b' },
                      { l:'Completed',v:myInvests.filter(i=>i.status==='completed').length, c:'#848e9c' },
                    ].map(s => (
                      <div key={s.l} style={{ background:'#161a1e', border:'1px solid #1e2329', borderRadius:12, padding:'12px 14px', textAlign:'center' }}>
                        <div style={{ fontSize:9, color:'#5e6673', textTransform:'uppercase', marginBottom:4 }}>{s.l}</div>
                        <div style={{ fontSize:17, fontWeight:800, color:s.c }}>{s.v}</div>
                      </div>
                    ))}
                  </div>

                  {/* Cards */}
                  <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                    {myInvests.map((inv, i) => {
                      const color    = PLAN_COLORS[i % PLAN_COLORS.length];
                      const isActive = inv.status === 'active';
                      const expireAt = inv.expireAt ? new Date(inv.expireAt) : null;
                      const msLeft   = expireAt ? expireAt - new Date() : 0;
                      const hLeft    = Math.max(0, Math.floor(msLeft / 3600000));
                      const mLeft    = Math.max(0, Math.floor((msLeft % 3600000) / 60000));
                      const amt      = safeNum(inv.amount, 0);
                      const pft      = safeNum(inv.profit, 0);

                      return (
                        <div key={inv._id || i} className="inv-card fade" style={{ '--plan-color': color }}>
                          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                              <div style={{ width:44, height:44, borderRadius:12, background:`${color}18`, border:`1px solid ${color}30`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                <BarChart2 size={20} style={{ color }}/>
                              </div>
                              <div>
                                <p style={{ fontWeight:800, fontSize:14, color:'#eaecef', marginBottom:4 }}>{inv.planId?.name || 'Investment Plan'}</p>
                                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                                  <span className="badge" style={{ background:isActive?'rgba(14,203,129,.12)':'rgba(132,142,156,.1)', color:isActive?'#0ecb81':'#848e9c' }}>
                                    {isActive ? '● Active' : '✓ Completed'}
                                  </span>
                                  {inv.planId?.profitPercent && (
                                    <span style={{ fontSize:11, color:'#848e9c' }}>+{inv.planId.profitPercent}%</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
                              {[
                                { l:'Invested', v:`$${amt.toFixed(2)}`,       c:'#eaecef' },
                                { l:'Profit',   v:`+$${pft.toFixed(2)}`,      c:'#0ecb81' },
                                { l:'Total',    v:`$${(amt+pft).toFixed(2)}`, c:color     },
                              ].map(s => (
                                <div key={s.l} style={{ textAlign:'center' }}>
                                  <p style={{ fontSize:10, color:'#5e6673', marginBottom:3, textTransform:'uppercase' }}>{s.l}</p>
                                  <p style={{ fontSize:15, fontWeight:800, color:s.c, fontFamily:'monospace' }}>{s.v}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Time remaining */}
                          {isActive && expireAt && msLeft > 0 && (
                            <div style={{ marginTop:14, background:'rgba(240,185,11,.05)', border:'1px solid rgba(240,185,11,.15)', borderRadius:10, padding:'10px 14px', display:'flex', alignItems:'center', gap:8 }}>
                              <Clock size={13} style={{ color:'#f0b90b', flexShrink:0 }}/>
                              <p style={{ fontSize:12, color:'#f0b90b', fontWeight:600 }}>
                                {hLeft}h {mLeft}m remaining — matures {expireAt.toLocaleString()}
                              </p>
                            </div>
                          )}
                          {isActive && (!expireAt || msLeft <= 0) && (
                            <div style={{ marginTop:14, background:'rgba(14,203,129,.05)', border:'1px solid rgba(14,203,129,.2)', borderRadius:10, padding:'10px 14px', display:'flex', alignItems:'center', gap:8 }}>
                              <CheckCircle size={13} style={{ color:'#0ecb81' }}/>
                              <p style={{ fontSize:12, color:'#0ecb81', fontWeight:600 }}>Matured — profit will be credited soon</p>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Footer */}
                    <div style={{ background:'#161a1e', border:'1px solid #1e2329', borderRadius:16, padding:'16px 20px', display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:12, alignItems:'center' }}>
                      <div>
                        <p style={{ fontSize:10, color:'#5e6673', marginBottom:4, textTransform:'uppercase' }}>Total Portfolio</p>
                        <p style={{ fontSize:20, fontWeight:800, color:'#f0b90b', fontFamily:'monospace' }}>${(totalInvested + totalProfit).toFixed(2)}</p>
                      </div>
                      <div style={{ display:'flex', gap:10 }}>
                        <button className="inv-btn gray" onClick={() => setTick(t=>t+1)} style={{ padding:'8px 14px' }}><RefreshCw size={13}/></button>
                        <button className="inv-btn gold" onClick={() => setTab('plans')}><Zap size={13}/> Invest More</button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
