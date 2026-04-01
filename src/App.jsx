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

// --- Futures Component (Modern & Responsive) ---
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
    <div className="flex flex-col min-h-screen bg-[#0b0e11] text-[#eaecef] font-sans">
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

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden lg:overflow-visible">
        <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-gray-900 min-h-[300px] md:min-h-[450px]">
          <div className="flex justify-between items-center px-4 py-1.5 text-[10px] text-gray-400 border-b border-gray-900 overflow-x-auto no-scrollbar">
            <div className="flex gap-3 whitespace-nowrap">
               <span className="text-[#f0b90b]">Time</span>
               {['15', '60', '240', 'D'].map(tf => (
                 <span key={tf} onClick={() => setTimeframe(tf)} className={`cursor-pointer ${timeframe === tf ? 'text-white' : ''}`}>
                   {tf === '240' ? '4h' : tf === '15' ? '15m' : tf}
                 </span>
               ))}
            </div>
            <Activity size={12} className="shrink-0 ml-2" />
          </div>
          <div className="flex-1 relative bg-black min-h-[300px]">
             <iframe 
               title="Futures Chart" 
               src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${currentCoin}USDT&interval=${timeframe}&theme=dark&style=1`} 
               className="absolute inset-0 w-full h-full border-none"
             ></iframe>
          </div>
        </div>

        <div className="w-full lg:w-[380px] flex flex-col md:flex-row lg:flex-col bg-[#0b0e11] pb-24 lg:pb-0">
          <div className="w-full md:w-[55%] lg:w-full p-4 space-y-4 border-b md:border-b-0 md:border-r lg:border-r-0 lg:border-b border-gray-900">
            <div className="flex gap-2">
              <button className="flex-1 bg-[#2b3139] py-2 rounded text-[11px] font-bold">Cross</button>
              <button className="flex-1 bg-[#2b3139] py-2 rounded text-[11px] font-bold">{leverage}x</button>
            </div>
            <div className="flex bg-[#2b3139] rounded overflow-hidden">
              <button onClick={() => setSide('buy')} className={`flex-1 py-2 text-[12px] font-bold transition-all ${side === 'buy' ? 'bg-[#02c076] text-[#0b0e11]' : 'text-gray-400'}`}>Buy</button>
              <button onClick={() => setSide('sell')} className={`flex-1 py-2 text-[12px] font-bold transition-all ${side === 'sell' ? 'bg-[#f6465d] text-white' : 'text-gray-400'}`}>Sell</button>
            </div>
            <div className="relative">
              <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-[#2b3139] rounded p-3 text-sm font-bold outline-none text-center" />
              <span className="absolute right-3 top-3 text-[10px] text-gray-500 uppercase">USDT</span>
            </div>
            <div className="flex justify-between px-1 relative items-center py-3">
               <div className="h-[1px] bg-gray-800 absolute w-full left-0 z-0"></div>
               {[0, 25, 50, 75, 100].map(dot => (
                 <div key={dot} className="w-2 h-2 rounded-full border border-gray-700 bg-[#0b0e11] z-10"></div>
               ))}
            </div>
            <button onClick={handleTrade} className={`w-full py-3 rounded-lg font-bold text-sm transition-all active:scale-95 ${side === 'buy' ? 'bg-[#02c076] text-[#0b0e11]' : 'bg-[#f6465d] text-white'}`}>
              {loading ? "..." : side === 'buy' ? "Open Long" : "Open Short"}
            </button>
          </div>
          <div className="w-full md:w-[45%] lg:w-full p-4 text-[10px] flex flex-col bg-[#0b0e11]">
            <div className="flex justify-between text-gray-500 mb-2 font-bold uppercase tracking-tighter"><span>Price(USDT)</span><span>Amount(Cont)</span></div>
            <div className="space-y-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between"><span className="text-[#f6465d] font-mono">67845.5</span><span className="text-gray-300">1.2k</span></div>
              ))}
            </div>
            <div className="text-center py-2 border-y border-gray-800 my-2"><div className="text-[#02c076] text-lg font-black font-mono">67,830.9</div></div>
            <div className="space-y-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between"><span className="text-[#02c076] font-mono">67828.2</span><span className="text-gray-300">850</span></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Trade Component (Existing) ---
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

  const handlePercentClick = (percent) => {
    if (!user?.balance) return;
    const calculated = (parseFloat(user.balance) * percent) / 100;
    setAmount(calculated.toFixed(2));
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0b0e11] text-[#eaecef]">
      <div className="flex justify-between items-center px-4 py-3 bg-[#0b0e11] sticky top-0 z-50 border-b border-[#1e2329]">
        <div className="flex items-center gap-3">
          <ChevronLeft size={24} className="text-gray-300 cursor-pointer" onClick={() => window.history.back()} />
          <div className="flex items-center gap-1">
            <span className="text-white font-bold text-lg">{currentCoin}/USDT</span>
            <span className="bg-[#2b3139] text-[9px] px-1 rounded text-gray-400 font-bold">Spot</span>
          </div>
        </div>
        <div className="flex gap-4 text-gray-400"><Star size={18} /><Bell size={18} /></div>
      </div>
      <div className="flex justify-between items-center px-4 py-2 text-[11px] text-gray-400 font-medium border-b border-[#1e2329] overflow-x-auto no-scrollbar">
        <div className="flex gap-4 whitespace-nowrap">
          <span className="text-[#f0b90b]">Time</span>
          {['15', '60', '240', 'D'].map((tf) => (
            <span key={tf} onClick={() => setTimeframe(tf)} className={`cursor-pointer ${timeframe === tf ? 'text-white border-b-2 border-[#f0b90b]' : ''}`}>
              {tf === '240' ? '4h' : tf === '60' ? '1h' : tf === '15' ? '15m' : tf}
            </span>
          ))}
        </div>
        <Activity size={14} className="shrink-0 ml-2" />
      </div>
      <div className="flex-1 w-full relative min-h-[350px]">
        <iframe title="TV" src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${currentCoin}USDT&interval=${timeframe}&theme=dark&style=1&timezone=Etc%2FUTC&hide_top_toolbar=true`} className="absolute inset-0 w-full h-full border-none"></iframe>
      </div>
      <div className="w-full bg-[#161a1e] border-t border-[#1e2329] p-4 pb-28 md:pb-6">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between mb-4">
            <div className="flex gap-6 text-xs font-bold uppercase tracking-wider">
              <button onClick={() => setActiveTab('buy')} className={`pb-1 ${activeTab === 'buy' ? 'text-[#00c076] border-b-2 border-[#00c076]' : 'text-gray-500'}`}>Buy</button>
              <button onClick={() => setActiveTab('sell')} className={`pb-1 ${activeTab === 'sell' ? 'text-[#f6465d] border-b-2 border-[#f6465d]' : 'text-gray-500'}`}>Sell</button>
            </div>
            <div className="text-[10px] text-gray-400 font-bold uppercase">Avbl: <span className="text-white">{user?.balance?.toLocaleString() || '0.00'} USDT</span></div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-3">
              <div className="relative">
                <input type="number" value={amount} onChange={(e)=>setAmount(e.target.value)} placeholder="0.00" className="w-full bg-[#2b3139] rounded py-3 px-4 text-white outline-none text-sm font-bold" />
                <span className="absolute right-4 top-3 text-gray-500 text-[10px] font-black tracking-tighter">USDT</span>
              </div>
              <div className="flex justify-between gap-2">
                {[25, 50, 75, 100].map(p => (
                  <button key={p} onClick={() => handlePercentClick(p)} className="flex-1 bg-[#2b3139] text-[10px] py-2 text-gray-400 rounded font-bold hover:bg-[#363d47] transition-colors">{p}%</button>
                ))}
              </div>
            </div>
            <button onClick={() => handleTrade(activeTab)} className={`w-full sm:w-40 py-4 rounded font-black text-sm uppercase transition-transform active:scale-95 ${activeTab === 'buy' ? 'bg-[#02c076] text-[#0b0e11]' : 'bg-[#f6465d] text-white'}`}>
              {loading ? '...' : activeTab === 'buy' ? 'Buy' : 'Sell'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Auth Components (Login/Register) ---
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
    <div className="min-h-screen bg-[#0b0e11] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#161a1e] border border-[#1e2329] rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
        <h1 className="text-3xl font-black text-[#f0b90b] mb-8 italic uppercase tracking-tighter text-center">VINANCE</h1>
        <form onSubmit={handleRegister} className="space-y-5">
          <input type="text" placeholder="Full Name" required onChange={(e)=>setFormData({...formData, name: e.target.value})} className="w-full bg-[#0b0e11] border border-[#1e2329] rounded-2xl py-4 px-5 text-white outline-none focus:border-[#f0b90b] text-sm" />
          <input type="email" placeholder="Email" required onChange={(e)=>setFormData({...formData, email: e.target.value})} className="w-full bg-[#0b0e11] border border-[#1e2329] rounded-2xl py-4 px-5 text-white outline-none focus:border-[#f0b90b] text-sm" />
          <input type="password" placeholder="Password" required onChange={(e)=>setFormData({...formData, password: e.target.value})} className="w-full bg-[#0b0e11] border border-[#1e2329] rounded-2xl py-4 px-5 text-white outline-none focus:border-[#f0b90b] text-sm" />
          <button disabled={loading} className="w-full bg-[#f0b90b] text-black py-4 rounded-2xl font-black uppercase text-sm tracking-widest mt-4 shadow-lg shadow-[#f0b90b]/10">{loading ? "Wait..." : "Register Now"}</button>
        </form>
        <p className="text-center mt-8 text-sm text-gray-500 font-bold">Already have an account? <Link to="/login" className="text-[#f0b90b] hover:underline ml-1">Log In</Link></p>
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
    <div className="min-h-screen bg-[#0b0e11] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#161a1e] border border-[#1e2329] rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
        <h1 className="text-3xl font-black text-[#f0b90b] mb-8 italic uppercase tracking-tighter text-center">VINANCE</h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <input type="email" placeholder="Email Address" required onChange={(e)=>setEmail(e.target.value)} className="w-full bg-[#0b0e11] border border-[#1e2329] rounded-2xl py-4 px-5 text-white outline-none focus:border-[#f0b90b] text-sm" />
          <input type="password" placeholder="Password" required onChange={(e)=>setPassword(e.target.value)} className="w-full bg-[#0b0e11] border border-[#1e2329] rounded-2xl py-4 px-5 text-white outline-none focus:border-[#f0b90b] text-sm" />
          <button type="submit" disabled={loading} className="w-full bg-[#f0b90b] text-black py-4 rounded-2xl font-black uppercase text-sm tracking-widest mt-2 shadow-lg shadow-[#f0b90b]/10">{loading ? "Authenticating..." : "Log In"}</button>
        </form>
        <p className="text-center mt-8 text-sm text-gray-500 font-bold">Don't have an account? <Link to="/register" className="text-[#f0b90b] hover:underline ml-1">Register</Link></p>
      </div>
    </div>
  );
};

// --- Main Pages ---
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
      <div className="bg-gradient-to-br from-[#161a1e] to-[#0b0e11] p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-[#1e2329] flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl relative overflow-hidden">
        <div className="w-full md:w-auto text-center md:text-left z-10">
          <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] font-black mb-2">Estimated Balance</p>
          <h1 className="text-3xl md:text-5xl font-mono font-black text-white tracking-tighter">
            ${user?.balance !== undefined ? parseFloat(user.balance).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
          </h1>
        </div>
        <div className="flex flex-row gap-3 w-full md:w-auto z-10">
          <button onClick={() => navigate('/deposit')} className="flex-1 bg-[#f0b90b] text-black px-6 md:px-8 py-3.5 rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-widest shadow-lg active:scale-95 transition-transform">Deposit</button>
          <button onClick={() => navigate('/withdraw')} className="flex-1 bg-white/5 text-white px-6 md:px-8 py-3.5 rounded-2xl font-black border border-[#1e2329] uppercase text-[10px] md:text-xs tracking-widest active:scale-95 transition-transform">Withdraw</button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-24 lg:pb-10">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cryptoData.map((coin) => (
            <div key={coin.id} onClick={() => navigate(`/trade/${coin.symbol}`)} className="bg-[#161a1e] p-6 rounded-[2rem] border border-[#1e2329] cursor-pointer hover:border-[#f0b90b]/50 transition-all shadow-lg active:scale-[0.98]">
              <div className="flex justify-between mb-4 text-[10px] font-black uppercase tracking-wider">
                <span className="text-[#f0b90b]">{coin.symbol.toUpperCase()}/USDT</span>
                <span className={coin.up ? 'text-[#00c076]' : 'text-[#f6465d]'}>{coin.up ? '+' : ''}{coin.change}%</span>
              </div>
              <p className="text-2xl font-black text-white tracking-tighter font-mono">${coin.price}</p>
            </div>
          ))}
        </div>
        
        <div className="bg-[#161a1e] border border-[#1e2329] rounded-[2.5rem] p-6 shadow-xl h-fit">
          <h3 className="text-white font-black uppercase text-[10px] mb-6 flex items-center gap-2 tracking-[0.2em]">
            <Activity size={14} className="text-[#f0b90b]" /> Recent Activity
          </h3>
          <div className="space-y-4">
            {transactions.length > 0 ? transactions.slice(0, 5).map((trx) => (
              <div key={trx._id} className="flex justify-between items-center p-3 hover:bg-white/[0.03] rounded-2xl border border-transparent hover:border-[#1e2329] transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${trx.type === 'deposit' ? 'bg-[#00c076]/10 text-[#00c076]' : 'bg-[#f6465d]/10 text-[#f6465d]'}`}>
                    {trx.type === 'deposit' ? <ArrowDownLeft size={16}/> : <ArrowUpRight size={16}/>}
                  </div>
                  <div>
                    <p className="font-black text-[10px] text-white uppercase tracking-tighter">{trx.type}</p>
                    <p className="text-[8px] text-gray-500 font-bold">{new Date(trx.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-xs text-white">${trx.amount}</p>
                  <p className={`text-[8px] font-black uppercase ${trx.status === 'completed' ? 'text-[#00c076]' : 'text-[#f0b90b]'}`}>{trx.status}</p>
                </div>
              </div>
            )) : <p className="text-center py-10 text-gray-600 text-[10px] font-black uppercase tracking-widest">No activity found</p>}
          </div>
          <button onClick={() => navigate('/wallet')} className="w-full mt-6 py-4 text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] border-t border-[#1e2329] hover:text-[#f0b90b] transition-colors">View All History</button>
        </div>
      </div>
    </div>
  );
};

const Market = ({ cryptoData }) => {
  const navigate = useNavigate();
  return (
    <div className="p-4 md:p-10 pb-32 bg-[#0b0e11] min-h-screen">
      <div className="mb-10"><h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter flex items-center gap-3 uppercase italic">Market <Activity className="text-[#f0b90b]" size={32} /></h2></div>
      <div className="bg-[#161a1e] rounded-[2rem] md:rounded-[2.5rem] border border-[#1e2329] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead className="bg-[#0b0e11]/50 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
              <tr><th className="p-6 text-left">Asset</th><th className="p-6 text-left">Price</th><th className="p-6 text-left">24h Change</th><th className="p-6 text-right">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-[#1e2329]">
              {cryptoData.map((coin) => (
                <tr key={coin.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="p-6 font-black text-white text-md uppercase">{coin.name} <span className="text-[10px] text-gray-500 ml-2 font-mono">{coin.symbol.toUpperCase()}</span></td>
                  <td className="p-6 font-mono font-black text-white tracking-tighter">${coin.price}</td>
                  <td className={`p-6 font-mono font-black ${coin.up ? 'text-[#00c076]' : 'text-[#f6465d]'}`}>{coin.up ? '+' : ''}{coin.change}%</td>
                  <td className="p-6 text-right"><button onClick={() => navigate(`/trade/${coin.symbol}`)} className="bg-[#f0b90b] text-black px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-tighter active:scale-95 transition-transform">Trade</button></td>
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
  <NavLink to={to} className={({ isActive }) => `flex items-center gap-4 p-4 rounded-2xl transition-all ${isActive ? 'text-[#f0b90b] bg-[#f0b90b]/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
    {icon} <span className="hidden lg:inline font-black text-[11px] uppercase tracking-[0.2em]">{label}</span>
  </NavLink>
);

// --- Layout & Content Wrapper ---
const AppContent = ({ cryptoData }) => {
  const { user, token, logout, loading: authLoading } = useContext(UserContext);
  const location = useLocation();
  if (authLoading) return <div className="min-h-screen bg-[#0b0e11] flex items-center justify-center text-[#f0b90b] font-black text-4xl uppercase animate-pulse italic tracking-tighter">VINANCE</div>;
  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const isHomePage = location.pathname === '/';
  if (!token && !isAuthPage && !isHomePage) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white flex flex-col md:flex-row overflow-hidden font-sans">
      {token && !isHomePage && (
        <aside className="w-20 lg:w-64 bg-[#161a1e] border-r border-[#1e2329] hidden md:flex flex-col p-5 h-screen sticky top-0 z-40">
          <div className="mb-12 px-4 py-2 text-2xl font-black text-[#f0b90b] italic uppercase tracking-tighter">VINANCE</div>
          <nav className="space-y-2 flex-1 overflow-y-auto no-scrollbar">
            <NavItem to="/dashboard" icon={<LayoutDashboard size={22}/>} label="Dashboard" />
            <NavItem to="/market" icon={<BarChart3 size={22}/>} label="Market" />
            <NavItem to={`/futures/${cryptoData[0]?.symbol || 'btc'}`} icon={<Zap size={22}/>} label="Futures" />
            <NavItem to={`/trade/${cryptoData[0]?.symbol || 'btc'}`} icon={<TrendingUp size={22}/>} label="Spot" />
            <NavItem to="/invest" icon={<PieChart size={22}/>} label="AI Invest" />
            <NavItem to="/wallet" icon={<Wallet size={22}/>} label="Wallet" />
            {user?.role === 'admin' && (
               <>
                 <div className="pt-6 pb-2 px-4 text-[9px] font-black text-gray-600 uppercase tracking-widest border-t border-[#1e2329] mt-6 mb-2">Admin Panel</div>
                 <NavItem to="/admin" icon={<ShieldCheck size={22}/>} label="Users" />
                 <NavItem to="/admin/manage-plans" icon={<PieChart size={22}/>} label="Plans" />
               </>
            )}
          </nav>
          <button onClick={logout} className="p-4 text-gray-500 hover:text-[#f6465d] flex items-center gap-4 font-black border-t border-[#1e2329] transition-colors mt-4">
            <LogOut size={22}/> <span className="hidden lg:inline text-[10px] uppercase tracking-widest">Sign Out</span>
          </button>
        </aside>
      )}

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {token && !isHomePage && (
          <header className="h-16 border-b border-[#1e2329] bg-[#161a1e]/90 flex items-center justify-between px-6 sticky top-0 z-40 backdrop-blur-lg">
            <div className="font-black text-[10px] uppercase tracking-[0.2em]">User: <span className="text-[#f0b90b] ml-1 font-mono italic">{user?.name}</span></div>
            <NotificationSystem />
          </header>
        )}
        <div className={`flex-1 overflow-y-auto bg-[#0b0e11] no-scrollbar ${token && !isHomePage ? 'pb-24 md:pb-0' : ''}`}>
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

      {token && !isHomePage && (
        <nav className="fixed bottom-0 left-0 right-0 bg-[#161a1e]/95 backdrop-blur-xl border-t border-[#1e2329] flex justify-around items-center py-4 md:hidden z-50 shadow-2xl">
          <NavLink to="/dashboard" className={({isActive})=> `transition-all ${isActive ? "text-[#f0b90b] scale-110" : "text-gray-500 hover:text-white"}`}><LayoutDashboard size={24}/></NavLink>
          <NavLink to={`/futures/${cryptoData[0]?.symbol || 'btc'}`} className={({isActive})=> `transition-all ${isActive ? "text-[#f0b90b] scale-110" : "text-gray-500 hover:text-white"}`}><Zap size={24}/></NavLink>
          <NavLink to={`/trade/${cryptoData[0]?.symbol || 'btc'}`} className={({isActive})=> `transition-all ${isActive ? "text-[#f0b90b] scale-110" : "text-gray-500 hover:text-white"}`}><TrendingUp size={24}/></NavLink>
          <NavLink to="/wallet" className={({isActive})=> `transition-all ${isActive ? "text-[#f0b90b] scale-110" : "text-gray-500 hover:text-white"}`}><Wallet size={24}/></NavLink>
          <button onClick={logout} className="text-gray-500 hover:text-[#f6465d] transition-colors"><LogOut size={24}/></button>
        </nav>
      )}
    </div>
  );
};

// --- App Entry Point ---
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