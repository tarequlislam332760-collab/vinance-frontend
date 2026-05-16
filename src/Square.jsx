import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import {
  Search, Bell, Bookmark, MessageCircle, Clock, Settings,
  TrendingUp, Hash, Users, ChevronRight, MoreHorizontal,
  Heart, Share2, MessageSquare, Eye, Star, Repeat2,
  Video, FileText, X, Plus, Home, Compass, Edit3
} from 'lucide-react';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  .sq{font-family:'Inter',sans-serif;background:#0b0e11;color:#eaecef;min-height:100vh;display:flex;}
  .sq *{box-sizing:border-box;margin:0;padding:0;}
  .sq-sidebar{width:280px;flex-shrink:0;border-right:1px solid #1e2329;padding:0 16px;height:100vh;position:sticky;top:0;overflow-y:auto;scrollbar-width:none;display:flex;flex-direction:column;gap:4px;padding-top:16px;}
  .sq-sidebar::-webkit-scrollbar{display:none;}
  .sq-main{flex:1;min-width:0;border-right:1px solid #1e2329;}
  .sq-right{width:340px;flex-shrink:0;padding:20px 16px;height:100vh;position:sticky;top:0;overflow-y:auto;scrollbar-width:none;}
  .sq-right::-webkit-scrollbar{display:none;}
  .sq-nav-item{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:10px;cursor:pointer;transition:all .15s;color:#848e9c;font-weight:500;font-size:15px;}
  .sq-nav-item:hover,.sq-nav-item.on{background:#161a1e;color:#eaecef;}
  .sq-nav-item.on{font-weight:700;}
  .post-card{border-bottom:1px solid #1e2329;padding:18px 20px;transition:background .15s;cursor:pointer;}
  .post-card:hover{background:#0d1117;}
  .avatar{border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0;overflow:hidden;}
  .post-btn{display:flex;align-items:center;gap:5px;padding:6px 10px;border-radius:20px;border:none;background:transparent;color:#848e9c;font-size:13px;cursor:pointer;transition:all .15s;font-family:inherit;}
  .post-btn:hover{color:#eaecef;background:#161a1e;}
  .post-btn.liked{color:#f6465d;}
  .tag-chip{padding:4px 12px;border-radius:20px;border:1px solid #2b3139;background:transparent;color:#848e9c;font-size:12px;cursor:pointer;white-space:nowrap;transition:all .15s;font-family:inherit;}
  .tag-chip:hover,.tag-chip.on{border-color:#f0b90b;color:#f0b90b;background:rgba(240,185,11,.05);}
  .follow-btn{padding:6px 18px;border:1px solid #f0b90b;border-radius:20px;background:transparent;color:#f0b90b;font-size:12px;font-weight:700;cursor:pointer;transition:all .15s;font-family:inherit;}
  .follow-btn:hover,.follow-btn.on{background:#f0b90b;color:#0b0e11;}
  .notif-item{display:flex;gap:12px;padding:16px 20px;border-bottom:1px solid #1e2329;cursor:pointer;transition:background .15s;}
  .notif-item:hover{background:#0d1117;}
  .trending-item{padding:10px 0;border-bottom:1px solid #1e232940;cursor:pointer;}
  .trending-item:hover .trend-title{color:#f0b90b;}
  .sq-search{display:flex;align-items:center;gap:10px;background:#161a1e;border:1px solid #2b3139;border-radius:24px;padding:10px 16px;transition:border .15s;}
  .sq-search:focus-within{border-color:#f0b90b;}
  .sq-search input{background:transparent;border:none;outline:none;color:#eaecef;font-size:14px;width:100%;font-family:inherit;}
  .sq-search input::placeholder{color:#5e6673;}
  .creator-card{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #1e232940;}
  .post-input{background:#161a1e;border:1px solid #2b3139;border-radius:12px;padding:14px 16px;width:100%;resize:none;color:#eaecef;font-size:14px;outline:none;font-family:inherit;transition:border .15s;min-height:80px;}
  .post-input:focus{border-color:#f0b90b;}
  .post-input::placeholder{color:#5e6673;}
  @media(max-width:1100px){.sq-right{display:none;}}
  @media(max-width:768px){.sq-sidebar{display:none;}.sq-main{border:none;}}
`;

const MOCK_POSTS = [
  { id:1, author:'CryptoWhale', handle:'@whale_btc', verified:true, time:'2m', content:'$BTC is currently trading around the $80K–$82K zone, showing strong recovery momentum after bouncing from earlier lows. The weekly close looks extremely bullish. 🚀', likes:1240, comments:89, shares:234, views:8900, liked:false, tag:'BTC' },
  { id:2, author:'ETH Maxi',    handle:'@eth_maxi',  verified:false, time:'8m', content:'Ethereum staking rewards are now at an all-time high. With ETF inflows picking up, $ETH could easily see $4K before the end of Q2. DYOR. Not financial advice.', likes:567, comments:43, shares:91, views:3400, liked:false, tag:'ETH' },
  { id:3, author:'DeFi Analyst', handle:'@defi_pro', verified:true, time:'15m', content:'🔥 Breaking: Total DeFi TVL crosses $120B milestone for the first time in 2024. @AAVE and @Uniswap leading the charge. The institutional money is here, folks.', likes:2100, comments:156, shares:445, views:15000, liked:false, tag:'DeFi' },
  { id:4, author:'SolanaKing',   handle:'@sol_king',  verified:false, time:'32m', content:'$SOL just broke the $90 resistance. Next target is $110. The Solana ecosystem is growing exponentially — 400+ new projects launched this month alone. 📈', likes:890, comments:67, shares:123, views:6700, liked:false, tag:'SOL' },
  { id:5, author:'MarketGuru',   handle:'@mktguru',   verified:true, time:'1h', content:'Quick analysis: BTC dominance at 54.3%. Alt season incoming? Historically, when BTC dom drops below 50%, altcoins see 3–5x moves. Watch the ratio carefully.', likes:3400, comments:289, shares:678, views:24000, liked:false, tag:'Analysis' },
  { id:6, author:'NewsAlerts',   handle:'@cryptonews', verified:true, time:'2h', content:'🚨 SEC approves spot ETH ETF in landmark decision. This could trigger the next major bull run. Ethereum surges 12% in after-hours trading. Major milestone for crypto.', likes:5600, comments:412, shares:1230, views:45000, liked:true, tag:'News' },
];

const TRENDING = [
  { tag:'BitcoinETFsSee$131MNetInflows', views:'16,876 views', count:'267 Discussing' },
  { tag:'VitalikMovesETHviaPrivacyPools', views:'82,464 views', count:'1,094 Discussing' },
  { tag:'DuneCuts25%AmidAIEfficiencyPush', views:'68,303 views', count:'865 Discussing' },
  { tag:'SOLBreaks$90Resistance', views:'34,200 views', count:'543 Discussing' },
  { tag:'DeFiTVLCrosses120B', views:'28,900 views', count:'398 Discussing' },
];

const SUGGESTED = [
  { name:'BokataBB',      handle:'@BokataBB',      verified:true },
  { name:'Honeyxgpt',     handle:'@Izel',          verified:false },
  { name:'Crypto Insights', handle:'@CryptoInsightsX', verified:false },
];

const NOTIFS = [
  { type:'system', title:'Assistant Message', body:'Beyond the headlines, what\'s really shaping crypto? Tomorrow, Eleanor Terrett breaks down regulation behind the scenes and how the industry is evolving between speculation and real-world use.', link:'View More', time:'May 6' },
  { type:'system', title:'Assistant Message', body:"What actually makes someone like Arthur Hayes turn bullish? Tomorrow, Arthur Hayes joins us to break down the signal he is watching and how.", link:'View More', time:'Apr 30' },
  { type:'system', title:'Assistant Message', body:"Crypto is open to everyone. But not everyone experiences it the same way. Tomorrow, Crypto Wendy O joins us to talk about inclusivity in the space, her approach to trading, and how she sees the industry evolving from here.", link:'View More', time:'Apr 16' },
];

const fmtNum = n => n >= 1000 ? `${(n/1000).toFixed(1)}K` : n;

export default function Square() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [section,   setSection]  = useState('Feed');
  const [posts,     setPosts]    = useState(MOCK_POSTS);
  const [newPost,   setNewPost]  = useState('');
  const [activeTag, setActiveTag] = useState('All');
  const [followed,  setFollowed] = useState([]);
  const [notifTab,  setNotifTab] = useState('All');

  const TAGS = ['All','BTC','ETH','SOL','DeFi','NFT','Meme','Analysis','News'];

  const likePost = (id) => {
    setPosts(p => p.map(post =>
      post.id===id ? { ...post, liked:!post.liked, likes:post.liked?post.likes-1:post.likes+1 } : post
    ));
  };

  const submitPost = () => {
    if (!newPost.trim()) return;
    const np = {
      id: Date.now(),
      author: user?.name || 'You',
      handle: `@${user?.email?.split('@')[0] || 'user'}`,
      verified: false,
      time: 'just now',
      content: newPost,
      likes:0, comments:0, shares:0, views:0, liked:false, tag:'All'
    };
    setPosts(p => [np, ...p]);
    setNewPost('');
  };

  const filteredPosts = activeTag==='All' ? posts : posts.filter(p => p.tag===activeTag);

  const SideNav = () => (
    <div className="sq-sidebar">
      <div style={{ fontSize:14, fontWeight:700, color:'#f0b90b', padding:'0 14px 16px' }}>VINANCE SQUARE</div>
      {[
        { icon:<Home size={20}/>,        label:'Feed',          key:'Feed' },
        { icon:<Bell size={20}/>,        label:'Notification',  key:'Notification', badge:3 },
        { icon:<Users size={20}/>,       label:'Profile',       key:'Profile' },
        { icon:<Bookmark size={20}/>,    label:'Bookmarks',     key:'Bookmarks' },
        { icon:<MessageCircle size={20}/>, label:'Chats',       key:'Chats' },
        { icon:<Clock size={20}/>,       label:'History',       key:'History' },
        { icon:<Compass size={20}/>,     label:'Creator Center', key:'Creator' },
        { icon:<Settings size={20}/>,    label:'Settings',      key:'Settings' },
      ].map(item => (
        <div key={item.key} className={`sq-nav-item${section===item.key?' on':''}`}
          onClick={() => setSection(item.key)}>
          <div style={{ position:'relative' }}>
            {item.icon}
            {item.badge && (
              <span style={{ position:'absolute', top:-6, right:-6, width:16, height:16, background:'#f6465d', borderRadius:'50%', fontSize:9, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid #0b0e11', color:'#fff' }}>
                {item.badge}
              </span>
            )}
          </div>
          <span>{item.label}</span>
        </div>
      ))}
      <div style={{ marginTop:'auto', padding:'16px 14px 20px', display:'flex', alignItems:'center', gap:10, borderTop:'1px solid #1e2329' }}>
        <div className="avatar" style={{ width:40, height:40, background:'#2b3139', fontSize:14 }}>
          {user?.name?.[0] || 'U'}
        </div>
        <div style={{ minWidth:0 }}>
          <div style={{ fontWeight:700, fontSize:13, color:'#eaecef', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name || 'Guest'}</div>
          <div style={{ fontSize:11, color:'#5e6673', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>@{user?.email?.split('@')[0] || 'user'}</div>
        </div>
        <MoreHorizontal size={16} style={{ color:'#848e9c', flexShrink:0, cursor:'pointer' }}/>
      </div>
    </div>
  );

  const PostCard = ({ post }) => (
    <div className="post-card" onClick={() => {}}>
      <div style={{ display:'flex', gap:12 }}>
        <div className="avatar" style={{ width:44, height:44, background:`hsl(${post.id*60},60%,40%)`, fontSize:16 }}>
          {post.author[0]}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:2, flexWrap:'wrap' }}>
            <span style={{ fontWeight:700, fontSize:14, color:'#eaecef' }}>{post.author}</span>
            {post.verified && <span style={{ fontSize:12, color:'#f0b90b' }}>✓</span>}
            <span style={{ color:'#848e9c', fontSize:13 }}>{post.handle}</span>
            <span style={{ color:'#5e6673', fontSize:12 }}>· {post.time}</span>
          </div>
          <p style={{ fontSize:14, color:'#c6cad2', lineHeight:1.6, marginBottom:12 }}>
            {post.content.split(/(\$\w+|@\w+)/).map((part,i) =>
              /^\$|^@/.test(part)
                ? <span key={i} style={{ color:'#f0b90b', cursor:'pointer' }}>{part}</span>
                : part
            )}
          </p>
          <div style={{ display:'flex', gap:4, alignItems:'center' }}>
            <button className={`post-btn${post.liked?' liked':''}`} onClick={e=>{e.stopPropagation();likePost(post.id);}}>
              <Heart size={16} style={post.liked?{fill:'#f6465d'}:{}}/> {fmtNum(post.likes)}
            </button>
            <button className="post-btn"><MessageSquare size={16}/> {fmtNum(post.comments)}</button>
            <button className="post-btn"><Repeat2 size={16}/> {fmtNum(post.shares)}</button>
            <button className="post-btn"><Share2 size={16}/></button>
            <span style={{ marginLeft:'auto', fontSize:12, color:'#5e6673', display:'flex', alignItems:'center', gap:4 }}>
              <Eye size={13}/> {fmtNum(post.views)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const FeedSection = () => (
    <>
      {/* Post composer */}
      <div style={{ padding:'16px 20px', borderBottom:'1px solid #1e2329' }}>
        <div style={{ display:'flex', gap:12 }}>
          <div className="avatar" style={{ width:44, height:44, background:'#2b3139', fontSize:16, flexShrink:0 }}>
            {user?.name?.[0] || 'U'}
          </div>
          <div style={{ flex:1 }}>
            <textarea className="post-input" placeholder="What's happening in crypto?" value={newPost} onChange={e=>setNewPost(e.target.value)} rows={3}/>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:10 }}>
              <div style={{ display:'flex', gap:12, color:'#f0b90b' }}>
                <FileText size={18} style={{ cursor:'pointer' }}/>
                <Video size={18} style={{ cursor:'pointer' }}/>
                <Hash size={18} style={{ cursor:'pointer' }}/>
              </div>
              <button onClick={submitPost} disabled={!newPost.trim()}
                style={{ padding:'8px 22px', background:newPost.trim()?'#f0b90b':'#2b3139', border:'none', borderRadius:20, color:newPost.trim()?'#0b0e11':'#5e6673', fontWeight:700, fontSize:13, cursor:newPost.trim()?'pointer':'not-allowed', fontFamily:'inherit' }}>
                Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter tags */}
      <div style={{ display:'flex', gap:6, padding:'10px 20px', borderBottom:'1px solid #1e2329', overflowX:'auto', scrollbarWidth:'none' }}>
        {TAGS.map(t => (
          <button key={t} className={`tag-chip${activeTag===t?' on':''}`} onClick={() => setActiveTag(t)}>{t}</button>
        ))}
      </div>

      {/* Posts */}
      {filteredPosts.map(post => <PostCard key={post.id} post={post}/>)}
    </>
  );

  const NotificationSection = () => (
    <>
      <div style={{ padding:'16px 20px', borderBottom:'1px solid #1e2329' }}>
        <h2 style={{ fontSize:20, fontWeight:700, color:'#eaecef', marginBottom:14 }}>Notification</h2>
        <div style={{ display:'flex', gap:0 }}>
          {['All','Replies & Mentions','Assistant'].map(t => (
            <button key={t} onClick={() => setNotifTab(t)}
              style={{ padding:'8px 14px', background:'transparent', border:'none', cursor:'pointer', color:notifTab===t?'#eaecef':'#848e9c', borderBottom:notifTab===t?'2px solid #f0b90b':'2px solid transparent', fontWeight:notifTab===t?700:500, fontSize:13, fontFamily:'inherit', whiteSpace:'nowrap' }}>
              {t}
            </button>
          ))}
        </div>
      </div>
      {NOTIFS.map((n,i) => (
        <div key={i} className="notif-item">
          <div style={{ width:40, height:40, borderRadius:'50%', background:'#1e2329', border:'1px solid #2b3139', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Bell size={18} style={{ color:'#848e9c' }}/>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
              <span style={{ fontWeight:700, fontSize:14, color:'#eaecef' }}>{n.title}</span>
              <span style={{ fontSize:12, color:'#5e6673' }}>{n.time}</span>
            </div>
            <p style={{ fontSize:13, color:'#848e9c', lineHeight:1.6, marginBottom:6 }}>{n.body}</p>
            <span style={{ color:'#f0b90b', fontSize:13, cursor:'pointer' }}>{n.link}</span>
          </div>
        </div>
      ))}
    </>
  );

  const ProfileSection = () => (
    <div style={{ padding:20 }}>
      <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20 }}>
        <div className="avatar" style={{ width:64, height:64, background:'#2b3139', fontSize:24 }}>
          {user?.name?.[0] || 'U'}
        </div>
        <div>
          <h2 style={{ fontSize:18, fontWeight:700, color:'#eaecef' }}>{user?.name || 'Guest User'}</h2>
          <p style={{ color:'#848e9c', fontSize:13 }}>@{user?.email?.split('@')[0] || 'user'}</p>
          <div style={{ display:'flex', gap:2, marginTop:4, color:'#848e9c', fontSize:12 }}>
            <span>0 <span style={{ color:'#848e9c' }}>Posts</span></span>
          </div>
        </div>
      </div>
      <div style={{ display:'flex', gap:20, marginBottom:20, fontSize:13, color:'#848e9c' }}>
        {[['Following',0],['Followers',0],['Liked',0],['Shared',0]].map(([l,v]) => (
          <span key={l} style={{ cursor:'pointer' }}><span style={{ color:'#eaecef', fontWeight:700 }}>{v}</span> {l}</span>
        ))}
      </div>
      <div style={{ display:'flex', gap:8, borderBottom:'1px solid #1e2329', marginBottom:16 }}>
        {['Posts','Portfolio'].map(t => (
          <button key={t} style={{ padding:'8px 16px', background:'transparent', border:'none', cursor:'pointer', color:t==='Posts'?'#eaecef':'#848e9c', borderBottom:t==='Posts'?'2px solid #f0b90b':'2px solid transparent', fontWeight:t==='Posts'?700:500, fontSize:14, fontFamily:'inherit' }}>
            {t}
          </button>
        ))}
      </div>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:48, color:'#5e6673', gap:12 }}>
        <FileText size={48} style={{ opacity:.15 }}/>
        <span style={{ fontSize:14 }}>No records found.</span>
        <button onClick={() => setSection('Feed')} style={{ padding:'8px 24px', background:'#f0b90b', border:'none', borderRadius:20, color:'#0b0e11', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>
          Start Posting
        </button>
      </div>
    </div>
  );

  return (
    <>
      <style>{css}</style>
      <div className="sq">
        <SideNav/>

        <div className="sq-main">
          {/* Header */}
          <div style={{ position:'sticky', top:0, background:'rgba(11,14,17,.95)', backdropFilter:'blur(8px)', borderBottom:'1px solid #1e2329', padding:'12px 20px', zIndex:10, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <h2 style={{ fontSize:18, fontWeight:700, color:'#eaecef' }}>
              {section === 'Feed' ? 'Square' : section}
            </h2>
            <div style={{ display:'flex', gap:8, color:'#848e9c' }}>
              {section==='Feed' && <Edit3 size={20} style={{ cursor:'pointer' }}/>}
              <Search size={20} style={{ cursor:'pointer' }}/>
            </div>
          </div>

          {section==='Feed'         && <FeedSection/>}
          {section==='Notification' && <NotificationSection/>}
          {section==='Profile'      && <ProfileSection/>}
          {!['Feed','Notification','Profile'].includes(section) && (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:80, color:'#5e6673' }}>
              <Compass size={48} style={{ opacity:.15, marginBottom:16 }}/>
              <p style={{ fontSize:14 }}>{section} — Coming Soon</p>
            </div>
          )}
        </div>

        {/* RIGHT PANEL */}
        <div className="sq-right">
          {/* Search */}
          <div className="sq-search" style={{ marginBottom:20 }}>
            <Search size={16} style={{ color:'#5e6673', flexShrink:0 }}/>
            <input placeholder="Search"/>
          </div>

          {/* Trending Topics */}
          <div style={{ background:'#161a1e', borderRadius:16, padding:16, marginBottom:20, border:'1px solid #1e2329' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <h3 style={{ fontWeight:700, fontSize:15, color:'#eaecef', display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:20 }}>🔥</span> Trending Topics
              </h3>
            </div>
            {TRENDING.map((t,i) => (
              <div key={i} className="trending-item" style={{ paddingBottom: i===TRENDING.length-1?0:10, marginBottom:i===TRENDING.length-1?0:10 }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:8 }}>
                  <Hash size={12} style={{ color:'#f0b90b', marginTop:3, flexShrink:0 }}/>
                  <div>
                    <div className="trend-title" style={{ fontWeight:700, fontSize:13, color:'#eaecef', marginBottom:2, transition:'color .15s', cursor:'pointer' }}>
                      {t.tag}
                    </div>
                    <div style={{ fontSize:11, color:'#5e6673' }}>{t.views} · {t.count}</div>
                  </div>
                </div>
              </div>
            ))}
            <button style={{ color:'#f0b90b', fontSize:13, background:'none', border:'none', cursor:'pointer', marginTop:12, fontFamily:'inherit' }}>
              View More →
            </button>
          </div>

          {/* Suggested Creators */}
          <div style={{ background:'#161a1e', borderRadius:16, padding:16, border:'1px solid #1e2329' }}>
            <h3 style={{ fontWeight:700, fontSize:15, color:'#eaecef', marginBottom:14 }}>Suggested Creators</h3>
            {SUGGESTED.map((c,i) => (
              <div key={i} className="creator-card" style={{ borderBottom: i===SUGGESTED.length-1?'none':undefined }}>
                <div className="avatar" style={{ width:40, height:40, background:`hsl(${i*80},60%,40%)`, fontSize:14 }}>
                  {c.name[0]}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                    <span style={{ fontWeight:700, fontSize:13, color:'#eaecef' }}>{c.name}</span>
                    {c.verified && <span style={{ color:'#f0b90b', fontSize:11 }}>✓</span>}
                  </div>
                  <div style={{ fontSize:11, color:'#848e9c' }}>{c.handle}</div>
                </div>
                <button className={`follow-btn${followed.includes(c.handle)?' on':''}`}
                  onClick={() => setFollowed(f => f.includes(c.handle)?f.filter(h=>h!==c.handle):[...f,c.handle])}>
                  {followed.includes(c.handle)?'Following':'Follow'}
                </button>
              </div>
            ))}
            <button style={{ color:'#f0b90b', fontSize:13, background:'none', border:'none', cursor:'pointer', marginTop:12, fontFamily:'inherit' }}>
              View More →
            </button>
          </div>

          <div style={{ padding:'16px 0', fontSize:11, color:'#5e6673', lineHeight:1.8 }}>
            <span style={{ cursor:'pointer' }}>Sitemap</span> · <span style={{ cursor:'pointer' }}>Cookie Preferences</span> · <span style={{ cursor:'pointer' }}>Platform T&Cs</span>
          </div>
        </div>
      </div>
    </>
  );
}
