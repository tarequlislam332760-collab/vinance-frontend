import React, { useState, useEffect, useRef, useContext } from 'react';
import { Bell, X, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { UserContext } from '../context/UserContext';
import axios from 'axios';

const API = 'https://vinance-backend-1.onrender.com';

const TYPE_ICON = {
  deposit:       '💰',
  withdraw:      '💸',
  spot_buy:      '📈',
  spot_sell:     '📉',
  'futures-buy': '⚡',
  'futures-sell':'⚡',
  futures:       '⚡',
  investment:    '🏦',
  copy_trade:    '📋',
  trade:         '📋',
  bot_start:     '🤖',
  bot_stop:      '🤖',
  system:        '🔔',
};

const timeSince = d => {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
};

export default function NotificationSystem() {
  const { token } = useContext(UserContext);
  const [open,    setOpen]    = useState(false);
  const [notifs,  setNotifs]  = useState([]);
  const [unread,  setUnread]  = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef();

  /* Close on outside click */
  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* Fetch from backend */
  const fetchNotifs = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifs(res.data.notifications || []);
      setUnread(res.data.unread || 0);
    } catch {
      /* Fallback silent */
    } finally { setLoading(false); }
  };

  /* Poll every 30 seconds */
  useEffect(() => {
    if (!token) return;
    fetchNotifs();
    const iv = setInterval(fetchNotifs, 30000);
    return () => clearInterval(iv);
  }, [token]);

  const markAllRead = async () => {
    if (!token) return;
    try {
      await axios.post(`${API}/api/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifs(n => n.map(x => ({ ...x, read: true })));
      setUnread(0);
    } catch {}
  };

  const markOne = async (id) => {
    try {
      await axios.post(`${API}/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifs(n => n.map(x => x._id === id ? { ...x, read: true } : x));
      setUnread(c => Math.max(0, c - 1));
    } catch {}
  };

  const deleteOne = async (e, id) => {
    e.stopPropagation();
    try {
      await axios.delete(`${API}/api/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifs(n => n.filter(x => x._id !== id));
    } catch {}
  };

  const handleOpen = () => {
    setOpen(v => !v);
    if (!open) fetchNotifs();
  };

  if (!token) return null;

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        style={{
          position: 'relative',
          background: open ? '#2b3139' : 'rgba(43,49,57,.5)',
          border: 'none',
          borderRadius: '50%',
          width: 38,
          height: 38,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'background .15s',
          flexShrink: 0,
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#2b3139'}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = 'rgba(43,49,57,.5)'; }}
      >
        <Bell size={18} color={open ? '#f0b90b' : '#848e9c'} />
        {unread > 0 && (
          <span style={{
            position: 'absolute',
            top: 2,
            right: 2,
            minWidth: 16,
            height: 16,
            background: '#f6465d',
            borderRadius: 8,
            fontSize: 9,
            fontWeight: 700,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #161a1e',
            padding: '0 3px',
            fontFamily: 'Inter, sans-serif',
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 10px)',
          right: 0,
          width: 360,
          maxWidth: 'calc(100vw - 32px)',
          background: '#1e2329',
          border: '1px solid #2b3139',
          borderRadius: 14,
          boxShadow: '0 12px 48px rgba(0,0,0,.8)',
          zIndex: 9999,
          overflow: 'hidden',
          fontFamily: 'Inter, sans-serif',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', borderBottom: '1px solid #2b3139' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#eaecef', fontWeight: 700, fontSize: 14 }}>Notifications</span>
              {unread > 0 && (
                <span style={{ background: '#f6465d', color: '#fff', fontSize: 9, fontWeight: 700, padding: '1px 7px', borderRadius: 10 }}>
                  {unread}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {unread > 0 && (
                <button onClick={markAllRead}
                  style={{ background: 'none', border: 'none', color: '#f0b90b', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Mark all read
                </button>
              )}
              <button onClick={fetchNotifs}
                style={{ background: 'none', border: 'none', color: '#848e9c', cursor: 'pointer', display: 'flex' }}>
                <RefreshCw size={13} style={{ animation: loading ? 'spin .8s linear infinite' : 'none' }} />
              </button>
              <button onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', color: '#5e6673', cursor: 'pointer', display: 'flex' }}>
                <X size={14} />
              </button>
            </div>
          </div>

          {/* List */}
          <div style={{ maxHeight: 380, overflowY: 'auto' }}>
            {loading && notifs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 32 }}>
                <Loader2 size={20} style={{ color: '#f0b90b', display: 'inline-block', animation: 'spin .8s linear infinite' }} />
              </div>
            ) : notifs.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: '#5e6673', fontSize: 12 }}>
                <Bell size={28} style={{ opacity: .2, margin: '0 auto 8px', display: 'block' }} />
                No notifications yet
              </div>
            ) : notifs.map(n => (
              <div key={n._id}
                onClick={() => markOne(n._id)}
                style={{
                  display: 'flex',
                  gap: 10,
                  padding: '12px 16px',
                  borderBottom: '1px solid #1e232960',
                  cursor: 'pointer',
                  background: n.read ? 'transparent' : '#161a1e',
                  transition: 'background .15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.03)'}
                onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : '#161a1e'}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(240,185,11,.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, fontSize: 16,
                }}>
                  {TYPE_ICON[n.type] || '🔔'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, gap: 4 }}>
                    <span style={{ color: n.read ? '#848e9c' : '#eaecef', fontWeight: n.read ? 400 : 700, fontSize: 12 }}>
                      {n.title}
                    </span>
                    <span style={{ color: '#5e6673', fontSize: 10, flexShrink: 0 }}>
                      {timeSince(n.createdAt)}
                    </span>
                  </div>
                  <p style={{ fontSize: 11, color: '#848e9c', lineHeight: 1.5 }}>{n.message}</p>
                  {n.amount && (
                    <span style={{
                      fontSize: 11, fontWeight: 700,
                      color: ['deposit', 'investment', 'bot_stop'].includes(n.type) ? '#0ecb81' : '#f6465d',
                    }}>
                      ${parseFloat(n.amount).toFixed(2)} USDT
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  {!n.read && (
                    <div style={{ width: 7, height: 7, background: '#f0b90b', borderRadius: '50%' }} />
                  )}
                  <button onClick={e => deleteOne(e, n._id)}
                    style={{ background: 'none', border: 'none', color: '#5e6673', cursor: 'pointer', padding: 2 }}>
                    <X size={10} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ padding: '8px 16px', borderTop: '1px solid #2b3139', textAlign: 'center' }}>
            <button
              style={{ background: 'none', border: 'none', color: '#f0b90b', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}
              onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
