import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import {
  Zap, Search, Star, RefreshCw, ChevronLeft,
  AlertCircle, Loader2
} from 'lucide-react';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  .al{font-family:'Inter',sans-serif;background:#0b0e11;color:#eaecef;min-height:100vh;}
  .al *{box-sizing:border-box;margin:0;padding:0;}
  .al ::-webkit-scrollbar{width:4px;height:4px;}
  .al ::-webkit-scrollbar-thumb{background:#2b3139;border-radius:4px;}
  .al-card{background:#161a1e;border:1px solid #1e2329;border-radius:14px;padding:16px 20px;transition:all .15s;}
  .al-card:hover{border-color:#2b3139;background:#1a1f26;}
  .al-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border:none;border-radius:9px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .15s;white-space:nowrap;}
  .al-btn.d{background:#1e2329;color:#848e9c;border:1px solid #2b3139;}
  .al-btn.d:hover{color:#eaecef;}
  .al-tab{padding:9px 16px;font-size:12px;font-weight:600;background:transparent;border:none;color:#848e9c;cursor:pointer;border-bottom:2px solid transparent;white-space:nowrap;font-family:inherit;transition:all .15s;}
  .al-tab.on{color:#eaecef;border-bottom-color:#f0b90b;}
  .al-tab:hover{color:#eaecef;}
  .badge{display:inline-flex;align-items:center;gap:3px;padding:2px 7px;border-radius:8px;font-size:10px;font-weight:700;}
  .badge-new{background:rgba(240,185,11,.12);color:#f0b90b;}
  .badge-hot{background:rgba(246,70,93,.12);color:#f6465d;}
  .badge-trending{background:rgba(14,203,129,.12);color:#0ecb81;}
  .token-row{display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr 70px;gap:8px;align-items:center;padding:12px 16px;border-bottom:1px solid #1e232940;transition:background .15s;cursor:pointer;}
  .token-row:hover{background:rgba(255,255,255,.02);}
  @keyframes spin{to{transform:rotate(360deg)}}
  .spin{animation:spin .8s linear infinite;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
  .fade{animation:fadeUp .2s;}
  @media(max-width:768px){
    .token-row{grid-template-columns:2fr 1fr 1fr;}
    .hide-m{display:none!important;}
    .al-head-grid{grid-template-columns:2fr 1fr 1fr!important;}
  }
`;

const SEED_TOKENS = [
  { symbol:'PEPE2',    name:'PepeCoin 2.0',   price:0.00000412, change:245,  mc:'$2.1M',  vol:'$890K',  chain:'BSC', age:'2h',  tags:['hot','new']      },
  { symbol:'MOONCAT',  name:'Moon Cat',       price:0.00142,    change:89,   mc:'$5.4M',  vol:'$1.2M',  chain:'BSC', age:'6h',  tags:['trending']       },
  { symbol:'SAFEMARS', name:'SafeMars',       price:0.0000089,  change:56,   mc:'$890K',  vol:'$340K',  chain:'BSC', age:'12h', tags:['new']            },
  { symbol:'DOGE2',    name:'Doge 2.0',       price:0.00234,    change:34,   mc:'$8.9M',  vol:'$2.1M',  chain:'BSC', age:'1d',  tags:['trending','hot'] },
  { symbol:'ELON2',    name:'Elon Inu',       price:0.00000078, change:128,  mc:'$1.2M',  vol:'$560K',  chain:'BSC', age:'3h',  tags:['hot']            },
  { symbol:'SHIB2',    name:'Shiba 2.0',      price:0.0000156,  change:67,   mc:'$4.1M',  vol:'$980K',  chain:'BSC', age:'2d',  tags:['trending']       },
  { symbol:'FLOKI2',   name:'Floki 2.0',      price:0.000234,   change:43,   mc:'$6.7M',  vol:'$1.5M',  chain:'BSC', age:'8h',  tags:['new']            },
  { symbol:'BABYDOGE2',name:'Baby Doge 2.0',  price:0.00000023, change:89,   mc:'$890K',  vol:'$430K',  chain:'BSC', age:'5h',  tags:['hot','new']      },
  { symbol:'CATFISH',  name:'CatFish Token',  price:0.0000078,  change:-12,  mc:'$340K',  vol:'$89K',   chain:'BSC', age:'18h', tags:[]                 },
  { symbol:'MOONBNB',  name:'Moon BNB',       price:0.00567,    change:156,  mc:'$3.2M',  vol:'$780K',  chain:'BSC', age:'4h',  tags:['hot','trending'] },
  { symbol:'ALPHADOG', name:'Alpha Dog',      price:0.0000341,  change:234,  mc:'$1.8M',  vol:'$450K',  chain:'BSC', age:'7h',  tags:['new','hot']      },
  { symbol:'GREENBTC', name:'Green Bitcoin',  price:0.00123,    change:78,   mc:'$7.8M',  vol:'$2.3M',  chain:'BSC', age:'3d',  tags:['trending']       },
];

const fmtPrice = (p) => {
  if (p >= 1)    return `$${p.toFixed(2)}`;
  if (p >= 0.01) return `$${p.toFixed(4)}`;
  return `$${p.toFixed(8)}`;
};

export default function Alpha() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [tab,     setTab]     = useState('trending');
  const [search,  setSearch]  = useState('');
  const [favs,    setFavs]    = useState([]);
  const [tokens,  setTokens]  = useState(SEED_TOKENS);
  const [loading, setLoading] = useState(false);
  const [sort,    setSort]    = useState({ k: 'change', d: -1 });

  /* Simulate live price updates */
  useEffect(() => {
    const iv = setInterval(() => {
      setTokens(p => p.map(t => ({
        ...t,
        price:  t.price  * (1 + (Math.random() - 0.5) * 0.02),
        change: +(t.change + (Math.random() - 0.5) * 2).toFixed(2),
      })));
    }, 4000);
    return () => clearInterval(iv);
  }, []);

  const refresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 800);
  };

  const toggleFav = (e, sym) => {
    e.stopPropagation();
    setFavs(p => p.includes(sym) ? p.filter(s => s !== sym) : [...p, sym]);
  };

  const toggleSort = (k) => setSort(s => s.k === k ? { k, d: -s.d } : { k, d: -1 });

  const filtered = tokens.filter(t => {
    const q = search.toLowerCase();
    if (search && !t.symbol.toLowerCase().includes(q) && !t.name.toLowerCase().includes(q)) return false;
    if (tab === 'trending')  return t.tags.includes('trending');
    if (tab === 'new')       return t.tags.includes('new');
    if (tab === 'hot')       return t.tags.includes('hot');
    if (tab === 'favorites') return favs.includes(t.symbol);
    return true;
  }).sort((a, b) => {
    if (sort.k === 'change') return (a.change - b.change) * sort.d;
    if (sort.k === 'price')  return (a.price  - b.price)  * sort.d;
    return a.symbol.localeCompare(b.symbol) * sort.d;
  });

  const SortIcon = ({ k }) => sort.k !== k
    ? <span style={{ color:'#5e6673', fontSize:9, marginLeft:2 }}>↕</span>
    : <span style={{ color:'#f0b90b', fontSize:9, marginLeft:2 }}>{sort.d === 1 ? '↑' : '↓'}</span>;

  return (
    <>
      <style>{css}</style>
      <div className="al">

        {/* Header */}
        <div style={{ background:'#0b0e11', borderBottom:'1px solid #1e2329', padding:'14px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap', position:'sticky', top:0, zIndex:50 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <button onClick={() => navigate(-1)} style={{ background:'none', border:'none', color:'#848e9c', cursor:'pointer', display:'flex' }}>
              <ChevronLeft size={20} />
            </button>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <Zap size={22} style={{ color:'#f0b90b' }} />
              <h1 style={{ fontSize:18, fontWeight:800, color:'#eaecef' }}>Alpha</h1>
              <span style={{ background:'rgba(240,185,11,.12)', color:'#f0b90b', padding:'2px 8px', borderRadius:6, fontSize:10, fontWeight:700 }}>BSC</span>
            </div>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <div style={{ display:'flex', alignItems:'center', gap:7, background:'#161a1e', border:'1px solid #2b3139', borderRadius:8, padding:'7px 12px' }}>
              <Search size={13} style={{ color:'#5e6673', flexShrink:0 }} />
              <input type="text" placeholder="Search tokens..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ background:'transparent', border:'none', outline:'none', color:'#eaecef', fontSize:13, width:130, fontFamily:'inherit' }} />
              {search && (
                <button onClick={() => setSearch('')} style={{ background:'none', border:'none', color:'#848e9c', cursor:'pointer', padding:0 }}>&#x2715;</button>
              )}
            </div>
            <button className="al-btn d" onClick={refresh} style={{ padding:'7px 10px' }}>
              <RefreshCw size={13} className={loading ? 'spin' : ''} />
            </button>
          </div>
        </div>

        <div style={{ maxWidth:1200, margin:'0 auto', padding:'20px' }}>

          {/* Stats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:12, marginBottom:24 }}>
            {[
              { l:'Listed Tokens', v:tokens.length,                                        c:'#627eea' },
              { l:'New Today',     v:tokens.filter(t => t.tags.includes('new')).length,    c:'#f0b90b' },
              { l:'Hot',           v:tokens.filter(t => t.tags.includes('hot')).length,    c:'#f6465d' },
              { l:'Trending',      v:tokens.filter(t => t.tags.includes('trending')).length,c:'#0ecb81'},
            ].map(s => (
              <div key={s.l} className="al-card" style={{ borderTop:`2px solid ${s.c}`, textAlign:'center' }}>
                <div style={{ fontSize:22, fontWeight:800, color:s.c, marginBottom:4 }}>{s.v}</div>
                <div style={{ fontSize:10, color:'#848e9c', fontWeight:700, textTransform:'uppercase' }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display:'flex', borderBottom:'1px solid #1e2329', marginBottom:0, overflowX:'auto', scrollbarWidth:'none' }}>
            {[
              { k:'all',       l:'All Tokens'  },
              { k:'trending',  l:'🔥 Trending' },
              { k:'new',       l:'✨ New'       },
              { k:'hot',       l:'⚡ Hot'       },
              { k:'favorites', l:'⭐ Favorites' },
            ].map(t => (
              <button key={t.k} className={`al-tab${tab === t.k ? ' on' : ''}`} onClick={() => setTab(t.k)}>{t.l}</button>
            ))}
          </div>

          {/* Table */}
          <div style={{ background:'#161a1e', borderRadius:'0 0 14px 14px', border:'1px solid #1e2329', borderTop:'none', overflow:'hidden' }}>
            <div className="token-row al-head-grid" style={{ background:'#0b0e11', cursor:'default', fontSize:10, fontWeight:700, color:'#5e6673', textTransform:'uppercase', letterSpacing:'.05em', borderBottom:'1px solid #1e2329' }}>
              <span>Token</span>
              <span style={{ textAlign:'right', cursor:'pointer' }} onClick={() => toggleSort('price')}>Price <SortIcon k="price" /></span>
              <span style={{ textAlign:'right', cursor:'pointer' }} onClick={() => toggleSort('change')}>24h % <SortIcon k="change" /></span>
              <span style={{ textAlign:'right' }} className="hide-m">Market Cap</span>
              <span style={{ textAlign:'right' }} className="hide-m">Volume</span>
              <span style={{ textAlign:'right' }}>Age</span>
            </div>

            {loading ? (
              <div style={{ textAlign:'center', padding:40 }}>
                <Loader2 size={24} style={{ color:'#f0b90b', animation:'spin .8s linear infinite' }} />
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign:'center', padding:40, color:'#5e6673', fontSize:13 }}>No tokens found</div>
            ) : filtered.map((token, i) => (
              <div key={token.symbol} className="token-row fade">
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <button onClick={e => toggleFav(e, token.symbol)}
                    style={{ background:'none', border:'none', cursor:'pointer', color:favs.includes(token.symbol) ? '#f0b90b' : '#5e6673', flexShrink:0, padding:2 }}>
                    <Star size={13} style={favs.includes(token.symbol) ? { fill:'#f0b90b' } : {}} />
                  </button>
                  <div style={{ width:34, height:34, borderRadius:'50%', background:`hsl(${token.symbol.length * 37 + i * 20},55%,38%)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:'#fff', flexShrink:0 }}>
                    {token.symbol[0]}
                  </div>
                  <div style={{ minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:5, flexWrap:'wrap' }}>
                      <span style={{ color:'#eaecef', fontWeight:700, fontSize:13 }}>{token.symbol}</span>
                      {token.tags.map(tag => (
                        <span key={tag} className={`badge badge-${tag}`}>{tag}</span>
                      ))}
                    </div>
                    <div style={{ fontSize:11, color:'#848e9c', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {token.name} · {token.chain}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign:'right', fontFamily:'monospace', fontSize:12, color:'#eaecef', fontWeight:600 }}>
                  {fmtPrice(token.price)}
                </div>
                <div style={{ textAlign:'right', fontWeight:700, fontSize:12, color:token.change >= 0 ? '#0ecb81' : '#f6465d' }}>
                  {token.change >= 0 ? '+' : ''}{token.change.toFixed(2)}%
                </div>
                <div style={{ textAlign:'right', color:'#848e9c', fontSize:12 }} className="hide-m">{token.mc}</div>
                <div style={{ textAlign:'right', color:'#848e9c', fontSize:12 }} className="hide-m">{token.vol}</div>
                <div style={{ textAlign:'right', color:'#5e6673', fontSize:11 }}>{token.age}</div>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <div style={{ marginTop:20, padding:'12px 16px', background:'rgba(246,70,93,.05)', border:'1px solid rgba(246,70,93,.2)', borderRadius:10, display:'flex', gap:10, alignItems:'flex-start' }}>
            <AlertCircle size={14} style={{ color:'#f6465d', flexShrink:0, marginTop:2 }} />
            <p style={{ fontSize:11, color:'#848e9c', lineHeight:1.6 }}>
              <strong style={{ color:'#f6465d' }}>High Risk Warning:</strong> Alpha tokens are early-stage and extremely volatile. Always DYOR before investing. Never invest more than you can afford to lose.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
