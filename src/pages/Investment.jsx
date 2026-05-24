import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import {
  PieChart, TrendingUp, Clock, Shield, Zap,
  CheckCircle, AlertCircle, Loader2, X, ChevronRight,
  DollarSign, BarChart2, Award, RefreshCw, Lock
} from 'lucide-react';

const API_URL = 'https://vinance-backend-1.onrender.com';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  .inv { font-family:'Inter',sans-serif; background:#0b0e11; color:#eaecef; min-height:100vh; }
  .inv * { box-sizing:border-box; margin:0; padding:0; }
  .inv ::-webkit-scrollbar { width:4px; height:4px; }
  .inv ::-webkit-scrollbar-thumb { background:#2b3139; border-radius:4px; }
  .inv-card { background:#161a1e; border:1px solid #1e2329; border-radius:20px; padding:24px; transition:all .2s; position:relative; overflow:hidden; }
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
  .modal-box { background:#161a1e; border:1px solid #2b3139; border-radius:22px; padding:28px; width:100%; max-width:460px; max-height:92vh; overflow-y:auto; }
  .stat-row { display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #1e232940; }
  .stat-row:last-child { border-bottom:none; }
  .badge { display:inline-flex; align-items:center; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; }
  @keyframes spin { to { transform:rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
  .spin { animation:spin .8s linear infinite; }
  .fade { animation:fadeUp .25s; }
  @media(max-width:768px) {
    .inv-grid { grid-template-columns:1fr!important; }
    .inv-stats-grid { grid-template-columns:1fr 1fr!important; }
    .modal-box { padding:20px; }
  }
`;

/* Plan color map */
const PLAN_COLORS = ['#f0b90b', '#0ecb81', '#627eea', '#f6465d', '#9b58f0', '#00b4e6'];

/* Risk label based on profit % */
const getRisk = (pct) => {
  if (pct <= 8)  return { label:'Low',    color:'#0ecb81' };
  if (pct <= 20) return { label:'Medium', color:'#f0b90b' };
  return               { label:'High',   color:'#f6465d' };
};

export default function Investment() {
  const navigate  = useNavigate();
  const { user, token, refreshUser } = useContext(UserContext);

  const [plans,      setPlans]      = useState([]);
  const [myInvests,  setMyInvests]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [tab,        setTab]        = useState('plans');
  const [selPlan,    setSelPlan]    = useState(null);
  const [amount,     setAmount]     = useState('');
  const [investing,  setInvesting]  = useState(false);
  const [toast,      setToast]      = useState(null);
  const [refresh,    setRefresh]    = useState(0);

  const showToast = (msg, type = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* fetch plans */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [plansRes, myRes] = await Promise.all([
          axios.get(`${API_URL}/api/plans`),
          token
            ? axios.get(`${API_URL}/api/my-investments`, { headers: { Authorization: `Bearer ${token}` } })
            : Promise.resolve({ data: [] }),
        ]);
        setPlans(Array.isArray(plansRes.data) ? plansRes.data : []);
        setMyInvests(Array.isArray(myRes.data)  ? myRes.data  : []);
      } catch (e) {
        showToast('Failed to load plans', 'err');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, refresh]);

  /* open invest modal */
  const openModal = (plan) => {
    if (!token) return navigate('/login');
    setSelPlan(plan);
    setAmount('');
  };

  /* quick-fill % of balance */
  const quickFill = (pct) => {
    const bal = user?.balance || 0;
    const val = Math.min(bal * pct / 100, selPlan?.maxAmount || bal);
    setAmount(val.toFixed(2));
  };

  /* submit investment */
  const handleInvest = async () => {
    const amt = parseFloat(amount);
    if (!selPlan) return;
    if (!amt || isNaN(amt))                         return showToast('Enter a valid amount', 'err');
    if (amt < selPlan.minAmount)                    return showToast(`Minimum is $${selPlan.minAmount}`, 'err');
    if (amt > selPlan.maxAmount)                    return showToast(`Maximum is $${selPlan.maxAmount}`, 'err');
    if (amt > (user?.balance || 0))                 return showToast('Insufficient balance', 'err');

    setInvesting(true);
    try {
      await axios.post(
        `${API_URL}/api/invest`,
        { planId: selPlan._id, amount: amt },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast(`Successfully invested $${amt.toFixed(2)} in ${selPlan.name}!`);
      setSelPlan(null);
      setAmount('');
      if (refreshUser) await refreshUser();
      setRefresh(r => r + 1);
      setTab('my-investments');
    } catch (err) {
      showToast(err.response?.data?.message || 'Investment failed', 'err');
    } finally {
      setInvesting(false);
    }
  };

  /* calculate expected return */
  const expectedReturn = () => {
    if (!selPlan || !amount) return '—';
    const profit = (parseFloat(amount) * selPlan.profitPercent) / 100;
    return `$${(parseFloat(amount) + profit).toFixed(2)}`;
  };

  /* stats from my investments */
  const totalInvested  = myInvests.reduce((s, i) => s + (i.amount  || 0), 0);
  const totalProfit    = myInvests.reduce((s, i) => s + (i.profit   || 0), 0);
  const activeCount    = myInvests.filter(i => i.status === 'active').length;

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#0b0e11', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
      <Loader2 size={36} style={{ color:'#f0b90b', animation:'spin .8s linear infinite' }} />
      <span style={{ color:'#f0b90b', fontWeight:700, fontSize:13, letterSpacing:3, textTransform:'uppercase' }}>Loading Plans...</span>
    </div>
  );

  return (
    <>
      <style>{CSS}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', top:16, right:16, zIndex:99999, background:toast.type === 'err' ? '#f6465d' : '#0ecb81', color:'#fff', padding:'12px 20px', borderRadius:14, fontWeight:700, fontSize:13, display:'flex', alignItems:'center', gap:8, boxShadow:'0 8px 32px rgba(0,0,0,.5)', animation:'fadeUp .3s', maxWidth:340 }}>
          {toast.type === 'err' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Invest Modal */}
      {selPlan && (
        <div className="modal-bg" onClick={e => e.target === e.currentTarget && setSelPlan(null)}>
          <div className="modal-box fade">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
              <div>
                <h3 style={{ fontSize:18, fontWeight:800, color:'#eaecef' }}>{selPlan.name}</h3>
                <p style={{ fontSize:12, color:'#848e9c', marginTop:3 }}>
                  {selPlan.profitPercent}% return · {selPlan.duration || selPlan.durationHours || 24}h duration
                </p>
              </div>
              <button onClick={() => setSelPlan(null)} style={{ background:'none', border:'none', color:'#848e9c', cursor:'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Plan details */}
            <div style={{ background:'#0b0e11', borderRadius:12, padding:16, marginBottom:20, border:'1px solid #2b3139' }}>
              {[
                { l:'Min Investment',   v:`$${selPlan.minAmount.toLocaleString()}` },
                { l:'Max Investment',   v:`$${selPlan.maxAmount.toLocaleString()}` },
                { l:'Profit Rate',      v:`${selPlan.profitPercent}%`,  c:'#0ecb81' },
                { l:'Duration',         v:`${selPlan.duration || selPlan.durationHours || 24} hours` },
                { l:'Your Balance',     v:`$${(user?.balance || 0).toFixed(2)}`, c:'#f0b90b' },
              ].map(s => (
                <div key={s.l} className="stat-row">
                  <span style={{ fontSize:12, color:'#848e9c' }}>{s.l}</span>
                  <span style={{ fontSize:13, fontWeight:700, color:s.c || '#eaecef' }}>{s.v}</span>
                </div>
              ))}
            </div>

            {/* Amount input */}
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:11, color:'#848e9c', fontWeight:700, textTransform:'uppercase', marginBottom:8, display:'block' }}>
                Investment Amount (USDT)
              </label>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#f0b90b', fontWeight:700, fontSize:16 }}>$</span>
                <input className="inv-input" type="number" placeholder="0.00"
                  value={amount} onChange={e => setAmount(e.target.value)}
                  style={{ paddingLeft:32 }} />
              </div>
            </div>

            {/* Quick fill */}
            <div style={{ display:'flex', gap:6, marginBottom:18 }}>
              {[25, 50, 75, 100].map(pct => (
                <button key={pct} className="inv-btn gray" style={{ flex:1, padding:'7px 0', fontSize:11, justifyContent:'center' }}
                  onClick={() => quickFill(pct)}>
                  {pct}%
                </button>
              ))}
            </div>

            {/* Expected return preview */}
            {amount && parseFloat(amount) > 0 && (
              <div style={{ background:'rgba(14,203,129,.06)', border:'1px solid rgba(14,203,129,.2)', borderRadius:12, padding:'12px 16px', marginBottom:18, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <p style={{ fontSize:11, color:'#848e9c', marginBottom:4 }}>Expected Return</p>
                  <p style={{ fontSize:18, fontWeight:800, color:'#0ecb81' }}>{expectedReturn()}</p>
                </div>
                <div style={{ textAlign:'right' }}>
                  <p style={{ fontSize:11, color:'#848e9c', marginBottom:4 }}>Profit</p>
                  <p style={{ fontSize:16, fontWeight:700, color:'#0ecb81' }}>
                    +${((parseFloat(amount) * selPlan.profitPercent) / 100).toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            {/* Warning */}
            <div style={{ background:'rgba(240,185,11,.05)', border:'1px solid rgba(240,185,11,.15)', borderRadius:10, padding:12, marginBottom:18, display:'flex', gap:8 }}>
              <Shield size={14} style={{ color:'#f0b90b', flexShrink:0, marginTop:1 }} />
              <p style={{ fontSize:11, color:'#848e9c', lineHeight:1.6 }}>
                Investment returns are calculated at the end of the plan duration. Your principal is returned along with the profit.
              </p>
            </div>

            <div style={{ display:'flex', gap:10 }}>
              <button className="inv-btn gray" style={{ flex:1 }} onClick={() => setSelPlan(null)}>Cancel</button>
              <button className="inv-btn gold" style={{ flex:2, justifyContent:'center' }}
                onClick={handleInvest}
                disabled={investing || !amount || parseFloat(amount) <= 0}>
                {investing
                  ? <><Loader2 size={14} className="spin" /> Investing...</>
                  : <><Zap size={14} /> Confirm Investment</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="inv">

        {/* Header */}
        <div style={{ background:'#0b0e11', borderBottom:'1px solid #1e2329', padding:'14px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10, position:'sticky', top:0, zIndex:50 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <PieChart size={20} style={{ color:'#f0b90b' }} />
            <h1 style={{ fontSize:18, fontWeight:800, color:'#eaecef' }}>Investment Plans</h1>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <div style={{ fontSize:12, color:'#848e9c' }}>
              Balance: <span style={{ color:'#f0b90b', fontWeight:700 }}>${(user?.balance || 0).toFixed(2)}</span>
            </div>
            <button className="inv-btn gray" style={{ padding:'6px 10px' }} onClick={() => setRefresh(r => r + 1)}>
              <RefreshCw size={13} />
            </button>
          </div>
        </div>

        {/* Hero Banner */}
        <div style={{ background:'linear-gradient(135deg,#161a1e 0%,#1a2028 50%,#0d1117 100%)', padding:'36px 20px', borderBottom:'1px solid #1e2329' }}>
          <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:20 }}>
            <div>
              <h2 style={{ fontSize:26, fontWeight:800, color:'#eaecef', marginBottom:8 }}>
                Earn Passive Income with <span style={{ color:'#f0b90b' }}>AI Trading Plans</span>
              </h2>
              <p style={{ color:'#848e9c', fontSize:14, maxWidth:480, lineHeight:1.7 }}>
                Deposit once, earn automatically. Our algorithmic trading plans generate consistent returns through diversified crypto strategies.
              </p>
              <div style={{ display:'flex', gap:20, marginTop:16, flexWrap:'wrap' }}>
                {[
                  { icon:'🔒', l:'Principal Protected'   },
                  { icon:'⚡', l:'Instant Activation'    },
                  { icon:'📈', l:'Daily Compounding'     },
                  { icon:'🤖', l:'AI-Powered Trading'    },
                ].map(f => (
                  <div key={f.l} style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#848e9c' }}>
                    <span>{f.icon}</span> {f.l}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
              {[
                { l:'Total Plans',       v:plans.length,                            c:'#f0b90b' },
                { l:'Max Returns',       v:`${Math.max(...plans.map(p => p.profitPercent), 0)}%`, c:'#0ecb81' },
                { l:'My Investments',    v:myInvests.length,                        c:'#627eea' },
              ].map(s => (
                <div key={s.l} style={{ background:'rgba(255,255,255,.04)', border:'1px solid #2b3139', borderRadius:14, padding:'14px 20px', textAlign:'center', minWidth:100 }}>
                  <div style={{ fontSize:22, fontWeight:800, color:s.c, marginBottom:4 }}>{s.v}</div>
                  <div style={{ fontSize:11, color:'#5e6673', fontWeight:600, textTransform:'uppercase' }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ maxWidth:1100, margin:'0 auto', padding:'20px' }}>

          {/* My portfolio stats */}
          {myInvests.length > 0 && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12, marginBottom:24 }} className="inv-stats-grid">
              {[
                { l:'Total Invested',  v:`$${totalInvested.toFixed(2)}`,  icon:<DollarSign size={17} />, c:'#f0b90b' },
                { l:'Total Profit',    v:`+$${totalProfit.toFixed(2)}`,   icon:<TrendingUp size={17} />, c:'#0ecb81' },
                { l:'Active Plans',    v:activeCount,                     icon:<Zap size={17} />,        c:'#627eea' },
                { l:'Completed',       v:myInvests.filter(i => i.status === 'completed').length, icon:<Award size={17}/>, c:'#f6465d' },
              ].map(s => (
                <div key={s.l} style={{ background:'#161a1e', border:'1px solid #1e2329', borderRadius:14, padding:'16px 18px', borderTop:`2px solid ${s.c}` }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                    <span style={{ fontSize:10, color:'#848e9c', fontWeight:700, textTransform:'uppercase' }}>{s.l}</span>
                    <div style={{ color:s.c, background:s.c + '18', padding:7, borderRadius:8 }}>{s.icon}</div>
                  </div>
                  <div style={{ fontSize:20, fontWeight:800, color:s.c }}>{s.v}</div>
                </div>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div style={{ display:'flex', borderBottom:'1px solid #1e2329', marginBottom:24, overflowX:'auto', scrollbarWidth:'none' }}>
            {[
              { k:'plans',          l:'All Plans'      },
              { k:'my-investments', l:`My Investments ${myInvests.length > 0 ? `(${myInvests.length})` : ''}` },
            ].map(t => (
              <button key={t.k} className={`inv-tab${tab === t.k ? ' on' : ''}`} onClick={() => setTab(t.k)}>{t.l}</button>
            ))}
          </div>

          {/* ── PLANS TAB ── */}
          {tab === 'plans' && (
            <>
              {plans.length === 0 ? (
                <div style={{ textAlign:'center', padding:80, color:'#5e6673' }}>
                  <PieChart size={52} style={{ opacity:.1, margin:'0 auto 16px', display:'block' }} />
                  <p style={{ fontSize:16, fontWeight:600, color:'#eaecef', marginBottom:8 }}>No Plans Available</p>
                  <p style={{ fontSize:13 }}>Check back soon for new investment plans.</p>
                </div>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:20 }} className="inv-grid">
                  {plans.map((plan, i) => {
                    const color   = PLAN_COLORS[i % PLAN_COLORS.length];
                    const risk    = getRisk(plan.profitPercent);
                    const dur     = plan.duration || plan.durationHours || 24;
                    const profit  = plan.profitPercent;

                    return (
                      <div key={plan._id} className="inv-card fade" style={{ '--plan-color': color }}>

                        {/* Popular badge */}
                        {i === 1 && (
                          <div style={{ position:'absolute', top:16, right:16, background:color, color:'#0b0e11', fontSize:9, fontWeight:800, padding:'3px 10px', borderRadius:20, textTransform:'uppercase', letterSpacing:1 }}>
                            Popular
                          </div>
                        )}

                        {/* Plan icon + name */}
                        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20 }}>
                          <div style={{ width:50, height:50, borderRadius:14, background:`${color}18`, border:`1px solid ${color}30`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            <BarChart2 size={22} style={{ color }} />
                          </div>
                          <div>
                            <h3 style={{ fontSize:16, fontWeight:800, color:'#eaecef', marginBottom:4 }}>{plan.name}</h3>
                            <span className="badge" style={{ background:`${risk.color}18`, color:risk.color, border:`1px solid ${risk.color}30` }}>
                              {risk.label} Risk
                            </span>
                          </div>
                        </div>

                        {/* ROI highlight */}
                        <div style={{ background:`${color}08`, border:`1px solid ${color}20`, borderRadius:12, padding:'16px 20px', marginBottom:18, textAlign:'center' }}>
                          <p style={{ fontSize:11, color:'#848e9c', marginBottom:6, textTransform:'uppercase', fontWeight:700, letterSpacing:1 }}>Returns</p>
                          <div style={{ fontSize:36, fontWeight:800, color, lineHeight:1 }}>+{profit}%</div>
                          <p style={{ fontSize:12, color:'#848e9c', marginTop:6 }}>in {dur} hours</p>
                        </div>

                        {/* Details */}
                        <div style={{ display:'flex', flexDirection:'column', gap:0, marginBottom:20 }}>
                          {[
                            { l:'Min Investment',  v:`$${plan.minAmount.toLocaleString()}` },
                            { l:'Max Investment',  v:`$${plan.maxAmount.toLocaleString()}` },
                            { l:'Duration',        v:`${dur} hours`                        },
                            { l:'Profit on $1K',   v:`+$${(1000 * profit / 100).toFixed(0)}` },
                          ].map(s => (
                            <div key={s.l} className="stat-row">
                              <span style={{ fontSize:12, color:'#848e9c' }}>{s.l}</span>
                              <span style={{ fontSize:13, fontWeight:700, color:'#eaecef' }}>{s.v}</span>
                            </div>
                          ))}
                        </div>

                        {/* Features */}
                        <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:20 }}>
                          {['Automated AI trading', 'Principal returned at maturity', 'Real-time tracking'].map(f => (
                            <div key={f} style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'#848e9c' }}>
                              <CheckCircle size={13} style={{ color, flexShrink:0 }} /> {f}
                            </div>
                          ))}
                        </div>

                        {/* CTA */}
                        <button className="inv-btn gold" style={{ width:'100%', justifyContent:'center', padding:'13px 0', fontSize:14 }}
                          onClick={() => openModal(plan)}>
                          <Zap size={15} /> Invest Now
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* How it works */}
              <div style={{ marginTop:40, background:'#161a1e', border:'1px solid #1e2329', borderRadius:20, padding:28 }}>
                <h3 style={{ fontSize:16, fontWeight:800, color:'#eaecef', marginBottom:20, textAlign:'center' }}>How Investment Plans Work</h3>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:16 }}>
                  {[
                    { step:'1', icon:'💰', title:'Choose a Plan',     desc:'Select a plan that matches your investment goal and risk appetite.' },
                    { step:'2', icon:'⚡', title:'Deposit Funds',     desc:'Your balance is deducted instantly when you confirm the investment.'  },
                    { step:'3', icon:'🤖', title:'AI Trades for You', desc:'Our algorithms execute trades 24/7 to maximize returns.'              },
                    { step:'4', icon:'📈', title:'Collect Profit',    desc:'At maturity, principal + profit is automatically returned to your balance.' },
                  ].map(s => (
                    <div key={s.step} style={{ textAlign:'center', padding:'16px 12px' }}>
                      <div style={{ fontSize:32, marginBottom:10 }}>{s.icon}</div>
                      <div style={{ width:24, height:24, borderRadius:'50%', background:'rgba(240,185,11,.15)', color:'#f0b90b', fontSize:11, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px' }}>{s.step}</div>
                      <p style={{ fontSize:13, fontWeight:700, color:'#eaecef', marginBottom:6 }}>{s.title}</p>
                      <p style={{ fontSize:12, color:'#848e9c', lineHeight:1.6 }}>{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── MY INVESTMENTS TAB ── */}
          {tab === 'my-investments' && (
            <div>
              {myInvests.length === 0 ? (
                <div style={{ textAlign:'center', padding:80, color:'#5e6673' }}>
                  <Lock size={52} style={{ opacity:.1, margin:'0 auto 16px', display:'block' }} />
                  <p style={{ fontSize:16, fontWeight:600, color:'#eaecef', marginBottom:8 }}>No Investments Yet</p>
                  <p style={{ fontSize:13, marginBottom:24 }}>Start investing to earn passive income from your crypto balance.</p>
                  <button className="inv-btn gold" onClick={() => setTab('plans')}>
                    <Zap size={14} /> Browse Plans
                  </button>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  {myInvests.map((inv, i) => {
                    const color   = PLAN_COLORS[i % PLAN_COLORS.length];
                    const isActive = inv.status === 'active';
                    const expireAt = inv.expireAt ? new Date(inv.expireAt) : null;
                    const now      = new Date();
                    const msLeft   = expireAt ? expireAt - now : 0;
                    const hLeft    = Math.max(0, Math.floor(msLeft / 3600000));
                    const mLeft    = Math.max(0, Math.floor((msLeft % 3600000) / 60000));

                    return (
                      <div key={inv._id || i} className="inv-card fade" style={{ '--plan-color': color }}>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                            <div style={{ width:46, height:46, borderRadius:12, background:`${color}18`, border:`1px solid ${color}30`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                              <BarChart2 size={20} style={{ color }} />
                            </div>
                            <div>
                              <p style={{ fontWeight:800, fontSize:15, color:'#eaecef', marginBottom:4 }}>
                                {inv.planId?.name || 'Investment Plan'}
                              </p>
                              <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
                                <span className="badge" style={{ background:isActive ? 'rgba(14,203,129,.12)' : 'rgba(132,142,156,.1)', color:isActive ? '#0ecb81' : '#848e9c' }}>
                                  {isActive ? '● Active' : '✓ Completed'}
                                </span>
                                {inv.planId?.profitPercent && (
                                  <span style={{ fontSize:11, color:'#848e9c' }}>+{inv.planId.profitPercent}% return</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div style={{ display:'flex', gap:20, flexWrap:'wrap' }}>
                            <div style={{ textAlign:'center' }}>
                              <p style={{ fontSize:10, color:'#5e6673', marginBottom:4, textTransform:'uppercase', fontWeight:600 }}>Invested</p>
                              <p style={{ fontSize:16, fontWeight:800, color:'#eaecef', fontFamily:'monospace' }}>${(inv.amount || 0).toFixed(2)}</p>
                            </div>
                            <div style={{ textAlign:'center' }}>
                              <p style={{ fontSize:10, color:'#5e6673', marginBottom:4, textTransform:'uppercase', fontWeight:600 }}>Profit</p>
                              <p style={{ fontSize:16, fontWeight:800, color:'#0ecb81', fontFamily:'monospace' }}>+${(inv.profit || 0).toFixed(2)}</p>
                            </div>
                            <div style={{ textAlign:'center' }}>
                              <p style={{ fontSize:10, color:'#5e6673', marginBottom:4, textTransform:'uppercase', fontWeight:600 }}>Return</p>
                              <p style={{ fontSize:16, fontWeight:800, color:color, fontFamily:'monospace' }}>${((inv.amount || 0) + (inv.profit || 0)).toFixed(2)}</p>
                            </div>
                          </div>
                        </div>

                        {/* Time remaining */}
                        {isActive && expireAt && msLeft > 0 && (
                          <div style={{ marginTop:16, background:'rgba(240,185,11,.05)', border:'1px solid rgba(240,185,11,.15)', borderRadius:10, padding:'10px 14px', display:'flex', alignItems:'center', gap:10 }}>
                            <Clock size={14} style={{ color:'#f0b90b', flexShrink:0 }} />
                            <div>
                              <p style={{ fontSize:11, color:'#848e9c' }}>Time Remaining</p>
                              <p style={{ fontSize:13, fontWeight:700, color:'#f0b90b' }}>
                                {hLeft}h {mLeft}m — matures {expireAt.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        )}
                        {isActive && (!expireAt || msLeft <= 0) && (
                          <div style={{ marginTop:16, background:'rgba(14,203,129,.05)', border:'1px solid rgba(14,203,129,.2)', borderRadius:10, padding:'10px 14px', display:'flex', alignItems:'center', gap:10 }}>
                            <CheckCircle size={14} style={{ color:'#0ecb81' }} />
                            <p style={{ fontSize:13, color:'#0ecb81', fontWeight:600 }}>Matured — profit will be credited soon</p>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Summary footer */}
                  <div style={{ background:'#161a1e', border:'1px solid #1e2329', borderRadius:16, padding:20, display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
                    <div>
                      <p style={{ fontSize:11, color:'#848e9c', marginBottom:6, textTransform:'uppercase', fontWeight:600 }}>Total Portfolio Value</p>
                      <p style={{ fontSize:22, fontWeight:800, color:'#f0b90b', fontFamily:'monospace' }}>
                        ${(totalInvested + totalProfit).toFixed(2)}
                      </p>
                    </div>
                    <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                      <button className="inv-btn gray" onClick={() => setRefresh(r => r + 1)} style={{ padding:'8px 14px' }}>
                        <RefreshCw size={13} /> Refresh
                      </button>
                      <button className="inv-btn gold" onClick={() => setTab('plans')}>
                        <Zap size={13} /> Invest More
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
