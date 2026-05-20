import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import axios from 'axios';
import {
  Search, Bell, Bookmark, MessageCircle, Clock, Settings,
  TrendingUp, Hash, Users, ChevronRight, MoreHorizontal,
  Heart, Share2, MessageSquare, Eye, Star, Repeat2,
  Video, FileText, X, Plus, Home, Compass, Edit3,
  ArrowLeft, Send, Loader2, ChevronLeft
} from 'lucide-react';

const API = "https://vinance-backend-1.onrender.com";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght=400;500;600;700;800&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  .sq{font-family:'Inter',sans-serif;background:#0b0e11;color:#eaecef;min-height:100vh;display:flex;width:100%;}
  .sq-sidebar{width:260px;flex-shrink:0;border-right:1px solid #1e2329;padding:16px 12px;height:100vh;position:sticky;top:0;overflow-y:auto;scrollbar-width:none;display:flex;flex-direction:column;gap:2px;}
  .sq-sidebar::-webkit-scrollbar{display:none;}
  .sq-main{flex:1;min-width:0;border-right:1px solid #1e2329;overflow-y:auto;height:100vh;background:#0b0e11;}
  .sq-right{width:320px;flex-shrink:0;padding:20px 14px;height:100vh;position:sticky;top:0;overflow-y:auto;scrollbar-width:none;}
  .sq-right::-webkit-scrollbar{display:none;}
  .sq-nav-item{display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:10px;cursor:pointer;transition:all .15s;color:#848e9c;font-weight:500;font-size:14px;border:none;background:transparent;width:100%;text-align:left;font-family:inherit;}
  .sq-nav-item:hover,.sq-nav-item.on{background:#161a1e;color:#eaecef;}
  .sq-nav-item.on{font-weight:700;color:#f0b90b;}
  
  .post-card{border-bottom:1px solid #1e2329;padding:16px;transition:background .15s;display:flex;gap:12px;}
  .post-card:hover{background:#0d1117;}
  .avatar{border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0;overflow:hidden;background:#2b3139;}
  
  .post-btn{display:flex;align-items:center;gap:6px;padding:6px 10px;border-radius:20px;border:none;background:transparent;color:#848e9c;font-size:12px;cursor:pointer;transition:all .15s;font-family:inherit;}
  .post-btn:hover{color:#eaecef;background:#161a1e;}
  .post-btn.liked{color:#f6465d;}
  .post-btn.bookmarked{color:#f0b90b;}
  .post-btn.retweeted{color:#0ecb81;}
  
  .tags-container{display:flex;gap:8px;overflow-x:auto;padding:12px 16px;background:#0b0e11;border-bottom:1px solid #1e2329;scrollbar-width:none;}
  .tags-container::-webkit-scrollbar{display:none;}
  
  .tag-chip{padding:6px 14px;border-radius:20px;border:1px solid #2b3139;background:transparent;color:#848e9c;font-size:12px;cursor:pointer;white-space:nowrap;transition:all .15s;font-family:inherit;flex-shrink:0;}
  .tag-chip:hover,.tag-chip.on{border-color:#f0b90b;color:#f0b90b;background:rgba(240,185,11,.05);}
  
  .follow-btn{padding:6px 16px;border:1px solid #f0b90b;border-radius:20px;background:transparent;color:#f0b90b;font-size:12px;font-weight:700;cursor:pointer;transition:all .15s;font-family:inherit;white-space:nowrap;}
  .follow-btn:hover,.follow-btn.on{background:#f0b90b;color:#0b0e11;}
  .sq-search{display:flex;align-items:center;gap:10px;background:#161a1e;border:1px solid #2b3139;border-radius:24px;padding:9px 14px;transition:border .15s;}
  .sq-search:focus-within{border-color:#f0b90b;}
  .sq-search input{background:transparent;border:none;outline:none;color:#eaecef;font-size:13px;width:100%;font-family:inherit;}
  .sq-search input::placeholder{color:#5e6673;}
  .post-input{background:#161a1e;border:1px solid #2b3139;border-radius:12px;padding:12px 14px;width:100%;resize:none;color:#eaecef;font-size:14px;outline:none;font-family:inherit;transition:border .15s;}
  .post-input:focus{border-color:#f0b90b;}
  .post-input::placeholder{color:#5e6673;}
  .trending-item{padding:9px 0;border-bottom:1px solid #1e232940;cursor:pointer;transition:all .15s;}
  .trending-item:hover{background:rgba(255,255,255,.02);}
  .trending-item:hover .trend-title{color:#f0b90b;}
  .creator-card{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #1e232940;}
  .notif-item{display:flex;gap:12px;padding:14px 16px;border-bottom:1px solid #1e2329;cursor:pointer;transition:background .15s;}
  .notif-item:hover{background:#0d1117;}
  .comment-box{background:#161a1e;border-radius:12px;padding:12px;margin-top:8px;border:1px solid #1e2329;}
  .comment-input{background:#0b0e11;border:1px solid #2b3139;border-radius:8px;padding:8px 12px;width:100%;color:#eaecef;font-size:13px;outline:none;font-family:inherit;resize:none;}
  .comment-input:focus{border-color:#f0b90b;}
  @keyframes fadeIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  .spin{animation:spin .8s linear infinite}
  
  @media(max-width:1100px){.sq-right{display:none;}}
  @media(max-width:768px){
    .sq-sidebar{display:none;}
    .sq{display:block;width:100%;padding-bottom:60px;}
    .sq-main{width:100%;height:auto;border-right:none;}
    .post-card{padding:14px 12px;}
  }
`;

const TRENDING = [
  { tag: 'BitcoinETFsSee$131MNetInflows', views: '16,876 views', count: '267 Discussing' },
  { tag: 'VitalikMovesETHviaPrivacyPools', views: '82,464 views', count: '1,094 Discussing' },
  { tag: 'SOLBreaks$90Resistance', views: '34,200 views', count: '543 Discussing' },
  { tag: 'DeFiTVLCrosses120B', views: '28,900 views', count: '398 Discussing' },
  { tag: 'ETH2.0StakingRewardsATH', views: '21,300 views', count: '312 Discussing' },
];

const SUGGESTED = [
  { name: 'CryptoWhale', handle: '@whale_btc', verified: true, bio: 'BTC maximalist' },
  { name: 'DeFi Analyst', handle: '@defi_pro', verified: true, bio: 'DeFi researcher' },
  { name: 'SolanaKing', handle: '@sol_king', verified: false, bio: 'SOL ecosystem' },
];

const NOTIFS = [
  { icon: '🔔', title: 'Market Alert', body: 'BTC just crossed $85,000. Strong momentum observed in the derivatives market.', time: '2m' },
  { icon: '💰', title: 'Deposit Confirmed', body: 'Your deposit request has been approved by admin. Balance updated.', time: '1h' },
  { icon: '📊', title: 'Trade Alert', body: 'Your Futures position is up +12.4%. Consider taking profits.', time: '3h' },
  { icon: '⭐', title: 'Copy Trade Update', body: 'Trader CryptoWhale closed a +$234 position. Your copy earned +$18.', time: '5h' },
  { icon: '🚀', title: 'Platform Update', body: 'New features added: Advanced charting, stop-loss automation, and more.', time: 'May 6' },
];

const fmtNum = n => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n;
const fmtTime = ts => {
  const d = new Date(ts);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return d.toLocaleDateString();
};

const INITIAL_POSTS = [
  { _id: '1', author: 'CryptoWhale', handle: '@whale_btc', verified: true, createdAt: new Date(Date.now() - 120000), content: '$BTC is currently trading around the $80K zone, showing strong recovery momentum. The weekly close looks extremely bullish. Next target: $90K 🚀', likes: [], comments: [], shares: 234, views: 8900, bookmarks: [], tag: 'BTC' },
  { _id: '2', author: 'ETH Maxi', handle: '@eth_maxi', verified: false, createdAt: new Date(Date.now() - 480000), content: 'Ethereum staking rewards are now at an all-time high. With ETF inflows picking up, $ETH could easily see $4K before Q2 ends. DYOR 📈', likes: [], comments: [], shares: 91, views: 3400, bookmarks: [], tag: 'ETH' },
  { _id: '3', author: 'DeFi Analyst', handle: '@defi_pro', verified: true, createdAt: new Date(Date.now() - 900000), content: '🔥 Breaking: Total DeFi TVL crosses $120B milestone. @AAVE and @Uniswap leading the charge. The institutional money is finally here, folks.', likes: [], comments: [], shares: 445, views: 15000, bookmarks: [], tag: 'DeFi' },
  { _id: '4', author: 'SolanaKing', handle: '@sol_king', verified: false, createdAt: new Date(Date.now() - 1920000), content: '$SOL just broke the $90 resistance. Next target is $110. The Solana ecosystem is growing — 400+ new projects this month alone 📈', likes: [], comments: [], shares: 123, views: 6700, bookmarks: [], tag: 'SOL' },
  { _id: '5', author: 'MarketGuru', handle: '@mktguru', verified: true, createdAt: new Date(Date.now() - 3600000), content: 'Quick analysis: BTC dominance at 54.3%. Alt season incoming? Historically, when BTC dom drops below 50%, altcoins see 3-5x moves. Watch carefully.', likes: [], comments: [], shares: 678, views: 24000, bookmarks: [], tag: 'Analysis' },
];

export default function Square() {
  const navigate = useNavigate();
  const { user, token } = useContext(UserContext);

  const [section, setSection] = useState('Feed');
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [newPost, setNewPost] = useState('');
  const [activeTag, setActiveTag] = useState('All');
  const [followed, setFollowed] = useState([]);
  const [bookmarked, setBookmarked] = useState([]);
  const [notifTab, setNotifTab] = useState('All');
  const [posting, setPosting] = useState(false);
  const [openComments, setOpenComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [searchQ, setSearchQ] = useState('');

  const TAGS = ['All', 'BTC', 'ETH', 'SOL', 'DeFi', 'NFT', 'Meme', 'Analysis', 'News'];

  const myId = user?.email || 'guest';

  const likePost = (id) => {
    setPosts(p => p.map(post => {
      if (post._id !== id) return post;
      const liked = post.likes.includes(myId);
      return {
        ...post,
        likes: liked ? post.likes.filter(x => x !== myId) : [...post.likes, myId]
      };
    }));
  };

  const toggleBookmark = (id) => {
    setBookmarked(b => b.includes(id) ? b.filter(x => x !== id) : [...b, id]);
  };

  const createPost = () => {
    if (!newPost.trim()) return;
    setPosting(true);
    setTimeout(() => {
      const p = {
        _id: Math.random().toString(),
        author: user?.name || 'Anonymous',
        handle: `@${user?.name?.toLowerCase().replace(/\s+/g, '') || 'user'}`,
        verified: user?.role === 'admin',
        createdAt: new Date(),
        content: newPost,
        likes: [],
        comments: [],
        shares: 0,
        views: 1,
        bookmarks: [],
        tag: activeTag === 'All' ? 'News' : activeTag
      };
      setPosts([p, ...posts]);
      setNewPost('');
      setPosting(false);
    }, 800);
  };

  return (
    <div className="sq">
      <style>{css}</style>

      {/* Desktop Sidebar */}
      <div className="sq-sidebar">
        <div style={{padding:'0 14px 16px', borderBottom:'1px solid #1e2329', marginBottom:'12px'}}>
          <h1 style={{fontSize:'20px', fontWeight:800, color:'#f0b90b', fontStyle:'italic'}}>VINANCE SQUARE</h1>
        </div>
        <button className={`sq-nav-item ${section==='Feed'?'on':''}`} onClick={()=>setSection('Feed')}><Home size={18}/> Feed</button>
        <button className={`sq-nav-item ${section==='Notifications'?'on':''}`} onClick={()=>setSection('Notifications')}><Bell size={18}/> Notifications</button>
        <button className={`sq-nav-item ${section==='Bookmarks'?'on':''}`} onClick={()=>setSection('Bookmarks')}><Bookmark size={18}/> Bookmarks</button>
        <button className={`sq-nav-item ${section==='Profile'?'on':''}`} onClick={()=>setSection('Profile')}><Users size={18}/> My Profile</button>
        <button className="sq-nav-item" onClick={()=>navigate('/dashboard')} style={{marginTop:'auto', borderTop:'1px solid #1e2329', paddingTop:'12px'}}><ArrowLeft size={18}/> Back to Trade</button>
      </div>

      {/* Main Content Area */}
      <div className="sq-main">
        {/* Mobile Top Navbar Header Fixed */}
        <div className="md:hidden flex items-center justify-between p-4 bg-[#161a1e] border-b border-[#1e2329] sticky top-0 z-30">
          <button onClick={()=>navigate('/dashboard')} className="text-gray-400"><ArrowLeft size={20}/></button>
          <span className="font-black text-xs text-[#f0b90b] tracking-widest uppercase">{section}</span>
          <div className="flex gap-4 items-center">
            <button onClick={()=>setSection('Notifications')} className={`text-gray-400 ${section==='Notifications'?'text-[#f0b90b]':''}`}><Bell size={18}/></button>
            <button onClick={()=>setSection('Profile')} className={`text-gray-400 ${section==='Profile'?'text-[#f0b90b]':''}`}><Users size={18}/></button>
          </div>
        </div>

        {section === 'Feed' && (
          <>
            {/* Create Post Input Box */}
            <div style={{padding:'16px', borderBottom:'1px solid #1e2329', background:'rgba(22, 26, 30, 0.2)'}}>
              <div style={{display:'flex', gap:'12px'}}>
                <div className="avatar" style={{width:'38px', height:'38px', background:'#f0b90b', color:'#0b0e11', fontSize:'14px'}}>{myId[0].toUpperCase()}</div>
                <div style={{flex:1}}>
                  <textarea className="post-input" rows="3" placeholder="What's happening in the crypto market today?..." value={newPost} onChange={e=>setNewPost(e.target.value)}/>
                  <div style={{display:'flex', justifyContent:'end', marginTop:'10px'}}>
                    <button onClick={createPost} disabled={posting || !newPost.trim()} className="follow-btn on" style={{padding:'7px 20px', fontSize:'13px', display:'flex', alignItems:'center', gap:'6px'}}>
                      {posting ? <Loader2 size={14} className="spin"/> : <><Send size={12}/> Post</>}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Horizontal Tags Scroll Bar */}
            <div className="tags-container">
              {TAGS.map(t => (
                <button key={t} className={`tag-chip ${activeTag===t?'on':''}`} onClick={()=>setActiveTag(t)}>{t === 'All' ? '🔥 Trends' : `#${t}`}</button>
              ))}
            </div>

            {/* Posts Feed Wrapper */}
            <div style={{background:'#0b0e11'}}>
              {posts.filter(p=>activeTag==='All'||p.tag===activeTag).map(post => (
                <div key={post._id} className="post-card">
                  <div className="avatar" style={{width:'40px', height:'40px', fontSize:'15px', flexShrink:0}}>{post.author[0].toUpperCase()}</div>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{display:'flex', alignItems:'center', justifyWith:'space-between', justifyContent:'space-between', gap:'6px', marginBottom:'4px'}}>
                      <div style={{display:'flex', alignItems:'center', gap:'4px', minWidth:0}}>
                        <span style={{fontWeight:700, color:'#eaecef', fontSize:'14px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{post.author}</span>
                        {post.verified && <span style={{color:'#f0b90b', fontSize:'11px'}}>✓</span>}
                        <span style={{color:'#5e6673', fontSize:'12px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{post.handle}</span>
                      </div>
                      <span style={{color:'#5e6673', fontSize:'11px', flexShrink:0}}>{fmtTime(post.createdAt)}</span>
                    </div>
                    <p style={{fontSize:'14px', color:'#cdbeaf', lineHeight:'1.5', wordBreak:'break-word'}}>{post.content}</p>
                    {post.tag && <span style={{display:'inline-block', color:'#f0b90b', fontSize:'12px', marginTop:'6px', background:'rgba(240,185,11,0.06)', padding:'2px 8px', borderRadius:'4px'}}>#{post.tag}</span>}
                    
                    <div style={{display:'flex', justifyContent:'space-between', marginTop:'12px', maxWidth:'360px'}}>
                      <button className={`post-btn ${post.likes.includes(myId)?'liked':''}`} onClick={()=>likePost(post._id)}><Heart size={15}/> {fmtNum(post.likes.length)}</button>
                      <button className="post-btn" onClick={()=>setOpenComments(o=>({...o, [post._id]:!o[post._id]}))}><MessageCircle size={15}/> {fmtNum(post.comments.length)}</button>
                      <button className="post-btn"><Repeat2 size={15}/> {fmtNum(post.shares)}</button>
                      <button className={`post-btn ${bookmarked.includes(post._id)?'bookmarked':''}`} onClick={()=>toggleBookmark(post._id)}><Bookmark size={15}/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Notifications View */}
        {section === 'Notifications' && (
          <div>
            <div style={{padding:'16px', borderBottom:'1px solid #1e2329', display:'flex', gap:'8px', background:'#0b0e11'}}>
              <button className={`tag-chip ${notifTab==='All'?'on':''}`} onClick={()=>setNotifTab('All')}>All Alerts</button>
              <button className={`tag-chip ${notifTab==='System'?'on':''}`} onClick={()=>setNotifTab('System')}>System</button>
            </div>
            <div style={{background:'#0b0e11'}}>
              {NOTIFS.map((n, i) => (
                <div key={i} className="notif-item">
                  <span style={{fontSize:'20px', flexShrink:0}}>{n.icon}</span>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2px'}}>
                      <h4 style={{fontSize:'13px', fontWeight:700, color:'#fff'}}>{n.title}</h4>
                      <span style={{color:'#5e6673', fontSize:'11px', flexShrink:0}}>{n.time}</span>
                    </div>
                    <p style={{fontSize:'12px', color:'#848e9c', lineHeight:'1.4', wordBreak:'break-word'}}>{n.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Profile and Bookmarks Empty Screen fallback */}
        {(section === 'Bookmarks' || section === 'Profile') && (
          <div style={{textAlign:'center', padding:'80px 20px', color:'#5e6673', background:'#0b0e11'}}>
            <Clock size={40} style={{margin:'0 auto 12px', opacity:0.4}}/>
            <p style={{fontSize:'14px'}}>No entries found under {section} section.</p>
          </div>
        )}
      </div>

      {/* Desktop Right Trends Bar Widgets */}
      <div className="sq-right">
        <div className="sq-search" style={{marginBottom:'20px'}}>
          <Search size={16} style={{color:'#5e6673'}}/>
          <input type="text" placeholder="Search Square topics..." value={searchQ} onChange={e=>setSearchQ(e.target.value)}/>
        </div>
        <div style={{background:'#161a1e', borderRadius:'16px', padding:'16px', marginBottom:'20px', border:'1px solid #2b3139'}}>
          <h3 style={{fontSize:'14px', fontWeight:800, color:'#fff', marginBottom:'12px', textTransform:'uppercase'}}>Trending Today</h3>
          {TRENDING.map((t, i) => (
            <div key={i} className="trending-item">
              <p style={{fontSize:'11px', color:'#5e6673'}}>#{i+1} · Trending</p>
              <h4 className="trend-title" style={{fontSize:'13px', fontWeight:700, color:'#eaecef', margin:'2px 0 4px', transition:'all 0.1s'}}>#{t.tag}</h4>
              <p style={{fontSize:'11px', color:'#848e9c'}}>{t.views} · {t.count}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
