import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation, useNavigate, Link, Navigate, useParams } from 'react-router-dom';
import axios from 'axios'; 
import { 
  LayoutDashboard, BarChart3, TrendingUp, Wallet, LogOut, 
  ShieldCheck, Activity, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';

import { UserProvider, UserContext } from './context/UserContext'; 
import Home from './pages/Home'; 
import NotificationSystem from './components/NotificationSystem'; 
import AdminPanel from './admin/AdminPanel';
import Deposit from './pages/Deposit'; 
import Withdraw from './pages/Withdraw'; 
import WalletPage from './pages/Wallet';

// --- API Configuration (Fixed for Localhost) ---
const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

const api = axios.create({
  baseURL: isLocal ? "http://localhost:5000" : "https://my-trading-backend-rji1.vercel.app",
  withCredentials: true 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- ১. রেজিস্টার পেজ ---
const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/api/register`, { ...formData, email: formData.email.toLowerCase() });
      alert("Registration Successful! Please Login.");
      navigate('/login');
    } catch (err) { 
      alert(err.response?.data?.message || "Error during registration"); 
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0b0e11] flex items-center justify-center p-6 text-left">
      <div className="w-full max-w-md bg-[#1e2329] border border-gray-800 rounded-3xl p-10 shadow-2xl">
        <h1 className="text-3xl font-bold text-yellow-500 mb-6 italic uppercase tracking-tighter">VINANCE</h1>
        <form onSubmit={handleRegister} className="space-y-5">
          <input type="text" placeholder="Full Name" required onChange={(e)=>setFormData({...formData, name: e.target.value})} className="w-full bg-[#0b0e11] border border-gray-800 rounded-xl py-3 px-4 text-white outline-none focus:border-yellow-500" />
          <input type="email" placeholder="Email" required onChange={(e)=>setFormData({...formData, email: e.target.value})} className="w-full bg-[#0b0e11] border border-gray-800 rounded-xl py-3 px-4 text-white outline-none focus:border-yellow-500" />
          <input type="password" placeholder="Password" required onChange={(e)=>setFormData({...formData, password: e.target.value})} className="w-full bg-[#0b0e11] border border-gray-800 rounded-xl py-3 px-4 text-white outline-none focus:border-yellow-500" />
          <button disabled={loading} className="w-full bg-yellow-500 text-black py-3.5 rounded-xl font-bold uppercase">{loading ? "Wait..." : "Register"}</button>
        </form>
        <p className="text-center mt-6 text-sm text-gray-400">Already have an account? <Link to="/login" className="text-yellow-500 hover:underline">Log In</Link></p>
      </div>
    </div>
  );
};

// --- ২. লগইন পেজ ---
const Login = () => {
  const { setUser, setToken, refreshUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post(`/api/login`, { email: email.toLowerCase(), password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      await refreshUser(); 
      navigate('/dashboard');
    } catch (err) { alert(err.response?.data?.message || "Login Failed"); } 
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0b0e11] flex items-center justify-center p-6 text-left">
      <div className="w-full max-w-md bg-[#1e2329] border border-gray-800 rounded-3xl p-10 shadow-2xl">
        <h1 className="text-3xl font-bold text-yellow-500 mb-6 italic uppercase tracking-tighter">VINANCE</h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <input type="email" placeholder="Email" required onChange={(e)=>setEmail(e.target.value)} className="w-full bg-[#0b0e11] border border-gray-800 rounded-xl py-3 px-4 text-white outline-none focus:border-yellow-500" />
          <input type="password" placeholder="Password" required onChange={(e)=>setPassword(e.target.value)} className="w-full bg-[#0b0e11] border border-gray-800 rounded-xl py-3 px-4 text-white outline-none focus:border-yellow-500" />
          <button type="submit" disabled={loading} className="w-full bg-yellow-500 text-black py-3.5 rounded-xl font-bold uppercase">{loading ? "Syncing..." : "Log In"}</button>
        </form>
        <p className="text-center mt-6 text-sm text-gray-400">Don't have an account? <Link to="/register" className="text-yellow-500 hover:underline">Register</Link></p>
      </div>
    </div>
  );
};

// --- ৩. ট্রেড পেজ (Fixed with Console Logs) ---
const TradePage = () => {
  const { coinSymbol } = useParams();
  const { user, refreshUser } = useContext(UserContext);
  const [tradeType, setTradeType] = useState('buy');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTrade = async () => {
    if (!amount || parseFloat(amount) <= 0) return alert("Enter valid amount");
    setLoading(true);
    try {
      console.log("🚀 Trade Sent:", { type: tradeType, amount, symbol: coinSymbol });
      const res = await api.post('/api/trade', { 
        type: tradeType, 
        amount: parseFloat(amount), 
        symbol: (coinSymbol || 'btc').toUpperCase() 
      });
      alert(res.data.message);
      await refreshUser(); 
      setAmount('');
    } catch (err) { 
      console.error("❌ Trade Error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Trade failed"); 
    } finally { setLoading(false); }
  };

  return (
    <div className="p-4 md:p-8 flex flex-col lg:flex-row gap-6 text-left">
      <div className="flex-1 bg-[#1e2329] border border-gray-800 rounded-[2.5rem] overflow-hidden h-[500px] shadow-2xl">
        <iframe title="TV" src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${(coinSymbol || 'btc').toUpperCase()}USDT&theme=dark`} style={{ width: '100%', height: '100%', border: 'none' }}></iframe>
      </div>
      <div className="w-full lg:w-96 bg-[#1e2329] border border-gray-800 rounded-[2.5rem] p-8 shadow-2xl">
        <div className="flex gap-2 mb-6 p-1 bg-[#0b0e11] rounded-2xl">
          <button onClick={() => setTradeType('buy')} className={`flex-1 py-3 rounded-xl font-bold uppercase text-xs ${tradeType === 'buy' ? 'bg-emerald-500 text-black' : 'text-gray-500'}`}>Buy</button>
          <button onClick={() => setTradeType('sell')} className={`flex-1 py-3 rounded-xl font-bold uppercase text-xs ${tradeType === 'sell' ? 'bg-red-500 text-white' : 'text-gray-500'}`}>Sell</button>
        </div>
        <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest">
            <span>Available Balance</span>
            <span className="text-white">${user?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}</span>
        </div>
        <input type="number" value={amount} onChange={(e)=>setAmount(e.target.value)} placeholder="0.00 USDT" className="w-full bg-[#0b0e11] border border-gray-800 rounded-2xl p-4 text-white outline-none mb-4 font-mono" />
        <button disabled={loading} onClick={handleTrade} className={`w-full py-4 rounded-2xl font-bold uppercase tracking-widest ${tradeType === 'buy' ? 'bg-yellow-500 text-black' : 'bg-red-500 text-white'}`}>
          {loading ? "Processing..." : `Execute ${tradeType}`}
        </button>
      </div>
    </div>
  );
};

// --- ৪. ড্যাশবোর্ড ---
const Dashboard = ({ cryptoData }) => {
  const { user, refreshUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    refreshUser(); 
    const fetchTransactions = async () => {
      try {
        const res = await api.get('/api/transactions');
        setTransactions(res.data);
      } catch (err) { console.warn("Activity fetching issue"); }
    };
    fetchTransactions();
  }, []);

  return (
    <div className="p-4 md:p-8 text-left space-y-10">
      <div className="bg-gradient-to-br from-[#1e2329] to-[#0b0e11] p-8 rounded-[2.5rem] border border-gray-800 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform"><Activity size={100} /></div>
        <div className="w-full md:w-auto z-10">
          <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] font-black mb-2">Estimated Balance</p>
          <h1 className="text-4xl md:text-5xl font-mono font-black text-white tracking-tighter">
            ${user?.balance !== undefined ? parseFloat(user.balance).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
          </h1>
        </div>
        <div className="flex gap-3 w-full md:w-auto z-10">
          <button onClick={() => navigate('/deposit')} className="flex-1 bg-yellow-500 text-black px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-yellow-400 transition-all">Deposit</button>
          <button onClick={() => navigate('/withdraw')} className="flex-1 bg-white/5 text-white px-8 py-4 rounded-2xl font-black border border-gray-800 uppercase text-xs tracking-widest hover:bg-white/10 transition-all">Withdraw</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cryptoData.map((coin) => (
            <div key={coin.id} onClick={() => navigate(`/trade/${coin.symbol}`)} className="bg-[#1e2329] p-6 rounded-[2rem] border border-gray-800 cursor-pointer hover:border-yellow-500/50 transition-all group shadow-lg">
              <div className="flex justify-between mb-4 text-[10px] font-black uppercase tracking-widest">
                <span className="text-yellow-500">{coin.symbol.toUpperCase()}/USDT</span>
                <span className={coin.up ? 'text-emerald-400' : 'text-red-400'}>{coin.change}%</span>
              </div>
              <p className="text-2xl font-black text-white tracking-tighter font-mono">${coin.price}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#1e2329] border border-gray-800 rounded-[2.5rem] p-6 shadow-xl">
          <h3 className="text-white font-black uppercase text-[10px] mb-6 flex items-center gap-2 tracking-[0.2em]">
            <Activity size={14} className="text-yellow-500" /> Recent Activity
          </h3>
          <div className="space-y-4">
            {transactions.length > 0 ? (
              transactions.slice(0, 5).map((trx) => (
                <div key={trx._id} className="flex justify-between items-center p-3 hover:bg-white/[0.03] rounded-2xl border border-transparent hover:border-gray-800 transition-all">
                  <div className="flex items-center gap-2">
                    <div className={trx.type === 'deposit' ? 'text-emerald-500' : 'text-red-500'}>
                      {trx.type === 'deposit' ? <ArrowDownLeft size={14}/> : <ArrowUpRight size={14}/>}
                    </div>
                    <div>
                      <p className="font-black text-[9px] text-white uppercase">{trx.type}</p>
                      <p className="text-[8px] text-gray-500 font-bold">{new Date(trx.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-xs text-white">${trx.amount}</p>
                    <p className={`text-[8px] font-black uppercase ${trx.status === 'completed' ? 'text-emerald-500' : 'text-yellow-500'}`}>{trx.status}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-10 text-gray-600 text-[10px] font-black uppercase tracking-widest italic">No activity yet</p>
            )}
          </div>
          <button onClick={() => navigate('/wallet')} className="w-full mt-6 py-3 text-[9px] font-black text-gray-500 uppercase tracking-widest border-t border-gray-800 hover:text-yellow-500 transition-all">View All History</button>
        </div>
      </div>
    </div>
  );
};

// --- ৫. মার্কেট ---
const Market = ({ cryptoData }) => {
  const navigate = useNavigate();
  return (
    <div className="p-4 md:p-10 text-left pb-24 md:pb-10">
      <div className="mb-10"><h2 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">Market <Activity className="text-yellow-500" size={32} /></h2></div>
      <div className="bg-[#1e2329] rounded-[2.5rem] border border-gray-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-[#0b0e11]/50 text-[10px] font-black text-gray-500 uppercase tracking-widest">
              <tr><th className="p-8 text-left">Asset</th><th className="p-8 text-left">Price</th><th className="p-8 text-left">24h Change</th><th className="p-8 text-right">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {cryptoData.map((coin) => (
                <tr key={coin.id} className="hover:bg-white/[0.03] group">
                  <td className="p-8 font-black text-white text-lg uppercase">{coin.name} <span className="text-[10px] text-gray-500 ml-2">{coin.symbol.toUpperCase()}</span></td>
                  <td className="p-8 font-mono font-black text-lg text-white">${coin.price}</td>
                  <td className={`p-8 font-mono font-black ${coin.up ? 'text-emerald-400' : 'text-red-400'}`}>{coin.up ? '+' : ''}{coin.change}%</td>
                  <td className="p-8 text-right"><button onClick={() => navigate(`/trade/${coin.symbol}`)} className="bg-yellow-500 text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase">Trade</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- Navigation Components ---
const NavItem = ({ to, icon, label }) => (
  <NavLink to={to} className={({ isActive }) => `flex items-center gap-4 p-3.5 rounded-xl transition-all ${isActive ? 'text-yellow-500 bg-yellow-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
    {icon} <span className="hidden lg:inline font-black text-xs uppercase tracking-widest">{label}</span>
  </NavLink>
);

const AppContent = ({ cryptoData }) => {
  const { user, token, logout, loading: authLoading } = useContext(UserContext);
  const location = useLocation();

  if (authLoading) return (
    <div className="min-h-screen bg-[#0b0e11] flex items-center justify-center text-yellow-500 font-black text-4xl uppercase italic animate-pulse">
      VINANCE
    </div>
  );

  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const isHomePage = location.pathname === '/';

  if (!token && !isAuthPage && !isHomePage) return <Navigate to="/login" replace />;
  if (token && isAuthPage) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white flex flex-col md:flex-row overflow-hidden text-left">
      {token && !isHomePage && (
        <aside className="w-20 lg:w-64 bg-[#1e2329] border-r border-gray-800 hidden md:flex flex-col p-4 h-screen sticky top-0 z-40">
          <div className="mb-12 px-4 py-2 text-2xl font-black text-yellow-500 italic uppercase">VINANCE</div>
          <nav className="space-y-3 flex-1">
            <NavItem to="/dashboard" icon={<LayoutDashboard size={20}/>} label="Dashboard" />
            <NavItem to="/market" icon={<BarChart3 size={20}/>} label="Market" />
            <NavItem to="/trade/btc" icon={<TrendingUp size={20}/>} label="Trade" />
            <NavItem to="/wallet" icon={<Wallet size={20}/>} label="Wallet" />
            {user?.role === 'admin' && <NavItem to="/admin" icon={<ShieldCheck size={20}/>} label="Admin" />}
          </nav>
          <button onClick={logout} className="p-4 text-gray-500 hover:text-red-500 flex items-center gap-4 font-bold border-t border-gray-800/50">
            <LogOut size={20}/> <span className="hidden lg:inline text-[10px] font-black uppercase">Sign Out</span>
          </button>
        </aside>
      )}

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {token && !isHomePage && (
          <header className="h-16 border-b border-gray-800 bg-[#1e2329]/80 flex items-center justify-between px-6 sticky top-0 z-30 backdrop-blur-md">
            <div className="font-black text-[9px] uppercase tracking-[0.2em]">User: <span className="text-yellow-500 ml-1">{user?.name}</span></div>
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
            <Route path="/trade/:coinSymbol" element={<TradePage />} />
            <Route path="/deposit" element={<Deposit />} />
            <Route path="/withdraw" element={<Withdraw />} />
            <Route path="/wallet" element={<WalletPage />} /> 
            <Route path="/admin" element={user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </main>

      {token && !isHomePage && (
        <nav className="fixed bottom-0 left-0 right-0 bg-[#1e2329] border-t border-gray-800 flex justify-around py-5 md:hidden z-50">
          <NavLink to="/dashboard" className={({isActive})=> isActive ? "text-yellow-500" : "text-gray-400"}><LayoutDashboard size={22}/></NavLink>
          <NavLink to="/market" className={({isActive})=> isActive ? "text-yellow-500" : "text-gray-400"}><BarChart3 size={22}/></NavLink>
          <NavLink to="/trade/btc" className={({isActive})=> isActive ? "text-yellow-500" : "text-gray-400"}><TrendingUp size={22}/></NavLink>
          <NavLink to="/wallet" className={({isActive})=> isActive ? "text-yellow-500" : "text-gray-400"}><Wallet size={22}/></NavLink>
        </nav>
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
    } catch (err) { console.warn("Binance API issue"); }
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