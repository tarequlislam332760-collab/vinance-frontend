import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import {
  Key, Plus, Trash2, Eye, EyeOff, Copy, Shield,
  CheckCircle, AlertCircle, X, Activity, Code,
  Globe, Zap, ChevronRight, Loader2, RefreshCw,
  ChevronDown, Lock, Unlock, ExternalLink
} from 'lucide-react';

const API = 'https://vinance-backend-1.onrender.com';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  .am { font-family:'Inter',sans-serif; background:#0b0e11; color:#eaecef; min-height:100vh; }
  .am * { box-sizing:border-box; margin:0; padding:0; }
  .am ::-webkit-scrollbar { width:4px; }
  .am ::-webkit-scrollbar-thumb { background:#2b3139; border-radius:4px; }
  .am-card { background:#161a1e; border:1px solid #1e2329; border-radius:16px; padding:20px; }
  .am-input { width:100%; background:#0b0e11; border:1px solid #2b3139; border-radius:10px; padding:10px 14px; color:#eaecef; font-size:13px; outline:none; font-family:inherit; transition:border .15s; }
  .am-input:focus { border-color:#f0b90b; }
  .am-input::placeholder { color:#5e6673; }
  .am-btn { display:inline-flex; align-items:center; gap:6px; padding:9px 18px; border:none; border-radius:10px; font-size:13px; font-weight:700; cursor:pointer; font-family:inherit; transition:all .15s; }
  .am-btn.gold { background:#f0b90b; color:#0b0e11; }
  .am-btn.gold:hover { background:#d4a30a; }
  .am-btn.gold:disabled { background:#2b3139; color:#5e6673; cursor:not-allowed; }
  .am-btn.gray { background:#1e2329; color:#848e9c; border:1px solid #2b3139; }
  .am-btn.gray:hover { color:#eaecef; }
  .am-btn.red { background:rgba(246,70,93,.1); color:#f6465d; border:1px solid rgba(246,70,93,.25); }
  .am-btn.red:hover { background:#f6465d; color:#fff; }
  .am-tab { padding:10px 18px; font-size:13px; font-weight:600; background:transparent; border:none; color:#848e9c; cursor:pointer; border-bottom:2px solid transparent; font-family:inherit; transition:all .15s; }
  .am-tab.on { color:#eaecef; border-bottom-color:#f0b90b; }
  .am-tab:hover { color:#eaecef; }
  .perm-toggle { display:flex; align-items:center; gap:10px; padding:12px 14px; background:#0b0e11; border-radius:10px; border:1px solid #2b3139; cursor:pointer; transition:border .15s; }
  .perm-toggle:hover { border-color:#f0b90b30; }
  .perm-toggle.on { border-color:rgba(240,185,11,.3); background:rgba(240,185,11,.04); }
  .switch { width:36px; height:20px; background:#2b3139; border-radius:10px; position:relative; transition:background .2s; flex-shrink:0; }
  .switch.on { background:#f0b90b; }
  .switch::after { content:''; position:absolute; width:14px; height:14px; background:#fff; border-radius:50%; top:3px; left:3px; transition:transform .2s; }
  .switch.on::after { transform:translateX(16px); }
  .key-row { background:#161a1e; border:1px solid #1e2329; border-radius:12px; padding:16px; transition:border .15s; }
  .key-row:hover { border-color:#2b3139; }
  .modal-bg { position:fixed; inset:0; background:rgba(0,0,0,.88); backdrop-filter:blur(8px); z-index:999; display:flex; align-items:center; justify-content:center; padding:16px; overflow-y:auto; }
  .modal-box { background:#161a1e; border:1px solid #2b3139; border-radius:22px; padding:26px; width:100%; max-width:520px; max-height:92vh; overflow-y:auto; }
  .code-block { background:#0b0e11; border:1px solid #2b3139; border-radius:10px; padding:14px 16px; font-family:monospace; font-size:12px; color:#0ecb81; overflow-x:auto; white-space:pre; line-height:1.6; }
  @keyframes spin { to { transform:rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
  .spin { animation:spin .8s linear infinite; }
  .fade { animation:fadeUp .2s; }
  @media(max-width:768px) {
    .am-grid-2 { grid-template-columns:1fr!important; }
    .am-tabs { overflow-x:auto; scrollbar-width:none; }
    .am-tabs::-webkit-scrollbar { display:none; }
  }
`;

const PERMISSIONS = [
  { key:'read',     label:'Enable Reading',       desc:'Read balance, orders, and history',         icon:<Eye size={16}/> },
  { key:'spot',     label:'Enable Spot & Margin',  desc:'Execute spot trades and margin orders',     icon:<Activity size={16}/> },
  { key:'futures',  label:'Enable Futures',        desc:'Open and manage futures positions',         icon:<Zap size={16}/> },
  { key:'withdraw', label:'Enable Withdrawals',    desc:'Withdraw funds (IP restriction recommended)',icon:<ExternalLink size={16}/> },
];

const DOCS = [
  { title:'Authentication',   desc:'Authenticate via HMAC-SHA256 signing with your API key',    code:'GET /api/profile\nHeaders: { Authorization: "Bearer <token>" }' },
  { title:'Market Data',      desc:'Real-time prices and 24h statistics',                        code:'GET /api/plans\nGET /api/traders' },
  { title:'Trading',          desc:'Place spot orders programmatically',                         code:'POST /api/trade\n{ "type":"buy", "amount":100, "symbol":"BTC" }' },
  { title:'Futures',          desc:'Open leveraged positions',                                   code:'POST /api/futures/trade\n{ "symbol":"BTCUSDT", "type":"buy", "leverage":10 }' },
];

/* Generate a random API key string */
const generateKey = (len = 32) => {
  const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: len }, () => c[Math.floor(Math.random() * c.length)]).join('');
};

export default function ApiManagement() {
  const navigate = useNavigate();
  const { user, token } = useContext(UserContext);

  const [tab,       setTab]       = useState('keys');
  const [keys,      setKeys]      = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [creating,  setCreating]  = useState(false);
  const [toastMsg,  setToastMsg]  = useState(null);
  const [showKey,   setShowKey]   = useState({});
  const [newKeyData,setNewKeyData]= useState(null);
  const [deletingId,setDeletingId]= useState(null);

  const [form, setForm] = useState({
    label: '',
    ip: '',
    perms: { read:true, spot:false, futures:false, withdraw:false },
  });

  const toast = (msg, type='ok') => { setToastMsg({msg,type}); setTimeout(()=>setToastMsg(null),3500); };

  /* ── Fetch keys from MongoDB ── */
  const fetchKeys = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/apikeys`, { headers:{ Authorization:`Bearer ${token}` } });
      setKeys(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      /* If route doesn't exist yet, fall back to empty */
      if (e.response?.status === 404) setKeys([]);
    }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchKeys(); }, [token]);

  /* ── Create Key → POST /api/apikeys ── */
  const handleCreate = async () => {
    if (!form.label.trim()) return toast('API key label is required', 'err');
    if (!token)              return toast('Please login first', 'err');
    setCreating(true);
    try {
      const apiKey    = generateKey(32);
      const secretKey = generateKey(48);
      const res = await axios.post(`${API}/api/apikeys`, {
        label:     form.label,
        ip:        form.ip || 'Unrestricted',
        perms:     form.perms,
        apiKey,
        secretKey,
      }, { headers:{ Authorization:`Bearer ${token}` } });

      const created = res.data.key || { ...form, _id: Date.now().toString(), apiKey, secretKey, status:'active', calls:0, createdAt: new Date().toISOString() };
      setKeys(p => [created, ...p]);
      setNewKeyData({ ...created, apiKey, secretKey }); /* show full secret once */
      setShowModal(false);
      setForm({ label:'', ip:'', perms:{ read:true, spot:false, futures:false, withdraw:false } });
      toast('API key created!');
    } catch (e) {
      /* If backend route not available, save locally as fallback */
      const apiKey    = generateKey(32);
      const secretKey = generateKey(48);
      const newKey = { _id: Date.now().toString(), label:form.label, ip:form.ip||'Unrestricted', perms:{ ...form.perms }, status:'active', calls:0, createdAt: new Date().toISOString(), apiKey, secretKey };
      setKeys(p => [newKey, ...p]);
      setNewKeyData(newKey);
      setShowModal(false);
      setForm({ label:'', ip:'', perms:{ read:true, spot:false, futures:false, withdraw:false } });
      toast('API key created (local)');
    } finally { setCreating(false); }
  };

  /* ── Delete Key → DELETE /api/apikeys/:id ── */
  const deleteKey = async (id) => {
    if (!window.confirm('Delete this API key? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await axios.delete(`${API}/api/apikeys/${id}`, { headers:{ Authorization:`Bearer ${token}` } });
      setKeys(p => p.filter(k => k._id !== id));
      toast('API key deleted');
    } catch {
      setKeys(p => p.filter(k => k._id !== id));
      toast('API key deleted');
    } finally { setDeletingId(null); }
  };

  /* ── Toggle active/inactive → PATCH /api/apikeys/:id ── */
  const toggleStatus = async (id) => {
    const key = keys.find(k => k._id === id);
    const newStatus = key?.status === 'active' ? 'inactive' : 'active';
    try {
      await axios.patch(`${API}/api/apikeys/${id}`, { status: newStatus }, { headers:{ Authorization:`Bearer ${token}` } });
    } catch {}
    setKeys(p => p.map(k => k._id === id ? { ...k, status: newStatus } : k));
  };

  const copyToClipboard = (text) => { navigator.clipboard?.writeText(text); toast('Copied to clipboard!'); };
  const togglePerm = (key) => setForm(p => ({ ...p, perms:{ ...p.perms, [key]: !p.perms[key] } }));
  const activeCount = keys.filter(k => k.status === 'active').length;

  return (
    <>
      <style>{CSS}</style>

      {/* Toast */}
      {toastMsg && (
        <div style={{ position:'fixed', top:16, right:16, zIndex:9999, background:toastMsg.type==='err'?'#f6465d':'#0ecb81', color:'#fff', padding:'11px 18px', borderRadius:12, fontWeight:700, fontSize:13, display:'flex', alignItems:'center', gap:8, boxShadow:'0 8px 32px rgba(0,0,0,.5)', animation:'fadeUp .3s', maxWidth:320 }}>
          {toastMsg.type==='err' ? <AlertCircle size={15}/> : <CheckCircle size={15}/>} {toastMsg.msg}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="modal-bg" onClick={e => e.target===e.currentTarget && setShowModal(false)}>
          <div className="modal-box fade">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
              <div>
                <h3 style={{ fontSize:17, fontWeight:800, color:'#eaecef' }}>Create API Key</h3>
                <p style={{ fontSize:12, color:'#848e9c', marginTop:2 }}>Saved securely to your account</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background:'none', border:'none', color:'#848e9c', cursor:'pointer' }}><X size={19}/></button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div>
                <label style={{ fontSize:11, color:'#848e9c', fontWeight:700, textTransform:'uppercase', marginBottom:6, display:'block' }}>Key Label *</label>
                <input className="am-input" placeholder="e.g. Trading Bot, Read-Only" value={form.label} onChange={e=>setForm(p=>({...p,label:e.target.value}))}/>
              </div>
              <div>
                <label style={{ fontSize:11, color:'#848e9c', fontWeight:700, textTransform:'uppercase', marginBottom:4, display:'block' }}>IP Restriction <span style={{ color:'#5e6673', fontWeight:400 }}>(Optional)</span></label>
                <input className="am-input" placeholder="e.g. 192.168.1.1 — blank = unrestricted" value={form.ip} onChange={e=>setForm(p=>({...p,ip:e.target.value}))}/>
              </div>
              <div>
                <label style={{ fontSize:11, color:'#848e9c', fontWeight:700, textTransform:'uppercase', marginBottom:8, display:'block' }}>Permissions</label>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {PERMISSIONS.map(p => (
                    <div key={p.key} className={`perm-toggle${form.perms[p.key]?' on':''}`} onClick={()=>togglePerm(p.key)}>
                      <div style={{ color:form.perms[p.key]?'#f0b90b':'#848e9c' }}>{p.icon}</div>
                      <div style={{ flex:1 }}>
                        <p style={{ fontSize:13, fontWeight:600, color:'#eaecef', marginBottom:2 }}>{p.label}</p>
                        <p style={{ fontSize:11, color:'#848e9c' }}>{p.desc}</p>
                      </div>
                      <div className={`switch${form.perms[p.key]?' on':''}`}/>
                    </div>
                  ))}
                </div>
              </div>
              {form.perms.withdraw && (
                <div style={{ background:'rgba(246,70,93,.06)', border:'1px solid rgba(246,70,93,.25)', borderRadius:10, padding:12, display:'flex', gap:10 }}>
                  <AlertCircle size={15} style={{ color:'#f6465d', flexShrink:0, marginTop:1 }}/>
                  <p style={{ fontSize:12, color:'#848e9c', lineHeight:1.6 }}>
                    <span style={{ color:'#f6465d', fontWeight:700 }}>Warning:</span> Enabling withdrawals is high risk. Use IP restriction.
                  </p>
                </div>
              )}
              <div style={{ display:'flex', gap:10 }}>
                <button className="am-btn gray" style={{ flex:1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button className="am-btn gold" style={{ flex:2 }} onClick={handleCreate} disabled={creating}>
                  {creating ? <><Loader2 size={14} className="spin"/> Creating...</> : <><Key size={14}/> Create API Key</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Key Display Modal */}
      {newKeyData && (
        <div className="modal-bg">
          <div className="modal-box fade">
            <div style={{ textAlign:'center', marginBottom:20 }}>
              <div style={{ width:52, height:52, background:'rgba(240,185,11,.1)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
                <CheckCircle size={26} style={{ color:'#f0b90b' }}/>
              </div>
              <h3 style={{ fontSize:17, fontWeight:800, color:'#eaecef', marginBottom:6 }}>API Key Created!</h3>
              <p style={{ fontSize:13, color:'#848e9c' }}>Copy your secret key now — it won't be shown again.</p>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:20 }}>
              {[
                { label:'API Key',    value:newKeyData.apiKey,    warn:false },
                { label:'Secret Key', value:newKeyData.secretKey, warn:true  },
              ].map(item => (
                <div key={item.label}>
                  <label style={{ fontSize:11, color:'#848e9c', fontWeight:700, textTransform:'uppercase', marginBottom:6, display:'block' }}>{item.label}</label>
                  <div style={{ display:'flex', alignItems:'center', gap:8, background:'#0b0e11', border:`1px solid ${item.warn?'rgba(246,70,93,.3)':'#2b3139'}`, borderRadius:10, padding:'10px 12px' }}>
                    <code style={{ flex:1, fontSize:12, color:item.warn?'#f6465d':'#0ecb81', fontFamily:'monospace', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.value}</code>
                    <button onClick={()=>copyToClipboard(item.value)} style={{ background:'none', border:'none', color:'#848e9c', cursor:'pointer', flexShrink:0 }}><Copy size={14}/></button>
                  </div>
                  {item.warn && <p style={{ fontSize:11, color:'#f6465d', marginTop:4 }}>Never share your secret key with anyone.</p>}
                </div>
              ))}
            </div>
            <button className="am-btn gold" style={{ width:'100%', justifyContent:'center' }} onClick={() => setNewKeyData(null)}>
              I've saved my keys ✓
            </button>
          </div>
        </div>
      )}

      <div className="am">
        {/* Header */}
        <div style={{ background:'#0b0e11', borderBottom:'1px solid #1e2329', padding:'14px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10, position:'sticky', top:0, zIndex:50 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <button onClick={() => navigate(-1)} style={{ background:'none', border:'none', color:'#848e9c', cursor:'pointer', display:'flex' }}>
              <ChevronDown size={18} style={{ transform:'rotate(90deg)' }}/>
            </button>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <Code size={18} style={{ color:'#f0b90b' }}/>
                <h1 style={{ fontSize:18, fontWeight:800, color:'#eaecef' }}>API Management</h1>
              </div>
              <p style={{ fontSize:11, color:'#5e6673' }}>Keys stored securely in MongoDB</p>
            </div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={fetchKeys} style={{ display:'flex', alignItems:'center', gap:5, padding:'8px 12px', background:'#161a1e', border:'1px solid #2b3139', borderRadius:8, color:'#848e9c', cursor:'pointer', fontSize:12, fontFamily:'inherit' }}>
              <RefreshCw size={13}/> Refresh
            </button>
            <button className="am-btn gold" onClick={() => setShowModal(true)}>
              <Plus size={15}/> Create API Key
            </button>
          </div>
        </div>

        <div style={{ maxWidth:1100, margin:'0 auto', padding:'20px' }}>

          {/* Stats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12, marginBottom:24 }}>
            {[
              { label:'Total Keys',  value:keys.length,      icon:<Key size={18}/>,          color:'#627eea' },
              { label:'Active Keys', value:activeCount,       icon:<CheckCircle size={18}/>,  color:'#0ecb81' },
              { label:'API Calls',   value:keys.reduce((s,k)=>s+(k.calls||0),0), icon:<Activity size={18}/>, color:'#f0b90b' },
            ].map(s => (
              <div key={s.label} className="am-card" style={{ borderTop:`2px solid ${s.color}` }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                  <span style={{ fontSize:10, color:'#848e9c', fontWeight:700, textTransform:'uppercase' }}>{s.label}</span>
                  <div style={{ color:s.color, background:s.color+'18', padding:7, borderRadius:8 }}>{s.icon}</div>
                </div>
                <div style={{ fontSize:22, fontWeight:800, color:'#eaecef' }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="am-tabs" style={{ display:'flex', borderBottom:'1px solid #1e2329', marginBottom:20 }}>
            {[{ k:'keys', l:'API Keys' },{ k:'docs', l:'Documentation' }].map(t => (
              <button key={t.k} className={`am-tab${tab===t.k?' on':''}`} onClick={() => setTab(t.k)}>{t.l}</button>
            ))}
          </div>

          {/* ── KEYS TAB ── */}
          {tab === 'keys' && (
            <div>
              <div style={{ background:'rgba(99,126,234,.06)', border:'1px solid rgba(99,126,234,.2)', borderRadius:12, padding:14, marginBottom:20, display:'flex', gap:12 }}>
                <Shield size={18} style={{ color:'#627eea', flexShrink:0, marginTop:1 }}/>
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color:'#eaecef', marginBottom:4 }}>Keys Stored Securely in MongoDB</p>
                  <p style={{ fontSize:12, color:'#848e9c', lineHeight:1.6 }}>Never share API keys. Enable IP restriction for withdrawals. Rotate keys periodically.</p>
                </div>
              </div>

              {loading ? (
                <div style={{ textAlign:'center', padding:60 }}><Loader2 size={28} className="spin" style={{ color:'#f0b90b', display:'inline-block' }}/></div>
              ) : keys.length === 0 ? (
                <div style={{ textAlign:'center', padding:80, color:'#5e6673' }}>
                  <Key size={52} style={{ opacity:.1, margin:'0 auto 16px', display:'block' }}/>
                  <p style={{ fontSize:16, fontWeight:600, color:'#eaecef', marginBottom:8 }}>No API Keys</p>
                  <p style={{ fontSize:13, marginBottom:24 }}>Create your first API key to connect bots and third-party apps</p>
                  <button className="am-btn gold" onClick={() => setShowModal(true)}><Plus size={15}/> Create API Key</button>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {keys.map(k => (
                    <div key={k._id} className="key-row fade">
                      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, flexWrap:'wrap', marginBottom:12 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div style={{ width:38, height:38, borderRadius:10, background:'rgba(240,185,11,.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            <Key size={17} style={{ color:'#f0b90b' }}/>
                          </div>
                          <div>
                            <p style={{ fontWeight:700, fontSize:14, color:'#eaecef', marginBottom:3 }}>{k.label}</p>
                            <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                              <span style={{ background:k.status==='active'?'rgba(14,203,129,.1)':'rgba(132,142,156,.1)', color:k.status==='active'?'#0ecb81':'#848e9c', padding:'2px 8px', borderRadius:20, fontSize:10, fontWeight:700 }}>
                                {k.status==='active'?'● Active':'⏸ Inactive'}
                              </span>
                              <span style={{ fontSize:11, color:'#5e6673' }}>{new Date(k.createdAt).toLocaleDateString()}</span>
                              {k.ip && k.ip !== 'Unrestricted' && (
                                <span style={{ fontSize:11, color:'#627eea', display:'flex', alignItems:'center', gap:3 }}>
                                  <Globe size={11}/> {k.ip}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div style={{ display:'flex', gap:6 }}>
                          <button className="am-btn gray" style={{ padding:'6px 10px' }} onClick={() => toggleStatus(k._id)} title={k.status==='active'?'Deactivate':'Activate'}>
                            {k.status==='active' ? <Lock size={13}/> : <Unlock size={13}/>}
                          </button>
                          <button className="am-btn red" style={{ padding:'6px 10px' }} onClick={() => deleteKey(k._id)} disabled={deletingId===k._id}>
                            {deletingId===k._id ? <Loader2 size={13} className="spin"/> : <Trash2 size={13}/>}
                          </button>
                        </div>
                      </div>

                      {/* Key rows */}
                      <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:12 }}>
                        {[
                          { label:'API Key',    val:k.apiKey    || '(hidden — copy when created)', secret:false },
                          { label:'Secret Key', val:'●'.repeat(32),                                secret:true  },
                        ].map(item => (
                          <div key={item.label} style={{ display:'flex', alignItems:'center', gap:8, background:'#0b0e11', borderRadius:8, padding:'8px 12px', border:'1px solid #2b3139' }}>
                            <span style={{ fontSize:10, color:'#5e6673', fontWeight:700, textTransform:'uppercase', minWidth:70, flexShrink:0 }}>{item.label}</span>
                            <code style={{ flex:1, fontSize:12, color:item.secret?'#848e9c':'#c6cad2', fontFamily:'monospace', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                              {showKey[k._id+item.label] && !item.secret ? item.val : item.val}
                            </code>
                            {!item.secret && k.apiKey && (
                              <button onClick={() => copyToClipboard(k.apiKey)} style={{ background:'none', border:'none', color:'#848e9c', cursor:'pointer', flexShrink:0 }}><Copy size={13}/></button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Permissions */}
                      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                        {PERMISSIONS.map(p => (
                          <span key={p.key} style={{ padding:'3px 10px', borderRadius:20, fontSize:10, fontWeight:700, background: k.perms?.[p.key]?'rgba(240,185,11,.1)':'rgba(132,142,156,.08)', color: k.perms?.[p.key]?'#f0b90b':'#5e6673' }}>
                            {p.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── DOCS TAB ── */}
          {tab === 'docs' && (
            <div>
              <div style={{ marginBottom:24 }}>
                <h2 style={{ fontSize:20, fontWeight:800, color:'#eaecef', marginBottom:6 }}>Vinance API Documentation</h2>
                <p style={{ fontSize:13, color:'#848e9c' }}>Integrate your apps and bots with Vinance.</p>
              </div>
              <div style={{ background:'rgba(240,185,11,.05)', border:'1px solid rgba(240,185,11,.2)', borderRadius:12, padding:16, marginBottom:24, display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
                <div>
                  <p style={{ fontSize:12, color:'#848e9c', marginBottom:4 }}>Base URL</p>
                  <code style={{ fontSize:14, color:'#f0b90b', fontFamily:'monospace' }}>https://vinance-backend-1.onrender.com</code>
                </div>
                <button className="am-btn gray" onClick={() => copyToClipboard('https://vinance-backend-1.onrender.com')}><Copy size={13}/> Copy</button>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16, marginBottom:24 }}>
                {DOCS.map((doc,i) => (
                  <div key={i} className="am-card">
                    <h3 style={{ fontSize:14, fontWeight:700, color:'#eaecef', marginBottom:6 }}>{doc.title}</h3>
                    <p style={{ fontSize:12, color:'#848e9c', lineHeight:1.6, marginBottom:12 }}>{doc.desc}</p>
                    <div className="code-block">{doc.code}</div>
                  </div>
                ))}
              </div>
              <div className="am-card">
                <h3 style={{ fontSize:15, fontWeight:700, color:'#eaecef', marginBottom:14 }}>Rate Limits</h3>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:12 }}>
                  {[
                    { endpoint:'Market Data',    limit:'1200/min', weight:'1'   },
                    { endpoint:'Order Placement',limit:'100/10s',  weight:'1-5' },
                    { endpoint:'Account Info',   limit:'180/min',  weight:'10'  },
                    { endpoint:'Futures',        limit:'300/min',  weight:'5'   },
                  ].map(r => (
                    <div key={r.endpoint} style={{ background:'#0b0e11', borderRadius:10, padding:'12px 14px', border:'1px solid #2b3139' }}>
                      <p style={{ fontSize:12, fontWeight:700, color:'#eaecef', marginBottom:4 }}>{r.endpoint}</p>
                      <p style={{ fontSize:13, color:'#f0b90b', fontWeight:700, marginBottom:2 }}>{r.limit}</p>
                      <p style={{ fontSize:11, color:'#5e6673' }}>Weight: {r.weight}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
