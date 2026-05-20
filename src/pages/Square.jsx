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
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  .sq{font-family:'Inter',sans-serif;background:#0b0e11;color:#eaecef;min-height:100vh;display:flex;}
  .sq-sidebar{width:260px;flex-shrink:0;border-right:1px solid #1e2329;padding:16px 12px;height:100vh;position:sticky;top:0;overflow-y:auto;scrollbar-width:none;display:flex;flex-direction:column;gap:2px;}
  .sq-sidebar::-webkit-scrollbar{display:none;}
  .sq-main{flex:1;min-width:0;border-right:1px solid #1e2329;overflow-y:auto;height:100vh;}
  .sq-right{width:320px;flex-shrink:0;padding:20px 14px;height:100vh;position:sticky;top:0;overflow-y:auto;scrollbar-width:none;}
  .sq-right::-webkit-scrollbar{display:none;}
  .sq-nav-item{display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:10px;cursor:pointer;transition:all .15s;color:#848e9c;font-weight:500;font-size:14px;border:none;background:transparent;width:100%;text-align:left;font-family:inherit;}
  .sq-nav-item:hover,.sq-nav-item.on{background:#161a1e;color:#eaecef;}
  .sq-nav-item.on{font-weight:700;color:#f0b90b;}
  .post-card{border-bottom:1px solid #1e2329;padding:16px 18px;transition:background .15s;}
  .post-card:hover{background:#0d1117;}
  .avatar{border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0;overflow:hidden;background:#2b3139;}
  .post-btn{display:flex;align-items:center;gap:5px;padding:6px 10px;border-radius:20px;border:none;background:transparent;color:#848e9c;font-size:13px;cursor:pointer;transition:all .15s;font-family:inherit;}
  .post-btn:hover{color:#eaecef;background:#161a1e;}
  .post-btn.liked{color:#f6465d;}
  .post-btn.bookmarked{color:#f0b90b;}
  .post-btn.retweeted{color:#0ecb81;}
  .tag-chip{padding:5px 14px;border-radius:20px;border:1px solid #2b3139;background:transparent;color:#848e9c;font-size:12px;cursor:pointer;white-space:nowrap;transition:all .15s;font-family:inherit;}
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
  .notif-item{display:flex;gap:12px;padding:14px 18px;border-bottom:1px solid #1e2329;cursor:pointer;transition:background .15s;}
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
    .sq-main{border:none;height:auto;min-height:100vh;}
    .sq{display:block;}
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

const fmtNum = n => n >= 1000 ? ${(n / 1000).toFixed(1)}K : n;
const fmtTime = ts => {
  const d = new Date(ts);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return ${Math.floor(diff / 60)}m;
  if (diff < 86400) return ${Math.floor(diff / 3600)}h;
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
      return { ...post, likes: liked ? post.likes.filter(x => x !== myId) : [...post.likes, myId] };
    }));
  };

  const bookmarkPost = (id) => {
    setBookmarked(b => b.includes(id) ? b.filter(x => x !== id) : [...b, id]);
  };

  const retweetPost = (id) => {
    setPosts(p => p.map(post =>
      post._id === id ? { ...post, shares: post.shares + 1 } : post
    ));
  };

  const toggleComments = (id) => {
    setOpenComments(o => ({ ...o, [id]: !o[id] }));
  };

  const submitComment = (postId) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    const comment = {
      id: Date.now(),
      author: user?.name || 'You',
      handle: '@' + (user?.email?.split('@')[0] || 'user'),
      text,
      time: 'just now',
    };
    setPosts(p => p.map(post =>
      post._id === postId ? { ...post, comments: [...post.comments, comment] } : post
    ));
    setCommentInputs(o => ({ ...o, [postId]: '' }));
  };

  const submitPost = async () => {
    if (!newPost.trim()) return;
    setPosting(true);
    await new Promise(r => setTimeout(r, 600));
    const np = {
      _id: String(Date.now()),
      author: user?.name || 'You',
      handle: '@' + (user?.email?.split('@')[0] || 'user'),
      verified: false,
      createdAt: new Date(),
      content: newPost,
      likes: [], comments: [], shares: 0, views: 0, bookmarks: [],
      tag: 'All',
    };
    setPosts(p => [np, ...p]);
    setNewPost('');
    setPosting(false);
  };

  const filteredPosts = posts.filter(p => {
    const matchTag = activeTag === 'All' || p.tag === activeTag;
    const matchSearch = !searchQ || p.content.toLowerCase().includes(searchQ.toLowerCase()) || p.author.toLowerCase().includes(searchQ.toLowerCase());
    if (section === 'Bookmarks') return bookmarked.includes(p._id);
    return matchTag && matchSearch;
  });

  const PostCard = ({ post }) => {
    const liked = post.likes.includes(myId);
    const isBookmarked = bookmarked.includes(post._id);
    const showCmts = openComments[post._id];

    return (
      <div className="post-card" style={{ animation: 'fadeIn .3s' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="avatar" style={{ width: 44, height: 44, background: hsl(${post._id.charCodeAt(0) * 40},55%,40%), fontSize: 16, flexShrink: 0 }}>
            {post.author[0]}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: '#eaecef' }}>{post.author}</span>
              {post.verified && <span style={{ color: '#f0b90b', fontSize: 12 }}>✓</span>}
              <span style={{ color: '#5e6673', fontSize: 12 }}>· {fmtTime(post.createdAt)}</span>
            </div>
            <p style={{ fontSize: 14, color: '#c6cad2', lineHeight: 1.6, marginBottom: 12 }}>
              {post.content.split(/(\$\w+|@\w+|#\w+)/).map((part, i) =>
                /^\$|^@|^#/.test(part)
                  ? <span key={i} style={{ color: '#f0b90b', cursor: 'pointer' }}>{part}</span>
                  : part
              )}
            </p>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <button className={post-btn${liked ? ' liked' : ''}} onClick={() => likePost(post._id)}>
                <Heart size={15} style={liked ? { fill: '#f6465d', color: '#f6465d' } : {}} />
                <span>{fmtNum(post.likes.length)}</span>
              </button>
              <button className="post-btn" onClick={() => toggleComments(post._id)}>
                <MessageSquare size={15} />
                <span>{fmtNum(post.comments.length)}</span>
              </button>
              <button className="post-btn retweeted" onClick={() => retweetPost(post._id)}>
                <Repeat2 size={15} />
                <span>{fmtNum(post.shares)}</span>
              </button>
              <button className={post-btn${isBookmarked ? ' bookmarked' : ''}} onClick={() => bookmarkPost(post._id)}>
                <Bookmark size={15} style={isBookmarked ? { fill: '#f0b90b', color: '#f0b90b' } : {}} />
              </button>
              <button className="post-btn" onClick={() => {
                navigator.clipboard?.writeText(post.content);
              }}>
                <Share2 size={15} />
              </button>
              <span style={{ marginLeft: 'auto', fontSize: 12, color: '#5e6673', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Eye size={12} /> {fmtNum(post.views + post.likes.length)}
              </span>
            </div>

            {/* Comments section */}
            {showCmts && (
              <div className="comment-box" style={{ animation: 'fadeIn .2s' }}>
                {post.comments.map((c, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                    <div className="avatar" style={{ width: 28, height: 28, fontSize: 11, background: '#2b3139', flexShrink: 0 }}>
                      {c.author[0]}
                    </div>
                    <div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#eaecef' }}>{c.author} </span>
                      <span style={{ fontSize: 11, color: '#5e6673' }}>· {c.time}</span>
                      <p style={{ fontSize: 13, color: '#c6cad2', marginTop: 2 }}>{c.text}</p>
                    </div>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <div className="avatar" style={{ width: 28, height: 28, fontSize: 11, flexShrink: 0 }}>
                    {user?.name?.[0] || 'U'}
                  </div>
                  <textarea
                    className="comment-input"
                    rows={2}
                    placeholder="Write a comment..."
                    value={commentInputs[post._id] || ''}
                    onChange={e => setCommentInputs(o => ({ ...o, [post._id]: e.target.value }))}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment(post._id); } }}
                  />
                  <button onClick={() => submitComment(post._id)}
                    style={{ background: '#f0b90b', border: 'none', borderRadius: 8, padding: '0 12px', cursor: 'pointer', color: '#0b0e11', display: 'flex', alignItems: 'center' }}>
                    <Send size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const FeedSection = () => (
    <>
      {/* Composer */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid #1e2329' }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <div className="avatar" style={{ width: 42, height: 42, fontSize: 15, flexShrink: 0 }}>
            {user?.name?.[0] || 'U'}
          </div>
          <div style={{ flex: 1 }}>
            <textarea className="post-input" placeholder="What's happening in crypto?" value={newPost}
              onChange={e => setNewPost(e.target.value)} rows={3}
              onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) submitPost(); }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <div style={{ display: 'flex', gap: 14, color: '#f0b90b' }}>
                <FileText size={17} style={{ cursor: 'pointer' }} title="Attach" />
                <Hash size={17} style={{ cursor: 'pointer' }} title="Tag" />
                <TrendingUp size={17} style={{ cursor: 'pointer' }} title="Chart" />
              </div>
              <button onClick={submitPost} disabled={!newPost.trim() || posting}
                style={{ padding: '7px 20px', background: newPost.trim() && !posting ? '#f0b90b' : '#2b3139', border: 'none', borderRadius: 20, color: newPost.trim() && !posting ? '#0b0e11' : '#5e6673', fontWeight: 700, fontSize: 13, cursor: newPost.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
                {posting ? <Loader2 size={14} className="spin" /> : null}
                Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tag filter */}
      <div style={{ display: 'flex', gap: 6, padding: '10px 18px', borderBottom: '1px solid #1e2329', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {TAGS.map(t => (
          <button key={t} className={tag-chip${activeTag === t ? ' on' : ''}} onClick={() => setActiveTag(t)}>{t}</button>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: '#5e6673' }}>
          <FileText size={40} style={{ opacity: .15, marginBottom: 12, display: 'block', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 14 }}>No posts yet. Be the first!</p>
        </div>
      )}
      {filteredPosts.map(post => <PostCard key={post._id} post={post} />)}
    </>
  );

  const NotificationSection = () => (
    <>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid #1e2329' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#eaecef', marginBottom: 12 }}>Notifications</h2>
        <div style={{ display: 'flex', gap: 0, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {['All', 'Trades', 'System'].map(t => (
            <button key={t} onClick={() => setNotifTab(t)}
              style={{ padding: '8px 14px', background: 'transparent', border: 'none', cursor: 'pointer', color: notifTab === t ? '#eaecef' : '#848e9c', borderBottom: notifTab === t ? '2px solid #f0b90b' : '2px solid transparent', fontWeight: notifTab === t ? 700 : 500, fontSize: 13, fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
              {t}
            </button>
          ))}
        </div>
      </div>
      {NOTIFS.map((n, i) => (
        <div key={i} className="notif-item">
          <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#1e2329', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>
            {n.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: '#eaecef' }}>{n.title}</span>
              <span style={{ fontSize: 11, color: '#5e6673', flexShrink: 0, marginLeft: 8 }}>{n.time}</span>
            </div>
            <p style={{ fontSize: 13, color: '#848e9c', lineHeight: 1.5 }}>{n.body}</p>
          </div>
        </div>
      ))}
    </>
  );

  const ProfileSection = () => (
    <div style={{ padding: 18 }}>
      {/* Back button mobile */}
      <button onClick={() => setSection('Feed')}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#848e9c', cursor: 'pointer', marginBottom: 16, fontFamily: 'inherit', fontSize: 13 }}>
        <ChevronLeft size={16} /> Back
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="avatar" style={{ width: 64, height: 64, fontSize: 24, background: '#f0b90b', color: '#0b0e11' }}>
          {user?.name?.[0] || 'U'}
        </div>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#eaecef' }}>{user?.name || 'Guest'}</h2>
          <p style={{ color: '#848e9c', fontSize: 13 }}>@{user?.email?.split('@')[0] || 'user'}</p>
          <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 13, color: '#848e9c' }}>
            <span><span style={{ color: '#eaecef', fontWeight: 700 }}>{followed.length}</span> Following</span>
            <span><span style={{ color: '#eaecef', fontWeight: 700 }}>0</span> Followers</span>
          </div>
        </div>
        <button onClick={() => navigate('/profile')}
          style={{ marginLeft: 'auto', padding: '8px 18px', border: '1px solid #2b3139', borderRadius: 20, background: 'transparent', color: '#eaecef', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
          Edit Profile
        </button>
      </div>
      <div style={{ background: '#161a1e', borderRadius: 12, padding: 16, marginBottom: 16, border: '1px solid #1e2329' }}>
        <p style={{ color: '#848e9c', fontSize: 13 }}>Balance: <span style={{ color: '#f0b90b', fontWeight: 700 }}>${(user?.balance || 0).toFixed(2)} USDT</span></p>
      </div>
      <div style={{ textAlign: 'center', padding: '40px 0', color: '#5e6673' }}>
        <FileText size={40} style={{ opacity: .15, margin: '0 auto 12px', display: 'block' }} />
        <p style={{ fontSize: 14 }}>No posts yet</p>
        <button onClick={() => setSection('Feed')}
          style={{ marginTop: 12, padding: '8px 24px', background: '#f0b90b', border: 'none', borderRadius: 20, color: '#0b0e11', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
          Start Posting
        </button>
      </div>
    </div>
  );

  const BookmarksSection = () => (
    <>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid #1e2329', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => setSection('Feed')} style={{ background: 'none', border: 'none', color: '#848e9c', cursor: 'pointer', display: 'flex' }}>
          <ChevronLeft size={20} />
        </button>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#eaecef' }}>Bookmarks</h2>
      </div>
      {filteredPosts.length === 0
        ? <div style={{ textAlign: 'center', padding: 60, color: '#5e6673' }}>
            <Bookmark size={40} style={{ opacity: .15, margin: '0 auto 12px', display: 'block' }} />
            <p>No bookmarks yet</p>
          </div>
        : filteredPosts.map(p => <PostCard key={p._id} post={p} />)
      }
    </>
  );

  const navItems = [
    { icon: <Home size={20} />, label: 'Feed', key: 'Feed' },
    { icon: <Bell size={20} />, label: 'Notifications', key: 'Notification', badge: NOTIFS.length },
    { icon: <Users size={20} />, label: 'Profile', key: 'Profile' },
    { icon: <Bookmark size={20} />, label: 'Bookmarks', key: 'Bookmarks' },
    { icon: <MessageCircle size={20} />, label: 'Chats', key: 'Chats' },
    { icon: <Compass size={20} />, label: 'Explore', key: 'Explore' },
    { icon: <Settings size={20} />, label: 'Settings', key: 'Settings' },
  ];

  return (
    <>
      <style>{css}</style>
      <div className="sq">
        {/* Sidebar */}
        <div className="sq-sidebar">
          <div style={{ fontSize: 14, fontWeight: 800, color: '#f0b90b', padding: '0 14px 16px', letterSpacing: 1 }}>VINANCE SQUARE</div>
          {navItems.map(item => (
            <button key={item.key} className={sq-nav-item${section === item.key ? ' on' : ''}} onClick={() => setSection(item.key)}>
              <div style={{ position: 'relative' }}>
                {item.icon}
                {item.badge && (
                  <span style={{ position: 'absolute', top: -6, right: -6, width: 16, height: 16, background: '#f6465d', borderRadius: '50%', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #0b0e11', color: '#fff' }}>
                    {item.badge}
                  </span>
                )}
              </div>
              <span>{item.label}</span>
            </button>
          ))}
          <div style={{ marginTop: 'auto', borderTop: '1px solid #1e2329', paddingTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px' }}>
              <div className="avatar" style={{ width: 38, height: 38, fontSize: 14, background: '#f0b90b', color: '#0b0e11' }}>
                {user?.name?.[0] || 'U'}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#eaecef', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'Guest'}</div>
                <div style={{ fontSize: 11, color: '#5e6673', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>@{user?.email?.split('@')[0] || 'user'}</div>
              </div>
              <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: '#848e9c', cursor: 'pointer', padding: 4 }} title="Back to Dashboard">
                <ArrowLeft size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="sq-main">
          {/* Mobile Header */}
          <div style={{ position: 'sticky', top: 0, background: 'rgba(11,14,17,.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #1e2329', padding: '12px 16px', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#848e9c', cursor: 'pointer', display: 'none' }} className="mobile-back">
                <ChevronLeft size={20} />
              </button>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#eaecef' }}>
                {section === 'Feed' ? 'Square' : section}
              </h2>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {section === 'Feed' && (
                <div className="sq-search" style={{ padding: '7px 12px' }}>
                  <Search size={14} style={{ color: '#5e6673' }} />
                  <input placeholder="Search posts..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
                </div>
              )}
              <Edit3 size={18} style={{ color: '#848e9c', cursor: 'pointer' }} onClick={() => setSection('Feed')} />
            </div>
          </div>

          {/* Mobile Nav Tabs */}
          <div style={{ display: 'none', overflowX: 'auto', scrollbarWidth: 'none', borderBottom: '1px solid #1e2329', padding: '0 4px' }} className="mobile-nav-tabs">
            {navItems.slice(0, 5).map(item => (
              <button key={item.key} onClick={() => setSection(item.key)}
                style={{ padding: '10px 16px', background: 'transparent', border: 'none', color: section === item.key ? '#f0b90b' : '#848e9c', borderBottom: section === item.key ? '2px solid #f0b90b' : '2px solid transparent', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}>
                {item.icon} {item.label}
              </button>
            ))}
          </div>

          {section === 'Feed' && <FeedSection />}
          {section === 'Notification' && <NotificationSection />}
          {section === 'Profile' && <ProfileSection />}
          {section === 'Bookmarks' && <BookmarksSection />}
          {!['Feed', 'Notification', 'Profile', 'Bookmarks'].includes(section) && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 80, color: '#5e6673' }}>
              <Compass size={48} style={{ opacity: .15, marginBottom: 16 }} />
              <p style={{ fontSize: 14 }}>{section} — Coming Soon</p>
              <button onClick={() => setSection('Feed')} style={{ marginTop: 16, padding: '8px 20px', background: '#f0b90b', border: 'none', borderRadius: 20, color: '#0b0e11', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                Back to Feed
              </button>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="sq-right">
          <div className="sq-search" style={{ marginBottom: 16 }}>
            <Search size={14} style={{ color: '#5e6673' }} />
            <input placeholder="Search Square..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
          </div>

          {/* Trending */}
          <div style={{ background: '#161a1e', borderRadius: 14, padding: 16, marginBottom: 16, border: '1px solid #1e2329' }}>
            <h3 style={{ fontWeight: 700, fontSize: 14, color: '#eaecef', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              🔥 Trending Topics
            </h3>
            {TRENDING.map((t, i) => (
              <div key={i} className="trending-item" style={{ paddingBottom: 8, marginBottom: 8 }} onClick={() => setSearchQ(t.tag)}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <Hash size={12} style={{ color: '#f0b90b', marginTop: 3, flexShrink: 0 }} />
                  <div>
                    <div className="trend-title" style={{ fontWeight: 700, fontSize: 12, color: '#eaecef', marginBottom: 2, transition: 'color .15s' }}>
                      {t.tag}
                    </div>
                    <div style={{ fontSize: 11, color: '#5e6673' }}>{t.views} · {t.count}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Suggested */}
          <div style={{ background: '#161a1e', borderRadius: 14, padding: 16, border: '1px solid #1e2329' }}>
            <h3 style={{ fontWeight: 700, fontSize: 14, color: '#eaecef', marginBottom: 12 }}>Suggested Creators</h3>
            {SUGGESTED.map((c, i) => (
              <div key={i} className="creator-card" style={{ borderBottom: i === SUGGESTED.length - 1 ? 'none' : undefined }}>
                <div className="avatar" style={{ width: 38, height: 38, background: hsl(${i * 80 + 30},55%,40%), fontSize: 13 }}>
                  {c.name[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: '#eaecef' }}>{c.name}</span>
                    {c.verified && <span style={{ color: '#f0b90b', fontSize: 11 }}>✓</span>}
                  </div>
                  <div style={{ fontSize: 11, color: '#848e9c' }}>{c.bio}</div>
                </div>
                <button className={follow-btn${followed.includes(c.handle) ? ' on' : ''}}
                  onClick={() => setFollowed(f => f.includes(c.handle) ? f.filter(h => h !== c.handle) : [...f, c.handle])}>
                  {followed.includes(c.handle) ? 'Following' : 'Follow'}
                </button>
              </div>
            ))}
          </div>

          <div style={{ padding: '14px 0', fontSize: 11, color: '#5e6673', lineHeight: 2 }}>
            <span style={{ cursor: 'pointer', marginRight: 8 }}>Terms</span>
            <span style={{ cursor: 'pointer', marginRight: 8 }}>Privacy</span>
            <span style={{ cursor: 'pointer' }}>Cookies</span>
          </div>
        </div>
      </div>
      <style>{`
        @media(max-width:768px){
          .mobile-back{display:flex!important;}
          .mobile-nav-tabs{display:flex!important;}
          .sq-search{display:none;}
        }
      `}</style>
    </>
  );
}
