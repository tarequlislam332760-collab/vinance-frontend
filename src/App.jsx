import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation, useNavigate, Link, Navigate, useParams } from 'react-router-dom';
import axios from 'axios'; 
import { 
  LayoutDashboard, BarChart3, TrendingUp, Wallet, LogOut, 
  ShieldCheck, Activity, ArrowUpRight, ArrowDownLeft,
  PieChart, ChevronLeft, Star, Bell, MoreHorizontal, LayoutGrid, Zap, ChevronDown, History, Maximize2
} from 'lucide-react';

import { UserProvider, UserContext } from './context/UserContext'; 

// --- ইম্পোর্ট সেকশন (নিশ্চিত করুন এই ফাইলগুলো আপনার pages ফোল্ডারে আছে) ---
import Login from './pages/Login'; 
import Register from './pages/Register';
import BecomeTrader from './pages/BecomeTrader';
import Profile from './pages/Profile';
import Home from './pages/Home'; 
import NotificationSystem from './components/NotificationSystem'; 
import AdminPanel from './admin/AdminPanel';
import Deposit from './pages/Deposit'; 
import Withdraw from './pages/Withdraw'; 
import WalletPage from './pages/Wallet';
import Investment from './pages/Investment'; 
import MyInvestments from './pages/MyInvestments';
import ManagePlans from './admin/ManagePlans';
import TraderProfile from './pages/TraderProfile';
import Dashboard from './pages/Dashboard'; // Dashboard ইম্পোর্ট করা নিশ্চিত করুন
import Market from './pages/Market';       // Market ইম্পোর্ট করা নিশ্চিত করুন

// --- NavItem Component ---
const NavItem = ({ to, icon, label }) => (
  <NavLink to={to} className={({ isActive }) => `flex items-center gap-4 p-3.5 rounded-xl transition-all ${isActive ? 'text-[#f0b90b] bg-[#f0b90b]/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
    {icon} <span className="hidden lg:inline font-black text-[10px] uppercase tracking-widest">{label}</span>
  </NavLink>
);

// --- Futures Component ---
const Futures = () => {
  const { coinSymbol } = useParams();
  const { user, refreshUser, API_URL, token } = useContext(UserContext);
  const [leverage, setLeverage] = useState(20);
  const [amount, setAmount] = useState('');
  const [side, setSide] = useState('buy'); 
  const [loading, setLoading] = useState(false);
  const currentCoin = (coinSymbol || 'BTC').toUpperCase();

  const handleTrade = async () => {
    if (!amount || parseFloat(amount) <= 0) return alert("অ্যামাউন্ট লিখুন");
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/futures/trade`, 
        { type: side, amount: parseFloat(amount), leverage, symbol: currentCoin },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);
      if (refreshUser) await refreshUser();
    } catch (err) { 
      alert(err.response?.data?.message || "ট্রেড ব্যর্থ হয়েছে"); 
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0b0e11] text-[#eaecef] overflow-hidden text-left relative">
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-800 bg-[#0b0e11] z-50">
        <div className="flex items-center gap-2">
          <ChevronLeft size={22} className="text-gray-400 cursor-pointer" onClick={() => window.history.back()} />
          <h2 className="text-sm font-bold flex items-center gap-1 italic uppercase">
            {currentCoin}USDT <span className="bg-[#2b3139] text-[9px] px-1 rounded text-[#02c076] not-italic">Perp</span>
          </h2>
        </div>
        <div className="flex gap-4 text-gray-400 items-center">
          <History size={18} className="hover:text-white cursor-pointer" />
          <MoreHorizontal size={20} />
        </div>
      </div>
      <div className="flex-1 relative bg-black">
         <iframe title="Futures Chart" src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${currentCoin}USDT&interval=15&theme=dark&style=1`} className="absolute inset-0 w-full h-full border-none"></iframe>
      </div>
      <div className="w-full bg-[#161a1e] p-4 pb-24 md:pb-6 border-t border-gray-900">
          <div className="flex gap-2 mb-4">
             <button onClick={() => setSide('buy')} className={`flex-1 py-2.5 rounded-lg font-black text-[11px] uppercase italic transition-all ${side === 'buy' ? 'bg-[#02c076] text-black' : 'bg-[#2b3139] text-gray-500'}`}>Buy</button>
             <button onClick={() => setSide('sell')} className={`flex-1 py-2.5 rounded-lg font-black text-[11px] uppercase italic transition-all ${side === 'sell' ? 'bg-[#f6465d] text-white' : 'bg-[#2b3139] text-gray-500'}`}>Sell</button>
          </div>
          <div className="flex gap-3 items-end">
            <div className="flex-1 space-y-3">
              <div className="flex justify-between items-center bg-[#2b3139] rounded p-2 border border-gray-800">
                <span className="text-[9px] font-black text-gray-500 uppercase">Lev: {leverage}x</span>
                <input type="range" min="1" max="100" value={leverage} onChange={(e)=>setLeverage(e.target.value)} className="w-24 h-1 accent-[#f0b90b] cursor-pointer" />
              </div>
              <input type="number" placeholder="Amount (USDT)" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-[#2b3139] rounded p-2.5 text-xs outline-none text-white border border-gray-800 focus:border-[#f0b90b]" />
            </div>
            <button onClick={handleTrade} className={`h-20 px-6 rounded-xl font-black text-xs uppercase italic transition-all ${side === 'buy' ? 'bg-[#02c076] text-black' : 'bg-[#f6465d] text-white'}`}>
              {loading ? '...' : side === 'buy' ? 'Long' : 'Short'}
            </button>
          </div>
      </div>
    </div>
  );
};

// --- Trade (Spot) Component ---
const Trade = () => {
  const { coinSymbol } = useParams();
  const { user, refreshUser, API_URL, token } = useContext(UserContext);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const currentCoin = (coinSymbol || 'BTC').toUpperCase();

  const handleTrade = async (type) => {
    if (!amount || parseFloat(amount) <= 0) return alert("অ্যামাউন্ট লিখুন");
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/trade`, { type, amount: parseFloat(amount), symbol: currentCoin }, { headers: { Authorization: `Bearer ${token}` } });
      alert(res.data.message);
      if (refreshUser) await refreshUser(); 
      setAmount('');
    } catch (err) { alert(err.response?.data?.message || "ট্রেড সফল হয়নি"); } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0b0e11] text-[#eaecef] overflow-hidden text-left">
      <div className="flex justify-between items-center px-4 py-2 border-b border-gray-800 bg-[#0b0e11]">
        <ChevronLeft className="cursor-pointer text-gray-400" onClick={() => window.history.back()} />
        <span className="font-black italic uppercase text-sm tracking-widest">{currentCoin}/USDT</span>
        <Activity size={18} className="text-[#f0b90b]" />
      </div>
      <div className="flex-1 w-full relative">
        <iframe title="Spot Chart" src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${currentCoin}USDT&interval=240&theme=dark&style=1`} className="absolute inset-0 w-full h-full border-none"></iframe>
      </div>
      <div className="p-4 pb-24 bg-[#161a1e] border-t border-gray-800">
        <div className="flex flex-col gap-3 max-w-md mx-auto">
          <input type="number" value={amount} onChange={(e)=>setAmount(e.target.value)} placeholder="0.00 USDT" className="w-full bg-[#2b3139] rounded-xl py-4 px-4 text-sm font-bold outline-none text-white border border-gray-800 focus:border-[#f0b90b]" />
          <div className="flex gap-3">
            <button onClick={() => handleTrade('buy')} className="flex-1 bg-[#02c076] text-black py-3.5 rounded-xl font-black uppercase italic">{loading ? '...' : 'Buy'}</button>
            <button onClick={() => handleTrade('sell')} className="flex-1 bg-[#f6465d] text-white py-3.5 rounded-xl font-black uppercase italic">{loading ? '...' : 'Sell'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- AppContent Wrapper ---
const AppContent = ({ cryptoData }) => {
  const { user, token, logout, loading: authLoading } = useContext(UserContext);
  const location = useLocation();
  const [showMoreMenu, setShowMoreMenu] = useState(false); 

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isHomePage = location.pathname === '/';

  if (authLoading) return (
    <div className="min-h-screen bg-[#0b0e11] flex items-center justify-center">
      <div className="text-[#f0b90b] font-black text-4xl animate-pulse italic tracking-tighter text-center uppercase">SearchSocial<br/><span className="text-white text-xs tracking-[10px]">Marketing</span></div>
    </div>
  );

  // টোকেন না থাকলে এবং লগইন/রেজিস্টার/হোম পেজ না হলে রিডাইরেক্ট
  if (!token && !isAuthPage && !isHomePage) {
    return <Navigate to="/login" replace />;
  }

  const userPages = [
    { to: "/dashboard", icon: <LayoutDashboard size={22}/>, label: "Home" },
    { to: "/market", icon: <BarChart3 size={22}/>, label: "Market" },
    { to: "/invest", icon: <PieChart size={22}/>, label: "Invest" },
    { to: "/copy-trade", icon: <Zap size={22}/>, label: "CopyTrade" }, 
    { to: `/futures/${cryptoData[0]?.symbol || 'btc'}`, icon: <Activity size={22}/>, label: "Futures" },
    { to: `/trade/${cryptoData[0]?.symbol || 'btc'}`, icon: <TrendingUp size={22}/>, label: "Spot" },
    { to: "/wallet", icon: <Wallet size={22}/>, label: "Wallet" },
  ];

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white flex flex-col md:flex-row overflow-hidden text-left font-sans">
      {/* Sidebar - Desktop */}
      {token && !isHomePage && !isAuthPage && (
        <aside className="w-20 lg:w-64 bg-[#161a1e] border-r border-[#1e2329] hidden md:flex flex-col p-4 h-screen sticky top-0 z-40">
          <div className="mb-10 px-4 py-2 text-xl font-black text-[#f0b90b] italic uppercase tracking-tighter">VINANCE</div>
          <nav className="space-y-2 flex-1 overflow-y-auto no-scrollbar">
            {userPages.map(page => (
              <NavItem key={page.to} to={page.to} icon={page.icon} label={page.label} />
            ))}
          </nav>
          <button onClick={logout} className="p-4 text-gray-500 hover:text-red-500 flex items-center gap-4 font-bold border-t border-gray-800">
            <LogOut size={20}/> <span className="hidden lg:inline text-[10px] font-black uppercase tracking-widest">Logout</span>
          </button>
        </aside>
      )}

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {token && !isHomePage && !isAuthPage && (
          <header className="h-14 border-b border-[#1e2329] bg-[#161a1e] flex items-center justify-between px-6 sticky top-0 z-[60]">
            <div className="font-black text-[10px] uppercase tracking-widest text-[#f0b90b] italic">UID: {user?._id?.slice(-6) || 'Guest'}</div>
            <div className="flex items-center gap-4">
               <NotificationSystem />
               <Link to="/profile" className="w-8 h-8 bg-[#f0b90b] rounded-full flex items-center justify-center text-black text-[10px] font-black uppercase">{user?.name?.charAt(0) || 'U'}</Link>
            </div>
          </header>
        )}
        
        <div className={`flex-1 overflow-y-auto no-scrollbar ${token && !isHomePage && !isAuthPage ? 'pb-20 md:pb-0' : ''}`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard cryptoData={cryptoData} />} />
            <Route path="/market" element={<Market cryptoData={cryptoData} />} />
            <Route path="/trade/:coinSymbol" element={<Trade />} /> 
            <Route path="/futures/:coinSymbol" element={<Futures />} /> 
            <Route path="/deposit" element={<Deposit />} />
            <Route path="/withdraw" element={<Withdraw />} />
            <Route path="/wallet" element={<WalletPage />} /> 
            <Route path="/invest" element={<Investment />} />
            <Route path="/my-investments" element={<MyInvestments />} />
            <Route path="/copy-trade" element={<TraderProfile />} /> 
            <Route path="/profile" element={<Profile />} />
            <Route path="/become-trader" element={<BecomeTrader />} />
            <Route path="/admin/*" element={user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </main>

      {/* Mobile Nav & More Menu */}
      {token && !isHomePage && !isAuthPage && (
        <>
          {showMoreMenu && (
            <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[100] p-8 flex flex-col text-left animate-in fade-in zoom-in duration-300">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-[#f0b90b] font-black text-2xl uppercase italic tracking-tighter">Services</h2>
                <button onClick={() => setShowMoreMenu(false)} className="bg-white/10 w-10 h-10 rounded-full text-white flex items-center justify-center font-bold">✕</button>
              </div>
              <div className="grid grid-cols-3 gap-6">
                {userPages.map((page) => (
                  <Link key={page.to} to={page.to} onClick={() => setShowMoreMenu(false)} className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center text-[#f0b90b]">{page.icon}</div>
                    <span className="text-[10px] font-black uppercase text-gray-400">{page.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          <nav className="fixed bottom-0 left-0 right-0 bg-[#161a1e]/90 backdrop-blur-xl border-t border-gray-800 flex justify-around items-center py-4 md:hidden z-[80]">
            <NavLink to="/dashboard" className={({isActive})=> isActive ? "text-[#f0b90b]" : "text-gray-400"}><LayoutDashboard size={24}/></NavLink>
            <NavLink to="/market" className={({isActive})=> isActive ? "text-[#f0b90b]" : "text-gray-400"}><BarChart3 size={24}/></NavLink>
            <NavLink to="/copy-trade" className={({isActive})=> isActive ? "text-[#f0b90b]" : "text-gray-400"}><Zap size={24}/></NavLink>
            <NavLink to="/wallet" className={({isActive})=> isActive ? "text-[#f0b90b]" : "text-gray-400"}><Wallet size={24}/></NavLink>
            <button onClick={() => setShowMoreMenu(true)} className="text-gray-400"><LayoutGrid size={24}/></button>
          </nav>
        </>
      )}
    </div>
  );
};

// --- App Root ---
export default function App() {
  const [cryptoData, setCryptoData] = useState([
    { id: '1', name: 'BTC', symbol: 'btc', price: '0', change: '0', up: true },
    { id: '2', name: 'ETH', symbol: 'eth', price: '0', change: '0', up: true },
    { id: '3', name: 'SOL', symbol: 'sol', price: '0', change: '0', up: true },
    { id: '4', name: 'BNB', symbol: 'bnb', price: '0', change: '0', up: true }
  ]);

  const fetchCryptoPrices = async () => {
    try {
      const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT'];
      const requests = symbols.map(s => axios.get(`https://api.binance.com/api/v3/ticker/24hr?symbol=${s}`));
      const results = await Promise.all(requests);
      const newData = results.map((res, index) => ({
        id: (index + 1).toString(),
        name: res.data.symbol.replace('USDT', ''),
        symbol: res.data.symbol.replace('USDT', '').toLowerCase(),
        price: parseFloat(res.data.lastPrice).toLocaleString(undefined, { minimumFractionDigits: 2 }),
        change: parseFloat(res.data.priceChangePercent).toFixed(2),
        up: parseFloat(res.data.priceChangePercent) > 0
      }));
      setCryptoData(newData);
    } catch (err) { console.warn("Binance API Error"); }
  };

  useEffect(() => {
    fetchCryptoPrices();
    const interval = setInterval(fetchCryptoPrices, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <UserProvider>
      <BrowserRouter>
        <AppContent cryptoData={cryptoData} />
      </BrowserRouter>
    </UserProvider>
  );
}