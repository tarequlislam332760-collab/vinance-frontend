import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Zap, Search, Star, RefreshCw, AlertCircle, X, ExternalLink, ChevronDown
} from 'lucide-react';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  .al{font-family:'Inter',sans-serif;background:#0b0e11;color:#eaecef;min-height:100vh;}
  .al *{box-sizing:border-box;margin:0;padding:0;}
  .al ::-webkit-scrollbar{width:4px;height:4px;}
  .al ::-webkit-scrollbar-thumb{background:#2b3139;border-radius:4px;}
  .al-token{background:#161a1e;border:1px solid #1e2329;border-radius:10px;padding:12px 16px;display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr 70px;gap:8px;align-items:center;transition:background .15s;cursor:pointer;}
  .al-token:hover{background:#1a1f25;border-color:#2b3139;}
  .bdg{display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;}
  .bdg-new{background:rgba(240,185,11,.12);color:#f0b90b;}
  .bdg-hot{background:rgba(246,70,93,.12);color:#f6465d;}
  .bdg-trending{background:rgba(14,203,129,.12);color:#0ecb81;}
  .tab-b{padding:9px 16px;font-size:12px;font-weight:600;background:transparent;border:none;color:#848e9c;border-bottom:2px solid transparent;cursor:pointer;font-family:inherit;white-space:nowrap;transition:all .15s;}
  .tab-b.on{color:#eaecef;border-bottom-color:#f0b90b;}
  .tab-b:hover{color:#eaecef;}
  .al-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .15s;}
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
  .al-hd{display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr 70px;gap:8px;padding:8px 16px;font-size:10px;font-weight:700;color:#5e6673;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid #1e2329;}
  @media(max-width:768px){
    .al-token{grid-template-columns:1fr 1fr;gap:6px;}
    .al-hd{display:none!important;}
    .al-hide{display:none!important;}
  }
`;

const TABS = [
  { k:'trending', l:'🔥 Trending' },
  { k:'new',      l:'✨ New' },
  { k:'gainers',  l:'📈 Top Gainers' },
  { k:'all',      l:'All Tokens' },
  { k:'favorites',l:'⭐ Favorites' },
];

/* Format helpers */
const fmtPrice  = v => { const n = parseFloat(v||0); if (!n) return '$0'; if (n < 0.000001) return `$${n.toExponential(2)}`; if (n < 0.01) return `$${n.toFixed(8)}`; if (n < 1) return `$${n.toFixed(4)}`; return `$${n.toFixed(2)}`; };
const fmtChange = v => { const n = parseFloat(v||0); return `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`; };
const fmtVol    = v => { const n = parseFloat(v||0); if (n >= 1e6) return `$${(n/1e6).toFixed(2)}M`; if (n >= 1e3) return `$${(n/1e3).toFixed(1)}K`; return `$${n.toFixed(0)}`; };
const fmtMC     = v => { const n = parseFloat(v||0); if (!n) return '—'; if (n >= 1e6) return `$${(n/1e6).toFixed(2)}M`; if (n >= 1e3) return `$${(n/1e3).toFixed(1)}K`; return `$${n.toFixed(0)}`; };
const fmtAge    = d => {
  if (!d) return '—';
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 3600) return `${Math.floor(s/60)}m`;
  if (s < 86400) return `${Math.floor(s/3600)}h`;
  return `${Math.floor(s/86400)}d`;
};
const getTags = (change, age) => {
  const tags = [];
  const c = parseFloat(change||0);
  const hrs = age ? (Date.now() - new Date(age)) / 3600000 : 999;
  if (hrs < 24) tags.push('new');
  if (c > 50)   tags.push('hot');
  if (c > 20)   tags.push('trending');
  return tags;
};

export default function Alpha() {
  const navigate  = useNavigate();
  const [tab,     setTab]     = useState('trending');
  const [tokens,  setTokens]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [search,  setSearch]  = useState('');
  const [favs,    setFavs]    = useState(() => { try { return JSON.parse(localStorage.getItem('alpha_favs')||'[]'); } catch { return []; } });
  const [sort,    setSort]    = useState({ key:'change', dir:-1 });
  const [toast,   setToast]   = useState(null);
  const [detail,  setDetail]  = useState(null);
  const [page,    setPage]    = useState(1);

  const showToast = (msg, type='ok') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  /* ── Fetch real BSC pools from GeckoTerminal ── */
  const fetchTokens = async (pageNum = 1) => {
    setLoading(true);
    setError('');
    try {
      /* GeckoTerminal free API — no key needed */
      const res = await axios.get(
        `https://api.geckoterminal.com/api/v2/networks/bsc/new_pools?page=${pageNum}`,
        { headers: { Accept: 'application/json;version=20230302' }, timeout: 8000 }
      );
      const pools = res.data?.data || [];
      const mapped = pools.map(pool => {
        const a   = pool.attributes;
        const rel = pool.relationships;
        const baseToken = rel?.base_token?.data;
        return {
          id:       pool.id,
          symbol:   a.name?.split('/')[0]?.trim() || '??',
          name:     a.name || 'Unknown',
          price:    a.base_token_price_usd,
          change:   a.price_change_percentage?.h24 || 0,
          vol:      a.volume_usd?.h24 || 0,
          mc:       a.market_cap_usd,
          age:      a.pool_created_at,
          address:  baseToken?.id?.split('_')[1] || '',
          chain:    'BSC',
          tags:     getTags(a.price_change_percentage?.h24, a.pool_created_at),
          reserves: a.reserve_in_usd,
        };
      });
      setTokens(mapped);
      setPage(pageNum);
    } catch (e) {
      setError('Could not fetch live tokens. GeckoTerminal API may be rate-limited. Retrying...');
      /* Fallback: try trending BSC pools endpoint */
      try {
        const res2 = await axios.get(
          `https://api.geckoterminal.com/api/v2/networks/bsc/trending_pools?page=${pageNum}`,
          { headers: { Accept: 'application/json;version=20230302' }, timeout: 8000 }
        );
        const pools = res2.data?.data || [];
        const mapped = pools.map(pool => {
          const a = pool.attributes;
          return {
            id:     pool.id,
            symbol: a.name?.split('/')[0]?.trim() || '??',
            name:   a.name || 'Unknown',
            price:  a.base_token_price_usd,
            change: a.price_change_percentage?.h24 || 0,
            vol:    a.volume_usd?.h24 || 0,
            mc:     a.market_cap_usd,
            age:    a.pool_created_at,
            address:a.address || '',
            chain:  'BSC',
            tags:   getTags(a.price_change_percentage?.h24, a.pool_created_at),
            reserves: a.reserve_in_usd,
          };
        });
        setTokens(mapped);
        setError('');
      } catch { setError('API rate limited. Please wait 1 minute and refresh.'); }
    }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTokens(1); }, []);

  const toggleFav = (e, id) => {
    e.stopPropagation();
    setFavs(p => {
      const next = p.includes(id) ? p.filter(f => f!==id) : [...p, id];
      try { localStorage.setItem('alpha_favs', JSON.stringify(next)); } catch {}
      return next;
    });
    showToast(favs.includes(id) ? 'Removed from favorites' : 'Added to favorites ⭐');
  };

  const parseChange = c => parseFloat(c || 0);

  const filtered = tokens.filter(t => {
    const q = search.toLowerCase();
    if (q) return t.symbol?.toLowerCase().includes(q) || t.name?.toLowerCase().includes(q);
    if (tab === 'favorites') return favs.includes(t.id);
    if (tab === 'new')       return fmtAge(t.age).includes('h') || fmtAge(t.age).includes('m');
    if (tab === 'hot')       return t.tags.includes('hot');
    if (tab === 'trending')  return t.tags.includes('trending') || t.tags.includes('hot') || parseChange(t.change) > 0;
    if (tab === 'gainers')   return parseChange(t.change) > 10;
    return true; /* all */
  }).sort((a, b) => {
    if (sort.key === 'change') return (parseChange(a.change) - parseChange(b.change)) * sort.dir;
    if (sort.key === 'vol')    return (parseFloat(a.vol||0) - parseFloat(b.vol||0)) * sort.dir;
    return 0;
  });

  return (
    <>
      <style>{css}</style>

      {toast && (
        <div className={`toast ${toast.type}`}>{toast.type==='ok'?'✓':'✕'} {toast.msg}</div>
      )}

      {/* Detail modal */}
      {detail && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.85)', backdropFilter:'blur(8px)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
          onClick={() => setDetail(null)}>
          <div style={{ background:'#161a1e', border:'1px solid #2b3139', borderRadius:20, padding:24, width:'100%', maxWidth:460 }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:48, height:48, borderRadius:'50%', background:`hsl(${detail.symbol?.charCodeAt(0)*40||0},60%,40%)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:800, color:'#fff' }}>
                  {detail.symbol?.[0]}
                </div>
                <div>
                  <p style={{ fontWeight:800, fontSize:16, color:'#eaecef' }}>{detail.symbol}</p>
                  <p style={{ fontSize:12, color:'#848e9c' }}>{detail.name} · {detail.chain}</p>
                </div>
              </div>
              <button onClick={()=>setDetail(null)} style={{ background:'none', border:'none', color:'#848e9c', cursor:'pointer' }}><X size={18}/></button>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
              {[
                { l:'Price',      v:fmtPrice(detail.price),   c:'#eaecef' },
                { l:'24h Change', v:fmtChange(detail.change), c:parseChange(detail.change)>=0?'#0ecb81':'#f6465d' },
                { l:'Volume 24h', v:fmtVol(detail.vol),       c:'#eaecef' },
                { l:'Market Cap', v:fmtMC(detail.mc),         c:'#eaecef' },
                { l:'Age',        v:fmtAge(detail.age),       c:'#f0b90b' },
                { l:'Liquidity',  v:fmtVol(detail.reserves),  c:'#627eea' },
              ].map(({ l,v,c }) => (
                <div key={l} style={{ background:'#0b0e11', borderRadius:10, padding:'10px 12px', border:'1px solid #2b3139' }}>
                  <p style={{ fontSize:10, color:'#5e6673', fontWeight:700, textTransform:'uppercase', marginBottom:4 }}>{l}</p>
                  <p style={{ fontSize:14, fontWeight:700, color:c }}>{v}</p>
                </div>
              ))}
            </div>

            {detail.address && (
              <div style={{ background:'#0b0e11', borderRadius:10, padding:'10px 12px', border:'1px solid #2b3139', marginBottom:16 }}>
                <p style={{ fontSize:10, color:'#5e6673', fontWeight:700, textTransform:'uppercase', marginBottom:4 }}>Contract</p>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <code style={{ fontSize:11, color:'#c6cad2', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontFamily:'monospace' }}>
                    {detail.address}
                  </code>
                  <button onClick={()=>{ navigator.clipboard?.writeText(detail.address); showToast('Copied!'); }}
                    style={{ background:'none', border:'none', color:'#f0b90b', cursor:'pointer', fontSize:11, fontWeight:700, flexShrink:0 }}>Copy</button>
                </div>
              </div>
            )}

            <div style={{ background:'rgba(246,70,93,.06)', border:'1px solid rgba(246,70,93,.2)', borderRadius:10, padding:12, marginBottom:16 }}>
              <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
                <AlertCircle size={14} style={{ color:'#f6465d', flexShrink:0, marginTop:1 }}/>
                <p style={{ fontSize:12, color:'#848e9c', lineHeight:1.6 }}>
                  <strong style={{ color:'#f6465d' }}>High Risk:</strong> Unaudited early-stage token. Always DYOR before investing.
                </p>
              </div>
            </div>

            <div style={{ display:'flex', gap:8 }}>
              <button className="al-btn y" style={{ flex:1, justifyContent:'center' }} onClick={() => { setDetail(null); navigate('/trade/btc'); }}>
                Trade Now
              </button>
              {detail.address && (
                <button className="al-btn g" style={{ flex:1, justifyContent:'center' }}
                  onClick={() => window.open(`https://bscscan.com/token/${detail.address}`, '_blank')}>
                  BSCScan <ExternalLink size={12}/>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="al">
        {/* Header */}
        <div style={{ background:'#0b0e11', borderBottom:'1px solid #1e2329', padding:'14px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10, position:'sticky', top:0, zIndex:50 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <button onClick={()=>navigate(-1)} style={{ background:'none', border:'none', color:'#848e9c', cursor:'pointer', display:'flex' }}>
              <ChevronDown size={18} style={{ transform:'rotate(90deg)' }}/>
            </button>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <Zap size={22} style={{ color:'#f0b90b' }}/>
              <h1 style={{ fontSize:18, fontWeight:800, color:'#eaecef' }}>Alpha</h1>
              <span style={{ background:'rgba(240,185,11,.12)', color:'#f0b90b', padding:'2px 8px', borderRadius:6, fontSize:10, fontWeight:700 }}>BSC • Live</span>
            </div>
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <div className="al-search" style={{ width:180 }}>
              <Search size={13} style={{ color:'#5e6673', flexShrink:0 }}/>
              <input placeholder="Search token..." value={search} onChange={e=>setSearch(e.target.value)}/>
              {search && <button onClick={()=>setSearch('')} style={{ background:'none', border:'none', color:'#848e9c', cursor:'pointer', padding:0 }}><X size={12}/></button>}
            </div>
            <button className="al-btn g" onClick={()=>fetchTokens(page)}>
              <RefreshCw size={13} className={loading?'spin':''}/> Refresh
            </button>
          </div>
        </div>

        <div style={{ maxWidth:1200, margin:'0 auto', padding:'20px 24px' }}>

          {/* Stats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:12, marginBottom:24 }}>
            {[
              { l:'Live Tokens',  v:tokens.length,                                          c:'#627eea' },
              { l:'Hot (>50%)',   v:tokens.filter(t=>parseChange(t.change)>50).length,      c:'#f6465d' },
              { l:'New (<24h)',   v:tokens.filter(t=>{ const a=fmtAge(t.age); return a.includes('h')||a.includes('m'); }).length, c:'#f0b90b' },
              { l:'Favorites',   v:favs.length,                                              c:'#0ecb81' },
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
              <button key={t.k} className={`tab-b${tab===t.k?' on':''}`} onClick={()=>setTab(t.k)}>{t.l}</button>
            ))}
          </div>

          {/* Source label */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <p style={{ fontSize:11, color:'#5e6673' }}>
              Source: <span style={{ color:'#627eea' }}>GeckoTerminal BSC</span> · {tokens.length} pools loaded · Live data
            </p>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={()=>{ if(page>1) fetchTokens(page-1); }} disabled={page<=1}
                style={{ padding:'4px 10px', background:'#2b3139', border:'none', borderRadius:6, color:page<=1?'#5e6673':'#eaecef', cursor:page<=1?'not-allowed':'pointer', fontSize:12, fontFamily:'inherit' }}>← Prev</button>
              <span style={{ fontSize:12, color:'#848e9c', padding:'4px 8px' }}>Page {page}</span>
              <button onClick={()=>fetchTokens(page+1)}
                style={{ padding:'4px 10px', background:'#2b3139', border:'none', borderRadius:6, color:'#eaecef', cursor:'pointer', fontSize:12, fontFamily:'inherit' }}>Next →</button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background:'rgba(246,70,93,.08)', border:'1px solid rgba(246,70,93,.2)', borderRadius:10, padding:'12px 16px', marginBottom:16, display:'flex', gap:10, alignItems:'center' }}>
              <AlertCircle size={15} style={{ color:'#f6465d', flexShrink:0 }}/>
              <p style={{ fontSize:13, color:'#848e9c' }}>{error}</p>
            </div>
          )}

          {/* Table header */}
          <div className="al-hd">
            <span>Token</span>
            <span style={{ textAlign:'right' }}>Price</span>
            <span style={{ textAlign:'right', cursor:'pointer' }} onClick={()=>setSort(s=>({key:'change',dir:-s.dir}))}>
              24h {sort.key==='change'?sort.dir===-1?'↓':'↑':'↕'}
            </span>
            <span style={{ textAlign:'right', cursor:'pointer' }} onClick={()=>setSort(s=>({key:'vol',dir:-s.dir}))}>
              Volume {sort.key==='vol'?sort.dir===-1?'↓':'↑':'↕'}
            </span>
            <span style={{ textAlign:'right' }} className="al-hide">Mkt Cap</span>
            <span style={{ textAlign:'right' }}>Age</span>
          </div>

          {/* Token list */}
          {loading ? (
            <div style={{ textAlign:'center', padding:60, color:'#5e6673' }}>
              <RefreshCw size={32} className="spin" style={{ margin:'0 auto 12px', display:'block', color:'#f0b90b' }}/>
              <p style={{ fontSize:13 }}>Fetching live BSC tokens from GeckoTerminal...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:60, color:'#5e6673' }}>
              <Zap size={40} style={{ opacity:.1, margin:'0 auto 12px', display:'block' }}/>
              <p style={{ fontSize:14, fontWeight:600, color:'#eaecef', marginBottom:6 }}>No tokens found</p>
              <p style={{ fontSize:13 }}>{tab==='favorites' ? 'Star tokens to save favorites' : 'Try a different filter'}</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
              {filtered.map((token, i) => {
                const change = parseChange(token.change);
                const isFav  = favs.includes(token.id);
                return (
                  <div key={token.id} className="al-token" onClick={()=>setDetail(token)}>
                    {/* Token info */}
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <span style={{ fontSize:11, color:'#5e6673', minWidth:20 }}>{i+1}</span>
                      <button onClick={e=>toggleFav(e,token.id)} style={{ background:'none', border:'none', cursor:'pointer', color:isFav?'#f0b90b':'#5e6673', flexShrink:0, padding:0 }}>
                        <Star size={13} style={isFav?{fill:'#f0b90b'}:{}}/>
                      </button>
                      <div style={{ width:32, height:32, borderRadius:'50%', background:`hsl(${token.symbol?.charCodeAt(0)*40||0},60%,40%)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:'#fff', flexShrink:0 }}>
                        {token.symbol?.[0] || '?'}
                      </div>
                      <div>
                        <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:2, flexWrap:'wrap' }}>
                          <span style={{ color:'#eaecef', fontWeight:700, fontSize:13 }}>{token.symbol}</span>
                          {token.tags.map(tag => (
                            <span key={tag} className={`bdg bdg-${tag}`}>{tag}</span>
                          ))}
                        </div>
                        <span style={{ fontSize:10, color:'#5e6673', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:120, display:'block' }}>{token.name}</span>
                      </div>
                    </div>
                    <div style={{ textAlign:'right', color:'#eaecef', fontFamily:'monospace', fontSize:12, fontWeight:600 }}>{fmtPrice(token.price)}</div>
                    <div style={{ textAlign:'right', color:change>=0?'#0ecb81':'#f6465d', fontWeight:700, fontSize:12 }}>{fmtChange(token.change)}</div>
                    <div style={{ textAlign:'right', color:'#848e9c', fontSize:12 }}>{fmtVol(token.vol)}</div>
                    <div style={{ textAlign:'right', color:'#848e9c', fontSize:12 }} className="al-hide">{fmtMC(token.mc)}</div>
                    <div style={{ textAlign:'right', color:'#5e6673', fontSize:11 }}>{fmtAge(token.age)}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Disclaimer */}
          <div style={{ marginTop:24, padding:'14px 16px', background:'rgba(246,70,93,.05)', border:'1px solid rgba(246,70,93,.15)', borderRadius:10, display:'flex', gap:10 }}>
            <AlertCircle size={15} style={{ color:'#f6465d', flexShrink:0, marginTop:2 }}/>
            <p style={{ fontSize:12, color:'#848e9c', lineHeight:1.7 }}>
              <strong style={{ color:'#f6465d' }}>Risk Disclosure:</strong> Alpha tokens are unaudited early-stage tokens. Data sourced from GeckoTerminal (live). Never invest more than you can afford to lose.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
