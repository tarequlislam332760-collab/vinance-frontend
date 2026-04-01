import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { 
  TrendingUp, BarChart3, ArrowUpRight, ArrowDownLeft, 
  Zap, Globe, Activity, History, RefreshCw 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = ({ cryptoData }) => {
  const { user, token, API_URL } = useContext(UserContext); // API_URL যোগ করা হয়েছে
  const navigate = useNavigate();
  
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return; 
      
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        // ডাইনামিক API_URL ব্যবহার করা হচ্ছে
        const userRes = await axios.get(`${API_URL}/api/profile`, config);
        setBalance(userRes.data.balance);

        const transRes = await axios.get(`${API_URL}/api/transactions`, config);
        setTransactions(Array.isArray(transRes.data) ? transRes.data : []);
      } catch (err) {
        console.error("Dashboard Data loading failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token, API_URL]);

  if (loading) return <div className="min-h-screen bg-[#0b0e11] flex items-center justify-center text-yellow-500 font-black tracking-widest uppercase">Loading Assets...</div>;

  return (
    <div className="p-4 md:p-8 bg-[#0b0e11] min-h-screen pb-24 md:pb-8 text-left">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
            Welcome, <span className="text-yellow-500">{user?.name || 'Trader'}</span>
          </h1>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">
            System Status: <span className="text-emerald-500">Operational</span>
          </p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={() => navigate('/deposit')} className="flex-1 md:flex-none bg-yellow-500 text-black px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/20">
            Deposit
          </button>
          <button onClick={() => navigate('/withdraw')} className="flex-1 md:flex-none bg-white/5 border border-gray-800 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
            Withdraw
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#1e2329] border border-gray-800 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                <TrendingUp size={80} />
            </div>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Estimated Balance</p>
            <h2 className="text-4xl font-black text-white tracking-tighter">${balance.toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
            <p className="text-emerald-500 text-[9px] font-bold mt-2 uppercase tracking-widest flex items-center gap-1">
              <ArrowUpRight size={10} /> Live Market Active
            </p>
          </div>

          <div className="bg-[#1e2329] border border-gray-800 rounded-[2.5rem] p-6 shadow-xl">
            <h3 className="text-white font-black uppercase text-xs mb-6 flex items-center gap-2 tracking-widest">
              <History size={16} className="text-yellow-500" /> Recent Activity
            </h3>
            <div className="space-y-4">
              {transactions && transactions.length > 0 ? (
                transactions.slice(0, 5).map((item) => (
                  <div key={item._id} className="flex justify-between items-center p-3 hover:bg-white/[0.03] rounded-2xl transition-all border border-transparent hover:border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${item.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                        {item.type === 'deposit' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                      </div>
                      <div>
                        <p className="font-bold text-xs text-white uppercase">{item.type}</p>
                        <p className="text-[9px] text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-sm text-white">${item.amount}</p>
                      <p className={`text-[9px] font-black uppercase ${item.status === 'completed' || item.status === 'approved' ? 'text-emerald-500' : 'text-yellow-500'}`}>
                        {item.status}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-10 text-gray-600 text-[10px] font-black uppercase tracking-widest">No Transactions Found</p>
              )}
            </div>
            {/* এখানে পাথটি /history তে ঠিক করা হয়েছে */}
            <button onClick={() => navigate('/history')} className="w-full mt-6 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest border-t border-gray-800 hover:text-yellow-500 transition-all">
              View All History
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#1e2329] border border-gray-800 rounded-[2.5rem] overflow-hidden h-[500px] shadow-2xl relative">
            <div className="absolute top-4 left-6 z-10 bg-[#0b0e11]/80 backdrop-blur-md px-4 py-2 rounded-xl border border-gray-800">
                <span className="text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                  <Zap size={14} className="text-yellow-500 animate-pulse" /> Live BTC/USDT Chart
                </span>
            </div>
            <iframe 
              title="TradingView" 
              src="https://s.tradingview.com/widgetembed/?symbol=BINANCE:BTCUSDT&theme=dark&style=1&locale=en" 
              style={{ width: '100%', height: '100%', border: 'none' }}
            ></iframe>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div onClick={() => navigate('/trade')} className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 p-6 rounded-[2rem] cursor-pointer hover:border-emerald-500/40 transition-all group">
               <TrendingUp className="text-emerald-500 mb-4 group-hover:scale-110 transition-transform" size={32} />
               <h4 className="text-white font-black uppercase text-xs tracking-widest">Trade Now</h4>
               <p className="text-gray-500 text-[9px] mt-1 font-bold">EXECUTE BINARY ORDERS</p>
            </div>
            <div onClick={() => navigate('/market')} className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 p-6 rounded-[2rem] cursor-pointer hover:border-blue-500/40 transition-all group">
               <Globe className="text-blue-500 mb-4 group-hover:scale-110 transition-transform" size={32} />
               <h4 className="text-white font-black uppercase text-xs tracking-widest">Market Watch</h4>
               <p className="text-gray-500 text-[9px] mt-1 font-bold">ANALYSIS & TRENDS</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;