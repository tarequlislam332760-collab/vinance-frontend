import React, { useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { 
  TrendingUp, BarChart3, ArrowUpRight, ArrowDownLeft, 
  Zap, Globe, Activity 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ cryptoData }) => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  return (
    <div className="p-4 md:p-8 bg-[#0b0e11] min-h-screen pb-24 md:pb-8 text-left">
      
      {/* ১. ওয়েলকাম এবং কুইক স্ট্যাটাস */}
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
          <button onClick={() => navigate('/deposit')} className="flex-1 md:flex-none bg-yellow-500 text-black px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-yellow-400 transition-all">
            Deposit
          </button>
          <button onClick={() => navigate('/withdraw')} className="flex-1 md:flex-none bg-white/5 border border-gray-800 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
            Withdraw
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ২. লাইভ মার্কেট ডাটা (Home Page-এ থাকবে) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#1e2329] border border-gray-800 rounded-[2.5rem] p-6 shadow-xl">
            <h3 className="text-white font-black uppercase text-xs mb-6 flex items-center gap-2 tracking-widest">
              <Activity size={16} className="text-yellow-500" /> Market Overview
            </h3>
            <div className="space-y-4">
              {cryptoData?.slice(0, 5).map((coin) => (
                <div key={coin.id} className="flex justify-between items-center p-3 hover:bg-white/[0.03] rounded-2xl transition-all cursor-pointer" onClick={() => navigate('/trade')}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center font-black text-[10px] text-yellow-500">
                      {coin.symbol}
                    </div>
                    <span className="font-bold text-sm text-white">{coin.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-sm text-white">${coin.price.toLocaleString()}</p>
                    <p className={`text-[10px] font-black ${coin.up ? 'text-emerald-500' : 'text-red-500'}`}>
                      {coin.up ? '+' : ''}{coin.change}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/market')} className="w-full mt-6 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest border-t border-gray-800 hover:text-yellow-500 transition-all">
              View Full Market
            </button>
          </div>
        </div>

        {/* ৩. ট্রেডিং চার্ট এবং কুইক ট্রেড অ্যাকশন */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#1e2329] border border-gray-800 rounded-[2.5rem] overflow-hidden h-[450px] shadow-2xl relative">
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

          {/* কুইক নেভিগেশন কার্ডস */}
          <div className="grid grid-cols-2 gap-4">
            <div onClick={() => navigate('/trade')} className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 p-6 rounded-[2rem] cursor-pointer hover:border-emerald-500/40 transition-all group">
               <TrendingUp className="text-emerald-500 mb-4 group-hover:scale-110 transition-transform" size={32} />
               <h4 className="text-white font-black uppercase text-xs tracking-widest">Start Trading</h4>
               <p className="text-gray-500 text-[9px] mt-1 font-bold">EXECUTE ORDERS NOW</p>
            </div>
            <div onClick={() => navigate('/market')} className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 p-6 rounded-[2rem] cursor-pointer hover:border-blue-500/40 transition-all group">
               <Globe className="text-blue-500 mb-4 group-hover:scale-110 transition-transform" size={32} />
               <h4 className="text-white font-black uppercase text-xs tracking-widest">Market Analysis</h4>
               <p className="text-gray-500 text-[9px] mt-1 font-bold">REAL-TIME DATA</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;