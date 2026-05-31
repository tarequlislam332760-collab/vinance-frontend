import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import axios from 'axios';
import {
  Zap, Play, Pause, Trash2, Plus, BarChart2,
  DollarSign, Activity, ChevronDown, ChevronRight,
  AlertCircle, CheckCircle, Loader2, X, Bot, PieChart
} from 'lucide-react';

const BACKEND = 'https://vinance-backend-1.onrender.com';

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
  .tb-btn.g{background:rgba(14,203,129,.1);color:#0ecb81;border:1px solid rgba(14,203,129,.25);}
  .tb-btn.g:hover{background:#0ecb81;color:#0b0e11;}
  .tb-btn.r{background:rgba(246,70,93,.1);color:#f6465d;border:1px solid rgba(246,70,93,.25);}
  .tb-btn.r:hover{background:#f6465d;color:#fff;}
  .tb-btn.d{background:#2b3139;color:#848e9c;border:1px solid #2b3139;}
  .tb-btn.d:hover{color:#eaecef;}
  .tb-inp{width:100%;background:#0b0e11;border:1px solid #2b3139;border-radius:10px;padding:10px 14px;color:#eaecef;font-size:13px;outline:none;font-family:inherit;transition:border .15s;}
  .tb-inp:focus{border-color:#f0b90b;}
  .tb-inp::placeholder{color:#5e6673;}
  .tb-sel{width:100%;background:#0b0e11;border:1px solid #2b3139;border-radius:10px;padding:10px 14px;color:#eaecef;font-size:13px;outline:none;font-family:inherit;transition:border .15s;appearance:none;cursor:pointer;}
  .tb-sel:focus{border-color:#f0b90b;}
  .tb-tab{padding:10px 18px;font-size:13px;font-weight:600;background:transparent;border:none;color:#848e9c;cursor:pointer;border-bottom:2px solid transparent;white-space:nowrap;font-family:inherit;transition:all .15s;}
  .tb-tab.on{color:#eaecef;border-bottom-color:#f0b90b;}
  .badge{display:inline-flex;align-items:center;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700;}
  .badge-run{background:rgba(14,203,129,.12);color:#0ecb81;}
  .badge-stop{background:rgba(132,142,156,.12);color:#848e9c;}
  .stat-mini{background:#0b0e11;border-radius:10px;padding:12px 14px;flex:1;}
  .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.85);backdrop-filter:blur(8px);z-index:999;display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto;}
  .modal-box{background:#161a1e;border:1px solid #2b3139;border-radius:22px;padding:26px;width:100%;max-width:500px;max-height:92vh;overflow-y:auto;}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  .spin{animation:spin .8s linear infinite;}
  .fade{animation:fadeUp .2s;}
  @media(max-width:768px){
    .grid-2{grid-template-columns:1fr!important;}
    .grid-4{grid-template-columns:1fr 1fr!important;}
  }
`;

const BOT_TEMPLATES = [
  { id:'grid',      name:'Grid Bot',      icon:'📊', desc:'Buys low, sells high within a price range. Best for sideways markets.', roi:'+12–25%/month', risk:'Medium', color:'#627eea' },
  { id:'dca',       name:'DCA Bot',       icon:'💰', desc:'Dollar Cost Averaging — invest fixed amounts at regular intervals.',     roi:'+8–18%/month',  risk:'Low',    color:'#0ecb81' },
  { id:'futures',   name:'Futures Bot',   icon:'⚡', desc:'Automated long/short futures trading based on indicators.',             roi:'+20–60%/month', risk:'High',   color:'#f6465d' },
  { id:'arbitrage', name:'Arbitrage Bot', icon:'🔄', desc:'Exploits price differences to generate consistent returns.',            roi:'+5–12%/month',  risk:'Low',    color:'#f0b90b' },
];

const COINS = ['BTC','ETH','BNB','SOL','XRP','ADA','DOGE','AVAX'];
const RISK_COLOR = { Low:'#0ecb81', Medium:'#f0b90b', High:'#f6465d' };

export default function TradingBots() {
  const navigate = useNavigate();
  const { user, token, refreshUser } = useContext(UserContext);

  const [tab,         setTab]         = useState('my-bots');
  const [bots,        setBots]        = useState([]);
  const [botsLoading, setBotsLoading] = useState(true);
  const [stats,       setStats]       = useState({ total:0, running:0, profit:0, trades:0 });
  const [showModal,   setShowModal]   = useState(false);
  const [selTemplate, setSelTemplate] = useState(null);
  const [creating,    setCreating]    = useState(false);
  const [toast,       setToast]       = useState(null);

  const [form, setForm] = useState({
    coin:'BTC', investment:'100', leverage:'10',
    lower:'', upper:'', grids:'10',
    interval:'1h', maxOrders:'10', tp:'5', sl:'3',
  });

  const showToast = (msg, type='ok') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  /* ── Fetch bots from MongoDB ── */
  const fetchBots = async () => {
    if (!token) return;
    setBotsLoading(true);
    try {
      const [botsRes, statsRes] = await Promise.all([
        axios.get(`${BACKEND}/api/bots`, { headers:{ Authorization:`Bearer ${token}` } }),
        axios.get(`${BACKEND}/api/bots/stats`, { headers:{ Authorization:`Bearer ${token}` } }),
      ]);
      setBots(Array.isArray(botsRes.data) ? botsRes.data : []);
      setStats(statsRes.data || { total:0, running:0, profit:0, trades:0 });
    } catch { setBots([]); }
    finally { setBotsLoading(false); }
  };

  useEffect(() => { fetchBots(); }, [token]);

  /* Poll every 60s to update profits from server-side tick */
  useEffect(() => {
    const iv = setInterval(fetchBots, 60000);
    return () => clearInterval(iv);
  }, [token]);

  /* ── Create Bot → real balance deducted ── */
  const handleCreate = async () => {
    if (!selTemplate) return;
    const invest = parseFloat(form.investment);
    if (!invest || invest < 10) return showToast('Minimum investment is $10', 'err');
    if (invest > (user?.balance || 0)) return showToast('Insufficient balance', 'err');

    setCreating(true);
    try {
      const res = await axios.post(`${BACKEND}/api/bots`, {
        name:       `${selTemplate.name} — ${form.coin}`,
        type:       selTemplate.id,
        icon:       selTemplate.icon,
        color:      selTemplate.color,
        coin:       form.coin,
        investment: invest,
        config: {
          coin:      form.coin,
          interval:  form.interval,
          maxOrders: parseInt(form.maxOrders) || 10,
          lower:     parseFloat(form.lower) || 0,
          upper:     parseFloat(form.upper) || 0,
          grids:     parseInt(form.grids) || 10,
          leverage:  parseInt(form.leverage) || 10,
          tp:        parseFloat(form.tp) || 5,
          sl:        parseFloat(form.sl) || 3,
        },
      }, { headers:{ Authorization:`Bearer ${token}` } });

      showToast(`${selTemplate.name} created! Balance deducted.`);
      setShowModal(false);
      setSelTemplate(null);
      await refreshUser?.();
      fetchBots();
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to create bot', 'err');
    } finally { setCreating(false); }
  };

  /* ── Toggle bot status ── */
  const toggleBot = async (id) => {
    try {
      const res = await axios.put(`${BACKEND}/api/bots/${id}/toggle`, {}, { headers:{ Authorization:`Bearer ${token}` } });
      setBots(b => b.map(bot => bot._id===id ? res.data.bot : bot));
      showToast(res.data.status==='running' ? 'Bot started!' : 'Bot paused.');
    } catch { showToast('Failed to toggle bot', 'err'); }
  };

  /* ── Delete bot → returns funds ── */
  const deleteBot = async (bot) => {
    if (!window.confirm('Stop and delete this bot? Funds will be returned.')) return;
    try {
      const res = await axios.delete(`${BACKEND}/api/bots/${bot._id}`, { headers:{ Authorization:`Bearer ${token}` } });
      showToast(res.data.message || 'Bot deleted. Funds returned.');
      await refreshUser?.();
      fetchBots();
    } catch { showToast('Failed to delete bot', 'err'); }
  };

  return (
    <>
      <style>{css}</style>

      {toast && (
        <div style={{ position:'fixed', top:20, right:20, zIndex:9999, background:toast.type==='err'?'#f6465d':'#0ecb81', color:'#fff', padding:'12px 20px', borderRadius:14, fontWeight:700, fontSize:13, display:'flex', alignItems:'center', gap:8, boxShadow:'0 8px 32px rgba(0,0,0,.5)', maxWidth:340, animation:'fadeUp .3s' }}>
          {toast.type==='err' ? <AlertCircle size={15}/> : <CheckCircle size={15}/>} {toast.msg}
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
                      <span style={{ color:RISK_COLOR[t.risk], fontWeight:700 }}>{t.risk} Risk</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, background:'#0b0e11', borderRadius:12, padding:14, border:`1px solid ${selTemplate.color}30` }}>
                  <span style={{ fontSize:28 }}>{selTemplate.icon}</span>
                  <div>
                    <p style={{ fontWeight:700, color:'#eaecef' }}>{selTemplate.name}</p>
                    <p style={{ fontSize:12, color:'#848e9c' }}>{selTemplate.desc}</p>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize:11, color:'#848e9c', fontWeight:700, textTransform:'uppercase', marginBottom:6, display:'block' }}>Trading Pair</label>
                  <select className="tb-sel" value={form.coin} onChange={e => setForm(p=>({...p,coin:e.target.value}))}>
                    {COINS.map(c => <option key={c} value={c}>{c}/USDT</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize:11, color:'#848e9c', fontWeight:700, textTransform:'uppercase', marginBottom:6, display:'block' }}>Investment Amount (USDT)</label>
                  <div style={{ position:'relative' }}>
                    <input className="tb-inp" type="number" placeholder="Min $10" value={form.investment} onChange={e => setForm(p=>({...p,investment:e.target.value}))}/>
                    <span style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', fontSize:11, color:'#5e6673', fontWeight:700 }}>USDT</span>
                  </div>
                  <p style={{ fontSize:11, color:'#5e6673', marginTop:4 }}>
                    Available: <span style={{ color:'#f0b90b', fontWeight:700 }}>${(user?.balance||0).toFixed(2)}</span>
                  </p>
                </div>

                <div style={{ display:'flex', gap:6 }}>
                  {[25,50,75,100].map(pct => (
                    <button key={pct} className="tb-btn d" style={{ flex:1, padding:'6px 0', fontSize:11 }}
                      onClick={() => setForm(p=>({...p,investment:((user?.balance||0)*pct/100).toFixed(2)}))}>
                      {pct}%
                    </button>
                  ))}
                </div>

                {/* Type-specific config */}
                {selTemplate.id === 'grid' && (
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    {[{k:'lower',l:'Lower Price ($)',p:'60000'},{k:'upper',l:'Upper Price ($)',p:'90000'},{k:'grids',l:'Grid Count',p:'10'}].map(f => (
                      <div key={f.k}>
                        <label style={{ fontSize:10, color:'#848e9c', fontWeight:700, textTransform:'uppercase', marginBottom:5, display:'block' }}>{f.l}</label>
                        <input className="tb-inp" type="number" placeholder={f.p} value={form[f.k]} onChange={e => setForm(p=>({...p,[f.k]:e.target.value}))} style={{ padding:'8px 12px', fontSize:12 }}/>
                      </div>
                    ))}
                  </div>
                )}
                {selTemplate.id === 'dca' && (
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    <div>
                      <label style={{ fontSize:10, color:'#848e9c', fontWeight:700, textTransform:'uppercase', marginBottom:5, display:'block' }}>Buy Interval</label>
                      <select className="tb-sel" value={form.interval} onChange={e => setForm(p=>({...p,interval:e.target.value}))} style={{ padding:'8px 12px', fontSize:12 }}>
                        {['1h','4h','8h','12h','1d','1w'].map(i => <option key={i}>{i}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize:10, color:'#848e9c', fontWeight:700, textTransform:'uppercase', marginBottom:5, display:'block' }}>Max Orders</label>
                      <input className="tb-inp" type="number" placeholder="10" value={form.maxOrders} onChange={e => setForm(p=>({...p,maxOrders:e.target.value}))} style={{ padding:'8px 12px', fontSize:12 }}/>
                    </div>
                  </div>
                )}
                {selTemplate.id === 'futures' && (
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
                    {[{k:'leverage',l:'Leverage (x)',p:'10'},{k:'tp',l:'Take Profit %',p:'5'},{k:'sl',l:'Stop Loss %',p:'3'}].map(f => (
                      <div key={f.k}>
                        <label style={{ fontSize:10, color:'#848e9c', fontWeight:700, textTransform:'uppercase', marginBottom:5, display:'block' }}>{f.l}</label>
                        <input className="tb-inp" type="number" placeholder={f.p} value={form[f.k]} onChange={e => setForm(p=>({...p,[f.k]:e.target.value}))} style={{ padding:'8px 12px', fontSize:12 }}/>
                      </div>
                    ))}
                  </div>
                )}

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

                <div style={{ background:'rgba(240,185,11,.05)', border:'1px solid rgba(240,185,11,.15)', borderRadius:10, padding:12, display:'flex', gap:8 }}>
                  <AlertCircle size={14} style={{ color:'#f0b90b', flexShrink:0, marginTop:1 }}/>
                  <p style={{ fontSize:11, color:'#848e9c', lineHeight:1.6 }}>
                    <strong style={{ color:'#f0b90b' }}>${parseFloat(form.investment)||0} USDT</strong> will be deducted from your balance and locked in this bot. Profit is calculated server-side every 5 minutes.
                  </p>
                </div>

                <div style={{ display:'flex', gap:10 }}>
                  <button className="tb-btn d" style={{ flex:1 }} onClick={() => setSelTemplate(null)}>← Back</button>
                  <button className="tb-btn y" style={{ flex:2 }} onClick={handleCreate} disabled={creating}>
                    {creating ? <><Loader2 size={14} className="spin"/> Creating...</> : <><Zap size={14}/> Start Bot (Real)</>}
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
              <p style={{ fontSize:11, color:'#5e6673' }}>Automate your crypto strategy — real balance deducted</p>
            </div>
          </div>
          <button className="tb-btn y" onClick={() => { setSelTemplate(null); setShowModal(true); }}>
            <Plus size={15}/> Create Bot
          </button>
        </div>

        <div style={{ maxWidth:1200, margin:'0 auto', padding:'20px 24px' }}>

          {/* Stats from MongoDB */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }} className="grid-4">
            {[
              { l:'Total Bots',   v:stats.total,                                     icon:<Bot size={18}/>,       c:'#627eea' },
              { l:'Running',      v:stats.running,                                   icon:<Activity size={18}/>,  c:'#0ecb81' },
              { l:'Total Profit', v:`$${parseFloat(stats.profit||0).toFixed(2)}`,    icon:<DollarSign size={18}/>,c:'#f0b90b' },
              { l:'Total Trades', v:stats.trades,                                    icon:<BarChart2 size={18}/>, c:'#f6465d' },
            ].map(s => (
              <div key={s.l} className="tb-card" style={{ borderTop:`2px solid ${s.c}` }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                  <span style={{ fontSize:10, color:'#848e9c', fontWeight:700, textTransform:'uppercase', letterSpacing:'.04em' }}>{s.l}</span>
                  <div style={{ color:s.c, background:s.c+'18', padding:6, borderRadius:8 }}>{s.icon}</div>
                </div>
                <div style={{ fontSize:22, fontWeight:800, color:'#eaecef' }}>{s.v}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display:'flex', borderBottom:'1px solid #1e2329', marginBottom:20, overflowX:'auto', scrollbarWidth:'none' }}>
            {[{k:'my-bots',l:'My Bots'},{k:'marketplace',l:'Marketplace'},{k:'learn',l:'Learn'}].map(t => (
              <button key={t.k} className={`tb-tab${tab===t.k?' on':''}`} onClick={() => setTab(t.k)}>{t.l}</button>
            ))}
          </div>

          {/* ── MY BOTS ── */}
          {tab === 'my-bots' && (
            botsLoading ? (
              <div style={{ textAlign:'center', padding:60 }}>
                <Loader2 size={28} className="spin" style={{ color:'#f0b90b', display:'inline-block' }}/>
                <p style={{ color:'#848e9c', fontSize:13, marginTop:12 }}>Loading bots from database...</p>
              </div>
            ) : bots.length === 0 ? (
              <div style={{ textAlign:'center', padding:80, color:'#5e6673' }}>
                <Bot size={56} style={{ opacity:.1, margin:'0 auto 16px', display:'block' }}/>
                <p style={{ fontSize:16, fontWeight:600, color:'#eaecef', marginBottom:8 }}>No bots running yet</p>
                <p style={{ fontSize:13, marginBottom:24 }}>Create your first bot — balance will be deducted and tracked in MongoDB</p>
                <button className="tb-btn y" onClick={() => { setSelTemplate(null); setShowModal(true); }}>
                  <Plus size={15}/> Create Your First Bot
                </button>
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16 }}>
                {bots.map(bot => (
                  <div key={bot._id} className="tb-card fade">
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:44, height:44, borderRadius:12, background:(bot.color||'#627eea')+'18', border:`1px solid ${(bot.color||'#627eea')}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>
                          {bot.icon||'🤖'}
                        </div>
                        <div>
                          <p style={{ fontWeight:700, fontSize:13, color:'#eaecef', marginBottom:2 }}>{bot.name}</p>
                          <span className={`badge badge-${bot.status==='running'?'run':'stop'}`}>
                            {bot.status==='running'?'● Running':'⏸ Stopped'}
                          </span>
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:6 }}>
                        <button className={`tb-btn ${bot.status==='running'?'d':'g'}`} style={{ padding:'6px 10px' }} onClick={() => toggleBot(bot._id)}>
                          {bot.status==='running' ? <Pause size={14}/> : <Play size={14}/>}
                        </button>
                        <button className="tb-btn r" style={{ padding:'6px 10px' }} onClick={() => deleteBot(bot)}>
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    </div>

                    <div style={{ display:'flex', gap:8, marginBottom:12 }}>
                      {[
                        { l:'Invested', v:`$${parseFloat(bot.investment||0).toFixed(2)}`,      c:'#eaecef' },
                        { l:'Profit',   v:`+$${parseFloat(bot.profit||0).toFixed(2)}`,          c:'#0ecb81' },
                        { l:'ROI',      v:`+${parseFloat(bot.profitPct||0).toFixed(2)}%`,       c:'#0ecb81' },
                        { l:'Trades',   v:String(bot.trades||0),                                c:'#eaecef' },
                      ].map(s => (
                        <div key={s.l} className="stat-mini" style={{ textAlign:'center' }}>
                          <p style={{ fontSize:9, color:'#5e6673', marginBottom:4, textTransform:'uppercase' }}>{s.l}</p>
                          <p style={{ fontSize:13, fontWeight:700, color:s.c }}>{s.v}</p>
                        </div>
                      ))}
                    </div>

                    <div style={{ background:'#0b0e11', borderRadius:8, padding:'8px 12px', fontSize:11, color:'#848e9c', display:'flex', justifyContent:'space-between' }}>
                      <span>Pair: <span style={{ color:'#eaecef', fontWeight:600 }}>{bot.coin||'BTC'}/USDT</span></span>
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
              <p style={{ color:'#848e9c', fontSize:13, marginBottom:20 }}>Copy proven strategies. One-click deployment with real balance deduction.</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))', gap:16 }}>
                {[
                  { name:'BTC Grid Master', author:'CryptoWhale', roi:'+18.4%', risk:'Medium', users:4820, color:'#f7931a', icon:'📊', type:'grid',   coin:'BTC', desc:'Optimized BTC grid for current volatility range' },
                  { name:'ETH DCA Pro',     author:'DeFiAnalyst', roi:'+12.1%', risk:'Low',    users:3210, color:'#627eea', icon:'💰', type:'dca',    coin:'ETH', desc:'Weekly ETH accumulation with smart rebalancing' },
                  { name:'SOL Scalper',     author:'SolanaKing',  roi:'+31.6%', risk:'High',   users:1540, color:'#9945ff', icon:'⚡', type:'futures',coin:'SOL', desc:'High frequency SOL futures scalping bot' },
                  { name:'Multi-Coin DCA',  author:'MarketGuru',  roi:'+9.8%',  risk:'Low',    users:6700, color:'#0ecb81', icon:'🔄', type:'dca',    coin:'BTC', desc:'Diversified DCA across top 5 coins' },
                  { name:'BNB Arbitrage',   author:'ArbMaster',   roi:'+6.3%',  risk:'Low',    users:2300, color:'#f0b90b', icon:'🔁', type:'arbitrage',coin:'BNB',desc:'BNB/USDT price discrepancy exploitation' },
                  { name:'Futures Momentum',author:'TrendTrader', roi:'+45.2%', risk:'High',   users:890,  color:'#f6465d', icon:'🚀', type:'futures',coin:'BTC', desc:'Ride strong trends with automated entries' },
                ].map((bot,i) => (
                  <div key={i} className="tb-card">
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                      <div style={{ width:40, height:40, borderRadius:10, background:bot.color+'18', border:`1px solid ${bot.color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
                        {bot.icon}
                      </div>
                      <div style={{ minWidth:0 }}>
                        <p style={{ fontWeight:700, fontSize:13, color:'#eaecef', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{bot.name}</p>
                        <p style={{ fontSize:11, color:'#848e9c' }}>by @{bot.author}</p>
                      </div>
                    </div>
                    <p style={{ fontSize:12, color:'#848e9c', lineHeight:1.5, marginBottom:10 }}>{bot.desc}</p>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:12 }}>
                      <span style={{ color:'#0ecb81', fontWeight:700 }}>{bot.roi}/mo</span>
                      <span style={{ color:RISK_COLOR[bot.risk], fontWeight:700 }}>{bot.risk} Risk</span>
                      <span style={{ color:'#5e6673' }}>{bot.users.toLocaleString()} users</span>
                    </div>
                    <button className="tb-btn y" style={{ width:'100%', justifyContent:'center' }}
                      onClick={() => {
                        const t = BOT_TEMPLATES.find(x => x.id === bot.type) || BOT_TEMPLATES[0];
                        setSelTemplate(t);
                        setForm(f => ({ ...f, coin:bot.coin }));
                        setShowModal(true);
                      }}>
                      Copy Strategy
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── LEARN ── */}
          {tab === 'learn' && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }} className="grid-2">
              {[
                { icon:'📊', title:'What is Grid Trading?',  time:'5 min',  color:'#627eea', desc:'Learn how grid bots profit from sideways markets by placing buy and sell orders at regular price intervals.' },
                { icon:'💰', title:'DCA Strategy Guide',      time:'4 min',  color:'#0ecb81', desc:'Dollar Cost Averaging reduces risk by investing fixed amounts regularly, regardless of market conditions.' },
                { icon:'⚡', title:'Futures Bot Risks',       time:'7 min',  color:'#f6465d', desc:'Understand leverage, liquidation risk, and how futures bots work before deploying capital.' },
                { icon:'🔄', title:'Arbitrage Explained',     time:'6 min',  color:'#f0b90b', desc:'How arbitrage bots exploit price differences between pairs to generate consistent returns.' },
                { icon:'🛡️', title:'Risk Management',        time:'8 min',  color:'#9b58f0', desc:'Setting proper stop-losses, position sizing, and diversification to protect your capital.' },
                { icon:'📈', title:'Backtesting Strategies',  time:'10 min', color:'#00b4e6', desc:'How to test your bot strategy against historical data before going live with real funds.' },
              ].map((a,i) => (
                <div key={i} className="tb-card" style={{ cursor:'pointer' }} onClick={() => alert(`Coming soon: ${a.title}`)}>
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
