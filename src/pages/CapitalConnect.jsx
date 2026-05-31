import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import {
  Globe, Shield, Users, ChevronRight, Star,
  CheckCircle, AlertCircle, ArrowLeft, Loader2,
  RefreshCw, Clock, FileText
} from 'lucide-react';

const API = 'https://vinance-backend-1.onrender.com';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  .cc { font-family:'Inter',sans-serif; background:#0b0e11; color:#eaecef; min-height:100vh; }
  .cc * { box-sizing:border-box; margin:0; padding:0; }
  .cc ::-webkit-scrollbar { width:4px; }
  .cc ::-webkit-scrollbar-thumb { background:#2b3139; border-radius:4px; }
  .cc-card { background:#161a1e; border:1px solid #1e2329; border-radius:16px; padding:22px; transition:border .2s; }
  .cc-card:hover { border-color:rgba(240,185,11,.25); }
  .cc-btn { display:inline-flex; align-items:center; gap:6px; padding:10px 22px; border:none; border-radius:10px; font-weight:700; font-size:13px; cursor:pointer; font-family:inherit; transition:all .15s; white-space:nowrap; }
  .cc-btn.gold { background:#f0b90b; color:#0b0e11; }
  .cc-btn.gold:hover { background:#d4a30a; }
  .cc-btn.gold:disabled { background:#2b3139; color:#5e6673; cursor:not-allowed; }
  .cc-btn.outline { background:transparent; color:#f0b90b; border:1px solid rgba(240,185,11,.4); }
  .cc-btn.outline:hover { background:rgba(240,185,11,.08); }
  .cc-btn.outline:disabled { opacity:.4; cursor:not-allowed; }
  .cc-tab { padding:10px 18px; font-size:13px; font-weight:600; background:transparent; border:none; color:#848e9c; cursor:pointer; border-bottom:2px solid transparent; white-space:nowrap; font-family:inherit; transition:all .15s; }
  .cc-tab.on { color:#eaecef; border-bottom-color:#f0b90b; }
  .cc-tab:hover { color:#eaecef; }
  .cc-input { width:100%; background:#0b0e11; border:1px solid #2b3139; border-radius:10px; padding:10px 14px; color:#eaecef; font-size:13px; outline:none; font-family:inherit; transition:border .15s; }
  .cc-input:focus { border-color:#f0b90b; }
  .cc-input::placeholder { color:#5e6673; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
  @keyframes spin { to{transform:rotate(360deg)} }
  .fade { animation:fadeUp .25s; }
  .spin { animation:spin .8s linear infinite; }
  @media(max-width:768px) {
    .cc-grid { grid-template-columns:1fr!important; }
    .cc-hero-stats { gap:14px!important; }
  }
`;

const FUNDS = [
  { name:'Vinance Growth Fund',   aum:'$124M', returns:'+34.2%', risk:'Medium', min:'$1,000', investors:2840, rating:4.8, color:'#627eea' },
  { name:'Crypto Blue Chip Fund', aum:'$89M',  returns:'+22.8%', risk:'Low',    min:'$500',   investors:5120, rating:4.9, color:'#0ecb81' },
  { name:'DeFi Alpha Fund',       aum:'$45M',  returns:'+67.4%', risk:'High',   min:'$2,500', investors:890,  rating:4.6, color:'#f6465d' },
  { name:'BNB Ecosystem Fund',    aum:'$67M',  returns:'+41.3%', risk:'Medium', min:'$1,000', investors:1560, rating:4.7, color:'#f0b90b' },
];

const VC_LIST = [
  { name:'Binance Labs',     focus:'DeFi, Infrastructure', stage:'Seed – Series A', portfolio:320, logo:'🔶' },
  { name:'Vinance Ventures', focus:'Gaming, NFT, Web3',    stage:'Pre-seed – Seed', portfolio:85,  logo:'💎' },
  { name:'BSC Accelerator',  focus:'BSC Ecosystem',        stage:'Accelerator',     portfolio:210, logo:'⚡' },
  { name:'Crypto Capital',   focus:'Trading, Exchanges',   stage:'Series A – B',    portfolio:60,  logo:'🏦' },
];

const RISK_COLOR = { Low:'#0ecb81', Medium:'#f0b90b', High:'#f6465d' };

const STATUS_STYLE = {
  pending:  { bg:'rgba(240,185,11,.12)',  color:'#f0b90b',  label:'Pending Review' },
  reviewed: { bg:'rgba(99,126,234,.12)',  color:'#627eea',  label:'Under Review'   },
  approved: { bg:'rgba(14,203,129,.12)',  color:'#0ecb81',  label:'Approved'       },
  rejected: { bg:'rgba(246,70,93,.12)',   color:'#f6465d',  label:'Rejected'       },
};

const TYPE_LABEL = {
  fund_invest:   'Fund Investment',
  vc_apply:      'VC Application',
  fund_register: 'Fund Registration',
};

export default function CapitalConnect() {
  const navigate = useNavigate();
  const { user, token } = useContext(UserContext);

  const [tab,         setTab]         = useState('funds');
  const [toast,       setToast]       = useState(null);
  const [applying,    setApplying]    = useState(null);   /* fund/vc name being applied */
  const [submitting,  setSubmitting]  = useState(false);  /* register form */
  const [myApps,      setMyApps]      = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);

  const [formData, setFormData] = useState({
    fundName:    '',
    website:     '',
    aum:         '',
    strategy:    '',
    description: '',
  });

  const showToast = (msg, type = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Fetch my applications ── */
  const fetchMyApps = async () => {
    if (!token) return;
    setAppsLoading(true);
    try {
      const res = await axios.get(`${API}/api/capital/my-applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyApps(Array.isArray(res.data) ? res.data : []);
    } catch { setMyApps([]); }
    finally { setAppsLoading(false); }
  };

  useEffect(() => {
    if (tab === 'my-apps') fetchMyApps();
  }, [tab, token]);

  /* ── Apply to invest in a fund ── */
  const handleApplyFund = async (fundName) => {
    if (!token) { navigate('/login'); return; }
    setApplying(fundName);
    try {
      await axios.post(`${API}/api/capital/apply-fund`,
        { targetName: fundName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast(`Application submitted for ${fundName}! You'll be notified within 3-5 days.`);
    } catch (e) {
      showToast(e.response?.data?.message || 'Application failed', 'err');
    } finally { setApplying(null); }
  };

  /* ── Apply to VC ── */
  const handleApplyVC = async (vcName) => {
    if (!token) { navigate('/login'); return; }
    setApplying(vcName);
    try {
      await axios.post(`${API}/api/capital/apply-vc`,
        { targetName: vcName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast(`Application sent to ${vcName}! We'll be in touch.`);
    } catch (e) {
      showToast(e.response?.data?.message || 'Application failed', 'err');
    } finally { setApplying(null); }
  };

  /* ── Register fund ── */
  const handleFundRegister = async () => {
    if (!token) { navigate('/login'); return; }
    if (!formData.fundName.trim()) return showToast('Fund name is required', 'err');
    setSubmitting(true);
    try {
      await axios.post(`${API}/api/capital/register-fund`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Fund registration submitted! Review takes 3-5 business days.');
      setFormData({ fundName:'', website:'', aum:'', strategy:'', description:'' });
    } catch (e) {
      showToast(e.response?.data?.message || 'Submission failed', 'err');
    } finally { setSubmitting(false); }
  };

  return (
    <>
      <style>{CSS}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', top:16, right:16, zIndex:9999, background:toast.type==='err'?'#f6465d':'#0ecb81', color:'#fff', padding:'11px 18px', borderRadius:12, fontWeight:700, fontSize:13, display:'flex', alignItems:'center', gap:8, boxShadow:'0 8px 32px rgba(0,0,0,.5)', animation:'fadeUp .3s', maxWidth:340 }}>
          {toast.type==='err' ? <AlertCircle size={15}/> : <CheckCircle size={15}/>} {toast.msg}
        </div>
      )}

      <div className="cc">

        {/* ── HEADER ── */}
        <div style={{ background:'#0b0e11', borderBottom:'1px solid #1e2329', padding:'13px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, position:'sticky', top:0, zIndex:50 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <button onClick={() => navigate(-1)} style={{ background:'none', border:'none', color:'#848e9c', cursor:'pointer', display:'flex' }}>
              <ArrowLeft size={18}/>
            </button>
            <Globe size={18} style={{ color:'#f0b90b' }}/>
            <h1 style={{ fontSize:18, fontWeight:800, color:'#eaecef' }}>Capital Connect</h1>
          </div>
          {token && (
            <button onClick={() => setTab('my-apps')}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', background:'#161a1e', border:'1px solid #2b3139', borderRadius:8, color:'#848e9c', cursor:'pointer', fontSize:12, fontFamily:'inherit', transition:'all .15s' }}
              onMouseEnter={e=>e.currentTarget.style.borderColor='#f0b90b'}
              onMouseLeave={e=>e.currentTarget.style.borderColor='#2b3139'}>
              <FileText size={13}/> My Applications
            </button>
          )}
        </div>

        {/* ── HERO ── */}
        <div style={{ background:'linear-gradient(135deg,#161a1e,#1e2329)', padding:'36px 20px', borderBottom:'1px solid #1e2329', textAlign:'center' }}>
          <div style={{ width:56, height:56, background:'rgba(240,185,11,.12)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', border:'1px solid rgba(240,185,11,.2)' }}>
            <Globe size={28} style={{ color:'#f0b90b' }}/>
          </div>
          <h2 style={{ fontSize:26, fontWeight:800, color:'#eaecef', marginBottom:8 }}>Connect with Institutional Capital</h2>
          <p style={{ color:'#848e9c', fontSize:14, maxWidth:480, margin:'0 auto 22px', lineHeight:1.7 }}>
            Access professional fund managers, venture capital networks, and institutional-grade investment opportunities.
          </p>
          <div style={{ display:'flex', justifyContent:'center', gap:24, flexWrap:'wrap' }} className="cc-hero-stats">
            {[['$2.4B+','Total AUM'],['12,000+','Investors'],['180+','Countries'],['4.8★','Avg Rating']].map(([v,l]) => (
              <div key={l} style={{ textAlign:'center' }}>
                <div style={{ fontSize:22, fontWeight:800, color:'#f0b90b' }}>{v}</div>
                <div style={{ fontSize:11, color:'#5e6673' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ maxWidth:1100, margin:'0 auto', padding:'20px' }}>

          {/* ── TABS ── */}
          <div style={{ display:'flex', borderBottom:'1px solid #1e2329', marginBottom:24, overflowX:'auto', scrollbarWidth:'none' }}>
            {[
              { k:'funds',   l:'Investment Funds' },
              { k:'vc',      l:'Venture Capital'  },
              { k:'apply',   l:'Register Fund'    },
              { k:'my-apps', l:`My Applications${myApps.length>0?` (${myApps.length})`:''}` },
            ].map(t => (
              <button key={t.k} className={`cc-tab${tab===t.k?' on':''}`} onClick={() => setTab(t.k)}>{t.l}</button>
            ))}
          </div>

          {/* ══ FUNDS TAB ══ */}
          {tab === 'funds' && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }} className="cc-grid">
              {FUNDS.map((fund, i) => (
                <div key={i} className="cc-card fade">
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
                    <div>
                      <h3 style={{ color:'#eaecef', fontWeight:700, fontSize:14, marginBottom:4 }}>{fund.name}</h3>
                      <div style={{ display:'flex', alignItems:'center', gap:3, fontSize:10, color:'#f0b90b' }}>
                        {Array(5).fill(0).map((_,j) => (
                          <Star key={j} size={10} style={{ fill:j<Math.floor(fund.rating)?'#f0b90b':'none', color:j<Math.floor(fund.rating)?'#f0b90b':'#2b3139' }}/>
                        ))}
                        <span style={{ color:'#848e9c', marginLeft:3, fontSize:11 }}>{fund.rating}</span>
                      </div>
                    </div>
                    <span style={{ background:`${RISK_COLOR[fund.risk]}18`, color:RISK_COLOR[fund.risk], border:`1px solid ${RISK_COLOR[fund.risk]}30`, padding:'2px 9px', borderRadius:10, fontSize:10, fontWeight:700 }}>
                      {fund.risk}
                    </span>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
                    {[
                      { l:'AUM',           v:fund.aum,                        c:'#eaecef' },
                      { l:'Annual Return', v:fund.returns,                    c:'#0ecb81' },
                      { l:'Min Invest',    v:fund.min,                        c:'#eaecef' },
                      { l:'Investors',     v:fund.investors.toLocaleString(), c:'#eaecef' },
                    ].map(s => (
                      <div key={s.l} style={{ background:'#0b0e11', borderRadius:8, padding:'9px 11px', border:'1px solid #2b3139' }}>
                        <div style={{ fontSize:9, color:'#5e6673', marginBottom:3, textTransform:'uppercase', fontWeight:600 }}>{s.l}</div>
                        <div style={{ fontSize:13, fontWeight:700, color:s.c }}>{s.v}</div>
                      </div>
                    ))}
                  </div>
                  <button className="cc-btn outline" style={{ width:'100%', justifyContent:'center' }}
                    onClick={() => handleApplyFund(fund.name)}
                    disabled={applying === fund.name}>
                    {applying === fund.name
                      ? <><Loader2 size={13} className="spin"/> Applying...</>
                      : <>Apply to Invest <ChevronRight size={13}/></>}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ══ VC TAB ══ */}
          {tab === 'vc' && (
            <div>
              <div style={{ marginBottom:20 }}>
                <h2 style={{ fontSize:18, fontWeight:800, color:'#eaecef', marginBottom:6 }}>Venture Capital Network</h2>
                <p style={{ fontSize:13, color:'#848e9c' }}>Connect with top-tier crypto VCs for funding, partnerships, and growth.</p>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:16 }} className="cc-grid">
                {VC_LIST.map((vc, i) => (
                  <div key={i} className="cc-card fade">
                    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                      <div style={{ width:46, height:46, borderRadius:12, background:'rgba(240,185,11,.1)', border:'1px solid rgba(240,185,11,.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>
                        {vc.logo}
                      </div>
                      <div>
                        <p style={{ fontWeight:700, fontSize:14, color:'#eaecef', marginBottom:2 }}>{vc.name}</p>
                        <p style={{ fontSize:11, color:'#848e9c' }}>{vc.focus}</p>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
                      {[
                        { l:'Stage',     v:vc.stage },
                        { l:'Portfolio', v:`${vc.portfolio}+ projects` },
                      ].map(s => (
                        <div key={s.l} style={{ background:'#0b0e11', borderRadius:8, padding:'8px 12px', border:'1px solid #2b3139', flex:1, minWidth:100 }}>
                          <div style={{ fontSize:9, color:'#5e6673', marginBottom:2, textTransform:'uppercase', fontWeight:600 }}>{s.l}</div>
                          <div style={{ fontSize:12, fontWeight:700, color:'#eaecef' }}>{s.v}</div>
                        </div>
                      ))}
                    </div>
                    <button className="cc-btn gold" style={{ width:'100%', justifyContent:'center' }}
                      onClick={() => handleApplyVC(vc.name)}
                      disabled={applying === vc.name}>
                      {applying === vc.name
                        ? <><Loader2 size={13} className="spin"/> Applying...</>
                        : 'Apply for Funding'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ REGISTER FUND TAB ══ */}
          {tab === 'apply' && (
            <div style={{ maxWidth:520, margin:'0 auto' }}>
              <h2 style={{ fontSize:18, fontWeight:800, color:'#eaecef', marginBottom:6 }}>Register Your Fund</h2>
              <p style={{ fontSize:13, color:'#848e9c', marginBottom:24, lineHeight:1.6 }}>
                List your fund on Vinance Capital Connect to reach thousands of qualified investors.
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {[
                  { k:'fundName', l:'Fund Name *',         p:'e.g. Alpha Growth Fund',       t:'text' },
                  { k:'website',  l:'Fund Website',        p:'https://yourfund.com',         t:'url'  },
                  { k:'aum',      l:'Current AUM (USD)',   p:'e.g. $50,000,000',             t:'text' },
                  { k:'strategy', l:'Investment Strategy', p:'e.g. DeFi, BTC, Multi-asset',  t:'text' },
                ].map(f => (
                  <div key={f.k}>
                    <label style={{ fontSize:11, color:'#848e9c', fontWeight:700, textTransform:'uppercase', marginBottom:6, display:'block' }}>{f.l}</label>
                    <input className="cc-input" type={f.t} placeholder={f.p}
                      value={formData[f.k]}
                      onChange={e => setFormData(p => ({ ...p, [f.k]: e.target.value }))}/>
                  </div>
                ))}
                <div>
                  <label style={{ fontSize:11, color:'#848e9c', fontWeight:700, textTransform:'uppercase', marginBottom:6, display:'block' }}>Description</label>
                  <textarea className="cc-input" rows={4}
                    placeholder="Describe your fund's mission, strategy, and target returns..."
                    style={{ resize:'vertical', minHeight:100 }}
                    value={formData.description}
                    onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}/>
                </div>
              </div>

              <div style={{ background:'rgba(240,185,11,.05)', border:'1px solid rgba(240,185,11,.15)', borderRadius:10, padding:14, margin:'20px 0', display:'flex', gap:10 }}>
                <Shield size={15} style={{ color:'#f0b90b', flexShrink:0, marginTop:1 }}/>
                <p style={{ fontSize:12, color:'#848e9c', lineHeight:1.6 }}>
                  All fund applications are reviewed by the Vinance compliance team within 3-5 business days. KYC/AML verification required.
                </p>
              </div>

              {!token ? (
                <button className="cc-btn gold" style={{ width:'100%', justifyContent:'center', padding:'13px 0', fontSize:14 }}
                  onClick={() => navigate('/login')}>
                  Login to Submit
                </button>
              ) : (
                <button className="cc-btn gold" style={{ width:'100%', justifyContent:'center', padding:'13px 0', fontSize:14 }}
                  onClick={handleFundRegister}
                  disabled={submitting}>
                  {submitting
                    ? <><Loader2 size={14} className="spin"/> Submitting...</>
                    : 'Submit Application'}
                </button>
              )}
            </div>
          )}

          {/* ══ MY APPLICATIONS TAB ══ */}
          {tab === 'my-apps' && (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
                <div>
                  <h2 style={{ fontSize:18, fontWeight:800, color:'#eaecef', marginBottom:4 }}>My Applications</h2>
                  <p style={{ fontSize:13, color:'#848e9c' }}>Track the status of your capital applications</p>
                </div>
                <button onClick={fetchMyApps}
                  style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', background:'#161a1e', border:'1px solid #2b3139', borderRadius:8, color:'#848e9c', cursor:'pointer', fontSize:12, fontFamily:'inherit' }}>
                  <RefreshCw size={13}/> Refresh
                </button>
              </div>

              {!token ? (
                <div style={{ textAlign:'center', padding:60, color:'#5e6673' }}>
                  <Globe size={44} style={{ opacity:.15, margin:'0 auto 14px', display:'block' }}/>
                  <p style={{ fontSize:14, fontWeight:600, color:'#eaecef', marginBottom:8 }}>Login Required</p>
                  <p style={{ fontSize:13, marginBottom:20 }}>Login to view your applications</p>
                  <button className="cc-btn gold" onClick={() => navigate('/login')}>Login Now</button>
                </div>
              ) : appsLoading ? (
                <div style={{ textAlign:'center', padding:60 }}>
                  <Loader2 size={28} className="spin" style={{ color:'#f0b90b', display:'inline-block' }}/>
                </div>
              ) : myApps.length === 0 ? (
                <div style={{ textAlign:'center', padding:60, color:'#5e6673' }}>
                  <FileText size={44} style={{ opacity:.15, margin:'0 auto 14px', display:'block' }}/>
                  <p style={{ fontSize:14, fontWeight:600, color:'#eaecef', marginBottom:8 }}>No Applications Yet</p>
                  <p style={{ fontSize:13, marginBottom:20 }}>Apply to funds or VCs to see your applications here</p>
                  <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
                    <button className="cc-btn outline" onClick={() => setTab('funds')}>Browse Funds</button>
                    <button className="cc-btn gold" onClick={() => setTab('vc')}>Browse VCs</button>
                  </div>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {myApps.map((app, i) => {
                    const s = STATUS_STYLE[app.status] || STATUS_STYLE.pending;
                    return (
                      <div key={app._id || i} className="cc-card fade">
                        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
                          <div>
                            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6, flexWrap:'wrap' }}>
                              <span style={{ fontWeight:700, fontSize:14, color:'#eaecef' }}>
                                {app.targetName || app.fundName || 'Capital Application'}
                              </span>
                              <span style={{ background:s.bg, color:s.color, padding:'2px 10px', borderRadius:20, fontSize:11, fontWeight:700 }}>
                                {s.label}
                              </span>
                            </div>
                            <div style={{ display:'flex', gap:14, fontSize:12, color:'#848e9c', flexWrap:'wrap' }}>
                              <span style={{ display:'flex', alignItems:'center', gap:4 }}>
                                <FileText size={11}/> {TYPE_LABEL[app.type] || app.type}
                              </span>
                              <span style={{ display:'flex', alignItems:'center', gap:4 }}>
                                <Clock size={11}/> {new Date(app.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Fund register details */}
                        {app.type === 'fund_register' && (app.aum || app.strategy) && (
                          <div style={{ marginTop:12, display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                            {[
                              app.aum      && { l:'AUM',      v:app.aum      },
                              app.strategy && { l:'Strategy', v:app.strategy },
                              app.website  && { l:'Website',  v:app.website  },
                            ].filter(Boolean).map(s => (
                              <div key={s.l} style={{ background:'#0b0e11', borderRadius:8, padding:'8px 12px', border:'1px solid #2b3139' }}>
                                <div style={{ fontSize:9, color:'#5e6673', marginBottom:3, textTransform:'uppercase', fontWeight:600 }}>{s.l}</div>
                                <div style={{ fontSize:12, color:'#eaecef', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.v}</div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Status message */}
                        <div style={{ marginTop:12, padding:'10px 12px', background:'rgba(255,255,255,.03)', borderRadius:8, fontSize:12, color:'#848e9c', lineHeight:1.6 }}>
                          {app.status === 'pending'  && '⏳ Your application is pending review by our team. This typically takes 3-5 business days.'}
                          {app.status === 'reviewed' && '👀 Our compliance team is reviewing your application. You will be contacted shortly.'}
                          {app.status === 'approved' && '✅ Congratulations! Your application has been approved. Check your notifications for next steps.'}
                          {app.status === 'rejected' && '❌ Unfortunately your application was not approved. Please contact support for more information.'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
