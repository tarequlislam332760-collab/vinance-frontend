import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation, useNavigate, Link, Navigate, useParams } from 'react-router-dom';
import axios from 'axios'; 
import { 
  LayoutDashboard, BarChart3, TrendingUp, Wallet, LogOut, 
  ShieldCheck, Activity, ArrowUpRight, ArrowDownLeft,
  PieChart, ChevronLeft, Star, Bell, MoreHorizontal, LayoutGrid, Zap, ChevronDown
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

// --- Futures Component (Responsive Fix) ---
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
      {/* Top Header */}
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

      <div className="flex flex-col lg:flex-row flex-1 overflow-y-auto lg:overflow-hidden pb-20 lg:pb-0">
        {/* Left Side: Chart Area */}
        <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-gray-900 min-h-[350px] lg:h-full">
          <div className="flex justify-between items-center px-4 py-2 text-[10px] text-gray-400 border-b border-gray-900">
            <div className="flex gap-3 overflow-x-auto no-scrollbar">
               <span className="text-[#f0b90b]">Time</span>
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
               src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${currentCoin}USDT&interval=${timeframe}&theme=dark&style=1&hide_top_toolbar=true`} 
               className="absolute inset-0 w-full h-full border-none"
             ></iframe>
          </div>
        </div>

        {/* Right Side: Trade Panel & Order Book */}
        <div className="w-full lg:w-[380px] flex flex-row lg:flex-col bg-[#0b0e11]">
          {/* Order Placement */}
          <div className="w-1/2 lg:w-full p-4 space-y-4 border-r lg:border-r-0 border-gray-900">
            <div className="flex gap-2">
              <button className="flex-1 bg-[#2b3139] py-1.5 rounded text-[10px] font-bold">Cross</button>
              <button className="flex-1 bg-[#2b3139] py-1.5 rounded text-[10px] font-bold">{leverage}x</button>
            </div>
            <div className="flex bg-[#2b3139] rounded overflow-hidden p-0.5">
              <button onClick={() => setSide('buy')} className={`flex-1 py-1.5 text-[11px] font-bold rounded transition-all ${side === 'buy' ? 'bg-[#02c076] text-[#0b0e11]' : 'text-gray-400'}`}>Buy</button>
              <button onClick={() => setSide('sell')} className={`flex-1 py-1.5 text-[11px] font-bold rounded transition-all ${side === 'sell' ? 'bg-[#f6465d] text-white' : 'text-gray-400'}`}>Sell</button>
            </div>
            <div className="relative">
              <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-[#2b3139] rounded p-2.5 text-xs font-bold outline-none text-left" />
              <span className="absolute right-3 top-2.5 text-[10px] text-gray-500 uppercase">USDT</span>
            </div>
            <button onClick={handleTrade} className={`w-full py-3 rounded-lg font-bold text-sm transition-all active:scale-95 ${side === 'buy' ? 'bg-[#02c076] text-[#0b0e11]' : 'bg-[#f6465d] text-white'}`}>
              {loading ? "Processing..." : side === 'buy' ? "Open Long" : "Open Short"}
            </button>
          </div>

          {/* Order Book */}
          <div className="w-1/2 lg:w-full p-4 text-[10px] flex flex-col justify-center">
            <div className="flex justify-between text-gray-500 mb-2"><span>Price</span><span>Amount</span></div>
            <div className="space-y-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between"><span className="text-[#f6465d]">67845.5</span><span className="text-gray-300">1.2k</span></div>
              ))}
            </div>
            <div className="text-center py-2 border-y border-gray-900 my-2"><div className="text-[#02c076] text-sm font-bold">67,830.9</div></div>
            <div className="space-y-1">
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

// --- Updated Dashboard Grid ---
const Dashboard = ({ cryptoData }) => {
  const { user, refreshUser, API_URL, token } = useContext(UserContext);
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (refreshUser) refreshUser(); 
    const fetchTransactions = async () => {  
      if (!token) return;
      try {
        const res = await axios.get(`${API_URL}/api/transactions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTransactions(Array.isArray(res.data) ? res.data : (res.data.transactions || []));
      } catch (err) { console.warn("Activity fetching issue"); }
    };
    fetchTransactions();
  }, [token, API_URL, refreshUser]);

  return (
    <div className="p-4 md:p-8 space-y-6 bg-[#0b0e11] min-h-screen">
      {/* Balance Card */}
      <div className="bg-gradient-to-br from-[#1c2127] to-[#0b0e11] p-6 rounded-3xl border border-gray-800 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
        <div className="text-center md:text-left">
          <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold mb-1">Total Balance</p>
          <h1 className="text-3xl md:text-5xl font-mono font-black text-white">
            ${user?.balance !== undefined ? parseFloat(user.balance).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
          </h1>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={() => navigate('/deposit')} className="flex-1 bg-[#f0b90b] text-black px-6 py-3 rounded-2xl font-bold text-xs uppercase shadow-lg">Deposit</button>
          <button onClick={() => navigate('/withdraw')} className="flex-1 bg-gray-800 text-white px-6 py-3 rounded-2xl font-bold border border-gray-700 text-xs uppercase">Withdraw</button>
        </div>
      </div>

      {/* Responsive Crypto Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-2 gap-4">
          {cryptoData.map((coin) => (
            <div key={coin.id} onClick={() => navigate(`/trade/${coin.symbol}`)} className="bg-[#161a1e] p-5 rounded-2xl border border-gray-800 cursor-pointer hover:border-[#f0b90b]/50 transition-all">
              <div className="flex justify-between mb-4 text-[10px] font-bold">
                <span className="text-[#f0b90b]">{coin.symbol.toUpperCase()}/USDT</span>
                <span className={coin.up ? 'text-[#00c076]' : 'text-[#f6465d]'}>{coin.change}%</span>
              </div>
              <p className="text-xl font-bold text-white font-mono">${coin.price}</p>
            </div>
          ))}
        </div>

        {/* Activity Section */}
        <div className="bg-[#161a1e] border border-gray-800 rounded-3xl p-6">
          <h3 className="text-white font-bold text-xs mb-6 flex items-center gap-2 uppercase tracking-widest">
            <Activity size={14} className="text-[#f0b90b]" /> Recent Activity
          </h3>
          <div className="space-y-4">
            {transactions.slice(0, 5).map((trx) => (
              <div key={trx._id} className="flex justify-between items-center p-3 hover:bg-gray-800/50 rounded-xl transition-all">
                <div className="flex items-center gap-3">
                  <div className={trx.type === 'deposit' ? 'text-[#00c076]' : 'text-[#f6465d]'}>
                    {trx.type === 'deposit' ? <ArrowDownLeft size={16}/> : <ArrowUpRight size={16}/>}
                  </div>
                  <div>
                    <p className="font-bold text-[10px] text-white uppercase">{trx.type}</p>
                    <p className="text-[9px] text-gray-500">{new Date(trx.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-xs text-white">${trx.amount}</p>
                  <p className={`text-[9px] font-bold uppercase ${trx.status === 'completed' ? 'text-[#00c076]' : 'text-[#f0b90b]'}`}>{trx.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Other Components (Trade, Market, NavItem etc. remain similar but with mobile-first classes) ---
const Market = ({ cryptoData }) => {
  const navigate = useNavigate();
  return (
    <div className="p-4 md:p-10 pb-32 bg-[#0b0e11] min-h-screen">
      <div className="mb-8"><h2 className="text-3xl font-bold text-white flex items-center gap-3">Market <Activity className="text-[#f0b90b]" size={28} /></h2></div>
      <div className="bg-[#161a1e] rounded-3xl border border-gray-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead className="bg-[#0b0e11] text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              <tr><th className="p-5 text-left">Asset</th><th className="p-5 text-left">Price</th><th className="p-5 text-left">24h Change</th><th className="p-5 text-right">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {cryptoData.map((coin) => (
                <tr key={coin.id} className="hover:bg-white/[0.02]">
                  <td className="p-5 font-bold text-white text-sm">{coin.symbol.toUpperCase()}</td>
                  <td className="p-5 font-mono font-bold text-white">${coin.price}</td>
                  <td className={`p-5 font-mono font-bold ${coin.up ? 'text-[#00c076]' : 'text-[#f6465d]'}`}>{coin.change}%</td>
                  <td className="p-5 text-right"><button onClick={() => navigate(`/trade/${coin.symbol}`)} className="bg-[#f0b90b] text-black px-4 py-2 rounded-lg font-bold text-[10px] uppercase">Trade</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const NavItem = ({ to, icon, label }) => (
  <NavLink to={to} className={({ isActive }) => `flex items-center gap-4 p-4 rounded-xl transition-all ${isActive ? 'text-[#f0b90b] bg-[#f0b90b]/10 font-bold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
    {icon} <span className="hidden lg:inline text-xs uppercase tracking-widest">{label}</span>
  </NavLink>
);

// --- AppContent Wrapper (The Core Layout) ---
const AppContent = ({ cryptoData }) => {
  const { user, token, logout, loading: authLoading } = useContext(UserContext);
  const location = useLocation();

  if (authLoading) return <div className="min-h-screen bg-[#0b0e11] flex items-center justify-center text-[#f0b90b] font-black text-3xl animate-pulse">VINANCE</div>;
  
  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const isHomePage = location.pathname === '/';
  if (!token && !isAuthPage && !isHomePage) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white flex flex-col md:flex-row overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      {token && !isHomePage && (
        <aside className="w-20 lg:w-64 bg-[#161a1e] border-r border-gray-800 hidden md:flex flex-col p-4 h-screen sticky top-0 z-40">
          <div className="mb-10 px-4 py-2 text-2xl font-black text-[#f0b90b] italic uppercase tracking-tighter">VINANCE</div>
          <nav className="space-y-2 flex-1">
            <NavItem to="/dashboard" icon={<LayoutDashboard size={20}/>} label="Dashboard" />
            <NavItem to="/market" icon={<BarChart3 size={20}/>} label="Market" />
            <NavItem to={`/futures/${cryptoData[0]?.symbol || 'btc'}`} icon={<Zap size={20}/>} label="Futures" />
            <NavItem to={`/trade/${cryptoData[0]?.symbol || 'btc'}`} icon={<TrendingUp size={20}/>} label="Spot" />
            <NavItem to="/invest" icon={<PieChart size={20}/>} label="AI Invest" />
            <NavItem to="/wallet" icon={<Wallet size={20}/>} label="Wallet" />
            {user?.role === 'admin' && (
               <>
                 <div className="pt-6 pb-2 px-4 text-[9px] font-bold text-gray-600 uppercase tracking-widest border-t border-gray-800 mt-4">Admin</div>
                 <NavItem to="/admin" icon={<ShieldCheck size={20}/>} label="Users" />
                 <NavItem to="/admin/manage-plans" icon={<LayoutGrid size={20}/>} label="Plans" />
               </>
            )}
          </nav>
          <button onClick={logout} className="p-4 text-gray-500 hover:text-[#f6465d] flex items-center gap-4 border-t border-gray-800 transition-colors">
            <LogOut size={20}/> <span className="hidden lg:inline text-[10px] font-bold uppercase">Sign Out</span>
          </button>
        </aside>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {token && !isHomePage && (
          <header className="h-16 border-b border-gray-800 bg-[#161a1e]/90 flex items-center justify-between px-6 sticky top-0 z-30 backdrop-blur-md">
            <div className="font-bold text-[10px] uppercase text-gray-400">User: <span className="text-[#f0b90b] ml-1">{user?.name}</span></div>
            <NotificationSystem />
          </header>
        )}
        <div className={`flex-1 overflow-y-auto bg-[#0b0e11] ${token && !isHomePage ? 'pb-24 md:pb-0' : ''}`}>
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
          </Routes>
        </div>
      </main>

      {/* Mobile Bottom Navigation (Visible only on Mobile) */}
      {token && !isHomePage && (
        <nav className="fixed bottom-0 left-0 right-0 bg-[#161a1e]/95 backdrop-blur-lg border-t border-gray-800 flex justify-around items-center py-4 md:hidden z-50">
          <NavLink to="/dashboard" className={({isActive})=> isActive ? "text-[#f0b90b]" : "text-gray-500"}><LayoutDashboard size={24}/></NavLink>
          <NavLink to={`/futures/${cryptoData[0]?.symbol || 'btc'}`} className={({isActive})=> isActive ? "text-[#f0b90b]" : "text-gray-500"}><Zap size={24}/></NavLink>
          <NavLink to="/market" className={({isActive})=> isActive ? "text-[#f0b90b]" : "text-gray-500"}><BarChart3 size={24}/></NavLink>
          <NavLink to="/wallet" className={({isActive})=> isActive ? "text-[#f0b90b]" : "text-gray-500"}><Wallet size={24}/></NavLink>
          <button onClick={logout} className="text-gray-500"><LogOut size={24}/></button>
        </nav>
      )}
    </div>
  );
};

// --- Auth Components (Login/Register) & App Export ---
// (বাকি অংশ একই থাকবে, আমি উপরে শুধু Layout আর Futures পার্টটি পরিবর্তন করেছি)

const Register = () => {
  const { API_URL } = useContext(UserContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/register`, { ...formData, email: formData.email.toLowerCase() });
      alert("Registration Successful!");
      navigate('/login');
    } catch (err) { alert(err.response?.data?.message || "Error"); } 
    finally { setLoading(false); }
  };
  return (
    <div className="min-h-screen bg-[#0b0e11] flex items-center justify-center p-6 text-left">
      <div className="w-full max-w-md bg-[#161a1e] border border-gray-800 rounded-3xl p-8 shadow-2xl">
        <h1 className="text-3xl font-bold text-[#f0b90b] mb-6 italic uppercase tracking-tighter">VINANCE</h1>
        <form onSubmit={handleRegister} className="space-y-4">
          <input type="text" placeholder="Full Name" required onChange={(e)=>setFormData({...formData, name: e.target.value})} className="w-full bg-[#0b0e11] border border-gray-800 rounded-xl py-3 px-4 text-white outline-none focus:border-[#f0b90b]" />
          <input type="email" placeholder="Email" required onChange={(e)=>setFormData({...formData, email: e.target.value})} className="w-full bg-[#0b0e11] border border-gray-800 rounded-xl py-3 px-4 text-white outline-none focus:border-[#f0b90b]" />
          <input type="password" placeholder="Password" required onChange={(e)=>setFormData({...formData, password: e.target.value})} className="w-full bg-[#0b0e11] border border-gray-800 rounded-xl py-3 px-4 text-white outline-none focus:border-[#f0b90b]" />
          <button disabled={loading} className="w-full bg-[#f0b90b] text-black py-3.5 rounded-xl font-bold uppercase">{loading ? "Processing..." : "Register"}</button>
        </form>
        <p className="text-center mt-6 text-sm text-gray-500">Already have an account? <Link to="/login" className="text-[#f0b90b] hover:underline">Log In</Link></p>
      </div>
    </div>
  );
};

const Login = () => {
  const { setUser, setToken, refreshUser, API_URL } = useContext(UserContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/login`, { email: email.toLowerCase(), password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      if (refreshUser) await refreshUser(); 
      navigate('/dashboard');
    } catch (err) { alert(err.response?.data?.message || "Login Failed"); } 
    finally { setLoading(false); }
  };
  return (
    <div className="min-h-screen bg-[#0b0e11] flex items-center justify-center p-6 text-left">
      <div className="w-full max-w-md bg-[#161a1e] border border-gray-800 rounded-3xl p-8 shadow-2xl">
        <h1 className="text-3xl font-bold text-[#f0b90b] mb-6 italic uppercase tracking-tighter">VINANCE</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="Email" required onChange={(e)=>setEmail(e.target.value)} className="w-full bg-[#0b0e11] border border-gray-800 rounded-xl py-3 px-4 text-white outline-none focus:border-[#f0b90b]" />
          <input type="password" placeholder="Password" required onChange={(e)=>setPassword(e.target.value)} className="w-full bg-[#0b0e11] border border-gray-800 rounded-xl py-3 px-4 text-white outline-none focus:border-[#f0b90b]" />
          <button type="submit" disabled={loading} className="w-full bg-[#f0b90b] text-black py-3.5 rounded-xl font-bold uppercase">{loading ? "Logging in..." : "Log In"}</button>
        </form>
        <p className="text-center mt-6 text-sm text-gray-500">Don't have an account? <Link to="/register" className="text-[#f0b90b] hover:underline">Register</Link></p>
      </div>
    </div>
  );
};

const Trade = () => {
  const { coinSymbol } = useParams();
  const { user, refreshUser, API_URL, token } = useContext(UserContext);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('buy'); 
  const [timeframe, setTimeframe] = useState('240'); 

  const currentCoin = (coinSymbol || 'btc').toUpperCase();

  const handleTrade = async (type) => {
    if (!amount || parseFloat(amount) <= 0) return alert("অ্যামাউন্ট লিখুন");
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/trade`, 
        { type: type, amount: parseFloat(amount), symbol: currentCoin },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);
      if (refreshUser) await refreshUser(); 
      setAmount('');
    } catch (err) { 
      alert(err.response?.data?.message || "ট্রেড সফল হয়নি"); 
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0b0e11] text-[#eaecef] overflow-hidden">
      <div className="flex justify-between items-center px-4 py-2 bg-[#0b0e11]">
        <div className="flex items-center gap-3">
          <ChevronLeft size={24} className="text-gray-300 cursor-pointer" onClick={() => window.history.back()} />
          <div className="flex items-center gap-1">
            <span className="text-white font-bold text-lg">{currentCoin}/USDT</span>
            <span className="bg-[#2b3139] text-[9px] px-1 rounded text-gray-400 font-bold">Spot</span>
          </div>
        </div>
        <div className="flex gap-4 text-gray-400"><Star size={18} /><Bell size={18} /></div>
      </div>
      <div className="flex justify-between items-center px-4 py-2 text-[11px] text-gray-400 font-medium border-b border-gray-800">
        <div className="flex gap-4">
          <span className="text-[#f0b90b]">Time</span>
          {['15', '60', '240', 'D'].map((tf) => (
            <span key={tf} onClick={() => setTimeframe(tf)} className={`cursor-pointer ${timeframe === tf ? 'text-white border-b-2 border-[#f0b90b]' : ''}`}>
              {tf === '240' ? '4h' : tf === '60' ? '1h' : tf === '15' ? '15m' : tf}
            </span>
          ))}
        </div>
        <Activity size={14} />
      </div>
      <div className="flex-1 w-full relative">
        <iframe title="TV" src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${currentCoin}USDT&interval=${timeframe}&theme=dark&style=1&hide_top_toolbar=true`} className="absolute inset-0 w-full h-full border-none"></iframe>
      </div>
      <div className="w-full bg-[#161a1e] border-t border-gray-800 p-5 pb-24 md:pb-6">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between mb-3">
            <div className="flex gap-6 text-xs font-bold uppercase">
              <button onClick={() => setActiveTab('buy')} className={`pb-1 ${activeTab === 'buy' ? 'text-[#00c076] border-b-2 border-[#00c076]' : 'text-gray-500'}`}>Buy</button>
              <button onClick={() => setActiveTab('sell')} className={`pb-1 ${activeTab === 'sell' ? 'text-[#f6465d] border-b-2 border-[#f6465d]' : 'text-gray-500'}`}>Sell</button>
            </div>
            <div className="text-[10px] text-gray-400 uppercase">Avbl: <span className="text-white font-mono">{user?.balance?.toLocaleString() || '0.00'} USDT</span></div>
          </div>
          <div className="flex gap-3">
            <div className="flex-[1.2] relative">
              <input type="number" value={amount} onChange={(e)=>setAmount(e.target.value)} placeholder="0.00" className="w-full bg-[#2b3139] rounded-lg py-3 px-4 text-white outline-none text-sm font-bold" />
              <span className="absolute right-3 top-3 text-gray-500 text-[10px] font-bold">USDT</span>
            </div>
            <button onClick={() => handleTrade(activeTab)} className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all active:scale-95 ${activeTab === 'buy' ? 'bg-[#02c076] text-[#0b0e11]' : 'bg-[#f6465d] text-white'}`}>
              {loading ? '...' : activeTab === 'buy' ? 'Buy' : 'Sell'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

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