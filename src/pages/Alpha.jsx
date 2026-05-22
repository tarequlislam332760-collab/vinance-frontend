import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, TrendingUp, Star, Search, ExternalLink, Filter, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  .alpha{font-family:'Inter',sans-serif;background:#0b0e11;color:#eaecef;min-height:100vh;padding:24px;}
  .alpha *{box-sizing:border-box;}
  .token-card{background:#161a1e;border:1px solid #1e2329;border-radius:12px;padding:16px 20px;transition:all .15s;cursor:pointer;}
  .token-card:hover{border-color:#2b3139;background:#1a1f25;}
  .badge{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;}
  .badge-new{background:rgba(240,185,11,.12);color:#f0b90b;}
  .badge-hot{background:rgba(246,70,93,.12);color:#f6465d;}
  .badge-trending{background:rgba(14,203,129,.12);color:#0ecb81;}
  .tab-btn{padding:8px 16px;font-size:12px;font-weight:600;background:transparent;border:none;color:#848e9c;border-bottom:2px solid transparent;cursor:pointer;font-family:inherit;white-space:nowrap;transition:all .15s;}
  .tab-btn.on{color:#eaecef;border-bottom-color:#f0b90b;}
  @keyframes spin{to{transform:rotate(360deg)}}
  .spin{animation:spin .8s linear infinite}
`;

const TOKENS = [
  { symbol:'PEPE2',   name:'PepeCoin 2.0',    price:'$0.00000412', change:'+245%', mc:'$2.1M',  vol:'$890K',  tags:['hot','new'],      chain:'BSC', age:'2h'   },
  { symbol:'MOONCAT', name:'Moon Cat Token',  price:'$0.00142',    change:'+89%',  mc:'$5.4M',  vol:'$1.2M',  tags:['trending'],       chain:'BSC', age:'6h'   },
  { symbol:'SAFEMARS',name:'SafeMars',         price:'$0.0000089',  change:'+56%',  mc:'$890K',  vol:'$340K',  tags:['new'],            chain:'BSC', age:'12h'  },
  { symbol:'DOGE2',   name:'Doge 2.0',        price:'$0.00234',    change:'+34%',  mc:'$8.9M',  vol:'$2.1M',  tags:['trending','hot'], chain:'BSC', age:'1d'   },
  { symbol:'ELON2',   name:'Elon Inu',        price:'$0.00000078', change:'+128%', mc:'$1.2M',  vol:'$560K',  tags:['hot'],            chain:'BSC', age:'3h'   },
  { symbol:'SHIB2',   name:'Shiba 2.0',       price:'$0.0000156',  change:'+67%',  mc:'$4.1M',  vol:'$980K',  tags:['trending'],       chain:'BSC', age:'2d'   },
  { symbol:'FLOKI2',  name:'Floki 2.0',       price:'$0.000234',   change:'+43%',  mc:'$6.7M',  vol:'$1.5M',  tags:['new'],            chain:'BSC', age:'8h'   },
  { symbol:'BABYDOGE2',name:'Baby Doge 2.0',  price:'$0.00000023', change:'+89%',  mc:'$890K',  vol:'$430K',  tags:['hot','new'],      chain:'BSC', age:'5h'   },
];

export default function Alpha() {
  const [tab,     setTab]     = useState('trending');
  const [search,  setSearch]  = useState('');
  const [favs,    setFavs]    = useState([]);
  const [tokens,  setTokens]  = useState(TOKENS);
  const [loading, setLoading] = useState(false);

  const refresh = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); toast.success('Token list refreshed'); }, 1000);
  };

  const filtered = tokens.filter(t => {
    const matchSearch = !search || t.symbol.toLowerCase().includes(search.toLowerCase()) || t.name.toLowerCase().includes(search.toLowerCase());
    const matchTab = tab === 'trending' ? t.tags.includes('trending')
      : tab === 'new' ? t.tags.includes('new')
      : tab === 'hot' ? t.tags.includes('hot')
      : tab === 'favorites' ? favs.includes(t.symbol)
      : true;
    return matchSearch && matchTab;
  });

  const toggleFav = (e, sym) => {
    e.stopPropagation();
    setFavs(p => p.includes(sym) ? p.filter(s => s !== sym) : [...p, sym]);
  };

  return (
    <>
      <style>{css}</style>
      <div className="alpha">
        <div style={{ maxWidth:1200, margin:'0 auto' }}>

          {/* Header */}
          <div style={{ marginBottom:24 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
              <Zap size={28} style={{ color:'#f0b90b' }}/>
              <h1 style={{ fontSize:28, fontWeight:800, color:'#eaecef' }}>Alpha</h1>
              <span style={{ background:'rgba(240,185,11,.12)', color:'#f0b90b', padding:'2px 8px', borderRadius:6, fontSize:10, fontWeight:700 }}>BSC</span>
            </div>
            <p style={{ color:'#848e9c', fontSize:13 }}>Discover early-stage tokens on BNB Chain before they pump</p>
          </div>

          {/* Search + Refresh */}
          <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' }}>
            <div style={{ flex:1, minWidth:200, display:'flex', alignItems:'center', gap:8, background:'#1e2329', border:'1px solid #2b3139', borderRadius:8, padding:'8px 12px' }}>
              <Search size={14} style={{ color:'#5e6673', flexShrink:0 }}/>
              <input type="text" placeholder="Search tokens..." value={search} onChange={e=>setSearch(e.target.value)}
                style={{ background:'transparent', border:'none', outline:'none', color:'#eaecef', fontSize:13, width:'100%', fontFamily:'inherit' }}/>
            </div>
            <button onClick={refresh} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', background:'#1e2329', border:'1px solid #2b3139', borderRadius:8, color:'#848e9c', cursor:'pointer', fontSize:12, fontFamily:'inherit' }}>
              <RefreshCw size={14} className={loading?'spin':''}/>
              Refresh
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display:'flex', borderBottom:'1px solid #1e2329', marginBottom:20, overflowX:'auto', scrollbarWidth:'none' }}>
            {[{k:'all',l:'All'},{k:'trending',l:'🔥 Trending'},{k:'new',l:'✨ New'},{k:'hot',l:'⚡ Hot'},{k:'favorites',l:'⭐ Favorites'}].map(t => (
              <button key={t.k} className={`tab-btn${tab===t.k?' on':''}`} onClick={()=>setTab(t.k)}>{t.l}</button>
            ))}
          </div>

          {/* Table Header */}
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 80px', gap:8, padding:'8px 16px', fontSize:10, fontWeight:700, color:'#5e6673', textTransform:'uppercase', letterSpacing:'.05em', borderBottom:'1px solid #1e2329', marginBottom:4 }}>
            <span>Token</span><span style={{textAlign:'right'}}>Price</span><span style={{textAlign:'right'}}>24h Change</span><span style={{textAlign:'right'}}>Market Cap</span><span style={{textAlign:'right'}}>Volume</span><span style={{textAlign:'right'}}>Age</span>
          </div>

          {/* Token List */}
          {filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:'40px 0', color:'#5e6673', fontSize:13 }}>
              No tokens found
            </div>
          ) : filtered.map(token => (
            <div key={token.symbol} className="token-card" style={{ marginBottom:4, display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 80px', gap:8, alignItems:'center' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <button onClick={e=>toggleFav(e,token.symbol)} style={{ background:'none', border:'none', cursor:'pointer', color:favs.includes(token.symbol)?'#f0b90b':'#5e6673', flexShrink:0 }}>
                  <Star size={13} style={favs.includes(token.symbol)?{fill:'#f0b90b'}:{}}/>
                </button>
                <div style={{ width:32, height:32, borderRadius:'50%', background:`hsl(${token.symbol.length*40},60%,40%)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:'#fff', flexShrink:0 }}>{token.symbol[0]}</div>
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:2 }}>
                    <span style={{ color:'#eaecef', fontWeight:700, fontSize:13 }}>{token.symbol}</span>
                    {token.tags.map(tag => (
                      <span key={tag} className={`badge badge-${tag}`}>{tag}</span>
                    ))}
                  </div>
                  <div style={{ fontSize:11, color:'#848e9c' }}>{token.name} • {token.chain}</div>
                </div>
              </div>
              <div style={{ textAlign:'right', color:'#eaecef', fontFamily:'monospace', fontSize:12 }}>{token.price}</div>
              <div style={{ textAlign:'right', color:token.change.startsWith('+')?'#0ecb81':'#f6465d', fontWeight:700, fontSize:12 }}>{token.change}</div>
              <div style={{ textAlign:'right', color:'#848e9c', fontSize:12 }}>{token.mc}</div>
              <div style={{ textAlign:'right', color:'#848e9c', fontSize:12 }}>{token.vol}</div>
              <div style={{ textAlign:'right', color:'#5e6673', fontSize:11 }}>{token.age}</div>
            </div>
          ))}

          {/* Disclaimer */}
          <div style={{ marginTop:24, padding:'12px 16px', background:'rgba(240,185,11,.05)', border:'1px solid rgba(240,185,11,.15)', borderRadius:8, display:'flex', gap:10, alignItems:'flex-start' }}>
            <Zap size={14} style={{ color:'#f0b90b', flexShrink:0, marginTop:2 }}/>
            <p style={{ fontSize:11, color:'#848e9c', lineHeight:1.6 }}>
              <strong style={{ color:'#f0b90b' }}>Alpha tokens are high-risk investments.</strong> Always DYOR (Do Your Own Research) before investing. These tokens may be highly volatile and could lose all value. Never invest more than you can afford to lose.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
