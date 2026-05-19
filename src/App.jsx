import React, { useState, useEffect, useContext } from 'react';
import {
  BrowserRouter, Routes, Route, NavLink,
  useLocation, useNavigate, Link, Navigate
} from 'react-router-dom';
import axios from 'axios';
import {
  LayoutDashboard, BarChart3, TrendingUp, Wallet, LogOut,
  ShieldCheck, Activity, ArrowUpRight, ArrowDownLeft,
  PieChart, LayoutGrid, Zap, History, Gavel, Copy,
  MessageSquare, X
} from 'lucide-react';

import { UserProvider, UserContext } from './context/UserContext';
import NotificationSystem from './components/NotificationSystem';

import Home          from './pages/Home';
import Login         from './pages/Login';
import Register      from './pages/Register';
import BecomeTrader  from './pages/BecomeTrader';
import Profile       from './pages/Profile';
import Deposit       from './pages/Deposit';
import Withdraw      from './pages/Withdraw';
import WalletPage    from './pages/Wallet';
import Investment    from './pages/Investment';
import MyInvestments from './pages/MyInvestments';
import TraderProfile from './pages/TraderProfile';
import Futures       from './pages/Futures';
import Trade         from './pages/Trade';
import Market        from './pages/Market';
import CopyTrade     from './pages/CopyTrade';
import Square        from './pages/Square';
import HistoryPage   from './pages/History';

import AdminPanel  from './admin/AdminPanel';
import ManagePlans from './admin/ManagePlans';

const API_URL = "https://vinance-backend-1.onrender.com";

/* ─── NavItem ─── */
const NavItem = ({ to, icon, label }) => (
  <NavLink to={to} className={({ isActive }) =>
    `flex items-center gap-3 p-3 rounded-xl transition-all ${
      isActive
        ? 'text-[#f0b90b] bg-[#f0b90b]/10'
        : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`}>
    {icon}
    <span className="hidden lg:inline font-black text-[10px] uppercase tracking-widest">{label}</span>
  </NavLink>
);

/* ─── Dashboard ─── */
const Dashboard = ({ cryptoData }) => {
  const { user, refreshUser, token } = useContext(UserContext);
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (refreshUser) refreshUser();
    if (!token) return;
    axios.get(`${API_URL}/api/transactions`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => setTransactions(Array.isArray(r.data) ? r.data : []))
      .catch(() => {});
  }, [token]);

  return (
    <div className="p-4 md:p-6 space-y-5 bg-[#0b0e11] min-h-screen">
      {/* Balance */}
      <div className="bg-gradient-to-br from-[#161a1e] to-[#0b0e11] p-5 rounded-2xl border border-[#1e2329] flex flex-col sm:flex-row justify-between items-center gap-4 shadow-xl">
        <div className="text-center sm:text-left">
          <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] font-black mb-1">
            Estimated Balance
          </p>
          <h1 className="text-3xl sm:text-4xl font-mono font-black text-white tracking-tighter">
            ${(user?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h1>
          <p className="text-[10px] text-gray-500 mt-1">USDT</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button onClick={() => navigate('/deposit')}
            className="flex-1 sm:flex-none bg-[#f0b90b] text-black px-6 py-3 rounded-xl font-black uppercase text-xs hover:bg-[#d4a30a] transition-all">
            Deposit
          </button>
          <button onClick={() => navigate('/withdraw')}
            className="flex-1 sm:flex-none bg-white/5 text-white px-6 py-3 rounded-xl font-black border border-[#1e2329] uppercase text-xs hover:bg-white/10 transition-all">
            Withdraw
          </button>
        </div>
      </div>

      {/* Crypto grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cryptoData.slice(0, 4).map(coin => (
          <div key={coin.id} onClick={() => navigate(`/trade/${coin.symbol}`)}
            className="bg-[#161a1e] p-4 rounded-2xl border border-[#1e2329] cursor-pointer hover:border-[#f0b90b]/50 transition-all">
            <div className="flex justify-between mb-2 text-[10px] font-black uppercase">
              <span className="text-[#f0b90b]">{coin.symbol.toUpperCase()}</span>
              <span className={coin.up ? 'text-[#00c076]' : 'text-[#f6465d]'}>{coin.change}%</span>
            </div>
            <p className="text-lg font-black text-white font-mono">${coin.price}</p>
          </div>
        ))}
      </div>

      {/* Activity + Quick nav */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-[#161a1e] border border-[#1e2329] rounded-2xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-black uppercase text-[10px] flex items-center gap-2 tracking-widest">
              <Activity size={14} className="text-[#f0b90b]" /> Recent Activity
            </h3>
            <Link to="/history" className="text-[#f0b90b] text-[10px] font-black uppercase hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-2">
            {transactions.slice(0, 6).map(trx => (
              <div key={trx._id} className="flex justify-between items-center p-3 hover:bg-white/[0.03] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    trx.type === 'deposit' ? 'bg-[#00c076]/10' : 'bg-[#f6465d]/10'
                  }`}>
                    {trx.type === 'deposit'
                      ? <ArrowDownLeft size={14} className="text-[#00c076]" />
                      : <ArrowUpRight  size={14} className="text-[#f6465d]" />}
                  </div>
                  <div>
                    <p className="font-black text-[10px] text-white uppercase">{trx.type}</p>
                    <p className="text-[9px] text-gray-500">
                      {new Date(trx.createdAt || trx.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-xs text-white">${trx.amount}</p>
                  <p className={`text-[9px] font-black uppercase ${
                    trx.status === 'approved' || trx.status === 'completed'
                      ? 'text-[#00c076]' : 'text-[#f0b90b]'
                  }`}>{trx.status}</p>
                </div>
              </div>
            ))}
            {!transactions.length && (
              <p className="text-gray-600 text-xs text-center py-8">No transactions yet</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 content-start">
          {[
            { label: 'Market',     icon: '📊', path: '/market'      },
            { label: 'Futures',    icon: '⚡', path: '/futures/btc' },
            { label: 'Copy Trade', icon: '📋', path: '/copy-trade'  },
            { label: 'Square',     icon: '🌐', path: '/square'      },
          ].map(item => (
            <div key={item.label} onClick={() => navigate(item.path)}
              className="bg-[#161a1e] border border-[#1e2329] rounded-xl p-4 cursor-pointer hover:border-[#f0b90b]/50 text-center transition-all flex items-center gap-3 lg:block">
              <span className="text-2xl lg:mb-1 lg:block">{item.icon}</span>
              <p className="text-white font-black text-xs uppercase">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── AppContent ─── */
const AppContent = ({ cryptoData }) => {
  const { user, token, logout, loading: authLoading } = useContext(UserContext);
  const location = useLocation();
  const navigate  = useNavigate();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0b0e11] flex items-center justify-center text-[#f0b90b] font-black text-3xl animate-pulse italic">
        VINANCE
      </div>
    );
  }

  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const isHomePage = location.pathname === '/';
  const isFullPage = location.pathname.startsWith('/square') ||
                     location.pathname.startsWith('/market');

  if (!token && !isAuthPage && !isHomePage) return <Navigate to="/login" replace />;

  const userPages = [
    { to: '/dashboard',                               icon: <LayoutDashboard size={20} />, label: 'Home'       },
    { to: '/market',                                  icon: <BarChart3 size={20} />,       label: 'Market'     },
    { to: '/futures/btc',                             icon: <Gavel size={20} />,           label: 'Futures'    },
    { to: `/trade/${cryptoData[0]?.symbol || 'btc'}`, icon: <TrendingUp size={20} />,     label: 'Spot'       },
    { to: '/copy-trade',                              icon: <Copy size={20} />,            label: 'Copy Trade' },
    { to: '/square',                                  icon: <MessageSquare size={20} />,   label: 'Square'     },
    { to: '/invest',                                  icon: <PieChart size={20} />,        label: 'Invest'     },
    { to: '/trader-profile',                          icon: <Zap size={20} />,             label: 'Portfolio'  },
    { to: '/history',                                 icon: <History size={20} />,         label: 'History'    },
    { to: '/wallet',                                  icon: <Wallet size={20} />,          label: 'Wallet'     },
  ];

  const adminPages = [
    { to: '/admin',              icon: <ShieldCheck size={20} />, label: 'Admin'  },
    { to: '/admin/manage-plans', icon: <LayoutGrid  size={20} />, label: 'Plans'  },
  ];

  const allRoutes = (
    <Routes>
      <Route path="/"                    element={<Home />} />
      <Route path="/login"               element={<Login />} />
      <Route path="/register"            element={<Register />} />
      <Route path="/dashboard"           element={<Dashboard cryptoData={cryptoData} />} />
      <Route path="/market"              element={<Market />} />
      <Route path="/copy-trade"          element={<CopyTrade />} />
      <Route path="/square"              element={<Square />} />
      <Route path="/history"             element={<HistoryPage />} />
      <Route path="/futures"             element={<Navigate to="/futures/btc" replace />} />
      <Route path="/futures/:coinSymbol" element={<Futures />} />
      <Route path="/trade/:coinSymbol"   element={<Trade />} />
      <Route path="/deposit"             element={<Deposit />} />
      <Route path="/withdraw"            element={<Withdraw />} />
      <Route path="/wallet"              element={<WalletPage />} />
      <Route path="/invest"              element={<Investment />} />
      <Route path="/my-investments"      element={<MyInvestments />} />
      <Route path="/trader-profile"      element={<TraderProfile />} />
      <Route path="/profile"             element={<Profile />} />
      <Route path="/become-trader"       element={<BecomeTrader />} />
      <Route path="/admin"
        element={user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/dashboard" />} />
      <Route path="/admin/manage-plans"
        element={user?.role === 'admin' ? <ManagePlans /> : <Navigate to="/dashboard" />} />
    </Routes>
  );

  if (isFullPage) {
    return <div className="min-h-screen bg-[#0b0e11] text-white">{allRoutes}</div>;
  }

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white flex flex-col md:flex-row overflow-hidden font-sans">

      {/* ── Desktop Sidebar ── */}
      {token && !isHomePage && (
        <aside className="w-16 lg:w-60 bg-[#161a1e] border-r border-[#1e2329] hidden md:flex flex-col p-3 h-screen sticky top-0 z-40 flex-shrink-0">
          <div className="mb-6 px-2 py-2 text-xl font-black text-[#f0b90b] italic uppercase tracking-tighter hidden lg:block">
            VINANCE
          </div>
          <div className="mb-4 flex justify-center lg:hidden pt-2">
            <span className="text-[#f0b90b] font-black text-lg">V</span>
          </div>

          <nav className="space-y-1 flex-1 overflow-y-auto">
            {userPages.map(page => (
              <NavItem key={page.to} to={page.to} icon={page.icon} label={page.label} />
            ))}
          </nav>

          {user?.role === 'admin' && (
            <div className="pt-3 border-t border-gray-800 space-y-1 mb-3">
              <p className="text-[9px] font-black text-[#f0b90b] uppercase tracking-widest opacity-50 px-3 hidden lg:block">
                Admin
              </p>
              {adminPages.map(page => (
                <NavItem key={page.to} to={page.to} icon={page.icon} label={page.label} />
              ))}
            </div>
          )}

          <button onClick={logout}
            className="p-3 text-gray-500 hover:text-red-500 flex items-center gap-3 border-t border-gray-800 transition-colors mt-2">
            <LogOut size={18} />
            <span className="hidden lg:inline text-[10px] font-black uppercase">Sign Out</span>
          </button>
        </aside>
      )}

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {token && !isHomePage && (
          <header className="h-12 border-b border-[#1e2329] bg-[#161a1e] flex items-center justify-between px-4 sticky top-0 z-30 flex-shrink-0">
            <div className="font-black text-[9px] uppercase tracking-widest text-[#f0b90b]">
              Hi, {user?.name || 'User'} 👋
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 hidden sm:block">
                Balance:{' '}
                <span className="text-[#f0b90b] font-bold">
                  ${(user?.balance || 0).toFixed(2)}
                </span>
              </span>
              <NotificationSystem />
            </div>
          </header>
        )}

        <div className={`flex-1 overflow-y-auto ${token && !isHomePage ? 'pb-20 md:pb-4' : ''}`}>
          {allRoutes}
        </div>
      </main>

      {/* ── Mobile bottom nav ── */}
      {token && !isHomePage && (
        <>
          {/* Full menu overlay */}
          {showMoreMenu && (
            <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex flex-col overflow-y-auto">
              <div className="flex justify-between items-center px-6 py-5">
                <h2 className="text-[#f0b90b] font-black text-lg uppercase italic">Menu</h2>
                <button
                  onClick={() => setShowMoreMenu(false)}
                  className="bg-white/10 w-9 h-9 rounded-full text-gray-300 flex items-center justify-center hover:bg-white/20 transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-y-6 gap-x-3 px-6 pb-6">
                {userPages.map(page => (
                  <Link
                    key={page.to}
                    to={page.to}
                    onClick={() => setShowMoreMenu(false)}
                    className="flex flex-col items-center gap-2 text-gray-400 hover:text-white"
                  >
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/5 w-12 h-12 flex items-center justify-center">
                      {page.icon}
                    </div>
                    <span className="text-[9px] font-black uppercase text-center leading-tight">
                      {page.label}
                    </span>
                  </Link>
                ))}
              </div>

              {user?.role === 'admin' && (
                <div className="px-6 pb-6">
                  <p className="text-[#f0b90b] text-[9px] font-black uppercase tracking-widest mb-4 opacity-60">
                    Admin
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    {adminPages.map(page => (
                      <Link
                        key={page.to}
                        to={page.to}
                        onClick={() => setShowMoreMenu(false)}
                        className="flex flex-col items-center gap-2 text-yellow-500/80"
                      >
                        <div className="p-3 bg-yellow-500/5 rounded-2xl border border-yellow-500/10 w-12 h-12 flex items-center justify-center">
                          {page.icon}
                        </div>
                        <span className="text-[9px] font-black uppercase text-center">
                          {page.label}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="px-6 pb-8 mt-auto">
                <button
                  onClick={() => { logout(); setShowMoreMenu(false); }}
                  className="w-full flex items-center justify-center gap-2 text-red-500 font-black uppercase text-[10px] py-4 bg-red-500/5 rounded-2xl border border-red-500/10"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </div>
          )}

          {/* Bottom tab bar */}
          <nav className="fixed bottom-0 left-0 right-0 bg-[#161a1e]/95 backdrop-blur-md border-t border-gray-800 flex justify-around items-center py-2 md:hidden z-[80]">
            {[
              { to: '/dashboard',   icon: <LayoutDashboard size={21} />, label: 'Home'    },
              { to: '/market',      icon: <BarChart3 size={21} />,       label: 'Market'  },
              { to: '/futures/btc', icon: <Gavel size={21} />,           label: 'Futures' },
              { to: '/invest',      icon: <PieChart size={21} />,        label: 'Invest'  },
              { to: '/wallet',      icon: <Wallet size={21} />,          label: 'Wallet'  },
            ].map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 p-2 ${isActive ? 'text-[#f0b90b]' : 'text-gray-500'}`
                }
              >
                {item.icon}
                <span className="text-[8px] font-bold uppercase">{item.label}</span>
              </NavLink>
            ))}
            <button
              onClick={() => setShowMoreMenu(true)}
              className="flex flex-col items-center gap-0.5 p-2 text-gray-500 relative"
            >
              <LayoutGrid size={21} />
              <span className="text-[8px] font-bold uppercase">More</span>
              {user?.role === 'admin' && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#f0b90b] rounded-full animate-pulse" />
              )}
            </button>
          </nav>
        </>
      )}
    </div>
  );
};

/* ─── App Root ─── */
export default function App() {
  const [cryptoData, setCryptoData] = useState([
    { id: '1', symbol: 'btc', price: '0', change: '0', up: true },
    { id: '2', symbol: 'eth', price: '0', change: '0', up: true },
    { id: '3', symbol: 'sol', price: '0', change: '0', up: true },
    { id: '4', symbol: 'bnb', price: '0', change: '0', up: true },
  ]);

  const fetchPrices = async () => {
    try {
      const syms    = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT'];
      const results = await Promise.all(
        syms.map(s => axios.get(`https://api.binance.com/api/v3/ticker/24hr?symbol=${s}`))
      );
      setCryptoData(results.map((res, i) => ({
        id:     String(i + 1),
        name:   res.data.symbol.replace('USDT', ''),
        symbol: res.data.symbol.replace('USDT', '').toLowerCase(),
        price:  parseFloat(res.data.lastPrice).toLocaleString(undefined, { minimumFractionDigits: 2 }),
        change: parseFloat(res.data.priceChangePercent).toFixed(2),
        up:     parseFloat(res.data.priceChangePercent) > 0,
      })));
    } catch (_e) {}
  };

  useEffect(() => {
    fetchPrices();
    const iv = setInterval(fetchPrices, 15000);
    return () => clearInterval(iv);
  }, []);

  return (
    <UserProvider>
      <BrowserRouter>
        <AppContent cryptoData={cryptoData} />
      </BrowserRouter>
    </UserProvider>
  );
}
