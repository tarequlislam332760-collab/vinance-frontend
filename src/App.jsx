import React, { useState, useEffect, useContext } from 'react';
import {
  BrowserRouter, Routes, Route, NavLink,
  useLocation, useNavigate, Link, Navigate
} from 'react-router-dom';
import axios from 'axios';
import {
  LayoutDashboard, BarChart3, TrendingUp, Wallet, LogOut,
  ShieldCheck, Activity, ArrowUpRight, ArrowDownLeft,
  PieChart, LayoutGrid, Zap, History, Gavel, Copy,
  MessageSquare, Bot, Globe, Key, PenTool
} from 'lucide-react';

import { UserProvider, UserContext } from './context/UserContext';
import NotificationSystem from './components/NotificationSystem';

/* ── Pages ── */
import Home          from './pages/Home';
import BecomeTrader  from './pages/BecomeTrader';
import Profile       from './pages/Profile';
import Deposit       from './pages/Deposit';
import Withdraw      from './pages/Withdraw';
import WalletPage    from './pages/Wallet';
import Investment    from './pages/Investment';
import MyInvestments from './pages/MyInvestments';
import TraderProfile from './pages/TraderProfile';
import Futures       from './pages/Futures';
import Trade         from './pages/Trade';
import Market        from './pages/Market';
import CopyTrade     from './pages/CopyTrade';
import Square        from './pages/Square';
import HistoryPage   from './pages/History';

/* ── New Pages (Case-matched imports) ── */
import TradingBots    from './pages/TradingBots';
import Alpha          from './pages/Alpha';
import CapitalConnect from './pages/CapitalConnect';
import SquareCreator  from './pages/Squarecreator'; 
import Apimanagement  from './pages/Apimanagement'; // ছোট হাতের m দিয়ে ইম্পোর্ট করা হলো

/* ── Admin ── */
import AdminPanel  from './admin/AdminPanel';
import ManagePlans from './admin/ManagePlans';

const API_URL = 'https://vinance-backend-1.onrender.com';

/* ══ NavItem ══ */
const NavItem = ({ to, icon, label }) => (
  <NavLink to={to} className={({ isActive }) =>
    `flex items-center gap-4 p-3.5 rounded-xl transition-all ${
      isActive ? 'text-[#f0b90b] bg-[#f0b90b]/10' : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`}>
    {icon}
    <span className="hidden lg:inline font-black text-[10px] uppercase tracking-widest">{label}</span>
  </NavLink>
);

/* ══ Login ══ */
const Login = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const { login }               = useContext(UserContext);
  const navigate                = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/api/login`, { email, password });
      login(res.data.token, res.data.user || res.data);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Login Failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0e11] px-4">
      <div className="max-w-md w-full bg-[#161a1e] p-8 rounded-[2rem] border border-[#1e2329] shadow-2xl">
        <h2 className="text-3xl font-black text-[#f0b90b] italic mb-6 text-center">VINANCE LOGIN</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="Email"
            className="w-full bg-[#2b3139] p-4 rounded-xl outline-none border border-transparent focus:border-[#f0b90b] text-white"
            onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password"
            className="w-full bg-[#2b3139] p-4 rounded-xl outline-none border border-transparent focus:border-[#f0b90b] text-white"
            onChange={e => setPassword(e.target.value)} required />
          <button type="submit"
            className="w-full bg-[#f0b90b] text-black font-black py-4 rounded-xl uppercase tracking-widest hover:bg-[#d4a30a] transition-all">
            Sign In
          </button>
        </form>
        <p className="mt-6 text-center text-gray-400 text-sm">
          {"Don't have an account? "}
          <Link to="/register" className="text-[#f0b90b] font-bold">Register</Link>
        </p>
      </div>
    </div>
  );
};

/* ══ Register ══ */
const Register = () => {
  const [formData, setFormData] = useState({ name:'', email:'', password:'' });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/register`, formData);
      alert('Registration Successful! Please Login.');
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || 'Registration Failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0e11] px-4">
      <div className="max-w-md w-full bg-[#161a1e] p-8 rounded-[2rem] border border-[#1e2329] shadow-2xl">
        <h2 className="text-3xl font-black text-[#f0b90b] italic mb-6 text-center">CREATE ACCOUNT</h2>
        <form onSubmit={handleRegister} className="space-y-4">
          <input type="text" placeholder="Full Name"
            className="w-full bg-[#2b3139] p-4 rounded-xl outline-none border border-transparent focus:border-[#f0b90b] text-white"
            onChange={e => setFormData({...formData, name:e.target.value})} required />
          <input type="email" placeholder="Email Address"
            className="w-full bg-[#2b3139] p-4 rounded-xl outline-none border border-transparent focus:border-[#f0b90b] text-white"
            onChange={e => setFormData({...formData, email:e.target.value})} required />
          <input type="password" placeholder="Password"
            className="w-full bg-[#2b3139] p-4 rounded-xl outline-none border border-transparent focus:border-[#f0b90b] text-white"
            onChange={e => setFormData({...formData, password:e.target.value})} required />
          <button type="submit"
            className="w-full bg-[#f0b90b] text-black font-black py-4 rounded-xl uppercase tracking-widest hover:bg-[#d4a30a] transition-all">
            Register Now
          </button>
        </form>
        <p className="mt-6 text-center text-gray-400 text-sm">
          {"Already have an account? "}
          <Link to="/login" className="text-[#f0b90b] font-bold">Login</Link>
        </p>
      </div>
    </div>
  );
};

/* ══ Dashboard ══ */
const Dashboard = ({ cryptoData }) => {
  const { user, refreshUser, token } = useContext(UserContext);
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (refreshUser) refreshUser();
    if (!token) return;
    axios.get(`${API_URL}/api/transactions`, { headers:{ Authorization:`Bearer ${token}` } })
      .then(r => setTransactions(Array.isArray(r.data) ? r.data : []))
      .catch(() => {});
  }, [token]);

  return (
    <div className="p-4 md:p-8 text-left space-y-6 bg-[#0b0e11] min-h-screen">

      {/* Balance */}
      <div className="bg-gradient-to-br from-[#161a1e] to-[#0b0e11] p-6 rounded-[2.5rem] border border-[#1e2329] flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
        <div className="text-center md:text-left z-10">
          <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] font-black mb-2">Estimated Balance</p>
          <h1 className="text-3xl md:text-5xl font-mono font-black text-white tracking-tighter">
            ${(user?.balance || 0).toLocaleString(undefined, { minimumFractionDigits:2 })}
          </h1>
        </div>
        <div className="flex gap-3 w-full md:w-auto z-10">
          <button onClick={() => navigate('/deposit')}
            className="flex-1 bg-[#f0b90b] text-black px-8 py-3.5 rounded-2xl font-black uppercase text-xs">Deposit</button>
          <button onClick={() => navigate('/withdraw')}
            className="flex-1 bg-white/5 text-white px-8 py-3.5 rounded-2xl font-black border border-[#1e2329] uppercase text-xs">Withdraw</button>
        </div>
      </div>

      {/* Crypto + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          {cryptoData.slice(0,4).map(coin => (
            <div key={coin.id} onClick={() => navigate(`/trade/${coin.symbol}`)}
              className="bg-[#161a1e] p-5 rounded-[2rem] border border-[#1e2329] cursor-pointer hover:border-[#f0b90b]/50 shadow-lg transition-all">
              <div className="flex justify-between mb-4 text-[10px] font-black uppercase">
                <span className="text-[#f0b90b]">{coin.symbol.toUpperCase()}</span>
                <span className={coin.up ? 'text-[#00c076]' : 'text-[#f6465d]'}>{coin.change}%</span>
              </div>
              <p className="text-xl md:text-2xl font-black text-white font-mono">${coin.price}</p>
            </div>
          ))}
        </div>
        <div className="bg-[#161a1e] border border-[#1e2329] rounded-[2.5rem] p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white font-black uppercase text-[10px] flex items-center gap-2 tracking-[0.2em]">
              <Activity size={14} className="text-[#f0b90b]"/> Recent Activity
            </h3>
            <Link to="/wallet" className="text-[#f0b90b] text-[10px] font-black uppercase hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {transactions.slice(0,5).map(trx => (
              <div key={trx._id} className="flex justify-between items-center p-3 hover:bg-white/[0.03] rounded-2xl">
                <div className="flex items-center gap-2">
                  <span className={trx.type==='deposit'?'text-[#00c076]':'text-[#f6465d]'}>
                    {trx.type==='deposit'?<ArrowDownLeft size={14}/>:<ArrowUpRight size={14}/>}
                  </span>
                  <div>
                    <p className="font-black text-[9px] text-white uppercase">{trx.type}</p>
                    <p className="text-[8px] text-gray-500">{new Date(trx.createdAt||trx.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-xs text-white">${trx.amount}</p>
                  <p className={`text-[8px] font-black uppercase ${trx.status==='approved'||trx.status==='completed'?'text-[#00c076]':'text-[#f0b90b]'}`}>
                    {trx.status}
                  </p>
                </div>
              </div>
            ))}
            {!transactions.length && <p className="text-gray-600 text-xs text-center py-6">No transactions yet</p>}
          </div>
        </div>
      </div>

      {/* Quick Nav */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:'Market',        icon:'📊', path:'/market'         },
          { label:'Futures',       icon:'⚡', path:'/futures/btc'    },
          { label:'Copy Trade',    icon:'📋', path:'/copy-trade'     },
          { label:'Square',        icon:'🌐', path:'/square'         },
          { label:'Bots',          icon:'🤖', path:'/trading-bots'   },
          { label:'Alpha',         icon:'🔥', path:'/alpha'          },
          { label:'Capital',       icon:'💎', path:'/capital-connect'},
          { label:'API',           icon:'🔑', path:'/api-management' },
        ].map(item => (
          <div key={item.label} onClick={() => navigate(item.path)}
            className="bg-[#161a1e] border border-[#1e2329] rounded-2xl p-5 cursor-pointer hover:border-[#f0b90b]/50 text-center transition-all">
            <div className="text-3xl mb-2">{item.icon}</div>
            <p className="text-white font-black text-xs uppercase">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ══ AppContent ══ */
const AppContent = ({ cryptoData }) => {
  const { user, token, logout, loading: authLoading } = useContext(UserContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  if (authLoading) return (
    <div className="min-h-screen bg-[#0b0e11] flex items-center justify-center text-[#f0b90b] font-black text-3xl animate-pulse italic">
      VINANCE
    </div>
  );

  const isAuthPage = ['/login','/register'].includes(location.pathname);
  const isHomePage = location.pathname === '/';
  const isFullPage = location.pathname.startsWith('/square') || location.pathname.startsWith('/market');

  if (!token && !isAuthPage && !isHomePage) return <Navigate to="/login" replace />;

  const userPages = [
    { to:'/dashboard',                               icon:<LayoutDashboard size={22}/>, label:'Home'       },
    { to:'/market',                                  icon:<BarChart3 size={22}/>,       label:'Market'     },
    { to:'/futures/btc',                             icon:<Gavel size={22}/>,           label:'Futures'    },
    { to:`/trade/${cryptoData[0]?.symbol||'btc'}`,   icon:<TrendingUp size={22}/>,      label:'Spot'       },
    { to:'/copy-trade',                              icon:<Copy size={22}/>,            label:'Copy Trade' },
    { to:'/trading-bots',                            icon:<Bot size={22}/>,             label:'Bots'       },
    { to:'/square',                                  icon:<MessageSquare size={22}/>,   label:'Square'     },
    { to:'/alpha',                                   icon:<Zap size={22}/>,             label:'Alpha'      },
    { to:'/capital-connect',                         icon:<Globe size={22}/>,           label:'Capital'    },
    { to:'/creator-center',                          icon:<PenTool size={22}/>,         label:'Creator'    }, // আলাদা আইকন দেওয়া হলো
    { to:'/api-management',                          icon:<Key size={22}/>,             label:'API'        },
    { to:'/invest',                                  icon:<PieChart size={22}/>,        label:'Invest'     },
    { to:'/history',                                 icon:<History size={22}/>,         label:'History'    },
    { to:'/wallet',                                  icon:<Wallet size={22}/>,          label:'Wallet'     },
  ];

  const adminPages = [
    { to:'/admin',              icon:<ShieldCheck size={22}/>, label:'Users' },
    { to:'/admin/manage-plans', icon:<LayoutGrid size={22}/>,  label:'Plans' },
  ];

  const allRoutes = (
    <Routes>
      <Route path="/"                    element={<Home/>}/>
      <Route path="/login"               element={<Login/>}/>
      <Route path="/register"            element={<Register/>}/>
      <Route path="/dashboard"           element={<Dashboard cryptoData={cryptoData}/>}/>
      <Route path="/market"              element={<Market/>}/>
      <Route path="/copy-trade"          element={<CopyTrade/>}/>
      <Route path="/square"              element={<Square/>}/>
      <Route path="/history"             element={<HistoryPage/>}/>
      <Route path="/futures"             element={<Navigate to="/futures/btc" replace/>}/>
      <Route path="/futures/:coinSymbol" element={<Futures/>}/>
      <Route path="/trade/:coinSymbol"   element={<Trade/>}/>

      {/* ── New pages ── */}
      <Route path="/trading-bots"        element={<TradingBots/>}/>
      <Route path="/alpha"               element={<Alpha/>}/>
      <Route path="/capital-connect"     element={<CapitalConnect/>}/>
      <Route path="/creator-center"      element={<SquareCreator/>}/>   {/* SquareCreator.jsx */}
      <Route path="/api-management"      element={<Apimanagement/>}/>   {/* কেসিং এরর এখানে ফিক্স করা হলো */}

      {/* ── User ── */}
      <Route path="/deposit"             element={<Deposit/>}/>
      <Route path="/withdraw"            element={<Withdraw/>}/>
      <Route path="/wallet"              element={<WalletPage/>}/>
      <Route path="/invest"              element={<Investment/>}/>
      <Route path="/my-investments"      element={<MyInvestments/>}/>
      <Route path="/trader-profile"      element={<TraderProfile/>}/>
      <Route path="/profile"             element={<Profile/>}/>
      <Route path="/become-trader"       element={<BecomeTrader/>}/>

      {/* ── Admin ── */}
      <Route path="/admin"
        element={user?.role==='admin' ? <AdminPanel/> : <Navigate to="/dashboard"/>}/>
      <Route path="/admin/manage-plans"
        element={user?.role==='admin' ? <ManagePlans/> : <Navigate to="/dashboard"/>}/>
    </Routes>
  );

  if (isFullPage) return <div className="min-h-screen bg-[#0b0e11] text-white">{allRoutes}</div>;

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white flex flex-col md:flex-row overflow-hidden text-left font-sans">

      {/* Sidebar */}
      {token && !isHomePage && (
        <aside className="w-20 lg:w-64 bg-[#161a1e] border-r border-[#1e2329] hidden md:flex flex-col p-4 h-screen sticky top-0 z-40">
          <div className="mb-8 px-4 py-2 text-2xl font-black text-[#f0b90b] italic uppercase tracking-tighter">VINANCE</div>
          <nav className="space-y-1 flex-1 overflow-y-auto" style={{ scrollbarWidth:'none' }}>
            {userPages.map(page => <NavItem key={page.to} to={page.to} icon={page.icon} label={page.label}/>)}
          </nav>
          {user?.role === 'admin' && (
            <div className="mt-auto pt-4 border-t border-gray-800 space-y-1 mb-4">
              <div className="px-4 py-1 text-[9px] font-black text-[#f0b90b] uppercase tracking-widest opacity-50 italic">Admin</div>
              {adminPages.map(page => <NavItem key={page.to} to={page.to} icon={page.icon} label={page.label}/>)}
            </div>
          )}
          <button onClick={logout}
            className="p-4 text-gray-500 hover:text-red-500 flex items-center gap-4 font-bold border-t border-gray-800 transition-colors">
            <LogOut size={20}/>
            <span className="hidden lg:inline text-[10px] font-black uppercase">Sign Out</span>
          </button>
        </aside>
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {token && !isHomePage && (
          <header className="h-14 border-b border-[#1e2329] bg-[#161a1e] flex items-center justify-between px-6 sticky top-0 z-30"> {/* top-0 সিনট্যাক্স ফিক্সড */}
            <div className="font-black text-[9px] uppercase tracking-widest text-[#f0b90b]">
              Hi, {user?.name||'User'} 👋
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-400 hidden sm:block">
                Balance: <span className="text-[#f0b90b] font-bold">${(user?.balance||0).toFixed(2)}</span>
              </span>
              <NotificationSystem/>
            </div>
          </header>
        )}
        <div className={`flex-1 overflow-y-auto ${token && !isHomePage ? 'pb-24 md:pb-8' : ''}`}>
          {allRoutes}
        </div>
      </main>

      {/* Mobile bottom nav */}
      {token && !isHomePage && (
        <>
          {showMoreMenu && (
            <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] p-8 flex flex-col overflow-y-auto text-left">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-[#f0b90b] font-black text-xl uppercase italic">Services</h2>
                <button onClick={() => setShowMoreMenu(false)} className="bg-white/10 p-2 rounded-full text-gray-400 hover:text-white">✕</button>
              </div>
              <div className="grid grid-cols-3 gap-y-8 gap-x-4 mb-10 text-center">
                {userPages.map(page => (
                  <Link key={page.to} to={page.to} onClick={() => setShowMoreMenu(false)}
                    className="flex flex-col items-center gap-2 text-gray-400 hover:text-white">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">{page.icon}</div>
                    <span className="text-[9px] font-black uppercase leading-tight">{page.label}</span>
                  </Link>
                ))}
              </div>
              {user?.role === 'admin' && (
                <div className="mb-10">
                  <h3 className="text-[#f0b90b] font-black text-[10px] uppercase tracking-widest mb-6 opacity-50">Admin Panel</h3>
                  <div className="grid grid-cols-3 gap-y-8 gap-x-4 text-center">
                    {adminPages.map(page => (
                      <Link key={page.to} to={page.to} onClick={() => setShowMoreMenu(false)}
                        className="flex flex-col items-center gap-2 text-yellow-500/80">
                        <div className="p-4 bg-yellow-500/5 rounded-2xl border border-yellow-500/10">{page.icon}</div>
                        <span className="text-[9px] font-black uppercase leading-tight">{page.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              <button onClick={logout}
                className="flex items-center justify-center gap-2 text-red-500 font-black uppercase text-[10px] py-4 bg-red-500/5 rounded-2xl border border-red-500/10 mt-4">
                <LogOut size={18}/> Logout Account
              </button>
            </div>
          )}
          <nav className="fixed bottom-0 left-0 right-0 bg-[#161a1e]/95 backdrop-blur-md border-t border-gray-800 flex justify-around items-center py-3 md:hidden z-[80]">
            <NavLink to="/dashboard"    className={({isActive}) => isActive?'text-[#f0b90b]':'text-gray-400'}><LayoutDashboard size={22}/></NavLink>
            <NavLink to="/market"       className={({isActive}) => isActive?'text-[#f0b90b]':'text-gray-400'}><BarChart3 size={22}/></NavLink>
            <NavLink to="/futures/btc"  className={({isActive}) => isActive?'text-[#f0b90b]':'text-gray-400'}><Gavel size={22}/></NavLink>
            <NavLink to="/trading-bots" className={({isActive}) => isActive?'text-[#f0b90b]':'text-gray-400'}><Bot size={22}/></NavLink>
            <NavLink to="/wallet"       className={({isActive}) => isActive?'text-[#f0b90b]':'text-gray-400'}><Wallet size={22}/></NavLink>
            <button onClick={() => setShowMoreMenu(true)} className="text-gray-400 relative">
              <LayoutGrid size={22}/>
              {user?.role==='admin' && <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#f0b90b] rounded-full animate-pulse"/>}
            </button>
          </nav>
        </>
      )}
    </div>
  );
};

/* ══ App Root ══ */
export default function App() {
  const [cryptoData, setCryptoData] = useState([
    { id:'1', name:'Bitcoin',  symbol:'btc', price:'0', change:'0', up:true },
    { id:'2', name:'Ethereum', symbol:'eth', price:'0', change:'0', up:true },
    { id:'3', name:'Solana',   symbol:'sol', price:'0', change:'0', up:true },
    { id:'4', name:'BNB',      symbol:'bnb', price:'0', change:'0', up:true },
  ]);

  const fetchPrices = async () => {
    try {
      const syms    = ['BTCUSDT','ETHUSDT','SOLUSDT','BNBUSDT'];
      const results = await Promise.all(syms.map(s => axios.get(`https://api.binance.com/api/v3/ticker/24hr?symbol=${s}`)));
      setCryptoData(results.map((res,i) => ({
        id:     (i+1).toString(),
        name:   res.data.symbol.replace('USDT',''),
        symbol: res.data.symbol.replace('USDT','').toLowerCase(),
        price:  parseFloat(res.data.lastPrice).toLocaleString(undefined,{minimumFractionDigits:2}),
        change: parseFloat(res.data.priceChangePercent).toFixed(2),
        up:     parseFloat(res.data.priceChangePercent) > 0,
      })));
    } catch {}
  };

  useEffect(() => {
    fetchPrices();
    const iv = setInterval(fetchPrices, 15000);
    return () => clearInterval(iv);
  }, []);

  return (
    <UserProvider>
      <BrowserRouter>
        <AppContent cryptoData={cryptoData}/>
      </BrowserRouter>
    </UserProvider>
  );
}
