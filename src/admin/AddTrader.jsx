import React, { useState, useContext, useRef } from 'react';
import { UserContext } from '../context/UserContext';
import { UserPlus, Upload, Loader2, CheckCircle, AlertCircle, X, Link } from 'lucide-react';
import axios from 'axios';
import API from '../api';

/* ══════════════════════════════════════
   Cloudinary Config — তোমার account থেকে নাও
   dfe3wlx4u = তোমার cloud name (ছবি থেকে দেখা)
   trader_preset = তোমার upload preset name
══════════════════════════════════════ */
const CLOUD_NAME    = 'dfe3wlx4u';
const UPLOAD_PRESET = 'trader_preset';

/* ─── CSS ─── */
const css = `
  .at-wrap { font-family:'Inter',sans-serif; }
  .at-wrap * { box-sizing:border-box; }
  .at-inp {
    width:100%; background:#0b0e11; border:1px solid #2b3139;
    border-radius:10px; padding:9px 13px; color:#eaecef;
    font-size:13px; outline:none; font-family:inherit;
    transition:border .15s;
  }
  .at-inp:focus { border-color:#f0b90b; }
  .at-inp::placeholder { color:#5e6673; }
  .at-label {
    font-size:10px; color:#848e9c; font-weight:700;
    text-transform:uppercase; letter-spacing:.05em;
    margin-bottom:5px; display:block;
  }
  .at-submit {
    background:#f0b90b; color:#0b0e11; border:none;
    border-radius:10px; padding:11px 24px; font-weight:800;
    font-size:13px; cursor:pointer; display:flex;
    align-items:center; gap:7px; transition:background .15s;
    font-family:inherit;
  }
  .at-submit:hover:not(:disabled) { background:#d4a30a; }
  .at-submit:disabled { opacity:.55; cursor:not-allowed; }
  .at-toast {
    position:fixed; top:16px; right:16px; z-index:9999;
    padding:11px 18px; border-radius:12px; font-weight:700;
    font-size:13px; display:flex; align-items:center; gap:8px;
    box-shadow:0 8px 32px rgba(0,0,0,.5); max-width:320px;
    animation:fadeUp .3s;
  }
  @keyframes fadeUp { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:none} }
  @keyframes spin { to{transform:rotate(360deg)} }
  .spin { animation:spin .8s linear infinite; }
`;

const FIELDS = [
  { k:'roi',       l:'ROI (%)',      p:'45',     t:'number' },
  { k:'pnl',       l:'PNL ($)',      p:'12500',  t:'number' },
  { k:'aum',       l:'AUM ($)',      p:'250000', t:'number' },
  { k:'winRate',   l:'Win Rate (%)', p:'78',     t:'number' },
  { k:'followers', l:'Followers',    p:'320',    t:'number' },
  { k:'days',      l:'Days Active',  p:'120',    t:'number' },
];

const EMPTY = { name:'', image:'', roi:'', pnl:'', aum:'', winRate:'', followers:'', days:'' };

export default function AddTrader({ fetchData }) {
  const { token } = useContext(UserContext);
  const fileRef   = useRef(null);

  const [form,      setForm]      = useState(EMPTY);
  const [uploading, setUploading] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [toast,     setToast]     = useState(null);
  const [urlMode,   setUrlMode]   = useState(false); // toggle between upload / paste URL

  const showToast = (msg, type = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  /* ─────────────────────────────────────
     Cloudinary Upload
     Unsigned preset দিয়ে সরাসরি upload
  ───────────────────────────────────── */
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'err');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be under 5MB', 'err');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'traders');

    try {
      /* Use bare fetch (no axios interceptors) to avoid auth header issues */
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message || `HTTP ${res.status}`);
      }

      const data = await res.json();

      if (data.secure_url) {
        setForm(p => ({ ...p, image: data.secure_url }));
        showToast('Image uploaded successfully!');
      } else {
        throw new Error('No secure_url in response');
      }

    } catch (err) {
      console.error('Cloudinary error:', err);
      showToast(
        err.message?.includes('unsigned')
          ? 'Preset must be set to "Unsigned" in Cloudinary dashboard'
          : `Upload failed: ${err.message}`,
        'err'
      );
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  /* ─────────────────────────────────────
     Form Submit → Backend
  ───────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) return showToast('Trader name is required', 'err');
    if (!form.image)        return showToast('Please upload or paste an image URL', 'err');

    setSaving(true);
    try {
      const payload = {
        name:      form.name.trim(),
        image:     form.image.trim(),
        roi:       Number(form.roi)       || 0,
        pnl:       Number(form.pnl)       || 0,
        aum:       Number(form.aum)       || 0,
        winRate:   Number(form.winRate)   || 0,
        followers: Number(form.followers) || 0,
        days:      Number(form.days)      || 0,
      };

      await API.post('/api/admin/create-trader', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      showToast('Trader created successfully!');
      setForm(EMPTY);
      if (fetchData) fetchData();

    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create trader', 'err');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>{css}</style>

      {/* Toast */}
      {toast && (
        <div className="at-toast" style={{ background: toast.type==='err'?'#f6465d':'#0ecb81', color:'#fff' }}>
          {toast.type==='err' ? <AlertCircle size={15}/> : <CheckCircle size={15}/>}
          {toast.msg}
        </div>
      )}

      <div className="at-wrap w-full text-white">
        <div className="max-w-4xl mx-auto bg-[#161a1e] p-6 rounded-2xl border border-[#2b3139] shadow-2xl">

          {/* Header */}
          <h2 className="text-sm font-black mb-6 flex items-center gap-2 text-[#f0b90b] uppercase tracking-widest">
            <UserPlus size={16}/> Add New Trader
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5 text-left">

            {/* ── Image Upload Section ── */}
            <div>
              <label className="at-label">Trader Image *</label>

              {/* Toggle buttons */}
              <div style={{ display:'flex', gap:8, marginBottom:10 }}>
                {[
                  { k:false, l:'📁 Upload File' },
                  { k:true,  l:'🔗 Paste URL'   },
                ].map(btn => (
                  <button key={String(btn.k)} type="button"
                    onClick={() => setUrlMode(btn.k)}
                    style={{ padding:'6px 16px', fontSize:12, fontWeight:700, border:`1px solid ${urlMode===btn.k?'rgba(240,185,11,.5)':'#2b3139'}`, borderRadius:8, background:urlMode===btn.k?'rgba(240,185,11,.08)':'transparent', color:urlMode===btn.k?'#f0b90b':'#848e9c', cursor:'pointer', fontFamily:'inherit', transition:'all .15s' }}>
                    {btn.l}
                  </button>
                ))}
              </div>

              <div style={{ display:'flex', alignItems:'center', gap:14 }}>

                {/* Avatar preview */}
                <div
                  onClick={() => { if (!urlMode && !uploading) fileRef.current?.click(); }}
                  style={{ width:64, height:64, borderRadius:'50%', border:`2px dashed ${form.image?'#f0b90b':'#2b3139'}`, background:'#0b0e11', display:'flex', alignItems:'center', justifyContent:'center', cursor:urlMode?'default':'pointer', overflow:'hidden', flexShrink:0, transition:'border .2s' }}>
                  {uploading ? (
                    <Loader2 size={22} className="spin" style={{ color:'#f0b90b' }}/>
                  ) : form.image ? (
                    <img src={form.image} alt="Trader" style={{ width:'100%', height:'100%', objectFit:'cover' }}
                      onError={() => setForm(p => ({...p, image:''}))}/>
                  ) : (
                    <Upload size={20} style={{ color:'#5e6673' }}/>
                  )}
                </div>

                {/* Hidden file input */}
                <input type="file" accept="image/*" ref={fileRef} onChange={handleFileUpload} className="hidden" style={{ display:'none' }}/>

                {/* URL paste or upload area */}
                <div style={{ flex:1 }}>
                  {urlMode ? (
                    <>
                      <input
                        className="at-inp"
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        value={form.image}
                        onChange={e => setForm(p => ({...p, image:e.target.value}))}
                      />
                      <p style={{ fontSize:11, color:'#5e6673', marginTop:4 }}>Paste any direct image URL</p>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        disabled={uploading}
                        onClick={() => fileRef.current?.click()}
                        style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 18px', background:'rgba(240,185,11,.1)', border:'1px solid rgba(240,185,11,.3)', borderRadius:10, color:'#f0b90b', fontWeight:700, fontSize:13, cursor:uploading?'not-allowed':'pointer', fontFamily:'inherit', transition:'all .15s' }}>
                        {uploading ? <><Loader2 size={14} className="spin"/> Uploading...</> : <><Upload size={14}/> Choose Image</>}
                      </button>
                      <p style={{ fontSize:11, color:'#5e6673', marginTop:4 }}>
                        JPG/PNG/WEBP · Max 5MB · Uploads to Cloudinary (<code style={{ color:'#f0b90b' }}>{CLOUD_NAME}</code>)
                      </p>
                      {form.image && (
                        <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:5 }}>
                          <CheckCircle size={12} style={{ color:'#0ecb81' }}/>
                          <span style={{ fontSize:11, color:'#0ecb81', maxWidth:260, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{form.image}</span>
                          <button type="button" onClick={() => setForm(p=>({...p,image:''}))} style={{ background:'none', border:'none', color:'#848e9c', cursor:'pointer', display:'flex' }}><X size={11}/></button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Cloudinary troubleshoot note */}
              {!form.image && !urlMode && (
                <div style={{ marginTop:10, padding:'10px 14px', background:'rgba(240,185,11,.05)', border:'1px solid rgba(240,185,11,.15)', borderRadius:8, fontSize:11, color:'#848e9c', lineHeight:1.6 }}>
                  <span style={{ color:'#f0b90b', fontWeight:700 }}>Cloudinary setup:</span> Dashboard → Settings → Upload → Upload presets → <strong>trader_preset</strong> → Mode: <span style={{ color:'#0ecb81', fontWeight:700 }}>Unsigned</span> (not Signed)
                </div>
              )}
            </div>

            {/* ── Trader Name ── */}
            <div>
              <label className="at-label">Trader Name *</label>
              <input
                className="at-inp"
                type="text"
                required
                placeholder="e.g. CryptoMaster"
                value={form.name}
                onChange={e => setForm(p => ({...p, name:e.target.value}))}
              />
            </div>

            {/* ── Stats Grid ── */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:12 }}>
              {FIELDS.map(f => (
                <div key={f.k}>
                  <label className="at-label">{f.l}</label>
                  <input
                    className="at-inp"
                    type={f.t}
                    placeholder={f.p}
                    value={form[f.k]}
                    onChange={e => setForm(p => ({...p, [f.k]:e.target.value}))}
                    min="0"
                  />
                </div>
              ))}
            </div>

            {/* ── Submit ── */}
            <div style={{ paddingTop:4, display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
              <button type="submit" className="at-submit" disabled={saving || uploading}>
                {saving
                  ? <><Loader2 size={14} className="spin"/> Saving...</>
                  : <><UserPlus size={15}/> Add Trader</>
                }
              </button>
              <button
                type="button"
                onClick={() => setForm(EMPTY)}
                style={{ padding:'10px 18px', background:'transparent', border:'1px solid #2b3139', borderRadius:10, color:'#848e9c', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                Clear
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  );
}
