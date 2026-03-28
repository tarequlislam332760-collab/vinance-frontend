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

// --- Register Component ---
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
    <div className="min-h-screen bg-main-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-card-bg border border-border rounded-3xl p-10 shadow-2xl">
        <h1 className="text-3xl font-bold text-primary mb-6 italic uppercase">VINANCE</h1>
        <form onSubmit={handleRegister} className="space-y-5">
          <input type="text" placeholder="Name" required onChange={(e)=>setFormData({...formData, name: e.target.value})} className="w-full bg-main-bg border border-border rounded-xl py-3 px-4 text-white outline-none focus:border-primary" />
          <input type="email" placeholder="Email" required onChange={(e)=>setFormData({...formData, email: e.target.value})} className="w-full bg-main-bg border border-border rounded-xl py-3 px-4 text-white outline-none focus:border-primary" />
          <input type="password" placeholder="Password" required onChange={(e)=>setFormData({...formData, password: e.target.value})} className="w-full bg-main-bg border border-border rounded-xl py-3 px-4 text-white outline-none focus:border-primary" />
          <button disabled={loading} className="w-full bg-primary text-black py-3.5 rounded-xl font-bold uppercase">{loading ? "..." : "Register"}</button>
        </form>
      </div>
    </div>
  );
};

// --- Login Component ---
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
    <div className="min-h-screen bg-main-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-card-bg border border-border rounded-3xl p-10 shadow-2xl">
        <h1 className="text-3xl font-bold text-primary mb-6 italic uppercase">VINANCE</h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <input type="email" placeholder="Email" required onChange={(e)=>setEmail(e.target.value)} className="w-full bg-main-bg border border-border rounded-xl py-3 px-4 text-white outline-none focus:border-primary" />
          <input type="password" placeholder="Password" required onChange={(e)=>setPassword(e.target.value)} className="w-full bg-main-bg border border-border rounded-xl py-3 px-4 text-white outline-none focus:border-primary" />
          <button type="submit" disabled={loading} className="w-full bg-primary text-black py-3.5 rounded-xl font-bold uppercase">{loading ? "..." : "Log In"}</button>
        </form>
      </div>
    </div>
  );
};

// --- TradePage Component (Mobile Enhanced Chart) ---
const TradePage = () => {
  const { coinSymbol } = useParams();
  const { user, refreshUser, API_URL, token } = useContext(UserContext);
  const [tradeType, setTradeType] = useState('buy');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTrade = async () => {
    if (!amount || parseFloat(amount) <= 0) return alert("Enter valid amount");
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/trade`, 
        { type: tradeType, amount: parseFloat(amount), symbol: (coinSymbol || 'btc').toUpperCase() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);
      if (refreshUser) await refreshUser(); 
      setAmount('');
    } catch (err) { alert(err.response?.data?.message || "Trade failed"); } 
    finally { setLoading(false); }
  };

  return (
    <div className="p-4 md:p-8 flex flex-col lg:flex-row gap-6 bg-main-bg min-h-screen pb-24">
      {/* Chart Section - Optimized for Mobile */}
      <div className="flex-1 bg-card-bg border border-border rounded-[2rem] overflow-hidden h-[400px] md:h-[600px] shadow-2xl">
        <iframe title="TV" src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${(coinSymbol || 'btc').toUpperCase()}USDT&theme=dark&style=1&timezone=Etc%2FUTC`} style={{ width: '100%', height: '100%', border: 'none' }}></iframe>
      </div>
      {/* Trading Form */}
      <div className="w-full lg:w-96 bg-card-bg border border-border rounded-[2rem] p-6 shadow-2xl h-fit">
        <div className="flex gap-2 mb-6 p-1 bg-main-bg rounded-2xl">
          <button onClick={() => setTradeType('buy')} className={`flex-1 py-3 rounded-xl font-bold uppercase text-xs ${tradeType === 'buy' ? 'bg-success text-black' : 'text-gray-500'}`}>Buy</button>
          <button onClick={() => setTradeType('sell')} className={`flex-1 py-3 rounded-xl font-bold uppercase text-xs ${tradeType === 'sell' ? 'bg-danger text-white' : 'text-gray-500'}`}>Sell</button>
        </div>
        <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-2 uppercase">
            <span>Available</span>
            <span className="text-white">${user?.balance?.toLocaleString() || '0.00'}</span>
        </div>
        <input type="number" value={amount} onChange={(e)=>setAmount(e.target.value)} placeholder="Amount USDT" className="w-full bg-main-bg border border-border rounded-2xl p-4 text-white outline-none mb-4 font-mono" />
        <button disabled={loading} onClick={handleTrade} className={`w-full py-4 rounded-2xl font-bold uppercase ${tradeType === 'buy' ? 'bg-primary text-black' : 'bg-danger text-white'}`}>
          {loading ? "..." : `Execute ${tradeType}`}
        </button>
      </div>
    </div>
  );
};

// --- Dashboard Component ---
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
    <div className="p-4 md:p-8 space-y-6 bg-main-bg min-h-screen pb-24">
      <div className="bg-gradient-to-br from-card-bg to-main-bg p-8 rounded-[2.5rem] border border-border flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
        <div className="w-full text-center md:text-left">
          <p className="text-gray-500 text-[10px] uppercase tracking-widest font-black mb-2">Estimated Balance</p>
          <h1 className="text-4xl md:text-5xl font-mono font-black text-white">
            ${user?.balance !== undefined ? parseFloat(user.balance).toLocaleString() : '0.00'}
          </h1>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={() => navigate('/deposit')} className="flex-1 bg-primary text-black px-8 py-4 rounded-2xl font-black uppercase text-xs">Deposit</button>
          <button onClick={() => navigate('/withdraw')} className="flex-1 bg-white/5 text-white px-8 py-4 rounded-2xl font-black border border-border uppercase text-xs">Withdraw</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cryptoData.map((coin) => (
            <div key={coin.id} onClick={() => navigate(`/trade/${coin.symbol}`)} className="bg-card-bg p-6 rounded-[2rem] border border-border cursor-pointer hover:border-primary/50 transition-all">
              <div className="flex justify-between mb-4 text-[10px] font-black uppercase">
                <span className="text-primary">{coin.symbol.toUpperCase()}/USDT</span>
                <span className={coin.up ? 'text-success' : 'text-danger'}>{coin.change}%</span>
              </div>
              <p className="text-2xl font-black text-white font-mono">${coin.price}</p>
            </div>
          ))}
        </div>

        <div className="bg-card-bg border border-border rounded-[2.5rem] p-6 shadow-xl">
          <h3 className="text-white font-black uppercase text-[10px] mb-6 flex items-center gap-2">
            <Activity size={14} className="text-primary" /> Recent Activity
          </h3>
          <div className="space-y-4">
            {transactions.slice(0, 5).map((trx) => (
                <div key={trx._id} className="flex justify-between items-center p-3 hover:bg-white/[0.03] rounded-2xl border border-transparent hover:border-border">
                  <div className="flex items-center gap-2">
                    <div className={trx.type === 'deposit' ? 'text-success' : 'text-danger'}>
                      {trx.type === 'deposit' ? <ArrowDownLeft size={14}/> : <ArrowUpRight size={14}/>}
                    </div>
                    <div>
                      <p className="font-black text-[9px] text-white uppercase">{trx.type}</p>
                      <p className="text-[8px] text-gray-500">{new Date(trx.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-xs text-white">${trx.amount}</p>
                    <p className={`text-[8px] font-black uppercase ${trx.status === 'completed' ? 'text-success' : 'text-primary'}`}>{trx.status}</p>
                  </div>
                </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- AppContent (Mobile Bottom Nav Updated) ---
const AppContent = ({ cryptoData }) => {
  const { user, token, logout, loading: authLoading } = useContext(UserContext);
  const location = useLocation();

  if (authLoading) return <div className="min-h-screen bg-main-bg flex items-center justify-center text-primary font-black text-4xl italic animate-pulse">VINANCE</div>;

  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-main-bg text-white flex flex-col md:flex-row overflow-hidden">
      {/* Desktop Sidebar */}
      {token && !isHomePage && (
        <aside className="w-64 bg-card-bg border-r border-border hidden md:flex flex-col p-4 h-screen sticky top-0">
          <div className="mb-12 px-4 py-2 text-2xl font-black text-primary italic uppercase">VINANCE</div>
          <nav className="space-y-3 flex-1">
            <NavLink to="/dashboard" className={({isActive})=>`flex items-center gap-4 p-3.5 rounded-xl ${isActive?'text-primary bg-primary/10':'text-gray-400'}`}><LayoutDashboard size={20}/> Dashboard</NavLink>
            <NavLink to="/trade/btc" className={({isActive})=>`flex items-center gap-4 p-3.5 rounded-xl ${isActive?'text-primary bg-primary/10':'text-gray-400'}`}><TrendingUp size={20}/> Trade</NavLink>
            <NavLink to="/wallet" className={({isActive})=>`flex items-center gap-4 p-3.5 rounded-xl ${isActive?'text-primary bg-primary/10':'text-gray-400'}`}><Wallet size={20}/> Wallet</NavLink>
          </nav>
          <button onClick={logout} className="p-4 text-gray-500 hover:text-danger flex items-center gap-4 font-bold border-t border-border/50">
            <LogOut size={20}/> SIGN OUT
          </button>
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {token && !isHomePage && (
          <header className="h-16 border-b border-border bg-card-bg/80 flex items-center justify-between px-6 sticky top-0 z-30 backdrop-blur-md">
            <div className="font-black text-[9px] uppercase tracking-widest text-primary">VINANCE</div>
            <NotificationSystem />
          </header>
        )}

        <div className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={token ? <Dashboard cryptoData={cryptoData} /> : <Navigate to="/login" />} />
            <Route path="/trade/:coinSymbol" element={token ? <TradePage /> : <Navigate to="/login" />} />
            <Route path="/deposit" element={token ? <Deposit /> : <Navigate to="/login" />} />
            <Route path="/withdraw" element={token ? <Withdraw /> : <Navigate to="/login" />} />
            <Route path="/wallet" element={token ? <WalletPage /> : <Navigate to="/login" />} /> 
            <Route path="/admin" element={user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </main>

      {/* Mobile Bottom Navigation (Sign Out Added) */}
      {token && !isHomePage && (
        <nav className="fixed bottom-0 left-0 right-0 bg-card-bg border-t border-border flex justify-around py-4 md:hidden z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
          <NavLink to="/dashboard" className={({isActive})=> isActive ? "text-primary" : "text-gray-500"}><LayoutDashboard size={24}/></NavLink>
          <NavLink to="/trade/btc" className={({isActive})=> isActive ? "text-primary" : "text-gray-500"}><TrendingUp size={24}/></NavLink>
          <NavLink to="/wallet" className={({isActive})=> isActive ? "text-primary" : "text-gray-500"}><Wallet size={24}/></NavLink>
          {/* Mobile Logout Button */}
          <button onClick={logout} className="text-gray-500 hover:text-danger"><LogOut size={24}/></button>
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
        price: parseFloat(res.data.lastPrice).toLocaleString(),
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