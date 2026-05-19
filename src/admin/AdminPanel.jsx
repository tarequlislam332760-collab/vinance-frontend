import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import API from '../api';
import { UserContext } from '../context/UserContext';
import {
  ShieldCheck, Users, Clock, PieChart, List,
  UserPlus, Trash2, TrendingUp, CheckCircle, Edit, X,
  Upload, Loader2, RefreshCw, DollarSign, AlertCircle,
  ArrowUpRight, ArrowDownLeft, Save, Award
} from 'lucide-react';

import ManageUsers     from './ManageUsers';
import PendingRequests from './PendingRequests';
import ManagePlans     from './ManagePlans';
import InvestmentLogs  from './InvestmentLogs';
import AddTrader       from './AddTrader';

/* ════════════════════════════════════════════════════════
   IMAGE UPLOAD — imgbb (free, no signup needed for demo)
   Replace IMGBB_KEY with your own from imgbb.com/api
════════════════════════════════════════════════════════ */
const IMGBB_KEY = "a1a1f5b3a4b9d8c7e6f5g4h3"; // placeholder — replace with real key

const uploadToImgbb = async (file) => {
  const fd = new FormData();
  fd.append('image', file);
  fd.append('key', IMGBB_KEY);
  try {
    const res = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: fd });
    const data = await res.json();
    return data?.data?.url || '';
  } catch {
    return '';
  }
};

/* ─── Image Uploader Component ─── */
const ImageUploader = ({ value, onChange, label = 'Profile Image' }) => {
  const [uploading, setUploading] = useState(false);
  const [drag,      setDrag]      = useState(false);
  const [error,     setError]     = useState('');
  const inputRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, GIF)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB');
      return;
    }
    setError('');
    setUploading(true);
    try {
      /* Try imgbb first */
      let url = await uploadToImgbb(file);
      /* Fallback: base64 preview (works offline too) */
      if (!url) {
        url = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = e => resolve(e.target.result);
          reader.readAsDataURL(file);
        });
      }
      onChange(url);
    } catch (e) {
      setError('Upload failed. Paste URL manually below.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 700, color: '#848e9c', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8, display: 'block' }}>
        {label}
      </label>

      {/* Drop zone */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
        style={{
          border: `2px dashed ${drag ? '#f0b90b' : error ? '#f6465d' : '#2b3139'}`,
          borderRadius: 12,
          overflow: 'hidden',
          position: 'relative',
          minHeight: value ? 140 : 100,
          cursor: uploading ? 'wait' : 'pointer',
          background: drag ? 'rgba(240,185,11,.04)' : '#0b0e11',
          transition: 'all .2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={e => handleFile(e.target.files[0])}
        />

        {uploading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: 24 }}>
            <Loader2 size={28} style={{ color: '#f0b90b', animation: 'spin .8s linear infinite' }} />
            <span style={{ fontSize: 12, color: '#848e9c' }}>Uploading image...</span>
          </div>
        ) : value ? (
          <>
            <img
              src={value}
              alt="preview"
              style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }}
              onError={e => { e.target.style.display = 'none'; }}
            />
            <button
              onClick={e => { e.stopPropagation(); onChange(''); setError(''); }}
              style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,.8)', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}
            >
              <X size={14} />
            </button>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,.65)', padding: '6px 12px', fontSize: 11, color: '#848e9c', textAlign: 'center' }}>
              Click to replace image
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 24 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#1e2329', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Upload size={20} style={{ color: '#f0b90b' }} />
            </div>
            <span style={{ fontSize: 13, color: '#eaecef', fontWeight: 600 }}>
              Click or drag to upload
            </span>
            <span style={{ fontSize: 11, color: '#5e6673' }}>PNG, JPG, GIF — max 10MB</span>
          </div>
        )}
      </div>

      {error && (
        <p style={{ fontSize: 11, color: '#f6465d', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
          <AlertCircle size={12} /> {error}
        </p>
      )}

      {/* URL paste input */}
      <div style={{ marginTop: 8, position: 'relative' }}>
        <input
          type="text"
          placeholder="Or paste image URL directly"
          value={value && !value.startsWith('data:') ? value : ''}
          onChange={e => { onChange(e.target.value); setError(''); }}
          style={{ width: '100%', background: '#0b0e11', border: '1px solid #2b3139', borderRadius: 8, padding: '8px 12px', color: '#eaecef', fontSize: 12, outline: 'none', fontFamily: 'inherit', transition: 'border .15s' }}
          onFocus={e => e.target.style.borderColor = '#f0b90b'}
          onBlur={e => e.target.style.borderColor = '#2b3139'}
        />
      </div>

      {/* Preview if URL */}
      {value && value.startsWith('http') && !uploading && (
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'rgba(14,203,129,.06)', border: '1px solid rgba(14,203,129,.15)', borderRadius: 8 }}>
          <img src={value} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} onError={e => e.target.style.display='none'} />
          <span style={{ fontSize: 11, color: '#0ecb81', fontWeight: 600 }}>Image URL set</span>
          <CheckCircle size={13} style={{ color: '#0ecb81', marginLeft: 'auto' }} />
        </div>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════════════
   MAIN ADMIN PANEL
════════════════════════════════════════════════════════ */
const AdminPanel = () => {
  const { token } = useContext(UserContext);

  const [activeTab,  setActiveTab]  = useState('users');
  const [users,       setUsers]       = useState([]);
  const [requests,    setRequests]    = useState([]);
  const [investments, setInvestments] = useState([]);
  const [traders,     setTraders]     = useState([]);
  const [loading,     setLoading]     = useState(true);

  const [isModalOpen,  setIsModalOpen]  = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newBalance,   setNewBalance]   = useState('');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTrader,  setSelectedTrader]  = useState(null);
  const [editData,        setEditData]        = useState({});
  const [savingTrader,    setSavingTrader]    = useState(false);

  const [alert, setAlert] = useState(null);
  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3500);
  };

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await API.get('/api/admin/all-data');
      setUsers(res.data.users || []);
      setRequests(res.data.requests || []);
      setTraders(res.data.traders || []);
      setInvestments(res.data.investments || res.data.requests || []);
    } catch {
      showAlert('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const isPending  = t => !t.status || t.status === 'pending' || t.status === false || t.status === 'false';
  const isApproved = t => t.status === true || t.status === 'true' || t.status === 'approved';

  const handleApprove = async (id) => {
    try {
      await API.put(`/api/admin/edit-trader/${id}`, { status: 'approved' });
      showAlert('Trader approved!');
      fetchData();
    } catch { showAlert('Failed', 'error'); }
  };

  const handleDeleteTrader = async (id) => {
    if (!window.confirm('Delete this trader permanently?')) return;
    try {
      await API.delete(`/api/admin/delete-trader/${id}`);
      showAlert('Trader deleted');
      fetchData();
    } catch { showAlert('Failed', 'error'); }
  };

  const openEdit = (trader) => {
    setSelectedTrader(trader);
    const img = trader.image || trader.img || trader.avatar || '';
    setEditData({
      name: trader.name || '', profit: trader.profit || '', winRate: trader.winRate || '',
      aum: trader.aum || '', mdd: trader.mdd || '', roi: trader.roi || '',
      pnl: trader.pnl || '', days: trader.days || '', followers: trader.followers || '',
      maxFollowers: trader.maxFollowers || 500,
      image: img, img, avatar: img,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveTrader = async () => {
    if (!editData.name?.trim()) return showAlert('Name is required', 'error');
    setSavingTrader(true);
    try {
      const imgUrl = editData.image || editData.img || editData.avatar || '';
      const payload = {
        ...editData,
        image: imgUrl, img: imgUrl, avatar: imgUrl,
        profit:       Number(editData.profit)       || 0,
        winRate:      Number(editData.winRate)      || 0,
        aum:          Number(editData.aum)          || 0,
        mdd:          Number(editData.mdd)          || 0,
        roi:          Number(editData.roi)          || 0,
        pnl:          Number(editData.pnl)          || 0,
        days:         Number(editData.days)         || 0,
        followers:    Number(editData.followers)    || 0,
        maxFollowers: Number(editData.maxFollowers) || 500,
      };
      await API.put(`/api/admin/edit-trader/${selectedTrader._id}`, payload);
      showAlert('Trader updated!');
      setIsEditModalOpen(false);
      fetchData();
    } catch { showAlert('Update failed', 'error'); }
    finally { setSavingTrader(false); }
  };

  const handleBalanceUpdate = async () => {
    const bal = parseFloat(newBalance);
    if (isNaN(bal) || bal < 0) return showAlert('Invalid balance', 'error');
    try {
      await API.post('/api/admin/update-balance', { userId: selectedUser._id, balance: bal });
      showAlert('Balance updated!');
      setIsModalOpen(false);
      fetchData();
    } catch { showAlert('Failed', 'error'); }
  };

  const pending  = requests.filter(r => r.status === 'pending');
  const totalBal = users.reduce((s, u) => s + (u.balance || 0), 0);
  const fmt = n => `$${(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  const TABS = [
    { key: 'users',    label: 'Users',    icon: <Users size={14} />,    badge: users.length },
    { key: 'requests', label: 'Requests', icon: <Clock size={14} />,    badge: pending.length, red: pending.length > 0 },
    { key: 'plans',    label: 'Plans',    icon: <PieChart size={14} />, badge: null },
    { key: 'logs',     label: 'Logs',     icon: <List size={14} />,     badge: null },
    { key: 'traders',  label: 'Traders',  icon: <UserPlus size={14} />, badge: traders.filter(isApproved).length },
  ];

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0b0e11', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <Loader2 size={36} style={{ color: '#f0b90b', animation: 'spin .8s linear infinite' }} />
      <span style={{ color: '#f0b90b', fontWeight: 800, fontSize: 13, letterSpacing: 4, textTransform: 'uppercase' }}>
        Loading Admin Panel...
      </span>
    </div>
  );

  return (
    <div style={{ background: '#0b0e11', minHeight: '100vh', color: '#eaecef', fontFamily: "'Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-thumb{background:#2b3139;border-radius:4px}
        .noscroll{scrollbar-width:none}.noscroll::-webkit-scrollbar{display:none}
        .ai{background:#0b0e11;border:1px solid #2b3139;border-radius:10px;padding:10px 14px;color:#eaecef;font-size:13px;outline:none;font-family:inherit;width:100%;transition:border .15s;}
        .ai:focus{border-color:#f0b90b;}
        .ab{padding:8px 16px;border:none;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;gap:6px;transition:all .15s;white-space:nowrap;}
        .ab-g{background:rgba(14,203,129,.1);color:#0ecb81;border:1px solid rgba(14,203,129,.25);}
        .ab-g:hover{background:#0ecb81;color:#0b0e11;}
        .ab-r{background:rgba(246,70,93,.1);color:#f6465d;border:1px solid rgba(246,70,93,.25);}
        .ab-r:hover{background:#f6465d;color:#fff;}
        .ab-b{background:rgba(99,126,234,.1);color:#627eea;border:1px solid rgba(99,126,234,.25);}
        .ab-b:hover{background:#627eea;color:#fff;}
        .ab-y{background:#f0b90b;color:#0b0e11;}
        .ab-y:hover{background:#d4a30a;}
        .at{width:100%;border-collapse:collapse;}
        .at th{padding:10px 16px;color:#848e9c;font-size:11px;font-weight:700;text-align:left;border-bottom:1px solid #1e2329;text-transform:uppercase;letter-spacing:.05em;white-space:nowrap;}
        .at td{padding:12px 16px;border-bottom:1px solid #1e232940;font-size:13px;vertical-align:middle;}
        .at tr:hover td{background:rgba(255,255,255,.02);}
        .at tr:last-child td{border-bottom:none;}
        .bdg{display:inline-flex;align-items:center;padding:2px 9px;border-radius:20px;font-size:11px;font-weight:700;}
        .b-p{background:rgba(240,185,11,.12);color:#f0b90b;}
        .b-a{background:rgba(14,203,129,.12);color:#0ecb81;}
        .b-r{background:rgba(246,70,93,.12);color:#f6465d;}
        .b-u{background:rgba(132,142,156,.1);color:#848e9c;}
        .b-ad{background:rgba(240,185,11,.12);color:#f0b90b;}
        .mbg{position:fixed;inset:0;background:rgba(0,0,0,.88);backdrop-filter:blur(8px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto;}
        .mbox{background:#161a1e;border:1px solid #2b3139;border-radius:24px;padding:28px;width:100%;max-width:520px;max-height:92vh;overflow-y:auto;animation:fadeIn .25s;}
        @media(max-width:640px){
          .at th,.at td{padding:8px 10px;font-size:12px;}
          .hsm{display:none!important;}
          .mbox{padding:18px;}
        }
      `}</style>

      {/* Alert toast */}
      {alert && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 99999, background: alert.type === 'error' ? '#f6465d' : '#0ecb81', color: '#fff', padding: '12px 20px', borderRadius: 14, fontWeight: 700, fontSize: 13, animation: 'fadeIn .3s', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 32px rgba(0,0,0,.5)', maxWidth: 340 }}>
          {alert.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          {alert.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ background: '#0f1318', borderBottom: '1px solid #1e2329', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(240,185,11,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={20} style={{ color: '#f0b90b' }} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#f0b90b', letterSpacing: 1 }}>VINANCE ADMIN</div>
            <div style={{ fontSize: 11, color: '#5e6673' }}>Command Center</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {pending.length > 0 && (
            <div style={{ background: 'rgba(246,70,93,.1)', border: '1px solid rgba(246,70,93,.2)', borderRadius: 20, padding: '5px 12px', fontSize: 12, color: '#f6465d', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
              <AlertCircle size={13} /> {pending.length} Pending
            </div>
          )}
          <button onClick={fetchData} className="ab ab-b" style={{ padding: '7px 14px' }}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      <div style={{ padding: '20px 24px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: 14, marginBottom: 24 }}>
          {[
            { l: 'Total Users',    v: users.length,                      icon: <Users size={18} />,      color: '#627eea' },
            { l: 'Total Balance',  v: fmt(totalBal),                     icon: <DollarSign size={18} />, color: '#f0b90b' },
            { l: 'Pending',        v: pending.length,                    icon: <Clock size={18} />,      color: '#f6465d' },
            { l: 'Active Traders', v: traders.filter(isApproved).length, icon: <Award size={18} />,      color: '#0ecb81' },
          ].map(s => (
            <div key={s.l} style={{ background: 'linear-gradient(135deg,#161a1e,#1a2028)', border: '1px solid #1e2329', borderRadius: 16, padding: '18px 20px', borderTop: `2px solid ${s.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 11, color: '#848e9c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' }}>{s.l}</span>
                <div style={{ color: s.color, background: s.color + '18', padding: 8, borderRadius: 8 }}>{s.icon}</div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#eaecef' }}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="noscroll" style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 20 }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: activeTab === t.key ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', transition: 'all .15s', background: activeTab === t.key ? '#f0b90b' : '#161a1e', color: activeTab === t.key ? '#0b0e11' : '#848e9c', position: 'relative' }}>
              {t.icon} {t.label}
              {t.red && <span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: '50%', background: '#f6465d' }} />}
              {t.badge !== null && (
                <span style={{ background: activeTab === t.key ? 'rgba(0,0,0,.2)' : '#2b3139', color: activeTab === t.key ? '#0b0e11' : '#eaecef', borderRadius: 20, padding: '1px 7px', fontSize: 10, fontWeight: 700 }}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ background: '#161a1e', borderRadius: 20, border: '1px solid #1e2329', overflow: 'hidden', minHeight: 400 }}>

          {activeTab === 'users' && (
            <ManageUsers
              users={users}
              fetchData={fetchData}
              onEdit={(u) => { setSelectedUser(u); setNewBalance(u.balance); setIsModalOpen(true); }}
            />
          )}

          {activeTab === 'requests' && <PendingRequests requests={requests} fetchData={fetchData} />}
          {activeTab === 'plans'    && <ManagePlans fetchData={fetchData} />}
          {activeTab === 'logs'     && <InvestmentLogs data={investments} />}

          {activeTab === 'traders' && (
            <div style={{ padding: 24 }}>

              {/* Pending applications */}
              {traders.filter(isPending).length > 0 && (
                <div style={{ marginBottom: 28 }}>
                  <h3 style={{ fontSize: 12, fontWeight: 700, color: '#f0b90b', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Clock size={14} /> Pending Applications ({traders.filter(isPending).length})
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: 12 }}>
                    {traders.filter(isPending).map(t => (
                      <div key={t._id} style={{ background: '#0b0e11', border: '1px dashed #2b3139', borderRadius: 14, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                          <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#2b3139', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800 }}>
                            {t.image || t.img || t.avatar
                              ? <img src={t.image || t.img || t.avatar} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : (t.name?.[0] || 'T')}
                          </div>
                          <div>
                            <p style={{ fontWeight: 700, color: '#eaecef', fontSize: 13 }}>{t.name}</p>
                            <p style={{ color: '#848e9c', fontSize: 11 }}>ROI: {t.profit || 0}% · AUM: ${t.aum || 0}</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="ab ab-g" style={{ padding: '6px 10px' }} onClick={() => handleApprove(t._id)}><CheckCircle size={14} /></button>
                          <button className="ab ab-r" style={{ padding: '6px 10px' }} onClick={() => handleDeleteTrader(t._id)}><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Trader */}
              <div style={{ marginBottom: 28 }}>
                <AddTrader fetchData={fetchData} />
              </div>

              {/* Approved Traders */}
              <div>
                <h3 style={{ fontSize: 12, fontWeight: 700, color: '#848e9c', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 14 }}>
                  Active Traders ({traders.filter(isApproved).length})
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(270px,1fr))', gap: 14 }}>
                  {traders.filter(isApproved).map(t => (
                    <div key={t._id} style={{ background: '#0b0e11', border: '1px solid #1e2329', borderRadius: 14, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, transition: 'border .2s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = '#2b3139'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = '#1e2329'}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#2b3139', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 800, border: '2px solid #1e2329' }}>
                          {t.image || t.img || t.avatar
                            ? <img src={t.image || t.img || t.avatar} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display='none'} />
                            : (t.name?.[0] || 'T')}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontWeight: 700, color: '#eaecef', fontSize: 14, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</p>
                          <p style={{ color: '#0ecb81', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <TrendingUp size={11} /> +{t.roi || t.profit || 0}% ROI
                          </p>
                          <p style={{ color: '#848e9c', fontSize: 11 }}>
                            {t.followers || 0} followers
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="ab ab-b" style={{ padding: '7px 10px' }} onClick={() => openEdit(t)} title="Edit"><Edit size={14} /></button>
                        <button className="ab ab-r" style={{ padding: '7px 10px' }} onClick={() => handleDeleteTrader(t._id)} title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                  {traders.filter(isApproved).length === 0 && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 48, color: '#5e6673' }}>
                      <Award size={40} style={{ opacity: .15, margin: '0 auto 12px', display: 'block' }} />
                      <p>No approved traders yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Balance Modal ── */}
      {isModalOpen && (
        <div className="mbg" onClick={e => e.target === e.currentTarget && setIsModalOpen(false)}>
          <div className="mbox">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#f0b90b' }}>Update Balance</h3>
                <p style={{ fontSize: 12, color: '#848e9c', marginTop: 2 }}>
                  {selectedUser?.name} — {selectedUser?.email}
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#848e9c', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ marginBottom: 8 }}>
              <p style={{ fontSize: 12, color: '#848e9c', marginBottom: 8 }}>
                Current: <span style={{ color: '#f0b90b', fontWeight: 700 }}>${(selectedUser?.balance || 0).toFixed(2)}</span>
              </p>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#f0b90b', fontWeight: 700, fontSize: 16 }}>$</span>
                <input className="ai" type="number" value={newBalance} onChange={e => setNewBalance(e.target.value)}
                  placeholder="0.00" style={{ paddingLeft: 32, fontSize: 20, fontWeight: 800, fontFamily: 'monospace' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="ab" style={{ flex: 1, background: '#2b3139', color: '#848e9c' }} onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="ab ab-y" style={{ flex: 2 }} onClick={handleBalanceUpdate}>
                <Save size={14} /> Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Trader Edit Modal ── */}
      {isEditModalOpen && (
        <div className="mbg" onClick={e => e.target === e.currentTarget && setIsEditModalOpen(false)}>
          <div className="mbox">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#f0b90b' }}>Edit Trader</h3>
              <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'none', border: 'none', color: '#848e9c', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, color: '#848e9c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 6, display: 'block' }}>
                  Trader Name *
                </label>
                <input className="ai" placeholder="e.g. CryptoMaster Pro" value={editData.name || ''}
                  onChange={e => setEditData(p => ({ ...p, name: e.target.value }))} />
              </div>

              {/* Image uploader */}
              <ImageUploader
                label="Profile Photo (Upload or Paste URL)"
                value={editData.avatar || editData.image || editData.img || ''}
                onChange={url => setEditData(p => ({ ...p, image: url, img: url, avatar: url }))}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { k: 'roi',          l: 'ROI (%)',         p: '45.5' },
                  { k: 'pnl',          l: 'PNL ($)',         p: '12500' },
                  { k: 'profit',       l: 'Profit (%)',      p: '38' },
                  { k: 'winRate',      l: 'Win Rate (%)',    p: '78' },
                  { k: 'aum',          l: 'AUM ($)',         p: '250000' },
                  { k: 'mdd',          l: 'Max Drawdown(%)', p: '12' },
                  { k: 'days',         l: 'Days Active',     p: '120' },
                  { k: 'followers',    l: 'Followers',       p: '320' },
                  { k: 'maxFollowers', l: 'Max Followers',   p: '500' },
                ].map(f => (
                  <div key={f.k}>
                    <label style={{ fontSize: 10, color: '#848e9c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 5, display: 'block' }}>
                      {f.l}
                    </label>
                    <input className="ai" type="number" placeholder={f.p}
                      value={editData[f.k] || ''}
                      onChange={e => setEditData(p => ({ ...p, [f.k]: e.target.value }))}
                      style={{ padding: '9px 12px', fontSize: 13 }} />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button className="ab" style={{ flex: 1, background: '#2b3139', color: '#848e9c' }} onClick={() => setIsEditModalOpen(false)}>Cancel</button>
              <button className="ab ab-y" style={{ flex: 2 }} disabled={savingTrader || !editData.name?.trim()} onClick={handleSaveTrader}>
                {savingTrader
                  ? <><Loader2 size={14} style={{ animation: 'spin .8s linear infinite' }} /> Saving...</>
                  : <><Save size={14} /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
