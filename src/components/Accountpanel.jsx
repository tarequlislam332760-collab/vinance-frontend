import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import {
  Wallet, ArrowUpRight, ArrowDownLeft, RefreshCw,
  TrendingUp, Shield, Loader2, Eye, EyeOff, Zap
} from 'lucide-react';

const API = "https://vinance-backend-1.onrender.com";

const AccountPanel = ({ positions = [] }) => {
  const { user, token, refreshUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [hidden,    setHidden]    = useState(false);
  const [loading,   setLoading]   = useState(false);

  // Refresh user balance
  const refresh = async () => {
    setLoading(true);
    if (refreshUser) await refreshUser();
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  // Calculate unrealized PNL from open positions
  const unrealizedPnl = positions.reduce((sum, p) => sum + (p.pnl || 0), 0);
  const pnlPositive   = unrealizedPnl >= 0;

  const balance   = user?.balance || 0;
  const equity    = balance + unrealizedPnl;

  // Margin ratio (simplified)
  const usedMargin = positions.reduce((sum, p) => sum + (p.amount || 0), 0);
  const marginRatio = equity > 0 ? ((usedMargin / equity) * 100).toFixed(1) : '0.0';

  const fmt = (n) => hidden ? '****' : `$${parseFloat(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div style={{ background: '#161a1e', border: '1px solid #1e2329', borderRadius: 12, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #1e2329' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#eaecef', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Wallet size={14} style={{ color: '#f0b90b' }} /> Account
        </span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => setHidden(h => !h)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#848e9c' }}>
            {hidden ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
          <button onClick={refresh} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#848e9c' }}>
            <RefreshCw size={13} style={loading ? { animation: 'spin .8s linear infinite' } : {}} />
          </button>
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <div style={{ padding: '14px 16px' }}>

        {/* Balance */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: '#848e9c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 }}>
            Available Balance
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#eaecef', fontFamily: 'monospace', marginBottom: 2 }}>
            {fmt(balance)}
          </div>
          <div style={{ fontSize: 10, color: '#848e9c' }}>USDT</div>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          {[
            { label: 'Equity',         value: fmt(equity),         color: '#eaecef' },
            { label: 'Unrealized PNL', value: hidden ? '****' : `${pnlPositive ? '+' : ''}$${unrealizedPnl.toFixed(2)}`, color: pnlPositive ? '#0ecb81' : '#f6465d' },
            { label: 'Used Margin',    value: fmt(usedMargin),     color: '#eaecef' },
            { label: 'Margin Ratio',   value: hidden ? '****' : `${marginRatio}%`, color: parseFloat(marginRatio) > 80 ? '#f6465d' : parseFloat(marginRatio) > 50 ? '#f0b90b' : '#0ecb81' },
          ].map(s => (
            <div key={s.label} style={{ background: '#0b0e11', borderRadius: 10, padding: '10px 12px', border: '1px solid #1e2329' }}>
              <div style={{ fontSize: 10, color: '#848e9c', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.03em' }}>{s.label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: s.color, fontFamily: 'monospace' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Margin ratio bar */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 10, color: '#848e9c', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' }}>Margin Usage</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: parseFloat(marginRatio) > 80 ? '#f6465d' : '#848e9c' }}>
              {hidden ? '--%' : `${marginRatio}%`}
            </span>
          </div>
          <div style={{ height: 4, background: '#1e2329', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(parseFloat(marginRatio), 100)}%`, background: parseFloat(marginRatio) > 80 ? '#f6465d' : parseFloat(marginRatio) > 50 ? '#f0b90b' : '#0ecb81', borderRadius: 4, transition: 'width .5s ease' }} />
          </div>
        </div>

        {/* Mode info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#0b0e11', borderRadius: 8, marginBottom: 16, fontSize: 12 }}>
          <span style={{ color: '#848e9c', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Shield size={12} /> Cross Margin
          </span>
          <span style={{ color: '#f0b90b', fontWeight: 700, fontSize: 11 }}>Single-Asset Mode</span>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <button onClick={() => navigate('/deposit')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 0', background: '#f0b90b', border: 'none', borderRadius: 10, color: '#0b0e11', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
            <ArrowDownLeft size={14} /> Deposit
          </button>
          <button onClick={() => navigate('/withdraw')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 0', background: 'transparent', border: '1px solid #2b3139', borderRadius: 10, color: '#eaecef', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
            <ArrowUpRight size={14} /> Withdraw
          </button>
        </div>

        {/* Open positions count */}
        {positions.length > 0 && (
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'rgba(240,185,11,.06)', border: '1px solid rgba(240,185,11,.15)', borderRadius: 8, fontSize: 12 }}>
            <Zap size={13} style={{ color: '#f0b90b' }} />
            <span style={{ color: '#848e9c' }}>Open Positions: </span>
            <span style={{ color: '#f0b90b', fontWeight: 700 }}>{positions.length}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountPanel;
