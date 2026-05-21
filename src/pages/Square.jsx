import React, { useState, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import {
  Search, Bell, Bookmark, Settings, Hash, Users,
  MoreHorizontal, Heart, Share2, MessageSquare, Eye,
  Repeat2, Video, FileText, X, Home, Compass, Edit3,
  Send, Loader2, ChevronLeft, TrendingUp, ArrowLeft
} from 'lucide-react';

const TRENDING = [
  { tag: 'BitcoinETFsSee$131MNetInflows',   cnt: '267 Discussing' },
  { tag: 'VitalikMovesETHviaPrivacyPools',  cnt: '1,094 Discussing' },
  { tag: 'DuneCuts25%AmidAIEfficiencyPush', cnt: '865 Discussing' },
  { tag: 'SOLBreaks$90Resistance',          cnt: '543 Discussing' },
  { tag: 'DeFiTVLCrosses$120B',             cnt: '398 Discussing' },
];
const SUGGESTED = [
  { name: 'CryptoWhale',    handle: '@whale_btc',       verified: true  },
  { name: 'DeFi Analyst',   handle: '@defi_pro',        verified: true  },
  { name: 'SolanaKing',     handle: '@sol_king',        verified: false },
];
const NOTIFS = [
  { icon: '🔔', title: 'Market Alert',       body: 'BTC just crossed $85,000. Strong momentum in derivatives.',           time: '2m'   },
  { icon: '💰', title: 'Deposit Confirmed',  body: 'Your deposit has been approved by admin. Balance updated.',            time: '1h'   },
  { icon: '📊', title: 'Trade Alert',        body: 'Your Futures position is up +12.4%. Consider taking profits.',         time: '3h'   },
  { icon: '⭐', title: 'Copy Trade Update',  body: 'CryptoWhale closed a +$234 position. Your copy earned +$18.',          time: '5h'   },
  { icon: '🚀', title: 'Platform Update',    body: 'New features: Advanced charting, stop-loss automation and more.',      time: 'May 6'},
];
const SEED_POSTS = [
  { _id:'1', author:'CryptoWhale',  handle:'@whale_btc',  verified:true,  time:'2m',  content:'$BTC is trading around $80K–$82K zone, showing strong recovery momentum. The weekly close looks extremely bullish. Next target: $90K 🚀', likes:[], comments:[], shares:234, views:8900,  bookmarks:[], tag:'BTC'      },
  { _id:'2', author:'ETH Maxi',     handle:'@eth_maxi',   verified:false, time:'8m',  content:'Ethereum staking rewards at all-time high. With ETF inflows picking up, $ETH could easily see $4K before Q2 ends. DYOR 📈',                likes:[], comments:[], shares:91,  views:3400,  bookmarks:[], tag:'ETH'      },
  { _id:'3', author:'DeFi Analyst', handle:'@defi_pro',   verified:true,  time:'15m', content:'🔥 Total DeFi TVL crosses $120B milestone! @AAVE and @Uniswap leading. The institutional money is finally here.',                          likes:[], comments:[], shares:445, views:15000, bookmarks:[], tag:'DeFi'     },
  { _id:'4', author:'SolanaKing',   handle:'@sol_king',   verified:false, time:'32m', content:'$SOL just broke $90 resistance. Next target is $110. 400+ new projects this month alone 📈',                                                likes:[], comments:[], shares:123, views:6700,  bookmarks:[], tag:'SOL'      },
  { _id:'5', author:'MarketGuru',   handle:'@mktguru',    verified:true,  time:'1h',  content:'BTC dominance at 54.3%. Alt season incoming? When BTC dom drops below 50%, altcoins see 3–5x moves historically.',                         likes:[], comments:[], shares:678, views:24000, bookmarks:[], tag:'Analysis' },
];
const TAGS = ['All','BTC','ETH','SOL','DeFi','NFT','Meme','Analysis','News'];
const fmtN = n => n >= 1000 ? `${(n/1000).toFixed(1)}K` : String(n);

export default function Square() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const myId = user?.email || 'guest';

  const [section,   setSection]   = useState('Feed');
  const [posts,     setPosts]     = useState(SEED_POSTS);
  const [newPost,   setNewPost]   = useState('');
  const [activeTag, setActiveTag] = useState('All');
  const [followed,  setFollowed]  = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [notifTab,  setNotifTab]  = useState('All');
  const [openCmts,  setOpenCmts]  = useState({});
  const [cmtIn,     setCmtIn]     = useState({});
  const [posting,   setPosting]   = useState(false);
  const [searchQ,   setSearchQ]   = useState('');
  const [showSearch,setShowSearch]= useState(false);
  const [detailPost,setDetailPost]= useState(null);
  const [detailCmt, setDetailCmt] = useState('');
  const textRef = useRef();

  /* ── Actions ── */
  const likePost = (id) => setPosts(p => p.map(post =>
    post._id !== id ? post :
    post.likes.includes(myId)
      ? {...post, likes: post.likes.filter(x => x !== myId)}
      : {...post, likes: [...post.likes, myId]}
  ));

  const bookmarkPost = (id) => setBookmarks(b =>
    b.includes(id) ? b.filter(x => x !== id) : [...b, id]
  );

  const retweetPost = (id) => setPosts(p => p.map(post =>
    post._id === id ? {...post, shares: post.shares+1} : post
  ));

  const toggleCmts = (id) => setOpenCmts(o => ({...o, [id]: !o[id]}));

  const submitCmt = (postId) => {
    const text = cmtIn[postId]?.trim();
    if (!text) return;
    const c = { id: Date.now(), author: user?.name||'You', handle:'@'+(user?.email?.split('@')[0]||'user'), text, time:'just now' };
    setPosts(p => p.map(post => post._id === postId ? {...post, comments:[...post.comments, c]} : post));
    setCmtIn(o => ({...o, [postId]: ''}));
    if (detailPost?._id === postId) setDetailPost(dp => ({...dp, comments:[...dp.comments, c]}));
  };

  const submitPost = async () => {
    if (!newPost.trim()) return;
    setPosting(true);
    await new Promise(r => setTimeout(r, 500));
    const np = { _id: String(Date.now()), author: user?.name||'You', handle:'@'+(user?.email?.split('@')[0]||'user'), verified:false, time:'just now', content:newPost, likes:[], comments:[], shares:0, views:0, bookmarks:[], tag:'All' };
    setPosts(p => [np, ...p]);
    setNewPost('');
    setPosting(false);
  };

  const filtered = posts.filter(p => {
    if (section === 'Bookmarks') return bookmarks.includes(p._id);
    const matchTag = activeTag === 'All' || p.tag === activeTag;
    const matchQ   = !searchQ || p.content?.toLowerCase().includes(searchQ.toLowerCase()) || p.author?.toLowerCase().includes(searchQ.toLowerCase());
    return matchTag && matchQ;
  });

  /* ── CSS ── */
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    .sq-wrap{font-family:'Inter',sans-serif;background:#0b0e11;color:#eaecef;min-height:100vh;display:flex;}
    .sq-wrap *{box-sizing:border-box;margin:0;padding:0;}
    /* scrollbar */
    .sq-wrap ::-webkit-scrollbar{width:3px;height:3px;}
    .sq-wrap ::-webkit-scrollbar-thumb{background:#2b3139;border-radius:3px;}
    /* left sidebar */
    .sq-left{width:250px;flex-shrink:0;border-right:1px solid #1e2329;padding:16px 10px;height:100vh;position:sticky;top:0;overflow-y:auto;scrollbar-width:none;display:flex;flex-direction:column;gap:2px;}
    .sq-left::-webkit-scrollbar{display:none;}
    /* center */
    .sq-center{flex:1;min-width:0;border-right:1px solid #1e2329;overflow-y:auto;height:100vh;}
    /* right */
    .sq-right{width:310px;flex-shrink:0;padding:18px 14px;height:100vh;position:sticky;top:0;overflow-y:auto;scrollbar-width:none;}
    .sq-right::-webkit-scrollbar{display:none;}
    /* nav item */
    .sq-ni{display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:10px;cursor:pointer;color:#848e9c;font-weight:500;font-size:14px;border:none;background:transparent;width:100%;text-align:left;font-family:inherit;transition:all .15s;}
    .sq-ni:hover,.sq-ni.on{background:#161a1e;color:#eaecef;}
    .sq-ni.on{font-weight:700;color:#f0b90b;}
    /* post card */
    .post-c{border-bottom:1px solid #1e2329;padding:14px 16px;transition:background .15s;cursor:pointer;}
    .post-c:hover{background:rgba(255,255,255,.02);}
    /* avatar */
    .av{border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0;overflow:hidden;}
    /* post btn */
    .pb{display:flex;align-items:center;gap:4px;padding:5px 9px;border-radius:20px;border:none;background:transparent;color:#848e9c;font-size:12px;cursor:pointer;transition:all .15s;font-family:inherit;}
    .pb:hover{background:#161a1e;color:#eaecef;}
    .pb.lk{color:#f6465d;}
    .pb.bm{color:#f0b90b;}
    .pb.rt{color:#0ecb81;}
    /* tag chip */
    .tc{padding:5px 13px;border-radius:20px;border:1px solid #2b3139;background:transparent;color:#848e9c;font-size:12px;cursor:pointer;white-space:nowrap;transition:all .15s;font-family:inherit;}
    .tc:hover,.tc.on{border-color:#f0b90b;color:#f0b90b;background:rgba(240,185,11,.05);}
    /* follow btn */
    .fb{padding:5px 14px;border:1px solid #f0b90b;border-radius:20px;background:transparent;color:#f0b90b;font-size:11px;font-weight:700;cursor:pointer;transition:all .15s;font-family:inherit;white-space:nowrap;}
    .fb:hover,.fb.on{background:#f0b90b;color:#0b0e11;}
    /* textarea */
    .sq-ta{background:#161a1e;border:1px solid #2b3139;border-radius:12px;padding:12px 14px;width:100%;resize:none;color:#eaecef;font-size:14px;outline:none;font-family:inherit;transition:border .15s;min-height:76px;}
    .sq-ta:focus{border-color:#f0b90b;}
    .sq-ta::placeholder{color:#5e6673;}
    /* comment input */
    .ci{flex:1;background:transparent;border:none;outline:none;color:#eaecef;font-size:13px;font-family:inherit;}
    .ci::placeholder{color:#5e6673;}
    /* search */
    .sq-sr{display:flex;align-items:center;gap:8px;background:#161a1e;border:1px solid #2b3139;border-radius:24px;padding:8px 14px;transition:border .15s;}
    .sq-sr:focus-within{border-color:#f0b90b;}
    .sq-sr input{background:transparent;border:none;outline:none;color:#eaecef;font-size:13px;font-family:inherit;width:100%;}
    .sq-sr input::placeholder{color:#5e6673;}
    /* notif */
    .ni{display:flex;gap:12px;padding:14px 16px;border-bottom:1px solid #1e2329;cursor:pointer;transition:background .15s;}
    .ni:hover{background:rgba(255,255,255,.02);}
    /* animations */
    @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
    @keyframes spin{to{transform:rotate(360deg)}}
    .fade-up{animation:fadeUp .2s;}
    .spin{animation:spin .7s linear infinite;}
    /* mobile bottom nav */
    .mob-bar{display:none;position:fixed;bottom:0;left:0;right:0;background:#161a1e;border-top:1px solid #1e2329;z-index:200;padding:6px 0 8px;}
    /* hide/show responsive */
    @media(max-width:1100px){ .sq-right{display:none;} }
    @media(max-width:768px){
      .sq-left{display:none;}
      .sq-center{border:none;height:auto;min-height:calc(100vh - 56px - 56px);overflow-y:visible;}
      .sq-wrap{display:block;}
      .mob-bar{display:flex;justify-content:space-around;align-items:center;}
    }
  `;

  /* ── Post Detail Overlay ── */
  const PostDetail = ({ post }) => (
    <div style={{position:'fixed',inset:0,background:'#0b0e11',zIndex:300,display:'flex',flexDirection:'column',overflowY:'auto'}}>
      <div style={{position:'sticky',top:0,background:'rgba(11,14,17,.97)',backdropFilter:'blur(8px)',borderBottom:'1px solid #1e2329',padding:'12px 16px',display:'flex',alignItems:'center',gap:12,zIndex:10}}>
        <button onClick={() => setDetailPost(null)} style={{background:'none',border:'none',color:'#eaecef',cursor:'pointer',display:'flex'}}><ArrowLeft size={20}/></button>
        <span style={{fontWeight:700,fontSize:16}}>Post</span>
      </div>
      <div style={{padding:'16px',borderBottom:'1px solid #1e2329'}}>
        <div style={{display:'flex',gap:12,marginBottom:12}}>
          <div className="av" style={{width:46,height:46,background:`hsl(${post._id.charCodeAt(0)*40},50%,38%)`,fontSize:17,flexShrink:0}}>{post.author[0]}</div>
          <div>
            <p style={{fontWeight:700,fontSize:15,color:'#eaecef'}}>{post.author} {post.verified && <span style={{color:'#f0b90b'}}>✓</span>}</p>
            <p style={{color:'#848e9c',fontSize:12}}>{post.handle} · {post.time}</p>
          </div>
        </div>
        <p style={{fontSize:16,color:'#c6cad2',lineHeight:1.7,marginBottom:14}}>
          {post.content.split(/(\$\w+|@\w+|#\w+)/).map((pt,i) =>
            /^\$|^@|^#/.test(pt) ? <span key={i} style={{color:'#f0b90b'}}>{pt}</span> : pt
          )}
        </p>
        <div style={{display:'flex',gap:4,paddingTop:12,borderTop:'1px solid #1e2329'}}>
          <button className={`pb${post.likes.includes(myId)?' lk':''}`} onClick={() => likePost(post._id)}>
            <Heart size={16} style={post.likes.includes(myId)?{fill:'#f6465d',color:'#f6465d'}:{}}/> {fmtN(post.likes.length)}
          </button>
          <button className="pb"><MessageSquare size={16}/> {fmtN(post.comments.length)}</button>
          <button className="pb rt" onClick={() => retweetPost(post._id)}><Repeat2 size={16}/> {fmtN(post.shares)}</button>
          <button className={`pb${bookmarks.includes(post._id)?' bm':''}`} onClick={() => bookmarkPost(post._id)}>
            <Bookmark size={16} style={bookmarks.includes(post._id)?{fill:'#f0b90b',color:'#f0b90b'}:{}}/>
          </button>
          <button className="pb" onClick={() => { navigator.clipboard?.writeText(post.content); }}><Share2 size={16}/></button>
          <span style={{marginLeft:'auto',fontSize:11,color:'#5e6673',display:'flex',alignItems:'center',gap:4}}><Eye size={12}/>{fmtN(post.views)}</span>
        </div>
      </div>
      <div style={{flex:1}}>
        {post.comments.map((c,i) => (
          <div key={i} style={{display:'flex',gap:10,padding:'13px 16px',borderBottom:'1px solid #1e232940'}}>
            <div className="av" style={{width:34,height:34,background:'#2b3139',fontSize:13,flexShrink:0}}>{c.author[0]}</div>
            <div>
              <span style={{fontWeight:700,fontSize:13,color:'#eaecef'}}>{c.author}</span>
              <span style={{color:'#5e6673',fontSize:11,marginLeft:6}}>· {c.time}</span>
              <p style={{color:'#c6cad2',fontSize:13,marginTop:3,lineHeight:1.5}}>{c.text}</p>
            </div>
          </div>
        ))}
        {!post.comments.length && <p style={{textAlign:'center',padding:40,color:'#5e6673',fontSize:13}}>No comments yet — be the first!</p>}
      </div>
      <div style={{position:'sticky',bottom:0,background:'rgba(11,14,17,.98)',borderTop:'1px solid #1e2329',padding:'10px 16px',display:'flex',gap:10,alignItems:'center'}}>
        <div className="av" style={{width:34,height:34,background:'#2b3139',fontSize:13,flexShrink:0}}>{user?.name?.[0]||'U'}</div>
        <div style={{flex:1,display:'flex',alignItems:'center',background:'#161a1e',border:'1px solid #2b3139',borderRadius:24,padding:'7px 13px',gap:8}}>
          <input className="ci" value={detailCmt} onChange={e => setDetailCmt(e.target.value)} placeholder="Add a comment..." onKeyDown={e => e.key==='Enter' && (() => { submitCmt(post._id); setDetailCmt(''); })()}/>
          <button onClick={() => { submitCmt(post._id); setDetailCmt(''); }}
            style={{background:detailCmt.trim()?'#f0b90b':'#2b3139',border:'none',borderRadius:'50%',width:28,height:28,cursor:detailCmt.trim()?'pointer':'default',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'background .15s'}}>
            <Send size={13} style={{color:detailCmt.trim()?'#0b0e11':'#5e6673'}}/>
          </button>
        </div>
      </div>
    </div>
  );

  /* ── Post Card ── */
  const PostCard = ({ post }) => {
    const liked = post.likes.includes(myId);
    const isBM  = bookmarks.includes(post._id);
    const showC = openCmts[post._id];
    return (
      <div className="post-c fade-up" onClick={() => setDetailPost(post)}>
        <div style={{display:'flex',gap:10}}>
          <div className="av" style={{width:42,height:42,background:`hsl(${post._id.charCodeAt(0)*40},50%,38%)`,fontSize:15,flexShrink:0}}>{post.author[0]}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:'flex',alignItems:'center',gap:5,marginBottom:3,flexWrap:'wrap'}}>
              <span style={{fontWeight:700,fontSize:14,color:'#eaecef'}}>{post.author}</span>
              {post.verified && <span style={{color:'#f0b90b',fontSize:12}}>✓</span>}
              <span style={{color:'#5e6673',fontSize:11}}>· {post.time}</span>
            </div>
            <p style={{fontSize:13,color:'#c6cad2',lineHeight:1.6,marginBottom:10}}>
              {post.content.split(/(\$\w+|@\w+|#\w+)/).map((pt,i) =>
                /^\$|^@|^#/.test(pt) ? <span key={i} style={{color:'#f0b90b'}}>{pt}</span> : pt
              )}
            </p>
            <div style={{display:'flex',gap:2,alignItems:'center',flexWrap:'wrap'}} onClick={e => e.stopPropagation()}>
              <button className={`pb${liked?' lk':''}`} onClick={() => likePost(post._id)}>
                <Heart size={14} style={liked?{fill:'#f6465d',color:'#f6465d'}:{}}/> {fmtN(post.likes.length)}
              </button>
              <button className="pb" onClick={() => { setDetailPost(post); setDetailCmt(''); }}>
                <MessageSquare size={14}/> {fmtN(post.comments.length)}
              </button>
              <button className="pb rt" onClick={() => retweetPost(post._id)}><Repeat2 size={14}/> {fmtN(post.shares)}</button>
              <button className={`pb${isBM?' bm':''}`} onClick={() => bookmarkPost(post._id)}>
                <Bookmark size={14} style={isBM?{fill:'#f0b90b',color:'#f0b90b'}:{}}/>
              </button>
              <button className="pb" onClick={() => { navigator.clipboard?.writeText(post.content); }}><Share2 size={14}/></button>
              <span style={{marginLeft:'auto',fontSize:11,color:'#5e6673',display:'flex',alignItems:'center',gap:3}}><Eye size={11}/> {fmtN(post.views)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ── Right Panel ── */
  const RightPanel = () => (
    <div>
      <div className="sq-sr" style={{marginBottom:14}}>
        <Search size={14} style={{color:'#5e6673',flexShrink:0}}/>
        <input placeholder="Search Square..." value={searchQ} onChange={e => setSearchQ(e.target.value)}/>
      </div>
      <div style={{background:'#161a1e',borderRadius:14,padding:14,marginBottom:14,border:'1px solid #1e2329'}}>
        <h3 style={{fontWeight:700,fontSize:14,color:'#eaecef',marginBottom:12,display:'flex',alignItems:'center',gap:6}}>🔥 Trending</h3>
        {TRENDING.map((t,i) => (
          <div key={i} style={{padding:'7px 0',borderBottom:i<TRENDING.length-1?'1px solid #1e232940':'none',cursor:'pointer'}}
            onClick={() => setSearchQ(t.tag)}>
            <div style={{display:'flex',gap:7,alignItems:'flex-start'}}>
              <Hash size={11} style={{color:'#f0b90b',marginTop:2,flexShrink:0}}/>
              <div>
                <p style={{fontWeight:700,fontSize:12,color:'#eaecef',marginBottom:1}}>{t.tag}</p>
                <p style={{fontSize:10,color:'#5e6673'}}>{t.cnt}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{background:'#161a1e',borderRadius:14,padding:14,border:'1px solid #1e2329'}}>
        <h3 style={{fontWeight:700,fontSize:14,color:'#eaecef',marginBottom:12}}>Suggested</h3>
        {SUGGESTED.map((c,i) => (
          <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:i<SUGGESTED.length-1?'1px solid #1e232940':'none'}}>
            <div className="av" style={{width:36,height:36,background:`hsl(${i*80+30},50%,38%)`,fontSize:13}}>{c.name[0]}</div>
            <div style={{flex:1,minWidth:0}}>
              <p style={{fontWeight:700,fontSize:12,color:'#eaecef'}}>{c.name} {c.verified && <span style={{color:'#f0b90b'}}>✓</span>}</p>
              <p style={{fontSize:11,color:'#848e9c',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.handle}</p>
            </div>
            <button className={`fb${followed.includes(c.handle)?' on':''}`}
              onClick={() => setFollowed(f => f.includes(c.handle)?f.filter(h=>h!==c.handle):[...f,c.handle])}>
              {followed.includes(c.handle)?'Following':'Follow'}
            </button>
          </div>
        ))}
      </div>
      <p style={{padding:'12px 0',fontSize:10,color:'#5e6673',lineHeight:2}}>
        <span style={{cursor:'pointer',marginRight:8}}>Terms</span>
        <span style={{cursor:'pointer',marginRight:8}}>Privacy</span>
        <span style={{cursor:'pointer'}}>Cookies</span>
      </p>
    </div>
  );

  /* ── Feed ── */
  const FeedSection = () => (
    <>
      <div style={{padding:'14px 16px',borderBottom:'1px solid #1e2329'}}>
        <div style={{display:'flex',gap:10}}>
          <div className="av" style={{width:40,height:40,background:user?.name?'#f0b90b':'#2b3139',color:'#0b0e11',fontSize:14,flexShrink:0}}>{user?.name?.[0]||'U'}</div>
          <div style={{flex:1}}>
            <textarea className="sq-ta" placeholder="What's happening in crypto?" value={newPost}
              onChange={e => setNewPost(e.target.value)} ref={textRef} rows={3}
              onKeyDown={e => { if(e.key==='Enter'&&e.ctrlKey) submitPost(); }}/>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:8}}>
              <div style={{display:'flex',gap:12,color:'#f0b90b'}}>
                <FileText size={16} style={{cursor:'pointer'}} title="Attach"/>
                <Hash size={16} style={{cursor:'pointer'}} title="Tag"/>
                <TrendingUp size={16} style={{cursor:'pointer'}} title="Chart"/>
              </div>
              <button onClick={submitPost} disabled={!newPost.trim()||posting}
                style={{padding:'7px 18px',background:newPost.trim()&&!posting?'#f0b90b':'#2b3139',border:'none',borderRadius:20,color:newPost.trim()&&!posting?'#0b0e11':'#5e6673',fontWeight:700,fontSize:12,cursor:newPost.trim()?'pointer':'not-allowed',display:'flex',alignItems:'center',gap:6,fontFamily:'inherit',transition:'all .15s'}}>
                {posting && <Loader2 size={13} className="spin"/>} Post
              </button>
            </div>
          </div>
        </div>
      </div>
      <div style={{display:'flex',gap:6,padding:'10px 16px',borderBottom:'1px solid #1e2329',overflowX:'auto',scrollbarWidth:'none'}}>
        {TAGS.map(t => <button key={t} className={`tc${activeTag===t?' on':''}`} onClick={() => setActiveTag(t)}>{t}</button>)}
      </div>
      {filtered.length === 0 && (
        <div style={{textAlign:'center',padding:60,color:'#5e6673'}}>
          <FileText size={36} style={{opacity:.12,margin:'0 auto 12px',display:'block'}}/>
          <p style={{fontSize:13}}>No posts found</p>
        </div>
      )}
      {filtered.map(post => <PostCard key={post._id} post={post}/>)}
    </>
  );

  /* ── Notifications ── */
  const NotifSection = () => (
    <>
      <div style={{padding:'14px 16px',borderBottom:'1px solid #1e2329'}}>
        <h2 style={{fontSize:17,fontWeight:700,marginBottom:12}}>Notifications</h2>
        <div style={{display:'flex',overflowX:'auto',scrollbarWidth:'none'}}>
          {['All','Trades','System'].map(t => (
            <button key={t} onClick={() => setNotifTab(t)}
              style={{padding:'7px 14px',background:'transparent',border:'none',cursor:'pointer',color:notifTab===t?'#eaecef':'#848e9c',borderBottom:notifTab===t?'2px solid #f0b90b':'2px solid transparent',fontWeight:notifTab===t?700:500,fontSize:12,whiteSpace:'nowrap',fontFamily:'inherit'}}>
              {t}
            </button>
          ))}
        </div>
      </div>
      {NOTIFS.map((n,i) => (
        <div key={i} className="ni">
          <div style={{width:40,height:40,borderRadius:'50%',background:'#161a1e',border:'1px solid #2b3139',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:18}}>{n.icon}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
              <span style={{fontWeight:700,fontSize:13,color:'#eaecef'}}>{n.title}</span>
              <span style={{fontSize:10,color:'#5e6673',flexShrink:0,marginLeft:8}}>{n.time}</span>
            </div>
            <p style={{fontSize:12,color:'#848e9c',lineHeight:1.5}}>{n.body}</p>
          </div>
        </div>
      ))}
    </>
  );

  /* ── Profile ── */
  const ProfileSection = () => (
    <div style={{padding:16}}>
      <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:18,flexWrap:'wrap'}}>
        <div className="av" style={{width:64,height:64,background:'#f0b90b',color:'#0b0e11',fontSize:24}}>{user?.name?.[0]||'U'}</div>
        <div>
          <h2 style={{fontSize:18,fontWeight:700,color:'#eaecef'}}>{user?.name||'Guest'}</h2>
          <p style={{color:'#848e9c',fontSize:13}}>@{user?.email?.split('@')[0]||'user'}</p>
          <div style={{display:'flex',gap:16,marginTop:6,fontSize:12,color:'#848e9c'}}>
            <span><span style={{color:'#eaecef',fontWeight:700}}>{followed.length}</span> Following</span>
            <span><span style={{color:'#eaecef',fontWeight:700}}>0</span> Followers</span>
          </div>
        </div>
        <button onClick={() => navigate('/profile')}
          style={{marginLeft:'auto',padding:'7px 16px',border:'1px solid #2b3139',borderRadius:20,background:'transparent',color:'#eaecef',fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>
          Edit Profile
        </button>
      </div>
      <div style={{background:'#161a1e',borderRadius:12,padding:14,marginBottom:16,border:'1px solid #1e2329'}}>
        <p style={{color:'#848e9c',fontSize:13}}>Balance: <span style={{color:'#f0b90b',fontWeight:700}}>${(user?.balance||0).toFixed(2)} USDT</span></p>
      </div>
      <div style={{textAlign:'center',padding:40,color:'#5e6673'}}>
        <FileText size={36} style={{opacity:.12,margin:'0 auto 12px',display:'block'}}/>
        <p style={{fontSize:13}}>No posts yet</p>
        <button onClick={() => setSection('Feed')}
          style={{marginTop:12,padding:'8px 22px',background:'#f0b90b',border:'none',borderRadius:20,color:'#0b0e11',fontWeight:700,fontSize:13,cursor:'pointer',fontFamily:'inherit'}}>
          Start Posting
        </button>
      </div>
    </div>
  );

  /* ── Bookmarks ── */
  const BookmarksSection = () => (
    <>
      <div style={{padding:'14px 16px',borderBottom:'1px solid #1e2329',display:'flex',alignItems:'center',gap:10}}>
        <button onClick={() => setSection('Feed')} style={{background:'none',border:'none',color:'#848e9c',cursor:'pointer',display:'flex'}}><ChevronLeft size={20}/></button>
        <h2 style={{fontSize:17,fontWeight:700}}>Bookmarks</h2>
      </div>
      {filtered.length === 0
        ? <div style={{textAlign:'center',padding:60,color:'#5e6673'}}>
            <Bookmark size={36} style={{opacity:.12,margin:'0 auto 12px',display:'block'}}/>
            <p style={{fontSize:13}}>No bookmarks yet</p>
          </div>
        : filtered.map(p => <PostCard key={p._id} post={p}/>)
      }
    </>
  );

  const navItems = [
    { icon:<Home size={20}/>,          label:'Feed',          key:'Feed'         },
    { icon:<Bell size={20}/>,          label:'Notifications', key:'Notification', badge:NOTIFS.length },
    { icon:<Users size={20}/>,         label:'Profile',       key:'Profile'      },
    { icon:<Bookmark size={20}/>,      label:'Bookmarks',     key:'Bookmarks'    },
    { icon:<TrendingUp size={20}/>,    label:'Trending',      key:'Trending'     },
    { icon:<Compass size={20}/>,       label:'Explore',       key:'Explore'      },
    { icon:<Settings size={20}/>,      label:'Settings',      key:'Settings'     },
  ];

  return (
    <>
      <style>{css}</style>

      {/* ── Post Detail Overlay ── */}
      {detailPost && <PostDetail post={detailPost}/>}

      <div className="sq-wrap">

        {/* ── LEFT SIDEBAR (desktop) ── */}
        <div className="sq-left">
          <div style={{fontSize:13,fontWeight:800,color:'#f0b90b',padding:'2px 14px 14px',letterSpacing:1}}>VINANCE SQUARE</div>
          {navItems.map(item => (
            <button key={item.key} className={`sq-ni${section===item.key?' on':''}`} onClick={() => setSection(item.key)}>
              <div style={{position:'relative'}}>
                {item.icon}
                {item.badge > 0 && (
                  <span style={{position:'absolute',top:-5,right:-5,width:15,height:15,background:'#f6465d',borderRadius:'50%',fontSize:9,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',border:'2px solid #0b0e11',color:'#fff'}}>{item.badge}</span>
                )}
              </div>
              <span>{item.label}</span>
            </button>
          ))}
          <div style={{marginTop:'auto',borderTop:'1px solid #1e2329',paddingTop:10}}>
            <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px'}}>
              <div className="av" style={{width:36,height:36,background:'#f0b90b',color:'#0b0e11',fontSize:13,flexShrink:0}}>{user?.name?.[0]||'U'}</div>
              <div style={{minWidth:0,flex:1}}>
                <p style={{fontWeight:700,fontSize:12,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.name||'Guest'}</p>
                <p style={{fontSize:10,color:'#5e6673',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>@{user?.email?.split('@')[0]||'user'}</p>
              </div>
              <button onClick={() => navigate('/dashboard')} style={{background:'none',border:'none',color:'#848e9c',cursor:'pointer'}} title="Dashboard"><ArrowLeft size={15}/></button>
            </div>
          </div>
        </div>

        {/* ── CENTER ── */}
        <div className="sq-center">
          {/* Sticky header */}
          <div style={{position:'sticky',top:0,background:'rgba(11,14,17,.97)',backdropFilter:'blur(8px)',borderBottom:'1px solid #1e2329',padding:'11px 16px',zIndex:50,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              {/* Mobile back to dashboard */}
              <button onClick={() => navigate('/dashboard')} style={{background:'none',border:'none',color:'#848e9c',cursor:'pointer',display:'none'}} id="sq-back-btn">
                <ChevronLeft size={20}/>
              </button>
              <h2 style={{fontSize:16,fontWeight:700}}>{section==='Feed'?'Square':section}</h2>
            </div>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              {showSearch ? (
                <div className="sq-sr" style={{padding:'6px 12px'}}>
                  <Search size={13} style={{color:'#5e6673',flexShrink:0}}/>
                  <input placeholder="Search..." value={searchQ} onChange={e => setSearchQ(e.target.value)} style={{width:140}} autoFocus/>
                  <button onClick={() => { setShowSearch(false); setSearchQ(''); }} style={{background:'none',border:'none',color:'#848e9c',cursor:'pointer',padding:0}}><X size={13}/></button>
                </div>
              ) : (
                <button onClick={() => setShowSearch(true)} style={{background:'none',border:'none',color:'#848e9c',cursor:'pointer',display:'flex',padding:4}}><Search size={18}/></button>
              )}
              {section==='Feed' && (
                <button onClick={() => textRef.current?.focus()} style={{background:'none',border:'none',color:'#848e9c',cursor:'pointer',display:'flex',padding:4}}><Edit3 size={18}/></button>
              )}
            </div>
          </div>

          {section==='Feed'         && <FeedSection/>}
          {section==='Notification' && <NotifSection/>}
          {section==='Profile'      && <ProfileSection/>}
          {section==='Bookmarks'    && <BookmarksSection/>}
          {!['Feed','Notification','Profile','Bookmarks'].includes(section) && (
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:80,color:'#5e6673'}}>
              <Compass size={44} style={{opacity:.12,marginBottom:14}}/>
              <p style={{fontSize:13}}>{section} — Coming Soon</p>
              <button onClick={() => setSection('Feed')} style={{marginTop:14,padding:'8px 20px',background:'#f0b90b',border:'none',borderRadius:20,color:'#0b0e11',fontWeight:700,fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>Back to Feed</button>
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL (desktop) ── */}
        <div className="sq-right"><RightPanel/></div>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="mob-bar">
        {[
          { icon:<Home size={22}/>,     key:'Feed'         },
          { icon:<Search size={22}/>,   key:'_search',     action:() => setShowSearch(v => !v) },
          { icon:<Bell size={22}/>,     key:'Notification', badge:NOTIFS.length },
          { icon:<Bookmark size={22}/>, key:'Bookmarks'    },
          { icon:<Users size={22}/>,    key:'Profile'      },
        ].map(item => (
          <button key={item.key}
            onClick={() => item.action ? item.action() : setSection(item.key)}
            style={{background:'none',border:'none',padding:'4px 10px',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:2,position:'relative',color:section===item.key&&!item.action?'#f0b90b':'#848e9c',transition:'color .15s'}}>
            {item.icon}
            {item.badge > 0 && (
              <span style={{position:'absolute',top:0,right:6,width:14,height:14,background:'#f6465d',borderRadius:'50%',fontSize:9,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',border:'2px solid #161a1e',color:'#fff'}}>{item.badge}</span>
            )}
          </button>
        ))}
      </nav>

      <style>{`
        @media(max-width:768px){
          #sq-back-btn{display:flex!important;}
          .sq-center{padding-bottom:70px;}
        }
      `}</style>
    </>
  );
}
