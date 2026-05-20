import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import API from '../api';
import { UserContext } from '../context/UserContext';
import {
  ShieldCheck, Users, Clock, PieChart, List,
  UserPlus, Trash2, TrendingUp, CheckCircle, Edit, X,
  Upload, Loader2, RefreshCw, DollarSign, AlertCircle,
  Save, Award, Search, ArrowDownLeft, ArrowUpRight
} from 'lucide-react';

/* ══ We render sub-panels inline to avoid prop/search bugs ══ */

/* ─── Image Uploader ─── */
const ImageUploader = ({ value, onChange, label = 'Profile Image' }) => {
  const [uploading, setUploading] = useState(false);
  const [drag,      setDrag]      = useState(false);
  const inputRef = useRef();

  const toBase64 = (file) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = e => res(e.target.result);
    r.onerror = () => rej(new Error('read error'));
    r.readAsDataURL(file);
  });

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setUploading(true);
    try {
      /* Try imgbb free API — replace key with yours from imgbb.com */
      const fd = new FormData();
      fd.append('image', file);
      fd.append('key', '2e46a4d0c87a36e4bfc0a7de8bdd4e34'); /* free key */
      const res  = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data?.data?.url) { onChange(data.data.url); return; }
    } catch (_) {}
    /* Fallback: base64 local preview */
    try {
      const b64 = await toBase64(file);
      onChange(b64);
    } catch (_) {}
    finally { setUploading(false); }
    setUploading(false);
  };

  const zoneStyle = {
    border: `2px dashed ${drag ? '#f0b90b' : '#2b3139'}`,
    borderRadius: 12, overflow: 'hidden', position: 'relative',
    minHeight: value ? 130 : 96, cursor: uploading ? 'wait' : 'pointer',
    background: drag ? 'rgba(240,185,11,.04)' : '#0b0e11',
    transition: 'all .2s', display: 'flex', alignItems: 'center', justifyContent: 'center',
  };

  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 700, color: '#848e9c', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8, display: 'block' }}>
        {label}
      </label>
      <div style={zoneStyle}
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}>
        <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={e => handleFile(e.target.files[0])} />

        {uploading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 20 }}>
            <Loader2 size={26} style={{ color: '#f0b90b', animation: 'spin .8s linear infinite' }} />
            <span style={{ fontSize: 12, color: '#848e9c' }}>Uploading...</span>
          </div>
        ) : value ? (
          <>
            <img src={value} alt="preview"
              style={{ width: '100%', height: 130, objectFit: 'cover', display: 'block' }}
              onError={e => { e.target.style.display = 'none'; }} />
            <button onClick={e => { e.stopPropagation(); onChange(''); }}
              style={{ position: 'absolute', top: 7, right: 7, background: 'rgba(0,0,0,.8)', border: 'none', borderRadius: '50%', width: 26, height: 26, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
              <X size={13} />
            </button>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,.6)', padding: '5px 10px', fontSize: 11, color: '#848e9c', textAlign: 'center' }}>
              Click to replace
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 20 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#1e2329', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Upload size={18} style={{ color: '#f0b90b' }} />
            </div>
            <span style={{ fontSize: 13, color: '#eaecef', fontWeight: 600 }}>Click or drag image</span>
            <span style={{ fontSize: 11, color: '#5e6673' }}>PNG / JPG / GIF — max 10MB</span>
          </div>
        )}
      </div>

      {/* URL fallback */}
      <input type="text" placeholder="Or paste image URL here"
        value={value && !value.startsWith('data:') ? value : ''}
        onChange={e => onChange(e.target.value)}
        style={{ marginTop: 8, width: '100%', background: '#0b0e11', border: '1px solid #2b3139', borderRadius: 8, padding: '8px 12px', color: '#eaecef', fontSize: 12, outline: 'none', fontFamily: 'inherit', transition: 'border .15s' }}
        onFocus={e => e.target.style.borderColor = '#f0b90b'}
        onBlur={e => e.target.style.borderColor = '#2b3139'} />

      {value && value.startsWith('http') && (
        <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'rgba(14,203,129,.06)', border: '1px solid rgba(14,203,129,.15)', borderRadius: 8 }}>
          <img src={value} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
          <span style={{ fontSize: 11, color: '#0ecb81', fontWeight: 600 }}>URL set</span>
          <CheckCircle size={12} style={{ color: '#0ecb81', marginLeft: 'auto' }} />
        </div>
      )}
    </div>
  );
};

/* ─── Safe string helper ─── */
const safe = (v) => (v == null ? '' : String(v));

/* ════════════════════════════════════════════════════
   MAIN ADMIN PANEL
════════════════════════════════════════════════════ */
export default function AdminPanel() {
  const { token } = useContext(UserContext);

  const [tab,         setTab]         = useState('users');
  const [users,       setUsers]       = useState([]);
  const [requests,    setRequests]    = useState([]);
  const [investments, setInvestments] = useState([]);
  const [traders,     setTraders]     = useState([]);
  const [plans,       setPlans]       = useState([]);
  const [loading,     setLoading]     = useState(true);

  const [search,     setSearch]     = useState('');
  const [reqFilter,  setReqFilter]  = useState('pending');

  /* balance modal */
  const [balModal, setBalModal]   = useState(false);
  const [selUser,  setSelUser]    = useState(null);
  const [newBal,   setNewBal]     = useState('');

  /* trader edit modal */
  const [editModal,   setEditModal]   = useState(false);
  const [selTrader,   setSelTrader]   = useState(null);
  const [eData,       setEData]       = useState({});
  const [savingT,     setSavingT]     = useState(false);

  /* plan modal */
  const [planModal, setPlanModal] = useState(false);
  const [planData,  setPlanData]  = useState({});
  const [savingP,   setSavingP]   = useState(false);

  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── fetch ── */
  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await API.get('/api/admin/all-data');
      setUsers(Array.isArray(res.data.users)       ? res.data.users       : []);
      setRequests(Array.isArray(res.data.requests) ? res.data.requests    : []);
      setTraders(Array.isArray(res.data.traders)   ? res.data.traders     : []);
      setPlans(Array.isArray(res.data.plans)       ? res.data.plans       : []);
      setInvestments(
        Array.isArray(res.data.investments) ? res.data.investments :
        Array.isArray(res.data.requests)    ? res.data.requests    : []
      );
    } catch { showToast('Failed to load data', 'err'); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  /* ── helpers ── */
  const isPending  = t => !t.status || t.status === 'pending' || t.status === false || t.status === 'false';
  const isApproved = t => t.status === true || t.status === 'true' || t.status === 'approved';
  const fmt        = n  => `$${(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  const pending    = requests.filter(r => r.status === 'pending');
  const totalBal   = users.reduce((s, u) => s + (u.balance || 0), 0);

  /* ── request action ── */
  const handleRequest = async (id, status) => {
    try {
      await API.post('/api/admin/handle-request', { id, status });
      showToast(`Request ${status}`);
      load();
    } catch (e) { showToast(safe(e?.response?.data?.message) || 'Failed', 'err'); }
  };

  /* ── user actions ── */
  const handleBalSave = async () => {
    const b = parseFloat(newBal);
    if (isNaN(b) || b < 0) return showToast('Invalid amount', 'err');
    try {
      await API.post('/api/admin/update-balance', { userId: selUser._id, balance: b });
      showToast('Balance updated!');
      setBalModal(false);
      load();
    } catch { showToast('Failed', 'err'); }
  };

  const handleDelUser = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      await API.delete(`/api/admin/delete-user/${id}`);
      showToast('User deleted');
      load();
    } catch { showToast('Failed', 'err'); }
  };

  /* ── trader actions ── */
  const handleApprove = async (id) => {
    try {
      await API.put(`/api/admin/edit-trader/${id}`, { status: 'approved' });
      showToast('Trader approved!');
      load();
    } catch { showToast('Failed', 'err'); }
  };

  const handleDelTrader = async (id) => {
    if (!window.confirm('Delete this trader?')) return;
    try {
      await API.delete(`/api/admin/delete-trader/${id}`);
      showToast('Trader deleted');
      load();
    } catch { showToast('Failed', 'err'); }
  };

  const openEdit = (t) => {
    setSelTrader(t);
    const img = safe(t.image || t.img || t.avatar);
    setEData({
      name: safe(t.name), profit: t.profit || '', winRate: t.winRate || '',
      aum: t.aum || '', mdd: t.mdd || '', roi: t.roi || '',
      pnl: t.pnl || '', days: t.days || '',
      followers: t.followers || '', maxFollowers: t.maxFollowers || 500,
      image: img, img, avatar: img,
    });
    setEditModal(true);
  };

  const handleSaveTrader = async () => {
    if (!safe(eData.name).trim()) return showToast('Name required', 'err');
    setSavingT(true);
    try {
      const img = safe(eData.image || eData.img || eData.avatar);
      await API.put(`/api/admin/edit-trader/${selTrader._id}`, {
        ...eData,
        image: img, img, avatar: img,
        profit: Number(eData.profit) || 0, winRate: Number(eData.winRate) || 0,
        aum: Number(eData.aum) || 0, mdd: Number(eData.mdd) || 0,
        roi: Number(eData.roi) || 0, pnl: Number(eData.pnl) || 0,
        days: Number(eData.days) || 0, followers: Number(eData.followers) || 0,
        maxFollowers: Number(eData.maxFollowers) || 500,
      });
      showToast('Trader updated!');
      setEditModal(false);
      load();
    } catch { showToast('Update failed', 'err'); }
    finally { setSavingT(false); }
  };

  /* ── plan actions ── */
  const handleSavePlan = async () => {
    if (!safe(planData.name).trim()) return showToast('Name required', 'err');
    setSavingP(true);
    try {
      await API.post('/api/admin/create-plan', {
        name: planData.name,
        minAmount: Number(planData.minAmount) || 10,
        maxAmount: Number(planData.maxAmount) || 10000,
        profitPercent: Number(planData.profitPercent) || 5,
        duration: Number(planData.duration) || 24,
      });
      showToast('Plan created!');
      setPlanModal(false);
      setPlanData({});
      load();
    } catch { showToast('Failed', 'err'); }
    finally { setSavingP(false); }
  };

  const handleDelPlan = async (id) => {
    if (!window.confirm('Delete this plan?')) return;
    try {
      await API.delete(`/api/admin/delete-plan/${id}`);
      showToast('Plan deleted');
      load();
    } catch { showToast('Failed', 'err'); }
  };

  /* ── filtered data ── */
  const filteredUsers = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return safe(u.name).toLowerCase().includes(q) || safe(u.email).toLowerCase().includes(q);
  });

  const filteredReqs = requests.filter(r => {
    const matchFilter = reqFilter === 'all' ? true : safe(r.status) === reqFilter;
    if (!search) return matchFilter;
    const q = search.toLowerCase();
    return matchFilter && (
      safe(r.userId?.name).toLowerCase().includes(q) ||
      safe(r.type).toLowerCase().includes(q) ||
      safe(r.userId?.email).toLowerCase().includes(q)
    );
  });

  const TABS = [
    { key: 'users',    label: 'Users',        icon: <Users size={14} />,    badge: users.length },
    { key: 'requests', label: 'Requests',     icon: <Clock size={14} />,    badge: pending.length, red: pending.length > 0 },
    { key: 'traders',  label: 'Traders',      icon: <UserPlus size={14} />, badge: traders.filter(isApproved).length },
    { key: 'plans',    label: 'Plans',        icon: <PieChart size={14} />, badge: plans.length },
    { key: 'logs',     label: 'Investments',  icon: <List size={14} />,     badge: investments.length },
  ];

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0b0e11', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <Loader2 size={36} style={{ color: '#f0b90b', animation: 'spin .8s linear infinite' }} />
      <span style={{ color: '#f0b90b', fontWeight: 800, fontSize: 13, letterSpacing: 3, textTransform: 'uppercase' }}>Loading...</span>
    </div>
  );

  return (
    <div style={{ background: '#0b0e11', minHeight: '100vh', color: '#eaecef', fontFamily: "'Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeSlide{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-thumb{background:#2b3139;border-radius:4px}
        .ns{scrollbar-width:none}.ns::-webkit-scrollbar{display:none}
        .ai{background:#0b0e11;border:1px solid #2b3139;border-radius:10px;padding:10px 14px;color:#eaecef;font-size:13px;outline:none;font-family:inherit;width:100%;transition:border .15s;}
        .ai:focus{border-color:#f0b90b;}
        .btn{padding:7px 15px;border:none;border-radius:9px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;gap:5px;transition:all .15s;white-space:nowrap;}
        .g{background:rgba(14,203,129,.1);color:#0ecb81;border:1px solid rgba(14,203,129,.25);}
        .g:hover{background:#0ecb81;color:#0b0e11;}
        .r{background:rgba(246,70,93,.1);color:#f6465d;border:1px solid rgba(246,70,93,.25);}
        .r:hover{background:#f6465d;color:#fff;}
        .b{background:rgba(99,126,234,.1);color:#627eea;border:1px solid rgba(99,126,234,.25);}
        .b:hover{background:#627eea;color:#fff;}
        .y{background:#f0b90b;color:#0b0e11;}
        .y:hover{background:#d4a30a;}
        .t{width:100%;border-collapse:collapse;}
        .t th{padding:10px 14px;color:#848e9c;font-size:11px;font-weight:700;text-align:left;border-bottom:1px solid #1e2329;text-transform:uppercase;letter-spacing:.05em;white-space:nowrap;}
        .t td{padding:11px 14px;border-bottom:1px solid #1e232940;font-size:13px;vertical-align:middle;}
        .t tr:hover td{background:rgba(255,255,255,.02);}
        .t tr:last-child td{border-bottom:none;}
        .bd{display:inline-flex;align-items:center;padding:2px 9px;border-radius:20px;font-size:11px;font-weight:700;}
        .mb{position:fixed;inset:0;background:rgba(0,0,0,.88);backdrop-filter:blur(8px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto;}
        .mx{background:#161a1e;border:1px solid #2b3139;border-radius:22px;padding:26px;width:100%;max-width:520px;max-height:92vh;overflow-y:auto;animation:fadeSlide .25s;}
        .sc{background:linear-gradient(135deg,#161a1e,#1a2028);border:1px solid #1e2329;border-radius:16px;padding:18px 20px;}
        @media(max-width:640px){.t th,.t td{padding:8px 10px;font-size:12px;}.hs{display:none!important;}.mx{padding:18px;}}
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 99999, background: toast.type === 'err' ? '#f6465d' : '#0ecb81', color: '#fff', padding: '12px 20px', borderRadius: 14, fontWeight: 700, fontSize: 13, animation: 'fadeSlide .3s', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 32px rgba(0,0,0,.5)', maxWidth: 340 }}>
          {toast.type === 'err' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ background: '#0f1318', borderBottom: '1px solid #1e2329', padding: '13px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(240,185,11,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={19} style={{ color: '#f0b90b' }} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#f0b90b', letterSpacing: 1 }}>VINANCE ADMIN</div>
            <div style={{ fontSize: 11, color: '#5e6673' }}>Command Center</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {pending.length > 0 && (
            <div style={{ background: 'rgba(246,70,93,.1)', border: '1px solid rgba(246,70,93,.2)', borderRadius: 20, padding: '4px 11px', fontSize: 12, color: '#f6465d', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
              <AlertCircle size={12} /> {pending.length} Pending
            </div>
          )}
          <button onClick={() => { setSearch(''); load(); }} className="btn b" style={{ padding: '6px 13px' }}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      <div style={{ padding: '18px 22px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 12, marginBottom: 22 }}>
          {[
            { l: 'Total Users',    v: users.length,                      icon: <Users size={17} />,      c: '#627eea' },
            { l: 'Total Balance',  v: fmt(totalBal),                     icon: <DollarSign size={17} />, c: '#f0b90b' },
            { l: 'Pending',        v: pending.length,                    icon: <Clock size={17} />,      c: '#f6465d' },
            { l: 'Active Traders', v: traders.filter(isApproved).length, icon: <Award size={17} />,      c: '#0ecb81' },
          ].map(s => (
            <div key={s.l} className="sc" style={{ borderTop: `2px solid ${s.c}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9 }}>
                <span style={{ fontSize: 10, color: '#848e9c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' }}>{s.l}</span>
                <div style={{ color: s.c, background: s.c + '18', padding: 7, borderRadius: 8 }}>{s.icon}</div>
              </div>
              <div style={{ fontSize: 21, fontWeight: 800, color: '#eaecef' }}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* Search bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#161a1e', border: '1px solid #2b3139', borderRadius: 10, padding: '8px 14px', marginBottom: 16, maxWidth: 380 }}>
          <Search size={14} style={{ color: '#5e6673', flexShrink: 0 }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={tab === 'requests' ? 'Search requests...' : 'Search users...'}
            style={{ background: 'transparent', border: 'none', outline: 'none', color: '#eaecef', fontSize: 13, width: '100%', fontFamily: 'inherit' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: '#848e9c', cursor: 'pointer', padding: 0 }}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="ns" style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 18 }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); setSearch(''); }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: 'none', borderRadius: 11, fontSize: 12, fontWeight: tab === t.key ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', transition: 'all .15s', background: tab === t.key ? '#f0b90b' : '#161a1e', color: tab === t.key ? '#0b0e11' : '#848e9c', position: 'relative' }}>
              {t.icon} {t.label}
              {t.red && <span style={{ position: 'absolute', top: 5, right: 5, width: 6, height: 6, borderRadius: '50%', background: '#f6465d' }} />}
              {t.badge != null && (
                <span style={{ background: tab === t.key ? 'rgba(0,0,0,.2)' : '#2b3139', color: tab === t.key ? '#0b0e11' : '#eaecef', borderRadius: 20, padding: '1px 6px', fontSize: 10, fontWeight: 700 }}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ══ USERS TAB ══ */}
        {tab === 'users' && (
          <div style={{ background: '#161a1e', borderRadius: 18, border: '1px solid #1e2329', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="t">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Balance</th>
                    <th className="hs">Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#5e6673' }}>No users found</td></tr>
                  )}
                  {filteredUsers.map(u => (
                    <tr key={u._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f0b90b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#0b0e11', flexShrink: 0 }}>
                            {safe(u.name)[0]?.toUpperCase() || 'U'}
                          </div>
                          <span style={{ fontWeight: 600, color: '#eaecef' }}>{safe(u.name) || 'Unknown'}</span>
                        </div>
                      </td>
                      <td style={{ color: '#848e9c', fontSize: 12 }}>{safe(u.email)}</td>
                      <td>
                        <span className="bd" style={{ background: u.role === 'admin' ? 'rgba(240,185,11,.12)' : 'rgba(132,142,156,.1)', color: u.role === 'admin' ? '#f0b90b' : '#848e9c' }}>
                          {safe(u.role)}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#eaecef' }}>
                        {fmt(u.balance)}
                      </td>
                      <td className="hs" style={{ color: '#848e9c', fontSize: 12 }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn b" style={{ padding: '5px 10px' }}
                            onClick={() => { setSelUser(u); setNewBal(String(u.balance || 0)); setBalModal(true); }}
                            title="Edit Balance">
                            <Edit size={13} /> Balance
                          </button>
                          <button className="btn r" style={{ padding: '5px 8px' }}
                            onClick={() => handleDelUser(u._id)} title="Delete">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══ REQUESTS TAB ══ */}
        {tab === 'requests' && (
          <div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
              {['pending', 'approved', 'rejected', 'all'].map(f => (
                <button key={f} onClick={() => setReqFilter(f)}
                  style={{ padding: '5px 13px', border: `1px solid ${reqFilter === f ? '#f0b90b' : '#2b3139'}`, borderRadius: 20, background: reqFilter === f ? 'rgba(240,185,11,.1)' : 'transparent', color: reqFilter === f ? '#f0b90b' : '#848e9c', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', fontWeight: reqFilter === f ? 700 : 500, textTransform: 'capitalize' }}>
                  {f}
                </button>
              ))}
            </div>
            <div style={{ background: '#161a1e', borderRadius: 18, border: '1px solid #1e2329', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table className="t">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th className="hs">Method</th>
                      <th className="hs">TxID</th>
                      <th className="hs">Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReqs.length === 0 && (
                      <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#5e6673' }}>No requests found</td></tr>
                    )}
                    {filteredReqs.map(r => (
                      <tr key={r._id}>
                        <td>
                          <div style={{ fontWeight: 600, color: '#eaecef', fontSize: 13 }}>{safe(r.userId?.name) || 'Unknown'}</div>
                          <div style={{ color: '#5e6673', fontSize: 11 }}>{safe(r.userId?.email)}</div>
                        </td>
                        <td>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600, color: r.type === 'deposit' ? '#0ecb81' : '#f6465d', fontSize: 12 }}>
                            {r.type === 'deposit' ? <ArrowDownLeft size={13} /> : <ArrowUpRight size={13} />}
                            {safe(r.type)}
                          </span>
                        </td>
                        <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#eaecef' }}>{fmt(r.amount)}</td>
                        <td className="hs" style={{ color: '#848e9c', fontSize: 12, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {safe(r.method || r.address) || '-'}
                        </td>
                        <td className="hs" style={{ color: '#848e9c', fontSize: 11 }}>
                          {safe(r.txId || r.transactionId) || '-'}
                        </td>
                        <td className="hs" style={{ color: '#848e9c', fontSize: 12 }}>
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '-'}
                        </td>
                        <td>
                          <span className="bd" style={{ background: r.status === 'approved' || r.status === 'completed' ? 'rgba(14,203,129,.12)' : r.status === 'rejected' ? 'rgba(246,70,93,.12)' : 'rgba(240,185,11,.12)', color: r.status === 'approved' || r.status === 'completed' ? '#0ecb81' : r.status === 'rejected' ? '#f6465d' : '#f0b90b' }}>
                            {safe(r.status) || 'pending'}
                          </span>
                        </td>
                        <td>
                          {r.status === 'pending' && (
                            <div style={{ display: 'flex', gap: 5 }}>
                              <button className="btn g" style={{ padding: '5px 8px' }} onClick={() => handleRequest(r._id, 'approved')}><CheckCircle size={13} /></button>
                              <button className="btn r" style={{ padding: '5px 8px' }} onClick={() => handleRequest(r._id, 'rejected')}><X size={13} /></button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══ TRADERS TAB ══ */}
        {tab === 'traders' && (
          <div>
            {/* Pending */}
            {traders.filter(isPending).length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 12, fontWeight: 700, color: '#f0b90b', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Clock size={13} /> Pending Applications ({traders.filter(isPending).length})
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 12 }}>
                  {traders.filter(isPending).map(t => (
                    <div key={t._id} style={{ background: '#161a1e', border: '1px dashed #2b3139', borderRadius: 13, padding: 15, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#2b3139', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800 }}>
                          {t.image || t.img || t.avatar
                            ? <img src={safe(t.image || t.img || t.avatar)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display='none'} />
                            : safe(t.name)[0]?.toUpperCase() || 'T'}
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, color: '#eaecef', fontSize: 13 }}>{safe(t.name)}</p>
                          <p style={{ color: '#848e9c', fontSize: 11 }}>ROI: {t.profit || 0}%</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button className="btn g" style={{ padding: '5px 9px' }} onClick={() => handleApprove(t._id)}><CheckCircle size={14} /></button>
                        <button className="btn r" style={{ padding: '5px 9px' }} onClick={() => handleDelTrader(t._id)}><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Trader quick form */}
            <div style={{ background: '#161a1e', border: '1px solid #1e2329', borderRadius: 16, padding: 20, marginBottom: 24 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#f0b90b', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 7 }}>
                <UserPlus size={14} /> Add New Trader
              </h3>
              <AddTraderInline onSuccess={() => { showToast('Trader added!'); load(); }} />
            </div>

            {/* Approved traders */}
            <h3 style={{ fontSize: 12, fontWeight: 700, color: '#848e9c', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 12 }}>
              Active Traders ({traders.filter(isApproved).length})
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 13 }}>
              {traders.filter(isApproved).map(t => (
                <div key={t._id} style={{ background: '#161a1e', border: '1px solid #1e2329', borderRadius: 14, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, transition: 'border .2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#2b3139'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#1e2329'}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                    <div style={{ width: 46, height: 46, borderRadius: '50%', background: '#2b3139', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, border: '2px solid #1e2329' }}>
                      {t.image || t.img || t.avatar
                        ? <img src={safe(t.image || t.img || t.avatar)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display='none'} />
                        : safe(t.name)[0]?.toUpperCase() || 'T'}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontWeight: 700, color: '#eaecef', fontSize: 13, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{safe(t.name)}</p>
                      <p style={{ color: '#0ecb81', fontSize: 12, fontWeight: 700 }}>+{t.roi || t.profit || 0}% ROI</p>
                      <p style={{ color: '#848e9c', fontSize: 11 }}>{t.followers || 0} followers</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <button className="btn b" style={{ padding: '6px 9px' }} onClick={() => openEdit(t)}><Edit size={13} /></button>
                    <button className="btn r" style={{ padding: '6px 9px' }} onClick={() => handleDelTrader(t._id)}><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ PLANS TAB ══ */}
        {tab === 'plans' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
              <button className="btn y" onClick={() => { setPlanData({}); setPlanModal(true); }}>
                <UserPlus size={14} /> Add Plan
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 13 }}>
              {plans.map(p => (
                <div key={p._id} style={{ background: '#161a1e', border: '1px solid #1e2329', borderRadius: 14, padding: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <h3 style={{ fontWeight: 700, color: '#eaecef', fontSize: 14 }}>{safe(p.name)}</h3>
                    <button className="btn r" style={{ padding: '4px 7px' }} onClick={() => handleDelPlan(p._id)}><Trash2 size={12} /></button>
                  </div>
                  {[
                    { l: 'Profit',     v: `${p.profitPercent}%`, c: '#0ecb81' },
                    { l: 'Min',        v: fmt(p.minAmount) },
                    { l: 'Max',        v: fmt(p.maxAmount) },
                    { l: 'Duration',   v: `${p.duration || 24}h` },
                  ].map(s => (
                    <div key={s.l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7, fontSize: 13 }}>
                      <span style={{ color: '#848e9c' }}>{s.l}</span>
                      <span style={{ fontWeight: 700, color: s.c || '#eaecef' }}>{s.v}</span>
                    </div>
                  ))}
                </div>
              ))}
              {plans.length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: '#5e6673' }}>
                  <PieChart size={36} style={{ opacity: .15, margin: '0 auto 12px', display: 'block' }} />
                  <p>No plans yet. Add your first plan.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ INVESTMENTS TAB ══ */}
        {tab === 'logs' && (
          <div style={{ background: '#161a1e', borderRadius: 18, border: '1px solid #1e2329', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="t">
                <thead>
                  <tr><th>User</th><th>Plan</th><th>Amount</th><th>Profit</th><th>Status</th><th className="hs">Expires</th></tr>
                </thead>
                <tbody>
                  {investments.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#5e6673' }}>No investments found</td></tr>
                  )}
                  {investments.map((inv, i) => (
                    <tr key={inv._id || i}>
                      <td style={{ fontWeight: 600, color: '#eaecef' }}>{safe(inv.userId?.name) || safe(inv.userId) || 'Unknown'}</td>
                      <td style={{ color: '#848e9c' }}>{safe(inv.planId?.name) || 'Plan'}</td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#eaecef' }}>{fmt(inv.amount)}</td>
                      <td style={{ fontWeight: 700, color: '#0ecb81' }}>{fmt(inv.profit)}</td>
                      <td>
                        <span className="bd" style={{ background: inv.status === 'completed' ? 'rgba(14,203,129,.12)' : 'rgba(240,185,11,.12)', color: inv.status === 'completed' ? '#0ecb81' : '#f0b90b' }}>
                          {safe(inv.status)}
                        </span>
                      </td>
                      <td className="hs" style={{ color: '#848e9c', fontSize: 12 }}>
                        {inv.expireAt ? new Date(inv.expireAt).toLocaleString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ══ BALANCE MODAL ══ */}
      {balModal && (
        <div className="mb" onClick={e => e.target === e.currentTarget && setBalModal(false)}>
          <div className="mx">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#f0b90b' }}>Update Balance</h3>
                <p style={{ fontSize: 12, color: '#848e9c', marginTop: 2 }}>{safe(selUser?.name)} — {safe(selUser?.email)}</p>
              </div>
              <button onClick={() => setBalModal(false)} style={{ background: 'none', border: 'none', color: '#848e9c', cursor: 'pointer' }}><X size={19} /></button>
            </div>
            <p style={{ fontSize: 12, color: '#848e9c', marginBottom: 10 }}>
              Current: <span style={{ color: '#f0b90b', fontWeight: 700 }}>{fmt(selUser?.balance)}</span>
            </p>
            <div style={{ position: 'relative', marginBottom: 20 }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#f0b90b', fontWeight: 700, fontSize: 16 }}>$</span>
              <input className="ai" type="number" value={newBal} onChange={e => setNewBal(e.target.value)}
                placeholder="0.00" style={{ paddingLeft: 32, fontSize: 20, fontWeight: 800, fontFamily: 'monospace' }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn" style={{ flex: 1, background: '#2b3139', color: '#848e9c' }} onClick={() => setBalModal(false)}>Cancel</button>
              <button className="btn y" style={{ flex: 2 }} onClick={handleBalSave}><Save size={14} /> Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ TRADER EDIT MODAL ══ */}
      {editModal && (
        <div className="mb" onClick={e => e.target === e.currentTarget && setEditModal(false)}>
          <div className="mx">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#f0b90b' }}>Edit Trader</h3>
              <button onClick={() => setEditModal(false)} style={{ background: 'none', border: 'none', color: '#848e9c', cursor: 'pointer' }}><X size={19} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, color: '#848e9c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 6, display: 'block' }}>Name *</label>
                <input className="ai" placeholder="Trader name" value={safe(eData.name)}
                  onChange={e => setEData(p => ({ ...p, name: e.target.value }))} />
              </div>
              <ImageUploader
                label="Profile Photo"
                value={safe(eData.avatar || eData.image || eData.img)}
                onChange={url => setEData(p => ({ ...p, image: url, img: url, avatar: url }))}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
                {[
                  { k: 'roi',          l: 'ROI (%)',      p: '45' },
                  { k: 'pnl',          l: 'PNL ($)',      p: '12500' },
                  { k: 'profit',       l: 'Profit (%)',   p: '38' },
                  { k: 'winRate',      l: 'Win Rate (%)', p: '78' },
                  { k: 'aum',          l: 'AUM ($)',      p: '250000' },
                  { k: 'mdd',          l: 'Drawdown (%)', p: '12' },
                  { k: 'days',         l: 'Days Active',  p: '120' },
                  { k: 'followers',    l: 'Followers',    p: '320' },
                  { k: 'maxFollowers', l: 'Max Followers',p: '500' },
                ].map(f => (
                  <div key={f.k}>
                    <label style={{ fontSize: 10, color: '#848e9c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 5, display: 'block' }}>{f.l}</label>
                    <input className="ai" type="number" placeholder={f.p}
                      value={eData[f.k] != null ? String(eData[f.k]) : ''}
                      onChange={e => setEData(p => ({ ...p, [f.k]: e.target.value }))}
                      style={{ padding: '8px 11px', fontSize: 13 }} />
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button className="btn" style={{ flex: 1, background: '#2b3139', color: '#848e9c' }} onClick={() => setEditModal(false)}>Cancel</button>
              <button className="btn y" style={{ flex: 2 }} disabled={savingT || !safe(eData.name).trim()} onClick={handleSaveTrader}>
                {savingT ? <><Loader2 size={13} style={{ animation: 'spin .8s linear infinite' }} /> Saving...</> : <><Save size={13} /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ PLAN MODAL ══ */}
      {planModal && (
        <div className="mb" onClick={e => e.target === e.currentTarget && setPlanModal(false)}>
          <div className="mx">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#f0b90b' }}>Create Plan</h3>
              <button onClick={() => setPlanModal(false)} style={{ background: 'none', border: 'none', color: '#848e9c', cursor: 'pointer' }}><X size={19} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              {[
                { k: 'name',          l: 'Plan Name',    p: 'Starter Plan',  t: 'text' },
                { k: 'minAmount',     l: 'Min Amount ($)',p: '100',           t: 'number' },
                { k: 'maxAmount',     l: 'Max Amount ($)',p: '5000',          t: 'number' },
                { k: 'profitPercent', l: 'Profit (%)',   p: '10',            t: 'number' },
                { k: 'duration',      l: 'Duration (hrs)',p: '24',            t: 'number' },
              ].map(f => (
                <div key={f.k}>
                  <label style={{ fontSize: 11, color: '#848e9c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 6, display: 'block' }}>{f.l}</label>
                  <input className="ai" type={f.t} placeholder={f.p}
                    value={safe(planData[f.k])}
                    onChange={e => setPlanData(p => ({ ...p, [f.k]: e.target.value }))} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button className="btn" style={{ flex: 1, background: '#2b3139', color: '#848e9c' }} onClick={() => setPlanModal(false)}>Cancel</button>
              <button className="btn y" style={{ flex: 2 }} disabled={savingP} onClick={handleSavePlan}>
                {savingP ? <><Loader2 size={13} style={{ animation: 'spin .8s linear infinite' }} /> Creating...</> : <><Save size={13} /> Create Plan</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Inline Add Trader Form ─── */
function AddTraderInline({ onSuccess }) {
  const [form, setForm]     = useState({ name: '', roi: '', pnl: '', aum: '', winRate: '', followers: '', days: '', image: '' });
  const [saving, setSaving] = useState(false);
  const [imgUrl, setImgUrl] = useState('');
  const inputRef = useRef();

  const toBase64 = (file) => new Promise((res, rej) => {
    const r = new FileReader(); r.onload = e => res(e.target.result); r.onerror = rej; r.readAsDataURL(file);
  });

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    try {
      const fd = new FormData(); fd.append('image', file); fd.append('key', '2e46a4d0c87a36e4bfc0a7de8bdd4e34');
      const res = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data?.data?.url) { setImgUrl(data.data.url); setForm(p => ({ ...p, image: data.data.url })); return; }
    } catch (_) {}
    const b64 = await toBase64(file).catch(() => '');
    if (b64) { setImgUrl(b64); setForm(p => ({ ...p, image: b64 })); }
  };

  const handleSubmit = async () => {
    if (!safe(form.name).trim()) return alert('Name required');
    setSaving(true);
    try {
      await API.post('/api/admin/create-trader', {
        name: form.name, image: imgUrl || form.image, img: imgUrl || form.image, avatar: imgUrl || form.image,
        roi: Number(form.roi) || 0, pnl: Number(form.pnl) || 0, aum: Number(form.aum) || 0,
        winRate: Number(form.winRate) || 0, followers: Number(form.followers) || 0,
        days: Number(form.days) || 0, status: 'approved',
      });
      setForm({ name: '', roi: '', pnl: '', aum: '', winRate: '', followers: '', days: '', image: '' });
      setImgUrl('');
      onSuccess();
    } catch (e) { alert(safe(e?.response?.data?.message) || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />

      {/* Image picker */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#2b3139', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px dashed #3a3f47' }}
          onClick={() => inputRef.current?.click()}>
          {imgUrl
            ? <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display='none'} />
            : <Upload size={18} style={{ color: '#f0b90b' }} />}
        </div>
        <div style={{ flex: 1 }}>
          <input style={{ width: '100%', background: '#0b0e11', border: '1px solid #2b3139', borderRadius: 8, padding: '7px 11px', color: '#eaecef', fontSize: 12, outline: 'none', fontFamily: 'inherit' }}
            placeholder="Or paste image URL"
            value={imgUrl && !imgUrl.startsWith('data:') ? imgUrl : ''}
            onChange={e => { setImgUrl(e.target.value); setForm(p => ({ ...p, image: e.target.value })); }}
            onFocus={e => e.target.style.borderColor = '#f0b90b'}
            onBlur={e => e.target.style.borderColor = '#2b3139'} />
          <p style={{ fontSize: 10, color: '#5e6673', marginTop: 4 }}>Click avatar to upload from gallery</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 10, marginBottom: 14 }}>
        {[
          { k: 'name',      l: 'Trader Name *', p: 'CryptoMaster',  t: 'text'   },
          { k: 'roi',       l: 'ROI (%)',        p: '45',            t: 'number' },
          { k: 'pnl',       l: 'PNL ($)',        p: '12500',         t: 'number' },
          { k: 'aum',       l: 'AUM ($)',        p: '250000',        t: 'number' },
          { k: 'winRate',   l: 'Win Rate (%)',   p: '78',            t: 'number' },
          { k: 'followers', l: 'Followers',      p: '320',           t: 'number' },
          { k: 'days',      l: 'Days Active',    p: '120',           t: 'number' },
        ].map(f => (
          <div key={f.k}>
            <label style={{ fontSize: 10, color: '#848e9c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 5, display: 'block' }}>{f.l}</label>
            <input style={{ width: '100%', background: '#0b0e11', border: '1px solid #2b3139', borderRadius: 8, padding: '8px 11px', color: '#eaecef', fontSize: 13, outline: 'none', fontFamily: 'inherit', transition: 'border .15s' }}
              type={f.t} placeholder={f.p}
              value={safe(form[f.k])}
              onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))}
              onFocus={e => e.target.style.borderColor = '#f0b90b'}
              onBlur={e => e.target.style.borderColor = '#2b3139'} />
          </div>
        ))}
      </div>

      <button onClick={handleSubmit} disabled={saving || !safe(form.name).trim()}
        style={{ padding: '10px 28px', background: saving || !safe(form.name).trim() ? '#2b3139' : '#f0b90b', border: 'none', borderRadius: 10, color: saving || !safe(form.name).trim() ? '#5e6673' : '#0b0e11', fontWeight: 700, fontSize: 13, cursor: saving || !safe(form.name).trim() ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 7 }}>
        {saving ? <><Loader2 size={14} style={{ animation: 'spin .8s linear infinite' }} /> Adding...</> : <><UserPlus size={14} /> Add Trader</>}
      </button>
    </div>
  );
}
export default AdminPanel;
