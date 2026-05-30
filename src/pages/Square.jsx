import React, { useState, useRef, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import axios from 'axios';
import {
  Search, Bell, Bookmark, Settings, Hash, Users,
  Heart, Share2, MessageSquare, Eye, Repeat2,
  FileText, X, Home, Compass, Edit3, Send, Loader2,
  ChevronLeft, TrendingUp, ArrowLeft, Check, Link2,
  Twitter, Copy, Moon, Sun, Volume2, VolumeX,
  Shield, HelpCircle, LogOut, ChevronRight, Star,
  AlertCircle, UserCheck, Ban, MoreHorizontal, RefreshCw
} from 'lucide-react';

const API = 'https://vinance-backend-1.onrender.com';

const TRENDING = [
  { tag:'BitcoinETFsSee$131MNetInflows',  cnt:'267 Discussing' },
  { tag:'VitalikMovesETHviaPrivacyPools', cnt:'1,094 Discussing' },
  { tag:'SOLBreaks$90Resistance',         cnt:'543 Discussing' },
  { tag:'DeFiTVLCrosses$120B',            cnt:'398 Discussing' },
  { tag:'BNBChainNewProjects',            cnt:'221 Discussing' },
];
const SUGGESTED = [
  { name:'CryptoWhale',  handle:'@whale_btc',  verified:true  },
  { name:'DeFi Analyst', handle:'@defi_pro',   verified:true  },
  { name:'SolanaKing',   handle:'@sol_king',   verified:false },
];
const TAGS = ['All','BTC','ETH','SOL','DeFi','NFT','Meme','Analysis','News'];
const fmtN = n => n >= 1000 ? `${(n/1000).toFixed(1)}K` : String(n||0);
const timeAgo = d => {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s/60)}m`;
  if (s < 86400) return `${Math.floor(s/3600)}h`;
  return `${Math.floor(s/86400)}d`;
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  .sq{font-family:'Inter',sans-serif;background:#0b0e11;color:#eaecef;min-height:100vh;display:flex;flex-direction:column;}
  .sq *{box-sizing:border-box;margin:0;padding:0;}
  .sq ::-webkit-scrollbar{width:3px;height:3px;}
  .sq ::-webkit-scrollbar-thumb{background:#2b3139;border-radius:3px;}
  .sq-body{display:flex;flex:1;max-width:1280px;margin:0 auto;width:100%;}
  .sq-left{width:240px;flex-shrink:0;border-right:1px solid #1e2329;padding:16px 10px;height:100vh;position:sticky;top:0;overflow-y:auto;scrollbar-width:none;display:flex;flex-direction:column;gap:2px;}
  .sq-left::-webkit-scrollbar{display:none;}
  .sq-center{flex:1;min-width:0;border-right:1px solid #1e2329;overflow-y:auto;height:100vh;}
  .sq-right{width:300px;flex-shrink:0;padding:16px 14px;height:100vh;position:sticky;top:0;overflow-y:auto;scrollbar-width:none;}
  .sq-right::-webkit-scrollbar{display:none;}
  .sq-ni{display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:10px;cursor:pointer;color:#848e9c;font-weight:500;font-size:14px;border:none;background:transparent;width:100%;text-align:left;font-family:inherit;transition:all .15s;}
  .sq-ni:hover{background:#161a1e;color:#eaecef;}
  .sq-ni.on{background:#161a1e;color:#f0b90b;font-weight:700;}
  .post-c{border-bottom:1px solid #1e2329;padding:14px 16px;transition:background .15s;}
  .post-c:hover{background:rgba(255,255,255,.02);}
  .av{border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0;overflow:hidden;}
  .pb{display:flex;align-items:center;gap:4px;padding:5px 8px;border-radius:20px;border:none;background:transparent;color:#848e9c;font-size:12px;cursor:pointer;transition:all .15s;font-family:inherit;}
  .pb:hover{background:#1e2329;color:#eaecef;}
  .pb.lk{color:#f6465d;}
  .pb.bm{color:#f0b90b;}
  .pb.rt{color:#0ecb81;}
  .tc{padding:5px 13px;border-radius:20px;border:1px solid #2b3139;background:transparent;color:#848e9c;font-size:12px;cursor:pointer;white-space:nowrap;transition:all .15s;font-family:inherit;}
  .tc:hover,.tc.on{border-color:#f0b90b;color:#f0b90b;background:rgba(240,185,11,.05);}
  .fb{padding:5px 14px;border:1px solid #f0b90b;border-radius:20px;background:transparent;color:#f0b90b;font-size:11px;font-weight:700;cursor:pointer;transition:all .15s;font-family:inherit;white-space:nowrap;}
  .fb:hover,.fb.on{background:#f0b90b;color:#0b0e11;}
  .sq-ta{background:#161a1e;border:1px solid #2b3139;border-radius:12px;padding:12px 14px;width:100%;resize:none;color:#eaecef;font-size:14px;outline:none;font-family:inherit;transition:border .15s;min-height:76px;}
  .sq-ta:focus{border-color:#f0b90b;}
  .sq-ta::placeholder{color:#5e6673;}
  .ci{flex:1;background:transparent;border:none;outline:none;color:#eaecef;font-size:13px;font-family:inherit;}
  .ci::placeholder{color:#5e6673;}
  .sq-sr{display:flex;align-items:center;gap:8px;background:#161a1e;border:1px solid #2b3139;border-radius:24px;padding:8px 14px;transition:border .15s;}
  .sq-sr:focus-within{border-color:#f0b90b;}
  .sq-sr input{background:transparent;border:none;outline:none;color:#eaecef;font-size:13px;font-family:inherit;width:100%;}
  .ni{display:flex;gap:12px;padding:13px 16px;border-bottom:1px solid #1e2329;cursor:pointer;transition:background .15s;}
  .ni:hover{background:rgba(255,255,255,.02);}
  .share-modal{position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:500;display:flex;align-items:flex-end;justify-content:center;padding:0;}
  .share-box{background:#161a1e;border:1px solid #2b3139;border-radius:20px 20px 0 0;padding:20px;width:100%;max-width:480px;animation:slideUp .25s;}
  .settings-panel{position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:400;display:flex;align-items:center;justify-content:center;padding:16px;}
  .settings-box{background:#161a1e;border:1px solid #2b3139;border-radius:20px;width:100%;max-width:420px;max-height:90vh;overflow-y:auto;}
  .settings-row{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-bottom:1px solid #1e2329;cursor:pointer;transition:background .15s;}
  .settings-row:hover{background:rgba(255,255,255,.03);}
  .settings-row:last-child{border-bottom:none;}
  .ctx-menu{position:absolute;right:0;top:28px;background:#161a1e;border:1px solid #2b3139;border-radius:12px;padding:6px;z-index:100;min-width:160px;box-shadow:0 8px 24px rgba(0,0,0,.6);}
  .ctx-item{display:flex;align-items:center;gap:8px;padding:9px 12px;border-radius:8px;cursor:pointer;font-size:13px;color:#848e9c;transition:all .15s;border:none;background:transparent;width:100%;font-family:inherit;text-align:left;}
  .ctx-item:hover{background:#2b3139;color:#eaecef;}
  .ctx-item.red{color:#f6465d;}
  .ctx-item.red:hover{background:rgba(246,70,93,.1);}
  .toggle{width:44px;height:24px;border-radius:12px;border:none;cursor:pointer;position:relative;transition:background .2s;flex-shrink:0;}
  .toggle-thumb{width:18px;height:18px;border-radius:50%;background:#fff;position:absolute;top:3px;transition:left .2s;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes slideUp{from{transform:translateY(100%)}to{transform:none}}
  .fade-up{animation:fadeUp .2s;}
  .spin{animation:spin .7s linear infinite;}
  .mob-bar{display:none;position:fixed;bottom:0;left:0;right:0;background:#161a1e;border-top:1px solid #1e2329;z-index:200;padding:6px 0 env(safe-area-inset-bottom,8px);}
  .toast-msg{position:fixed;top:16px;right:16px;z-index:9999;padding:11px 18px;border-radius:12px;font-weight:700;font-size:13px;display:flex;align-items:center;gap:8px;box-shadow:0 8px 32px rgba(0,0,0,.5);animation:fadeUp .3s;max-width:320px;}
  @media(max-width:1100px){.sq-right{display:none;}.sq-center{border:none;}}
  @media(max-width:768px){
    .sq-left{display:none;}
    .sq-body{display:block;}
    .sq-center{height:auto;min-height:calc(100vh - 56px - 64px);overflow-y:visible;border:none;}
    .mob-bar{display:flex;justify-content:space-around;align-items:center;}
    .sq{padding-bottom:64px;}
  }
`;

export default function Square() {
  const navigate  = useNavigate();
  const { user, token, logout } = useContext(UserContext);
  const myId = user?._id || 'guest';
  const textRef = useRef();

  const [section,     setSection]     = useState('Feed');
  const [posts,       setPosts]       = useState([]);
  const [myPosts,     setMyPosts]     = useState([]);
  const [newPost,     setNewPost]     = useState('');
  const [postType,    setPostType]    = useState('text');
  const [postTitle,   setPostTitle]   = useState('');
  const [activeTag,   setActiveTag]   = useState('All');
  const [followed,    setFollowed]    = useState([]);
  const [bookmarks,   setBookmarks]   = useState(() => { try { return JSON.parse(localStorage.getItem('sq_bm')||'[]'); } catch { return []; } });
  const [posting,     setPosting]     = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [searchQ,     setSearchQ]     = useState('');
  const [showSearch,  setShowSearch]  = useState(false);
  const [detailPost,  setDetailPost]  = useState(null);
  const [detailCmt,   setDetailCmt]   = useState('');
  const [sharePost,   setSharePost]   = useState(null);
  const [copied,      setCopied]      = useState(false);
  const [showSettings,setShowSettings]= useState(false);
  const [ctxMenu,     setCtxMenu]     = useState(null);
  const [darkMode,    setDarkMode]    = useState(true);
  const [soundOn,     setSoundOn]     = useState(true);
  const [notifOn,     setNotifOn]     = useState(true);
  const [muted,       setMuted]       = useState([]);
  const [blocked,     setBlocked]     = useState([]);
  const [toast,       setToast]       = useState(null);
  const [creatorStats,setCreatorStats]= useState(null);

  const showToast = (msg, type='ok') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  /* ── Fetch posts from backend ── */
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const tag = activeTag !== 'All' ? `?tag=${activeTag}` : '';
      const res = await axios.get(`${API}/api/posts${tag}`);
      setPosts(Array.isArray(res.data) ? res.data : []);
    } catch { setPosts([]); }
    finally { setLoading(false); }
  }, [activeTag]);

  const fetchMyPosts = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API}/api/my-posts`, { headers:{ Authorization:`Bearer ${token}` } });
      setMyPosts(Array.isArray(res.data) ? res.data : []);
    } catch {}
  }, [token]);

  const fetchCreatorStats = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API}/api/creator/stats`, { headers:{ Authorization:`Bearer ${token}` } });
      setCreatorStats(res.data);
    } catch {}
  }, [token]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);
  useEffect(() => { if (section === 'Profile') { fetchMyPosts(); fetchCreatorStats(); } }, [section, fetchMyPosts, fetchCreatorStats]);

  /* ── Like post ── */
  const likePost = async (id) => {
    if (!token) return showToast('Login required', 'err');
    try {
      await axios.post(`${API}/api/posts/${id}/like`, {}, { headers:{ Authorization:`Bearer ${token}` } });
      setPosts(p => p.map(post => {
        if (post._id !== id) return post;
        const liked = post.likes?.includes(myId);
        return { ...post, likes: liked ? post.likes.filter(x=>x!==myId) : [...(post.likes||[]), myId] };
      }));
      if (detailPost?._id === id) {
        setDetailPost(dp => {
          const liked = dp.likes?.includes(myId);
          return { ...dp, likes: liked ? dp.likes.filter(x=>x!==myId) : [...(dp.likes||[]), myId] };
        });
      }
    } catch {}
  };

  const bookmarkPost = (id) => {
    const next = bookmarks.includes(id) ? bookmarks.filter(x=>x!==id) : [...bookmarks, id];
    setBookmarks(next);
    try { localStorage.setItem('sq_bm', JSON.stringify(next)); } catch {}
    showToast(bookmarks.includes(id) ? 'Removed from bookmarks' : 'Bookmarked ✓');
  };

  const retweetPost = async (id) => {
    try {
      await axios.post(`${API}/api/posts/${id}/share`, {}, { headers:{ Authorization:`Bearer ${token}` } });
      setPosts(p => p.map(post => post._id===id ? {...post, shares:(post.shares||0)+1} : post));
      showToast('Shared +4 XP');
    } catch {}
  };

  /* ── Submit comment ── */
  const submitCmt = async (postId, text) => {
    if (!text?.trim() || !token) return;
    try {
      const res = await axios.post(`${API}/api/posts/${postId}/comment`, { text }, { headers:{ Authorization:`Bearer ${token}` } });
      const comment = res.data.comment;
      setPosts(p => p.map(post => post._id===postId ? {...post, comments:[...(post.comments||[]), comment]} : post));
      if (detailPost?._id === postId) setDetailPost(dp => ({...dp, comments:[...(dp.comments||[]), comment]}));
    } catch {}
  };

  /* ── Submit post ── */
  const submitPost = async () => {
    if (!newPost.trim() || !token) return showToast('Login required', 'err');
    if (newPost.length > 280) return showToast('Max 280 characters', 'err');
    setPosting(true);
    try {
      const res = await axios.post(`${API}/api/posts`, {
        content:    newPost.trim(),
        type:       postType,
        title:      postTitle,
        tag:        activeTag !== 'All' ? activeTag : 'All',
        visibility: 'public',
      }, { headers:{ Authorization:`Bearer ${token}` } });
      setPosts(p => [res.data.post, ...p]);
      setNewPost('');
      setPostTitle('');
      showToast('Posted! +5 XP');
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to post', 'err');
    } finally { setPosting(false); }
  };

  /* ── Delete post ── */
  const deletePost = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await axios.delete(`${API}/api/posts/${id}`, { headers:{ Authorization:`Bearer ${token}` } });
      setPosts(p => p.filter(x => x._id !== id));
      setMyPosts(p => p.filter(x => x._id !== id));
      if (detailPost?._id === id) setDetailPost(null);
      showToast('Post deleted');
    } catch { showToast('Failed to delete', 'err'); }
  };

  /* ── Share ── */
  const handleShare = (post, method) => {
    const text = post.content;
    const url  = window.location.href;
    if (method === 'copy')  { navigator.clipboard?.writeText(text).then(() => { setCopied(true); setTimeout(()=>setCopied(false),2000); }); }
    if (method === 'link')  { navigator.clipboard?.writeText(url).then(() => { setCopied(true); setTimeout(()=>setCopied(false),2000); }); }
    if (method === 'twitter') window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text.slice(0,200))}`,'_blank');
    if (method === 'whatsapp') window.open(`https://wa.me/?text=${encodeURIComponent(text.slice(0,200))}`,'_blank');
    retweetPost(post._id);
    setSharePost(null);
  };

  const HL = ({ text }) => (
    <span>
      {(text||'').split(/(\$\w+|@\w+|#\w+)/).map((pt, i) =>
        /^\$|^@|^#/.test(pt) ? <span key={i} style={{color:'#f0b90b',cursor:'pointer'}}>{pt}</span> : pt
      )}
    </span>
  );

  /* ── Context Menu ── */
  const CtxMenu = ({ post }) => (
    <div className="ctx-menu" onClick={e=>e.stopPropagation()}>
      <button className="ctx-item" onClick={() => { navigator.clipboard?.writeText(post.content); setCtxMenu(null); showToast('Copied'); }}><Copy size={14}/> Copy text</button>
      <button className="ctx-item" onClick={() => { setSharePost(post); setCtxMenu(null); }}><Share2 size={14}/> Share post</button>
      <button className="ctx-item" onClick={() => { setMuted(m=>m.includes(post.author)?m:[ ...m,post.author]); setCtxMenu(null); showToast('Muted'); }}><VolumeX size={14}/> Mute @{post.author}</button>
      {(String(post.userId)===String(myId) || user?.role==='admin') && (
        <button className="ctx-item red" onClick={() => { deletePost(post._id); setCtxMenu(null); }}><X size={14}/> Delete</button>
      )}
      <button className="ctx-item red" onClick={() => { setBlocked(b=>[...b,post.author]); setPosts(p=>p.filter(x=>x.author!==post.author)); setCtxMenu(null); showToast('Blocked'); }}><Ban size={14}/> Block</button>
    </div>
  );

  /* ── Post Card ── */
  const PostCard = ({ post }) => {
    const liked = post.likes?.includes(myId);
    const isBM  = bookmarks.includes(post._id);
    const [showCtx, setShowCtx] = useState(false);
    return (
      <div className="post-c fade-up" onClick={() => { setCtxMenu(null); setDetailPost(post); }}>
        <div style={{display:'flex',gap:10}}>
          <div className="av" style={{width:42,height:42,background:`hsl(${(post.author||'').charCodeAt(0)*40},50%,38%)`,fontSize:15,flexShrink:0}}>{(post.author||'U')[0]}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:'flex',alignItems:'center',gap:5,marginBottom:3,justifyContent:'space-between'}}>
              <div style={{display:'flex',alignItems:'center',gap:5,flexWrap:'wrap',minWidth:0}}>
                <span style={{fontWeight:700,fontSize:14,color:'#eaecef',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:120}}>{post.author}</span>
                {post.verified && <span style={{color:'#f0b90b',fontSize:11,flexShrink:0}}>✓</span>}
                <span style={{color:'#5e6673',fontSize:11,flexShrink:0}}>· {timeAgo(post.createdAt)}</span>
                {post.tag && post.tag !== 'All' && <span style={{fontSize:10,background:'rgba(240,185,11,.1)',color:'#f0b90b',padding:'1px 6px',borderRadius:8}}>{post.tag}</span>}
              </div>
              <div style={{position:'relative',flexShrink:0}} onClick={e=>e.stopPropagation()}>
                <button className="pb" style={{padding:'3px 6px'}} onClick={() => { setShowCtx(v=>!v); setCtxMenu(showCtx?null:post._id); }}><MoreHorizontal size={15}/></button>
                {ctxMenu===post._id && <CtxMenu post={post}/>}
              </div>
            </div>
            {post.title && <p style={{fontWeight:700,fontSize:14,color:'#eaecef',marginBottom:4}}>{post.title}</p>}
            <p style={{fontSize:13,color:'#c6cad2',lineHeight:1.65,marginBottom:10,wordBreak:'break-word'}}>
              <HL text={post.content}/>
            </p>
            <div style={{display:'flex',gap:0,alignItems:'center',flexWrap:'wrap'}} onClick={e=>e.stopPropagation()}>
              <button className={`pb${liked?' lk':''}`} onClick={() => likePost(post._id)}>
                <Heart size={14} style={liked?{fill:'#f6465d',color:'#f6465d'}:{}}/> {fmtN(post.likes?.length)}
              </button>
              <button className="pb" onClick={() => { setDetailPost(post); setDetailCmt(''); }}>
                <MessageSquare size={14}/> {fmtN(post.comments?.length)}
              </button>
              <button className="pb rt" onClick={() => retweetPost(post._id)}>
                <Repeat2 size={14}/> {fmtN(post.shares)}
              </button>
              <button className={`pb${isBM?' bm':''}`} onClick={() => bookmarkPost(post._id)}>
                <Bookmark size={14} style={isBM?{fill:'#f0b90b',color:'#f0b90b'}:{}}/>
              </button>
              <button className="pb" onClick={() => setSharePost(post)}><Share2 size={14}/></button>
              <span style={{marginLeft:'auto',fontSize:11,color:'#5e6673',display:'flex',alignItems:'center',gap:3}}><Eye size={11}/> {fmtN(post.views)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ── Post Detail ── */
  const PostDetail = ({ post }) => (
    <div style={{position:'fixed',inset:0,background:'#0b0e11',zIndex:300,display:'flex',flexDirection:'column',overflowY:'auto'}}>
      <div style={{position:'sticky',top:0,background:'rgba(11,14,17,.97)',backdropFilter:'blur(8px)',borderBottom:'1px solid #1e2329',padding:'12px 16px',display:'flex',alignItems:'center',gap:12,zIndex:10}}>
        <button onClick={() => setDetailPost(null)} style={{background:'none',border:'none',color:'#eaecef',cursor:'pointer',display:'flex'}}><ArrowLeft size={20}/></button>
        <span style={{fontWeight:700,fontSize:16}}>Post</span>
      </div>
      <div style={{padding:16,borderBottom:'1px solid #1e2329'}}>
        <div style={{display:'flex',gap:12,marginBottom:12}}>
          <div className="av" style={{width:46,height:46,background:`hsl(${(post.author||'').charCodeAt(0)*40},50%,38%)`,fontSize:17,flexShrink:0}}>{(post.author||'U')[0]}</div>
          <div>
            <p style={{fontWeight:700,fontSize:15,color:'#eaecef'}}>{post.author} {post.verified && <span style={{color:'#f0b90b'}}>✓</span>}</p>
            <p style={{color:'#848e9c',fontSize:12}}>{post.handle} · {timeAgo(post.createdAt)}</p>
          </div>
        </div>
        {post.title && <p style={{fontWeight:700,fontSize:16,color:'#eaecef',marginBottom:8}}>{post.title}</p>}
        <p style={{fontSize:15,color:'#c6cad2',lineHeight:1.75,marginBottom:14,wordBreak:'break-word'}}><HL text={post.content}/></p>
        <div style={{display:'flex',gap:4,paddingTop:12,borderTop:'1px solid #1e2329',flexWrap:'wrap'}}>
          <button className={`pb${post.likes?.includes(myId)?' lk':''}`} onClick={() => likePost(post._id)}>
            <Heart size={16} style={post.likes?.includes(myId)?{fill:'#f6465d',color:'#f6465d'}:{}}/> {fmtN(post.likes?.length)}
          </button>
          <button className="pb"><MessageSquare size={16}/> {fmtN(post.comments?.length)}</button>
          <button className="pb rt" onClick={() => retweetPost(post._id)}><Repeat2 size={16}/> {fmtN(post.shares)}</button>
          <button className={`pb${bookmarks.includes(post._id)?' bm':''}`} onClick={() => bookmarkPost(post._id)}>
            <Bookmark size={16} style={bookmarks.includes(post._id)?{fill:'#f0b90b',color:'#f0b90b'}:{}}/>
          </button>
          <button className="pb" onClick={() => setSharePost(post)}><Share2 size={16}/></button>
          <span style={{marginLeft:'auto',fontSize:11,color:'#5e6673',display:'flex',alignItems:'center',gap:4}}><Eye size={12}/>{fmtN(post.views)}</span>
        </div>
      </div>
      <div style={{flex:1}}>
        {(post.comments||[]).map((c,i) => (
          <div key={i} style={{display:'flex',gap:10,padding:'13px 16px',borderBottom:'1px solid #1e232940'}}>
            <div className="av" style={{width:34,height:34,background:'#2b3139',fontSize:13,flexShrink:0}}>{(c.author||'U')[0]}</div>
            <div>
              <span style={{fontWeight:700,fontSize:13,color:'#eaecef'}}>{c.author}</span>
              <span style={{color:'#5e6673',fontSize:11,marginLeft:6}}>· {c.time||'just now'}</span>
              <p style={{color:'#c6cad2',fontSize:13,marginTop:3,lineHeight:1.5,wordBreak:'break-word'}}>{c.text}</p>
            </div>
          </div>
        ))}
        {!post.comments?.length && <p style={{textAlign:'center',padding:40,color:'#5e6673',fontSize:13}}>No comments yet</p>}
      </div>
      <div style={{position:'sticky',bottom:0,background:'rgba(11,14,17,.98)',borderTop:'1px solid #1e2329',padding:'10px 16px',display:'flex',gap:10,alignItems:'center'}}>
        <div className="av" style={{width:34,height:34,background:'#2b3139',fontSize:13,flexShrink:0}}>{user?.name?.[0]||'U'}</div>
        <div style={{flex:1,display:'flex',alignItems:'center',background:'#161a1e',border:'1px solid #2b3139',borderRadius:24,padding:'7px 13px',gap:8}}>
          <input className="ci" value={detailCmt} onChange={e=>setDetailCmt(e.target.value)} placeholder="Add a comment..."
            onKeyDown={e=>{ if(e.key==='Enter'){ submitCmt(post._id,detailCmt); setDetailCmt(''); }}}/>
          <button onClick={() => { submitCmt(post._id,detailCmt); setDetailCmt(''); }}
            style={{background:detailCmt.trim()?'#f0b90b':'#2b3139',border:'none',borderRadius:'50%',width:28,height:28,cursor:detailCmt.trim()?'pointer':'default',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'background .15s'}}>
            <Send size={13} style={{color:detailCmt.trim()?'#0b0e11':'#5e6673'}}/>
          </button>
        </div>
      </div>
    </div>
  );

  /* ── Share Modal ── */
  const ShareModal = ({ post }) => (
    <div className="share-modal" onClick={() => setSharePost(null)}>
      <div className="share-box" onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <h3 style={{fontWeight:700,fontSize:15}}>Share Post</h3>
          <button onClick={() => setSharePost(null)} style={{background:'none',border:'none',color:'#848e9c',cursor:'pointer'}}><X size={18}/></button>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
          {[
            { icon:<Copy size={18}/>,          label:copied?'Copied!':'Copy text', action:'copy',    color:'#627eea' },
            { icon:<Link2 size={18}/>,          label:'Copy link',                 action:'link',    color:'#0ecb81' },
            { icon:<Twitter size={18}/>,        label:'Twitter/X',                 action:'twitter', color:'#1da1f2' },
            { icon:<MessageSquare size={18}/>,  label:'WhatsApp',                  action:'whatsapp',color:'#25d366' },
          ].map(s => (
            <button key={s.action} onClick={() => handleShare(post, s.action)}
              style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',background:'#0b0e11',border:'1px solid #2b3139',borderRadius:12,cursor:'pointer',color:'#eaecef',fontFamily:'inherit',fontSize:13,fontWeight:600}}
              onMouseEnter={e=>e.currentTarget.style.borderColor=s.color}
              onMouseLeave={e=>e.currentTarget.style.borderColor='#2b3139'}>
              <span style={{color:s.color}}>{s.icon}</span>{s.label}
            </button>
          ))}
        </div>
        <div style={{background:'#0b0e11',borderRadius:10,padding:'10px 14px',fontSize:12,color:'#848e9c',border:'1px solid #1e2329',lineHeight:1.6,wordBreak:'break-word'}}>
          {post.content?.slice(0,100)}{post.content?.length>100?'...':''}
        </div>
      </div>
    </div>
  );

  /* ── Settings ── */
  const Toggle = ({ on, onToggle }) => (
    <button className="toggle" onClick={onToggle} style={{background:on?'#f0b90b':'#2b3139'}}>
      <div className="toggle-thumb" style={{left:on?'23px':'3px'}}/>
    </button>
  );

  const SettingsPanel = () => (
    <div className="settings-panel" onClick={() => setShowSettings(false)}>
      <div className="settings-box" onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',alignItems:'center',gap:12,padding:'18px 20px',borderBottom:'1px solid #1e2329'}}>
          <button onClick={() => setShowSettings(false)} style={{background:'none',border:'none',color:'#848e9c',cursor:'pointer',display:'flex'}}><X size={18}/></button>
          <h2 style={{fontWeight:700,fontSize:16}}>Settings</h2>
        </div>
        <div style={{padding:'10px 20px 6px',fontSize:11,color:'#5e6673',fontWeight:700,textTransform:'uppercase',letterSpacing:'.05em'}}>Account</div>
        <div className="settings-row" onClick={() => navigate('/profile')}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div className="av" style={{width:36,height:36,background:'#f0b90b',color:'#0b0e11',fontSize:13}}>{user?.name?.[0]||'U'}</div>
            <div>
              <p style={{fontWeight:600,fontSize:13,color:'#eaecef'}}>{user?.name||'Guest'}</p>
              <p style={{fontSize:11,color:'#848e9c'}}>{user?.email||'—'}</p>
            </div>
          </div>
          <ChevronRight size={15} style={{color:'#5e6673'}}/>
        </div>
        <div style={{padding:'10px 20px 6px',fontSize:11,color:'#5e6673',fontWeight:700,textTransform:'uppercase',letterSpacing:'.05em'}}>Preferences</div>
        <div className="settings-row">
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            {darkMode?<Moon size={16} style={{color:'#f0b90b'}}/>:<Sun size={16} style={{color:'#f0b90b'}}/>}
            <span style={{fontSize:13,color:'#eaecef'}}>Dark Mode</span>
          </div>
          <Toggle on={darkMode} onToggle={() => setDarkMode(v=>!v)}/>
        </div>
        <div className="settings-row">
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            {soundOn?<Volume2 size={16} style={{color:'#848e9c'}}/>:<VolumeX size={16} style={{color:'#848e9c'}}/>}
            <span style={{fontSize:13,color:'#eaecef'}}>Sound Effects</span>
          </div>
          <Toggle on={soundOn} onToggle={() => setSoundOn(v=>!v)}/>
        </div>
        <div className="settings-row">
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <Bell size={16} style={{color:'#848e9c'}}/>
            <span style={{fontSize:13,color:'#eaecef'}}>Notifications</span>
          </div>
          <Toggle on={notifOn} onToggle={() => setNotifOn(v=>!v)}/>
        </div>
        <div style={{padding:'10px 20px 6px',fontSize:11,color:'#5e6673',fontWeight:700,textTransform:'uppercase',letterSpacing:'.05em'}}>Privacy</div>
        <div className="settings-row" onClick={() => { setShowSettings(false); showToast(`Muted: ${muted.join(', ')||'None'}`); }}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <VolumeX size={16} style={{color:'#848e9c'}}/><span style={{fontSize:13,color:'#eaecef'}}>Muted Accounts</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            <span style={{fontSize:12,color:'#848e9c'}}>{muted.length}</span>
            <ChevronRight size={15} style={{color:'#5e6673'}}/>
          </div>
        </div>
        <div className="settings-row" onClick={() => { setBlocked([]); showToast('Block list cleared'); }}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <Ban size={16} style={{color:'#848e9c'}}/><span style={{fontSize:13,color:'#eaecef'}}>Blocked Accounts ({blocked.length})</span>
          </div>
          <ChevronRight size={15} style={{color:'#5e6673'}}/>
        </div>
        <div style={{padding:'10px 20px 6px',fontSize:11,color:'#5e6673',fontWeight:700,textTransform:'uppercase',letterSpacing:'.05em'}}>Creator</div>
        <div className="settings-row" onClick={() => { setShowSettings(false); navigate('/creator-center'); }}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <Edit3 size={16} style={{color:'#f0b90b'}}/><span style={{fontSize:13,color:'#eaecef'}}>Creator Center</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            {creatorStats && <span style={{fontSize:11,color:'#f0b90b',fontWeight:700}}>{creatorStats.xp} XP</span>}
            <ChevronRight size={15} style={{color:'#5e6673'}}/>
          </div>
        </div>
        <div className="settings-row" style={{borderTop:'1px solid #1e2329',marginTop:4}} onClick={() => { logout?.(); navigate('/login'); }}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <LogOut size={16} style={{color:'#f6465d'}}/><span style={{fontSize:13,color:'#f6465d',fontWeight:600}}>Sign Out</span>
          </div>
        </div>
      </div>
    </div>
  );

  /* ── Right Panel ── */
  const RightPanel = () => (
    <div>
      <div className="sq-sr" style={{marginBottom:14}}>
        <Search size={14} style={{color:'#5e6673',flexShrink:0}}/>
        <input placeholder="Search Square..." value={searchQ} onChange={e=>setSearchQ(e.target.value)}/>
        {searchQ && <button onClick={() => setSearchQ('')} style={{background:'none',border:'none',color:'#848e9c',cursor:'pointer',padding:0}}><X size={13}/></button>}
      </div>
      <div style={{background:'#161a1e',borderRadius:14,padding:14,marginBottom:14,border:'1px solid #1e2329'}}>
        <h3 style={{fontWeight:700,fontSize:14,color:'#eaecef',marginBottom:12}}>🔥 Trending</h3>
        {TRENDING.map((t,i) => (
          <div key={i} style={{padding:'7px 0',borderBottom:i<TRENDING.length-1?'1px solid #1e232440':'none',cursor:'pointer'}} onClick={() => setSearchQ(t.tag)}>
            <div style={{display:'flex',gap:7}}>
              <Hash size={11} style={{color:'#f0b90b',marginTop:2,flexShrink:0}}/>
              <div>
                <p style={{fontWeight:700,fontSize:12,color:'#eaecef',marginBottom:1,wordBreak:'break-all'}}>{t.tag}</p>
                <p style={{fontSize:10,color:'#5e6673'}}>{t.cnt}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{background:'#161a1e',borderRadius:14,padding:14,border:'1px solid #1e2329'}}>
        <h3 style={{fontWeight:700,fontSize:14,color:'#eaecef',marginBottom:12}}>Suggested</h3>
        {SUGGESTED.map((c,i) => (
          <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:i<SUGGESTED.length-1?'1px solid #1e232440':'none'}}>
            <div className="av" style={{width:36,height:36,background:`hsl(${i*80+30},50%,38%)`,fontSize:13}}>{c.name[0]}</div>
            <div style={{flex:1,minWidth:0}}>
              <p style={{fontWeight:700,fontSize:12,color:'#eaecef'}}>{c.name} {c.verified&&<span style={{color:'#f0b90b'}}>✓</span>}</p>
              <p style={{fontSize:11,color:'#848e9c'}}>{c.handle}</p>
            </div>
            <button className={`fb${followed.includes(c.handle)?' on':''}`}
              onClick={() => setFollowed(f=>f.includes(c.handle)?f.filter(h=>h!==c.handle):[...f,c.handle])}>
              {followed.includes(c.handle)?'Following':'Follow'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  /* ── Feed ── */
  const filtered = posts.filter(p => {
    if (blocked.includes(p.author)) return false;
    if (muted.includes(p.author)) return false;
    if (section === 'Bookmarks') return bookmarks.includes(p._id);
    if (searchQ) return p.content?.toLowerCase().includes(searchQ.toLowerCase()) || p.author?.toLowerCase().includes(searchQ.toLowerCase());
    return true;
  });

  const FeedSection = () => (
    <>
      {/* Compose */}
      <div style={{padding:'14px 16px',borderBottom:'1px solid #1e2329'}}>
        {/* Post type selector */}
        <div style={{display:'flex',gap:6,marginBottom:10,overflowX:'auto',scrollbarWidth:'none'}}>
          {[
            {k:'text',l:'💬 Text'},{k:'article',l:'📄 Article'},
            {k:'thread',l:'🧵 Thread'},{k:'poll',l:'📊 Poll'},
          ].map(t => (
            <button key={t.k} onClick={e=>{e.stopPropagation();setPostType(t.k);}}
              style={{padding:'4px 12px',border:`1px solid ${postType===t.k?'#f0b90b':'#2b3139'}`,borderRadius:20,background:postType===t.k?'rgba(240,185,11,.1)':'transparent',color:postType===t.k?'#f0b90b':'#848e9c',fontSize:12,cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap',flexShrink:0}}>
              {t.l}
            </button>
          ))}
        </div>
        {(postType==='article'||postType==='thread') && (
          <input value={postTitle} onChange={e=>setPostTitle(e.target.value)} placeholder="Title (optional)"
            style={{width:'100%',background:'transparent',border:'none',borderBottom:'1px solid #2b3139',outline:'none',color:'#eaecef',fontSize:14,fontFamily:'inherit',padding:'6px 0',marginBottom:8}}/>
        )}
        <div style={{display:'flex',gap:10}}>
          <div className="av" style={{width:40,height:40,background:'#f0b90b',color:'#0b0e11',fontSize:14,flexShrink:0}}>{user?.name?.[0]||'U'}</div>
          <div style={{flex:1}}>
            <textarea className="sq-ta" placeholder="What's happening in crypto?" value={newPost}
              onChange={e=>setNewPost(e.target.value)} ref={textRef} rows={3}
              onKeyDown={e=>{ if(e.key==='Enter'&&e.ctrlKey) submitPost(); }}/>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:8}}>
              <div style={{display:'flex',gap:12,color:'#f0b90b'}}>
                <Hash size={16} style={{cursor:'pointer'}} onClick={() => setNewPost(p=>p+' #')}/>
                <TrendingUp size={16} style={{cursor:'pointer'}}/>
                <span style={{fontSize:12,color:newPost.length>260?'#f6465d':'#5e6673'}}>{newPost.length}/280</span>
              </div>
              <button onClick={submitPost} disabled={!newPost.trim()||posting||newPost.length>280}
                style={{padding:'7px 18px',background:newPost.trim()&&!posting&&newPost.length<=280?'#f0b90b':'#2b3139',border:'none',borderRadius:20,color:newPost.trim()&&!posting?'#0b0e11':'#5e6673',fontWeight:700,fontSize:12,cursor:newPost.trim()?'pointer':'not-allowed',display:'flex',alignItems:'center',gap:6,fontFamily:'inherit',transition:'all .15s'}}>
                {posting && <Loader2 size={13} className="spin"/>} Post
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Tag filter */}
      <div style={{display:'flex',gap:6,padding:'10px 16px',borderBottom:'1px solid #1e2329',overflowX:'auto',scrollbarWidth:'none'}}>
        {TAGS.map(t => <button key={t} className={`tc${activeTag===t?' on':''}`} onClick={() => setActiveTag(t)}>{t}</button>)}
      </div>
      {/* Refresh button */}
      <div style={{display:'flex',justifyContent:'flex-end',padding:'8px 16px 0'}}>
        <button onClick={fetchPosts} style={{background:'none',border:'none',color:'#848e9c',cursor:'pointer',display:'flex',alignItems:'center',gap:4,fontSize:12,fontFamily:'inherit'}}>
          <RefreshCw size={13}/> Refresh
        </button>
      </div>
      {loading ? (
        <div style={{textAlign:'center',padding:60,color:'#5e6673'}}>
          <Loader2 size={28} className="spin" style={{margin:'0 auto 12px',display:'block',color:'#f0b90b'}}/>
          <p style={{fontSize:13}}>Loading posts...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{textAlign:'center',padding:60,color:'#5e6673'}}>
          <FileText size={36} style={{opacity:.12,margin:'0 auto 12px',display:'block'}}/>
          <p style={{fontSize:13}}>No posts yet. Be the first!</p>
        </div>
      ) : filtered.map(post => <PostCard key={post._id} post={post}/>)}
    </>
  );

  const ProfileSection = () => (
    <div style={{padding:16}}>
      <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:18,flexWrap:'wrap'}}>
        <div className="av" style={{width:64,height:64,background:'#f0b90b',color:'#0b0e11',fontSize:24}}>{user?.name?.[0]||'U'}</div>
        <div style={{flex:1,minWidth:0}}>
          <h2 style={{fontSize:18,fontWeight:700,color:'#eaecef',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.name||'Guest'}</h2>
          <p style={{color:'#848e9c',fontSize:13}}>@{user?.email?.split('@')[0]||'user'}</p>
          {creatorStats && (
            <div style={{display:'flex',gap:16,marginTop:6,fontSize:12,color:'#848e9c',flexWrap:'wrap'}}>
              <span><span style={{color:'#eaecef',fontWeight:700}}>{creatorStats.followers}</span> Followers</span>
              <span><span style={{color:'#eaecef',fontWeight:700}}>{creatorStats.posts}</span> Posts</span>
              <span><span style={{color:'#f0b90b',fontWeight:700}}>{creatorStats.xp} XP</span> · {creatorStats.level}</span>
            </div>
          )}
        </div>
        <button onClick={() => navigate('/profile')} style={{padding:'7px 16px',border:'1px solid #2b3139',borderRadius:20,background:'transparent',color:'#eaecef',fontSize:12,cursor:'pointer',fontFamily:'inherit',flexShrink:0}}>Edit Profile</button>
      </div>
      {myPosts.length === 0 ? (
        <div style={{textAlign:'center',padding:40,color:'#5e6673'}}>
          <FileText size={36} style={{opacity:.12,margin:'0 auto 12px',display:'block'}}/>
          <p style={{fontSize:13}}>No posts yet</p>
          <button onClick={() => setSection('Feed')} style={{marginTop:12,padding:'8px 22px',background:'#f0b90b',border:'none',borderRadius:20,color:'#0b0e11',fontWeight:700,fontSize:13,cursor:'pointer',fontFamily:'inherit'}}>Start Posting</button>
        </div>
      ) : myPosts.map(post => <PostCard key={post._id} post={post}/>)}
    </div>
  );

  const BookmarksSection = () => (
    <>
      <div style={{padding:'14px 16px',borderBottom:'1px solid #1e2329',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <h2 style={{fontSize:17,fontWeight:700}}>Bookmarks</h2>
        {bookmarks.length > 0 && (
          <button onClick={() => { setBookmarks([]); localStorage.removeItem('sq_bm'); }}
            style={{padding:'5px 12px',border:'1px solid #f6465d',borderRadius:20,background:'transparent',color:'#f6465d',fontSize:11,cursor:'pointer',fontFamily:'inherit'}}>
            Clear All
          </button>
        )}
      </div>
      {filtered.length === 0
        ? <div style={{textAlign:'center',padding:60,color:'#5e6673'}}>
            <Bookmark size={36} style={{opacity:.12,margin:'0 auto 12px',display:'block'}}/>
            <p style={{fontSize:13}}>No bookmarks yet</p>
          </div>
        : posts.filter(p=>bookmarks.includes(p._id)).map(p => <PostCard key={p._id} post={p}/>)
      }
    </>
  );

  const navItems = [
    { icon:<Home size={20}/>,       label:'Feed',          key:'Feed' },
    { icon:<Bell size={20}/>,       label:'Notifications', key:'Notification', badge:0 },
    { icon:<Users size={20}/>,      label:'Profile',       key:'Profile' },
    { icon:<Bookmark size={20}/>,   label:'Bookmarks',     key:'Bookmarks', badge:bookmarks.length||0 },
    { icon:<TrendingUp size={20}/>, label:'Trending',      key:'Trending' },
    { icon:<Settings size={20}/>,   label:'Settings',      key:'Settings', action:() => setShowSettings(true) },
  ];

  return (
    <>
      <style>{css}</style>
      {detailPost  && <PostDetail post={detailPost}/>}
      {sharePost   && <ShareModal post={sharePost}/>}
      {showSettings && <SettingsPanel/>}
      {toast && (
        <div className={`toast-msg`} style={{background:toast.type==='err'?'#f6465d':'#0ecb81',color:'#fff'}}>
          {toast.type==='err'?'✕':'✓'} {toast.msg}
        </div>
      )}

      <div className="sq" onClick={() => setCtxMenu(null)}>
        <div className="sq-body">
          {/* LEFT */}
          <div className="sq-left">
            <div style={{fontSize:13,fontWeight:800,color:'#f0b90b',padding:'2px 14px 14px',letterSpacing:1}}>VINANCE SQUARE</div>
            {navItems.map(item => (
              <button key={item.key} className={`sq-ni${section===item.key?' on':''}`}
                onClick={() => item.action ? item.action() : setSection(item.key)}>
                <div style={{position:'relative'}}>
                  {item.icon}
                  {(item.badge||0) > 0 && (
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
                  <p style={{fontSize:10,color:'#5e6673'}}>{creatorStats?.xp||0} XP · {creatorStats?.level||'Explorer'}</p>
                </div>
                <button onClick={() => navigate('/dashboard')} style={{background:'none',border:'none',color:'#848e9c',cursor:'pointer'}} title="Dashboard"><ArrowLeft size={15}/></button>
              </div>
            </div>
          </div>

          {/* CENTER */}
          <div className="sq-center">
            <div style={{position:'sticky',top:0,background:'rgba(11,14,17,.97)',backdropFilter:'blur(8px)',borderBottom:'1px solid #1e2329',padding:'11px 16px',zIndex:50,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <button onClick={() => navigate('/dashboard')} style={{background:'none',border:'none',color:'#848e9c',cursor:'pointer',display:'flex',padding:'2px'}}>
                  <ChevronLeft size={20}/>
                </button>
                <h2 style={{fontSize:16,fontWeight:700}}>{section==='Feed'?'Square':section}</h2>
              </div>
              <div style={{display:'flex',gap:6,alignItems:'center'}}>
                {showSearch ? (
                  <div className="sq-sr" style={{padding:'5px 12px'}}>
                    <Search size={12} style={{color:'#5e6673',flexShrink:0}}/>
                    <input placeholder="Search..." value={searchQ} onChange={e=>setSearchQ(e.target.value)} style={{width:120}} autoFocus/>
                    <button onClick={() => { setShowSearch(false); setSearchQ(''); }} style={{background:'none',border:'none',color:'#848e9c',cursor:'pointer',padding:0}}><X size={12}/></button>
                  </div>
                ) : (
                  <button onClick={() => setShowSearch(true)} style={{background:'none',border:'none',color:'#848e9c',cursor:'pointer',display:'flex',padding:4}}><Search size={18}/></button>
                )}
                <button onClick={() => setShowSettings(true)} style={{background:'none',border:'none',color:'#848e9c',cursor:'pointer',display:'flex',padding:4}}><Settings size={18}/></button>
                {section==='Feed' && (
                  <button onClick={() => textRef.current?.focus()} style={{background:'none',border:'none',color:'#848e9c',cursor:'pointer',display:'flex',padding:4}}><Edit3 size={18}/></button>
                )}
              </div>
            </div>

            {section==='Feed'         && <FeedSection/>}
            {section==='Profile'      && <ProfileSection/>}
            {section==='Bookmarks'    && <BookmarksSection/>}
            {!['Feed','Profile','Bookmarks'].includes(section) && (
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:80,color:'#5e6673'}}>
                <Compass size={44} style={{opacity:.12,marginBottom:14}}/>
                <p style={{fontSize:13}}>{section} — Coming Soon</p>
                <button onClick={() => setSection('Feed')} style={{marginTop:14,padding:'8px 20px',background:'#f0b90b',border:'none',borderRadius:20,color:'#0b0e11',fontWeight:700,fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>
                  Back to Feed
                </button>
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="sq-right"><RightPanel/></div>
        </div>

        {/* MOBILE BOTTOM NAV */}
        <nav className="mob-bar">
          {[
            { icon:<Home size={22}/>,     key:'Feed' },
            { icon:<Search size={22}/>,   key:'_s', action:() => setShowSearch(v=>!v) },
            { icon:<Bookmark size={22}/>, key:'Bookmarks', badge:bookmarks.length },
            { icon:<Users size={22}/>,    key:'Profile' },
            { icon:<Settings size={22}/>, key:'_set', action:() => setShowSettings(true) },
          ].map(item => (
            <button key={item.key}
              onClick={() => item.action ? item.action() : setSection(item.key)}
              style={{background:'none',border:'none',padding:'6px 12px',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:2,position:'relative',color:section===item.key&&!item.action?'#f0b90b':'#848e9c',transition:'color .15s'}}>
              {item.icon}
              {(item.badge||0) > 0 && (
                <span style={{position:'absolute',top:2,right:6,width:14,height:14,background:'#f6465d',borderRadius:'50%',fontSize:8,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',border:'2px solid #161a1e',color:'#fff'}}>{item.badge}</span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
