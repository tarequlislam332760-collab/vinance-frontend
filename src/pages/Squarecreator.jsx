import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import {
  Edit3, Users, CheckCircle, ArrowLeft, Plus,
  ChevronRight, Zap, Heart, Eye, MessageSquare,
  FileText, Video, BarChart2, Hash, Globe,
  AlertCircle, Loader2, X, Clock, DollarSign, RefreshCw
} from 'lucide-react';

const API = 'https://vinance-backend-1.onrender.com';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  .sc-wrap { font-family:'Inter',sans-serif; background:#0b0e11; color:#eaecef; min-height:100vh; }
  .sc-wrap * { box-sizing:border-box; margin:0; padding:0; }
  .sc-wrap ::-webkit-scrollbar { width:4px; }
  .sc-wrap ::-webkit-scrollbar-thumb { background:#2b3139; border-radius:4px; }
  .sc-card { background:#161a1e; border:1px solid #1e2329; border-radius:16px; padding:20px; transition:border .2s; }
  .sc-card:hover { border-color:#2b3139; }
  .sc-btn { display:inline-flex; align-items:center; gap:6px; padding:9px 18px; border:none; border-radius:10px; font-size:13px; font-weight:700; cursor:pointer; font-family:inherit; transition:all .15s; white-space:nowrap; }
  .sc-btn.gold { background:#f0b90b; color:#0b0e11; }
  .sc-btn.gold:hover { background:#d4a30a; }
  .sc-btn.gold:disabled { background:#2b3139; color:#5e6673; cursor:not-allowed; }
  .sc-btn.gray { background:#1e2329; color:#848e9c; border:1px solid #2b3139; }
  .sc-btn.gray:hover { color:#eaecef; }
  .sc-btn.outline { background:transparent; color:#f0b90b; border:1px solid rgba(240,185,11,.4); }
  .sc-btn.outline:hover { background:rgba(240,185,11,.08); }
  .sc-input { width:100%; background:#0b0e11; border:1px solid #2b3139; border-radius:10px; padding:10px 14px; color:#eaecef; font-size:13px; outline:none; font-family:inherit; transition:border .15s; }
  .sc-input:focus { border-color:#f0b90b; }
  .sc-input::placeholder { color:#5e6673; }
  .sc-tab { padding:10px 16px; font-size:13px; font-weight:600; background:transparent; border:none; color:#848e9c; cursor:pointer; border-bottom:2px solid transparent; white-space:nowrap; font-family:inherit; transition:all .15s; }
  .sc-tab.on { color:#eaecef; border-bottom-color:#f0b90b; }
  .sc-tab:hover { color:#eaecef; }
  .post-type-btn { display:flex; flex-direction:column; align-items:center; gap:8px; padding:16px; background:#0b0e11; border:1px solid #2b3139; border-radius:12px; cursor:pointer; transition:all .15s; flex:1; min-width:80px; }
  .post-type-btn:hover, .post-type-btn.on { border-color:#f0b90b; background:rgba(240,185,11,.04); }
  .post-type-btn.on span { color:#f0b90b; }
  .progress-bar { background:#2b3139; border-radius:4px; height:6px; overflow:hidden; }
  .progress-fill { height:100%; border-radius:4px; transition:width .3s; }
  @keyframes spin { to { transform:rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
  .spin { animation:spin .8s linear infinite; }
  .fade { animation:fadeUp .25s; }
  @media(max-width:768px) {
    .sc-grid-2 { grid-template-columns:1fr!important; }
    .sc-grid-4 { grid-template-columns:1fr 1fr!important; }
    .sc-tabs { overflow-x:auto; scrollbar-width:none; }
    .sc-tabs::-webkit-scrollbar { display:none; }
  }
`;

const LEVEL_TIERS = [
  { name:'Explorer',       min:0,    color:'#848e9c', next:'Content Creator', icon:'🌱', perks:['Post articles','Follow creators'] },
  { name:'Content Creator',min:100,  color:'#627eea', next:'Rising Star',     icon:'✍️', perks:['Custom badge','Priority exposure'] },
  { name:'Rising Star',    min:500,  color:'#0ecb81', next:'Top Creator',     icon:'⭐', perks:['Monetization','Exclusive events'] },
  { name:'Top Creator',    min:2000, color:'#f0b90b', next:'Elite Creator',   icon:'🏆', perks:['Revenue sharing','Featured placement'] },
  { name:'Elite Creator',  min:5000, color:'#f6465d', next:null,              icon:'👑', perks:['Direct partnerships','Ambassador'] },
];

const timeSince = d => {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
};

export default function SquareCreator() {
  const navigate = useNavigate();
  const { user, token } = useContext(UserContext);

  const [tab,        setTab]        = useState('dashboard');
  const [postType,   setPostType]   = useState('article');
  const [postBody,   setPostBody]   = useState('');
  const [postTag,    setPostTag]    = useState('All');
  const [publishing, setPublishing] = useState(false);
  const [deleting,   setDeleting]   = useState(null);
  const [toastMsg,   setToastMsg]   = useState(null);
  const [myPosts,    setMyPosts]    = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  /* XP from real user */
  const xp = user?.xp || 0;
  const tierIdx = [...LEVEL_TIERS].reverse().findIndex(t => xp >= t.min);
  const currentTier = LEVEL_TIERS[LEVEL_TIERS.length - 1 - (tierIdx === -1 ? LEVEL_TIERS.length-1 : tierIdx)] || LEVEL_TIERS[0];
  const nextTier = currentTier.next ? LEVEL_TIERS.find(t => t.name === currentTier.next) : null;
  const xpPct = nextTier ? Math.min(100, ((xp - currentTier.min) / (nextTier.min - currentTier.min)) * 100) : 100;

  const toast = (msg, type='ok') => { setToastMsg({msg,type}); setTimeout(()=>setToastMsg(null),3500); };

  /* ── Fetch my posts from backend ── */
  const fetchMyPosts = async () => {
    if (!token) return;
    setLoadingPosts(true);
    try {
      const res = await axios.get(`${API}/api/my-posts`, { headers:{ Authorization:`Bearer ${token}` } });
      setMyPosts(Array.isArray(res.data) ? res.data : []);
    } catch { setMyPosts([]); }
    finally { setLoadingPosts(false); }
  };

  useEffect(() => {
    if (tab === 'posts' || tab === 'dashboard' || tab === 'analytics') fetchMyPosts();
  }, [tab, token]);

  /* ── Publish post → POST /api/posts ── */
  const publishPost = async () => {
    if (!token) { navigate('/login'); return; }
    if (!postBody.trim())        return toast('Post content required', 'err');
    if (postBody.length < 10)    return toast('Content must be at least 10 characters', 'err');
    if (postBody.length > 280)   return toast('Max 280 characters', 'err');

    setPublishing(true);
    try {
      const res = await axios.post(`${API}/api/posts`,
        { content: postBody.trim(), tag: postTag || 'All' },
        { headers:{ Authorization:`Bearer ${token}` } }
      );
      setMyPosts(p => [res.data.post, ...p]);
      setPostBody('');
      setPostTag('All');
      setTab('posts');
      toast('Post published to Square! +5 XP earned 🎉');
    } catch (e) { toast(e.response?.data?.message || 'Publish failed', 'err'); }
    finally { setPublishing(false); }
  };

  /* ── Delete post → DELETE /api/posts/:id ── */
  const deletePost = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    setDeleting(id);
    try {
      await axios.delete(`${API}/api/posts/${id}`, { headers:{ Authorization:`Bearer ${token}` } });
      setMyPosts(p => p.filter(x => x._id !== id));
      toast('Post deleted');
    } catch (e) { toast(e.response?.data?.message || 'Delete failed', 'err'); }
    finally { setDeleting(null); }
  };

  const totalViews = myPosts.reduce((s,p) => s+(p.views||0), 0);
  const totalLikes = myPosts.reduce((s,p) => s+(p.likes?.length||0), 0);
  const totalComments = myPosts.reduce((s,p) => s+(p.comments?.length||0), 0);

  return (
    <>
      <style>{CSS}</style>

      {/* Toast */}
      {toastMsg && (
        <div style={{ position:'fixed', top:16, right:16, zIndex:9999, background:toastMsg.type==='err'?'#f6465d':'#0ecb81', color:'#fff', padding:'11px 18px', borderRadius:12, fontWeight:700, fontSize:13, display:'flex', alignItems:'center', gap:8, boxShadow:'0 8px 32px rgba(0,0,0,.5)', animation:'fadeUp .3s', maxWidth:320 }}>
          {toastMsg.type==='err' ? <AlertCircle size={15}/> : <CheckCircle size={15}/>} {toastMsg.msg}
        </div>
      )}

      <div className="sc-wrap">

        {/* ── HEADER ── */}
        <div style={{ background:'#0b0e11', borderBottom:'1px solid #1e2329', padding:'14px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10, position:'sticky', top:0, zIndex:50 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <button onClick={() => navigate('/square')} style={{ background:'none', border:'none', color:'#848e9c', cursor:'pointer', display:'flex' }}>
              <ArrowLeft size={18}/>
            </button>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <Edit3 size={17} style={{ color:'#f0b90b' }}/>
                <h1 style={{ fontSize:18, fontWeight:800, color:'#eaecef' }}>Creator Center</h1>
              </div>
              <p style={{ fontSize:11, color:'#5e6673' }}>Posts saved to MongoDB • XP tracked real-time</p>
            </div>
          </div>
          <button className="sc-btn gold" onClick={() => setTab('create')}>
            <Plus size={14}/> Create Post
          </button>
        </div>

        <div style={{ maxWidth:1100, margin:'0 auto', padding:'20px' }}>

          {/* ── CREATOR PROFILE CARD ── */}
          <div className="sc-card" style={{ marginBottom:20, display:'flex', alignItems:'center', gap:20, flexWrap:'wrap' }}>
            <div style={{ position:'relative' }}>
              <div style={{ width:64, height:64, borderRadius:'50%', background:currentTier.color, color:'#0b0e11', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, fontWeight:800 }}>
                {user?.name?.[0]?.toUpperCase()||'U'}
              </div>
              <div style={{ position:'absolute', bottom:-2, right:-2, width:22, height:22, background:currentTier.color, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, border:'2px solid #0b0e11' }}>
                {currentTier.icon}
              </div>
            </div>
            <div style={{ flex:1, minWidth:200 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4, flexWrap:'wrap' }}>
                <span style={{ fontWeight:800, fontSize:16, color:'#eaecef' }}>{user?.name||'Creator'}</span>
                <span style={{ background:currentTier.color+'18', color:currentTier.color, border:`1px solid ${currentTier.color}30`, padding:'2px 10px', borderRadius:20, fontSize:11, fontWeight:700 }}>
                  {currentTier.icon} {currentTier.name}
                </span>
              </div>
              <div style={{ display:'flex', gap:16, fontSize:12, color:'#848e9c', marginBottom:10, flexWrap:'wrap' }}>
                <span><span style={{ color:'#eaecef', fontWeight:700 }}>{myPosts.length}</span> Posts</span>
                <span>XP: <span style={{ color:currentTier.color, fontWeight:700 }}>{xp}</span></span>
              </div>
              {/* XP progress */}
              <div style={{ maxWidth:300 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#848e9c', marginBottom:4 }}>
                  <span>Level Progress</span>
                  <span style={{ color:currentTier.color, fontWeight:700 }}>{xp}{nextTier ? `/${nextTier.min}` : ' (MAX)'} XP</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width:`${xpPct}%`, background:currentTier.color }}/>
                </div>
                {currentTier.next && <p style={{ fontSize:10, color:'#5e6673', marginTop:3 }}>Next: {currentTier.next} ({nextTier?.min - xp} XP needed)</p>}
              </div>
            </div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              <button className="sc-btn gray" onClick={() => navigate('/profile')}>Edit Profile</button>
              <button className="sc-btn outline" onClick={() => navigate('/square')}>View on Square</button>
            </div>
          </div>

          {/* ── TABS ── */}
          <div className="sc-tabs" style={{ display:'flex', borderBottom:'1px solid #1e2329', marginBottom:20 }}>
            {[
              { k:'dashboard', l:'Dashboard'  },
              { k:'create',    l:'Create'     },
              { k:'posts',     l:`My Posts${myPosts.length>0?` (${myPosts.length})`:''}` },
              { k:'analytics', l:'Analytics'  },
              { k:'earn',      l:'Earn'       },
            ].map(t => (
              <button key={t.k} className={`sc-tab${tab===t.k?' on':''}`} onClick={() => setTab(t.k)}>{t.l}</button>
            ))}
          </div>

          {/* ══ DASHBOARD ══ */}
          {tab === 'dashboard' && (
            <div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:12, marginBottom:24 }} className="sc-grid-4">
                {[
                  { label:'Total Views',    value:totalViews.toLocaleString(),    icon:<Eye size={17}/>,          color:'#627eea' },
                  { label:'Total Likes',    value:totalLikes.toLocaleString(),    icon:<Heart size={17}/>,        color:'#f6465d' },
                  { label:'Posts',          value:myPosts.length,                 icon:<FileText size={17}/>,     color:'#f0b90b' },
                  { label:'XP Earned',      value:xp,                             icon:<Zap size={17}/>,          color:'#0ecb81' },
                ].map(s => (
                  <div key={s.label} className="sc-card" style={{ borderTop:`2px solid ${s.color}`, textAlign:'center' }}>
                    <div style={{ color:s.color, background:s.color+'18', width:36, height:36, borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 8px' }}>{s.icon}</div>
                    <div style={{ fontSize:20, fontWeight:800, color:'#eaecef', marginBottom:2 }}>{s.value}</div>
                    <div style={{ fontSize:10, color:'#848e9c', fontWeight:600, textTransform:'uppercase' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }} className="sc-grid-2">
                <div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                    <h3 style={{ fontSize:15, fontWeight:700, color:'#eaecef' }}>Recent Posts</h3>
                    <button onClick={fetchMyPosts} style={{ background:'none', border:'none', color:'#848e9c', cursor:'pointer', display:'flex' }}><RefreshCw size={13}/></button>
                  </div>
                  {loadingPosts ? (
                    <div style={{ textAlign:'center', padding:30 }}><Loader2 size={20} className="spin" style={{ color:'#f0b90b', display:'inline-block' }}/></div>
                  ) : myPosts.length === 0 ? (
                    <div style={{ textAlign:'center', padding:30, color:'#5e6673' }}>
                      <p style={{ fontSize:13, marginBottom:10 }}>No posts yet</p>
                      <button className="sc-btn gold" onClick={() => setTab('create')}><Plus size={12}/> Create</button>
                    </div>
                  ) : (
                    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                      {myPosts.slice(0,3).map(post => (
                        <div key={post._id} style={{ display:'flex', gap:10, alignItems:'center', padding:'10px 12px', background:'#0b0e11', borderRadius:10, border:'1px solid #2b3139' }}>
                          <FileText size={14} style={{ color:'#627eea', flexShrink:0 }}/>
                          <div style={{ flex:1, minWidth:0 }}>
                            <p style={{ fontSize:12, fontWeight:600, color:'#eaecef', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{post.content}</p>
                            <div style={{ display:'flex', gap:8, fontSize:11, color:'#5e6673', marginTop:2 }}>
                              <span><Eye size={10}/> {post.views||0}</span>
                              <span><Heart size={10}/> {post.likes?.length||0}</span>
                              <span>{timeSince(post.createdAt)}</span>
                            </div>
                          </div>
                          <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:10, background:'rgba(14,203,129,.1)', color:'#0ecb81', flexShrink:0 }}>Live</span>
                        </div>
                      ))}
                      <button className="sc-btn gray" style={{ justifyContent:'center', marginTop:4 }} onClick={() => setTab('posts')}>
                        All Posts <ChevronRight size={13}/>
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <h3 style={{ fontSize:15, fontWeight:700, color:'#eaecef', marginBottom:14 }}>Your Level Perks</h3>
                  <div className="sc-card" style={{ borderColor:currentTier.color+'40' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                      <span style={{ fontSize:28 }}>{currentTier.icon}</span>
                      <div>
                        <p style={{ fontWeight:700, fontSize:15, color:currentTier.color }}>{currentTier.name}</p>
                        <p style={{ fontSize:12, color:'#848e9c' }}>XP: {xp}</p>
                      </div>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                      {currentTier.perks.map((perk,i) => (
                        <div key={i} style={{ display:'flex', gap:8, alignItems:'center' }}>
                          <CheckCircle size={14} style={{ color:currentTier.color, flexShrink:0 }}/>
                          <span style={{ fontSize:13, color:'#c6cad2' }}>{perk}</span>
                        </div>
                      ))}
                    </div>
                    {nextTier && (
                      <div style={{ marginTop:14, padding:'10px 12px', background:currentTier.color+'08', borderRadius:8, border:`1px solid ${currentTier.color}20` }}>
                        <p style={{ fontSize:12, color:'#848e9c' }}>
                          <span style={{ color:currentTier.color, fontWeight:700 }}>{nextTier.min - xp} more XP</span> to reach {currentTier.next}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ CREATE ══ */}
          {tab === 'create' && (
            <div style={{ maxWidth:680, margin:'0 auto' }}>
              <h2 style={{ fontSize:18, fontWeight:800, color:'#eaecef', marginBottom:6 }}>Create New Post</h2>
              <p style={{ fontSize:13, color:'#848e9c', marginBottom:20 }}>Post to Square feed — saved to MongoDB in real-time</p>

              {/* Type selector */}
              <div style={{ marginBottom:18 }}>
                <label style={{ fontSize:11, color:'#848e9c', fontWeight:700, textTransform:'uppercase', marginBottom:10, display:'block' }}>Content Type</label>
                <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                  {[
                    { k:'article', l:'Article', icon:<FileText size={18}/> },
                    { k:'video',   l:'Video',   icon:<Video size={18}/>    },
                    { k:'poll',    l:'Poll',    icon:<BarChart2 size={18}/> },
                    { k:'thread',  l:'Thread',  icon:<Hash size={18}/>     },
                  ].map(t => (
                    <button key={t.k} className={`post-type-btn${postType===t.k?' on':''}`}
                      onClick={() => setPostType(t.k)} style={{ color:postType===t.k?'#f0b90b':'#848e9c' }}>
                      {t.icon}
                      <span style={{ fontSize:11, fontWeight:700 }}>{t.l}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div style={{ marginBottom:14 }}>
                <label style={{ fontSize:11, color:'#848e9c', fontWeight:700, textTransform:'uppercase', marginBottom:6, display:'block' }}>
                  Content * <span style={{ color:postBody.length>260?'#f6465d':'#5e6673', fontWeight:400 }}>({postBody.length}/280)</span>
                </label>
                <textarea className="sc-input" rows={6}
                  placeholder={postType==='article'
                    ? "Write your market analysis, insights, or commentary...\n\nUse $BTC or @username to mention assets or users."
                    : "Share your thoughts with the Vinance community..."}
                  value={postBody} onChange={e => setPostBody(e.target.value)}
                  style={{ resize:'vertical', minHeight:140 }}/>
              </div>

              {/* Tag */}
              <div style={{ marginBottom:18 }}>
                <label style={{ fontSize:11, color:'#848e9c', fontWeight:700, textTransform:'uppercase', marginBottom:6, display:'block' }}>Tag</label>
                <select className="sc-input" value={postTag} onChange={e => setPostTag(e.target.value)} style={{ appearance:'none', cursor:'pointer' }}>
                  {['All','BTC','ETH','SOL','DeFi','NFT','Analysis','News','Meme'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Tips */}
              <div style={{ background:'rgba(240,185,11,.05)', border:'1px solid rgba(240,185,11,.15)', borderRadius:10, padding:14, marginBottom:18 }}>
                <p style={{ fontSize:12, fontWeight:700, color:'#f0b90b', marginBottom:6 }}>Tips to earn more XP</p>
                <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                  {[
                    '✍️ Each post published → +5 XP',
                    '❤️ Each like received → +2 XP',
                    '💬 Each comment received → +1 XP',
                    '🔥 Use $SYMBOL to link crypto assets',
                  ].map((t,i) => <p key={i} style={{ fontSize:12, color:'#848e9c' }}>{t}</p>)}
                </div>
              </div>

              <div style={{ display:'flex', gap:10 }}>
                <button className="sc-btn gray" style={{ flex:1 }} onClick={() => { setPostBody(''); setPostTag('All'); toast('Draft cleared'); }}>
                  Clear
                </button>
                <button className="sc-btn gold" style={{ flex:2, justifyContent:'center' }} onClick={publishPost} disabled={publishing || !postBody.trim()}>
                  {publishing ? <><Loader2 size={14} className="spin"/> Publishing...</> : <><Zap size={14}/> Publish to Square</>}
                </button>
              </div>
            </div>
          )}

          {/* ══ MY POSTS ══ */}
          {tab === 'posts' && (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
                <h3 style={{ fontSize:16, fontWeight:700, color:'#eaecef' }}>My Posts ({myPosts.length})</h3>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={fetchMyPosts} style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 12px', background:'#161a1e', border:'1px solid #2b3139', borderRadius:8, color:'#848e9c', cursor:'pointer', fontSize:12, fontFamily:'inherit' }}>
                    <RefreshCw size={13}/> Refresh
                  </button>
                  <button className="sc-btn gold" onClick={() => setTab('create')}><Plus size={14}/> New</button>
                </div>
              </div>

              {loadingPosts ? (
                <div style={{ textAlign:'center', padding:60 }}><Loader2 size={24} className="spin" style={{ color:'#f0b90b', display:'inline-block' }}/></div>
              ) : myPosts.length === 0 ? (
                <div style={{ textAlign:'center', padding:80, color:'#5e6673' }}>
                  <Edit3 size={52} style={{ opacity:.1, margin:'0 auto 16px', display:'block' }}/>
                  <p style={{ fontSize:16, fontWeight:600, color:'#eaecef', marginBottom:8 }}>No posts yet</p>
                  <p style={{ fontSize:13, marginBottom:24 }}>Start creating to build your audience</p>
                  <button className="sc-btn gold" onClick={() => setTab('create')}><Plus size={14}/> Create First Post</button>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {myPosts.map(post => (
                    <div key={post._id} className="sc-card fade" style={{ display:'flex', alignItems:'flex-start', gap:14, flexWrap:'wrap' }}>
                      <div style={{ width:40, height:40, borderRadius:10, background:'rgba(99,126,234,.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <FileText size={18} style={{ color:'#627eea' }}/>
                      </div>
                      <div style={{ flex:1, minWidth:150 }}>
                        <p style={{ fontWeight:600, fontSize:13, color:'#eaecef', marginBottom:6, lineHeight:1.5, wordBreak:'break-word' }}>{post.content}</p>
                        <div style={{ display:'flex', gap:12, fontSize:12, color:'#848e9c', flexWrap:'wrap', alignItems:'center' }}>
                          <span style={{ display:'flex', alignItems:'center', gap:3 }}><Eye size={11}/> {post.views||0}</span>
                          <span style={{ display:'flex', alignItems:'center', gap:3 }}><Heart size={11}/> {post.likes?.length||0}</span>
                          <span style={{ display:'flex', alignItems:'center', gap:3 }}><MessageSquare size={11}/> {post.comments?.length||0}</span>
                          <span style={{ display:'flex', alignItems:'center', gap:3 }}><Clock size={11}/> {timeSince(post.createdAt)}</span>
                          {post.tag && post.tag !== 'All' && (
                            <span style={{ background:'rgba(240,185,11,.1)', color:'#f0b90b', padding:'1px 7px', borderRadius:10, fontSize:10, fontWeight:700 }}>#{post.tag}</span>
                          )}
                        </div>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                        <span style={{ fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:20, background:'rgba(14,203,129,.1)', color:'#0ecb81' }}>Live</span>
                        <button onClick={() => deletePost(post._id)} disabled={deleting===post._id}
                          style={{ background:'rgba(246,70,93,.1)', border:'1px solid rgba(246,70,93,.25)', borderRadius:8, padding:'6px 10px', cursor:'pointer', color:'#f6465d', display:'flex', alignItems:'center' }}>
                          {deleting===post._id ? <Loader2 size={12} className="spin"/> : <X size={12}/>}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══ ANALYTICS ══ */}
          {tab === 'analytics' && (
            <div>
              <h3 style={{ fontSize:16, fontWeight:700, color:'#eaecef', marginBottom:18 }}>Content Analytics</h3>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:12, marginBottom:24 }}>
                {[
                  { l:'Total Views',    v:totalViews.toLocaleString(),    c:'#627eea' },
                  { l:'Total Likes',    v:totalLikes.toLocaleString(),    c:'#f6465d' },
                  { l:'Comments',       v:totalComments,                  c:'#0ecb81' },
                  { l:'Avg Views/Post', v:myPosts.length > 0 ? Math.round(totalViews/myPosts.length) : 0, c:'#f0b90b' },
                ].map(s => (
                  <div key={s.l} style={{ background:'#161a1e', border:'1px solid #1e2329', borderRadius:12, padding:14, textAlign:'center' }}>
                    <div style={{ fontSize:20, fontWeight:800, color:s.c, marginBottom:4 }}>{s.v}</div>
                    <div style={{ fontSize:10, color:'#848e9c', fontWeight:700, textTransform:'uppercase' }}>{s.l}</div>
                  </div>
                ))}
              </div>

              <div className="sc-card">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                  <h4 style={{ fontSize:14, fontWeight:700, color:'#eaecef' }}>Top Performing Posts</h4>
                  <button onClick={fetchMyPosts} style={{ background:'none', border:'none', color:'#848e9c', cursor:'pointer', display:'flex' }}><RefreshCw size={13}/></button>
                </div>
                {loadingPosts ? (
                  <div style={{ textAlign:'center', padding:20 }}><Loader2 size={18} className="spin" style={{ color:'#f0b90b', display:'inline-block' }}/></div>
                ) : myPosts.length === 0 ? (
                  <p style={{ textAlign:'center', padding:20, color:'#5e6673', fontSize:13 }}>No posts yet</p>
                ) : (
                  [...myPosts].sort((a,b) => (b.views||0)-(a.views||0)).map(post => (
                    <div key={post._id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'1px solid #1e232940' }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontSize:13, fontWeight:600, color:'#eaecef', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{post.content}</p>
                      </div>
                      <div style={{ display:'flex', gap:14, fontSize:12, color:'#848e9c', flexShrink:0 }}>
                        <span style={{ color:'#627eea', fontWeight:700 }}>{post.views||0} views</span>
                        <span style={{ color:'#f6465d' }}>{post.likes?.length||0} ❤️</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ══ EARN ══ */}
          {tab === 'earn' && (
            <div>
              <div style={{ background:'linear-gradient(135deg,#161a1e,#1e2329)', border:'1px solid #2b3139', borderRadius:20, padding:28, textAlign:'center', marginBottom:24 }}>
                <div style={{ width:56, height:56, background:'rgba(240,185,11,.12)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
                  <DollarSign size={28} style={{ color:'#f0b90b' }}/>
                </div>
                <h2 style={{ fontSize:22, fontWeight:800, color:'#eaecef', marginBottom:8 }}>Creator Monetization</h2>
                <p style={{ fontSize:14, color:'#848e9c', maxWidth:480, margin:'0 auto 16px', lineHeight:1.7 }}>
                  {xp >= 500
                    ? '🎉 You have unlocked monetization! Revenue sharing is coming soon.'
                    : <>Reach <span style={{ color:'#0ecb81', fontWeight:700 }}>Rising Star</span> level (500 XP) to unlock. You have <span style={{ color:currentTier.color, fontWeight:700 }}>{xp} XP</span> — need <span style={{ color:'#f0b90b', fontWeight:700 }}>{500-xp} more</span>.</>}
                </p>
                <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap' }}>
                  <button className="sc-btn gold" onClick={() => setTab('create')}><Zap size={14}/> Create Content (+5 XP)</button>
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))', gap:16 }}>
                {[
                  { title:'Content Rewards',  icon:'✍️', desc:'Earn XP for every post published, like received, and comment earned.',    unlocked:true,    badge:'Active' },
                  { title:'Revenue Sharing',  icon:'💰', desc:'Top creators get platform ad revenue share based on content performance.',  unlocked:xp>=500, badge:xp>=500?'Unlocked':'500 XP' },
                ].map((item,i) => (
                  <div key={i} className="sc-card" style={{ opacity:item.unlocked?1:0.6 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                      <span style={{ fontSize:24 }}>{item.icon}</span>
                      <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:10, background:item.unlocked?'rgba(14,203,129,.1)':'rgba(240,185,11,.1)', color:item.unlocked?'#0ecb81':'#f0b90b' }}>
                        {item.badge}
                      </span>
                    </div>
                    <h4 style={{ fontSize:15, fontWeight:700, color:'#eaecef', marginBottom:6 }}>{item.title}</h4>
                    <p style={{ fontSize:12, color:'#848e9c', lineHeight:1.6 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
