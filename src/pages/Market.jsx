import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Star, ChevronRight, ChevronDown, ChevronUp, TrendingUp, Zap, BarChart2, Clock, Filter } from 'lucide-react';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  .mk { font-family:'Inter',sans-serif; background:#0b0e11; color:#eaecef; min-height:100vh; }
  .mk *{box-sizing:border-box;margin:0;padding:0;}
  .mk-top-tabs{display:flex;gap:0;padding:0 24px;border-bottom:1px solid #1e2329;overflow-x:auto;scrollbar-width:none;}
  .mk-top-tabs::-webkit-scrollbar{display:none;}
  .mk-top-tab{padding:14px 20px;font-size:14px;font-weight:600;background:transparent;border:none;color:#848e9c;cursor:pointer;border-bottom:2px solid transparent;white-space:nowrap;margin-bottom:-1px;transition:all .15s;font-family:inherit;}
  .mk-top-tab.on{color:#eaecef;border-bottom-color:#f0b90b;}
  .mk-top-tab:hover{color:#eaecef;}
  .mk-sub-tabs{display:flex;gap:0;overflow-x:auto;scrollbar-width:none;}
  .mk-sub-tabs::-webkit-scrollbar{display:none;}
  .mk-sub-tab{padding:8px 16px;font-size:13px;font-weight:600;background:transparent;border:none;color:#848e9c;cursor:pointer;border-bottom:2px solid transparent;white-space:nowrap;transition:all .15s;font-family:inherit;position:relative;}
  .mk-sub-tab.on{color:#eaecef;border-bottom-color:#f0b90b;}
  .mk-sub-tab:hover{color:#eaecef;}
  .mk-tag-new{background:rgba(240,185,11,.15);color:#f0b90b;font-size:9px;font-weight:700;padding:1px 5px;border-radius:3px;margin-left:4px;vertical-align:middle;}
  .mk-card{background:#161a1e;border:1px solid #1e2329;border-radius:12px;padding:16px 20px;cursor:pointer;transition:all .15s;}
  .mk-card:hover{border-color:#2b3139;transform:translateY(-1px);}
  .mk-table{width:100%;border-collapse:collapse;}
  .mk-table th{padding:10px 16px;color:#848e9c;font-size:12px;font-weight:500;text-align:left;border-bottom:1px solid #1e2329;cursor:pointer;white-space:nowrap;user-select:none;}
  .mk-table th:hover{color:#eaecef;}
  .mk-table td{padding:12px 16px;border-bottom:1px solid #1e232950;font-size:13px;white-space:nowrap;}
  .mk-table tr:hover td{background:#161a1e;}
  .mk-table tr:last-child td{border-bottom:none;}
  .mk-search{display:flex;align-items:center;gap:8px;background:#1e2329;border:1px solid #2b3139;border-radius:8px;padding:8px 14px;transition:border .15s;}
  .mk-search:focus-within{border-color:#f0b90b;}
  .mk-search input{background:transparent;border:none;outline:none;color:#eaecef;font-size:13px;width:180px;font-family:inherit;}
  .mk-search input::placeholder{color:#5e6673;}
  .coin-logo{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:12px;flex-shrink:0;}
  .up{color:#0ecb81;} .dn{color:#f6465d;}
  .star-btn{background:none;border:none;cursor:pointer;color:#5e6673;padding:2px;transition:color .15s;display:flex;align-items:center;}
  .star-btn:hover{color:#f0b90b;}
  .star-btn.on{color:#f0b90b;}
  .trade-btn{padding:6px 18px;background:rgba(240,185,11,.1);color:#f0b90b;border:1px solid rgba(240,185,11,.3);border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;transition:all .15s;font-family:inherit;}
  .trade-btn:hover{background:#f0b90b;color:#0b0e11;}
  .cat-btn{padding:5px 14px;border:1px solid #2b3139;border-radius:20px;background:transparent;color:#848e9c;font-size:11px;cursor:pointer;white-space:nowrap;transition:all .15s;font-family:inherit;}
  .cat-btn:hover{color:#eaecef;border-color:#5e6673;}
  .cat-btn.on{background:#2b3139;color:#eaecef;border-color:#2b3139;}
  .mini-chart{display:flex;align-items:flex-end;gap:1px;height:28px;}
  .mini-bar{width:3px;border-radius:1px;transition:height .3s;}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
  .pulse{animation:pulse 2s infinite;}
  .badge{display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:12px;font-size:10px;font-weight:700;}
  .badge-up{background:rgba(14,203,129,.12);color:#0ecb81;}
  .badge-dn{background:rgba(246,70,93,.12);color:#f6465d;}
  @media(max-width:768px){
    .mk-top-tab{padding:10px 14px;font-size:13px;}
    .mk-table th,.mk-table td{padding:8px 10px;font-size:12px;}
    .hide-mobile{display:none!important;}
  }
`;

const COIN_COLORS = {
  BTC:'#f7931a',ETH:'#627eea',BNB:'#f0b90b',SOL:'#9945ff',
  XRP:'#00aae4',ADA:'#0d1e2c',DOGE:'#c2a633',AVAX:'#e84142',
  MATIC:'#8247e5',DOT:'#e6007a',LTC:'#bfbbbb',LINK:'#2a5ada',
  UNI:'#ff007a',ATOM:'#2e3148',TRX:'#e50914',NEAR:'#00c08b',
  APT:'#00b4e6',ARB:'#28a0f0',OP:'#ff0420',INJ:'#00b2ff',
  PEPE:'#488727',SHIB:'#e81f24',FTM:'#1969ff',SAND:'#04adef',
  MANA:'#ff2d55',AAVE:'#b6509e',CRV:'#40649f',MKR:'#1aab9b',
};

const SYMBOLS = [
  'BTCUSDT','ETHUSDT','BNBUSDT','SOLUSDT','XRPUSDT','ADAUSDT',
  'DOGEUSDT','AVAXUSDT','MATICUSDT','DOTUSDT','LTCUSDT','LINKUSDT',
  'UNIUSDT','ATOMUSDT','TRXUSDT','NEARUSDT','APTUSDT','ARBUSDT',
  'OPUSDT','INJUSDT','PEPEUSDT','SHIBUSDT','AAVEUSDT','CRVUSDT',
];

const HOT_COINS  = ['BNB','BTC','ETH','SOL'];
const NEW_COINS  = ['NEAR','INJ','ARB','APT'];
const TOP_GAIN   = ['NEAR','INJ','PEPE','ARB'];
const TOP_VOL    = ['BTC','ETH','BNB','SOL'];

const CATS = ['All','BNB Chain','Solana','RWA','MEME','Payments','AI','Layer 1/2','DeFi','Seed','Launchpool','Gaming'];

export default function Market() {
  const navigate = useNavigate();
  const [topTab,   setTopTab]   = useState('Overview');
  const [subTab,   setSubTab]   = useState('Cryptos');
  const [catTab,   setCatTab]   = useState('All');
  const [search,   setSearch]   = useState('');
  const [favs,     setFavs]     = useState([]);
  const [prices,   setPrices]   = useState({});
  const [sort,     setSort]     = useState({ key:'vol', dir:-1 });
  const wsRef = useRef(null);

  useEffect(() => {
    const streams = SYMBOLS.map(s=>`${s.toLowerCase()}@ticker`).join('/');
    wsRef.current = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);
    wsRef.current.onmessage = e => {
      const { data:d } = JSON.parse(e.data);
      if (!d?.s) return;
      const sym = d.s.replace('USDT','');
      setPrices(p => ({
        ...p,
        [d.s]: {
          symbol: sym,
          price:  parseFloat(d.c),
          change: parseFloat(d.P),
          high:   parseFloat(d.h),
          low:    parseFloat(d.l),
          vol:    parseFloat(d.v) * parseFloat(d.c),
          volRaw: parseFloat(d.v),
          up:     parseFloat(d.P) >= 0,
        }
      }));
    };
    wsRef.current.onerror = () => wsRef.current?.close();
    return () => wsRef.current?.close();
  }, []);

  const allCoins = Object.values(prices);
  const isLoading = allCoins.length === 0;

  const filtered = allCoins.filter(c => {
    if (search) return c.symbol.toLowerCase().includes(search.toLowerCase());
    if (subTab === 'Favorites') return favs.includes(c.symbol);
    return true;
  }).sort((a,b) => {
    const v = sort.dir;
    if (sort.key==='price')  return (a.price  - b.price)  * v;
    if (sort.key==='change') return (a.change - b.change) * v;
    if (sort.key==='vol')    return (a.vol    - b.vol)    * v;
    return a.symbol.localeCompare(b.symbol) * v;
  });

  const toggleFav = (sym) => setFavs(f => f.includes(sym)?f.filter(s=>s!==sym):[...f,sym]);
  const toggleSort = key => setSort(s => s.key===key?{key,dir:-s.dir}:{key,dir:-1});

  const SortIcon = ({ k }) => {
    if (sort.key!==k) return <span style={{color:'#5e6673',fontSize:10,marginLeft:2}}>↕</span>;
    return <span style={{color:'#f0b90b',fontSize:10,marginLeft:2}}>{sort.dir===1?'↑':'↓'}</span>;
  };

  const fmtPrice = (p) => {
    if (!p) return '—';
    if (p >= 1000) return p.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
    if (p >= 1)    return p.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:4});
    return p.toFixed(6);
  };

  const fmtVol = (v) => {
    if (!v) return '—';
    if (v >= 1e9) return `$${(v/1e9).toFixed(2)}B`;
    if (v >= 1e6) return `$${(v/1e6).toFixed(2)}M`;
    return `$${(v/1e3).toFixed(2)}K`;
  };

  const MiniChart = ({ up }) => {
    const bars = [40,60,35,70,55,80,45,65,50,75];
    return (
      <div className="mini-chart">
        {bars.map((h,i) => (
          <div key={i} className="mini-bar" style={{ height:`${h}%`, background: up?'#0ecb81':'#f6465d', opacity:0.7+(i*0.03) }}/>
        ))}
      </div>
    );
  };

  const QuickCard = ({ title, coins, icon }) => (
    <div className="mk-card">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontSize:14 }}>{icon}</span>
          <span style={{ fontWeight:700, fontSize:13, color:'#eaecef' }}>{title}</span>
        </div>
        <span style={{ color:'#f0b90b', fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:2 }}>
          More <ChevronRight size={12}/>
        </span>
      </div>
      {coins.map(sym => {
        const c = prices[`${sym}USDT`];
        return (
          <div key={sym} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', cursor:'pointer', borderBottom:'1px solid #1e232940' }}
            onClick={() => navigate(`/trade/${sym.toLowerCase()}`)}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div className="coin-logo" style={{ background:COIN_COLORS[sym]||'#2b3139', width:24, height:24, fontSize:9 }}>{sym[0]}</div>
              <div>
                <div style={{ fontWeight:700, fontSize:12, color:'#eaecef' }}>{sym}</div>
                <div style={{ fontSize:10, color:'#5e6673' }}>/USDT</div>
              </div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:12, color:'#eaecef', fontWeight:700 }}>
                ${fmtPrice(c?.price)}
              </div>
              <div className={c?.up?'up':'dn'} style={{ fontSize:11, fontWeight:700 }}>
                {c?.change!==undefined ? `${c.up?'+':''}${c.change.toFixed(2)}%` : '—'}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      <style>{css}</style>
      <div className="mk">

        {/* TOP BAR */}
        <div style={{ display:'flex', alignItems:'center', padding:'0 24px', borderBottom:'1px solid #1e2329', gap:16, flexWrap:'wrap' }}>
          <div className="mk-top-tabs" style={{ flex:1, padding:0, border:'none', gap:0 }}>
            {['Overview','Trading Data','AI Select','Token Unlock'].map(t => (
              <button key={t} className={`mk-top-tab${topTab===t?' on':''}`} onClick={() => setTopTab(t)}>
                {t}
              </button>
            ))}
          </div>
          <div style={{ display:'flex', gap:10, alignItems:'center', padding:'8px 0' }}>
            <div className="mk-search">
              <Search size={14} style={{ color:'#5e6673', flexShrink:0 }}/>
              <input placeholder="Search coin" value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <button style={{ background:'none', border:'none', cursor:'pointer', color:'#848e9c', display:'flex', padding:6 }}>
              <Bell size={18}/>
            </button>
          </div>
        </div>

        {/* QUICK CARDS — Hot / New / Top Gainer / Top Volume */}
        {!search && (
          <div style={{ padding:'20px 24px', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
            <QuickCard title="Hot"        coins={HOT_COINS} icon="🔥"/>
            <QuickCard title="New"        coins={NEW_COINS}  icon="✨"/>
            <QuickCard title="Top Gainer" coins={TOP_GAIN}   icon="🚀"/>
            <QuickCard title="Top Volume" coins={TOP_VOL}    icon="📊"/>
          </div>
        )}

        {/* SUB TABS */}
        <div style={{ display:'flex', alignItems:'center', padding:'0 24px', borderBottom:'1px solid #1e2329', flexWrap:'wrap', gap:0 }}>
          <div className="mk-sub-tabs" style={{ flex:'none' }}>
            {['Favorites','Cryptos','Spot','Futures','Alpha','New','Zones'].map(t => (
              <button key={t} className={`mk-sub-tab${subTab===t?' on':''}`} onClick={() => setSubTab(t)}>
                {t}
                {t==='Alpha' && <span className="mk-tag-new">New</span>}
              </button>
            ))}
          </div>
          {/* Category chips */}
          <div style={{ display:'flex', gap:6, overflowX:'auto', scrollbarWidth:'none', padding:'10px 0 10px 16px', flex:1 }}>
            {CATS.map(c => (
              <button key={c} className={`cat-btn${catTab===c?' on':''}`} onClick={() => setCatTab(c)}>
                {c}
                {c==='Solana' && <span className="mk-tag-new">New</span>}
              </button>
            ))}
          </div>
          {/* Right icons */}
          <div style={{ display:'flex', gap:8, color:'#848e9c', padding:'0 0 0 12px', flexShrink:0 }}>
            <Search size={16} style={{ cursor:'pointer' }}/>
            <Bell size={16} style={{ cursor:'pointer' }}/>
          </div>
        </div>

        {/* TABLE */}
        <div style={{ padding:'0 24px 60px' }}>
          <div style={{ padding:'16px 0 10px' }}>
            <h3 style={{ fontSize:16, fontWeight:700, color:'#eaecef', marginBottom:4 }}>Top Tokens by Market Capitalization</h3>
            <p style={{ fontSize:12, color:'#848e9c' }}>
              Real-time prices, 24h volume and market data for all cryptocurrencies.
              {' '}<span style={{ color:'#f0b90b', cursor:'pointer' }}>More →</span>
            </p>
          </div>

          <div style={{ background:'#161a1e', borderRadius:12, overflow:'hidden', border:'1px solid #1e2329' }}>
            <table className="mk-table">
              <thead>
                <tr style={{ background:'#0b0e11' }}>
                  <th style={{ width:40 }}></th>
                  <th onClick={() => toggleSort('symbol')}>
                    Name <SortIcon k="symbol"/>
                  </th>
                  <th onClick={() => toggleSort('price')} style={{ textAlign:'right' }}>
                    Price <SortIcon k="price"/>
                  </th>
                  <th onClick={() => toggleSort('change')} style={{ textAlign:'right' }}>
                    24h Change <SortIcon k="change"/>
                  </th>
                  <th style={{ textAlign:'right' }} className="hide-mobile">24h High</th>
                  <th style={{ textAlign:'right' }} className="hide-mobile">24h Low</th>
                  <th onClick={() => toggleSort('vol')} style={{ textAlign:'right' }} className="hide-mobile">
                    24h Volume <SortIcon k="vol"/>
                  </th>
                  <th style={{ textAlign:'right', width:80 }} className="hide-mobile">Trend</th>
                  <th style={{ textAlign:'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign:'center', padding:60, color:'#5e6673' }}>
                      <div className="pulse" style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
                        <div style={{ width:32, height:32, border:'3px solid #f0b90b', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 1s linear infinite' }}/>
                        <span style={{ fontSize:12 }}>Loading market data...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={9} style={{ textAlign:'center', padding:40, color:'#5e6673', fontSize:13 }}>No results found</td></tr>
                ) : filtered.map((c,idx) => (
                  <tr key={c.symbol} style={{ cursor:'pointer' }} onClick={() => navigate(`/trade/${c.symbol.toLowerCase()}`)}>
                    <td onClick={e=>e.stopPropagation()}>
                      <button className={`star-btn${favs.includes(c.symbol)?' on':''}`} onClick={() => toggleFav(c.symbol)}>
                        <Star size={14} style={favs.includes(c.symbol)?{fill:'#f0b90b'}:{}}/>
                      </button>
                    </td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ color:'#5e6673', fontSize:11, minWidth:20, textAlign:'right' }}>{idx+1}</div>
                        <div className="coin-logo" style={{ background:COIN_COLORS[c.symbol]||'#2b3139' }}>
                          {c.symbol[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight:700, fontSize:13, color:'#eaecef' }}>{c.symbol}</div>
                          <div style={{ fontSize:11, color:'#848e9c' }}>{c.symbol}/USDT</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign:'right', fontWeight:700, color:'#eaecef', fontVariantNumeric:'tabular-nums' }}>
                      ${fmtPrice(c.price)}
                    </td>
                    <td style={{ textAlign:'right' }}>
                      <span className={`badge${c.up?' badge-up':' badge-dn'}`}>
                        {c.up?'▲':'▼'} {Math.abs(c.change).toFixed(2)}%
                      </span>
                    </td>
                    <td style={{ textAlign:'right', color:'#0ecb81', fontSize:12 }} className="hide-mobile">
                      ${fmtPrice(c.high)}
                    </td>
                    <td style={{ textAlign:'right', color:'#f6465d', fontSize:12 }} className="hide-mobile">
                      ${fmtPrice(c.low)}
                    </td>
                    <td style={{ textAlign:'right', color:'#848e9c', fontVariantNumeric:'tabular-nums', fontSize:12 }} className="hide-mobile">
                      {fmtVol(c.vol)}
                    </td>
                    <td className="hide-mobile">
                      <div style={{ display:'flex', justifyContent:'flex-end' }}>
                        <MiniChart up={c.up}/>
                      </div>
                    </td>
                    <td style={{ textAlign:'right' }} onClick={e=>e.stopPropagation()}>
                      <button className="trade-btn" onClick={() => navigate(`/trade/${c.symbol.toLowerCase()}`)}>
                        Trade
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </>
  );
}
export default Market;
