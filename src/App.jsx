import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation, useNavigate, Link, Navigate, useParams } from 'react-router-dom';
import axios from 'axios'; 
import { 
  LayoutDashboard, BarChart3, TrendingUp, Wallet, LogOut, 
  ShieldCheck, Activity, ArrowUpRight, ArrowDownLeft,
  PieChart, ChevronLeft, Star, Bell, MoreHorizontal, LayoutGrid, Zap, ChevronDown, Briefcase
} from 'lucide-react';

import { UserProvider, UserContext } from './context/UserContext'; 
import Home from './pages/Home'; 
import NotificationSystem from './components/NotificationSystem'; 
import AdminPanel from './admin/AdminPanel';
import Deposit from './pages/Deposit'; 
import Withdraw from './pages/Withdraw'; 
import WalletPage from './pages/Wallet';
import Investment from './pages/Investment'; 
import MyInvestments from './pages/MyInvestments';
import ManagePlans from './admin/ManagePlans';

// --- Futures Component (Modern & Fully Responsive) ---
const Futures = () => {
  const { coinSymbol } = useParams();
  const { user, refreshUser, API_URL, token } = useContext(UserContext);
  const [leverage, setLeverage] = useState(20);
  const [amount, setAmount] = useState('');
  const [side, setSide] = useState('buy'); 
  const [loading, setLoading] = useState(false);
  const [timeframe, setTimeframe] = useState('15');

  const currentCoin = (coinSymbol || 'BTC').toUpperCase();

  const handleTrade = async () => {
    if (!amount || parseFloat(amount) <= 0) return alert("অ্যামাউন্ট লিখুন");
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/futures/trade`, 
        { type: side, amount: parseFloat(amount), leverage: leverage, symbol: currentCoin },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);
      if (refreshUser) await refreshUser();
    } catch (err) { 
      alert(err.response?.data?.message || "ট্রেড সফল হয়নি"); 
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0b0e11] text-[#eaecef] overflow-hidden font-sans">
      {/* Mobile & Desktop Header */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-800 bg-[#0b0e11] sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <ChevronLeft size={22} className="text-gray-400 cursor-pointer" onClick={() => window.history.back()} />
          <h2 className="text-sm font-bold flex items-center gap-1 uppercase tracking-tighter">
            {currentCoin}/USDT <span className="text-[9px] bg-[#2b3139] px-1 rounded text-gray-400">Perp</span>
            <ChevronDown size={14} className="text-gray-500" />
          </h2>
        </div>
        <div className="flex gap-4 text-gray-400 items-center">
          <Star size={18} /> <Bell size={18} /> <MoreHorizontal size={18} />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Chart View */}
        <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-gray-900 min-h-[300px] md:min-h-[450px]">
          <div className="flex justify-between items-center px-4 py-1.5 text-[10px] text-gray-400 border-b border-gray-900">
            <div className="flex gap-3 overflow-x-auto no-scrollbar">
               <span className="text-[#f0b90b] font-bold">Time</span>
               {['15', '60', '240', 'D'].map(tf => (
                 <span key={tf} onClick={() => setTimeframe(tf)} className={`cursor-pointer ${timeframe === tf ? 'text-white font-bold' : ''}`}>
                   {tf === '240' ? '4h' : tf === '15' ? '15m' : tf}
                 </span>
               ))}
            </div>
            <Activity size={12} />
          </div>
          <div className="flex-1 relative bg-black">
             <iframe 
               title="Futures Chart" 
               src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${currentCoin}USDT&interval=${timeframe}&theme=dark&style=1`} 
               className="absolute inset-0 w-full h-full border-none"
             ></iframe>
          </div>
        </div>

        {/* Trading Sidebar */}
        <div className="w-full lg:w-[360px] flex flex-row lg:flex-col overflow-y-auto bg-[#0b0e11] pb-24 lg:pb-0">
          <div className="w-[55%] lg:w-full p-4 space-y-4 border-r lg:border-r-0 border-gray-900">
            <div className="flex gap-2">
              <button className="flex-1 bg-[#2b3139] py-1.5 rounded text-[10px] font-black uppercase">Cross</button>
              <button className="flex-1 bg-[#2b3139] py-1.5 rounded text-[10px] font-black uppercase">{leverage}x</button>
            </div>
            <div className="flex bg-[#2b3139] rounded overflow-hidden p-0.5">
              <button onClick={() => setSide('buy')} className={`flex-1 py-2 text-[11px] font-black uppercase transition-all rounded ${side === 'buy' ? 'bg-[#02c076] text-[#0b0e11]' : 'text-gray-400'}`}>Buy</button>
              <button onClick={() => setSide('sell')} className={`flex-1 py-2 text-[11px] font-black uppercase transition-all rounded ${side === 'sell' ? 'bg-[#f6465d] text-white' : 'text-gray-400'}`}>Sell</button>
            </div>
            <div className="relative">
              <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-[#2b3139] rounded-lg p-3 text-xs font-black outline-none text-center border border-transparent focus:border-[#f0b90b]" />
              <span className="absolute right-3 top-3.5 text-[10px] text-gray-500 font-bold">USDT</span>
            </div>
            <button onClick={handleTrade} className={`w-full py-4 rounded-xl font-black text-xs uppercase shadow-xl transition-all active:scale-95 ${side === 'buy' ? 'bg-[#02c076] text-[#0b0e11]' : 'bg-[#f6465d] text-white'}`}>
              {loading ? "..." : side === 'buy' ? "Open Long" : "Open Short"}
            </button>
          </div>
          
          {/* Order Book Side */}
          <div className="w-[45%] lg:w-full p-3 text-[9px] flex flex-col justify-center">
            <div className="flex justify-between text-gray-500 mb-2 px-1 font-bold"><span>Price</span><span>Qty</span></div>
            <div className="space-y-1 font-mono">
               <div className="flex justify-between px-1"><span className="text-[#f6465d]">67845.5</span><span className="text-gray-400">1.2k</span></div>
               <div className="text-center py-2 border-y border-gray-900 my-2"><div className="text-[#02c076] text-sm font-black italic">67,830.9</div></div>
               <div className="flex justify-between px-1"><span className="text-[#02c076]">67828.2</span><span className="text-gray-400">850</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- NavItem Helper ---
const NavItem = ({ to, icon, label }) => (
  <NavLink to={to} className={({ isActive }) => `flex items-center gap-4 p-4 rounded-2xl transition-all ${isActive ? 'text-[#f0b90b] bg-[#f0b90b]/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
    {icon} <span className="hidden lg:inline font-black text-[11px] uppercase tracking-widest">{label}</span>
  </NavLink>
);

// --- Content Wrapper with Auth & Layout Logic ---
const AppContent = ({ cryptoData }) => {
  const { user, token, logout, loading: authLoading } = useContext(UserContext);
  const location = useLocation();
  const navigate = useNavigate();

  if (authLoading) return <div className="min-h-screen bg-[#0b0e11] flex items-center justify-center text-[#f0b90b] font-black text-4xl animate-pulse italic">VINANCE</div>;

  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const isHomePage = location.pathname === '/';
  if (!token && !isAuthPage && !isHomePage) return <Navigate to="/login" replace />;

  const firstCoin = cryptoData[0]?.symbol || 'btc';

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white flex flex-col md:flex-row overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      {token && !isHomePage && (
        <aside className="w-20 lg:w-64 bg-[#161a1e] border-r border-[#1e2329] hidden md:flex flex-col p-4 h-screen sticky top-0 z-40">
          <div className="mb-12 px-4 py-2 text-2xl font-black text-[#f0b90b] italic uppercase tracking-tighter">VINANCE</div>
          <nav className="space-y-2 flex-1">
            <NavItem to="/dashboard" icon={<LayoutDashboard size={20}/>} label="Dashboard" />
            <NavItem to="/market" icon={<BarChart3 size={20}/>} label="Market" />
            <NavItem to={`/futures/${firstCoin}`} icon={<Zap size={20}/>} label="Futures" />
            <NavItem to={`/trade/${firstCoin}`} icon={<TrendingUp size={20}/>} label="Spot" />
            <NavItem to="/invest" icon={<Briefcase size={20}/>} label="AI Invest" />
            <NavItem to="/wallet" icon={<Wallet size={20}/>} label="Wallet" />
            {user?.role === 'admin' && (
               <div className="pt-6 border-t border-[#1e2329] mt-4">
                 <NavItem to="/admin" icon={<ShieldCheck size={20}/>} label="Admin Panel" />
               </div>
            )}
          </nav>
          <button onClick={logout} className="p-4 text-gray-500 hover:text-[#f6465d] flex items-center gap-4 font-black border-t border-[#1e2329]">
            <LogOut size={20}/> <span className="hidden lg:inline text-[10px] uppercase">Sign Out</span>
          </button>
        </aside>
      )}

      {/* Main Container */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {token && !isHomePage && !location.pathname.includes('/futures/') && (
          <header className="h-16 border-b border-[#1e2329] bg-[#161a1e] flex items-center justify-between px-6 sticky top-0 z-30 shadow-md">
            <div className="font-black text-[10px] uppercase text-gray-400 tracking-widest">
              Welcome, <span className="text-[#f0b90b] ml-1">{user?.name}</span>
            </div>
            <NotificationSystem />
          </header>
        )}

        <div className={`flex-1 overflow-y-auto bg-[#0b0e11] ${token && !isHomePage ? 'pb-24 md:pb-6' : ''}`}>
          <Routes>
            <Route path="/" element={<Home />} />
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* App Routes */}
            <Route path="/dashboard" element={<Dashboard cryptoData={cryptoData} />} />
            <Route path="/market" element={<Market cryptoData={cryptoData} />} />
            <Route path="/trade/:coinSymbol" element={<Trade />} /> 
            <Route path="/futures/:coinSymbol" element={<Futures />} /> 
            <Route path="/deposit" element={<Deposit />} />
            <Route path="/withdraw" element={<Withdraw />} />
            <Route path="/wallet" element={<WalletPage />} /> 
            <Route path="/invest" element={<Investment />} />
            <Route path="/my-investments" element={<MyInvestments />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/dashboard" />} />
            <Route path="/admin/manage-plans" element={user?.role === 'admin' ? <ManagePlans /> : <Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </main>

      {/* MOBILE TAB BAR (STABLE) */}
      {token && !isHomePage && (
        <nav className="fixed bottom-0 left-0 right-0 bg-[#161a1e]/95 backdrop-blur-xl border-t border-[#1e2329] flex justify-around items-center py-4 md:hidden z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
          <NavLink to="/dashboard" className={({isActive})=> `flex flex-col items-center gap-1 ${isActive ? "text-[#f0b90b]" : "text-gray-500"}`}>
            <LayoutDashboard size={22}/>
            <span className="text-[8px] font-black uppercase">Home</span>
          </NavLink>
          <NavLink to="/market" className={({isActive})=> `flex flex-col items-center gap-1 ${isActive ? "text-[#f0b90b]" : "text-gray-500"}`}>
            <BarChart3 size={22}/>
            <span className="text-[8px] font-black uppercase">Market</span>
          </NavLink>
          <NavLink to={`/futures/${firstCoin}`} className={({isActive})=> `flex flex-col items-center gap-1 ${isActive ? "text-[#f0b90b]" : "text-gray-500"}`}>
            <Zap size={22}/>
            <span className="text-[8px] font-black uppercase">Futures</span>
          </NavLink>
          <NavLink to="/invest" className={({isActive})=> `flex flex-col items-center gap-1 ${isActive ? "text-[#f0b90b]" : "text-gray-500"}`}>
            <Briefcase size={22}/>
            <span className="text-[8px] font-black uppercase">Invest</span>
          </NavLink>
          <NavLink to="/wallet" className={({isActive})=> `flex flex-col items-center gap-1 ${isActive ? "text-[#f0b90b]" : "text-gray-500"}`}>
            <Wallet size={22}/>
            <span className="text-[8px] font-black uppercase">Wallet</span>
          </NavLink>
        </nav>
      )}
    </div>
  );
};

// --- Main App Entry ---
export default function App() {
  const [cryptoData, setCryptoData] = useState([
    { id: '1', name: 'Bitcoin', symbol: 'btc', price: '0', change: '0', up: true },
    { id: '2', name: 'Ethereum', symbol: 'eth', price: '0', change: '0', up: true },
    { id: '3', name: 'Solana', symbol: 'sol', price: '0', change: '0', up: true },
    { id: '4', name: 'BNB', symbol: 'bnb', price: '0', change: '0', up: true }
  ]);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await axios.get('https://api.binance.com/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT","SOLUSDT","BNBUSDT"]');
        const newData = res.data.map((item, index) => ({
          id: String(index + 1),
          name: item.symbol.replace('USDT', ''),
          symbol: item.symbol.replace('USDT', '').toLowerCase(),
          price: parseFloat(item.lastPrice).toLocaleString(undefined, { minimumFractionDigits: 2 }),
          change: parseFloat(item.priceChangePercent).toFixed(2),
          up: parseFloat(item.priceChangePercent) > 0
        }));
        setCryptoData(newData);
      } catch (e) { console.warn("Binance API Connect Issue"); }
    };
    fetchPrices();
    const timer = setInterval(fetchPrices, 15000);
    return () => clearInterval(timer);
  }, []);

  return (
    <UserProvider>
      <BrowserRouter><AppContent cryptoData={cryptoData} /></BrowserRouter>
    </UserProvider>
  );
}