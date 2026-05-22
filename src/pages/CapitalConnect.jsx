/* CapitalConnect.jsx */
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { Globe, TrendingUp, Shield, Users, ChevronRight, Star, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  .cc{font-family:'Inter',sans-serif;background:#0b0e11;color:#eaecef;min-height:100vh;}
  .cc *{box-sizing:border-box;}
  .cc-card{background:#161a1e;border:1px solid #1e2329;border-radius:16px;padding:24px;transition:all .2s;}
  .cc-card:hover{border-color:#f0b90b30;}
  .cc-btn{padding:10px 24px;border:none;border-radius:8px;font-weight:700;font-size:13px;cursor:pointer;font-family:inherit;transition:all .15s;}
`;

const FUNDS = [
  { name:'Vinance Growth Fund',    aum:'$124M',  return:'+34.2%', risk:'Medium', min:'$1,000',  investors:2840, rating:4.8 },
  { name:'Crypto Blue Chip Fund',  aum:'$89M',   return:'+22.8%', risk:'Low',    min:'$500',    investors:5120, rating:4.9 },
  { name:'DeFi Alpha Fund',        aum:'$45M',   return:'+67.4%', risk:'High',   min:'$2,500',  investors:890,  rating:4.6 },
  { name:'BNB Ecosystem Fund',     aum:'$67M',   return:'+41.3%', risk:'Medium', min:'$1,000',  investors:1560, rating:4.7 },
];

const CapitalConnect = () => {
  const { user, token } = useContext(UserContext);
  const [tab, setTab] = useState('funds');

  const apply = (fund) => toast.success(`Application sent for ${fund.name}`);

  return (
    <>
      <style>{css}</style>
      <div className="cc">
        {/* Hero */}
        <div style={{ background:'linear-gradient(135deg,#161a1e,#1e2329)', padding:'48px 24px', borderBottom:'1px solid #1e2329', textAlign:'center' }}>
          <div style={{ display:'flex', justifyContent:'center', marginBottom:12 }}>
            <div style={{ width:56, height:56, background:'rgba(240,185,11,.12)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Globe size={28} style={{ color:'#f0b90b' }}/>
            </div>
          </div>
          <h1 style={{ fontSize:32, fontWeight:800, color:'#eaecef', marginBottom:8 }}>Capital Connect</h1>
          <p style={{ color:'#848e9c', fontSize:15, maxWidth:500, margin:'0 auto 20px' }}>
            Connect with institutional investors and professional fund managers
          </p>
          <div style={{ display:'flex', justifyContent:'center', gap:16, flexWrap:'wrap' }}>
            {[['$2.4B+','Total AUM'],['12,000+','Investors'],['180+','Countries'],['4.8★','Rating']].map(([v,l]) => (
              <div key={l} style={{ textAlign:'center' }}>
                <div style={{ fontSize:22, fontWeight:800, color:'#f0b90b' }}>{v}</div>
                <div style={{ fontSize:11, color:'#5e6673' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ maxWidth:1100, margin:'0 auto', padding:'24px' }}>
          {/* Tabs */}
          <div style={{ display:'flex', borderBottom:'1px solid #1e2329', marginBottom:24 }}>
            {[{k:'funds',l:'Investment Funds'},{k:'vc',l:'Venture Capital'},{k:'apply',l:'Apply as Fund'}].map(t => (
              <button key={t.k} onClick={()=>setTab(t.k)}
                style={{ padding:'9px 16px', fontSize:12, fontWeight:600, background:'transparent', border:'none', cursor:'pointer', color:tab===t.k?'#eaecef':'#848e9c', borderBottom:tab===t.k?'2px solid #f0b90b':'2px solid transparent', fontFamily:'inherit', whiteSpace:'nowrap' }}>{t.l}
              </button>
            ))}
          </div>

          {tab==='funds' && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
              {FUNDS.map((fund, i) => (
                <div key={i} className="cc-card">
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                    <div>
                      <h3 style={{ color:'#eaecef', fontWeight:700, fontSize:14, marginBottom:4 }}>{fund.name}</h3>
                      <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:10, color:'#f0b90b' }}>
                        {Array(5).fill(0).map((_,i) => <Star key={i} size={10} style={{ fill: i < Math.floor(fund.rating) ? '#f0b90b' : 'none' }}/>)}
                        <span style={{ color:'#848e9c', marginLeft:2 }}>{fund.rating}</span>
                      </div>
                    </div>
                    <span style={{ background:fund.risk==='Low'?'rgba(14,203,129,.1)':fund.risk==='High'?'rgba(246,70,93,.1)':'rgba(240,185,11,.1)', color:fund.risk==='Low'?'#0ecb81':fund.risk==='High'?'#f6465d':'#f0b90b', padding:'2px 8px', borderRadius:10, fontSize:10, fontWeight:700 }}>
                      {fund.risk}
                    </span>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
                    {[['AUM',fund.aum,'#eaecef'],['Annual Return',fund.return,'#0ecb81'],['Min Investment',fund.min,'#eaecef'],['Investors',fund.investors.toLocaleString(),'#eaecef']].map(([l,v,c]) => (
                      <div key={l} style={{ background:'#0b0e11', borderRadius:6, padding:'8px 10px' }}>
                        <div style={{ fontSize:9, color:'#5e6673', marginBottom:2 }}>{l}</div>
                        <div style={{ fontSize:12, fontWeight:700, color:c }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <button className="cc-btn" onClick={()=>apply(fund)} style={{ width:'100%', background:'rgba(240,185,11,.1)', color:'#f0b90b', border:'1px solid rgba(240,185,11,.3)' }}>
                    Apply to Invest →
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab==='vc' && (
            <div style={{ textAlign:'center', padding:'60px 0', color:'#5e6673' }}>
              <Globe size={48} style={{ opacity:.15, margin:'0 auto 12px', display:'block' }}/>
              <h3 style={{ color:'#eaecef', fontSize:18, fontWeight:700, marginBottom:8 }}>Venture Capital Network</h3>
              <p style={{ fontSize:13, marginBottom:20 }}>Connect with top-tier crypto VCs for your project</p>
              <button className="cc-btn" onClick={()=>toast.success('VC network application submitted!')} style={{ background:'#f0b90b', color:'#0b0e11' }}>Apply Now</button>
            </div>
          )}

          {tab==='apply' && (
            <div style={{ maxWidth:500, margin:'0 auto' }}>
              <h3 style={{ color:'#eaecef', fontSize:18, fontWeight:700, marginBottom:16 }}>Register Your Fund</h3>
              {['Fund Name','Fund Website','AUM (USD)','Strategy Type'].map(label => (
                <div key={label} style={{ marginBottom:12 }}>
                  <label style={{ fontSize:11, color:'#848e9c', display:'block', marginBottom:4 }}>{label}</label>
                  <input style={{ width:'100%', background:'#2b3139', border:'1px solid #2b3139', borderRadius:6, padding:'10px 12px', color:'#eaecef', fontSize:13, outline:'none', boxSizing:'border-box' }} placeholder={`Enter ${label}`}/>
                </div>
              ))}
              <button className="cc-btn" onClick={()=>toast.success('Fund registration submitted for review!')} style={{ width:'100%', background:'#f0b90b', color:'#0b0e11', marginTop:8 }}>
                Submit Application
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CapitalConnect;
