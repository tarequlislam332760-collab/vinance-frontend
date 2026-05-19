import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { UserContext } from '../context/UserContext';
import {
  ShieldCheck, Users, Clock, PieChart, List,
  UserPlus, Trash2, TrendingUp, CheckCircle, Edit, X,
  Upload, Loader2, RefreshCw, DollarSign, Award,
  AlertCircle, Save, Plus, Settings
} from 'lucide-react';

import ManageUsers      from './ManageUsers';
import PendingRequests  from './PendingRequests';
import ManagePlans      from './ManagePlans';
import InvestmentLogs   from './InvestmentLogs';

/* ─── CORRECT backend URL ─── */
const API_URL = "https://vinance-backend-1.onrender.com";

/* ─── Cloudinary config ─── */
const CLD_URL    = "https://api.cloudinary.com/v1_1/demo/image/upload";
const CLD_PRESET = "ml_default";
/* ↑ Replace "demo" with your Cloud Name and "ml_default" with your preset name if you have them */

const uploadToCloudinary = async (file) => {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', CLD_PRESET);
  fd.append('folder', 'vinance/traders');
  const res  = await fetch(CLD_URL, { method: 'POST', body: fd });
  const data = await res.json();
  if (data.secure_url) return data.secure_url;
  throw new Error(data.error?.message || 'Upload failed');
};

/* ─── Reusable API call with token ─── */
const useApi = (token) => {
  const call = useCallback(async (method, path, body) => {
    const opts = {
      method: method.toUpperCase(),
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    };
    if (body) opts.body = JSON.stringify(body);
    const res  = await fetch(`${API_URL}${path}`, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  }, [token]);
  return call;
};

/* ─── Image Uploader ─── */
const ImageUploader = ({ value, onChange, label = 'Profile Image' }) => {
  const [uploading, setUploading] = useState(false);
  const [drag, setDrag]           = useState(false);
  const inputRef = useRef();

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) { alert('Please select an image'); return; }
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      onChange(url);
    } catch {
      /* fallback: local preview */
      onChange(URL.createObjectURL(file));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label style={{ fontSize:10, fontWeight:700, color:'#848e9c', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:8, display:'block' }}>
        {label}
      </label>
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
        style={{ border:`2px dashed ${drag?'#f0b90b':'#2b3139'}`, borderRadius:12, minHeight:value?120:90, position:'relative', cursor:'pointer', background:drag?'rgba(240,185,11,.04)':'#0b0e11', overflow:'hidden', transition:'all .2s', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <input ref={inputRef} type="file" accept="image/*" style={{ display:'none' }} onChange={e => handleFile(e.target.files[0])} />
        {uploading ? (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, padding:20 }}>
            <Loader2 size={28} style={{ color:'#f0b90b', animation:'spin .8s linear infinite' }}/>
            <span style={{ fontSize:12, color:'#848e9c' }}>Uploading...</span>
          </div>
        ) : value ? (
          <>
            <img src={value} alt="preview" style={{ width:'100%', height:140, objectFit:'cover', display:'block' }}/>
            <button onClick={e=>{ e.stopPropagation(); onChange(''); }}
              style={{ position:'absolute', top:8, right:8, background:'rgba(0,0,0,.7)', border:'none', borderRadius:'50%', width:28, height:28, cursor:'pointer', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <X size={14}/>
            </button>
            <div style={{ position:'absolute', bottom:0, left:0, right:0, background:'rgba(0,0,0,.6)', padding:'5px 10px', fontSize:11, color:'#848e9c', textAlign:'center' }}>
              Click to change
            </div>
          </>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, padding:20 }}>
            <Upload size={22} style={{ color:'#f0b90b' }}/>
            <span style={{ fontSize:12, color:'#848e9c' }}>Click or drag image</span>
          </div>
        )}
      </div>
      <input type="text" placeholder="Or paste image URL"
        value={value && !value.startsWith('blob:') ? value : ''}
        onChange={e => onChange(e.target.value)}
        style={{ marginTop:8, width:'100%', background:'#0b0e11', border:'1px solid #2b3139', borderRadius:8, padding:'8px 12px', color:'#eaecef', fontSize:12, outline:'none', fontFamily:'inherit' }}
        onFocus={e=>e.target.style.borderColor='#f0b90b'}
        onBlur={e=>e.target.style.borderColor='#2b3139'}
      />
    </div>
  );
};

/* ─── Add Trader Form ─── */
const AddTraderForm = ({ onSuccess, showAlert }) => {
  const { token } = useContext(UserContext);
  const api = useApi(token);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name:'', image:'', profit:'', winRate:'', roi:'', pnl:'',
    aum:'', mdd:'', days:'', followers:'', maxFollowers:'500',
  });

  const F = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async () => {
    if (!form.name.trim()) { showAlert('Name is required', 'error'); return; }
    setSaving(true);
    try {
      await api('POST', '/api/admin/create-trader', {
        name:         form.name,
        image:        form.image, img: form.image, avatar: form.image,
        profit:       Number(form.profit)       || 0,
        winRate:      Number(form.winRate)       || 0,
        roi:          Number(form.roi)           || 0,
        pnl:          Number(form.pnl)           || 0,
        aum:          Number(form.aum)           || 0,
        mdd:          Number(form.mdd)           || 0,
        days:         Number(form.days)          || 0,
        followers:    Number(form.followers)     || 0,
        maxFollowers: Number(form.maxFollowers)  || 500,
        isApiEnabled: true,
        status:       'approved',
      });
      showAlert('Trader created!');
      setForm({ name:'', image:'', profit:'', winRate:'', roi:'', pnl:'', aum:'', mdd:'', days:'', followers:'', maxFollowers:'500' });
      setOpen(false);
      onSuccess();
    } catch (err) {
      showAlert(err.message || 'Create failed', 'error');
    } finally { setSaving(false); }
  };

  if (!open) return (
    <button onClick={() => setOpen(true)}
      style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px', background:'#f0b90b', border:'none', borderRadius:10, color:'#0b0e11', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>
      <Plus size={15}/> Add New Trader
    </button>
  );

  return (
    <div style={{ background:'#0b0e11', border:'1px solid #2b3139', borderRadius:16, padding:24, marginBottom:24 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
        <h3 style={{ color:'#f0b90b', fontWeight:800, fontSize:15 }}>Add New Trader</h3>
        <button onClick={() => setOpen(false)} style={{ background:'none', border:'none', color:'#848e9c', cursor:'pointer' }}><X size={18}/></button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14, marginBottom:16 }}>
        <div style={{ gridColumn:'1/-1' }}>
          <label style={{ fontSize:10, color:'#848e9c', fontWeight:700, textTransform:'uppercase', marginBottom:6, display:'block' }}>Name *</label>
          <input className="adm-input" placeholder="e.g. CryptoMaster Pro" value={form.name} onChange={F('name')}/>
        </div>
        <div style={{ gridColumn:'1/-1' }}>
          <ImageUploader label="Profile Image" value={form.image} onChange={v => setForm(p=>({...p, image:v}))}/>
        </div>
        {[
          ['roi','ROI (%)','45.5'], ['pnl','PNL ($)','12500'],
          ['profit','Profit (%)','38'], ['winRate','Win Rate (%)','78'],
          ['aum','AUM ($)','250000'], ['mdd','Max Drawdown (%)','12'],
          ['days','Days Active','120'], ['followers','Followers','320'],
          ['maxFollowers','Max Followers','500'],
        ].map(([k,l,p]) => (
          <div key={k}>
            <label style={{ fontSize:10, color:'#848e9c', fontWeight:700, textTransform:'uppercase', marginBottom:6, display:'block' }}>{l}</label>
            <input className="adm-input" type="number" placeholder={p} value={form[k]} onChange={F(k)} style={{ padding:'9px 12px', fontSize:13 }}/>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', gap:10 }}>
        <button onClick={() => setOpen(false)} style={{ flex:1, padding:'10px', background:'#2b3139', border:'none', borderRadius:8, color:'#848e9c', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
        <button onClick={submit} disabled={saving}
          style={{ flex:2, padding:'10px', background:saving?'#2b3139':'#f0b90b', border:'none', borderRadius:8, color:saving?'#5e6673':'#0b0e11', fontWeight:700, cursor:saving?'not-allowed':'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
          {saving ? <><Loader2 size={14} style={{ animation:'spin .8s linear infinite' }}/> Saving...</> : <><Plus size={14}/> Create Trader</>}
        </button>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   MAIN ADMIN PANEL
════════════════════════════════════════════════════════════ */
const AdminPanel = () => {
  const { token } = useContext(UserContext);
  const api = useApi(token);

  const [activeTab, setActiveTab] = useState('users');
  const [users,       setUsers]       = useState([]);
  const [requests,    setRequests]    = useState([]);
  const [investments, setInvestments] = useState([]);
  const [traders,     setTraders]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [alert,       setAlert]       = useState(null);

  /* Balance modal */
  const [isBalanceModal, setIsBalanceModal] = useState(false);
  const [selectedUser,   setSelectedUser]   = useState(null);
  const [newBalance,     setNewBalance]     = useState('');

  /* Edit trader modal */
  const [isEditModal,   setIsEditModal]   = useState(false);
  const [selectedTrader, setSelectedTrader] = useState(null);
  const [editData, setEditData] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3000);
  };

  /* ── Fetch ── */
  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await api('GET', '/api/admin/all-data');
      setUsers(       Array.isArray(data.users)       ? data.users       : []);
      setRequests(    Array.isArray(data.requests)    ? data.requests    : []);
      setTraders(     Array.isArray(data.traders)     ? data.traders     : []);
      setInvestments( Array.isArray(data.investments) ? data.investments : []);
    } catch (err) {
      console.error('Admin fetch:', err.message);
      showAlert('Failed to load: ' + err.message, 'error');
    } finally { setLoading(false); }
  }, [token, api]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── Safe helpers ── */
  const safeStr  = (v) => (v !== null && v !== undefined ? String(v) : '');
  const isApproved = (t) => t?.status === 'approved' || t?.status === true || t?.status === 'true';
  const isPending  = (t) => !isApproved(t);

  /* ── Trader actions ── */
  const approveTrader = async (id) => {
    try {
      await api('PUT', `/api/admin/edit-trader/${id}`, { status: 'approved' });
      showAlert('Trader approved!');
      fetchData();
    } catch (err) { showAlert(err.message, 'error'); }
  };

  const deleteTrader = async (id) => {
    if (!window.confirm('Delete this trader?')) return;
    try {
      await api('DELETE', `/api/admin/delete-trader/${id}`);
      showAlert('Deleted');
      fetchData();
    } catch (err) { showAlert(err.message, 'error'); }
  };

  const openEdit = (trader) => {
    setSelectedTrader(trader);
    const img = trader.image || trader.img || trader.avatar || '';
    setEditData({
      name: trader.name || '', image: img, img, avatar: img,
      roi: trader.roi || '', pnl: trader.pnl || '',
      profit: trader.profit || '', winRate: trader.winRate || '',
      aum: trader.aum || '', mdd: trader.mdd || '',
      days: trader.days || '', followers: trader.followers || '',
      maxFollowers: trader.maxFollowers || 500,
    });
    setIsEditModal(true);
  };

  const saveEdit = async () => {
    if (!editData.name) { showAlert('Name required', 'error'); return; }
    setSavingEdit(true);
    try {
      const img = editData.image || editData.img || editData.avatar || '';
      await api('PUT', `/api/admin/edit-trader/${selectedTrader._id}`, {
        ...editData, image: img, img, avatar: img,
        profit: Number(editData.profit) || 0, winRate: Number(editData.winRate) || 0,
        roi: Number(editData.roi) || 0, pnl: Number(editData.pnl) || 0,
        aum: Number(editData.aum) || 0, mdd: Number(editData.mdd) || 0,
        days: Number(editData.days) || 0, followers: Number(editData.followers) || 0,
        maxFollowers: Number(editData.maxFollowers) || 500,
      });
      showAlert('Trader updated!');
      setIsEditModal(false);
      fetchData();
    } catch (err) { showAlert(err.message, 'error'); }
    finally { setSavingEdit(false); }
  };

  /* ── Balance update ── */
  const updateBalance = async () => {
    if (newBalance === '' || Number(newBalance) < 0) { showAlert('Invalid balance', 'error'); return; }
    try {
      await api('POST', '/api/admin/update-balance', { userId: selectedUser._id, balance: Number(newBalance) });
      showAlert('Balance updated!');
      setIsBalanceModal(false);
      fetchData();
    } catch (err) { showAlert(err.message, 'error'); }
  };

  /* ── Stats ── */
  const pending  = requests.filter(r => r?.status === 'pending');
  const totalBal = users.reduce((s, u) => s + (u?.balance || 0), 0);

  /* ── Loading ── */
  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#0b0e11', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
      <Loader2 size={36} style={{ color:'#f0b90b', animation:'spin .8s linear infinite' }}/>
      <span style={{ color:'#f0b90b', fontWeight:800, fontSize:13, letterSpacing:4, textTransform:'uppercase' }}>Loading Admin...</span>
    </div>
  );

  const TABS = [
    { key:'users',    label:'Users',    icon:<Users size={14}/>,   count: users.length },
    { key:'requests', label:'Requests', icon:<Clock size={14}/>,   count: pending.length, alert: pending.length > 0 },
    { key:'plans',    label:'Plans',    icon:<PieChart size={14}/>, count: null },
    { key:'logs',     label:'Logs',     icon:<List size={14}/>,    count: null },
    { key:'traders',  label:'Traders',  icon:<UserPlus size={14}/>, count: traders.filter(isApproved).length },
  ];

  return (
    <div style={{ background:'#0b0e11', minHeight:'100vh', color:'#eaecef', fontFamily:"'Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box;}
        .adm-input{background:#0b0e11;border:1px solid #2b3139;border-radius:10px;padding:10px 14px;color:#eaecef;font-size:13px;outline:none;font-family:inherit;width:100%;transition:border .15s;}
        .adm-input:focus{border-color:#f0b90b;}
        .adm-btn{padding:8px 16px;border:none;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;gap:6px;transition:all .15s;}
        .btn-green{background:rgba(14,203,129,.1);color:#0ecb81;border:1px solid rgba(14,203,129,.25);}
        .btn-green:hover{background:#0ecb81;color:#0b0e11;}
        .btn-red{background:rgba(246,70,93,.1);color:#f6465d;border:1px solid rgba(246,70,93,.25);}
        .btn-red:hover{background:#f6465d;color:#fff;}
        .btn-blue{background:rgba(99,126,234,.1);color:#627eea;border:1px solid rgba(99,126,234,.25);}
        .btn-blue:hover{background:#627eea;color:#fff;}
        .btn-gold{background:#f0b90b;color:#0b0e11;}
        .btn-gold:hover{background:#d4a30a;}
        .stat-card{background:linear-gradient(135deg,#161a1e,#1a2028);border:1px solid #1e2329;border-radius:18px;padding:20px 22px;}
        .adm-table{width:100%;border-collapse:collapse;}
        .adm-table th{padding:10px 16px;color:#848e9c;font-size:11px;font-weight:700;text-align:left;border-bottom:1px solid #1e2329;text-transform:uppercase;letter-spacing:.05em;white-space:nowrap;}
        .adm-table td{padding:12px 16px;border-bottom:1px solid #1e232950;font-size:13px;vertical-align:middle;}
        .adm-table tr:hover td{background:rgba(255,255,255,.02);}
        .adm-table tr:last-child td{border-bottom:none;}
        .badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;}
        .bdg-pending{background:rgba(240,185,11,.12);color:#f0b90b;}
        .bdg-approved,.bdg-completed{background:rgba(14,203,129,.12);color:#0ecb81;}
        .bdg-rejected{background:rgba(246,70,93,.12);color:#f6465d;}
        .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.85);backdrop-filter:blur(6px);z-index:999;display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto;}
        .modal-box{background:#161a1e;border:1px solid #2b3139;border-radius:24px;padding:28px;width:100%;max-width:520px;max-height:92vh;overflow-y:auto;animation:fadeIn .25s;}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-thumb{background:#2b3139;border-radius:4px}
      `}</style>

      {/* Toast */}
      {alert && (
        <div style={{ position:'fixed', top:20, right:20, zIndex:9999, background:alert.type==='error'?'#f6465d':'#0ecb81', color:'#fff', padding:'12px 20px', borderRadius:14, fontWeight:700, fontSize:13, animation:'fadeIn .3s', display:'flex', alignItems:'center', gap:8, boxShadow:'0 8px 32px rgba(0,0,0,.5)', maxWidth:300 }}>
          {alert.type==='error' ? <AlertCircle size={16}/> : <CheckCircle size={16}/>}
          {alert.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ background:'#0f1318', borderBottom:'1px solid #1e2329', padding:'14px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10, position:'sticky', top:0, zIndex:50 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'rgba(240,185,11,.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <ShieldCheck size={20} style={{ color:'#f0b90b' }}/>
          </div>
          <div>
            <div style={{ fontSize:16, fontWeight:800, color:'#f0b90b', letterSpacing:1 }}>VINANCE ADMIN</div>
            <div style={{ fontSize:11, color:'#5e6673' }}>Command Center</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {pending.length > 0 && (
            <div style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(246,70,93,.1)', border:'1px solid rgba(246,70,93,.2)', borderRadius:20, padding:'5px 12px', fontSize:12, color:'#f6465d', fontWeight:700 }}>
              <AlertCircle size={13}/> {pending.length} Pending
            </div>
          )}
          <button onClick={fetchData} className="adm-btn" style={{ background:'#1e2329', color:'#848e9c', border:'1px solid #2b3139' }}>
            <RefreshCw size={13}/> Refresh
          </button>
        </div>
      </div>

      <div style={{ padding:'20px 24px' }}>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12, marginBottom:22 }}>
          {[
            { l:'Total Users',    v: users.length,                       color:'#627eea', icon:<Users size={18}/> },
            { l:'Total Balance',  v:`$${totalBal.toLocaleString(undefined,{minimumFractionDigits:2})}`, color:'#f0b90b', icon:<DollarSign size={18}/> },
            { l:'Pending',        v: pending.length,                     color:'#f6465d', icon:<Clock size={18}/> },
            { l:'Active Traders', v: traders.filter(isApproved).length,  color:'#0ecb81', icon:<Award size={18}/> },
          ].map(s => (
            <div key={s.l} className="stat-card" style={{ borderTop:`2px solid ${s.color}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                <span style={{ fontSize:10, color:'#848e9c', fontWeight:700, textTransform:'uppercase', letterSpacing:'.04em' }}>{s.l}</span>
                <div style={{ color:s.color, background:s.color+'18', padding:7, borderRadius:8 }}>{s.icon}</div>
              </div>
              <div style={{ fontSize:22, fontWeight:800, color:'#eaecef' }}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:6, overflowX:'auto', marginBottom:20, scrollbarWidth:'none' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 18px', border:'none', borderRadius:12, fontSize:13, fontWeight:activeTab===t.key?700:500, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap', transition:'all .15s', background:activeTab===t.key?'#f0b90b':'#161a1e', color:activeTab===t.key?'#0b0e11':'#848e9c', position:'relative', flexShrink:0 }}>
              {t.icon} {t.label}
              {t.alert && <span style={{ width:7, height:7, borderRadius:'50%', background:'#f6465d', position:'absolute', top:6, right:6 }}/>}
              {t.count !== null && (
                <span style={{ background:activeTab===t.key?'rgba(0,0,0,.2)':'#2b3139', color:activeTab===t.key?'#0b0e11':'#eaecef', borderRadius:20, padding:'1px 7px', fontSize:10, fontWeight:700 }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ background:'#161a1e', borderRadius:20, border:'1px solid #1e2329', overflow:'hidden', minHeight:400 }}>

          {/* USERS */}
          {activeTab === 'users' && (
            <ManageUsers
              users={users}
              fetchData={fetchData}
              onEdit={(u) => { setSelectedUser(u); setNewBalance(u.balance || 0); setIsBalanceModal(true); }}
            />
          )}

          {/* REQUESTS */}
          {activeTab === 'requests' && <PendingRequests requests={requests} fetchData={fetchData}/>}

          {/* PLANS */}
          {activeTab === 'plans' && <ManagePlans fetchData={fetchData}/>}

          {/* LOGS */}
          {activeTab === 'logs' && <InvestmentLogs data={investments}/>}

          {/* TRADERS */}
          {activeTab === 'traders' && (
            <div style={{ padding:24 }}>

              {/* Pending Applications */}
              {traders.filter(isPending).length > 0 && (
                <div style={{ marginBottom:28 }}>
                  <h3 style={{ fontSize:12, fontWeight:700, color:'#f0b90b', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
                    <Clock size={13}/> Pending Applications ({traders.filter(isPending).length})
                  </h3>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))', gap:12 }}>
                    {traders.filter(isPending).map(trader => (
                      <div key={trader._id} style={{ background:'#0b0e11', border:'1px dashed #2b3139', borderRadius:14, padding:16, display:'flex', justifyContent:'space-between', alignItems:'center', gap:10 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10, minWidth:0 }}>
                          <div style={{ width:44, height:44, borderRadius:'50%', background:'#2b3139', overflow:'hidden', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:800 }}>
                            {trader.image||trader.img||trader.avatar
                              ? <img src={trader.image||trader.img||trader.avatar} alt={trader.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                              : (safeStr(trader.name)[0] || 'T')}
                          </div>
                          <div style={{ minWidth:0 }}>
                            <p style={{ fontWeight:700, color:'#eaecef', fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{trader.name}</p>
                            <p style={{ color:'#848e9c', fontSize:11 }}>ROI: {trader.roi||0}% · AUM: ${trader.aum||0}</p>
                          </div>
                        </div>
                        <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                          <button className="adm-btn btn-green" style={{ padding:'7px 10px' }} onClick={() => approveTrader(trader._id)} title="Approve"><CheckCircle size={15}/></button>
                          <button className="adm-btn btn-red"   style={{ padding:'7px 10px' }} onClick={() => deleteTrader(trader._id)}  title="Delete"><Trash2 size={15}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Trader */}
              <AddTraderForm onSuccess={fetchData} showAlert={showAlert}/>

              {/* Approved Traders */}
              <div style={{ marginTop:24 }}>
                <h3 style={{ fontSize:12, fontWeight:700, color:'#848e9c', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:14 }}>
                  Active Master Traders ({traders.filter(isApproved).length})
                </h3>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))', gap:12 }}>
                  {traders.filter(isApproved).map(trader => (
                    <div key={trader._id} style={{ background:'#0b0e11', border:'1px solid #1e2329', borderRadius:16, padding:18, display:'flex', justifyContent:'space-between', alignItems:'center', gap:12 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:12, minWidth:0 }}>
                        <div style={{ width:50, height:50, borderRadius:'50%', background:'#2b3139', overflow:'hidden', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:800, border:'2px solid #1e2329' }}>
                          {trader.image||trader.img||trader.avatar
                            ? <img src={trader.image||trader.img||trader.avatar} alt={trader.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                            : (safeStr(trader.name)[0] || 'T')}
                        </div>
                        <div style={{ minWidth:0 }}>
                          <p style={{ fontWeight:700, color:'#eaecef', fontSize:14, marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{trader.name}</p>
                          <p style={{ color:'#0ecb81', fontSize:12, fontWeight:700 }}>+{trader.roi||trader.profit||0}% ROI</p>
                          <p style={{ color:'#848e9c', fontSize:11 }}>{trader.followers||0} followers · ${(trader.aum||0).toLocaleString()} AUM</p>
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                        <button className="adm-btn btn-blue" style={{ padding:'8px 10px' }} onClick={() => openEdit(trader)} title="Edit"><Edit size={14}/></button>
                        <button className="adm-btn btn-red"  style={{ padding:'8px 10px' }} onClick={() => deleteTrader(trader._id)} title="Delete"><Trash2 size={14}/></button>
                      </div>
                    </div>
                  ))}
                  {!traders.filter(isApproved).length && (
                    <div style={{ gridColumn:'1/-1', textAlign:'center', padding:40, color:'#5e6673' }}>
                      <Award size={40} style={{ opacity:.15, margin:'0 auto 12px', display:'block' }}/>
                      <p style={{ fontSize:13 }}>No approved traders yet. Add one above.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Balance Modal ── */}
      {isBalanceModal && (
        <div className="modal-bg" onClick={e => e.target===e.currentTarget && setIsBalanceModal(false)}>
          <div className="modal-box">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <div>
                <h3 style={{ fontSize:18, fontWeight:800, color:'#f0b90b' }}>Update Balance</h3>
                <p style={{ fontSize:12, color:'#848e9c', marginTop:2 }}>{selectedUser?.name} — {selectedUser?.email}</p>
              </div>
              <button onClick={() => setIsBalanceModal(false)} style={{ background:'none', border:'none', color:'#848e9c', cursor:'pointer' }}><X size={20}/></button>
            </div>
            <label style={{ fontSize:11, color:'#848e9c', fontWeight:700, textTransform:'uppercase', marginBottom:8, display:'block' }}>
              Current: <span style={{ color:'#f0b90b' }}>${(selectedUser?.balance||0).toFixed(2)}</span>
            </label>
            <div style={{ position:'relative', marginBottom:20 }}>
              <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#f0b90b', fontWeight:700, fontSize:16 }}>$</span>
              <input className="adm-input" type="number" value={newBalance} onChange={e => setNewBalance(e.target.value)} placeholder="0.00" style={{ paddingLeft:32, fontSize:20, fontWeight:800 }}/>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button className="adm-btn" style={{ flex:1, background:'#2b3139', color:'#848e9c' }} onClick={() => setIsBalanceModal(false)}>Cancel</button>
              <button className="adm-btn btn-gold" style={{ flex:2 }} onClick={updateBalance}><Save size={14}/> Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Trader Modal ── */}
      {isEditModal && (
        <div className="modal-bg" onClick={e => e.target===e.currentTarget && setIsEditModal(false)}>
          <div className="modal-box">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
              <h3 style={{ fontSize:18, fontWeight:800, color:'#f0b90b' }}>Edit Trader</h3>
              <button onClick={() => setIsEditModal(false)} style={{ background:'none', border:'none', color:'#848e9c', cursor:'pointer' }}><X size={20}/></button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label style={{ fontSize:10, color:'#848e9c', fontWeight:700, textTransform:'uppercase', marginBottom:6, display:'block' }}>Name *</label>
                <input className="adm-input" value={editData.name||''} onChange={e => setEditData(p=>({...p, name:e.target.value}))} placeholder="Trader name"/>
              </div>
              <ImageUploader
                label="Profile Image"
                value={editData.avatar || editData.image || editData.img || ''}
                onChange={url => setEditData(p => ({ ...p, image:url, img:url, avatar:url }))}
              />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                {[
                  ['roi','ROI (%)'], ['pnl','PNL ($)'],
                  ['profit','Profit (%)'], ['winRate','Win Rate (%)'],
                  ['aum','AUM ($)'], ['mdd','Max Drawdown (%)'],
                  ['days','Days Active'], ['followers','Followers'],
                  ['maxFollowers','Max Followers'],
                ].map(([k,l]) => (
                  <div key={k}>
                    <label style={{ fontSize:10, color:'#848e9c', fontWeight:700, textTransform:'uppercase', marginBottom:5, display:'block' }}>{l}</label>
                    <input className="adm-input" type="number" value={editData[k]||''} onChange={e => setEditData(p=>({...p,[k]:e.target.value}))} style={{ padding:'9px 12px', fontSize:13 }}/>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display:'flex', gap:10, marginTop:22 }}>
              <button className="adm-btn" style={{ flex:1, background:'#2b3139', color:'#848e9c' }} onClick={() => setIsEditModal(false)}>Cancel</button>
              <button className="adm-btn btn-gold" style={{ flex:2 }} disabled={savingEdit} onClick={saveEdit}>
                {savingEdit ? <><Loader2 size={14} style={{ animation:'spin .8s linear infinite' }}/> Saving...</> : <><Save size={14}/> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
