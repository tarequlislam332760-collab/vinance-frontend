import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation, useNavigate, Link, Navigate, useParams } from 'react-router-dom';
import axios from 'axios'; 
import { 
  LayoutDashboard, BarChart3, TrendingUp, Wallet, LogOut, 
  ShieldCheck, Activity, ArrowUpRight, ArrowDownLeft,
  PieChart, ChevronLeft, Star, Bell, MoreHorizontal, LayoutGrid, Zap, ChevronDown, ListIcon, Settings
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

// --- NEW: Investment Logs (Admin) ---
const InvestmentLogs = () => {
  const { API_URL, token } = useContext(UserContext);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/admin/investment-logs`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLogs(res.data);
      } catch (err) { console.error("Logs fetch error", err); }
      finally { setLoading(false); }
    };
    fetchLogs();
  }, [API_URL, token]);

  return (
    <div className="p-4 md:p-8 bg-[#0b0e11] min-h-screen text-left">
      <h2 className="text-xl font-bold text-[#f0b90b] mb-6 flex items-center gap-2 uppercase tracking-tighter">
        <ListIcon size={20} /> Investment Logs
      </h2>
      <div className="bg-[#161a1e] rounded-2xl border border-[#1e2329] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#0b0e11] text-gray-500 text-[10px] uppercase font-black tracking-widest">
              <tr>
                <th className="p-4 text-left">User</th>
                <th className="p-4 text-left">Plan</th>
                <th className="p-4 text-left">Amount</th>
                <th className="p-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2329]">
              {loading ? (
                <tr><td colSpan="4" className="p-10 text-center text-gray-500">Loading Logs...</td></tr>
              ) : logs.map((log) => (
                <tr key={log._id} className="hover:bg-white/[0.02]">
                  <td className="p-4 text-white font-bold">{log.userName || 'User'}</td>
                  <td className="p-4 text-gray-400">{log.planName}</td>
                  <td className="p-4 text-[#00c076] font-mono">${log.amount}</td>
                  <td className="p-4 uppercase text-[10px] font-black text-[#f0b90b]">{log.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

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
          <Star size={18} />
          <Bell size={18} />
          <MoreHorizontal size={18} />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-gray-900 min-h-[250px] md:min-h-[400px]">
          <div className="flex justify-between items-center px-4 py-1.5 text-[10px] text-gray-400 border-b border-gray-900">
            <div className="flex gap-3 overflow-x-auto no-scrollbar">
               <span className="text-[#f0b90b]">Time</span>
               {['15', '60', '240', 'D'].map(tf => (
                 <span key={tf} onClick={() => setTimeframe(tf)} className={`cursor-pointer ${timeframe === tf ? 'text-white' : ''}`}>
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

        <div className="w-full lg:w-[380px] flex flex-row lg:flex-col overflow-y-auto bg-[#0b0e11] pb-20 lg:pb-0">
          <div className="w-[55%] lg:w-full p-3 space-y-3 border-r lg:border-r-0 border-gray-900">
            <div className="flex gap-2">
              <button className="flex-1 bg-[#2b3139] py-1 rounded text-[10px] font-bold">Cross</button>
              <button className="flex-1 bg-[#2b3139] py-1 rounded text-[10px] font-bold">{leverage}x</button>
            </div>
            <div className="flex bg-[#2b3139] rounded overflow-hidden">
              <button onClick={() => setSide('buy')} className={`flex-1 py-1.5 text-[11px] font-bold transition-all ${side === 'buy' ? 'bg-[#02c076] text-[#0b0e11]' : 'text-gray-400'}`}>Buy</button>
              <button onClick={() => setSide('sell')} className={`flex-1 py-1.5 text-[11px] font-bold transition-all ${side === 'sell' ? 'bg-[#f6465d] text-white' : 'text-gray-400'}`}>Sell</button>
            </div>
            <div className="relative">
              <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-[#2b3139] rounded p-2 text-xs font-bold outline-none text-center" />
              <span className="absolute right-2 top-2 text-[10px] text-gray-500 uppercase">USDT</span>
            </div>
            <div className="flex justify-between px-1 relative items-center py-2 h-4">
               <div className="h-[1px] bg-gray-800 absolute w-full left-0 z-0"></div>
               {[0, 25, 50, 75, 100].map(dot => (
                 <div key={dot} className="w-1.5 h-1.5 rounded-full border border-gray-700 bg-[#0b0e11] z-10"></div>
               ))}
            </div>
            <button onClick={handleTrade} className={`w-full py-2.5 rounded font-bold text-xs transition-all active:scale-95 ${side === 'buy' ? 'bg-[#02c076] text-[#0b0e11]' : 'bg-[#f6465d] text-white'}`}>
              {loading ? "..." : side === 'buy' ? "Open Long" : "Open Short"}
            </button>
          </div>
          <div className="w-[45%] lg:w-full p-2 text-[9px] flex flex-col">
            <div className="flex justify-between text-gray-500 mb-1"><span>Price</span><span>Amount</span></div>
            <div className="space-y-0.5 mb-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between"><span className="text-[#f6465d]">67845.5</span><span className="text-gray-300">1.2k</span></div>
              ))}
            </div>
            <div className="text-center py-1 border-y border-gray-900 my-1"><div className="text-[#02c076] text-sm font-bold">67,830.9</div></div>
            <div className="space-y-0.5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between"><span className="text-[#02c076]">67828.2</span><span className="text-gray-300">850</span></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- App Content Wrapper (Admin Links Added) ---
const AppContent = ({ cryptoData }) => {
  const { user, token, logout, loading: authLoading } = useContext(UserContext);
  const location = useLocation();
  if (authLoading) return <div className="min-h-screen bg-[#0b0e11] flex items-center justify-center text-[#f0b90b] font-black text-4xl uppercase animate-pulse italic">VINANCE</div>;
  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const isHomePage = location.pathname === '/';
  if (!token && !isAuthPage && !isHomePage) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white flex flex-col md:flex-row overflow-hidden text-left font-sans">
      {token && !isHomePage && (
        <aside className="w-20 lg:w-64 bg-[#161a1e] border-r border-[#1e2329] hidden md:flex flex-col p-4 h-screen sticky top-0 z-40">
          <div className="mb-12 px-4 py-2 text-2xl font-black text-[#f0b90b] italic uppercase tracking-tighter">VINANCE</div>
          <nav className="space-y-3 flex-1 overflow-y-auto">
            <NavItem to="/dashboard" icon={<LayoutDashboard size={20}/>} label="Dashboard" />
            <NavItem to="/market" icon={<BarChart3 size={20}/>} label="Market" />
            <NavItem to={`/futures/${cryptoData[0]?.symbol || 'btc'}`} icon={<Zap size={20}/>} label="Futures" />
            <NavItem to={`/trade/${cryptoData[0]?.symbol || 'btc'}`} icon={<TrendingUp size={20}/>} label="Spot" />
            <NavItem to="/invest" icon={<PieChart size={20}/>} label="AI Invest" />
            <NavItem to="/wallet" icon={<Wallet size={20}/>} label="Wallet" />
            {user?.role === 'admin' && (
               <>
                 <div className="pt-6 pb-2 px-4 text-[9px] font-black text-gray-600 uppercase tracking-widest border-t border-[#1e2329] mt-4">Admin Panel</div>
                 <NavItem to="/admin" icon={<ShieldCheck size={20}/>} label="Users" />
                 <NavItem to="/admin/manage-plans" icon={<PieChart size={20}/>} label="Plans" />
                 <NavItem to="/admin/investment-logs" icon={<ListIcon size={20}/>} label="Logs" />
               </>
            )}
          </nav>
          <button onClick={logout} className="p-4 text-gray-500 hover:text-[#f6465d] flex items-center gap-4 font-bold border-t border-[#1e2329]">
            <LogOut size={20}/> <span className="hidden lg:inline text-[10px] font-black uppercase">Sign Out</span>
          </button>
        </aside>
      )}

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {token && !isHomePage && (
          <header className="h-16 border-b border-[#1e2329] bg-[#161a1e]/80 flex items-center justify-between px-6 sticky top-0 z-30 backdrop-blur-md">
            <div className="font-black text-[9px] uppercase tracking-[0.2em]">User: <span className="text-[#f0b90b] ml-1">{user?.name}</span></div>
            <NotificationSystem />
          </header>
        )}
        <div className={`flex-1 overflow-y-auto bg-[#0b0e11] ${token && !isHomePage ? 'pb-24 md:pb-8' : ''}`}>
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

      {/* --- Mobile Navigation --- */}
      {token && !isHomePage && (
        <nav className="fixed bottom-0 left-0 right-0 bg-[#161a1e]/95 backdrop-blur-md border-t border-[#1e2329] flex justify-around items-center py-4 md:hidden z-50 shadow-t-xl">
          <NavLink to="/dashboard" className={({isActive})=> isActive ? "text-[#f0b90b]" : "text-gray-400"}><LayoutDashboard size={22}/></NavLink>
          <NavLink to={`/futures/${cryptoData[0]?.symbol || 'btc'}`} className={({isActive})=> isActive ? "text-[#f0b90b]" : "text-gray-400"}><Zap size={22}/></NavLink>
          <NavLink to={`/trade/${cryptoData[0]?.symbol || 'btc'}`} className={({isActive})=> isActive ? "text-[#f0b90b]" : "text-gray-400"}><TrendingUp size={22}/></NavLink>
          <NavLink to="/wallet" className={({isActive})=> isActive ? "text-[#f0b90b]" : "text-gray-400"}><Wallet size={22}/></NavLink>
          {user?.role === 'admin' ? (
            <NavLink to="/admin" className={({isActive})=> isActive ? "text-[#f0b90b]" : "text-gray-400"}><Settings size={22}/></NavLink>
          ) : (
            <button onClick={logout} className="text-gray-400"><LogOut size={22}/></button>
          )}
        </nav>
      )}
    </div>
  );
};

const NavItem = ({ to, icon, label }) => (
  <NavLink to={to} className={({ isActive }) => `flex items-center gap-4 p-3.5 rounded-xl transition-all ${isActive ? 'text-[#f0b90b] bg-[#f0b90b]/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
    {icon} <span className="hidden lg:inline font-black text-xs uppercase tracking-widest">{label}</span>
  </NavLink>
);

// --- Export App with Provider ---
export default function App() {
  const [cryptoData, setCryptoData] = useState([
    { id: '1', name: 'Bitcoin', symbol: 'btc', price: '0', change: '0', up: true },
    { id: '2', name: 'Ethereum', symbol: 'eth', price: '0', change: '0', up: true },
    { id: '3', name: 'Solana', symbol: 'sol', price: '0', change: '0', up: true },
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
      <BrowserRouter><AppContent cryptoData={cryptoData} /></BrowserRouter>
    </UserProvider>
  );
}