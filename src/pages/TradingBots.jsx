import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import {
  Zap, Play, Pause, Trash2, Plus, BarChart2,
  DollarSign, Activity, ChevronDown, ChevronRight,
  AlertCircle, CheckCircle, Loader2, X, Bot,
  RefreshCw
} from 'lucide-react';

const API = 'https://vinance-backend-1.onrender.com';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  .tb{font-family:'Inter',sans-serif;background:#0b0e11;color:#eaecef;min-height:100vh;}
  .tb *{box-sizing:border-box;margin:0;padding:0;}
  .tb ::-webkit-scrollbar{width:4px;height:4px;}
  .tb ::-webkit-scrollbar-thumb{background:#2b3139;border-radius:4px;}
  .tb-card{background:#161a1e;border:1px solid #1e2329;border-radius:16px;padding:20px;transition:border .2s;}
  .tb-card:hover{border-color:#2b3139;}
  .tb-btn{display:inline-flex;align-items:center;gap:6px;padding:9px 18px;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .15s;white-space:nowrap;}
  .tb-btn.y{background:#f0b90b;color:#0b0e11;}
  .tb-btn.y:hover{background:#d4a30a;}
  .tb-btn.y:disabled{background:#2b3139;color:#5e6673;cursor:not-allowed;}
  .tb-btn.g{background:rgba(14,203,129,.1);color:#0ecb81;border:1px solid rgba(14,203,129,.25);}
  .tb-btn.g:hover{background:#0ecb81;color:#0b0e11;}
  .tb-btn.r{background:rgba(246,70,93,.1);color:#f6465d;border:1px solid rgba(246,70,93,.25);}
  .tb-btn.r:hover{background:#f6465d;color:#fff;}
  .tb-btn.d{background:#2b3139;color:#848e9c;}
  .tb-btn.d:hover{color:#eaecef;}
  .tb-inp{width:100%;background:#0b0e11;border:1px solid #2b3139;border-radius:10px;padding:10px 14px;color:#eaecef;font-size:13px;outline:none;font-family:inherit;transition:border .15s;}
  .tb-inp:focus{border-color:#f0b90b;}
  .tb-inp::placeholder{color:#5e6673;}
  .tb-sel{width:100%;background:#0b0e11;border:1px solid #2b3139;border-radius:10px;padding:10px 14px;color:#eaecef;font-size:13px;outline:none;font-family:inherit;appearance:none;cursor:pointer;}
  .tb-sel:focus{border-color:#f0b90b;}
  .tb-tab{padding:10px 18px;font-size:13px;font-weight:600;background:transparent;border:none;color:#848e9c;cursor:pointer;border-bottom:2px solid transparent;white-space:nowrap;font-family:inherit;transition:all .15s;}
  .tb-tab.on{color:#eaecef;border-bottom-color:#f0b90b;}
  .tb-tab:hover{color:#eaecef;}
  .badge{display:inline-flex;align-items:center;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700;}
  .badge-run{background:rgba(14,203,129,.12);color:#0ecb81;}
  .badge-stop{background:rgba(132,142,156,.12);color:#848e9c;}
  .stat-mini{background:#0b0e11;border-radius:10px;padding:12px 14px;flex:1;text-align:center;}
  .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.85);backdrop-filter:blur(8px);z-index:999;display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto;}
  .modal-box{background:#161a1e;border:1px solid #2b3139;border-radius:22px;padding:26px;width:100%;max-width:500px;max-height:92vh;overflow-y:auto;}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  .spin{animation:spin .8s linear infinite;}
  .fade{animation:fadeUp .2s;}
  @media(max-width:768px){
    .hide-m{display:none!important;}
    .grid-4{grid-template-columns:1fr 1fr!important;}
  }
`;

const BOT_TEMPLATES = [
  { id:'grid',      name:'Grid Bot',       icon:'📊', desc:'Buys low & sells high within a price range. Best for sideways markets.',        roi:'+12–25%/mo', risk:'Medium', color:'#627eea' },
  { id:'dca',       name:'DCA Bot',        icon:'💰', desc:'Dollar Cost Averaging — fixed amount at regular intervals.',                     roi:'+8–18%/mo',  risk:'Low',    color:'#0ecb81' },
  { id:'futures',   name:'Futures Bot',    icon:'⚡', desc:'Automated long/short futures based on technical indicators.',                    roi:'+20–60%/mo', risk:'High',   color:'#f6465d' },
  { id:'arbitrage', name:'Arbitrage Bot',  icon:'🔄', desc:'Exploits price differences between pairs.',                                      roi:'+5–12%/mo',  risk:'Low',    color:'#f0b90b' },
];
const COINS      = ['BTC','ETH','BNB','SOL','XRP','ADA','DOGE','AVAX'];
const RISK_COLOR = { Low:'#0ecb81', Medium:'#f0b90b', High:'#f6465d' };

export default function TradingBots() {
  const navigate = useNavigate();
  const { user, token, refreshUser } = useContext(UserContext);

  const [tab,         setTab]         = useState('my-bots');
  const [bots,        setBots]        = useState([]);
  const [stats,       setStats]       = useState({ total:0, running:0, profit:0, trades:0 });
  const [loading,     setLoading]     = useState(false);
  const [showModal,   setShowModal]   = useState(false);
  const [selTemplate, setSelTemplate] = useState(null);
  const [creating,    setCreating]    = useState(false);
  const [toast,       setToast]       = useState(null);
  const [deletingId,  setDeletingId]  = useState(null);
  const [togglingId,  setTogglingId]  = useState(null);

  const [form, setForm] = useState({
    coin:'BTC', investment:'100', leverage:'10',
    lower:'', upper:'', grids:'10',
    interval:'1h', maxOrders:'10',
    tp:'5', sl:'3',
  });

  const showToast = (msg, type='ok') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  /* ── Fetch bots from MongoDB ── */
  const fetchBots = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/bots`, { headers:{ Authorization:`Bearer ${token}` } });
      const list = Array.isArray(res.data) ? res.data : [];
      setBots(list);
      calcStats(list);
    } catch { setBots([]); }
    finally { setLoading(false); }
  };

  const fetchStats = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API}/api/bots/stats`, { headers:{ Authorization:`Bearer ${token}` } });
      setStats(res.data);
    } catch {}
  };

  useEffect(() => { fetchBots(); fetchStats(); }, [token]);

  /* Auto-refresh profit every 10s from DB */
  useEffect(() => {
    const iv = setInterval(() => { fetchBots(); fetchStats(); }, 10000);
    return () => clearInterval(iv);
  }, [token]);

  const calcStats = (list) => {
    setStats({
      total:   list.length,
      running: list.filter(b => b.status === 'running').length,
      profit:  list.reduce((s,b) => s + (b.profit||0), 0),
      trades:  list.reduce((s,b) => s + (b.trades||0), 0),
    });
  };

  /* ── Create Bot → POST /api/bots (balance deducted in backend) ── */
  const handleCreate = async () => {
    if (!selTemplate) return;
    const invest = parseFloat(form.investment);
    if (!invest || invest < 10)              return showToast('Minimum investment is $10', 'err');
    if (invest > (user?.balance || 0))       return showToast('Insufficient balance', 'err');
    if (!token)                              return showToast('Please login first', 'err');

    setCreating(true);
    try {
      const res = await axios.post(`${API}/api/bots`, {
        name:       `${selTemplate.name} — ${form.coin}`,
        type:       selTemplate.id,
        icon:       selTemplate.icon,
        color:      selTemplate.color,
        coin:       form.coin,
        investment: invest,
        config: {
          coin:      form.coin,
          lower:     parseFloat(form.lower)     || undefined,
          upper:     parseFloat(form.upper)     || undefined,
          grids:     parseInt(form.grids)       || undefined,
          interval:  form.interval              || undefined,
          maxOrders: parseInt(form.maxOrders)   || undefined,
          leverage:  parseInt(form.leverage)    || undefined,
          tp:        parseFloat(form.tp)        || undefined,
          sl:        parseFloat(form.sl)        || undefined,
        },
      }, { headers:{ Authorization:`Bearer ${token}` } });

      await refreshUser?.();
      await fetchBots();
      showToast(`${selTemplate.name} started! $${invest} invested.`);
      setShowModal(false);
      setSelTemplate(null);
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to create bot', 'err');
    } finally { setCreating(false); }
  };

  /* ── Toggle start/stop → PUT /api/bots/:id/toggle ── */
  const toggleBot = async (id) => {
    if (!token) return;
    setTogglingId(id);
    try {
      const res = await axios.put(`${API}/api/bots/${id}/toggle`, {}, { headers:{ Authorization:`Bearer ${token}` } });
      setBots(p => p.map(b => b._id===id ? { ...b, status: res.data.status } : b));
      showToast(res.data.status === 'running' ? '▶ Bot resumed!' : '⏸ Bot paused.');
    } catch (e) { showToast(e.response?.data?.message || 'Failed', 'err'); }
    finally { setTogglingId(null); }
  };

  /* ── Delete Bot → DELETE /api/bots/:id (funds returned in backend) ── */
  const deleteBot = async (bot) => {
    if (!window.confirm(`Delete "${bot.name}"? Investment + profit will be returned to your balance.`)) return;
    setDeletingId(bot._id);
    try {
      const res = await axios.delete(`${API}/api/bots/${bot._id}`, { headers:{ Authorization:`Bearer ${token}` } });
      setBots(p => p.filter(b => b._id !== bot._id));
      calcStats(bots.filter(b => b._id !== bot._id));
      await refreshUser?.();
      showToast(`Bot deleted. $${parseFloat(res.data.returnAmount||0).toFixed(2)} returned.`);
    } catch (e) { showToast(e.response?.data?.message || 'Failed to delete', 'err'); }
    finally { setDeletingId(null); }
  };

  return (
    <>
      <style>{css}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', top:20, right:20, zIndex:9999, background:toast.type==='err'?'#f6465d':'#0ecb81', color:'#fff', padding:'12px 20px', borderRadius:14, fontWeight:700, fontSize:13, display:'flex', alignItems:'center', gap:8, boxShadow:'0 8px 32px rgba(0,0,0,.5)', maxWidth:340, animation:'fadeUp .3s' }}>
          {toast.type==='err' ? <AlertCircle size={16}/> : <CheckCircle size={16}/>} {toast.msg}
        </div>
      )}

      {/* Create Bot Modal */}
      {showModal && (
        <div className="modal-bg" onClick={e => e.target===e.currentTarget && setShowModal(false)}>
          <div className="modal-box fade">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h3 style={{ fontSize:17, fontWeight:800, color:'#eaecef' }}>
                {selTemplate ? `Configure ${selTemplate.name}` : 'Select Bot Type'}
              </h3>
              <button onClick={() => { setShowModal(false); setSelTemplate(null); }} style={{ background:'none', border:'none', color:'#848e9c', cursor:'pointer' }}><X size={19}/></button>
            </div>

            {!selTemplate ? (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                {BOT_TEMPLATES.map(t => (
                  <div key={t.id} onClick={() => setSelTemplate(t)}
                    style={{ background:'#0b0e11', border:'1px solid #2b3139', borderRadius:14, padding:16, cursor:'pointer', transition:'all .2s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor=t.color}
                    onMouseLeave={e => e.currentTarget.style.borderColor='#2b3139'}>
                    <div style={{ fontSize:28, marginBottom:10 }}>{t.icon}</div>
                    <p style={{ fontWeight:700, fontSize:13, color:'#eaecef', marginBottom:4 }}>{t.name}</p>
                    <p style={{ fontSize:11, color:'#848e9c', lineHeight:1.5, marginBottom:8 }}>{t.desc}</p>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:11 }}>
                      <span style={{ color:'#0ecb81', fontWeight:700 }}>{t.roi}</span>
                      <span style={{ color:RISK_COLOR[t.risk], fontWeight:700 }}>{t.risk}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {/* Selected template info */}
                <div style={{ display:'flex', alignItems:'center', gap:10, background:'#0b0e11', borderRadius:12, padding:14, border:`1px solid ${selTemplate.color}30` }}>
                  <span style={{ fontSize:28 }}>{selTemplate.icon}</span>
                  <div>
                    <p style={{ fontWeight:700, color:'#eaecef' }}>{selTemplate.name}</p>
                    <p style={{ fontSize:12, color:'#848e9c' }}>{selTemplate.desc}</p>
                  </div>
                </div>

                {/* Coin */}
                <div>
                  <label style={{ fontSize:11, color:'#848e9c', fontWeight:700, textTransform:'uppercase', marginBottom:6, display:'block' }}>Trading Pair</label>
                  <select className="tb-sel" value={form.coin} onChange={e => setForm(p=>({...p,coin:e.target.value}))}>
                    {COINS.map(c => <option key={c} value={c}>{c}/USDT</option>)}
                  </select>
                </div>

                {/* Investment */}
                <div>
                  <label style={{ fontSize:11, color:'#848e9c', fontWeight:700, textTransform:'uppercase', marginBottom:6, display:'block' }}>Investment (USDT)</label>
                  <div style={{ position:'relative' }}>
                    <input className="tb-inp" type="number" placeholder="Min $10" value={form.investment}
                      onChange={e => setForm(p=>({...p,investment:e.target.value}))}/>
                    <span style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', fontSize:11, color:'#5e6673', fontWeight:700 }}>USDT</span>
                  </div>
                  <p style={{ fontSize:11, color:'#5e6673', marginTop:4 }}>
                    Available: <span style={{ color:'#f0b90b', fontWeight:700 }}>${(user?.balance||0).toFixed(2)}</span>
                  </p>
                </div>

                {/* Quick % */}
                <div style={{ display:'flex', gap:6 }}>
                  {[25,50,75,100].map(pct => (
                    <button key={pct} className="tb-btn d" style={{ flex:1, padding:'6px 0', fontSize:11 }}
                      onClick={() => setForm(p=>({...p,investment:((user?.balance||0)*pct/100).toFixed(2)}))}>
                      {pct}%
                    </button>
                  ))}
                </div>

                {/* Grid params */}
                {selTemplate.id === 'grid' && (
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    {[
                      { k:'lower', l:'Lower Price ($)', p:'60000' },
                      { k:'upper', l:'Upper Price ($)', p:'90000' },
                      { k:'grids', l:'Grid Count',      p:'10'    },
                    ].map(f => (
                      <div key={f.k}>
                        <label style={{ fontSize:10, color:'#848e9c', fontWeight:700, textTransform:'uppercase', marginBottom:5, display:'block' }}>{f.l}</label>
                        <input className="tb-inp" type="number" placeholder={f.p} value={form[f.k]}
                          onChange={e => setForm(p=>({...p,[f.k]:e.target.value}))} style={{ padding:'8px 12px', fontSize:12 }}/>
                      </div>
                    ))}
                  </div>
                )}

                {/* DCA params */}
                {selTemplate.id === 'dca' && (
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    <div>
                      <label style={{ fontSize:10, color:'#848e9c', fontWeight:700, textTransform:'uppercase', marginBottom:5, display:'block' }}>Interval</label>
                      <select className="tb-sel" value={form.interval} onChange={e => setForm(p=>({...p,interval:e.target.value}))} style={{ padding:'8px 12px', fontSize:12 }}>
                        {['1h','4h','8h','12h','1d','1w'].map(i => <option key={i} value={i}>{i}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize:10, color:'#848e9c', fontWeight:700, textTransform:'uppercase', marginBottom:5, display:'block' }}>Max Orders</label>
                      <input className="tb-inp" type="number" placeholder="10" value={form.maxOrders}
                        onChange={e => setForm(p=>({...p,maxOrders:e.target.value}))} style={{ padding:'8px 12px', fontSize:12 }}/>
                    </div>
                  </div>
                )}

                {/* Futures params */}
                {selTemplate.id === 'futures' && (
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
                    {[
                      { k:'leverage', l:'Leverage', p:'10' },
                      { k:'tp',       l:'TP %',     p:'5'  },
                      { k:'sl',       l:'SL %',     p:'3'  },
                    ].map(f => (
                      <div key={f.k}>
                        <label style={{ fontSize:10, color:'#848e9c', fontWeight:700, textTransform:'uppercase', marginBottom:5, display:'block' }}>{f.l}</label>
                        <input className="tb-inp" type="number" placeholder={f.p} value={form[f.k]}
                          onChange={e => setForm(p=>({...p,[f.k]:e.target.value}))} style={{ padding:'8px 12px', fontSize:12 }}/>
                      </div>
                    ))}
                  </div>
                )}

                {/* Expected return */}
                <div style={{ background:'rgba(14,203,129,.05)', border:'1px solid rgba(14,203,129,.2)', borderRadius:10, padding:12 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4 }}>
                    <span style={{ color:'#848e9c' }}>Expected Monthly ROI</span>
                    <span style={{ color:'#0ecb81', fontWeight:700 }}>{selTemplate.roi}</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
                    <span style={{ color:'#848e9c' }}>Risk Level</span>
                    <span style={{ color:RISK_COLOR[selTemplate.risk], fontWeight:700 }}>{selTemplate.risk}</span>
                  </div>
                </div>

                <div style={{ display:'flex', gap:10 }}>
                  <button className="tb-btn d" style={{ flex:1 }} onClick={() => setSelTemplate(null)}>← Back</button>
                  <button className="tb-btn y" style={{ flex:2 }} onClick={handleCreate} disabled={creating}>
                    {creating ? <><Loader2 size={14} className="spin"/> Creating...</> : <><Zap size={14}/> Start Bot</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="tb">
        {/* Header */}
        <div style={{ background:'#0b0e11', borderBottom:'1px solid #1e2329', padding:'14px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10, position:'sticky', top:0, zIndex:50 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <button onClick={() => navigate(-1)} style={{ background:'none', border:'none', color:'#848e9c', cursor:'pointer', display:'flex' }}>
              <ChevronDown size={18} style={{ transform:'rotate(90deg)' }}/>
            </button>
            <div>
              <h1 style={{ fontSize:18, fontWeight:800, color:'#eaecef' }}>Trading Bots</h1>
              <p style={{ fontSize:11, color:'#5e6673' }}>Automate your crypto trading — real balance tracking</p>
            </div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => { fetchBots(); fetchStats(); }} style={{ display:'flex', alignItems:'center', gap:5, padding:'8px 12px', background:'#161a1e', border:'1px solid #2b3139', borderRadius:8, color:'#848e9c', cursor:'pointer', fontSize:12, fontFamily:'inherit' }}>
              <RefreshCw size={13}/> Refresh
            </button>
            <button className="tb-btn y" onClick={() => { setSelTemplate(null); setShowModal(true); }}>
              <Plus size={15}/> Create Bot
            </button>
          </div>
        </div>

        <div style={{ maxWidth:1200, margin:'0 auto', padding:'20px 24px' }}>

          {/* Stats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }} className="grid-4">
            {[
              { l:'Total Bots',   v:stats.total,                                    icon:<Bot size={18}/>,        c:'#627eea' },
              { l:'Running',      v:stats.running,                                  icon:<Activity size={18}/>,   c:'#0ecb81' },
              { l:'Total Profit', v:`$${parseFloat(stats.profit||0).toFixed(2)}`,   icon:<DollarSign size={18}/>, c:'#f0b90b' },
              { l:'Total Trades', v:stats.trades,                                   icon:<BarChart2 size={18}/>,  c:'#f6465d' },
            ].map(s => (
              <div key={s.l} className="tb-card" style={{ borderTop:`2px solid ${s.c}` }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                  <span style={{ fontSize:10, color:'#848e9c', fontWeight:700, textTransform:'uppercase' }}>{s.l}</span>
                  <div style={{ color:s.c, background:s.c+'18', padding:6, borderRadius:8 }}>{s.icon}</div>
                </div>
                <div style={{ fontSize:22, fontWeight:800, color:'#eaecef' }}>{s.v}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display:'flex', borderBottom:'1px solid #1e2329', marginBottom:20, overflowX:'auto', scrollbarWidth:'none' }}>
            {['my-bots','marketplace','learn'].map(t => (
              <button key={t} className={`tb-tab${tab===t?' on':''}`} onClick={() => setTab(t)}>
                {t==='my-bots'?'My Bots':t==='marketplace'?'Marketplace':'Learn'}
              </button>
            ))}
          </div>

          {/* ── MY BOTS ── */}
          {tab === 'my-bots' && (
            loading ? (
              <div style={{ textAlign:'center', padding:60 }}>
                <Loader2 size={32} className="spin" style={{ color:'#f0b90b', display:'inline-block' }}/>
              </div>
            ) : bots.length === 0 ? (
              <div style={{ textAlign:'center', padding:80, color:'#5e6673' }}>
                <Bot size={56} style={{ opacity:.1, margin:'0 auto 16px', display:'block' }}/>
                <p style={{ fontSize:16, fontWeight:600, color:'#eaecef', marginBottom:8 }}>No bots running yet</p>
                <p style={{ fontSize:13, marginBottom:24 }}>Create a bot — your balance will be deducted and profit tracked in real-time</p>
                <button className="tb-btn y" onClick={() => { setSelTemplate(null); setShowModal(true); }}>
                  <Plus size={15}/> Create Your First Bot
                </button>
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:16 }}>
                {bots.map(bot => (
                  <div key={bot._id} className="tb-card fade">
                    {/* Header */}
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:44, height:44, borderRadius:12, background:(bot.color||'#627eea')+'18', border:`1px solid ${bot.color||'#627eea'}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>
                          {bot.icon || '🤖'}
                        </div>
                        <div>
                          <p style={{ fontWeight:700, fontSize:13, color:'#eaecef', marginBottom:2 }}>{bot.name}</p>
                          <span className={`badge badge-${bot.status==='running'?'run':'stop'}`}>
                            {bot.status==='running' ? '● Running' : '⏸ Stopped'}
                          </span>
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:6 }}>
                        <button className={`tb-btn ${bot.status==='running'?'d':'g'}`} style={{ padding:'6px 10px' }}
                          onClick={() => toggleBot(bot._id)} disabled={togglingId===bot._id}>
                          {togglingId===bot._id ? <Loader2 size={14} className="spin"/> : bot.status==='running' ? <Pause size={14}/> : <Play size={14}/>}
                        </button>
                        <button className="tb-btn r" style={{ padding:'6px 10px' }}
                          onClick={() => deleteBot(bot)} disabled={deletingId===bot._id}>
                          {deletingId===bot._id ? <Loader2 size={14} className="spin"/> : <Trash2 size={14}/>}
                        </button>
                      </div>
                    </div>

                    {/* Stats */}
                    <div style={{ display:'flex', gap:8, marginBottom:14 }}>
                      <div className="stat-mini">
                        <p style={{ fontSize:10, color:'#5e6673', marginBottom:4 }}>Invested</p>
                        <p style={{ fontSize:14, fontWeight:700, color:'#eaecef' }}>${parseFloat(bot.investment||0).toFixed(2)}</p>
                      </div>
                      <div className="stat-mini">
                        <p style={{ fontSize:10, color:'#5e6673', marginBottom:4 }}>Profit</p>
                        <p style={{ fontSize:14, fontWeight:700, color:'#0ecb81' }}>+${parseFloat(bot.profit||0).toFixed(4)}</p>
                      </div>
                      <div className="stat-mini">
                        <p style={{ fontSize:10, color:'#5e6673', marginBottom:4 }}>ROI</p>
                        <p style={{ fontSize:14, fontWeight:700, color:'#0ecb81' }}>+{parseFloat(bot.profitPct||0).toFixed(2)}%</p>
                      </div>
                      <div className="stat-mini">
                        <p style={{ fontSize:10, color:'#5e6673', marginBottom:4 }}>Trades</p>
                        <p style={{ fontSize:14, fontWeight:700, color:'#eaecef' }}>{bot.trades||0}</p>
                      </div>
                    </div>

                    {/* Info */}
                    <div style={{ background:'#0b0e11', borderRadius:8, padding:'10px 12px', fontSize:11, color:'#848e9c', display:'flex', justifyContent:'space-between' }}>
                      <span>Pair: <span style={{ color:'#eaecef', fontWeight:600 }}>{bot.coin}/USDT</span></span>
                      <span>{new Date(bot.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* ── MARKETPLACE ── */}
          {tab === 'marketplace' && (
            <div>
              <p style={{ color:'#848e9c', fontSize:13, marginBottom:20 }}>Copy proven strategies from top traders.</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
                {[
                  { name:'BTC Grid Master', author:'CryptoWhale', roi:'+18.4%', risk:'Medium', users:4820, color:'#f7931a', icon:'📊', desc:'Optimized BTC grid for current volatility range' },
                  { name:'ETH DCA Pro',     author:'DeFiAnalyst', roi:'+12.1%', risk:'Low',    users:3210, color:'#627eea', icon:'💰', desc:'Weekly ETH accumulation with smart rebalancing' },
                  { name:'SOL Scalper',     author:'SolanaKing',  roi:'+31.6%', risk:'High',   users:1540, color:'#9945ff', icon:'⚡', desc:'High frequency SOL futures scalping bot' },
                  { name:'Multi-Coin DCA',  author:'MarketGuru',  roi:'+9.8%',  risk:'Low',    users:6700, color:'#0ecb81', icon:'🔄', desc:'Diversified DCA across top 5 coins' },
                ].map((bot,i) => (
                  <div key={i} className="tb-card">
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                      <div style={{ width:40, height:40, borderRadius:10, background:bot.color+'18', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{bot.icon}</div>
                      <div>
                        <p style={{ fontWeight:700, fontSize:13, color:'#eaecef' }}>{bot.name}</p>
                        <p style={{ fontSize:11, color:'#848e9c' }}>by @{bot.author}</p>
                      </div>
                    </div>
                    <p style={{ fontSize:12, color:'#848e9c', lineHeight:1.5, marginBottom:12 }}>{bot.desc}</p>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:14 }}>
                      <span style={{ color:'#0ecb81', fontWeight:700 }}>{bot.roi}/mo</span>
                      <span style={{ color:RISK_COLOR[bot.risk], fontWeight:700 }}>{bot.risk}</span>
                      <span style={{ color:'#5e6673' }}>{bot.users.toLocaleString()} users</span>
                    </div>
                    <button className="tb-btn y" style={{ width:'100%', justifyContent:'center' }}
                      onClick={() => { setSelTemplate(BOT_TEMPLATES.find(t=>bot.name.toLowerCase().includes(t.id))||BOT_TEMPLATES[0]); setShowModal(true); }}>
                      Copy Strategy
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── LEARN ── */}
          {tab === 'learn' && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
              {[
                { icon:'📊', title:'What is Grid Trading?',  time:'5 min', desc:'How grid bots profit from sideways markets by placing orders at intervals.',             color:'#627eea' },
                { icon:'💰', title:'DCA Strategy Guide',     time:'4 min', desc:'Dollar Cost Averaging reduces risk by investing fixed amounts regularly.',              color:'#0ecb81' },
                { icon:'⚡', title:'Futures Bot Risks',      time:'7 min', desc:'Understand leverage, liquidation risk, and how futures bots work.',                     color:'#f6465d' },
                { icon:'🔄', title:'Arbitrage Explained',    time:'6 min', desc:'How arbitrage bots exploit price differences to generate consistent returns.',          color:'#f0b90b' },
                { icon:'🛡️', title:'Risk Management',       time:'8 min', desc:'Setting proper stop-losses, position sizing, and diversification.',                     color:'#9b58f0' },
                { icon:'📈', title:'Backtesting Strategies', time:'10 min',desc:'Test your bot strategy against historical data before going live.',                     color:'#00b4e6' },
              ].map((a,i) => (
                <div key={i} className="tb-card" style={{ cursor:'pointer' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
                    <div style={{ width:44, height:44, borderRadius:12, background:a.color+'18', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>{a.icon}</div>
                    <div>
                      <p style={{ fontWeight:700, fontSize:13, color:'#eaecef' }}>{a.title}</p>
                      <p style={{ fontSize:11, color:'#5e6673' }}>📖 {a.time} read</p>
                    </div>
                  </div>
                  <p style={{ fontSize:12, color:'#848e9c', lineHeight:1.6 }}>{a.desc}</p>
                  <div style={{ marginTop:10, display:'flex', alignItems:'center', gap:4, color:'#f0b90b', fontSize:12, fontWeight:600 }}>
                    Read more <ChevronRight size={14}/>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
