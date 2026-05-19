import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import API from '../api';
import { UserContext } from '../context/UserContext';
import {
  ShieldCheck, Users, Clock, PieChart, List,
  UserPlus, Trash2, TrendingUp, CheckCircle, Edit, X,
  Upload, Image as ImageIcon, Loader2, RefreshCw,
  DollarSign, BarChart3, Activity, AlertCircle,
  ArrowUpRight, ArrowDownLeft, Save, Eye, Plus,
  Award, Settings
} from 'lucide-react';

import ManageUsers from './ManageUsers';
import PendingRequests from './PendingRequests';
import ManagePlans from './ManagePlans';
import InvestmentLogs from './InvestmentLogs';
import AddTrader from './AddTrader';

/* ── Cloudinary config ── */
const CLOUDINARY_URL  = "https://api.cloudinary.com/v1_1/demo/image/upload";
const CLOUDINARY_PRESET = "ml_default";

/* ── Upload image to Cloudinary ── */
const uploadImage = async (file) => {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', CLOUDINARY_PRESET);
  fd.append('folder', 'vinance/traders');
  const res = await fetch(CLOUDINARY_URL, { method: 'POST', body: fd });
  const data = await res.json();
  return data.secure_url || '';
};

/* ── Image Uploader Component ── */
const ImageUploader = ({ value, onChange, label = 'Profile Image' }) => {
  const [uploading, setUploading] = useState(false);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef();

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange(url || URL.createObjectURL(file));
    } catch {
      // fallback to local preview
      onChange(URL.createObjectURL(file));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label style={{ fontSize: 10, fontWeight: 700, color: '#848e9c', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8, display: 'block' }}>
        {label}
      </label>

      {/* Drop zone */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
        style={{
          border: `2px dashed ${drag ? '#f0b90b' : '#2b3139'}`,
          borderRadius: 12,
          padding: value ? 0 : 24,
          textAlign: 'center',
          cursor: uploading ? 'wait' : 'pointer',
          background: drag ? 'rgba(240,185,11,.04)' : '#0b0e11',
          transition: 'all .2s',
          overflow: 'hidden',
          position: 'relative',
          minHeight: value ? 120 : 'auto',
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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 24 }}>
            <Loader2 size={28} style={{ color: '#f0b90b', animation: 'spin .8s linear infinite' }} />
            <span style={{ fontSize: 12, color: '#848e9c' }}>Uploading to Cloudinary...</span>
          </div>
        ) : value ? (
          <>
            <img
              src={value}
              alt="preview"
              style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }}
            />
            <button
              onClick={e => { e.stopPropagation(); onChange(''); }}
              style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,.75)', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={14} />
            </button>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,.6)', padding: '6px 10px', fontSize: 11, color: '#848e9c', textAlign: 'center' }}>
              Click to change image
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#1e2329', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Upload size={20} style={{ color: '#f0b90b' }} />
            </div>
            <span style={{ fontSize: 13, color: '#eaecef', fontWeight: 600 }}>Click or drag image here</span>
            <span style={{ fontSize: 11, color: '#5e6673' }}>PNG, JPG, GIF up to 10MB</span>
          </div>
        )}
      </div>

      {/* URL input fallback */}
      <input
        type="text"
        placeholder="Or paste image URL"
        value={value && !value.startsWith('blob:') ? value : ''}
        onChange={e => onChange(e.target.value)}
        style={{ marginTop: 8, width: '100%', background: '#0b0e11', border: '1px solid #2b3139', borderRadius: 8, padding: '8px 12px', color: '#eaecef', fontSize: 12, outline: 'none', fontFamily: 'inherit' }}
        onFocus={e => e.target.style.borderColor = '#f0b90b'}
        onBlur={e => e.target.style.borderColor = '#2b3139'}
      />
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   MAIN ADMIN PANEL
══════════════════════════════════════════════════════════════ */
const AdminPanel = () => {
  const { token } = useContext(UserContext);

  const [activeTab, setActiveTab] = useState('users');
  const [users,       setUsers]       = useState([]);
  const [requests,    setRequests]    = useState([]);
  const [investments, setInvestments] = useState([]);
  const [traders,     setTraders]     = useState([]);
  const [loading,     setLoading]     = useState(true);

  /* User balance modal */
  const [isModalOpen,   setIsModalOpen]   = useState(false);
  const [selectedUser,  setSelectedUser]  = useState(null);
  const [newBalance,    setNewBalance]    = useState('');

  /* Trader edit modal */
  const [isEditModalOpen,  setIsEditModalOpen]  = useState(false);
  const [selectedTrader,   setSelectedTrader]   = useState(null);
  const [editTraderData,   setEditTraderData]   = useState({
    name: '', profit: '', winRate: '', aum: '', mdd: '',
    roi: '', pnl: '', days: '', followers: '', maxFollowers: '',
    image: '', img: '', avatar: '',
  });
  const [savingTrader, setSavingTrader] = useState(false);

  /* Alert */
  const [alert, setAlert] = useState(null);
  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3000);
  };

  /* ── Fetch all data ── */
  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await API.get('/api/admin/all-data');
      setUsers(res.data.users || []);
      setRequests(res.data.requests || []);
      setTraders(res.data.traders || []);
      setInvestments(
        res.data.investments || res.data.logs || res.data.requests || []
      );
    } catch (err) {
      console.error('Admin fetch error:', err);
      showAlert('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── Trader helpers ── */
  const isPending  = t => !t.status || t.status === 'pending' || t.status === false || t.status === 'false';
  const isApproved = t => t.status === true || t.status === 'true' || t.status === 'approved';

  const handleApproveTrader = async (id) => {
    try {
      await API.put(`/api/admin/edit-trader/${id}`, { status: 'approved' });
      showAlert('Trader approved!');
      fetchData();
    } catch { showAlert('Approval failed', 'error'); }
  };

  const handleDeleteTrader = async (id) => {
    if (!window.confirm('Delete this trader permanently?')) return;
    try {
      await API.delete(`/api/admin/delete-trader/${id}`);
      showAlert('Trader deleted');
      fetchData();
    } catch { showAlert('Delete failed', 'error'); }
  };

  const openEditModal = (trader) => {
    setSelectedTrader(trader);
    setEditTraderData({
      name:         trader.name         || '',
      profit:       trader.profit       || '',
      winRate:      trader.winRate      || '',
      aum:          trader.aum          || '',
      mdd:          trader.mdd          || '',
      roi:          trader.roi          || '',
      pnl:          trader.pnl          || '',
      days:         trader.days         || '',
      followers:    trader.followers    || '',
      maxFollowers: trader.maxFollowers || '',
      image:        trader.image || trader.img || trader.avatar || '',
      img:          trader.image || trader.img || trader.avatar || '',
      avatar:       trader.image || trader.img || trader.avatar || '',
    });
    setIsEditModalOpen(true);
  };

  const handleEditTraderSubmit = async () => {
    if (!editTraderData.name) return showAlert('Name is required', 'error');
    setSavingTrader(true);
    try {
      const imgUrl = editTraderData.image || editTraderData.img || editTraderData.avatar || '';
      await API.put(`/api/admin/edit-trader/${selectedTrader._id}`, {
        ...editTraderData,
        image:  imgUrl, img: imgUrl, avatar: imgUrl,
        profit:       Number(editTraderData.profit)       || 0,
        winRate:      Number(editTraderData.winRate)      || 0,
        aum:          Number(editTraderData.aum)          || 0,
        mdd:          Number(editTraderData.mdd)          || 0,
        roi:          Number(editTraderData.roi)          || 0,
        pnl:          Number(editTraderData.pnl)          || 0,
        days:         Number(editTraderData.days)         || 0,
        followers:    Number(editTraderData.followers)    || 0,
        maxFollowers: Number(editTraderData.maxFollowers) || 500,
      });
      showAlert('Trader updated!');
      setIsEditModalOpen(false);
      fetchData();
    } catch { showAlert('Update failed', 'error'); }
    finally { setSavingTrader(false); }
  };

  /* ── User balance ── */
  const handleBalanceUpdate = async () => {
    if (!newBalance || newBalance < 0) return showAlert('Invalid balance', 'error');
    try {
      await API.post('/api/admin/update-balance', {
        userId: selectedUser._id,
        balance: Number(newBalance),
      });
      showAlert('Balance updated!');
      setIsModalOpen(false);
      fetchData();
    } catch { showAlert('Balance update failed', 'error'); }
  };

  /* ── Stats ── */
  const pending    = requests.filter(r => r.status === 'pending');
  const totalBal   = users.reduce((s, u) => s + (u.balance || 0), 0);
  const fmtAmt = n => `$${(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  /* ── Loading ── */
  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0b0e11', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <Loader2 size={36} style={{ color: '#f0b90b', animation: 'spin .8s linear infinite' }} />
        <span style={{ color: '#f0b90b', fontWeight: 800, fontSize: 14, letterSpacing: 4, textTransform: 'uppercase' }}>
          Loading Admin Panel...
        </span>
      </div>
    </div>
  );

  const TABS = [
    { key: 'users',    label: 'Users',    icon: <Users size={14} />,    count: users.length },
    { key: 'requests', label: 'Requests', icon: <Clock size={14} />,    count: pending.length, alert: pending.length > 0 },
    { key: 'plans',    label: 'Plans',    icon: <PieChart size={14} />,  count: null },
    { key: 'logs',     label: 'Logs',     icon: <List size={14} />,      count: null },
    { key: 'traders',  label: 'Traders',  icon: <UserPlus size={14} />, count: traders.filter(isApproved).length },
  ];

  return (
    <div style={{ background: '#0b0e11', minHeight: '100vh', color: '#eaecef', fontFamily: "'Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-thumb{background:#2b3139;border-radius:4px}
        .no-scroll{scrollbar-width:none}
        .no-scroll::-webkit-scrollbar{display:none}
        .adm-input{background:#0b0e11;border:1px solid #2b3139;border-radius:10px;padding:10px 14px;color:#eaecef;font-size:13px;outline:none;font-family:inherit;width:100%;transition:border .15s;}
        .adm-input:focus{border-color:#f0b90b;}
        .adm-btn{padding:8px 18px;border:none;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;gap:6px;transition:all .15s;}
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
        .adm-table td{padding:13px 16px;border-bottom:1px solid #1e232950;font-size:13px;vertical-align:middle;}
        .adm-table tr:hover td{background:rgba(255,255,255,.02);}
        .adm-table tr:last-child td{border-bottom:none;}
        .badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;}
        .bdg-pending{background:rgba(240,185,11,.12);color:#f0b90b;}
        .bdg-approved,.bdg-completed{background:rgba(14,203,129,.12);color:#0ecb81;}
        .bdg-rejected{background:rgba(246,70,93,.12);color:#f6465d;}
        .bdg-admin{background:rgba(240,185,11,.12);color:#f0b90b;}
        .bdg-user{background:rgba(132,142,156,.1);color:#848e9c;}
        .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.85);backdrop-filter:blur(6px);z-index:999;display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto;}
        .modal-box{background:#161a1e;border:1px solid #2b3139;border-radius:24px;padding:28px;width:100%;max-width:500px;max-height:90vh;overflow-y:auto;animation:fadeIn .25s;}
        @media(max-width:640px){
          .adm-table th,.adm-table td{padding:8px 10px;font-size:12px;}
          .hide-sm{display:none!important;}
          .modal-box{padding:20px;}
        }
      `}</style>

      {/* ── Toast Alert ── */}
      {alert && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, background: alert.type === 'error' ? '#f6465d' : '#0ecb81', color: '#fff', padding: '12px 20px', borderRadius: 14, fontWeight: 700, fontSize: 13, animation: 'fadeIn .3s', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 32px rgba(0,0,0,.5)', maxWidth: 320 }}>
          {alert.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          {alert.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ background: '#0f1318', borderBottom: '1px solid #1e2329', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(240,185,11,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={20} style={{ color: '#f0b90b' }} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#f0b90b', letterSpacing: 1 }}>VINANCE ADMIN</div>
            <div style={{ fontSize: 11, color: '#5e6673' }}>Command Center</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {pending.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(246,70,93,.1)', border: '1px solid rgba(246,70,93,.2)', borderRadius: 20, padding: '5px 12px', fontSize: 12, color: '#f6465d', fontWeight: 700 }}>
              <AlertCircle size={13} /> {pending.length} Pending
            </div>
          )}
          <button onClick={fetchData} className="adm-btn" style={{ background: '#1e2329', color: '#848e9c', border: '1px solid #2b3139' }}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      <div style={{ padding: '20px 24px' }}>

        {/* ── Stats ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 14, marginBottom: 24 }}>
          {[
            { l: 'Total Users',    v: users.length,                      icon: <Users size={18} />,     color: '#627eea' },
            { l: 'Total Balance',  v: fmtAmt(totalBal),                  icon: <DollarSign size={18} />, color: '#f0b90b' },
            { l: 'Pending',        v: pending.length,                    icon: <Clock size={18} />,     color: '#f6465d' },
            { l: 'Active Traders', v: traders.filter(isApproved).length, icon: <Award size={18} />,     color: '#0ecb81' },
          ].map(s => (
            <div key={s.l} className="stat-card" style={{ borderTop: `2px solid ${s.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 11, color: '#848e9c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' }}>{s.l}</span>
                <div style={{ color: s.color, background: s.color + '18', padding: 8, borderRadius: 8 }}>{s.icon}</div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#eaecef' }}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="no-scroll" style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 20 }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: activeTab === t.key ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', transition: 'all .15s', background: activeTab === t.key ? '#f0b90b' : '#161a1e', color: activeTab === t.key ? '#0b0e11' : '#848e9c', position: 'relative' }}>
              {t.icon} {t.label}
              {t.alert && (
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#f6465d', position: 'absolute', top: 6, right: 6 }} />
              )}
              {t.count !== null && (
                <span style={{ background: activeTab === t.key ? 'rgba(0,0,0,.2)' : '#2b3139', color: activeTab === t.key ? '#0b0e11' : '#eaecef', borderRadius: 20, padding: '1px 7px', fontSize: 10, fontWeight: 700 }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        <div style={{ background: '#161a1e', borderRadius: 20, border: '1px solid #1e2329', overflow: 'hidden', minHeight: 400 }}>

          {/* USERS */}
          {activeTab === 'users' && (
            <ManageUsers
              users={users}
              fetchData={fetchData}
              onEdit={(user) => { setSelectedUser(user); setNewBalance(user.balance); setIsModalOpen(true); }}
            />
          )}

          {/* REQUESTS */}
          {activeTab === 'requests' && <PendingRequests requests={requests} fetchData={fetchData} />}

          {/* PLANS */}
          {activeTab === 'plans' && <ManagePlans fetchData={fetchData} />}

          {/* LOGS */}
          {activeTab === 'logs' && <InvestmentLogs data={investments} />}

          {/* TRADERS */}
          {activeTab === 'traders' && (
            <div style={{ padding: 24 }}>

              {/* Pending Applications */}
              {traders.filter(isPending).length > 0 && (
                <div style={{ marginBottom: 32 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: '#f0b90b', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Clock size={14} /> Pending Applications ({traders.filter(isPending).length})
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
                    {traders.filter(isPending).map(trader => (
                      <div key={trader._id} style={{ background: '#0b0e11', border: '1px dashed #2b3139', borderRadius: 16, padding: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#2b3139', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#eaecef' }}>
                            {trader.image || trader.img || trader.avatar
                              ? <img src={trader.image || trader.img || trader.avatar} alt={trader.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : trader.name?.[0] || 'T'}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontWeight: 700, color: '#eaecef', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{trader.name}</p>
                            <p style={{ color: '#848e9c', fontSize: 11 }}>Capital: ${trader.aum || 0} · ROI: {trader.profit || 0}%</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                          <button className="adm-btn btn-green" style={{ padding: '7px 10px' }} onClick={() => handleApproveTrader(trader._id)} title="Approve">
                            <CheckCircle size={15} />
                          </button>
                          <button className="adm-btn btn-red" style={{ padding: '7px 10px' }} onClick={() => handleDeleteTrader(trader._id)} title="Delete">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Trader Component */}
              <div style={{ marginBottom: 32 }}>
                <AddTrader fetchData={fetchData} />
              </div>

              {/* Approved Traders */}
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: '#848e9c', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 14 }}>
                  Active Master Traders ({traders.filter(isApproved).length})
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
                  {traders.filter(isApproved).map(trader => (
                    <div key={trader._id} style={{ background: '#0b0e11', border: '1px solid #1e2329', borderRadius: 16, padding: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, transition: 'border .2s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = '#2b3139'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = '#1e2329'}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                        <div style={{ width: 50, height: 50, borderRadius: '50%', background: '#2b3139', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, border: '2px solid #1e2329' }}>
                          {trader.image || trader.img || trader.avatar
                            ? <img src={trader.image || trader.img || trader.avatar} alt={trader.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : trader.name?.[0] || 'T'}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontWeight: 700, color: '#eaecef', fontSize: 14, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{trader.name}</p>
                          <p style={{ color: '#0ecb81', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <TrendingUp size={11} /> +{trader.roi || trader.profit || 0}% ROI
                          </p>
                          <p style={{ color: '#848e9c', fontSize: 11 }}>
                            {trader.followers || 0} followers · AUM ${(trader.aum || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <button className="adm-btn btn-blue" style={{ padding: '8px 10px' }} onClick={() => openEditModal(trader)} title="Edit">
                          <Edit size={14} />
                        </button>
                        <button className="adm-btn btn-red" style={{ padding: '8px 10px' }} onClick={() => handleDeleteTrader(trader._id)} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {traders.filter(isApproved).length === 0 && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: '#5e6673' }}>
                      <Award size={40} style={{ opacity: .15, margin: '0 auto 12px', display: 'block' }} />
                      <p style={{ fontSize: 13 }}>No approved traders yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══ USER BALANCE MODAL ══ */}
      {isModalOpen && (
        <div className="modal-bg" onClick={e => e.target === e.currentTarget && setIsModalOpen(false)}>
          <div className="modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#f0b90b' }}>Update Balance</h3>
                <p style={{ fontSize: 12, color: '#848e9c', marginTop: 2 }}>{selectedUser?.name} · {selectedUser?.email}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#848e9c', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, color: '#848e9c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 8, display: 'block' }}>
                Current Balance: <span style={{ color: '#f0b90b' }}>${(selectedUser?.balance || 0).toFixed(2)}</span>
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#f0b90b', fontWeight: 700, fontSize: 16 }}>$</span>
                <input
                  className="adm-input"
                  type="number"
                  value={newBalance}
                  onChange={e => setNewBalance(e.target.value)}
                  placeholder="0.00"
                  style={{ paddingLeft: 32, fontSize: 20, fontWeight: 800, fontFamily: 'monospace' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="adm-btn" style={{ flex: 1, background: '#2b3139', color: '#848e9c' }} onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="adm-btn btn-gold" style={{ flex: 2 }} onClick={handleBalanceUpdate}>
                <Save size={14} /> Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ TRADER EDIT MODAL ══ */}
      {isEditModalOpen && (
        <div className="modal-bg" onClick={e => e.target === e.currentTarget && setIsEditModalOpen(false)}>
          <div className="modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#f0b90b' }}>Edit Trader</h3>
              <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'none', border: 'none', color: '#848e9c', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Name */}
              <div>
                <label style={{ fontSize: 11, color: '#848e9c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 6, display: 'block' }}>Trader Name *</label>
                <input className="adm-input" placeholder="e.g. CryptoMaster Pro" value={editTraderData.name} onChange={e => setEditTraderData(p => ({ ...p, name: e.target.value }))} />
              </div>

              {/* Image Upload */}
              <ImageUploader
                label="Profile Image (Cloudinary)"
                value={editTraderData.avatar || editTraderData.image || editTraderData.img || ''}
                onChange={url => setEditTraderData(p => ({ ...p, image: url, img: url, avatar: url }))}
              />

              {/* Stats grid */}
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
                    <label style={{ fontSize: 10, color: '#848e9c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 5, display: 'block' }}>{f.l}</label>
                    <input className="adm-input" type="number" placeholder={f.p} value={editTraderData[f.k] || ''} onChange={e => setEditTraderData(p => ({ ...p, [f.k]: e.target.value }))} style={{ padding: '9px 12px', fontSize: 13 }} />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button className="adm-btn" style={{ flex: 1, background: '#2b3139', color: '#848e9c' }} onClick={() => setIsEditModalOpen(false)}>Cancel</button>
              <button className="adm-btn btn-gold" style={{ flex: 2 }} disabled={savingTrader || !editTraderData.name} onClick={handleEditTraderSubmit}>
                {savingTrader ? <Loader2 size={14} style={{ animation: 'spin .8s linear infinite' }} /> : <Save size={14} />}
                {savingTrader ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
