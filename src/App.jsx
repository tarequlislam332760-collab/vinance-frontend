import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation, useNavigate, Link, Navigate, useParams } from 'react-router-dom';
import axios from 'axios'; 
import { 
  LayoutDashboard, BarChart3, TrendingUp, Wallet, LogOut, 
  ShieldCheck, Activity, ArrowUpRight, ArrowDownLeft,
  PieChart, ChevronLeft, Star, Bell, MoreHorizontal, LayoutGrid, Zap, ChevronDown, History, Gavel, Settings
} from 'lucide-react';

import { UserProvider, UserContext } from './context/UserContext'; 
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
import InvestmentLogs from './admin/InvestmentLogs';
import TraderProfile from './pages/TraderProfile';
import Futures from "./pages/Futures.jsx"; 

const API_URL = "https://vinance-frontend-ywh7.vercel.app/";

const NavItem = ({ to, icon, label }) => (
  <NavLink to={to} className={({ isActive }) => `flex items-center gap-4 p-3.5 rounded-xl transition-all ${isActive ? 'text-[#f0b90b] bg-[#f0b90b]/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
    {icon} <span className="hidden lg:inline font-black text-[10px] uppercase tracking-widest">{label}</span>
  </NavLink>
);

// --- Trade, Login, Register, Dashboard, Market components unchanged for brevity ---
// (আপনার কোডের এই অংশগুলো একই থাকবে)

const Trade = () => {
  const { coinSymbol } = useParams();
  const { user, refreshUser, token } = useContext(UserContext);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
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
    <div className="flex flex-col h-screen bg-[#0b0e11] text-[#eaecef] overflow-hidden text-left">
      <div className="flex justify-between items-center px-4 py-2 border-b border-gray-800 bg-[#0b0e11]"><ChevronLeft className="cursor-pointer" onClick={() => window.history.back()} /><span className="font-bold">{currentCoin}/USDT</span><Activity size={18} /></div>
      <div className="flex-1 w-full relative">
        <iframe title="TV" src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${currentCoin}USDT&interval=240&theme=dark&style=1`} className="absolute inset-0 w-full h-full border-none"></iframe>
      </div>
      <div className="p-4 pb-24 bg-[#161a1e] border-t border-gray-800">
        <div className="flex flex-col gap-3 max-w-md mx-auto">
          <input type="number" value={amount} onChange={(e)=>setAmount(e.target.value)} placeholder="0.00" className="w-full bg-[#2b3139] rounded py-3 px-3 text-sm outline-none text-white border border-transparent focus:border-[#f0b90b]" />
          <div className="flex gap-2">
            <button onClick={() => handleTrade('buy')} className="flex-1 bg-[#02c076] text-black py-3 rounded font-bold">{loading ? '...' : 'Buy'}</button>
            <button onClick={() => handleTrade('sell')} className="flex-1 bg-[#f6465d] text-white py-3 rounded font-bold">{loading ? '...' : 'Sell'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/api/login`, { email, password });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || "Login Failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0e11] px-4">
      <div className="max-w-md w-full bg-[#161a1e] p-8 rounded-[2rem] border border-[#1e2329] shadow-2xl">
        <h2 className="text-3xl font-black text-[#f0b90b] italic mb-6 text-center">VINANCE LOGIN</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="Email" className="w-full bg-[#2b3139] p-4 rounded-xl outline-none border border-transparent focus:border-[#f0b90b] text-white" 
            onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" className="w-full bg-[#2b3139] p-4 rounded-xl outline-none border border-transparent focus:border-[#f0b90b] text-white" 
            onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" className="w-full bg-[#f0b90b] text-black font-black py-4 rounded-xl uppercase tracking-widest hover:bg-[#d4a30a] transition-all">Sign In</button>
        </form>
        <p className="mt-6 text-center text-gray-400 text-sm">Don't have an account? <Link to="/register" className="text-[#f0b90b] font-bold">Register</Link></p>
      </div>
    </div>
  );
};

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/register`, formData);
      alert("Registration Successful! Please Login.");
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || "Registration Failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0e11] px-4">
      <div className="max-w-md w-full bg-[#161a1e] p-8 rounded-[2rem] border border-[#1e2329] shadow-2xl">
        <h2 className="text-3xl font-black text-[#f0b90b] italic mb-6 text-center">CREATE ACCOUNT</h2>
        <form onSubmit={handleRegister} className="space-y-4">
          <input type="text" placeholder="Full Name" className="w-full bg-[#2b3139] p-4 rounded-xl outline-none border border-transparent focus:border-[#f0b90b] text-white" 
            onChange={(e) => setFormData({...formData, name: e.target.value})} required />
          <input type="email" placeholder="Email Address" className="w-full bg-[#2b3139] p-4 rounded-xl outline-none border border-transparent focus:border-[#f0b90b] text-white" 
            onChange={(e) => setFormData({...formData, email: e.target.value})} required />
          <input type="password" placeholder="Password" className="w-full bg-[#2b3139] p-4 rounded-xl outline-none border border-transparent focus:border-[#f0b90b] text-white" 
            onChange={(e) => setFormData({...formData, password: e.target.value})} required />
          <button type="submit" className="w-full bg-[#f0b90b] text-black font-black py-4 rounded-xl uppercase tracking-widest hover:bg-[#d4a30a] transition-all">Register Now</button>
        </form>
        <p className="mt-6 text-center text-gray-400 text-sm">Already have an account? <Link to="/login" className="text-[#f0b90b] font-bold">Login</Link></p>
      </div>
    </div>
  );
};

const Dashboard = ({ cryptoData }) => {
  const { user, refreshUser, token } = useContext(UserContext);
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (refreshUser) refreshUser(); 
    const fetchTransactions = async () => {  
      if (!token) return;
      try {
        const res = await axios.get(`${API_URL}/api/transactions`, { headers: { Authorization: `Bearer ${token}` } });
        setTransactions(Array.isArray(res.data) ? res.data : (res.data.transactions || []));
      } catch (err) { console.warn("Activity fetch error"); }
    };
    fetchTransactions();
  }, [token, refreshUser]);

  return (
    <div className="p-4 md:p-8 text-left space-y-6 bg-[#0b0e11] min-h-screen">
      <div className="bg-gradient-to-br from-[#161a1e] to-[#0b0e11] p-6 rounded-[2.5rem] border border-[#1e2329] flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl relative overflow-hidden">
        <div className="w-full md:w-auto text-center md:text-left z-10">
          <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] font-black mb-2">Estimated Balance</p>
          <h1 className="text-3xl md:text-5xl font-mono font-black text-white tracking-tighter">${user?.balance?.toLocaleString() || '0.00'}</h1>
        </div>
        <div className="flex gap-3 w-full md:w-auto z-10">
          <button onClick={() => navigate('/deposit')} className="flex-1 bg-[#f0b90b] text-black px-8 py-3.5 rounded-2xl font-black uppercase text-xs">Deposit</button>
          <button onClick={() => navigate('/withdraw')} className="flex-1 bg-white/5 text-white px-8 py-3.5 rounded-2xl font-black border border-[#1e2329] uppercase text-xs">Withdraw</button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          {cryptoData.slice(0,4).map((coin) => (
            <div key={coin.id} onClick={() => navigate(`/trade/${coin.symbol}`)} className="bg-[#161a1e] p-5 rounded-[2rem] border border-[#1e2329] cursor-pointer hover:border-[#f0b90b]/50 shadow-lg">
              <div className="flex justify-between mb-4 text-[10px] font-black uppercase">
                <span className="text-[#f0b90b]">{coin.symbol.toUpperCase()}</span>
                <span className={coin.up ? 'text-[#00c076]' : 'text-[#f6465d]'}>{coin.change}%</span>
              </div>
              <p className="text-xl md:text-2xl font-black text-white font-mono">${coin.price}</p>
            </div>
          ))}
        </div>
        <div className="bg-[#161a1e] border border-[#1e2329] rounded-[2.5rem] p-6 shadow-xl relative">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-white font-black uppercase text-[10px] flex items-center gap-2 tracking-[0.2em]">
                 <Activity size={14} className="text-[#f0b90b]" /> Recent Activity
              </h3>
              <Link to="/wallet" className="text-[#f0b90b] text-[10px] font-black uppercase hover:underline">View All</Link>
           </div>
           <div className="space-y-4">
            {transactions.slice(0, 5).map((trx) => (
              <div key={trx._id} className="flex justify-between items-center p-3 hover:bg-white/[0.03] rounded-2xl border border-transparent hover:border-[#1e2329]">
                <div className="flex items-center gap-2">
                  <div className={trx.type === 'deposit' ? 'text-[#00c076]' : 'text-[#f6465d]'}>{trx.type === 'deposit' ? <ArrowDownLeft size={14}/> : <ArrowUpRight size={14}/>}</div>
                  <div>
                    <p className="font-black text-[9px] text-white uppercase">{trx.type}</p>
                    <p className="text-[8px] text-gray-500 font-bold">{new Date(trx.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-xs text-white">${trx.amount}</p>
                  <p className={`text-[8px] font-black uppercase ${trx.status === 'approved' ? 'text-[#00c076]' : 'text-[#f0b90b]'}`}>{trx.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Market = ({ cryptoData }) => {
  const navigate = useNavigate();
  return (
    <div className="p-4 md:p-10 text-left pb-32 bg-[#0b0e11] min-h-screen">
      <div className="mb-10"><h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter flex items-center gap-3">Market <Activity className="text-[#f0b90b]" size={32} /></h2></div>
      <div className="bg-[#161a1e] rounded-[2.5rem] border border-[#1e2329] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-[#0b0e11]/50 text-[10px] font-black text-gray-500 uppercase tracking-widest">
              <tr><th className="p-6 text-left">Asset</th><th className="p-6 text-left">Price</th><th className="p-6 text-left">24h Change</th><th className="p-6 text-right">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-[#1e2329]">
              {cryptoData.map((coin) => (
                <tr key={coin.id} className="hover:bg-white/[0.03]">
                  <td className="p-6 font-black text-white text-md uppercase">{coin.name} <span className="text-[10px] text-gray-500 ml-2">{coin.symbol.toUpperCase()}</span></td>
                  <td className="p-6 font-mono font-black text-white">${coin.price}</td>
                  <td className={`p-6 font-mono font-black ${coin.up ? 'text-[#00c076]' : 'text-[#f6465d]'}`}>{coin.up ? '+' : ''}{coin.change}%</td>
                  <td className="p-6 text-right"><button onClick={() => navigate(`/trade/${coin.symbol}`)} className="bg-[#f0b90b] text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase">Trade</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- Updated Responsive Content Wrapper ---
const AppContent = ({ cryptoData }) => {
  const { user, token, logout, loading: authLoading } = useContext(UserContext);
  const location = useLocation();
  const [showMoreMenu, setShowMoreMenu] = useState(false); 

  if (authLoading) return <div className="min-h-screen bg-[#0b0e11] flex items-center justify-center text-[#f0b90b] font-black text-3xl animate-pulse italic">VINANCE</div>;

  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const isHomePage = location.pathname === '/';
  if (!token && !isAuthPage && !isHomePage) return <Navigate to="/login" replace />;

  const userPages = [
    { to: "/dashboard", icon: <LayoutDashboard size={22}/>, label: "Home" },
    { to: "/market", icon: <BarChart3 size={22}/>, label: "Market" },
    { to: "/futures/btc", icon: <Gavel size={22}/>, label: "Futures" },
    { to: "/invest", icon: <PieChart size={22}/>, label: "Invest" },
    { to: "/copy-trade", icon: <Zap size={22}/>, label: "Portfolio" }, 
    { to: `/trade/${cryptoData[0]?.symbol || 'btc'}`, icon: <TrendingUp size={22}/>, label: "Spot" },
    { to: "/my-investments", icon: <History size={22}/>, label: "Logs" },
    { to: "/wallet", icon: <Wallet size={22}/>, label: "Wallet" },
  ];

  const adminPages = [
    { to: "/admin", icon: <ShieldCheck size={22}/>, label: "Users" },
    { to: "/admin/manage-plans", icon: <LayoutGrid size={22}/>, label: "Plans" },
  ];

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white flex flex-col md:flex-row overflow-hidden text-left font-sans">
      {/* Desktop Sidebar */}
      {token && !isHomePage && (
        <aside className="w-20 lg:w-64 bg-[#161a1e] border-r border-[#1e2329] hidden md:flex flex-col p-4 h-screen sticky top-0 z-40">
          <div className="mb-12 px-4 py-2 text-2xl font-black text-[#f0b90b] italic uppercase tracking-tighter">VINANCE</div>
          <nav className="space-y-2 flex-1 overflow-y-auto">
            {userPages.map(page => (
              <NavItem key={page.to} to={page.to} icon={page.icon} label={page.label} />
            ))}
          </nav>
          {user?.role === 'admin' && (
            <div className="mt-auto pt-4 border-t border-gray-800 space-y-2 mb-4">
              <div className="px-4 py-2 text-[9px] font-black text-[#f0b90b] uppercase tracking-widest opacity-50 italic">Admin Control</div>
              {adminPages.map(page => (
                <NavItem key={page.to} to={page.to} icon={page.icon} label={page.label} />
              ))}
            </div>
          )}
          <button onClick={logout} className="p-4 text-gray-500 hover:text-red-500 flex items-center gap-4 font-bold border-t border-gray-800">
            <LogOut size={20}/> <span className="hidden lg:inline text-[10px] font-black uppercase">Sign Out</span>
          </button>
        </aside>
      )}

      {/* Main Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {token && !isHomePage && (
          <header className="h-14 border-b border-[#1e2329] bg-[#161a1e] flex items-center justify-between px-6 sticky top-0 z-30">
            <div className="font-black text-[9px] uppercase tracking-widest text-[#f0b90b]">Hi, {user?.name}</div>
            <NotificationSystem />
          </header>
        )}
        
        <div className={`flex-1 overflow-y-auto ${token && !isHomePage ? 'pb-24 md:pb-8' : ''}`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard cryptoData={cryptoData} />} />
            <Route path="/market" element={<Market cryptoData={cryptoData} />} />
            <Route path="/futures" element={<Navigate to="/futures/btc" replace />} />
            <Route path="/futures/:coinSymbol" element={<Futures />} />
            <Route path="/trade/:coinSymbol" element={<Trade />} /> 
            <Route path="/deposit" element={<Deposit />} />
            <Route path="/withdraw" element={<Withdraw />} />
            <Route path="/wallet" element={<WalletPage />} /> 
            <Route path="/invest" element={<Investment />} />
            <Route path="/my-investments" element={<MyInvestments />} />
            <Route path="/copy-trade" element={<TraderProfile />} /> 
            <Route path="/profile" element={<Profile />} />
            <Route path="/become-trader" element={<BecomeTrader />} />
            <Route path="/admin" element={user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/dashboard" />} />
            <Route path="/admin/manage-plans" element={user?.role === 'admin' ? <ManagePlans /> : <Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </main>

      {/* --- Mobile Fixed Menus --- */}
      {token && !isHomePage && (
        <>
          {/* Full Screen Mobile Menu */}
          {showMoreMenu && (
            <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] p-8 flex flex-col overflow-y-auto text-left">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-[#f0b90b] font-black text-xl uppercase italic">All Services</h2>
                <button onClick={() => setShowMoreMenu(false)} className="bg-white/10 p-2 rounded-full text-gray-400">Close</button>
              </div>
              
              {/* User Services */}
              <div className="grid grid-cols-3 gap-y-6 gap-x-4 mb-10 text-center">
                {userPages.map((page) => (
                  <Link key={page.to} to={page.to} onClick={() => setShowMoreMenu(false)} className="flex flex-col items-center gap-2 text-gray-400 hover:text-white transition-colors">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">{page.icon}</div>
                    <span className="text-[9px] font-black uppercase leading-tight">{page.label}</span>
                  </Link>
                ))}
              </div>

              {/* Admin Services (Mobile View Fix) */}
              {user?.role === 'admin' && (
                <div className="mb-10">
                   <div className="text-[10px] font-black text-[#f0b90b] uppercase tracking-widest mb-6 opacity-60 border-b border-white/10 pb-2">Admin Dashboard</div>
                   <div className="grid grid-cols-3 gap-y-6 gap-x-4 text-center">
                      {adminPages.map((page) => (
                        <Link key={page.to} to={page.to} onClick={() => setShowMoreMenu(false)} className="flex flex-col items-center gap-2 text-[#f0b90b]">
                          <div className="p-4 bg-[#f0b90b]/10 rounded-2xl border border-[#f0b90b]/20">{page.icon}</div>
                          <span className="text-[9px] font-black uppercase leading-tight">{page.label}</span>
                        </Link>
                      ))}
                   </div>
                </div>
              )}

              <button onClick={logout} className="flex items-center justify-center gap-2 text-red-500 font-black uppercase text-[10px] py-4 bg-red-500/5 rounded-2xl border border-red-500/10 mt-auto">
                  <LogOut size={18}/> Logout Account
              </button>
            </div>
          )}
          
          {/* Mobile Bottom Navigation Bar */}
          <nav className="fixed bottom-0 left-0 right-0 bg-[#161a1e]/95 backdrop-blur-md border-t border-gray-800 flex justify-around items-center py-4 md:hidden z-[80]">
            <NavLink to="/dashboard" className={({isActive})=> isActive ? "text-[#f0b90b]" : "text-gray-400"}><LayoutDashboard size={22}/></NavLink>
            <NavLink to="/futures/btc" className={({isActive})=> isActive ? "text-[#f0b90b]" : "text-gray-400"}><Gavel size={22}/></NavLink>
            <NavLink to="/invest" className={({isActive})=> isActive ? "text-[#f0b90b]" : "text-gray-400"}><PieChart size={22}/></NavLink>
            <NavLink to="/wallet" className={({isActive})=> isActive ? "text-[#f0b90b]" : "text-gray-400"}><Wallet size={22}/></NavLink>
            <button onClick={() => setShowMoreMenu(true)} className="text-gray-400 relative">
                <LayoutGrid size={22}/>
                {user?.role === 'admin' && <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#f0b90b] rounded-full animate-pulse border-2 border-[#161a1e]"></span>}
            </button>
          </nav>
        </>
      )}
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
    } catch (err) { console.warn("API Connectivity Issue"); }
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