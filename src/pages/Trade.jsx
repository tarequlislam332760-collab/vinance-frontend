import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import {
  Star, Bell, MoreHorizontal, ChevronDown, Search,
  TrendingUp, TrendingDown, Loader2, FileText, RefreshCw,
  ArrowUpRight, ArrowDownLeft
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const TradeStyles = () => (
  <style>{`
    .spot-wrap { font-family:'Roboto Mono','IBM Plex Mono',monospace; background:#0b0e11; color:#848e9c; min-height:100vh; display:flex; flex-direction:column; }
    .spot-main { display:flex; flex:1; overflow:hidden; min-height:0; }
    .spot-left { width:260px; flex-shrink:0; border-right:1px solid #1e2329; display:flex; flex-direction:column; background:#0b0e11; overflow:hidden; }
    .spot-center { flex:1; display:flex; flex-direction:column; min-width:0; }
    .spot-right { width:340px; flex-shrink:0; border-left:1px solid #1e2329; display:flex; flex-direction:column; background:#0b0e11; overflow-y:auto; }
    .spot-header { display:flex; align-items:center; gap:16px; padding:10px 14px; background:#0b0e11; border-bottom:1px solid #1e2329; flex-wrap:wrap; }
    .spot-section-tabs { display:flex; gap:0; padding:0 10px; background:#0b0e11; border-bottom:1px solid #1e2329; overflow-x:auto; scrollbar-width:none; }
    .spot-section-tabs::-webkit-scrollbar{display:none;}
    .spot-section-tab { padding:9px 14px; font-size:13px; background:transparent; border:none; color:#848e9c; cursor:pointer; border-bottom:2px solid transparent; white-space:nowrap; position:relative; }
    .spot-section-tab.active { color:#eaecef; border-bottom-color:#f0b90b; font-weight:700; }
    .spot-tf-bar { display:flex; align-items:center; gap:2px; padding:4px 8px; background:#161a1e; border-bottom:1px solid #1e2329; }
    .spot-tf-btn { padding:3px 9px; font-size:11px; border-radius:3px; border:none; background:transparent; color:#848e9c; cursor:pointer; }
    .spot-tf-btn.active { background:#2b3139; color:#eaecef; }
    .spot-ob-row { display:flex; justify-content:space-between; align-items:center; padding:2px 8px; position:relative; font-size:11px; cursor:pointer; }
    .spot-ob-row:hover { background:rgba(255,255,255,.03); }
    .spot-ob-depth { position:absolute; right:0; top:0; bottom:0; opacity:.12; pointer-events:none; }
    .order-type-btn { padding:8px 16px; font-size:12px; border:none; background:transparent; cursor:pointer; color:#848e9c; border-bottom:2px solid transparent; }
    .order-type-btn.active { color:#eaecef; border-bottom-color:#f0b90b; }
    .spot-input-wrap { position:relative; }
    .spot-input { width:100%; background:#2b3139; border:1px solid #2b3139; border-radius:4px; padding:10px 64px 10px 12px; color:#eaecef; font-size:13px; outline:none; transition:border .15s; }
    .spot-input:focus { border-color:#f0b90b; }
    .spot-input::placeholder { color:#5e6673; }
    .spot-input-suffix { position:absolute; right:10px; top:50%; transform:translateY(-50%); color:#848e9c; font-size:12px; font-weight:700; }
    .pct-btn { flex:1; padding:4px 0; background:#2b3139; border:none; border-radius:2px; font-size:10px; color:#848e9c; cursor:pointer; }
    .pct-btn:hover { color:#f0b90b; }
    .buy-submit { width:100%; padding:14px 0; border:none; border-radius:6px; background:#0ecb81; color:#fff; font-size:15px; font-weight:800; cursor:pointer; letter-spacing:.5px; }
    .buy-submit:hover { background:#0fb574; }
    .buy-submit:disabled { opacity:.5; cursor:not-allowed; }
    .sell-submit { width:100%; padding:14px 0; border:none; border-radius:6px; background:#f6465d; color:#fff; font-size:15px; font-weight:800; cursor:pointer; letter-spacing:.5px; }
    .sell-submit:hover { background:#e03d52; }
    .sell-submit:disabled { opacity:.5; cursor:not-allowed; }
    .spot-pos-tabs { display:flex; gap:0; padding:0 12px; border-bottom:1px solid #1e2329; overflow-x:auto; scrollbar-width:none; flex-shrink:0; }
    .spot-pos-tabs::-webkit-scrollbar{display:none;}
    .spot-pos-tab { padding:10px 14px 8px; font-size:12px; font-weight:600; background:transparent; border:none; border-bottom:2px solid transparent; color:#5e6673; cursor:pointer; white-space:nowrap; }
    .spot-pos-tab.active { color:#eaecef; border-bottom-color:#f0b90b; }
    .pair-row { display:flex; justify-content:space-between; align-items:center; padding:7px 12px; cursor:pointer; }
    .pair-row:hover { background:#161a1e; }
    .pair-row.active { background:#1e2329; }
    .mover-row { display:flex; justify-content:space-between; align-items:center; padding:5px 12px; font-size:11px; }
    .trades-row { display:flex; justify-content:space-between; padding:3px 8px; font-size:11px; }
    .empty-state { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px 0; gap:8px; color:#404854; font-size:11px; }
    @keyframes spin{to{transform:rotate(360deg);}}
    .spin{animation:spin .8s linear infinite;}
    @keyframes flashG{0%{background:rgba(14,203,129,.2)}100%{background:transparent}}
    @keyframes flashR{0%{background:rgba(246,70,93,.2)}100%{background:transparent}}
    .fg{animation:flashG .4s ease-out;}
    .fr{animation:flashR .4s ease-out;}
    .slider-track{width:100%;height:3px;background:#2b3139;border-radius:2px;position:relative;cursor:pointer;}
    .slider-fill{height:100%;border-radius:2px;transition:width .1s;}
    .slider-thumb{width:10px;height:10px;border-radius:50%;position:absolute;top:-3.5px;transform:translateX(-50%);cursor:pointer;}
    @media(max-width:1100px){.spot-left{width:200px;}}
    @media(max-width:768px){.spot-main{flex-direction:column;overflow-y:auto;}.spot-right{width:100%;border-left:none;border-top:1px solid #1e2329;}.spot-left{width:100%;max-height:300px;}}
  `}</style>
);

/* ─── Spot Order Book ────────────────────────────────────────────── */
const SpotOrderBook = ({ symbol, currentPrice, priceUp }) => {
  const [book, setBook] = useState({ asks: [], bids: [] });
  const [trades, setTrades] = useState([]);
  const [view, setView] = useState('both'); // 'both' | 'asks' | 'bids'
  const wbRef = useRef(null);
  const wtRef = useRef(null);

  useEffect(() => {
    const sym = `${symbol.toLowerCase()}usdt`;
    wbRef.current = new WebSocket(`wss://stream.binance.com:9443/ws/${sym}@depth10@500ms`);
    wbRef.current.onmessage = (e) => {
      const d = JSON.parse(e.data);
      setBook({ asks: (d.a||[]).slice(0,10).reverse(), bids: (d.b||[]).slice(0,10) });
    };
    wtRef.current = new WebSocket(`wss://stream.binance.com:9443/ws/${sym}@trade`);
    wtRef.current.onmessage = (e) => {
      const d = JSON.parse(e.data);
      setTrades(prev => [{
        price: parseFloat(d.p).toFixed(2),
        qty: parseFloat(d.q).toFixed(4),
        time: new Date(d.T).toTimeString().slice(0,8),
        isBuy: !d.m
      }, ...prev].slice(0,40));
    };
    return () => { wbRef.current?.close(); wtRef.current?.close(); };
  }, [symbol]);

  const maxA = book.asks.length ? Math.max(...book.asks.map(o=>parseFloat(o[1]))) : 1;
  const maxB = book.bids.length ? Math.max(...book.bids.map(o=>parseFloat(o[1]))) : 1;

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'6px 8px', borderBottom:'1px solid #1e2329', flexShrink:0 }}>
        <span style={{ color:'#eaecef', fontWeight:700, fontSize:12 }}>Order Book</span>
        <MoreHorizontal size={13} style={{ color:'#5e6673', cursor:'pointer' }} />
      </div>
      {/* Column headers */}
      <div style={{ display:'flex', justifyContent:'space-between', padding:'4px 8px', fontSize:10, color:'#5e6673', flexShrink:0 }}>
        <span>Price (USDT)</span><span>Amount ({symbol})</span><span>Total</span>
      </div>
      {/* Asks */}
      <div style={{ flex:1, overflowY:'auto', scrollbarWidth:'none' }}>
        {book.asks.map((ask, i) => {
          const pct = (parseFloat(ask[1])/maxA)*100;
          const total = book.asks.slice(0,i+1).reduce((a,o)=>a+parseFloat(o[0])*parseFloat(o[1]),0);
          return (
            <div key={i} className="spot-ob-row">
              <div className="spot-ob-depth" style={{ width:`${pct}%`, background:'#f6465d' }} />
              <span style={{ color:'#f6465d', fontWeight:600, zIndex:1 }}>{parseFloat(ask[0]).toFixed(2)}</span>
              <span style={{ color:'#c6cad2', zIndex:1 }}>{parseFloat(ask[1]).toFixed(5)}</span>
              <span style={{ color:'#848e9c', zIndex:1 }}>{total.toFixed(2)}</span>
            </div>
          );
        })}
      </div>
      {/* Mid */}
      <div style={{ textAlign:'center', padding:'8px', borderTop:'1px solid #1e2329', borderBottom:'1px solid #1e2329', flexShrink:0 }}>
        <div style={{ color: priceUp?'#0ecb81':'#f6465d', fontSize:16, fontWeight:700 }}>
          {parseFloat(currentPrice).toLocaleString(undefined,{minimumFractionDigits:2})}
        </div>
        <div style={{ fontSize:9, color:'#5e6673' }}>≈ ${parseFloat(currentPrice).toLocaleString(undefined,{minimumFractionDigits:2})}</div>
      </div>
      {/* Bids */}
      <div style={{ flex:1, overflowY:'auto', scrollbarWidth:'none' }}>
        {book.bids.map((bid, i) => {
          const pct = (parseFloat(bid[1])/maxB)*100;
          const total = book.bids.slice(0,i+1).reduce((a,o)=>a+parseFloat(o[0])*parseFloat(o[1]),0);
          return (
            <div key={i} className="spot-ob-row">
              <div className="spot-ob-depth" style={{ width:`${pct}%`, background:'#0ecb81' }} />
              <span style={{ color:'#0ecb81', fontWeight:600, zIndex:1 }}>{parseFloat(bid[0]).toFixed(2)}</span>
              <span style={{ color:'#c6cad2', zIndex:1 }}>{parseFloat(bid[1]).toFixed(5)}</span>
              <span style={{ color:'#848e9c', zIndex:1 }}>{total.toFixed(2)}</span>
            </div>
          );
        })}
      </div>
      {/* Market trades */}
      <div style={{ borderTop:'1px solid #1e2329', flexShrink:0 }}>
        <div style={{ display:'flex', gap:12, padding:'6px 8px', borderBottom:'1px solid #1e2329' }}>
          <span style={{ color:'#eaecef', fontWeight:600, fontSize:11, borderBottom:'2px solid #f0b90b', paddingBottom:2 }}>Market Trades</span>
          <span style={{ color:'#848e9c', fontSize:11, cursor:'pointer' }}>My Trades</span>
        </div>
        <div style={{ fontSize:10, display:'flex', justifyContent:'space-between', padding:'3px 8px', color:'#5e6673' }}>
          <span>Price (USDT)</span><span>Amount ({symbol})</span><span>Time</span>
        </div>
        <div style={{ maxHeight:140, overflowY:'auto', scrollbarWidth:'none' }}>
          {trades.map((t, i) => (
            <div key={i} className="trades-row">
              <span style={{ color: t.isBuy ? '#0ecb81':'#f6465d', fontWeight:600 }}>{t.price}</span>
              <span style={{ color:'#c6cad2' }}>{t.qty}</span>
              <span style={{ color:'#5e6673' }}>{t.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── Pairs List ─────────────────────────────────────────────────── */
const PAIRS = [
  { symbol:'BTC', name:'Bitcoin', change:'+1.23' },
  { symbol:'ETH', name:'Ethereum', change:'-0.87' },
  { symbol:'BNB', name:'BNB', change:'+2.10' },
  { symbol:'SOL', name:'Solana', change:'+3.45' },
  { symbol:'XRP', name:'XRP', change:'-1.20' },
  { symbol:'ADA', name:'Cardano', change:'+0.67' },
  { symbol:'DOGE', name:'Dogecoin', change:'+5.32' },
  { symbol:'AVAX', name:'Avalanche', change:'-2.11' },
  { symbol:'MATIC', name:'Polygon', change:'+1.89' },
  { symbol:'DOT', name:'Polkadot', change:'-0.55' },
  { symbol:'LTC', name:'Litecoin', change:'+0.34' },
  { symbol:'LINK', name:'Chainlink', change:'+4.21' },
];

const PairsList = ({ currentCoin, onSelect }) => {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('USDT');

  const filtered = PAIRS.filter(p =>
    p.symbol.toLowerCase().includes(search.toLowerCase()) ||
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      {/* Search */}
      <div style={{ padding:'8px', borderBottom:'1px solid #1e2329', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, background:'#2b3139', borderRadius:4, padding:'6px 10px' }}>
          <Search size={12} style={{ color:'#5e6673', flexShrink:0 }} />
          <input type="text" placeholder="Search" value={search} onChange={e=>setSearch(e.target.value)}
            style={{ background:'transparent', border:'none', outline:'none', color:'#eaecef', fontSize:12, width:'100%' }} />
        </div>
      </div>
      {/* Currency tabs */}
      <div style={{ display:'flex', padding:'0 8px', borderBottom:'1px solid #1e2329', flexShrink:0, overflowX:'auto', scrollbarWidth:'none' }}>
        {['New','USDC','USDT','U','USD1'].map(t => (
          <button key={t} onClick={()=>setTab(t)}
            style={{ padding:'6px 8px', fontSize:11, background:'transparent', border:'none', color: tab===t ? '#eaecef':'#5e6673', fontWeight: tab===t ? 700:400, borderBottom: tab===t ? '2px solid #f0b90b':'2px solid transparent', cursor:'pointer', whiteSpace:'nowrap' }}>
            {t}
          </button>
        ))}
      </div>
      {/* Column headers */}
      <div style={{ display:'flex', justifyContent:'space-between', padding:'5px 12px', fontSize:10, color:'#5e6673', flexShrink:0 }}>
        <span>Pair ↑</span><span>Last Price / 24h Chg ↑</span>
      </div>
      {/* Pairs */}
      <div style={{ flex:1, overflowY:'auto', scrollbarWidth:'thin', scrollbarColor:'#2b3139 transparent' }}>
        {filtered.map(p => {
          const isPos = parseFloat(p.change) >= 0;
          return (
            <div key={p.symbol} className={`pair-row${currentCoin===p.symbol?' active':''}`}
              onClick={() => onSelect(p.symbol)}>
              <div>
                <div style={{ color:'#eaecef', fontWeight:700, fontSize:12 }}>{p.symbol}/USDT</div>
                <div style={{ color:'#5e6673', fontSize:10 }}>5x</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ color:'#eaecef', fontSize:11, fontWeight:600 }}>—</div>
                <div style={{ color: isPos ? '#0ecb81':'#f6465d', fontSize:10, fontWeight:700 }}>{p.change}%</div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Top Movers */}
      <div style={{ borderTop:'1px solid #1e2329', flexShrink:0 }}>
        <div style={{ padding:'6px 12px', display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ color:'#eaecef', fontWeight:700, fontSize:11 }}>Top Movers</span>
          <span style={{ color:'#5e6673', fontSize:10, cursor:'pointer' }}>FAQ</span>
          <ChevronDown size={12} style={{ color:'#5e6673', marginLeft:'auto', cursor:'pointer' }} />
        </div>
        {[{s:'DOGE',v:'+5.32'},{s:'LINK',v:'+4.21'},{s:'SOL',v:'+3.45'}].map(m => (
          <div key={m.s} className="mover-row">
            <span style={{ color:'#eaecef', fontWeight:700 }}>{m.s}/USDT</span>
            <span style={{ color:'#0ecb81', fontWeight:700 }}>{m.v}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── History Table ──────────────────────────────────────────────── */
const SpotHistory = ({ token, type }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    axios.get(`https://vinance-backend-1.onrender.com/api/transactions`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setData(res.data||[])).catch(()=>setData([])).finally(()=>setLoading(false));
  }, [token]);

  const cols = type === 'open' 
    ? ['Date','Pair','Type','Side','Price','Amount','Filled','Total','TP/SL']
    : ['Date','Pair','Type','Side','Amount','Status'];

  if (loading) return <div className="empty-state"><Loader2 size={16} className="spin" style={{color:'#f0b90b'}}/></div>;
  if (!data.length) return (
    <div className="empty-state">
      <FileText size={32} style={{opacity:.15}}/>
      <span>You have no open orders.</span>
    </div>
  );

  return (
    <div style={{ overflowX:'auto', padding:'0 4px' }}>
      <table style={{ width:'100%', fontSize:11, borderCollapse:'collapse' }}>
        <thead>
          <tr style={{ borderBottom:'1px solid #1e2329' }}>
            {cols.map(c => <th key={c} style={{ padding:'6px 10px', color:'#5e6673', textAlign:'left', fontWeight:600, fontSize:10, whiteSpace:'nowrap' }}>{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.filter(t=>t.type!=='trade').map((t,i) => (
            <tr key={i} style={{ borderBottom:'1px solid #1e232960' }}>
              <td style={{ padding:'7px 10px', color:'#848e9c', whiteSpace:'nowrap' }}>{new Date(t.date||t.createdAt).toLocaleString()}</td>
              <td style={{ padding:'7px 10px', color:'#eaecef', fontWeight:700 }}>{(t.symbol||'USDT')}/USDT</td>
              {type==='open' ? <>
                <td style={{ padding:'7px 10px', color:'#f0b90b' }}>Market</td>
                <td style={{ padding:'7px 10px', color: t.type==='deposit'?'#0ecb81':'#f6465d', fontWeight:700 }}>{t.type==='deposit'?'Buy':'Sell'}</td>
                <td style={{ padding:'7px 10px', color:'#eaecef' }}>—</td>
                <td style={{ padding:'7px 10px', color:'#eaecef' }}>{t.amount?.toFixed(4)}</td>
                <td style={{ padding:'7px 10px', color:'#eaecef' }}>{t.amount?.toFixed(4)}</td>
                <td style={{ padding:'7px 10px', color:'#eaecef' }}>{t.amount?.toFixed(2)}</td>
                <td style={{ padding:'7px 10px', color:'#5e6673' }}>—/—</td>
              </> : <>
                <td style={{ padding:'7px 10px', color:'#f0b90b' }}>Market</td>
                <td style={{ padding:'7px 10px', color: t.type==='deposit'?'#0ecb81':'#f6465d', fontWeight:700, textTransform:'uppercase' }}>{t.type}</td>
                <td style={{ padding:'7px 10px', color:'#eaecef' }}>{t.amount?.toFixed(4)}</td>
                <td style={{ padding:'7px 10px' }}>
                  <span style={{ padding:'2px 8px', borderRadius:10, fontSize:10, fontWeight:700,
                    background: t.status==='completed'||t.status==='approved'?'rgba(14,203,129,.1)':'rgba(240,185,11,.1)',
                    color: t.status==='completed'||t.status==='approved'?'#0ecb81':'#f0b90b'
                  }}>{t.status}</span>
                </td>
              </>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* ─── Main Trade Component ───────────────────────────────────────── */
const Trade = () => {
  const { coinSymbol } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser, token } = useContext(UserContext);

  const coin = (coinSymbol || 'BTC').toUpperCase();

  const [currentPrice, setCurrentPrice] = useState('0.00');
  const [priceUp, setPriceUp] = useState(true);
  const [flashCls, setFlashCls] = useState('');
  const [ticker, setTicker] = useState({ changePct:'0.00', change:'0.00', high:'0', low:'0', volBase:'0', volUsdt:'0' });

  const [activeSectionTab, setActiveSectionTab] = useState('Chart');
  const [activeTimeframe, setActiveTimeframe] = useState('1D');
  const [activeOrderType, setActiveOrderType] = useState('Market');
  const [activePosTab, setActivePosTab] = useState('open_orders');

  const [buyAmount, setBuyAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [buyPct, setBuyPct] = useState(0);
  const [sellPct, setSellPct] = useState(0);
  const [buySlippage, setBuySlippage] = useState(false);
  const [sellSlippage, setSellSlippage] = useState(false);
  const [loading, setLoading] = useState(false);

  const prevRef = useRef(null);
  const tfMap = { '1s':'1','15m':'15','1H':'60','4H':'240','1D':'1D','1W':'1W' };

  // Live WebSocket
  useEffect(() => {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${coin.toLowerCase()}usdt@ticker`);
    ws.onmessage = (e) => {
      const d = JSON.parse(e.data);
      const price = parseFloat(d.c);
      const up = prevRef.current === null ? true : price >= prevRef.current;
      prevRef.current = price;
      setPriceUp(up);
      setFlashCls(up ? 'fg':'fr');
      setTimeout(() => setFlashCls(''), 420);
      setCurrentPrice(price.toFixed(2));
      setTicker({
        changePct: parseFloat(d.P).toFixed(2),
        change: parseFloat(d.p).toFixed(2),
        high: parseFloat(d.h).toFixed(2),
        low: parseFloat(d.l).toFixed(2),
        volBase: parseFloat(d.v).toLocaleString(undefined,{maximumFractionDigits:2}),
        volUsdt: (parseFloat(d.q)/1e9).toFixed(2)+'B',
      });
    };
    ws.onerror = () => ws.close();
    return () => ws.close();
  }, [coin]);

  const handleTrade = async (side) => {
    const rawAmt = side === 'buy' ? parseFloat(buyAmount) : parseFloat(sellAmount);
    if (!rawAmt || rawAmt <= 0) return toast.error('Enter a valid amount');
    if (rawAmt > (user?.balance || 0)) return toast.error('Insufficient balance');
    setLoading(true);
    try {
      const res = await axios.post(
        `https://vinance-backend-1.onrender.com/api/trade`,
        { type: side, amount: rawAmt, symbol: coin },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message || `${side === 'buy' ? 'Bought':'Sold'} successfully!`);
      if (side === 'buy') setBuyAmount(''); else setSellAmount('');
      await refreshUser?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Trade failed');
    } finally { setLoading(false); }
  };

  const changePctNum = parseFloat(ticker.changePct);
  const changeColor = changePctNum >= 0 ? '#0ecb81':'#f6465d';

  const displayPrice = parseFloat(currentPrice).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});

  const pctButtons = [0, 25, 50, 75, 100];

  return (
    <>
      <TradeStyles />
      <div className="spot-wrap">

        {/* ── HEADER ── */}
        <div className="spot-header">
          {/* Coin info */}
          <div style={{ display:'flex', alignItems:'center', gap:8, minWidth:0 }}>
            <div style={{ width:32, height:32, background:'#f0b90b', borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, color:'#0b0e11', fontSize:13 }}>
              {coin[0]}
            </div>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ color:'#eaecef', fontWeight:800, fontSize:18, letterSpacing:-0.5 }}>{coin}/USDT</span>
                <span style={{ color:'#5e6673', fontSize:11 }}>Bitcoin Price</span>
                <ChevronDown size={13} style={{ color:'#5e6673' }} />
              </div>
            </div>
          </div>

          {/* Price */}
          <div>
            <div className={flashCls} style={{ color: priceUp ? '#f6465d':'#0ecb81', fontSize:22, fontWeight:800, lineHeight:1 }}>
              {displayPrice}
            </div>
            <div style={{ display:'flex', gap:6, alignItems:'center', marginTop:2 }}>
              <span style={{ color:'#848e9c', fontSize:11 }}>${displayPrice}</span>
              <span style={{ color: changeColor, fontSize:11, fontWeight:700 }}>
                {changePctNum>=0?'':''}{ticker.change} {changePctNum>=0?'+':''}{ticker.changePct}%
              </span>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display:'flex', gap:16, overflow:'hidden', flexWrap:'wrap' }}>
            {[
              { l:'24h High', v: ticker.high },
              { l:'24h Low',  v: ticker.low  },
              { l:`24h Vol(${coin})`, v: ticker.volBase },
              { l:'24h Vol(USDT)', v: ticker.volUsdt },
            ].map(({ l, v }) => (
              <div key={l} style={{ fontSize:11 }}>
                <div style={{ color:'#5e6673' }}>{l}</div>
                <div style={{ color:'#eaecef', fontWeight:600 }}>{v}</div>
              </div>
            ))}
          </div>

          <div style={{ display:'flex', gap:12, color:'#5e6673', marginLeft:'auto', flexShrink:0 }}>
            <Bell size={17} style={{ cursor:'pointer' }} />
            <Star size={17} style={{ cursor:'pointer' }} />
          </div>
        </div>

        {/* ── SECTION TABS ── */}
        <div className="spot-section-tabs">
          {['Chart','Info','Trading Data','Trading Analysis','Square'].map(t => (
            <button key={t} className={`spot-section-tab${activeSectionTab===t?' active':''}`}
              onClick={() => setActiveSectionTab(t)}>
              {t}
            </button>
          ))}
        </div>

        {/* ── MAIN ── */}
        <div className="spot-main">

          {/* ── LEFT: Order Book + Pairs ── */}
          <div className="spot-left">
            <div style={{ flex:1, minHeight:0, overflow:'hidden', display:'flex', flexDirection:'column' }}>
              <SpotOrderBook symbol={coin} currentPrice={currentPrice} priceUp={priceUp} />
            </div>
            <div style={{ borderTop:'1px solid #1e2329', height:280, overflow:'hidden' }}>
              <PairsList currentCoin={coin} onSelect={(sym) => navigate(`/trade/${sym}`)} />
            </div>
          </div>

          {/* ── CENTER: Chart + Bottom Tabs ── */}
          <div className="spot-center">
            {/* TF bar */}
            <div className="spot-tf-bar">
              {['1s','15m','1H','4H','1D','1W'].map(tf => (
                <button key={tf} className={`spot-tf-btn${activeTimeframe===tf?' active':''}`}
                  onClick={() => setActiveTimeframe(tf)}>{tf}</button>
              ))}
              <span style={{ color:'#848e9c', fontSize:11, marginLeft:6 }}>Depth</span>
              <div style={{ marginLeft:'auto', display:'flex', gap:10, color:'#848e9c' }}>
                <span style={{ fontSize:11, cursor:'pointer', color: activeSectionTab==='Chart'?'#f0b90b':'#848e9c' }}>Original</span>
                <span style={{ fontSize:11, cursor:'pointer' }}>Trading View</span>
              </div>
            </div>

            {/* Chart area */}
            <div style={{ flex:1, minHeight:0, position:'relative', background:'#0b0e11' }}>
              {activeSectionTab === 'Chart' && (
                <iframe
                  key={`${coin}-${activeTimeframe}`}
                  title="Spot Chart"
                  src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${coin}USDT&interval=${tfMap[activeTimeframe]||'1D'}&theme=dark&style=1&timezone=Etc%2FUTC&hide_top_toolbar=0&allow_symbol_change=0&locale=en`}
                  style={{ position:'absolute', inset:0, width:'100%', height:'100%', border:'none' }}
                />
              )}
              {activeSectionTab === 'Info' && (
                <div style={{ padding:20, color:'#848e9c', fontSize:13, lineHeight:1.9 }}>
                  <h3 style={{ color:'#eaecef', marginBottom:12 }}>{coin} Information</h3>
                  {[
                    ['Network', 'BTC (5)'],
                    ['Token Tags', 'Payments | PoW | Layer 1'],
                    ['Market Cap', '$1.58T'],
                    ['Circulating Supply', '19.7M BTC'],
                    ['Max Supply', '21M BTC'],
                    ['All-Time High', '$108,786'],
                  ].map(([k,v]) => (
                    <div key={k} style={{ display:'flex', gap:16, padding:'6px 0', borderBottom:'1px solid #1e2329' }}>
                      <span style={{ color:'#5e6673', minWidth:160 }}>{k}</span>
                      <span style={{ color:'#eaecef', fontWeight:600 }}>{v}</span>
                    </div>
                  ))}
                </div>
              )}
              {activeSectionTab === 'Trading Data' && (
                <div style={{ padding:20, color:'#848e9c', fontSize:13 }}>
                  <h3 style={{ color:'#eaecef', marginBottom:12 }}>Trading Data</h3>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px 24px' }}>
                    {[
                      ['Buy/Sell Ratio','44.13% / 55.87%'],
                      ['Buy Volume',`${(Math.random()*100+50).toFixed(2)} BTC`],
                      ['Sell Volume',`${(Math.random()*100+50).toFixed(2)} BTC`],
                      ['Bid/Ask Spread','$0.01'],
                      ['Avg. Trade Size',`${(Math.random()*0.1+0.01).toFixed(4)} BTC`],
                      ['Trades Count',`${(Math.random()*5000+10000).toFixed(0)}`],
                    ].map(([k,v]) => (
                      <div key={k} style={{ padding:'8px 0', borderBottom:'1px solid #1e2329' }}>
                        <div style={{ color:'#5e6673', fontSize:11, marginBottom:4 }}>{k}</div>
                        <div style={{ color:'#eaecef', fontWeight:700, fontSize:14 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  {/* Buy/Sell bar */}
                  <div style={{ marginTop:16 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:6 }}>
                      <span style={{ color:'#0ecb81', fontWeight:700 }}>B 44.12%</span>
                      <span style={{ color:'#f6465d', fontWeight:700 }}>S 55.87%</span>
                    </div>
                    <div style={{ height:6, borderRadius:3, overflow:'hidden', display:'flex' }}>
                      <div style={{ width:'44.12%', background:'#0ecb81' }} />
                      <div style={{ width:'55.87%', background:'#f6465d' }} />
                    </div>
                  </div>
                </div>
              )}
              {activeSectionTab === 'Trading Analysis' && (
                <div style={{ padding:20, color:'#848e9c', fontSize:13 }}>
                  <h3 style={{ color:'#eaecef', marginBottom:12 }}>Technical Analysis</h3>
                  <p>Advanced trading analysis tools coming soon.</p>
                </div>
              )}
              {activeSectionTab === 'Square' && (
                <div style={{ padding:20, color:'#848e9c', fontSize:13 }}>
                  <h3 style={{ color:'#eaecef', marginBottom:12 }}>Square — Social Trading</h3>
                  <p>Community insights and trading signals coming soon.</p>
                </div>
              )}
            </div>

            {/* ── BOTTOM ORDER HISTORY ── */}
            <div style={{ height:260, display:'flex', flexDirection:'column', borderTop:'1px solid #1e2329' }}>
              <div className="spot-pos-tabs">
                {[
                  { key:'open_orders', label:'Open Orders(0)' },
                  { key:'order_history', label:'Order History' },
                  { key:'trade_history', label:'Trade History' },
                  { key:'holdings', label:'Holdings' },
                  { key:'bots', label:'Bots' },
                ].map(t => (
                  <button key={t.key} className={`spot-pos-tab${activePosTab===t.key?' active':''}`}
                    onClick={() => setActivePosTab(t.key)}>
                    {t.label}
                  </button>
                ))}
                <button style={{ marginLeft:'auto', background:'none', border:'none', color:'#5e6673', cursor:'pointer', padding:'0 8px', fontSize:12 }}>
                  Hide Other Pairs
                </button>
              </div>
              <div style={{ flex:1, overflowY:'auto', scrollbarWidth:'thin', scrollbarColor:'#2b3139 transparent' }}>
                {activePosTab === 'open_orders' && (
                  <div className="empty-state">
                    <FileText size={32} style={{opacity:.15}}/>
                    <span>You have no open orders.</span>
                  </div>
                )}
                {(activePosTab === 'order_history' || activePosTab === 'trade_history') && (
                  <SpotHistory token={token} type="history" />
                )}
                {activePosTab === 'holdings' && (
                  <div style={{ padding:16, fontSize:12 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #1e2329' }}>
                      <span style={{ color:'#5e6673' }}>USDT Balance</span>
                      <span style={{ color:'#eaecef', fontWeight:700 }}>{(user?.balance||0).toFixed(4)} USDT</span>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #1e2329' }}>
                      <span style={{ color:'#5e6673' }}>{coin} Balance</span>
                      <span style={{ color:'#eaecef', fontWeight:700 }}>0.00000000 {coin}</span>
                    </div>
                  </div>
                )}
                {activePosTab === 'bots' && (
                  <div className="empty-state">
                    <span>No active bots.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Trade Form ── */}
          <div className="spot-right">
            {/* Spot/Cross/Isolated tabs */}
            <div style={{ display:'flex', padding:'0 12px', borderBottom:'1px solid #1e2329' }}>
              {['Spot','Cross','Isolated','Grid'].map(t => (
                <button key={t} style={{ padding:'9px 10px', fontSize:12, background:'transparent', border:'none', color: t==='Spot'?'#eaecef':'#848e9c', fontWeight: t==='Spot'?700:400, borderBottom: t==='Spot'?'2px solid #f0b90b':'2px solid transparent', cursor:'pointer' }}>{t}</button>
              ))}
              <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8, color:'#5e6673', fontSize:11, paddingRight:4 }}>
                <span style={{ cursor:'pointer' }}>% Fee Level</span>
              </div>
            </div>

            {/* Order type tabs */}
            <div style={{ display:'flex', padding:'0 8px', borderBottom:'1px solid #1e2329' }}>
              {['Limit','Market','Stop Limit'].map(t => (
                <button key={t} className={`order-type-btn${activeOrderType===t?' active':''}`}
                  onClick={() => setActiveOrderType(t)}>{t}</button>
              ))}
            </div>

            {/* Buy + Sell side by side */}
            <div style={{ display:'flex', gap:0, flex:1, minHeight:0 }}>
              {/* BUY SIDE */}
              <div style={{ flex:1, padding:'14px 12px', display:'flex', flexDirection:'column', gap:10, borderRight:'1px solid #1e2329' }}>
                {activeOrderType === 'Limit' && (
                  <div className="spot-input-wrap">
                    <input className="spot-input" type="number" placeholder="Price" style={{ paddingRight:70 }} />
                    <span className="spot-input-suffix">Market Price</span>
                  </div>
                )}
                <div className="spot-input-wrap">
                  <input className="spot-input" type="number" value={buyAmount}
                    onChange={e => setBuyAmount(e.target.value)}
                    placeholder="Total" />
                  <span className="spot-input-suffix">USDT <ChevronDown size={10} style={{display:'inline'}}/></span>
                </div>
                {/* Pct slider */}
                <div>
                  <div className="slider-track" onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pct = Math.round(((e.clientX-rect.left)/rect.width)*100/25)*25;
                    setBuyPct(Math.min(100,Math.max(0,pct)));
                    setBuyAmount(((user?.balance||0)*(pct/100)).toFixed(2));
                  }}>
                    <div className="slider-fill" style={{ width:`${buyPct}%`, background:'#0ecb81' }} />
                    <div className="slider-thumb" style={{ left:`${buyPct}%`, background:'#0ecb81' }} />
                  </div>
                  <div style={{ display:'flex', gap:2, marginTop:6 }}>
                    {pctButtons.map(p => (
                      <button key={p} className="pct-btn" onClick={() => {
                        setBuyPct(p);
                        setBuyAmount(((user?.balance||0)*(p/100)).toFixed(2));
                      }}>{p}%</button>
                    ))}
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <input type="checkbox" checked={buySlippage} onChange={e=>setBuySlippage(e.target.checked)} style={{ accentColor:'#f0b90b' }} />
                  <span style={{ fontSize:11, color:'#848e9c' }}>Slippage Tolerance</span>
                </div>
                <div style={{ fontSize:10, color:'#5e6673', display:'flex', justifyContent:'space-between' }}>
                  <span>Avbl <ChevronDown size={8} style={{display:'inline'}}/></span>
                  <span style={{ color:'#eaecef' }}>{(user?.balance||0).toFixed(8)} USDT <span style={{color:'#f0b90b',cursor:'pointer'}}>+</span></span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'#5e6673' }}>
                  <span>Max Buy</span><span style={{color:'#eaecef'}}>0 {coin}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'#5e6673' }}>
                  <span>Est. Fee</span><span style={{color:'#eaecef'}}>--</span>
                </div>
                <button className="buy-submit" disabled={loading || !buyAmount}
                  onClick={() => handleTrade('buy')}>
                  {loading ? <Loader2 size={16} className="spin" style={{margin:'0 auto'}}/> : `Buy ${coin}`}
                </button>
              </div>

              {/* SELL SIDE */}
              <div style={{ flex:1, padding:'14px 12px', display:'flex', flexDirection:'column', gap:10 }}>
                {activeOrderType === 'Limit' && (
                  <div className="spot-input-wrap">
                    <input className="spot-input" type="number" placeholder="Price" style={{ paddingRight:70 }} />
                    <span className="spot-input-suffix">Market Price</span>
                  </div>
                )}
                <div className="spot-input-wrap">
                  <input className="spot-input" type="number" value={sellAmount}
                    onChange={e => setSellAmount(e.target.value)}
                    placeholder="Amount" />
                  <span className="spot-input-suffix">{coin} <ChevronDown size={10} style={{display:'inline'}}/></span>
                </div>
                {/* Pct slider */}
                <div>
                  <div className="slider-track" onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pct = Math.round(((e.clientX-rect.left)/rect.width)*100/25)*25;
                    setSellPct(Math.min(100,Math.max(0,pct)));
                    setSellAmount(((user?.balance||0)*(pct/100)).toFixed(2));
                  }}>
                    <div className="slider-fill" style={{ width:`${sellPct}%`, background:'#f6465d' }} />
                    <div className="slider-thumb" style={{ left:`${sellPct}%`, background:'#f6465d' }} />
                  </div>
                  <div style={{ display:'flex', gap:2, marginTop:6 }}>
                    {pctButtons.map(p => (
                      <button key={p} className="pct-btn" onClick={() => {
                        setSellPct(p);
                        setSellAmount(((user?.balance||0)*(p/100)).toFixed(2));
                      }}>{p}%</button>
                    ))}
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <input type="checkbox" checked={sellSlippage} onChange={e=>setSellSlippage(e.target.checked)} style={{ accentColor:'#f0b90b' }} />
                  <span style={{ fontSize:11, color:'#848e9c' }}>Slippage Tolerance</span>
                </div>
                <div style={{ fontSize:10, color:'#5e6673', display:'flex', justifyContent:'space-between' }}>
                  <span>Avbl <ChevronDown size={8} style={{display:'inline'}}/></span>
                  <span style={{ color:'#eaecef' }}>0.00000000 {coin} <span style={{color:'#f0b90b',cursor:'pointer'}}>+</span></span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'#5e6673' }}>
                  <span>Max Sell</span><span style={{color:'#eaecef'}}>0 USDT</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'#5e6673' }}>
                  <span>Est. Fee</span><span style={{color:'#eaecef'}}>--</span>
                </div>
                <button className="sell-submit" disabled={loading || !sellAmount}
                  onClick={() => handleTrade('sell')}>
                  {loading ? <Loader2 size={16} className="spin" style={{margin:'0 auto'}}/> : `Sell ${coin}`}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom marquee */}
        <div style={{ display:'flex', gap:16, padding:'5px 12px', background:'#0b0e11', borderTop:'1px solid #1e2329', fontSize:10, overflow:'hidden' }}>
          <div style={{ display:'flex', gap:16, animation:'scrollLeft 60s linear infinite', whiteSpace:'nowrap' }}>
            {['BTC','ETH','BNB','SOL','XRP','DOGE','ADA','AVAX'].map(s => (
              <span key={s}><span style={{color:'#5e6673',fontWeight:700}}>{s}/USDT</span> <span style={{color:'#0ecb81'}}>+1.23%</span></span>
            ))}
          </div>
          <div style={{ marginLeft:'auto', display:'flex', gap:12, color:'#5e6673', flexShrink:0 }}>
            <span style={{cursor:'pointer'}}>Announcements</span>
            <span style={{cursor:'pointer'}}>Cookie Preference</span>
            <span style={{cursor:'pointer'}}>Online Support</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Trade;
