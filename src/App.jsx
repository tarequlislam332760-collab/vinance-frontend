import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation, useNavigate, Link, Navigate, useParams } from 'react-router-dom';
import axios from 'axios'; 
import { 
  LayoutDashboard, BarChart3, TrendingUp, Wallet, LogOut, 
  ShieldCheck, Activity, ArrowUpRight, ArrowDownLeft,
  PieChart, ChevronLeft, Star, Bell, MoreHorizontal, LayoutGrid, Zap, ChevronDown, History
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
import InvestmentLogs from './admin/InvestmentLogs';

// --- Futures Component ---
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
    if (!amount || parseFloat(amount) <= 0) return alert("Enter amount");
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/futures/trade`, 
        { type: side, amount: parseFloat(amount), leverage: leverage, symbol: currentCoin },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);
      if (refreshUser) await refreshUser();
    } catch (err) { 
      alert(err.response?.data?.message || "Futures trade failed"); 
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0b0e11] text-[#eaecef] overflow-hidden font-sans">
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-800 bg-[#0b0e11] sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <ChevronLeft size={22} className="text-gray-400 cursor-pointer" onClick={() => window.history.back()} />
          <h2 className="text-sm md:text-lg font-bold flex items-center gap-1">
            {currentCoin}/USDT <span className="text-[10px] bg-[#2b3139] px-1 rounded text-gray-400">Perp</span>
            <ChevronDown size={14} className="text-gray-500" />
          </h2>
        </div>
        <div className="flex gap-4 text-gray-400 items-center">
          <Star size={18} /><Bell size={18} /><MoreHorizontal size={18} />
        </div>
      </div>
      <div className="flex-1 relative bg-black">
         <iframe title="Futures Chart" src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${currentCoin}USDT&interval=${timeframe}&theme=dark&style=1`} className="absolute inset-0 w-full h-full border-none"></iframe>
      </div>
      <div className="w-full bg-[#161a1e] p-4 pb-20 md:pb-6 border-t border-gray-900">
          <div className="flex gap-2 mb-3">
             <button onClick={() => setSide('buy')} className={`flex-1 py-2 rounded font-bold text-xs ${side === 'buy' ? 'bg-[#02c076] text-black' : 'bg-gray-800 text-gray-400'}`}>Buy</button>
             <button onClick={() => setSide('sell')} className={`flex-1 py-2 rounded font-bold text-xs ${side === 'sell' ? 'bg-[#f6465d] text-white' : 'bg-gray-800 text-gray-400'}`}>Sell</button>
          </div>
          <div className="flex gap-2">
             <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="flex-1 bg-[#2b3139] rounded p-2 text-xs outline-none" />
             <button onClick={handleTrade} className={`px-6 py-2 rounded font-bold text-xs ${side === 'buy' ? 'bg-[#02c076] text-black' : 'bg-[#f6465d] text-white'}`}>{loading ? '...' : 'Trade'}</button>
          </div>
      </div>
    </div>
  );
};

// --- Trade Component ---
const Trade = () => {
  const { coinSymbol } = useParams();
  const { user, refreshUser, API_URL, token } = useContext(UserContext);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const activeTab = 'buy'; 
  const currentCoin = (coinSymbol || 'btc').toUpperCase();

  const handleTrade = async (type) => {
    if (!amount || parseFloat(amount) <= 0) return alert("অ্যামাউন্ট লিখুন");
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/trade`, { type, amount: parseFloat(amount), symbol: currentCoin }, { headers: { Authorization: `Bearer ${token}` } });
      alert(res.data.message);
      if (refreshUser) await refreshUser(); 
      setAmount('');
    } catch (err) { alert("ট্রেড সফল হয়নি"); } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0b0e11] text-[#eaecef] overflow-hidden">
      <div className="flex justify-between items-center px-4 py-2 border-b border-gray-800"><ChevronLeft onClick={() => window.history.back()} /><span className="font-bold">{currentCoin}/USDT</span><Activity size={18} /></div>
      <div className="flex-1 w-full relative">
        <iframe title="TV" src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${currentCoin}USDT&interval=240&theme=dark&style=1`} className="absolute inset-0 w-full h-full border-none"></iframe>
      </div>
      <div className="p-4 pb-24 bg-[#161a1e] border-t border-gray-800">
        <div className="flex gap-3 max-w-md mx-auto">
          <input type="number" value={amount} onChange={(e)=>setAmount(e.target.value)} placeholder="0.00" className="flex-1 bg-[#2b3139] rounded py-2 px-3 text-sm outline-none" />
          <button onClick={() => handleTrade('buy')} className="bg-[#02c076] text-black px-8 py-2 rounded font-bold">{loading ? '...' : 'Buy'}</button>
        </div>
      </div>
    </div>
  );
};

// --- NavItem Component ---
const NavItem = ({ to, icon, label }) => (
  <NavLink to={to} className={({ isActive }) => `flex items-center gap-4 p-3.5 rounded-xl transition-all ${isActive ? 'text-[#f0b90b] bg-[#f0b90b]/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
    {icon} <span className="hidden lg:inline font-black text-[10px] uppercase tracking-widest">{label}</span>
  </NavLink>
);

// --- App Content ---
const AppContent = ({ cryptoData }) => {
  const { user, token, logout, loading: authLoading } = useContext(UserContext);
  const location = useLocation();
  if (authLoading) return <div className="min-h-screen bg-[#0b0e11] flex items-center justify-center text-[#f0b90b] font-black text-3xl animate-pulse italic">VINANCE</div>;

  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const isHomePage = location.pathname === '/';
  if (!token && !isAuthPage && !isHomePage) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white flex flex-col md:flex-row overflow-hidden text-left font-sans">
      {token && !isHomePage && (
        <aside className="w-20 lg:w-64 bg-[#161a1e] border-r border-[#1e2329] hidden md:flex flex-col p-4 h-screen sticky top-0 z-40">
          <div className="mb-12 px-4 py-2 text-2xl font-black text-[#f0b90b] italic uppercase">VINANCE</div>
          <nav className="space-y-2 flex-1">
            <NavItem to="/dashboard" icon={<LayoutDashboard size={20}/>} label="Dashboard" />
            <NavItem to="/market" icon={<BarChart3 size={20}/>} label="Market" />
            <NavItem to={`/futures/${cryptoData[0]?.symbol || 'btc'}`} icon={<Zap size={20}/>} label="Futures" />
            <NavItem to="/invest" icon={<PieChart size={20}/>} label="AI Invest" />
            <NavItem to="/my-investments" icon={<History size={20}/>} label="Invest Logs" />
            <NavItem to="/wallet" icon={<Wallet size={20}/>} label="Wallet" />
            {user?.role === 'admin' && (
               <>
                 <div className="pt-4 pb-2 px-4 text-[9px] font-black text-gray-600 uppercase border-t border-gray-800">Admin</div>
                 <NavItem to="/admin" icon={<ShieldCheck size={20}/>} label="Users" />
                 <NavItem to="/admin/manage-plans" icon={<LayoutGrid size={20}/>} label="Plans" />
                 <NavItem to="/admin/investment-logs" icon={<History size={20}/>} label="All Logs" />
               </>
            )}
          </nav>
          <button onClick={logout} className="p-4 text-gray-500 hover:text-red-500 flex items-center gap-4 font-bold border-t border-gray-800">
            <LogOut size={20}/> <span className="hidden lg:inline text-[10px] font-black uppercase">Sign Out</span>
          </button>
        </aside>
      )}

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {token && !isHomePage && (
          <header className="h-14 border-b border-[#1e2329] bg-[#161a1e] flex items-center justify-between px-6 sticky top-0 z-30">
            <div className="font-black text-[9px] uppercase tracking-widest text-[#f0b90b]">Hi, {user?.name}</div>
            <NotificationSystem />
          </header>
        )}
        <div className={`flex-1 overflow-y-auto ${token && !isHomePage ? 'pb-24' : ''}`}>
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
            <Route path="/admin" element={user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/dashboard" />} />
            <Route path="/admin/manage-plans" element={user?.role === 'admin' ? <ManagePlans /> : <Navigate to="/dashboard" />} />
            <Route path="/admin/investment-logs" element={user?.role === 'admin' ? <InvestmentLogs /> : <Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </main>

      {token && !isHomePage && (
        <nav className="fixed bottom-0 left-0 right-0 bg-[#161a1e] border-t border-gray-800 flex justify-around items-center py-4 md:hidden z-50">
          <NavLink to="/dashboard" className={({isActive})=> isActive ? "text-[#f0b90b]" : "text-gray-400"}><LayoutDashboard size={22}/></NavLink>
          <NavLink to="/invest" className={({isActive})=> isActive ? "text-[#f0b90b]" : "text-gray-400"}><PieChart size={22}/></NavLink>
          <NavLink to={`/trade/${cryptoData[0]?.symbol || 'btc'}`} className={({isActive})=> isActive ? "text-[#f0b90b]" : "text-gray-400"}><TrendingUp size={22}/></NavLink>
          <NavLink to="/my-investments" className={({isActive})=> isActive ? "text-[#f0b90b]" : "text-gray-400"}><History size={22}/></NavLink>
          <NavLink to="/wallet" className={({isActive})=> isActive ? "text-[#f0b90b]" : "text-gray-400"}><Wallet size={22}/></NavLink>
        </nav>
      )}
    </div>
  );
};

// --- App Component ---
export default function App() {
  const [cryptoData, setCryptoData] = useState([
    { id: '1', name: 'Bitcoin', symbol: 'btc', price: '0', change: '0', up: true },
    { id: '2', name: 'Ethereum', symbol: 'eth', price: '0', change: '0', up: true }
  ]);

  const fetchCryptoPrices = async () => {
    try {
      const symbols = ['BTCUSDT', 'ETHUSDT'];
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
    } catch (err) { console.warn("API Error"); }
  };

  useEffect(() => {
    fetchCryptoPrices();
    const interval = setInterval(fetchCryptoPrices, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <UserProvider>
      <BrowserRouter><AppContent cryptoData={cryptoData} /></BrowserRouter>
    </UserProvider>
  );
}