import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { ChevronLeft, RefreshCw, Search, ArrowUpRight, ArrowDownLeft, TrendingUp, TrendingDown, Loader2, FileText } from 'lucide-react';

const API_BASE = "https://vinance-backend-1.onrender.com";

const TABS = [
  { key:'all',      label:'All' },
  { key:'deposit',  label:'Deposit' },
  { key:'withdraw', label:'Withdraw' },
  { key:'trade',    label:'Spot' },
  { key:'futures',  label:'Futures' },
  { key:'investment', label:'Investment' },
];

const STATUS_COLOR = {
  approved:  { bg:'rgba(14,203,129,.12)',  color:'#0ecb81' },
  completed: { bg:'rgba(14,203,129,.12)',  color:'#0ecb81' },
  pending:   { bg:'rgba(240,185,11,.12)', color:'#f0b90b' },
  rejected:  { bg:'rgba(246,70,93,.12)',  color:'#f6465d' },
};

const typeIcon = (type) => {
  if (type?.includes('deposit'))    return <ArrowDownLeft size={14} color="#0ecb81"/>;
  if (type?.includes('withdraw'))   return <ArrowUpRight  size={14} color="#f6465d"/>;
  if (type?.includes('buy'))        return <TrendingUp    size={14} color="#0ecb81"/>;
  if (type?.includes('sell'))       return <TrendingDown  size={14} color="#f6465d"/>;
  if (type?.includes('futures'))    return <TrendingUp    size={14} color="#f0b90b"/>;
  return <FileText size={14} color="#848e9c"/>;
};

const typeLabel = (type) => {
  const map = {
    'deposit':'Deposit','withdraw':'Withdraw',
    'spot-buy':'Spot Buy','spot-sell':'Spot Sell',
    'futures-buy':'Futures Long','futures-sell':'Futures Short',
    'investment':'Investment','trade':'Trade',
  };
  return map[type] || (type || 'Transaction');
};

export default function HistoryPage() {
  const navigate = useNavigate();
  const { token } = useContext(UserContext);

  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;

  const fetchHistory = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/transactions`, { headers:{ Authorization:`Bearer ${token}` } });
      setTxns(Array.isArray(res.data) ? res.data : []);
    } catch { setTxns([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchHistory(); }, [token]);

  const filtered = txns.filter(t => {
    const matchTab = activeTab==='all' ? true
      : activeTab==='trade'   ? t.type?.includes('spot')
      : activeTab==='futures' ? t.type?.includes('futures')
      : t.type?.includes(activeTab);
    const matchSearch = search
      ? (t.type?.toLowerCase().includes(search.toLowerCase()) ||
         t.symbol?.toLowerCase().includes(search.toLowerCase()) ||
         t.status?.toLowerCase().includes(search.toLowerCase()) ||
         String(t.amount)?.includes(search))
      : true;
    return matchTab && matchSearch;
  });

  const paginated = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);
  const totalPages = Math.ceil(filtered.length/PER_PAGE);

  const totalDeposit  = txns.filter(t=>t.type==='deposit'  && (t.status==='approved'||t.status==='completed')).reduce((s,t)=>s+(t.amount||0),0);
  const totalWithdraw = txns.filter(t=>t.type==='withdraw' && (t.status==='approved'||t.status==='completed')).reduce((s,t)=>s+(t.amount||0),0);
  const totalTrades   = txns.filter(t=>t.type?.includes('spot')||t.type?.includes('futures')||t.type==='trade').length;

  return (
    <div style={{ background:'#0b0e11', color:'#eaecef', minHeight:'100dvh', fontFamily:"'Inter','Roboto',sans-serif", fontSize:13 }}>
      <style>{`
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#2b3139}
        .nsb{scrollbar-width:none}.nsb::-webkit-scrollbar{display:none}
        .hist-tab{padding:9px 14px 8px;font-size:12px;background:transparent;border:none;cursor:pointer;color:#848e9c;border-bottom:2px solid transparent;white-space:nowrap;font-family:inherit;font-weight:500;transition:all .15s;}
        .hist-tab.active{color:#eaecef;border-bottom-color:#f0b90b;font-weight:700;}
        .hist-row{display:grid;grid-template-columns:2fr 1.2fr 1fr 1fr;gap:8px;padding:12px 16px;border-bottom:1px solid #1e2329;align-items:center;transition:background .15s;}
        .hist-row:hover{background:rgba(255,255,255,.02);}
        @keyframes spin{to{transform:rotate(360deg)}}
        .spin{animation:spin .8s linear infinite}
      `}</style>

      {/* Header */}
      <div style={{ background:'#161a1e', borderBottom:'1px solid #1e2329', padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button onClick={()=>navigate(-1)} style={{ background:'none', border:'none', cursor:'pointer', color:'#eaecef', display:'flex' }}>
            <ChevronLeft size={20}/>
          </button>
          <span style={{ fontWeight:700, fontSize:16 }}>Transaction History</span>
        </div>
        <button onClick={fetchHistory} style={{ background:'none', border:'none', cursor:'pointer', color:'#848e9c', display:'flex', alignItems:'center', gap:4, fontSize:12 }}>
          <RefreshCw size={14} style={loading?{animation:'spin .8s linear infinite'}:{}}/>
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:1, background:'#1e2329', borderBottom:'1px solid #1e2329' }}>
        {[
          { label:'Total Deposited', value:`$${totalDeposit.toFixed(2)}`,  color:'#0ecb81' },
          { label:'Total Withdrawn', value:`$${totalWithdraw.toFixed(2)}`, color:'#f6465d' },
          { label:'Total Trades',    value:totalTrades,                     color:'#f0b90b' },
        ].map(s => (
          <div key={s.label} style={{ padding:'14px 16px', background:'#161a1e', textAlign:'center' }}>
            <div style={{ fontSize:10, color:'#5e6673', marginBottom:4, textTransform:'uppercase', letterSpacing:'.05em' }}>{s.label}</div>
            <div style={{ fontSize:20, fontWeight:800, color:s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ padding:'12px 16px', display:'flex', gap:10, alignItems:'center', borderBottom:'1px solid #1e2329' }}>
        <div style={{ flex:1, position:'relative' }}>
          <Search size={14} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#5e6673' }}/>
          <input type="text" placeholder="Search by type, symbol, status..."
            value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}
            style={{ width:'100%', background:'#1e2329', border:'1px solid #2b3139', borderRadius:6, padding:'8px 10px 8px 32px', color:'#eaecef', fontSize:12, outline:'none', boxSizing:'border-box' }}/>
        </div>
      </div>

      {/* Tabs */}
      <div className="nsb" style={{ display:'flex', padding:'0 16px', borderBottom:'1px solid #1e2329', overflowX:'auto' }}>
        {TABS.map(t => (
          <button key={t.key} className={`hist-tab${activeTab===t.key?' active':''}`} onClick={()=>{setActiveTab(t.key);setPage(1);}}>{t.label}</button>
        ))}
      </div>

      {/* Table Header */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1.2fr 1fr 1fr', gap:8, padding:'8px 16px', background:'#0b0e11', fontSize:10, fontWeight:700, color:'#5e6673', textTransform:'uppercase', letterSpacing:'.05em', borderBottom:'1px solid #1e2329' }}>
        <span>Type / Date</span><span>Amount</span><span>Symbol</span><span style={{textAlign:'right'}}>Status</span>
      </div>

      {/* Table Body */}
      <div style={{ minHeight:300 }}>
        {loading && (
          <div style={{ display:'flex', justifyContent:'center', padding:40 }}>
            <Loader2 size={22} className="spin" style={{ color:'#f0b90b' }}/>
          </div>
        )}
        {!loading && paginated.length===0 && (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'48px 0', gap:10, color:'#3a3f47' }}>
            <FileText size={32} style={{ opacity:.3 }}/>
            <span style={{ fontSize:13 }}>No transactions found</span>
          </div>
        )}
        {!loading && paginated.map((t,i) => {
          const sc = STATUS_COLOR[t.status] || { bg:'rgba(132,142,156,.1)', color:'#848e9c' };
          const date = new Date(t.createdAt||t.date);
          return (
            <div key={t._id||i} className="hist-row">
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:32, height:32, borderRadius:'50%', background:'#1e2329', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {typeIcon(t.type)}
                </div>
                <div>
                  <div style={{ fontWeight:700, color:'#eaecef', fontSize:12 }}>{typeLabel(t.type)}</div>
                  <div style={{ fontSize:10, color:'#5e6673', marginTop:2 }}>{isNaN(date)?'—':date.toLocaleString()}</div>
                </div>
              </div>
              <div>
                <div style={{ fontWeight:700, color:'#eaecef', fontFamily:'monospace' }}>${(t.amount||0).toFixed(2)}</div>
              </div>
              <div style={{ color:'#848e9c', fontSize:12 }}>{t.symbol||'USDT'}</div>
              <div style={{ textAlign:'right' }}>
                <span style={{ background:sc.bg, color:sc.color, padding:'3px 10px', borderRadius:20, fontSize:10, fontWeight:700, textTransform:'uppercase' }}>
                  {t.status||'pending'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages>1 && (
        <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:8, padding:'16px 0', borderTop:'1px solid #1e2329' }}>
          <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
            style={{ padding:'6px 14px', background:'#1e2329', border:'1px solid #2b3139', borderRadius:4, color:page===1?'#5e6673':'#eaecef', cursor:page===1?'not-allowed':'pointer', fontSize:12 }}>
            ← Prev
          </button>
          <span style={{ fontSize:12, color:'#848e9c' }}>Page {page} of {totalPages}</span>
          <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
            style={{ padding:'6px 14px', background:'#1e2329', border:'1px solid #2b3139', borderRadius:4, color:page===totalPages?'#5e6673':'#eaecef', cursor:page===totalPages?'not-allowed':'pointer', fontSize:12 }}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
