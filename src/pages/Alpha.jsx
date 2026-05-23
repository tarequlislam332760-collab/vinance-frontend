import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap, Search, Star, RefreshCw, TrendingUp,
  ExternalLink, ChevronDown, AlertCircle, X,
  ArrowUpRight, BarChart2, Clock, Filter
} from 'lucide-react';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  .al{font-family:'Inter',sans-serif;background:#0b0e11;color:#eaecef;min-height:100vh;}
  .al *{box-sizing:border-box;margin:0;padding:0;}
  .al ::-webkit-scrollbar{width:4px;height:4px;}
  .al ::-webkit-scrollbar-thumb{background:#2b3139;border-radius:4px;}
  .al-card{background:#161a1e;border:1px solid #1e2329;border-radius:12px;padding:16px 20px;transition:all .15s;cursor:pointer;}
  .al-card:hover{border-color:#2b3139;background:#1a1f25;}
  .al-token{background:#161a1e;border:1px solid #1e2329;border-radius:10px;padding:12px 16px;display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr 70px;gap:8px;align-items:center;transition:background .15s;cursor:pointer;}
  .al-token:hover{background:#1a1f25;}
  .bdg{display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;}
  .bdg-new{background:rgba(240,185,11,.12);color:#f0b90b;}
  .bdg-hot{background:rgba(246,70,93,.12);color:#f6465d;}
  .bdg-trending{background:rgba(14,203,129,.12);color:#0ecb81;}
  .tab-b{padding:9px 16px;font-size:12px;font-weight:600;background:transparent;border:none;color:#848e9c;border-bottom:2px solid transparent;cursor:pointer;font-family:inherit;white-space:nowrap;transition:all .15s;}
  .tab-b.on{color:#eaecef;border-bottom-color:#f0b90b;}
  .tab-b:hover{color:#eaecef;}
  .al-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .15s;white-space:nowrap;}
  .al-btn.y{background:#f0b90b;color:#0b0e11;}
  .al-btn.y:hover{background:#d4a30a;}
  .al-btn.g{background:#1e2329;color:#848e9c;border:1px solid #2b3139;}
  .al-btn.g:hover{color:#eaecef;}
  .al-search{display:flex;align-items:center;gap:8px;background:#1e2329;border:1px solid #2b3139;border-radius:8px;padding:8px 12px;transition:border .15s;}
  .al-search:focus-within{border-color:#f0b90b;}
  .al-search input{background:transparent;border:none;outline:none;color:#eaecef;font-size:13px;width:100%;font-family:inherit;}
  .al-search input::placeholder{color:#5e6673;}
  .toast{position:fixed;top:16px;right:16px;z-index:9999;padding:11px 18px;border-radius:12px;font-weight:700;font-size:13px;display:flex;align-items:center;gap:8px;box-shadow:0 8px 32px rgba(0,0,0,.5);animation:fadeUp .3s;max-width:320px;}
  .toast.ok{background:#0ecb81;color:#fff;}
  .toast.err{background:#f6465d;color:#fff;}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}
  .spin{animation:spin .8s linear infinite;}
  @media(max-width:768px){
    .al-token{grid-template-columns:1fr 1fr;gap:6px;}
    .al-hd{display:none!important;}
    .al-hide{display:none!important;}
  }
`;

const TOKENS = [
  { symbol:'PEPE2',    name:'PepeCoin 2.0',    price:'$0.00000412', change:'+245%', mc:'$2.1M',  vol:'$890K',  tags:['hot','new'],      chain:'BSC', age:'2h',   contract:'0x5fec...b9d' },
  { symbol:'MOONCAT',  name:'Moon Cat Token',  price:'$0.00142',    change:'+89%',  mc:'$5.4M',  vol:'$1.2M',  tags:['trending'],       chain:'BSC', age:'6h',   contract:'0x3ab2...f1e' },
  { symbol:'SAFEMARS', name:'SafeMars',        price:'$0.0000089',  change:'+56%',  mc:'$890K',  vol:'$340K',  tags:['new'],            chain:'BSC', age:'12h',  contract:'0x7cd1...a4c' },
  { symbol:'DOGE2',    name:'Doge 2.0',        price:'$0.00234',    change:'+34%',  mc:'$8.9M',  vol:'$2.1M',  tags:['trending','hot'], chain:'BSC', age:'1d',   contract:'0x9ef3...b2a' },
  { symbol:'ELON2',    name:'Elon Inu',        price:'$0.00000078', change:'+128%', mc:'$1.2M',  vol:'$560K',  tags:['hot'],            chain:'BSC', age:'3h',   contract:'0x2bc4...d8f' },
  { symbol:'SHIB2',    name:'Shiba 2.0',       price:'$0.0000156',  change:'+67%',  mc:'$4.1M',  vol:'$980K',  tags:['trending'],       chain:'BSC', age:'2d',   contract:'0x6fa7...e3c' },
  { symbol:'FLOKI2',   name:'Floki 2.0',       price:'$0.000234',   change:'+43%',  mc:'$6.7M',  vol:'$1.5M',  tags:['new'],            chain:'BSC', age:'8h',   contract:'0x4de9...a7b' },
  { symbol:'BABYDOGE2',name:'Baby Doge 2.0',   price:'$0.00000023', change:'+89%',  mc:'$890K',  vol:'$430K',  tags:['hot','new'],      chain:'BSC', age:'5h',   contract:'0x1ac6...f5d' },
  { symbol:'AIDOG',    name:'AI Dog Token',    price:'$0.00089',    change:'+312%', mc:'$3.2M',  vol:'$1.8M',  tags:['hot','trending'], chain:'BSC', age:'1h',   contract:'0x8bd2...c4e' },
  { symbol:'GROK2',    name:'GrokAI Coin',     price:'$0.00456',    change:'+78%',  mc:'$7.8M',  vol:'$3.1M',  tags:['trending'],       chain:'BSC', age:'4h',   contract:'0x5ef1...b9a' },
];

const TABS = [
  { k:'all',       l:'All Tokens' },
  { k:'trending',  l:'🔥 Trending' },
  { k:'new',       l:'✨ New Launches' },
  { k:'hot',       l:'⚡ Hot' },
  { k:'favorites', l:'⭐ Favorites' },
];

export default function Alpha() {
  const navigate  = useNavigate();
  const [tab,     setTab]     = useState('trending');
  const [search,  setSearch]  = useState('');
  const [favs,    setFavs]    = useState([]);
  const [loading, setLoading] = useState(false);
  const [tokens,  setTokens]  = useState(TOKENS);
  const [sort,    setSort]    = useState({ key:'change', dir:-1 });
  const [toast,   setToast]   = useState(null);
  const [detailToken, setDetailToken] = useState(null);

  const showToast = (msg, type='ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const refresh = () => {
    setLoading(true);
    setTimeout(() => {
      // Simulate price updates
      setTokens(p => p.map(t => ({
        ...t,
        change: `+${(Math.random()*300+10).toFixed(0)}%`,
      })));
      setLoading(false);
      showToast('Token list refreshed!');
    }, 1200);
  };

  const toggleFav = (e, sym) => {
    e.stopPropagation();
    setFavs(p => p.includes(sym) ? p.filter(s => s !== sym) : [...p, sym]);
    showToast(favs.includes(sym) ? 'Removed from favorites' : 'Added to favorites ⭐');
  };

  const parseChange = (c) => parseFloat(c.replace('%','').replace('+',''));

  const filtered = tokens.filter(t => {
    if (search) return t.symbol.toLowerCase().includes(search.toLowerCase()) || t.name.toLowerCase().includes(search.toLowerCase());
    if (tab === 'favorites') return favs.includes(t.symbol);
    if (tab === 'all') return true;
    return t.tags.includes(tab);
  }).sort((a,b) => {
    if (sort.key === 'change') return (parseChange(a.change) - parseChange(b.change)) * sort.dir;
    return 0;
  });

  return (
    <>
      <style>{css}</style>

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === 'ok' ? '✓' : '✕'} {toast.msg}
        </div>
      )}

      {/* Token Detail Modal */}
      {detailToken && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.85)', backdropFilter:'blur(8px)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
          onClick={() => setDetailToken(null)}>
          <div style={{ background:'#161a1e', border:'1px solid #2b3139', borderRadius:20, padding:24, width:'100%', maxWidth:460 }} onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:48, height:48, borderRadius:'50%', background:`hsl(${detailToken.symbol.length*40},60%,40%)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:800, color:'#fff' }}>
                  {detailToken.symbol[0]}
                </div>
                <div>
                  <p style={{ fontWeight:800, fontSize:16, color:'#eaecef' }}>{detailToken.symbol}</p>
                  <p style={{ fontSize:12, color:'#848e9c' }}>{detailToken.name} · {detailToken.chain}</p>
                </div>
              </div>
              <button onClick={() => setDetailToken(null)} style={{ background:'none', border:'none', color:'#848e9c', cursor:'pointer' }}><X size={18}/></button>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
              {[
                { l:'Price',       v:detailToken.price,  c:'#eaecef' },
                { l:'24h Change',  v:detailToken.change, c:'#0ecb81' },
                { l:'Market Cap',  v:detailToken.mc,     c:'#eaecef' },
                { l:'Volume',      v:detailToken.vol,    c:'#eaecef' },
                { l:'Age',         v:detailToken.age,    c:'#f0b90b' },
                { l:'Chain',       v:detailToken.chain,  c:'#627eea' },
              ].map(({ l, v, c }) => (
                <div key={l} style={{ background:'#0b0e11', borderRadius:10, padding:'10px 12px', border:'1px solid #2b3139' }}>
                  <p style={{ fontSize:10, color:'#5e6673', fontWeight:700, textTransform:'uppercase', marginBottom:4 }}>{l}</p>
                  <p style={{ fontSize:14, fontWeight:700, color:c }}>{v}</p>
                </div>
              ))}
            </div>

            <div style={{ background:'#0b0e11', borderRadius:10, padding:'10px 12px', border:'1px solid #2b3139', marginBottom:16 }}>
              <p style={{ fontSize:10, color:'#5e6673', fontWeight:700, textTransform:'uppercase', marginBottom:4 }}>Contract Address</p>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <code style={{ fontSize:12, color:'#c6cad2', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontFamily:'monospace' }}>{detailToken.contract}</code>
                <button onClick={() => { navigator.clipboard?.writeText(detailToken.contract); showToast('Copied!'); }}
                  style={{ background:'none', border:'none', color:'#f0b90b', cursor:'pointer', fontSize:11, fontWeight:700 }}>Copy</button>
              </div>
            </div>

            <div style={{ background:'rgba(246,70,93,.06)', border:'1px solid rgba(246,70,93,.2)', borderRadius:10, padding:12, marginBottom:16 }}>
              <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
                <AlertCircle size={14} style={{ color:'#f6465d', flexShrink:0, marginTop:1 }}/>
                <p style={{ fontSize:12, color:'#848e9c', lineHeight:1.6 }}>
                  <strong style={{ color:'#f6465d' }}>High Risk:</strong> This is an unaudited token. Always DYOR before investing.
                </p>
              </div>
            </div>

            <div style={{ display:'flex', gap:8 }}>
              <button className="al-btn y" style={{ flex:1, justifyContent:'center' }}
                onClick={() => { setDetailToken(null); navigate('/trade/btc'); }}>
                Trade Now
              </button>
              <button className="al-btn g" style={{ flex:1, justifyContent:'center' }}
                onClick={() => window.open(`https://bscscan.com/token/${detailToken.contract}`, '_blank')}>
                BSCScan <ExternalLink size={12}/>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="al">
        {/* Header */}
        <div style={{ background:'#0b0e11', borderBottom:'1px solid #1e2329', padding:'14px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10, position:'sticky', top:0, zIndex:50 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <button onClick={() => navigate(-1)} style={{ background:'none', border:'none', color:'#848e9c', cursor:'pointer', display:'flex' }}>
              <ChevronDown size={18} style={{ transform:'rotate(90deg)' }}/>
            </button>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <Zap size={22} style={{ color:'#f0b90b' }}/>
              <h1 style={{ fontSize:18, fontWeight:800, color:'#eaecef' }}>Alpha</h1>
              <span style={{ background:'rgba(240,185,11,.12)', color:'#f0b90b', padding:'2px 8px', borderRadius:6, fontSize:10, fontWeight:700 }}>BSC</span>
            </div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <div className="al-search" style={{ width:200 }}>
              <Search size={13} style={{ color:'#5e6673', flexShrink:0 }}/>
              <input placeholder="Search token..." value={search} onChange={e => setSearch(e.target.value)}/>
              {search && <button onClick={() => setSearch('')} style={{ background:'none', border:'none', color:'#848e9c', cursor:'pointer', padding:0 }}><X size={12}/></button>}
            </div>
            <button className="al-btn g" onClick={refresh}>
              <RefreshCw size={13} className={loading ? 'spin' : ''}/> Refresh
            </button>
          </div>
        </div>

        <div style={{ maxWidth:1200, margin:'0 auto', padding:'20px 24px' }}>

          {/* Stats bar */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:12, marginBottom:24 }}>
            {[
              { l:'Listed Tokens', v:TOKENS.length,                          c:'#627eea' },
              { l:'Hot Today',     v:TOKENS.filter(t=>t.tags.includes('hot')).length, c:'#f6465d' },
              { l:'New (24h)',     v:TOKENS.filter(t=>t.tags.includes('new')).length, c:'#f0b90b' },
              { l:'Favorites',    v:favs.length,                             c:'#0ecb81' },
            ].map(s => (
              <div key={s.l} style={{ background:'#161a1e', border:`1px solid #1e2329`, borderTop:`2px solid ${s.c}`, borderRadius:12, padding:'14px 16px' }}>
                <p style={{ fontSize:10, color:'#848e9c', fontWeight:700, textTransform:'uppercase', marginBottom:6 }}>{s.l}</p>
                <p style={{ fontSize:22, fontWeight:800, color:'#eaecef' }}>{s.v}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display:'flex', borderBottom:'1px solid #1e2329', marginBottom:16, overflowX:'auto', scrollbarWidth:'none' }}>
            {TABS.map(t => (
              <button key={t.k} className={`tab-b${tab===t.k?' on':''}`} onClick={() => setTab(t.k)}>{t.l}</button>
            ))}
          </div>

          {/* Table header */}
          <div className="al-hd" style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 70px', gap:8, padding:'8px 16px', fontSize:10, fontWeight:700, color:'#5e6673', textTransform:'uppercase', letterSpacing:'.05em', borderBottom:'1px solid #1e2329', marginBottom:6 }}>
            <span>Token</span>
            <span style={{ textAlign:'right' }}>Price</span>
            <span style={{ textAlign:'right', cursor:'pointer' }} onClick={() => setSort({ key:'change', dir:-sort.dir })}>
              24h Change {sort.key==='change'?sort.dir===-1?'↓':'↑':'↕'}
            </span>
            <span style={{ textAlign:'right' }} className="al-hide">Market Cap</span>
            <span style={{ textAlign:'right' }} className="al-hide">Volume</span>
            <span style={{ textAlign:'right' }}>Age</span>
          </div>

          {/* Token list */}
          {loading ? (
            <div style={{ textAlign:'center', padding:60, color:'#5e6673' }}>
              <RefreshCw size={32} className="spin" style={{ margin:'0 auto 12px', display:'block', color:'#f0b90b' }}/>
              <p style={{ fontSize:13 }}>Fetching latest tokens...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:60, color:'#5e6673' }}>
              <Zap size={40} style={{ opacity:.1, margin:'0 auto 12px', display:'block' }}/>
              <p style={{ fontSize:14, fontWeight:600, color:'#eaecef', marginBottom:6 }}>No tokens found</p>
              <p style={{ fontSize:13 }}>{tab === 'favorites' ? 'Star tokens to add to favorites' : 'Try a different filter'}</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
              {filtered.map((token, i) => (
                <div key={token.symbol} className="al-token" onClick={() => setDetailToken(token)}>
                  {/* Token info */}
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ fontSize:12, color:'#5e6673', minWidth:20 }}>{i+1}</span>
                    <button onClick={e => toggleFav(e, token.symbol)} style={{ background:'none', border:'none', cursor:'pointer', color:favs.includes(token.symbol)?'#f0b90b':'#5e6673', flexShrink:0, padding:0 }}>
                      <Star size={13} style={favs.includes(token.symbol)?{fill:'#f0b90b'}:{}}/>
                    </button>
                    <div style={{ width:32, height:32, borderRadius:'50%', background:`hsl(${token.symbol.length*40},60%,40%)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:'#fff', flexShrink:0 }}>
                      {token.symbol[0]}
                    </div>
                    <div>
                      <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:2, flexWrap:'wrap' }}>
                        <span style={{ color:'#eaecef', fontWeight:700, fontSize:13 }}>{token.symbol}</span>
                        {token.tags.map(tag => (
                          <span key={tag} className={`bdg bdg-${tag}`}>{tag}</span>
                        ))}
                      </div>
                      <span style={{ fontSize:11, color:'#5e6673' }}>{token.name}</span>
                    </div>
                  </div>
                  <div style={{ textAlign:'right', color:'#eaecef', fontFamily:'monospace', fontSize:12, fontWeight:600 }}>{token.price}</div>
                  <div style={{ textAlign:'right', color:'#0ecb81', fontWeight:700, fontSize:12 }}>{token.change}</div>
                  <div style={{ textAlign:'right', color:'#848e9c', fontSize:12 }} className="al-hide">{token.mc}</div>
                  <div style={{ textAlign:'right', color:'#848e9c', fontSize:12 }} className="al-hide">{token.vol}</div>
                  <div style={{ textAlign:'right', color:'#5e6673', fontSize:11 }}>{token.age}</div>
                </div>
              ))}
            </div>
          )}

          {/* Disclaimer */}
          <div style={{ marginTop:24, padding:'14px 16px', background:'rgba(246,70,93,.05)', border:'1px solid rgba(246,70,93,.15)', borderRadius:10, display:'flex', gap:10 }}>
            <AlertCircle size={15} style={{ color:'#f6465d', flexShrink:0, marginTop:2 }}/>
            <p style={{ fontSize:12, color:'#848e9c', lineHeight:1.7 }}>
              <strong style={{ color:'#f6465d' }}>Risk Disclosure:</strong> Alpha tokens are unaudited early-stage tokens with extremely high risk. These tokens may be rugs, scams, or lose all value. Never invest more than you can afford to lose completely.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
