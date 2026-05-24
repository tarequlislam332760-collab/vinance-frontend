import React, { useState, useContext, useRef } from 'react';
import { UserContext } from '../context/UserContext';
import { UserPlus, Upload, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';
import API from '../api';

/* ══════════════════════════════
   ✅ তোমার Cloudinary credentials
══════════════════════════════ */
const CLOUD_NAME    = 'dfe3wlx4u';   // Cloudinary cloud name
const UPLOAD_PRESET = 'trader_preset'; // Unsigned preset name

const EMPTY = {
  name: '', image: '', roi: '', pnl: '',
  aum: '', winRate: '', followers: '', days: ''
};

const STATS = [
  { k:'roi',       l:'ROI (%)',      p:'45'     },
  { k:'pnl',       l:'PNL ($)',      p:'12500'  },
  { k:'aum',       l:'AUM ($)',      p:'250000' },
  { k:'winRate',   l:'Win Rate (%)', p:'78'     },
  { k:'followers', l:'Followers',    p:'320'    },
  { k:'days',      l:'Days Active',  p:'120'    },
];

export default function AddTrader({ fetchData }) {
  const { token } = useContext(UserContext);
  const fileRef   = useRef(null);

  const [form,      setForm]      = useState(EMPTY);
  const [uploading, setUploading] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [progress,  setProgress]  = useState('');
  const [toast,     setToast]     = useState(null);

  const showToast = (msg, type = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 5000);
  };

  /* ─────────────────────────────────
     Cloudinary upload via fetch()
     axios ব্যবহার করলে interceptor
     Authorization header যোগ করে →
     Cloudinary reject করে। তাই fetch।
  ───────────────────────────────── */
  const uploadToCloudinary = async (file) => {
    setUploading(true);
    setProgress('Uploading to Cloudinary...');

    const fd = new FormData();
    fd.append('file',           file);
    fd.append('upload_preset',  UPLOAD_PRESET);
    fd.append('folder',         'traders');

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: 'POST', body: fd }
      );

      const data = await res.json();

      if (!res.ok) {
        /* Common errors */
        if (data?.error?.message?.includes('preset')) {
          throw new Error('Preset not found or not Unsigned. Check Cloudinary dashboard.');
        }
        throw new Error(data?.error?.message || `HTTP ${res.status}`);
      }

      if (!data.secure_url) throw new Error('No URL returned from Cloudinary');

      setForm(p => ({ ...p, image: data.secure_url }));
      setProgress('');
      showToast('✅ Image uploaded!');

    } catch (err) {
      setProgress('');
      showToast(`Upload failed: ${err.message}`, 'err');
    } finally {
      setUploading(false);
    }
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/'))      return showToast('Please select an image file', 'err');
    if (file.size > 4 * 1024 * 1024)         return showToast('Max file size is 4MB', 'err');
    uploadToCloudinary(file);
    e.target.value = '';
  };

  /* ─────────────────────────────────
     Submit — শুধু image URL পাঠাও,
     কোনো base64 নয়
  ───────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return showToast('Trader name is required', 'err');
    if (!form.image)       return showToast('Upload or paste an image URL first', 'err');

    /* Safety check: reject base64 strings (causes 413) */
    if (form.image.startsWith('data:')) {
      return showToast('Cannot send base64 image. Please upload via Cloudinary or paste a URL.', 'err');
    }

    setSaving(true);
    try {
      await API.post(
        '/api/admin/create-trader',
        {
          name:      form.name.trim(),
          image:     form.image.trim(),   // ✅ URL only
          roi:       Number(form.roi)       || 0,
          pnl:       Number(form.pnl)       || 0,
          aum:       Number(form.aum)       || 0,
          winRate:   Number(form.winRate)   || 0,
          followers: Number(form.followers) || 0,
          days:      Number(form.days)      || 0,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast('✅ Trader created!');
      setForm(EMPTY);
      fetchData?.();

    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      if (err.response?.status === 413) {
        showToast('Server rejected: payload too large. Use image URL, not base64.', 'err');
      } else {
        showToast(`Error: ${msg}`, 'err');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full text-white" style={{ fontFamily:'Inter,sans-serif' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position:'fixed', top:16, right:16, zIndex:9999,
          background: toast.type==='err' ? '#f6465d' : '#0ecb81',
          color:'#fff', padding:'11px 18px', borderRadius:12,
          fontWeight:700, fontSize:13, display:'flex', alignItems:'center',
          gap:8, boxShadow:'0 8px 32px rgba(0,0,0,.5)', maxWidth:340,
          animation:'fadeUp .3s'
        }}>
          {toast.type==='err'
            ? <AlertCircle size={15} style={{ flexShrink:0 }}/>
            : <CheckCircle size={15} style={{ flexShrink:0 }}/>}
          {toast.msg}
        </div>
      )}

      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .spin{animation:spin .8s linear infinite}
        .at-inp{
          width:100%;background:#0b0e11;border:1px solid #2b3139;
          border-radius:10px;padding:9px 13px;color:#eaecef;
          font-size:13px;outline:none;font-family:inherit;transition:border .15s;
        }
        .at-inp:focus{border-color:#f0b90b;}
        .at-inp::placeholder{color:#5e6673;}
        .at-lbl{
          font-size:10px;color:#848e9c;font-weight:700;
          text-transform:uppercase;letter-spacing:.05em;
          margin-bottom:5px;display:block;
        }
      `}</style>

      <div style={{
        maxWidth:800, margin:'0 auto', background:'#161a1e',
        padding:24, borderRadius:20, border:'1px solid #2b3139'
      }}>

        {/* Header */}
        <h2 style={{
          fontSize:12, fontWeight:800, marginBottom:20,
          display:'flex', alignItems:'center', gap:8,
          color:'#f0b90b', textTransform:'uppercase', letterSpacing:'.08em'
        }}>
          <UserPlus size={15}/> Add New Trader
        </h2>

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* ── Image Upload ── */}
          <div>
            <label className="at-lbl">Trader Image *</label>

            <div style={{ display:'flex', alignItems:'flex-start', gap:14 }}>

              {/* Avatar circle */}
              <div
                onClick={() => !uploading && fileRef.current?.click()}
                style={{
                  width:64, height:64, borderRadius:'50%', flexShrink:0,
                  border: `2px dashed ${form.image ? '#f0b90b' : '#2b3139'}`,
                  background:'#0b0e11', display:'flex', alignItems:'center',
                  justifyContent:'center', cursor:'pointer', overflow:'hidden',
                  transition:'border .2s'
                }}>
                {uploading ? (
                  <Loader2 size={20} className="spin" style={{ color:'#f0b90b' }}/>
                ) : form.image && !form.image.startsWith('data:') ? (
                  <img
                    src={form.image} alt="preview"
                    style={{ width:'100%', height:'100%', objectFit:'cover' }}
                    onError={() => setForm(p => ({ ...p, image:'' }))}
                  />
                ) : (
                  <Upload size={18} style={{ color:'#5e6673' }}/>
                )}
              </div>

              {/* Hidden input */}
              <input
                type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                ref={fileRef} onChange={handleFile}
                style={{ display:'none' }}
              />

              <div style={{ flex:1 }}>
                {/* Upload button */}
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                  style={{
                    display:'flex', alignItems:'center', gap:7,
                    padding:'8px 16px', marginBottom:8,
                    background:'rgba(240,185,11,.1)',
                    border:'1px solid rgba(240,185,11,.3)',
                    borderRadius:9, color:'#f0b90b', fontWeight:700,
                    fontSize:12, cursor: uploading?'not-allowed':'pointer',
                    fontFamily:'inherit', transition:'all .15s'
                  }}>
                  {uploading
                    ? <><Loader2 size={13} className="spin"/> {progress || 'Uploading...'}</>
                    : <><Upload size={13}/> Upload Image</>}
                </button>

                {/* OR paste URL */}
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                  <div style={{ flex:1, height:1, background:'#2b3139' }}/>
                  <span style={{ fontSize:10, color:'#5e6673' }}>OR paste URL</span>
                  <div style={{ flex:1, height:1, background:'#2b3139' }}/>
                </div>

                <div style={{ position:'relative' }}>
                  <input
                    className="at-inp"
                    type="url"
                    placeholder="https://cdn.example.com/photo.jpg"
                    value={form.image.startsWith('data:') ? '' : form.image}
                    onChange={e => setForm(p => ({ ...p, image: e.target.value }))}
                    style={{ paddingRight: form.image ? 36 : 13 }}
                  />
                  {form.image && !form.image.startsWith('data:') && (
                    <button
                      type="button"
                      onClick={() => setForm(p => ({ ...p, image:'' }))}
                      style={{
                        position:'absolute', right:10, top:'50%',
                        transform:'translateY(-50%)',
                        background:'none', border:'none', color:'#848e9c',
                        cursor:'pointer', display:'flex'
                      }}>
                      <X size={12}/>
                    </button>
                  )}
                </div>

                <p style={{ fontSize:11, color:'#5e6673', marginTop:4 }}>
                  JPG · PNG · WEBP · Max 4MB
                  {form.image && !form.image.startsWith('data:') && (
                    <span style={{ color:'#0ecb81', marginLeft:8 }}>
                      <CheckCircle size={10} style={{ display:'inline', verticalAlign:'middle' }}/> URL set
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Cloudinary help */}
            <div style={{
              marginTop:10, padding:'10px 14px',
              background:'rgba(99,126,234,.05)',
              border:'1px solid rgba(99,126,234,.15)',
              borderRadius:8, fontSize:11, color:'#848e9c', lineHeight:1.7
            }}>
              <span style={{ color:'#627eea', fontWeight:700 }}>Cloudinary setup:</span>{' '}
              Dashboard → Settings → Upload → <strong>trader_preset</strong> →
              Signing Mode: <span style={{ color:'#0ecb81', fontWeight:700 }}>Unsigned</span> → Save
              <br/>
              Cloud: <code style={{ color:'#f0b90b' }}>{CLOUD_NAME}</code> ·
              Preset: <code style={{ color:'#f0b90b' }}>{UPLOAD_PRESET}</code>
            </div>
          </div>

          {/* ── Trader Name ── */}
          <div>
            <label className="at-lbl">Trader Name *</label>
            <input
              className="at-inp"
              type="text" required
              placeholder="e.g. CryptoMaster"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            />
          </div>

          {/* ── Stats ── */}
          <div style={{
            display:'grid',
            gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))',
            gap:12
          }}>
            {STATS.map(f => (
              <div key={f.k}>
                <label className="at-lbl">{f.l}</label>
                <input
                  className="at-inp"
                  type="number" min="0"
                  placeholder={f.p}
                  value={form[f.k]}
                  onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))}
                />
              </div>
            ))}
          </div>

          {/* ── Buttons ── */}
          <div style={{ display:'flex', gap:10, paddingTop:4, flexWrap:'wrap' }}>
            <button
              type="submit"
              disabled={saving || uploading}
              style={{
                display:'flex', alignItems:'center', gap:7,
                padding:'11px 24px', background:'#f0b90b',
                border:'none', borderRadius:10, color:'#0b0e11',
                fontWeight:800, fontSize:13, cursor: (saving||uploading)?'not-allowed':'pointer',
                fontFamily:'inherit', transition:'background .15s',
                opacity: (saving||uploading) ? .6 : 1
              }}>
              {saving
                ? <><Loader2 size={14} className="spin"/> Saving...</>
                : <><UserPlus size={14}/> Add Trader</>}
            </button>

            <button
              type="button"
              onClick={() => setForm(EMPTY)}
              style={{
                padding:'11px 18px', background:'transparent',
                border:'1px solid #2b3139', borderRadius:10,
                color:'#848e9c', fontSize:13, fontWeight:600,
                cursor:'pointer', fontFamily:'inherit'
              }}>
              Clear
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
