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

// --- AUTH COMPONENTS ---
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
    <div className="min-h-screen bg-[#0b0e11] flex items-center justify-center p-6 text-left font-sans">
      <div className="w-full max-w-md bg-[#161a1e] border border-[#1e2329] rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
        <h1 className="text-3xl font-black text-[#f0b90b] mb-8 italic uppercase tracking-tighter">VINANCE</h1>
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] text-gray-500 uppercase font-black ml-1">Email Address</label>
            <input type="email" placeholder="name@example.com" required onChange={(e)=>setEmail(e.target.value)} className="w-full bg-[#0b0e11] border border-[#1e2329] rounded-2xl py-4 px-5 text-white outline-none focus:border-[#f0b90b] transition-all" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-gray-500 uppercase font-black ml-1">Password</label>
            <input type="password" placeholder="••••••••" required onChange={(e)=>setPassword(e.target.value)} className="w-full bg-[#0b0e11] border border-[#1e2329] rounded-2xl py-4 px-5 text-white outline-none focus:border-[#f0b90b] transition-all" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-[#f0b90b] hover:bg-[#d4a30a] text-black py-4 rounded-2xl font-black uppercase text-sm tracking-widest transition-all shadow-lg active:scale-95 mt-4">
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>
        <p className="text-center mt-8 text-xs text-gray-500 font-bold uppercase tracking-widest">
          New here? <Link to="/register" className="text-[#f0b90b] hover:underline">Create Account</Link>
        </p>
      </div>
    </div>
  );
};

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
      alert("Account Created!");
      navigate('/login');
    } catch (err) { alert(err.response?.data?.message || "Error"); } 
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0b0e11] flex items-center justify-center p-6 text-left font-sans">
      <div className="w-full max-w-md bg-[#161a1e] border border-[#1e2329] rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
        <h1 className="text-3xl font-black text-[#f0b90b] mb-8 italic uppercase tracking-tighter">VINANCE</h1>
        <form onSubmit={handleRegister} className="space-y-4">
          <input type="text" placeholder="Full Name" required onChange={(e)=>setFormData({...formData, name: e.target.value})} className="w-full bg-[#0b0e11] border border-[#1e2329] rounded-2xl py-4 px-5 text-white outline-none focus:border-[#f0b90b]" />
          <input type="email" placeholder="Email" required onChange={(e)=>setFormData({...formData, email: e.target.value})} className="w-full bg-[#0b0e11] border border-[#1e2329] rounded-2xl py-4 px-5 text-white outline-none focus:border-[#f0b90b]" />
          <input type="password" placeholder="Password" required onChange={(e)=>setFormData({...formData, password: e.target.value})} className="w-full bg-[#0b0e11] border border-[#1e2329] rounded-2xl py-4 px-5 text-white outline-none focus:border-[#f0b90b]" />
          <button disabled={loading} className="w-full bg-[#f0b90b] text-black py-4 rounded-2xl font-black uppercase text-sm tracking-widest shadow-lg mt-4 transition-all active:scale-95">
            {loading ? "Processing..." : "Create Account"}
          </button>
        </form>
        <p className="text-center mt-8 text-xs text-gray-500 font-bold uppercase tracking-widest">
          Already have an account? <Link to="/login" className="text-[#f0b90b] hover:underline">Log In</Link>
        </p>
      </div>
    </div>
  );
};

// --- FUTURES COMPONENT (Ultra Responsive) ---
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
    if (!amount || parseFloat(amount) <= 0) return alert("Enter Amount");
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/futures/trade`, 
        { type: side, amount: parseFloat(amount), leverage: leverage, symbol: currentCoin },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);
      if (refreshUser) await refreshUser();
    } catch (err) { 
      alert(err.response?.data?.message || "Trade Failed"); 
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0b0e11] text-[#eaecef] overflow-hidden">
      <header className="flex justify-between items-center px-4 py-3 border-b border-gray-900 bg-[#0b0e11] sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <ChevronLeft size={22} className="text-gray-400 cursor-pointer hover:text-white" onClick={() => window.history.back()} />
          <h2 className="text-sm font-black flex items-center gap-1 uppercase tracking-tighter">
            {currentCoin}/USDT <span className="text-[9px] bg-[#2b3139] px-1.5 py-0.5 rounded text-gray-400">Perp</span>
            <ChevronDown size={14} className="text-gray-500" />
          </h2>
        </div>
        <div className="flex gap-4 text-gray-500">
          <Star size={18} /> <Bell size={18} /> <MoreHorizontal size={18} />
        </div>
      </header>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Chart Section */}
        <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-gray-900 h-[45vh] lg:h-auto">
          <div className="flex justify-between items-center px-4 py-2 text-[10px] text-gray-500 border-b border-gray-900 bg-[#0b0e11]">
            <div className="flex gap-4 overflow-x-auto no-scrollbar font-bold">
               <span className="text-[#f0b90b]">Time</span>
               {['15', '60', '240', 'D'].map(tf => (
                 <span key={tf} onClick={() => setTimeframe(tf)} className={`cursor-pointer hover:text-white ${timeframe === tf ? 'text-white underline underline-offset-4' : ''}`}>
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

        {/* Trade Sidebar */}
        <div className="w-full lg:w-[360px] flex flex-row lg:flex-col bg-[#0b0e11] overflow-hidden">
          {/* Controls */}
          <div className="w-full p-4 space-y-4 border-r lg:border-r-0 border-gray-900 overflow-y-auto pb-32 lg:pb-6">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#2b3139] py-2 rounded text-center text-[10px] font-black uppercase tracking-widest text-gray-300">Cross</div>
              <div className="bg-[#2b3139] py-2 rounded text-center text-[10px] font-black uppercase tracking-widest text-[#f0b90b]">{leverage}x</div>
            </div>
            
            <div className="flex bg-[#1e2329] rounded-xl overflow-hidden p-1">
              <button onClick={() => setSide('buy')} className={`flex-1 py-2.5 text-xs font-black uppercase transition-all rounded-lg ${side === 'buy' ? 'bg-[#02c076] text-[#0b0e11]' : 'text-gray-500 hover:text-white'}`}>Buy</button>
              <button onClick={() => setSide('sell')} className={`flex-1 py-2.5 text-xs font-black uppercase transition-all rounded-lg ${side === 'sell' ? 'bg-[#f6465d] text-white' : 'text-gray-500 hover:text-white'}`}>Sell</button>
            </div>

            <div className="relative group">
              <input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-[#1e2329] border border-transparent focus:border-[#f0b90b] rounded-xl p-4 text-sm font-black outline-none text-center transition-all" />
              <span className="absolute right-4 top-4.5 text-[10px] text-gray-500 font-black uppercase">USDT</span>
            </div>

            <div className="flex justify-between px-1 items-center py-2">
               {[0, 25, 50, 75, 100].map(dot => (
                 <div key={dot} className={`w-2 h-2 rounded-full border-2 transition-all cursor-pointer ${dot === 0 ? 'bg-[#f0b90b] border-[#f0b90b]' : 'bg-transparent border-gray-700'}`}></div>
               ))}
            </div>

            <button onClick={handleTrade} className={`w-full py-4 rounded-2xl font-black text-sm uppercase shadow-xl transition-all active:scale-95 ${side === 'buy' ? 'bg-[#02c076] text-[#0b0e11] shadow-[#02c076]/20' : 'bg-[#f6465d] text-white shadow-[#f6465d]/20'}`}>
              {loading ? "Sending..." : `${side === 'buy' ? 'Open Long' : 'Open Short'}`}
            </button>
            
            <div className="pt-2">
              <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                <span>Available</span>
                <span className="text-white font-mono">${user?.balance?.toLocaleString() || '0.00'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- DASHBOARD (Modern Grid) ---
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
    <div className="p-4 md:p-8 space-y-6 bg-[#0b0e11] min-h-screen pb-32">
      {/* Balance Card */}
      <div className="bg-gradient-to-br from-[#1e2329] to-[#0b0e11] p-8 rounded-[3rem] border border-[#2b3139] flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#f0b90b]/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-[#f0b90b]/10 transition-all duration-700"></div>
        <div className="w-full md:w-auto z-10 text-center md:text-left">
          <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] font-black mb-3">Total Estimated Balance</p>
          <h1 className="text-4xl md:text-6xl font-mono font-black text-white tracking-tighter flex items-center justify-center md:justify-start gap-2">
            <span className="text-[#f0b90b] text-2xl md:text-3xl">$</span>
            {user?.balance !== undefined ? parseFloat(user.balance).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
          </h1>
        </div>
        <div className="flex flex-row gap-3 w-full md:w-auto z-10">
          <button onClick={() => navigate('/deposit')} className="flex-1 bg-[#f0b90b] text-black px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-[#d4a30a] active:scale-95 transition-all">Deposit</button>
          <button onClick={() => navigate('/withdraw')} className="flex-1 bg-white/5 text-white px-8 py-4 rounded-2xl font-black border border-[#2b3139] uppercase text-xs tracking-widest hover:bg-white/10 active:scale-95 transition-all">Withdraw</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Crypto Market Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 gap-4">
          {cryptoData.slice(0, 4).map((coin) => (
            <div key={coin.id} onClick={() => navigate(`/futures/${coin.symbol}`)} className="bg-[#161a1e] p-6 rounded-[2.5rem] border border-[#1e2329] cursor-pointer hover:border-[#f0b90b]/50 transition-all shadow-xl hover:-translate-y-1">
              <div className="flex justify-between mb-4 text-[10px] font-black uppercase tracking-widest">
                <span className="text-[#f0b90b]">{coin.symbol.toUpperCase()}/USDT</span>
                <span className={`px-2 py-0.5 rounded-full ${coin.up ? 'bg-[#02c076]/10 text-[#02c076]' : 'bg-[#f6465d]/10 text-[#f6465d]'}`}>{coin.change}%</span>
              </div>
              <p className="text-2xl font-black text-white tracking-tighter font-mono">${coin.price}</p>
              <div className="mt-4 h-1 w-full bg-gray-900 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-1000 ${coin.up ? 'bg-[#02c076]' : 'bg-[#f6465d]'}`} style={{width: '60%'}}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-[#161a1e] border border-[#1e2329] rounded-[2.5rem] p-6 shadow-xl h-fit">
          <h3 className="text-white font-black uppercase text-[10px] mb-6 flex items-center gap-2 tracking-[0.2em]">
            <Activity size={14} className="text-[#f0b90b]" /> Live Transactions
          </h3>
          <div className="space-y-4">
            {transactions.length > 0 ? transactions.slice(0, 5).map((trx) => (
              <div key={trx._id} className="flex justify-between items-center p-4 bg-[#0b0e11]/50 rounded-2xl border border-transparent hover:border-[#2b3139] transition-all">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${trx.type === 'deposit' ? 'bg-[#02c076]/10 text-[#02c076]' : 'bg-[#f6465d]/10 text-[#f6465d]'}`}>
                    {trx.type === 'deposit' ? <ArrowDownLeft size={16}/> : <ArrowUpRight size={16}/>}
                  </div>
                  <div>
                    <p className="font-black text-[10px] text-white uppercase tracking-tighter">{trx.type}</p>
                    <p className="text-[8px] text-gray-500 font-bold uppercase">{new Date(trx.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <p className="font-black text-xs text-white">${trx.amount}</p>
                  <p className={`text-[8px] font-black uppercase ${trx.status === 'completed' ? 'text-[#02c076]' : 'text-[#f0b90b]'}`}>{trx.status}</p>
                </div>
              </div>
            )) : <p className="text-[10px] text-gray-500 text-center py-10 uppercase tracking-widest font-black">No recent history</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- LAYOUT & NAVIGATION ---
const NavItem = ({ to, icon, label }) => (
  <NavLink to={to} className={({ isActive }) => `flex items-center gap-4 p-4 rounded-2xl transition-all ${isActive ? 'text-[#f0b90b] bg-[#f0b90b]/10' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
    {icon} <span className="hidden lg:inline font-black text-[11px] uppercase tracking-widest">{label}</span>
  </NavLink>
);

const AppContent = ({ cryptoData }) => {
  const { user, token, logout, loading: authLoading } = useContext(UserContext);
  const location = useLocation();

  if (authLoading) return <div className="min-h-screen bg-[#0b0e11] flex items-center justify-center text-[#f0b90b] font-black text-3xl animate-pulse italic uppercase tracking-tighter">VINANCE</div>;

  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const isHomePage = location.pathname === '/';
  if (!token && !isAuthPage && !isHomePage) return <Navigate to="/login" replace />;

  const firstCoin = cryptoData[0]?.symbol || 'btc';

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white flex flex-col md:flex-row overflow-hidden font-sans selection:bg-[#f0b90b] selection:text-black">
      {token && !isHomePage && (
        <aside className="w-20 lg:w-72 bg-[#161a1e] border-r border-[#1e2329] hidden md:flex flex-col p-6 h-screen sticky top-0 z-40">
          <div className="mb-12 px-4 py-2 text-2xl font-black text-[#f0b90b] italic uppercase tracking-tighter">VINANCE</div>
          <nav className="space-y-2 flex-1">
            <NavItem to="/dashboard" icon={<LayoutDashboard size={20}/>} label="Overview" />
            <NavItem to={`/futures/${firstCoin}`} icon={<Zap size={20}/>} label="Futures Pro" />
            <NavItem to="/invest" icon={<Briefcase size={20}/>} label="AI Investment" />
            <NavItem to="/wallet" icon={<Wallet size={20}/>} label="My Assets" />
            {user?.role === 'admin' && <NavItem to="/admin" icon={<ShieldCheck size={20}/>} label="Administration" />}
          </nav>
          <button onClick={logout} className="p-4 text-gray-500 hover:text-[#f6465d] flex items-center gap-4 font-black border-t border-[#1e2329] transition-colors mt-4">
            <LogOut size={20}/> <span className="hidden lg:inline text-[10px] uppercase tracking-widest">Sign Out</span>
          </button>
        </aside>
      )}

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className={`flex-1 overflow-y-auto bg-[#0b0e11] custom-scrollbar ${token && !isHomePage ? 'pb-24 md:pb-6' : ''}`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard cryptoData={cryptoData} />} />
            <Route path="/futures/:coinSymbol" element={<Futures />} /> 
            <Route path="/deposit" element={<Deposit />} />
            <Route path="/withdraw" element={<Withdraw />} />
            <Route path="/wallet" element={<WalletPage />} /> 
            <Route path="/invest" element={<Investment />} />
            <Route path="/my-investments" element={<MyInvestments />} />
            <Route path="/admin" element={user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </main>

      {/* MOBILE TAB BAR (Glassmorphism Effect) */}
      {token && !isHomePage && (
        <nav className="fixed bottom-4 left-4 right-4 bg-[#161a1e]/90 backdrop-blur-2xl border border-[#2b3139] flex justify-around items-center py-4 md:hidden z-50 rounded-[2rem] shadow-2xl">
          <NavLink to="/dashboard" className={({isActive})=> isActive ? "text-[#f0b90b] scale-110" : "text-gray-500"}><LayoutDashboard size={22}/></NavLink>
          <NavLink to={`/futures/${firstCoin}`} className={({isActive})=> isActive ? "text-[#f0b90b] scale-110" : "text-gray-500"}><Zap size={22}/></NavLink>
          <NavLink to="/invest" className={({isActive})=> isActive ? "text-[#f0b90b] scale-110" : "text-gray-500"}><Briefcase size={22}/></NavLink>
          <NavLink to="/wallet" className={({isActive})=> isActive ? "text-[#f0b90b] scale-110" : "text-gray-500"}><Wallet size={22}/></NavLink>
          <button onClick={logout} className="text-gray-500 active:text-[#f6465d] transition-colors"><LogOut size={22}/></button>
        </nav>
      )}
    </div>
  );
};

export default function App() {
  const [cryptoData, setCryptoData] = useState([
    { id: '1', name: 'Bitcoin', symbol: 'btc', price: '0', change: '0', up: true }
  ]);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await axios.get('https://api.binance.com/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT","SOLUSDT","BNBUSDT"]');
        const newData = res.data.map((item, index) => ({
          id: String(index + 1),
          name: item.symbol.replace('USDT', ''),
          symbol: item.symbol.replace('USDT', '').toLowerCase(),
          price: parseFloat(item.lastPrice).toLocaleString(),
          change: parseFloat(item.priceChangePercent).toFixed(2),
          up: parseFloat(item.priceChangePercent) > 0
        }));
        setCryptoData(newData);
      } catch (e) { console.warn("Price Fetch Error"); }
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