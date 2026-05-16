import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Star, TrendingUp, TrendingDown, ChevronRight, ChevronDown } from 'lucide-react';
import axios from 'axios';

const css = `
  .mk { font-family:'Inter',sans-serif; background:#0b0e11; color:#eaecef; min-height:100vh; }
  .mk * { box-sizing:border-box; }
  .mk-nav { display:flex; gap:0; border-bottom:2px solid #1e2329; padding:0 24px; overflow-x:auto; scrollbar-width:none; }
  .mk-nav::-webkit-scrollbar{display:none;}
  .mk-nav-btn { padding:14px 20px; font-size:14px; font-weight:600; background:transparent; border:none; color:#848e9c; cursor:pointer; border-bottom:3px solid transparent; white-space:nowrap; margin-bottom:-2px; }
  .mk-nav-btn.on { color:#eaecef; border-bottom-color:#f0b90b; font-weight:700; }
  .mk-subnav { display:flex; gap:0; padding:8px 24px; overflow-x:auto; scrollbar-width:none; border-bottom:1px solid #1e2329; }
  .mk-subnav::-webkit-scrollbar{display:none;}
  .mk-sub-btn { padding:6px 14px; font-size:12px; border-radius:20px; border:none; background:transparent; color:#848e9c; cursor:pointer; white-space:nowrap; font-weight:500; }
  .mk-sub-btn.on { background:#2b3139; color:#eaecef; font-weight:700; }
  .mk-tag { padding:4px 10px; border-radius:4px; font-size:11px; font-weight:700; display:inline-block; margin-left:4px; }
  .mk-tag.new { background:rgba(240,185,11,.15); color:#f0b90b; }
  .mk-card { background:#161a1e; border:1px solid #1e2329; border-radius:12px; padding:16px 20px; cursor:pointer; transition:border .15s; }
  .mk-card:hover { border-color:#2b3139; }
  .mk-table { width:100%; border-collapse:collapse; }
  .mk-table th { padding:10px 16px; color:#848e9c; font-size:12px; font-weight:500; text-align:left; border-bottom:1px solid #1e2329; cursor:pointer; white-space:nowrap; }
  .mk-table th:hover { color:#eaecef; }
  .mk-table td { padding:12px 16px; border-bottom:1px solid #1e232960; font-size:13px; white-space:nowrap; }
  .mk-table tr:hover td { background:#161a1e; }
  .mk-table tr:last-child td { border-bottom:none; }
  .mk-search { display:flex; align-items:center; gap:8px; background:#1e2329; border:1px solid #2b3139; border-radius:8px; padding:8px 14px; }
  .mk-search input { background:transparent; border:none; outline:none; color:#eaecef; font-size:13px; width:180px; }
  .mk-search input::placeholder { color:#5e6673; }
  .coin-logo { width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:11px; flex-shrink:0; }
  .up { color:#0ecb81; } .dn { color:#f6465d; }
  .star-btn { background:none; border:none; cursor:pointer; color:#5e6673; padding:2px; }
  .star-btn.on { color:#f0b90b; }
  .trade-btn { padding:6px 16px; background:rgba(240,185,11,.1); color:#f0b90b; border:1px solid rgba(240,185,11,.3); border-radius:6px; font-size:12px; font-weight:700; cursor:pointer; }
  .trade-btn:hover { background:#f0b90b; color:#0b0e11; }
  @keyframes spin{to{transform:rotate(360deg);}}
  .spin { animation:spin 1s linear infinite; }
`;

const COIN_COLORS = {
  BTC:'#f7931a', ETH:'#627eea', BNB:'#f0b90b', SOL:'#9945ff',
  XRP:'#00aae4', ADA:'#0d1e2c', DOGE:'#c2a633', AVAX:'#e84142',
  MATIC:'#8247e5', DOT:'#e6007a', LTC:'#bfbbbb', LINK:'#2a5ada',
  UNI:'#ff007a', ATOM:'#2e3148', TRX:'#e50914', NEAR:'#00c08b',
  APT:'#00b4e6', ARB:'#28a0f0', OP:'#ff0420', INJ:'#00b2ff'
};

const SYMBOLS = [
  'BTCUSDT','ETHUSDT','BNBUSDT','SOLUSDT','XRPUSDT','ADAUSDT',
  'DOGEUSDT','AVAXUSDT','MATICUSDT','DOTUSDT','LTCUSDT','LINKUSDT',
  'UNIUSDT','ATOMUSDT','TRXUSDT','NEARUSDT','APTUSDT','ARBUSDT',
  'OPUSDT','INJUSDT'
];

const HOT = ['BNB','BTC','ETH','SOL'];
const TOP_GAINERS = ['NEAR','INJ','ARB','APT'];
const TOP_VOL = ['BTC','ETH','BNB','SOL'];

export default function Market() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('Cryptos');
  const [subTab, setSubTab] = useState('All');
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [prices, setPrices] = useState({});
  const [sort, setSort] = useState({ key: 'vol', dir: -1 });
  const wsRef = useRef(null);

  // WebSocket stream
  useEffect(() => {
    const streams = SYMBOLS.map(s => `${s.toLowerCase()}@ticker`).join('/');
    wsRef.current = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);
    wsRef.current.onmessage = e => {
      const { data: d } = JSON.parse(e.data);
      if (!d?.s) return;
      setPrices(p => ({
        ...p,
        [d.s]: {
          symbol: d.s.replace('USDT',''),
          price: parseFloat(d.c),
          change: parseFloat(d.P),
          vol: parseFloat(d.v) * parseFloat(d.c),
          high: parseFloat(d.h),
          low: parseFloat(d.l),
          up: parseFloat(d.P) >= 0,
        }
      }));
    };
    wsRef.current.onerror = () => wsRef.current?.close();
    return () => wsRef.current?.close();
  }, []);

  const allCoins = Object.values(prices);

  const filtered = allCoins.filter(c => {
    if (search) return c.symbol.toLowerCase().includes(search.toLowerCase());
    if (subTab === 'Favorites') return favorites.includes(c.symbol);
    if (subTab === 'Spot') return true;
    if (subTab === 'Futures') return true;
    return true;
  }).sort((a, b) => {
    const v = sort.dir;
    if (sort.key === 'price') return (a.price - b.price) * v;
    if (sort.key === 'change') return (a.change - b.change) * v;
    if (sort.key === 'vol') return (a.vol - b.vol) * v;
    return a.symbol.localeCompare(b.symbol) * v;
  });

  const toggleFav = (sym) => {
    setFavorites(f => f.includes(sym) ? f.filter(s => s !== sym) : [...f, sym]);
  };

  const toggleSort = (key) => {
    setSort(s => s.key === key ? { key, dir: -s.dir } : { key, dir: -1 });
  };

  const SortIcon = ({ k }) => {
    if (sort.key !== k) return <span style={{ color: '#5e6673', fontSize: 10 }}> ↕</span>;
    return <span style={{ color: '#f0b90b', fontSize: 10 }}>{sort.dir === 1 ? ' ↑' : ' ↓'}</span>;
  };

  const CoinCard = ({ sym }) => {
    const c = prices[`${sym}USDT`];
    if (!c) return null;
    return (
      <div className="mk-card" onClick={() => navigate(`/trade/${sym.toLowerCase()}`)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div className="coin-logo" style={{ background: COIN_COLORS[sym] || '#2b3139' }}>{sym[0]}</div>
          <span style={{ fontWeight: 700, fontSize: 14 }}>{sym}</span>
        </div>
        <div style={{ fontSize: 13, color: '#eaecef', fontWeight: 700 }}>${c.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        <div className={c.up ? 'up' : 'dn'} style={{ fontSize: 12, fontWeight: 700, marginTop: 2 }}>
          {c.up ? '+' : ''}{c.change?.toFixed(2)}%
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{css}</style>
      <div className="mk">
        {/* Top nav */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #1e2329', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="mk-nav" style={{ flex: 1, padding: 0, border: 'none' }}>
            {['Overview', 'Trading Data', 'AI Select', 'Token Unlock'].map(t => (
              <button key={t} className={`mk-nav-btn ${tab === t ? 'on' : ''}`} onClick={() => setTab(t)}>
                {t}
              </button>
            ))}
          </div>
          <div className="mk-search">
            <Search size={14} style={{ color: '#5e6673', flexShrink: 0 }} />
            <input placeholder="Search" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#848e9c' }}>
            <Bell size={18} />
          </button>
        </div>

        {/* Hot / New / Top Gainers / Top Volume cards */}
        {!search && (
          <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
            {[
              { title: 'Hot', coins: HOT },
              { title: 'New', coins: TOP_GAINERS },
              { title: 'Top Gainer', coins: TOP_GAINERS },
              { title: 'Top Volume', coins: TOP_VOL },
            ].map(({ title, coins }) => (
              <div key={title} className="mk-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{title}</span>
                  <span style={{ color: '#f0b90b', fontSize: 12, cursor: 'pointer' }}>More <ChevronRight size={12} style={{ display: 'inline' }} /></span>
                </div>
                {coins.map(sym => {
                  const c = prices[`${sym}USDT`];
                  return (
                    <div key={sym} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', cursor: 'pointer' }}
                      onClick={() => navigate(`/trade/${sym.toLowerCase()}`)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div className="coin-logo" style={{ background: COIN_COLORS[sym] || '#2b3139', width: 22, height: 22, fontSize: 9 }}>{sym[0]}</div>
                        <span style={{ fontWeight: 600, fontSize: 12 }}>{sym}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, color: '#eaecef', fontWeight: 600 }}>
                          ${c?.price?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || '—'}
                        </div>
                        <div className={c?.up ? 'up' : 'dn'} style={{ fontSize: 11, fontWeight: 700 }}>
                          {c?.change !== undefined ? `${c.up ? '+' : ''}${c.change.toFixed(2)}%` : '—'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* SubNav */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 24px', borderBottom: '1px solid #1e2329', gap: 0 }}>
          <div className="mk-subnav" style={{ flex: 1, padding: '0', border: 'none' }}>
            {['Favorites', 'Cryptos', 'Spot', 'Futures', 'Alpha', 'New', 'Zones'].map(t => (
              <button key={t} className={`mk-sub-btn ${subTab === t ? 'on' : ''}`} onClick={() => setSubTab(t)}>
                {t}
                {t === 'Alpha' && <span className="mk-tag new">New</span>}
              </button>
            ))}
          </div>

          {/* Category filter */}
          <div style={{ display: 'flex', gap: 6, overflow: 'auto', scrollbarWidth: 'none', padding: '8px 0' }}>
            {['All', 'BNB Chain', 'Solana', 'RWA', 'MEME', 'Payments', 'AI', 'Layer 1/2', 'DeFi'].map(c => (
              <button key={c} style={{ padding: '4px 12px', border: '1px solid #2b3139', borderRadius: 20, background: 'transparent', color: '#848e9c', fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {c}{c === 'Solana' && <span className="mk-tag new" style={{ fontSize: 9 }}>New</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ padding: '0 24px 40px' }}>
          <div style={{ padding: '16px 0 8px' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Top Tokens by Market Capitalization</h3>
            <p style={{ fontSize: 12, color: '#848e9c', marginBottom: 12 }}>
              Real-time prices, 24h volume and market data for all cryptocurrencies.
            </p>
          </div>

          <div style={{ background: '#161a1e', borderRadius: 12, overflow: 'hidden', border: '1px solid #1e2329' }}>
            <table className="mk-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}></th>
                  <th onClick={() => toggleSort('symbol')}>Name <SortIcon k="symbol" /></th>
                  <th onClick={() => toggleSort('price')} style={{ textAlign: 'right' }}>
                    Price <ChevronDown size={11} style={{ display: 'inline' }} /> <SortIcon k="price" />
                  </th>
                  <th onClick={() => toggleSort('change')} style={{ textAlign: 'right' }}>
                    24h Change <SortIcon k="change" />
                  </th>
                  <th style={{ textAlign: 'right' }}>24h High</th>
                  <th style={{ textAlign: 'right' }}>24h Low</th>
                  <th onClick={() => toggleSort('vol')} style={{ textAlign: 'right' }}>
                    24h Volume <SortIcon k="vol" />
                  </th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#5e6673' }}>
                    {Object.keys(prices).length === 0 ? 'Loading market data...' : 'No results found'}
                  </td></tr>
                ) : filtered.map(c => (
                  <tr key={c.symbol}>
                    <td>
                      <button className={`star-btn ${favorites.includes(c.symbol) ? 'on' : ''}`}
                        onClick={() => toggleFav(c.symbol)}>
                        <Star size={14} style={favorites.includes(c.symbol) ? { fill: '#f0b90b' } : {}} />
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="coin-logo" style={{ background: COIN_COLORS[c.symbol] || '#2b3139' }}>{c.symbol[0]}</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: '#eaecef' }}>{c.symbol}</div>
                          <div style={{ fontSize: 11, color: '#848e9c' }}>{c.symbol} / USDT</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#eaecef', fontVariantNumeric: 'tabular-nums' }}>
                      ${c.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={c.up ? 'up' : 'dn'} style={{ fontWeight: 700 }}>
                        {c.up ? '+' : ''}{c.change?.toFixed(2)}%
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', color: '#0ecb81' }}>
                      ${c.high?.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                    </td>
                    <td style={{ textAlign: 'right', color: '#f6465d' }}>
                      ${c.low?.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                    </td>
                    <td style={{ textAlign: 'right', color: '#848e9c', fontVariantNumeric: 'tabular-nums' }}>
                      ${c.vol?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                    <td style={{ textAlign: 'right' }}>
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
    </>
  );
}
