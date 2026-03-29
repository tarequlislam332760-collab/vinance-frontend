import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation, useNavigate, Link, Navigate, useParams } from 'react-router-dom';
import axios from 'axios'; 
import { 
  LayoutDashboard, BarChart3, TrendingUp, Wallet, LogOut, 
  ShieldCheck, Activity, ArrowUpRight, ArrowDownLeft,
  PieChart // নতুন আইকন ইনভেস্টমেন্টের জন্য
} from 'lucide-react';

import { UserProvider, UserContext } from './context/UserContext'; 
import Home from './pages/Home'; 
import NotificationSystem from './components/NotificationSystem'; 
import AdminPanel from './admin/AdminPanel';
import Deposit from './pages/Deposit'; 
import Withdraw from './pages/Withdraw'; 
import WalletPage from './pages/Wallet';

// --- নতুন ইনভেস্টমেন্ট ফাইলগুলো ইম্পোর্ট করা হলো ---
import Investment from './pages/Investment'; 
import MyInvestments from './pages/MyInvestments';
import ManagePlans from './admin/ManagePlans';
import InvestmentLogs from './admin/InvestmentLogs';

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
      alert("Registration Successful! Please Login.");
      navigate('/login');
    } catch (err) { 
      alert(err.response?.data?.message || "Error during registration"); 
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-main-bg flex items-center justify-center p-6 text-left">
      <div className="w-full max-w-md bg-card-bg border border-border rounded-3xl p-10 shadow-2xl">
        <h1 className="text-3xl font-bold text-primary mb-6 italic uppercase tracking-tighter">VINANCE</h1>
        <form onSubmit={handleRegister} className="space-y-5">
          <input type="text" placeholder="Full Name" required onChange={(e)=>setFormData({...formData, name: e.target.value})} className="w-full bg-main-bg border border-border rounded-xl py-3 px-4 text-white outline-none focus:border-primary" />
          <input type="email" placeholder="Email" required onChange={(e)=>setFormData({...formData, email: e.target.value})} className="w-full bg-main-bg border border-border rounded-xl py-3 px-4 text-white outline-none focus:border-primary" />
          <input type="password" placeholder="Password" required onChange={(e)=>setFormData({...formData, password: e.target.value})} className="w-full bg-main-bg border border-border rounded-xl py-3 px-4 text-white outline-none focus:border-primary" />
          <button disabled={loading} className="w-full bg-primary text-white py-3.5 rounded-xl font-bold uppercase hover:bg-primary-hover transition-colors">{loading ? "Wait..." : "Register"}</button>
        </form>
        <p className="text-center mt-6 text-sm text-gray-400">Already have an account? <Link to="/login" className="text-primary hover:underline">Log In</Link></p>
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
    <div className="min-h-screen bg-main-bg flex items-center justify-center p-6 text-left">
      <div className="w-full max-w-md bg-card-bg border border-border rounded-3xl p-10 shadow-2xl">
        <h1 className="text-3xl font-bold text-primary mb-6 italic uppercase tracking-tighter">VINANCE</h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <input type="email" placeholder="Email" required onChange={(e)=>setEmail(e.target.value)} className="w-full bg-main-bg border border-border rounded-xl py-3 px-4 text-white outline-none focus:border-primary" />
          <input type="password" placeholder="Password" required onChange={(e)=>setPassword(e.target.value)} className="w-full bg-main-bg border border-border rounded-xl py-3 px-4 text-white outline-none focus:border-primary" />
          <button type="submit" disabled={loading} className="w-full bg-primary text-white py-3.5 rounded-xl font-bold uppercase hover:bg-primary-hover transition-colors">{loading ? "Syncing..." : "Log In"}</button>
        </form>
        <p className="text-center mt-6 text-sm text-gray-400">Don't have an account? <Link to="/register" className="text-primary hover:underline">Register</Link></p>
      </div>
    </div>
  );
};

// --- TradePage Component ---
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
    } catch (err) { 
      alert(err.response?.data?.message || "Trade failed"); 
    } finally { setLoading(false); }
  };

  return (
    <div className="p-4 md:p-8 flex flex-col lg:flex-row gap-6 text-left bg-main-bg pb-32 md:pb-8">
      <div className="flex-1 bg-card-bg border border-border rounded-[2rem] overflow-hidden h-[400px] md:h-[500px] shadow-2xl">
        <iframe title="TV" src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${(coinSymbol || 'btc').toUpperCase()}USDT&theme=dark`} style={{ width: '100%', height: '100%', border: 'none' }}></iframe>
      </div>
      <div className="w-full lg:w-96 bg-card-bg border border-border rounded-[2rem] p-6 md:p-8 shadow-2xl h-fit">
        <div className="flex gap-2 mb-6 p-1 bg-main-bg rounded-2xl">
          <button onClick={() => setTradeType('buy')} className={`flex-1 py-3 rounded-xl font-bold uppercase text-xs ${tradeType === 'buy' ? 'bg-[#1aa07b] text-white' : 'text-gray-500'}`}>Buy</button>
          <button onClick={() => setTradeType('sell')} className={`flex-1 py-3 rounded-xl font-bold uppercase text-xs ${tradeType === 'sell' ? 'bg-danger text-white' : 'text-gray-500'}`}>Sell</button>
        </div>
        <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest">
            <span>Available Balance</span>
            <span className="text-white">${user?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}</span>
        </div>
        <input type="number" value={amount} onChange={(e)=>setAmount(e.target.value)} placeholder="0.00 USDT" className="w-full bg-main-bg border border-border rounded-2xl p-4 text-white outline-none mb-4 font-mono focus:border-primary" />
        <button disabled={loading} onClick={handleTrade} className={`w-full py-4 rounded-2xl font-bold uppercase tracking-widest ${tradeType === 'buy' ? 'bg-primary text-white' : 'bg-danger text-white'}`}>
          {loading ? "Processing..." : `Execute ${tradeType}`}
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
    <div className="p-4 md:p-8 text-left space-y-6 md:space-y-10 bg-main-bg min-h-screen">
      <div className="bg-gradient-to-br from-card-bg to-main-bg p-6 md:p-8 rounded-[2.5rem] border border-border flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform hidden md:block text-primary"><Activity size={100} /></div>
        <div className="w-full md:w-auto z-10 text-center md:text-left">
          <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] font-black mb-2">Estimated Balance</p>
          <h1 className="text-3xl md:text-5xl font-mono font-black text-white tracking-tighter">
            ${user?.balance !== undefined ? parseFloat(user.balance).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto z-10">
          <button onClick={() => navigate('/deposit')} className="flex-1 bg-primary text-white px-8 py-3.5 md:py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-primary-hover transition-all">Deposit</button>
          <button onClick={() => navigate('/withdraw')} className="flex-1 bg-white/5 text-white px-8 py-3.5 md:py-4 rounded-2xl font-black border border-border uppercase text-xs tracking-widest hover:bg-white/10 transition-all">Withdraw</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 pb-10">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cryptoData.map((coin) => (
            <div key={coin.id} onClick={() => navigate(`/trade/${coin.symbol}`)} className="bg-card-bg p-5 md:p-6 rounded-[2rem] border border-border cursor-pointer hover:border-primary/50 transition-all group shadow-lg">
              <div className="flex justify-between mb-4 text-[10px] font-black uppercase tracking-widest">
                <span className="text-primary">{coin.symbol.toUpperCase()}/USDT</span>
                <span className={coin.up ? 'text-success' : 'text-danger'}>{coin.change}%</span>
              </div>
              <p className="text-xl md:text-2xl font-black text-white tracking-tighter font-mono">${coin.price}</p>
            </div>
          ))}
        </div>

        <div className="bg-card-bg border border-border rounded-[2.5rem] p-6 shadow-xl h-fit">
          <h3 className="text-white font-black uppercase text-[10px] mb-6 flex items-center gap-2 tracking-[0.2em]">
            <Activity size={14} className="text-primary" /> Recent Activity
          </h3>
          <div className="space-y-4">
            {transactions.length > 0 ? (
              transactions.slice(0, 5).map((trx) => (
                <div key={trx._id} className="flex justify-between items-center p-3 hover:bg-white/[0.03] rounded-2xl border border-transparent hover:border-border transition-all">
                  <div className="flex items-center gap-2">
                    <div className={trx.type === 'deposit' ? 'text-success' : 'text-danger'}>
                      {trx.type === 'deposit' ? <ArrowDownLeft size={14}/> : <ArrowUpRight size={14}/>}
                    </div>
                    <div>
                      <p className="font-black text-[9px] text-white uppercase">{trx.type}</p>
                      <p className="text-[8px] text-gray-500 font-bold">{new Date(trx.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-xs text-white">${trx.amount}</p>
                    <p className={`text-[8px] font-black uppercase ${trx.status === 'completed' ? 'text-success' : 'text-primary'}`}>{trx.status}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-10 text-gray-600 text-[10px] font-black uppercase tracking-widest italic">No activity yet</p>
            )}
          </div>
          <button onClick={() => navigate('/wallet')} className="w-full mt-6 py-3 text-[9px] font-black text-gray-500 uppercase tracking-widest border-t border-border hover:text-primary transition-all">View All History</button>
        </div>
      </div>
    </div>
  );
};

// --- Market Component ---
const Market = ({ cryptoData }) => {
  const navigate = useNavigate();
  return (
    <div className="p-4 md:p-10 text-left pb-32 md:pb-10 bg-main-bg min-h-screen">
      <div className="mb-10"><h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter flex items-center gap-3">Market <Activity className="text-primary" size={32} /></h2></div>
      <div className="bg-card-bg rounded-[2.5rem] border border-border overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-main-bg/50 text-[10px] font-black text-gray-500 uppercase tracking-widest">
              <tr><th className="p-6 md:p-8 text-left">Asset</th><th className="p-6 md:p-8 text-left">Price</th><th className="p-6 md:p-8 text-left">24h Change</th><th className="p-8 text-right">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {cryptoData.map((coin) => (
                <tr key={coin.id} className="hover:bg-white/[0.03] group">
                  <td className="p-6 md:p-8 font-black text-white text-md md:text-lg uppercase">{coin.name} <span className="text-[10px] text-gray-500 ml-2">{coin.symbol.toUpperCase()}</span></td>
                  <td className="p-6 md:p-8 font-mono font-black text-md md:text-lg text-white">${coin.price}</td>
                  <td className={`p-6 md:p-8 font-mono font-black ${coin.up ? 'text-success' : 'text-danger'}`}>{coin.up ? '+' : ''}{coin.change}%</td>
                  <td className="p-8 text-right"><button onClick={() => navigate(`/trade/${coin.symbol}`)} className="bg-primary text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase">Trade</button></td>
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
  <NavLink to={to} className={({ isActive }) => `flex items-center gap-4 p-3.5 rounded-xl transition-all ${isActive ? 'text-primary bg-primary/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
    {icon} <span className="hidden lg:inline font-black text-xs uppercase tracking-widest">{label}</span>
  </NavLink>
);

// --- Main Layout/AppContent ---
const AppContent = ({ cryptoData }) => {
  const { user, token, logout, loading: authLoading } = useContext(UserContext);
  const location = useLocation();

  if (authLoading) return <div className="min-h-screen bg-main-bg flex items-center justify-center text-primary font-black text-4xl uppercase italic animate-pulse">VINANCE</div>;

  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const isHomePage = location.pathname === '/';

  if (!token && !isAuthPage && !isHomePage) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-main-bg text-white flex flex-col md:flex-row overflow-hidden text-left font-sans">
      {/* Desktop Sidebar */}
      {token && !isHomePage && (
        <aside className="w-20 lg:w-64 bg-card-bg border-r border-border hidden md:flex flex-col p-4 h-screen sticky top-0 z-40">
          <div className="mb-12 px-4 py-2 text-2xl font-black text-primary italic uppercase tracking-tighter">VINANCE</div>
          <nav className="space-y-3 flex-1 overflow-y-auto">
            <NavItem to="/dashboard" icon={<LayoutDashboard size={20}/>} label="Dashboard" />
            <NavItem to="/market" icon={<BarChart3 size={20}/>} label="Market" />
            <NavItem to="/trade/btc" icon={<TrendingUp size={20}/>} label="Trade" />
            
            {/* --- New Investment Links --- */}
            <NavItem to="/invest" icon={<PieChart size={20}/>} label="AI Invest" />
            <NavItem to="/my-investments" icon={<Activity size={20}/>} label="Invest Logs" />
            
            <NavItem to="/wallet" icon={<Wallet size={20}/>} label="Wallet" />

            {/* Admin Controls */}
            {user?.role === 'admin' && (
               <>
                 <div className="pt-6 pb-2 px-4 text-[9px] font-black text-gray-600 uppercase tracking-widest border-t border-border/30 mt-4">Management</div>
                 <NavItem to="/admin" icon={<ShieldCheck size={20}/>} label="Users & Deposit" />
                 <NavItem to="/admin/manage-plans" icon={<PieChart size={20}/>} label="Plan Settings" />
                 <NavItem to="/admin/investment-logs" icon={<TrendingUp size={20}/>} label="All Investments" />
               </>
            )}
          </nav>
          <button onClick={logout} className="p-4 text-gray-500 hover:text-danger flex items-center gap-4 font-bold border-t border-border/50">
            <LogOut size={20}/> <span className="hidden lg:inline text-[10px] font-black uppercase">Sign Out</span>
          </button>
        </aside>
      )}

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {token && !isHomePage && (
          <header className="h-16 border-b border-border bg-card-bg/80 flex items-center justify-between px-6 sticky top-0 z-30 backdrop-blur-md">
            <div className="font-black text-[9px] uppercase tracking-[0.2em]">User: <span className="text-primary ml-1">{user?.name}</span></div>
            <NotificationSystem />
          </header>
        )}

        <div className={`flex-1 overflow-y-auto bg-main-bg ${token && !isHomePage ? 'pb-32 md:pb-8' : ''}`}>
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

            {/* --- নতুন ইনভেস্টমেন্ট রাউটগুলো --- */}
            <Route path="/invest" element={<Investment />} />
            <Route path="/my-investments" element={<MyInvestments />} />
            
            {/* Admin Protected Routes */}
            <Route path="/admin" element={user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/dashboard" />} />
            <Route path="/admin/manage-plans" element={user?.role === 'admin' ? <ManagePlans /> : <Navigate to="/dashboard" />} />
            <Route path="/admin/investment-logs" element={user?.role === 'admin' ? <InvestmentLogs /> : <Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      {token && !isHomePage && (
        <nav className="fixed bottom-0 left-0 right-0 bg-card-bg border-t border-border flex justify-around items-center py-5 md:hidden z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
          <NavLink to="/dashboard" className={({isActive})=> isActive ? "text-primary" : "text-gray-400"}><LayoutDashboard size={22}/></NavLink>
          <NavLink to="/invest" className={({isActive})=> isActive ? "text-primary" : "text-gray-400"}><PieChart size={22}/></NavLink>
          <NavLink to="/trade/btc" className={({isActive})=> isActive ? "text-primary" : "text-gray-400"}><TrendingUp size={22}/></NavLink>
          <NavLink to="/wallet" className={({isActive})=> isActive ? "text-primary" : "text-gray-400"}><Wallet size={22}/></NavLink>
          {user?.role === 'admin' && <NavLink to="/admin" className={({isActive})=> isActive ? "text-primary" : "text-gray-400"}><ShieldCheck size={22}/></NavLink>}
          <button onClick={logout} className="text-gray-400 hover:text-danger"><LogOut size={22}/></button>
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