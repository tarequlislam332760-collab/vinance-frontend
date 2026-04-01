import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation, useNavigate, Link, Navigate, useParams } from 'react-router-dom';
import axios from 'axios'; 
import { 
  LayoutDashboard, BarChart3, TrendingUp, Wallet, LogOut, 
  ShieldCheck, Activity, ArrowUpRight, ArrowDownLeft,
  PieChart, ChevronLeft, Star, Bell, MoreHorizontal, LayoutGrid, Zap, ChevronDown, ListIcon, Settings, User
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

// --- 1. Login Component ---
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
      <div className="w-full max-w-md bg-[#161a1e] border border-[#1e2329] rounded-3xl p-10 shadow-2xl">
        <h1 className="text-3xl font-bold text-[#f0b90b] mb-6 italic uppercase tracking-tighter">VINANCE</h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <input type="email" placeholder="Email" required onChange={(e)=>setEmail(e.target.value)} className="w-full bg-[#0b0e11] border border-[#1e2329] rounded-xl py-3 px-4 text-white outline-none focus:border-[#f0b90b]" />
          <input type="password" placeholder="Password" required onChange={(e)=>setPassword(e.target.value)} className="w-full bg-[#0b0e11] border border-[#1e2329] rounded-xl py-3 px-4 text-white outline-none focus:border-[#f0b90b]" />
          <button type="submit" disabled={loading} className="w-full bg-[#f0b90b] text-black py-3.5 rounded-xl font-bold uppercase">{loading ? "Syncing..." : "Log In"}</button>
        </form>
        <p className="text-center mt-6 text-sm text-gray-400">Don't have an account? <Link to="/register" className="text-[#f0b90b] hover:underline">Register</Link></p>
      </div>
    </div>
  );
};

// --- 2. Register Component ---
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
      <div className="w-full max-w-md bg-[#161a1e] border border-[#1e2329] rounded-3xl p-10 shadow-2xl">
        <h1 className="text-3xl font-bold text-[#f0b90b] mb-6 italic uppercase tracking-tighter">VINANCE</h1>
        <form onSubmit={handleRegister} className="space-y-5">
          <input type="text" placeholder="Full Name" required onChange={(e)=>setFormData({...formData, name: e.target.value})} className="w-full bg-[#0b0e11] border border-[#1e2329] rounded-xl py-3 px-4 text-white outline-none focus:border-[#f0b90b]" />
          <input type="email" placeholder="Email" required onChange={(e)=>setFormData({...formData, email: e.target.value})} className="w-full bg-[#0b0e11] border border-[#1e2329] rounded-xl py-3 px-4 text-white outline-none focus:border-[#f0b90b]" />
          <input type="password" placeholder="Password" required onChange={(e)=>setFormData({...formData, password: e.target.value})} className="w-full bg-[#0b0e11] border border-[#1e2329] rounded-xl py-3 px-4 text-white outline-none focus:border-[#f0b90b]" />
          <button disabled={loading} className="w-full bg-[#f0b90b] text-black py-3.5 rounded-xl font-bold uppercase">{loading ? "Wait..." : "Register"}</button>
        </form>
        <p className="text-center mt-6 text-sm text-gray-400">Already have an account? <Link to="/login" className="text-[#f0b90b] hover:underline">Log In</Link></p>
      </div>
    </div>
  );
};

// --- Dashboard, Market, Trade, Futures Components remain as per your logic ---
// (বিবেচনা করে আপনার আগের সব পেজ কম্পোনেন্ট এখানে থাকবে...)

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
    <div className="p-4 md:p-8 text-left space-y-6 bg-[#0b0e11] min-h-screen">
      <div className="bg-gradient-to-br from-[#161a1e] to-[#0b0e11] p-6 rounded-[2.5rem] border border-[#1e2329] flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl relative overflow-hidden">
        <div className="w-full md:w-auto z-10 text-center md:text-left">
          <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] font-black mb-2">Estimated Balance</p>
          <h1 className="text-3xl md:text-5xl font-mono font-black text-white tracking-tighter">
            ${user?.balance !== undefined ? parseFloat(user.balance).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto z-10">
          <button onClick={() => navigate('/deposit')} className="flex-1 bg-[#f0b90b] text-black px-8 py-3.5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg active:scale-95 transition-all">Deposit</button>
          <button onClick={() => navigate('/withdraw')} className="flex-1 bg-white/5 text-white px-8 py-3.5 rounded-2xl font-black border border-[#1e2329] uppercase text-xs tracking-widest active:scale-95 transition-all">Withdraw</button>
        </div>
      </div>
      {/* Crypto Grid & Transactions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-10">
         <div className="lg:col-span-2 grid grid-cols-2 gap-4">
           {cryptoData.map((coin) => (
             <div key={coin.id} onClick={() => navigate(`/trade/${coin.symbol}`)} className="bg-[#161a1e] p-5 rounded-[2rem] border border-[#1e2329] cursor-pointer hover:border-[#f0b90b]/50 transition-all shadow-lg">
               <div className="flex justify-between mb-4 text-[10px] font-black uppercase">
                 <span className="text-[#f0b90b]">{coin.symbol.toUpperCase()}/USDT</span>
                 <span className={coin.up ? 'text-[#00c076]' : 'text-[#f6465d]'}>{coin.change}%</span>
               </div>
               <p className="text-xl md:text-2xl font-black text-white tracking-tighter font-mono">${coin.price}</p>
             </div>
           ))}
         </div>
      </div>
    </div>
  );
};

// --- Layout & Global UI Logic ---

const NavItem = ({ to, icon, label }) => (
  <NavLink to={to} className={({ isActive }) => `flex items-center gap-4 p-3.5 rounded-xl transition-all ${isActive ? 'text-[#f0b90b] bg-[#f0b90b]/10 shadow-[inset_0_0_10px_rgba(240,185,11,0.05)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
    {icon} <span className="hidden lg:inline font-black text-xs uppercase tracking-widest">{label}</span>
  </NavLink>
);

const MobileHubItem = ({ to, icon, label, close }) => (
  <NavLink to={to} onClick={close} className={({isActive}) => `flex flex-col items-center gap-2 ${isActive ? 'text-[#f0b90b]' : 'text-gray-400'}`}>
    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 active:scale-90 transition-transform">
      {icon}
    </div>
    <span className="text-[10px] font-bold uppercase">{label}</span>
  </NavLink>
);

const AppContent = ({ cryptoData }) => {
  const { user, token, logout, loading: authLoading } = useContext(UserContext);
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (authLoading) return <div className="min-h-screen bg-[#0b0e11] flex items-center justify-center text-[#f0b90b] font-black text-4xl uppercase animate-pulse italic tracking-tighter">VINANCE</div>;
  
  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const isHomePage = location.pathname === '/';
  
  if (!token && !isAuthPage && !isHomePage) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white flex flex-col md:flex-row overflow-hidden text-left font-sans">
      
      {/* Desktop Sidebar (Left) */}
      {token && !isHomePage && (
        <aside className="w-20 lg:w-64 bg-[#161a1e] border-r border-[#1e2329] hidden md:flex flex-col p-4 h-screen sticky top-0 z-40">
          <div className="mb-12 px-4 py-2 text-2xl font-black text-[#f0b90b] italic uppercase tracking-tighter">VINANCE</div>
          <nav className="space-y-3 flex-1 overflow-y-auto no-scrollbar">
            <NavItem to="/dashboard" icon={<LayoutDashboard size={20}/>} label="Dashboard" />
            <NavItem to="/market" icon={<BarChart3 size={20}/>} label="Market" />
            <NavItem to={`/futures/${cryptoData[0]?.symbol || 'btc'}`} icon={<Zap size={20}/>} label="Futures" />
            <NavItem to={`/trade/${cryptoData[0]?.symbol || 'btc'}`} icon={<TrendingUp size={20}/>} label="Spot" />
            <NavItem to="/invest" icon={<PieChart size={20}/>} label="AI Invest" />
            <NavItem to="/wallet" icon={<Wallet size={20}/>} label="Wallet" />
            {user?.role === 'admin' && (
               <>
                 <div className="pt-6 pb-2 px-4 text-[9px] font-black text-gray-600 uppercase tracking-widest border-t border-[#1e2329] mt-4">Admin</div>
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

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {token && !isHomePage && (
          <header className="h-16 border-b border-[#1e2329] bg-[#161a1e]/80 flex items-center justify-between px-6 sticky top-0 z-30 backdrop-blur-md">
            <div className="font-black text-[9px] uppercase tracking-[0.2em]">User: <span className="text-[#f0b90b] ml-1">{user?.name}</span></div>
            <NotificationSystem />
          </header>
        )}
        
        <div className={`flex-1 overflow-y-auto bg-[#0b0e11] no-scrollbar ${token && !isHomePage ? 'pb-24 md:pb-8' : ''}`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard cryptoData={cryptoData} />} />
            {/* ... Add other routes as needed ... */}
          </Routes>
        </div>
      </main>

      {/* --- MOBILE NAVIGATION SYSTEM (10 PAGES SUPPORT) --- */}
      {token && !isHomePage && (
        <>
          {/* Main Bottom Bar */}
          <nav className="fixed bottom-0 left-0 right-0 bg-[#161a1e]/95 backdrop-blur-xl border-t border-[#1e2329] flex justify-around items-center py-3 md:hidden z-[60] px-2 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
            <NavLink to="/dashboard" className={({isActive})=> isActive ? "text-[#f0b90b]" : "text-gray-400"}><LayoutDashboard size={22}/></NavLink>
            <NavLink to="/market" className={({isActive})=> isActive ? "text-[#f0b90b]" : "text-gray-400"}><BarChart3 size={22}/></NavLink>
            
            {/* Center Highlighted Trade Button */}
            <NavLink to={`/trade/${cryptoData[0]?.symbol || 'btc'}`} className="bg-[#f0b90b] text-black p-3.5 rounded-full mt-[-35px] shadow-lg shadow-[#f0b90b]/30 active:scale-90 transition-transform">
                <TrendingUp size={24}/>
            </NavLink>

            <NavLink to="/wallet" className={({isActive})=> isActive ? "text-[#f0b90b]" : "text-gray-400"}><Wallet size={22}/></NavLink>
            
            {/* The "More" Menu Trigger */}
            <button onClick={() => setIsMobileMenuOpen(true)} className="text-gray-400 active:text-[#f0b90b]"><LayoutGrid size={22}/></button>
          </nav>

          {/* Full-Screen Mobile Hub (Overlay) */}
          <div className={`fixed inset-0 bg-[#0b0e11]/98 z-[100] transition-all duration-500 transform ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'} md:hidden overflow-y-auto`}>
            <div className="p-6 pt-16">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-black italic text-[#f0b90b] uppercase">Services</h2>
                <button onClick={() => setIsMobileMenuOpen(false)} className="bg-white/10 p-2 rounded-full"><ChevronDown size={28} /></button>
              </div>

              {/* 10+ Pages Grid */}
              <div className="grid grid-cols-3 gap-y-8 gap-x-4">
                <MobileHubItem to="/dashboard" icon={<LayoutDashboard size={24}/>} label="Home" close={() => setIsMobileMenuOpen(false)} />
                <MobileHubItem to="/market" icon={<BarChart3 size={24}/>} label="Market" close={() => setIsMobileMenuOpen(false)} />
                <MobileHubItem to="/futures/btc" icon={<Zap size={24}/>} label="Futures" close={() => setIsMobileMenuOpen(false)} />
                <MobileHubItem to="/invest" icon={<PieChart size={24}/>} label="AI Invest" close={() => setIsMobileMenuOpen(false)} />
                <MobileHubItem to="/my-investments" icon={<Activity size={24}/>} label="History" close={() => setIsMobileMenuOpen(false)} />
                <MobileHubItem to="/deposit" icon={<ArrowDownLeft size={24} className="text-[#00c076]"/>} label="Deposit" close={() => setIsMobileMenuOpen(false)} />
                <MobileHubItem to="/withdraw" icon={<ArrowUpRight size={24} className="text-[#f6465d]"/>} label="Withdraw" close={() => setIsMobileMenuOpen(false)} />
                <MobileHubItem to="/wallet" icon={<Wallet size={24}/>} label="Wallet" close={() => setIsMobileMenuOpen(false)} />
                <MobileHubItem to="/profile" icon={<User size={24}/>} label="Profile" close={() => setIsMobileMenuOpen(false)} />
                <MobileHubItem to="/settings" icon={<Settings size={24}/>} label="Settings" close={() => setIsMobileMenuOpen(false)} />

                {user?.role === 'admin' && (
                    <MobileHubItem to="/admin" icon={<ShieldCheck size={24} className="text-[#f0b90b]"/>} label="Admin" close={() => setIsMobileMenuOpen(false)} />
                )}
                
                {/* Logout Button in Hub */}
                <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="flex flex-col items-center gap-2 text-red-500">
                  <div className="bg-red-500/10 p-4 rounded-2xl border border-red-500/20"><LogOut size={24}/></div>
                  <span className="text-[10px] font-bold uppercase">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default function App() {
  const [cryptoData, setCryptoData] = useState([
    { id: '1', name: 'Bitcoin', symbol: 'btc', price: '68,245.2', change: '2.45', up: true },
    { id: '2', name: 'Ethereum', symbol: 'eth', price: '3,450.1', change: '1.20', up: true },
    { id: '3', name: 'Solana', symbol: 'sol', price: '145.8', change: '4.15', up: false },
    { id: '4', name: 'BNB', symbol: 'bnb', price: '590.2', change: '0.85', up: true }
  ]);

  return (
    <BrowserRouter>
      <UserProvider>
        <AppContent cryptoData={cryptoData} />
      </UserProvider>
    </BrowserRouter>
  );
}