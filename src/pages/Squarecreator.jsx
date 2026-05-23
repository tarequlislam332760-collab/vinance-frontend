import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import {
  Edit3, TrendingUp, Users, Star, Award, BarChart2,
  CheckCircle, ArrowLeft, Plus, ChevronRight, Zap,
  Heart, Eye, MessageSquare, Share2, DollarSign,
  Camera, FileText, Video, Hash, Globe, Lock,
  AlertCircle, Loader2, X, Clock, BookOpen
} from 'lucide-react';

const API_URL = 'https://vinance-backend-1.onrender.com';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  .sc-wrap { font-family:'Inter',sans-serif; background:#0b0e11; color:#eaecef; min-height:100vh; }
  .sc-wrap * { box-sizing:border-box; margin:0; padding:0; }
  .sc-wrap ::-webkit-scrollbar { width:4px; height:4px; }
  .sc-wrap ::-webkit-scrollbar-thumb { background:#2b3139; border-radius:4px; }
  .sc-card { background:#161a1e; border:1px solid #1e2329; border-radius:16px; padding:20px; transition:border .2s; }
  .sc-card:hover { border-color:#2b3139; }
  .sc-btn { display:inline-flex; align-items:center; gap:6px; padding:9px 18px; border:none; border-radius:10px; font-size:13px; font-weight:700; cursor:pointer; font-family:inherit; transition:all .15s; white-space:nowrap; }
  .sc-btn.gold { background:#f0b90b; color:#0b0e11; }
  .sc-btn.gold:hover { background:#d4a30a; }
  .sc-btn.gray { background:#1e2329; color:#848e9c; border:1px solid #2b3139; }
  .sc-btn.gray:hover { color:#eaecef; border-color:#5e6673; }
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
  .metric-card { background:#0b0e11; border-radius:10px; padding:14px; border:1px solid #2b3139; flex:1; text-align:center; }
  .progress-bar { background:#2b3139; border-radius:4px; height:6px; overflow:hidden; }
  .progress-fill { height:100%; border-radius:4px; background:#f0b90b; transition:width .3s; }
  .guide-card { background:#161a1e; border:1px solid #1e2329; border-radius:14px; padding:18px; cursor:pointer; transition:all .15s; }
  .guide-card:hover { border-color:#f0b90b30; transform:translateY(-2px); }
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
  { name:'Explorer',  min:0,    color:'#848e9c', next:'Content Creator',   icon:'🌱', perks:['Post articles','Follow other creators'] },
  { name:'Content Creator', min:100, color:'#627eea', next:'Rising Star',   icon:'✍️', perks:['Custom profile badge','Priority feed exposure'] },
  { name:'Rising Star', min:500, color:'#0ecb81', next:'Top Creator',      icon:'⭐', perks:['Monetization access','Exclusive events'] },
  { name:'Top Creator', min:2000, color:'#f0b90b', next:'Elite Creator',   icon:'🏆', perks:['Revenue sharing','Featured placement'] },
  { name:'Elite Creator', min:5000, color:'#f6465d', next:null,              icon:'👑', perks:['Direct partnerships','Platform ambassador'] },
];

const MOCK_POSTS = [
  { id:1, title:'BTC Technical Analysis — Weekly Outlook', type:'article', likes:234, views:4521, comments:18, time:'2d ago', status:'published' },
  { id:2, title: "Why I'm Bullish on ETH This Quarter",     type:'article', likes:189, views:3210, comments:12, time:'4d ago', status:'published' }, // Fixed line 65
  { id:3, title:'DeFi Yield Farming Guide 2024',           type:'video',   likes:421, views:8920, comments:34, time:'1w ago', status:'published' },
  { id:4, title:'SOL vs AVAX — Performance Comparison',   type:'article', likes:98,  views:1870, comments:7,  time:'2w ago', status:'draft'     },
];

export default function SquareCreator() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [tab,       setTab]       = useState('dashboard');
  const [postType,  setPostType]  = useState('article');
  const [postTitle, setPostTitle] = useState('');
  const [postBody,  setPostBody]  = useState('');
  const [postTag,   setPostTag]   = useState('');
  const [visibility,setVisibility]= useState('public');
  const [publishing,setPublishing]= useState(false);
  const [toastMsg,  setToastMsg]  = useState(null);
  const [posts,     setPosts]     = useState(MOCK_POSTS);

  /* Simulated creator stats */
  const creatorStats = {
    level:    'Content Creator', 
    xp:       340,
    nextXp:   500,
    followers: 1240,
    following: 89,
    totalViews: posts.reduce((s,p)=>s+p.views, 0),
    totalLikes: posts.reduce((s,p)=>s+p.likes, 0),
    earnings:  '—',
  };

  const currentTier = LEVEL_TIERS.find(t => t.name === creatorStats.level) || LEVEL_TIERS[0];
  const xpPct = ((creatorStats.xp - (LEVEL_TIERS.indexOf(currentTier)>0?LEVEL_TIERS[LEVEL_TIERS.indexOf(currentTier)-1].min:0)) / (currentTier.min === 0 ? 100 : creatorStats.nextXp - (LEVEL_TIERS.indexOf(currentTier)>0?LEVEL_TIERS[LEVEL_TIERS.indexOf(currentTier)-1].min:0))) * 100;

  const toast = (msg, type='ok') => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const publishPost = async () => {
    if (!postTitle.trim()) return toast('Post title is required', 'err');
    if (!postBody.trim() || postBody.trim().length < 20) return toast('Post content must be at least 20 characters', 'err');
    setPublishing(true);
    await new Promise(r => setTimeout(r, 1000));
    const np = {
      id:       Date.now(),
      title:    postTitle,
      type:     postType,
      likes:    0,
      views:    0,
      comments: 0,
      time:     'just now',
      status:   'published',
    };
    setPosts(p => [np, ...p]);
    setPostTitle('');
    setPostBody('');
    setPostTag('');
    setPublishing(false);
    setTab('posts');
    toast('Post published successfully!');
  };

  const deletePost = (id) => {
    if (!confirm('Delete this post?')) return;
    setPosts(p => p.filter(post => post.id !== id));
    toast('Post deleted');
  };

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

        {/* Header */}
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
              <p style={{ fontSize:11, color:'#5e6673' }}>Create content, grow your audience, earn rewards</p>
            </div>
          </div>
          <button className="sc-btn gold" onClick={() => setTab('create')}>
            <Plus size={14}/> Create Post
          </button>
        </div>

        <div style={{ maxWidth:1100, margin:'0 auto', padding:'20px' }}>

          {/* Creator Profile Card */}
          <div className="sc-card" style={{ marginBottom:20, display:'flex', alignItems:'center', gap:20, flexWrap:'wrap' }}>
            <div style={{ position:'relative' }}>
              <div style={{ width:64, height:64, borderRadius:'50%', background:'#f0b90b', color:'#0b0e11', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, fontWeight:800 }}>
                {user?.name?.[0]||'U'}
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
                <span><span style={{ color:'#eaecef', fontWeight:700 }}>{creatorStats.followers.toLocaleString()}</span> Followers</span>
                <span><span style={{ color:'#eaecef', fontWeight:700 }}>{creatorStats.following}</span> Following</span>
                <span><span style={{ color:'#eaecef', fontWeight:700 }}>{posts.length}</span> Posts</span>
              </div>
              {/* XP progress */}
              <div style={{ maxWidth:300 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#848e9c', marginBottom:4 }}>
                  <span>Level Progress</span>
                  <span style={{ color:currentTier.color, fontWeight:700 }}>{creatorStats.xp}/{creatorStats.nextXp} XP</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width:`${Math.min(xpPct,100)}%`, background:currentTier.color }}/>
                </div>
                {currentTier.next && <p style={{ fontSize:10, color:'#5e6673', marginTop:3 }}>Next: {currentTier.next}</p>}
              </div>
            </div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              <button className="sc-btn gray" onClick={() => navigate('/profile')}>Edit Profile</button>
              <button className="sc-btn outline" onClick={() => navigate('/square')}>View on Square</button>
            </div>
          </div>

          {/* Tabs */}
          <div className="sc-tabs" style={{ display:'flex', borderBottom:'1px solid #1e2329', marginBottom:20 }}>
            {[
              { k:'dashboard', l:'Dashboard' },
              { k:'create',    l:'Create'    },
              { k:'posts',     l:'My Posts'  },
              { k:'analytics', l:'Analytics' },
              { k:'earn',      l:'Earn'      },
              { k:'guide',     l:'Guide'     },
            ].map(t => (
              <button key={t.k} className={`sc-tab${tab===t.k?' on':''}`} onClick={() => setTab(t.k)}>{t.l}</button>
            ))}
          </div>

          {/* ── DASHBOARD ── */}
          {tab === 'dashboard' && (
            <div>
              {/* Stats */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:12, marginBottom:24 }} className="sc-grid-4">
                {[
                  { label:'Total Views',  value:creatorStats.totalViews.toLocaleString(), icon:<Eye size={17}/>,          color:'#627eea' },
                  { label:'Total Likes',  value:creatorStats.totalLikes.toLocaleString(), icon:<Heart size={17}/>,         color:'#f6465d' },
                  { label:'Posts',        value:posts.length,                                icon:<FileText size={17}/>,       color:'#f0b90b' },
                  { label:'Followers',    value:creatorStats.followers.toLocaleString(),  icon:<Users size={17}/>,           color:'#0ecb81' },
                ].map(s => (
                  <div key={s.label} className="sc-card" style={{ borderTop:`2px solid ${s.color}`, textAlign:'center' }}>
                    <div style={{ color:s.color, background:s.color+'18', width:36, height:36, borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 8px' }}>{s.icon}</div>
                    <div style={{ fontSize:20, fontWeight:800, color:'#eaecef', marginBottom:2 }}>{s.value}</div>
                    <div style={{ fontSize:10, color:'#848e9c', fontWeight:600, textTransform:'uppercase', letterSpacing:'.04em' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Recent posts */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }} className="sc-grid-2">
                <div>
                  <h3 style={{ fontSize:15, fontWeight:700, color:'#eaecef', marginBottom:14 }}>Recent Posts</h3>
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {posts.slice(0,3).map(post => (
                      <div key={post.id} style={{ display:'flex', gap:12, alignItems:'center', padding:'12px 14px', background:'#0b0e11', borderRadius:10, border:'1px solid #2b3139' }}>
                        <div style={{ width:36, height:36, borderRadius:8, background:post.type==='video'?'rgba(246,70,93,.1)':'rgba(99,126,234,.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          {post.type==='video' ? <Video size={16} style={{ color:'#f6465d' }}/> : <FileText size={16} style={{ color:'#627eea' }}/>}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ fontSize:13, fontWeight:600, color:'#eaecef', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{post.title}</p>
                          <div style={{ display:'flex', gap:10, fontSize:11, color:'#5e6673', marginTop:2 }}>
                            <span><Eye size={10}/> {post.views.toLocaleString()}</span>
                            <span><Heart size={10}/> {post.likes}</span>
                            <span>{post.time}</span>
                          </div>
                        </div>
                        <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:10, background:post.status==='published'?'rgba(14,203,129,.1)':'rgba(240,185,11,.1)', color:post.status==='published'?'#0ecb81':'#f0b90b', flexShrink:0 }}>
                          {post.status}
                        </span>
                      </div>
                    ))}
                    <button className="sc-btn gray" style={{ justifyContent:'center', marginTop:4 }} onClick={() => setTab('posts')}>
                      View All Posts <ChevronRight size={13}/>
                    </button>
                  </div>
                </div>

                {/* Level perks */}
                <div>
                  <h3 style={{ fontSize:15, fontWeight:700, color:'#eaecef', marginBottom:14 }}>Your Level Perks</h3>
                  <div className="sc-card" style={{ borderColor:currentTier.color+'40' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                      <span style={{ fontSize:28 }}>{currentTier.icon}</span>
                      <div>
                        <p style={{ fontWeight:700, fontSize:15, color:currentTier.color }}>{currentTier.name}</p>
                        <p style={{ fontSize:12, color:'#848e9c' }}>Level tier</p>
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
                    {currentTier.next && (
                      <div style={{ marginTop:14, padding:'10px 12px', background:currentTier.color+'08', borderRadius:8, border:`1px solid ${currentTier.color}20` }}>
                        <p style={{ fontSize:12, color:'#848e9c' }}>
                          <span style={{ color:currentTier.color, fontWeight:700 }}>{creatorStats.nextXp - creatorStats.xp} XP</span> more to reach {currentTier.next}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── CREATE ── */}
          {tab === 'create' && (
            <div style={{ maxWidth:720, margin:'0 auto' }}>
              <h2 style={{ fontSize:18, fontWeight:800, color:'#eaecef', marginBottom:6 }}>Create New Post</h2>
              <p style={{ fontSize:13, color:'#848e9c', marginBottom:24 }}>Share your crypto insights with the Vinance community</p>

              {/* Post type */}
              <div style={{ marginBottom:20 }}>
                <label style={{ fontSize:11, color:'#848e9c', fontWeight:700, textTransform:'uppercase', marginBottom:10, display:'block' }}>Content Type</label>
                <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                  {[
                    { k:'article', l:'Article',   icon:<FileText size={20}/> },
                    { k:'video',   l:'Video',     icon:<Video size={20}/> },
                    { k:'poll',    l:'Poll',      icon:<BarChart2 size={20}/> },
                    { k:'thread',  l:'Thread',    icon:<Hash size={20}/> },
                  ].map(t => (
                    <button key={t.k} className={`post-type-btn${postType===t.k?' on':''}`}
                      onClick={() => setPostType(t.k)}
                      style={{ color:postType===t.k?'#f0b90b':'#848e9c' }}>
                      {t.icon}
                      <span style={{ fontSize:11, fontWeight:700 }}>{t.l}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div style={{ marginBottom:14 }}>
                <label style={{ fontSize:11, color:'#848e9c', fontWeight:700, textTransform:'uppercase', marginBottom:6, display:'block' }}>Title *</label>
                <input className="sc-input" placeholder="Enter an engaging title for your post..." value={postTitle} onChange={e => setPostTitle(e.target.value)} style={{ fontSize:15, padding:'12px 14px' }}/>
                <p style={{ fontSize:10, color:'#5e6673', marginTop:4 }}>{postTitle.length}/100 characters</p>
              </div>

              {/* Content */}
              <div style={{ marginBottom:14 }}>
                <label style={{ fontSize:11, color:'#848e9c', fontWeight:700, textTransform:'uppercase', marginBottom:6, display:'block' }}>Content *</label>
                <textarea className="sc-input" rows={8} placeholder={postType==='article'?"Write your analysis, insights, or market commentary here...\n\nUse $BTC or @username to mention assets or users.":postType==='video'?"Paste your video URL or describe your video content...":"Enter your content..."} value={postBody} onChange={e => setPostBody(e.target.value)} style={{ resize:'vertical', minHeight:160 }}/>
                <p style={{ fontSize:10, color:'#5e6673', marginTop:4 }}>{postBody.length} characters</p>
              </div>

              {/* Tags + Visibility */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
                <div>
                  <label style={{ fontSize:11, color:'#848e9c', fontWeight:700, textTransform:'uppercase', marginBottom:6, display:'block' }}>Tag</label>
                  <select className="sc-input" value={postTag} onChange={e => setPostTag(e.target.value)} style={{ appearance:'none', cursor:'pointer' }}>
                    <option value="">Select tag</option>
                    {['BTC','ETH','SOL','DeFi','NFT','Analysis','News','Meme'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:11, color:'#848e9c', fontWeight:700, textTransform:'uppercase', marginBottom:6, display:'block' }}>Visibility</label>
                  <div style={{ display:'flex', gap:6 }}>
                    {[
                      { k:'public',    l:'Public',    icon:<Globe size={13}/> },
                      { k:'followers', l:'Followers', icon:<Users size={13}/> },
                    ].map(v => (
                      <button key={v.k} onClick={() => setVisibility(v.k)}
                        style={{ flex:1, padding:'9px 0', border:`1px solid ${visibility===v.k?'rgba(240,185,11,.4)':'#2b3139'}`, borderRadius:10, background:visibility===v.k?'rgba(240,185,11,.06)':'transparent', color:visibility===v.k?'#f0b90b':'#848e9c', fontSize:12, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:5, fontFamily:'inherit', transition:'all .15s' }}>
                        {v.icon} {v.l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div style={{ background:'rgba(240,185,11,.05)', border:'1px solid rgba(240,185,11,.15)', borderRadius:10, padding:14, marginBottom:20 }}>
                <p style={{ fontSize:12, fontWeight:700, color:'#f0b90b', marginBottom:8 }}>Writing Tips for Creators</p>
                <ul style={{ paddingLeft:16 }}>
                  {['Use $SYMBOL to link crypto assets (e.g. $BTC)','Add charts or data to support your analysis','Engage with comments to boost reach','Post consistently to grow your follower count'].map((tip,i) => (
                    <li key={i} style={{ fontSize:12, color:'#848e9c', lineHeight:1.7 }}>{tip}</li>
                  ))}
                </ul>
              </div>

              <div style={{ display:'flex', gap:10 }}>
                <button className="sc-btn gray" style={{ flex:1 }} onClick={() => toast('Draft saved')}>Save Draft</button>
                <button className="sc-btn gold" style={{ flex:2, justifyContent:'center' }} onClick={publishPost} disabled={publishing}>
                  {publishing ? <><Loader2 size={14} className="spin"/> Publishing...</> : <><Zap size={14}/> Publish Now</>}
                </button>
              </div>
            </div>
          )}

          {/* ── MY POSTS ── */}
          {tab === 'posts' && (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
                <h3 style={{ fontSize:16, fontWeight:700, color:'#eaecef' }}>My Posts ({posts.length})</h3>
                <button className="sc-btn gold" onClick={() => setTab('create')}><Plus size={14}/> New Post</button>
              </div>

              {posts.length === 0 ? (
                <div style={{ textAlign:'center', padding:80, color:'#5e6673' }}>
                  <Edit3 size={52} style={{ opacity:.1, margin:'0 auto 16px', display:'block' }}/>
                  <p style={{ fontSize:16, fontWeight:600, color:'#eaecef', marginBottom:8 }}>No posts yet</p>
                  <p style={{ fontSize:13, marginBottom:24 }}>Start creating content to build your audience</p>
                  <button className="sc-btn gold" onClick={() => setTab('create')}><Plus size={14}/> Create Your First Post</button>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {posts.map(post => (
                    <div key={post.id} className="sc-card fade" style={{ display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
                      <div style={{ width:44, height:44, borderRadius:10, background:post.type==='video'?'rgba(246,70,93,.1)':'rgba(99,126,234,.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        {post.type==='video' ? <Video size={20} style={{ color:'#f6465d' }}/> : <FileText size={20} style={{ color:'#627eea' }}/>}
                      </div>
                      <div style={{ flex:1, minWidth:150 }}>
                        <p style={{ fontWeight:700, fontSize:14, color:'#eaecef', marginBottom:4 }}>{post.title}</p>
                        <div style={{ display:'flex', gap:12, fontSize:12, color:'#848e9c', flexWrap:'wrap' }}>
                          <span style={{ display:'flex', alignItems:'center', gap:3 }}><Eye size={12}/> {post.views.toLocaleString()}</span>
                          <span style={{ display:'flex', alignItems:'center', gap:3 }}><Heart size={12}/> {post.likes}</span>
                          <span style={{ display:'flex', alignItems:'center', gap:3 }}><MessageSquare size={12}/> {post.comments}</span>
                          <span><Clock size={11}/> {post.time}</span>
                        </div>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
                        <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20, background:post.status==='published'?'rgba(14,203,129,.1)':'rgba(240,185,11,.1)', color:post.status==='published'?'#0ecb81':'#f0b90b' }}>
                          {post.status}
                        </span>
                        <button onClick={() => deletePost(post.id)}
                          style={{ background:'rgba(246,70,93,.1)', border:'1px solid rgba(246,70,93,.25)', borderRadius:8, padding:'6px 10px', cursor:'pointer', color:'#f6465d', display:'flex', alignItems:'center' }}>
                          <X size={13}/>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── ANALYTICS ── */}
          {tab === 'analytics' && (
            <div>
              {
                /* Analytics Section */
                <>
                  <h3 style={{ fontSize:16, fontWeight:700, color:'#eaecef', marginBottom:18 }}>Content Analytics</h3>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:12, marginBottom:24 }}>
                    {[
                      { l:'Total Views',    v:creatorStats.totalViews.toLocaleString(), c:'#627eea' },
                      { l:'Total Likes',    v:creatorStats.totalLikes.toLocaleString(), c:'#f6465d' },
                      { l:'Comments',       v:posts.reduce((s,p)=>s+p.comments,0),     c:'#0ecb81' },
                      { l:'Avg. Views/Post',v:Math.round(creatorStats.totalViews/Math.max(posts.length,1)).toLocaleString(), c:'#f0b90b' },
                    ].map(s => (
                      <div key={s.l} style={{ background:'#161a1e', border:`1px solid #1e2329`, borderRadius:12, padding:'14px', textAlign:'center' }}>
                        <div style={{ fontSize:20, fontWeight:800, color:s.c, marginBottom:4 }}>{s.v}</div>
                        <div style={{ fontSize:10, color:'#848e9c', fontWeight:700, textTransform:'uppercase' }}>{s.l}</div>
                      </div>
                    ))}
                  </div>

                  {/* Top posts */}
                  <div className="sc-card">
                    <h4 style={{ fontSize:14, fontWeight:700, color:'#eaecef', marginBottom:14 }}>Top Performing Posts</h4>
                    {[...posts].sort((a,b) => b.views-a.views).map(post => (
                      <div key={post.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'1px solid #1e232940' }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ fontSize:13, fontWeight:600, color:'#eaecef', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{post.title}</p>
                        </div>
                        <div style={{ display:'flex', gap:14, fontSize:12, color:'#848e9c', flexShrink:0 }}>
                          <span style={{ color:'#627eea', fontWeight:700 }}>{post.views.toLocaleString()} views</span>
                          <span style={{ color:'#f6465d' }}>{post.likes} likes</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              }
            </div>
          )}

          {/* ── EARN ── */}
          {tab === 'earn' && (
            <div>
              <div style={{ background:'linear-gradient(135deg,#161a1e,#1e2329)', border:'1px solid #2b3139', borderRadius:20, padding:28, textAlign:'center', marginBottom:24 }}>
                <div style={{ width:56, height:56, background:'rgba(240,185,11,.12)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
                  <DollarSign size={28} style={{ color:'#f0b90b' }}/>
                </div>
                <h2 style={{ fontSize:22, fontWeight:800, color:'#eaecef', marginBottom:8 }}>Creator Monetization</h2>
                <p style={{ fontSize:14, color:'#848e9c', maxWidth:480, margin:'0 auto 20px', lineHeight:1.7 }}>
                  Reach <span style={{ color:'#0ecb81', fontWeight:700 }}>Rising Star</span> level to unlock monetization. You need <span style={{ color:'#f0b90b', fontWeight:700 }}>{500-creatorStats.xp} more XP</span> to qualify.
                </p>
                <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap' }}>
                  <button className="sc-btn gold" onClick={() => setTab('create')}><Zap size={14}/> Create Content (+5 XP/post)</button>
                  <button className="sc-btn gray" onClick={() => setTab('guide')}>View XP Guide</button>
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))', gap:16 }}>
                {[
                  { title:'Content Rewards',   icon:'✍️', desc:'Earn XP and future token rewards for high-quality posts that get likes, comments, and views.', unlocked:true,  badge:'Active'    },
                  { title:'Revenue Sharing',   icon:'💰', desc:'Top creators receive a share of platform advertising revenue based on content performance.', unlocked:false, badge:'Locked'    },
                ].map((item, i) => (
                  <div key={i} className="sc-card" style={{ opacity: item.unlocked ? 1 : 0.6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 24 }}>{item.icon}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: item.unlocked ? 'rgba(14,203,129,.1)' : 'rgba(238,91,91,.1)', color: item.unlocked ? '#0ecb81' : '#f6465d' }}>
                        {item.badge}
                      </span>
                    </div>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: '#eaecef', marginBottom: 6 }}>{item.title}</h4>
                    <p style={{ fontSize: 12, color: '#848e9c', lineHeight: 1.6 }}>{item.desc}</p>
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