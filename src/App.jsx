import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation, useNavigate, Link, Navigate } from 'react-router-dom';
import axios from 'axios'; 
import { 
  LayoutDashboard, BarChart3, TrendingUp, Wallet, LogOut, 
  Bell, Search, ChevronDown, Eye, EyeOff, Download, 
  Upload, Mail, Lock, User, ArrowRight, ShieldCheck 
} from 'lucide-react';

import { UserContext, UserProvider } from './context/UserContext'; 
import Home from './pages/Home'; 
import NotificationSystem from './components/NotificationSystem'; 
import Deposit from './pages/Deposit'; 
import Withdraw from './pages/Withdraw'; 
import AdminPanel from './admin/AdminPanel';

// 🚀 আপনার সঠিক Vercel ব্যাকএন্ড লিঙ্ক
const API_BASE_URL = "https://my-projact-sage.vercel.app"; 

// --- Axios Instance ---
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// --- হেল্পার কম্পোনেন্ট ---
const NavItem = ({ to, icon, label }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => `flex items-center gap-4 transition-all p-3.5 rounded-xl z-20 ${isActive ? 'text-yellow-500 bg-yellow-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
  >
    {icon} <span className="hidden lg:inline font-bold text-sm tracking-tight">{label}</span>
  </NavLink>
);

const MobileNavItem = ({ to, icon, label }) => (
  <NavLink to={to} className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors z-20 ${isActive ? 'text-yellow-500' : 'text-gray-400'}`}>
    {icon} <span className="text-[10px]">{label}</span>
  </NavLink>
);

const TradingChart = () => (
  <div className="w-full h-full min-h-[450px] md:min-h-[550px] bg-[#161a1e] rounded-xl overflow-hidden border border-gray-800 shadow-inner">
    <iframe title="TradingView" src="https://s.tradingview.com/widgetembed/?symbol=BINANCE:BTCUSDT&theme=dark&style=1&locale=en" style={{ width: '100%', height: '100%', border: 'none' }}></iframe>
  </div>
);

// --- লগইন পেজ ---
const Login = () => {
  const { login } = useContext(UserContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/api/login`, { email, password });
      if (res.data.token) {
        login(res.data.user, res.data.token);
        navigate('/dashboard');
      }
    } catch (err) { 
      alert(err.response?.data?.message || "Login failed! Check your connection."); 
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e11] flex items-center justify-center p-6 text-left">
      <div className="w-full max-w-md bg-[#1e2329] border border-gray-800 rounded-3xl p-10 shadow-2xl">
        <h1 className="text-3xl font-bold text-yellow-500 mb-2 italic uppercase">VINANCE</h1>
        <p className="text-gray-400 mb-8 font-medium">Log In to your account</p>
        <form onSubmit={handleLogin} className="space-y-6">
          <input type="email" placeholder="Email Address" required onChange={(e)=>setEmail(e.target.value)} className="w-full bg-[#0b0e11] border border-gray-800 rounded-xl py-3 px-4 text-white outline-none focus:border-yellow-500" />
          <input type="password" placeholder="Password" required onChange={(e)=>setPassword(e.target.value)} className="w-full bg-[#0b0e11] border border-gray-800 rounded-xl py-3 px-4 text-white outline-none focus:border-yellow-500" />
          <button type="submit" className="w-full bg-yellow-500 text-black py-3.5 rounded-xl font-bold hover:bg-yellow-400 transition-all flex items-center justify-center gap-2">Log In <ArrowRight size={18} /></button>
        </form>
        <p className="text-gray-500 text-sm mt-8 text-center">Don't have an account? <Link to="/register" className="text-yellow-500 font-bold ml-1">Register Now</Link></p>
      </div>
    </div>
  );
};

// --- রেজিস্টার পেজ ---
const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/api/register`, formData);
      alert(res.data.message || "Registration Successful!");
      navigate('/login');
    } catch (err) { 
      alert(err.response?.data?.message || "Registration failed!"); 
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e11] flex items-center justify-center p-6 text-left">
      <div className="w-full max-w-md bg-[#1e2329] border border-gray-800 rounded-3xl p-10 shadow-2xl">
        <h1 className="text-3xl font-bold text-yellow-500 mb-2 italic uppercase">Vinance</h1>
        <form className="space-y-5" onSubmit={handleRegister}>
          <input type="text" placeholder="Full Name" required onChange={(e)=>setFormData({...formData, name: e.target.value})} className="w-full bg-[#0b0e11] border border-gray-800 rounded-xl py-3 px-4 text-white outline-none focus:border-yellow-500" />
          <input type="email" placeholder="Email Address" required onChange={(e)=>setFormData({...formData, email: e.target.value})} className="w-full bg-[#0b0e11] border border-gray-800 rounded-xl py-3 px-4 text-white outline-none focus:border-yellow-500" />
          <input type="password" placeholder="Create password" required onChange={(e)=>setFormData({...formData, password: e.target.value})} className="w-full bg-[#0b0e11] border border-gray-800 rounded-xl py-3 px-4 text-white outline-none focus:border-yellow-500" />
          <button className="w-full bg-yellow-500 text-black py-3.5 rounded-xl font-bold hover:bg-yellow-400 transition-all flex items-center justify-center gap-2">Create Account <ArrowRight size={18} /></button>
        </form>
        <p className="text-gray-500 text-sm mt-8 text-center">Already have an account? <Link to="/login" className="text-yellow-500 font-bold ml-1">Log In</Link></p>
      </div>
    </div>
  );
};

// --- ড্যাশবোর্ড ---
const Dashboard = ({ cryptoData }) => {
  const { user } = useContext(UserContext); 
  const navigate = useNavigate();
  return (
    <div className="p-4 md:p-8 text-left animate-in fade-in duration-500">
      <div className="bg-gradient-to-br from-[#1e2329] to-[#0b0e11] p-8 rounded-3xl border border-gray-800 mb-10 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <p className="text-gray-500 text-sm font-bold uppercase mb-2 tracking-widest">Estimated Balance</p>
          <h1 className="text-3xl md:text-5xl font-mono font-bold text-white">${user?.balance?.toLocaleString(undefined, {minimumFractionDigits: 2}) || '0.00'}</h1>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={() => navigate('/deposit')} className="flex-1 bg-yellow-500 text-black px-8 py-3 rounded-2xl font-bold hover:bg-yellow-400 shadow-xl transition-all">Deposit</button>
          <button onClick={() => navigate('/withdraw')} className="flex-1 bg-gray-800 text-white px-8 py-3 rounded-2xl font-bold border border-gray-700 hover:bg-gray-700 transition-all">Withdraw</button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cryptoData.map((coin) => (
          <div key={coin.id} className="bg-[#1e2329] p-6 rounded-2xl border border-gray-800 group transition-all hover:border-yellow-500/50">
            <div className="flex justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-500 font-bold uppercase">{coin.symbol[0]}</div>
                <div><p className="font-bold text-white">{coin.name}</p><p className="text-xs text-gray-500 uppercase">{coin.symbol}/USDT</p></div>
              </div>
              <div className={`px-2 py-1 rounded text-[10px] font-bold ${coin.up ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{coin.change}%</div>
            </div>
            <p className="text-3xl font-mono font-bold text-white">${coin.price > 0 ? coin.price.toLocaleString() : 'Loading...'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- মার্কেট ---
const Market = ({ cryptoData }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const filteredCoins = cryptoData.filter(coin => coin.name.toLowerCase().includes(searchQuery.toLowerCase()) || coin.symbol.toLowerCase().includes(searchQuery.toLowerCase()));
  return (
    <div className="p-4 md:p-8 text-left">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-white">Markets</h2>
        <div className="relative"><Search className="absolute left-3 top-2.5 text-gray-500" size={18} /><input type="text" placeholder="Search..." onChange={(e)=>setSearchQuery(e.target.value)} className="bg-[#1e2329] border border-gray-800 rounded-lg py-2 pl-10 text-white outline-none focus:border-yellow-500" /></div>
      </div>
      <div className="bg-[#1e2329] border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-800/50 text-gray-400 text-xs uppercase"><tr className="border-b border-gray-800"><th className="p-5">Asset</th><th className="p-5">Price</th><th className="p-5">Change</th><th className="p-5 text-right">Action</th></tr></thead>
          <tbody className="divide-y divide-gray-800">
            {filteredCoins.map((coin) => (
              <tr key={coin.id} className="hover:bg-gray-800/40 transition-all">
                <td className="p-5 flex items-center gap-4"><div className="w-8 h-8 bg-yellow-500/10 rounded-full flex items-center justify-center text-yellow-500 font-bold text-xs uppercase">{coin.symbol[0]}</div><div><div className="font-bold text-white">{coin.name}</div><div className="text-xs text-gray-500 uppercase">{coin.symbol}</div></div></td>
                <td className="p-5 font-mono font-bold">${coin.price.toLocaleString()}</td>
                <td className={`p-5 font-bold ${coin.up ? 'text-emerald-400' : 'text-red-400'}`}>{coin.change}%</td>
                <td className="p-5 text-right"><button onClick={() => navigate('/trade')} className="bg-yellow-500 text-black px-4 py-1.5 rounded-lg font-bold text-xs hover:bg-yellow-400 transition-colors">Trade</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- ট্রেড পেজ ---
const TradePage = () => {
  const [amount, setAmount] = useState('');
  const { user, token, setUser } = useContext(UserContext); 
  const handleTrade = async (type) => {
    if (!amount || amount <= 0) return alert("Enter valid amount");
    try {
      const res = await api.post(`/api/trade`, 
        { type, amount: parseFloat(amount), symbol: 'BTC' }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);
      setUser({ ...user, balance: res.data.newBalance });
      setAmount('');
    } catch (err) { alert(err.response?.data?.message || "Trade failed"); }
  };
  return (
    <div className="p-4 lg:p-6 flex flex-col lg:flex-row gap-4 text-left">
      <div className="flex-1 bg-[#1e2329] border border-gray-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-gray-800 font-bold text-white">BTC / USDT</div>
        <TradingChart />
      </div>
      <div className="w-full lg:w-80 bg-[#1e2329] border border-gray-800 rounded-2xl p-5">
        <p className="text-xs text-gray-500 font-bold mb-1">Available Balance</p>
        <p className="text-xl font-mono font-bold text-yellow-500 mb-6">${user?.balance?.toLocaleString() || '0.00'}</p>
        <div className="space-y-4">
          <input type="number" placeholder="Amount" value={amount} onChange={(e)=>setAmount(e.target.value)} className="w-full bg-[#0b0e11] border border-gray-800 rounded-xl p-3 text-white outline-none focus:border-yellow-500" />
          <button onClick={() => handleTrade('buy')} className="w-full bg-emerald-600 hover:bg-emerald-500 py-4 rounded-xl font-bold uppercase tracking-widest transition-all">Buy BTC</button>
          <button onClick={() => handleTrade('sell')} className="w-full bg-red-600 hover:bg-red-500 py-4 rounded-xl font-bold uppercase tracking-widest transition-all">Sell BTC</button>
        </div>
      </div>
    </div>
  );
};

// --- ওয়ালেট পেজ ---
const WalletPage = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  return (
    <div className="p-8 text-left max-w-4xl mx-auto">
      <div className="bg-[#1e2329] p-10 rounded-[2.5rem] border border-gray-800 shadow-2xl">
        <p className="text-gray-400 text-xs font-bold uppercase tracking-tighter mb-4">Net Worth</p>
        <h1 className="text-4xl md:text-6xl font-mono font-bold text-white mb-10">${user?.balance?.toLocaleString() || '0.00'} <span className="text-yellow-500 text-xl">USDT</span></h1>
        <div className="flex gap-4">
          <button onClick={() => navigate('/deposit')} className="bg-yellow-500 text-black px-10 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all"><Download size={20}/> Deposit</button>
          <button onClick={() => navigate('/withdraw')} className="bg-gray-800 text-white px-10 py-4 rounded-2xl font-bold border border-gray-700 transition-all"><Upload size={20}/> Withdraw</button>
        </div>
      </div>
    </div>
  );
};

// --- মেইন কন্টেন্ট এবং অ্যাপ রুটস ---
const AppContent = ({ cryptoData }) => {
  const { token, logout, loading, user } = useContext(UserContext); 
  const location = useLocation();

  if (loading) return <div className="min-h-screen bg-[#0b0e11] flex items-center justify-center text-yellow-500 font-bold italic tracking-widest">LOADING TERMINAL...</div>; 

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/';

  if (!token && !isAuthPage) return <Navigate to="/" />;
  if (token && isAuthPage) return <Navigate to="/dashboard" />;

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white flex flex-col md:flex-row font-sans overflow-hidden">
      {token && (
        <aside className="w-20 lg:w-64 bg-[#1e2329] border-r border-gray-800 hidden md:flex flex-col p-4 h-screen sticky top-0 z-40 shadow-2xl">
          <div className="mb-12 px-4 py-2 text-2xl font-black text-yellow-500 italic tracking-tighter uppercase">VINANCE</div>
          <nav className="space-y-4 flex-1 text-left">
            <NavItem to="/dashboard" icon={<LayoutDashboard size={22}/>} label="Dashboard" />
            <NavItem to="/market" icon={<BarChart3 size={22}/>} label="Market" />
            <NavItem to="/trade" icon={<TrendingUp size={22}/>} label="Trade" />
            <NavItem to="/wallet" icon={<Wallet size={22}/>} label="Wallet" />
            {user?.role === 'admin' && <NavItem to="/admin" icon={<ShieldCheck size={22}/>} label="Admin Panel" />}
          </nav>
          <button onClick={logout} className="p-4 text-gray-500 hover:text-red-500 flex items-center gap-4 font-bold text-sm transition-colors border-t border-gray-800/50 mt-4"><LogOut size={22}/> <span className="hidden lg:inline">Sign Out</span></button>
        </aside>
      )}

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative text-left">
        {token && (
          <header className="h-16 border-b border-gray-800 bg-[#1e2329]/80 flex items-center justify-between px-6 sticky top-0 z-30 backdrop-blur-md">
            <div className="text-left">
              <div className="font-bold text-white text-sm tracking-tight">Vinance Terminal</div>
              <div className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest">Welcome, {user?.name || 'User'}</div>
            </div>
            <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500 font-bold text-xs">
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <NotificationSystem />
            </div>
          </header>
        )}

        <div className="flex-1 overflow-y-auto bg-[#0b0e11] pb-24 md:pb-0 scrollbar-hide">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard cryptoData={cryptoData} />} />
            <Route path="/market" element={<Market cryptoData={cryptoData} />} />
            <Route path="/trade" element={<TradePage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/deposit" element={<Deposit />} />
            <Route path="/withdraw" element={<Withdraw />} />
            <Route path="/admin" element={user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/dashboard" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </main>

      {token && (
        <nav className="fixed bottom-0 left-0 right-0 bg-[#1e2329]/95 backdrop-blur-lg border-t border-gray-800 flex justify-around items-center py-4 z-50 md:hidden">
          <MobileNavItem to="/dashboard" icon={<LayoutDashboard size={20}/>} label="Home" />
          <MobileNavItem to="/market" icon={<BarChart3 size={20}/>} label="Market" />
          <MobileNavItem to="/trade" icon={<TrendingUp size={20}/>} label="Trade" />
          <MobileNavItem to="/wallet" icon={<Wallet size={20}/>} label="Wallet" />
        </nav>
      )}
    </div>
  );
};

// --- Root Component ---
export default function App() {
  const [cryptoData, setCryptoData] = useState([
    { id: '1', name: 'Bitcoin', symbol: 'btc', price: 0, change: 0, up: true },
    { id: '2', name: 'Ethereum', symbol: 'eth', price: 0, change: 0, up: true },
    { id: '3', name: 'Solana', symbol: 'sol', price: 0, change: 0, up: true },
    { id: '4', name: 'BNB', symbol: 'bnb', price: 0, change: 0, up: true },
  ]);

  const fetchCryptoPrices = async () => {
    try {
      const { data } = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,binancecoin&vs_currencies=usd&include_24hr_change=true');
      if(data) {
        setCryptoData([
          { id: '1', name: 'Bitcoin', symbol: 'btc', price: data.bitcoin.usd, change: data.bitcoin.usd_24h_change.toFixed(2), up: data.bitcoin.usd_24h_change > 0 },
          { id: '2', name: 'Ethereum', symbol: 'eth', price: data.ethereum.usd, change: data.ethereum.usd_24h_change.toFixed(2), up: data.ethereum.usd_24h_change > 0 },
          { id: '3', name: 'Solana', symbol: 'sol', price: data.solana.usd, change: data.solana.usd_24h_change.toFixed(2), up: data.solana.usd_24h_change > 0 },
          { id: '4', name: 'BNB', symbol: 'bnb', price: data.binancecoin.usd, change: data.binancecoin.usd_24h_change.toFixed(2), up: data.binancecoin.usd_24h_change > 0 },
        ]);
      }
    } catch (error) { console.error("API error:", error); }
  };

  useEffect(() => {
    fetchCryptoPrices(); 
    const interval = setInterval(fetchCryptoPrices, 60000); 
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